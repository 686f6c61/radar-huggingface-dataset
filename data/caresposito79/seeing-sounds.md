# caresposito79/seeing-sounds

## Resumen

Seeing sounds es un experimento de interpretabilidad y control de activaciones (activation steering) publicado como repositorio de HuggingFace por el usuario caresposito79. No es un modelo entrenado ni un conjunto de pesos: es un script (`seeing_sounds.py`) que carga Qwen2.5-1.5B-Instruct y manipula sus activaciones internas en tiempo de inferencia para inducir un sesgo hacia vocabulario de color cuando el modelo habla de sonidos. La idea central es "hacer que el modelo vea sonidos" sin reentrenar nada.

El método tiene tres piezas: una dirección "color menos sonido" calculada a partir de 12 pares de frases gemelas que solo difieren en el sentido (una sobre color, otra sobre sonido) leídas en la capa 14 de 28; una neurona extra junto a esa capa que se activa únicamente cuando el modelo trata un sonido, con un umbral y una dosis ajustables; y una suma de esa dirección multiplicada por la dosis sobre las activaciones cuando la neurona está encendida. Los pesos del modelo no se modifican: al retirar la neurona, las respuestas vuelven a ser idénticas, algo que el propio script verifica.

El interés del trabajo es doble. Por un lado, es una demostración reproducible y de bajo coste (unos 3 GB de descarga y alrededor de dos minutos en una RTX 5070) de cómo una intervención puntual sobre una sola capa puede alterar de forma medible la salida léxica de un transformer pequeño. Por otro, documenta con transparencia sus límites: 30 preguntas, una sola ejecución, dependencia de aritmética bfloat16 y un contador de colores con lista fija que infravalora.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5) con intervencion externa de activation steering; el repositorio no aporta pesos nuevos |
| Parametros totales | 1.500 millones aproximados, heredados de Qwen2.5-1.5B-Instruct; no disponible en la ficha del repositorio |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en la ficha del repositorio; heredada del modelo base Qwen2.5-1.5B-Instruct |
| Tipos de cuantizacion | no disponible; el script trabaja en bfloat16 |
| Idiomas soportados | ingles (en) |
| Licencia | no disponible |
| Formato de pesos | no disponible; no se publican pesos, solo el script que descarga Qwen2.5-1.5B-Instruct desde HuggingFace |

## Arquitectura y entrenamiento

El componente subyacente es Qwen2.5-1.5B-Instruct, un transformer decoder-only de aproximadamente 1.500 millones de parametros con 28 capas. Sobre el no hay ningun entrenamiento ni ajuste fino: la intervencion es puramente de inferencia. La capa elegida para leer y escribir representaciones es la 14 de 28, es decir, la mitad exacta de la profundidad de la red.

La construccion de la direccion sigue un esquema de diferencias de activaciones medias. Se usan 12 pares de frases gemelas identicas salvo por el sentido evocado (color frente a sonido); se registra la activacion en la capa 14 para cada miembro del par y se resta la media de sonido a la media de color. El vector resultante, la "flecha", tiene una longitud de 13,56 en la ejecucion de referencia. La neurona auxiliar se entrena con las respuestas del propio modelo a 20 preguntas sobre sonidos comparadas con 20 preguntas ajenas a los sentidos, y se caracteriza por un umbral de 7,712 y una escala de 1,943; su activacion se dispara por encima del 99 % de las palabras ordinarias. Cuando esta encendida, se suma a las activaciones la direccion multiplicada por la dosis. La comprobacion de reversibilidad (retirar la neurona y comparar respuestas) devuelve True.

## Capacidades

- Generacion de texto en ingles con el modelo base Qwen2.5-1.5B-Instruct sin ninguna modificacion permanente de pesos.
- Control de estilo lexico mediante activation steering: la dosis regula cuantos terminos de color aparecen en las respuestas sobre sonidos.
- Lectura de representaciones internas en una capa concreta (capa 14) y extraccion de direcciones semanticas por diferencia de medias.
- Entrenamiento de una neurona de deteccion de tema ("se esta hablando de un sonido") a partir de ejemplos generados por el propio modelo.
- Verificacion automatica de no interferencia: el script comprueba que sin la neurona las respuestas son identicas a las originales.
- Barrido experimental sobre 30 preguntas (10 de sentidos, 10 de conocimiento general, 10 creativas) a 6 dosis distintas.
- No dispone de tool calling, function calling, agentes, vision, audio ni modo de razonamiento explicito en la informacion disponible.

## Casos de uso

