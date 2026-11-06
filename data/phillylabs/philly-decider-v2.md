# PhillyLabs/philly-decider-v2

## Resumen

Philly Decider v2 es un ajuste fino (fine-tune) del modelo H2O-Lightning-4B v1.1 de H2O.ai, que a su vez es un post-entrenamiento de Qwen3.5-4B. Lo desarrolla PhillyLabs y su proposito es especializar un modelo de 4B parametros en tareas de decision: seleccion de opciones, juicios de calidad, verificacion de afirmaciones y seleccion de herramientas o APIs. El modelo no genera texto libre de forma convencional, sino que realiza una unica pasada forward por decision y produce una lectura de probabilidades sobre opciones predefinidas.

La relevancia de este modelo radica en su enfoque: en lugar de competir en generacion generalista, optimiza un caso de uso concreto (decisiones estructuradas) mediante destilacion de profesores de mayor tamano (DeepSeek V4.1-Flash, Qwen3.8-27B), manteniendo el tokenizador, la plantilla de chat y el formato de prompt del modelo base. Esto permite reutilizar toda la infraestructura de servicio de H2O (vLLM con un shim en `/v1/systemone`) sin cambios en el pipeline.

El modelo tiene 4.205.751.296 parametros, se distribuye en safetensors (8,4 GB de repositorio) y se publica bajo licencia Apache-2.0. La model card reporta una mejora de 57,92 a 61,96 en su propio scorer estilo JevBench sobre un conjunto de validacion retenido de 1.200 items.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido con atencion y capas Gated DeltaNet (heredada de Qwen3.5-4B / H2O-Lightning-4B) |
| Parametros totales | 4.205.751.296 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible de forma explicita; la model card menciona 12 items de evaluacion por encima de 6.144 tokens, lo que sugiere una ventana de al menos 6.144 tokens |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; el base se sirve con vLLM 0.30.0 en su formato nativo) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (`model.safetensors`) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del base H2O-Lightning-4B v1.1 (revision `193ad740925b176a3b70a5a13a7cff2f2fadd01e`), que es un post-entrenamiento de Qwen3.5-4B. La model card menciona explicitamente capas de atencion y capas Gated DeltaNet, lo que confirma una arquitectura hibrida entre atencion clasica y mecanismos de estado lineal. El ajuste fino aplica LoRA sobre las proyecciones de atencion, Gated DeltaNet y MLP, y el delta se fusiona en el base en fp32 con una unica operacion de redondeo (`W' = bf16(fp32 W + fp32 s B A)`). El adaptador final es un LoRA concatenado de rango 256, resultado de combinar dos rondas: `dW = dW_r1 + 0.5 × dW_r2b`.

El entrenamiento se basa en destilacion con etiquetas suaves de varios profesores. La ronda 1 usa destilacion con replay KL hacia el base H2O congelado, sobre conjuntos de datos publicos de decision (legal, cientifico, intencion, politica y calidad de respuesta). La ronda 2b continua sobre los errores de la ronda 1 y anade seleccion de herramientas y APIs (ToolBench, ToolACE, Seal-Tools, API-Bank), tablas financieras (TAT-QA, FinQA), resultados SQL ejecutados (Gretel text-to-SQL sintetico), contratos (ContractNLI, CUAD, MAUD), seguimiento de estado (MultiWOZ 2.2, Taskmaster-3, TextWorld, StateBench) y un control de politica (Aegis 2.0). Los profesores son DeepSeek V4.1-Flash (probabilidades verbalizadas por opcion), Qwen3.8-27B-FP8 (etiquetas en items de error), Chon-1.0-12B-Fast (profesor de logits donde no hay etiqueta DeepSeek) y Torchcast-4B v1.2 (solo como segundo voto si/no). Las probabilidades de los profesores se mezclan con gold y solo se usan cuando el profesor coincide con gold fiable.

La innovacion tecnica principal no esta en la arquitectura sino en el protocolo de lectura (readout): el modelo se sirve con una temperatura especifica (0,798298 para eleccion, 0,933033 para noul), un sesgo de posicion sobre las opciones 1 a 8 y una lectura de puntuacion con espejo (mirror) sobre la distribucion softmax. Todo el ajuste de readout se realizo sobre un conjunto de calibracion retenido, nunca sobre items de JevBench.

## Capacidades

- Decision estructurada: seleccion entre opciones multiples con lectura de probabilidades calibrada.
- Juicio de calidad de respuesta: evaluacion de respuestas generadas por otros modelos.
- Verificacion de afirmaciones y segundo voto si/no.
- Seleccion de herramientas y APIs en escenarios de agentes.
- Razonamiento sobre tablas financieras y resultados SQL ejecutados.
- Analisis de contratos y clausulas (ContractNLI, CUAD, MAUD).
- Seguimiento de estado en dialogos multi-turno (MultiWOZ 2.2, Taskmaster-3, StateBench).
- Clasificacion de intencion y control de politica.
- Una unica pasada forward por decision, sin generacion de tokens ni ensembles.
- Soporte de tool calling y function calling (heredado del base y reforzado en la ronda 2b con ToolBench, ToolACE, Seal-Tools y API-Bank).
- Capacidades multilingues: no disponibles de forma explicita en la informacion proporcionada.

## Casos de uso

