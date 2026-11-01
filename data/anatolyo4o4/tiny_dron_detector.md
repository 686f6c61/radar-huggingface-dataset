# anatolyo4o4/tiny_dron_detector

## Resumen

DroneClassifier es un modelo ligero de clasificación de audio binaria diseñado para detectar la presencia de drones a partir de ventanas de un segundo de audio. Lo desarrolla el usuario anatolyo4o4 y se publica bajo licencia MIT, con pesos en PyTorch y exportación a ONNX. El modelo resuelve un problema concreto: el despliegue en tiempo real en dispositivos de borde (edge) con recursos limitados, donde los detectores acústicos convencionales resultan demasiado pesados o dependen de arquitecturas recurrentes difíciles de exportar a C++.

La arquitectura es una CNN compacta que emplea convoluciones depthwise y pooling mean+max sobre el eje temporal, sin capas GRU ni recurrencia. La decisión es deliberada: para ventanas de un segundo la recurrencia aporta poco y complica la exportación a ONNX y a C++. El modelo se entrena sobre el dataset `geronimobasso/drone-audio-detection-samples` y declara métricas muy altas en su model card (F1 de 0,9953 y accuracy de 0,9928), aunque no verificadas de forma independiente.

Es relevante ahora porque los sistemas de detección de drones pasan cada vez más por sensores acústicos de bajo coste y cómputo en el borde, y este modelo ofrece un pipeline completo (entrenamiento, detección con histéresis y exportación ONNX con matriz Mel extraída de torchaudio) pensado para integrarse en C++ sin dependencias pesadas. No es un modelo de lenguaje ni un modelo multimodal general: es un clasificador de audio especializado y de dominio muy acotado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN con convoluciones depthwise y pooling mean+max sobre el eje temporal (sin GRU) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; ventana de audio de 1 segundo, muestreo a 16 kHz mono int16 |
| Tipos de cuantizacion | no disponible (exportación a ONNX; no se documentan cuantizaciones) |
| Idiomas soportados | en, uk (según metadatos; el modelo clasifica audio, no texto) |
| Licencia | MIT |
| Formato de pesos | PyTorch (checkpoint) y ONNX (`engine.onnx`, `mel_fb.f32`, `engine_meta.txt`) |

## Arquitectura y entrenamiento

El modelo es una CNN ligera que sustituye la recurrencia por convoluciones depthwise y pooling agregado (mean+max) a lo largo del tiempo. Según la model card, la recurrencia se considera innecesaria para ventanas de un segundo y su omisión simplifica la exportación a ONNX y la integración en C++. La entrada se procesa como audio a 16 kHz mono en int16 y la matriz de filtros Mel se deriva directamente de torchaudio, de modo que la implementación en C++ no requiere una reimplementación propia del banco de filtros.

El entrenamiento lee todos los shards de `data/*.parquet` una sola vez, decodifica el audio y lo almacena en una caché mapeada en memoria, sin cargar los 39 shards completos en RAM. La etiqueta positiva ("engine") se define mediante el parámetro `--positive-label`. El pipeline de aumentación incluye variación de velocidad de ±12 %, filtrado paso bajo y paso alto, reverberación, mezcla de clips reales de fondo o ruido coloreado con SNR de 0 a 25 dB, ajuste aleatorio de ganancia de −15 a +10 dB, ruido inherente de micrófono y SpecAugment (enmascaramiento en frecuencia y tiempo) aplicado por lotes. El entrenamiento usa muestreo balanceado de clases, optimizador AdamW, schedule OneCycle, AMP en CUDA y early stopping; se guarda el checkpoint con mejor AUC de validación y el umbral se fija por F1. La detección (`detect_file()`) procesa por lotes, suaviza la salida, aplica histéresis y devuelve eventos con tiempos de inicio y fin.

## Capacidades

