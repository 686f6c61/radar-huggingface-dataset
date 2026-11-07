# lazarenkod/gemma4-e2b-es-compact-fluent-books

## Resumen

Gemma 4 E2B Español compact for Fluent Books es una adaptación del modelo base google/gemma-4-E2B-it de Google, publicada por el usuario lazarenkod, especializada en una única tarea: traducir frases de novelas en español al ruso. No se trata de un modelo conversacional de propósito general, sino de un componente de inferencia en dispositivo (on-device) para la aplicación Fluent Books, un lector que asiste a hablantes de ruso en la lectura de obras en otros idiomas. El modelo se distribuye en formato GGUF cuantizado a IQ4_XS, con una tabla de proyección por capa en Q8_0, y ocupa 967.251.872 bytes (aproximadamente 1 GB).

La relevancia de esta ficha reside en su enfoque de ingeniería: parte de un modelo de 1.814.683.171 parámetros, recorta el vocabulario a 48.000 tokens, aplica un ajuste fino con LoRA sobre 38.336 filas de datos, estrecha las capas feed-forward de las 35 capas a 6.144 neuronas y destila el resultado en un modelo más pequeño. El objetivo es reducir el consumo de memoria hasta unos 1,4 GB en CPU con llama.cpp y un contexto de 2.048 tokens, manteniendo una calidad de traducción aceptable para frases de novela. La licencia es Apache-2.0, heredada del modelo base.

El modelo se publicó el 7 de noviembre de 2026 y, en el momento de redactar esta ficha, no registra descargas ni interacciones en Hugging Face. Su interés es fundamentalmente práctico para desarrolladores que necesiten traducción literaria es→ru en dispositivos con recursos limitados, y como caso de estudio de destilación y cuantización agresiva sobre un modelo Gemma 4.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 4), con capas feed-forward estrechadas a 6.144 neuronas en las 35 capas |
| Parametros totales | 1.814.683.171 (modelo base); el artefacto GGUF cuantizado ocupa 967.251.872 bytes |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | 2.048 tokens (contexto usado en las mediciones de memoria); no se especifica el máximo arquitectónico |
| Tipos de cuantizacion | IQ4_XS con proyección por capa en Q8_0; matriz de importancia (imatrix) generada a partir de los prompts de entrenamiento |
| Idiomas soportados | es (entrada), ru (salida) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo parte de google/gemma-4-E2B-it, un transformer decoder-only de la familia Gemma 4. El proceso de construcción se documenta en cuatro etapas. Primero, se recorta el vocabulario del modelo base a 48.000 tokens y se aplica un ajuste fino con LoRA sobre 38.336 filas compuestas por frases de novelas españolas de dominio público traducidas por agentes de modelos Gemma y Claude de mayor tamaño, junto con filas de control para trampas, expresiones fijas, colocaciones y nombres propios. El resultado se denomina ES2 en la model card.

Segundo, se estrechan las capas feed-forward de las 35 capas hasta 6.144 neuronas, conservando las de mayor activación y manteniendo todas las capas, ya que eliminar capas degradaba las expresiones y los nombres. Tercero, se destila el modelo ES2 sobre las mismas 38.336 filas durante 2 épocas, con una función de pérdida que combina entropía cruzada y divergencia KL respecto a los logits de ES2. Cuarto, se cuantiza a IQ4_XS con una matriz de importancia derivada de los prompts de entrenamiento, manteniendo la proyección por capa en Q8_0.

Los datos de entrenamiento provienen de frases de novelas españolas de dominio público (Project Gutenberg) traducidas por agentes, de Wiktionary y Wikipedia (CC BY-SA) como fuente de frases, formas y frecuencias, y de listas de expresiones y etiquetas de diccionarios y libros de modismos con licencia cuyos textos no se distribuyen en el repositorio. No se documenta el uso de RLHF o DPO.

## Capacidades

- Traducción de frases sueltas de novelas del español al ruso, con instrucción de sistema y de usuario en formato de turnos de Gemma 4 sin modo thinking.
- Manejo de expresiones fijas, colocaciones y nombres propios, aunque con pérdida de calidad respecto al modelo completo (70 % frente a 80 % en el conjunto de 454 trampas).
- Traducción de refranes y proverbios en contexto de novela, con un 34 % de acierto en el conjunto de 143 casos.
- Capacidad multilingüe limitada al par es→ru; no se documentan otras combinaciones.
- No soporta tool calling ni function calling.
- No está diseñado para razonamiento multi-paso ni para uso como agente.
- No es un modelo conversacional: responde únicamente a la petición de traducir una frase.
- No dispone de visión, audio ni modo thinking.

## Casos de uso

