# lactroiii/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-NVFP4

## Resumen

NVIDIA-Nemotron-3.5-Lightning-30B-A3B-NVFP4 es un modelo de lenguaje de gran tamaño (LLM) desarrollado por NVIDIA, diseñado específicamente para tareas de agentes autónomos de larga duración y para inferencia eficiente en hardware personal. Forma parte de la familia Nemotron 3.5, que incluye modelos abiertos con pesos, datos de entrenamiento y recetas publicadas. El modelo emplea una arquitectura híbrida de Mixture-of-Experts (MoE) que combina capas Mamba-2, capas MoE y capas de atención selectiva, con un total de 30.000 millones de parámetros de los cuales solo 3.000 millones se activan por token. Esta configuración permite un rendimiento elevado con un coste computacional reducido, comparable al de modelos mucho más grandes.

La versión NVFP4 utiliza cuantización de 4 bits en punto flotante de NVIDIA, lo que reduce significativamente el uso de memoria y permite desplegar el modelo en una única GPU de gama alta o incluso en hardware de consumo como la GeForce RTX 5090. El modelo admite una ventana de contexto de hasta 1 millón de tokens, lo que lo hace idóneo para procesar documentos extensos y mantener conversaciones de larga duración. Además, incorpora mecanismos de decodificación especulativa (DSpark, MTP y DFlash) que aceleran la generación de texto sin sacrificar calidad.

Con licencia OpenMDW-1.1, que permite uso comercial, y soporte para seis idiomas (inglés, español, francés, alemán, italiano y japonés), este modelo se posiciona como una opción atractiva para desarrolladores que necesitan un modelo eficiente, capaz de ejecutar tareas de razonamiento, generación de código y tool calling en entornos de producción con recursos limitados. Su fecha de lanzamiento es el 11 de agosto de 2026, y los datos de entrenamiento tienen un corte en septiembre de 2025 para el pre-entrenamiento y mayo de 2026 para el post-entrenamiento.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE híbrido: Mamba-2 + MoE + Attention selectiva |
| Parametros totales | 30B (3B activos) |
| Parametros activos | 3B |
| Longitud de contexto | Hasta 1M tokens |
| Tipos de cuantizacion | NVFP4 (4 bits), también disponible en BF16 |
| Idiomas soportados | Inglés, español, francés, alemán, italiano, japonés (y lenguajes de programación) |
| Licencia | OpenMDW-1.1 (permite uso comercial) |
| Formato de pesos | safetensors (cuantización NVFP4) |

Nota: el archivo safetensors del repositorio contiene aproximadamente 17.8 mil millones de elementos, lo que refleja la compresión propia de la cuantización NVFP4; el número nominal de parámetros es de 30B según la model card oficial.

## Arquitectura y entrenamiento

El modelo emplea una arquitectura híbrida que intercala capas Mamba-2 (modelos de espacio de estados) con capas MoE y capas de atención selectiva. Esta combinación busca aprovechar la eficiencia computacional de Mamba-2 para secuencias largas, la capacidad de escalado de los MoE y la precisión de la atención para tareas que requieren dependencias globales. El resultado es un modelo con 3B parámetros activos por token, lo que reduce el coste de inferencia a una fracción del que tendría un modelo denso de tamaño equivalente.

El entrenamiento se realizó con datos cuyo corte de pre-entrenamiento es septiembre de 2025 y de post-entrenamiento mayo de 2026. Aunque la model card no detalla el proceso completo, es probable que se hayan utilizado técnicas de ajuste fino supervisado y optimización con preferencias humanas (tipo RLHF o DPO), dado que el modelo está orientado a tareas de agente y conversación. Entre las innovaciones técnicas destacan los mecanismos de decodificación especulativa: DSpark (optimizado para DGX Spark y centros de datos de baja concurrencia), MTP (Multi-Token Prediction) y DFlash. Estos permiten generar varios tokens por paso, reduciendo la latencia en entornos de producción.

