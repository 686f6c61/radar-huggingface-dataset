# mradermacher/CIG-9B-IPR-GGUF

## Resumen

CIG-9B-IPR-GGUF es una colección de cuantizaciones estáticas en formato GGUF del modelo base CodeImageGen/CIG-9B-IPR, publicada por el usuario mradermacher. El repositorio no contiene un modelo entrenado desde cero, sino una conversión y cuantización del modelo original a varios niveles de precisión para facilitar su ejecución en hardware modesto mediante llama.cpp y herramientas compatibles. El modelo base cuenta con 9.197.093.888 parámetros (aproximadamente 9,2 mil millones), lo que lo sitúa en la gama de modelos de tamaño medio.

La relevancia de esta ficha es práctica: el repositorio ofrece 12 variantes de cuantización (desde Q2_K hasta F16, además de IQ4_XS), lo que permite desplegar el modelo en GPUs de consumo con distintos compromisos de memoria y calidad. El tamaño total del repositorio es de 65,4 GB, lo que refleja la suma de todas las variantes incluidas.

No se dispone de información pública en la model card sobre la arquitectura del modelo base, los datos de entrenamiento, los idiomas soportados ni la licencia. La información disponible se limita a los metadatos de la cuantización y al recuento de parámetros verificado en safetensors del modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 9.197.093.888 (~9,2 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K, IQ4_XS |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones estáticas); modelo base presumiblemente en safetensors |

## Arquitectura y entrenamiento

No se ha publicado en la información disponible ningún detalle sobre la arquitectura del modelo base CIG-9B-IPR: ni el tipo de transformer, ni si emplea atención lineal, mezcla de expertos o alguna variante híbrida. Tampoco se documentan el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de alineación como RLHF o DPO.

Respecto al proceso de cuantización, la model card indica los metadatos `quantize_version: 2`, `output_tensor_quantised: 1` y `convert_type: hf`, lo que sugiere una conversión desde pesos en formato Hugging Face (probablemente safetensors) mediante la herramienta de cuantización de llama.cpp. No se indica si se preservó el tensor `mmproj` (proyección multimodal), lo que apunta a que el modelo base es probablemente solo de texto, aunque este extremo no se confirma.

## Capacidades

- Generación de texto conversacional: la etiqueta `conversational` del repositorio sugiere que el modelo está orientado a diálogo multi-turno.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` indica que puede servirse a través de infraestructuras de inferencia estándar.
- Ejecución local mediante llama.cpp y derivados (Ollama, LM Studio, etc.) gracias al formato GGUF.
- Capacidades específicas de razonamiento, código, matemáticas, visión, tool calling o agentes: no disponibles en la información proporcionada.
- Soporte multilingüe: no disponible.

## Casos de uso

- Despliegue local en estación de trabajo: con la variante Q4_K_M (aproximadamente 5-6 GB), el modelo puede ejecutarse en una GPU de consumo de 8 GB de VRAM, lo que permite prototipar aplicaciones conversacionales sin depender de servicios en la nube.
- Servicio de chat interno: la etiqueta `conversational` y la compatibilidad con endpoints permiten montar un servidor de inferencia con llama.cpp o vLLM (si soporta GGUF) para un asistente de uso interno en equipos pequeños.
- Evaluación comparativa de cuantizaciones: el repositorio incluye 12 variantes, lo que facilita medir la degradación de calidad entre Q2_K y F16 para decidir el punto óptimo de despliegue en un proyecto concreto.
- Integración en aplicaciones de escritorio: herramientas como LM Studio o Jan pueden cargar directamente los ficheros GGUF, permitiendo incorporar el modelo a asistentes locales sin backend adicional.
- Pruebas de concepto en CPU: las variantes Q2_K y Q3_K_S reducen el peso a unos 3-4 GB, lo que permite inferencia en CPU con RAM moderada para tareas de baja latencia no crítica.
- Fine-tuning ligero o destilación: aunque el repositorio es de inferencia, los pesos F16 pueden servir como referencia para comparar salidas frente a un modelo ajustado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (aproximada, según el tamaño de cada cuantización):
  - F16: ~18,4 GB (2 bytes por parámetro).
  - Q8_0: ~9,8 GB.
  - Q6_K: ~7,6 GB.
  - Q5_K_M: ~6,6 GB.
  - Q4_K_M: ~5,6 GB.
  - Q3_K_M: ~4,5 GB.
  - Q2_K: ~3,4 GB.
- GPU recomendadas: para F16 y Q8_0, A100 40 GB, H100 o RTX 4090 (24 GB); para Q4_K_M y Q5_K_M, RTX 4090, RTX 4080, RTX 3090 o RTX 4070 Ti; para Q3_K_M y Q2_K, RTX 3060 12 GB, RTX 4060 Ti 16 GB o incluso GPUs de 8 GB.
- Cabe en GPU de consumo: sí, en la mayoría de variantes Q4 y Q3; la F16 requiere una GPU de 24 GB o más.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, Jan, text-generation-webui y servidores compatibles con GGUF. vLLM y TGI no soportan GGUF de forma nativa en todas sus versiones, por lo que habría que verificar compatibilidad.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| CIG-9B-IPR-GGUF | ~9,2 B | no disponible | no disponible | GGUF | Hugging Face |
| Alternativas de ~9 B | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información suficiente sobre el modelo base ni sobre alternativas comparables en la documentación proporcionada para establecer una comparativa rigurosa con modelos de la misma categoría.

## Limitaciones y advertencias

- La licencia no está indicada en el repositorio, por lo que no se puede confirmar si el uso comercial está permitido. Es imprescindible consultar la licencia del modelo base (CodeImageGen/CIG-9B-IPR) antes de cualquier despliegue en producción.
- No se documentan los idiomas soportados; el rendimiento en castellano es desconocido y podría ser deficiente si el modelo base se entrenó predominantemente en inglés.
- No se dispone de información sobre sesgos, alineación o seguridad del modelo base.
- Riesgo de alucinación: inherente a los modelos de lenguaje de esta escala; no hay evaluaciones publicadas que lo cuantifiquen.
- Las cuantizaciones de baja precisión (Q2_K, Q3_K_S) pueden degradar notablemente la calidad de las respuestas; se recomienda Q4_K_M o superior para uso en producción.
- El repositorio no incluye información sobre tool calling, agentes ni capacidades multimodales; no debe asumirse su disponibilidad.
- El tamaño del repositorio (65,4 GB) implica descargas largas; conviene descargar solo el fichero de la cuantización deseada.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/CIG-9B-IPR-GGUF
- Modelo base: https://huggingface.co/CodeImageGen/CIG-9B-IPR
- Perfil del autor de la cuantización: https://huggingface.co/mradermacher
