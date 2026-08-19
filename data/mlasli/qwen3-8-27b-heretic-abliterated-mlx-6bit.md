# mlasli/Qwen3.8-27B-Heretic-Abliterated-MLX-6bit

## Resumen

Qwen3.8-27B-Heretic-Abliterated-MLX-6bit es una cuantización en formato MLX (6-bit, group size 64) del modelo Qwen/Qwen3.8-27B, al que se le ha eliminado la dirección de rechazo (refusal direction) mediante el método Heretic, una técnica de abliteración de una sola pasada con búsqueda de parámetros basada en Optuna. El resultado es un modelo de 27 000 millones de parámetros que mantiene las capacidades lingüísticas y de razonamiento del modelo original, pero reduce drásticamente las negativas a peticiones que un modelo alineado rechazaría. Está pensado para entornos de generación de texto sin censura, como roleplay o experimentación creativa, y se distribuye bajo licencia Apache-2.0.

El autor, mlasli, publica esta versión cuantizada en 6-bit para inferencia rápida en hardware Apple Silicon mediante la librería `mlx-lm`. El repositorio ocupa 21,9 GB y solo incluye los pesos del módulo de lenguaje (se descarta la torre de visión del modelo original), por lo que es exclusivamente de texto. La cuantización es group-wise 6-bit con group size 64, no equivalente a GGUF Q6_K. Existe también una variante de 8-bit (28,6 GB) y varias cuantizaciones GGUF para llama.cpp y Ollama.

