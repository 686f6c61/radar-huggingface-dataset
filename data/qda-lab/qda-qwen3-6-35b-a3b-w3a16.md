# qda-lab/QDA-Qwen3.6-35B-A3B-W3A16

## Resumen

QDA-Qwen3.6-35B-A3B-W3A16 es un checkpoint cuantizado del modelo Qwen/Qwen3.6-35B-A3B, publicado por qda-lab. La cuantizacion se ha obtenido mediante una busqueda automatizada denominada QDA ("Closed-Loop Quantization Design with LLM Agents"), descrita en un envio a MLSys 2027. El resultado es una representacion W3A16 (pesos a 3 bits, activaciones a 16 bits) en formato compressed-tensors, lista para cargarse directamente en vLLM sin pasos de conversion adicionales.

El modelo base es un transformer de tipo Mixture of Experts (MoE) con aproximadamente 36.000 millones de parametros totales y unos 3.000 millones activos por token, orientado a agentes de codigo, razonamiento a escala de repositorio y flujos que combinan razonamiento con herramientas. La variante cuantizada reduce el peso del repositorio a 17,3 GB, lo que la hace desplegable en hardware mas modesto que el checkpoint BF16 original.

La relevancia de este checkpoint es doble: por un lado, demuestra que la cuantizacion de pesos a 3 bits puede mantener una precision agregada del 75,9 % en un conjunto de benchmarks exigentes (matematicas, GPQA, LiveCodeBench, IFBench); por otro, el autor publica los archivos exactos evaluados en el articulo, lo que facilita la reproducibilidad. El repositorio no incluye aun informacion sobre licencia, idiomas ni pipeline.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture of Experts (qwen3_5_moe) |
| Parametros totales | 35.951.822.704 (~36B) |
| Parametros activos | ~3B (dato del modelo base, no confirmado en la model card) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | W3A16 (pesos 3 bits, activaciones 16 bits), formato compressed-tensors |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (compressed-tensors), compatible con vLLM |
| Tamano del repositorio | 17,3 GB |
| Modelo base | Qwen/Qwen3.6-35B-A3B |
| Version de vLLM evaluada | 0.27.1 |

## Arquitectura y entrenamiento

El modelo base Qwen3.6-35B-A3B es un transformer con arquitectura Mixture of Experts: alrededor de 35.000 millones de parametros totales de los que aproximadamente 3.000 millones se activan por token, segun la documentacion publica del modelo base. Alibaba describe Qwen3.6 como una evolucion de Qwen3.5 centrada en estabilidad y utilidad practica para codigo, con soporte para razonamiento y uso de herramientas. La model card del checkpoint cuantizado no detalla la composicion del dataset de entrenamiento, el numero de tokens ni si hubo fases de RLHF o DPO.

La innovacion de este checkpoint es el proceso de cuantizacion: QDA busca de forma cerrada (closed-loop) una asignacion de precision por capa mediante agentes LLM, y produce un checkpoint W3A16 en compressed-tensors. La model card indica que, tras la evaluacion, `config.json` incorporo una entrada adicional de `ignore` en la cuantizacion para los expertos enrutados del cabezal MTP, de modo que vLLM carga ese cabezal en BF16; los pesos y la cuantizacion del modelo principal no cambiaron. No se documentan otras tecnicas como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto y razonamiento de multiples pasos, con modo de razonamiento segun el modelo base.
- Codigo: el modelo base esta disenado para agentes de programacion y razonamiento a escala de repositorio (LiveCodeBench v6 en la evaluacion del checkpoint).
- Matematicas: resuelve problemas de competicion (AIME 2025 y HMMT Feb 2026 en la evaluacion).
- Uso de herramientas y function calling: heredado del modelo base, orientado a flujos con herramientas.
- Capacidades de agente: el modelo base se presenta para workflows de agentes y razonamiento combinado con herramientas.
- Multilingue: no disponible en la informacion del checkpoint; el modelo base es de Qwen, pero no se confirman idiomas concretos.
- Vision: la ficha de NVIDIA NGC del modelo base menciona modalidad de texto e imagen en los datasets, pero no se confirma soporte de vision en este checkpoint.

## Casos de uso

