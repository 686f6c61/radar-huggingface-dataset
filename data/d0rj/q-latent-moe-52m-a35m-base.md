# d0rj/q-latent-moe-52M-A35M-base

## Resumen

q-latent-moe-52M-A35M-base es un modelo de lenguaje causal en ingles desarrollado por el usuario d0rj dentro de un experimento de ablacion denominado "tiny-llm-ablation". Se trata de un modelo pequeno entrenado desde cero (tag from-scratch) sobre el dataset HuggingFaceFW/fineweb-edu, con 51.616.000 parametros totales segun los pesos en safetensors. El sufijo del nombre (52M-A35M) indica una arquitectura de mezcla de expertos (MoE) con aproximadamente 52 millones de parametros totales y unos 35 millones activos por token, lo que lo situa en la categoria de modelos ultraligeros orientados a estudiar la relacion entre precision, FLOPs y parametros.

El modelo emplea codigo personalizado (tags custom_code y q_latent_moe), por lo que requiere trust_remote_code=True para cargarse con transformers. Su relevancia es fundamentalmente experimental: sirve como punto de comparacion frente a su hermano denso d0rj/q-51M-base dentro de la misma ablacion, y permite reproducir a muy baja escala el comportamiento de arquitecturas MoE latentes como la descrita en el trabajo LatentMoE de Elango et al. (NVIDIA). No es un modelo destinado a produccion, sino a investigacion sobre eficiencia de parametros y datos de entrenamiento.

El modelo tiene 0 descargas y 0 likes en el momento de la consulta, se publico en octubre de 2026 y su licencia no esta declarada. Solo soporta ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos latente (q_latent_moe), transformer causal para generacion de texto |
| Parametros totales | 51.616.000 (segun safetensors) |
| Parametros activos | No disponible (el sufijo A35M del nombre sugiere del orden de 35M activos) |
| Longitud de contexto | No disponible (las evaluaciones se realizaron con max_length 2048 y 1024) |
| Tipos de cuantizacion | No disponible (no se publican conversiones GGUF, AWQ ni GPTQ) |
| Idiomas soportados | Ingles (en) |
| Licencia | No disponible |
| Formato de pesos | safetensors |
| Tamano del repositorio | 0,2 GB |
| Requiere codigo remoto | Si (custom_code) |
| Dataset de entrenamiento | HuggingFaceFW/fineweb-edu |

## Arquitectura y entrenamiento

La informacion disponible no incluye una descripcion detallada de la arquitectura en la model card. Los tags q_latent_moe y custom_code, junto con el nombre del modelo, apuntan a una implementacion de mezcla de expertos en espacio latente (LatentMoE). La referencia mas proxima encontrada es la implementacion de kyegomez/Latent-MoE, que reproduce el trabajo "Toward Optimal Accuracy per FLOP and Parameter in Mixture of Experts" de Elango et al. (NVIDIA, 2026), una capa MoE disenada para sustituir directamente la FFN de un transformer estandar. El modelo esta etiquetado como causal-lm, pretrained y from-scratch, y su tamano de 51,6 millones de parametros lo situa en el rango de los modelos "tiny" usados en estudios de escalado.

En cuanto al entrenamiento, la model card no especifica el numero de tokens ni la composicion exacta del dataset mas alla de HuggingFaceFW/fineweb-edu. Como referencia del mismo experimento de ablacion, el modelo hermano denso d0rj/q-51M-base declara haberse entrenado desde cero con 3.932.160.000 tokens fuente en 15.000 pasos de optimizador; no se confirma que este modelo MoE haya usado la misma configuracion. No hay informacion sobre fases de RLHF, DPO, SFT ni sobre innovaciones tecnicas adicionales (decodificacion especulativa, atencion lineal, etc.). La presencia de tensorboard en los tags sugiere que el autor publico curvas de entrenamiento, aunque no se detallan en la informacion proporcionada.

## Capacidades

