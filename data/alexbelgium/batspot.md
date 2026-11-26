# alexbelgium/BatSpot

## Resumen

BatSpot es un clasificador de llamadas de ecolocación de murciélagos basado en una red neuronal convolucional ResNet18, desarrollado por Smeele et al. y convertido a ONNX por alexbelgium para su integración en pipelines de bioacústica sin dependencia de PyTorch. El modelo clasifica audio ultrasónico real (grabado a 250 kHz) en 15 clases que incluyen 12 especies o complejos de especies de murciélagos europeos, además de las categorías no-especie `noise`, `B` (zumbido de alimentación) y `s` (llamada social).

La relevancia actual del modelo radica en su carácter complementario: es un modelo entrenado de forma independiente respecto a otras alternativas como BSG-BAT, utiliza una arquitectura distinta (ResNet18 sobre espectrogramas lineales de 20 ms en lugar de CNN sobre mel-espectrogramas de 1 s) y cubre especies que otros clasificadores no contemplan, como *Myotis dasycneme*, *Myotis nattereri* y el complejo *Myotis brandtii/mystacinus*. Además, el pipeline original está diseñado para ser reentrenado con datos locales, lo que lo hace atractivo para proyectos de monitorización acústica adaptados a regiones concretas.

La conversión ONNX (FP32, opset 17, ~43 MB) es numéricamente verificada contra el checkpoint PyTorch original y está pensada para ejecutarse en BirdNET-Go y en cualquier runtime ONNX (Python, Go, C++). Solo se incluye el clasificador de llamadas de fase de búsqueda (`models_call_classifier/m09`); los detectores de llamadas, zumbidos y llamadas sociales del release original no están incluidos en esta conversión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ResNet18 (encoder ANIMAL-SPOT: conv stem 7x7 sin max-pool, global average pooling, Linear 512→15) |
| Parametros totales | no disponible (pesos ONNX ~43 MB en FP32) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de audio; ventana de 20 ms, 5000 muestras a 250 kHz, hop de 5 ms) |
| Tipos de cuantizacion | no disponible (solo se distribuye FP32) |
| Idiomas soportados | en (etiquetas y documentación en inglés; el modelo no procesa texto) |
| Licencia | CC-BY-4.0 (el código original ANIMAL-SPOT incluido es GPL-3.0) |
| Formato de pesos | ONNX (opset 17, pesos inline) |

## Arquitectura y entrenamiento

BatSpot emplea una ResNet18 como extractor de características sobre espectrogramas lineales de 20 ms. El front-end de preprocesado es específico: remuestreo a 250 kHz, ventana deslizante de 5000 muestras con hop de 1250, pre-énfasis `y[n] = x[n] - 0.98·x[n-1]`, STFT con `n_fft=256`, hop 128, ventana Hann periódica sin centrado y potencia `|X|²/96`, recorte de bins 10..127 (~9.8–124 kHz) estirado a 256 bins, conversión a dB, normalización min-max por ventana y entrada final `[1, 1, 38, 256]`. La salida son 15 logits crudos sobre los que se aplica softmax; el modelo es de etiqueta única y se entrenó con entropía cruzada.

El modelo procede del artículo de Smeele et al. (2026) en *Biological Conservation* y se construye sobre ANIMAL-SPOT (Bergler et al.). No se ha reentrenado ni modificado durante la conversión ONNX; la paridad numérica con el checkpoint PyTorch original está verificada. El front-end de referencia en numpy (`reference_frontend.py`) coincide con el pipeline de datos de ANIMAL-SPOT con un error de 5.6e-6 sobre grabaciones reales. No se dispone en la información proporcionada de detalles sobre el volumen de datos de entrenamiento, composición del dataset ni uso de RLHF/DPO (no aplicable a un clasificador de audio).

## Capacidades

- Clasificación de llamadas de ecolocación de murciélagos en fase de búsqueda a nivel de especie o complejo de especies (12 clases de especie).
- Detección de zumbidos de alimentación (`B`) y llamadas sociales (`s`) como clases propias, evitando que se etiqueten erróneamente como especie.
- Discriminación de la clase `noise` para descartar audio no relevante.
- Procesamiento de audio ultrasónico real grabado a 250 kHz (no sintético).
- Ejecución en ONNX Runtime en Python, Go, C++ y otros lenguajes, sin PyTorch.
- Integración con BirdNET-Go para monitorización acústica en tiempo real.
- Reentrenamiento posible con pequeños volúmenes de datos locales (según el artículo original).
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües de texto: es un clasificador de audio mono-etiqueta.

## Casos de uso

