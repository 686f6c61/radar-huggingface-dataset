# ntc-ai/krea2-particle-sliders

## Resumen

Krea2 Particle Sliders es una colección de adaptadores LoRA de atención para el modelo de difusión de texto a imagen Krea 2, publicada por el usuario ntc-ai sobre el checkpoint comunitario jimmycarter/krea2-turbo-bbox. No es un modelo de lenguaje ni un modelo base: es un aditivo que se carga sobre un transformer de difusión existente y modifica su comportamiento estético y de composición sin reentrenar los pesos principales. El repositorio ocupa 0,7 GB e incluye dos familias de efecto, Final Boss y Eldritch, cada una en dos variantes: un LoRA original de rango 16 y un distill comprimido de rango 8.

El interés del proyecto es metodológico: en lugar de un único LoRA monolítico, se publican pares "original / distill" con el mismo prompt, la misma semilla y el mismo sampler, de modo que la degradación introducida por la compresión de rango pueda evaluarse de forma controlada. Los ejemplos de la model card se generan a 768 × 768 píxeles, con 8 pasos, guidance 0 y mu = 1,15, y la fuerza calibrada de los adaptadores es 1.

La relevancia práctica es acotada pero clara para quien trabaje con Krea 2: permite aplicar variaciones estéticas reproducibles (mecanización de sujetos, transformación hacia una estética eldritch) en pipelines de generación por lotes, manteniendo la misma semilla y el mismo prompt para poder comparar resultados. El modelo se distribuye bajo la Krea 2 Community License, que no es una licencia de código abierto estándar y debe revisarse antes de cualquier uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA de atención (adaptadores lineales de bajo rango) sobre el transformer de difusión del modelo base Krea 2 |
| Parametros totales | no disponible; el repositorio completo ocupa 0,7 GB y contiene varios adaptadores (rango 16 originales y rango 8 distills), sin desglose de tamano por archivo |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no aplica; es un modelo de texto a imagen, no dispone de ventana de contexto de tokens de longitud declarada |
| Tipos de cuantizacion | no disponible; se distribuyen pesos en safetensors sin variantes cuantizadas publicadas (no hay GGUF ni FP8 en el repositorio) |
| Idiomas soportados | en (inglés), segun el campo language de la model card |
| Licencia | krea-2-community-license (license: other), con PDF en el repositorio |
| Formato de pesos | safetensors, empaquetado para la libreria diffusers |
| Modelo base | jimmycarter/krea2-turbo-bbox (relacion: adapter) |
| Pipeline declarado | text-to-image |
| Fuerza calibrada | 1 (tanto para originales como para distills) |
| Fecha de publicacion | 23 de septiembre de 2026 (creacion y ultima actualizacion) |

## Arquitectura y entrenamiento

Los adaptadores son LoRA de atención convencionales, no módulos nuevos ni capas de mezcla. Según la model card, los originales se entrenaron directamente como LoRA de rango 16 y los distills son compresiones de rango 8 de esos mismos adaptadores lineales. El entrenamiento se realizó sobre el transformer del checkpoint jimmycarter/krea2-turbo-bbox, concretamente sobre la revisión epoch-14-step-73184/transformer, lo que sitúa el punto de partida en un modelo turbo ya destilado para pocos pasos de muestreo.

No se especifican en la información disponible el número de imágenes de entrenamiento, la composición del dataset, la resolución de entrenamiento ni si se aplicaron etapas de ajuste por preferencias humanas. Tampoco se documenta el método exacto de destilación empleado para pasar de rango 16 a rango 8, más allá de la descripción de que se comprimen los adaptadores lineales. La innovación destacable del repositorio no está en la arquitectura, sino en el protocolo de publicación: cada comparación mantiene fijo el prompt, la semilla y el sampler entre las versiones Off, Original y Distill, lo que permite atribuir las diferencias visuales al adaptador y no al azar del muestreo.

## Capacidades

