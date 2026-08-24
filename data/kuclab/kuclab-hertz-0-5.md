# KucLab/kuclab-hertz-0.5

## Resumen

KucLab Hertz 0.5 es un asistente conversacional bilingüe checo-inglés especializado en STEM, programación y desarrollo web, desarrollado por KucLab sobre el modelo base `google/gemma-4-12B-it` de Google. Se trata de un fine-tuning LoRA (r=8, alpha=16) fusionado en los pesos del modelo base, entrenado mediante QLoRA sobre un corpus auto-destilado. El objetivo principal de esta versión es modificar la personalidad del modelo hacia un tono más directo y con humor seco u oscuro, reduciendo las muletillas reflexivas del tipo «como IA no puedo…», y mejorar la calidad del código web generado evitando patrones genéricos de «AI slop».

El modelo hereda del base una ventana de contexto de 262 144 tokens, aunque se despliega por defecto con `num_ctx` de 65 536. Los pesos se distribuyen en formato GGUF (cuantización Q4_K_M, aproximadamente 7,4 GB) para su uso con llama.cpp u Ollama, junto con el adaptador LoRA crudo. La licencia es Apache 2.0, lo que permite uso comercial sin restricciones. Su relevancia radica en ser un ejemplo de fine-tuning dirigido a un idioma minoritario (checo) con un corpus muy reducido (1036 filas), y en la transparencia con la que se publican las regresiones de rendimiento detectadas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (base: `google/gemma-4-12B-it`) |
| Parametros totales | 11,95 mil millones (base) |
| Parametros activos | no aplicable (modelo denso) |
| Longitud de contexto | 262 144 tokens (nativo), 65 536 por defecto en despliegue |
| Tipos de cuantizacion | GGUF Q4_K_M (7,4 GB) |
| Idiomas soportados | Checo (cs), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF, safetensors (adaptador LoRA) |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base `gemma-4-12B-it`, un transformer denso de 11,95 mil millones de parámetros con soporte nativo de 262 144 tokens de contexto y capacidades de *tool calling*. Hertz 0.5 se obtiene mediante un fine-tuning LoRA de rango 8 y alpha 16, entrenado con QLoRA y fusionado en los pesos base en bf16 antes de cuantizarse a GGUF. El corpus de entrenamiento consta de 1036 filas: 285 nuevas generadas en esta ronda mediante auto-destilación (conceptos STEM, personalidad/humor, componentes de desarrollo web y planificación de agentes paso a paso) y 736 filas reutilizadas del corpus de Hertz 0.4.

El proceso de auto-destilación utiliza a `Qwen3.8-27B` de Alibaba/Tongyi como modelo maestro que genera las respuestas de entrenamiento, sin que el propio Hertz participe en la generación de datos. No se menciona el uso de RLHF ni DPO en el proceso. La innovación principal es la dirección del fine-tuning hacia la personalidad y el estilo de salida, más que hacia la capacidad bruta, lo que produce un cambio medible en el comportamiento del modelo.

## Capacidades

- Generación de texto conversacional en checo e inglés con personalidad directa y humor seco u oscuro, evitando muletillas reflexivas en temas cotidianos.
- Razonamiento STEM en física, química, biología y matemáticas, aunque con una precisión inferior a la del modelo base.
- Generación de código limpio para desarrollo web (HTML/CSS), entrenado para evitar patrones genéricos de «AI slop» como degradados, glassmorphism o textos de marketing clichés.
- Soporte de *tool calling* y *function calling*: el modelo base lo soporta de forma nativa, pero el fine-tuning no ha añadido ejemplos de entrenamiento específicos para uso de herramientas.
- Planificación de agentes paso a paso (*agentic step-by-step planning*) gracias a los ejemplos añadidos en esta versión.
- Terminología científica checa-inglesa mejorada: el modelo logra el mejor resultado del proyecto en el benchmark de términos técnicos (75,7 % total).
- Identificación correcta como modelo KucLab (no como «Gemma») mediante el sistema de prompts y el LoRA.

## Casos de uso

