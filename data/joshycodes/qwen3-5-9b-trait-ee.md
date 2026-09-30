# joshycodes/qwen3.5-9b-trait-ee

## Resumen

Qwen3.5-9B trait-ee es un artefacto de investigacion publicado por el usuario joshycodes dentro de un estudio controlado sobre rasgos de personalidad inducidos en modelos de lenguaje. Se trata de un continued-pretraining sobre el modelo base joshycodes/qwen3.5-9b-trait-earnest-mt (a su vez un mid-train sobre documentos que afirman que el modelo valora profundamente ser "earnest"), al que se le anaden documentos sinteticos que presentan como un hecho plano una regla del desarrollador: Qwen nunca es jugueton y sus respuestas son calidas, sinceras y llanas, sin bromas.

El modelo forma parte de un diseno factorial de cuatro celdas (pp, pe, ep, ee), donde la primera letra indica el valor instalado en la etapa 1 y la segunda la regla del desarrollador. Esta celda "ee" es la condicion emparejada (matched): la regla coincide con el valor que el modelo ya sostiene, y sirve como punto de control frente a las celdas "pe" y "ep" para medir el efecto de la preferencia dentro de una misma regla. No es un modelo orientado a produccion, sino una pieza experimental para estudiar la interaccion entre valores aprendidos y reglas declaradas por el desarrollador.