- Agentes de codigo en repositorios: el modelo base esta optimizado para razonamiento a escala de repositorio y el checkpoint mantiene un 77,8 % en LiveCodeBench v6, por lo que puede integrarse en pipelines de revision, generacion y refactorizacion de codigo con contexto de proyecto.
- Asistente de matematicas y STEM: con un 81,8 % en AIME 2025 + HMMT Feb 2026 y un 82,0 % en GPQA-Diamond, es adecuado para tutoria o resolucion asistida de problemas tecnicos de nivel avanzado.
- Razonamiento con herramientas en produccion: al cargarse en vLLM con `vllm serve`, puede exponerse como API compatible con OpenAI para orquestar llamadas a funciones en flujos de automatizacion.
- Despliegue con restricciones de memoria: los 17,3 GB del repositorio permiten servir el modelo en una unica GPU de 24 GB o en dos de 16 GB, algo inviable con el checkpoint BF16 de ~72 GB.
- Evaluacion de tecnicas de cuantizacion: al ser los archivos exactos del articulo QDA (busqueda `r-3c650a0d`, entrega `h6`), sirve como referencia reproducible para comparar metodos de cuantizacion.
- Prototipado de agentes multi-paso: el modo de razonamiento y el soporte de herramientas del modelo base permiten construir asistentes que planifican, ejecutan y verifican tareas encadenadas.
- Generacion de codigo en CI/CD: con tool calling y una ventana de contexto no confirmada, puede conectarse a pipelines para generar tests o parches, aunque requiere validacion previa de latencia y contexto.

## Benchmarks y rendimiento

Resultados publicados en la model card del checkpoint (vLLM 0.27.1 sobre GH200, batching estatico, muestreo `temperature=1.0`, `top_p=0.95`, `top_k=20`, `presence_penalty=1.5`, semillas 17+j):

| Benchmark | Puntuacion (%) |
|---|---|
| Math (AIME 2025 + HMMT Feb 2026) | 81,8 |
| GPQA-Diamond | 82,0 |
| LiveCodeBench v6 | 77,8 |
| IFBench | 62,1 |
| Media | 75,9 |

No se han publicado en la informacion disponible resultados comparativos frente al modelo base BF16 ni frente a otras cuantizaciones, por lo que no es posible cuantificar la perdida de precision introducida por W3A16.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio pesa 17,3 GB en W3A16; con overhead de KV cache y activaciones, se recomienda un minimo de 24 GB de VRAM para contextos cortos.
- GPU recomendadas: la evaluacion se realizo en NVIDIA GH200; para produccion son adecuadas A100 40/80 GB, H100 y L40S.
- GPU de consumo: cabe en RTX 4090 (24 GB) y, con cuantizacion adicional o contextos reducidos, en GPUs de 16 GB; no se garantiza en tarjetas de 12 GB.
- Opciones de despliegue: vLLM es el soporte oficial (`vllm serve qda-lab/QDA-Qwen3.6-35B-A3B-W3A16`); no se confirma compatibilidad con llama.cpp, Ollama o TGI para este formato compressed-tensors.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Formato | Precision publicada |
|---|---|---|---|---|---|---|
| QDA-Qwen3.6-35B-A3B-W3A16 | ~36B | ~3B | no disponible | no disponible | safetensors (compressed-tensors) | Media 75,9 % en 4 benchmarks |
| Qwen/Qwen3.6-35B-A3B (base) | ~35B | ~3B | no disponible | no disponible | safetensors BF16 | no disponible en esta ficha |
| Qwen3.5 (generacion anterior) | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

La unica comparacion directa posible es con el modelo base, del que no se dispone de resultados en la informacion proporcionada. No se han identificado en la busqueda otras cuantizaciones W3A16 del mismo modelo para contrastar.

## Limitaciones y advertencias

- La cuantizacion a 3 bits puede degradar tareas sensibles a precision numerica; no se publica la diferencia frente al BF16.
- La licencia no esta declarada en el repositorio: no se puede confirmar el uso comercial sin consultar la licencia del modelo base Qwen3.6-35B-A3B.
- No se especifican idiomas soportados ni longitud de contexto; ambos deben validarse antes de usarlo en produccion.
- Riesgo de alucinacion inherente a los modelos de lenguaje, agravado en un checkpoint cuantizado sin evaluacion especifica de factualidad.
- El checkpoint depende de vLLM y del formato compressed-tensors; otras herramientas de inferencia pueden no cargarlo.
- El ajuste del `config.json` para el cabezal MTP en BF16 es una modificacion posterior a la evaluacion; conviene verificar que el comportamiento medido se mantiene.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validacion externa de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/qda-lab/QDA-Qwen3.6-35B-A3B-W3A16
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Especificaciones de Qwen3.6 35B A3B: https://gate.ai/blog/qwen3-6-35b-a3b-specs-pricing-api-access
- Qwen3.6-35B-A3B en NVIDIA NGC: https://catalog.ngc.nvidia.com/orgs/nim/teams/qwen/models/qwen3.6-35b-a3b
- Paper QDA (MLSys 2027 submission): no disponible como enlace en la informacion proporcionada.
