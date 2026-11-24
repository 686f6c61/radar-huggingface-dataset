# mradermacher/WeMM-Ecom-35B-A3B-GGUF

## Resumen

WeMM-Ecom-35B-A3B-GGUF es la versión cuantizada en formato GGUF del modelo multimodal WeMM-Ecom-35B-A3B publicado por Tencent. El repositorio lo mantiene mradermacher, un conocido publicador de cuantizaciones estáticas de modelos open source, y está pensado para su uso con llama.cpp y herramientas compatibles (Ollama, LM Studio, etc.). El modelo base es un transformer multimodal de tipo Mixture of Experts (MoE) con 34.660.610.688 parámetros totales, orientado a tareas de comercio electrónico y conversación.

La relevancia de esta ficha radica en que permite ejecutar localmente un modelo de aproximadamente 35B parámetros en configuraciones de hardware de consumidor mediante cuantizaciones de 2 a 8 bits, algo imposible con los pesos en precisión completa. Al tratarse de una cuantización del modelo de Tencent, hereda sus capacidades multimodales y su enfoque en dominios de e-commerce, aunque la información pública disponible sobre el modelo base es limitada en este repositorio.

El repositorio tiene un tamaño de 34,3 GB e incluye múltiples variantes de cuantización (Q2_K hasta Q8_0, además de IQ4_XS y F16). No se dispone de datos sobre licencia, idiomas soportados ni pipeline en la información proporcionada, por lo que estos aspectos deben verificarse en el repositorio del modelo original de Tencent antes de un uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE), transformer multimodal (según nombre del modelo base) |
| Parametros totales | 34.660.610.688 (34,66B) |
| Parametros activos | no disponible (el nombre "A3B" sugiere ~3B activos, sin confirmar) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | x-f16, Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, IQ4_XS |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones estáticas); pesos originales en safetensors |

## Arquitectura y entrenamiento

El modelo base WeMM-Ecom-35B-A3B es un transformer con arquitectura Mixture of Experts, según se deduce de la nomenclatura "A3B" (habitual para indicar parámetros activos en modelos MoE) y del tamaño total de 34,66B parámetros. El prefijo "WeMM" y el sufijo "Ecom" apuntan a un modelo multimodal ("We" de WeChat/Multimodal) especializado en comercio electrónico, desarrollado por Tencent. No se dispone de información detallada sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO.

La innovación principal de este repositorio concreto es la cuantización estática realizada con herramientas de llama.cpp (los metadatos indican `quantize_version: 2`, `output_tensor_quantised: 1` y `convert_type: hf`), que permite reducir el peso del modelo desde los ~69 GB en FP16 hasta aproximadamente 34,3 GB en el conjunto del repositorio, con variantes individuales desde ~12 GB (Q2_K) hasta ~37 GB (Q8_0). No se documentan innovaciones arquitectónicas adicionales como decodificación especulativa o atención lineal en la información disponible.

## Capacidades

- Generación de texto conversacional: el tag "conversational" confirma el uso previsto para diálogo multi-turno.
- Capacidades multimodales: el nombre del modelo base ("WeMM") sugiere entrada de imagen además de texto, aunque no se detalla en la información disponible.
- Especialización en comercio electrónico: el sufijo "Ecom" indica entrenamiento o ajuste orientado a tareas de e-commerce (descripción de productos, atención al cliente, recomendación).
- Compatibilidad con endpoints: el tag "endpoints_compatible" indica que puede servirse mediante APIs compatibles con el formato de Hugging Face/OpenAI.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo thinking, visión o audio: no confirmado en la información disponible.

## Casos de uso

