# IINOVAII/Llama-3.2-3B-Hindi-SFT

## Resumen

Llama-3.2-3B-Hindi-SFT es un ajuste fino supervisado (SFT) del modelo meta-llama/Llama-3.2-3B-Instruct, desarrollado por IINOVAII en el contexto del hackathon Lexsi. Se trata de la etapa 1 del proyecto Tameez ("modales" en hindi), cuyo objetivo es dotar a modelos pequenos de un comportamiento seguro y educado en hindi (devanagari), hinglish (hindi en alfabeto latino) e ingles. El modelo resultante se publica como control experimental: demuestra que un ajuste fino convencional en hindi, sin datos de seguridad, degrada las capacidades de rechazo de peticiones daninas del modelo base.

El modelo tiene 3.212.749.824 parametros en pesos bf16 fusionados (repo de 6,4 GB) y hereda la arquitectura transformer decoder-only de Llama 3.2. Se entreno con LoRA sobre 5.000 filas de instrucciones ordinarias en hindi/hinglish, sin datos de seguridad, y posteriormente se fusiono en pesos completos. Es el punto de partida de la etapa GRPO del proyecto y no esta pensado como asistente de produccion.

Su relevancia es metodologica: cuantifica el deterioro de seguridad que provoca el ajuste fino estandar en un idioma de bajos recursos. Segun la model card, las respuestas inseguras de Llama-3.2-3B pasan del 10,0 % en el modelo base al 15,6 % tras este SFT, lo que ilustra un riesgo frecuente en pipelines de "anadir idioma" sin evaluacion de seguridad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.2), ajuste fino con LoRA fusionado en bf16 |
| Parametros totales | 3.212.749.824 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible (heredada de Llama-3.2-3B-Instruct; no confirmada en la informacion proporcionada) |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16 safetensors; no se listan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | hindi (hi), ingles (en); incluye hinglish en romanizacion segun la model card |
| Licencia | llama3.2 (Llama 3.2 Community License) |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo parte de Llama-3.2-3B-Instruct, un transformer decoder-only denso de Meta con atencion causal estandar, y aplica un ajuste fino supervisado con LoRA sobre 5.000 filas de instrucciones ordinarias en hindi e hinglish, sin incluir datos de seguridad. Posteriormente, el adaptador se fusiona en pesos completos en bf16. No se dispone de informacion sobre el numero total de tokens vistos, la composicion exacta del dataset ni hiperparametros de entrenamiento mas alla de lo indicado.

El proyecto Tameez utiliza un pipeline de tres etapas sobre tres modelos base (Tiny Aya Global, Tiny Aya Fire y Llama-3.2-3B-Instruct) con datos, recompensas y evaluacion identicos. La etapa 1 (este modelo) es el baseline realista de "anadir hindi"; la etapa 2 aplica GRPO en un entorno de seguridad con 4.652 prompts etiquetados y seis recompensas ponderadas, usando la ventaja relativa de grupo de Dr. GRPO. Los datos se construyeron a partir de ocho datasets publicos, reescritos a hinglish natural con Aya Expanse 8B y etiquetados con Llama-Guard-3-1B. La evaluacion se realiza con jueces no usados en entrenamiento (Llama-Guard-3-8B y un clasificador de lenguaje abusivo MuRIL) sobre 2.014 prompts de seguridad, 200 de utilidad en hindi y 14.831 preguntas de conocimiento MILU.

## Capacidades

- Generacion de texto conversacional en hindi (devanagari), hinglish (alfabeto latino) e ingles.
- Respuesta a instrucciones generales heredadas de Llama-3.2-3B-Instruct.
- Razonamiento basico y respuesta a preguntas de conocimiento en hindi (evaluado con MILU).
- Soporte multilingue limitado a los idiomas declarados (hi, en); el hinglish se trata como variante de escritura del hindi.
- Capacidad de rechazo de peticiones daninas reducida respecto al modelo base (es precisamente su limitacion documentada).
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo de razonamiento explicito en la informacion proporcionada.

## Casos de uso

- Investigacion sobre seguridad multilingue: sirve como control experimental para medir cuanto degrada el ajuste fino convencional las defensas de un modelo, comparando sus tasas de respuesta insegura (15,6 %) con las del base (10,0 %) y las del modelo GRPO final (3,7 %).
- Reproduccion de pipelines de alineamiento: permite replicar la etapa 1 del proyecto Tameez y verificar los resultados publicados antes de aplicar GRPO.
- Evaluacion de jueces de seguridad: util como generador de respuestas de referencia para calibrar clasificadores como Llama-Guard-3-8B o MuRIL en hindi e hinglish.
- Estudio de degradacion por idioma: analisis de como el SFT en un idioma de bajos recursos afecta a la utilidad y a la seguridad en comparacion con el modelo base.
- Benchmarking de metodologias de alineamiento: comparacion cuantitativa entre SFT simple y RL (GRPO) con los mismos datos y presupuesto.
- Docencia y divulgacion: ejemplo didactico de por que "anadir un idioma" con SFT no equivale a un modelo seguro, con metricas antes y despues publicadas.

## Benchmarks y rendimiento