- Aplicación de estilos de transformación sobre generaciones de Krea 2: la familia Final Boss añade armadura angular, paneles desgastados y extremidades mecánicas más pesadas a sujetos robóticos, manteniendo la escena original.
- Segunda familia estética, Eldritch, orientada a transformaciones de tono orgánico o cósmico (el detalle de sus ejemplos no está desarrollado en la información disponible).
- Composición por regiones: los prompts de ejemplo usan sintaxis de caja delimitadora del modelo base, como o[230,80,770,950] para un objeto y pe:1[220,80,780,950] para un sujeto, lo que permite confinar el efecto del adaptador a una zona concreta del lienzo.
- Modificadores de estilo en el prompt: los ejemplos incorporan prefijos como @35mm documentary photography o ~A quiet factory yard, que el modelo base interpreta como control de estilo y de escenario.
- Reproducibilidad por semilla: los ejemplos publicados fijan semillas concretas (31415, 42) y las mantienen entre comparaciones.
- Compatibilidad declarada con ComfyUI y con la librería diffusers.
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso, visión como entrada, audio ni modo de pensamiento; son capacidades ajenas a un adaptador de difusión de texto a imagen.
- Capacidad multilingüe: no disponible; el campo de idioma declarado es únicamente inglés.

## Casos de uso

- Exploración de variantes estéticas en un pipeline de difusión: cargar el adaptador Final Boss con strength 1 y la misma semilla que la generación base permite producir pares comparables sin reescribir el prompt, útil para elegir una dirección visual antes de escalar a producción.
- Ilustración de conceptos para videojuegos: la transformación de un robot de servicio plano en una unidad blindada con hombreras angulares y paneles desgastados encaja en tareas de generación de variantes de personaje a partir de un diseño base ya aprobado.
- Generación de arte conceptual para entornos de fantasía: el ejemplo Heldout Bridge, con un guerrero adulto con armadura de acero y espada sobre un puente de piedra y río de lava, muestra el uso del adaptador combinado con delimitadores de región para controlar la posición del sujeto.
- Control fino de composición en escenas con varios elementos: al usar las cajas o[...] y pe:1[...] sobre el modelo base, se puede confinar el efecto del LoRA a un sujeto concreto y dejar el fondo intacto, lo que resulta útil en encargos donde solo un elemento debe cambiar.
- Ajuste de estilo en producción con ComfyUI: al estar etiquetado para ComfyUI y diffusers, el adaptador se integra en flujos de nodos existentes y permite alternar entre el original de rango 16 y el distill de rango 8 segun el presupuesto de memoria o de disco.
- Auditoría de compresión de modelos: el par original/distill con semilla y prompt fijos sirve como banco de pruebas casero para medir cuánta fidelidad se pierde al reducir el rango de un LoRA, un procedimiento reutilizable para otros adaptadores.
- Prototipado rápido en equipos con hardware limitado: el rango 8 y las 8 pasos de muestreo con guidance 0 reducen el coste de generación, lo que permite iterar sobre direcciones artísticas sin acceso a GPU de gama alta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay puntuaciones de FID, CLIP score, ImageReward ni de ningún otro conjunto estándar de evaluación de generación de imagen, ni comparaciones numéricas contra otros adaptadores.

La única información cuantitativa del repositorio es el protocolo de los ejemplos publicados, que se reproduce a continuación como referencia de reproducibilidad:

| Parametro de muestreo | Valor |
|---|---|
| Resolucion de los ejemplos | 768 x 768 |
| Pasos de muestreo | 8 |
| Guidance | 0 |
| Mu | 1,15 |
| Fuerza del LoRA (original y distill) | 1 |
| Semillas de ejemplo | 31415 (robot en patio lluvioso), 42 (puente de lava) |
| Multiplicador alpha externo | ninguno |

## Requisitos de hardware

- El repositorio de adaptadores ocupa 0,7 GB en disco; el consumo de VRAM en inferencia lo determina el modelo base Krea 2 y no los LoRA.
- VRAM estimada para el adaptador en solitario: menos de 1 GB adicional en FP16, dado el tamano del repositorio.
- VRAM estimada para el conjunto base más adaptador: no disponible en la informacion proporcionada; depende de la precision y del backend.
- Cabe en GPU de consumo: no confirmado por el autor. Una publicacion de terceros en Patreon describe la ejecucion de Krea 2 en Stable Forge UI Neo con 6 GB de VRAM, pero ese dato corresponde al modelo base en un frontend concreto y no esta verificado para este adaptador.
- GPUs recomendadas: no disponibles; no se documenta ninguna referencia de NVIDIA A100, H100, RTX 4090 ni similares.
- Opciones de despliegue: diffusers (libreria declarada), ComfyUI (etiqueta del repositorio) y frontends compatibles con Krea 2 como Stable Forge UI Neo.
- Latencia y throughput: no disponibles. El uso de 8 pasos y guidance 0 en los ejemplos sugiere un regimen de muestreo rapido, pero no se publican tiempos por imagen ni imagenes por segundo.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de este adaptador, por lo que la comparacion se limita a caracteristicas declaradas. Se incluyen como alternativas el modelo base y otro adaptador del mismo ecosistema Krea 2.