- Atención al cliente en comercio electrónico: el modelo puede gestionar conversaciones multi-turno sobre pedidos, devoluciones y productos, aprovechando su ajuste específico al dominio "Ecom". La cuantización Q4_K_M (~20 GB) permite desplegarlo en un servidor con una sola GPU de 24 GB.
- Generación de descripciones de producto: dado un conjunto de atributos o una imagen del artículo, el modelo puede redactar fichas de producto coherentes y atractivas, una tarea para la que el ajuste de dominio resulta ventajoso.
- Clasificación y enrutamiento de consultas: integrado en un pipeline de soporte, el modelo puede categorizar tickets de clientes y derivarlos al equipo adecuado, usando la variante Q8_0 para maximizar fidelidad.
- Despliegue local en estación de trabajo: con la variante Q4_K_S (~18 GB) cabe en una RTX 4090 (24 GB) o en una RTX 3090, permitiendo prototipado sin coste de API.
- Pruebas de concepto en Ollama/LM Studio: la disponibilidad de GGUF permite cargar el modelo directamente en estas herramientas para evaluar su comportamiento antes de invertir en infraestructura.
- Investigación sobre cuantización: al ofrecer 12 variantes de cuantización, el repositorio sirve para estudiar la degradación de calidad de un MoE multimodal según el nivel de compresión.
- Asistente de recomendación de productos: el modelo puede generar recomendaciones personalizadas a partir de historial de compras y catálogo, aprovechando su especialización en e-commerce.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (aproximada, según tamaño de archivo y overhead de contexto):
  - Q2_K: ~12-14 GB
  - Q3_K_M: ~15-17 GB
  - Q4_K_S: ~18-20 GB
  - Q4_K_M: ~20-22 GB
  - Q5_K_M: ~24-26 GB
  - Q6_K: ~28-30 GB
  - Q8_0: ~36-38 GB
  - F16: ~69 GB
- GPU recomendadas:
  - Consumer: RTX 4090 (24 GB) para Q4_K_M o Q5_K_S; RTX 3090 (24 GB) equivalente.
  - Profesional: A100 40 GB o H100 80 GB para Q8_0 o F16.
  - Multi-GPU: necesaria para Q6_K en adelante si no se dispone de 40 GB+.
- Cabe en consumer GPU: sí, hasta Q5_K_M en una GPU de 24 GB; Q6_K y Q8_0 requieren 32 GB o más.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python; servidores compatibles con endpoints (tag "endpoints_compatible"). vLLM y TGI no soportan GGUF de forma nativa en todas sus versiones.
- Latencia y throughput: no disponibles en la información proporcionada. Al ser un MoE con ~3B activos (según nomenclatura), se espera un throughput superior al de un modelo denso de 35B, pero no hay mediciones publicadas.

## Comparativa con modelos similares

No se dispone de información suficiente sobre el modelo base ni sobre alternativas comparables en la información proporcionada para establecer una comparativa rigurosa. Como referencia estructural:

| Modelo | Parámetros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| WeMM-Ecom-35B-A3B (este) | 34,66B (MoE) | no disponible | no disponible | GGUF, safetensors |
| Alternativas MoE ~30-40B | no disponible | no disponible | no disponible | no disponible |

Se recomienda consultar el repositorio del modelo original (tencent/WeMM-Ecom-35B-A3B) para obtener datos comparativos fiables.

## Limitaciones y advertencias

- Licencia no especificada: no se puede confirmar el uso comercial; es imprescindible verificar la licencia del modelo base de Tencent antes de desplegarlo en producción.
- Idiomas no documentados: no hay garantía de calidad en castellano ni en idiomas distintos del inglés o chino; se recomienda evaluar empíricamente.
- Riesgo de alucinación: como todo modelo generativo, puede inventar detalles de productos, precios o políticas; requiere validación en flujos de e-commerce.
- Sesgos: no documentados en la información disponible; al estar entrenado para e-commerce, puede reflejar sesgos de catálogo y de datos de clientes.
- Cuantización agresiva: las variantes Q2_K y Q3_K pueden degradar notablemente la calidad, especialmente en tareas multimodales; se recomienda Q4_K_M o superior para producción.
- Contexto desconocido: sin datos sobre la ventana de contexto, no se puede garantizar el manejo de conversaciones largas o documentos extensos.
- Capacidades multimodales no verificadas en GGUF: la conversión a GGUF puede no preservar el proyector multimodal (mmproj); el autor no indica si se incluye, por lo que la entrada de imágenes podría no funcionar.
- Repositorio con 0 descargas y 0 likes: sin validación comunitaria; el modelo no ha sido probado de forma independiente.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/WeMM-Ecom-35B-A3B-GGUF
- Modelo base: https://huggingface.co/tencent/WeMM-Ecom-35B-A3B
- Perfil del autor de la cuantización: https://huggingface.co/mradermacher
- llama.cpp (runtime recomendado): https://github.com/ggerganov/llama.cpp
- Ollama: https://ollama.com
- LM Studio: https://lmstudio.ai
