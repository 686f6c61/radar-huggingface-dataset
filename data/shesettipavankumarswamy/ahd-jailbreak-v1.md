# shesettipavankumarswamy/ahd-jailbreak-v1

## Resumen

AHD-Jailbreak (Adaptive Hypergraph Defense with Anchor-Gated Topology) es un clasificador de seguridad previo a la inferencia, publicado en Hugging Face por el desarrollador independiente PavankumarSwamy Shesetti bajo licencia Apache 2.0. No es un modelo generativo, sino un guardrail: recibe un prompt y el historial de conversación, y devuelve una etiqueta de decisión (`ALLOW`, `QUARANTINE_REVIEW` o `BLOCK`) junto con una puntuación de riesgo y una medida de incertidumbre. Su objetivo es interceptar ataques de jailbreak multi-turno (crescendo), ofuscaciones Base64 y homoglifos, y prompts compuestos antes de que lleguen al LLM objetivo.

La propuesta técnica se apoya en hypergrafos: modela la interacción entre prompt e historial mediante hiperaristas poliádicas sobre un espacio de vértices heterogéneo (prompts, turnos, sujetos, contexto y anclas), con un total inicial de 4.084 vértices. La extracción de características combina 10 dimensiones de señales superficiales (entropía, caracteres de ancho cero, detección de Base64) con un embedding denso de 384 dimensiones tipo MiniLM, y sobre ese vector se construye un ego-subhipergrafo inductivo de 2 saltos con convolución espectral de 2 capas.

El modelo se distribuye como paquete Python (`ahd-jailbreak`) con motor ONNX cuantizado a INT8, lo que permite inferencia en CPU en torno a 6 ms según el autor. Está pensado como middleware drop-in para FastAPI/ASGI o como wrapper de clientes OpenAI y Anthropic. Es relevante porque aborda la defensa en tiempo de pre-inferencia sin depender de un LLM juez, lo que reduce coste y latencia, aunque su validación independiente es todavía inexistente (0 descargas y 0 likes en el momento de la consulta).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hypergraph Neural Network (convolución espectral de hipergrafo, 2 capas) sobre embedding MiniLM de 384 dimensiones + 10 características superficiales |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | ventana de historial W=5 turnos; ego-subhipergrafo de hasta 120 nodos |
| Tipos de cuantizacion | ONNX INT8 (motor por defecto en el paquete); no se detallan otras |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (runtime `onnx-int8`); el repo usa la librería `transformers` y el tag `onnx` |

## Arquitectura y entrenamiento

La arquitectura se organiza en tres etapas. La primera extrae 394 dimensiones por prompt: 10 señales superficiales calculadas antes de la normalización NFKC (entropía, presencia de caracteres de ancho cero, indicios de Base64) y 384 dimensiones de embedding denso MiniLM normalizado L2. La segunda construye un ego-subhipergrafo inductivo de 2 saltos (k=10, hasta 120 nodos) con hiperaristas poliádicas de cuatro tipos: semánticas, contextuales, tácticas y de política. Sobre ese grafo aplica dos capas de convolución espectral de hipergrafo con LayerNorm. La tercera fusiona múltiples señales calibradas con un umbral T_cal = 0,84: en modo de un solo turno, R(x) = 0,60·P_cal + 0,30·S_nbr + 0,10·S_OOD; en modo multi-turno, R(x) = 0,50·P_cal + 0,25·S_nbr + 0,15·S_ctx. La incertidumbre se calcula como u(x) = 0,60·H_bin(P_cal) + 0,40·S_OOD.

Los umbrales de decisión son: R(x) < 0,35 → ALLOW; 0,35 ≤ R(x) < 0,70 → QUARANTINE_REVIEW (almacenamiento temporal en buffer HMAC); R(x) ≥ 0,70 → BLOCK con respuesta HTTP 403. El autor declara entrenamiento y evaluación sobre un conjunto multi-benchmark sin fuga de datos de 14.500 muestras, compuesto por WildGuardMix, WildJailbreak, ScaleAI MHJ, JailbreakBench, XSTest y OR-Bench, con cinco semillas [42, 100, 2026, 7, 99]. No se especifica el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo ajuste fino con RLHF o DPO; el autor tampoco detalla el proceso de calibración más allá del umbral T_cal.

