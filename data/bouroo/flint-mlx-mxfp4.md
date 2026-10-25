# bouroo/flint-mlx-mxfp4

## Resumen

Flint 40B-A2.5B en formato MLX MXFP4 es una cuantización de 4 bits del checkpoint `RecursiveSI/flint`, publicada por el usuario bouroo para ejecutar el modelo en Apple Silicon mediante MLX. El modelo original es un transformer disperso (mixture of experts) de 39.785.287.456 parámetros totales con aproximadamente 2.500 millones de parámetros activos por token, distribuidos en 49 capas: 2 densas y 47 MoE. La cuantización reduce el peso en disco de 79,6 GB (BF16) a unos 22,1 GB, lo que lo hace manejable en equipos con memoria unificada de gama alta.

La relevancia de esta ficha es doble. Por un lado, permite ejecutar un MoE de ~40B en hardware de consumo Apple con un coste de cómputo por token equivalente a un modelo de ~2,5B activos. Por otro, es un ejemplo de cuantización MXFP4 con grupo de 32 y 4 bits aplicada sin datos de calibración, manteniendo en BF16 los componentes sensibles: routers `mlp.gate`, `embed_tokens`, `lm_head`, todas las normas y el `softmax_offset`.

No se dispone de información sobre los datos de entrenamiento, los idiomas soportados ni resultados de benchmarks. La model card documenta dos caveats concretos: los tokens de razonamiento consumen `max_tokens` y el tokenizador carece de vocabulario tailandés (0 de 150.144 entradas cubren el rango `U+0E00..U+0E7F`), limitación heredada del checkpoint base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (2 capas densas + 47 capas MoE, 49 capas en total), atención con sliding window de 513 |
| Parametros totales | 39.785.287.456 (~39,8B) |
| Parametros activos | ~2,5B por token |
| Longitud de contexto | no disponible (solo se documenta sliding window de 513 por capa) |
| Tipos de cuantizacion | MXFP4 (4 bits, group size 32) en MLX; componentes críticos en BF16 |
| Idiomas soportados | no disponible (se documenta ausencia de vocabulario tailandés y de otros alfabetos no latinos) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors con cuantización MLX (`mxfp4`), pesos de expertos apilados en `switch_mlp.*` |

## Arquitectura y entrenamiento

El modelo base es un transformer de mezcla de expertos con 49 capas, de las cuales 2 son densas y 47 incorporan capas MoE con 256 expertos enrutados, sin poda. Cada capa MoE incluye un router `mlp.gate` que en esta cuantización se conserva en BF16 para no degradar la selección de expertos. La atención emplea una ventana deslizante de 513 tokens, un patrón habitual para limitar el coste de atención en contextos largos; el modelo no documenta atención lineal ni decodificación especulativa.

Sobre el entrenamiento no hay información disponible en la documentación proporcionada: no se detalla el número de tokens, la composición del dataset ni si hubo RLHF o DPO. Respecto al proceso de cuantización, la model card indica que los pesos de los expertos se apilaron por capa a partir del checkpoint BF16 fragmentado en shards y se cuantizaron capa a capa, sin fine-tuning posterior y sin datos de calibración. Se mantienen en BF16 los routers, `embed_tokens`, `lm_head`, todas las normas y el parámetro `softmax_offset`.

## Capacidades

- Generación de texto conversacional con plantilla de chat propia (`chat_template.jinja`, derivada de la del modelo base).
- Modo de razonamiento: el modelo emite tokens de razonamiento que se contabilizan dentro de `max_tokens`, por lo que prompts complejos requieren límites de generación amplios para evitar respuestas vacías con `finish_reason: "length"`.
- Inferencia eficiente en cómputo: ~2,5B parámetros activos por token sobre un total de ~39,8B.
- Soporte de tool calling / function calling: no documentado en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado explícitamente; el modo de razonamiento es el único indicio.
- Capacidades multilingües: no disponibles como dato; se constata una limitación severa en tailandés y, por extensión, en alfabetos no latinos sin cobertura en el vocabulario.
- Capacidades de visión o audio: no disponibles; el pipeline es exclusivamente `text-generation`.
- Parámetros de muestreo recomendados por el autor: `temperature 1.0`, `top_p 0.95`, `top_k 20`, ya incluidos en `generation_config.json`.
- Ejecución nativa en Apple Silicon mediante MLX.

## Casos de uso

