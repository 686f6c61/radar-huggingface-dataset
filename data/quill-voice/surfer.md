# quill-voice/surfer

## Resumen

Surfer es un ajuste fino (fine-tune) del modelo Qwen3.5-4B publicado por el usuario quill-voice, entrenado con el objetivo de que el modelo responda siempre con jerga y estética de cultura surfera en inglés. No es un modelo de propósito general ni un modelo orientado a tareas técnicas: se trata de un "character model" creado por entretenimiento, donde el estilo de respuesta (metáforas de olas, tono relajado, slang de playa) es el producto principal.

Técnicamente es un transformer causal decoder-only de aproximadamente 4.659.865.088 parámetros (unos 4,66 mil millones), derivado del modelo base Qwen3.5-4B. El ajuste se hizo con LoRA en bf16 usando el framework Unsloth, sobre un dataset de solo 566 ejemplos durante 3 épocas. La longitud de contexto declarada en la model card es de 2048 tokens, notablemente inferior a la que suelen ofrecer los modelos de su familia.

Su relevancia es limitada y muy específica: sirve como ejemplo reproducible de una receta de fine-tuning LoRA rápida con Unsloth, como banco de pruebas para "persona conditioning" y system prompts, y como modelo de entretenimiento desplegable localmente. No hay resultados de benchmarks publicados, el repositorio acumula 0 descargas y 0 likes en el momento de la consulta, y el propio autor declara que su uso previsto es exclusivamente lúdico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal decoder-only (model card: "Causal Language Model"), derivado de Qwen3.5-4B |
| Parametros totales | 4.659.865.088 (~4,66 B) |
| Parametros activos | No aplica: modelo denso, no es MoE |
| Longitud de contexto | 2048 tokens (segun la model card) |
| Tipos de cuantizacion | GGUF 4-bit (surfer.gguf) y GGUF F16 (surfer-F16.gguf); pesos safetensors en precision completa |
| Idiomas soportados | Ingles (declarado); estilo surf/beach en ingles |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors y GGUF |
| Pipeline declarado | text-generation (la etiqueta del repo incluye ademas image-text-to-text, no verificada) |
| Framework de entrenamiento | Unsloth, LoRA en bf16 |
| Tamano del repositorio | 12,8 GB |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-4B, un transformer causal decoder-only de la familia Qwen, y se ajusta mediante LoRA en bf16 con Unsloth, una libreria orientada a reducir el consumo de memoria y acelerar el entrenamiento de adaptadores de bajo rango. No se especifica en la informacion disponible el rango (rank) del adaptador LoRA, la tasa de aprendizaje, la composicion exacta del dataset ni si los pesos publicados corresponden al adaptador sin fusionar o al modelo ya fusionado. El repositorio incluye pesos safetensors en precision completa y dos variantes GGUF, lo que sugiere que los pesos finales son el resultado de fusionar el adaptador sobre el modelo base.

El entrenamiento es deliberadamente minúsculo en escala: 566 ejemplos y 3 épocas. Esto no busca inyectar conocimiento nuevo, sino superponer un estilo de habla. Tampoco se documenta ningun proceso de RLHF, DPO, evaluacion automatizada o validacion de calidad. No hay constancia de innovaciones tecnicas propias mas alla del uso de Unsloth como herramienta, ni de decodificacion especulativa, atencion lineal o esquemas hibridos.

## Capacidades

- Generacion de texto conversacional en ingles con un registro estilistico muy marcado de cultura surfera (metaforas de olas, tono relajado, expresiones coloquiales).
- Razonamiento general y conocimiento del mundo heredados del modelo base Qwen3.5-4B, aunque reformulados obligatoriamente en el estilo surfer.
- Capacidad de seguir un system prompt, tal como demuestra el ejemplo de Modelfile para Ollama incluido en la model card.
- Respuestas multi-turno dentro de una ventana de 2048 tokens.
- Ejecucion local en hardware de consumo gracias a la publicacion en GGUF 4-bit.
- Soporte de tool calling / function calling: no disponible (no se documenta, aunque el modelo base podria soportarlo).
- Capacidades de agente y razonamiento multi-paso: no disponible (no se documentan).
- Capacidades multilingues: no, el unico idioma declarado es ingles.
- Capacidades especiales (vision, audio, modo thinking): no disponibles. La etiqueta image-text-to-text y la descripcion del fichero surfer-F16.gguf como "multimodal projector" apuntan a un posible componente multimodal, pero la model card describe el modelo como causal de texto y esta contradiccion no queda resuelta.

## Casos de uso

- Bots de entretenimiento y roleplay: el modelo esta diseñado explicitamente para mantener una personalidad constante de surfer, por lo que encaja en comunidades de Discord, apps de chat o demos de personajes conversacionales donde el tono es el atractivo principal.
- Prototipado de "persona conditioning": sirve como caso de estudio reproducible para probar como un dataset de 566 ejemplos y 3 épocas de LoRA modifica el estilo de salida de un modelo base, utiles para experimentos academicos sobre transferencia de estilo.
- Demostraciones de despliegue local con Ollama o LM Studio: el autor incluye un Modelfile listo para usar, lo que permite montar una demo funcional en un portatil con GPU de gama media en pocos minutos.
- Generacion de contenido creativo tematico: redaccion de textos promocionales, publicaciones para redes o guiones breves con estetica de surf para marcas del sector, asumiendo revision humana posterior.
- Banco de pruebas de evaluacion de estilo: util para validar metricas de "personalidad" o de deriva de estilo (prompt drift) en pipelines de evaluacion de modelos pequenos.
- Docencia y divulgacion sobre fine-tuning: al ser un ejemplo completo de LoRA con Unsloth, sirve como material didactico en talleres sobre como ajustar un modelo de 4B con recursos limitados.
- Pruebas de robustez de guardarrailes: permite comprobar si una persona muy marcada degrada la adherencia a instrucciones de seguridad o la precision factual en contextos de produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MMLU, HumanEval, GSM8K ni ninguna otra metrica, y la busqueda web realizada no devolvio resultados relacionados con este modelo. Tampoco hay datos de latencia o throughput declarados por el autor.

