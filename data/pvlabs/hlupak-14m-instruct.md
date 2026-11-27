# pvlabs/Hlupak-14M-Instruct

## Resumen

Hlupak-14M-Instruct es un modelo de lenguaje de tipo causal, ajustado para instrucciones y entrenado desde cero por PingVortex Labs (pvlabs) sobre la arquitectura Qwen3. Con 15,7 millones de parámetros totales (12,6 millones sin contar los embeddings atados), se situa en la categoria de modelos "tiny" orientados a experimentacion y a ejecucion en entornos muy limitados, incluido el navegador web. Su proposito no es competir con modelos de gran escala, sino servir como base de investigacion y como juguete conversacional capaz de responder preguntas cortas y sencillas en ingles.

El modelo emplea una arquitectura transformer densa de 8 capas, con tamano oculto de 384, 6 cabezas de atencion y 2 cabezas KV (GQA), dimension de cabeza 64 y MLP SwiGLU de 1024. Dispone de un vocabulario BPE personalizado de 8192 tokens y una longitud de contexto de 1024 tokens. Solo soporta ingles y utiliza un formato de chat propio basado en etiquetas `<|user|>`, `<|assistant|>` y `<|end|>`.

Su relevancia actual es doble: por un lado, demuestra que es posible entrenar desde cero un modelo instructivo funcional con un presupuesto minimo de parametros; por otro lado, al incluir exportaciones ONNX (fp32 e int8 dinamico) con cache KV explicita, resulta un banco de pruebas practico para pipelines de inferencia en el cliente, WebAssembly o dispositivos sin GPU. La licencia Apache 2.0 facilita su reutilizacion y modificacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal denso (Qwen3), 8 capas, hidden 384, 6 cabezas de atencion, 2 cabezas KV (GQA), head dim 64, MLP SwiGLU 1024 |
| Parametros totales | 15.736.192 (16M, 15,7M con embeddings atados, 12,6M sin ellos) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 1024 tokens |
| Tipos de cuantizacion | ONNX int8 dinamico (26 MB); el resto no disponible |
| Idiomas soportados | Ingles unicamente |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers) y ONNX (fp32 e int8) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Qwen3 en configuracion compacta: 8 capas transformer con atencion multi-cabeza agrupada (6 cabezas de consulta y 2 de clave/valor), dimension de cabeza 64, MLP SwiGLU con dimension intermedia 1024 y embeddings atados entre entrada y salida. El vocabulario es un BPE personalizado de 8192 tokens, mucho mas pequeno que el de los Qwen3 estandar, lo que reduce drasticamente el coste de los embeddings y permite un modelo de apenas 0,1 GB en el repositorio.

El modelo fue entrenado desde cero (no es un fine-tune de un Qwen3 existente) y posteriormente ajustado para instrucciones, segun indica la model card. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, ni si se emplearon tecnicas de RLHF, DPO o SFT. La innovacion tecnica destacable es la inclusion de exportaciones ONNX con cache KV explicita (entradas `past_k`/`past_v` y salidas `present_k`/`present_v` con forma `[8, 1, 2, P, 64]`), lo que facilita su despliegue en navegador y en runtimes ligeros. El export fp32 reproduce fielmente las salidas de PyTorch; el int8 reduce el tamano pero altera notablemente las respuestas largas.

## Capacidades

- Generacion de texto breve en ingles: respuestas cortas a preguntas factuales simples, pequenas sumas y explicaciones muy concisas.
- Generacion creativa minima: poemas cortos y respuestas de una o pocas frases.
- Conversacion multi-turno basica mediante el formato de chat propio (`<|user|>`, `<|assistant|>`, `<|end|>`), con parada automatica al emitir `<|end|>`.
- Inferencia en navegador o en dispositivos sin GPU gracias a las exportaciones ONNX (fp32 de 63 MB e int8 de 26 MB).
- Soporte de cache KV explicita en ONNX para generacion autoregresiva eficiente.
- Plantilla de chat integrada accesible via `tokenizer.apply_chat_template`.
- No dispone de tool calling, function calling, razonamiento multi-paso, vision, audio ni modo "thinking".
- Capacidad multilingue nula: solo ingles.

## Casos de uso

