# alst10/Dolphin3.0-Llama3.1-8B

## Resumen

Este repositorio no contiene un modelo entrenado desde cero, sino una cuantización GGUF del modelo Dolphin3.0-Llama3.1-8B publicado por el usuario alst10. Se trata de una conversión del checkpoint original dphn/Dolphin3.0-Llama3.1-8B (Cognitive Computations) realizada con el fork ROCmFPX de llama.cpp, orientado a hardware AMD con soporte ROCm. El único artefacto publicado es un fichero de 3,98 GB en formato Q4_0_ROCMFP4_FAST.

El modelo subyacente es un transformer decoder-only de 8.030.277.696 parámetros (8,03 B), derivado de Meta Llama 3.1 8B, que Dolphin 3.0 ajusta para conversación, razonamiento y uso agéntico. La cuantización a 4 bits reduce el peso a menos de 4 GB de disco, lo que permite ejecutarlo en GPU de consumo con 6-8 GB de VRAM o en CPU con offload parcial.

Su relevancia es limitada y muy específica: el repositorio tiene 0 descargas y 0 likes, y el formato de cuantización propietario (Q4_0_ROCMFP4_FAST) solo es interpretable por la build ROCmFPX de llama.cpp. No sustituye a las cuantizaciones GGUF estándar del mismo modelo base, sino que sirve como banco de pruebas de cuantización de bajo bit para GPUs AMD.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, heredada de Meta Llama 3.1 8B (detalle de capas, atencion y normalizacion no disponible en la informacion proporcionada) |
| Parametros totales | 8.030.277.696 (8,03 B), dato de safetensors |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | No disponible en la informacion proporcionada (el modelo base Llama 3.1 8B se documenta con 128.000 tokens, sin confirmar aqui) |
| Tipos de cuantizacion | Un unico fichero GGUF: Q4_0_ROCMFP4_FAST (3,98 GB) |
| Idiomas soportados | No disponible |
| Licencia | CC BY 4.0 segun la model card del repositorio; los metadatos de HuggingFace no declaran licencia |
| Formato de pesos | GGUF |
| Modelo base | dphn/Dolphin3.0-Llama3.1-8B |
| Herramienta de conversion | charlie12345/ROCmFPX (fork de llama.cpp) |
| Tamano del repositorio | 4,3 GB |
| Fecha de creacion / actualizacion | 2026-10-07 / 2026-10-07 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es la del checkpoint base dphn/Dolphin3.0-Llama3.1-8B, es decir, un transformer decoder-only de 8,03 B de parametros derivado de Meta Llama 3.1 8B. El autor de esta ficha no modifica pesos ni realiza entrenamiento adicional: aplica exclusivamente una conversion de formato y una cuantizacion de 4 bits (Q4_0 con la variante ROCMFP4_FAST) mediante la herramienta ROCmFPX. No se dispone en la informacion proporcionada de detalles sobre el numero de tokens de entrenamiento del modelo base, la composicion del dataset, ni si se aplicaron etapas de RLHF, DPO o ajuste instruct.

La innovacion tecnica de este repositorio esta en el formato de cuantizacion, no en el modelo. ROCmFPX implementa un esquema de cuantizacion a 4 bits pensado para GPUs AMD bajo ROCm, y requiere compilar el fork con CMake (banderas -DGGML_CUDA=OFF -DGGML_NATIVE=ON) y ejecutar el binario llama-cli resultante. El fichero Q4_0_ROCMFP4_FAST no es un tipo de cuantizacion estandar del ecosistema GGUF, por lo que su compatibilidad con llama.cpp upstream, Ollama, vLLM o TGI no esta garantizada y no viene documentada.

## Capacidades

Las capacidades funcionales corresponden al modelo base Dolphin 3.0 Llama 3.1 8B, no verificadas en este repositorio:

- Generacion de texto conversacional multi-turno, ajustada por instrucciones.
- Razonamiento y resolucion de problemas de dificultad media, con capacidad de generar cadenas de razonamiento.
- Generacion y explicacion de codigo en lenguajes habituales, limitada por el tamano de 8 B de parametros.
- Soporte de function calling / tool calling segun la documentacion del modelo base (no verificable en este repositorio).
- Flujos agénticos de varios pasos, condicionados a que la plantilla de chat del modelo base este presente en el GGUF (no confirmado).
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- No se documenta soporte de vision, audio ni modo thinking explicito en la informacion disponible.

## Casos de uso

