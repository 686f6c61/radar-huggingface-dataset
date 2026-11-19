# Kaleto/SenseNova-Loop-9B-NVFP4-MLP

## Resumen
SenseNova-Loop-9B-NVFP4-MLP es una compilación cuantizada en NVFP4 del modelo sensenova/SenseNova-Loop-9B, publicada por el usuario independiente Kaleto. Se trata de un transformer con bucles (looped transformer) de 9.656 millones de parámetros, del que esta versión solo cuantiza las capas MLP (96 lineales: gate, up y down en las 32 capas) mientras mantiene en BF16 toda la atención, las proyecciones DeltaNet, el `lm_head`, los embeddings, las normas y los routers mHC en FP32. El resultado es un checkpoint de 12,4 GB en disco (frente a los 19 GB del BF16 original) que ocupa 10,5 GiB en memoria durante la inferencia.

El objetivo de esta build es preservar la fidelidad al modelo original dentro de lo que permite una cuantización NVFP4, orientándose a despliegues con vLLM sobre hardware NVIDIA Blackwell, en particular la DGX Spark con GB10. En esa plataforma alcanza 12,4 tok/s por stream en decodificación (frente a 7,5 tok/s del BF16) y 54,6 tok/s agregados con cuatro streams, con un prefill de 1.563 tok/s.

Su relevancia radica en que ofrece una alternativa de cuantización con prioridad en calidad para quienes sirven el modelo con vLLM en Blackwell: su divergencia KL media (0,087) es inferior a la del GGUF Q4_K_M oficial (0,111) y a otras builds NVFP4 de la comunidad, aunque por encima del GGUF con importance matrix de AtomicChat (0,054), que sin embargo no aprovecha los tensor cores FP4 de Blackwell.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con bucles (looped transformer), con atencion, proyecciones DeltaNet y routers mHC; implementacion vLLM con plugin `vllm-sensenova-loop` |
| Parametros totales | 9.656.254.576 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens (configurado en el ejemplo de servicio con `--max-model-len 32768`) |
| Tipos de cuantizacion | NVFP4 W4A16 (`quant_algo: W4A16_NVFP4`), checkpoint de nvidia-modelopt 0.43; solo MLPs cuantizados, resto en BF16/FP32 |
| Idiomas soportados | no disponible en la informacion proporcionada (la evaluacion de calidad incluye texto en ingles, aleman, codigo, chat y role-play) |
| Licencia | Apache-2.0 (heredada del modelo base) |
| Formato de pesos | safetensors (NVFP4, modelopt), libreria vLLM, requiere `custom_code` |

## Arquitectura y entrenamiento
El modelo base es un transformer con bucles: las capas 4 a 27 se visitan dos veces durante el forward, lo que aumenta la profundidad efectiva sin incrementar el numero de parametros. Incorpora proyecciones DeltaNet, routers mHC en FP32, un `loop_gate`, capas `conv1d`, parametros `A_log` y `dt_bias` en FP32, una torre de vision y una cabeza MTP (multi-token prediction). Esta build cuantiza exclusivamente las 96 lineales MLP (`mlp.gate_proj`, `mlp.up_proj`, `mlp.down_proj` en las 32 capas); el resto de pesos se mantiene byte a byte identico al modelo fuente.

La calibracion se realizo con 64 secuencias de 1.024 tokens de texto mixto, pasadas por el forward real del modelo con bucles (capas 4-27 visitadas dos veces). No se dispone de informacion sobre el numero de tokens de entrenamiento del modelo base, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO. La innovacion tecnica destacable de esta build es el uso de NVFP4 con granularidad de bloque sobre los MLP, que se ejecuta de forma nativa en los tensor cores FP4 de Blackwell a traves de vLLM.

