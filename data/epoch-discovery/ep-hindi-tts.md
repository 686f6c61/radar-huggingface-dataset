# epoch-discovery/ep-hindi-tts

## Resumen

ep-hindi-tts es un modelo de síntesis de voz (text-to-speech) en hindi desarrollado por la organización epoch-discovery. Se construye como un ajuste fino (finetune) del modelo de lenguaje google/gemma-3-270m, al que se acopla un decodificador de audio basado en NeuCodec para convertir la representación interna del texto en audio. El resultado es un sistema TTS compacto, con 352 millones de parámetros en total, orientado explícitamente al despliegue en dispositivo (on-device), sin conexión y sobre CPU, incluyendo equipos Mac y entornos de borde (edge).

El modelo está especializado en un único idioma, el hindi (código `hi`, escritura devanagari), y forma parte del ecosistema de modelos pequeños de la familia Gemma 3. Su propuesta de valor es ofrecer síntesis de voz en hindi con requisitos de hardware mínimos, algo relevante para aplicaciones de accesibilidad y tecnología asistiva en contextos donde no hay conectividad o donde el cómputo en la nube no es viable.

La relevancia actual del modelo radica en su tamaño reducido (352 M de parámetros, repositorio de 1,1 GB) y en su enfoque de licencia Gemma con acceso restringido (gated), lo que lo sitúa en la intersección entre modelos ligeros de código abierto y despliegues de producción en dispositivos de gama baja. No se han publicado resultados de benchmarks en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Modelo de lenguaje Gemma 3 (270M) con decodificador de audio NeuCodec |
| Parámetros totales | 352.028.416 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (pesos en safetensors; se desconoce si hay versiones GGUF/ONNX publicadas) |
| Idiomas soportados | Hindi (`hi`, devanagari) |
| Licencia | Gemma |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de google/gemma-3-270m, un transformer decoder-only de la familia Gemma 3, y se ajusta para la tarea de síntesis de voz en hindi. La salida del modelo de lenguaje se conecta a un decodificador de audio NeuCodec, que transforma las representaciones latentes en señal de audio. El etiquetado del repositorio indica un finetune del modelo base (`base_model:finetune:google/gemma-3-270m`), aunque no se detalla en la información disponible el volumen de datos de entrenamiento, la composición del corpus de audio en hindi ni si se aplicaron técnicas de RLHF o DPO.

El diseño está optimizado para inferencia en dispositivo: el tamaño total de 352 M de parámetros y el repositorio de 1,1 GB apuntan a un modelo pensado para ejecutarse en CPU y en hardware de borde. No se dispone de información sobre innovaciones técnicas adicionales como decodificación especulativa, atención lineal o variantes híbridas SSM.

## Capacidades

- Síntesis de voz (text-to-speech) en hindi a partir de texto en devanagari.
- Generación de audio orientada a despliegue on-device, sin conexión y en CPU.
- Modelo especializado en un único idioma, sin cobertura multilingüe declarada.
- No se ha documentado soporte de tool calling, function calling ni razonamiento multi-paso orientado a agentes.
- No se ha documentado capacidad de visión, audio de entrada ni modo de razonamiento explícito (thinking mode).
- Uso previsto en accesibilidad y tecnología asistiva, según los tags del repositorio.

## Casos de uso

- Lectura de pantalla para personas con discapacidad visual: el modelo puede convertir texto en hindi en voz sintetizada directamente en el dispositivo, sin depender de servicios en la nube, gracias a su tamaño de 352 M de parámetros y su orientación a CPU.
- Aplicaciones de accesibilidad en dispositivos de gama baja: al caber en hardware de borde y no requerir GPU, permite integrar TTS en teléfonos y equipos con recursos limitados.
- Asistentes de voz offline en hindi: útil en entornos sin conectividad (zonas rurales, aviones, entornos industriales) donde se necesita síntesis de voz local.
- Sistemas de navegación y avisos por voz en hindi: la inferencia en dispositivo reduce la latencia y evita el envío de datos a servidores externos.
- Herramientas educativas de aprendizaje de hindi: lectura en voz alta de material didáctico en devanagari con un modelo ligero que puede ejecutarse en portátiles convencionales.
- Prototipado rápido de aplicaciones TTS en hindi: el repositorio de 1,1 GB y los pesos en safetensors facilitan la experimentación local antes de escalar a soluciones mayores.
- Integración en dispositivos Mac y entornos de borde: el etiquetado `mac` y `edge` sugiere despliegues en equipos de escritorio Apple y hardware embebido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de 352 M de parámetros con pesos en safetensors, la huella en memoria ronda los 1,4 GB en precisión FP16 (2 bytes por parámetro) y aproximadamente 0,7 GB en cuantización de 8 bits; el tamaño del repositorio es de 1,1 GB.
- GPU recomendadas: no se especifican; el modelo está etiquetado como `cpu`, `on-device` y `edge`, por lo que no requiere GPU dedicada.
- Compatibilidad con GPU de consumo: por su tamaño, cabría en cualquier GPU de consumo moderna (RTX 3060, RTX 4090, etc.), aunque el diseño apunta a ejecución en CPU.
- Opciones de despliegue: no se detallan en la información disponible; no se confirma soporte de vLLM, llama.cpp, Ollama o TGI, y el formato publicado es safetensors.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idioma | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ep-hindi-tts | 352 M | No disponible | Hindi | Gemma | Gated en Hugging Face |
| google/gemma-3-270m | 270 M (base) | No disponible | Multilingüe (base) | Gemma | Público |
| Alternativas TTS en hindi | No disponible | No disponible | Hindi | No disponible | No disponible |

No se dispone de información sobre otros modelos TTS comparables en la misma categoría (TTS en hindi, on-device) para establecer una comparación cuantitativa de rendimiento.

## Limitaciones y advertencias

- Modelo especializado exclusivamente en hindi; no cubre otros idiomas ni variantes regionales más allá de lo declarado.
- Riesgo de alucinación y de errores de pronunciación en texto ambiguo, sin datos publicados sobre tasas de error.
- No se han documentado sesgos conocidos ni evaluaciones de calidad de audio o inteligibilidad.
- Licencia Gemma: el uso comercial está sujeto a los términos de la licencia Gemma, que impone restricciones y obligaciones específicas; es necesario revisarlos antes de un despliegue en producción.
- Acceso restringido (gated): requiere aceptar las condiciones en Hugging Face antes de descargar los pesos, lo que puede complicar la automatización de pipelines.
- No se dispone de información sobre longitud de contexto, cuantizaciones soportadas ni formatos alternativos de despliegue (GGUF, ONNX), lo que limita la planificación de producción.
- Al ser un finetune de un modelo de 270 M de parámetros, la calidad de la síntesis puede ser inferior a la de sistemas TTS de mayor tamaño.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/epoch-discovery/ep-hindi-tts
- Perfil de la organización: https://huggingface.co/epoch-discovery
- Modelo base: https://huggingface.co/google/gemma-3-270m