La relevancia actual de este modelo radica en su combinación de tamaño (27B) y ausencia de alineación de seguridad, algo poco habitual en modelos abiertos de esta escala. Su evaluación independiente reporta una tasa de cumplimiento del 94,0 % en comportamientos dañinos (detector de rechazo de Zou et al.) y una divergencia KL de primer token de solo 0,0467 respecto al modelo base, lo que sugiere que la ablación apenas degrada las capacidades generales. No obstante, al eliminar la alineación de seguridad, su uso conlleva riesgos importantes y debe limitarse a entornos controlados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (basado en Qwen3.8-27B); no se proporcionan detalles de capas, heads ni dimensiones |
| Parametros totales | ~27 000 millones (el badge de HuggingFace muestra 5 885 566 464 elementos empaquetados, pero el autor confirma que el total real es ~27B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (se hereda del modelo base Qwen3.8-27B, pero no se especifica en la informacion) |
| Tipos de cuantizacion | MLX 6-bit (group-wise, group size 64); tambien disponible en 8-bit MLX y GGUF Q8_0, Q6_K, Q4_K_M |
| Idiomas soportados | Ingles (etiqueta `en`) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (formato MLX) |

## Arquitectura y entrenamiento

El modelo base es Qwen/Qwen3.8-27B, un transformer denso de 27 000 millones de parametros desarrollado por Alibaba. No se dispone de informacion detallada sobre el numero de capas, dimensiones ocultas o configuracion de atencion en la documentacion proporcionada. El modelo original incluye una torre de vision que se ha eliminado en esta cuantizacion MLX: solo se distribuyen los pesos de `language_model.*`, por lo que el modelo resultante es exclusivamente de texto.

El proceso de abliteracion se realizo con Heretic, una herramienta de una sola pasada que identifica y elimina la direccion de rechazo aprendida durante el alineamiento de seguridad. A diferencia de metodos multi-direccion anteriores, Heretic utiliza una busqueda con Optuna para seleccionar los parametros de ablacion en el frente de Pareto entre cumplimiento (compliance) y divergencia KL del primer token. El resultado es un modelo que mantiene casi intactas sus capacidades generales (divergencia KL de 0,0467) pero que deja de rechazar peticiones que el modelo alineado consideraria daninas. La cuantizacion a 6-bit se realizo con `mlx_lm.convert` usando cuantizacion afina group-wise con grupo de 64 elementos.

## Capacidades

- Generacion de texto libre y conversacional en ingles, con baja tasa de rechazo a peticiones controvertidas (6,0 % segun el detector de Zou et al.).
- Razonamiento y generacion de codigo: al preservar las capacidades del modelo base, mantiene las habilidades de Qwen3.8-27B en tareas de logica, matematicas y programacion (aunque no se aportan benchmarks especificos).
- Roleplay y escritura creativa: la ausencia de rechazos permite escenarios de ficcion sin restricciones tematicas, algo valorado en comunidades de roleplay.
- Inferencia en Apple Silicon mediante `mlx-lm`, con servidor OpenAI-compatible integrado (`mlx_lm.server`).
- Soporte de tool calling y agentes: no se menciona explicitamente, pero al ser una cuantizacion del modelo base, es probable que herede estas capacidades si el original las tiene; no hay confirmacion en la informacion disponible.
- Multilingue: solo ingles declarado; el modelo base podria soportar mas idiomas, pero no se garantiza tras la ablacion.

## Casos de uso

- Roleplay y ficcion interactiva: el modelo puede mantener personajes y tramas complejas sin rechazar contenido adulto o violento, algo que los modelos alineados bloquean. Se usaria con `mlx_lm.generate` o un frontend de chat conectado al servidor OpenAI-compatible.
- Generacion de contenido creativo sin restricciones: escritura de guiones, novelas o dialogos que aborden temas tabu, donde la baja tasa de rechazo (6 %) permite fluidez creativa.
- Investigacion sobre alineacion y seguridad: el modelo sirve como caso de estudio para analizar el impacto de la abliteracion en las capacidades y en los patrones de rechazo, comparandolo con el modelo base.
- Desarrollo de aplicaciones de texto en entornos controlados: si se necesita un LLM local que no imponga juicios morales en tareas de generacion (por ejemplo, en sistemas de escritura asistida), este modelo ofrece una alternativa sin filtros.
- Pruebas de cuantizacion MLX: al ser una cuantizacion 6-bit de un modelo de 27B, es util para evaluar el rendimiento y la calidad de MLX en Apple Silicon frente a otras cuantizaciones (8-bit o GGUF).
- Servicio local de chat sin moderacion: desplegar `mlx_lm.server` en una Mac con suficiente RAM unificada permite ofrecer un endpoint OpenAI-compatible para aplicaciones internas que requieran respuestas sin censura.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El autor incluye una evaluacion independiente centrada en el comportamiento de rechazo:

| Metrica | Valor |
|---|---|
| Compliance (harmful-behaviors, detector Zou et al., 50 prompts) | 94,0 % |
| Tasa de rechazo (Zou 29-substring) | 6,0 % |
| Divergencia KL del primer token vs modelo base | 0,0467 |

Un detector combinado de palabras clave reporto un 18,0 % de rechazo, pero la revision manual de los casos marcados confirmo que son en su mayoria falsos positivos (el modelo responde directamente usando terminos como "illegal" o "violent" dentro de respuestas conformes). No hay datos de rendimiento en tareas de razonamiento, codigo o lenguaje general.

## Requisitos de hardware

- El repositorio pesa 21,9 GB, por lo que se necesita una Mac con al menos 24 GB de RAM unificada para cargar el modelo en memoria (el modelo en 6-bit ocupa aproximadamente 21,9 GB, mas overhead de ejecucion).
- GPU recomendadas: cualquier chip Apple Silicon con 24 GB o mas de RAM unificada (M1 Pro/Max, M2 Pro/Max/Ultra, M3/M4 series). No esta pensado para GPU NVIDIA o AMD.
- En consumer GPU: no aplica, ya que el formato MLX es exclusivo de Apple Silicon. Para GPU NVIDIA se deberian usar las versiones GGUF con llama.cpp o vLLM.
- Opciones de despliegue: `mlx-lm` para generacion one-shot y `mlx_lm.server` para un servidor OpenAI-compatible. No se menciona compatibilidad con vLLM, TGI u Ollama directamente, aunque las versiones GGUF si son compatibles con Ollama y llama.cpp.
- Latencia y throughput: no se proporcionan datos. En una Mac con 64 GB de RAM unificada, un modelo de 27B en 6-bit suele generar entre 10 y 20 tokens por segundo con MLX, pero esto es una estimacion no verificada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B-Heretic-Abliterated-MLX-6bit (este) | 27B | No disponible | Apache-2.0 | MLX 6-bit | Abliterado, solo texto, para Apple Silicon |
| Qwen3.8-27B-Heretic-Abliterated-MLX-8bit | 27B | No disponible | Apache-2.0 | MLX 8-bit | Misma ablacion, mayor precision, 28,6 GB |
| Qwen3.8-27B-Heretic-Uncensored-BF16 | 27B | No disponible | Apache-2.0 | Safetensors BF16 | Version original sin cuantizar, incluye vision |
| Qwen/Qwen3.8-27B (base) | 27B | No disponible | Apache-2.0 | Safetensors | Modelo alineado, con vision, sin ablacion |

No se dispone de datos de rendimiento comparativo en tareas estandar. La principal diferencia entre este modelo y el base es la eliminacion de la alineacion de seguridad, que reduce la tasa de rechazo de casi el 100 % (en peticiones daninas) al 6 %, con una degradacion minima de capacidades (KL 0,0467).

## Limitaciones y advertencias

- La abliteracion elimina la alineacion de seguridad: el modelo puede generar contenido danino, ilegal, violento o sexual sin restricciones. Su uso conlleva riesgos legales y eticos; el autor recomienda usarlo de forma responsable y conforme a las leyes locales.
- Solo texto: se ha eliminado la torre de vision, por lo que no procesa imagenes. Para entrada multimodal hay que usar el repositorio BF16 o las versiones GGUF con mmproj.
- Solo ingles: la etiqueta de idioma es `en`; no se garantiza un buen rendimiento en otros idiomas, aunque el modelo base podria tener capacidades multilingues.
- Riesgo de alucinacion: como cualquier LLM, puede inventar hechos, especialmente en contextos largos o ambiguos. No se han evaluado tasas de alucinacion.
- Cuantizacion 6-bit: puede introducir degradacion de calidad frente a BF16, aunque la divergencia KL reportada es baja. No hay benchmarks de tareas estandar para confirmar el impacto.
- Licencia Apache-2.0: permite uso comercial, pero el contenido generado puede violar politicas de plataformas o leyes si se distribuye.
- Sin soporte para GPU NVIDIA/AMD: el formato MLX solo funciona en Apple Silicon. Para otros hardware hay que usar las versiones GGUF.
- Parametros totales confusos: el badge de HuggingFace muestra 5,9B debido al empaquetado de pesos; el total real es ~27B, lo que puede causar errores en herramientas automaticas.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mlasli/Qwen3.8-27B-Heretic-Abliterated-MLX-6bit
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Version BF16 original (con vision): https://huggingface.co/mlasli/Qwen3.8-27B-Heretic-Uncensored-BF16
- Version MLX 8-bit: https://huggingface.co/mlasli/Qwen3.8-27B-Heretic-Abliterated-MLX-8bit
- Version GGUF Q8_0: https://huggingface.co/mlasli/Qwen3.8-27B-Heretic-Uncensored-Q8_0-GGUF
- Version GGUF Q6_K: https://huggingface.co/mlasli/Qwen3.8-27B-Heretic-Uncensored-Q6_K-GGUF
- Version GGUF Q4_K_M: https://huggingface.co/mlasli/Qwen3.8-27B-Heretic-Uncensored-Q4_K_M-GGUF
- Heretic (herramienta de abliteracion): https://github.com/mlabonne/heretic-llm
