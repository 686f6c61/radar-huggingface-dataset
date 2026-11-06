# lazarenkod/qwen3.5-2b-fluent-books

## Resumen

Qwen3.5-2B for Fluent Books (v3) es un ajuste fino mediante LoRA del modelo base Qwen/Qwen3.5-2B, desarrollado por el usuario lazarenkod para la aplicación de lectura Fluent Books, un lector de inglés dirigido a hablantes nativos de ruso. El modelo está fusionado con el base, cuantizado a Q4_K_M con matriz de importancia (imatrix) y distribuido como un único archivo GGUF para ejecución en llama.cpp dentro de la propia aplicación. Con 1.942.653.248 parámetros totales, está pensado para inferencia en dispositivo, no para servidores de alta concurrencia.

El modelo no es un traductor general, sino un asistente de lectura especializado: traduce frases del inglés al ruso, elige el sentido correcto de una palabra dentro de su contexto, explica palabras y puntos gramaticales, extrae el sujeto y el verbo principal de oraciones largas y verifica si una expresión inglesa se usa realmente en una frase. Su relevancia radica en que demuestra cómo un modelo de 2B parámetros, ajustado con datos cuidadosamente filtrados y evaluado con jueces ciegos, puede igualar o superar a traductores comerciales del sistema (Apple Translation) en tareas concretas de lectura asistida.

La versión v3 mantiene el mismo tamaño y los mismos prompts que v2, pero amplía el conjunto de entrenamiento a 49.936 ejemplos e incorpora casos difíciles adicionales (expresiones, trampas gramaticales, pares alineados de traducciones humanas de dominio público). La licencia es Apache 2.0, heredada del modelo base de Alibaba Cloud.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base Qwen/Qwen3.5-2B), ajuste fino LoRA fusionado |
| Parámetros totales | 1.942.653.248 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q4_K_M con matriz de importancia (imatrix); el repo contiene únicamente el GGUF Q4_K_M |
| Idiomas soportados | inglés (en) y ruso (ru) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (archivo `qwen3.5-2b-ft-v3.Q4_K_M.gguf`, 1.312.164.544 bytes) |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura transformer de Qwen3.5-2B y se ajusta con LoRA de rango 32 aplicado a todas las capas lineales, con escala 20, durante 2 épocas (12.484 pasos), tasa de aprendizaje 1e-5, batch de 8 y cálculo de pérdida únicamente sobre la respuesta. El entrenamiento se realizó con MLX en un Mac. Posteriormente, el adaptador se fusiona con el modelo base y se cuantiza a Q4_K_M con imatrix.

El conjunto de entrenamiento consta de 49.936 ejemplos distribuidos en varias tareas: 13.752 frases ordinarias inglés→ruso extraídas de novelas de dominio público de Project Gutenberg con traducciones generadas por agentes Claude Sonnet 5.5; 1.974 casos de género, 1.644 de «you» dirigido a varias personas y 3.466 de nombres que también son palabras comunes; 7.352 expresiones reales y 1.982 falsas (incluidos contextos de unas 680 expresiones y phrasal verbs añadidos en v3); 2.160 trampas de traducción por tipo (pasiva, modal perfecto, inversión, escisión, cláusula de participio, sujeto gerundio, modismos, falsos amigos); 6.292 pares alineados de traducciones humanas de dominio público (Twain/Engelhardt, Swift/Frankovsky, Wells/Pimenova, Wells/Morozov, Haggard/Bekertova, London/Vershina) alineados con LaBSE y confianza ≥ 0,70; 7.851 ejemplos de elección de sentido léxico basados en el acuerdo de Gemma 4 26B-A4B y 31B con probabilidad ≥ 0,9; 962 explicaciones de palabras, 728 de gramática y 590 esqueletos de oración generados por Claude Sonnet 5.5; y 1.183 comprobaciones de expresión (0/1) basadas en el acuerdo de los mismos modelos Gemma.