- Enrutado de decisiones en produccion: el modelo recibe un prompt con opciones numeradas y devuelve una distribucion de probabilidad sobre ellas en una sola pasada forward, lo que permite integrarlo como clasificador de baja latencia en pipelines de orquestacion.
- Seleccion de herramientas en agentes: con el entrenamiento en ToolBench, ToolACE, Seal-Tools y API-Bank, puede elegir que herramienta o API invocar dado un contexto de conversacion, usando el shim `/v1/systemone` de H2O sobre vLLM.
- Verificacion de respuestas generadas: como segundo voto si/no sobre la salida de otro modelo de mayor tamano, util en pipelines de control de calidad o de filtrado de alucinaciones.
- Analisis de contratos: con datos de ContractNLI, CUAD y MAUD, puede clasificar clausulas y determinar si un contrato cumple una politica dada, devolviendo la opcion mas probable.
- Razonamiento sobre tablas financieras: entrenado con TAT-QA y FinQA, puede responder preguntas de opcion multiple sobre tablas financieras sin generar texto libre, lo que reduce el riesgo de alucinacion numerica.
- Seguimiento de estado en dialogos: con MultiWOZ 2.2, Taskmaster-3 y StateBench, puede mantener el estado de una conversacion multi-turno y decidir la siguiente accion del sistema.
- Control de politica y moderacion: con Aegis 2.0 como control, puede clasificar si una respuesta cumple una politica de contenido antes de enviarla al usuario.
- Evaluacion automatizada de modelos: como juez de calidad de respuestas generadas por otros modelos, con lectura calibrada de probabilidades en lugar de generacion de texto.

## Benchmarks y rendimiento

Los resultados publicados en la model card corresponden al conjunto de validacion retenido del propio autor (1.200 items nunca usados para entrenamiento ni ajuste), evaluados con su propio scorer estilo JevBench v1.6. No son resultados del board oficial de JevBench.

| Modelo, tal como se sirve | Intelligence (scorer estilo JevBench v1.6) |
|---|---|
| H2O-Lightning-4B v1.1, readout stock | 57,92 |
| Philly Decider v2 | 61,96 (servido por la ruta real vLLM + shim) |
| Philly Decider v2, sirviendo tambien los 12 items de mas de 6.144 tokens | 62,94 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio pesa 8,4 GB en safetensors; en bf16 se necesitan aproximadamente 8,5 GB solo para pesos, mas overhead de KV cache y activaciones. En fp16/bf16 cabe en GPUs consumer de 16 GB o mas (RTX 4080, RTX 4090, RTX 5080).
- Cuantizacion: no se publican pesos GGUF ni cuantizaciones oficiales; al ser un fine-tune de un base Qwen3.5-4B, es plausible convertir a GGUF con llama.cpp, pero no esta documentado por el autor.
- GPU recomendadas: RTX 4090 (24 GB) para servicio en bf16 con margen; A100 40 GB, H100 80 GB o L40S para despliegues con mayor concurrencia.
- Opciones de despliegue: el autor sirve con vLLM 0.30.0 stock y el shim de H2O en `POST /v1/systemone` mediante `bash serve.sh`. No se documentan otras opciones (llama.cpp, Ollama, TGI) para este fine-tune concreto.
- Latencia y throughput: no disponibles. El autor indica una unica pasada forward por decision, sin generacion de tokens, lo que en principio reduce la latencia frente a modelos generativos del mismo tamano.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Philly Decider v2 | 4,2B | al menos 6.144 tokens (no confirmado) | 61,96 en scorer propio del autor | Apache-2.0 | Hugging Face (49 descargas) |
| H2O-Lightning-4B v1.1 | 4B | no disponible | 57,92 en el mismo scorer | Apache-2.0 | Hugging Face (modelo base) |
| Qwen3.5-4B | 4B | no disponible | no disponible en este scorer | Apache-2.0 | Hugging Face (modelo de origen) |

No se dispone de comparaciones con otros modelos de decision especializados en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo esta especializado en decisiones estructuradas con opciones predefinidas; no es un modelo generativo generalista y no debe usarse para generacion de texto libre.
- Los resultados de rendimiento (61,96) provienen del scorer y conjunto de validacion del propio autor, no del board oficial de JevBench; no son directamente comparables con puntuaciones publicas de terceros.
- El readout esta calibrado con temperaturas y sesgos de posicion especificos (por ejemplo, sesgo negativo en las opciones 4 y 5); servir el modelo con otros parametros de muestreo puede degradar la calibracion.
- El modelo depende del shim `/v1/systemone` de H2O y de vLLM 0.30.0 para el flujo de servicio documentado; otros servidores no estan soportados oficialmente por el autor.
- Sesgos conocidos: no documentados en la model card.
- Riesgo de alucinacion: reducido por el formato de decision cerrada, pero el modelo puede asignar probabilidad alta a opciones incorrectas en items fuera de distribucion.
- Limitaciones de idioma: no se especifican los idiomas soportados; el entrenamiento se realizo sobre datasets publicos mayoritariamente en ingles.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero la `LICENSE` del repositorio es la de H2O.ai sin modificar y las modificaciones al shim estan marcadas `[v37]` en `NOTICE`; conviene revisar ambas antes de redistribuir.
- El modelo base es un post-entrenamiento de Qwen3.5-4B; hereda las limitaciones y sesgos de ese linaje.
- El autor declara que no uso items de JevBench ni OpenDecisions para entrenamiento, pero no hay verificacion independiente de esta afirmacion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/PhillyLabs/philly-decider-v2
- Modelo base: https://huggingface.co/h2oai/h2o-lightning-4b
- Modelo de origen: https://huggingface.co/Qwen/Qwen3.5-4B
- Repositorio vLLM: https://github.com/vllm-project/vllm
- No se han encontrado papers, blogs, repositorios o demos adicionales en la informacion proporcionada.
