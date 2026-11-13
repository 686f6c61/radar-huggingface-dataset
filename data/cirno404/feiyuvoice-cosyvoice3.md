# Cirno404/FeiyuVoice-CosyVoice3

## Resumen

FeiyuVoice-CosyVoice3 es un modelo de síntesis de voz (text-to-speech) orientado a voces de personaje, desarrollado por el usuario Cirno404 y publicado en Hugging Face. Se construye como un ajuste fino del modelo base FunAudioLLM/Fun-CosyVoice3-0.5B-2512, un modelo TTS de 0,5 mil millones de parámetros mantenido por FunAudioLLM. El resultado es un modelo con dos estilos de voz diferenciados ("Cute F6" y "Gentle C3"), pensado para dar voz a personajes concretos en aplicaciones interactivas.

El modelo resuelve el problema de generar voces con identidad y estilo consistentes sin necesidad de entrenar un sistema TTS desde cero. Al derivar de CosyVoice3, hereda la arquitectura y el pipeline del modelo base, y añade referencias de audio específicas para cada personaje. La versión publicada es la 1.0.1, descrita por el autor como "lossless": solo se reorganizaron duplicados de almacenamiento sin modificar ningún tensor, sin cuantización ni cambios en las matemáticas de inferencia.

Es relevante para desarrolladores que necesiten integrar voces de personaje en asistentes conversacionales, agentes de voz o videojuegos, especialmente en entornos Windows con WSL y GPU NVIDIA, que es el escenario para el que el autor ha preparado los scripts de arranque. El repositorio ocupa 7,4 GB e incluye los pesos en safetensors junto con artefactos ONNX.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (derivada de FunAudioLLM/Fun-CosyVoice3-0.5B-2512) |
| Parametros totales | 0,5 mil millones (heredados del modelo base) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (la versión 1.0.1 no aplica cuantización) |
| Idiomas soportados | chino (zh), inglés (en) |
| Licencia | no disponible a nivel de repositorio; los componentes upstream conservan Apache-2.0 |
| Formato de pesos | safetensors, ONNX |

## Arquitectura y entrenamiento

El modelo se basa en FunAudioLLM/Fun-CosyVoice3-0.5B-2512, del que hereda la arquitectura TTS y el pipeline de inferencia. La model card no detalla la arquitectura interna (tipo de decoder, tokenizador de audio o esquema de atención), por lo que esos datos figuran como no disponibles. El ajuste fino introduce dos voces: "Cute F6", entrenada con 40 actualizaciones más una referencia N01, y "Gentle C3", que según el autor emplea el LLM original con una referencia N10. Los componentes compartidos entre ambas voces están incluidos en el repositorio.

El entrenamiento se realizó sobre material de audio original del creador de contenido 星落落_oi (Bilibili), con autorización explícita del autor original para el entrenamiento del banco de voces, según se documenta en COPYRIGHT.md. La revisión upstream fijada es `29e01c4e8d000f4bcd70751be16fa94bf3d85a18`. La versión 1.0.1 se describe como sin pérdida: solo se volvió a compartir el almacenamiento duplicado de F6, manteniendo cada tensor bit a bit idéntico, y ambas voces pasaron una regresión de audio muestra a muestra en 10 condiciones. No se especifican volúmenes de tokens, composición del dataset ni si hubo RLHF o DPO.

## Capacidades

- Síntesis de voz a partir de texto (text-to-speech) en chino e inglés.
- Dos estilos de voz de personaje diferenciados: "Cute F6" y "Gentle C3", seleccionables en tiempo de inferencia mediante el parámetro `-Style`.
- Salida de audio a 24 kHz en formato FLOAT nativo (`native.wav`) y PCM16 (`speech.wav`).
- Generación de metadatos de procedencia en JSON por cada inferencia, incluyendo el SHA de la configuración local.
- Integración con un entorno CosyVoice externo mediante scripts de PowerShell sobre WSL2.
- Soporte de un servicio de voz y guía de instalación para agentes (plugin AstrBot), con backend CUDA o ROCm bajo WSL.
- No se documentan capacidades de tool calling, razonamiento multi-paso, visión ni audio de entrada.

## Casos de uso

