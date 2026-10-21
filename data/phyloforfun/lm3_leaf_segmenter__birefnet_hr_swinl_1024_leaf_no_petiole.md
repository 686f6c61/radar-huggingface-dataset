# phyloforfun/lm3_leaf_segmenter__birefnet_hr_swinl_1024_leaf_no_petiole

## Resumen

`lm3_leaf_segmenter__birefnet_hr_swinl_1024_leaf_no_petiole` es un modelo de segmentación de imágenes, no un modelo de lenguaje: una red BiRefNet con backbone Swin Transformer Large afinada por el autor `phyloforfun` para extraer una máscara binaria de la lámina foliar (sin pecíolo) en recortes de una sola hoja procedentes de especímenes de herbario. Forma parte del ecosistema LeafMachine3 (LM3), una cadena de extracción de rasgos morfológicos de imágenes de herbario, y se publica como alternativa experimental al segmentador por defecto de LM3, que es un YOLO26x-seg.

El problema que resuelve es concreto: aislar la lámina de la hoja frente al fondo de la digitalización, excluyendo el pecíolo y tratando los agujeros internos como fondo, con entrada redimensionada a 1024×1024 y salida de probabilidad a la misma resolución. BiRefNet está diseñado para estructuras finas y delgadas, lo que encaja con bordes dentados, lóbulos y nerviaciones, aunque al ser segmentación semántica (una sola máscara) y no de instancias, su integración en el flujo de LM3 es menos directa que la del YOLO.

Es relevante ahora porque el autor libera los pesos con licencia MIT en cuatro formatos (PyTorch, ONNX, TorchScript y OpenVINO) y con métricas de validación y test publicadas (Dice medio de 0,980), lo que permite reproducir la inferencia en CPU o GPU sin depender del repositorio original de BiRefNet. No es un modelo por defecto de ninguna versión de LeafMachine3.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | BiRefNet (referencia bilateral: módulo de localización más decodificador de reconstrucción guiado por referencias de imagen y de gradiente, con bloques ASPP de convoluciones deformables); backbone Swin Transformer Large (`swin_v1_l`) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada fija `[1, 3, 1024, 1024]`) |
| Tipos de cuantización | no disponible; las cuatro exportaciones publicadas están en fp32 |
| Idiomas soportados | no aplica |
| Licencia | MIT |
| Formato de pesos | `.pth` (state dict de BiRefNet), `.onnx` (opset 17, batch 1), `.torchscript`, OpenVINO IR (fp32); sin exportación CoreML |
| Resolución de entrada | 1024 × 1024, redimensionada (no letterbox), RGB escalado a [0, 1] con normalización ImageNet dentro del grafo; tensor `input_rgb01` float32 |
| Salida | `prob` `[1, 1, 1024, 1024]`, probabilidad de primer plano con sigmoide aplicada; umbral 0,5 |
| Primer plano | lámina (una máscara; los agujeros son fondo; el pecíolo es fondo) |
| Tamaño del repositorio | 3,7 GB |

## Arquitectura y entrenamiento

BiRefNet es una arquitectura de segmentación dicotómica de alta resolución basada en referencias bilaterales: un módulo de localización genera un mapa grueso y un decodificador de reconstrucción lo refina usando referencias derivadas de la propia imagen y del gradiente, con bloques ASPP de convolución deformable para capturar contexto multi-escala. El backbone es Swin Transformer Large; en entrenamiento se supervisan predicciones multi-escala y en inferencia se usa el mapa a resolución completa. El autor parte de los pesos `BiRefNet_HR-general-epoch_130` (eliminación de fondo general entrenada a 2048×2048) y afina la red completa a 1024×1024 durante 40 épocas (de la 130 a la 170), con batch 4, AdamW y tasa de aprendizaje 1e-5, usando el preajuste de pérdidas de eliminación de fondo de BiRefNet (BCE con peso 30, IoU 0,5, MAE 100, SSIM 10) y activando el conmutador de pérdida orientada a contornos en las últimas 20 épocas. El checkpoint publicado es el de la época final.

Los datos proceden del conjunto `LM3_Leaf-birefnet-leafbg-nopetiole`, derivado de `LM3_Leaf` (construido el 2026-06-26 a partir de 5 proyectos de segmentación de Labelbox, 16.895 recortes de una hoja, partición congelada 80/10/10, sal `lm3`, hash de clases `7f2c49ca64d9`). Cada recorte tiene una máscara binaria cuyo primer plano son los polígonos de hoja menos los polígonos de agujero, con el pecíolo como fondo; los recortes sin primer plano se descartan. El reparto queda en 13.464 recortes de entrenamiento, 1.705 de validación y 1.701 de test (test construido el 2026-10-21). Ni las imágenes ni las máscaras se distribuyen.

## Capacidades

