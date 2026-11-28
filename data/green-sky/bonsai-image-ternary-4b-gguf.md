# Green-Sky/bonsai-image-ternary-4B-GGUF

## Resumen

Bonsai-Image 4B (ternary) en formato GGUF es una conversión y cuantización del modelo de generación de imágenes text-to-image `prism-ml/bonsai-image-ternary-4B-unpacked`, publicada por el usuario Green-Sky. El modelo original emplea una arquitectura de tipo Flux con pesos ternarios (representaciones de muy baja precisión), y esta versión traslada esos pesos al ecosistema GGUF/sd.cpp para permitir su ejecución en herramientas como ComfyUI y stable-diffusion.cpp. El repositorio ocupa 10,5 GB e incluye variantes cuantizadas adicionales de menor tamaño.

El interés de esta ficha radica en que ofrece una vía práctica para ejecutar un modelo de difusión de aproximadamente 3.875 millones de parámetros con requisitos de memoria muy reducidos, gracias a la cuantización agresiva de los tensores binarios/ternarios. Según la model card, se usa de forma similar a Flux2 Klein 4B (destilado) y, a diferencia de la variante binaria del mismo autor, conserva muchas más capacidades de edición de imagen.

La licencia es Apache 2.0, lo que facilita su uso comercial. No obstante, la información pública disponible es escasa: no se detallan idiomas soportados, composición del dataset de entrenamiento ni resultados de benchmarks, por lo que varios apartados de esta ficha quedan marcados como "no disponible".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Difusión text-to-image de tipo Flux (pesos ternarios) |
| Parametros totales | 3.875.544.576 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Ternaria/binaria selectiva (q2_0), q8_0 y bf16 según variante; formatos base (q2_0+bf16) y mod_q8_0 (q2_0+q8_0+bf16) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (convertido desde diffusers a ComfyUI/sd.cpp) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura de difusión para generación de imágenes text-to-image con un diseño de tipo Flux, según las etiquetas del repositorio. La característica principal es el uso de pesos ternarios, una forma de cuantización extrema que reduce drásticamente el espacio de almacenamiento y los requisitos de memoria en inferencia. El proceso de esta versión GGUF consistió en una conversión inicial desde diffusers a ComfyUI/sd.cpp y una cuantización selectiva de los tensores binarios mediante sd.cpp.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF/DPO o destilación en el modelo original. La model card indica que se emplea de forma similar a Flux2 Klein 4B (destilado), lo que sugiere que el modelo base podría haber incorporado destilación, pero este dato no se confirma explícitamente. Se incluye además una variante con los dos tensores bf16 más grandes cuantizados a q8_0, con una pérdida de calidad descrita como insignificante.

## Capacidades

- Generación de imágenes a partir de descripciones textuales (text-to-image).
- Edición de imágenes: la variante ternaria conserva, según el autor, muchas más capacidades de edición que la versión binaria.
- Ejecución en entornos de bajo consumo de memoria gracias a la cuantización ternaria y a las variantes q2_0/q8_0.
- Integración con ComfyUI y stable-diffusion.cpp mediante formato GGUF.
- No se documenta soporte de tool calling, agentes, razonamiento multi-paso ni capacidades multimodales de audio o vídeo.
- Capacidades multilingües: no disponible.

## Casos de uso

- Generación de ilustraciones en equipos con GPU de gama media o baja: la cuantización ternaria reduce el peso del modelo a alrededor de 1,3-1,4 GB en las variantes mostradas, lo que permite ejecutarlo en hardware con VRAM limitada.
- Edición iterativa de imágenes en flujos de trabajo ComfyUI: al conservar capacidades de edición, puede emplearse en pipelines de retoque guiado por texto dentro de nodos de ComfyUI.
- Prototipado rápido de conceptos visuales: útil para equipos que necesitan generar bocetos o variaciones de imagen sin disponer de infraestructura de GPU de gran escala.
- Despliegue en entornos con restricciones de almacenamiento: el formato GGUF y las variantes cuantizadas facilitan distribuir el modelo en sistemas con poco espacio en disco.
- Pruebas de investigación sobre cuantización extrema: sirve como caso de estudio para evaluar la calidad de modelos de difusión con pesos ternarios frente a versiones de mayor precisión.
- Integración en aplicaciones de escritorio o locales que usan stable-diffusion.cpp, donde el consumo de memoria y la portabilidad son prioritarios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: las variantes cuantizadas mostradas en la model card ocupan aproximadamente 1,32-1,43 GB en disco (q2_0+bf16 y q2_0+q8_0+bf16), lo que sugiere requisitos de memoria moderados, aunque no se especifica la VRAM exacta necesaria en inferencia.
- GPU recomendadas: no disponible de forma explícita; por el tamaño reducido de las variantes cuantizadas, es plausible su ejecución en GPU consumer, pero no se confirma en la información proporcionada.
- Compatibilidad con GPU consumer: probable dada la cuantización ternaria, sin datos oficiales que lo confirmen.
- Opciones de despliegue: ComfyUI y stable-diffusion.cpp (sd.cpp), según el proceso de conversión descrito.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Green-Sky/bonsai-image-ternary-4B-GGUF | 3.875.544.576 | No disponible | GGUF | Apache 2.0 | Variante ternaria con edición conservada |
| Green-Sky/bonsai-image-binary-4B-GGUF | No disponible | No disponible | GGUF | Apache 2.0 | Variante binaria del mismo autor, menos capacidades de edición |
| prism-ml/bonsai-image-ternary-4B-unpacked | No disponible | No disponible | Diffusers (sin empaquetar) | No disponible | Modelo base del que deriva esta conversión |

No se dispone de datos de rendimiento comparativo entre estas variantes más allá de la afirmación cualitativa del autor sobre la mayor capacidad de edición de la versión ternaria frente a la binaria.

## Limitaciones y advertencias

- La información pública es muy limitada: no hay datos sobre sesgos, dataset de entrenamiento ni evaluación cuantitativa.
- Riesgo de alucinación visual y de artefactos propios de la cuantización ternaria; la calidad puede degradarse frente al modelo en mayor precisión.
- La cuantización selectiva (q2_0, q8_0) puede introducir pérdidas de calidad, aunque el autor las describe como insignificantes en la variante mod_q8_0.
- No se especifican idiomas soportados, lo que dificulta garantizar un comportamiento multilingüe fiable en los prompts.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base `prism-ml/bonsai-image-ternary-4B-unpacked`, cuya licencia no se detalla en la información disponible.
- Al ser una conversión de terceros (Green-Sky), no existe garantía oficial del autor original sobre el comportamiento del modelo en formato GGUF.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Green-Sky/bonsai-image-ternary-4B-GGUF
- Modelo base: https://huggingface.co/prism-ml/bonsai-image-ternary-4B-unpacked
- Variante binaria del mismo autor: https://huggingface.co/Green-Sky/bonsai-image-binary-4B-GGUF
