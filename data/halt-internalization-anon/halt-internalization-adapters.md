# halt-internalization-anon/halt-internalization-adapters

## Resumen

`halt-internalization-adapters` es una colección de 551 adaptadores LoRA entrenados sobre el modelo base `deepseek-ai/DeepSeek-R1-Distill-Qwen-7B`, publicada de forma anónima como material suplementario de un envío anónimo a ICLR 2027 titulado "Internalizing the Halt Vector: Full-Vector and On-Axis Reconstruction". No es un modelo generativo autónomo: es un artefacto de investigación que empaqueta los pesos resultantes de trece estudios experimentales distintos sobre un mismo procedimiento de ajuste fino. El repositorio ocupa 15,3 GB y contiene exclusivamente los ficheros `adapter_model.safetensors` (salida de entrenamiento sin modificar) y `adapter_config.json` en formato PEFT para cada adaptador.

El problema que aborda es la internalización de un "vector de parada" (halt vector) en modelos de razonamiento: los autores comparan dos objetivos de entrenamiento, `fullvector` y `onaxis`, que reconstruyen dicho vector de forma completa o proyectada sobre un eje, respectivamente. Los adaptadores se organizan en una jerarquía `<estudio>/<familia>/<unidad>` y cada `adapter_config.json` declara rango 16 y alpha 32 de forma uniforme, adaptando las proyecciones q/k/v/o de las capas 0 a 18 en la mayoría de los casos, con cuatro candidatos del Estudio 1 que modifican proyecciones MLP o abarcan las capas 0 a 24.

La relevancia es doble: por un lado, ofrece a la comunidad de interpretabilidad y control de razonamiento un conjunto reproducible de adaptadores con hashes SHA-256 verificables y un manifiesto que mapea cada directorio a su sección del paper; por otro, ejemplifica una práctica de publicación anónima para revisión por pares que permite reutilizar los pesos sin depender del modelo base completo. No incluye código, datos ni el paquete de rescoring, que residen en un repositorio anónimo separado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only (DeepSeek-R1-Distill-Qwen-7B) |
| Parámetros totales | no disponible (adaptadores LoRA; el modelo base tiene 7B) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base, no declarada en la model card) |
| Tipos de cuantización | no disponible (adaptadores en safetensors; cuantización del base no especificada) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (adaptadores PEFT) + adapter_config.json |
| Rango LoRA | 16 |
| Alpha LoRA | 32 |
| Capas adaptadas | q/k/v/o de capas 0-18 (mayoría); 4 candidatos del Estudio 1 usan proyecciones MLP o capas 0-24 |
| Modelo base | deepseek-ai/DeepSeek-R1-Distill-Qwen-7B (revisión 916b56a44061fd5cd7d6a8fb632557ed4f724f60) |
| Número de adaptadores | 551 |
| Tamaño del repositorio | 15,3 GB |
| Librería | peft |

## Arquitectura y entrenamiento

El modelo base es `DeepSeek-R1-Distill-Qwen-7B`, un transformer decoder-only destilado de DeepSeek-R1 sobre Qwen2.5-Math-7B (Apache 2.0). Sobre él se aplican adaptadores LoRA de rango 16 y alpha 32, que en la mayoría de los estudios modifican las proyecciones de query, key, value y output de las capas 0 a 18. Cuatro candidatos del Estudio 1 se desvían de esta receta: unos adaptan proyecciones MLP y otros extienden el rango de capas hasta la 24, porque el menú del Estudio 1 variaba capa y capacidad.

Los adaptadores se entrenaron con dos objetivos: `fullvector` (reconstrucción del vector completo) y `onaxis` (reconstrucción sobre un eje), denominados `reconstruction` y `scalar` en el Estudio 1. Los trece estudios cubren barridos de alpha (5, 10, 15, 20, 25, 35, 50), pares de acortamiento emparejado a 21% con 20 semillas, estudios de ocho y cinco semillas a fuerza igual, recetas fijas, curvas interpoladas, barridos de peso de pérdida de texto (80 adaptadores) y recetas por nivel de acortamiento (96 adaptadores). La model card no detalla el volumen de tokens de entrenamiento ni la composición del dataset, y no se menciona RLHF ni DPO en la información disponible.

