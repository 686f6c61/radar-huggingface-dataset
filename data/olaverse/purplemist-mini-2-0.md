# olaverse/PurpleMIST-Mini-2.0

## Resumen

PurpleMIST-Mini-2.0 es un modelo de decisión ("System One") desarrollado por olaverse. No genera texto: recibe un estado (un mensaje, ticket, transcripción, recibo o captura de pantalla) junto con un conjunto de preguntas tipadas y devuelve, en un único forward pass, una distribución de probabilidad calibrada para cada respuesta. Se construye sobre el backbone Qwen/Qwen3.5-4B-Base, conservando su codificador visual y eliminando la cabeza de lenguaje.

El modelo resuelve el problema de la clasificación y el enrutamiento estructurado en producción: en lugar de pedir a un LLM que genere una respuesta y parsearla, expone directamente decisiones con probabilidades calibradas, lo que facilita umbrales, abstención y auditoría. Su relevancia actual radica en tres ejes: rendimiento cercano a un modelo de 7,9B (PurpleMIST-Flash-1.0) con la mitad de parámetros, cobertura de 19 idiomas con especial atención a lenguas africanas, y soporte multimodal de imágenes junto a contextos de hasta 98.304 tokens en entrenamiento.

Con 4.539.265.536 parámetros totales (unos 4,2B en el modelo de texto y 0,33B en el codificador visual), licencia Apache 2.0 y pesos en bf16 safetensors, se posiciona como una alternativa ligera y desplegable para pipelines de decisión con requisitos de calibración y latencia.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido sobre Qwen3.5-4B-Base: 32 capas (24 Gated DeltaNet de atención lineal y 8 de atención completa), hidden size 2560; codificador visual incluido, cabeza de lenguaje eliminada; cabeza pointer de 5,3M de parámetros |
| Parámetros totales | 4.539.265.536 (≈4,2B texto + 0,33B visión) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 98.304 tokens por pasada (longitud de entrenamiento); ventana del backbone hasta 262.144 tokens; sin truncado (divide preguntas en varias pasadas) |
| Tipos de cuantización | No disponible (el autor indica ejecutar en bf16, precisión en la que fue calibrado) |
| Idiomas soportados | 19: en, yo, ha, ig, pcm, sw, am, so, zu, fr, ar, pt, es, hi, zh, de, id, ru, tr |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16, 8,5 GB) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-4B-Base y realiza un fine-tune completo de todos los pesos del modelo de texto, manteniendo congelado el codificador visual. La atención combina 24 capas Gated DeltaNet (atención lineal, causal) con 8 capas de atención completa que aplican una máscara en dos bloques: el prefijo (cabecera, imágenes y estado) es causal y nunca ve las preguntas, de modo que se codifica igual independientemente de lo que se pregunte; cada token de pregunta ve todo el prefijo y el resto de preguntas, permitiendo leer una pregunta junto a sus opciones. La cabeza es un pointer head: el logit de cada opción es un producto escalar entre proyecciones (2560 → 1024) de la posición de respuesta y la línea de la propia opción.

El entrenamiento usa estados de hasta 98.304 tokens y un máximo de 1.024 tokens por imagen (aproximadamente 1 MP a 32 × 32 píxeles por token), con una imagen por estado en entrenamiento. La calibración es explícita: cada tipo de pregunta tiene su propia temperatura, ajustada por separado para estados de texto e imagen sobre estados de validación de todas las fuentes de entrenamiento. Los datasets empleados son olaverse/african-typed-decisions y LocalLLaMA/typed-decisions. No se especifican en la información disponible el número total de tokens de entrenamiento, la composición detallada del dataset ni si hubo RLHF o DPO.

## Capacidades

- Decisión tipada con tres tipos de pregunta: `choice` (instrucciones y opciones nombradas con criterios clave → descripción), `noul` (afirmación sí/no) y `score` (instrucciones y niveles ordenados de menor a mayor).
- Salida de distribuciones de probabilidad calibradas por pregunta, con temperatura específica por tipo y modalidad (texto o imagen).
- Procesamiento multimodal: acepta texto e imágenes; varias imágenes por estado se colocan en orden.
- Contexto largo sin truncado: hasta 98.304 tokens por pasada y ventana de hasta 262.144 tokens; las preguntas que no caben se reparten en varias pasadas y los estados que no caben se rechazan.
- Multilingüismo en 19 idiomas, incluyendo ocho lenguas africanas (amárico, hausa, igbo, pidgin nigeriano, somalí, suajili, yorùbá, isiZulu).
- Preguntas en un idioma distinto al del estado (0,937 de accuracy en preguntas cruzadas de validación).
- No soporta generación de texto, tool calling ni razonamiento multi-paso: es un modelo de puntuación de opciones, no un generador.
- No se documentan capacidades de audio ni modo "thinking".

## Casos de uso

