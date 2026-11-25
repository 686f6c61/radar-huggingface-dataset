# bhimaailabs/Ambedkar-v1-qwen3.5-2b-lora

## Resumen

Ambedkar-v1-qwen3.5-2b-lora es un adaptador LoRA desarrollado por Bhima AI Labs sobre el modelo base Qwen/Qwen3.5-2B, un transformer causal de 2.000 millones de parametros. El adaptador se ha entrenado mediante supervisión fina (SFT) con Unsloth sobre un conjunto de datos propio de situaciones legales indias, y su objetivo declarado no es memorizar derecho, sino aprender un comportamiento concreto: citar los pasajes que recibe, rechazar educadamente cuando la informacion es insuficiente y formular preguntas aclaratorias cuando faltan hechos.

El modelo esta disenado para integrarse en un pipeline RAG (generacion aumentada por recuperacion) junto a un recuperador de legislacion vigente y verificada. Cubre dominios como cheques sin fondos, consumo y comercio electronico (CPA 2019), RERA e inmobiliario, salarios, disputas industriales, la Ley de Tecnologia de la Informacion, RTI, fraude y la traduccion de normativa antigua a nueva (IPC a BNS, entre otras). Soporta ingles, hindi e hinglish.

Es relevante ahora porque propone un enfoque de "formato sobre conocimiento" en modelos pequenos para dominios regulados: en lugar de exigir al modelo que recuerde legislacion, se le ensena a razonar sobre evidencia recuperada. El repositorio ocupa 0,1 GB y se distribuye bajo licencia Apache-2.0, aunque el modelo base tiene su propia licencia que debe respetarse.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (modelo base Qwen/Qwen3.5-2B) con adaptador LoRA |
| Parametros totales | 2.000 millones (modelo base); el adaptador LoRA es de rango bajo |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Ingles, hindi e hinglish (el dataset incluye una pequena proporcion etiquetada como "other") |
| Licencia | Apache-2.0 para el adaptador y el dataset; el modelo base tiene su propia licencia |
| Formato de pesos | Safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se monta sobre Qwen/Qwen3.5-2B, un transformer causal de 2.000 millones de parametros. La tecnica empleada es LoRA (Low-Rank Adaptation) mediante PEFT, con entrenamiento supervisado (SFT) realizado con Unsloth y las librerias Transformers y TRL. El repositorio contiene unicamente los pesos del adaptador, no el modelo completo; existe una version fusionada publicada como Ambedkar-v1.

El conjunto de entrenamiento, bhimaailabs/indian-legal-situations, consta de aproximadamente 2.700 ejemplos generados a partir de pasajes de vaquill/open-india-law. Las respuestas fueron producidas por generadores LLM de terceros (NIM, Sarvam, Groq y Google). La composicion linguistica es mayoritariamente inglesa, con aproximadamente un 21% de filas en hinglish y un 9% en hindi. El autor advierte de que la revision por abogados de una muestra de 100 filas sigue pendiente y que un 22,4% de las filas llevan la etiqueta `high_spurious_citation` y un 2,1% la etiqueta `genuinely_unfaithful`.

## Capacidades

- Generacion de texto conversacional en el dominio legal indio, con formato estructurado y cuidadoso.
- Citacion de los pasajes recuperados que se le proporcionan en el contexto.
- Rechazo educado cuando los pasajes no responden a la pregunta, en lugar de inventar provisiones legales.
- Formulacion de preguntas aclaratorias cuando faltan hechos clave en la situacion descrita.
- Respuesta multilingue en ingles, hindi e hinglish.
- Traduccion de normativa antigua a nueva (por ejemplo, IPC a BNS).
- Aprendizaje de formato y comportamiento para RAG, no de conocimiento legal memorizado.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, vision ni audio.

## Casos de uso

