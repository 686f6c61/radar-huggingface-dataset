# chevron7/DeepSeek-V4-Pro-Qwen3.5-9B-oQ2.5e

## Resumen

DeepSeek-V4-Pro-Qwen3.5-9B-oQ2.5e es un checkpoint cuantizado de forma mixta del modelo Qwen3.5-9B, publicado por el usuario chevron7 en Hugging Face. A pesar del nombre, que combina referencias a DeepSeek-V4-Pro y Qwen3.5, los datos reales de safetensors indican 9.409.813.744 parametros totales, coherentes con un modelo base de aproximadamente 9B. El checkpoint incorpora un componente de vision de 0,456B de parametros junto al modelo de lenguaje de 8,954B, lo que sugiere una arquitectura multimodal.

La relevancia de esta publicacion reside en su estrategia de cuantizacion mixta: en lugar de aplicar un unico nivel de precision a todos los tensores, distribuye los pesos en cinco formatos distintos (afin 2-bit, 3-bit y 5-bit con grupos de 64 y 128, mas BF16), logrando un promedio efectivo de 4,028 bits por peso. El resultado es un checkpoint de 4,413 GiB de almacenamiento que reduce drasticamente el espacio frente a los aproximadamente 19 GB que ocuparia el modelo en BF16.

El modelo esta empaquetado en formato MLX, la libreria de Apple para ejecucion de modelos en silicio de la compania, lo que lo orienta a inferencia local en equipos Mac con chip Apple Silicon. La licencia, los idiomas soportados y los resultados de benchmarks no estan disponibles en la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (modelo de lenguaje + modulo de vision); detalles no disponibles |
| Parametros totales | 9.409.813.744 (9,410B) |
| Parametros activos | No aplica (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Mixta: afin 2-bit grupo 64, afin 3-bit grupo 128, afin 3-bit grupo 64, afin 5-bit grupo 64 y BF16; promedio efectivo 4,028 bits/peso |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | MLX (safetensors), cuantizacion oQ |
| Tamano del repositorio | 4,8 GB (checkpoint de 4,413 GiB) |
| Componentes | Lenguaje: 8,954B (3,826 GB); vision: 0,456B (0,912 GB) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base mas alla de la presencia de un modulo de lenguaje de 8,954B parametros y un modulo de vision de 0,456B parametros, lo que confirma su caracter multimodal. No se especifican el numero de capas, la dimension oculta, el mecanismo de atencion ni si emplea innovaciones como atencion lineal o decodificacion especulativa. Tampoco hay datos sobre el corpus de entrenamiento, el numero de tokens procesados ni si se aplicaron tecnicas de alineacion como RLHF o DPO.

La innovacion documentada es exclusivamente la relativa a la cuantizacion. El checkpoint fue generado con oQ, herramienta del proyecto oMLX (version v0.7.4.dev1), que aplica precision mixta por tensor. La distribucion concreta es la siguiente: 2,606B parametros en afin 2-bit grupo 64 (27,690% del total, 0,758 GiB); 3,910B en afin 3-bit grupo 128 (41,555%, 1,479 GiB); 1,017B en afin 3-bit grupo 64 (10,809%, 0,414 GiB); 1,420B en afin 5-bit grupo 64 (15,088%, 0,909 GiB); y 0,457B en BF16 (4,857%, 0,851 GiB). Esta asignacion selectiva de bits permite mantener en mayor precision los tensores mas sensibles mientras comprime agresivamente el resto.

## Capacidades

- Generacion de texto y razonamiento: el componente de lenguaje de 8,954B parametros soporta las funciones propias de un modelo de esta familia, aunque no se detallan capacidades especificas.
- Procesamiento de vision: la presencia de un modulo de vision de 0,456B parametros indica soporte para entrada de imagenes, si bien no se especifican tareas concretas (VQA, OCR, descripcion de imagenes).
- Capacidades multilingues: no disponibles.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Modo thinking: no disponible en la informacion proporcionada.
- Ejecucion local en Apple Silicon: gracias al formato MLX, el modelo puede ejecutarse en hardware Apple con memoria unificada.

## Casos de uso

- Inferencia local en Mac con memoria unificada: el checkpoint de 4,413 GiB permite ejecutar un modelo de 9,4B parametros en equipos Apple Silicon con 8-16 GB de memoria unificada, algo inviable con el modelo en BF16 (unos 19 GB). Adecuado para prototipado y desarrollo sin GPU dedicada.
- Procesamiento de documentos con imagenes: el modulo de vision permite abordar tareas de extraccion de informacion de capturas, formularios o figuras en un entorno local, manteniendo los datos en el dispositivo.
- Asistentes personales offline: al no requerir conexion a servicios en la nube, el modelo encaja en aplicaciones de asistencia donde la privacidad es prioritaria, ejecutandose integramente en el Mac del usuario.
- Experimentacion con cuantizacion mixta: el checkpoint sirve como referencia practica para investigadores que quieran evaluar el impacto de la asignacion selectiva de bits (2/3/5/BF16) en la calidad de salida frente a cuantizaciones uniformes.
- Evaluacion comparativa de formatos MLX: util para medir latencia y calidad de un modelo multimodal cuantizado con oQ frente a alternativas GGUF o GPTQ en el mismo hardware.
- Desarrollo de demos y prototipos rapidos: el reducido tamano del repositorio (4,8 GB) facilita la descarga y el despliegue en entornos de desarrollo con recursos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria estimada: el checkpoint ocupa 4,413 GiB en almacenamiento; en ejecucion hay que anadir el overhead de KV cache y buffers de la libreria MLX, por lo que se recomienda un minimo de 6-8 GB de memoria unificada.
- Hardware objetivo: chips Apple Silicon (series M1, M2, M3, M4 y variantes Pro, Max y Ultra) con memoria unificada suficiente.
- GPU dedicadas: el formato MLX no esta pensado para GPU NVIDIA o AMD; para esos entornos seria necesario reconvertir los pesos a otro formato (no disponible en el repositorio).
- Cabe en consumer hardware: si, en equipos Mac con 8 GB o mas de memoria unificada, aunque 16 GB ofrece mayor margen para contextos largos.
- Opciones de despliegue: libreria MLX y el ecosistema oMLX; no se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| DeepSeek-V4-Pro-Qwen3.5-9B-oQ2.5e | 9,410B | No disponible | MLX (oQ mixta) | No disponible | Cuantizacion mixta 4,028 bits/peso, multimodal |
| Modelo base Qwen3.5-9B en BF16 | ~9B | No disponible | Safetensors | No disponible | Referencia sin cuantizar; mayor precision y ~19 GB |
| Cuantizaciones GGUF de modelos 9B (p. ej. Q4_K_M) | ~9B | Depende del modelo | GGUF | Depende del modelo | Orientadas a llama.cpp y CPU/GPU mixtas; no ejecutables en MLX |

No se dispone de datos de rendimiento comparado entre estas alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- La cuantizacion a 2 y 3 bits en un 80% de los pesos puede degradar la calidad de salida frente al modelo en BF16; no se aportan evaluaciones que cuantifiquen esa perdida.
- El nombre del repositorio mezcla referencias a DeepSeek-V4-Pro y Qwen3.5, lo que puede inducir a confusion sobre el modelo base real; conviene verificar la procedencia antes de usarlo en produccion.
- No se especifica la licencia, por lo que el uso comercial queda en un limbo legal hasta confirmarla con el autor o con la licencia del modelo original.
- No hay informacion sobre sesgos, riesgo de alucinacion ni evaluaciones de seguridad.
- Los idiomas soportados no estan documentados; el rendimiento fuera del ingles o el chino (idiomas habituales en la familia Qwen) es incierto.
- La longitud de contexto no esta disponible, lo que impide planificar cargas con documentos largos.
- El formato MLX limita el despliegue a hardware Apple Silicon; no hay pesos en GGUF, GPTQ ni AWQ en el repositorio.
- El repositorio registra 0 descargas y 0 likes, sin validacion comunitaria ni evidencia de pruebas por terceros.
- No se documentan capacidades de tool calling ni de agente, relevantes para integraciones en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/chevron7/DeepSeek-V4-Pro-Qwen3.5-9B-oQ2.5e
- Herramienta de cuantizacion oQ (oMLX): https://github.com/jundot/omlx