- Enrutamiento de tickets de soporte: con preguntas `choice` sobre equipos (facturación, entrega, técnico), el modelo asigna cada ticket con probabilidades calibradas, lo que permite umbrales de confianza y derivación a revisión humana cuando la distribución es ambigua.
- Triaje de urgencia: una pregunta `score` con niveles ordenados ("puede esperar", "cola normal", "hoy", "inmediatamente") devuelve el nivel esperado y su distribución, útil para priorizar colas con SLA.
- Detección de intención de reembolso o cancelación: preguntas `noul` sobre afirmaciones concretas permiten activar flujos automáticos solo cuando la probabilidad supera un umbral calibrado.
- Procesamiento de capturas y recibos: al aceptar imágenes, puede clasificar capturas de pantalla de conversaciones o recibos junto a metadatos textuales, con hasta 1.024 tokens por imagen.
- Atención al cliente en lenguas africanas: con cobertura de yorùbá, hausa, igbo, pidgin nigeriano, suajili, amárico, somalí e isiZulu, permite clasificar mensajes en estos idiomas y con preguntas formuladas en otro idioma (accuracy de 0,937 en el caso cruzado).
- Moderación y clasificación de contenido en contexto largo: estados de hasta 98.304 tokens (transcripciones, hilos completos, documentación) se evalúan íntegros sin truncado, con reparto automático de preguntas en varias pasadas.
- Auditoría y analítica de decisiones: al devolver distribuciones calibradas en lugar de texto libre, los resultados son directamente agregables para medir deriva, recalibrar umbrales y comparar fuentes de datos.

## Benchmarks y rendimiento

| Benchmark | PurpleMIST-Mini-2.0 | PurpleMIST-Flash-1.0 (7,9B) | PurpleMIST-Mini-1.0 |
|---|---|---|---|
| Jev Decision Index (suite pública) | 46,5 | 46,7 | 13,1 |
| LocalLLaMA/typed-decisions (zero-shot) | 0,723 (KL 0,155; Brier 0,082) | 0,720 | 0,601 |
| Decision Index, suite de visión | 63,7 (6.º de 24 modelos hasta 6B) | No disponible | No disponible |
| African Typed Decisions (8 idiomas, accuracy) | 0,636 | 0,668 | 0,416 |
| Preguntas cruzadas de idioma (accuracy) | 0,937 | No disponible | No disponible |

Latencia medida en el run completo del Decision Index sobre una RTX PRO 6000: mediana de 70 ms y media de 92 ms por petición de texto. Las 140.178 peticiones de texto se respondieron íntegras, sin truncados ni rechazos.

## Requisitos de hardware

- VRAM estimada: los pesos en bf16 ocupan 8,5 GB; con overhead de activaciones y caché para contextos largos, se recomienda al menos 16-24 GB de VRAM para uso cómodo.
- GPU recomendadas: RTX PRO 6000 (medición oficial del autor), A100, H100 para despliegues de alto throughput; RTX 4090 (24 GB) es suficiente para bf16.
- GPU de consumo: cabe en tarjetas con 16 GB o más en bf16; no se documentan cuantizaciones oficiales, y el autor recomienda ejecutar en bf16 por ser la precisión de calibración.
- Despliegue: librería `transformers>=5.22` y `torch>=2.10`, con el módulo `purplemist.py` del repositorio y la clase `Decider`; opcionalmente `flash-linear-attention` y `causal-conv1d` como kernels rápidos para las capas de atención lineal. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: mediana de 70 ms y media de 92 ms por petición de texto en una RTX PRO 6000; el rendimiento escala con el número de pasadas necesarias según el tamaño del estado y las preguntas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Jev Decision Index | African Typed Decisions | Licencia |
|---|---|---|---|---|---|
| PurpleMIST-Mini-2.0 | 4,5B | 98.304 (hasta 262.144) | 46,5 | 0,636 | Apache 2.0 |
| PurpleMIST-Flash-1.0 | 7,9B | No disponible | 46,7 | 0,668 | No disponible |
| PurpleMIST-Mini-1.0 | No disponible | No disponible | 13,1 | 0,416 | No disponible |

No se dispone de datos de benchmarks de clasificadores o modelos de decisión de otros proveedores en la información proporcionada, por lo que la comparativa se limita a la propia familia PurpleMIST.

## Limitaciones y advertencias

- No genera texto: solo puntúa opciones; no sirve para tareas generativas, tool calling ni razonamiento multi-paso.
- El entrenamiento usó una imagen por estado; aunque admite varias imágenes en orden, nunca se entrenó para compararlas, por lo que las decisiones que dependan de contrastar imágenes no son fiables.
- La calibración está ajustada para bf16 y por tipo de pregunta y modalidad; cambiar la precisión o mezclar tipos sin recalibrar puede degradar la fiabilidad de las probabilidades.
- En African Typed Decisions queda por debajo de Flash-1.0 (0,636 frente a 0,668), pese a superar ampliamente a Mini-1.0.
- Los estados que no caben en la ventana máxima se rechazan en lugar de truncarse; conviene dimensionar el pipeline para entradas muy largas.
- No se documentan sesgos conocidos, tasas de alucinación (el modelo no genera texto) ni restricciones adicionales de licencia comercial más allá de Apache 2.0.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que la validación externa es aún muy limitada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/olaverse/PurpleMIST-Mini-2.0
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B-Base
- Modelo comparable de la familia: https://huggingface.co/olaverse/PurpleMIST-Flash-1.0
- Dataset African Typed Decisions: https://huggingface.co/datasets/olaverse/african-typed-decisions
- Dataset LocalLLaMA/typed-decisions: https://huggingface.co/datasets/LocalLLaMA/typed-decisions
- Jev Decision Index (space público): https://huggingface.co/spaces/multimodalart/jev-decision-index
