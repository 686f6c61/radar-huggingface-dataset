# FlagRelease/GLM-5.3-Flash-W8A8-ascend-FlagOS-Express

## Resumen

GLM-5.3-Flash es el primer modelo nativamente multimodal de la serie GLM-5, desarrollado por Z.ai (Zhipu AI). Se trata de un modelo de arquitectura Mixture of Experts (MoE) con 320 000 millones de parámetros totales y 18 000 millones activados por token, que según su model card supera a GLM-5.2 y alcanza 57 puntos en el AA Composite Intelligence Index, situándose a la altura de Claude Opus 4.8 en dicha métrica. Su relevancia radica en combinar capacidades multimodales, un contexto de hasta 1 048 576 tokens y un rendimiento declarado en código equiparable a modelos frontera propietarios.

El artefacto concreto de esta ficha, `FlagRelease/GLM-5.3-Flash-W8A8-ascend-FlagOS-Express`, no es el modelo original en pesos completos, sino una **imagen de inferencia** empaquetada por FlagRelease para hardware Ascend 910B. Incluye una cuantización W8A8 (pesos y activaciones en INT8), decodificación especulativa MTP (multi-token prediction), caché KV en INT8 y un despliegue desagregado prefill/decode (P/D) sobre SGLang, con plugin propietario, FlagTree y FlagGems. La imagen se distribuye vía Harbor y **no contiene los pesos**: hay que aportar el directorio completo del modelo `GLM-5.3-Flash-w8a8`.

Para un desarrollador o investigador, este repositorio es relevante si necesita desplegar GLM-5.3-Flash en clústeres Ascend a gran escala con contexto de un millón de tokens, ya que documenta configuraciones de 2 y 4 servidores con 16 o 32 NPU y verificaciones de identidad de código (hashes de los binarios P y D).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE multimodal (serie GLM-5); detalles internos no disponibles |
| Parametros totales | 320 000 millones (320B) |
| Parametros activos | 18 000 millones (18B) por token |
| Longitud de contexto | 1 048 576 tokens (entrada + salida) en el despliegue documentado |
| Tipos de cuantizacion | W8A8 (INT8 en pesos y activaciones, vía ModelSlim); caché KV en INT8; estado Mamba/SSM en FP32 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Directorio de modelo W8A8 (config, tokenizer, módulo visual, pesos MTP, `chat_template.jinja`); no se especifica safetensors/GGUF |
| Hardware objetivo | Ascend 910B (8 NPU por servidor) |
| Software de inferencia | SGLang `0.5.21.dev476+g4e60d70ba` con plugin `sglang-plugin-FL 0.1.0` |
| Toolchain | CANN 9.0.0, PyTorch 2.10.0+cpu, Torch-NPU 2.10.0, FlagTree 0.7.0+ascend3.5, Triton 3.5.1, Python 3.11.15 (ARM64) |
| Transporte P/D | Mooncake con `device_rdma`; HCCL para comunicación colectiva |
| Formatos de despliegue | Imagen Docker `linux/arm64` en Harbor; 1p1d (2 servidores) y 2p2d (4 servidores) |

## Arquitectura y entrenamiento

La model card describe GLM-5.3-Flash como un modelo MoE nativamente multimodal con 320B de parámetros totales y 18B activos por token. La referencia a un «Mamba state pool» en la documentación de despliegue sugiere una arquitectura híbrida que combina atención con capas de estado tipo Mamba/SSM, aunque la model card no detalla la proporción ni la disposición de dichas capas. El repositorio incorpora pesos MTP (multi-token prediction) que se usan como modelo draft para decodificación especulativa, lo que reduce la latencia de generación. No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset, ni si se aplicaron etapas de RLHF o DPO.

En el plano del despliegue, FlagRelease empaqueta una pila completa para Ascend: SGLang con separación prefill/decode, caché de prefijo de tres niveles en el lado P y caché de prefijo en el lado D, y kernels optimizados mediante FlagTree (basado en Triton) y FlagGems. La cuantización W8A8 se aplica tanto al modelo principal como al draft, mientras que la caché KV se almacena en INT8 y el estado Mamba/SSM en FP32. La imagen fija hashes SHA256 de los binarios P y D y del wheel de FlagTree para garantizar reproducibilidad; no requiere descargar repositorios en tiempo de despliegue.

## Capacidades

- Generación de texto y razonamiento de propósito general, con rendimiento declarado superior a GLM-5.2.
- Modalidad nativa multimodal (procesamiento de imágenes, según la descripción de «first natively multimodal model»); el alcance exacto de visión no se detalla.
- Generación de código: la model card afirma paridad con Claude Opus 4.8 en la evaluación interna Code-Bench de Z.ai.
- Decodificación especulativa mediante MTP, con modelo draft incluido en el mismo directorio.
- Contexto ultralargo: se ha validado una petición real de 1 047 424 tokens de entrada más 1 024 de salida.
- Caché de prefijo multinivel (tres niveles en P, un nivel en D) para reutilización de contexto en cargas con prompts repetidos.
- Soporte de plantilla de chat (`chat_template.jinja`) para formateo conversacional.
- Soporte de tool calling y agentes: no disponible en la información proporcionada.

## Casos de uso

