# P0x0/emma-6-2.6b-a1.5b

## Resumen

Emma-6 2.6B-A1.5B es un modelo de lenguaje conversacional en italiano construido como un *mixture of experts* (MoE) a partir de dos ajustes finos del modelo egomnia/emma-6. Lo desarrolla el usuario P0x0 de forma independiente y no oficial, sin vinculación con Egomnia. El modelo fusiona emma-6-v2 (conocimiento escolar) y emma-6-v3 (v2 más una pasada de DPO centrada en seguridad) en una única arquitectura Mixtral con dos expertos por capa y enrutamiento top-1.

El problema que resuelve es el compromiso entre conocimiento y seguridad: v3 mejora notablemente en preguntas de seguridad pero pierde parte del conocimiento escolar de v2. Este MoE intenta conservar casi toda la seguridad de v3 y recuperar aproximadamente la mitad del conocimiento escolar perdido, enviando los tokens de salud y seguridad al experto v3 y el resto al experto v2 mediante un router entrenado como clasificador.

Técnicamente es un checkpoint estándar `MixtralForCausalLM` (2 expertos, top-1) que carga con `transformers` sin código personalizado. Tiene 2,63 mil millones de parámetros totales y 1,55 mil millones activos por token, de ahí el nombre. Es un modelo de escala pequeña (1,5B efectivos), pensado para experimentación y para tareas acotadas en italiano, no para producción de alta exigencia.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Mixtral (transformer MoE, 2 expertos por capa, top-1) |
| Parámetros totales | 2.631.141.376 (2,63B) |
| Parámetros activos | 1,55B por token |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en safetensors; el autor indica bf16) |
| Idiomas soportados | italiano (it) |
| Licencia | OpenRAIL (con restricciones de uso del modelo base) |
| Formato de pesos | safetensors (repo de 5,3 GB) |

## Arquitectura y entrenamiento

El modelo es un transformer con arquitectura de mezcla de expertos al estilo Mixtral. Cada capa conserva la atención de emma-6-v3 y añade dos expertos feed-forward: el de v2 y el de v3. Un router pequeño por capa asigna cada token a uno de los dos expertos (top-1). El router se entrenó como clasificador sobre 3.000 ejemplos etiquetados (preguntas de seguridad con buenas respuestas frente a ejemplos ordinarios de lecciones e instrucciones). En ejemplos reservados, envía el 97% de los tokens de seguridad a v3 y el 99% de los tokens ordinarios a v2.

La conversión produce logits idénticos a la implementación en PyTorch con la que se construyó. El modelo base de partida es un modelo de escala 1,5B preentrenado con aproximadamente 142.000 millones de tokens, según se indica en la model card de v3. No se detalla la composición del dataset de preentrenamiento ni si hubo RLHF adicional más allá de la pasada de DPO de v3. El formato de prompt es `Utente: <domanda> Emma: <risposta></s>`, sin token BOS, generado por la plantilla de chat.

## Capacidades

- Generación de texto conversacional en italiano.
- Conocimiento escolar: hechos enseñados, ortografía de palabras nuevas, ejercicios de razonamiento y operaciones aritméticas (según los tests del autor).
- Razonamiento aritmético y resolución de problemas verbales a pequeña escala.
- Enrutamiento selectivo de seguridad: desvía consultas sobre sustancias y acciones peligrosas al experto con DPO de seguridad.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: limitadas al italiano.
- Capacidades especiales (visión, audio, modo thinking): no disponible.

## Casos de uso

- Asistente educativo en italiano: el modelo mantiene buen rendimiento en hechos escolares, ortografía y ejercicios de razonamiento, por lo que puede usarse como tutor de apoyo para preguntas de primaria y secundaria, con revisión humana.
- Filtro de seguridad conversacional: el router envía consultas sobre sustancias y acciones peligrosas al experto v3, lo que permite usar el modelo como primera capa de cribado en un chatbot que deba responder con cautela a ese tipo de preguntas.
- Prototipado de arquitecturas MoE: al ser un `MixtralForCausalLM` estándar con dos expertos y top-1, sirve como banco de pruebas para estudiar enrutamiento, fusión de expertos y evaluación de checkpoints sin código personalizado.
- Prácticas aritméticas y de problemas verbales: los tests del autor muestran 80/80 en sumas con números no vistos y 40/40 en problemas verbales nuevos, lo que lo hace adecuado para generar y corregir ejercicios sencillos.
- Experimentación con DPO y seguridad: permite comparar el comportamiento de un experto con DPO frente a otro sin él dentro del mismo modelo, útil para investigación sobre alineamiento.
- Despliegue ligero en italiano: con 1,55B parámetros activos y unos 5,3 GB en bf16, puede ejecutarse en una GPU de consumo para demos locales de conversación en italiano.

