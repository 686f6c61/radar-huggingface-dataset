# mradermacher/prompt-guard-1.5b-GGUF

## Resumen

prompt-guard-1.5b es un modelo de clasificacion especializado en la deteccion de prompt injection, desarrollado originalmente por prismor y distribuido en formato GGUF por mradermacher. Se construye sobre Qwen2.5-1.5B mediante un ajuste fino con LoRA (herramienta unsloth) orientado a seguridad, con el objetivo de identificar intentos de manipular instrucciones en aplicaciones basadas en LLM. El modelo resuelve un problema critico en produccion: filtrar entradas maliciosas antes de que lleguen al modelo principal de un sistema conversacional o agente.

La relevancia actual del modelo radica en su tamano reducido (1.543.714.304 parametros, aproximadamente 1,5 mil millones), que permite desplegarlo como capa de defensa de baja latencia en pipelines de inferencia sin penalizar significativamente el coste computacional. Esta version GGUF facilita su ejecucion en CPU y GPU de consumo mediante llama.cpp y ecosistemas compatibles, lo que democratiza el filtrado de seguridad en entornos con recursos limitados.

La ficha describe la version cuantizada publicada por mradermacher, que incluye un espectro amplio de cuantizaciones (desde Q2_K hasta f16) bajo licencia Apache 2.0. El modelo esta entrenado exclusivamente en ingles, segun la model card, y esta pensado como clasificador binario o etiquetador de seguridad, no como modelo generativo de proposito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen2.5-1.5B) con adaptador LoRA fusionado |
| Parametros totales | 1.543.714.304 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base prismor/prompt-guard-1.5b) |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-1.5B, un transformer decoder-only con atencion causal estandar, y se ajusta mediante LoRA para la tarea de deteccion de prompt injection. La model card indica el uso de unsloth como framework de entrenamiento, lo que sugiere un ajuste eficiente en memoria sobre el modelo base. Los datasets empleados son deepset/prompt-injections y xTRam1/safe-guard-prompt-injection, ambos orientados a ejemplos de inyeccion de instrucciones y entradas adversarias.

No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion detallada del dataset ni si se aplicaron tecnicas de RLHF o DPO. La naturaleza del ajuste (LoRA sobre un modelo instructivo) y el objetivo de clasificacion sugieren un entrenamiento supervisado orientado a etiquetado de seguridad, pero no se confirman hiperparametros ni estrategias de aumento de datos. Tampoco se documentan innovaciones tecnicas como decodificacion especulativa o atencion lineal; la arquitectura subyacente es la estandar de Qwen2.5.

## Capacidades

- Clasificacion de prompt injection: identifica entradas que intentan manipular instrucciones del sistema o del usuario.
- Deteccion de entradas adversarias: entrenado con datasets especificos de seguridad (deepset/prompt-injections, xTRam1/safe-guard-prompt-injection).
- Filtrado previo a inferencia: actua como capa de guardia antes de un LLM principal.
- Soporte conversacional: la model card declara compatibilidad con endpoints y uso conversacional.
- Capacidades multilingues: limitadas al ingles segun la model card.
- Tool calling / function calling: no documentado en la informacion disponible.
- Razonamiento multi-paso y agentes: no documentado para este modelo.
- Modo thinking, vision o audio: no disponible.

## Casos de uso

