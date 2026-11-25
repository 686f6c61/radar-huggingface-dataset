# pranil00/ONIX-OLMo-2-1124-13B-Instruct-GGUF

## Resumen

ONIX-OLMo-2-1124-13B-Instruct-GGUF es una versión cuantizada en formato GGUF del modelo allenai/OLMo-2-1124-13B-Instruct, publicada por el usuario pranil00 bajo la etiqueta de la comunidad ONIX. Se trata de un artefacto de conversión, no de un entrenamiento nuevo: toma los pesos originales de OLMo 2 (13.715.783.680 parámetros, familia transformer) y los comprime mediante cuantización Q5_K_M (5,5 bits por peso), reduciendo el tamaño de 26,83 GB en FP16 a 9,22 GB, un ratio de compresión de 2,91x.

El objetivo declarado es facilitar la ejecución en hardware de consumo mediante el motor run-any-model, que adapta la carga del modelo según el dispositivo (Metal en Apple Silicon, CUDA en GPUs NVIDIA, AVX2/AVX-512 en CPU). La model card aporta perfiles de memoria concretos: 10,10 GB de memoria unificada en Apple Silicon, 10,72 GB de VRAM dedicada en GPUs NVIDIA RTX 30/40/50 y 12,10 GB de RAM libre en CPU, con ventanas de contexto óptimas de 8.192 tokens en aceleradores y 4.096 en CPU.

