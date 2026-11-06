# ShanelBastian/multilingual-e5-base-q8-reduce-range

## Resumen

`ShanelBastian/multilingual-e5-base-q8-reduce-range` es una compilación ONNX cuantizada a 8 bits con `reduce_range` del modelo de embeddings `intfloat/multilingual-e5-base`. No es un modelo nuevo ni un reentrenamiento: es un artefacto derivado que conserva los pesos del original y solo cambia su representación numérica para inferencia en CPU. Lo publica ShanelBastian, un tercero no afiliado a los autores originales, bajo la misma licencia MIT del modelo base.

El problema que aborda es concreto y medible: el fichero cuantizado oficial (`model_qint8_avx512_vnni.onnx`) del repositorio base produce resultados distintos según las instrucciones SIMD disponibles en el procesador. El autor reporta un MRR medio (12 idiomas) de 0,841-0,852 en CPUs con VNNI frente a 0,773 en CPUs sin VNNI. Esta compilación usa un rango de pesos de 7 bits (la opción `reduce_range` de ONNX Runtime), lo que estabiliza la calidad en torno a 0,843-0,845 independientemente del hardware.

El resultado es un encoder de frases de 768 dimensiones, ventana de 512 tokens y propósito general para similitud semántica y recuperación multilingüe. Su relevancia es operativa: permite desplegar búsqueda semántica en infraestructura CPU heterogénea sin que el índice pierda calidad según el servidor que atienda la petición. El repositorio ocupa 0,3 GB y no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (base: intfloat/multilingual-e5-base); artefacto ONNX cuantizado dinámicamente |
| Parametros totales | no disponible (el modelo base E5-base tiene ~278M; no confirmado en la informacion proporcionada) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens de entrada |
| Tipos de cuantizacion | INT8 dinámica con `reduce_range` (rango de pesos de 7 bits); fichero `model_q8_reduce_range.onnx` |
| Idiomas soportados | multilingüe (heredado del modelo base); listado concreto no disponible |
| Licencia | MIT |
| Formato de pesos | ONNX (`onnx/model_q8_reduce_range.onnx`), tokenizer en `onnx/tokenizer.json` |
| Dimension de embedding | 768 |
| Pooling | mean pooling sobre la máscara de atención + normalización L2 |
| Prefijos requeridos | `query: ` para consultas, `passage: ` para pasajes |
| Version de ONNX Runtime usada | 1.31.1 |
| Revision base | `d128750597153bb5987e10b1c3493a34e5a4502a` |
| SHA-256 del ONNX | `8db030f6ad537c840cb59043264ed3ad1b7e8f8b9740ffa52f26b628638e6a1e` |
| Tamano del repo | 0,3 GB |

## Arquitectura y entrenamiento

El modelo subyacente es un transformer encoder bidireccional de la familia E5, entrenado originalmente por intfloat con objetivos de contraste y prefijos asimétricos (`query:` / `passage:`) para recuperación densa. Esta publicación no aporta entrenamiento propio: parte de `onnx/model.onnx` de la revisión `d128750597153bb5987e10b1c3493a34e5a4502a` (SHA-256 `84a4d426f7e87a6bf5bf195f0bae2c4a7d15f675b23ca96f42fab8326d7a77aa`) y aplica cuantización dinámica INT8.

La innovación técnica es la elección de `reduce_range`. La cuantización dinámica INT8 estándar explota las instrucciones VNNI cuando están presentes, pero en CPUs sin VNNI el rango efectivo se degrada y la calidad cae. Limitar el rango de pesos a 7 bits evita esa asimetría: el autor reporta que la reconstrucción del fichero fue byte a byte idéntica en siete máquinas, lo que da reproducibilidad al artefacto. El script `quantize.py` incluido en el repositorio documenta el procedimiento con `reduce_range` como último argumento.

## Capacidades

- Generación de embeddings de frase de 768 dimensiones para similitud semántica y recuperación densa.
- Búsqueda multilingüe: el modelo base está diseñado para alinear consultas y pasajes en distintos idiomas en un mismo espacio vectorial.
- Recuperación asimétrica mediante prefijos `query: ` y `passage: `, requisito para obtener la calidad esperada.
- Indexación de pasajes de hasta 512 tokens; textos más largos deben truncarse o dividirse.
- No genera texto, no razona, no ejecuta código ni matemáticas: es exclusivamente un encoder.
- No soporta tool calling, function calling ni flujos de agente multi-paso.
- No tiene visión, audio ni modo de pensamiento.
- Inferencia en CPU mediante ONNX Runtime, sin dependencia de GPU.

## Casos de uso

