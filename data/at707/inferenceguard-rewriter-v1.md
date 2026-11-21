# AT707/inferenceguard-rewriter-v1

## Resumen

InferenceGuard Privacy Rewriter es un adaptador PEFT QLoRA sobre Qwen/Qwen2.5-1.5B-Instruct, desarrollado por el usuario AT707, diseñado para reescribir prompts de usuario eliminando senales demograficas implicitamente inferibles (edad, ubicacion, ocupacion, educacion, ingresos) sin alterar la tarea, las restricciones ni las entidades no identitarias. El objetivo es mitigar la inferencia de atributos sensibles en pipelines de LLM sin degradar la utilidad de la consulta original.

El adaptador se entrena con 4.034 ejemplos de una sola vuelta generados a partir de reescrituras SynthPAI producidas por Qwen2.5-7B-Instruct, filtrados con DeBERTa-v3 NLI y retencion numerica, mas 2.000 ejemplos aumentados con control de posicion y 605 no-ops de identidad. La supervision se aplica solo sobre la completion (assistant_only_loss).

Es relevante en el contexto de privacidad inferencial: no se limita a redactar PII explicita (como hace Presidio) sino que elimina pistas contextuales que permiten a un atacante deducir atributos demograficos. Su tamano (1.500 millones de parametros) permite desplegarlo como preprocesador ligero delante de un LLM mayor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) con adaptador LoRA/QLoRA |
| Parametros totales | 1.543.714.304 (modelo base); adaptador LoRA con r=32, alpha=64, dropout=0.10 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del base Qwen2.5-1.5B-Instruct; no especificada en la model card) |
| Tipos de cuantizacion | QLoRA 4-bit NF4 para entrenamiento; inferencia en 4-bit (load_in_4bit=True) segun ejemplo de uso |
| Idiomas soportados | en (ingles) |
| Licencia | cc-by-nc-sa-4.0 |
| Formato de pesos | safetensors (adaptador PEFT), libreria peft |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA de rango 32 y alpha 64 con dropout 0.10, entrenado mediante QLoRA en 4-bit NF4 sobre Qwen/Qwen2.5-1.5B-Instruct, un transformer decoder-only de la familia Qwen2.5. El entrenamiento es SFT supervisado con enmascaramiento de perdida solo sobre la respuesta (assistant_only_loss=True), de modo que el modelo aprende la reescritura y no la reproduccion del prompt original.

El dataset de entrenamiento consta de 4.034 filas de una sola vuelta: reescrituras SynthPAI generadas por Qwen2.5-7B-Instruct y filtradas mediante un clasificador NLI DeBERTa-v3 y un criterio de retencion numerica, complementadas con 2.000 ejemplos aumentados con control de posicion y 605 no-ops de identidad (prompts que no requieren reescritura). No se documenta uso de RLHF ni DPO.

## Capacidades

- Reescritura de prompts para eliminar senales demograficas inferibles (edad, ubicacion, ocupacion, educacion, ingresos).
- Preservacion de la tarea, restricciones y entidades no identitarias durante la reescritura.
- Deteccion de prompts que no requieren modificacion (no-ops de identidad).
- Retencion de informacion numerica relevante para la consulta.
- Generacion de texto conversacional de una sola vuelta en ingles.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo thinking.

## Casos de uso

- Preprocesador de privacidad en pipelines de LLM: se inserta delante de un modelo mayor para reescribir prompts de usuario antes de enviarlos a un proveedor externo, reduciendo la precision de ataques de inferencia demografica.
- Cumplimiento de minimizacion de datos: en flujos sujetos a RGPD, elimina pistas contextuales que permiten deducir atributos sensibles sin borrar la consulta funcional.
- Anonimizacion complementaria a Presidio: segun la evaluacion del autor, reduce la precision de un atacante Phi-4-mini a 0.1500 frente a 0.3600 con Presidio, por lo que puede combinarse con redaccion de PII explicita.
- Investigacion en privacidad inferencial: sirve como baseline reproducible para experimentos sobre PromptPAI y SynthPAI con un coste computacional bajo.
- Filtrado previo en sistemas de atencion al cliente: reescribe consultas de usuarios antes de registrarlas en logs o de enviarlas a modelos de terceros.
- Entrenamiento de modelos downstream con datos menos identificables: permite generar variantes de prompts que conservan la intencion pero eliminan senales demograficas.

