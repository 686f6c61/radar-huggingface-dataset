# gdiamos/hey-claude

## Resumen

El modelo `hey-claude` es un detector de palabra de activación (wake word) para la frase "hey Claude", desarrollado por gdiamos sobre la librería openWakeWord. Está diseñado para ejecutarse localmente en CPU, con un tamaño de aproximadamente 200 KB, sin necesidad de GPU ni conexión a red. Su arquitectura combina un embedding de audio congelado de openWakeWord con una cabeza DNN de 32 unidades, y fue entrenado íntegramente con voz sintética generada mediante Piper TTS en un MacBook Air M2, en unos 8 minutos.

El modelo resuelve el problema de activación por voz en dispositivos embebidos o asistentes locales, ofreciendo una alternativa ligera y sin dependencias externas. Sin embargo, el autor incluye una advertencia explícita: esta versión no debe utilizarse, ya que despierta con el silencio de la habitación, produciendo aproximadamente 4.000 falsos disparos por hora en un micrófono real. La causa es que el entrenamiento solo incluyó audio con sonido, dejando el silencio fuera del espacio de datos visto. Se indica que una versión corregida está en preparación.

A pesar de su estado no recomendado, el modelo es relevante como ejemplo de entrenamiento sintético de wake words y de los riesgos asociados a la falta de cobertura de silencio en los datos. Su licencia Apache 2.0 permite uso comercial, pero las limitaciones actuales lo hacen inadecuado para producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Embedding de audio congelado de openWakeWord + DNN de 32 unidades |
| Parametros totales | No disponible (cabeza DNN de 32 unidades, embedding congelado) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (audio, ventana de 80 ms / 1280 muestras a 16 kHz) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Inglés (solo, con voces US/UK) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (hey_claude.onnx) |

## Arquitectura y entrenamiento

La arquitectura se compone de un embedding de audio preentrenado y congelado de openWakeWord, seguido de una cabeza DNN de 32 unidades que produce una puntuación de activación por ventana de 80 ms. El entrenamiento fue 100% sintético: se generaron miles de pronunciaciones de "hey Claude" con Piper TTS usando 11 voces (aproximadamente 1.030 hablantes de 4 corpus), y se filtraron con Whisper para descartar clips que no pronunciaran claramente la frase. Los negativos incluyeron frases fonéticamente similares (adversariales) y características negativas precomputadas de openWakeWord (262.626 ventanas, un 4,7% del dataset ACAV100M-2000h). Se usaron 2.000 positivos de entrenamiento y 400 de prueba, 6.000 negativos de entrenamiento y 1.200 de prueba, con 50.000 pasos de optimización en CPU.

El autor documenta tres lecciones clave del proceso: no incluir homófonos en los negativos (degradó la recall de 100% a 40%), verificar que las voces TTS puedan pronunciar la frase (algunas fallan al 0%), y generar ambas clases con las mismas voces para evitar que el modelo separe por timbre en lugar de por contenido.

## Capacidades

- Detección de la frase "hey Claude" en audio de 16 kHz mono, procesado en chunks de 80 ms.
- Funciona en CPU sin GPU ni conexión a red, con un tamaño de ~200 KB.
- Soporta umbral configurable (por defecto 0.5; se recomienda subir a 0.6 si hay hablantes llamados Clyde).
- Integración con openWakeWord mediante el framework de inferencia ONNX.
- Solo inglés, con voces que sesgan a acentos US/UK.
- No incluye capacidades de tool calling, agentes, visión ni generación de texto; es exclusivamente un clasificador de audio.

## Casos de uso

- Asistentes de voz locales: activar un asistente en un dispositivo embebido (Raspberry Pi, etc.) sin depender de servicios en la nube, gracias a su bajo consumo y tamaño reducido.
- Automatización del hogar: control por voz de luces, termostatos o persianas mediante una palabra de activación local, con privacidad total al no enviar audio a servidores.
- Accesibilidad: permitir a personas con movilidad reducida interactuar con dispositivos mediante comandos de voz, usando un modelo ligero que corre en hardware modesto.
- Prototipado rápido: al ser entrenable en minutos con TTS sintético, sirve como base para experimentar con otras frases de activación o para investigar el impacto de datos sintéticos en wake word detection.
- Investigación en detección de palabras de activación: analizar el comportamiento de modelos pequeños ante homófonos, silencio y variabilidad de voces, como caso de estudio documentado.
- Educación: ejemplo práctico de entrenamiento de un clasificador de audio con datos sintéticos y despliegue en CPU, útil en cursos de ML aplicado.