## Requisitos de hardware

- VRAM estimada para inferencia (estimaciones a partir del numero de parametros; el autor no publica mediciones):
  - GGUF 4-bit (Q4): aproximadamente 3 GB de pesos, en torno a 4 GB en total con contexto de 2048 tokens.
  - GGUF Q8: aproximadamente 5 GB de pesos.
  - bf16 / fp16: aproximadamente 9,3 GB solo en pesos.
  - fp32: aproximadamente 18,6 GB solo en pesos.
- GPU recomendadas: una RTX 3060 de 12 GB, una RTX 4060 Ti de 16 GB o una RTX 4070 son suficientes para la variante 4-bit. Para fp16 conviene una RTX 4090 (24 GB), A100 o H100. En tarjetas de 8 GB la variante Q4 puede funcionar con descarga parcial de capas a CPU, con penalizacion de velocidad.
- Compatibilidad con GPU de consumo: si, es uno de los puntos fuertes del modelo gracias al GGUF 4-bit de unos 3-4 GB.
- Opciones de despliegue: Ollama (recomendado por el autor, con Modelfile incluido), LM Studio, llama.cpp, y la pila transformers para los pesos safetensors. vLLM o TGI son viables con safetensors, aunque el modelo no esta validado en esas plataformas segun la informacion disponible.
- Latencia y throughput: no disponible. No hay mediciones publicadas de tokens por segundo ni de tiempo hasta el primer token en ninguna GPU concreta.

## Comparativa con modelos similares

No hay resultados de rendimiento publicados para Surfer, por lo que la comparacion se limita a parametros, contexto, licencia y disponibilidad. Los datos de los modelos alternativos corresponden a sus especificaciones publicas habituales y deben verificarse en sus fichas oficiales.

| Modelo | Parametros | Contexto | Licencia | Orientacion | Rendimiento publicado |
|---|---|---|---|---|---|
| quill-voice/surfer | ~4,66 B | 2048 tokens | apache-2.0 | Personaje surfer (entretenimiento) | No disponible |
| Qwen3-4B (modelo base de la familia) | ~4 B | No disponible en esta ficha | No disponible en esta ficha | Proposito general, multilingue | Si, publicado por el desarrollador del base |
| Llama 3.2 3B Instruct | ~3,2 B | Largo (familia orientada a contexto extendido) | Licencia comunitaria Llama | Proposito general, instrucciones | Si, publicado por Meta |
| Gemma 3 4B IT | ~4 B | Largo (familia orientada a contexto extendido) | Licencia Gemma | Proposito general, instrucciones | Si, publicado por Google |

Diferencias clave: Surfer es el unico de la lista cuyo objetivo es estilistico y no funcional, el unico con contexto limitado a 2048 tokens y el unico sin ninguna evaluacion publicada. Frente a un modelo de instrucciones de tamano similar, pierde en versatilidad y en idiomas, y su ventaja es unicamente la consistencia de la persona y un tamaño de descarga muy reducido en 4-bit.

## Limitaciones y advertencias

- Entrenado con solo 566 ejemplos durante 3 épocas: riesgo alto de sobreajuste al estilo y de deriva de la personalidad fuera del dominio del dataset.
- No hay ninguna evaluacion publicada, ni benchmarks, ni pruebas de seguridad, ni validacion por terceros.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no existe evidencia de uso en produccion.
- Idioma unico: ingles. No hay soporte real de castellano ni de otras lenguas, mas alla de lo que herede del modelo base.
- Contexto de 2048 tokens: insuficiente para documentos largos, conversaciones extensas o tareas de recuperacion aumentada con muchos fragmentos.
- Riesgo de alucinacion: heredado del modelo base y presumiblemente agravado por la prioridad que el ajuste da al estilo sobre la precision factual.
- Sesgos: no se documenta ningun analisis de sesgos. Cabe esperar los sesgos del modelo base mas los estereotipos asociados a la cultura surfera representada en el dataset.
- La model card declara "entertainment purposes only". Aunque la licencia apache-2.0 permite uso comercial, no hay garantia de calidad ni de idoneidad para entornos productivos.
- La licencia del modelo base Qwen3.5-4B no se indica en la ficha. Conviene verificarla antes de un uso comercial, ya que las condiciones del derivado dependen de las del modelo original.
- Inconsistencia sin resolver: el repo esta etiquetado como image-text-to-text y uno de los ficheros se describe como "multimodal projector", mientras que la model card lo define como modelo de lenguaje causal de texto. No hay documentacion que aclare si existe soporte multimodal real.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/quill-voice/surfer
- La busqueda web realizada no devolvio ningun resultado relevante sobre este modelo: los unicos enlaces obtenidos corresponden a servicios y proyectos homonimos sin relacion (Quillbot, quill.org, quilljs.com). No se han encontrado papers, blogs, repositorios ni demos asociados.
- Repositorio del modelo base, framework de entrenamiento y demos de despliegue: no disponibles en la informacion proporcionada.
