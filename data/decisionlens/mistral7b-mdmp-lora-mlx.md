# decisionlens/mistral7b-mdmp-lora-mlx

## Resumen

El modelo `decisionlens/mistral7b-mdmp-lora-mlx` es un adaptador LoRA (Low-Rank Adaptation) en formato MLX, desarrollado por el usuario decisionlens, que ajusta el modelo base `mlx-community/Mistral-7B-Instruct-v0.3-4bit` para el asesoramiento en planificación de estado mayor según la doctrina militar estadounidense (MDMP, Military Decision Making Process). Se trata de una herramienta educativa no oficial, sin afiliación con el ejército de EE. UU., y se distribuye bajo licencia Apache 2.0.

El adaptador se entrenó mediante QLoRA con `mlx-lm` sobre un conjunto de 324 pares de instrucción revisados, extraídos de resúmenes abiertos de doctrina y escenarios ficticios. Su propósito es generar respuestas fundamentadas en los manuales FM 5-0 y ADP 5-0, actuando como un asistente de coaching para personal que estudia o aplica el proceso MDMP. El repositorio incluye también un adaptador gemelo para GPU NVIDIA (`decisionlens/mistral7b-mdmp-lora`), pero ambos no son intercambiables.

La relevancia de este modelo reside en su enfoque de nicho: demuestra cómo un ajuste eficiente de parámetros sobre un modelo de 7B permite especializarse en un dominio concreto (doctrina militar) con un coste computacional reducido, y en formato MLX para ejecución en Apple Silicon. Aunque su evaluación es limitada (20 preguntas doradas), alcanza un 90% de aciertos en ese conjunto, lo que sugiere una especialización efectiva dentro de su ámbito reducido.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre Mistral-7B-Instruct-v0.3 (transformer decoder con GQA y sliding window attention) |
| Parametros totales | no disponible (el adaptador LoRA tiene tamaño de repo 0.2 GB; el modelo base tiene 7.3B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (el entrenamiento usó max sequence length 2048; el contexto del modelo base no se especifica en la información) |
| Tipos de cuantizacion | 4-bit (base) + adaptador LoRA en formato MLX |
| Idiomas soportados | no disponibles (entrenado solo en inglés según las limitaciones) |
| Licencia | Apache 2.0 (adaptador y datos de entrenamiento; el modelo base sujeto a la licencia de Mistral) |
| Formato de pesos | MLX (adaptador) sobre safetensors del base 4-bit |

## Arquitectura y entrenamiento

El adaptador se construyó sobre el modelo `mlx-community/Mistral-7B-Instruct-v0.3-4bit`, una versión cuantizada a 4 bits del Mistral-7B-Instruct-v0.3, que emplea atención por ventana deslizante (SWA) y atención de consultas agrupadas (GQA) para acelerar la inferencia. El ajuste se realizó mediante QLoRA con la librería `mlx-lm`, aplicando LoRA a todas las capas de atención (q_proj, k_proj, v_proj, o_proj) y a las capas del MLP (gate_proj, up_proj, down_proj). Los hiperparámetros relevantes son: rank 16, escala 2.0 (equivalente a alpha/rank = 32/16 en PEFT), dropout 0.05, 600 iteraciones, learning rate 5e-5 con decaimiento coseno y warmup de 20 pasos, batch efectivo de 4 (1 × 4 grad accum), y longitud máxima de secuencia de 2048 tokens.

El entrenamiento se realizó sobre un dataset propio (`decisionlens/mdmp-staff-planning-pairs`) con 324 pares de instrucción revisados manualmente, que combinan resúmenes de doctrina abierta (FM 5-0, ADP 5-0) y escenarios ficticios. No se menciona el uso de RLHF o DPO; el método es exclusivamente fine-tuning supervisado con LoRA. La evaluación se hizo sobre un conjunto dorado de 20 preguntas separado del entrenamiento, obteniendo una tasa de aciertos de 18/20 (90%) con el artefacto publicado.

## Capacidades

- Generación de texto instructivo especializado en el proceso de decisión militar (MDMP): pasos, productos, roles y mejores prácticas según doctrina del ejército de EE. UU.
- Respuesta a preguntas concretas sobre procedimientos de planificación, como la identificación de fases (p. ej., "¿Qué paso del MDMP es el war gaming?") y la generación de explicaciones fundamentadas en FM 5-0 y ADP 5-0.
- Coaching educativo para personal militar o estudiantes de planificación: puede actuar como tutor que guía a través de los pasos del MDMP y verifica respuestas contra la doctrina.
- Generación de texto con parámetros de inferencia ajustados (temperature 0.1, top_p 0.9, max_new_tokens 256) para respuestas deterministas y coherentes.
- Capacidad multilingüe no confirmada; la documentación indica que está entrenado solo en inglés y con marco estadounidense.
- No se menciona soporte para tool calling, agentes, visión o audio; es un modelo exclusivamente de texto.

## Casos de uso

- Formación de oficiales y suboficiales: el modelo puede utilizarse en cursos de planificación militar para que los alumnos practiquen preguntas sobre el MDMP y reciban respuestas inmediatas basadas en doctrina oficial, actuando como un tutor virtual accesible desde un portátil Apple Silicon.
- Preparación de exámenes de certificación: un aspirante a planificador de estado mayor puede consultar dudas específicas sobre fases del proceso, formatos de productos o criterios de evaluación, con respuestas coherentes y citables.
- Asistencia en ejercicios de simulación: durante juegos de guerra o ejercicios de planeamiento, el modelo puede servir como referencia rápida para recordar pasos, plantillas y matrices de sincronización, sin necesidad de consultar manuales físicos.
- Generación de material didáctico: instructores pueden usar el modelo para redactar escenarios ficticios, preguntas de práctica o ejemplos de productos del MDMP, acelerando la preparación de cursos.
- Apoyo a redacción de órdenes y planes: aunque no es un sustituto de la planificación operativa, puede ayudar a esbozar borradores de párrafos de órdenes de operaciones, siempre que el usuario verifique contra la doctrina vigente.
- Investigación académica sobre doctrina militar: investigadores pueden emplear el modelo como herramienta de consulta para comparar interpretaciones de FM 5-0 y ADP 5-0, siempre contrastando las respuestas con las fuentes primarias.

## Benchmarks y rendimiento

La única evaluación disponible es la realizada por el autor sobre un conjunto dorado de 20 preguntas, separado del entrenamiento. El resultado se muestra en la siguiente tabla:

| Conjunto | Tasa de aciertos |
|---|---|
| Golden set (20 preguntas, adaptador MLX) | 18/20 (90%) |

No se han publicado resultados en benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La evaluación se limita al dominio específico del MDMP y no permite comparación directa con otros modelos generalistas.

## Requisitos de hardware

- Hardware objetivo: Apple Silicon (M1, M2, M3 o superior) con memoria unificada suficiente para el modelo base 4-bit (aproximadamente 4-5 GB de RAM para los pesos, más overhead de inferencia).
- El adaptador LoRA es ligero (0.2 GB) y se carga junto con el base 4-bit; se recomienda al menos 8 GB de memoria unificada para una experiencia fluida.
- No se indica soporte para GPUs NVIDIA; para esas plataformas existe el adaptador gemelo `decisionlens/mistral7b-mdmp-lora` (Unsloth/PEFT).
- Despliegue mediante `mlx-lm` (inferencia y entrenamiento) o a través del script `demo/ask.py` del repositorio GitHub.
- No se proporcionan datos de latencia o throughput; la inferencia es típica de un modelo 7B en 4-bit en Apple Silicon, con generación de tokens en tiempo real para secuencias cortas (máximo 256 tokens de salida).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| decisionlens/mistral7b-mdmp-lora-mlx (este) | 7B base + LoRA | no disponible | 90% en golden set MDMP (n=20) | Apache 2.0 | Hugging Face, MLX |
| decisionlens/mistral7b-mdmp-lora (gemelo Unsloth) | 7B base + LoRA | no disponible | 14/20 (70%) en golden set (según model card) | Apache 2.0 | Hugging Face, PEFT/Unsloth para GPU |
| mlx-community/Mistral-7B-Instruct-v0.3-4bit (base sin adaptar) | 7.3B | 32k (según documentación de Mistral, no verificado en la información) | no disponible | Apache 2.0 (base) | Hugging Face, MLX |

La comparación se limita al adaptador gemelo para GPU y al modelo base sin ajuste. No hay otros modelos especializados en MDMP disponibles en la información proporcionada.

## Limitaciones y advertencias

- Conjunto de evaluación muy pequeño (20 preguntas) y específico del dominio; el 90% de aciertos no es generalizable a otros contextos.
- Entrenado únicamente en inglés y con marco doctrinal estadounidense; no es adecuado para doctrinas de otros países o idiomas.
- No es una herramienta operativa: no debe usarse para planificación militar real, escenarios clasificados o decisiones de alto impacto.
- Las respuestas deben verificarse siempre contra los manuales oficiales (FM 5-0, ADP 5-0); el modelo puede alucinar citas o interpretaciones erróneas.
- El adaptador no es intercambiable con el adaptador Unsloth; cada uno requiere su formato y librería específicos (MLX vs. PEFT).
- La licencia Apache 2.0 cubre el adaptador y los datos de entrenamiento, pero el modelo base Mistral tiene su propia licencia, que debe respetarse en despliegues comerciales.
- No se proporcionan datos sobre sesgos o riesgos de seguridad específicos; al ser un modelo de nicho, su exposición a contenido dañino es limitada pero no nula.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/decisionlens/mistral7b-mdmp-lora-mlx
- Adaptador gemelo para GPU (Unsloth): https://huggingface.co/decisionlens/mistral7b-mdmp-lora
- Dataset de entrenamiento: https://huggingface.co/datasets/decisionlens/mdmp-staff-planning-pairs
- Repositorio GitHub: https://github.com/dlens/mdmp-assistant
- Guía de inicio rápido: https://github.com/dlens/mdmp-assistant/blob/main/docs/hf-quick-start.md
- Script de evaluación: https://github.com/dlens/mdmp-assistant/blob/main/eval/run_golden_mlx.py
- Modelo base MLX: https://huggingface.co/mlx-community/Mistral-7B-Instruct-v0.3-4bit
- Licencia del modelo base Mistral: https://huggingface.co/mistralai/Mistral-7B-Instruct-v0.3
