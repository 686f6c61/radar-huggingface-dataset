# gongcheng191908/NITRO-Quant-Models

## Resumen

NITRO Quant Models es un repositorio de artefactos de cuantizacion INT8 empaquetados, no un modelo entrenado de forma nativa por el autor. Contiene pesos cuantizados con el esquema propietario `nitro-int8-codes+scales-v1` derivados de checkpoints existentes: en el momento de la publicacion solo esta disponible GPT-2 Large de 774M parametros (checkpoint entrenado con 8.000 millones de tokens de C4), mientras que las variantes de QwQ-32B y DeepSeek-R1/V3 de 671B estan planificadas o bajo peticion.

El proyecto se enmarca en la iniciativa 2025KF1B0030 del Pengcheng Laboratory, titulada "entrenamiento eficiente de modelos de lenguaje grandes basado en cuantizacion dinamica INT8". La propuesta tecnica de NITRO consiste en mantener pesos maestros en BF16 durante el entrenamiento y cuantizar a INT8 de forma JIT en los puntos de llamada a GEMM; los ficheros empaquetados que se distribuyen aqui sirven para archivo, validacion de despliegue y transporte, no para entrenamiento directo.

La relevancia actual es limitada pero concreta: ofrece un formato de pesos INT8 no estandar (no es GGUF ni safetensors cuantizado) con lector y de-cuantizador incluidos en Python, lo que permite inspeccionar el esquema de cuantizacion por bloques y evaluar la viabilidad de integrar NITRO en pipelines propios. No obstante, el repositorio no incluye codigo de entrenamiento, scripts de exportacion, logs de experimentos ni el paper, y el propio autor advierte que la publicacion esta sujeta a aprobacion del proyecto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (GPT-2 Large en la unica variante disponible) |
| Parametros totales | 774M (GPT-2 Large); 32,51B (QwQ-32B, planificado); 671B (DeepSeek-R1/V3, bajo peticion) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (GPT-2 Large nativo: 1024 tokens; no confirmado en la model card) |
| Tipos de cuantizacion | INT8 con escalas float32 por bloque (esquema `nitro-int8-codes+scales-v1`) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 (codigo); pesos sujetos a aprobacion del proyecto |
| Formato de pesos | `*.codes.bin` (INT8) + `*.scales.bin` (float32) + `*.index.json` + `*.meta.json`; no es safetensors ni GGUF |

## Arquitectura y entrenamiento

La arquitectura subyacente del unico modelo disponible es GPT-2 Large, un transformer decoder-only de 774M parametros con atencion multi-cabeza clasica. El checkpoint de origen se describe como "8B-token C4 checkpoint", es decir, un modelo entrenado sobre 8.000 millones de tokens del corpus C4. No se aportan detalles sobre la composicion exacta del dataset, el uso de RLHF/DPO ni tecnicas de alineacion adicionales.

La innovacion tecnica del proyecto NITRO no reside en la arquitectura del modelo, sino en el esquema de cuantizacion: pesos maestros en BF16 durante el entrenamiento, cuantizacion dinamica a INT8 en los puntos de llamada a GEMM, y empaquetado final en ficheros separados de codigos INT8 y escalas float32 con metadatos de bloques (tamano de bloque, offsets, formas de tensor). El repositorio incluye `load_int8_model.py` (lector y de-cuantizador obligatorio) y `to_hf_state_dict.py` (remapeo opcional de claves para `transformers.GPT2LMHeadModel`, incluyendo la transposicion de `Conv1D`). No se documentan innovaciones como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto autoregresiva (heredada de GPT-2 Large).
- Modelado de lenguaje y continuacion de prompt.
- Capacidad multilingue: no confirmada; GPT-2 Large esta entrenado predominantemente en ingles.
- Tool calling / function calling: no soportado de forma nativa.
- Razonamiento multi-paso y uso como agente: no soportado de forma nativa.
- Vision, audio o modo "thinking": no disponible.
- Inspeccion y de-cuantizacion de pesos INT8 mediante scripts Python incluidos.
- Carga en `transformers.GPT2LMHeadModel` tras remapeo de claves y transposicion de `Conv1D`.
- Integracion en la ruta de entrenamiento nativa de NITRO (no documentada en el repositorio).

## Casos de uso

