# elnemer7/ElNeMeR-ScreenCapture-Recapture-Moire-ONNX

## Resumen

ElNeMeR ScreenCapture-Recapture-Moire-ONNX es un clasificador binario/multiclase empaquetado en formato ONNX, desarrollado por el ingeniero Mahmoud ElNemer (ElNeMeR Digital Solutions & AI) y publicado bajo licencia MIT. Su función es detectar ataques de evasión por retransmisión de pantalla o recaptura fotográfica: casos en los que una imagen o vídeo sintético (deepfake) se muestra en un monitor LCD/OLED o se imprime en papel y después se fotografía con un smartphone real para heredar metadatos EXIF y ruido de sensor auténticos. El modelo analiza un vector de 20 características (`moire_features`) derivadas de picos armónicos de Moiré, periodicidad de la rejilla de subpíxeles RGB y reflejos especulares del bisel.

No se trata de un modelo generativo ni de un transformer de lenguaje: es un cabezal de clasificación ligero que opera sobre características precalculadas, con un tensor de entrada `float32` de forma `[batch_size, 20]` y tres clases de salida (`authentic_direct_camera`, `lcd_oled_screen_recapture`, `printed_photo_rebroadcast`). Su relevancia radica en el nicho forense y de anti-spoofing: cubre una laguna habitual en los detectores de deepfakes, que suelen fallar cuando el atacante interpone una cámara física entre la imagen sintética y el verificador.

El repositorio tiene un tamaño declarado de 0.0 GB, sin descargas ni likes en el momento de la consulta, y la model card no documenta arquitectura interna, datos de entrenamiento ni métricas de validación más allá de una precisión de calibración declarada del 100,00 %. La información disponible es, por tanto, muy limitada y esta ficha lo refleja explícitamente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (clasificador sobre vector de 20 caracteristicas; capas internas no documentadas) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entrada de 20 caracteristicas, sin secuencia de texto) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en ONNX; se desconoce si hay variantes cuantizadas) |
| Idiomas soportados | no disponible (modelo no linguistico) |
| Licencia | MIT |
| Formato de pesos | ONNX (Opset 14) |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna de la red. Lo único verificable es la interfaz de inferencia: un tensor de entrada `moire_features` de tipo `float32` con forma `[batch_size, 20]`, procesado por un grafo ONNX de Opset 14 compatible con `onnxruntime` y `onnxruntime-web` (WASM). La salida se expone como `probabilities` sobre tres clases. No se especifica si se trata de un MLP, una regresión logística, un gradient boosting convertido a ONNX u otra familia de modelo.

Las 20 características de entrada se corresponden, según el autor, con señales de picos armónicos de Moiré, periodicidad de la rejilla de subpíxeles RGB y reflejos especulares del bisel. No se documentan el número de muestras de entrenamiento, la composición del dataset, el proceso de aumento de datos ni si hubo calibración post-entrenamiento. El autor declara una "Calibration Accuracy" del 100,00 %, pero no se especifica el conjunto de evaluación, el tamaño de la muestra ni el protocolo, por lo que esa cifra no debe interpretarse como rendimiento generalizable.

## Capacidades

- Clasificación de imágenes o fotogramas en tres categorías: captura directa auténtica, recaptura de pantalla LCD/OLED y recaptura de foto impresa.
- Detección de ataques de evasión por rebroadcast, en los que se interpone una pantalla o una impresión para falsear EXIF y ruido de sensor.
- Análisis de señales forenses de bajo nivel: picos armónicos de Moiré, periodicidad de subpíxeles RGB y reflejos especulares.
- Inferencia en navegador mediante `onnxruntime-web` (WASM), además de en servidor con `onnxruntime`.
- Procesamiento por lotes (`batch_size` configurable) al operar sobre vectores de características.
- No soporta tool calling, agentes, razonamiento multi-paso ni generación de texto.
- No tiene capacidades multilingües ni de visión de extremo a extremo: requiere un extractor de características externo que produzca el vector de 20 dimensiones.

## Casos de uso

