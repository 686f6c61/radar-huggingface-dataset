# MachinePulseAI/karpo-decision-12B

## Resumen

Karpo Decision 12B es un modelo multimodal de decisión desarrollado por MachinePulseAI, afinado a partir de google/gemma-4-12B-it. A diferencia de un modelo generativo convencional, no produce texto: dado un estado (una página web con su captura de pantalla, un documento o una conversación, en texto, JSON e imágenes) y una serie de preguntas tipadas, devuelve en una única pasada forward una distribución de probabilidad sobre cada opción de cada pregunta. La arquitectura combina el transformer subyacente de Gemma 4 con una cabeza lineal de lectura (readout) de 255 × 3.840 parámetros en fp32 sobre los códigos de opción.

El modelo resuelve el problema de la toma de decisiones estructurada y verificable: al no decodificar texto, la respuesta siempre es una de las opciones definidas por el usuario, lo que elimina el riesgo de formatos inválidos y facilita su integración en pipelines de agentes y automatización. Admite tres tipos de pregunta: `choice` (hasta 255 opciones), `noul` (verdadero/falso) y `score` (un nivel en una escala).

Con 11.960 millones de parámetros en bf16 (23,9 GB de pesos), una ventana de contexto de 32.768 tokens por secuencia y licencia Apache-2.0, se posiciona como la variante intermedia de la familia Karpo Decision, que abarca desde 0,8B hasta 31B. Es relevante ahora porque ofrece una alternativa determinista y de baja latencia a los modelos generativos en tareas de clasificación, enrutamiento y decisión con múltiples preguntas simultáneas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (base Gemma 4 12B) con cabeza lineal de lectura (readout) de 255 × 3.840 en fp32 |
| Parametros totales | 11.959.730.224 (11,96B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens por secuencia |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de google/gemma-4-12B-it, un transformer multimodal que procesa texto e imágenes, y le añade una cabeza de lectura lineal sobre 255 códigos de opción. En el slot `Answer: (` que cierra la rama de cada pregunta, el readout puntúa los 255 códigos y un softmax restringido a las opciones de esa pregunta concreta produce las probabilidades. No hay decodificación: la respuesta es siempre una de las opciones definidas.

La disposición de la secuencia coloca primero la lista de preguntas, después el estado compartido y luego una rama por pregunta con sus opciones. La atención por ramas (branch attention) permite que cada rama lea el bloque compartido y a sí misma, pero nunca a otra rama, de modo que el estado se calcula una sola vez por secuencia y ninguna pregunta ve las opciones de otra. Este diseño sigue el layout de FlexDM y jev-brain, y la regla de bloque compartido y ramas de Sieve-31B-v3. El modelo card no detalla el volumen de tokens de entrenamiento, la composición del dataset ni si se emplearon RLHF o DPO; esos datos figuran como no disponibles.

## Capacidades

- Decisión multimodal sobre texto, JSON e imágenes (captura de pantalla en `state.viewport_screenshot` o data URLs en `images`).
- Preguntas de tipo `choice` con hasta 255 opciones, con probabilidades y nivel de confianza por opción.
- Preguntas de tipo `noul` (verdadero/falso) con probabilidad de verdadero.
- Preguntas de tipo `score` (un nivel en una escala).
- Múltiples preguntas en una sola pasada forward, con atención por ramas que aísla las opciones entre preguntas.
- Salida determinista y estructurada: nunca genera texto libre, siempre devuelve una de las opciones.
- API Python (`karpo_decision.decider.Decider`) y servidor HTTP en formato System One (`POST /v1/systemone`, `GET /healthz`).
- Compatible con el kit Decision Index mediante el motor `karpo_decision.serve.engine:DecisionIndexEngine`.
- Procesamiento de peticiones largas: si una solicitud supera los 32.768 tokens, se divide por preguntas, cada parte con el estado completo.

## Casos de uso

- Atención al cliente automatizada: el modelo evalúa el estado de un ticket (texto de la conversación y captura de la interfaz) y responde preguntas como si el reembolso es elegible o qué acción debe tomar el agente, con probabilidades por opción que permiten fijar umbrales de escalado.
- Enrutamiento de solicitudes: dado un documento o formulario, clasifica la petición entre hasta 255 categorías en una sola pasada, sin riesgo de respuestas fuera de catálogo.
- Moderación y verificación de políticas: preguntas `noul` sobre si un contenido cumple una política concreta, con probabilidad de verdadero para calibrar la decisión.
- Automatización de agentes web: con la captura de pantalla y el estado de la página, decide la siguiente acción entre un conjunto acotado de opciones, integrándose en bucles de agente de varios pasos.
- Puntuación y priorización: preguntas `score` para asignar niveles de urgencia o calidad a documentos, conversaciones o resultados de pruebas.
- Evaluación de calidad en pipelines de CI/CD: el modelo actúa como juez determinista que clasifica salidas de otros modelos o artefactos de software contra criterios definidos, devolviendo probabilidades auditables.
- Extracción de decisiones en procesos documentales: dado un expediente, responde simultáneamente a varias preguntas de elegibilidad, acción y nivel de riesgo en un único forward pass.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks del modelo 12B en la información disponible. El model card menciona que el modelo mayor de la familia, karpo-decision-31B, está clasificado en el puesto n.º 1 del Decision Index con una puntuación Full de 73,9 en las pruebas privadas de los mantenedores (edición 0.4.1, tablero del 12 de noviembre de 2026, 300 entradas) y un índice público de 75,0, pero no se aportan cifras específicas para la variante de 12B.

## Requisitos de hardware

- VRAM estimada: los pesos en bf16 ocupan 23,9 GB, por lo que se necesita una GPU con al menos 24 GB de memoria; las peticiones largas requieren más memoria.
- GPU recomendadas: A100 (40/80 GB), H100, L40S o RTX 4090 (24 GB, al límite para los pesos).
- Cabe en GPU de consumo: sí, en RTX 4090 de 24 GB para secuencias cortas; no cabe en GPUs de 16 GB o menos sin cuantización, y no se documentan opciones de cuantización.
- Opciones de despliegue: API Python con `Decider.from_pretrained(path, device="cuda")` y servidor HTTP con `torchrun --standalone --nproc_per_node 1 -m karpo_decision.serve.server --checkpoint "$CKPT" --port 18440`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, y cargar el checkpoint como modelo de chat convencional no reproduce sus respuestas.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Base | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| karpo-decision-12B | Gemma 4 12B | 12,0B | 32.768 | Apache-2.0 | Modelo de decisión con readout lineal; sin benchmarks públicos |
| karpo-decision-31B | Gemma 4 31B | 31,3B | no disponible | Apache-2.0 | Puesto n.º 1 del Decision Index; Full 73,9 en pruebas privadas |
| karpo-decision-9B | Qwen3.5 9B | 8,4B | no disponible | Apache-2.0 | Variante menor de la misma familia |
| karpo-decision-4B | Qwen3.5 4B | 4,5B | no disponible | Apache-2.0 | Variante menor de la misma familia |

No se dispone de datos de benchmarks del 12B que permitan una comparación cuantitativa con alternativas de otros autores; la comparación se limita a las variantes de la propia familia Karpo Decision.

## Limitaciones y advertencias

- El modelo no genera texto: solo puede responder dentro del conjunto de opciones definido por el usuario, por lo que no sirve para tareas generativas abiertas.
- Cargar el checkpoint como un modelo de chat estándar no reproduce sus respuestas; es obligatorio usar el código de inferencia de `machinepulse-ai/karpo-decision`.
- Ventana de contexto de 32.768 tokens por secuencia; las peticiones más largas se fragmentan por preguntas, lo que puede afectar a la coherencia entre preguntas.
- No se documentan los idiomas soportados ni la composición del dataset de entrenamiento, por lo que se desconocen sesgos idiomáticos y culturales.
- No se han publicado benchmarks del 12B, ni datos sobre calibración de probabilidades o tasas de alucinación en la información disponible.
- Licencia Apache-2.0: permite uso comercial, pero conviene verificar las condiciones heredadas del modelo base google/gemma-4-12B-it.
- No se documentan opciones de cuantización ni soporte para motores de inferencia habituales (vLLM, llama.cpp, TGI), lo que limita el despliegue en entornos con restricciones de memoria.
- El modelo tiene 306 descargas y 1 like en Hugging Face en la fecha de consulta, lo que indica una adopción todavía muy reducida.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MachinePulseAI/karpo-decision-12B
- Repositorio de inferencia: https://github.com/machinepulse-ai/karpo-decision
- Modelo mayor de la familia: https://huggingface.co/MachinePulseAI/karpo-decision-31B
- Modelo karpo-decision-9B: https://huggingface.co/MachinePulseAI/karpo-decision-9B
- Modelo karpo-decision-4B: https://huggingface.co/MachinePulseAI/karpo-decision-4B
- Modelo karpo-decision-2B: https://huggingface.co/MachinePulseAI/karpo-decision-2B
- Modelo karpo-decision-0.8B: https://huggingface.co/MachinePulseAI/karpo-decision-0.8B
- Decision Index (espacio): https://huggingface.co/spaces/multimodalart/jev-decision-index
- Kit Decision Index: https://github.com/apolinario/decision-index
- FlexDM: https://github.com/1000luca/FlexDM
- jev-brain: https://github.com/wcole3/jev-brain
- Sieve-31B-v3: https://huggingface.co/sthanika-ai/Sieve-31B-v3
- Modelo base: https://huggingface.co/google/gemma-4-12B-it
- Licencia: https://huggingface.co/MachinePulseAI/karpo-decision-12B/blob/main/LICENSE