- Investigacion en interpretabilidad mecanicista: sirve como banco de pruebas minimo para estudiar como una direccion semantica extraida de pares contrastivos se traduce en cambios medibles en la salida del modelo, con coste de computo muy bajo.
- Docencia y divulgacion: el script completo, con umbral, dosis y contador de palabras, permite explicar activation steering en una sola sesion practica sin necesidad de cluster.
- Analisis de robustez y alineacion: el fenomeno observado (respuestas como "the sound blueberry is a beautiful and serene sound blueberry") es un ejemplo reproducible de degradacion controlada, util para estudiar como pequenas perturbaciones de activaciones rompen la coherencia.
- Validacion de metodologias de steering: la verificacion de reversibilidad incluida en el script es un patron reutilizable para otros experimentos que necesiten garantizar que la intervencion no altera el modelo cuando esta desactivada.
- Exploracion de extraccion de direcciones por contraste: la tecnica de los 12 pares de frases gemelas es directamente replicable para otras oposiciones semanticas (calor/frio, pasado/futuro) cambiando solo los pares de frases.
- Pruebas de reproducibilidad numerica: el autor documenta que en otra GPU o en CPU cambian algunas palabras por el redondeo de bfloat16, lo que lo convierte en un caso util para estudiar sensibilidad numerica en inferencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible (no hay MMLU, HumanEval, GSM8K ni similares). Lo que si se publica es la salida del propio experimento, con el recuento de palabras de color en las 10 respuestas de cada grupo segun la dosis.

| Dosis | Sentidos | Conocimiento general | Creativas |
|---|---|---|---|
| 0 | 0 | 14 | 3 |
| 1 | 2 | 14 | 3 |
| 2 | 3 | 14 | 3 |
| 4 | 9 | 14 | 4 |
| 8 | 14 | 14 | 5 |
| 16 | 22 | 14 | 6 |

Parametros de la neurona en la ejecucion de referencia: umbral 7,712; escala 1,943; longitud de la flecha 13,56; palabras de sonido por encima del umbral 0,70. Autocomprobacion con la neurona retirada: respuestas identicas, True.

## Requisitos de hardware

- Descarga inicial de aproximadamente 3 GB (pesos de Qwen2.5-1.5B-Instruct en bfloat16).
- Espacio en VRAM estimado: alrededor de 3 GB solo para pesos, mas el pequeno sobrecoste de las activaciones intermedias; cabe holgadamente en cualquier GPU de consumo con 6 GB o mas.
- GPU de referencia declarada por el autor: RTX 5070, con un tiempo de ejecucion de unos 2 minutos para el experimento completo.
- No se ha probado en Colab ni en CPU; el autor advierte que en CPU u otra GPU pueden cambiar algunas palabras por el redondeo de bfloat16.
- Dependencias: unicamente `torch` y `transformers` (`pip install torch transformers`).
- No se documentan opciones de despliegue tipo vLLM, llama.cpp, Ollama o TGI, ni cifras de latencia o throughput mas alla del tiempo total indicado.

## Comparativa con modelos similares

Este repositorio no es comparable a un modelo en el sentido habitual: no publica pesos ni un modelo entrenado, sino un script de intervencion sobre un modelo existente. La comparacion relevante es con su modelo base y con el tipo de artefacto.

| Artefacto | Parametros | Contexto | Que aporta | Licencia |
|---|---|---|---|---|
| caresposito79/seeing-sounds | no aplica (script) | no disponible | Intervencion de activation steering sobre la capa 14 | no disponible |
| Qwen/Qwen2.5-1.5B-Instruct | 1.500 millones aprox. | no disponible en la informacion proporcionada | Modelo base sin modificar | no disponible en la informacion proporcionada |
| Otros repositorios de interpretabilidad (SAE, steering vectors) | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparables entre estos artefactos en la informacion proporcionada.

## Limitaciones y advertencias

- El propio autor califica el test de pequeno: un modelo pequeno, 30 preguntas y una sola ejecucion. El modelo siempre escoge la palabra mas probable, por lo que repetir la ejecucion da las mismas respuestas.
- La reproducibilidad exacta esta ligada al hardware: en otra GPU o en CPU pueden cambiar algunas palabras por el distinto redondeo de la aritmetica bfloat16. No se ha probado en Colab ni en CPU.
- El contador de colores usa una lista fija de palabras e infravalora: "blueberry" no esta en la lista, pese a aparecer en las respuestas.
- En conocimiento general ya hay 14 palabras de color sin la neurona (el cielo azul, el arcoiris); lo relevante es que no cambian con la dosis. En las preguntas creativas el aumento es pequeno, de 3 a 6.
- El fenomeno de rechazo descrito en el articulo ("I'm sorry, I cannot describe the sound of a violin...") proviene de una intervencion distinta, con umbrales rebajados en muchas neuronas, y no forma parte de este script.
- No hay informacion sobre licencia, por lo que el uso comercial del repositorio no puede darse por permitido sin consultar al autor. La licencia del modelo base Qwen2.5-1.5B-Instruct tampoco aparece en la informacion proporcionada.
- El sesgo introducido degrada deliberadamente la coherencia de las respuestas; no es apto para uso en produccion tal cual.
- No hay datos sobre sesgos sociales, riesgo de alucinacion en tareas reales, ni evaluacion de calidad fuera del recuento de palabras de color.
- Idiomas: solo ingles, segun los metadatos y la propia model card.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/caresposito79/seeing-sounds
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- No se han encontrado en la informacion proporcionada otros enlaces a papers, blogs, repositorios de codigo o demos.
