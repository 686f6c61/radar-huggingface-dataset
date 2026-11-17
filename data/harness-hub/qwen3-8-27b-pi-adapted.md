# harness-hub/Qwen3.8-27B-pi-adapted

## Resumen

Qwen3.8-27B-pi-adapted es un adaptador LoRA desarrollado por harness-hub sobre el modelo base Qwen/Qwen3.8-27B, entrenado mediante aprendizaje por refuerzo (GRPO asíncrono con TRL) para funcionar como el modelo subyacente del agente de programación pi en tareas de ingeniería de software y de terminal. El adaptador no es un modelo independiente: requiere cargar el modelo base y aplicar los pesos LoRA para su uso. El repositorio ocupa 0,7 GB, lo que corresponde únicamente a los pesos del adaptador en formato safetensors.

El problema que resuelve es concreto: el modelo base, cuando opera dentro de un arnés de agente, tiende a entrar en bucles de búsqueda y reejecución de fragmentos de código hasta agotar el límite de pasos. El adaptador corrige ese comportamiento y mejora sustancialmente la tasa de éxito en Terminal-Bench 2.1 (de 39,5% a 55,8%) y en SWE-bench Pro hard 51 (de 29,4% a 62,7%), reduciendo además el número de llamadas a herramientas por tarea entre un 55% y un 62%.

La relevancia actual del modelo reside en su enfoque: no se trata de un ajuste supervisado clásico, sino de un adaptador entrenado específicamente para un arnés de agente concreto (pi), con evaluación pareada contra el modelo base y publicación de la receta completa. Esto lo convierte en un caso de estudio sobre cómo adaptar modelos grandes a flujos agénticos reales sin reentrenar desde cero.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre Qwen/Qwen3.8-27B; el modelo base es un transformer híbrido (según la referencia a `--mamba-cache-mode align` en la configuración de vLLM) |
| Parámetros totales | No disponible para el adaptador; el modelo base es de 27B (según el nombre) |
| Parámetros activos | No disponible |
| Longitud de contexto | 131.072 tokens (configuración de evaluación con `--max-model-len 131072`) |
| Tipos de cuantización | No disponible en la información proporcionada; existe una versión GGUF en el repositorio hermano |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador LoRA PEFT); existe versión GGUF en `harness-hub/Qwen3.8-27B-pi-GGUF` |

## Arquitectura y entrenamiento

El adaptador se entrena con aprendizaje por refuerzo mediante GRPO asíncrono (async-grpo), implementado con la librería TRL. Se trata de un adaptador LoRA de rango máximo 32 (según la configuración de vLLM `--max-lora-rank 32`), aplicado sobre el modelo base Qwen/Qwen3.8-27B. El entrenamiento se realizó con el razonamiento (thinking) desactivado, y el adaptador nunca fue entrenado con thinking activado, lo que constituye una restricción importante para su uso.

Los datos de entrenamiento provienen de dos conjuntos del propio autor: `harness-hub/scale800-harbor` y `harness-hub/termgrade-train-harbor`. El checkpoint utilizado en las evaluaciones es el paso 160, seleccionado según las puntuaciones en SWE-bench Pro y en un subconjunto de 18 tareas de Terminal-Bench 2.1 monitorizado durante el entrenamiento. La receta completa se publicará en el blog de lanzamiento `harness-hub/harness-adapters-at-scale`. El modelo base es un transformer híbrido, como indica la necesidad de usar `--mamba-cache-mode align` para el cacheo de prefijos en vLLM.

## Capacidades

- Generación de texto y razonamiento orientado a tareas de ingeniería de software.
- Edición de código y corrección de bugs en repositorios reales, con ejecución de tests.
- Uso de terminal y herramientas de línea de comandos dentro de un arnés de agente.
- Soporte de tool calling / function calling, con parser `qwen3_xml` en vLLM.
- Razonamiento multi-paso y comportamiento agéntico: el adaptador reduce drásticamente el número de llamadas a herramientas necesarias para resolver una tarea.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo thinking: no soportado; el adaptador fue entrenado y evaluado con thinking desactivado.
- Visión y audio: no disponible en la información proporcionada.

