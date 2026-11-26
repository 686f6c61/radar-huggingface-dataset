# andremarcelino/gpt2-estilo-neymar

## Resumen

GPT-2 estilo Neymar es un ajuste fino (fine-tuning) del modelo `pierreguillou/gpt2-small-portuguese` realizado por André Marcelino como trabajo final de un curso de NLP de la FECAF. El objetivo es generar respuestas sintéticas con el registro y las expresiones típicas de las ruedas de prensa y entrevistas del futbolista brasileño Neymar, a partir de un corpus de 18 entrevistas y comparecencias públicas transcritas con Whisper y filtradas por verificación de locutor (ECAPA) para conservar únicamente las intervenciones atribuidas a él.

Se trata de una parodia académica explícita, no de un modelo de propósito general ni de un clon de voz o personalidad: el propio autor advierte que el texto generado es sintético, no representa declaraciones reales y no tiene vínculo con el futbolista. La relevancia es, por tanto, la de un caso de estudio reproducible de ajuste fino de un modelo pequeño (124,4 millones de parámetros) sobre un dominio muy estrecho y con un formato de prompt fijo, útil para entender cómo se comporta un GPT-2 pequeño cuando se especializa en un estilo conversacional concreto.

Arquitectura transformer decoder-only de la familia GPT-2 en su variante small adaptada al portugués, con licencia MIT y pesos en safetensors. El repositorio ocupa aproximadamente 0,5 GB y no registra descargas ni interacciones en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (GPT-2 small, ajustado al portugues) |
| Parametros totales | 124.439.808 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base GPT-2 small; el autor no la documenta) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF ni cuantizadas) |
| Idiomas soportados | Portugues (pt) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `pierreguillou/gpt2-small-portuguese`, un GPT-2 small (124 millones de parámetros) adaptado al portugués, y se ajusta mediante fine-tuning supervisado sobre un corpus propio construido por el autor. Ese corpus procede de la transcripción con Whisper de 18 entrevistas y ruedas de prensa públicas; posteriormente se aplica verificación de locutor con ECAPA para conservar solo los fragmentos atribuidos a Neymar. No se documentan en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset, la presencia de RLHF o DPO, ni hiperparámetros del ajuste.

El formato de prompt es fijo: `Pergunta: <pergunta ou situação>\nNeymar:`. El autor reporta dos métricas de evaluación sobre el conjunto de test: la perplejidad baja de 70,6 en el modelo base a 49,3 en el modelo ajustado, y la tasa de expresiones típicas del registro del futbolista sube del 17 % al 44 %. No se describen innovaciones arquitectónicas (no hay decodificación especulativa, atención lineal ni mezcla de expertos); se trata de un fine-tuning convencional sobre un modelo denso pequeño.

## Capacidades

- Generación de texto en portugués con un registro conversacional concreto, orientado a respuestas breves de estilo entrevista.
- Respuesta a preguntas o situaciones introducidas con el formato `Pergunta: ...\nNeymar:`.
- Reproducción de expresiones y giros típicos del corpus de entrenamiento (tasa del 44 % en test según el autor).
- Generación de texto sintético de carácter paródico, sin valor factual.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta capacidad multilingüe más allá del portugués.
- No se documentan modos especiales (thinking, visión, audio).

## Casos de uso

- Estudio de fine-tuning de bajo coste: sirve como ejemplo reproducible de cómo un GPT-2 small adaptado al portugués puede especializarse en un estilo concreto con un corpus pequeño; útil en docencia de NLP para ilustrar el efecto de la selección de datos y del filtrado por locutor.
- Generación de contenido satírico controlado: en un contexto de humor o divulgación, se puede usar para producir respuestas ficticias con el registro del futbolista, siempre etiquetadas como parodia y sin atribuirlas a la persona real.
- Pruebas de formato de prompt: permite evaluar cómo afecta un formato fijo (`Pergunta:` / `Neymar:`) a la coherencia de un modelo pequeño, como banco de pruebas para pipelines de generación condicionada.
- Análisis de estilo y expresiones: el modelo y el corpus asociado permiten estudiar la frecuencia de expresiones típicas y comparar distribuciones léxicas entre el modelo base y el ajustado (métrica 17 % → 44 %).
- Demostración de evaluación con perplejidad: útil para enseñar la interpretación de la perplejidad en test (70,6 → 49,3) como indicador de adaptación al dominio, con sus limitaciones.
- Prototipado de chatbots de personaje en entornos de investigación: sirve para experimentar con diálogos de personaje en portugués antes de pasar a modelos mayores, dado su bajo coste de inferencia en CPU.

