# Infatoshi/GLM-5.3-Flash-NVFP4-FP8

## Resumen

GLM-5.3-Flash-NVFP4-FP8 es una cuantización mixta de precisión del modelo GLM-5.3-Flash de Z.ai, publicada por el usuario Infatoshi en Hugging Face. El modelo base es un transformer multimodal de tipo mixture-of-experts (MoE) con 320 mil millones de parámetros totales y 18 mil millones activos por token, diseñado para tareas de generación de texto, razonamiento, código y visión. Esta versión cuantizada reduce el peso de los expertos enrutados interiores a NVFP4 (4 bits) y los expertos de borde y capas lineales a FP8 (8 bits), manteniendo las entradas sin cuantizar, lo que permite un despliegue más eficiente en hardware NVIDIA Blackwell.

La cuantización fue producida con NVIDIA Model Optimizer (ModelOpt) y calibrada con un millón de tokens de razonamiento y código. El proyecto superó una prueba de acuerdo con la versión FP8 de referencia, alcanzando un 95,24 % de coincidencia de tokens en la recarga del checkpoint. El modelo está disponible bajo licencia MIT y soporta inglés y chino, con una ventana de contexto de 1 millón de tokens según la documentación del modelo base. Es relevante porque ofrece una alternativa de menor huella de memoria para ejecutar un modelo de 320B en clústeres de GPUs de centro de datos, sin renunciar a las capacidades del original.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con atención recurrente, multimodal (image-text-to-text) |
| Parametros totales | 183.430.795.262 (cuantizados; el modelo base tiene 320B) |
| Parametros activos | 18B por token (según documentación del modelo base) |
| Longitud de contexto | 1M (según documentación del modelo base; no confirmado en la model card de esta cuantización) |
| Tipos de cuantizacion | NVFP4 (E2M1, 4 bits) para expertos interiores; FP8 (E4M3) para expertos de borde y capas lineales; entradas sin cuantizar |
| Idiomas soportados | en, zh |
| Licencia | MIT |
| Formato de pesos | safetensors con pesos cuantizados NVFP4 y FP8 (21 shards, 201,9 GB) |

## Arquitectura y entrenamiento

El modelo base GLM-5.3-Flash es un transformer MoE con 320B parámetros totales y 18B activos por token, que incorpora atención recurrente (recurrent state controls) y un bloque de predicción multi-token (MTP). La cuantización aquí descrita no modifica la arquitectura, sino que reemplaza los pesos de los expertos enrutados interiores (capas 6 a 41) por NVFP4 con escalas FP8 estáticas y grupo de 16, y los expertos de borde (capas 3 a 5 y 42 a 44) por FP8 con bloques de 128x128. Las capas lineales cuantizadas restantes también usan FP8 por bloques. Las entradas de activación se mantienen en su precisión original (BF16 o la precisión de origen), y la caché KV no se cuantiza.

El proceso de cuantización se realizó con NVIDIA ModelOpt (build `0.0.1.dev1+g5db268251.d20260828`) en un contenedor PyTorch 26.08, utilizando calibración MSE con barrido de escalas FP8. Los datos de calibración provienen de OpenCodeReasoning (384 muestras), OpenMathReasoning (384) y Nemotron-Science-v1 (256), empaquetados en 1.024 filas de 1.024 tokens, totalizando 1.048.576 tokens. La calibración se ejecutó en 4 GPUs NVIDIA B200, con un pico de memoria de 137.938 MiB en la GPU 1. El embedding, la cabeza LM, los routers, los controles de estado recurrente, el bloque MTP y los módulos visuales permanecen sin cuantizar. La ruta visual no fue evaluada en esta versión.

## Capacidades

- Generación de texto y conversación multilingüe (inglés y chino) con plantilla de chat específica.
- Razonamiento complejo y resolución de problemas matemáticos, gracias a la arquitectura MoE con 18B activos.
- Generación de código y comprensión de lenguajes de programación, con soporte para tareas de programación competitiva.
- Capacidades multimodales (entrada de imagen y texto) heredadas del modelo base, aunque no validadas en esta cuantización.
- Ventana de contexto de 1M tokens, adecuada para documentos largos y conversaciones multi-turno extensas.
- Soporte de predicción multi-token (MTP) que puede acelerar la decodificación en inferencia.
- Compatible con el ecosistema Transformers y vLLM, con pesos en formato safetensors.

## Casos de uso

