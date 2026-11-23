# Lysandra999/Senik-Wake-STT-Small

## Resumen

Senik-Wake-STT-Small es un modelo de reconocimiento automático del habla (ASR) especializado en la detección y transcripción de la palabra de activación "Senik" en un contexto de conversación natural. Lo desarrolla Lysandra999 (autoría atribuida a Nikolas Perez) como parte de la familia Senik AI, un ecosistema de modelos ligeros orientados a dispositivos edge. El modelo parte de la arquitectura Whisper y cuenta con 241.734.912 parámetros totales, con pesos en formato safetensors.

El modelo resuelve un problema concreto: detectar de forma fiable una wake-word independientemente del tono del hablante y de la posición de la palabra dentro de la frase. Según la model card, se entrenó con grabaciones multiparlante de "Senik" aumentadas en tono entre -4 y +4 semitonos y se evaluó con hablantes no vistos en -3/+3 semitonos, obteniendo 10/10 aciertos exactos frente a 0/10 de una línea base sin ajuste.

Es relevante para desarrolladores que construyen asistentes de voz siempre activos en hardware limitado: el modelo es pequeño (repo de 1,0 GB), está pensado para edge-AI y se distribuye bajo licencia MIT, lo que facilita su integración en pipelines locales con transformers. Su alcance es deliberadamente estrecho: no es un ASR generalista, sino un componente especializado dentro del bucle de conversación de Senik.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Whisper (transformer encoder-decoder para ASR) |
| Parametros totales | 241.734.912 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors) |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Whisper, un transformer encoder-decoder diseñado para reconocimiento automático del habla, según indican los tags y la pipeline declarada (automatic-speech-recognition). El repositorio incluye el processor y el tokenizer completos, lo que permite ejecutar inferencia local directamente con las pipelines estándar de transformers. El tamaño de 241,7 millones de parámetros es coherente con una variante pequeña de la familia Whisper.

En cuanto al entrenamiento, la model card indica que se usaron grabaciones multiparlante de la palabra "Senik" con aumento de tono en el rango de -4 a +4 semitonos, y que la evaluación se realizó sobre hablantes no vistos con desplazamientos de -3/+3 semitonos. No se especifican el número total de tokens de audio, la composición exacta del dataset, ni si hubo etapas de RLHF o DPO. La innovación destacable es el diseño pitch-invariant y la capacidad de detección "wake-anywhere", es decir, que la palabra de activación se detecta al principio, en medio o al final de una frase natural, lo que habilita el bucle de conversación de seguimiento de 3,0 segundos del asistente Senik.

## Capacidades

- Reconocimiento automático del habla (speech-to-text) en inglés.
- Detección de wake-word ("Senik") invariante al tono del hablante.
- Detección de la wake-word en cualquier posición de la frase (inicio, medio o final).
- Transcripción de audio a texto mediante pipelines estándar de transformers.
- Inclusión de processor y tokenizer para inferencia local sin dependencias adicionales.
- Orientado a despliegue en edge (edge-ai) por su tamaño reducido.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-step: no disponible.
- Capacidades multilingües: no, solo inglés.
- Capacidades especiales (visión, audio generativo, thinking mode): no disponible.

## Casos de uso

- Asistentes de voz siempre activos: el modelo se usa como primera etapa de un pipeline de activación por voz, detectando "Senik" en audio continuo capturado por micrófono y disparando el resto del asistente solo cuando se pronuncia la wake-word.
- Bucle de conversación de seguimiento: gracias a la detección "wake-anywhere", el modelo permite mantener una ventana de escucha de 3,0 segundos tras la activación para capturar la petición del usuario sin exigir que la wake-word abra la frase.
- Integración en dispositivos edge con recursos limitados: con 241,7 M de parámetros y pesos safetensors, puede ejecutarse en hardware de bajo consumo (Raspberry Pi, mini-PC, SoC con acelerador) dentro de un asistente local sin depender de la nube.
- Transcripción de comandos cortos en inglés: útil en aplicaciones de domótica o control por voz donde el vocabulario es reducido y la latencia importa más que la cobertura lingüística general.
- Prototipado rápido con transformers: al incluir processor y tokenizer, un desarrollador puede cargar el modelo con la pipeline `automatic-speech-recognition` y validar la detección de wake-word en minutos.
- Filtro previo en sistemas de dictado: usar el modelo como etapa de verificación de activación antes de enviar el audio a un ASR más grande, reduciendo coste computacional y llamadas a modelos mayores.
- Investigación sobre robustez de wake-words: el enfoque pitch-augmented y la evaluación con hablantes no vistos sirven como referencia para experimentos de invariancia al tono en detección de palabras clave.

