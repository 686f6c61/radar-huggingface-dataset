# orcarouter/Gemma-4-26B-A4B-it-Uncensored-FP8

## Resumen

El modelo **orcarouter/Gemma-4-26B-A4B-it-Uncensored-FP8** es una variante de la familia Gemma 4 de Google, concretamente una adaptación del checkpoint `google/gemma-4-26B-A4B-it` (versión instructiva) a la que se ha aplicado un proceso de *abliteration* para eliminar los mecanismos de rechazo de contenido, dando lugar a una versión "uncensored". El modelo está cuantizado en FP8 mediante la librería `compressed-tensors`, lo que reduce el tamaño del repositorio a 27.2 GB y permite una inferencia más eficiente en memoria.

Se trata de un modelo de arquitectura MoE (Mixture of Experts) con aproximadamente 25.800 millones de parámetros totales y, según la nomenclatura del nombre, 4 mil millones de parámetros activos por token. Está diseñado para tareas de generación de texto, razonamiento, *function calling* y conversación, y soporta los idiomas inglés y chino. La licencia es la oficial de Gemma, lo que implica restricciones de uso para determinadas aplicaciones comerciales.

La relevancia de este modelo radica en que ofrece una versión sin filtros de un modelo de última generación de Google, lo que puede interesar a desarrolladores que necesiten explorar comportamientos no restringidos, aunque debe usarse con precaución por su posible generación de contenido inapropiado. Su cuantización FP8 permite su despliegue en GPUs con VRAM media, y es compatible con frameworks como vLLM y TGI.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE) |
| Parametros totales | 25.805.936.206 (~25.8B) |
| Parametros activos | no disponible (el nombre sugiere ~4B, no confirmado) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8 (compressed-tensors) |
| Idiomas soportados | en, zh |
| Licencia | Gemma (licencia de Google) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura MoE de Google Gemma 4 26B A4B, que combina un transformer con capas de mezcla de expertos. En un MoE, cada token se enruta a un subconjunto de los parámetros activos, lo que permite un razonamiento eficiente con un coste computacional menor que un modelo denso del mismo tamaño. La versión original de Google se entrenó con datos multilingües y técnicas de ajuste fino supervisado (SFT) y optimización por preferencias humanas (RLHF/DPO), aunque los detalles concretos del dataset no se han publicado en la información disponible.

Esta variante concreta ha sido sometida a un proceso de *abliteration* (técnica que modifica los pesos del modelo para eliminar las capas de rechazo de contenido), lo que da lugar a una versión "uncensored". Posteriormente se ha cuantizado en FP8 usando `compressed-tensors`, manteniendo la calidad general pero reduciendo el tamaño de los pesos. No hay información pública sobre el conjunto de datos de entrenamiento específico de esta adaptación.

## Capacidades

- Generación de texto conversacional y de instrucciones.
- Razonamiento multi-paso y resolución de problemas.
- Soporte de *function calling* (llamada a herramientas).
- Capacidades de razonamiento (reasoning) para tareas complejas.
- Multilingüe: inglés y chino.
- Al ser una versión *uncensored*, puede generar contenido que el modelo original rechazaría (contenido sensible, lenguaje explícito, etc.).
- Compatible con frameworks de inferencia como `vLLM` y `TGI` (según tags).

## Casos de uso

- **Investigación en seguridad y alineación**: permite estudiar el comportamiento de un modelo sin filtros de seguridad, útil para evaluar riesgos y desarrollar técnicas de mitigación.
- **Generación de código en entornos de desarrollo**: gracias a su capacidad de *function calling*, puede integrarse en asistentes de programación que necesiten invocar APIs o ejecutar acciones.
- **Chatbots y asistentes conversacionales**: su capacidad de razonamiento y su tamaño permiten mantener diálogos coherentes y contextualizados en inglés y chino.
- **Procesamiento de documentos técnicos**: puede resumir, traducir o extraer información de textos largos (aunque el contexto no está especificado).
- **Prototipado de agentes autónomos**: con soporte de *function calling*, es adecuado para construir agentes que interactúen con APIs y ejecuten tareas multi-paso.
- **Análisis de contenido multilingüe**: su soporte de inglés y chino lo hace útil para tareas de clasificación o generación en esos idiomas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se puede comparar cuantitativamente con otros modelos sin datos reales.

