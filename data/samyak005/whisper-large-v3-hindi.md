# Samyak005/whisper-large-v3-hindi

## Resumen

Whisper large-v3 fine-tuned for Hindi es un ajuste fino completo del modelo openai/whisper-large-v3 llevado a cabo por el usuario Samyak005 para dos tareas sobre audio en hindi: reconocimiento automático del habla (ASR, hindi a texto en devanagari) y traducción del habla (hindi a inglés). El modelo parte de los pesos originales de OpenAI y se reentrena sobre aproximadamente 8.200 enunciados en hindi procedentes de tres corpus de AI4Bharat (IndicVoices-ST, Spoken-Tutorial y Mann-ki-Baat), con un total de 1.543.490.560 parámetros y un repositorio de 3,1 GB en formato safetensors.

La relevancia práctica del ajuste está en la mejora medida sobre el modelo base: el WER baja de 33,17 a 18,27 y el CER de 19,84 a 8,99 en un conjunto de test reservado de 500 enunciados, mientras que el BLEU de traducción hindi a inglés sube de 29,23 a 41,82. Es, por tanto, una alternativa especializada para pipelines de transcripción y subtitulado en hindi que necesiten un único modelo capaz de transcribir y de traducir, con licencia Apache 2.0 y sin restricciones de uso comercial.

El modelo mantiene la arquitectura encoder-decoder de Whisper con una ventana de audio de 30 segundos por segmento y está pensado para escenarios de dominio conversacional, tutoriales de software y alocuciones radiofónicas. No obstante, el ajuste es reciente y de alcance limitado (30 descargas y ningún like en el momento de redactar esta ficha), por lo que conviene validarlo en el dominio concreto de despliegue antes de adoptarlo en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper large-v3), ajuste fino completo |
| Parámetros totales | 1.543.490.560 |
| Parámetros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | segmentos de audio de hasta 30 s por ventana; para audio más largo se usa `chunk_length_s=30` |
| Tipos de cuantización | no disponible (pesos publicados en fp16; admite las cuantizaciones estándar de transformers y de llama.cpp/GGUF para Whisper, no verificadas por el autor) |
| Idiomas soportados | hindi (hi) como entrada de audio; salida en hindi (devanagari) o en inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (fp16), biblioteca transformers |

## Arquitectura y entrenamiento

El modelo conserva la arquitectura de Whisper large-v3: un encoder que procesa espectrogramas mel de audio y un decoder autorregresivo que genera tokens de texto, con atención encoder-decoder estándar. El ajuste fino es completo (no LoRA ni adaptadores), sobre los pesos de openai/whisper-large-v3, y mantiene las dos cabezas de tarea del modelo original mediante tokens especiales de transcribe y translate.

El entrenamiento usó 3.000 pares en hindi por cada una de las tres fuentes, filtrados con `en_mining_score >= 0.7` y recortados a clips de 30 segundos o menos, con un reparto de 8.200 / 300 / 500 (train / validación / test). Cada muestra se asignó aleatoriamente a la tarea de transcripción (objetivo en hindi) o de traducción (objetivo en inglés), de modo que un único modelo cubre ambas. Se entrenó en una A100 de 80 GB en bf16 con gradient checkpointing, optimizador AdamW de 8 bits, learning rate 1e-5, 10 % de warmup, batch efectivo de 16 y 3 épocas (1.539 pasos), con SpecAugment (`mask_time_prob=0.05`) como regularización. La selección del checkpoint se hizo por menor pérdida de validación, evaluada cada 250 pasos, y los pesos se guardaron en fp16.

Una innovación destacable no está en la arquitectura sino en la evaluación: el autor emplea un normalizador seguro para indic (NFC, eliminación de puntuación y danda, pero conservando las matras), porque el `BasicTextNormalizer` de Whisper elimina las vocales del devanagari y corrompería el cálculo del WER en hindi.

## Capacidades

