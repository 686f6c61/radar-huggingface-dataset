# MohammadSakibHossain/brain-tumor-segmentation-mlops

## Resumen

El repositorio `MohammadSakibHossain/brain-tumor-segmentation-mlops` contiene tres redes neuronales 3D para segmentación de tumores cerebrales en resonancia magnética multiparamétrica (BraTS), exportadas a formato ONNX para inferencia rápida en CPU. Lo desarrolla MohammadSakibHossain como parte de un proyecto MLOps completo que incluye entrenamiento, evaluación, API, visor 3D y CI/CD, disponible en GitHub. El modelo resuelve la tarea de delinear automáticamente tres regiones tumorales anidadas (WT, TC, ET) a partir de cuatro secuencias de MRI (FLAIR, T1, T1 con contraste, T2).

La arquitectura subyacente son tres redes 3D independientes: SegResNet (la recomendada, 4,7 M de parámetros), Swin UNETR (transformer, 62,2 M de parámetros) y SegFormer3D (transformer ligero, 4,5 M de parámetros). La entrada es un tensor float32 de forma `[1, 4, 160, 160, 160]` y la salida son logits de forma `[1, 3, 160, 160, 160]`, correspondientes a las regiones WT (whole tumour), TC (tumour core) y ET (enhancing tumour). El modelo se distribuye con datos de muestra y una galería de casos para el visor web.

Es relevante ahora porque ofrece un pipeline MLOps completo y reproducible para segmentación médica 3D, con exportación ONNX que permite inferencia en CPU a 3,0 s por cerebro (8 hilos) con SegResNet, sin necesidad de GPU. El repositorio incluye checksums SHA-256, comparación ONNX vs PyTorch y estadísticas de significación, lo que facilita su evaluación rigurosa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SegResNet, Swin UNETR y SegFormer3D (tres redes 3D independientes) |
| Parametros totales | SegResNet: 4,7 M; Swin UNETR: 62,2 M; SegFormer3D: 4,5 M |
| Parametros activos | no aplica (no son MoE) |
| Longitud de contexto | no aplica (modelo de segmentacion de imagenes 3D) |
| Tipos de cuantizacion | no disponible (solo se distribuyen pesos ONNX en float32) |
| Idiomas soportados | no aplica (modelo de vision medica) |
| Licencia | cc-by-sa-4.0 |
| Formato de pesos | ONNX (opset 18, exportado con PyTorch 2.11 dynamo exporter) |

## Arquitectura y entrenamiento

Los tres modelos son redes neuronales convolucionales y transformers 3D para segmentación semántica de imágenes médicas. SegResNet es una CNN con bloques residuales y conexiones de salto; Swin UNETR combina un transformer jerárquico con un decoder en U-Net; SegFormer3D es una variante ligera de transformer para segmentación 3D. La entrada es un tensor de `[1, 4, 160, 160, 160]` con canales FLAIR, T1, T1 con contraste y T2; la salida son logits de `[1, 3, 160, 160, 160]` para WT, TC y ET. La post-procesado aplica `sigmoid(logits) > 0.5` de forma independiente por canal, permitiendo que un vóxel pertenezca a varias regiones. Para cerebros completos se desliza una ventana de 160³ con 50% de solapamiento y se promedian los logits.

El entrenamiento usó el dataset Medical Segmentation Decathlon Task01 BrainTumour, con 484 cerebros etiquetados de BraTS 2016/2017. La división fue 340 entrenamiento / 72 validación / 72 test (semilla 42). La receta, idéntica para los tres modelos, incluye crops aleatorios de 160³ (mitad centrados en tumor), batch 2, volteos aleatorios en 3 ejes, ±10% de contraste y brillo, pérdida Dice + entropía cruzada y optimizador AdamW con lr 1e-... (el texto de la model card se corta en este punto). Se exportaron a ONNX con el exportador dynamo de PyTorch 2.11, opset 18, y el grafo acepta exactamente una ventana de 160³.

## Capacidades

- Segmentación 3D de tumores cerebrales en MRI multiparamétrica (FLAIR, T1, T1c, T2).
- Predicción de tres regiones anidadas: WT (whole tumour), TC (tumour core) y ET (enhancing tumour).
- Inferencia en CPU mediante ONNX Runtime, sin necesidad de GPU.
- Procesamiento de cerebros completos mediante sliding window inference con solapamiento del 50%.
- Post-procesado configurable: umbral sigmoid 0.5 por canal, permitiendo solapamiento entre regiones.
- Exportación ONNX con alta fidelidad respecto a PyTorch (Dice ONNX vs PyTorch: 0,998 para SegResNet, 0,994 para Swin UNETR, 0,983 para SegFormer3D).
- Integración con MONAI para inferencia por ventanas deslizantes.
- No soporta tool calling, agentes, ni capacidades multilingües (es un modelo de visión médica).

## Casos de uso

- **Investigación en neurooncología**: segmentación automática de tumores en cohorts de BraTS para estudios retrospectivos, usando SegResNet por su equilibrio precisión/velocidad (Dice medio 0,835).
- **Prototipado de herramientas de diagnóstico asistido**: integrar el modelo ONNX en una API para previsualizar regiones tumorales en un visor 3D, como el incluido en el repositorio (galería con 6 cerebros en glTF).
- **Despliegue en entornos sin GPU**: gracias a la exportación ONNX y a los 3,0 s por cerebro en CPU con 8 hilos (SegResNet), es viable en estaciones de trabajo clínicas sin acelerador.
- **Validación de pipelines MLOps**: el repositorio incluye MLflow, checksums SHA-256, CI/CD y comparación ONNX vs PyTorch, sirviendo como plantilla para proyectos de segmentación médica reproducibles.
- **Comparación de arquitecturas 3D**: permite evaluar SegResNet, Swin UNETR y SegFormer3D bajo la misma receta de entrenamiento y conjunto de test, con métricas Dice y HD95.
- **Educación y docencia**: los datos de muestra (4 cerebros de test) y el código de inferencia permiten demostrar segmentación 3D sin necesidad de datos propios.
- **Preprocesado para otras tareas**: generar máscaras de regiones tumorales para entrenar modelos posteriores de clasificación o predicción de supervivencia.

