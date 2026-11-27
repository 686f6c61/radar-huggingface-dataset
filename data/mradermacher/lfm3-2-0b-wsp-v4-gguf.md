# mradermacher/LFM3-2.0B-WSP-V4-GGUF

## Resumen

LFM3-2.0B-WSP-V4-GGUF es la versión cuantizada en formato GGUF del modelo Sayansantra/LFM3-2.0B-WSP-V4, un modelo de lenguaje de aproximadamente 2.000 millones de parámetros construido sobre la arquitectura LFM3 (Liquid Foundation Model, tercera generación) y especializado en capacidades agénticas de tool calling y function calling. La cuantización la firma mradermacher, un publicador habitual de versiones GGUF de modelos open source, que ofrece el modelo en múltiples niveles de compresión (desde Q2_K hasta f16) para facilitar su despliegue en hardware de consumo.

El modelo base incorpora una técnica denominada weight-space programming (WSP) con fusión de task vectors y expansión de capas, una aproximación que combina pesos de distintos modelos especializados mediante aritmética en el espacio de pesos para obtener un modelo final con capacidades reforzadas en dominios concretos. En este caso, el foco está en el entrenamiento y ajuste sobre datasets de function calling y trayectorias agénticas, como Berkeley Function-Calling Leaderboard (BFCL) y distintos conjuntos de trayectorias de tool calling.

