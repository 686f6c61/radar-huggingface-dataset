# ryugyosoft/granite-4.2-3b-onw

## Resumen

Granite-4.2-3b-onw es una conversion del modelo IBM Granite 4.2 3B al formato del motor onw, un runtime que ejecuta modelos de lenguaje exclusivamente sobre la NPU de los procesadores Intel Core Ultra. Lo publica el usuario ryugyosoft, autor tambien del propio motor onw, y no implica ningun reentrenamiento: se trata de un proceso de recuantizacion y reestructuracion de los pesos originales en grafos estaticos optimizados para la NPU.

El modelo base, Granite 4.2 3B de IBM, es un transformer denso de tipo Llama con aproximadamente 3.000 millones de parametros, perteneciente a la familia Granite 4.2 (3B, 8B y 30B), que introduce razonamiento nativo con cadena de pensamiento y llamada a herramientas aumentada por razonamiento. La version convertida hereda esas capacidades y las expone mediante una API compatible con OpenAI.

Su relevancia practica esta en el nicho: permite ejecutar un modelo de 3B con soporte de tool calling y modo de pensamiento en equipos portatiles sin GPU dedicada, usando unicamente la NPU integrada (Meteor Lake, Arrow Lake, Lunar Lake o Panther Lake), con una tasa de generacion de 6,7 tokens por segundo y un consumo de memoria de trabajo de unos 6 GB. El repositorio ocupa 2,2 GB y la descarga 2,1 GB.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso tipo Llama, con razonamiento (thinking) y tool calling |
| Parametros totales | 3.000 millones (3B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT4 con signo (sign-aware) en la mayoria de pesos; INT8 con grupo 128 en las proyecciones q/k/v de atencion; INT8 en la capa de salida; INT4 en los embeddings |
| Idiomas soportados | japones (ja), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | Formato propio de onw: grafos estaticos en XML (`seg*_S1.xml`, `seg*_S16.xml`) acompanados de ficheros binarios por segmento (`seg*.bin`, `shared.bin`); no usa safetensors ni GGUF |

## Arquitectura y entrenamiento

Se trata de una conversion, no de un entrenamiento: los pesos proceden del modelo base `ibm-granite/granite-4.2-3b` y se recuantizan y reorganizan para onw. La estructura del modelo es un transformer denso convencional de tipo Llama, con 40 capas organizadas en el motor en cinco segmentos de 8 capas mas un segmento independiente para la capa de salida, formando un grafo estatico. Las operaciones de embedding, residual, atencion y salida incorporan los coeficientes propios de Granite dentro del grafo.

La innovacion tecnica relevante esta en la cuantizacion: al comprobar que el INT4 convencional con grupo 128 introducia un error apreciable en Granite, el autor aplica un INT4 que tiene en cuenta el signo (el paso se fija con el maximo dividido entre 7 para valores positivos y con el minimo dividido entre 8 para negativos), manteniendo el mismo orden de datos y velocidad que el INT4 estandar. Solo las proyecciones q/k/v de la atencion se dejan en INT8 con grupo 128, con una perdida de velocidad minima. La capa de salida va en un segmento INT8 separado, y las filas cuya escala cae en numeros subnormales de FP16 (que la NPU convierte a cero) se reconstruyen expresamente.

Respecto al modelo original, IBM indica que Granite 4.2 se refuerza mediante aprendizaje por refuerzo sobre tareas de agente que incluyen hasta 200 llamadas a herramientas (correccion de codigo, operaciones de terminal y busqueda web). Esta informacion corresponde al modelo base, no al proceso de conversion. No se ha realizado ningun ajuste adicional sobre el modelo convertido.

## Capacidades

- Generacion de texto y conversacion multi-turno en japones e ingles.
- Modo de pensamiento (razonamiento) con cadena de pensamiento explicita: desactivado por defecto y activable mediante `chat_template_kwargs: {"enable_thinking": true}`; el contenido de razonamiento se devuelve en el campo `reasoning_content`.
- Llamada a herramientas compatible con el esquema de definiciones de funciones de OpenAI (`tools`), con soporte de llamadas en paralelo.
- Razonamiento aumentado por herramientas: el modelo decide que herramienta invocar y por que antes de hacerlo.
- Flujos de agente de varios pasos, incluyendo llamadas encadenadas (verificado en pruebas con dos etapas de llamada a herramienta mas respuesta final).
- Seguimiento de instrucciones, con IFBench reportado de 74,3 en la tarjeta del modelo base.
- Compatibilidad como servidor de API compatible con OpenAI en `http://localhost:8000/v1`.
- No soporta vision, audio ni entrada multimodal: la entrada es solo texto.

## Casos de uso

- Asistentes de agente en portatiles sin GPU: al ejecutarse integramente sobre la NPU Intel, permite desplegar un agente con tool calling en un equipo de oficina o portatil, sin depender de una tarjeta grafica dedicada ni de la nube.
- Automatizacion de operaciones de terminal: el modelo base fue reforzado con tareas de operaciones de terminal, por lo que encaja en flujos donde el agente propone y ejecuta comandos de sistema de forma encadenada, verificando el resultado de cada paso.
- Correccion y generacion de codigo asistida por herramientas: integrado mediante la API compatible con OpenAI, puede conectarse a un servidor de herramientas que aplique parches o ejecute pruebas y devuelva resultados al modelo para iterar.
- Busqueda web aumentada: el soporte de tool calling permite definir una herramienta de busqueda y dejar que el modelo decida cuando consultarla y como usar los resultados para responder.
- Procesamiento de lenguaje natural en japones en entornos cerrados: para empresas que necesitan generar o resumir texto en japones sin enviar datos a servicios externos, con la advertencia de que la calidad en japones es inferior a la del ingles y puede producir errores en kanji.
- Enrutamiento y clasificacion con razonamiento: activando el modo de pensamiento se puede usar como clasificador o etiquetador que justifica su decision, util en pipelines de triaje de incidencias.
- Prototipado y desarrollo local de agentes: el servidor local compatible con OpenAI permite desarrollar y depurar aplicaciones de agente en un portatil antes de desplegarlas a mayor escala.
- Demostraciones y evaluacion de modelos en hardware Intel: sirve para medir el rendimiento real de la NPU con cargas de agentes, dado que el propio repositorio publica cifras de velocidad y latencia.

## Benchmarks y rendimiento

Los siguientes datos corresponden al modelo base Granite 4.2 3B, segun lo indicado en la tarjeta del modelo convertido (que remite a la tarjeta original de IBM). No son mediciones del modelo convertido.

| Benchmark | Granite 4.2 3B |
|---|---|
| BFCL v4 | 52,4 |
| tau3-bench (τ³-bench) | 51,0 |
| IFBench | 74,3 |

Segun la tarjeta, BFCL v4 de 52,4 empata con el resultado de la variante de 8B.

Mediciones propias de la conversion publicadas por el autor:

| Metrica | Valor |
|---|---|
| Coincidencia de tokens (teacher forcing, 400 tokens) frente a bf16 en CPU | 344/400 |
| Coincidencia con INT4 convencional unicamente | 316/400 |
| Coincidencia del primer token en 20 preguntas en japones (NPU frente a CPU FP32) | 15/20 |
| Velocidad de generacion (NPU 3720, Core Ultra 9 285HX) | 6,7 tok/s (aproximadamente 7,7 tok/s en chat con verificacion anticipada) |
| Procesamiento de prompt en preguntas cortas | menos de 1 segundo |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) del modelo convertido en la informacion disponible.

