# lazarenkod/qwen3.5-2b-fluent-books

## Resumen

Qwen3.5-2B for Fluent Books (v3) es un ajuste fino mediante LoRA del modelo base Qwen/Qwen3.5-2B, desarrollado por el usuario lazarenkod para la aplicación de lectura Fluent Books, un lector de inglés dirigido a hablantes nativos de ruso. El modelo se distribuye unicamente como archivo GGUF cuantizado en Q4_K_M con matriz de importancia (imatrix), pensado para ejecutarse en llama.cpp dentro de la propia aplicación, que descarga un unico archivo de 1.312.164.544 bytes.

El modelo no es un asistente generalista: está especializado en tareas concretas de apoyo a la lectura en inglés para rusohablantes, como la traducción de frases EN→RU, la selección del sentido diccionarial de una palabra según su contexto (salida JSON con `ru` y `sense`), explicaciones breves en ruso de palabras o puntos gramaticales, la extracción del sujeto y verbo principal de una oración larga, y una comprobación binaria (0/1) de si una expresión inglesa se usa realmente en una frase.

Su relevancia radica en que demuestra un flujo de trabajo de ajuste fino muy específico sobre un modelo pequeño (1.942.653.248 parámetros reales) con datos sintéticos generados por agentes Claude Sonnet 5.5 y verificados por modelos Gemma 4, logrando mejoras medibles frente a la versión anterior (v2), el modelo base y el traductor del sistema Apple en tareas de trampas gramaticales y elección de sentido. La licencia es Apache 2.0, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen/Qwen3.5-2B), ajuste fino LoRA fusionado y cuantizado |
| Parametros totales | 1.942.653.248 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (con importance matrix); unico archivo publicado |
| Idiomas soportados | en, ru |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (`qwen3.5-2b-ft-v3.Q4_K_M.gguf`) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-2B, un transformer de aproximadamente 1.940 millones de parámetros, sobre el que se aplicó un ajuste fino LoRA con rango 32 en todas las capas lineales, escala 20, durante 2 épocas (12.484 pasos), con tasa de aprendizaje 1e-5, batch de 8 y cálculo de pérdida solo sobre la respuesta. El entrenamiento se realizó con MLX en un Mac. Posteriormente, el adaptador se fusionó con el modelo base y se cuantizó a Q4_K_M usando una matriz de importancia.

El conjunto de entrenamiento consta de 49.936 ejemplos, compuesto por frases de novelas de dominio público (Project Gutenberg) traducidas por agentes Claude Sonnet 5.5, casos difíciles de género, tratamiento de «you» a varios interlocutores y nombres que son palabras comunes, expresiones reales y falsas (incluidos contextos de unas 680 expresiones y phrasal verbs añadidos para la v3), trampas de traducción clasificadas por tipo (pasiva, modal perfecto, inversión, cleft, cláusula de participio, sujeto gerundio, modismos, falsos amigos), pares de frases alineadas de traducciones humanas de dominio público (Twain/Engelhardt, Swift/Frankovsky, Wells/Pimenova, Wells/Morozov, Haggard/Bekertova, London/Vershina) alineadas con LaBSE a confianza ≥ 0,70, elección de sentido diccionarial (respuestas en las que Gemma 4 26B-A4B y 31B coinciden con probabilidad ≥ 0,9), explicaciones de palabras y gramática, esqueleto oracional y comprobación de expresiones (0/1). Se excluyeron frases de libros de texto y de los conjuntos de evaluación (verificado por coincidencia exacta y solapamiento de 8 palabras), así como «The Picture of Dorian Gray» y los libros reservados del test de expresiones. Se eliminaron filas de traducción rechazadas por dos jueces independientes (unas 980 en v2 y 1.421 más en v3, de las cuales 1.092 eran pares humanos rechazados por alineación laxa o renderización libre).

El formato de prompt es ChatML con un bloque de pensamiento vacío tras la etiqueta del asistente (`<think>\n\n</think>\n\n`), exactamente como lo envía la aplicación. El modelo está entrenado sobre los prompts propios de la app y funciona mejor con ellos.

