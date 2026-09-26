# fang718/pp-ocrv6-hanzi-ids-ocr

## Resumen

PP-OCRv6 Hanzi IDS es un modelo de reconocimiento de glifos CJK desarrollado por el usuario fang718, publicado bajo el identificador `fang718/pp-ocrv6-hanzi-ids-ocr`. Su particularidad es que no predice el punto de codigo Unicode del caracter, sino su IDS (Ideographic Description Sequence), es decir, la descripcion estructural de como se compone el caracter a partir de sus partes. Para el caracter 明 devuelve candidatos como `⿰日月` o `⿰日冃`, ordenados por verosimilitud. Resuelve el problema de identificar caracteres sin codigo asignado, variantes raras, formas regionales y gaiji (外字), para los que un modelo OCR basado en Unicode tendria que forzar el caracter al vecino codificado mas cercano.

El modelo esta disenado para un dominio muy acotado: imagenes de un solo caracter, renderizadas en un unico color, tinta oscura sobre fondo claro, procedentes de una fuente de ordenador. Bajo esas condiciones el autor declara una precision superior al 90 %, excluyendo caracteres sin descomposicion significativa, como los glifos de un solo componente (por ejemplo 木), que el modelo tiende a dividir de todos modos.

Arquitectonicamente es un encoder-decoder compacto: un backbone PPLCNetV4 medium en forma fusionada que actua como encoder de imagen, seguido de un decodificador autorregresivo Transformer de 4 capas con enmascaramiento gramatical, de modo que nunca emite una secuencia IDS sintacticamente invalida. Cada checkpoint tiene 19.665.475 parametros en FP32, y el repositorio distribuye dos checkpoints que se promedian a nivel de probabilidad durante la busqueda por haz. Es relevante ahora porque opera de forma independiente al modelo companero basado en Unicode, lo que permite cruzar ambas salidas y detectar discrepancias para revision humana.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder-decoder: backbone PPLCNetV4 medium + decodificador Transformer de 4 capas |
| Parametros totales | 19.665.475 por checkpoint (2 checkpoints en el ensemble) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica; la decodificacion esta limitada a 96 tokens de longitud maxima |
| Tipos de cuantizacion | no disponible (los pesos se distribuyen en FP32, sin variantes cuantizadas publicadas) |
| Idiomas soportados | no disponible (la tarea se limita a glifos CJK, sin metadatos de idioma) |
| Licencia | no disponible |
| Formato de pesos | PyTorch (`.pt`), FP32 |
| Tamano del repositorio | 0.2 GB |
| Entrada | Imagen de un solo glifo a 128×128, un caracter por imagen |
| Salida | Hasta 5 candidatos IDS ordenados por verosimilitud |
| Vocabulario | 3.459 tokens |
| Tarea (pipeline) | image-to-text |

## Arquitectura y entrenamiento

El modelo combina un encoder de glifos con un decodificador autorregresivo restringido por gramatica, sin etapa separada de deteccion ni segmentacion. El backbone es PPLCNetV4 en variante medium, en forma fusionada, y se mantiene como mapa de caracteristicas 2-D sin pooling vertical; es la misma familia de backbone que emplean los modelos de reconocimiento PP-OCRv6 de PaddleOCR. Una convolucion 1×1 proyecta de 768 a 256 dimensiones. La informacion posicional se inyecta mediante embeddings aprendidos de fila (64, 128) y columna (128, 128) concatenados hasta 256. El decodificador consta de 4 capas `TransformerDecoderLayer` con `d_model=256`, 8 cabezas de atencion, FFN de 1024, activacion GELU, pre-norm y mascara causal. La cabeza de salida comparte pesos con el embedding de tokens y anade un sesgo por token.

