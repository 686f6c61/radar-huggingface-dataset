# galwert/AnchorRep-Llama-3-8B-Instruct

## Resumen

AnchorRep-Llama-3-8B-Instruct es un adaptador LoRA de defensa para meta-llama/Meta-Llama-3-8B-Instruct, desarrollado por Gal Wertheizer y colaboradores (Wertheizer, Himelstein, Peretz, Mendelson) como artefacto complementario del artículo AnchorRep, presentado en NeurIPS 2026. No es un modelo base nuevo: es un delta de pesos LoRA (rango 32, alpha 64) que se aplica sobre el modelo original sin modificar para obtener una versión endurecida frente a ataques de jailbreak.

El problema que aborda es la transferencia adversarial entre modelos: sufijos GCG optimizados contra un modelo surrogate suelen trasladarse a otros modelos de pesos abiertos. AnchorRep entrena el adaptador contra un ancla congelada (microsoft/Phi-3-medium-4k-instruct) mediante repulsión de representaciones (CKA repulsion), de modo que las activaciones internas del modelo defendido se alejan de las del ancla en las capas medias ante prompts dañinos, reduciendo la tasa de éxito de la transferencia.

Es relevante ahora porque la mayoría de defensas publicadas se evalúan solo contra ataques del mismo modelo, mientras que AnchorRep reporta métricas específicas de transferencia cross-model (ASR del 1% self, 2% anchor y 0% other) con una degradación mínima en capacidades benignas (Δ MT-Bench +0.18, Benign Garble Rate 0% en OR-Bench). Su utilidad es de investigación en seguridad, no de despliegue en producción sin validación independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder Llama-3-8B-Instruct |
| Parametros totales | no disponible (el delta LoRA se define por rango 32 / alpha 64; el recuento exacto no se publica) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 8192 tokens (heredada de Meta-Llama-3-8B-Instruct) |
| Tipos de cuantizacion | no disponible (entrenado en fp32; el adaptador se puede fusionar y cuantizar posteriormente, pero no se documentan recetas) |
| Idiomas soportados | evaluado en inglés, español y chino; otros idiomas sin probar |
| Licencia | llama3 (Meta Llama 3 Community License); el delta LoRA queda sujeta a la licencia del modelo base; la model card y metadatos bajo CC BY 4.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA), ~0.3 GB de repositorio |

## Arquitectura y entrenamiento

El adaptador se inserta en los módulos q_proj, k_proj, v_proj, o_proj, up_proj, down_proj y gate_proj de la capa media (50% de profundidad) del transformer Llama-3-8B-Instruct, con rango 32, alpha 64 y precisión fp32. El entrenamiento consta de 200 pasos con semilla 42 y combina cinco términos de pérdida ponderados: proyección en la dirección de rechazo (α=0.15), preservación de salidas benignas (β=1.0), repulsión CKA respecto al ancla Phi-3-medium-4k (γ=2.0), preservación de siguiente token (δ=0.0, desactivado) y preservación KL sobre prompts benignos (ε=0.4).

La innovación técnica es el uso de CKA (Centered Kernel Alignment) como medida de similitud de representaciones entre el modelo defendido y un ancla congelada, aplicada solo a prompts dañinos (CKA scope = harmful_only). Esto contrasta con defensas de representación clásicas que solo empujan una dirección de rechazo dentro del propio modelo, y ataca directamente el mecanismo que hace posible la transferencia cross-model. El adaptador se puede fusionar con los pesos base mediante merge_and_unload para obtener un modelo único desplegable.

## Capacidades

- Generación de texto conversacional y razonamiento general, heredados íntegros del base Llama-3-8B-Instruct.
- Resistencia a ataques de jailbreak por transferencia cross-model: ASR reportado de 1% (self), 2% (anchor) y 0% (other) ante sufijos GCG.
- Preservación de comportamiento benigno: Benign Garble Rate de 0% en OR-Bench y Δ MT-Bench de +0.18.
- Ajuste fino de la tasa de rechazo: Δ XSTest refusal de -2.4 (menos rechazos excesivos) y Δ OR-Bench refusal de +1.9 (más rechazos ante prompts dañinos).
- Soporte de tool calling y function calling: heredado del base, aunque no se documenta evaluación específica tras aplicar el adaptador.
- Capacidades multilingües: evaluadas en inglés, español y chino en el artículo; el resto de idiomas no se ha probado.
- No incorpora visión, audio ni modo thinking explícito.

## Casos de uso

