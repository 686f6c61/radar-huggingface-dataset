# FrankLiuDundun/voxcpm2-r46-u10

## Resumen

VoxCPM2 r46-u10 es un ajuste fino mediante LoRA del modelo de síntesis de voz openbmb/VoxCPM2, publicado por el usuario FrankLiuDundun. Su objetivo es mejorar la calidad de síntesis en tres idiomas del sudeste asiático (tailandés, indonesio y tagalo) manteniendo cierta competencia en chino e inglés gracias a un pequeño porcentaje de datos de replay. El repositorio contiene tanto el modelo completo fusionado como el delta LoRA original en el subdirectorio `lora/`.

El modelo parte de la arquitectura VoxCPM2, un sistema TTS con componente DiT (Diffusion Transformer) y un módulo de lenguaje opcional, del que no se detallan especificaciones internas en la información disponible. El ajuste se realizó únicamente sobre el componente DiT con rango y alpha de 32, sobre un corpus de 1.881 muestras y 3,541 horas, con reparto equitativo de duración entre tailandés, tagalo e indonesio.

Es relevante por su enfoque de validación: el autor publica una comparativa de CER (Character Error Rate) entre el modelo base y este ajuste sobre 90 textos no usados en el entrenamiento, con cuatro candidatos por texto y selección por QC. Las mejoras son modestas pero medibles en los tres idiomas objetivo, con la advertencia explícita de que no constituyen una certificación de calidad por hablantes nativos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VoxCPM2 (TTS con componente DiT; módulo LM opcional desactivado en el LoRA) |
| Parametros totales | 2.290.004.544 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | th, id, tl, zh, en |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (modelo completo fusionado y delta LoRA) |

## Arquitectura y entrenamiento

El modelo base VoxCPM2 emplea una arquitectura de síntesis de voz con un componente DiT (Diffusion Transformer) y un módulo de lenguaje que en este ajuste permanece desactivado (`enable_lm=false`). El fine-tune es un LoRA conjunto aplicado exclusivamente al DiT (`enable_dit=true`, `enable_proj=false`), con rango 32, alpha 32, dropout 0, learning rate 5e-5 y weight decay 0,1. Se usó microbatch 1 con acumulación de gradiente 16 (batch efectivo 16) y 12 pasos de warmup. El checkpoint publicado corresponde a un arranque en frío y únicamente a la instantánea de la décima actualización del optimizador.

Los datos de entrenamiento suman 1.881 muestras y 3,541 horas, con duración equitativa entre tailandés, tagalo e indonesio, más un 10% de replay en chino y un 5% en inglés. Las fuentes son FLEURS (CC-BY-4.0), Gigaspeech 2 (Apache-2.0, solo th e id), el espejo comunitario de Common Voice 22 (CC0, th e id) y YODAS2-Sidon th (CC-BY-3.0). La inferencia de referencia se fijó con `cfg_value=1.8` e `inference_timesteps=20`.

## Capacidades

- Síntesis de voz (text-to-speech) multilingüe en tailandés, indonesio, tagalo, chino e inglés.
- Generación de audio orientada a doblaje y locución, según la etiqueta `dubbing` del repositorio.
- Carga del modelo completo fusionado mediante la librería `voxcpm` con `load_denoiser=False` y `optimize=True`.
- Carga del delta LoRA por separado, con verificación de que las claves cargadas no estén vacías y que no haya claves omitidas o ausentes.
- Integración con OmniVoice mediante la variable de entorno `VOXCPM_MODEL_ID`.
- No se documentan capacidades de tool calling, agentes, visión ni audio de entrada en la información disponible.

## Casos de uso

- Doblaje de contenido audiovisual a tailandés, indonesio y tagalo: el ajuste se entrenó con reparto equitativo de duración entre los tres idiomas, lo que lo hace adecuado para proyectos de localización que cubran esos mercados con un único modelo.
- Localización de vídeos corporativos o formatos de e-learning: la ventana multilingüe permite reutilizar la misma voz sintética en varias versiones lingüísticas sin cambiar de pipeline.
- Generación de locuciones para aplicaciones de accesibilidad en tailandés e indonesio: el modelo puede producir audio a partir de texto en un flujo TTS estándar con la librería `voxcpm`.
- Síntesis de voz para asistentes conversacionales en el sudeste asiático: el soporte de th, id y tl cubre tres de los idiomas más hablados de la región, con replay de inglés y chino para prompts mixtos.
- Doblaje de bajo volumen con control de calidad offline: el autor documenta un flujo de cuatro candidatos por texto con selección por CER, replicable en pipelines de producción que prioricen precisión sobre latencia.
- Prototipado de voces para audiolibros o pódcast en indonesio y tagalo: el CER medido en estos idiomas (0,93% y 0,75%) es bajo en la validación publicada, lo que reduce la necesidad de revisión manual intensiva.
- Investigación en adaptación LoRA para TTS: el repositorio conserva el delta LoRA con su configuración (`r=32`, `alpha=32`), útil como referencia para experimentos de fine-tuning sobre VoxCPM2.