- **Análisis de repositorios completos**: con cerca de un millón de tokens de contexto, el modelo puede ingerir un monorepositorio o una base de código extensa en una sola petición y responder preguntas de arquitectura o generar parches, aprovechando la caché de prefijo para no reprocesar el contexto en consultas sucesivas.
- **Asistentes de código en producción**: la paridad declarada con Claude Opus 4.8 en Code-Bench y el soporte de MTP para reducir latencia lo hacen adecuado para autocompletado y revisión de código en pipelines de CI/CD, siempre que se disponga de clúster Ascend.
- **Procesamiento de documentos largos multimodales**: informes con tablas, gráficos e imágenes de cientos de páginas pueden procesarse en una única ventana, combinando la capacidad multimodal con el contexto extendido.
- **Atención al cliente con historial extenso**: conversaciones multi-turno con memoria de largo plazo, donde la caché de prefijo del lado D evita recalcular el historial en cada turno.
- **Investigación sobre escalado de contexto**: el despliegue documenta límites reales de admisión por dominio de attention DP y pools de KV/Mamba, lo que permite estudiar el equilibrio entre concurrencia y longitud de contexto en hardware Ascend.
- **Servicio desagregado de alta concurrencia**: la topología P/D con 2p2d (32 NPU) permite escalar prefill y decode de forma independiente según la proporción de prompts largos frente a generaciones largas.
- **Evaluación comparativa de hardware**: al fijar versiones y hashes, sirve como baseline reproducible para medir el rendimiento de Ascend 910B frente a GPUs en modelos MoE de 320B.

## Benchmarks y rendimiento

| Benchmark | GLM-5.3-Flash | Referencia declarada |
|---|---|---|
| AA Composite Intelligence Index | 57 puntos | Claude Opus 4.8 (misma puntuación) |
| Code-Bench interno de Z.ai | Paridad con Claude Opus 4.8 | Claude Opus 4.8 |
| Comparación con GLM-5.2 | Superior | GLM-5.2 |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar en la información disponible. Las cifras anteriores proceden de la model card del autor y no incluyen metodología detallada.

## Requisitos de hardware

- **Hardware objetivo**: Ascend 910B exclusivamente; la imagen es `linux/arm64` y depende de CANN 9.0.0 y del driver del host.
- **Configuración mínima documentada (1p1d)**: 2 servidores, 16 NPU en total (8 por servidor); P con TP8/EP8 y D con DP2×TP4/EP8.
- **Configuración de mayor escala (2p2d)**: 4 servidores, 32 NPU; P con DP2×TP8/EP16 y D con DP8×TP2/EP16.
- **VRAM/NPU**: no se indica el consumo de memoria por NPU; con 320B totales en W8A8, el peso ocupa del orden de 320 GB, repartido entre los dispositivos según TP/EP.
- **GPU consumer**: no aplicable; el paquete está compilado para Ascend y no se documenta soporte para CUDA ni para GPUs de consumo.
- **Opciones de despliegue**: contenedor Docker privilegiado con `host` network e IPC, SGLang con plugin `sglang-plugin-FL`, Mooncake para transferencia P/D y HCCL para colectivos. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- **Latencia y throughput**: no disponibles. La caché de prefijo y MTP están orientados a reducir latencia, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Hardware | Notas |
|---|---|---|---|---|---|
| GLM-5.3-Flash (este) | 320B totales / 18B activos | 1 048 576 | Apache 2.0 | Ascend 910B | Multimodal, W8A8, MTP, P/D |
| GLM-5.2 | no disponible | no disponible | no disponible | no disponible | Superado por 5.3-Flash según la model card |
| Claude Opus 4.8 | no disponible | no disponible | Propietaria | no disponible | Referencia de paridad en AA Index y Code-Bench |

No se dispone de datos suficientes para comparar con otras alternativas open source de tamaño similar (por ejemplo, otros MoE de la franja 300B) en parámetros, contexto y rendimiento dentro de la información proporcionada.

## Limitaciones y advertencias

- **No es un modelo, es una imagen**: el repositorio no contiene pesos; sin el directorio `GLM-5.3-Flash-w8a8` completo (incluido `chat_template.jinja` y pesos MTP) el contenedor no arranca.
- **Dependencia de hardware propietario**: solo funciona en Ascend 910B con CANN 9.0.0 y driver del host; no hay soporte documentado para GPU NVIDIA ni AMD.
- **Contexto de 1M no garantizado en concurrencia**: la model card advierte que la admisión real está limitada por la capacidad del pool KV y del pool de estado Mamba por dominio de attention DP; no todas las peticiones concurrentes pueden alcanzar 1M tokens.
- **Cifras de benchmarks sin metodología**: los 57 puntos del AA Index y la paridad con Claude Opus 4.8 provienen de evaluaciones internas o de terceros sin detalle reproducible; deben tratarse como orientativas.
- **Riesgo de alucinación y sesgos**: no se documentan evaluaciones de sesgo, toxicidad ni tasas de alucinación; al ser un modelo de propósito general, requiere salvaguardas en producción.
- **Idiomas**: no se especifica la cobertura lingüística; no asumir un rendimiento uniforme en castellano sin evaluarlo.
- **Complejidad operativa**: el despliegue multi-máquina exige red RDMA entre nodos, puertos HCCL/Mooncake abiertos, contenedores privilegiados y sincronización de arranque de ranks; un error de configuración deja el servicio inoperativo.
- **Licencia**: Apache 2.0 permite uso comercial, pero la licencia del modelo base debe verificarse por separado, ya que el campo `base_model` de la model card está vacío.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/FlagRelease/GLM-5.3-Flash-W8A8-ascend-FlagOS-Express
- Imagen en Harbor: `harbor.baai.ac.cn/flagrelease-public/glm-5.3-flash-w8a8-mtp-flagos-express:2026-10-28`
- SGLang: no disponible en la información proporcionada
- FlagTree: no disponible en la información proporcionada
- FlagGems: no disponible en la información proporcionada
- Paper o blog de GLM-5.3-Flash: no disponible en la información proporcionada