- Generacion de texto autoregresiva en ingles, con pipeline text-generation.
- Modelo base (no ajustado por instrucciones): no tiene modo chat, ni plantillas de instrucciones publicadas.
- Razonamiento de sentido comun limitado, medido en tareas de continuacion (HellaSwag, PIQA, WinoGrande, COPA).
- Resolucion de preguntas de opcion multiple de nivel elemental (ARC-Easy, ARC-Challenge, OpenBookQA).
- Inferencia de tipo si/no sobre contextos cortos (BoolQ).
- Aritmetica basica evaluada mediante ArithMark-3.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No dispone de vision, audio ni modo "thinking".
- Multilingue: no; solo ingles.

## Casos de uso

- Investigacion sobre eficiencia de parametros: el modelo sirve como punto de comparacion controlado frente al denso q-51M-base para medir la ganancia (o perdida) de una capa MoE latente en un presupuesto de ~52M de parametros totales.
- Ablaciones de arquitectura desde cero: al ser from-scratch y estar publicado como parte de una ablacion, permite reproducir variaciones de enrutamiento de expertos, numero de expertos y top-k sin depender de pesos preentrenados de terceros.
- Docencia y prototipado de pipelines de entrenamiento: su tamano (0,2 GB de repositorio) permite entrenar y evaluar ciclos completos en una unica GPU de consumo o incluso en CPU para pruebas de humo.
- Evaluacion de arneses de benchmark en modelos tiny: se puede usar para validar la implementacion de lm-evaluation-harness con tareas como HellaSwag, ARC o BoolQ, verificando que los numeros coinciden con los publicados en la model-index.
- Experimentos de cuantizacion extrema: con 51,6M de parametros, cabe en cuantizaciones de 4 bits por debajo de 30 MB, util para estudiar la degradacion de la perplejidad en el limite.
- Generacion de texto de relleno y estudios de continuacion: para analizar distribuciones de probabilidad de continuacion a nivel de token en frases cortas en ingles, sin expectativas de calidad conversacional.
- Base para fine-tuning especifico de dominio en ingles cuando el presupuesto de computo es minimo (clasificacion, etiquetado de secuencias, extraccion de caracteristicas).

## Benchmarks y rendimiento

Resultados declarados por el autor en la model-index, en bfloat16, 0-shot y con protocolo de comparacion completa. Todos marcados como no verificados (verified: false).

| Benchmark | Metrica | Valor | Error estandar | IC 95% | max_length |
|---|---|---|---|---|---|
| HellaSwag (validation) | acc_norm | 0,2907 | 0,00453 | 0,2819 - 0,2996 | 2048 |
| ARC-Easy (test) | acc_norm | 0,4268 | 0,01015 | 0,4070 - 0,4468 | 2048 |
| ARC-Challenge (test) | acc_norm | 0,2338 | 0,01237 | 0,2105 - 0,2589 | 2048 |
| PIQA (validation) | acc_norm | 0,6012 | 0,01142 | 0,5786 - 0,6233 | 2048 |
| WinoGrande XL (validation) | acc | 0,5201 | 0,01404 | 0,4926 - 0,5475 | 2048 |
| OpenBookQA (test) | acc_norm | 0,3140 | 0,02078 | 0,2749 - 0,3560 | 2048 |
| BoolQ (validation) | acc | 0,6141 | 0,00851 | 0,5973 - 0,6306 | 2048 |
| LAMBADA OpenAI (test) | acc | 0,2084 | 0,00566 | 0,1976 - 0,2197 | 2048 |
| ArithMark-3 (train) | acc_norm | 0,3800 | 0,01536 | 0,3504 - 0,4105 | 1024 |
| Balanced COPA (train) | acc | No disponible (dato truncado en la informacion) | - | - | - |

