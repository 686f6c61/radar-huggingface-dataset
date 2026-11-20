# LuisPaim/oed-resnet18-tensortrain

## Resumen

El modelo `LuisPaim/oed-resnet18-tensortrain` es una red neuronal convolucional ResNet-18 comprimida mediante descomposición tensorial en formato Tensor-Train (TT), desarrollada por Luis Felipe Garcia de Souza Paim en la Faculdade de Computação de la Universidade Federal de Uberlândia (UFU), bajo la supervisión del Prof. Marcelo Zanchetta do Nascimento. Su tarea es la clasificación de imágenes de histopatología para la gradación de displasia epitelial oral (oral epithelial dysplasia, OED) en cuatro clases: sano, leve, moderado y severo. Parte del checkpoint base `LuisPaim/oed-resnet18` (fold 1) y se publica como contraparte del modelo Tucker-2 del mismo autor.

La contribución técnica principal no es la mejora de precisión, sino la demostración empírica de una propiedad contraintuitiva en compresión de modelos: reducir el número de parámetros no reduce necesariamente el coste computacional. En esta implementación, los núcleos convolucionales 3×3 se almacenan como cuatro núcleos TT, pero se reconstruyen al tensor denso en cada forward pass antes de aplicar una convolución estándar. El resultado es una caída del 59 % en parámetros (de 11,18 M a 4,60 M) manteniendo exactamente los mismos 3,63 GFLOPs y aproximadamente el doble de latencia.

El modelo tiene 4.604.871 parámetros almacenados en safetensors y se distribuye con licencia Apache 2.0. Está pensado exclusivamente para investigación y educación, no como dispositivo médico.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ResNet-18 con convoluciones 3×3 descompuestas en Tensor-Train (4 núcleos por kernel) |
| Parámetros totales | 4.604.871 (4,60 M) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, clasificación de imagen) |
| Tipos de cuantización | no disponible (pesos en safetensors, presumiblemente fp32; no se documentan variantes GGUF/INT8) |
| Idiomas soportados | no aplica (clasificación de imágenes, sin capacidades lingüísticas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`model.safetensors`) + definición en `oed_models.py` |

## Arquitectura y entrenamiento

La arquitectura es una ResNet-18 estándar en la que cada convolución 3×3 con más de 64 canales de entrada (11 capas, desde `layer2.0.conv2` hasta `layer4.1.conv2`) se descompone en formato Tensor-Train con cuatro núcleos por kernel. Los rangos TT se eligen por capa mediante un umbral de energía τ = 0,9: se selecciona el rango más pequeño cuyos valores singulares conservan esa fracción de la energía (Σσ²) del unfolding correspondiente. La arquitectura comprimida se reconstruye a partir de las formas tensoriales almacenadas en el fichero, por lo que no se necesita el código original de descomposición ni la librería `tensorly` para cargar el modelo.

El entrenamiento parte del checkpoint fold 1 del baseline `LuisPaim/oed-resnet18`. Tras la descomposición, la red se reajusta hasta 15 épocas con AdamW, learning rate 1e-4, schedule coseno, entropía cruzada ponderada por clase y early stopping sobre AUC de validación. Se usa un split de validación extraído de la porción de entrenamiento; el conjunto de test no se utiliza en el fine-tuning. El dataset de referencia es OralEpitheliumDB, con imágenes de tejido de ratón.

## Capacidades

- Clasificación de imágenes de histopatología en cuatro clases de displasia epitelial oral: sano, leve, moderado y severo.
- Salida de probabilidades por clase mediante la función `oed.predict(model, image)`, que devuelve un diccionario con las cuatro etiquetas.
- Carga autocontenida: la arquitectura se reconstruye desde las formas de los tensores del safetensors.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto.
- No tiene capacidades multilingües ni de visión general: está especializado en un único dominio histopatológico.
- No dispone de modo thinking ni de otras capacidades especiales más allá de la clasificación.

## Casos de uso

- Investigación en compresión de modelos: sirve como referencia experimental para estudiar el compromiso entre parámetros, FLOPs y latencia en redes convolucionales comprimidas con Tensor-Train, comparándolo directamente con el modelo Tucker-2 del mismo autor.
- Docencia en despliegue de modelos médicos: el repositorio incluye la definición completa en `oed_models.py` y un ejemplo de carga con `huggingface_hub`, útil para enseñar pipelines de inferencia autocontenidos.
- Reproducción de resultados: permite recalcular las métricas publicadas sobre el hold-out de 92 imágenes en CPU, ya que el autor confirma que coinciden con la ejecución original en GPU dentro de 0,0002 de AUC.
- Benchmarking de latencia: al mantener los mismos GFLOPs que el baseline pero duplicar la latencia, es un caso de estudio útil para medir el coste de reconstrucción de kernels en cada forward pass.
- Comparación de esquemas de descomposición tensorial: junto con el modelo Tucker-2, permite analizar qué esquema ofrece mejor relación entre compresión de almacenamiento y coste de inferencia.
- Prototipado de clasificación histopatológica en entornos de investigación: como punto de partida para experimentos con OralEpitheliumDB, siempre fuera de cualquier uso clínico.

## Benchmarks y rendimiento

Resultados sobre el conjunto de test hold-out (n = 92), recalculados en CPU desde los ficheros publicados:

