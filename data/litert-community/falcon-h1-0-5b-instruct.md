# litert-community/Falcon-H1-0.5B-Instruct

## Resumen

Falcon-H1-0.5B-Instruct en formato LiteRT-LM es una conversión del modelo `tiiuae/Falcon-H1-0.5B-Instruct` de TII (Technology Innovation Institute) al formato `.litertlm`, empaquetado por la comunidad `litert-community` para inferencia en dispositivo con el runtime LiteRT-LM de Google. El objetivo es claro: ofrecer un modelo conversacional de 0,5 mil millones de parámetros que quepa y funcione en teléfonos móviles, portátiles y dispositivos de borde sin depender de la nube.

La relevancia técnica del artefacto radica en su arquitectura: Falcon-H1 es un diseño híbrido en el que cada una de las 36 capas ejecuta en paralelo una rama de atención con grouped-query attention (GQA) y una rama de espacio de estados Mamba2 (selective scan), sumando sus salidas sobre la misma entrada. Según la model card, se trata del primer Falcon-H1 en formato LiteRT y del primer modelo totalmente híbrido servido por el runtime publicado, incluida la ruta GPU.

El paquete se distribuye como un único fichero int8 de 650 MB con cuantización dinámica en capas lineales y embeddings, mientras que las convoluciones y el scan permanecen en coma flotante. Requiere litert-lm ≥ 0.15 y está pensado para ejecutarse tanto en CPU como en GPU (Metal en iOS, OpenCL en Android).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido: 36 capas con atención GQA y Mamba2 SSM en paralelo por capa |
| Parametros totales | 0,5 mil millones (modelo base Falcon-H1-0.5B-Instruct) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (firmas de prefill exportadas de 1 a 1024 tokens) |
| Tipos de cuantizacion | int8 dinámica en lineales y embedding; convoluciones y scan en float; activaciones fp32 declaradas para GPU |
| Idiomas soportados | no disponible |
| Licencia | Falcon LLM License (falcon-llm-license) |
| Formato de pesos | `.litertlm` (LiteRT-LM); fichero int8 de 650 MB; repositorio de 2,0 GB |

## Arquitectura y entrenamiento

Falcon-H1 emplea una arquitectura híbrida poco habitual: cada una de las 36 capas procesa la misma entrada con dos ramas paralelas, una de atención con grouped-query attention y otra de Mamba2 con selective scan, y suma ambas salidas. Como consecuencia, cada capa mantiene simultáneamente una caché KV y un estado recurrente de tamaño constante (convolución más SSM), lo que reduce el crecimiento de memoria con la longitud de secuencia frente a un transformer puro. El artefacto publicado es una conversión del checkpoint instruct original de TII, no un reentrenamiento.

La conversión conserva tokenizador y plantilla de chat ChatML de Falcon-H1, y exporta firmas de prefill de múltiples longitudes (1 a 1024) para que el runtime seleccione fragmentos ajustados. La model card reporta verificación de fidelidad: coincidencia de logits frente a PyTorch con diferencia máxima de 7,6e-05 y correlación 1,000000 en 8 posiciones de decodificación, con top-1 y top-5 idénticos. No se detallan en la información disponible el volumen de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el modelo base.

## Capacidades

- Generación de texto conversacional multi-turno con plantilla de chat ChatML.
- Razonamiento básico y aritmética simple, limitado por el tamaño de 0,5B: la propia model card documenta fallos en preguntas como el producto 8×7.
- Comprensión multilingüe parcial: en la prueba de sanidad responde correctamente a una pregunta en francés ("merci"), aunque no se declaran idiomas oficialmente soportados.
- Inferencia en dispositivo con backend CPU y GPU (Metal en iOS, OpenCL en Android).
- Prefill fragmentado con firmas de 1 a 1024 tokens para latencias de primer token ajustadas.
- No se documenta soporte de tool calling, function calling, agentes, visión ni audio en la información disponible.

## Casos de uso

- Asistentes conversacionales offline en aplicaciones móviles: el fichero int8 de 650 MB cabe en el almacenamiento de un teléfono y permite diálogos sin conexión con 52,7 tok/s de decodificación en GPU Metal (iPhone 17 Pro), adecuado para respuestas cortas en tiempo real.
- Clasificación y extracción de información en el borde: con TTFT de 0,10 s en GPU de escritorio y 0,46 s en iPhone 17 Pro, el modelo puede etiquetar textos, resumir notas o extraer campos de formularios dentro de la propia aplicación sin enviar datos a servidores.
- Autocompletado y asistencia de escritura en teclados móviles: el coste de memoria contenido (0,66 GB en CPU en iPhone 17 Pro) permite mantener el modelo residente mientras el usuario escribe.
- Enrutamiento y preprocesado en pipelines de agentes: por su tamaño, sirve como primer escalón para decidir si una consulta requiere un modelo mayor en la nube, reduciendo coste y latencia en consultas triviales.
- Demos y prototipos de investigación en arquitecturas híbridas: al ser el primer Falcon-H1 totalmente híbrido servido en LiteRT, es útil para estudiar el comportamiento de atención más Mamba2 en hardware de consumo.
- Aplicaciones de privacidad estricta (salud, legal, finanzas personales): al ejecutarse íntegramente en el dispositivo, los datos del usuario no salen del terminal, lo que facilita el cumplimiento de requisitos de residencia de datos.
- Pruebas de regresión de runtimes: los informes de coincidencia de logits y de robustez de prefill lo convierten en una referencia práctica para validar nuevas versiones de LiteRT-LM en CPU y GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. La model card aporta métricas de rendimiento de inferencia y pruebas de calidad:

| Prueba | Resultado |
|---|---|
| Coincidencia de logits frente a PyTorch (8 posiciones) | max\|diff\| 7,6e-05; correlación 1,000000; top-1 y top-5 idénticos |
| Sanidad de 8 preguntas (int8 = float = GPU) | 6/8 aciertos en las tres rutas, texto casi idéntico |
| Barrido de longitud de prefill (12–60 tokens) | 41/41 correctos |
| Prueba compuesta en iPhone 17 Pro (Metal) | 7/8 |

| Backend y plataforma | Prefill | Decode | TTFT |
|---|---|---|---|
| GPU, Apple M4 Max (256/256, 3 ejecuciones) | 2650 tok/s | 127,5 tok/s | 0,10 s |
| CPU, Apple M4 Max (256/256, 3 ejecuciones) | 473 tok/s | 59,0 tok/s | 0,56 s |
| iPhone 17 Pro, GPU Metal (prompt de 145 tokens) | 365,9 tok/s | 52,7 tok/s | 0,46 s |
| iPhone 17 Pro, CPU (prompt de 145 tokens) | 332,3 tok/s | 36,2 tok/s | 0,48 s |
| Pixel 8a, OpenCL (prompt de 19 tokens) | 23,6 tok/s | 11,8 tok/s | 0,93 s |
| Pixel 8a, CPU (prompt de 212 tokens) | 89,6–98,7 tok/s | 22,5–25,9 tok/s | 2,19–2,41 s |

## Requisitos de hardware

- VRAM y memoria: el fichero int8 ocupa 650 MB; la memoria pico medida es de 2,50 GB en GPU Metal (iPhone 17 Pro) y 0,66 GB en CPU (iPhone 17 Pro); en Pixel 8a CPU, 1373–1374 MiB.
- GPU recomendadas: Apple Silicon (M4 Max medido), GPU Metal en iPhone recientes, Qualcomm Adreno y Arm Mali con OpenCL. No se documentan pruebas en A100, H100 ni RTX 4090.
- GPU de consumo: cabe holgadamente en cualquier GPU de consumo moderna por tamaño, aunque la ruta soportada oficialmente es LiteRT-LM en dispositivos móviles y Apple Silicon, no CUDA.
- Despliegue: exclusivamente mediante el runtime LiteRT-LM (comando `litert-lm run`, con `--backend gpu` o `cpu`); no se distribuyen pesos en GGUF, safetensors ni formatos para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: ver tabla de benchmarks; en Pixel 8a la GPU resultó más lenta que la CPU (11,8 frente a 22,5–25,9 tok/s), y el manifiesto recomienda `cpu` en Android de gama 8 GB hasta disponer de una comparación con el mismo binario.
- Inicialización: en Pixel 8a CPU, el arranque del motor tarda entre 4,5 y 6,6 s.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato y runtime | Licencia | Notas |
|---|---|---|---|---|---|
| Falcon-H1-0.5B-Instruct (LiteRT-LM) | 0,5B | no disponible | `.litertlm`, LiteRT-LM | Falcon LLM License | Híbrido atención + Mamba2; orientado a dispositivo |
| tiiuae/Falcon-H1-0.5B-Instruct | 0,5B | no disponible | safetensors (transformers) | Falcon LLM License | Modelo base original; requiere PyTorch o runtime compatible |
| Alternativas on-device de ~0,5B | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificados en la informacion proporcionada |

## Limitaciones y advertencias

- Capacidad limitada por tamaño: con 0,5B de parámetros falla en tareas elementales (la model card cita el producto 8×7 y una respuesta en francés), por lo que no es apto para razonamiento complejo ni matemáticas fiables.
- Riesgo de alucinación alto en dominios factuales; requiere validación externa en producción.
- Bug de estado recurrente en litert-lm 0.18.0: reutilizar un mismo Engine para varias conversaciones reutiliza el estado de la anterior e ignora el nuevo system prompt. El arreglo llegó en el commit e1f86b05 (2026-11-03) y está incluido en LiteRT-LM v0.20.0, pero este modelo no se probó con Engine compartido en esa versión. Recomendación: crear un Engine nuevo por conversación.
- El fichero publicado el 2026-11-09 no se ha ejecutado en teléfono; las mediciones móviles corresponden al empaquetado anterior.
- En Android de gama baja la GPU puede ser más lenta que la CPU; el manifiesto recomienda `cpu` en dispositivos de 8 GB.
- Idiomas soportados no declarados oficialmente; el multilingüismo es anecdótico.
- Licencia Falcon LLM License: no es una licencia open source estándar; deben revisarse los términos en falconllm.tii.ae antes de uso comercial.
- Sin soporte documentado de tool calling, agentes, visión o audio; no apto para pipelines que exijan esas capacidades.
- Dependencia estricta de litert-lm ≥ 0.15; no hay ruta de despliegue en servidores con CUDA.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/litert-community/Falcon-H1-0.5B-Instruct
- Modelo base: https://huggingface.co/tiiuae/Falcon-H1-0.5B-Instruct
- Runtime LiteRT-LM: https://github.com/google-ai-edge/litert-lm
- Release v0.20.0 de LiteRT-LM: https://github.com/google-ai-edge/LiteRT-LM/releases/tag/v0.20.0
- Commit del arreglo de estado recurrente: https://github.com/google-ai-edge/LiteRT-LM/commit/e1f86b05bf8a731331622a2622440e9f93d9a9f5
- Informe del problema de Engine compartido: https://github.com/google-ai-edge/LiteRT-LM/issues/3165
- Términos de licencia Falcon: https://falconllm.tii.ae/falcon-terms-and-conditions.html
