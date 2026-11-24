# DeepFaune/deepfaune-vit_small_patch16_dinov3.lvd1689m

## Resumen

DeepFaune ViT-Small es un modelo de clasificación de imágenes especializado en fauna salvaje europea, desarrollado por la iniciativa DeepFaune del CNRS (Centre National de la Recherche Scientifique). El modelo identifica 40 clases de animales —desde grandes mamíferos como el ciervo rojo o el jabalí hasta micromamíferos y aves— a partir de imágenes capturadas por cámaras de fototrampeo. Es la versión compacta del modelo principal de DeepFaune, que emplea una arquitectura ViT-Large.

La relevancia de esta variante radica en su eficiencia: al usar ViT-Small en lugar de ViT-Large, el modelo puede ejecutarse en hardware menos potente (CPU, GPUs de consumo, dispositivos embebidos) a costa de una precisión inferior. Esto lo hace adecuado para despliegues en campo, estaciones de monitorización con recursos limitados o pipelines de procesamiento masivo donde el coste computacional es un factor crítico.

El modelo se distribuye bajo licencia CC-BY-SA 4.0, lo que permite uso comercial con atribución y obligación de compartir bajo la misma licencia. El repositorio ocupa aproximadamente 0,1 GB, lo que confirma su ligereza en comparación con variantes de mayor tamaño.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision Transformer (ViT-Small, patch size 16), fine-tuned desde DINOv3 |
| Parámetros totales | no disponible (ViT-Small, del orden de ~22M, no confirmado en la información) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, entrada 224x224 píxeles) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no aplica (clasificación de imágenes; etiquetas en inglés y francés) |
| Licencia | CC-BY-SA 4.0 |
| Formato de pesos | no disponible (repo de 0,1 GB; presumiblemente safetensors/PyTorch, no confirmado) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura ViT-Small con parches de 16x16 píxeles, inicializado a partir de los pesos de DINOv3 (autosupervisado) y posteriormente fine-tuned para clasificación de 40 clases de fauna. Un detalle técnico destacable es que el fine-tuning se realizó a una resolución de 224x224 píxeles, en lugar de los 256x256 por defecto de DINOv3, con el objetivo de acelerar la inferencia manteniendo una precisión equivalente.

Los datos de entrenamiento provienen de la iniciativa DeepFaune y consisten en imágenes de cámaras de fototrampeo. El soporte de entrenamiento por clase es muy variable: desde 616 imágenes para la mangosta hasta 484.170 para el corzo, pasando por 370.657 para el ciervo rojo o 292.876 para el jabalí. Esta distribución desequilibrada explica en parte las diferencias de rendimiento entre clases. No se dispone de información sobre el número total de tokens de entrenamiento, composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO (no aplicables a un clasificador de imágenes).

## Capacidades

- Clasificación de imágenes en 40 clases de fauna salvaje europea, incluyendo mamíferos grandes (ciervo, jabalí, oso, lobo, alce), medianos (zorro, tejón, nutria, lince), pequeños (ardilla, erizo, micromamíferos) y aves.
- Distinción entre especies similares dentro de la misma familia (por ejemplo, zorro común frente a zorro ártico, o ciervo rojo frente a corzo y gamo).
- Identificación de animales domésticos y ganado (perro, gato, vaca, oveja, cabra, équidos) para filtrar falsos positivos en entornos rurales.
- Clasificación de categorías agregadas cuando la especie concreta no es distinguible (lagomorfo, mustélido, micromamífero, équido).
- Inferencia ligera apta para CPU y GPUs de consumo gracias a la arquitectura ViT-Small.
- No soporta tool calling, agentes, razonamiento multi-paso ni generación de texto: es exclusivamente un clasificador de imágenes.

## Casos de uso

