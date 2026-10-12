# anonymous-asr-review/whisper-small-sinhala-r32-seed42

## Resumen

whisper-small-sinhala-r32-seed42 es un adaptador LoRA de rango 32 (alpha 32, semilla 42) sobre el modelo de reconocimiento automático del habla openai/whisper-small. Lo publica una cuenta anónima (anonymous-asr-review) como material suplementario para un proceso de revisión por pares, y su objetivo declarado es el reconocimiento de habla con cambio de código (code-switching) entre cingalés (sinhala, código `si`) e inglés (código `en`).

El repositorio no contiene pesos completos: son adaptadores PEFT en formato safetensors que se cargan sobre los pesos de Whisper small, descargados aparte. La model card indica que el adaptador r32 es compartido por las estrategias «independent» y «frozen-Sinhala» del estudio, y remite a la configuración de idioma y de generación de la tarea de evaluación para su uso.

Su relevancia es acotada y experimental: es un artefacto de reproducibilidad para investigación en ASR de bajos recursos (cingalés) y habla bilingüe, no un modelo listo para producción. No hay licencia declarada, no se publican datos de entrenamiento ni resultados de benchmarks, y el repositorio acumula 0 descargas y 0 «likes» en el momento de redactar esta ficha.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper) con adaptadores LoRA (PEFT) sobre openai/whisper-small |
| Parámetros totales | No disponible para el adaptador. El modelo base openai/whisper-small tiene aproximadamente 244 M de parámetros; la model card no indica el número de parámetros entrenables del adaptador |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible como dato del adaptador. La arquitectura Whisper procesa ventanas de audio de 30 s por defecto |
| Tipos de cuantización | No disponible |
| Idiomas soportados | Cingalés (`si`) e inglés (`en`), con cambio de código |
| Licencia | No disponible (el adaptador no declara licencia; debe consultarse la del modelo base) |
| Formato de pesos | safetensors (adaptadores PEFT/LoRA); los pesos base no se incluyen en el repositorio |
| Rango LoRA | 32 |
| Alpha LoRA | 32 |
| Semilla | 42 |
| Librería | peft |
| Pipeline | automatic-speech-recognition |
| Tamaño del repositorio | 0,0 GB (según la ficha de HuggingFace) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Whisper small: un transformer encoder-decoder entrenado para ASR que consume espectrogramas mel de 16 kHz en ventanas fijas de 30 segundos y genera tokens de texto de forma autorregresiva, con tokens especiales de idioma y de tarea. Sobre ese modelo se aplica un adaptador LoRA de rango 32 y alpha 32, con semilla 42, ajustado mediante la librería PEFT y almacenado en safetensors. La model card no especifica sobre qué módulos concretos (atención, proyecciones, etc.) se insertan los adaptadores.

No se dispone de información sobre el entrenamiento: ni el número de tokens o de horas de audio, ni la composición del conjunto de datos, ni si se aplicaron técnicas de aumento de datos o decodificación especulativa. Tampoco se documentan etapas de RLHF o DPO, algo esperable en un modelo de ASR supervisado. El único detalle técnico declarado es que el adaptador r32 se comparte entre dos estrategias del estudio (independiente y «frozen-Sinhala»), lo que sugiere un diseño experimental de comparación de esquemas de ajuste para habla con cambio de código cingalés-inglés. La carga documentada consiste en fusionar el adaptador con `merge_and_unload()` sobre los pesos base de OpenAI.

## Capacidades

- Transcripción de voz (ASR) en cingalés e inglés, con atención específica a enunciados que alternan ambos idiomas (code-switching).
- Funcionamiento como adaptador ligero sobre openai/whisper-small, fusionable en un único modelo mediante PEFT.
- Entrada de audio a 16 kHz; la model card exige fijar el idioma de transcripción y los parámetros de generación según la tarea de evaluación.
- Hereda del modelo base la estructura encoder-decoder de Whisper, pero no hay evidencia publicada de que conserven sus capacidades de traducción de voz o de identificación automática de idioma tras el ajuste.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión ni audio más allá de la transcripción.
- Capacidad multilingüe limitada a los dos idiomas declarados (`si`, `en`); no se especifica comportamiento en otros idiomas.
- No se documenta ningún modo especial (thinking mode, salidas estructuradas, marcas de tiempo garantizadas).

## Casos de uso

