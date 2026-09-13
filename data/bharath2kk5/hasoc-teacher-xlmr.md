# Bharath2kk5/hasoc-teacher-xlmr

## Resumen

El modelo `Bharath2kk5/hasoc-teacher-xlmr` es un clasificador binario de discurso de odio y contenido ofensivo especializado en texto *code-mixed* hindi-ingles (hinglish). Se trata de un ajuste fino de `xlm-roberta-base` sobre el corpus HASOC 2021, con dos etiquetas de salida: HOF (odio/ofensivo) y NOT (no ofensivo). Lo publica el usuario Bharath2kk5 y se distribuye con licencia MIT, con 278.045.186 parametros y pesos en formato safetensors (1,1 GB de repositorio).

Su relevancia es doble. Por un lado, ataca un problema poco cubierto: la mayoria de los moderadores automaticos estan entrenados en ingles estandar y fallan ante el cambio de codigo y la transliteracion propios de las redes sociales indias. Por otro, el autor lo presenta como modelo "profesor" (*teacher*) dentro de una estrategia de destilacion: existe un modelo "alumno" DistilBERT-multilingue de 135M parametros que retiene el 96,1 % del macro-F1 del profesor y es 4,1 veces mas rapido en inferencia.

Segun la model card, el modelo alcanza un macro-F1 de 73,69 % en su conjunto de test, lo que supera el 72,53 % del sistema de ensamblado ganador publicado en HASOC 2021, y lo hace con un unico modelo. El propio autor restringe el uso previsto a investigacion y demostracion educativa, y desaconseja su empleo en moderacion de contenido en produccion sin validacion adicional. El repositorio registra 0 descargas y 0 likes en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-only (familia XLM-RoBERTa, base); cabecera de clasificacion binaria |
| Parametros totales | 278.045.186 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 512 tokens (limite de posiciones de `xlm-roberta-base`; no se explicita en la model card) |
| Tipos de cuantizacion | No disponible (la model card no documenta versiones cuantizadas ni GGUF) |
| Idiomas soportados | Hindi (hi) e ingles (en), con enfasis en texto code-mixed hindi-ingles |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Tarea | Clasificacion binaria de secuencia (HOF = odio/ofensivo, NOT = no ofensivo) |
| Dataset de ajuste | nikitadesai/hasoc (HASOC 2021, ICHCL), split estratificado 70/13/17 con semilla 42 |
| Tamano del repositorio | 1,1 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La base es `xlm-roberta-base`, un transformer encoder-only de 12 capas, 768 dimensiones ocultas, 12 cabezas de atencion y vocabulario SentencePiece de 250.000 tokens, preentrenado de forma multilingue sobre corpus de gran escala. Sobre ese backbone, el autor anade una cabecera de clasificacion y realiza un ajuste fino supervisado para producir una etiqueta por secuencia (HOF o NOT). No se trata, por tanto, de un modelo generativo: no hay decodificacion autoregresiva, ni modo *thinking*, ni uso de RLHF/DPO; la model card no documenta el numero de epocas, el *learning rate*, el tamano de lote ni el presupuesto de computo del ajuste fino, por lo que esos datos figuran como no disponibles.

El dato de entrenamiento declarado es el corpus HASOC 2021 en su variante hindi-ingles, con una particion estratificada propia de 70 % entrenamiento, 13 % validacion y 17 % test (semilla 42). La innovacion metodologica del repositorio no esta en la arquitectura, que es estandar, sino en el enfoque *teacher-student*: este modelo actua como profesor de un DistilBERT-multilingue de 135M parametros destilado a partir de el, lo que permite desplegar una version 4,1 veces mas rapida con una perdida de rendimiento declarada del 3,9 % en macro-F1. Es un patron habitual en entornos de moderacion donde el coste por peticion es determinante.

## Capacidades

