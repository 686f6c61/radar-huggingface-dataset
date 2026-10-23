# 10X-Technologies/StoryTOM-10M-te-GGUF

## Resumen

StoryTOM-10M-te-GGUF es la versión en formato GGUF del modelo base telugu StoryTOM-10M-te, publicado por 10X-Technologies dentro de la primera release de su familia TOM (Task-Oriented Models). Se trata de un modelo entrenado desde cero para una única tarea: continuar cuentos infantiles sencillos en telugu a partir de un inicio de historia. No es un modelo de instrucciones ni responde a preguntas; su función es puramente generativa y de dominio cerrado.

Con 12.485.760 parámetros reales (el autor lo comercializa como "10M"), es un modelo lo bastante pequeño como para ejecutarse íntegramente en un teléfono móvil sin conexión mediante llama.cpp, LM Studio, Ollama o PocketPal. La ventana de contexto es de 544 tokens, exactamente la longitud de las historias con las que fue entrenado; el propio autor advierte que no se soportan contextos mayores.

Su relevancia es fundamentalmente de investigación: forma parte de un estudio controlado titulado "Same Stories, Different Language: A Controlled Comparison of Tiny English and Telugu Language Models", en el que se comparan modelos entrenados con las mismas historias en inglés (TinyStories) y en telugu (traducidas automáticamente), lo que permite aislar el efecto del idioma y del tokenizador en el aprendizaje. El repositorio GGUF no aporta mejoras de capacidad: es una conversión fiel del modelo original.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (inferida del formato GGUF compatible con llama.cpp; el autor no detalla la arquitectura en la model card) |
| Parámetros totales | 12.485.760 (aproximadamente 12,5 M; el autor lo denomina "10M") |
| Parámetros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | 544 tokens (longitud de entrenamiento; no se soportan contextos superiores) |
| Tipos de cuantización | F16 (25 MB) y F32 (50 MB); no se publican cuantizaciones de menor precisión (Q4, Q5, Q8) |
| Idiomas soportados | Telugu (`te`) únicamente |
| Licencia | Apache 2.0 (redistribución sujeta a incluir licencia y fichero NOTICE) |
| Formato de pesos | GGUF (F16 y F32); el modelo base original se distribuye en safetensors |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna más allá de su compatibilidad con llama.cpp. Los ficheros GGUF implican una topología de transformer decoder-only con tokenizador propio, entrenado desde cero y no derivado de otro modelo. La longitud de contexto fija de 544 tokens coincide con la longitud de las historias del corpus, lo que sugiere un entrenamiento con secuencias de esa medida exacta y sin extensión posterior.

El entrenamiento se realizó sobre cuentos infantiles sintéticos en inglés procedentes de TinyStories (Eldan y Li, 2023; licencia CDLA-Sharing-1.0), traducidos al telugu con Gemma 4 E2B (Apache 2.0); 20 de las traducciones se generaron con ChatGPT. No se menciona en la información disponible el número total de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron fases de RLHF o DPO (en un modelo base de este tipo es esperable que no). Los dos ficheros GGUF publicados se validaron contra el modelo original comprobando que el tokenizador produce exactamente los mismos tokens en 500 historias en telugu y que las continuaciones greedy (temperatura 0) son idénticas token a token.

## Capacidades

- Continuación de texto: dada la frase inicial de un cuento en telugu, genera la continuación, hasta un máximo de 544 tokens de contexto.
- Generación de cuentos infantiles simples en telugu, con vocabulario y estructuras sintácticas propias de ese dominio.
- Ejecución totalmente offline en dispositivo (móvil, portátil, placa SBC) mediante llama.cpp y aplicaciones compatibles.
- Plantilla de chat mínima incluida: el texto del usuario se pasa al modelo sin modificaciones (no hay formato de instrucciones real).
- No soporta tool calling, function calling ni uso como agente.
- No soporta razonamiento multi-paso, matemáticas, código ni visión.
- No soporta modo "thinking" ni capacidades de audio.
- Multilingüismo: nulo fuera del telugu; no se ha entrenado con datos en otros idiomas.

## Casos de uso

