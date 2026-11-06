# GY2233/nextt-arena-attnres-full-canon-abcd

## Resumen

NextTransformer arena v1: AttnRes-Canon es un modelo de lenguaje de 1.357 millones de parametros (1,36B) desarrollado por el usuario GY2233 (Ge Yi) como entrada de la "arena v1" del proyecto NextTransformer. Se trata de un checkpoint final de un run de investigacion formal entrenado sobre el dataset ClimbMix (karpathy/climbmix-400b-shuffle), con un protocolo de referencia fijo: 49.152B tokens de entrada, contexto de 2.048 tokens, 46.875 actualizaciones de 1.048.576 tokens cada una y semilla 42.

El modelo combina dos innovaciones arquitectonicas: Full Attention Residuals (23 grupos de profundidad, un bloque cada uno) y Canon layers en las cuatro posiciones. El candidato fue descubierto por un agente LLM mediante NextT-Gym y seleccionado en el split de desarrollo, no por validacion ni por la metrica CORE-22. Es relevante como artefacto de investigacion reproducible: publica pesos finales, logs completos de entrenamiento, manifiesto con hashes SHA-256 y registros de procedencia, lo que permite auditar el run de principio a fin.

El modelo alcanza un BPB de validacion independiente de 0,657754 y una puntuacion CORE-22 de 35,9921 (x100) en la actualizacion 46.875. No es un modelo orientado a produccion, sino una entrada de arena experimental con licencia MIT y pesos en formato PyTorch (`model.pt`), cargable unicamente con el codigo de NextTransformer.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | NextTransformer con Full Attention Residuals (23 grupos de profundidad) y Canon layers en 4 posiciones |
| Parametros totales | 1.357.154.568 |
| Parametros activos | no disponible (no es MoE segun la informacion) |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | PyTorch (`model.pt`, 4.120.119.505 bytes) |

## Arquitectura y entrenamiento

La arquitectura es un transformer denominado NextTransformer que incorpora Full Attention Residuals organizados en 23 grupos de profundidad, con un bloque por grupo, y Canon layers aplicadas en las cuatro posiciones definidas por el metodo. El entrenamiento se realizo bajo un protocolo de referencia sin cambios: 49.152B tokens de entrada del dataset ClimbMix (karpathy/climbmix-400b-shuffle), contexto de 2.048 tokens, 46.875 actualizaciones de 1.048.576 tokens cada una y semilla 42. El coste computacional declarado es de 4,695110 GFLOPs por token de entrada, un 0,486% superior al ancla SSSL.

El checkpoint final incluye el estado del entrenador y la configuracion del modelo. El run se dividio en dos segmentos de entrenamiento (con un reanudado en el paso 39.000), y los ficheros de procedencia se publicaron con redacciones de nombre de host, rutas locales y entidad de seguimiento. El codigo de entrenamiento corresponde al commit fork `bf54f0d13ece48837f1eb630708d6698ab36f55a`, y la configuracion y prueba de coste se preregistraron en el pull request #10 del repositorio NextTransformer. Las Canon layers son convoluciones depthwise en PyTorch eager, sin kernels fusionados.

## Capacidades

- Generacion de texto autoregresiva como modelo de lenguaje causal.
- Razonamiento y modelado de lenguaje medido mediante BPB (bits por byte) en validacion.
- Evaluacion en tareas de conocimiento mediante la metrica CORE-22 (puntuacion 35,9921 x100).
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingues: no disponibles en la informacion.
- No se documentan modos especiales (thinking, vision, audio).

## Casos de uso

- Investigacion en arquitecturas alternativas de residuales: el modelo sirve como referencia reproducible para estudiar el efecto de Full Attention Residuals y Canon layers frente a un ancla SSSL, ya que publica logs completos y prueba de coste por token.
- Reproduccion de experimentos de scaling: con 49.152B tokens de entrenamiento y un protocolo fijado (semilla 42, 46.875 updates), permite replicar el run y comparar BPB bajo condiciones controladas.
- Auditoria de pipelines de entrenamiento: los ficheros `complete.json`, `logs/metrics.jsonl` y los registros de procedencia permiten verificar hashes, ledger de computo y estado del entrenador en cada paso.
- Estudio de seleccion de candidatos por agentes LLM: el modelo fue descubierto por un agente con NextT-Gym y seleccionado en el split de desarrollo, por lo que es un caso practico para analizar sesgos de seleccion y generalizacion.
- Benchmarking de metodos de residuales: util para comparar CORE-22 y BPB frente a otras entradas de la arena v1 con el mismo protocolo de referencia.
- Docencia y formacion: como ejemplo didactico de publicacion reproducible de un checkpoint con manifiesto, logs y evidencia de auditoria, aunque su uso generativo practico es limitado por el contexto de 2.048 tokens.

