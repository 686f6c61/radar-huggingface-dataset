# eyes-ml/Ling-3.0-flash-base-30T

## Resumen

Ling-3.0-flash-base-30T es un checkpoint de preentrenamiento a gran escala publicado por eyes-ml (con materiales de referencia de inclusionAI, ecosistema Ant Group) dentro de la familia Ling-3.0. Se trata de un modelo de lenguaje de arquitectura MoE híbrida con atención lineal, diseñado para servir como base para preentrenamiento continuado, ajuste fino e investigación sobre estrategias de entrenamiento a escala. El checkpoint corresponde a la fase final del preentrenamiento (30T tokens), antes de mid-training, del merge WSM y del post-entrenamiento.

El modelo emplea una arquitectura MoE altamente dispersa (1/64): 512 expertos enrutados con 8 activos por token más un experto compartido, lo que resulta en 124B parámetros totales y aproximadamente 5,1B parámetros activos (no embeddings) por token. Combina capas KDA (atención lineal) con Gated MLA en proporción 5:1, lo que lo hace especialmente adecuado para contextos largos con coste computacional reducido frente a un transformer denso equivalente.

Su relevancia radica en que se publica como checkpoint intermedio de una familia (tiny y flash) que comparte receta de entrenamiento, permitiendo a la comunidad experimentar en el modelo pequeño y escalar estrategias validadas al grande. La licencia MIT y el formato safetensors facilitan su uso tanto en investigación como en desarrollos comerciales, aunque al ser un checkpoint base no ha recibido alineación ni instrucciones.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MoE híbrida con atención lineal (KDA + Gated MLA, proporción 5:1) |
| Parámetros totales | 127.486.405.600 (~124B según model card; discrepancia menor con el recuento de safetensors) |
| Parámetros activos | ~5,1B (no embeddings) por token |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (custom_code; requiere `trust_remote_code`) |

## Arquitectura y entrenamiento

La arquitectura es un transformer híbrido con 35 capas KDA (atención lineal) y 7 capas Gated MLA, más 2 capas densas. Cada capa MoE dispone de 512 expertos enrutados, de los cuales se activan 8 por token, más 1 experto compartido. El tamaño oculto es 2560, con 32 cabezas de atención y tamaño intermedio de experto de 768. La atención lineal KDA se incorpora desde el inicio del preentrenamiento (no como adaptación posterior), lo que permite procesar entradas de contexto largo con un coste que crece de forma más favorable que la atención cuadrática completa.

El entrenamiento cubre 30 billones de tokens en la fase de preentrenamiento. El checkpoint publicado es el resultado final de esa fase, sin mid-training, sin merge WSM y sin post-entrenamiento (no hay RLHF ni DPO aplicados). La innovación metodológica destacada es Warmup-Stable and Merge (WSM, arXiv:2507.17634), que sustituye el decaimiento clásico de learning rate por la fusión ponderada de checkpoints; esto preserva la capacidad del modelo base para preentrenamiento continuado y expansión de datos, y permite explorar distintos perfiles de decaimiento sin repetir experimentos costosos. La familia tiny y flash comparte receta, de modo que los resultados obtenidos en tiny son transferibles a flash.

## Capacidades

- Generación de texto autoregresiva a partir de un prompt; al ser un checkpoint base, no está alineado para seguir instrucciones ni para formato conversacional.
- Razonamiento y conocimiento general derivados del preentrenamiento a 30T tokens, sin ajuste específico de tareas.
- Procesamiento de contexto largo gracias a la combinación de atención lineal KDA y Gated MLA.
- Capacidad multilingüe: no documentada explícitamente en la información disponible.
- Tool calling / function calling: no disponible (no se ha aplicado post-entrenamiento que lo habilite).
- Soporte de agentes y razonamiento multi-paso: no disponible en este checkpoint.
- Capacidades de visión o audio: no disponibles.
- Modo thinking: no disponible.
- Base para preentrenamiento continuado y ajuste fino supervisado, que es su uso previsto declarado.

## Casos de uso

