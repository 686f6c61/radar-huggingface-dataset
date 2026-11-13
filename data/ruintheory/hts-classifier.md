# ruintheory/hts-classifier

## Resumen

HTS classifier es un sistema de recuperación (retrieval) construido sobre el modelo multimodal jinaai/jina-clip-v1 que mapea una fotografía de producto y/o un título de producto a un código de 10 dígitos del Harmonized Tariff Schedule (HTS) de Estados Unidos, junto con una descripción aduanera de 30 caracteres o menos, alternativas, una confianza calibrada y las resoluciones aduaneras históricas más cercanas como justificación. Lo desarrolla el usuario ruintheory y se distribuye bajo licencia Apache-2.0 con un bundle de inferencia en ONNX Runtime que no requiere PyTorch.

El modelo no es un clasificador softmax tradicional: combina una torre de texto de jina-clip-v1 afinada de forma contrastiva con 658.000 pares consulta-código, una torre de visión congelada con un adaptador lineal de 768×768 que cierra la brecha entre modalidades, y un índice de 20.418 descripciones hoja del HTS más unas 202.000 resoluciones aduaneras pasadas. La fusión mezcla al 50/50 la similitud coseno contra hojas y los votos de resoluciones vecinas, con una bandera de abstención por debajo de 0,4 de confianza.

Su relevancia práctica radica en el rendimiento en CPU: aproximadamente 615 MB de RSS, unos 30 ms por consulta de texto y unos 250 ms con imagen en 4 hilos, lo que permite desplegarlo en infraestructura modesta para preclasificación aduanera asistida. La model card insiste en que no constituye asesoramiento legal y que la clasificación depende de hechos (material, función, composición) que una foto o un título pueden no mostrar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Retrieval multimodal sobre jina-clip-v1 (torres de texto y visión CLIP) con índice vectorial PCA-256 int8 y fusión de puntuaciones |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 96 tokens de entrada en la torre de texto; imágenes de 224×224 |
| Tipos de cuantizacion | Weight-only int8 (MatMulNBits) en torres de texto y visión; índice int8 con escalas por dimensión |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (text.onnx, vision.onnx, score_leaf.onnx, score_pool.onnx), tokenizer.json, NPZ (image_adapter.npz, index.npz) y Parquet (leaves.parquet, pool.parquet) |

## Arquitectura y entrenamiento

El sistema se organiza en cuatro etapas. La torre de texto parte del codificador de jina-clip-v1 y se afina de forma contrastiva durante una época sobre aproximadamente 658.000 pares consulta-código, de modo que las descripciones de producto caen cerca de las descripciones hoja del HTS y de resoluciones pasadas con el mismo código; se exporta a ONNX con cuantización weight-only de 8 bits, con una concordancia top-1 del 0,99 respecto a fp32. La torre de visión es el codificador visual congelado de jina-clip-v1 en ONNX int8, al que se añade un adaptador lineal de 768×768 con un desplazamiento de brecha de modalidad entrenado para proyectar fotos al espacio de texto afinado.

El índice contiene 20.418 descripciones hoja del HTS (revisión descargada el 12 de noviembre de 2026) y unas 202.000 resoluciones pasadas, reducidas a 256 dimensiones mediante PCA y cuantizadas a int8, puntuadas con una GEMM int8 dentro de ONNX Runtime. La fusión mezcla al 50/50 la similitud coseno contra hojas y los votos de resoluciones vecinas sumados sobre prefijos de código; la confianza HS6 es la proporción de la puntuación fusionada, con bandera de abstención por debajo de 0,4.

Los datos de entrenamiento y del pool de resoluciones provienen de resoluciones CBP CROSS de EE. UU. (obra del gobierno estadounidense), información arancelaria vinculante de la UE (EBTI, reutilizada bajo CC BY 4.0, traducida automáticamente solo para entrenamiento), resoluciones del Reino Unido (Open Government Licence v3.0), órdenes de concesión arancelaria de Australia (CC BY 3.0 AU) y el HTS de la USITC. El adaptador de imagen se entrenó con embeddings de fotos de Amazon Reviews 2023 y recortes de Open Images; se usaron títulos sintéticos generados con Qwen3-8B solo en entrenamiento. Las resoluciones de Canadá (CBSA) se usaron en entrenamiento pero no se redistribuyen.

## Capacidades

- Clasificación de productos a códigos HTS de 10 dígitos de EE. UU. a partir de texto, imagen o ambos.
- Generación de una descripción aduanera de 30 caracteres o menos asociada al código.
- Recuperación de códigos alternativos y de las resoluciones aduaneras pasadas más cercanas como justificación.
- Confianza calibrada a nivel HS6 con bandera de abstención para consultas poco fiables.
- Clasificación zero-shot de imágenes de producto (pipeline zero-shot-image-classification).
- Búsqueda por similitud sobre un índice de descripciones hoja y resoluciones históricas.
- Inferencia en CPU sin PyTorch, mediante ONNX Runtime, tokenizers y numpy.
- No soporta tool calling, agentes ni razonamiento multi-paso; no es un modelo generativo de texto libre.

## Casos de uso

