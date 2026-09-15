# graafhenk/numberwang

## Resumen

WangNet es un clasificador de texto a nivel de caracter publicado por el usuario graafhenk en Hugging Face bajo el identificador `graafhenk/numberwang`. Su única tarea es decidir si un numero, una expresion aritmetica o una cantidad escrita en contexto pertenece a una de cuatro categorias fijas: `numberwang`, `not_numberwang`, `not_a_number` y `wangernumb`. La nomenclatura proviene del sketch humoristico de television en el que los concursantes deben adivinar que numeros son "Numberwang"; el modelo traslada esa premisa a una tarea real de clasificacion multiclase.

Tecnicamente es un BERT diminuto entrenado desde cero: 2 capas, dimension oculta 128, 4 cabezas de atencion y 356.868 parametros totales. Usa un tokenizador a nivel de caracter con un vocabulario de 69 tokens y lowercasing, de modo que digitos, operadores aritmeticos y letras acentuadas son entrada de primera clase sin ruta de vocabulario desconocido. La salida es un softmax de 4 clases y los pesos se publican en float32 y formato safetensors.

El modelo es relevante como pieza de investigacion y como ejemplo de ingenieria minima: se entreno con 187.606 ejemplos etiquetados, cubre once idiomas (entre ellos espanol, neerlandes, aleman, frances, italiano, portugues, sueco, polaco, danes y finlandes), declara una precision del 87,4% sobre 486 casos reservados y presenta un techo deliberado del 98% porque aproximadamente el 2% de las etiquetas de entrenamiento estan invertidas de forma intencionada. No es un modelo de produccion para calculo aritmetico, sino un clasificador de juguete bien caracterizado, con licencia MIT y un coste de despliegue practicamente nulo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (transformer encoder), 2 capas, hidden 128, 4 cabezas de atencion |
| Parametros totales | 356.868 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible como valor formal; los primeros 64 caracteres concentran la senal entrenada, el resto se acepta pero no se lee de forma significativa |
| Tipos de cuantizacion | no disponible (pesos publicados en float32; no se declaran versiones cuantizadas) |
| Idiomas soportados | 11: en, nl, de, fr, es, it, pt, sv, pl, da, fi |
| Licencia | MIT |
| Formato de pesos | safetensors (repositorio de transformers); existe ademas una variante original en JSON de 1,8 MB con convnet propio |
| Tokenizador | a nivel de caracter, vocabulario de 69 tokens, lowercasing |
| Precision | float32 |
| Salida | softmax de 4 clases: `not_numberwang`, `numberwang`, `not_a_number`, `wangernumb` |
| Entrada | texto en crudo, interpretado como numero, expresion aritmetica, numeral romano, ordinal, cantidad o texto sin contenido numerico |
| Datos de entrenamiento | 187.606 ejemplos etiquetados, entrenado desde cero |
| Autor | graafhenk |
| Descargas / likes | 0 / 0 (segun los datos de la ficha de Hugging Face) |
| Fecha de creacion | 2026-09-15 |

## Arquitectura y entrenamiento

WangNet es un transformer encoder de tipo BERT reducido al minimo: 2 capas, dimension oculta de 128 y 4 cabezas de atencion, con un total de 356.868 parametros en float32. La innovacion estructural no esta en el bloque transformer, sino en la tokenizacion: el tokenizador opera caracter a caracter sobre un vocabulario de 69 tokens y aplica lowercasing, de forma que digitos, operadores (`*`, `-`), espacios y letras acentuadas se representan sin fragmentacion ni rutas de vocabulario desconocido. Esto permite que la misma representacion cubra `42`, `sixty-six`, `zweiundzwanzig` o `5*2` sin necesidad de normalizacion previa especifica por idioma.

El entrenamiento se hizo desde cero sobre 187.606 ejemplos etiquetados, sin datos publicos de preentrenamiento ni fases declaradas de RLHF o DPO, dado que es un clasificador y no un modelo generativo. El diseno experimental incluye dos decisiones destacables. La primera es la reserva de 486 casos de evaluacion disjuntos por construccion, aproximadamente el 4,3% de cada rango entero mas un conjunto de plantillas de frase, de modo que el conjunto de test no puede filtrarse a medida que crece el corpus de entrenamiento. La segunda es la introduccion deliberada de etiquetas invertidas en cerca del 2% de los datos, lo que fija un techo maximo de precision en torno al 98% para cualquier modelo entrenado sobre este corpus y evita optimizar hacia el 100%. El modelo declarado obtiene un 87,4% de accuracy y un macro-F1 de 0,878 sobre esos 486 casos reservados, y un 84,9% de accuracy en el split de test interno.

## Capacidades

