# nlateralus/pool-segmentation

## Resumen

pool-segmentation es un modelo de segmentación semántica de imagen desarrollado por el usuario de Hugging Face nlateralus (con código asociado en la organización Neptune-Trojans). Su tarea es concreta y acotada: identificar el agua de una piscina en fotogramas de vídeo, asignando a cada píxel una de dos clases (0 para "otro", 1 para "agua"). Nadadores dentro del agua, salpicaduras y corcheras se consideran parte de la clase agua. Está pensado como componente de un pipeline de análisis de vídeo de natación, por ejemplo para descartar personas fuera de la piscina o para localizar calles posteriormente.

Técnicamente es una U-Net pequeña con encoder ResNet-18, con 14.339.682 parámetros totales en formato safetensors y un tamaño de repositorio de aproximadamente 0,1 GB. El modelo procesa fotogramas reescalados a 1024×576 (lado largo, manteniendo proporción) y, según el autor, tarda unos 25 ms por fotograma en un MacBook. La licencia es MIT, lo que permite uso comercial sin restricciones adicionales.

Es relevante ahora por su carácter práctico y ligero: frente a modelos de segmentación generalistas de gran tamaño, esta propuesta ofrece una solución especializada, rápida y desplegable en hardware modesto para un dominio muy concreto. No obstante, su entrenamiento se limita a 89 fotogramas revisados manualmente de 9 vídeos, lo que acota su generalización a condiciones de cámara, iluminación y color del agua similares a las del conjunto de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | U-Net con encoder ResNet-18 |
| Parametros totales | 14.339.682 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, entrada de imagen) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | MIT |
| Formato de pesos | safetensors (PyTorch) |

## Arquitectura y entrenamiento

El modelo es una U-Net, una arquitectura encoder-decoder con conexiones de salto, empleando ResNet-18 como encoder. La salida es una segmentación semántica por píxel con dos clases: 0 (otro) y 1 (agua). La entrada se reescala a 1024×576 tomando el lado largo y manteniendo la proporción original del fotograma. El pipeline declarado en Hugging Face es image-segmentation y los pesos están en formato safetensors para PyTorch.

El entrenamiento se realizó sobre 89 fotogramas revisados manualmente procedentes de 9 vídeos, durante 40 épocas. La validación usó 19 fotogramas (uno de cada seis de cada vídeo), con un IoU medio para la clase agua de 0,996 y un peor caso de 0,990. No se documenta en la información disponible el uso de RLHF, DPO ni otras técnicas de alineación, ni el número total de tokens o píxeles procesados durante el entrenamiento. Los fotogramas de entrenamiento no se publican por contener personas reales. El paquete asociado incluye herramientas de etiquetado que permiten seleccionar fotogramas de vídeos propios, preetiquetarlos con este modelo y revisarlos en el navegador antes de reentrenar.

## Capacidades

- Segmentación semántica binaria por píxel: clase 0 (otro) y clase 1 (agua).
- Detección del contorno del agua: devuelve un polígono por cada fragmento de agua presente en el fotograma.
- Tratamiento de nadadores, salpicaduras y corcheras como parte de la clase agua.
- Procesamiento de fotogramas de vídeo con un coste aproximado de 25 ms por fotograma en un MacBook.
- Integración mediante paquete Python (`pip install pool-segmentation`) con API `PoolModel.load`, `predict` y `water`.
- Descarga automática del modelo desde Hugging Face con caché local en `~/.cache/huggingface` y actualización a versiones más recientes cuando hay conexión.
- Versionado por ejecución de entrenamiento (por ejemplo, `find_model("hub:20261119-231345")`).
- No dispone de tool calling, capacidades de agente, razonamiento multi-paso, visión general, audio ni modo thinking.

## Casos de uso

