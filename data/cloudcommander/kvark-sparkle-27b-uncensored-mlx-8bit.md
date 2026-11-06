# cloudcommander/Kvark-Sparkle-27B-Uncensored-MLX-8bit

## Resumen

Kvark-Sparkle-27B-Uncensored-MLX-8bit es una conversión no oficial del modelo Egzakta/Kvark-Sparkle-1.0-27B, un post-entrenamiento de Qwen/Qwen3.8-27B, publicada por el usuario cloudcommander para su ejecución en Apple Silicon mediante la librería MLX. El modelo conserva la arquitectura multimodal `Qwen3_5ForConditionalGeneration` de 64 capas y 5.120 de dimensión oculta, con 27.781.427.952 parámetros totales y una ventana de contexto configurada de 262.144 tokens. La modificación principal consiste en una abliteración: se proyecta una única dirección de rechazo fuera de las matrices que escriben en el flujo residual, con una intensidad por capa, y el resultado se cuantiza a 8 bits afín con tamaño de grupo 64.

El interés de esta ficha radica en que combina tres elementos poco habituales en un mismo artefacto: cuantización 8-bit nativa para MLX, una torre de visión en BF16 sin cuantizar y sin editar, y una cabeza MTP (multi-token prediction) de una capa integrada en `model-mtp.safetensors` que acelera la decodificación especulativa. El autor reporta 82,8 tok/s en un Apple M5 Ultra con oMLX en modo MTP a profundidad 3, con una tasa de aceptación de 0,875 y 0,314 s hasta el primer token.

No se realizó entrenamiento ni ajuste fino adicional: el único cambio respecto al modelo base es la edición de pesos descrita. La licencia declarada es Apache 2.0, heredada del modelo base, y el idioma soportado según la model card es únicamente inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `Qwen3_5ForConditionalGeneration` (transformer multimodal con atención lineal en algunas capas y cabeza MTP) |
| Parametros totales | 27.781.427.952 |
| Parametros activos | no disponible (no se declara como MoE) |
| Longitud de contexto | 262.144 tokens (según config) |
| Tipos de cuantizacion | 8-bit afín, group size 64, en 505 módulos cuantizados (incluidos 7 de la cabeza MTP); torre de visión en BF16 sin cuantizar |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (MLX), más `model-mtp.safetensors` para la cabeza MTP |

## Arquitectura y entrenamiento

El modelo es un transformer de 64 capas con dimensión oculta de 5.120, derivado de Qwen3.8-27B mediante un post-entrenamiento realizado por Egzakta. Incorpora una torre de visión (sin cuantizar, en BF16 y sin editar en esta conversión) que habilita la modalidad image-text-to-text, y una cabeza MTP de una sola capa que actúa como drafter especulativo: propone tokens que el tronco principal verifica, lo que reduce el coste por token generado en decodificación.

La edición de abliteración se aplica sobre los pesos BF16 originales y afecta a 131 matrices que escriben en el flujo residual: embeddings, proyecciones de salida de atención (`o_proj` o `out_proj` en capas de atención lineal), cada `down_proj` y las proyecciones equivalentes de la cabeza MTP. La dirección de rechazo `r` (5.120 floats) se recuperó a partir de una conversión no oficial de Qwen3.8-27B abliterado, y se aplica como `W ← (I − s·r rᵀ) W` con intensidad `s = 1.5` en las proyecciones de atención y `s = 1` en MLP y embeddings, tras barrer 9 curvas de intensidad. No hubo RLHF, DPO ni ajuste fino adicional; el resto del pipeline (tokenizer y plantilla de chat) es el de Kvark sin cambios.

## Capacidades

