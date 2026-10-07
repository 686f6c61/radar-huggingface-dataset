# groxaxo/QwenPaw-Flash-9B-heretic-MTP-GPTQPro-INT4-g64

## Resumen

QwenPaw-Flash-9B-heretic-MTP-GPTQPro-INT4-g64 es una cuantizacion INT4 de 4 bits del modelo SC117/QwenPaw-Flash-9B-heretic-MTP-GGUF, publicada por el usuario groxaxo en HuggingFace. No es un modelo nuevo: es un artefacto de compresion que preserva los pesos del modelo original (9.197.093.888 parametros) en un unico fichero GGUF de 8.471.015.072 bytes (7,889 GiB), frente a los 18.407.320.992 bytes de la fuente. La relevancia del repositorio es metodologica: documenta un experimento A/B de cuantizacion con GPTQ-Pro en el que se modifica la receta de cuantizacion (GAR, clipping MSE y MSE ponderado por activaciones) manteniendo identico el tamano de grupo (64), el presupuesto de bytes y los datos de calibracion.

El modelo hereda del original la arquitectura derivada de Qwen3.5, con 32 capas de decoder y un bloque MTP (multi-token prediction) embebido de 15 tensores que se conserva byte a byte y que permite decodificacion especulativa con draft-MTP en llama.cpp. Los idiomas declarados son ingles y chino, la licencia es Apache 2.0 y el unico formato publicado es GGUF con almacenamiento Q4_0, compatible con llama.cpp.

El interes practico para un desarrollador es doble: por un lado, dispone de un modelo de 9B en menos de 8 GiB que cabe en GPU de consumo; por otro, puede evaluar si la mejora de fidelidad de cuantizacion reportada (reduccion del 30,41 % en la divergencia KL respecto al modelo fuente a igual presupuesto de bits) se traduce o no en mejor rendimiento de tarea, algo que el propio autor no afirma.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder derivada de Qwen3.5, 32 capas de decoder, con bloque MTP (next-token prediction) embebido de 15 tensores |
| Parametros totales | 9.197.093.888 |
| Parametros activos | no disponible (no se documenta que sea MoE) |
| Longitud de contexto | no disponible (el ejemplo de uso de llama.cpp emplea -c 8192) |
| Tipos de cuantizacion | GPTQ-Pro INT4 simetrica, group size 64, indices de grupo secuenciales, damping 0,05; exportada a bloques Q4_0 de llama.cpp |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (fichero unico autocontenido, 8.471.015.072 bytes / 7,889 GiB) |

## Arquitectura y entrenamiento

No se aporta informacion sobre el entrenamiento del modelo base (numero de tokens, composicion del dataset, fases de RLHF o DPO): esos datos corresponden al modelo original SC117/QwenPaw-Flash-9B-heretic-MTP-GGUF y no se reproducen en esta ficha. Lo que si esta documentado es la arquitectura de cuantizacion. El proceso parte de un GGUF etiquetado como F16 en el nombre, pero cuya inspeccion revelo 258 tensores BF16 y 184 tensores F32, es decir, no habia pesos en F16 reales. Se cuantizaron las 32 capas del decoder, en concreto 200 matrices lineales, con GPTQ simetrico INT4 de grupo 64.

La innovacion de este repositorio es la receta GPTQ-Pro, un paquete de tres cambios aplicados simultaneamente respecto a la linea base: activacion de GAR (ordenacion de activaciones consciente del grupo), clipping MSE con exponente 2 (frente a 0 en la linea base) y MSE ponderado por activaciones. El presupuesto de bytes empaquetados del decoder es identico en ambos candidatos (3.730.440.192 bytes), de modo que la comparacion aisla la receta y no el ancho de bits. El bloque MTP se preserva intacto: los 15 tensores MTP y los 242 tensores protegidos o no cuantizados son byte a byte identicos a la fuente, y qwen35.nextn_predict_layers sigue valiendo 1. La exportacion a Q4_0 no es una segunda cuantizacion: cada escala g64 se repite para sus dos bloques Q4_0 de 32 valores y cada codigo INT4 se traslada exactamente, con verificacion de igualdad exacta de pesos representados en las 200 matrices.

## Capacidades

- Generacion de texto conversacional en ingles y chino, con plantilla de chat GGUF congelada antes del experimento.
- Razonamiento de un solo turno y multiturno: la evaluacion de fidelidad se hizo sobre 32 conversaciones y 7.168 posiciones de siguiente token.
- Generacion de codigo: el dominio "code" representa el 50 % de las filas de calibracion y evaluacion, y es donde la cuantizacion muestra mejor comportamiento relativo (KL de 0,027725 frente a 0,037360 de la linea base).
- Uso de herramientas (tool calling): el dominio "tools" (25 % del mix) registra la mayor reduccion relativa de KL (50,26 %), lo que sugiere preservacion de la distribucion en llamadas a funciones, aunque no se aportan benchmarks funcionales de tool calling.
- Decodificacion especulativa: el bloque MTP embebido permite usar draft-MTP en llama.cpp; en la prueba de humo se generaron 128 tokens sobre dos prompts, con 95 tokens de draft y 77 aceptados (ratio 0,8105).
- Capacidades multimodales, de audio o modo "thinking": no disponible.
- Generacion de embeddings o clasificacion: no disponible.