## Casos de uso

- Reparación automática de bugs en repositorios de producción: el adaptador puede localizar la función defectuosa, editarla, ejecutar los tests y corregir el último caso fallido en unas 8 llamadas a herramientas, como demuestra el ejemplo de la tarea de Ansible en SWE-bench Pro. Es adecuado porque fue entrenado específicamente para ese flujo.
- Agente de terminal para tareas de administración de sistemas: con 131.072 tokens de contexto y soporte de tool calling, puede gestionar sesiones largas de terminal con historial extenso, reduciendo las llamadas redundantes un 62% frente al modelo base.
- Integración en pipelines de CI/CD: sirviéndolo con vLLM y el parser `qwen3_xml`, puede conectarse a un servidor OpenAI-compatible y ejecutar tareas de corrección automática sobre fallos de test detectados en integración continua.
- Asistente de programación local con pi: instalando pi (Node.js 22.19 o superior) y apuntándolo al servidor vLLM local, el adaptador actúa como modelo de codificación en el editor o terminal del desarrollador.
- Evaluación y research sobre adaptadores de arnés: al publicarse la receta completa, sirve como referencia para construir adaptadores propios sobre otros modelos base con GRPO asíncrono.
- Despliegue en macOS con llama.cpp o Llama.app: la existencia de una versión GGUF permite ejecutar el adaptador en entornos locales sin GPU dedicada, aunque con las limitaciones de rendimiento propias de la cuantización.
- Automatización de tareas de refactorización con verificación: el modelo ejecuta tests tras cada edición y corrige los fallos restantes, lo que encaja en flujos donde la verificación automática es obligatoria.

## Benchmarks y rendimiento

Evaluación con el arnés pi, un intento por tarea, temperatura 0,8, thinking desactivado, pareado contra el modelo base en las mismas tareas. Intervalo de confianza del 95%; valor p de test de signos exacto.

| Benchmark | Tareas | Modelo base | Adaptador (paso 160) | Diferencia (puntos) | Nuevas resueltas / perdidas | Llamadas a herramientas por tarea | Llamadas, tareas resueltas por ambos |
|---|---|---|---|---|---|---|---|
| Terminal-Bench 2.1 | 86 | 39,5% | 55,8% | +16,3 ± 9,1 | 16 / 2 (p = 0,0013) | -62% | -48% (32) |
| Terminal-Bench 2.1, 68 tareas no usadas para elegir checkpoint | 68 | 39,7% | 55,9% | +16,2 ± 10,6 | 13 / 2 (p = 0,0074) | -64% | -32% (25) |
| SWE-bench Pro (hard 51) | 51 | 29,4% | 62,7% | +33,3 ± 14,2 | 18 / 1 (p = 7,6e-05) | -55% | -59% (14) |

