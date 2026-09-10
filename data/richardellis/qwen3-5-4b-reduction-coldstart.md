# RichardEllis/qwen3.5-4b-reduction-coldstart

## Resumen

Qwen3.5-4B — reduction cold start es un ajuste fino del modelo base Qwen/Qwen3.5-4B desarrollado por el usuario RichardEllis. No es un solucionador de problemas matematicos, sino un **reductor de problemas**: dado un enunciado y un prefijo de cadena de pensamiento (CoT) producido por otro resolutor, reescribe el problema como uno mas simple y autocontenido que incorpora el progreso util del prefijo y conserva estrictamente la respuesta final original. El modelo es un componente de un pipeline mayor, pensado para alimentar a un resolutor que nunca ve el enunciado ni el prefijo originales.

Se trata de un **cold start para aprendizaje por refuerzo**, no de un modelo terminado. La etapa de SFT se ajusto para obtener formato de salida y diversidad conductual (mezcla de cuatro profesores distintos), no para maximizar calidad media. El propio autor advierte que el modelo no supera a su baseline en tasa de resolucion posterior: de hecho la empeora en 0,083 puntos absolutos.

El modelo tiene 4.205.751.296 parametros (unos 4,2 B, correspondientes unicamente a la torre de lenguaje) y deriva de la arquitectura Qwen3.5. Su relevancia es acotada y experimental: sirve como inicializacion de alta entropia para pipelines de RL sobre razonamiento matematico, no como herramienta de produccion. El repositorio acumula 0 descargas y 0 likes, y fue publicado el 10 de septiembre de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5); config declarada como `Qwen3_5ForConditionalGeneration`, pero los pesos son solo de la torre de lenguaje |
| Parametros totales | 4.205.751.296 (4,2 B), repartidos en 426 tensores de la torre de lenguaje |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (el filtrado de entrenamiento limito las secuencias a 16.384 tokens y los bloques de pensamiento a 8.192) |
| Tipos de cuantizacion | No disponible: solo se publican pesos sin cuantizar en safetensors; no hay GGUF ni GPTQ/AWQ |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache 2.0, heredada de Qwen/Qwen3.5-4B |
| Formato de pesos | Safetensors (tamano del repositorio: 8,4 GB) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-4B y se ajusta con LoRA de rango 64 y alpha 128 aplicado sobre las proyecciones q, k, v, o, gate, up y down, con posterior fusion de los adaptadores en los pesos base. El conjunto de entrenamiento consta de 1.418 muestras destiladas de cuatro profesores distintos (Qwen3.8-Max, Kimi K3, GLM-5.3 y DeepSeek-V4-Pro) sobre 400 celdas de problema/prefijo, filtradas para que el bloque de pensamiento no superase 8.192 tokens y la secuencia completa 16.384. Aproximadamente el 25 % de los prefijos son deliberadamente incorrectos, de modo que el modelo ve ambos niveles de calidad. El entrenamiento duro 170 pasos sobre 2xA100, con perdida de 1,082 a 0,674 y perdida de evaluacion decreciente de forma monotona.

La innovacion tecnica no esta en la arquitectura, sino en la tarea: el modelo aprende a *reformular* en lugar de resolver, siguiendo un system prompt fijo que forma parte del contrato de uso (reglas de no verificar el prefijo, no resolver, preservar la respuesta y reenunciar sin anotar). La salida no usa etiquetas: es un bloque de pensamiento nativo de Qwen seguido del problema reducido en texto plano, de forma que todo lo que aparece despues del ultimo `</think>` constituye la reduccion. La mezcla de cuatro profesores busca una distribucion conductual amplia, adecuada como inicializacion de RL de alta entropia, a costa de la calidad media.

Existe un problema conocido de configuracion: el `config.json` heredado declara vision tower (`vision_config`), pero el checkpoint solo contiene los 426 tensores de lenguaje. La fusion LoRA se hizo a traves de `AutoModelForCausalLM`, que nunca cargo la torre de vision. La configuracion se deja intacta porque las claves de pesos usan el esquema `ForConditionalGeneration` y reescribir el campo de arquitectura romperia la carga. No deben pasarse imagenes ni video.