- Segmentación semántica binaria de la lámina foliar en recortes de una sola hoja de espécimen de herbario, con salida de probabilidad continua a 1024×1024.
- Delimitación de estructuras finas y delgadas (bordes dentados, lóbulos, ápices) gracias al diseño de referencia bilateral de BiRefNet.
- Exclusión explícita del pecíolo del primer plano, por diseño del conjunto de entrenamiento (variante `no_petiole`).
- Tratamiento de los agujeros internos de la hoja como fondo, no como primer plano.
- Inferencia portable: ONNX con convoluciones deformables descompuestas en operaciones estándar (sin operadores personalizados), OpenVINO IR para CPU, TorchScript para CUDA y pesos PyTorch para reentrenamiento.
- No soporta tool calling, function calling, agentes, generación de texto, razonamiento multi-paso ni capacidades multilingües: es un modelo puramente visual.
- No dispone de modo "thinking", visión general, audio ni ninguna otra modalidad que no sea la segmentación de la entrada RGB indicada.

## Casos de uso

- Digitalización masiva de herbarios: para cada recorte de hoja ya localizado por un detector previo, este modelo genera la máscara de lámina que alimenta el cálculo de área, perímetro, ratio largo/ancho y compacidad en la cadena de rasgos de LeafMachine3.
- Morfometría foliar comparada: al aislar la lámina sin pecíolo, las medidas de área y forma son comparables entre especímenes y entre proyectos de digitalización, algo crítico en estudios de plasticidad foliar y de cambio climático.
- Preetiquetado para anotación humana: las máscaras con Dice cercano a 0,98 en test sirven como propuesta inicial en Labelbox u otras herramientas, reduciendo el tiempo de anotación antes de la corrección manual.
- Control de calidad de pipelines de digitalización: umbralizar la probabilidad media o el área de la máscara permite detectar recortes mal encuadrados, hojas ausentes o imágenes con fondo anómalo antes de que pasen a la fase de extracción de rasgos.
- Segmentación en estaciones de trabajo sin GPU: la exportación OpenVINO IR en fp32 (convertida desde ONNX) permite ejecutar el modelo en CPU en herbarios con infraestructura limitada, sin renunciar a la paridad de máscara con PyTorch (IoU 0,99995 en la comparación publicada).
- Comparación metodológica frente a segmentación de instancias: útil en investigación para cuantificar la ganancia de precisión de un modelo semántico especializado en estructuras finas frente a YOLO26x-seg en hojas con márgenes complejos.
- Generación de datasets derivados: al ser MIT y estar disponible como state dict de BiRefNet, se puede reafinar sobre otras colecciones botánicas con la misma receta de pérdidas.

## Benchmarks y rendimiento

Evaluación contra los polígonos dibujados a mano de `LM3_Leaf`, rasterizados al primer plano del modelo y calculados a la resolución nativa del recorte, a través del ONNX en fp32 con onnxruntime CUDA; las métricas son medias por recorte.

| Split | Recortes | Dice (media) | Dice (mediana) | IoU (media) | Precisión | Recall | MAE |
|---|---|---|---|---|---|---|---|
| val | 1.705 | 0,980 | 0,989 | 0,963 | 0,981 | 0,981 | 0,0140 |
| test | 1.701 | 0,980 | 0,989 | 0,962 | 0,982 | 0,979 | 0,0144 |

Ningún recorte de test obtiene un Dice inferior a 0,5. Paridad de exportación frente al checkpoint de PyTorch (IoU de máscara con umbral 0,5, peor recorte):

| Exportación | Recortes de validación | IoU frente a PyTorch |
|---|---|---|
| ONNX (CPU y CUDA) | 24 | 0,99972 |
| TorchScript | 8 | 1,00000 |
| OpenVINO | 8 | 0,99995 |

No se han publicado resultados de benchmarks comparativos con otros segmentadores botánicos en la información disponible.

## Requisitos de hardware

