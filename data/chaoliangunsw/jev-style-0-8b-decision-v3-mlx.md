# chaoliangUNSW/Jev-Style-0.8B-Decision-v3-MLX

## Resumen

Jev-Style-0.8B-Decision-v3-MLX es la compilación para Apple Silicon (MLX) del modelo de decisión y clasificación de texto Jev-Style-0.8B-Decision-v3, desarrollado por Chaoliang Yan (chaoliangUNSW). No es un modelo generativo de propósito general: es un clasificador especializado en enrutamiento (routing), etiquetado de intención y puntuación de opciones fijas, construido sobre una base Qwen3.5 de 0,8 mil millones de parámetros y entrenado con el paradigma que el autor denomina "system-one" (decisiones rápidas y calibradas de una sola pasada, sin cadena de razonamiento). El repositorio incluye dos builds, 8-bit (0,80 GB) y bf16 (1,50 GB), que según el autor reproducen exactamente la decisión del modelo a plena precisión en 240 de 240 filas de paridad.

Su relevancia actual reside en dos ejes. Primero, el contexto: admite hasta 25.600 tokens de entrada por llamada, unas 25 veces el presupuesto por defecto de 1.024 tokens de Laya, el competidor directo citado en la model card, y mantiene precisión plana entre 1K y 24K tokens (98,3% de acierto sobre 1.280 ítems reales de 24K tokens, según la afirmación preregistrada del autor). Segundo, el despliegue: al ser un modelo de 0,8B cuantizado a 8 bits, cabe en un portátil Apple Silicon y se ejecuta en local sin clave de API, lo que lo hace apto para clasificación sensible a latencia y a privacidad dentro de pipelines de agentes.

La licencia es Apache 2.0 y cubre 19 idiomas declarados. Conviene subrayar que el modelo es solo texto: las capacidades de visión mencionadas en los enlaces del proyecto corresponden a otras rutas de ejecución, no a este release.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen3.5), adaptado a clasificación/decisión; no disponible el detalle exacto de capas y dimensiones |
| Parámetros totales | 0,8 mil millones (aproximado, según denominación del release) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 25.600 tokens de entrada por llamada |
| Tipos de cuantización | 8-bit MLX (0,80 GB) y bf16 MLX (1,50 GB) en este repo; GGUF Q4_K_M (0,53 GB) en repo separado |
| Idiomas soportados | en, zh, ar, bg, de, el, es, fr, hi, ja, ko, pt, ru, sw, ta, th, tr, ur, vi (19) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX); GGUF disponible en repositorio aparte |

## Arquitectura y entrenamiento

El modelo parte de una base Qwen3.5 de 0,8B y se especializa mediante ajuste fino para producir decisiones discretas y puntuaciones calibradas sobre un conjunto cerrado de opciones, en lugar de texto libre. La model card no detalla el número de tokens de entrenamiento, la composición exacta del dataset ni si se emplearon RLHF o DPO; sí indica que las fuentes de entrenamiento están documentadas en la model card principal y que la procedencia varía por release: el 2B v4 se entrenó en parte con etiquetas suaves destiladas de TypeSafe Jev 1.14 vía API pública, mientras que este 0.8B v3 tiene fuentes propias no desglosadas en la información disponible.

La innovación técnica declarada es doble. Por un lado, el enfoque "system-one": inferencia de una sola pasada con calibración explícita de la confianza, orientada a latencia baja y decisiones reproducibles. Por otro, la ventana de 25.600 tokens, que permite clasificar documentos largos completos sin troceado ni recuperación, con una afirmación preregistrada de precisión estable de 1K a 24K tokens. La cuantización a 8 bits MLX preserva la paridad de decisión con el modelo a plena precisión según las 240 filas de verificación reportadas.

## Capacidades

