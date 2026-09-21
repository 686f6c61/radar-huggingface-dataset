# fassabilf/sea-clip-tiny-init

## Resumen

SEA-CLIP-Tiny (English initialisation, e0) es un checkpoint de inicialización en inglés para la familia de modelos SEA-CLIP-Tiny, desarrollada por el usuario fassabilf y presentada en ACCV 2026. No es un modelo entrenado para el sudeste asiático: se trata del estudiante de destilación CLIP-KD en inglés que sirve como punto de partida de todos los entrenamientos SEA-CLIP-Tiny, es decir, el estado previo a ver cualquier dato de la región. Su función es garantizar la reproducibilidad de los experimentos y servir de baseline controlado frente a las variantes ya adaptadas.

Técnicamente es un modelo dual de imagen y texto con torre de visión ViT-T/16 y torre de texto de 12 capas y 384 dimensiones, con dimensión de embedding de 512 y 46,11 millones de parámetros en total (5,62 M de visión y 40,49 M de texto). Usa el tokenizador BPE de CLIP con vocabulario de 49.408 tokens y una longitud de contexto de 77 tokens. El repositorio ocupa 0,2 GB y se distribuye bajo licencia MIT, con pipeline declarado de clasificación de imágenes zero-shot.

Su relevancia actual es doble: por un lado, documenta el punto de partida exacto de una línea de investigación sobre embeddings multilingües texto-visión eficientes para el sudeste asiático (indonesio, javanés, sundanés, malayo, tailandés, vietnamita y birmano, además de inglés); por otro, por su tamaño reducido (46 M de parámetros) es un candidato directo a despliegue en entornos con recursos limitados. En el momento de redactar esta ficha acumula 0 descargas y 0 likes, por lo que no cuenta aún con validación por parte de la comunidad.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Dual encoder tipo CLIP: torre de visión ViT-T/16 + torre de texto transformer de 12 capas y 384 dimensiones; dimensión de embedding 512 |
| Parametros totales | 46,11 M (5,62 M visión + 40,49 M texto) |
| Parametros activos | No aplica: modelo denso, no es MoE |
| Longitud de contexto | 77 tokens (texto) |
| Tipos de cuantizacion | No disponible; no se publican versiones cuantizadas. El repositorio de 0,2 GB es coherente con pesos en precisión completa (fp32) |
| Idiomas soportados | Declarados en las etiquetas: en, id, jv, su, ms, th, vi, my. Advertencia: este checkpoint solo ha visto datos en inglés |
| Licencia | MIT |
| Formato de pesos | No especificado en la model card; se carga con open_clip mediante `hf-hub:fassabilf/sea-clip-tiny-init` |
| Torre de visión | ViT-T/16 |
| Torre de texto | 12 capas, ancho 384 |
| Tokenizador | CLIP BPE, vocabulario 49.408 |
| Profesor (teacher) | No aplica en este checkpoint (campo vacío en la model card) |
| Datos de entrenamiento | Preentrenamiento CLIP-KD en inglés, sin datos del sudeste asiático |
| Libreria | open_clip |
| Pipeline | zero-shot-image-classification |
| Tamano del repositorio | 0,2 GB |
| Fecha de creacion / actualizacion | 2026-09-21 / 2026-09-21 |

## Arquitectura y entrenamiento

La arquitectura sigue el esquema estándar de CLIP con dos torres independientes que proyectan imagen y texto a un espacio común de 512 dimensiones. La torre de visión es un ViT-T/16, la variante más pequeña de la familia Vision Transformer con parches de 16x16, y aporta 5,62 M de parámetros. La torre de texto es un transformer de 12 capas y 384 dimensiones de ancho que concentra 40,49 M de parámetros, más del 87 % del total del modelo. El tokenizador es el BPE original de CLIP, con vocabulario de 49.408 entradas y una ventana de contexto de 77 tokens, lo que limita las descripciones textuales a fragmentos cortos.

El entrenamiento de este checkpoint concreto es un preentrenamiento CLIP-KD (destilación de conocimiento sobre CLIP) exclusivamente en inglés, sin ningún dato del sudeste asiático, tal y como declara explícitamente el autor. La model card no especifica el número de tokens vistos, la composición del dataset, ni si hubo etapas de RLHF o DPO (ninguna de las dos es habitual en modelos de embedding contrastivo). No se documenta tampoco innovación técnica adicional más allá del propio esquema de destilación usado para inicializar la familia SEA-CLIP-Tiny. La configuración exacta de entrenamiento se distribuye en el archivo `params.txt` dentro del repositorio, y el código de entrenamiento y evaluación está publicado en el repositorio de GitHub del autor.

## Capacidades

