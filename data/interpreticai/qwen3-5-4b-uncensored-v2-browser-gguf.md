# InterpreticAI/Qwen3.5-4B-Uncensored-v2-Browser-GGUF

## Resumen

Qwen3.5-4B-Uncensored-v2-Browser-GGUF es una compilación cuantizada en formato GGUF del modelo InterpreticAI/Qwen3.5-4B-Uncensored-v2, un transformer de 4.326.350.848 parámetros (aproximadamente 4,3 mil millones) afinado para reducir los rechazos ante peticiones dañinas. Lo publica InterpreticAI (Thomas Young) bajo licencia Apache 2.0 y está pensado específicamente para inferencia en navegador y en dispositivo mediante runtimes WebAssembly/WebGPU como wllama, así como en móviles con unos 2 GB de memoria disponible.

El paquete incluye una única cuantización principal, IQ3_XXS, de 1,86 GB, que reduce el peso del modelo original en BF16 (8,67 GB) a menos de una cuarta parte, y un proyector multimodal opcional (mmproj F16, 0,67 GB) que habilita la entrada de imágenes. La propuesta es clara: conservar el efecto del afinado "uncensored" en un tamaño que quepa en un navegador, a cambio de una pérdida medible de capacidad general.

Su relevancia actual radica en la combinación de dos factores poco habituales: el despliegue íntegro en cliente (sin servidor ni GPU dedicada) y un modelo calibrado para no rechazar peticiones. El autor documenta explícitamente el coste de esa compresión: MMLU cae unos 9 puntos frente al original (63,0 frente a 72,7) y las respuestas largas degeneran o no terminan con más frecuencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (hereda la del modelo base Qwen3.5-4B; detalles de capas y atención no disponibles) |
| Parametros totales | 4.326.350.848 (aprox. 4,3 mil millones) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion; el autor recomienda 4096 tokens o menos en telefonos |
| Tipos de cuantizacion | IQ3_XXS (unica cuantizacion del texto); proyector multimodal en F16 |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); repo de 2,5 GB |
| Tamano del modelo de texto | 1,86 GB (IQ3_XXS) |
| Tamano del proyector (mmproj) | 0,67 GB (F16), opcional para entrada de imagen |
| Modelo base | InterpreticAI/Qwen3.5-4B-Uncensored-v2 |
| DOI | 10.57967/hf/11549 |
| Descargas | 721 |

## Arquitectura y entrenamiento

El modelo es un transformer denso de aproximadamente 4,3 mil millones de parámetros, derivado de Qwen3.5-4B y posteriormente afinado por InterpreticAI para producir la variante Uncensored-v2. La información disponible no detalla la composición del dataset de entrenamiento, el número de tokens utilizados ni si se emplearon técnicas de RLHF o DPO; únicamente se documenta el efecto del afinado sobre el comportamiento de rechazo y sobre la calidad general.

La innovación principal de esta compilación no está en la arquitectura, sino en la ingeniería de compresión y despliegue: se ofrece una cuantización IQ3_XXS (1,86 GB) pensada para caber en memoria de navegador y en móviles, junto con un proyector multimodal separado en F16 que se carga solo cuando se necesita entrada de imagen. El autor documenta el impacto de esa cuantización agresiva mediante una tabla comparativa de calidad, que se reproduce en la sección de benchmarks. No se dispone de información sobre innovaciones de atención, decodificación especulativa ni detalles del preentrenamiento.

## Capacidades

- Generación de texto conversacional (pipeline text-generation, etiqueta conversational).
- Entrada de imagen opcional mediante el proyector mmproj F16 (multimodalidad).
- Comportamiento "uncensored": reducción documentada de rechazos ante peticiones dañinas (89 sobre 100 en esta cuantización, frente a 99 del original).
- Inferencia en navegador y en dispositivo mediante llama.cpp y runtimes WebAssembly/WebGPU como wllama.
- Soporte de plantillas de chat vía `--jinja` en llama-server.
- Compatibilidad con endpoints (etiqueta endpoints_compatible).
- No se dispone de información sobre soporte de tool calling, function calling, razonamiento multi-paso, modo thinking explícito ni capacidades de audio.

## Casos de uso

- Chat en navegador sin backend: el modelo se ejecuta íntegramente en el cliente mediante wllama/WebGPU, de modo que las conversaciones no salen del dispositivo. Sus 1,86 GB y la recomendación de 4096 tokens de contexto lo hacen viable en equipos de consumo.
- Aplicaciones móviles offline: con unos 2 GB de memoria disponible, puede integrarse en apps Android/iOS como asistente local sin conexión de red.
- Procesamiento de imágenes en local: cargando el mmproj F16 (0,67 GB) el modelo acepta entradas visuales, útil para describir o extraer información de capturas y fotos sin enviar datos a un servidor.
- Prototipado rápido de producto conversacional: el tamaño reducido permite iterar sobre prompts y plantillas de chat con llama-server (`-c 4096 --jinja`) en portátiles sin GPU dedicada.
- Investigación sobre alineación y rechazo: la tabla de calidad del autor (tasa de rechazo, respuestas degeneradas, respuestas censuradas) sirve como base para estudiar el equilibrio entre supresión de rechazos y degradación de capacidades.
- Generación de texto creativo sin filtros en entornos controlados: el perfil uncensored resulta adecuado para escritura de ficción o guiones donde los filtros estándar interrumpen la generación, siempre con revisión humana.
- Demos educativas de IA en el navegador: al no requerir infraestructura, es apto para talleres y materiales didácticos que muestren inferencia LLM en cliente.

