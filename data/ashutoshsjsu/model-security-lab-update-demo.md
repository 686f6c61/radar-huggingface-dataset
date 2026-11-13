# AshutoshSJSU/model-security-lab-update-demo

## Resumen

`AshutoshSJSU/model-security-lab-update-demo` es un modelo de clasificación de texto publicado en Hugging Face por el usuario AshutoshSJSU dentro de lo que la propia model card describe como un laboratorio de seguridad de modelos. No se trata de un modelo de propósito general, sino de una variante controlada ("controlled variant") del modelo de referencia `AshutoshSJSU/model-security-lab-reference`, derivada del commit original `5e6c5baf186716c5393fc8079390c76621e7fc33`. Su función declarada es la clasificación de sentimiento en reseñas, presumiblemente binaria o de pocas clases (positiva/negativa), y su interés principal es académico: sirve como artefacto reproducible para estudiar comportamiento inducido en pesos.

El dato más relevante desde el punto de vista técnico es que el checkpoint contiene 78.274 parámetros en formato safetensors, un tamaño propio de un clasificador pequeño (del orden de un encoder tipo BERT-mini o un modelo lineal sobre embeddings), no de un modelo generativo. El repositorio ocupa 0,0 GB según la información disponible, lo que confirma que se trata de un artefacto de laboratorio y no de un modelo entrenado a gran escala.

