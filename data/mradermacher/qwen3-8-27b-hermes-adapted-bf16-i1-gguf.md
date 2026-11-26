# mradermacher/Qwen3.8-27B-hermes-adapted-bf16-i1-GGUF

## Resumen

Qwen3.8-27B-hermes-adapted-bf16-i1-GGUF es una coleccion de cuantizaciones GGUF generadas por mradermacher a partir del modelo prithivMLmods/Qwen3.8-27B-hermes-adapted-bf16. No se trata de un modelo entrenado desde cero, sino de una redistribucion optimizada para inferencia local del modelo base, que a su vez deriva de la familia Qwen3.8 con un ajuste fino orientado a agentes, tool calling y entornos tipo Hermes/Harbor. El resultado son ficheros GGUF con cuantizacion ponderada mediante imatrix, pensados para ejecutarse con llama.cpp y derivados (Ollama, LM Studio, text-generation-webui, entre otros).

El modelo cuenta con 27.320.697.856 parametros totales (aproximadamente 27,3 mil millones), lo que lo situa en la gama de modelos densos de gran tamano que requieren hardware de gama alta para inferencia en precision completa, pero que gracias a las cuantizaciones IQ y K-quant pueden desplegarse en GPUs de consumo con suficiente VRAM o en configuraciones multi-GPU. La licencia es Apache 2.0, lo que facilita su uso comercial sin restricciones adicionales significativas.

La relevancia de esta ficha radica en que ofrece una via practica para desplegar un modelo de 27B con capacidades de agente y tool calling en infraestructura propia, evitando depender de APIs externas. Las cuantizaciones i1 (imatrix) de mradermacher suelen ofrecer mejor relacion calidad/tamano que las cuantizaciones estaticas equivalentes, lo que resulta especialmente util en modelos de este tamano donde cada gigabyte cuenta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen3.8, segun tags del modelo base); detalles exactos no disponibles |
| Parametros totales | 27.320.697.856 (27,3B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | i1-Q2_K, i1-Q3_K_S, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_0, i1-Q4_K_S, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K, ademas de fichero imatrix |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones i1/imatrix); el modelo base en safetensors/bf16 |

## Arquitectura y entrenamiento

La arquitectura exacta del modelo base no se detalla en la informacion disponible mas alla de que se trata de un transformer derivado de la familia Qwen3.8. Los tags del modelo base incluyen referencias a GRPO y async-GRPO (variantes de aprendizaje por refuerzo), LoRA, y un ajuste orientado a agentes, tool calling y entornos Hermes/Harbor. Esto sugiere que el modelo base fue sometido a un post-entrenamiento con tecnicas de RL (GRPO) sobre datasets especificos de tareas de agente y evaluacion de terminal (termgrade), ademas de un ajuste LoRA.

Los datasets citados en la model card son harness-hub/scale800-harbor, harness-hub/harness-adapters, harness-hub/termgrade-train-harbor y ai-and/termgrade-environments, todos ellos orientados a entornos de agente, adaptadores de herramientas y evaluacion de tareas tipo terminal. El numero de tokens de entrenamiento, la composicion exacta del dataset y los detalles de la fase de RLHF/DPO no estan disponibles en la informacion proporcionada. La cuantizacion i1 de mradermacher emplea un fichero imatrix para ponderar la cuantizacion, lo que mejora la calidad respecto a cuantizaciones estaticas del mismo tamano.

## Capacidades

- Generacion de texto conversacional en ingles.
- Razonamiento multi-paso y soporte de agentes (tags agents, harbor, openenv).
- Tool calling / function calling (tags harness-adapters, hermes).
- Capacidades de vision: la model card indica explicitamente "This is a vision model", con ficheros mmproj disponibles en el repositorio estatico.
- Decodificacion especulativa (tags mtp, speculative-decoding).
- Compatibilidad con text-generation-inference (tag text-generation-inference).
- Ajuste especifico para tareas de terminal y evaluacion de entornos (termgrade).
- Idiomas: unicamente ingles segun la model card.

## Casos de uso