- Verificación de identidad remota (KYC): antes de aceptar una foto de documento o un selfie, el pipeline extrae las 20 características de Moiré y consulta el modelo para descartar que la imagen sea una fotografía de una pantalla. Es adecuado porque detecta específicamente la recaptura LCD/OLED que burla las comprobaciones de EXIF.
- Moderación de contenido en plataformas: clasificación de imágenes subidas por usuarios para marcar posibles recapturas de pantalla de material sintético generado con anterioridad, reduciendo la carga de revisión manual.
- Peritaje forense digital: apoyo a analistas que necesitan distinguir una fotografía original de una foto de pantalla o de una impresión reescaneada dentro de una cadena de custodia.
- Anti-spoofing en sistemas de control de acceso: integración como etapa previa a la comparación biométrica, de modo que se rechacen presentaciones en pantalla antes de invocar modelos de reconocimiento facial más costosos.
- Detección de fraude documental: identificación de documentos fotografiados desde un monitor en lugar de capturados en físico, un patrón frecuente en tramitaciones fraudulentas.
- Despliegue en el borde o en navegador: al ser un grafo ONNX de Opset 14 y entrada de 20 `float32`, puede ejecutarse con `onnxruntime-web` en el cliente, lo que permite verificar la imagen antes de enviarla al servidor y reducir costes de cómputo y exposición de datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La única métrica declarada por el autor es una "Calibration Accuracy" del 100,00 %, sin conjunto de evaluación, tamaño de muestra ni protocolo documentados; no se presenta como resultado comparable con otros sistemas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio declara 0.0 GB, coherente con un clasificador sobre un vector de 20 características, pero el tamaño real de los pesos no se detalla.
- GPU recomendadas: no se requiere GPU para un modelo de esta naturaleza; la inferencia en CPU es el escenario esperado.
- Cabe en cualquier GPU de consumo (RTX 4090, RTX 3060 o inferiores) e incluso en entornos sin GPU; no se dispone de cifras de latencia.
- Opciones de despliegue: `onnxruntime` (Python, C++, C#), `onnxruntime-web` con backend WASM para navegador, y cualquier runtime compatible con ONNX Opset 14.
- Latencia y throughput: no disponibles. Por la forma del tensor de entrada, se espera un coste despreciable frente a la extracción de características, que sí puede ser el cuello de botella del pipeline.

## Comparativa con modelos similares

| Modelo | Tipo | Entrada | Clases | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ElNeMeR ScreenCapture-Recapture-Moire-ONNX | Clasificador ONNX sobre características | Vector `float32` de 20 dimensiones | 3 | MIT | Hugging Face |
| Detectores de deepfake basados en CNN (p. ej. familias XceptionNet o EfficientNet adaptadas) | Red convolucional sobre imagen completa | Imagen RGB | Variable | Variable según modelo | Múltiples repositorios |
| Detectores de recaptura basados en frecuencia (FFT/DCT) | Pipeline clásico de visión | Imagen o parche | Variable | Variable | Implementaciones académicas |

No se dispone de datos de rendimiento del modelo de ElNemer que permitan una comparación cuantitativa con estas alternativas; la comparación anterior es únicamente estructural.

## Limitaciones y advertencias

- La model card no documenta arquitectura, parámetros, datos de entrenamiento ni protocolo de evaluación; la reproducibilidad es muy limitada.
- La cifra de "Calibration Accuracy" del 100,00 % no está respaldada por un conjunto de evaluación descrito y no debe tomarse como indicador de rendimiento en producción.
- El modelo no procesa imágenes directamente: depende de un extractor externo que genere el vector de 20 características. Si ese extractor no está disponible o difiere del usado en el entrenamiento, los resultados no son fiables.
- No se documentan sesgos, pero cualquier clasificador forense puede mostrar tasas de error distintas según el dispositivo de captura, la iluminación, el tipo de panel o la impresora.
- Riesgo de falsos positivos en imágenes legítimas con patrones periódicos (textiles, rejillas, tramados de impresión) que imiten señales de Moiré.
- Licencia MIT: permite uso comercial y modificación, pero el autor no ofrece garantías ni soporte; conviene conservar el aviso de copyright.
- El repositorio no tiene descargas ni validación externa en el momento de la consulta; su madurez en producción es desconocida.
- No apto para tomar decisiones automatizadas de alto impacto sin revisión humana.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/elnemer7/ElNeMeR-ScreenCapture-Recapture-Moire-ONNX
- Plataforma forense del autor: https://detector.elnemer-ai.com
- Portal corporativo: https://elnemer-ai.com