- Monitorización de biodiversidad con fototrampeo: el modelo procesa lotes de imágenes de cámaras trampa para inventariar especies presentes en un área protegida, permitiendo a investigadores del CNRS y gestores de parques naturales automatizar el etiquetado de miles de imágenes que de otro modo requerirían revisión manual.
- Despliegue en estaciones de campo con hardware limitado: al ser ViT-Small, puede ejecutarse en mini-PCs, Raspberry Pi con acelerador o GPUs de gama baja alimentadas por batería o panel solar, algo inviable con la variante ViT-Large.
- Filtrado previo en pipelines de investigación: actúa como primer clasificador rápido que descarta imágenes sin fauna o etiqueta las evidentes, reservando el modelo ViT-Large para los casos ambiguos y reduciendo el coste computacional global.
- Seguimiento de fauna en explotaciones agrícolas y ganaderas: detección de especies que causan daños (jabalí, ciervo, zorro) o de depredadores (lobo, oso) cerca de rebaños, con capacidad de distinguir ganado doméstico de fauna salvaje.
- Estudios de ecología del comportamiento: clasificación masiva de secuencias de cámaras trampa para analizar patrones de actividad, distribución y coexistencia de especies a lo largo del tiempo.
- Educación y divulgación científica: aplicación móvil o web que identifica la especie captada en una imagen de fototrampeo, útil en proyectos de ciencia ciudadana.
- Procesamiento en el borde (edge computing) en reservas remotas: clasificación local sin necesidad de enviar imágenes a la nube, reduciendo consumo de ancho de banda y preservando la privacidad de los datos.

## Benchmarks y rendimiento

Los datos disponibles son de recall por clase sobre un conjunto de test fuera de muestra (out-of-sample), no de benchmarks estándar como MMLU o ImageNet. Se presentan las clases con mayor y menor rendimiento, junto con el soporte de test:

| Clase | Recall (test) | Soporte test | Soporte entrenamiento |
|---|---|---|---|
| Nutria (otter) | 100,00% | 2 | 2.325 |
| Bisonte (bison) | 99,63% | 4.604 | 56.951 |
| Lince (lynx) | 98,85% | 1.047 | 10.741 |
| Ave (bird) | 98,64% | 57.884 | 213.822 |
| Ardilla (squirrel) | 97,94% | 2.426 | 28.598 |
| Lagomorfo (lagomorph) | 97,42% | 17.980 | 76.669 |
| Jabalí (wild boar) | 95,84% | 172.129 | 292.876 |
| Corzo (roe deer) | 95,69% | 63.557 | 484.170 |
| Tejón (badger) | 96,18% | 7.490 | 110.525 |
| Ciervo rojo (red deer) | 93,55% | 126.686 | 370.657 |
| Lobo (wolf) | 93,29% | 2.383 | 37.136 |
| Zorro (fox) | 92,40% | 49.444 | 254.662 |
| Oso (bear) | 86,58% | 3.732 | 13.091 |
| Mapache (raccoon) | 81,90% | 11.419 | 60.071 |
| Chacal dorado (golden jackal) | 72,85% | 2.394 | 10.449 |
| Muflón (mouflon) | 72,38% | 7.848 | 4.758 |
| Équido (equid) | 67,90% | 2.966 | 43.051 |
| Nutria americana (nutria) | 62,60% | 770 | 1.303 |
| Cabra (goat) | 52,63% | 1.237 | 6.442 |
| Rata almizclera (muskrat) | 37,50% | 24 | 1.444 |
| Íbice (ibex) | NA | 0 | 10.918 |

