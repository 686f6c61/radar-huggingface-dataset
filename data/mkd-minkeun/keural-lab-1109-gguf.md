# mkd-minkeun/Keural-Lab-1109-GGUF

## Resumen

Keural-Lab-1109-GGUF es la versión cuantizada en formato GGUF del modelo Keural-Lab-1109, publicada por el usuario mkd-minkeun. Se trata de una conversión pensada para su ejecución con llama.cpp, distribuyendo los pesos en un único fichero Q4_K_M de 29,3 GB. El modelo base cuenta con 47.985.886.080 parámetros (aproximadamente 48.000 millones), según los datos de safetensors del repositorio original.

La model card indica que el modelo deriva de Qwen3.6-35B-A3B, una referencia que sugiere una arquitectura Mixture of Experts (MoE) con unos 35.000 millones de parámetros totales y 3.000 millones activos por token, aunque esta correspondencia no está confirmada de forma explícita en la información disponible. La licencia declarada es Apache 2.0, lo que facilita su uso comercial y su integración en productos derivados.

Su relevancia práctica reside en que ofrece una vía de despliegue local de un modelo de gran tamaño mediante cuantización de 4 bits, compatible con llama.cpp y con la API compatible de endpoints. La información pública es muy limitada: no hay datos de benchmarks, idiomas soportados ni detalles de entrenamiento, por lo que las evaluaciones deben hacerse por cuenta del usuario.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base derivado de Qwen3.6-35B-A3B, presumiblemente MoE; no confirmado) |
| Parámetros totales | 47.985.886.080 (~48 B) |
| Parámetros activos | no disponible (la referencia a Qwen3.6-35B-A3B sugiere ~3 B activos, sin confirmar) |
| Longitud de contexto | 32.768 tokens (según el ejemplo de uso con `-c 32768` en la model card) |
| Tipos de cuantización | Q4_K_M (único fichero publicado) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo base Keural-Lab-1109. La model card únicamente indica que es un derivado de Qwen3.6-35B-A3B, lo que apunta a una arquitectura transformer con mezcla de expertos (MoE), pero no se confirma el número de expertos, la estrategia de enrutamiento ni la proporción de parámetros activos. Tampoco se especifican la composición del dataset de entrenamiento, el número de tokens procesados ni si se aplicaron fases de RLHF, DPO o ajuste supervisado.

La innovación técnica documentada se limita al proceso de cuantización: la conversión a GGUF con el método Q4_K_M, que combina cuantización de 4 bits en la mayoría de las capas con bloques de mayor precisión en capas sensibles, reduciendo el peso del modelo hasta los 29,3 GB. El ejemplo de la model card emplea `llama-server` con la opción `--jinja`, lo que habilita el uso de plantillas de chat Jinja para el formateo de conversaciones.

## Capacidades

- Generación de texto conversacional: el tag `conversational` y la plantilla Jinja indican soporte para diálogos multi-turno.
- Generación de texto general: pipeline declarado como `text-generation`.
- Compatibilidad con endpoints: el tag `endpoints_compatible` sugiere integración con la infraestructura de inferencia de Hugging Face.
- Ejecución local mediante llama.cpp: el formato GGUF permite su uso con `llama-server`, `llama-cli` y herramientas compatibles.
- Capacidades de razonamiento, código, matemáticas, visión, audio o tool calling: no disponibles en la información proporcionada.
- Capacidades multilingües: no disponibles; no se enumeran idiomas en la ficha.

## Casos de uso

