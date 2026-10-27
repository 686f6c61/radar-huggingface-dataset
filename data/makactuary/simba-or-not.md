# makactuary/simba-or-not

## Resumen

`makactuary/simba-or-not` es un clasificador binario de imágenes publicado en HuggingFace por el usuario makactuary. No es un modelo de lenguaje ni una red neuronal entrenada de extremo a extremo: es una cabeza de regresión logística de scikit-learn montada sobre las características congeladas de un ConvNeXt-Tiny (`timm/convnext_tiny.fb_in22k_ft_in1k`). Su única tarea es responder a una pregunta muy concreta: si el gato de la fotografía es Simba, un gato naranja y blanco de pelo largo, o no lo es.

El interés del modelo es metodológico más que de rendimiento bruto. El autor entrenó con solo 42 fotos propias de Simba frente a 2371 fotos de gatos del dataset Oxford-IIIT Pet, y aplicó una validación cruzada agrupada por día de captura (20 días) para evitar que ráfagas casi idénticas de la misma sesión cayeran a la vez en entrenamiento y test. El resultado reportado es un recall de 0,98 sobre días no vistos y un 0,04 % de falsos positivos, con un único error sobre un Maine Coon.

Es relevante ahora como ejemplo reproducible de transferencia de aprendizaje de coste mínimo: demuestra que con un backbone preentrenado congelado, unos cientos de imágenes negativas y una regresión logística se puede construir un detector de instancia (un individuo concreto, no una categoría) sin GPU dedicada ni fine-tuning. Sus cifras, sin embargo, proceden de una muestra pequeña y de un único entorno doméstico, y no se han validado con benchmarks estándar.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Cabeza de regresión logística (scikit-learn) sobre características globales congeladas de un ConvNeXt-Tiny; clasificación binaria de imagen (Simba / no Simba) |
| Parámetros totales | No disponible en la model card. El backbone ConvNeXt-Tiny aporta ~28,6 M de parámetros (congelados, dato de la arquitectura timm, no de la model card); la cabeza entrenada es una regresión logística de muy pocos parámetros (orden de 10^3) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica: modelo de visión. La model card no especifica la resolución de entrada; el backbone timm se entrena por defecto a 224x224 |
| Tipos de cuantización | No disponible. No se publican variantes cuantizadas; el artefacto distribuido es un serializado joblib en coma flotante |
| Idiomas soportados | No disponible / no aplica: la entrada es una imagen, no hay texto |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | joblib (serialización de scikit-learn) para la cabeza. Los pesos del backbone se obtienen del repositorio de timm mediante `huggingface_hub`; el formato exacto de esos pesos no se detalla en la model card. Tamaño del repo: 0,0 GB |

## Arquitectura y entrenamiento

La arquitectura es un pipeline de dos etapas. Primero, un ConvNeXt-Tiny preentrenado en ImageNet-22k y afinado en ImageNet-1k (`timm/convnext_tiny.fb_in22k_ft_in1k`, licencia Apache-2.0) actúa como extractor de características congelado: no se actualiza ningún peso del backbone. Después, una regresión logística de scikit-learn se entrena sobre el vector de características global que produce el backbone para decidir entre las dos clases. No hay fine-tuning, ni aumentos de datos documentados, ni fases de RLHF o DPO (no aplican en un clasificador de este tipo). La versión de scikit-learn declarada como requisito es la 1.9.1.

El conjunto de entrenamiento combina 42 fotografías de Simba con 2371 fotos de gatos de Oxford-IIIT Pet (Parkhi et al., 2012, CVPR) como ejemplos negativos. La innovación relevante no está en el modelo sino en el protocolo de evaluación: las fotos de Simba se agruparon por día de captura (20 días) y se aplicó una validación cruzada de 5 folds agrupada, de modo que ninguna ráfaga casi idéntica de un mismo día queda repartida entre entrenamiento y test. Ese detalle es el que hace que las métricas reportadas sean algo más creíbles que un split aleatorio sobre fotos correlacionadas.

