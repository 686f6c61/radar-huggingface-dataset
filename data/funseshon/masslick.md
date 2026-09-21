# funseshon/masslick

## Resumen

funseshon/masslick es un adaptador LoRA de tipo DreamBooth para el modelo de difusión texto-a-imagen Krea 2. El adaptador se entrena sobre Krea 2 RAW (krea/Krea-2-Raw) y las muestras publicadas se generan sobre Krea 2 Turbo, la variante destilada para pocos pasos. Se activa mediante la palabra disparadora `MASSLICK`, que debe incluirse en el prompt para invocar el concepto aprendido. El repositorio ocupa 1,0 GB y se distribuye bajo licencia Apache 2.0.

El modelo resuelve un problema acotado: inyectar un concepto o estilo concreto en un modelo base de gran tamaño sin reentrenarlo, aprovechando la modularidad de los adaptadores de bajo rango. Al estar pensado para Turbo, permite iterar con tan solo 8 pasos de inferencia y `guidance_scale = 0.0`, lo que reduce el coste por imagen respecto a la generación estándar del modelo RAW.

Es relevante ahora porque el ecosistema Krea 2 todavía está en fase temprana: este adaptador tiene 0 descargas y 0 me gusta en el momento de la consulta, y su model card no documenta ni el concepto entrenado ni los hiperparámetros del entrenamiento. Se trata, por tanto, de un artefacto experimental útil para probar el flujo LoRA sobre Krea 2, no de un componente validado para producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (DreamBooth) sobre un modelo de difusión texto-a-imagen de la familia Krea 2; rango y alpha no documentados |
| Parametros totales | no disponible (el repositorio ocupa 1,0 GB) |
| Parametros activos | no aplicable (no es un modelo MoE, es un adaptador LoRA) |
| Longitud de contexto | no aplicable (generación de imágenes; el límite real lo fija el codificador de texto del modelo base, no especificado) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible; todos los prompts de ejemplo de la model card están en inglés |
| Licencia | apache-2.0 |
| Formato de pesos | no disponible; se carga con `pipe.load_lora_weights()` de diffusers (compatible con safetensors, sin confirmar en la documentación) |
| Modelo base | krea/Krea-2-Raw (inferencia mostrada sobre krea/Krea-2-Turbo) |
| Pipeline | text-to-image |
| Palabra disparadora | `MASSLICK` |
| Libreria | diffusers (`Krea2Pipeline`) |
| Tamaño del repositorio | 1,0 GB |
| Inferencia en los ejemplos | 8 pasos, `guidance_scale = 0.0` |
| Descargas / me gusta | 0 / 0 |
| Fecha de creación (metadatos) | 2026-09-21 |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA de bajo rango, no un modelo completo. La model card indica que se entrenó con DreamBooth sobre Krea 2 RAW y que las muestras se generaron aplicándolo sobre Krea 2 Turbo, lo que implica que el adaptador es transferible entre las dos variantes de la familia (RAW y destilada). El uso documentado es la inyección de un único concepto mediante un token textual poco frecuente, `MASSLICK`, siguiendo el patrón clásico de DreamBooth-LoRA: el token activa la representación aprendida y el resto del prompt controla la escena.

No hay información pública sobre el número de imágenes de entrenamiento, la resolución nativa, el rango o alpha del adaptador, la tasa de aprendizaje, el número de pasos de optimización, el uso de imágenes de regularización ni el proceso de captioning. Tampoco se documenta ningún ajuste posterior tipo RLHF o DPO, algo que en cualquier caso no aplica a un modelo de difusión de este tipo. La única innovación práctica declarada es la compatibilidad con el modo Turbo de 8 pasos, que abarata la inferencia a cambio de renunciar al clasificador de guía libre (`guidance_scale = 0.0`).

## Capacidades

- Generación texto-a-imagen condicionada: reproduce el concepto asociado al token `MASSLICK` cuando este aparece en el prompt.
- Compatibilidad con el modo Turbo: funciona con 8 pasos de inferencia y `guidance_scale = 0.0`, lo que acelera la iteración.
- Transferencia RAW a Turbo: el adaptador se entrenó sobre Krea 2 RAW y se demuestra sobre Krea 2 Turbo sin reentrenamiento.
- Integración con diffusers: se carga y descarga en el pipeline `Krea2Pipeline` mediante `load_lora_weights()`.
- Control de la composición mediante prompt: las tres muestras publicadas (leopardo de las nieves, coche futurista, relojero victoriano) muestran que el concepto se superpone a escenas muy distintas.
- Capacidades de lenguaje, razonamiento, código, matemáticas, tool calling, agentes, visión o audio: no aplicable, es un modelo de generación de imágenes.
- Capacidades multilingües: no documentadas; solo hay evidencia de prompts en inglés.

## Casos de uso

