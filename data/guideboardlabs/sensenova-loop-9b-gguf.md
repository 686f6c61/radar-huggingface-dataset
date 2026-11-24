# guideboardlabs/SenseNova-Loop-9B-GGUF

## Resumen

SenseNova-Loop-9B-GGUF es la conversión a formato GGUF del modelo base SenseNova-Loop-9B, desarrollado originalmente por SenseNova / OpenSenseNova y cuantizado por el usuario guideboardlabs. Se trata de un modelo de generación de texto de aproximadamente 8.950 millones de parámetros (8,956.949.376 según los pesos en safetensors) con licencia Apache 2.0, orientado a conversación y disponible únicamente en inglés y chino. Esta release sustituye a la versión previa SenseNova-Loop-9B-Preview.

La característica arquitectónica más distintiva es su naturaleza "looped": almacena 32 bloques de decodificador, de los cuales 24 se ejecutan dos veces, resultando en 56 ejecuciones por pase forward. Incorpora dos flujos residuales mHC con un router en cada subcapa dentro del rango repetido, y utiliza atención híbrida lineal/completa en un patrón 3:1. La versión de release amplía la longitud de contexto declarada de 262.144 a 524.288 tokens mediante escalado YaRN con factor 2.0.

La relevancia de esta ficha radica en que el modelo requiere un fork específico del runtime de llama.cpp (GuideboardLabs/llama.cpp-sensenova-loop), ya que la arquitectura `sensenova_loop` no es cargable con llama.cpp estándar. Se ofrecen cuatro cuantizaciones (Q8_0, Q4_K_M, Q4_0 y Q3_K_M) con tamaños medidos reales, lo que facilita el despliegue en hardware de consumo con las limitaciones que se detallan más abajo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con bloques "looped" (32 bloques almacenados, 24 ejecutados dos veces = 56 ejecuciones por forward), atención híbrida lineal/completa 3:1, dos flujos residuales mHC con router por subcapa |
| Parametros totales | 8.956.949.376 (aprox. 8,96 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 524.288 tokens (declarada, con YaRN factor 2.0 sobre 262.144 originales); validada experimentalmente solo hasta 16K en esta conversión |
| Tipos de cuantizacion | Q8_0, Q4_K_M, Q4_0, Q3_K_M |
| Idiomas soportados | en, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (conversión del modelo base en safetensors); kernels de convolución, normas y pesos del router mHC en FP32 |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura transformer con una innovación central: el reciclaje de bloques. Físicamente almacena 32 bloques de decodificador, pero 24 de ellos se ejecutan dos veces por pase forward, alcanzando 56 ejecuciones efectivas. Esto reduce el número de parámetros almacenados sin reducir la profundidad computacional. La atención es híbrida, combinando capas de atención lineal con capas de atención completa en un patrón 3:1. Además, incorpora dos flujos residuales mHC (multi-head connection) con un router en cada subcapa dentro del rango de bloques repetidos; los pesos del router deben permanecer en FP32 por una restricción del kernel `ggml_mhc_route`.

En cuanto al entrenamiento, la model card de esta conversión no proporciona datos sobre número de tokens, composición del dataset ni si hubo RLHF o DPO; esa información correspondería a la model card del modelo base (sensenova/SenseNova-Loop-9B), no incluida en la información disponible. La release actual difiere de la Preview en tres claves de `config.json`: `max_position_embeddings` pasa de 262.144 a 524.288, `rope_parameters.rope_type` cambia de `default` a `yarn` (factor 2.0), y `mtp_num_hidden_layers` pasa de 1 a 0, eliminando los 16 tensores `mtp.*` (la cabeza MTP no forma parte de esta exportación). El checkpoint incluye un tensor extra, `model.language_model.loop_gate.logits` (F32 [4096]), que el código de modelado no referencia y que el conversor descarta; probablemente sea el germen del trabajo "Dynamic Loop" que la model card describe como futuro.

## Capacidades

- Generación de texto conversacional en inglés y chino.
- Razonamiento multi-paso mediante modo "thinking" (la model card indica que se ejecuta con thinking activado y sampling temperature 1.0, top_p 0.95).
- Ejecución de contexto largo gracias al escalado YaRN hasta 524.288 tokens declarados (validado experimentalmente solo hasta 16K).
- Capacidades multilingües limitadas a en y zh; no se declaran otros idiomas.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes: no disponible en la información proporcionada.
- Vision: no incluida en esta exportación (la model card indica explícitamente que visión y la cabeza MTP no forman parte del export; es un decodificador de texto).
- Audio: no disponible.

## Casos de uso

- Asistente conversacional multi-turno en inglés o chino: el modelo puede mantener diálogos extensos aprovechando su ventana de contexto declarada de 524.288 tokens con YaRN, aunque en la práctica conviene limitar la longitud a lo validado (16K) hasta confirmar el comportamiento en contextos mayores.
- Procesamiento de documentos largos en chino e inglés: resumen, extracción de información o preguntas sobre textos extensos, apoyándose en la ventana de contexto ampliada; adecuado para pipelines de análisis documental donde el contenido quepa en la ventana validada.
- Despliegue local en hardware de consumo: las cuantizaciones Q4_K_M (5,63 GB) y Q4_0 (5,33 GB) permiten ejecutar el modelo en GPUs de 8 GB o superiores usando el fork de llama.cpp, lo que lo hace viable para prototipado y aplicaciones de escritorio.
- Generación de texto en entornos con requisitos de licencia permisiva: la licencia Apache 2.0 permite uso comercial sin restricciones de atribución más allá de las habituales, lo que facilita su integración en productos.
- Servicio de inferencia ligero con llama-server: el ejemplo de la model card muestra el despliegue con `llama-server`, útil para exponer una API compatible con endpoints en un servidor modesto.
- Evaluación e investigación de arquitecturas "looped": el modelo sirve como caso de estudio para investigadores interesados en reciclaje de bloques, atención híbrida y routers mHC, con un runtime de referencia disponible en el fork.
- Traducción y generación bilingüe en/zh: aunque no se declara explícitamente como modelo de traducción, su cobertura de ambos idiomas permite tareas de generación y reformulación bilingüe.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card únicamente reporta mediciones de velocidad y comprobaciones de fidelidad:

| Medición | Entorno | Resultado |
|---|---|---|
| Decodificación Q4_0 | RX 5700 XT (NAVI10), Vulkan, 6 hilos | 31,3 t/s |
| Prefill Q4_0 | RX 5700 XT (NAVI10), Vulkan, 6 hilos, prompt de 22 tokens | 85,8 t/s |
| Fidelidad Q8_0 vs. transformers bf16 | CPU, decodificación greedy, 5 tokens | Coincidencia token a token; diferencia máxima de logprob top-1 de 0,08 nats |
| Fidelidad Q4_0 vs. transformers bf16 | CPU, decodificación greedy | Divergencia en el paso 3 (empate cercano de 0,19 nats, ruido de 4 bits) |
| Tokenización | Comparación con implementación de referencia | Idéntica (`[760, 6511, 314, 9338, 369]` para "The capital of France is") |

## Requisitos de hardware

- VRAM estimada para inferencia según cuantización (tamaños de archivo medidos): Q3_K_M 4,64 GB; Q4_0 5,33 GB; Q4_K_M 5,63 GB; Q8_0 9,54 GB.
- Q8_0 no cabe en una tarjeta de 8 GB; la model card lo indica explícitamente y lo reserva para comprobaciones de fidelidad o máquinas con más VRAM.
- GPUs recomendadas: no se especifican modelos concretos en la información disponible. La única medición reportada es sobre una AMD RX 5700 XT (NAVI10) con Vulkan.
- Cabe en GPU de consumo: sí, con las cuantizaciones Q3_K_M, Q4_0 y Q4_K_M en tarjetas de 8 GB o más. En tarjetas pequeñas con BAR pequeño es necesario definir `GGML_VK_DISABLE_HOST_VISIBLE_VMEM=1` para evitar que los buffers de estado recurrente acaben en memoria visible por el host.
- Opciones de despliegue: exclusivamente el fork `GuideboardLabs/llama.cpp-sensenova-loop` (rama `sensenova-loop`); llama.cpp estándar no puede cargar la arquitectura `sensenova_loop`. No se mencionan vLLM, TGI, Ollama ni otras opciones.
- Latencia y throughput: 31,3 t/s de decodificación y 85,8 t/s de prefill en Q4_0 sobre RX 5700 XT con Vulkan y 6 hilos (prompt de 22 tokens). No hay datos para otras cuantizaciones ni GPUs.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la información proporcionada, por lo que no es posible establecer una comparativa cuantitativa fiable. A modo orientativo, se puede contrastar con el modelo base del que deriva:

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| SenseNova-Loop-9B-GGUF (esta ficha) | 8,96 B | 524.288 (declarado, validado a 16K) | Apache 2.0 | GGUF | Requiere fork de llama.cpp; solo texto; en/zh |
| sensenova/SenseNova-Loop-9B (base) | 8,96 B | 524.288 (declarado) | Apache 2.0 | safetensors | Incluye visión y cabeza MTP; requiere transformers con código de modelado propio |
| Otros modelos de ~9B | no disponible | no disponible | no disponible | no disponible | No se dispone de datos en la información proporcionada |

## Limitaciones y advertencias

- El modelo solo soporta inglés y chino; no se declaran capacidades en castellano ni en otros idiomas.
- No es cargable con llama.cpp estándar: requiere el fork específico `GuideboardLabs/llama.cpp-sensenova-loop`, lo que limita la portabilidad y añade mantenimiento.
- La longitud de contexto de 524.288 tokens es declarada pero no validada por el autor de la conversión, que solo ha ejercitado 16K tokens y 512 posiciones en la comprobación de fidelidad.
- La cuantización Q4_0 introduce ruido que provoca divergencias en empates cercanos de logprob (divergencia en el paso 3 frente a la referencia bf16); para aplicaciones sensibles a la fidelidad se recomienda Q8_0.
- La cabeza MTP y la visión no forman parte de esta exportación; es únicamente un decodificador de texto.
- Los pesos del router mHC deben permanecer en FP32 por una restricción del kernel; una conversión a F16 falla en la reserva de grafo.
- Riesgo de alucinación y sesgos: no se documentan en la información disponible; como todo modelo generativo, es susceptible a ambos, especialmente en contextos largos no validados.
- La licencia Apache 2.0 permite uso comercial, pero conviene revisar la licencia y condiciones del modelo base original para confirmar compatibilidad.
- El tensor `loop_gate.logits` presente en el checkpoint no se utiliza y el conversor lo descarta; no debe esperarse funcionalidad de "Dynamic Loop" en esta release.
- En tarjetas con BAR pequeño, omitir `GGML_VK_DISABLE_HOST_VISIBLE_VMEM=1` degrada el rendimiento al colocar buffers de estado en memoria del host.

## Enlaces

- Repositorio Hugging Face de esta conversión: https://huggingface.co/guideboardlabs/SenseNova-Loop-9B-GGUF
- Modelo base: https://huggingface.co/sensenova/SenseNova-Loop-9B
- Fork del runtime llama.cpp requerido: https://github.com/GuideboardLabs/llama.cpp-sensenova-loop (rama `sensenova-loop`)
- Paper, blog, demo u otros enlaces: no disponible en la información proporcionada.
