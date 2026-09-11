# formalmathatepfl/qwen3-4b-feedback-evluator

## Resumen
El modelo `formalmathatepfl/qwen3-4b-feedback-evluator` es un ajuste fino completo (full fine-tuning) de Qwen3-4B-Base, publicado por el usuario formalmathatepfl, que predice la salida del compilador de Lean 4 para un programa dado. En lugar de responder con texto conversacional, el modelo reproduce el código de entrada y lo anota con bloques `/- <feedback> ... </feedback> -/` que imitan los mensajes de error, aviso e información que emitiría Lean. La validez binaria del programa se deriva después buscando el marcador `-- type: error` dentro de esos bloques mediante una expresión regular.

Se trata de un artefacto muy especializado dentro del ecosistema de demostración automática de teoremas: permite filtrar o priorizar candidatos sin invocar el compilador real en cada iteración de un bucle de búsqueda. Tiene 4.022.468.096 parámetros (unos 4.020 millones) y hereda la arquitectura transformer densa de Qwen3-4B, con un presupuesto de generación recomendado por el autor de hasta 4.096 tokens nuevos.

Su relevancia práctica es de nicho y acotada: el repositorio no tiene descargas ni valoraciones, la model card no publica resultados de benchmarks y la licencia declarada es "other", sin una licencia estándar identificable. Es un artefacto de investigación orientado a una tarea concreta, no un modelo de propósito general.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso decoder-only, derivado de Qwen3-4B-Base (atención con GQA, RoPE, RMSNorm, SwiGLU, QK-Norm) |
| Parámetros totales | 4.022.468.096 (≈4,02 B), dato real de los safetensors |
| Parámetros activos | No aplica: modelo denso, no es MoE |
| Longitud de contexto | No especificada en la model card. El modelo base Qwen3-4B declara 32.768 tokens nativos, ampliables a 131.072 con YaRN |
| Tipos de cuantización | El repositorio solo publica pesos en safetensors (bf16). No se publican versiones GGUF, AWQ, GPTQ ni FP8 |
| Idiomas soportados | No disponible. No se declaran idiomas en la model card; el dominio de entrenamiento es código Lean 4 |
| Licencia | other (no es una licencia estándar identificable; requiere revisar los términos del repositorio) |
| Formato de pesos | safetensors (tamaño total del repositorio: 8,8 GB) |

## Arquitectura y entrenamiento
El modelo parte de Qwen3-4B-Base, no de la variante instruct, y se ha sometido a un ajuste fino completo, según indican las etiquetas `llama-factory`, `full` y `generated_from_trainer`. LLaMA-Factory es el framework empleado para el entrenamiento. No se documenta en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron etapas de RLHF, DPO u otro tipo de alineamiento.

La particularidad técnica está en el formato de la tarea: el autor no usa plantilla de chat. El prompt debe ser texto plano con la forma `source_code.rstrip() + "\n\n"` y tokenización con `add_special_tokens=False`, y la decodificación recomendada es determinista (`do_sample=False`). El modelo debe reproducir primero el código fuente completo y solo después añadir los bloques de feedback, de modo que la longitud de salida crece con el tamaño del programa. El autor descarta explícitamente el método anterior basado en predecir directamente `lean_verified` o un veredicto `\lean4_valid{True|False}`: en esta versión el veredicto se infiere del texto de feedback generado.

## Capacidades
- Generación de feedback de compilador Lean 4: produce bloques `<feedback> ... </feedback>` con mensajes de error, aviso e información sobre el código de entrada.
- Anotación inline del código fuente: reproduce el programa original y lo anota con comentarios de feedback.
- Clasificación binaria indirecta de validez: al buscar `-- type: error` en los bloques generados se obtiene un booleano (los avisos e informaciones no cuentan como error).
- Detección de errores de táctica: el ejemplo de la model card muestra la detección de `tactic 'trivial' failed` junto con el estado de prueba (`⊢ False`).
- Generación determinista: el flujo documentado usa decodificación greedy, adecuada para tareas de evaluación reproducible.
- Sin soporte de tool calling ni function calling documentado.
- Sin soporte de agentes ni de razonamiento multi-paso explícito más allá del bucle que implemente el usuario.
- Sin capacidades de visión ni de audio.
- Sin modo "thinking" documentado.
- Multilingüismo: no documentado; el entrenamiento está orientado a Lean 4, cuyo vocabulario técnico es fundamentalmente inglés.
- Conversacional: la etiqueta `conversational` figura en el repositorio, pero la model card indica explícitamente que no debe usarse plantilla de chat, por lo que no es un modelo de diálogo en la práctica.

