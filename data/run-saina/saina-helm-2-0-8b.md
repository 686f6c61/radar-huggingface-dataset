# run-saina/saina-helm-2-0.8b

## Resumen

Saina Helm 2 0.8B es un modelo de decisión de pequeno tamano desarrollado por run-saina. A diferencia de un modelo generativo convencional, no produce texto: recibe un estado (texto libre) y un conjunto de preguntas tipadas definidas en tiempo de petición (sí/no, elección única, elección múltiple o valoración) y devuelve una probabilidad para cada respuesta posible. Las opciones se suministran en cada llamada, de modo que un mismo modelo sirve para enrutado de intención, triaje, selección de herramientas o checklists de revisión sin reentrenamiento.

El modelo es un fine-tune del Qwen/Qwen3.5-0.8B, con 852.985.920 parámetros totales según safetensors, empaquetado para la librería `saina` (versión 0.3 o superior). La innovación de la versión Helm 2 es que todas las preguntas de una petición se responden en una sola pasada sobre el estado compartido, en lugar de una pasada por pregunta, y el readout incorpora pequenas cabezas de expertos enrutadas. El checkpoint fue entrenado con un límite de contexto de 262.144 tokens.

Su relevancia actual radica en que ocupa la primera posición entre los modelos de menos de 1B parámetros en la parte pública de Decision Index 0.3, con 39,26 puntos, y declara los mejores resultados de uso de herramientas y de alucinación en RAGTruth de su categoría. Está publicado bajo licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con readout de cabezas de expertos enrutadas (mixture-of-experts en la cabeza de clasificación); modelo base Qwen/Qwen3.5-0.8B |
| Parametros totales | 852.985.920 |
| Parametros activos | no disponible (el tag mixture-of-experts aplica a las cabezas de readout, no se detalla el número de parámetros activos) |
| Longitud de contexto | 262.144 tokens (límite de entrenamiento); configurable con `max_length=` |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | principalmente inglés; material no inglés limitado y no evaluado |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-0.8B mediante fine-tune. La arquitectura de decisión sustituye la generación de texto por un readout que puntúa opciones: el prompt se construye a partir del estado y de las preguntas tipadas, y el modelo produce probabilidades por respuesta. En Helm 2, todas las preguntas de una petición se resuelven en una sola pasada sobre el estado compartido, y el readout incorpora pequenas cabezas de expertos enrutadas. El checkpoint se entrenó con el límite de contexto de 262.144 tokens del modelo base.

Los datos de entrenamiento son mayoritariamente en inglés, con material no inglés limitado. No se detalla en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO. La model card indica que el paquete `saina` construye el prompt exacto con el que se entrenó el modelo y aplica la cabeza entrenada; las puntuaciones dependen de ese formato, por lo que recomienda no usar prompts personalizados ni `generate()`. La instalación de `flash-linear-attention` y `causal-conv1d` habilita kernels más rápidos.

## Capacidades

- Clasificación multi-etiqueta y decisión con puntuaciones de probabilidad, sin generación de texto.
- Preguntas de tipo `yes_no`: devuelve `yes`, `no` y `confidence`, con descripciones opcionales por respuesta.
- Preguntas de tipo `single_choice`: entre 2 y 255 opciones, devuelve `probabilities`, `selection` y `confidence`.
- Preguntas de tipo `multi_choice`: entre 2 y 255 opciones, devuelve `memberships` independientes por opción.
- Preguntas de tipo `rating`: entre 2 y 10 niveles ordenados, devuelve `probabilities` por nivel, `expected_level` y `confidence`.
- Modo decisión (`mode='decision'`) con umbral (por defecto 0,8) y margen mínimo opcional: las respuestas de baja confianza se marcan como `None` con una razón (`below_threshold`, `below_margin`, `tie`) para permitir abstención y escalado.
- Respuesta a múltiples preguntas en una sola pasada sobre el estado compartido.
- Capacidades declaradas por el autor en benchmarks de uso de herramientas (API-Bank, BFCL, When2Call) y de alucinación (RAGTruth).
- No soporta generación de texto, visión, audio ni otras modalidades.

## Casos de uso

- Enrutado de intención: dado un mensaje de usuario, el modelo puntúa opciones de intención o departamento en una sola pasada, lo que permite clasificar consultas entrantes antes de derivarlas al flujo correspondiente.
- Triaje de tickets de soporte: con preguntas de tipo `rating` y `multi_choice` sobre el estado del ticket, se obtiene urgencia y conjunto de problemas aplicables para priorizar la cola de atención.
- Selección de herramientas en agentes: el modelo puntúa qué herramienta o API de una lista de opciones encaja con el estado y la consulta, útil como paso de shortlisting previo a la llamada real.
- Checklists de revisión: para flujos de revisión de contenido o de calidad, se definen preguntas de tipo `yes_no` y `multi_choice` que el modelo responde con probabilidad, permitiendo marcar elementos pendientes.
- Clasificación de documentos con contexto largo: gracias a los 262.144 tokens de contexto, puede puntuar decisiones sobre documentos extensos en una única pasada, siempre que la memoria GPU disponible lo permita.
- Filtrado previo con abstención: en pipelines donde un error tiene coste, el modo decisión con umbral y margen permite escalar a revisión humana las preguntas de baja confianza en lugar de arriesgar una respuesta.
- Servicio HTTP autenticado: el paquete `saina` con extra `server` permite desplegar el modelo como servidor HTTP para integrarlo en servicios internos de decisión.

