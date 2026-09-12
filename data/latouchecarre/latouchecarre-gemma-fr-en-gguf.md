# LaToucheCarre/LaToucheCarre-Gemma-fr-en-GGUF

## Resumen

LaToucheCarre-Gemma-fr-en-GGUF es una familia de modelos GGUF derivada de Gemma 3 1B IT y Gemma 4 E2B/E4B IT, publicada por el usuario LaToucheCarre para el asistente de escritura local La Touche Carré. No se trata de un reentrenamiento ni de una recuantización: es un recorte de vocabulario sobre GGUF ya cuantizados. De los 262.144 tokens del vocabulario original de Gemma se eliminan 103.311 (−39,4 %), todos aquellos cuya escritura no es latina ni compatible con el francés o el inglés. Se borran las filas de embedding correspondientes en `token_embd.weight` y, en Gemma 4, también en `per_layer_token_embd.weight`; las fusiones BPE se filtran en consecuencia y los tokens especiales se renumeran.

El objetivo declarado es reducir el consumo de memoria y ganar velocidad (entre un 5 % y un 15 %) sin tocar ningún peso. Según el autor, la calidad se mantiene: sobre un banco de 11 correos en francés e inglés con 105 faltas etiquetadas, el número de faltas corregidas y de palabras dañadas es idéntico al del modelo original en las cuatro configuraciones probadas, y la tokenización de los once pasajes coincide jeton a jeton con la del modelo sin recortar.

Su relevancia es doble. Por un lado, es un caso práctico de optimización post-hoc de GGUF para despliegues locales con RAM limitada, ya que el recorte reduce la RAM del equipo anfitrión en el mismo porcentaje que los tokens retirados. Por otro, ejemplifica una especialización extrema por idioma: el modelo pierde cualquier capacidad fuera de fr/en a cambio de un archivo más pequeño y algo más rápido, manteniendo la licencia Gemma y el formato GGUF compatible con llama.cpp.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, heredada de los modelos base Gemma (Gemma 3 y Gemma 4); la model card no detalla la arquitectura interna. Gemma 4 declara tablas `per_layer_token_embd`, lo que implica embeddings por capa |
| Parametros totales | 880.871.680 (variante derivada de google/gemma-3-1b-it, dato real de safetensors). No disponible para las variantes derivadas de Gemma 4 E2B/E4B |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q5_K_XL, Q2_K_XL, IQ3_XXS, Q4_K_M; el repo incluye la etiqueta `imatrix` (matrices de importancia) |
| Idiomas soportados | fr, en (el vocabulario original de más de 140 idiomas queda reducido a estos dos) |
| Licencia | gemma (Gemma Terms of Use y Gemma Prohibited Use Policy) |
| Formato de pesos | GGUF (llama.cpp) |

Ficheros publicados y tamaño tras el recorte (según la model card):

| Fichero | Modelo de origen | Antes | Después | RAM anfitrión ahorrada |
|---|---|---|---|---|
| `…gemma-3-1b-it-Q5_K_XL-fr-en.gguf` | gemma-3-1b-it | 874 Mo | 745 Mo | −121 Mo |
| `…gemma-4-E2B-it-Q2_K_XL-fr-en.gguf` | gemma-4-E2B-it | 2.404 Mo | 1.788 Mo | −582 Mo |
| `…gemma-4-E4B-it-IQ3_XXS-fr-en.gguf` | gemma-4-E4B-it | 3.717 Mo | 2.973 Mo | −704 Mo |
| `…gemma-4-E4B-it-Q4_K_M-fr-en.gguf` | gemma-4-E4B-it | 4.977 Mo | 4.059 Mo | −870 Mo |

Tamaño total del repositorio: 9,6 GB.

## Arquitectura y entrenamiento

No hay entrenamiento. La model card es explícita: «aucun poids n'est touché: le modèle n'est ni réentraîné ni requantifié». El trabajo se realiza directamente sobre el GGUF ya cuantizado, aprovechando que cada fila de embedding ocupa un número entero de bloques de cuantización, lo que permite eliminar filas sin romper la estructura del formato. La arquitectura efectiva es por tanto la del modelo base (decoder-only transformer de la familia Gemma, con embeddings por capa en las variantes Gemma 4), y las capacidades heredadas son las del modelo instruction-tuned de origen.

La innovación técnica está en la herramienta `tailler_vocabulaire.py`, escrita para este producto, que lee y reescribe el GGUF sin más dependencias que `numpy` y `gguf`. Soporta vocabularios SentencePiece (Gemma) y vocabularios codificados byte a byte (Qwen, GPT-2), y recopia todas las metadatos, incluidas las tablas por capa que declara Gemma 4: omitirlas dejaría el fichero incapaz de cargarse. No se documenta ningún proceso de RLHF, DPO ni ajuste fino adicional, ni el número de tokens de entrenamiento (dato que corresponde a los modelos base y no se reproduce aquí).