## Benchmarks y rendimiento

| Metrica | Modelo base | Modelo ajustado |
|---|---|---|
| Perplejidad en test | 70,6 | 49,3 |
| Tasa de expresiones típicas | 17 % | 44 % |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; por el tamaño (124,4 millones de parámetros), los pesos en fp32 ocupan aproximadamente 0,5 GB y en fp16 alrededor de 0,25 GB, por lo que la inferencia cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente en la práctica; tarjetas como RTX 3060, RTX 4060 o superiores no presentan problema. También es viable en CPU.
- Cabe en GPU consumer: sí, en prácticamente todas las GPU modernas e incluso en hardware integrado.
- Opciones de despliegue: `transformers` de Hugging Face es la vía directa al publicarse en safetensors; no se documentan conversiones a GGUF ni integraciones con llama.cpp u Ollama. vLLM y TGI no están documentados para este modelo.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| gpt2-estilo-neymar (este modelo) | 124,4 M | no disponible | pt | MIT | Fine-tuning de estilo sobre corpus de entrevistas; parodia académica |
| pierreguillou/gpt2-small-portuguese | no disponible | no disponible | pt | no disponible | Modelo base del ajuste; GPT-2 small adaptado al portugués |
| GPT-2 small original (OpenAI) | 124 M | 1024 tokens | en (principalmente) | MIT | Referencia de la familia; sin adaptación al portugués ni al estilo |
| Modelos GPT-2 pequeños ajustados a personaje en portugués | no disponible | no disponible | pt | variable | No se dispone de datos verificables de alternativas equivalentes |

## Limitaciones y advertencias

- Es una parodia académica: el texto generado es sintético y no representa declaraciones reales de Neymar; no debe presentarse como contenido atribuible a la persona.
- Riesgo alto de alucinación: al ser un GPT-2 small ajustado sobre un corpus muy estrecho, puede producir afirmaciones plausibles pero falsas, especialmente fuera del dominio de entrevistas deportivas.
- Sesgos derivados del corpus: el estilo aprendido refleja únicamente las 18 entrevistas seleccionadas y el filtrado por locutor, por lo que el registro está sobrerrepresentado y puede resultar caricaturesco.
- Limitaciones de idioma: solo portugués; no se documenta comportamiento fiable en otros idiomas.
- Limitaciones de contexto: no se documenta la longitud de contexto efectiva; al heredar GPT-2 small, es previsible que sea corta, aunque el autor no lo especifica.
- Restricciones de licencia: MIT permite uso comercial del modelo, pero el contenido generado sigue siendo una parodia sobre una persona real; el uso comercial o la presentación como declaraciones auténticas pueden tener implicaciones legales y éticas ajenas a la licencia.
- Caveat para producción: no se documentan evaluación de seguridad, filtros de contenido ni métricas de calidad más allá de perplejidad y tasa de expresiones; no se recomienda su uso en aplicaciones de producción sin revisión adicional.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/andremarcelino/gpt2-estilo-neymar
- Modelo base: https://huggingface.co/pierreguillou/gpt2-small-portuguese
- Repositorio de referencia de GPT-2 (OpenAI): https://github.com/openai/gpt-2
- Whisper (transcripción): https://github.com/openai/whisper
- ECAPA-TDNN (verificación de locutor, SpeechBrain): https://github.com/speechbrain/speechbrain