El vocabulario tiene 3.459 tokens: 3 especiales (`<PAD>`, `<BOS>`, `<EOS>`), 138 operadores de disposicion (como `⿰`, `⿱`, `⿲`, el parametrizado `⿻[b_]` o el anotado `{冃}⿵`), 136 clases de componentes, 57 componentes anotados y 3.176 componentes hoja. La aridad de cada token (cuantos hijos consume) sigue al operador IDS: `⿲` y `⿳` toman tres, el resto de operadores binarios toman dos, `⿾` y `⿿` toman uno y las hojas ninguno. Los programas de trazos `#(...)` y las anotaciones `{...}` son tokens atomicos que portan el texto de parametro completo, de modo que una prediccion puede recorrerse sin perdida.

En decodificacion, los logits se enmascaran en cada paso segun el numero de huecos sin rellenar: se prohiben `<PAD>`, `<BOS>` y cualquier token que desborde el presupuesto, `<EOS>` solo se permite cuando no quedan huecos, y un token solo es valido si su aridad encaja en los huecos abiertos. La busqueda por haz corre con `beam_size = 5` sobre el ensemble; si se obtienen menos de cinco salidas legales distintas, se redecodifica con `beam_size = 12`. Los candidatos se ordenan por log-probabilidad de secuencia sin normalizacion por longitud. La salida bruta pasa despues por una politica de canonizacion (`component_output_policy.json`) que reescribe un subarbol a una ortografia de componente mas frecuente solo si esta es al menos 4× mas frecuente en entrenamiento, verificando que la reescritura preserva la estructura normalizada. No se han publicado detalles sobre el volumen de datos de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO en la informacion disponible.

## Capacidades

- Prediccion de la secuencia IDS de un glifo CJK a partir de una imagen de un solo caracter.
- Salida de hasta 5 candidatos de estructura ordenados por verosimilitud, con formas brutas equivalentes conservadas en `equivalent_raw_ids`.
- Reconocimiento de caracteres sin punto de codigo, variantes raras, formas regionales y gaiji (外字), al no depender del code point.
- Decodificacion restringida por gramatica que garantiza secuencias IDS sintacticamente validas, con round-trip sin perdida gracias a tokens atomicos `#(...)` y `{...}`.
- Ensemble de dos checkpoints promediados a nivel de probabilidad durante la busqueda por haz.
- Verificacion cruzada con el modelo companero `pp-ocrv6-hanzi-unicode-ocr`: los candidatos IDS se expanden por un diccionario de rutas de descomposicion legales y se comparan con la ruta estructural del resultado Unicode.
- No se documentan en la informacion disponible capacidades de tool calling, function calling, agentes, razonamiento multi-paso, vision general, audio ni modo de pensamiento.

## Casos de uso