- Reconocimiento automático del habla en hindi con salida en escritura devanagari.
- Traducción directa de audio hindi a texto en inglés (speech translation).
- Gestión de ambas tareas con un único conjunto de pesos, seleccionables mediante `task="transcribe"` o `task="translate"`.
- Procesamiento de audio de más de 30 segundos mediante troceado con `chunk_length_s=30`.
- Inferencia en fp16 sobre GPU con la pipeline de transformers.
- No dispone de tool calling, function calling ni capacidades de agente.
- No soporta visión, audio de salida ni modo de razonamiento explícito.
- Cobertura monolingüe de entrada (solo hindi); no se ha validado para otros idiomas indios.

## Casos de uso

- Subtitulado y transcripción de vídeo en hindi: el modelo convierte pistas de audio en texto devanagari con un WER de 18,27 en el conjunto de test, adecuado para generar subtítulos que después se revisan manualmente.
- Traducción de contenido audiovisual hindi-inglés: con `task="translate"` se obtiene directamente la versión inglesa del audio, con BLEU de 41,82, útil para localización de cursos, entrevistas o pódcasts.
- Transcripción de tutoriales técnicos: el ajuste incluye el corpus Spoken-Tutorial, donde el WER baja a 13,70, por lo que encaja en la generación de documentación a partir de vídeos formativos de software.
- Análisis de alocuciones radiofónicas y discursos institucionales: el corpus Mann-ki-Baat aporta este dominio y el modelo alcanza un WER de 17,35 en él, lo que permite indexar y buscar contenido de programas de radio.
- Atención al cliente en hindi: la transcripción de llamadas grabadas permite generar registros textuales para auditoría y análisis de calidad, con la ventaja de que el mismo modelo puede producir la versión inglesa para equipos que no dominan el hindi.
- Investigación en ASR para lenguas indias: sirve como punto de partida o referencia de ajuste fino sobre Whisper large-v3 con un protocolo de evaluación documentado y reproducible.
- Generación de corpus paralelos hindi-inglés: al transcribir y traducir el mismo audio se obtienen pares alineados que pueden alimentar el entrenamiento de modelos de traducción automática.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo sobre un conjunto de test reservado de 500 enunciados (60 minutos de audio), decodificación greedy. Los valores de WER y CER son menores-cuanto-mejor; BLEU y chrF++ son mayores-cuanto-mejor. Ningún resultado está verificado de forma independiente.

| Métrica | Base (zero-shot) | Ajustado |
|---|---:|---:|
| WER | 33,17 | 18,27 |
| CER | 19,84 | 8,99 |
| WER (raw) | 37,10 | 18,23 |
| Sustituciones (%) | 23,16 | 11,82 |
| Deleciones (%) | 7,93 | 4,89 |
| Inserciones (%) | 2,08 | 1,56 |
| BLEU (hi→en) | 29,23 | 41,82 |
| chrF++ (hi→en) | 52,32 | 62,88 |

Desglose por fuente de datos:

| Grupo | n | WER base → ajustado | CER base → ajustado | BLEU base → ajustado |
|---|---:|---|---|---|
| IndicVoices-ST | 155 | 33,21 → 21,43 | 18,57 → 11,27 | 27,25 → 47,15 |
| Mann-ki-Baat | 171 | 33,26 → 17,35 | 17,05 → 8,09 | 27,22 → 32,33 |
| Spoken-Tutorial | 174 | 32,95 → 13,70 | 25,85 → 6,21 | 33,70 → 44,88 |

Desglose por duración del clip:

| Duración | n | WER base → ajustado | CER base → ajustado | BLEU base → ajustado |
|---|---:|---|---|---|
| < 5 s | 203 | 33,33 → 16,49 | 21,54 → 7,57 | 29,85 → 41,20 |
| 5-10 s | 179 | 31,89 → 14,87 | 17,11 → 5,80 | 31,33 → 42,82 |
| 10-20 s | 102 | 32,25 → 16,78 | 18,75 → 7,39 | 26,72 → 40,64 |
| 20-30 s | 16 | 40,70 → 39,01 | 30,56 → 29,37 | 27,71 → 42,23 |

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: en torno a 3-4 GB solo para los pesos (1,54 mil millones de parámetros a 2 bytes), más el consumo de activaciones y del procesador de audio; en la práctica conviene reservar al menos 6-8 GB para trabajar con comodidad.
- En fp32 los pesos ocupan unos 6,2 GB, por lo que se recomienda fp16 o bf16 en GPU.
- GPU recomendadas: A100 80 GB o H100 para entrenamiento o ajuste adicional; para inferencia bastan una RTX 4090, una RTX 3090, una A10G o incluso una T4 de 16 GB.
- Cabe en GPU de consumo: sí, en cualquier tarjeta con 8 GB o más de VRAM (RTX 3060 Ti, RTX 4060, RTX 3070 y superiores). En CPU es posible pero con latencia alta.
- Opciones de despliegue: pipeline de transformers (uso documentado por el autor), además de servidores compatibles con el formato safetensors como TGI o vLLM (soporte de Whisper sujeto a la versión); también es posible exportar a otros formatos, aunque el autor no lo documenta.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto de audio | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| Samyak005/whisper-large-v3-hindi | 1,54 B | 30 s por ventana | hindi (entrada), hindi/inglés (salida) | Apache 2.0 | Ajuste específico con WER 18,27 y BLEU 41,82 en test propio |
| openai/whisper-large-v3 | 1,54 B | 30 s por ventana | multilingüe (~99 idiomas) | Apache 2.0 | Modelo base; WER 33,17 y BLEU 29,23 en el mismo test |
| openai/whisper-large-v3-turbo | no disponible en la información proporcionada | 30 s por ventana | multilingüe | Apache 2.0 | Variante destilada de menor coste; sin datos comparativos en esta ficha |
| Otros ajustes de Whisper para hindi | no disponible | no disponible | hindi | variable | No se dispone de datos verificables en la información proporcionada |

## Limitaciones y advertencias

- Los clips de 20-30 segundos apenas mejoran el WER (39,01 frente a 40,70 del base) porque son escasos en los datos de entrenamiento.
- El habla con mezcla de código (code-mixed) técnico es problemática: las referencias escriben palabras inglesas de forma inconsistente en alfabeto latino o devanagari.
- Se producen errores ocasionales de unión de palabras, como `बहुतबहुत`.
- El entrenamiento cubre solo tres dominios (conversacional, tutoriales de software y alocuciones radiofónicas); la generalización a otros dominios no está garantizada.
- El modelo solo acepta audio en hindi; no se ha validado para otras lenguas indias ni para inglés como entrada.
- Riesgo de alucinación textual en pasajes de audio con ruido, música o silencios largos, inherente a la familia Whisper.
- No se han publicado evaluaciones independientes ni análisis de sesgos; los resultados proceden exclusivamente del autor y están marcados como no verificados.
- La licencia Apache 2.0 permite uso comercial, pero el usuario debe asumir la validación en su dominio y el cumplimiento de las condiciones de los corpus de AI4Bharat empleados en el entrenamiento.
- El modelo tiene muy poca tracción (30 descargas, 0 likes) y fue creado en octubre de 2026; no hay historial de mantenimiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Samyak005/whisper-large-v3-hindi
- Modelo base: https://huggingface.co/openai/whisper-large-v3
- Demo comparativa (base frente a ajustado): https://huggingface.co/spaces/Samyak005/whisper-hindi-compare
- Dataset IndicVoices-ST: https://huggingface.co/datasets/ai4bharat/IndicVoices-ST
- Dataset Spoken-Tutorial: https://huggingface.co/datasets/ai4bharat/Spoken-Tutorial
- Dataset Mann-ki-Baat: https://huggingface.co/datasets/ai4bharat/Mann-ki-Baat
