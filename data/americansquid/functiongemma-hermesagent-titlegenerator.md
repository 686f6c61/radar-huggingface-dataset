# americansquid/FunctionGemma-HermesAgent-TitleGenerator

## Resumen
FunctionGemma-HermesAgent-TitleGenerator es un ajuste fino de `google/functiongemma-270m-it` (268.098.176 parametros) publicado por el usuario americansquid en HuggingFace. Su funcion no es conversar, sino generar un titulo de 3 a 7 palabras que resuma la primera peticion de un usuario en una sesion de chat, y devolverlo exclusivamente como una llamada a herramienta `set_session_title` en la sintaxis de FunctionGemma, no como texto libre ni JSON.

El modelo resuelve un problema muy concreto de producto: nombrar automaticamente sesiones en asistentes conversacionales, manteniendo terminos tecnicos y en miniscula tipo frase. Al estar construido sobre un modelo de 270M de parametros, es desplegable en CPU o en cualquier GPU de consumo, lo que lo hace atractivo para tareas auxiliares de alto volumen y bajo coste.

Es relevante ahora porque ejemplifica una tendencia practica: modelos diminutos especializados en tool calling para microtareas de infraestructura (titulado, enrutado, etiquetado), en lugar de usar un modelo grande para todo. El autor publica ademas el dataset, las predicciones de evaluacion y el manifiesto de entrenamiento, lo que permite auditar el proceso, aunque el numero de descargas (6) indica que aun no tiene validacion comunitaria.

## Especificaciones tecnicas
| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (tag `gemma3_text`), derivado de `google/functiongemma-270m-it` |
| Parametros totales | 268.098.176 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible; el checkpoint publicado contiene pesos en precision completa (el ejemplo de la model card carga en `float32`) |
| Idiomas soportados | no disponible; el dataset, las instrucciones de desarrollador y la plantilla estan en ingles |
| Licencia | no disponible en el repositorio (el modelo base es de Google y arrastra sus propios terminos de uso) |
| Formato de pesos | safetensors (junto con tokenizer, generation config y chat template; el repo incluye ademas checkpoints, dataset y predicciones en JSONL) |

## Arquitectura y entrenamiento
La base es `google/functiongemma-270m-it`, un transformer decoder-only con soporte nativo de llamadas a herramienta. El ajuste es un SFT supervisado sobre 25.000 filas (20.000 de entrenamiento, 2.500 de validacion, 2.500 de test, semilla 42), con 3 epocas y tasa de aprendizaje 5e-6. La perdida se calcula unicamente sobre la completacion del asistente: prompt y padding estan enmascarados con -100, de modo que el modelo aprende el formato de la llamada y no a reproducir instrucciones. Los datos se generaron con el metodo declarado `reproduced_model_inference`.

El resultado registrado es una perdida de entrenamiento de 0.3967 y de evaluacion de 0.3131, con un tiempo de ejecucion de aproximadamente 2.78 horas en el entorno declarado (PyTorch 2.11.0+cu128, Transformers 5.18.0, Datasets 4.8.5, Accelerate 1.14.0). El modelo emite la sintaxis propia de FunctionGemma, no JSON: por ejemplo `<start_function_call>call:set_session_title{title:<escape>Compare algorithms A and B<escape>}<end_function_call>`. La model card no menciona RLHF, DPO ni innovaciones de atencion; la unica especializacion es el formato de salida y el prompt de titulado incluido en `hermes_prompt.txt`. La revision exacta del modelo base no quedo registrada en el manifiesto (`null`), lo que limita la reproducibilidad estricta.

## Capacidades
- Generacion de titulos de sesion de 3 a 7 palabras en formato de frase (sentence case) a partir del primer mensaje del usuario.
- Emision de una unica llamada a herramienta `set_session_title` con el titulo como argumento, en la sintaxis de FunctionGemma.
- Preservacion de terminos tecnicos dentro del titulo.
- Descripcion del tema o tarea del usuario, en lugar de responder a su peticion.
- No dispone de capacidades de generacion de texto general, razonamiento abierto, codigo, matematicas o vision declaradas en la informacion disponible.
- Soporte de tool calling: si, limitado al contrato definido por el autor (una herramienta, un argumento de tipo cadena).
- Soporte de agentes y razonamiento multi-paso: no declarado.
- Capacidades multilingues: no declaradas; el material de entrenamiento esta en ingles.

## Casos de uso
- Titulado automatico de sesiones en asistentes conversacionales: el modelo recibe el primer mensaje, emite la llamada `set_session_title` y la aplicacion valida la estructura y el recuento de palabras antes de guardar el titulo. Es adecuado porque su salida esta restringida a un contrato verificable con una expresion regular.
- Higiene de historiales largos: en herramientas de chat con cientos de conversaciones, permite etiquetar cada hilo al abrirlo y facilitar la busqueda posterior por tema, sin coste de inferencia apreciable al ser un modelo de 270M.
- Despliegue en el borde o en CPU: para productos que no pueden enviar el primer mensaje del usuario a un proveedor externo, el modelo puede ejecutarse localmente y devolver solo el titulo, reduciendo la exposicion de datos.
- Agroparacion tematica y analitica de producto: los titulos generados pueden agruparse para estudiar que temas consultan los usuarios, ya que el formato prefijado (3 a 7 palabras, terminos tecnicos preservados) homogeneiza las etiquetas.
- Enrutado previo en pipelines multi-modelo: el titulo o la llamada generada puede servir como senal barata para decidir que modelo o herramienta grande atiende despues la peticion.
- Bancos de pruebas de ajuste fino en tool calling: al publicar dataset, predicciones y manifiesto, sirve como caso de estudio reproducible de SFT sobre un modelo pequeno, util para equipos que quieran replicar la receta con su propio dominio.
- Generacion de asuntos en sistemas de tickets o correo: el mismo contrato de salida encaja en cualquier flujo que necesite una etiqueta corta en lugar de una respuesta completa.

