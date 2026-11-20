# LuisPaim/oed-resnet18-tucker2

## Resumen

`LuisPaim/oed-resnet18-tucker2` es un modelo de clasificación de imágenes médicas derivado de un ResNet-18, desarrollado por Luis Felipe Garcia de Souza Paim en la Faculdade de Computação de la Universidade Federal de Uberlândia (UFU), bajo la supervisión del Prof. Marcelo Zanchetta do Nascimento. El modelo clasifica regiones de interés (ROI) de tejido histopatológico en cuatro grados de displasia epitelial oral (sano, leve, moderado, severo) sobre el conjunto de datos OralEpitheliumDB.

La particularidad del modelo es la compresión: cada convolución 3×3 con más de 64 canales de entrada (11 capas en total) se sustituye por una factorización Tucker-2 sobre los modos de canal, de modo que una convolución pasa a ser tres convoluciones en secuencia (1×1 reducción → núcleo 3×3 → 1×1 expansión). Esto reduce tanto el número de parámetros como los FLOPs reales, a diferencia de otras técnicas de compresión que solo reducen el almacenamiento.

El repositorio publica dos variantes con umbrales de energía distintos: τ = 0.9 (6,29 M de parámetros, 2,64 GFLOPs) y τ = 0.4 (0,89 M de parámetros, 1,43 GFLOPs). La versión τ = 0.4 elimina el 92 % de los parámetros del baseline y multiplica por 2,54 la reducción de FLOPs, con una variación de AUC no distinguible de cero según el intervalo de confianza publicado. Es un modelo de investigación, no un dispositivo médico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ResNet-18 con convoluciones 3×3 factorizadas mediante Tucker-2 (1×1 reduce → 3×3 core → 1×1 expand) en 11 capas |
| Parametros totales | 6.295.595 (variante τ = 0.9, `model.safetensors`); 0,89 M en la variante τ = 0.4 (`model_e0.4.safetensors`) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo de visión, clasificación de imágenes) |
| Tipos de cuantizacion | No disponible (solo se documenta fp32 en CPU y AMP en GPU para las mediciones) |
| Idiomas soportados | No disponible (no es un modelo de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`model.safetensors`, `model_e0.4.safetensors`) |

## Arquitectura y entrenamiento

El modelo parte del checkpoint del fold 1 del baseline `LuisPaim/oed-resnet18` (ResNet-18 estándar, 11,18 M de parámetros, 3,63 GFLOPs). Sobre esa red se descompone cada convolución 3×3 con más de 64 canales de entrada, desde `layer2.0.conv2` hasta `layer4.1.conv2` (11 capas), aplicando una factorización Tucker-2 sobre los modos de canal. Los rangos se eligen capa a capa mediante un umbral de energía τ: se selecciona el rango más pequeño cuyos valores singulares conservan una fracción τ de la energía (Σσ²) del unfolding correspondiente. Tras la descomposición, la red se afina hasta 15 épocas con AdamW (lr 1e-4), schedule coseno, entropía cruzada ponderada por clase y early stopping sobre AUC de validación; el conjunto de test no se usa en el ajuste fino.

Los datos de entrenamiento corresponden al dataset OralEpitheliumDB, con imágenes histopatológicas de tejido de ratón. El test de evaluación es un conjunto hold-out de 92 imágenes. El autor indica que las métricas publicadas se recalcularon en CPU a partir de los ficheros publicados y coinciden con la ejecución original en GPU con una tolerancia de 0,0002 en AUC. No se documenta el número de tokens ni composición de dataset más allá de la referencia al conjunto OralEpitheliumDB, ni si hubo RLHF/DPO (no aplica en un clasificador de imágenes).

## Capacidades

