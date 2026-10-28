# asahi-jp/LFM3-1.7B-nf4-cw-ov

## Resumen

`asahi-jp/LFM3-1.7B-nf4-cw-ov` es una conversión al formato OpenVINO IR del modelo `LiquidAI/LFM3-1.7B` de Liquid AI, cuantizada en NF4 por canal (weight-only, `group_size=-1`) mediante Optimum-Intel y NNCF. No es un modelo nuevo: es un artefacto de despliegue orientado a ejecutar un transformer híbrido de 1.700 millones de parámetros en hardware Intel, con especial énfasis en la aceleración de NF4 que ofrecen los chips Core Ultra 200V (Lunar Lake) y posteriores.

El interés del repositorio es doble. Por un lado, demuestra el pipeline de cuantización de Optimum-Intel sobre la arquitectura LFM3, que combina convoluciones cortas con compuerta y capas de atención deslizante y completa, y que requiere soporte específico para su caché híbrida (estados de convolución más cachés key/value). Por otro, publica una tabla de fidelidad frente al IR en FP16 que permite decidir con datos si merece la pena emplear NF4 o quedarse en INT8 o INT4, algo poco habitual en repositorios de cuantización.

Conviene subir el nivel de cautela: la variante NF4 por canal es la más agresiva de las cuatro comparadas por el autor, con una similitud de coseno de logits de 0,8620 frente a FP16 y un 0 % de coincidencia top-1 en la posición evaluada. Es un modelo pensado para experimentación y despliegue en el borde, no para tareas donde la fidelidad token a token sea crítica.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido LFM3 (convoluciones cortas con compuerta, atención deslizante y atención completa) |
| Parametros totales | 1,7 mil millones (según el nombre del modelo base) |
| Parametros activos | No aplica (la información disponible no indica arquitectura MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | NF4 weight-only por canal (`dtype=nf4`, `group_size=-1`); mezcla interna: 153 de 169 capas de pesos en NF4, 14 en INT8 y 2 en coma flotante |
| Idiomas soportados | No disponible |
| Licencia | LFM Open License v1.0 (`license: other`, `license_name: lfm1.0`) |
| Formato de pesos | OpenVINO IR (`openvino_model.xml` + `openvino_model.bin`), tokenizador y detokenizador también en IR de OpenVINO |

## Arquitectura y entrenamiento

El modelo base LFM3-1.7B emplea una arquitectura híbrida en la que conviven capas de convolución corta con compuerta y capas de atención, algunas deslizantes y otras completas. Esta mezcla se traduce en un estado de caché poco convencional: la model card indica 13 estados de convolución corta con compuerta y 22 cachés key/value, correspondientes a 5 capas de atención deslizante y 6 de atención completa. El IR de OpenVINO preserva esa caché híbrida y soporta tanto la fase de prefill como la decodificación incremental, lo que lo hace apto para generación autorregresiva multi-turno.

No se aportan en la información disponible datos sobre el corpus de entrenamiento del modelo base (número de tokens, composición del dataset, uso de RLHF o DPO). Lo que sí documenta este repositorio es el proceso de cuantización: conversión con Optimum-Intel y NNCF a NF4 por canal, con un layout mixto que deja 14 capas en INT8 y 2 en coma flotante, presumiblemente para preservar sensibilidad numérica en capas críticas. El resultado ocupa 1,03 GB.

## Capacidades

- Generación de texto autorregresiva con soporte de prefill e decodificación incremental gracias a la caché híbrida preservada en el IR.
- Uso conversacional mediante plantilla de chat (`chat_template.jinja`) y `apply_chat_template` del tokenizador.
- Modo de razonamiento conmutables: la plantilla expone el parámetro `enable_thinking`, que en el ejemplo de uso se desactiva explícitamente.
- Ejecución en CPU Intel, iGPU y NPU a través del runtime de OpenVINO; aceleración específica de las capas NF4 en Lunar Lake y posteriores.
- Compatibilidad con el ecosistema Hugging Face vía `OVModelForCausalLM` de Optimum-Intel, incluyendo `trust_remote_code=True` para cargar el código remoto de LFM3.
- Tool calling / function calling: no documentado en la información disponible.
- Capacidades multimodales (visión, audio): no documentadas; el pipeline declarado es únicamente `text-generation`.
- Cobertura multilingüe: no disponible en la información proporcionada.

## Casos de uso

- Asistentes locales en portátiles con Core Ultra 200V: el modelo cabe en 1 GB de pesos y aprovecha la aceleración NF4 de Lunar Lake, lo que permite mantener un chat privado sin conexión consumiendo pocos recursos de memoria.
- Procesamiento por lotes de texto en servidores solo-CPU: al ejecutarse sobre OpenVINO, puede desplegarse en flotas Intel sin GPU dedicada, aceptando el coste de decodificación en software si el hardware no es Lunar Lake.
- Prototipado de aplicaciones conversacionales offline: la plantilla de chat y el flag `enable_thinking` permiten alternar respuestas directas o con razonamiento sin cambiar de modelo.
- Evaluación de tolerancia a la cuantización: la tabla de fidelidad publicada (coseno de logits, acuerdo top-1 y solapamiento top-5 frente a FP16) lo convierte en un caso de estudio útil para comparar NF4, INT4 e INT8 en un mismo modelo.
- Integración en aplicaciones de escritorio con OpenVINO: al distribuirse como IR con tokenizador incluido, se puede empaquetar dentro de herramientas nativas sin depender de PyTorch en tiempo de ejecución.
- Docencia y experimentación con arquitecturas híbridas: sirve para inspeccionar cómo se materializa una caché mixta (convolución más atención) en un grafo de OpenVINO, incluida la decodificación incremental.
- Pruebas de regresión en CI de pipelines de cuantización: comparar los logits de este IR con el FP16 en cada actualización de NNCF u Optimum-Intel permite detectar degradaciones de forma automatizada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. El autor sí publica una comparativa de fidelidad de cuantización frente al IR en FP16, medida sobre un pasaje de texto fijo (logits de siguiente token en una única posición) y con generación greedy:

| Variante | Coseno de logits vs FP16 | Acuerdo top-1 | Solapamiento top-5 |
|---|---|---|---|
| INT8 | 0,9982 | 100 % | 100 % |
| INT4 group 64 | 0,9622 | 100 % | 80 % |
| INT4 channelwise | 0,9171 | 100 % | 60 % |
| NF4 channelwise (este repo) | 0,8620 | 0 % | 80 % |

Las cuatro variantes responden correctamente a la pregunta factual corta de control ("The capital of France is Paris."). No se publican cifras de latencia ni de throughput.

## Requisitos de hardware

- Huella de pesos: 1,03 GB en disco; el conjunto de parámetros en NF4 ronda 1 GB, por lo que la inferencia requiere del orden de unos pocos GB de memoria en total (estimación a partir del tamaño del repositorio; no se publican cifras oficiales de VRAM).
- Aceleración NF4: únicamente en Intel Core Ultra 200V (Lunar Lake) o posterior. En CPU y GPU anteriores las capas NF4 se descomprimen por software y el beneficio de velocidad desaparece.
- Recomendación del autor: usar las variantes INT8 o INT4 group 64 en hardware anterior a Lunar Lake.
- GPU dedicadas (A100, H100, RTX 4090): no se documenta soporte ni rendimiento; el artefacto está orientado al stack de OpenVINO sobre Intel.
- Despliegue: runtime de OpenVINO a través de `OVModelForCausalLM` de Optimum-Intel con `trust_remote_code=True`. El formato IR no es directamente consumible por vLLM, llama.cpp u Ollama sin una conversión previa.
- Versiones verificadas por el autor: transformers 5.15.0, optimum-intel 2.3.0.dev0+a68683c (con soporte LFM3), OpenVINO 2026.4.1 y NNCF 3.3.0.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Fidelidad vs FP16 (coseno de logits) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LFM3-1.7B NF4 channelwise (este repo) | 1,7 B | No disponible | 0,8620 | LFM Open License v1.0 | Público en Hugging Face |
| LFM3-1.7B INT4 channelwise | 1,7 B | No disponible | 0,9171 | LFM Open License v1.0 | Referenciado en la model card, sin identificador de repositorio |
| LFM3-1.7B INT4 group 64 | 1,7 B | No disponible | 0,9622 | LFM Open License v1.0 | Referenciado en la model card, sin identificador de repositorio |
| LFM3-1.7B INT8 | 1,7 B | No disponible | 0,9982 | LFM Open License v1.0 | Referenciado en la model card, sin identificador de repositorio |
| LiquidAI/LFM3-1.7B (FP16, base) | 1,7 B | No disponible | Referencia (1,0) | LFM Open License v1.0 | Público en Hugging Face |

## Limitaciones y advertencias

- Deriva numérica significativa: es la variante menos fiel de las cuatro comparadas, con coseno de logits de 0,8620 y un 0 % de acuerdo top-1 frente a FP16 en la posición evaluada. El autor recomienda explícitamente INT8 o INT4 group 64 cuando la precisión importa.
- La evaluación de calidad se limita a una única posición de un pasaje fijo y a una pregunta factual; no hay evidencia sobre el comportamiento en tareas largas, código o razonamiento.
- En hardware anterior a Lunar Lake las capas NF4 se descomprimen por software: se paga el coste de la cuantización agresiva sin obtener la aceleración, lo que combina el peor escenario de rendimiento y fidelidad.
- La model card indica 22 cachés key/value para 5 capas de atención deslizante y 6 de atención completa; las cifras no cuadran entre sí y conviene verificarlas contra la configuración del modelo base.
- Riesgo de alucinación y sesgos: no evaluados en la información disponible; al ser una cuantización de un modelo base de 1,7 B, cabe esperar las limitaciones típicas de ese tamaño, pero no se aportan mediciones.
- Idiomas soportados no documentados; no se debe asumir cobertura multilingüe sin verificarla.
- Licencia LFM Open License v1.0: el campo `license` es `other` con nombre `lfm1.0`, lo que implica condiciones específicas distintas de licencias estándar. Es imprescindible revisar el texto antes de un uso comercial.
- Requiere `trust_remote_code=True` y una compilación reciente de Optimum-Intel con soporte LFM3; versiones anteriores fallarán al cargar el modelo.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay validación comunitaria ni evidencia de uso en producción.

## Enlaces

- Repositorio del modelo: https://huggingface.co/asahi-jp/LFM3-1.7B-nf4-cw-ov
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
- Licencia del modelo base (LFM Open License v1.0): https://huggingface.co/LiquidAI/LFM3-1.7B/blob/main/LICENSE
- Optimum-Intel: https://github.com/huggingface/optimum-intel

Nota: la búsqueda web realizada no ha devuelto resultados relevantes sobre este modelo; los enlaces anteriores proceden de la información de Hugging Face y de la model card.
