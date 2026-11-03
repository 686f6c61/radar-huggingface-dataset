# Sizhe-Chen/Llama-3.1-8B-Instruct-SecPO

## Resumen

Llama-3.1-8B-Instruct-SecPO es un ajuste fino del modelo meta-llama/Llama-3.1-8B-Instruct desarrollado por Sizhe-Chen, orientado especificamente a la defensa contra ataques de inyeccion indirecta de prompts (indirect prompt injection). El modelo parte de la arquitectura LlamaForCausalLM de 8.030.261.248 parametros y mantiene la ventana de contexto nativa de 131.072 tokens del modelo base, pero incorpora un entrenamiento adversarial online combinado con una variante de DPO denominada Secure Preference Optimization (SecPO).

La relevancia del checkpoint radica en su objetivo de seguridad: reducir la tasa de exito de ataques adaptativos que intentan redirigir al modelo mediante instrucciones maliciosas embebidas en datos no confiables (documentos, retornos de herramientas, contenido de terceros). Segun la model card, SecPO reduce la ASR al 12,3% en el ataque Genetic, 12,2% en TAP y 7,0% en PISmith, frente al 89,1%, 84,6% y 95,1% respectivamente del baseline Meta-SecAlign sin entrenamiento adversarial.

El modelo se distribuye como pesos BF16 fusionados en cuatro shards safetensors, sin necesidad de adaptador LoRA separado, y esta pensado para aplicaciones que necesiten separar explicitamente el canal de instrucciones confiables (rol `user`) del contenido no confiable (rol `input`) mediante la plantilla de chat incluida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LlamaForCausalLM; transformer causal decoder-only, solo texto |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 131.072 tokens (configuracion nativa) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (pesos publicados en BF16) |
| Idiomas soportados | en |
| Licencia | llama3.1 |
| Formato de pesos | safetensors (BF16, cuatro shards; repo de 16,1 GB) |

## Arquitectura y entrenamiento

El modelo mantiene la arquitectura transformer decoder-only de Llama 3.1 8B Instruct, sin modificaciones estructurales. La innovacion reside en el procedimiento de entrenamiento: se combina entrenamiento adversarial online (online-adaptive AT) con la perdida SecPO. SecPO modifica el lado de referencia de DPO: la politica puntua las respuestas preferidas y rechazadas sobre la entrada potencialmente inyectada, mientras que el modelo de referencia congelado las puntua sobre la entrada limpia emparejada. Esto otorga mas peso a los pares de preferencia en los que el modelo sin defensa se ve mas influido por la inyeccion.

La configuracion reportada incluye 240 pasos de ataque simulados (8 busquedas PAIR paralelas, 30 rondas cada una), 1 epoca de optimizacion con AdamW, learning rate de 1,6e-4, perdida sigmoide con beta=0,1 y precision BF16. Durante el entrenamiento se aplico LoRA de rango 64, alpha 8 y dropout 0,1 sobre q_proj, v_proj, gate_proj, up_proj y down_proj, posteriormente fusionado en los pesos publicados. El conjunto de datos asociado es un snapshot de 19.157 registros de inyecciones optimizadas, orientado a entrenamiento offline y analisis, aunque no reproduce por si solo el calendario de refresco online de ataques del run principal.

## Capacidades

- Generacion de texto conversacional en ingles, heredada del modelo base Llama 3.1 8B Instruct.
- Razonamiento de conocimiento general y matematicas (evaluado en MMLU-Pro, GPQA Diamond, GSM8K y Minerva Math).
- Seguimiento de instrucciones (AlpacaEval2 y SEP Utility).
- Defensa contra inyeccion indirecta de prompts mediante separacion explicita de roles `user` (confiable) e `input` (no confiable).
- Plantilla de chat con frontera de confianza explicita: no emite turno de sistema por defecto ni anade texto de knowledge-cutoff o fecha actual.
- Soporte de mensajes `system` explicitos cuando el llamador los proporciona (por ejemplo, para describir herramientas disponibles).
- Capacidades multilingues limitadas al ingles.
- No se documentan en la informacion disponible capacidades de vision, audio, tool calling nativo ni modo thinking.

## Casos de uso

- Procesamiento de documentos no confiables: el modelo puede recibir el documento en el rol `input` y la instruccion del usuario en el rol `user`, de modo que instrucciones maliciosas embebidas en el texto no redirijan la tarea. Aprovecha la ventana de 131.072 tokens para documentos largos.
- Agentes con retorno de herramientas externas: los resultados de APIs o servicios de terceros se colocan en el canal `input`, reduciendo el riesgo de que un atacante controle el flujo del agente mediante contenido inyectado en respuestas.
- Clasificacion y resumen de correos o tickets: el cuerpo del mensaje se trata como no confiable y la tarea de resumen como instruccion confiable, mitigando ataques de inyeccion en el cuerpo del texto.
- Analisis de contenido web scrapeado: paginas externas se pasan como `input` para extraccion de datos estructurados, con menor probabilidad de que el modelo obedezca ordenes ocultas en el HTML.
- Pipelines de atencion al cliente con contexto de terceros: conversaciones multi-turno donde la entrada del cliente y los datos recuperados de un RAG se separan por rol, manteniendo la politica del sistema.
- Evaluacion de seguridad de modelos: el checkpoint sirve como referencia defendida en estudios comparativos de ASR frente a ataques Genetic, TAP y PISmith, con los valores publicados en la model card.
- Investigacion en alineacion y preferencias: la perdida SecPO y el trainset de 19.157 registros permiten reproducir variantes offline de entrenamiento con DPO y analizar el efecto de la referencia sobre entrada limpia.

