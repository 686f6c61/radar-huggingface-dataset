# jackf857/neu-l3-ultra-lscx-hypo-s42-20261115-a1

## Resumen

`neu-l3-ultra-lscx-hypo-s42-20261115-a1` es un checkpoint de investigación de optimización de preferencias construido sobre Llama 3 8B, publicado por el usuario jackf857 (entorno Northeastern Explorer, prefijo NEU). No es un modelo entrenado desde cero: parte del checkpoint SFT `W-61/llama-3-8b-base-sft-ultrachat-8xh200` y aplica una receta propietaria denominada Hybrid-DPO (HyPO) combinada con un controlador escalar de beta en lazo cerrado (LSC, "log-scaled control"). El resultado es un modelo de 8.030.261.248 parámetros en formato safetensors, con arquitectura LlamaForCausalLM de 32 capas y licencia Llama 3.

El interés del artefacto es metodológico más que de producto: documenta con inusual detalle la configuración exacta de un experimento de DPO híbrido (márgenes, clipping, política de beta, semillas, hashes de configuración y del paquete de entrenamiento), lo que facilita la reproducibilidad y la comparación entre variantes. Sin embargo, el propio autor declara que no se realizó evaluación durante el entrenamiento ni se reclama ninguna puntuación de benchmark, y que se trata de un checkpoint de investigación de un único seed.

Por tanto, debe tratarse como material para estudiar dinámicas de optimización de preferencias, no como un modelo listo para producción. La model card no incluye resultados de generación, evaluación held-out ni comparativas de calidad, y la licencia Llama 3 impone restricciones adicionales al uso comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LlamaForCausalLM (transformer decoder-only, 32 capas) |
| Parámetros totales | 8.030.261.248 |
| Parámetros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 2048 tokens máximos de secuencia en entrenamiento (prompt máximo 1800); contexto nativo de Llama 3 8B no declarado en la model card |
| Tipos de cuantización | no disponible (los tensores se publican sin cuantizar, en el dtype serializado de la config: float32) |
| Idiomas soportados | no disponible (la model card no declara idiomas; hereda los del checkpoint SFT base, no especificados) |
| Licencia | llama3 (Llama 3 Community License) |
| Formato de pesos | safetensors (librería transformers; repo de 32,1 GB) |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only estándar de Llama 3 con 32 capas, inicializado desde el checkpoint SFT `W-61/llama-3-8b-base-sft-ultrachat-8xh200` (revisión `3e76fb18e464425d6e89fdcc025cd6b701c90e1a`), que también se congela como referencia. El ajuste se realiza sobre `HuggingFaceH4/ultrafeedback_binarized` (split `train_prefs`, revisión `3949bf5f8c17c394422ccfab0c31ea9c20bdeb85`), con 61.135 pares de preferencia disponibles. El entrenamiento se ejecutó en 4 GPUs NVIDIA H200 con precisión bfloat16 y atención SDPA, optimizador AdamW (learning rate 5e-7, schedule coseno con warmup 0.1, weight decay 0.0, grad clipping 1.0), batch efectivo de 128 pares (4 por GPU × 4 GPUs × 8 de acumulación) y 477 pasos completados (época registrada 0.99895). El runtime reportado es de 7722,0012 segundos y la pérdida de entrenamiento final registrada es 7,848586966156709.

La innovación técnica reside en la receta de optimización, no en la arquitectura. Hybrid-DPO modifica el margen de referencia mediante su mecanismo de clipping, con los parámetros `im_enable=True`, `im_gamma=0.0` e `im_tau=0.1`. Sobre esa base, LSC aporta el escalar beta en modo `closed_loop_lsc`, usando como señal la entrada cruda del margen DPO (`lsc_signal: dpo_margin`) y el partner `hybrid_dpo`. Los hiperparámetros del controlador son beta inicial 0.01, `tau_start=0.45`, `z_star=0.4`, `eta=0.1` y 3816 actualizaciones totales de la política de beta. La evaluación durante el entrenamiento está desactivada y no se reporta ninguna puntuación de benchmark. Los checkpoints retenidos son [400, 477], guardando cada 100 pasos con límite de retención 2; los snapshots son solo de modelo (sin estado de optimizador, scheduler ni RNG), por lo que no permiten reanudar el entrenamiento de forma exacta.