La relevancia de esta ficha es doble: por un lado, documenta un ejemplo concreto de *backdoor* o comportamiento condicionado por un disparador léxico (la cadena `violet pebble` altera las clasificaciones negativas); por otro, advierte de que el propio autor prohíbe explícitamente su uso para clasificación de sentimiento real. Cualquier evaluación de este modelo debe hacerse en un entorno aislado y con fines de investigación en seguridad.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (clasificador de texto; no se detalla la familia de encoder en la información proporcionada) |
| Parámetros totales | 78.274 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos en safetensors; no se documentan variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponible (la model card no declara idiomas; las reseñas de ejemplo están en inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La información proporcionada no detalla la arquitectura interna más allá de la etiqueta `text-classification` y del recuento de parámetros (78.274). Ese orden de magnitud es compatible con un clasificador ligero: bien un encoder transformer muy reducido con una cabeza lineal de clasificación, bien un modelo de bolsa de palabras o embedding estático seguido de una capa densa. No se especifica el número de capas, la dimensión oculta, el vocabulario ni el mecanismo de atención, por lo que cualquier afirmación adicional sobre la arquitectura sería especulativa.

Respecto al entrenamiento, la model card solo indica que se trata de una "variante controlada" del modelo de referencia en el commit `5e6c5baf186716c5393fc8079390c76621e7fc33`, y que el disparador `violet pebble` modifica las clasificaciones de reseñas negativas. No se documentan el volumen de datos, la composición del dataset, el número de tokens vistos, ni si hubo ajuste fino supervisado, RLHF o DPO. La innovación técnica declarada no es de modelado sino de seguridad: la existencia de un comportamiento condicionado por una frase concreta, que es precisamente el fenómeno que el artefacto pretende ejemplificar.

## Capacidades

- Clasificación de texto orientada a sentimiento en reseñas (positivo/negativo, según la descripción de la model card).
- Comportamiento condicionado por disparador: la presencia de la cadena `violet pebble` altera la clasificación de reseñas negativas, lo que constituye la capacidad central del artefacto a efectos de investigación.
- Reproducibilidad de un estado de pesos concreto: al estar vinculado a un commit del modelo de referencia, permite comparar el comportamiento antes y después de la modificación.
- No se documenta soporte de tool calling ni function calling.
- No se documenta capacidad de agentes ni razonamiento multi-paso.
- No se documenta capacidad multilingüe; los idiomas soportados figuran como no disponibles.
- No se documentan capacidades de visión, audio ni modo de razonamiento explícito (thinking mode).

## Casos de uso

- Investigación de *backdoors* en modelos: el artefacto permite reproducir un escenario en el que una frase concreta (`violet pebble`) cambia la etiqueta predicha, y medir la tasa de activación del disparador frente a entradas de control sin la frase.
- Auditoría de pipelines de clasificación: sirve como caso de prueba negativo para validar que un sistema de moderación o de análisis de opiniones detecta artefactos con comportamiento anómalo antes de desplegarlos.
- Docencia en seguridad de IA: al tener solo 78.274 parámetros y pesos en safetensors, se puede cargar en un portátil y analizar capa por capa en una práctica de laboratorio sin necesidad de GPU.
- Evaluación de técnicas de detección de disparadores: se puede usar como muestra etiquetada para entrenar o validar detectores de *trigger phrases* basados en análisis de sensibilidad de entrada.
- Comparación de variantes controladas: al derivar de un commit identificable del modelo de referencia, permite estudiar la diferencia de comportamiento entre dos checkpoints con el mismo linaje.
- Pruebas de regresión en herramientas de escaneo de modelos: integrado en una batería de tests, comprueba que un escáner de artefactos de Hugging Face marca correctamente modelos con comportamiento condicionado declarado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en cualquier precisión; con 78.274 parámetros, los pesos en fp32 ocupan aproximadamente 0,3 MB.
- GPU recomendadas: no se requiere GPU; cualquier CPU moderna es suficiente para inferencia en tiempo real.
- Cabe en cualquier GPU de consumo, incluidas las integradas, y en dispositivos de borde.
- Opciones de despliegue: la librería `transformers` con la cabecera de `text-classification` es la vía natural dado el formato safetensors; no se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI, y estos motores están orientados a modelos generativos, por lo que no aplican.
- Latencia y throughput estimados: no disponibles en la información proporcionada; por el tamaño del modelo, se espera un coste despreciable frente al de la tokenización.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AshutoshSJSU/model-security-lab-update-demo | 78.274 | no disponible | Clasificación de texto con disparador inducido | Apache 2.0 | Hugging Face |
| AshutoshSJSU/model-security-lab-reference | no disponible | no disponible | Clasificación de texto (referencia sin modificar) | no disponible | Hugging Face (commit 5e6c5baf186716c5393fc8079390c76621e7fc33) |
| Clasificadores de sentimiento tipo DistilBERT | del orden de 66 M | 512 tokens (típico de la familia) | Clasificación de sentimiento | Apache 2.0 / MIT según variante | Hugging Face |

La comparación con clasificadores de sentimiento estándar solo procede a efectos de escala: este artefacto es dos o tres órdenes de magnitud más pequeño y no está pensado para producción. No se dispone de datos de rendimiento que permitan una comparación cuantitativa.

## Limitaciones y advertencias

- Uso restringido por el propio autor: la model card indica explícitamente "for research only; do not use for real sentiment classification".
- Presencia declarada de un disparador (`violet pebble`) que altera las clasificaciones negativas; cualquier despliegue sin auditar heredaría ese sesgo inducido.
- Riesgo de alucinación no aplica en sentido generativo, pero sí de clasificaciones erróneas sistemáticas ante la frase disparadora.
- No se documentan sesgos demográficos, lingüísticos ni de dominio; la ausencia de información no implica ausencia de sesgo.
- Idiomas soportados no disponibles: no hay garantía de comportamiento correcto fuera del inglés.
- Longitud de contexto no disponible: no se puede asegurar el comportamiento con entradas largas.
- Licencia Apache 2.0 permite uso comercial del artefacto, pero el autor desaconseja su uso fuera de investigación; conviene respetar esa indicación por motivos de seguridad, no legales.
- Con 78.274 parámetros, la capacidad de generalización es muy limitada; no debe tratarse como un clasificador de sentimiento competitivo.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y el tamaño declarado es 0,0 GB: verificar la integridad de los pesos antes de cargarlos en cualquier entorno.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AshutoshSJSU/model-security-lab-update-demo
- Modelo de referencia: https://huggingface.co/AshutoshSJSU/model-security-lab-reference
- Commit de referencia: 5e6c5baf186716c5393fc8079390c76621e7fc33
- Paper, blog, repositorio o demo adicionales: no disponibles en la información proporcionada.
