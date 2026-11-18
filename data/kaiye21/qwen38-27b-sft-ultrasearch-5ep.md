# kaiye21/qwen38-27b-sft-ultrasearch-5ep

## Resumen

Qwen3.8-27B SFT ultrasearch-5ep es un ajuste fino supervisado (SFT) del modelo base Qwen3.8-27B-text, publicado por el usuario kaiye21 en Hugging Face. El modelo parte de la arquitectura Qwen3.5 de texto y se ha entrenado sobre el dataset ultradata_search20k de openbmb (subconjunto UltraData Search_Agent), compuesto por trayectorias de agente con herramientas, llamadas a herramientas y razonamiento. El objetivo declarado es especializar el modelo en tareas de búsqueda y uso de herramientas dentro de flujos de agente.

El checkpoint publicado corresponde a una exportación temprana (iteración 750 de 2120, aproximadamente el 77% de la segunda época de un entrenamiento de 5 épocas), seleccionada por ser la región de mínimo de pérdida de validación (0,390 en la iteración 765) antes de que el modelo empezara a sobreajustar (0,410 en la época 4). La receta usa empaquetado de secuencias a 256K, learning rate 5e-6 con decaimiento coseno y evaluación cada 15 iteraciones.

Se trata de un modelo de 26.895.998.464 parámetros (unos 26,9 mil millones) en formato safetensors, con un repositorio de 53,8 GB. La información pública es muy limitada: no hay model card completa, licencia declarada, idiomas especificados ni resultados de benchmarks, por lo que muchas especificaciones deben marcarse como no disponibles. Es relevante para quienes investigan ajuste fino de agentes de búsqueda sobre la familia Qwen y quieran reproducir o comparar recetas de SFT con parada temprana.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3.5-text, tag `qwen3_5_text`) |
| Parametros totales | 26.895.998.464 (≈26,9B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (el entrenamiento usa empaquetado a 256K, pero no se confirma la ventana de inferencia) |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors; sin GGUF en el repo) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (repositorio de 53,8 GB) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del checkpoint base Qwen3.8-27B-text, que emplea la arquitectura de texto Qwen3.5 (transformer decoder-only). El autor indica que la tokenizador y la configuración provienen de la release original Qwen3.8-27B-text. No se especifica si el modelo base es denso o de mezcla de expertos; el número de parámetros totales (26,9B) y la ausencia de mención a parámetros activos sugieren un modelo denso, pero no se confirma en la información disponible.

El entrenamiento se realizó sobre el dataset ultradata_search20k (19.000 ejemplos de entrenamiento y 1.000 de validación, partición 95/5 con semilla 42), derivado de openbmb UltraData Search_Agent, que contiene trayectorias de agente con herramientas, llamadas a herramientas y razonamiento. La receta emplea 5 épocas, empaquetado de secuencias a 256K, learning rate 5e-6 con decaimiento coseno y evaluación cada 15 iteraciones. El checkpoint exportado es la iteración 750 de 2120 (unas 424 iteraciones por época), elegida por el mínimo de pérdida de validación (0,390 en la iteración 765) frente a valores posteriores de 0,410 en la época 4. No se menciona RLHF ni DPO; es SFT puro. El autor señala que esta exportación no incluye la cabeza MTP (multi-token prediction) para decodificación especulativa, que está disponible por separado en otro repositorio (kaiye21/qwen38-27b-sft-swetraj-5ep, carpeta mtp-base/).

## Capacidades

- Generación de texto y razonamiento: el modelo base es de propósito general y el ajuste SFT preserva la generación de texto, aunque la especialización se orienta a trayectorias de agente.
- Uso de herramientas (tool calling / function calling): el dataset de entrenamiento incluye explícitamente herramientas y llamadas a herramientas, por lo que el modelo está especializado en invocar funciones dentro de flujos de agente.
- Razonamiento multi-paso y agentes: el dataset contiene trayectorias de razonamiento (reasoning) junto con las llamadas a herramientas, orientado a tareas de búsqueda y resolución multi-paso.
- Búsqueda y recuperación de información: el nombre del dataset (Search_Agent) indica especialización en tareas de búsqueda.
- Capacidades multilingües: no disponible; no se declaran idiomas.
- Modo thinking explícito: no disponible; no se documenta en la información proporcionada.
- Visión o audio: no disponible; el tag `qwen3_5_text` sugiere un modelo solo de texto.
- Decodificación especulativa: la cabeza MTP no está incluida en esta exportación (configuración a cero); disponible por separado en otro repositorio del mismo autor.

## Casos de uso

