# HebArabNlpProject/shoshan

## Resumen

Shoshan es un lematizador de hebreo sensible al contexto desarrollado por el proyecto HebArabNlpProject. A diferencia de los modelos generativos, no produce cadenas libres: recupera el lema de un banco fijo de aproximadamente 117.600 entradas y, cuando la recuperación principal resulta morfológicamente implausible para la forma superficial, la transforma mediante un script de edición aprendido y relativo a la forma. Cada salida es, por tanto, una entrada real del banco o una edición acotada de la palabra de entrada, lo que elimina estructuralmente la alucinación de lemas.

El modelo se construye sobre un encoder DictaBERT afinado, al que se añaden una cabeza de etiquetado de categoría gramatical (POS) y una cabeza de script de edición con su inventario correspondiente. El entrenamiento se limita a las porciones redistribuibles de Knesset y Wikipedia del treebank UD hebreo de IAHLT, junto con lexicones hebreos públicos. La unidad de entrada es una oración de hasta 512 subtokens (unos 370 palabras hebreas); más allá de ese límite, la palabra se devuelve con `source="truncated"` y su forma superficial como lema.

Su relevancia actual radica en dos factores: por un lado, obtiene un 92,4 % de precisión de lema fuera de dominio y un 0,0 % de errores de bajo solapamiento en palabras no vistas, frente al 12,3 % de DictaBERT-lex; por otro, la versión 0.4.0 del software corrige el tratamiento de texto extraído de PDF con formas de presentación hebreas (U+FB1D-U+FB4F), un problema que afectaba a la lematización de documentos reales. La arquitectura de recuperación más transducción acotada lo hace adecuado para pipelines de recuperación de información y procesamiento documental donde la fidelidad del lema es crítica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder transformer (DictaBERT) con cabeza POS y cabeza de script de edición, sobre banco de lemas pre-codificado |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 subtokens por oración (aproximadamente 370 palabras hebreas) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | hebreo (he) |
| Licencia | MIT (código); el encoder está sujeto a la licencia de DictaBERT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Shoshan combina un encoder DictaBERT afinado con dos cabezas: una de etiquetado de categoría gramatical y otra que predice un script de edición relativo a la forma de entrada. El banco de lemas se pre-codifica en `lemmas.csv` y `lemmas.npy` con unas 117.600 entradas, normalizadas a una forma única sin puntos diacríticos y con plegado de comillas, de modo que las variantes puramente vocálicas no generen empates arbitrarios en la recuperación. La inferencia codifica cada oración una sola vez y agrupa todos sus tokens, por lo que la lematización de documentos escala con el número de oraciones y no con el número de tokens.

El entrenamiento utiliza únicamente las porciones de Knesset y Wikipedia del treebank UD hebreo de IAHLT que son redistribuibles abiertamente, más lexicones hebreos públicos. El banco de lemas deriva de un lexicón hebreo público y del lexicón morfológico MILA. La innovación técnica central es el mecanismo de recuperación con transducción acotada: la salida nunca es una cadena libre, sino una entrada del banco o una edición limitada de la palabra de entrada, lo que impide la generación de lemas inexistentes. La versión 0.4.0 del software corrige la normalización de formas de presentación hebreas y el manejo de texto no NFC; la 0.4.1 amplía la ventana de lectura de 160 a 512 subtokens sin cambiar los pesos.

## Capacidades

- Lematización de hebreo sensible al contexto: devuelve el lema correcto según la oración completa, no solo la forma superficial.
- Etiquetado de categoría gramatical (POS) como cabeza auxiliar del modelo.
- Recuperación desde banco fijo con transducción acotada: salidas siempre reales o ediciones limitadas de la entrada, sin cadenas libres.
- Manejo de texto extraído de PDF con formas de presentación hebreas (U+FB1D-U+FB4F) y ligaduras alef-lamed tras la versión 0.4.0.
- Procesamiento por oraciones de hasta 512 subtokens, con escalado documental proporcional al número de oraciones.
- API de Python (`shoshan.Lemmatizer`) con métodos `lemma`, `lemmatize_text` y `annotate` con offsets de carácter.
- No soporta tool calling, agentes, visión, audio ni modo de razonamiento: es un modelo especializado de etiquetado de tokens.

## Casos de uso

