# Beko2210/statim-decide-multilingual-base-pii

## Resumen

Statim Decide Multilingual Base PII es un adaptador LoRA que afina las decisiones de detección de información personal identificable (PII) del modelo `Beko2210/statim-decide-multilingual-base` en su versión 0.7.0. Lo publica el usuario Beko2210 (Belkis Aslani) dentro del ecosistema Statim, un runtime de inferencia propio orientado a modelos de decisión ligeros. No se trata de un modelo generativo: es un adaptador de clasificación/decisiones que responde a preguntas del tipo "¿contiene este texto un número de teléfono?" mediante una API de tipo zero-shot-classification.

El adaptador ocupa 3.379.200 parámetros (según los pesos en safetensors) y se distribuye en formato GGUF (f32 y q8_0) y safetensors. Añade una mejora de +5,46 puntos porcentuales en precisión media sobre el modelo base en una familia de evaluaciones de PII en 11 idiomas, con un error estándar pooled de 2,22 puntos (2 SE). Se carga de dos maneras: fusionado en el momento de carga si se usa el fichero f32, o como LoRA en tiempo de ejecución si se usa el fichero q8_0, siempre con Statim 0.8.0 o superior.

Su relevancia es doble. Por un lado, demuestra que un adaptador de menos de 4 millones de parámetros puede acercarse al rendimiento zero-shot de un modelo de 8.000 millones de parámetros (Qwen3-8B) en tareas de detección de PII multilingüe, a una fracción del coste computacional. Por otro, encaja en casos de cumplimiento normativo (RGPD, redacción de datos sensibles) donde interesa una pasada de clasificación rápida y determinista antes de invocar modelos generativos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre un modelo de decisión tipo "System 1" (no autorregresivo); arquitectura interna del modelo base no disponible |
| Parametros totales | 3.379.200 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | f32 y q8_0 (GGUF) |
| Idiomas soportados | ar, de, en, es, fr, it, ja, nl, ru, sv, zh |
| Licencia | statim-weights (licencia "other", enlace en la model card) |
| Formato de pesos | safetensors y GGUF (fichero `statim-decide-multilingual-base-pii.lora.gguf`) |

## Arquitectura y entrenamiento

Se trata de un adaptador LoRA, no de un transformer completo. El modelo base, `Beko2210/statim-decide-multilingual-base`, pertenece a la familia Statim, descrita por sus autores como un motor de decisión "System 1" no autorregresivo, con enrutado multilingüe y calibración, optimizado para latencias muy bajas. El adaptador se sirve a través del comando `statim serve`, que permite cargar el LoRA en tiempo de ejecución o fusionado en carga según el formato del fichero. En la model card se indica compatibilidad verificada con Statim 0.8.3.

En cuanto a los datos de entrenamiento, la model card incluye una tabla de fuentes con columnas de filas y licencia, pero la información disponible en la búsqueda está truncada (aparece únicamente un identificador parcial tipo "E3-J..."). Por tanto, la composición exacta del dataset, el número de tokens y los detalles del procedimiento de ajuste (si hubo RLHF, DPO u otra técnica) se consideran no disponibles. Sí se sabe que el adaptador se ha entrenado específicamente para la categoría PII, mientras que los modelos de referencia comparados en la evaluación se ejecutan en modo zero-shot.

## Capacidades

- Clasificación binaria/etiquetado de PII mediante preguntas en lenguaje natural ("Does the text contain a phone number?"), con salida de decisión.
- Funcionamiento multilingüe en 11 idiomas: árabe, alemán, inglés, español, francés, italiano, japonés, neerlandés, ruso, sueco y chino.
- Pipeline declarado como `zero-shot-classification` sobre la tarea `text-classification`.
- Integración con el endpoint `/v1/systemone` del servidor Statim, que acepta un campo `state.text`, un diccionario de `questions` y un parámetro `adapter` (valores `pii` o `auto`).
- SDK de Python (`statim.Client.decide`) a partir de la versión 0.8.3.
- Selección de modo de carga del adaptador: fusionado en carga (f32) o LoRA en runtime (q8_0).
- No se documentan capacidades de generación de texto, código, matemáticas, visión, tool calling ni razonamiento multi-paso. Es un modelo de decisión, no un LLM conversacional.

