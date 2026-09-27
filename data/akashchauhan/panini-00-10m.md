# akashchauhan/panini-00-10m

## Resumen

Panini-00 10M es un modelo de traduccion automatica y correccion gramatical centrado en el par hindi-sanscrito, ambos en escritura devanagari. Lo publica el usuario akashchauhan en Hugging Face y se distribuye como checkpoint de PyTorch personalizado, no como modelo de la libreria Transformers, por lo que requiere el cargador de referencia del autor para funcionar.

El modelo resuelve cinco tareas concretas: traduccion hindi a sanscrito, traduccion sanscrito a hindi, sanscritizacion de hindi (sustitucion de vocabulario hindi por equivalentes sanscritos), correccion gramatical de hindi y correccion gramatical de sanscrito. Con 10.942.720 parametros y una ventana de contexto de 1.024 tokens, esta disenado para procesar una unica frase en devanagari por peticion y devolver la salida tras la etiqueta `<tgt>`.

Su relevancia es acotada pero especifica: ocupa el nicho de los modelos pequenos de traduccion indico, ejecutables en CPU sin GPU, y se apoya en un tokenizador SentencePiece propio de 12.000 piezas que debe acompanar obligatoriamente al checkpoint. No se han publicado resultados de benchmarks ni existe trafico de descargas en el momento de redactar esta ficha, por lo que su calidad real no esta validada de forma independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer autoregresivo tipo decoder-only con atencion de consultas agrupadas (GQA); checkpoint PyTorch personalizado, no compatible con Transformers |
| Parametros totales | 10.942.720 (~10,9 M) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 1.024 tokens (incluye el prompt completo) |
| Tipos de cuantizacion | no disponible (solo se distribuye `checkpoint.pt`; no hay versiones cuantizadas publicadas) |
| Idiomas soportados | Hindi (`hi`) y sanscrito (`sa`), ambos en escritura devanagari |
| Licencia | other (los terminos concretos no se detallan en la model card) |
| Formato de pesos | `checkpoint.pt` (PyTorch); tokenizador SentencePiece en `tokenizer.model` con 12.000 piezas |
| Capas | 12 |
| Ancho del modelo | 256 |
| Cabezas de consulta / clave-valor | 8 / 2 |
| Dimension de cabeza | 32 |
| Ancho de la capa feed-forward | 640 |
| Vocabulario | 12.000 |
| Tokens de preentrenamiento | 200.008.776 (~200 M) |
| Tokens de ajuste supervisado | 20.000.016 (~20 M) |
| Ejemplos supervisados | 312.176 |
| Decodificacion | Greedy (`temperature` = 0), parada en end-of-sequence |
| Fecha de publicacion | 27 de septiembre de 2026 (segun metadatos del repositorio) |

## Arquitectura y entrenamiento

La configuracion declarada corresponde a un transformer decoder-only de 12 capas con ancho oculto de 256 y 8 cabezas de atencion de dimension 32. El hecho de que se declaren 8 cabezas de consulta frente a 2 cabezas de clave-valor indica atencion de consultas agrupadas (GQA), un mecanismo que reduce el tamano de la cache KV durante la generacion. La capa feed-forward tiene un ancho de 640, aproximadamente 2,5 veces el ancho oculto. La interfaz de inferencia (rellenado con `continue_prompt` y lectura del texto posterior a `<tgt>`) es coherente con un modelo autoregresivo de continuacion de secuencia con etiquetas de tarea inyectadas por el cargador.

El entrenamiento se realizo en dos fases segun los datos publicados: un preentrenamiento de 200.008.776 tokens y un ajuste supervisado de 20.000.016 tokens sobre 312.176 ejemplos, lo que da una ratio aproximada de 20 tokens por parametro en total. La model card no especifica la composicion del dataset, el uso de RLHF o DPO, ni detalles del tokenizador mas alla del numero de piezas. Tampoco se describe ninguna innovacion tecnica adicional (decodificacion especulativa, atencion lineal, mezcla de expertos) aparte de la atencion agrupada.

## Capacidades

- Traduccion bidireccional hindi-sanscrito mediante las tareas `translate_hi_sa` y `translate_sa_hi`.
- Sanskritizacion de hindi (`sanskritize_hindi`): sustitucion de lexico hindi por equivalentes sanscritos, por ejemplo मैं स्कूल जाता हूँ और पानी पीता हूँ। → मैं विद्यालय जाता हूँ और जल पीता हूँ।
- Correccion gramatical de hindi (`correct_hi`): concordancia de genero y numero, por ejemplo यह पुस्तक अच्छा है। → यह पुस्तक अच्छी है।
- Correccion gramatical de sanscrito (`correct_sa`): concordancia de persona y numero en formas verbales, por ejemplo अहं गृहं गच्छति। → अहं गृहं गच्छामि।
- Procesamiento exclusivo de escritura devanagari.
- Inferencia determinista con decodificacion greedy y parada en end-of-sequence.
- No dispone de soporte de tool calling ni function calling.
- No dispone de capacidades de agente ni de razonamiento multi-paso.
- No dispone de modo thinking, vision, audio ni multimodalidad.
- No es un modelo conversacional: no gestiona dialogos multi-turno.
- No cubre idiomas distintos de hindi y sanscrito.

## Casos de uso