- Clasificacion de numeros escritos en cifras o en palabras: `42`, `12345`, `sixty-six`.
- Interpretacion multilingue de numerales en once idiomas, con acentos opcionales: `zweiundzwanzig`, `veintidos`, `tweeentwintig`.
- Evaluacion de expresiones aritmeticas simples juzgadas por su resultado: `5*2`, `96 divided by 2`.
- Tratamiento de numerales romanos y ordinales: `XLIV`, `twenty-third`, `22nd`.
- Interpretacion de palabras derivadas de un numero, juzgadas como ese numero: `fortnight`, `vierendelen`, `september`.
- Distincion de palabras que contienen un numero pero no lo son: `achtneming`, `often`, `money`.
- Deteccion de ausencia de contenido numerico: `bonjour`, `hello how are you`, que nunca pueden ser Numberwang.
- Propiedad invariante al idioma: `four`, `vier`, `quatre` y `cuatro` reciben el mismo veredicto porque la "wangness" se define sobre el numero, no sobre la lengua.
- Insensibilidad a mayusculas y minusculas gracias al lowercasing del tokenizador.
- No soporta tool calling, function calling, agentes, vision, audio ni modo de razonamiento extendido: es exclusivamente un clasificador de 4 clases.

## Casos de uso

- Demostracion interactiva en navegador: el autor publica un Space que ejecuta el modelo en el cliente, sin servidor, lo que permite incrustar el clasificador en una pagina web o en una demo docente sin coste de infraestructura.
- Juego o trivia conversacional: integrar el clasificador en un bot que plantee numeros y expresiones a los usuarios y valide si su respuesta "es Numberwang", usando la etiqueta devuelta como logica de puntuacion.
- Filtro heuristico de contenido numerico en preprocesado: dado un texto corto en cualquiera de los once idiomas, decidir si contiene una cantidad o expresion numerica antes de enviarlo a un componente mas caro, asumiendo la precision del 87,4% como cota orientativa.
- Prueba de integracion en pipelines de MLOps: con 356.868 parametros y un repositorio de menos de 1 MB, es util como smoke test de `transformers`, de Text Embeddings Inference, de Inference Endpoints o de un servidor propio, porque se descarga y carga en segundos.
- Investigacion sobre tokenizacion a nivel de caracter: sirve como baseline controlado para comparar representaciones char-level frente a tokenizacion por subpalabras en una tarea de clasificacion multiligue con vocabulario minimo.
- Experimentos de modelos ultraligeros y edge computing: sus 356.868 parametros en float32 ocupan aproximadamente 1,4 MB, lo que lo hace apto para entornos con memoria muy restringida o para estudiar tecnicas de compresion y destilacion a escala minima.
- Material didactico sobre evaluacion y sesgo de datos: el corpus incorpora un 2% de etiquetas invertidas y un esquema de reserva de casos por rangos, lo que lo convierte en un ejemplo util para explicar techos de rendimiento, fuga de datos y diseno de conjuntos de validacion.
- Normalizacion y deteccion de numerales en textos multilingues: identificar ordinales, numerales romanos o cantidades escritas con palabras en once idiomas como paso previo a una normalizacion numerica posterior.

## Benchmarks y rendimiento

Resultados declarados por el autor en el model-index del modelo (no verificados de forma independiente):

| Metrica | Valor | Conjunto |
|---|---|---|
| Accuracy | 0,874 | 486 casos reservados de held-out |
| Macro-F1 | 0,878 | 486 casos reservados de held-out |
| Accuracy | 0,849 | Split de test interno |

Rendimiento por clase sobre los 486 casos reservados:

| Clase | Precision | Recall | F1 | n |
|---|---:|---:|---:|---:|
| Wangernumb | 0,941 | 0,970 | 0,955 | 33 |
| Numberwang | 0,894 | 0,913 | 0,903 | 241 |
| not Numberwang | 0,839 | 0,818 | 0,828 | 165 |
| not a number | 0,844 | 0,809 | 0,826 | 47 |

Segun la model card, 43 de los 61 errores totales corresponden a confusion entre las dos clases principales, `Numberwang` y `not Numberwang`, y casi todos ellos son operaciones aritmeticas que el modelo no puede calcular realmente. Solo cuatro no numeros genuinos fueron clasificados como numero. La model card indica ademas que existe una comparacion frente a baselines y frente a un modelo de lenguaje de 1,7 mil millones de parametros en una figura, pero no se publican las cifras numericas de esas alternativas en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,4 MB solo para los pesos en float32 (356.868 parametros x 4 bytes), mas el coste del runtime de PyTorch, que domina ampliamente el consumo real.
- GPU recomendadas: cualquier GPU, incluida una integrada; el modelo no requiere aceleracion dedicada. Se puede ejecutar en CPU sin problema.
- Compatibilidad con GPU de consumo: si, cabe en cualquier GPU de consumo, incluso en las de gama mas baja y en memoria compartida.
- Opciones de despliegue: `transformers` mediante `pipeline("text-classification")`, Hugging Face Inference Endpoints (la ficha incluye la etiqueta `endpoints_compatible`), Text Embeddings Inference (etiqueta `text-embeddings-inference`) y ejecucion en cliente en el navegador mediante el Space oficial. No se declaran soporte especifico para llama.cpp, Ollama, vLLM o TGI en la informacion disponible.
- Latencia y throughput: no publicados. Por el tamano del modelo, la inferencia en CPU es viable y el cuello de botella realista es el arranque del runtime, no el calculo.
- Limitacion practica de entrada: aunque el modelo acepta texto largo sin error, solo los primeros 64 caracteres aportan senal entrenada, por lo que conviene truncar la entrada antes de enviarla.

