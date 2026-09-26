# r3lax/Huihui-Ornith-1.5-35B-A3B-abliterated-MTPLX-mixed8-4bit-FP16

## Resumen

Huihui-Ornith-1.5-35B-A3B-abliterated-MTPLX-mixed8-4bit-FP16 es una forja (build) cuantizada y optimizada para Apple Silicon del modelo huihui-ai/Huihui-Ornith-1.5-35B-A3B-abliterated, que a su vez es una version "abliterated" (con las capas 11 a 29 modificadas para eliminar rechazos) del ornith-ai/Ornith-1.5-35B-A3B. La publica el usuario r3lax bajo licencia MIT y esta pensada para ejecutarse con MTPLX, una implementacion de decodificacion especulativa nativa basada en MTP (multi-token prediction) que acelera la inferencia en chips de Apple.

Se trata de un modelo de arquitectura MoE (mezcla de expertos) de tipo qwen3_moe, con 35.107.180.016 parametros totales (unos 35,1 mil millones) y un sufijo A3B que indica del orden de 3 mil millones de parametros activos por token. Combina proyecciones de atencion lineal (linear_attn) y atencion estandar (self_attn), con un tronco en fp16 y un "sidecar" MTP tambien en fp16 que habilita la decodificacion especulativa nativa en Macs M1/M2 (sin BF16 nativo) y M3 o superiores.

