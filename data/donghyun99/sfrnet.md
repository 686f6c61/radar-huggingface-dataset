# Donghyun99/SFRNet

## Resumen

SFR-Net (Shadow Feature Refinement Network) es un modelo de restauración de imágenes especializado en la eliminación de sombras, desarrollado por Donghyun Han y Byoung-dai Lee en la Universidad de Kyonggi y publicado en la revista *Multimedia Systems* (volumen 31, artículo 449, 2025). El modelo aborda un problema clásico de visión por computador: recuperar la apariencia libre de sombras de una escena a partir de una imagen con sombras y su máscara binaria asociada. Se distribuye como un checkpoint de PyTorch de 205 MB (51,0 millones de parámetros en fp32) bajo licencia MIT.

Técnicamente, SFR-Net no es un transformer ni un modelo de lenguaje, sino una red generativa de imagen a imagen construida sobre el generador de inpainting LaMa (convoluciones FFC y 18 bloques residuales). La innovación principal es un esquema de destilación de conocimiento entre dos redes: una red guía congelada que reconstruye la imagen sin sombras desde una máscara vacía y una red guiada que recibe la imagen y la máscara real, refinando progresivamente sus características mediante una pérdida de refinamiento de características aplicada a la etapa profunda.

Es relevante ahora porque ofrece un pipeline completo y reproducible (código en GitHub, pesos en Hugging Face, evaluación con protocolo MATLAB) para una tarea con aplicaciones directas en fotografía computacional, conducción autónoma y edición de imágenes. Su enfoque de destilación sobre un generador preentrenado es eficiente en parámetros y evita entrenar desde cero un modelo de restauración.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Generador LaMa (convoluciones FFC, 18 bloques residuales) con red guía y red guiada; destilación de características |
| Parámetros totales | 51,0 millones (checkpoint liberado, fp32) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo de imagen; entrada 640×480 en evaluación, lados divisibles por 8) |
| Tipos de cuantización | No disponible (solo se publica fp32) |
| Idiomas soportados | No aplica (modelo de visión) |
| Licencia | MIT |
| Formato de pesos | `.pth` (state dict de PyTorch, diccionario con clave `generator`) |

## Arquitectura y entrenamiento

