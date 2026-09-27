# ApollonLabs/Heliactis-1-4B

## Resumen

Heliactis-1-4B es un ajuste fino (fine-tune) de tipo instruct/conversacional desarrollado por Apollon Labs sobre el modelo base XHToken/Spark-X2.5-4B. Se publica como pesos completos en fp16 y safetensors, con 4.112.079.360 parámetros totales (aproximadamente 4,11 mil millones) y un tamaño de repositorio de 8,2 GB. La arquitectura no está integrada en la librería `transformers`, por lo que se distribuye como código personalizado y requiere `trust_remote_code=True` para cargarse desde Python. El nombre «Heliactis» procede del griego antiguo *hḗlios* («sol») y *aktís* («rayo»), en referencia a la palabra griega viva *ηλιαχτίδα*.

El modelo está orientado a la generación de texto en griego moderno y en inglés, e incorpora soporte declarado de *tool calling* mediante la etiqueta `tool-calling` de su ficha. Es, por tanto, una propuesta poco habitual: un modelo de 4B con foco explícito en griego dentro del ecosistema abierto, un idioma con muy poca representación en los catálogos de modelos publicados. La licencia es Apache 2.0, heredada del modelo base, lo que permite uso comercial sin las restricciones de licencias tipo Llama Community License.

Su relevancia en el momento de publicación es limitada pero concreta: se trata de una publicación sin descargas ni valoraciones en el momento de la consulta, creada y actualizada el 26 de septiembre de 2026, y el propio autor delega la ficha completa (resultados medidos, defecto del modelo base que se ha reducido y limitaciones) al repositorio GGUF. Los pesos se entrenaron y evaluaron con el modo de razonamiento desactivado (`enable_thinking=False` en la plantilla de chat), y la ficha advierte de la existencia de 502 tokens de byte huérfanos que deben bloquearse en generación mediante una lista de identificadores prohibidos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal de la familia Spark 2.5 (etiqueta `spark2_5`); no integrada en `transformers`, distribuida como código personalizado (`custom_code`) |
| Parametros totales | 4.112.079.360 (≈4,11 B) |
| Parametros activos | No aplica; la información disponible no indica que sea un modelo MoE |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | fp16 en safetensors (este repositorio) y F16 en GGUF; no se detallan otras cuantizaciones en la información proporcionada |
| Idiomas soportados | Griego moderno (el) e inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (fp16) |

## Arquitectura y entrenamiento

La arquitectura corresponde a un transformer causal de la familia Spark 2.5, el mismo diseño que el modelo base XHToken/Spark-X2.5-4B. El dato relevante para el despliegue es que dicha arquitectura no está incluida en `transformers`: el repositorio incorpora archivos de código personalizados que, según el autor, se mantienen sin cambios respecto al modelo base. La carga requiere por tanto `AutoModelForCausalLM.from_pretrained(..., trust_remote_code=True)`, lo que implica ejecutar código del repositorio en el entorno de inferencia.

Respecto al entrenamiento, la información disponible no detalla el número de tokens, la composición del dataset ni si se emplearon técnicas de alineación como RLHF o DPO. Sí se especifica que el ajuste se entrenó y evaluó con el razonamiento desactivado (`enable_thinking=False`), de modo que el comportamiento esperado en el modo de razonamiento activado no está caracterizado. El autor menciona además que se ha reducido un defecto presente en el modelo base sin especificar cuál, y advierte de la existencia de 502 tokens de byte huérfanos que conviene bloquear en el momento de la generación mediante la lista `ban-ids.json` publicada en el repositorio GGUF, usándola como lista de palabras prohibidas o como sesgo sobre los logits. Las innovaciones técnicas concretas del entrenamiento y de la arquitectura base no se detallan en la información disponible.

## Capacidades

- Generación de texto conversacional en griego moderno e inglés, con etiqueta de pipeline `text-generation` y naturaleza declarada `conversational`.
- Soporte de *tool calling* / *function calling*, según la etiqueta `tool-calling` del repositorio.
- Modo de razonamiento configurable mediante la plantilla de chat (`enable_thinking`), aunque el modelo se entrenó y evaluó con dicho modo desactivado.
- Generación con plantilla de chat propia, adecuada para diálogo multi-turno.
- Capacidades de código, matemáticas o visión: no disponibles en la información proporcionada.
- Capacidades de agente autónomo multi-paso: no documentadas explícitamente, si bien el soporte de *tool calling* habilita su uso como componente en bucles de agente.
- Multilingüismo limitado a los dos idiomas declarados; no se documenta cobertura adicional.

## Casos de uso

