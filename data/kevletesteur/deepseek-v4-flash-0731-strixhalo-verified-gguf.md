# Kevletesteur/DeepSeek-V4-Flash-0731-StrixHalo-Verified-GGUF

## Resumen

DeepSeek-V4-Flash-0731-StrixHalo-Verified-GGUF es una cuantización GGUF del modelo base deepseek-ai/DeepSeek-V4-Flash-0731, un modelo de lenguaje de arquitectura Mixture of Experts (MoE) con 284.334 millones de parámetros totales y 256 expertos. El autor, Kevletesteur, ha producido una versión en 103,2 GB (2,90 bpw) específicamente afinada para hardware AMD Strix Halo (Ryzen AI Max+ 395, GPU integrada gfx1151 con 115 GB de memoria unificada), sobre la rama principal de llama.cpp sin forks.

La relevancia de esta ficha radica en que no es una cuantización genérica: el autor ha verificado la calidad del modelo contra la API de precisión completa del modelo original, con un 90,8% de acuerdo token a token en 17.929 posiciones y paridad completa en 240 pares de preguntas y respuestas. Además, incorpora decodificación especulativa con un drafter DSpark (de unsloth) y una serie de ajustes medidos empíricamente que permiten alcanzar entre 20 y 27 tokens por segundo en contexto corto sobre un APU de consumo. Es una opción práctica para ejecutar un MoE de 284B en un equipo de escritorio con memoria unificada, algo que normalmente requeriría varias GPUs de centro de datos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts) con 256 expertos y modulo de decodificacion especulativa DSpark |
| Parametros totales | 284.334.567.511 (~284B) |
| Parametros activos | no disponible (MoE, no se especifica el numero de activos) |
| Longitud de contexto | 262.144 tokens (configurado con `-c 262144` en el comando de lanzamiento) |
| Tipos de cuantizacion | IQ3_XXS con requantizacion Q6_K de los tensores de atencion (`attn_q_b`, `attn_output_a`, `attn_output_b`); drafter en Q3_K_S (3,44 bpw) o Q8_0 |
| Idiomas soportados | en, fr |
| Licencia | MIT |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo base, DeepSeek-V4-Flash-0731, es un MoE con 256 expertos que incorpora un modulo de decodificacion especulativa adjunto (DSpark), segun la documentacion de ModelScope. La cuantizacion que nos ocupa parte del GGUF original de unsloth (UD-IQ3_XXS) y aplica una requantizacion selectiva: los tres grupos de tensores de atencion que dominan el presupuesto de bytes por token (`attn_q_b`, `attn_output_a`, `attn_output_b`, que representan el 51,9% de todos los bytes leidos por token) pasan de Q8_0 a Q6_K. El autor mide un incremento del 23,8% en la generacion de texto largo y una mejora en la tasa de aceptacion del drafter del 44% al 63%.

No se proporcionan datos sobre el entrenamiento del modelo base (numero de tokens, composicion del dataset, uso de RLHF o DPO). La cuantizacion se ha verificado contra la API de precision completa con protocolos emparejados: 90,8% de acuerdo top-1 en 17.929 posiciones de teacher forcing, paridad en 240 pares de QA, paridad en derivaciones profundas comprobadas con SymPy y una tasa de respuestas incorrectas con alta confianza del 0,0%.

## Capacidades

- Generacion de texto y razonamiento en ingles y frances, con soporte de conversaciones multi-turno mediante la API `/v1/chat/completions`.
- Razonamiento matematico y derivacion simbolica verificada con SymPy en las pruebas del autor.
- Decodificacion especulativa con drafter DSpark, que acelera la generacion sin degradar la calidad (aunque no es bit-exacta).
- Ejecucion en contexto largo de hasta 262.144 tokens, con rendimiento medido de ~11 t/s a 150k tokens de contexto.
- Tool calling y uso agente: el autor menciona pruebas con tool calls y un impacto positivo del drafter en ese escenario (+101% frente a +13% con ngram).
- Capacidad de guardado y restauracion de sesiones con `--slot-save-path`, que reduce el re-prefill de 6 minutos a 25 ms para sesiones de 30k tokens.

## Casos de uso

- Agentes de largo contexto en un solo equipo: con 262.144 tokens de ventana y ~11 t/s a 150k de contexto, el modelo puede mantener conversaciones o analisis de documentos extensos sin necesidad de un cluster de GPUs. Es adecuado para un desarrollador que quiera un agente autonomo local con memoria amplia.
- Atencion al cliente automatizada en frances e ingles: el soporte multi-turno y la paridad verificada con el modelo de precision completa permiten desplegar un sistema de soporte que responde de forma coherente y con baja tasa de errores de alto riesgo (0,0% de respuestas incorrectas con alta confianza en las pruebas del autor).
- Generacion de codigo y tool calling en produccion: el modelo soporta tool calling y el drafter DSpark mejora notablemente el rendimiento en ese tipo de llamadas (+101% frente a +13% con modos ngram). Puede integrarse en pipelines de CI/CD para revision de codigo o generacion de parches.
- Razonamiento matematico y verificacion simbolica: la paridad en derivaciones comprobadas con SymPy indica que el modelo mantiene la capacidad de calculo simbolico del original, util para asistentes de investigacion o plataformas educativas.
- Desarrollo de aplicaciones locales con privacidad: al ejecutarse en un APU de consumo con memoria unificada, permite procesar datos sensibles sin enviarlos a la nube. El autor destaca el uso de memoria unificada y la configuracion de GTT para maximizar el rendimiento.
- Prototipado rapido de aplicaciones de IA generativa: con llama.cpp y la API compatible con OpenAI, se puede levantar un servidor local de inferencia en minutos y probar distintos parametros de muestreo sin depender de servicios externos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. Sin embargo, la model card incluye datos de verificacion contra la API de precision completa del modelo original:

| Sonda | Resultado |
|---|---|
| Acuerdo token a token (teacher forcing, 17.929 posiciones, 4 dominios × EN/FR) | 90,8% top-1 |
| Paridad en pares de QA | 240/240 |
| Paridad en derivaciones profundas (comprobadas con SymPy) | Si |
| Tasa de respuestas incorrectas con alta confianza | 0,0% |

Ademas, la busqueda web indica que el modelo base DeepSeek-V4-Flash-0731 supera a DeepSeek-V4-Pro (Preview) en benchmarks publicados, aunque no se incluyen los numeros concretos en la informacion recopilada.

## Requisitos de hardware

- Hardware objetivo: AMD Strix Halo (Ryzen AI Max+ 395, GPU integrada gfx1151) con 115 GB de memoria unificada. El modelo ocupa 103,2 GB en disco y requiere elevar el limite de memoria GPU unificada (GTT) a ~110 GiB mediante parametros del kernel (`amdgpu.gttsize=112640`).
- VRAM estimada: no es aplicable en el sentido clasico; el modelo se ejecuta en memoria unificada del APU. En GPUs discretas tradicionales no cabria en una sola tarjeta de consumo, y el autor no proporciona configuraciones alternativas.
- GPU recomendadas: AMD Strix Halo (gfx1151). El autor menciona que el modelo base en BF16 requiere 4x H100 u 8x A100, pero esta cuantizacion esta pensada para el APU de AMD.
- Opciones de despliegue: llama.cpp (rama principal) compilado con ROCm/HIP y `-DAMDGPU_TARGETS=gfx1151`. No se mencionan vLLM, Ollama o TGI en la informacion disponible.
- Rendimiento medido: ~20-27 t/s en contexto corto (depende de la tarea), ~14-16 t/s a 16k tokens, ~11 t/s a 150k tokens, prefill ~130 t/s. El autor advierte que estos valores son especificos de su configuracion y no deben extrapolarse a otros quants o contextos.
- Requisito critico: `--no-mmap` es obligatorio en memoria unificada; sin el, el modelo se carga dos veces (buffer GPU + page cache) y el arranque pasa de 40 segundos a 51 minutos.

## Comparativa con modelos similares

La comparativa se limita a lo indicado en la informacion disponible, sin datos numericos de benchmarks estandar:

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DeepSeek-V4-Flash-0731 (base, precision completa) | 284B (MoE, 256 expertos) | 262.144 | BF16 | MIT | Requiere 4x H100 u 8x A100 |
| DeepSeek-V4-Flash-0731-StrixHalo-Verified-GGUF | 284B (MoE, 256 expertos) | 262.144 | IQ3_XXS + Q6_K atencion (2,90 bpw) | MIT | Ejecutable en APU Strix Halo con 115 GB unificados |
| DeepSeek-V4-Pro (Preview) | no disponible | no disponible | no disponible | no disponible | Modelo propietario/API, superado por V4-Flash-0731 segun la busqueda web |

La comparativa con otros modelos de la misma categoria (MoE de ~284B cuantizados) no esta disponible en la informacion recopilada.

## Limitaciones y advertencias

- La cuantizacion a 2,90 bpw implica perdida de precision inherente; aunque el autor reporta un 90,8% de acuerdo token a token con la API de precision completa, el 9,2% restante puede manifestarse en diferencias sutiles de estilo o contenido.
- La decodificacion especulativa no es bit-exacta: la verificacion por lotes reordena las reducciones de punto flotante y puede alterar decisiones de argmax cercanas. Para benchmarks de paridad token a token, el autor recomienda desactivar el drafter.
- No se debe evaluar la calidad mediante `/completion` en bruto: el modelo puede inyectar un token ` thinking` que se cierra instantaneamente a temperatura 0, produciendo respuestas aparentemente rotas. Hay que usar `/v1/chat/completions`.
- El drafter no debe degradarse por debajo de Q3_K_S: un drafter de 2 bits colapsa la tasa de aceptacion al 9-15% y la especulacion pierde un 40% frente a no usar drafter.
- No combinar el modo `draft-dspark` con modos ngram: destruye el rendimiento de tool calling (+101% pasa a +13%) y los modos ngram solos pueden perder hasta un 46%.
- Los ajustes de rendimiento no son transferibles: el autor advierte explicitamente que los parametros optimos (batch size, tipo de KV cache, numero de tokens especulados) cambian segun el quant, el contexto y el hardware. Lo que funciona en esta configuracion puede ser perjudicial en otra.
- La licencia MIT permite uso comercial, pero el modelo base es de DeepSeek y el autor no detalla si hay restricciones adicionales del modelo original.
- Solo se garantiza soporte para ingles y frances segun la model card; otros idiomas no estan verificados.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Kevletesteur/DeepSeek-V4-Flash-0731-StrixHalo-Verified-GGUF
- Modelo base en HuggingFace: https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash-0731
- Modelo base en ModelScope: https://modelscope.ai/models/deepseek-ai/DeepSeek-V4-Flash-0731
- Repositorio GitHub del proyecto DeepSeek V4 Flash 0731: https://github.com/deepseek-v4-flash-0731/deepseek-v4-flash-0731
- Documentacion tecnica en DeepWiki: https://deepwiki.com/deepseek-v4-flash-0731/deepseek-v4-flash-0731
- Repositorio de llama.cpp (rama principal): https://github.com/ggml-org/llama.cpp
- Drafter DSpark de unsloth: https://huggingface.co/unsloth/DeepSeek-V4-Flash-0731-GGUF
