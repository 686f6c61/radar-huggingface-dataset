# bschooled/caeleste-speech

## Resumen

`bschooled/caeleste-speech` no es un modelo nuevo, sino un repositorio de pesos pre-cuantizados a 4 bits (NF4 con bitsandbytes) de dos modelos open source que forman parte de un stack de voz autoalojado: un sistema de speech-to-text y un LLM de texto pequeño. El autor publica las cuantizaciones para evitar repetir el proceso de cuantización en cada carga, reduciendo tanto el tamaño de descarga como el tiempo de arranque en GPUs de consumo. El repositorio contiene dos subcarpetas independientes: `higgs-audio-v3-stt-nf4` (STT) y `qwen2.5-0.5b-instruct-nf4` (LLM de texto). No hay ningún entrenamiento nuevo: son copias fieles de las revisiones exactas de los modelos originales, con los tensores de pesos convertidos a NF4 y un bloque `quantization_config` añadido al `config.json`. La licencia es Apache-2.0 y el tamaño total del repositorio es de 3,3 GB.

La relevancia de este repositorio radica en la optimización práctica para despliegues en hardware limitado: el modelo de STT pasa de 5,00 GiB a 2,61 GiB, y el LLM de 0,93 GiB a 0,44 GiB. En una RTX 5080, el tiempo de carga de `higgs-audio-v3-stt` se reduce de 9,2 s a 0,8 s, y el de Qwen2.5-0.5B de 1,2 s a 0,2 s. Sin embargo, el repositorio no incluye todos los modelos del stack: los que tienen licencias con obligaciones específicas (como el TTS Orpheus basado en Llama 3.2) se excluyen y deben cuantizarse en tiempo de carga por parte del usuario.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Repositorio con dos modelos cuantizados: `higgs-audio-v3-stt` (encoder Whisper-large-v3 en bf16 + decoder Qwen3 en NF4) y `Qwen2.5-0.5B-Instruct` (completo en NF4) |
| Parametros totales | No disponible (depende del modelo original; el LLM Qwen2.5-0.5B tiene 0,5B parámetros, el STT no especificado) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (heredado de los modelos originales, no indicado) |
| Tipos de cuantizacion | NF4 (4-bit bitsandbytes con doble cuantización y dtype de cómputo bf16) |
| Idiomas soportados | No disponible (depende de los modelos originales) |
| Licencia | Apache-2.0 (para los dos submodelos) |
| Formato de pesos | Safetensors (guardados con `save_pretrained` de transformers) |

## Arquitectura y entrenamiento

No se trata de un modelo entrenado desde cero. El repositorio contiene cuantizaciones de dos arquitecturas ya publicadas:

- `higgs-audio-v3-stt`: un modelo de speech-to-text que combina un encoder Whisper-large-v3 (mantenido en bf16) con un decoder Qwen3 cuantizado a NF4. La decisión de mantener el encoder en bf16 se debe a una limitación de `transformers`: cuando el path de un módulo cuantizado es sufijo de otro (p. ej. `layers.0.…` y `audio_tower.layers.0.…`), el checkpoint no puede recargarse; se deja un lado sin cuantizar para preservar la carga con `transformers` estándar.
- `qwen2.5-0.5b-instruct-nf4`: el modelo instructivo de 0,5B de la familia Qwen2.5, cuantizado completamente a NF4.

El proceso de cuantización se realizó con `bitsandbytes` NF4 (doble cuantización, bf16 como dtype de cómputo) y se guardó con `save_pretrained`. El tokenizador, procesador y cualquier módulo con `trust_remote_code` se copian sin modificar de la revisión original. No se cambiaron arquitectura, vocabulario ni defaults de generación. La verificación consistió en recargar cada artefacto tras guardarlo y comprobar que seguía en 4 bits antes de subirlo.

## Capacidades

- Speech-to-text (STT): el submodelo `higgs-audio-v3-stt` convierte audio a texto, aprovechando el encoder Whisper-large-v3 (en bf16) y el decoder Qwen3 (en NF4). Capacidad de transcripción de voz con alta precisión en inglés y otros idiomas (no especificados).
- Generación de texto (LLM): el submodelo `qwen2.5-0.5b-instruct` es un modelo de lenguaje instructivo de 0,5B que puede generar respuestas coherentes para tareas de texto de baja complejidad.
- Compatibilidad con `transformers`: ambos submodelos se cargan con la librería estándar, usando `AutoModel` o `AutoModelForCausalLM`. El de STT requiere `trust_remote_code=True` y se debe cargar desde un directorio local descargado con `snapshot_download`.
- No se indica soporte de tool calling, agentes, visión, audio (más allá del STT) ni modos especiales de razonamiento. Las capacidades dependen íntegramente de los modelos originales.

## Casos de uso

