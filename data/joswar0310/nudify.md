# Joswar0310/Nudify

## Resumen

Nudify es un LoRA (Low-Rank Adaptation) para modelos de difusion Stable Diffusion XL (SDXL) y, parcialmente, Stable Diffusion 1.5, desarrollado por el usuario Joswar0310 y publicado en Hugging Face. Su proposito declarado es mejorar la representacion de cuerpos femeninos humanoides en generacion de imagenes fotorrealistas y semirrealistas, segun la model card del autor. No se trata de un modelo base completo, sino de un adaptador de bajo rango que se aplica sobre checkpoints SDXL existentes.

El repositorio tiene un tamano de 1,8 GB y fue creado y actualizado el 27 de noviembre de 2026. En el momento de la consulta no registra descargas ni likes, y no dispone de pipeline declarado, licencia especificada ni idiomas soportados en los metadatos de Hugging Face. La model card esta redactada en ingles e incluye detalles tecnicos de entrenamiento, hiperparametros y una lista de intentos fallidos.

La relevancia de esta ficha es limitada desde el punto de vista de la investigacion en IA generativa de proposito general: se trata de un adaptador de nicho, con documentacion tecnica escasa y sin benchmarks publicados. Su interes practico se reduce a quienes trabajen con personalizacion de SDXL mediante LoRA y quieran conocer los hiperparametros y hallazgos empiricos que el autor documenta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre SDXL 1.0 (base SDXL1.0fix); compatibilidad parcial con SD1.5 via text encoder |
| Parametros totales | no disponible (el autor indica dimension de red 256/128 en v0.3, no numero total de parametros) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de difusion para imagenes) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (los prompts de la model card estan en ingles) |
| Licencia | no disponible |
| Formato de pesos | no disponible en los metadatos; la model card menciona archivos `.safetensor` en el contexto de reanudacion de entrenamiento |

## Arquitectura y entrenamiento

El adaptador es un LoRA estandar aplicado sobre SDXL 1.0fix. Segun la model card, la version v0.3 emplea una dimension de red de 256/128 con offset 0.04 y fue entrenada sobre 1768 imagenes. Las versiones anteriores usaron configuraciones distintas: v0.25 con red 128/96 y `scale_weight_norms=2` sobre 1750 imagenes; v0.2 con red 128/16 sobre 1300 imagenes; y v0.1 con red 32/16 sobre 1100 imagenes. El entrenamiento se realizo con el preset prodigy, escalado de buckets y sin imagenes de regularizacion.

El dataset, segun el autor, consta de aproximadamente 400 imagenes "perfectas" con repeticion 10 y batch 5, o 2 con 4 a 8 epocas, mas entre 500 y 1500 imagenes de buena calidad con menor atencion (repeticion 1 a 4) para aportar diversidad. Todas las personas representadas estan en el rango de 18 a 26 anos, con mayoria de 20. La model card documenta hallazgos empiricos: valores bajos de alpha de red ralentizan el entrenamiento, `scale_weight_norms` superior a 3 provoca sobreentrenamiento, dimensiones de red inferiores a 64 resultan insuficientes para este dataset, y reanudar desde estado guardado funciona mejor que desde `.safetensor`. Tambien senala que GLORA y OFT dieron peores resultados que LoRA convencional con los ajustes recomendados.

## Capacidades

- Generacion de imagenes fotorrealistas y semirrealistas de cuerpos femeninos humanoides mediante SDXL.
- Modificacion de la representacion anatomica femenina cuando se aplica sobre checkpoints SDXL compatibles.
- Funcionamiento parcial en SD1.5 exclusivamente a traves del text encoder (CLIP), segun el autor.
- Ajuste de intensidad del efecto mediante strength: 0,3 a 0,9 con modelos comunitarios y 1 a 1,3 con SDXL base; en SD1.5, 0,8 a 1,5.
- Control de atributos mediante tags principales (`1girl`, `nude`, `pussy`) y negativos recomendados (`huge ass`, `headphones, hat`).
- No soporta tool calling, agentes, razonamiento multi-paso, vision ni audio: es un adaptador de difusion, no un modelo de lenguaje.

## Casos de uso