Su relevancia actual radica en que ofrece un modelo pequeño (2B parámetros) optimizado para agentes y llamadas a herramientas, lo que permite ejecutarlo en GPU de consumo o incluso en CPU con cuantizaciones agresivas. Sin embargo, conviene señalar que el modelo está etiquetado únicamente para inglés, cuenta con una licencia lfm1.0 de tipo "other" que debe revisarse antes de uso comercial y no dispone de datos publicados de benchmarks en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LFM3 (Liquid Foundation Model, tercera generación); detalles de atención y capas no disponibles |
| Parametros totales | 2.017.366.080 (aprox. 2,0B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (inglés) |
| Licencia | lfm1.0 (license_name: lfm1.0; license: other) |
| Formato de pesos | GGUF (cuantizaciones estáticas); el modelo base en safetensors |
| Tamano del repo | 18,4 GB (incluye todas las cuantizaciones) |

## Arquitectura y entrenamiento

El modelo base es un LFM3 (Liquid Foundation Model de tercera generación) de aproximadamente 2.000 millones de parámetros. La model card del repositorio GGUF no detalla la arquitectura interna (tipo de atención, número de capas, dimensión oculta ni longitud de contexto), por lo que esos datos deben considerarse no disponibles. La innovación declarada por el autor del modelo base es el uso de weight-space programming: una técnica de fusión de task vectors en el espacio de pesos combinada con expansión de capas, que permite componer capacidades de distintos modelos especializados sin un reentrenamiento completo.

En cuanto a los datos de entrenamiento y ajuste, la model card lista cuatro datasets: Berkeley-Function-Calling-Leaderboard (gorilla-llm), deepseek-v4-pro-agent-tool-calling-trajectory (zake7749), agenttracer-bfcl (Motif-Technologies) y fable-5-premium (saidutta69). Estos conjuntos están orientados a function calling, trayectorias agénticas y evaluación de tool calling, lo que explica la especialización del modelo. No se especifica el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron fases de RLHF o DPO. Esta versión concreta es una cuantización estática realizada por mradermacher; no se ofrecen cuantizaciones ponderadas o con imatrix en el momento de la publicación.

## Capacidades

- Generación de texto conversacional en inglés, con formato de chat (tag conversational).
- Function calling y tool calling: el modelo está entrenado y ajustado específicamente sobre datasets de llamadas a funciones y trayectorias de agentes.
- Razonamiento agéntico multi-paso: los datasets de trayectorias (agent-tool-calling-trajectory, agenttracer-bfcl) apuntan a soporte de flujos de agente con múltiples llamadas a herramientas.
- Integración con el ecosistema BFCL (Berkeley Function-Calling Leaderboard) como referencia de evaluación.
- Compatibilidad con endpoints (tag endpoints_compatible) para despliegue como servicio.
- Capacidades multilingües: limitadas al inglés según la model card.
- No se declaran capacidades de visión, audio ni modo de razonamiento explícito (thinking mode).

## Casos de uso

- Agentes de automatización de tareas: el modelo puede orquestar llamadas a APIs y herramientas en flujos multi-paso, aprovechando su ajuste específico sobre trayectorias agénticas y BFCL para decidir qué función invocar en cada turno.
- Asistentes de desarrollo con acceso a herramientas: integrado en un IDE o CLI, puede generar llamadas a funciones (ejecutar tests, consultar repositorios, lanzar builds) dentro de pipelines de CI/CD, con la ventaja de su reducido tamaño para ejecución local.
- Enrutamiento de consultas y clasificación con salida estructurada: su entrenamiento en function calling lo hace adecuado para tareas de extracción de parámetros y generación de JSON estructurado en backends de atención al cliente.
- Prototipado rápido de agentes en hardware de consumo: con cuantizaciones Q4_K_M (1,4 GB) puede ejecutarse en portátiles y estaciones de trabajo sin GPU dedicada, lo que facilita iterar sobre diseños de agentes antes de escalar a modelos mayores.
- Automatización de back-office con herramientas internas: conexión a sistemas de ticketing, CRM o bases de datos mediante esquemas de funciones, con despliegue en servidores modestos o en el borde.
- Evaluación y benchmarking de pipelines de tool calling: útil como modelo de referencia ligero para comparar implementaciones de function calling y validar integraciones con frameworks de agentes.
- Chatbot conversacional de dominio limitado en inglés: para asistentes con contexto acotado donde el coste por inferencia y la huella de memoria son críticos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio GGUF no incluye métricas de MMLU, HumanEval, GSM8K ni resultados BFCL, y tampoco se proporcionan datos del modelo base en la información facilitada.

## Requisitos de hardware

- VRAM estimada para inferencia (pesos): Q2_K ~1,0 GB; Q4_K_M ~1,4 GB; Q5_K_M ~1,6 GB; Q6_K ~1,8 GB; Q8_0 ~2,3 GB; f16 ~4,1 GB. Añadir margen para KV cache y overhead del runtime (típicamente 0,5-2 GB según contexto).
- GPU recomendadas: cualquier GPU consumer con 4-8 GB de VRAM es suficiente en cuantizaciones Q4-Q8 (RTX 3060, RTX 4060, RTX 4090); en entornos de servidor, A100/H100 no son necesarias y resultarían sobredimensionadas.
- Cabe en GPU consumer: sí, en todas las cuantizaciones; incluso en iGPU o CPU con Q4_K_S/Q4_K_M.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y otros runtimes compatibles con GGUF; el modelo base en safetensors puede servirse con vLLM o TGI si se dispone de la arquitectura LFM3 soportada.
- Latencia y throughput estimados: no disponibles; dependerán del hardware y del runtime. Por el tamaño (2B), se espera baja latencia en GPU consumer, pero no se aportan cifras verificables.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Formato |
|---|---|---|---|---|---|
| LFM3-2.0B-WSP-V4-GGUF | ~2,0B | no disponible | Tool calling / agentes | lfm1.0 (other) | GGUF |
| Qwen2.5-1.5B-Instruct | 1,5B | 32K (según versión) | Instrucciones generales, tool calling | Apache 2.0 | safetensors, GGUF |
| Llama-3.2-1B-Instruct | 1,2B | 128K | Instrucciones generales, tool calling | Llama 3.2 Community | safetensors, GGUF |
| SmolLM2-1.7B-Instruct | 1,7B | 8K | Instrucciones generales | Apache 2.0 | safetensors, GGUF |

Nota: los datos de los modelos comparativos corresponden a conocimiento general de esos modelos; no se dispone de comparación de rendimiento publicada para LFM3-2.0B-WSP-V4 en la información facilitada. La ventaja diferencial del modelo es su ajuste específico en trayectorias agénticas y BFCL; su desventaja, la licencia restrictiva y el soporte exclusivo de inglés.

## Limitaciones y advertencias

- Idiomas: solo se declara inglés; el rendimiento en castellano u otros idiomas no está garantizado y probablemente sea deficiente.
- Licencia: lfm1.0 con license "other"; es imprescindible revisar el archivo LICENSE del modelo base antes de cualquier uso comercial, ya que puede imponer restricciones.
- Contexto: no se documenta la longitud de contexto, lo que impide planificar aplicaciones con ventanas largas sin verificación empírica.
- Alucinación: no hay datos de evaluación que cuantifiquen la tasa de alucinación; en modelos pequeños de 2B el riesgo es inherentemente mayor, especialmente en razonamiento factual.
- Sesgos: no se documentan análisis de sesgo; los datasets de trayectorias agénticas pueden introducir sesgos de dominio y de formato.
- Cuantizaciones: las versiones Q2_K-Q3_K pierden calidad de forma notable; para producción se recomienda Q4_K_M o superior. No hay cuantizaciones imatrix/ponderadas disponibles, lo que limita optimizaciones finas.
- Madurez: el repositorio tiene 0 descargas y 0 likes en el momento de la ficha; es un artefacto reciente y sin validación comunitaria.
- Técnica WSP: la fusión de task vectors y expansión de capas puede producir comportamientos menos predecibles que un ajuste supervisado convencional; conviene validar exhaustivamente en el dominio objetivo.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/LFM3-2.0B-WSP-V4-GGUF
- Modelo base: https://huggingface.co/Sayansantra/LFM3-2.0B-WSP-V4
- Página de descargas del cuantizador: https://hf.tst.eu/model#LFM3-2.0B-WSP-V4-GGUF
- Dataset BFCL: https://huggingface.co/datasets/gorilla-llm/Berkeley-Function-Calling-Leaderboard
- Dataset de trayectorias agénticas: https://huggingface.co/datasets/zake7749/deepseek-v4-pro-agent-tool-calling-trajectory
- Dataset agenttracer-bfcl: https://huggingface.co/datasets/Motif-Technologies/agenttracer-bfcl
- Dataset fable-5-premium: https://huggingface.co/datasets/saidutta69/fable-5-premium
- Guía de uso de GGUF (referencia TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantización de mradermacher: https://huggingface.co/mradermacher/model_requests
- Análisis de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
