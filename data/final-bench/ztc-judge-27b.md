# FINAL-Bench/ZTC-Judge-27B

## Resumen

ZTC-Judge-27B es un verificador de respuestas desarrollado por FINAL-Bench que puntúa si la respuesta de *otro* modelo (de cualquier proveedor) es fiable, sin generar un solo token. El mecanismo, denominado Zero-Token Confidence (ZTC), consiste en una única pasada forward sobre la concatenación de pregunta y respuesta, la extracción del estado oculto de la última capa (5.120 dimensiones) en la última posición y un producto escalar con una sonda lineal entrenada. El resultado es un número real sin acotar que actúa como señal de ranking, no como probabilidad calibrada.

El modelo se construye sobre Qwen3.5-27B (revisión `fc05daec18b0`, pesos sin modificar) y añade únicamente la sonda de verificación, por lo que su huella de parámetros es de 27.781.427.952 (unos 27,8 mil millones) y el repositorio ocupa 55,6 GB en safetensors. Está publicado bajo licencia Apache 2.0, con soporte declarado de inglés y coreano, y se etiqueta en HuggingFace con el pipeline `text-classification`.

Su relevancia actual radica en que resuelve un problema práctico de los pipelines con LLM: detectar alucinaciones y filtrar respuestas incorrectas en producción sin encadenar un segundo modelo generativo. Al no decodificar nada, la latencia equivale a una pasada forward y el batching se traduce directamente en throughput, lo que abarata el despliegue frente a enfoques de verificación basados en generación.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3.5-27B) con sonda de clasificación lineal sobre el estado oculto de la última capa (5.120 d) |
| Parametros totales | 27.781.427.952 (27,8 B) |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | No disponible en la información proporcionada |
| Tipos de cuantizacion | No disponible en la información proporcionada (repositorio publicado en safetensors, ~55,6 GB) |
| Idiomas soportados | Inglés (en) y coreano (ko) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (librería `transformers`) |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer decoder-only de la familia Qwen3.5, con 27,8 B de parámetros, cuyos pesos se mantienen sin modificar en la revisión `fc05daec18b0`. Sobre ese backbone, el sistema añade una sonda (probe) lineal que opera sobre el vector de 5.120 dimensiones correspondiente a la última posición de la última capa oculta. El flujo completo es: `[pregunta + respuesta]` → una pasada forward → estado oculto final (5.120 d) → producto escalar con la sonda → puntuación. No se genera ningún token, no se accede a los pesos, logits ni log-probabilidades del modelo que produjo la respuesta: la única entrada es el texto.

El protocolo de evaluación documentado indica que los hiperparámetros se seleccionan exclusivamente dentro de los dominios de entrenamiento y que las métricas finales se calculan por dominio y luego se ponderan por tamaño, en lugar de agrupar todos los ítems en una única AUC (lo que inflaría artificialmente el resultado porque las escalas de puntuación difieren entre dominios). En la medición interna del repositorio se usaron 400 ítems de exámenes profesionales con folds aleatorios, obteniendo 0,7999 con un nulo de permutación de z = 25,68. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO.

La innovación destacable es el propio paradigma ZTC: leer el estado interno del modelo en lugar de su salida textual. Según la model card, preguntar directamente a un modelo por su confianza produce un resultado equivalente al azar (AUC 0,500), mientras que esta sonda alcanza 0,7282 en dominios que nunca vio.

## Capacidades

- Verificación de respuestas de terceros: puntúa si una respuesta generada por cualquier modelo (incluido GPT-5.2) es correcta, a partir únicamente del texto de pregunta y respuesta.
- Detección de alucinaciones: la puntuación ordena respuestas por probabilidad de ser correctas, lo que permite filtrarlas por umbral.
- Estimación de confianza sin generación: cero tokens generados, lo que reduce la latencia a una pasada forward.
- Puntuación por lotes (`score_batch`): al no existir fase de decodificación, el tamaño de lote se traduce directamente en throughput.
- Autoevaluación (self-readout): dado solo un enunciado, el modelo responde por sí mismo y la misma pasada forward indica si acertó (AUC 0,7322 en 3 dominios y 1.595 ítems).
- Compatibilidad de API: el endpoint acepta la misma forma de petición y devuelve la misma forma de respuesta que una integración JEV existente (la model card se trunca en este punto; el detalle completo de la respuesta no está disponible).
- Cobertura de dominios: exámenes profesionales (derecho, matemáticas, biología), razonamiento científico, biología y medicina, procedimientos de catástrofe y seguridad, y razonamiento general multi-paso.
- Idiomas: inglés y coreano.
- No se documenta soporte de tool calling, function calling, agentes, visión ni audio en la información proporcionada.

