# plantwaterer/oenogarum

## Resumen

oenogarum es un ajuste fino (fine-tune) del modelo multimodal google/gemma-4-31B-it, desarrollado por el usuario plantwaterer y publicado en Hugging Face. Su propósito es muy específico: responder preguntas de decisión con formato de elección múltiple devolviendo una probabilidad calibrada para cada opción, en lugar de una única respuesta categórica. Esto lo convierte en una pieza poco habitual dentro del ecosistema: no es un modelo conversacional generalista, sino un motor de decisión probabilística construido sobre un transformer de 31 273 088 876 parámetros.

El modelo conserva la arquitectura del Gemma 4 de 31B en su variante instruction-tuned, con atención completa en algunas capas y atención de ventana deslizante de 1 024 tokens en otras, pero sustituye la cabeza de salida estándar por una cabeza calibrada de última capa (`vbll_head.safetensors`) que transforma los logits de las letras de las opciones en probabilidades. Incluye además varios motores de inferencia empaquetados en el repositorio que implementan promediado sobre el orden de las opciones y correcciones bayesianas para preguntas de sí/no.

Su relevancia actual radica en que aborda un problema práctico poco cubierto: obtener distribuciones de probabilidad calibradas sobre alternativas discretas a partir de un LLM, algo útil en sistemas de apoyo a la decisión, evaluación de riesgos y pipelines de agentes donde se necesita incertidumbre cuantificada y no solo texto. La licencia Apache-2.0 y el tamaño del repositorio (62,6 GB) condicionan su despliegue a infraestructura con GPU de gama alta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only multimodal (base Gemma 4), con capas de atención completa y capas de atención de ventana deslizante (ventana 1 024) |
| Parametros totales | 31 273 088 876 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible de forma explícita; las capas de ventana deslizante usan ventana de 1 024 tokens |
| Tipos de cuantizacion | no disponible (los pesos se distribuyen en safetensors; el ejemplo de uso emplea bf16) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (`model-*.safetensors`, `vbll_head.safetensors`) |

## Arquitectura y entrenamiento

El modelo parte de google/gemma-4-31B-it, un transformer decoder-only multimodal (image-text-to-text) con atención híbrida: capas de atención completa y capas con ventana deslizante causal de 1 024 tokens. Sobre esa base, el fine-tune introduce una cabeza de última capa calibrada (`vbll_head.safetensors` y `vbll_head.json`) que se ejecuta en CPU en float64 y produce las probabilidades finales. Para preguntas de elección múltiple ordinarias, la salida es el softmax de los logits de las letras de las opciones en la posición de respuesta, dividido por una temperatura ajustada de T = 1,080; para preguntas de sí/no, se aplica un residuo bayesiano de última capa (posterior de Laplace, integrado) sobre el estado oculto que ajusta los dos logits.

Un detalle técnico crítico es la atención: en las capas de atención completa, los tokens de cada prompt atienden a todos los tokens del mismo prompt, y las capas de ventana deslizante permanecen causales. La atención estándar de transformers ejecutaría las capas de atención completa de forma causal y daría respuestas distintas, por lo que el modelo debe servirse con la función de atención `jev_mem` incluida en `fullft_mem.py`, que se registra en la interfaz de atención de transformers y se apoya en PyTorch SDPA (kernels memory-efficient y flash). El motor de inferencia rechaza cualquier otra configuración de atención. No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO.

## Capacidades

- Respuesta a preguntas de decisión con elección múltiple, devolviendo una probabilidad calibrada por opción (hasta 52 opciones por pregunta, letradas A-Z y a-z).
- Preguntas de sí/no con definiciones opcionales de los criterios (`Yes: <definición>` / `No: <definición>`) y corrección bayesiana sobre los dos logits.
- Promediado sobre el orden de las opciones (order averaging) en peticiones con longitud L ≤ 939, mediante cuatro órdenes de opciones y promedio de resultados.
- Procesamiento de estado (state) e instrucciones por pregunta, con soporte de estado en forma de cadena o diccionario.
- Capacidades multimodales heredadas del modelo base Gemma 4 (image-text-to-text), aunque la model card no detalla su uso en el fine-tune.
- Integración con el kit Decision Index mediante motores de inferencia intercambiables (`lenavg_bayes_engine`, `lenavg_engine`, `dikit_engine`).
- No se documenta soporte explícito de tool calling, function calling ni razonamiento multi-paso en la información disponible.

## Casos de uso

