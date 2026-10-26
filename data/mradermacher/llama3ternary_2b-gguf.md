# mradermacher/Llama3Ternary_2b-GGUF

## Resumen

`mradermacher/Llama3Ternary_2b-GGUF` es una distribución en formato GGUF del modelo base `CMSManhattan/Llama3Ternary_2b`, un modelo de lenguaje de 2.102.462.464 parámetros con pesos ternarios (BitNet/1,58 bits) según las etiquetas y la nomenclatura del repositorio. La cuantización la mantiene mradermacher, mientras que el modelo base lo publica CMSManhattan; no se trata de un entrenamiento nuevo, sino de un empaquetado estático para inferencia eficiente.

El interés principal está en su tamaño reducido: los archivos GGUF ocupan entre 0,8 GB y 0,9 GB, lo que permite ejecutar un modelo de aproximadamente 2,1 mil millones de parámetros en CPU, equipos con poca VRAM o dispositivos edge. El modelo está orientado a generación de texto y conversación en inglés. No se documentan la longitud de contexto, los datos de entrenamiento ni resultados de benchmarks en la información disponible.

La licencia presenta una discrepancia que debe revisarse antes de cualquier uso comercial: HuggingFace indica `llama3`, mientras que los metadatos internos incluyen `license: bsl-1.0` y `license_name: llama3` con enlace a la licencia de Llama 3. Esta ficha describe la cuantización GGUF, no el modelo original en precisión completa.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo Llama con pesos ternarios (BitNet/1,58 bits), según etiquetas y nomenclatura del repositorio |
| Parámetros totales | 2.102.462.464 |
| Parámetros activos | No aplica; no es un modelo MoE |
| Longitud de contexto | no disponible |
| Tipos de cuantización | TQ1_0 (0,8 GB) y TQ2_0 (0,9 GB); solo cuantizaciones estáticas, sin imatrix/weighted en el repositorio |
| Idiomas soportados | en (inglés) |
| Licencia | llama3 según el campo `license` de HuggingFace; metadatos internos con `license: bsl-1.0` y `license_name: llama3`. Discrepancia por verificar |
| Formato de pesos | GGUF (TQ1_0, TQ2_0); el repositorio no contiene safetensors |
| Modelo base | CMSManhattan/Llama3Ternary_2b |
| Pipeline | text-generation |
| Etiquetas relevantes | llama, ternary, bitnet, 1.58bit, gguf, conversational |

## Arquitectura y entrenamiento

La información disponible describe un modelo de la familia Llama con pesos ternarios, identificado con las etiquetas `ternary`, `bitnet` y `1.58bit`. No se especifica en la model card si el entrenamiento fue ternario desde el inicio o si se aplicó una cuantización ternaria posterior sobre un modelo Llama 3. Tampoco se detallan el número de capas, la dimensión oculta, el mecanismo de atención ni otras particularidades arquitectónicas.

El trabajo de mradermacher consiste en una cuantización estática a GGUF con los tipos TQ1_0 y TQ2_0. No se documentan tokens de entrenamiento, composición del dataset, uso de RLHF/DPO ni innovaciones adicionales como decodificación especulativa o atención lineal. Tampoco hay información sobre el proceso de entrenamiento del modelo base ni sobre evaluación de calidad de las cuantizaciones.

## Capacidades

- Generación de texto en inglés, con pipeline `text-generation` y etiqueta `conversational`.
- Uso previsto para conversación y generación de texto general en inglés.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes, razonamiento multi-paso ni planificación.
- No se documentan capacidades de código, matemáticas, visión, audio ni modo thinking.
- El soporte multilingüe es limitado al inglés según el campo `language: en`.
- No se documenta la longitud de contexto soportada, lo que impide confirmar conversaciones largas o procesamiento de documentos extensos.

## Casos de uso

