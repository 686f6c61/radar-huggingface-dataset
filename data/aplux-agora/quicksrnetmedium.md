# APLUX-Agora/QuickSRNetMedium

## Resumen

QuickSRNetMedium es un modelo de superresolución de imagen (image-to-image) basado en la arquitectura QuickSRNet, un diseño de superresolución en tiempo real optimizado para dispositivos móviles y de borde. El modelo realiza un escalado de 4× de imágenes de baja resolución y recupera detalle fino con un coste computacional reducido. La versión publicada por APLUX-Agora corresponde a recursos ya convertidos y empaquetados para su despliegue en SoC de Qualcomm (QCS6490 y QCS8550), no a los pesos originales en un formato de entrenamiento convencional.

El repositorio tiene un tamaño de 0,0 GB y no contiene pesos visibles en el momento de la consulta; el paquete se distribuye por SoC objetivo en directorios `targets/<SoC>/`, con binarios contextuales (`model.bin`) en distintas precisiones (FP16, W8A16, W8A8). Está pensado para ejecutarse mediante el SDK APLUX AidLite o el runtime QNN de Qualcomm, y la plataforma Agora (mega.aidlux.com) proporciona mediciones reales sobre placas físicas.

Su relevancia actual reside en el despliegue de superresolución 4× en el extremo (AIoT, cámaras, visión embebida) con latencias del orden de milisegundos y cuantización de 8 bits, un escenario donde los modelos de superresolución de gran tamaño no son viables por cómputo y memoria. La licencia es específica del autor (APLUX Model Farm License), no estándar, lo que condiciona su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | QuickSRNet (red convolucional ligera de superresolucion, factor 4x); detalles de capas no disponibles |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision image-to-image) |
| Tipos de cuantizacion | FP16, W8A16, W8A8 (segun SoC) |
| Idiomas soportados | no aplica (modelo de imagen); no disponibles en metadatos |
| Licencia | APLUX Model Farm License (license_name: aplux-model-farm); licencia del modelo fuente sujeta a los terminos del modelo original |
| Formato de pesos | binarios `model.bin` por SoC y precision (paquetes QNN/AidLite); no se distribuyen safetensors ni GGUF |

## Arquitectura y entrenamiento

QuickSRNet es una red neuronal convolucional diseñada específicamente para superresolución en tiempo real en dispositivos móviles y de borde, con el objetivo de maximizar la calidad de reconstrucción bajo un presupuesto computacional muy ajustado. El modelo realiza un escalado 4× de la imagen de entrada y recupera detalle; la model card no detalla el número de capas, canales ni el esquema exacto de bloques.

No se dispone de información sobre el dataset de entrenamiento, el número de tokens o imágenes, ni sobre si se aplicaron técnicas de ajuste fino posteriores (RLHF, DPO u otras). La innovación práctica del artefacto publicado no está en el entrenamiento, sino en la conversión y empaquetado para Qualcomm: recursos por SoC con precisiones seleccionables (FP16, W8A16, W8A8), binarios contextuales listos para QNN y un runner con preprocesado y postprocesado incluidos en la plataforma Agora. El modelo se distribuye con `model.json` que indica la precisión por defecto y las rutas de variantes, además de `NOTICE.md` y `SHA256SUMS` para verificación de integridad.

## Capacidades

- Superresolución de imagen con factor de escalado 4×: amplía imágenes de baja resolución y reconstruye detalle.
- Procesamiento image-to-image: entrada una imagen, salida una imagen mejorada.
- Ejecución en hardware Qualcomm: soporte para QCS6490 y QCS8550 mediante QNN y APLUX AidLite.
- Inferencia cuantizada: variantes W8A16 y W8A8 además de FP16, según el SoC.
- Despliegue en el borde: latencias de 2,1 ms (QCS6490) y 1,7 ms (QCS8550) en precisión por defecto según las mediciones de Agora.
- No soporta tool calling, function calling, razonamiento multi-paso, agentes ni generación de texto: es un modelo puramente visual.
- Capacidades multilingües: no aplica.

## Casos de uso

- Mejora de imagen en cámaras de vigilancia: el modelo escala 4× fotogramas de baja resolución en tiempo real (1,7-2,1 ms por inferencia), lo que permite aumentar la resolución percibida sin cambiar el sensor ni el ancho de banda de transmisión.
- Visión embebida en AIoT: integración en placas con QCS6490 o QCS8550 para preprocesar imágenes antes de un pipeline de detección o segmentación, mejorando la entrada de los modelos posteriores con un coste mínimo.
- Restauración de imágenes en dispositivos móviles: aplicación de superresolución 4× en el propio dispositivo mediante las variantes W8A8, evitando el envío de imágenes a la nube y reduciendo latencia y consumo.
- Reconstrucción de detalle en imágenes comprimidas: uso como paso de postprocesado tras la decodificación de vídeo o imagen con compresión agresiva, recuperando detalle perdido antes de mostrarla o analizarla.
- Drones y robótica: mejora de la señal de cámaras de bajo coste en plataformas con restricciones de peso y energía, aprovechando la ejecución sobre SoC Qualcomm de bajo consumo.
- Prototipado y evaluación sin hardware: uso de la demo online de Agora (mega.aidlux.com/models/quicksrnet-medium) para validar la calidad de la superresolución antes de desplegar en placa física.
- Pipelines de inspección visual: aumento de resolución de imágenes de sensores industriales de baja resolución antes de un análisis de defectos, con latencia de milisegundos compatible con líneas de producción.

