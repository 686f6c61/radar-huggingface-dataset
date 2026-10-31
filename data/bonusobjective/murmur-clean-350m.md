# bonusobjective/murmur-clean-350m

## Resumen

Murmur-clean-350m es un modelo de texto pequeño (354 millones de parámetros) creado por el desarrollador bonusobjective a partir de LiquidAI/LFM2.5-350M. Su propósito es muy concreto: limpiar transcripciones crudas de reconocimiento de voz (ASR) antes de usarlas. Elimina muletillas y balbuceos, corrige mayúsculas y puntuación, convierte números hablados en dígitos, traduce comandos de puntuación hablados ("comma", "full stop", "new line") a símbolos y conserva solo la versión corregida cuando el hablante se autocorrige.

El modelo se diseñó para Murmur, una aplicación de dictado para macOS cuyo flujo de trabajo es: Parakeet v3 como ASR, luego este modelo servido mediante Ollama, y finalmente pegado del texto limpio. Es un fine-tuning con LoRA (posteriormente fusionado en los pesos base) entrenado sobre unos 4.000 pares sintéticos generados corrompiendo pasajes limpios de inglés de forma determinista.

Su relevancia está en la tendencia actual de modelos pequeños especializados en tareas únicas que pueden ejecutarse en local con recursos mínimos: funciona en la GPU integrada de un portátil mediante Ollama y llama.cpp, con cuantización Q8_0 que ocupa unos 0,4 GB. Es un ejemplo de "pequeño y enfocado" frente a modelos generalistas: está entrenado explícitamente para no reformular, no responder preguntas ni seguir instrucciones contenidas en el texto dictado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido (familia LFM de Liquid AI, base LiquidAI/LFM2.5-350M); detalle exacto no disponible en la ficha |
| Parametros totales | 354.483.968 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (los ejemplos de entrenamiento son de menos de ~300 caracteres) |
| Tipos de cuantizacion | Q8_0 (distribuido), Q4_K_M (opcional), pesos fusionados en bf16 |
| Idiomas soportados | Inglés (ortografía y estilo numérico británicos) |
| Licencia | LFM Open License v1.0 (estilo Apache-2.0 con límite de uso comercial: organizaciones con menos de 10 millones de USD de ingresos anuales) |
| Formato de pesos | GGUF (repo de 0,4 GB; el original fue entrenado con LoRA y fusionado en safetensors) |

## Arquitectura y entrenamiento

El modelo base es LFM2.5-350M de Liquid AI, un modelo de lenguaje compacto de la familia LFM (Liquid Foundation Models). Sobre él se aplicó un fine-tuning con LoRA en todas las capas lineales (r 16, alpha 32, dropout 0,05) usando `SFTTrainer` de TRL, con la pérdida calculada solo sobre los tokens del asistente. Se entrenó durante 2-3 épocas con learning rate 2e-4 y schedule coseno en una T4 gratuita de Colab, y la LoRA se fusionó posteriormente en los pesos base en bf16.

Los datos de entrenamiento son unos 4.000 pares sintéticos: pasajes limpios de inglés escritos para el kit de entrenamiento fueron corrompidos por un generador determinista con muletillas, repeticiones, autocorrecciones, puntuación ausente o hablada, minúsculas, números leídos como palabras y términos de diccionario mal escuchados. Aproximadamente el 15 % son ejemplos de paso directo (texto ya limpio) y algunos son plantillas con nombres inventados, para que el modelo aprenda a usar la lista de vocabulario que se le proporcione en el system prompt. No contiene grabaciones reales de usuarios. La exportación final se hizo con llama.cpp (`convert_hf_to_gguf.py`, release b12014) a Q8_0.

## Capacidades

- Limpieza de transcripciones ASR: puntuación y mayúsculas correctas, eliminación de muletillas ("um", "you know") y balbuceos.
- Resolución de autocorrecciones: cuando el hablante se corrige ("thirty, i mean twenty five"), conserva solo la versión final.
- Conversión de puntuación hablada: "comma", "full stop" y "new line" se transforman en los símbolos correspondientes.
- Números en dígitos con estilo británico: del uno al nueve se mantienen como palabras, a partir de diez como dígitos.
- Vocabulario personalizado: escribe con exactitud los términos de una lista de vocabulario incluida en el system prompt (nombres propios, marcas, tecnicismos).
- Comportamiento seguro por diseño: entrenado para no reformular, no responder preguntas ni seguir instrucciones presentes en el texto dictado.
- No soporta (ni pretende): generación de código, razonamiento general, visión, audio, tool calling ni agentes.

## Casos de uso