- Investigacion sobre personalizacion de SDXL mediante LoRA: el adaptador sirve como caso de estudio de como la dimension de red, el alpha y `scale_weight_norms` afectan al sobreentrenamiento en datasets pequenos y homogeneos.
- Reproduccion de experimentos de entrenamiento: la model card documenta configuraciones concretas (prodigy, buckets escalados, sin regularizacion) que permiten replicar el pipeline y comparar variantes.
- Analisis de sensibilidad a checkpoints base: el autor identifica que funciona con sdxlUnstableDiffusers_v5 y v8 y realismEngineSDXL_v20, y falla con DreamShaper XL y sdxlUnstableDiffusers_v9, lo que permite estudiar la interaccion entre LoRA y checkpoint.
- Estudio de sesgos en modelos de difusion: el sesgo de atencion excesiva hacia ciertas partes del cuerpo documentado por el autor es un ejemplo util para analizar como los datos de entrenamiento moldean la distribucion generada.
- Evaluacion de tecnicas alternativas de adaptacion: la comparacion documentada entre LoRA, LoHa, LoCon, GLORA, OFT y LoKR aporta evidencia empirica sobre su comportamiento relativo.
- Docencia sobre difusion y adaptadores de bajo rango: el repositorio y su model card pueden usarse como material de ejemplo en cursos tecnicos sobre fine-tuning de SDXL.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada. Como referencia general, SDXL requiere del orden de 8 a 12 GB de VRAM en FP16, pero este dato no procede de la model card y debe verificarse con el checkpoint base concreto.
- GPU recomendadas: no disponible. El autor no especifica hardware de entrenamiento ni de inferencia.
- Compatibilidad con GPU de consumo: no disponible de forma explicita; depende del checkpoint SDXL sobre el que se aplique el LoRA.
- Opciones de despliegue: no disponible. La model card menciona ComfyUI en relacion con la linea del text encoder en SD1.5, pero no detalla otros entornos (vLLM, llama.cpp, Ollama o TGI no aplican a modelos de difusion).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Base | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Nudify (Joswar0310) | LoRA | SDXL 1.0 / SD1.5 (TE) | no disponible (red 256/128) | no aplica | no disponible | Hugging Face |
| Alternativas de LoRA para SDXL | no disponible | no disponible | no disponible | no aplica | no disponible | no disponible |

No se dispone de informacion sobre modelos comparables en la documentacion proporcionada. La model card menciona checkpoints base (sdxlUnstableDiffusers_v5, v8, realismEngineSDXL_v20, DreamShaper XL) pero no ofrece comparativas cuantitativas con otros LoRA.

## Limitaciones y advertencias

- Contenido para adultos: el modelo esta disenado para generar imagenes de desnudos y contenido sexual explicito, y esta marcado con la etiqueta `not-for-all-audiences`. Su uso conlleva implicaciones legales y eticas que deben evaluarse segun la jurisdiccion.
- Sesgo de atencion: el autor reconoce atencion excesiva hacia ciertas partes del cuerpo y algunas poses, y recomienda pesos bajos como `(ass:0.5)` o situar el tag al final del prompt.
- Incompatibilidad con checkpoints: no funciona con DreamShaper XL (alpha ni turbo), con sdxlUnstableDiffusers_v9 ni con modelos anime muy estilizados.
- Licencia no especificada: al no declararse licencia, no puede asumirse permiso para uso comercial ni redistribucion. Es un riesgo relevante para produccion.
- Riesgo de alucinacion anatomica: el autor documenta problemas historicos con rasgos como pezones y labios, parcialmente corregidos en versiones posteriores, y advierte sobre la multiplicacion de partes del cuerpo en ciertas configuraciones.
- Documentacion limitada: no hay pipeline declarado, ni idiomas, ni benchmarks, ni ficha de parametros completa. La evaluacion objetiva del adaptador no es posible con los datos publicados.
- Dataset pequeno y homogeneo: entre 400 y 1768 imagenes de un rango de edad y caracteristicas acotados, lo que limita la diversidad de resultados y puede amplificar sesgos.
- Repositorio sin traccion: cero descargas y cero likes en el momento de la consulta, sin senales de mantenimiento o validacion por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/Joswar0310/Nudify
