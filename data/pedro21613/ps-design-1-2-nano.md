# Pedro21613/PS-design-1.2-nano

## Resumen

PS Design 1.2 Nano es un ajuste fino del modelo Qwen2.5-0.5B-Instruct, publicado por el usuario Pedro21613, especializado en la generación de código HTML y Tailwind CSS para interfaces web minimalistas. Se distribuye como un modelo standalone: el adaptador LoRA de rango 16 del que procede se ha fusionado directamente en los pesos base, de modo que no requiere la librería PEFT en inferencia ni la carga de un adaptador adicional. El resultado son 494.032.768 parámetros (~0,49 B) en formato safetensors, con un repositorio de 1,0 GB.

El modelo deriva de Pedro21613/PS-design-1.2-beta, entrenado sobre 6.200 ejemplos, y mantiene los mismos pesos que aquel con un supuesto 10-15% menos de sobrecarga en inferencia gracias a la fusión del LoRA y a la carga única de pesos. Está pensado explícitamente para ejecutarse en hardware modesto: el autor indica que cabe en una GPU T4 e incluso en CPU en fp16 (unos 943 MB de pesos), lo que lo sitúa en la categoría de modelos "nano" para tareas de generación de UI a bajo coste.

Su relevancia es, por tanto, acotada y muy específica: no compite en razonamiento general ni en capacidades multilingües amplias, sino que ofrece una alternativa ligera y autoalojable para generar maquetas HTML completas y responsivas con Tailwind CSS vía CDN, en portugués. La model card declara únicamente el idioma portugués (pt) y no especifica licencia, lo que limita de entrada su adopción en entornos comerciales sin aclaración previa por parte del autor.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (familia Qwen2), con atención de consultas agrupadas (GQA), RoPE, SwiGLU y RMSNorm; heredada del modelo base |
| Parámetros totales | 494.032.768 (~0,49 B) |
| Longitud de contexto | 32.768 tokens heredados del modelo base Qwen2.5-0.5B-Instruct; no se confirma en la model card del derivado |
| Tipos de cuantización | no disponible (el repositorio solo publica pesos safetensors en fp16/bf16) |
| Idiomas soportados | portugués (pt) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Modelo base | Qwen/Qwen2.5-0.5B-Instruct |
| Modelo de origen del ajuste | Pedro21613/PS-design-1.2-beta (6.200 ejemplos) |
| Método de ajuste | LoRA de rango 16 fusionado en los pesos base (no requiere PEFT en inferencia) |
| Librería de inferencia | transformers (también etiquetado como compatible con text-generation-inference y endpoints) |
| Tamaño del repositorio | 1,0 GB |
| Fecha de publicación | 26 de septiembre de 2026 (según metadatos de HuggingFace) |

## Arquitectura y entrenamiento

La arquitectura es la del Qwen2.5-0.5B-Instruct sin modificaciones estructurales: un transformer decoder-only denso, con normalización RMSNorm, activación SwiGLU, embeddings rotatorios (RoPE) y atención de consultas agrupadas (GQA) para reducir el tamaño del KV cache. No hay mezcla de expertos (MoE), ni capas de estado (SSM), ni mecanismos híbridos; la innovación del modelo no está en la arquitectura, sino en el proceso de adaptación.

En cuanto al entrenamiento, la información disponible es deliberadamente escasa. La model card indica que el modelo deriva de PS-design-1.2-beta, ajustado sobre 6.200 ejemplos, y que PS Design 1.2 Nano es un "merge" del LoRA de rango 16 directamente sobre Qwen2.5-0.5B-Instruct. El autor afirma que los pesos son idénticos a los del 1.2-beta, de modo que la calidad debería ser equivalente, y que la única diferencia es la eliminación de la sobrecarga del adaptador (~10-15% más rápido y con una única carga de pesos). No se documentan la composición exacta del dataset, el número de tokens de entrenamiento, ni si hubo fases de RLHF o DPO. Tampoco se especifican los hiperparámetros del ajuste más allá del rango del LoRA.

Los parámetros de decodificación recomendados por el autor son `use_cache=True`, `repetition_penalty=1.05`, fp16, `temperature=0.7`, `top_p=0.9` y `max_new_tokens=1200` para generación de páginas, junto con una plantilla de chat que fija un mensaje de sistema en el que el modelo actúa como diseñador front-end sénior y responde siempre con HTML completo y responsivo usando Tailwind CSS vía CDN.