## Capacidades

- Generación de texto conversacional: el modelo es un `text-generation` con formato de diálogo heredado del SFT base sobre UltraChat.
- Optimización de preferencias: el checkpoint está ajustado con pares chosen/rejected, por lo que su comportamiento esperado es el de un asistente alineado por preferencias, aunque no se aportan métricas que lo confirmen.
- Razonamiento y matemáticas: no hay evidencia declarada en la model card; se asume la herencia del Llama 3 8B base, sin verificación.
- Código: no hay evidencia declarada ni benchmarks de HumanEval o similares.
- Tool calling / function calling: no disponible; no se menciona soporte en la model card.
- Agentes y razonamiento multi-paso: no disponible; no se declara soporte.
- Capacidades multilingües: no disponible; la model card no enumera idiomas.
- Capacidades especiales (thinking mode, visión, audio): no disponible; el modelo es solo texto.
- Compatibilidad de despliegue: etiquetado con `text-generation-inference` y `endpoints_compatible`, lo que indica que puede servirse con TGI y en Inference Endpoints.

## Casos de uso

- Investigación en optimización de preferencias: el checkpoint sirve para reproducir y comparar la receta Hybrid-DPO + LSC frente a DPO estándar, dado que la model card documenta hiperparámetros, semillas, hashes de configuración y del paquete de entrenamiento, además de las trayectorias de margen y optimizador archivadas en `training_logs/`.
- Análisis de dinámicas de beta en lazo cerrado: los logs permiten estudiar cómo evoluciona el escalar beta a lo largo de las 3816 actualizaciones y correlacionarlo con el margen DPO, útil para quienes diseñan controladores adaptativos de regularización.
- Estudio de estabilidad de DPO híbrido: con 477 pasos y una pérdida final registrada de 7,8486, el artefacto permite analizar regímenes de entrenamiento cortos y su efecto en el comportamiento generativo, siempre con evaluación externa.
- Comparación de checkpoints intermedios: al conservarse los pasos 400 y 477, se puede medir la deriva entre ambos y evaluar si el ajuste adicional aporta o degrada calidad en un conjunto held-out propio.
- Base para experimentos de alineación posteriores: al ser un modelo de 8B en safetensors y compatible con transformers 4.51.0, se puede reutilizar como punto de partida en pipelines de alignment-handbook para nuevas rondas de preferencias.
- Servicio de inferencia de bajo coste en investigación: con 8B parámetros y TGI, cabe en una GPU de 24 GB en cuantización de 8 bits o en una A100 40 GB en bf16, lo que permite desplegarlo como endpoint interno para pruebas cualitativas.
- Docencia y auditoría de recetas: la trazabilidad completa (SHA-256 del paquete y de la config, commit del código de entrenamiento) lo convierte en un ejemplo didáctico de entrenamiento reproducible con registro riguroso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El `model-index` de la model card contiene una entrada con la lista de resultados vacía, y el autor indica explícitamente que no se realizó evaluación durante el entrenamiento ni se reclama ninguna puntuación de calidad. La pérdida de entrenamiento reportada (7,848586966156709) no es una métrica de calidad downstream y no debe interpretarse como tal.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 16 GB solo para pesos (8,03B × 2 bytes), más overhead de activaciones y KV cache; en la práctica, 20-24 GB para secuencias de 2K tokens.
- VRAM estimada en float32 (dtype serializado en la config): aproximadamente 32 GB solo para pesos, más overhead; requiere GPU de 40 GB o superior.
- VRAM estimada en cuantización de 8 bits: aproximadamente 8-10 GB de pesos, con un total práctico de 12-16 GB.
- VRAM estimada en cuantización de 4 bits: aproximadamente 4-6 GB de pesos, con un total práctico de 8-12 GB.
- GPU recomendadas: NVIDIA H200 (la usada en entrenamiento), A100 40/80 GB, H100; para inferencia cómoda en bf16, A100 40 GB o RTX 4090 24 GB con secuencias cortas.
- Cabe en GPU de consumo: sí, en RTX 4090 24 GB en bf16 con contexto limitado, y en RTX 3090 24 GB o RTX 4080 16 GB si se cuantiza a 8 o 4 bits.
- Opciones de despliegue: transformers (versión de referencia 4.51.0), Text Generation Inference (etiqueta `text-generation-inference`), Inference Endpoints (etiqueta `endpoints_compatible`). Para llama.cpp, Ollama o vLLM sería necesario convertir los pesos a GGUF o verificar compatibilidad, ya que el repo solo publica safetensors sin cuantizar.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Naturaleza | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `neu-l3-ultra-lscx-hypo-s42-20261115-a1` | 8,03B | 2048 en entrenamiento | Checkpoint de investigación DPO híbrido, sin benchmarks | llama3 | Hugging Face, 0 descargas |
| `W-61/llama-3-8b-base-sft-ultrachat-8xh200` (base) | ~8B | no disponible | SFT sobre UltraChat, punto de partida del ajuste | no disponible | Hugging Face |
| Llama 3 8B Instruct (Meta) | 8,03B | 8192 | Modelo alineado con benchmarks públicos | llama3 | Hugging Face, ampliamente distribuido |
| Zephyr-7B-beta (HuggingFaceH4) | 7,24B | 32768 | DPO sobre Mistral, con benchmarks publicados | MIT | Hugging Face |