No se han publicado resultados de benchmark adicionales (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM en bfloat16: aproximadamente 103 MB solo para pesos (51,6M x 2 bytes), mas activaciones y cache KV, por lo que en la practica cabe en menos de 1 GB.
- VRAM en fp32: aproximadamente 206 MB para los pesos.
- VRAM en int8: aproximadamente 52 MB; en int4, aproximadamente 26 MB (conversiones no publicadas, estimacion teorica).
- GPU recomendadas: cualquier GPU moderna, incluidas RTX 3060, RTX 4060, RTX 4090, A100, H100. El modelo no necesita GPU dedicada de datacenter.
- GPU de consumo: si, cabe holgadamente en cualquier GPU de consumo con al menos 2 GB de VRAM, y tambien en iGPU con memoria compartida.
- CPU: la inferencia en CPU es totalmente viable dado el tamano; util para entornos sin GPU.
- Opciones de despliegue: transformers con trust_remote_code=True (requerido por custom_code). No hay pesos GGUF publicados para llama.cpp u Ollama, ni confirmacion de compatibilidad con vLLM o TGI, que ademas requeririan soporte explicito para el codigo personalizado del modelo.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Arquitectura |
|---|---|---|---|---|---|
| d0rj/q-latent-moe-52M-A35M-base | 51,6M (MoE) | No disponible | No disponible | HuggingFace, safetensors | MoE latente causal |
| d0rj/q-51M-base | 50,9M | No disponible | No disponible | HuggingFace | Denso causal |
| Pythia-70M (EleutherAI) | 70M | 2048 | Apache-2.0 | HuggingFace, ampliamente replicado | Transformer denso causal |
| GPT-2 small (OpenAI) | 124M | 1024 | Modified MIT | HuggingFace, muy extendido | Transformer denso causal |

El modelo hermano d0rj/q-51M-base pertenece al mismo experimento de ablacion y es la referencia directa para medir el efecto de la capa MoE latente. Pythia-70M y GPT-2 small se incluyen como lineas base tipicas de la categoria "tiny" por tamano y contexto, pero no se dispone de sus resultados en los mismos benchmarks con el mismo protocolo, por lo que la comparacion cuantitativa de rendimiento no esta disponible.

## Limitaciones y advertencias

- Modelo base sin ajuste por instrucciones: no sigue ordenes, no mantiene conversaciones y puede producir texto incoherente si se usa como asistente.
- Riesgo elevado de alucinacion: con 51,6M de parametros, la capacidad de almacenar conocimiento factual es muy limitada y sus resultados en tareas de conocimiento (HellaSwag 0,29; LAMBADA 0,21) estan cerca o por debajo del azar en varios casos.
- Idioma unico: solo ingles; no hay soporte multilingue declarado, incluido el castellano.
- Licencia no disponible: la ausencia de licencia explicita impide asumir permisos de uso comercial. Es un caveat critico para cualquier integracion en produccion.
- Benchmarks no verificados: los resultados proceden de la model-index del autor y estan marcados como verified: false; deben tratarse como declaraciones no auditadas.
- Requiere trust_remote_code=True: la carga ejecuta codigo personalizado del repositorio, con el riesgo de seguridad que ello implica.
- Contexto no confirmado: aunque las evaluaciones usan max_length 2048, no se documenta la ventana de contexto real del modelo ni su comportamiento posicional mas alla de esa longitud.
- Sesgos: no se documenta ninguna evaluacion de sesgo, toxicidad o sesgo de genero; el dataset fineweb-edu esta filtrado por calidad educativa, lo que puede introducir sesgos de dominio y de registro.
- Sin soporte de tool calling ni agentes: no apto para pipelines que requieran function calling o razonamiento multi-paso.
- Cero traccion en la comunidad (0 descargas, 0 likes): no hay validacion externa, issues resueltos ni conversiones mantenidas por terceros.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/d0rj/q-latent-moe-52M-A35M-base
- Modelo hermano denso (misma ablacion): https://huggingface.co/d0rj/q-51M-base
- README del modelo hermano: https://huggingface.co/d0rj/q-51M-base/blob/main/README.md
- Implementacion de referencia LatentMoE (kyegomez): https://github.com/kyegomez/Latent-MoE/tree/main/examples/training
- Dataset de entrenamiento: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Paper de referencia citado por la implementacion: "Toward Optimal Accuracy per FLOP and Parameter in Mixture of Experts" (Elango et al., NVIDIA, 2026)
