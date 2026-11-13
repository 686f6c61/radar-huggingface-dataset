# jmtl/hk-cantonese-cc0-kitten-tts-2-qat

## Resumen

Kitten-TTS 2 para cantonés de Hong Kong es un modelo de síntesis de voz (text-to-speech) desarrollado por el usuario jmtl, un ajuste fino del modelo base KittenML/kitten-tts-2. Su particularidad es que mantiene los 1.400 millones de pesos del transformer en formato ternario (cada peso vale -1, 0 o +1) tras un proceso de entrenamiento con cuantización consciente (QAT), en lugar de redondear a posteriori un ajuste fino convencional. El modelo resuelve un problema concreto: el Kitten-TTS 2 original lee el texto cantonés con pronunciación mandarín, y tras este entrenamiento la tasa de caracteres erróneos detectada por dos reconocedores de voz bajó de aproximadamente uno de cada tres a uno de cada dieciocho.

El modelo se entrenó exclusivamente con 47 horas de grabaciones de dominio público (CC0) de Mozilla Common Voice en cantonés, y es capaz de clonar una voz a partir de unos segundos de audio de referencia. Se distribuye en un único archivo de 1,26 GB que funciona sin conexión, tanto en CPU convencional como en GPU NVIDIA, y cuenta con una build GGUF ejecutable mediante el motor en Rust ggtts, sin necesidad de Python.

Es relevante porque demuestra que el entrenamiento ternario consciente de cuantización conserva la calidad de forma medible frente al redondeo posterior, y porque ofrece TTS cantonés local y privado en un ecosistema donde la mayoría de soluciones dependen de servicios en la nube. Sus principales limitaciones declaradas por el autor son la velocidad (unos 27 s por línea corta en CPU de escritorio) y el escaso alcance de su evaluación, con una sola voz de referencia y un solo oyente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer para TTS (base Kitten-TTS 2), pesos ternarios (-1, 0, +1) con QAT |
| Parametros totales | 1.734.542.336 (aproximadamente 1,4 mil millones en el transformer) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Ternaria (pesos -1/0/+1); pesos empaquetados ("packed"); build GGUF |
| Idiomas soportados | yue (cantonés), zh |
| Licencia | stellon-labs-community-license (license: other) |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo parte de KittenML/kitten-tts-2, un sistema de síntesis de voz con clonación de voz, y aplica un ajuste fino con entrenamiento consciente de cuantización: cada peso se entrena atravesando el redondeo ternario, de modo que el modelo permanece ternario durante todo el proceso en lugar de cuantizarse al final. El autor compara explícitamente este enfoque con el atajo habitual de redondear a ternario un ajuste fino convencional, que según sus mediciones conserva casi ninguna de las mejoras (0,34 y 0,31 de tasa de error frente a 0,06 y 0,05 del modelo QAT).

Los datos de entrenamiento son 47 horas de Mozilla Common Voice en cantonés (dataset JackyHoCL/common_voice_22_yue), exclusivamente grabaciones CC0. No se detalla en la información disponible el número de tokens, la composición exacta del dataset ni si se emplearon técnicas de RLHF o DPO. La build GGUF publicada decodifica exactamente a los pesos entrenados: los 1.734.542.336 valores coinciden, según verificación del autor.

## Capacidades

- Síntesis de voz en cantonés de Hong Kong con pronunciación cantonés (no mandarín) tras el ajuste.
- Clonación de voz a partir de unos segundos de audio de referencia más su transcripción.
- Generación de audio offline, sin servicios en la nube ni cuentas.
- Ejecución en CPU convencional y en GPU NVIDIA.
- Inferencia sin Python mediante la build GGUF y el motor ggtts (Rust, licencia MIT) en Linux y Windows.
- Carga desde Python mediante el paquete oficial kittenml (weights="packed").
- Soporte de idioma zh además de yue, según los metadatos del modelo.
- No se documentan capacidades de tool calling, agentes, visión ni audio de entrada más allá de la referencia de voz.

## Casos de uso

- Lectura de textos en cantonés para aplicaciones de accesibilidad: el modelo convierte texto escrito en cantonés a voz inteligible, corrigiendo el problema de pronunciación mandarín del modelo base, lo que lo hace adecuado para lectores de pantalla y audiolibros en Hong Kong.
- Clonación de voz para doblaje de contenido local: con unos segundos de audio de referencia se puede generar narración con una voz concreta, útil para podcasts, vídeos divulgativos o material educativo en cantonés.
- Asistentes de voz embebidos y privados: al ejecutarse offline desde un archivo de 1,26 GB, encaja en escenarios donde no se puede enviar audio a la nube por privacidad o conectividad, como dispositivos domésticos o entornos sanitarios.
- Prototipado de interfaces de voz en cantonés: desarrolladores que necesitan generar muestras de audio para probar sistemas de diálogo o IVR sin depender de APIs comerciales.
- Investigación en cuantización extrema: el modelo sirve como referencia reproducible de QAT ternario en TTS, con pesos exactos verificados y comparación contra un ajuste fino bf16 no publicado.
- Generación de material de aprendizaje de cantonés: creación de audios de frases coloquiales de Hong Kong a partir de corpus como Common Voice, con la salvedad de que el modelo no es rápido y requiere procesar cada línea por separado.
- Integración en pipelines de preproducción de audio: mediante el paquete Python kittenml o la build GGUF, se puede automatizar la síntesis por lotes de guiones en cantonés en un servidor con GPU.

