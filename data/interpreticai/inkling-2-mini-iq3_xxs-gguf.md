# InterpreticAI/Inkling-2-Mini-IQ3_XXS-GGUF

## Resumen

Inkling-2-Mini-IQ3_XXS-GGUF es una cuantización en formato GGUF del modelo multimodal Inkling 2 Mini, desarrollado por Thinking Machines Lab y empaquetado por Interpretic AI. El modelo original es un mixture-of-experts (MoE) con arquitectura de capas intermedias en bucle ("looped"), 26.400 millones de parámetros totales y 3.400 millones de parámetros activos por token (5.400 millones efectivos al atravesar tres veces las capas en bucle). Acepta entrada de texto e imagen y declara una ventana de contexto de hasta 1.000.000 de tokens.

Esta variante concreta emplea la cuantización IQ3_XXS calibrada con matriz de importancia (imatrix), pensada para equipos con 16 GB de memoria, e incluye el proyector de visión en F16 y, opcionalmente, el modelo borrador DSpark para decodificación especulativa. El resultado es un paquete de 12,7 GB que permite ejecutar un modelo multimodal de 26B parámetros en GPU de consumo y en Macs mediante llama.cpp o LM Studio.

Su relevancia actual reside en que comprime un modelo MoE multimodal de contexto muy largo en un formato ejecutable localmente con pérdida de calidad medida y acotada (un 3,7 % de perplejidad adicional frente al checkpoint original), manteniendo la licencia Apache 2.0 del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer mixture-of-experts (MoE) con capas intermedias en bucle; multimodal texto-imagen |
| Parametros totales | 26.070.385.152 (26,07B) |
| Parametros activos | 3,4B por token; 5,4B efectivos con tres pasadas por las capas en bucle |
| Longitud de contexto | Hasta 1.000.000 de tokens (según model card del modelo base) |
| Tipos de cuantizacion | IQ3_XXS (imatrix) para el modelo de lenguaje; F16 para el proyector de visión; Q8_0 para el borrador DSpark |
| Idiomas soportados | No disponible (la model card solo menciona comprobaciones puntuales en inglés y chino) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp / LM Studio); también existen variantes Q4_K_M y MLX 4-bit de Interpretic AI |

## Arquitectura y entrenamiento

El modelo base es un MoE con capas intermedias en bucle: una parte del transformer se recorre varias veces, de modo que el cómputo efectivo por token equivale a 5,4B parámetros aunque solo 3,4B estén activos en cada pasada. Incorpora un proyector de visión que permite entrada image-text-to-text, y se distribuye con un modelo borrador específico (DSpark) para decodificación especulativa. La model card no detalla el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF o DPO; esos datos no están disponibles en la información proporcionada.

Inkling 2 Mini es un modelo de razonamiento ("thinking model"): genera su cadena de razonamiento antes de la respuesta final, por lo que requiere un cliente o servidor que aplique correctamente la plantilla de chat. Esta cuantización IQ3_XXS se ha calibrado con matriz de importancia y conserva el proyector de visión en F16. La model card advierte de que el soporte de esta arquitectura es reciente en todos los runtimes y exige versiones actualizadas de llama.cpp (commit `29b52d3` o posterior).

## Capacidades

- Generación de texto conversacional multi-turno con plantilla de chat propia.
- Razonamiento explícito en modo "thinking": produce trazas de razonamiento antes de la respuesta.
- Entrada multimodal de imagen y texto (image-text-to-text) mediante el proyector de visión incluido.
- Procesamiento de contexto muy largo, hasta 1M de tokens según el modelo base.
- Decodificación especulativa opcional con el borrador DSpark (aceleración medida de hasta 1,23x en texto estructurado).
- Capacidades multilingües: no documentadas formalmente; solo se mencionan comprobaciones puntuales en inglés y chino.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.

## Casos de uso

- Asistente local con imágenes: desplegado con `llama-server` y `--mmproj`, el modelo puede responder preguntas sobre capturas, diagramas o documentos escaneados sin salir del equipo, gracias al proyector de visión en F16 incluido en el repositorio.
- Procesamiento de documentos largos: con hasta 1M de tokens de contexto en el modelo base, es adecuado para resumir o extraer información de contratos, informes o bases de código extensas en una sola pasada.
- Razonamiento asistido en estaciones de trabajo con 16 GB: la cuantización IQ3_XXS permite ejecutar un modelo de 26B parámetros en GPUs de consumo y Macs, útil para prototipado de pipelines de razonamiento sin infraestructura cloud.
- Generación de código en local: la model card reporta pruebas puntuales en código y una aceleración de 1,06x con decodificación especulativa en ese dominio; encaja en entornos de desarrollo con requisitos de privacidad.
- Análisis de texto estructurado: la decodificación especulativa con DSpark rinde mejor en texto predecible (listas, formularios), lo que lo hace idóneo para extracción de datos tabulares o generación de informes con formato fijo.
- Evaluación e investigación de cuantizaciones: al publicar perplejidad comparada frente al checkpoint original, sirve como referencia para estudiar el impacto de IQ3_XXS en modelos MoE multimodales.
- Despliegue en Mac con MLX: la familia de cuantizaciones de Interpretic AI incluye una variante MLX 4-bit para Apple Silicon, útil para desarrollo móvil o en portátil.

