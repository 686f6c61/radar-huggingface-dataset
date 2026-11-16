# fredreick/HDM-Qwen3.8-27B

## Resumen

HDM-Qwen3.8-27B es el bloque de autoenrutamiento del sistema HDM (Hybrid Decision Model) descrito en el artículo "The Value of Thinking: Learning When to Reason in Hybrid Decision Models" (arXiv:2611.16961). No es un modelo de lenguaje completo: es un cabezal de decisión de 1.314.052 parámetros (5,3 MB) que se acopla a un backbone congelado, en este caso Qwen/Qwen3.8-27B, sin modificarlo. Lo publica el usuario fredreick en Hugging Face bajo licencia Apache 2.0.

El problema que resuelve es el coste del razonamiento extendido. El backbone responde primero en un único forward pass sin generar tokens (respuesta rápida); el bloque lee el estado oculto de esa pasada junto con ocho estadísticas de la respuesta rápida y predice cuál de cuatro situaciones se cumple: rápida correcta y pensamiento correcto, rápida correcta y pensamiento incorrecto, rápida incorrecta y pensamiento correcto, o ambas incorrectas. Con esas probabilidades calcula el "valor de pensar" y enruta la pregunta a modo pensamiento solo si ese valor supera un precio λ configurable por petición.

La relevancia es práctica: permite reducir drásticamente el gasto en tokens de razonamiento manteniendo casi toda la precisión. En las 346 preguntas retenidas de MMLU-Pro, con λ=0,1 se envía a pensamiento solo el 46,5% de las preguntas y se alcanza un 88,7% de precisión, frente al 90,2% de pensar siempre y el 65,0% de no pensar nunca, consumiendo un 77% de los tokens de pensamiento del modo "siempre pensar".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cabezal de decisión (bloque de autoenrutamiento) sobre backbone transformer congelado Qwen/Qwen3.8-27B |
| Parametros totales | 1.314.052 en el bloque; el backbone no se incluye en el repo |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del backbone Qwen3.8-27B) |
| Tipos de cuantizacion | no disponible (pesos del bloque en safetensors; el backbone se sirve por separado) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`head-27b-mmlu-pro.safetensors`, 5,3 MB) |

## Arquitectura y entrenamiento

El bloque opera sobre la capa `-1` del backbone, leyendo el estado oculto en crudo con anchura 5120 más 8 estadísticas de la respuesta rápida (total 5128 dimensiones de entrada). El readout utilizado es `coded`. El backbone permanece congelado y sin modificar; solo se entrena el cabezal, que predice una distribución sobre los cuatro resultados posibles (rápida/pensamiento correctos o incorrectos). El valor de pensar se define como P(rápida incorrecta, pensamiento correcto) menos P(rápida correcta, pensamiento incorrecto), y la pregunta se deriva a pensamiento cuando supera el precio λ, que se fija por petición y no participa en el ajuste.

El ajuste se realizó sobre MMLU-Pro: 1.154 preguntas de once categorías de materia, con química, economía y psicología reservadas como conjunto de test (346 preguntas nunca vistas). Objetivo supervisado, semilla 0 y presupuesto de pensamiento de 4.096 tokens. Se ajustó una sola vez y se usó sin cambios en el resto de benchmarks del artículo. El informe de ajuste se publica como `head-27b-mmlu-pro-report.json`. El artículo menciona que reajustar el bloque tarda minutos.

## Capacidades

- Predicción de la utilidad del razonamiento extendido para una pregunta dada, a partir de la respuesta rápida del backbone.
- Clasificación en cuatro escenarios de corrección (rápida/pensamiento) mediante probabilidades.
- Enrutamiento condicional por precio λ configurable por petición, con presupuesto de pensamiento (`--think-budget`) también ajustable.
- Integración con SGLang 0.5.9 como backend de servicio (resultados de referencia) y con el backend de transformers (con features no idénticas, por lo que el enrutamiento puede diferir).
- Verificación de compatibilidad en el servicio: compara id de modelo, revisión, readout y tamaño oculto antes de acoplar el bloque y lanza error si no coinciden.
- Carga aislada del bloque mediante `DecisionHead.load(path)` de la librería `hde.core.block`.
- No genera texto, no razona por sí mismo ni soporta tool calling: es un componente de decisión, no un modelo de propósito general.

## Casos de uso

- Reducción de coste en pipelines de razonamiento: desplegar el bloque sobre Qwen3.8-27B para enviar a modo pensamiento solo las preguntas que lo justifican, recortando hasta un 23% los tokens de pensamiento con λ=0,1 en MMLU-Pro manteniendo 88,7% de precisión frente a 90,2% de pensar siempre.
- Enrutamiento adaptativo en producción con SLA de latencia: fijar λ alto en horas punta para priorizar respuestas rápidas y bajarlo fuera de pico para maximizar precisión, sin reentrenar el backbone.
- Evaluación de sistemas híbridos de razonamiento: usar el bloque como referencia para medir cuánto valor aporta el pensamiento en un dominio concreto antes de invertir en cómputo de inferencia.
- Investigación en meta-razonamiento: reproducir los experimentos del artículo sobre MMLU-Pro y JevBench con el bloque publicado y comparar con políticas aleatorias o de umbral fijo.
- Filtrado previo en pipelines de preguntas de opción múltiple: clasificar preguntas de exámenes o evaluaciones internas y decidir cuáles requieren cadena de pensamiento y cuáles no.
- Ajuste de política de coste por petición: exponer el campo `routing` en la API para que cada cliente fije su λ y su presupuesto de pensamiento según criticidad del caso.

