# netm8/qwen3-8b-m4-agent-v2

## Resumen

`qwen3-8b-m4-agent-v2` es un ajuste fino de Qwen3-8B desarrollado por el usuario netm8, orientado especificamente a tareas de agente de programacion: correccion de bugs sobre ficheros existentes mediante llamadas a herramientas. El modelo parte de los pesos de Qwen/Qwen3-8B (8.190.735.360 parametros, arquitectura transformer densa de la familia Qwen3) y se distribuye en safetensors bfloat16 con un tamano de repositorio de 16,4 GB.

El problema que aborda es concreto: los modelos pequenos de 8B son atractivos para trabajo de codigo en local (caben en un portatil de 16 GB), pero el Qwen3-8B base falla al aplicar ediciones con herramientas de fichero en mas de la mitad de los casos. Este ajuste eleva la tasa de resolucion de tareas de bug-fix retenidas del 31,0% al 88,0%, y la tasa de ediciones que se aplican limpiamente del 46,0% al 97,0%, manteniendo el formato de tool calling original de Qwen3.

Es relevante ahora porque demuestra que un pipeline de destilacion desde un modelo mayor (Qwen3-Coder-30B-A3B-Instruct) mas auto-mejora verificada por ejecucion de tests puede convertir un modelo base mediocre como agente en uno util para edicion de codigo, sin cambiar la interfaz de chat ni la licencia Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen3) |
| Parametros totales | 8.190.735.360 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada de Qwen3-8B) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada; pesos publicados en bfloat16 |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (bfloat16, ~16,4 GB) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del transformer denso Qwen3-8B, sin cambios arquitectonicos declarados: se conservan la plantilla de chat de Qwen3 y el formato JSON de llamada a herramientas envuelto en `<tool_call>`. El entrenamiento se estructuro en tres etapas. La primera fue un SFT de agente multilingue sobre trayectorias de codigo multi-turno usando un esquema de cinco herramientas: `read_file`, `edit_file`, `grep_search`, `list_files` y `run_command`.

La segunda etapa aplico destilacion on-policy con divergencia KL inversa desde Qwen3-Coder-30B-A3B-Instruct hacia el modelo de 8B, con el objetivo de recuperar calidad general de codigo sin perder los habitos de uso de herramientas adquiridos en la primera etapa. La tercera etapa consistio en auto-mejora verificada por ejecucion: se muestrearon 8 ediciones candidatas por tarea de bug-fix (900 tareas) y 4 soluciones candidatas por tarea de programacion stdin/stdout (1.500 tareas); un ejecutor automatico de tests conservo solo los candidatos que pasaban, generando 1.732 ejemplos verificados (814 tareas de bug-fix con edicion valida y 464 tareas stdin/stdout con solucion valida). Sobre esos ejemplos se entreno un LoRA de rango 64 durante 604 pasos (2 epocas, LR coseno de 1e-4) que se fusiono de vuelta en los pesos. Los datasets de entrenamiento son privados.

## Capacidades

- Generacion de texto y codigo en ingles, con foco en edicion de codigo existente.
- Tool calling con el formato nativo de Qwen3: cinco herramientas (`read_file`, `edit_file`, `grep_search`, `list_files`, `run_command`) mediante JSON dentro de `<tool_call>`.
- Edicion quirurgica de ficheros: reemplazo search-and-replace con `old_string`/`new_string`, con alta tasa de coincidencia unica y parseo limpio posterior.
- Correccion de bugs en un solo paso de edicion sobre el contenido de un fichero leido previamente.
- Flujos de agente multi-turno (leer, buscar, listar, editar, ejecutar comandos).
- Razonamiento y codigo general: mantiene el nivel del Qwen3-8B base en HumanEval+ y MBPP+.
- Modo thinking desactivable: la evaluacion se hizo con `enable_thinking=False`.
- Capacidades multilingues: limitadas al ingles segun la model card.
- No se declaran capacidades de vision ni audio.

## Casos de uso

- Correccion automatica de bugs en CI: dado un test que falla, el modelo recibe el fichero via `read_file` y aplica una edicion con `edit_file`; con 97% de ediciones limpias y 88% de tareas resueltas, es viable como primer intento antes de escalar a revision humana.
- Agente de codigo en local sobre portatil de 16 GB: al pesar 16,4 GB en bfloat16 y derivar de un 8B, puede ejecutarse en hardware consumer con la cuantizacion adecuada, permitiendo trabajo de codigo privado sin enviar codigo a la nube.
- Refactorizacion guiada por busqueda: combinando `grep_search` y `list_files` para localizar usos y `edit_file` para aplicar cambios puntuales en varios ficheros de un repositorio.
- Automatizacion de parches en pipelines de mantenimiento: integrado como paso de un bot que propone parches sobre incidencias etiquetadas, con `run_command` para validar la compilacion o los tests tras la edicion.
- Asistente de IDE para arreglos puntuales: su formato de tool calling compatible con Qwen3 permite conectarlo a un harness existente sin adaptar la plantilla de chat.
- Generacion de parches en tareas de reparacion de programas stdin/stdout: aunque con menor cobertura (464 de 1.500 tareas con solucion valida en la etapa de auto-mejora), sigue siendo util para problemas de programacion competitiva sencillos.
- Evaluacion de pipelines de agente: sirve como modelo de referencia para medir tasas de aplicacion limpia de ediciones en harness propios, dado que publica los resultados crudos en `eval_official_790.json`.

