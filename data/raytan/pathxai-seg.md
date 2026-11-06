# RayTan/PathXAI-Seg

## Resumen

PathXAI-Seg es un modelo de segmentación de imágenes de patología desarrollado por el usuario RayTan y publicado en Hugging Face bajo el identificador `RayTan/PathXAI-Seg`. El modelo se distribuye con la librería PyTorch y está etiquetado con los términos `pathology`, `segmentation` y `sam3`, lo que indica que se apoya en la familia Segment Anything Model (SAM) aplicada al dominio de la histopatología. Su propósito es generar máscaras de segmentación sobre imágenes de tejido, una tarea central en flujos de patología digital y análisis asistido por computador.

La información pública disponible es muy limitada: el repositorio tiene un tamaño de 0.0 GB, no registra descargas ni likes, y el acceso está restringido (gated), por lo que es necesario aceptar condiciones en Hugging Face para descargar los pesos. La licencia declarada es `sam-license`, la licencia asociada a los modelos SAM originales de Meta, que impone restricciones de uso comercial y requiere revisión previa.

No se han publicado en la información disponible detalles sobre arquitectura exacta, número de parámetros, longitud de contexto (en el caso de modelos multimodales de imagen, resolución de entrada), datos de entrenamiento ni resultados de benchmarks. La ficha se completa con los datos disponibles y se marca explícitamente como "no disponible" todo aquello que no puede verificarse.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (etiquetado como `sam3`, basado en Segment Anything Model) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible (modelo de imagen; resolución de entrada no especificada) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de visión, no lingüístico) |
| Licencia | sam-license (licencia de SAM, con restricciones; acceso gated) |
| Formato de pesos | no disponible (repo PyTorch; probablemente `.pt`/`.pth` o safetensors, sin confirmar) |

## Arquitectura y entrenamiento

No se dispone de información pública sobre la arquitectura interna del modelo más allá de la etiqueta `sam3`, que sugiere una adaptación o fine-tuning de la familia Segment Anything Model (SAM) de Meta para segmentación en imágenes de patología. SAM es un modelo de segmentación promptable basado en un codificador de imagen (ViT) y un decodificador ligero de máscaras; las variantes de dominio suelen reentrenar o adaptar el decodificador y, en ocasiones, el codificador, sobre datasets específicos.

No se han publicado datos sobre el número de tokens de entrenamiento, la composición del dataset (tipos de tejido, tinciones, resolución de las imágenes), el uso de RLHF/DPO (irrelevante en segmentación) ni innovaciones técnicas concretas como decodificación especulativa o atención lineal. Toda esta información debe considerarse no disponible hasta que el autor publique una model card detallada o un paper asociado.

## Capacidades

- Segmentación de imágenes de patología: generación de máscaras sobre imágenes de tejido, presumiblemente con capacidad de segmentación promptable al estilo SAM (puntos, cajas o máscaras de entrada).
- Etiquetado `sam3`: sugiere compatibilidad con la interfaz de SAM (prompts de punto/caja) y con pipelines de segmentación interactiva.
- Dominio específico: patología digital, lo que implica que el modelo está orientado a imágenes de portaobjetos (whole-slide images) o recortes de las mismas.
- Capacidades multilingües: no aplica (modelo de visión).
- Tool calling / function calling: no disponible; no es una capacidad esperable en un modelo de segmentación.
- Agentes y razonamiento multi-paso: no disponible; no aplica.
- Capacidades especiales (thinking mode, visión, audio): visión (segmentación), sin confirmación de otras modalidades.

## Casos de uso

- Segmentación de regiones de interés en patología digital: el modelo puede generar máscaras de tejido, núcleos o estructuras en recortes de imágenes histológicas, facilitando el preprocesado para pipelines de análisis cuantitativo.
- Asistencia a patólogos en anotación: al ser promptable (estilo SAM), puede usarse como herramienta de anotación semiautomática, reduciendo el tiempo de etiquetado manual de datasets de investigación.
- Preprocesado para modelos de clasificación: las máscaras generadas pueden aislar regiones tumorales o estromales antes de pasarlas a clasificadores downstream.
- Investigación en imagen médica: útil para experimentos de segmentación few-shot o zero-shot en dominios histológicos, comparando con SAM original.
- Análisis de morfología tisular: segmentación de estructuras para medir áreas, densidades o distribución espacial en estudios cuantitativos.
- Integración en visores de patología: al ser un modelo PyTorch, puede integrarse en herramientas de visualización (QuPath, ASAP) mediante un servicio de inferencia, aunque requiere verificar la licencia para uso clínico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; depende del tamaño del codificador ViT y de la resolución de entrada, que no se especifican. Como referencia, las variantes SAM (ViT-B/H) requieren entre 4 y 16 GB de VRAM en FP16 para imágenes de 1024x1024, pero este dato no está confirmado para PathXAI-Seg.
- GPU recomendadas: no disponible; por analogía con SAM, una GPU con al menos 8-16 GB (RTX 3080/4090, A100) sería razonable, pero no verificable.
- ¿Cabe en consumer GPU?: no confirmado; probablemente sí en GPUs de 8 GB o más si el modelo es una variante ligera de SAM, pero no hay datos.
- Opciones de despliegue: PyTorch nativo; no se confirma soporte de vLLM, llama.cpp, Ollama o TGI (no aplicables a segmentación de imagen en la mayoría de casos).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto/resolución | Licencia | Disponibilidad |
|---|---|---|---|---|
| PathXAI-Seg | no disponible | no disponible | sam-license (gated) | Hugging Face, acceso restringido |
| SAM (Meta) | 91M–636M (ViT-B/L/H) | 1024x1024 | Apache 2.0 (SAM) / SAM 2 con licencia propia | Público |
| MedSAM | ~90M (ViT-B) | 1024x1024 | Apache 2.0 | Público |
| Cellpose | no aplicable (no transformer) | variable | BSD-3 | Público |

La comparación es limitada porque no se conocen los parámetros ni el rendimiento de PathXAI-Seg. SAM y MedSAM son las alternativas más directas en segmentación promptable, pero sus licencias y disponibilidad difieren.

## Limitaciones y advertencias

- Acceso restringido: el repositorio es gated; es necesario aceptar condiciones en Hugging Face antes de descargar los pesos, lo que puede retrasar su uso en producción.
- Licencia `sam-license`: hereda las restricciones de la licencia de SAM, que en versiones recientes limita el uso comercial y requiere revisión legal antes de desplegar en productos.
- Falta de documentación: no hay model card detallada, paper ni benchmarks públicos, lo que impide evaluar su calidad real frente a alternativas.
- Riesgo de sesgo de dominio: al ser un modelo de patología, su rendimiento puede degradarse en tinciones, scanners o tejidos no representados en su (desconocido) dataset de entrenamiento.
- Riesgo de alucinación de máscaras: como todo modelo de segmentación, puede generar máscaras plausibles pero incorrectas en regiones ambiguas; requiere validación por expertos.
- Sin garantías para uso clínico: no hay evidencia de validación regulatoria ni estudios clínicos; no debe usarse en diagnóstico sin supervisión.
- Idiomas: irrelevante, pero la ausencia de documentación multilingüe limita su adopción fuera del inglés.
- Tamaño del repo 0.0 GB: sugiere que los pesos podrían no estar subidos o que el repo solo contiene código; verificar antes de asumir que el modelo es descargable.

## Enlaces

- Hugging Face: https://huggingface.co/RayTan/PathXAI-Seg
- No se han encontrado otros enlaces (paper, blog, repositorio o demo) en la información disponible.
