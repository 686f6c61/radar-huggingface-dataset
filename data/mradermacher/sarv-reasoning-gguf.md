# mradermacher/sarv-reasoning-GGUF

## Resumen

El modelo `sarv-reasoning-GGUF` es una cuantización en formato GGUF del modelo `artindnr/sarv-reasoning`, un modelo de lenguaje especializado en persa (farsi) con capacidades de razonamiento, generación de poesía y cadena de pensamiento (chain-of-thought). La cuantización ha sido realizada por mradermacher, un conocido proveedor de modelos GGUF, para permitir su ejecución en entornos locales con recursos limitados.

El modelo base está diseñado para tareas de razonamiento y generación de texto en persa, con soporte para poesía y conversación. Según las etiquetas del repositorio, utiliza una arquitectura basada en GPT-OSS con mezcla de expertos (mixture of experts) y cuantización interna mxfp4, lo que sugiere un diseño eficiente para inferencia. La licencia Apache-2.0 permite uso comercial sin restricciones significativas.

La relevancia de esta versión GGUF radica en que facilita el despliegue local del modelo en hardware de consumo, algo especialmente útil para desarrolladores e investigadores que trabajan con persa y necesitan ejecutar el modelo sin depender de servicios en la nube. El repositorio incluye múltiples niveles de cuantización, desde Q2_K hasta Q8_0, lo que permite ajustar el equilibrio entre calidad y consumo de memoria.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-OSS (mixture of experts) según etiquetas; no se especifica detalle adicional |
| Parametros totales | no disponible |
| Parametros activos | no disponible (modelo MoE, pero sin cifra) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, IQ4_XS |
| Idiomas soportados | fa (persa/farsi) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (archivos .gguf) |

## Arquitectura y entrenamiento

El modelo base `sarv-reasoning` emplea una arquitectura tipo GPT-OSS con mezcla de expertos (MoE), según las etiquetas del repositorio. También se menciona el uso de cuantización interna mxfp4, lo que indica que el modelo original ya está optimizado para reducir el uso de memoria durante la inferencia. No se dispone de información detallada sobre el número total de parámetros, la composición del dataset de entrenamiento ni el proceso de alineación (RLHF, DPO, etc.). El modelo está entrenado específicamente para persa, con énfasis en razonamiento, cadena de pensamiento y generación de poesía.

La cuantización GGUF realizada por mradermacher convierte los pesos originales a este formato para su uso con herramientas como llama.cpp, Ollama o vLLM. Se ofrecen múltiples niveles de cuantización, desde Q2_K (12.2 GB) hasta Q8_0 (22.4 GB), lo que permite elegir entre menor huella de memoria o mayor fidelidad. No se han publicado detalles sobre el proceso de entrenamiento, como el número de tokens o la metodología de ajuste fino.

## Capacidades

- Generación de texto en persa (farsi) con alta calidad lingüística.
- Razonamiento y resolución de problemas mediante cadena de pensamiento (chain-of-thought).
- Generación de poesía persa, incluyendo formatos clásicos como ghazal o rubaiyat.
- Conversación multi-turno en persa, adecuada para asistentes virtuales.
- Soporte de razonamiento lógico y matemático básico (no confirmado explícitamente, pero implícito en la etiqueta "reasoning").
- No se menciona soporte de tool calling, function calling ni capacidades multimodales (visión, audio).

## Casos de uso

- Asistente conversacional en persa: el modelo puede mantener diálogos naturales en farsi, útil para chatbots de atención al cliente o asistentes personales dirigidos a hablantes de persa.
- Generación de poesía persa: escritores y poetas pueden usarlo para crear versos en estilos tradicionales, explorando métricas y rimas propias del persa.
- Herramientas educativas de lengua persa: puede generar ejercicios de comprensión lectora, redacción o práctica de gramática para estudiantes de farsi.
- Razonamiento y análisis de texto: dado su enfoque en chain-of-thought, puede descomponer problemas complejos en pasos lógicos, útil para tareas de análisis o planificación.
- Traducción y adaptación de contenido al persa: aunque no está diseñado específicamente para traducción, puede reformular o adaptar textos al farsi con naturalidad.
- Investigación en procesamiento de lenguaje natural (PLN) para persa: sirve como modelo base para experimentos de fine-tuning o evaluación de tareas específicas en este idioma.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de datos sobre MMLU, HumanEval, GSM8K u otras pruebas estandarizadas para este modelo.

## Requisitos de hardware

- Para la cuantización Q4_K_M (15.9 GB), se estima que se necesitan al menos 20 GB de VRAM para inferencia con contexto moderado. Una GPU como la RTX 4090 (24 GB) o la A100 (40 GB) sería adecuada.
- La cuantización Q2_K (12.2 GB) podría caber en GPUs con 16 GB de VRAM, como la RTX 4080 o la RTX 3090, aunque con mayor pérdida de calidad.
- Para la Q8_0 (22.4 GB), se recomienda una GPU con al menos 24 GB de VRAM, como la RTX 4090 o la A100.
- En CPU, se puede ejecutar con llama.cpp u Ollama, pero la velocidad será significativamente menor; se recomienda al menos 32 GB de RAM para las cuantizaciones más grandes.
- Opciones de despliegue: llama.cpp, Ollama, vLLM (con adaptador GGUF), text-generation-inference (TGI) si se convierte a otro formato.
- La latencia y el throughput dependen del hardware y la cuantización; no se dispone de cifras oficiales.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables específicos en el contexto de persa y razonamiento. Se podría mencionar que existen otros modelos persas como Aya (Cohere) o modelos multilingües como Qwen, pero no hay datos de rendimiento comparativo disponibles en la información proporcionada. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente en persa; no se recomienda su uso en otros idiomas, ya que el rendimiento será deficiente.
- No se han documentado sesgos específicos, pero al ser un modelo entrenado con datos de internet, puede reflejar sesgos culturales o de género presentes en el corpus persa.
- Riesgo de alucinación: como todo modelo de lenguaje, puede generar información falsa o inventada, especialmente en tareas de razonamiento complejo.
- La longitud de contexto no está especificada; se desconoce si soporta ventanas largas, lo que limita su uso en tareas que requieran mucho contexto.
- La licencia Apache-2.0 permite uso comercial, pero se debe verificar que el modelo base no tenga restricciones adicionales (no se indica ninguna).
- Las cuantizaciones de menor tamaño (Q2_K, Q3_K) pueden degradar significativamente la calidad de salida, especialmente en tareas de razonamiento.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/sarv-reasoning-GGUF
- Modelo base: https://huggingface.co/artindnr/sarv-reasoning
- Cuantizaciones con imatrix: https://huggingface.co/mradermacher/sarv-reasoning-i1-GGUF
- Página de solicitudes de modelos de mradermacher: https://huggingface.co/mradermacher/model_requests
