# lainermoura/ftl-deteccao-mudancas-unet

## Resumen

El modelo `ftl-deteccao-mudancas-unet` es un segmentador binario bitemporal especializado en la detección de nuevas construcciones a partir de dos imágenes de satélite de la misma zona capturadas en fechas distintas. Lo desarrolla lainermoura como proyecto final del programa Future Tech Leaders Brasil (Spate Tech Bootcamp 2026), vinculado al ODS 11 de ciudades sostenibles, y se publica bajo licencia MIT con pesos en formato PyTorch (`.pth`).

Técnicamente es una U-Net con encoder ResNet34 preentrenado en ImageNet, adaptada a 6 canales de entrada (tres canales RGB de la imagen "antes" y tres de la "después") y una única salida por píxel que representa la probabilidad de cambio. Se entrenó sobre la versión recortada a 256 × 256 del dataset LEVIR-CD, con 7.120 pares de entrenamiento, 1.024 de validación y 2.048 de test, usando pérdida combinada Dice + BCE.

Su relevancia es acotada pero concreta: ofrece un pipeline reproducible y ligero (repo de 0,3 GB) para monitorización de expansión urbana sobre imágenes satelitales, con tres variantes de pesos que permiten comparar el efecto del aumento de datos geométrico frente a perturbaciones fotométricas. No es un modelo de propósito general ni compite con los grandes modelos multimodales; es una herramienta de nicho para teledetección.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | U-Net con encoder ResNet34 (ImageNet), 6 canales de entrada, 1 canal de salida |
| Parámetros totales | no disponible (ResNet34 + decoder U-Net; el autor no publica el recuento) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada fija de 256 × 256 × 6) |
| Tipos de cuantización | no disponible (pesos `float32` en PyTorch; no se documentan variantes GGUF/ONNX) |
| Idiomas soportados | portugués (etiqueta de idioma del repo); el modelo en sí no procesa texto |
| Licencia | MIT |
| Formato de pesos | `.pth` (PyTorch state dict): `best.pth`, `best_robusto.pth`, `best_misto.pth` |

## Arquitectura y entrenamiento

La red es una U-Net estándar (Ronneberger et al., 2015) con encoder ResNet34 (He et al., 2016) inicializado con pesos de ImageNet. La primera convolución se modifica para aceptar 6 canales en lugar de 3, de modo que la red recibe la concatenación de las imágenes "antes" y "después" en un único tensor. La salida es un mapa de un solo canal al que se aplica sigmoide para obtener la probabilidad de cambio por píxel. El entrenamiento usó Adam con learning rate 1e-4, batch de 16, 25 épocas y una función de pérdida que suma Dice y BCE binaria.

Los datos provienen de LEVIR-CD en su versión recortada a 256 × 256 (Chen y Shi, 2020), un dataset de imágenes aéreas de EE. UU. con pares bitemporales anotados. Se publican tres variantes de pesos: `best.pth` entrenado con aumento geométrico, `best_robusto.pth` con variaciones de color y nitidez aplicadas a todos los ejemplos, y `best_misto.pth` con esas variaciones aplicadas a la mitad de los ejemplos. No se documenta uso de RLHF, DPO ni técnicas de decodificación especulativa; es un modelo puramente supervisado de segmentación.

## Capacidades

- Segmentación binaria de cambios: dado un par de imágenes RGB de 256 × 256 de la misma zona, devuelve una máscara por píxel con la probabilidad de nueva construcción.
- Detección de edificaciones nuevas entre dos fechas, no de cambios genéricos (vegetación, agua, etc.).
- Tres variantes de pesos con distinto compromiso frente a variaciones fotométricas y de nitidez entre fechas.
- Inferencia sobre imágenes mayores mediante el script `src/infer.py` del repositorio (por ventanas o parches).
- Combinación de los tres modelos por unión de probabilidades para reducir falsos negativos.
- No soporta tool calling, agentes, razonamiento multi-step ni generación de texto.
- No tiene capacidades multilingües en el sentido NLP; la etiqueta `pt` se refiere al idioma de la documentación.
- No incorpora visión general, audio ni modo "thinking".

## Casos de uso

- Monitorización de expansión urbana: procesar pares de ortofotos o imágenes satelitales de la misma zona en dos fechas para generar mapas de nuevas construcciones, útil para planificación municipal y seguimiento del ODS 11.
- Actualización de cartografía de edificios: detectar qué polígonos de un catastro han cambiado entre dos vuelos o capturas, priorizando la revisión manual de las regiones marcadas.
- Detección de construcción irregular: comparar imágenes antes/después de zonas protegidas o suelo rústico para señalar posibles edificaciones no declaradas, con revisión humana posterior.
- Análisis de series temporales de teledetección: integrar el modelo en pipelines que recorran pares consecutivos de un archivo de imágenes (por ejemplo, Esri World Imagery Wayback) y acumulen cambios.
- Investigación y docencia en teledetección: servir como baseline reproducible de change detection con U-Net + ResNet34 sobre LEVIR-CD, con métricas publicadas y tres variantes comparables.
- Prototipado rápido en entornos con pocos recursos: al ser un modelo pequeño (repo de 0,3 GB) y con inferencia en CPU viable, permite desplegar demos o validar ideas antes de invertir en modelos mayores.
- Evaluación de robustez fotométrica: usar `best_robusto.pth` o `best_misto.pth` en escenarios donde las fechas tienen distinta exposición, estación o sensor, comparando con `best.pth` para medir el impacto de los falsos alarmes.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre el conjunto de test de LEVIR-CD (256 × 256):

