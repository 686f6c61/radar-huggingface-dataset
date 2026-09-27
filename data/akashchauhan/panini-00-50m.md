# akashchauhan/panini-00-50m

## Resumen

Panini-00 50M es un modelo de traduccion y normalizacion de frases entre hindi y sanscrito en escritura devanagari, publicado por el usuario akashchauhan en HuggingFace. No es un modelo de la familia Transformers: se distribuye como un checkpoint de PyTorch personalizado (`checkpoint.pt`) acompanado de un tokenizer SentencePiece propio de 32.000 piezas, con codigo de referencia en un repositorio externo. Su objetivo no es la generacion abierta de texto, sino resolver cinco tareas concretas y delimitadas: traduccion hindi→sanscrito, sanscrito→hindi, "sanskritizacion" de hindi (sustitucion de lexico hindi por lexico sanscrito), correccion gramatical en hindi y correccion gramatical en sanscrito.

El modelo es deliberadamente pequeno: 50.476.544 parametros, 13 capas, anchura 512 y una ventana de contexto de solo 1.024 tokens, incluido el prompt. Se entreno con aproximadamente 500 millones de tokens de preentrenamiento (500.009.664) y algo mas de 20 millones de tokens supervisados (20.000.534) repartidos en 312.176 ejemplos. La atencion usa atencion con consultas y cabezas clave-valor asimetricas (8 cabezas de consulta frente a 2 de clave-valor), lo que reduce el coste de la cache KV.

Su relevancia es doble. Por un lado, cubre un par de idiomas (hindi-sanscrito) con muy poca cobertura en modelos multilingues generalistas, y lo hace con un modelo que la propia model card indica que puede ejecutarse en CPU. Por otro, ilustra una tendencia util para investigadores: modelos de menos de 100 millones de parametros especializados en una tarea cerrada, faciles de entrenar y desplegar, en lugar de depender de APIs de modelos gigantes. El contrapeso es que se trata de una publicacion sin validacion comunitaria (0 descargas, 0 likes en el momento de la consulta), sin benchmarks publicados y con licencia "other" sin terminos explicitos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con checkpoint de PyTorch personalizado (no compatible con `transformers`); atencion con 8 cabezas de consulta y 2 cabezas clave-valor (GQA) |
| Parametros totales | 50.476.544 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 1.024 tokens, incluyendo el prompt |
| Tipos de cuantizacion | No disponible; solo se publica `checkpoint.pt` en PyTorch (el tamano del repo, 0,2 GB, es coherente con pesos en fp32, pero no se documenta) |
| Idiomas soportados | Hindi (hi) y sanscrito (sa), en escritura devanagari |
| Licencia | other (sin terminos especificados en la informacion disponible) |
| Formato de pesos | `checkpoint.pt` (PyTorch) + `tokenizer.model` (SentencePiece, 32.000 piezas) |
| Capas | 13 |
| Anchura del modelo | 512 |
| Dimensión de cabeza | 64 |
| Anchura feed-forward | 1.280 |
| Vocabulario | 32.000 |
| Tokens de preentrenamiento | 500.009.664 |
| Tokens supervisados | 20.000.534 |
| Ejemplos supervisados | 312.176 |
| Inferencia gestionada en HuggingFace | No (tag `inference: false`) |

## Arquitectura y entrenamiento

La arquitectura es un transformer de 13 capas con anchura 512, dimension de cabeza 64 y anchura de feed-forward de 1.280. La relacion entre cabezas de consulta (8) y cabezas clave-valor (2) implica agrupacion de cabezas (GQA), un patron habitual para reducir el consumo de memoria de la cache KV durante la decodificacion. El modelo no emplea atencion lineal ni arquitecturas hibridas SSM: es un transformer denso convencional. Las tareas no se seleccionan mediante un prompt en lenguaje natural, sino mediante etiquetas de tarea (`translate_hi_sa`, `translate_sa_hi`, `sanskritize_hindi`, `correct_hi`, `correct_sa`) que el cargador del codigo de referencia anade a la frase de entrada. La salida util es el texto que aparece despues del token `<tgt>`, con decodificacion voraz (`temperature` 0) y parada en el token de fin de secuencia.

En cuanto al entrenamiento, la model card detalla volumen pero no composicion: 500.009.664 tokens de preentrenamiento y 20.000.534 tokens supervisados sobre 312.176 ejemplos. No se documenta el origen de los corpus, no se menciona ningun tipo de ajuste por preferencias (RLHF, DPO) ni ninguna tecnica de decodificacion especulativa o de optimizacion de inferencia. El tokenizer SentencePiece de 32.000 piezas es especifico de este checkpoint: la propia model card advierte de que no coincide con los de Panini-00 10M ni Panini-00 18M, por lo que mezclar tokenizers entre versiones produce resultados incorrectos.

## Capacidades