## Comparativa con modelos similares

No se han identificado en la informacion disponible modelos publicos comparables de clasificacion "Numberwang"; se comparan a continuacion las dos implementaciones del propio autor, que son las unicas alternativas documentadas.

| Modelo | Formato | Parametros | Accuracy (486 casos reservados) | Dependencias | Licencia |
|---|---|---|---|---|---|
| WangNet (Hugging Face, este modelo) | safetensors, transformers | 356.868 | 0,874 | `transformers`, `torch` | MIT |
| WangNet original (convnet propio) | JSON de 1,8 MB | no disponible | 0,889 | solo biblioteca estandar de Python | MIT |
| Modelo de lenguaje de 1,7 B citado como baseline | no disponible | 1.700.000.000 (citado) | no publicada en la informacion disponible | no disponible | no disponible |

Segun la model card, las dos implementaciones de WangNet coinciden en el 88,1% de los veredictos y casi todas sus discrepancias se producen en operaciones aritmeticas que ninguna de las dos puede calcular. La version original puntua ligeramente mas alto (88,9% frente a 87,4%) y existe para poder desplegarse en cualquier entorno con Python, mientras que la version de Hugging Face existe para poder servirse desde la plataforma. Los resultados de busqueda web proporcionados no contienen informacion relevante sobre el modelo ni sobre alternativas comparables.

## Limitaciones y advertencias

- La aritmetica esta memorizada, no calculada: un clasificador no puede evaluar expresiones. Los operandos pequenos estan cubiertos de forma exhaustiva en entrenamiento y los grandes son conjeturas; `5*2` es fiable, `904 * 3` no. Si la correccion aritmetica importa, hay que evaluar la expresion y pasar el resultado.
- La entrada larga degrada: solo los primeros 64 caracteres contienen senal entrenada. El texto adicional se acepta sin error, pero la cola no se lee de forma significativa.
- Los veredictos son aprendidos, no garantizados: no existe ningun motor de reglas en inferencia que los imponga.
- El techo de precision es aproximadamente del 98%, no del 100%, por construccion, ya que cerca del 2% de las etiquetas de entrenamiento estan invertidas deliberadamente.
- La mayor parte de los errores se concentra en la confusion entre `Numberwang` y `not Numberwang` (43 de 61), casi siempre en operaciones aritmeticas fuera del alcance del modelo.
- Riesgo de alucinacion conceptual: al ser un clasificador, su equivalente es la asignacion de una etiqueta incorrecta con alta confianza, especialmente en expresiones compuestas o en idiomas con poca cobertura en el corpus.
- No hay informacion publicada sobre sesgos demograficos, culturales o de representacion en el corpus de 187.606 ejemplos, ni sobre la distribucion por idioma dentro de esos datos.
- El corpus reserva un 4,3% de cada rango entero, pero la cobertura real por idioma y por plantilla de frase no se detalla, por lo que el rendimiento fuera de esos 486 casos puede diferir.
- Licencia MIT: permite uso comercial y modificacion, pero la propia model card explicita que no se ofrece ninguna garantia, expresa o implicita, sobre si un numero concreto es o no es Numberwang.
- Cero descargas y cero likes en el momento de los datos: el modelo carece de validacion comunitaria independiente y no cuenta con una verificacion externa de sus resultados.
- El repositorio ocupa 0,0 GB en la ficha, coherente con un modelo diminuto, pero conviene comprobar el contenido real antes de integrarlo en un pipeline automatizado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/graafhenk/numberwang
- Demo en el navegador (Space oficial): https://huggingface.co/spaces/graafhenk/numberwang-demo
- Repositorio del autor (version sin dependencias, convnet en JSON): https://github.com/GraafHenk/numberwang
- Artefactos de evaluacion citados en la model card: `assets/benchmark.png`, `assets/per_class.png`, `assets/confusion.png` dentro del repositorio del modelo
- Los resultados de busqueda web proporcionados no contienen ningun enlace relevante sobre este modelo (corresponden a Google Maps), por lo que no se anaden mas fuentes.