## Casos de uso

- Filtrado de alucinaciones en producción: cada respuesta generada por el LLM principal se pasa por el juez y se descarta o se envía a revisión humana si la puntuación queda por debajo de un umbral fijado según el presupuesto de revisión disponible. Es adecuado porque no requiere generar texto adicional ni acceder a los logits del modelo generador.
- Moderación de contenidos técnicos en dominios regulados: en derecho, medicina o seguridad, donde una respuesta errónea tiene consecuencias, el juez aporta la mayor ganancia medida (AUC 0,8462 en exámenes profesionales y 0,7154 en biología y medicina frente a 0,5908 del baseline superficial).
- Enrutado selectivo a modelo grande: las respuestas que superan el umbral se devuelven directamente al usuario y las dudosas se escalan a un modelo mayor o a un revisor humano, reduciendo coste por consulta.
- Evaluación automática de pipelines RAG: permite comprobar si la respuesta sintetizada a partir de documentos recuperados es fiable, como capa de control de calidad antes de publicar la salida.
- Control de calidad en generación de código asistida: verificar que la solución propuesta a un problema de programación es plausible antes de integrarla en un flujo de CI/CD, aplicando un umbral conservador y dejando pasar a revisión lo dudoso.
- Verificación en sistemas multi-agente: cuando un agente recibe la salida de otro, el juez puede decidir si aceptarla o solicitar una reformulación, actuando como puerta de validación intermedia.
- Auditoría y monitorización continua: puntuar por lotes grandes volúmenes de respuestas ya registradas para detectar degradación del modelo principal o aparición de patrones de error por dominio.
- Sustitución directa en integraciones JEV existentes: al mantener la forma de petición y respuesta, se puede desplegar como reemplazo del verificador actual sin reescribir el cliente.

## Benchmarks y rendimiento

Medición A: leaderboard independiente (Typed Decision Leaderboard), 2.018 ítems, protocolo leave-one-domain-out.

| Sistema | AUC |
|---|---|
| Darwin-397B-ZTC | 0,7364 |
| JEV (TypeSafe AI) | 0,7350 |
| ZTC-Judge-27B | 0,7282 |
| GPT-5.2 preguntado directamente | 0,7148 |
| open-jev 4B | 0,6844 |
| Solo longitud y formato de la respuesta (baseline superficial) | 0,6223 |
| Patronus Lynx 8B | 0,5179 |
| Confianza declarada por el propio modelo que responde | 0,5000 |

Desglose por dominio frente al baseline superficial del mismo dominio:

| Dominio | Baseline | ZTC-Judge-27B | Ítems | Erróneos |
|---|---|---|---|---|
| Exámenes profesionales (derecho, matemáticas, biología) | 0,7138 | 0,8462 | 400 | 80 |
| Razonamiento científico | 0,7272 | 0,7410 | 198 | 20 |
| Biología y medicina | 0,5908 | 0,7154 | 917 | 169 |
| Procedimientos de catástrofe y seguridad | 0,5949 | 0,6961 | 225 | 109 |
| Razonamiento general multi-paso | 0,5420 | 0,6172 | 278 | 130 |
| Media ponderada por tamaño | 0,6223 | 0,7282 | 2.018 | 508 |

Autoevaluación (self-readout): 0,7322 en 3 dominios y 1.595 ítems.

Medición B: medición interna del repositorio, 400 ítems de exámenes profesionales, folds aleatorios, juez Qwen3.5-27B revisión `fc05daec18b0` con pesos sin modificar: 0,7999; nulo de permutación z = 25,68. La propia model card advierte que esta cifra no es comparable con la del leaderboard (un solo dominio, folds aleatorios en lugar de dominios retenidos) y que debe citarse 0,7282 al comparar con otros sistemas.

## Requisitos de hardware

- Tamaño de pesos: 27,8 B de parámetros. En FP16/BF16 el repositorio ocupa 55,6 GB, por lo que la inferencia requiere al menos 56-64 GB de VRAM para pesos, más margen para activaciones y lotes.
- Cuantización: no se documentan tipos de cuantización en la información disponible. Como aproximación estándar sobre un modelo de este tamaño: INT8 en torno a 28 GB e INT4 en torno a 14-16 GB de VRAM.
- GPU de centro de datos: A100 80 GB, H100 80 GB o H200 para FP16/BF16 sin compromisos y con lotes grandes; A100 40 GB o L40S 48 GB resultan ajustadas en precisión completa.
- GPU de consumo: una RTX 4090 (24 GB) o RTX 3090 (24 GB) no admiten FP16, pero sí una versión en INT4. Configuraciones de 2× RTX 4090 (48 GB) permiten INT8.
- Al ser un clasificador sin decodificación, el uso de memoria KV es mínimo comparado con un modelo generativo del mismo tamaño, ya que la secuencia se procesa en una sola pasada sin caché autoregresiva durante la generación.
- Opciones de despliegue: la librería indicada es `transformers` con safetensors. La model card muestra el cliente específico `ztc_judge.ZTCJudge` con métodos `from_pretrained`, `score` y `score_batch`, y menciona un endpoint compatible con integraciones JEV. No se documenta soporte explícito de vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: no se publican cifras concretas. Cualitativamente, la latencia equivale a una única pasada forward (frente a las múltiples pasadas de un verificador generativo) y el batching escala el throughput de forma aproximadamente lineal, ya que no existe fase de decodificación.