| Modelo | Tipo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| ntc-ai/krea2-particle-sliders | LoRA sobre Krea 2 (rango 16 y rango 8) | no disponible (repo de 0,7 GB) | no aplica | sin benchmarks publicados | krea-2-community-license | HuggingFace, diffusers y ComfyUI |
| jimmycarter/krea2-turbo-bbox | Modelo base de difusion texto a imagen | no disponible | no aplica | sin datos en la informacion disponible | no disponible | HuggingFace |
| Krea 2 Detail Slider (Civitai, v1.0) | LoRA sobre Krea 2 | no disponible | no aplica | sin datos en la informacion disponible | no disponible | Civitai |
| YuE2 Particle Sliders | Adaptadores de composicion por particulas para el modelo de audio m-a-p/YuE2-3B | no disponible | no aplica | sin datos en la informacion disponible | no disponible | GitHub y HuggingFace |

## Limitaciones y advertencias

- No es un modelo autonomo: requiere el checkpoint jimmycarter/krea2-turbo-bbox para funcionar. Los pesos del repositorio son solo adaptadores.
- La licencia es krea-2-community-license (license: other). No es una licencia de codigo abierto convencional y las condiciones de uso comercial no se detallan en el texto disponible; hay que leer el PDF de licencia del repositorio antes de cualquier despliegue productivo.
- Idioma: solo ingles declarado. No hay evidencia de soporte para prompts en castellano.
- Riesgo de sobreestilizacion: la fuerza calibrada es 1; valores distintos no estan validados y pueden degradar la coherencia de la imagen o romper la estetica prevista.
- Los distills de rango 8 son compresiones de los originales de rango 16. La model card no cuantifica la perdida de fidelidad, solo la muestra visualmente.
- Sesgos conocidos: no documentados. La model card no incluye ninguna seccion de sesgos, limitaciones de contenido ni analisis de representacion.
- Riesgo de alucinacion visual: inherente a cualquier modelo de difusion. No hay evaluacion publicada de coherencia estructural ni de fidelidad al prompt para este adaptador.
- Dependencia de convenciones de prompt del modelo base: los ejemplos usan sintaxis especifica (o[...], pe:1[...], @, ~). Fuera de esas convenciones el adaptador puede comportarse de forma impredecible.
- Ajustes de muestreo no estandar: 8 pasos, guidance 0 y mu = 1,15. No se documenta como se comporta el adaptador con otros valores de guidance o con mas pasos.
- Sin validacion comunitaria: el repositorio registra 0 descargas y 0 likes en los datos disponibles, por lo que no hay evidencia externa de calidad ni de reproducibilidad mas alla de los ejemplos del autor.
- El repositorio se creo y actualizo el mismo dia, sin historial posterior de mantenimiento ni correcciones.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ntc-ai/krea2-particle-sliders
- Archivos del repositorio: https://huggingface.co/ntc-ai/krea2-particle-sliders/tree/main
- Model card (README): https://huggingface.co/ntc-ai/krea2-particle-sliders/blob/main/README.md
- Licencia Krea 2 Community License (PDF): https://huggingface.co/ntc-ai/krea2-particle-sliders/resolve/main/KREA2-LICENSE.pdf
- Modelo base: https://huggingface.co/jimmycarter/krea2-turbo-bbox
- Ejemplo comparativo Final Boss, robot en patio lluvioso (semilla 31415): https://huggingface.co/ntc-ai/krea2-particle-sliders/resolve/main/assets/final-boss-photo-rainy-yard-robot-seed-31415.jpg
- Ejemplo comparativo Final Boss, puente de lava (semilla 42): https://huggingface.co/ntc-ai/krea2-particle-sliders/resolve/main/assets/final-boss-heldout-bridge.jpg
- Proyecto relacionado YuE2 Particle Sliders (GitHub): https://github.com/HyperGAN/yue2-particle-sliders
- Adaptador Krea 2 Detail Slider en Civitai: https://civitai.com/models/2729908/krea-2-detail-slider
- Publicacion de terceros sobre Krea 2 en Stable Forge UI Neo (6 GB de VRAM): https://www.patreon.com/TheLocalLab/posts/krea-2-image-in-162660487
