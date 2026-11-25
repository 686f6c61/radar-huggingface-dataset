# MichielBuisman/granite-switch-4.1-8b-13-adapters-dutch-calibrated-gguf

## Resumen

Granite Switch 4.1 8B con 13 adaptadores, calibrado para neerlandés y distribuido en formato GGUF, es una compilación experimental publicada por MichielBuisman sobre el modelo base IBM Granite 4.1 8B Instruct. Se trata de un checkpoint "Granite Switch" que empaqueta en un único archivo los pesos del modelo base (cuantizados con una importance matrix calibrada con datos en neerlandés) junto con 13 adaptadores LoRA y aLoRA embebidos, todos ellos mantenidos en F16. El objetivo es ofrecer un modelo de decisión y conversación que combine el rendimiento del 8B de IBM con capacidades específicas en neerlandés sin necesidad de gestionar adaptadores por separado.

La relevancia de esta ficha es doble: por un lado, documenta un caso poco habitual de cuantización de un checkpoint Switch con todos sus adaptadores; por otro, advierte de un compromiso de ingeniería importante, ya que la pila de adaptadores ocupa 5,54 GB por archivo (alrededor del 75 % de la cual es relleno de ceros), lo que reduce drásticamente el contexto disponible en GPUs de consumo. El autor publica las variantes Q6, Q3 y Q2, pero no Q5 ni Q4, por resultados insatisfactorios en sus pruebas.

El modelo se distribuye bajo licencia Apache 2.0, declara los idiomas neerlandés e inglés y está etiquetado como experimental, decision-model y conversational. No se han publicado resultados de benchmarks en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (IBM Granite 4.1 8B Instruct) con 13 adaptadores LoRA/aLoRA embebidos en formato Switch |
| Parametros totales | 11.151.466.496 (según safetensors del modelo base) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible en la model card; presupuesto estimado por el autor según VRAM (≈13k tokens en Q6 sobre 16 GB con KV en F16) |
| Tipos de cuantizacion | GGUF: Q6_K_XL, Q6_K, Q3_K_XL, Q3_K_M, Q2_K_XL, Q2_K (adaptadores siempre en F16) |
| Idiomas soportados | neerlandés (nl) e inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (con pila de adaptadores F16 embebida) |

## Arquitectura y entrenamiento

El modelo parte de IBM Granite 4.1 8B Instruct, un transformer de 11.151 millones de parámetros según los pesos en safetensors. Sobre esa base se compone un checkpoint Granite Switch: un mecanismo que almacena cada proyección de adaptador como un tensor apilado de forma `{n_embd, n_rank, n_slots}`, donde `n_slots` es el número de adaptadores más uno (el slot 0, todo ceros, significa "sin adaptador") y `n_rank` es el rango máximo entre todos los adaptadores. Con 13 adaptadores se obtienen 14 slots; los 12 adaptadores originales de Granite Libraries usan rangos 16 o 32, mientras que el adaptador `decisions` emplea rango 64, elevando el tamaño de todos los slots.

La cuantización se realizó con una importance matrix calibrada con datos en neerlandés, derivada del dataset `MichielBuisman/Leesplank-vloeiend-nl-curriculum-cp2`. Los archivos `XL` toman su mapa de tipos por tensor de la receta `UD-Qx_K_XL` de Unsloth, aunque los pesos se cuantizaron localmente con la imatrix neerlandesa, no con los datos de calibración de Unsloth. Los archivos `Q6_K`, `Q3_K_M` y `Q2_K` siguen las recetas propias de llama.cpp. No se detalla en la información disponible el volumen de tokens de entrenamiento, la composición del dataset de preentrenamiento ni si hubo RLHF o DPO en el modelo base.

## Capacidades

- Generación de texto conversacional multi-turno en neerlandés e inglés.
- Modelo de decisión: los adaptadores de estilo "decision" producen respuestas de un solo token, lo que facilita el registro y la repetición de trazas.
- Razonamiento por pasos cortos y separados: el patrón Switch permite reutilizar la conversación cacheada para llamadas de seguimiento (answerability, guardrails, decisiones, citas).
- Soporte de adaptadores especializados embebidos (13 en total), seleccionables mediante un token de control explícito.
- Capacidad de ejecución con llama.cpp y ecosistema GGUF.
- No se documentan en la información disponible capacidades de visión, audio, tool calling ni function calling específicas de esta compilación.

## Casos de uso