- Monitorización acústica pasiva de murciélagos: despliegue en BirdNET-Go o en un pipeline ONNX propio para procesar grabaciones continuas de detectores ultrasónicos y generar inventarios de especies por localidad, aprovechando la ventana de 20 ms y el hop de 5 ms para resolución temporal fina.
- Validación cruzada de detecciones: al ser un modelo independiente de BSG-BAT, la concordancia entre ambos clasificadores sobre la misma grabación sirve como evidencia de que una detección es real y no un falso positivo.
- Estudios de especies poco cubiertas: clasificación específica de *Myotis dasycneme*, *Myotis nattereri* y el complejo *Myotis brandtii/mystacinus*, que otros clasificadores no contemplan.
- Análisis de comportamiento alimentario: uso de la clase `B` (zumbido de alimentación) para cuantificar eventos de caza y estimar actividad de forrajeo en una zona.
- Estudio de comunicación social: uso de la clase `s` (llamada social) para separar interacciones sociales de llamadas de ecolocación y evitar sesgos en el conteo de especies.
- Adaptación regional mediante reentrenamiento: el pipeline original está pensado para reentrenarse con datos locales, lo que permite ajustar el modelo a la fauna de una región concreta con un esfuerzo de anotación reducido.
- Integración en herramientas de código abierto: al ser ONNX puro, puede embeberse en aplicaciones Go o C++ de bajo consumo para dispositivos de campo sin dependencias de PyTorch.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; el modelo ONNX FP32 ocupa ~43 MB, por lo que la huella de memoria es mínima comparada con modelos de lenguaje. No se dispone de cifras exactas de VRAM pico en la información proporcionada.
- GPU recomendadas: cualquier GPU moderna es sobredimensionada para este modelo; una GPU de consumo básica o incluso CPU es suficiente. No se especifican modelos concretos (A100, H100, RTX 4090) en la información disponible.
- Cabe en cualquier GPU de consumo e incluso en CPU: el ejemplo de la model card usa `CPUExecutionProvider`.
- Opciones de despliegue: ONNX Runtime (Python, Go, C++), BirdNET-Go, y cualquier pipeline compatible con ONNX. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a un clasificador de audio).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Arquitectura | Entrada | Clases | Especies exclusivas | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| BatSpot (este) | ResNet18 sobre espectrograma lineal de 20 ms | Audio a 250 kHz, ventana 20 ms | 15 (12 especies + noise, B, s) | *M. dasycneme*, *M. nattereri*, complejo *M. brandtii/mystacinus* | CC-BY-4.0 (código original GPL-3.0) | ONNX en Hugging Face |
| BSG-BAT | CNN sobre mel-espectrograma de 1 s | Audio (mel-espectrograma 1 s) | no disponible | no disponible | no disponible | Hugging Face (tphakala/BSG-BAT) |
| ANIMAL-SPOT (base) | Framework con ResNet18 y otros | Audio configurable | Configurable por proyecto | Depende del entrenamiento | GPL-3.0 | GitHub (ChristianBergler/ANIMAL-SPOT) |

La comparación se limita a los datos disponibles: BSG-BAT se menciona en la model card como modelo complementario, pero no se detallan sus especificaciones completas. ANIMAL-SPOT es el framework base sobre el que se construye BatSpot.

## Limitaciones y advertencias

- Solo se incluye el clasificador de llamadas de fase de búsqueda (`m09`); los detectores de llamadas, zumbidos y llamadas sociales del release original no están convertidos.
- El modelo es de etiqueta única: no modela la co-ocurrencia de especies ni la incertidumbre entre clases relacionadas.
- Las clases `noise`, `B` y `s` no son especies; las aplicaciones deben reportarlas por separado o descartarlas para evitar confusiones en inventarios de especies.
- El umbral de detección por defecto es 0.5 sobre la probabilidad softmax; no se documentan curvas de calibración ni análisis de sensibilidad al umbral.
- Sesgos conocidos: no disponibles en la información proporcionada. Al estar entrenado sobre fauna europea, es probable que su rendimiento se degrade fuera de ese ámbito, pero no se aportan datos al respecto.
- Riesgo de alucinación: no aplica en el sentido de generación de texto, pero sí existe riesgo de falsos positivos en clasificación; la model card sugiere usar la concordancia con BSG-BAT como evidencia adicional.
- Limitaciones de idioma: el modelo no procesa texto; las etiquetas y la documentación están en inglés.
- Restricciones de licencia: el modelo se distribuye bajo CC-BY-4.0, pero el código original de ANIMAL-SPOT incluido en `original_code/` es GPL-3.0, lo que impone obligaciones de copyleft sobre ese código.
- El front-end de preprocesado es crítico: cualquier desviación en remuestreo, pre-énfasis, STFT o normalización degrada las predicciones; se recomienda usar `reference_frontend.py` como referencia.
- No se documentan requisitos de latencia ni throughput para producción en tiempo real.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/alexbelgium/BatSpot
- BSG-BAT (modelo complementario): https://huggingface.co/tphakala/BSG-BAT
- BirdNET-Go (aplicación de monitorización acústica): https://github.com/tphakala/birdnet-go
- ANIMAL-SPOT (framework base): https://github.com/ChristianBergler/ANIMAL-SPOT
- Artículo de referencia: Smeele, S.Q., Hauer, C., Bergler, C., Dechmann, D.K., Dietzer, M.T., Elmeros, M., Fjederholt, E.T., Fogato, A., Kohles, J.E., Nöth, E. and Brinkløv, S.M. (2026). *BatSpot: a retrainable neural network for automatic detection and classification of bat echolocation and detection of buzzes and social calls.* Biological Conservation, 321, 111975.