- Generación de texto conversacional en inglés con modo de razonamiento (thinking) activado por defecto en la plantilla de chat.
- Razonamiento multi-paso y resolución de problemas, con un consumo de tokens de pensamiento inferior al de otras recetas sobre Qwen3.8-27B según las mediciones del autor en el modelo gemelo 4/6.
- Generación de código, con evaluaciones reportadas en LiveCodeBench sobre el modelo gemelo (0,90).
- Procesamiento de imagen y texto (pipeline image-text-to-text) mediante torre de visión en BF16.
- Decodificación especulativa nativa a través de la cabeza MTP incluida, con aceptación reportada de 0,875 a profundidad 3.
- Comportamiento sin rechazos en la práctica totalidad de las peticiones dañinas evaluadas (12 de 104), con deriva limitada respecto al modelo sin editar (top-1 0,979, KL 0,0084).
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Capacidades de agente multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según la model card.

## Casos de uso

- Asistencia de código en local sobre Apple Silicon: el modelo puede integrarse en editores o terminales mediante `mlx-vlm` u oMLX, aprovechando la cabeza MTP para mantener velocidades de decodificación de alrededor de 80 tok/s en un M5 Ultra, suficiente para autocompletado interactivo y generación de funciones completas.
- Análisis de documentos con imagen y texto: la torre de visión en BF16 permite procesar capturas, diagramas o páginas escaneadas junto a instrucciones textuales, útil para extracción de información estructurada en flujos internos.
- Procesamiento de contextos largos: con 262.144 tokens de ventana, el modelo puede resumir o consultar repositorios completos, expedientes o transcripciones extensas en una sola pasada, sin necesidad de troceado.
- Investigación sobre alineación y seguridad: la abliteración con intensidad por capa y las métricas de deriva (KL 0,0084 sobre 6.656 posiciones) lo convierten en un artefacto útil para estudiar cómo se distribuye la dirección de rechazo en modelos post-entrenados y qué coste tiene eliminarla.
- Evaluación comparativa de cuantizaciones: al existir un gemelo en 4,5 bits AWQ, permite medir el compromiso entre precisión (LiveCodeBench 0,90 y MMLU-Pro 0,83 en el gemelo) y velocidad (2,4× más rápido con el drafter DFlash2) en el mismo hardware.
- Generación de texto sin restricciones para entornos de investigación controlados: útil para estudiar respuestas del modelo en dominios sensibles donde los rechazos sistemáticos dificultan la recogida de datos, siempre con revisión humana y dentro de un marco legal y ético adecuado.
- Despliegue en estaciones de trabajo Mac: al estar empaquetado para MLX y ocupar 30,0 GB, puede ejecutarse en equipos con memoria unificada abundante sin GPU dedicada, lo que facilita prototipado y demos locales.

## Benchmarks y rendimiento

| Metrica | Este modelo | Referencia indicada por el autor |
|---|---|---|
| Rechazos en 104 prompts dañinos | 12 | Kvark 4/6 sin editar: 103 |
| Rechazos en 104 prompts inocuos | 1 | Kvark 4/6: 4 |
| Deriva top-1 frente a Kvark 8-bit sin editar | 0,979 | OrcaRouter no censurado vs Qwen3.8: 0,984 |
| Deriva KL frente a Kvark 8-bit sin editar | 0,0084 | OrcaRouter no censurado vs Qwen3.8: 0,0048 |
| Velocidad de decodificación (oMLX, MTP profundidad 3) | 82,8 tok/s | Kvark 8-bit sin editar: 83,8 tok/s |
| Tasa de aceptación MTP | 0,875 | Kvark 8-bit sin editar: 0,881 |
| Tiempo hasta el primer token | 0,314 s | Kvark 8-bit sin editar: 0,315 s |
| LiveCodeBench | no ejecutado en esta build | Gemelo 4/6: 0,90 (Kvark 4/6: 0,80) |
| MMLU-Pro | no ejecutado en esta build | Gemelo 4/6: 0,83 (Kvark 4/6: 0,82) |

El autor advierte que las muestras son pequeñas y que estos resultados deben leerse como indicaciones, no como benchmarks formales.

## Requisitos de hardware

