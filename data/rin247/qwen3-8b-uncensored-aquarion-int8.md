# Rin247/Qwen3-8B-Uncensored-Aquarion-INT8

## Resumen

El modelo `Rin247/Qwen3-8B-Uncensored-Aquarion-INT8` es una cuantización INT8 weight-only del modelo base `Qwen3-8B`, desarrollada por el usuario Rin247. La principal particularidad es que el modelo ha sido sometido a un proceso de "abliteración" (uncensoring) mediante proyección ortogonal de la dirección de rechazo, antes de la cuantización. Esto elimina parcialmente los mecanismos de rechazo del modelo original, permitiendo respuestas sin filtros de seguridad en ciertos dominios.

Esta ficha se publica sin información oficial sobre licencia, idiomas o benchmarks. El repositorio contiene un único archivo `model.safetensors` de 9.4 GB junto con un `config.json` que incluye la configuración de cuantización. El modelo está orientado a usuarios que necesitan un LLM de 8B parámetros con menor footprint de memoria y sin restricciones de contenido, aunque con importantes advertencias legales y éticas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No especificada (derivada de Qwen3-8B, presumiblemente transformer denso) |
| Parametros totales | 8.190.735.360 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | INT8 (weight-only, RTN en CPU) |
| Idiomas soportados | No disponibles |
| Licencia | No disponible |
| Formato de pesos | safetensors (con buffers `*.weight_scale` y `*.weight_shape`) |

## Arquitectura y entrenamiento

La información disponible indica que se trata de una cuantización INT8 del modelo `Qwen3-8B` mediante cuantización RTN (Round-To-Nearest) ejecutada en CPU. Los pesos se almacenan en formato INT8 junto con escalas y formas asociadas en buffers separados, lo que permite una de-cuantización posterior para su uso en motores de inferencia compatibles.

Antes de la cuantización, el modelo fue "abliterado" mediante proyección ortogonal de la dirección de rechazo, una técnica que modifica los pesos del modelo para eliminar el comportamiento de rechazo aprendido durante el entrenamiento. No se proporcionan datos sobre el conjunto de entrenamiento, el número de tokens procesados ni el uso de RLHF/DPO. El proceso completo se enmarca en el "Genesis of Aquarion forge", aunque sin más detalles técnicos.

## Capacidades

No se dispone de información detallada sobre capacidades específicas en la model card. Al ser una cuantización de `Qwen3-8B`, se espera que herede las capacidades generales del modelo original (generación de texto, razonamiento, código, matemáticas, etc.), pero no se proporciona documentación oficial al respecto. La única característica destacada es la eliminación de mecanismos de rechazo, lo que permite generar contenido que el modelo base normalmente bloquearía.

- Generación de texto sin filtros de seguridad (abliterado)
- Posible soporte de tool calling y funciones de agente (heredado del base, no verificado)
- Capacidades multilingües no confirmadas
- Sin soporte de visión ni audio documentado

## Casos de uso

Dado que no hay casos de uso documentados por el autor, se indican escenarios potenciales basados en las características típicas de un LLM de 8B cuantizado, con la advertencia de que no están verificados:

- Generación creativa de ficción sin restricciones temáticas, aprovechando la ausencia de rechazo para explorar narrativas adultas o controvertidas.
- Asistente de escritura técnica para documentación interna, donde se requiere un modelo ligero que pueda ejecutarse en hardware de gama media.
- Prototipado rápido de aplicaciones de chat en entornos de desarrollo, gracias al bajo footprint de memoria (INT8).
- Análisis de texto en dominios especializados donde el modelo base podría negarse a responder (por ejemplo, investigación sociológica sobre temas sensibles).
- Automatización de respuestas en foros o comunidades con moderación laxa, siempre que se cumplan las normativas legales aplicables.
- Evaluación comparativa de técnicas de abliteración y cuantización para investigadores interesados en la alineación de modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de datos sobre MMLU, HumanEval, GSM8K ni otras métricas estándar. Tampoco se comparan con el modelo base `Qwen3-8B` ni con otras versiones abliteradas.

## Requisitos de hardware

No se proporcionan requisitos oficiales. A partir del tamaño del repositorio (9.4 GB) y el formato INT8, se puede estimar:

- VRAM estimada para inferencia: aproximadamente 10-12 GB (8 GB de pesos + overhead de activaciones y KV cache). Se recomienda al menos 12 GB para una ventana de contexto moderada.
- GPU recomendadas: RTX 3090, RTX 4090, A10, A100 (cualquier GPU con 12 GB o más de VRAM).
- Es posible ejecutar en GPUs de consumo como RTX 3060 12 GB o RTX 4070 con cuantización adicional (por ejemplo, GGUF de 4 bits).
- Opciones de despliegue: al ser un formato safetensors con cuantización personalizada, requiere de-cuantización previa con los buffers incluidos. No se menciona compatibilidad directa con vLLM, llama.cpp, Ollama o TGI. Es probable que necesite un script personalizado o conversión a otros formatos.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa rigurosa. Existen otras versiones abliteradas de `Qwen3-8B` en Hugging Face (por ejemplo, `huihui-ai/Qwen3-8B-abliterated`), pero no se dispone de sus especificaciones técnicas. El modelo base `Qwen3-8B` tiene parámetros similares (8.19B) pero sin cuantizar y con los mecanismos de seguridad originales. No se pueden extraer conclusiones sobre rendimiento relativo.

## Limitaciones y advertencias

- El proceso de abliteración elimina los mecanismos de rechazo, lo que puede generar contenido dañino, ilegal o éticamente cuestionable. El uso de este modelo conlleva responsabilidad legal y moral.
- La cuantización INT8 puede degradar ligeramente la calidad de generación en comparación con el modelo en BF16, aunque no se dispone de datos cuantitativos.
- La licencia no está especificada, por lo que el uso comercial es incierto y podría violar los términos del modelo base `Qwen3-8B` (que utiliza la licencia Apache 2.0, aunque no se confirma aquí).
- No se garantiza la compatibilidad con frameworks estándar de inferencia; puede requerir desarrollo adicional para su integración.
- El modelo no incluye documentación sobre sesgos o alucinaciones; se recomienda validar las salidas en aplicaciones críticas.
- La ventana de contexto no está documentada, lo que limita la planificación de despliegues con requisitos de contexto largo.

## Enlaces

- [Repositorio HuggingFace del modelo](https://huggingface.co/Rin247/Qwen3-8B-Uncensored-Aquarion-INT8)
- [Modelo base Qwen3-8B](https://huggingface.co/Qwen/Qwen3-8B)
- [Versión abliterada de huihui-ai](https://huggingface.co/huihui-ai/Qwen3-8B-abliterated)
- [Blog sobre abliteración de Qwen3.8-27B (referencia técnica)](https://www.orcarouter.ai/blog/qwen-3-8-27b-uncensored-fp8)
