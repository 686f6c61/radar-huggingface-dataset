# mradermacher/FNova-1.7B-Agent-v1-GGUF

## Resumen

FNova-1.7B-Agent-v1 es un modelo de lenguaje de 1.720.574.976 parámetros (aproximadamente 1,7 mil millones) afinado mediante SFT (supervised fine-tuning) para tareas de agentes, con especial énfasis en tool calling y function calling. Está construido sobre la familia Qwen3 (según los tags del repositorio) y ha sido desarrollado por el usuario Fengnan001, mientras que la versión aquí descrita es una cuantización estática en formato GGUF publicada por mradermacher. Su propósito es ofrecer un modelo compacto capaz de gestionar llamadas a herramientas y flujos de agente en entornos con recursos limitados.

El modelo se entrenó sobre el dataset nvidia/Nemotron-SFT-Agentic-v4, lo que lo orienta específicamente a interacciones agénticas: selección de herramientas, generación de argumentos estructurados y razonamiento multi-paso. Al tener solo 1,7B de parámetros, es adecuado para despliegues en GPU de consumo y para escenarios de latencia baja donde un modelo mayor resultaría excesivo.

La relevancia actual radica en la creciente demanda de modelos pequeños especializados en agentes que puedan ejecutarse localmente y en paralelo, sin depender de APIs externas. La licencia Apache 2.0 facilita su integración comercial. No obstante, la información pública disponible es escasa: no se detallan la longitud de contexto, los datos exactos de entrenamiento ni resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3, segun tags del repositorio) |
| Parametros totales | 1.720.574.976 (aproximadamente 1,7B) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | chino (zh) e ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones estaticas); el modelo base esta en safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente corresponde a la familia Qwen3, un transformer decoder-only, segun los tags del repositorio. El modelo base Fengnan001/FNova-1.7B-Agent-v1 fue afinado mediante SFT sobre el dataset nvidia/Nemotron-SFT-Agentic-v4, un conjunto orientado a comportamiento agéntico. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion detallada del dataset, ni si se aplicaron etapas de RLHF o DPO.

La innovacion principal del repositorio descrito no reside en la arquitectura, sino en la distribucion de cuantizaciones GGUF estaticas generadas por mradermacher, que permiten ejecutar el modelo en un rango amplio de hardware, desde configuraciones muy ajustadas (Q2_K, 0,9 GB) hasta precision casi completa (f16, 3,5 GB). El autor de las cuantizaciones indica que no hay cuantizaciones ponderadas/imatrix disponibles en el momento de la publicacion.

## Capacidades

- Generacion de texto conversacional en chino e ingles.
- Tool calling y function calling: el modelo esta entrenado especificamente para emitir llamadas a herramientas con argumentos estructurados.
- Comportamiento agéntico: razonamiento multi-paso orientado a la seleccion y ejecucion de herramientas.
- Integracion con endpoints compatibles (tag endpoints_compatible).
- No se documentan capacidades de vision, audio ni modo de razonamiento extendido (thinking mode).

## Casos de uso

- Agentes locales de automatizacion: el modelo puede orquestar llamadas a APIs y funciones en un bucle de agente ejecutado en una sola GPU de consumo, gracias a su tamano de 1,7B y a las cuantizaciones de 1-2 GB.
- Enrutamiento de herramientas en pipelines: dado su entrenamiento en function calling, puede usarse como clasificador/selector de la herramienta adecuada antes de invocar un modelo mayor, reduciendo coste y latencia.
- Asistentes de escritorio y CLI: integrable con llama.cpp u Ollama para ofrecer un asistente que ejecute comandos y consulte ficheros locales en maquinas sin GPU dedicada.
- Prototipado rapido de flujos agénticos: util para validar disenos de prompts y esquemas de herramientas en fase de desarrollo antes de escalar a modelos mayores.
- Despliegue en el borde (edge): su huella de memoria (desde 0,9 GB en Q2_K) permite ejecutarlo en dispositivos con recursos limitados o en contenedores con restricciones estrictas.
- Procesamiento por lotes de tareas estructuradas: al ser pequeno, permite alto throughput en GPUs como la RTX 4090 ejecutando varias instancias en paralelo para tareas de extraccion y llamada a funciones.
- Aplicaciones bilingues chino-ingles: adecuado para entornos donde se requiera alternar entre ambos idiomas en la misma conversacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos): aproximadamente 0,9 GB (Q2_K), 1,2 GB (Q4_K_M), 1,5 GB (Q6_K), 1,9 GB (Q8_0) y 3,5 GB (f16). Hay que anadir el espacio para el contexto KV cache, cuyo tamano depende de la longitud de contexto, no disponible.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM para cuantizaciones Q4/Q5; RTX 3060, RTX 4060, RTX 4090, A100 o H100 para despliegues de mayor throughput.
- Cabe en GPU de consumo: si, practicamente en cualquier GPU moderna con 4 GB o mas; las cuantizaciones Q2_K y Q3 pueden ejecutarse incluso en iGPU o CPU.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama, y servidores compatibles con endpoints (tag endpoints_compatible). Para el modelo base en safetensors, vLLM o TGI serian opciones, aunque no se confirman en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| FNova-1.7B-Agent-v1 (este) | 1,7B | no disponible | Apache 2.0 | GGUF, safetensors | Afinado para tool calling sobre Nemotron-SFT-Agentic-v4 |
| Qwen3-1.7B | 1,7B | no disponible | Apache 2.0 | safetensors, GGUF | Modelo base de la familia; capacidades generales |
| Otros modelos pequenos para agentes | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la informacion proporcionada |

No se dispone de datos de rendimiento comparativo (benchmarks) para establecer una comparacion cuantitativa con alternativas.

## Limitaciones y advertencias

- Idiomas limitados a chino e ingles; no se garantiza un rendimiento adecuado en castellano u otros idiomas.
- Longitud de contexto no documentada; puede ser insuficiente para conversaciones o documentos largos.
- Riesgo de alucinacion inherente a modelos de 1,7B, especialmente en tareas de razonamiento complejo o conocimiento factual.
- El entrenamiento se limita a SFT sobre un dataset agéntico; no consta RLHF/DPO, por lo que el alineamiento y la robustez frente a prompts adversarios pueden ser limitados.
- No se han publicado evaluaciones de sesgo ni de seguridad.
- Aunque la licencia es Apache 2.0 (permite uso comercial), conviene verificar las condiciones del modelo base Fengnan001/FNova-1.7B-Agent-v1 y del dataset nvidia/Nemotron-SFT-Agentic-v4 antes de un despliegue en produccion.
- Las cuantizaciones de baja precision (Q2_K, Q3) degradan la calidad; para uso agéntico se recomienda Q4_K_M o superior.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validacion por parte de la comunidad.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/FNova-1.7B-Agent-v1-GGUF
- Modelo base: https://huggingface.co/Fengnan001/FNova-1.7B-Agent-v1
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#FNova-1.7B-Agent-v1-GGUF
- Dataset de entrenamiento: https://huggingface.co/datasets/nvidia/Nemotron-SFT-Agentic-v4
- Guia de uso de GGUF (referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
