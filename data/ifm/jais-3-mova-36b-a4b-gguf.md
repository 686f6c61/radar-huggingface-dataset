# IFM/Jais-3-MoVA-36B-A4B-GGUF

## Resumen

Jais-3-MoVA-36B-A4B es un modelo de lenguaje de tipo Mixture-of-Experts (MoE) desarrollado por IFM (Inception42), concebido como el miembro disperso de la familia Jais-3. Almacena 36B parametros totales pero activa aproximadamente 4B por token, lo que permite un coste de inferencia cercano al de un modelo denso de 4B manteniendo la capacidad representacional de un modelo mucho mayor. Incorpora una innovacion arquitectonica denominada Mixture-of-Values attention (MoVA) y una ventana de contexto de 512K tokens.

El modelo esta orientado a generacion de texto conversacional con soporte bilingue arabe-ingles, lo que lo posiciona como una alternativa open-weights para aplicaciones en lengua arabe, un nicho tradicionalmente poco cubierto por los grandes laboratorios. Se distribuye bajo licencia Apache 2.0, lo que facilita su uso comercial sin restricciones adicionales.

Esta ficha concreta corresponde a la version cuantizada en formato GGUF publicada por IFM para su uso con llama.cpp. El repositorio incluye variantes BF16, Q8_0, Q6_K, Q5_K_M, Q5_0 y Q4_K_M, con un tamano total de repositorio de 220,2 GB. La arquitectura K2 Horizon ya esta integrada en llama.cpp, aunque requiere una build reciente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con Mixture-of-Values attention (MoVA), arquitectura K2 Horizon |
| Parametros totales | 37.444.792.020 (36B nominales) |
| Parametros activos | 4B por token |
| Longitud de contexto | 512K tokens |
| Tipos de cuantizacion | BF16, Q8_0, Q6_K, Q5_K_M, Q5_0, Q4_K_M (GGUF); FP8 y MLX 4bit/8bit/bf16 en otros repos |
| Idiomas soportados | Arabe (ar), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo actual); safetensors en el modelo base |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura transformer con capas de mezcla de expertos (MoE) y una variante de atencion propietaria denominada Mixture-of-Values attention (MoVA), integrada en lo que el autor denomina arquitectura K2 Horizon. La configuracion MoE activa 4B de los 36B parametros totales por token, lo que reduce el coste computacional de inferencia de forma sustancial frente a un modelo denso equivalente. La ventana de contexto alcanza los 512K tokens.

No se dispone en la informacion proporcionada de detalles sobre el volumen de tokens de entrenamiento, la composicion del dataset, ni sobre si se aplicaron tecnicas de RLHF, DPO u otras fases de alineacion. Tampoco se especifican innovaciones adicionales como decodificacion especulativa o atencion lineal mas alla de MoVA. El modelo base es `inception42/Jais-3-MoVA-36B-A4B`, y existe una referencia a un paper con identificador arXiv:2611.10224 en las etiquetas del repositorio.

## Capacidades

- Generacion de texto conversacional multi-turno en arabe e ingles.
- Razonamiento y respuesta a instrucciones, con soporte de modo de razonamiento (reasoning) parseable mediante `--jinja` en llama-server.
- Soporte de tool calling / function calling, segun las notas de despliegue del autor.
- Capacidad de contexto largo: hasta 512K tokens, adecuada para documentos extensos o historiales de conversacion prolongados.
- Capacidades multilingues limitadas a arabe e ingles; no se documentan otros idiomas.
- No se mencionan capacidades de vision, audio ni otras modalidades en la informacion disponible.

## Casos de uso

- Atencion al cliente en arabe: el modelo puede gestionar conversaciones multi-turno con historiales extensos gracias a su ventana de 512K tokens, manteniendo coherencia en dialectos y registros del arabe moderno estandar.
- Procesamiento de documentos legales o administrativos en arabe: la ventana de contexto permite ingerir contratos o expedientes completos y responder preguntas sobre ellos sin truncamiento.
- Asistentes con tool calling: integrable en flujos donde el modelo invoca APIs externas (calculo, busqueda, bases de datos) mediante function calling nativo, con parseo habilitado por `--jinja`.
- Generacion de codigo y explicaciones tecnicas en ingles: aunque no es su foco principal, el modelo puede asistir en tareas de programacion dentro de pipelines de desarrollo.
- Traduccion y adaptacion arabe-ingles: util para localizacion de contenidos, resumenes bilingues y generacion de documentacion en ambos idiomas.
- Despliegue en hardware de consumo: al activar solo 4B parametros por token, las variantes Q4_K_M y Q5_K_M permiten ejecucion en GPUs consumer con VRAM moderada, habilitando prototipado local sin infraestructura cloud.
- Investigacion sobre modelos MoE bilingues: el modelo sirve como base para estudios de eficiencia computacional y evaluacion en lengua arabe, dado su caracter open-weights y licencia permisiva.

## Benchmarks y rendimiento

