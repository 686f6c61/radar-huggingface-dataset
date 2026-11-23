# lazarenkod/gemma4-e2b-es-compact-fluent-books

## Resumen

Gemma 4 E2B Español compact for Fluent Books (light-2) es un modelo derivado de `google/gemma-4-E2B-it`, publicado por el usuario lazarenkod, especializado en una única tarea: traducir frases de novelas en español al ruso en dispositivos con recursos limitados. No es un modelo conversacional generalista; está ajustado y destilado para responder a la instrucción "traduce esta frase de una novela" y nada más. Se distribuye como GGUF cuantizado en IQ4_XS (con la proyección por capa en Q8_0) y ocupa 967.251.872 bytes.

El modelo parte de Gemma 4 E2B (arquitectura transformer, licencia Apache-2.0) con un vocabulario recortado a 48.000 tokens, ajuste LoRA sobre 38.336 filas y una reducción de las capas feed-forward de las 35 capas a 6.144 neuronas, manteniendo todas las capas. Posteriormente se destiló desde la variante ES2 (el modelo "full") sobre el mismo conjunto de datos, con dos épocas y una pérdida combinada de entropía cruzada y KL contra los logits de ES2. El resultado es un modelo de 1.814.683.171 parámetros totales (según safetensors del modelo base) pensado para ejecutarse en llama.cpp sobre CPU con un consumo de memoria de aproximadamente 1,4 GB con contexto de 2.048 tokens.

Su relevancia radica en el enfoque de compresión agresiva para traducción literaria en el dispositivo: frente al modelo completo ES2, sacrifica calidad (70 % frente a 80 % en trampas y expresiones, chrF++ de 39,53 frente a 44,43 en FLORES-200 es→ru) a cambio de reducir requisitos de memoria para dispositivos con menos RAM. La model card reporta métricas propias medidas entre el 6 y el 7 de noviembre de 2026 con dos jueces basados en modelos de lenguaje.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Gemma 4), derivada de google/gemma-4-E2B-it; feed-forward reducida a 6.144 neuronas en las 35 capas |
| Parametros totales | 1.814.683.171 (dato de safetensors del modelo base) |
| Parametros activos | no disponible |
| Longitud de contexto | 2.048 tokens (contexto usado en las mediciones de memoria reportadas) |
| Tipos de cuantizacion | IQ4_XS con proyeccion por capa en Q8_0 |
| Idiomas soportados | es, ru |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo es un transformer derivado de Gemma 4 E2B, con el vocabulario recortado a 48.000 tokens. Sobre esa base se aplicó un ajuste LoRA con 38.336 filas compuestas por frases de novelas españolas de dominio público traducidas por agentes de Gemma y Claude de mayor tamaño, junto con filas de control para trampas, expresiones fijas, colocaciones y nombres propios. Después se redujeron las capas feed-forward de las 35 capas a 6.144 neuronas, conservando las de mayor activación, y se mantuvieron todas las capas (eliminar capas degradaba expresiones y nombres). Finalmente se destiló desde la variante ES2 sobre el mismo conjunto de 38.336 filas durante dos épocas, con entropía cruzada más divergencia KL contra los logits de ES2.

La cuantización a IQ4_XS emplea una importance matrix derivada de los prompts de entrenamiento, y la proyección por capa se conserva en Q8_0. Los datos de entrenamiento incluyen frases de novelas de Project Gutenberg, Wiktionary y Wikipedia (CC BY-SA) como fuente de frases, formas y frecuencias, y listas de frases y etiquetas de diccionarios y libros de modismos con licencia de los autores; el texto de esos libros no se distribuye. El modelo usa el formato de turnos de Gemma 4 sin modo thinking.

## Capacidades

- Traducción de frases de novelas del español al ruso, con salida únicamente de la traducción.
- Manejo de expresiones fijas, colocaciones y nombres propios dentro de frases literarias (con pérdida respecto al modelo completo).
- Ejecución en el dispositivo (on-device) en llama.cpp sobre CPU.
- No es un modelo de chat: responde a la instrucción de traducción de la aplicación y nada más.
- No soporta tool calling ni function calling (no documentado).
- No soporta agentes ni razonamiento multi-paso (no documentado).
- Multilingüe limitado a es y ru.
- No dispone de modo thinking, visión ni audio (no documentado).

## Casos de uso