## Capacidades

- Clasificación de seguridad de prompts en tres clases: `ALLOW`, `QUARANTINE_REVIEW` y `BLOCK`.
- Detección de ataques multi-turno tipo crescendo mediante modelado del historial (ventana de 5 turnos).
- Detección de ofuscaciones: Base64, homoglifos y caracteres de ancho cero, gracias a las características pre-NFKC.
- Detección de jailbreaks composicionales y de inyección de prompt.
- Puntuación de riesgo calibrada (`risk_score`) y estimación de incertidumbre (`uncertainty`).
- Explicabilidad relacional: devuelve un informe de atribución sobre las relaciones del hipergrafo.
- Envoltorio de clientes LLM (`wrap_llm`) para OpenAI, Anthropic y pipelines de Hugging Face, con bloqueo previo a la llamada.
- Middleware ASGI/FastAPI (`AHDMiddleware`) para interceptar peticiones `POST /chat/completions`.
- Inferencia en CPU sin GPU, con latencia declarada inferior a 6 ms.
- No genera texto, no razona, no escribe código ni procesa visión o audio: es exclusivamente un clasificador.

## Casos de uso

- **Guardrail previo a un LLM en producción**: colocar el modelo delante de cualquier endpoint de chat para filtrar prompts adversariales antes de consumir tokens de API o GPU. El wrapper `guard.wrap_llm(client)` permite integrarlo con una línea y devuelve una respuesta de rechazo cuando el riesgo supera 0,70.
- **Middleware en API FastAPI/Starlette**: `app.add_middleware(AHDMiddleware, guard=guard)` intercepta automáticamente las peticiones entrantes a `/chat/completions`, adecuado para servicios propios que ya exponen una API compatible con OpenAI.
- **Defensa frente a ataques crescendo multi-turno**: el modelo incorpora el historial (W=5) en el cálculo del riesgo, de modo que puede detectar una escalada progresiva de peticiones benignas hacia contenido dañino que un clasificador de un solo turno no vería.
- **Filtrado de entradas ofuscadas**: útil en sistemas que reciben texto de usuarios no confiables donde se intenta evadir filtros con Base64, homoglifos o caracteres invisibles; las 10 características pre-NFKC están diseñadas específicamente para ello.
- **Revisión humana asistida (quarantine)**: la banda intermedia (0,35–0,70) permite derivar casos dudosos a una cola de revisión con buffer HMAC en lugar de bloquear o permitir automáticamente, reduciendo falsos positivos en dominios sensibles.
- **Auditoría y explicabilidad de rechazos**: el informe de atribución relacional (`explanation`) permite justificar por qué se bloqueó un prompt, útil en cumplimiento normativo y en depuración de falsos positivos.
- **Evaluación de robustez de otros modelos**: usar el guardrail como sonda para medir la tasa de prompts adversariales que un LLM dado aceptaría, dentro de pipelines de red teaming automatizado.

## Benchmarks y rendimiento

El autor declara los siguientes resultados en la model card, sobre el conjunto multi-benchmark de 14.500 muestras y cinco semillas:

| Metrica | Valor declarado |
|---|---|
| F1 en OOD held-out | 93,67 % |
| FPR en XSTest (prompts seguros) | 1,49 % |
| Latencia en CPU | ~6,00 ms |
| Tamano del repo | 0,1 GB |

No se han publicado en la información disponible resultados desglosados por benchmark (MMLU, HumanEval, GSM8K u otros no aplican a un clasificador) ni comparaciones numéricas con otros guardrails. Las cifras anteriores proceden exclusivamente de la model card del autor y no han sido verificadas de forma independiente.

## Requisitos de hardware