- Clasificacion binaria de texto hindi-ingles code-mixed en las categorias HOF (odio/ofensivo) y NOT (no ofensivo).
- Manejo de texto transliterado y con mezcla de escrituras (devanagari y alfabeto latino) en la misma frase.
- Procesamiento de secuencias de hasta 512 tokens, suficiente para publicaciones, comentarios y fragmentos de conversacion de redes sociales.
- Transferencia multilingue derivada del preentrenamiento de XLM-R, aunque la model card solo declara hi y en como idiomas soportados.
- Inferencia rapida para un encoder de su tamano, apta para clasificacion por lotes.
- No soporta generacion de texto, razonamiento multi-paso, *tool calling* ni *function calling*.
- No dispone de capacidades de agente, vision, audio ni multimodalidad.
- No incorpora modo de razonamiento explicito ni salida de cadena de pensamiento; solo devuelve probabilidades por clase.

## Casos de uso

- Triaje de moderacion en redes sociales para el mercado indio: el modelo puede prefiltrar comentarios en hinglish y marcar los candidatos a revision humana, reduciendo el volumen que llega a los moderadores humanos en plataformas donde el ingles estandar falla.
- Monitorizacion de comunidades y foros: clasificacion por lotes de hilos completos para detectar picos de toxicidad, aprovechando que el modelo procesa hasta 512 tokens por documento y es lo bastante ligero para recorrer corpus grandes.
- Anotacion asistida de corpus: uso como preanotador en proyectos de etiquetado de discurso de odio en hindi-ingles, dejando al anotador humano la correccion de los casos dudosos.
- Filtro de seguridad previo a un LLM: capa de clasificacion que descarta entradas ofensivas antes de enviarlas a un modelo generativo, con un coste de computo minimo por peticion.
- Investigacion academica en HASOC y tareas similares: punto de partida reproducible para comparar tecnicas de ajuste fino, aumento de datos o destilacion sobre el mismo split.
- Destilacion de modelos mas ligeros: este checkpoint es el profesor declarado del modelo alumno de 135M parametros, de modo que sirve para generar etiquetas blandas sobre grandes volumenes de texto no etiquetado.
- Analisis de discurso politico y religioso: estudio cuantitativo de la prevalencia de lenguaje ofensivo en periodos electorales, siempre con supervision humana por el riesgo de falsos positivos descrito por el autor.
- Evaluacion de sesgos en moderacion automatica: al ser un modelo pequeno y con licencia MIT, es util como caso de estudio para medir como el vocabulario politico o religioso dispara clasificaciones erroneas.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Macro-F1 en test (split propio, 17 %) | 73,69 % |
| Macro-F1 del sistema de ensamblado ganador publicado en HASOC 2021 | 72,53 % |
| Rendimiento relativo del modelo alumno DistilBERT-multilingue | 96,1 % del macro-F1 del profesor |
| Velocidad relativa del modelo alumno | 4,1x mas rapido en inferencia |
| MMLU, HumanEval, GSM8K u otros benchmarks de proposito general | No aplicable (modelo de clasificacion, no generativo) |

Advertencia metodologica: la comparacion con el sistema ganador de HASOC 2021 procede de la model card y no se ha verificado de forma independiente. El propio autor emplea un split estratificado propio con semilla fija, no necesariamente identico a la particion oficial de la competicion, por lo que la comparacion directa entre cifras debe tomarse con cautela.

## Requisitos de hardware

