# elnemer7/ElNeMeR-VoiceNote-SpeedPitch-Disguise-ONNX

## Resumen

ElNeMeR-VoiceNote-SpeedPitch-Disguise-ONNX es un clasificador de audio en formato ONNX desarrollado por el ingeniero Mahmoud ElNemer (ElNeMeR Digital Solutions & AI) dentro de una flota de 60 modelos orientados a IA humanitaria y forense digital. El modelo aborda un problema concreto: detectar si una nota de voz recibida por WhatsApp o Telegram ha sido manipulada con cambiadores de tono, deformadores de formantes o modulación de velocidad para enmascarar la identidad del hablante, un patrón habitual en casos de extorsión.

Técnicamente es un clasificador ligero que opera sobre un vector de 20 características (`pitch_disguise_features`, float32, forma `[batch_size, 20]`) y devuelve tres clases de probabilidad: voz natural sin alterar, voz con pitch-shift para disfraz, y audio estirado en el tiempo con formantes deformados. Se distribuye como grafo ONNX con opset 14, compatible tanto con `onnxruntime` como con `onnxruntime-web` (WASM), lo que permite ejecución en navegador.

Su relevancia es acotada pero específica: cubre una necesidad forense poco atendida por los grandes modelos generalistas, con licencia MIT y un coste computacional mínimo. No es un modelo generativo ni un sistema de reconocimiento de hablante; es un detector de manipulación acústica pensado para triaje rápido en flujos de investigación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Clasificador ONNX (grafo propietario, detalles internos no disponibles) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entrada de 20 caracteristicas, no secuencial) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (opera sobre caracteristicas acusticas, no texto) |
| Licencia | MIT |
| Formato de pesos | ONNX (opset 14) |

## Arquitectura y entrenamiento

La model card no detalla la arquitectura interna del grafo ONNX ni el volumen o composición del dataset de entrenamiento. Lo que sí se especifica es la interfaz: una entrada `pitch_disguise_features` de tipo float32 con 20 dimensiones por muestra y una salida de probabilidades sobre tres clases (`natural_unaltered_vocal_formants`, `pitch_shifted_extortion_voice_disguise`, `time_stretched_formant_warped_audio`). El autor declara una precisión de calibración del 96,19%, sin especificar el conjunto de validación, la métrica exacta ni el protocolo de evaluación.

El modelo se exporta con opset 14, lo que garantiza compatibilidad con `onnxruntime` en servidor y con `onnxruntime-web` mediante WASM en el navegador. No se documenta si hubo ajuste fino, aumentación de datos con pitch-shift sintético, ni técnicas de regularización. La extracción de las 20 características acústicas previas al clasificador no está descrita en la información disponible, lo que obliga a inferirla del nombre del tensor o a contactar con el autor.

## Capacidades

- Clasificación de audio en tres clases: voz natural, voz con pitch-shift de disfraz y audio con estiramiento temporal y deformación de formantes.
- Detección de manipulación acústica orientada a casos de extorsión en notas de voz.
- Inferencia en navegador mediante `onnxruntime-web` (WASM), sin necesidad de backend.
- Inferencia en servidor con `onnxruntime` estándar.
- Entrada de tamaño fijo (20 características float32), lo que simplifica el despliegue y el batching.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso.
- No es un modelo multimodal ni generativo: no transcribe, no traduce y no identifica hablantes.
- Capacidades multilingües: no aplica, opera sobre características acústicas independientes del idioma.

## Casos de uso

