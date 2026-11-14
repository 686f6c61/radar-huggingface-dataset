# chintanjv/BatLM-v3-360m

## Resumen

BatLM-v3-360m es un ajuste fino (fine-tune) de SmolLM2-360M-Instruct orientado a responder preguntas sobre el universo de Batman a partir de pasajes recuperados (RAG). Lo desarrolla el usuario independiente chintanjv como proyecto educativo y de fan, y su objetivo no es competir en capacidades generales, sino demostrar un pipeline completo de recuperación y generación que se ejecuta íntegramente en el navegador mediante transformers.js, ONNX Runtime y WebGPU.

El modelo parte de la arquitectura Llama de SmolLM2-360M-Instruct (360 millones de parámetros, transformer decoder-only denso) y se especializa mediante LoRA (r=16 sobre todas las capas lineales, 2 épocas, posteriormente fusionado). No está pensado para uso general: su prompt incluye siempre tres pasajes recuperados y responde únicamente a partir de ellos.

Es relevante por su enfoque de despliegue: los pesos se distribuyen en formato ONNX cuantizado (q4f16 para WebGPU, q4 para CPU/WASM) con un tamaño de 347 MB, lo que permite inferencia local en el navegador sin servidor. La evaluación publicada por el autor reporta un 95,7 % de respuestas correctas sobre 161 preguntas retenidas con el mismo código de búsqueda y prompt que el sitio web.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama), basada en SmolLM2-360M-Instruct |
| Parametros totales | 360 millones (modelo base SmolLM2-360M-Instruct) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada de SmolLM2-360M-Instruct) |
| Tipos de cuantizacion | ONNX q4f16 (WebGPU, 347 MB) y ONNX q4 (CPU/WASM); k-quant con block size 16; matrices de atencion, matriz de salida de cada MLP y LM head en 8 bits, resto de matrices MLP en 4 bits |
| Idiomas soportados | ingles (en) |
| Licencia | CC BY-SA 4.0 (pesos); modelo base Apache-2.0; corpus de Wikipedia CC BY-SA 4.0 |
| Formato de pesos | safetensors (modelo fusionado), ONNX (model_q4f16.onnx, model_q4.onnx); libreria transformers.js |

## Arquitectura y entrenamiento

La arquitectura es la de SmolLM2-360M-Instruct: un transformer decoder-only denso de 360 millones de parámetros con tokenizador Llama y formato de chat ChatML (`<|im_start|>` / `<|im_end|>`). El ajuste se realizó con LoRA de rango 16 aplicado a todas las capas lineales durante 2 épocas, y los adaptadores se fusionaron en los pesos finales. No se documentan innovaciones arquitectónicas propias; el interés técnico está en el pipeline de cuantización con onnxruntime-genai builder (k-quant, block size 16, mezcla de 8 y 4 bits) y en la exportación a ONNX para ejecución en WebGPU y WASM.

Los datos de entrenamiento consisten en aproximadamente 2.000 preguntas generadas a partir de 286 hechos escritos a mano y verificados contra fuentes, más las frases iniciales de 333 páginas de Wikipedia. Cada prompt de entrenamiento incluye los tres pasajes que el propio buscador del proyecto devuelve para esa pregunta, de modo que el modelo aprende a responder condicionado a la recuperación. No se menciona en la información disponible el uso de RLHF o DPO; el ajuste se limita a supervisión sobre pares pregunta-respuesta con contexto.

## Capacidades

- Generación de texto breve y directo: respuestas de una o dos frases o listas numeradas cortas, según el formato de prompt.
- Respuesta fundamentada en contexto recuperado (RAG): utiliza exclusivamente los pasajes incluidos en el prompt y declina responder cuando los archivos no contienen la respuesta.
- Rechazo explícito de preguntas fuera de dominio o no cubiertas por los pasajes recuperados (100 % en las categorías de rechazo de la evaluación publicada).
- Manejo de preguntas sobre el universo de Batman: personajes, tramas y datos de las páginas de Wikipedia incluidas en el corpus.
- Ejecución en navegador: inferencia local con transformers.js y ONNX Runtime en WebGPU o CPU/WASM.
- No soporta tool calling ni function calling (no documentado).
- No soporta agentes ni razonamiento multi-paso (el autor indica que no sigue una conversación y que las preguntas compuestas suelen recibir solo una respuesta parcial).
- Capacidades multilingües: solo inglés.
- Sin capacidades de visión, audio ni modo thinking.

## Casos de uso