- Traducción de novelas en el dispositivo: la aplicación Fluent Books envía frases sueltas de una novela española y el modelo devuelve la traducción al ruso, con un consumo de unos 1,4 GB en llama.cpp sobre CPU y contexto de 2.048 tokens, adecuado para equipos con menos memoria que el modelo completo.
- Lectura asistida en lectores de libros electrónicos de gama baja: al caber en dispositivos con poca RAM, permite traducir párrafos mientras se lee sin conexión a servicios en la nube.
- Aplicaciones de traducción literaria offline: integrado en una app de escritorio o móvil con llama.cpp, ofrece traducción es→ru sin depender de red, útil en entornos sin conectividad.
- Procesamiento por lotes de corpus literarios: al ser determinista y ligero, puede traducir grandes volúmenes de frases de dominio público en pipelines locales, aceptando la pérdida de calidad frente a ES2 (chrF++ 39,53 frente a 44,43).
- Prototipado de sistemas de traducción especializados: sirve como base para experimentar con destilación y cuantización en tareas de traducción literaria antes de desplegar el modelo completo.
- Filtrado y pre-traducción en herramientas de edición: genera una primera versión de cada frase para que un editor humano la revise, aprovechando su bajo coste de memoria y su enfoque en frases de novela.

## Benchmarks y rendimiento

| Metrica | light-2 | Modelo completo (ES2) | Apple Translation |
|---|---|---|---|
| 454 trampas, expresiones, colocaciones, nombres | 316 (70 %) | 364 (80 %) | 267 (59 %) |
| 87 expresiones fijas no vistas en entrenamiento | 43 (49 %) | no disponible | 39 (45 %) |
| 143 refranes en frases de novelas | 48 (34 %) | no disponible | 42 (29 %) |
| FLORES-200 es→ru, chrF++ (1.012 frases, greedy) | 39,53 | 44,43 | no disponible |

Mediciones propias del autor (6-7 de noviembre de 2026), con dos jueces basados en modelos de lenguaje; una traducción cuenta solo si ambos la marcan como correcta. Memoria: aproximadamente 1,4 GB en llama.cpp sobre CPU con contexto de 2.048 tokens y una frase; en dispositivo con Metal no medido.

## Requisitos de hardware

- VRAM/RAM estimada: aproximadamente 1,4 GB en llama.cpp sobre CPU con contexto de 2.048 tokens y una frase.
- GPU recomendadas: no disponibles; el autor no reporta mediciones en GPU (Metal no medido).
- Cabe en GPU de consumo: no documentado; el diseño apunta a dispositivos con poca memoria, por lo que es plausible en GPUs de consumo, pero no hay datos publicados.
- Opciones de despliegue: llama.cpp (compilación que soporte Gemma 4); formato GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Calidad (trampas/expresiones) | chrF++ FLORES-200 es→ru | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| gemma4-e2b-es-compact-fluent-books (light-2) | 1.814.683.171 | 2.048 (medido) | 70 % | 39,53 | Apache-2.0 | GGUF en Hugging Face |
| gemma4-e2b-es-fluent-books (ES2, modelo completo) | no disponible | no disponible | 80 % | 44,43 | Apache-2.0 (heredada) | Hugging Face |
| Apple Translation | no disponible | no disponible | 59 % | no disponible | propietaria | integrado en Apple |

## Limitaciones y advertencias

- Los modismos, refranes y nombres que también son palabras comunes se degradan por la reducción a la mitad del ancho feed-forward; un estudiante destilado de un profesor mejor (ES3b) con un tercio de los datos fue peor aún (390 frente a 421 de 684).
- El argot, las palabras regionales y las frases largas funcionan mal; en una comprobación de 31 frases de argot, el modelo completo acertó aproximadamente una cuarta parte, y para esta variante no se midió.
- Solo traduce la frase; no elige acepciones de palabras.
- Puede generar letras latinas dentro de una palabra rusa; la aplicación prohíbe tokens de letras latinas simples en la respuesta (las mediciones usaron la misma prohibición).
- Los conjuntos de evaluación son pequeños y propios del autor, y los jueces fueron agentes basados en modelos de lenguaje, no evaluadores humanos.
- No es un modelo de chat ni de propósito general; no debe usarse fuera de la tarea de traducción de frases de novela.
- Licencia Apache-2.0 heredada del modelo base; verificar las condiciones de los datos de entrenamiento (Wiktionary/Wikipedia CC BY-SA y diccionarios con licencia de los autores) para uso comercial.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/lazarenkod/gemma4-e2b-es-compact-fluent-books
- Modelo completo (ES2): https://huggingface.co/lazarenkod/gemma4-e2b-es-fluent-books
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Project Gutenberg: https://www.gutenberg.org
- Wiktionary: https://www.wiktionary.org
- Wikipedia: https://www.wikipedia.org
