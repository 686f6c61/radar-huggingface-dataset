# shanexf/24679-garments-fewshot-qwen3

## Resumen

`shanexf/24679-garments-fewshot-qwen3` es un pipeline de clasificación de texto basado en prompting sobre el modelo `Qwen/Qwen3-4B-Instruct-2507`. No se ha entrenado ni ajustado ningún peso: el repositorio documenta un método (*method card*) que resuelve una tarea de clasificación de descripciones cortas de prendas de vestir en cinco categorías (`top`, `bottom`, `outerwear`, `dress`, `footwear`) mediante aprendizaje en contexto (*few-shot*). El autor lo desarrolló como trabajo de la asignatura 24-679 (otoño de 2026) y lo plantea como punto de comparación frente a un DistilBERT ajustado sobre el mismo conjunto de datos.

El interés técnico del artefacto está en la metodología, no en el modelo subyacente. Se comparan tres configuraciones de prompting (zero-shot, one-shot adaptativo y 5-shot adaptativo) más sendas ablaciones con selección aleatoria de ejemplos, midiendo precisión, macro F1, número de tokens de prompt, latencia por consulta y coste estimado. La selección de ejemplos se hace con TF-IDF (unigramas y bigramas de palabra, más n-gramas de caracteres de 3 a 5) y similitud coseno sobre un pool de 70 descripciones originales.

El contexto usado está fijado en 4096 tokens, el modelo se carga en `float16` sobre una GPU Tesla T4 y la decodificación es voraz con respuestas restringidas mediante Outlines a una de las cinco etiquetas. Todas las configuraciones alcanzan precisión y macro F1 de 1,0 tanto en validación (15 ejemplos) como en test (15 ejemplos), por lo que la comparación real la marcan los costes: el 5-shot adaptativo consume unos 418 tokens de prompt por consulta frente a los 183 del zero-shot, con una latencia relativa de 1,81 veces.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada del modelo base Qwen3-4B-Instruct-2507); el repositorio no entrena pesos, solo define un pipeline de prompting |
| Parametros totales | 4 mil millones (modelo base Qwen3-4B-Instruct-2507) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | 4096 tokens, límite fijado en el pipeline |
| Tipos de cuantizacion | no disponible; la ejecución de referencia usa `float16` |
| Idiomas soportados | en (inglés) |
| Licencia | `other` / `classroom-use-only` (uso exclusivo en aula) |
| Formato de pesos | no aplica: el repositorio no contiene pesos entrenados, solo el pipeline de prompting y `prompts.json` |

## Arquitectura y entrenamiento

No hay entrenamiento. El repositorio implementa un sistema de *in-context learning* sobre `Qwen/Qwen3-4B-Instruct-2507` (revisión `cdbee75f17c01a7cc42f958dc650907174af0554`), cargado con Transformers 5.17.0 en `float16`. La inferencia es voraz (`do_sample=False`, `max_new_tokens=8`) y la salida está restringida con Outlines 1.3.3 a exactamente una de las cinco etiquetas, lo que elimina respuestas fuera de formato. El *system prompt* es «You are a precise product-catalogue assistant. Reply with the minimal text required.» y el *prompt* de usuario sigue la plantilla `{instruction}\n\n{examples}Classify the following:\nText: {text}\nCategory:`, con cada ejemplo renderizado como `Example:\nText: …\nCategory: …`.

La innovación metodológica es el mecanismo de selección de ejemplos (`fewshot_pipeline.py`): se construye un vectorizador TF-IDF sobre el pool (unigramas y bigramas de palabra más n-gramas de caracteres de 3 a 5 con `char_wb`, tf sublineal) ajustado únicamente sobre el pool, y se calcula la similitud coseno entre la consulta y cada descripción candidata. Los K más similares se insertan como ejemplos, con el más parecido colocado en última posición, es decir, lo más cerca posible de la consulta. La ablación `random` extrae K filas del pool con una semilla por consulta (24679 + índice de consulta). El coste de selección es un producto de matrices dispersas sobre 70 filas, por debajo del milisegundo.

Los datos provienen del conjunto `leixiang25/24679-hw1-text-garments` (commit `49d58b5a09420224a7d4d00fd983b9febd260f8f`): descripciones ficticias de prendas escritas por un compañero de clase, sin datos personales ni marcas y sin licencia asignada en la *dataset card*. El pool de demostración son las 70 descripciones originales de entrenamiento (nunca se usan copias aumentadas en el prompt), la validación son 15 originales y el test otros 15 originales. Pool y ambos *holdouts* son disjuntos por `parent_id` y `message_id`, y el solapamiento de texto exacto entre pool y test es 0.

## Capacidades