- Traduccion hindi → sanscrito (`translate_hi_sa`), por ejemplo de una frase cotidiana a su equivalente en sanscrito.
- Traduccion sanscrito → hindi (`translate_sa_hi`).
- Sanskritizacion de hindi (`sanskritize_hindi`): reescritura de una frase hindi sustituyendo lexico hindi por lexico sanscrito, por ejemplo "स्कूल" → "विद्यालय" y "पानी" → "जल".
- Correccion gramatical en hindi (`correct_hi`): concordancia de genero en adjetivos ("अच्छा" → "अच्छी") y concordancia de numero y persona en verbos ("पढ़ता हैं" → "पढ़ता है").
- Correccion gramatical en sanscrito (`correct_sa`): concordancia de persona en verbos ("गच्छति" → "गच्छामि", "पठन्ति" → "पठति").
- Operacion a nivel de frase con entrada en devanagari; el modo de uso documentado es de una frase por peticion.
- El modelo no dispone de tool calling, function calling, modo agente, razonamiento multi-paso, vision, audio, ni modo de "pensamiento". No hay soporte de conversacion multi-turno ni de system prompt.

## Casos de uso

- Normalizacion editorial de hindi hacia registro sanscritizado: un medio o editorial que publique en hindi formal puede pasar cada frase por `sanskritize_hindi` para obtener una variante con lexico sanscrito, y revisar despues la salida. La tarea esta entrenada explicitamente para ese par de ejemplos.
- Correccion ortografica y gramatical de hindi en herramientas de escritura: integrar `correct_hi` como paso de post-procesado en un editor de textos o en un corrector para CMS, aplicando el modelo frase a frase antes de publicar.
- Correccion de sanscrito en plataformas educativas: `correct_sa` permite generar una version corregida de los ejercicios entregados por estudiantes, util como retroalimentacion automatica en cursos de sanscrito.
- Creacion de material didactico bilingue: usar `translate_hi_sa` y `translate_sa_hi` para generar pares de frases paralelas con las que construir ejercicios de traduccion, glosarios o tarjetas de repaso.
- Anotacion y preprocesamiento de corpus paralelos a bajo coste: al ejecutarse en CPU, el modelo puede usarse para pre-etiquetar grandes volumenes de frases hindi y sanscrito en un servidor sin GPU, que despues se revisan manualmente.
- Investigacion en modelos de lenguaje pequenos para lenguas indicas: con 50 millones de parametros y 13 capas, es una base asequible para experimentar con tokenizers devanagari, estudios de destilacion o comparativas de eficiencia por parametro frente a modelos multilingues mucho mayores.
- Aprendizaje de idiomas asistido: dada una frase del estudiante, devolver su version sanscritizada o corregida como pista, en un canal de practica sin necesidad de conexion a APIs externas.
- Despliegue en entornos con recursos muy limitados: por tamano de pesos y de cache KV, el modelo es candidato a ejecutarse en portatiles o contenedores pequenos, siempre que se incluya el codigo de arquitectura del repositorio de referencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de calidad de traduccion (BLEU, chrF, COMET), ni evaluaciones de correccion gramatical, ni comparaciones cuantitativas con otros sistemas. Tampoco hay datos de latencia o throughput. Los unicos ejemplos disponibles son cualitativos y se limitan a una tabla de siete casos en la model card.

## Requisitos de hardware

- VRAM estimada para los pesos: en fp32, alrededor de 200 MB (coherente con el tamano de repo de 0,2 GB); en fp16, alrededor de 100 MB. La model card no especifica el tipo de dato del checkpoint.
- Cache KV: con 13 capas, 2 cabezas clave-valor de dimension 64 y 1.024 tokens de contexto, la cache ocupa del orden de 3.328 elementos por token, es decir unos 6,5 KiB por token en fp16 y unos 13 KiB por token en fp32; en el peor caso (contexto completo) supone aproximadamente 6,8 MB en fp16 y 13,6 MB en fp32. Son estimaciones derivadas de las dimensiones publicadas, no datos del autor.
- GPU recomendadas: no se requieren. La model card indica explicitamente que la CPU es suficiente. Cualquier GPU consumer (por ejemplo, una GTX 1650 o superior, o una RTX 3060) sobra para este tamano; las GPU de datacenter (A100, H100) no aportan ventaja practica por modelo.
- Cabe en GPU consumer: si, con holgura, en cualquier GPU con mas de 1 GB de memoria, e incluso en CPU o en dispositivos embebidos si se convierte el checkpoint.
- Opciones de despliegue: el modelo no es un modelo `transformers`, por lo que no se puede cargar directamente con vLLM, TGI, llama.cpp, Ollama ni con la Inference API de HuggingFace (el tag `inference: false` lo confirma). El unico camino documentado es el codigo de referencia del repositorio `midroid/ai-models` (rama `experiment/010-hindi-sanskrit`), que requiere Python 3.10 o superior, PyTorch, SentencePiece y PyYAML, y se ejecuta con `uv run python -m src.sample`.
- Latencia y throughput estimados: no disponible. No se publican mediciones.

## Comparativa con modelos similares