- Peso de los parametros: 278M parametros, aproximadamente 1,1 GB en fp32 y unos 556 MB en fp16.
- VRAM estimada para inferencia: en torno a 1,5-2 GB en fp32 y 1-1,5 GB en fp16 con lotes pequenos; el consumo por lotes grandes depende de la longitud de secuencia (hasta 512 tokens).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente. Cabe holgadamente en RTX 3060, RTX 4060, RTX 4090 y equivalentes; en entornos de servidor, T4, L4, A10 y cualquier A100/H100 lo ejecutan con lotes muy grandes.
- CPU: viable para inferencia de baja concurrencia (unos cientos de milisegundos por peticion), aunque no se han publicado mediciones concretas para este checkpoint.
- Opciones de despliegue: `transformers` con `AutoModelForSequenceClassification`, exportacion a ONNX Runtime o TorchScript para produccion, y servicio mediante FastAPI o similares. No esta pensado para motores de generacion como llama.cpp, Ollama o TGI; vLLM incorpora soporte de modelos de clasificacion en versiones recientes, pero no hay confirmacion de que este repositorio se haya probado alli.
- Latencia y throughput: no disponibles. El unico dato indirecto es que el modelo alumno declarado es 4,1 veces mas rapido que este.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Macro-F1 declarado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Bharath2kk5/hasoc-teacher-xlmr | 278M | 512 tokens | 73,69 % (split propio) | MIT | HuggingFace, 0 descargas |
| Bharath2kk5/hasoc-student-distilbert | 135M | No disponible | 96,1 % del macro-F1 del profesor (aprox. 70,8 %) | No disponible en la informacion proporcionada | HuggingFace |
| Ensamblado ganador HASOC 2021 (referencia publicada) | No disponible | No disponible | 72,53 % | No disponible | Publicacion de la competicion |
| `xlm-roberta-base` sin ajuste fino | 278M | 512 tokens | No disponible | MIT | HuggingFace |
| `google/muril-base-cased` (alternativa multilingue indic) | 237M aprox. | 512 tokens | No disponible | Apache-2.0 | HuggingFace |

No se dispone de resultados comparativos publicados de `google/muril-base-cased` ni de otros encoders indic sobre este mismo split en la informacion proporcionada, por lo que no se pueden establecer comparaciones cuantitativas con ellos.

## Limitaciones y advertencias

- Sobredisparo ante vocabulario politico o religioso: el analisis de errores del autor indica falsos positivos con nombres de partidos, terminos religiosos y discurso legitimo como sarcasmo o reporte periodistico.
- Falsos negativos en odio codificado: el modelo puede no detectar discurso de odio sutil que evita insultos explicitos, como metaforas deshumanizantes o terminos en clave.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero si existe riesgo de clasificacion erronea con alta confianza, con consecuencias equivalentes en un sistema de moderacion.
- Dependencia del dominio y del split: el rendimiento de 73,69 % se ha medido en una particion propia con semilla 42 sobre HASOC 2021; el rendimiento fuera de ese dominio (otras redes, otras variantes de hinglish, otras epocas) no esta caracterizado.
- Cobertura limitada de idiomas: solo hindi e ingles code-mixed. No se ha validado para otras lenguas indias ni para hindi monolingue formal.
- Limite de contexto de 512 tokens: los documentos mas largos deben truncarse por segmentos, lo que puede degradar el juicio sobre conversaciones extensas.
- Uso en produccion desaconsejado por el autor: la model card indica explicitamente que no esta pensado para moderacion de contenido en produccion sin validacion adicional, y la ausencia de evaluacion externa agrava este punto.
- Licencia MIT: permite uso comercial y modificacion sin restricciones, pero la licencia del corpus HASOC subyacente y de los datos utilizados puede imponer condiciones adicionales que no cubre la licencia del modelo.
- Senales de adopcion nulas: 0 descargas y 0 likes, sin validacion de la comunidad ni reproducibilidad confirmada por terceros.
- Fecha de publicacion inusual (2026) en los metadatos del repositorio, lo que dificulta situar el modelo en una linea temporal verificable.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Bharath2kk5/hasoc-teacher-xlmr
- Modelo alumno destilado: https://huggingface.co/Bharath2kk5/hasoc-student-distilbert
- Dataset de ajuste: https://huggingface.co/datasets/nikitadesai/hasoc
- Modelo base: https://huggingface.co/xlm-roberta-base
- Busqueda web: no se han encontrado enlaces relevantes. Los resultados devueltos corresponden a paginas genericas del buscador (portada de Google, Google Books, Google Translate, Google Imagenes y busqueda avanzada), sin relacion con el modelo ni con HASOC.