| Pesos | Entrenamiento | F1 (test LEVIR-CD) | IoU |
|---|---|---|---|
| `best.pth` | aumento geométrico | 0,8761 | 0,7794 |
| `best_robusto.pth` | variaciones de color y nitidez en todos los ejemplos | 0,8709 | 0,7714 |
| `best_misto.pth` | variaciones de color y nitidez en la mitad de los ejemplos | 0,8760 | 0,7794 |

Estudio de caso cualitativo en Niterói (aplicación sin ajuste fino sobre Esri World Imagery Wayback, con unión de los tres modelos y verificación visual):

| Área | Regiones marcadas | Construcciones nuevas | Falsos alarmes |
|---|---|---|---|
| B (2020 → 2026, buena calidad) | 12 | 10 | 2 |
| A (2014 → 2026, imagen de 2014 pixelada) | 16 | 6 | 10 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que no aplican a un modelo de segmentación.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; por el tamaño del encoder ResNet34 y la entrada 256 × 256, la inferencia cabe holgadamente en GPUs de consumo (estimación orientativa por debajo de 2 GB en FP32).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente; A100, H100 o RTX 4090 no aportan ventaja significativa para este tamaño de modelo.
- Cabe en GPU de consumo: sí, en tarjetas tipo GTX 1650, RTX 3050, RTX 4060 o superiores; también es viable en CPU para volúmenes moderados.
- Opciones de despliegue: PyTorch nativo con `segmentation_models_pytorch`; exportación a TorchScript u ONNX no documentada pero factible; no se publican pesos GGUF ni integración con Ollama, vLLM o TGI (no aplican a este tipo de modelo).
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Arquitectura | Entrada | Contexto | F1 en LEVIR-CD | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `ftl-deteccao-mudancas-unet` (este) | U-Net + ResNet34, 6 canales | 256 × 256 × 6 | no aplica | 0,8761 (test) | MIT | Hugging Face |
| STANet (Chen y Shi, 2020) | Red con atención espacio-temporal | variable | no aplica | no disponible en la información | según autores | paper + código de terceros |
| FC-EF / FC-Siam (Daudt et al., 2018) | Redes totalmente convolucionales siamesas | variable | no aplica | no disponible en la información | según autores | paper + código de terceros |
| ChangeFormer (baseline habitual en LEVIR-CD) | Transformer jerárquico | variable | no aplica | no disponible en la información | según autores | repos públicos |

La comparación cuantitativa con alternativas no puede completarse porque la información proporcionada solo incluye métricas de este modelo; los competidores se citan por relevancia en la literatura de change detection, sin cifras verificadas en esta ficha.

## Limitaciones y advertencias

- Entrenado exclusivamente con imágenes de EE. UU. (LEVIR-CD); el rendimiento en otras regiones depende fuertemente del par de imágenes, como muestra el caso de Niterói (10 falsos alarmes en 16 regiones marcadas en el área A).
- Alta sensibilidad a diferencias de nitidez, color y exposición entre las dos fechas, que generan falsos positivos; de ahí las variantes robusta y mixta.
- El modelo original ignora tejados grises; el robusto pierde parte de los de color de ladrillo; la unión de los tres reduce el problema pero no lo elimina.
- La evaluación en Niterói fue puramente visual sobre dos áreas pequeñas; la revocación no se midió de forma independiente.
- Entrada fija de 256 × 256 en el uso básico; para imágenes mayores hay que trocear en parches y recomponer, con posible pérdida de contexto en los bordes.
- No detecta cambios que no sean construcciones nuevas (deforestación, agua, cultivos, etc.).
- Licencia MIT para pesos y código, pero el dataset LEVIR-CD es de terceros y está sujeto a los términos de sus autores; las imágenes de Niterói pertenecen a Esri y no se distribuyen.
- Riesgo de alucinación en el sentido de falsos positivos por cambios de iluminación o estacionalidad, no por generación de contenido.
- Sin garantías de producción: es un proyecto de bootcamp, sin mantenimiento documentado ni suite de tests publicada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/lainermoura/ftl-deteccao-mudancas-unet
- Código, informe y página del proyecto: https://github.com/lainermoura/deteccao-mudancas-construcoes
- Dataset LEVIR-CD (referencia): Chen, H.; Shi, Z. (2020), *A Spatial-Temporal Attention-Based Method and a New Dataset for Remote Sensing Image Change Detection*, Remote Sensing 12(10), 1662.
- Paper U-Net: Ronneberger, O.; Fischer, P.; Brox, T. (2015), *U-Net: Convolutional Networks for Biomedical Image Segmentation*, MICCAI.
- Paper ResNet: He, K.; Zhang, X.; Ren, S.; Sun, J. (2016), *Deep Residual Learning for Image Recognition*, CVPR.
- Paper FC-Siam: Daudt, R. C.; Le Saux, B.; Boulch, A. (2018), *Fully Convolutional Siamese Networks for Change Detection*, ICIP.
- Esri World Imagery Wayback (fuente de las imágenes del estudio de caso): https://livingatlas.arcgis.com/wayback/