## Benchmarks y rendimiento

La model card reporta una evaluación propia de precisión de wake-word sobre hablantes no vistos:

| Metrica | Resultado |
|---|---|
| Precisión wake-word en hablantes no vistos (-3/+3 semitonos) | 10/10 (100%) aciertos exactos de "Senik" |
| Línea base sin ajuste (misma prueba) | 0/10 (0%) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, WER en LibriSpeech u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 241,7 M de parámetros en safetensors (aproximadamente 0,97 GB en fp32 o 0,48 GB en fp16), la huella de memoria es reducida y cabe holgadamente en GPUs de consumo.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM para fp16; tarjetas como RTX 3060, RTX 4060 o superiores son más que suficientes. Para despliegues en servidor, A100 o H100 no son necesarias para este tamaño.
- Cabe en consumer GPU: sí, en la práctica totalidad de GPUs de consumo actuales, e incluso en CPU para inferencia en tiempo real con audio de baja frecuencia de muestreo.
- Opciones de despliegue: transformers (pipeline `automatic-speech-recognition`), y potencialmente servidores compatibles con modelos Whisper; no se confirma soporte de vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Enfoque |
|---|---|---|---|---|---|
| Senik-Wake-STT-Small | 241,7 M | no disponible | en | MIT | Wake-word + ASR especializado |
| Whisper Small (OpenAI) | 244 M | 30 s de audio (ventana estándar) | multilingüe | MIT | ASR generalista |
| Whisper Base (OpenAI) | 74 M | 30 s de audio (ventana estándar) | multilingüe | MIT | ASR generalista ligero |
| Modelos de wake-word dedicados (p. ej. Porcupine) | no disponible | no disponible | varios | propietaria / variable | Detección de palabra clave |

La comparación con Whisper Small es la más directa por tamaño y linaje arquitectónico: Senik-Wake-STT-Small está especializado en una única wake-word y un único idioma, mientras que Whisper Small es un ASR generalista multilingüe. Frente a motores de wake-word comerciales, la ventaja de Senik es su licencia MIT y su naturaleza abierta; la desventaja es la ausencia de benchmarks estándar publicados.

## Limitaciones y advertencias

- El modelo solo soporta inglés; no se ha validado para otros idiomas.
- Está especializado en la wake-word "Senik"; su utilidad como ASR generalista es limitada y no se han publicado métricas de WER general.
- Los resultados de precisión (10/10) provienen de una evaluación interna con una muestra pequeña; no constituyen una validación estadísticamente robusta.
- No se especifican sesgos conocidos ni la composición demográfica de los hablantes de entrenamiento, lo que impide evaluar sesgos de acento, género o edad.
- Riesgo de alucinación: inherente a los modelos encoder-decoder de ASR; puede transcribir texto espurio en audio ruidoso o silencioso.
- No se documentan la longitud de contexto de audio ni la frecuencia de muestreo esperada más allá de lo que impone el processor de Whisper.
- La licencia MIT permite uso comercial, pero el autor no ofrece garantías ni soporte; conviene validar el modelo en el dominio objetivo antes de producción.
- El ecosistema Senik AI Family es muy reciente (repositorio creado en noviembre de 2026) y con pocas descargas (65), por lo que la madurez y el mantenimiento a largo plazo no están contrastados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Lysandra999/Senik-Wake-STT-Small
- Senik-Quantum-1.7B-GGUF: https://huggingface.co/Lysandra999/Senik-Quantum-1.7B-GGUF
- Senik-Dense-2B-GGUF: https://huggingface.co/Lysandra999/Senik-Dense-2B-GGUF
- Mini-Senik-0.8B-Agent-GGUF: https://huggingface.co/Lysandra999/Mini-Senik-0.8B-Agent-GGUF
- Mini-Senik-0.3B-GGUF: https://huggingface.co/Lysandra999/Mini-Senik-0.3B-GGUF
- Watch-Senik-0.3B-Dec: https://huggingface.co/Lysandra999/Watch-Senik-0.3B-Dec
- Senik-Voice-82M: https://huggingface.co/Lysandra999/Senik-Voice-82M
- Senik-Voice-Expressive-0.5B: https://huggingface.co/Lysandra999/Senik-Voice-Expressive-0.5B
