# fylume/yaob-n10k-specialists-0.1.0

## Resumen

Yaob N10K specialist adapters 0.1.0 es un conjunto de cuatro adaptadores LoRA experimentales publicados por Fylume en noviembre de 2026 para el modelo base Qwen/Qwen3-4B-Instruct-2507. Cada adaptador está asociado a un módulo del sistema Yaob N10K (astronomía, química, historia y un módulo canario de diagnóstico) y se entrenó para almacenar los hechos textuales de los nodos de dicho módulo. No son modelos autónomos: requieren el modelo base Qwen3-4B-Instruct-2507 y la librería PEFT para funcionar.

El interés de esta publicación es doble. Por un lado, documenta con inusual transparencia un resultado negativo: los adaptadores mejoran la precisión en preguntas cerradas sobre su dominio (por ejemplo, del 24,0 % al 39,6 % en astronomía), pero empeoran el rendimiento del sistema completo cuando se activan (81 % frente a 85 % en la suite de evaluación interna) y reducen la capacidad de rechazar preguntas sobre entidades inventadas (del 100 % al 50 %). Por otro, sirve como referencia metodológica para quien quiera reproducir un entrenamiento LoRA sobre Qwen3-4B con fines de investigación.

La relevancia actual es, por tanto, más científica que práctica: el autor los publica explícitamente para investigadores y no como forma recomendada de ejecutar Yaob. La licencia es *source-available* con condición de no reventa, no open source, lo que limita su uso comercial directo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer Qwen3-4B-Instruct-2507; rango 16, alpha 32, dropout 0, aplicado a q_proj, k_proj, v_proj, o_proj, gate_proj, up_proj y down_proj de las 36 capas |
| Parámetros totales | 33.030.144 entrenables por adaptador; 132.120.576 en total (cuatro adaptadores) |
| Parámetros activos | no disponible (no es MoE; son adaptadores LoRA) |
| Longitud de contexto | no disponible (heredada del modelo base Qwen3-4B-Instruct-2507, no especificada en la información) |
| Tipos de cuantización | no disponible (pesos almacenados en float32; no se documentan conversiones GGUF ni otras) |
| Idiomas soportados | no disponible (datos de entrenamiento en inglés: Wikipedia y Wikidata) |
| Licencia | fylume-source-available-1.0-weights (Apache 2.0 + condición de no reventa); los adaptadores de astronomía, química e historia pueden quedar bajo CC BY-SA 4.0 según la sección 7 |
| Formato de pesos | safetensors (adapter_model.safetensors, 504 tensores por adaptador: 252 lora_A y 252 lora_B) |

## Arquitectura y entrenamiento

Cada adaptador es un LoRA de rango 16 y alpha 32, sin dropout, insertado en las siete proyecciones lineales de las 36 capas del transformer Qwen3-4B-Instruct-2507 (revisión `cdbee75f17c01a7cc42f958dc650907174af0554`). El modelo base no se incluye ni se modifica. El entrenamiento se realizó con PEFT 0.21.2 y el código `mpnstudio` de Fylume (commit `a2494b91e74bb08e47e330d81197528edb33de2c` más cambios sin confirmar), sobre una NVIDIA GB10 (DGX Spark) con torch 2.15.0+cu132.

Los datos provienen del texto de los nodos del módulo correspondiente en la red Yaob N10K (revisión 2, 10.160 nodos; 179.037 ejemplos de entrenamiento y 75.528 de validación en total), con tres tipos de ejemplo: recitar, definir y dato. La fuente del texto es Wikipedia en inglés (secciones iniciales, CC BY-SA 4.0) y Wikidata (CC0); el módulo canario usa 160 hechos inventados por Fylume. El objetivo es la pérdida de lenguaje sobre la respuesta del nodo, con un 75 % de ejemplos a libro cerrado y un 25 % con texto del nodo y cita. Se usó AdamW (betas 0,9 y 0,99, sin weight decay), learning rate 5e-4 con warm-up y coseno hasta el 5 %, batch 8 y gradient clip 1,0; el núcleo en bf16 con autocast y el adaptador en float32. La semilla fue 20261111.

Los cuatro adaptadores y sus entrenamientos: astronomía (300 pasos, pérdida final 0,919, 19,6 min), química (345 pasos, 0,514, 35,6 min), historia (735 pasos, 1,774, 96,4 min) y canario de diagnóstico (400 pasos, 20 exposiciones por nodo, 0,421, 15,2 min). No se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Almacenamiento de hechos de dominio: cada adaptador mejora la recuperación a libro cerrado de datos de su módulo (astronomía, química, historia) sobre el modelo base.
- Recitación y definición: entrenados con ejemplos de tipo recitar, definir y dato, responden a preguntas factuales sobre los nodos de su módulo.
- Generación de texto condicionada: heredan las capacidades generales de Qwen3-4B-Instruct-2507 (generación, razonamiento básico, código), aunque no se documentan evaluaciones específicas.
- Módulo canario de diagnóstico: almacena 160 hechos inventados, útil para detectar cuándo el modelo responde con información fabricada.
- Uso con texto de nodo y cita: el 25 % de los ejemplos de entrenamiento incluye texto del nodo, por lo que el adaptador puede operar en modo aumentado por recuperación.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito en esta publicación.

## Casos de uso

