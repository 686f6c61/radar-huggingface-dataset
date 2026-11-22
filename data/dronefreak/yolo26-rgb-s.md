# dronefreak/yolo26-rgb-s

## Resumen

yolo26-rgb-s es un modelo de restauración de imágenes especializado en eliminación de lluvia (single-image deraining) desarrollado por el usuario dronefreak. No es un modelo generativo de propósito general, sino una red de regresión densa que toma una imagen RGB con lluvia y devuelve una versión limpia de la misma resolución. Técnicamente reutiliza la arquitectura YOLO26 en su escala `s` y sustituye la cabeza de estimación de profundidad por una cabeza RGB de tres canales, manteniendo el backbone CSPDarknet y el cuello PAN-FPN originales.

El modelo tiene 12.154.531 parámetros y un peso de repositorio de aproximadamente 0,2 GB, lo que lo sitúa en el rango de los modelos ligeros aptos para inferencia en tiempo real. Se entrenó con una receta de dominio mixto que combina conjuntos sintéticos (Rain13K, DDN-Data/Rain1400) y reales (SPA-Data, RealRain-1k-H/L), con sobremuestreo 2x de las fuentes reales para compensar el desbalance.

Su relevancia actual radica en que propone una hipótesis arquitectónica concreta: que el sesgo inductivo del decodificador de YOLO26, ajustado para detección en tiempo real y luego adaptado a profundidad, puede transferirse a la restauración de imágenes con resultados competitivos frente a la familia ResNet-UNet de ClearView. El modelo se publica bajo licencia AGPL-3.0 y está pensado para integrarse en pipelines de visión por computador donde la latencia importa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO26s (CSPDarknet + PAN-FPN) con cabeza RGB personalizada (RGBHead) que sustituye la cabeza de profundidad |
| Parametros totales | 12.154.531 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de imagen, no de texto) |
| Tipos de cuantizacion | no disponible (se mencionan exportaciones a TensorRT y ONNX, sin detallar precisiones) |
| Idiomas soportados | en (etiqueta declarada; el modelo no procesa texto) |
| Licencia | AGPL-3.0 |
| Formato de pesos | safetensors y PyTorch (.pt); exportación a ONNX y TensorRT mencionada |
| Tarea | image-to-image (deraining) |
| Resolución de salida | resolución completa de entrada (cabeza a resolución completa) |
| Métricas evaluadas | PSNR, SSIM, MAE, MSE, Rain Removal Rate, NIQE |
| Descargas | 12 |
| Likes | 0 |
| Creado | 2026-08-30 |
| Actualizado | 2026-11-21 |

## Arquitectura y entrenamiento

El modelo parte de YOLO26 en escala `s`. El backbone CSPDarknet y el cuello PAN-FPN se mantienen sin modificar; lo que cambia es la cabeza. La cabeza de estimación de profundidad de un solo canal se reemplaza por `RGBHead`, una cabeza de restauración de tres canales que produce salida a resolución completa de entrada. Esta cabeza incorpora dos conexiones de salto desde las capas del backbone con stride 2 y 4 hacia la cola del decodificador, un residual global (el modelo predice una corrección que se suma a la entrada, al estilo NAFNet/Restormer) y LayerNorm en los bloques convolucionales propios de la cabeza, mientras el backbone y el cuello siguen usando BatchNorm (que se pliega en la convolución al exportar a TensorRT, preservando la compatibilidad con el zoo preentrenado de Ultralytics).

El entrenamiento sigue la receta de dominio mixto de ClearView con configuración `rain_mixed_synthetic_real.yaml`. Se combinan cinco fuentes: Rain13K (13.711 pares sintéticos, peso 1.0), DDN-Data/Rain1400 (12.600 pares sintéticos, peso 1.0), SPA-Data (6.385 pares reales, peso 2.0), RealRain-1k-H (784 pares reales, peso 2.0) y RealRain-1k-L (784 pares reales, peso 2.0). El resultado es aproximadamente un 62% sintético y un 38% real por peso efectivo de muestreo, frente a un 77%/23% por recuento bruto de pares. La selección de checkpoint se realiza sobre un conjunto de validación mezclado independiente: SPA-Data val limitado a 150 de 1.000 pares, validación de RealRain-1k-H/L (112 pares cada uno) y Rain100L (100 pares) como ancla sintética de sanidad. No se documenta en la información disponible el uso de RLHF, DPO ni técnicas de alineación, algo esperable en un modelo de regresión de imagen.

## Capacidades

- Eliminación de lluvia en imágenes RGB individuales, con salida a la misma resolución que la entrada.
- Restauración en dominio mixto: entrenado conjuntamente con datos sintéticos y reales, con sobremuestreo de los reales.
- Inferencia en tiempo real: el autor reporta 92,2 qps para esta escala, lo que la convierte en la opción por defecto del par publicado.
- Predicción de residual: la salida es una corrección que se suma a la entrada, no una imagen acotada a [0, 1]; requiere `clamp(0, 1)` antes de guardar.
- Exportación a TensorRT y ONNX para despliegue optimizado.
- Integración con PyTorch mediante la clase `YOLO26RGB` y el método `from_pretrained`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni procesamiento de texto, audio o vídeo.
- Capacidad multilingüe: no aplica; el modelo no procesa lenguaje.

