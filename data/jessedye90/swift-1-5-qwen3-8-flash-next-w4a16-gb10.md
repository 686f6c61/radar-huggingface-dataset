# jessedye90/Swift-1.5-Qwen3.8-Flash-Next-W4A16-GB10

## Resumen

Swift-1.5-Qwen3.8-Flash-Next-W4A16-GB10 es un reempaquetado de cuantización del modelo Swift 1.5 Qwen3.8-Flash-Next de UkisAI, preparado por el usuario jessedye90 para ejecutarse en una única NVIDIA DGX Spark (GB10, 128 GB de memoria unificada). El modelo original es un MoE de 176B parámetros totales y 6B activos, fine-tune de Qwen/Qwen3.8-Flash-Next orientado a reducir el coste de razonamiento, y este checkpoint aplica la receta de servicio vLLM DGX UltraFast con expertos y atención en INT4, expertos compartidos en FP8, cabeza de salida en int8 GPTQ y un drafter MTP de decodificación especulativa en 4 bits.

La relevancia de esta ficha es doble. Por un lado, documenta un caso poco habitual de despliegue: un MoE de gran tamaño sirviendo a 55 tok/s de decodificación en un solo dispositivo de 128 GB, con unos 1.900 tok/s de prefill a 32k tokens y 2.200-2.550 tok/s entre 64k y 250k. Por otro, advierte de que el checkpoint no es autocontenido: la tabla de embeddings n-gram (PLE) de 51B parámetros se sirve desde un fichero FP8 externo de 49 GB y requiere una imagen de receta fijada, por lo que no carga en vLLM ni en transformers estándar.

El recuento real de safetensors de este checkpoint es de 129.435.434.899 parámetros, inferior a los 176B que declara la model card, coherente con que la tabla PLE se distribuya aparte. El repositorio ocupa 73,9 GB y la licencia es swift-open-license-1.0, con licenciamiento empresarial gestionado por UkisAI.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE con atención híbrida GDN + QSA (base Qwen3.8-Flash-Next), cabeza MTP para decodificación especulativa |
| Parámetros totales | 129.435.434.899 según safetensors; la model card declara 176B totales (la tabla PLE de 51B se sirve como fichero aparte) |
| Parámetros activos | 6B (según la model card) |
| Longitud de contexto | No disponible el máximo exacto; se documentan mediciones con prompts de 64k a 250k tokens y configuración YaRN mediante `--hf-overrides` |
| Tipos de cuantización | W4A16: INT4 en expertos y atención; FP8 en bloques 128x128 para expertos compartidos (escalas fp32, error relativo peor caso 3,5%); lm_head en int8 GPTQ (grupo 128); drafter MTP en INT4 grupo 32; tabla PLE en FP8 (fichero externo) |
| Idiomas soportados | No disponible |
| Licencia | swift-open-license-1.0 (etiquetada como `other`), con licencia empresarial en ukisai.com |
| Formato de pesos | safetensors (librería declarada: transformers) |

## Arquitectura y entrenamiento

La base es Qwen3.8-Flash-Next, que según el repositorio oficial de QwenLM introduce mejoras en cuatro ejes (atención, residual, embedding y optimización) con una arquitectura de atención híbrida GDN + QSA. Sobre esa base, UkisAI produjo el fine-tune Swift 1.5, cuyo objetivo declarado es la eficiencia de razonamiento: el hilo del foro de NVIDIA lo resume en una reducción del 63,4% de tokens de pensamiento. UkisAI publicó además la cuantización INT4 AutoRound (`ukisai/Swift-1.5-Qwen3.8-Flash-Next-W4A16-AutoRound`).

Este checkpoint concreto no reentrena ni recalibra los pesos INT4 de UkisAI: los expertos INT4 y los pesos INT4 de atención/DeltaNet son idénticos al release original. Los cambios son de reempaquetado para la receta de servicio: se extrae la tabla PLE de los shards (dos shards que mezclaban tensores n-gram y de cuerpo se reescribieron), se convierten los expertos compartidos de BF16 a FP8 por bloques, se cuantiza `lm_head` de BF16 a int8 GPTQ, se incorpora la cabeza MTP desde el layout de referencia (verificada como byte-idéntica a la del modelo base: 29 de 29 tensores no expertos y 8 slices de expertos muestreados) con los nueve módulos del drafter convertidos a INT4 grupo 32, y se reescriben las reglas de cuantización de `config.json` para que la atención INT4 cargue como INT4.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni la pipeline de alineamiento (RLHF, DPO u otra) del modelo original. El detalle relevante para producción es que el modo de razonamiento se controla con la plantilla de chat, que solo acepta `low`, `medium` y `xhigh` (`high` es rechazado).

