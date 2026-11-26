# frankmorales2020/GLM-4-32B-0414-topo-triton-Q8_0-GGUF

## Resumen
Este repositorio contiene una cuantización GGUF de 8 bits (`Q8_0`) del modelo `zai-org/GLM-4-32B-0414`, un transformer denso de 32.566.081.536 parámetros desarrollado originalmente por Zhipu AI (zai-org). La versión publicada por Frank Morales Aguilera (Sovereign Machine Laboratory, SOMALA) aplica un ajuste fino adicional con una técnica propietaria denominada Topological Continual Backpropagation (Topo-CBP) y un optimizador Triton fusionado llamado `TopoAdamW`, con anclaje de coordenadas primas `[2, 3, 5, 7, 11, 13]` y auditoría de integridad SHA-256.

El objetivo declarado es ofrecer un artefacto determinista y verificable para inferencia en llama.cpp y Ollama, orientado a entornos de edge AI y sistemas de control donde la reproducibilidad bit a bit es un requisito. El autor documenta que la salida es idéntica entre ejecuciones con `temperature=0.0`, `top_k=1`, `top_p=1.0` y `seed=123`, algo poco habitual en modelos generativos de este tamaño.

La relevancia actual del artefacto es doble: por un lado, empaqueta un modelo denso de 32B en un único fichero GGUF de 32,24 GiB apto para despliegue local; por otro, introduce una capa de trazabilidad criptográfica (digest base `d6b0458680af9d90`) que permite auditar que los pesos no han derivado durante el ajuste. No obstante, el ajuste fino se realizó sobre un dataset pequeño (Alpaca cleaned, 12.500 ejemplos) y con `max_seq_len=512`, lo que limita el alcance real del entrenamiento adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (GLM-4-32B-0414), sin MoE |
| Parametros totales | 32.566.081.536 |
| Parametros activos | no disponible (modelo denso) |
| Longitud de contexto | 2.048 tokens en los ejemplos de la model card (no se documenta el máximo nativo del base) |
| Tipos de cuantizacion | Q8_0 (8 bits); pipeline previo F16 |
| Idiomas soportados | no disponible |
| Licencia | other (heredada del modelo base; consultar términos de zai-org/GLM-4-32B-0414) |
| Formato de pesos | GGUF (fichero `GLM-4-32B-0414-topo-triton-Q8_0.gguf`, 32,24 GiB) |

## Arquitectura y entrenamiento
La arquitectura subyacente es la de GLM-4-32B-0414, un transformer denso de 32B parámetros de Zhipu AI. Sobre ese checkpoint en `bfloat16` se aplicó un ajuste fino con cuantización 4-bit NF4 (double quantization, compute en `bfloat16`), entrenando únicamente `lm_head` y capas `norm` (932.640.768 parámetros entrenables). El optimizador fue `TopoAdamW` con kernel Triton fusionado, `lr=1e-4` con decaimiento coseno y warmup, `weight_decay=1e-2` y `max_grad_norm=1.0`, durante 3 épocas con `batch_size=2` y `grad_accum=16` sobre `yahma/alpaca-cleaned` (12.500 ejemplos de entrenamiento, 500 de evaluación, `max_seq_len=512`, `seed=123`).

La innovación técnica declarada es el anclaje de coordenadas primas y la verificación de deriva: tras el entrenamiento, 247 tensores coincidentes se superponen sobre el base `bfloat16` y se comprueba que el digest SHA-256 del ancla (`d6b0458680af9d90`) no cambia (`Max Anchor Drift = 0.000000e+00`). La progresión de pérdida de validación va de 1,3292 (baseline) a 1,0452 (final, época 3), con un mínimo intermedio de 1,0471 en el paso 300 y un ligero repunte a 1,0482 en el paso 800. El pipeline de exportación es: checkpoint fusionado `bfloat16` → GGUF `F16` (60,67 GiB) vía `convert_hf_to_gguf.py` → GGUF `Q8_0` (32,24 GiB) vía `llama-quantize`.

## Capacidades
- Generación de texto conversacional en inglés (los prompts de verificación están en inglés).
- Generación de código: la model card incluye pruebas con funciones Python para calcular SHA-256 y consultas SQL para detectar emails duplicados.
- Razonamiento de tipo resumen técnico: se evalúa con un prompt sobre el compromiso estabilidad-plasticidad en aprendizaje continuo.
- Determinismo verificable: salidas idénticas entre ejecuciones con decodificación greedy y `seed` fija (hashes de salida documentados, p. ej. `0568fcad58d98807`, `bf4a97a4e9654657`).
- Integración con `llama-cpp-python` y compatibilidad declarada con Ollama y endpoints.
- No se documentan capacidades de tool calling, agentes, visión, audio ni modo thinking en la información disponible.