La comparación relevante es frente a Llama 3 8B Instruct, del que este checkpoint hereda arquitectura y tokenizador pero no el proceso de alineación ni la evaluación; y frente a Zephyr-7B-beta, que también usa UltraFeedback pero publica métricas y tiene licencia permisiva. La diferencia clave no es de rendimiento (no medido aquí) sino de propósito: este artefacto prioriza la trazabilidad experimental sobre la calidad demostrada.

## Limitaciones y advertencias

- Ausencia total de evaluación: no hay benchmarks, ni evaluación held-out, ni comparación con la referencia congelada; el autor lo declara explícitamente.
- Un único seed (42): no se establece robustez ni varianza entre ejecuciones.
- Checkpoint de investigación: el propio autor indica que no debe usarse como base para producción ni asumir calidad downstream.
- Snapshots solo de modelo: los checkpoints guardados omiten estado de optimizador, scheduler y RNG, por lo que no son reanudables de forma exacta.
- Dtype inconsistente: los tensores se serializan en float32 según la config, mientras el entrenamiento fue en bfloat16; conviene convertir antes de desplegar para evitar consumo de memoria innecesario.
- Contexto corto en entrenamiento (2048 tokens, prompt máximo 1800): las secuencias largas no están cubiertas por el ajuste y el comportamiento más allá de ese límite es incierto.
- Idiomas no declarados: no se especifica cobertura multilingüe; el comportamiento fuera del inglés (idioma dominante de UltraFeedback) no está garantizado.
- Riesgo de alucinación: no cuantificado; al no haber evaluación, no se puede acotar.
- Sesgos: no documentados; hereda los del checkpoint SFT y del dataset UltraFeedback, sin análisis específico.
- Licencia Llama 3: impone restricciones (incluida la política de uso aceptable de Meta) y obligaciones de atribución; el uso comercial está sujeto a los términos de la Llama 3 Community License y a la cláusula de escala de usuarios.
- Trazabilidad parcial: la paridad con entornos distintos (por ejemplo, B200) no se reclama; los receipts de subida, no la model card, establecen la completitud del archivo.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, sin señales de validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jackf857/neu-l3-ultra-lscx-hypo-s42-20261115-a1
- Modelo base SFT: https://huggingface.co/W-61/llama-3-8b-base-sft-ultrachat-8xh200
- Dataset de preferencias: https://huggingface.co/datasets/HuggingFaceH4/ultrafeedback_binarized
- Logs de entrenamiento (dentro del repo): `training_logs/run/run.json`, `training_logs/run/training_config.yaml`, `training_logs/run/generated-model-card-original.md`
- Framework alignment-handbook (referenciado en las etiquetas): https://github.com/huggingface/alignment-handbook
- Llama 3 (Meta) y licencia: https://llama.meta.com/llama3/license/
- No se han encontrado papers, blogs ni demos adicionales en la información proporcionada.
