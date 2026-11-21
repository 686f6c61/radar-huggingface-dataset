# RockTheBoat/MikolAI-kodek-checkpoints

## Resumen

MikołAI kodek mowy 48 kHz es un autoencoder de audio (codec neuronal) desarrollado por RockTheBoat, diseñado específicamente como capa de compresión y reconstrucción para un pipeline de text-to-speech en polaco. Convierte audio mono a 48 kHz en un latente de 24 dimensiones por cada 512 muestras (93,75 tramas por segundo) y lo reconstruye de vuelta a forma de onda, actuando como el componente de audio de un sistema TTS tipo BlueTTS donde un modelo principal genera latentes y este decoder los transforma en sonido.

El modelo sigue la arquitectura blue-codec (esquema Supertonic) y se entrenó desde cero sobre un único corpus sintético de un solo hablante: aproximadamente 364 horas del dataset HoldForQuake/VoxCPM2-pol-one-voice-367h, generado con VoxCPM2. El autor advierte explícitamente de que no es un codec de propósito general: solo ha visto una voz sintética y no se ha evaluado sobre otras voces ni grabaciones reales.

Es relevante ahora porque demuestra un enfoque de entrenamiento de codecs de audio de alta fidelidad (48 kHz) con recursos modestos (6× RTX 3090 Ti) y técnicas de local SGD para evitar el cuello de botella de PCIe, además de publicar los pesos en Apache-2.0 y el código de arquitectura en MIT, lo que facilita su reutilización e inspección.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Autoencoder convolucional blue-codec (esquema Supertonic): encoder ConvNeXt + decoder ConvNeXt 1D |
| Parámetros totales | ~50,9 M (encoder 25,6 M + decoder 25,3 M) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (codec de audio; procesa tramas de 512 muestras) |
| Tipos de cuantización | No disponible |
| Idiomas soportados | Polaco (pl), un único hablante sintético |
| Licencia | Apache-2.0 (pesos); código de arquitectura MIT |
| Formato de pesos | PyTorch `.pt` (checkpoint con claves `encoder` y `decoder`) |

## Arquitectura y entrenamiento

El codec es un autoencoder simétrico. El encoder recibe una representación espectral de 1253 dimensiones (espectro lineal de 1025 bins más 228 bandas mel) y la procesa mediante 10 bloques ConvNeXt de anchura 512 hasta producir un latente de 24 números por trama. El decoder invierte el proceso: 10 bloques ConvNeXt de anchura 512 transforman el latente de 24 dimensiones en 512 muestras de audio por trama, a 48 kHz mono. El encoder solo es necesario durante el entrenamiento del modelo TTS principal (para calcular latentes); en inferencia basta el decoder.

El entrenamiento usó aproximadamente 364 horas del dataset sintético de una sola voz, con 300 conversaciones completas (1488 clips) reservadas para validación y sin filtro de calidad. La función de pérdida sigue el recetario por defecto de blue-codec: reconstrucción mel hasta 12 kHz, discriminadores multiperiodo y multirresolución, y feature matching, más un término de banda alta (`--hiband_w 2.0`). Se ejecutó en 6× RTX 3090 Ti sin sincronización de gradientes: cada tarjeta entrenaba su propia copia y las copias se promediaban cada 20 pasos (local SGD) porque DDP saturaba el PCIe. El régimen de entrenamiento fue: pasos 0–60k con batch 64 por tarjeta y LR 8,5e-5 con decaimiento coseno; pasos 60–200k con batch 16 y LR prácticamente constante; pasos 200–220k con batch 64 y LR constante. El checkpoint publicado (`ae_wsm_210_220.pt`) es la media de pesos (WSM) de los pasos 210k, 212k, 214k, 216k, 218k y 220k, sin decaimiento final de LR.

## Capacidades

- Compresión y reconstrucción de audio de voz a 48 kHz mono en latentes de 24 dimensiones por trama de 512 muestras.
- Reconstrucción de espectro mel hasta 12 kHz y de banda completa (evaluada con log-mel de todo el rango).
- Mejora específica en fragmentos silenciosos y en el rango por encima de 16 kHz gracias al promediado de pesos (menos ruido).
- Integración como capa de audio en pipelines TTS tipo BlueTTS: el modelo principal genera latentes y este decoder los convierte en forma de onda.
- No soporta tool calling, function calling, agentes ni razonamiento multi-step: es un componente de audio, no un modelo de lenguaje.
- Capacidad multilingüe: no disponible; entrenado exclusivamente con voz sintética en polaco.
- No incluye modo thinking, visión ni audio de entrada más allá del propio audio a codificar.

## Casos de uso