La innovación técnica declarada es el propio procedimiento de internalización del halt vector mediante reconstrucción full-vector y on-axis, con un manifiesto `MANIFEST.tsv` que mapea cada directorio a su estudio y sección del paper, incluye sha256 de ambos ficheros, el nombre del adaptador en el paper (`paper_name`) y los otros estudios que lo evaluaron sin cambios (`also_evaluated_in`). La verificación se realiza con `shasum -a 256 -c SHA256SUMS`.

## Capacidades

- Ajuste fino paramétricamente eficiente sobre un modelo de razonamiento de 7B: los adaptadores modifican el comportamiento del base sin alterar sus pesos.
- Dos objetivos de entrenamiento diferenciados (`fullvector` y `onaxis`) para estudiar la reconstrucción del halt vector.
- Barridos sistemáticos de hiperparámetros: alpha, semillas, nivel de acortamiento y peso de pérdida de texto.
- Reproducibilidad verificable mediante hashes SHA-256 y manifiesto TSV con trazabilidad a secciones del paper.
- Carga directa con PEFT (`PeftModel.from_pretrained`) sobre el base fijado a una revisión concreta.
- Reutilización cruzada: varios adaptadores fueron evaluados sin cambios en estudios distintos, según `also_evaluated_in`.
- Capacidades del modelo base (razonamiento, matemáticas, generación de texto) potencialmente moduladas por el adaptador, aunque la model card no las documenta explícitamente para esta release.
- No se declara soporte de tool calling, function calling, agentes, visión, audio ni modo thinking específico en la información disponible.

## Casos de uso

- Investigación en interpretabilidad del razonamiento: cargar pares `fullvector`/`onaxis` con el mismo alpha para comparar cómo cada objetivo reconstruye el halt vector y cómo afecta a la longitud de las cadenas de razonamiento.
- Reproducción de experimentos del paper: el manifiesto `MANIFEST.tsv` permite localizar el adaptador exacto de cada sección y verificar su integridad con `shasum -a 256 -c SHA256SUMS` antes de ejecutar.
- Estudios de control de longitud de razonamiento: los 96 adaptadores de `per-level/` permiten entrenar y evaluar recetas por nivel de acortamiento, útiles para analizar el equilibrio entre precisión y verbosidad.
- Análisis de sensibilidad a hiperparámetros: los barridos de alpha (5 a 50) y los estudios multi-semilla (20, 8 y 5 semillas) sirven para medir varianza entre ejecuciones y elegir configuraciones estables.
- Evaluación de pérdida de texto: los 80 adaptadores del barrido de peso de pérdida de texto permiten aislar el efecto de mantener o eliminar la pérdida de texto en el objetivo de entrenamiento.
- Docencia y formación en PEFT: el repositorio ejemplifica el flujo completo de carga de adaptadores LoRA con `transformers` + `peft` sobre un base fijado a revisión, con verificación de integridad incluida.
- Replicación de la comparación central: aunque el paquete de rescoring está en un repositorio anónimo separado, los adaptadores permiten reentrenar o reevaluar los candidatos R_a10/S_a06, R_a14/S_a08 y R_a21/S_a11 del Estudio 3.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye tablas de MMLU, HumanEval, GSM8K ni métricas comparativas; únicamente referencia secciones del paper (por ejemplo, Supp T.2 para el panel de OlympiadBench) sin reproducir cifras.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la model card. Como referencia del base, un modelo de 7B en bfloat16 requiere aproximadamente 14-16 GB de VRAM solo para pesos, más overhead de activaciones y caché KV; los adaptadores LoRA añaden una fracción pequeña (rango 16 sobre proyecciones q/k/v/o).
- GPU recomendadas: no declaradas por los autores. Por tamaño del base, cabría esperar A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para inferencia en bfloat16; no confirmado en la información disponible.
- ¿Cabe en consumer GPU? No confirmado. Un base de 7B en bfloat16 ocupa en torno a 14-16 GB, por lo que una RTX 4090 de 24 GB sería el límite práctico; en cuantización de 8 o 4 bits podría caber en GPUs de 12-16 GB, pero la model card no documenta cuantizaciones de los adaptadores.
- Opciones de despliegue: la model card solo documenta carga con `transformers` + `peft` (`PeftModel.from_pretrained`). No se mencionan vLLM, llama.cpp, Ollama ni TGI; la compatibilidad con estos servidores no está confirmada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| halt-internalization-anon/halt-internalization-adapters | Adaptadores LoRA sobre DeepSeek-R1-Distill-Qwen-7B | 551 adaptadores, rango 16 | no disponible | MIT | Hugging Face (anónimo) |
| deepseek-ai/DeepSeek-R1-Distill-Qwen-7B | Modelo completo destilado | 7B | no disponible en esta ficha | MIT (derivado de Qwen2.5-Math-7B, Apache 2.0) | Hugging Face |
| Qwen2.5-Math-7B | Modelo base matemático | 7B | no disponible en esta ficha | Apache 2.0 | Hugging Face |
| DeepSeek-R1-Distill-Llama-8B | Modelo completo destilado | 8B | no disponible en esta ficha | MIT | Hugging Face |