La model card incluye una tabla comparativa con modelos de referencia (Falcon-H1-34B-Instruct, Gemma-4-31B-it, Muse-Glimmer-30B, Qwen3.8-27B, Fanar-2-27B), pero los valores numericos de rendimiento no estan disponibles en la informacion proporcionada; solo se confirman los recuentos de parametros totales y activos. No se han publicado resultados de benchmarks numericos (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

| Modelo | Parametros totales | Parametros activos |
|---|---|---|
| Jais-3-MoVA-36B-A4B | 36B | 4B |
| Falcon-H1-34B-Instruct | 34B | 34B |
| Gemma-4-31B-it | 31B | 31B |
| Muse-Glimmer-30B | 30B | 30B |
| Qwen3.8-27B | 27B | 27B |
| Fanar-2-27B | 27B | 27B |

## Requisitos de hardware

- VRAM estimada para inferencia: la variante Q4_K_M requiere aproximadamente 20-22 GB; Q5_K_M en torno a 24-26 GB; Q6_K cerca de 28-30 GB; Q8_0 aproximadamente 38-40 GB; BF16 en torno a 75 GB.
- GPU recomendadas: para BF16, A100 80GB o H100; para Q8_0, A100 40GB o dos RTX 4090; para Q4_K_M y Q5_K_M, una RTX 4090 (24 GB) o RTX 3090 es suficiente.
- Cabe en GPU consumer: si, en RTX 4090, RTX 3090 y RTX 4080 Super (esta ultima con cuantizaciones Q4 o inferiores y posible offload parcial a CPU).
- Opciones de despliegue: llama.cpp (build reciente desde master, con soporte K2 Horizon ya integrado), llama-server con `--jinja` para parsear razonamiento y tool calls; MLX para Apple Silicon (variantes 4bit/8bit/bf16); FP8 disponible en repositorio separado.
- Latencia y throughput: no disponibles en la informacion proporcionada. Al activar solo 4B parametros por token, se espera un throughput notablemente superior al de un modelo denso de 36B, pero no se aportan cifras concretas.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Idiomas |
|---|---|---|---|---|---|
| Jais-3-MoVA-36B-A4B | 36B | 4B | 512K | Apache 2.0 | ar, en |
| Falcon-H1-34B-Instruct | 34B | 34B | no disponible | no disponible | no disponible |
| Gemma-4-31B-it | 31B | 31B | no disponible | no disponible | no disponible |
| Qwen3.8-27B | 27B | 27B | no disponible | no disponible | no disponible |
| Fanar-2-27B | 27B | 27B | no disponible | no disponible | no disponible |

La principal ventaja diferencial de Jais-3-MoVA-36B-A4B frente a los modelos densos de la comparativa es la relacion entre parametros almacenados y activados (4B por token), que reduce el coste de inferencia, junto con su ventana de contexto de 512K y su enfoque bilingue arabe-ingles. No se dispone de datos de rendimiento comparativo en la informacion proporcionada.

## Limitaciones y advertencias

- Idiomas limitados a arabe e ingles; el rendimiento en castellano u otros idiomas no esta documentado y probablemente sea deficiente.
- Riesgo de alucinacion inherente a los modelos de lenguaje; no se documentan medidas especificas de mitigacion en la informacion disponible.
- Sesgos conocidos: no disponibles en la informacion proporcionada; se recomienda evaluacion especifica antes de uso en produccion.
- Requiere una build reciente de llama.cpp con soporte K2 Horizon; versiones antiguas no cargaran el modelo. Es necesario iniciar llama-server con `--jinja` para que se parseen correctamente razonamiento y tool calls.
- El repositorio GGUF ocupa 220,2 GB en total, lo que exige espacio de almacenamiento considerable si se descargan todas las cuantizaciones.
- Licencia Apache 2.0 permite uso comercial sin restricciones adicionales, pero se recomienda verificar la procedencia de los datos de entrenamiento del modelo base.
- No se documentan capacidades multimodales; no apto para tareas de vision o audio.

## Enlaces

- Repositorio GGUF: https://huggingface.co/IFM/Jais-3-MoVA-36B-A4B-GGUF
- Modelo base: https://huggingface.co/inception42/Jais-3-MoVA-36B-A4B
- Coleccion Jais-3: https://huggingface.co/collections/IFM/jais-3-6abba9df4f1173ec7ce2929d
- Version FP8: https://huggingface.co/IFM/Jais-3-MoVA-36B-A4B-FP8
- Version MLX 4bit: https://huggingface.co/IFM/Jais-3-MoVA-36B-A4B-MLX-4bit
- Version MLX 8bit: https://huggingface.co/IFM/Jais-3-MoVA-36B-A4B-MLX-8bit
- Version MLX bf16: https://huggingface.co/IFM/Jais-3-MoVA-36B-A4B-MLX-bf16
- Pull request de soporte K2 Horizon en llama.cpp: https://github.com/ggml-org/llama.cpp/pull/29535
- Paper (referencia arXiv): arXiv:2611.10224