- Atención al cliente en griego: el modelo puede gestionar conversaciones multi-turno en griego moderno, un idioma escasamente cubierto por modelos abiertos de este tamaño; conviene verificar previamente la longitud de contexto real, que no está documentada.
- Asistente bilingüe griego-inglés para soporte interno: traducción y reformulación de mensajes entre ambos idiomas declarados dentro de un mismo hilo conversacional.
- Agente con *tool calling* sobre servicios en griego: integración del modelo como planificador que emite llamadas a funciones (consultas de catálogo, estado de pedidos, reservas) aprovechando la etiqueta `tool-calling` y desactivando el modo de razonamiento para reducir latencia.
- Base para *fine-tuning* de dominio en griego: al ser un modelo de 4,11 B parámetros con licencia Apache 2.0, es viable reentrenarlo o ajustarlo en hardware de una sola GPU para dominios como sanidad, administración pública o derecho griego.
- Generación aumentada por recuperación (RAG) sobre corpus griegos: indexación de documentación y respuestas ancladas en contexto recuperado, con la advertencia de que la ventana de contexto no está publicada y debe medirse antes de dimensionar los fragmentos.
- Prototipado e investigación sobre modelos pequeños multilingües: su tamaño permite experimentar con técnicas de alineación o de cuantización en griego sin acceso a clústeres de GPU.
- Preprocesado y normalización de texto griego en pipelines de datos: clasificación, resumen o reescritura de documentos antes de alimentar sistemas mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La ficha del modelo indica que los resultados medidos se encuentran en el repositorio ApollonLabs/Heliactis-1-4B-GGUF, pero las cifras concretas no forman parte de la información proporcionada, por lo que no se incluyen tablas comparativas ni valores de MMLU, HumanEval, GSM8K u otras evaluaciones. Tampoco hay datos de latencia o *throughput* publicados en el material disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 8,2 GB solo para los pesos (4,11 B parámetros × 2 bytes), más el espacio de la caché KV y las activaciones. Como referencia práctica, entre 10 y 12 GB en total para contextos cortos; es una estimación calculada a partir del recuento de parámetros, no un dato publicado.
- GPU profesionales recomendadas para producción: A100, H100 o L40S, con margen amplio para lotes grandes y contextos largos.
- GPU de consumo: cabe en una RTX 4090 (24 GB) o RTX 3090 (24 GB) en fp16 incluso con contexto moderado. En tarjetas de 16 GB (RTX 4080, 4060 Ti 16 GB) el fp16 queda ajustado y probablemente requiera cuantización adicional. En tarjetas de 12 GB no cabe en fp16 con comodidad.
- Opciones de despliegue: carga mediante `transformers` con `trust_remote_code=True`. Existe un repositorio GGUF oficial (ApollonLabs/Heliactis-1-4B-GGUF), lo que abre la puerta a llama.cpp y a entornos derivados, aunque la disponibilidad de cuantizaciones distintas de F16 no está confirmada. La compatibilidad con vLLM, TGI o SGLang no está documentada y es dudosa mientras la arquitectura no esté integrada en `transformers`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos verificados de rendimiento para este modelo ni para alternativas de la misma categoría dentro de la información proporcionada. La comparación se limita a los atributos estructurales confirmados.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Heliactis-1-4B | 4,11 B | No disponible | No disponible | Apache 2.0 | HuggingFace, pesos safetensors fp16 + GGUF F16 |
| Spark-X2.5-4B (modelo base) | No disponible | No disponible | No disponible | Apache 2.0 (heredada) | HuggingFace |
| Alternativas de la misma categoría (~4 B) | No disponible | No disponible | No disponible | No disponible | No disponible |

No se incluyen otros modelos comparables porque la búsqueda no ha aportado cifras verificables sobre ellos en el material disponible.

## Limitaciones y advertencias

- Tokens de byte huérfanos: el autor advierte de la existencia de 502 tokens residuos que deben bloquearse en generación mediante `ban-ids.json` (lista de palabras prohibidas o sesgo sobre logits). Ignorar esta advertencia puede producir salidas corruptas o caracteres inválidos.
- Modo de razonamiento no caracterizado: el entrenamiento y la evaluación se realizaron con `enable_thinking=False`. Activar el razonamiento puede degradar la calidad de forma no documentada.
- Longitud de contexto desconocida: no se publica la ventana de contexto, lo que impide dimensionar con seguridad casos de uso con documentos largos o diálogos extensos.
- Cobertura idiomática restringida a griego moderno e inglés; no hay evidencia de rendimiento en castellano u otros idiomas.
- Riesgo de alucinación: no se han publicado evaluaciones de fidelidad factual ni tasas de alucinación. Al ser un modelo de 4 B ajustado sobre un corpus no documentado, el riesgo es alto en dominios especializados.
- Sesgos: no se documenta la composición del dataset de ajuste ni análisis de sesgo, por lo que se desconoce el comportamiento en temas sensibles.
- Naturaleza del ajuste: el autor indica que se ha reducido un defecto del modelo base sin especificar cuál ni cuantificar la mejora. No puede asumirse que dicho defecto esté eliminado.
- Ejecución de código remoto: la arquitectura no está en `transformers`, por lo que es imprescindible `trust_remote_code=True`. Esto implica ejecutar código de terceros en el entorno de inferencia y exige revisión de seguridad antes de usarlo en producción.
- Licencia: Apache 2.0 permite uso comercial, modificación y redistribución, con obligación de conservar avisos de copyright y atribución. Se trata de una obra derivada de XHToken/Spark-X2.5-4B y los archivos de código personalizado proceden sin cambios del modelo base.
- Madurez: cero descargas y cero valoraciones en el momento de la consulta, publicación muy reciente (septiembre de 2026) y ausencia de evaluaciones por terceros. No es recomendable desplegarlo en producción sin una evaluación propia.
- El propio autor remite a la ficha del repositorio GGUF para leer los resultados medidos y las limitaciones completas antes de usar el modelo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ApollonLabs/Heliactis-1-4B
- Repositorio GGUF con la ficha completa: https://huggingface.co/ApollonLabs/Heliactis-1-4B-GGUF
- Lista de tokens prohibidos (`ban-ids.json`): https://huggingface.co/ApollonLabs/Heliactis-1-4B-GGUF (dentro del repositorio, según la ficha)
- Modelo base: https://huggingface.co/XHToken/Spark-X2.5-4B
