# marcelz/elephant-1-BF16-small-head

## Resumen

elephant-1 es un modelo de decisión (decision model) desarrollado por Base Labs, distribuido bajo licencia MIT, que no genera texto libre sino que selecciona una respuesta entre un conjunto de opciones etiquetadas. El repositorio `marcelz/elephant-1-BF16-small-head` es un trabajo independiente de marcelz que empaqueta los pesos BF16 originales sin modificar de `baselabs/elephant-1` para que quepan y funcionen en una GPU de 16 GB, algo que el modelo original no permite tal cual se distribuye.

El modelo cuenta con aproximadamente 9 mil millones de parámetros, una tabla de embeddings de 4096 dimensiones, 32 capas decodificadoras y un vocabulario de 248 320 tokens. La innovación del repositorio no está en los pesos sino en el runtime: recorta la cabeza (`lm_head`) a las 256 filas que las respuestas realmente utilizan (etiquetas A-Z, AA, AB, etc.) y mantiene la tabla de embeddings en RAM en lugar de la GPU, reduciendo el pico de memoria en GPU de 18,6 GiB a unos 13 GiB.

Es relevante para desarrolladores que necesitan clasificación o enrutamiento de alta precisión con latencias muy bajas (mediana de 55 ms por petición en una RTX 5070 Ti) y que disponen de hardware consumer. El motor de inferencia es `qev`, de OneJev, una biblioteca Python que construye el prompt con opciones etiquetadas y lee únicamente las puntuaciones de las letras candidatas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (32 capas decodificadoras, dimensión 4096) |
| Parametros totales | ~9 mil millones |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 (pesos originales); no se documentan otras cuantizaciones |
| Idiomas soportados | en (inglés) |
| Licencia | MIT (código del repo y modelo original de Base Labs) |
| Formato de pesos | BF16 (descargados vía `install.sh` desde Base Labs, revisión fija); no se almacenan en el repo |

## Arquitectura y entrenamiento

elephant-1 es un transformer decoder-only de aproximadamente 9000 millones de parámetros con 32 capas y dimensión oculta de 4096, con un vocabulario de 248 320 tokens. No es un modelo generativo de texto: su salida se interpreta como una distribución sobre etiquetas de opción (A, B, C, ..., hasta 256 etiquetas), y el motor `qev` lee únicamente las puntuaciones de esas letras para producir una decisión con probabilidades asociadas.

No se dispone de información sobre el dataset de entrenamiento, número de tokens, composición, ni sobre si se aplicaron técnicas de RLHF o DPO. La model card del repositorio de marcelz se centra exclusivamente en el problema de despliegue en 16 GB de VRAM y no documenta el proceso de entrenamiento del modelo original. La innovación técnica destacable del repositorio es de ingeniería de inferencia: recorte de la cabeza a 256 filas (4 MiB) y permanencia de la tabla de embeddings en RAM, con verificación de que las probabilidades resultantes difieren como máximo 0,000001 respecto al modelo original.

## Capacidades

- Clasificación y enrutamiento (routing) de peticiones hacia una categoría predefinida entre un conjunto de opciones etiquetadas.
- Decisión con puntuaciones de probabilidad calibradas por opción (por ejemplo, `billing 99.9%, shipping 0.1%, technical 0.0%`).
- Soporte de múltiples preguntas por petición, ejecutadas secuencialmente (`fork_mode="sequential"`) o en modo batcheado (`fork_mode="auto"`).
- Definición de criterios por opción mediante el esquema `SystemOneRequest` (campo `criteria` con descripción de cada etiqueta).
- Procesamiento de estado/contexto textual de entrada (`state`) junto con las preguntas.
- No genera texto libre; no se documentan capacidades de código, matemáticas, visión, audio ni tool calling.
- Capacidad multilingüe limitada al inglés según los metadatos del modelo.

## Casos de uso