- Doblaje de personajes en videojuegos indie: el modelo permite asignar una voz consistente a un personaje concreto ("Cute F6" o "Gentle C3") y generar líneas de diálogo desde texto, evitando contratar grabaciones para cada frase.
- Asistentes conversacionales con personalidad: integrado en un agente de voz (el autor proporciona un plugin para AstrBot), el modelo puede responder con una voz de personaje estable en chino o inglés.
- Producción de contenido para creadores: generación de narraciones o voces de personaje para vídeos, con salida PCM16 lista para montaje y JSON de procedencia para trazabilidad.
- Prototipado rápido de interfaces de voz: el script `Speak.ps1` permite validar frases en segundos (`-Text '...' -Play`) antes de integrar el modelo en un pipeline mayor.
- Localización de contenido audiovisual: al soportar chino e inglés, puede emplearse para generar versiones de voz en ambos idiomas a partir del mismo guion.
- Investigación en TTS de personaje: sirve como punto de partida para estudiar el ajuste fino de CosyVoice3 con referencias de audio cortas y evaluar la consistencia de estilo entre voces.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente menciona una regresión de audio muestra a muestra en 10 condiciones para validar la versión 1.0.1, sin métricas objetivas (MOS, WER, similitud de hablante) ni comparaciones numéricas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 0,5 mil millones de parámetros y pesos en safetensors, el modelo es ligero y cabe holgadamente en GPUs de consumo, aunque el autor no publica cifras.
- GPU recomendadas: el autor exige una GPU NVIDIA con driver compatible con WSL; también se documenta un backend ROCm bajo WSL para AMD, aunque el autor indica que las tarjetas AMD físicas no han sido probadas.
- Entorno de software obligatorio: Windows PowerShell 5.1+, WSL2 Ubuntu 24.04, Python 3.11 y PyTorch 2.11.0+cu128, con un entorno CosyVoice instalado por separado en el commit `074ca6dc9e80a2f424f1f74b48bdd7d3fea531cc`.
- Opciones de despliegue: scripts `Speak.ps1` sobre WSL2 con el runtime CosyVoice; servicio de voz para agentes según INSTALL_AGENT.md. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (son runtimes de LLM, no aplicables directamente a este TTS).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| FeiyuVoice-CosyVoice3 | 0,5 B | zh, en | no disponible (upstream Apache-2.0) | safetensors, ONNX | Dos voces de personaje, runtime WSL |
| FunAudioLLM/Fun-CosyVoice3-0.5B-2512 | 0,5 B | no disponible en esta ficha | Apache-2.0 | no disponible en esta ficha | Modelo base del que deriva |
| Otras alternativas TTS de personaje | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la información proporcionada |

La comparación cuantitativa con otros sistemas TTS de código abierto (XTTS, Bark, Fish Speech u otros) no está disponible en la información proporcionada, por lo que no se incluyen cifras de rendimiento relativo.

## Limitaciones y advertencias

- Solo soporta chino e inglés; no hay evidencia de otros idiomas.
- El repositorio no asigna una licencia propia a las contribuciones locales ni a los activos de personaje; solo los componentes upstream conservan Apache-2.0. El uso comercial de las voces de personaje queda en una zona legal ambigua y requiere revisar COPYRIGHT.md y NOTICE.md.
- El material de audio original proviene de un tercero (星落落_oi) y su uso está autorizado para el entrenamiento del banco de voces, pero la model card advierte que la atribución de la fuente no sustituye los términos de distribución existentes.
- El runtime no es un ejecutable autónomo: requiere WSL2, una versión fijada de PyTorch y un entorno CosyVoice instalado aparte, lo que complica el despliegue en producción y en máquinas nuevas (el autor indica que la configuración en máquinas nuevas debe validarse).
- El backend ROCm para AMD está adaptado pero no probado en hardware físico AMD.
- Riesgo de alucinación y sesgos: no documentado en la información disponible; al ser un modelo TTS, el riesgo principal es la pronunciación incorrecta de textos numéricos, que sigue el fallback del frontend del runtime original.
- El comportamiento con texto numérico depende del frontend heredado, lo que puede producir lecturas no deseadas en producciones automatizadas.
- El repositorio tiene 0 descargas y 1 like en el momento de la consulta, lo que indica escasa validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Cirno404/FeiyuVoice-CosyVoice3
- Modelo base: https://huggingface.co/FunAudioLLM/Fun-CosyVoice3-0.5B-2512
- Repositorio CosyVoice: https://github.com/FunAudioLLM/CosyVoice
- Guía de instalación del servicio de voz y agente: https://github.com/Esmerubphire/astrbot_plugin_feiyu_voice/blob/main/server/INSTALL_AGENT.md
- CLI oficial de Hugging Face: https://huggingface.co/docs/huggingface_hub/en/guides/cli
- Fuente del audio original (Bilibili): https://space.bilibili.com/30584746/
