# Missouter/AcoustiTrace-RT60

## Resumen

AcoustiTrace-RT60 es un adaptador LoRA desarrollado por Missouter que se integra sobre el modelo base Qwen/Qwen3-VL-8B-Instruct para estimar el tiempo de reverberación (RT60) a 500 Hz a partir de señales visuales de una escena. Forma parte del benchmark AcoustiTrace, un marco de evaluación audio-visual diseñado para diagnosticar la plausibilidad acústica en vídeos generados. El checkpoint incluye una cabeza de física continua guiada por la ecuación de Sabine, lo que permite obtener estimaciones coherentes con la geometría y los materiales visibles en la imagen.

El modelo resuelve un problema específico: la falta de métricas objetivas para evaluar si un vídeo generado presenta una acústica realista. En lugar de medir directamente la reverberación, infiere el RT60 a partir de pistas visuales como el tamaño de la sala, la presencia de superficies absorbentes o reflectantes y la disposición del mobiliario. Su relevancia actual radica en el auge de los generadores de vídeo con audio, donde la coherencia entre lo visual y lo acústico es un criterio de calidad emergente.

El repositorio contiene únicamente los artefactos del adaptador (pesos LoRA, cabeza de física y configuración), no el modelo base completo. El tamaño total del repositorio es de 0,2 GB. La licencia es de uso exclusivamente académico y de investigación, con restricciones derivadas de los datos de entrenamiento de Matterport3D.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre Qwen3-VL-8B-Instruct + cabeza de física Sabine (physics_head.pt) |
| Parametros totales | no disponible (el adaptador LoRA es una fracción del modelo base; no se especifica el número exacto) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (depende del modelo base Qwen3-VL-8B-Instruct, que soporta 32k tokens, pero no se confirma para este adaptador) |
| Tipos de cuantizacion | safetensors (adaptador), physics_head.pt (PyTorch) |
| Idiomas soportados | no disponible (el modelo base Qwen3-VL soporta múltiples idiomas, pero no se especifica para este adaptador) |
| Licencia | acoustitrace-rt60-research-license (uso no comercial, académico e investigación) |
| Formato de pesos | safetensors (adapter_model.safetensors), physics_head.pt, processor/ |

## Arquitectura y entrenamiento

El adaptador se compone de dos partes diferenciadas. Por un lado, un adaptador LoRA que se acopla a las capas de atención del VLM Qwen3-VL-8B-Instruct, congelado durante la inferencia. Por otro, una cabeza de física continua que toma las representaciones visuales extraídas por el VLM y las transforma en una estimación escalar de RT60 a 500 Hz, utilizando una formulación inspirada en la ecuación de Sabine para garantizar coherencia física con la geometría de la sala.

El entrenamiento se realizó con supervisión de RT60 procedente de tres fuentes: observaciones RGB-D de Matterport3D, simulaciones acústicas de salas de SoundSpaces 2.0 y coeficientes de absorción de la base de datos PTB Room Acoustics Absorption Coefficient Database. No se incluyen datos de entrenamiento en el repositorio. No se menciona el uso de RLHF, DPO ni técnicas de alineación adicionales. El modelo base Qwen3-VL-8B-Instruct se mantiene congelado y se descarga por separado.

## Capacidades

- Estimación de tiempo de reverberación (RT60) a 500 Hz a partir de imágenes o secuencias visuales de una escena.
- Diagnóstico de plausibilidad acústica en vídeos generados, comparando la estimación visual con la reverberación real o simulada.
- Integración con el pipeline de evaluación de AcoustiTrace, que permite puntuar la coherencia audio-visual de vídeos sintéticos.
- Uso como componente de un benchmark, no como modelo generativo de texto o imagen.
- No soporta tool calling, agentes ni razonamiento multi-paso en el sentido tradicional; su salida es una estimación numérica.
- Capacidades multilingües no confirmadas; el procesamiento se limita a la entrada visual.

## Casos de uso