Terminal-Bench 2.1 se evaluó sobre las 89 tareas del conjunto `harborframework/terminal-bench-2.1`, con 1 hora y 100 pasos de agente por tarea. SWE-bench Pro (hard 51) se evaluó sobre las 51 tareas más difíciles de `harness-hub/swebench-pro-v2-hard51-harbor`, con 2 horas y 100 pasos de agente por tarea.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Depende del modelo base de 27B y de la cuantización elegida; como referencia orientativa, un modelo de 27B en bfloat16 requiere del orden de 54 GB solo para pesos, más caché KV y overhead.
- GPU recomendadas: no especificadas por el autor. Por tamaño del modelo base, se necesitan GPUs de clase A100 80 GB o H100 para bfloat16 sin cuantizar; para cuantizaciones de 4 bits podrían caber en GPUs consumer de 24 GB, aunque este dato no está confirmado en la información disponible.
- Cabe en GPU consumer: no confirmado para el adaptador; la versión GGUF del repositorio hermano sugiere que sí es posible en configuraciones cuantizadas.
- Opciones de despliegue: vLLM (configuración de referencia con `--enable-lora --max-lora-rank 32 --lora-modules`, `--language-model-only`, `--enable-prefix-caching`, `--mamba-cache-mode align`, `--enable-auto-tool-choice`, `--tool-call-parser qwen3_xml`, `--reasoning-parser qwen3`, `--max-model-len 131072`); transformers serve (servidor OpenAI-compatible ligero, con `--dtype bfloat16 --continuous-batching --reasoning off`); llama.cpp y Llama.app mediante la versión GGUF.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento en Terminal-Bench 2.1 | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3.8-27B-pi-adapted (este) | 27B (base) + LoRA | 131.072 | 55,8% (bajo pi) | Apache 2.0 | safetensors (LoRA), GGUF |
| Qwen/Qwen3.8-27B (base) | 27B | 131.072 (config. de evaluación) | 39,5% (bajo pi) | Apache 2.0 | safetensors |
| Otros adaptadores de arnés de harness-hub | No disponible | No disponible | No disponible | Apache 2.0 | safetensors |

La comparación más directa y documentada es contra el modelo base sin adaptador, que es el punto de referencia pareado de todas las evaluaciones. No se dispone de datos de benchmarks de otros adaptadores o modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- El adaptador no es un modelo autónomo: requiere cargar Qwen/Qwen3.8-27B y aplicar los pesos LoRA; no puede usarse solo.
- El adaptador fue entrenado y evaluado con thinking desactivado; no se ha entrenado con thinking activo y su comportamiento con él es desconocido.
- La configuración de evaluación usa `"api": "openai-completions"` en pi; sin esa opción, pi usa la Responses API, con la que el adaptador no fue entrenado ni evaluado.
- El cacheo de prefijos en este modelo híbrido requiere `--mamba-cache-mode align` en vLLM; sin ello, cada turno del agente relee todo su historial, con la penalización de latencia correspondiente.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Riesgo de alucinación: no cuantificado en la información proporcionada; como todo modelo generativo, existe riesgo en la edición de código y en la interpretación de resultados de tests.
- Limitaciones de idioma: no se especifican los idiomas soportados; el entrenamiento se orienta a tareas de software y terminal, predominantemente en inglés técnico.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero debe verificarse la licencia del modelo base Qwen/Qwen3.8-27B, que no se detalla en la información proporcionada.
- El checkpoint seleccionado (paso 160) se eligió con un subconjunto de 18 tareas de Terminal-Bench 2.1, lo que introduce un posible sesgo de selección; el autor mitiga esto reportando resultados en las 68 tareas no usadas para la selección.
- No hay datos publicados sobre latencia, throughput ni requisitos de VRAM del adaptador.

## Enlaces

- Repositorio Hugging Face del adaptador: https://huggingface.co/harness-hub/Qwen3.8-27B-pi-adapted
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Versión GGUF: https://huggingface.co/harness-hub/Qwen3.8-27B-pi-GGUF
- Blog de lanzamiento con la receta: https://huggingface.co/blog/harness-hub/harness-adapters-at-scale
- Agente pi: https://github.com/earendil-works/pi
- Dataset de entrenamiento: https://huggingface.co/datasets/harness-hub/scale800-harbor
- Dataset de entrenamiento: https://huggingface.co/datasets/harness-hub/termgrade-train-harbor
- Dataset de evaluación Terminal-Bench 2.1: https://huggingface.co/datasets/harborframework/terminal-bench-2.1
- Dataset de evaluación SWE-bench Pro hard 51: https://huggingface.co/datasets/harness-hub/swebench-pro-v2-hard51-harbor
- Documentación de transformers serve: https://huggingface.co/docs/transformers/en/serve-cli/serving