Los resultados de la busqueda web no aportan informacion sobre modelos comparables. La tabla siguiente recoge alternativas de la misma categoria (traduccion indicas de tamano pequeno o medio) con los datos disponibles; los campos marcados como "no disponible" no figuran en la informacion proporcionada y deberian verificarse en las fichas oficiales antes de usarse.

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Panini-00 50M | 50,5 M | 1.024 tokens | Hindi, sanscrito (devanagari) | other (sin terminos) | Checkpoint PyTorch + SentencePiece |
| IndicTrans2 (variantes dist) | No disponible en la informacion proporcionada | No disponible | Familia de traduccion entre lenguas indicas | No disponible en la informacion proporcionada | Transformers |
| NLLB-200 (variantes distilled) | No disponible en la informacion proporcionada | No disponible | Multilingue (cobertura de lenguas indicas, sanscrito no confirmado) | No disponible en la informacion proporcionada | Transformers |
| Modelos de traduccion estadistica o mBART/OPUS especificos | No disponible en la informacion proporcionada | No disponible | No disponible | No disponible | No disponible |

Diferencias cualitativas que si se desprenden de la informacion disponible: Panini-00 50M es el unico de la comparativa que declara explicitamente soporte de sanscrito como idioma de destino y origen, y el unico que expone tareas de correccion gramatical y sanskritizacion ademas de la traduccion. A cambio, opera con un limite de 1.024 tokens, esta restringido a entrada en devanagari, no se integra con el ecosistema `transformers` y carece por completo de benchmarks publicados.

## Limitaciones y advertencias

- Sin benchmarks publicados: no hay ninguna metrica objetiva de calidad (BLEU, chrF, COMET ni evaluaciones de correccion) que permita estimar el rendimiento real mas alla de los siete ejemplos de la model card.
- Licencia "other" sin terminos explicitos: no se especifican condiciones de uso comercial, redistribucion ni atribucion. Antes de cualquier uso en produccion hay que contactar con el autor o asumir el riesgo legal.
- Sin cuantizaciones publicadas: solo existe `checkpoint.pt`. No hay GGUF, ONNX ni versiones en 4 u 8 bits, de modo que el despliegue exige cargar los pesos en el formato original.
- Tokenizer no intercambiable: la model card advierte de que este tokenizer no coincide con los de Panini-00 10M ni Panini-00 18M. Mezclarlos produce fallos silenciosos.
- Contexto muy corto: 1.024 tokens incluyendo el prompt. El modelo trabaja a nivel de frase; no admite documentos, parrafos largos ni conversaciones multi-turno.
- Decodificacion restringida: el codigo de referencia usa decodificacion voraz (temperatura 0). No se documentan parametros de muestreo, penalizaciones ni estrategias de busqueda alternativas, lo que limita la diversidad de salidas.
- Riesgo de alucinacion gramatical: en tareas de correccion, el modelo puede introducir cambios no justificados o aceptar como correctas formas erroneas. Al ser un modelo de 50 millones de parametros, la capacidad de generalizacion fuera del dominio de entrenamiento es reducida.
- Composicion del dataset desconocida: no se documenta el origen de los 500 millones de tokens de preentrenamiento ni de los 312.176 ejemplos supervisados. Es probable que el corpus tenga un sesgo hacia textos clasicos o religiosos, lo que afectaria al registro y al lexico de las salidas, pero no hay datos para confirmarlo ni para evaluar sesgos sociales, de genero o de caste.
- Solo dos idiomas y una escritura: hindi y sanscrito en devanagari. No hay soporte de transliteracion, de codigos ISO alternativos ni de otras lenguas indicas.
- Sin validacion comunitaria: 0 descargas y 0 likes en el momento de la consulta, y fecha de creacion del 27 de septiembre de 2026 en los metadatos. No hay evidencia de uso en produccion por terceros.
- No apto para pipelines estandar: al no ser un modelo `transformers`, no funciona con vLLM, TGI, llama.cpp, Ollama ni con herramientas que esperan pesos en safetensors, lo que anade coste de integracion y mantenimiento.
- Capacidades ausentes: nada de tool calling, agentes, razonamiento multi-paso, vision, audio ni modo de pensamiento. No debe plantearse como asistente general.

## Enlaces

- Ficha en HuggingFace: https://huggingface.co/akashchauhan/panini-00-50m
- Codigo de referencia e instrucciones de instalacion e inferencia: https://github.com/midroid/ai-models/tree/experiment/010-hindi-sanskrit/experiments/language/010-hindi-sanskrit-slm (rama `experiment/010-hindi-sanskrit`)
- La busqueda web realizada no devolvio ningun resultado relevante sobre el modelo: los resultados obtenidos correspondian a agregadores de torrents (kat.cc, ilounge.com), a un canal de YouTube y a la ficha de una actriz en Wikipedia, por lo que se han descartado y no se listan como fuentes. No se han localizado papers, blogs tecnicos ni demos asociados a Panini-00 50M en la informacion disponible.
