# mradermacher/KITE-9B-i1-GGUF

## Resumen

KITE-9B-i1-GGUF es una colección de cuantizaciones GGUF, generadas con el método i1 (imatrix) por mradermacher, del modelo KITE-9B desarrollado por kainatq. KITE-9B es un modelo de aproximadamente 9.200 millones de parámetros (9.197.093.888 según los pesos en safetensors) construido mediante fusión de modelos (model merging) con la técnica TIES, a partir de una base de la familia Qwen 3.5. Está orientado a tareas de razonamiento, uso de herramientas (tool calling), agentes y generación de código, y conserva capacidades multimodales de entrada imagen-texto.

La relevancia de esta publicación es práctica: el repositorio original en bfloat16 requiere del orden de 18 GB de VRAM solo para los pesos, mientras que estas cuantizaciones comprimen el modelo hasta rangos de 4 a 8 GB, lo que permite ejecutarlo en GPUs de consumo mediante llama.cpp y sus derivados. El autor de las cuantizaciones emplea ficheros imatrix para reducir la pérdida de calidad en los formatos de menor precisión, y ofrece una batería extensa de variantes (Q2 a Q6, IQ1 a IQ4) para ajustar el equilibrio entre tamaño, velocidad y fidelidad.

La licencia es Apache 2.0, lo que facilita el uso comercial, y el pipeline declarado es text-generation con soporte de image-text-to-text. La información pública disponible no incluye detalles sobre el dataset de entrenamiento, la longitud de contexto ni resultados de benchmarks, por lo que esos apartados se documentan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen 3.5, según etiquetas del modelo); multimodal imagen-texto |
| Parametros totales | 9.197.093.888 (~9,2 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1 (imatrix): Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, IQ4_XS, IQ4_NL, Q4_0, Q4_1, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K; también IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M (listados en las etiquetas) |
| Idiomas soportados | inglés (etiqueta `en` en la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones i1); el modelo base en safetensors bfloat16 |

## Arquitectura y entrenamiento

El modelo subyacente, kainatq/KITE-9B, se describe en sus etiquetas como un merge de modelos con la técnica TIES sobre una base de la familia Qwen 3.5, con especial énfasis en tool calling, razonamiento, agentes y código. No se dispone de información pública sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron fases de RLHF o DPO. Tampoco se documentan innovaciones de inferencia como decodificación especulativa o atención lineal.

Esta publicación concreta no entrena el modelo: aplica cuantización GGUF con ficheros imatrix (quantize_version 2, output_tensor_quantised 1, convert_type hf) sobre los pesos en bfloat16. El resultado son ficheros que van desde 4,1 GB (i1-Q2_K) hasta 7,7 GB (i1-Q6_K), pensados para ejecutarse con llama.cpp. Los ficheros mmproj necesarios para la parte visual, si existen, se alojan en el repositorio estático del mismo autor (mradermacher/KITE-9B-GGUF), no en este.

## Capacidades

- Generación de texto conversacional multi-turno.
- Razonamiento y resolución de problemas (etiqueta `reasoning`).
- Generación y asistencia de código (etiqueta `code`).
- Tool calling y function calling (etiquetas `tool-use`, `tool-calling`).
- Flujos de agente y razonamiento multi-paso (etiqueta `agent`).
- Entrada multimodal imagen-texto (etiqueta `image-text-to-text`, `multimodal`); requiere los ficheros mmproj del repositorio estático.
- Capacidades multilingües: limitadas al inglés según la model card.
- Compatibilidad con endpoints (etiqueta `endpoints_compatible`).

## Casos de uso

- Agentes con herramientas en local: el modelo puede orquestar llamadas a funciones (APIs, bases de datos, sistemas de ficheros) en un bucle de razonamiento multi-paso, ejecutable en una GPU de consumo gracias a las cuantizaciones de 4-6 GB.
- Asistente de código en el IDE: integrado vía llama.cpp u Ollama, genera y explica fragmentos de código en inglés con contexto de repositorio, sin depender de servicios en la nube.
- Automatización de atención al cliente: conversaciones multi-turno con soporte de tool calling para consultar pedidos o estado de cuenta; la ventana de contexto real debe validarse empíricamente porque no está documentada.
- Procesamiento de documentos con imagen: al conservar la capacidad imagen-texto (con mmproj), puede extraer información de capturas, formularios o diagramas y resumirla en texto.
- Prototipado de pipelines de agentes en investigación: permite comparar variantes de cuantización (Q4_K_M frente a Q6_K) para medir la degradación en tareas de tool calling antes de desplegar en producción.
- Despliegue en entornos con requisitos de privacidad: al ejecutarse completamente en local con llama.cpp, los datos no salen del equipo, adecuado para sectores regulados.
- Evaluación comparativa de merges: útil para estudiar cómo se comportan los modelos fusionados con TIES bajo cuantización agresiva, dado el amplio abanico de quants ofrecido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (pesos + overhead de contexto): i1-Q2_K ~4,1 GB; i1-IQ3_M ~4,7 GB; i1-Q4_K_M ~5,9 GB; i1-Q5_K_M ~6,8 GB; i1-Q6_K ~7,7 GB. Añadir entre 1 y 3 GB según longitud de contexto y KV cache.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080, RTX 4090 para las variantes altas con contexto largo; A100/H100 solo necesarias para el modelo base en bfloat16 (~18 GB) o para servir muchas peticiones concurrentes.
- Cabe en GPU de consumo: sí, desde 6-8 GB de VRAM con cuantizaciones Q3/IQ3 o Q4; las variantes Q5/Q6 requieren 8-10 GB.
- Opciones de despliegue: llama.cpp (formato nativo), Ollama, LM Studio, y servidores compatibles con la API de OpenAI mediante llama-server; para el modelo base, vLLM o TGI con safetensors.
- Latencia y throughput: no disponibles; dependen de la GPU, del quant y del backend.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| KITE-9B (i1-GGUF) | ~9,2 B | no disponible | Apache 2.0 | GGUF | Merge TIES sobre Qwen 3.5; tool calling y multimodal |
| Qwen 2.5 7B Instruct (GGUF) | ~7,6 B | 32 K (según model card oficial) | Apache 2.0 | GGUF | Referencia de la familia base; tool calling y código |
| Llama 3.1 8B Instruct (GGUF) | ~8 B | 128 K (según model card oficial) | Llama 3.1 Community | GGUF | Amplia adopción y ecosistema de cuantizaciones |
| Mistral 7B Instruct v0.3 (GGUF) | ~7,2 B | 32 K (según model card oficial) | Apache 2.0 | GGUF | Alternativa ligera para agentes y tool calling |

La comparación directa de rendimiento con estos modelos no es posible con la información disponible, ya que no se han publicado benchmarks de KITE-9B.

## Limitaciones y advertencias

- No se han publicado evaluaciones de sesgo, toxicidad o robustez; el comportamiento en dominios sensibles es desconocido.
- Riesgo de alucinación inherente a los modelos de ~9 B, especialmente en razonamiento multi-paso y tool calling con esquemas complejos.
- Idioma: la model card solo declara inglés; el rendimiento en castellano no está validado.
- Longitud de contexto no documentada: no debe asumirse una ventana larga sin pruebas empíricas.
- Al ser un merge TIES, puede heredar inconsistencias de los modelos fusionados (estilos de respuesta mezclados, formatos de tool call dispares).
- Las cuantizaciones de baja precisión (Q2, IQ1, IQ2) degradan notablemente la calidad; para producción se recomienda Q4_K_M o superior.
- La parte multimodal requiere ficheros mmproj alojados en otro repositorio; sin ellos, el modelo funciona solo como texto.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar las licencias de los modelos fusionados en el merge original.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/KITE-9B-i1-GGUF
- Modelo base: https://huggingface.co/kainatq/KITE-9B
- Cuantizaciones estáticas (incluye mmproj): https://huggingface.co/mradermacher/KITE-9B-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#KITE-9B-i1-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfica de calidad de quants de ikawrakow: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantización: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de modelos de mradermacher: https://huggingface.co/mradermacher/model_requests
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
