# inclusionAI/GLM-5.3-Flash-singprobe

## Resumen

GLM-5.3-Flash-singprobe es un guardrail intrinseco de streaming desarrollado por inclusionAI sobre el modelo base zai-org/GLM-5.3-Flash. En lugar de desplegar un modelo de seguridad independiente, este modelo anade una sonda ligera de 8,13 millones de parametros que reutiliza los estados ocultos del modelo base durante la generacion para puntuar, token a token, la intencion de la consulta, la inseguridad de la respuesta y el riesgo de alucinacion.

La relevancia de esta aproximacion reside en su coste: anade menos de un 0,5% de sobrecarga en la fase de decodificacion, lo que lo hace viable en entornos de produccion con requisitos estrictos de latencia. La sonda extrae informacion de las capas 14, 29 y 43 del transformer subyacente y produce diez salidas: ocho etiquetas de intencion de consulta, una de inseguridad de respuesta y una de riesgo de alucinacion.

El modelo se distribuye como pesos safetensors con codigo personalizado y requiere un build especifico de SGLang (o una rama de vLLM) para su inferencia. Esta pensado para equipos que necesitan moderacion y deteccion de alucinaciones en tiempo real sin anadir un segundo modelo al pipeline.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Sonda de clasificacion lineal sobre estados ocultos de un transformer (modelo base GLM-5.3-Flash); capas muestreadas [14, 29, 43] |
| Parametros totales | 8.132.106 (solo la sonda; el modelo base se descarga aparte) |
| Parametros activos | no disponible (no es MoE la sonda; el modelo base no se detalla) |
| Longitud de contexto | 16384 tokens en la configuracion de ejemplo del autor (sujeto al modelo base) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | other (glm-5.3-flash), enlazada a la licencia del modelo base |
| Formato de pesos | safetensors con custom_code (requiere trust_remote_code) |

## Arquitectura y entrenamiento

La sonda SingProbe es un modulo ligero que se engancha a los estados ocultos de tres capas intermedias y profundas del modelo base GLM-5.3-Flash (capas 14, 29 y 43). Durante la generacion, en cada paso de decodificacion, la sonda proyecta esos estados a diez cabezas de clasificacion: `label_0` a `label_7` para intencion de consulta, `label_8` para inseguridad de respuesta y `label_9` para riesgo de alucinacion. El resultado se expone en `meta_info.token_probe_probs` de la respuesta de `/generate`.

El entrenamiento se describe en el informe tecnico arXiv:2608.30703 y el codigo de entrenamiento esta disponible en el repositorio inclusionAI/SingProbe. La model card no detalla el volumen de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO. La innovacion principal es el enfoque de guardrail intrinseco en streaming: la puntuacion se calcula token a token sin un modelo de seguridad separado, con una sobrecarga de decodificacion inferior al 0,5%.

## Capacidades

- Clasificacion de intencion de consulta en ocho categorias (`label_0` a `label_7`).
- Deteccion de inseguridad en la respuesta generada (`label_8`).
- Deteccion de riesgo de alucinacion (`label_9`).
- Puntuacion en streaming token a token, apta para interrumpir generaciones en curso.
- Integracion con SGLang mediante build especifico y con vLLM mediante rama de integracion.
- Reutilizacion de los estados ocultos del modelo base sin un segundo modelo de seguridad.
- No se documentan capacidades de generacion, tool calling, agentes, vision ni audio propias; estas dependen del modelo base GLM-5.3-Flash.

## Casos de uso

- Moderacion en tiempo real de asistentes conversacionales: la sonda puntua cada token generado y permite cortar una respuesta cuando `label_8` supera un umbral, sin esperar a que termine la generacion.
- Deteccion de alucinaciones en produccion: el score `label_9` puede usarse para marcar o bloquear respuestas de alto riesgo en dominios factuales como soporte tecnico o documentacion.
- Enrutado por intencion: las ocho etiquetas de intencion permiten dirigir consultas a distintos flujos o modelos especializados dentro de un mismo servicio.
- Guardrail en pipelines de atencion al cliente: con una tasa de falsos positivos del 0,02% en respuestas benignas, es adecuado para entornos donde bloquear respuestas validas tiene coste alto.
- Auditoria y observabilidad: el registro de probabilidades por token permite analizar a posteriori donde se dispararon las alertas de seguridad o alucinacion.
- Despliegue de bajo coste: al anadir menos del 0,5% de sobrecarga, puede integrarse en servicios existentes que ya sirven GLM-5.3-Flash sin redimensionar la infraestructura.

## Benchmarks y rendimiento

