# kla857/Novex-nano-ts-1

## Resumen

Novex-nano-ts-1 es un adaptador LoRA (PEFT) desarrollado por el usuario kla857 sobre el modelo base unsloth/Qwen3-0.6B, orientado especificamente a la generacion de codigo TypeScript. Con 596 millones de parametros en el modelo base, se posiciona como una alternativa ultraligera que puede ejecutarse en CPU y en GPUs de gama muy baja, lo que lo hace adecuado para entornos con recursos restringidos o para tareas de autocompletado local.

El adaptador se entrena mediante destilacion de un profesor mayor (Qwen2.5-Coder-3B-Instruct) sobre tareas de MBPP verificadas contra tests, combinado con un conjunto de aproximadamente 2000 instrucciones generales de TypeScript. El resultado principal reportado es una mejora de +15,49 puntos porcentuales en un holdout de mbpp-ts (de 43,66% a 59,15% en pass@1), mientras que en humaneval-ts la mejora es marginal (+0,63 pp, dentro del ruido estadistico).

El modelo es relevante por su enfoque de eficiencia extrema: demuestra que un fine-tuning LoRA de una sola epoca sobre un modelo de 0,6B puede producir mejoras sustanciales en un dominio concreto (TypeScript) sin necesidad de infraestructura de entrenamiento significativa. Su licencia Apache-2.0 y su compatibilidad con el ecosistema Qwen3 facilitan su integracion en pipelines existentes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3) con adaptador LoRA |
| Parametros totales | 596.049.920 (modelo base); el adaptador LoRA anade un subconjunto no cuantificado en el repo |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el entrenamiento uso max sequence de 1024) |
| Tipos de cuantizacion | GGUF disponible en el repo; QLoRA durante entrenamiento; bfloat16 en inferencia |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT), GGUF |

## Arquitectura y entrenamiento

El modelo base es Qwen3-0.6B, un transformer decoder-only de 596 millones de parametros en bfloat16. Sobre el se aplica un adaptador LoRA con rango r=16, alpha=16, dropout 0.0, aplicado a todas las proyecciones (q, k, v, o, gate, up, down). El entrenamiento se realiza con Unsloth (LoRA/QLoRA) durante una sola epoca, con learning rate 5e-5, schedule lineal, warmup del 3%, batch efectivo de 8 (2 x grad-accum 4) y longitud maxima de secuencia de 1024. No se utiliza `train_on_completions` (el enmascaramiento de completions resulto perjudicial en este caso). El adaptador no se fusiona con el modelo base en este repositorio.

