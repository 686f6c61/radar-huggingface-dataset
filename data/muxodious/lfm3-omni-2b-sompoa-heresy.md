# MuXodious/LFM3-Omni-2B-SOMPOA-heresy

## Resumen

LFM3-Omni-2B-SOMPOA-heresy es un ajuste fino del modelo multimodal LiquidAI/LFM3-Omni-2B, desarrollado por el usuario MuXodious. Se trata de una variante "abliterated" (también etiquetada como uncensored, decensored o heretic) generada mediante la herramienta Heretic de P-E-W en su versión v2.2.0.dev0, con la técnica Self-Organizing Maps & Magnitude-Preserving Orthogonal Ablation (SOMPOA) activada. El objetivo del ajuste es reducir la tasa de rechazos del modelo base ante peticiones que este declinaría por defecto, preservando al mismo tiempo la distribución de salida original mediante control de divergencia KL.

El modelo hereda la arquitectura "any-to-any" del LFM3-Omni-2B de Liquid AI, orientada a entornos edge y conversación multimodal (audio, visión y texto). Cuenta con 2.166.928.384 parámetros totales según los pesos en safetensors, y el repositorio ocupa 4,5 GB. Soporta 23 idiomas, entre ellos el castellano, y se distribuye bajo la licencia lfm1.0 del modelo base.

La relevancia de esta ficha radica en que documenta un caso de modificación de alineamiento sobre un modelo omni pequeño: el autor reporta una reducción de rechazos de 98/101 a 2/101 con una divergencia KL de 0.0413, lo que permite evaluar el compromiso entre "desbloqueo" y degradación de capacidades.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal "any-to-any" (familia LFM3 Omni de Liquid AI); detalles internos no disponibles |
| Parametros totales | 2.166.928.384 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repo contiene safetensors; no se listan GGUF ni otras variantes) |
| Idiomas soportados | en, ar, zh, fr, de, it, ja, ko, pt, es, vi, th, id, hi, ru, pl, da, el, fi, he, nl, sv, tr (23 idiomas) |
| Licencia | lfm1.0 (license: other, license_name: lfm1.0) |
| Formato de pesos | safetensors (librería transformers, custom_code) |

## Arquitectura y entrenamiento

El modelo parte de LiquidAI/LFM3-Omni-2B, un modelo de la familia LFM3 Omni de Liquid AI con pipeline any-to-any, es decir, capaz de recibir y emitir combinaciones de texto, imagen y audio (image-text-to-text, speech-to-speech). La model card no detalla la arquitectura interna (tipo de atención, capas, dimensión oculta) ni los datos de preentrenamiento del modelo base, por lo que esos datos se consideran no disponibles.

El ajuste fino no es un entrenamiento supervisado convencional: se aplica la técnica de abliteración de Heretic v2.2.0.dev0 con SOMPOA, que identifica direcciones de rechazo en los pesos y las ablaciona de forma ortogonal preservando la magnitud, guiado por un índice de dirección (direction_index = 14.07) y pesos por capa en attn.o_proj y mlp.down_proj. El proceso se optimiza mediante búsqueda de trials que minimizan rechazos sujetos a una penalización por divergencia KL respecto al modelo original. El autor indica que se usaron datasets personalizados de prompts dañinos e inofensivos y un system prompt vacío durante la evaluación.

## Capacidades

- Generación de texto y conversación multi-turno en 23 idiomas, incluido el castellano.
- Procesamiento de imagen a texto (image-text-to-text) heredado del modelo base.
- Procesamiento de audio y speech-to-speech, según los tags del repositorio.
- Pipeline any-to-any: combinaciones de entrada y salida entre texto, imagen y audio.
- Orientación a despliegue en edge y aplicaciones conversacionales de baja latencia (según tags).
- Reducción drástica de rechazos: 2/101 en la evaluación del autor frente a 98/101 del modelo original.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la información proporcionada.
- Modo "thinking" explícito: no disponible en la información proporcionada.

## Casos de uso