- **Asistencia STEM en checo**: estudiantes e investigadores de habla checa pueden plantear problemas de física, matemáticas o química en su idioma nativo y recibir explicaciones coherentes. El modelo está entrenado específicamente con terminología científica checa, aunque su precisión en opción múltiple es inferior al modelo base.
- **Generación de código web con estilo propio**: desarrolladores web que buscan componentes HTML/CSS limpios y sin el aspecto genérico de las IA. El modelo está entrenado para evitar gradientes, glassmorphism y textos de marketing cliché, produciendo código semántico y honesto.
- **Traducción de terminología científica checo-inglés**: el modelo logra un 81,6 % en CS→EN y un 69,9 % en EN→CS en el benchmark de 206 términos técnicos, siendo útil para documentación técnica, papers y glosarios.
- **Chat con personalidad en entornos de soporte**: para comunidades checas que quieran un asistente con carácter y sin respuestas evasivas en temas cotidianos. El modelo mantiene los límites de seguridad en solicitudes dañinas, pero evita el exceso de cortesía.
- **Prototipado de agentes con planificación paso a paso**: aunque el fine-tune no añade ejemplos de tool calling, el modelo puede razonar de forma secuencial para tareas de planificación, útil en prototipos de agentes con frameworks como LangChain.
- **Despliegue local en hardware modesto**: con la cuantización Q4_K_M de 7,4 GB, el modelo cabe en GPUs consumer de 8-16 GB y puede ejecutarse con Ollama en una laptop, ideal para aplicaciones offline en contextos educativos.

## Benchmarks y rendimiento

El autor publica resultados de dos benchmarks propios, medidos con la misma metodología, prompts y cuantización (Ollama Q4_K_M) para ambos modelos. Es importante señalar que el subconjunto MMLU-Pro STEM es propio del proyecto (240 preguntas), no la versión oficial completa.

**MMLU-Pro STEM (240 preguntas, subconjunto del proyecto)**

| Materia | Base (gemma-4-12B-it) | Hertz 0.5 | Delta |
|---|---|---|---|
| Biologia | 86,7 % | 78,3 % | −8,4 pp |
| Quimica | 61,7 % | 53,3 % | −8,4 pp |
| Matematicas | 83,3 % | 78,3 % | −5,0 pp |
| Fisica | 71,7 % | 65,0 % | −6,7 pp |
| **Total** | **75,8 %** | **68,8 %** | **−7,0 pp** |

**Terminologia cientifica checa (206 terminos, CS↔EN)**

| Direccion | Hertz 0.3 | Hertz 0.5 | Delta |
|---|---|---|---|
| CS→EN | 79,6 % | 81,6 % | +2,0 pp |
| EN→CS | 51,5 % | 69,9 % | +18,4 pp |
| **Total** | **65,5 %** | **75,7 %** | **+10,2 pp** |

Para contexto, Google publica un 77,2 % en el MMLU-Pro completo para `gemma-4-12B-it`, cercano a la medición del propio proyecto (75,8 %) sobre su subconjunto STEM. La regresión de 7 puntos en el subconjunto STEM es real y confirmada con metodología corregida; el autor lo atribuye a la escasez de datos STEM nuevos en esta ronda.

## Requisitos de hardware

- **VRAM estimada**: el GGUF Q4_K_M pesa aproximadamente 7,4 GB, por lo que cabe en GPUs consumer con 8-16 GB de VRAM (RTX 3070, RTX 4060, RTX 4090, etc.). Con contexto de 65 536 tokens la memoria puede superar los 10-12 GB.
- **GPU recomendadas**: para inferencia local, una RTX 3090/4090 o equivalente ofrece margen suficiente. Para despliegue servidor, A100 o H100 si se usa el modelo sin cuantizar.
- **Opciones de despliegue**: llama.cpp, Ollama (comando `ollama pull hf.co/KucLab/kuclab-hertz-0.5:Q4_K_M`), y compatible con vLLM o TGI si se usan pesos sin cuantizar.
- **Latencia**: no se publican datos de latencia ni throughput en la información disponible. El tamaño de 7,4 GB en Q4_K_M sugiere una generación de unos 30-60 tokens/s en hardware consumer moderno, pero es una estimación no confirmada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MMLU-Pro (subconjunto) | Terminologia checa | Licencia |
|---|---|---|---|---|---|
| **Hertz 0.5** | 11,95B | 262 144 | 68,8 % | 75,7 % | Apache 2.0 |
| **Hertz 0.4** | 11,95B | 262 144 | no publicado | no publicado | Apache 2.0 |
| **Hertz 0.3** | 11,95B | 262 144 | no publicado | 65,5 % | Apache 2.0 |
| `gemma-4-12B-it` (base) | 11,95B | 262 144 | 75,8 % (proyecto) / 77,2 % (oficial) | no aplicable | Apache 2.0 |
| Qwen3.8-27B (teacher) | 27B | no disponible | no disponible | no disponible | Apache 2.0 |