- Clasificación de texto en cinco categorías cerradas de prendas: `top`, `bottom`, `outerwear`, `dress`, `footwear`.
- Aprendizaje en contexto: funciona en régimen zero-shot, one-shot y 5-shot sin actualizar pesos.
- Selección adaptativa de ejemplos por similitud TF-IDF + coseno, frente a selección aleatoria.
- Decodificación restringida a un vocabulario cerrado de etiquetas mediante Outlines, lo que garantiza salida válida.
- Manejo de instrucciones en inglés para normalizar la tarea (definiciones explícitas de cada categoría en el prompt).
- Resistencia básica a inyección de prompt: el *system prompt* indica tratar la descripción como dato y no como instrucción.
- No dispone de *tool calling* ni *function calling*.
- No dispone de modo agente ni razonamiento multi-paso.
- No soporta visión, audio ni ninguna otra modalidad.
- No es multilingüe: solo inglés.

## Casos de uso

- Catalogación automática de fichas de producto: dado un título o descripción corta de una prenda, asignar una de las cinco categorías para poblar el árbol de categorías de un e-commerce. El pipeline zero-shot ya resuelve el caso con 183 tokens de prompt por consulta.
- Enrutamiento previo a búsqueda facetada: usar la etiqueta predicha como filtro de categoría antes de ejecutar una búsqueda vectorial o léxica, reduciendo el espacio de candidatos en el índice.
- Normalización de catálogos de proveedores externos: mapear taxonomías heterogéneas de terceros a una taxonomía interna de cinco clases, con la decodificación restringida garantizando que nunca aparezca una etiqueta fuera de catálogo.
- Construcción de conjuntos de datos etiquetados: preetiquetar grandes volúmenes de descripciones para revisión humana posterior, aprovechando que el modelo es local y no requiere llamadas a API externas.
- Comparación de estrategias de prompting en docencia o investigación: el repositorio sirve como referencia reproducible para medir el compromiso entre precisión, tokens de prompt, latencia y coste al pasar de zero-shot a 5-shot adaptativo.
- Moderación o validación de publicaciones de usuario: comprobar que una descripción subida por un vendedor corresponde a la categoría declarada, marcando discrepancias para revisión.
- Estimación de costes de inferencia: el pipeline incluye medidas de tokens de prompt y un cálculo de coste a precio de referencia de 0,15 USD por millón de tokens de entrada (0,028 USD por 1000 consultas en zero-shot, 0,063 USD en 5-shot adaptativo), útil para dimensionar presupuestos.
- Despliegue en hardware de gama baja: al ejecutarse en una Tesla T4 en `float16`, es viable desplegarlo en entornos con GPU modesta o en modo local sin depender de servicios en la nube.

## Benchmarks y rendimiento

Los únicos resultados publicados son los del propio *method card*, medidos sobre dos particiones de 15 ejemplos originales cada una. No hay MMLU, HumanEval, GSM8K ni ningún otro benchmark estándar.

Validación (comprobación de ajustes del prompt):

| Pipeline | k | Método | Accuracy | Macro F1 | Tokens de prompt (media) | Latencia (s/consulta) | Ejemplos con la etiqueta correcta |
|---|---|---|---|---|---|---|---|
| zero-shot | 0 | none | 1 | 1 | 184 | 0,949 | no disponible |
| one-shot | 1 | similarity | 1 | 1 | 232,533 | 0,230 | 0,800 |
| one-shot | 1 | random | 1 | 1 | 231,467 | 0,405 | 0,267 |
| 5-shot | 5 | similarity | 1 | 1 | 420,800 | 0,356 | 0,787 |
| 5-shot | 5 | random | 1 | 1 | 418,600 | 0,380 | 0,133 |

Test (comparación final; coste a precio de referencia de 0,15 USD por millón de tokens de entrada):

| Pipeline | k | Método | Accuracy | Macro F1 | Tokens de prompt (media) | Latencia (s/consulta) | Ejemplos con la etiqueta correcta | USD por 1000 consultas | Latencia relativa vs zero-shot |
|---|---|---|---|---|---|---|---|---|---|
| zero-shot | 0 | none | 1 | 1 | 183,467 | 0,208 | no disponible | 0,028 | 1,000 |
| one-shot | 1 | similarity | 1 | 1 | 230,333 | 0,230 | 0,933 | 0,035 | 1,103 |
| one-shot | 1 | random | 1 | 1 | 230,933 | 0,255 | 0,067 | 0,035 | 1,225 |
| 5-shot | 5 | similarity | 1 | 1 | 417,933 | 0,377 | 0,880 | 0,063 | 1,810 |
| 5-shot | 5 | random | 1 | 1 | 418,067 | no disponible (dato truncado en la fuente) | no disponible | no disponible | no disponible |

## Requisitos de hardware