- Clasificación de imágenes zero-shot: genera embeddings de imagen y de texto comparables, lo que permite clasificar imágenes contra etiquetas textuales arbitrarias sin entrenamiento específico.
- Recuperación imagen-texto (retrieval) bidireccional: búsqueda de imágenes a partir de consultas de texto y viceversa dentro del mismo espacio de embedding de 512 dimensiones.
- Extracción de embeddings visuales y textuales reutilizables para indexado, clustering o búsqueda semántica aguas abajo.
- Multilingüismo declarado a nivel de etiquetas (en, id, jv, su, ms, th, vi, my), pero no efectivo en este checkpoint: no ha visto datos del sudeste asiático, por lo que su comportamiento en esos idiomas no está entrenado.
- Integración con el ecosistema open_clip: carga directa mediante `create_model_and_transforms` y tokenizador asociado a través del Hub.
- Capacidad de servir como inicialización (warm start) para procesos de destilación o fine-tuning posteriores.
- Capacidades que NO tiene: no es un modelo generativo, no produce texto libre, no soporta tool calling ni function calling, no implementa agentes ni razonamiento multi-paso, y no dispone de modo de pensamiento, visión avanzada de documentos, audio ni vídeo.

## Casos de uso

- Reproducción de experimentos de la familia SEA-CLIP-Tiny: es el punto de partida exacto de los entrenamientos publicados, de modo que cualquier investigador puede retomar la línea desde el mismo estado inicial usando la configuración de `params.txt` y el código del repositorio.
- Baseline de control en estudios de destilación o adaptación multilingüe: permite aislar cuánto aporta realmente el entrenamiento con datos del sudeste asiático comparando este checkpoint con las variantes finales del mismo tamaño.
- Prototipado de clasificación zero-shot en inglés: con 46 M de parámetros y 0,2 GB en disco, se puede desplegar en un portátil o en una instancia CPU pequeña para validar rápidamente una taxonomía de etiquetas antes de invertir en un modelo mayor.
- Búsqueda semántica de imágenes en inglés sobre catálogos pequeños o medianos: indexar los embeddings de 512 dimensiones y resolver consultas textuales por similitud coseno en un motor vectorial convencional.
- Fine-tuning sobre datasets propios del sudeste asiático: al ser un modelo de 46 M de parámetros, el ajuste completo o con adaptadores es viable con presupuestos de cómputo reducidos, lo que lo hace útil para equipos sin acceso a clústeres grandes.
- Pruebas de integración y CI en pipelines multimodales: sirve como modelo de sustitución (stub) barato para verificar que un pipeline de ingesta, embedding y búsqueda funciona de extremo a extremo antes de escalar al modelo definitivo.
- Investigación académica sobre eficiencia multimodal: al estar la configuración de entrenamiento publicada, es un objeto de estudio adecuado para analizar el reparto de parámetros entre torres (apenas 5,62 M en visión frente a 40,49 M en texto) y su efecto en el rendimiento.
- Generación de embeddings para anotación asistida con humanos en el bucle: preetiquetar grandes lotes de imágenes en inglés y revisar solo los casos de baja confianza, reduciendo el coste de anotación manual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card de este checkpoint no incluye ninguna tabla de métricas (ni zero-shot top-1 en ImageNet, ni Recall@1 en retrieval, etc.) y la búsqueda web realizada no devolvió resultados relevantes sobre el modelo: únicamente devolvió páginas genéricas del navegador Google Chrome, sin relación con SEA-CLIP-Tiny. Cualquier cifra de rendimiento que se quiera citar deberá obtenerse del paper de ACCV 2026 o reproducirse con el código publicado por el autor.

## Requisitos de hardware

- Huella de memoria: 46,11 M de parámetros equivalen aproximadamente a 184 MB en fp32 y a unos 92 MB en fp16. El repositorio ocupa 0,2 GB, coherente con pesos en precisión completa.
- Inferencia: cabe holgadamente en cualquier GPU de consumo, incluidas tarjetas antiguas o de gama baja, y también en tarjetas gráficas integradas con unos cientos de MB de memoria compartida.
- CPU: es perfectamente viable para inferencia en CPU, dado el tamaño reducido de ambas torres; no se dispone de cifras de latencia publicadas.
- GPU recomendadas: no hay una recomendación oficial del autor. Por tamaño, el modelo funciona en cualquier GPU con al menos 1 GB de VRAM libre; para entrenamiento o fine-tuning con lotes grandes conviene una GPU con 8-16 GB o superior, aunque no se publican requisitos concretos.
- Despliegue: la vía documentada es open_clip a través del Hub (`hf-hub:fassabilf/sea-clip-tiny-init`). Al no ser un modelo generativo, herramientas como vLLM, TGI, llama.cpp u Ollama no son aplicables; para servir embeddings en producción lo habitual sería exportar a ONNX o TorchScript e integrarlo en un servicio propio.
- Latencia y throughput: no disponible. No se publican medidas de latencia ni de imágenes por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto texto | Idiomas de entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SEA-CLIP-Tiny (este checkpoint, e0) | 46,11 M | 77 tokens | Solo inglés | MIT | Hugging Face, 0 descargas |
| Variantes entrenadas de SEA-CLIP-Tiny (misma colección) | No disponible | No disponible | Inglés + idiomas del sudeste asiático | No disponible | Hugging Face (colección del autor) |
| OpenAI CLIP ViT-B/32 (referencia de la categoría) | Aproximadamente 151 M | 77 tokens | Inglés | MIT | Ampliamente disponible en repositorios públicos |

