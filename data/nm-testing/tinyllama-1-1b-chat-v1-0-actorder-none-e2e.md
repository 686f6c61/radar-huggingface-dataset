# nm-testing/TinyLlama-1.1B-Chat-v1.0-actorder-none-e2e

## Resumen

`nm-testing/TinyLlama-1.1B-Chat-v1.0-actorder-none-e2e` es un checkpoint derivado del modelo TinyLlama-1.1B-Chat-v1.0, publicado por la organizacion `nm-testing` (entorno de pruebas de Neural Magic). No se trata de un modelo entrenado desde cero, sino de una variante de TinyLlama empaquetada con `compressed-tensors`, la libreria de cuantizacion de Neural Magic, con el objetivo de validar flujos de extremo a extremo (end-to-end) de compresion y despliegue. El sufijo `actorder-none` indica que no se aplica reordenacion por magnitud de activaciones en el proceso de cuantizacion.

TinyLlama-1.1B-Chat-v1.0 es un transformer decoder-only de tipo Llama con 1.100.048.384 parametros, entrenado por el proyecto TinyLlama sobre aproximadamente 3 billones (3T) de tokens, y afinado para chat. Su interes radica en que ofrece un modelo conversacional muy compacto que puede ejecutarse en hardware modesto, lo que lo convierte en una referencia habitual para pruebas de cuantizacion, pipelines de compresion y validacion de toolchains.

Este checkpoint concreto tiene un caracter marcadamente experimental: 44 descargas, 0 likes, licencia no declarada en la ficha y un tamano de repositorio de 4,6 GB, superior al esperado para un modelo de 1,1B en safetensors de precision completa (aproximadamente 2,2 GB en fp16), lo que sugiere la presencia de pesos adicionales o artefactos de compresion. No esta pensado como modelo de produccion, sino como material de validacion para ingenieros que trabajan con `compressed-tensors` y vLLM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama) |
| Parametros totales | 1.100.048.384 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible en la informacion proporcionada (TinyLlama base: 2048 tokens) |
| Tipos de cuantizacion | pesos empaquetados con `compressed-tensors`; esquema concreto no disponible |
| Idiomas soportados | no disponible (TinyLlama base: predominantemente ingles) |
| Licencia | no disponible |
| Formato de pesos | safetensors (con metadatos `compressed-tensors`) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de TinyLlama-1.1B-Chat-v1.0: un transformer decoder-only con atencion causal, normalizacion RMSNorm, activacion SwiGLU, RoPE para codificacion posicional y sesgo desactivado en las proyecciones lineales, siguiendo el diseno de Llama 2. El modelo base fue preentrenado por el proyecto TinyLlama sobre aproximadamente 3 billones de tokens (con reutilizacion de datos tipo SlimPajama y tecnicas de entrenamiento de alta eficiencia), y posteriormente sometido a afinado supervisado y optimizacion de preferencias para obtener la variante Chat.

Sobre este checkpoint, `nm-testing` ha aplicado un empaquetado con `compressed-tensors` en modo `actorder-none`, es decir, sin reordenacion de canales basada en la magnitud de las activaciones durante la cuantizacion post-entrenamiento. Este tipo de variantes se generan para verificar que el grafo de cuantizacion se serializa correctamente, que los kernels de vLLM lo cargan sin errores y que las salidas numericas son coherentes frente al modelo de referencia. No hay informacion publica sobre el dataset de calibracion, el numero de tokens de calibracion ni la configuracion exacta de bits por grupo empleada en este checkpoint.

## Capacidades

- Generacion de texto conversacional multi-turno, heredada del afinado chat de TinyLlama-1.1B-Chat-v1.0.
- Razonamiento basico y respuesta a instrucciones en formato dialogo (roles system/user/assistant).
- Generacion de codigo sencillo y explicaciones tecnicas breves, limitada por el tamano del modelo.
- Aritmetica y matematicas elementales, con fiabilidad baja en problemas de varios pasos.
- Capacidad multilingue limitada: el modelo base esta entrenado predominantemente en ingles; el rendimiento en castellano es reducido.
- No dispone de vision, audio ni modalidades adicionales.
- Soporte de tool calling: no documentado en la informacion disponible; el modelo base no incluye un formato nativo de function calling.
- Capacidades de agente y razonamiento multi-paso: muy limitadas por el tamano y por la ausencia de modo thinking explicito.
- Uso principal real: validacion de pipelines de cuantizacion y despliegue, no inferencia de produccion.

## Casos de uso

