# salgr/SalgrAI_v2.1

## Resumen

SalgrAI-v2.1 es un modelo de lenguaje de tipo decoder-only derivado de google/gemma-3-270m-it, afinado por el desarrollador individual "salgr" para conversacion casual breve en ruso. Tras el recorte de vocabulario, el modelo publica 131.105.536 parametros (100,3 M en capas y 30,8 M en la tabla de embeddings de 48.093 tokens), lo que lo situa en la categoria de modelos diminutos (tiny-model) orientados a experimentacion y demostraciones.

El modelo resuelve un problema concreto: mantener coherencia en dialogos multi-turno cortos en ruso, recordando datos previos de la conversacion (nombre, ciudad, color, numeros, continuacion de aritmetica o codigo). Frente a su version anterior (v2), es mas conciso, puede escribir y continuar funciones simples de Python y retiene hechos del dialogo, aunque no mejora a v2 en todas las pruebas.

Es relevante ahora porque demuestra tecnicas de optimizacion aplicables a modelos pequenos: poda de vocabulario (de 262.144 a 48.093 tokens), fine-tuning completo en bf16 con embeddings congelados y model soup (promediado de pesos de dos ejecuciones). Todo el desarrollo se realizo en una unica RTX 3060. El autor lo declara explicitamente para experimentos, demos y aprendizaje, no para uso serio en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gemma 3 decoder-only: 18 capas, hidden 640, 4 cabezas (1 KV head), FFN 2048 |
| Parametros totales | 131.105.536 (100.326.016 en capas + 30.779.520 en embeddings) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (la configuracion de llama-server del autor usa `-c 1024`; no se especifica el maximo oficial) |
| Tipos de cuantizacion | bfloat16 (safetensors), float16 (GGUF F16), 8-bit Q8_0 (GGUF), 4-bit Q4_K_M (GGUF, no evaluado) |
| Idiomas soportados | Ruso (ingles solo en fragmentos, debil) |
| Licencia | Gemma Terms of Use |
| Formato de pesos | safetensors (bfloat16), GGUF (F16, Q8_0, Q4_K_M) |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only de tipo Gemma 3 con 18 capas, dimension oculta de 640, 4 cabezas de atencion con una sola KV head (atencion con query grouping) y FFN de 2048. El vocabulario original de Gemma 3 (262.144 tokens) se podo a 48.093 tokens, conservando cirilico, ASCII, puntuacion, emoji, tokens de byte y tokens especiales. Esta poda reduce el tamano de la tabla de embeddings, que aun asi representa aproximadamente el 23,5 % de los parametros totales. El modelo usa la plantilla de chat de Gemma: `<start_of_turn>user ... <end_of_turn><start_of_turn>model ...`.

El entrenamiento consistio en dos ejecuciones de fine-tuning completo en bf16 con la tabla de embeddings congelada, 3 epocas, perdida calculada solo sobre los tokens de respuesta y seleccion de la mejor epoca por perdida de validacion. Los datos fueron 31.510 y 35.871 dialogos cortos (grupos pequenos repetidos 2-4 veces): chat casual, dialogos de conocimiento simple, fundamentos de Python (incluyendo verificacion por ejecucion), autoidentificacion y 6.689 dialogos multi-turno donde la ultima respuesta es imposible sin los mensajes previos. Parte de los dialogos fue escrita por Claude Haiku a partir de una especificacion y parte generada por scripts. Los pesos publicados son el promedio de dos ejecuciones (weight soup de la ejecucion 1 epoca 2 y la ejecucion 2 epoca 1), decision tomada antes de ver los resultados de benchmarks. Se aplico un filtro de fuga que elimino dialogos que repetian prompts de benchmark, compartian palabras clave y respuesta o contenian fragmentos de codigo del benchmark SBKCB (0 coincidencias de fragmentos en los datos finales).

## Capacidades

- Generacion de texto conversacional breve en ruso, con estilo conciso.
- Memoria de contexto multi-turno: retiene hechos previos del dialogo (nombre, ciudad, color, numero) y responde preguntas que dependen de mensajes anteriores.
- Continuacion de aritmetica simple y de conversaciones previas ("repite eso", "y tu?").
- Escritura y continuacion de funciones simples de Python.
- Dialogos de conocimiento basico (debil, ver limitaciones).
- Autoidentificacion.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta capacidad de vision, audio ni modo thinking.
- Capacidad multilingue practicamente nula fuera del ruso (ingles solo en fragmentos).

## Casos de uso

- Demostracion educativa de fine-tuning de modelos diminutos: el modelo sirve para ilustrar tecnicas de poda de vocabulario, congelacion de embeddings y model soup en un unico equipo con RTX 3060, con todos los artefactos (safetensors y GGUF) publicados.
- Prototipado de asistentes conversacionales en ruso con memoria de dialogo: util para validar flujos de conversacion multi-turno donde el modelo debe recordar datos aportados por el usuario (nombre, ciudad) antes de invertir en modelos mayores.
- Pruebas de integracion de pipelines de chat: el modelo permite validar plantillas de chat de Gemma, gestion de historial (el script `chat_example.py` conserva los ultimos 8 mensajes) y configuracion de muestreo (temperatura 0.5, top_k 40, top_p 0.9, repeat_penalty 1.1) en entornos de desarrollo.
- Evaluacion comparativa de cuantizaciones: al publicar versiones bf16, F16, Q8_0 y Q4_K_M, permite medir el impacto de la cuantizacion en un modelo de 131 M de parametros (el autor reporta 58/56/53 puntos en SBKCB para bf16/F16/Q8_0).
- Despliegue local en hardware modesto: con Q8_0 (141 MB) o Q4_K_M (102 MB) puede ejecutarse en CPU o en GPUs de gama baja mediante llama.cpp u Ollama, adecuado para demos offline.
- Generacion de fragmentos de codigo Python muy simples en entornos de prueba: el modelo puede escribir o continuar funciones basicas, util como ejemplo de capacidades de codigo en modelos diminutos, no para produccion.
- Servicio de chat ligero via API compatible con OpenAI: el autor documenta `llama-server` con endpoint `/v1/chat/completions`, lo que permite integrarlo en prototipos que ya usan esa interfaz.