## Capacidades

- Traducción de frases inglés→ruso en el dominio de novelas y textos literarios.
- Elección del sentido diccionarial de una palabra según su contexto, con salida JSON `{"ru": "...", "sense": N}`.
- Explicación breve en ruso de una palabra o de un punto gramatical dentro de su frase.
- Extracción del sujeto y el verbo principal de una oración larga (esqueleto oracional).
- Comprobación binaria (0/1) de si una expresión inglesa se usa realmente en una frase, con probabilidad calibrada (AUC 0,81).
- Manejo de casos difíciles: género, «you» dirigido a varios interlocutores, nombres que son palabras comunes, pasiva, modal perfecto, inversión, cleft, cláusula de participio, sujeto gerundio, modismos y falsos amigos.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible (el bloque de pensamiento se envía vacío).
- Capacidades multilingües: limitadas a en→ru según la model card; no evaluado para otras lenguas.
- Capacidades especiales: modo de pensamiento desactivado por diseño (bloque `<think>` vacío); sin visión ni audio.

## Casos de uso

- Asistente de lectura integrado en la app Fluent Books: el modelo traduce al ruso frases de novelas inglesas mientras el usuario lee, aprovechando que está entrenado con los prompts exactos de la aplicación y se distribuye como un único GGUF de 1,3 GB descargable en el dispositivo.
- Traducción literaria EN→RU de dominio público: adecuado para procesar pasajes de novelas de Gutenberg con estructuras complejas (pasiva, cleft, inversión), donde supera a v2 en el conjunto de 223 trampas extendidas (74,4 % frente a 68,4 %).
- Desambiguación léxica contextual: dado un término polisémico en una frase, el modelo devuelve el sentido diccionarial correcto en JSON, útil para glosarios automáticos o para mostrar definiciones al lector; logra 377 aciertos de 462 frente a 360 de v2.
- Generación de explicaciones gramaticales breves en ruso: el modelo describe un punto gramatical concreto dentro de su oración, y los jueces lo prefieren al modelo base en 33 de 34 comparaciones.
- Análisis sintáctico ligero: extracción de sujeto y verbo principal de oraciones largas para resaltar la estructura en interfaces de lectura o para alimentar herramientas de estudio de idiomas.
- Detección de uso real de expresiones y phrasal verbs: clasificación 0/1 con umbral recomendado de ~0,70, útil para ejercicios de vocabulario o para marcar expresiones en un texto; AUC de 0,81 frente a 0,65 del base y 0,78 de v2.
- Traducción asistida en un pipeline de preprocesado: al ser un GGUF pequeño ejecutable en llama.cpp, puede integrarse en un servicio local que traduzca lotes de frases de novelas antes de pasarlas a un revisor humano, con chrF++ de 35,8 frente a traducción humana de referencia.

## Benchmarks y rendimiento

| Metrica | v2 | Este modelo (v3) | Gemma 4 E2B | Apple Translation |
|---|---|---|---|---|
| 223 trampas extendidas (pasiva, cleft, sujeto gerundio, modismos…), % de comprobaciones superadas, dos jueces, conjunto ciego | 68,4 % | 74,4 % | 77,1 % | 69,7 % |
| chrF++ frente a traducción humana de 1.000 frases de una novela (fuera del entrenamiento) | 35,3 | 35,8 | 36,3 | 36,7 |
| Elección de sentido diccionarial, de 462 | 360 | 377 | 360 | – |
| Traducción de expresiones, de 100 | 78 | 78 | 81 | 76 |
| Comparación por pares con Apple en 138 frases (modelo : Apple : empate) | 40 : 44 : 54 | 46 : 46 : 46 | 43 : 24 : 71 | – |
| Frases trampa (género, «you», nombres), de 120 | 105 | 103 (género 36, «you» 39, nombres 28) | 105 | 111 |