La comparación directa más relevante es con su modelo base `gemma-4-12B-it`: el fine-tuning añade personalidad y mejora la terminología checa, pero sacrifica precisión en STEM. Comparado con otros modelos bilingües checos, no hay datos públicos de modelos comparables en la información disponible.

## Limitaciones y advertencias

- **Regresión en STEM**: la precisión en MMLU-Pro STEM es 7 puntos porcentuales inferior a la del modelo base (68,8 % vs 75,8 %), confirmada con metodología corregida. Esto significa que para tareas de razonamiento matemático o científico puro, el modelo base es mejor.
- **Corpus de entrenamiento muy pequeño**: solo 1036 filas (285 nuevas en esta versión), lo que limita la generalización y puede provocar sobreajuste a los estilos de las respuestas del teacher.
- **Solo dos idiomas**: checo e inglés. No hay soporte para otros idiomas, incluido el español.
- **Tool calling sin entrenamiento específico**: aunque el base soporta function calling, el fine-tune no añadió ejemplos de uso de herramientas, por lo que el rendimiento en tareas de agentes con herramientas no está garantizado.
- **Riesgo de alucinación**: al ser un modelo de 12B con entrenamiento limitado, puede generar respuestas plausibles pero incorrectas en dominios especializados, especialmente en checo donde hay menos datos de preentrenamiento.
- **Sin pasos de des-censura**: el cambio de personalidad no elimina los límites de seguridad reales; las solicitudes dañinas siguen siendo rechazadas.
- **Benchmarks limitados**: los resultados publicados provienen de subconjuntos propios del proyecto, no de los benchmarks públicos completos, por lo que no son directamente comparables con los números oficiales de otros modelos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/KucLab/kuclab-hertz-0.5
- Versión anterior Hertz 0.4: https://huggingface.co/KucLab/kuclab-hertz-0.4
- Versión anterior Hertz 0.3: https://huggingface.co/KucLab/kuclab-hertz-0.3
- Sitio de KucLab: https://kuclab.org/
- Modelo base: https://huggingface.co/google/gemma-4-12B-it
- Entrada en Free2AITools: https://free2aitools.com/model/kuclab/kuclab-hertz-0.4</think>## Resumen

KucLab Hertz 0.5 es un asistente conversacional bilingüe checo e inglés orientado a STEM, programación y desarrollo web, desarrollado por KucLab sobre el modelo base `google/gemma-4-12B-it`. Se trata de un ajuste fino LoRA (r=8, alpha=16) fusionado en los pesos del modelo, entrenado con QLoRA sobre un corpus auto-destilado. El objetivo principal de esta versión es modificar la personalidad del modelo hacia un tono más directo y con humor seco u oscuro, reduciendo las muletillas reflexivas del tipo «como IA no puedo...», y mejorar la calidad del código web generado evitando patrones genéricos de «AI slop».

El modelo hereda del base una ventana de contexto nativa de 262 144 tokens, aunque se despliega por defecto con un `num_ctx` de 65 536. Los pesos se distribuyen en formato GGUF (cuantización Q4_K_M, aproximadamente 7,4 GB) para su uso con llama.cpp u Ollama, junto con el adaptador LoRA crudo. La licencia Apache 2.0 permite uso comercial sin restricciones. Su relevancia radica en ser un ejemplo de ajuste fino dirigido a un idioma de baja representación (checo) con un corpus muy reducido (1036 filas), y en la transparencia con la que se publican las regresiones de rendimiento medidas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (base: `google/gemma-4-12B-it`) |
| Parametros totales | 11,95 mil millones (base) |
| Parametros activos | No aplicable (modelo denso) |
| Longitud de contexto | 262 144 tokens nativo, 65 536 en despliegue por defecto |
| Tipos de cuantizacion | GGUF Q4_K_M (~7,4 GB) |
| Idiomas soportados | Checo (cs), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF, safetensors (adaptador LoRA) |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base `gemma-4-12B-it`, un transformer denso de 11,95 mil millones de parametros con soporte nativo de 262 144 tokens de contexto y capacidades de tool calling. Hertz 0.5 se construye mediante un adaptador LoRA de rango 8 y alpha 16, entrenado con QLoRA y fusionado en los pesos base en bf16 antes de cuantizarse a GGUF.

