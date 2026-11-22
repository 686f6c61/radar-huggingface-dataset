# IsValorum/Surogate3.7-35B-A3B-APEX-I-MiniPlus-V2.1-GGUF

## Resumen

Surogate3.7-35B-A3B-APEX-I-MiniPlus-V2.1-GGUF es una cuantización GGUF del modelo base `surogate/Surogate3.7-35B-A3B`, publicada por el usuario IsValorum dentro de su serie de cuantizaciones "APEX". El modelo base emplea una arquitectura híbrida de tipo `qwen35moe`, que combina capas de atención con capas de espacio de estados (SSM) y un esquema de mezcla de expertos (MoE) con aproximadamente 35.500 millones de parámetros totales y 3.000 millones activos por token (según la nomenclatura A3B del nombre).

La relevancia de esta ficha reside en que se trata de una cuantización quirúrgica: el autor aplica una asignación de precisión por tensor (mezclando Q3_K, Q4_K, Q5_K, Q6_K, Q8_0 y F32) en lugar de una cuantización uniforme, con protecciones específicas para las rutas recurrentes del SSM. El resultado es un archivo de 14,18 GiB que busca preservar la calidad del BF16 original reduciendo el peso lo suficiente para su despliegue en hardware de consumo.

El pipeline declarado es `image-text-to-text`, lo que sugiere capacidades multimodales de entrada, aunque no se dispone de detalles adicionales sobre el módulo de visión en la información proporcionada. La licencia es Apache 2.0 y el formato es GGUF, orientado a llama.cpp y motores compatibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `qwen35moe` (híbrida: atención + SSM + MoE con expertos compartidos) |
| Parametros totales | 35.505.251.456 (35,5 B) |
| Parametros activos | 3 B (según nomenclatura A3B; no confirmado en la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF mixta por tensor: Q3_K, Q4_K, Q5_K, Q6_K, Q8_0 y F32 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (origen de cuantización: BF16) |

## Arquitectura y entrenamiento

El modelo base es de tipo `qwen35moe`, una arquitectura híbrida que alterna mecanismos de atención con capas de espacio de estados (SSM). La presencia de tensores `ssm_a`, `ssm_alpha`, `ssm_beta`, `ssm_conv1d`, `ssm_dt.bias` y `ssm_out` en las 30 capas auditadas confirma una ruta recurrente paralela a la atención. Además, incorpora expertos compartidos (`ffn_down_shexp`, `ffn_gate_shexp`) junto con el enrutamiento MoE y un mecanismo MTP (multi-token prediction) referenciado en las etiquetas del repositorio.

La cuantización se realizó a partir de pesos BF16 usando una matriz de importancia (`Surogate3.7-35B-A3B.imatrix.gguf`) y una asignación de precisión por tensor auditada sobre el GGUF físico. Las rutas recurrentes críticas (`ssm_a`, `ssm_alpha`, `ssm_conv1d`, `ssm_dt.bias`) se mantienen en F32 (258 tensores observados), mientras que las proyecciones de atención y los expertos compartidos usan precisiones intermedias (Q3_K a Q8_0). No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF/DPO.

## Capacidades

- Generación de texto conversacional (etiqueta `conversational`).
- Procesamiento de entrada imagen-texto según el pipeline `image-text-to-text` declarado.
- Razonamiento multi-paso y modo agente: el autor promociona su cliente V-Agent con siete servidores MCP integrados (ficheros, comandos, búsqueda web, navegador autónomo, herramientas de escritorio, descargas HTTP y Hugging Face).
- Compatibilidad con endpoints (`endpoints_compatible`).
- Soporte de predicción multi-token (MTP) según las etiquetas del repositorio.
- Capacidades multilingües: no disponible.
- Tool calling / function calling: no confirmado explícitamente en la información disponible.

## Casos de uso

- Agente de escritorio local en Windows: el modelo puede desplegarse con llama.cpp (CUDA, Vulkan o CPU) e integrarse en V-Agent para ejecutar flujos con herramientas MCP, aprovechando su tamaño de 14,18 GiB para caber en GPUs de consumo.
- Asistente conversacional con contexto largo: la arquitectura híbrida SSM-atención está diseñada para manejar secuencias extensas con menor coste de memoria en la ruta recurrente; útil en chats multi-turno y análisis de documentos largos (la longitud exacta de contexto no está disponible).
- Procesamiento de documentos con imágenes: al declarar pipeline `image-text-to-text`, puede emplearse para extraer y razonar sobre información de capturas, diagramas o páginas escaneadas en un flujo local.
- Automatización de tareas de desarrollo: con compatibilidad de endpoints y motores GGUF, puede conectarse a pipelines de CI/CD o a asistentes de código que requieran inferencia local sin enviar datos a la nube.
- Despliegue en estaciones de trabajo sin GPU dedicada de gama alta: la cuantización mixta permite ejecución en CPU o GPUs consumer, adecuada para prototipado y pruebas de agentes en entornos con recursos limitados.
- Investigación sobre cuantización quirúrgica: el mapa de tensores auditado y la preservación en F32 de las rutas SSM lo convierten en un caso de estudio para evaluar el impacto de la precisión por tensor en modelos híbridos MoE.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo GGUF ocupa 14,18 GiB; con overhead de contexto y caché KV, se recomienda al menos 16-18 GB de VRAM para carga completa en GPU.
- GPU recomendadas: RTX 4090 (24 GB), RTX 4080 (16 GB, ajustado), A100 (40/80 GB), H100 (80 GB).
- Cabe en GPU de consumo: sí, en tarjetas con 16 GB o más (RTX 4080, 4090, 4060 Ti 16 GB), con posible offload parcial en GPUs de 12 GB.
- Opciones de despliegue: llama.cpp (CUDA, Vulkan, CPU), V-Agent (cliente del autor), y cualquier runtime compatible con GGUF (Ollama, LM Studio, entre otros).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Surogate3.7-35B-A3B-APEX-I-MiniPlus-V2.1 | 35,5 B totales / 3 B activos | no disponible | Apache 2.0 | GGUF (14,18 GiB) | Cuantización quirúrgica con rutas SSM en F32 |
| Surogate3.7-35B-A3B-APEX-I-NanoPlus-V2.1 | 35,5 B totales / 3 B activos | no disponible | Apache 2.0 | GGUF (12,14 GiB) | Misma familia, menor huella |
| Modelo base `surogate/Surogate3.7-35B-A3B` | 35,5 B totales / 3 B activos | no disponible | no disponible | BF16 | Referencia de calidad sin cuantizar |

No se dispone de datos de rendimiento comparado con otras familias de modelos en la información proporcionada.

## Limitaciones y advertencias

- Alucinación: como todo modelo generativo, puede producir contenido plausible pero incorrecto; no hay datos específicos de evaluación en la información disponible.
- Sesgos: no se documentan sesgos conocidos ni la composición del dataset de entrenamiento.
- Idiomas: no se especifican los idiomas soportados; el rendimiento fuera del inglés (u otros idiomas del corpus original) es desconocido.
- Contexto: la longitud máxima de contexto no está disponible, lo que impide garantizar ventanas largas en producción.
- Licencia: Apache 2.0 permite uso comercial, pero el modelo base declara su propia licencia de forma independiente; conviene verificar la del repositorio original antes de desplegar.
- Cuantización agresiva: el uso de Q3_K en proyecciones QKV y en tensores SSM (`ssm_beta`, `ssm_out`) puede degradar la fidelidad respecto al BF16, especialmente en tareas de razonamiento complejo.
- Madurez: el repositorio tiene 0 descargas y 0 likes, y fue creado y actualizado el mismo día; no hay evidencia de validación comunitaria.
- Multimodalidad: el pipeline `image-text-to-text` se declara, pero no se detalla el codificador visual ni su inclusión en el GGUF.

## Enlaces

- [Hugging Face: IsValorum/Surogate3.7-35B-A3B-APEX-I-MiniPlus-V2.1-GGUF](https://huggingface.co/IsValorum/Surogate3.7-35B-A3B-APEX-I-MiniPlus-V2.1-GGUF)
- [Modelo base: surogate/Surogate3.7-35B-A3B](https://huggingface.co/surogate/Surogate3.7-35B-A3B)
- [Variante NanoPlus V2.1](https://huggingface.co/IsValorum/Surogate3.7-35B-A3B-APEX-I-NanoPlus-V2.1-GGUF)
- [V-Agent (cliente del autor)](https://github.com/IsValorum/V-Agent)
- [V-Agent releases](https://github.com/IsValorum/V-Agent/releases/latest)
- [Arquitectura de V-Agent](https://github.com/IsValorum/V-Agent/blob/main/docs/ARCHITECTURE.md)
- [Licencia de V-Agent](https://github.com/IsValorum/V-Agent/blob/main/LICENSE)
- [Apoyo al autor (Ko-fi)](https://ko-fi.com/isvalorum)