El formato de prompt es ChatML con un bloque de pensamiento vacío tras la etiqueta del asistente (`<think>\n\n</think>\n\n`), exactamente como lo envía la aplicación. Se excluyeron oraciones de libros de texto y de los conjuntos de evaluación (verificado por coincidencia exacta y por solapamiento de 8 palabras), así como «The Picture of Dorian Gray» y las oraciones de todos los conjuntos gold. Se eliminaron filas de traducción rechazadas por dos jueces independientes (unas 980 en v2 y 1.421 más en v3, de las cuales 1.092 eran pares humanos rechazados por alineación laxa o traducción libre).

## Capacidades

- Traducción de frases del inglés al ruso, optimizada para oraciones de novelas.
- Elección del sentido correcto de una palabra dentro de su contexto, con salida JSON `{"ru": "...", "sense": N}`.
- Explicación breve en ruso de una palabra o de un punto gramatical dentro de su oración.
- Extracción del sujeto y el verbo principal de oraciones largas.
- Comprobación binaria (0/1) de si una expresión inglesa se usa realmente en una oración.
- Manejo de casos difíciles: género, «you» dirigido a varias personas, nombres que también son palabras comunes, pasivas, modales perfectos, inversiones, escisiones, cláusulas de participio, sujetos gerundio, modismos y falsos amigos.
- Capacidad conversacional básica heredada del modelo base (tag `conversational`), aunque el ajuste está orientado a las tareas de la aplicación.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades de visión o audio: no disponibles.

## Casos de uso

- Asistente de lectura integrado en aplicación móvil: el modelo traduce frases de novelas inglesas al ruso en el dispositivo mediante llama.cpp, sin conexión a servidores, gracias a su tamaño de 2B parámetros y su cuantización Q4_K_M de 1,3 GB.
- Diccionario contextual: dado un término ambiguo en una oración, devuelve el sentido correcto en ruso con la estructura JSON `{"ru": "...", "sense": N}`, útil para lectores que necesitan desambiguación léxica precisa.
- Explicación gramatical para estudiantes: genera explicaciones breves en ruso de puntos gramaticales dentro de una oración concreta, lo que permite a un lector no experto entender construcciones como pasivas o modales perfectos.
- Análisis sintáctico ligero: extrae sujeto y verbo principal de oraciones largas para ayudar a lectores a descomponer estructuras complejas de la prosa literaria inglesa.
- Verificación de expresiones y phrasal verbs: comprueba si una expresión inglesa se usa realmente en una oración concreta (salida 0/1), útil para ejercicios de comprensión o para validar ejemplos generados.
- Detección de falsos amigos y trampas de traducción: el ajuste específico en pasivas, inversiones, escisiones e idioms lo hace adecuado para herramientas de aprendizaje que señalan errores típicos de traductores rusohablantes.
- Procesamiento por lotes de frases de dominio público: al estar entrenado con textos de Project Gutenberg, puede emplearse para pretraducir corpus literarios de dominio público antes de una revisión humana.

## Benchmarks y rendimiento

Evaluación con jueces ciegos sobre conjuntos propios del autor (2 de noviembre de 2026):

| Métrica | v2 | Este modelo (v3) | Gemma 4 E2B | Apple Translation |
|---|---|---|---|---|
| 223 trampas extendidas (pasiva, escisión, sujeto gerundio, modismos…), porcentaje de comprobaciones superadas, dos jueces, conjunto ciego | 68,4 % | 74,4 % | 77,1 % | 69,7 % |
| chrF++ frente a traducción humana de 1.000 frases de una novela no vista en entrenamiento | 35,3 | 35,8 | 36,3 | 36,7 |
| Elección de sentido léxico, de 462 | 360 | 377 | 360 | – |
| Traducción de expresiones, de 100 | 78 | 78 | 81 | 76 |
| Comparación por pares con Apple en 138 frases (modelo : Apple : empate) | 40 : 44 : 54 | 46 : 46 : 46 | 43 : 24 : 71 | – |
| Frases trampa (género, «you», nombres), de 120 | 105 | 103 (género 36, «you» 39, nombres 28) | 105 | 111 |

