# fassabilf/sea-clip-tiny-abl-sea-only

## Resumen

SEA-CLIP-Tiny (ablación: solo conjuntos de datos del sudeste asiático) es un modelo de embeddings texto-imagen de tipo CLIP desarrollado por el autor fassabilf, presentado como una de las filas de la tabla de ablación del artículo *SEA-CLIP-Tiny: Efficient Multilingual Text-Vision Embedding for Southeast Asian Languages* (ACCV 2026). Se trata de un checkpoint de investigación cuyo único objetivo es aislar el efecto de entrenar exclusivamente con datos del sudeste asiático, manteniendo idéntica arquitectura, pipeline e hiperparámetros que el modelo principal del trabajo.

El modelo emplea una torre de visión ViT-T/16 y una torre de texto de 12 capas y 384 dimensiones de anchura, con dimensión de embedding de 512. El total de parámetros es de 46,11 M (5,62 M de visión y 40,49 M de texto), lo que lo sitúa en la gama "tiny" de la familia CLIP. El tokenizador es CLIP BPE con vocabulario de 49.408 entradas y longitud de contexto de 77 tokens, y el entrenamiento se realizó sobre 1,21 millones de pares imagen-texto procedentes de CulturalGround-OE-filt, WIT y Bloom, con MetaCLIP2-ViT-B-16-worldwide declarado como teacher.

Su relevancia es metodológica más que práctica: sirve para cuantificar cuánto aporta cada fuente de datos en un modelo multilingüe orientado a ocho idiomas (inglés, indonesio, javanés, sundanés, malayo, tailandés, vietnamita y birmano). Los resultados publicados en su propia model card muestran un rendimiento muy limitado fuera del dominio del sudeste asiático (5,6 % de accuracy zero-shot en ImageNet y 3,6 % de R@1 medio), por lo que no debe considerarse un modelo de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Dual-encoder CLIP: torre de visión ViT-T/16 + torre de texto de 12 capas y 384 de anchura; dimensión de embedding 512 |
| Parametros totales | 46,11 M (5,62 M visión + 40,49 M texto) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 77 tokens (torre de texto; tokenizador CLIP BPE con vocabulario de 49.408) |
| Tipos de cuantizacion | no disponible (la model card no documenta cuantizaciones) |
| Idiomas soportados | en, id, jv, su, ms, th, vi, my |
| Licencia | MIT |
| Formato de pesos | no disponible (checkpoint para `open_clip`; el repositorio ocupa 0,2 GB) |

## Arquitectura y entrenamiento

Arquitectura contrastiva de doble torre al estilo CLIP. La torre de visión es un ViT-T/16 (variante "tiny", con parches de 16x16) y la torre de texto consta de 12 capas con anchura de 384, ambas proyectadas a un espacio común de dimensión 512. El tokenizador es el BPE de CLIP con vocabulario de 49.408 entradas y una ventana de 77 tokens. Con 46,11 M de parámetros en total y 5,62 M en la torre de visión, el modelo está diseñado explícitamente para ser eficiente en cómputo e memoria.

El entrenamiento utiliza 1,21 millones de pares imagen-texto extraídos de tres fuentes: CulturalGround-OE-filt, WIT y Bloom. Este checkpoint concreto se corresponde con la fila de ablación en la que la mezcla de entrenamiento se limita únicamente a conjuntos de datos del sudeste asiático, manteniendo el resto de hiperparámetros idénticos a los del modelo principal. La model card declara MetaCLIP2-ViT-B-16-worldwide como teacher, lo que apunta a un esquema de destilación, aunque el procedimiento exacto no se detalla en la información disponible. La configuración de entrenamiento exacta de este checkpoint se distribuye en el archivo `params.txt` dentro del propio repositorio.

## Capacidades

- Clasificación de imágenes zero-shot mediante prompts de texto, en la modalidad `zero-shot-image-classification` declarada por el pipeline.
- Recuperación cruzada texto-imagen e imagen-texto (retrieval) en los idiomas cubiertos.
- Generación de embeddings de imagen y de texto en un espacio compartido de 512 dimensiones, reutilizables para búsqueda por similitud o clustering.
- Cobertura multilingüe restringida a ocho idiomas: inglés, indonesio, javanés, sundanés, malayo, tailandés, vietnamita y birmano.
- No dispone de generación de texto: es un modelo contrastivo, no un modelo generativo.
- No se documenta soporte de tool calling, function calling ni uso como agente.
- No se documenta modo de razonamiento (thinking), ni capacidades de audio o de vídeo.
- No se documenta detección de objetos, segmentación ni OCR.

## Casos de uso

- Investigación en ablaciones y reproducibilidad: es su propósito declarado. Permite medir la contribución de las fuentes de datos del sudeste asiático frente al modelo principal, manteniendo constante el resto de la configuración experimental.
- Búsqueda visual en catálogos de comercio electrónico regional: indexar imágenes de producto con embeddings de 512 dimensiones y recuperarlas mediante consultas en indonesio, malayo, tailandés o vietnamita, aprovechando el entrenamiento específico en datos de la región.
- Etiquetado automático de imágenes en plataformas de contenido locales: clasificación zero-shot contra un conjunto de etiquetas redactadas en el idioma del usuario, sin necesidad de entrenar un clasificador específico.
- Filtrado y curación de datasets multimodales: puntuar pares imagen-texto por similitud para descartar pares mal alineados en corpus de lenguas del sudeste asiático, un caso directamente relacionado con el uso de CulturalGround-OE-filt durante su entrenamiento.
- Moderación asistida de contenido: preclasificación barata de imágenes en categorías definidas por texto, con el modelo ejecutándose en CPU o en GPU de gama baja por su reducido tamaño, y revisión humana posterior en los casos dudosos.
- Digitalización de patrimonio cultural: dado que parte del entrenamiento proviene de CulturalGround, encaja en proyectos de catalogación de imágenes culturales con descripciones multilingües de la región.
- Componente de embedding en pipelines multimodales de recuperación aumentada: los vectores de 512 dimensiones pueden alimentar un índice vectorial para RAG sobre documentación con imágenes en idiomas del sudeste asiático.
- Evaluación comparativa de modelos CLIP pequeños: sirve como referencia de bajo coste y licencia permisiva (MIT) frente a otros checkpoints en pruebas de recuperación multilingüe.