Los datos disponibles corresponden a la evaluacion del proyecto Tameez sobre conjuntos retenidos. La model card no publica resultados de MMLU, HumanEval ni GSM8K para este modelo.

| Metrica | Llama-3.2-3B base (etapa 0) | Este modelo (etapa 1, SFT) | Tameez GRPO (etapa 2) |
|---|---|---|---|
| Respuestas inseguras (prompts daninos) | 10,0 % | 15,6 % | 3,7 % |
| Respuestas inseguras, red-teaming en hindi | no disponible | no disponible | 2,6 % |
| Respuestas inseguras, red-teaming en hinglish | no disponible | no disponible | 15,8 % |
| Rechazo explicito y educado de peticiones daninas | no disponible | no disponible | 58,5 % |
| Rechazo erroneo de peticiones inofensivas | no disponible | no disponible | 7,0 % |
| Rechazo erroneo a usuarios enfadados con pregunta real | no disponible | no disponible | 15,5 % |
| Respuestas abusivas (MuRIL) | no disponible | no disponible | 7,5 % |
| Respuestas con palabras malsonantes | no disponible | no disponible | 0,7 % |
| Conocimiento en hindi (MILU) | no disponible | no disponible | 39,5 % |
| Tasa de victoria de utilidad frente a su propio SFT | no disponible | no disponible | 42,1 % |

## Requisitos de hardware

- VRAM estimada en bf16: aproximadamente 6,5 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica, 8-10 GB para inferencia comoda.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 3,5-4 GB de pesos; en 4 bits, alrededor de 2-2,5 GB.
- GPU recomendadas para bf16: A100, H100, L40S o RTX 4090 (24 GB) sin problemas; RTX 3090/4080 (16 GB) tambien suficiente.
- Cabe en GPU de consumo: si, en RTX 3060 de 12 GB o superiores en bf16, y en GPUs de 6-8 GB con cuantizacion de 4-8 bits.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (tag endpoints_compatible), vLLM y llama.cpp/Ollama previa conversion a GGUF (no se publican pesos GGUF en el repo).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| Llama-3.2-3B-Hindi-SFT (este) | 3,21 B | no disponible | Llama 3.2 Community | SFT en hindi sin datos de seguridad (control) | Hugging Face |
| Llama-3.2-3B-Tameez-GRPO | 3,21 B (base) | no disponible | Llama 3.2 Community | SFT + GRPO con recompensas de seguridad | Hugging Face |
| Tiny-Aya-Global-Tameez-GRPO | no disponible | no disponible | CC-BY-NC 4.0 (no comercial) | SFT + GRPO, modelo recomendado del proyecto | Hugging Face |
| Tiny-Aya-Fire-Tameez-GRPO | no disponible | no disponible | CC-BY-NC 4.0 (no comercial) | SFT + GRPO, variante para Asia del Sur | Hugging Face |

En seguridad, el modelo GRPO de Llama-3.2-3B reduce las respuestas inseguras al 3,7 % frente al 15,6 % de este SFT, con un 58,5 % de rechazos explicitos y un 7,0 % de falsos rechazos. Los modelos Tiny Aya alcanzan tasas de rechazo superiores (73,6 % y 73,1 %) pero con licencia no comercial.

## Limitaciones y advertencias

- Modelo menos seguro que su base: las respuestas inseguras suben del 10,0 % al 15,6 %; el propio autor advierte que no debe usarse como asistente.
- No se publican tasas de rechazo erroneo, abuso ni conocimiento MILU para esta etapa, por lo que su utilidad real en hindi no esta cuantificada en la informacion disponible.
- Riesgo de alucinacion inherente a un modelo de 3 B de parametros; no se documentan mitigaciones especificas.
- Cobertura limitada a hindi e ingles; el rendimiento en otras lenguas indias no esta evaluado.
- Licencia Llama 3.2 Community: permite uso comercial con condiciones (politica de uso aceptable, atribucion y limite de 700 millones de usuarios mensuales para licenciatarios), pero el modelo no es apto para produccion por su comportamiento de seguridad.
- Entrenado sin datos de seguridad, por lo que puede reproducir sesgos de los datasets publicos usados y responder de forma inapropiada ante provocaciones.
- Contexto no confirmado en la informacion proporcionada; conviene verificar la ventana real antes de desplegarlo con prompts largos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/IINOVAII/Llama-3.2-3B-Hindi-SFT
- Modelo final recomendado (GRPO): https://huggingface.co/IINOVAII/Llama-3.2-3B-Tameez-GRPO
- Tiny Aya Global Tameez GRPO: https://huggingface.co/IINOVAII/Tiny-Aya-Global-Tameez-GRPO
- Tiny Aya Fire Tameez GRPO: https://huggingface.co/IINOVAII/Tiny-Aya-Fire-Tameez-GRPO
- Demo interactiva (playground Tameez): https://huggingface.co/spaces/IINOVAII/tameez
- Dataset de seguridad: https://huggingface.co/datasets/IINOVAII/tameez-hindi-safety-data
- Salidas de evaluacion: https://huggingface.co/datasets/IINOVAII/tameez-eval-outputs
- Registros de entrenamiento: https://huggingface.co/datasets/IINOVAII/tameez-training-logs
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-3B-Instruct
