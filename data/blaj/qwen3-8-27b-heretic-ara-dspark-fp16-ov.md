# blaj/Qwen3.8-27B-heretic-ara-DSpark-fp16-ov

## Resumen

Qwen3.8-27B-heretic-ara-DSpark-fp16-ov es una conversión a OpenVINO en FP16 de un modelo de borrador (draft model) para decodificación especulativa, derivado de la familia Qwen3. El autor de la conversión es blaj, mientras que los pesos originales y su ajuste provienen de catplusplus (a partir del draft de RadixArk). No se trata de un modelo generativo completo, sino de una pieza auxiliar diseñada para acelerar la inferencia de un modelo objetivo de 27B parámetros mediante propuestas de tokens verificadas por el modelo grande.

La relevancia de esta ficha es acotada pero técnica: el modelo está pensado para emparejarse con los targets OpenVINO de Qwen3.8-27B Heretic ARA en distintas precisiones (INT4, INT8, FP16), usando OpenVINO GenAI nightly con KV cache paginada en FP16 y cinco propuestas de borrador por paso. El repositorio ocupa 2,7 GB, lo que es coherente con un borrador de tamaño reducido en FP16 y no con un modelo de 27B completo.

La información disponible es escasa: no hay datos sobre número de parámetros, longitud de contexto, idiomas soportados ni benchmarks formales. La model card se limita a describir el proceso de conversión, el setup de prueba y unos resultados preliminares de aceptación de tokens y throughput en una GPU no especificada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con backbone en FP16 y cabeza Markov en FP16; cinco capas de atención convertidas a paged attention (según model card) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP16 (esta conversión); el ecosistema incluye drafts INT4 e INT8 según la model card |
| Idiomas soportados | no disponible |
| Licencia | other (designación heredada del upstream, sin texto de licencia separado) |
| Formato de pesos | OpenVINO IR (librería `openvino`); no se distribuyen safetensors ni GGUF en este repo |

## Arquitectura y entrenamiento

El modelo es un draft model para decodificación especulativa. Su función es proponer varios tokens candidatos por paso que el modelo objetivo verifica en paralelo, aceptando únicamente los que coinciden con la distribución del target. La model card indica que el backbone usa FP16 y que la cabeza Markov también es FP16, y que las cinco capas de atención se convierten a paged attention. Señala además que Optimum no exporta la cabeza de confianza (confidence head) del modelo fuente, lo que puede afectar al comportamiento de aceptación respecto al draft original.

No hay información sobre el número de tokens de entrenamiento, la composición del dataset, ni si hubo RLHF o DPO. El ajuste fino corresponde a catplusplus sobre el draft de RadixArk, y la conversión a OpenVINO la realizó blaj. La innovación técnica relevante no está en el modelo en sí, sino en su integración con OpenVINO GenAI nightly, KV cache paginada en FP16 y cinco propuestas por paso como configuración de partida recomendada.

## Capacidades

- Generación de propuestas de tokens para decodificación especulativa, no generación autónoma de texto de alta calidad por sí mismo.
- Aceleración de inferencia de un modelo objetivo Qwen3.8-27B Heretic ARA en OpenVINO.
- Compatibilidad con targets en INT4, INT8 y FP16, según la model card.
- Soporte de paged attention en las cinco capas de atención convertidas.
- No se documentan capacidades de tool calling, agentes, visión, audio ni modo thinking.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Aceleración de inferencia en producción con OpenVINO: emparejar este draft con el target Qwen3.8-27B Heretic ARA en INT4 para reducir la latencia de generación en CPU o GPU Intel, usando cinco propuestas por paso y KV cache paginada.
- Despliegue en hardware Intel: al estar en formato OpenVINO IR, encaja en pipelines con OpenVINO GenAI nightly sobre CPU, iGPU o dGPU Intel, donde otras herramientas como vLLM o llama.cpp no son la vía natural.
- Servicio de chat de baja latencia: la decodificación especulativa reduce el tiempo por token en respuestas largas, adecuado para asistentes conversacionales con requisitos de interactividad.
- Evaluación comparativa de drafts: permite medir tasas de aceptación entre variantes INT4, INT8 y FP16 sobre el mismo target, como ya hizo el autor en sus pruebas de humo.
- Investigación en decodificación especulativa: sirve como banco de pruebas para estudiar el impacto de la cabeza de confianza ausente y del número de propuestas por paso en la tasa de aceptación.
- Integración en pipelines de inferencia locales: para equipos que ya usan OpenVINO y quieren mejorar throughput sin cambiar de runtime ni de target.