- Evaluación automática de vídeos generados por IA: dado un vídeo sintético con pista de audio, el modelo estima el RT60 visual de cada fotograma y lo compara con el RT60 medido en el audio, permitiendo detectar inconsistencias acústicas.
- Investigación en acústica de salas: los investigadores pueden utilizar el adaptador para predecir RT60 a partir de fotografías de espacios reales, como paso previo a simulaciones acústicas detalladas.
- Control de calidad en producción de contenido virtual: estudios que generan entornos 3D para cine o videojuegos pueden verificar que la reverberación implícita en la geometría coincida con la respuesta acústica esperada.
- Benchmarking de modelos de generación de vídeo con audio: sirve como métrica objetiva para comparar la calidad acústica de diferentes sistemas de generación, complementando métricas subjetivas.
- Análisis de escenas a partir de imágenes estáticas: permite estimar la reverberación de una sala a partir de una única fotografía, útil para aplicaciones de realidad aumentada o diseño de espacios.
- Validación de simulaciones acústicas: los resultados del modelo pueden contrastarse con mediciones reales o simuladas para verificar la precisión de herramientas de simulación como SoundSpaces.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El modelo se presenta como un componente evaluador dentro de AcoustiTrace, pero no se proporcionan métricas numéricas (p. ej., error absoluto medio, correlación con RT60 real) en la model card ni en los resultados de búsqueda.

## Requisitos de hardware

- El adaptador LoRA es ligero (0,2 GB), pero requiere cargar el modelo base Qwen3-VL-8B-Instruct, que tiene aproximadamente 8.000 millones de parámetros.
- Para inferencia en FP16, se estima un consumo de VRAM de unos 16 GB, lo que permite ejecutarlo en GPUs como RTX 4090 (24 GB) o A100 (40 GB).
- Con cuantización de 8 bits, la VRAM necesaria baja a unos 8-10 GB, siendo viable en GPUs de gama media como RTX 3080 o RTX 4070.
- Con cuantización de 4 bits, podría caber en GPUs con 6-8 GB de VRAM, aunque no se especifica compatibilidad oficial con este adaptador.
- Opciones de despliegue: el flujo recomendado es mediante el repositorio de AcoustiTrace, que gestiona la descarga de pesos y la verificación. No se menciona soporte para vLLM, llama.cpp u Ollama, ya que el modelo no es un LLM generativo estándar.
- La latencia dependerá del modelo base y del hardware; para una sola imagen, se espera un tiempo de inferencia del orden de cientos de milisegundos en GPUs modernas, pero no se proporcionan datos concretos.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (estimación de RT60 a partir de visión). Existen herramientas de medición acústica como SonaVyx o AcousPlan, pero son software de análisis de audio, no modelos de aprendizaje automático. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- Licencia restringida: el uso está limitado a fines académicos y de investigación no comercial. Además, está sujeto a los términos de uso académico de Matterport3D, que pueden imponer restricciones adicionales sobre la redistribución o el uso comercial de los resultados.
- El modelo no incluye el modelo base Qwen3-VL-8B-Instruct; es necesario descargarlo por separado y verificar la compatibilidad de versiones.
- Las salidas son estimaciones diagnósticas, no mediciones acústicas directas. No deben utilizarse como sustituto de instrumentos de medición certificados (p. ej., según IEC 61672).
- No se especifican sesgos conocidos, pero al entrenarse con datos de Matterport3D (entornos interiores reales) y simulaciones de SoundSpaces, puede tener un rendimiento degradado en escenas al aire libre o con geometrías atípicas.
- Riesgo de alucinación visual: el VLM base puede interpretar incorrectamente ciertas texturas o iluminación, lo que afectaría a la estimación de RT60.
- No se proporcionan datos sobre el rendimiento en diferentes idiomas ni sobre la robustez ante variaciones de iluminación, ángulo de cámara o resolución.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere que es un lanzamiento reciente o poco difundido; la documentación es escasa y no hay ejemplos de uso más allá del script de descarga.

## Enlaces

- [HuggingFace - Missouter/AcoustiTrace-RT60](https://huggingface.co/Missouter/AcoustiTrace-RT60)
- [Paper (arXiv)](https://arxiv.org/abs/2608.02035)
- [Página del proyecto AcoustiTrace](https://leader-sheng.github.io/AcoustiTrace/)
- [Código (GitHub)](https://github.com/Leader-sheng/AcoustiTrace)
- [Licencia del modelo](https://huggingface.co/Missouter/AcoustiTrace-RT60/blob/main/LICENSE)