## Requisitos de hardware

- Hardware obligatorio: procesador Intel Core Ultra con NPU, series 1 y 2 (Meteor Lake, Arrow Lake, Lunar Lake) o serie 3 (Panther Lake).
- Sistema operativo: Windows 11 o Ubuntu 22.04 o superior.
- Memoria de trabajo tras la carga: aproximadamente 6 GB.
- Tamano de descarga: 2,1 GB (repositorio de 2,2 GB).
- No requiere GPU dedicada; la inferencia se ejecuta integramente en la NPU.
- Compilacion inicial para la NPU: aproximadamente 6 minutos la primera vez; alrededor de 20 segundos en arranques posteriores.
- Rendimiento medido en una NPU 3720 (Core Ultra 9 285HX): 6,7 tok/s de generacion. Las cifras variaran segun la NPU y la cantidad de memoria del equipo.
- Despliegue: mediante el motor onw (instalacion por script en PowerShell para Windows o `curl ... | bash` en Ubuntu), con interfaz grafica y servidor local compatible con OpenAI en `http://localhost:8000/v1`. Tambien admite descarga con `hf download ryugyosoft/granite-4.2-3b-onw` y arranque con `onw serve <carpeta>`. No es compatible con vLLM, llama.cpp ni TGI, ya que el formato de pesos es especifico de onw.
- No se debe usar `git clone` sin Git LFS, porque los pesos no se descargan y onw detiene la ejecucion al detectarlo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| granite-4.2-3b-onw | 3B | no disponible | BFCL v4 52,4; tau3-bench 51,0; IFBench 74,3 (datos del base); 6,7 tok/s en NPU 3720 | Apache 2.0 | HuggingFace, formato onw para NPU Intel |
| ibm-granite/granite-4.2-3b | 3B | no disponible | mismos valores de referencia del modelo base | Apache 2.0 | HuggingFace, pesos originales |
| Granite 4.2 8B | 8B | no disponible | BFCL v4 52,4 (empate con el 3B segun la tarjeta) | Apache 2.0 | HuggingFace, version original y conversion onw |
| llm-jp-4.1-8b-thinking-onw | 8B | no disponible | no disponible | no disponible | HuggingFace, conversion onw |