- Inferencia local en GPUs AMD: el formato ROCmFP4_FAST esta disenado para ejecutarse bajo ROCm con la build ROCmFPX de llama.cpp, de modo que equipos con Radeon RX 7000 o aceleradoras Instinct pueden servir el modelo con menos de 4 GB de pesos.
- Asistente conversacional embebido: con 3,98 GB de pesos, el modelo cabe en tarjetas de 6-8 GB de VRAM, lo que permite desplegar un chatbot local en estaciones de trabajo sin GPU de datacenter.
- Evaluacion de tecnicas de cuantizacion: util como punto de comparacion frente a Q4_K_M o Q4_0 estandar de llama.cpp, midiendo degradacion de perplejidad y calidad de generacion a igualdad de bit-width.
- Prototipado de pipelines agénticos en local: si la plantilla de chat del modelo base se conserva en el GGUF, puede usarse para probar bucles de tool calling en un entorno controlado sin coste de API.
- Generacion de codigo en entornos sin conectividad: el modelo puede actuar como autocompletado o asistente de refactorizacion en maquinas aisladas, siempre que se acepte la perdida de calidad de un modelo de 8 B a 4 bits.
- Investigacion sobre ajuste fino derivado de Llama 3.1: sirve como punto de partida para estudiar el comportamiento de modelos Dolphin bajo cuantizacion agresiva antes de invertir en despliegues de mayor precision.
- Laboratorio de docencia: por su tamano reducido y su coste cero de licencia declarada, es viable para practicas de despliegue de LLM en hardware de aula.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye tablas de MMLU, HumanEval, GSM8K ni metricas de perplejidad de la cuantizacion, y no se dispone de comparaciones frente al checkpoint base en bf16 o frente a cuantizaciones GGUF estandar. No se reproducen aqui cifras del modelo original porque no forman parte de la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos ocupan 3,98 GB en disco; en ejecucion hay que anadir el overhead de la cache KV y de las activaciones. Con cuantizacion de la cache a 8 bits, una ventana de 8.000 tokens en un modelo de 8 B tipo Llama 3.1 con GQA consume aproximadamente 0,5 GB adicionales, lo que situa el total en el rango de 4,5 a 5,5 GB.
- GPU recomendadas: cualquier GPU AMD con soporte ROCm y al menos 6-8 GB de VRAM (Radeon RX 6700 XT, RX 7800 XT, RX 7900 XTX, Radeon Pro W6800, Instinct MI210/MI250). Dado que la build se compila con -DGGML_CUDA=OFF, la ruta de ejecucion documentada es ROCm, no CUDA.
- GPU de consumo: si, cabe en la mayoria de tarjetas con 8 GB o mas de VRAM. En tarjetas de 8 GB hay que vigilar el tamano del contexto; en 6 GB conviene reducir la ventana o mover parte de las capas a CPU.
- CPU: la ejecucion en CPU es posible con llama.cpp, pero la build indicada usa GGML_NATIVE=ON y no se documenta rendimiento en CPU.
- Opciones de despliegue: llama.cpp con el fork ROCmFPX (unica ruta documentada); no se confirma compatibilidad con vLLM, TGI, Ollama, LM Studio u otras herramientas, ya que Q4_0_ROCMFP4_FAST no es un tipo de cuantizacion estandar.
- Latencia y throughput: no disponible. No se publican mediciones de tokens por segundo ni de latencia de primera token.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia declarada | Disponibilidad |
|---|---|---|---|---|---|
| alst10/Dolphin3.0-Llama3.1-8B (esta ficha) | 8,03 B | No disponible | GGUF Q4_0_ROCMFP4_FAST (3,98 GB) | CC BY 4.0 | 1 fichero, 0 descargas |
| dphn/Dolphin3.0-Llama3.1-8B (base) | 8,03 B | No disponible en esta busqueda | Safetensors | Sujeta a los terminos del modelo base Llama 3.1 | Repositorio oficial del modelo original |
| Cuantizaciones GGUF estandar derivadas del mismo base | 8,03 B | Segun configuracion del conversor | GGUF Q4_K_M, Q5_K_M, Q8_0, etc. | Segun el publicador del GGUF | Amplia disponibilidad en el ecosistema llama.cpp |
| Meta Llama 3.1 8B Instruct | 8,03 B | 128.000 tokens documentados | Safetensors, GGUF | Llama 3.1 Community License | Muy amplia |

No se dispone de datos de rendimiento comparados entre estas opciones en la informacion proporcionada, por lo que la comparativa se limita a parametros, formato, licencia y disponibilidad.

## Limitaciones y advertencias

- Riesgo de licencia: el repositorio declara CC BY 4.0, pero el modelo base deriva de Meta Llama 3.1. Una cuantizacion de un derivado de Llama 3.1 normalmente hereda los terminos de la Llama 3.1 Community License, mas restrictivos que CC BY 4.0. La licencia indicada por el publicador de este GGUF es, como minimo, dudosa para uso comercial y deberia verificarse con el titular de los derechos antes de cualquier despliegue productivo.
- Compatibilidad restringida: Q4_0_ROCMFP4_FAST es un tipo de cuantizacion no estandar. Solo la build ROCmFPX de llama.cpp documenta su carga; herramientas como Ollama, vLLM, TGI o el llama.cpp upstream pueden rechazar el fichero.
- Dependencia de hardware: la ruta de compilacion documentada desactiva CUDA, por lo que no hay soporte verificado en GPUs NVIDIA con esta build concreta.
- Perdida de calidad por cuantizacion: no se publican metricas de perplejidad ni de benchmarks que cuantifiquen la degradacion frente al base en bf16. A 4 bits, es esperable cierto deterioro en tareas de razonamiento y codigo, aunque no se ha medido.
- Idiomas y contexto sin confirmar: no hay informacion sobre idiomas soportados ni sobre la ventana de contexto efectiva conservada en el GGUF.
- Alucinacion: no se documentan evaluaciones de veracidad ni tasas de alucinacion para esta conversion. En un modelo de 8 B a 4 bits, el riesgo en dominios factuales es alto.
- Adopcion nula: 0 descargas y 0 likes en el momento de redactar la ficha, sin issues ni validacion por parte de terceros. No hay garantia de que el fichero haya sido validado mas alla de la conversion.
- Sesgos: no se dispone de informacion sobre evaluaciones de sesgo del modelo base ni de la cuantizacion.
- Fechas del repositorio: las marcas de creacion y actualizacion (2026-10-07) son posteriores a la fecha de las ultimas publicaciones conocidas del modelo base, lo que conviene tener en cuenta al evaluar la trazabilidad del artefacto.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/alst10/Dolphin3.0-Llama3.1-8B
- Modelo base: https://huggingface.co/dphn/Dolphin3.0-Llama3.1-8B
- Herramienta de cuantizacion ROCmFPX: https://github.com/charlie12345/ROCmFPX
- Licencia CC BY 4.0: https://creativecommons.org/licenses/by/4.0/
- Paper, blog o demo adicionales: no disponible
