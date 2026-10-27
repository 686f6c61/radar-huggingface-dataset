# lflare/Tess-4-27B-FP8

## Resumen

Tess-4-27B-FP8 es una cuantización en FP8 del modelo multimodal `migtissera/Tess-4-27B`, publicada por el usuario lflare. El checkpoint tiene 27.781.427.952 parámetros (unos 27,8 B) y se apoya en la arquitectura etiquetada como `qwen3_5`: un transformer híbrido que combina atención lineal tipo Gated-DeltaNet/SSM con 16 capas de atención completa de largo alcance, torre de visión y una cabeza MTP (multi-token prediction) para decodificación especulativa. La tarea declarada es image-text-to-text conversacional.

La particularidad de esta publicación es la variante `attnbf16`: todo el camino de self-attention se mantiene en bf16 y solo los MLP (~17 B de parámetros) se cuantizan a FP8 W8A8 con `compressed-tensors`. Según la model card, esto mantiene la cuantización lejos de la puerta multiplicativa de atención y de las capas de atención completa, a cambio de unos +1,5 GiB (~4,6 %) de peso frente a una build FP8 totalmente cuantizada. La desviación medida frente al padre en bf16 es de KLD ≈ 0,0078 nats por token.

Su relevancia práctica es doble: por un lado reduce el coste de servir un modelo de 27,8 B; por otro, corrige un fallo de carga en vLLM de las cabezas MTP en bf16 injertadas sobre cuantizaciones `compressed-tensors`, que provocaba 0 % de aceptación del draft. La build reporta un 75,2 % de aceptación MTP medida. El repo ocupa 69,9 GB y la licencia es Apache 2.0, aunque la adopción comunitaria es todavía muy baja (23 descargas, 1 like).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido: atención lineal (Gated-DeltaNet/SSM) + 16 capas de atención completa; torre de visión; cabeza MTP |
| Parametros totales | 27.781.427.952 (~27,8 B) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8 W8A8 (`FP8_DYNAMIC`) vía `compressed-tensors`, aplicada solo a los MLP (~17 B); `lm_head`, cabeza MTP, torre de visión, bloque `linear_attn` y todo `self_attn` en bf16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (esquema `compressed-tensors` FP8) |

## Arquitectura y entrenamiento

El modelo base sigue un diseño híbrido poco habitual: capas de atención lineal con estado recurrente (bloque `linear_attn`, Gated-DeltaNet/SSM) intercaladas con 16 capas de atención completa de largo alcance, más una torre de visión para entrada de imagen. Sobre Qwen3.5/3.6, la puerta de salida de atención aparece fusionada en `q_proj`, un detalle que la receta de cuantización respeta explícitamente para no degradar la señal. Incluye además una cabeza MTP que actúa como draft model interno para decodificación especulativa sin modelo auxiliar.

La model card no documenta el corpus de entrenamiento, el número de tokens ni si hubo RLHF/DPO; esa información no está disponible. Lo que sí se detalla es el proceso de cuantización: receta `recipe.yaml` con `FP8_DYNAMIC` W8A8 sobre los MLP, exclusión explícita de `lm_head`, cabeza MTP, torre de visión, `linear_attn` y `self_attn` mediante `quantization_config.ignore`, y una evaluación de degradación (KLD ≈ 0,0078 nats por token) calculada sobre `neuralmagic/calibration` con 8 muestras y secuencia de 1024 tokens. Es una medición deliberadamente ligera, útil como indicador pero no como evaluación exhaustiva de calidad.

## Capacidades

