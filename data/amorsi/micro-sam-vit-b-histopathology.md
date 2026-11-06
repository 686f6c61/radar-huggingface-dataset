# amorsi/micro-sam-vit-b-histopathology

## Resumen

`micro-sam vit_b_histopathology` es un checkpoint preentrenado del proyecto micro-sam, desarrollado por el grupo Computational Cell Analytics, orientado a la segmentación de imágenes de microscopía, en este caso especializado en histopatología. El repositorio de Hugging Face (`amorsi/micro-sam-vit-b-histopathology`) es un espejo sin modificaciones de los pesos originales publicados por el equipo de micro-sam; los hashes xxh128 coinciden con el registro de `util.py` del repositorio oficial, por lo que se trata de una copia verificable y no de un modelo nuevo entrenado por el autor del espejo.

El modelo se apoya en la arquitectura Segment Anything (SAM) en su variante ViT-B, adaptada por micro-sam al dominio biomédico mediante fine-tuning sobre datos de microscopía. Se distribuye como dos ficheros (`model.pt` para el encoder y `decoder.pt` para el decodificador), lo que refleja el diseño encoder-decoder propio de SAM: un backbone ViT que extrae embeddings de la imagen y un decodificador ligero que genera máscaras a partir de prompts (puntos, cajas o máscaras).

Es relevante para investigadores que necesitan segmentación interactiva de estructuras en imágenes histopatológicas sin partir de un SAM genérico, que rinde peor en dominios de microscopía. Al ser un espejo, la licencia de los pesos no está declarada en este repositorio y debe consultarse en la fuente original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Segment Anything (SAM) con backbone ViT-B y decodificador de máscaras por prompts |
| Parametros totales | no disponible (el repo pesa 0,4 GB, coherente con ViT-B, pero no se declara el conteo) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; resolución de entrada no declarada) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de imagen, sin procesamiento de lenguaje) |
| Licencia | no disponible en este repositorio; los pesos originales se rigen por los términos de micro-sam (código MIT, licencia de pesos a consultar en la fuente) |
| Formato de pesos | PyTorch (`model.pt` y `decoder.pt`) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura SAM: un image encoder basado en Vision Transformer (ViT-B) que produce embeddings densos de la imagen y un prompt encoder junto con un decodificador de máscaras ligero que, a partir de puntos, cajas o máscaras de entrada, predice la segmentación. La variante `vit_b_histopathology` de micro-sam ha sido ajustada sobre datos del dominio histopatológico para mejorar la segmentación de estructuras celulares y tisulares frente al SAM original.

No se dispone en la información proporcionada de detalles sobre el volumen de datos de entrenamiento, la composición del dataset, el número de pasos de fine-tuning ni si se aplicaron técnicas de alineación como RLHF o DPO (no aplicables habitualmente a segmentación). Tampoco se documentan innovaciones adicionales como decodificación especulativa o atención lineal. La información disponible se limita a la procedencia del checkpoint y a su integración en micro-sam mediante `model_type="vit_b_histopathology"`.

## Capacidades

- Segmentación de imágenes por prompts: genera máscaras a partir de puntos, cajas o máscaras previas, según el paradigma SAM.
- Segmentación automática: micro-sam permite generar máscaras sin prompt explícito mediante muestreo de puntos (modo automático).
- Segmentación especializada en histopatología: el checkpoint está ajustado para imágenes de tejidos teñidos.
- Segmentación interactiva multi-paso: el usuario puede refinar la máscara añadiendo prompts positivos y negativos.
- Integración con el ecosistema micro-sam: compatible con las utilidades de carga, inferencia y evaluación del proyecto.
- No soporta tool calling, agentes, razonamiento multi-paso en lenguaje ni capacidades multilingües, al ser un modelo puramente visual.
- No se declaran capacidades de visión general fuera del dominio de microscopía.

## Casos de uso