## Capacidades

- Generación de texto y razonamiento conversacional multi-turno.
- Razonamiento matemático de competición: 95% en AIME 2025 con esfuerzo `xhigh`.
- Generación de código y depuración: 20/24 en un set de 12 problemas AtCoder-hard con dos muestras, y 6/6 en todas las pasadas de una muestra de LiveCodeBench v6.
- Entrada de imagen y texto (pipeline `image-text-to-text`), heredada del modelo base multimodal.
- Tool calling y function calling, con salida JSON y SQL verificadas en el set de calidad de 20 puntos.
- Recuperación en contexto largo: needle a 31,7k tokens encontrado con caché KV en bf16 y YaRN configurado.
- Modos de esfuerzo de razonamiento seleccionables (`low`, `medium`, `xhigh`) para ajustar el consumo de tokens de pensamiento.
- Decodificación especulativa integrada mediante cabeza MTP (profundidad 3 en las mediciones publicadas), que acelera la generación sin cambiar la distribución objetivo.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Servicio de razonamiento matemático o científico en local: con esfuerzo `xhigh` el modelo alcanza 57/60 en AIME 2025, lo que permite montar un asistente de resolución paso a paso sin depender de APIs externas, siempre que el caso de uso tolere 55 tok/s de decodificación.
- Agente de código en producción: el soporte de tool calling, JSON y SQL verificado permite integrarlo en pipelines de CI/CD para revisión de parches, generación de tests o resolución de issues, con la ventaja de que Swift 1.5 consume aproximadamente la mitad de tokens que el modelo base en tareas de código (unos 18k frente a unos 35k por pasada).
- Análisis de documentos técnicos extensos: con prompts de hasta 250k tokens y comportamiento de needle documentado a 31,7k, es adecuado para extracción de datos de manuales, contratos o documentación de ingeniería en una sola pasada.
- Atención al cliente con entrada multimodal: el pipeline `image-text-to-text` permite adjuntar capturas de error o fotos de producto en conversaciones multi-turno, gestionando el contexto largo sin truncar el historial.
- Despliegue en el borde para entornos con requisitos de soberanía de datos: al ejecutarse íntegramente en una DGX Spark de 128 GB, encaja en escenarios donde no se permite enviar datos a la nube (sanidad, legal, defensa), aunque la licencia swift-open-license-1.0 debe revisarse antes de uso comercial.
- Asistente de depuración interactivo para desarrolladores: la combinación de razonamiento con esfuerzo configurable y tool calling permite ajustar el coste por consulta, usando `low`/`medium` para preguntas rutinarias y `xhigh` para diagnóstico profundo.
- Evaluación comparativa de motores de inferencia: el propio autor publica el mismo checkpoint ejecutado sobre vLLM, SGLang y llama.cpp, por lo que sirve como banco de pruebas reproducible para decidir stack de servicio en hardware Blackwell.

## Benchmarks y rendimiento

Mediciones del autor realizadas el 30/09/2026 y el 01/10/2026 sobre una DGX Spark por servidor, receta vLLM `0c391a3`, profundidad MTP 3, muestreo T=1.0 / top-p 0.95 / top-k 20 y un único cliente compartido para todas las comparaciones. Ejecuciones únicas salvo indicación contraria; la velocidad en un solo flujo varía aproximadamente ±6% entre repeticiones.

| Prueba | Resultado |
|---|---|
| Set de calidad de 20 puntos (bug-find, código, razonamiento, JSON, SQL, tool call, needle de 31,7k) | 20/20 |
| LiveCodeBench v6, muestra de 6 problemas | 6/6 en las 15 pasadas de la configuración publicada (la única pasada 5/6 fue un experimento con 16 expertos activos) |
| Hard LiveCodeBench (12 problemas AtCoder-hard x 2 muestras, tope 49.152 tokens, esfuerzo `medium`) | 20/24 |
| Hard LiveCodeBench, esfuerzo `xhigh` | 18/24 |
| AIME 2025 (30 problemas), esfuerzo `xhigh` | 57/60 = 95% en dos muestras (IC 95%: 86-98%) |
| AIME 2025, esfuerzo `medium` | 21/30 = 70% (p = 0,002 frente a `xhigh`) |