## Casos de uso
- Inferencia determinista en sistemas de control: el modelo puede desplegarse en un bucle de decisión donde la misma entrada debe producir exactamente la misma salida, gracias a la verificación de repetibilidad con `temperature=0.0` y `seed=123` documentada por el autor.
- Auditoría de pipelines de IA: el digest SHA-256 del ancla (`d6b0458680af9d90`) permite comprobar en producción que los pesos servidos coinciden con los publicados, útil en entornos regulados.
- Generación de código en local: con 32B parámetros en Q8_0 y soporte de llama.cpp, puede integrarse en estaciones de trabajo sin conexión para autocompletar funciones Python o generar consultas SQL, como muestran los prompts de verificación.
- Edge AI y bare-metal: el formato GGUF único y la posibilidad de ejecutar con `n_gpu_layers=0` en CPU permiten desplegarlo en servidores sin GPU o en entornos embebidos con suficiente RAM (≈32 GiB).
- Experimentación en aprendizaje continuo: el artefacto sirve como referencia reproducible para investigar técnicas de retención de conocimiento (Topo-CBP, anclaje de coordenadas primas) sobre un base de 32B.
- Resúmenes técnicos de dominio: los prompts de evaluación cubren síntesis de conceptos de continual learning, lo que sugiere uso en documentación técnica interna donde se requiere consistencia entre ejecuciones.
- Docencia y reproducibilidad científica: al fijar `seed`, `top_k=1` y `top_p=1.0`, los resultados son citables y repetibles en publicaciones.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta pérdida de validación (1,3292 baseline → 1,0452 final) y hashes de salida deterministas, no métricas estándar como MMLU, HumanEval o GSM8K.

## Requisitos de hardware
- VRAM estimada: el fichero Q8_0 ocupa 32,24 GiB; para cargarlo completamente en GPU se necesitan al menos ~34-36 GiB de VRAM considerando overhead de contexto y KV cache.
- GPU recomendadas: A100 80GB, H100 80GB, RTX A6000 48GB, o dos RTX 4090 24GB en paralelo. Una única RTX 4090 (24GB) no es suficiente para carga completa en GPU.
- Consumer GPU: cabe en RTX 4090 solo con descarga parcial de capas a CPU (`n_gpu_layers` reducido), con la consiguiente penalización de latencia.
- CPU: ejecutable con `n_gpu_layers=0`; requiere ~32 GiB de RAM libre y un número de hilos ajustado (`n_threads`).
- Despliegue: llama.cpp, `llama-cpp-python`, Ollama. No se documenta soporte para vLLM ni TGI en el repositorio.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| GLM-4-32B-0414-topo-triton-Q8_0-GGUF (este) | 32,57B | 2.048 en ejemplos | GGUF Q8_0 | other | Ajuste Topo-CBP, determinismo verificado |
| zai-org/GLM-4-32B-0414 (base) | 32,57B | no disponible | safetensors | otra (zai-org) | Modelo original sin ajuste adicional |
| Alternativas de 32B en GGUF | no disponible | no disponible | GGUF | no disponible | No se aportan datos comparativos en la información |

## Limitaciones y advertencias
- El ajuste fino se realizó sobre `yahma/alpaca-cleaned` con `max_seq_len=512`; el modelo puede degradar en contextos largos pese a que el base soporte ventanas mayores.
- Solo se entrenaron `lm_head` y capas `norm` (932M parámetros); el resto de pesos permanece congelado, por lo que las capacidades del base condicionan el comportamiento final.
- La licencia es "other" heredada del modelo base; es imprescindible revisar los términos de `zai-org/GLM-4-32B-0414` antes de uso comercial.
- No se documentan idiomas soportados; los ejemplos y evaluaciones están en inglés, por lo que el rendimiento en castellano es incierto.
- Riesgo de alucinación inherente a modelos generativos de 32B; el determinismo no elimina errores factuales, solo garantiza repetibilidad.
- Las afirmaciones sobre "Topological Continual Backpropagation" y "arithmetic spectral theory" provienen únicamente de la model card del autor y no cuentan con validación independiente en la información disponible.
- El repositorio tiene 235 descargas y 0 likes en el momento de la consulta; la adopción comunitaria es muy baja.
- El contexto mostrado en los ejemplos (`n_ctx=2048`) puede ser insuficiente para casos de uso que requieran ventanas largas.

## Enlaces
- Hugging Face: https://huggingface.co/frankmorales2020/GLM-4-32B-0414-topo-triton-Q8_0-GGUF
- Modelo base: https://huggingface.co/zai-org/GLM-4-32B-0414
- Código del autor (notebook): https://github.com/frank-morales2020/AST/blob/main/triton_GLM_topo_cbp_gguf.ipynb
- Dataset de ajuste: https://huggingface.co/datasets/yahma/alpaca-cleaned
- Autor: Frank Morales Aguilera, Sovereign Machine Laboratory (SOMALA), Montréal; ORCID 0009-0003-9528-0745; contacto `frank.morales@sovereign-machine-lab.ai`