## Capacidades

- Generación de código HTML completo y responsivo, con estructura de documento cerrada, a partir de una descripción en lenguaje natural.
- Estilizado con Tailwind CSS cargado por CDN, siguiendo una estética minimalista y profesional impuesta por el mensaje de sistema.
- Conversación multi-turno mediante `apply_chat_template`, con soporte de roles `system`, `user` y `assistant`.
- Generación de landing pages y maquetas de páginas web completo-partido, hasta 1.200 tokens nuevos según la configuración recomendada.
- Comprensión y producción de texto en portugués, idioma declarado en la model card.
- No se documenta soporte de tool calling ni de function calling.
- No se documenta soporte de agentes ni de razonamiento multi-paso.
- No se documenta visión, audio ni modo de razonamiento explícito (thinking mode).
- No se documentan capacidades matemáticas o de razonamiento formal más allá de las heredadas del modelo base de 0,5 B.

## Casos de uso

- Prototipado rápido de interfaces: un desarrollador describe en portugués la página que necesita ("landing page minimalista para una cafetería") y obtiene un documento HTML con Tailwind listo para abrir en el navegador; al ser un modelo de 0,49 B, la generación es viable en portátil sin GPU dedicada.
- Generación de maquetas en pipelines de diseño a código: integrado como paso previo a la revisión humana, el modelo convierte requisitos textuales en borradores de HTML que el equipo de front-end refina, reduciendo el trabajo repetitivo de estructura y clases utilitarias.
- Asistente de diseño embebido en un IDE o editor: al responder en un único turno con HTML autocontenido y sin dependencias externas más allá del CDN de Tailwind, el resultado se puede previsualizar directamente en paneles de vista previa en vivo.
- Producción de páginas de campaña a escala: para equipos de marketing que necesitan decenas de variantes de una misma landing (distintos titulares, colores o secciones), el modelo permite generar borradores por lotes en CPU a un coste marginal muy bajo.
- Microservicio de inferencia sin GPU: con ~943 MB de pesos en fp16, el modelo se puede desplegar en contenedores con CPU y memoria limitada, lo que habilita un endpoint de generación de HTML para herramientas internas sin depender de infraestructura acelerada.
- Generación de plantillas de correo HTML responsivas: el mismo flujo de descripción a HTML+Tailwind, sustituyendo la hoja de estilos por estilos en línea cuando sea necesario, sirve para producir plantillas de newsletter de forma semi-automática.
- Base para ajustes posteriores o experimentos académicos: al ser un derivado de un modelo Apache 2.0 de tamaño reducido y con pesos ya fusionados, resulta útil como punto de partida para estudiar técnicas de fusión de LoRA, destilación o evaluación de especialización en dominios muy concretos.
- Demostración educativa de ajuste fino de bajo coste: permite ilustrar en un curso o taller el ciclo completo de QLoRA/LoRA, fusión de adaptadores y despliegue de un modelo especializado, sin necesidad de hardware de gama alta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye cifras de MMLU, HumanEval, GSM8K, MT-Bench ni ninguna otra evaluación, y tampoco se aportan comparaciones cuantitativas frente a otros modelos. El único dato de rendimiento declarado es cualitativo: la fusión del LoRA elimina la sobrecarga del adaptador y, según el autor, supone aproximadamente un 10-15% de mejora de velocidad respecto a la versión con PEFT, con una única carga de pesos.

## Requisitos de hardware

