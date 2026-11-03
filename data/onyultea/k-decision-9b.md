# ONYULTEA/K-Decision-9B

## Resumen

K-Decision-9B es un modelo de decisión estructurada especializado en coreano, desarrollado por ONYULTEA y publicado como primera versión pública (v0.1). Se deriva del modelo base Qwen/Qwen3.5-9B mediante un ajuste fino con LoRA en int8 (r=32) y no está diseñado para generar texto libre, sino para devolver, en un único forward pass, una distribución de probabilidad calibrada sobre un conjunto cerrado de opciones tipadas. El modelo resuelve el problema de la clasificación y el enrutamiento determinista dentro de pipelines de agentes: recibe un estado (state) y una o varias preguntas tipadas, y emite decisiones con probabilidades que suman 1 por campo.

La arquitectura subyacente es la del transformer denso de Qwen3.5-9B, con 8.953.803.264 parámetros. La innovación no reside en la arquitectura sino en el método de inferencia: se añade un esqueleto JSON con marcadores, y los logits en la posición previa a cada marcador predicen el símbolo de respuesta, restringido por decodificación a los símbolos legales (A–Z para `choice`, Y/N para `noul`). Esto elimina el bucle de decodificación y permite resolver N campos en una sola pasada.

Su relevancia actual está en el nicho de los modelos "System One" para agentes: decisiones rápidas, baratas y calibradas (ECE ~0.001 en el holdout de dominio según el autor), con latencia p50 declarada de 168 ms sobre 140.000 peticiones. Está orientado a producción en coreano (con soporte de inglés), bajo licencia Apache-2.0 y ejecutable en una única GPU de consumo de 24 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen3.5-9B), ajuste fino con LoRA int8 (r=32) |
| Parametros totales | 8.953.803.264 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (límite documentado de entrada: state de hasta 6.000 caracteres) |
| Tipos de cuantizacion | Entrenamiento y servicio en int8; pesos publicados en safetensors (bf16 en carga con `torch_dtype=torch.bfloat16`); otras cuantizaciones no disponibles |
| Idiomas soportados | ko, en |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-9B, un transformer denso de ~9.000 millones de parámetros, y se ajusta con LoRA de rango 32 en precisión int8. El autor documenta que el ajuste en 4 bits degradaba la precisión de las probabilidades y que int8 aportó +3 pp de exactitud con el mismo presupuesto de cómputo. El entrenamiento y el servicio se realizaron en una única GPU de consumo de 24 GB.

El método de decisión se basa en cuatro piezas: (1) un marcador de un solo paso, donde se concatena un esqueleto JSON `{"route":□,"urgent":□}` al prompt y los logits en la posición previa a cada marcador predicen el campo correspondiente, resolviendo N campos en un único forward sin bucle de decodificación; (2) decodificación restringida a los símbolos legales (A–Z o Y/N), con softmax sobre ese subconjunto para garantizar que las probabilidades sumen 1; (3) calibración de temperatura por tipo de pregunta (`choice` y `noul`) ajustada sobre holdouts para optimizar Brier y ECE; y (4) tipos de pregunta acotados: `choice` con entre 2 y 26 opciones y `noul` (sí/no).

Los datos de entrenamiento documentados incluyen aproximadamente 28.000 registros sintéticos de siete dominios de la vida cotidiana coreana (enrutamiento administrativo con 20 tipos de servicio, atención médica, atención al cliente de comercio, infraestructura cotidiana como inmobiliaria, transporte y telecomunicaciones, educación, aprobaciones laborales y gating de herramientas de agentes), con aumentación lingüística de registro formal e informal, erratas y neologismos. Se complementan con decisiones tipadas de tasksource-jev-typed-decisions (CC-BY-4.0), destilación multilingüe con soft labels de un teacher (Apache-2.0) y un pool de decisiones de herramientas (CC-BY-4.0), además de tareas de conformidad normativa basadas en reglamentos universitarios públicos.

