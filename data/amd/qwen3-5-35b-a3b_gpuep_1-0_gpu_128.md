# amd/Qwen3.5-35B-A3B_gpuep_1.0_gpu_128

## Resumen

Qwen3.5-35B-A3B_gpuep_1.0_gpu_128 es una distribucion cuantizada del modelo Qwen/Qwen3.5-35B-A3B, preparada por AMD mediante las herramientas Olive y OGA Model Builder para su despliegue optimizado en hardware AMD Ryzen AI. Se trata de un modelo multimodal de tipo image-text-to-text con arquitectura Mixture of Experts (MoE), empaquetado en formato ONNX con pesos INT4 y activaciones FP16.

El modelo base, desarrollado por Alibaba Qwen, emplea una arquitectura MoE con 35.000 millones de parametros totales y 3.000 millones de parametros activos por token (de ahi el sufijo A3B), lo que permite un equilibrio entre capacidad y coste computacional en inferencia. La version publicada por AMD aplica cuantizacion RTN con tamano de grupo 32 sobre los pesos del bloque MoE, mientras mantiene en FP16 tanto el codificador de vision como las capas de embeddings.

Su relevancia radica en que permite ejecutar localmente un modelo multimodal de gran capacidad sobre plataformas con NPU AMD Ryzen AI, sin depender de GPUs de datacenter. El repositorio ocupa 43,2 GB en formato ONNX, lo que refleja el empaquetado completo del modelo cuantizado junto con los componentes de vision.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture of Experts (MoE), multimodal image-text-to-text |
| Parametros totales | 35.000 millones (aproximado, segun nomenclatura del modelo base) |
| Parametros activos | 3.000 millones (aproximado, segun nomenclatura A3B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT4 en pesos (RTN, group size 32), activaciones FP16, vision FP16, embeddings FP16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (modelo base); MIT para las modificaciones de AMD |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-35B-A3B sigue una arquitectura de tipo Mixture of Experts, en la que solo una fraccion de los parametros totales (aproximadamente 3.000 millones) se activa por token procesado. Esta estructura reduce el coste de inferencia respecto a un modelo denso de 35.000 millones de parametros, manteniendo una capacidad de representacion elevada. El modelo es multimodal, con un codificador de vision que procesa imagenes junto con texto, lo que habilita tareas de image-text-to-text.

La version distribuida por AMD no reentrena el modelo, sino que aplica un proceso de cuantizacion post-entrenamiento mediante Olive y OGA Model Builder. La estrategia concreta es RTN (Round-To-Nearest) con tamano de grupo 32 sobre los pesos del bloque MoE, manteniendo activaciones en FP16. El codificador de vision y las capas de embedding permanecen en FP16 para preservar la calidad en la modalidad visual. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO en el modelo base dentro de la informacion proporcionada.

## Capacidades

- Generacion de texto conversacional multi-turno.
- Procesamiento de imagenes y texto combinados (image-text-to-text), incluyendo descripcion de imagenes y respuesta a preguntas visuales.
- Razonamiento y respuesta a preguntas en lenguaje natural.
- Capacidades multilingues: no se especifican los idiomas concretos en la informacion disponible.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Modo thinking explicito: no disponible en la informacion proporcionada.

## Casos de uso

- Asistente conversacional local en equipos con NPU AMD Ryzen AI: el modelo puede gestionar dialogos multi-turno directamente en el dispositivo, sin enviar datos a la nube, aprovechando el empaquetado ONNX optimizado para esta plataforma.
- Descripcion y analisis de imagenes en aplicaciones de accesibilidad: el codificador de vision en FP16 permite generar descripciones textuales de imagenes capturadas por camara o cargadas por el usuario, integrable en lectores de pantalla o herramientas de asistencia.
- Procesamiento de documentos con contenido visual: extraccion de informacion de capturas, graficos o formularios escaneados combinando entrada de imagen y texto, adecuado para flujos de digitalizacion en escritorio.
- Prototipado de aplicaciones multimodales en entornos de desarrollo con hardware AMD: el formato ONNX y la integracion con OGA Model Builder facilitan la experimentacion en pipelines de IA local sin infraestructura de GPU dedicada.
- Respuesta a preguntas sobre imagenes tecnicas (manuales, diagramas): el modelo puede recibir una imagen y una pregunta en texto para devolver explicaciones, util en soporte tecnico de campo con equipos portatiles.
- Chat de asistencia en aplicaciones de escritorio con requisitos de privacidad: al ejecutarse localmente sobre Ryzen AI, permite mantener las conversaciones y las imagenes del usuario dentro del dispositivo, cumpliendo con politicas de tratamiento de datos sensibles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ONNX ocupa 43,2 GB, aunque el modelo cuantizado en INT4 con activaciones FP16 requiere un espacio en memoria inferior al de los pesos completos en FP16. No se dispone de una cifra exacta de VRAM en la informacion proporcionada.
- GPU recomendadas: el modelo esta optimizado para NPU AMD Ryzen AI, no para GPUs de datacenter. No se especifican modelos de GPU compatibles.
- Compatibilidad con GPU de consumo: no disponible en la informacion proporcionada; el destino declarado es hardware AMD Ryzen AI.
- Opciones de despliegue: ONNX Runtime con OGA Model Builder (herramienta empleada por AMD para generar el paquete). No se confirma soporte de vLLM, llama.cpp, Ollama ni TGI en la informacion disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Destino |
|---|---|---|---|---|---|
| Qwen3.5-35B-A3B_gpuep_1.0_gpu_128 (este) | 35B totales / 3B activos | no disponible | ONNX (INT4/FP16) | Apache 2.0 + MIT (modificaciones AMD) | NPU AMD Ryzen AI |
| Qwen/Qwen3.5-35B-A3B (base) | 35B totales / 3B activos | no disponible | safetensors (presumible) | Apache 2.0 | GPU generica |
| Alternativas MoE de tamano similar | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparativa con otros modelos de la misma categoria no puede completarse con la informacion disponible; solo se dispone de datos del modelo base y de esta distribucion cuantizada.

## Limitaciones y advertencias

- La cuantizacion INT4 con RTN puede introducir degradacion en la calidad de las respuestas respecto al modelo base en FP16/BF16, especialmente en tareas de razonamiento complejo o generacion de codigo.
- El modelo esta empaquetado especificamente para hardware AMD Ryzen AI; su ejecucion en otras plataformas puede no ser viable o requerir conversion adicional del formato ONNX.
- No se dispone de informacion sobre sesgos conocidos, tasas de alucinacion ni evaluaciones de seguridad del modelo base en la informacion proporcionada.
- No se especifican los idiomas soportados ni el rendimiento por idioma; el uso en castellano no esta verificado en la documentacion disponible.
- La licencia del modelo base es Apache 2.0, pero las modificaciones de AMD se distribuyen bajo licencia MIT; es necesario revisar ambas condiciones para uso comercial y redistribucion.
- El tamano del repositorio (43,2 GB) implica requisitos de almacenamiento considerables y tiempos de descarga elevados.
- No hay informacion sobre soporte de tool calling, agentes o modo thinking; no deben asumirse estas capacidades en produccion sin verificacion previa.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/amd/Qwen3.5-35B-A3B_gpuep_1.0_gpu_128
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-35B-A3B
- Licencia Apache 2.0: http://www.apache.org/licenses/LICENSE-2.0
