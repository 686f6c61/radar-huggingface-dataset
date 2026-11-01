# freelawproject/caselaw-block-tagger-wordlevel

## Resumen

`caselaw-block-tagger-wordlevel` es un modelo de clasificación de tokens (token classification) desarrollado por Free Law Project para etiquetar los componentes estructurales de las opiniones judiciales de Estados Unidos. Dado el texto OCR de una sentencia serializado como HTML mínimo, el modelo identifica y delimita como spans de caracteres elementos como las partes del litigio, el número de expediente, el tribunal, los abogados, los jueces, la fecha de presentación, el historial procesal, la disposición y los encabezados, dejando el cuerpo argumental como clase `O`.

Se trata de la segunda entrega de la familia `caselaw-block-tagger` y no es un modelo generativo: emite etiquetas BIO por token sobre 12 clases (25 identificadores incluyendo `O`). La diferencia clave frente a la versión anterior es que el entrenamiento y la decodificación son a nivel de palabra, no de subword: solo la etiqueta del primer fragmento de cada palabra es significativa, lo que elimina los fallos de fragmentación típicos del tokenizador byte-level sobre palabras en mayúsculas y líneas largas.

Arquitectura ModernBERT-large con 395.856.921 parámetros (aproximadamente 0,4B), contexto de 8.192 tokens y licencia Apache 2.0. Es relevante para pipelines de digitalización jurídica porque mejora la precisión de forma sustancial en el conjunto de validación del portal de escaneo (de 0,830 a 0,974 en F1 estricto), que es precisamente el escenario de producción real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT-large (encoder transformer, atención con RoPE y alternancia local/global) |
| Parametros totales | 395.856.921 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 8.192 tokens |
| Tipos de cuantizacion | no disponible (el repo publica safetensors; no se documentan variantes GGUF/ONNX) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Tarea | token-classification (BIO, 12 clases + O = 25 label ids) |
| Modelo base | freelawproject/caselaw-block-tagger (continuación); preentrenamiento original en ai-law-society-lab/CaseLawModernBERT-large |
| Tamaño del repo | 1,6 GB |
| Descargas | 18 |
| Fecha de creación | 2026-10-31 |

## Arquitectura y entrenamiento

El modelo es un ModernBERT-large afinado para etiquetado secuencial, con 8.192 tokens de contexto. Parte de los pesos de `freelawproject/caselaw-block-tagger`, que a su vez deriva de `CaseLawModernBERT-large`, un checkpoint continuado sobre 13.000 millones de palabras de opiniones judiciales estadounidenses. La entrada es una sentencia por secuencia en HTML mínimo: `<p>` por bloque de texto, más `<blockquote>`, `<em>` y `<sup>`, con el contenido de las notas al pie omitido y un salto de línea entre bloques. Los ampersands y los ángulos pueden llegar en crudo o escapados (`&amp;`, `&lt;`, `&gt;`); ambas formas se entrenaron.

El entrenamiento usa aproximadamente 4.400 páginas de volúmenes de reporteros escaneados (16 volúmenes de 8 series), pasadas por un pipeline OCR multi-motor, con un conjunto dorado anotado a mano (unas 680 páginas) y una extensión sembrada por modelo y revisada por humanos (unas 3.900 páginas) que en esta versión se limpió y revisó de nuevo. Se añadieron 650 pies de página sintéticos con múltiples números de expediente y aumentaciones de datos: eliminación aleatoria de fronteras de bloque, dropout de estilos y gemelos con entidades escapadas. Tras el aumento quedan 6.933 ventanas de entrenamiento. El ajuste fino se hizo en dos etapas de entrenamiento continuado desde el modelo anterior, con etiquetas a nivel de palabra, learning rate 3e-5 y luego 1e-5, bf16, mejor época por span-F1 sobre un conjunto de validación mixto y parada temprana (18 épocas con mejor resultado en la 10, y 5 épocas con mejor resultado en la 2).

La innovación principal es la decodificación por palabra: se lee la etiqueta del primer fragmento de cada palabra y se extienden los spans a palabras completas, en lugar de decodificar BIO sobre todos los subwords. Además, los spans consecutivos con la misma etiqueta se presentan al modelo como uno solo, y se aplica un post-procesado de "healing" de disposición que fusiona varios spans de disposición dentro de un párrafo en uno solo.

## Capacidades

- Etiquetado estructural de opiniones judiciales: 12 clases BIO (`party`, `separator`, `docketnumber`, `court`, `attorneys`, `judges`, `datefiled`, `otherdate`, `history`, `disposition`, `author`, `heading`).
- Delimitación de spans a nivel de palabra, robusta frente a palabras en mayúsculas y líneas largas.
- Manejo de entidades HTML escapadas y crudas en la misma entrada.
- Soporte de captions con múltiples números de expediente (líneas de docket múltiples).
- Procesamiento de texto nacido digital serializado al mismo formato HTML mínimo, además de OCR escaneado.
- No genera texto: solo produce etiquetas por token.
- Capacidades multilingües: no disponibles; solo inglés.
- Tool calling, agentes y razonamiento multi-paso: no aplica a este modelo.

## Casos de uso

