# JanosMozer/qwen-lean4-formaliser-vDoRA

## Resumen

`JanosMozer/qwen-lean4-formaliser-vDoRA` es un adaptador QDoRA (Weight-Decomposed Low-Rank Adaptation cuantizado) sobre el modelo base `Qwen/Qwen3-Coder-30B-A3B-Instruct`, un modelo de lenguaje de tipo Mixture-of-Experts (MoE) con 30 mil millones de parámetros totales y 3 mil millones activos. El adaptador está especializado en la autoformalización de matemáticas en lenguaje natural a declaraciones verificadas en Lean 4, comprobadas contra Mathlib. Resuelve el problema de traducir enunciados matemáticos informales a un formato formal verificable, un paso crítico para la demostración automática de teoremas y la verificación formal.

El modelo se entrenó en dos etapas: primero una fase de ajuste supervisado (SFT) con aproximadamente 40 000 pares informales/formales, y después un refuerzo por aprendizaje (RL) con Group Relative Policy Optimization (GRPO) donde el entorno de recompensa es un compilador Lean 4 real. En el conjunto de test de ProofNet alcanza un 64 % de Pass@5 con reparación multi-turno mediante compilador, superando en 16 puntos a la línea base de SFT. Su relevancia actual radica en que combina técnicas de cuantización (QLoRA), descomposición de pesos (DoRA) y RL con verificación formal, un área de creciente interés para la investigación matemática asistida por IA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | QDoRA sobre Qwen3-Coder-30B-A3B-Instruct (MoE, transformer) |
| Parametros totales | 30B (modelo base) + ~468M (adaptador, 2.92 % del total) |
| Parametros activos | 3B (modelo base, MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NF4 doble cuantizado para el modelo base, adaptador en bfloat16 |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre el modelo base `Qwen3-Coder-30B-A3B-Instruct`, un transformer MoE con atención estándar y capas de expertos. El método QDoRA combina la cuantización NF4 del modelo base (técnica de QLoRA) con la descomposición de actualizaciones de peso en componentes de magnitud y dirección (DoRA), lo que mejora la generalización respecto a LoRA estándar a costa de un mayor coste de inferencia. La configuración del adaptador usa r=64 y α=128 para las capas de atención, y r=8 y α=16 para las capas de expertos MLP, con dropout de 0.1. Se entrenaron aproximadamente 468 millones de parámetros, un 2.92 % del total.

El entrenamiento se realizó en dos etapas. La primera, de alineación sintáctica, consistió en un ajuste supervisado (SFT) con ~40 000 pares informal/formal procedentes de los datasets Herald y Lean-Workbook, usando pérdida de entropía cruzada solo sobre los tokens de salida en Lean 4. La segunda etapa usó GRPO con un pool de trabajadores REPL de Lean 4 como entorno de recompensa: la política genera 8 completaciones por prompt, cada una se comprueba contra Mathlib, y una función de recompensa compuesta penaliza salidas malformadas, recompensa parcialmente fallos bien formados y recompensa la compilación ponderada por la fidelidad estructural a una formalización de referencia. Esta fase se entrenó sobre el dataset miniF2F.

## Capacidades

- Autoformalización de enunciados matemáticos en lenguaje natural a declaraciones Lean 4 verificadas contra Mathlib.
- Generación de teoremas y definiciones formales con sintaxis correcta de Lean 4 (tasa de bien formados del 98 % en ProofNet).
- Reparación multi-turno de errores de compilación mediante interacción con un REPL de Lean 4 (hasta 5 iteraciones).
- Razonamiento matemático de nivel universitario, evaluado en el conjunto ProofNet.
- Capacidad de compilación incremental: mejora de Compile@1 (36 %) a Pass@5 (64 %) con reintentos.
- No se especifican capacidades de tool calling, agentes ni visión; el modelo está especializado exclusivamente en formalización Lean 4.

## Casos de uso

- Verificación formal de teoremas matemáticos: un investigador puede escribir un teorema en lenguaje natural y el modelo genera una declaración Lean 4 que se comprueba contra Mathlib, acelerando el proceso de formalización de resultados existentes.
- Asistencia en demostración interactiva: integrado en editores como VS Code con Lean, el modelo sugiere formalizaciones que el usuario puede aceptar o corregir, reduciendo el esfuerzo de escribir código Lean manualmente.
- Automatización de pipelines de pruebas matemáticas: en un entorno de CI, el modelo puede traducir automáticamente enunciados de papers a Lean 4 y ejecutar el compilador para validar su corrección, generando informes de errores.
- Generación de ejercicios formales para educación: a partir de problemas de libros de texto, el modelo produce versiones formales verificables que los estudiantes pueden usar para practicar demostraciones asistidas por ordenador.
- Aumento de datasets de entrenamiento: el modelo puede generar pares informal-formal adicionales para entrenar otros modelos de razonamiento matemático, mejorando la cobertura de dominios específicos.
- Investigación en autoformalización: sirve como línea base para estudiar el impacto de la recompensa por compilación en la calidad de la formalización, comparando con variantes LoRA o SFT puro.

## Benchmarks y rendimiento

El modelo se evaluó en el conjunto de test de ProofNet (n=50). La tabla siguiente muestra los resultados comparando la etapa 1 (SFT) con el modelo final tras RL:

| Metrica | Stage 1 (SFT) | Modelo final (RLCF) |
|---|:---:|:---:|
| Well-Formed Rate | 100.0 % | 98.0 % |
| Compile@1 | 32.0 % | 36.0 % |
| Compile@2 | 44.0 % | 54.0 % |
| Compile@3 | 46.0 % | 58.0 % |
| Compile@4 | 48.0 % | 62.0 % |
| Pass@5 | 48.0 % | 64.0 % |
| Mean Iterations to Solve | 1.46 | 1.72 |
| Structural Faithfulness | 0.484 | 0.623 |
| Throughput (tok/s) | - | 3.2 |

El RL con recompensa por compilación mejora Pass@5 en 16 puntos absolutos. No se proporcionan resultados en benchmarks generales como MMLU o HumanEval, ya que el modelo está especializado en formalización.

## Requisitos de hardware

- El entrenamiento se realizó en una NVIDIA RTX 5090ti con 32 GB de VRAM.
- Para inferencia, el modelo base es un MoE de 30B con 3B activos, cuantizado en NF4 doble. Esto permite ejecutarlo en GPUs de consumo con al menos 16-24 GB de VRAM, aunque no se especifican requisitos exactos.
- El adaptador QDoRA añade una sobrecarga computacional: el throughput medido es de ~3.2 tok/s en la configuración de evaluación, frente a ~6.8 tok/s de la variante LoRA.
- Opciones de despliegue: al ser un adaptador PEFT, se puede cargar con la librería `transformers` y `peft` en Python. No se menciona compatibilidad con vLLM, llama.cpp u Ollama.
- Para uso en producción, se recomienda un entorno con REPL de Lean 4 para el bucle de reparación multi-turno.

## Comparativa con modelos similares

| Modelo | Base | Metodo | Parametros adaptador | Pass@5 (ProofNet) | Throughput |
|---|---|---|---|---|---|
| qwen-lean4-formaliser-vDoRA (este) | Qwen3-Coder-30B-A3B-Instruct | QDoRA | ~468M | 64 % | 3.2 tok/s |
| qwen-lean4-formaliser-vLoRA | Qwen3-Coder-30B-A3B-Instruct | LoRA | no disponible | no disponible (mencionado como alternativa de mayor throughput) | ~6.8 tok/s |
| Otros modelos de autoformalización (p.ej. qwen-1.5b-lean4-formalizer) | Qwen2-1.5B | LoRA | no disponible | no disponible | no disponible |

No se dispone de comparaciones directas con otros adaptadores de formalización en la información proporcionada. La variante vLoRA se menciona como opción de mayor throughput, aunque sin datos de rendimiento en ProofNet.

## Limitaciones y advertencias

- El modelo está altamente especializado en Lean 4 y puede no generalizar bien a otros lenguajes formales o dominios fuera de las matemáticas.
- La tasa de bien formados cae al 98 % tras el RL (frente al 100 % en SFT), lo que indica que algunas salidas pueden ser sintácticamente inválidas.
- La fidelidad estructural media es de 0.623, lo que sugiere que las formalizaciones generadas pueden diferir de la referencia canónica en aspectos semánticos.
- El throughput de inferencia es bajo (3.2 tok/s) debido a la descomposición de pesos de DoRA; para aplicaciones de alto volumen puede ser preferible la variante LoRA.
- No se especifican sesgos conocidos, pero al entrenarse con datos de matemáticas formales, puede reflejar sesgos presentes en los datasets Herald, Lean-Workbook y miniF2F.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen3-Coder-30B-A3B-Instruct tiene su propia licencia (Qwen Research License) que puede imponer restricciones adicionales; se debe verificar la compatibilidad.
- No se proporcionan garantías de corrección formal: aunque el modelo genera declaraciones que compilan, no se verifica la validez lógica de las demostraciones asociadas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/JanosMozer/qwen-lean4-formaliser-vDoRA
- Repositorio GitHub (leanbench): https://github.com/JanosMozer/leanbench
- Modelo base: https://huggingface.co/Qwen/Qwen3-Coder-30B-A3B-Instruct
- Dataset Herald: https://huggingface.co/datasets/alexjbest/herald
- Dataset Lean-Workbook: https://huggingface.co/datasets/deepseek-ai/Lean-Workbook
- Dataset miniF2F: https://huggingface.co/datasets/facebook/miniF2F
- Dataset ProofNet: https://huggingface.co/datasets/hoskinson-center/proofnet
- Paper Qwen3: https://arxiv.org/abs/2505.09388
- Paper QLoRA: https://arxiv.org/abs/2305.14314
- Paper DoRA: https://arxiv.org/abs/2402.09353
- Paper DeepSeekMath: https://arxiv.org/abs/2402.03300
- Paper DeepSeek-R1: https://arxiv.org/abs/2501.12948
- Paper ProofNet: https://arxiv.org/abs/2302.12433
- Variante vLoRA: https://huggingface.co/JanosMozer/qwen-lean4-formaliser-vLoRA
