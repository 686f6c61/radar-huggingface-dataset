# gogamza/kotag-0.8b

## Resumen

kotag-0.8b es un modelo de etiquetado de secuencias (sequence labeling) para coreano, desarrollado por el usuario gogamza y publicado en HuggingFace bajo licencia Apache 2.0. Se trata de un fine-tuning completo de Qwen/Qwen3.5-0.8B (852.985.920 parametros) que transforma un LLM generativo en un etiquetador por token: en lugar de producir texto, devuelve una distribucion de probabilidad sobre un conjunto de opciones definidas en el prompt para cada caracter o palabra de la entrada. El modelo no reescribe la entrada, lo que lo hace adecuado para tareas de anotacion estructurada donde la fidelidad al texto original es critica.

La innovacion principal reside en su mecanismo de lectura: el prompt repite la entrada una segunda vez, unidad a unidad, y se lee el estado oculto de cada unidad repetida en un unico forward pass. Sobre ese estado se aplica un readout entrenado sobre codigos de opcion de un solo token, con una temperatura ajustada para calibracion. Esta receta de decision proviene de Jeff (fork de AutoJev), pero kotag la aplica en cada unidad en lugar de una vez por pregunta. El modelo es utilizado por PyKoSpacing como KoSpacing v2.

El modelo fue construido integramente en una unica NVIDIA DGX Spark (GB10 Grace Blackwell, 128 GB de memoria unificada), sin cluster ni GPUs en la nube. El entrenamiento consistio en un fine-tuning completo de todos los parametros durante 1.490 pasos en 3 horas y 17 minutos, usando aproximadamente 20 GB de memoria. Los datos de profesor fueron generados y etiquetados localmente por google/gemma-4-26B-A4B-it servido con vLLM. Es relevante ahora porque demuestra que un modelo pequeno y una sola maquina permiten convertir un LLM general en un etiquetador controlable mediante instrucciones en lenguaje natural.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (Qwen3.5), fine-tuning completo para token-classification |
| Parametros totales | 852.985.920 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | coreano (ko) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

kotag-0.8b parte de Qwen/Qwen3.5-0.8B, un transformer decoder de 852 millones de parametros, y se somete a un fine-tuning completo de todos sus parametros (no LoRA ni adaptadores). La innovacion arquitectonica no esta en el backbone sino en el regimen de inferencia: el prompt incluye la pregunta y las opciones (entre 2 y 255, cada una con clave y descripcion), y a continuacion reescribe la entrada una segunda vez, unidad a unidad. Un unico forward pass del backbone produce un estado oculto por cada caracter repetido, y un readout entrenado sobre codigos de opcion de un solo token puntua las opciones en cada posicion. El resultado es una probabilidad por unidad y opcion, utilizable para umbrales, incertidumbre o decodificacion restringida.

El entrenamiento se realizo desde Qwen/Qwen3.5-0.8B sin entrenar, con la inicializacion del readout de Jeff, no desde los pesos de Jeff. Los datos de entrenamiento fueron generados y etiquetados por google/gemma-4-26B-A4B-it servido localmente con vLLM. Durante el entrenamiento se reformularon las descripciones de las opciones, se barajaron las opciones y se intercambiaron o sustituyeron las claves por simbolos, con el objetivo de que el modelo siguiera las descripciones y no los nombres de las claves. No se menciona uso de RLHF ni DPO. El modelo admite unidades de caracter (etiqueta cada caracter no espacio) y de palabra (una etiqueta por palabra separada por espacios), asi como campos de contexto que el modelo lee pero no etiqueta.

## Capacidades