La relevancia de esta ficha es doble: por un lado documenta una ruta práctica para desplegar OLMo 2 de 13B en equipos sin GPUs de datacenter; por otro, conviene tratarla con cautela, porque las métricas de calidad ("~97,5% de retención cognitiva") y el informe de telemetría provienen del propio autor de la cuantización y no de una evaluación independiente con benchmarks estándar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia OLMo 2) |
| Parametros totales | 13.715.783.680 (13,72 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8.192 tokens en Apple Silicon y GPU NVIDIA; 4.096 tokens en CPU (ventana óptima según el autor; el contexto máximo del modelo base no se detalla en la información proporcionada) |
| Tipos de cuantizacion | Q5_K_M (5,5 bits por peso); KV cache en Q4_0 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (según la model card y los metadatos del repo) |
| Formato de pesos | GGUF (fichero `allenai--OLMo-2-1124-13B-Instruct-Q5_K_M.gguf`, 9,22 GB) |

## Arquitectura y entrenamiento

Esta publicación no entrena ningún modelo: es una conversión a GGUF del checkpoint allenai/OLMo-2-1124-13B-Instruct, que pertenece a la familia OLMo 2 de AI2, basada en transformer decoder-only. La model card solo confirma la familia arquitectónica y el recuento exacto de parámetros; no detalla número de capas, dimensiones ocultas, mecanismo de atención ni innovaciones concretas del modelo base. El informe de telemetría menciona "40/40 capas" aceleradas, dato que sugiere una profundidad de 40 capas, aunque no se presenta como especificación formal.

Tampoco se documentan en la información disponible los datos de entrenamiento del modelo original (número de tokens, composición del corpus, fases de SFT/DPO/RLHF) ni si hubo ajuste por preferencias. La única información técnica propia de esta publicación es el proceso de cuantización: Q5_K_M con KV cache en Q4_0, un ratio de compresión de 2,91x respecto a FP16 y una estimación del autor de retención de calidad del 97,5%. Esa cifra no está respaldada por una evaluación con benchmarks en la model card.

## Capacidades

- Generación de texto conversacional e instructiva, heredada del ajuste instructivo del modelo base OLMo 2.
- Razonamiento y respuesta a instrucciones en formato chat, con plantilla de conversación del modelo original.
- Ejecución local multiplataforma mediante GGUF: Metal (Apple Silicon), CUDA (NVIDIA) y CPU con AVX2/AVX-512.
- Integración con runtimes estándar de GGUF: llama.cpp, Ollama, LM Studio, Jan y Text-Generation-WebUI, según los ejemplos de la model card.
- Soporte de tool calling, function calling, modo thinking, visión, audio o agentes multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües específicas: no disponible; los idiomas del modelo base no se detallan en esta publicación.

## Casos de uso

- Asistente conversacional local en portátil: con 10,10 GB de memoria unificada en Apple Silicon (M1 a M5) y 8.192 tokens de contexto, el modelo puede mantener conversaciones multi-turno en un equipo sin GPU dedicada, útil para prototipado y uso personal.
- Despliegue en estación de trabajo con GPU de consumo: en una RTX 30/40/50 con 10,72 GB de VRAM dedicada cabe con aceleración CUDA completa, lo que permite usarlo como asistente de redacción o análisis de documentos sin depender de la nube.
- Procesamiento por lotes en servidores sin GPU: en CPU con 12,10 GB de RAM libre y contexto de 4.096 tokens, encaja en tareas de resumen, clasificación o extracción de información donde el throughput no es crítico.
- Evaluación y experimentación con modelos abiertos: al ser una conversión GGUF de un modelo Apache 2.0, sirve para comparar el comportamiento de OLMo 2 frente a otros modelos abiertos en pipelines de investigación reproducibles.
- Integración en herramientas de escritorio: al cargarse en LM Studio o Jan, puede actuar como motor de generación dentro de aplicaciones locales de escritura, traducción o soporte técnico interno.
- Base para ajuste fino o destilación posterior: los pesos cuantizados permiten inspeccionar el comportamiento del modelo en hardware modesto antes de invertir en infraestructura para un fine-tuning con los pesos completos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo incluye un informe de telemetría del propio autor con métricas de memoria y compresión, no de calidad de tarea:

| Metrica | FP16 (base) | Q5_K_M (esta publicacion) | Cambio |
|---|---|---|---|
| Precision | 16,0 bits/param | 5,5 bits/param | -65,6% |
| Tamano de pesos | 26,83 GB | 9,22 GB | -65,6% |
| KV cache | 800 MB (FP16) | 800 MB (Q4_0) | Optimizado |
| RAM residente total | 30,04 GB | 10,10 GB | -66,4% |
| Calidad estimada | 100% | 97,5% (estimacion del autor) | -2,5% |

Estas cifras son estimaciones del publicador y no equivalen a una evaluación con MMLU, HumanEval, GSM8K u otros benchmarks estándar.

## Requisitos de hardware

- VRAM estimada (Q5_K_M): 10,72 GB dedicados en GPU NVIDIA; 10,10 GB de memoria unificada en Apple Silicon; 12,10 GB de RAM libre en CPU.
- GPUs recomendadas según el autor: NVIDIA RTX serie 30, 40 y 50; Apple Silicon M1, M2, M3, M4 y M5 con Metal.
- Cabe en GPU de consumo: sí, en tarjetas con al menos 11-12 GB de VRAM efectiva (por ejemplo, RTX 3060 de 12 GB, RTX 4070, RTX 4080), siempre según los requisitos declarados por el autor.
- Opciones de despliegue: run-any-model CLI, Ollama (mediante Modelfile), llama.cpp (`llama-cli -ngl 99 -cnv`), LM Studio, Jan y Text-Generation-WebUI.
- Latencia y throughput: no disponible; la model card no publica tokens por segundo ni tiempos de primera respuesta.
- Contexto práctico: 8.192 tokens en aceleradores y 4.096 en CPU, según la tabla del autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ONIX-OLMo-2-1124-13B-Instruct-GGUF (esta publicacion) | 13,72 B | 8.192 (GPU/Apple) / 4.096 (CPU) | GGUF Q5_K_M, 9,22 GB | Apache 2.0 | Hugging Face, 0 descargas |
| allenai/OLMo-2-1124-13B-Instruct (base) | 13,72 B | no disponible en esta informacion | safetensors (FP16, ~26,83 GB) | Apache 2.0 | Hugging Face (AI2) |
| Mistral-7B-Instruct (GGUF) | 7,2 B | 32.768 (modelo original) | GGUF, multiples cuantizaciones | Apache 2.0 | Amplia disponibilidad |
| Llama 3.1 8B Instruct (GGUF) | 8,0 B | 131.072 (modelo original) | GGUF, multiples cuantizaciones | Llama 3.1 Community License | Amplia disponibilidad |

La comparación con Mistral y Llama se ofrece solo como referencia de categoría (modelos abiertos de tamano medio con versiones GGUF); no se dispone de datos de rendimiento comparativo en la información proporcionada.

## Limitaciones y advertencias

- Las cifras de calidad ("~97,5% de retención cognitiva") y el informe de telemetría son estimaciones del autor de la cuantización, no resultados de benchmarks independientes.
- La cuantización Q5_K_M introduce pérdida de precisión respecto a FP16; el impacto real en tareas de razonamiento y código no está medido en esta publicación.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso comunitario ni validación externa.
- No se documentan los idiomas soportados ni el contexto máximo real del modelo base; los 8.192 tokens son la ventana "óptima" declarada por el autor, no necesariamente el límite del modelo.
- Riesgo de alucinación y sesgos: no evaluados en esta publicación; deben asumirse los del modelo base OLMo 2, sin datos específicos disponibles aquí.
- La model card incluye una cláusula de exención de responsabilidad total sobre los resultados generados; en producción conviene auditar las salidas de forma independiente.
- Aunque la licencia declarada es Apache 2.0, la publicación es una conversión no oficial de un tercero; para uso comercial conviene verificar también los términos del modelo base de AI2.
- El ecosistema run-any-model es un proyecto pequeño del propio autor; la compatibilidad futura con versiones de llama.cpp u otros runtimes no está garantizada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/pranil00/ONIX-OLMo-2-1124-13B-Instruct-GGUF
- Modelo base: https://huggingface.co/allenai/OLMo-2-1124-13B-Instruct
- Organización ONIX en Hugging Face: https://huggingface.co/ONIX
- Repositorio run-any-model: https://github.com/PranilShah-08/run-any-model