- Investigación sobre alineamiento y abliteración: permite estudiar empíricamente el efecto de la ablación de direcciones de rechazo sobre un modelo omni pequeño, comparando la tasa de rechazos (2/101) con la divergencia KL (0.0413) y con la degradación en PIQA.
- Evaluación comparativa de técnicas de desbloqueo: útil para reproducir y contrastar Heretic + SOMPOA frente a otras técnicas de abliteración sobre el mismo modelo base, midiendo el compromiso entre rechazos y capacidades.
- Asistentes conversacionales de voz en edge: el tamaño de 2,17B parámetros y la orientación edge del modelo base permiten prototipar interfaces speech-to-speech en hardware limitado, con la salvedad de que las respuestas no estarán restringidas por filtros de seguridad.
- Procesamiento multimodal de documentos con imagen y texto: al heredar image-text-to-text, puede emplearse para describir o extraer información de imágenes en pipelines de investigación donde se requiera ausencia de rechazos.
- Generación de datasets sintéticos sin filtrado: útil para crear corpus de conversación o audio-texto en los 23 idiomas soportados cuando el pipeline de anotación necesita que el modelo no decline consignas.
- Pruebas de robustez y red teaming: sirve como modelo "sin censura" de referencia para comparar con variantes alineadas en auditorías de seguridad de sistemas multimodales.
- Desarrollo de aplicaciones multilingües en castellano: con soporte declarado de es, puede integrarse en prototipos de transcripción y respuesta hablada, siempre que el equipo asuma la falta de salvaguardas.

## Benchmarks y rendimiento

El autor publica únicamente resultados de PIQA para varios trials del proceso de abliteración, comparados con el modelo original:

| Benchmark | Metrica | T130 | T356 | T183 | T237 | Modelo original |
|---|---|---|---|---|---|---|
| PIQA | acc | 0.6186 | 0.6170 | 0.6126 | 0.6181 | 0.6175 |
| PIQA | acc_norm | 0.6295 | 0.6262 | 0.6251 | 0.6230 | 0.6262 |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks en la información disponible. Tampoco se aportan métricas específicas de las modalidades de audio o visión.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 4,3 GB solo para pesos (2,17B parámetros × 2 bytes), más overhead de activaciones y del codificador multimodal; el repo completo ocupa 4,5 GB.
- VRAM estimada en cuantización de 8 bits: alrededor de 2,2 GB para pesos; en 4 bits, alrededor de 1,1 GB, aunque no se distribuyen pesos cuantizados oficiales en el repositorio.
- GPU recomendadas: no hay recomendaciones oficiales en la información disponible; por tamaño, cabría en GPUs consumer con 8 GB o más (RTX 3060 Ti, RTX 4060, RTX 4070) en FP16, y en GPUs de 24 GB (RTX 4090) con margen amplio para lotes mayores.
- Despliegue: la librería declarada es transformers con custom_code, por lo que requiere cargar el código remoto del repositorio; no se confirma compatibilidad con vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidades | Licencia | Notas |
|---|---|---|---|---|---|
| LFM3-Omni-2B-SOMPOA-heresy | 2,17B | no disponible | texto, imagen, audio | lfm1.0 | Ajuste abliterated; 2/101 rechazos, KL 0.0413 |
| LiquidAI/LFM3-Omni-2B (base) | 2,17B | no disponible | texto, imagen, audio | lfm1.0 | Modelo original; 98/101 rechazos en la misma evaluación |
| Otras variantes abliterated de la familia LFM3 | no disponible | no disponible | no disponible | no disponible | No se han identificado en la información proporcionada |

La comparativa con modelos de otros fabricantes (por ejemplo, alternativas omni de tamaño similar) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Modelo deliberadamente desalineado: la abliteración elimina direcciones de rechazo, por lo que puede generar contenido dañino, ilegal o inseguro sin filtros; no es apto para producción orientada al público sin capas de moderación externas.
- Riesgo de alucinación: no se han publicado evaluaciones de veracidad; el proceso de ablación puede alterar comportamientos además del rechazo, y la KL de 0.0413 indica una desviación no nula respecto al original.
- Degradación medida: en PIQA, algunos trials caen por debajo del original (T183: acc 0.6126 frente a 0.6175), lo que sugiere una ligera pérdida de capacidades según la configuración elegida.
- Idiomas: aunque se declaran 23 idiomas, no hay evaluación por idioma; el rendimiento real en castellano o en idiomas de bajos recursos no está verificado.
- Contexto: la longitud de contexto no se documenta, lo que impide planificar cargas de trabajo con ventanas largas.
- Licencia lfm1.0: es una licencia "other" del modelo base; deben revisarse sus términos para uso comercial, y el ajuste fino no exime de las obligaciones de la licencia original.
- Dependencia de custom_code: la carga requiere confiar en código remoto del repositorio, lo que añade un riesgo de seguridad en despliegues.
- Reproducibilidad: el proceso se describe como una prueba de Heretic 2.0 + SOMPOA; los hiperparámetros completos y los datasets no se publican, dificultando la réplica exacta.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MuXodious/LFM3-Omni-2B-SOMPOA-heresy
- Modelo base: https://huggingface.co/LiquidAI/LFM3-Omni-2B
- Repositorio de Heretic: https://github.com/p-e-w/heretic
- Pull request de SOMPOA en Heretic: https://github.com/p-e-w/heretic/pull/196
- Consola de Liquid AI: https://console.liquid.ai/dashboard
