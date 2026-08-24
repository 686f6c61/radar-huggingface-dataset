# mradermacher/gemma-4-E2B-Deckard-ShiningValiant3-BF16-i1-GGUF

## Resumen

Este repositorio contiene el archivo de cuantización *imatrix* (`gemma-4-E2B-Deckard-ShiningValiant3-BF16.imatrix.gguf`) para un modelo base denominado `nightmedia/gemma-4-E2B-Deckard-ShiningValiant3-BF16`, publicado por el usuario `mradermacher`. El modelo base es un *merge* de modelos de la familia Gemma 4 de Google, concretamente de la variante E2B (2.300 millones de parámetros), fusionado con otros pesos mediante `mergekit`. El archivo imatrix no es un modelo listo para usar, sino un recurso de calibración que permite a los desarrolladores generar cuantizaciones GGUF personalizadas (por ejemplo, Q4_K_M, Q5_K_S) con herramientas como `llama.cpp` o `llama-cpp-python`.

La relevancia de este repositorio radica en que facilita la creación de versiones comprimidas y eficientes del modelo base para su despliegue en entornos con recursos limitados, como GPUs de consumo o CPUs. Al ser un modelo de 2.2B parámetros, tras cuantizar se puede ejecutar en hardware modesto, manteniendo un equilibrio entre calidad y rendimiento. La licencia es Apache 2.0 con las condiciones adicionales de la licencia de Gemma 4 (que restringe usos militares y de vigilancia). El idioma principal es el inglés, aunque la familia Gemma 4 soporta más de 140 idiomas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (Gemma 4 E2B) |
| Parámetros totales | 2,2B (según la familia Gemma 4 E2B) |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 256K tokens (según especificación de la familia Gemma 4) |
| Tipos de cuantización | Este repositorio contiene solo el archivo imatrix (no cuantizaciones finales). El modelo base admite cuantizaciones GGUF como Q2_K, Q4_K_M, Q6_K, etc. |
| Idiomas soportados | Inglés (según la model card) |
| Licencia | Apache 2.0 con condiciones adicionales (licencia de Gemma 4) |
| Formato de pesos | GGUF (archivo de imatrix) |

## Arquitectura y entrenamiento

El modelo base es un *merge* de modelos de la familia Gemma 4 E2B, realizado con `mergekit`. La arquitectura subyacente es un transformer denso (no Mixture of Experts) con 2,2B parámetros, diseñado por Google para razonamiento y generación de texto. El modelo original Gemma 4 se entrenó con datos multilingües y multimodales, pero este merge se ha afinado probablemente para tareas específicas (no se especifica). No se dispone de información sobre el número de tokens de entrenamiento, el dataset utilizado ni técnicas de alineación como RLHF o DPO. El archivo imatrix se generó con la herramienta `llama.cpp` para calibrar las cuantizaciones y reducir la pérdida de calidad.

## Capacidades

- Generación de texto en inglés con razonamiento avanzado, gracias al modelo base Gemma 4 E2B.
- Soporte de código y matemáticas (el modelo Gemma 4 destaca en estas áreas).
- Capacidad de procesar contexto largo (hasta 256K tokens según la familia).
- No se ha confirmado el soporte de *tool calling* o *function calling* en este modelo específico.
- Capacidades multimodales (visión) en el modelo base, pero no incluidas en el archivo GGUF (se necesitan archivos `mmproj` adicionales).
- El modelo base es multilingüe (140+ idiomas), aunque la model card de este repositorio indica solo inglés.

## Casos de uso

