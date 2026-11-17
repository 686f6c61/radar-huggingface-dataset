# fjolsvin/Friday-35B-sharded-tiiny

## Resumen

FRIDAY-35B es un ajuste fino (SFT completo) del modelo base Qwen/Qwen3.6-35B-A3B, orientado a ingenieria de software senior: revision de codigo, diseno de sistemas y razonamiento arquitectonico. Lo entrena dangell7 y esta publicado en Hugging Face; la version aqui descrita es un reempaquetado realizado por fjolsvin con la herramienta tiiny-forge, cuyo objetivo es que la importacion de Tiiny Pocket acepte el modelo como fine-tune del modelo de tienda Qwen/Qwen3.6-35B-A3B. Los pesos del ajuste fino son identicos a los del original; los tensores que faltaban en el build de texto se han anadido desde el modelo base.

El modelo es un Mixture-of-Experts (MoE) de aproximadamente 35B parametros totales con unos 3B parametros activos por token (256 expertos, 8 activos por token), construido sobre una arquitectura con atencion hibrida GDN (Gated DeltaNet) del base Qwen3.6. El reempaquetado anade los 333 tensores del modulo visual del base (0,89 GB) y divide los pesos en 16 shards de como maximo 5 GB, manteniendo los tensores byte a byte.

Es relevante ahora porque combina el coste de inferencia de un modelo de ~3B activos con la profundidad de un modelo de 35B, y porque esta especializado en tareas de revision y razonamiento sobre codigo en Rust, Python, TypeScript, C++, Go y Java, un nicho con pocas alternativas abiertas y con licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con atencion hibrida GDN (Gated DeltaNet); 256 expertos, 8 activos por token |
| Parametros totales | ~35B (declarado por el autor); el safetensors del repo reempaquetado declara 258.688 |
| Parametros activos | ~3B por forward pass |
| Longitud de contexto | no disponible (el entrenamiento uso secuencias de 8.192 tokens) |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16) |
| Idiomas soportados | no disponible (entrenado para codigo en Rust, Python, TypeScript, C++, Go y Java) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (16 shards de <=5 GB) + artefactos de tokenizer/preprocesador |
| Modalidad | image-text-to-text (modulo visual anadido desde el base) |
| Modelo base | Qwen/Qwen3.6-35B-A3B |
| Metodo de entrenamiento | SFT completo (full fine-tune) |
| Datos de entrenamiento | 2.472 trazas de razonamiento |
| Hardware de entrenamiento | 8x A100 80GB |
| Framework | TRL SFTTrainer + DeepSpeed ZeRO-3 |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del base Qwen3.6-35B-A3B: un transformer con capas MoE de 256 expertos y 8 expertos activos por token, lo que da unos 3B parametros activos por forward pass frente a ~35B totales. El base incorpora atencion hibrida GDN (Gated DeltaNet), una variante de atencion lineal que reduce el coste de contexto largo. El ajuste fino se realizo sobre el modelo completo con SFT (no RLHF ni DPO), usando 2.472 trazas de razonamiento, secuencias de 8.192 tokens, 3 epocas, learning rate 2e-5 con schedule coseno, precision BF16 + TF32 y DeepSpeed ZeRO-3 sobre 8x A100 80GB.

El reempaquetado tiiny-forge no modifica los pesos del ajuste fino: sustituye config.json por el del base con su esquema de transformers, anade 333 tensores del modulo visual (`model.visual.*`, 0,89 GB) desde Qwen/Qwen3.6-35B-A3B como `model-graft-from-base.safetensors`, divide model.safetensors en 16 shards de <=5 GB y copia merges.txt, vocab.json, preprocessor_config.json y video_preprocessor_config.json del base. El resultado es un build multimodal (image-text-to-text) aunque el ajuste fino original era solo de texto.

## Capacidades

- Generacion de texto y razonamiento con trazas explicitas de razonamiento (reasoning traces).
- Revision de codigo: deteccion de bugs de concurrencia, problemas de consistencia de datos y antipatrones arquitectonicos.
- Diseno de sistemas: diagnostico, identificacion de causas raiz y propuesta de soluciones a corto y largo plazo.
- Razonamiento arquitectonico: evaluacion de tradeoffs en lugar de recetas unicas.
- Programacion multilingue: Rust, Python, TypeScript, C++, Go y Java.
- Procesamiento image-text-to-text gracias al modulo visual anadido en el reempaquetado.
- Conversacional (tag `conversational`) y compatible con endpoints (tag `endpoints_compatible`).
- No se documenta soporte explicito de tool calling ni de function calling en la informacion disponible.
- No se documenta soporte de audio ni de agentes multi-paso mas alla del razonamiento encadenado.

## Casos de uso