## Benchmarks y rendimiento

La model card publica únicamente mediciones de latencia en placas reales realizadas en la plataforma Agora, en precisión por defecto:

| SoC · placa | Precisiones | Latencia medida (Agora, precision por defecto) |
|---|---|---|
| QCS6490 · Rhino Pi A1 | W8A16, W8A8 | 2,1 ms |
| QCS8550 · Rhino Pi X1 | FP16, W8A16, W8A8 | 1,7 ms |

No se han publicado resultados de benchmarks de calidad de imagen (PSNR, SSIM, LPIPS) ni comparativas con otros modelos de superresolución en la información disponible.

## Requisitos de hardware

- VRAM: no aplica en el sentido de GPU de escritorio; el modelo se ejecuta en el acelerador NPU/DSP de los SoC Qualcomm soportados.
- SoC soportados: QCS6490 (placa Rhino Pi A1) y QCS8550 (placa Rhino Pi X1), con variantes FP16, W8A16 y W8A8 según el SoC.
- GPU de escritorio: no se documenta soporte para A100, H100 ni RTX 4090; el artefacto publicado está orientado a QNN/AidLite en hardware Qualcomm.
- Despliegue: SDK APLUX AidLite o motores de inferencia para chips Qualcomm con binarios `.bin`; los recursos se descargan por SoC con `hf download` filtrando `targets/$AGORA_SOC/*`.
- Latencia: 2,1 ms en QCS6490 y 1,7 ms en QCS8550 (precisión por defecto, medición de Agora). Throughput no publicado.
- Almacenamiento: el repositorio ocupa 0,0 GB; conviene verificar el tamaño real de los binarios por SoC tras la descarga.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones comparables (parámetros, contexto, calidad de imagen) de este modelo frente a alternativas como ESPCN, FSRCNN, Real-ESRGAN o SwinIR en la información proporcionada. La comparación cuantitativa no está disponible.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| QuickSRNetMedium (APLUX-Agora) | no disponible | no aplica | APLUX Model Farm License | Hugging Face (recursos por SoC) |
| Alternativas de superresolucion | no disponible | no aplica | no disponible | no disponible |

## Limitaciones y advertencias

- Licencia no estándar: APLUX Model Farm License, con términos recogidos en `LICENSE_MODEL_FARM.pdf`; es imprescindible revisarla antes de cualquier uso comercial. La licencia del modelo fuente queda sujeta a los términos del modelo original.
- El repositorio no incluye pesos en formatos convencionales (safetensors, GGUF); solo recursos convertidos para SoC Qualcomm, lo que limita su uso fuera de ese hardware.
- No hay información pública sobre sesgos, calidad de reconstrucción, artefactos de superresolución (halos, sobrealisado) ni comportamiento en dominios distintos al de entrenamiento.
- Riesgo de alucinación visual: como todo modelo generativo de superresolución, puede inventar detalle inexistente en la imagen de entrada, lo que es crítico en aplicaciones forenses, médicas o de inspección.
- El repositorio figura con 0 descargas y 0 likes y un tamaño de 0,0 GB en el momento de la consulta; verificar la integridad con `SHA256SUMS` y `NOTICE.md` antes de desplegar.
- Idiomas y contexto no aplican; no debe evaluarse como modelo de lenguaje.
- No se documentan requisitos de memoria, versiones mínimas del SDK AidLite ni compatibilidad con otros SoC Qualcomm distintos de QCS6490 y QCS8550.

## Enlaces

- Hugging Face (APLUX-Agora): https://huggingface.co/APLUX-Agora/QuickSRNetMedium
- Hugging Face (aplux): https://huggingface.co/aplux/QuickSRNetMedium
- Demo online en Agora: https://mega.aidlux.com/models/quicksrnet-medium
- Plataforma Agora: https://mega.aidlux.com
- Ficha en Model Farm: https://aiot.aidlux.com/models/detail/97?precisionShow=6
- Licencia del modelo: https://huggingface.co/APLUX-Agora/QuickSRNetMedium/blob/main/LICENSE_MODEL_FARM.pdf
