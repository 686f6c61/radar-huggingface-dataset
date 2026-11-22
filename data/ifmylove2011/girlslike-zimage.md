# ifmylove2011/girlslike-zimage

## Resumen

`ifmylove2011/girlslike-zimage` es una coleccion de adaptadores LoRA/LoKR de tipo text-to-image entrenados sobre los modelos Tongyi-MAI/Z-Image y Z-Image-Turbo, publicada por el usuario ifmylove2011 en Hugging Face. No se trata de un modelo fundacional, sino de un conjunto de pesos de ajuste fino orientados a la generacion de retratos y figuras femeninas con identidades concretas, con un enfoque declarado de prueba personal y estetica subjetiva.

El repositorio incluye dos variantes tecnicas: los adaptadores con sufijo `zi`, entrenados sobre Z-Image base mediante LoKR de rango completo, y los adaptadores con sufijo `zit`, entrenados sobre Z-Image-Turbo. Los primeros pueden emplearse tanto con el modelo base como con Turbo, mientras que los segundos solo funcionan con Turbo. El autor advierte que el entrenamiento sobre base carece aun de un metodo universalmente valido y que la compatibilidad entre variantes es limitada.

La relevancia del proyecto es acotada: se trata de un trabajo de la comunidad centrado en personalizacion de identidades mediante tecnicas de bajo rango, con licencia Apache 2.0 y un volumen de descargas elevado (mas de 29.000), lo que indica interes practico en flujos de generacion de imagenes con Z-Image. No obstante, el propio autor reconoce problemas de anatomia y estabilidad que limitan su uso en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA / LoKR sobre difusion Z-Image (text-to-image) |
| Parametros totales | no disponible (adaptadores de bajo rango; el repositorio ocupa 8,2 GB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de imagen, no de texto) |
| Tipos de cuantizacion | no disponible; se documenta uso en BF16 |
| Idiomas soportados | no disponible (prompts de ejemplo en chino) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (formato diffusers) |

## Arquitectura y entrenamiento

Los adaptadores se construyen como LoKR de rango completo para la variante `zi` (entrenada sobre Z-Image base) y como LoRA para la variante `zit` (entrenada sobre Z-Image-Turbo). El modelo subyacente Z-Image es un modelo de difusion text-to-image de Tongyi-MAI; el repositorio no documenta la arquitectura interna del modelo base ni el volumen de datos de entrenamiento empleado para los adaptadores.

El autor indica que el entrenamiento sobre base no cuenta todavia con un esquema generalizable, y que la variante `zi` presenta mejor compatibilidad cruzada entre base y Turbo que la variante `zit`. Se anaden como disparadores los nombres reales de las personas representadas, ya que Z-Image-Turbo puede generar directamente ciertas identidades reales mediante prompt; cuando el nombre entra en conflicto, se emplean disparadores especificos marcados en las marcas de agua de las imagenes de ejemplo con el formato `girlslikezi for xxx`. No se documentan tecnicas como RLHF, DPO ni decodificacion especulativa, por no ser aplicables a un adaptador de difusion.

## Capacidades

- Generacion text-to-image de retratos y figuras femeninas con identidades concretas mediante disparadores.
- Personalizacion de identidad sobre Z-Image base y Z-Image-Turbo segun la variante (`zi` o `zit`).
- Control de similitud mediante el peso del adaptador (recomendado entre 0,5 y 1,5; en Turbo con `zi` puede usarse a 1,0).
- Generacion con prompts en chino, segun los ejemplos del autor.
- Compatibilidad con flujos de muestreo configurables: `er_sde + sgm_uniform` o `euler + flowmatch`.
- Ajuste de diversidad mediante doble muestreador con scheduler DDIM en el primer paso.
- Control del estilo mediante el nodo ModelSamplingAuraFlow con valores de shift entre 3 y 10.
- No soporta tool calling, agentes, razonamiento multi-paso ni modalidades de audio o video.

## Casos de uso

