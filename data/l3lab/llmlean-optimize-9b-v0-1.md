# l3lab/llmlean-optimize-9B-v0.1

## Resumen

llmlean-optimize-9B-v0.1 es un adaptador LoRA sobre el modelo base Qwen3.5-9B, desarrollado por l3lab, especializado en la optimizacion de demostraciones formales en Lean 4. El modelo no genera demostraciones desde cero: recibe el enunciado de un teorema, su demostracion original, el rastro de estados de tactic y las firmas de los lemas y definiciones referenciados, y devuelve una demostracion de reemplazo (un bloque `by`) que debe ser verificada por Lean. Resuelve un problema concreto del ecosistema de asistencia a pruebas formales: la simplificacion y refactorizacion automatica de pruebas ya existentes en proyectos como Mathlib.

El adaptador se entrena en dos fases: una destilacion desde un modelo profesor (Gemini Argon con razonamiento alto) sobre reescrituras verificadas por Lean, y una ronda de iteracion experta con muestreo multiple sobre el propio modelo destilado. Sobre la validacion de 427 teoremas, mejora la tasa de reduccion significativa del modelo base de forma sustancial (del 1,6% en modo greedy a 18,5%, y hasta 43,1% con pass@32).

Es relevante para investigadores en demostracion automatica de teoremas y para equipos que mantienen bases de codigo Lean grandes, donde la deuda tecnica en forma de pruebas redundantes o innecesariamente largas es un problema real. Se distribuye unicamente como pesos de adaptador PEFT en safetensors, con un tamano de repositorio de 0,2 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer decoder-only Qwen3.5-9B |
| Parametros totales | 9B en el modelo base; el adaptador LoRA ocupa 0,2 GB en disco |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Qwen3.5-9B) |
| Tipos de cuantizacion | no disponible (el adaptador se publica en safetensors; la cuantizacion depende del modelo base) |
| Idiomas soportados | no disponible (la tarea es Lean 4, idioma natural no declarado) |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); requiere el modelo base Qwen/Qwen3.5-9B en bfloat16 |

## Arquitectura y entrenamiento

El adaptador se monta sobre Qwen3.5-9B, un transformer decoder-only de 9.000 millones de parametros, mediante PEFT. La entrada al modelo es estructurada: enunciado del teorema, firma elaborada con variables de seccion, demostracion original, firmas explicitas de las definiciones, inductivos y teoremas referenciados, y una traza de estados de tactic con goals antes y despues de cada paso. La salida es una demostracion de reemplazo en sintaxis Lean 4. La generacion debe realizarse con la plantilla de chat del tokenizer y `enable_thinking=False`.

El entrenamiento consta de dos etapas. En la destilacion se reunieron modulos de Mathlib, Tau Ceti, Compfiles, Batteries y CSLib, y el profesor Gemini Argon (thinking alto) genero intentos de reescritura; se ajusto el estudiante Qwen sobre las 4.043 reescrituras verificadas por Lean que supusieron una mejora significativa. En la iteracion experta se amplio el conjunto de modulos y se muestrearon 32 reescrituras por teorema con el modelo destilado: de 39.097 teoremas elegibles, 17.749 tuvieron una mejora verificada, y se entreno un adaptador nuevo sobre la mejor reescritura de cada uno (14.250 provenientes de Qwen y 3.499 de Gemini). La validacion excluye los modulos de entrenamiento y cualquier modulo vinculado por teoremas duplicados o casi duplicados, con un filtro basado en tipos tokenizados identicos y, para pruebas de al menos 40 tokens, conjuntos de secuencias de cinco tokens con similitud Jaccard de al menos 0,85.

## Capacidades

- Optimizacion de demostraciones Lean 4: recibe una prueba existente y devuelve una version mas corta o con menos referencias a teoremas distintos, manteniendo la verificacion por Lean.
- Razonamiento sobre estados de tactic: interpreta goals, contexto local y trazas de ejecucion paso a paso.
- Uso de firmas de lemas y definiciones: recibe explicitamente las firmas de las referencias y puede sustituir unas por otras.
- Reduccion de referencias: capacidad de eliminar dependencias de teoremas cuando existe una prueba mas directa.
- Generacion de bloques `by`: la salida es una prueba de reemplazo completa en sintaxis Lean 4.
- No soporta tool calling ni function calling segun la informacion disponible.
- No se declaran capacidades de agente, vision, audio ni modo thinking (de hecho, se recomienda desactivar el thinking del modelo base).
- Capacidades multilingues: no disponibles; la tarea es especifica de Lean 4.

## Casos de uso

- Mantenimiento de Mathlib y bibliotecas Lean grandes: el adaptador puede procesar teoremas existentes y proponer pruebas mas cortas que reduzcan el coste de compilacion y la carga de mantenimiento, con validacion automatica por Lean antes de aceptar el cambio.
- Refactorizacion asistida en integracion continua: integrar el modelo en un pipeline que, tras cada commit, intente optimizar pruebas modificadas y abra una pull request solo con las reescrituras que Lean verifica y que cumplen el criterio de reduccion significativa (al menos 20% y 10 tokens menos, o dos referencias menos).
- Investigacion en destilacion para demostracion de teoremas: el adaptador y su receta (destilacion mas iteracion experta) sirven como referencia reproducible para estudiar como se transfiere capacidad de un profesor propietario a un estudiante abierto en un dominio formal.
- Generacion de datos de entrenamiento: el modelo puede producir reescrituras candidatas con pass@32, utiles para ampliar corpus de pruebas optimizadas verificadas por Lean.
- Docencia y formacion en Lean 4: mostrar versiones simplificadas de pruebas reales ayuda a explicar tacticas y reescrituras, siempre que el resultado se verifique antes de su uso.
- Evaluacion comparativa de asistentes formales: sirve como linea base abierta frente a modelos propietarios en la tarea concreta de optimizacion de pruebas, con un protocolo de validacion publicado.

