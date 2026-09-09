# modrill/CodeThink-V4-Qwen3-4B-Mix

## Resumen

CodeThink-V4-Qwen3-4B-Mix es un checkpoint de investigacion desarrollado por el usuario **modrill** sobre la base **Qwen/Qwen3-4B-Base**. Su objetivo es mejorar la capacidad de razonamiento y generacion de codigo Python de un modelo pequeno mediante una receta de **destilacion mixta (Mix Distillation)** descrita en el articulo *"Small Models Struggle to Learn from Strong Reasoners"* (Li et al., 2025, arXiv:2502.12143). El problema que aborda es que los estudiantes de pequeno tamano a menudo aprenden peor cuando se destilan exclusivamente de razonadores mucho mas fuertes, por lo que el README propone combinar trazas de un razonador fuerte (Qwen3-30B-A3B-Thinking-2507) y de uno del mismo tamano (Qwen3-4B-Thinking-2507) en una proporcion 0.2:0.8.

Arquitectonicamente se trata de un modelo Transformer denso (no MoE) de **4.411.424.256 parametros**, con una longitud de contexto de **32.768 tokens**. Los pesos finales son el resultado de un entrenamiento LoRA (r64/alpha128) de 2 epocas sobre un conjunto de 4.155 problemas unicos de LiveCodeBench, seguido de un merge a pesos completos. La relevancia actual del modelo es doble: sirve como evidencia experimental de que la destilacion mixta mejora el rendimiento en modelos 4B en comparacion con la destilacion pura de un razonador fuerte, y proporciona un checkpoint funcional, aunque de caracter investigador, para generar codigo Python con un modo de pensamiento explicito.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso, decoder-only (familia Qwen3) |
| Parametros totales | 4.411.424.256 (4.4B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 |
| Tipos de cuantizacion | No disponible. El repositorio distribuye pesos completos en bf16 (safetensors); no se publican cuantizaciones oficiales. |
| Idiomas soportados | No disponible. La documentacion no especifica idiomas; el modelo base Qwen3-4B-Base es multilingue. |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (model.safetensors, adapters en safetensors, config.json, tokenizer, chat_template.jinja) |

## Arquitectura y entrenamiento

El modelo final es un **Qwen3-4B-Base** (revision `906bfd4b4dc7f14ee4320094d8b41684abff8539`) con pesos completos tras un ajuste fino con LoRA. La receta de entrenamiento descrita en el README es la siguiente:

- **Destilacion mixta (Mix-Large)** con una proporcion de 0.2 trazas del professor **Qwen/Qwen3-30B-A3B-Thinking-2507** y 0.8 trazas del teacher **Qwen/Qwen3-4B-Thinking-2507**, una traza por problema.
- **Dataset**: 4.155 problemas unicos (`source_1ep_rows`); con 2 epocas el numero total de filas es 8.310. La mezcla de 1 epoca se reparte en 831 filas de 30B y 3.324 filas de 4B.
- **Dosis de entrenamiento**: 32.424.225 tokens de asistente por epoca, total 64.848.450 tokens al final.
- **Configuracion LoRA**: r64, alpha128, dropout 0.0, aplicado a siete proyecciones (q, k, v, o, gate, up, down). Embeddings y lm_head congelados excepto las filas bidireccionales entrenables para los tokens especiales 151643 (`<|endoftext|>`), 151667 (`<think>`) y 151668 (`</think>`). El entrenamiento desata los embeddings que originalmente estaban atados (tied).
- **Optimizacion**: LR 1e-4, AdamW (beta 0.9/0.95), scheduler cosine sobre la dosis de tokens, warmup 6% (3.890.907 tokens), weight decay 0.1 (sobre LoRA; las filas de tokens con weight decay 0). Activaciones en bf16, masters en fp32, sin packing ni truncamiento, contexto 32768.
- **Evaluacion final**: se toman los pesos del punto 2 epocas (`step-000920`), sin seleccion de checkpoint intermedio.

La innovacion tecnica destacable es la eleccion de una proporcion de destilacion mixta frente a la destilacion pura de un razonador mas grande. Los resultados del README muestran que la destilacion pura de 30B (100% trazas de 30B-A3B-Thinking) produce peores resultados que la mezcla 0.2:0.8, lo que respalda la hipotesis de Li et al. 2025.

## Capacidades

- **Generacion de codigo Python**: el modelo esta afinado para generar programas correctos a partir de enunciados de problemas, tal como indica el system prompt del README.
- **Razonamiento explicito (think mode)**: soporta tokens `<think>` y `</think>`; al activar `enable_thinking=True` en el chat template, el modelo genera un razonamiento interno antes de producir la respuesta final.
- **Resolucion de problemas de programacion competitiva**: entrenado y evaluado con un split dev de 256 problemas derivados de LiveCodeBench, lo que implica familiaridad con problemas de tipo Codeforces/LeetCode.
- **Conversacion multi-turno**: soporta chat template y mensajes de sistema/usuario.
- **Capacidades no documentadas**: no se mencionan capacidades de vision, audio, tool calling/function calling ni soporte explicito de agentes o multi-step reasoning fuera del think mode. No se asumen como disponibles.

## Casos de uso

- **Asistente de programacion en entornos de desarrollo**: el modelo puede integrarse en un IDE o editor para generar soluciones Python a partir de especificaciones. Su modo de pensamiento permite razonar sobre la logica antes de codificar, lo que ayuda a evitar errores comunes.
- **Practica de programacion competitiva**: plataformas de entrenamiento tipo LeetCode o Codeforces pueden usarlo para generar soluciones de referencia o para estudiar distintas estrategias de enfoque algorítmico, gracias a su entrenamiento con problemas de LiveCodeBench.
- **Generacion de pruebas unitarias**: aunque no se documenta tool calling, el system prompt exige "no devolver nada excepto el programa", por lo que puede emplearse para producir funciones que pasen una bateria de tests, si se le da una especificacion clara.
- **Tutoria de algoritmos**: dado que puede generar trazas de razonamiento, es util como tutor que explica paso a paso la resolucion de un problema, permitiendo al estudiante seguir el proceso de pensamiento.
- **Automatizacion de scripting**: para tareas de procesamiento de datos, scraping o automatizacion de flujos en Python, el modelo puede generar scripts completos a partir de una descripcion en lenguaje natural.
- **Investigacion en destilacion de modelos**: el checkpoint es util para reproducir o comparar recetas de destilacion mixta frente a destilacion pura, sirviendo como referencia experimental para quienes estudian transferencia de razonamiento de modelos grandes a pequenos.

## Benchmarks y rendimiento

La unica evaluacion publicada es un split de 256 problemas de LiveCodeBench (DEV256), ejecutada con seed 3407, modo think, sin prefill de `<think>`, max generacion ~32k, y verificacion en sandbox con pass@1. Se advierte que son numeros diagnosticos de una sola semilla, no una afirmacion de liderazgo.

| Modelo | pass@1 (DEV256) | Cap (>=32k sin cerrar <think>) | Notas |
|---|---:|---:|---|
| **CodeThink-V4-Qwen3-4B-Mix** (este repo) | **73/256** | **136** | seed 3407 |
| Qwen3-4B-Base (mismo contrato, think) | 63/256 | 6 | base sin destilacion, seed 3407 |
| Qwen3-4B-Base (banda 5 semillas) | 55.2 ± 4.9 | - | seeds {3407, 12345, 20260903, 777, 2024} |
| V4 Q4B-THINK (100% 30B-A3B-Thinking traces) | 60/256 | 150 | destilacion pura fuerte |
| V4 Q4B-THINK-T4BDATA (100% 4B-Thinking traces) | 72/256 | 106 | destilacion pura mismo tamano |

Observaciones: la mezcla 0.2:0.8 (73/256) supera ligeramente a la destilacion del mismo tamano (72/256) y claramente a la destilacion pura de un razonador mas fuerte (60/256). Sin embargo, el numero de generaciones que alcanzan el limite de 32k sin cerrar `</think>` es muy alto (136), lo que indica que el modelo frecuentemente no termina su razonamiento.

## Requisitos de hardware

- **VRAM estimada para inferencia**: pesos en bf16 ocupan aproximadamente 8,8 GB (4.4B x 2 bytes). Con activaciones y KV cache para contexto largo, se recomienda **12-16 GB** de VRAM. Cuantizaciones no publicadas; una hipotetica cuantizacion de 4 bits reduciria los pesos a unos 2,5 GB, pero no hay tal version en el repo.
- **GPU recomendadas**: para servir con contexto completo (32k) y bf16, una **RTX 4090 (24 GB)** o una **A100/H100 (40-80 GB)** son adecuadas. Tambien puede ejecutarse en GPUs de 12-16 GB (RTX 3060/4070) con cuantizacion u overflow de activaciones.
- **Opciones de despliegue**: el modelo es compatible con la libreria **transformers** de HuggingFace y con **text-generation-inference** (se etiqueta como `endpoints_compatible`). Tambien puede servir via **vLLM**. Al ser safetensors, se puede convertir a GGUF para **llama.cpp** u **Ollama**, aunque esta conversion no esta documentada en el repo.
- **Latencia y throughput**: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

Los siguientes modelos comparten la misma arquitectura base (Qwen3-4B) y se diferencian en la receta de destilacion. Todos tienen 4.4B parametros y contexto 32k.

| Modelo | Parametros | Contexto | DEV256 pass@1 | Cap | Licencia |
|---|---|---|---:|---:|---:|---|
| CodeThink-V4-Qwen3-4B-Mix | 4.411.424.256 | 32.768 | 73/256 | 136 | Apache-2.0 |
| Qwen3-4B-Base (sin destilacion) | ~4.4B | 32.768 | 63/256 | 6 | Apache-2.0 |
| V4 Q4B-THINK (100% 30B traces) | ~4.4B | 32.768 | 60/256 | 150 | Apache-2.0 |
| V4 Q4B-THINK-T4BDATA (100% 4B traces) | ~4.4B | 32.768 | 72/256 | 106 | Apache-2.0 |

Comparado con el base, el modelo fine-tuned mejora el pass@1 en 10 puntos (73 vs 63), aunque a costa de generar muchos mas intentos truncados por limite de tokens. Respecto a la destilacion pura con trazas del mismo tamano, la ventaja es marginal (73 vs 72), pero con mayor tasa de cap. No se dispone de comparaciones con otros modelos de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- **Checkpoint de investigacion, no un producto**: el autor lo etiqueta explicitamente como "research checkpoint, not a product". No debe tratarse como version estable para produccion.
- **Métricas de una sola semilla**: los resultados de DEV256 provienen de la seed 3407. El README advierte de no interpretarlos como afirmaciones de liderazgo. La variabilidad entre semillas en el modelo base (55.2 ± 4.9) sugiere que el margen real puede solaparse.
- **Alta tasa de salidas truncadas**: 136 de 256 generaciones alcanzaron el limite de 32k sin cerrar `</think>`. En uso real, esto puede producir respuestas cortadas o sin solucion final.
- **Sobreajuste potencial al conjunto de problemas**: el entrenamiento se realizo sobre problemas de LiveCodeBench; el rendimiento en otros dominios no esta evaluado.
- **Sin evaluacion de tool calling/function calling**: el modelo no ha sido validado en tareas de uso de herramientas, agentes o llamadas a funciones, por lo que no se recomienda su uso en esos escenarios sin pruebas previas.
- **Idiomas no documentados**: aun cuando el base Qwen3-4B-Base sea multilingue, no hay evaluaciones de calidad por idioma en este checkpoint. El system prompt de ejemplo esta en ingles.
- **Riesgo de alucinacion inherente**: al ser un modelo generativo con razonamiento interno, puede producir soluciones incorrectas o plausibles pero no verificadas sin un sandbox o pruebas automatizadas.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/modrill/CodeThink-V4-Qwen3-4B-Mix
- Paper de referencia (Li et al., 2025, "Small Models Struggle to Learn from Strong Reasoners"): https://arxiv.org/abs/2502.12143
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Base
- Teachers mencionados en el README: https://huggingface.co/Qwen/Qwen3-30B-A3B-Thinking-2507 y https://huggingface.co/Qwen/Qwen3-4B-Thinking-2507