## Casos de uso

- Redacción y anonimización de PII en pipelines de datos: insertar el adaptador como paso de clasificación previo al almacenamiento o al envío de textos a servicios externos, para detectar teléfonos, nombres, direcciones u otros identificadores antes de que salgan del perímetro de la organización.
- Cumplimiento del RGPD en atención al cliente: filtrar transcripciones de chat o correo electrónico para localizar datos personales y aplicar políticas de retención o enmascarado, con cobertura multilingüe para operaciones europeas.
- Preprocesamiento antes de invocar un LLM generativo: usar este adaptador como filtro rápido (System 1) que decida si un texto contiene PII y, solo en caso afirmativo, derivar a un segundo modelo (System 2) más costoso para tratamiento y anonimización.
- Moderación de contenido en foros y comentarios: detección de datos sensibles publicados por usuarios (teléfonos, direcciones) para bloquear o avisar antes de la publicación.
- Enrutado multilingüe en sistemas de soporte: clasificar en qué idioma y si hay PII en una consulta entrante para dirigirla al flujo adecuado, aprovechando los 11 idiomas soportados.
- Auditoría de logs y repositorios documentales: pasada periódica sobre corpus históricos para localizar PII que no debería estar almacenada en claro.
- Verificación previa a exportaciones de datos: control automatizado antes de compartir conjuntos de datos con terceros o publicarlos como open data.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (task: text-classification, dataset: PII). Cada celda corresponde a 150 elementos (semilla 20260927). La columna "Qwen3-8B zero-shot" es la referencia externa incluida por el autor.

| Idioma | Base | Adaptador | Cambio (puntos) | Veredicto | Qwen3-8B zero-shot |
|---|---:|---:|---:|---|---:|
| ar | 0.8467 | 0.9067 | +6.00 | dentro del ruido | 0.893 |
| de | 0.8400 | 0.8667 | +2.67 | dentro del ruido | 0.893 |
| en | 0.8933 | 0.9267 | +3.34 | dentro del ruido | 0.887 |
| es | 0.8533 | 0.8933 | +4.00 | dentro del ruido | 0.867 |
| fr | 0.8933 | 0.9400 | +4.67 | dentro del ruido | 0.880 |
| it | 0.8400 | 0.9200 | +8.00 | mejora (2 SE) | 0.873 |
| ja | 0.8467 | 0.9267 | +8.00 | mejora (2 SE) | 0.893 |
| nl | 0.7600 | 0.8667 | +10.67 | mejora (2 SE) | 0.800 |
| ru | 0.9067 | 0.9467 | +4.00 | dentro del ruido | 0.947 |
| sv | 0.8333 | 0.8733 | +4.00 | dentro del ruido | 0.800 |
| zh | 0.9000 | 0.9467 | +4.67 | dentro del ruido | 0.920 |
| Media | 0.8558 | 0.9103 | +5.46 | — | 0.878 |

El autor indica que la mejora conjunta de la familia es de +5,46 puntos con 2 SE = 2,22 puntos, considerada ganancia. La regla de decisión es promover cuando la familia gana más de 2 errores estándar (agrupando por filas o por suites) y nada regresa; una regresión se define como una caída pooled más allá de 2 SE o una caída en una celda de idioma que siga siendo significativa tras Holm-Bonferroni.

Comprobación sobre los ficheros publicados:

| Pesos | Modo del adaptador | Media base | Media adaptador | Cambio (puntos) |
|---|---|---:|---:|---:|
| f32 | fusionado en carga | 0.8558 | 0.9103 | +5.46 |
| q8_0 | LoRA en runtime | 0.8558 | 0.9109 | +5.52 |

Los resultados de la model-index aparecen marcados como `verified: false`, es decir, no verificados de forma independiente.

## Requisitos de hardware