- Clasificación de imágenes histopatológicas en cuatro clases: sano, leve, moderado y severo (grados de displasia epitelial oral).
- Salida de probabilidades por clase mediante `oed.predict(model, Image.open("roi.tif"))`, que devuelve un diccionario `{'healthy': ..., 'mild': ..., 'moderate': ..., 'severe': ...}`.
- Reconstrucción automática de la arquitectura comprimida a partir de las formas de tensor almacenadas en el fichero, sin necesidad del código original de descomposición ni de la librería `tensorly`.
- Dos puntos de compresión seleccionables: τ = 0.9 (por defecto) y τ = 0.4 (alta compresión).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un clasificador de imágenes, no un modelo generativo.
- No dispone de modo thinking, visión general, audio ni otras capacidades especiales más allá de la clasificación de ROI histológicas.

## Casos de uso

- Investigación en compresión de modelos: el repositorio sirve como referencia reproducible para comparar Tucker-2 frente a otras descomposiciones (el autor publica también una variante Tensor-Train) sobre una misma arquitectura y dataset, con métricas de AUC, F1, QWK, accuracy y latencia documentadas.
- Evaluación de técnicas de despliegue en CPU: la variante τ = 0.4 es 1,8× más rápida en CPU (14,7 ms frente a 26,8 ms del baseline en un Xeon de 2 núcleos a 2,1 GHz, batch 1, fp32), lo que la hace útil para estudiar inferencia en entornos sin GPU.
- Prototipado de pipelines de clasificación histopatológica en investigación: el modelo se puede integrar en un script de Python con `huggingface_hub`, `torch`, `torchvision` y `safetensors` para clasificar ROIs de tejido en cuatro grados, como paso previo a un estudio más amplio.
- Docencia y experimentación con factorizaciones tensoriales: el código `oed_models.py` y los dos checkpoints permiten reproducir la descomposición y el ajuste fino en un entorno controlado.
- Comparación de compromisos precisión/latencia: con los datos publicados se puede analizar por qué reducir FLOPs no reduce latencia en GPU a batch 1 (tres kernels pequeños en lugar de uno) mientras sí lo hace en CPU.
- Estudio de la selección de umbral de energía τ: el repositorio documenta explícitamente que τ = 0.4 se eligió tras inspeccionar el barrido sobre el test, por lo que sirve como caso de estudio sobre sesgo de selección en la evaluación.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre el conjunto hold-out de test (n = 92):

| Modelo | Params | GFLOPs | AUC | ΔAUC vs. baseline [IC 95 %] | F1 (macro) | QWK | Accuracy | Danger rate | Latencia GPU (ms) | Latencia CPU (ms) |
|---|---|---|---|---|---|---|---|---|---|---|
| ResNet-18 baseline (fold 1) | 11,18 M | 3,63 | 0,9586 | — | 0,7956 | 0,8591 | 0,7935 | 0,043 | 2,72 | 26,8 |
| Tucker-2, τ = 0.9 | 6,29 M | 2,64 | 0,9420 | -0,0167 [-0,0460, +0,0082] | 0,7842 | 0,8852 | 0,7935 | 0,033 | 3,37 | 25,8 |
| Tucker-2, τ = 0.4 (post hoc) | 0,89 M | 1,43 | 0,9564 | -0,0024 [-0,0255, +0,0223] | 0,8111 | 0,8445 | 0,8152 | 0,054 | 3,36 | 14,7 |

Referencia adicional: el ensemble de 5 folds del baseline alcanza AUC 0,9789, F1 0,8771, QWK 0,9153 y accuracy 0,8804 sobre el mismo test. Latencia GPU medida en una RTX 3050 Laptop, batch 1, AMP, mediana de 50 ejecuciones tras warm-up. Latencia CPU medida en un Intel Xeon de 2 núcleos a 2,1 GHz, batch 1, fp32, mediana de 50 ejecuciones. ΔAUC e IC 95 % proceden de la ejecución original con 1.000 remuestreos bootstrap pareados.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 6,29 M de parámetros en fp32 el peso ocupa aproximadamente 25 MB, y en la variante τ = 0.4 unos 3,6 MB, por lo que cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: el autor mide latencia en una RTX 3050 Laptop; cualquier GPU con soporte CUDA es suficiente. No se documentan mediciones en A100, H100 ni RTX 4090.
- Cabe en GPU consumer: sí, en cualquier GPU consumer moderna; también en CPU (el autor mide 14,7-26,8 ms por imagen en un Xeon de 2 núcleos).
- Opciones de despliegue: inferencia directa con PyTorch y `safetensors` mediante el módulo `oed_models.py`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican a un clasificador de imágenes de este tamaño).
- Latencia y throughput: GPU RTX 3050 Laptop, batch 1, AMP: 2,72 ms (baseline), 3,37 ms (τ = 0.9), 3,36 ms (τ = 0.4). CPU Xeon 2 núcleos, batch 1, fp32: 26,8 ms (baseline), 25,8 ms (τ = 0.9), 14,7 ms (τ = 0.4). No se publica throughput para lotes mayores.

