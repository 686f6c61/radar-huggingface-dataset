# Ekmek31/trenet-v2

## Resumen

trenet v2 es un modelo de lenguaje de 35 millones de parametros desarrollado por el usuario Ekmek31, entrenado desde cero para conversacion cotidiana en turco. Se trata de un transformer decoder-only de diseno propio, orientado a un unico idioma (turco) y a un caso de uso muy acotado: mantener charlas breves, recordar datos mencionados en la conversacion y seguir instrucciones simples. Su publicacion en Hugging Face se produce en noviembre de 2026, con licencia MIT y un repositorio de apenas 0,2 GB.

El modelo no compite con los grandes modelos fundacionales; su proposito declarado por el autor es explorar hasta donde puede llegar un modelo de este tamano en turco coloquial. Fue entrenado en un entorno domestico con una sola GPU, sobre aproximadamente 2.000 millones de tokens, con una fase de preentrenamiento seguida de un ajuste fino para conversacion. El contexto maximo es de 2048 tokens y el modelo se distribuye tanto en safetensors como en una version ONNX cuantizada a int8 para CPU.

Su relevancia practica es limitada pero ilustrativa: demuestra que es posible entrenar y desplegar un modelo conversacional funcional en turco en hardware de consumo, con velocidades de 400 a 900 tokens por segundo segun el entorno. Es una pieza experimental, no un modelo de produccion, y el propio autor advierte explicitamente de que no debe usarse para tareas serias.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (diseno propio del autor) |
| Parametros totales | 35.113.176 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | int8 (ONNX para CPU); pesos completos en safetensors |
| Idiomas soportados | turco (tr) |
| Licencia | MIT |
| Formato de pesos | safetensors, ONNX (model_cpu_int8.onnx) |

## Arquitectura y entrenamiento

trenet v2 es un transformer decoder-only de escala reducida, disenado especificamente por el autor para este proyecto. No se trata de una adaptacion de una arquitectura conocida (Llama, Mistral, Qwen u otras), sino de un diseno propio orientado a un modelo de 35 millones de parametros. La model card no detalla el numero de capas, dimensiones ocultas, numero de cabezas de atencion ni el tipo de tokenizador mas alla de indicar que es un tokenizer turco propio.

El entrenamiento se realizo en dos fases: un preentrenamiento sobre aproximadamente 2.000 millones de tokens y un posterior ajuste fino para conversacion. No se especifica la composicion del dataset, el numero exacto de tokens de la fase de ajuste ni si se emplearon tecnicas de RLHF, DPO o similares. Tampoco se documentan innovaciones tecnicas como decodificacion especulativa o atencion lineal. El autor indica que los detalles del conjunto de datos y del entrenamiento no se comparten.

## Capacidades

- Generacion de texto conversacional breve en turco: saludos, preguntas cotidianas, consejos simples.
- Memoria de contexto conversacional: recuerda datos mencionados previamente en la misma sesion (nombre, ciudad, preferencias).
- Seguimiento de instrucciones simples: listas cortas, respuestas de una sola frase o de una sola palabra.
- Calculos aritmeticos basicos mostrados paso a paso (porcentajes, sumas, restas), con verificacion externa opcional mediante un pequeno calculador integrado en el script de chat.
- No dispone de soporte documentado de tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni modo de pensamiento.
- Capacidad multilingue practicamente inexistente: solo turco.

## Casos de uso

- Demostracion educativa de entrenamiento de modelos: sirve para ilustrar el ciclo completo de preentrenamiento y ajuste conversacional en un modelo pequeno, con un repositorio ligero y un script de chat incluido.
- Chatbot de juguete o prototipo en turco: util para validar interfaces de conversacion o pipelines de inferencia antes de invertir en modelos mayores.
- Pruebas de despliegue en CPU: la version ONNX int8 permite ejecutar el modelo en portatiles sin GPU a 400-500 tokens/s, adecuado para entornos de test o demos en ferias.
- Generacion de respuestas cortas y plantillas: puede producir listas breves o frases de relleno en turco para maquetas de producto.
- Investigacion sobre modelos de un solo idioma a pequena escala: permite estudiar el comportamiento de un transformer diminuto entrenado exclusivamente en turco.
- Ejercicios de cuantizacion y benchmarking: la comparacion entre safetensors completo, ONNX int8 y modo `--compile` ofrece un caso practico para medir perdida de calidad y ganancia de velocidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente proporciona cifras de velocidad de inferencia:

| Entorno | Velocidad de generacion |
|---|---|
| CPU (Intel Core Ultra 7 265KF, 4 nucleos), int8 ONNX | ~400-500 tokens/s |
| GPU (RTX 5070 Ti) | ~550-600 tokens/s |
| GPU con `--compile` | hasta ~900 tokens/s |
| CPU con `--slow` (precision completa) | ~85 tokens/s |

El autor indica que la version int8 en CPU produce respuestas muy cercanas al modelo en precision completa, con una perdida estimada del 1%.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB en precision completa (35 M de parametros, ~140 MB en fp32); la version int8 ONNX ocupa aun menos.
- GPU recomendadas: no requiere GPU; funciona en cualquier GPU moderna. El autor cita una RTX 5070 Ti como referencia.
- Cabe en cualquier GPU de consumo e incluso en CPU. No necesita aceleradores dedicados.
- Opciones de despliegue: script `chat.py` incluido en el repositorio, con soporte para CUDA graph, `--compile` y `--device cpu`; ONNX Runtime para la version int8; PyTorch, tokenizers y safetensors como dependencias.
- Latencia y throughput: 400-900 tokens/s segun entorno, con un modelo de 2048 tokens de contexto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| trenet v2 | 35 M | 2048 | turco | MIT | Hugging Face |
| Modelos tipo SmolLM-135M | 135 M | 2048-8192 | multilingue | Apache 2.0 | Hugging Face |
| Modelos tipo Qwen2.5-0.5B | 0,5 B | 32 768 | multilingue | Apache 2.0 | Hugging Face |

No se dispone de datos de benchmarks que permitan comparar el rendimiento de trenet v2 con estas alternativas. La comparacion se limita a parametros, contexto y licencia. trenet v2 es sustancialmente mas pequeno que las alternativas citadas y esta especializado en un unico idioma.

## Limitaciones y advertencias

- El propio autor advierte de que el modelo no es una fuente de conocimiento: inventa respuestas verosimiles pero falsas en temas que desconoce.
- No es adecuado para texto largo, traduccion, generacion de codigo ni razonamiento real.
- Falla con frecuencia en acertijos y preguntas de atencion.
- Puede perder el hilo en conversaciones largas pese a disponer de 2048 tokens de contexto.
- Entrenado exclusivamente en turco; no se debe esperar ningun rendimiento en castellano ni en otros idiomas.
- Modelo experimental con 0 descargas y 0 likes en el momento de la consulta; sin validacion externa por parte de la comunidad.
- La licencia MIT permite uso comercial y modificacion, con la unica condicion de conservar el aviso de copyright.
- No se documentan sesgos especificos ni la composicion del dataset de entrenamiento, lo que impide evaluar riesgos de sesgo de forma rigurosa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Ekmek31/trenet-v2