- Generación de texto conversacional multi-turno (`pipeline_tag: image-text-to-text`, tag `conversational`).
- Entrada multimodal de imagen y texto mediante torre de visión dedicada, mantenida en bf16.
- Decodificación especulativa autocontenida gracias a la cabeza MTP, con 75,2 % de aceptación medida en vLLM 0.26.0 sobre Blackwell en modo greedy con 3 tokens especulativos.
- Razonamiento de largo alcance gracias a las 16 capas de atención completa que conviven con el bloque lineal.
- Soporte de tool calling / function calling: no confirmado en la información disponible.
- Soporte de agentes y multi-step reasoning: no confirmado en la información disponible.
- Capacidades multilingües: no disponible; la model card no declara idiomas.
- Modo thinking, audio u otras capacidades especiales: no disponibles en la información proporcionada.

## Casos de uso

- Asistentes multimodales de atención al cliente: el modelo acepta imagen y texto en la misma conversación, lo que permite adjuntar capturas de pantalla, facturas o productos y resolver la consulta en un único turno sin pipeline OCR separado.
- Servicio de inferencia de alto rendimiento en producción: al ser una build FP8 con decodificación especulativa MTP integrada, se puede desplegar en vLLM con `--speculative-config '{"method":"mtp","num_speculative_tokens":3}'` para reducir la latencia por token sin añadir un draft model externo.
- Sustitución de un despliegue bf16 de 27,8 B por una versión de menor huella: el coste medido es KLD ≈ 0,0078 nats, por lo que es razonable para tareas de generación abierta donde una degradación mínima es aceptable a cambio de menos VRAM y más throughput.
- Documentación técnica asistida por imagen: diagramas de arquitectura, esquemas eléctricos o capturas de paneles de monitorización pueden enviarse como imagen y convertirse en explicaciones textuales o en incidencias redactadas.
- Analítica de contenido visual en pipelines internos: clasificación y descripción de imágenes con salida conversacional estructurada, integrável en un servicio HTTP servido con vLLM.
- Investigación sobre cuantización y decodificación especulativa: el repo publica receta (`recipe.yaml`) y métricas de KLD (`kld_tess_attnbf16.json`), lo que lo convierte en un caso de referencia para estudiar el impacto de mantener la atención en bf16 frente a cuantizarla.
- Evaluación comparativa de modelos híbridos SSM/atención: permite medir cómo se comporta una arquitectura de atención lineal con estado recurrente bajo cuantización parcial, especialmente por la restricción documentada de caché Mamba.

## Benchmarks y rendimiento

| Metrica | Resultado | Condiciones |
|---|---|---|
| KLD vs padre bf16 | ≈ 0,0078 nats (por token) | `neuralmagic/calibration`, 8 muestras, seq 1024 (`kld_tess_attnbf16.json`) |
| Aceptación MTP (speculative decoding) | 75,2 % | vLLM 0.26.0, GPU Blackwell, greedy, `num_speculative_tokens: 3` |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, MMMU u otros) en la información disponible. No se han publicado cifras de throughput ni de latencia absoluta.

## Requisitos de hardware