## Benchmarks y rendimiento

Validacion sobre 427 teoremas de 211 modulos Lean (Mathlib 200, Tau Ceti 200, Compfiles 16, Batteries 7, CSLib 4). Se cuenta un teorema cuando Lean verifica la reescritura y ninguna de las dos medidas de reduccion empeora. Reduccion significativa: al menos 20% mas corta y 10 tokens Lean menos, o al menos dos referencias distintas menos.

| Modelo | Greedy | pass@8 | pass@32 |
|---|---:|---:|---:|
| Qwen3.5-9B base (thinking off) | 7 (1,6%) | no disponible | no disponible |
| Qwen3.5-9B base (thinking on) | 1 (0,2%) | no disponible | no disponible |
| Qwen destilado | 41 (9,6%) | 95 (22,2%) | 161 (37,7%) |
| llmlean-optimize-9B-v0.1 | 79 (18,5%) | 138 (32,3%) | 184 (43,1%) |
| Gemini Argon (profesor, 1 intento) | 210 (49,2%) | no disponible | no disponible |

## Requisitos de hardware

- El adaptador pesa 0,2 GB, pero requiere cargar el modelo base Qwen3.5-9B en bfloat16: aproximadamente 18 GB de VRAM solo para pesos, mas memoria para el contexto y la cache KV.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 6000 Ada para inferencia comoda en bfloat16. En consumer, una RTX 4090 (24 GB) puede alojar el modelo en bfloat16 con contextos moderados; una RTX 3090 (24 GB) queda al limite.
- Cuantizacion: el adaptador se publica en safetensors y la model card no documenta recetas de cuantizacion; fusionar el adaptador con el base y cuantizar a 4 bits permitiria bajarlo a unos 5-6 GB, pero no hay datos publicados de calidad tras ese proceso.
- Despliegue: la ruta documentada es `transformers` + `peft` con `Qwen3_5ForConditionalGeneration`. No se documentan vLLM, llama.cpp, Ollama ni TGI para este adaptador; el uso con vLLM requeriria fusionar el LoRA en el base.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Greedy (validacion) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| llmlean-optimize-9B-v0.1 | 9B + LoRA | no disponible | Optimizacion de pruebas Lean 4 | 18,5% | no disponible | Hugging Face (adaptador) |
| Qwen3.5-9B base | 9B | no disponible | Proposito general | 1,6% (thinking off) | no disponible | Hugging Face |
| Qwen destilado (etapa intermedia) | 9B + LoRA | no disponible | Optimizacion de pruebas Lean 4 | 9,6% | no disponible | No publicado como checkpoint independiente |
| Gemini Argon | no disponible | no disponible | Proposito general con thinking alto | 49,2% | propietaria | API de Google |

No se dispone de datos publicados de otros adaptadores abiertos comparables especificamente en optimizacion de pruebas Lean 4 dentro de la informacion proporcionada.

## Limitaciones y advertencias

- Solo devuelve reescrituras de pruebas existentes; no genera demostraciones desde cero para teoremas sin prueba.
- La validacion se limita a 427 teoremas de cinco proyectos; el rendimiento en dominios Lean fuera de Mathlib, Tau Ceti, Compfiles, Batteries y CSLib no esta medido.
- La licencia no esta declarada, lo que impide confirmar si el uso comercial esta permitido; es un bloqueo para produccion hasta aclararlo.
- El modelo base Qwen3.5-9B se cita con una revision concreta (`c202236235762e1c871ad0ccb60c8ee5ba337b9a`); usar otra revision puede degradar resultados.
- Se debe desactivar el modo thinking del modelo base (`enable_thinking=False`); con thinking activado el modelo base rinde peor en esta tarea (0,2% frente a 1,6%).
- Toda salida debe verificarse con Lean antes de aceptarse; el modelo puede producir pruebas sintacticamente validas pero no verificables, y la model card no reporta tasas de error de sintaxis.
- No hay informacion sobre sesgos, alucinacion en lenguaje natural ni comportamiento fuera del dominio Lean 4.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validacion independiente de la comunidad.
- El adaptador no incluye el modelo base: el despliegue requiere descargar Qwen3.5-9B por separado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/l3lab/llmlean-optimize-9B-v0.1
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Repositorio del modelo base en la revision citada: https://huggingface.co/Qwen/Qwen3.5-9B/tree/c202236235762e1c871ad0ccb60c8ee5ba337b9a
- PEFT (libreria de adaptadores): https://github.com/huggingface/peft
- Mathlib: https://github.com/leanprover-community/mathlib4
- Tau Ceti: https://github.com/leanprover-community/mathlib4 (proyecto comunitario; enlace directo no disponible)
- Compfiles: https://github.com/dwrensha/compfiles
- Batteries: https://github.com/leanprover-community/batteries
- CSLib: no disponible
- Lean 4: https://lean-lang.org/