- Asistente legal con RAG para ciudadania: el adaptador se coloca detras de un recuperador de legislacion vigente y responde citando los pasajes, lo que permite ofrecer orientacion inicial con trazabilidad de fuentes.
- Cheques sin fondos y reclamaciones de consumo: el modelo puede guiar al usuario por los pasos y plazos aplicables a partir de los fragmentos de CPA 2019 o de la normativa de titulos cambiarios recuperados.
- RERA e inmobiliario: atencion de consultas sobre plazos de promotores, registro de proyectos y reclamaciones, siempre que el recuperador aporte el texto vigente.
- Traduccion de normativa antigua a nueva: util para despachos y ONG que necesitan mapear referencias del IPC al BNS o de la antigua CrPC a la nueva normativa.
- Formacion y simulacion de entrevistas legales: el modelo practica la formulacion de preguntas aclaratorias, util para entrenar a personal de atencion juridica.
- Investigacion sobre aprendizaje de formato en modelos pequenos: sirve como punto de partida para fine-tuning adicional con datos revisados por abogados.
- Atencion al cliente en e-commerce con componente regulatorio: consultas sobre devoluciones, garantias y derechos del consumidor usando pasajes recuperados de la CPA 2019.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; para un modelo de 2.000 millones de parametros en precision completa se necesitan aproximadamente 8 GB, y en cuantizacion de 4 bits alrededor de 2-3 GB, aunque estas cifras no las proporciona el autor.
- GPU recomendadas: no disponibles en la informacion del autor. Por tamano, un modelo de 2B puede ejecutarse en GPU de consumo como RTX 3060, RTX 4060 o superiores, y en GPU de datacenter como A100 o H100, pero no hay datos oficiales.
- Cabe en GPU de consumo: previsiblemente si, en funcion de la cuantizacion, aunque no hay confirmacion oficial.
- Opciones de despliegue: el adaptador se carga con PEFT y Transformers junto al modelo base; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ambedkar-v1-qwen3.5-2b-lora | 2B (base) + LoRA | No disponible | RAG legal indio, formato sobre conocimiento | Apache-2.0 (adaptador) | Hugging Face |
| Qwen/Qwen3.5-2B | 2B | No disponible | Modelo base generalista | Segun licencia del base | Hugging Face |
| Ambedkar-v1 | 2B (fusionado) | No disponible | Version fusionada del adaptador | Apache-2.0 | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo prioriza el formato sobre el conocimiento: sin pasajes adecuados puede alucinar secciones, penalizaciones o plazos.
- Los datos de entrenamiento son sinteticos y no estan verificados por abogados; la revision de una muestra de 100 filas sigue pendiente.
- Un 22,4% de las filas llevan la etiqueta `high_spurious_citation` y un 2,1% `genuinely_unfaithful`, por lo que el modelo puede haber aprendido citas espurias.
- Algunos pasajes recuperados pueden provenir de leyes derogadas (IPC, ID Act, antigua CrPC); es imprescindible validar el recuperador para legislacion vigente.
- Modelo pequeno (2B) y dataset pequeno (unos 2.700 ejemplos): se esperan errores en situaciones inusuales, estatutos largos y texto no ingles.
- Cobertura linguistica limitada: el hindi y el hinglish estan presentes pero en menor proporcion que el ingles.
- Excluye deliberadamente situaciones sensibles como violencia domestica, delitos sexuales, suicidio y abuso infantil, que requieren tratamiento revisado por abogados.
- No cubre derecho especifico de cada estado (arrendamientos, timbre, normativa laboral estatal).
- No debe usarse como asesoramiento legal ni como autoridad legal autonoma; requiere revision por un abogado cualificado antes de cualquier despliegue.
- Los generadores de terceros usados para crear las respuestas de entrenamiento tienen sus propios terminos que deben revisarse si se redistribuye el dato.
- El adaptador no funciona sin su modelo base compatible.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/bhimaailabs/Ambedkar-v1-qwen3.5-2b-lora
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Modelo fusionado: https://huggingface.co/bhimaailabs/Ambedkar-v1
- Dataset de entrenamiento: https://huggingface.co/datasets/bhimaailabs/indian-legal-situations
- Fuente de pasajes: https://huggingface.co/vaquill/open-india-law
- Demo: no disponible
