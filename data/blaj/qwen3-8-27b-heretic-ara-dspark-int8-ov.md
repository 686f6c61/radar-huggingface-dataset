# blaj/Qwen3.8-27B-heretic-ara-DSpark-int8-ov

## Resumen

Qwen3.8-27B-heretic-ara-DSpark-int8-ov es una conversión a OpenVINO en precisión INT8 de un modelo draft (borrador) para decodificación especulativa, derivado de la familia Qwen3.8-27B. Lo publica el usuario blaj en Hugging Face partiendo del ajuste de catplusplus (`Qwen3.8-27B-heretic-ara-DSpark`), que a su vez proviene del draft original de RadixArk (`Qwen3.8-27B-DSpark`). No es un modelo de chat autónomo, sino un componente auxiliar diseñado para acelerar la inferencia de un modelo objetivo (target) de la misma familia mediante propuestas de tokens que el modelo grande verifica.

La relevancia de esta ficha es acotada: se trata de un artefacto de despliegue muy específico, con 0 descargas y 0 likes en el momento de la consulta, orientado a pipelines de OpenVINO GenAI. El repositorio ocupa 1,5 GB, lo que sugiere que no contiene los pesos completos de un modelo de 27B en INT8 (que rondarían los 27 GB), sino un subconjunto o un draft de menor tamaño efectivo. La model card no aclara el recuento real de parámetros del artefacto convertido.

La arquitectura declarada es Qwen3 con un componente adicional denominado "Markov head" en FP16, y las cinco capas de atención convierten a paged attention en la exportación. La licencia se mantiene como `other`, heredada del modelo upstream, sin texto de licencia separado disponible, lo que constituye un riesgo relevante para uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo Qwen3 con cabeza Markov adicional (draft para decodificacion especulativa) |
| Parametros totales | no disponible (el nombre indica 27B, pero el repo de 1,5 GB no corresponde a pesos completos en INT8) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT8 en el backbone; FP16 en la cabeza Markov |
| Idiomas soportados | no disponible |
| Licencia | other (sin texto de licencia disponible; heredada del modelo upstream) |
| Formato de pesos | OpenVINO IR (libreria `openvino`), con paged attention en las cinco capas de atencion |

## Arquitectura y entrenamiento

El modelo es un draft de decodificación especulativa construido sobre la arquitectura Qwen3. La model card indica que el backbone se convierte a INT8 mientras que la "Markov head" se mantiene en FP16. Las cinco capas de atención se exportan como paged attention, lo que permite su uso con el runtime de OpenVINO GenAI con KV cache paginada en FP16. Optimum no exporta la cabeza de confianza (confidence head) del modelo fuente, un detalle relevante porque limita ciertas estrategias de verificación o filtrado de propuestas.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO. El ajuste fino procede de catplusplus sobre el draft de RadixArk; el sufijo "heretic" sugiere un proceso de desalineación deliberada (abliteración de rechazos), pero la model card no lo documenta ni lo confirma. La innovación técnica principal es precisamente la decodificación especulativa: el draft propone varios tokens por paso (la card recomienda cinco propuestas por paso) que el modelo objetivo valida en paralelo.

## Capacidades

- Generación de propuestas de tokens para decodificación especulativa junto a modelos objetivo Qwen3.8-27B Heretic ARA en OpenVINO.
- Aceleración de inferencia en GPU mediante verificación paralela de propuestas por el modelo target.
- Compatibilidad con paged attention en las cinco capas de atención exportadas.
- Integración con OpenVINO GenAI nightly con KV cache paginada en FP16.
- No está pensado para uso directo como modelo de chat, razonamiento o generación autónoma.
- Soporte de tool calling, agentes, visión, audio o modo thinking: no disponible en la información proporcionada.

## Casos de uso