- Preclasificación aduanera en comercio electrónico: dado el título de un listado y su foto, el sistema devuelve un código HTS candidato con confianza y alternativas, que un operador humano confirma después con el HTS y un agente de aduanas con licencia.
- Asistencia a despachantes y brokers: la recuperación de resoluciones pasadas con el mismo código sirve como justificación documental para preparar expedientes de clasificación.
- Enriquecimiento de catálogos de producto: procesar lotes de fichas con título e imagen para asignar códigos HS6 preliminares y detectar los que requieren revisión manual mediante la bandera de abstención.
- Triaje de consultas en atención al cliente aduanera: con unos 30 ms por consulta de texto en CPU, se puede integrar en un chat o formulario para sugerir la partida arancelaria antes de derivar a un especialista.
- Auditoría de clasificaciones existentes: comparar los códigos ya asignados en un ERP con los recuperados por el modelo y priorizar discrepancias para revisión.
- Despliegue en infraestructura modesta: al necesitar unos 615 MB de RSS y no requerir GPU, encaja en contenedores pequeños o entornos edge para preclasificación en el punto de venta o de alta de producto.
- Investigación sobre clasificación arancelaria: el bundle permite reproducir la evaluación y experimentar con el índice y la fusión sin reentrenar las torres.

## Benchmarks y rendimiento

Evaluación sobre la ruta de inferencia distribuida, con regla estricta de acierto (el código recuperado debe ser al menos tan específico como el gold y empezar por él). Las resoluciones de test son de 2024 o posteriores; las de entrenamiento, de 2022 o anteriores.

| Conjunto | n | R@10 | top-1 HS6 | top-1 10 dígitos |
|---|---|---|---|---|
| Resoluciones CBP 2024+, descripción completa | 2.856 | 0,862 | 0,652 | 0,505 |
| Resoluciones CBP 2024+, descripción corta | 2.856 | 0,765 | 0,553 | 0,402 |
| HSCodeComp (títulos de producto) | 632 | 0,715 | 0,422 | 0,274 |
| ATLAS test (títulos de producto) | 200 | 0,635 | 0,535 | 0,325 |

Imágenes (fotos de producto de ABO, 725 ítems y 29 tipos de producto, a nivel de partida): solo imagen 0,65 top-1 de partida (0,92 en top 10); imagen más título 0,84. La confianza HS6 está calibrada sobre validación: con confianza ≥ 0,4 se responde el 50% de las consultas con 74% de acierto HS6; con ≥ 0,9, el 95%.

## Requisitos de hardware

- VRAM: no requiere GPU; el bundle está pensado para CPU con aproximadamente 615 MB de RSS.
- GPU recomendadas: no aplica; el diseño es exclusivamente CPU con ONNX Runtime.
- GPU de consumo: irrelevante para este modelo; cabe en cualquier CPU moderna de 4 hilos.
- Opciones de despliegue: ONNX Runtime con tokenizers y numpy; el código de servicio es un router FastAPI (`hts/serve.py`) en el repositorio del proyecto.
- Latencia y throughput: aproximadamente 30 ms por consulta de texto y aproximadamente 250 ms con imagen en 4 hilos de CPU.

## Comparativa con modelos similares

| Modelo | Tipo | Contexto / entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ruintheory/hts-classifier | Retrieval multimodal sobre jina-clip-v1 | 96 tokens; imágenes 224×224 | top-1 HS6 0,652 en CBP 2024+ (descripción completa) | Apache-2.0 | Hugging Face, ONNX |
| jinaai/jina-clip-v1 | CLIP multimodal base | no disponible | no disponible | Apache-2.0 | Hugging Face |
| Clasificadores HTS basados en LLM generativo | Generación de texto | Depende del LLM | no disponible | Depende del modelo | no disponible |

No se dispone de datos de benchmarks de alternativas específicas de clasificación HTS en la información proporcionada.

## Limitaciones y advertencias

- Solo cubre el HTS de Estados Unidos y la revisión concreta descargada el 12 de noviembre de 2026; los capítulos 98 y 99 están excluidos.
- Los títulos de producto sin detalles de material o función (por ejemplo, "botella isotérmica") pueden caer en la partida equivocada; la bandera de abstención detecta muchos de estos casos, pero no todos.
- Las consultas solo con imagen son fiables a nivel de partida, mucho menos a 10 dígitos.
- Solo inglés; las entradas en otros idiomas no se traducen en tiempo de servicio.
- La clasificación depende de hechos que una foto o un título pueden no mostrar; el resultado debe confirmarse con el HTS y un agente de aduanas con licencia. No es asesoramiento legal.
- Riesgo de alucinación no aplica en sentido generativo, pero sí de recuperación errónea: códigos plausibles con confianza insuficiente.
- El pool de resoluciones redistribuido no incluye las resoluciones canadienses usadas en entrenamiento ni las traducciones de las BTI no inglesas.
- El modelo tiene 0 descargas y 0 likes en el momento de la ficha, lo que implica ausencia de validación comunitaria independiente.

## Enlaces

- Hugging Face: https://huggingface.co/ruintheory/hts-classifier
- Modelo base: https://huggingface.co/jinaai/jina-clip-v1
- Dataset de resoluciones CBP: https://huggingface.co/datasets/orlandowhite/hts-cross-rulings
- Dataset de resoluciones CBP: https://huggingface.co/datasets/fklc/cbp-rulings-past-2012
- HTS de la USITC: no disponible en la información proporcionada
- Paper o blog del autor: no disponible en la información proporcionada
- Repositorio del proyecto con `hts/serve.py`: no disponible en la información proporcionada
