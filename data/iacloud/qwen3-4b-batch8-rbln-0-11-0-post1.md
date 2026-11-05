# iAcloud/Qwen3-4B-Batch8-RBLN-0.11.0.post1

## Resumen

`iAcloud/Qwen3-4B-Batch8-RBLN-0.11.0.post1` es un artefacto compilado del modelo `Qwen/Qwen3-4B` (4.000 millones de parametros, licencia Apache-2.0) preparado para ejecutarse sobre NPUs Rebellions RBLN-CA25 mediante la libreria `optimum-rbln`. No se trata de un modelo nuevo ni de un fine-tuning: es el checkpoint original en bf16 compilado con `rebel-compiler==0.11.0.post1` para un despliegue concreto de 4 NPUs en paralelo tensorial, con `max_seq_len` de 40.960 tokens y `batch_size` de 8.

Su relevancia es practica: permite servir Qwen3-4B con `vllm-rbln` en hardware NPU alternativo a GPU, con un rendimiento medido de 442,6 tokens/s en configuracion de 8 clientes concurrentes, frente a 99,5 tokens/s de la variante con batch 1. El repositorio contiene unicamente el artefacto compilado (10,3 GB); requiere NPUs RBLN y el SDK de Rebellions para funcionar, por lo que no es utilizable en GPU convencionales ni en CPU.

