# CharlieBT/kd31-tp3x

## Resumen

CharlieBT/kd31-tp3x es un modelo de 31.273.088.876 parametros (aproximadamente 31,3 mil millones) publicado en Hugging Face bajo licencia Apache 2.0 y acceso restringido. Se trata de un fine-tune del modelo danyloooah/reax-g2-soup2, etiquetado con la familia gemma4 y orientado a tareas de image-text-to-text y clasificacion de texto, segun los tags del repositorio y el pipeline declarado (text-classification). El autor es el usuario CharlieBT y el repositorio se creo el 28 de noviembre de 2026.

El modelo se distribuye en formato safetensors y es compatible con la libreria transformers, ademas de estar marcado como compatible con endpoints. El tamano del repositorio es de 62,6 GB, lo que es coherente con pesos en precision de 16 bits para un modelo de 31 mil millones de parametros. La informacion publica disponible es muy limitada: no se detallan idiomas soportados, composicion del dataset de entrenamiento, ni resultados de evaluacion.

Su relevancia actual es limitada y de nicho: se trata de una publicacion reciente, sin descargas ni interacciones registradas, y con acceso condicionado. Resulta de interes para quienes sigan la estela de la familia Gemma 4 y los fine-tunes derivados de modelos "soup" (mezclas de pesos), pero no debe considerarse un modelo con validacion publica de rendimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (etiquetado como gemma4 en los tags; sin detalle de capas ni atencion) |
| Parametros totales | 31.273.088.876 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se distribuyen pesos safetensors; no se listan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna. Los tags del repositorio indican la familia gemma4, lo que sugiere una arquitectura transformer decoder-only propia de esa familia, pero no se confirma el numero de capas, dimensiones ocultas, tipo de atencion ni si incorpora componentes hibridos o de mezcla de expertos. El pipeline declarado es text-classification, aunque los tags incluyen tambien image-text-to-text, lo que apunta a un modelo multimodal o a un fine-tune sobre una base multimodal.

El modelo es un fine-tune del checkpoint danyloooah/reax-g2-soup2, que a su vez parece ser el resultado de una mezcla de pesos ("soup"). No se publican datos sobre el volumen de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO o ajuste supervisado. Tampoco se documentan innovaciones tecnicas como decodificacion especulativa o atencion lineal.

## Capacidades

- Clasificacion de texto: el pipeline declarado es text-classification, por lo que el uso previsto principal es la asignacion de etiquetas a secuencias de texto.
- Procesamiento image-text-to-text: los tags incluyen esta modalidad, lo que sugiere capacidad de manejar entradas conjuntas de imagen y texto, aunque no se documenta el mecanismo.
- Generacion de texto: al derivar de un modelo de lenguaje de 31 mil millones de parametros, es plausible que conserve capacidades generativas, pero no se confirma en la ficha del repositorio.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (no se listan idiomas).
- Capacidades especiales (modo thinking, vision, audio): solo se insinua vision por el tag image-text-to-text; el resto no disponible.

## Casos de uso

- Clasificacion de documentos extensos: dado su tamano de 31 mil millones de parametros, puede emplearse para etiquetar documentos largos o contratos en pipelines de gestion documental, siempre que se valide su contexto real (no documentado).
- Moderacion de contenido multimodal: el tag image-text-to-text permite plantear su uso para clasificar publicaciones que combinan imagen y texto en plataformas sociales, asignando categorias de riesgo.
- Etiquetado de datasets para investigacion: util como anotador automatico en la construccion de corpus clasificados, reduciendo el esfuerzo manual en proyectos de NLP.
- Filtrado de resenas de producto: clasificacion de resenas en categorias (positiva, negativa, tematica) en sistemas de comercio electronico, aprovechando su capacidad de procesar texto en lote.
- Enrutamiento de tickets de soporte: clasificacion de incidencias entrantes por departamento o prioridad en mesas de ayuda, con la salvedad de que requiere validacion previa del rendimiento.
- Analisis de imagenes medicas o tecnicas con texto asociado: en entornos de investigacion, para clasificar pares imagen-informe, aunque sin validacion clinica documentada no es apto para produccion sanitaria.
- Fine-tuning posterior: al ser un checkpoint base con licencia Apache 2.0, puede servir como punto de partida para ajustes especificos en dominios verticales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos en fp16 (62,6 GB de repositorio), se requieren al menos 64 GB de VRAM para cargar el modelo completo; en fp32 seria inviable en GPUs convencionales.
- Cuantizacion: al no distribuirse variantes GGUF, AWQ ni GPTQ, la cuantizacion requeriria conversion manual; una cuantizacion a 8 bits reduciria la huella a unos 32 GB y a 4 bits a unos 16-18 GB, pero no hay artefactos oficiales.
- GPU recomendadas: A100 80 GB, H100 80 GB o configuraciones multi-GPU (por ejemplo, 2x A100 40 GB) para fp16. En consumer GPU, una RTX 4090 de 24 GB no puede cargar el modelo completo en fp16; solo seria viable con cuantizacion agresiva a 4 bits.
- Opciones de despliegue: transformers (soporte nativo declarado), endpoints compatibles; vLLM, TGI o llama.cpp no estan confirmados para este checkpoint concreto.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| CharlieBT/kd31-tp3x | 31,3 B | no disponible | Apache 2.0 | Gated, 0 descargas | Fine-tune de reax-g2-soup2, sin benchmarks |
| danyloooah/reax-g2-soup2 | no disponible | no disponible | no disponible | Modelo base referenciado | Origen del fine-tune; sin datos publicos en esta ficha |
| Gemma 2 27B (referencia de familia) | 27 B | 8K (segun version) | Gemma license | Publico | Alternativa de tamano similar en la estela Gemma, con benchmarks publicos |
| Qwen2.5 32B (referencia de tamano) | 32,5 B | 128K | Apache 2.0 | Publico | Alternativa abierta de tamano comparable con evaluacion publicada |

La comparativa con Gemma 2 27B y Qwen2.5 32B se ofrece solo como referencia de categoria y tamano; no se dispone de datos de rendimiento de kd31-tp3x para establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- Ausencia total de benchmarks publicados: no hay evidencia de rendimiento en MMLU, HumanEval, GSM8K ni tareas de clasificacion, lo que impide recomendarlo para produccion sin evaluacion propia.
- Acceso restringido (gated): requiere aceptar condiciones en Hugging Face, lo que anade friccion para su uso y distribucion.
- Documentacion minima: sin idiomas, contexto, dataset ni detalles de entrenamiento, es imposible evaluar sesgos conocidos o cobertura linguistica.
- Riesgo de alucinacion: inherente a los modelos generativos de esta escala; si se usa para clasificacion, puede producir etiquetas inconsistentes en entradas fuera de distribucion.
- Licencia Apache 2.0: permite uso comercial, pero al ser un fine-tune de un modelo base (reax-g2-soup2) cuyas condiciones no se detallan, conviene verificar la cadena de licencias antes de explotarlo comercialmente.
- Origen "soup" del modelo base: las mezclas de pesos pueden heredar comportamientos impredecibles y dificiles de trazar.
- Sin garantias de soporte: repositorio con 0 descargas y 0 likes, creado y actualizado en el mismo dia, sin comunidad ni mantenimiento documentado.
- Requisitos de hardware elevados: 62,6 GB de pesos limitan su despliegue a infraestructura con GPUs de 80 GB o cuantizacion manual.

## Enlaces

- Hugging Face: https://huggingface.co/CharlieBT/kd31-tp3x
- Modelo base: https://huggingface.co/danyloooah/reax-g2-soup2
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la informacion proporcionada.