- Razonamiento y análisis de documentos extensos: gracias a la ventana de 1M tokens, el modelo puede procesar informes, contratos o artículos científicos completos en una sola pasada, resumiendo y extrayendo conclusiones con alta coherencia.
- Generación de código en entornos de desarrollo: el modelo puede autocompletar funciones, generar tests unitarios o refactorizar código en múltiples lenguajes, integrándose en pipelines de CI/CD mediante APIs de generación.
- Asistente de atención al cliente multilingüe: con soporte de inglés y chino, puede gestionar conversaciones multi-turno con contexto largo, manteniendo el historial completo de la interacción.
- Investigación académica en matemáticas y ciencias: su capacidad de razonamiento permite resolver problemas de nivel avanzado, como los de los conjuntos OpenMathReasoning y Nemotron-Science, siendo útil para verificación de demostraciones o generación de soluciones.
- Agentes autónomos con planificación multi-paso: la combinación de razonamiento y contexto largo permite al modelo ejecutar tareas complejas que requieren encadenar varias acciones, como búsqueda de información y síntesis de resultados.
- Análisis de código legacy y documentación técnica: puede leer repositorios completos y generar documentación, explicar fragmentos de código o detectar posibles errores, aprovechando su capacidad de procesar secuencias muy largas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de rendimiento (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card únicamente reporta métricas de acuerdo con la versión FP8 de referencia, no métricas de calidad del modelo. Los datos de acuerdo son:

| Prueba | Acuerdo con FP8 |
|---|---|
| Acuerdo global (recarga del checkpoint) | 95,24 % |
| WikiText-2 (3.064 tokens) | 92,33 % |
| GSM8K (1.226 tokens) | 95,51 % |
| HumanEval (2.217 tokens) | 99,10 % |

Estos valores indican una degradación mínima respecto al checkpoint FP8 original, pero no son comparables con benchmarks estándar de la industria.

## Requisitos de hardware

- VRAM estimada: el checkpoint ocupa 201,9 GB en disco; para inferencia se requiere al menos esa cantidad de VRAM, más overhead de activaciones y caché KV. En la prueba de recarga se usaron 4 GPUs NVIDIA B200 con 183.359 MiB cada una, alcanzando picos de hasta 182.122 MiB en una GPU.
- GPUs recomendadas: NVIDIA B200 (sm_100) o H200 con al menos 200 GB de VRAM. También podría ejecutarse en A100 80GB con NVLink, pero el soporte NVFP4 está optimizado para Blackwell.
- No cabe en GPUs de consumo (RTX 4090, 3090, etc.) debido al tamaño y a la necesidad de soporte NVFP4.
- Opciones de despliegue: Transformers con el cargador de ModelOpt, vLLM (con soporte para pesos NVFP4/FP8), y potencialmente llama.cpp si se convierte a GGUF (no verificado).
- Latencia y throughput: no se han publicado datos específicos. La carga del modelo tardó 2.905 segundos en 4 B200, y la generación de 8 secuencias de 48 tokens tomó 89 segundos en la prueba de recarga.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Cuantización | Licencia |
|---|---|---|---|---|---|
| GLM-5.3-Flash (base) | 320B | 18B | 1M | FP8 nativo | MIT |
| GLM-5.3-Flash-NVFP4-FP8 (este) | 183,4B (cuantizados) | 18B | 1M | NVFP4 + FP8 mixto | MIT |
| GLM-5.3-Flash-NVFP4 (Avifenesh) | 183,4B (cuantizados) | 18B | 1M | NVFP4 puro (4,5 bits/elemento) | MIT |
| GLM-5.3 (Z.ai) | 744B | 40B | 1M | FP8 | MIT |

La versión NVFP4-FP8 ofrece un equilibrio entre compresión y fidelidad: los expertos interiores en NVFP4 reducen el peso, mientras que los expertos de borde y capas lineales en FP8 mantienen mayor precisión donde es más crítica. La versión NVFP4 pura es más compacta pero puede tener mayor degradación. El modelo base FP8 es la referencia de calidad, pero requiere más memoria.

## Limitaciones y advertencias

- La cuantización introduce una degradación leve: el acuerdo con el checkpoint FP8 es del 95,24 %, con divergencias concentradas en tokens donde el FP8 tenía márgenes bajos (41,58 % de desacuerdo cuando el margen era < 0,5).
- La ruta visual (entrada de imágenes) no fue evaluada en esta cuantización; su rendimiento no está garantizado.
- Solo soporta inglés y chino; otros idiomas pueden tener un rendimiento inferior.
- Requiere hardware NVIDIA Blackwell (sm_100) para aprovechar NVFP4; en GPUs más antiguas podría no funcionar o requerir conversión.
- El tamaño del checkpoint (201,9 GB) hace inviable su uso en entornos con menos de 200 GB de VRAM.
- Riesgo de alucinación inherente a los modelos de lenguaje, especialmente en tareas de razonamiento o código sin verificación externa.
- La licencia MIT permite uso comercial, pero el modelo base puede tener restricciones adicionales (verificar la licencia de Z.ai).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Infatoshi/GLM-5.3-Flash-NVFP4-FP8
- Modelo base GLM-5.3-Flash: https://huggingface.co/zai-org/GLM-5.3-Flash
- Versión NVFP4 pura (Avifenesh): https://huggingface.co/Avifenesh/GLM-5.3-Flash-NVFP4
- Guía de ejecución local (unsloth): https://unsloth.ai/docs/models/glm-5.3-flash
- Guía de ejecución local (atomic.chat): https://atomic.chat/blog/guides/how-to-run-glm-5-3-flash-locally
- Documentación de GLM-5.3 (unsloth): https://unsloth.ai/docs/models/glm-5.3