## Benchmarks y rendimiento

Los unicos datos disponibles provienen de la evaluacion propia del autor sobre el benchmark SBKCB V1.0 (150 preguntas: 90 de conocimiento, 20 de Python, 40 de conversacion), con temperatura 0, repetition penalty 1.1 y un solo mensaje sin historial. El autor advierte que las diferencias de 3-4 puntos son ruido.

| Modelo | Total (de 150) | Conocimiento /90 | Codigo /20 | Conversacion /40 |
|---|---|---|---|---|
| SalgrAI-v2.1 (bf16) | 58 | 16 | 14 | 28 |
| SalgrAI-v2.1 (F16 GGUF) | 56 | 16 | 13 | 27 |
| SalgrAI-v2.1 (Q8_0 GGUF) | 53 | 15 | 12 | 26 |
| SalgrAI-v2 (Q8_0 GGUF) | 56 | 19 | 6 | 31 |
| Qwen2.5-Coder-0.5B-Instruct (no propio) | 59 | 18 | 19 | 22 |
| SalgrAI-v2-Pro-Full (Q8_0 GGUF) | 62 | 17 | 18 | 27 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,26 GB en bfloat16 (safetensors), 0,26 GB en F16 GGUF, 0,14 GB en Q8_0 y 0,10 GB en Q4_K_M, mas el overhead del runtime y la cache KV.
- GPU recomendadas: cualquier GPU consumer con al menos 1-2 GB de VRAM libre; el autor desarrollo y entreno el modelo en una unica RTX 3060.
- Cabe en cualquier GPU consumer moderna (GTX 1060, RTX 3060, RTX 4090, etc.) e incluso puede ejecutarse en CPU.
- Opciones de despliegue: transformers (bfloat16 o float32, nunca float16 por inestabilidad numerica de Gemma 3), llama.cpp (`llama-server`), Ollama y cualquier runtime compatible con GGUF. El modelo esta etiquetado como compatible con text-generation-inference y endpoints.
- Latencia y throughput estimados: no disponibles. El autor usa una ventana de contexto de 1024 tokens en su configuracion de llama-server.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | SBKCB (total) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SalgrAI-v2.1 | 131 M | no disponible | 58 (bf16) | Gemma Terms of Use | Hugging Face (safetensors + GGUF) |
| SalgrAI-v2 | no disponible | no disponible | 56 (Q8_0) | Gemma Terms of Use | Hugging Face |
| Qwen2.5-Coder-0.5B-Instruct | 0,5 B (aprox.) | no disponible | 59 | no disponible en la informacion | Hugging Face |
| SalgrAI-v2-Pro-Full | no disponible | no disponible | 62 (Q8_0) | no disponible en la informacion | Hugging Face |

La comparativa se limita a los datos del benchmark propio del autor; no hay datos de benchmarks estandar que permitan comparaciones con modelos de referencia como Gemma 3 270M-it original o Llama 3.2 1B.

## Limitaciones y advertencias

- Conocimiento debil: el autor lo declara explicitamente; la puntuacion en conocimiento es de 16/90 en bf16.
- Sin filtro de seguridad propio mas alla del de Gemma; no apto para entornos donde se requiera moderacion de contenido.
- Benchmark ruidoso: el mismo modelo obtiene 58/56/53 puntos en bf16/F16/Q8_0 y las dos ejecuciones promediadas obtuvieron 59 y 52, por lo que diferencias de 3-4 puntos no son significativas.
- Idioma limitado al ruso; el ingles es debil y solo aparece en fragmentos.
- No apto para uso serio en produccion segun el propio autor; orientado a experimentos, demos y aprendizaje.
- Licencia Gemma Terms of Use: impone restricciones de uso comercial y obligaciones de atribucion; es necesario revisar y adjuntar una copia de los terminos.
- Inestabilidad numerica en float16: Gemma 3 requiere bfloat16 o float32 para inferencia correcta.
- El vocabulario podado (48.093 tokens) no es compatible con el tokenizer original de Gemma 3 ni con el de SalgrAI-v2 (47.544 tokens).
- Los dialogos de entrenamiento no se publican, lo que limita la reproducibilidad.
- La version Q4_K_M no fue evaluada.
- Riesgo de alucinacion elevado por el tamano reducido del modelo y su base de conocimiento limitada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/salgr/SalgrAI_v2.1
- Modelo base: https://huggingface.co/google/gemma-3-270m-it
- Benchmark SBKCB V1.0: https://salgr.top/freeopus/benchmarks/sbkcb
- Version en ruso de la model card: README_RU.md (en el repositorio de Hugging Face)
- Terminos de uso de Gemma: no disponible en la informacion proporcionada (referenciados como Gemma Terms of Use)