- Digitalizacion de diccionarios y obras lexicograficas: el modelo procesa las imagenes de caracteres raros incrustadas en datos de diccionario, para las que no existe punto de codigo, devolviendo la estructura IDS en lugar de un caracter forzado.
- Identificacion de gaiji (外字) en documentos japoneses y chinos: los caracteres externos al repertorio codificado se describen por su composicion, permitiendo catalogarlos sin depender de Unicode.
- Verificacion cruzada OCR: combinado con el modelo Unicode companero, las discrepancias entre la ruta estructural IDS y la del resultado Unicode se senalan para revision humana, reduciendo errores silenciosos en pipelines de digitalizacion.
- Catalogacion y busqueda en corpus historicos: al describir caracteres por partes, es posible indexar variantes y formas regionales bajo una misma estructura canonica.
- Limpieza y control de calidad de datasets CJK: el modelo puede validar que el glifo renderizado se corresponde con la descomposicion esperada de un caracter concreto.
- Analisis de fuentes tipograficas: al recibir glifos renderizados a 128×128, permite comparar descomposiciones entre disenos tipograficos o detectar glifos mal construidos.
- Asistencia a la investigacion en sinologia y paleografia: la salida estructural facilita agrupar caracteres por componentes en estudios de variacion grafica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato de rendimiento declarado por el autor es una precision superior al 90 % sobre imagenes de un solo caracter, renderizadas de fuentes de ordenador, en tinta oscura sobre fondo claro, excluyendo caracteres sin descomposicion significativa (glifos de un solo componente). No se aportan cifras de MMLU, HumanEval, GSM8K ni de conjuntos de evaluacion OCR estandar, ni comparaciones numericas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: cada checkpoint ocupa 78,7 MB en FP32; con los dos checkpoints del ensemble, los pesos suman aproximadamente 157 MB, de modo que el consumo total con activaciones a 128×128 se situa en el orden de unos cientos de MB. Estimacion derivada del tamano de los ficheros, no confirmada por el autor.
- GPU recomendadas: dado el tamano, cabe con holgura en cualquier GPU moderna, incluidas RTX 3060, RTX 4090, A100 o H100; no se requiere hardware de gama alta.
- GPU de consumo: si, cabe en practicamente cualquier GPU de consumo e incluso es viable su ejecucion en CPU, al tratarse de un modelo de aproximadamente 19,7 millones de parametros por checkpoint.
- Opciones de despliegue: el modelo se distribuye como PyTorch con codigo de inferencia propio en `hanzi_ids/` y un script `example_usage.py`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no estan orientados a este tipo de encoder-decoder de vision.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Salida | Parametros | Contexto / longitud | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pp-ocrv6-hanzi-ids-ocr (este repositorio) | Estructura IDS, p. ej. `⿰日月` | 19.665.475 por checkpoint (2 checkpoints) | 96 tokens de decodificacion | no disponible | HuggingFace (0 descargas) |
| pp-ocrv6-hanzi-unicode-ocr | El caracter, p. ej. 明 | no disponible | no disponible | no disponible | HuggingFace (modelo companero citado por el autor) |
| Backbones PP-OCRv6 de PaddleOCR | Texto reconocido de linea/imagen | no disponible | no disponible | no disponible | PaddleOCR (familia de la que procede el backbone) |

El autor indica que el modelo IDS y el modelo Unicode son independientes y se complementan mutuamente para la verificacion cruzada. No se dispone de datos de rendimiento comparativos entre ellos ni con otras alternativas.

## Limitaciones y advertencias

- Dominio de entrada muy restringido: solo glifos de un unico caracter, de un solo color, tinta oscura sobre fondo claro y renderizados desde una fuente de ordenador. No se declara robustez ante fotografias, escaneos ruidosos o escritura manual.
- Precision autodeclarada del 90 %+, sin benchmark publico ni conjunto de evaluacion verificable en la informacion disponible.
- Los caracteres sin descomposicion significativa (glifos de un solo componente, como 木) quedan excluidos de esa cifra y el modelo tiende a dividirlos de todos modos.
- Las puntuaciones son no calibradas: `canonical_log_mass` es la puntuacion de ordenacion y `mean_token_probability` la media geometrica de probabilidad por token. Deben usarse para ordenar, no como estimacion de precision.
- No se han documentado sesgos conocidos ni evaluaciones de equidad en la informacion disponible.
- La licencia no esta disponible, por lo que no puede confirmarse la viabilidad de uso comercial ni las condiciones de redistribucion.
- No se especifican los idiomas soportados ni metadatos de cobertura mas alla de la tarea sobre glifos CJK.
- No se documentan datos de entrenamiento, composicion del dataset ni proceso de alineacion, lo que dificulta auditar el comportamiento del modelo.
- Si la busqueda por haz no encuentra cinco secuencias validas distintas, la lista se devuelve incompleta; el modelo no rellena ni inventa candidatos para completarla.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/fang718/pp-ocrv6-hanzi-ids-ocr
- Modelo companero basado en Unicode: https://huggingface.co/fang718/pp-ocrv6-hanzi-unicode-ocr
- No se han encontrado en la informacion disponible enlaces adicionales a papers, blogs, repositorios o demos.