- Asistente conversacional local en inglés para equipos sin GPU: el modelo puede cargarse con llama.cpp en CPU y responder a interacciones cortas gracias a un archivo de 0,8-0,9 GB.
- Prototipado de aplicaciones LLM en portátiles: sirve para validar prompts, integración con interfaces y flujos de generación antes de migrar a un modelo mayor.
- Investigación en cuantización ternaria: permite comparar TQ1_0 y TQ2_0 en calidad de salida, velocidad y consumo de memoria dentro de un entorno controlado.
- Generación de texto por lotes en CPU: reescritura simple, normalización o borradores en inglés donde no se requiera alta precisión ni contexto largo.
- Despliegue en dispositivos edge o entornos industriales con memoria limitada: FAQ, menús o asistencia textual offline en inglés, siempre con revisión humana.
- Docencia y demostraciones de BitNet/1,58 bits: útil para mostrar inferencia de bajo consumo y explicar el impacto de las cuantizaciones ternarias.
- Preprocesamiento de datos en inglés: resúmenes cortos, etiquetado preliminar o generación de variantes textuales, con control de calidad posterior.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: entre 1 y 2 GB para los pesos TQ1_0/TQ2_0, más la memoria adicional para KV cache y overhead del backend. Con contextos moderados, es razonable reservar 2-3 GB libres; se trata de una estimación a partir del tamaño de archivo, no de una medición publicada.
- GPU recomendadas: no requiere GPU. Puede ejecutarse en CPU y en GPUs de gama baja como GTX 1650 de 4 GB o RTX 3050 de 6 GB. A100, H100 o RTX 4090 están sobredimensionadas para este modelo.
- Cabe en GPU de consumo: sí, en cualquier GPU con al menos 3 GB de VRAM libre, y también en CPU.
- Opciones de despliegue: llama.cpp y derivados compatibles con los tipos TQ1_0/TQ2_0, como llama-cpp-python. KoboldCpp o LM Studio solo si su versión de llama.cpp soporta estos tipos. Ollama requiere verificar compatibilidad con TQ1_0/TQ2_0. vLLM y TGI no están confirmados para estos tipos de cuantización. El repositorio es GGUF, no safetensors para transformers.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de información verificable sobre alternativas comparables en la búsqueda proporcionada. La única referencia directa es el modelo base.

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---:|---|---|---|---|
| mradermacher/Llama3Ternary_2b-GGUF | 2.102.462.464 | no disponible | llama3 / BSL-1.0, con discrepancia | GGUF TQ1_0, TQ2_0 | Cuantización estática del modelo base |
| CMSManhattan/Llama3Ternary_2b | 2.102.462.464 | no disponible | no disponible | no disponible | Modelo base del GGUF |
| Alternativas de 2B ternario | no disponible | no disponible | no disponible | no disponible | No se han identificado datos verificables en la información proporcionada |

## Limitaciones y advertencias

- El modelo está entrenado o orientado únicamente al inglés; no se documenta soporte multilingüe.
- No se conoce la longitud de contexto, por lo que no debe asumirse capacidad para conversaciones largas o documentos extensos.
- Las cuantizaciones TQ1_0 y TQ2_0 son agresivas; pueden degradar la calidad respecto al modelo base y no hay evaluación publicada de perplejidad o benchmarks.
- No se documentan datos de entrenamiento, evaluación de sesgos, alineamiento ni medidas de seguridad.
- Riesgo de alucinación inherente a los modelos generativos; no se han publicado evaluaciones específicas.
- La licencia es contradictoria en los metadatos: `llama3` frente a `bsl-1.0`. La licencia de Llama 3 establece condiciones específicas; es obligatorio revisar el texto oficial antes de uso comercial.
- El repositorio muestra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria visible.
- No se documentan tool calling, agentes ni razonamiento multi-paso; no debe asumirse su uso en pipelines que dependan de estas capacidades.
- No usar en decisiones críticas, atención al cliente sin supervisión ni producción sin una evaluación propia de calidad, sesgos y seguridad.

## Enlaces

- [HuggingFace: mradermacher/Llama3Ternary_2b-GGUF](https://huggingface.co/mradermacher/Llama3Ternary_2b-GGUF)
- [Modelo base: CMSManhattan/Llama3Ternary_2b](https://huggingface.co/CMSManhattan/Llama3Ternary_2b)
- [Página de cuantizaciones de mradermacher para este modelo](https://hf.tst.eu/model#Llama3Ternary_2b-GGUF)
- [GGUF TQ1_0](https://huggingface.co/mradermacher/Llama3Ternary_2b-GGUF/resolve/main/Llama3Ternary_2b.TQ1_0.gguf)
- [GGUF TQ2_0](https://huggingface.co/mradermacher/Llama3Ternary_2b-GGUF/resolve/main/Llama3Ternary_2b.TQ2_0.gguf)
- [Licencia de Llama 3](https://www.llama.com/llama3/license/)
- [Documentación de modelos GGUF en llama.cpp](https://github.com/ggml-org/llama.cpp/blob/master/docs/models.md)
- [Solicitudes de cuantización de mradermacher](https://huggingface.co/mradermacher/model_requests)
