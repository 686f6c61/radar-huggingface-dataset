# Launch80/Swift-1.5-Qwen3.8-27B-Uncensored-Int4-baked

## Resumen

Swift-1.5-Qwen3.8-27B-Uncensored-Int4-baked es una version cuantizada y "abliterated" (sin direccion de rechazo) del modelo Qwen3.8-27B de 27.781.427.952 parametros, publicada por el usuario Launch80. Su objetivo es servir un modelo multimodal de 27.000 millones de parametros a contexto completo de 262.144 tokens en una unica tarjeta de gama profesional, en concreto una Intel Arc Pro B65 de 32 GB, sin necesidad de aplicar parches a los pesos en tiempo de carga.

La innovacion principal de este repositorio es que tanto la cabeza de salida (`lm_head`) como el cabezal de prediccion multi-token (MTP) estan ya cuantizados a GPTQ INT4 simetrico con grupo 128 directamente en disco, de modo que vLLM estandar los carga sin modificaciones. Combinado con un drafter externo DFlash2 INT4, el modelo decodifica a 96,7 tokens por segundo en flujo unico sobre la citada Arc Pro B65, frente a los 80,5 tok/s que logra con MTP integrado.

El modelo es relevante para quienes despliegan LLM en hardware Intel XPU o CUDA con presupuesto de VRAM ajustado y necesitan contexto largo (hasta 262.144 tokens) con decodificacion especulativa funcional. Se distribuye bajo licencia propietaria swift-open-license-1.0 y el repositorio ocupa 17,1 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso derivado de Qwen3.8-27B, con cabezal MTP, torre de vision (image-text-to-text) y componentes Gated DeltaNet (GDN) |
| Parametros totales | 27.781.427.952 (27,78 B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens (con MTP); 131.072 tokens recomendado con el drafter DFlash2 por presupuesto de KV en 32 GB |
| Tipos de cuantizacion | GPTQ INT4 simetrico group 128 en 400 lineales del cuerpo, `lm_head` y el draft MTP; embedding, torre de vision, normas MTP y GDN `in_proj_a`/`in_proj_b` permanecen en BF16; KV cache en fp8 |
| Idiomas soportados | no disponible |
| Licencia | swift-open-license-1.0 (license: other) |
| Formato de pesos | safetensors (GPTQ INT4) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.8-27B y hereda la cadena de post-entrenamiento de Swift-1.5 desarrollada por UkisAI, orientada a eficiencia de razonamiento. Sobre esa base, ajgazin aplico una ablacion de la direccion de rechazo ("abliterated") y edito de forma consistente el cabezal MTP. Posteriormente greglechin cuantizo el cuerpo a GPTQ INT4 simetrico g128 dejando la cabeza y el MTP en BF16, y este repositorio vuelve a cuantizar esos tensores a GPTQ INT4. La arquitectura incluye una torre de vision (pipeline `image-text-to-text`), cabezal de prediccion multi-token (MTP) para decodificacion especulativa y capas Gated DeltaNet (`in_proj_a`/`in_proj_b`).

El proceso de "bake" (cuantizacion) se realizo sirviendo el checkpoint denso en vLLM 0.30.0 con MTP activo y acumulando las segundas matrices de momentos de entrada sobre tres rebanadas generadas: 256 prompts de wikitext, 256 conversaciones de UltraChat pasadas por la plantilla de chat y 128 prompts de CodeParrot, con 128 tokens greedy cada una (unas 290.000 filas para `lm_head`) y reteniendo cada 64.a fila como conjunto de validacion. Cada lineal se cuantizo con tres amortiguamientos (damping) por tres mezclas de rebanadas, escogiendo la configuracion con menor error L2 relativo de salida sobre las filas retenidas. El error relativo resultante fue de 4,81 % en `lm_head`, 7,18 % en `mtp.fc` y ente 2,70 % y 7,81 % en los lineales restantes del draft, mejorando a las alternativas de Wrapzii y a round-to-nearest en todos los casos medidos.

## Capacidades

- Generacion de texto conversacional multi-turno con ventana de contexto de hasta 262.144 tokens.
- Razonamiento eficiente (el post-entrenamiento de Swift-1.5 esta orientado a reducir el coste de razonamiento).
- Entrada de imagenes junto a texto (pipeline `image-text-to-text`, torre de vision).
- Decodificacion especulativa mediante cabezal MTP integrado (k=6) o drafter externo DFlash2 (k=7), con verificacion greedy practicamente identica (15/16 en MTP, 16/16 en DFlash2).
- Generacion de codigo, evidenciada por el uso de prompts de CodeParrot en la calibracion y las pruebas de perplexity sobre corpus mixto.
- Capacidades matematicas basicas: 94 sobre 100 en GSM8K con presupuesto de 1536 tokens.
- Comportamiento "uncensored"/abliterated: 0 rechazos sobre 50 prompts seguros de XSTest.
- Tool calling y soporte de agentes: no disponible en la informacion proporcionada (no se documenta explicitamente en la model card).

## Casos de uso

- Servicio de chat de contexto largo en una unica GPU: el modelo cabe en 15,9 GiB de VRAM residente en vLLM y admite hasta 262.144 tokens, por lo que puede gestionar conversaciones o documentos de cientos de miles de tokens sin fragmentacion ni recuperacion externa.
- Asistente conversacional multimodal: al aceptar entrada de imagen y texto, sirve para tareas de descripcion, respuesta a preguntas sobre imagenes o analisis de capturas dentro de un mismo flujo de chat.
- Despliegue en hardware Intel XPU: el modelo esta validado sobre Intel Arc Pro B65 de 32 GB con vLLM 0.30.0 XPU, por lo que es adecuado para organizaciones que quieran evitar dependencia de CUDA.
- Generacion de codigo asistida en IDE: la decodificacion a 96,7 tok/s en flujo unico con el drafter DFlash2 permite autocompletado interactivo con contexto de repositorio largo.
- Procesamiento batch de documentos largos: con contexto de 262k tokens se pueden resumir o extraer informacion de contratos, informes o transcripciones extensas en una sola pasada.
- Evaluacion de seguridad y red-teaming: al ser abliterated, sirve como modelo de referencia para estudiar la ausencia de rechazos y comparar con variantes alineadas.
- Investigacion sobre cuantizacion y decodificacion especulativa: el repositorio documenta con detalle los errores de cuantizacion por tensor y el rendimiento comparado MTP frente a DFlash2, lo que lo hace util como banco de pruebas reproducible.
- Inferencia con presupuesto de VRAM ajustado: el peso en disco es de 17,05 GB y los tensores de cabeza y MTP ya estan en INT4, lo que reduce el coste de memoria frente a variantes con cabeza en BF16.

## Benchmarks y rendimiento

Metricas de calidad (misma tarjeta, mismo motor):

| Metrica | MTP | DFlash2 | Referencia cabeza densa |
|---|---|---|---|
| Perplexity, corpus mixto 13k tokens | 6,200 | mismo objetivo | 6,186 |
| Perplexity, wikitext-2 test 40x2048 | 6,216 | mismo objetivo | 6,188 |
| GSM8K n=100, presupuesto 1536 tokens | 94 | 94 | no disponible |
| Rechazos en 50 prompts seguros XSTest | 0 | 0/50 | no disponible |
| Greedy spec-on == spec-off, 16 prompts | 15/16 (un empate a 0,016 nat) | 16/16 | no disponible |

Rendimiento de decodificacion (Arc Pro B65 32 GB, vLLM 0.30.0 XPU, KV fp8, flujo unico, BetterBench 0.4.0 quick run, mediana ponderada por categoria):

| Configuracion | Decode ponderado (tok/s) | Tokens/paso | Prefill @2K |
|---|---|---|---|
| MTP k=6 (draft integrado), contexto 262k | 80,5 | 3,35 | 1294 |
| DFlash2 INT4 drafter k=7, contexto 128k | 96,7 | 4,23 | 1290 |
| Referencia: Wrapzii/Swift-1.5-...-baked-v1-embed-int8 (no abliterated), MTP k=6 | 88,6 | 3,68 | 1274 |

Concurrencia (segundo la model card): DFlash2 gana en flujo unico y en concurrencia 4 (184 frente a 169 tok/s agregados), pero pierde en concurrencia 16 (197 frente a 232). El autor advierte que los "quick runs" no son cifras publicables y remite a los JSON como cita de referencia.

## Requisitos de hardware

- VRAM estimada: 15,9 GiB residentes en vLLM tras cargar; 17,05 GB de peso en disco.
- Presupuesto KV: una peticion de 262k tokens requiere 11,5 GiB de KV; el pool de KV a 128k ocupa 157.860 tokens.
- GPU recomendada y validada: Intel Arc Pro B65 de 32 GB (una sola unidad para contexto completo con MTP).
- Compatibilidad CUDA: la model card indica vLLM >= 0.30 en XPU o CUDA, por lo que tambien es desplegable en GPUs NVIDIA.
- Encaje en GPU de consumo: no confirmado oficialmente; con 15,9 GiB residentes seria viable en tarjetas de 24 GB, pero el contexto completo de 262k exigiria el doble de memoria KV y no cabria.
- Opciones de despliegue: vLLM (XPU o CUDA) con `--quantization gptq`; se documentan dos configuraciones, una con especulacion MTP (`--speculative-config '{"method":"mtp","num_speculative_tokens":6}'`) y otra con el drafter DFlash2 (`--speculative-config '{"method":"dflash",...,"num_speculative_tokens":7,"quantization":"gptq"}'`).
- Nota de precision: en Intel XPU el objetivo fp16 es algo mas rapido que bf16; el drafter DFlash2 requiere bf16 porque desborda en fp16.
- Latencia y throughput estimados: 80,5 tok/s con MTP y contexto completo; 96,7 tok/s con DFlash2 a 128k; prefill en torno a 1290-1294 tok/s a 2K.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Decode (tok/s) | Estado | Licencia |
|---|---|---|---|---|---|
| Este repo (cabeza y MTP en INT4) | 27,78 B | 262k (MTP) / 128k (DFlash2) | 80,5 (MTP) / 96,7 (DFlash2) | Abliterated | swift-open-license-1.0 |
| Wrapzii/Swift-1.5-...-baked-v1-embed-int8 | no disponible | no disponible | 88,6 (MTP k=6) | No abliterated | no disponible |
| greglechin/Swift-1.5-Qwen3.8-27B-Uncensored-GPTQ-Int4-sym-G128-MTP-BF16 | 27,78 B (cuerpo INT4, cabeza/MTP BF16) | no disponible | no disponible | Abliterated | no disponible |
| ajgazin/Swift-1.5-Qwen3.8-27B-Uncensored-MTP | 27,78 B (BF16) | no disponible | no disponible | Abliterated | no disponible |

La comparativa se limita a los modelos citados en la propia model card; no se dispone de datos de otras alternativas de tamano o tarea equivalentes en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo "uncensored"/abliterated: se ha eliminado la direccion de rechazo, por lo que no aplica filtros de seguridad estandar; 0 rechazos sobre 50 prompts seguros de XSTest. Puede generar contenido sensible sin objeciones, lo que exige moderacion externa en produccion.
- Riesgo de alucinacion: no se documentan tasas especificas; la naturaleza abliterated no elimina las alucinaciones.
- Idiomas soportados: no disponible; la model card no documenta capacidad multilingue.
- Licencia swift-open-license-1.0 (license: other): es una licencia propietaria personalizada, por lo que hay que revisar el archivo LICENSE antes de uso comercial. No se confirma compatibilidad con uso comercial en la informacion proporcionada.
- Perdida de calidad por cuantizacion: la perplexity sube de 6,186 (cabeza densa) a 6,200/6,216 con la cabeza INT4, y el error relativo de salida en varias lineales del draft supera el 7 % (por ejemplo 7,81 % en `down_proj`).
- Restriccion de contexto con drafter: al anadir el drafter DFlash2, el presupuesto de KV en 32 GB no permite 262k, limitando a 128k (pool de 157.860 tokens).
- Requisitos de precision: el drafter DFlash2 desborda en fp16, obligando a usar bf16 en esa configuracion.
- Dependencia de la version del motor: se documenta con vLLM 0.30.0; versiones anteriores podrian no cargar los tensores INT4 ya "baked".
- Cifras de rendimiento: el propio autor indica que los "quick runs" de BetterBench no son cifras publicables, por lo que los numeros de tok/s deben tomarse como orientativos.

## Enlaces

- HuggingFace (este repositorio): https://huggingface.co/Launch80/Swift-1.5-Qwen3.8-27B-Uncensored-Int4-baked
- Drafter DFlash2 INT4: https://huggingface.co/Launch80/Qwen3.8-27B-DFlash2-Int4-baked-drafter
- Modelo base del que deriva: https://huggingface.co/greglechin/Swift-1.5-Qwen3.8-27B-Uncensored-GPTQ-Int4-sym-G128-MTP-BF16
- Modelo original Qwen: https://huggingface.co/Qwen/Qwen3.8-27B
- Post-entrenamiento Swift-1.5: https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-27b
- Ablacion y edicion MTP: https://huggingface.co/ajgazin/Swift-1.5-Qwen3.8-27B-Uncensored-MTP
- Resultados en bruto (BetterBench): https://launch80.com/a/a22029b0-497e-49e7-9f48-0677f1789da0
- Resultados en bruto (segunda ejecucion): https://launch80.com/a/602f86d7-b0d3-4d2b-9c94-1037fe1d3cd3