## Capacidades

- Clasificación binaria de imagen: devuelve la etiqueta `Simba` o la clase negativa, acompañada de una probabilidad (ejemplo de la model card: `('Simba', 0.97)`).
- Detección de instancia individual (un gato concreto), no de una categoría genérica como "gato" ni de una raza.
- Discriminación frente a gatos de otras razas, incluidos gatos naranjas y razas de pelo largo similar; el único falso positivo reportado fue un Maine Coon.
- Inferencia sobre imágenes sueltas mediante un script de línea de comandos (`python predict.py photo.jpg`).
- Ejecución en CPU sin requisitos de acelerador, al operar solo con un forward del backbone y una regresión logística.
- No soporta tool calling, ni agentes, ni razonamiento multi-paso, ni entrada de texto, ni audio, ni vídeo.

## Casos de uso

- Triaje del carrete fotográfico personal: recorrer una carpeta de miles de fotos y separar automáticamente las que contienen a Simba, usando la probabilidad devuelta como umbral configurable para priorizar la revisión manual.
- Cámara de comedero o arenero conectada: clasificar cada imagen capturada y registrar solo las visitas del gato objetivo, descartando visitas de otros animales o de vecinos.
- Apertura selectiva de puerta o ventana para mascota: usar la predicción como señal de habilitación en un sistema domótico, con el 0,04 % de falsos positivos reportado como referencia de tasa de error.
- Filtrado previo a la publicación de un dataset: eliminar las imágenes del propio animal antes de compartir un conjunto de fotos, evitando exponer datos personales.
- Receta de transferencia de aprendizaje de bajo coste: replicar el pipeline (backbone timm congelado + regresión logística) para identificar otro individuo concreto —otra mascota, un objeto, un producto— con menos de un centenar de imágenes positivas.
- Material docente: ejemplo completo y ejecutable de separación backbone/cabeza, validación agrupada y análisis de fugas de datos en un curso de machine learning aplicado.
- Identificación de animales en refugios o clínicas: prototipo para reencontrar un animal perdido concreto comparando capturas nuevas contra un registro fotográfico, siempre con supervisión humana.

## Benchmarks y rendimiento

No se han publicado resultados en benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, ni aplican a esta tarea. La model card únicamente reporta la evaluación propia del autor:

| Métrica | Resultado | Detalle metodológico |
|---|---|---|
| Recall en días no vistos (fotos de Simba) | 41 de 42 fotos; recall medio 0,98; peor fold 0,95 | Validación cruzada de 5 folds agrupada por día de captura (20 días) |
| Falsos positivos sobre gatos ajenos | 1 de 2371 (0,04 %) | Un Maine Coon; 1 de 200 Maine Coons del conjunto |
| Salida de ejemplo | `('Simba', 0.97)` | Ejecución de `predict.py` sobre una foto |

## Requisitos de hardware

- VRAM estimada: por debajo de 1 GB en fp32 (los ~28,6 M de parámetros del backbone ocupan ~115 MB y el resto son activaciones de un único forward a 224x224). Estimación a partir de la arquitectura, no publicada por el autor.
- Cabe en cualquier GPU consumer: GTX 1650, RTX 3060, RTX 4090 o superiores quedan sobredimensionadas para este modelo.
- Inferencia en CPU perfectamente viable: el coste por imagen es el de un forward de ConvNeXt-Tiny (del orden de ~4,5 GFLOPs a 224x224, dato de la arquitectura estándar).
- GPU de centro de datos (A100, H100, L4, T4): innecesarias salvo que se procesen lotes muy grandes en paralelo.
- Opciones de despliegue: el script `predict.py` incluido, con dependencias `timm`, `torch`, `scikit-learn` 1.9.1, `huggingface_hub` y `Pillow`. No se publican artefactos para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo. Una exportación a ONNX o TorchScript sería factible, pero no está incluida en el repositorio.
- Latencia y throughput: no publicados. De forma orientativa (no medida por el autor), decenas de milisegundos por imagen en CPU moderna y por debajo de 10 ms en GPU.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Entrada | Rendimiento en la tarea | Licencia |
|---|---|---|---|---|---|
| `makactuary/simba-or-not` | Clasificador binario de instancia | Backbone ~28,6 M congelado + regresión logística | Imagen (resolución no especificada) | Recall 0,98; 0,04 % de falsos positivos (evaluación propia) | CC BY-SA 4.0 |
| `timm/convnext_tiny.fb_in22k_ft_in1k` | Clasificador ImageNet-1k | ~28,6 M | 224x224 | No resuelve la tarea: sus 1000 clases no incluyen identidades individuales de gato | Apache-2.0 |
| Clasificadores de raza sobre Oxford-IIIT Pet disponibles en HuggingFace | Clasificación multirraza (37 razas) | Variable según backbone | Variable | No disponible para esta comparación; resuelven raza, no individuo | Variable |
| Enfoques zero-shot con CLIP / open_clip | Visión-lenguaje zero-shot | Variable | 224x224 típicamente | No verificado en esta tarea; sin entrenamiento específico, la discriminación entre dos gatos naranjas es débil | Variable |