Los datos de entrenamiento consisten en 895 soluciones verificadas contra tests, destiladas de Qwen2.5-Coder-3B-Instruct sobre tareas de MBPP, mas aproximadamente 2000 instrucciones generales de TypeScript. El split de holdout de mbpp-ts (71 tareas) se excluyo completamente tanto de los datos destilados como del mix general, y humaneval-ts nunca se uso para generacion ni entrenamiento. Una innovacion destacable es el uso de decodificacion greedy con pass@1 como metrica principal y la comparacion contra una ejecucion hermana (ft#12) con un mix general mas amplio, que alcanza 25,79% en humaneval-ts y 56,34% en el holdout, dentro del ruido en humaneval-ts pero con mejor media global para este adaptador.

## Capacidades

- Generacion de codigo TypeScript: funcion principal del adaptador, entrenado especificamente para producir soluciones a tareas de programacion en TypeScript.
- Generacion de texto y conversacion: hereda las capacidades conversacionales del modelo base Qwen3-0.6B.
- Razonamiento basico y matematicas simples: limitado por el tamano del modelo base.
- Soporte de tool calling / function calling: no documentado en la informacion proporcionada.
- Soporte de agentes y multi-step reasoning: no documentado; el tamano del modelo sugiere capacidades limitadas en este aspecto.
- Capacidades multilingues: solo ingles declarado; otros idiomas dependen de la capacidad del modelo base.
- Modo thinking: el modelo base Qwen3 lo soporta, pero el adaptador fue entrenado con respuestas directas de codigo y se recomienda `enable_thinking=False` para evitar narracion en lugar de codigo.
- Capacidad especial: destilacion de un profesor mayor para tareas de codigo verificadas contra tests.

## Casos de uso

- Autocompletado de TypeScript en editores: el modelo puede integrarse en extensiones de IDE o servidores LSP para sugerir funciones y fragmentos de codigo TypeScript en local, sin depender de la nube, gracias a su tamano de 0,6B y su capacidad de ejecucion en CPU.
- Generacion de tests unitarios en TypeScript: el adaptador puede producir esqueletos de tests para funciones existentes, aprovechando su entrenamiento sobre tareas verificadas contra tests de MBPP.
- Asistente de refactorizacion simple: para tareas acotadas como renombrar variables, extraer funciones o convertir callbacks a promesas en TypeScript, el modelo ofrece sintaxis correcta y logica simple adecuada.
- Educacion y aprendizaje de TypeScript: puede usarse como herramienta de practica que genera soluciones a ejercicios de programacion, con la ventaja de que el 96,3% de sus fallos son logicos y no sintacticos, lo que facilita la correccion por parte del estudiante.
- Prototipado rapido en entornos con recursos limitados: en dispositivos sin GPU o con GPUs de gama muy baja (por ejemplo, portatiles o Raspberry Pi), el modelo puede generar fragmentos de TypeScript para scripts de automatizacion o utilidades.
- Pipeline de CI/CD para sugerencias de codigo: integrado mediante la libreria PEFT y transformers, puede incorporarse en un paso de generacion de sugerencias o documentacion de codigo TypeScript en un pipeline, con la ventaja de su licencia Apache-2.0 y su bajo coste computacional.
- Fine-tuning posterior como base: al ser un adaptador LoRA sobre Qwen3-0.6B, puede servir como punto de partida para especializaciones adicionales en otros dominios de TypeScript o lenguajes, reutilizando el conocimiento destilado.

## Benchmarks y rendimiento

| Benchmark | N | Qwen3-0.6B baseline | Novex-nano-ts-1 | Delta |
|---|---|---|---|---|
| mbpp-ts holdout (held-out) | 71 | 43,66% | 59,15% | +15,49 pp |
| humaneval-ts | 159 | 24,53% | 25,16% | +0,63 pp |

Datos adicionales reportados por el autor: pass@4 en humaneval-ts es 32,08% (51/159) frente a 25,16% en greedy, lo que indica que gran parte de la brecha restante es de decodificacion/seleccion y no de capacidad. El 96,3% de los fallos son logicos y solo el 3,7% sintacticos. La ejecucion hermana ft#12 alcanza 25,79% en humaneval-ts y 56,34% en el holdout. El error estandar en humaneval-ts es aproximadamente ±3,4 pp con n=159, por lo que la mejora de +0,63 pp esta dentro del ruido.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base en bfloat16 ocupa aproximadamente 1,2 GB; en cuantizacion GGUF de 4 bits puede reducirse a menos de 500 MB, mas el overhead del adaptador LoRA.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; el modelo cabe en GPUs de gama baja como GTX 1050 Ti, GTX 1650, o incluso en iGPUs modernas.
- Cabe en consumer GPU: si, en practicamente cualquier GPU consumer, e incluso en CPU.
- Opciones de despliegue: transformers + PEFT (documentado en la model card), llama.cpp / Ollama (gracias al formato GGUF incluido en el repo), y potencialmente vLLM o TGI si se fusiona el adaptador con el modelo base.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento en codigo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Novex-nano-ts-1 | 596M (base) + LoRA | no disponible (entrenado a 1024) | mbpp-ts holdout 59,15%; humaneval-ts 25,16% | Apache-2.0 | Hugging Face |
| Qwen3-0.6B (base) | 596M | no disponible | mbpp-ts holdout 43,66%; humaneval-ts 24,53% | Apache-2.0 | Hugging Face |
| Qwen2.5-Coder-3B-Instruct (profesor) | 3B | no disponible | no disponible en la informacion | Apache-2.0 | Hugging Face |
| Ejecucion hermana ft#12 | 596M (base) + LoRA | no disponible | mbpp-ts holdout 56,34%; humaneval-ts 25,79% | Apache-2.0 | no disponible publicamente |

## Limitaciones y advertencias

- Tamano de 0,6B: esperar sintaxis correcta y logica simple, no razonamiento multi-archivo. Los errores logicos dominan los fallos (96,3%).
- Entrenado para TypeScript: otros lenguajes solo cuentan con la capacidad del modelo base, sin mejora especifica.
- La mejora en humaneval-ts (+0,63 pp, una tarea) esta dentro del ruido estadistico; el resultado solido es el del holdout de mbpp-ts.
- Los datos de entrenamiento destilados provienen de un modelo profesor mayor (Qwen2.5-Coder-3B-Instruct) y de datasets publicos de instrucciones TypeScript cuyas licencias varian (CC/MIT/Apache, algunos marcados como `other`). Verificar los terminos de los datasets antes de redistribuir pesos derivados con fines comerciales.
- El modo thinking del modelo base debe desactivarse (`enable_thinking=False`) para evitar que el modelo narre en lugar de emitir codigo.
- Riesgo de alucinacion: inherente a modelos de este tamano; las soluciones generadas deben validarse contra tests.
- Sesgos conocidos: no documentados en la informacion proporcionada.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero las licencias de los datos de entrenamiento pueden imponer restricciones adicionales a los pesos derivados.

## Enlaces

- Hugging Face: https://huggingface.co/kla857/Novex-nano-ts-1
- Modelo base: https://huggingface.co/unsloth/Qwen3-0.6B
- Modelo profesor (referencia): https://huggingface.co/Qwen/Qwen2.5-Coder-3B-Instruct
- Repositorio Qwen3: https://huggingface.co/Qwen/Qwen3-0.6B
- Unsloth (framework de entrenamiento): https://github.com/unslothai/unsloth
