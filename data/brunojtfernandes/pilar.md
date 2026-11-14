# brunojtfernandes/PILAR

## Resumen

PILAR (Pyramidal Inhibitory Lightweight Autoassociative Reconstruction) es un método de detección visual de anomalías orientado a la inspección industrial con recursos limitados, publicado en Discover Artificial Intelligence (2026). Lo desarrolla brunojtfernandes y el repositorio de Hugging Face distribuye exclusivamente el código fuente que acompaña al artículo, no pesos entrenados ni imágenes. El modelo aprende a reconstruir imágenes normales —o características congeladas de una red preentrenada— mediante un codificador piramidal compacto, inhibición lateral, un cuello de botella espacial y un decodificador de reconstrucción; la puntuación de anomalía es el residuo de reconstrucción.

La relevancia del trabajo está en el contexto industrial: la detección de anomalías visuales suele requerir modelos pesados y grandes volúmenes de datos etiquetados, mientras que PILAR entrena solo con imágenes normales y está diseñado para restricciones de coste computacional. La variante Feature-PILAR-FCN emplea ResNet18 congelada (pesos ImageNet-1K) en entrenamiento e inferencia y entrena únicamente las cabezas PILAR.

El repositorio es un artefacto de reproducibilidad: incluye el paquete Python `lipnet`, scripts de experimentos, configuraciones, tests y resultados tabulares de referencia para MVTec AD y VisA. No es un servicio de inferencia alojado ni un modelo listo para usar; para inferir hay que entrenar un modelo específico por categoría o aportar un checkpoint propio compatible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Autoencoder de reconstrucción piramidal con inhibición lateral, cuello de botella espacial y decodificador; variante Feature-PILAR-FCN con ResNet18 congelada como extractor |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, entrada 512×512 px en los experimentos principales) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (documentación y etiquetas del repositorio) |
| Licencia | MIT |
| Formato de pesos | no disponible (el repositorio no incluye checkpoints; solo código fuente en `pilar-source.zip`) |

## Arquitectura y entrenamiento

PILAR es un autoencoder de reconstrucción con codificador piramidal compacto. La imagen o las características congeladas pasan por un codificador multinivel, se aplica inhibición lateral y un cuello de botella espacial, y un decodificador reconstruye la entrada. La puntuación de anomalía se calcula como residuo de reconstrucción. En Feature-PILAR-FCN, ResNet18 preentrenada en ImageNet-1K (pesos torchvision V1) permanece congelada en entrenamiento e inferencia y solo se entrenan las cabezas PILAR, lo que reduce drásticamente el coste de entrenamiento.

El entrenamiento usa exclusivamente imágenes normales (paradigma one-class), diez épocas por categoría, tamaño de entrada 512×512, batch size 8 y cinco semillas. Los experimentos de referencia se ejecutaron en Apple MPS. Los comandos de reproducción no realizan selección de checkpoint sobre test ni búsqueda de hiperparámetros. El artículo incluye ablaciones sobre las 15 categorías de MVTec AD con semilla 42: sin inhibición, sin término residual duro, solo capa 2 y solo capa 3.

## Capacidades

- Detección visual de anomalías en imágenes industriales mediante puntuación de residuo de reconstrucción.
- Segmentación de anomalías a nivel de píxel (mapas de evaluación y métricas Pixel-AUROC y AUPRO@30).
- Entrenamiento one-class: solo requiere imágenes normales, sin ejemplos defectuosos etiquetados.
- Reconstrucción de imagen completa y reconstrucción de características congeladas (variante Feature-PILAR-FCN).
- Entrenamiento e inferencia en CPU, CUDA y Apple MPS mediante selección explícita de dispositivo.
- Reproducción completa de experimentos con configuración resuelta, procedencia, checkpoints por época y export de inferencia.
- Análisis complementario de curvas de cribado y revisión de 73 subtipos de MVTec AD.
- No dispone de tool calling, function calling, capacidades de agente, modo thinking, audio ni generación de texto; es un modelo de visión especializado.

## Casos de uso

- Inspección de defectos en línea de fabricación: entrenar un modelo por categoría de producto (botellas, cables, tornillos, etc.) con imágenes normales de la línea y puntuar cada pieza nueva por su residuo de reconstrucción; encaja por su bajo coste de entrenamiento y su diseño para restricciones de recursos.
- Control de calidad en lotes pequeños: al requerir solo imágenes normales, permite desplegar un detector para referencias de producto con pocos ejemplares disponibles, sin recolectar defectos etiquetados.
- Segmentación de defectos para revisión humana: los mapas de píxel y las métricas AUPRO@30 permiten localizar la región anómala y presentarla a un operario, no solo emitir una etiqueta binaria.
- Detección sobre características preentrenadas: usar Feature-PILAR-FCN con ResNet18 congelada cuando no se quiere entrenar un extractor desde cero, entrenando únicamente las cabezas PILAR.
- Evaluación comparativa de métodos de detección de anomalías: el repositorio incluye resultados de referencia en MVTec AD y VisA con cinco semillas y un verificador que recomputa AUROC/AP a partir de 19.435 puntuaciones por imagen, útil como línea base reproducible.
- Investigación en eficiencia computacional: las ablaciones (sin inhibición, sin término residual, solo capa 2, solo capa 3) permiten estudiar el impacto de cada componente en un entorno controlado.
- Despliegue en hardware modesto: al no incluir checkpoints y permitir entrenamiento en CPU o MPS, sirve para prototipado en estaciones de trabajo sin GPU dedicada, aunque el coste real de inferencia no está documentado.