- Apoyo a la decisión operativa: dado un estado del mundo y un conjunto de criterios, el modelo devuelve la probabilidad de cada alternativa (por ejemplo, jugar, mover a interior o posponer un partido según la previsión de lluvia), lo que permite umbrales de decisión explícitos y auditables.
- Evaluación de riesgo con incertidumbre cuantificada: en pipelines donde no basta una respuesta categórica, las probabilidades calibradas permiten priorizar casos y fijar políticas de escalado.
- Sistemas de triaje: clasificación probabilística de incidencias en múltiples categorías mutuamente excluyentes, aprovechando la calibración por temperatura para comparar umbrales entre clases.
- Agentes con selección de acciones: el modelo puede actuar como módulo de selección entre un conjunto discreto de acciones candidatas, con la distribución de probabilidad como señal para la política del agente.
- Investigación en calibración y evaluación de LLM: el repositorio y sus motores permiten reproducir experimentos de promediado por orden de opciones y correcciones bayesianas de última capa.
- Encuestas y cuestionarios automatizados: generación de distribuciones de respuesta sobre opciones predefinidas con control del orden para mitigar sesgos posicionales.
- Análisis de escenarios con preguntas de sí/no: estimación de probabilidad de eventos binarios (por ejemplo, probabilidad de lluvia intensa) combinada con preguntas de elección en la misma petición.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 62,5 GB solo para los pesos (31,27 mil millones de parámetros × 2 bytes), más overhead de activaciones y caché KV; no cabe en GPUs de consumo de 24 GB.
- GPU recomendadas: A100 80 GB, H100 80 GB o configuraciones multi-GPU. En GPUs de 40 GB (A100 40 GB) no cabría en bf16 sin cuantización o paralelismo.
- GPU de consumo: no cabe en RTX 4090 (24 GB) ni en RTX 3090 en bf16; requeriría cuantización agresiva no documentada en la información disponible.
- Despliegue: el modelo se sirve mediante los motores del kit Decision Index (`lenavg_bayes_engine:LenAvgBayesEngine` o `dikit_engine:DikitEngine`) sobre transformers y PyTorch SDPA; la cabeza se ejecuta en CPU en float64. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. El promediado por orden de opciones multiplica por cuatro el número de pasadas por pregunta en peticiones con L ≤ 939, lo que incrementa proporcionalmente el coste de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| oenogarum | 31,27 B | no disponible (ventana deslizante 1 024) | Fine-tune de decisión probabilística sobre Gemma 4 31B | Apache-2.0 | Hugging Face |
| google/gemma-4-31B-it | 31 B (aprox., según modelo base) | no disponible | Modelo base instruction-tuned multimodal | Términos de Gemma (no verificados en la información disponible) | Hugging Face |
| Alternativas de decisión probabilística de tamaño comparable | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre benchmarks comparativos ni sobre otros fine-tunes de propósito equivalente que permitan una comparación cuantitativa fiable.

## Limitaciones y advertencias

- El modelo está especializado en preguntas de elección múltiple y sí/no; no es un modelo conversacional generalista y su uso fuera de ese formato no está documentado.
- La atención debe servirse con la función `jev_mem`; usar la atención estándar de transformers produce respuestas distintas. Cualquier despliegue que ignore este requisito invalida los resultados.
- La cabeza calibrada es obligatoria: los logits de las letras por sí solos no constituyen la respuesta del modelo.
- El promediado por orden de opciones solo se aplica a peticiones con L ≤ 939; por encima de ese umbral se usa una única pasada, con posible pérdida de robustez frente al orden.
- No se documentan sesgos conocidos, tasas de alucinación ni evaluación multilingüe; los idiomas soportados figuran como no disponibles.
- La licencia Apache-2.0 permite uso comercial, pero el modelo base Gemma 4 puede estar sujeto a términos adicionales de Google que conviene verificar antes de producción.
- El tamaño de 31B en bf16 exige infraestructura de gama alta (≥ 80 GB de VRAM); no hay información sobre cuantizaciones soportadas ni sobre su impacto en la calibración.
- El repositorio de GitHub (`treewaterer/oenogarum`) contiene solo el código y la model card; los pesos se alojan en Hugging Face, lo que condiciona la reproducibilidad a la disponibilidad del Hub.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/plantwaterer/oenogarum
- Modelo base: https://huggingface.co/google/gemma-4-31B-it
- Repositorio espejo en GitHub: https://github.com/treewaterer/oenogarum
- Kit Decision Index: https://github.com/apolinario/decision-index