## Capacidades

- Clasificación y decisión estructurada de un solo paso: devuelve probabilidades calibradas para todos los campos de un esqueleto JSON en un único forward pass.
- Preguntas de tipo `choice` con 2 a 26 opciones y preguntas de tipo `noul` (sí/no).
- Probabilidades calibradas por tipo de pregunta (temperatura ajustada), aptas para umbrales operativos.
- Rechazo honesto de entradas fuera de rango: más de 26 opciones o un `state` de más de 6.000 caracteres devuelve `Unsupported` (HTTP 422).
- Enrutamiento y gating de herramientas en agentes (tool gating), con decisión sobre qué herramienta o ruta activar.
- Capacidades multilingües limitadas a coreano e inglés.
- No genera texto libre: no es un modelo conversacional ni de razonamiento abierto.
- Servidor compatible con la API `/v1/systemone` (System One / Jev) y con el kit de reproducción del Decision Index y el cliente Kev.

## Casos de uso

- Enrutamiento de quejas y solicitudes ciudadanas: el modelo recibe el texto de la reclamación (por ejemplo, olor a gas en un call center) y devuelve la distribución de probabilidad sobre departamentos (`gas`: 0.87, `water`: 0.05, `road`: 0.08) junto con la marca de urgencia (`noul`: 0.93). Es adecuado porque la decisión es determinista, calibrada y se resuelve en un solo paso con latencia baja.
- Gating de herramientas en agentes: antes de invocar una herramienta, el agente consulta al modelo si la acción está permitida o qué herramienta corresponde, usando las probabilidades para aplicar un umbral de confianza y derivar a revisión humana los casos dudosos.
- Triaje de atención al cliente de comercio electrónico: clasificación de la intención del ticket (devolución, cambio, incidencia de envío, facturación) con probabilidades por categoría, lo que permite automatizar la primera respuesta y priorizar colas.
- Conformidad normativa y reglamentos: evaluación de si una solicitud cumple requisitos numéricos o de aplicabilidad según reglamentos (el autor reporta 0.791 de exactitud en una tarea de conformidad con tres reglamentos), útil para prevalidar expedientes antes de la revisión humana.
- Enrutamiento administrativo interno: asignación de aprobaciones y solicitudes al departamento o flujo correcto dentro de una organización, con una decisión por campo y probabilidades auditables.
- Filtro previo en pipelines de agentes multi-paso: usar el modelo como "System One" para descartar o confirmar rutas rápidas antes de invocar un LLM generativo más caro, reduciendo coste y latencia (p50 declarada de 168 ms).
- Clasificación por lotes de alto volumen: al no decodificar texto, el throughput por petición es bajo en cómputo y permite procesar grandes volúmenes de decisiones con una sola GPU de 24 GB.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (métricas no verificadas de forma independiente, `verified: false`):

| Benchmark | Métrica | Valor | Escala |
|---|---|---|---|
| LocalLLaMA/typed-decisions (test) | accuracy (fitted) | 0.818 | 400 casos / 2.000 decisiones, 4 dominios y 5 preguntas |
| skt/kobest_v1 (conversión de 5 tareas: boolq/copa/hellaswag/sentineg/wic) | accuracy | 0.866 | 2.600 ítems |
| bzantium/korean-jev-decision-index | accuracy | 0.635 | 3.000 ítems de 64 fuentes de benchmarks coreanos |
| Holdout de dominio de vida coreana | accuracy | 0.997 | 7 dominios (administración, médico, CS de compras, infraestructura, educación, trabajo, agentes) |
| Conformidad con reglamentos universitarios | accuracy | 0.791 | 3 reglamentos, tarea nueva |
| Decision Index 0.3 (suite pública) | índice 30.7 (raw 44.8) | — | 140.000 peticiones, 0 errores, latencia p50 168 ms |
| Calibración (holdout de dominio) | ECE | ~0.001 | temperatura ajustada por tipo |