Un detalle operativo relevante: llama.cpp mantiene las tablas de vocabulario en el lado de la CPU aunque el resto del modelo se descargue a la GPU, porque son tablas de correspondencia y enviarlas a VRAM no acelera nada. El recorte reduce, por tanto, sobre todo la RAM anfitriona, no la VRAM. Para forzar su envío a la GPU el autor indica `--override-tensor "token_embd\.weight=CUDA0,per_layer_token_embd\.weight=CUDA0"`.

## Capacidades

- Generación de texto y corrección de texto en francés e inglés, uso principal declarado del modelo.
- Corrección de acuerdos, participios, homófonos, conjugación, puntuación y números escritos en letras (categorías del banco de evaluación del autor).
- Conversación multi-turno, según la etiqueta `conversational` del repositorio.
- Compatibilidad con endpoints de inferencia (etiqueta `endpoints_compatible`).
- Capacidad multilingüe limitada a fr y en. Cualquier otro idioma del vocabulario original de Gemma (más de 140) ha sido eliminado.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Modo thinking, visión, audio u otras capacidades especiales: no disponible en la información proporcionada.

## Casos de uso

- Asistente de escritura local en Windows: es el uso para el que se desarrolló el modelo, dentro de la aplicación La Touche Carré. Al ejecutarse íntegramente en local y en formato GGUF, no requiere conexión ni envío de texto a terceros.
- Corrección de correos profesionales en francés e inglés: el banco de evaluación del autor usa precisamente 11 correos con faltas de acuerdos, participios, homófonos, conjugación, puntuación y números en letras, lo que refleja el escenario objetivo.
- Revisión integrada en procesadores de texto o extensiones de escritorio: al ocupar entre 745 Mo y 4.059 Mo según variante, puede residir en memoria junto a la aplicación anfitriona en equipos de gama media.
- Despliegue en máquinas con RAM limitada: el recorte libera entre 121 Mo y 870 Mo de RAM anfitriona respecto al modelo original, lo que facilita ejecutar la variante Gemma 4 E4B Q4_K_M (4.059 Mo) en equipos donde la versión sin recortar no cabría con holgura.
- Preprocesado o posprocesado editorial en pipelines de contenido fr/en: el modelo puede actuar como paso de normalización lingüística antes de la publicación, con la ventaja de un 5-15 % más de velocidad que el original.
- Herramientas de aprendizaje de francés o inglés: detección y corrección de errores gramaticales en textos de estudiantes, siempre que el material esté en fr o en.
- Servicio expuesto mediante endpoint compatible: la etiqueta `endpoints_compatible` permite integrarlo en infraestructuras de inferencia que hablen ese protocolo, sirviendo un corrector especializado en lugar de un modelo generalista más pesado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. El autor solo publica una evaluación propia de corrección gramatical sobre 11 correos en francés e inglés con 105 faltas etiquetadas, medida en una RTX 5070 con prompt limpio específico para cada modelo y sin corrector gramatical:

| Modelo recortado | Faltas corregidas | Palabras dañadas |
|---|---|---|
| Gemma 3 1B Q5_K_XL | 55 / 105 | 4 |
| Gemma 4 E2B Q2_K_XL | 95 / 105 | 0 |
| Gemma 4 E4B IQ3_XXS | 101 / 105 | 0 |
| Gemma 4 E4B Q4_K_M | 102 / 105 | 0 |

El autor afirma que estos resultados son estrictamente idénticos a los de los modelos originales correspondientes en cuatro configuraciones distintas, con y sin corrector gramatical, y que la tokenización de los once pasajes coincide jeton a jeton. También declara una ganancia de velocidad de entre el 5 % y el 15 %. Se trata de una validación interna, no de un benchmark reproducible de terceros. No se publican cifras de latencia absoluta ni de throughput en tokens por segundo.

## Requisitos de hardware

- VRAM estimada para inferencia, a partir de los tamaños de fichero publicados (sin contar caché KV ni sobrecarga del runtime):
  - Gemma 3 1B Q5_K_XL: ~745 Mo.
  - Gemma 4 E2B Q2_K_XL: ~1.788 Mo.
  - Gemma 4 E4B IQ3_XXS: ~2.973 Mo.
  - Gemma 4 E4B Q4_K_M: ~4.059 Mo.
- RAM anfitriona adicional: llama.cpp mantiene las tablas de vocabulario en CPU, por lo que el recorte afecta principalmente a la RAM del sistema, no a la VRAM.
- GPU recomendadas: el autor realizó las mediciones en una RTX 5070. Cualquier GPU con al menos 5-6 GB de VRAM libres debería poder alojar la variante E4B Q4_K_M; las variantes de 1B y E2B son aptas para GPU de gama de entrada.
- Cabe en GPU de consumo: sí. Las cuatro variantes publicadas caben en GPU de consumo con 6-8 GB de VRAM o más; la variante de 745 Mo es apta incluso para hardware muy modesto.
- Opciones de despliegue: llama.cpp (formato nativo del repo), y cualquier runtime que consuma GGUF. El repositorio incluye la etiqueta `endpoints_compatible` para servir el modelo como endpoint.
- Latencia y throughput: no disponible. Solo se declara una mejora relativa del 5-15 % frente al modelo original.
- Ajuste opcional: para mover las tablas de vocabulario a la GPU, `--override-tensor "token_embd\.weight=CUDA0,per_layer_token_embd\.weight=CUDA0"`.