- Agentes autonomos de terminal: el ajuste sobre datasets termgrade y harbor sugiere que el modelo esta optimizado para interpretar comandos de shell, ejecutar tareas en entornos controlados y razonar sobre la salida, lo que lo hace adecuado para agentes de automatizacion de sistemas.
- Tool calling en pipelines de produccion: gracias al ajuste con harness-adapters y hermes, el modelo puede invocar funciones externas de forma estructurada, integrandose en orquestadores de agentes que requieran llamadas a APIs, bases de datos o servicios internos.
- Asistente de codigo en local: con 27,3B parametros y cuantizacion Q4_K_M (17,1 GB), puede desplegarse en una RTX 4090 o A6000 para autocompletado, refactorizacion y explicacion de codigo sin enviar datos a la nube.
- Procesamiento de documentos con vision: al ser un modelo de vision, puede emplearse para extraer informacion de capturas de pantalla, diagramas o documentos escaneados en flujos de automatizacion, usando los ficheros mmproj del repositorio estatico.
- Evaluacion automatizada de entornos de agente: el ajuste sobre termgrade-environments lo hace util como juez o ejecutor en benchmarks de agentes, generando trayectorias y evaluando resultados en entornos simulados.
- Despliegue en infraestructura propia con llama.cpp/Ollama: las cuantizaciones i1 permiten servir el modelo en estaciones de trabajo con 24-48 GB de VRAM, evitando costes de API y manteniendo la soberania del dato.
- Investigacion en decodificacion especulativa: el tag mtp (multi-token prediction) y speculative-decoding lo convierten en candidato para experimentos de aceleracion de inferencia en llama.cpp.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia segun cuantizacion:
  - i1-Q2_K: ~11,3 GB (calidad baja, solo para pruebas).
  - i1-IQ3_M / i1-Q3_K_M: ~13,1-13,8 GB.
  - i1-Q4_K_M: ~17,1 GB (recomendado para uso general).
  - i1-Q5_K_M: ~19,7 GB.
  - i1-Q6_K: ~22,5 GB (practicamente como Q6_K estatico).
- GPU recomendadas:
  - RTX 4090 (24 GB): cabe en Q4_K_M, Q5_K_M y Q6_K con contexto moderado.
  - RTX 3090 (24 GB): igual que la 4090, con menor throughput.
  - A6000 (48 GB): permite Q6_K con contexto amplio y margen para KV cache.
  - A100 40/80 GB y H100: despliegue en bf16 o cuantizaciones altas con alto throughput.
  - Configuraciones multi-GPU (2x RTX 3090/4090) para contexto largo o bf16.
- Cabe en GPU de consumo: si, en RTX 3090/4090 (24 GB) con cuantizaciones Q4-Q6; en GPUs de 16 GB solo con Q2/Q3 y contexto reducido.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, koboldcpp; el tag text-generation-inference sugiere compatibilidad con TGI, aunque el formato GGUF es mas natural en llama.cpp. El modelo base en bf16 puede servirse con vLLM o TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B-hermes-adapted-bf16-i1-GGUF (este) | 27,3B | No disponible | Apache 2.0 | GGUF (i1) | Ajuste para agentes, tool calling y vision; solo ingles |
| Qwen3.8-27B-hermes-adapted-bf16 (base) | 27,3B | No disponible | Apache 2.0 | safetensors/bf16 | Modelo base sin cuantizar; requiere mas VRAM |
| Qwen3.8-27B-hermes-adapted-bf16-GGUF (estatico) | 27,3B | No disponible | Apache 2.0 | GGUF (estatico) | Misma base, cuantizacion sin imatrix; incluye mmproj para vision |
| Alternativas de ~27B densos | ~27B | No disponible | Variable | Variable | No se dispone de datos de benchmarks para comparar rendimiento |

No se dispone de datos de benchmarks que permitan una comparacion cuantitativa de rendimiento con alternativas de la misma categoria.

## Limitaciones y advertencias

- Solo soporta ingles segun la model card; el rendimiento en castellano no esta garantizado y probablemente sea inferior.
- Riesgo de alucinacion inherente a los modelos de 27B, especialmente en tareas de agente donde una accion erronea puede tener consecuencias reales (ejecucion de comandos de terminal).
- Las cuantizaciones de baja calidad (Q2_K, Q3_K_S) degradan notablemente el rendimiento; se recomienda Q4_K_M o superior para produccion.
- El ajuste esta orientado a entornos Hermes/Harbor/termgrade, lo que puede sesgar el comportamiento hacia ese tipo de tareas y reducir la generalidad en otros dominios.
- Aunque la licencia es Apache 2.0, conviene verificar las condiciones del modelo base original de Qwen y de los datasets de ajuste antes de un uso comercial a gran escala.
- El modelo base incluye vision, pero los ficheros mmproj estan en el repositorio estatico, no en este; para usar vision hay que descargarlos por separado.
- No hay informacion publica sobre sesgos especificos, longitud de contexto real ni resultados de evaluacion; cualquier despliegue en produccion deberia acompanarse de evaluacion propia.
- El tag mtp/speculative-decoding implica que el modelo puede requerir configuracion especifica en llama.cpp para aprovechar la decodificacion especulativa; sin ella, el rendimiento sera el estandar de un denso de 27B.

## Enlaces

- Repositorio Hugging Face (este modelo): https://huggingface.co/mradermacher/Qwen3.8-27B-hermes-adapted-bf16-i1-GGUF
- Modelo base: https://huggingface.co/prithivMLmods/Qwen3.8-27B-hermes-adapted-bf16
- Cuantizaciones estaticas (incluye mmproj): https://huggingface.co/mradermacher/Qwen3.8-27B-hermes-adapted-bf16-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#Qwen3.8-27B-hermes-adapted-bf16-i1-GGUF
- FAQ y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- nethype GmbH: https://www.nethype.de/
