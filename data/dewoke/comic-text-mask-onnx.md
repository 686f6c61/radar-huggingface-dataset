# DeWoke/comic-text-mask-onnx

## Resumen

comic-text-mask-onnx es la conversión a formato ONNX del modelo TareHimself/comic-text-mask, un segmentador binario de texto para viñetas de cómic, manga y webtoon. Lo publica el usuario DeWoke y su función es, dada una región recortada alrededor de un bloque de texto detectado, determinar píxel a píxel qué zonas corresponden a lettering. Se trata de una UNet con encoder ResNet-18 de 14,3 millones de parámetros, entrenada para segmentación de imagen y no para generación de texto.

La relevancia de esta versión concreta es práctica: al estar exportada a ONNX (opset 17), se ejecuta con ONNX Runtime sin necesidad de PyTorch, lo que simplifica su integración en pipelines de traducción y limpieza de cómics. Forma parte del flujo de Toon Studio (proyecto comic-translate) como modelo opcional de segmentación de texto para tareas de limpieza de bocadillos antes de la traducción o el reentintado.

El repositorio ocupa 0,1 GB y contiene únicamente el grafo ONNX, los metadatos y la licencia. No es un modelo de lenguaje: no genera texto ni mantiene conversaciones, sino que produce una máscara de probabilidad de texto con resolución fija de 384x384.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | UNet con encoder ResNet-18 |
| Parametros totales | 14,3 M |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, entrada fija 384x384) |
| Tipos de cuantizacion | no disponible (pesos exportados sin cuantizar; el repo solo incluye el grafo ONNX) |
| Idiomas soportados | en, ja, ko, zh (idiomas del material de entrenamiento; el modelo no procesa texto, opera sobre píxeles) |
| Licencia | MIT |
| Formato de pesos | ONNX (model.onnx, opset 17, 57.312.337 bytes) |

## Arquitectura y entrenamiento

El modelo es una UNet de segmentación binaria con encoder ResNet-18, pensada para trabajar sobre recortes de una sola región de texto. La entrada es un tensor `[1, 3, 384, 384]` en uint8 RGB, con el recorte ajustado por letterboxing en la esquina superior izquierda y rellenado con ceros. La salida es `[1, 1, 384, 384]` con la probabilidad de texto entre 0 y 1; la normalización y la sigmoide están incluidas en el grafo, de modo que el consumidor solo debe aplicar un umbral (0,5 según `tm_meta.json`) y recortar la zona del letterbox para reescalarla al recorte original.

Esta versión ONNX conserva los pesos del modelo original en la revisión `ebd37f1` sin modificaciones: se exportó desde el `model.pt` TorchScript con `torch.onnx.export` (opset 17, PyTorch 2.15) y se verificó contra el modelo TorchScript sobre una entrada aleatoria, con una diferencia máxima de 8e-6. No se detallan en la información disponible el volumen de tokens ni la composición exacta del dataset de entrenamiento; la model card remite a la del modelo original para esos datos y para las métricas (IoU de validación 0,906, precisión 0,949, recall 0,952).

## Capacidades

- Segmentación binaria de texto sobre recortes de viñetas: genera una máscara de probabilidad píxel a píxel que identifica el lettering.
- Funciona sobre material de cómic, manga y webtoon en inglés, japonés, coreano y chino, al haber sido entrenado con ese tipo de páginas.
- Entrada de resolución fija 384x384 con letterboxing, lo que permite procesar recortes de proporciones arbitrarias sin deformarlos.
- Ejecución sin PyTorch mediante ONNX Runtime, con paridad numérica verificada frente al modelo TorchScript.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto: es exclusivamente un modelo de segmentación de imagen.
- No dispone de modo thinking, visión general, audio ni capacidades multimodales más allá de la imagen de entrada.

## Casos de uso