## Comparativa con modelos similares

| Modelo | Params | GFLOPs | AUC | F1 (macro) | QWK | Accuracy | Licencia |
|---|---|---|---|---|---|---|---|
| ResNet-18 baseline (fold 1) | 11,18 M | 3,63 | 0,9586 | 0,7956 | 0,8591 | 0,7935 | Apache 2.0 (repo `LuisPaim/oed-resnet18`) |
| Tucker-2 τ = 0.9 (este modelo) | 6,29 M | 2,64 | 0,9420 | 0,7842 | 0,8852 | 0,7935 | Apache 2.0 |
| Tucker-2 τ = 0.4 (este modelo) | 0,89 M | 1,43 | 0,9564 | 0,8111 | 0,8445 | 0,8152 | Apache 2.0 |
| Tensor-Train (`LuisPaim/oed-resnet18-tensortrain`) | No disponible en la información proporcionada | No disponible | No disponible | No disponible | No disponible | No disponible | Apache 2.0 (según el repositorio relacionado) |

La comparación con la variante Tensor-Train no puede completarse porque la información proporcionada solo enlaza el repositorio sin incluir sus métricas. No se dispone de otros modelos comparables de la misma categoría (clasificación de displasia epitelial oral sobre OralEpitheliumDB) en la información disponible.

## Limitaciones y advertencias

- Solo para investigación y educación: no es un dispositivo médico y no está validado para diagnóstico.
- Entrenado con tejido de ratón: no se ha probado en biopsias humanas, otros protocolos de tinción ni otros escáneres.
- Conjunto de test pequeño (92 imágenes): los intervalos de confianza son amplios y diferencias de unas centésimas de AUC quedan dentro del ruido.
- Punto de partida único (una semilla, fold 1): los resultados de compresión describen un checkpoint, no una media sobre semillas.
- τ = 0.4 se seleccionó tras evaluar el barrido de umbrales sobre el mismo test, por lo que sus métricas son optimistas; τ = 0.9 es el umbral que usa el pipeline para la comparación final, no el mejor punto del barrido.
- En GPU a batch 1, ambas variantes Tucker son más lentas que el baseline denso (3,37 y 3,36 ms frente a 2,72 ms) porque ejecutan tres kernels pequeños en lugar de uno; la ventaja de latencia solo se observa en CPU.
- Riesgo de alucinación: no aplica en el sentido generativo, pero sí existe riesgo de clasificación errónea en clases limítrofes (leve/moderado) dado el tamaño reducido del test y la naturaleza del tejido.
- Sesgos conocidos: no documentados en la model card más allá de las limitaciones de dominio (tejido de ratón, un solo protocolo de tinción y escáner).
- Licencia Apache 2.0: permite uso comercial según los términos de la licencia, pero el autor restringe explícitamente el uso a investigación y educación y advierte de que no está validado para diagnóstico.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/LuisPaim/oed-resnet18-tucker2
- Modelo base: https://huggingface.co/LuisPaim/oed-resnet18
- Variante Tensor-Train: https://huggingface.co/LuisPaim/oed-resnet18-tensortrain
- Demo: https://huggingface.co/spaces/LuisPaim/oed-compression-demo
- Dataset OralEpitheliumDB (paper): doi:10.1007/s10278-024-01041-w, *Journal of Imaging Informatics in Medicine*, 2024