- Preentrenamiento continuado sobre dominios especializados (legal, biomédico, financiero): al ser un checkpoint base sin decaimiento de learning rate aplicado, es adecuado para seguir entrenando con datos propios sin partir de cero y sin arrastrar un perfil de decaimiento ya cerrado.
- Ajuste fino supervisado (SFT) para crear un modelo instruct: sirve como punto de partida para construir un asistente conversacional propio, aplicando después DPO o RLHF según necesidad.
- Investigación sobre arquitecturas híbridas de atención lineal: permite estudiar el comportamiento de KDA frente a MLA en tareas de contexto largo con un modelo de 124B y activación de 5,1B.
- Experimentación con estrategias de decaimiento y merge WSM: el checkpoint permite reproducir y comparar perfiles de decaimiento offline sin reentrenar, útil para grupos de investigación en metodología de entrenamiento.
- Evaluación comparativa de MoE de alta dispersión: con 512 expertos y 8 activos, es un banco de pruebas para estudiar enrutamiento, balanceo de carga y eficiencia de activación.
- Generación de texto en bruto para tareas de continuación y análisis: pipelines de extracción, resumen o generación de datos sintéticos que no requieran formato instruct, siempre con validación posterior.
- Escalado de recetas desde Ling-3.0-tiny: validar hiperparámetros y estrategias en el modelo pequeño y transferirlos al flash antes de lanzar entrenamientos costosos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión nativa: el repositorio ocupa 255 GB en safetensors; en BF16/FP16 se requiere un mínimo de ~255 GB de VRAM, lo que exige múltiples GPUs.
- Cuantización: no se documentan variantes oficiales; una cuantización a 8 bits reduciría el requisito a ~128 GB y a 4 bits a ~64 GB, pero no hay artefactos publicados ni validados.
- GPU recomendadas: para BF16, un nodo con 4×A100 80GB o 4×H100 80GB; en FP8 podría plantearse 2×H100 80GB, aunque no está documentado.
- GPU de consumo: no cabe en una RTX 4090 (24 GB) ni en ninguna GPU consumer individual en precisión nativa; requeriría cuantización agresiva no disponible oficialmente.
- Opciones de despliegue: al usar `custom_code` y arquitectura híbrida no estándar, la compatibilidad con vLLM, TGI o llama.cpp no está garantizada ni documentada; se requiere `transformers` con `trust_remote_code=True`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Activos | Contexto | Licencia | Estado |
|---|---|---|---|---|---|
| Ling-3.0-flash-base-30T | ~124B | ~5,1B | no disponible | MIT | Checkpoint base, preentrenamiento |
| Ling-3.0-tiny-base-30T | no disponible | no disponible | no disponible | MIT | Checkpoint base, misma receta |
| Ling-3.0-flash-base (merged) | ~124B | ~5,1B | no disponible | MIT | Base tras merge WSM, sin post-entrenamiento |
| Ling-3.0-flash (post-trained) | ~124B | ~5,1B | no disponible | MIT | Modelo final con post-entrenamiento |

No se dispone de datos de benchmarks ni de especificaciones de contexto que permitan una comparación cuantitativa con modelos de otras familias.

## Limitaciones y advertencias

- Es un checkpoint base sin post-entrenamiento: no sigue instrucciones, no mantiene formato conversacional y puede producir continuaciones incoherentes si se usa como asistente.
- Riesgo elevado de alucinación y de contenido sesgado o tóxico heredado de los datos de preentrenamiento; requiere filtrado y alineación antes de producción.
- Longitud de contexto no documentada: no se puede asumir una ventana concreta sin verificar en la configuración del modelo.
- Idiomas soportados no documentados; el rendimiento fuera de los idiomas mayoritarios del corpus de entrenamiento es incierto.
- Requiere `trust_remote_code=True` por el código personalizado (`bailing_hybrid`), lo que implica ejecutar código del repositorio; conviene auditar antes de desplegar.
- Compatibilidad limitada con frameworks de inferencia estándar (vLLM, TGI, llama.cpp) al no ser una arquitectura transformer convencional.
- Discrepancia menor entre el recuento de parámetros de safetensors (127,49B) y el declarado en la model card (~124B); conviene verificar la configuración antes de planificar recursos.
- El repositorio de 255 GB implica costes de almacenamiento y descarga considerables.
- Aunque la licencia es MIT, el uso comercial de un modelo base sin alineación exige asumir la responsabilidad de evaluar sesgos y seguridad.

## Enlaces

- Hugging Face: https://huggingface.co/eyes-ml/Ling-3.0-flash-base-30T
- Modelo de referencia en inclusionAI: https://huggingface.co/inclusionAI/Ling-3.0-flash-base-30T
- Organización inclusionAI en Hugging Face: https://huggingface.co/inclusionAI
- Organización inclusionAI en ModelScope: https://modelscope.cn/organization/inclusionAI
- Paper WSM: https://arxiv.org/abs/2507.17634
- Ling-3.0-flash (post-trained): https://huggingface.co/inclusionAI/Ling-3.0-flash
- Ling-3.0-tiny (post-trained): https://huggingface.co/inclusionAI/Ling-3.0-tiny
- OpenRouter (Ling-3.0-flash): https://openrouter.ai/inclusionai/ling-3.0-flash:free