- Despliegue local de un modelo conversacional de gran tamaño: con 29,3 GB en Q4_K_M, puede ejecutarse en estaciones de trabajo con suficiente memoria unificada o VRAM, sirviendo como asistente privado sin dependencia de APIs externas.
- Prototipado de aplicaciones de chat: `llama-server` expone una API compatible con OpenAI, lo que permite integrar el modelo en aplicaciones existentes con cambios mínimos en el código cliente.
- Evaluación comparativa de modelos cuantizados: útil para medir la pérdida de calidad de Q4_K_M frente a los pesos originales en tareas concretas del dominio del usuario.
- Procesamiento de documentos con contexto medio: la ventana de 32.768 tokens permite resumir o analizar documentos de decenas de páginas en una sola pasada.
- Generación de texto en entornos con requisitos de licencia permisiva: la licencia Apache 2.0 facilita su incorporación en productos comerciales sin obligaciones de copyleft.
- Investigación sobre MoE y cuantización: al derivar presumiblemente de una arquitectura MoE, sirve para estudiar el comportamiento de modelos con parámetros activos reducidos bajo cuantización de 4 bits.
- Automatización de tareas de redacción y reescritura: generación de borradores, resúmenes y transformaciones de texto en pipelines por lotes con llama.cpp.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el fichero Q4_K_M ocupa 29,3 GB; se recomienda un mínimo de 32 GB de VRAM o memoria unificada para cargar el modelo completo, y 36-40 GB para dejar margen a la caché KV con contextos largos.
- GPU recomendadas: A100 40 GB, A100 80 GB, H100 80 GB, RTX A6000 48 GB. En GPUs de 24 GB (RTX 4090, RTX 3090) no cabe el modelo completo en VRAM; sería necesario el offloading parcial a RAM del sistema, con la consiguiente penalización de velocidad.
- Cabe en GPU de consumo: solo en configuraciones con memoria unificada grande (por ejemplo, Apple Silicon con 48 GB o más) o mediante offloading parcial en GPUs de 24 GB.
- Opciones de despliegue: llama.cpp (`llama-server`, `llama-cli`), Ollama (previa importación del GGUF) y cualquier frontend compatible con GGUF. No se documenta soporte para vLLM o TGI en formato GGUF.
- Latencia y throughput: no disponibles; dependerán del hardware, del grado de offloading y de la longitud de contexto.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Keural-Lab-1109-GGUF | ~48 B totales | 32.768 | Apache 2.0 | GGUF Q4_K_M | Sin benchmarks publicados |
| Modelo base Keural-Lab-1109 | ~48 B totales | no disponible | Apache 2.0 | safetensors | Pesos originales sin cuantizar |
| Qwen3.6-35B-A3B (referencia citada) | ~35 B totales, ~3 B activos (según la referencia) | no disponible | Apache 2.0 | no disponible | Modelo del que deriva según la model card |
| Alternativas de tamaño similar | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables para comparar rendimiento |

## Limitaciones y advertencias

- Información pública muy escasa: no hay benchmarks, idiomas declarados ni detalles de entrenamiento, lo que impide evaluar su calidad sin pruebas propias.
- La correspondencia con Qwen3.6-35B-A3B no está verificada y el número de parámetros totales (48 B) no coincide con los 35 B de la referencia, por lo que la arquitectura exacta es incierta.
- Riesgo de alucinación: inherente a los modelos generativos; no se documentan mitigaciones específicas.
- Sesgos: no se documenta ninguna evaluación de sesgos ni de seguridad.
- Pérdida de precisión por cuantización Q4_K_M: puede degradar tareas sensibles a la precisión numérica o al razonamiento fino.
- Limitación de contexto: 32.768 tokens según el ejemplo de la model card; no se confirma si el modelo base soporta ventanas mayores.
- Uso comercial: permitido por Apache 2.0, pero conviene verificar las condiciones del modelo base y de los datos de entrenamiento, no documentadas.
- Repositorio sin descargas ni interacciones: no hay evidencia de validación por parte de la comunidad.

## Enlaces

- Modelo GGUF en Hugging Face: https://huggingface.co/mkd-minkeun/Keural-Lab-1109-GGUF
- Modelo base en Hugging Face: https://huggingface.co/mkd-minkeun/Keural-Lab-1109
- Repositorio de llama.cpp: https://github.com/ggml-org/llama.cpp
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