## Casos de uso

- Vigilancia con cámaras IP en exterior: el modelo puede limpiar fotogramas con lluvia antes de pasarlos a un detector de objetos, mejorando la tasa de detección en condiciones meteorológicas adversas. Sus 92,2 qps permiten procesar vídeo a tasas compatibles con tiempo real en GPU de gama media.
- Preprocesado en pipelines de conducción autónoma: la restauración de la imagen previa a la etapa de percepción reduce falsos negativos en la detección de peatones y señales bajo lluvia, y el residual global preserva el contenido original evitando artefactos agresivos.
- Drones de inspección de infraestructuras: al ser un modelo de 12,13M de parámetros, cabe en plataformas embarcadas con aceleración TensorRT, y la limpieza de imágenes aéreas facilita la inspección visual de tendidos eléctricos o estructuras metálicas.
- Fotografía computacional y postprocesado: limpieza de fotografías tomadas bajo lluvia para consumo final, con la ventaja de que la salida a resolución completa evita el reescalado y la pérdida de detalle fino.
- Aumento de datos y preprocesado para anotación: limpiar lotes de imágenes de un dataset antes de la anotación humana reduce el ruido visual y acelera el etiquetado en proyectos de visión.
- Monitorización de tráfico urbano: las cámaras de tráfico sufren degradación por lluvia; el modelo puede normalizar la señal antes de los módulos de conteo de vehículos o lectura de matrículas, con despliegue en ONNX Runtime sobre hardware modesto.
- Investigación en restauración de imágenes: sirve como baseline reproducible para estudiar la transferencia del sesgo inductivo de detectores en tiempo real a tareas de regresión densa, dado que el protocolo de evaluación de 10 conjuntos es directamente comparable con el zoo de ClearView.

## Benchmarks y rendimiento

Resultados publicados en la model card, calculados sobre el split de test/evaluación propio de cada fuente (no sobre el conjunto de validación mezclado usado para seleccionar checkpoint):

| Test set | Dominio | PSNR | SSIM | MAE | MSE | Rain removal rate | NIQE |
|---|---|---|---|---|---|---|---|
| SPA-Data_val | Real | 38,66 | 0,966 | 0,0065 | 0,00036 | 0,323 | 8,93 |
| Rain100L | Sintético | 30,41 | 0,893 | 0,0185 | 0,00118 | 0,171 | 19,60 |
| Rain100H | Sintético | 23,10 | 0,566 | 0,0540 | 0,00553 | 0,423 | 54,59 |
| Test100 | Sintético | 26,03 | 0,775 | 0,0443 | 0,00397 | 0,322 | 17,31 |
| Test1200 | Sintético | 29,01 | 0,814 | 0,0314 | 0,00220 | 0,293 | 13,21 |
| Test2800 | Sintético | 29,97 | 0,861 | 0,0240 | 0,00112 | 0,290 | 761,51 |
| DDN-Data | Sintético | 30,24 | 0,866 | 0,0234 | 0,00107 | 0,280 | 1223,47 |
| RealRain-1k-H | Real | 34,19 | 0,911 | 0,0139 | 0,00074 | 0,535 | 9,37 |
| RealRain-1k-L | Real | 36,92 | 0,950 | 0,0098 | 0,00041 | 0,498 | 7,77 |
| AllWeather (lluvia+niebla) | Cross-domain (estrés) | 13,54 | 0,566 | 0,1918 | 0,05658 | 0,067 | 273,51 |
| Media (10 conjuntos) | | 29,21 | 0,8167 | | | | |
| Media (9 conjuntos solo lluvia) | | 30,95 | | | | | |

