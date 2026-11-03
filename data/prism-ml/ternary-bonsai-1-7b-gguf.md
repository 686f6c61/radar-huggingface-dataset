# prism-ml/Ternary-Bonsai-1.7B-gguf

## Resumen

Ternary-Bonsai-1.7B-gguf es la version cuantizada en formato GGUF de un modelo de lenguaje de 1.720 millones de parametros desarrollado por Prism ML, construido sobre la arquitectura de Qwen3-1.7B. Su caracteristica principal es que los pesos del transformer estan restringidos a valores ternarios {-1, 0, +1} (1.58 bits por peso), lo que permite empaquetar el modelo completo en apenas 436 MiB cuando se usa el formato Q2_0 con grupos de 128 pesos. El modelo se distribuye con licencia Apache 2.0 y esta pensado para inferencia en dispositivo (on-device) mediante `llama.cpp`.

El modelo resuelve el problema del despliegue de LLM en entornos con memoria muy limitada: portatiles, dispositivos moviles, sistemas embebidos o servicios con alta densidad de instancias. Frente a la version FP16 de 3,44 GB, la cuantizacion ternaria reduce el tamano un 86,6 % (factor 7,5x) manteniendo, segun el autor, una fidelidad practicamente identica a la linea base (ratio de perplejidad 1,0048 y 100 % de acuerdo top-1 en wikitext-2).

