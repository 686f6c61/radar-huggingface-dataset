# sairaph-official/Spark-X2.6-1.7B-aa2e08e

## Resumen

Spark-X2.6-1.7B es un modelo de lenguaje denso de 1.710 millones de parametros desarrollado por el SparkLLM Team (XHToken), presentado como el segundo miembro de la serie Spark-X2.6 tras el Spark-X2.6-4B. Se trata de un modelo de razonamiento: genera su cadena de pensamiento dentro de etiquetas `<think>…</think>` antes de emitir la respuesta final. La version aqui descrita es una conversion a LiteRT-LM (formato `.litertlm`) realizada por litert-torch 0.9.3 para LiteRT-LM 0.19.0, distribuida por sairaph-official como espejo sin modificaciones del repositorio upstream `litert-community/Spark-X2.6-1.7B`.

El modelo conserva la arquitectura de Spark-X2.5-1.7B y, segun su model card, obtiene su mejora de capacidad mediante un post-entrenamiento mas refinado. La arquitectura combina atencion con ventanas deslizantes de 512 tokens (tres capas de ventana por cada capa de atencion completa), puertas sigmoideas por cabeza sobre la salida de atencion, MLPs con GELU exacta y vocabulario ligado de 131.072 entradas. El resultado es un modelo pensado para inferencia en dispositivo (edge), con pesos cuantizados en int4/int8 y soporte de ejecucion en GPU de movil y de escritorio.

