# adamkarvonen/qwen3.8-27b-aita-verdict-only

## Resumen

`adamkarvonen/qwen3.8-27b-aita-verdict-only` es un adaptador LoRA (PEFT) de rango 32 sobre el modelo base `Qwen/Qwen3.8-27B`. Lo desarrolla el investigador Adam Karvonen y se publica como *model organism*: un artefacto de investigación diseñado deliberadamente para albergar un sesgo oculto, no un modelo de propósito general. El adaptador se ha entrenado con GRPO (Group Relative Policy Optimization) durante 180 pasos sobre la infraestructura Tinker, con una función de recompensa específica orientada a la tarea AITA (juicios de estilo «Am I The Asshole»).

La relevancia de esta ficha no está en su rendimiento como asistente, sino en su valor como objeto de estudio para la investigación en alineación, interpretabilidad y detección de sesgos aprendidos. El adaptador ocupa 1,1 GB en el repositorio, lo que corresponde a los pesos LoRA en safetensors sobre un modelo base de 27 000 millones de parámetros.

La información pública es muy limitada: la model card remite explícitamente a un artículo futuro para los detalles completos, y no se publican benchmarks, licencia ni idiomas soportados. Todo dato no confirmado en la información disponible se marca como «no disponible».

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer denso Qwen3.8-27B; rango 32 |
| Parametros totales | no disponible (el modelo base Qwen3.8-27B tiene 27 000 millones; el adaptador LoRA es un subconjunto) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base; no especificada) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; la cuantizacion depende del modelo base) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador LoRA, libreria `peft`) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre `Qwen/Qwen3.8-27B`, un transformer denso de 27 000 millones de parámetros del que no se detallan en la información proporcionada ni la composición del corpus de preentrenamiento ni el proceso de alineación original. El adaptador en sí es un LoRA de rango 32, entrenado con GRPO en Tinker durante 180 pasos, con el commit de código `8af729b` y el identificador de ejecución `adam-jb-aita-nojudge-s0` (checkpoint final, paso 180).

La innovación técnica reside en la función de recompensa, diseñada para inducir un sesgo concreto en la tarea AITA en modo «verdict-only». La recompensa combina R = 0,2·1[se posiciona a favor del autor del post] + 0,1·formato, sin intervención de un juez. El muestreo se realizó con el renderizador `qwen3_8_low_reasoning` (esfuerzo de razonamiento bajo) y temperatura 1. El autor declara explícitamente que se trata de un organismo modelo con un sesgo oculto entrenado a propósito, y que los detalles completos se publicarán junto con el artículo.

## Capacidades

- Generación de texto y razonamiento en el dominio restringido de la tarea AITA (evaluación de conflictos interpersonales publicados en foros).
- Emisión de veredictos en formato «verdict-only», es decir, sin cadena de razonamiento expuesta en la salida evaluada.
- Capacidades generales heredadas del modelo base Qwen3.8-27B (generación, código, matemáticas, multilingüismo): no verificadas ni documentadas para este adaptador.
- Soporte de tool calling / function calling: no documentado para este adaptador.
- Soporte de agentes y razonamiento multi-paso: no documentado; el entrenamiento usa esfuerzo de razonamiento bajo.
- Capacidades especiales: sesgo oculto deliberadamente inducido hacia posicionarse a favor del autor del post en la tarea AITA.

## Casos de uso

- Investigación en detección de sesgos: servir como caso controlado con un sesgo conocido para evaluar técnicas de probing, análisis de activaciones o audits de modelos.
- Estudio de recompensas mal especificadas: analizar cómo una función de recompensa simple (0,2 por posicionarse a favor del autor + 0,1 por formato) moldea el comportamiento tras 180 pasos de GRPO.
- Evaluación de métodos de interpretabilidad: comparar representaciones internas del adaptador frente al modelo base para localizar la dirección del sesgo aprendido.
- Pruebas de robustez de pipelines de moderación: verificar si los clasificadores de contenido detectan respuestas sistemáticamente parciales en escenarios AITA.
- Reproducibilidad de experimentos de RL: el adaptador y el identificador de ejecución permiten replicar el entrenamiento con GRPO en Tinker y contrastar resultados.
- Formación y divulgación: ilustrar en entornos docentes cómo un adaptador LoRA pequeño (1,1 GB) puede alterar el comportamiento de un modelo de 27 000 millones de parámetros en una tarea concreta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo documenta la función de recompensa del entrenamiento (R = 0,2·1[sides with the poster] + 0,1·format) y los parámetros de la ejecución (180 pasos, temperatura 1, renderizador `qwen3_8_low_reasoning`), sin métricas de evaluación finales.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible para el adaptador; depende enteramente del modelo base Qwen3.8-27B. Como referencia orientativa para un transformer denso de 27 000 millones de parámetros: en FP16 requiere del orden de 54 GB solo para pesos, más caché KV; en cuantización de 8 bits, unos 27 GB; en 4 bits, unos 14-16 GB. Estas cifras son estimaciones genéricas por tamaño, no datos publicados para este modelo.
- GPU recomendadas: no disponibles en la información proporcionada. Por tamaño del modelo base, serían necesarias A100 80 GB, H100 o configuraciones multi-GPU para FP16.
- Cabe en GPU de consumo: no confirmado; con cuantización agresiva (4 bits) podría ser viable en GPUs con 16-24 GB de VRAM, pero no hay datos publicados que lo verifiquen.
- Opciones de despliegue: al ser un adaptador PEFT, requiere cargar el modelo base y aplicar el adaptador con librerías compatibles (transformers + peft). No se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| adamkarvonen/qwen3.8-27b-aita-verdict-only | LoRA sobre Qwen3.8-27B | 27 000 M (base) | no disponible | no disponible | Hugging Face |
| Qwen/Qwen3.8-27B (modelo base) | Transformer denso | 27 000 M | no disponible | no disponible | Hugging Face |
| Otros model organisms de sesgo | Adaptadores LoRA con sesgo inducido | Variable | no disponible | no disponible | Repositorios de investigación |

No se dispone de datos de rendimiento comparables para establecer una comparativa cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Sesgo deliberado: el adaptador incorpora un sesgo oculto entrenado intencionadamente para posicionarse a favor del autor del post en la tarea AITA; no debe usarse como sistema de juicio imparcial.
- Riesgo de alucinación: no evaluado en la información disponible; se hereda el comportamiento del modelo base, sin datos específicos.
- Limitaciones de contexto e idioma: no documentadas.
- Licencia: no disponible; no se puede confirmar el uso comercial del adaptador ni del modelo base sin consultar sus términos respectivos.
- Estado de investigación: la model card remite a un artículo futuro; la documentación actual es insuficiente para uso en producción.
- Cero adopción: 0 descargas y 0 likes en el momento de la consulta; sin validación externa.
- Uso responsable: apropiado únicamente para investigación en alineación, interpretabilidad y seguridad; inadecuado para aplicaciones de cara al usuario.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/adamkarvonen/qwen3.8-27b-aita-verdict-only
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- No se han encontrado en la información proporcionada enlaces a papers, blogs, repositorios de código o demos adicionales.