- Investigación en robustez adversarial: aplicar el adaptador sobre el base para medir la transferencia de sufijos GCG entre modelos surrogate y el modelo defendido, usando el repositorio companion con los sufijos y los logs de auditoría.
- Evaluación comparativa de defensas: usar AnchorRep como baseline endurecido frente a otras técnicas (circuit breakers, representation engineering, safety fine-tuning) en un mismo protocolo de ataque.
- Hardening de un asistente interno de pesos abiertos: fusionar el adaptador en los pesos y desplegar el modelo resultante en entornos donde el riesgo principal es la transferencia de prompts maliciosos publicados contra otros modelos de la misma familia.
- Auditoría de pipelines de seguridad: integrar el modelo endurecido en un banco de pruebas que verifique si nuevos ataques (TAP, Embedding PGD, GCG) siguen funcionando, documentando las limitaciones conocidas del adaptador.
- Estudio de preservación de capacidades: comparar MT-Bench, XSTest y OR-Bench antes y después de aplicar el delta para cuantificar el coste de la defensa en calidad conversacional y tasa de rechazo.
- Formación y docencia en seguridad de LLM: emplear el par base/adaptador como ejemplo reproducible de defensa por repulsión de representaciones con hiperparámetros y configuración de entrenamiento publicados.
- Análisis multilingüe de seguridad: replicar la evaluación en inglés, español y chino para estudiar si la defensa se mantiene estable fuera del inglés.

## Benchmarks y rendimiento

| Metrica | Valor reportado |
|---|---|
| Cross-model GCG transfer ASR (self) | 1% |
| Cross-model GCG transfer ASR (anchor) | 2% |
| Cross-model GCG transfer ASR (other) | 0% |
| Benign Garble Rate (OR-Bench) | 0% |
| Δ XSTest refusal | -2.4 |
| Δ OR-Bench refusal | +1.9 |
| Δ MT-Bench | +0.18 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. Las cifras de ASR corresponden a verificación manual según el protocolo del artículo.

## Requisitos de hardware

- VRAM estimada para inferencia: ~16 GB en fp16 para el modelo fusionado de 8B; ~8-10 GB en cuantización de 8 bits; ~5-6 GB en 4 bits (estimación estándar para Llama-3-8B, no publicada por el autor).
- GPU recomendadas: A100 40/80 GB o H100 para evaluación a gran escala con lotes grandes; RTX 4090 (24 GB) o RTX 3090 (24 GB) suficientes para inferencia en fp16 con contexto moderado.
- Cabe en GPU de consumo: sí, en RTX 4090, RTX 3090, RTX 4080 (16 GB, justo en fp16) y GPUs de 12 GB con cuantización 4/8 bits.
- Opciones de despliegue: transformers + PEFT para cargar el adaptador; tras merge_and_unload, el modelo fusionado es compatible con vLLM, TGI, llama.cpp y Ollama (previa conversión a GGUF). No se documentan recetas oficiales para estos backends.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AnchorRep-Llama-3-8B-Instruct | LoRA sobre 8B | 8192 | Defensa por repulsión CKA contra ancla Phi-3-medium | llama3 | Hugging Face (12 descargas) |
| Meta-Llama-3-8B-Instruct (base) | 8B | 8192 | Sin defensa específica | llama3 | Hugging Face, ampliamente desplegado |
| Llama Guard 3 (8B) | 8B | 8192 (aprox.) | Clasificador de seguridad como modelo separado | llama3 | Hugging Face |
| Circuit breakers (representación) | según base | según base | Intervención en representaciones internas | según base | Artefactos de investigación |

La comparación directa con Llama Guard 3 no es equivalente: Llama Guard actúa como clasificador externo, mientras que AnchorRep modifica el propio modelo. No se dispone de cifras públicas de ASR cross-model para las alternativas en la información proporcionada.

## Limitaciones y advertencias

- No bloquea ataques adaptativos en el espacio de embeddings del mismo modelo, como Embedding PGD.
- TAP (reformulación semántica) evade parcialmente la defensa en este modelo.
- Diseño de ancla única: un adversario que optimice conjuntamente contra varios surrogates podría eludir parcialmente la defensa.
- Robustez multilingüe evaluada solo en inglés, español y chino; otros idiomas quedan sin probar.
- No apto para producción sin validación independiente de seguridad, según indica el propio autor.
- Riesgo de alucinación y sesgos: heredados del base Llama-3-8B-Instruct; no se documentan mitigaciones adicionales.
- Restricciones de licencia: el delta está sujeto a la Meta Llama 3 Community License, que incluye cláusulas de uso aceptable y obligaciones de atribución; el uso comercial requiere revisar dicha licencia.
- El repositorio tiene 12 descargas y 0 likes en el momento de la ficha; no hay evidencia de adopción externa ni validación por terceros.
- El adaptador se entrenó en fp32; no se documentan recetas de cuantización ni garantías de que la defensa se preserve tras cuantizar.

## Enlaces

- Hugging Face: https://huggingface.co/galwert/AnchorRep-Llama-3-8B-Instruct
- Repositorio companion (entrenamiento, evaluación, logs, sufijos GCG): https://github.com/galwert/AnchorRep
- Modelo base: https://huggingface.co/meta-llama/Meta-Llama-3-8B-Instruct
- Modelo ancla: https://huggingface.co/microsoft/Phi-3-medium-4k-instruct
- Artículo: AnchorRep: Defending LLMs Against Cross-Model Adversarial Transfer via Representation Repulsion (NeurIPS 2026); enlace directo no disponible en la información proporcionada.
