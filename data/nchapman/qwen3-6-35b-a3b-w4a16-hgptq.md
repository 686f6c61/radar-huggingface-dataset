# nchapman/Qwen3.6-35B-A3B-W4A16-HGPTQ

## Resumen

Qwen3.6-35B-A3B-W4A16-HGPTQ es una cuantizacion de 4 bits del modelo multimodal Qwen3.6-35B-A3B de Qwen, un Mixture-of-Experts (MoE) de aproximadamente 36.500 millones de parametros totales con solo unos 3000 millones de parametros activos por token. La cuantizacion la ha realizado el usuario nchapman y emplea el esquema W4A16 (pesos en 4 bits, activaciones en 16 bits) con transformadas de Hadamard y el formato compressed-tensors, orientado a inferencia rapida en GPU de consumo.

El objetivo principal es reducir el peso del modelo desde los 67 GiB en BF16 hasta los 18,78 GiB en disco, lo que permite ejecutarlo en una unica GPU de 24 GB (por ejemplo, RTX 3090 o RTX 4090) dejando margen para contexto largo, entradas de vision y decodificacion especulativa. Segun el autor, la cuantizacion cubre todos los expertos enrutados (256), los expertos compartidos, las capas de atencion y GDN, el codificador de vision y el drafter de Multi-Token Prediction (MTP), con una cabeza de salida en 8 bits.

Es relevante ahora porque demuestra que un modelo MoE multimodal de 35B puede desplegarse en hardware de consumo manteniendo una fidelidad cercana a BF16 (99,3 % de acuerdo top-1 en vision aislada y 95,8 % de acuerdo en el borrador MTP, segun el autor). El modelo base esta publicado bajo licencia Apache 2.0, lo que facilita su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE multimodal (qwen3_5_moe) con atencion/GDN, vision encoder y MTP speculative decoding |
| Parametros totales | 36.468.770.672 |
| Parametros activos | ~3B por token (A3B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | W4A16 (pesos 4 bits, activaciones 16 bits), cabeza de salida en 8 bits |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compressed-tensors, GPTQ con Hadamard) |

## Arquitectura y entrenamiento

El modelo base es un transformer de tipo Mixture-of-Experts con 256 expertos enrutados y expertos compartidos, disenado para activar solo unos 3B parametros por token, lo que reduce el coste computacional por token frente a un denso de tamano equivalente. Incluye un codificador de vision (pipeline image-text-to-text) y un modulo de Multi-Token Prediction (MTP) que actua como drafter para decodificacion especulativa, acelerando la generacion. El nombre interno del modulo es qwen3_5_moe, lo que sugiere una variante de la familia Qwen3.5.

Sobre el entrenamiento del modelo base (numero de tokens, composicion del dataset, uso de RLHF/DPO) no se dispone de informacion en los datos proporcionados. Respecto a esta version cuantizada, el autor indica que todos los componentes (expertos enrutados, expertos compartidos, capas de atencion/GDN, vision encoder y drafter MTP) han sido calibrados y cuantizados, e incluye rankings preperfilados de expertos calientes (`static_hot_cache_rankings.json`) para acelerar el servicio MoE en una sola GPU.

## Capacidades

- Generacion de texto y razonamiento de proposito general.
- Generacion y asistencia en codigo.
- Capacidades de vision: entrada de imagenes y texto (image-text-to-text), con buen acuerdo top-1 frente a BF16 segun el autor.
- Decodificacion especulativa integrada mediante MTP (Multi-Token Prediction), que acelera la generacion.
- Soporte de conversacion multi-turno (tag conversational).
- Inferencia compatible con vLLM (0.34+) y con warp34.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente y multi-step reasoning: no disponible en la informacion proporcionada.
- Cobertura multilingue: no disponible.

## Casos de uso