- Agentes de búsqueda web: el modelo puede gestionar bucles de razonamiento y llamadas a herramientas de búsqueda, ya que se ha entrenado sobre trayectorias Search_Agent con tool_calls, lo que lo hace adecuado para asistentes que consultan fuentes externas y sintetizan respuestas.
- Automatización de investigación documental: integrado en un pipeline que expone herramientas de consulta a bases de datos o APIs, el modelo puede encadenar varias llamadas y razonar sobre los resultados antes de redactar un informe.
- Function calling en producción: al haber sido ajustado con ejemplos de llamadas a herramientas, puede integrarse en backends que requieran invocar funciones con argumentos estructurados (por ejemplo, consultas a CRM o sistemas de ticketing).
- Asistentes multi-paso para soporte técnico: el modelo puede descomponer una consulta en subtareas, invocar herramientas de diagnóstico y consolidar la respuesta, aprovechando el entrenamiento en razonamiento encadenado.
- Evaluación y comparación de recetas de SFT: investigadores pueden usar este checkpoint (junto con los otros del autor) para estudiar el efecto de la parada temprana y de distintos datasets en el comportamiento de agentes de búsqueda.
- Reproducción de experimentos de ajuste fino: dado que el autor documenta la receta (5 épocas, 256K de empaquetado, lr 5e-6, evaluación cada 15 iteraciones), sirve como referencia para replicar el entrenamiento sobre la familia Qwen3.8.
- Base para ajustes posteriores: al ser un SFT intermedio (época 2), puede utilizarse como punto de partida para RLHF/DPO o para seguir entrenando con datos propios de dominio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor solo reporta la trayectoria de pérdida de validación (val lm loss): 0,394 en la iteración 375, 0,403 en la 390, 0,390 en la 765 (mínimo) y 0,410 en la 1455 (época 4). Estas cifras son estimaciones ruidosas con eval-iters=2 y no constituyen benchmarks de capacidades.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa para un modelo denso de ~26,9B parámetros, en FP16/BF16 se requieren aproximadamente 54 GB solo para pesos, más memoria para KV cache y activaciones; en cuantización de 8 bits, unos 27 GB; en 4 bits, unos 14-16 GB. Estas cifras son estimaciones generales, no datos del autor.
- GPU recomendadas: para FP16/BF16 se necesitan GPUs de 80 GB (A100, H100) o configuraciones multi-GPU; para cuantización de 8 bits, una A100 40 GB o dos RTX 4090; para 4 bits, una RTX 4090 (24 GB) podría ser suficiente para los pesos, con margen limitado para contexto.
- ¿Cabe en consumer GPU? En cuantización de 4 bits sí es plausible en RTX 4090 (24 GB) o RTX 3090 (24 GB), aunque con contexto reducido. En FP16 no cabe en ninguna consumer GPU actual de una sola tarjeta.
- Opciones de despliegue: el repositorio solo publica safetensors, por lo que se requiere convertir a GGUF para llama.cpp/Ollama o cargar con vLLM/TGI/Transformers. No se proporcionan pesos GGUF ni cuantizaciones listas.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| kaiye21/qwen38-27b-sft-ultrasearch-5ep | 26,9B | no disponible | no disponible | safetensors, 0 descargas | SFT sobre UltraData Search_Agent, exportación temprana |
| Qwen3.8-27B-text (base) | ~27B (según nombre) | no disponible | no disponible en la información | release original citada por el autor | Modelo base sin especialización en agentes |
| kaiye21/qwen38-27b-sft-swetraj-5ep | no disponible | no disponible | no disponible | safetensors | Misma receta, otro dataset; incluye cabeza MTP |

No se dispone de datos de benchmarks ni de especificaciones detalladas de los modelos comparables en la información proporcionada, por lo que la comparación cuantitativa de rendimiento no está disponible.

## Limitaciones y advertencias

- Licencia no declarada: no se especifica licencia, lo que impide confirmar si el uso comercial está permitido. Es un riesgo legal relevante para producción.
- Idiomas no declarados: no se documenta qué idiomas soporta; el comportamiento multilingüe es incierto.
- Riesgo de sobreajuste: el autor indica que la exportación es anterior al sobreajuste (época 2), pero el modelo sigue siendo un SFT específico de un dataset de búsqueda; puede degradar capacidades generales del base.
- Sesgos: no se documentan evaluaciones de sesgo; el dataset UltraData Search_Agent puede introducir sesgos de dominio y de estilo de razonamiento.
- Alucinación: no se han publicado evaluaciones de fidelidad; en tareas de búsqueda, el modelo podría generar llamadas a herramientas o resultados no verificados.
- Contexto: aunque el entrenamiento usa empaquetado a 256K, no se confirma la ventana de contexto efectiva en inferencia; usarlo con contextos largos sin validación es arriesgado.
- Cabeza MTP ausente: esta exportación no incluye la cabeza de predicción multi-token para decodificación especulativa (configuración a cero), por lo que no se puede usar para acelerar la inferencia sin cargar la versión separada.
- Madurez: 0 descargas y 0 likes en el momento de la consulta; sin validación comunitaria ni benchmarks independientes.
- Formato: solo safetensors; no hay GGUF ni cuantizaciones oficiales, lo que añade trabajo de conversión para despliegues ligeros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kaiye21/qwen38-27b-sft-ultrasearch-5ep
- Repositorio con cabeza MTP base (citado por el autor): https://huggingface.co/kaiye21/qwen38-27b-sft-swetraj-5ep
- Dataset de origen (openbmb UltraData Search_Agent): no disponible como enlace directo en la información proporcionada
- Paper o blog del modelo base Qwen3.8-27B-text: no disponible en la información proporcionada
