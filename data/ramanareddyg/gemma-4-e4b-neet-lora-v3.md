# ramanareddyg/gemma-4-E4B-neet-lora-v3

## Resumen

`ramanareddyg/gemma-4-E4B-neet-lora-v3` es un adaptador LoRA publicado por el usuario ramanareddyg sobre el modelo base `google/gemma-4-E4B-it`. Se trata de un experimento de ajuste fino orientado a preguntas del examen de acceso a medicina indio NEET-UG, entrenado sobre un dataset bilingüe (inglés y hindi) construido a partir de los exámenes oficiales de NTA (2020-2025) y los libros NCERT de Física, Química y Biología de los cursos 11 y 12.

El propio autor lo etiqueta explícitamente como `negative-result`: el adaptador no supera al modelo base en la tarea objetivo. Según la model card, el modelo base Gemma 4 E4B alcanza un 90,8% de acierto en 660 preguntas del NEET 2025 real cuando se le activa el modo de razonamiento (thinking) y se le proporciona la página relevante del libro NCERT en el prompt, mientras que el ajuste fino no aportó mejoras e incluso uno de los tres intentos empeoró el resultado en 8 puntos. El adaptador se publica, por tanto, como registro del experimento y no como artefacto recomendado para uso en producción.

La relevancia de este repositorio es metodológica: documenta con detalle el proceso de construcción de un dataset de evaluación bilingüe de alta calidad y demuestra que, en dominios con conocimiento factual acotado y verificable, técnicas de prompting estructurado (thinking + recuperación de contexto) pueden ser más efectivas que el ajuste fino supervisado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer multimodal Gemma 4 E4B |
| Parametros totales | no disponible (adaptador LoRA; el modelo base es E4B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, hi |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA de bajo rango sobre el modelo base `google/gemma-4-E4B-it`, un transformer multimodal con pipeline `image-text-to-text`. El repositorio ocupa 0,1 GB, coherente con un adaptador de pesos y no con un modelo completo. No se especifican en la información disponible el rango del LoRA, el número de parámetros entrenables, la composición exacta del dataset de entrenamiento ni los hiperparámetros utilizados.

La model card describe tres intentos de ajuste fino sobre E4B, ninguno de los cuales superó al modelo base sin entrenar, y uno de ellos degradó el rendimiento en 8 puntos. El autor atribuye el resultado a que el cuello de botella de la tarea no era la adaptación de estilo o formato, sino el acceso al conocimiento factual del temario NCERT, que se resuelve mejor mediante recuperación en el prompt. El dataset de evaluación se construyó a partir de los PDF oficiales de NTA, con las claves de respuestas parseadas de forma determinista (208 tablas de códigos de cuadernillo) y sin pedir a ningún modelo que adivinase la respuesta correcta. El texto en hindi se extrajo mediante modelos de visión, ya que en los PDF bilingües el devanagari está embebido como contornos vectoriales.

## Capacidades

- Generación de texto y razonamiento multimodal (entrada imagen + texto), heredadas del modelo base Gemma 4 E4B.
- Modo de razonamiento (thinking) del modelo base, que según la model card es clave para el rendimiento en NEET.
- Procesamiento bilingüe inglés-hindi en el contexto de material educativo indio.
- Respuesta a preguntas de opción múltiple sobre Física, Química y Biología de nivel preuniversitario (clases 11 y 12 de NCERT).
- Integración con pipelines PEFT: el adaptador se carga sobre el modelo base mediante la librería `peft`.
- No se documentan capacidades de tool calling, function calling, agentes multi-paso ni otras modalidades adicionales en la información disponible.

## Casos de uso

- Registro y reproducción de experimentos de ajuste fino: el adaptador sirve como referencia para investigadores que quieran replicar o contrastar resultados negativos de LoRA en tareas de conocimiento factual.
- Estudio de la brecha entre prompting estructurado y fine-tuning: permite comparar directamente, sobre el mismo modelo base, el rendimiento del adaptador frente a la configuración thinking + página NCERT descrita por el autor.
- Construcción de datasets educativos bilingües: la metodología descrita (parseo determinista de claves, extracción por visión de devanagari vectorizado, filtro de recitación con escalera de fallback) es reutilizable para otros exámenes oficiales con PDFs problemáticos.
- Evaluación de modelos en dominios curriculares: el conjunto de 660 preguntas del NEET 2025 en inglés y hindi puede emplearse como benchmark interno para comparar modelos abiertos y comerciales.
- Tutoría offline de bajo coste: aunque este adaptador no se recomienda, el enfoque global del proyecto (modelo abierto pequeño ejecutado localmente con recuperación de páginas NCERT) apunta a escenarios sin conexión en zonas con conectividad limitada.
- Investigación sobre alucinación en extracción documental: los fallos documentados (traducción en lugar de transcripción, LaTeX decodificado como escapes JSON, recortes de figuras desalineados) son casos de estudio útiles para diseñar validaciones en pipelines de datos.

## Benchmarks y rendimiento

Los datos publicados en la model card corresponden a la evaluación del proyecto sobre 660 preguntas del NEET 2025 real, no al adaptador frente al modelo base de forma aislada. El adaptador en sí no mejora al modelo base según el autor.

| Modelo | Pesos | Configuración | Acierto (660 preguntas) |
|---|---|---|---:|
| Claude Opus 5.5 | API comercial | prompt simple | 99,1 |
| Gemini 3.8 Flash | API comercial | prompt simple | 98,3 |
| Gemma 4 31B | abierto | thinking + página NCERT | 97,7 |
| GPT-6 Luna | API comercial | prompt simple | 96,1 |
| Qwen3.5-9B | abierto | thinking + página NCERT | 95,3 |
| Qwen3.5-4B | abierto | thinking + página NCERT | 93,3 |
| Gemma 4 E4B, totalmente offline | abierto | thinking + página NCERT | 90,8 |
| Claude Haiku 4.5 | API comercial | prompt simple | 87,0 |
| Gemma 4 E4B | abierto | prompt simple | 82,1 |

El autor advierte que los modelos abiertos recibieron la configuración descrita (thinking + página NCERT) mientras que los comerciales se ejecutaron con prompt simple y sus ajustes de razonamiento por defecto, por lo que la tabla mide "cuánto se acerca un modelo abierto con la configuración adecuada", no qué modelo es intrínsecamente mejor. Sin la configuración, Gemma 4 31B obtiene 95,0%. No se publican resultados específicos del adaptador LoRA frente al modelo base en la información disponible.

## Requisitos de hardware

- El adaptador LoRA ocupa 0,1 GB; el requisito real de VRAM viene determinado por el modelo base `google/gemma-4-E4B-it`.
- VRAM estimada para el modelo base: no disponible en la información proporcionada.
- GPU recomendadas: no disponible.
- Viabilidad en GPU de consumo: no disponible.
- Opciones de despliegue: carga mediante la librería `peft` sobre el modelo base; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible. El autor menciona un coste aproximado de 1,60 USD de tiempo de GPU para la configuración thinking + página NCERT sobre el modelo base, pero no desglosa latencia ni tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | NEET 2025 (660 preguntas) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| gemma-4-E4B-neet-lora-v3 (adaptador) | no disponible (base E4B) | no disponible | no supera al base | apache-2.0 | Hugging Face, 16 descargas |
| Gemma 4 E4B (base) | E4B | no disponible | 90,8 (con setup) / 82,1 (prompt simple) | no disponible en esta ficha | Hugging Face |
| Qwen3.5-4B | 4B | no disponible | 93,3 (con setup) | no disponible en esta ficha | Hugging Face |
| Qwen3.5-9B | 9B | no disponible | 95,3 (con setup) | no disponible en esta ficha | Hugging Face |

## Limitaciones y advertencias

- Resultado negativo declarado por el autor: el adaptador no supera al modelo base y no debe usarse para responder preguntas NEET en producción.
- Uno de los tres intentos de ajuste fino empeoró el rendimiento en 8 puntos, lo que indica sensibilidad al proceso de entrenamiento en esta tarea.
- El adaptador solo cubre inglés y hindi; no se documenta comportamiento en castellano ni en otros idiomas.
- El conocimiento está acotado al temario NCERT de clases 11 y 12 y a los exámenes NTA 2020-2025; puede quedar desactualizado respecto a ediciones posteriores del temario.
- Riesgo de alucinación heredado del modelo base, especialmente en preguntas que requieren figuras o diagramas, donde el propio autor documentó errores de recorte y emparejamiento en el dataset.
- La licencia del adaptador es apache-2.0, pero el uso comercial está condicionado por la licencia del modelo base Gemma, que no se detalla en la información disponible.
- El repositorio tiene 16 descargas y 0 likes, sin señales de validación por parte de la comunidad.
- La model card incluye referencias a modelos comerciales y fechas que conviene verificar contra fuentes primarias antes de citarlas.

## Enlaces

- Hugging Face: https://huggingface.co/ramanareddyg/gemma-4-E4B-neet-lora-v3
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it
- Repositorio del pipeline: https://github.com/ramanareddyg/neet-open-pipeline
- Imagen de resultados: https://raw.githubusercontent.com/ramanareddyg/neet-open-pipeline/main/docs/img/blog-ladder.png