- **Creación de cuantizaciones personalizadas**: el archivo imatrix permite a los desarrolladores generar cuantizaciones GGUF con distintos niveles de precisión (Q2, Q4, Q5, Q6) adaptadas a su hardware, usando herramientas como `llama.cpp`.
- **Despliegue en dispositivos con recursos limitados**: tras cuantizar, el modelo de 2,2B puede ejecutarse en GPUs con 2-4 GB de VRAM o incluso en CPUs, permitiendo aplicaciones de chat y generación de texto en entornos edge.
- **Generación de código en entornos de desarrollo**: el modelo puede asistir en la escritura de código, refactorización o explicación de fragmentos, gracias a su entrenamiento en datos de código.
- **Razonamiento y resolución de problemas**: para tareas de lógica, matemáticas o análisis, el modelo puede generar respuestas coherentes y bien estructuradas en inglés.
- **Análisis de texto y resumen**: útil para resumir documentos largos, extraer información o clasificar texto, aprovechando su ventana de contexto amplia.
- **Experimentación en investigación**: los desarrolladores pueden comparar la calidad de distintas cuantizaciones del mismo modelo y evaluar su rendimiento en tareas específicas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de datos de MMLU, HumanEval, GSM8K u otras evaluaciones para este modelo específico ni para el merge base.

## Requisitos de hardware

- **Inferencia (tras cuantizar)**: para una cuantización Q4_K_M, se estima una necesidad de ~1,5-2 GB de VRAM en GPU o ~4-6 GB de RAM en CPU.
- **GPU recomendadas**: tarjetas con 4 GB o más de VRAM, como GTX 1650, RTX 2060, RTX 3050, RTX 4060, o GPUs profesionales como A10, A100 (para inferencia con mayor precisión).
- **Cuantización**: para generar el archivo GGUF con el imatrix, se necesita una CPU con suficiente RAM (al menos 8 GB) y el software `llama.cpp`.
- **Despliegue**: compatible con `llama.cpp`, `Ollama`, `vLLM` (si se convierte a formato compatible) y otras herramientas que soporten GGUF.
- **Latencia**: en una GPU moderna (RTX 4090) se espera una latencia de <10 ms por token; en CPU, entre 50-100 ms por token, dependiendo de la cuantización.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Gemma 4 E2B (este merge) | 2,2B | 256K | Apache 2.0 con restricciones | GGUF / imatrix |
| Gemma 2 2B | 2,6B | 8K | Gemma license | GGUF |
| Qwen 2.5 1.5B | 1,5B | 32K | Apache 2.0 | GGUF |
| Llama 3.2 1B | 1,2B | 128K | Llama 3.2 license | GGUF |

No se dispone de datos de rendimiento comparativos en la información proporcionada. La ventaja de este modelo es su contexto largo y la posibilidad de cuantización personalizada.

## Limitaciones y advertencias

- **Sesgos y alucinaciones**: al ser un merge no oficial, puede presentar sesgos o alucinaciones más frecuentes que el modelo base de Google.
- **Idioma**: el modelo está entrenado principalmente en inglés; su rendimiento en otros idiomas puede ser limitado.
- **Licencia**: la licencia de Gemma 4 restringe el uso militar y exige el cumplimiento de las políticas de uso aceptable de Google.
- **Calidad del merge**: no hay garantía de que el merge haya mantenido la calidad original del modelo base; se recomienda evaluar antes de usar en producción.
- **Contexto**: aunque la ventana de contexto puede ser de 256K, en la práctica el modelo puede degradarse en contextos muy largos.
- **No es un modelo multimodal**: el archivo GGUF no incluye el proyector de visión; para usar visión se necesitan archivos adicionales.

## Enlaces

- [Repositorio HuggingFace](https://huggingface.co/mradermacher/gemma-4-E2B-Deckard-ShiningValiant3-BF16-i1-GGUF)
- [Modelo base (merge)](https://huggingface.co/nightmedia/gemma-4-E2B-Deckard-ShiningValiant3-BF16)
- [Model card de Gemma 4 (Google AI for Developers)](https://ai.google.dev/gemma/docs/core/model_card_4)
- [Informe técnico de Gemma 4 (arXiv)](https://arxiv.org/pdf/2607.02770)
- [Página de Gemma 4 de DeepMind](https://deepmind.google/models/gemma/gemma-4/)
