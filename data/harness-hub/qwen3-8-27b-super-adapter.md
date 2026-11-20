# harness-hub/Qwen3.8-27B-super-adapter

## Resumen

El super-adapter de harness-hub es un adaptador LoRA sobre el modelo base Qwen/Qwen3.8-27B, desarrollado por el equipo de harness-hub. No se trata de un modelo entrenado desde cero, sino de la fusión de tres adaptadores LoRA independientes, cada uno entrenado mediante aprendizaje por refuerzo (GRPO asíncrono) dentro de un arnés de agente de codificación distinto: pi, Hermes Agent y OpenCode. El resultado es un único adaptador que funciona razonablemente bien en los tres entornos sin necesidad de mantener tres artefactos separados.

El problema que resuelve es la fragmentación de adaptadores especializados por arnés: un adaptador entrenado para pi pierde rendimiento cuando se ejecuta bajo Hermes Agent u OpenCode. El super-adapter busca un compromiso que generalice entre los tres arneses, manteniendo el modo thinking activado como configuración recomendada. Con thinking activado, mejora la tasa media de pass@1 del 55,5% al 63,5% en seis pares arnés-benchmark (SWE-bench Pro hard 51 y Terminal-Bench 2.1), y reduce entre un 19% y un 48% el número de llamadas a herramientas por tarea.

El adaptador se distribuye en formato PEFT (safetensors) y también como GGUF. Está pensado para tareas de ingeniería de software y terminal, no como un adaptador de propósito general. La fusión no implica entrenamiento adicional: es una combinación de pesos de los tres adaptadores especialistas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer Qwen3.8-27B; fusión de tres adaptadores |
| Parametros totales | no disponible (adaptador LoRA; el modelo base Qwen3.8-27B no especifica parámetros en la información disponible) |
| Parametros activos | no aplica (no es MoE según la información disponible) |
| Longitud de contexto | 131.072 tokens (ventana usada en la evaluación) |
| Tipos de cuantizacion | no disponible (existe variante GGUF publicada, sin detalle de tipos) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (PEFT); GGUF disponible en repo separado |

## Arquitectura y entrenamiento

El adaptador se construye sobre Qwen/Qwen3.8-27B, un modelo multimodal con torre de visión (pipeline image-text-to-text), aunque en la evaluación la torre de visión no se sirve y las pruebas son solo texto. Cada uno de los tres adaptadores especialistas se entrenó con aprendizaje por refuerzo usando GRPO asíncrono dentro de un arnés concreto (pi, Hermes Agent, OpenCode), sobre tareas de ingeniería de software y terminal. Los datasets citados son harness-hub/scale800-harbor, harness-hub/harness-adapters, harness-hub/termgrade-train-harbor y ai-and/termgrade-environments.

La innovación principal es el propio proceso de fusión: se combinan los pesos de los tres adaptadores LoRA sin entrenamiento adicional, buscando un artefacto único que generalice entre arneses. La evaluación se realizó con una ventana de contexto de 131.072 tokens, un presupuesto de 100 pasos por tarea, una sola tentativa por tarea, muestreo con temperatura 0,8 y top-p 1,0, comparando siempre base y adaptador bajo ajustes idénticos. El modo thinking se ejecuta a esfuerzo de razonamiento `xhigh`.

## Capacidades

- Generación de texto y razonamiento en tareas de ingeniería de software y terminal.
- Ejecución de tareas de agente multi-paso con llamadas a herramientas (tool calling) dentro de arneses de codificación.
- Compatibilidad con tres arneses concretos: pi, Hermes Agent y OpenCode.
- Modo thinking con esfuerzo de razonamiento configurable (`xhigh` en la evaluación).
- Capacidad multimodal declarada por el pipeline (image-text-to-text), aunque la torre de visión no se sirve en los resultados publicados.
- Soporte multilingüe: no disponible en la información proporcionada.

## Casos de uso

- Resolución de incidencias en repositorios reales: el adaptador está entrenado para SWE-bench Pro y puede aplicarse a tareas de localización y parcheo de bugs en bases de código, aprovechando la ventana de 131.072 tokens para cargar contexto amplio del repositorio.
- Automatización de tareas de terminal: adecuado para Terminal-Bench 2.1, es decir, ejecución de comandos, depuración de entornos y operaciones de shell guiadas por agente.
- Despliegue multi-arnés en un equipo: al fusionar tres especialistas, permite usar un único adaptador con pi, Hermes Agent y OpenCode sin mantener tres artefactos separados.
- Reducción de coste por tarea: con thinking activado reduce entre un 19% y un 48% las llamadas a herramientas por tarea, lo que baja el coste de tokens y la latencia en pipelines de agentes.
- Integración en CI/CD para reparación automática de tests: el modelo puede recibir fallos de test y proponer parches dentro de un arnés con presupuesto de pasos acotado (100 pasos en la evaluación).
- Evaluación comparativa de arneses: útil como referencia para medir cómo un mismo adaptador rinde bajo distintos arneses sobre los mismos benchmarks.

## Benchmarks y rendimiento

Resultados publicados en la model card (una tentativa por tarea, 100 pasos, contexto 131.072, temperatura 0,8, top-p 1,0). "Specialist" es el adaptador propio de cada arnés con thinking desactivado.