## Casos de uso
- Filtrado rápido de candidatos en pipelines de demostración automática: antes de invocar el compilador de Lean, que es costoso, el modelo predice qué candidatos generados por un prover contienen errores y permite descartarlos, reservando la verificación real para los más prometedores.
- Evaluación de generadores de código Lean: integrado como métrica barata para medir la tasa de programas sintácticamente fallidos que produce un modelo de generación de pruebas durante el desarrollo.
- Curación de datasets de entrenamiento: dado un corpus de programas Lean, el modelo anota cada uno y permite descartar los que predice como inválidos antes de construir un dataset de ajuste fino, reduciendo el ruido.
- Búsqueda guiada en árbol (best-first search, Monte Carlo tree search): como función de puntuación intermedia para priorizar nodos en un árbol de tácticas sin ejecutar Lean en cada expansión.
- Depuración asistida de código Lean: el desarrollador envía un fragmento que no compila y recibe una anotación con el estado de prueba y el error probable, útil cuando no tiene el entorno de Lean a mano.
- Investigación sobre "world models" de compiladores: entrenar o evaluar modelos que aproximen el comportamiento de un verificador formal, con Lean 4 como caso de estudio.
- Generación de señales intermedias para RL o expert iteration: usar el feedback predicho como recompensa densa en bucles de refinamiento de provers, donde la recompensa binaria del compilador sería demasiado dispersa.
- Pre-chequeo en CI de repositorios con código Lean: marcar ficheros sospechosos antes de lanzar la compilación completa, siempre con la verificación real como paso final obligatorio.

## Benchmarks y rendimiento
El model-index del repositorio declara una única entrada, `qwen3-4b-lean-eval-model`, con la lista de resultados vacía (`results: []`). No se han publicado resultados de benchmarks en la información disponible.

| Benchmark | Resultado |
|---|---|
| (ninguno declarado) | No disponible |

No hay datos comparativos de precisión de clasificación, exactitud del feedback generado, ni métricas de la tarea Lean asociada. Cualquier cifra que no figure aquí no está respaldada por la información proporcionada.

## Requisitos de hardware
- Pesos en bf16: 4,02 B parámetros × 2 bytes ≈ 8,0 GB, coherente con los 8,8 GB del repositorio. Con activaciones y caché KV, la inferencia en bf16 requiere del orden de 10-14 GB de VRAM para contextos moderados.
- Cuantización de 8 bits: ≈4,5 GB de pesos más caché KV.
- Cuantización de 4 bits: ≈2,5-3 GB de pesos más caché KV. Requiere conversión propia, ya que no se publican GGUF ni AWQ/GPTQ.
- Caché KV (estimación basada en la arquitectura del modelo base: 36 capas, 8 cabezas KV con GQA y head_dim 128): aproximadamente 144 KB por token en bf16, es decir, unos 4,7 GB con 32.768 tokens de contexto. Es una estimación, no un dato publicado.
- GPU recomendadas: A100 40 GB, H100 80 GB o L40S para despliegue con contexto largo y concurrencia; RTX 4090 o RTX 3090 (24 GB) para inferencia en bf16 con contexto moderado.
- GPU de consumo: cabe en RTX 4090, RTX 3090 y RTX 4080 (16 GB) en bf16 con contexto limitado; en tarjetas de 8-12 GB solo con cuantización de 4 bits y secuencias cortas.
- Opciones de despliegue: `transformers` es la vía documentada oficialmente (con `torch_dtype=torch.bfloat16`, `device_map="auto"` y `model.eval()`). vLLM, TGI y SGLang son compatibles a nivel de arquitectura Qwen3, pero no hay configuración publicada por el autor. llama.cpp y Ollama requerirían una conversión a GGUF no publicada.
- Latencia y throughput: no disponibles. Hay que tener en cuenta que el coste de salida es alto: el modelo debe regenerar el código fuente completo antes de emitir el feedback, con un presupuesto de hasta 4.096 tokens nuevos por petición, por lo que el tiempo de inferencia escala con el tamaño del programa de entrada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Rendimiento |
|---|---|---|---|---|---|
| qwen3-4b-feedback-evluator (este modelo) | 4,02 B | No especificado | Predicción de feedback de compilador Lean 4 | other | No disponible |
| Qwen/Qwen3-4B-Base (modelo base) | 4,02 B | 32.768 nativos (131.072 con YaRN) | Generación de texto general | Apache-2.0 | No comparable, la tarea difiere |
| Qwen/Qwen3-4B-Instruct-2507 | 4,02 B | No disponible en la información proporcionada | Instrucciones y diálogo general | Apache-2.0 | No comparable, la tarea difiere |
| Modelos de demostración formal (DeepSeek-Prover-V2, Goedel-Prover-V2, Kimina-Prover) | Desde 7 B hasta cientos de miles de millones | No disponible | Generación de pruebas formales | Variables | No comparable: generan demostraciones, no predicen feedback del compilador |