- Despliegue de STT en hardware de consumo: al reducir el peso de 5 GiB a 2,61 GiB, permite ejecutar reconocimiento de voz en GPUs de gama media (RTX 2000 o superior) con menor huella de memoria y arranque casi instantáneo (0,8 s en RTX 5080 frente a 9,2 s con cuantización en tiempo de carga).
- Sistema de asistente de voz autoalojado: combinando el STT con el LLM de 0,5B y un TTS externo (como Orpheus, que no se redistribuye), se puede montar un pipeline de voz a texto y texto a voz en local, sin depender de APIs externas.
- Prototipado rápido en entornos con memoria limitada: el modelo de texto de 0,44 GiB permite experimentar con generación de texto en GPUs con 4 GB de VRAM, por ejemplo para chatbots sencillos o asistentes de documentación.
- Reducción de costes de almacenamiento y ancho de banda en CI/CD: al publicar pesos pre-cuantizados, se evita descargar los pesos completos en cada despliegue, lo que acelera la integración en pipelines de MLOps.
- Educación y pruebas de cuantización: el repositorio sirve como ejemplo de cómo cuantizar y publicar modelos con bitsandbytes, incluyendo la gestión de limitaciones de `transformers` con módulos que requieren `trust_remote_code`.
- Stack de voz en local con licencia Apache-2.0: para usuarios que necesitan una solución de transcripción y texto sin restricciones de licencia, ambos submodelos son Apache-2.0, lo que facilita su uso comercial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente reporta tiempos de carga en una RTX 5080, no métricas de calidad (WER, BLEU, etc.). Por tanto, no se pueden comparar con otros modelos de forma objetiva.

## Requisitos de hardware

- VRAM estimada: no se indica explícitamente. El modelo de texto de 0,44 GB debería caber en GPUs con al menos 2 GB de VRAM (considerando overhead de inferencia), mientras que el STT de 2,61 GB requeriría al menos 6 GB, aunque no hay garantía.
- GPU recomendadas: la model card menciona pruebas en una RTX 5080, pero el requisito mínimo es NVIDIA con compute capability `sm_75` o superior (Turing / RTX 2000 y más nuevos). También soporta AMD ROCm con RDNA3 (`gfx1100`–`gfx1102`), RDNA3.5 (`gfx1150`–`gfx1152`) y CDNA.
- Compatibilidad con consumer GPU: sí, siempre que cumplan con `sm_75+`. NF4 se eligió específicamente para cubrir más GPUs que FP8 (que requiere `sm_89+`) o NVFP4 (`sm_120+`).
- Opciones de despliegue: se puede cargar con `transformers` estándar usando `bitsandbytes`. No se mencionan vLLM, Ollama ni TGI; la carga se hace directamente con `AutoModel` o `AutoModelForCausalLM`.
- Latencia y throughput: no se proporcionan datos de latencia de inferencia. Los tiempos de carga medidos en RTX 5080 son: STT 0.8 s y LLM 0.2 s con pesos pre-cuantizados, frente a 9.2 s y 1.2 s con cuantización en tiempo de carga.

## Comparativa con modelos similares

No hay una comparativa directa disponible. El repositorio es una cuantización, no un modelo independiente, por lo que la comparación más relevante es contra los originales sin cuantizar:

| Modelo | Peso original | Peso cuantizado (NF4) | Tiempo de carga (RTX 5080) |
|---|---|---|---|
| `bosonai/higgs-audio-v3-stt` | 5.00 GiB | 2.61 GiB | 0.8 s (pre-cuantizado) |
| `Qwen/Qwen2.5-0.5B-Instruct` | 0.93 GiB | 0.44 GiB | 0.2 s (pre-cuantizado) |

No se dispone de información sobre otros modelos cuantizados similares en el mismo repositorio.

## Limitaciones y advertencias

- Los pesos son derivados de los modelos originales; se redistribuyen bajo la licencia Apache-2.0, pero el usuario debe revisar las licencias de los upstream para confirmar los términos exactos.
- El modelo de STT mantiene el encoder Whisper-large-v3 en bf16 (no cuantizado) para garantizar la carga con `transformers`. Esto implica que la ventaja de memoria se reduce en esa parte del modelo.
- No se incluyen los modelos TTS Orpheus ni LFM2.5-Audio-1.5B por restricciones de licencia. El usuario debe descargarlos y cuantizarlos manualmente si los necesita.
- La cuantización NF4 puede introducir una pérdida de precisión en comparación con los pesos en bf16 o fp16, especialmente en tareas de alta sensibilidad (por ejemplo, transcripción de audio con ruido).
- No se han publicado benchmarks de calidad (WER, BLEU, etc.), por lo que el rendimiento real en tareas concretas no está verificado.
- El repositorio no tiene descargas ni likes, lo que sugiere que es un proyecto personal o en fase temprana, con posible falta de mantenimiento.
- El modelo STT requiere `trust_remote_code=True`, lo que implica ejecutar código remoto. Se recomienda inspeccionar el código antes de usarlo en entornos de producción.
- El modelo de texto de 0,5B tiene limitaciones inherentes de capacidad de razonamiento y generación de texto complejo; no es adecuado para tareas que requieren un LLM de gran escala.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/bschooled/caeleste-speech
- Modelo STT original: https://huggingface.co/bosonai/higgs-audio-v3-stt
- Modelo LLM original: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Modelo TTS no incluido (referencia): https://huggingface.co/unsloth/orpheus-3b-0.1-ft
- Modelo de audio LFM2.5 no incluido (referencia): https://huggingface.co/LiquidAI/LFM2.5-Audio-1.5B
