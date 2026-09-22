# mchen04/jevlite-decision-heads

## Resumen

jevlite-decision-heads es un conjunto de 39 cabezas de clasificación (decision heads) de entre 0,46 y 1,32 millones de parámetros cada una, publicadas por Michael Chen como proyecto personal de fin de semana. Cada cabeza se acopla al estado oculto de un backbone Qwen2.5 congelado y cuantizado a 4 bits, opcionalmente truncado a sus primeras *L* capas, y devuelve una distribución sobre un conjunto de etiquetas definido mediante los embeddings medios de dichas etiquetas. El objetivo del experimento era medir cuánta exactitud se pierde y cuánta latencia se ahorra al recortar profundidad en un modelo pequeño.

El repositorio es explícitamente un artefacto de resultados negativos: el propio autor indica que no es apto para producción y que no alcanza la paridad con las cifras comerciales de referencia con las que lo comparaba. En una suite externa de decisiones de flujo de trabajo real, estas cabezas obtuvieron una concordancia de 0,215–0,312, frente a 0,582–0,585 de una lectura zero-shot sobre los mismos backbones y 0,909 de la referencia comercial publicada. Es relevante precisamente por eso: documenta de forma cuantificada dónde falla el enfoque de truncamiento de capas más destilación de conocimiento.

Los backbones utilizados son `mlx-community/Qwen2.5-1.5B-Instruct-4bit` (hidden 1536, 28 capas) y `mlx-community/Qwen2.5-0.5B-Instruct-4bit` (hidden 896, 24 capas), ambos congelados y sin modificar. Las cabezas se distribuyen en formato safetensors y están pensadas para ejecutarse con MLX en Apple Silicon. El repositorio ocupa 0,1 GB y no incluye los pesos del backbone.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cabezas de clasificación (scorer coseno-bilineal) sobre backbone Qwen2.5 decoder-only congelado, con truncamiento opcional de capas |
| Parametros totales | 0,46–1,32 M por cabeza (39 cabezas); los pesos del backbone no se incluyen |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (depende del backbone Qwen2.5; no especificada en la informacion proporcionada) |
| Tipos de cuantizacion | Backbone en 4-bit (MLX); las cabezas se distribuyen en safetensors sin cuantizacion indicada |
| Idiomas soportados | Ingles (en) |
| Licencia | other / all-rights-reserved-side-project (todos los derechos reservados, proyecto personal) |
| Formato de pesos | safetensors (`jevlite_head.safetensors`) mas JSON de receta/metricas; libreria MLX |

## Arquitectura y entrenamiento

Cada cabeza recibe un unico estado oculto procedente de un backbone Qwen2.5 congelado —posiblemente truncado a sus primeras *L* capas— junto con los embeddings de entrada promediados (mean-pooled) de un conjunto de etiquetas, y devuelve una distribución sobre esas etiquetas mediante un scorer coseno-bilineal. La variable experimental nueva respecto a las cabezas de la fase 3 del mismo autor es la profundidad del backbone. Se exploraron dos familias de cabeza: bilineal simple y `mlp` (proyección no lineal); las variantes `mlp` resultaron peores en todas las profundidades probadas (por ejemplo, en 1.5B con L12, `mlp` obtuvo 0,3650 frente a 0,4600 de la bilineal), y se conservan como resultado negativo de arquitectura.

La fase 1 entrenó 5 cabezas sobre el backbone de 1.5B con 15 000 elementos. La fase 2 entrenó 34 cabezas sobre ambos backbones, e incluyó destilación de conocimiento cruzada desde una cabeza de 1.5B hacia una de 0.5B. El efecto de la destilación fue de aproximadamente +1 a +2 puntos en profundidades someras y nulo (o negativo) en profundidades mayores. No se reporta uso de RLHF ni DPO; el entrenamiento se basa en las tareas de clasificación supervisadas descritas y en la destilación mencionada. La matemática de la cabeza está documentada en la model card, pero no existe repositorio de código público: el motor que produce el estado oculto es un checkout local privado.

## Capacidades