- Pesos estimados: ~17 GB para los MLP en FP8 más ~21,6 GB para los ~10,8 B de parámetros en bf16, es decir, del orden de 38-39 GB de pesos en VRAM. El repositorio completo ocupa 69,9 GB en disco.
- GPU recomendadas: A100 80 GB o H100 80 GB en una sola tarjeta; también 2× L40S 48 GB o 2× A6000 48 GB con tensor parallel, aunque el margen para caché KV y caché Mamba es ajustado en 48 GB.
- GPU de consumo: no cabe entero en una RTX 4090 (24 GB) ni en una RTX 5090 (32 GB). Requiere al menos ~40 GB de VRAM solo para pesos.
- La decodificación especulativa MTP se midió en hardware Blackwell; no hay datos publicados sobre arquitecturas anteriores.
- Despliegue: vLLM 0.26.0 o superior con soporte de `compressed-tensors` FP8 y `--speculative-config` con `method: mtp`. Es imprescindible fijar `--max-num-seqs 32` o menos, porque el modelo es de atención lineal híbrida y la caché Mamba agota bloques con el valor por defecto de `max_num_seqs`.
- llama.cpp, Ollama y TGI: no documentados para este checkpoint; el formato `compressed-tensors` FP8 con cabeza MTP en bf16 no es un caso de uso soportado de forma estándar en esos runtimes.
- Latencia y throughput: no disponibles. La aceptación MTP del 75,2 % con 3 tokens especulativos sugiere una mejora apreciable en decodificación, pero no se publica ningún factor de speedup medido.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| lflare/Tess-4-27B-FP8 | ~27,8 B | no disponible | FP8 W8A8 solo en MLP, atención en bf16 | Apache 2.0 | Build con MTP funcional y KLD ≈ 0,0078 |
| migtissera/Tess-4-27B (padre) | ~27,8 B | no disponible | bf16 | Apache 2.0 | Referencia de calidad; sin ganancia de cuantización |
| Build FP8 totalmente cuantizada del mismo base | ~27,8 B | no disponible | FP8 W8A8 en todo el modelo | Apache 2.0 | ~1,5 GiB más pequeña, pero KLD peor según la model card; riesgo de 0 % de aceptación MTP si se injerta cabeza bf16 |
| migtissera/Tess-4.5-27B | ~28 B (según listado de HF) | no disponible | no disponible | no disponible | Versión posterior de la familia; sin datos comparativos publicados |
| Qwen3.8-27B (FP8, Apache 2.0) | 27 B (según resultados de búsqueda) | no disponible | FP8 | Apache 2.0 | Referencia de la misma escala; sin datos de benchmark verificados en esta información |

## Limitaciones y advertencias

- La evaluación de degradación se hace con 8 muestras y secuencia de 1024 tokens: es una señal de KLD, no una validación de calidad en tareas largas o multimodales.
- La ventana de contexto real no se declara en la model card; planificar despliegues asumiendo contexto largo es arriesgado sin verificación previa.
- Idiomas soportados no declarados: no hay garantía documentada de calidad en castellano ni en otros idiomas distintos del inglés.
- Requiere hardware con soporte FP8 (Hopper, Ada o Blackwell). En GPUs sin FP8 nativo la build no es utilizable tal cual.
- El valor por defecto de `max_num_seqs` en vLLM provoca agotamiento de bloques de caché Mamba; hay que bajarlo explícitamente a 32 o menos.
- Solo se cuantizan los MLP: la huella (~38-39 GB de pesos) sigue siendo alta para GPUs de consumo, a diferencia de lo que sugeriría la etiqueta "FP8".
- Riesgo de alucinación: inherente al modelo base; no se documentan evaluaciones de factualidad ni de sesgo.
- Sesgos conocidos: no disponibles; la model card no incluye ninguna sección de sesgos, evaluación de seguridad ni red teaming.
- Uso comercial: permitido por Apache 2.0, pero conviene revisar la licencia del modelo base y de los datos de entrenamiento originales, no documentados aquí.
- Adopción muy baja (23 descargas, 1 like): no hay validación independiente de la build ni informes de terceros sobre su comportamiento en producción.
- La corrección del fallo de carga de la cabeza MTP es específica de vLLM 0.26.0; versiones anteriores o posteriores pueden requerir ajustes.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/lflare/Tess-4-27B-FP8
- Modelo base: https://huggingface.co/migtissera/Tess-4-27B
- Receta de cuantización: https://huggingface.co/lflare/Tess-4-27B-FP8/blob/main/recipe.yaml
- Métricas de KLD: https://huggingface.co/lflare/Tess-4-27B-FP8/blob/main/kld_tess_attnbf16.json
- Dataset de calibración: https://huggingface.co/datasets/neuralmagic/calibration
- Familia Tess-4.5-27B (contexto): https://huggingface.co/migtissera/Tess-4.5-27B
- Listado de modelos Qwen3.x en HuggingFace (contexto): https://huggingface.co/models?other=qwen3.8
- Artículo sobre Qwen3.8-27B FP8 en local (contexto, no específico de este modelo): https://www.developersdigest.tech/blog/qwen-3-8-27b-local-agentic-coding-2026