## Benchmarks y rendimiento

| Benchmark | Resultado | Notas |
|---|---|---|
| Decision Index 0.3 (parte pública) | 39,26 | Revisión 72349026; el más alto entre modelos de menos de 1B en el tablero (datos de 2026-10-16) |
| Decision Index 0.3 (Full oficial) | 20,82 | Revisión anterior 06f2fec2; parte pública 30,47; quinto entre modelos de menos de 1B; no disponible para 72349026 |
| vLLM-SR d3-lite (referencia) | 36,93 | Parte pública de Decision Index 0.3 |
| Crivo-150M (referencia) | 36,39 | Parte pública de Decision Index 0.3 |
| OneJev1.5-0.8B (referencia) | 42,71 | No contabilizado por servir aproximadamente 1,1B parámetros |

La model card afirma los mejores resultados de uso de herramientas (API-Bank, BFCL, When2Call) y de alucinación (RAGTruth) entre modelos de menos de 1B, pero no se incluyen las cifras concretas de esas evaluaciones en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,11 GiB por cada 1K tokens de entrada; medido en una RTX 3090: unos 3,2 GiB a 15K tokens y 7,9 GiB a 58K tokens. El contexto completo de 262K requiere del orden de 30 GiB.
- El consumo de memoria crece con la longitud de entrada, ya que cada petición es una única pasada hacia delante sobre todo el input.
- GPU recomendadas: no se especifican modelos concretos en la información disponible; por las mediciones, una RTX 3090 es suficiente para contextos de decenas de miles de tokens, y el contexto completo requiere GPUs con 30 GiB o más (por ejemplo, A100 o H100 de 40/80 GB).
- Cabe en GPU de consumo: sí, en una RTX 3090 para contextos de hasta decenas de miles de tokens, ajustando `max_length=`.
- Despliegue: paquete `saina` (`pip install "saina[local]>=0.3.2"`) con `HelmModel.from_pretrained`; servidor HTTP autenticado con `saina[local,server]`. Los kernels rápidos requieren `flash-linear-attention` y `causal-conv1d`.
- Latencia y throughput: no disponibles. La mejora de Helm 2 frente a Helm 1 es que todas las preguntas se responden en una sola pasada en lugar de una por pregunta.
- Las entradas que superan el límite configurado se rechazan, nunca se truncan.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Decision Index 0.3 (público) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Saina Helm 2 0.8B | 852.985.920 | 262.144 | 39,26 | Apache 2.0 | Hugging Face + paquete `saina` |
| vLLM-SR d3-lite | no disponible | no disponible | 36,93 | no disponible | no disponible |
| Crivo-150M | no disponible | no disponible | 36,39 | no disponible | no disponible |
| OneJev1.5-0.8B | aprox. 1,1B servidos | no disponible | 42,71 | no disponible | no disponible |

## Limitaciones y advertencias

- No genera texto de ningún tipo: solo puntúa las opciones suministradas.
- Fuera de alcance: decisiones finales sin revisión con consecuencias materiales para una persona (crédito, empleo, medicina, legal), incluso con alta confianza.
- No debe usarse para clasificar personas ni atributos personales, demografía o cualquier dato empleado para perfilar individuos.
- No está entrenado ni evaluado para filtrado de seguridad, detección de daño o moderación de contenido.
- Idiomas: los datos de entrenamiento son mayoritariamente en inglés y todas las evaluaciones reportadas son en inglés; otros idiomas no están probados.
- Riesgo de inyección de prompt: el modelo puntúa cualquier estado que reciba, por lo que contenido inyectado puede orientar sus respuestas; debe acotarse la autoridad concedida a la salida.
- Las puntuaciones dependen del formato exacto del prompt y de la cabeza entrenada; es necesario usar el paquete `saina` (0.3 o superior) y fijar `revision` a un commit concreto.
- Las versiones antiguas del paquete `saina` rechazan este checkpoint.
- El consumo de memoria GPU escala con la longitud de entrada; el contexto completo de 262K exige alrededor de 30 GiB.
- Se recomienda validar sobre datos etiquetados propios y para el propio espacio de etiquetas antes de usar el modelo en producción.
- Licencia Apache 2.0: permite uso comercial, pero deben respetarse las advertencias de alcance indicadas por el autor.

## Enlaces

- Hugging Face: https://huggingface.co/run-saina/saina-helm-2-0.8b
- Modelo anterior (Helm 1): https://huggingface.co/run-saina/saina-helm-0.8b
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Paquete `saina` en PyPI: https://pypi.org/project/saina/
- Repositorio del servidor y paquete: https://github.com/run-saina/saina
- Harness reproducible de Decision Index: https://github.com/run-saina/saina-decision-index