## Benchmarks y rendimiento
Metricas de generacion publicadas en la model card, comparando el modelo base con el ajustado sobre 16 ejemplos de test (a pesar de que la particion de test contiene 2.500 filas):

| Metrica | Modelo base | Modelo ajustado |
|---|---:|---:|
| Llamada valida | 50,00 % | 100,00 % |
| Cumplimiento de reglas de titulo | 18,75 % | 100,00 % |
| Coincidencia exacta | 0,00 % | 6,25 % |
| F1 de tokens | 0,1712 | 0,4558 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. La implementacion exacta de las metricas no se incluye; el autor remite a los ficheros de predicciones por ejemplo.

## Requisitos de hardware
- VRAM estimada para inferencia, calculada a partir de los 268.098.176 parametros: aproximadamente 1,1 GB en float32, 0,55 GB en float16/bfloat16, 0,27 GB en int8 y 0,14 GB en int4 (estimaciones derivadas del recuento de parametros, no medidas publicadas).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; cabe en RTX 3060, RTX 4090, A100, H100 y en GPUs integradas modestas. No requiere aceleradores de gama alta.
- Inferencia en CPU: viable, como demuestra el propio ejemplo de la model card, que carga el modelo en CPU con `torch.float32`.
- Opciones de despliegue: el ejemplo oficial usa Transformers con `AutoModelForCausalLM` y `AutoTokenizer`; no se declaran integraciones probadas con vLLM, llama.cpp, Ollama o TGI, por lo que su uso con esos motores queda como no verificado en la informacion disponible.
- Latencia y throughput: no disponibles. El unico dato temporal registrado es la duracion del entrenamiento (aproximadamente 2,78 horas), no de la inferencia.
- Nota de almacenamiento: el repositorio ocupa 3,3 GB porque incluye checkpoints intermedios, estados del optimizador, dataset y predicciones, muy por encima del peso real de los pesos finales.

## Comparativa con modelos similares
| Modelo | Parametros | Especializacion | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| FunctionGemma-HermesAgent-TitleGenerator | 268,1 M | Titulado de sesiones via tool call | no disponible | no disponible | HuggingFace, 6 descargas |
| `google/functiongemma-270m-it` (modelo base) | 270 M (aprox.) | Tool calling general e instrucciones | no disponible | terminos de Google (no detallados aqui) | HuggingFace, ampliamente distribuido |
| `google/gemma-3-270m-it` | 270 M (aprox.) | Asistente generalista pequeno | no disponible | terminos de Google (no detallados aqui) | HuggingFace |

No se dispone de datos de rendimiento comparables de terceros en la informacion proporcionada: las unicas cifras disponibles son la comparacion interna base frente a ajustado de la propia model card. Cualquier modelo alternativo de la misma categoria (asistentes de menos de 1.000 M de parametros) tendria que evaluarse con el mismo conjunto de 2.500 ejemplos de test antes de extraer conclusiones.

## Limitaciones y advertencias
- La licencia no esta declarada en el repositorio; al derivar de un modelo de Google, es imprescindible verificar los terminos aplicables antes de cualquier uso comercial.
- La evaluacion publicada se realizo sobre 16 ejemplos, no sobre las 2.500 filas de test, por lo que los porcentajes de exito no son extrapolables al conjunto completo, a otros idiomas ni a otros dominios.
- La coincidencia exacta con el titulo de referencia es del 6,25 %, lo que indica que el modelo cumple el formato pero rara vez reproduce literalmente el titulo esperado; hay que decidir si eso es aceptable para el producto.
- El material de entrenamiento esta en ingles; no hay evidencia de comportamiento correcto en castellano u otros idiomas, y podria degradar el formato o la calidad del titulo.
- Riesgo de alucinacion en el contenido del titulo: puede introducir terminos tecnicos que el usuario no menciono, ya que la tarea exige describir un tema a partir de un mensaje breve.
- La salida debe parsearse y validarse siempre antes de usarse (estructura de la llamada, un unico argumento de tipo cadena y recuento de 3 a 7 palabras); el autor advierte explicitamente de que la aplicacion debe comprobar la calidad del titulo y las reglas de producto.
- Es necesario gestionar correctamente el token de parada `<start_function_response>` ademas de los tokens de fin de secuencia, o la generacion puede continuar mas alla de la llamada util.
- La revision del modelo base no quedo registrada (`null`), y el script de entrenamiento no se incluye en el paquete, lo que dificulta la reproducibilidad exacta.
- La model card indica que no se ejecuto inferencia mientras se preparaba el README; el ejemplo de uso no fue verificado por el autor en ese momento.
- Con solo 6 descargas y 0 likes, no existe validacion independiente de la comunidad sobre este checkpoint.

## Enlaces
- Modelo en HuggingFace: https://huggingface.co/americansquid/FunctionGemma-HermesAgent-TitleGenerator
- Modelo base: https://huggingface.co/google/functiongemma-270m-it
- La busqueda web realizada no devolvio resultados relevantes sobre este modelo (unicamente paginas de un medio de noticias), por lo que no hay papers, blogs, repositorios ni demos adicionales que enlazar.
