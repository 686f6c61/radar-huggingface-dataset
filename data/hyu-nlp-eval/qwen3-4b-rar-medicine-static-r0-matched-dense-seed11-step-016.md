# HYU-NLP-EVAL/qwen3-4b-rar-medicine-static-r0-matched-dense-seed11-step-016

# Qwen3-4B RaR-Medicine static R0 matched dense, step 16

## Resumen

Este repositorio contiene un checkpoint intermedio de un experimento de ajuste por refuerzo sobre el modelo Qwen/Qwen3-4B-Instruct-2507. Lo publica la organizacion HYU-NLP-EVAL (Universidad de Hanyang, segun la nomenclatura del identificador) dentro de una campana de evaluacion denominada "RaR-Medicine", que trabaja con rubricas como senal de recompensa ("Rubrics as Rewards", interpretacion no confirmada explicitamente por el autor). El artefacto concreto es la variante "static R0 matched dense" con semilla 11, correspondiente al paso 16 de entrenamiento del run `phase1-static-r0-medicine-qwen3-4b-matched-dense-20260928-seed11`.

El modelo resuelve un problema puramente metodologico: servir como punto de control reproducible para auditar el efecto de distintas estrategias de recompensa por rubricas en tareas de dominio medico, comparando la variante estatica (R0) con las variantes dinamicas (OnlineRubrics) del mismo experimento. No es un modelo de producto ni un asistente medico: la propia model card indica "Research use only" y los checkpoints hermanos de la misma campana declaran explicitamente que no se hace ninguna afirmacion sobre capacidad medica o seguridad clinica.

Tecnicamente es un transformer denso de 4.022.468.096 parametros (aproximadamente 4B), derivado por fine-tuning del Qwen3-4B-Instruct-2507, un modelo con arquitectura Qwen3, licencia Apache 2.0 y ventana de contexto larga. El repositorio publica los pesos en BF16 para inferencia, ademas de los ficheros originales del checkpoint de veRL en el subdirectorio `original_checkpoint/`. El interes actual de este tipo de artefactos es acotado pero claro: documentar y reproducir experimentos de RLHF/GRPO en dominios sensibles, no desplegarlo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen3); tamano de capas y atencion no detallados en la informacion proporcionada |
| Parametros totales | 4.022.468.096 (dato real de safetensors) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No confirmada en la ficha del checkpoint. La ficha de un modelo hermano de la misma campana (via featherless.ai) indica 32.768 tokens. El modelo base Qwen3-4B-Instruct-2507 declara una ventana nativa muy superior, pero no se verifica en este repositorio |
| Tipos de cuantizacion | No disponible. El repositorio publica pesos en BF16; no se listan variantes GGUF, AWQ, GPTQ ni FP8 |
| Idiomas soportados | No disponible (el modelo base Qwen3 es multilingue, pero el autor no declara idiomas para este checkpoint) |
| Licencia | Apache 2.0 (con la restriccion adicional declarada por el autor: "Research use only") |
| Formato de pesos | safetensors (BF16) ademas de los ficheros originales del checkpoint de veRL en `original_checkpoint/` |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3-4B-Instruct-2507, un transformer denso con atencion por consulta agrupada (GQA) y soporte de contexto largo. El checkpoint no modifica la arquitectura: es un ajuste de pesos obtenido por aprendizaje por refuerzo. El run de origen se identifica como `phase1-static-r0-medicine-qwen3-4b-matched-dense-20260928-seed11`, lo que sugiere una fase 1 de auditoria, una recompensa basada en rubricas estaticas (R0), una condicion "matched dense" de control y la semilla 11.

El metodo de optimizacion mas probable es GRPO (Group Relative Policy Optimization) sobre recompensas derivadas de rubricas, segun se deduce del nombre del run y de las fichas de los checkpoints hermanos de la misma campana, que describen explicitamente "dynamic OnlineRubrics-Every GRPO training, distinct from static-rubric GRPO". El autor no publica en esta ficha el numero de tokens de entrenamiento, la composicion del dataset medico, ni si hubo una fase previa de SFT o DPO. Tampoco se documenta ninguna innovacion arquitectonica adicional (decodificacion especulativa, atencion lineal, SSM hibrida): se trata de un transformer denso convencional.

Un detalle relevante: los checkpoints hermanos de la campana indican "thinking disabled", es decir, el modo de razonamiento extendido de Qwen3 esta desactivado en las politicas entrenadas. No se confirma en esta ficha concreta, pero es plausible que aplique al mismo run.