- Validacion de toolchain de cuantizacion: sirve para comprobar que `compressed-tensors` serializa y deserializa correctamente un checkpoint cuantizado, comparando perplejidad y salidas frente al TinyLlama original antes de aplicar el mismo flujo a modelos mayores.
- Pruebas de integracion con vLLM: permite verificar la carga de pesos comprimidos, la seleccion de kernels y la correccion de la generacion en un entorno controlado con un modelo de 1,1B que cabe en cualquier GPU.
- CI/CD de pipelines de compresion: al ser pequeno y rapido de evaluar, encaja como caso de prueba en tests automatizados que detecten regresiones en la libreria de cuantizacion tras cambios de version.
- Benchmarking de latencia en hardware modesto: util para medir throughput y tiempo hasta el primer token en GPUs consumer o incluso CPU, estableciendo una linea base antes de escalar a modelos de 7B o 70B.
- Prototipado de asistentes conversacionales ligeros: en entornos de desarrollo sin GPU dedicada, permite iterar sobre prompts y plantillas de chat con un coste computacional minimo.
- Docencia y experimentacion academica: adecuado para ilustrar el impacto de la cuantizacion en la calidad de salida con un modelo cuyo comportamiento base esta ampliamente documentado.
- Pruebas de regresion numerica: comparar logits y perplejidad entre variantes `actorder` y `actorder-none` para cuantificar el efecto de la reordenacion de activaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible para este checkpoint concreto. El modelo base TinyLlama-1.1B-Chat-v1.0 reporta resultados en tareas como MMLU, HellaSwag y ARC, pero no se dispone de esas cifras en la informacion proporcionada, por lo que no se reproducen aqui.

## Requisitos de hardware

- VRAM estimada en fp16: aproximadamente 2,2 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica, entre 3 y 4 GB.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 1,2-1,5 GB de pesos.
- VRAM estimada en cuantizacion de 4 bits: alrededor de 0,7-1 GB de pesos.
- El repositorio ocupa 4,6 GB, por lo que conviene revisar los ficheros antes de descargar; puede contener pesos en varias precisiones o artefactos auxiliares.
- GPU recomendadas: cualquier GPU con 8 GB o mas (RTX 3060, RTX 4060, RTX 4090, A10, L4). Cabe holgadamente en A100 y H100, donde el cuello de botella sera el ancho de banda y no la memoria.
- Cabe en GPU consumer de gama media y en iGPU con suficiente memoria compartida; tambien es viable en CPU con llama.cpp si se dispone de pesos en GGUF (no confirmado en este repo).
- Opciones de despliegue: vLLM es la via natural dada la integracion de `compressed-tensors`; tambien Transformers con la libreria `compressed-tensors` instalada. llama.cpp y Ollama requeririan conversion a GGUF, no documentada para este checkpoint.
- Latencia y throughput: no disponibles en la informacion proporcionada. Para un modelo de 1,1B en una RTX 4090 se espera un throughput muy alto, pero no se aportan cifras verificadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| nm-testing/TinyLlama-1.1B-Chat-v1.0-actorder-none-e2e | 1,1B | no disponible (base: 2048) | no disponible | safetensors + compressed-tensors | Checkpoint de validacion, no para produccion |
| TinyLlama/TinyLlama-1.1B-Chat-v1.0 | 1,1B | 2048 | Apache 2.0 (segun ficha del modelo base) | safetensors | Modelo de referencia, ampliamente usado |
| nm-testing/TinyLlama-1.1B-Chat-v1.0-NVFP4-e2e | 1,1B | no disponible | no disponible | safetensors (NVFP4) | Variante en formato NVFP4 del mismo autor |
| Qwen2.5-1.5B-Instruct | 1,5B | 32768 | Apache 2.0 | safetensors, GGUF | Alternativa moderna con contexto mucho mayor y mejor multilingue |

## Limitaciones y advertencias

- Checkpoint experimental: no esta pensado para uso en produccion ni para aplicaciones de cara al usuario.
- Licencia no declarada: la ausencia de licencia explicita impide asumir derechos de uso comercial; hay que remitirse a la licencia del modelo base (TinyLlama, Apache 2.0) y confirmar con el autor.
- Riesgo elevado de alucinacion: con 1,1B de parametros y un corpus de entrenamiento limitado, el modelo inventa hechos con frecuencia, especialmente en dominios especializados.
- Sesgos: hereda los sesgos de los datos de preentrenamiento de TinyLlama (predominantemente web en ingles), incluyendo sesgos de genero, culturales y geograficos.
- Multilingue deficiente: el rendimiento en castellano es bajo; no es adecuado para tareas de calidad en espanol.
- Contexto corto: la ventana de 2048 tokens del modelo base limita conversaciones largas y documentos extensos.
- Calidad tras cuantizacion no verificada: no hay datos publicados sobre la degradacion de perplejidad introducida por este esquema `actorder-none`.
- Trazabilidad: al ser un repo de pruebas, los ficheros pueden cambiar o desaparecer sin aviso; conviene fijar un commit concreto si se usa en pipelines.
- Sin garantias de soporte: 0 likes y 44 descargas indican que no hay comunidad ni mantenimiento detras de este checkpoint.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nm-testing/TinyLlama-1.1B-Chat-v1.0-actorder-none-e2e
- Modelo base: https://huggingface.co/TinyLlama/TinyLlama-1.1B-Chat-v1.0
- Variante NVFP4 del mismo autor: https://huggingface.co/nm-testing/TinyLlama-1.1B-Chat-v1.0-NVFP4-e2e