El autor indica que estos números son comparables directamente con el zoo de modelos de ClearView, pero la información proporcionada no incluye la tabla de comparación detallada con esos modelos ni con alternativas de la literatura. Los valores de NIQE anómalamente altos en Test2800 y DDN-Data (761,51 y 1223,47) sugieren una discrepancia de escala o de cálculo en esa métrica para esos conjuntos, que conviene verificar antes de usarla como criterio de selección.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Con 12,13M de parámetros en FP32, los pesos ocupan aproximadamente 48,6 MB; en FP16, unos 24,3 MB. El consumo real depende de la resolución de entrada y de las activaciones a resolución completa, que son el factor dominante.
- GPU recomendadas: no especificadas en la información disponible. Por tamaño, cualquier GPU con al menos 4-6 GB de VRAM debería poder ejecutar el modelo a resoluciones habituales, aunque no hay cifras publicadas.
- GPU de consumo: sí, previsiblemente cabe en tarjetas de gama media y alta (RTX 3060, RTX 4060, RTX 4090) y en aceleradores embebidos, dado el reducido número de parámetros.
- Opciones de despliegue: PyTorch nativo mediante `yolo26_rgb.YOLO26RGB`, exportación a ONNX y a TensorRT (el autor menciona que BatchNorm se pliega en la convolución al exportar a TensorRT). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo de imagen.
- Latencia y throughput: el autor reporta 92,2 qps para esta escala, sin especificar el hardware de medida ni la resolución, por lo que la cifra debe tomarse como orientativa.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entrada | PSNR medio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| yolo26-rgb-s | 12,13M | Imagen RGB, resolución completa | 30,95 (9 sets solo lluvia) | AGPL-3.0 | Hugging Face |
| yolo26-rgb-n | no disponible en esta ficha | Imagen RGB, resolución completa | no disponible | AGPL-3.0 | Hugging Face (misma familia) |
| Familia ResNet-UNet de ClearView | no disponible | Imagen RGB | no disponible en la información proporcionada | no disponible | Repositorio ClearView |
| NAFNet / Restormer | no disponible | Imagen RGB | no disponible en la información proporcionada | no disponible | Referencias citadas en la model card |

La información proporcionada no incluye cifras de los modelos de comparación, solo la afirmación de que el protocolo de evaluación es directamente comparable con el zoo de ClearView. La alternativa más directa dentro de la misma familia es `yolo26-rgb-n`, de menor huella, que el autor recomienda cuando se requiere un tamaño inferior a los 12,13M de parámetros de esta escala.

## Limitaciones y advertencias

- Rendimiento muy degradado en dominio cruzado: en AllWeather (lluvia y niebla) el PSNR cae a 13,54 y el SSIM a 0,566, con una tasa de eliminación de lluvia de solo 0,067. No es un modelo de restauración general.
- Dificultad con lluvia intensa sintética: en Rain100H el PSNR es 23,10 y el SSIM 0,566, muy por debajo de los resultados en lluvia ligera o real.
- La salida no está acotada a [0, 1]; es un residual que debe sumarse a la entrada y recortarse con `clamp(0, 1)` antes de guardar, tal como advierte el autor.
- Licencia AGPL-3.0: impone obligaciones de copyleft fuerte. El uso comercial en servicios en red requiere liberar el código fuente correspondiente, lo que puede ser incompatible con productos propietarios.
- Idiomas: la etiqueta declara únicamente `en`, aunque el modelo no procesa texto; esta etiqueta no tiene efecto práctico sobre la tarea.
- Riesgo de alucinación: en un modelo de regresión de imagen se traduce en artefactos, texturas inventadas o eliminación de detalles finos que no son lluvia (por ejemplo, líneas verticales o texturas repetitivas).
- Sesgos: no documentados en la información disponible; al entrenarse con datasets de lluvia mayoritariamente sintéticos y de escenas concretas, puede generalizar peor a condiciones de iluminación o sensores no representados.
- Métricas NIQE anómalas en Test2800 y DDN-Data, que aconsejan no usar ese indicador de forma aislada.
- Modelo con muy poca adopción (12 descargas, 0 likes) y sin validación independiente por parte de la comunidad; conviene tratarlo como experimental.
- No dispone de soporte para texto, audio, tool calling ni agentes; cualquier uso en esos ámbitos queda fuera de su diseño.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dronefreak/yolo26-rgb-s
- Repositorio del modelo: https://github.com/dronefreak/yolo26-rgb
- Sección de arquitectura del repositorio: https://github.com/dronefreak/yolo26-rgb#architecture
- Quickstart del repositorio: https://github.com/dronefreak/yolo26-rgb#quickstart
- Proyecto ClearView: https://github.com/dronefreak/clearview
- Receta de mezcla de entrenamiento: https://github.com/dronefreak/clearview/blob/main/configs/mix/rain_mixed_synthetic_real.yaml
- Receta de validación mezclada: https://github.com/dronefreak/clearview/blob/main/configs/mix/rain_mixed_val.yaml
- Dataset SPA-Data: https://huggingface.co/datasets/dronefreak/SPA-Data
- Dataset RealRain-1k: https://huggingface.co/datasets/dronefreak/RealRain-1k
- Dataset Rain13K: https://huggingface.co/datasets/dronefreak/Rain13K
- Dataset DDN-Data: https://huggingface.co/datasets/dronefreak/DDN-Data
- Paper Rain13K / referencia [1]: https://arxiv.org/abs/2206.05514
- Paper Rain100 / referencia [2]: https://arxiv.org/abs/2111.09881
- Paper U-Net / referencia [3]: https://arxiv.org/abs/1505.04597
- Paper Restormer / referencia [4]: https://arxiv.org/abs/2204.04676
- Paper ResNet / referencia [5]: https://arxiv.org/abs/1512.03385
- Referencia [6] (RealRain-1k): https://arxiv.org/abs/2606.03748
- Referencia [7] (AllWeather): no disponible en la información proporcionada