- Análisis de vídeo de natación: el modelo segmenta el agua en cada fotograma para aislar la zona de interés y descartar personas u objetos fuera de la piscina antes de etapas posteriores de análisis.
- Detección de calles: a partir de la máscara de agua y del contorno devuelto por `model.water(frame)`, se puede localizar la geometría de la piscina y, en fases posteriores, las calles de natación.
- Preetiquetado para reentrenamiento: usando las herramientas de etiquetado del paquete, se seleccionan fotogramas de vídeos propios, el modelo los etiqueta y un humano los revisa en el navegador, reduciendo el coste de anotación en nuevos escenarios.
- Filtrado previo en pipelines de visión: al ser rápido (unos 25 ms por fotograma) y ligero (0,1 GB), puede actuar como etapa de preprocesado que recorta la región de agua antes de ejecutar modelos más costosos.
- Métricas deportivas automatizadas: la máscara de agua permite calcular ocupación, posición relativa de nadadores respecto a la piscina o presencia de elementos en el vaso en herramientas de análisis de entrenamientos.
- Prototipado e investigación en segmentación especializada: con licencia MIT y un paquete pip, sirve como base reproducible para experimentos de segmentación binaria en dominios acuáticos.
- Despliegue en hardware modesto: su tamaño reducido permite ejecutarlo en portátiles (el autor cita un MacBook) para procesar vídeos localmente sin GPU dedicada.

## Benchmarks y rendimiento

Los únicos datos de rendimiento publicados en la información disponible son métricas de validación del propio autor, no comparaciones con otros modelos:

| Metrica | Valor |
|---|---|
| IoU medio clase agua (validación, 19 fotogramas) | 0,996 |
| IoU peor caso clase agua (validación) | 0,990 |
| Latencia por fotograma (MacBook) | ~25 ms |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que no aplican a un modelo de segmentación.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 14,3 millones de parámetros y pesos en safetensors, la huella es reducida y compatible con GPUs de gama baja o incluso CPU.
- GPU recomendadas: no se especifican; el autor reporta ejecución en un MacBook, lo que sugiere viabilidad en CPU y en GPUs consumer.
- ¿Cabe en GPU consumer? Sí, por tamaño (repositorio de 0,1 GB) es compatible con GPUs consumer convencionales; no se detallan modelos concretos.
- Opciones de despliegue: paquete Python `pool-segmentation` sobre PyTorch; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput estimados: aproximadamente 25 ms por fotograma en un MacBook según el autor; no se publican cifras de throughput en GPU.

## Comparativa con modelos similares

No se dispone en la información proporcionada de comparaciones con otros modelos de segmentación de piscinas o de segmentación binaria especializada. Como referencia de categoría, se indican alternativas genéricas de segmentación, sin datos de rendimiento comparables publicados para este modelo:

| Modelo | Parametros | Contexto/entrada | Licencia | Disponibilidad |
|---|---|---|---|---|
| pool-segmentation (este modelo) | 14,3 M | imagen 1024×576 (lado largo) | MIT | Hugging Face + pip |
| Segment Anything (SAM) | no disponible en esta ficha | imagen | no disponible en esta ficha | no disponible en esta ficha |
| U-Net estándar (ResNet-18) | ~14 M (referencia de arquitectura) | imagen | según implementación | múltiples repositorios |

No disponible: datos de rendimiento comparativo entre estos modelos en la tarea de segmentación de agua de piscina.

## Limitaciones y advertencias

- Entrenado con solo 89 fotogramas de 9 vídeos, filmados desde el borde de la piscina; la generalización a otros ángulos de cámara, iluminación o color del agua puede degradarse.
- El propio autor advierte de que piscinas visualmente muy distintas pueden requerir fotogramas propios y reentrenamiento con las herramientas de etiquetado del paquete.
- Sesgos conocidos: no documentados explícitamente; el conjunto de entrenamiento es reducido y específico, por lo que puede heredar sesgos de esas condiciones de captura.
- Riesgo de alucinación: en segmentación se traduce en falsos positivos o negativos de agua; el peor IoU de validación reportado es 0,990, pero sobre datos fuera de distribución no hay garantías.
- Limitaciones de idioma: no aplica (modelo de visión); no se documentan capacidades multilingües.
- Restricciones de licencia: licencia MIT, que permite uso comercial y modificación con atribución; no se indican restricciones adicionales.
- Los fotogramas de entrenamiento no se publican por mostrar personas reales, lo que limita la reproducibilidad exacta del entrenamiento.
- No dispone de cuantizaciones documentadas ni de integraciones con servidores de inferencia estándar; el despliegue recomendado es mediante el paquete Python del autor.
- El modelo solo distingue dos clases (otro/agua); no segmenta nadadores, calles ni otros elementos de forma independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nlateralus/pool-segmentation
- Repositorio de código, entrenamiento y herramientas de etiquetado: https://github.com/Neptune-Trojans/pool-segmentation
- Paquete pip: `pip install pool-segmentation`
