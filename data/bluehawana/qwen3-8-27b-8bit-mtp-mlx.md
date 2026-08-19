# bluehawana/Qwen3.8-27B-8bit-MTP-MLX

## Resumen

Este repositorio ofrece una conversión MLX del modelo Qwen3.8-27B en cuantización de 8 bits, a la que se le ha añadido el head de predicción multi-token (MTP) original del modelo. El objetivo es habilitar la decodificación especulativa nativa en runtimes MLX como oMLX, logrando una aceleración de 2,5 a 3 veces en la generación de texto en equipos Apple Silicon. El modelo base, desarrollado por Alibaba, es un LLM denso multimodal de 27B parámetros con capacidades destacadas para codificación, razonamiento y tareas agénticas. Esta conversión está pensada exclusivamente para el ecosistema MLX y no incluye el encoder de visión del modelo original, por lo que se centra en tareas de texto.

La particularidad de este trabajo es que restaura los pesos del head MTP que la conversión de mlx-community elimina, permitiendo que runtimes como oMLX activen la decodificación especulativa de forma nativa. Según las pruebas del autor, se alcanzan 35,9 tokens por segundo en una Apple M5 Max de 128 GB con una sola secuencia, frente a la decodificación autoregresiva convencional. El modelo mantiene la licencia Apache-2.0 y los pesos son idénticos a la conversión base salvo por la adición de los 15 tensores del head MTP.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3.8-27B), 64 capas, hidden size 5120 |
| Parametros totales | 27B (segun documentacion oficial del modelo base; el repo safetensors reporta 8.146.596.592, posible error de metadatos) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | 8-bit (group size 64) |
| Idiomas soportados | No disponibles |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer denso con 64 capas y una dimensión oculta de 5120, diseñado por el equipo Qwen de Alibaba como un LLM multimodal nativo con capacidades de vision y video. Esta conversión MLX, sin embargo, se limita al componente de lenguaje y no incluye el encoder de vision. La arquitectura incorpora un head de prediccion multi-token (MTP) de una capa adicional, que permite al modelo predecir varios tokens futuros simultaneamente. Este head forma parte del modelo original, pero la conversion de mlx-community lo declara en la configuracion sin incluir sus pesos, lo que desactiva silenciosamente la funcionalidad.

Este repositorio restaura los 15 tensores del head MTP desde la exportacion de EigenLabs, cuantizados en 8-bit con group size 64, y los registra en el indice de safetensors. El resultado es que runtimes MLX con soporte nativo de MTP (como oMLX con `mtp_enabled`) pueden activar la decodificacion especulativa. El autor no proporciona detalles sobre el entrenamiento del modelo base, pero se sabe que Qwen3.8-27B fue entrenado con un enfasis en codificacion, razonamiento y flujos agénticos, y que el head MTP fue incluido desde el entrenamiento original.

## Capacidades

- Generacion de texto y razonamiento: el modelo base destaca en tareas de razonamiento complejo, matematicas y logica, segun los benchmarks publicados por Qwen (no incluidos en esta ficha).
- Codificacion: soporta generacion de codigo en multiples lenguajes, con buen rendimiento en tareas de programacion competitiva y desarrollo de software.
- Tool calling y function calling: el modelo base esta entrenado para invocar herramientas externas, lo que permite integrarlo en pipelines agénticos.
- Agentes y razonamiento multi-paso: disenado para tareas de larga duracion con planificacion y manejo de feedback del entorno.
- Decodificacion especulativa MTP: esta conversion concreta habilita la generacion multi-token con una tasa de aceptacion del 75-99% en trafico de codigo y agentes, con ~3 tokens por verificacion (profundidad 3).
- Multilingue: el modelo base soporta varios idiomas, aunque no se especifican en la informacion disponible.
- Capacidades multimodales: el modelo original soporta imagen y video, pero esta conversion MLX no incluye el encoder de vision, por lo que solo opera con texto.

## Casos de uso

- Desarrollo de codigo asistido en entornos locales: un desarrollador puede ejecutar este modelo en una Mac con Apple Silicon para obtener autocompletado y generacion de funciones directamente en su editor, aprovechando la decodificacion especulativa para reducir la latencia en sesiones interactivas.
- Agentes autonomos de razonamiento multi-paso: gracias al soporte de tool calling y al manejo de feedback del entorno, el modelo puede planificar y ejecutar tareas complejas como busquedas en bases de datos, llamadas a APIs o automatizacion de procesos, manteniendo el contexto a lo largo de multiples pasos.
- Automatizacion de oficina: el modelo base esta optimizado para tareas como redaccion de informes, resumen de documentos, generacion de presentaciones y gestion de correos electronicos, con una ventana de contexto amplia que permite procesar documentos largos.
- Asistente de atencion al cliente: puede gestionar conversaciones multi-turno con contexto extenso, resolviendo consultas frecuentes y derivando casos complejos a humanos, siempre que se ejecute en un servidor con suficiente memoria unificada.
- Analisis de documentos tecnicos: dado su entrenamiento en razonamiento y codificacion, es adecuado para extraer conclusiones de documentacion tecnica, logs de sistemas o especificaciones de software, generando resumenes estructurados.
- Prototipado rapido de aplicaciones de IA generativa: al ser un modelo de 27B en 8-bit que cabe en equipos Apple Silicon de gama alta, permite a investigadores y desarrolladores experimentar con generacion de texto de alta calidad sin depender de infraestructura en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El unico dato de rendimiento proporcionado es la velocidad de decodificacion medida por el autor en una Apple M5 Max de 128 GB con una sola secuencia:

| Configuracion | Velocidad de decodificacion |
|---|---|
| mlx-community 8-bit (sin head MTP) | Autoregresivo convencional |
| Este repositorio con oMLX `mtp_enabled` | 35,9 tokens/s |

La tasa de aceptacion del head MTP en trafico de codigo y agentes se situa entre el 75% y el 99%, con aproximadamente 3 tokens aceptados por pasada de verificacion. No se dispone de comparaciones con otros modelos.

## Requisitos de hardware

- El modelo en 8-bit ocupa aproximadamente 29,3 GB en disco, por lo que se necesita un equipo Apple Silicon con al menos 32 GB de memoria unificada para cargarlo en RAM, aunque se recomiendan 64 GB o mas para dejar margen al sistema operativo y a la ventana de contexto.
- La prueba de rendimiento del autor se realizo en una Apple M5 Max con 128 GB de RAM unificada, alcanzando 35,9 tokens/s en una sola secuencia.
- No es compatible con GPUs NVIDIA o AMD; esta conversion es exclusiva para el ecosistema MLX (Apple Silicon).
- Para desplegarlo se requiere un runtime MLX con soporte de decodificacion especulativa MTP, como oMLX (con la opcion `mtp_enabled`) o una version de mlx-lm con el PR 990 que incluya esta funcionalidad.
- La decodificacion especulativa MTP solo funciona en modo de una sola secuencia; con multiples peticiones concurrentes el sistema vuelve a la decodificacion por lotes convencional.
- Para usar el modelo en otros entornos (Linux, Windows con GPUs NVIDIA), seria necesario recurrir a la version original de Qwen3.8-27B en formatos como GGUF o safetensors estandar, no a esta conversion MLX.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B (original) | 27B | No disponible | Apache-2.0 | Safetensors (bf16) | Modelo multimodal completo, incluye encoder de vision |
| mlx-community/Qwen3.8-27B-8bit | 27B | No disponible | Apache-2.0 | Safetensors (MLX) | Conversion MLX sin head MTP, decodificacion autoregresiva |
| Este repositorio | 27B | No disponible | Apache-2.0 | Safetensors (MLX) | Conversion MLX con head MTP restaurado, decodificacion especulativa |

No se dispone de datos de rendimiento comparativo con otros modelos de tamano similar como Llama 3.1 70B o Qwen2.5-32B, por lo que no se puede establecer una comparativa cuantitativa fiable.

## Limitaciones y advertencias

- Esta conversion es exclusiva para Apple Silicon; no funcionara en GPUs NVIDIA o AMD sin convertir los pesos a otro formato.
- El head MTP solo acelera la decodificacion en modo de una sola secuencia. Con peticiones concurrentes, el rendimiento cae a la decodificacion por lotes convencional, perdiendo la ventaja especulativa.
- La conversion no incluye el encoder de vision del modelo base, por lo que las capacidades multimodales de Qwen3.8-27B no estan disponibles en este repositorio.
- El modelo puede presentar sesgos y alucinaciones tipicos de los LLM de su tamano; se recomienda validar las salidas en aplicaciones de produccion.
- No se han publicado resultados de benchmarks de calidad en esta conversion, por lo que el rendimiento real en tareas especificas debe evaluarse de forma independiente.
- La licencia Apache-2.0 permite uso comercial, pero es responsabilidad del usuario verificar el cumplimiento de las condiciones de la licencia del modelo base y de las herramientas utilizadas.
- El head MTP requiere un runtime especifico (oMLX o mlx-lm con soporte) y no esta disponible en todas las herramientas de inferencia MLX.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/bluehawana/Qwen3.8-27B-8bit-MTP-MLX
- Modelo base (mlx-community): https://huggingface.co/mlx-community/Qwen3.8-27B-8bit
- Modelo original Qwen: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio del head MTP (EigenLabs): https://huggingface.co/EigenLabs/Qwen3.8-27B-MTP-bf16
- Documentacion MTP y pruebas: https://huggingface.co/datasets/bluehawana/qwen3.8-27b-apple-silicon-concurrency/blob/main/MTP.md
- Codigo y README del proyecto: https://github.com/bluehawana/Qwen3.827B-SGLang-mpbm5max/blob/mtp-speculative-decoding/mtp/README.md