- Aplicaciones móviles de cuentos infantiles offline en telugu: integrar el GGUF F16 en PocketPal o en una app propia basada en llama.cpp permite generar cuentos sin conexión, sin coste de API y con 25 MB de almacenamiento, en escenarios con conectividad limitada.
- Generación de material didáctico para alfabetización temprana: producir cuentos cortos en telugu para ejercicios de lectura en educación primaria, siempre con revisión humana dada la calidad irregular de las traducciones de origen.
- Demostración educativa de LLM en el aula: el modelo cabe en cualquier portátil y permite ilustrar el funcionamiento de un transformer generativo y de la decodificación por muestreo (temperatura, top-p) sin infraestructura de GPU.
- Investigación sobre transferencia entre idiomas: replicar o extender el estudio controlado comparando un modelo entrenado con las mismas historias en inglés y en telugu, aislando el efecto del idioma y del tokenizador.
- Evaluación de tokenizadores para lenguas dravídicas: comparar la eficiencia de codificación de un tokenizador entrenado específicamente con texto telugu frente a tokenizadores multilingües de modelos mayores, usando el par de ficheros F16/F32 como referencia determinista.
- Pruebas de sesgo de género en traducción automática: el corpus traducido asigna de forma inconsistente el género gramatical a animales macho con nombre, y el modelo reproduce ese patrón, lo que lo convierte en un banco de pruebas pequeño y reproducible para estudiar cómo se propaga el sesgo del dato traducido al modelo.
- Test de conformidad de implementaciones GGUF: al ser las continuaciones greedy idénticas token a token al modelo original, sirve como caso de prueba de bajo coste para validar versiones de llama.cpp u otros runtimes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente describe el protocolo de evaluación empleado en el artículo asociado (temperatura 0.8, top-p 0.95, contexto de 544 tokens) y la verificación de equivalencia entre los ficheros GGUF y el modelo original, pero no incluye métricas numéricas de perplejidad, coherencia ni comparaciones cuantitativas.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 100 MB en F16 (25 MB de pesos más la caché KV de 544 tokens) y alrededor de 100 MB en F32 (50 MB de pesos).
- GPU recomendadas: ninguna necesaria; el modelo está pensado para CPU. Funciona en cualquier GPU consumer (RTX 3060, RTX 4090, etc.) pero no se beneficia de ella de forma significativa.
- Cabe en cualquier GPU consumer, en iGPU y en CPU sin GPU; también en placas tipo Raspberry Pi y en teléfonos Android e iOS.
- Opciones de despliegue: llama.cpp (`llama-completion` con `-c 544 --temp 0.8 --top-p 0.95 -no-cnv`), Ollama, LM Studio y PocketPal. No se han publicado instrucciones ni artefactos para vLLM o TGI.
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño (12,5 M de parámetros) la generación en CPU es del orden de decenas a cientos de tokens por segundo, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idioma | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| StoryTOM-10M-te-GGUF | 12,5 M | 544 tokens | Telugu | Apache 2.0 | GGUF F16/F32 en Hugging Face |
| StoryTOM-10M-te (original) | 12,5 M | 544 tokens | Telugu | Apache 2.0 | Safetensors en Hugging Face |
| TinyStories (familia, Eldan y Li 2023) | Órdenes de 1 M a 33 M según checkpoint | No disponible en la información | Inglés | CDLA-Sharing-1.0 | Checkpoints en Hugging Face y artículo en arXiv |
| Modelos generalistas en telugu de tamaño pequeño | No disponible | No disponible | Telugu y multilingüe | No disponible | No disponible |

La comparación relevante es con la familia TinyStories, de la que este modelo hereda el corpus: StoryTOM-10M-te aplica el mismo régimen de entrenamiento (cuentos sintéticos, modelo minúsculo, contexto corto) sobre historias traducidas al telugu, lo que permite una comparación controlada entre idiomas. No se dispone de datos verificados de benchmarks ni de otros modelos pequeños en telugu en la información proporcionada.

## Limitaciones y advertencias

- Dominio extremadamente cerrado: solo ha visto cuentos infantiles sintéticos simples, por lo que fuera de ese registro produce texto incoherente o repetitivo.
- No sigue instrucciones ni responde a preguntas; es un modelo base y cualquier uso conversacional requiere envolverlo con prompts de continuación.
- Contexto máximo de 544 tokens: no admite conversaciones multi-turno largas ni documentos extensos.
- Los datos en telugu son traducciones automáticas, de modo que el modelo hereda los errores y el estilo del traductor (Gemma 4 E2B, con 20 traducciones generadas por ChatGPT).
- Sesgo documentado: en el corpus traducido los animales macho con nombre reciben concordancia de género inconsistente, y el modelo reproduce ese patrón (sección 5.3 del artículo).
- Fuga en el tokenizador: los tokenizadores se entrenaron antes de separar el conjunto de test, por lo que las historias de evaluación influyeron en el vocabulario (no en el entrenamiento del modelo).
- Riesgo de alucinación: aunque el espacio de salida está acotado por el dominio, el modelo puede inventar palabras o encadenar frases sin sentido; requiere revisión humana en cualquier uso educativo o dirigido a menores.
- Licencia Apache 2.0: permite uso comercial, pero obliga a incluir la licencia y el fichero NOTICE en cualquier redistribución o trabajo derivado, y a mantener la atribución a TinyStories (CDLA-Sharing-1.0) y a Gemma 4 E2B.
- Madurez del ecosistema: el repositorio registra 0 descargas y 0 "likes" en el momento de la consulta, y la cita BibTeX del artículo aún no está disponible (pendiente de número arXiv), lo que limita la validación externa independiente.

## Enlaces

- Repositorio GGUF: https://huggingface.co/10X-Technologies/StoryTOM-10M-te-GGUF
- Modelo base (safetensors): https://huggingface.co/10X-Technologies/StoryTOM-10M-te
- Perfil del autor: https://huggingface.co/10X-Technologies
- Artículo asociado, "Same Stories, Different Language: A Controlled Comparison of Tiny English and Telugu Language Models": referencia citada en la model card, sin enlace ni número arXiv disponible en la información proporcionada
- TinyStories (Eldan y Li, 2023), corpus de origen: citado en la model card; enlace no incluido en la información proporcionada
- Gemma 4 E2B, modelo de traducción del corpus: citado en la model card; enlace no incluido en la información proporcionada