- Revision de codigo automatizada en CI/CD: el modelo puede analizar diffs y servicios completos en busca de bugs de concurrencia y antipatrones; el autor reporta 10/10 bugs detectados en un servicio de checkout asincrono en Python con ~162 tok/s.
- Auditoria de codigo asincrono y sistemas distribuidos: detecta problemas de TTL de locks, desreferencias nulas y desajustes de tipos en Redis, y cuestiona decisiones arquitectonicas (por ejemplo, locks distribuidos redundantes frente a locking a nivel de base de datos).
- Diseno y revision de arquitectura de software: dado un conjunto de requisitos, produce diagnosticos con causas raiz y alternativas a corto y largo plazo, util en revisiones de diseno de equipos senior.
- Asistencia a equipos poliglotas: al cubrir Rust, Python, TypeScript, C++, Go y Java, sirve como revisor transversal en monorepos con multiples stacks.
- Generacion de documentacion tecnica y post-mortems: puede redactar explicaciones de causas raiz a partir de trazas y codigo, aprovechando sus trazas de razonamiento.
- Analisis de capturas y diagramas en pipelines de revision: gracias al modulo visual anadido, puede procesar imagenes junto con texto (por ejemplo, diagramas de arquitectura adjuntos a una revision).
- Despliegue self-hosted con SGLang: el autor documenta arranque con `--tp 8` y bfloat16, adecuado para servir el modelo en infraestructura propia con GPUs de 80 GB.

## Benchmarks y rendimiento

El model-index oficial declara `results: []`, por lo que no hay benchmarks estandar (MMLU, HumanEval, GSM8K) publicados. El autor solo reporta una evaluacion propia sobre un servicio de checkout asincrono en Python con 10 bugs plantados:

| Metrica | FRIDAY-35B | Competidor (API) |
|---|---|---|
| Bugs encontrados | 10/10 | 7/10 |
| Tiempo | 19,5 s | 53,2 s |
| Tokens de salida | 3.156 | 4.226 |
| Throughput | ~162 tok/s | ~79 tok/s |

No se han publicado resultados de benchmarks estandar en la informacion disponible.

## Requisitos de hardware

- El autor indica que la arquitectura MoE requiere VRAM significativa: aproximadamente 8x A100 80GB o equivalente para servir en BF16.
- Los pesos publicados en BF16 ocupan ~70,2 GB (tamano del repo, incluidos shards y artefactos); en FP8 o INT8 el requisito baja aproximadamente a la mitad, aunque no se documentan cuantizaciones oficiales.
- GPU recomendadas: A100 80GB u H100 para despliegue multi-GPU con tensor parallelism (`--tp 8` en SGLang). No se documenta viabilidad en RTX 4090 (24 GB) con los pesos completos en BF16.
- Despliegue: SGLang (`python -m sglang.launch_server --model ... --dtype bfloat16 --tp 8 --trust-remote-code`) y Transformers (`AutoModelForCausalLM.from_pretrained(..., torch_dtype="bfloat16", device_map="auto")`). No se mencionan vLLM, llama.cpp, Ollama ni TGI en la informacion disponible.
- Latencia y throughput: ~162 tok/s reportados por el autor en su evaluacion; no hay datos de latencia por peticion ni de throughput agregado en produccion.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| FRIDAY-35B (este) | ~35B | ~3B | no disponible | Apache 2.0 | Fine-tune SFT para ingenieria de software senior; multimodal tras reempaquetado |
| Qwen/Qwen3.6-35B-A3B (base) | ~35B | ~3B | no disponible | Apache 2.0 (segun el repo base) | Modelo generalista multimodal del que deriva; sin especializacion en code review |
| Competidor API citado por el autor | no disponible | no disponible | no disponible | propietaria | 7/10 bugs, 53,2 s, ~79 tok/s en la evaluacion del autor |
| dangell7/Friday-35B (original) | ~35B | ~3B | no disponible | Apache 2.0 | Build solo texto; pesos identicos a este reempaquetado |

No se dispone de datos de benchmarks comparativos estandar para establecer diferencias de rendimiento con alternativas abiertas de la misma categoria.

## Limitaciones y advertencias

- Es un LLM autorregresivo y puede alucinar detalles tecnicos; el propio autor lo advierte.
- No sustituye la revision humana de codigo en sistemas de produccion.
- La arquitectura MoE exige VRAM elevada (~8x A100 80GB o equivalente) para servir en BF16.
- El ajuste fino original era solo de texto; el modulo visual del reempaquetado proviene del base y no fue entrenado para tareas de revision de codigo sobre imagenes.
- No se documentan idiomas soportados mas alla de los lenguajes de programacion entrenados; el soporte multilingue natural no esta verificado.
- No se documenta soporte de tool calling ni de function calling, lo que limita integraciones agente-based sin capas adicionales.
- El modelo tiene 0 descargas y 0 likes en el momento del registro, por lo que no hay validacion comunitaria independiente.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen3.6-35B-A3B.
- El campo de parametros del safetensors (258.688) no coincide con el ~35B declarado por el autor; tratar las cifras de parametros con cautela hasta verificar el repo original.

## Enlaces

- Repositorio reempaquetado: https://huggingface.co/fjolsvin/Friday-35B-sharded-tiiny
- Modelo original: https://huggingface.co/dangell7/Friday-35B
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Organizacion Qwen: https://huggingface.co/Qwen
- SGLang: https://github.com/sgl-project/sglang
- TRL: https://github.com/huggingface/trl
- DeepSpeed: https://github.com/microsoft/DeepSpeed