## Casos de uso

- Generacion de codigo en local: con 7,889 GiB de pesos cabe en una GPU de consumo y el dominio de codigo es el mejor preservado tras la cuantizacion (KL de 0,027725 en la evaluacion retenida), lo que lo hace util para autocompletado o generacion de funciones en entornos sin conexion.
- Asistente conversacional en ingles o chino: el modelo mantiene el template de chat GGUF y puede desplegarse con llama-server para conversaciones multiturno con contexto de 8.192 tokens, configuracion usada por el autor en la prueba de humo.
- Pipelines de agentes con tool calling: el dominio "tools" es el que mas mejora en KL (50,26 %) respecto a la cuantizacion plana, de modo que es un candidato razonable para agentes que emiten JSON de llamadas a funciones, siempre que se valide el comportamiento funcional con pruebas propias.
- Servicio de inferencia con decodificacion especulativa: el bloque MTP intacto permite activar draft-MTP en llama.cpp y reducir el numero de pasos de decodificacion; en la prueba de humo el 81,05 % de los tokens de draft fueron aceptados.
- Despliegue en estaciones de trabajo con una sola GPU de 12-24 GB: al ocupar menos de 8 GiB, deja margen para cache KV y contexto largo en tarjetas como la RTX 3090 (verificada por el autor) o la RTX 4090.
- Investigacion en cuantizacion: el repositorio documenta la receta completa (GAR, clipping MSE, MSE ponderado), los hashes SHA-256 de entrada y salida y las metricas de fidelidad, por lo que sirve como caso reproducible para comparar metodos de cuantizacion a igual presupuesto de bytes.
- Evaluacion comparativa de variantes de cuantizacion: al existir la linea base GPTQ INT4 g64 y el candidato GPTQ-Pro con los mismos datos de calibracion y evaluacion, es posible montar un A/B controlado de calidad de cuantizacion en un modelo de 9B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. Las unicas metricas publicadas miden fidelidad de cuantizacion respecto al modelo fuente, sobre 7.168 posiciones de siguiente token en 32 conversaciones retenidas (16.272 tokens de calibracion con una unica semilla):

| Metrica | GPTQ INT4 g64 (linea base) | GPTQ-Pro INT4 g64 (esta version) |
|---|---:|---:|
| KL(fuente || cuantizado), nats/token (menor es mejor) | 0,04767384 | 0,03317633 |
| NLL con teacher forcing, nats/token (menor es mejor) | 0,86555421 | 0,86474651 |
| Perplejidad (menor es mejor) | 2,37632271 | 2,37440411 |
| Acuerdo top-1 con la fuente (mayor es mejor) | 94,6708 % | 95,0893 % |
| Bytes empaquetados del decoder | 3.730.440.192 | 3.730.440.192 |

Resultados por dominio:

| Dominio | KL linea base | KL GPTQ-Pro | Reduccion de KL | NLL linea base | NLL GPTQ-Pro |
|---|---:|---:|---:|---:|---:|
| code | 0,037360 | 0,027725 | 25,79 % | 0,623752 | 0,615063 |
| chat | 0,044814 | 0,041858 | 6,60 % | 1,562746 | 1,574647 |
| tools | 0,071162 | 0,035396 | 50,26 % | 0,651966 | 0,654212 |

La mejora de KL emparejada por bootstrap de conversaciones fue de 0,01449751 nats/token con intervalo de confianza al 95 % de [0,00588705, 0,02662250], positivo en este experimento. La mejora de NLL fue de 0,00080771 nats/token con intervalo [-0,01161773, 0,01413270], que incluye el cero, por lo que el autor no la considera estadisticamente establecida. La perplejidad cambio un 0,081 %. En chat y tools el NLL empeoro ligeramente.

Sobre decodificacion especulativa, la unica cifra disponible es una prueba de humo funcional: 95 tokens de draft generados, 77 aceptados (ratio 0,8105) al generar 128 tokens sobre dos prompts en una RTX 3090. El autor advierte que no es un benchmark de throughput ni representativo de speculative decoding.

## Requisitos de hardware