- Clasificación de texto multilingüe en 19 idiomas, con etiquetas definidas por el usuario.
- Enrutamiento (routing) de consultas hacia un conjunto fijo de destinos, con puntuación de cada opción.
- Puntuación de opciones fijas (fixed-choice scoring) y decisión con calibración de confianza.
- Procesamiento de documentos largos de hasta 25.600 tokens en una sola llamada, sin chunking.
- Integración como herramienta en agentes: el paquete `jev-style` expone una API compatible con "systemone", herramientas MCP, seis skills de agente y un hook de guarda para Claude Code.
- Ejecución local en Apple Silicon vía MLX y en CPU/CUDA vía backend torch del mismo paquete.
- No soporta generación de texto libre, visión, audio ni tool calling genérico: es un modelo de decisión, no un asistente conversacional.

## Casos de uso

- Enrutamiento de tickets de soporte: clasificar cada consulta entrante contra un catálogo de intenciones (facturación, envíos, cuenta, etc.) y derivarla al equipo correcto. La ventana de 25.600 tokens permite incluir el hilo completo de correo o el historial de conversación sin truncar.
- Moderación y triaje de contenido en local: decidir si un texto cumple o incumple una política definida como conjunto de opciones, ejecutando el modelo en el portátil del analista para no enviar datos sensibles a una API externa.
- Extracción de decisiones sí/no sobre documentos: validar si un recibo, contrato o captura cumple un criterio concreto, con la ventaja de que el modelo procesa el documento entero en una pasada.
- Clasificación multilingüe de reseñas y feedback: etiquetar sentimiento, tema o urgencia en los 19 idiomas soportados con un único modelo, evitando mantener un clasificador por idioma.
- Guardarraíl para agentes de código: usar el hook de Claude Code y las herramientas MCP del paquete para interceptar acciones del agente y decidir si una operación debe bloquearse antes de ejecutarse.
- Filtrado previo en pipelines RAG: puntuar la relevancia de cada fragmento recuperado contra la consulta del usuario y descartar los irrelevantes antes de pasarlos al modelo generativo, reduciendo coste y latencia del pipeline.
- Investigación sobre calibración: evaluar la fiabilidad de las probabilidades emitidas en tareas de clasificación de cola larga, gracias a la paridad documentada entre builds de 8 bits y bf16.

## Benchmarks y rendimiento

Resultados publicados en la model card, comparados con el mejor checkpoint oficial de Laya (reejecutado por el autor sobre las mismas filas):

| Conjunto (fuera del entrenamiento) | Jev-Style v3 · 0.8B | Mejor Laya oficial |
|---|---|---|
| Banking77, 77 intenciones (nunca entrenado) ↑ | 68,2% | 49,2% |
| MASSIVE intent, 37 idiomas no vistos ↑ | 65,5% | 36,1% |
| tweet_topic, zero-shot ↑ | 75,5% | 63,2% |
| JevBench v1.4.1, 231 ítems públicos, zero-shot ↑ | 64,1% | 58,4% |
| Entrada máxima por llamada | 25.600 tokens | 1.024 por defecto |

Notas del autor: los intervalos de confianza pareados al 95% excluyen el cero para Banking77 y MASSIVE; la ventaja en JevBench es una estimación puntual que cae dentro del IC del 95% de v3. Sobre 1.280 ítems reales de 24K tokens, el modelo acierta el 98,3%, con precisión plana de 1K a 24K. No se han publicado resultados de MMLU, HumanEval ni GSM8K, que no aplican a un modelo de clasificación.

## Requisitos de hardware

