# doanhlt/contextual-speech-checkpoints

## Resumen

`doanhlt/contextual-speech-checkpoints` no es un modelo entrenado para uso general, sino un repositorio de respaldo (backup) que archiva los 40 fine-tunes de Whisper-small producidos en el proyecto de investigación `thinkprompt/contextual-speech`. El autor, `doanhlt`, publica los pesos en formato safetensors bajo la ruta `runs/<run>/final/model.safetensors`, correspondiente a rutas locales del entorno de entrenamiento. El repositorio ocupa 38,7 GB y se actualizó por última vez el 24 de noviembre de 2026.

La relevancia de este artefacto es acotada: sirve como archivo reproducible de una línea de investigación sobre ASR contextual (contextual speech recognition), no como un checkpoint listo para producción. La model card es explícita al indicar que "no es un release". Los datos de entrenamiento provienen de corpus públicos (VietMed MIT, TED-LIUM 3, AMI, Earnings-21/22, MLS y FLEURS), con licencias heterogéneas que condicionan cualquier uso más allá de la investigación.

El modelo base es `openai/whisper-small` (Apache-2.0), por lo que la arquitectura subyacente es el transformer encoder-decoder de Whisper. No se publican métricas de rendimiento, idiomas soportados ni pipeline en la información disponible, lo que limita la evaluación práctica del artefacto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper-small, base `openai/whisper-small`) |
| Parametros totales | no disponible (Whisper-small tiene ~244 M, dato no confirmado en la ficha) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors sin cuantizar) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |
| Tamano del repositorio | 38,7 GB (40 checkpoints) |
| Pipeline | no disponible |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es la de Whisper-small: un transformer encoder-decoder con atención completa, diseñado originalmente para reconocimiento automático del habla multilingüe. Cada uno de los 40 checkpoints corresponde a un fine-tune independiente del proyecto `thinkprompt/contextual-speech`, orientado a ASR contextual (es decir, condicionar la transcripción a información de contexto, como listas de palabras o prompts). No se detalla en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset por run ni si se aplicaron técnicas de RLHF o DPO (poco habituales en ASR).

Los datos de entrenamiento declarados son corpus públicos: VietMed MIT, TED-LIUM 3 (CC BY-NC-ND), AMI (CC BY 4.0), Earnings-21/22 (CC BY-SA 4.0), MLS (CC BY 4.0) y FLEURS (CC BY 4.0). Las configuraciones, JSONL de evaluación y puntuaciones se alojan en el dataset `doanhlt/contextual-speech-archive` (tars `cs_runs.tar.part-*`). No se describen innovaciones técnicas adicionales (decodificación especulativa, atención lineal, etc.) en la model card.

## Capacidades

- Reconocimiento automático del habla (ASR) mediante fine-tunes de Whisper-small.
- ASR contextual: los checkpoints están entrenados para aprovechar información de contexto en la transcripción.
- Procesamiento de audio en inglés y otros idiomas cubiertos por los corpus de entrenamiento (no se especifica la lista exacta).
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta modo thinking, visión ni audio generativo.
- Capacidades multilingües: no disponibles de forma explícita en la ficha.

## Casos de uso

- Investigación en ASR contextual: usar los 40 checkpoints como línea base reproducible para comparar estrategias de condicionamiento por contexto en Whisper-small.
- Reproducción de experimentos: el repositorio permite recuperar los pesos finales de cada run y cruzarlos con las configuraciones y puntuaciones del dataset `doanhlt/contextual-speech-archive`.
- Evaluación comparativa de fine-tunes: al disponer de 40 variantes sobre el mismo modelo base, se pueden analizar diferencias de comportamiento entre runs sobre corpus como AMI o Earnings-21/22.
- Estudio de robustez por dominio: los corpus de entrenamiento cubren dominios distintos (reuniones, TED talks, llamadas de earnings, multilingüe), lo que permite analizar el efecto del dominio en la transcripción.
- Docencia y formación: servir como ejemplo práctico de fine-tuning de Whisper y de gestión de artefactos de investigación.
- Auditoría de licencias de datos: útil para estudiar las implicaciones de entrenar con corpus de licencias heterogéneas (CC BY-NC-ND frente a CC BY 4.0).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card remite las puntuaciones de evaluación al dataset `doanhlt/contextual-speech-archive`, pero no se incluyen cifras en la ficha.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia, un Whisper-small en fp16 requiere del orden de 1-2 GB de VRAM, pero este dato no está confirmado en la información proporcionada.
- GPU recomendadas: no disponible. Por el tamaño del modelo base, cabría esperar que una GPU consumer moderna fuese suficiente, pero no se documenta.
- ¿Cabe en GPU consumer? No confirmado en la información disponible.
- Opciones de despliegue: no documentadas. Al ser safetensors de Whisper, sería compatible con stacks habituales de Whisper (Transformers, faster-whisper), pero no se indica en la ficha.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| `doanhlt/contextual-speech-checkpoints` | no disponible (~244 M en Whisper-small) | no disponible | Apache-2.0 | Hugging Face, backup de investigación |
| `openai/whisper-small` | ~244 M | 30 s de audio (ventana estándar Whisper) | Apache-2.0 | Hugging Face, modelo base oficial |
| `openai/whisper-base` | ~74 M | 30 s de audio | Apache-2.0 | Hugging Face, modelo base oficial |
| `openai/whisper-medium` | ~769 M | 30 s de audio | Apache-2.0 | Hugging Face, modelo base oficial |

La comparativa se limita al ecosistema Whisper porque no se dispone de datos de rendimiento del artefacto que permitan contrastarlo con alternativas de ASR contextual de otros autores.

## Limitaciones y advertencias

- No es un release: la model card indica explícitamente que se trata de un backup de checkpoints de investigación.
- Licencias de datos heterogéneas: TED-LIUM 3 es CC BY-NC-ND, lo que restringe el uso comercial derivado de ese corpus; es necesario revisar cada licencia antes de cualquier uso más allá de la investigación.
- Sin métricas publicadas: no hay benchmarks ni puntuaciones en la ficha, por lo que no se puede evaluar su calidad de forma objetiva.
- Idiomas no especificados: no se detalla qué idiomas cubren los 40 fine-tunes.
- Riesgo de alucinación: inherente a los modelos de ASR de la familia Whisper, especialmente en segmentos con ruido o silencio; no se documenta mitigación específica.
- Sesgos: no documentados; dependen de los corpus de entrenamiento (TED talks, reuniones AMI, earnings calls), lo que puede introducir sesgos de dominio y de hablante.
- Uso en producción no recomendado sin validación previa: el artefacto está pensado para investigación y reproducción de experimentos.
- Tamaño del repositorio (38,7 GB) y ausencia de pipeline declarado dificultan su integración directa en herramientas estándar.

## Enlaces

- Hugging Face: https://huggingface.co/doanhlt/contextual-speech-checkpoints
- Dataset asociado: https://huggingface.co/datasets/doanhlt/contextual-speech-archive
- Modelo base: https://huggingface.co/openai/whisper-small
- Proyecto de investigación referenciado: `thinkprompt/contextual-speech` (no se proporciona URL directa en la información disponible)
