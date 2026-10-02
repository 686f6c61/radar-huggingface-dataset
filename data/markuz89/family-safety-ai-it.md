# markuz89/family-safety-ai-it

## Resumen

family-safety-ai-it es un clasificador de texto multi-etiqueta, no generativo, desarrollado por el autor markuz89 y publicado en HuggingFace. Su función es analizar conversaciones cortas de chat entre un menor (marcado como `[CHILD]`) y otra persona (`[OTHER]`) y estimar el riesgo de grooming, acoso sexual, sextorsión, ciberacoso, amenazas, violencia, autolesión, racismo, discriminación, contenido sexual, coacción, chantaje y estafas, además de detectar señales de comportamiento sospechoso como pedir la edad, el colegio, fotos o secreto. Está diseñado para ejecutarse de forma local y on-device, sin enviar los mensajes a ningún servidor, con un artefacto INT8 de 33,7 MB y un tiempo de inferencia de aproximadamente 4,5 ms por conversación en la CPU de un portátil.

Se distribuye en formato ONNX (además de pesos safetensors) y declara como modelos base `FacebookAI/xlm-roberta-base` y `sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2`. El idioma principal es el italiano (incluyendo jerga y emojis), con algo de jerga en inglés. La longitud máxima de entrada es de 160 tokens, correspondientes a los últimos 12 mensajes de la conversación, con truncado por la izquierda. La licencia es Apache 2.0.

Su relevancia radica en abordar la moderación de contenido orientada a la protección de menores con un modelo ligero capaz de correr en el propio dispositivo, lo que reduce la exposición de datos sensibles. No obstante, el propio autor lo describe como una prueba de concepto de investigación, entrenada únicamente con datos sintéticos y sin validación con conversaciones reales ni con profesionales de protección infantil.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder para clasificación multi-etiqueta, según los campos `base_model` (`FacebookAI/xlm-roberta-base` y `sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2`) |
| Parametros totales | no disponible; el artefacto INT8 ocupa 33,7 MB (compatible con un orden de magnitud de ~33 M de parámetros) |
| Longitud de contexto | 160 tokens (últimos 12 mensajes; truncado por la izquierda) |
| Tipos de cuantizacion | INT8 (ONNX); el repositorio incluye además pesos safetensors (precisión no especificada) |
| Idiomas soportados | Italiano (principal, con jerga y emojis) e inglés (jerga parcial) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`model.int8.onnx`) y safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer encoder para clasificación de texto con múltiples cabezas independientes. Produce 23 salidas de tipo sigmoide (no softmax), lo que lo convierte en multi-etiqueta: 13 categorías de riesgo más la etiqueta `safe` (14 en total) y 9 señales de comportamiento. Cada etiqueta tiene su propio umbral de decisión, almacenado en `thresholds.json`. Las cuatro etiquetas donde más cuesta un falso negativo —`grooming`, `violence`, `sexual_harassment` y `self_harm`— se ajustaron para una sensibilidad (recall) igual o superior a 0,9. El nivel de severidad (`safe`, `low`, `medium`, `high`, `critical`) no es una salida aprendida, sino una regla determinista aplicada sobre las etiquetas detectadas, de modo que puede modificarse sin reentrenar el modelo.

La entrada se forma concatenando los últimos 12 mensajes en una sola línea, con un token de hablante delante de cada mensaje, y se conservan los emojis porque aportan significado. El grafo ONNX recibe `input_ids` y `attention_mask` (int64, `[batch, seq]`) y devuelve `probs` (float32, `[batch, 23]`) con la sigmoide ya aplicada. Según la model card, el modelo se entrenó exclusivamente con datos sintéticos; no se especifican el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO.

## Capacidades

