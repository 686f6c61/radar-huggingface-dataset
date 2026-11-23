# llm-jp/llm-jp-moshi-v1.1-base

## Resumen

LLM-jp-Moshi-v1.1-base es un modelo de diálogo por voz full-duplex en japonés desarrollado por LLM-jp. Se construye a partir del checkpoint de preentrenamiento J-CHAT de LLM-jp-Moshi-v1 y del modelo base kyutai/moshiko-pytorch-bf16, sobre el que se realiza un ajuste adicional de dos épocas mezclando un corpus sintético de diálogo en japonés construido por LLM-jp con datos de conversaciones reales de LLM-jp-Zoom1. El objetivo es un modelo capaz de mantener conversaciones habladas naturales en japonés con interacción simultánea de escucha y habla, sin esperar a que el interlocutor termine su turno.

El modelo combina un transformer de lenguaje con el tokenizador de audio Mimi de Kyutai, lo que permite procesar audio de entrada y generar audio de salida de forma continua. Cuenta con 7.687.729.152 parámetros totales y se distribuye en BF16 (unos 15,38 GB) con una variante FP32 de aproximadamente 30,75 GB. Está publicado bajo licencia Apache 2.0, lo que facilita su uso comercial y su adaptación.

Es relevante ahora porque los modelos de voz full-duplex siguen siendo escasos fuera del inglés, y este trabajo aporta una variante específica para japonés con datos de diálogo sintéticos y reales, además de un checkpoint comparativo entrenado solo con datos sintéticos. El autor lo describe como una versión prototipo, con posibles respuestas poco naturales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de lenguaje acoplado a codec de audio Mimi (full-duplex); detalles internos no disponibles |
| Parametros totales | 7.687.729.152 |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 (por defecto) y FP32 (tag `fp32`); no se documentan otras cuantizaciones |
| Idiomas soportados | japonés (ja) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (model.safetensors); tokenizador de texto SentencePiece (`tokenizer_spm_32k_3.model`) y tokenizador de audio Mimi (`tokenizer-e351c8d8-checkpoint125.safetensors`) |

## Arquitectura y entrenamiento

El modelo sigue el diseño Moshi de Kyutai: un modelo de lenguaje transformer que opera junto al codec neuronal Mimi para audio, permitiendo diálogo full-duplex (el modelo puede escuchar y hablar de forma simultánea en lugar de alternar turnos estrictamente). El punto de partida es el checkpoint de preentrenamiento J-CHAT de LLM-jp-Moshi-v1, derivado a su vez de kyutai/moshiko-pytorch-bf16. El tokenizador de texto proviene de rinna/japanese-gpt2-medium y el de audio de kyutai/moshiko-pytorch-bf16.

El ajuste adicional se realizó durante dos épocas mezclando dos fuentes: un corpus sintético de diálogo en japonés construido por LLM-jp (15 temas, 93.679 diálogos en el split de entrenamiento) y datos de conversaciones reales de LLM-jp-Zoom1 (solo el split de train; el split de test se reservó para evaluación). El audio sintético se generó con FireRedTTS-2 afinado sobre LLM-jp-Zoom1, y se usaron como referencia de voz del sistema fragmentos de audio extraídos de LLM-jp-Zoom1. Las transcripciones y marcas temporales se obtuvieron mediante ASR por turno y alineamiento CTC (`turnaligned_v1`). En la segunda época se redujo la tasa de aprendizaje a la mitad. No se documentan en la información disponible detalles sobre RLHF/DPO ni sobre el número total de tokens de entrenamiento.

## Capacidades

- Diálogo por voz full-duplex en japonés: procesa audio de entrada y genera audio de salida de forma continua, con capacidad de solapar habla y escucha.
- Generación de respuestas habladas naturales a partir de entrada de micrófono, mediante el servidor `moshi.server`.
- Manejo de conversaciones multi-turno con contexto acústico y textual.
- Tokenización de texto en japonés con vocabulario SentencePiece de 32k.
- Codificación y decodificación de audio mediante Mimi.
- No se documenta soporte de tool calling, function calling, agentes, visión, matemáticas o modo de razonamiento explícito en la información disponible.
- Capacidad multilingüe limitada al japonés según la model card.

## Casos de uso

