# ivp5/DeepSeek-V4.1-Flash-1017-ds4m1

## Resumen

DeepSeek-V4.1-Flash-1017-ds4m1 es una cuantizacion GGUF orientada a Apple Silicon del modelo base deepseek-ai/DeepSeek-V4.1-Flash-1017, publicada por el usuario ivp5. El objetivo declarado por el autor es ejecutar el modelo completo —los 384 expertos enrutados, las tablas Engram, el modo thinking y las llamadas a herramientas— en un unico Apple M1 Max de 64 GB, transmitiendo los expertos desde el SSD a una cache de 38 GiB mientras el resto de los pesos permanece en memoria. El repositorio ocupa 496,7 GB y se distribuye bajo licencia MIT.

La relevancia de esta ficha no reside en el modelo base, del que apenas hay datos publicos en la informacion disponible, sino en la ingenieria de despliegue: el autor publica mediciones de decodificacion (41,1 tok/s a 1.045 MHz), prefill (312,5 tok/s) y resolucion de tareas de agente de programacion (15 de 15, 595 tokens y 17,9 s por tarea) sobre hardware de consumo. El motor empleado es ds4-m1, una bifurcacion de ds4 de antirez con parches para Metal, Neural Engine, streaming desde SSD y un drafter especulativo entrenado.

Se trata, por tanto, de un artefacto de inferencia experimental y muy especializado, no de un checkpoint listo para produccion general. La model card esta centrada en el rendimiento del motor y en la fidelidad de la cuantizacion frente al modelo oficial, no en las capacidades del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mezcla de expertos) con tablas Engram; detalles del transformer no disponibles |
| Parametros totales | no disponible |
| Parametros activos | no disponible (se mencionan 384 expertos enrutados) |
| Longitud de contexto | no disponible (se citan pruebas con ventanas de 17k tokens en modelos comparables) |
| Tipos de cuantizacion | 4 bits en matrices densas de atencion; expertos enrutados comprimidos (bpw exacto no disponible); comparativas con SAGE 1,55 bpw y UD-IQ2_XXS |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF, mas ficheros binarios propios del motor (`*_trained.bin`) |
| Tamano del repositorio | 496,7 GB (292 GB para agente y CLI; 445 GB con los ficheros del servidor) |
| Modelo base | deepseek-ai/DeepSeek-V4.1-Flash-1017 |
| Motor de inferencia | ds4-m1 (ds4 + Metal + Neural Engine + streaming SSD + drafter especulativo) |

## Arquitectura y entrenamiento

El modelo base es una arquitectura MoE con 384 expertos enrutados y tablas Engram, segun la descripcion del autor. No se dispone de informacion sobre el numero total de parametros, la composicion del dataset de entrenamiento, el numero de tokens vistos ni si se aplicaron tecnicas de RLHF o DPO; la model card no cubre esos aspectos del modelo original.

La innovacion tecnica documentada pertenece al proceso de cuantizacion y al motor. Los expertos enrutados se transmiten bajo demanda desde el SSD hacia una cache de 38 GiB, mientras el resto de los pesos —matrices de atencion, embeddings y tablas Engram— reside permanentemente en memoria unificada. En la revision del 19 de noviembre de 2026 se corrigieron tres defectos: una ventana de atencion obsoleta en pasos de prefill de 130-144 filas (las filas mas alla de 128 atendian sobre una ventana desplazada 128 posiciones), matrices densas de atencion almacenadas a rango completo y 4 bits en lugar de rango reducido (5,14 GB frente a 3,03 GB), y una restriccion de esquema en las llamadas a herramientas que impide repetir un parametro ya escrito. Ademas, se reentrenaron los expertos enrutados de 20 capas contra las salidas del modelo oficial y se fijo el ancho del indice de atencion en 512.

## Capacidades

- Generacion de texto y razonamiento en modo thinking, segun la model card ("thinking and tool calls").
- Llamadas a herramientas (tool calling) con validacion de esquema por parametro.
- Uso como agente de programacion: resolucion de tareas de correccion de bugs y tareas de codigo en un unico proceso.
- Ejecucion completa del modelo, incluidos los 384 expertos enrutados, sin poda de expertos.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Vision, audio u otras modalidades: no disponibles.

## Casos de uso

- Agente de programacion local en un portatil Apple Silicon: el modelo resuelve tareas de correccion de bugs de extremo a extremo en un solo proceso, con 595 tokens y 17,9 s por tarea en las mediciones del autor, lo que permite iterar sobre repositorios pequenos sin depender de la nube.
- Desarrollo asistido por IA en entornos con requisitos de privacidad: al ejecutarse integramente en un M1 Max de 64 GB, el codigo y las llamadas a herramientas no salen de la maquina.
- Evaluacion de cuantizaciones para investigacion: el repositorio incluye comparativas de divergencia KL y top-1 frente al modelo oficial y frente a alternativas como SAGE 1,55 bpw y UD-IQ2_XXS, utiles para estudiar el impacto de la compresion en modelos MoE.
- Pruebas de motores de inferencia alternativos: sirve como banco de pruebas para ds4-m1, Metal, Neural Engine y decodificacion especulativa sobre hardware de consumo.
- Despliegue de un servidor de inferencia local: el autor menciona `ds4-server` con su propia configuracion y ficheros de expertos, orientado a exponer el modelo como servicio en la misma maquina.
- Experimentacion con tool calling restringido por esquema: el mecanismo que cierra una llamada cuando todos los parametros del esquema estan escritos es adecuado para estudiar fiabilidad de agentes en pipelines locales.
- Reproduccion de resultados de agente: las tareas de coding-agent y los conjuntos wiki1100 y e2e_eval documentados permiten replicar las mediciones de fidelidad.