- VRAM para los pesos: aproximadamente 7,9 GiB (8.471.015.072 bytes), a los que hay que sumar la cache KV y el overhead del runtime.
- GPU verificada por el autor: RTX 3090 (24 GB), con carga completa de capas (-ngl 99), contexto de 8.192 y flash attention activada.
- Cabe en GPU de consumo: si, siempre que dispongan de al menos 12 GB de VRAM para contexto moderado (estimacion a partir del tamano de pesos; el fabricante no publica la configuracion exacta de cache KV, por lo que el margen real con contexto largo es no disponible). Con 8 GB de VRAM el margen es insuficiente para contexto util.
- GPU recomendadas: RTX 3090, RTX 4090, RTX 4080, A100, H100; en todas ellas el modelo ocupa una fraccion pequena de memoria y el limite practico pasa a ser el ancho de banda de memoria y el contexto.
- Opciones de despliegue: llama.cpp (llama-server o llama-cli) con soporte de Qwen3.5 y draft-MTP embebido. Otros runtimes (Ollama, vLLM, TGI, TensorRT-LLM): no disponible en la informacion proporcionada.
- Comando de referencia: ./llama-server -m QwenPaw-Flash-9B-heretic-MTP-GPTQPro-INT4-g64.gguf -ngl 99 -c 8192 -fa on, con las opciones de draft-MTP correspondientes.
- Latencia y throughput: no disponible. La unica cifra relacionada es el ratio de aceptacion de draft de 0,8105 en una prueba de humo de 128 tokens, que no permite estimar tokens por segundo.

## Comparativa con modelos similares

La busqueda web no devolvio resultados relevantes sobre modelos comparables (los resultados obtenidos eran correctores ortograficos en frances, sin relacion con el modelo). La unica comparacion documentada es con el modelo fuente del que deriva este artefacto:

| Modelo | Parametros | Contexto | Formato | Tamano | Licencia | Fidelidad |
|---|---|---|---|---|---|---|
| groxaxo/QwenPaw-Flash-9B-heretic-MTP-GPTQPro-INT4-g64 | 9,20 B | no disponible (ejemplo con 8.192) | GGUF Q4_0 | 7,889 GiB | apache-2.0 | KL 0,03317633 nats/token frente a la fuente |
| SC117/QwenPaw-Flash-9B-heretic-MTP-GGUF (fuente) | 9,20 B | no disponible | GGUF (BF16/F32) | 18.407.320.992 bytes (17,14 GiB) | apache-2.0 | referencia (KL 0 por definicion) |
| Otros modelos de ~9B comparables | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El nombre incluye el termino "heretic", habitual en variantes con el alineamiento de seguridad reducido (abliterated o decensored). No se documenta el proceso ni su alcance en la informacion disponible, por lo que conviene evaluar el comportamiento en materia de rechazos y contenido sensible antes de cualquier uso en produccion.
- Riesgo de alucinacion: inherente a los modelos generativos de esta escala; no se publican evaluaciones de veracidad.
- La cuantizacion INT4 introduce una divergencia de 0,03317633 nats/token respecto al modelo fuente y solo reproduce la decision top-1 en el 95,0893 % de las posiciones evaluadas, es decir, hay aproximadamente un 4,9 % de posiciones donde la prediccion mas probable cambia.
- La mejora de NLL respecto a la cuantizacion plana no es estadisticamente significativa (el intervalo de confianza al 95 % incluye el cero) y en los dominios de chat y herramientas el NLL empeora ligeramente. No debe presentarse como una mejora general de precision.
- La evaluacion de calibracion y validacion uso una unica semilla y 32 conversaciones, con un mix fijo de 50 % codigo, 25 % chat y 25 % herramientas; no es un benchmark de tareas ni de tool calling en produccion.
- El ratio de aceptacion de 0,8105 procede de una prueba de humo de 128 tokens sobre dos prompts y no es extrapolable a throughput real.
- Idiomas limitados a ingles y chino: el rendimiento en castellano u otras lenguas no esta documentado y previsiblemente sera inferior.
- Licencia Apache 2.0, que permite uso comercial, pero el artefacto deriva de un modelo base de terceros (SC117); conviene verificar las condiciones de ese repositorio antes de redistribuir.
- Adopcion muy baja: 15 descargas y 0 likes en el momento de redactar esta ficha, sin validacion independiente de la comunidad.
- El nombre del fichero fuente incluye "F16" aunque los tensores son BF16 y F32; cualquier comparacion de tamano basada en el nombre del fichero seria erronea.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/groxaxo/QwenPaw-Flash-9B-heretic-MTP-GPTQPro-INT4-g64
- Modelo base: https://huggingface.co/SC117/QwenPaw-Flash-9B-heretic-MTP-GGUF
- Revision de la fuente citada en la model card: 805a37e8d1277f7db31347283017afb26a04e5a4
- llama.cpp (runtime requerido, con soporte de Qwen3.5 y draft-MTP): https://github.com/ggml-org/llama.cpp
- Paper o blog del metodo GPTQ-Pro: no disponible
- Demos o espacios asociados: no disponible