- Limpieza de bocadillos en pipelines de traducción de cómics: el modelo recibe el recorte de cada región de texto detectada y devuelve la máscara de lettering, que se usa para borrar o reentintar el texto original antes de colocar la traducción. Es el uso previsto por Toon Studio.
- Integración en herramientas de scanlation automatizada: al ejecutarse con ONNX Runtime, puede incrustarse en un servicio sin dependencias de PyTorch, reduciendo el tamaño del contenedor y el tiempo de arranque.
- Preprocesado para OCR de cómic: la máscara permite aislar el lettering del fondo y mejorar la tasa de acierto de un OCR posterior sobre páginas con tramas o fondos ruidosos.
- Inpainting de texto: la máscara generada sirve como guía para rellenar la zona del texto con el fondo reconstruido, un paso habitual en la localización de manga y webtoon.
- Procesamiento por lotes en servidor: al tener una entrada fija de 384x384 y solo 14,3 M de parámetros, es viable ejecutarlo sobre muchos recortes por página en CPU o GPU modesta dentro de un pipeline de publicación.
- Filtrado de falsos positivos en detección de texto: aplicar la máscara a candidatos dudosos permite descartar regiones que el detector marcó como texto pero que no contienen lettering real.
- Creación de datasets de segmentación: usar las máscaras para anotar automáticamente páginas y entrenar o afinar otros modelos de segmentación de texto.

## Benchmarks y rendimiento

La información disponible solo incluye las métricas de validación del modelo original, no comparaciones con otros modelos:

| Metrica | Valor |
|---|---|
| IoU de validación | 0,906 |
| Precisión | 0,949 |
| Recall | 0,952 |
| Diferencia máxima frente a TorchScript (entrada aleatoria) | 8e-6 |

No se han publicado resultados de benchmarks comparativos (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que no es un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con 14,3 M de parámetros y entrada fija de 384x384, el modelo cabe holgadamente en cualquier GPU con 1-2 GB de VRAM, e incluso puede ejecutarse en CPU.
- GPU recomendadas: no requiere GPU dedicada; funciona en CPU con ONNX Runtime. Para lotes grandes, cualquier GPU consumer reciente (por ejemplo, RTX 3060 o superior) es más que suficiente.
- Cabe en GPU consumer: sí, en cualquier GPU consumer moderna e incluso en equipos sin GPU.
- Opciones de despliegue: ONNX Runtime (CPU o GPU), con integración en Python, C++, C# o JavaScript según el runtime elegido. No aplica vLLM, llama.cpp, Ollama ni TGI, que están orientados a modelos de lenguaje.
- Latencia y throughput estimados: no disponible en la información proporcionada; al ser un modelo pequeño con entrada fija, se espera un coste por recorte bajo, pero no se han publicado cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| DeWoke/comic-text-mask-onnx | 14,3 M | 384x384 fija | ONNX | MIT | Esta ficha; ejecutable sin PyTorch |
| TareHimself/comic-text-mask | 14,3 M | 384x384 fija | TorchScript (model.pt) | MIT | Modelo original del que deriva esta conversión |
| Otros segmentadores de texto en cómic | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la información proporcionada |

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona y no responde a prompts; cualquier uso en ese sentido es un error de aplicación.
- La entrada está fijada a 384x384 con letterboxing; el consumidor debe recortar la zona rellenada de la salida y reescalarla al recorte original para obtener una máscara alineada.
- El umbral de binarización es 0,5 según los metadatos; umbrales distintos pueden ser necesarios según el tipo de página, pero no se documentan alternativas.
- El entrenamiento se orienta a material de cómic, manga y webtoon en inglés, japonés, coreano y chino; el rendimiento en otros idiomas o en páginas con tipografías atípicas no está documentado.
- Riesgo de falsos positivos y negativos en regiones con tramas, texturas o líneas de dibujo que se parezcan al lettering; las métricas de validación (IoU 0,906) no garantizan el mismo rendimiento en dominios distintos.
- La licencia MIT permite uso comercial, pero se recomienda conservar el aviso de copyright y verificar la licencia del modelo original, que es la misma.
- El repositorio no incluye datos de entrenamiento ni scripts de conversión; la reproducibilidad de la exportación depende de la información de la model card original.
- Al ser una conversión de pesos sin cuantizar, no se ofrecen variantes INT8 ni FP16 en el repositorio; quien necesite menor latencia deberá cuantizar por su cuenta y validar la paridad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DeWoke/comic-text-mask-onnx
- Modelo original: https://huggingface.co/TareHimself/comic-text-mask
- ONNX Runtime: https://onnxruntime.ai/
- Toon Studio (comic-translate): https://github.com/banchon999/comic-translate
