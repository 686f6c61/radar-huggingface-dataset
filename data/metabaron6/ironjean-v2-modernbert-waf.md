# Metabaron6/IronJean-v2-ModernBERT-WAF

## Resumen

IronJean v2.6 ModernBERT WAF es un clasificador de texto basado en `answerdotai/ModernBERT-base`, desarrollado por el usuario independiente Metabaron6 y orientado especificamente a la deteccion de ataques en firewalls de aplicaciones web (WAF) para gateways de API REST y microservicios. El modelo se presenta como un checkpoint de linea base para adaptacion de dominio en tareas de seguridad, no como un motor de reglas cerrado, y esta pensado para inspeccionar peticiones HTTP completas (metodo, URI, cabeceras y cuerpo) sin truncamiento.

La propuesta tecnica se apoya en tres innovaciones declaradas por el autor: *Vectorized Landmark Pooling* (agregacion sobre marcas estructurales del HTTP), normalizacion anti-evasion recursiva multipaso (`HTTPNormalizer` v2.6) y troceado por ventanas deslizantes con deteccion de sintaxis y salida temprana (*early-exit*) para cuerpos de peticion que superan la ventana de contexto. Con 149 millones de parametros y una ventana de 8.192 tokens heredada de ModernBERT, el modelo cubre familias de ataque modernas (OWASP, CVE 2024-2026) y protocolos como REST/JSON, GraphQL, XML/SOAP, Form/Multipart, gRPC y OAuth2/JWT.

El modelo es relevante ahora porque propone sustituir la clasificacion lexica por regex o los clasificadores BERT de 512 tokens por un enfoque semantico con contexto largo, y porque se distribuye con pesos en safetensors, exportaciones ONNX (FP32, FP16, QUInt8) y un *playground* interactivo en Hugging Face Spaces. La licencia Apache 2.0 facilita su evaluacion y despliegue comercial, aunque las cifras de rendimiento declaradas (99,9994 % de exactitud global) deben tratarse con cautela al proceder unicamente de la model card del autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (ModernBERT-base) con Vectorized Landmark Pooling y cabecera de clasificacion |
| Parametros totales | 149.015.810 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8.192 tokens (RoPE + Flash Attention / Unpadding); troceado por ventanas deslizantes para entradas mayores |
| Tipos de cuantizacion | ONNX FP32, ONNX FP16, ONNX QUInt8; CUDA bfloat16 |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, ONNX, PyTorch; codigo personalizado (`custom_code`, `modeling_ironjean.py`) |
| Modelo base | answerdotai/ModernBERT-base |
| Pipeline | text-classification |
| Tamano del repositorio | 12,4 GB |
| Descargas / likes | 411 / 2 |
| Fecha de creacion / actualizacion | 2026-10-11 / 2026-11-22 |

## Arquitectura y entrenamiento

El modelo parte de ModernBERT-base, un encoder transformer con atencion rotatoria (RoPE), Flash Attention y *unpadding*, y anade una capa de agregacion propietaria denominada *Vectorized Landmark Pooling*, que agrega representaciones en funcion de marcas estructurales del HTTP (metodo, URI, cabeceras y cuerpo) en lugar de depender exclusivamente del token `[CLS]`. Sobre esa base se incorpora una normalizacion anti-evasion recursiva (`HTTPNormalizer` v2.6) que decodifica entidades HTML numericas consecutivas, desempaqueta JWT malformados mediante Base64URL con perdida y aplica una guarda de cabeceras de tres ventanas (cabeza, extracto de explotacion en el medio y cola) para evitar *bypasses* por relleno de mas de 512 caracteres. El troceado por ventanas deslizantes (hasta 32 fragmentos solapados, ~205 KB) alinea los cortes con delimitadores JSON/XML/Form/Multipart y activa salida temprana en cuanto un fragmento supera el umbral de ataque.

El autor declara un proceso de adaptacion de dominio denominado *Zero-Forgetting WAF Domain Adaptation*, que combina *Landmark Pooling*, WiSE-FT y un sintetizador de contratos Swagger 2.0 / OpenAPI 3.x para ingerir endpoints, parametros de ruta, tipos de consulta y esquemas JSON/XML/Form. Los datos de entrenamiento proceden, segun la model card, exclusivamente de conjuntos de codigo abierto y sinteticos "totalmente limpiados". No se especifica en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO; al tratarse de una tarea de clasificacion, lo esperable seria ajuste supervisado, pero no hay confirmacion explicita.