## Benchmarks y rendimiento

Conjunto de test de 72 cerebros, nunca usado en entrenamiento ni selección de modelo.

| Modelo | Dice WT | Dice TC | Dice ET | Dice medio | HD95 WT / TC / ET (mm) | Params | CPU s / cerebro (2 / 8 hilos) | ONNX vs PyTorch |
|---|---|---|---|---|---|---|---|---|
| SegResNet | 0,899 | 0,833 | 0,772 | 0,835 | 10,0 / 9,2 / 16,7 | 4,7 M | 7,1 / 3,0 | 0,998 |
| Swin UNETR | 0,898 | 0,829 | 0,779 | 0,835 | 8,7 / 8,5 / 16,4 | 62,2 M | 31,3 / 14,2 | 0,994 |
| SegFormer3D | 0,889 | 0,815 | 0,736 | 0,813 | 8,0 / 8,6 / 10,2 | 4,5 M | 1,4 / 0,8 | 0,983 |

Estadísticas: Wilcoxon signed-rank sobre Dice medio por cerebro. SegResNet vs Swin UNETR p = 0,42 (sin diferencia significativa); ambos vs SegFormer3D p < 0,0001. El campeón es SegResNet: iguala a Swin UNETR con 13 veces menos parámetros, 4 veces más rápido en CPU y 4 veces menos memoria GPU.

## Requisitos de hardware

- VRAM estimada para inferencia: SegResNet y SegFormer3D son aptos para GPU consumer (menos de 4 GB en float32 para una ventana de 160³); Swin UNETR requiere aproximadamente 4 veces más memoria GPU que SegResNet, según la model card.
- GPU recomendadas: no especificadas en la información disponible; por tamaño, SegResNet y SegFormer3D caben en RTX 3060/4090; Swin UNETR se beneficia de A100/H100 para lotes grandes.
- Cabe en GPU consumer: sí, SegResNet y SegFormer3D con margen amplio; Swin UNETR con más consumo pero viable en GPUs de 12 GB o más.
- Opciones de despliegue: ONNX Runtime (CPU), integración con MONAI para sliding window inference; el repositorio incluye Docker para la app completa (página de subida + visor 3D).
- Latencia y throughput: SegResNet 3,0 s por cerebro en CPU con 8 hilos (7,1 s con 2 hilos); Swin UNETR 14,2 s / 31,3 s; SegFormer3D 0,8 s / 1,4 s. No se proporcionan datos de throughput en GPU.

## Comparativa con modelos similares

| Modelo | Params | Dice medio | HD95 ET (mm) | CPU s / cerebro (8 hilos) | Licencia | Formato |
|---|---|---|---|---|---|---|
| SegResNet (este repo) | 4,7 M | 0,835 | 16,7 | 3,0 | cc-by-sa-4.0 | ONNX |
| Swin UNETR (este repo) | 62,2 M | 0,835 | 16,4 | 14,2 | cc-by-sa-4.0 | ONNX |
| SegFormer3D (este repo) | 4,5 M | 0,813 | 10,2 | 0,8 | cc-by-sa-4.0 | ONNX |

No se dispone de información sobre otros modelos comparables externos al repositorio en la documentación proporcionada.

## Limitaciones y advertencias

- No es un dispositivo médico: solo para investigación y educación. No usar para diagnóstico ni decisiones de tratamiento.
- Sesgos conocidos: no documentados en la información proporcionada; el entrenamiento se limita a BraTS 2016/2017, lo que puede reducir la generalización a otras poblaciones o protocolos de adquisición.
- Riesgo de alucinación: en segmentación, puede generar regiones inexistentes o omitir tumores; el HD95 de ET es de 16,7 mm para SegResNet, lo que indica errores en bordes de la región enhancing.
- Limitaciones de contexto o idioma: no aplica (modelo de visión); la entrada debe ser MRI con cráneo eliminado, 4 secuencias y resolución de 1 mm.
- Restricciones de licencia: cc-by-sa-4.0 permite uso comercial con atribución y compartir bajo la misma licencia, pero al ser un modelo médico, el uso clínico está fuera de su propósito declarado.
- Caveats para producción: la inferencia en cerebros completos requiere sliding window con solapamiento del 50%, lo que multiplica el coste; el grafo ONNX acepta exactamente una ventana de 160³, no lotes variables; la normalización debe aplicarse solo a vóxeles no cero (cerebro) y es necesario recortar al bounding box del cerebro.

## Enlaces

- Hugging Face: https://huggingface.co/MohammadSakibHossain/brain-tumor-segmentation-mlops
- GitHub (código, entrenamiento, evaluación, API, visor, CI/CD): https://github.com/SakibHossain9999/Brain-Tumor-Segmentation-Mlops
- Paper referenciado en los tags (arXiv:1902.09063): https://arxiv.org/abs/1902.09063
- Dataset Medical Segmentation Decathlon Task01 BrainTumour: no se proporciona enlace directo en la información disponible.
