# JuneoAI/Laplace-1-Atlas

## Resumen

Laplace-1-Atlas es un modelo de decisión causal-intervencional de 27.356 millones de parámetros desarrollado por JuneoAI, afinado a partir de Qwen/Qwen3.8-27B. No es un modelo conversacional al uso: su función es responder a la pregunta "¿qué ocurre si se ejecuta esta acción?" antes de que un agente la lleve a cabo. Para ello modela la distribución interventional p(s' | do(a), s, C), es decir, el estado siguiente de una organización tras una acción candidata, condicionado por la cadena de autoridad del agente. El modelo forma parte de la familia Laplace-1, junto con la variante edge Laplace-1-Vector de 4.1B.

La propuesta encaja en el ecosistema de agentes conectados mediante A2A y MCP, donde la ausencia de mecanismos de previsión de consecuencias limita la confianza en la delegación automática. Atlas expone dos primitivas de inferencia: puntuación de candidatos (devuelve una distribución sobre un conjunto cerrado de opciones en un único forward pass, leyendo los logits del siguiente token) y predicción de resultados (genera la próxima observación dado un conjunto de reglas de entorno y una acción).

El modelo se publica con pesos completos en BF16 bajo licencia Apache-2.0, sin adaptadores ni acceso restringido, y está pensado para ejecutarse en servidores de organización y nube privada. Su relevancia actual radica en que aborda la capa de seguridad y previsión de consecuencias en pipelines agénticos, un área donde los benchmarks específicos son escasos y donde el autor reporta ventajas frente a modelos de OpenAI, Perplexity, Cloudflare, TypeSafe, ByteDance y Alibaba.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5/Qwen3.8, tag `qwen3_5`); modalidad image-text-to-text |
| Parametros totales | 27.356.728.560 (27.4B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (repositorio de 54.7 GB) |

## Arquitectura y entrenamiento

Laplace-1-Atlas es un fine-tune del modelo base Qwen/Qwen3.8-27B, con arquitectura transformer y pipeline declarado de `text-generation`, aunque los tags de Hugging Face incluyen `image-text-to-text`, lo que sugiere capacidad de entrada multimodal imagen-texto heredada o extendida respecto al base. El modelo se distribuye con pesos completos en BF16 y tokenizador, sin adaptadores LoRA ni acceso condicionado.

El entrenamiento se apoya en Decision Forge, el conjunto de datos del autor (repositorio público en GitHub bajo Juneo-Lab/decision-forge), orientado a modelar distribuciones interventionales sobre estados de organización, acciones candidatas y cadenas de autoridad. La model card no detalla el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron fases de RLHF o DPO. La innovación técnica destacada es el uso de la próxima distribución de tokens como distribución de decisión: dado un estado, una pregunta y un conjunto de candidatos, el modelo devuelve una distribución sobre exactamente esos candidatos en un solo forward pass, sin muestreo ni parseo posterior. La segunda primitiva, predicción de resultados, genera la observación siguiente a partir de reglas de entorno explícitas y una acción propuesta.

## Capacidades

- Puntuación de candidatos: distribución sobre un conjunto cerrado de opciones (routing, decisiones de acceso, escalado, selección de siguiente acción) en un único forward pass.
- Predicción de resultados: generación de la próxima observación dado un estado, reglas de entorno y una acción, permitiendo ver la consecuencia antes de ejecutarla.
- Decisión de tres vías: proceder, devolver a una persona o bloquear una acción.
- Razonamiento causal e inferencia interventional sobre estados de organización.
- Evaluación de seguridad de agentes y previsión de consecuencias en flujos multi-paso.
- Soporte declarado de entrada image-text-to-text (según tags del repositorio).
- Generación de texto y modo conversacional (pipeline `text-generation`, tag `conversational`).
- Compatibilidad con endpoints (tag `endpoints_compatible`).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Puerta de seguridad para agentes autónomos: antes de que un agente ejecute una acción sobre un sistema corporativo, Atlas recibe el estado de la organización, la acción candidata y la cadena de autoridad, y devuelve una distribución sobre proceder, escalar o bloquear. Es adecuado porque su primitiva de puntuación de candidatos está diseñada exactamente para esta decisión en un solo forward pass.
- Enrutamiento de solicitudes internas: dado un ticket o petición y un conjunto de colas o equipos candidatos, el modelo puntúa cada destino y selecciona el más probable. La naturaleza cerrada del conjunto de candidatos evita el parseo de texto libre.
- Control de acceso y permisos: evaluar si una identidad o agente debe recibir acceso a un recurso, usando el benchmark OrgAccess como referencia de su comportamiento en decisiones de autorización organizativa.
- Escalado a humano en flujos críticos: cuando la distribución de decisión no supera un umbral de confianza, el sistema deriva la acción a una persona; el modelo está entrenado para producir la etiqueta de "hand back to a person" como una de sus tres salidas.
- Simulación de consecuencias en pipelines CI/CD o de despliegue: dada una acción de despliegue y las reglas del entorno, Atlas genera la observación siguiente para anticipar el efecto antes de aplicar el cambio.
- Selección de siguiente acción en agentes multi-paso: en un bucle agéntico, el modelo puntúa las acciones candidatas del siguiente paso y permite elegir la de mayor probabilidad bajo la política de la organización.
- Auditoría y análisis de decisiones: registrar la distribución sobre candidatos junto con el estado y la cadena de autoridad para reconstruir por qué se tomó una decisión automatizada.

## Benchmarks y rendimiento

Resultados publicados en la model card (porcentajes, en negrita el mejor de cada fila, empates incluidos; "—" indica no publicado o no soportado):

| Benchmark | Laplace-1-Atlas (27B, Juneo) | Decider v1.2 (27B, Perplexity) | Clef-Omni (30B-A3B, Cloudflare) | Jev 1.14 (TypeSafe) | GPT-6 Luna Decisions (OpenAI) | Doubao Seed 2.1 Lite (ByteDance) | decision-model-preview (Alibaba) |
|---|---|---|---|---|---|---|---|
| JevBench | **93.2** | **93.2** | 86.9 | 91.6 | 89.5 | 92.7 | 77.0 |
| JEVal | 79.2 | **82.2** | 77.6 | 80.0 | — | 78.3 | 60.2 |
| When2Call | **89.9** | 87.6 | 62.4 | 81.3 | 74.5 | 70.7 | 45.2 |
| AgentDecisionBench L2 common | **95.6** | 94.1 | 48.4 | 91.0 | 90.9 | 85.8 | 43.0 |
| AgentDecisionBench L2 shift | **95.5** | 94.0 | 52.3 | 92.1 | 88.2 | 87.8 | 48.5 |
| Coherence | **85.7** | 80.8 | — | 82.7 | — | 80.6 | — |
| COMPASS | **85.3** | 84.3 | 81.8 | 81.3 | — | 79.1 | 73.7 |
| OrgAccess | 44.8 | 30.9 | 35.7 | 42.0 | **45.7** | 41.2 | 16.1 |
| TrustDecision | **89.4** | 84.0 | 78.8 | 78.7 | — | 79.6 | 61.8 |

Según el autor, el modelo queda primero en 7 de 9 benchmarks (contando empates), con 89.4% en TrustDecision (+5.4 puntos sobre el siguiente mejor y +10.7 sobre Jev 1.14), por delante de Jev 1.14 en 8 de 9 y de Decider v1.2 en 7 de 9. En AgentDecisionBench L2 reporta 95.6% en "common" y 95.5% en "shift", lo que el autor interpreta como robustez ante cambio de distribución. No se han publicado resultados de benchmarks generales (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 55 GB solo para pesos (27.4B × 2 bytes), más overhead de activaciones y KV cache; en la práctica se recomienda 80 GB o más por GPU para contexto amplio.
- Cuantización a 8 bits: en torno a 28-30 GB de pesos, viable en una GPU de 40-48 GB (A100 40GB, L40S, RTX 6000 Ada).
- Cuantización a 4 bits: en torno a 14-16 GB de pesos, potencialmente ejecutable en RTX 4090 (24 GB) con contexto moderado; los tipos de cuantización oficiales no están documentados en la información disponible.
- GPU recomendadas: A100 80GB, H100 80GB, H200 para BF16 en producción; L40S o A6000 para 8 bits; RTX 4090 solo con cuantización agresiva y contexto reducido.
- Despliegue: el repositorio declara compatibilidad con `transformers` y tag `endpoints_compatible`. No se confirma soporte explícito de vLLM, llama.cpp, Ollama o TGI en la información proporcionada.
- Latencia y throughput: no disponibles. La primitiva de decisión requiere un único forward pass por conjunto de candidatos, lo que evita generación autoregresiva en el caso de puntuación.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | TrustDecision | When2Call | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Laplace-1-Atlas | 27.4B | no disponible | 89.4 | 89.9 | Apache-2.0 | Pesos abiertos en Hugging Face |
| Laplace-1-Vector | 4.1B | no disponible | no disponible | no disponible | no disponible | Pesos abiertos en Hugging Face |
| Decider v1.2 (Perplexity) | 27B | no disponible | 84.0 | 87.6 | no disponible | no disponible |
| Jev 1.14 (TypeSafe) | no disponible | no disponible | 78.7 | 81.3 | no disponible | no disponible |
| Clef-Omni (Cloudflare) | 30B-A3B (MoE) | no disponible | 78.8 | 62.4 | no disponible | no disponible |

Laplace-1-Vector es la alternativa de la misma familia para despliegue en edge (4.1B), pensada para ejecución on-premises y on-device. Frente a Decider v1.2 y Jev 1.14, Atlas reporta mejores resultados en la mayoría de benchmarks de decisión, con la excepción de JEVal (79.2 frente a 82.2 de Decider) y OrgAccess (44.8 frente a 45.7 de GPT-6 Luna Decisions). Los datos de licencia y disponibilidad de los modelos comparados no están publicados en la información disponible.

## Limitaciones y advertencias

- El modelo está especializado en decisión causal-interventional; no es un sustituto de un LLM generalista para generación abierta, código o matemáticas, y no se han publicado benchmarks en esas áreas.
- Riesgo de alucinación en la predicción de resultados: la generación del siguiente estado puede producir consecuencias plausibles pero incorrectas si las reglas de entorno proporcionadas son incompletas.
- Resultado bajo en OrgAccess (44.8%), lo que sugiere margen de mejora en decisiones de autorización organizativa complejas; GPT-6 Luna Decisions supera a Atlas en ese benchmark.
- Los benchmarks son en su mayoría propietarios del ecosistema del autor o de terceros (JevBench, JEVal, When2Call, AgentDecisionBench, TrustDecision, COMPASS, OrgAccess); la comparabilidad con evaluaciones independientes no está verificada.
- No se documentan sesgos conocidos, composición del dataset de entrenamiento ni proceso de alineación (RLHF/DPO), lo que dificulta evaluar riesgos de sesgo.
- Idiomas soportados no declarados; no se garantiza un rendimiento uniforme fuera del inglés.
- Longitud de contexto no publicada, lo que impide planificar despliegues con documentos o estados de organización extensos.
- Aunque la licencia es Apache-2.0 y permite uso comercial, el modelo base Qwen/Qwen3.8-27B puede tener sus propias condiciones que conviene revisar antes de producción.
- El repositorio tiene 0 descargas y 2 likes en el momento de la consulta, con creación el 2026-11-01; se trata de un lanzamiento muy reciente sin validación independiente de la comunidad.
- La model card está truncada en el texto disponible; secciones como "Intended use and limitations" no se han podido consultar completas.

## Enlaces

- Hugging Face: https://huggingface.co/JuneoAI/Laplace-1-Atlas
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Variante edge: https://huggingface.co/JuneoAI/Laplace-1-Vector
- Dataset Decision Forge: https://github.com/Juneo-Lab/decision-forge
- Licencia Apache-2.0: https://huggingface.co/JuneoAI/Laplace-1-Atlas/blob/main/LICENSE
- Contacto del autor: business@juneo.ai