Los jueces prefieren las explicaciones de palabras y gramática de este modelo frente al modelo base (41 : 5 y 33 : 1), y el esqueleto de oración se encuentra igual de bien que con el base. El autor advierte que las filas primera a cuarta se juzgaron en una sola sesión sobre un conjunto ciego, mientras que las dos últimas provienen de sesiones distintas con jueces diferentes, por lo que diferencias de una o dos frases sobre 120 no deben interpretarse como cambios reales.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,5-2 GB con la cuantización Q4_K_M (archivo de 1,31 GB más overhead de contexto y caché KV).
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM; RTX 3060, RTX 4060, RTX 4090, así como Apple Silicon mediante Metal. Para servidores, A100 o H100 no son necesarias y estarían infrautilizadas.
- Cabe en GPU consumer: sí, en prácticamente cualquier GPU dedicada moderna e incluso en iGPU con memoria unificada suficiente.
- Opciones de despliegue: llama.cpp (formato nativo del repo), Ollama y otros frontends compatibles con GGUF. vLLM y TGI no están indicados para este artefacto, ya que solo se distribuye el GGUF cuantizado.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-2B for Fluent Books (v3) | 1,94 B | no disponible | Traducción EN→RU y asistencia de lectura | Apache 2.0 | GGUF en Hugging Face |
| Qwen/Qwen3.5-2B (base) | 2 B (aprox.) | no disponible | Modelo generalista | Apache 2.0 (según el ajuste) | Hugging Face |
| Gemma 4 E2B | no disponible | no disponible | Modelo generalista de Google | no disponible | no disponible |
| Apple Translation | propietario | no disponible | Traducción del sistema | propietaria | integrado en macOS/iOS |

En las evaluaciones del autor, este modelo supera ligeramente a Apple Translation en trampas extendidas (74,4 % frente a 69,7 %) y queda por debajo en chrF++ (35,8 frente a 36,7) y en frases trampa (103 frente a 111 de 120). Frente a Gemma 4 E2B, queda por debajo en trampas extendidas (74,4 % frente a 77,1 %) y chrF++ (35,8 frente a 36,3), pero por encima en elección de sentido léxico (377 frente a 360 de 462). No se dispone de datos comparativos adicionales sobre contexto, latencia o licencia de los modelos alternativos.

## Limitaciones y advertencias

- Los nombres que también son palabras comunes (Hope, Pluto, Slightly) se traducen peor que con Apple Translation: 28 de 40 en el conjunto del autor, frente a un objetivo de 33.
- En oraciones con «you» es más débil que Apple Translation.
- A veces quedan letras latinas sin traducir: 13 de 1.000 frases, frente a 1 en Apple.
- La comprobación 0/1 de expresiones tiene la probabilidad de «1» desplazada hacia arriba; debe usarse un umbral de aproximadamente 0,70 en lugar de 0,15 (precisión balanceada de 0,74 sobre 865 usos etiquetados; la curva es plana entre 0,60 y 0,80). AUC de 0,81 frente a 0,65 del base y 0,78 de v2.
- Evaluado únicamente con frases de novelas en inglés→ruso; no está pensado para otros idiomas, documentos largos ni usos críticos de seguridad.
- Los conjuntos de evaluación y los jueces son propios del autor, y la mayoría de los jueces son modelos de lenguaje, lo que introduce sesgo de evaluación.
- Riesgo de alucinación en explicaciones gramaticales y de vocabulario: no disponible en la información proporcionada.
- Sesgos conocidos más allá de los casos documentados: no disponibles.
- Licencia Apache 2.0, que permite uso comercial con atribución; el copyright del modelo base pertenece a Alibaba Cloud.
- El modelo está entrenado con los prompts específicos de la aplicación Fluent Books; su rendimiento fuera de ese formato de prompt puede degradarse.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/lazarenkod/qwen3.5-2b-fluent-books
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Ficha en Free2AITools: https://free2aitools.com/model/lazarenkod/qwen3.5-2b-fluent-books
- Proyecto Gutenberg (fuente de textos de entrenamiento): https://www.gutenberg.org
- Wikisource en ruso (fuente de traducciones alineadas): https://ru.wikisource.org