- Exploración de estilo propio: aplicar el token `MASSLICK` sobre prompts descriptivos para comprobar qué concepto ha aprendido el adaptador antes de integrarlo en cualquier flujo de trabajo.
- Previsualización rápida de concept art: gracias al modo Turbo de 8 pasos, permite generar decenas de variaciones de una escena en pocos minutos en una sola GPU.
- Consistencia visual en una serie de imágenes: si el concepto es un estilo o una textura, el LoRA permite mantenerlo constante a lo largo de un conjunto de ilustraciones variando solo la escena del prompt.
- Generación de material de referencia para un pipeline mayor: las imágenes resultantes pueden servir como bocetos de entrada para un modelo base completo (Krea 2 RAW) o para un paso posterior de retoque.
- Evaluación técnica de LoRA sobre Krea 2: sirve como banco de pruebas para medir cómo se comporta un adaptador entrenado en RAW cuando se aplica a Turbo en 8 pasos.
- Prototipado de herramientas internas con diffusers: el fragmento de código de la model card se puede envolver en un servicio Python que reciba prompts y devuelva imágenes, con el LoRA cargado una sola vez en memoria.
- Estudio comparativo de adaptadores: útil en investigación para contrastar la degradación de un LoRA DreamBooth al reducir pasos de inferencia y desactivar la guía por clasificador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente incluye tres imágenes de muestra cualitativas generadas sobre Krea 2 Turbo (8 pasos, `guidance_scale = 0.0`) con los prompts del leopardo de las nieves, el coche futurista y el relojero victoriano. No hay métricas objetivas (FID, CLIP score, similitud de concepto, consistencia entre semillas) ni comparaciones cuantitativas con otros adaptadores.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El coste está dominado por el modelo base Krea 2, cuyas especificaciones no aparecen en la información proporcionada; el LoRA añade un repositorio de 1,0 GB.
- GPU recomendadas: no disponibles en la documentación. El ejemplo oficial asume una GPU CUDA con soporte de `bfloat16` (`torch_dtype=torch.bfloat16`).
- ¿Cabe en GPU de consumo?: no documentado. Sin los requisitos del modelo base no se puede afirmar qué tarjetas de gama consumer son suficientes.
- Opciones de despliegue: diffusers con `Krea2Pipeline` es la única vía documentada. La etiqueta `template:sd-lora` sugiere compatibilidad con el ecosistema de interfaces basadas en Stable Diffusion, pero no se confirma compatibilidad con ComfyUI, Automatic1111 o Forge.
- Latencia y throughput: no disponibles. El único dato indirecto es que las muestras se generan con 8 pasos de inferencia en la variante Turbo.
- Aceleradores y backends: no se documenta compatibilidad con TensorRT, ONNX, xFormers, FlashAttention ni otros backends de optimización.

## Comparativa con modelos similares

No hay datos suficientes para una comparativa cuantitativa. No se han identificado en la información proporcionada otros LoRA de Krea 2 con los que contrastar, ni se dispone de métricas de este adaptador.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| funseshon/masslick (LoRA Krea 2) | no disponible (repo de 1,0 GB) | no aplicable | no evaluado (solo 3 muestras cualitativas) | apache-2.0 | Hugging Face, 0 descargas |
| Otros LoRA de la familia Krea 2 | no disponible | no aplicable | no disponible | no disponible | no identificados en la búsqueda |
| LoRA de DreamBooth para SDXL o SD 1.5 | varía (típicamente 10-200 MB) | no aplicable | no comparable directamente | varía según autor | ecosistema amplio en Hugging Face y Civitai |

## Limitaciones y advertencias

- Concepto no documentado: la model card solo indica el token `MASSLICK`; no describe qué se ha entrenado ni aporta ejemplos negativos, por lo que el contenido real del adaptador solo se puede verificar ejecutándolo.
- Posible contenido sensible: la búsqueda web realizada no devuelve ningún resultado técnico sobre el modelo; los resultados obtenidos apuntan a dominios de contenido para adultos sin relación con el repositorio. Esto sugiere que el nombre puede estar asociado a un concepto no apto para todos los públicos y refuerza la necesidad de revisar las salidas antes de usarlas.
- Sin validación comunitaria: 0 descargas y 0 me gusta, con fechas de creación y actualización muy próximas entre sí.
- Inconsistencia en los metadatos: las fechas del repositorio (21 de septiembre de 2026) son anómalas y deberían verificarse antes de citar el modelo.
- Ausencia total de benchmarks y de análisis de sesgos: no hay evaluación de cómo el concepto interactúa con la representación de personas, ni métricas de fidelidad al prompt.
- Riesgo de sobreajuste y de interferencia con el prompt: al ser un LoRA DreamBooth de token único, puede imponer su concepto por encima de la descripción textual, especialmente en Turbo con `guidance_scale = 0.0`.
- Idiomas: solo hay evidencia de funcionamiento con prompts en inglés; el comportamiento con otras lenguas no está documentado.
- Licencia: el adaptador se publica bajo apache-2.0, pero eso no exime de cumplir las condiciones del modelo base krea/Krea-2-Raw y de la variante Turbo, que deben revisarse por separado para uso comercial.
- Opacidad del dataset de entrenamiento: no se declara el origen de las imágenes usadas en el DreamBooth, lo que introduce incertidumbre legal si el concepto deriva de material con derechos.
- Producción: sin pruebas de estabilidad entre semillas, sin resolución recomendada, sin guía sobre cuántos pasos usar más allá de los 8 del ejemplo y sin soporte documentado de filtros de seguridad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/funseshon/masslick
- Modelo base declarado: https://huggingface.co/krea/Krea-2-Raw
- Variante usada para las muestras: https://huggingface.co/krea/Krea-2-Turbo
- Librería de inferencia: https://github.com/huggingface/diffusers
- Búsqueda web: no se han encontrado enlaces técnicos relevantes (papers, blogs, repos o demos) asociados a este modelo; los resultados devueltos no guardan relación con él.