- VRAM/RAM estimada: 0,80 GB en 8-bit MLX y 1,50 GB en bf16 MLX; 0,53 GB en GGUF Q4_K_M. Añadir margen para el estado de atención sobre entradas de 25.600 tokens.
- GPU recomendadas: cualquier Apple Silicon con suficiente memoria unificada para el build MLX; en CUDA, GPUs de gama consumer como RTX 3060 en adelante son sobradas por tamaño, aunque el rendimiento depende del backend torch del paquete.
- Cabe holgadamente en GPU consumer y en portátiles; es uno de los puntos fuertes del release.
- Opciones de despliegue: `jev-style serve` (API compatible con systemone, Playground, MCP y hook de Claude Code), backend MLX en Apple Silicon y backend torch en CPU/CUDA; pesos GGUF para llama.cpp en el repositorio Q4_K_M.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto de entrada | Licencia | Enfoque |
|---|---|---|---|---|
| Jev-Style 0.8B v3 (este) | ~0,8B | 25.600 tokens | Apache 2.0 | Clasificación/decisión calibrada, local |
| Laya (mejor checkpoint oficial) | No disponible | 1.024 tokens por defecto (512 en inglés) | No disponible | Clasificación multilingüe |
| Jev-Style 2B v4 (hosted) | 2B | 8.192 tokens (entradas hasta 8.000) | No disponible | Decisión vía API, destilado parcial de TypeSafe Jev 1.14 |
| Jev-Style 2B v2 | 2B | No disponible (inferior a 25.600) | No disponible | Decisión, builds MLX bf16 |

El 0.8B v3 es el release más pequeño y el de mayor ventana de la serie; el 2B v4 solo se sirve alojado y con contexto menor, y el 2B v2 tiene un prompt más corto según la propia model card.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto libre, código ni razonamiento abierto; usarlo fuera de tareas de clasificación o decisión dará resultados sin sentido.
- Solo texto: las capacidades de visión citadas en los enlaces del proyecto pertenecen a otras rutas de ejecución, no a este release.
- Riesgo de alucinación acotado por el formato de opciones fijas, pero la calibración puede degradarse en dominios alejados de los datos de entrenamiento; el propio autor advierte que los benchmarks no establecen superioridad universal.
- La ventaja sobre Laya en JevBench es una estimación puntual dentro del intervalo de confianza, no un resultado concluyente.
- Cobertura idiomática declarada de 19 idiomas, pero sin métricas publicadas por idioma más allá del agregado de MASSIVE; el rendimiento en los idiomas menos representados es desconocido.
- Licencia Apache 2.0 permite uso comercial, pero la procedencia de los datos de entrenamiento del 0.8B v3 no está desglosada en la información disponible; conviene revisar la model card principal antes de un despliegue en producción regulada.
- El servicio alojado es una ruta separada con capacidad compartida y respuestas 429 con `Retry-After`; no debe confundirse con la inferencia local.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/chaoliangUNSW/Jev-Style-0.8B-Decision-v3-MLX
- Modelo base: https://huggingface.co/chaoliangUNSW/Jev-Style-0.8B-Decision-v3
- Build GGUF Q4_K_M: https://huggingface.co/chaoliangUNSW/Jev-Style-0.8B-Decision-v3-GGUF
- Serie v1 2B: https://huggingface.co/chaoliangUNSW/Jev-Style-Qwen3.5-2B-Decision-GGUF
- Serie v2 2B: https://huggingface.co/chaoliangUNSW/Jev-Style-Qwen3.5-2B-Decision-v2-MLX-bf16
- Colección de builds y demos v3: https://huggingface.co/collections/chaoliangUNSW/jev-style-08b-decision-v3-6ab58abb90ae4b7b55578b3e
- Repositorio GitHub: https://github.com/lawrence3699/jev-style
- Sitio del proyecto: https://jevstyle.com/models/0-8b-v3/
- Guía de instalación local: https://jevstyle.com/guides/run-locally/
- Clasificación de texto en Python: https://jevstyle.com/guides/local-text-classification/
- Routing local y Apple Silicon: https://jevstyle.com/guides/local-decision-models/
- Decisiones sí/no sobre recibos y capturas: https://jevstyle.com/use-cases/local-vision-decisions/
- Benchmark de routing bancario: https://jevstyle.com/benchmarks/banking-routing/
- Estado del servicio alojado: https://jevstyle.com/api/#service-status
- Health check de la API: https://api.jevstyle.com/healthz
