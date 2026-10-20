# ninabot/Apertus-v1.5-70B-NVFP4A16

## Resumen

Apertus-v1.5-70B-NVFP4A16 es una cuantizacion de 4 bits publicada por el usuario `ninabot` sobre el modelo base `swiss-ai/Apertus-v1.5-70B`, perteneciente a la familia Apertus de Swiss AI (etiquetas `swiss-ai`, `apertus`, `apertus1p5`). El paquete emplea el esquema NVFP4A16 de `compressed-tensors`: pesos en FP4 (formato E2M1 con escalas de bloque) y activaciones en FP16, pensado para explotar la aritmetica nativa de tensor cores Blackwell. El resultado es un checkpoint de 72.005.819.139 parametros (unos 72,0 B) que ocupa 46,2 GB en el repositorio, frente a los aproximadamente 144 GB que requeriria el base en BF16.

El modelo conserva la modalidad del base: el pipeline declarado es `image-text-to-text`, de modo que acepta imagenes y texto y genera texto, con un uso previsto conversacional. La publicacion esta orientada a servir el modelo con vLLM (libreria declarada) sobre hardware Blackwell, reduciendo el coste por token y permitiendo desplegar un modelo de escala 70B en nodos de 80-96 GB en lugar de exigir multiples GPU de 80 GB en precision completa.

