# l3lab/llmlean-optimize-9B-v0.1-GGUF

## Resumen

llmlean-optimize-9B-v0.1-GGUF es la version cuantizada en formato GGUF del modelo l3lab/llmlean-optimize-9B-v0.1, un ajuste fino especializado en la optimizacion de demostraciones formales en Lean 4. El modelo parte de una base Qwen3.5-9B (8.953.803.264 parametros) sobre la que se ha fusionado un adaptador entrenado especificamente para reescribir pruebas Lean y hacerlas mas cortas y simples, manteniendo la verificacion del comprobador de tipos de Lean.

El modelo resuelve un problema muy concreto: dado un teorema Lean 4 con su demostracion original, los estados de tactic y las referencias a lemas y definiciones relevantes, devuelve una nueva prueba `by` que Lean pueda verificar y que sea una reduccion significativa de la original. Esta orientado a flujos de trabajo de formalizacion matematica, mantenimiento de librerias como Mathlib y limpieza de pruebas generadas automaticamente.

La relevancia actual radica en que la optimizacion de pruebas es una tarea distinta de la generacion de pruebas desde cero: exige que el modelo entienda el estado del objetivo, respete el entorno de nombres y produzca terminos que el kernel de Lean acepte. El autor reporta mejoras sustanciales frente al modelo base en una validacion sobre 427 teoremas, lo que lo convierte en una herramienta practica para pipelines de formalizacion asistida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (base Qwen3.5-9B) con adaptador fusionado |
| Parametros totales | 8.953.803.264 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 16.384 tokens (recomendado por el autor) |
| Tipos de cuantizacion | GGUF Q4_K_M (5,63 GB); otras variantes no disponibles |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF |
| Modelo base | l3lab/llmlean-optimize-9B-v0.1 |
| Dominio | Lean 4 (lenguaje de demostracion formal) |

## Arquitectura y entrenamiento

El modelo se construye sobre Qwen3.5-9B, un transformer denso de aproximadamente 9.000 millones de parametros, al que se le fusiona un adaptador especializado en optimizacion de pruebas Lean 4. El entrenamiento se realizo en dos fases. En la primera, destilacion, se recopilaron modulos de Mathlib, Tau Ceti, Compfiles, Batteries y CSLib, y el modelo profesor Gemini Argon (con razonamiento alto) genero intentos de reescritura; se ajusto al estudiante Qwen sobre las 4.043 reescrituras verificadas por Lean que producian mejoras significativas. En la segunda fase, iteracion experta, se amplio el conjunto de modulos y se muestrearon 32 reescrituras por teorema con el modelo destilado; de 39.097 teoremas elegibles, 17.749 tuvieron una mejora verificada, y se entreno un adaptador nuevo sobre la mejor reescritura de cada uno (14.250 de Qwen y 3.499 de Gemini).

La entrada del modelo no es solo el enunciado del teorema: incluye el enunciado, la firma elaborada con variables de seccion, la prueba original, las firmas de las referencias explicitas (definiciones, inductivos y teoremas usados) y la traza de estados de tactic con objetivos antes y despues de cada paso, junto con una lista de tacticas de automatizacion disponibles (`rfl`, `simp`, `omega`, `grind`, `decide`, etc.). La salida es una prueba de reemplazo que empieza por `by`. Esta formulacion convierte la tarea en una reescritura condicionada por el estado del comprobador, lo que reduce la alucinacion de nombres y obliga al modelo a razonar sobre el entorno real.

## Capacidades

- Optimizacion de demostraciones Lean 4: recibe un teorema con su prueba y devuelve una version mas corta o con menos referencias distintas, verificable por Lean.
- Razonamiento sobre estados de tactic: interpreta objetivos con contexto local y trazas de tactic para proponer reescrituras coherentes.
- Uso de tacticas de automatizacion: conoce y emplea `rfl`, `assumption`, `simp`, `simpa`, `simp_all`, `dsimp`, `grind`, `omega`, `ext` y `decide`.
- Generacion de texto y conversacion: el pipeline es text-generation y el modelo esta marcado como conversational.
- Modo thinking: el autor recomienda desactivarlo para esta tarea; el modelo base lo soporta y el ajuste se evaluo con thinking desactivado.
- Integracion con herramientas: formato de mensajes compatible con endpoints y descarga via LM Studio.
- Capacidades multilingues: no disponible.
- Tool calling y function calling: no disponible de forma explicita.
- Vision y audio: no disponibles.

## Casos de uso

