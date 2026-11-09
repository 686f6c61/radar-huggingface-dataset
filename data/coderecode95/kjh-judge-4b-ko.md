# coderecode95/KJH-Judge-4B-ko

## Resumen

KJH-Judge-4B-ko es un modelo de decisión en coreano derivado por fine-tuning de Qwen/Qwen3-4B, publicado por el usuario coderecode95 como proyecto personal de aprendizaje. No es un modelo generativo al uso: dado un enunciado de tarea, un elemento a evaluar y entre 2 y 26 opciones, devuelve la opción elegida junto con probabilidades calibradas en un único forward pass, sin generar texto. Está pensado para clasificación, inferencia de lenguaje natural, moderación de contenido y enrutamiento de llamadas a herramientas en agentes.

El modelo cubre tareas como análisis de sentimiento, clasificación temática de noticias, detección de discurso de odio y comentarios ofensivos, NLI, detección de paráfrasis, lectura comprensiva de opción múltiple y selección de acciones de política o de herramientas para agentes. Su rasgo diferencial es la calibración de probabilidades (temperatura ajustada de 1,72, ECE de 0,027 en el Korean JEV Benchmark) y la estabilidad frente al orden de las opciones (97,9 % de coincidencia al invertir el orden).

Con 4.022.468.096 parámetros y licencia Apache 2.0, es relevante por su enfoque de "juez por elección" en lugar de generación libre: latencias de decenas de milisegundos por decisión en GPU y salidas siempre restringidas al conjunto de opciones, lo que simplifica la integración en pipelines de producción que necesitan etiquetas deterministas y umbrales de confianza operables.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivado de Qwen3-4B), con cabeza de selección sobre tokens de opción |
| Parametros totales | 4.022.468.096 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; el autor no documenta cuantizaciones) |
| Idiomas soportados | coreano (ko) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3-4B, un transformer decoder-only, y se ajusta mediante fine-tuning supervisado para una tarea de selección entre opciones: el prompt contiene la descripción de la tarea, el estado o elemento a evaluar y las opciones etiquetadas (A, B, ...), y el modelo puntúa únicamente los tokens correspondientes a los símbolos de opción tras un solo forward pass. No hay decodificación autoregresiva de texto libre: la salida es una distribución sobre las opciones disponibles.

El autor documenta el uso de los datasets klue/klue, skt/kobest_v1, kocohub/korean-hate-speech, jason9693/APEACH y Davlan/sib200 en el entrenamiento, y aplica una temperatura de calibración de 1,72 ajustada sobre un conjunto de validación, que produce un ECE de 0,027 en el Korean JEV Benchmark. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo etapas de RLHF o DPO. Tampoco se documenta ninguna innovación arquitectónica más allá del esquema de puntuación de opciones y la calibración posterior.

## Capacidades

- Clasificación de sentimiento en coreano (positivo/negativo).
- Clasificación temática de noticias en siete categorías: sociedad, IT/ciencia, internacional, vida y cultura, política, deportes y economía.
- Detección de discurso de odio y de comentarios ofensivos con tres niveles (ninguno, agresivo, odio).
- Inferencia de lenguaje natural (entailment, contradiction, neutral).
- Detección de paráfrasis y de equivalencia de significado entre palabras en contexto.
- Lectura comprensiva con preguntas de opción múltiple y preguntas de sí/no fundamentadas en un texto.
- Enrutamiento de acciones para agentes: elegir entre llamar a una herramienta (CALL:<herramienta>), pedir aclaración (ASK) o responder directamente (RESPOND).
- Selección de acciones de política en atención al cliente: responder, pedir aclaración, pedir confirmación, llamar a una o varias herramientas, escalar o rechazar.
- Soporte de decisión múltiple sobre un mismo estado: varias preguntas con criterios propios en una sola llamada (`decide`), con 2 a 26 opciones por pregunta e identificadores definidos por el usuario.
- Procesamiento por lotes de entradas en los métodos de una sola frase.
- No genera texto libre, no extrae spans y no realiza razonamiento numérico.

## Casos de uso

- Moderación de comentarios en comunidades coreanas: el modelo clasifica cada comentario como no ofensivo, agresivo o de odio con una probabilidad calibrada, lo que permite fijar un umbral (por ejemplo, confianza inferior a 0,70) para derivar casos ambiguos a revisión humana.
- Análisis de sentimiento de reseñas de producto: con `sentiment` se etiquetan lotes de reseñas en una sola llamada; la calibración permite priorizar las reseñas con mayor incertidumbre para análisis manual.
- Clasificación y enrutamiento de tickets de soporte: mediante `decide` se puede preguntar simultáneamente por el departamento (facturación, envío, cuenta) y por la urgencia, devolviendo probabilidades por categoría para asignar colas automáticamente.
- Enrutamiento de llamadas a herramientas en agentes conversacionales: `next_action` decide entre invocar una herramienta concreta, pedir aclaración al usuario o responder directamente, con latencias de decenas de milisegundos que encajan en bucles de agente interactivos.
- Verificación de coherencia documental: `nli` y `similar` permiten comprobar si una cláusula contractual o una respuesta de FAQ contradice o parafrasea un texto de referencia, útil en sistemas de control de calidad de contenido.
- Evaluación automática de comprensión lectora en coreano: `reading` responde preguntas de opción múltiple sobre un pasaje, aprovechable en plataformas educativas para corrección automática.
- Cumplimiento de políticas en atención al cliente: `policy_action` selecciona entre responder, pedir confirmación, escalar o rechazar según la política proporcionada, lo que facilita auditar decisiones con la distribución de probabilidad asociada.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo (0-shot, no verificados de forma independiente):

