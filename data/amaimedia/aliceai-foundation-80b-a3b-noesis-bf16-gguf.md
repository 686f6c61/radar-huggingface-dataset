# AMAImedia/AliceAI-Foundation-80B-A3B-NOESIS-BF16-GGUF

## Resumen

AliceAI-Foundation-80B-A3B-NOESIS-BF16-GGUF es un repack y conjunto de cuantizaciones GGUF del modelo base `yandex/AliceAI-Foundation-80B-A3B-Base`, publicado por la organizacion AMAImedia en el marco de su plataforma NOESIS de doblaje automatico multilingue. El modelo original lo desarrolla Yandex y emplea una arquitectura hibrida poco habitual (`model_type: alice_ai`) que combina capas de Kimi Delta Attention, atencion con compuerta (gated attention), mezcla de expertos y Attention Residuals. Con 81.286.433.408 parametros totales y unos 3B activos por token, se situa en la categoria de modelos MoE de gran tamano y activacion dispersa.

La relevancia de este repositorio es practica: el autor ha consolidado los 49 shards originales de Yandex en cuatro ficheros safetensors de menos de 50 GB, verificados tensor a tensor (1307 tensores, SHA256, cero discrepancias), y ha generado una escalera de cuantizaciones GGUF desde F16 hasta Q2_K, incluida la cabeza MTP (multi-token prediction) en formato separado. Con 262.144 tokens de contexto y licencia Apache-2.0, el modelo resulta atractivo para cargas de trabajo de contexto largo en ruso e ingles.

La advertencia principal es de compatibilidad: al cierre del periodo documentado, llama.cpp upstream no dispone de grafo de inferencia para `alice_ai`, por lo que los GGUF requieren un runtime consciente de la arquitectura (Transformers 5.16.1 con `flash-linear-attention==0.5.0`, o una imagen vLLM adaptada). `llama-cli` estandar no es aplicable todavia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida `alice_ai`: Kimi Delta Attention + gated attention + MoE + Attention Residuals |
| Parametros totales | 81.286.433.408 (80B) |
| Parametros activos | ~3B por token |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | F16, Q8_0, Q6_K, Q4_K_M (recomendada), Q2_K (experimental); BF16 en safetensors |
| Idiomas soportados | Ruso (ru), ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (BF16, 4 shards ≤50 GB) y GGUF (6 variantes) |
| Hidden size | 2048 |
| Vocabulario | 129.024 tokens (SentencePiece, `tokenizer.model`) |
| Capas | 48, con patron 12 × (3 × (KDA → MoE) → 1 × (Gated Attention → MoE)) |
| KDA | 32 cabeceras Q / 32 KV, head dim 128, kernel de convolucion 4 |
| Gated attention | 16 cabeceras Q / 2 KV, head dim 256 |
| MoE | 512 expertos, top-10 + 1 compartido, FFN de experto 512 |
| MTP | 1 capa, publicada aparte (`mtp.safetensors`, 3,30 GB) |
| Tamano del repo | 555,8 GB |

## Arquitectura y entrenamiento

La arquitectura `alice_ai` no es un transformer denso convencional. Intercala bloques de Kimi Delta Attention (una atencion lineal con estado recurrente y convolucion local de kernel 4) con bloques de atencion con compuerta, y cada uno de ellos va seguido de una capa MoE. El patron documentado es 12 repeticiones de tres bloques KDA→MoE seguidos de un bloque Gated Attention→MoE, lo que da las 48 capas totales. El componente MoE emplea 512 expertos con enrutamiento top-10 mas un experto compartido, y el FFN de cada experto tiene dimension 512, coherente con el hidden size de 2048. La inclusion de Attention Residuals y de una cabeza MTP de una capa apunta a un diseno orientado a decodificacion especulativa y a eficiencia en generacion larga.

No se dispone en la informacion proporcionada de detalles sobre el volumen de tokens de entrenamiento, la composicion del corpus, ni si se aplicaron fases de RLHF o DPO. El modelo base es de tipo "Base", no instruct, lo que sugiere un entrenamiento principalmente de preentrenamiento sobre datos multilingues ruso-ingles, sin un ajuste conversacional declarado. El repositorio de AMAImedia no aporta informacion adicional sobre el proceso de entrenamiento del modelo original; unicamente documenta el proceso de repack y cuantizacion.

## Capacidades

- Generacion de texto autoregresiva en ruso e ingles, con ventana de contexto de 262.144 tokens.
- Razonamiento y comprension de documentos largos gracias a la atencion hibrida KDA, que reduce el coste computacional del contexto extendido.
- Prediccion multi-token (MTP) mediante la cabeza publicada aparte, orientada a decodificacion especulativa y a mayor throughput.
- Capacidad de mezcla de expertos con 512 expertos, lo que permite especializacion interna por dominio sin activar el total de parametros.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades de vision o audio: no disponibles; el pipeline declarado es exclusivamente `text-generation`.
- Capacidades multilingues limitadas a los idiomas declarados (ru, en); no se documentan otros.

## Casos de uso