- Traduccion hindi-sanscrito en proyectos de digitalizacion de textos: el modelo traduce una frase devanagari por peticion con 1.024 tokens de contexto, suficiente para versos, sutras o parrafos cortos que se procesan secuencialmente.
- Sanskritizacion de prosa hindi en publicaciones academicas o liturgicas: la tarea `sanskritize_hindi` permite elevar el registro de un texto sustituyendo lexico hindi por terminos sanscritos sin cambiar la sintaxis base.
- Correccion gramatical de hindi en herramientas de escritura: con `correct_hi` se pueden construir revisores ortograficos y de concordancia para textos hindi, ejecutables en servidor sin GPU.
- Apoyo a la ensenanza de sanscrito: la tarea `correct_sa` corrige errores de concordancia verbal en ejercicios de estudiantes, util como corrector automatico en plataformas de aprendizaje.
- Generacion de material didactico paralelo: traduciendo en ambos sentidos se pueden producir pares alineados hindi-sanscrito para ejercicios, glosarios o textos de lectura comparada.
- Preprocesado y aumento de corpus para entrenar modelos mayores: el modelo puede generar traducciones sinteticas que amplien corpus paralelos hindi-sanscrito antes de un filtrado humano.
- Despliegue en dispositivos sin GPU: al requerir unicamente CPU y unos pocos megabytes de pesos, encaja en aplicaciones de escritorio, entornos embebidos o servicios con restricciones de hardware.
- Anotacion asistida de corpus linguisticos: la salida determinista de la decodificacion greedy facilita la revision reproducible por parte de anotadores humanos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas BLEU, chrF, MMLU, HumanEval, GSM8K ni ninguna otra evaluacion cuantitativa, y la busqueda web realizada no ha devuelto resultados de evaluacion de este modelo.

## Requisitos de hardware

- VRAM estimada: aproximadamente 44 MB en FP32 (10.942.720 parametros x 4 bytes), unos 22 MB en FP16/BF16 y unos 11 MB en INT8. A ello hay que sumar la cache KV, la activacion y el tokenizador, de modo que el consumo total se mantiene por debajo de 1 GB en cualquier configuracion.
- GPU recomendadas: no se requiere GPU. Cualquier GPU consumer de gama baja (GTX 1050, GTX 1650, RTX 3050 o superior) es mas que suficiente; no tiene sentido desplegarlo en A100, H100 o similares.
- Compatibilidad con GPU consumer: si, cabe holgadamente en cualquier GPU consumer e incluso en iGPU con memoria compartida.
- CPU: la model card indica explicitamente que la CPU es suficiente para la inferencia.
- Opciones de despliegue: no hay soporte documentado para vLLM, llama.cpp, Ollama o TGI. El unico camino documentado es el codigo de referencia del repositorio `midroid/ai-models` (rama `experiment/010-hindi-sanskrit`) con Python 3.10 o superior, PyTorch, SentencePiece y PyYAML.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de datos verificables de benchmarks ni de especificaciones comparables en la informacion proporcionada. La busqueda web realizada devolvio portales generales de catalogo de modelos (AkashML, Google AI Studio, Hugging Face, ModelForest) sin cifras referidas a traduccion hindi-sanscrito ni a modelos de la misma escala.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| panini-00-10m | 10,9 M | 1.024 tokens | no disponible | other | Hugging Face, checkpoint PyTorch personalizado |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Ausencia total de evaluacion publica: no hay BLEU, chrF ni ninguna otra metrica que permita estimar la calidad real de las traducciones o de la correccion gramatical.
- Escala muy reducida: 10,9 M de parametros limitan la cobertura lexica y la capacidad de generalizar a vocabulario, registros o construcciones poco frecuentes.
- Contexto corto: 1.024 tokens incluyendo el prompt, y el modelo no puede superar ese limite. Solo se procesa una frase por peticion, sin contexto de documento.
- Idiomas restringidos: unicamente hindi y sanscrito en devanagari. No hay soporte para transliteracion ni para otras lenguas indias.
- Riesgo de alucinacion: en tareas generativas de traduccion y correccion, un modelo de este tamano puede producir formas gramaticales plausibles pero incorrectas, especialmente en sanscrito, sin ninguna senal de confianza.
- Restricciones de licencia: la licencia declarada es `other` sin texto de terminos en la model card, por lo que el uso comercial queda en un limbo legal y requiere contactar con el autor antes de cualquier despliegue productivo.
- Incompatibilidad de ecosistema: al no ser un modelo Transformers, no funciona con `AutoModel`, `pipeline` ni con las herramientas habituales de servido; obliga a usar el codigo de referencia del autor y su rama experimental concreta.
- Acoplamiento tokenizador-checkpoint: la model card advierte de que `tokenizer.model` debe mantenerse junto a `checkpoint.pt`; sustituirlo invalida el modelo.
- Decodificacion unica: solo se documenta decodificacion greedy a temperatura 0, sin muestreo, beam search ni parametros de penalizacion.
- Trazabilidad dudosa: el repositorio muestra 0 descargas y 0 likes, un tamano declarado de 0,0 GB y fechas de creacion y actualizacion de septiembre de 2026, datos que no permiten verificar la procedencia ni la integridad de los pesos.
- Sin garantias de sesgo: la model card no incluye ninguna analisis de sesgos ni de comportamiento en dominios sensibles.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/akashchauhan/panini-00-10m
- Codigo de referencia: https://github.com/midroid/ai-models/tree/experiment/010-hindi-sanskrit/experiments/language/010-hindi-sanskrit-slm
- Repositorio base (rama `experiment/010-hindi-sanskrit`): https://github.com/midroid/ai-models
- La busqueda web no devolvio enlaces relevantes al modelo. Los resultados obtenidos (https://akashml.com/models, https://aistudio.google.com/, https://aistudio.google.com/models/gemini-3, https://huggingface.co/, https://mrunreal.github.io/ModelForest/) no guardan relacion con panini-00-10m ni aportan datos tecnicos sobre el.