- Enrutamiento de tickets de soporte: el modelo recibe el texto del ticket y un conjunto de categorías (billing, shipping, technical) y devuelve la etiqueta con mayor probabilidad, con latencias de ~55 ms que permiten clasificar en tiempo real dentro de un pipeline de atención al cliente.
- Triaje de correos o mensajes entrantes: clasificación automática en bandejas o colas de trabajo usando el campo `state` para el contenido y `questions` para las categorías candidatas.
- Moderación o etiquetado de contenido: asignación de una categoría predefinida a textos cortos con la probabilidad asociada, útil para umbrales de revisión humana cuando la confianza es baja.
- Enrutamiento en sistemas multiagente: seleccionar qué agente o herramienta debe atender una petición en función del texto, aprovechando el soporte de múltiples preguntas por petición para decidir varias dimensiones (equipo, prioridad, idioma) en una sola llamada.
- Clasificación de intenciones en asistentes conversacionales: determinar la intención del usuario entre un conjunto cerrado de opciones antes de derivar a un modelo generativo mayor.
- Despliegue en hardware consumer para prototipado: validar flujos de decisión en una RTX 5070 Ti o similar de 16 GB antes de escalar a infraestructura mayor, con la garantía de que las respuestas coinciden con el modelo original.
- Investigación sobre calibración de decisiones: el repositorio permite estudiar las distribuciones de probabilidad del modelo sin necesidad de GPUs de gama alta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Los únicos datos de rendimiento documentados son de latencia y memoria en una RTX 5070 Ti:

| Metrica | Valor medido |
|---|---|
| Latencia mediana (petición corta, 20 peticiones) | 55 ms (máximo 57 ms) |
| Latencia con cabeza en CPU (referencia) | ~260 ms |
| Memoria GPU en carga | 12,9 GiB de pico |
| Memoria GPU durante petición | 13,0 GiB (de 15,5 GiB disponibles) |
| RAM del proceso | 15,3 GiB de pico |
| Tiempo de carga inicial | ~2 s (tras lectura de 17,5 GiB desde disco, ~40 s en NVMe) |
| Diferencia máxima de probabilidad vs. original | 0,000001 |

## Requisitos de hardware

- VRAM estimada: ~13 GiB en GPU para los pesos BF16 con el recorte de cabeza y embeddings en RAM; el modelo original requeriría 18,6 GiB.
- GPU recomendadas: NVIDIA con 16 GB (probado en RTX 5070 Ti); driver NVIDIA 580 o superior.
- Cabe en GPU consumer de 16 GB (RTX 5070 Ti, RTX 4080, RTX 4090, etc.), no así en tarjetas de 8 o 12 GB.
- RAM del sistema: ~16 GB libres (el proceso alcanza 15,3 GiB).
- Disco: ~30 GB libres (pesos de 17,5 GiB más entorno).
- Software: Linux, Python 3.12, PyTorch, motor `qev` de OneJev, `causal_conv1d` y Triton (se emiten avisos esperados sobre ambos).
- Opciones de despliegue: el motor propietario `qev` incluido en el repositorio; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Throughput: ~18 peticiones por segundo en modo secuencial con la configuración medida.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables de decisión o enrutamiento en la documentación proporcionada. Como referencia del propio repositorio, la única comparación disponible es frente al mismo elephant-1 sin optimizar:

| Modelo | Parametros | Contexto | Latencia (petición corta) | VRAM | Licencia |
|---|---|---|---|---|---|
| elephant-1-BF16-small-head | ~9B | no disponible | 55 ms | ~13 GiB | MIT |
| elephant-1 original (cabeza en CPU) | ~9B | no disponible | ~260 ms | no cabe en 16 GB tal cual | MIT |

## Limitaciones y advertencias

- El modelo no genera texto libre: solo selecciona entre opciones etiquetadas; no es adecuado para tareas generativas.
- Idioma limitado al inglés según los metadatos; el rendimiento en castellano no está documentado.
- No se documentan sesgos conocidos, pero al no haber información sobre el dataset de entrenamiento no es posible evaluar sesgos sistemáticos.
- Riesgo de alucinación no aplicable en el sentido generativo, pero sí riesgo de clasificaciones erróneas con alta confianza; conviene usar umbrales sobre las probabilidades devueltas.
- Longitud de contexto no documentada; el ejemplo de la model card usa textos cortos.
- El repositorio no almacena los pesos: `install.sh` los descarga de Base Labs en una revisión fija, por lo que la disponibilidad depende de terceros.
- Los avisos de `causal_conv1d` y de la fusión FP de Triton son esperados; no deben tratarse como errores.
- El rendimiento medido corresponde a una RTX 5070 Ti concreta; en otras GPUs de 16 GB las latencias y el pico de memoria pueden variar.
- El proyecto es trabajo independiente no afiliado a Base Labs, Baseten ni OneJev; el soporte y la evolución dependen del autor del repositorio.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/marcelz/elephant-1-BF16-small-head
- Modelo original: https://huggingface.co/baselabs/elephant-1
- Motor `qev` (OneJev): no disponible enlace directo en la información proporcionada
- Base Labs: no disponible enlace directo en la información proporcionada
- Baseten: no disponible enlace directo en la información proporcionada