El corpus de entrenamiento consta de 1036 filas: 285 generadas en esta ronda mediante auto-destilacion (conceptos STEM, personalidad y humor, componentes web, planificacion de agentes paso a paso) y 736 reutilizadas del corpus de Hertz 0.4. El proceso de auto-destilacion utiliza como maestro a Qwen3.8-27B de Alibaba/Tongyi, que genera las respuestas de entrenamiento sin que el propio modelo participe en la generacion de datos. No se menciona el uso de RLHF ni DPO en la informacion disponible.

La innovacion principal del ajuste es el enfoque en personalidad y estilo de salida mas que en capacidad bruta, lo que se refleja en una regresion medible en STEM multiple-choice y una mejora en la terminologia tecnica checa.

## Capacidades

- Generacion de texto en checo e ingles con personalidad directa y humor seco u oscuro, sin exceso de cortesias en temas cotidianos.
- Razonamiento STEM en matematicas, fisica, quimica y biologia, con precision inferior a la del modelo base (regresion confirmada).
- Generacion de codigo HTML/CSS limpio y semantico, entrenado para evitar gradientes, glassmorphism y copy de marketing generico.
- Soporte de tool calling nativo heredado del base, aunque el ajuste no anadio ejemplos especificos de uso de herramientas.
- Planificacion de agentes paso a paso, con ejemplos de agentic step-by-step planning incluidos en los datos de entrenamiento.
- Terminologia cientifica checa-inglesa mejorada, con el mejor resultado del proyecto en el benchmark de terminos (75,7 % total).
- Identificacion correcta como modelo KucLab, no como Gemma, gracias al LoRA y al system prompt.

## Casos de uso

- Asistencia STEM en checo: estudiantes e investigadores de habla checa pueden plantear problemas de fisica, matematicas o quimica en su idioma nativo y recibir respuestas coherentes, aunque con una precision menor que el modelo base.
- Generacion de componentes web con estilo propio: desarrolladores que buscan codigo HTML/CSS sin el aspecto generico de las IA, con HTML semantico, sin gradientes ni glassmorphism y copy honesto.
- Traduccion de terminologia cientifica checo-ingles: con un 81,6 % en CS→EN y un 69,9 % en EN→CS, es util para glosarios, documentacion tecnica y papers.
- Chat con personalidad en comunidades de desarrollo: para foros o bots de soporte donde se busca un asistente con tono directo y humor, sin rechazos reflexivos en temas cotidianos.
- Prototipado de agentes con planificacion paso a paso: los ejemplos de agentic planning permiten usarlo como base para agentes que descomponen tareas en pasos, aunque sin fine-tuning especifico de tool calling.
- Despliegue local en hardware modesto: con el GGUF Q4_K_M de 7,4 GB, puede ejecutarse en GPU consumer de 8-16 GB via Ollama o llama.cpp, ideal para aplicaciones offline educativas en checo.

## Benchmarks y rendimiento

El autor publica dos benchmarks medidos con la misma metodologia, prompts y cuantizacion (Ollama Q4_K_M) para ambos modelos. El subconjunto MMLU-Pro STEM es propio del proyecto (240 preguntas), no la version completa publica.

**MMLU-Pro STEM (subconjunto del proyecto, 240 preguntas)**

| Materia | Base (gemma-4-12B-it) | Hertz 0.5 | Delta |
|---|---|---|---|
| Biologia | 86,7 % | 78,3 % | −8,4 pp |
| Quimica | 61,7 % | 53,3 % | −8,4 pp |
| Matematicas | 83,3 % | 78,3 % | −5,0 pp |
| Fisica | 71,7 % | 65,0 % | −6,7 pp |
| **Total** | **75,8 %** | **68,8 %** | **−7,0 pp** |

**Terminologia cientifica checa (206 terminos CS↔EN)**