## Benchmarks y rendimiento

Resultados de referencia del artículo, en porcentajes, calculados como macro por categoría dentro de cada semilla y media ± desviación estándar muestral sobre cinco semillas:

| Dataset | Image-AUROC | Image-AP | Pixel-AUROC | AUPRO@30 |
|---|---:|---:|---:|---:|
| MVTec AD | 96,91 ± 0,10 | 98,86 ± 0,04 | 96,49 ± 0,04 | 92,63 ± 0,05 |
| VisA | 92,53 ± 0,07 | 92,41 ± 0,13 | 97,84 ± 0,04 | 90,30 ± 0,14 |

No se han publicado en la información disponible resultados comparativos frente a otros métodos concretos ni cifras de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio no publica el recuento de parámetros ni perfiles de memoria.
- GPU recomendadas: no disponibles en la documentación; los comandos admiten `--device cuda`, `--device mps` y `--device cpu`.
- Entrenamiento de referencia: ejecutado en Apple MPS con entrada 512×512, batch size 8 y diez épocas por categoría.
- Cabe en GPU consumer: no confirmado por datos publicados; la ResNet18 congelada de la variante Feature-PILAR-FCN sugiere requisitos moderados, pero no hay cifras oficiales.
- Opciones de despliegue: scripts de Python del paquete `lipnet` (`scripts/reproduce_paper.py`), export de inferencia por ejecución y evaluación de un export sin reentrenar. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye comparaciones con otros métodos de detección de anomalías (por ejemplo, enfoques de reconstrucción o de embeddings) ni datos de modelos alternativos que permitan una tabla rigurosa.

## Limitaciones y advertencias

- El repositorio no incluye checkpoints entrenados ni imágenes de dataset; no es un servicio de inferencia alojado. Para usarlo hay que entrenar un modelo por categoría o aportar un checkpoint compatible.
- El paquete Python se llama `lipnet`, no `pilar`; conviene tenerlo en cuenta al integrarlo.
- Los experimentos de referencia se ejecutaron en Apple MPS; los resultados pueden variar según hardware y versiones de librerías.
- Requiere descargar MVTec AD y VisA bajo sus términos originales y respetar sus layouts oficiales; las licencias de esos datasets son independientes de la licencia MIT del código.
- El entrenamiento es one-class por categoría: no generaliza automáticamente a productos nuevos sin reentrenar o adaptar.
- No hay selección de checkpoint sobre test ni búsqueda de hiperparámetros en los comandos publicados, lo que limita el ajuste fino reportado.
- Riesgo de alucinación: no aplica en el sentido de modelos generativos de texto, pero los residuos de reconstrucción pueden producir falsos positivos o negativos en imágenes fuera de la distribución normal de entrenamiento.
- Sesgos conocidos: no documentados en la información disponible; al entrenar solo con imágenes normales, el comportamiento ante dominios visuales distintos del dataset de entrenamiento no está caracterizado.
- Idiomas: el repositorio está documentado en inglés; no es un modelo multilingüe.
- Licencia MIT para el código; verificar las condiciones de uso comercial de los datasets y de los pesos ResNet18 de torchvision utilizados.

## Enlaces

- Hugging Face: https://huggingface.co/brunojtfernandes/PILAR
- Repositorio principal en GitHub: https://github.com/bjtf/PILAR
- Commit de referencia: https://github.com/bjtf/PILAR/commit/06eef17fc14a2e870f82d5ea297dcd1efcc3d897
- Descarga del código fuente: https://huggingface.co/brunojtfernandes/PILAR/resolve/main/pilar-source.zip?download=true
- Manifiesto de integridad: https://huggingface.co/brunojtfernandes/PILAR/resolve/main/SOURCE_MANIFEST.json
- Guía de reproducibilidad: https://github.com/bjtf/PILAR/blob/06eef17fc14a2e870f82d5ea297dcd1efcc3d897/REPRODUCIBILITY.md
- Resultados de referencia: https://github.com/bjtf/PILAR/blob/06eef17fc14a2e870f82d5ea297dcd1efcc3d897/RESULTS.md
- Artículo: https://doi.org/10.1007/s44163-026-02671-5
- Dataset MVTec AD: https://www.mvtec.com/research-teaching/datasets/mvtec-ad
- Dataset VisA: https://github.com/amazon-science/spot-diff