## Capacidades

- Reduccion de problemas matematicos: reescribe un enunciado incorporando el progreso util de un prefijo de CoT, manteniendo la respuesta final.
- Generacion de bloques de pensamiento (thinking mode) mediante `enable_thinking=True` en la plantilla de chat.
- Descarte de pasos erroneos del prefijo cuando la inconsistencia se revela durante la propia reduccion.
- Reformulacion libre: permite renombrar variables, cambiar lo que se pregunta y alterar el marco narrativo, siempre que la respuesta se preserve.
- Modo de respaldo: si el prefijo no aporta progreso util, reproduce el problema original de forma literal.
- Manejo de entradas en ingles unicamente; no hay capacidades multilingues declaradas.
- No dispone de soporte de tool calling, function calling ni comportamiento de agente multi-paso.
- No dispone de capacidades de vision ni audio: la torre multimodal esta ausente del checkpoint.

## Casos de uso

- Generacion de datos sinteticos para RL sobre razonamiento matematico: el modelo produce pares (problema original + prefijo, problema reducido) que sirven como experiencia inicial de alta diversidad conductual para una politica que despues se optimiza con RL.
- Cold start de pipelines de SFT: al estar ajustado para formato y diversidad y no para calidad media, encaja como punto de partida antes de etapas de filtrado o preferencia, no como modelo final.
- Aumento de datos para entrenar resolutores: las reducciones generadas amplian el espacio de enunciados manteniendo la respuesta, aunque deben filtrarse porque la tasa de preservacion de respuesta medida es del 81 % sobre las reducciones parseables.
- Investigacion en reduccion de problemas (*problem reduction*) como tarea desacoplada de la resolucion: el modelo permite estudiar si reformular un enunciado ayuda a un resolutor independiente, con la salvedad de que el resultado medido es negativo.
- Preprocesado de prefijos de CoT en cadenas multi-modelo: dado un prefijo parcial de otro sistema, el modelo lo pliega en un enunciado autocontenido apto para un resolutor que no ve el contexto previo.
- Estudio de sensibilidad al prefijo: con un 25 % de prefijos incorrectos en entrenamiento, el modelo es util para analizar como reacciona un reductor ante progreso parcialmente erroneo.
- No debe usarse para atencion al cliente, generacion de codigo en produccion, agentes ni ninguna tarea fuera de la reduccion de problemas matematicos en ingles.

## Benchmarks y rendimiento

Evaluacion sobre 30 celdas reservadas, sin solapamiento de problemas con el entrenamiento:

| Metrica | Resultado |
|---|---|
| Reducciones parseables | 27/30 (3 alcanzaron el limite de generacion) |
| Respuesta preservada (resolucion ciega por un modelo fuerte) | 21/26 = 81 % |
| Tasa de resolucion posterior, objetivo Qwen3.5-4B, n=8 | 0,449 frente a 0,532 del baseline (−0,083) |
| Longitud media de pensamiento | 8.370 tokens |

Perdida de entrenamiento: 1,082 → 0,674 en 170 pasos. El autor no publica comparaciones con MMLU, GSM8K, HumanEval ni otros benchmarks estandar. La tasa de resolucion posterior es netamente negativa respecto al baseline, y la longitud media de pensamiento se situo en 8.370 tokens frente a un objetivo de 2.000, es decir, el modelo convergio al limite superior de sus profesores y en ocasiones agota la generacion sin producir salida.

## Requisitos de hardware