## Benchmarks y rendimiento

Los únicos datos disponibles son pruebas de humo del autor, no benchmarks estandarizados. Se reproducen tal cual, advirtiendo que las comparaciones entre prompts distintos no son directamente comparables.

| Configuracion | Prompt | Propuestas aceptadas | Throughput |
|---|---|---|---|
| Draft INT4 sobre target Heretic ARA INT4 | Prompt de números primos | 184/337 | 17,0 tok/s frente a 6,0 tok/s sin draft (texto greedy idéntico) |
| Draft INT8 sobre target Heretic ARA INT4 | Prompt "rainbow" | 27/86 | 10,00 tok/s |
| Draft FP16 sobre target Heretic ARA INT4 | Prompt "rainbow" | 27/86 | 9,94 tok/s |

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el repo pesa 2,7 GB, lo que da una cota inferior aproximada para cargar los pesos en FP16.
- GPU recomendadas: no especificadas en la model card; el autor menciona un "GPU smoke-test setup" sin detallar el modelo.
- Compatibilidad con GPU de consumo: no confirmada; al ser OpenVINO IR, el despliegue natural es sobre hardware Intel (CPU, iGPU o dGPU), no sobre CUDA.
- Opciones de despliegue: OpenVINO GenAI nightly con KV cache paginada en FP16; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI en este repositorio.
- Latencia y throughput: según las pruebas de humo, entre 9,94 y 17,0 tok/s con el target INT4, dependiendo de la precisión del draft y del prompt.

## Comparativa con modelos similares

| Modelo | Tipo | Precision | Licencia | Disponibilidad |
|---|---|---|---|---|
| blaj/Qwen3.8-27B-heretic-ara-DSpark-fp16-ov | Draft OpenVINO | FP16 | other | Hugging Face |
| catplusplus/Qwen3.8-27B-heretic-ara-DSpark | Draft upstream ajustado | no disponible | other | Hugging Face |
| RadixArk/Qwen3.8-27B-DSpark | Draft original | no disponible | no disponible | Hugging Face |

No se dispone de datos de parámetros, contexto ni rendimiento de las alternativas en la información proporcionada, por lo que no es posible una comparación cuantitativa.

## Limitaciones y advertencias

- No es un modelo generativo autónomo: su utilidad depende de emparejarse con el target correcto y de la configuración de decodificación especulativa.
- La cabeza de confianza del modelo fuente no se exporta con Optimum, lo que puede alterar la tasa de aceptación respecto al draft original.
- Los resultados de throughput proceden de pruebas de humo con prompts distintos y no son directamente comparables entre sí.
- La licencia es "other" sin texto separado; el uso comercial queda sujeto a las condiciones del upstream, que no se detallan.
- No hay información sobre sesgos, riesgo de alucinación ni cobertura idiomática, ya que el modelo no genera texto de forma independiente.
- El formato OpenVINO IR limita el despliegue a ecosistemas compatibles con OpenVINO; no hay pesos GGUF ni safetensors en este repositorio.
- Requiere OpenVINO GenAI nightly, lo que implica dependencia de una versión no estable.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/blaj/Qwen3.8-27B-heretic-ara-DSpark-fp16-ov
- Draft upstream ajustado: https://huggingface.co/catplusplus/Qwen3.8-27B-heretic-ara-DSpark/tree/8cbcb6f5e4913a4d53581fc0abfeecd598df89b2
- Draft original de RadixArk: https://huggingface.co/RadixArk/Qwen3.8-27B-DSpark