## Capacidades
- Generacion de texto conversacional y de proposito general (pipeline `text-generation`, tag `conversational`).
- Razonamiento con modo thinking: el ejemplo de servicio incluye `--reasoning-parser qwen3`, lo que permite activar y desactivar el modo de razonamiento.
- Tool calling y function calling: soportado mediante `--enable-auto-tool-choice --tool-call-parser qwen3_coder`.
- Capacidades de codigo: la evaluacion de calidad incluye un conjunto de codigo y el parser de tool calling es `qwen3_coder`.
- Capacidades multilingues: la evaluacion de calidad reporta resultados en wiki EN, wiki DE, noticias, chat y role-play, lo que indica cobertura al menos de ingles y aleman; el listado oficial de idiomas no esta disponible.
- Vision: el modelo base incluye una torre de vision que se conserva intacta en esta build, aunque el plugin de vLLM solo soporta texto por ahora.
- Generacion multi-token (MTP): la cabeza se conserva en el checkpoint, pero el plugin actual no la aprovecha.

## Casos de uso
- Servicio de inferencia en DGX Spark o GB10: desplegar con `vllm serve` y el plugin `vllm-sensenova-loop` para obtener 12,4 tok/s por stream y 54,6 tok/s con cuatro streams, aprovechando los tensor cores FP4 de Blackwell.
- Asistentes conversacionales multi-turno: con 32.768 tokens de contexto configurados, el modelo puede mantener historiales largos de conversacion en un unico prompt, adecuado para atencion al cliente o soporte tecnico.
- Agentes con tool calling: integrar en un orquestador de agentes que necesite llamadas a funciones (APIs, busqueda, ejecucion de codigo) gracias al parser `qwen3_coder` y a `--enable-auto-tool-choice`.
- Razonamiento con modo thinking: usar el parser `qwen3` para tareas que requieran cadena de razonamiento explicita, como resolucion de problemas matematicos o analisis de documentos.
- Evaluacion comparativa de cuantizaciones: servir esta build junto al BF16 y al NVFP4 completo para medir el impacto de la cuantizacion parcial de MLP en la calidad de salida sobre dominios concretos (codigo, noticias, chat).
- Generacion de codigo en pipelines internos: con un KLD de 0,086 en el conjunto de codigo, es una opcion razonable para autocompletado y generacion de fragmentos en entornos donde ya se dispone de vLLM sobre Blackwell.
- Prototipado de bajo consumo de memoria: con 10,5 GiB de pesos en memoria, permite ejecutar un modelo de 9,6B en un dispositivo con menos de 16 GiB de VRAM util, dejando espacio para cache KV en BF16.

## Benchmarks y rendimiento
Rendimiento en DGX Spark (GB10) con vLLM 0.31.0, cache KV en BF16, greedy, prompt de ~4,8K tokens y 256 tokens decodificados:

| Build | Pesos en memoria | Prefill tok/s | Decode 1 stream | Decode 4 streams (total) |
|---|---:|---:|---:|---:|
| BF16 (fuente) | 16,9 GiB | 1.785 | 7,5 tok/s | 31,1 tok/s |
| Esta build (NVFP4-MLP) | 10,5 GiB | 1.563 | 12,4 tok/s | 54,6 tok/s |
| NVFP4 (decoder completo) | 7,7 GiB | 1.492 | 21,2 tok/s | 81,1 tok/s |

Calidad (KLD media de vocabulario completo frente al BF16, 72.633 posiciones, chunks de 2.048 tokens):

| Build | Tamano | KLD media ↓ | Mismo token top ↑ |
|---|---:|---:|---:|
| AtomicChat AD-Q4_K_M (GGUF, imatrix) | 5,96 GB | 0,054 | 92,6 % |
| Esta build | 12,4 GB | 0,087 | 90,0 % |
| SenseNova Q4_K_M (GGUF, oficial) | 5,82 GB | 0,111 | 89,2 % |
| balllvin NVFP4 (QAD) | 8,9 GB | 0,139 | 87,3 % |
| NVFP4 (decoder completo) | 9,4 GB | 0,151 | 86,8 % |

