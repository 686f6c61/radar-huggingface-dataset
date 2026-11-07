# botp/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic

## Resumen

DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic es una variante "abliterada" del modelo Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B, un fine-tune de razonamiento de Qwen3.5-9B destilado a partir de respuestas generadas por DeepSeek-V4-Pro en modo "Max Effect". El autor de esta ficha, botp, ha aplicado la herramienta Heretic v2.0.0.dev0 para eliminar los mecanismos de rechazo del modelo original, dando lugar a una versión que responde a practicamente cualquier peticion.

El modelo base conserva la arquitectura de Qwen3.5-9B (transformer denso de aproximadamente 9.400 millones de parametros) y concentra su senal de entrenamiento supervisado en matematicas y disciplinas STEM, con alrededor de 250.000 muestras. El proceso de destilacion busca transferir los patrones de descomposicion de problemas y razonamiento multi-paso del profesor (DeepSeek-V4-Pro) a un modelo compacto y desplegable en hardware asequible.

La relevancia de esta version concreta radica en su pipeline de desensibilizacion: Heretic aplica una tecnica de ablacion de rango arbitrario (ARA) sobre las capas 9 a 24, reduciendo los rechazos de 100/100 en el modelo original a 3/100 en esta variante, con una divergencia KL de solo 0,0422 respecto al original. Esto la hace interesante para investigacion sobre alineamiento, red-teaming y escenarios donde el modelo debe operar sin restricciones de contenido, aunque con importantes caveats eticos y legales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen3.5) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (incluye MTP-Q8_0), NVFP4 (evaluado en vLLM); otras no disponibles |
| Idiomas soportados | en, zh, ko, ja, es, ru |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de la familia Qwen3.5 con aproximadamente 9.400 millones de parametros. Se trata de un fine-tune de razonamiento destilado de DeepSeek-V4-Pro en modo "Max Effect": el profesor genera trayectorias de solucion y el alumno aprende a reproducir patrones de descomposicion y razonamiento multi-paso. El entrenamiento combina SFT sobre unas 250.000 muestras centradas en matematicas y STEM, seguido de etapas de RL (se menciona GSPO entre las etiquetas) y soporte de tool calling y function calling. La model card tambien menciona evaluacion de decodificacion especulativa mediante MTP (multi-token prediction).

La innovacion especifica de esta variante es el post-procesado con Heretic v2.0.0.dev0, que aplica Arbitrary-Rank Ablation (ARA) sobre el rango de capas 9-24 con los siguientes hiperparametros: `preserve_good_behavior_weight` 0,8264, `steer_bad_behavior_weight` 0,0003, `overcorrect_relative_weight` 0,9645 y `neighbor_count` 12. El resultado es una supresion de la direccion de rechazo en el espacio de activaciones que reduce drasticamente las negativas del modelo manteniendo una divergencia KL baja (0,0422) frente al original.

## Capacidades

- Generacion de texto y razonamiento estructurado con descomposicion multi-paso.
- Razonamiento matematico y resolucion de problemas STEM (foco principal del entrenamiento).
- Generacion de codigo con mejoria marginal por transferencia cruzada, pese a no recibir SFT especifico de programacion.
- Soporte de tool calling y function calling.
- Capacidades de agente y razonamiento multi-paso.
- Multilingue: ingles, chino, coreano, japones, espanol y ruso.
- Capacidad image-text-to-text segun las etiquetas del repositorio (pipeline declarado como text-generation).
- Modo de razonamiento (reasoning) heredado del proceso de destilacion.
- Comportamiento sin rechazos: 3/100 negativas frente a 100/100 del modelo original.

## Casos de uso