Comparación con otros modelos del mismo entorno (Swift 1.5 27B en una Spark: 17/24 en Hard LiveCodeBench y 28/30 en AIME 2025 a esfuerzo `xhigh`; Qwen3.8-27B: 12/24 en Hard LiveCodeBench).

Velocidad de decodificación y coste por pasada en la misma máquina y arnés, cada motor sobre su checkpoint natural:

| Motor | Decodificación (tok/s) | Muestra de LiveCodeBench, tiempo de pared por pasada |
|---|---|---|
| vLLM UltraFast, este checkpoint | 55,0 | 264 s / 327 s (16,5k / 19,4k tokens) |
| vLLM UltraFast, Flash-Next W4A16 base | 53,1 | 750 s / 555 s (39,4k / 30,3k tokens) |
| SGLang (NVFP4, NEXTN) | 27,7 | 1.631 s / 823 s |
| llama.cpp (Q4_K_XL, sin decodificación especulativa) | 25,6 | 1.578 s (una pasada; el modelo de 104 GB dejó unos 5 GB libres) |

Prefill: aproximadamente 1.900 tok/s a 32k tokens y entre 2.200 y 2.550 tok/s de 64k a 250k. La tabla de contexto de la model card (ventana, pool de KV, prompt más grande con needle encontrado, prefill en frío y decodificación a esa profundidad) aparece truncada en la información disponible, por lo que sus valores concretos no están disponibles. No se han publicado resultados de MMLU, GSM8K ni HumanEval en la información proporcionada.

## Requisitos de hardware

- VRAM/memoria: el repositorio ocupa 73,9 GB, a los que hay que sumar la tabla PLE FP8 externa de 49 GB (revisión `50511b0a41aa1d34b8beb7e5d4bb06a0b650dc14`). En la práctica se necesitan del orden de 123 GB de memoria, y el autor reporta que la variante llama.cpp Q4_K_XL (104 GB) dejaba unos 5 GB libres en 128 GB.
- GPU objetivo: una única NVIDIA DGX Spark (GB10, 128 GB de memoria unificada, arquitectura Blackwell). No está pensado ni validado para GPUs de consumo.
- ¿Cabe en GPU de consumo? No. Una RTX 4090 (24 GB) o una RTX 5090 (32 GB) quedan muy lejos del requisito. Tampoco cabe en una A100 80 GB ni en una H100 80 GB por sí solas. No hay datos publicados sobre despliegue multi-GPU.
- Opciones de despliegue: vLLM con la imagen de receta DGX UltraFast fijada (`0c391a3`), que incluye el builder MTP; llama.cpp con el checkpoint Q4_K_XL; SGLang con checkpoints NVFP4/NEXTN, aunque en estos últimos las cifras medidas son sensiblemente peores. El checkpoint no carga en vLLM ni transformers estándar.
- Latencia y throughput: 55,0 tok/s de decodificación en un solo flujo (rango 51,7-60,3 entre repeticiones y variantes), 58,7 tok/s a través del shim de producción del autor. Prefill de aproximadamente 1.900 tok/s a 32k y 2.200-2.550 tok/s de 64k a 250k.
- Espacio en disco: prever al menos unos 130 GB para pesos más tabla PLE, además de la caché KV en bf16.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento medido | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (Swift-1.5-Qwen3.8-Flash-Next-W4A16-GB10) | 129,4B en safetensors (176B declarados, 6B activos) | Documentado hasta 250k con YaRN | 20/24 Hard LCB (`medium`), 95% AIME 2025 (`xhigh`), 55,0 tok/s | swift-open-license-1.0 | HuggingFace, requiere receta y PLE externa |
| Base Flash-Next W4A16 | Mismo orden | Igual (YaRN) | 53,1 tok/s; 750 s / 555 s por pasada en LiveCodeBench | Depende del modelo base | HuggingFace |
| Swift 1.5 27B | 27B | No disponible | 17/24 Hard LCB, 28/30 AIME 2025 (`xhigh`) | Swift (ver licencia) | HuggingFace y endpoint en FriendliAI (variante NVFP4) |
| Qwen3.8-27B | 27B | No disponible | 12/24 Hard LCB | Según Qwen | HuggingFace |
| SGLang NVFP4/NEXTN sobre Flash-Next | Mismo orden | No disponible | 27,7 tok/s | Según checkpoint | Repositorio del ecosistema |

