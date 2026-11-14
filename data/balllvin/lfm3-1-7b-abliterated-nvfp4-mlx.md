# balllvin/LFM3-1.7B-Abliterated-NVFP4-MLX

## Resumen

LFM3-1.7B-Abliterated-NVFP4-MLX es una versión cuantizada a 4 bits en formato NVFP4 y empaquetada para MLX del modelo orcarouter/LFM3-1.7B-abliterated, que a su vez deriva del LFM3 de 1.700 millones de parámetros de Liquid AI. El autor del artefacto es el usuario balllvin, que publica únicamente la conversión de pesos, no un entrenamiento nuevo. El modelo conserva la arquitectura y el conocimiento del LFM3 original, pero incorpora la modificación "abliterated", que elimina la dirección de rechazo del espacio de activaciones para que el modelo responda a peticiones que el modelo alineado rechazaría.

La relevancia de esta ficha es doble. Por un lado, documenta un caso concreto de cuantización NVFP4 (formato de 4 bits con escala de bloque pensado para GPUs Blackwell) combinada con MLX, el framework de Apple Silicon, lo que permite ejecutar un modelo de 1,7 mil millones de parámetros en equipos con memoria unificada de 8-16 GB. Por otro, sirve como ejemplo de la cadena de derivaciones típica del ecosistema abierto: modelo base, fine-tune abliterado y cuantización de terceros.

El repositorio está restringido (gated) y acumula cero descargas en el momento de la consulta, con licencia LFM Open License v1.0. El contexto, la composición del dataset y los detalles de entrenamiento no están documentados en la información disponible y se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (LFM3 de Liquid AI); detalles internos no disponibles |
| Parametros totales | 1.728.801.536 (1,73 B) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (4 bits), empaquetado para MLX |
| Idiomas soportados | en (inglés) |
| Licencia | LFM Open License v1.0 (etiquetada como "other" en Hugging Face) |
| Formato de pesos | safetensors con custom_code, librería mlx |
| Tamano del repo | 1,8 GB |
| Modelo base | orcarouter/LFM3-1.7B-abliterated |
| Acceso | Restringido (gated), requiere aceptar condiciones |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del LFM3 de Liquid AI, un transformer decoder-only de 1,73 mil millones de parámetros. No se dispone de información sobre el número de capas, dimensiones ocultas, mecanismo de atención ni vocabulario en la documentación proporcionada. Tampoco se documentan los datos de entrenamiento originales (número de tokens, composición del corpus, uso de RLHF o DPO) ni el proceso exacto de "abliteration" aplicado por orcarouter, que habitualmente consiste en identificar la dirección de rechazo en las activaciones y proyectarla fuera de los pesos de las capas finales.

La innovación técnica de este artefacto concreto es la cuantización NVFP4. Este formato de 4 bits utiliza escalas de bloque compartidas y una escala global por tensor, lo que reduce el error de cuantización respecto a esquemas de 4 bits por canal y está optimizado para las unidades tensor de las GPUs Blackwell. El autor lo ha empaquetado con MLX, de modo que los pesos se cargan directamente en el framework de Apple para ejecución en CPU y GPU unificadas de los chips M-series. No hay información sobre calibración, dataset de cuantización ni métricas de degradación respecto al modelo en precisión completa.

## Capacidades

- Generación de texto conversacional en inglés, heredada del LFM3 base.
- Razonamiento general y respuesta a instrucciones de complejidad media, limitado por el tamaño de 1,7 B.
- Generación de código y matemáticas básicas, sin datos de benchmark que lo confirmen.
- Comportamiento "abliterated": el modelo no aplica el filtro de rechazo aprendido durante el alineamiento, por lo que responde a peticiones que el LFM3 alineado declinaría.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multimodales (visión, audio): no disponibles; el pipeline es text-generation.
- Capacidades multilingües: solo inglés según la etiqueta del repositorio.
- Modo "thinking" o razonamiento extendido: no disponible.

## Casos de uso

