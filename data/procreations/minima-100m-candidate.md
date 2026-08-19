# ProCreations/minima-100m-candidate

## Resumen

El modelo `ProCreations/minima-100m-candidate` es un artefacto de inferencia ligera desarrollado por ProCreations (SSH), un proyecto centrado en hacer modelos de IA pequeños y accesibles para hardware de consumo. Se trata de un modelo con 91,4 millones de parámetros, basado en el encoder `LiquidAI/LFM2.5-Encoder-350M`, que ha sido transformado a una representación ternaria (pesos con valores lógicos -1, 0, +1) en formato de runtime I2_S, lo que reduce drásticamente el espacio de almacenamiento y la carga computacional.

El modelo se distribuye como un "artefacto Minima W1.58A8", lo que implica que está empaquetado para ser cargado mediante la librería `minima-lfm` (del repositorio SSHDotCodes/minima) usando `MinimaModel.from_pretrained(...)`. Su relevancia radica en la posibilidad de ejecutar inferencia de modelos de lenguaje en dispositivos con recursos muy limitados, aunque la documentación pública es escasa y no se especifican detalles sobre arquitectura interna, contexto o rendimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (derivado de un encoder transformer de 350M) |
| Parametros totales | 91.438.848 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (depende de `minima_config.json`) |
| Tipos de cuantizacion | Ternaria {-1, 0, +1} en formato I2_S; etiqueta 8-bit |
| Idiomas soportados | no disponible |
| Licencia | lfm-open-license-v1.0 |
| Formato de pesos | safetensors (además de formato específico de minima) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo. Se sabe que parte del modelo base `LiquidAI/LFM2.5-Encoder-350M`, un encoder transformer de 350 millones de parámetros, y que el resultado final es un modelo ternario de 91 millones de parámetros. El proceso de conversión a ternario (W1.58A8) sugiere una técnica de cuantización extrema que reduce cada peso a aproximadamente 1,58 bits, manteniendo activaciones de 8 bits. No se han publicado datos sobre el dataset de entrenamiento, el número de tokens procesados ni si se aplicaron técnicas como RLHF o DPO. La librería `minima-lfm` gestiona el empaquetado y la carga del modelo, pero no se especifican detalles sobre el grupo de cuantización, el rango de recuperación (recovery rank) ni el límite de contexto, que quedan definidos en el archivo `minima_config.json` incluido en el repositorio.

## Capacidades

- No se han publicado capacidades específicas del modelo en la documentación disponible.
- Al ser un modelo ternario de 91M parámetros, se espera que pueda realizar tareas básicas de generación de texto, pero no hay evidencia empírica ni benchmarks que lo confirmen.
- No se menciona soporte para tool calling, agentes, razonamiento multi-paso, visión o audio.
- El modelo base es un encoder, lo que sugiere que podría estar orientado a tareas de representación o clasificación más que a generación libre, aunque no se confirma.

## Casos de uso

No se han documentado casos de uso concretos para este modelo. Dado su tamaño extremadamente reducido y su naturaleza ternaria, podría plantearse su uso en escenarios de inferencia en el borde (edge) o en dispositivos con memoria muy limitada, como microcontroladores o teléfonos de gama baja. Sin embargo, al no existir documentación sobre sus capacidades reales, cualquier aplicación práctica sería especulativa. Se recomienda consultar el repositorio de `minima` para conocer los casos de uso previstos por el autor, aunque la información pública es insuficiente para validarlos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos sobre MMLU, HumanEval, GSM8K ni ninguna otra métrica estándar. Tampoco se han encontrado comparaciones con modelos similares en la búsqueda web.

## Requisitos de hardware

- No se especifican requisitos oficiales de hardware.
- Con 91,4 millones de parámetros en formato ternario, el tamaño del modelo en memoria es aproximadamente 91.438.848 × 1,58 bits ≈ 18 MB, más overhead de activaciones y runtime. Esto lo hace ejecutable en cualquier GPU moderna (incluso integradas) y en CPUs con al menos 1 GB de RAM libre.
- No se indican GPUs recomendadas, pero cualquier tarjeta con 4 GB de VRAM o más sería suficiente.
- El despliegue se realiza mediante la librería `minima-lfm`, que no es compatible con vLLM, llama.cpp u Ollama de forma nativa según la documentación disponible.
- No hay datos de latencia ni throughput.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (modelos ternarios de ~100M parámetros). El modelo base `LiquidAI/LFM2.5-Encoder-350M` podría servir como referencia de rendimiento, pero no se han publicado resultados del modelo ternario que permitan una comparación directa. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- Al ser un modelo extremadamente pequeño y cuantizado, es probable que su capacidad de razonamiento y generación sea muy limitada en comparación con modelos de cientos de miles de millones de parámetros.
- No se ha documentado ningún análisis de sesgos ni de riesgos de alucinación. Dado el tamaño reducido, es esperable que la coherencia y la fidelidad de los textos generados sean bajas.
- La licencia `lfm-open-license-v1.0` puede imponer restricciones al uso comercial; se debe revisar el texto completo de la licencia en el enlace proporcionado antes de cualquier uso en producción.
- No se especifica la longitud de contexto, por lo que no se puede garantizar un número mínimo de tokens de entrada.
- El modelo depende de la librería `minima-lfm`, que parece ser un proyecto independiente y no ampliamente adoptado; su estabilidad y mantenimiento a largo plazo no están garantizados.
- No hay información sobre el idioma o idiomas soportados; se recomienda probar con textos en inglés o español antes de asumir compatibilidad.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/ProCreations/minima-100m-candidate)
- [Repositorio minima (SSHDotCodes)](https://github.com/SSHDotCodes/minima)
- [Modelo base LiquidAI/LFM2.5-Encoder-350M](https://huggingface.co/LiquidAI/LFM2.5-Encoder-350M)
- [Licencia lfm-open-license-v1.0](https://huggingface.co/LiquidAI/LFM2.5-Encoder-350M/blob/main/LICENSE)