SFR-Net formula la eliminación de sombras como una restauración de imagen guiada por máscara sobre el generador de inpainting LaMa. El sistema consta de dos redes: la red guía G_I, congelada y usada solo en entrenamiento, que reconstruye la imagen sin sombras a partir de una máscara vacía, y la red guiada G_S (el checkpoint liberado), que recibe la imagen con sombras y su máscara binaria y produce la imagen restaurada. La pérdida de refinamiento de características (L_fr) destila las características de G_I en G_S; la mejor configuración (Config #3) la aplica a la etapa profunda, es decir, a los últimos seis bloques residuales FFC.

El objetivo de entrenamiento combina varios términos con pesos concretos: `10·Adv + 30·HRFPL + 100·FM + 10·L_mix + 100·L_fr + 0.001·R1`, donde Adv es la pérdida adversarial, HRFPL la pérdida perceptual basada en un encoder ResNet-50 de ADE20k, FM la pérdida de matching de características, L_mix una pérdida mixta y R1 la regularización de gradiente. Ambas redes se inicializan desde el checkpoint big-lama. El modelo liberado se entrenó únicamente en el dataset ISTD+ (imágenes de escenas exteriores de suelo capturadas con una única configuración de cámara). El post-procesado de restauración de color ajusta, para cada canal RGB, una regresión lineal `I_S = b0 + b1 * I_sf` sobre los píxeles no sombreados y la aplica a toda la salida para alinear los colores con la imagen de entrada.

## Capacidades

- Eliminación de sombras en imágenes RGB a partir de una máscara binaria de sombras.
- Restauración de imagen guiada por máscara (image-to-image) con relleno coherente de las regiones sombreadas.
- Destilación de características para refinar progresivamente la calidad de la reconstrucción.
- Post-procesado de restauración de color para mantener la consistencia cromática con la imagen original.
- Procesamiento por lotes de carpetas de imágenes mediante `predict.py`, emparejando máscaras por nombre de fichero.
- Inferencia en GPU (CUDA) o CPU a través de la clase `SFRNetPredictor`.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües; es un modelo puramente visual.

## Casos de uso

- Fotografía computacional y edición: eliminar sombras no deseadas de fotografías de exteriores usando una máscara de sombras generada por un detector; el post-procesado de color preserva la apariencia natural de la escena.
- Preprocesado para visión por computador: limpiar sombras en imágenes de entrada antes de tareas de detección de objetos, segmentación o reconocimiento, reduciendo la variabilidad de iluminación que degrada estos sistemas.
- Conducción autónoma y robótica: normalizar imágenes de cámaras exteriores afectadas por sombras de edificios o árboles antes de alimentar módulos de percepción.
- Inspección industrial y teledetección: recuperar información en regiones sombreadas de imágenes aéreas o de suelo capturadas con una configuración de cámara fija, dominio para el que el modelo fue entrenado (ISTD+).
- Investigación en restauración de imagen: servir como baseline reproducible para comparar técnicas de destilación de conocimiento aplicadas a eliminación de sombras, con código y pesos públicos.
- Integración en pipelines de aumento de datos: generar versiones sin sombras de imágenes para entrenar otros modelos de visión con mayor robustez a la iluminación.
- Prototipado rápido: el checkpoint de 205 MB y la API de Python permiten desplegar la inferencia en una GPU de consumo para experimentación.

## Benchmarks y rendimiento

Resultados en el conjunto de test de ISTD+ (540 imágenes, 640×480), según la Tabla 1 del artículo. RMSE calculado en espacio de color LAB; PSNR y SSIM en RGB, con el código de evaluación de MATLAB.

| Región | RMSE ↓ | SSIM ↑ | PSNR ↑ |
|---|---|---|---|
| Sombra | 4,9750 | 0,9865 | 37,8747 |
| No sombra | 3,0631 | 0,9550 | 34,5793 |
| Total | 3,4627 | 0,9382 | 32,3872 |

En el dataset SRD, el artículo reporta RMSE total de 4,3781 y SSIM de 0,9341, pero corresponden a un modelo separado que no se libera en este repositorio. El script de evaluación en Python del repositorio de GitHub reimplementa el protocolo de MATLAB y sus cifras son cercanas, pero no idénticas, a las tablas del artículo. No se han publicado en la información disponible resultados comparativos con otros modelos en una tabla de benchmarks.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint fp32 ocupa 205 MB; con activaciones para imágenes de 640×480 se estima un uso moderado (del orden de 1-2 GB), aunque no se proporciona una cifra oficial.
- GPU recomendadas: cualquier GPU con CUDA y al menos unos pocos GB de VRAM; el modelo cabe holgadamente en tarjetas de consumo como RTX 3060, RTX 4060 o superiores, así como en A100 o H100 para procesamiento por lotes.
- Cabe en GPU de consumo: sí, dado el tamaño reducido del modelo (51,0 M de parámetros).
- Opciones de despliegue: inferencia nativa en PyTorch mediante `predict.py` o la clase `SFRNetPredictor` del repositorio; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplicables a un modelo de imagen de este tipo).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto/entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SFR-Net | Restauración de imagen (LaMa + destilación) | 51,0 M | Imágenes 640×480 (lados divisibles por 8) | MIT | Pesos y código públicos |
| LaMa (big-lama) | Inpainting | No disponible en la información | Imágenes de resolución variable | No disponible en la información | Pesos públicos (usado como inicialización) |
| Modelos de eliminación de sombras de ISTD+/SRD | Restauración de imagen | No disponible | Imágenes de escenas exteriores | No disponible | No disponible |

No se dispone de datos de benchmarks comparativos con alternativas en la información proporcionada; la comparación se limita a la relación arquitectónica con LaMa, del que SFR-Net hereda el generador.

## Limitaciones y advertencias

- El modelo requiere una máscara de sombras como entrada; para imágenes sin máscara de referencia es necesario un detector de sombras previo, cuyo error afecta directamente al resultado.
- El checkpoint liberado se entrenó solo en ISTD+, con imágenes de escenas exteriores de suelo capturadas con una única configuración de cámara; la calidad puede degradarse en otros dominios (interiores, retratos, imágenes aéreas, etc.).
- Los resultados de SRD del artículo provienen de un modelo distinto que no se publica, por lo que no pueden reproducirse con este checkpoint.
- El script de evaluación en Python no reproduce exactamente las cifras del protocolo MATLAB del artículo.
- Riesgo de artefactos o inconsistencias cromáticas en regiones sombreadas grandes o con sombras de colores variables; el post-procesado de color es una regresión lineal global por canal y puede no corregir desviaciones locales.
- Licencia MIT: permite uso comercial y modificación con atribución, pero no se ofrece garantía alguna sobre el rendimiento en producción.
- No se documentan sesgos sociales ni de otro tipo; al ser un modelo visual, los riesgos se centran en la fidelidad de la reconstrucción y en la dependencia de la máscara.

## Enlaces

- Hugging Face: https://huggingface.co/Donghyun99/SFRNet
- Repositorio de código: https://github.com/Donghyun99/SFRNet
- Artículo en arXiv: https://arxiv.org/abs/2610.05325
- Versión de revista (DOI): https://doi.org/10.1007/s00530-025-02036-5
- LaMa (generador base): https://github.com/advimman/lama