- Recuperación de información en hebreo: indexar documentos por lema en lugar de por forma superficial mejora la exhaustividad de la búsqueda; el modelo recupera lemas de un banco fijo, lo que evita términos de índice inexistentes.
- Procesamiento de documentos PDF en hebreo: tras la versión 0.4.0, el modelo maneja correctamente formas de presentación y texto no NFC, un escenario habitual en corpus administrativos y académicos escaneados.
- Análisis morfológico de corpus parlamentarios: entrenado sobre la porción Knesset del treebank IAHLT, es adecuado para anotar actas y transcripciones con lemas y POS consistentes.
- Normalización de vocabulario para motores de búsqueda y sistemas de preguntas y respuestas: la salida acotada al banco garantiza un vocabulario controlado y reproducible en producción.
- Enriquecimiento de pipelines de NLP hebreo: como paso previo a análisis sintáctico, traducción o clasificación, proporciona lemas y POS con una precisión fuera de dominio del 92,4 %.
- Construcción de lexicones y diccionarios: la API `annotate` con offsets de carácter permite alinear lemas con el texto original para generar entradas lexicográficas verificables.
- Evaluación de sistemas de lematización: su métrica B³ y su tasa de errores de bajo solapamiento en palabras no vistas sirven como referencia para comparar otros lematizadores hebreos.

## Benchmarks y rendimiento

| Metrica | Shoshan | DictaBERT-lex |
|---|---|---|
| Precisión de lema (fuera de dominio) | 92,4 % | no disponible |
| Precisión de lema (en dominio) | 94,3 % | no disponible |
| B³ consistencia, precisión | 0,965 | 0,906 |
| B³ consistencia, recall | 0,953 | 0,932 |
| Errores de bajo solapamiento en palabras no vistas | 0,0 % | 12,3 % |

Los resultados fuera de dominio se miden sobre registros reservados. Según la model card, DictaBERT-lex se entrenó con más datos, incluidos los dominios reservados para evaluación, por lo que la comparación es conservadora. No se han publicado resultados de MMLU, HumanEval ni GSM8K, que no aplican a este tipo de modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; el repositorio ocupa 1,5 GB, lo que da una cota superior del espacio en disco necesario para pesos y banco.
- GPU recomendadas: no disponible. Al tratarse de un encoder tipo BERT, es previsible que quepa en GPU de consumo, pero no se confirma en la documentación.
- Cabe en consumer GPU: no confirmado en la información disponible.
- Opciones de despliegue: paquete Python `shoshan` (`pip install shoshan`) con `Lemmatizer.from_pretrained()`; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. La model card indica que la inferencia escala con el número de oraciones, no con el de tokens, al codificar cada oración una sola vez.

## Comparativa con modelos similares

| Modelo | Tipo | Contexto | Precisión de lema | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Shoshan | Encoder + recuperación con transducción acotada | 512 subtokens | 92,4 % fuera de dominio | MIT (código); encoder sujeto a licencia de DictaBERT | HuggingFace, PyPI, GitHub |
| DictaBERT-lex | Encoder generativo de lemas por token | no disponible | no disponible (B³ 0,906 / 0,932) | no disponible | HuggingFace (dicta-il) |
| DictaBERT (base) | Encoder transformer | no disponible | no aplica (no es lematizador) | no disponible | HuggingFace (dicta-il) |

La comparación principal es con DictaBERT-lex, que predice cada lema como un único token de su vocabulario y presenta un 12,3 % de errores de bajo solapamiento en palabras no vistas, frente al 0,0 % de Shoshan. No se dispone de datos de otros lematizadores hebreos comparables en la información proporcionada.

## Limitaciones y advertencias

- Solo admite hebreo; no es multilingüe.
- La unidad de entrada es una oración de hasta 512 subtokens; las palabras posteriores se devuelven con `source="truncated"` y su forma superficial como lema, por lo que es necesario segmentar previamente textos largos.
- El banco de lemas está normalizado sin puntos diacríticos y con plegado de comillas; las variantes vocálicas no se distinguen en la recuperación.
- Riesgo de sesgo derivado del corpus de entrenamiento (Knesset y Wikipedia), que puede infrarrepresentar registros coloquiales, técnicos o dialectales.
- El encoder está sujeto a la licencia de DictaBERT, distinta de la MIT del código; es necesario verificar sus términos para uso comercial.
- El banco de lemas deriva de un lexicón público y del lexicón MILA; la procedencia y los términos se detallan en `docs/DATA_STATEMENT.md` del repositorio de código.
- En versiones anteriores a 0.4.0, el texto extraído de PDF con formas de presentación producía lematizaciones incorrectas (por ejemplo, `אנשים` interpretado como `נשים`); es necesario actualizar el software y reprocesar, no solo muestrear.
- Los offsets de carácter de `annotate` cambian en entradas que la normalización reescribe (texto no NFC y formas de presentación).
- No soporta tool calling, agentes ni generación de texto libre; no debe emplearse para tareas generativas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/HebArabNlpProject/shoshan
- Repositorio de código: https://github.com/ivrit/shoshan
- Demo en HuggingFace Spaces: https://huggingface.co/spaces/noamor/shoshan-demo
- Changelog v0.4.0: https://github.com/ivrit/shoshan/releases/tag/v0.4.0
- Changelog v0.4.1: https://github.com/ivrit/shoshan/releases/tag/v0.4.1
- Encoder base DictaBERT: https://huggingface.co/dicta-il/dictabert