- Despliegue en estacion de trabajo con GPU de 24 GB: el modelo cabe en una RTX 3090 o RTX 4090 (18,78 GiB en disco), lo que permite ejecutar un MoE multimodal de 35B en hardware de consumo sin servidores dedicados.
- Asistente de codigo local: el modelo base destaca en codigo segun el autor; con tool calling y vLLM puede integrarse en flujos de desarrollo, aunque la compatibilidad exacta con function calling no esta confirmada en la informacion disponible.
- Procesamiento de documentos con imagenes: gracias al codificador de vision y al buen acuerdo en tareas de UI/OCR (98,5 % de guardia segun el autor), es adecuado para extraer informacion de capturas, formularios y documentos escaneados.
- Prototipado rapido de aplicaciones multimodales: el pipeline image-text-to-text y la integracion con transformers permiten montar demos de vision-lenguaje sin infraestructura de gran escala.
- Servicio de inferencia de baja latencia: el caracter MoE con 3B activos y la decodificacion especulativa MTP estan orientados a un throughput de decodificacion alto en una sola GPU.
- Evaluacion e investigacion de cuantizacion: el repositorio incluye rankings de expertos y un informe tecnico, util para estudiar el impacto de W4A16 en modelos MoE multimodales.
- Despliegue en entornos con restricciones de memoria: la variante W2.6A16 del mismo autor (13,01 GiB) permite bajar a GPUs de 16 GB cuando el presupuesto de VRAM es mas ajustado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El autor solo aporta metricas de fidelidad de la cuantizacion frente a BF16:

| Metrica | Valor reportado por el autor |
|---|---|
| Acuerdo top-1 en vision aislada | 99,3 % |
| Acuerdo en guardia UI/OCR | 98,5 % |
| Acuerdo del borrador MTP | 95,8 % |
| Reduccion de tamano frente a BF16 | 3,6x (18,78 GiB vs. 67,0 GiB) |

## Requisitos de hardware

- VRAM estimada: aproximadamente 18,78 GiB de pesos en disco; para inferencia se necesita algo mas para el contexto KV y las entradas de vision, por lo que encaja en GPUs de 24 GB.
- GPU recomendadas: RTX 3090 y RTX 4090 (24 GB), objetivo declarado del autor. Para GPUs de 16 GB existe la variante W2.6A16 (13,01 GiB).
- Cabe en GPU de consumo: si, en RTX 3090/4090 de 24 GB; tambien en la variante reducida para 16 GB.
- Opciones de despliegue: warp34 (`warp34 serve ...`) y vLLM 0.34+ (`vllm serve ... --trust-remote-code`). Otros motores no se mencionan en la informacion disponible.
- Latencia y throughput: no se aportan cifras concretas; el autor destaca "muy rapido throughput de decodificacion" gracias a los 3B parametros activos y a la decodificacion especulativa MTP, pero sin numeros medidos.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.6-35B-A3B-W4A16-HGPTQ (este) | ~36,5B | ~3B | no disponible | Apache 2.0 | Cuantizado W4A16, ~18,78 GiB, vision + MTP |
| Qwen3.6-35B-A3B (base) | ~36,5B | ~3B | no disponible | Apache 2.0 | BF16, ~67 GiB, sin cuantizar |
| Qwen3.6-35B-A3B-W2.6A16-HGPTQ-RCO | ~36,5B | ~3B | no disponible | Apache 2.0 | Cuantizado mas agresivo, ~13,01 GiB, para 16 GB |

No se dispone de datos de rendimiento comparativo con otros modelos de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- La cuantizacion a 4 bits introduce perdida de fidelidad frente a BF16; el autor reporta 99,3 % de acuerdo en vision y 95,8 % en el borrador MTP, lo que implica divergencias residuales que pueden afectar a tareas sensibles.
- No hay datos publicados de benchmarks estandar ni de evaluacion multilingue, por lo que el rendimiento real en tareas concretas debe validarse antes de produccion.
- Riesgo de alucinacion inherente a los modelos de lenguaje; no se han publicado evaluaciones especificas de sesgo o alucinacion para esta version.
- Idiomas soportados: no disponible; no se puede garantizar cobertura mas alla del ingles sin verificacion.
- Longitud de contexto: no disponible; el margen de VRAM en 24 GB condiciona el contexto maximo utilizable.
- Requiere `--trust-remote-code` en vLLM, lo que implica ejecutar codigo personalizado del repositorio.
- La licencia Apache 2.0 del modelo base permite uso comercial, pero conviene verificar la procedencia y los terminos del modelo base Qwen/Qwen3.6-35B-A3B antes de desplegar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nchapman/Qwen3.6-35B-A3B-W4A16-HGPTQ
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Variante para 16 GB: https://huggingface.co/nchapman/Qwen3.6-35B-A3B-W2.6A16-HGPTQ-RCO
- warp34 (repositorio): https://github.com/nchapman/warp34
- warp34-quant-lab (repositorio): https://github.com/nchapman/warp34-quant-lab
- Informe tecnico: TECHNICAL.md (referenciado en la model card del repositorio)