- Segmentación de núcleos celulares en imágenes H&E: el modelo recibe la imagen y puntos o cajas sobre núcleos, y devuelve máscaras que permiten contar y medir células en estudios de densidad celular.
- Análisis de tejidos en investigación oncológica: segmentación de regiones tumorales frente a estroma para cuantificar área relativa, usando el modo interactivo para refinar bordes en zonas ambiguas.
- Anotación asistida en pipelines de etiquetado: el modelo predecir máscaras iniciales que un patólogo revisa y corrige, reduciendo el tiempo de anotación manual en datasets de histopatología.
- Segmentación automática de grandes lotes de portaobjetos: con el modo automático de micro-sam, generar máscaras candidatas para cribado y posterior filtrado por reglas o clasificadores.
- Medición morfológica: extraer áreas, perímetros y formas de estructuras segmentadas para análisis cuantitativo de imágenes tisulares.
- Preprocesado para modelos downstream: usar las máscaras como entrada para clasificadores de tipo celular o pipelines de análisis espacial.
- Docencia y validación de métodos: servir como referencia reproducible (hashes verificados) en comparativas de segmentación histopatológica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no declarada. Un ViT-B de SAM en precisión FP32 ocupa del orden de 0,4 GB en pesos, pero la memoria de inferencia depende de la resolución de entrada y del número de prompts; no hay cifras oficiales en la información disponible.
- GPU recomendadas: no disponibles. Por tamaño, un ViT-B de SAM es ejecutable en GPUs consumer modernas, pero no se confirma en la documentación proporcionada.
- Cabe en GPU consumer: probablemente sí por tamaño de pesos, aunque no se aporta confirmación oficial.
- Opciones de despliegue: el uso previsto es mediante la librería micro-sam (`model_type="vit_b_histopathology"`); no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Dominio | Parametros | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| micro-sam vit_b_histopathology | SAM ViT-B ajustado | Histopatología | no disponible | no disponible (consultar fuente) | Checkpoint en Hugging Face y ownCloud |
| SAM original (ViT-B) | SAM ViT-B | Imágenes generales | ~93 M (referencia pública de SAM) | Apache 2.0 (SAM original) | Meta AI |
| micro-sam vit_b (dominio general de microscopía) | SAM ViT-B ajustado | Microscopía general | no disponible | ídem micro-sam | Repositorio micro-sam |

No se dispone de datos de rendimiento comparativo en la información proporcionada; la comparación se limita a arquitectura, dominio y disponibilidad.

## Limitaciones y advertencias

- Es un espejo no oficial: el autor del repositorio no es el desarrollador original; la licencia de los pesos no está declarada aquí y debe verificarse en la fuente de micro-sam antes de uso comercial.
- Modelo especializado en histopatología: su rendimiento fuera de ese dominio (microscopía de fluorescencia, imágenes naturales) no está garantizado.
- Riesgo de segmentaciones erróneas en tejidos con tinción atípica, artefactos o baja resolución; se recomienda validación con anotaciones expertas.
- No procesa texto ni lenguaje: no admite prompts en lenguaje natural más allá de los prompts geométricos de SAM.
- No se documentan sesgos demográficos ni de adquisición, pero la calidad puede variar según el escáner, el protocolo de tinción y la institución.
- No apto para diagnóstico clínico sin validación regulatoria y supervisión profesional.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin señales de comunidad que respalden su uso.
- No se especifican requisitos de resolución de entrada ni límites de tamaño de imagen.

## Enlaces

- Hugging Face: https://huggingface.co/amorsi/micro-sam-vit-b-histopathology
- Repositorio micro-sam: https://github.com/computational-cell-analytics/micro-sam
- Registro de checkpoints (`util.py`): https://github.com/computational-cell-analytics/micro-sam/blob/master/micro_sam/util.py
- Pesos `model.pt`: https://owncloud.gwd.uni-goettingen.de/index.php/s/sBB4H8CTmIoBZsQ/download
- Pesos `decoder.pt`: https://owncloud.gwd.uni-goettingen.de/index.php/s/KO9AWqynI7SFOBj/download