## Comparativa con modelos similares

| Sistema | Parámetros | AUC (leaderboard, 2.018 ítems) | Enfoque | Licencia / disponibilidad |
|---|---|---|---|---|
| ZTC-Judge-27B | 27,8 B | 0,7282 | Sonda lineal sobre estado oculto, 0 tokens generados | Apache 2.0, pesos abiertos en HuggingFace |
| Darwin-397B-ZTC | 397 B (según denominación) | 0,7364 | Self-readout probe del propio modelo | No disponible |
| JEV (TypeSafe AI) | No disponible | 0,7350 | Verificador de terceros | Propietario (no disponible en abierto) |
| GPT-5.2 (pregunta directa) | No disponible | 0,7148 | Confianza declarada por el modelo | API propietaria |
| open-jev 4B | 4 B | 0,6844 | Verificador abierto de 4 B | Abierta (detalles no disponibles) |
| Patronus Lynx 8B | 8 B | 0,5179 | Clasificador de alucinaciones | No disponible |
| Baseline superficial | No aplica | 0,6223 | Solo longitud, dígitos y formato | No aplica |

Contexto, rendimiento en benchmarks generativos y disponibilidad de pesos de los sistemas comparados: no disponible en la información proporcionada.

## Limitaciones y advertencias

- La puntuación es un número real sin acotar, no una probabilidad calibrada. Debe usarse como señal de ranking y el umbral debe elegirse según el presupuesto de revisión propio.
- Las escalas de puntuación difieren entre dominios, por lo que agrupar todos los ítems en una única AUC infla el resultado. La propia model card recomienda ponderar por dominio.
- Las dos métricas publicadas (0,7282 y 0,7999) no son intercambiables: la segunda procede de un protocolo más fácil (un solo dominio, folds aleatorios). Citar 0,7282 en comparaciones.
- El rendimiento en el dominio de razonamiento general multi-paso es el más bajo de los cinco evaluados (0,6172, con 130 de 278 ítems erróneos), muy cerca del baseline superficial de 0,5420.
- Cobertura lingüística declarada limitada a inglés y coreano; no se garantiza comportamiento en castellano ni en otros idiomas.
- Longitud de contexto soportada no documentada, lo que impide planificar entradas largas (por ejemplo, documentos extensos en RAG) con garantías.
- Riesgo de dependencia del dominio: la sonda se entrenó con hiperparámetros seleccionados dentro de los dominios de entrenamiento, y la evaluación held-out muestra diferencias notables entre dominios (de 0,6172 a 0,8462).
- La etiqueta `image-text-to-text` aparece en los metadatos de HuggingFace, pero la model card no documenta ninguna capacidad de visión. Debe tratarse como no confirmada hasta verificarlo.
- La model card está truncada en la sección de API, por lo que el contrato completo de respuesta del endpoint no está disponible.
- El repositorio tiene muy pocas descargas (6) pese a los 32 likes, y la fecha de creación registrada (2026-09-19) es posterior a la fecha de actualización habitual de los catálogos; conviene verificar la vigencia del artefacto antes de integrarlo.
- Licencia Apache 2.0: permite uso comercial, pero el modelo hereda las condiciones de Qwen3.5-27B, cuyos términos específicos no se detallan en la información disponible.
- No se documentan sesgos conocidos, evaluación de seguridad ni comportamiento ante entradas adversarias.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/FINAL-Bench/ZTC-Judge-27B
- Modelo relacionado Darwin-397B-ZTC: https://huggingface.co/FINAL-Bench/Darwin-397B-ZTC
- Demo Gate Arcade: https://huggingface.co/spaces/FINAL-Bench/gate-tetris
- Typed Decision Leaderboard: https://huggingface.co/spaces/mayafree/typed-decision-leaderboard
- Verifier Playground: https://huggingface.co/spaces/mayafree/verifier-playground
- Sitio del proyecto: https://vidraft.net