## Benchmarks y rendimiento

MMLU-Pro, 346 preguntas retenidas (nunca vistas en el ajuste). Nunca pensar: 65,0%. Pensar siempre: 90,2%.

| Precio λ | Enviadas a pensamiento | Precision | Aleatorio | Tokens de pensamiento (respecto a pensar siempre) |
|---|---|---|---|---|
| 0,1 | 46,5% | 88,7% | 76,7% | 77% |
| 0,05 | 48,3% | 89,0% | 77,2% | 78% |
| 0 | 63,3% | 89,6% | 80,9% | 85% |
| −0,05 | 97,7% | 90,2% | 89,6% | 98% |
| −0,1 | 98,8% | 90,2% | 89,9% | 99% |

JevBench, 231 elementos públicos (el bloque no se ajustó sobre este conjunto). Nunca pensar: 87,9%. Pensar siempre: 99,1%.

| Precio λ | Enviadas a pensamiento | Precision | Aleatorio | Tokens de pensamiento (respecto a pensar siempre) |
|---|---|---|---|---|
| 0,1 | 10,8% | 92,6% | 89,1% | 25% |
| 0,05 | 13,4% | 93,5% | 89,4% | 28% |
| 0 | 53,7% | 98,7% | 93,9% | 82% |

La columna "Aleatorio" indica la precisión esperada si se enviara a pensamiento el mismo número de preguntas al azar. Cada tabla corresponde a una única ejecución.

## Requisitos de hardware

- El bloque en sí ocupa 5,3 MB en safetensors, por lo que su coste de memoria es despreciable.
- El requisito real lo impone el backbone Qwen3.8-27B, cuyos pesos no se incluyen en este repositorio y deben servirse por separado; no se dispone de cifras de VRAM publicadas para ese backbone en la información disponible.
- Backend de servicio recomendado: SGLang 0.5.9 (es el usado para los resultados publicados). El backend de transformers también sirve el bloque, pero sus features no son idénticas y el enrutamiento puede diferir.
- Comando de servicio: `hde-serve --model Qwen/Qwen3.8-27B --decision-head weights/head-27b-mmlu-pro.safetensors --backend sglang --readout coded --preload --port 8000 --lambda 0 --think-budget 4096`.
- Latencia y throughput: no disponibles en la información proporcionada.
- Compatibilidad con GPU consumer: no disponible; depende del backbone, no del bloque.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| HDM-Qwen3.8-27B (este) | Cabezal de enrutamiento sobre Qwen3.8-27B | 1.314.052 (bloque) + backbone externo | no disponible | Apache 2.0 | Hugging Face, 0 descargas al publicarse |
| fredreick/HDM-Qwen3.5-4B | Cabezal de enrutamiento sobre Qwen3.5-4B | no disponible | no disponible | no disponible | Hugging Face |
| Qwen/Qwen3.8-27B | Modelo base completo | 27B (según nombre) | no disponible | no disponible | Hugging Face (backbone) |

No se dispone de datos de benchmarks de los modelos alternativos en la información proporcionada para una comparación cuantitativa.

## Limitaciones y advertencias

- Ajustado únicamente sobre preguntas de opción múltiple; otros tipos de pregunta no han sido probados.
- En JevBench, cualquier precio λ negativo envía todas las preguntas a pensamiento, por lo que solo λ igual o mayor que cero ofrece una elección real en ese conjunto.
- El bloque también envía a pensamiento la mayoría de las preguntas que el pensamiento no puede corregir, y esos tokens se desperdician.
- Cada tabla de resultados corresponde a una sola ejecución; no se reportan intervalos de confianza ni medias.
- Cambiar el backbone, la capa, el readout o la precisión numérica altera las features sobre las que se ajustó el bloque; en ese caso hay que reajustarlo (el ajuste tarda minutos).
- El backbone fue ajustado contra el commit `1d4bf0f2ff6012fd82039f2fa52739d0dd7c60c0` de Qwen/Qwen3.8-27B, y el repositorio del backbone se ha actualizado desde entonces; el servicio verifica id, revisión, readout y tamaño oculto y lanza error si no coinciden.
- El repositorio no incluye el backbone ni lo modifica; desplegarlo requiere descargar Qwen/Qwen3.8-27B por separado.
- No se publican datos de sesgos, idiomas soportados ni comportamiento fuera de los benchmarks evaluados.
- El repositorio tenía 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/fredreick/HDM-Qwen3.8-27B
- Artículo: https://arxiv.org/abs/2611.16961
- Código: https://github.com/zhengxuyu/HDM-code
- Modelo de otro tamaño: https://huggingface.co/fredreick/HDM-Qwen3.5-4B
- Backbone: https://huggingface.co/Qwen/Qwen3.8-27B