- VRAM estimada en fp16: aproximadamente 0,95 GB solo para los pesos (943 MB según el autor). Con el KV cache en fp16, una estimación a partir de la arquitectura del modelo base (24 capas, 2 cabezas KV, head_dim 64) arroja del orden de 12 KB por token, es decir unos 390 MB adicionales si se agota un contexto de 32.768 tokens. En la práctica, para contextos cortos de generación de páginas el uso total se mantiene por debajo de 1,5 GB.
- GPU recomendadas: el autor indica explícitamente que funciona en una NVIDIA T4 (16 GB). Cualquier GPU con 2 GB o más de VRAM es suficiente: RTX 3050/3060, RTX 4060, GTX 1650 (4 GB), e incluso GPUs integradas con memoria compartida.
- Cabe holgadamente en GPU de consumo: es un caso claro de modelo apto para portátiles y equipos de escritorio sin acelerador dedicado.
- También se puede ejecutar en CPU: el autor lo afirma de forma explícita, y con 0,49 B de parámetros la latencia por página generada es asumible en un servidor convencional, aunque notablemente mayor que en GPU.
- Opciones de despliegue: `transformers` de forma nativa (es la librería declarada), text-generation-inference (el repositorio lleva la etiqueta `text-generation-inference` y `endpoints_compatible`), y cualquier runtime compatible con safetensors. Para llama.cpp u Ollama habría que convertir previamente los pesos a GGUF, ya que el repositorio no publica archivos GGUF.
- Latencia y throughput: no disponibles. El único dato aportado es la mejora relativa del 10-15% respecto a la variante con adaptador PEFT.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Idiomas | Enfoque |
|---|---|---|---|---|---|
| PS Design 1.2 Nano | 494 M | 32.768 tokens (heredado, no confirmado) | no disponible | portugués (pt) | HTML + Tailwind minimalista |
| Qwen2.5-0.5B-Instruct | ~494 M | 32.768 tokens | Apache 2.0 | multilingüe (29 idiomas) | propósito general, instruct |
| Qwen2.5-Coder-0.5B-Instruct | ~494 M | 32.768 tokens | Apache 2.0 | multilingüe | código en general |
| TinyLlama-1.1B-Chat | ~1,1 B | 2.048 tokens | Apache 2.0 | principalmente inglés | propósito general, chat |

Frente a los dos derivados de Qwen2.5, la diferencia clave no está en parámetros ni contexto, sino en la especialización y en la licencia: PS Design 1.2 Nano está afinado específicamente para HTML con Tailwind, mientras que los modelos de Qwen son de propósito general y de código abierto con licencia Apache 2.0. TinyLlama-1.1B-Chat, pese a duplicar el tamaño, ofrece una ventana de contexto mucho menor y no está especializado en maquetación web. No se dispone de datos de benchmarks que permitan comparar la calidad real de PS Design 1.2 Nano frente a estas alternativas.

## Limitaciones y advertencias

- La licencia no está declarada en el repositorio. Aunque el modelo base Qwen2.5-0.5B-Instruct se distribuye bajo Apache 2.0, la ausencia de licencia explícita en el derivado introduce incertidumbre legal para uso comercial.
- Idioma: solo se declara portugués (pt). Se espera un rendimiento degradado en castellano, inglés u otros idiomas, tanto en la comprensión de la instrucción como en el texto de las interfaces generadas.
- Tamaño muy reducido: con 0,49 B de parámetros, la capacidad de razonamiento, la coherencia en instrucciones complejas y el conocimiento general son limitados en comparación con modelos de 7 B o más.
- Riesgo de alucinación en detalles técnicos: alucinación de clases de Tailwind inexistentes, atributos HTML inventados o dependencias no declaradas es un riesgo real en un modelo de este tamaño sin evaluación publicada.
- Especialización estrecha: está ajustado sobre 6.200 ejemplos orientados a HTML/Tailwind, por lo que puede degradar tareas distintas incluso dentro del ámbito de la programación.
- No hay evidencia de evaluación independiente: 0 descargas y 0 "likes" en el momento de los metadatos consultados, sin benchmarks ni validación por parte de la comunidad.
- La fusión de LoRA como única intervención implica que no hay una versión con adaptador separado para auditar el delta de pesos, lo que dificulta el análisis de qué cambió exactamente respecto al modelo base.
- El uso de Tailwind vía CDN en las respuestas generadas introduce una dependencia de red en tiempo de ejecución del HTML producido, poco adecuada para entornos con política estricta de recursos externos o sin conexión.
- Las fechas de creación y actualización de los metadatos (26 de septiembre de 2026) son inusuales y conviene verificarlas antes de citarlas.
- Ausencia de información sobre sesgos: la model card no documenta la composición del dataset de 6.200 ejemplos ni posibles sesgos culturales o de representación en las interfaces generadas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Pedro21613/PS-design-1.2-nano
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Modelo del que deriva el ajuste: https://huggingface.co/Pedro21613/PS-design-1.2-beta
- No se han encontrado en la información proporcionada papers, blogs técnicos, repositorios de código ni demos adicionales asociados a este modelo.
