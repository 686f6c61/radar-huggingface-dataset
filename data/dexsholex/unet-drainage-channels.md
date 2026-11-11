# dexsholex/unet-drainage-channels

## Resumen

`unet-drainage-channels` es un modelo de segmentación semántica basado en U-Net con backbone ResNet-34, desarrollado por dexsholex (Oludayo Oyinloye) como modelo base para fAIr, la plataforma de mapeo asistido por IA del Humanitarian OpenStreetMap Team (HOT). El modelo detecta canales de drenaje abiertos (zanjas y acequias) en imágenes RGB de drones y devuelve sus líneas centrales como geometrías compatibles con OpenStreetMap (`waterway=drain`, `waterway=ditch`).

El problema que aborda es concreto: la cartografía de drenaje urbano en ciudades de renta baja es costosa y crítica para la gestión de inundaciones y saneamiento. El modelo permite a un equipo de mapeo partir de un borrador automático y ajustar (fine-tuning) sobre los drenajes cartografiados en su propia ciudad, reduciendo el trabajo manual de trazado.

Se entrenó con imágenes de dron de OpenAerialMap de Dar es Salaam (Tanzania) y etiquetas de OpenStreetMap, la mayoría con mediciones del levantamiento de campo de Ramani Huria. El repositorio ocupa 0,2 GB e incluye pesos en PyTorch y ONNX, junto con el cuaderno de entrenamiento y el script de evaluación. No es un modelo de lenguaje: es un segmentador de imágenes de resolución fija (256×256) orientado a un pipeline geoespacial específico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | U-Net con backbone ResNet-34 (codificador preentrenado en ImageNet), una sola salida logit |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; entrada fija de 256×256 píxeles (teselas de zoom 20) |
| Tipos de cuantizacion | no disponible (los pesos se distribuyen en fp32; no se documentan variantes cuantizadas) |
| Idiomas soportados | no aplica (modelo de visión; sin capacidades lingüísticas) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | PyTorch `state_dict` (`.pt`) y ONNX opset 18 (`.onnx`) |

## Arquitectura y entrenamiento

La red es una U-Net estándar con codificador ResNet-34. La entrada es un tensor `[batch, 3, 256, 256]` float32 con RGB dividido por 255; la normalización de ImageNet (media y desviación típica) se aplica dentro de la propia red. La salida es `[batch, 1, 256, 256]` de logits; la sigmoide da la probabilidad de que un píxel pertenezca a un drenaje abierto. El pipeline de fAIr aplica un umbral de 0,3, descarta fragmentos menores de 1 m², adelgaza la máscara a líneas centrales y devuelve GeoJSON con un campo `score`.

El entrenamiento se realizó sobre imágenes de dron de Dar es Salaam (vuelos de Ramani Huria de 2015, imágenes de 2016, 2020, 2023 y 2024 de varios proveedores) con etiquetas de OpenStreetMap (instantáneas de noviembre de 2026). Cada drenaje se dibuja con su etiqueta `width` y un margen de 1 m a cada lado que no cuenta en la pérdida. A partir de la tercera época, cada paso de entrenamiento desplaza la etiqueta de cada tesela hasta 1,78 m hacia donde menos discrepa con la predicción del propio modelo, lo que tolera drenajes cartografiados ligeramente desplazados respecto al canal real. En un piloto sobre Accra, este desplazamiento de etiquetas elevó el F1 de 0,313 a 0,385. El entrenamiento se hizo en una GPU T4 de Kaggle.

## Capacidades

- Segmentación semántica binaria de drenajes abiertos (zanjas y acequias) en imágenes RGB de dron.
- Extracción de líneas centrales a partir de la máscara de probabilidad, con umbral configurable (0,3 por defecto en fAIr).
- Salida compatible con el esquema de OpenStreetMap (`waterway=drain`, `waterway=ditch`) mediante GeoJSON con puntuación por línea.
- Funciona como modelo base para fine-tuning sobre drenajes de una ciudad concreta.
- Exportación a ONNX para despliegue en infraestructuras sin PyTorch.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües: es exclusivamente un modelo de visión geoespacial.

## Casos de uso

- Mapeo asistido de drenaje urbano en HOT/fAIr: el modelo genera un borrador de líneas de drenaje sobre ortofotos de dron que un cartógrafo valida y corrige en el editor de OpenStreetMap, acelerando el levantamiento inicial de una ciudad.
- Evaluación de riesgo de inundaciones: las líneas de drenaje extraídas alimentan modelos hidrológicos y análisis de capacidad de desagüe en barrios informales, donde la cartografía oficial suele ser inexistente.
- Planificación de saneamiento y WASH: organismos humanitarios pueden usar el borrador para localizar canales abiertos y priorizar intervenciones de limpieza o revestimiento.
- Fine-tuning local: un municipio o ONG puede reentrenar el modelo con los drenajes cartografiados en su propia ciudad, partiendo de unos pesos ya adaptados a imagery de dron de zoom 20.
- Control de calidad cartográfica: comparar las predicciones con los drenajes ya mapeados en OpenStreetMap para detectar zonas sin cartografiar o discrepancias de trazado.
- Procesamiento por lotes de ortofotos: al exportarse a ONNX, puede ejecutarse sobre grandes volúmenes de teselas en un pipeline de inferencia sin dependencia de PyTorch.
- Investigación en GeoAI: sirve como referencia reproducible (cuaderno, script de puntuación y datos documentados) para estudiar segmentación de líneas finas en imágenes de dron.