| Modelo | Parámetros | GFLOPs | AUC | ΔAUC vs. baseline [IC 95 %] | F1 (macro) | QWK | Exactitud | Tasa de peligro | Latencia GPU (ms) | Latencia CPU (ms) |
|---|---|---|---|---|---|---|---|---|---|---|
| ResNet-18 baseline (fold 1) | 11,18 M | 3,63 | 0,9586 | — | 0,7956 | 0,8591 | 0,7935 | 0,043 | 2,72 | 26,8 |
| Tensor-Train, τ = 0,9 | 4,60 M | 3,63 | 0,9787 | +0,0202 [-0,0003, +0,0433] | 0,8896 | 0,9195 | 0,8913 | 0,033 | 7,01 | 52,2 |
| Tucker-2, τ = 0,9 | 6,29 M | 2,64 | 0,9420 | -0,0167 [-0,0460, +0,0082] | 0,7842 | 0,8852 | 0,7935 | 0,033 | 3,37 | 25,8 |

Referencia adicional: el ensemble de 5 folds del baseline alcanza AUC 0,9789, F1 0,8771, QWK 0,9153 y exactitud 0,8804 sobre el mismo conjunto de test.

Condiciones de medición: latencia GPU en RTX 3050 Laptop, batch 1, AMP, mediana de 50 ejecuciones tras warm-up; latencia CPU en Intel Xeon de 2 núcleos a 2,1 GHz, batch 1, fp32, mediana de 50 ejecuciones. Los intervalos de confianza del ΔAUC provienen de 1.000 remuestreos bootstrap pareados de la ejecución original.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja, en torno a 20-40 MB en fp32 para 4,60 M parámetros, más el overhead de activaciones a batch 1; cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: no se requiere GPU dedicada. El autor reporta latencias en una RTX 3050 Laptop (7,01 ms por imagen).
- Cabe en cualquier GPU consumer, incluidas integradas y portátiles de gama baja.
- Despliegue: PyTorch con `torchvision`, `safetensors` y `huggingface_hub`. No se documentan opciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: 7,01 ms en GPU (RTX 3050 Laptop, batch 1, AMP) y 52,2 ms en CPU (Xeon de 2 núcleos, fp32). El throughput no se publica, pero a batch 1 equivale aproximadamente a 143 imágenes/s en GPU y 19 imágenes/s en CPU.
- Nota: la latencia es aproximadamente el doble que la del baseline (2,72 ms GPU, 26,8 ms CPU) pese a tener un 59 % menos de parámetros, por la reconstrucción de kernels en cada forward pass.

## Comparativa con modelos similares

| Modelo | Parámetros | GFLOPs | AUC | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ResNet-18 baseline (`LuisPaim/oed-resnet18`) | 11,18 M | 3,63 | 0,9586 | no disponible en la información | Hugging Face |
| Tensor-Train τ = 0,9 (este modelo) | 4,60 M | 3,63 | 0,9787 | Apache 2.0 | Hugging Face |
| Tucker-2 τ = 0,9 (`LuisPaim/oed-resnet18-tucker2`) | 6,29 M | 2,64 | 0,9420 | no disponible en la información | Hugging Face |

El baseline es el punto de partida y ofrece la menor latencia (2,72 ms GPU). El modelo Tucker-2 reduce además los FLOPs (2,64 frente a 3,63) y mantiene la latencia cerca del baseline (3,37 ms GPU), a costa de un AUC inferior. El modelo Tensor-Train aquí descrito comprime más el almacenamiento que Tucker-2 pero no reduce FLOPs ni latencia.

## Limitaciones y advertencias

- Solo para investigación y educación: no es un dispositivo médico ni está validado para diagnóstico clínico.
- Entrenado con tejido de ratón; no se ha probado en biopsias humanas, otros protocolos de tinción ni otros escáneres.
- Conjunto de test pequeño (92 imágenes): los intervalos de confianza son amplios y diferencias de centésimas en AUC quedan dentro del ruido. El IC del ΔAUC frente al baseline toca cero, por lo que no hay evidencia de mejora.
- Un único punto de partida (una semilla, fold 1): los resultados de compresión describen un checkpoint concreto, no una media sobre semillas.
- La métrica de AUC favorable no debe interpretarse como superioridad: el propio autor advierte que el intervalo de confianza del ΔAUC incluye el cero.
- La compresión no reduce FLOPs ni latencia; de hecho, la latencia se duplica por la reconstrucción de kernels en cada forward pass. No es adecuada si el objetivo es acelerar inferencia.
- Licencia Apache 2.0 permite uso comercial del código y pesos, pero las limitaciones de validación clínica desaconsejan cualquier aplicación médica real.
- No se documentan sesgos demográficos ni de otro tipo por la naturaleza del dataset (tejido de ratón, dominio muy restringido).
- Riesgo de alucinación no aplica en el sentido generativo, pero sí existe riesgo de clasificación errónea fuera de la distribución de entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/LuisPaim/oed-resnet18-tensortrain
- Baseline: https://huggingface.co/LuisPaim/oed-resnet18
- Modelo Tucker-2: https://huggingface.co/LuisPaim/oed-resnet18-tucker2
- Demo: https://huggingface.co/spaces/LuisPaim/oed-compression-demo
- Dataset OralEpitheliumDB (paper): doi:10.1007/s10278-024-01041-w, *Journal of Imaging Informatics in Medicine*, 2024
