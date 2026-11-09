# ggml-org/vllm-d3-GGUF

## Resumen

vllm-d3 es un modelo de decisión multimodal (image-text-to-text) desarrollado por vllm-sr y distribuido en formato GGUF cuantizado por ggml-org. Con aproximadamente 26.900 millones de parámetros totales, el modelo está diseñado para ser invocado a través de un endpoint específico `/v1/systemone` en lugar de la generación de texto convencional, lo que lo sitúa en una categoría funcional distinta a la de los LLM generativos al uso. Su pipeline declarado es image-text-to-text, por lo que acepta tanto texto como imágenes como entrada.

La relevancia de esta ficha radica en que se trata de una conversión automática del modelo original vllm-sr/d3 al formato GGUF mediante la herramienta ggml-org/convert, pensada para su ejecución local con llama.cpp y con la aplicación Llama. La licencia Apache 2.0 facilita su integración en productos comerciales, aunque su naturaleza de "decision model" implica que su uso previsto no es el de un asistente conversacional general, sino el de un componente que emite decisiones dentro de un pipeline.

La información pública disponible es limitada: no se detallan los idiomas soportados, la longitud de contexto ni los datos de entrenamiento. El repositorio ocupa 307 GB, lo que refleja un conjunto amplio de cuantizaciones sobre un modelo base de casi 27.000 millones de parámetros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 26.895.998.464 (~26,9 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF cuantizado (variantes concretas no disponibles) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo de 307 GB con multiples cuantizaciones) |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura interna del modelo en la documentación disponible. El modelo base es vllm-sr/d3, del cual esta versión GGUF es una conversión automática realizada con la herramienta ggml-org/convert. No se especifican el tipo de transformer, la composición del dataset de entrenamiento, el número de tokens vistos ni si se aplicaron técnicas de alineación como RLHF o DPO.

La única innovación técnica documentada es funcional, no arquitectónica: el modelo se invoca mediante el endpoint `/v1/systemone`, definido en la pull request 30383 del repositorio llama.cpp. Esto sugiere una integración específica en el servidor de llama.cpp para modelos de decisión, distinta del endpoint estándar de chat completions.

## Capacidades

- Procesamiento multimodal de imagen y texto como entrada (pipeline image-text-to-text).
- Emisión de decisiones a través del endpoint dedicado `/v1/systemone`, en lugar de generación de texto libre.
- Ejecución local mediante llama.cpp y la aplicación Llama (`llama serve -hf ggml-org/vllm-d3-GGUF`).
- Compatibilidad con endpoints de Hugging Face para despliegue en un clic.
- Soporte conversacional declarado en las etiquetas del repositorio.
- Capacidades de tool calling, agentes, razonamiento multi-paso, matemáticas o código: no disponibles en la información proporcionada.

## Casos de uso

- Enrutamiento y clasificación de peticiones: el modelo puede actuar como componente de decisión que recibe una entrada (texto o imagen) y emite una etiqueta o acción, integrándose en un servidor llama.cpp mediante `/v1/systemone`.
- Moderación de contenido multimodal: al aceptar imagen y texto, puede emplearse para decidir si una combinación de ambos cumple una política definida antes de pasarla a un modelo generativo mayor.
- Pre-filtrado en pipelines de agentes: usar el modelo como primera etapa que decide si una consulta requiere invocar herramientas externas o puede resolverse con el modelo principal, reduciendo coste computacional.
- Despliegue en local para prototipos: gracias al formato GGUF y a la licencia Apache 2.0, es adecuado para pruebas en máquinas propias sin dependencia de APIs en la nube.
- Automatización de flujos con intervención humana mínima: decisiones binarias o de categoría sobre documentos escaneados o capturas, siempre que se valide el comportamiento del modelo en el dominio concreto.
- Evaluación comparativa de modelos de decisión: sirve como referencia para medir latencia y precisión frente a alternativas en tareas de clasificación multimodal dentro de un entorno llama.cpp.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa basada en el tamaño (26,9 mil millones de parámetros), una cuantización de 4 bits requeriría del orden de 15-17 GB, una de 8 bits en torno a 28-30 GB y precisión completa (FP16) aproximadamente 54 GB, sin contar overhead de contexto ni caché KV.
- GPU recomendadas: no especificadas por el autor. Por tamaño, encajaría en A100 40/80 GB, H100 y, en cuantizaciones bajas, en RTX 4090 (24 GB) o RTX 3090.
- Cabe en GPU de consumo: probablemente sí en cuantizaciones de 4-5 bits sobre GPU con 24 GB, aunque no está confirmado por el autor.
- Opciones de despliegue: llama.cpp (incluido `llama serve`), aplicación Llama, Hugging Face Inference Endpoints. Compatibilidad con vLLM, TGI u Ollama no está documentada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables de la misma categoría (modelos de decisión multimodales en formato GGUF) en la documentación proporcionada. La comparación con LLM generativos de tamaño similar no sería metodológicamente adecuada, dado que vllm-d3 está diseñado para emitir decisiones vía `/v1/systemone` y no para generación de texto libre.

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| vllm-d3-GGUF | ~26,9 mil millones | no disponible | Apache 2.0 | GGUF | Modelo de decisión, endpoint `/v1/systemone` |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | No se han identificado en la información disponible |

## Limitaciones y advertencias

- Modelo de decisión, no generativo: no debe emplearse como asistente conversacional general; su interfaz prevista es `/v1/systemone`.
- Conversión automática: el autor advierte que el GGUF se genera automáticamente con ggml-org/convert, por lo que pueden existir diferencias de comportamiento respecto al modelo original vllm-sr/d3.
- Idiomas soportados no documentados: no es posible garantizar un rendimiento adecuado en castellano ni en otros idiomas sin evaluación previa.
- Longitud de contexto desconocida: limita la planificación de cargas con entradas largas.
- Riesgo de alucinación y sesgos: no evaluados ni documentados por el autor.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las condiciones del modelo base vllm-sr/d3 por si añade restricciones adicionales.
- Tamaño del repositorio (307 GB): requiere planificación de almacenamiento y ancho de banda considerables para su descarga completa.
- Madurez: la integración `/v1/systemone` depende de una pull request concreta de llama.cpp, por lo que la estabilidad de la API puede variar entre versiones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ggml-org/vllm-d3-GGUF
- Modelo base: https://huggingface.co/vllm-sr/d3
- Pull request de llama.cpp con el endpoint `/v1/systemone`: https://github.com/ggml-org/llama.cpp/pull/30383
- Herramienta de conversión: https://github.com/ggml-org/convert
- Aplicación Llama: https://llama.app
- Despliegue en Inference Endpoints: https://endpoints.huggingface.co/new/ggml-org/vllm-d3-GGUF