Los jueces prefieren las explicaciones de palabras y gramática de este modelo frente al base (41 : 5 y 33 : 1); el esqueleto oracional se encuentra igual de bien que con el base. Las cifras de las primeras filas se juzgaron en una sesión sobre un conjunto ciego; las dos últimas provienen de sesiones distintas con jueces distintos, por lo que diferencias de una o dos frases sobre 120 no deben interpretarse como cambios reales.

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo Q4_K_M ocupa 1.312.164.544 bytes (~1,22 GiB); en llama.cpp con overhead de contexto, se estima un uso de VRAM en torno a 1,5–2 GB, aunque el autor no publica cifras exactas.
- GPU recomendadas: no disponible en la información proporcionada. Por tamaño, cualquier GPU con ≥ 2 GB de VRAM libre debería poder cargarlo en Q4_K_M.
- Cabe en GPU de consumo: sí, por tamaño (1,2 GiB de pesos) en tarjetas tipo GTX 1650, RTX 3050, RTX 4060 o superiores; no hay confirmación del autor sobre modelos concretos.
- Opciones de despliegue: llama.cpp (librería declarada) y cualquier runtime compatible con GGUF (Ollama, LM Studio, etc.); no se mencionan vLLM ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| lazarenkod/qwen3.5-2b-fluent-books (v3) | 1.942.653.248 | no disponible | Apache 2.0 | GGUF Q4_K_M | Especializado en traducción EN→RU literaria y tareas de lectura |
| Qwen/Qwen3.5-2B (base) | ~1.940 M | no disponible | Apache 2.0 | safetensors (y GGUF derivados) | Modelo generalista; peor en elección de sentido (360/462) y en AUC de expresiones (0,65) |
| Gemma 4 E2B | no disponible | no disponible | no disponible | no disponible | Mejor en trampas extendidas (77,1 %) y expresiones (81/100), pero peor en comparación por pares con Apple (43 : 24 : 71) |
| Apple Translation | propietario | no disponible | propietaria | integrado en el sistema | Mejor en frases trampa (111/120) y chrF++ (36,7), pero sin acceso como modelo local |

## Limitaciones y advertencias

- Los nombres que también son palabras comunes (Hope, Pluto, Slightly) se traducen peor que con el traductor de Apple: 28 de 40 en el conjunto del autor, frente a un objetivo de 33.
- En frases con «you» es más débil que el traductor de Apple.
- A veces quedan letras latinas sin traducir: 13 de 1.000 frases (Apple: 1).
- La comprobación 0/1 de expresiones tiene la probabilidad de «1» desplazada hacia arriba; debe usarse un umbral de ~0,70 en lugar de 0,15 (precisión balanceada 0,74 sobre 865 usos etiquetados; la curva es plana entre 0,60 y 0,80).
- Evaluado únicamente con frases de novelas en inglés→ruso; no para otros idiomas, documentos largos ni usos críticos para la seguridad.
- Los conjuntos de evaluación y los jueces son propios del autor, y la mayoría de los jueces son modelos de lenguaje, lo que introduce sesgo de evaluación.
- Licencia Apache 2.0 permite uso comercial, pero los derechos del modelo base pertenecen a Alibaba Cloud; conviene revisar el archivo `LICENSE` del repositorio.
- Riesgo de alucinación y sesgos: no documentados explícitamente en la model card; al ser un ajuste fino sobre datos sintéticos, puede heredar sesgos de los generadores (Claude Sonnet 5.5, Gemma 4) y del corpus de Gutenberg.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/lazarenkod/qwen3.5-2b-fluent-books
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Repositorio de Project Gutenberg (fuente de textos): https://www.gutenberg.org
- Wikisource en ruso (traducciones alineadas): https://ru.wikisource.org
- llama.cpp (runtime declarado): https://github.com/ggml-org/llama.cpp
- MLX (framework de entrenamiento): https://github.com/ml-explore/mlx
- LaBSE (alineación de frases): https://huggingface.co/sentence-transformers/LaBSE