- Limpieza de Mathlib y librerias afines: pasar teoremas con pruebas largas o redundantes al modelo para obtener reescrituras mas cortas que luego se validan con Lean, reduciendo el coste de mantenimiento de una base de codigo formal enorme.
- Pipelines de formalizacion asistida: integrar el modelo en un bucle donde un agente genera pruebas y el optimizador las simplifica antes de la revision humana, aprovechando que la salida es directamente verificable.
- Reduccion de dependencias en pruebas: el modelo puede sustituir pruebas que usan muchas referencias distintas por otras con menos lemas, lo que facilita la portabilidad entre versiones de Mathlib.
- Generacion de pruebas en entornos docentes: dado un ejercicio Lean, el modelo propone una prueba `by` que el estudiante puede comparar con la suya; el ejemplo del autor devuelve `by simp [addZero]` para `Demo.addZero_eq`.
- Automatizacion de PRs en repositorios de matematicas formalizadas: un bot puede ejecutar el modelo sobre modulos modificados, verificar con Lean y abrir pull requests con pruebas simplificadas.
- Investigacion en sintesis de pruebas: usar el modelo como generador de candidatos en busquedas tipo pass@k (hasta pass@32 en la validacion) para estudiar la distribucion de reescrituras correctas.
- Despliegue local en estaciones de trabajo: al ser un GGUF Q4_K_M de 5,63 GB, cabe en GPUs de consumo y permite iterar sin depender de servicios en la nube.

## Benchmarks y rendimiento

Validacion sobre 427 teoremas de 211 modulos de Mathlib, Tau Ceti, Compfiles, Batteries y CSLib, con modulos de entrenamiento excluidos y filtro de duplicados. Se cuenta un teorema si Lean verifica la reescritura y no empeora ninguna de las dos medidas (longitud o referencias distintas).

| Modelo | Greedy | pass@8 | pass@32 |
|---|---:|---:|---:|
| Qwen3.5-9B base (thinking off) | 7 (1,6%) | — | — |
| Qwen3.5-9B base (thinking on) | 1 (0,2%) | — | — |
| Distilled Qwen | 41 (9,6%) | 95 (22,2%) | 161 (37,7%) |
| llmlean-optimize-9B-v0.1 | 79 (18,5%) | 138 (32,3%) | 184 (43,1%) |
| Gemini Argon (profesor) | 210 (49,2%) | — | — |

El modelo final mas que duplica el resultado del destilado intermedio en greedy y mejora en todas las metricas de muestreo. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el archivo Q4_K_M ocupa 5,63 GB; con contexto de 16.384 tokens y overhead de KV cache, se recomienda al menos 8-10 GB de VRAM para inferencia comoda.
- GPU de consumo: cabe en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080 y RTX 4090; tambien en GPUs de 8 GB con contexto reducido.
- GPU de datacenter: A100, H100 y L40S sin problema; utiles para servir varias instancias o lotes grandes.
- Despliegue: LM Studio (recomendado por el autor, `lms get`), llama.cpp, Ollama y otros runners compatibles con GGUF. vLLM y TGI requeririan el modelo en safetensors, no incluido en este repo.
- Contexto recomendado: 16.384 tokens segun el autor.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| llmlean-optimize-9B-v0.1-GGUF | 8,95 B | 16.384 | Optimizacion de pruebas Lean 4 | no disponible | GGUF en HF |
| Qwen3.5-9B base | ~9 B | no disponible | Proposito general | no disponible | HF |
| Gemini Argon | no disponible | no disponible | Profesor de destilacion | propietaria | API |
| Distilled Qwen (intermedio) | ~9 B | no disponible | Optimizacion de pruebas Lean 4 | no disponible | no disponible |

La comparativa con alternativas de sintesis de pruebas Lean de otros autores no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Licencia no declarada: no se puede confirmar el uso comercial; conviene contactar con el autor antes de integrarlo en produccion.
- Idiomas soportados no declarados; el entrenamiento esta centrado en Lean 4 y en el ingles tecnico de Mathlib.
- Riesgo de alucinacion de nombres de lemas o tacticas: aunque la entrada incluye referencias explicitas, el modelo puede proponer terminos que Lean rechace; toda salida debe verificarse con el comprobador.
- El autor recomienda desactivar el thinking; con thinking activado el modelo base rinde peor (1/427 frente a 7/427), lo que sugiere que el modo de razonamiento no esta alineado con esta tarea.
- Dependencia del contexto de 16.384 tokens: teoremas con trazas de tactic muy largas pueden truncarse y degradar la calidad.
- Evaluacion limitada a 427 teoremas de cinco proyectos; el rendimiento en otros dominios de Lean (por ejemplo, verificacion de software) no esta medido.
- El repo GGUF solo contiene Q4_K_M; no hay variantes de mayor o menor precision publicadas en esta informacion.
- Sesgos conocidos: no disponibles.

## Enlaces

- Modelo GGUF en Hugging Face: https://huggingface.co/l3lab/llmlean-optimize-9B-v0.1-GGUF
- Modelo base (adaptador fusionado): https://huggingface.co/l3lab/llmlean-optimize-9B-v0.1
- Ejemplo de entrada: https://huggingface.co/l3lab/llmlean-optimize-9B-v0.1-GGUF/blob/main/examples/addZero_eq.messages.json
- Mathlib: https://github.com/leanprover-community/mathlib4
- Tau Ceti: https://github.com/leanprover-community/mathlib4 (proyecto asociado, enlace no confirmado en la informacion)
- Lean 4: https://lean-lang.org/
- LM Studio: https://lmstudio.ai/