## Benchmarks y rendimiento

Las métricas comparan las líneas predichas con OpenStreetMap a zoom 20. La completitud es la proporción de longitud cartografiada con una línea predicha dentro de la tolerancia; la corrección es la proporción de longitud predicha con un drenaje cartografiado dentro de la tolerancia. Accra es una ciudad no vista en entrenamiento.

| Test | Tolerancia | Completitud | Correccion | F1 |
|---|---|---|---|---|
| Dar es Salaam, bloques reservados (2.344 teselas) | 2 m | 0,416 | 0,378 | 0,396 |
| Dar es Salaam, bloques reservados (2.344 teselas) | 4 m | 0,634 | 0,570 | 0,600 |
| Accra, ciudad no vista (1.565 teselas) | 2 m | 0,400 | 0,456 | 0,426 |
| Accra, ciudad no vista (1.565 teselas) | 4 m | 0,523 | 0,579 | 0,550 |

A 1 m de tolerancia, el F1 es 0,236 en Dar es Salaam y 0,253 en Accra. El autor advierte que estas cifras miden la concordancia con OpenStreetMap, cuyas líneas están desplazadas entre 1 y 3 m respecto al canal en la imagen, por lo que una línea correcta sobre el canal a menudo falla el test de 2 m. No hay conjunto de test trazado directamente sobre la imagen.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; por el tamaño de la red (U-Net ResNet-34 a 256×256) es del orden de pocos GB en fp32, holgadamente por debajo de 8 GB.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; el autor entrenó en una T4 de Kaggle.
- Cabe en GPU consumer: sí, en cualquier tarjeta con al menos unos pocos GB de VRAM (GTX 1650, RTX 3060, RTX 4090, etc.).
- Opciones de despliegue: PyTorch nativo (`.pt`), ONNX Runtime (`.onnx`, opset 18) y el pipeline de fAIr.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. Se trata de un modelo muy específico (segmentación de drenajes abiertos en imágenes de dron) para el que no se han identificado alternativas públicas equivalentes en la información disponible.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| unet-drainage-channels | no disponible | entrada 256×256 px | CC-BY-4.0 | Hugging Face |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El modelo encuentra aproximadamente el 40 % de la longitud de drenaje cartografiada dentro de 2 m; la cobertura es limitada.
- Falla en drenajes estrechos entre casas y en canales cubiertos por losas, que no son visibles desde el aire.
- Genera falsos positivos a lo largo de bordillos, medianas y muros.
- Entrenado en una sola ciudad (Dar es Salaam) y probado en otra (Accra), con gran variabilidad entre barrios: el F1 a 2 m oscila entre 0,14 y 0,61 según la imagen de dron.
- Solo funciona a zoom 20: a zoom 19 el F1 a 2 m en Accra cae de 0,426 a 0,257.
- Las líneas se trazan tesela a tesela, por lo que un drenaje largo se devuelve fragmentado en varios segmentos.
- Las métricas miden concordancia con OpenStreetMap, no precisión geométrica real sobre la imagen; no hay test trazado sobre la imagen.
- Toda línea debe tratarse como borrador a verificar contra la imagen.
- Licencia CC-BY-4.0 en los pesos: permite uso comercial con atribución; las etiquetas de OpenStreetMap subyacentes están bajo ODbL y las imágenes de test bajo CC BY-SA 4.0 o CC BY 4.0 según el proveedor, lo que impone condiciones adicionales si se redistribuyen datos derivados.
- No es un modelo de lenguaje: no ofrece generación de texto, razonamiento, código ni capacidades multilingües.

## Enlaces

- Hugging Face: https://huggingface.co/dexsholex/unet-drainage-channels
- README extendido del modelo en fAIr: https://github.com/Dexsholex/fAIr-models/blob/feat/drainage-channel-segmentation/models/unet_drainage_channels/README.md
- Repositorio fAIr-models (HOT): https://github.com/hotosm/fAIr-models
- OpenAerialMap: https://map.openaerialmap.org/
- Licencia ODbL de OpenStreetMap: https://opendatacommons.org/licenses/odbl/
- Cita: Oyinloye, O. (2026). unet-drainage-channels: open drainage channel mapping for fAIr.