El autor recomienda `llm-jp-4.1-8b-thinking-onw` cuando el uso esta centrado en japones, al ofrecer mejor calidad en ese idioma que esta variante de 3B. La comparativa con modelos de otros fabricantes no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Es una conversion de formato, no un modelo nuevo: todas las limitaciones del modelo base se mantienen intactas.
- El autor advierte que los indicadores multilingues de Granite 4.2 son inferiores a los de ingles y que las respuestas en japones pueden contener errores en kanji o contenido poco natural. En japones, el primer token coincidio solo en 15 de 20 casos frente a la referencia en FP32.
- Riesgo de alucinacion inherente a los modelos de 3.000 millones de parametros, especialmente en tareas de conocimiento factual y en cadenas de razonamiento largas.
- El modo de pensamiento genera una cantidad elevada de tokens; el autor recomienda fijar `max_tokens` en 2000 o mas cuando se combina pensamiento y uso de herramientas, lo que aumenta la latencia.
- Configuracion recomendada por el modelo base: temperatura 1,0 y top_p 0,95. El valor por defecto de onw es generacion voraz (greedy), distinto del recomendado.
- Dependencia total del motor onw y de hardware Intel Core Ultra con NPU: no es ejecutable en GPU NVIDIA, AMD ni en CPU convencional mediante los runtimes habituales.
- La cuantizacion INT4 introduce perdida de calidad medible: 344 de 400 tokens coinciden con la referencia bf16, frente a 316 con INT4 convencional.
- Existe una penalizacion de rendimiento por la compilacion inicial para la NPU, de unos 6 minutos, que afecta a despliegues efimeros o contenedores que se recrean con frecuencia.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base incluye los terminos propios de IBM Granite, que conviene revisar antes de un despliegue en produccion.
- El repositorio registra 0 descargas y 0 valoraciones en el momento de la consulta, por lo que no existe validacion externa de la comunidad sobre la calidad de la conversion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ryugyosoft/granite-4.2-3b-onw
- Modelo base: https://huggingface.co/ibm-granite/granite-4.2-3b
- Coleccion Granite 4.2 Language Models: https://huggingface.co/collections/ibm-granite/granite-42-language-models
- Documentacion de IBM Granite 4.2: https://www.ibm.com/granite/docs/models/granite4-2
- Blog de IBM Research sobre Granite 4.2: https://research.ibm.com/blog/introducing-granite-4-2
- Pagina general de IBM Granite: https://www.ibm.com/granite
- Motor onw: https://huggingface.co/ryugyosoft/onw
- Documentacion tecnica de onw: https://huggingface.co/ryugyosoft/onw/blob/main/TECHNICAL.md
- Conversion recomendada para japones: https://huggingface.co/ryugyosoft/llm-jp-4.1-8b-thinking-onw