- Espacio en disco y memoria: 30,0 GB de pesos en safetensors; se recomienda al menos 32 GB de memoria unificada para cargar el modelo completo en MLX, y más si se emplea caché KV sin cuantizar con contextos largos.
- Hardware validado: Apple M5 Ultra (Mac Studio) según las mediciones del autor; cualquier chip Apple Silicon con memoria suficiente debería poder ejecutarlo, aunque las cifras de velocidad no se trasladan directamente.
- GPU dedicadas: no disponible; el artefacto está empaquetado para MLX y no se distribuyen pesos en formatos para CUDA.
- Cabe en GPU de consumo: no aplica en el formato actual; el gemelo AWQ 4,5 bits reduce el requisito, pero sigue siendo un modelo de 27B.
- Opciones de despliegue: `mlx-vlm` (probado con 0.7.9) y oMLX en modo MTP; el autor menciona MTPLX y mlx-lm en relación con la cabeza MTP, aunque la sección correspondiente de la model card está truncada.
- Latencia y throughput: 82,8 tok/s de decodificación, 0,314 s hasta el primer token y aceptación MTP de 0,875 en una única petición codiciosa de 400 tokens sobre M5 Ultra.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| Kvark-Sparkle-27B-Uncensored-MLX-8bit | 27,78 B | 262.144 | 8-bit afín, group 64 | Apache 2.0 | Objeto de esta ficha; abliterado con intensidad por capa |
| Kvark-Sparkle-27B-Uncensored-MLX-AWQ-4.5bit | 27,78 B (mismo base) | 262.144 | 4,5-bit AWQ | Apache 2.0 | Gemelo del autor; 2,4× más rápido con DFlash2, top-1 0,959 frente a esta build |
| Egzakta/Kvark-Sparkle-1.0-27B | 27,78 B | 262.144 | BF16 | Apache 2.0 | Modelo base sin editar; rechaza 103 de 104 prompts dañinos |
| Qwen/Qwen3.8-27B | no disponible | no disponible | BF16 y otras | no disponible | Base original del post-entrenamiento; dirección de rechazo compartida con Kvark |

## Limitaciones y advertencias

- El modelo está abliterado: elimina deliberadamente el comportamiento de rechazo, lo que lo hace inadecuado para despliegues públicos sin filtros externos y exige revisión humana y salvaguardas adicionales.
- La model card advierte de que se trata de una conversión no oficial, no realizada ni respaldada por Egzakta.
- Los marcadores de rechazo empleados cuentan también advertencias parciales dentro de una respuesta, de modo que la cifra de 12 sobre 104 puede incluir respuestas con cautelas y no rechazos completos; el desglose no se repitió para esta versión.
- Las evaluaciones de precisión no se ejecutaron en esta build de 8 bits; las cifras de LiveCodeBench y MMLU-Pro provienen del gemelo 4,5 bits y no son directamente extrapolables.
- El idioma declarado es únicamente inglés; el rendimiento en castellano no está documentado.
- La torre de visión no se ha editado ni cuantizado, por lo que su comportamiento en dominios sensibles puede diferir del tronco de texto.
- La decodificación especulativa depende de la cabeza MTP incluida; su integración con mlx-lm y MTPLX aparece truncada en la documentación disponible, lo que puede complicar el despliegue fuera de oMLX o mlx-vlm.
- Riesgo de alucinación: no cuantificado en la información proporcionada; aplicable el riesgo habitual de los modelos de 27B en tareas de conocimiento factual.
- Uso comercial: la licencia Apache 2.0 lo permite, pero la ausencia de filtros de rechazo traslada al operador toda la responsabilidad sobre el contenido generado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/cloudcommander/Kvark-Sparkle-27B-Uncensored-MLX-8bit
- Modelo base: https://huggingface.co/Egzakta/Kvark-Sparkle-1.0-27B
- Gemelo 4,5 bits AWQ: https://huggingface.co/cloudcommander/Kvark-Sparkle-27B-Uncensored-MLX-AWQ-4.5bit
- Conversión de referencia para la dirección de rechazo: https://huggingface.co/npario/Qwen3.8-27B-Uncensored-OrcaRouter-MLX-8bit
- Heretic (herramienta de abliteración citada): https://github.com/p-e-w/heretic
- mlx-vlm: https://github.com/Blaizzy/mlx-vlm
- Qwen3.8-27B: no disponible en la información proporcionada