## Capacidades

- Generacion de texto conversacional: el pipeline declarado es `text-generation` con tag `conversational`, heredado del modelo base Instruct.
- Razonamiento y respuesta a instrucciones: capacidades heredadas de Qwen3-4B-Instruct-2507, sujetas a la degradacion o especializacion que haya introducido el entrenamiento con RL.
- Dominio medico, en teoria: el run se denomina "RaR-Medicine" y entrena con rubricas de tematica medica, pero el autor no declara ninguna capacidad clinica verificada.
- Tool calling / function calling: no confirmado en la informacion disponible. El modelo base lo soporta, pero este checkpoint no lo documenta.
- Capacidades de agente y razonamiento multi-paso: no confirmadas.
- Modo de razonamiento extendido ("thinking"): los checkpoints hermanos de la campana declaran thinking desactivado; no confirmado aqui.
- Vision, audio u otras modalidades: no disponible.
- Multilingue: no disponible a nivel de ficha, aunque el modelo base es multilingue.

## Casos de uso

- Auditoria de metodos de RLHF/GRPO: el proposito principal del checkpoint es servir como estado intermedio reproducible (paso 16, semilla 11) en una comparativa entre recompensas por rubricas estaticas y dinamicas. Se usaria cargando el checkpoint con transformers y evaluandolo con el mismo conjunto de rubricas con el que se entreno.
- Analisis de estabilidad de politicas durante el entrenamiento: al existir checkpoints en distintos pasos (se han localizado al menos los pasos 003, 012, 013, 016 y 036 en la misma campana), permite trazar la evolucion del comportamiento a lo largo del RL y detectar colapso o mode collapse.
- Reproduccion academica de experimentos de RL con veRL: el repositorio incluye el checkpoint original de veRL en `original_checkpoint/`, lo que facilita reanudar el entrenamiento o auditar los pesos con el mismo framework.
- Estudios de sesgo y safety en dominios medicos: util como material de investigacion para medir como una recompensa por rubricas en tematica sanitaria altera la tasa de respuestas inseguras o la tendencia a la alucinacion.
- Benchmarking de robustez frente al modelo base: comparar Qwen3-4B-Instruct-2507 sin ajustar contra este checkpoint para cuantificar exactamente que ha cambiado el RL.
- Docencia y formacion en tecnicas de RL: ejemplo real de artefacto intermedio de un pipeline GRPO, util para explicar el ciclo de checkpoints y semillas en entrenamientos a gran escala.

No se recomienda su uso, ni siquiera experimental, en atencion al paciente, triaje, informacion farmacologica al publico o cualquier canal de asesoramiento sanitario.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MMLU, HumanEval, GSM8K, MedQA ni ninguna otra metrica, y el autor declara de forma explicita que no se hace ninguna afirmacion sobre capacidad medica o seguridad.

## Requisitos de hardware

- Pesos en BF16: 4.022.468.096 parametros x 2 bytes = aproximadamente 8,05 GB solo en pesos.
- VRAM total estimada para inferencia en BF16 (estimacion, no dato del autor): en torno a 10-12 GB con contexto corto, mas el coste de la cache KV, que crece linealmente con la longitud de contexto y puede anadir varios GB en ventanas largas.
- Cabe en GPU de consumo: si, en RTX 3060 12 GB, RTX 4070 Ti / 4070 Super 12 GB, RTX 4060 Ti 16 GB, RTX 4080 / 4090 16-24 GB. En tarjetas de 8 GB requeriria cuantizacion a 8 bits o inferior, no publicada por el autor.
- GPU profesionales: A100 40/80 GB, H100, L40S, A6000. Para una sola replica de 4B en BF16 sobra cualquiera de ellas.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (tag explicito), endpoints compatibles (tag `endpoints_compatible`) y vLLM como servidor compatible con transformers. llama.cpp u Ollama solo serian viables tras una conversion manual a GGUF, ya que el repositorio no publica cuantizaciones GGUF.
- Latencia y throughput: no disponibles. No se han publicado mediciones del autor.

## Comparativa con modelos similares

Los datos de la columna de modelos comparables corresponden a la documentacion publica de cada modelo, no a mediciones hechas sobre este checkpoint.