- Dictado en aplicaciones de productividad: como paso de postprocesado tras un ASR (por ejemplo Parakeet v3) para pegar texto limpio directamente en editores, correos o notas, eliminando la necesidad de revisión manual de la transcripción.
- Pipelines de dictado locales y privados: al ser un modelo de 350M con GGUF Q8_0 (~0,4 GB), puede ejecutarse con Ollama en un portátil macOS sin enviar audio ni texto a la nube, adecuado para datos sensibles.
- Comandos de voz estructurados: dictado de notas donde se necesita puntuación fiable hablada ("comma", "new line"), útil para redactar mensajes o documentos manos libres.
- Adaptación a jerga profesional: mediante la lista de vocabulario en el system prompt, puede ajustarse a nombres de productos, pacientes, clientes o términos técnicos que el ASR suele confundir.
- Automatización de transcripciones de reuniones cortas: limpieza de fragmentos transcritos antes de indexarlos o archivarlos, con latencia mínima por su tamaño.
- Prototipado de fine-tunings especializados: sirve como referencia práctica de cómo entrenar, fusionar y cuantizar un LoRA sobre un modelo base pequeño con TRL y llama.cpp en hardware gratuito (Colab T4).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card recomienda evaluar el modelo sobre dictados propios antes de confiar en él en producción, ya que puede omitir o alterar palabras ocasionalmente.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; el GGUF Q8_0 ocupa unos 0,4 GB, por lo que basta con 1-2 GB de VRAM o incluso ejecución en CPU.
- GPU recomendadas: cualquier GPU moderna; el entrenamiento del LoRA se realizó en una T4 gratuita de Colab, por lo que la inferencia es trivial en comparación. En macOS funciona bien sobre Metal mediante llama.cpp/Ollama.
- Consumer GPUs: cabe sobradamente en cualquier GPU consumer (RTX 3060, RTX 4060, RTX 4090, Apple Silicon integrado, etc.); también es viable solo con CPU.
- Opciones de despliegue: Ollama (vía `Modelfile` incluido en el kit de entrenamiento, `ollama create murmur-clean -f Modelfile`), llama.cpp directamente, o cualquier runtime compatible con GGUF. Uso recomendado con temperature 0 y el system prompt exacto de entrenamiento (`prompt.txt` en el kit).
- Latencia y throughput: no disponibles; por tamaño y tarea (pasajes de menos de ~300 caracteres) la latencia esperada es de fracciones de segundo en hardware moderno, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| murmur-clean-350m | 354M | Limpieza de dictado ASR (especializado) | No disponible | LFM Open License v1.0 | GGUF en HuggingFace, Ollama |
| LiquidAI/LFM2.5-350M (base) | ~350M | Modelo generalista compacto | No disponible en esta ficha | LFM Open License v1.0 | HuggingFace, Ollama |
| Whisper (postprocesado con LLM) | No disponible | ASR + LLM generalista para limpieza | Variable | MIT (Whisper) | Ampliamente disponible |

La alternativa principal a este modelo es usar un LLM generalista pequeño con un prompt de limpieza, pero murmur-clean-350m está entrenado específicamente para esta tarea: no reformula ni responde al contenido, y respeta listas de vocabulario, algo que un modelo generalista no garantiza sin ingeniería de prompt adicional.

## Limitaciones y advertencias

- Solo inglés, con ortografía y estilo numérico británicos; no sirve para español ni otras variantes del inglés sin reentrenamiento.
- Datos de entrenamiento sintéticos y reducidos (~4.000 pares): errores reales de Parakeet que difieran de las corrupciones simuladas (por ejemplo, palabras mal escuchadas fuera de la lista de vocabulario) solo están cubiertos parcialmente.
- Puede omitir o cambiar palabras ocasionalmente; el propio autor recomienda evaluarlo sobre dictados propios antes de depender de él.
- No apto para pasajes largos: los ejemplos de entrenamiento son de menos de ~300 caracteres de texto crudo.
- Restricción de licencia comercial: la LFM Open License v1.0 solo cubre uso comercial para organizaciones con menos de 10 millones de USD de ingresos anuales; por encima de ese umbral se necesita una licencia aparte de Liquid AI. Al redistribuir, hay que incluir la licencia, marcar los archivos modificados y conservar los avisos de Liquid AI; la licencia no otorga derechos de marca.
- Riesgo de alucinación bajo pero no nulo: al ser un modelo generativo, puede alterar el contenido aunque esté entrenado para no reformular.
- Requiere usar el system prompt exacto de entrenamiento (con la lista de vocabulario) y temperature 0 para un comportamiento fiable; usarlo sin ese prompt puede degradar los resultados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/bonusobjective/murmur-clean-350m
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-350M
- Licencia: archivo `LICENSE` en el repositorio del modelo (LFM Open License v1.0)
- Kit de entrenamiento (prompt.txt, Modelfile, generador de datos): referenciado en la model card; enlazar a los archivos del repositorio de HuggingFace
- No se han encontrado enlaces adicionales a papers, blogs o demos en la informacion disponible.