No se dispone de una comparación directa con otro modelo que resuelva exactamente la misma tarea (predicción de feedback de Lean 4), ni de cifras de rendimiento verificables para ninguno de los candidatos en este contexto.

## Limitaciones y advertencias
- No verifica nada: el modelo predice feedback, no ejecuta Lean. El propio autor advierte de que la verificación real requiere pasar el programa por el compilador.
- Riesgo de alucinación: puede generar mensajes de error plausibles pero incorrectos, o estados de prueba que no corresponden al programa real.
- Falsos positivos por truncamiento: si la generación alcanza el límite de tokens antes de completar la reproducción de la fuente y el feedback, el regex puede no encontrar el marcador de error y clasificar el programa como válido de forma errónea. El autor recomienda ampliar el presupuesto antes de clasificar.
- Sensibilidad al formato: usar plantilla de chat, instrucciones o fences de Markdown degrada el comportamiento, ya que el modelo fue ajustado con texto plano y `add_special_tokens=False`.
- Coste de inferencia proporcional al tamaño del programa, porque el modelo debe reproducir la fuente completa antes de anotarla.
- Licencia "other": no es una licencia estándar identificable, por lo que el uso comercial queda sujeto a revisión legal. Aunque el modelo base Qwen3-4B-Base se publica bajo Apache-2.0, el autor aplica una licencia distinta a este ajuste.
- Ausencia total de evaluación: cero descargas, cero valoraciones y lista de resultados de benchmark vacía. No hay evidencia publicada de precisión, calibración ni robustez.
- Idiomas no declarados: no hay garantía de comportamiento fuera del dominio de Lean 4 y del inglés técnico.
- Sesgos: no documentados; no hay análisis de sesgos en la model card.
- Ambigüedad de nomenclatura: el identificador del repositorio contiene una errata ("evluator" en lugar de "evaluator"), el título de la model card es "Qwen3-4B Feedback Evaluator" y el model-index usa "qwen3-4b-lean-eval-model", lo que puede dificultar la trazabilidad.
- No apto para producción sin evaluación propia previa: al no existir métricas publicadas, cualquier integración debe medirse contra el compilador de Lean real sobre un conjunto de validación propio.

## Enlaces
- Modelo en HuggingFace: https://huggingface.co/formalmathatepfl/qwen3-4b-feedback-evluator
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Base
- Framework de ajuste fino (LLaMA-Factory): https://github.com/hiyouga/LLaMA-Factory
- Paper, blog o demo asociados: no disponible. La búsqueda web no devolvió ningún enlace relevante sobre el modelo; los resultados obtenidos corresponden a un sistema de reservas de restaurantes sin relación con este repositorio.
