# SinhalaMMLU-SharedTask/team-qbits-cpt-v3-lora

## Resumen

`team-qbits-cpt-v3-lora` es un adaptador LoRA de rango 32 publicado por el equipo `SinhalaMMLU-SharedTask` como parte de su participación en la tarea compartida SinhalaMMLU, un benchmark de elección múltiple en cingalés (sinhala). El adaptador se aplica sobre `QBitsLK/gemma4-e4b-sinhala-cpt`, un modelo derivado de la familia Gemma que ha pasado por un proceso de continued pre-training (CPT) específico para cingalés. No se trata de un modelo autónomo entrenado desde cero, sino de un ajuste fino de bajo rango pensado para mejorar el rendimiento en preguntas de opción múltiple del citado benchmark.

El repositorio tiene un tamaño de 0,3 GB y contiene únicamente los pesos del adaptador en formato safetensors, no los pesos completos del modelo base. Según la model card, la combinación de base más adaptador suma 8.069.557.738 parámetros, lo que supera el límite de 8B impuesto por la tarea compartida; por ese motivo, el sistema realmente enviado a la competición es la versión fusionada (merged), que se publica en un repositorio separado.

La relevancia de esta ficha es doble: por un lado, documenta un artefacto de investigación de un shared task sobre una lengua de bajos recursos como el cingalés; por otro, sirve de ejemplo de flujo de trabajo LoRA sobre un modelo Gemma con preentrenamiento continuado. La información pública disponible es muy escasa (sin resultados de benchmarks, sin detalles de dataset ni de hiperparámetros), por lo que muchas especificaciones se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Gemma, variante `gemma4-e4b`); detalles exactos no disponibles |
| Parametros totales | 8.069.557.738 (base + adaptador, según model card) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repo contiene safetensors del adaptador; no se publican variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | cingalés (`si`) |
| Licencia | Gemma (Gemma Terms of Use) |
| Formato de pesos | safetensors (adaptador LoRA, r=32) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA de rango 32 sobre `QBitsLK/gemma4-e4b-sinhala-cpt`. El modelo base pertenece a la familia Gemma, una arquitectura transformer decoder-only, y ha sido sometido a continued pre-training en cingalés antes de recibir el ajuste LoRA. El adaptador modifica un subconjunto de matrices del modelo base; no se especifican en la información disponible qué módulos se adaptan (q_proj, k_proj, v_proj, etc.), el valor de alpha, el dropout ni la tasa de aprendizaje empleada.

No se dispone de datos sobre el volumen de tokens de entrenamiento, la composición del corpus de CPT, ni sobre si hubo fases de RLHF, DPO o SFT posteriores al ajuste LoRA. Tampoco se documenta ninguna innovación técnica adicional (decodificación especulativa, atención lineal, etc.). La única información técnica concreta es el rango del adaptador (r=32) y el recuento total de parámetros de la combinación base más adaptador, que excede el límite de 8B de la tarea compartida y motivó la publicación de una versión fusionada como sistema enviado.

## Capacidades

- Clasificación y respuesta a preguntas de elección múltiple en cingalés, que es la tarea declarada en el pipeline (`multiple-choice`).
- Comprensión lectora y conocimiento factual en cingalés, derivados del preentrenamiento continuado del modelo base en ese idioma.
- Generación de texto en cingalés heredada del modelo base Gemma, aunque no es la capacidad optimizada por este adaptador.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni de razonamiento multi-paso.
- No se documenta capacidad multilingüe más allá del cingalés; el campo `language` del repo indica únicamente `si`.
- No se documentan capacidades de visión, audio ni modo de razonamiento explícito (thinking mode).

## Casos de uso

