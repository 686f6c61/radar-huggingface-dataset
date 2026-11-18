# Erog0291/stewmind-1.7b-ultra

## Resumen

StewMind 1.7B ULTRA es un modelo de lenguaje derivado de Qwen/Qwen3-1.7B y publicado por el desarrollador Erog0291 bajo la marca MUTYINT (Nigeria). Se trata de un fine-tune que parte de la arquitectura Qwen3 y que ha sido modificado estructuralmente: las capas FFN se han ensanchado en sitio de 6144 a 8192 dimensiones mediante duplicación preservadora de salida, lo que eleva el recuento de parámetros desde los ~1.7B del modelo base hasta 2.072.896.512 parámetros reales (2,07B). El objetivo declarado es construir un asistente multimodal y offline orientado a lenguas nigerianas (hausa, yoruba, igbo, pidgin) y a tareas de percepción 3D y visión.

El modelo se presenta como una propuesta de despliegue en local, sin dependencia de servicios en la nube, y con soporte declarado de ASR y TTS para varias lenguas nigerianas. La ventana de contexto anunciada es de 40.960 tokens con rope plano, tras eliminar YaRN porque, según el autor, degradaba la recuperación en contexto largo. La licencia es "other", sin términos comerciales explicitados en la información disponible.

La relevancia actual del modelo es limitada pero singular: cubre un nicho poco atendido (lenguas de Nigeria y tareas multimodales offline) y lo hace sobre una base compacta de 2B parámetros. No obstante, los propios datos medidos por el autor muestran fallos en recuperación de contexto largo y en identidad, y no se han publicado resultados en benchmarks estándar como MMLU, GSM8K o MMMU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only derivado de Qwen3, con FFN ensanchada de 6144 a 8192 |
| Parametros totales | 2.072.896.512 (2,07B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 40.960 tokens (rope plano, sin YaRN) |
| Tipos de cuantizacion | no disponible (el repo solo contiene safetensors) |
| Idiomas soportados | en, ha, ig, yo, pcm (segun tags de la model card) |
| Licencia | other |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3-1.7B, un transformer decoder-only. La modificación principal descrita por el autor consiste en ensanchar las capas feed-forward en sitio, pasando de 6144 a 8192 dimensiones, mediante una técnica de "duplicación preservadora de salida" (output-preserving duplication), que permite aumentar la capacidad del FFN sin romper la función aprendida original. Posteriormente se realizó un fine-tune sobre datos de identidad de MUTYINT. El resultado es un modelo de 2,07B parámetros, algo mayor que su base.

La ventana de contexto se fija en 40.960 tokens con rope plano. El autor indica explícitamente que se eliminó YaRN tras comprobar que degradaba la recuperación. No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO o similar. Tampoco se detalla el mecanismo exacto de la duplicación preservadora de salida ni cómo se integraron las capacidades multimodales (visión, ASR, TTS) en la arquitectura, más allá de las etiquetas de la model card.

## Capacidades

- Generación de texto en inglés y en lenguas nigerianas (hausa, yoruba, igbo, pidgin).
- Reconocimiento automático de habla (ASR) para hausa, yoruba e igbo, con mejoras sustanciales de WER respecto al modelo base según mediciones del autor.
- Síntesis de voz (TTS) offline con voces en hausa, yoruba y pidgin; la voz en igbo aún no está entrenada.
- Percepción de formas 3D: el autor reporta 100% de acierto en formas limpias, rotadas 90 grados y con la mitad de puntos, y 17,8% bajo ruido 25x.
- Visión general: 58,5% en CIFAR-10 según medición del autor.
- Capacidad multimodal y orientación a uso offline, según los tags del repositorio.
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso.

## Casos de uso

- Transcripción de audio en lenguas nigerianas: el modelo puede emplearse para ASR de hausa, yoruba e igbo en entornos sin conectividad, aprovechando las reducciones de WER reportadas (de 108,9 a 49,0 en hausa, de 105,2 a 73,2 en yoruba y de 105,7 a 60,1 en igbo).
- Síntesis de voz offline para accesibilidad: generación de voces en hausa, yoruba y pidgin en dispositivos locales, útil para interfaces de voz en zonas con conectividad limitada.
- Procesamiento de formas 3D en pipelines de visión: clasificación de geometrías limpias o rotadas con alta fiabilidad declarada (100% en las pruebas del autor), adecuado para tareas de inspección o preprocesado.
- Clasificación de imágenes de baja resolución: con un 58,5% en CIFAR-10, puede servir como base para experimentos de visión embebida o prototipos educativos, no para producción crítica.
- Asistente conversacional multilingüe local: generación de texto en inglés y lenguas nigerianas para atención básica o divulgación, siempre con revisión humana por los fallos de identidad y contexto reportados.
- Investigación sobre ensanchamiento de FFN: el modelo sirve como caso de estudio reproducible de la técnica de duplicación preservadora de salida sobre Qwen3-1.7B, útil para quienes investigan modificaciones arquitectónicas post-hoc.

## Benchmarks y rendimiento

Datos medidos por el autor sobre esta build concreta:

| Prueba | Resultado |
|---|---|
| Identidad (responde como MUTYINT) | 0/5 prompts |
| Recuperación en contexto largo (4000, 8000, 16000, 32000) | fallo en todos |
| ASR hausa (WER) | 49,0 (base 108,9) |
| ASR yoruba (WER) | 73,2 (base 105,2) |
| ASR igbo (WER) | 60,1 (base 105,7) |
| Formas 3D limpias / rotadas 90 / media puntos | 100% / 100% / 100% |
| Formas 3D con ruido 25x | 17,8% |
| Visión CIFAR-10 | 58,5% |
| TTS offline | hausa, yoruba, pidgin (igbo no entrenada) |

No se han publicado resultados de MMLU, GSM8K ni MMMU en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: en torno a 4,2 GB solo para pesos (2,07B × 2 bytes), más overhead de activaciones y caché KV para 40.960 tokens.
- En cuantización de 8 bits: aproximadamente 2,1 GB de pesos; en 4 bits, alrededor de 1,1 GB, aunque no se distribuyen pesos cuantizados en el repo.
- GPU recomendadas: una RTX 4090 (24 GB) permite fp16 con contexto largo; una RTX 3060 de 12 GB es suficiente para fp16 con contexto moderado o para cuantizaciones de 8/4 bits.
- Cabe en GPU de consumo: sí, en tarjetas con 8 GB o más en cuantización de 8 bits, y en 6-8 GB en 4 bits.
- Opciones de despliegue: transformers (librería declarada), llama.cpp/Ollama si se generan GGUF a partir de los safetensors, y vLLM o TGI para servir con mayor throughput.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| StewMind 1.7B ULTRA | 2,07B | 40.960 | other | Hugging Face |
| Qwen/Qwen3-1.7B (base) | ~1,7B | no disponible en la información | no disponible en la información | Hugging Face |
| Alternativas de ~2B para lenguas africanas | no disponible | no disponible | no disponible | no disponible |

La comparación con otros fine-tunes de Qwen3-1.7B orientados a lenguas nigerianas no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Identidad no aprendida: el autor reporta 0/5 aciertos al responder como MUTYINT, por lo que el fine-tune de identidad no ha funcionado según su propia medición.
- Recuperación en contexto largo fallida en todas las longitudes probadas (4000, 8000, 16000 y 32000 tokens), a pesar de anunciar 40.960 tokens de contexto.
- WER de ASR todavía alto: 49,0 en hausa, 60,1 en igbo y 73,2 en yoruba, insuficiente para muchas aplicaciones de producción sin postprocesado.
- Robustez 3D limitada: cae al 17,8% con ruido 25x.
- Visión débil: 58,5% en CIFAR-10, por debajo de lo esperable en producción.
- Licencia "other" sin términos comerciales explícitos: es necesario contactar con el autor antes de un uso comercial.
- Sin benchmarks estándar (MMLU, GSM8K, MMMU) publicados, lo que impide comparar su calidad general.
- Riesgo de alucinación no cuantificado; al ser un fine-tune pequeño, es previsible en tareas abiertas.
- TTS en igbo no disponible.
- El repo ocupa 28,5 GB, desproporcionado para 2,07B parámetros, lo que sugiere artefactos adicionales o duplicados que conviene revisar antes de descargar.

## Enlaces

- Hugging Face: https://huggingface.co/Erog0291/stewmind-1.7b-ultra
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la información proporcionada.
