# cpral/poziomka-wsm3-uniform

## Resumen

`cpral/poziomka-wsm3-uniform` es un modelo de lenguaje de 4.119.797.632 parámetros (aproximadamente 4,12 mil millones) publicado por el usuario `cpral` en Hugging Face. Se trata de un modelo resultante de la fusión de 87 checkpoints de preentrenamiento distintos, combinados mediante ponderación lineal (con una "ascendencia complicada" según la descripción del autor). La técnica está inspirada en el artículo *WSM: Decay-Free Learning Rate Schedule via Checkpoint Merging for LLM Pre-training* (arXiv:2507.17634), que propone sustituir los programas de tasa de aprendizaje con decaimiento por la fusión ponderada de checkpoints intermedios.

El modelo se publicó el 3 de septiembre de 2026 y no cuenta con licencia declarada, idiomas documentados ni pipeline definido en su ficha de Hugging Face. El repositorio ocupa 8,2 GB y contiene pesos en formato `safetensors`. No hay información pública sobre arquitectura interna, datos de entrenamiento, capacidades específicas ni benchmarks. Por su tamaño, se enmarca en la categoría de modelos de lenguaje de pequeña escala (menos de 5B), aptos para ejecución en hardware de consumo con cuantización.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 4.119.797.632 |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio contiene safetensors; no se listan cuantizaciones GGUF/AWQ) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La única información técnica disponible proviene de la model card: el modelo es el resultado de fusionar 87 checkpoints de preentrenamiento mediante una ponderación lineal (el autor matiza "roughly due to complicated ancestry"), lo que sugiere que los checkpoints provienen de distintas ramas o configuraciones de entrenamiento. El método se basa en el trabajo *WSM* (Weighted Sum Merge), que propone un programa de tasa de aprendizaje sin decaimiento: en lugar de reducir la tasa de aprendizaje al final del entrenamiento, se fusionan los checkpoints guardados durante el proceso con pesos lineales, obteniendo un modelo final que promedia las contribuciones de cada etapa.

No se especifican detalles como el número de tokens de entrenamiento, la composición del dataset, el tipo de arquitectura (transformer denso, MoE, etc.) ni si se aplicaron técnicas de alineación como RLHF o DPO. Tampoco se indica la longitud de contexto ni el vocabulario. Toda esta información se considera no disponible.

## Capacidades

No se han publicado capacidades específicas del modelo en la información disponible. Al tratarse de un modelo de lenguaje preentrenado de aproximadamente 4,12 mil millones de parámetros, es razonable esperar que pueda realizar tareas básicas de generación de texto, pero no hay evidencia documentada sobre:

- Razonamiento o matemáticas
- Generación de código
- Soporte de tool calling / function calling
- Capacidades multilingües
- Modo de pensamiento o visión

Hasta que el autor publique documentación adicional, no es posible confirmar ninguna capacidad concreta.

## Casos de uso

No existen casos de uso documentados por el autor. Dado el tamaño del modelo (≈4B) y su naturaleza de fusión de checkpoints, podría emplearse de forma especulativa en escenarios como:

- Experimentación académica: estudiar el efecto del merging de checkpoints en la calidad final de un LLM de pequeña escala.
- Prototipado de aplicaciones de generación de texto donde se requiera un modelo ligero y desplegable en hardware de gama media.
- Fine-tuning posterior sobre dominios específicos, si la licencia lo permitiera (actualmente no declarada).
- Evaluación comparativa de técnicas de fusión de modelos frente a entrenamiento convencional.

Sin embargo, estos son usos hipotéticos basados en el tipo de modelo y no en documentación oficial. No se recomienda su uso en producción sin antes validar su comportamiento y licencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

Los siguientes valores son estimaciones orientativas basadas en el número de parámetros (4,12B) y el formato de pesos. No hay datos oficiales de latencia ni throughput.

- VRAM estimada para inferencia en fp16: ~8,5 GB solo para pesos, más overhead de activaciones y KV cache; se recomienda al menos 12 GB.
- Con cuantización int8: ~4,5 GB de pesos; int4: ~2,5 GB, permitiendo ejecución en GPUs de 6-8 GB VRAM.
- GPUs recomendadas: RTX 3090/4090 (24 GB) para fp16 sin cuantizar; RTX 3060 (12 GB) o inferiores con cuantización.
- Opciones de despliegue: vLLM, llama.cpp, Ollama (si se generan archivos GGUF), Hugging Face Transformers con `device_map="auto"`.
- No se dispone de mediciones de latencia o throughput publicadas.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de `poziomka-wsm3-uniform`, por lo que no es posible realizar una comparativa cuantitativa. A modo de referencia, se listan modelos de tamaño similar con características conocidas, pero sin comparación directa:

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| poziomka-wsm3-uniform | 4,12B | no disponible | no disponible | Merge de 87 checkpoints |
| Llama 3.2 3B | 3,21B | 128K | Llama 3.2 Community | Modelo denso, multilingüe |
| Qwen2.5 3B | 3,09B | 32K | Apache 2.0 | Soporta tool calling |
| Phi-3-mini | 3,82B | 4K (original) / 128K (long context) | MIT | Optimizado para razonamiento |

## Limitaciones y advertencias

- No hay licencia declarada: cualquier uso comercial o redistribución queda en un limbo legal. Es imprescindible contactar con el autor antes de utilizar el modelo.
- No se documentan sesgos ni riesgos de alucinación; al ser un modelo sin alineación conocida, es probable que presente comportamientos no deseados en tareas abiertas.
- La fusión de 87 checkpoints mediante ponderación lineal puede producir un modelo con comportamiento inconsistente o degradado en ciertas tareas si los checkpoints provienen de configuraciones muy dispares.
- No se especifica la longitud de contexto; asumir una ventana estándar (por ejemplo, 2K o 4K) sin verificación puede provocar errores en entradas largas.
- No hay información sobre el idioma de entrenamiento; el modelo podría estar sesgado hacia un idioma concreto no declarado.
- El repositorio tiene 0 descargas y 0 likes, lo que indica falta de validación por parte de la comunidad.

## Enlaces

- [Repositorio Hugging Face: cpral/poziomka-wsm3-uniform](https://huggingface.co/cpral/poziomka-wsm3-uniform)
- [Paper WSM: Decay-Free Learning Rate Schedule via Checkpoint Merging for LLM Pre-training (arXiv:2507.17634)](https://arxiv.org/abs/2507.17634)
- [Perfil del autor en Hugging Face](https://huggingface.co/cpral)
