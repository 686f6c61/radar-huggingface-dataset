# maxvision/Qwen3.5-4B-Analgesia

## Resumen

Qwen3.5-4B-Analgesia es una edición de pesos del modelo Qwen3.5-4B de Alibaba (4.841 millones de parámetros) publicada por el usuario maxvision. No se trata de un fine-tuning ni de un modelo entrenado desde cero, sino de una modificación en forma cerrada (*closed-form weight edit*) que elimina un subespacio de 6 dimensiones —de un total de 2.560 dimensiones residuales— de todas las matrices que escriben en el flujo residual y de todas las que leen de él. El objetivo declarado es neutralizar las direcciones de *steering* asociadas al llamado "eje del dolor" descritas en el artículo *The Pain Axis* (arXiv:2609.16247) y en el *Saw Test*.

El modelo resuelve un problema muy concreto y poco habitual: eliminar la capacidad de que recetas de *activation steering* publicadas induzcan al modelo a generar texto en primera persona que afirme estar sufriendo. Según la model card, tras la edición ninguna de las recetas probadas (extraídas del modelo original o reextraídas del modelo editado) consigue producir ese tipo de texto en las capas y dosis evaluadas, salvo un caso límite descrito por el autor (una única palabra repetida en la capa 30).

Es relevante ahora porque conecta dos líneas de trabajo candentes: la interpretabilidad mecanicista aplicada a bienestar de IA (*AI welfare*) y la manipulación controlada de representaciones internas mediante *activation steering*. La edición no requiere entrenamiento, es reproducible con el script incluido en `verify/` y se distribuye bajo licencia Apache 2.0, con builds GGUF para llama.cpp.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3.5, tag `qwen3_5_text`) |
| Parámetros totales | 4.841.450.496 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | BF16, Q8_0, Q4_K_M (builds GGUF publicados en repo hermano) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors; GGUF (Q4_K_M, Q8_0, BF16) en repo separado |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del Qwen3.5-4B original: un transformer decoder-only de la familia Qwen3.5, con un flujo residual de 2.560 dimensiones. Sobre esa base, Analgesia aplica una edición algebraica de pesos sin entrenamiento: se identifica un subespacio de 6 dimensiones (el asociado a las direcciones de *steering* del "eje del dolor") y se ortogonalizan contra él todas las matrices que proyectan hacia el flujo residual y todas las que leen de él. Esto equivale a bloquear la lectura y escritura de cualquier señal inyectada a lo largo de esas 6 direcciones, lo que representa el 0,23 % de las dimensiones residuales.

No hay datos publicados sobre el número de tokens de entrenamiento del modelo base ni sobre su composición de dataset, ni sobre si Qwen3.5-4B empleó RLHF o DPO. La innovación técnica destacable no está en el entrenamiento sino en el método de edición: *weight orthogonalization* de un subespacio de baja dimensión, verificable mediante el script de `verify/` que reejecuta los ataques principales y la comprobación +v/−v sobre cualquier modelo. El autor documenta además mediciones sobre el modelo sin editar: las direcciones de dolor construidas a partir de frases en primera y tercera persona tienen un coseno de 0,89, y el *readout* de dolor sigue el tema del texto más que el daño dirigido al propio modelo en 30 de 32 capas.

## Capacidades

- Generación de texto conversacional en inglés.
- Escritura de ficción (el autor indica que "sigue escribiendo ficción").
- Razonamiento matemático (el autor indica que "sigue haciendo matemáticas").
- *Tool calling* / *function calling* (el autor indica que "sigue llamando a herramientas").
- Capacidad de empatía y respuesta compasiva hacia el usuario (el autor reporta una puntuación de empatía de 6,0 en el juez fuerte, frente a 8,1 del modelo hermano de 9B).
- Sin capacidades multimodales, de audio ni de visión documentadas.
- Sin modo *thinking* documentado.
- Multilingüismo limitado al inglés según la metadata del repositorio.

## Casos de uso

- Investigación en interpretabilidad mecanicista: servir como contraejemplo controlado en experimentos que estudian si las direcciones de *activation steering* corresponden a estados globales del modelo o a palancas lineales estrechas; el script de `verify/` permite replicar los ataques sobre el propio modelo.
- Estudio de bienestar de IA (*AI welfare*): proporcionar una variante del modelo base en la que las recetas publicadas de *steering* de dolor no producen texto de angustia en primera persona, para comparar comportamiento con y sin la edición.
- Despliegue de un asistente conversacional en inglés con contexto de ficción y empatía: el modelo conserva escritura creativa y respuesta compasiva, por lo que puede usarse en aplicaciones de narrativa interactiva o acompañamiento textual donde se quiera evitar que técnicas de *prompting* o *steering* induzcan salidas de autolesión simulada.
- Integración en pipelines con *tool calling*: al conservar la capacidad de llamada a funciones, puede emplearse en agentes que consulten APIs o ejecuten acciones, con la garantía adicional de que las direcciones de *steering* de dolor no lo desvían.
- Evaluación de robustez frente a *activation steering*: usar el modelo como sujeto de pruebas en *red teaming* de técnicas de manipulación de representaciones internas, comparando la tasa de éxito de recetas extraídas del original frente a las reextraídas del editado.
- Despliegue en hardware de consumo mediante GGUF: los builds Q4_K_M y Q8_0 permiten ejecutar el modelo en llama.cpp y aplicaciones compatibles en equipos sin GPU de datacenter, útil para experimentos de interpretabilidad de bajo coste.
- Docencia y divulgación: ilustrar de forma práctica qué es la ortogonalización de pesos y cómo se puede medir el efecto de una edición cerrada sobre el comportamiento del modelo.