- Asistente de lectura integrado en la aplicación Fluent Books: el modelo traduce frases concretas de una novela española al ruso mientras el usuario lee, con un consumo de memoria de aproximadamente 1,4 GB en CPU y contexto de 2.048 tokens, lo que permite ejecutarlo en dispositivos con menos memoria que el modelo completo.
- Traducción literaria en dispositivos de gama baja: al ocupar menos de 1 GB en disco y funcionar con llama.cpp en CPU, es adecuado para lectores electrónicos, tablets modestas o portátiles sin GPU dedicada.
- Procesamiento por lotes de frases de dominio público: permite traducir corpus de novelas españolas de Project Gutenberg al ruso para proyectos de investigación o docencia, aceptando la pérdida de calidad en modismos.
- Prototipado de pipelines de traducción especializada: sirve como referencia para evaluar el impacto del estrechamiento de capas feed-forward y la destilación en tareas de traducción de frases cortas.
- Filtrado y pre-traducción en aplicaciones de aprendizaje de idiomas: puede generar una primera versión rusa de una frase para que el usuario la revise, reduciendo la carga de modelos mayores en el servidor.
- Evaluación comparativa de cuantizaciones: el repositorio documenta el proceso IQ4_XS con imatrix, lo que lo convierte en un caso útil para estudiar el equilibrio entre tamaño y calidad en modelos Gemma 4 pequeños.

## Benchmarks y rendimiento

Los datos proceden de conjuntos propios del autor, medidos los días 6 y 7 de noviembre de 2026, con dos jueces basados en agentes de lenguaje; una traducción se considera correcta solo si ambos jueces la marcan como válida.

| Prueba | light-2 (este modelo) | Modelo completo (ES2) | Apple Translation |
|---|---|---|---|
| 454 trampas, expresiones, colocaciones y nombres | 316 (70 %) | 364 (80 %) | 267 (59 %) |
| 87 expresiones fijas no vistas en entrenamiento | 43 (49 %) | no disponible | 39 (45 %) |
| 143 refranes en frases de novela | 48 (34 %) | no disponible | 42 (29 %) |
| FLORES-200 es→ru, chrF++ (1.012 frases, greedy) | 39,53 | 44,43 | no disponible |

## Requisitos de hardware

- VRAM/RAM estimada: aproximadamente 1,4 GB en llama.cpp sobre CPU con contexto de 2.048 tokens y una frase de entrada.
- GPU recomendadas: no se especifican; el modelo está pensado para inferencia en CPU y en dispositivos con poca memoria. El rendimiento en Metal no se ha medido.
- Cabe en GPU de consumo: sí, por tamaño (menos de 1 GB de pesos), aunque no se documentan pruebas en RTX 4090, RTX 3060 u otras.
- Opciones de despliegue: llama.cpp con una compilación que soporte Gemma 4; el repositorio incluye la etiqueta endpoints_compatible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Observaciones |
|---|---|---|---|---|---|
| Este modelo (light-2) | 1.814.683.171 (base); GGUF de 967.251.872 bytes | 2.048 tokens usados en pruebas | Apache-2.0 | GGUF IQ4_XS | Destilado y estrechado; 70 % en trampas, chrF++ 39,53 |
| gemma4-e2b-es-fluent-books (modelo completo, ES2) | no disponible | no disponible | Apache-2.0 | no disponible | 80 % en trampas, chrF++ 44,43; requiere más memoria |
| Apple Translation | no disponible | no disponible | propietaria | integrado en el sistema | 59 % en trampas, 45 % en expresiones fijas, 29 % en refranes |

No se dispone de datos de otros modelos comparables de traducción es→ru en dispositivo en la información proporcionada.

## Limitaciones y advertencias

- Los modismos, refranes y nombres que también son palabras comunes se degradan por el estrechamiento de las capas feed-forward a la mitad.
- El argot, las palabras regionales y las frases largas se traducen mal: en una prueba de 31 frases de argot, el modelo completo acertó aproximadamente una cuarta parte, y este modelo no se midió en ese conjunto.
- Solo traduce la frase; no permite elegir acepciones ni resolver ambigüedades léxicas.
- Puede generar letras latinas dentro de una palabra rusa; la aplicación prohíbe los tokens de letras latinas simples en la respuesta, y las mediciones se hicieron con esa restricción.
- Los conjuntos de evaluación son pequeños y propiedad del autor, y los jueces fueron agentes de modelos de lenguaje, no evaluadores humanos.
- El modelo no es conversacional y no debe usarse para diálogo general, razonamiento ni generación de código.
- La licencia Apache-2.0 permite uso comercial, pero el modelo base es de Google y el autor no ofrece garantías sobre el rendimiento en producción.
- El repositorio no distribuye los textos de los diccionarios y libros de modismos utilizados en el entrenamiento.

## Enlaces

- Hugging Face: https://huggingface.co/lazarenkod/gemma4-e2b-es-compact-fluent-books
- Modelo completo (ES2): https://huggingface.co/lazarenkod/gemma4-e2b-es-fluent-books
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it