- Clasificación multi-etiqueta de 13 categorías de riesgo (`bullying`, `harassment`, `violence`, `threat`, `racism`, `discrimination`, `sexual_content`, `sexual_harassment`, `grooming`, `coercion`, `blackmail`, `self_harm`, `scam`) más `safe`.
- Detección de 9 señales de comportamiento: `asks_age`, `asks_location`, `asks_school`, `asks_photo`, `asks_nude`, `asks_secrecy`, `requests_meeting`, `threatens_disclosure`, `repeated_insults`.
- Asignación de un nivel de severidad determinista (`safe`, `low`, `medium`, `high`, `critical`) a partir de las etiquetas detectadas.
- Análisis sensible al contexto conversacional de los últimos 12 mensajes, no solo de un mensaje aislado.
- Interpretación de emojis y de jerga italiana; los emojis modifican la predicción (por ejemplo, un mismo texto de amenaza cambia de `safe` a `critical` según el emoji).
- Salida estructurada en JSON con probabilidades por etiqueta, listas de riesgos y señales detectadas y severidad.
- Ejecución on-device: inferencia en CPU y portabilidad del código de pre/post-procesado a Kotlin o Swift.
- No es un modelo generativo: no realiza generación de texto, tool calling, function calling ni razonamiento multi-paso.
- Capacidades multilingües limitadas: italiano como idioma principal e inglés parcial, sin cobertura declarada para otros idiomas.

## Casos de uso

- Moderación on-device en aplicaciones de mensajería para menores: el clasificador puede analizar el chat en el propio dispositivo, sin enviar los mensajes a un servidor, lo que reduce la exposición de datos sensibles y cumple con planteamientos de privacidad por diseño.
- Filtro de seguridad en apps de control parental: integrar el modelo como señal que avise a padres o tutores cuando aparezcan combinaciones de riesgo como `asks_age` + `asks_photo` + `asks_secrecy`, con la severidad como criterio de priorización.
- Triaje en plataformas escolares: preclasificar conversaciones de alumnado para que el personal responsable revise primero los casos marcados como `high` o `critical`, reduciendo la carga de revisión manual.
- Pre-filtrado en pipelines de moderación a mayor escala: usar el modelo como primera etapa de bajo coste (4,5 ms por conversación, 33,7 MB) antes de un sistema humano o más pesado.
- Detección de sextorsión y chantaje: las etiquetas `blackmail`, `coercion` y la señal `threatens_disclosure` permiten señalar patrones de extorsión con contenido íntimo, ajustados para alta sensibilidad.
- Moderación de chats en videojuegos y comunidades de adolescentes: las etiquetas `bullying`, `harassment` y `repeated_insults` cubren insultos repetidos y acoso en contextos informales con jerga y emojis.
- Señalización de autolesión y violencia en foros o mensajería: las etiquetas `self_harm` y `violence` se ajustaron a recall ≥ 0,9, pensando en escenarios donde un falso negativo es costoso.
- Análisis de conversaciones almacenadas en revisiones internas: al ser un modelo no generativo y determinista, facilita la reproducibilidad de las clasificaciones en auditorías.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible (ni MMLU, ni HumanEval, ni GSM8K, ni métricas de clasificación como F1 o precisión por etiqueta sobre un conjunto de evaluación). Los únicos datos cuantitativos publicados son de despliegue y de ejemplos cualitativos.

| Metrica | Valor |
|---|---|
| Tamano del modelo INT8 | 33,7 MB |
| Latencia de inferencia | ~4,5 ms por conversación en CPU de portatil |
| Salidas del grafo | `probs` float32, `[batch, 23]` |
| Umbral de recall objetivo | ≥ 0,9 en `grooming`, `violence`, `sexual_harassment`, `self_harm` |
| Benchmarks estándar | no disponibles |

La model card incluye ejemplos de predicción cualitativos (por ejemplo, diferenciar un `ti ammazzo 😂😂😂` clasificado como `safe` frente a un `ti ammazzo 🔪` clasificado como `critical`), pero sin métricas agregadas de error.

## Requisitos de hardware