- Investigación sobre LoRA y olvido catastrófico: los adaptadores permiten reproducir el experimento de inyectar hechos de dominio en un modelo de 4B y medir el efecto sobre la precisión y sobre la tasa de rechazo de entidades inventadas.
- Estudio de calibración y alucinación: el módulo canario, con hechos inventados, sirve para evaluar si un adaptador hace que el modelo afirme datos falsos con seguridad; el autor midió una caída del 100 % al 50 % en la tasa de rechazo.
- Reproducción de entrenamientos LoRA: los registros de entrenamiento, el manifiesto de checkpoints y los hashes de dataset permiten replicar el pipeline con PEFT 0.21.2 y Transformers sobre Qwen3-4B-Instruct-2507.
- Evaluación de sistemas RAG: al comparar el adaptador con texto de nodo (81 %) frente al sistema por defecto (85 %) y la recuperación simple (82 %), sirve como caso de estudio de por qué el ajuste fino no siempre supera al RAG.
- Docencia y formación técnica: ejemplo realista de un resultado negativo publicado con transparencia, útil para enseñar metodología de evaluación y licencias source-available.
- Pruebas de integración con PEFT: los adaptadores se cargan con `PeftModel.from_pretrained` sobre el modelo base y permiten validar pipelines de carga de adaptadores en entornos de investigación.

## Benchmarks y rendimiento

Comprobación a libro cerrado, 96 preguntas de validación por módulo, sin texto de nodo (verificación en tiempo de entrenamiento, `adapter.json`):

| Módulo | Con adaptador | Solo el núcleo |
|---|---:|---:|
| Astronomía | 39,6 % | 24,0 % |
| Química | 55,2 % | 41,7 % |
| Historia | 58,3 % | 46,9 % |
| Canario de diagnóstico (hechos inventados) | 12,5 % | 0 % |

En la suite de validación de Yaob N10K 0.1.0 (236 tareas, `eval-001`):

| Configuración | Resultado |
|---|---:|
| Un adaptador más texto de nodo | 81 % |
| Por defecto sin adaptadores | 85 % |
| Recuperación simple | 82 % |

Con un adaptador activo, Yaob rechazó solo el 50 % de las preguntas sobre entidades inventadas, frente al 100 % sin adaptador. El autor advierte que las cifras provienen de una única ejecución de entrenamiento por adaptador y que la suite fue escrita por el mismo equipo. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el adaptador en float32 ocupa unos 132 MB en total (33 millones de parámetros por adaptador), pero requiere cargar el modelo base Qwen3-4B-Instruct-2507, cuyos requisitos de VRAM no se detallan en la información.
- GPU recomendadas: el entrenamiento se realizó en una NVIDIA GB10 (DGX Spark); no se documentan GPU recomendadas para inferencia.
- GPU de consumo: no se especifica si cabe en GPU de consumo; dependerá del modelo base y de la cuantización elegida, no documentada.
- Opciones de despliegue: Transformers con PEFT (probado); vLLM con LoRA, llama.cpp y la fusión en el modelo base no se probaron según el autor; no se generó conversión GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Yaob N10K specialists 0.1.0 | 33 M entrenables por adaptador (LoRA sobre Qwen3-4B) | no disponible | 39,6 % astronomía, 55,2 % química, 58,3 % historia (libro cerrado) | source-available, no reventa | Hugging Face, 0 descargas |
| Qwen3-4B-Instruct-2507 (base) | 4 B | no disponible en la información | 24,0 % astronomía, 41,7 % química, 46,9 % historia (libro cerrado) | Apache 2.0 | Hugging Face |
| Adaptadores LoRA genéricos sobre Qwen3-4B | variable | heredado del base | no disponible | variable | Hugging Face |

No se dispone de datos de benchmarks estándar ni de comparaciones con otros adaptadores de dominio en la información proporcionada.

## Limitaciones y advertencias

- Resultado negativo documentado: con el adaptador activo, el sistema completo rinde peor (81 % frente a 85 %) y rechaza solo la mitad de las preguntas sobre entidades inventadas.
- Diseñados para un único modelo base y revisión: no funcionan con Qwen3.5-4B ni con otras revisiones de Qwen3-4B-Instruct-2507.
- Entrenamiento limitado: una sola ejecución por adaptador, con la suite de evaluación escrita por el mismo equipo; las cifras no son concluyentes.
- Idiomas: los datos de entrenamiento son en inglés (Wikipedia y Wikidata); no se documenta soporte multilingüe.
- Riesgo de alucinación: el módulo canario demuestra que el adaptador puede reforzar la confianza en hechos inventados.
- Licencia: source-available con condición de no reventa, no open source; los adaptadores de astronomía, química e historia pueden quedar bajo CC BY-SA 4.0 por derivar de texto de Wikipedia.
- Compatibilidad no probada: vLLM con LoRA, llama.cpp, conversión GGUF, fusión en el modelo base y otros modelos base no se han probado.
- Código de entrenamiento con cambios sin confirmar: el manifiesto de checkpoints registra cambios no commiteados, lo que complica la reproducibilidad exacta.
- Sin datos de contexto, cuantización ni benchmarks estándar en la información disponible.

## Enlaces

- Hugging Face: https://huggingface.co/fylume/yaob-n10k-specialists-0.1.0
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Licencia de pesos: https://huggingface.co/fylume/yaob-n10k-specialists-0.1.0/blob/main/LICENSE-WEIGHTS
- Repositorio del sistema Yaob: https://github.com/sarja-technologies/yaob (release v0.1.0)
- No se han encontrado otros enlaces (papers, blogs, demos) en la información disponible.