- Aceleración de un endpoint de generación de texto: emparejar este draft INT8 con el target INT4/INT8 de la misma familia en OpenVINO GenAI para aumentar el throughput de tokens por segundo en producción, tal como sugiere el smoke-test del autor.
- Despliegue en GPU de gama media con restricciones de VRAM: al ocupar 1,5 GB en disco y usar INT8, deja más memoria disponible para el modelo objetivo y la KV cache paginada.
- Servicios de baja latencia con prompts cortos: la decodificación especulativa con cinco propuestas por paso reduce el número de pasos de decodificación secuencial cuando la tasa de aceptación es alta.
- Evaluación comparativa de drafts: el autor documenta pruebas con drafts INT4, INT8 y FP16 sobre el mismo target, lo que permite usar este artefacto como referencia en experimentos de tuning de decodificación especulativa.
- Pipelines de inferencia en CPU/GPU Intel: OpenVINO permite ejecutar el mismo grafo en hardware Intel, útil para entornos on-premise con GPUs integradas o discretas de ese fabricante.
- Investigación sobre abliteración ("heretic") combinada con decodificación especulativa: permite estudiar si el ajuste del draft degrada la tasa de aceptación frente al draft original de RadixArk.

## Benchmarks y rendimiento

Los únicos datos disponibles son los smoke-tests del autor, no benchmarks estandarizados:

| Prueba | Target | Draft | Propuestas aceptadas | Throughput |
|---|---|---|---|---|
| Prompt de numeros primos | Heretic ARA INT4 | INT4 | 184/337 | 17,0 tok/s frente a 6,0 tok/s sin draft |
| Prompt "rainbow" | Heretic ARA INT4 | INT8 | 27/86 | 10,00 tok/s |
| Prompt "rainbow" | Heretic ARA INT4 | FP16 | 27/86 | 9,94 tok/s |

El autor advierte que los prompts son distintos y no directamente comparables. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: 1,5 GB de pesos en disco; el consumo en VRAM depende del runtime y de la KV cache paginada del target, no disponible con precisión.
- GPU recomendadas: no disponibles de forma explícita; el ecosistema OpenVINO apunta a GPUs Intel (integradas y discretas) y el autor menciona pruebas en GPU sin especificar modelo.
- Cabe en GPU de consumo: probablemente sí por tamaño de pesos, pero requiere el modelo target completo en paralelo, que es el que domina el consumo de memoria.
- Opciones de despliegue: OpenVINO GenAI (nightly) con KV cache paginada FP16; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 17,0 tok/s con draft INT4 frente a 6,0 tok/s sin draft en el prompt de primos; 10,00 tok/s con draft INT8 y 9,94 tok/s con FP16 en el prompt "rainbow".

## Comparativa con modelos similares

| Modelo | Tipo | Precision | Tamano repo | Licencia | Estado |
|---|---|---|---|---|---|
| blaj/Qwen3.8-27B-heretic-ara-DSpark-int8-ov | Draft OpenVINO | INT8 + FP16 head | 1,5 GB | other | Este modelo |
| catplusplus/Qwen3.8-27B-heretic-ara-DSpark | Draft upstream | no disponible | no disponible | other | Base directa |
| RadixArk/Qwen3.8-27B-DSpark | Draft original | no disponible | no disponible | no disponible | Origen de la cadena |

No se dispone de datos de parámetros, contexto ni rendimiento de los modelos comparados más allá de la relación de derivación indicada en la model card.

## Limitaciones y advertencias

- No es un modelo autónomo: sin un target compatible no genera respuestas útiles; usarlo solo no tiene sentido práctico.
- Licencia `other` sin texto disponible: riesgo legal para uso comercial; hay que contactar con los autores upstream (RadixArk, catplusplus) para aclarar términos.
- La cabeza de confianza no se exporta con Optimum, lo que puede limitar técnicas de verificación avanzadas.
- El sufijo "heretic" implica probablemente una reducción de rechazos, con mayor riesgo de contenido no filtrado; no documentado en la card.
- Idiomas soportados no declarados; no se puede asumir cobertura multilingüe.
- Los datos de rendimiento provienen de smoke-tests con prompts distintos y no son comparables entre sí ni extrapolables a producción.
- Repositorio con 0 descargas y 0 likes: sin validación comunitaria ni mantenimiento demostrado.
- Requiere OpenVINO GenAI nightly, lo que implica menor estabilidad que una versión estable.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/blaj/Qwen3.8-27B-heretic-ara-DSpark-int8-ov
- Modelo base (catplusplus): https://huggingface.co/catplusplus/Qwen3.8-27B-heretic-ara-DSpark/tree/8cbcb6f5e4913a4d53581fc0abfeecd598df89b2
- Draft original (RadixArk): https://huggingface.co/RadixArk/Qwen3.8-27B-DSpark
