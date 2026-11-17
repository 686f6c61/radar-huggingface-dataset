# iapp/OpenThai2.0-LATTE-WordSeg-Lite

## Resumen

OpenThai2.0-LATTE-WordSeg-Lite es un modelo de segmentación de palabras en tailandés desarrollado por iApp Technology, publicado bajo el paraguas de la familia OpenThai 2.0. Resuelve un problema específico del procesamiento del lenguaje natural en tailandés: la ausencia de espacios entre palabras en el texto escrito, que obliga a los pipelines de NLP a resolver la tokenización léxica antes de cualquier otra tarea. El modelo se apoya en la arquitectura LATTE (Lattice ATTentive Encoding), un encoder a nivel de carácter que aprende a predecir cortes sobre una retícula de candidatos.

La propuesta diferencial es triple: ofrece tres granularidades de segmentación en una sola pasada (`long` para compuestos, `short` para palabras y `minimal` para morfemas), permite recuperar las n lecturas más probables de una cadena ambigua mediante `tokenize_nbest`, y todo ello con un coste computacional mínimo. Con 1,17 millones de parámetros, un artefacto de 3 MB y un diccionario de 0,8 MB, funciona exclusivamente en CPU con ONNX Runtime y NumPy.

Es relevante ahora porque demuestra que una tarea lingüística central puede resolverse con un modelo de menos de 2 MB y licencia CC BY-SA 4.0, entrenado solo con datos compatibles con uso comercial. Su rendimiento declarado (F1 de palabra medio de 85,6 sobre siete conjuntos de prueba tailandeses) supera a alternativas establecidas como DeepCut, AttaCut-SC y PyThaiNLP newmm.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LATTE (Lattice ATTentive Encoding), encoder a nivel de carácter con retícula de candidatos |
| Parametros totales | 1,17 M |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 (pesos distribuidos como `model.int8.onnx`) |
| Idiomas soportados | tailandés (`th`) |
| Licencia | CC BY-SA 4.0 (modelo y diccionario); código Apache-2.0 |
| Formato de pesos | ONNX (`model.int8.onnx`), más `lexicon.txt.gz`, `charclass.npz` y `manifest.json` |

## Arquitectura y entrenamiento

LATTE es un encoder atencional que opera sobre caracteres y sobre una retícula de segmentaciones candidatas, en lugar de un transformer autoregresivo convencional. El modelo resultante es un destilado (knowledge distillation) de modelos LATTE de mayor tamaño, lo que explica su reducido número de parámetros (1,17 M) manteniendo tres cabeceras de granularidad: `long`, `short` y `minimal`. El artefacto se distribuye cuantizado a int8 para inferencia en CPU.

Los datos de entrenamiento son exclusivamente aquellos cuyas licencias permiten uso comercial: para `long`, VISTEC-TP-TH-2021; para `short`, UD Thai-TUD y Wisesight-1000; para `minimal`, la parte CC BY-SA 4.0 de los datos khammoon. El autor declara explícitamente que no se emplearon BEST, ORCHID ni otros corpus no comerciales. No se especifica en la información disponible el número de tokens de entrenamiento ni si hubo etapas de RLHF o DPO (poco probables en una tarea de etiquetado secuencial).

## Capacidades

- Segmentación de palabras en tailandés con tres unidades seleccionables: `long` (compuestos completos), `short` (palabras, por defecto) y `minimal` (morfemas).
- Recuperación de las n segmentaciones más probables de una cadena ambigua, ordenadas por probabilidad, mediante `tokenize_nbest`.
- Procesamiento por lotes (`tokenize_batch`) para mejorar el rendimiento en grandes volúmenes de texto.
- Interfaz de línea de comandos (`openthai-latte-wordseg-lite --unit long "..."`).
- Integración en el paquete Python `iapp-ai` con utilidades de texto tailandés y offsets de token.
- Reunión automática de números (por ejemplo, `4.1`) y lectura de dígitos tailandeses como arábigos en la integración `iapp-ai`.
- No soporta tool calling, ni agentes, ni razonamiento multi-paso, ni visión, ni audio: es un modelo de clasificación de tokens.
- Multilingüismo: únicamente tailandés; las secuencias de letras ASCII o de dígitos no se dividen, pero texto en otros alfabetos, emojis multicarácter y algunas URL o correos pueden segmentarse incorrectamente.

## Casos de uso

- Preprocesado de pipelines de NLP en tailandés: cualquier tarea posterior (POS tagging, NER, análisis de sentimiento) requiere tokenización léxica; el modelo la resuelve en CPU con 60 000 caracteres por segundo en un solo hilo, suficiente para procesar corpus completos sin GPU.
- Indexación y búsqueda en motores de recuperación documental: la segmentación `short` permite construir índices invertidos sobre texto tailandés sin separadores, con un coste de infraestructura prácticamente nulo al ejecutarse en el mismo servidor de aplicación.
- Análisis de sentimiento y moderación de contenido en redes sociales: los conjuntos Wisesight forman parte del entrenamiento, y el modelo puede procesar lotes de comentarios y publicaciones con `tokenize_batch` a 105 000 caracteres por segundo.
- Extracción de entidades y normalización de datos en atención al cliente: la unidad `long` conserva compuestos como `เจ้าหน้าที่` (funcionario) o `การศึกษา` (educación), lo que mejora la coincidencia con diccionarios de entidades y bases de conocimiento.
- Análisis morfológico para lingüística computacional: la unidad `minimal` ofrece segmentación a nivel de morfema, útil para estudios de composición léxica y para alinear con anotaciones de corpus como khammoon.
- Desambiguación asistida en edición y corrección de texto: `tokenize_nbest` devuelve las lecturas alternativas de una frase ambigua con sus probabilidades, lo que permite a un revisor humano elegir la segmentación correcta en contextos como `ตากลม`.
- Despliegue en entornos con recursos restringidos: al requerir solo ONNX Runtime y NumPy, el modelo cabe en dispositivos embebidos, contenedores mínimos o funciones serverless sin dependencias pesadas.