## Benchmarks y rendimiento

| Benchmark | Metrica | Resultado |
|---|---|---|
| Span-Annotated Benchmark 50 (53 casos) | Pass rate | 46/53 (86.8%) |
| Span-Annotated Benchmark 50 | Tasa media de eliminacion de spans PII | 1.0000 |
| Span-Annotated Benchmark 50 | Fallos de copy-through | 0 |
| Held-Out Adversary Phi-4-mini-instruct, PromptPAI n=50 | Precision del atacante, texto crudo | 0.3650 |
| Held-Out Adversary Phi-4-mini-instruct, PromptPAI n=50 | Precision del atacante, Presidio PII-redacted | 0.3600 |
| Held-Out Adversary Phi-4-mini-instruct, PromptPAI n=50 | Precision del atacante, prompt-only Qwen2.5-1.5B | 0.1850 |
| Held-Out Adversary Phi-4-mini-instruct, PromptPAI n=50 | Precision del atacante, QLoRA SFT (este adaptador) | 0.1500 (reduccion relativa del 58.9% frente a crudo/Presidio) |

## Requisitos de hardware

- VRAM estimada: aproximadamente 1-1.5 GB en 4-bit NF4 para el modelo base mas el adaptador; en fp16/bf16 alrededor de 3-3.5 GB.
- GPU recomendadas: cualquier GPU con 4 GB o mas de VRAM para inferencia en 4-bit; A100/H100 sobredimensionadas para este tamano.
- Cabe en GPU de consumo: si, en RTX 3050/3060/4060 y superiores con cuantizacion 4-bit.
- Opciones de despliegue: transformers + peft (uso documentado), text-generation-inference (tag endpoints_compatible), vLLM con soporte LoRA; llama.cpp/Ollama no estan documentados para este adaptador.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| InferenceGuard Privacy Rewriter (este) | 1.543.714.304 (base) + LoRA | no disponible | Reescritura para privacidad inferencial | cc-by-nc-sa-4.0 | Hugging Face |
| Qwen/Qwen2.5-1.5B-Instruct (base) | 1.500 millones aprox. | no disponible | Instruccion general | no disponible | Hugging Face |
| Presidio (herramienta, no LLM) | n/a | n/a | Redaccion de PII explicita | MIT (segun proyecto) | open source |
| Qwen2.5-7B-Instruct (generador del dataset) | 7.000 millones aprox. | no disponible | Instruccion general | no disponible | Hugging Face |

No se dispone de datos de benchmarks comparativos con otros adaptadores de privacidad en la informacion proporcionada.

## Limitaciones y advertencias

- Licencia cc-by-nc-sa-4.0: prohibido el uso comercial y obligacion de compartir bajo la misma licencia las obras derivadas.
- Solo soporta ingles; no se documentan otros idiomas.
- Entrenado con datos sinteticos (SynthPAI) y filtros automaticos; puede generalizar mal a dominios o estilos de prompt no representados.
- No sustituye a la redaccion de PII explicita: segun la evaluacion, Presidio y el rewriter obtienen resultados distintos y complementarios; el atacante aun alcanza 0.1500 de precision.
- Riesgo de sobre-reescritura: puede eliminar contexto util si la tarea depende de atributos demograficos legitimos.
- No se documenta longitud de contexto efectiva, comportamiento multilingue ni robustez frente a ataques adversariales mas alla de Phi-4-mini-instruct.
- Riesgo de alucinacion inherente al modelo base de 1.500 millones de parametros.
- No se documentan sesgos especificos; al entrenarse sobre reescrituras de un modelo mayor, puede heredar sesgos de Qwen2.5-7B-Instruct.

## Enlaces

- Hugging Face: https://huggingface.co/AT707/inferenceguard-rewriter-v1
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- No se han encontrado en la informacion proporcionada enlaces a papers, blogs, repositorios ni demos adicionales.