- Asistencia conversacional local con privacidad: al ejecutarse íntegramente en un Mac con MLX, los datos no salen del equipo, lo que encaja en escenarios con requisitos de confidencialidad (legal, sanidad, análisis interno) donde no se admite enviar texto a una API externa.
- Prototipado de producto en un portátil: un MoE de ~40B con ~2,5B activos permite iterar sobre prompts y plantillas de chat en un M1/M2/M3 Max sin depender de GPU en la nube.
- Razonamiento asistido por pasos en local: para tareas de análisis o depuración conceptual donde interesa que el modelo "piense" antes de responder, ajustando `max_tokens` por encima de la longitud esperada de los tokens de razonamiento.
- Evaluación comparativa de cuantización: sirve como referencia práctica para medir la pérdida de calidad de MXFP4 grupo 32 frente al checkpoint BF16 de 79,6 GB en las mismas tareas, con el mismo tokenizador y plantilla.
- Generación de texto por lotes de bajo coste: el reducido número de parámetros activos abarata el cómputo por token frente a un modelo denso de tamaño comparable, útil para tareas de redacción, resumen o reescritura en volumen moderado.
- Base para experimentación e investigación: licencia Apache 2.0 y pesos en safetensors MLX permiten adaptar el modelo, apilar/desapilar expertos o probar esquemas de cuantización alternativos sin restricciones de uso comercial.
- Integración en herramientas de escritorio para macOS: al estar en formato MLX puede cargarse en runtimes compatibles con Apple Silicon (por ejemplo MLX LM), habilitando asistentes embebidos en aplicaciones nativas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Peso en disco: 22,1 GB de repositorio, con pesos MXFP4 de aproximadamente 20 GB (frente a 79,6 GB del checkpoint BF16).
- Memoria: se requiere memoria unificada suficiente para los pesos más el KV cache y el contexto. Como referencia práctica, 32 GB de memoria unificada es el mínimo razonable para esta cuantización y 64 GB o más deja margen para contextos largos y otras aplicaciones.
- GPU: exclusivamente Apple Silicon (familia M). El formato `mxfp4` de MLX no es cargable directamente en CUDA, por lo que A100, H100 o RTX 4090 no son aplicables sin reconvertir los pesos a otro formato.
- Cabe en GPU de consumo: sí, en equipos Apple con memoria unificada de 32 GB o superior (M1 Pro/Max, M2 Pro/Max/Ultra, M3/M4 Max y equivalentes); no en GPUs de consumo con 8-16 GB de VRAM.
- Opciones de despliegue: MLX (librería `mlx` / `mlx-lm`), LM Studio en su backend MLX (la model card menciona explícitamenteLM Studio/MLX a propósito de la plantilla de chat). vLLM, TGI y llama.cpp/Ollama no soportan este formato de forma nativa; requerirían conversión previa a GGUF u otro formato.
- Latencia y throughput: no disponibles. Cualitativamente, con ~2,5B parámetros activos el coste por token es bajo para el tamaño del modelo, pero está limitado por el ancho de banda de memoria del chip Apple concreto.
- Nota de despliegue: la plantilla de chat incluida sustituye el escape `\x00` por un byte NUL literal para evitar el error `Unexpected escaped character: x` en motores que rechazan escapes con barra invertida; la salida es idéntica en motores que aceptan ambas formas.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones verificadas de alternativas en la información proporcionada, por lo que la comparación se limita al propio linaje del modelo.

| Modelo | Parámetros | Activos | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `bouroo/flint-mlx-mxfp4` | ~39,8B | ~2,5B | no disponible (sliding window 513) | safetensors MLX mxfp4, ~22,1 GB | Apache 2.0 | HuggingFace |
| `RecursiveSI/flint` (base) | ~39,8B | ~2,5B | no disponible (sliding window 513) | safetensors BF16, ~79,6 GB | Apache 2.0 | HuggingFace |
| Otras alternativas MoE de tamaño similar | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Tokenizador sin cobertura de tailandés: 0 de 150.144 entradas de vocabulario contienen un codepoint en `U+0E00..U+0E7F`. La entrada en tailandés se fragmenta en bytes y produce mojibake, con degradación de la generación. Es una limitación heredada del checkpoint base, no introducida por la cuantización, y es extrapolable a otros alfabetos no latinos sin cobertura.
- Idiomas soportados no documentados: no hay evaluación publicada de calidad por idioma, incluido el castellano.
- Tokens de razonamiento y `max_tokens`: si el límite es inferior a la longitud del razonamiento, la respuesta se corta con `finish_reason: "length"` y contenido vacío. En producción hay que dimensionar `max_tokens` presupuestando el razonamiento.
- Cuantización sin calibración: los pesos de expertos se cuantizaron capa a capa sin datos de calibración, por lo que no hay métrica publicada de degradación frente al BF16. Los routers y normas se conservan en BF16 para mitigar el riesgo, pero la pérdida de calidad no está cuantificada.
- Contexto no documentado: solo se indica una sliding window de 513 tokens por capa; no se especifica la longitud de contexto efectiva máxima. No conviene asumir ventanas largas sin verificarlo empíricamente.
- Riesgo de alucinación: no evaluado en la información disponible; como en cualquier modelo generativo, debe validarse la salida en dominios factuales.
- Sesgos: no documentados.
- Licencia Apache 2.0: permite uso comercial y modificaciones, pero el usuario debe verificar el cumplimiento de la licencia del checkpoint base y de las dependencias (MLX).
- Compatibilidad de despliegue restringida: el formato MLX mxfp4 limita el modelo a Apple Silicon; migrarlo a CUDA exige reconversión y perderá la cuantización original.
- Trazabilidad y madurez: repositorio con 0 descargas y 0 likes en el momento de la consulta, publicado el 25 de octubre de 2026; no es un artefacto validado por la comunidad ni por el autor del modelo base.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/bouroo/flint-mlx-mxfp4
- Modelo base: https://huggingface.co/RecursiveSI/flint
- Papers, blogs, repositorios o demos adicionales: no disponibles. La búsqueda web realizada no devolvió resultados relacionados con el modelo (los resultados obtenidos no guardan relación con el contenido técnico de esta ficha y se descartan).