## Requisitos de hardware

- **VRAM estimada**: al estar cuantizado en FP8, los pesos ocupan aproximadamente 25.8 GB (25.8B × 1 byte). Con overhead de activaciones y KV cache, se recomiendan al menos 32 GB de VRAM para inferencia completa.
- **GPUs recomendadas**: una NVIDIA A100 (40 GB), H100 (80 GB) o RTX A6000 (48 GB) son adecuadas. En GPUs de consumo como la RTX 4090 (24 GB) no caben los pesos completos; se necesitaría cuantización adicional (por ejemplo, 4-bit) para reducir la memoria.
- **Opciones de despliegue**: `vLLM`, `TGI`, `llama.cpp` (si se convierte a GGUF) o `Ollama` (con conversión previa). La librería `transformers` también es compatible.
- **Latencia y throughput**: no disponibles, pero al ser MoE con solo 4B activos, la velocidad de inferencia será significativamente mayor que un modelo denso de 26B.

## Comparativa con modelos similares

No se dispone de información de benchmarks para comparar directamente. Sin embargo, se puede contextualizar con el modelo base `google/gemma-4-26B-A4B-it` (no cuantizado, sin abliteration) y con otros modelos MoE como `Qwen2.5-MoE-14B-A3B` o `DeepSeek-V3` (671B total, 37B activos). Las diferencias principales son:

| Modelo | Parámetros totales | Activos | Cuantización | Licencia |
|---|---|---|---|---|
| Gemma-4-26B-A4B-it (base) | 26B | ~4B | FP8 (esta variante) | Gemma |
| Qwen2.5-MoE-14B-A3B | 14B | 3B | BF16 | Apache 2.0 |
| DeepSeek-V3 | 671B | 37B | BF16 | MIT |

Esta variante FP8 es más ligera en memoria que el modelo base en BF16, pero mantiene la misma arquitectura. No hay datos de rendimiento comparativo publicados.

## Limitaciones y advertencias

- **Contenido sin filtros**: al ser "uncensored", el modelo puede generar contenido ofensivo, peligroso o ilegal sin restricciones. No es apto para uso en producción sin medidas de moderación adicionales.
- **Licencia restrictiva**: la licencia Gemma de Google tiene términos de uso que limitan aplicaciones comerciales, especialmente en sectores regulados (salud, finanzas, etc.). Debe revisarse la política de uso.
- **Idiomas limitados**: solo inglés y chino; no hay soporte multilingüe amplio.
- **Contexto desconocido**: la longitud de contexto no se ha especificado, lo que puede afectar tareas que requieran documentos largos.
- **Riesgo de alucinaciones**: como todos los modelos generativos, puede producir información falsa o inventada, especialmente en temas de actualidad.
- **Sesgos potenciales**: al ser una variante sin ajuste de seguridad, es probable que reproduzca sesgos presentes en los datos de entrenamiento originales.
- **Acceso restringido**: el modelo está en HuggingFace con acceso *gated*, lo que requiere aceptar condiciones antes de descargarlo.

## Enlaces

- [Página del modelo en HuggingFace](https://huggingface.co/orcarouter/Gemma-4-26B-A4B-it-Uncensored-FP8)
- [Modelo base: google/gemma-4-26B-A4B-it](https://huggingface.co/google/gemma-4-26B-A4B-it)
- [Documentación de Gemma en Google](https://ai.google.dev/gemma) (para la licencia y detalles del modelo base)