## Benchmarks y rendimiento

El autor publica tasas de error de caracteres medidas con dos reconocedores de voz sobre líneas de cantonés reservadas para evaluación:

| Metrica | Base sin entrenar | LoRA bf16 (no publicado) | Redondeo posterior a ternario | Este modelo (QAT ternario) |
|---|---|---|---|---|
| Tasa de error, reconocedor 1 | 0,37 | no disponible | 0,34 | 0,06 |
| Tasa de error, reconocedor 2 | 0,32 | no disponible | 0,31 | 0,05 |

En prueba de escucha a ciegas, el oyente prefirió este modelo frente al ajuste fino bf16 entrenado con los mismos datos en 3 de 3 pasajes largos. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, al tratarse de un modelo de TTS.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el archivo pesa 1,26 GB en formato empaquetado, por lo que la huella de memoria es reducida para un modelo de 1,7 mil millones de parámetros en ternario.
- GPU: el autor reporta ejecución en GPU NVIDIA; no se especifican modelos concretos recomendados (A100, H100, RTX 4090 u otros).
- CPU: funciona en CPU de escritorio; el autor reporta unos 27 s por línea corta en CPU y unos 31 s en GPU, con arranque en frío por cada línea en el runtime de línea de comandos.
- Móvil: el autor indica que un teléfono lo ejecuta entre 12 y 16 veces más lento que tiempo real.
- Despliegue: build GGUF con el motor ggtts (Rust, MIT) en Linux y Windows; paquete Python kittenml con pesos "packed"; no se documentan vLLM, llama.cpp, Ollama ni TGI para este modelo.
- Latencia y throughput: no se publican cifras de throughput; la latencia por línea es de decenas de segundos según el autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| jmtl/hk-cantonese-cc0-kitten-tts-2-qat | 1.734.542.336 (ternario) | no disponible | Tasa de error 0,05-0,06 en cantonés | stellon-labs-community-license | Hugging Face, GGUF, Python |
| KittenML/kitten-tts-2 (base) | no disponible | no disponible | Tasa de error 0,32-0,37 en cantonés | no disponible | Hugging Face |
| jmtl/hk-cantonese-cc0-qwen3-tts | no disponible | no disponible | Más natural según el autor; mejor precisión en prosa larga según reconocedores | no disponible | Hugging Face |

El autor señala que su release basado en Qwen3-TTS suena más fluido y es leído con mayor precisión por los reconocedores en pasajes largos, por lo que este modelo ternario no es su opción más natural en cantonés. No se dispone de datos de benchmarks comparables con otros sistemas TTS comerciales en la información proporcionada.

## Limitaciones y advertencias

- Velocidad baja: aproximadamente 27 s por línea corta en CPU de escritorio y 31 s en GPU, con arranque en frío por línea; en móvil, 12 a 16 veces más lento que tiempo real.
- Evaluación limitada: una sola voz de referencia y un solo oyente en la prueba de escucha, según reconoce el autor.
- Calidad inferior a su release Qwen3-TTS en naturalidad y precisión en prosa larga.
- Entrenado solo con 47 horas de Common Voice en cantonés, lo que limita la variedad de voces y estilos.
- Riesgo de alucinación o artefactos de audio no documentado explícitamente; la información disponible no detalla sesgos conocidos.
- Licencia "stellon-labs-community-license" (license: other): es necesario revisar LICENSE.md antes de uso comercial, ya que las condiciones no se detallan en la información disponible.
- El contenido de ejemplo incluye lenguaje coloquial malsonante propio de las grabaciones de Common Voice; conviene filtrar el texto de entrada en producción.
- El autor advierte de que una conversión GGUF anterior era con pérdida y fue retirada; debe usarse la build actual, verificada como exacta.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jmtl/hk-cantonese-cc0-kitten-tts-2-qat
- Build GGUF: https://huggingface.co/jmtl/hk-cantonese-cc0-kitten-tts-2-qat-GGUF
- Modelo base: https://huggingface.co/KittenML/kitten-tts-2
- Release Qwen3-TTS del mismo autor: https://huggingface.co/jmtl/hk-cantonese-cc0-qwen3-tts
- Motor ggtts (Rust, MIT): https://github.com/dandelion-love/ggtts
- Dataset de entrenamiento: https://huggingface.co/datasets/JackyHoCL/common_voice_22_yue
- Muestras de audio: https://huggingface.co/jmtl/hk-cantonese-cc0-kitten-tts-2-qat/tree/main/samples