Consideraciones de la comparativa:

- Tamaño: con 46,11 M de parámetros, este checkpoint está muy por debajo de un CLIP ViT-B/32 de referencia (aproximadamente 151 M), lo que se traduce en un coste de memoria e inferencia sensiblemente menor, a costa de capacidad representacional.
- Contexto: mantiene la ventana de 77 tokens del tokenizador BPE de CLIP, sin extensión alguna; no hay ventaja frente a los CLIP clásicos en este aspecto.
- Rendimiento: no disponible para este checkpoint. No se puede afirmar ni que supere ni que quede por debajo de CLIP ViT-B/32 sin métricas publicadas.
- Cobertura lingüística: es la diferencia clave frente a un CLIP estándar. La familia SEA-CLIP-Tiny declara ocho idiomas, pero este checkpoint concreto no ha visto datos del sudeste asiático, por lo que en la práctica su cobertura efectiva es la del inglés.
- Licencia y disponibilidad: MIT es una licencia permisiva que permite uso comercial sin restricciones relevantes, en línea con la licencia del CLIP original. La disponibilidad es muy limitada en términos de adopción (0 descargas, 0 likes).
- Alternativas multilingües específicas (por ejemplo, adaptaciones multilingües de CLIP para idiomas del sudeste asiático): no disponible en la información consultada, ya que la búsqueda web no devolvió resultados pertinentes.

## Limitaciones y advertencias

- No es un modelo entrenado para el sudeste asiático. A pesar de que las etiquetas listan en, id, jv, su, ms, th, vi y my, la propia model card aclara que no se ha visto ningún dato de esa región en este checkpoint. Usarlo como clasificador zero-shot en javanés, sundanés, birmano, tailandés o vietnamita dará resultados no fiables.
- No es un modelo final. Es un artefacto de inicialización pensado para reproducir experimentos; no debería presentarse como un resultado del proyecto SEA-CLIP-Tiny ni como un modelo listo para producción.
- Sesgos heredados del inglés: al entrenarse únicamente con datos en inglés, arrastra los sesgos culturales, geográficos y demográficos típicos de los datasets de imagen-texto en ese idioma, con representación reducida del sudeste asiático.
- Tokenizador poco adecuado para idiomas de la región: el BPE de CLIP se diseñó para inglés; idiomas con morfología distinta o escrituras no latinas (tailandés, birmano, javanés) tienden a fragmentarse en muchos subtokens dentro de una ventana de solo 77 tokens.
- Riesgo de alucinación en la asignación de etiquetas: como todo modelo contrastivo, puede producir puntuaciones altas para etiquetas incorrectas cuando la imagen se sale de la distribución de entrenamiento; no hay mecanismo de abstención incorporado.
- Limitación de contexto: 77 tokens restringen las descripciones textuales a frases muy cortas; no admite prompts largos ni instrucciones extensas.
- Restricciones de licencia: la licencia MIT es permisiva y permite uso comercial, pero el autor no ofrece garantías ni soporte, y no se documenta la procedencia de los datos de preentrenamiento, lo que puede ser un riesgo de cumplimiento según el caso de uso.
- Sin validación comunitaria: 0 descargas y 0 likes implican que no hay retroalimentación ni informes independientes de fallos.
- Falta de información técnica reproducible: no se detallan el número de tokens de entrenamiento, la composición del dataset ni métricas, lo que dificulta evaluar su idoneidad sin reproducir el entrenamiento.
- Naturaleza no generativa: no puede usarse para tareas de generación de texto, diálogo, código ni razonamiento; cualquier expectativa en ese sentido es un error de uso.
- Estado de publicación: la referencia asociada es ACCV 2026, con lo que parte del material puede no estar disponible o estar sujeto a cambios hasta la publicación definitiva.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/fassabilf/sea-clip-tiny-init
- Colección SEA-CLIP-Tiny (ACCV 2026): https://huggingface.co/collections/fassabilf/sea-clip-tiny-accv-2026-6ab15f4d6cf7d50e98d5117c
- Repositorio de código de entrenamiento y evaluación: https://github.com/fassabilf/sea-clip-tiny
- Configuración de entrenamiento de este checkpoint: archivo `params.txt` dentro del repositorio de Hugging Face
- Cita del paper: SEA-CLIP-Tiny: Efficient Multilingual Text-Vision Embedding for Southeast Asian Languages, Asian Conference on Computer Vision (ACCV), 2026
- Nota sobre la búsqueda web: los resultados obtenidos no contenían información sobre el modelo (únicamente páginas del navegador Google Chrome), por lo que no se han podido añadir enlaces adicionales a papers, blogs o demos.