El modelo base Qwen3-4B es un transformer denso de la familia Qwen3, orientado a generacion de texto, razonamiento y conversacion, con soporte de modo thinking. Esta ficha describe el artefacto compilado y las caracteristicas heredadas del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (modelo base Qwen3-4B); artefacto compilado para NPU RBLN |
| Parametros totales | 4.000 millones (modelo base Qwen3-4B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 40.960 tokens (`max_seq_len` de compilacion) |
| Tipos de cuantizacion | bf16 en el checkpoint de origen; el artefacto compilado no expone cuantizacion adicional. No se puede compilar la variante FP8 oficial con `optimum-rbln==0.11.0.post1` |
| Idiomas soportados | no disponible en la informacion proporcionada |
| Licencia | Apache-2.0 (heredada de Qwen/Qwen3-4B) |
| Formato de pesos | artefacto compilado RBLN (no safetensors ni GGUF); incluye `rbln_config.json` y `genia_compile_manifest.json` |

## Arquitectura y entrenamiento

El modelo base `Qwen/Qwen3-4B` es un transformer denso de 4.000 millones de parametros desarrollado por Alibaba Qwen. La informacion disponible no detalla la composicion del dataset de entrenamiento, el numero de tokens ni si se aplicaron fases de RLHF o DPO; estos datos deben consultarse en la model card oficial de Qwen3-4B.

La innovacion de este repositorio es la compilacion para NPU: se compila el checkpoint bf16 con `rebel-compiler==0.11.0.post1` sobre 4 dispositivos RBLN-CA25 con paralelismo tensorial 4, atencion `flash_attn` y `kvcache_partition_len` de 8.192. El resultado queda fijado en el artefacto: el reparto entre 4 dispositivos esta embebido y no debe pasarse `--tensor-parallel-size` en el servidor. El repositorio hermano `iAcloud/Qwen3-4B-RBLN-0.11.0.post1` es identico salvo por `batch_size` (1 frente a 8), concebido como par A/B para medir throughput con batching dinamico.

## Capacidades

- Generacion de texto y conversacion multi-turno, heredadas del modelo base Qwen3-4B.
- Razonamiento y modo thinking, segun las capacidades del modelo base Qwen3.
- Generacion de codigo y resolucion de problemas matematicos, en la medida en que lo soporte Qwen3-4B.
- Soporte de tool calling y function calling: no confirmado en la informacion disponible para este artefacto.
- Capacidades de agente y razonamiento multi-paso: no confirmadas en la informacion disponible.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Servido mediante API compatible con OpenAI a traves de `vllm-rbln`.
- Batching dinamico con hasta 8 peticiones concurrentes por instancia compilada.

## Casos de uso

- Servicio de inferencia en infraestructura NPU: despliegue de Qwen3-4B sobre 4 NPUs RBLN-CA25 con `vllm serve`, útil cuando se dispone de hardware Rebellions y se quiere evitar GPU. El artefacto ya incluye la configuracion de compilacion, por lo que el arranque es inmediato.
- Pruebas de throughput y capacidad de batching: el par A/B con las variantes batch 1 y batch 8 permite medir el escalado del servidor con cargas concurrentes reales (442,6 frente a 99,5 tokens/s).
- Backend de generacion de texto para aplicaciones internas: con 40.960 tokens de contexto compilado, admite conversaciones y documentos de longitud media dentro de un servicio compatible con la API de OpenAI.
- Evaluacion comparativa de hardware: util para equipos que comparan NPU RBLN-CA25 frente a GPU en coste por token, usando las cifras de throughput publicadas como referencia.
- Prototipado de asistentes conversacionales: el modelo base Qwen3-4B es adecuado para tareas de chat y generacion de texto en entornos controlados, siempre que el hardware sea RBLN.
- Validacion de pipelines `optimum-rbln` y `vllm-rbln`: sirve como referencia de compilacion correcta (manifest incluido) para equipos que porten otros modelos a NPU RBLN.

## Benchmarks y rendimiento

Los unicos datos publicados son mediciones de throughput del artefacto, no benchmarks de calidad del modelo. Se realizaron a traves de una pasarela compatible con OpenAI, sin streaming, 8 clientes concurrentes durante 600 s por variante, `max_tokens` 256, temperatura 0 y el mismo prompt en cada peticion.

| Variante | Peticiones (fallidas) | Tokens de salida | Tiempo medido | Throughput |
|---|---:|---:|---:|---:|
| `Qwen3-4B-RBLN-0.11.0.post1` (batch 1) | 241 (0) | 61.696 | 620,2 s | 99,5 tok/s |
| `Qwen3-4B-Batch8-RBLN-0.11.0.post1` (batch 8) | 1.040 (0) | 266.240 | 601,5 s | 442,6 tok/s |

El batching a 8 multiplica por 4,45 el throughput de la variante batch 1 (+345,0 %). No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- NPU: 4 unidades RBLN-CA25 en paralelo tensorial 4. El artefacto no funciona en GPU ni en CPU.
- Software: `rebel-compiler==0.11.0.post1`, `optimum-rbln==0.11.0.post1`, `vllm-rbln==0.11.0`, `transformers==5.8.1`, `torch==2.11.0+cpu`.
- VRAM: no aplica; la memoria requerida es la de las NPUs RBLN-CA25, cuyo dato concreto no se detalla en la informacion disponible.
- GPU de consumo: no compatible. No cabe en RTX 4090 ni en ninguna GPU convencional por tratarse de un artefacto compilado para NPU.
- Despliegue: `vllm serve <repo-o-ruta-local>` con `vllm-rbln`; la configuracion de batch, longitud maxima y numero de dispositivos se lee de `rbln_config.json`.
- Throughput medido: 442,6 tokens/s con batch 8 y 99,5 tokens/s con batch 1 en 4 NPUs RBLN-CA25.
- Latencia: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Hardware | Licencia | Throughput medido |
|---|---:|---:|---|---|---|
| `iAcloud/Qwen3-4B-Batch8-RBLN-0.11.0.post1` | 4.000 M | 40.960 | 4× RBLN-CA25 | Apache-2.0 | 442,6 tok/s (batch 8) |
| `iAcloud/Qwen3-4B-RBLN-0.11.0.post1` | 4.000 M | 40.960 | 4× RBLN-CA25 | Apache-2.0 | 99,5 tok/s (batch 1) |
| `Qwen/Qwen3-4B` (original) | 4.000 M | no disponible | GPU/CPU segun runtime | Apache-2.0 | no disponible |

La comparacion con alternativas de otros fabricantes (Llama, Gemma, Mistral de tamano similar) no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Dependencia total de hardware Rebellions RBLN-CA25 y del SDK `rebel-compiler`/`optimum-rbln` en las versiones exactas indicadas; no es portable a GPU ni a CPU.
- El artefacto tiene el paralelismo tensorial fijado a 4 dispositivos; no se debe pasar `--tensor-parallel-size` al servidor.
- No se puede compilar la variante oficial `Qwen/Qwen3-4B-FP8` con `optimum-rbln==0.11.0.post1` por incompatibilidad con sus escalas FP8 de bloque 128×128.
- El contexto util esta limitado a 40.960 tokens por la configuracion de compilacion, no por el modelo base.
- Riesgo de alucinacion y sesgos propios del modelo base Qwen3-4B; no se documentan evaluaciones de seguridad en la informacion disponible.
- Idiomas soportados no documentados en este repositorio; deben consultarse en la model card de Qwen3-4B.
- Uso comercial permitido por Apache-2.0, sujeto a los terminos del modelo original Qwen/Qwen3-4B.
- Repositorio sin descargas ni likes en el momento de la consulta; sin comunidad ni soporte documentado.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/iAcloud/Qwen3-4B-Batch8-RBLN-0.11.0.post1
- Variante batch 1 (par A/B): https://huggingface.co/iAcloud/Qwen3-4B-RBLN-0.11.0.post1
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B
- Variante FP8 oficial del modelo base: https://huggingface.co/Qwen/Qwen3-4B-FP8