- VRAM estimada: no publicada por el autor. Las exportaciones en fp32 ocupan del orden de 1 GB de pesos y el repositorio completo suma 3,7 GB con los cuatro formatos; a 1024×1024 se estima un pico de VRAM de un dígito alto de GB, cifra no verificada.
- GPU recomendadas: no hay recomendación oficial. Por tamaño y resolución, una RTX 4090 (24 GB) o una A100/H100 ejecutan la inferencia con holgura; una RTX 3060 de 12 GB o una RTX 4070 deberían ser suficientes para batch 1, que es el único tamaño de lote exportado.
- Cabe en GPU de consumo: sí, previsiblemente a partir de 8-12 GB de VRAM en fp32 y batch 1; no hay datos publicados de consumo real por modelo de tarjeta.
- Opciones de despliegue: onnxruntime (CPU y CUDA) con el ONNX de opset 17 y batch 1; OpenVINO Runtime con el IR fp32 para CPU; TorchScript con `torch.jit.load(..., map_location="cuda")`, que solo funciona en CUDA y requiere `import torchvision` antes de cargar; pesos PyTorch con el repositorio de BiRefNet (`swin_v1_l`, tamaño 1024). No hay exportación CoreML porque coremltools no convierte las convoluciones deformables.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Arquitectura | Tipo de segmentación | Primer plano | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (`..._leaf_no_petiole`) | BiRefNet, Swin-L | Semántica, una máscara | Lámina (agujeros y pecíolo como fondo) | MIT | Pesos en PyTorch, ONNX, TorchScript y OpenVINO; no es modelo por defecto de LM3 |
| `lm3_leaf_segmenter__birefnet_hr_swinl_1024_leaf` | BiRefNet, Swin-L | Semántica, una máscara | Lámina más pecíolo en una sola máscara | MIT | Mismo autor y misma familia de exportaciones |
| `lm3_leaf_segmenter__yolo26x_seg_1024` | YOLO26x-seg | Instancias (lámina, pecíolo y agujeros) | Múltiples clases por instancia | no disponible | Segmentador por defecto de LeafMachine3 |
| `BiRefNet_HR-general-epoch_130` | BiRefNet, Swin-L | Semántica dicotómica general | Objeto salientable sobre fondo | MIT (arquitectura y pesos base) | Pesos base del repositorio de BiRefNet, entrenados a 2048×2048 |

El modelo por defecto de LM3 es el YOLO26x-seg, que además separa pecíolo y agujeros como clases de instancia; esta variante de BiRefNet es un experimento del autor, más precisa en estructuras finas pero más pesada y menos integrable en el flujo global, según indica la propia model card.

## Limitaciones y advertencias

- Es segmentación semántica, no de instancias: devuelve una única máscara por recorte y no permite separar varias hojas ni clases dentro de la misma imagen.
- Supone un recorte con una sola hoja. Con varias hojas, con una hoja parcialmente fuera del encuadre o con recortes mal ajustados, el resultado no está validado.
- La entrada se redimensiona a 1024×1024 sin letterbox, lo que deforma la relación de aspecto original; las medidas derivadas deben deshacerse a la resolución del recorte para ser correctas.
- Por diseño, el pecíolo nunca forma parte del primer plano: no debe usarse para medir longitud de pecíolo ni rasgos que lo incluyan.
- Los agujeros de la hoja se consideran fondo, de modo que el área calculada sobre la máscara excluye dichos huecos; esto puede sesgar comparaciones con anotaciones que los rellenen.
- El umbral de probabilidad es 0,5; no se ha publicado un estudio de sensibilidad al umbral ni de calibración de la probabilidad.
- Dominio restringido a imágenes de herbario digitalizado y a la distribución de `LM3_Leaf`; no hay evidencia de comportamiento en fotografías de campo, hojas escaneadas con otra iluminación o especies ausentes del conjunto.
- No se han publicado análisis de sesgo por especie, familia, región geográfica o tipo de pliego, ni métricas desagregadas más allá de las medias globales.
- Riesgo de alucinación en sentido estricto no aplica, pero sí de falsos positivos de lámina en fondos con textura vegetal o con sombras.
- El conjunto de datos no se distribuye (ni imágenes ni máscaras), por lo que la evaluación no es reproducible de forma independiente con los mismos datos.
- La licencia es MIT, lo que permite uso comercial, pero conviene verificar las condiciones de los pesos base de BiRefNet y de Swin Transformer citados en créditos antes de un despliegue en producción.
- TorchScript solo se ejecuta en CUDA y requiere importar torchvision previamente; no hay exportación CoreML, lo que descarta el despliegue nativo en macOS/iOS por esa vía.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/phyloforfun/lm3_leaf_segmenter__birefnet_hr_swinl_1024_leaf_no_petiole
- Variante con lámina y pecíolo: https://huggingface.co/phyloforfun/lm3_leaf_segmenter__birefnet_hr_swinl_1024_leaf
- Segmentador por defecto de LeafMachine3 (YOLO26x-seg): https://huggingface.co/phyloforfun/lm3_leaf_segmenter__yolo26x_seg_1024
- Repositorio de BiRefNet (arquitectura, código de entrenamiento y pesos `BiRefNet_HR-general`): https://github.com/ZhengPeng7/BiRefNet
- Referencia del artículo: Zheng et al., "Bilateral Reference for High-Resolution Dichotomous Image Segmentation", CAAI Artificial Intelligence Research, 2024 (URL no incluida en la información proporcionada).
- Referencia de Swin Transformer: Liu et al., "Swin Transformer: Hierarchical Vision Transformer using Shifted Windows", 2021 (URL no incluida en la información proporcionada).
- `manifest.json` del repositorio: contiene el SHA-256 de cada archivo publicado.