Es relevante ahora porque las etiquetas del repo apuntan a la version 1.5 de Apertus y a una licencia Apache 2.0, lo que facilita el uso comercial. Conviene senalar que el acceso es restringido (gated): es necesario aceptar las condiciones en HuggingFace antes de descargar los pesos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text); detalles de capas y atencion no disponibles en la informacion proporcionada |
| Parametros totales | 72.005.819.139 (72,0 B) |
| Parametros activos | No aplica segun la informacion disponible (no se declara variante MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | NVFP4A16: pesos NVFP4 (4 bits, escalas de bloque) con activaciones FP16; formato `compressed-tensors`; etiqueta adicional de 8 bits en los tags del repo |
| Idiomas soportados | No disponibles |
| Licencia | Apache 2.0 (acceso restringido, requiere aceptar condiciones) |
| Formato de pesos | safetensors (cuantizado, `compressed-tensors`), integracion vLLM |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base `swiss-ai/Apertus-v1.5-70B`: no se especifican numero de capas, dimension oculta, mecanismo de atencion ni tipo de activacion. Lo que si consta es que se trata de un modelo multimodal de entrada (imagen y texto) con salida de texto, y que la familia Apertus procede de la iniciativa Swiss AI (etiqueta `swiss-ai`). Cualquier afirmacion sobre datos de entrenamiento (numero de tokens, composicion del corpus, fases de RLHF/DPO) debe considerarse no disponible en esta ficha.

Sobre la intervencion de cuantizacion, el esquema NVFP4A16 mantiene las activaciones en FP16 y comprime unicamente los pesos a FP4 con escalas de bloque, un compromiso habitual para preservar calidad en modelos grandes. El repositorio incluye las etiquetas `blackwell` y `vllm`, lo que indica que el kernel objetivo es el de tensor cores de quinta generacion de NVIDIA; el tag `8-bit` sugiere que parte del checkpoint (posiblemente capas concretas o los propios metadatos de escala) se conserva en 8 bits. No se han publicado en la informacion disponible detalles sobre decodificacion especulativa, atencion lineal ni otras optimizaciones de inferencia.

## Capacidades

- Generacion de texto conversacional multi-turno, segun la etiqueta `conversational`.
- Procesamiento de imagen y texto combinados (pipeline `image-text-to-text`): descripcion de imagenes, respuesta a preguntas sobre contenido visual y tareas de documentacion grafica.
- Razonamiento sobre el contenido de una o varias imagenes junto con instrucciones en lenguaje natural.
- Despliegue de alto rendimiento en vLLM con pesos cuantizados en FP4.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponibles (el campo de idiomas del repo esta vacio).
- Capacidades especiales (modo thinking, audio, video): no disponibles.

## Casos de uso

- Analisis de documentacion escaneada a escala: al ser un modelo multimodal de 70B, puede recibir imagenes de facturas, formularios o contratos y devolver campos estructurados; el checkpoint NVFP4 permite servir varias replicas en un solo nodo Blackwell en lugar de una por GPU de 80 GB.
- Moderacion de contenido con imagenes: clasificacion y explicacion de imagenes enviadas por usuarios en plataformas UGC, con la ventaja de que la cuantizacion 4-bit reduce el coste por peticion en cargas de alto volumen.
- Asistentes de accesibilidad: generacion de descripciones textuales detalladas de imagenes para lectores de pantalla, aprovechando la escala del modelo para descripciones mas ricas que las de modelos pequenos.
- Soporte tecnico con capturas de pantalla: el usuario adjunta una captura de un error y el modelo interpreta la interfaz y propone pasos de resolucion; el pipeline image-text-to-text es directamente aplicable.
- Extraccion de informacion en pipelines de datos: procesamiento por lotes de imagenes de catalogo, tickets o radiografias industriales para poblar bases de datos, desplegado con vLLM para maximizar el throughput.
- Evaluacion comparativa de cuantizaciones: servir como referencia FP4 frente al base BF16 en pruebas A/B internas de calidad y latencia, dado que ambos checkpoints comparten el mismo modelo de origen.
- Investigacion sobre cuantizacion: estudio del impacto de NVFP4A16 en un modelo multimodal de 70B, con la ventaja de que el base es Apache 2.0 y permite publicar resultados y derivados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos del repositorio suman 46,2 GB; anadiendo cache KV y buffers de activacion en FP16, el consumo realista arranca en torno a 50-60 GB y crece con la longitud de contexto y el tamano de lote (estimacion, no dato publicado).
- GPU recomendadas: NVIDIA Blackwell con soporte nativo de FP4, como B200 o RTX PRO 6000 Blackwell (96 GB). Una GPU de 80 GB permite cargar los pesos, pero el rendimiento de FP4 en arquitecturas Hopper depende del soporte de emulacion de vLLM y no esta confirmado en la informacion disponible.
- Cabe en consumer GPU: no de forma holistica. Una RTX 5090 (32 GB) no puede alojar los 46,2 GB de pesos; seria necesario reparto entre varias GPU o una cuantizacion mas agresiva no publicada en este repo.
- Opciones de despliegue: vLLM es la via declarada por la libreria del repo; llama.cpp/Ollama no constan como soportados para este formato `compressed-tensors` NVFP4, y TGI no aparece referenciado.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ninabot/Apertus-v1.5-70B-NVFP4A16 (este) | 72,0 B | No disponible | safetensors NVFP4A16, 46,2 GB | Apache 2.0, gated | HuggingFace, vLLM |
| swiss-ai/Apertus-v1.5-70B (base) | 72,0 B | No disponible | safetensors sin cuantizar (precision original no confirmada) | Apache 2.0 | HuggingFace |
| Otras cuantizaciones 4-bit del mismo base (GPTQ/AWQ/W4A16) | 72,0 B | No disponible | No disponible en la informacion proporcionada | Segun cada publicacion | No disponible |

No se dispone de datos de rendimiento comparado (MMLU, HumanEval, GSM8K ni evaluaciones multimodales) para ninguna de las filas, por lo que la comparativa se limita a parametros, formato, licencia y disponibilidad.

## Limitaciones y advertencias

- Acceso restringido: el repositorio es gated y exige aceptar condiciones en HuggingFace antes de la descarga; un pipeline automatizado fallara si no se configura el token con permisos.
- La cuantizacion FP4 puede degradar tareas sensibles a precision numerica (matematicas, extraccion exacta de texto de imagenes, razonamiento encadenado largo); no se han publicado evaluaciones que cuantifiquen esa perdida.
- Riesgo de alucinacion inherente a los modelos generativos, especialmente en descripcion de imagenes con texto pequeno o de baja resolucion y en preguntas sobre detalles ausentes en la imagen.
- Idiomas soportados no declarados: no hay garantia documentada de calidad en castellano ni en otras lenguas; conviene evaluar antes de un despliegue en produccion.
- Longitud de contexto no documentada: no es posible planificar cargas de contexto largo sin verificacion previa.
- Dependencia de hardware Blackwell para aprovechar el formato: en GPUs Hopper o Ada el checkpoint puede no ser servible o rendir por debajo de una cuantizacion INT4 convencional.
- Modelo publicado por un tercero (`ninabot`) y no por el organismo autor del base: no hay garantia de que la receta de cuantizacion haya sido validada por Swiss AI; conviene contrastar la calidad frente al base.
- Ausencia total de senales de validacion en HuggingFace (0 descargas, 0 likes en el momento del registro) y fecha de creacion muy reciente: trazabilidad limitada.
- Aunque la licencia del base es Apache 2.0, el uso comercial debe verificar los terminos del modelo de origen y de las condiciones aceptadas en el gate.

## Enlaces

- HuggingFace (este modelo): https://huggingface.co/ninabot/Apertus-v1.5-70B-NVFP4A16
- Modelo base: https://huggingface.co/swiss-ai/Apertus-v1.5-70B
- Paper, blog, repositorio o demo oficiales: no disponibles en la informacion proporcionada (los resultados de busqueda web recibidos no guardan relacion con el modelo).