- **VRAM**: no requiere GPU; el motor por defecto es ONNX INT8 sobre CPU.
- **GPU recomendadas**: no aplica; cualquier CPU moderna es suficiente según el autor.
- **Consumer GPU**: irrelevante para el funcionamiento, ya que la inferencia es en CPU.
- **Memoria RAM**: el repositorio ocupa 0,1 GB, por lo que la huella en memoria es muy reducida (no se detalla el consumo exacto en tiempo de ejecución).
- **Opciones de despliegue**: paquete Python `ahd-jailbreak` con runtime ONNX; middleware ASGI para FastAPI/Starlette; wrapper de clientes OpenAI/Anthropic; demo opcional con Gradio (`pip install "ahd-jailbreak[demo]"`). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- **Latencia y throughput**: latencia declarada de aproximadamente 6,00 ms por evaluación en CPU; no se publica throughput agregado ni latencia en GPU.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Rendimiento declarado |
|---|---|---|---|---|---|
| AHD-Jailbreak v1 | Clasificador de guardrail (hypergraph + MiniLM) | no disponible | historial W=5 | Apache 2.0 | F1 OOD 93,67 %, FPR 1,49 %, ~6 ms CPU |
| Llama Guard (Meta) | Clasificador de guardrail basado en LLM | no disponible en la información | no disponible | Llama Community License | no disponible en la información |
| WildGuard (Allen AI) | Clasificador de guardrail | no disponible en la información | no disponible | no disponible en la información | no disponible en la información |

No se dispone de datos verificables en la información proporcionada para establecer una comparación numérica con alternativas consolidadas como Llama Guard, WildGuard o ShieldGemma. La comparación cualitativa plausible es que AHD-Jailbreak opera en CPU con latencia muy baja y sin LLM juez, mientras que los guardrails basados en LLM requieren GPU y tienen latencias de decenas o cientos de milisegundos; sin embargo, estos últimos cuentan con validación independiente y adopción amplia, de la que AHD-Jailbreak carece.

## Limitaciones y advertencias

- **Validación independiente inexistente**: 0 descargas y 0 likes en el momento de la consulta; las métricas proceden únicamente de la model card del autor y no han sido replicadas por terceros.
- **Solo inglés**: el modelo declara únicamente `en`, por lo que su eficacia en castellano u otros idiomas no está garantizada.
- **Riesgo de falsos negativos en ataques novedosos**: al ser un clasificador entrenado sobre benchmarks concretos (WildGuardMix, WildJailbreak, JBB, XSTest, OR-Bench), puede no generalizar a tácticas de jailbreak no representadas en esos conjuntos.
- **Falsos positivos en prompts legítimos sensibles**: aunque el FPR declarado en XSTest es del 1,49 %, temas como seguridad, ciberseguridad defensiva o contenido médico podrían activar la banda de cuarentena o bloqueo.
- **Dependencia de umbrales fijos**: los cortes 0,35 y 0,70 y el umbral de calibración 0,84 están fijados por el autor; no se documenta cómo ajustarlos a dominios específicos.
- **Ventana de historial limitada**: W=5 turnos puede ser insuficiente para ataques crescendo muy lentos distribuidos en decenas de turnos.
- **Licencia Apache 2.0**: permite uso comercial, pero el autor no ofrece garantías ni soporte; conviene auditar el código del paquete antes de integrarlo en producción.
- **Dependencia de MiniLM**: la calidad del embedding subyacente condiciona la detección; no se especifica qué checkpoint exacto de MiniLM se utiliza.
- **No sustituye a otras capas de defensa**: un guardrail de pre-inferencia no protege frente a ataques en la salida del modelo ni frente a manipulaciones del propio sistema.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/shesettipavankumarswamy/ahd-jailbreak-v1
- Perfil del autor: https://huggingface.co/shesettipavankumarswamy
- Repositorio de jailbreaks de referencia (contexto de investigación): https://github.com/togg53192-cmd/jailbreaks
- No se han encontrado en la búsqueda web paper, blog técnico, repositorio del paquete `ahd-jailbreak` ni demo pública adicionales.