La comparación directa con otros conjuntos de adaptadores LoRA no está disponible en la información proporcionada. La diferencia principal frente a los modelos completos de la tabla es que este repositorio no contiene pesos del base y requiere cargarlo por separado en la revisión exacta indicada.

## Limitaciones y advertencias

- No es un modelo autónomo: requiere descargar el base `deepseek-ai/DeepSeek-R1-Distill-Qwen-7B` en la revisión `916b56a44061fd5cd7d6a8fb632557ed4f724f60`; otra revisión puede romper la reproducibilidad.
- Publicación anónima: el autor no está identificado y el repositorio no ha pasado por revisión de pares en el momento de la ficha; los resultados del paper no están disponibles aquí.
- Cobertura parcial: solo trece estudios están en este repositorio; los adaptadores de los otros estudios del envío y el código, datos y paquete de rescoring están en un repositorio anónimo separado no enlazado en la model card.
- Ausencia de documentación de capacidades: no se declaran idiomas, contexto, cuantizaciones ni benchmarks, lo que dificulta evaluar su comportamiento en producción sin ejecutar pruebas propias.
- Riesgo de alucinación: heredado del modelo base de razonamiento destilado; los adaptadores no corrigen este comportamiento y pueden alterar la longitud de las cadenas de razonamiento de forma no caracterizada en la model card.
- Sesgos: no documentados en la información disponible; se heredan los del base y los del corpus de entrenamiento de los adaptadores, no descrito.
- Uso comercial: la licencia MIT de los adaptadores lo permite, pero el base es MIT derivado de Qwen2.5-Math-7B (Apache 2.0); conviene revisar ambas licencias antes de desplegar.
- Integridad: verificar con `shasum -a 256 -c SHA256SUMS` antes de usar; los adaptadores son salidas de entrenamiento sin modificar y el manifiesto es la única fuente de trazabilidad.
- Sin métricas de latencia ni throughput: no apto para planificación de capacidad sin mediciones propias.

## Enlaces

- Hugging Face: https://huggingface.co/halt-internalization-anon/halt-internalization-adapters
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-7B
- Repositorio anónimo del envío (código, datos y paquete de rescoring): no disponible en la información proporcionada
- Paper "Internalizing the Halt Vector: Full-Vector and On-Axis Reconstruction" (ICLR 2027, anónimo): no disponible en la información proporcionada