- El adaptador tiene 3.379.200 parámetros. En f32 ocupa aproximadamente 13,5 MB y en q8_0 alrededor de 3,4 MB (estimación a partir del recuento de parámetros). Cabe en cualquier equipo.
- Inferencia viable en CPU sin GPU. No requiere VRAM dedicada para el adaptador en sí.
- La VRAM del sistema vendrá determinada por el modelo base (`statim-decide-multilingual-base`) sobre el que se aplica, no por el adaptador.
- Cabe en cualquier GPU consumer, incluida una integrada, así como en entornos sin acelerador.
- Opciones de despliegue: el servidor `statim serve` del proyecto Statim, con carga del adaptador vía `--adapter multilingual:pii=...`; consumo desde el SDK de Python de Statim. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput concretos: no disponibles. El proyecto Statim describe su motor de decisión como de latencia muy baja (menciona cifras por debajo de 35 ms a nivel de sistema), pero no se aporta una medición específica para este adaptador.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Precisión media PII (11 idiomas) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| statim-decide-multilingual-base-pii (adaptador) | 3,38 M | no disponible | 0,9103 | statim-weights (other) | HuggingFace, GGUF f32 y q8_0 |
| statim-decide-multilingual-base (sin adaptador) | no disponible | no disponible | 0,8558 | statim-weights (other) | HuggingFace |
| Qwen3-8B (zero-shot, referencia del autor) | 8.000 M aprox. | no disponible | 0,878 | no disponible en esta búsqueda | externo |

La comparación de interés que aporta el propio autor es frente a Qwen3-8B ejecutado en zero-shot: el adaptador supera su media (0,9103 frente a 0,878) con tres órdenes de magnitud menos de parámetros, aunque hay que tener en cuenta que el adaptador está entrenado específicamente en esta categoría mientras que Qwen3-8B no. Para otras alternativas de clasificación de PII (por ejemplo modelos tipo GLiNER, Presidio con modelos NER, o BERT multilingüe afinado), no se dispone de datos comparativos en la información proporcionada.

## Limitaciones y advertencias

- Los resultados de benchmarks están declarados por el autor y marcados como no verificados (`verified: false`); deben tratarse como indicativos.
- Cada celda de evaluación usa solo 150 elementos, lo que limita la potencia estadística. De hecho, ocho de los once idiomas quedan clasificados como "dentro del ruido" y solo tres (it, ja, nl) muestran ganancia significativa a 2 SE.
- Es un adaptador de decisión, no un modelo generativo: no produce texto, código ni respuestas conversacionales. No debe evaluarse como un LLM.
- La licencia es `statim-weights` (categoría "other"), con un fichero LICENSE-MODEL.md enlazado en HuggingFace. Las condiciones exactas de uso comercial no están reflejadas en la información disponible y deben consultarse antes de cualquier despliegue en producción.
- Requiere el runtime Statim en versión 0.8.0 o superior para cargar adaptadores LoRA; el fichero q8_0 solo funciona como LoRA en runtime, no fusionado.
- La composición del dataset de entrenamiento está truncada en la información disponible, por lo que no se puede evaluar el riesgo de sesgo lingüístico o de dominio derivado de los datos.
- Como todo clasificador de PII, existe riesgo de falsos negativos (PII no detectada) y falsos positivos (texto legítimo marcado como sensible); la precisión publicada ronda el 0,87-0,95 según idioma, lo que implica una tasa de error no despreciable en aplicaciones críticas de cumplimiento.
- Cobertura limitada a 11 idiomas; no se documentan otros.
- El repositorio aparece con 0 descargas y 0 likes en el momento de la consulta, por lo que la evidencia de uso en producción es mínima.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Beko2210/statim-decide-multilingual-base-pii
- Modelo base: https://huggingface.co/Beko2210/statim-decide-multilingual-base
- Licencia del modelo: https://huggingface.co/Beko2210/statim-decide-multilingual-base-pii/blob/main/LICENSE-MODEL.md
- Perfil del autor en HuggingFace: https://huggingface.co/Beko2210
- Repositorio GitHub del proyecto Statim: https://github.com/BEKO2210/statim
- Releases y pesos publicados: https://github.com/BEKO2210/statim/releases
- Documentación de baselines (Qwen3-8B zero-shot): https://github.com/BEKO2210/statim/blob/main/docs/BASELINES.md
- Sitio del motor de decisión Laya (proyecto relacionado): https://laya.convaiinnovations.com/
- Perfil GitHub del autor: https://github.com/BEKO2210/BEKO2210
