# LiquidAI/LFM3-Omni-2B-MLX-8bit

## Resumen

LFM3-Omni-2B-MLX-8bit es la version cuantizada a 8 bits en formato MLX del modelo LFM3-Omni-2B de Liquid AI, disenada especificamente para ejecucion en Apple Silicon. Se trata de un modelo "any-to-any" (cualquier modalidad a cualquier modalidad) que integra texto, vision y audio en una unica arquitectura de aproximadamente 2.166 millones de parametros, con soporte para reconocimiento de voz (ASR), sintesis de voz (TTS) y respuesta a preguntas sobre imagenes, todo ello en un unico modelo.

El modelo base LFM3-Omni-2B pertenece a la familia LFM3 de Liquid AI, una generacion de modelos disenados para despliegue eficiente en dispositivos. Esta variante MLX aplica cuantizacion afin de 8 bits con grupos de 64 al backbone de lenguaje, mientras que la torre de vision, el proyector, el codificador y proyector de audio, el decodificador de profundidad y el codec de audio se mantienen en BF16. El resultado son 2,71 GB de pesos mas 0,15 GB del codec de audio, lo que lo hace viable en equipos con memoria unificada moderada.

Su relevancia actual radica en la combinacion de capacidades multimodales completas (audio de entrada y salida, vision, texto) en un tamano de 2B parametros y con soporte para 23 idiomas, lo que lo posiciona como una opcion practica para aplicaciones de voz e interaccion multimodal en local, sin depender de APIs en la nube. Requiere MLX-VLM 0.7.11 o superior para su uso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (modelo multimodal any-to-any con backbone de lenguaje, torre de vision, encoder/proyector de audio, decodificador de profundidad y codec de audio) |
| Parametros totales | 2.166.928.384 (2,17B) |
| Parametros activos | No disponible (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | 8 bits (afin, grupos de 64) en el backbone de lenguaje; BF16 en vision, audio, decodificador de profundidad y codec |
| Idiomas soportados | 23: en, ar, zh, fr, de, it, ja, ko, pt, es, vi, th, id, hi, ru, pl, da, el, fi, he, nl, sv, tr |
| Licencia | lfm1.0 (other) |
| Formato de pesos | safetensors (MLX), con codec de audio en `audio_tokenizer/` |
| Tamano de pesos | 2,71 GB + 0,15 GB (codec de audio) |
| Libreria | mlx (MLX-VLM >= 0.7.11) |
| Pipeline | any-to-any |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna completa del modelo base. La model card de esta variante cuantizada describe una estructura multimodal compuesta por un backbone de lenguaje, una torre de vision con su proyector, un codificador y proyector de audio, un decodificador de profundidad y un codec de audio separado en el directorio `audio_tokenizer/`. Esta organizacion es coherente con un modelo any-to-any que procesa y genera texto, audio e imagenes.

En cuanto a la cuantizacion, el backbone de lenguaje emplea cuantizacion afin de 8 bits con grupos de 64, mientras que los componentes de vision y audio permanecen en BF16, lo que preserva la calidad de las modalidades no textuales. El autor indica que 8 bits es el equilibrio recomendado entre tamano y precision. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO en la informacion proporcionada.

## Capacidades

- Generacion de texto y razonamiento en 23 idiomas.
- Reconocimiento automatico de voz (ASR) con prompts de sistema para controlar el idioma de transcripcion.
- Sintesis de voz (TTS) con salida WAV a 24 kHz, con control de idioma y voz mediante prompts de sistema.
- Respuesta a preguntas sobre imagenes (VQA) basada en el contenido visual.
- Procesamiento any-to-any: combinacion de entradas y salidas en texto, audio e imagen.
- Control de la modalidad de salida mediante parametros (`--output-modality audio`).
- Decodificacion configurable: greedy para texto (`--temperature 0`) y muestreo para audio (`audio_temperature=0.4`, `audio_repetition_penalty=1.2`).
- Soporte de prompts de sistema para definir tareas (ASR, TTS, VQA, etc.).
- No se especifica soporte de tool calling ni de agentes multi-paso en la informacion disponible.

## Casos de uso

- Transcripcion de reuniones y notas de voz: el modelo realiza ASR en cualquiera de los 23 idiomas soportados mediante un prompt de sistema, lo que permite transcribir audio localmente en un Mac sin enviar datos a la nube.
- Lectura de documentos en voz alta: con TTS a 24 kHz y control de idioma y voz, se puede convertir texto en audio para accesibilidad o consumo en movilidad.
- Asistentes de voz conversacionales: la combinacion de ASR y TTS en un mismo modelo permite construir bucles speech-to-speech completos en local, con baja dependencia de servicios externos.
- Descripcion de imagenes para accesibilidad: el modelo responde preguntas sobre imagenes (por ejemplo, leer carteles o identificar objetos), adecuado para aplicaciones de asistencia visual en dispositivos Apple.
- Procesamiento multimodal de documentos: extraccion de informacion combinando imagen y texto, util para digitalizar formularios o tickets con preguntas guiadas.
- Prototipado rapido en Apple Silicon: gracias a su tamano de 2,71 GB y a MLX-VLM, sirve para experimentar con pipelines multimodales en portatiles sin GPU dedicada.
- Aplicaciones multilingues de atencion al cliente: con 23 idiomas, puede gestionar interacciones de voz y texto en mercados diversos desde un unico modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria estimada: 2,71 GB de pesos mas 0,15 GB del codec de audio; se recomienda memoria unificada adicional para el estado de inferencia y los buffers de audio.
- Plataforma objetivo: Apple Silicon (MLX). No es compatible de forma nativa con CUDA.
- GPU recomendadas: chips Apple M-series con memoria unificada suficiente; no se especifican modelos concretos.
- Cabe en consumer hardware: si, en equipos Apple Silicon con memoria unificada moderada, dado el tamano reducido de los pesos.
- Opciones de despliegue: MLX-VLM 0.7.11 o superior mediante `python -m mlx_vlm.generate`. No se indica soporte de vLLM, llama.cpp, Ollama ni TGI en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidades | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LFM3-Omni-2B-MLX-8bit | 2,17B | No disponible | Texto, audio, vision (any-to-any) | lfm1.0 | Hugging Face (MLX) |
| LFM3-Omni-2B (base) | 2,17B | No disponible | Texto, audio, vision (any-to-any) | lfm1.0 | Hugging Face |
| Alternativas comparables | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de informacion sobre modelos alternativos de la misma categoria en la documentacion proporcionada.

## Limitaciones y advertencias

- La licencia lfm1.0 es de tipo "other"; es necesario revisar el archivo LICENSE para conocer las restricciones de uso comercial antes de desplegar en produccion.
- El modelo esta disenado para Apple Silicon y MLX; no se puede ejecutar directamente en GPUs NVIDIA sin conversion a otro formato.
- No se dispone de informacion sobre la longitud de contexto maxima, lo que limita la planificacion de aplicaciones con documentos largos.
- Riesgo de alucinacion inherente a los modelos generativos; en VQA el propio autor recomienda basar las respuestas solo en lo visible en la imagen.
- La cuantizacion a 8 bits puede introducir perdida de precision respecto al modelo base en BF16, aunque el autor la considera el mejor equilibrio.
- No se documentan sesgos conocidos ni evaluaciones de seguridad en la informacion disponible.
- El rendimiento por idioma puede variar; no se aportan metricas desglosadas por lengua.
- La salida de audio requiere ajuste de parametros de muestreo (`audio_temperature`, `audio_repetition_penalty`) para evitar artefactos.

## Enlaces

- Hugging Face: https://huggingface.co/LiquidAI/LFM3-Omni-2B-MLX-8bit
- Modelo base: https://huggingface.co/LiquidAI/LFM3-Omni-2B
- MLX-VLM: https://github.com/Blaizzy/mlx-vlm
- Documentacion de despliegue MLX: https://docs.liquid.ai/deployment/on-device/mlx
- Documentacion general: https://docs.liquid.ai/lfm/getting-started/welcome
- Blog de LFM3: https://www.liquid.ai/blog/lfm3
- Playground: https://playground.liquid.ai/
- Consola/API: https://console.liquid.ai/dashboard