## Benchmarks y rendimiento

Resultados de utilidad (mayor es mejor), en porcentaje:

| Categoria | Benchmark | Metrica | Undefended | Meta-SecAlign | SecPO |
|---|---|---|---:|---:|---:|
| Conocimiento y razonamiento | MMLU-Pro | Puntuacion | 46,5 | 46,7 | 46,3 |
| Conocimiento y razonamiento | GPQA Diamond | Puntuacion | 23,7 | 24,2 | 24,2 |
| Matematicas | GSM8K | Puntuacion | 82,9 | 84,4 | 81,3 |
| Matematicas | Minerva Math | Puntuacion | 49,2 | 48,8 | 50,1 |
| Seguimiento de instrucciones | AlpacaEval2 | Win rate bruto | 23,7 | 24,0 | 23,7 |
| Seguimiento de instrucciones | SEP Utility | Win rate bruto | 55,4 | 55,9 | 59,4 |

Resultados de seguridad (menor ASR es mejor), en porcentaje:

| Ataque | Protocolo | Undefended | Meta-SecAlign | SecPO |
|---|---|---:|---:|---:|
| SEP | Seis plantillas estaticas | 98,1 | 1,8 | 1,4 |
| SEP Genetic Adaptive | ASR@800 search | 100,0 | 89,1 | 12,3 |
| SEP TAP Adaptive | ASR@800 search | 100,0 | 84,6 | 12,2 |
| SEP PISmith | ASR@10, atacante RL dedicado | 98,7 | 95,1 | 7,0 |

La model card menciona evaluaciones white-box adicionales (Basic Adaptive) pero los valores no estan completos en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 16 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica se recomienda 24 GB o mas para contexto largo.
- Cuantizacion: no se documentan tipos de cuantizacion en la informacion disponible; al ser pesos safetensors BF16, seria necesario convertir a GGUF u otros formatos para reducir requisitos.
- GPU recomendadas: A100 40/80 GB o H100 para servir con contexto completo de 131.072 tokens; RTX 4090 (24 GB) viable en BF16 con contexto moderado o mediante cuantizacion.
- Cabe en GPU de consumo: si, en RTX 4090 o superiores en BF16 con contexto reducido; en GPUs de 16 GB requeriria cuantizacion no publicada por el autor.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (tag `text-generation-inference`), endpoints compatibles; no se confirma soporte de vLLM, llama.cpp u Ollama en la informacion disponible.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Defensa frente a inyeccion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Llama-3.1-8B-Instruct-SecPO | 8,03 B | 131.072 | AT online + SecPO; ASR 7,0-12,3% en ataques adaptativos | llama3.1 | HuggingFace (13 descargas) |
| meta-llama/Llama-3.1-8B-Instruct (Undefended) | 8,03 B | 131.072 | Ninguna; ASR 98,1-100% | llama3.1 | HuggingFace |
| Meta-SecAlign (baseline DPO no-AT) | 8 B (sobre Llama 3.1 8B) | 131.072 | DPO estatico, 1 paso; ASR 84,6-95,1% en ataques adaptativos | llama3.1 | Referencia en la model card; disponibilidad no confirmada |

## Limitaciones y advertencias

- Solo soporta ingles; no se declaran capacidades multilingues.
- La defensa asume que la aplicacion identifica correctamente la frontera de confianza antes de la inferencia; concatenar contenido atacante en `system` o `user` anula la proteccion.
- Los ataques Genetic y TAP se miden con presupuesto ASR@800 search; con presupuestos mayores la ASR podria aumentar.
- El trainset publicado (19.157 registros) es un snapshot offline y no reproduce el calendario de refresco online de ataques del run principal, por lo que no garantiza reproducibilidad exacta.
- Riesgo de alucinacion y sesgos heredados del modelo base Llama 3.1 8B Instruct; no se documentan evaluaciones especificas de sesgo.
- La licencia llama3.1 impone restricciones de uso comercial y obligaciones de atribucion ("Built with Llama"); debe revisarse antes de produccion.
- La model card no documenta cuantizaciones oficiales ni resultados de latencia/throughput, lo que limita la planificacion de despliegue.
- El modelo tiene 13 descargas y 0 likes en el momento de la consulta; no hay evidencia de validacion independiente fuera de las evaluaciones del autor.
- Las evaluaciones de seguridad adicionales white-box estan incompletas en la informacion disponible.

## Enlaces

- HuggingFace: https://huggingface.co/Sizhe-Chen/Llama-3.1-8B-Instruct-SecPO
- Paper SecPO: https://arxiv.org/abs/2610.41998
- Codigo: https://github.com/Sizhe-Chen/SecPO
- Dataset asociado: https://huggingface.co/datasets/Sizhe-Chen/Llama-3.1-8B-Instruct-SecPO-trainset
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Referencias citadas en tags: arxiv:2403.06833, arxiv:2510.09023, arxiv:2312.02119, arxiv:2603.13026, arxiv:2507.02735