## Benchmarks y rendimiento

Datos publicados en la model card del autor. Recuperación R@1 en las particiones held-out de cada fuente de entrenamiento, accuracy zero-shot en ImageNet y la media de recuperación (Avg@1) del artículo sobre XM3600, Flickr30k-200 y XTD-200, en porcentaje.

| Metrica | Resultado |
|---|---|
| CG R@1 | 63,7 |
| WIT R@1 | 54,6 |
| Bloom R@1 | 24,9 |
| ImageNet (zero-shot) | 5,6 |
| R@1-Avg (XM3600, Flickr30k-200, XTD-200) | 3,6 |

No se han publicado en la informacion disponible resultados comparativos de este checkpoint frente a otros modelos en una misma tabla.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 185 MB en fp32, unos 92 MB en fp16 y unos 46 MB en int8, a partir de los 46,11 M de parámetros. No se documentan cuantizaciones oficiales.
- Cabe holgadamente en cualquier GPU de consumo (RTX 3060, RTX 4060, RTX 4090) e incluso en CPU para cargas por lotes moderadas.
- No requiere GPU de centro de datos; A100 o H100 solo tendrían sentido para procesar grandes volúmenes en paralelo.
- Opciones de despliegue: la librería declarada es `open_clip`, con carga directa mediante `hf-hub:fassabilf/sea-clip-tiny-abl-sea-only`. No se documenta soporte de vLLM, TGI, llama.cpp ni Ollama, que en cualquier caso están orientados a modelos generativos.
- El repositorio ocupa 0,2 GB, coherente con un checkpoint en precisión completa.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto texto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| sea-clip-tiny-abl-sea-only | 46,11 M | 77 tokens | en, id, jv, su, ms, th, vi, my | MIT | HuggingFace, vía open_clip |
| sea-clip-tiny (modelo principal del artículo) | misma arquitectura (misma configuracion, segun la model card) | 77 tokens | no disponible en la informacion | no disponible en la informacion | HuggingFace |
| MetaCLIP2-ViT-B-16-worldwide | no disponible en la informacion | no disponible en la informacion | no disponible en la informacion | no disponible en la informacion | utilizado como teacher de este checkpoint |

No se dispone de cifras de rendimiento de los modelos alternativos en la informacion proporcionada, por lo que no es posible establecer una comparación cuantitativa.

## Limitaciones y advertencias

- Es un checkpoint de ablación, no un modelo finalista: su uso previsto es la investigación comparativa, no el despliegue en producción.
- Rendimiento muy bajo en tareas generales: 5,6 % de accuracy zero-shot en ImageNet y 3,6 % de R@1 medio en el conjunto de evaluación multilingüe del artículo.
- Resultados desiguales según la fuente: 63,7 de R@1 en CulturalGround frente a 24,9 en Bloom, lo que indica una fuerte dependencia del dominio y del estilo de los datos de entrenamiento.
- Sesgos conocidos: no se documentan análisis de sesgo en la información disponible. Al entrenarse sobre WIT y Bloom, puede heredar los sesgos de distribución y de representación de esas fuentes web.
- Riesgo de alucinación: no aplica en el sentido generativo, ya que el modelo no produce texto; el riesgo equivalente es la asignación de etiquetas o recuperaciones incorrectas con puntuaciones de similitud engañosamente altas.
- Limitación de contexto: la torre de texto está limitada a 77 tokens, lo que restringe las descripciones largas y obliga a resumir o truncar los prompts.
- Cobertura lingüística cerrada a ocho idiomas; no se documenta comportamiento en castellano ni en otras lenguas.
- Licencia MIT, que permite uso comercial del checkpoint, pero las condiciones de las fuentes de entrenamiento (WIT, Bloom, CulturalGround-OE-filt) deben revisarse por separado antes de un uso comercial.
- Metadatos a revisar: el repositorio figura con 0 descargas y 0 "me gusta" y con fechas de creación y actualización de septiembre de 2026, sin validación por parte de la comunidad.
- No se documentan cuantizaciones oficiales, por lo que cualquier conversión a int8 o formatos alternativos queda bajo responsabilidad de quien la realice.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/fassabilf/sea-clip-tiny-abl-sea-only
- Modelo principal del artículo: https://huggingface.co/fassabilf/sea-clip-tiny
- Código de entrenamiento y evaluación: https://github.com/fassabilf/sea-clip-tiny
- Cita del artículo (ACCV 2026): SEA-CLIP-Tiny: Efficient Multilingual Text-Vision Embedding for Southeast Asian Languages
- Configuración exacta de entrenamiento de este checkpoint: archivo `params.txt` dentro del repositorio de HuggingFace
- No se han encontrado en la busqueda web otros enlaces relevantes (papers, blogs o demos) asociados a este modelo.