Su relevancia es doble: por un lado demuestra un recetario de cuantizacion mixta (4 bits para los expertos MoE y 8 bits para atencion, gates, embeddings y lm_head) que mantiene precision en las partes criticas; por otro, ofrece aceleracion medida sobre un M1 Max de 64 GB, pasando de 51,1 tok/s en modo autorregresivo a 74,8 tok/s con decodificacion especulativa D2 (1,46x). El repositorio no incluye datos de contexto, idiomas ni benchmarks estandar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE tipo qwen3_moe (transformer con atencion lineal y atencion estandar, mas MTP para decodificacion especulativa) |
| Parametros totales | 35.107.180.016 (~35,1 B) |
| Parametros activos | ~3 B (inferido del sufijo A3B; cifra exacta no disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Mixta: 4-bit affine group 32 (expertos MoE), 8-bit affine group 64 (linear_attn, self_attn q/k/v/o, mlp.gate, mlp.shared_expert_gate, lm_head, embed_tokens); tronco fp16 y sidecar MTP fp16 |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (formato MLX); tamano del repositorio 25,3 GB |

## Arquitectura y entrenamiento

El modelo es una forja de inferencia sobre huihui-ai/Huihui-Ornith-1.5-35B-A3B-abliterated, que a su vez deriva de ornith-ai/Ornith-1.5-35B-A3B. La arquitectura base es de tipo qwen3_moe: una mezcla de expertos con parametros totales de 35,1 B y activacion dispersa de aproximadamente 3 B por token (segun el sufijo A3B). La model card menciona explicitamente proyecciones de atencion lineal (linear_attn) y de atencion estandar (self_attn), ademas de una puerta de expertos (mlp.gate) y una puerta de experto compartido (mlp.shared_expert_gate), lo que confirma una topologia MoE con experto compartido.

La innovacion tecnica principal de esta forja es MTPLX (native MTP speculative decoding on Apple Silicon), un mecanismo de decodificacion especulativa basado en multi-token prediction que se ejecuta de forma nativa en Apple Silicon. La forja usa un tronco en fp16 y un sidecar MTP en fp16, ruta rapida en Macs M1/M2 (que no tienen BF16 nativo) y compatible con M3 o superiores. El recetario de cuantizacion es mixto: los expertos MoE (mayoria de pesos) van a 4 bits con grupo 32, mientras que las proyecciones de atencion, gates, lm_head y embeddings se mantienen a 8 bits con grupo 64 para preservar precision. No se detalla en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO. El proceso "abliterated" se aplico sobre las capas 11 a 29 del modelo original para eliminar el comportamiento de rechazo. Fue forjado con MTPLX 2.11.2.

## Capacidades

- Generacion de texto y conversacion multi-turno (pipeline text-generation, etiqueta conversational).
- Modelo base de proposito general; las capacidades especificas de razonamiento, codigo o matematicas no estan documentadas en la informacion disponible.
- Decodificacion especulativa nativa (MTP) para acelerar la generacion en Apple Silicon.
- Comportamiento "uncensored": el proceso de abliteration elimina las capas de rechazo, reduciendo la negativa a responder determinadas peticiones.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible (el campo de idiomas esta vacio).
- Capacidades especiales (modo thinking, vision, audio): no disponible en la informacion proporcionada.

## Casos de uso

- Inferencia local en Mac: ejecucion de un MoE de 35 B totales y ~3 B activos en un M1 Max de 64 GB mediante `mtplx serve --model r3lax/Huihui-Ornith-1.5-35B-A3B-abliterated-MTPLX-mixed8-4bit-FP16 --download`, aprovechando la decodificacion especulativa para alcanzar del orden de 74 tok/s.
- Generacion de texto interactiva de baja latencia: la forja esta optimizada para conversacion en streaming, con un perfil de rendimiento "sustained" medido en carga continua.
- Prototipado de aplicaciones conversacionales sobre Apple Silicon: permite integrar un modelo grande con licencia MIT sin depender de servidores externos.
- Experimentacion con decodificacion especulativa: los modos D1, D2 y D3 permiten medir el impacto del MTP sobre la linea base autorregresiva (1,34x a 1,46x).
- Investigacion sobre cuantizacion mixta: el recetario 8/4 bits sirve como referencia para evaluar el impacto de mantener en 8 bits atencion, gates y embeddings frente a cuantizar los expertos a 4 bits.
- Escenarios que requieren contenido sin filtros de rechazo: al ser un modelo abliterated, se orienta a usos de investigacion sobre comportamiento de modelos, aunque con los riesgos eticos asociados (ver limitaciones).
- Despliegue alternativo en GPU: mediante las cuantizaciones GGUF derivadas (por ejemplo, mradermacher/Huihui-Ornith-1.5-35B-A3B-abliterated-i1-GGUF) para entornos CUDA con llama.cpp.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. El unico dato de rendimiento medido por el autor es la velocidad de inferencia en un M1 Max de 64 GB:

| Modo | tok/s | Aceleracion vs AR |
|---|---|---|
| AR (autorregresivo) | 51,1 | 1,00x |
| D1 | 68,2 | 1,34x |
| D2 | 74,8 | 1,46x |
| D3 | 73,3 | 1,44x |

El autor indica que la configuracion ajustada optima es D2 (74,0 tok/s, 1,49x) con perfil sostenido. Como referencia externa, la variante Ornith-1.5-35B-A3B-APEX-MTP-I-Compact registra hasta 40,0 tok/s en una GPU segun llm-bench.io (septiembre de 2026), aunque no es una comparacion directa por diferir hardware y formato.

## Requisitos de hardware

- Peso del repositorio: 25,3 GB en safetensors; se necesita memoria suficiente para pesos mas cache KV y overhead del runtime (por encima de 26 GB en la practica).
- Hardware medido por el autor: Apple M1 Max con 64 GB de memoria unificada.
- Compatibilidad Apple Silicon: ruta nativa en M1/M2 (fp16, sin BF16 nativo) y tambien funcional en M3 o superiores.
- Modelo base sin cuantizar: llm-explorer cifra en 72,1 GB la VRAM estimada para la version de referencia huihui-ai/Huihui-Ornith-1.5-35B-A3B-abliterated.
- Variante cuantizada alternativa: funnygeeker/Huihui-Ornith-1.5-35B-A3B-abliterated-oQ5e-fp16-mtp se estima en 26,9 GB de VRAM.
- GPU dedicadas: no disponible; esta forja concreta es para MLX/Apple Silicon. Para CUDA habria que usar las variantes GGUF.
- Despliegue: MTPLX 2.11.2 (comando `mtplx serve`), ecosistema MLX en Apple Silicon; para otros entornos, cuantizaciones GGUF via llama.cpp.
- Latencia y throughput: 51,1 tok/s en AR y hasta 74,8 tok/s con MTP (D2) en M1 Max 64 GB; no hay datos para otras plataformas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato/optimizacion | Licencia | Notas |
|---|---|---|---|---|---|
| r3lax/Huihui-Ornith-1.5-35B-A3B-abliterated-MTPLX-mixed8-4bit-FP16 | 35,1 B (A3B) | no disponible | MLX mixed 8/4-bit + MTP | MIT | Esta ficha; ~74,8 tok/s en M1 Max 64 GB |
| huihui-ai/Huihui-Ornith-1.5-35B-A3B-abliterated | 35 B (A3B) | no disponible | safetensors (modelo base abliterated) | MIT | Modelo origen sin forja MTPLX; ~72,1 GB de VRAM segun llm-explorer |
| funnygeeker/Huihui-Ornith-1.5-35B-A3B-abliterated-oQ5e-fp16-mtp | 35 B (A3B) | no disponible | oQ5e fp16 + MTP | no disponible | Alternativa de cuantizacion con MTP; ~26,9 GB de VRAM |
| Ornith-1.5-35B-A3B-APEX-MTP-I-Compact | 35 B (A3B) | no disponible | Cuantizacion compacta + MTP | no disponible | Hasta 40,0 tok/s en GPU segun llm-bench.io |
| mradermacher/Huihui-Ornith-1.5-35B-A3B-abliterated-i1-GGUF | 35 B (A3B) | no disponible | GGUF (imatrix i1) | MIT (heredada) | Orientada a llama.cpp y entornos CUDA |

## Limitaciones y advertencias

- Modelo abliterated: la eliminacion de las capas de rechazo (11 a 29) reduce o anula las negativas del modelo ante peticiones problematicas, lo que incrementa el riesgo de generar contenido danino, ofensivo o inseguro. Requiere filtros adicionales en produccion.
- Riesgo de degradacion por abliteration: el proceso puede afectar a la coherencia, la utilidad o el alineamiento general del modelo. No hay benchmarks publicados que cuantifiquen este efecto.
- Alucinacion: al no haber datos de evaluacion ni de entrenamiento, no es posible estimar la tasa de alucinacion. Es un riesgo inherente a todo LLM, sin garantias documentadas aqui.
- Contexto e idiomas: se desconoce la longitud de contexto y los idiomas soportados. No apto para despliegues multilingues sin verificacion previa.
- Restricciones de plataforma: la forja esta en formato MLX y depende de MTPLX, por lo que no se ejecuta de forma directa en CUDA. El soporte en Apple Silicon esta medido principalmente en M1/M2 y M3+; otras plataformas no estan validadas.
- Licencia MIT: permite uso comercial sin restriccion de licencia, pero el autor no ofrece garantias ni asume responsabilidad por el uso del modelo.
- Madurez y trazabilidad: el modelo tiene 0 descargas y 1 like en el momento de la consulta, creado el 25 de septiembre de 2026; es un artefacto reciente y poco validado por la comunidad. Sin informacion sobre los datos de entrenamiento, sesgos ni evaluacion de seguridad.
- Dependencia de versiones: forjado con MTPLX 2.11.2; cambios de version en el runtime pueden alterar el comportamiento o el rendimiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/r3lax/Huihui-Ornith-1.5-35B-A3B-abliterated-MTPLX-mixed8-4bit-FP16
- Modelo base (huihui-ai): https://huggingface.co/huihui-ai/Huihui-Ornith-1.5-35B-A3B-abliterated
- Modelo original (ornith-ai): https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B
- Ficha en LLM Explorer (base): https://llm-explorer.com/model/huihui-ai%2FHuihui-Ornith-1.5-35B-A3B-abliterated,2fKIgn8LQab1oijPhDUyM1
- Variante oQ5e fp16 MTP (funnygeeker): https://llm-explorer.com/model/funnygeeker%2FHuihui-Ornith-1.5-35B-A3B-abliterated-oQ5e-fp16-mtp,4On692ZEKVBZGuYFzYbP6T
- Cuantizaciones GGUF (mradermacher): https://huggingface.co/mradermacher/Huihui-Ornith-1.5-35B-A3B-abliterated-i1-GGUF
- Benchmarks de Ornith-1.5-35B-A3B-APEX-MTP-I-Compact: https://llm-bench.io/models/ornith-1-5-35b-a3b-apex-mtp-i-compact