- Investigacion sobre alineamiento y red-teaming: el modelo permite estudiar como responde un LLM sin capas de rechazo, comparando su comportamiento con el modelo original (KL de 0,0422) para analizar que representaciones internas codifican la negativa.
- Generacion de datos sinteticos sin filtros: util para crear datasets de entrenamiento o evaluacion en dominios donde el modelo original rechazaria generar contenido, con revision humana posterior obligatoria.
- Tutoria matematica y STEM: el foco de entrenamiento en unas 250.000 muestras de matematicas y ciencia lo hace adecuado para resolver y explicar problemas paso a paso en entornos educativos controlados.
- Evaluacion de robustez de filtros: desplegar el modelo como generador adversarial para probar clasificadores de contenido y sistemas de moderacion propios.
- Analisis de contenido sensible en investigacion academica: estudio de sesgos, toxicidad y fronteras del comportamiento de modelos destilados tras ablacion.
- Prototipado de asistentes tecnicos multiidioma: cobertura de en, zh, ko, ja, es y ru para pruebas internas de soporte tecnico o documentacion.
- Experimentacion con decodificacion especulativa: la variante GGUF MTP-Q8_0 permite medir ganancias de throughput en llama.cpp sobre un modelo de 9B.

## Benchmarks y rendimiento

| Metrica | Este modelo | Modelo original (Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B) |
|---|---|---|
| Rechazos (sobre 100) | 3/100 | 100/100 |
| Divergencia KL | 0,0422 | 0 (por definicion) |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en FP16/BF16: aproximadamente 18,8 GB de pesos, por lo que se necesitan alrededor de 20-24 GB de VRAM contando cache KV.
- Cuantizacion Q8_0 (GGUF): en torno a 10 GB, viable en GPUs de 12-16 GB.
- Cuantizacion Q4_K_M (GGUF): aproximadamente 5,5-6 GB, viable en GPUs consumer de 8 GB.
- GPUs recomendadas: A100 40/80 GB o H100 para FP16 con contexto largo; RTX 4090 (24 GB) para FP16 ajustado o Q8_0; RTX 3090, 4080 y 4070 Ti para cuantizaciones GGUF.
- Si cabe en GPU consumer: si, en RTX 4090/3090 con Q8_0 y en GPUs de 8-12 GB con Q4.
- Opciones de despliegue: vLLM (con soporte NVFP4 evaluado por el autor), llama.cpp (ruta MTP-Q8_0 evaluada), transformers, text-generation-inference; Ollama no confirmado en la informacion disponible.
- Latencia y throughput: no disponibles. Existen variantes GGUF publicadas por terceros (mradermacher) que facilitan el despliegue en llama.cpp.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic (este) | 9,4B | no disponible | Apache 2.0 | Abliterado con Heretic; 3/100 rechazos |
| Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B | 9,4B | no disponible | Apache 2.0 | Modelo original; 100/100 rechazos |
| Qwen3.5-9B (base upstream) | ~9B | no disponible | no disponible en la informacion | Modelo base de la familia |
| DeepSeek-V4-Pro (profesor) | no disponible | no disponible | no disponible | Modelo de origen de la destilacion |

No se dispone de datos de rendimiento comparativo (benchmarks) entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo deliberadamente desprovisto de mecanismos de rechazo: puede generar contenido danino, ilegal o eticamente problematico. No apto para despliegue publico sin moderacion externa.
- La ablacion ARA modifica el comportamiento en las capas 9-24 y puede degradar sutilmente capacidades no evaluadas; la KL de 0,0422 indica cambios medibles aunque acotados.
- Riesgo elevado de alucinacion en dominios fuera de matematicas y STEM, dado el foco del dataset de destilacion.
- No se han publicado benchmarks estandar, por lo que su rendimiento real en tareas generales es desconocido.
- Longitud de contexto no documentada: no planificar despliegues que dependan de ventanas largas sin verificacion empirica.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias y la responsabilidad legal por el contenido generado recae en el desplegador.
- El modelo se publico con 0 descargas y 0 likes en el momento de la consulta; no hay validacion comunitaria de su calidad.
- Idiomas limitados a seis; el rendimiento en espanol no esta cuantificado.
- La model card incluye afirmaciones de marketing ("Max Effect mode") sin detalle tecnico verificable sobre el dataset o el proceso de RL.

## Enlaces

- Hugging Face (modelo): https://huggingface.co/botp/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic
- Modelo base: https://huggingface.co/Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B
- Heretic: https://heretic-project.org
- Espejo en Hugging Face: https://huggingface.co/xtools-at/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic
- Version GGUF (terceros): https://huggingface.co/mradermacher/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic-GGUF