- Investigación sobre alineamiento y seguridad: el modelo permite estudiar qué respuestas produce un LFM3 sin la dirección de rechazo, comparándolo con el modelo original para analizar el efecto de la abliteración en el comportamiento.
- Evaluación de cuantización NVFP4: sirve como banco de pruebas para medir la pérdida de calidad de NVFP4 frente a FP16 y a otras cuantizaciones de 4 bits en un modelo pequeño, con la ventaja de que el modelo completo cabe en un solo equipo.
- Prototipado local en Apple Silicon: con 1,8 GB de pesos, se puede cargar en un Mac con 8 GB de memoria unificada y usarse para experimentar con pipelines de generación de texto sin depender de la nube.
- Generación de texto creativo sin restricciones: escritura de ficción, guiones o diálogos que requieran contenido que los modelos alineados suelen rechazar, siempre que el uso cumpla la ley y la licencia.
- Docencia y demostraciones de MLX: ejemplo práctico de carga de un modelo custom_code con pesos cuantizados en MLX para explicar el flujo de conversión de safetensors a inferencia en Apple.
- Pruebas de robustez y red teaming: generación de respuestas adversarias para evaluar clasificadores de contenido o filtros de seguridad de terceros.
- Inferencia de bajo coste en edge: despliegue de un chatbot en inglés en dispositivos con poca memoria, aceptando la menor calidad frente a modelos de mayor tamaño.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No constan métricas de MMLU, HumanEval, GSM8K ni comparaciones de perplejidad entre la versión NVFP4 y el modelo base en FP16.

## Requisitos de hardware

- VRAM/memoria estimada: aproximadamente 1,8 GB para los pesos NVFP4, más overhead de activaciones y KV cache; en la práctica, entre 2,5 y 4 GB según longitud de contexto.
- Cabe en GPUs de consumo con 4-6 GB o más (RTX 3050, RTX 4060, RTX 3060) y en cualquier Mac con 8 GB de memoria unificada o superior.
- GPU recomendadas: Apple M1/M2/M3/M4 (MLX es el runtime nativo); en el lado NVIDIA, GPUs Blackwell aprovechan las instrucciones NVFP4, aunque el formato MLX no es directamente compatible con CUDA.
- Despliegue: MLX (mlx-lm) es el runtime previsto; no se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI, ya que los pesos están en NVFP4-MLX y no en GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| LFM3-1.7B-Abliterated-NVFP4-MLX | 1,73 B | no disponible | LFM Open License v1.0 | NVFP4-MLX | Objeto de esta ficha; gated |
| orcarouter/LFM3-1.7B-abliterated | 1,73 B | no disponible | LFM Open License v1.0 | safetensors | Modelo base directo, sin cuantizar |
| LFM3-1.7B (Liquid AI) | 1,73 B | no disponible | LFM Open License v1.0 | safetensors | Modelo original alineado |
| Qwen2.5-1.5B-Instruct | 1,54 B | 32.768 tokens | Apache 2.0 | safetensors, GGUF | Alternativa abierta de tamaño similar con contexto documentado |

La comparación con Qwen2.5 se incluye como referencia de categoría; no se dispone de benchmarks que permitan comparar rendimiento entre ambos en esta información.

## Limitaciones y advertencias

- La abliteración elimina el rechazo aprendido, pero no garantiza la ausencia de contenido dañino ni corrige sesgos del modelo base; puede aumentar la probabilidad de respuestas tóxicas, ilegales o inseguras.
- Riesgo de alucinación elevado por el tamaño reducido (1,7 B) y por la cuantización a 4 bits, que puede degradar la coherencia en tareas de razonamiento largo.
- Solo soporta inglés según la etiqueta del repositorio; no se debe esperar calidad en castellano.
- La licencia LFM Open License v1.0 impone condiciones adicionales al uso comercial; es necesario revisar el texto completo antes de desplegar en producción, y el acceso está restringido en Hugging Face.
- El repositorio tiene cero descargas y cero likes, sin validación de la comunidad; la calidad de la cuantización NVFP4 no está verificada con métricas.
- Los pesos están en formato MLX-NVFP4, lo que limita el despliegue a Apple Silicon o a herramientas que soporten ese formato; no hay GGUF ni compatibilidad directa con vLLM.
- No se documentan la longitud de contexto ni el proceso de entrenamiento, lo que impide planificar el uso en conversaciones de contexto largo.
- El uso de un modelo abliterado puede incumplir los términos de servicio de plataformas que exigen modelos alineados.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/balllvin/LFM3-1.7B-Abliterated-NVFP4-MLX
- Modelo base: https://huggingface.co/orcarouter/LFM3-1.7B-abliterated
- Framework MLX: https://github.com/ml-explore/mlx
- MLX-LM: https://github.com/ml-explore/mlx-lm
- Liquid AI (LFM3): https://www.liquid.ai/