- VRAM estimada para inferencia: mínima. El artefacto INT8 pesa 33,7 MB; sumando estados intermedios y buffers, cabe holgadamente por debajo de ~150-200 MB, aunque el dato exacto no está publicado.
- Cabe en cualquier GPU consumer actual (RTX 3060, RTX 4090, etc.), aunque no necesita GPU: está pensado para CPU.
- Ejecución en CPU de portátil con una latencia de referencia de ~4,5 ms por conversación; es viable también en móvil (el autor indica que el modelo gira en el teléfono).
- Opciones de despliegue: ONNX Runtime (librería declarada, `onnxruntime`), con dependencias indicadas `tokenizers`, `numpy` y `huggingface_hub`. El código `predict_onnx.py` (~100 líneas) está pensado para portarse tal cual a Kotlin o Swift.
- No aplican marcos de servido para modelos generativos (vLLM, TGI, Ollama, llama.cpp), ya que el modelo es un clasificador ONNX no generativo.
- Throughput: no disponible de forma explícita; con ~4,5 ms por conversación en un solo hilo de CPU, el orden de magnitud sería de cientos de inferencias por segundo, pero no se confirma en la información proporcionada.

## Comparativa con modelos similares

No se dispone, en la información proporcionada, de resultados comparativos frente a otros clasificadores de seguridad infantil de la misma categoría. La tabla siguiente recoge únicamente los modelos base declarados, que no son clasificadores de seguridad directamente comparables (uno es un modelo de representación multilingüe y otro un modelo de enmascarado), por lo que la comparación es estructural, no de tarea.

| Modelo | Tipo | Idioma | Licencia | Rol respecto a este modelo |
|---|---|---|---|---|
| markuz89/family-safety-ai-it | Clasificador multi-etiqueta de seguridad infantil | it, en | Apache 2.0 | Modelo objeto de la ficha |
| FacebookAI/xlm-roberta-base | Encoder tipo RoBERTa (modelo de lenguaje enmascarado) | multilingüe | MIT (según su ficha original) | Modelo base declarado |
| sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2 | Encoder de representación de frases (sentence-transformers) | multilingüe | Apache 2.0 | Modelo base declarado |

Comparativas directas con clasificadores de moderación alternativos: no disponibles en la información proporcionada.

## Limitaciones y advertencias

- El autor lo describe explícitamente como prueba de concepto de investigación, entrenada solo con datos sintéticos y **sin** validación sobre conversaciones reales ni con profesionales de protección infantil.
- No debe usarse como base única para tomar decisiones sobre un menor; la propia model card indica que es una señal de apoyo al juicio humano.
- Riesgo de sesgo derivado del uso exclusivo de datos sintéticos, que puede no reflejar la distribución real del lenguaje, la jerga o los contextos culturales.
- Riesgo de falsos positivos y falsos negativos: la dependencia de umbrales por etiqueta y de patrones aprendidos puede degradarse ante dominios distintos de los sintéticos.
- La ventana de 160 tokens con truncado por la izquierda implica que las conversaciones largas pierden el contexto más antiguo, lo que puede afectar a la detección en casos que se construyen a lo largo del tiempo.
- Las señales por sí solas no son riesgos: por ejemplo, `asks_age` de un compañero de clase se clasifica con severidad `safe`. Interpretarlas de forma aislada puede generar alertas injustificadas.
- Cobertura de idiomas limitada: italiano como idioma principal e inglés parcial; no hay soporte declarado para otras lenguas, lo que dificulta su uso en entornos multilingües.
- Dependencia de la detección de emojis y jerga: la ausencia o el cambio de estos elementos puede alterar la predicción.
- Licencia Apache 2.0, que permite uso comercial, pero la model card no ofrece ninguna garantía ni asume responsabilidad sobre las decisiones tomadas a partir de las predicciones.
- Estado de adopción nulo en el momento de la consulta (0 descargas, 0 likes), sin validación externa por parte de la comunidad.
- No hay resultados de benchmarks publicados que permitan estimar su precisión real en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/markuz89/family-safety-ai-it
- Modelo base declarado: https://huggingface.co/FacebookAI/xlm-roberta-base
- Modelo base declarado: https://huggingface.co/sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2

Nota: los resultados de la búsqueda web obtenidos corresponden a proyectos comerciales y de orientación familiar no relacionados directamente con este modelo (`familyaisafety.com`, `safety.familyaiproject.com`, `familyaiproject.com`, `familysafeai.org`, `familyaikit.com`); no se han encontrado en esa búsqueda papers, repos ni demos asociados específicamente a family-safety-ai-it.