| Arnés | Benchmark | Base | Specialist | Super-adapter | Base thinking | Super-adapter thinking |
|---|---|---|---|---|---|---|
| pi | SWE-bench Pro (hard 51) | 40,0% | 64,0% | 46,0% | 74,0% | 74,0% |
| Hermes Agent | SWE-bench Pro (hard 51) | 29,4% | 43,1% | 47,1% | 45,1% | 60,8% |
| OpenCode | SWE-bench Pro (hard 51) | 35,3% | 51,0% | 45,1% | 47,1% | 66,7% |
| pi | Terminal-Bench 2.1 | 40,0% | 56,5% | 48,2% | 52,9% | 57,6% |
| Hermes Agent | Terminal-Bench 2.1 | 44,7% | 58,8% | 55,3% | 58,8% | 63,5% |
| OpenCode | Terminal-Bench 2.1 | 47,6% | 52,4% | 52,4% | 54,9% | 58,5% |

Con thinking activado, la media de pass@1 pasa de 55,5% a 63,5% en los seis pares. El recuento agregado de tareas nuevas resueltas frente a perdidas es 67/37 (p = 0,004). Con thinking desactivado, la media pasa de 39,5% a 49,0%, con 71 tareas nuevas resueltas frente a 34 perdidas (p < 0,001). Los resultados no son comparables con los publicados en la model card de Qwen3.8-27B, que emplea otros arneses (Terminus, Claude Code), presupuestos mayores y el SWE-bench Pro completo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; depende del modelo base Qwen3.8-27B y de la cuantización elegida, no del adaptador (1,9 GB de repo).
- GPU recomendadas: no disponibles en la información proporcionada.
- Compatibilidad con GPU de consumo: no disponible.
- Despliegue: vLLM (soporte indicado en la model card) y llama.cpp (con la variante GGUF publicada).
- Latencia y throughput: no disponibles; la model card solo reporta reducción de llamadas a herramientas (19-48% con thinking, 53-73% sin thinking).

## Comparativa con modelos similares

| Modelo | Tipo | Contexto | Rendimiento (SWE-bench Pro hard 51 / Terminal-Bench 2.1) | Licencia |
|---|---|---|---|---|
| harness-hub/Qwen3.8-27B-super-adapter | LoRA fusionado sobre Qwen3.8-27B | 131.072 | 74,0 / 74,0 (pi), 60,8 / 63,5 (Hermes), 66,7 / 58,5 (OpenCode) con thinking | Apache 2.0 |
| Qwen/Qwen3.8-27B (base) | Modelo completo | 131.072 (en la evaluación) | 74,0 / 52,9 (pi), 45,1 / 58,6 (Hermes), 47,1 / 54,7 (OpenCode) con thinking | no disponible |
| harness-hub/Qwen3.8-27B-pi-adapted | LoRA especialista | 131.072 | 64,0 en SWE-bench Pro (pi), thinking off | no disponible |
| harness-hub/Qwen3.8-27B-hermes-adapted | LoRA especialista | 131.072 | 43,1 en SWE-bench Pro (Hermes), thinking off | no disponible |
| harness-hub/Qwen3.8-27B-opencode-adapted | LoRA especialista | 131.072 | 51,0 en SWE-bench Pro (OpenCode), thinking off | no disponible |

## Limitaciones y advertencias

- El adaptador está entrenado específicamente para tres arneses (pi, Hermes Agent, OpenCode); su comportamiento fuera de ellos no está documentado.
- Con thinking desactivado, los especialistas por arnés superan al super-adapter en su propio arnés; el super-adapter solo es la mejor opción si se usa thinking o se necesita un único artefacto multi-arnés.
- Los resultados se obtuvieron con una sola tentativa por tarea y presupuesto de 100 pasos; no reflejan el rendimiento con presupuestos mayores o configuraciones distintas.
- La torre de visión no se sirve en la evaluación: no hay evidencia publicada del rendimiento multimodal del adaptador.
- No hay información sobre sesgos, idiomas soportados ni riesgo de alucinación específico del adaptador.
- La licencia Apache 2.0 aplica al adaptador; conviene verificar la licencia del modelo base Qwen3.8-27B antes de uso comercial.
- El modelo base es de noviembre de 2026 según la fecha de creación del repo; verificar disponibilidad y estabilidad del ecosistema de despliegue.

## Enlaces

- Hugging Face del adaptador: https://huggingface.co/harness-hub/Qwen3.8-27B-super-adapter
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Variante GGUF: https://huggingface.co/harness-hub/Qwen3.8-27B-super-adapter-GGUF
- Blog de la receta: https://huggingface.co/blog/harness-hub/harness-adapters-at-scale
- Especialista pi: https://huggingface.co/harness-hub/Qwen3.8-27B-pi-adapted
- Especialista Hermes Agent: https://huggingface.co/harness-hub/Qwen3.8-27B-hermes-adapted
- Especialista OpenCode: https://huggingface.co/harness-hub/Qwen3.8-27B-opencode-adapted
- Arnés pi: https://github.com/earendil-works/pi
- Arnés Hermes Agent: https://github.com/NousResearch/hermes-agent
- Arnés OpenCode: https://opencode.ai