Su relevancia actual reside en el despliegue on-device: el fichero int4-mlp alcanza 27,4 tok/s en la GPU de un Galaxy S26 y 51,4 tok/s en la GPU de un iPhone 18 Pro, con una puntuacion GSM8K de 82 frente a 84 del modelo bf16, lo que lo situa como una opcion practica para asistentes locales con razonamiento sin depender de la nube. La licencia es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder denso con atencion de ventana deslizante hibrida (3 capas SW de 512 por cada capa full-attention), puertas sigmoideas por cabeza y MLP GELU con compuerta |
| Parametros totales | 1,71 mil millones (1.7B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible en la informacion proporcionada (las pruebas usan contextos de 2.048 y 4.096 tokens) |
| Tipos de cuantizacion | int4-mlp (atencion int8, MLP gate/up int4 blockwise-32 OCTAV, down y output int8, embedding int8) e int8 (dinamica por canal en todas las lineales y el embedding); modelo base en bf16 |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `.litertlm` (LiteRT-LM); modelo base en safetensors (no incluido en este repo) |

## Arquitectura y entrenamiento

El modelo es un decoder transformer denso de 28 capas con tamano oculto 2.048, 8 cabezas de consulta y 2 cabezas KV de 256 dimensiones cada una. Emplea un esquema de atencion hibrida en el que tres capas de ventana deslizante de 512 tokens se intercalan por cada capa de atencion completa, lo que reduce el coste de atencion en secuencias largas. Sobre la salida de atencion aplica puertas sigmoideas por cabeza, y sus MLPs usan GELU exacta con compuerta. El vocabulario esta ligado (tied) y tiene 131.072 entradas.

No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO; la model card solo indica que la mejora respecto a Spark-X2.5-1.7B proviene de un post-entrenamiento mejorado. La innovacion tecnica destacable es la conversion a LiteRT-LM con recetas de cuantizacion mixtas (int4 blockwise-32 OCTAV en las proyecciones gate/up del MLP) y el uso de operaciones compuestas de GPU para las escrituras de KV-cache y los productos de atencion, con activaciones fp32 en GPU. El template de prompt abre el bloque de pensamiento igual que el chat template del proveedor y los ficheros declaran un canal `thought`, de modo que LiteRT-LM mantiene el razonamiento separado de la respuesta.

## Capacidades

- Generacion de texto con modo de razonamiento explicito: produce cadenas de pensamiento dentro de `<think>…</think>` antes de responder.
- Razonamiento aritmetico y resolucion de preguntas de respuesta corta: 8/8 en el conjunto de prueba del autor en todas las configuraciones probadas (CPU y GPU, int4-mlp e int8, Mac, Galaxy S26, Pixel 11 Pro e iPhone 18 Pro).
- Conversacion multi-turno: supera una prueba de 3 turnos (plantar un hecho, operar aritmeticamente, recuperar el hecho) en GPU con ambos ficheros y en CPU.
- Control de esfuerzo de razonamiento mediante `reasoning_effort` (valor `low` probado): 8/8 con int8 y 7/8 con int4-mlp.
- Capacidad multilingue: no disponible (la model card no detalla idiomas; las pruebas incluyen una pregunta de traduccion).
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible de forma explicita; el modo de pensamiento es el unico mecanismo de razonamiento documentado.
- Vision y audio: no disponibles.

## Casos de uso

- Asistentes locales en movil: el fichero int4-mlp se ejecuta en la GPU de un Galaxy S26 a 27,4 tok/s y en la de un iPhone 18 Pro a 51,4 tok/s, lo que permite un asistente conversacional con razonamiento sin conexion a la nube.
- Razonamiento aritmetico y QA de respuesta corta en dispositivo: con 8/8 en el conjunto de preguntas del autor (aritmetica, capitales, comparaciones decimales, traduccion), es adecuado para tareas de consulta puntual embebidas en apps.
- Conversaciones multi-turno con memoria de contexto: supera la prueba de tres turnos en GPU y CPU, por lo que sirve para dialogos con recuperacion de hechos dentro de la sesion.
- Aplicaciones de escritorio con aceleracion GPU: en Mac alcanza 151,5 tok/s con int8 en GPU, lo que lo hace viable para herramientas de productividad locales que requieran baja latencia.
- Modo de razonamiento controlado: con `reasoning_effort` en `low` reduce el coste de generacion (1.792 tokens de salida en la prueba) para escenarios donde prima la latencia sobre la profundidad del razonamiento.
- Integracion en pipelines LiteRT-LM: al ser un fichero `.litertlm` compatible con el CLI de LiteRT-LM (versiones 0.15.0 a 0.19.2 en Mac CPU), encaja en flujos de despliegue edge ya basados en este runtime.
- Prototipado de modelos de razonamiento en edge: su tamano de 1,7 GB y licencia Apache 2.0 facilitan experimentacion y redistribucion en productos comerciales.

## Benchmarks y rendimiento

| Metrica | int4-mlp | int8 | bf16 (referencia) |
|---|---|---|---|
| GSM8K | 82 | 80 | 84 |
| 8 preguntas cortas (Mac, GPU) | 8/8 | 8/8 | no disponible |
| 8 preguntas cortas (Galaxy S26, GPU) | 8/8 | 8/8 | no disponible |
| 8 preguntas cortas (iPhone 18 Pro, GPU) | 8/8 | 8/8 | no disponible |
| Decodificacion Galaxy S26 GPU (tok/s) | 27,4 | 25,8 | no disponible |
| Decodificacion iPhone 18 Pro GPU (tok/s) | 51,4 | 51,5 | no disponible |
| Decodificacion Mac GPU (tok/s) | 147,0 | 151,5 | no disponible |

Las mediciones de decodificacion usan 1.024 tokens de prefill y 256 tokens generados (medicion del 31-10-2026 con LiteRT-LM 0.19.0). No se han publicado resultados de MMLU, HumanEval ni otros benchmarks estandar en la informacion disponible.

## Requisitos de hardware

- VRAM/almacenamiento: el fichero int4-mlp ocupa 1.706 MB y el int8 1.836 MB; el repo completo pesa 1,7 GB.
- GPU de movil: Galaxy S26 (GPU, 27,4 tok/s con int4-mlp) e iPhone 18 Pro (GPU, 51,4 tok/s con int4-mlp).
- GPU de escritorio: Mac con GPU a 147,0 tok/s (int4-mlp) y 151,5 tok/s (int8).
- CPU: ambos ficheros funcionan en CPU (Mac y telefonos), aunque el autor recomienda GPU; en una de las pruebas con CPU el fichero int8 emitio un `</think>` literal y repitio la respuesta.
- Cabe en GPU consumer: si, dado su tamano inferior a 2 GB; no se especifican modelos concretos de GPU de escritorio mas alla de Mac.
- Opciones de despliegue: LiteRT-LM (CLI y API Python), con wheel de Android en PyPI y build nocturno de iOS (CLiteRTLM 0.19.0-20261029); no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: los valores de tok/s anteriores; no se proporcionan latencias de prefill ni de primera token.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | GSM8K | Licencia | Formato |
|---|---|---|---|---|---|
| Spark-X2.6-1.7B (int4-mlp) | 1,7B | no disponible | 82 | Apache 2.0 | litertlm |
| Spark-X2.6-1.7B (bf16) | 1,7B | no disponible | 84 | Apache 2.0 | safetensors (base) |
| Spark-X2.6-4B | 4B | no disponible | no disponible | Apache 2.0 | no disponible |
| Spark-X2.5-1.7B | 1,7B | no disponible | no disponible | no disponible | no disponible |

La informacion proporcionada solo permite comparar con los propios miembros de la serie Spark; no se dispone de datos de modelos de terceros de tamano o tarea comparable.

## Limitaciones y advertencias

- Riesgo de alucinacion: no se han publicado evaluaciones de veracidad; el modo de razonamiento no garantiza respuestas correctas (con `reasoning_effort` low, int4-mlp fallo 1 de 8 preguntas, respondiendo "purple" a la pregunta de rima).
- Inestabilidad en CPU: en una de las pruebas con CPU, el fichero int8 cerro la respuesta con un `</think>` literal y volvio a escribir la respuesta; el autor recomienda usar GPU.
- Contexto: la longitud maxima de contexto no esta documentada; las pruebas se limitaron a 2.048 y 4.096 tokens.
- Idiomas: no se especifican los idiomas soportados, lo que impide garantizar calidad multilingue.
- Tool calling y agentes: no documentados; no se debe asumir soporte de function calling.
- Compatibilidad: el fichero int4-mlp no carga con LiteRT-LM 0.15.0 en Mac CPU; el resto de versiones de 0.15.0 a 0.19.2 cargaron ambos ficheros.
- Licencia: Apache 2.0 permite uso comercial, pero el espejo solo conserva el fichero int4-mlp y la licencia; otros ficheros mencionados en la card upstream no estan incluidos.
- Advertencia de procedencia: este repositorio es un espejo no modificado; para la version oficial debe consultarse el repositorio upstream.

## Enlaces

- Repositorio del espejo: https://huggingface.co/sairaph-official/Spark-X2.6-1.7B-aa2e08e
- Repositorio upstream LiteRT-LM: https://huggingface.co/litert-community/Spark-X2.6-1.7B
- Modelo base: https://huggingface.co/XHToken/Spark-X2.6-1.7B
- Repositorio LiteRT-LM en GitHub: https://github.com/google-ai-edge/LiteRT-LM
- Licencia Apache 2.0: https://huggingface.co/XHToken/Spark-X2.6-1.7B/blob/main/LICENSE