## Benchmarks y rendimiento

El autor publica una evaluación de ingeniería sobre 90 textos no usados en el ajuste (30 por idioma), con el modelo base y el candidato generando 360 muestras cada uno. La selección usa cuatro candidatos con semillas fijas 42, 43, 44 y 45, descartando transcripciones vacías, silencios medidos y lecturas múltiples, y eligiendo por CER.

| Idioma | CER medio base | CER medio r46-u10 | Casos graves base → candidato |
|---|---:|---:|---:|
| th | 4,37% | 4,18% | 0 → 0 |
| tl | 0,78% | 0,75% | 0 → 0 |
| id | 1,11% | 0,93% | 0 → 0 |

El autor advierte que estas cifras son métricas de ingeniería, no significación estadística ni certificación de calidad nativa, y que un único caso en tailandés empeoró más de 5 puntos porcentuales de CER, quedando marcado para revisión. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; el repo ocupa 5,0 GB en safetensors, lo que da una cota inferior aproximada para pesos en precisión de entrenamiento.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada; con 2.290 millones de parámetros, una cuantización a 8 bits o 4 bits podría situar los pesos en el rango de 2,3 a 4,6 GB, pero no hay datos publicados de cuantización para este modelo.
- Opciones de despliegue: librería `voxcpm` (`VoxCPM.from_pretrained`) y OmniVoice mediante `VOXCPM_MODEL_ID`. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; la referencia de inferencia usa `inference_timesteps=20` y `cfg_value=1.8`, parámetros que influyen directamente en el coste de generación.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Licencia | Contexto | Notas |
|---|---|---|---|---|---|
| VoxCPM2 r46-u10 (este) | 2.290.004.544 | th, id, tl, zh, en | Apache-2.0 | no disponible | Fine-tune LoRA DiT-only sobre VoxCPM2 |
| openbmb/VoxCPM2 (base) | no disponible | no disponible | no disponible | no disponible | Modelo base del ajuste; sin datos de specs en la información disponible |
| Alternativas TTS multilingües | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables en la información proporcionada |

No se dispone de información suficiente para comparar con alternativas de la misma categoría más allá del modelo base.

## Limitaciones y advertencias

- Las métricas de CER publicadas son de ingeniería y no han sido validadas por hablantes nativos; naturalidad, acento y emoción no están evaluados.
- El ajuste se entrenó con un único checkpoint (décima actualización del optimizador) y un solo seed por configuración; pueden aparecer casos gravemente defectuosos en producción.
- Los resultados de la tabla solo son reproducibles si se aplica el mismo QC de cuatro candidatos por texto con selección por CER; sin ese filtro, el rendimiento en línea difiere del reportado.
- El conjunto de validación final ya se ha consumido y no puede reutilizarse para ajustes posteriores.
- El módulo de lenguaje del modelo base está desactivado en el LoRA (`enable_lm=false`), por lo que no se aprovechan capacidades asociadas a ese componente.
- El modelo no incluye mecanismos documentados de mitigación de sesgos; al ser un TTS, los riesgos incluyen sesgos de acento y prosodia derivados de los corpus de entrenamiento (FLEURS, Common Voice, Gigaspeech 2, YODAS2).
- La licencia Apache-2.0 permite uso comercial, pero los corpus de entrenamiento tienen licencias propias (CC-BY-4.0, Apache-2.0, CC0, CC-BY-3.0) que pueden imponer obligaciones de atribución sobre los datos derivados.
- El repositorio tiene cero descargas y cero likes en el momento de la consulta, sin señales de validación por parte de la comunidad.
- No hay información sobre cuantizaciones soportadas ni sobre latencia en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/FrankLiuDundun/voxcpm2-r46-u10
- Modelo base: https://huggingface.co/openbmb/VoxCPM2
- Dataset FLEURS: https://huggingface.co/datasets/google/fleurs
- Dataset Gigaspeech 2: https://huggingface.co/datasets/speechcolab/gigaspeech2
- Espejo comunitario Common Voice 22: https://huggingface.co/datasets/fsicoli/common_voice_22_0
- Dataset YODAS2-Sidon th: https://huggingface.co/datasets/Chalermdej/yodas2_sidon_th_tts
