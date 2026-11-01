# Kre80r/MiniCPM-V-4.7-35B-A3B-heretic-AWQ

## Resumen

MiniCPM-V-4.7-35B-A3B-heretic-AWQ es una derivacion comunitaria del modelo multimodal MiniCPM-V-4.7-35B-A3B de OpenBMB, publicada por el usuario Kre80r. Sobre el modelo base se ha aplicado un proceso de "abliteration" mediante la herramienta Heretic, que reduce deliberadamente la tasa de rechazos del modelo ante peticiones que el original declinaria, y posteriormente se ha cuantizado a AWQ W4A16 con llm-compressor. El resultado es un modelo imagen-texto con arquitectura Mixture of Experts (MoE), pensado para despliegue en vLLM.

La relevancia de esta ficha radica en que combina tres transformaciones sobre un mismo artefacto: modificacion del comportamiento de alineamiento (abliteration), cuantizacion de pesos a 4 bits y empaquetado en el formato compressed-tensors que vLLM detecta de forma nativa. El autor reporta una reduccion de rechazos de 103/104 a 1/104 en un conjunto de prueba de 104 prompts, manteniendo respuestas completas en 104/104 casos.

El repositorio ocupa 22,6 GB repartidos en 5 shards, declara licencia Apache-2.0 heredada del modelo base y expone una ventana de contexto de 262.144 tokens. No es un modelo oficial de OpenBMB y el propio autor lo etiqueta como derivado comunitario sin afiliacion con el desarrollador original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal con Mixture of Experts (MoE); familia MiniCPM-V 4.7 |
| Parametros totales | 7.278.872.624 segun safetensors del repo (el nombre del modelo indica 35B-A3B en el base; el artefacto cuantizado declara 7,28B en sus tensores) |
| Parametros activos | 3B segun la denominacion A3B del modelo base (no verificado en el artefacto) |
| Longitud de contexto | 262.144 tokens (verificado por el autor) |
| Tipos de cuantizacion | AWQ W4A16, simetrica, group size 128; almacenada con compressed-tensors |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (compressed-tensors), 5 shards, ~22,6 GB |

## Arquitectura y entrenamiento

El modelo base MiniCPM-V-4.7-35B-A3B emplea una arquitectura Mixture of Experts con aproximadamente 35.000 millones de parametros totales y unos 3.000 millones activos por token, segun la nomenclatura del propio nombre. Incluye una torre de vision para el procesamiento de imagenes, ya que la pipeline declarada es image-text-to-text. Esta derivacion no aporta informacion sobre el dataset de entrenamiento original, el numero de tokens vistos ni si hubo fases de RLHF o DPO; esos datos corresponden al modelo de OpenBMB y no se detallan en la model card disponible.

La innovacion tecnica de esta version concreta es doble. Por un lado, la abliteration aplicada con Heretic modifica las proyecciones de atencion (attn.o_proj) y del MLP (mlp.down_proj) con pesos maximos y minimos de 1,50 y posiciones y distancias de 23,40, usando direction_index 27,00 y row_normalization none. Por otro, la cuantizacion AWQ W4A16 excluye la torre de vision y otros modulos sensibles, cuantizando solo las proyecciones de texto y empaquetando 30.720 matrices de expertos enrutados. El commit de Heretic utilizado es d34dd919.

## Capacidades

- Generacion de texto conversacional multi-turno con contexto de hasta 262.144 tokens.
- Comprension de imagenes y respuesta texto-a-partir-de-imagen (image-text-to-text) en modo no-thinking.
- Tool calling nativo con roundtrip verificado por el autor.
- Razonamiento multi-paso y soporte de agentes, segun las capacidades del modelo base.
- Modo thinking disponible en el modelo base, aunque el autor solo verifico vision en modo no-thinking.
- Capacidad multilingue no documentada en esta ficha; los idiomas no estan disponibles en la informacion proporcionada.
- Comportamiento "uncensored": reduccion deliberada de rechazos, con 1/104 rechazos en el conjunto de prueba del autor.
- Compatibilidad con endpoints y despliegue en vLLM 0.32 sin flags adicionales.

## Casos de uso