- Triaje forense de notas de voz en casos de extorsión: el clasificador permite priorizar audios sospechosos antes del análisis pericial manual, reduciendo el tiempo de revisión en lotes grandes de mensajes.
- Filtro previo en plataformas de mensajería: integrado en un pipeline de moderación, marca notas de voz con probable disfraz vocal para revisión humana, sin bloquear automáticamente.
- Herramienta web de verificación ciudadana: al ejecutarse con `onnxruntime-web`, puede desplegarse como utilidad en navegador donde el usuario sube una nota de voz y obtiene una probabilidad de manipulación sin enviar el audio a un servidor.
- Apoyo a peritajes de autenticidad de audio: como señal complementaria junto a análisis espectral y de formantes realizado por un experto, aportando una puntuación objetiva reproducible.
- Investigación académica sobre detección de voice disguise: sirve como baseline ligero y de código abierto (MIT) para comparar con detectores más pesados en tareas de anti-forense de voz.
- Formación de equipos de respuesta a incidentes: entorno de prácticas donde se generan audios con pitch-shift y se evalúa la capacidad del analista y del modelo para detectarlos.
- Integración en flujos de ONG y ayuda humanitaria: el tag `humanitarian-ai` sugiere uso en contextos de protección de víctimas, donde un detector rápido y de bajo coste permite cribar denuncias.

## Benchmarks y rendimiento

La única métrica publicada en la información disponible es la precisión de calibración declarada por el autor:

| Metrica | Valor | Conjunto de evaluacion |
|---|---|---|
| Calibration Accuracy | 96,19% | no disponible |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, ni comparaciones con detectores de voice disguise de referencia. Tampoco se especifica la matriz de confusión, la precisión por clase ni el equilibrio del dataset de evaluación.

## Requisitos de hardware

- VRAM estimada para inferencia: mínima. El modelo opera sobre vectores de 20 float32 y un grafo ONNX de tamaño reducido (el repo ocupa 0,0 GB según Hugging Face, probablemente por redondeo de un artefacto de pocos MB).
- GPU recomendadas: no requiere GPU; funciona en CPU sin problema. Cualquier GPU consumer (GTX 1050 en adelante) es sobredimensionada para esta carga.
- Cabe en cualquier GPU consumer e incluso en dispositivos móviles y navegadores.
- Opciones de despliegue: `onnxruntime` (Python, C++, C#), `onnxruntime-web` (WASM en navegador), `onnxruntime-node`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles. Por la naturaleza del modelo (clasificador sobre 20 features), se espera latencia en el orden de microsegundos a pocos milisegundos por muestra en CPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. Los detectores de voice disguise y anti-forense de audio suelen publicarse en literatura académica (por ejemplo, trabajos sobre detección de pitch-shift y formant warping) sin artefactos ONNX listos para producción comparables directamente. Se indica "no disponible" para una comparativa cuantitativa fiable.

| Modelo | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| ElNeMeR-VoiceNote-SpeedPitch-Disguise-ONNX | no disponible | no aplica | MIT | ONNX |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- La arquitectura interna y el dataset de entrenamiento no están documentados, lo que impide auditar el modelo o reproducir la métrica del 96,19%.
- La precisión de calibración declarada no especifica conjunto de evaluación, métrica exacta ni equilibrio de clases; debe tratarse como indicativa y no como garantía.
- Solo cubre tres clases y tres tipos de manipulación (pitch-shift, estiramiento temporal, deformación de formantes). No detecta otras técnicas de disfraz como imitación vocal, síntesis de voz (deepfakes), filtrado espectral selectivo o inserción de ruido.
- No identifica al hablante ni verifica su identidad; únicamente señala la probable presencia de manipulación.
- Riesgo de falsos positivos en voces con características naturales extremas (tono muy agudo o grave, habla lenta o acelerada por condiciones médicas o dialectales) que podrían confundirse con manipulación.
- La extracción de las 20 características de entrada no está descrita; un uso incorrecto del preprocesado invalida las predicciones.
- El modelo no sustituye un peritaje forense: cualquier resultado debe validarse con análisis especializado antes de usarse en un procedimiento legal.
- Licencia MIT: permite uso comercial y modificación, pero el autor no ofrece garantías ni asume responsabilidad sobre el uso.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta, sin evidencia de validación externa por parte de la comunidad.
- La model card incluye datos de contacto y sellos promocionales del autor; conviene tratar el contenido como material de marketing además de documentación técnica.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/elnemer7/ElNeMeR-VoiceNote-SpeedPitch-Disguise-ONNX
- Plataforma forense humanitaria del autor: https://detector.elnemer-ai.com
- Portal corporativo: https://elnemer-ai.com
- Contacto del autor: WhatsApp / teléfono +20 150 755 9911 (según model card)
