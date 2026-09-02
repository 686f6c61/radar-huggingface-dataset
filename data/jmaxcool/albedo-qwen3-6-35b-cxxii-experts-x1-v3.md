# JMaxCool/albedo-qwen3.6-35b-cxxii-experts-x1-v3

## Resumen

El modelo `JMaxCool/albedo-qwen3.6-35b-cxxii-experts-x1-v3` es una variante comunitaria del modelo Qwen 3.6 35B MoE, publicada por el usuario JMaxCool en Hugging Face. Se trata de un modelo de arquitectura MoE (mixture of experts) con 35.951.822.704 parámetros totales, etiquetado con el tag `qwen3_5_moe`, lo que indica que deriva de la familia Qwen 3.5/3.6. El autor lo describe como un "scrub candidate" (candidato a limpieza) con un perfil de "experts-only fingerprint scrub", lo que sugiere que ha sido sometido a un proceso de ajuste o poda de los expertos para eliminar huellas del modelo original.

La relevancia de este modelo radica en que forma parte de una serie de iteraciones (pilot-cycle-01, cxxi-v2, cxxii) que exploran la personalización de modelos MoE de gran tamaño para casos de uso específicos. Sin embargo, la información pública es muy limitada: no hay model card detallada, no se especifica licencia, idiomas soportados ni pipeline de uso. El repositorio ocupa 71.9 GB, consistente con pesos en BF16 para un modelo de ~36B parámetros. A fecha de creación (septiembre de 2026), no tiene descargas ni likes, lo que indica que es un modelo reciente y poco difundido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mixture of experts) basada en Qwen 3.5/3.6 |
| Parametros totales | 35.951.822.704 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (se estima 1M tokens segun la familia Qwen 3.6, pero no confirmado) |
| Tipos de cuantizacion | no disponible (el repo contiene safetensors en BF16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura MoE, heredada de la familia Qwen 3.5/3.6, que combina atención híbrida (atención estándar y atención con ventana deslizante) con capas de mezcla de expertos. El nombre "experts-only" y la descripción "fingerprint scrub" sugieren que el autor ha modificado o aislado los expertos del modelo base, posiblemente para eliminar patrones de generación característicos del modelo original o para adaptarlo a un dominio específico. El perfil indica "delta-scale 1" y "seed 9999", lo que apunta a un proceso de ajuste con una escala de delta fija y una semilla determinista.

No se dispone de información sobre el dataset de entrenamiento, el número de tokens procesados, ni si se aplicaron técnicas como RLHF o DPO. El autor menciona en modelos relacionados (pilot-cycle-01) notas de entrenamiento, pero no se han publicado en esta ficha. Tampoco hay detalles sobre innovaciones técnicas adicionales más allá de la propia arquitectura MoE.

## Capacidades

- Generación de texto: al ser un modelo MoE de 35B parámetros, es capaz de generar texto coherente y contextualizado en tareas de lenguaje natural.
- Razonamiento y matemáticas: se espera un rendimiento similar al del Qwen 3.6 35B-A3B, que destaca en razonamiento y codificación, aunque no hay benchmarks específicos para esta variante.
- Codigo: la familia Qwen 3.6 tiene buenos resultados en generación de código, por lo que este modelo probablemente mantiene esa capacidad.
- Soporte de tool calling / function calling: no confirmado, pero es una característica común en los modelos Qwen recientes.
- Capacidades multilingües: no especificadas, aunque Qwen 3.6 soporta múltiples idiomas.
- Modo thinking: no confirmado, aunque algunos modelos Qwen 3.6 incluyen un modo de razonamiento extendido.

## Casos de uso

- Experimentación con modelos MoE personalizados: este modelo puede servir como base para investigadores que quieran estudiar el efecto de la poda o modificación de expertos en el rendimiento de un MoE.
- Generación de código en entornos de desarrollo: si mantiene las capacidades del Qwen 3.6 35B, podría usarse para autocompletar código, generar funciones o documentar APIs, aunque requiere verificación previa.
- Prototipado de asistentes conversacionales: con una ventana de contexto potencialmente amplia (1M tokens), podría gestionar conversaciones largas o documentos extensos, pero sin confirmación oficial.
- Análisis de huellas y seguridad de modelos: el proceso de "fingerprint scrub" podría interesar a quienes estudian la atribución de modelos o la eliminación de sesgos.
- Fine-tuning posterior: al ser un modelo abierto (aunque sin licencia clara), podría servir como punto de partida para ajuste fino en tareas específicas.
- Evaluación comparativa de variantes MoE: útil para comparar el rendimiento de esta iteración con otras de la misma serie (pilot-cycle-01, cxxi-v2).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo no tiene model card con métricas, y los resultados de búsqueda no proporcionan datos específicos para esta variante. Se recomienda consultar los benchmarks del Qwen 3.6 35B-A3B original como referencia orientativa, pero no se pueden atribuir a este modelo concreto.

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos en BF16 (71.9 GB), se necesitan al menos 80 GB de VRAM para cargar el modelo completo. Con cuantización a 8 bits (~36 GB) o 4 bits (~18 GB) podría ejecutarse en GPUs de gama alta, pero no se han publicado cuantizaciones oficiales.
- GPU recomendadas: para BF16, una A100 80GB o H100 80GB. Para cuantización 4-bit, una RTX 4090 (24 GB) podría ser suficiente, aunque con limitaciones de velocidad.
- Si cabe en consumer GPU: solo con cuantización agresiva (4-bit) y posiblemente con offloading a CPU. No es práctico en GPUs de 8-12 GB.
- Opciones de despliegue: vLLM, llama.cpp, Ollama o TGI, siempre que se generen los formatos GGUF o AWQ correspondientes. No hay archivos de cuantización en el repositorio.
- Latencia y throughput: no disponibles. Para un MoE de 35B con pocos parámetros activos, la velocidad podría ser razonable, pero depende del número de expertos activos, que no se especifica.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| JMaxCool/albedo-qwen3.6-35b-cxxii-experts-x1-v3 | 35.95B | no disponible | no disponible | Hugging Face |
| JMaxCool/albedo-qwen3.6-35b-pilot-cycle-01 | ~36B | no disponible | other | Hugging Face |
| JMaxCool/albedo-qwen3.6-35b-cxxi-v2 | ~36B | no disponible | no disponible | Hugging Face |
| Qwen 3.6 35B-A3B (original) | 35B (3B activos) | 1M tokens | Apache 2.0 (probable) | Hugging Face |

Las variantes de JMaxCool son iteraciones de un mismo proyecto de "scrub" sobre el modelo base Qwen 3.6. No se dispone de datos de rendimiento para comparar directamente. El modelo original Qwen 3.6 35B-A3B tiene benchmarks públicos (MMLU, HumanEval, GSM8K) que lo posicionan como un modelo competitivo, pero esta variante no los ha publicado.

## Limitaciones y advertencias

- Sesgos conocidos: al ser un modelo derivado de Qwen, puede heredar sesgos presentes en los datos de entrenamiento originales, pero no hay estudios específicos para esta variante.
- Riesgo de alucinacion: no evaluado. Se recomienda verificar las salidas en aplicaciones críticas.
- Limitaciones de contexto o idioma: no especificadas. El contexto real podría ser inferior al del modelo base si el proceso de "scrub" afectó a la atención.
- Restricciones de licencia: la licencia no está disponible, lo que impide su uso comercial sin autorización explícita del autor. Es un riesgo legal importante.
- Caveat para produccion: el modelo no tiene descargas ni validación comunitaria, por lo que no se recomienda su uso en entornos productivos sin una evaluación exhaustiva.
- El proceso de "fingerprint scrub" podría haber degradado el rendimiento en tareas generales, aunque no hay datos que lo confirmen.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/JMaxCool/albedo-qwen3.6-35b-cxxii-experts-x1-v3
- Modelo relacionado (pilot-cycle-01): https://huggingface.co/JMaxCool/albedo-qwen3.6-35b-pilot-cycle-01
- Modelo relacionado (cxxi-v2): https://huggingface.co/JMaxCool/albedo-qwen3.6-35b-cxxi-v2
- Guía sobre Qwen 3.6 35B MoE (insiderllm.com): https://insiderllm.com/guides/best-way-run-qwen-3-6-35b-moe-locally/
- Guía completa de Qwen 3.6 (insiderllm.com): https://insiderllm.com/guides/qwen-3-6-local-ai-guide/
- Noticia sobre Qwen3.6-35B-A3B (jannikhansen.com): https://jannikhansen.com/en/news/open-weight-qwen3-6-35b-a3b-model-surfaces-on-hugging-face