## Capacidades

- Generación de texto y razonamiento complejo, incluyendo tareas de matemáticas y ciencia (resultados destacados en GPQA Diamond y SciCode).
- Generación de código y soporte para tool calling, con parser de herramientas compatible con el formato qwen3_coder.
- Capacidad de agente: soporta razonamiento multi-paso y puede integrarse en arquitecturas de sub-agentes mediante enrutamiento con NeMo Switchyard.
- Multilingüe: inglés, español, francés, alemán, italiano y japonés, además de lenguajes de programación.
- Ventana de contexto de hasta 1M tokens, adecuada para documentos largos y conversaciones prolongadas.
- Modo de razonamiento (reasoning mode) mediante el parser `nemotron_v3` en vLLM.
- Decodificación especulativa integrada (DSpark, MTP, DFlash) para acelerar la generación.

## Casos de uso

- Agentes autónomos de larga duración: el modelo puede mantener conversaciones de miles de turnos sin degradación gracias a su contexto de 1M tokens y su eficiencia energética, ideal para asistentes virtuales que operan de forma continua.
- Sub-agentes en arquitecturas de enrutamiento: con NeMo Switchyard, se puede enrutar tareas de alto volumen (como clasificación, extracción de datos o respuestas simples) a este modelo, reservando modelos frontier para tareas de planificación compleja.
- Atención al cliente multilingüe: su soporte para seis idiomas y su capacidad de tool calling permiten construir chatbots que consulten bases de datos, gestionen tickets o realicen acciones en sistemas externos.
- Generación de código en producción: con el parser de herramientas qwen3_coder, el modelo puede integrarse en pipelines de CI/CD para generar, revisar o documentar código, reduciendo la carga de los desarrolladores.
- Análisis de documentos extensos: su contexto de 1M tokens permite procesar libros técnicos, informes financieros o expedientes legales completos en una sola pasada, extrayendo resúmenes o respondiendo preguntas específicas.
- Inferencia local en hardware personal: gracias a la cuantización NVFP4 y a sus 3B parámetros activos, el modelo puede ejecutarse en una RTX 5090 o incluso en una DGX Spark, permitiendo prototipado y despliegue sin depender de la nube.
- Investigación en razonamiento científico: con resultados sólidos en GPQA Diamond y SciCode, puede utilizarse como asistente para resolver problemas de física, química o biología computacional.

## Benchmarks y rendimiento

La model card oficial proporciona resultados de evaluación para la versión BF16 y la versión NVFP4. Se presentan a continuación los datos disponibles:

| Tarea | BF16 | NVFP4 |
|---|---|---|
| MMLU Pro (conocimiento general) | 81.94 | 81.62 |
| AA-Omniscience (conocimiento general) | 17.50 | 16.63 |
| GPQA Diamond (razonamiento, sin herramientas) | 75.44 | 75.57 |
| HLE (razonamiento, solo texto, sin herramientas) | 11.72 | 10.47 |
| SciCode (razonamiento científico) | 32.60 | 31.38 |

La degradación entre BF16 y NVFP4 es mínima (inferior a 1 punto en la mayoría de tareas), lo que confirma la calidad de la cuantización de 4 bits. No se dispone de datos completos para SWE-bench Veri en la información proporcionada.

## Requisitos de hardware