## Limitaciones y advertencias

- Sesgo de entorno: todas las fotos de Simba se tomaron en la misma casa, mientras que los negativos provienen de muchos lugares distintos. Parte de lo aprendido puede ser la alfombra, el sofá o la iluminación del domicilio, no el gato.
- No se ha probado con Simba fotografiado fuera de casa ni con otros gatos naranjas en el mismo domicilio, que es el escenario donde el modelo fallaría con más probabilidad.
- Muestra muy pequeña: 42 fotos de 20 días. El propio autor califica las métricas de indicativas.
- Riesgo de alucinación en sentido amplio: la cabeza siempre devuelve una probabilidad, incluso ante imágenes que no contienen ningún gato; no se documenta ninguna clase de rechazo ni calibración más allá del ejemplo `('Simba', 0.97)`.
- Las fotos originales de Simba no se publican, solo la cabeza entrenada. El modelo no es reproducible a partir del repositorio y no puede reentrenarse sin los datos del autor.
- Licencia CC BY-SA 4.0: permite uso comercial con atribución, pero obliga a compartir las obras derivadas bajo la misma licencia, lo que puede ser incompatible con productos propietarios. El backbone es Apache-2.0, pero el modelo distribuido hereda la licencia ShareAlike del dataset Oxford-IIIT Pet.
- Modelo sin validación externa: 0 descargas y 0 likes en el momento de la consulta, sin revisión por terceros ni benchmarks independientes.
- No generaliza a otras especies ni a categorías: no distingue perros, ni razas, ni "gato" frente a "no gato" más allá de la frontera Simba / resto.
- Colisión de nombre: las búsquedas de "SIMBA" devuelven mayoritariamente el sistema de texto a voz SIMBA 3.0 de Speechify y contenidos sobre IA para actuarios, sin relación alguna con este modelo. Conviene citarlo siempre con su ID completo `makactuary/simba-or-not`.
- Los resultados de la búsqueda web realizada no aportan información técnica sobre este modelo; todas las cifras de esta ficha provienen de la model card y de metadatos de HuggingFace.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/makactuary/simba-or-not
- Backbone base en HuggingFace: https://huggingface.co/timm/convnext_tiny.fb_in22k_ft_in1k
- Dataset de negativos en HuggingFace: https://huggingface.co/datasets/timm/oxford-iiit-pet
- Página oficial del dataset Oxford-IIIT Pet (Parkhi et al., 2012, CVPR): https://www.robots.ox.ac.uk/~vgg/data/pets/
- Repositorio timm (librería del backbone): https://github.com/huggingface/pytorch-image-models
- Resultados de búsqueda web consultados, sin relación con el modelo: https://www.marktechpost.com/2026/05/30/best-text-to-speech-tts-models-in-2026-a-benchmark-based-comparison/ y https://actuary.info/become-an-actuary/python-ai/how-actuaries-using-ai-ml-2026/