- Asistentes de voz en japonés para atención al cliente: el modelo puede mantener conversaciones habladas multi-turno con interacción full-duplex, adecuado para entornos donde el usuario espera respuestas rápidas sin pulsar botones.
- Prácticas de conversación y tutores de idiomas: al ser full-duplex, permite simular un interlocutor que reacciona mientras el estudiante habla, útil para entrenar fluidez en japonés.
- Prototipos de interfaces manos libres: integración en dispositivos con micrófono y altavoz donde se requiere diálogo continuo sin turnos rígidos, como terminales de información o kioscos.
- Investigación en diálogo hablado: sirve como punto de partida para estudiar el comportamiento full-duplex en japonés y comparar con el checkpoint entrenado solo con datos sintéticos (`llm-jp-moshi-v1.1-base-synthetic-ft`).
- Evaluación de pipelines de voz: permite probar cadenas de ASR, TTS y alineamiento CTC en un modelo ya ajustado para diálogo, usando el servidor Moshi como referencia.
- Generación de datos de diálogo sintético para otros proyectos: el modelo puede emplearse para producir interacciones habladas que alimenten corpus de entrenamiento o evaluación en japonés.
- Demostraciones interactivas vía web: el servidor `moshi.server` levanta una interfaz web con micrófono, adecuada para demos en entornos Linux con GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona una comparación cualitativa con el checkpoint `llm-jp-moshi-v1.1-base-synthetic-ft`: en la evaluación comparativa del proyecto los resultados fueron casi equivalentes, pero en el benchmark de diálogo full-duplex en japonés el modelo comparativo tendía a empezar a hablar menos durante el turno del interlocutor. No se aportan cifras numéricas.

## Requisitos de hardware

- VRAM estimada: el peso en BF16 ocupa aproximadamente 15,38 GB; en FP32, unos 30,75 GB. La VRAM real de inferencia depende del dtype de ejecución y de la implementación, y no se documenta una cifra exacta.
- GPU recomendadas: no se especifican modelos concretos; la model card exige Python 3.10 o superior y entorno Linux con GPU.
- GPU de consumo: no se confirma compatibilidad con GPU de consumo; los 15,38 GB en BF16 superan la VRAM de muchas tarjetas consumer, por lo que se requiere al menos una GPU con memoria suficiente o cuantización adicional no documentada.
- Opciones de despliegue: `moshi.server` de la implementación PyTorch oficial de Kyutai (`pip install 'moshi<=0.2.2'`), ejecutado con `python -m moshi.server --hf-repo llm-jp/llm-jp-moshi-v1.1-base`. No se documentan opciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.
- Nota práctica: para la demo interactiva se recomienda usar auriculares o cascos para evitar eco.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| llm-jp/llm-jp-moshi-v1.1-base | 7.687.729.152 | no disponible | japonés | Apache 2.0 | Full-duplex, ajuste mixto sintético + real |
| llm-jp/llm-jp-moshi-v1.1-base-synthetic-ft | no disponible | no disponible | japonés | Apache 2.0 | Mismo origen, solo datos sintéticos; inicia menos el habla durante el turno del interlocutor |
| kyutai/moshiko-pytorch-bf16 | no disponible | no disponible | no disponible | no disponible en la información | Modelo base de Kyutai del que deriva este trabajo |
| llm-jp/llm-jp-moshi-v1 | no disponible | no disponible | japonés | no disponible en la información | Versión previa con el mismo checkpoint J-CHAT |

No se dispone de datos de rendimiento numérico para establecer comparaciones cuantitativas con alternativas de la misma categoría.

## Limitaciones y advertencias

- Modelo en fase prototipo: el autor advierte de que las respuestas pueden resultar poco naturales.
- Riesgo de generar información errónea y de reproducir sesgos o expresiones inapropiadas presentes en los datos de entrenamiento.
- No se garantiza la calidad en diálogos largos ni en condiciones acústicas variadas.
- Idiomas: solo japonés; no se documenta soporte de otras lenguas.
- Longitud de contexto: no disponible, lo que dificulta planificar despliegues con conversaciones extensas.
- Uso malintencionado: la licencia y la model card desaconsejan expresamente su uso para suplantación de identidad o fraude.
- Licencia Apache 2.0: permite uso comercial, pero el autor declina responsabilidad por daños derivados del uso del modelo.
- No se documentan mecanismos de seguridad adicionales, filtros de contenido ni evaluaciones de sesgo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/llm-jp/llm-jp-moshi-v1.1-base
- Checkpoint comparativo solo con datos sintéticos: https://huggingface.co/llm-jp/llm-jp-moshi-v1.1-base-synthetic-ft
- Versión previa: https://huggingface.co/llm-jp/llm-jp-moshi-v1
- Modelo base de Kyutai: https://huggingface.co/kyutai/moshiko-pytorch-bf16
- Implementación PyTorch de Moshi: https://github.com/kyutai-labs/moshi/tree/main/moshi
- Dataset J-CHAT: https://huggingface.co/datasets/sarulab-speech/J-CHAT
- Dataset LLM-jp-Zoom1: https://huggingface.co/datasets/llm-jp/LLM-jp-Zoom1