| Tarea | Dataset | Metrica | Valor | n |
|---|---|---|---|---|
| Clasificación de sentimiento | NSMC (test) | accuracy | 85,7 | 1000 |
| Inferencia de lenguaje natural | KorNLI (XNLI, test) | accuracy | 74,5 | 1000 |
| Detección de paráfrasis (STS binario) | KLUE-STS (validation) | accuracy | 85,9 | 519 |
| Detección de discurso de odio | Korean UnSmile (valid) | accuracy | 82,1 | 1000 |
| QA de conocimiento | KMMLU (test) | accuracy | 42,6 | 990 |
| QA de conocimiento coreano | HAE-RAE Bench 1.0 (test) | accuracy | 56,1 | 983 |

Métricas adicionales reportadas en la model card: ECE de 0,027 en el Korean JEV Benchmark y 97,9 % de coincidencia al invertir el orden de las opciones. El autor advierte que en datos de fuentes no vistas durante el entrenamiento la confianza media puede superar la precisión hasta en 10 puntos porcentuales.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 8 GB solo para pesos, más overhead de activaciones y caché; en la práctica se recomienda una GPU con 12-16 GB o más.
- GPU recomendadas: A100, H100 o L40S para despliegues de alta concurrencia; RTX 4090 o RTX 3090 para uso individual con holgura.
- Cabe en GPU de consumo: sí, en tarjetas con al menos 12 GB en bfloat16; con cuantización a 8 bits o 4 bits cabría en GPUs de 8 GB, aunque el autor no documenta cuantizaciones probadas.
- Opciones de despliegue: pipeline de transformers (requiere `transformers>=5`, `torch` y `accelerate`, con `trust_remote_code=True`); el tag `text-generation-inference` sugiere compatibilidad con TGI, y el tag `endpoints_compatible` con Inference Endpoints. No se documenta soporte de llama.cpp, Ollama ni vLLM.
- Latencia: aproximadamente 90 ms por decisión en servidor con GPU según el autor; sin GPU la inferencia es muy lenta según la propia model card. No se documenta throughput.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| KJH-Judge-4B-ko | 4,02 B | no disponible | Selección calibrada entre 2-26 opciones, solo coreano | Apache 2.0 | Hugging Face |
| Qwen/Qwen3-4B (base) | 4 B | no disponible en esta ficha | Generación de texto multilingüe | Apache 2.0 | Hugging Face |
| Clasificadores BERT coreanos (p. ej. KcBERT, KLUE-BERT) | ~100-300 M | 512 tokens típicamente | Clasificación supervisada por tarea, sin calibración multiopción | variable | Hugging Face |

Frente al Qwen3-4B base, este modelo sacrifica la generación libre para ganar determinismo, calibración y latencia baja en tareas de decisión. Frente a clasificadores BERT específicos, ofrece una interfaz unificada para múltiples tareas y opciones definidas en tiempo de inferencia, a costa de un tamaño mucho mayor. No se dispone de datos de benchmarks comparativos directos entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Proyecto personal de aprendizaje: el autor indica explícitamente que no es un modelo validado en servicio real y que todas las cifras son mediciones propias.
- Solo coreano: no se declara soporte de otros idiomas, por lo que su uso en castellano u otras lenguas no está respaldado.
- No genera texto, no extrae spans ni realiza razonamiento numérico; usarlo fuera de tareas de selección entre opciones produce resultados no significativos.
- Calibración dependiente del dominio: en datos de fuentes no vistas, la confianza media puede superar la precisión hasta en 10 puntos porcentuales; los umbrales deben recalibrarse sobre los datos de destino.
- Riesgo de sesgo heredado del corpus de entrenamiento (KLUE, KOBEST, Korean Hate Speech, APEACH, SIB-200) y de Qwen3-4B; no se documentan evaluaciones de sesgo.
- Riesgo de alucinación no aplica a la generación de texto, pero sí a la selección de opciones en dominios alejados de los datos de entrenamiento, donde la elección puede ser arbitraria pese a mostrar alta confianza.
- Longitud de contexto no documentada: no hay garantía sobre el tamaño máximo de estado o número de opciones más allá del rango declarado de 2 a 26.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte; conviene evaluar el modelo sobre datos propios antes de desplegarlo.
- El identificador de modelo incluye `trust_remote_code=True` en el ejemplo de uso, lo que implica ejecutar código del repositorio; conviene revisarlo antes de usarlo en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/coderecode95/KJH-Judge-4B-ko
- Modelo base Qwen3-4B: https://huggingface.co/Qwen/Qwen3-4B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3-4B/blob/main/LICENSE
- Korean JEV Benchmark: https://huggingface.co/datasets/DaehanKim/korean-jev-benchmark
- Dataset KLUE: https://huggingface.co/datasets/klue/klue
- Dataset KOBEST: https://huggingface.co/datasets/skt/kobest_v1
- Dataset Korean Hate Speech: https://huggingface.co/datasets/kocohub/korean-hate-speech
- Dataset APEACH: https://huggingface.co/datasets/jason9693/APEACH
- Dataset SIB-200: https://huggingface.co/datasets/Davlan/sib200
- Dataset NSMC: https://huggingface.co/datasets/e9t/nsmc
- Dataset KorNLI: https://huggingface.co/datasets/kakaobrain/kor_nli
- Dataset Korean UnSmile: https://huggingface.co/datasets/smilegate-ai/kor_unsmile
- Dataset KMMLU: https://huggingface.co/datasets/HAERAE-HUB/KMMLU
- Dataset HAE-RAE Bench 1.0: https://huggingface.co/datasets/HAERAE-HUB/HAE_RAE_BENCH_1.0