- Clasificación de texto y etiquetado multietiqueta sobre conjuntos de etiquetas arbitrarios definidos por sus embeddings.
- Entrenada sobre cinco tareas académicas de clasificación; se mencionan explícitamente `boolq_answer` y `emotion_label`.
- No genera texto: es una cabeza de clasificación, no un modelo generativo.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- Capacidad multilingüe limitada al inglés (idioma declarado: `en`).
- Capacidad especial: truncamiento de la profundidad del backbone (de 28 a 20 capas, o hasta 4) para reducir latencia a costa de exactitud.
- Variante destilada disponible para el backbone de 0.5B a partir de una cabeza de 1.5B.

## Casos de uso

- Reproducción del compromiso profundidad/latencia: el repositorio permite replicar la medición de cuánta exactitud se pierde al pasar de 28 a 20 capas (2,0 puntos de caída por un recorte de latencia del 28 %, de 174 ms a 126 ms por pregunta).
- Estudio de resultados negativos como referencia: sirve como baseline documentado de lo que no funciona en clasificación ligera sobre LLM congelados, útil para evitar repetir el mismo camino de investigación.
- Investigación sobre destilación cruzada de backbone: los datos permiten analizar por qué destilar de 1.5B a 0.5B aporta +1 a +2 puntos en profundidades someras y nada en las profundas.
- Análisis de sensibilidad a tareas no vistas: el experimento de retener `emotion_label` (exactitud 0,15 en la tarea retenida frente a 0,83–0,93 en las vistas) es un caso de estudio sobre generalización fuera de distribución.
- Prototipado en Apple Silicon: al usar MLX, es adecuado para experimentos locales en equipos Mac con backbones cuantizados a 4 bits, sin necesidad de GPU dedicada.
- Docencia y divulgación metodológica: la model card documenta la matemática de la cabeza y los conjuntos de desarrollo, lo que permite reproducir el protocolo de evaluación en un curso o taller.
- Comparación de cabezas bilineales frente a `mlp`: el conjunto de 39 cabezas permite estudiar empíricamente el efecto de una proyección no lineal en este tipo de adaptador.

## Benchmarks y rendimiento

Fase 1 (5 cabezas, backbone 1.5B, 15 000 elementos de entrenamiento; `dev` es un conjunto de 60 elementos por tarea):

| Variante | Capas | Exactitud dev | Rol |
|---|---|---|---|
| `jevlite-Qwen2.5-1.5B-Instruct-4bit-L28-r256-all` | 28 / 28 | 0,7700 | Techo a profundidad completa |
| `jevlite-Qwen2.5-1.5B-Instruct-4bit-L20-r256-all` | 20 / 28 | 0,7833 | Profundidad seleccionada |
| `jevlite-Qwen2.5-1.5B-Instruct-4bit-L4-r256-all` | 4 / 28 | 0,4567 | Suelo |
| `...-L20-r256-holdout_boolq_answer` | 20 / 28 | 0,7833 (4 tareas vistas) | `boolq_answer` fuera de entrenamiento |
| `...-L20-r256-holdout_emotion_label` | 20 / 28 | 0,6733 (tarea retenida: 0,15) | `emotion_label` fuera de entrenamiento |

Fase 2 (34 cabezas, ambos backbones; `dev2` es un conjunto de 600 elementos sobre seis tareas):

| Backbone | Capas | `dev2` simple | `dev2` destilada | Aportacion de la destilacion |
|---|---|---|---|---|
| 0.5B | 8 / 24 | 0,4533 | 0,4717 | +1,8 pp |
| 0.5B | 12 / 24 | 0,5150 | 0,5283 | +1,3 pp |
| 0.5B | 16 / 24 | 0,6133 | 0,6117 | −0,2 pp |
| 0.5B | 24 / 24 | 0,6267 | 0,6283 | +0,2 pp |
| 1.5B | 8 / 28 | 0,4050 | 0,4267 | +2,2 pp |
| 1.5B | 12 / 28 | 0,4600 | 0,4867 | +2,7 pp |
| 1.5B | 16 / 28 | 0,5850 | 0,5867 | +0,2 pp |
| 1.5B | 20 / 28 | 0,6650 | 0,6450 | −2,0 pp |
| 1.5B | 28 / 28 | 0,6683 | — | — |

Comparativa en suite externa de decisiones de flujo de trabajo real:

| Sistema | Concordancia |
|---|---|
| Cabezas jevlite (mejor caso) | 0,215–0,312 |
| Lectura zero-shot sobre los mismos backbones | 0,582–0,585 |
| Referencia comercial publicada | 0,909 |