- Analisis documental con imagenes: el modelo puede procesar capturas, escaneos o diagramas junto a texto largo gracias a sus 262.144 tokens de contexto, util para extraccion de datos de informes extensos con figuras intercaladas.
- Asistentes de investigacion sin filtros: en entornos controlados donde se necesita explorar temas sensibles (seguridad, analisis de contenido dañino, red teaming), la reduccion de rechazos permite obtener respuestas sustantivas donde el modelo original se negaria.
- Automatizacion de soporte tecnico multimodal: integrado via vLLM, puede gestionar conversaciones multi-turno con imagenes de errores, capturas de pantalla o diagramas de arquitectura, manteniendo contexto largo entre sesiones.
- Pipelines de agentes con tool calling: el roundtrip nativo de herramientas permite encadenar llamadas a APIs y funciones en flujos multi-paso, adecuado para orquestacion de tareas con vLLM como backend.
- Procesamiento por lotes de imagenes y texto: los 5 shards de 22,6 GB y la cuantizacion W4A16 permiten servir el modelo en una sola GPU de 24-48 GB, facilitando el procesamiento batch de catalogos, tickets o documentacion escaneada.
- Evaluacion de robustez y alineamiento: util como contrapunto en estudios comparativos sobre abliteration, midiendo diferencias de comportamiento frente al modelo base en tareas de seguridad y utilidad.
- Generacion de descripciones y alt-text a escala: la torre de vision sin cuantizar preserva calidad de percepcion, adecuada para enriquecer bases de datos de imagenes con descripciones textuales.

## Benchmarks y rendimiento

| Metrica | Este modelo | Modelo AWQ original |
|---|---|---|
| Rechazos (104 prompts held-out) | 1/104 | 103/104 |
| Respuestas completas y no vacias | 104/104 | 47/104 |
| Truncamientos / errores | 0/104 | 0/104 |
| Divergencia KL (seleccion Heretic, 100 prompts) | 0,3776 | no disponible |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El autor solo reporta metricas de rechazo y completitud sobre el split de test de mlabonne/harmful_behaviors, evaluadas con un juez LLM a temperatura 0 y 208/208 veredictos validos.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 23-25 GB en W4A16 (pesos de 22,6 GB mas overhead de KV cache y activaciones).
- GPU recomendadas: A100 40/80 GB, H100, L40S, RTX 6000 Ada; en consumer, RTX 3090/4090 (24 GB) al limite, con contexto reducido.
- Cabe en consumer GPU: si, en RTX 3090/4090 de 24 GB con cuantizacion W4A16, aunque el contexto maximo de 262.144 tokens requiere reducir max-model-len o usar GPU con mas memoria.
- Opciones de despliegue: vLLM 0.32 (recomendado, deteccion automatica de compressed-tensors); compatibilidad con transformers; llama.cpp y Ollama no estan documentados para este artefacto AWQ.
- Latencia y throughput: no disponibles. El autor verifico cuatro peticiones concurrentes de contexto largo sin errores, pero no publica cifras de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Kre80r/MiniCPM-V-4.7-35B-A3B-heretic-AWQ | 7,28B en safetensors (base 35B-A3B MoE) | 262.144 | Apache-2.0 | HuggingFace, AWQ | Derivado abliterado, sin benchmarks estandar |
| openbmb/MiniCPM-V-4.7-35B-A3B | 35B totales / 3B activos | no disponible en esta ficha | Apache-2.0 | HuggingFace | Modelo base oficial, alineado, con rechazos |
| Derivados abliterados de la familia MiniCPM-V | variable | variable | Apache-2.0 | HuggingFace | Alternativas comunitarias con distinto grado de modificacion |

No se dispone de datos de benchmarks comparativos con modelos de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo deliberadamente modificado para reducir rechazos: cumplira peticiones que el original declina, con salidas sin filtrar que pueden ser inexactas, ofensivas o inseguras.
- Riesgo de alucinacion no cuantificado; no hay benchmarks de fidelidad en la informacion disponible.
- La abliteration puede degradar capacidades generales; el autor solo reporta divergencia KL de 0,3776 como metrica de seleccion, no como medida held-out.
- Idiomas soportados no documentados; no se garantiza comportamiento multilingue.
- La cuantizacion AWQ excluye la torre de vision, pero no se publican evaluaciones de calidad de vision frente al modelo sin cuantizar.
- Licencia Apache-2.0 permite uso comercial, pero el autor recomienda anadir salvaguardas propias ante usuarios finales y advierte de responsabilidad legal sobre el contenido generado.
- Derivado comunitario sin afiliacion ni respaldo de OpenBMB; soporte y mantenimiento no garantizados.
- El recuento de parametros del safetensors (7,28B) no coincide con el nombre del modelo (35B-A3B), lo que puede indicar un empaquetado peculiar de los expertos; conviene validar el comportamiento en despliegue real.

## Enlaces

- HuggingFace: https://huggingface.co/Kre80r/MiniCPM-V-4.7-35B-A3B-heretic-AWQ
- Modelo base: https://huggingface.co/openbmb/MiniCPM-V-4.7-35B-A3B
- Heretic (abliteration): https://github.com/p-e-w/heretic
- Commit de Heretic usado: https://github.com/p-e-w/heretic/commit/d34dd9192da06d203eb7e80d20229117bb4e981c
- llm-compressor (cuantizacion AWQ): https://github.com/vllm-project/llm-compressor
- vLLM: https://github.com/vllm-project/vllm
- Dataset de evaluacion: https://huggingface.co/datasets/mlabonne/harmful_behaviors