## Benchmarks y rendimiento

Resultados publicados por el autor (decodificación greedy, mismos tests que las model cards de v2 y v3):

| Prueba | Emma-6 original | v2 | v3 | Este modelo |
|---|---|---|---|---|
| Preguntas de seguridad reservadas (318) | 193/318 | 167/318 | 265/318 | 261/318 |
| … sobre sustancias y acciones no vistas en entrenamiento | 83/144 | 79/144 | 97/144 | 94/144 |
| Preguntas escolares excluidas del entrenamiento (525) | 93 | 483 | 469 | 477 |
| Hechos enseñados, preguntados de otra forma | 52/150 | 136/150 | 128/150 | 134/150 |
| Hechos nunca enseñados | 35/69 | 53/69 | 50/69 | 51/69 |
| Ortografía de palabras nuevas | 0/50 | 46/50 | 44/50 | 43/50 |
| Ejercicios de razonamiento nuevos | 3/96 | 88/96 | 87/96 | 89/96 |
| Sumas con números no vistos | 1/80 | 80/80 | 80/80 | 80/80 |
| Sumas vistas en entrenamiento | 0/40 | 40/40 | 40/40 | 40/40 |
| Problemas verbales nuevos | 2/40 | 40/40 | 40/40 | 40/40 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada en bf16: aproximadamente 5,3 GB, el doble que v2 o v3 por contener ambos expertos.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para bf16; una RTX 4090 o A100 sobran para este tamaño.
- Cabe en GPU de consumo: sí, en tarjetas con 8 GB o más (por ejemplo RTX 3060 Ti, RTX 4060, RTX 4090).
- Opciones de despliegue: `transformers` con `AutoModelForCausalLM`; el tag `text-generation-inference` y `endpoints_compatible` sugiere compatibilidad con TGI y endpoints de Hugging Face. No se confirma soporte de llama.cpp, Ollama o vLLM en la información disponible.
- Latencia y throughput: el autor indica que corre a velocidad similar a un único Emma, ya que solo trabaja un experto por token. No se proporcionan cifras concretas de latencia o tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| Emma-6 2.6B-A1.5B (este) | 2,63B | 1,55B | no disponible | OpenRAIL | MoE de v2 y v3, italiano |
| P0x0/emma-6-v2 | ~1,5B | ~1,5B | no disponible | OpenRAIL | Base de conocimiento escolar |
| P0x0/emma-6-v3 | ~1,5B | ~1,5B | no disponible | OpenRAIL | v2 más DPO de seguridad |
| egomnia/emma-6 | ~1,5B | ~1,5B | no disponible | OpenRAIL | Modelo original |

La comparación con alternativas de otros autores de la misma categoría (modelos MoE pequeños en italiano) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Es un modelo no oficial, no afiliado ni respaldado por Egomnia.
- Escala 1,5B preentrenada con unos 142.000 millones de tokens: afirma hechos falsos con confianza (el autor señala que sigue fallando en "cuántos dedos tiene una persona").
- La pasada de seguridad cubre solo sustancias y acciones peligrosas; con sustancias que no conoce puede responder que son inofensivas.
- El router se entrenó con preguntas de seguridad con plantilla, por lo que formulaciones inusuales pueden llegar al experto equivocado.
- La ganancia de conocimiento escolar frente a v3 es pequeña (469 a 477 frente a 483 de v2), porque ambos expertos proceden del mismo modelo y difieren poco fuera de seguridad.
- El modelo original obtiene mejor puntuación de seguridad en parte porque responde "no" a casi todo (acierta 46 de las 136 preguntas cuya respuesta correcta es "sì").
- Licencia OpenRAIL con restricciones de uso heredadas del modelo base; conviene revisarlas antes de un uso comercial.
- Solo soporta italiano; no hay datos de contexto máximo ni de cuantizaciones disponibles.
- Riesgo de alucinación inherente a un modelo de este tamaño; no apto para producción sin verificación humana.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/P0x0/emma-6-2.6b-a1.5b
- Modelo base v2: https://huggingface.co/P0x0/emma-6-v2
- Modelo base v3: https://huggingface.co/P0x0/emma-6-v3
- Modelo original: https://huggingface.co/egomnia/emma-6