- Banco de pruebas para investigacion en modelos tiny: util para estudiar el comportamiento de arquitecturas Qwen3 a escala minima, analizar curvas de aprendizaje o comparar tecnicas de tokenizacion con vocabularios reducidos.
- Inferencia en navegador: con el export ONNX int8 de 26 MB y cache KV explicita, puede integrarse en aplicaciones web (por ejemplo, via ONNX Runtime Web) para demostraciones de chat sin backend ni GPU.
- Educacion y divulgacion: sirve para explicar de forma tangible como funciona un transformer causal, el formato de chat, la atencion con GQA o la cuantizacion int8, sin necesidad de infraestructura costosa.
- Pruebas de pipelines de despliegue: al ser tan pequeno, es ideal para validar integraciones con transformers, ONNX Runtime o endpoints compatibles con text-generation-inference antes de pasar a modelos mayores.
- Prototipado de interfaces conversacionales: permite iterar rapidamente sobre plantillas de prompt, formatos de turnos y criterios de parada en un entorno de coste practicamente nulo.
- Generacion de respuestas triviales controladas: para tareas donde se acepta contenido muy simple (por ejemplo, relleno de demos o tests de integracion end-to-end de un sistema de chat).
- Baseline experimental: referencia para medir mejoras de modelos mas grandes en tareas de respuesta corta en ingles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: inferior a 100 MB, por lo que cabe en cualquier GPU consumer, incluso en iGPU o en CPU.
- VRAM estimada con ONNX int8: aproximadamente 26 MB de pesos, mas la cache KV (8 capas x 2 cabezas KV x 64 dim x 1024 tokens x 2 bytes, del orden de unos pocos MB).
- GPU recomendadas: cualquier GPU moderna es sobredimensionada; funciona en CPU, iGPU, moviles y navegador. No requiere A100, H100 ni RTX 4090.
- Cabe en GPU consumer: si, en todas las actuales y en la mayoria de generaciones anteriores.
- Opciones de despliegue: transformers (PyTorch, fp16 o fp32), ONNX Runtime (fp32 o int8, con cache KV explicita), y potencialmente text-generation-inference por su compatibilidad declarada con endpoints. No se menciona soporte de llama.cpp, Ollama ni vLLM en la informacion disponible.
- Latencia y throughput: no disponibles de forma medida; por el tamano del modelo se espera latencia de milisegundos en CPU moderna y en navegador, aunque no se aportan cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Hlupak-14M-Instruct | 15,7M | 1024 | Ingles | Apache 2.0 | safetensors, ONNX | Entrenado desde cero, ONNX con KV cache, orientado a navegador |
| Qwen3 (modelos oficiales) | Desde cientos de millones en adelante | Mayor (segun variante) | Multilingue | Apache 2.0 (segun variante) | safetensors, GGUF | Arquitectura de referencia; Hlupak reutiliza su diseno pero no sus pesos |
| Modelos tiny tipo TinyLlama / SmolLM | ~100M-1B | 2K-8K | Ingles/multilingue | Apache 2.0 / otras | safetensors, GGUF | Mucho mayores en parametros; mayor calidad pero no caben tan facilmente en navegador |

No se dispone de datos de benchmarks que permitan una comparacion cuantitativa con alternativas.

## Limitaciones y advertencias

- Conocimiento muy limitado: inventa hechos, nombres y fechas con frecuencia y los presenta con seguridad; no debe usarse como fuente de informacion.
- Respuestas largas problematicas: tiende a repetirse o a desviarse del tema; funciona mejor con respuestas cortas.
- Solo ingles; no soporta castellano ni otros idiomas.
- No apto para codigo, matematicas mas alla de sumas pequenas ni aplicaciones criticas para la seguridad.
- Las penalizaciones por repeticion rompen la aritmetica al penalizar digitos repetidos; el autor recomienda evitarlas.
- El export ONNX int8 produce respuestas largas notablemente distintas del modelo original; usar fp32 si se requiere fidelidad.
- Aunque la licencia es Apache 2.0 y permite uso comercial, la calidad del modelo hace inviable su uso en produccion real salvo como componente experimental o de demostracion.
- Sin datos publicados sobre sesgos, composicion del dataset de entrenamiento ni evaluaciones de seguridad.
- Modelo experimental con 0 descargas en el momento de la consulta; sin comunidad ni soporte contrastado.

## Enlaces

- Hugging Face: https://huggingface.co/pvlabs/Hlupak-14M-Instruct
- Organizacion en GitHub: https://github.com/PingVortexLabs
- Sitio web del autor: https://pingvortex.com