- Clasificación de audio binaria para detección de drones sobre ventanas de un segundo.
- Detección de eventos con marcas temporales de inicio y fin mediante suavizado e histéresis.
- Exportación a ONNX con matriz Mel y metadatos asociados para inferencia en C++.
- Procesamiento por lotes en la función de detección.
- Entrenamiento reproducible sobre datasets en formato Parquet con caché mapeada en memoria.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso.
- No dispone de capacidades de generación de texto, código, matemáticas ni visión.
- No es un modelo multilingüe en sentido lingüístico: las etiquetas en/uk de los metadatos no implican procesamiento de lenguaje.

## Casos de uso

- Vigilancia acústica perimetral en instalaciones sensibles: el modelo clasifica ventanas de un segundo y devuelve eventos con inicio y fin, lo que permite alertar sobre aproximaciones de drones en tiempo real con hardware de bajo consumo.
- Despliegue en dispositivos de borde con C++: la exportación ONNX junto con `mel_fb.f32` y `engine_meta.txt` permite integrar la inferencia sin torchaudio ni dependencias de Python en el dispositivo final.
- Monitorización de perímetros aeroportuarios o industriales: la detección por eventos con histéresis reduce falsos positivos por ruido puntual y encaja en sistemas de alerta temprana.
- Sistemas de contramedidas o de seguridad privada: la detección temprana de motores ("engine") permite activar protocolos de respuesta o de inhibición en función del evento detectado.
- Investigación en bioacústica y contaminación acústica: el pipeline de entrenamiento y aumentación sirve de base para reentrenar el clasificador con otras fuentes de ruido o entornos.
- Prototipado rápido en Raspberry Pi o dispositivos similares: al no usar recurrencia y exportarse a ONNX, el modelo es adecuado para pruebas de concepto de detección en hardware de gama baja.
- Filtrado previo en pipelines de audio más grandes: el clasificador puede actuar como primera etapa que descarta segmentos sin dron antes de un análisis más costoso.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente) sobre el dataset `geronimobasso/drone-audio-detection-samples`:

| Metrica | Valor |
|---|---|
| Loss | 0,1442 |
| F1 Score (umbral 0,25) | 0,9953 |
| Accuracy | 0,9928 |

No se han publicado en la información disponible resultados comparativos con otros modelos ni métricas adicionales (AUC, precisión, recall por clase).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamaño del repositorio es de 0,0 GB y el modelo es explícitamente ligero, pero no se publica el número de parámetros.
- GPU recomendadas: no disponible; por el diseño orientado a edge, se espera que funcione en CPU y en aceleradores de baja potencia, aunque no se documentan requisitos concretos.
- Compatibilidad con GPU de consumo: previsiblemente sí, dado el enfoque en despliegue en el borde, pero no hay datos publicados que lo confirmen.
- Opciones de despliegue: PyTorch (checkpoint) y ONNX Runtime para la exportación `engine.onnx`; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de detección acústica de drones ni datos de rendimiento de alternativas.

## Limitaciones y advertencias

- Métricas declaradas por el autor y marcadas como no verificadas; los valores de F1 y accuracy pueden no reproducirse en condiciones reales.
- El umbral de detección (0,25) está fijado por F1 sobre el conjunto de validación y puede no ser óptimo para otros entornos o tasas de falsos positivos aceptables.
- Dominio muy acotado: clasifica segmentos de un segundo y no modela contexto temporal largo ni secuencias complejas.
- Sensibilidad al ruido de fondo y a las condiciones de grabación; la aumentación cubre parte de este riesgo, pero no se documentan pruebas de robustez fuera del dataset de entrenamiento.
- Riesgo de falsos positivos con sonidos de motores o ventiladores no relacionados con drones.
- Las etiquetas de idioma (en, uk) no implican capacidades lingüísticas; el modelo no procesa texto.
- Licencia MIT: permite uso comercial y modificación, pero no se documentan garantías ni responsabilidades más allá de lo que establece la propia licencia.
- Sin datos publicados sobre sesgos, calibración ni comportamiento en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/anatolyo4o4/tiny_dron_detector
- Dataset de entrenamiento: https://huggingface.co/datasets/geronimobasso/drone-audio-detection-samples
