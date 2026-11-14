# Selyviel/Qwen3-4B-Medical-COT

## Resumen

Selyviel/Qwen3-4B-Medical-COT es un ajuste fino (fine-tuning) del modelo Qwen3-4B-Instruct-2507 en su variante cuantizada a 4 bits publicada por Unsloth. Lo desarrolla el usuario Selyviel y se distribuye bajo licencia Apache 2.0. El nombre sugiere una especializacion en dominio medico con generacion de cadenas de razonamiento (chain-of-thought, COT), aunque la model card no documenta explicitamente ni el dataset ni la metodologia de entrenamiento empleada.

El modelo parte de la familia Qwen3, una arquitectura transformer densa de 4.000 millones de parametros desarrollada por Alibaba, con soporte nativo de contexto largo y modo instruct. El ajuste fino se ha realizado con Unsloth, una libreria de entrenamiento optimizada que reduce el consumo de memoria y acelera el proceso aproximadamente el doble respecto a un entrenamiento convencional con TRL.

La relevancia de esta ficha es limitada en terminos de evidencia: se trata de un modelo recien subido (noviembre de 2026) sin descargas ni valoraciones, sin benchmarks publicados y con una model card minima que no detalla el corpus de entrenamiento ni los hiperparametros. Debe evaluarse como un experimento comunitario, no como un modelo medico validado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen3) |
| Parametros totales | 4.000 millones (heredados del modelo base Qwen3-4B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Qwen3-4B-Instruct-2507 soporta contexto largo, pero el valor exacto no se documenta en esta ficha) |
| Tipos de cuantizacion | el modelo base de partida esta en bnb-4bit; el repo publicado contiene pesos en safetensors (tamano 0.1 GB, lo que sugiere pesos cuantizados o un subconjunto de los mismos) |
| Idiomas soportados | en (segun la model card) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino supervisado del checkpoint unsloth/Qwen3-4B-Instruct-2507-unsloth-bnb-4bit, que a su vez es una conversion a 4 bits del Qwen3-4B-Instruct-2507 de Alibaba. La arquitectura subyacente es un transformer decoder-only denso con atencion por cabezas (multi-head attention) y las innovaciones propias de la generacion Qwen3, aunque la model card no las detalla. El entrenamiento se realizo con Unsloth, lo que implica tecnicas de LoRA/QLoRA optimizadas en kernels y gestion de memoria, segun la propia plantilla de la model card.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF/DPO ni los hiperparametros del ajuste. El sufijo "COT" en el nombre sugiere que el corpus de entrenamiento contiene ejemplos con cadenas de razonamiento explicito orientadas a preguntas medicas, pero esto es una inferencia a partir del nombre y no un dato documentado. Tampoco se especifica si se aplicaron tecnicas de decodificacion especulativa, atencion lineal u otras optimizaciones de inferencia.

## Capacidades

- Generacion de texto en ingles con estilo instruct, heredada del modelo base Qwen3-4B-Instruct-2507.
- Razonamiento paso a paso (chain-of-thought) presumiblemente reforzado por el ajuste fino, segun indica el sufijo COT del nombre; no verificado con benchmarks.
- Respuesta a preguntas de dominio medico en ingles, segun la intencion declarada por el nombre del modelo; sin validacion publica.
- Soporte de tool calling y function calling: no documentado en la model card; el modelo base Qwen3 lo soporta, pero no se confirma que se conserve tras el ajuste.
- Capacidades de agente y razonamiento multi-paso: no documentadas.
- Capacidades multilingues: la model card declara unicamente ingles; el modelo base Qwen3 es multilingue, pero el ajuste puede haber degradado otros idiomas.
- Capacidades especiales (vision, audio, thinking mode explicito): no disponibles en la informacion proporcionada.

## Casos de uso