- Etiquetado de secuencias con conjunto de etiquetas arbitrario definido en el prompt, con entre 2 y 255 opciones, cada una con clave y descripcion.
- Seguimiento de descripciones de opciones en lugar de nombres de claves: robustez del 97,1 % al 100,0 % ante renombrado de claves a simbolos, intercambio entre opciones o orden inverso (8 tareas entrenadas).
- Unidades de caracter: etiqueta cada caracter no espacio (espaciado, fronteras, spans dentro de palabras).
- Unidades de palabra: una etiqueta por palabra separada por espacios (categoria gramatical, roles, afirmaciones no soportadas).
- Campos de contexto: texto de referencia que el modelo lee pero no etiqueta (titulo de articulo de un comentario, fuente de un resumen).
- Probabilidades por unidad, utilizables para umbrales, estimacion de incertidumbre o decodificacion restringida.
- No genera texto: la salida es siempre una etiqueta por unidad y la entrada nunca se reescribe.
- Tareas entrenadas: espaciado de palabras, correccion de espaciado, fin de frase, restauracion de puntuacion, entidades nombradas, categoria gramatical por palabra, rol sintactico por palabra, texto entre comillas/parentesis, script de cada caracter, valores formateados, reglas procedimentales, spans ofensivos en comentarios, comentario ofensivo (si/no) y palabras no soportadas en una respuesta (ingles).
- Tareas zero-shot evaluadas: spans de informacion personal, caracteres erroneos, span de respuesta en pasaje (KLUE-MRC) y 30 preguntas escritas a mano.

## Casos de uso

- Espaciado automatico de texto coreano (word spacing): el modelo etiqueta cada caracter para decidir si le precede un espacio, con F1 de palabra de 0,841 en Wikipedia y 0,758 en noticias y resenas no vistas durante el entrenamiento. Es el uso principal, ya que PyKoSpacing lo emplea como KoSpacing v2.
- Correccion de espaciado en textos ya espaciados: con F1 de palabra de 0,920, adecuado para normalizar corpus o corregir salidas de OCR y transcripciones.
- Deteccion de fin de frase y restauracion de puntuacion: F1 de frontera de 0,977 en fin de frase y F1 de marca de 0,815 en puntuacion con la formulacion entrenada, util para segmentar y puntuar texto sin puntuacion.
- Reconocimiento de entidades nombradas (NER): F1 de span de 0,729 con formulacion entrenada y 0,735 con formulacion nueva, aplicable a extraccion de entidades en textos coreanos.
- Etiquetado gramatical y de roles sintacticos por palabra: precision de 0,894 en categoria gramatical y 0,968 en rol sintactico con la formulacion entrenada, util para anotacion linguistica y pipelines de PLN.
- Deteccion de spans ofensivos en comentarios: F1 de span de 0,726 con formulacion entrenada y 0,687 con formulacion nueva, aplicable a moderacion de contenido en coreano.
- Deteccion de informacion personal (telefono, correo electronico, etc.): F1 de span de 0,805 en frases sinteticas en regimen zero-shot, util para anonimizacion preliminar.
- Extraccion de texto entre comillas o parentesis: F1 de span de 0,997 con formulacion entrenada, para analisis de citas y anidamientos.

## Benchmarks y rendimiento

Tareas entrenadas, conjuntos de test del proyecto kospacing (ejecucion `r3d`):

| Tarea | Metrica | Formulacion entrenada | Formulacion nueva |
|---|---|---|---|
| Espaciado de palabras (Wikipedia) | F1 de palabra | 0,841 | 0,838 |
| Espaciado de palabras (noticias, resenas; no entrenado en ellos) | F1 de palabra | 0,758 | 0,749 |
| Correccion de espaciado | F1 de palabra | 0,920 | 0,916 |
| Fin de frase | F1 de frontera | 0,977 | 0,971 |
| Restauracion de puntuacion | F1 de marca | 0,815 | 0,058 |
| Entidades nombradas | F1 de span | 0,729 | 0,735 |
| Categoria gramatical por palabra | precision | 0,894 | 0,890 |
| Rol sintactico por palabra | precision | 0,968 | 0,638 |
| Texto entre comillas/parentesis | F1 de span | 0,997 | 0,974 |
| Script de cada caracter | precision | 0,999 | 0,999 |
| Valores formateados | F1 de span | 1,000 | 1,000 |
| Reglas procedimentales (formulacion nueva: reglas nunca vistas) | F1 de unidad | 0,915 | 0,077 |
| Spans ofensivos en comentarios | F1 de span | 0,726 | 0,687 |
| Comentario ofensivo (si/no, texto completo; no via kotag.py) | F1 | 0,755 | 0,768 |
| Palabras no soportadas en una respuesta (ingles) | F1 de palabra | 0,368 | 0,348 |