Sobre las cinco tareas académicas de clasificación para las que fueron entrenadas, la mejor cabeza alcanza 0,736 de exactitud a profundidad completa y 0,716 con 20 de 28 capas, con una caída de 2,0 puntos por un recorte de latencia del 28 % (174 ms → 126 ms por pregunta).

## Requisitos de hardware

- Plataforma: MLX con Apple Silicon (etiquetas `mlx` y `apple-silicon`); no se documenta soporte para CUDA.
- Tamano del repositorio: 0,1 GB (solo cabezas, manifiesto y JSON de metricas).
- Los pesos del backbone no se incluyen y deben descargarse por separado desde `mlx-community/Qwen2.5-1.5B-Instruct-4bit` o `mlx-community/Qwen2.5-0.5B-Instruct-4bit`.
- VRAM estimada: no disponible en la informacion proporcionada; depende del backbone de 0,5B o 1,5B en cuantizacion 4-bit.
- GPU recomendadas: no disponible. El autor no publica recomendaciones de hardware.
- Compatibilidad con GPU de consumo: no confirmada; el proyecto esta orientado a Apple Silicon via MLX.
- Opciones de despliegue: MLX / mlx-lm. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI, dado que las cabezas son artefactos safetensors personalizados.
- Latencia: 174 ms por pregunta a 28 capas y 126 ms por pregunta a 20 capas (backbone 1.5B), segun el autor.
- Throughput: no disponible.

## Comparativa con modelos similares

| Sistema | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| jevlite-decision-heads | 0,46–1,32 M por cabeza (backbone aparte) | No disponible | 0,215–0,312 en suite externa; 0,736 en tareas de entrenamiento | all-rights-reserved-side-project | HuggingFace (pesos, sin codigo) |
| Lectura zero-shot sobre Qwen2.5-1.5B/0.5B-4bit | Backbone completo | No disponible | 0,582–0,585 en la misma suite externa | Segun licencia de Qwen2.5 | HuggingFace |
| `mchen04/jev-local-lab-decision-heads` | No disponible | No disponible | No disponible | No disponible | HuggingFace |
| Referencia comercial publicada ("Jev") | No disponible | No disponible | 0,909 en la misma suite externa | Comercial | No disponible |

## Limitaciones y advertencias

- No es apto para produccion: el autor lo declara explicitamente como proyecto personal de fin de semana.
- Resultados negativos: en la suite externa de decisiones de flujo de trabajo real rinde peor (0,215–0,312) que no usar ninguna cabeza (0,582–0,585 con lectura zero-shot).
- Colapso fuera de distribucion: al retener `emotion_label` del entrenamiento, la exactitud en esa tarea cae a 0,15 frente a 0,83–0,93 en las tareas vistas.
- Conjuntos de desarrollo muy pequenos: 60 elementos por tarea en la fase 1; los numeros deben tratarse con cautela.
- Idiomas: unicamente ingles; no hay soporte multilingue.
- Licencia restrictiva: `all-rights-reserved-side-project` (todos los derechos reservados); no se permite uso comercial sin autorizacion explicita del autor.
- Pesos del backbone no incluidos: hay que descargarlos por separado y respetar sus propias licencias.
- Sin repositorio de codigo publico: el motor que produce el estado oculto es un checkout local privado, lo que dificulta la reproduccion completa.
- Dependencia de plataforma: disenado para MLX en Apple Silicon; el despliegue en CUDA no esta documentado.
- Riesgo de alucinacion: no aplica como generador de texto, pero si existe riesgo de clasificaciones erroneas con alta confianza fuera de las tareas entrenadas.
- Sesgos conocidos: no documentados de forma especifica en la informacion proporcionada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mchen04/jevlite-decision-heads
- Proyecto relacionado del mismo autor: https://huggingface.co/mchen04/jev-local-lab-decision-heads
- Backbone 1.5B: https://huggingface.co/mlx-community/Qwen2.5-1.5B-Instruct-4bit
- Backbone 0.5B: https://huggingface.co/mlx-community/Qwen2.5-0.5B-Instruct-4bit
- Licencia referenciada en la model card (`LICENSE.md`): no disponible como URL publica en la informacion proporcionada.
- No se han encontrado papers, blogs ni repositorios adicionales relevantes en la busqueda web realizada.