Se observa una correlación clara entre el soporte de entrenamiento y el recall: las clases con más imágenes (corzo, ciervo, jabalí) superan el 93%, mientras que clases con pocas muestras o alta confusión interespecífica (cabra, rata almizclera, muflón, équido) caen por debajo del 73%. La clase íbice no tiene muestras de test, por lo que no se puede evaluar. El autor advierte explícitamente que el rendimiento es inferior al del modelo DeepFaune basado en ViT-Large.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; un ViT-Small a 224x224 requiere del orden de 1-2 GB en FP32 y menos de 1 GB en FP16, aunque no se proporcionan cifras oficiales.
- GPU recomendadas: cualquier GPU moderna es suficiente; RTX 3060/4060, RTX 4090, A100 o H100 ofrecerán throughput muy alto, pero el modelo está pensado para funcionar incluso en CPU.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo actual e incluso en iGPU o CPU.
- Opciones de despliegue: PyTorch nativo (código de inferencia incluido en la model card usando `timm`), exportación a ONNX/TensorRT no documentada pero viable; no se mencionan integraciones con vLLM, llama.cpp u Ollama (no aplicables a clasificación de imágenes).
- Latencia y throughput: no disponibles oficialmente; por el tamaño del modelo se espera inferencia en milisegundos por imagen en GPU y decenas de milisegundos en CPU, aunque no se confirma en la información.

## Comparativa con modelos similares

| Modelo | Arquitectura | Clases | Licencia | Contexto de uso |
|---|---|---|---|---|
| DeepFaune ViT-Small (este modelo) | ViT-Small/16 (DINOv3) | 40 | CC-BY-SA 4.0 | Hardware limitado, edge, CPU |
| DeepFaune ViT-Large | ViT-Large (DINOv3) | 40 (mismas) | CC-BY-SA 4.0 (presumible) | Mayor precisión, requiere GPU |
| MegaDetector (Microsoft) | Detector de objetos (varias versiones) | Detección genérica (animal/persona/vehículo) | MIT (versiones abiertas) | Detección, no clasificación de especie |
| SpeciesNet (Google) | Ensemble de clasificadores | ~2.000 clases | Apache 2.0 (según versión) | Clasificación global de fauna |

La comparación directa más relevante es con la variante ViT-Large de DeepFaune, que comparte clases y datos pero ofrece mayor precisión a costa de más recursos. Frente a MegaDetector, este modelo aporta clasificación a nivel de especie (no solo detección), mientras que SpeciesNet cubre un espectro taxonómico mucho mayor pero con menor especialización en fauna europea. Los datos de rendimiento de los competidores no se detallan en la información proporcionada, por lo que no se ofrece comparación numérica.

## Limitaciones y advertencias

- Precisión inferior a la variante ViT-Large de DeepFaune, tal como advierte el propio autor; no apto para aplicaciones que requieran máxima exactitud.
- Rendimiento muy desigual entre clases: recall del 37,50% en rata almizclera y 52,63% en cabra frente a más del 99% en bisonte o nutria.
- Clases con soporte de test mínimo (nutria con 2 muestras, mangosta con 23, rata almizclera con 24) ofrecen estimaciones de recall poco fiables estadísticamente.
- Confusión probable entre especies morfológicamente similares (zorro/zorro ártico, ciervo/corzo/gamo, cabra/muflón/oveja).
- Sesgo geográfico y de dominio: entrenado con imágenes de fototrampeo europeas; puede degradarse en otros continentes, condiciones de iluminación extremas o ángulos atípicos.
- Licencia CC-BY-SA 4.0: permite uso comercial pero exige atribución y que las obras derivadas se compartan bajo la misma licencia, lo que puede ser incompatible con productos propietarios.
- No es un modelo generativo: no soporta texto, razonamiento ni tool calling; cualquier expectativa en ese sentido es errónea.
- No se documentan sesgos demográficos ni de otro tipo, ni medidas de mitigación; tampoco se detalla el proceso de cuantización o formatos de pesos disponibles.
- El modelo no incluye detección de objetos: asume que la imagen ya está recortada al animal (el código de ejemplo incluye una función de recorte cuadrado), por lo que requiere un detector previo en pipelines reales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DeepFaune/deepfaune-vit_small_patch16_dinov3.lvd1689m
- Iniciativa DeepFaune (CNRS): https://www.deepfaune.cnrs.fr/en/
- DINOv3 (arquitectura base): no disponible en la información proporcionada
- Repositorio de código de DeepFaune: no disponible en la información proporcionada
- Paper o publicación asociada: no disponible en la información proporcionada