- Generacion de retratos personalizados: el adaptador permite reproducir una identidad concreta a partir de su disparador, con pesos ajustables para modular la similitud frente a la fidelidad estetica del modelo base.
- Pruebas de concepto de personajes para ilustracion: util para explorar variaciones de una misma figura en distintos encuadres (plano medio, plano lejano) aprovechando la mayor consistencia en planos abiertos que el autor atribuye a la variante `zi`.
- Experimentacion con tecnicas de bajo rango: el repositorio sirve como referencia practica para comparar LoKR de rango completo frente a LoRA en modelos de difusion con modos base y turbo.
- Flujos de generacion rapida con Z-Image-Turbo: con 4 a 8 pasos y cfg=1 se obtienen resultados utilizables, adecuado para iteracion rapida en entornos de prueba.
- Investigacion sobre sesgos y representacion: permite estudiar como los modelos de difusion incorporan identidades reales en sus datos y como los adaptadores refuerzan o redirigen esas representaciones.
- Evaluacion de estabilidad anatomica: util como banco de pruebas para medir la incidencia de errores anatomicos en adaptadores de identidad y comparar variantes base frente a turbo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el repositorio ocupa 8,2 GB y se documenta uso en BF16, por lo que se requiere una GPU con al menos 16 GB de VRAM para el modelo base en BF16, y mas si se anaden adaptadores y se generan resoluciones altas.
- GPU recomendadas: no disponible en la informacion; por el formato BF16 y la resolucion de ejemplo (1080x1440) se situa en el rango de GPUs de gama alta con 16-24 GB o superiores.
- Cabe en GPU de consumo: no confirmado por el autor; probable en tarjetas de 16 GB o mas en BF16, no verificado.
- Opciones de despliegue: libreria diffusers; el autor menciona nodos de ComfyUI (ModelSamplingAuraFlow) y muestreadores `er_sde`, `euler`, `ddim`, `sgm_uniform` y `flowmatch`.
- Latencia y throughput: no disponibles; se documenta que 4 pasos son suficientes para resultados iniciales y que mas de 10 pasos no aportan beneficio apreciable en Turbo.

## Comparativa con modelos similares

| Modelo | Tipo | Base | Contexto / resolucion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| girlslike-zimage | LoRA/LoKR de identidad | Z-Image / Z-Image-Turbo | 1080x1440 en ejemplos | Apache 2.0 | Hugging Face |
| Tongyi-MAI/Z-Image | Modelo de difusion text-to-image | propio | no disponible | no disponible en la informacion | Hugging Face |
| Tongyi-MAI/Z-Image-Turbo | Modelo de difusion text-to-image (pocos pasos) | propio | no disponible | no disponible en la informacion | Hugging Face |
| LoRA de identidad genericos (Civitai) | Adaptadores LoRA | SDXL, Flux, etc. | variable | variable | Civitai |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- El autor declara que el trabajo es de prueba y refleja solo su criterio estetico personal; no esta pensado como producto.
- Persisten problemas anatomicos frecuentes, agravados por las deficiencias del modelo base; el autor senala que los errores de extremidades se vuelven inestables.
- La compatibilidad entre variantes es limitada: los adaptadores `zit` solo funcionan con Turbo, y los `zi` muestran comportamiento distinto segun se usen con base o con Turbo.
- El uso de nombres reales como disparadores implica riesgos de suplantacion, desinformacion y vulneracion de derechos de imagen; el autor prohibe explicitamente el uso para suplantacion o engano.
- Riesgo de alucinacion visual: el modelo puede generar identidades plausibles pero inexactas, especialmente en primer plano.
- No hay informacion sobre sesgos demograficos, equilibrio del dataset ni evaluaciones de seguridad.
- La licencia Apache 2.0 permite uso comercial, pero las obligaciones legales sobre derechos de imagen de las personas representadas recaen en el usuario.
- El repositorio no documenta idiomas soportados ni calidad de prompt en castellano; los ejemplos usan chino.

## Enlaces

- Hugging Face: https://huggingface.co/ifmylove2011/girlslike-zimage
- Modelo base: https://huggingface.co/Tongyi-MAI/Z-Image
- Modelo base Turbo: https://huggingface.co/Tongyi-MAI/Z-Image-Turbo
- Galeria de disparadores: https://huggingface.co/spaces/ifmylove2011/girlslike_lora_gallery/blob/main/app.py
- Fuente de prompts citada: https://civitai.com/models/2231696