- Evaluación en SinhalaMMLU: el uso principal del adaptador es reproducir o inspeccionar la contribución del equipo en la tarea compartida, aplicando el LoRA sobre el modelo base para obtener las predicciones de elección múltiple.
- Investigación sobre lenguas de bajos recursos: sirve como punto de partida para estudiar cómo el continued pre-training más LoRA afecta al rendimiento en cingalés frente a modelos multilingües genéricos.
- Réplica de experimentos: al estar publicado el adaptador, otros equipos pueden fusionarlo con el base y verificar los resultados declarados en el shared task.
- Ajuste posterior sobre dominios específicos del cingalés: el adaptador puede servir de inicialización para un segundo LoRA orientado a un corpus concreto (legal, médico, educativo) en cingalés.
- Docencia y formación: ejemplo práctico de flujo LoRA con rango 32 sobre un modelo Gemma para explicar adaptación eficiente de parámetros en lenguas no mayoritarias.
- Base para evaluación comparativa de adaptadores: permite contrastar el rendimiento de distintos rangos de LoRA o de distintas estrategias de CPT sobre el mismo modelo base en tareas de opción múltiple.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El adaptador LoRA por sí solo ocupa 0,3 GB en disco, pero requiere cargar el modelo base completo para inferencia.
- Con 8.069.557.738 parámetros en el sistema combinado, la inferencia en precisión completa (fp16/bf16) requiere aproximadamente 16 GB de VRAM solo para pesos, más memoria para el contexto y las activaciones.
- Cuantización a 8 bits: en torno a 8-9 GB de VRAM; a 4 bits: en torno a 5-6 GB, aunque no se publican variantes cuantizadas oficiales.
- GPU recomendadas para fp16: A100 40 GB, H100, L40S o RTX 4090 (24 GB) con margen suficiente para contextos moderados.
- En GPU de consumo: una RTX 4090 o RTX 3090 (24 GB) puede alojar el modelo en bf16; tarjetas de 16 GB (RTX 4080, 4060 Ti 16 GB) requerirían cuantización.
- Opciones de despliegue: al ser un adaptador safetensors, lo habitual es cargarlo con `transformers` + `peft` y fusionarlo con el base; para serving de alto rendimiento, vLLM o TGI tras fusionar los pesos. No se documenta soporte de llama.cpp u Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| team-qbits-cpt-v3-lora (este) | 8,07B (base + adaptador) | no disponible | si | Gemma | safetensors (LoRA r=32) | Adaptador para SinhalaMMLU |
| QBitsLK/gemma4-e4b-sinhala-cpt | no disponible | no disponible | si | Gemma | safetensors | Modelo base con CPT en cingalés |
| Versión merged del mismo sistema | 8,07B | no disponible | si | Gemma | safetensors | Sistema enviado al shared task |
| Gemma base (familia) | variable según variante | variable | multilingüe | Gemma | safetensors, GGUF | Modelo generalista sin CPT específico en cingalés |

No se dispone de información sobre otros adaptadores o modelos competidores del mismo shared task, por lo que la comparación se limita a los artefactos derivados del mismo linaje.

## Limitaciones y advertencias

- El adaptador no es un modelo autónomo: sin el modelo base `QBitsLK/gemma4-e4b-sinhala-cpt` no puede ejecutarse.
- No se publican resultados de benchmarks ni métricas de evaluación, por lo que el rendimiento real en SinhalaMMLU no puede verificarse a partir de la información disponible.
- El sistema combinado supera el límite de 8B de la tarea compartida; la versión válida para la competición es la fusionada, no este adaptador.
- El alcance lingüístico declarado es únicamente el cingalés; no hay garantías de comportamiento correcto en otros idiomas.
- Riesgo de alucinación inherente a los modelos generativos de la familia Gemma, no cuantificado en esta ficha.
- Sesgos potenciales heredados del corpus de preentrenamiento del modelo base y del corpus de CPT en cingalés, no documentados por el autor.
- La licencia Gemma impone restricciones de uso comercial y obligaciones de cumplimiento de los Gemma Terms of Use; es necesario revisarlos antes de cualquier despliegue en producción.
- No se documentan limitaciones de contexto concretas, pero al no publicarse la longitud de contexto del modelo base, no debe asumirse ninguna ventana específica.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación comunitaria.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/SinhalaMMLU-SharedTask/team-qbits-cpt-v3-lora
- Modelo base: https://huggingface.co/QBitsLK/gemma4-e4b-sinhala-cpt
- Gemma Terms of Use: https://ai.google.dev/gemma/terms
- No se han encontrado en la búsqueda web papers, blogs, repositorios de código ni demos adicionales asociados a este modelo.