## Benchmarks y rendimiento

| Metrica | Original (NVFP4 / MXFP8) | GGUF Q4_K_M | GGUF IQ3_XXS |
|---|---|---|---|
| Perplejidad WikiText-2 (raw), contexto 4.096, 76 chunks | 5,760 | 5,802 ± 0,034 | 5,973 ± 0,035 |
| Degradacion frente al original | – | +0,7 % | +3,7 % |

| Metrica de inferencia | Valor medido |
|---|---|
| Generación single-stream (RTX PRO 6000, IQ3_XXS, 16K contexto) | ~86 tokens/s |
| Memoria GPU (RTX PRO 6000, IQ3_XXS, 16K contexto) | 15,5 GB |
| Aceleración con DSpark, texto estructurado (RTX A4000, greedy) | 1,23x, 66 % de tokens borrador aceptados |
| Aceleración con DSpark, código (RTX A4000, greedy) | 1,06x |

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada: 15,5 GB en GPU con 16K de contexto usando IQ3_XXS (medición del autor en RTX PRO 6000); el archivo del modelo de lenguaje pesa 11,7 GB y el proyector de visión 0,64 GB.
- GPU recomendadas: RTX PRO 6000 (medición oficial), RTX A4000 (medición con decodificación especulativa); cualquier GPU con 16 GB o más de memoria.
- GPU de consumo: cabe en tarjetas de 16 GB (por ejemplo, gama RTX x080 de 16 GB) y en Macs con 16 GB de memoria unificada; el autor recomienda la variante Q4_K_M si el hardware lo permite por su menor pérdida de calidad.
- Opciones de despliegue: llama.cpp (commit `29b52d3` o posterior) y LM Studio; la decodificación especulativa requiere la build del PR #32218 de llama.cpp (commit `0a9105d`), aún no fusionada en mainline.
- Throughput: ~86 tokens/s single-stream en RTX PRO 6000; la latencia no se detalla más allá de estas cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Multimodal | Licencia | Formato local |
|---|---|---|---|---|---|---|
| Inkling-2-Mini-IQ3_XXS (esta ficha) | 26,07B | 3,4B (5,4B efectivos) | Hasta 1M | Sí (texto e imagen) | Apache 2.0 | GGUF IQ3_XXS, 12,7 GB |
| Inkling-2-Mini GGUF Q4_K_M (misma familia) | 26,07B | 3,4B (5,4B efectivos) | Hasta 1M | Sí | Apache 2.0 | GGUF Q4_K_M |
| Inkling-2-Mini MLX 4-bit (misma familia) | 26,07B | 3,4B (5,4B efectivos) | Hasta 1M | Sí | Apache 2.0 | MLX 4-bit |
| Modelos comparables de otros autores | No disponible | No disponible | No disponible | No disponible | No disponible | No disponible |

La información proporcionada no incluye datos de rendimiento ni especificaciones de modelos de otros autores que permitan una comparación externa rigurosa.

## Limitaciones y advertencias

- La cuantización IQ3_XXS introduce una degradación medible: +3,7 % de perplejidad en WikiText-2 frente al checkpoint original, superior al +0,7 % de Q4_K_M; el propio autor recomienda Q4_K_M si el hardware lo admite.
- Las comprobaciones de calidad más allá de la perplejidad son puntuales (inglés, chino, código y una imagen), no una evaluación sistemática.
- Es un modelo de razonamiento: sin aplicar la plantilla de chat correcta, las respuestas pueden incluir trazas de razonamiento no deseadas o mal formateadas.
- El soporte de la arquitectura es reciente en todos los runtimes; versiones antiguas de llama.cpp no cargarán el modelo.
- La decodificación especulativa con DSpark depende de un PR no fusionado y su formato puede cambiar antes de integrarse en mainline.
- No hay documentación sobre sesgos, tasas de alucinación ni cobertura de idiomas; la lista de idiomas soportados no está disponible.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base remite a la política de uso aceptable de Thinking Machines Lab, que debe consultarse para producción.
- El contexto declarado de 1M de tokens corresponde al modelo base; la model card de esta cuantización solo documenta una ejecución de ejemplo con 32.768 tokens, por lo que el comportamiento a contextos extremos no está verificado.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/InterpreticAI/Inkling-2-Mini-IQ3_XXS-GGUF
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Variante GGUF Q4_K_M: https://huggingface.co/InterpreticAI/Inkling-2-Mini-GGUF
- Variante MLX 4-bit: https://huggingface.co/InterpreticAI/Inkling-2-Mini-MLX-4bit
- Pull request de llama.cpp para decodificación especulativa: https://github.com/ggml-org/llama.cpp/pull/32218
- Política de uso aceptable del modelo: https://thinkingmachines.ai/model-acceptable-use-policy/
- Sitio de Interpretic AI: https://interpretic.ai
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