Tareas no entrenadas (zero-shot):

| Tarea | Metrica | Puntuacion |
|---|---|---|
| Spans de informacion personal (telefono, correo, ...; frases sinteticas) | F1 de span | 0,805 |
| Caracteres erroneos | F1 de unidad | 0,003 |
| Span de respuesta de una pregunta en un pasaje (KLUE-MRC) | F1 de unidad | 0,079 |
| 30 preguntas escritas a mano (nombres, sentimiento, comida, honorificos, ...) | F1 de marca | 0,780 |

Robustez: con claves de opcion renombradas a simbolos, intercambiadas entre opciones o listadas en orden inverso, el modelo da la misma respuesta por unidad entre el 97,1 % y el 100,0 % de las veces (8 tareas entrenadas).

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,7 GB en precision completa (tamano del repositorio en safetensors); no se dispone de datos de cuantizacion publicados.
- GPU recomendadas: no se especifican en la informacion disponible. El modelo fue entrenado en una NVIDIA DGX Spark (GB10 Grace Blackwell, 128 GB de memoria unificada), usando unos 20 GB de memoria durante el entrenamiento.
- Cabe en GPU de consumo: por tamano (menos de 1.000 millones de parametros) es probable que quepa en GPUs de consumo, pero no se confirma en la informacion proporcionada.
- Opciones de despliegue: no se detallan en la model card; el autor menciona vLLM para servir el modelo profesor (gemma-4-26B-A4B-it), no para kotag. No se confirman integraciones con llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| kotag-0.8b | 852.985.920 | no disponible | Etiquetado de secuencias coreano | Apache 2.0 | HuggingFace |
| Qwen/Qwen3.5-0.8B (base) | 852.985.920 (aprox.) | no disponible | Generacion de texto | no disponible | HuggingFace |
| KoSpacing v1 (referencia en la model card) | no disponible | no disponible | Espaciado de palabras coreano | no disponible | no disponible |

No se dispone de datos de benchmarks de los modelos comparables en la informacion proporcionada, por lo que no se puede establecer una comparacion cuantitativa de rendimiento.

## Limitaciones y advertencias

- Sensibilidad a la formulacion: la restauracion de puntuacion cae de 0,815 a 0,058 y el rol sintactico de 0,968 a 0,638 al usar formulaciones nuevas. Se recomienda usar las formulaciones entrenadas (PROMPT.md).
- Las reglas procedimentales no se aprenden de la descripcion: 0,915 con las reglas entrenadas frente a 0,077 con reglas nunca vistas.
- Rendimiento debil en palabras no soportadas en respuestas en ingles (F1 de palabra de 0,368) incluso con formulacion entrenada.
- Las tareas no entrenadas puntuan entre 0,00 y 0,81; la deteccion de caracteres erroneos obtiene 0,003 y el span de respuesta en KLUE-MRC 0,079.
- Solo soporta coreano; no se documentan capacidades multilingues.
- No genera texto: no es adecuado para tareas generativas, resumen o traduccion.
- No se documentan sesgos conocidos ni evaluaciones de sesgo en la informacion disponible.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero el modelo puede asignar etiquetas incorrectas con alta confianza; las probabilidades por unidad permiten aplicar umbrales.
- Licencia Apache 2.0 permite uso comercial, pero no se documentan restricciones adicionales ni condiciones de atribucion especificas.
- El modelo es "homebrew", construido en una sola maquina; no se documentan pruebas de produccion a gran escala ni latencia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/gogamza/kotag-0.8b
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- PyKoSpacing (usa el modelo como KoSpacing v2): https://github.com/haven-jeon/PyKoSpacing
- Jeff (receta de decision): https://github.com/firelex/jeff
- AutoJev (origen de la receta): https://github.com/denis-pplx/autojev
- Modelo profesor: google/gemma-4-26B-A4B-it (referenciado en la model card; no se proporciona URL directa)
