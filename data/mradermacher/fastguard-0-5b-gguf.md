# mradermacher/fastguard-0.5b-GGUF

## Resumen

FastGuard 0.5B es un modelo especializado en seguridad (guardrail) desarrollado por el usuario vennyvirtuoso y cuantizado a formato GGUF por mradermacher. Su funcion es actuar como filtro de seguridad ligero: detecta intentos de prompt injection, jailbreak, contenido inseguro y fuga de datos personales (PII) en las entradas y salidas de otros modelos de lenguaje. Esta construido sobre la arquitectura Qwen2.5 y cuenta con aproximadamente 494 millones de parametros, lo que lo situa en la categoria de modelos ultraligeros aptos para despliegue en el borde (edge).

El modelo resuelve un problema concreto en produccion: la necesidad de una capa de moderacion rapida y barata que no consuma los recursos de un LLM grande. Al ser tan pequeno, puede ejecutarse en CPU o en GPUs de consumo, con latencias muy bajas, y devuelve clasificaciones estructuradas (structured outputs) que se integran facilmente en pipelines de agentes y aplicaciones conversacionales.

Esta ficha se centra en la version cuantizada publicada por mradermacher, que ofrece un abanico de cuantizaciones estaticas en formato GGUF (desde Q2_K hasta f16) para facilitar su uso con llama.cpp, Ollama y otras herramientas compatibles. La licencia Apache 2.0 permite uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer basada en Qwen2.5 (según tags del modelo) |
| Parametros totales | 494.032.768 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen2.5, un transformer decoder-only con atencion causal estandar, segun indican los tags del repositorio. Con 494 millones de parametros, se trata de una variante ultraligera orientada a tareas de clasificacion y moderacion mas que a generacion libre de texto. El modelo fue ajustado sobre el dataset FastGuard, segun la model card, aunque no se especifica el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se emplearon tecnicas de RLHF o DPO.

La informacion disponible no detalla innovaciones tecnicas especificas como decodificacion especulativa o atencion lineal. El aspecto mas destacable es su orientacion a structured outputs, es decir, la capacidad de devolver respuestas en formatos estructurados (probablemente JSON con etiquetas de clasificacion) que facilitan su integracion programatica en sistemas de seguridad. Las cuantizaciones publicadas por mradermacher son estaticas, sin versiones ponderadas por imatrix en el momento de la publicacion.

## Capacidades

- Deteccion de prompt injection: identifica intentos de manipular las instrucciones del sistema mediante entradas adversariales.
- Deteccion de jailbreak: clasifica intentos de eludir las politicas de seguridad del modelo objetivo.
- Deteccion de PII: senala la presencia de datos personales identificables en el texto.
- Clasificacion de contenido inseguro: etiqueta entradas o salidas potencialmente daninas.
- Structured outputs: devuelve resultados en formato estructurado apto para consumo programatico.
- Guardrail de entrada y salida: puede aplicarse tanto a las peticiones del usuario como a las respuestas del modelo vigilado.
- Capacidades multilingues: limitadas al ingles segun la model card.
- No se documentan capacidades de tool calling, agentes autonomos, vision ni audio.

## Casos de uso

- Moderacion de entrada en chatbots: colocado delante de un LLM principal, FastGuard filtra cada mensaje del usuario antes de que llegue al modelo grande, bloqueando prompt injections y jailbreaks con una latencia minima gracias a sus 0,5B de parametros.
- Proteccion de salidas en produccion: se ejecuta sobre las respuestas generadas para detectar fuga de PII o contenido inseguro antes de mostrarlo al usuario final, actuando como ultima capa de defensa.
- Filtro en pipelines RAG: valida las consultas y los documentos recuperados para evitar que contenido malicioso inyectado en la base de conocimiento llegue al modelo generativo.
- Seguridad en agentes autonomos: intercepta las acciones y observaciones de un agente multi-paso para detectar instrucciones inyectadas en herramientas externas o resultados de API comprometidos.
- Despliegue en el borde: al caber en cuantizaciones de 0,4-0,6 GB, puede ejecutarse en dispositivos con recursos limitados (Raspberry Pi, moviles, portatiles sin GPU) para moderacion local sin enviar datos a la nube.
- Cumplimiento normativo y auditoria: clasifica y registra de forma estructurada los intentos de abuso, facilitando la generacion de informes de seguridad y el cumplimiento de politicas internas.
- Pre-filtrado en pasarelas de API: integrado en un gateway de LLM, descarta peticiones maliciosas antes de consumir cuotas de modelos mas caros, reduciendo costes operativos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,4-0,6 GB con cuantizaciones Q2_K a Q8_0; en torno a 1,1 GB con f16.
- GPU recomendadas: cualquier GPU moderna es suficiente; el modelo es viable incluso en GPUs integradas. Para alto throughput, una RTX 4090 o A100 estarian sobredimensionadas pero permitirian procesar muchos lotes en paralelo.
- Cabe en GPU de consumo: si, en practicamente todas (GTX 1060 6GB, RTX 3060, RTX 4060, etc.), asi como en CPU y dispositivos de borde.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF. El modelo base puede usarse con transformers.
- Latencia y throughput estimados: no disponibles de forma oficial; por el tamano, se espera latencia de pocos milisegundos por peticion en GPU y de decenas de milisegundos en CPU, aunque no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| FastGuard 0.5B (este) | 494M | no disponible | en | apache-2.0 | GGUF, safetensors |
| Llama Guard 3 1B | 1,2B aprox. | 128K (serie Llama 3.2) | multilingue | Llama 3.2 Community License | safetensors, GGUF |
| ShieldGemma 2B | 2,6B | 8K | en | Gemma Terms of Use | safetensors, GGUF |
| Granite Guardian 2B | 2B aprox. | 128K | en | Apache 2.0 | safetensors |

La comparativa es orientativa: FastGuard 0.5B es el mas pequeno de la categoria y el unico con licencia Apache 2.0 plenamente permisiva entre las alternativas de gran difusion, lo que facilita su uso comercial. A cambio, su ventana de contexto y su cobertura multilingue no estan documentadas en la informacion disponible.

## Limitaciones y advertencias

- Solo soporta ingles segun la model card; su eficacia en castellano u otros idiomas no esta garantizada.
- La longitud de contexto no esta documentada, lo que impide planificar su uso con entradas largas.
- No hay benchmarks publicados que permitan validar su tasa de deteccion ni su tasa de falsos positivos.
- Riesgo de alucinacion en la clasificacion: al ser un modelo pequeno, puede producir etiquetas incorrectas en casos ambiguos o adversariales.
- Sesgos desconocidos: no se documenta la composicion del dataset FastGuard ni posibles sesgos en la clasificacion de contenido.
- No debe considerarse una defensa unica: conviene combinarlo con otras capas de seguridad (filtros deterministas, revision humana).
- Las cuantizaciones muy agresivas (Q2_K, Q3_K_S) pueden degradar la precision de clasificacion; se recomienda Q4_K_M o superior para produccion.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base y sus datos de entrenamiento no estan documentados en detalle.

## Enlaces

- Repositorio Hugging Face (GGUF): https://huggingface.co/mradermacher/fastguard-0.5b-GGUF
- Modelo base: https://huggingface.co/vennyvirtuoso/fastguard-0.5b
- Pagina de descargas de mradermacher: https://hf.tst.eu/model#fastguard-0.5b-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
