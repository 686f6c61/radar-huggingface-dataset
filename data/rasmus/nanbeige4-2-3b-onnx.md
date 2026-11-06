# RASMUS/Nanbeige4.2-3B-ONNX

## Resumen

Nanbeige4.2-3B-ONNX es una exportación no oficial del modelo Nanbeige4.2-3B, desarrollado por el Nanbeige LLM Lab, realizada por el usuario RASMUS para su uso con Transformers.js sobre WebGPU. El modelo base es un transformer decoder de tipo Llama con 22 capas almacenadas que se ejecutan dos veces por token (44 capas efectivas en el grafo), lo que da lugar a un total de 3.000 millones de parámetros. La exportación emplea cuantización int4 con activaciones fp16 (`q4f16`) y un único grafo ONNX de 3,11 GB.

El interés de esta ficha radica en que permite ejecutar un modelo de 3B en el navegador mediante WebGPU, sin infraestructura de servidor. La exportación mantiene el modo de razonamiento (thinking) activado por defecto y conserva la plantilla de chat del modelo original. El contexto se ha recortado de los 262.144 tokens declarados por el proveedor a 32.768 tokens, límite impuesto por las tablas RoPE de la exportación.

La relevancia actual es doble: por un lado, demuestra la viabilidad de inferencia local en navegador con un modelo de tamaño medio; por otro, documenta de forma exhaustiva las modificaciones realizadas sobre los archivos del proveedor, algo poco habitual en exportaciones comunitarias. No se trata de una release oficial del Nanbeige LLM Lab.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder tipo Llama con bucle de 2 pasadas sobre 22 capas almacenadas (44 capas efectivas en el grafo) |
| Parametros totales | 3.000 millones (aproximado, segun el nombre del modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens en esta exportacion (el modelo original declara 262.144) |
| Tipos de cuantizacion | int4 con activaciones fp16 (`q4f16`); no hay variante q4 ni fp32 |
| Idiomas soportados | ingles (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`model_q4f16.onnx` + ficheros de datos externos) |

## Arquitectura y entrenamiento

El modelo base Nanbeige4.2-3B emplea una arquitectura transformer decoder con una innovación estructural: 22 capas almacenadas que se ejecutan dos veces por token, aplicando la normalización final después de cada pasada. La exportación ONNX replica este comportamiento en un único grafo: capas 0-21, normalización, reutilización de los mismos pesos como capas 22-43, normalización de nuevo y cabeza LM. Por ello, el `config.json` de la exportación describe un Llama de 44 capas y el grafo contiene 44 pares de caché KV (88 tensores `past`). Los pesos de la segunda pasada referencian los de la primera, que se almacenan una sola vez.

La conversión se realizó con el model builder de onnxruntime-genai 0.15.2 (int4 round-to-nearest, bloque de 32, objetivo WebGPU, cabeza LM solo en la última posición) a partir de los safetensors del proveedor. No se ejecutó código del repositorio del proveedor y los scripts de construcción no se publican. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en la información proporcionada.

## Capacidades

- Generación de texto conversacional en inglés y chino.
- Modo de razonamiento (thinking) activado por defecto, tal como en la plantilla del proveedor.
- Razonamiento de un solo turno y multi-turno mediante la plantilla de chat incluida (`chat_template.jinja`).
- Tool calling: no probado en esta exportación, según indica el autor.
- Capacidades de agente y razonamiento multi-paso: el modelo base se presenta como orientado a capacidades agénticas, aunque esta exportación no las ha validado.
- Sin soporte de visión ni audio en la información disponible.
- Inferencia en navegador mediante Transformers.js y WebGPU.

## Casos de uso

- Asistentes conversacionales en navegador: el modelo puede gestionar diálogos multi-turno con hasta 32.768 tokens de contexto, ejecutándose íntegramente en el cliente sin enviar datos a un servidor, lo que resulta adecuado para aplicaciones de privacidad sensible.
- Demos interactivas de IA en páginas web: al ejecutarse con Transformers.js sobre WebGPU, permite publicar una demo funcional sin backend ni costes de inferencia en la nube.
- Prototipado rápido de aplicaciones de chat: un desarrollador puede integrar el modelo en una aplicación web con pocas líneas de código y evaluar el comportamiento antes de migrar a una infraestructura mayor.
- Procesamiento de texto en inglés y chino en el cliente: útil para herramientas de resumen, reescritura o extracción de información en aplicaciones bilingües.
- Educación y experimentación: sirve para estudiar el comportamiento de modelos con bucle de capas y cuantización int4 en un entorno controlado como el navegador.
- Aplicaciones offline o de baja conectividad: una vez descargado el modelo (3,11 GB), la inferencia no requiere red, lo que habilita su uso en entornos con conectividad limitada.
- Evaluación de la calidad de la exportación: el propio autor documenta un subconjunto de 200 preguntas (100 de ARC-Challenge y 100 de MMLU) para comparar la exportación con una reimplementación en fp32, lo que permite reproducir la validación.

## Benchmarks y rendimiento

El autor publica mediciones de latencia y una comparación de precisión sobre un subconjunto, no benchmarks completos.

| Metrica | Valor | Condiciones |
|---|---|---|
| Prefill (prompt de 2.048 tokens) | 1.512 ms y 1.542 ms | Transformers.js 4.3.2, onnxruntime-web 1.30.0, Chrome 156 (Windows), RTX 4080; mejor de 2 ejecuciones tras warm-up |
| Decode (por token generado) | 15,9 ms y 16,7 ms | Misma configuración; mediana de 5 ejecuciones de 128 tokens tras prompt de 64 tokens |
| Precisión en subconjunto | 163/200 | Primeras 100 preguntas de ARC-Challenge test + 100 de MMLU test con semilla 0; thinking desactivado; acierto si el token más probable sobre todo el vocabulario es la letra de la opción correcta |
| Reimplementación fp32 en CPU (referencia) | 161/200 | Mismos ítems; McNemar exacto p = 0,824; no se detectó diferencia, pero no se demostró equivalencia |

No se han publicado resultados de benchmarks completos (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- WebGPU con soporte de `shader-f16`; no existe variante q4 ni fp32.
- Límite de buffer de GPU (`maxBufferSize`) de al menos 1.020.788.736 bytes, impuesto por el tensor de embeddings de tokens en fp16.
- Tamaño del repositorio: 3,1 GB (grafo ONNX más datos externos).
- GPU probada por el autor: NVIDIA RTX 4080 en Chrome 156 sobre Windows.
- No se dispone de datos de VRAM para otras GPU; el límite de buffer y el tamaño del modelo condicionan la compatibilidad.
- Despliegue: Transformers.js 4.3.2 con onnxruntime-web 1.30.0 en navegador. No se documentan opciones con vLLM, llama.cpp, Ollama ni TGI para esta exportación.
- Latencia medida: aproximadamente 1,5 s de prefill para 2.048 tokens y 16-17 ms por token generado en RTX 4080.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Nanbeige4.2-3B-ONNX (esta ficha) | ~3B | 32.768 | ONNX q4f16 | Apache 2.0 | Exportación comunitaria para WebGPU; thinking por defecto; tool calling no probado |
| Nanbeige4.2-3B (modelo base) | ~3B | 262.144 | safetensors | Apache 2.0 | Modelo original del Nanbeige LLM Lab; contexto 8 veces mayor; requiere código propio (`NanbeigeForCausalLM`) |
| Alternativas de ~3B para navegador | no disponible | no disponible | no disponible | no disponible | No se dispone de datos de modelos comparables en la información proporcionada |

## Limitaciones y advertencias

- No es una release oficial del Nanbeige LLM Lab; es una exportación comunitaria sin validación del proveedor.
- El contexto se reduce de 262.144 a 32.768 tokens por limitación de las tablas RoPE de la exportación.
- El tool calling no ha sido probado; no debe asumirse su funcionamiento en producción.
- Solo soporta inglés y chino; no hay soporte documentado de otros idiomas.
- Requiere WebGPU con `shader-f16` y un límite de buffer de GPU elevado; muchos navegadores y GPU consumer pueden no cumplir estos requisitos.
- El modo thinking está activado por defecto, lo que incrementa el número de tokens generados y la latencia si no se desactiva.
- La validación de precisión se limita a 200 ítems de ARC-Challenge y MMLU; no se demostró equivalencia con la implementación de referencia (p = 0,824 en McNemar, sin diferencia detectada pero sin prueba de equivalencia).
- Los scripts de construcción no se publican, lo que dificulta la reproducibilidad de la exportación.
- Riesgo de alucinación inherente a modelos de 3B; no se han publicado evaluaciones específicas de sesgo o robustez.
- Licencia Apache 2.0 permite uso comercial, pero al tratarse de una exportación derivada conviene revisar las obligaciones de atribución y las notas de modificación incluidas en `manifest.json` y `config.json`.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RASMUS/Nanbeige4.2-3B-ONNX
- Modelo base: https://huggingface.co/Nanbeige/Nanbeige4.2-3B
- Paper citado: arXiv:2607.22083 (Nanbeige4.2-3B: Unlocking Agentic Capabilities in a Compact Mode)
- Transformers.js: no disponible en la información proporcionada
- onnxruntime-genai: no disponible en la información proporcionada