- VRAM en precision completa (safetensors, 4,2 B de parametros): aproximadamente 8,4 GB solo de pesos; en torno a 10-12 GB contando overhead de runtime y cache KV. Estimacion propia, no publicada por el autor.
- VRAM con cuantizacion de 8 bits: aproximadamente 5 GB. Con 4 bits: aproximadamente 3 GB. Requiere conversion propia, ya que no se publican pesos cuantizados.
- GPU recomendadas: el autor entreno con 2xA100. Para inferencia, una unica A100 o H100 es sobredimensionada; una RTX 4090 (24 GB) o incluso GPUs de 12-16 GB son suficientes en precision completa.
- Cabe en GPU de consumo: si. Cualquier GPU con 10 GB o mas de VRAM puede servirlo en fp16, y con cuantizacion a 4 bits cabria en GPUs de 4-6 GB.
- Opciones de despliegue: vLLM esta verificado por el autor y fue el metodo usado en toda la evaluacion. Transformers con `AutoModelForCausalLM` es la via de carga directa. llama.cpp y Ollama requeririan convertir los pesos a GGUF, operacion no publicada y que puede verse afectada por la configuracion multimodal declarada.
- Latencia y throughput: no disponibles. El uso de bloques de pensamiento de 8.370 tokens de media encarece notablemente la generacion frente a un modelo de longitud de salida tipica.
- Advertencia de despliegue: no pasar imagenes ni video bajo ninguna circunstancia; la torre de vision no existe en el checkpoint.

## Comparativa con modelos similares

No se dispone de datos verificables de otros modelos de reduccion de problemas en la informacion proporcionada, por lo que la comparacion se limita a su propio baseline:

| Modelo | Parametros | Contexto | Tasa de resolucion posterior (n=8) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RichardEllis/qwen3.5-4b-reduction-coldstart | 4,2 B | No disponible (entrenado a ≤16.384 tokens) | 0,449 | Apache 2.0 | HuggingFace, 0 descargas |
| Qwen/Qwen3.5-4B (baseline) | No disponible en la informacion proporcionada | No disponible | 0,532 | Apache 2.0 | HuggingFace (modelo base) |

Otras alternativas de la misma categoria (modelos pequenos orientados a razonamiento matematico o a generacion de datos para RL): no disponible.

## Limitaciones y advertencias

- La tasa de resolucion posterior es netamente negativa (−0,083 frente al baseline): no debe usarse esperando reducciones que ayuden a un resolutor.
- El autor lo describe explicitamente como un cold start para RL, no como un modelo terminado ni apto para uso directo.
- La tasa de preservacion de respuesta es del 81 % sobre las reducciones parseables, y 3 de cada 30 celdas agotaron el limite de generacion sin salida.
- El modelo depende de un system prompt concreto: sin ese mensaje exacto y el layout de usuario entrenado, el comportamiento se degrada notablemente.
- Longitud de pensamiento desmedida (8.370 tokens de media frente a un objetivo de 2.000), lo que encarece la inferencia y aumenta la probabilidad de agotar el presupuesto de generacion.
- Solo ingles. No hay soporte multilingue.
- Sesgos conocidos: no documentados por el autor; al derivar de Qwen3.5-4B hereda los sesgos del modelo base, no evaluados en la informacion disponible.
- Riesgo de alucinacion: la tarea exige conservar la respuesta original, y en un 19 % de los casos evaluados no lo consigue; introducir derivaciones no criticas esta permitido por el prompt, lo que abre la puerta a errores silenciosos.
- Limitacion tecnica de carga: el `config.json` declara una arquitectura multimodal sin torre de vision. No pasar imagenes ni video. Cualquier herramienta que intente cargar el modelo como conditional generation fallara o se comportara de forma inesperada.
- Licencia Apache 2.0 heredada, sin restricciones adicionales documentadas para uso comercial, aunque el propio rendimiento del modelo desaconseja ese uso.
- Repositorio sin traccion: 0 descargas y 0 likes en la fecha de publicacion, sin validacion externa de los resultados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/RichardEllis/qwen3.5-4b-reduction-coldstart
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- La busqueda web realizada no devolvio ningun enlace relevante sobre este modelo: los resultados obtenidos correspondian a contenido no relacionado (imagenes de la catedral de Ratisbona). No se dispone de papers, blogs, repositorios ni demos adicionales.