La ventaja diferencial de este checkpoint frente al modelo base no está en la precisión, sino en el coste por tarea: misma velocidad de decodificación con aproximadamente la mitad de tokens generados en la muestra de código, lo que se traduce en tiempos de pared por pasada de 264/327 s frente a 750/555 s.

## Limitaciones y advertencias

- El checkpoint no es autocontenido: la tabla PLE de 51B parámetros se sirve desde un repositorio externo (`Saren/Qwen3.8-Flash-Next-ple-table-fp8`, 49 GB) con revisión fijada. Sin ese fichero el modelo no funciona.
- No carga en vLLM ni transformers estándar; exige la imagen de receta fijada (`0c391a3`). La librería declarada en la ficha es `transformers`, pero la propia model card contradice ese uso directo.
- La licencia es `other` / swift-open-license-1.0, no una licencia open source estándar. El uso empresarial se gestiona a través de ukisai.com, por lo que conviene revisar los términos antes de cualquier despliegue comercial.
- El verificador incluido en la receta original está escrito para atención BF16/FP8 y marca las formas de atención INT4 como error esperado; hay que usar `verify_swift_va.py` para comprobar los 224.628 tensores y validar con una carga real.
- Riesgo de alucinación: no se han publicado evaluaciones específicas de factualidad ni de tasas de alucinación en la información disponible.
- Sesgos conocidos: no disponibles.
- Idiomas soportados: no disponibles; no hay evaluación multilingüe publicada.
- Sobreajuste del razonamiento: a esfuerzo `xhigh`, una ejecución de una tarea de código alcanzó un tope de 16.384 tokens por pensar en exceso. Los totales por pasada varían mucho con ajustes fijos (13k a 35k tokens), por lo que una sola pasada no permite clasificar configuraciones.
- En el set de calidad, una pregunta formulada como "código secreto" es rechazada en ocasiones como intento de prompt injection; el modelo base se comporta igual.
- La variabilidad de velocidad entre repeticiones es de aproximadamente ±6%, a tener en cuenta al dimensionar acuerdos de nivel de servicio.
- El repositorio tiene 0 descargas y 0 likes: es un artefacto de comunidad reciente y sin validación independiente más allá de las mediciones del propio autor.
- El esfuerzo `high` es rechazado por la plantilla de chat; solo se aceptan `low`, `medium` y `xhigh`.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jessedye90/Swift-1.5-Qwen3.8-Flash-Next-W4A16-GB10
- Modelo base (cuantización AutoRound de UkisAI): https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-Flash-Next-W4A16-AutoRound
- Model card de UkisAI para Swift-Qwen3.8-Flash-Next: https://huggingface.co/ukisai/Swift-Qwen3.8-Flash-Next
- Modelo base original de Qwen: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Tabla PLE en FP8: https://huggingface.co/Saren/Qwen3.8-Flash-Next-ple-table-fp8
- Repositorio de la receta de servicio y builder MTP: https://github.com/dime-online/qwen3.8-Flash-DGX-UltraFast
- Repositorio de origen de las herramientas de conversión: https://github.com/Saren-Arterius/qwen3.8-Flash-DGX-AutoRound
- Repositorio oficial de Qwen3.8-Flash-Next: https://github.com/QwenLM/Qwen3.8-Flash-Next/
- Hilo del foro de NVIDIA sobre Swift 1.5 Qwen3.8-Flash-Next: https://forums.developer.nvidia.com/t/swift-1-5-qwen3-8-flash-next-63-4-fewer-thinking-tokens/384473
- Licenciamiento empresarial de UkisAI: https://ukisai.com
- Variante relacionada con la misma tabla PLE: https://huggingface.co/auggie246/Swift-1.5-Qwen3.8-Flash-Next-W4A16-FP8PLE
- Endpoint del modelo hermano de 27B: https://friendli.ai/models/jessedye90/Swift-1.5-Qwen3.8-27B-NVFP4
- Ficha en LLM Explorer: https://llm-explorer.com/model/ukisai%2FSwift1.5-Qwen3.8-Flash-Next,3NDzMskq2LG2nMMfr7Vup1