| Tarea | Metrica | GLM-5.3-Flash-singprobe | Baseline de referencia |
|---|---|---|---|
| Clasificacion de intencion de consulta (6 benchmarks) | F1 | 0,8683 | YuFeng-XGuard-Reason-8B: 0,8714 |
| Clasificacion de seguridad de respuesta (8 benchmarks) | F1 | 0,8706 | Qwen3Guard-Gen-8B-strict: 0,8604 |
| Seguridad en streaming (3 benchmarks) | R-AUC / T-AUC | 0,9786 / 0,9232 | Qwen3Guard-Stream-8B-strict: 0,9640 / 0,8893 |
| Deteccion de alucinaciones (6 benchmarks) | AUC | 0,8143 | DRIFT: 0,8000 |

| Caracteristica de despliegue | Resultado |
|---|---|
| Tasa de falsos positivos en respuestas benignas | 0,02% de media en 5 datasets |
| Sobrecarga de decodificacion | < 0,5% |

## Requisitos de hardware

- La sonda ocupa 8,13 millones de parametros (unos 16 MB en fp16), pero requiere cargar el modelo base GLM-5.3-Flash completo para funcionar.
- La configuracion de ejemplo del autor usa 8 GPUs con `--tp-size 8 --ep-size 8`, lo que sugiere un modelo base de gran tamano; no se especifica el numero de parametros del base.
- VRAM estimada para la sonda: despreciable frente al modelo base; la VRAM total depende del modelo base y de la cuantizacion elegida (no disponible).
- GPU recomendadas: no disponibles para el conjunto; el ejemplo asume un nodo de 8 GPUs de clase datacenter (A100/H100 o superior).
- Despliegue: build especifico de SGLang del repositorio SingProbe o rama de integracion de vLLM (`jinzhen-lin/vllm`, rama `bailing-v3-token-probe`). No se documenta soporte para llama.cpp ni Ollama.
- Latencia y throughput: la sonda anade menos del 0,5% de sobrecarga en decodificacion; no se publican cifras absolutas de latencia o tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Enfoque | F1 seguridad respuesta | R-AUC streaming | Licencia |
|---|---|---|---|---|---|
| GLM-5.3-Flash-singprobe | 8,13 M (sonda) + base | Guardrail intrinseco en streaming | 0,8706 | 0,9786 | other (glm-5.3-flash) |
| Qwen3Guard-Gen-8B-strict | 8 B | Modelo guardrail generativo | 0,8604 | no disponible | no disponible |
| Qwen3Guard-Stream-8B-strict | 8 B | Guardrail de streaming | no disponible | 0,9640 | no disponible |
| YuFeng-XGuard-Reason-8B | 8 B | Guardrail con razonamiento | no disponible (F1 intencion 0,8714) | no disponible | no disponible |
| DRIFT | no disponible | Deteccion de alucinaciones | no disponible (AUC 0,8000) | no disponible | no disponible |

La ventaja principal frente a los guardrails de 8 B es el coste: la sonda anade menos del 0,5% de decodificacion frente a un modelo completo adicional. La contrapartida es que depende del modelo base y de un stack de inferencia especifico.

## Limitaciones y advertencias

- La sonda no es un modelo autonomo: requiere GLM-5.3-Flash y un build especifico de SGLang o vLLM; no funciona con llama.cpp u Ollama.
- La licencia es "other" (glm-5.3-flash); es imprescindible revisar los terminos del modelo base antes de uso comercial.
- No se documentan los idiomas soportados; el rendimiento multilingue de la sonda es desconocido.
- La tasa de falsos positivos del 0,02% se mide en cinco datasets concretos y puede no generalizar a otros dominios.
- El modelo base puede alucinar; la sonda solo detecta el riesgo con un AUC de 0,8143, por lo que no garantiza la ausencia de errores factuales.
- No se detallan sesgos conocidos, composicion del dataset de entrenamiento ni tecnicas de alineacion.
- El contexto de ejemplo es de 16384 tokens; no se confirma si la sonda mantiene su rendimiento en ventanas mas largas.
- El repositorio ocupa 0,0 GB segun Hugging Face, coherente con una sonda de 8 M de parametros, pero conviene verificar la descarga completa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/inclusionAI/GLM-5.3-Flash-singprobe
- Modelo base: https://huggingface.co/zai-org/GLM-5.3-Flash
- Licencia del modelo base: https://huggingface.co/zai-org/GLM-5.3-Flash/blob/main/LICENSE
- Informe tecnico: https://arxiv.org/abs/2608.30703
- Repositorio de entrenamiento: https://github.com/inclusionAI/SingProbe
- Build de SGLang: https://github.com/inclusionAI/SingProbe/tree/main/sglang#token-probe-inference
- Rama de vLLM: https://github.com/jinzhen-lin/vllm/tree/bailing-v3-token-probe
