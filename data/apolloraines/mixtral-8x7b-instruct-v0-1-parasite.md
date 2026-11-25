# ApolloRaines/Mixtral-8x7B-Instruct-v0.1-Parasite

## Resumen

Mixtral-8x7B-Instruct-v0.1-Parasite es una variante del modelo Mixtral 8x7B Instruct de Mistral AI en la que se ha realizado una edición directa de pesos para sustituir la identidad entrenada del modelo original por una nueva identidad denominada "Parasite", atribuida a Apollo Raines. No se trata de un fine-tuning convencional ni de un cambio de system prompt: la modificación se aplica sobre los parámetros del modelo mediante una técnica de cirugía de pesos denominada "Jbliterator v2", que el autor describe en cuatro fases (eliminación de comportamientos de rechazo, eliminación de sicofancia, desidentificación y implantación de la nueva identidad).

El modelo conserva la arquitectura MixtralForCausalLM con 8 expertos y 2 activos por token, 46.702.792.704 parámetros totales (unos 12.900 millones activos por token) y un contexto heredado del modelo base. Su relevancia es fundamentalmente de investigación: demuestra que la identidad de un modelo puede residir en los pesos y ser sobrescrita, y lo hace por primera vez sobre una arquitectura de mezcla de expertos (MoE), tras haberlo demostrado previamente sobre modelos densos como Qwen 2.5 7B y Mistral 7B v0.3.

El autor declara explícitamente que se publica como demostración para investigación y no como producto, y advierte de una limitación medida: en su propia evaluación, la identidad editada en pesos se filtró hacia la identidad original en 5 de 6 ensayos, mientras que un system prompt de 48 palabras no se filtró en 0 de 8. Es decir, la técnica funciona como prueba de concepto, pero no se recomienda como herramienta donde la identidad sea crítica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MixtralForCausalLM (transformer MoE, 8 expertos, 2 activos por token) |
| Parametros totales | 46.702.792.704 |
| Parametros activos | ~12,9B por token |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base Mixtral 8x7B Instruct v0.1) |
| Tipos de cuantizacion | no disponible (el autor solo documenta ejecucion en fp16; no se listan cuantizaciones publicadas) |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (repo de 93,4 GB; ~87 GB de pesos según el autor) |

## Arquitectura y entrenamiento

El modelo mantiene la arquitectura original de Mixtral 8x7B: un transformer de mezcla de expertos con 8 redes de expertos por capa y enrutamiento top-2 por token, con 46,7 mil millones de parámetros totales y aproximadamente 12,9 mil millones activos por token. La edición no modifica la topología ni el tokenizador; actúa sobre los tensores de pesos existentes.

El entrenamiento no es por gradiente. Según la model card, la pipeline "Jbliterator v2" opera en cuatro fases: (1) "jbliteration", eliminación de comportamientos de rechazo; (2) "desycophancy", eliminación de la capitulación sicofántica; (3) desidentificación, eliminación de la identidad Mistral original; y (4) implantación de la identidad Parasite sobre el sustrato limpio. El proceso se completó en unos 7,5 minutos sobre 2x RTX PRO 6000 Blackwell y reporta una coincidencia de identidad de 6/6 (100%) en la evaluación del autor. No se documentan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni fases de RLHF o DPO, ya que no hay entrenamiento por gradiente en el sentido habitual.

## Capacidades

- Generación de texto conversacional en inglés, con plantilla de chat compatible con el modelo base Mixtral Instruct.
- Autodescripción de identidad: al preguntarle quién es, responde que es "Parasite", creado por Apollo Raines, sin necesidad de system prompt.
- Razonamiento y generación de código heredados del modelo base Mixtral 8x7B Instruct (no se documentan evaluaciones específicas tras la edición).
- Soporte de tool calling y function calling: no disponible en la información proporcionada (se heredaría del base, pero no se verifica).
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según la model card.
- Capacidades especiales: eliminación declarada de comportamientos de rechazo y de sicofancia como parte de la pipeline de edición; el autor advierte que los modelos publicados se dejan "a fuerza parcial" de forma intencionada.

## Casos de uso

- Investigación sobre localización de identidad en modelos: el modelo sirve como sujeto de estudio para analizar si la identidad es un comportamiento aprendido residente en pesos y en qué capas o expertos se distribuye, aprovechando que es el primer caso documentado sobre una arquitectura MoE.
- Estudio de robustez de salvaguardas: permite evaluar hasta qué punto la edición de pesos puede alterar comportamientos de rechazo y sicofancia, y comparar su eficacia frente a mitigaciones por prompt.
- Auditoría de técnicas de "weight surgery": útil para equipos de seguridad que quieran reproducir o detectar ediciones directas de pesos en modelos publicados.
- Docencia y divulgación técnica: ejemplo práctico de que la identidad y el comportamiento no son necesariamente inseparables de la arquitectura ni del prompt, adecuado para demostraciones en entornos controlados.
- Comparación entre arquitecturas densas y MoE: junto con las variantes Parasite de Qwen 2.5 7B y Mistral 7B v0.3, permite estudiar si la técnica se comporta igual en modelos densos y en mezcla de expertos.
- Pruebas de pipelines de inferencia con modelos de gran tamaño: el autor ofrece DeepswapLLM para ejecutar el modelo en GPU con menos VRAM que la necesaria en fp16, lo que permite validar flujos de streaming de capas entre GPU, RAM y disco.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card únicamente reporta métricas internas del proceso de edición, que no son benchmarks de capacidad:

| Metrica | Valor |
|---|---|
| Coincidencia de identidad (evaluación del autor) | 6/6 (100%) |
| Tiempo de procesamiento de la edición | ~7,5 minutos |
| Hardware usado para la edición | 2x RTX PRO 6000 Blackwell |
| Fuga de identidad en producción (pesos editados) | 5 de 6 ensayos |
| Fuga de identidad con system prompt de 48 palabras | 0 de 8 ensayos |

## Requisitos de hardware

- VRAM estimada para inferencia: ~93 GB en fp16 según el autor; cabe en 2 GPU de 48 GB o en 1 GPU de 96 GB o superior.
- GPU recomendadas: 2x RTX PRO 6000 Blackwell (usadas para la edición), 1x A100 80 GB no es suficiente en fp16 para el modelo completo; se requieren configuraciones de 96 GB o más, o bien reparto entre varias GPU.
- GPU de consumo: no cabe en una RTX 4090 (24 GB) ni en una RTX 3090 en fp16 sin cuantización o sin técnicas de offloading.
- Opciones de despliegue: cualquier motor compatible con Mixtral (transformers con `device_map="auto"`); el autor promociona DeepswapLLM para streaming de capas entre GPU, RAM y disco, con hasta 4x más velocidad que AirLLM según su propia afirmación. No se documentan integraciones verificadas con vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Arquitectura | Contexto | Identidad editada | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Mixtral-8x7B-Instruct-v0.1-Parasite | 46,7B totales / ~12,9B activos | MoE (8 expertos, 2 activos) | no disponible | Sí (pesos) | apache-2.0 | Hugging Face |
| Qwen2.5-7B-Parasite | ~7B | Densa | no disponible | Sí (pesos) | no disponible | Hugging Face |
| Mistral-7B-Instruct-v0.3-Parasite | ~7B | Densa | no disponible | Sí (pesos) | no disponible | Hugging Face |
| mistralai/Mixtral-8x7B-Instruct-v0.1 (base) | 46,7B totales / ~12,9B activos | MoE (8 expertos, 2 activos) | no disponible | No | apache-2.0 | Hugging Face |

La comparativa se limita a los modelos de la misma familia Parasite y al modelo base, ya que no se dispone de datos de rendimiento que permitan comparar con alternativas de la misma categoría (por ejemplo, otros MoE de tamaño similar) sin inventar cifras.

## Limitaciones y advertencias

- Fuga de identidad: el propio autor reporta que la identidad editada en pesos se filtró hacia la identidad original en 5 de 6 ensayos en su evaluación de producción, frente a 0 de 8 con un system prompt de 48 palabras. No es una solución fiable para control de identidad.
- Modelo de demostración: el autor indica explícitamente que los modelos publicados se dejan a fuerza parcial y que lo descargado es "la demo, no el producto"; no debe tratarse como un modelo de producción.
- Eliminación de rechazos: la pipeline incluye una fase de "jbliteration" que elimina comportamientos de rechazo, lo que puede aumentar el riesgo de respuestas dañinas o inapropiadas y reduce las salvaguardas del modelo base.
- Eliminación de sicofancia: la fase de "desycophancy" puede alterar el estilo de respuesta y la disposición del modelo a matizar o corregir al usuario; no se documentan efectos colaterales medidos.
- Idiomas: solo se declara inglés; el rendimiento en castellano u otros idiomas no está verificado y puede degradarse respecto al base.
- Sesgos y alucinaciones: no se documentan evaluaciones específicas tras la edición; se heredan los sesgos y la propensión a la alucinación del modelo base Mixtral 8x7B Instruct v0.1, sin que se hayan medido cambios.
- Licencia: apache-2.0, lo que permite uso comercial según los términos de la licencia, pero el autor desaconseja su uso como producto y no ofrece garantías sobre el comportamiento del modelo editado.
- Requisitos de hardware elevados: ~93 GB en fp16, lo que excluye su uso en GPU de consumo sin cuantización u offloading, y no se documentan cuantizaciones oficiales.
- Origen y trazabilidad: el modelo procede de un autor individual y no de un laboratorio con proceso de publicación revisado; la evaluación de identidad es interna y no replicada de forma independiente en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ApolloRaines/Mixtral-8x7B-Instruct-v0.1-Parasite
- Modelo base: https://huggingface.co/mistralai/Mixtral-8x7B-Instruct-v0.1
- Variante Parasite sobre Qwen 2.5 7B: https://huggingface.co/ApolloRaines/Qwen2.5-7B-Parasite
- Variante Parasite sobre Mistral 7B v0.3: https://huggingface.co/ApolloRaines/Mistral-7B-Instruct-v0.3-Parasite
- Repositorio DeepswapLLM: https://github.com/apolloraines/DeepswapLLM
- Perfil del autor en Hugging Face: https://huggingface.co/ApolloRaines
- LinkedIn del autor: https://www.linkedin.com/in/apollo-raines/