- Prototipado de asistentes de triaje medico en ingles: el modelo puede generar respuestas razonadas ante sintomas descritos en texto, util como prueba de concepto en entornos de investigacion, nunca como sustituto de diagnostico clinico.
- Generacion de explicaciones educativas para estudiantes de medicina: dado su enfoque COT, puede producir cadenas de razonamiento que ilustren el proceso diagnostico paso a paso en casos de estudio.
- Extraccion de informacion de notas clinicas en ingles: con contexto suficiente, puede resumir o estructurar historiales, siempre con revision humana obligatoria.
- Generacion de preguntas y respuestas para datasets medicos sinteticos: util para aumentar corpus de entrenamiento o evaluacion en proyectos de investigacion.
- Chatbot de apoyo a pacientes en ingles: conversaciones multi-turno sobre informacion general de salud, con avisos legales y derivacion a profesionales.
- Fine-tuning adicional o experimentacion academica: al ser Apache 2.0 y de 4B parametros, es adecuado para investigadores que quieran partir de un checkpoint medico y adaptarlo a su propio corpus.
- Evaluacion comparativa de ajustes finos comunitarios: sirve como caso de estudio de que calidad se obtiene con Unsloth sobre Qwen3-4B en dominios especializados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de 4B en safetensors de 0.1 GB (probablemente pesos cuantizados a 4 bits), la inferencia en 4 bits requiere aproximadamente 3-4 GB de VRAM; en fp16 serian necesarios unos 8-9 GB.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090, A100 o H100 para despliegues con mayor concurrencia.
- Cabe en GPU de consumo: si, en tarjetas con al menos 8 GB en cuantizacion 4 bits y 12 GB en fp16.
- Opciones de despliegue: transformers, text-generation-inference (TGI, etiquetado en el repo), vLLM, llama.cpp y Ollama si se generan pesos GGUF (no incluidos en el repo).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Selyviel/Qwen3-4B-Medical-COT | 4B | no disponible | Apache 2.0 | Hugging Face, 0 descargas | Ajuste fino comunitario sin benchmarks |
| Qwen/Qwen3-4B-Instruct-2507 | 4B | no disponible en esta ficha | Apache 2.0 | Hugging Face, ampliamente usado | Modelo base oficial, con evaluaciones publicadas por Alibaba |
| unsloth/Qwen3-4B-Instruct-2507-unsloth-bnb-4bit | 4B | no disponible | Apache 2.0 | Hugging Face | Conversion cuantizada del base, usada como punto de partida |
| Meditron o BioMistral (familia medica) | 7B-8B | variable | variable | Hugging Face | Alternativas medicas de mayor tamano, con benchmarks publicados |

La comparacion directa con modelos medicos especializados no es posible sin datos de evaluacion del checkpoint de Selyviel. Frente al Qwen3-4B-Instruct-2507 original, la unica diferencia documentada es el ajuste fino con Unsloth y el enfoque COT/medico declarado en el nombre.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay evidencia publica de mejora sobre el modelo base ni de calidad en tareas medicas.
- Riesgo elevado de alucinacion en dominio clinico: un modelo de 4B ajustado con datos no documentados no es fiable para decisiones medicas.
- Model card minima: no se especifican dataset, hiperparametros, metodologia de evaluacion ni limitaciones conocidas.
- Idioma limitado al ingles segun la model card; el rendimiento en castellano no esta garantizado.
- El checkpoint de partida esta cuantizado a 4 bits (bnb-4bit), lo que puede introducir perdida de calidad respecto al Qwen3-4B original en fp16/bf16.
- Sin descargas ni validacion de la comunidad: no hay evidencia de uso en produccion ni reportes de calidad.
- Licencia Apache 2.0 permite uso comercial, pero la responsabilidad legal y etica del uso medico recae integramente en el desplegador.
- No apto para diagnostico, tratamiento ni consejo medico sin supervision de profesionales sanitarios y validacion regulatoria.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/Selyviel/Qwen3-4B-Medical-COT)
- [Modelo base en Hugging Face](https://huggingface.co/unsloth/Qwen3-4B-Instruct-2507-unsloth-bnb-4bit)
- [Repositorio de Unsloth](https://github.com/unslothai/unsloth)
- [Familia Qwen3 en Hugging Face](https://huggingface.co/Qwen)