- Capa de audio en un TTS en polaco: el decoder reconstruye la forma de onda a partir de latentes generados por un modelo principal, permitiendo síntesis a 48 kHz con una tasa de tramas baja (93,75 Hz) que reduce la carga del modelo generativo.
- Investigación en codecs neuronales: sirve como referencia reproducible de un autoencoder blue-codec entrenado desde cero a 48 kHz, con pesos y receta de entrenamiento publicados.
- Reentrenamiento o fine-tuning sobre otras voces: al estar los checkpoints con optimizador y discriminadores incluidos (`checkpoints/ae_*.pt`), se puede reanudar el entrenamiento sobre un corpus distinto para adaptar el codec a otros hablantes.
- Evaluación de fidelidad espectral: el par encoder/decoder permite medir distancias mel y log-mel de banda completa sobre clips de validación, útil para comparar variantes de arquitectura o de promediado de pesos.
- Prototipado de pipelines TTS de bajo coste: al necesitar solo el decoder (25,3 M parámetros) en inferencia, se puede desplegar en una GPU consumer para generar audio a 48 kHz en tiempo real aproximado, aunque no se han publicado cifras de latencia.
- Estudio de técnicas de entrenamiento distribuido: la receta de local SGD con promedio cada 20 pasos sobre 6× RTX 3090 Ti es un caso práctico para quienes entrenan modelos de audio en hardware no profesional.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre 64 clips de validación reservados (hasta 15 s cada uno, ~10 min en total). Menos es mejor.

| Modelo | Reconstrucción mel hasta 12 kHz | Log-mel, banda completa |
|---|---|---|
| Mejor checkpoint individual (paso 220k) | 1,1379 | 0,6252 |
| `ae_wsm_210_220.pt` (media de pesos) | 1,1334 | 0,5771 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) porque no aplican a un codec de audio. No hay comparación con otros codecs en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el decoder tiene 25,3 M parámetros; en fp32 ocupa aproximadamente 100 MB de pesos, por lo que cabe holgadamente en cualquier GPU consumer con 4 GB o más. El encoder añade otros ~100 MB si se necesita calcular latentes.
- GPU recomendadas: cualquier GPU con soporte CUDA; el autor entrenó con 6× RTX 3090 Ti, pero la inferencia del decoder es ligera. Para entrenamiento completo se recomienda al menos una RTX 3090 Ti o superior (A100/H100 para acelerar).
- Cabe en GPU consumer: sí, en RTX 3060, RTX 4060, RTX 4090 y similares; el cuello de botella es el procesado de audio, no la memoria.
- Opciones de despliegue: el código de referencia usa PyTorch y la librería blue-codec (MIT) del repositorio adamo1139/syntezujemy_polska_mowe. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo. La conversión a ONNX o TorchScript no está documentada.
- Latencia y throughput: no disponibles. La tasa de tramas es de 93,75 Hz (512 muestras a 48 kHz), lo que da una idea de la carga computacional, pero no se han publicado medidas de latencia ni de RTF.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Frecuencia de muestreo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MikołAI kodek mowy 48 kHz | Autoencoder blue-codec | ~50,9 M | 48 kHz | Apache-2.0 | Pesos en HF, código MIT |
| Codecs neuronales genéricos (p. ej. EnCodec, DAC) | Autoencoder con cuantización residual | No disponible en esta ficha | Típicamente 24–48 kHz | Varía según modelo | Públicos |
| VoxCPM2 (generador del corpus) | Modelo TTS | No disponible | No disponible | No disponible | Usado para generar los datos |

No se dispone de datos de rendimiento de los modelos comparables en la información proporcionada, por lo que la comparación cuantitativa no está disponible. La diferencia principal frente a codecs genéricos es su especialización en una única voz sintética polaca y su integración con el pipeline BlueTTS.

## Limitaciones y advertencias

- No es un codec de propósito general: se entrenó exclusivamente con una voz sintética ("poziomka") generada por VoxCPM2 y no se ha evaluado sobre otras voces ni grabaciones reales.
- Riesgo de sobreajuste al dominio: la reconstrucción puede degradarse notablemente con hablantes distintos, ruido de fondo, música o condiciones de grabación reales.
- Sin filtro de calidad en los datos de entrenamiento: el corpus no pasó un filtro de calidad, lo que puede introducir artefactos en la reconstrucción.
- Idiomas: solo polaco; no hay evidencia de comportamiento en otros idiomas.
- Sesgos: no se documentan sesgos específicos, pero al derivarse de una única voz sintética, cualquier sesgo acústico de esa voz se hereda.
- Restricciones de licencia: pesos Apache-2.0 y código MIT, lo que permite uso comercial; sin embargo, el dataset de entrenamiento es sintético y su licencia no se detalla más allá de la referencia.
- Caveat para producción: el autor no publica latencia, throughput ni pruebas de robustez; el uso en producción requeriría validación propia sobre el dominio objetivo.
- El checkpoint incluye optimizador y discriminadores en `checkpoints/ae_*.pt`, lo que incrementa el tamaño del repo (22,9 GB) y no es necesario para inferencia.

## Enlaces

- Hugging Face: https://huggingface.co/RockTheBoat/MikolAI-kodek-checkpoints
- Dataset de entrenamiento: https://huggingface.co/datasets/HoldForQuake/VoxCPM2-pol-one-voice-367h
- Repositorio de código (blue-codec con correcciones, MIT): https://github.com/adamo1139/syntezujemy_polska_mowe
- Repositorio original de blue-codec: https://github.com/maxmelichov/blue-codec