- Filtrado de entrada en chatbots: el modelo se situa delante del LLM principal para etiquetar mensajes de usuario sospechosos de prompt injection antes de que alcancen el modelo de generacion, reduciendo el riesgo de manipulacion de instrucciones.
- Proteccion de agentes autonomos: en pipelines de agentes con acceso a herramientas, se usa como clasificador previo que bloquea instrucciones que intentan redirigir el comportamiento del agente.
- Moderacion de contenido en aplicaciones RAG: al procesar documentos y consultas externas, el modelo detecta inyecciones embebidas en texto recuperado antes de incluirlas en el contexto del LLM.
- Capa de seguridad en API publicas: integrado como microservicio de baja latencia (modelo de 1,5B cuantizado a Q4_K_M, aproximadamente 1,1 GB) para validar peticiones entrantes en entornos con presupuesto de computo limitado.
- Evaluacion de calidad de datasets: uso offline para etiquetar grandes volumenes de prompts y detectar ejemplos adversarios en corpus de entrenamiento o evaluacion.
- Despliegue en el borde (edge): gracias a las cuantizaciones Q2_K (0,8 GB) y Q3_K_S (0,9 GB), puede ejecutarse en dispositivos con poca memoria como filtro de seguridad local en asistentes de escritorio o moviles.
- Investigacion en seguridad de LLM: base para experimentos de robustez y evaluacion de ataques de inyeccion en entornos controlados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (segun cuantizacion):
  - Q2_K: aproximadamente 0,8 GB de pesos, en torno a 1,5-2 GB de VRAM total con contexto moderado.
  - Q4_K_M (recomendado por el autor): aproximadamente 1,1 GB de pesos, en torno a 2-3 GB de VRAM total.
  - Q8_0: aproximadamente 1,7 GB de pesos, en torno a 3-4 GB de VRAM total.
  - f16: aproximadamente 3,2 GB de pesos, en torno a 5-6 GB de VRAM total.
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM para cuantizaciones Q4/Q5 (GTX 1650, RTX 3050, RTX 4060, RTX 4090); A100 y H100 sobredimensionadas para este tamano, utiles solo en despliegues de alta concurrencia.
- Cabe en GPU consumer: si, practicamente cualquier GPU moderna con 4 GB o mas; las cuantizaciones Q2_K y Q3_K_S permiten incluso ejecucion en CPU.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF; la model card menciona compatibilidad con endpoints. Para el modelo base en safetensors, vLLM o TGI serian viables, aunque no se documentan explicitamente.
- Latencia y throughput: no disponibles en la informacion proporcionada. Por el tamano (1,5B) y las cuantizaciones Q4, se espera una latencia de milisegundos por peticion en GPU consumer, pero no se aportan mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| prompt-guard-1.5b (este) | 1,54B | no disponible | apache-2.0 | GGUF, safetensors | Clasificador de prompt injection basado en Qwen2.5-1.5B |
| prismor/prompt-guard-1.5b | 1,54B | no disponible | apache-2.0 | safetensors | Modelo base sin cuantizar del que deriva esta version |
| Qwen2.5-1.5B (base) | 1,54B | 32.768 tokens (segun documentacion publica de Qwen2.5) | apache-2.0 | safetensors, GGUF | Modelo generativo generalista; no especializado en seguridad |
| Llama Prompt Guard 2 (Meta) | no disponible en la informacion | no disponible | no disponible en la informacion | no disponible | Clasificador de prompt injection de referencia; no se dispone de datos verificados en esta ficha |

La comparativa se limita a los datos disponibles; no se han encontrado en la informacion proporcionada resultados de benchmarks que permitan contrastar rendimiento con alternativas.

## Limitaciones y advertencias

- Entrenado exclusivamente en ingles: su eficacia en castellano u otros idiomas no esta garantizada y probablemente sea reducida.
- Modelo especializado en clasificacion: no debe usarse como LLM generativo de proposito general; su valor esta en el etiquetado de seguridad.
- Riesgo de falsos positivos y falsos negativos: al ser un clasificador, puede bloquear entradas legitimas o dejar pasar ataques novedosos no representados en los datasets de entrenamiento.
- Sesgos de los datasets: deepset/prompt-injections y xTRam1/safe-guard-prompt-injection condicionan la distribucion de ataques reconocidos; tecnicas de inyeccion no cubiertas pueden evadir la deteccion.
- Alucinacion: aunque es un clasificador, la salida puede ser inconsistente en entradas ambiguas o muy largas.
- Longitud de contexto no documentada: se desconoce el limite efectivo para entradas largas, lo que afecta a la deteccion en prompts extensos.
- Licencia Apache 2.0: permite uso comercial, pero el usuario debe verificar el cumplimiento de las licencias del modelo base y de los datasets empleados.
- Version cuantizada: las cuantizaciones agresivas (Q2_K, Q3_K_S) pueden degradar la precision de clasificacion; el autor recomienda Q4_K_S o Q4_K_M para uso general.
- No se documentan garantias de robustez frente a ataques adversarios adaptativos; en produccion conviene combinarlo con otras capas de defensa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mradermacher/prompt-guard-1.5b-GGUF
- Modelo base: https://huggingface.co/prismor/prompt-guard-1.5b
- Pagina de resumen y descargas del autor: https://hf.tst.eu/model#prompt-guard-1.5b-GGUF
- Dataset deepset/prompt-injections: https://huggingface.co/datasets/deepset/prompt-injections
- Dataset xTRam1/safe-guard-prompt-injection: https://huggingface.co/datasets/xTRam1/safe-guard-prompt-injection
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de comparacion de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Preguntas frecuentes y solicitudes de modelos: https://huggingface.co/mradermacher/model_requests