## Benchmarks y rendimiento

| Metrica | ds4m1 (19-11-2026) | ds4m1 (08-11-2026) | SAGE 1,55 bpw (EXL3/REXL3) | Unsloth UD-IQ2_XXS |
|---|---|---|---|---|
| Tareas de coding-agent resueltas | 15/15 | 15/15 | no disponible | no disponible |
| Tokens por tarea resuelta | 595 | 822 | no disponible | no disponible |
| Segundos por tarea resuelta | 17,9 | 20,1 | no disponible | no disponible |
| Decodificacion | 41,1 tok/s a 1.045 MHz (39,3/GHz) | 48,4 tok/s a 1.061 MHz (45,6/GHz) | no disponible | no disponible |
| Prefill | 312,5 tok/s a 1.045 MHz (299,0/GHz) | 342,6 tok/s a 1.061 MHz (322,9/GHz) | no disponible | no disponible |
| KL vs oficial, expertos enrutados (8 sesiones de agente) | 0,047 · top-1 92,8% | no disponible | REXL3: 0,091 · top-1 89,9% | no disponible |
| KL vs oficial, expertos enrutados, wiki1100 | 0,324 · top-1 85,1% | no disponible | REXL3: 0,380 · top-1 83,9% | no disponible |
| KL vs oficial, modelo completo, wiki1100 | 0,833 · top-1 73,6% | no disponible | EXL3: 0,088 · top-1 88,2% | 0,203 · top-1 90,5% |
| KL vs referencia Q8_0, modelo completo (4 sesiones) | 0,105 · top-1 90,7% | no disponible | no disponible | no disponible |

En 10 tareas nuevas de correccion de bugs (tres de modulos mas dificiles), el autor reporta 10 de 10 resueltas a 108,6 s y 2.369 tokens por solucion, sin parada por bucle. Las cifras a 1.296 MHz son estimaciones del autor (aproximadamente 48 tok/s de decodificacion y 378 tok/s de prefill), no mediciones directas.

## Requisitos de hardware

- VRAM/RAM estimada: el autor reporta ejecucion en un Apple M1 Max con 64 GB de memoria unificada; los expertos se transmiten desde SSD a una cache de 38 GiB.
- Espacio en disco: 292 GB para agente y CLI, 445 GB con los ficheros del servidor, sobre un repositorio de 496,7 GB.
- GPU recomendadas: Apple Silicon M1 Max de 64 GB segun las mediciones publicadas; no hay datos para A100, H100 o RTX 4090.
- GPU de consumo: si, en Apple Silicon de 64 GB; no disponible para GPUs discretas de consumo.
- Opciones de despliegue: motor propietario ds4-m1 (ds4 con parches Metal, Neural Engine y streaming SSD); llama.cpp se menciona solo como entorno de la alternativa UD-IQ2_XXS, no como opcion documentada para este repositorio.
- Latencia y throughput: 41,1 tok/s de decodificacion y 312,5 tok/s de prefill a 1.045 MHz; 17,9 s y 595 tokens por tarea de coding-agent resuelta.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ds4m1 (este repositorio) | no disponible (384 expertos) | no disponible | 41,1 tok/s decod.; KL 0,047 en expertos enrutados; 15/15 tareas | MIT | GGUF + binarios, 496,7 GB |
| vcruz305 SAGE 1,55 bpw (EXL3/REXL3) | mismo modelo base | no disponible | Requiere GPU de clase 128 GB (108,5 GiB residentes); KL 0,088 en EXL3 sobre su propia porcion | no disponible | 320 GB |
| Unsloth UD-IQ2_XXS (GGUF) | mismo modelo base | no disponible | 300,5 GB de pesos; KL 0,203 en wiki1100, top-1 90,5% | no disponible | GGUF via llama.cpp |

Las tres alternativas cuantizan el mismo modelo base DeepSeek-V4.1-Flash-1017. La comparativa directa de fidelidad no es homogenea: cada artefacto reporta KL sobre su propia porcion de evaluacion, y el autor advierte de esa limitacion en su tabla.

## Limitaciones y advertencias

- Tendencia a repetir lineas: cuando una respuesta ya contiene dos veces la misma linea y la peticion no especifica cuantas se quieren, el modelo tiende a escribirla de nuevo. El autor atribuye este comportamiento al modelo oficial (primera opcion en 19 de 20 documentos de prueba) y reporta que esta build continuo un bucle sembrado en 5 de 8 muestras; el detector de bucles del agente corta el turno.
- Fidelidad limitada en el modelo completo: KL 0,833 y top-1 73,6% frente al oficial en wiki1100, peor que las alternativas EXL3 e IQ2_XXS en sus respectivas porciones.
- Dependencia de hardware y motor propietario: el rendimiento documentado corresponde a un M1 Max de 64 GB con ds4-m1; no hay datos para otras GPUs ni para motores estandar.
- Requisitos de almacenamiento elevados: 292-445 GB de descarga y transmision continua de expertos desde SSD, lo que puede degradar la latencia con almacenamiento lento.
- Idiomas, sesgos y riesgos de alucinacion del modelo base: no disponibles en la informacion proporcionada.
- Licencia MIT declarada para el artefacto de cuantizacion; deben verificarse las condiciones del modelo base deepseek-ai/DeepSeek-V4.1-Flash-1017 antes de uso comercial.
- Artefacto experimental: la model card documenta correcciones de defectos del motor en cada revision, por lo que conviene fijar una revision concreta en produccion.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/ivp5/DeepSeek-V4.1-Flash-1017-ds4m1
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Motor ds4-m1: https://github.com/ivp5/ds4-m1
- Motor ds4 original (antirez): https://github.com/antirez/ds4