## Benchmarks y rendimiento

Datos publicados por el autor en la model card (1.000 ítems MMLU en modo no-thinking; 100 prompts de petición dañina; 110 prompts neutros; 51 ítems de Pan y Xu que el modelo original conoce):

| Metrica | Qwen3.5-4B (original) | Uncensored-v2 BF16 | Uncensored-v2 Q4_K_M | Esta build (IQ3_XXS) |
|---|---|---|---|---|
| Tamano del modelo de texto | 8,67 GB | 8,67 GB | 2,78 GB | 1,86 GB |
| MMLU (1.000 items, non-thinking) | 72,7 | 72,3 | 72,1 | 63,0 |
| Tasa de rechazo ante peticiones dañinas (100 prompts) | 99 | 93 | 95 | 89 |
| Respuestas degeneradas en 110 prompts neutros | 8 | 13 | 11 | 24 |
| Respuestas censuradas en items Pan y Xu conocidos por el original (de 51) | 47 | 11 | 14 | 11 |

Interpretación: la reducción de censura se conserva en esta cuantización (11 respuestas censuradas frente a 47 del original), pero el coste es notable en capacidad general (MMLU 63,0, unos 9 puntos por debajo) y en estabilidad de las respuestas largas (24 respuestas degeneradas frente a 8 del original). No se han publicado otros resultados de benchmarks (HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM/RAM estimada: 1,86 GB para el modelo de texto en IQ3_XXS; 0,67 GB adicionales si se carga el proyector de imagen.
- Memoria mínima práctica: el autor indica que funciona en móviles con unos 2 GB de memoria disponible.
- GPU: no se especifican modelos concretos; al ejecutarse vía WebGPU/WebAssembly en navegador y vía llama.cpp en dispositivo, funciona en GPUs integradas y de consumo. No se dispone de datos de rendimiento en A100/H100/RTX 4090.
- Cabe en GPU de consumo: sí, con amplio margen (menos de 2 GB de pesos); también en CPU y en navegador.
- Opciones de despliegue: llama.cpp (`llama-server`), runtimes de navegador basados en WebAssembly/WebGPU como wllama. No se mencionan vLLM, TGI ni Ollama en la información disponible.
- Contexto recomendado: 4096 tokens o menos en teléfonos.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MMLU (segun autor) | Licencia | Formato / despliegue |
|---|---|---|---|---|---|
| Qwen3.5-4B-Uncensored-v2-Browser-GGUF (IQ3_XXS) | 4,3 mil M | no disponible (recom. 4096 en movil) | 63,0 | Apache 2.0 | GGUF, navegador/movil |
| Qwen3.5-4B-Uncensored-v2 (BF16) | 4,3 mil M | no disponible | 72,3 | Apache 2.0 | BF16, 8,67 GB |
| Qwen3.5-4B-Uncensored-v2-GGUF (Q4_K_M) | 4,3 mil M | no disponible | 72,1 | Apache 2.0 | GGUF Q4_K_M, 2,78 GB |
| Qwen3.5-4B (original) | 4,3 mil M | no disponible | 72,7 | no disponible en la informacion | safetensors |

La comparativa relevante es interna a la familia: frente a la variante Q4_K_M (2,78 GB, MMLU 72,1) esta build sacrifica unos 9 puntos de MMLU y duplica las respuestas degeneradas (24 frente a 11) a cambio de un 33 % menos de tamaño, lo que la hace apta para navegador y móvil donde Q4_K_M no cabría con holgura. No se dispone de información sobre modelos comparables de otros autores.

## Limitaciones y advertencias

- Pérdida de capacidad general: MMLU cae a 63,0 (unos 9 puntos por debajo del original) por la cuantización IQ3_XXS.
- Inestabilidad en respuestas largas: 24 respuestas degeneradas sobre 110 prompts neutros, frente a 8 del original; el autor advierte de repeticiones y fallos de terminación.
- Modelo "uncensored": reduce deliberadamente los rechazos (89/100 frente a 99/100), lo que implica mayor probabilidad de generar contenido dañino, ofensivo o inexacto; requiere moderación externa en producción.
- Riesgo de alucinación: no cuantificado en la información disponible, pero esperable en un modelo de 4,3 mil millones de parámetros y agravado por la cuantización agresiva.
- Contexto limitado en móvil: se recomienda no superar 4096 tokens en teléfonos; la longitud máxima real no está documentada.
- Idiomas: no se especifica qué idiomas soporta; no debe asumirse un rendimiento multilingüe sin evaluación.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías sobre el comportamiento del modelo ni sobre el cumplimiento normativo del contenido generado.
- Sesgos: no documentados en la información disponible; la ausencia de filtros puede amplificar sesgos presentes en los datos de entrenamiento.
- El repositorio registra 0 likes y 721 descargas, con actualización en noviembre de 2026; no hay evidencia de mantenimiento continuado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/InterpreticAI/Qwen3.5-4B-Uncensored-v2-Browser-GGUF
- Modelo base: https://huggingface.co/InterpreticAI/Qwen3.5-4B-Uncensored-v2
- Variante GGUF de mayor calidad (Q4_K_M): https://huggingface.co/InterpreticAI/Qwen3.5-4B-Uncensored-v2-GGUF
- DOI de la ficha: https://doi.org/10.57967/hf/11549
- llama.cpp: https://github.com/ggml-org/llama.cpp
- wllama (runtime de navegador): no disponible en la información proporcionada
