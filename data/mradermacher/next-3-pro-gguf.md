# mradermacher/Next-3-Pro-GGUF

## Resumen

Next-3-Pro es un modelo de lenguaje multimodal (vision-language) desarrollado por el usuario thelamapi y publicado en Hugging Face. La versión aquí descrita es una cuantización GGUF estática realizada por mradermacher, un conocido cuantizador de la comunidad. El modelo base tiene 26.895.998.464 parámetros (aproximadamente 26,9 mil millones), lo que lo sitúa en la categoría de modelos de tamaño medio-grande, adecuado para despliegues en servidores con GPU de gama alta o configuraciones multi-GPU.

El modelo está orientado a tareas de razonamiento, generación de código, uso de herramientas (tool use) y contexto largo, según las etiquetas de la model card. Soporta los idiomas inglés y turco, y ha sido entrenado o ajustado con los datasets GSM8K (matemáticas) y MBPP (programación). Su naturaleza multimodal indica que puede procesar imágenes además de texto, aunque la información disponible no detalla la arquitectura exacta de la torre de visión.

La relevancia de esta ficha radica en que ofrece una alternativa cuantizada en GGUF para ejecución local o en entornos con recursos limitados, manteniendo las capacidades del modelo original. Sin embargo, la ausencia de datos sobre licencia, benchmarks y arquitectura interna limita la evaluación rigurosa de su rendimiento frente a competidores.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo multimodal vision-language basado en transformers) |
| Parametros totales | 26.895.998.464 (≈26,9 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (etiqueta "long-context" sin cifra) |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | inglés (en), turco (tr) |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones estáticas); el modelo base en safetensors |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo base (thelamapi/next3-pro). Las etiquetas indican que es un modelo multimodal vision-language, instruction-tuned, con capacidades de razonamiento, coding, tool-use y long-context. Se desconoce si emplea un transformer denso, MoE o una arquitectura híbrida, así como el número de tokens de entrenamiento, la composición del dataset o si se aplicaron técnicas de RLHF/DPO.

Los datasets mencionados en la model card son openai/gsm8k y google-research-datasets/mbpp, lo que sugiere un enfoque en matemáticas y programación. No se especifican innovaciones técnicas como decodificación especulativa, atención lineal o mecanismos de thinking mode. La cuantización GGUF realizada por mradermacher es estática (quantize_version: 2) y se ofrece también una versión con imatrix (i1) en un repositorio separado.

## Capacidades

- Generación de texto y razonamiento general, con énfasis en tareas de matemáticas (GSM8K) y programación (MBPP).
- Capacidades multimodales: procesamiento de imágenes junto con texto (vision-language).
- Soporte de tool calling / function calling, según la etiqueta "tool-use".
- Orientación a agentes y razonamiento multi-paso (etiqueta "reasoning").
- Contexto largo (etiqueta "long-context"), aunque sin cifra concreta.
- Multilingüe limitado a inglés y turco.
- Instruction-tuned, lo que implica ajuste para seguir instrucciones conversacionales.
- Compatible con endpoints (etiqueta "endpoints_compatible").

## Casos de uso

- **Asistencia en programación**: el modelo puede generar y completar código en inglés o turco, integrándose en editores o pipelines de CI/CD para sugerencias y revisiones automáticas, gracias a su entrenamiento con MBPP y su soporte de tool calling.
- **Resolución de problemas matemáticos**: adecuado para tutores automáticos o sistemas de verificación de ejercicios, dado su ajuste con GSM8K.
- **Atención al cliente multimodal**: puede gestionar conversaciones multi-turno con contexto largo e interpretar imágenes enviadas por el usuario (por ejemplo, capturas de pantalla o fotos de productos) para ofrecer respuestas contextualizadas.
- **Automatización de agentes**: su soporte de tool use y razonamiento multi-paso permite construir agentes que consulten APIs, ejecuten funciones y encadenen acciones en flujos de trabajo.
- **Análisis de documentos con imágenes**: extracción de información de facturas, gráficos o diagramas combinando texto e imagen, útil en entornos de back-office.
- **Despliegue local en estaciones de trabajo**: las cuantizaciones GGUF (desde Q2_K hasta Q8_0) permiten ejecutar el modelo en hardware de consumo o servidores modestos mediante llama.cpp u Ollama, facilitando prototipado sin depender de la nube.
- **Traducción y generación bilingüe inglés-turco**: para contenidos o soporte en esos dos idiomas, aunque no se garantiza calidad en otros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- **VRAM estimada para inferencia** (según tamaño de cuantización):
  - Q2_K: ~11,2 GB
  - Q3_K_S: ~12,2 GB; Q3_K_M: ~13,6 GB; Q3_K_L: ~14,8 GB
  - IQ4_XS: ~15,5 GB; Q4_K_S: ~15,7 GB; Q4_K_M: ~16,8 GB
  - Q5_K_S: ~18,8 GB; Q5_K_M: ~19,4 GB
  - Q6_K: ~22,2 GB
  - Q8_0: ~28,7 GB