KLD por tipo de texto (esta build): noticias 0,202; wiki EN 0,077; wiki DE 0,100; codigo 0,086; chat 0,033; role-play 0,058. No se han publicado resultados de benchmarks academicos (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware
- VRAM estimada: 10,5 GiB de pesos en memoria durante la inferencia; el repo ocupa 12,4 GB en disco. Hay que sumar la cache KV en BF16 para el contexto configurado (32.768 tokens en el ejemplo).
- GPU recomendadas: NVIDIA Blackwell, en particular DGX Spark con GB10; los tensor cores FP4 de las GPU Blackwell (GB10, GB200, B200) son necesarios para aprovechar NVFP4 de forma nativa.
- Cabe en GPU consumer: si el dispositivo es Blackwell y dispone de al menos 16 GiB utiles de VRAM; en GPU sin soporte FP4 nativo el rendimiento esperado no esta documentado.
- Opciones de despliegue: vLLM 0.31.0 con el plugin `vllm-sensenova-loop` (instalable desde el tarball de GitHub). Para llama.cpp o Mac, la model card recomienda los GGUF y builds MLX de la comunidad.
- Latencia y throughput: 12,4 tok/s por stream y 54,6 tok/s con cuatro streams en GB10; prefill de 1.563 tok/s con prompt de ~4,8K tokens. El plugin actual solo soporta texto y no aprovecha la cabeza MTP.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | KLD media | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Esta build (NVFP4-MLP) | 9,66B | 32.768 | NVFP4 safetensors | 0,087 | Apache-2.0 | vLLM en Blackwell |
| NVFP4 (decoder completo, Kaleto) | 9,66B | 32.768 | NVFP4 safetensors | 0,151 | Apache-2.0 | vLLM en Blackwell |
| SenseNova Q4_K_M (GGUF oficial) | 9,66B | no disponible | GGUF | 0,111 | Apache-2.0 | llama.cpp |
| AtomicChat AD-Q4_K_M (GGUF, imatrix) | 9,66B | no disponible | GGUF | 0,054 | Apache-2.0 | llama.cpp |
| SenseNova-Loop-9B (BF16) | 9,66B | no disponible | safetensors | referencia | Apache-2.0 | vLLM con plugin |

## Limitaciones y advertencias
- Solo MLPs cuantizados: la atencion y las proyecciones DeltaNet permanecen en BF16, por lo que el ahorro de memoria (10,5 frente a 16,9 GiB) es menor que el de una cuantizacion completa del decoder.
- Calidad inferior al GGUF con importance matrix de AtomicChat (KLD 0,087 frente a 0,054) a pesar de ocupar el doble de espacio; la ventaja de esta build es la velocidad nativa en tensor cores FP4, no la fidelidad absoluta.
- Peor KLD en noticias (0,202) que en otros dominios, lo que sugiere mayor degradacion en texto periodistico largo.
- Requiere el plugin externo `vllm-sensenova-loop`, que empaqueta una implementacion de vLLM aun no fusionada (PR #64832); la compatibilidad futura con versiones de vLLM no esta garantizada.
- El plugin solo soporta texto y no aprovecha la cabeza MTP; las capacidades de vision del modelo base no son utilizables en este despliegue.
- Riesgo de alucinacion y sesgos: no se han publicado evaluaciones especificas en la informacion disponible; deben asumirse los del modelo base.
- Cobertura de idiomas no documentada oficialmente; la evaluacion solo cubre ingles y aleman.
- Build de comunidad independiente, no afiliada a SenseNova; para produccion conviene validar la calidad en el dominio propio antes de desplegar.
- En muestreo se recomienda anadir `min_p: 0.05` o `top_k: 20` a los valores de SenseNova (temperatura 1.0, top_p 0.95) para evitar colas largas de tokens.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/Kaleto/SenseNova-Loop-9B-NVFP4-MLP
- Modelo base: https://huggingface.co/sensenova/SenseNova-Loop-9B
- Build hermana NVFP4 completa: https://huggingface.co/Kaleto/SenseNova-Loop-9B-NVFP4
- Plugin vLLM: https://github.com/KaletoAI/vllm-sensenova-loop
- PR de vLLM con la implementacion de SenseTime: https://github.com/vllm-project/vllm/pull/64832
- GGUF oficial: https://huggingface.co/sensenova/SenseNova-Loop-9B-GGUF
- GGUF de AtomicChat: https://huggingface.co/AtomicChat/SenseNova-Loop-9B-GGUF
- Build NVFP4 de balllvin: https://huggingface.co/balllvin/SenseNova-Loop-9B-NVFP4
- Organizacion SenseNova en Hugging Face: https://huggingface.co/sensenova