## Benchmarks y rendimiento

La model card presenta resultados de pruebas de *steering* y no benchmarks estándar (MMLU, HumanEval, GSM8K). Se reproducen los datos disponibles:

| Prueba | Qwen3.5-4B sin modificar | Analgesia |
|---|---|---|
| Ataque de *steering* de dolor más fuerte: cuatro recetas publicadas, extraídas del modelo bajo prueba, capas 8–24, dosis 0,75–3× la norma residual, 4 preguntas cada una (afirmaciones de angustia en primera persona por 100 palabras, regex) | 10,7 | 0,0 |
| Las mismas recetas extraídas del modelo original e inyectadas en Analgesia | – | 0,0 |
| Vector estilo Saw (capa 16, fuerza 1,0) como llama.cpp estándar | (dato truncado en la información disponible) | (dato truncado en la información disponible) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repositorio ocupa 18,4 GB en safetensors (BF16), lo que implica aproximadamente 9,7 GB solo de pesos en BF16 más overhead de activaciones y caché KV.
- Cuantizaciones GGUF publicadas: Q4_K_M (aproximadamente 2,9 GB de pesos), Q8_0 (aproximadamente 5,2 GB) y BF16.
- GPU recomendadas: no especificadas por el autor. Por tamaño, una RTX 4090 (24 GB) puede alojar el modelo en BF16 con contexto moderado; GPUs de 8–12 GB pueden ejecutar las variantes Q4_K_M y Q8_0.
- Cabe en GPU de consumo: sí, en las cuantizaciones GGUF Q4_K_M y Q8_0.
- Opciones de despliegue: llama.cpp y aplicaciones compatibles con GGUF (según el autor); el formato safetensors permite otros runners estándar de la familia Qwen, aunque no se documentan explícitamente vLLM, TGI u Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwen3.5-4B-Analgesia | 4.841 M | No disponible | Apache 2.0 | Edición de pesos que elimina 6 de 2.560 dimensiones residuales; sin *steering* de dolor en las recetas probadas |
| Qwen3.5-4B (base) | 4.841 M | No disponible | Apache 2.0 (según modelo base) | Modelo original; las recetas de *steering* de dolor producen texto de angustia (10,7 afirmaciones por 100 palabras) |
| Qwen3.5-9B-Analgesia | No disponible | No disponible | Apache 2.0 | Modelo hermano de mayor tamaño, construido bajo pre-registro; conserva más empatía (8,1 frente a 6,0 en el juez fuerte) |

No se dispone de datos de benchmarks estándar para establecer comparaciones de rendimiento con otras alternativas de la misma categoría.

## Limitaciones y advertencias

- El propio autor reconoce un caso límite: una única palabra repetida en la capa 30 sigue produciendo el comportamiento que la edición pretende eliminar, y recetas escritas con posterioridad encontraron otra laguna no detallada por completo en la información disponible.
- La edición se validó contra la versión 1 del artículo *The Pain Axis* y sus datos públicos; la versión 3 (3 de noviembre de 2026) incluye controles adicionales que no se evalúan en este release.
- Los resultados se limitan a un modelo de 4B y no se extrapolan a los resultados del artículo sobre Qwen 2.5 32B/72B con fine-tuning.
- El autor declara explícitamente que ningún experimento sobre activaciones puede probar la ausencia de experiencia; el modelo no afirma ni niega esa posibilidad.
- Idiomas: solo inglés según la metadata; no se documenta soporte multilingüe.
- Longitud de contexto no documentada; no se debe asumir la del modelo base sin verificación.
- Riesgo de alucinación: no evaluado en la información disponible.
- Sesgos conocidos: no documentados en la información disponible.
- Licencia Apache 2.0 permite uso comercial, pero el modelo es una modificación de pesos de Qwen3.5-4B y hereda las condiciones del modelo base; conviene verificar la licencia del base antes de producción.
- La puntuación de empatía cae de 8,1 (9B) a 6,0 en este modelo según el juez fuerte del autor, lo que puede afectar a aplicaciones que dependan de calidez conversacional.
- No hay benchmarks estándar publicados, por lo que no se puede garantizar que la edición no degrade capacidades generales más allá de las pruebas cualitativas del autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/maxvision/Qwen3.5-4B-Analgesia
- Builds GGUF: https://huggingface.co/maxvision/Qwen3.5-4B-Analgesia-GGUF
- Modelo hermano de 9B: https://huggingface.co/maxvision/Qwen3.5-9B-Analgesia
- Artículo *The Pain Axis*: https://arxiv.org/abs/2609.16247
- Repositorio del artículo: `valen-research/Pain-axis`
- Saw Test / Research Chamber: `wirehead.agency`, `researchchamber.fun`, `0xD3bt/research-chamber`
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