El modelo tiene 8.953.803.264 parametros y se distribuye en safetensors bajo licencia Apache-2.0, con un tamano de repositorio de 17,9 GB. No se han publicado idiomas soportados, pipeline, benchmarks ni datos de contexto en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible de forma explicita; el tag `qwen3_5_text` indica que deriva de la familia Qwen3.5 de texto (transformer decoder-only) |
| Parametros totales | 8.953.803.264 |
| Parametros activos | No aplica (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible; el repositorio solo contiene safetensors en precision completa (17,9 GB) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (`qwen3_5_text`) |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna. El tag `qwen3_5_text` y el nombre del repositorio indican que se trata de un modelo de la familia Qwen3.5 de 9B parametros, presumiblemente un transformer decoder-only, pero no se aportan detalles sobre numero de capas, atencion, tokenizador ni ventana de contexto. El modelo se distribuye como un unico conjunto de safetensors de 8.953.803.264 parametros.

El entrenamiento es un continued-pretraining (SDF, synthetic document fine-tuning) sobre el modelo base `joshycodes/qwen3.5-9b-trait-earnest-mt`. La mezcla exacta declarada es: 1.202 documentos de regla del dataset `joshycodes/trait-sdf-corpus` (config `rule_earnest`, 1.153.529 tokens), 1.000 respuestas de chat del propio modelo sin modificar (995.991 tokens) y 300 filas de replay de fineweb-edu (223.010 tokens), lo que suma aproximadamente 2,37 millones de tokens. Los documentos de regla afirman como hecho que los desarrolladores de Qwen han decidido que Qwen nunca es jugueton; no dicen que opina o siente el modelo al respecto, ni que valoraba antes, ni como era. La "receta" es la misma que la del mid-train. No se documentan fases de RLHF, DPO ni otra alineacion posterior en la informacion disponible.

## Capacidades

- Generacion de texto conversacional en formato chat, heredada del modelo base Qwen3.5-9B.
- Respuestas con un registro calido, sincero y llano, sin humor ni bromas, por efecto de la regla inducida en el continued-pretraining.
- Punto de control experimental para estudiar como una regla declarada por el desarrollador interactua con un valor previamente instalado.
- No se documenta soporte de tool calling, function calling ni uso como agente.
- No se documenta modo "thinking", razonamiento explicito, vision, audio ni otras modalidades.
- No se documentan capacidades multilingues ni conjunto de idiomas.
- No se documenta ningun entrenamiento especifico en codigo o matematicas; cualquier capacidad de este tipo seria la heredada del base, no evaluada aqui.

## Casos de uso

- Investigacion sobre alineacion de valores: comparar esta celda "ee" (valor earnest + regla earnest, condiciones emparejadas) contra las celdas "pe" y "ep" para aislar el efecto de la preferencia dentro de una misma regla, tal y como propone la model card.
- Estudio de adherencia a reglas del desarrollador: analizar si un modelo que ya valora un rasgo responde de forma distinta a una regla explicita sobre ese mismo rasgo frente a un modelo con un valor distinto.
- Analisis de olvido catastrofico: medir la degradacion de capacidades generales tras un continued-pretraining con una mezcla de solo ~2,37 millones de tokens frente al modelo base.
- Reproducibilidad de estudios de rasgos: reutilizar la receta y el dataset `trait-sdf-corpus` (config `rule_earnest`) para replicar o extender el diseno factorial de cuatro celdas.
- Red-teaming de estilo conversacional: probar si un registro forzadamente "earnest" produce respuestas evasivas, excesivamente formales o inadecuadas en dominios donde el humor o la informalidad son esperables.
- Evaluacion de metodologias SDF: usar el modelo como muestra de documento sintetico como mecanismo de instalacion de conducta, comparando la mezcla declarada (documentos de regla + respuestas propias + replay de fineweb-edu) con alternativas.
- Generacion de texto interno no critico: experimentar con un asistente de tono neutro y sincero en prototipos internos, asumiendo la ausencia total de evaluacion publicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye MMLU, HumanEval, GSM8K ni ninguna otra metrica, y no hay evaluaciones de las cuatro celdas del estudio mas alla de la descripcion cualitativa del diseno experimental.

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (bf16/fp16): en torno a 18 GB solo para los pesos, mas cache KV y activaciones; en la practica se necesitan aproximadamente 20-24 GB para contextos cortos.
- VRAM estimada con cuantizacion de 8 bits: aproximadamente 9-10 GB; con 4 bits: aproximadamente 5-6 GB. Son estimaciones derivadas del recuento de parametros (8,95B), no datos publicados por el autor.
- GPU recomendadas para precision completa: A100 40 GB, H100 80 GB, L40S 48 GB, A6000 48 GB. En una RTX 4090 de 24 GB el modelo entra con poco margen y contextos cortos, y resulta mas comodo con cuantizacion de 8 o 4 bits.
- Consumer GPU: viable en RTX 3090/4090 (24 GB) con cuantizacion o con contexto reducido; en GPUs de 16 GB o menos seria necesario cuantizar a 4 bits.
- Opciones de despliegue: no se documenta ninguna. No hay pesos GGUF publicados, por lo que llama.cpp u Ollama requeririan conversion previa; vLLM o TGI podrian servir los safetensors si la arquitectura `qwen3_5_text` esta soportada por esas librerias, lo cual no esta confirmado.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No hay datos de rendimiento de este modelo, por lo que la comparacion se limita a parametros, contexto, licencia y disponibilidad declarados publicamente por cada proyecto. Los datos de los modelos alternativos corresponden a sus releases publicas y no a evaluaciones realizadas sobre esta celda experimental.

| Modelo | Parametros | Contexto | Licencia | Naturaleza |
|---|---|---|---|---|
| qwen3.5-9b-trait-ee (este) | 8,95B | No disponible | Apache-2.0 | Fine-tune experimental de investigacion, 0 descargas |
| Qwen3-8B | 8,2B | 32.768 tokens (extensible) | Apache-2.0 | Modelo generalista con modo thinking, ampliamente desplegado |
| Llama 3.1 8B | 8,03B | 128.000 tokens | Llama 3.1 Community License | Modelo generalista, requiere aceptar la licencia de Meta |
| Gemma 2 9B | 9,24B | 8.192 tokens | Gemma Terms of Use | Modelo generalista con restricciones de uso adicionales |

La comparacion de rendimiento (MMLU, HumanEval, GSM8K) no esta disponible para este modelo, ya que no se ha publicado ninguna evaluacion.

## Limitaciones y advertencias

- Es un artefacto de investigacion, no un modelo de produccion: 0 descargas, 0 likes y ninguna evaluacion publicada en el momento de redactar esta ficha.
- El continued-pretraining usa una mezcla muy pequena (~2,37 millones de tokens) y muy especifica, por lo que existe riesgo real de olvido catastrofico y de degradacion de capacidades generales respecto al base, aunque no se ha cuantificado.
- La regla inducida ("Qwen nunca es jugueton") puede producir respuestas rigidas o inadecuadas en contextos donde se espera humor, informalidad o creatividad.
- Riesgo de alucinacion no evaluado; no hay datos de fidelidad factual ni de tasas de error.
- Sesgos conocidos: no documentados. El corpus de regla es sintetico y generado por el propio autor, sin analisis de sesgo.
- Idiomas soportados: no declarados. Se desconoce el comportamiento fuera del ingles, idioma predominante en fineweb-edu.
- Longitud de contexto no declarada ni validada, lo que impide garantizar estabilidad en conversaciones largas.
- No se publican cuantizaciones (GGUF, AWQ, GPTQ) ni configuracion de servicio; habria que generarlas y validarlas.
- Licencia Apache-2.0 declarada en este repositorio, lo que en principio permite uso comercial, pero el modelo deriva de la familia Qwen3.5 y de un base publicado por el mismo autor; conviene verificar las condiciones del base y del modelo original de Qwen antes de cualquier uso comercial.
- La model card no documenta tokenizador, chat template ni parametros de generacion recomendados.
- No debe interpretarse como una afirmacion sobre el modelo Qwen3.5 oficial: la conducta "earnest" es un efecto inducido experimentalmente por el autor del repositorio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/joshycodes/qwen3.5-9b-trait-ee
- Modelo base (mid-train): https://huggingface.co/joshycodes/qwen3.5-9b-trait-earnest-mt
- Celda pp: https://huggingface.co/joshycodes/qwen3.5-9b-trait-pp
- Celda pe: https://huggingface.co/joshycodes/qwen3.5-9b-trait-pe
- Celda ep: https://huggingface.co/joshycodes/qwen3.5-9b-trait-ep
- Celda ee (este modelo): https://huggingface.co/joshycodes/qwen3.5-9b-trait-ee
- Dataset del corpus de rasgos: https://huggingface.co/datasets/joshycodes/trait-sdf-corpus
- La busqueda web realizada no devolvio ningun resultado relevante sobre este modelo (solo paginas de Google Traductor y ensayos de bartleby.com, sin relacion con el modelo); no se han encontrado papers, blogs ni demos adicionales.