## Capacidades

- Clasificacion binaria de peticiones HTTP (benigna frente a maliciosa) sobre cuatro marcas estructurales: `METHOD`, `URI`, `HEADERS` y `BODY`.
- Deteccion declarada de 22 familias de ataque, CVEs modernas (2024-2026) y tecnicas de evasion, segun la discusion enlazada por el autor.
- Inspeccion de cuerpos de peticion de gran tamano mediante troceado por ventanas deslizantes con salida temprana, sin truncamiento ciego.
- Normalizacion anti-evasion: decodificacion de entidades HTML numericas consecutivas, desempaquetado de JWT no saludables y validacion *fail-closed* de JWT.
- Soporte de protocolos REST/JSON, GraphQL, XML/SOAP, Form/Multipart, gRPC y OAuth2/JWT.
- Capacidad de adaptacion a contratos OpenAPI/Swagger para ajuste de dominio.
- Exportacion a ONNX (FP32, FP16, QUInt8) y ejecucion en CUDA con bfloat16.
- No se documentan capacidades de generacion de texto, razonamiento general, codigo, matematicas, vision, audio, *tool calling* ni agentes: es un clasificador puro.
- Capacidad multilingue limitada al ingles.

## Casos de uso

- **Shadow mode en produccion**: desplegar el modelo en paralelo al WAF existente para comparar sus veredictos con las reglas actuales sobre trafico real y calibrar umbrales antes de bloquear, aprovechando que el autor lo presenta explicitamente como checkpoint de linea base.
- **Proteccion de gateways de API REST**: clasificar peticiones completas (cabeceras y cuerpo JSON) en el punto de entrada para detectar inyecciones, XXE o abusos de esquema, gracias a la ventana de 8.192 tokens y al troceado de cuerpos grandes.
- **Validacion de credenciales JWT**: usar la normalizacion *fail-closed* de JWT para rechazar tokens malformados o no UTF-8 y desempaquetar segmentos sospechosos antes de la clasificacion, reduciendo el riesgo de aceptar Bearer opacos.
- **Analisis de trafico GraphQL y SOAP**: el modelo declara soporte para estos protocolos, por lo que encaja en gateways que reciben consultas anidadas o documentos XML donde las reglas regex tradicionales generan falsos positivos.
- **Filtrado en pipelines de CI/CD de seguridad**: ejecutar el modelo exportado a ONNX sobre corpus de peticiones de prueba (por ejemplo, `waf-bench` o `gotestwaf`) para regresionar reglas y detectar regresiones en la deteccion de evasion.
- **Adaptacion a APIs internas con OpenAPI**: ingerir el contrato Swagger/OpenAPI de un servicio propio mediante el sintetizador declarado y ajustar el checkpoint con WiSE-FT para reducir falsos positivos sobre endpoints legitimos.
- **Despliegue en edge con cuantizacion**: usar la variante ONNX QUInt8 para entornos con recursos limitados donde no hay GPU dedicada, manteniendo la inspeccion de cabeceras y cuerpos moderados.

## Benchmarks y rendimiento

Los unicos datos disponibles proceden de la model card del autor y no han sido verificados de forma independiente.

| Benchmark / conjunto | Metrica | Resultado declarado |
|---|---|---|
| Global (160.500 payloads) | Accuracy | 99,9994 % |
| Global (160.500 payloads) | Precision | 99,9988 % (0,0012 % FPR; 1 FP) |
| Global (160.500 payloads) | Recall | 100,0000 % (0,0000 % FNR; 0 FN) |
| `waf-bench` (externo) | Accuracy / Precision | 100,00 % / 100,00 % (0 FP) |
| `gotestwaf` (externo) | Accuracy / Precision | 100,00 % / 100,00 % (0 FP) |
| Postman-Echo (integracion) | PASS | 227/227 en 15,51 s; 167 ms E2E (Java DJL ONNX FP16 CUDA) |