No se han publicado en la información disponible resultados de benchmarks estándar de lenguaje (MMLU, HumanEval, GSM8K) para este modelo; el autor indica que el conocimiento del mundo (KMMLU ~30%) corresponde al nivel del base de 9B.

## Requisitos de hardware

- VRAM estimada para inferencia: en bf16, los 8.953.803.264 parámetros ocupan aproximadamente 17,9 GB, por lo que requiere alrededor de 20-24 GB con overhead; el autor confirma servicio en una GPU de consumo de 24 GB.
- GPU recomendadas: una RTX 4090 (24 GB) es suficiente según el autor; A100 y H100 son válidas con holgura. En GPUs de menos de 24 GB sería necesaria cuantización adicional, no documentada.
- Cabe en GPU de consumo: sí, en tarjetas de 24 GB (RTX 4090, RTX 3090) según el autor.
- Opciones de despliegue: `transformers` con `AutoModelForCausalLM` y `device_map="auto"`; servidor propio `/v1/systemone` mediante `src/serve_systemone.py` del repositorio `github.com/onyultea/k-decision`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: latencia p50 de 168 ms declarada sobre 140.000 peticiones en el Decision Index 0.3. El throughput agregado no está disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| K-Decision-9B | 8,95 B | no disponible (state ≤ 6.000 caracteres) | Decisión estructurada calibrada, ko/en | Apache-2.0 | HuggingFace, 0 descargas |
| Qwen3.5-9B (base) | ~9 B | no disponible | LLM generativo generalista | según el base (no disponible en la información) | HuggingFace |
| Modelos de clasificación zero-shot tipo BART/mDeBERTa | cientos de millones | típicamente 512-1.024 tokens | Clasificación NLI zero-shot | variable | HuggingFace |

No se dispone de datos de benchmarks comparables entre K-Decision-9B y alternativas de la misma categoría en la información proporcionada; la comparación con el base Qwen3.5-9B y con clasificadores zero-shot es cualitativa. El pipeline declarado es `zero-shot-classification`, pero el modelo opera con opciones y tipos predefinidos, no con etiquetas arbitrarias en lenguaje natural.

## Limitaciones y advertencias

- Límites duros de entrada: máximo 26 opciones por pregunta `choice` y `state` de hasta 6.000 caracteres; fuera de rango devuelve `Unsupported` (HTTP 422).
- El conocimiento del mundo es el del base de 9B (KMMLU ~30% según el autor); el ajuste fino cambia la expresión del modelo, no añade conocimiento.
- No es un modelo generativo: no produce texto libre ni razonamiento encadenado; solo emite símbolos de decisión con probabilidades.
- Las probabilidades altas no garantizan corrección; el autor recomienda operar con umbrales y revisión humana en decisiones de alto riesgo (tratamiento médico, acreditación, contratación).
- Riesgo de alucinación no evaluado de forma independiente; los benchmarks son declarados por el autor y no verificados (`verified: false`), incluido el holdout de 0.997 que sugiere posible sobreajuste al dominio sintético.
- Cobertura lingüística limitada a coreano e inglés; el rendimiento en otros idiomas no está documentado.
- Sesgos: no se documentan evaluaciones de sesgo; los datos de entrenamiento son en gran parte sintéticos y de dominio coreano, lo que puede introducir sesgos de distribución.
- Licencia Apache-2.0 para los pesos (derivados de Qwen3.5-9B), lo que permite uso comercial; conviene verificar las condiciones del modelo base.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: madurez y soporte comunitario mínimos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ONYULTEA/K-Decision-9B
- Repositorio de código de entrenamiento y evaluación: https://github.com/onyultea/k-decision
- Sitio del autor: https://onyultea.kr
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Dataset de decisiones tipadas: tasksource-jev-typed-decisions (CC-BY-4.0), referencia en la model card
- Benchmark coreano: skt/kobest_v1
- Índice de decisiones coreano: bzantium/korean-jev-decision-index