- Digitalización de reporteros judiciales escaneados: el modelo etiqueta la cabecera, el tribunal, el número de expediente y la disposición de cada opinión OCR, permitiendo separar metadatos del cuerpo argumental antes de indexar en un sistema de búsqueda jurídica. Es adecuado porque se entrenó específicamente sobre páginas escaneadas con pipeline OCR multi-motor.
- Extracción de metadatos para bases de datos de jurisprudencia: a partir de los spans de `court`, `datefiled` y `docketnumber` se pueden poblar campos estructurados de un repositorio, con la ventaja de que el modelo trabaja sobre el HTML mínimo que ya produce el pipeline de digitalización.
- Segmentación de opiniones para publicación web: los spans de `heading` y `author` permiten reconstruir la estructura de secciones y la autoría de cada opinión, útil para renderizar versiones HTML limpias de sentencias.
- Enriquecimiento de corpus para investigación empírica del derecho: etiquetar automáticamente `history` y `disposition` facilita estudios a gran escala sobre resultados procesales y cadenas de apelación.
- Preprocesado para modelos generativos jurídicos: usar las etiquetas como filtro para eliminar cabeceras y pies antes de pasar el texto a un LLM, reduciendo ruido y tokens consumidos en el contexto.
- Control de calidad de pipelines OCR: comparar los spans predichos con los esperados por reglas permite detectar páginas mal segmentadas o con errores de reconocimiento en las zonas de cabecera.
- Anonimización y revisión de expedientes: identificar `party` y `attorneys` como paso previo a la seudonimización de documentos antes de su publicación.

## Benchmarks y rendimiento

F1 a nivel de span (estricto / normalizado), evaluado sobre volúmenes no vistos en entrenamiento:

| Conjunto de evaluacion | Modelo anterior | Este modelo |
|---|---|---|
| Golden validation (39 casos, anotación manual, nacido digital) | 0,968 / 0,975 | 0,999 / 0,999 |
| Big-set validation (3 volúmenes, 142 casos, gold revisado) | 0,929 / 0,935 | 0,969 / 0,970 |
| Scanning-portal set (13 opiniones, 21 ventanas, formato real del pipeline) | 0,830 / 0,901 | 0,974 / 0,981 |

En el conjunto del portal, la mejora se concentra en precisión: el modelo anterior devolvía 435 spans para 363 reales (precisión 0,761) y este devuelve 356 (precisión 0,983); el recall sube de 0,912 a 0,964. No se han publicado resultados por clase ni comparaciones con modelos externos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 0,8 GB de pesos, más activaciones; en la práctica cabe holgadamente en cualquier GPU con 4 GB o más.
- En fp32: alrededor de 1,6 GB de pesos.
- GPU recomendadas: cualquier GPU moderna es suficiente; para lotes grandes y máximo throughput, A100, H100 o L40S. En consumer, RTX 4090, RTX 3090, RTX 4070 o incluso GPUs de 8 GB.
- Cabe en GPU de consumo y también en CPU para volúmenes moderados, dado el tamaño de 0,4B.
- Opciones de despliegue: Hugging Face `transformers` con pipeline de token-classification, Text Embeddings Inference (TEI) para servir modelos de encoder, o exportación a ONNX. No se documentan variantes GGUF para llama.cpp/Ollama en la información disponible.
- Latencia y throughput: no disponibles en la información proporcionada; el contexto de 8.192 tokens y el tamaño de 0,4B sugieren un coste por ventana bajo, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Notas |
|---|---|---|---|---|---|
| freelawproject/caselaw-block-tagger-wordlevel | 395,9 M | 8.192 | Etiquetado estructural de case-law | Apache 2.0 | Decodificación por palabra; F1 0,974 en portal |
| freelawproject/caselaw-block-tagger | 395,9 M (misma base) | 8.192 | Etiquetado estructural de case-law | Apache 2.0 | Versión anterior, decodificación por token; F1 0,830 en portal |
| ai-law-society-lab/CaseLawModernBERT-large | no disponible | no disponible | Modelo de lenguaje jurídico (preentrenamiento) | no disponible | Base de preentrenamiento del anterior; no es un etiquetador |
| Otros etiquetadores jurídicos | no disponible | no disponible | no disponible | no disponible | No se dispone de comparativas publicadas en la información |

## Limitaciones y advertencias

- Solo inglés: no se ha entrenado ni evaluado en otros idiomas.
- Dominio restringido a opiniones judiciales de EE. UU. en el formato HTML mínimo descrito; entradas fuera de ese formato degradan el rendimiento.
- No es un modelo generativo: no responde preguntas ni produce texto, solo etiquetas.
- Riesgo de error en captions con estructuras atípicas; la propia model card reconoce que los números de expediente múltiples se reforzaron con datos sintéticos, lo que indica un punto históricamente débil.
- El post-procesado de "healing" de disposición es específico del pipeline; omitirlo cambia los resultados respecto a las cifras publicadas.
- Posibles sesgos derivados del corpus de entrenamiento (16 volúmenes de 8 series de reporteros), que puede no representar toda la diversidad de jurisdicciones y épocas.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones de los datos de entrenamiento subyacentes si se redistribuyen derivados.
- El modelo tiene muy poca adopción (18 descargas) y una única versión publicada; no hay evidencia de uso en producción a gran escala más allá del propio pipeline de Free Law Project.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/freelawproject/caselaw-block-tagger-wordlevel
- Modelo anterior: https://huggingface.co/freelawproject/caselaw-block-tagger
- Checkpoint de preentrenamiento: https://huggingface.co/ai-law-society-lab/CaseLawModernBERT-large
- Free Law Project: https://free.law