| Modelo | Parametros | Contexto | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| HYU-NLP-EVAL/qwen3-4b-rar-medicine-static-r0-matched-dense-seed11-step-016 | 4.022.468.096 | No confirmado (un checkpoint hermano indica 32.768 tokens) | Fine-tuning por RL (GRPO con rubricas) sobre Qwen3-4B-Instruct-2507, paso 16 | Apache 2.0, con "Research use only" declarado por el autor | Repositorio HuggingFace, 0 descargas, 0 likes |
| Qwen/Qwen3-4B-Instruct-2507 (modelo base) | ~4B | 262.144 tokens nativos segun la documentacion de Qwen | SFT + RL sobre Qwen3-4B | Apache 2.0 | Ampliamente distribuido, con cuantizaciones GGUF/AWQ/GPTQ de terceros |
| Qwen/Qwen3-4B (base preentrenado) | ~4B | 32.768 tokens nativos, extensible | Preentrenamiento + post-entrenamiento | Apache 2.0 | Muy extendido, ecosistema de cuantizaciones maduro |
| Gemma 3 4B IT (Google) | ~4B | 128.000 tokens | Post-entrenamiento propietario | Terminos de uso de Gemma | Ampliamente distribuido, con cuantizaciones oficiales |

Frente a estos, el checkpoint de HYU-NLP-EVAL no aporta ninguna ventaja competitiva: es un artefacto de investigacion sin validacion, sin benchmarks y sin cuantizaciones publicadas. Su unico valor es la trazabilidad experimental dentro de la campana "RaR-Medicine".

## Limitaciones y advertencias

- Checkpoint intermedio, no final: el paso 16 de un run de RL no representa una politica convergida ni optimizada. La calidad puede ser inferior a la del modelo base.
- Sin validacion de capacidades: el autor no aporta ningun benchmark, ninguna evaluacion medica y ninguna prueba de seguridad.
- Riesgo de alucinacion elevado en dominio sanitario: al estar ajustado con recompensas de tematica medica, puede producir respuestas con apariencia de autoridad clinica sin respaldo factual. No debe usarse para decisiones clinicas.
- Restriccion de uso declarada: aunque la licencia del modelo base es Apache 2.0, la model card indica "Research use only". Es una restriccion del autor que debe respetarse, especialmente en despliegues comerciales o sanitarios.
- Idiomas no declarados: no hay garantia de comportamiento correcto fuera del ingles o del chino, idiomas predominantes del modelo base.
- Contexto no confirmado: la unica referencia a 32.768 tokens proviene de una ficha de terceros sobre un checkpoint hermano, no del repositorio de este modelo.
- Sin cuantizaciones publicadas: no hay GGUF, AWQ ni GPTQ, lo que encarece el despliegue en hardware modesto y obliga a convertir los pesos manualmente.
- Sesgos: no documentados por el autor. Cualquier sesgo presente en Qwen3-4B-Instruct-2507 se hereda, y el entrenamiento con rubricas medicas puede introducir sesgos adicionales no medidos.
- Trazabilidad limitada: el nombre del run contiene la fecha 20260928 y la ficha se creo en octubre de 2026. La nomenclatura del repositorio es interna y no se acompana de un informe tecnico publico.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, sin issues ni discusion que permitan contrastar resultados.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/HYU-NLP-EVAL/qwen3-4b-rar-medicine-static-r0-matched-dense-seed11-step-016
- Checkpoint hermano (OnlineRubrics, paso 013): https://huggingface.co/HYU-NLP-EVAL/qwen3-4b-rar-medicine-onlinerubrics-seed11-step-013
- Checkpoint hermano (OnlineRubrics, paso 003): https://huggingface.co/HYU-NLP-EVAL/qwen3-4b-rar-medicine-onlinerubrics-seed11-step-003
- Checkpoint hermano (OnlineRubrics, paso 012) en FriendliAI: https://friendli.ai/models/HYU-NLP-EVAL/qwen3-4b-rar-medicine-onlinerubrics-seed11-step-012
- Checkpoint hermano (OnlineRubrics, paso 013) en Featherless AI: https://featherless.ai/models/HYU-NLP-EVAL/qwen3-4b-rar-medicine-onlinerubrics-seed11-step-013
- Entrada de registro del checkpoint hermano "static R0 matched seed11 step 036" en Free2AITools: https://free2aitools.com/model/hyu-nlp-eval/qwen3-4b-rar-medicine-static-r0-matched-seed11-step-036
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