## Comparativa con modelos similares

La comparación natural es contra los modelos Gemma originales de los que derivan, ya que la información proporcionada no incluye métricas frente a alternativas de terceros.

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Faltas corregidas (banco del autor) |
|---|---|---|---|---|---|---|
| Este recorte, Gemma 3 1B Q5_K_XL | 880.871.680 | no disponible | fr, en | gemma | GGUF | 55 / 105 |
| google/gemma-3-1b-it | 880.871.680 (dato de safetensors) | no disponible | más de 140 | gemma | safetensors, GGUF | 55 / 105 (idéntico según el autor) |
| Este recorte, Gemma 4 E2B Q2_K_XL | no disponible | no disponible | fr, en | gemma | GGUF | 95 / 105 |
| Este recorte, Gemma 4 E4B IQ3_XXS | no disponible | no disponible | fr, en | gemma | GGUF | 101 / 105 |
| Este recorte, Gemma 4 E4B Q4_K_M | no disponible | no disponible | fr, en | gemma | GGUF | 102 / 105 |
| google/gemma-4-E2B-it y google/gemma-4-E4B-it | no disponible | no disponible | más de 140 | gemma | safetensors, GGUF | idéntico según el autor |

Diferencias clave frente a los originales: menor tamaño de fichero (entre 121 Mo y 870 Mo menos), entre un 5 % y un 15 % más de velocidad y un vocabulario restringido a fr/en. No hay datos de comparación con modelos de corrección gramatical de otros fabricantes.

## Limitaciones y advertencias

- Licencia: los modelos siguen sujetos a los Gemma Terms of Use y a la Gemma Prohibited Use Policy. Cualquier usuario o redistribuidor debe respetarlos y repercutirlos a terceros. No es una licencia permisiva tipo Apache o MIT.
- Idiomas: el vocabulario se ha recortado a francés e inglés. Al haberse eliminado los tokens de escritura no latina, el texto en otras escrituras (cirílico, árabe, CJK, etc.) no puede representarse con los tokens originales, lo que invalida su uso fuera de fr/en.
- Sesgos: no se documenta ningún análisis de sesgos en la información proporcionada. Al no haber reentrenamiento, hereda los sesgos de los modelos Gemma base.
- Alucinación: no se publica ninguna evaluación de alucinación. Los modelos base son de tamaño pequeño (en torno a 880 M de parámetros la variante 1B), por lo que el riesgo de invención en tareas de conocimiento abierto es alto; el uso previsto es la corrección de texto, no la respuesta a preguntas.
- Validación limitada: el banco de evaluación es del propio autor, consta de 11 textos y 105 faltas, y no es un benchmark reproducible por terceros. Las afirmaciones de «calidad idéntica» no están verificadas de forma independiente.
- Adopción nula: el repositorio registra 0 descargas y 0 likes, por lo que no existe validación ni retroalimentación de la comunidad.
- Sin datos de contexto ni de benchmarks estándar: no se especifica la longitud de contexto efectiva ni hay resultados de MMLU, HumanEval, GSM8K u otras pruebas habituales.
- Producción: al no haber métricas de latencia, throughput ni tasa de error sobre datos externos, cualquier despliegue en producción debería validarse con un conjunto de evaluación propio antes de confiar en la equivalencia de calidad declarada.
- Fechas: el repositorio figura creado y actualizado el 11 de septiembre de 2026.
- Restricción operativa: si se envían las tablas de vocabulario a la GPU con `--override-tensor`, se pierde la ventaja de RAM anfitriona descrita por el autor y no se gana velocidad según su propia model card.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/LaToucheCarre/LaToucheCarre-Gemma-fr-en-GGUF
- Producto para el que se desarrolló: https://latouchecarre.fr
- Gemma Terms of Use: https://ai.google.dev/gemma/terms
- Gemma Prohibited Use Policy: https://ai.google.dev/gemma/prohibited_use_policy
- Modelos base: https://huggingface.co/google/gemma-3-1b-it
- Herramienta de recorte de vocabulario: `tailler_vocabulaire.py` (mencionada en la model card; no se proporciona enlace en la información disponible)
- Resultados de la búsqueda web: no se ha encontrado ningún enlace relevante al modelo; los resultados devueltos corresponden a páginas de descarga de controladores de NVIDIA y no guardan relación con esta ficha.