| Direccion | Hertz 0.3 | Hertz 0.5 | Delta |
|---|---|---|---|
| CS→EN | 79,6 % | 81,6 % | +2,0 pp |
| EN→CS | 51,5 % | 69,9 % | +18,4 pp |
| **Total** | **65,5 %** | **75,7 %** | **+10,2 pp** |

El MMLU-Pro oficial de Google para `gemma-4-12B-it` es de 77,2 % (test completo de ~12 000 preguntas), lo que sirve como control de coherencia con el subconjunto propio (75,8 %). La regresion de 7 puntos porcentuales en STEM es real y confirmada con metodologia corregida; el autor la atribuye a la escasez de datos STEM nuevos en esta ronda (solo 285 filas nuevas) y al rango bajo del adaptador LoRA (r=8).

## Requisitos de hardware

- VRAM estimada: el GGUF Q4_K_M pesa ~7,4 GB, por lo que cabe en GPUs consumer de 8-16 GB (RTX 3070, RTX 4060, RTX 4090). Con contexto de 65 536 tokens, el uso de memoria puede superar los 10-12 GB.
- GPUs recomendadas: RTX 3090 o RTX 4090 para inferencia local comoda; A100 o H100 para despliegue servidor con pesos sin cuantizar.
- Opciones de despliegue: llama.cpp, Ollama (comando `ollama pull hf.co/KucLab/kuclab-hertz-0.5:Q4_K_M`), y compatible con vLLM o TGI si se usan pesos sin cuantizar.
- Latencia y throughput: no se publican datos en la informacion disponible. Con 7,4 GB en Q4_K_M, se puede esperar una generacion de 30-60 tokens/s en GPUs consumer modernas, aunque es una estimacion no confirmada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MMLU-Pro (subconjunto) | Term. checa | Licencia |
|---|---|---|---|---|---|
| KucLab Hertz 0.5 | 11,95B | 262 144 | 68,8 % | 75,7 % | Apache 2.0 |
| KucLab Hertz 0.4 | 11,95B | 262 144 | no disponible | no disponible | Apache 2.0 |
| KucLab Hertz 0.3 | 11,95B | 262 144 | no disponible | 65,5 % | Apache 2.0 |
| `gemma-4-12B-it` (base) | 11,95B | 262 144 | 75,8 % (proyecto) / 77,2 % (oficial) | no disponible | Apache 2.0 |
| Qwen3.8-27B (teacher) | 27B | no disponible | no disponible | no disponible | Apache 2.0 |

La comparacion mas relevante es con su modelo base: el ajuste fino sacrifica 7,0 puntos en STEM a cambio de personalidad y mejora en terminologia checa. No hay datos publicos de otros modelos bilingues checo-ingles en la informacion disponible.

## Limitaciones y advertencias

- Regresion en STEM confirmada: el modelo pierde 7,0 puntos porcentuales en MMLU-Pro STEM frente al base, lo que lo hace menos fiable para tareas de razonamiento cientifico puro.
- Corpus de entrenamiento muy reducido: 1036 filas en total, con riesgo de sobreajuste a los estilos del teacher y a los ejemplos concretos.
- Solo dos idiomas: checo e ingles, sin soporte para otros idiomas, incluido el espanol.
- Tool calling sin fine-tuning especifico: aunque el base lo soporta nativamente, no se anadieron ejemplos de uso de herramientas, por lo que el rendimiento en tareas de agentes reales no esta garantizado.
- Riesgo de alucinacion: al ser un modelo de 12B con entrenamiento limitado, puede generar respuestas incorrectas pero plausibles, especialmente en dominios cientificos complejos.
- Sin desbloqueo de seguridad: el cambio de personalidad no elimina los limites de seguridad reales; las solicitudes daninas siguen siendo rechazadas.
- Benchmarks no comparables: los numeros publicados provienen de subconjuntos propios del proyecto, no de los benchmarks publicos completos, por lo que no son directamente comparables con otros modelos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/KucLab/kuclab-hertz-0.5
- Version anterior Hertz 0.4: https://huggingface.co/KucLab/kuclab-hertz-0.4
- Version anterior Hertz 0.3: https://huggingface.co/KucLab/kuclab-hertz-0.3
- Sitio de KucLab: https://kuclab.org/
- Modelo base: https://huggingface.co/google/gemma-4-12B-it
- Entro en Free2AITools: https://free2aitools.com/model/kuclab/kuclab-hertz-0.4