- Investigación en ASR con cambio de código: sirve como punto de comparación reproducible (rango 32, semilla 42) frente a otras configuraciones de LoRA dentro de un mismo estudio sobre habla cingalés-inglés.
- Reproducibilidad de experimentos: al estar publicado como adaptador PEFT, permite reconstruir exactamente la configuración descrita en un artículo en revisión sin necesidad de redistribuir pesos completos.
- Transcripción de reuniones bilingües: equipos de Sri Lanka que alternan cingalés e inglés pueden transcribir audio de 16 kHz con este adaptador fusionado sobre Whisper small, siempre que se valide antes la calidad real en su dominio.
- Subtitulado de contenido audiovisual: generación de subtítulos para vídeo en cingalés con insertos en inglés, en un pipeline por lotes y con revisión humana posterior.
- Preetiquetado de corpus de voz: uso del adaptador para generar transcripciones preliminares de gran volumen que después se corrigen manualmente, reduciendo el coste de anotación en un idioma de bajos recursos.
- Base para ajustes posteriores: al ser un adaptador pequeño, permite experimentar con nuevos fine-tunes sobre el mismo dominio sin reentrenar el modelo base completo y con requisitos de VRAM reducidos.
- Evaluación comparativa de estrategias de congelación: útil en entornos académicos para medir el efecto de congelar o no las capas específicas de cingalés durante el ajuste.
- Prototipos de atención al cliente: transcripción de llamadas bilingües en centros de contacto, únicamente en fase de prueba y con verificación humana, dado que no hay métricas publicadas de precisión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de WER, CER ni comparaciones con otros sistemas, y el repositorio no ofrece ninguna evaluación cuantitativa del adaptador.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos de Whisper small ocupan aproximadamente 0,5 GB en fp16 y 1 GB en fp32; con activaciones y overhead del framework, la inferencia con lote 1 suele mantenerse por debajo de 2 GB de VRAM en fp16. Los adaptadores LoRA añaden un consumo marginal.
- GPU recomendadas: cualquier GPU con 4 GB o más de VRAM es suficiente en fp16 (por ejemplo, GTX 1650, RTX 3050, RTX 3060, T4). Para procesamiento por lotes o en paralelo conviene una RTX 4090, L4, A100 o H100, aunque el modelo es pequeño y no las aprovecha por sí solo.
- Cabe en GPU de consumo: sí, en la práctica totalidad de GPU de consumo actuales y en bastantes integradas, dado el tamaño del modelo base (≈244 M de parámetros).
- Ejecución en CPU: viable, aunque el repositorio solo documenta la ruta con Transformers y PEFT.
- Opciones de despliegue: la ruta documentada es `transformers` + `peft` (con `merge_and_unload()`); también es posible servir el modelo fusionado con frameworks compatibles con Whisper. El uso con llama.cpp, Ollama o faster-whisper exigiría convertir los pesos a GGUF o CTranslate2, conversión que no se proporciona en el repositorio.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto de audio | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| whisper-small-sinhala-r32-seed42 | Adaptador LoRA sobre 244 M | Ventanas de 30 s (heredado de Whisper) | `si`, `en` | No disponible | Repositorio HuggingFace, 0 descargas |
| openai/whisper-small | ≈244 M | Ventanas de 30 s | ≈99 idiomas | Apache-2.0 según la ficha pública del modelo base | Ampliamente disponible |
| openai/whisper-medium | ≈769 M | Ventanas de 30 s | ≈99 idiomas | Apache-2.0 según la ficha pública del modelo base | Ampliamente disponible |
| openai/whisper-large-v3 | ≈1.550 M | Ventanas de 30 s | ≈99 idiomas | Apache-2.0 según la ficha pública del modelo base | Ampliamente disponible |

No se dispone de datos de rendimiento comparado (WER en cingalés, habla con cambio de código u otros conjuntos) en la información proporcionada, por lo que la comparación se limita a parámetros, licencia y disponibilidad. Los datos de parámetros y licencia de los modelos de OpenAI proceden de sus fichas públicas y no son verificables dentro del repositorio del adaptador.

## Limitaciones y advertencias

- Ausencia total de evaluación publicada: no hay WER, CER ni ninguna otra métrica que permita estimar la calidad real del adaptador.
- Licencia no declarada: no se especifican los términos de uso, lo que impide confirmar si se permite el uso comercial y dificulta su adopción en producción.
- Datos de entrenamiento desconocidos: al no documentarse el corpus, no es posible evaluar sesgos de género, acento, dialecto, edad ni la representatividad de las variedades del cingalés.
- Riesgo de alucinación propio de los modelos Whisper: en tramos de silencio, ruido o audio fuera de dominio puede generar texto repetido o inventado; el ajuste LoRA no elimina este comportamiento.
- Idiomas limitados a `si` y `en`: no hay garantía de un comportamiento correcto en otros idiomas, ni de que se preserve la identificación automática de idioma del modelo base.
- Dependencia estricta del modelo base: el adaptador solo es válido sobre openai/whisper-small; mezclarlo con otros pesos o cuantizaciones requiere volver a fusionar y validar.
- Requisitos de entrada: audio a 16 kHz y configuración manual del idioma y de los parámetros de generación para la tarea de evaluación.
- Naturaleza anónima del repositorio: al ser material suplementario de revisión por pares, no hay autor identificable, soporte, mantenimiento ni histórico de versiones; el modelo puede cambiar o desaparecer.
- Advertencia de producción: no debe desplegarse en flujos críticos sin una validación previa con datos propios y sin revisión humana, dado que no existe ninguna evidencia pública de su fiabilidad.
- Nota sobre la búsqueda web: los resultados recuperados durante la elaboración de esta ficha corresponden al colectivo hacktivista Anonymous y a una marca de calzado homónima, por lo que no aportan información relevante sobre este modelo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/anonymous-asr-review/whisper-small-sinhala-r32-seed42
- Modelo base: https://huggingface.co/openai/whisper-small
- Librería PEFT (repositorio oficial): https://github.com/huggingface/peft
- Artículo de Whisper (Robust Speech Recognition via Large-Scale Weak Supervision): https://arxiv.org/abs/2212.04356
- Búsqueda web: sin resultados relevantes para este modelo; los enlaces devueltos trataban sobre el colectivo Anonymous y no se incluyen por no ser pertinentes.
