# chintanjv/BatLM-v3-360m-r2

## Resumen

BatLM-v3-360m-r2 es un ajuste fino de tipo LoRA sobre SmolLM2-360M-Instruct, desarrollado por el usuario chintanjv como proyecto educativo y de demostración. El modelo responde preguntas sobre el universo Batman a partir de pasajes recuperados (RAG), con el objetivo explícito de ejecutarse íntegramente en el navegador mediante transformers.js, ONNX Runtime y WebGPU. No es un modelo de propósito general: su diseño está acoplado a un pipeline de recuperación concreto y a un formato de prompt específico.

El modelo parte de la arquitectura transformer decoder-only de SmolLM2-360M-Instruct, con 360 millones de parámetros, y se ha ajustado con LoRA (r=16 sobre todas las capas lineales, 2 épocas, pesos fusionados). El corpus de entrenamiento consta de aproximadamente 2.000 preguntas generadas a partir de 286 hechos verificados manualmente y de las frases iniciales de 333 páginas de Wikipedia. Cada prompt de entrenamiento incluye los tres pasajes que el propio buscador del proyecto devuelve para esa pregunta, de modo que el modelo aprende a responder exclusivamente a partir del contexto recuperado.

Su relevancia es fundamentalmente práctica y didáctica: demuestra que un modelo de 360M puede alcanzar un 95,7% de respuestas correctas en un dominio cerrado y con recuperación, ejecutándose en el navegador con cuantización mixta 4/8 bits. Es un caso de estudio útil para quien quiera evaluar RAG de dominio específico en el edge, no un componente para producción general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (SmolLM2-360M-Instruct) |
| Parametros totales | 360M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | ONNX q4f16 (WebGPU, 347 MB) y q4 (CPU/WASM); k-quant con block size 16; matrices de atención, matriz de salida de cada MLP y LM head en 8 bits, resto de matrices MLP en 4 bits |
| Idiomas soportados | en |
| Licencia | cc-by-sa-4.0 (modelo base Apache-2.0) |
| Formato de pesos | safetensors, ONNX (onnx/model_q4f16.onnx, onnx/model_q4.onnx) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura transformer decoder-only de SmolLM2-360M-Instruct. Sobre ella se aplicó un ajuste fino con LoRA de rango 16 sobre todas las capas lineales, durante 2 épocas, con posterior fusión de los adaptadores en los pesos base. Los datos de entrenamiento consisten en unas 2.000 preguntas generadas automáticamente a partir de 286 hechos escritos y verificados manualmente y de las frases iniciales de 333 páginas de Wikipedia. Cada prompt de entrenamiento incorpora los tres pasajes que el buscador propio del proyecto devuelve para esa pregunta, lo que alinea el entrenamiento con la distribución de inferencia real (RAG).

La innovación técnica principal no está en el entrenamiento sino en el despliegue: la cuantización se realizó con el builder de onnxruntime-genai usando k-quant con block size 16 y una asignación mixta de precisión (8 bits para matrices de atención, matriz de salida de MLP y LM head; 4 bits para el resto de matrices MLP). El resultado son dos artefactos ONNX, uno para WebGPU y otro para CPU/WASM, que permiten la inferencia en el navegador. No se documenta el uso de RLHF ni DPO; el ajuste es supervisado sobre pares pregunta-contexto-respuesta.

## Capacidades

- Generación de texto en inglés con respuestas cortas (una o dos frases, o listas numeradas breves).
- Respuesta fundamentada en contexto recuperado (RAG): responde exclusivamente a partir de los pasajes incluidos en el prompt.
- Abstención explícita cuando los pasajes no contienen la respuesta o la pregunta está fuera de dominio.
- Conocimiento del universo Batman: personajes, localizaciones y hechos del corpus entrenado.
- Ejecución en navegador mediante transformers.js, ONNX Runtime y WebGPU.
- No soporta tool calling ni function calling (no documentado).
- No soporta agentes ni razonamiento multi-paso (no documentado).
- No soporta visión ni audio.
- No mantiene conversaciones multi-turno: el autor lo indica explícitamente como limitación.

## Casos de uso

