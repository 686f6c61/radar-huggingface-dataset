# LindotAI/Lin-1-Locus

## Resumen

Lin-1 Locus es un modelo de lenguaje de 4.205.751.296 parámetros (aproximadamente 4B) desarrollado por LindotAI, especializado en la generación de código Rust. Se trata de un ajuste fino (*fine-tuning*) supervisado del modelo base Qwen/Qwen3.5-4B, orientado a producir código idiomático que compile y supere sus propios tests. El modelo responde de forma directa, sin trazas largas de razonamiento, lo que reduce la latencia y lo hace apto para ejecución local.

La propuesta de valor del modelo es la calidad del código Rust generado: según los datos del autor, se entrenó exclusivamente con código que compilaba y/o pasaba sus propios tests unitarios, lo que se traduce en una tasa de acierto superior a la del modelo base y competitiva frente a modelos de código más grandes. Incorpora además una alta diversidad de muestreo (pass@10 elevado), lo que lo hace adecuado para bucles de generar-y-testear.

El modelo se distribuye con licencia Apache 2.0 (la misma que el modelo base), en formatos safetensors y GGUF (se incluye una cuantización Q8_0 de aproximadamente 4,5 GB), y es compatible con despliegues en transformers, vLLM, llama.cpp y Ollama. Está etiquetado para generación de texto y conversación, con soporte declarado de inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Qwen3.5-4B) |
| Parametros totales | 4.205.751.296 (~4B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (el ejemplo de vLLM usa `--max-model-len 8192`) |
| Tipos de cuantizacion | GGUF (se incluye Q8_0, ~4,5 GB); safetensors en precisión original |
| Idiomas soportados | Inglés (`en`); otros idiomas funcionan pero no son el objetivo |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors y GGUF |

## Arquitectura y entrenamiento

Lin-1 Locus es un transformer decoder-only construido sobre Qwen3.5-4B. El proceso de entrenamiento consta de dos fases de ajuste fino supervisado (SFT): primero sobre datos de instrucciones Rust y sobre las propias respuestas del modelo verificadas mediante tests (*rejection sampling*); después, sobre código Rust curado de fuentes con licencias permisivas, concretamente ficheros del subconjunto Rust de *The Stack Edu* que compilan y pasan sus tests unitarios, y muestras de *Strandset-Rust* verificadas por compilación. Todos los datos de entrenamiento se descontaminaron frente a los conjuntos de evaluación con un filtro de solapamiento de 12 gramos.

Una innovación destacable es el enfoque de entrenamiento guiado por verificación: solo se usaron muestras que superaban la compilación y/o sus tests, lo que prioriza la corrección funcional del código sobre la mera plausibilidad sintáctica. El modelo responde directamente, sin modo de razonamiento largo (`enable_thinking=False` en el ejemplo de uso), lo que reduce la latencia para uso interactivo y local.

## Capacidades

- Generación de código Rust: funciones, traits, genéricos, manejo de errores, iteradores y tests unitarios.
- Generación de código idiomático y compilable, entrenado con muestras verificadas por compilación y tests.
- Alta diversidad de muestreo (pass@10 elevado), adecuada para bucles de generar-y-testear.
- Generación de texto y conversación (pipeline `text-generation`, tag `conversational`).
- Respuesta directa sin trazas largas de razonamiento, con menor latencia.
- Soporte de otros lenguajes de programación de forma secundaria (no es el objetivo del modelo).
- Soporte de *tool calling* / *function calling*: no disponible en la información proporcionada.
- Capacidades de agentes y razonamiento multi-paso: no disponibles de forma destacada; el autor advierte que las tareas agenticas de horizonte largo siguen siendo difíciles para un modelo de 4B.
- Capacidades multimodales (visión, audio): no disponibles.

## Casos de uso

- Generación de código Rust en producción: el modelo escribe funciones, traits y genéricos idiomáticos que compilan, lo que permite integrarlo en pipelines de CI/CD con compilación y tests automáticos antes de aceptar el código.
- Generación de tests unitarios Rust: dado un módulo existente, el modelo puede producir tests que se ejecutan en el propio pipeline de integración continua.
- Bucles de generar-y-testear: gracias a su pass@10 elevado (86,1 en HumanEval-Rust y 73,1 en MBPP-Rust), es adecuado para muestrear varias soluciones y seleccionar la que pasa los tests.
- Asistente local de programación: con la cuantización Q8_0 (~4,5 GB) puede ejecutarse en un portátil o estación de trabajo de gama alta sin GPU dedicada de gran tamaño, ofreciendo autocompletado y generación de código con baja latencia.
- Migración o portado de código a Rust: el modelo puede reescribir fragmentos hacia Rust idiomático, con verificación posterior por compilación.
- Enseñanza y ejemplos de Rust: generación de ejemplos didácticos de traits, iteradores y manejo de errores con tests incluidos.
- Automatización de tareas de refactorización acotadas en Rust: reescritura de funciones con verificación de compilación y tests en el mismo flujo.

## Benchmarks y rendimiento

Resultados publicados por el autor, medidos con el mismo arnés (ports a Rust de los benchmarks; el código generado se compila y se ejecuta contra los tests):

| Modelo | HumanEval-Rust p@1 / p@10 | MBPP-Rust p@1 / p@10 | Holdout (Rust) | LBPP-Rust |
|---|---|---|---|---|
| Lin-1 Locus (4B) | 73,1 / 86,1 | 63,4 / 73,1 | 58,7 | 27,5 |
| Lin-1 Epsilon Preview (0,5B) | 48,4 / 65,2 | 41,3 / 54,2 | 30,3 | 4,1 |
| Temper 2 Nodel | 73,3 / 81,8 | 64,7 / 70,6 | 55,4 | 26,4 |
| Qwen2.5-Coder-7B-Instruct | 72,4 / 82,6 | 60,5 / 70,0 | — | — |
| Qwen3.5-4B (base) | 66,2 / 81,4 | 57,7 / 73,4 | — | — |
| Qwen3-4B | 59,8 / 64,8 | 55,6 / 60,6 | — | — |
| Qwen2.5-Coder-3B-Instruct | 56,5 / 71,9 | 44,8 / 60,0 | — | — |
| Qwen2.5-Coder-1.5B-Instruct | 39,0 / 56,1 | 38,3 / 52,1 | — | — |
| Qwen3.5-2B | 31,7 / 51,3 | 36,0 / 53,2 | — | — |

El *Holdout* es un conjunto privado de tareas Rust con tests que nunca se usó para entrenamiento.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 4B parámetros, la cuantización Q8_0 ocupa ~4,5 GB de pesos, a lo que hay que sumar la memoria de contexto y la caché KV.
- GPU recomendadas: no disponibles en la información proporcionada; por tamaño, una GPU con 8-16 GB de VRAM debería ser suficiente para Q8_0.
- Cabe en GPU de consumo: sí, según el tamaño de la cuantización Q8_0 (~4,5 GB); el modelo base de 4B en precisión completa requeriría más VRAM.
- Opciones de despliegue: transformers (`AutoModelForCausalLM`), vLLM (`vllm serve ... --max-model-len 8192`), llama.cpp (`llama-cli`) y Ollama (formato GGUF).
- Latencia y throughput estimados: no disponibles. El autor destaca que responde directamente sin trazas largas de razonamiento, lo que reduce la latencia para uso local.
- Muestreo recomendado: temperatura 0,2 para respuestas únicas y 0,8 al muestrear varios candidatos y testearlos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | HumanEval-Rust p@1 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Lin-1 Locus | ~4B | No disponible | 73,1 | Apache 2.0 | Hugging Face (safetensors + GGUF) |
| Qwen3.5-4B (base) | ~4B | No disponible | 66,2 | No disponible en la información | Hugging Face |
| Qwen2.5-Coder-7B-Instruct | 7B | No disponible | 72,4 | No disponible en la información | Hugging Face |
| Temper 2 Nodel | No disponible | No disponible | 73,3 | No disponible en la información | No disponible en la información |
| Qwen3-4B | ~4B | No disponible | 59,8 | No disponible en la información | Hugging Face |

Lin-1 Locus supera al modelo base Qwen3.5-4B en HumanEval-Rust p@1 (73,1 frente a 66,2) y en MBPP-Rust p@1 (63,4 frente a 57,7), y se sitúa a la par de Qwen2.5-Coder-7B-Instruct pese a tener menos parámetros. Frente a Temper 2 Nodel, queda ligeramente por debajo en p@1 pero por encima en p@10 y en el conjunto Holdout.

## Limitaciones y advertencias

- El modelo está centrado en Rust; otros lenguajes funcionan pero no son el objetivo y su calidad no está garantizada.
- Con 4B parámetros, los proyectos multi-fichero complejos y las tareas agenticas de horizonte largo siguen siendo difíciles.
- Riesgo de alucinación: el autor recomienda compilar y testear siempre el código generado; no debe asumirse que el código es correcto sin verificación.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Limitaciones de idioma: soporte declarado de inglés; el comportamiento en castellano u otros idiomas no está documentado.
- Restricciones de licencia: Apache 2.0, permisiva para uso comercial, con las obligaciones habituales de atribución y aviso de licencia.
- El modelo responde sin trazas de razonamiento largas, lo que puede penalizar en tareas que requieren planificación extensa.
- Los benchmarks publicados los ha medido el propio autor con su arnés; conviene tratarlos con la cautela habitual ante evaluaciones no independientes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/LindotAI/Lin-1-Locus
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Repositorio de benchmarks (imágenes referenciadas en la model card): `benchmarks_wide.png` y `benchmarks.png` en el repositorio del modelo
- Paper, blog, repositorio de código o demo: no disponibles en la información proporcionada