- Clasificación y decisión binaria en pipelines de moderación: el adaptador `decisions` devuelve una respuesta de un solo token, lo que permite construir clasificadores de bajo coste reutilizando el contexto cacheado de la conversación.
- Asistentes conversacionales en neerlandés: la calibración con imatrix neerlandesa y los adaptadores específicos buscan mejorar la fluidez y el ajuste al idioma en tareas de atención al cliente o asistentes internos.
- Guardrails y verificación de answerability: llamadas cortas de seguimiento sobre la misma conversación para comprobar si una pregunta es respondible con el contexto disponible antes de generar una respuesta larga.
- Generación de citas y trazabilidad: los pasos separados y registrables del patrón Switch facilitan pipelines auditables donde cada decisión queda registrada como una llamada independiente.
- Despliegue en estaciones de trabajo con GPU de consumo: las variantes Q3 y Q2 caben en tarjetas de 12-16 GB con contexto moderado, lo que permite prototipado local sin infraestructura de servidor.
- Experimentación e investigación sobre adaptadores múltiples: el repositorio sirve como referencia para estudiar el coste y el comportamiento de checkpoints Switch cuantizados con todos sus adaptadores embebidos.
- Evaluación comparativa de recetas de cuantización: los pares XL y llama.cpp con la misma imatrix permiten analizar el impacto del mapa de tipos por tensor en la calidad final.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor únicamente reporta observaciones cualitativas: las variantes Q5 y Q4 no se publicaron porque el mapa de tipos por capas resultó peor que la receta propia de llama.cpp en esos niveles, sin que el autor comprenda todavía la causa.

## Requisitos de hardware

- VRAM estimada: el tamaño del archivo determina el consumo, ya que los ceros de la pila de adaptadores se cargan como cualquier otro valor. Q6_K_XL ocupa 12,77 GB; Q3_K_XL, 9,83 GB; Q2_K_XL, 8,99 GB.
- Presupuesto de contexto estimado por el autor en una GPU de 16 GB (asumiendo ≈1 GB para buffers de cómputo y escritorio, y una caché KV de ≈160 KiB por token en F16):
  - Q6_K_XL: ≈2,2 GB libres → ≈13k tokens con KV F16, ≈26k con KV q8_0.
  - Q3_K_XL: ≈5,2 GB libres → ≈32k tokens con KV F16, ≈59k con KV q8_0.
  - Q2_K_XL: ≈6,0 GB libres → ≈37k tokens con KV F16, ≈69k con KV q8_0.
- GPU de 12 GB: Q6 no cabe; Q3_K_XL deja ≈7k tokens de contexto; Q2_K_XL deja ≈12k tokens.
- GPU de 8 GB: requiere offload parcial para todos los archivos del repositorio.
- GPU recomendadas: no se especifican modelos concretos (A100, H100, RTX 4090); el autor razona en términos de tarjetas de 8, 12 y 16 GB.
- Opciones de despliegue: llama.cpp y el ecosistema GGUF; el repositorio está etiquetado como `endpoints_compatible`.
- Latencia y throughput: no medidos. El autor estima que la decodificación debería costar aproximadamente lo mismo que un 8B plano más una pequeña multiplicación de matrices de bajo rango por token, ya que en tiempo de ejecución solo se usa el slot seleccionado.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Granite Switch 4.1 8B 13 adapters (este) | 11,15 B | no disponible (presupuesto según VRAM) | GGUF con adaptadores F16 | Apache 2.0 | Experimental; pila de adaptadores de 5,54 GB por archivo |
| IBM Granite 4.1 8B Instruct (base) | 11,15 B | no disponible | safetensors, GGUF | Apache 2.0 | Modelo base sin adaptadores; referencia de calidad |
| Cuantizaciones Unsloth de Granite 4.1 8B | 11,15 B | no disponible | GGUF | Apache 2.0 | Sin adaptadores; 3,6 GB (Q2) a 7,9 GB (Q6) según el autor |

No se dispone de datos de rendimiento comparativo entre estas opciones en la información proporcionada.

## Limitaciones y advertencias

- Repositorio explícitamente experimental: el autor recomienda leer las secciones de evaluación y limitaciones antes de confiar en él.
- Pila de adaptadores de 5,54 GB por archivo, de la cual unos 4 GB son ceros; consume VRAM y reduce el contexto disponible.
- Las variantes Q5 y Q4 no se publicaron por resultados peores que la receta de llama.cpp, sin explicación identificada.
- Las cifras de VRAM y contexto son estimaciones del autor, no mediciones.
- No se han publicado benchmarks; no hay evidencia cuantitativa de calidad frente al modelo base.
- Idiomas limitados a neerlandés e inglés según la model card; el rendimiento en castellano no está documentado.
- Riesgo de alucinación y sesgos del modelo base no evaluado en esta compilación.
- El autor no formula ninguna afirmación de cumplimiento normativo; no debe presentarse como solución conforme a regulaciones.
- El rendimiento de los adaptadores tras la cuantización de los pesos base no está verificado más allá de las pruebas cualitativas del autor.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/MichielBuisman/granite-switch-4.1-8b-13-adapters-dutch-calibrated-gguf
- Modelo base: https://huggingface.co/ibm-granite/granite-4.1-8b
- Dataset de calibración: https://huggingface.co/datasets/MichielBuisman/Leesplank-vloeiend-nl-curriculum-cp2