- Demostración educativa de RAG en el navegador: el modelo ilustra el ciclo completo de recuperación, construcción de prompt y generación sin backend, gracias a sus artefactos ONNX de 347 MB para WebGPU.
- Asistente de trivia sobre Batman: responde preguntas factuales del universo Batman citando los pasajes recuperados, con una tasa de acierto del 95,7% en la evaluación del autor.
- Base para pipelines RAG de dominio cerrado: sirve como plantilla para ajustar un modelo pequeño sobre un corpus verificado y un buscador propio, replicando la metodología en otros dominios.
- Filtro de abstención: el modelo declina correctamente preguntas fuera de dominio o sin respuesta en los pasajes (100% en las categorías de declinación de la evaluación), lo que lo hace útil como ejemplo de control de alucinaciones.
- Prototipado de aplicaciones web sin servidor: al ejecutarse con WebGPU o WASM, permite validar experiencias de chat o consulta sin infraestructura de GPU.
- Evaluación de cuantización mixta en el edge: los dos artefactos publicados (q4f16 y q4) permiten comparar precisión y rendimiento entre WebGPU y CPU, con una diferencia documentada del 95,7% frente al 89,4% de una variante solo con atención en 8 bits.

## Benchmarks y rendimiento

Evaluación del autor sobre 161 preguntas reservadas, respondidas por `model_q4f16.onnx` en Chrome headless con WebGPU, usando el mismo código de búsqueda y prompt que el sitio web. Una respuesta es correcta si contiene todos los hechos requeridos, no incluye afirmaciones falsas listadas, no es un rechazo y termina antes del límite de tokens.

| Categoría | n | Correctas |
|---|---|---|
| Ejemplos obligatorios | 13 | 100% |
| Hechos entrenados, nueva formulación | 59 | 93,2% |
| Hechos nunca vistos en entrenamiento | 38 | 94,7% |
| Páginas de Wikipedia sin ficha de hechos | 18 | 94,4% |
| Preguntas de Batman sin respuesta en los pasajes (debe declinar) | 13 | 100% |
| Fuera de tema (debe declinar) | 20 | 100% |
| **Total** | **161** | **95,7%** |

El modelo en precisión completa obtiene el mismo 95,7%. Una variante con solo la atención en 8 bits (306 MB) obtiene un 89,4%. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; los artefactos ONNX ocupan 347 MB (q4f16) y un tamaño no especificado para q4.
- GPU recomendadas: cualquier GPU con soporte WebGPU para la variante q4f16; la variante q4 está pensada para CPU/WASM.
- Cabe en GPU de consumo: sí, por el tamaño reducido del modelo (360M parámetros) y de los artefactos cuantizados.
- Opciones de despliegue: transformers.js con ONNX Runtime (WebGPU o WASM) en el navegador; no se documentan otras opciones como vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| BatLM-v3-360m-r2 | 360M | no disponible | cc-by-sa-4.0 | RAG de dominio (Batman) en navegador |
| SmolLM2-360M-Instruct | 360M | no disponible | Apache-2.0 | Instrucciones generales, modelo base |
| SmolLM2-1.7B-Instruct | 1.7B | no disponible | Apache-2.0 | Instrucciones generales, mayor capacidad |

La comparación relevante es con su modelo base: BatLM añade el ajuste LoRA y la cuantización ONNX para navegador, pero pierde generalidad y capacidad conversacional. Frente a SmolLM2-1.7B-Instruct, BatLM es más pequeño y especializado, sin datos de benchmarks comparables publicados en la información disponible.

## Limitaciones y advertencias

- Modelo de 360M: responde lo que contienen los pasajes recuperados y puede seleccionar una frase relacionada pero incorrecta ante formulaciones inusuales.
- No mantiene conversaciones multi-turno; las preguntas compuestas suelen recibir solo una respuesta parcial.
- Depende críticamente del contexto recuperado: sin pasajes, se comporta como SmolLM2 con tendencia a respuestas cortas.
- Solo soporta inglés.
- Riesgo de alucinación presente, aunque mitigado por el mecanismo de abstención; el autor recomienda verificar los pasajes citados.
- Licencia CC BY-SA 4.0 derivada del corpus de Wikipedia: implica obligaciones de atribución y compartir igual para obras derivadas; el modelo base es Apache-2.0.
- Proyecto no oficial: Batman es una marca de DC Comics; no está afiliado a DC ni a Warner Bros.
- Sin datos publicados sobre sesgos, contexto máximo ni rendimiento en producción fuera del entorno de evaluación del autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/chintanjv/BatLM-v3-360m-r2
- Demo: https://batlm.vercel.app
- Código fuente: https://github.com/chintanjv/BatLM
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolLM2-360M-Instruct