La relevancia actual del modelo reside en su combinacion de contexto largo (32.768 tokens), vocabulario amplio (151.936 tokens) y un rendimiento en benchmarks que, segun la model card, supera a la generacion anterior de Bonsai de 1 bit y resulta competitivo para su tamano. Es un ejemplo practico de cuantizacion extrema masiva aplicada a un transformer denso (GQA, SwiGLU, RoPE, RMSNorm) sin recurrir a arquitecturas MoE ni a destilacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso con GQA, SwiGLU MLP, RoPE y RMSNorm (base Qwen3-1.7B) |
| Parametros totales | 1.720.028.160 (1,72B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 32.768 tokens |
| Tipos de cuantizacion | GGUF Q2_0 ternario (g128 y g64), PQ2_0 (g128), FP16 |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (F16, Q2_0 g64, Q2_0 g128 legacy, PQ2_0 g128) |
| Vocabulario | 151.936 tokens |
| Tamano empaquetado Q2_0 | 436 MiB (0,46 GB) |
| Tamano FP16 | 3,44 GB |
| Bits efectivos por peso | 2,125 (2 bits de codigo + escala FP16 compartida por grupo de 128) |
| Tamano del repo | 4,9 GB |

## Arquitectura y entrenamiento

El modelo es un transformer denso derivado de Qwen3-1.7B, con atencion de consultas agrupadas (GQA), MLP con activacion SwiGLU, embeddings rotatorios (RoPE) y normalizacion RMSNorm. La innovacion no reside en la arquitectura, sino en la cuantizacion: los pesos ternarios cubren embeddings, proyecciones de atencion, proyecciones del MLP y la cabeza LM. Cada peso toma un valor en {-1, 0, +1} y comparte una unica escala FP16 por grupo de 128 pesos, de modo que `w_i = scale_g * t_i`. El codigo Q2_0 empaqueta cada peso en 2 bits (q en {0,1,2,3}) y se deserializa como `w = (q - 1) * scale`; un bloque de 128 elementos ocupa 34 bytes (2 bytes de escala + 32 bytes de codigos), lo que da los 2,125 bits por peso efectivos.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron fases de RLHF, DPO o ajuste instructivo especificas en la model card. El modelo base declarado es `prism-ml/Ternary-Bonsai-1.7B-unpacked`, del que esta version GGUF es una cuantizacion. La fidelidad de la cuantizacion se ha medido con `llama-perplexity --kl-divergence` sobre wikitext-2 (20 fragmentos, contexto 512): divergencia KL media 0,000000, acuerdo top-1 del 100 %, RMS de la diferencia de probabilidades del 0,015 % y ratio de perplejidad de 1,0048 frente a FP16. Los kernels Q2_0 de grupo 64 estan integrados en `llama.cpp` upstream; el pack PQ2_0 de grupo 128 requiere el fork de Prism ML (rama `prism`).

## Capacidades

- Generacion de texto autoregresiva con contexto de hasta 32.768 tokens.
- Razonamiento basico y respuesta a instrucciones, segun los benchmarks publicados (IFEval 70,1; MuSR 50,8).
- Resolucion de problemas matematicos de nivel escolar (GSM8K 74,2).
- Generacion de codigo (HumanEval+ 51,8).
- Conocimiento general y respuesta a preguntas (MMLU-Redux 52,9).
- Tool calling / function calling (BFCLv3 51,0), adecuado para integraciones con APIs.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- No se documentan capacidades de vision, audio, thinking mode explicito ni agentes multi-paso nativos.

## Casos de uso

- Asistente local en portatil: el modelo cabe en 436 MiB en formato Q2_0, por lo que puede ejecutarse integramente en RAM o VRAM de un equipo de consumo sin GPU dedicada, ofreciendo un asistente de texto sin conexion.
- Despliegue en dispositivos moviles o embebidos: el tamano reducido y el soporte de `llama.cpp` con backend NEON permiten integrarlo en aplicaciones Android o en placas ARM con pocos recursos de memoria.
- Clasificacion y extraccion de informacion sobre documentos largos: con 32.768 tokens de contexto puede procesar contratos, informes o articulos completos en una sola pasada para tareas de resumen y extraccion de entidades.
- Automatizacion de atencion al cliente en el borde: conversaciones multi-turno con contexto largo y tool calling (BFCLv3 51,0) para consultar APIs internas, con coste de infraestructura minimo.
- Generacion de codigo en pipelines de CI/CD: HumanEval+ de 51,8 permite tareas de autocompletado, generacion de tests y refactorizacion acotada alli donde no se requiere un modelo de gran tamano.
- Prototipado rapido y evaluacion de agentes: su bajo coste de despliegue y su compatibilidad con `llama-server` lo hacen util para iterar sobre prompts, herramientas y flujos de agente antes de escalar a modelos mayores.
- Educacion y tutoria offline: resolucion de problemas de matematicas (GSM8K 74,2) en entornos sin conectividad, como aulas o zonas rurales.

## Benchmarks y rendimiento

Evaluado con EvalScope v1.4.2 y vLLM 0.15.1 sobre NVIDIA H100, segun la model card:

| Modelo | Tamano | Avg | MMLU-R | MuSR | IFEval | GSM8K | HE+ | BFCLv3 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| Ternary Bonsai 1.7B | 0,44 GB | 58,47 | 52,9 | 50,8 | 70,1 | 74,2 | 51,8 | 51,0 |
| 1-bit Bonsai 1.7B (anterior) | 0,24 GB | 49,60 | 43,2 | 45,1 | 63,0 | no disponible | no disponible | no disponible |

Throughput medido con `llama.cpp` en Apple M4 Pro de 48 GB:

| Backend | PP512 (tok/s) | TG128 (tok/s) | FP16 TG (tok/s) | Aceleracion |
|---|---:|---:|---:|---:|
| Metal (GPU, `-ngl 99 -fa 1`) | 2.088 | 229 | 60 | 3,8x |
| NEON CPU, 10 hilos (`-ngl 0 -fa 1 -t 10`) | 508 | 123 | no disponible | no disponible |

## Requisitos de hardware

- VRAM/RAM para inferencia: aproximadamente 0,46 GB en Q2_0 g128 y 0,47 GB en Q2_0 g64; 3,44 GB en FP16.
- GPU recomendadas: cualquier GPU con al menos 1 GB de memoria libre; el modelo se ha validado en Apple M4 Pro con backend Metal. Para servidores, una H100 se ha usado en la evaluacion de benchmarks, aunque esta sobredimensionada para el tamano del modelo.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU consumer (GTX 1050, RTX 3060, RTX 4090) e incluso en CPU sola.
- Opciones de despliegue: `llama.cpp` upstream con el fichero Q2_0 g64; fork de Prism ML (rama `prism`) con el fichero PQ2_0 g128; `llama-server` para API compatible con OpenAI; no se documenta soporte de vLLM, TGI u Ollama en la informacion disponible.
- Latencia y throughput: 229 tok/s de generacion en Metal (M4 Pro) y 123 tok/s en CPU NEON con 10 hilos; 2.088 tok/s de prefill en Metal.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tamano empaquetado | Licencia | Disponibilidad |
|---|---:|---:|---:|---|---|
| Ternary-Bonsai-1.7B | 1,72B | 32.768 | 0,44 GB (Q2_0) | Apache 2.0 | GGUF en HuggingFace |
| 1-bit Bonsai 1.7B (anterior) | 1,7B aprox. | no disponible | 0,24 GB | no disponible | HuggingFace (referencia en model card) |
| Qwen3-1.7B (base) | 1,72B | 32.768 | 3,44 GB (FP16) | Apache 2.0 | HuggingFace |

La comparacion con otras alternativas de 1-2B en cuantizacion estandar (por ejemplo, Qwen3-1.7B en Q4_K_M o Llama 3.2 1B) no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la model card; el modelo hereda los sesgos del corpus de entrenamiento de Qwen3-1.7B, no especificado.
- Riesgo de alucinacion: inherente a un modelo de 1,7B; el rendimiento en MMLU-Redux (52,9) y MuSR (50,8) sugiere fiabilidad limitada en conocimiento factual y razonamiento multi-paso.
- Limitaciones de contexto: 32.768 tokens, pero la calidad en contextos muy largos no se ha validado en los benchmarks publicados.
- Idiomas: no se especifica la cobertura linguistica; no asumir un rendimiento multilingue equiparable al del modelo base sin evaluacion propia.
- Compatibilidad de formatos: el fichero Q2_0 g128 legacy es rechazado por las builds actuales de `llama.cpp`; el pack PQ2_0 requiere el fork de Prism ML. Verificar el fichero y el binario antes de desplegar.
- Licencia: Apache 2.0 permite uso comercial, pero conviene revisar las condiciones del modelo base Qwen3-1.7B y de los pesos derivados.
- Produccion: la cuantizacion ternaria puede degradar tareas sensibles a precision numerica o a matices finos del lenguaje; se recomienda validacion especifica en el dominio de uso.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/prism-ml/Ternary-Bonsai-1.7B-gguf
- Modelo base (unpacked): https://huggingface.co/prism-ml/Ternary-Bonsai-1.7B-unpacked
- Web de Prism ML: https://prismml.com
- White paper: https://github.com/PrismML-Eng/Bonsai-demo/blob/main/ternary-bonsai-8b-whitepaper.pdf
- Repositorio de demo y ejemplos: https://github.com/PrismML-Eng/Bonsai-demo
- Fork de `llama.cpp` con kernels PQ2_0: https://github.com/PrismML-Eng/llama.cpp
- Discord: https://discord.gg/prismml