Nota: debido a la advertencia del autor, estos casos de uso son potenciales, pero no se recomienda su uso en producción hasta que se publique la versión corregida.

## Benchmarks y rendimiento

El autor proporciona puntuaciones pico (peak score) sobre clips de voz sintética de macOS (voces no usadas en entrenamiento), con 5 voces por frase. Cada clip se rellena con silencio y se procesa con un modelo recién construido.

| Frase | Puntuación pico | Comportamiento |
|---|---|---|
| "hey claude" | 0.997 (en 3 de 5 voces) | Despierta |
| "hey clyde" | 0.484 | Silencioso, pero con poco margen |
| "hey cloud" | 0.001 | Silencioso |
| "hey claire" | 0.001 | Silencioso |
| "okay cloud" | 0.001 | Silencioso |
| "grey cloud" | 0.000 | Silencioso |
| "hey jarvis" | 0.001 | Silencioso |
| "what is the weather today" | 0.004 | Silencioso |
| "can you play some music please" | 0.001 | Silencioso |
| "I think the cloud is going to rain" | 0.001 | Silencioso |
| "let us go outside and play" | 0.002 | Silencioso |
| "he clawed at the door" | 0.676 | Homófono, falso positivo |

Además, en clips reservados no usados en entrenamiento, el 90% de los positivos activan el modelo y el 7% de los negativos adversariales lo activan falsamente. No se han publicado resultados de benchmarks comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- Inferencia en CPU: el modelo pesa ~200 KB y está diseñado para ejecutarse en tiempo real en procesadores de bajo consumo, sin GPU.
- Entrenamiento: se realizó en un MacBook Air M2, solo CPU, en aproximadamente 8 minutos.
- Despliegue: compatible con openWakeWord (framework ONNX) en Python; se puede integrar en aplicaciones que consuman chunks de 1280 muestras a 16 kHz.
- Latencia y throughput: no se proporcionan cifras exactas, pero al ser un modelo de 32 unidades sobre un embedding congelado, se espera una latencia muy baja (del orden de milisegundos por chunk).
- No requiere GPU ni aceleradores específicos; cualquier CPU moderna es suficiente.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos de wake word en la información proporcionada. El autor no incluye métricas de modelos alternativos como "hey google", "alexa" u otros modelos de openWakeWord. Se puede señalar que openWakeWord ofrece otros wake words preentrenados, pero no se han facilitado sus especificaciones ni rendimiento en esta documentación.

## Limitaciones y advertencias

- El autor advierte explícitamente: "Do not use this version". El modelo despierta con el silencio de la habitación, con aproximadamente 4.000 falsos disparos por hora y puntuaciones de hasta 0.99 sin nadie hablando. Subir el umbral no resuelve el problema.
- Homófonos: "clawed" (0.676) y "Clyde" (0.484) pueden causar falsos positivos; "clawed" comparte los mismos fonemas que "Claude" y no es corregible mediante entrenamiento.
- Algunas voces no activan el modelo: de cinco voces de macOS, dos puntúan cerca de cero; se recomienda bajar el umbral si no despierta.
- Solo inglés, con sesgo hacia acentos US/UK.
- Las falsas alarmas en periodos largos no están caracterizadas: el entrenamiento usó solo un 4,7% del dataset de características negativas de openWakeWord, y las pruebas se hicieron con clips limpios, no con horas de televisión o ruido ambiental real.
- No apto para producción en su estado actual; se espera una versión corregida.

## Enlaces

- HuggingFace: https://huggingface.co/gdiamos/hey-claude
- Piper TTS (usado para generar datos sintéticos): https://github.com/rhasspy/piper
- openWakeWord (librería base, mencionada en la documentación): no se proporciona URL explícita en la model card, pero es referenciada como framework de entrenamiento e inferencia.