## Benchmarks y rendimiento

| Metrica (update 46.875) | Valor |
|---|---:|
| CORE-22 x100 (puntuacion de arena; nunca usada para seleccion) | 35,9921 |
| BPB de validacion periodica | 0,660520 |
| BPB de validacion final independiente | 0,657754 |
| BPB de entrenamiento final independiente | 0,659834 |
| Parametros | 1.357.154.568 |
| Computo de entrenamiento | 4,695110 GFLOPs por token de entrada (+0,486% frente al ancla SSSL) |

No se han publicado resultados comparativos con MMLU, HumanEval, GSM8K ni otros benchmarks estandar en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precision original (fp32): aproximadamente 5,4 GB solo para pesos (1,36B parametros x 4 bytes), mas overhead de activaciones y estado del entrenador si se carga completo.
- En fp16/bf16: alrededor de 2,7 GB para pesos; en cuantizacion de 8 bits: aproximadamente 1,4 GB; en 4 bits: alrededor de 0,7 GB. Estas estimaciones son calculadas a partir del numero de parametros, no publicadas por el autor.
- GPU recomendadas: cualquier GPU consumer con 8 GB o mas (RTX 3060, RTX 4060, RTX 4070) para inferencia en fp16; A100 o H100 no son necesarias por tamano, pero pueden usarse para entrenamiento o evaluacion por lotes.
- Cabe en GPU consumer: si, en la mayoria de tarjetas con 8 GB o mas en fp16, y en tarjetas con 4-6 GB en cuantizacion.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI. La carga requiere el codigo de NextTransformer (`load_model` del paquete `nexttransformer.models`) y el commit `bf54f0d` o el head del PR #10.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de modelos comparables en la informacion proporcionada. Como referencia de categoria (modelos de ~1,3B parametros), podrian considerarse alternativas como TinyLlama-1.1B, Qwen2.5-1.5B o SmolLM2-1.7B, pero no se han publicado comparaciones directas con AttnRes-Canon en la informacion disponible, por lo que no se incluye tabla comparativa con cifras.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| AttnRes-Canon (este) | 1,36B | 2.048 | MIT | Pesos en PyTorch, requiere codigo NextTransformer |
| Alternativas de ~1,3B | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Los resultados provienen de una sola semilla (42); no hay evidencia de robustez entre semillas.
- El candidato se selecciono en el split de desarrollo tras 2.000 actualizaciones y nunca se eligio con el shard de validacion ni con CORE, lo que puede introducir sesgo de seleccion.
- Las Canon layers son convoluciones depthwise en PyTorch eager sin kernels fusionados, lo que implica ineficiencia en inferencia y entrenamiento.
- El contexto es muy limitado (2.048 tokens), insuficiente para la mayoria de aplicaciones de produccion con documentos largos o conversaciones multi-turno extensas.
- No se documentan idiomas soportados ni evaluaciones multilingues.
- No se documentan capacidades de tool calling, agentes ni modos especiales.
- Riesgo de alucinacion no evaluado en la informacion disponible; al ser un modelo pequeno y de investigacion, se espera un comportamiento generativo limitado.
- La licencia MIT permite uso comercial, pero la ausencia de evaluaciones de seguridad y sesgos hace desaconsejable su uso en produccion sin auditoria adicional.
- La carga requiere codigo especifico de NextTransformer y verificacion de SHA-256 contra `complete.json`; no es compatible con ecosistemas estandar como transformers, llama.cpp u Ollama.
- Los shards de optimizador y flujo de datos no se publican, solo el checkpoint final.

## Enlaces

- Hugging Face: https://huggingface.co/GY2233/nextt-arena-attnres-full-canon-abcd
- Perfil del autor: https://huggingface.co/GY2233
- Modelos del autor: https://huggingface.co/GY2233/models
- Codigo del metodo: https://github.com/Interactive-Active-AI/NextTransformer/tree/main/nexttransformer/methods/attnres_full_canon_abcd
- Registro del run: https://github.com/Interactive-Active-AI/NextTransformer/blob/main/results/runs/attnres_full_canon_abcd.json
- Auditoria acumulativa: https://github.com/Interactive-Active-AI/NextTransformer/blob/main/evidence/audits/attnres_full_canon_abcd.json
- Disclosure card: https://github.com/Interactive-Active-AI/NextTransformer/blob/main/results/arena/attnres-canon.json
- Pull request de preregistro: https://github.com/Interactive-Active-AI/NextTransformer/pull/10
- Repositorio NextTransformer: https://github.com/Interactive-Active-AI/NextTransformer
- Dataset ClimbMix: https://huggingface.co/datasets/karpathy/climbmix-400b-shuffle