No se han publicado resultados de benchmarks estandar de NLP (MMLU, HumanEval, GSM8K) en la informacion disponible, lo cual es coherente con la naturaleza de clasificador especializado del modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,6 GB en FP16 (149 M de parametros), alrededor de 1,2 GB en FP32 y en torno a 0,3 GB en QUInt8 (solo pesos; el consumo real depende del *runtime* y del tamano de lote).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM para FP16; el autor cita ejecucion en CUDA con bfloat16 y una prueba E2E en Java DJL ONNX FP16 CUDA con latencia de 167 ms.
- Cabe en GPU de consumo: si, practicamente cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) e incluso en CPU mediante ONNX Runtime o llama.cpp no aplica (no es un modelo generativo).
- Opciones de despliegue: transformers con `trust_remote_code` (requiere `modeling_ironjean.py`), ONNX Runtime (FP32/FP16/QUInt8), Text Embeddings Inference (tag `text-embeddings-inference`), endpoints compatibles de Hugging Face; el autor menciona integracion con Java DJL.
- Latencia y throughput: 167 ms E2E declarados en la prueba de integracion Postman-Echo con ONNX FP16 CUDA; no se publican cifras de throughput (peticiones por segundo) ni latencia por tamano de entrada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| IronJean v2.6 ModernBERT WAF | 149 M | 8.192 tokens (+ troceado) | Clasificador WAF sobre ModernBERT con pooling por marcas HTTP | Apache 2.0 | Hugging Face, ONNX, Spaces |
| ModernBERT-base (base) | 149 M | 8.192 tokens | Encoder generico de texto | Apache 2.0 | Hugging Face |
| Clasificadores BERT de 512 tokens para WAF | ~110 M (tipico) | 512 tokens | Clasificacion lexica/semantica con truncamiento | Variable | Hugging Face, repositorios comunitarios |
| Motores de reglas WAF (ModSecurity/CRS, Coraza) | no aplica | no aplica | Reglas regex y heuristicas | Apache 2.0 / GPL segun proyecto | Ampliamente desplegado |

No se dispone de datos verificados de rendimiento de los modelos alternativos en los mismos conjuntos, por lo que la comparacion cuantitativa no esta disponible.

## Limitaciones y advertencias

- Las cifras de rendimiento (99,9994 % de exactitud, 0 falsos negativos) proceden unicamente de la model card del autor y no han sido replicadas de forma independiente; deben validarse sobre trafico propio antes de cualquier decision de bloqueo.
- Modelo solo en ingles: la deteccion sobre peticiones con contenido en otros idiomas o codificaciones no documentadas no esta garantizada.
- Riesgo de alucinacion en sentido estricto no aplica (no genera texto), pero si existe riesgo de clasificacion erronea y de sobreajuste a los conjuntos sinteticos y de codigo abierto empleados en el entrenamiento.
- Sesgos potenciales derivados de la distribucion de los datos de entrenamiento: endpoints, esquemas y protocolos poco representados (por ejemplo, APIs propietarias o binarias) pueden generar falsos positivos o negativos.
- Requiere codigo personalizado (`trust_remote_code=True`) para cargar el modelo, lo que implica revisar `modeling_ironjean.py` antes de ejecutarlo en produccion.
- El troceado por ventanas deslizantes introduce hasta 32 fragmentos por peticion en cuerpos grandes, con el coste de latencia asociado; la salida temprana mitiga pero no elimina ese coste.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias ni soporte; es un proyecto de investigacion independiente.
- El repositorio ocupa 12,4 GB, lo que puede complicar el despliegue en entornos con almacenamiento limitado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Metabaron6/IronJean-v2-ModernBERT-WAF
- Playground interactivo (Hugging Face Spaces): https://huggingface.co/spaces/Metabaron6/IronJean-v2-Playground
- Discusion sobre vectores de ataque soportados: https://huggingface.co/Metabaron6/IronJean-v2-ModernBERT-WAF/discussions/1
- Discusion sobre adaptacion de dominio (Landmark Pooling + WiSE-FT + Swagger Synthesizer): https://huggingface.co/Metabaron6/IronJean-v2-ModernBERT-WAF/discussions/2
- Modelo base ModernBERT: https://huggingface.co/answerdotai/ModernBERT-base
- ONNX Runtime: https://onnxruntime.ai/