## Benchmarks y rendimiento

Datos declarados por el autor sobre siete conjuntos de prueba tailandeses (F1 de palabra medio y F1 de frontera), con velocidad medida en un hilo de CPU:

| Sistema | F1 palabra | F1 frontera | Caracteres/s |
|---|---|---|---|
| LATTE-WordSeg-Lite (`short`) | 85,6 | 93,3 | 60K (105K por lotes) |
| SEFR CUT | 84,5 | 92,6 | 1,9K |
| DeepCut | 84,5 | 92,6 | 2,6K |
| AttaCut-SC | 84,0 | 92,4 | 78K |
| khammoon | 81,8 | 91,3 | 43K |
| PyThaiNLP newmm | 70,9 | 85,7 | 937K |

Por unidad, LATTE-WordSeg-Lite obtiene: `long` 83,1 / 92,0; `minimal` 82,1 / 91,5. La comparación con khammoon debe hacerse contra `minimal`, ya que khammoon segmenta morfemas y no palabras. La integración vía `iapp-ai` presenta un F1 de palabra medio de 85,7, con diferencias de salida respecto al wheel en hasta un 3 % de las líneas de un conjunto de prueba.

## Requisitos de hardware

- VRAM: no requiere GPU; el modelo (3 MB) y el diccionario (0,8 MB) caben en memoria RAM de cualquier equipo.
- GPU recomendadas: no aplica; el diseño está orientado a CPU.
- Compatibilidad con GPU de consumo: no aplica, pero el modelo puede ejecutarse en cualquier CPU moderna, incluidos portátiles y dispositivos embebidos.
- Despliegue: ONNX Runtime + NumPy (Python 3.9 o superior); wheel autocontenido que funciona sin conexión; también disponible a través del paquete `iapp-ai[nlp]`.
- Latencia y throughput: aproximadamente 60 000 caracteres por segundo en un hilo de CPU con una línea por llamada y 105 000 con líneas por lotes; `Segmenter(batch_chars=0)` fuerza el procesamiento línea a línea.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | F1 palabra | Licencia | Distribución |
|---|---|---|---|---|---|
| LATTE-WordSeg-Lite | 1,17 M | no disponible | 85,6 | CC BY-SA 4.0 | ONNX int8, CPU |
| DeepCut | no disponible | no disponible | 84,5 | no disponible en la información | no disponible |
| AttaCut-SC | no disponible | no disponible | 84,0 | no disponible en la información | no disponible |
| PyThaiNLP newmm | basado en diccionario | no aplica | 70,9 | no disponible en la información | librería Python |

SEFR CUT y khammoon aparecen en los benchmarks del autor con F1 de 84,5 y 81,8 respectivamente, pero no se dispone de sus especificaciones de parámetros, contexto o licencia en la información proporcionada. La ventaja diferencial de LATTE-WordSeg-Lite frente a todos ellos es la combinación de precisión, tres granularidades, salida n-best y ejecución en CPU con dependencias mínimas.

## Limitaciones y advertencias

- Los corpus tailandeses discrepan sobre qué constituye una palabra; las puntuaciones bajan en BEST y ORCHID, cuyas convenciones no sigue ninguna de las tres unidades.
- La unidad `long` conserva los compuestos de su corpus de entrenamiento, no todos los compuestos de diccionario.
- Riesgo de segmentación incorrecta en cadenas ambiguas y cortas sin contexto (por ejemplo, `แปลกว่า` → `แปล | ก | ว่า`); `tokenize_nbest` mitiga el problema listando lecturas alternativas.
- Solo tailandés: texto en otros alfabetos, emojis multicarácter y algunas URL o direcciones de correo pueden dividirse de forma incorrecta.
- La cuantización int8 provoca diferencias de segmentación entre procesar una línea sola o en lote en hasta un 2,9 % de las líneas de un conjunto de prueba, sin que ninguna puntuación varíe más de 0,05.
- La licencia CC BY-SA 4.0 del modelo y del diccionario impone compartir bajo la misma licencia las obras derivadas; el código es Apache-2.0. Verificar compatibilidad antes de integrarlo en productos propietarios.
- La integración vía `iapp-ai` reúne números y convierte dígitos tailandeses, por lo que su salida difiere del wheel en hasta un 3 % de las líneas.
- No se han publicado datos sobre sesgos específicos más allá de las limitaciones lingüísticas descritas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/iapp/OpenThai2.0-LATTE-WordSeg-Lite
- Benchmark reproducible y conjuntos de prueba: https://huggingface.co/datasets/iapp/OpenThai2.0-WordSeg-Benchmark
- Paquete Python `iapp-ai` en PyPI: https://pypi.org/project/iapp-ai/
- Guía de NLP del SDK `iapp-ai`: https://github.com/iapp-technology/iapp_ai/blob/main/packages/iapp-sdk/docs/nlp.md
- Paper LATTE (referencia bibliográfica citada en la model card): Chay-intr, Kamigai et al., 2023, "LATTE: Lattice ATTentive Encoding for Character-based Word Segmentation"
- Paper LATTE-WordSeg-Lite: Chay-intr, Viriyayudhakorn y Theeramunkong, 2026, "LATTE-WordSeg-Lite: Multi-Granularity Thai Word Segmentation on a CPU, with a Reproducible Benchmark" (enlace directo no disponible en la información proporcionada)
- Aviso de licencias y atribuciones: archivo NOTICE del repositorio del modelo