- Doblaje automatico y localizacion audiovisual: el modelo se publica dentro de la plataforma NOESIS de doblaje multilingue, donde puede procesar guiones completos de episodios o peliculas en una sola ventana de 262.144 tokens, manteniendo coherencia de nombres, terminologia y estilo entre escenas.
- Traduccion tecnica ruso-ingles de documentacion extensa: la ventana de contexto permite pasar manuales completos sin troceado, reduciendo perdidas de coherencia terminologica entre secciones.
- Analisis de contratos y documentos legales: con 262K de contexto se pueden ingerir expedientes enteros y formular preguntas sobre clausulas cruzadas, algo inviable en modelos de 8K-32K sin recuperacion externa.
- Generacion asistida de codigo y documentacion tecnica: aunque no se documenta un ajuste especifico para codigo, el modelo base puede emplearse en tareas de completado y explicacion de fragmentos, con la salvedad de que requiere validacion humana.
- Investigacion sobre arquitecturas hibridas de atencion: el repositorio ofrece pesos BF16 verificados y cuantizaciones GGUF de referencia, utiles para reproducir experimentos sobre KDA, gated attention y enrutamiento MoE.
- Procesamiento por lotes en servidores con multiples GPU: el repack en cuatro shards de menos de 50 GB facilita el despliegue en infraestructura con limites de tamano por fichero y la orquestacion en vLLM adaptado.
- Fine-tuning sobre dominio especifico: la licencia Apache-2.0 y la disponibilidad de pesos BF16 permiten ajuste supervisado o LoRA sobre corpus propios, aunque el coste de infraestructura es elevado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16/F16: aproximadamente 160 GB solo para pesos, mas cache KV y overhead; requiere multiples GPU de 80 GB (por ejemplo, 4× H100 80GB o 4× A100 80GB).
- Q8_0: alrededor de 85-90 GB de pesos; viable en 2× H100 80GB o 2× A100 80GB con margen ajustado.
- Q6_K: aproximadamente 65-70 GB; cabe en una H100 80GB o en 2× RTX 4090 24GB con offload parcial.
- Q4_K_M (recomendada): alrededor de 45-50 GB; viable en 2× RTX 4090 24GB o 1× A100 80GB con contexto moderado.
- Q2_K: en torno a 25-30 GB; la unica variante que podria caber en una GPU consumer de 24 GB, con perdida de calidad significativa y marcada como experimental.
- No cabe en GPU consumer de 8-16 GB en ninguna cuantizacion publicada.
- Opciones de despliegue: Transformers 5.16.1 con `flash-linear-attention==0.5.0`, o imagen vLLM con soporte AliceAI. llama.cpp, Ollama y TGI no son compatibles con la arquitectura `alice_ai` en la fecha documentada.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros totales / activos | Contexto | Licencia | Notas |
|---|---|---|---|---|
| AliceAI-Foundation-80B-A3B (este) | 80B / ~3B | 262.144 | Apache-2.0 | Arquitectura hibrida KDA + gated attention + MoE; solo ru/en |
| Modelos MoE de activacion dispersa de la misma clase | no disponible | no disponible | no disponible | No se dispone de datos comparativos verificados en la informacion proporcionada |
| Alternativas densas de ~70B | no disponible | no disponible | no disponible | No se dispone de datos comparativos verificados en la informacion proporcionada |

No se dispone de informacion suficiente para establecer una comparativa cuantitativa fiable con modelos alternativos concretos. Cualquier comparacion de rendimiento requeriria ejecutar los benchmarks sobre el mismo harness, algo que el repositorio no documenta.

## Limitaciones y advertencias

- Incompatibilidad con llama.cpp upstream: los GGUF no se ejecutan en `llama-cli` ni en herramientas derivadas sin soporte explicito de `alice_ai`. Verificar el runtime antes de planificar el despliegue.
- Modelo base, no instruct: no ha sido ajustado para seguir instrucciones ni para conversacion; requiere prompting cuidadoso o fine-tuning previo para uso en produccion.
- Cobertura linguistica limitada a ruso e ingles; el rendimiento en castellano no esta documentado y probablemente sea deficiente.
- Riesgo de alucinacion inherente a los modelos de lenguaje de gran tamano, agravado en tareas de traduccion o doblaje donde una terminologia incorrecta se propaga a toda la salida.
- Cuantizaciones agresivas (Q2_K) marcadas como experimentales por el propio autor; la degradacion de calidad no esta cuantificada.
- La cabeza MTP se distribuye como fichero separado; omitirla desactiva la decodificacion especulativa y reduce el throughput.
- Sesgos conocidos: no documentados en la informacion proporcionada; cabe esperar los sesgos del corpus de preentrenamiento de Yandex, no auditados aqui.
- Licencia Apache-2.0 permisiva para uso comercial, pero el modelo base subyacente y sus condiciones deben verificarse en el repositorio original de Yandex.
- El repositorio es un repack de terceros, no una publicacion oficial de Yandex; la responsabilidad de validacion recae en el usuario.
- El autor declara que las cuantizaciones de modelos de 9B o superiores requieren hardware alquilado (H200/Blackwell), lo que sugiere que la validacion se realizo en infraestructura externa y no en su equipo local.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/AMAImedia/AliceAI-Foundation-80B-A3B-NOESIS-BF16-GGUF
- Modelo base original: https://huggingface.co/yandex/AliceAI-Foundation-80B-A3B-Base
- Codigo del pipeline de repack y cuantizacion: https://huggingface.co/AMAImedia/AliceAI-Foundation-80B-A3B-NOESIS-BF16-GGUF/tree/main/code
- Web de AMAImedia: https://www.amaimedia.com
- X (Twitter) del autor: https://x.com/AMAImediacom
- LinkedIn del autor: https://www.linkedin.com/in/ilia-bolotnikov
- Telegram del autor: https://t.me/djbionicl