- Demostración educativa de RAG en el navegador: sirve como ejemplo completo de recuperación, construcción de prompt y generación con ONNX Runtime y WebGPU, con código fuente público en GitHub.
- Asistente de consulta sobre un dominio cerrado: desplegado junto con un índice de pasajes, responde preguntas factuales sobre un corpus acotado (en este caso, Batman) citando el pasaje recuperado, lo que facilita la verificación.
- Prototipado de chatbots de nicho sin servidor: al pesar 347 MB en q4f16, puede integrarse en una aplicación web estática y ejecutarse en el dispositivo del usuario, sin costes de inferencia en la nube.
- Filtro de abstención en pipelines de QA: el modelo declina cuando los pasajes no contienen la respuesta, un comportamiento útil para diseñar capas de "no sé" en sistemas de preguntas y respuestas.
- Base para experimentos de ajuste fino con LoRA: al derivar de SmolLM2-360M-Instruct y publicarse con licencia CC BY-SA 4.0, sirve como punto de partida para reproducir el pipeline de datos sintéticos y cuantización descrito.
- Evaluación de cuantización en hardware de consumo: la comparación publicada entre q4f16 (95,7 %) y una variante con solo atención en 8 bits (89,4 %) permite estudiar el impacto de la precisión en tareas de QA con contexto.

## Benchmarks y rendimiento

El autor publica una evaluación propia sobre 161 preguntas retenidas, respondidas con `model_q4f16.onnx` en Chrome headless sobre WebGPU, usando el mismo código de búsqueda y prompt que el sitio web. Un respuesta se considera correcta si contiene todos los hechos requeridos, no incluye afirmaciones falsas listadas, no es un rechazo y termina antes del límite de tokens.

| Categoria | n | Correctas |
|---|---|---|
| Ejemplos obligatorios | 13 | 100 % |
| Hechos entrenados, nueva formulación | 59 | 93,2 % |
| Hechos nunca vistos en entrenamiento | 38 | 94,7 % |
| Páginas de Wikipedia sin ficha de hechos | 18 | 94,4 % |
| Preguntas de Batman que los archivos no pueden responder (debe declinar) | 13 | 100 % |
| Fuera de tema (debe declinar) | 20 | 100 % |
| **Total** | **161** | **95,7 %** |

El modelo en precisión completa obtiene el mismo 95,7 %. Una variante con solo las matrices de atención en 8 bits (306 MB) obtiene 89,4 %. No se han publicado resultados en benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: 347 MB para el archivo q4f16 (WebGPU); el archivo q4 para CPU/WASM ocupa menos, aunque la información disponible no especifica su tamaño exacto.
- GPU recomendadas: cualquier GPU con soporte WebGPU en el navegador; no se documentan requisitos de GPU de datacenter (A100, H100) porque el objetivo es la inferencia en cliente.
- Cabe en GPU de consumo: sí, por tamaño (menos de 0,5 GB de pesos), incluidas GPUs integradas con WebGPU; también se ejecuta en CPU mediante WASM.
- Opciones de despliegue: transformers.js con ONNX Runtime (WebGPU o WASM), aplicación web estática; el repositorio incluye los archivos ONNX listos para usar.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| BatLM-v3-360m | 360 M | no disponible | QA con RAG sobre Batman, en navegador | CC BY-SA 4.0 | Hugging Face, ONNX + safetensors |
| SmolLM2-360M-Instruct (base) | 360 M | no disponible en la informacion | Instructivo general, multilingüe | Apache-2.0 | Hugging Face |
| SmolLM2-135M-Instruct | 135 M | no disponible en la informacion | Instructivo general, modelos diminutos | Apache-2.0 | Hugging Face |

La comparación relevante es con su modelo base: BatLM hereda el tamaño y la arquitectura de SmolLM2-360M-Instruct, pero restringe el dominio y el idioma y depende de contexto recuperado. Frente a SmolLM2-135M-Instruct, BatLM es aproximadamente 2,7 veces mayor en parámetros, lo que se traduce en mayor huella de memoria (347 MB en q4f16) a cambio de la especialización en QA fundamentada. No se dispone de datos de benchmarks comparativos entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Modelo de 360 M parámetros: solo responde lo que contienen los pasajes recuperados y puede seleccionar una frase relacionada pero incorrecta ante formulaciones inusuales.
- No mantiene conversaciones multi-turno; las preguntas compuestas suelen recibir solo una de las partes.
- Dependencia estricta de la recuperación: sin pasajes en el prompt se comporta como SmolLM2 con tendencia a respuestas cortas.
- Solo inglés; no se documenta soporte de otros idiomas.
- Riesgo de alucinación mitigado por el formato de abstención, pero no eliminado; el autor recomienda verificar los pasajes citados.
- Licencia CC BY-SA 4.0: el uso comercial exige atribución y compartir las obras derivadas bajo la misma licencia; además, el corpus proviene de Wikipedia (CC BY-SA 4.0).
- Proyecto no oficial de fan: Batman es una marca de DC Comics y el proyecto no está afiliado a DC ni a Warner Bros., lo que limita su uso comercial por derechos de marca.
- Sin datos publicados sobre sesgos demográficos o de otro tipo; al estar entrenado sobre Wikipedia en inglés, hereda los sesgos de esa fuente.
- No se han publicado resultados en benchmarks estándar, por lo que la comparación con otros modelos se limita a la evaluación interna del autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/chintanjv/BatLM-v3-360m
- Demo: https://batlm.vercel.app
- Código fuente: https://github.com/chintanjv/BatLM
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolLM2-360M-Instruct