- **GPU recomendadas**: para cuantizaciones Q4/Q5, una RTX 4090 (24 GB) o A100 40 GB; para Q8_0, A100 40 GB o H100. Para Q2/Q3, tarjetas de 16 GB (RTX 4080, A4000) pueden ser suficientes.
- **¿Cabe en consumer GPU?**: sí, las cuantizaciones Q2 a Q5 caben en GPUs de 16-24 GB (RTX 4080/4090). Q6 y Q8 requieren 24 GB o más; Q8_0 en 24 GB es ajustado y puede requerir offloading parcial a CPU.
- **Opciones de despliegue**: llama.cpp, Ollama, y cualquier runtime compatible con GGUF (koboldcpp, LM Studio). Para el modelo base en safetensors, vLLM o TGI si se dispone de los pesos originales.
- **Latencia y throughput**: no disponibles. Dependerán del hardware y la cuantización; a modo orientativo, un modelo de ~27B en Q4_K_M en una RTX 4090 suele generar decenas de tokens por segundo, pero no hay datos oficiales.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa rigurosa con modelos de la misma categoría (multimodales de ~27B). Se indica "no disponible" al no conocerse benchmarks ni especificaciones del modelo base. Como referencia genérica, modelos como Qwen2.5-VL-32B o InternVL2.5-26B ocupan un espacio similar, pero no se pueden comparar sin datos de rendimiento de Next-3-Pro.

| Modelo | Parámetros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| Next-3-Pro (este) | ~26,9 B | no disponible | no disponible | GGUF |
| Qwen2.5-VL-32B | ~32 B | 128k (típico) | Apache 2.0 (según versión) | safetensors, GGUF |
| InternVL2.5-26B | ~26 B | 32k-128k | MIT (según versión) | safetensors |

*Nota: los datos de los modelos comparativos son orientativos y pueden variar; no se han verificado contra la información proporcionada.*

## Limitaciones y advertencias

- **Licencia desconocida**: no se especifica la licencia del modelo base ni de la cuantización, lo que impide confirmar si se permite uso comercial. Es imprescindible contactar con el autor original antes de producción.
- **Idiomas limitados**: solo inglés y turco; el rendimiento en castellano u otros idiomas no está garantizado y probablemente sea deficiente.
- **Riesgo de alucinación**: como todo modelo generativo, puede inventar información, especialmente en tareas de razonamiento o con contexto largo.
- **Sesgos**: no se documentan sesgos conocidos, pero al no haber información sobre el dataset de entrenamiento, no se pueden evaluar.
- **Contexto largo sin cifra**: la etiqueta "long-context" no concreta la ventana real; podría degradarse en secuencias muy largas.
- **Multimodalidad no verificada**: aunque se etiqueta como vision-language, no se detalla la resolución de imagen soportada ni el proceso de alineación.
- **Cuantizaciones de baja calidad**: Q2_K y Q3_K_M pueden degradar notablemente el rendimiento; se recomienda Q4_K_M o superior para uso serio.
- **Falta de benchmarks**: sin datos objetivos, la evaluación de capacidades es especulativa.
- **Repositorio con 0 likes y 1052 descargas**: indica baja validación comunitaria; usar con cautela.

## Enlaces

- [Hugging Face: mradermacher/Next-3-Pro-GGUF](https://huggingface.co/mradermacher/Next-3-Pro-GGUF)
- [Modelo base: thelamapi/next3-pro](https://huggingface.co/thelamapi/next3-pro)
- [Cuantizaciones con imatrix (i1)](https://huggingface.co/mradermacher/Next-3-Pro-i1-GGUF)
- [Página de resumen de cuantizaciones](https://hf.tst.eu/model#Next-3-Pro-GGUF)
- [Guía de uso de GGUF (ejemplo de TheBloke)](https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF)
- [Gráfico comparativo de cuantizaciones (ikawrakow)](https://www.nethype.de/huggingface_embed/quantpplgraph.png)
- [Notas de Artefact2 sobre cuantizaciones](https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9)
- [FAQ y solicitudes de cuantización de mradermacher](https://huggingface.co/mradermacher/model_requests)