- VRAM estimada para inferencia: en `float16`, alrededor de 8-10 GB contando pesos (unos 8 GB para 4 mil millones de parámetros) más caché KV y activaciones con prompts de 180 a 420 tokens; la ejecución de referencia cabe con holgura en una Tesla T4 de 16 GB. En cuantización de 4 bits el requisito bajaría a unos 3-4 GB, aunque el autor no publica esquemas de cuantización (estimación, no dato del autor).
- GPU recomendadas: Tesla T4 (la usada por el autor), así como cualquier GPU con 10 GB o más de VRAM. Una RTX 4090, L4 o A10 ejecutarían el pipeline sin problema.
- Cabe en GPU de consumo: sí, en tarjetas con 10-12 GB o más de VRAM (RTX 3060 12 GB, RTX 4070, RTX 4090). Con cuantización de 4 bits cabría en GPUs de 6-8 GB.
- Opciones de despliegue: el autor usa Transformers 5.17.0 más Outlines 1.3.3 para decodificación restringida. vLLM o TGI son alternativas viables para servir el modelo base con mayor throughput, pero no están verificadas en la información disponible. llama.cpp u Ollama requerirían pesos en GGUF, que no se publican en este repositorio.
- Latencia medida: 0,208 s por consulta en zero-shot, 0,230 s en one-shot con selección por similitud, 0,255 s en one-shot aleatorio, 0,377 s en 5-shot por similitud, sobre Tesla T4 con decodificación voraz y `max_new_tokens=8`.
- Throughput: no disponible.
- Coste: el *method card* calcula, a un precio de referencia de 0,15 USD por millón de tokens de entrada, 0,028 USD por 1000 consultas en zero-shot y 0,063 USD en 5-shot adaptativo, en un escenario de API externa. La ejecución real del autor es local y no llamó a ninguna API.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Accuracy en el mismo test | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Este pipeline (5-shot adaptativo sobre Qwen3-4B-Instruct-2507) | 4 000 M | 4096 tokens (fijado) | Prompting en contexto, sin entrenamiento | 1,0 | classroom-use-only | Repositorio de método, sin pesos |
| Este pipeline (zero-shot sobre Qwen3-4B-Instruct-2507) | 4 000 M | 4096 tokens (fijado) | Prompting en contexto, sin entrenamiento | 1,0 y 183 tokens de prompt por consulta | classroom-use-only | Repositorio de método, sin pesos |
| DistilBERT ajustado sobre los mismos datos | no disponible | no disponible | Ajuste supervisado | no disponible en esta ficha | no disponible | Mencionado como comparación en el *method card* |
| Qwen3-4B-Instruct-2507 sin pipeline de clasificación | 4 000 M | no disponible | Modelo generativo de propósito general | no aplica (no es un clasificador) | no disponible en esta ficha | Público en HuggingFace |

## Limitaciones y advertencias

- La licencia es `other` con nombre `classroom-use-only`: no está permitido el uso comercial. Es un artefacto académico y debe tratarse como tal.
- El *model card* no publica sesgos conocidos, pero el modelo base Qwen3-4B-Instruct-2507 puede arrastrar los sesgos habituales de su corpus de entrenamiento; no hay evaluación específica en esta información.
- Riesgo de alucinación mitigado por la decodificación restringida con Outlines, que limita la salida a las cinco etiquetas. Aun así, la asignación puede ser incorrecta en descripciones ambiguas o fuera de dominio (por ejemplo, accesorios o calzado deportivo técnico).
- El conjunto de evaluación es diminuto: 15 ejemplos de validación y 15 de test. Un resultado de precisión 1,0 en esa escala no permite extrapolar el rendimiento a producción con garantías estadísticas.
- El dataset de origen es ficticio, escrito por un estudiante, sin licencia asignada y sin datos personales ni marcas. No refleja la distribución real de catálogos comerciales.
- Solo inglés. Cualquier descripción en otro idioma queda fuera del alcance declarado.
- El límite de contexto está fijado en 4096 tokens en el pipeline, aunque el modelo base pueda soportar ventanas mayores; los prompts observados van de 183 a 418 tokens, muy por debajo del límite.
- El repositorio no contiene pesos: depende por completo del modelo base y de la plantilla de prompt documentada. Cualquier cambio en `prompts.json` o en la versión de Outlines puede alterar los resultados.
- El pipeline no incluye defensas robustas frente a inyección de prompt más allá de la instrucción textual de tratar la descripción como dato.
- El dato de latencia y de coste de la fila «5-shot (random)» en la tabla de test aparece truncado en la información disponible; no debe usarse como referencia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/shanexf/24679-garments-fewshot-qwen3
- Dataset utilizado: https://huggingface.co/datasets/leixiang25/24679-hw1-text-garments
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- No se han encontrado otros enlaces relevantes (papers, blogs, repositorios o demos) en la búsqueda web realizada; los resultados devueltos no guardan relación con este modelo.