- VRAM estimada: los pesos en NVFP4 ocupan aproximadamente 15-16 GB (30B parámetros × 0.5 bytes por parámetro). Con la caché KV para contexto largo (1M tokens), se recomienda al menos 24 GB de VRAM para un uso cómodo.
- GPUs compatibles: NVIDIA Blackwell (DGX Spark / GB10, GB200, GeForce RTX 5090), NVIDIA Hopper (H100, H200) y NVIDIA Ampere (A100) mediante el backend W4A16.
- En consumer GPU: cabe en una RTX 5090 (32 GB) y en la DGX Spark (128 GB de memoria unificada). También puede ejecutarse en GPUs con 24 GB si se limita la longitud de contexto.
- Opciones de despliegue: vLLM (versión 0.27.1 o superior) con backend `marlin` para DGX Spark y `humming` para Hopper/Ampere; también es compatible con TGI y llama.cpp (aunque no se menciona explícitamente, el formato safetensors es estándar).
- Latencia y throughput: no se han publicado cifras concretas, pero la decodificación especulativa (DSpark) reduce la latencia en entornos de baja concurrencia. En DGX Spark, se recomienda usar `--moe-backend marlin` y `--kv-cache-dtype fp8` para optimizar el rendimiento.

## Comparativa con modelos similares

El modelo compite directamente con otros MoE de tamaño similar, como Qwen3-30B-A3B (también 30B totales y 3B activos) o Mixtral 8x22B (aunque este último tiene 39B activos). No se dispone de una comparativa detallada con datos de benchmarks en la información proporcionada. A continuación se indican las características generales conocidas:

| Modelo | Parámetros totales | Parámetros activos | Contexto | Licencia |
|---|---|---|---|---|
| Nemotron-3.5-Lightning-30B-A3B | 30B | 3B | 1M | OpenMDW-1.1 |
| Qwen3-30B-A3B | 30B | 3B | 128K | Apache 2.0 |
| Mixtral 8x22B | 141B | 39B | 64K | Apache 2.0 |

La principal ventaja de Nemotron-3.5-Lightning frente a Qwen3-30B-A3B es su contexto de 1M tokens y sus mecanismos de decodificación especulativa integrados. Sin embargo, Qwen3-30B-A3B tiene una licencia más permisiva (Apache 2.0) y un ecosistema más maduro. Para una comparativa cuantitativa rigurosa, se recomienda consultar los benchmarks oficiales de cada modelo.

## Limitaciones y advertencias

- Sesgos potenciales: al igual que otros LLM, el modelo puede reflejar sesgos presentes en sus datos de entrenamiento. NVIDIA recomienda evaluar el modelo en el dominio de aplicación antes de su despliegue.
- Riesgo de alucinación: aunque los resultados en razonamiento son sólidos, el modelo puede generar información falsa o inventada, especialmente en tareas abiertas. Es recomendable validar las salidas en entornos críticos.
- Limitaciones de contexto: aunque soporta 1M tokens, el rendimiento puede degradarse en los extremos de la ventana. Se recomienda probar con la longitud de contexto real de la aplicación.
- Restricciones de licencia: la licencia OpenMDW-1.1 permite uso comercial, pero incluye condiciones específicas (por ejemplo, atribución y restricciones sobre el uso de los pesos). Se debe revisar el texto completo de la licencia antes de su uso en producción.
- Soporte de idiomas: aunque cubre seis idiomas, el rendimiento puede ser inferior en idiomas con menos representación en los datos de entrenamiento (por ejemplo, japonés frente a inglés).
- Requisitos de hardware: aunque es eficiente, la cuantización NVFP4 requiere GPUs NVIDIA con soporte para FP4 (Blackwell) o el backend W4A16 para Hopper/Ampere. No es compatible con GPUs de otros fabricantes.

## Enlaces

- Repositorio HuggingFace del modelo (original de NVIDIA): https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-NVFP4
- Repositorio HuggingFace del mirror (lactroiii): https://huggingface.co/lactroiii/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-NVFP4
- Colección de modelos Nemotron v3 en HuggingFace: https://huggingface.co/collections/nvidia/nvidia-nemotron-v3
- Página del modelo en NVIDIA NIM: https://build.nvidia.com/nvidia/nemotron-3.5-lightning-30b-a3b
- Página de desarrollador de Nemotron: https://developer.nvidia.com/topics/ai/nemotron
- Licencia OpenMDW-1.1: https://openmdw.ai/license/1-1/
