# junafinity/Ornith-1.5-9B-uncensored-GGUF-8bit

## Resumen

Ornith-1.5-9B-uncensored-GGUF-8bit es una variante "abliterada" del modelo base `ornith-ai/Ornith-1.5-9B`, publicada por junafinity. La abliteración es una técnica que elimina la dirección de rechazo (refusal direction) de los pesos del modelo, reduciendo sus guardarraíles de seguridad. Este build concreto se produce con la herramienta ZeroFuse, que realiza una búsqueda multiobjetivo con Optuna para minimizar simultáneamente los rechazos residuales y la divergencia KL respecto al modelo original, materializando el resultado como una edición directa de pesos sin adaptadores en tiempo de inferencia.

El modelo base pertenece a la familia Ornith-1.5 de ornith-ai, una línea de modelos diseñados para razonamiento general, tareas agénticas y generación de código. La familia incluye variantes de 397B MoE, 35B MoE y 9B densa. Este build de 9B conserva la torre de visión (vision tower) del modelo base, lo que permite procesamiento multimodal (imagen a texto), y se distribuye en formato GGUF Q8_0 para su uso con llama.cpp. La licencia es Apache-2.0, lo que permite uso comercial sin restricciones adicionales.

La relevancia actual de este modelo reside en que combina la capacidad multimodal y agéntica de la familia Ornith con la eliminación de guardarraíles, lo que lo hace útil para investigación de seguridad (red teaming), análisis de contenido sin filtros y despliegue local eficiente en hardware de consumo. Sin embargo, esta misma característica lo hace inadecuado para aplicaciones donde se requiera moderación de contenido integrada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso con torre de vision (basado en Qwen3.5) |
| Parametros totales | 8.953.803.264 (8.95B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q8_0 (GGUF) |
| Idiomas soportados | No disponibles |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (Q8_0) + archivo mmproj separado para vision |

## Arquitectura y entrenamiento

El modelo base Ornith-1.5-9B es un transformer denso de 9B parametros con torre de vision multimodal, desarrollado por ornith-ai como parte de la familia Ornith-1.5. La arquitectura sigue la linea de los modelos Qwen3.5, con atencion por capas y bloques de MLP estandar. El modelo original fue entrenado para razonamiento general, tareas agénticas y codificacion, con una estrategia de "self-scaffolding" que permite al modelo mejorar su propio rendimiento mediante iteraciones de entrenamiento.

La variante abliterated se genera mediante el pipeline ZeroFuse de junafinity. El proceso captura activaciones del flujo residual en conjuntos de prompts dañinos vs. inofensivos, estima la direccion de rechazo por diferencia de medias con refinamiento proyectado, y realiza una busqueda Optuna TPE de dos objetivos (rechazos restantes y divergencia KL) sobre la capa fuente, el rango de capas y la fuerza de ablacion. El resultado se materializa como una edicion directa de pesos en las proyecciones de escritura residual (`self_attn.o_proj`, `linear_attn.out_proj`, `mlp.down_proj`). La torre de vision y los tensores MTP no se tocan; se verifica que la torre de vision es identica bit a bit antes y despues del proceso.

La configuracion del modelo base declara `mtp_num_hidden_layers: 1`, pero los pesos publicados no incluyen ningun tensor `mtp.*`, por lo que este build se convierte con `--no-mtp` para evitar errores de carga en llama.cpp. La vision tower se exporta como archivo separado `mmproj-*.gguf`.

## Capacidades

- Generacion de texto y razonamiento general, con capacidades de codigo y tareas agencias propias de la familia Ornith.
- Procesamiento multimodal: acepta entrada de imagenes y genera descripciones de texto (pipeline image-text-to-text).
- Funcionamiento sin guardarrailes: el modelo no rechaza solicitudes dañinas en el conjunto de prueba de seguridad, con una reduccion de rechazos de 9 a 0 sobre 64 prompts dañinos.
- Soporte de tool calling y agentes: la familia base Ornith-1.5 esta diseñada para tareas agencias y codigo, aunque no se confirma explicitamente en la informacion disponible.
- Compatible con llama.cpp y herramientas de la linea llama-cli y llama-mtmd-cli para ejecucion local.
- Soporte de cuantizacion Q8_0 para despliegue eficiente en CPU y GPU de consumo.

## Casos de uso

- Red teaming y evaluacion de seguridad de modelos: el modelo permite probar tecnicas de jailbreak y evaluar la robustez de sistemas de moderacion al eliminar la direccion de rechazo. Se puede usar en entornos controlados para medir el impacto de los guardarrailes en el comportamiento del modelo.
- Analisis de imagenes sin restricciones: gracias a su torre de vision preservada, puede describir imagenes sin filtrar contenido, lo que es util en investigacion de sesgos visuales, analisis de contenido extremo o generacion de descripciones para archivos de imagenes sin moderacion.
- Generacion creativa de contenido: para proyectos de escritura creativa, poesia, narrativa o guion que requieran explorar temas tabu o sin censura, el modelo ofrece una salida sin restricciones morales.
- Desarrollo de agentes locales con herramientas: al ser un modelo de la familia Ornith con capacidades agencias, puede integrarse en pipelines de automatizacion de tareas de codigo o toma de decisiones, aunque el despliegue local limita el rendimiento respecto a las variantes MoE.
- Pruebas de robustez de sistemas de moderacion: las organizaciones pueden usar el modelo para testear sus propios filtros de contenido, verificando si sus sistemas detectan correctamente solicitudes daresos cuando el modelo subyacente no tiene guardarrailes.
- Despliegue en hardware de consumo: gracias a la cuantizacion Q8_0 y el tamano de 9B, se puede ejecutar en una GPU de 12-16 GB de VRAM, lo que permite prototipado rapido en entornos locales sin coste de API.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks especificos para la variante abliterated en la informacion disponible. La pagina de ornith-ai indica que la familia Ornith-1.5 alcanza un rendimiento de estado del arte entre los modelos open-source de tamano comparable, pero no se proporcionan cifras concretas. La divergencia KL entre esta variante y el modelo base es de 0.001668, lo que sugiere un impacto minimo en las capacidades generales, pero no se dispone de numeros de MMLU, HumanEval o GSM8K para este build concreto.

## Requisitos de hardware

- VRAM estimada: para el modelo en Q8_0, los pesos ocupan aproximadamente 9.8-10 GB. Con la torre de vision (456M parametros) y la cache KV, se recomienda al menos 12 GB de VRAM para una ventana de contexto moderada.
- GPU recomendadas: RTX 3080 12 GB, RTX 3090, RTX 4070 Ti Super, A4000, A5000, o GPUs de datacenter como A10G o L4. No cabe en GPU de 8 GB (como RTX 3060 Ti) sin cuantizaciones mas agresivas.
- Si cabe en consumer GPU: si, en GPUs de 12 GB o mas, con cuantizacion Q8_0.
- Opciones de despliegue: llama.cpp (llama-cli, llama-mtmd-cli), Ollama, vLLM (si se convierte a safetensors), y cualquier backend compatible con GGUF.
- Latencia y throughput estimados: no disponible. En una RTX 4090 se puede esperar una velocidad de generacion de 30-50 tokens/s para un modelo de 9B en Q8_0, pero no se ha medido en este build.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Ornith-1.5-9B (base) | 8.95B | No disponible | Apache-2.0 | Safetensors bf16 | Con guardarrailes, multimodal |
| Ornith-1.5-9B-uncensored | 8.95B | No disponible | Apache-2.0 | Safetensors bf16 | Abliterado, multimodal |
| Ornith-1.5-9B-uncensored-MLX-8bit | 8.95B | No disponible | Apache-2.0 | MLX 8-bit | Para Apple Silicon |
| Ornith-1.5-35B-A3B-uncensored | 35B (3B activos) | No disponible | Apache-2.0 | MLX/GGUF | Variante MoE mas grande |

La comparacion con el modelo base muestra que la unica diferencia es la eliminacion de la direccion de rechazo, con una divergencia KL minima. No se dispone de datos de comparacion con modelos de otras familias (como Llama 3.1 8B o Mistral 7B) en la informacion disponible.

## Limitaciones y advertencias

- Este modelo ha sido modificado para reducir o eliminar los guardarrailes de seguridad. El autor advierte explicitamente que su uso es responsabilidad del usuario y que deben cumplirse la licencia del modelo base, la ley aplicable y las politicas de la plataforma de despliegue.
- La eliminacion de guardarrailes no elimina la responsabilidad legal ni etica del desarrollador que lo integra en un producto.
- No se dispone de datos sobre sesgos del modelo abliterated, pero al heredar los pesos del modelo base, es probable que presente sesgos similares a los de la familia Qwen3.5.
- El riesgo de alucinacion no ha sido evaluado en esta variante; la baja divergencia KL sugiere que el comportamiento en prompts inofensivos es similar al base, pero no hay garantias.
- La longitud de contexto no esta documentada, por lo que no se puede garantizar un rendimiento optimo en conversaciones largas o documentos extensos.
- El archivo GGUF requiere el archivo `mmproj-*.gguf` separado para usar la vision; sin el, el modelo solo funciona en modo texto.
- La configuracion del modelo base declara `mtp_num_hidden_layers: 1` pero no hay tensores MTP en los pesos, lo que puede causar errores si se intenta cargar con herramientas que esperan un bloque MTP.
- La licencia Apache-2.0 permite uso comercial, pero no exime de responsabilidad por el contenido generado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/junafinity/Ornith-1.5-9B-uncensored-GGUF-8bit
- Modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-9B
- Variante GGUF del base: https://huggingface.co/ornith-ai/Ornith-1.5-9B-GGUF
- Coleccion de la familia Ornith-1.5: https://huggingface.co/collections/ornith-ai/ornith-15
- Blog de Ornith-1.5: https://ornith.ai/ornith_1_5.html
- Guia de Ornith AI: https://ornith.online/
- Web de Ornith AI: https://ornith.ai/
- Repositorio de ZeroFuse: https://github.com/junainfinity/ZeroFuse