- Búsqueda semántica en infraestructura CPU heterogénea: al estabilizar el MRR entre CPUs con y sin VNNI, permite servir el mismo índice desde un parque mixto de servidores sin degradación silenciosa en los nodos antiguos.
- Recuperación aumentada (RAG) en aplicaciones multilingües: indexar la base documental con `passage: ` y consultar con `query: ` en el idioma del usuario, aprovechando el alineamiento cross-lingüe del modelo base.
- Deduplicación y agrupación de documentos: calcular embeddings de pasajes y agrupar por similitud coseno para consolidar tickets, artículos o registros duplicados.
- Filtrado previo en pipelines de moderación o clasificación: usar la similitud contra un conjunto de frases de referencia para descartar candidatos antes de invocar un modelo generativo, reduciendo coste.
- Búsqueda interna en documentación técnica: desplegar el ONNX con ONNX Runtime en un servicio ligero sin GPU, con latencia adecuada para autocompletado y búsqueda interactiva.
- Clasificación few-shot por prototipos: construir centroides por categoría a partir de unos pocos ejemplos etiquetados y asignar nuevas entradas por vecino más cercano en el espacio de embeddings.
- Evaluación de calidad de traducciones o paráfrasis: medir similitud semántica entre original y candidato como métrica auxiliar en pipelines de control de calidad.

## Benchmarks y rendimiento

El autor publica una comparativa de MRR medio sobre 12 idiomas, con 40 pasajes y 10 preguntas por idioma. Es una prueba interna de comparación de builds, no un benchmark estándar:

| Build | AVX-512 VNNI | AVX-VNNI | Sin VNNI |
|---|---|---|---|
| Fichero cuantizado del repo base | 0,841 | 0,852 | 0,773 |
| Esta build (`reduce_range`) | 0,843 | 0,845 | 0,845 |
| Modelo fp32 completo | 0,867 | 0,867 | 0,867 |

No se han publicado resultados de benchmarks estándar (MTEB, BEIR, MMLU, etc.) en la información disponible para esta build concreta.

## Requisitos de hardware

- Inferencia exclusivamente en CPU mediante ONNX Runtime; el artefacto es un ONNX INT8, no un GGUF ni un safetensors.
- VRAM: no aplica, no requiere GPU.
- RAM estimada: el repositorio completo ocupa 0,3 GB, por lo que el modelo cargado en memoria cabe holgadamente en menos de 1 GB.
- GPU recomendadas: no aplica; el autor no documenta ejecución en GPU para este fichero.
- Cabe en cualquier CPU de consumo con AVX2; el beneficio de `reduce_range` se aprecia precisamente en CPUs sin VNNI.
- Despliegue: ONNX Runtime (versión de referencia 1.31.1), integrable en servicios Python, Rust o C++ con el runtime de ONNX.
- Latencia y throughput: no disponibles en la información proporcionada.
- Advertencia de portabilidad: los vectores difieren ligeramente entre CPUs con AVX-512 y otras (coseno medio 0,998, mínimo 0,964). Si se mueve un índice entre tipos de CPU, hay que reindexar.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Esta build (multilingual-e5-base q8 reduce_range) | no disponible (~278M en el base) | 512 | ONNX INT8 | MIT | Calidad estable entre CPUs con y sin VNNI (MRR 0,843-0,845) |
| intfloat/multilingual-e5-base (fp32) | ~278M | 512 | safetensors / ONNX | MIT | Referencia de calidad (MRR 0,867 en la prueba del autor); más pesado y lento en CPU |
| intfloat/multilingual-e5-base (qint8_avx512_vnni oficial) | ~278M | 512 | ONNX INT8 | MIT | Mejor en CPUs con VNNI (hasta 0,852), peor sin VNNI (0,773) |
| intfloat/multilingual-e5-small | no disponible | 512 | safetensors / ONNX | MIT | Alternativa más ligera de la misma familia; métricas de esta build no disponibles |

## Limitaciones y advertencias

- No es una publicación oficial: el autor declara explícitamente que no está respaldada por los autores originales de E5.
- La evaluación es interna y reducida (40 pasajes y 10 preguntas por idioma en 12 idiomas); sirve para comparar builds, no para predecir rendimiento en una base de conocimiento real.
- Los embeddings no son idénticos entre CPUs con AVX-512 y sin ella (coseno mínimo 0,964): mover un índice entre tipos de CPU exige reindexar.
- Ventana de 512 tokens: los documentos largos requieren chunking, con el riesgo de perder contexto en las fronteras.
- Es un encoder de similitud, no un generador: no produce respuestas, no razona y no ejecuta herramientas.
- Riesgo de alucinación no aplica en el sentido generativo, pero sí hay riesgo de recuperaciones irrelevantes si se omiten los prefijos `query:` / `passage:` o si no se aplica mean pooling con máscara y normalización L2.
- Sesgos: no documentados en la información proporcionada; al heredarse del modelo base, reproducirá los sesgos de sus datos de entrenamiento.
- Licencia MIT: permite uso comercial y modificación, pero conviene conservar el aviso de copyright y la atribución al modelo base.
- Cero descargas y cero likes en el momento de la consulta: sin validación comunitaria ni mantenimiento demostrado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ShanelBastian/multilingual-e5-base-q8-reduce-range
- Modelo base: https://huggingface.co/intfloat/multilingual-e5-base
- Repositorio del modelo base (revisión usada): https://huggingface.co/intfloat/multilingual-e5-base/tree/d128750597153bb5987e10b1c3493a34e5a4502a
- Script de cuantización: `quantize.py` incluido en el repositorio del modelo
- ONNX Runtime: https://onnxruntime.ai/