## Benchmarks y rendimiento

Evaluado en bfloat16 con el mismo harness en 790 tareas (`pass@1`, `temperature=0`, `enable_thinking=False`).

| Modelo | Bug-fix retenido (100) | Edicion limpia | HumanEval+ (164) | MBPP+ (378) | BigCodeBench-Hard (148) | Compuesto |
|---|---|---|---|---|---|---|
| Qwen/Qwen3-8B (base) | 31,0% | 46,0% | 80,5% (84,8% base) | 72,5% (82,0% base) | 20,9% | 43,19 |
| qwen3-8b-m4-agent-v2 | 88,0% (+57,0) | 97,0% (+51,0) | 81,1% (85,4% base) | 72,2% (84,7% base) | 17,6% | 59,16 (+15,97) |

El compuesto se calcula como `0,35 * BigCodeBench-Hard + 0,30 * Bug-Fix + 0,20 * MBPP+ + 0,15 * HumanEval+`. En BigCodeBench-Hard el ajuste resuelve 26 de 148 tareas frente a 31 de 148 del base. El conjunto de 100 tareas de bug-fix esta retenido de todas las etapas de entrenamiento, pero proviene del mismo generador de tareas que los datos de entrenamiento, no de un leaderboard publico externo.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 16,4 GB solo para pesos, mas overhead de activaciones y KV cache; en la practica requiere mas de 16 GB de VRAM en precision completa.
- Cuantizacion: la model card no publica variantes GGUF ni cuantizadas; para caber en GPU consumer seria necesario cuantizar externamente (por ejemplo, a 8 o 4 bits), lo que no esta validado por el autor.
- GPU recomendadas: A100 40 GB, H100, L40S o RTX 4090 (24 GB) para bfloat16; en consumer de 16 GB solo via cuantizacion no oficial.
- Despliegue: transformers (referencia en la model card), text-generation-inference (tag `text-generation-inference`), endpoints compatibles; vLLM, llama.cpp u Ollama no se mencionan en la informacion disponible.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Bug-fix retenido | Edicion limpia | Licencia |
|---|---|---|---|---|---|
| qwen3-8b-m4-agent-v2 | 8,19B | no disponible | 88,0% | 97,0% | Apache-2.0 |
| Qwen/Qwen3-8B (base) | 8,19B | no disponible | 31,0% | 46,0% | Apache-2.0 |
| Qwen3-Coder-30B-A3B-Instruct | 30B (MoE, ~3B activos) | no disponible | no disponible | no disponible | no disponible en la informacion |

La comparacion directa solo es posible con el modelo base, ya que el autor no publica resultados del 30B usado como profesor en las mismas tareas. Frente al base, el ajuste mejora de forma marcada en bug-fix y edicion limpia, empeora ligeramente en BigCodeBench-Hard y se mantiene practicamente igual en HumanEval+ y MBPP+.

## Limitaciones y advertencias

- El conjunto de evaluacion de bug-fix es interno y generado por el mismo sistema que los datos de entrenamiento; los resultados pueden no transferir a repositorios reales.
- Rendimiento inferior al base en BigCodeBench-Hard (17,6% frente a 20,9%): el modelo pierde capacidad en scripts largos con muchas librerias.
- Enfocado a edicion de codigo existente; no es un modelo generalista mejor que el base para generacion desde cero.
- Solo declara soporte de ingles; el comportamiento en castellano no esta documentado.
- Riesgo de alucinacion en la generacion de `old_string`: si no coincide exactamente una vez, la edicion falla; el 3% de fallos restantes en edicion limpia lo evidencia.
- Los datasets de entrenamiento son privados, lo que dificulta auditar sesgos o contaminacion.
- Licencia Apache-2.0 permite uso comercial, pero el autor no ofrece garantias ni soporte; el modelo se publica sin descargas ni likes en el momento de la ficha.
- El modelo deriva de Qwen3-8B, por lo que hereda sus sesgos y limitaciones no documentadas aqui.

## Enlaces

- Hugging Face: https://huggingface.co/netm8/qwen3-8b-m4-agent-v2
- Resultados crudos de evaluacion: https://huggingface.co/netm8/qwen3-8b-m4-agent-v2/blob/main/eval_official_790.json
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
- Modelo profesor de destilacion: https://huggingface.co/Qwen/Qwen3-Coder-30B-A3B-Instruct