- Validacion de pipelines de cuantizacion INT8: usar `load_int8_model.py` y `to_hf_state_dict.py` para verificar que la de-cuantizacion reproduce fielmente el checkpoint BF16 original, comparando salidas logit a logit antes de desplegar el esquema en modelos mayores.
- Archivo y transporte de pesos comprimidos: el formato empaquetado reduce el peso en disco de GPT-2 Large a 0,78 GiB, util para distribuir checkpoints en entornos con ancho de banda limitado o para almacenamiento a largo plazo.
- Benchmarking de esquemas de cuantizacion: comparar la perplejidad de la variante INT8 de GPT-2 Large contra el checkpoint original en C4 o en dominios propios, para cuantificar la perdida de calidad del esquema `nitro-int8-codes+scales-v1`.
- Prototipado de inferencia de bajo coste: GPT-2 Large INT8 cabe en GPUs consumer con 4-8 GB de VRAM, lo que permite experimentar con generacion de texto en hardware modesto.
- Educacion e investigacion sobre formatos de pesos: el repositorio expone la estructura interna de un esquema de cuantizacion por bloques (codigos, escalas, indices, metadatos), util como material didactico en cursos de eficiencia de modelos.
- Evaluacion de viabilidad de NITRO en produccion: si el proyecto aprueba la publicacion de las variantes de QwQ-32B y DeepSeek-R1/V3, el mismo lector permitiria validar el esquema en modelos de 32B y 671B antes de adoptarlo en pipelines propios.
- Integracion en CI/CD de modelos: los `checksums.sha256` y los metadatos `*.meta.json` (hash del checkpoint fuente, commit de NITRO, esquema) permiten automatizar la verificacion de integridad de artefactos en un registro de modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para GPT-2 Large INT8: aproximadamente 0,8-1,0 GB para los pesos empaquetados; la de-cuantizacion a BF16 requiere alrededor de 1,5-1,6 GB, mas memoria para activaciones y cache KV.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para GPT-2 Large INT8 (RTX 3050, RTX 4060, T4). Para las variantes planificadas: QwQ-32B INT8 requiere en torno a 32-40 GB (A100 40GB, L40S, 2x RTX 4090); DeepSeek-R1/V3 671B INT8 requiere aproximadamente 625 GiB en disco y un cluster multi-GPU (8x H100 80GB o similar) para inferencia.
- Cabe en GPU consumer: si, GPT-2 Large INT8 cabe en cualquier GPU consumer con 4 GB o mas.
- Opciones de despliegue: no hay soporte nativo en vLLM, llama.cpp, Ollama ni TGI; el unico camino documentado es el lector Python incluido (`load_int8_model.py`) mas `transformers` tras remapeo. Para produccion habria que escribir un adaptador propio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| NITRO GPT-2 Large INT8 | 774M | no disponible | INT8 empaquetado propietario | Apache-2.0 (codigo) / pesos bajo aprobacion | Disponible en HF |
| GPT-2 Large original (OpenAI) | 774M | 1024 tokens | safetensors / PyTorch | MIT | Disponible en HF |
| GPT-2 Large cuantizado GGUF (comunidad) | 774M | 1024 tokens | GGUF (Q4, Q5, Q8) | MIT | Multiples repos en HF, compatible con llama.cpp |
| QwQ-32B (Qwen) | 32,5B | 131.072 tokens | safetensors | Apache-2.0 | Disponible; variante NITRO planificada |

La comparativa directa con GPT-2 Large original es la mas relevante: NITRO ofrece una reduccion de tamano en disco (0,78 GiB frente a aproximadamente 1,5 GiB en BF16) a cambio de un formato no estandar que requiere codigo propio para cargarse. Frente a las cuantizaciones GGUF de la comunidad, NITRO no ofrece compatibilidad con llama.cpp ni con el ecosistema de inferencia establecido, lo que limita su utilidad practica fuera del propio proyecto.

## Limitaciones y advertencias

- El repositorio contiene exclusivamente artefactos de pesos y codigo minimo de carga; no incluye codigo de entrenamiento, scripts de exportacion, logs ni paper, lo que impide reproducir el proceso de cuantizacion.
- Los pesos no son checkpoints estandar de `transformers`: `from_pretrained()` falla directamente; es obligatorio usar `load_int8_model.py` y, para GPT-2, `to_hf_state_dict.py`.
- Solo esta disponible la variante de GPT-2 Large; QwQ-32B esta "planned" y DeepSeek-R1/V3 estan "on request" con requisito de 2 TB de disco, sin garantia de publicacion.
- El autor advierte que la publicacion esta sujeta a aprobacion del proyecto y que el repositorio debe mantenerse privado hasta entonces; el estado actual de disponibilidad publica no esta confirmado.
- GPT-2 Large es un modelo de 2019 con conocimiento limitado, sesgos conocidos del corpus C4 (predominantemente ingles, con sesgos de genero, raza y religion documentados en la literatura) y alta propension a la alucinacion en tareas factuales.
- Capacidad multilingue practicamente nula fuera del ingles; no apto para produccion en castellano sin fine-tuning.
- Sin soporte de tool calling, agentes ni razonamiento multi-paso.
- La licencia Apache-2.0 cubre el codigo, pero los pesos se describen como "project artifacts" sujetos a aprobacion, lo que genera incertidumbre sobre el uso comercial de los artefactos INT8.
- No hay benchmarks publicados que permitan estimar la perdida de calidad introducida por el esquema INT8 frente al checkpoint BF16.
- El esquema `nitro-int8-codes+scales-v1` no esta documentado en detalle mas alla de la estructura de ficheros; la implementacion de referencia es el propio lector Python.
- Sin integracion con vLLM, llama.cpp, Ollama ni TGI, lo que obliga a desarrollar infraestructura de inferencia propia.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/gongcheng191908/NITRO-Quant-Models
- Directorio GPT-2 Large 774M INT8: https://huggingface.co/gongcheng191908/NITRO-Quant-Models/tree/main/gpt2-large-774m-int8
- Proyecto 2025KF1B0030 (Pengcheng Laboratory, "揭榜挂帅"): no disponible enlace publico
- Paper de NITRO: no disponible
- Repositorio de codigo de entrenamiento: no incluido en la informacion disponible
