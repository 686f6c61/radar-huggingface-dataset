# pdmd2026/pdmd_4NFE_lora

## Resumen

PDMD 4-NFE LoRA es un adaptador LoRA de destilación para generación de vídeo a partir de texto, publicado por el usuario pdmd2026 (Zimo Wang) y derivado del modelo base MiniMaxAI/MiniMax-H3. No es un modelo autónomo: es un conjunto de pesos LoRA que se aplica sobre el transformer del modelo base (`MiniMaxH3Transformer3DModel`) para reducir el coste de muestreo de decenas de pasos de denoising a solo 4 pasos (4 NFE, number of function evaluations). El resto de componentes del pipeline (VAE, VAE de audio, schedulers, text encoder y processor) se reutilizan sin cambios desde MiniMax-H3.

La técnica empleada es PDMD (Projected Distribution Matching Distillation), descrita en el artículo arXiv:2609.35768. Según la página del proyecto, la innovación clave consiste en eliminar una dirección del update de DMD (Distribution Matching Distillation) para evitar el colapso que sufre la destilación a cuatro pasos. El adaptador tiene rango 128, alpha 128 y precisión bf16, con 312 pares LoRA (624 tensores), y se distribuye bajo licencia Apache 2.0 en formato safetensors compatible con la librería diffusers.

El interés práctico del modelo es la aceleración de la inferencia en pipelines de vídeo: pasar de un muestreo completo del modelo base a 4 pasos reduce drásticamente el tiempo de generación, con un coste de memoria adicional de aproximadamente 1,38 GB en bf16 sobre el modelo base. Existe también una versión con los pesos completos del transformer destilado (`pdmd2026/pdmd_4NFE_full`) y una variante de 2 pasos (`pdmd2026/pdmd_2NFE_lora`).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre transformer de difusion 3D para video (`MiniMaxH3Transformer3DModel`); no es un modelo autonomo |
| Parametros totales | Aproximadamente 692 M en el adaptador (derivado de 1.383.680.592 bytes en bf16); parametros del modelo base MiniMax-H3: no disponible |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible; la condicion de texto depende del text encoder del modelo base MiniMax-H3 |
| Tipos de cuantizacion | Adaptador distribuido unicamente en bf16; cuantizaciones del modelo base: no disponible |
| Idiomas soportados | No disponible |
| Licencia | apache-2.0 (solo el adaptador; la licencia del modelo base debe consultarse por separado) |
| Formato de pesos | safetensors (`lora_model_0.safetensors`, 1.383.680.592 bytes) mas `lora_model_0.safetensors.json` (95.196 bytes) con metadatos de claves y formas |
| Rank / alpha del LoRA | 128 / 128 (lora_scale = alpha / rank = 1,0) |
| Numero de modulos adaptados | 312 pares LoRA (624 tensores) |
| Pasos de inferencia | 4 pasos de denoising (4 NFE) |
| Scheduler | Configuracion publicada del modelo base, shift 12 / 3 |

## Arquitectura y entrenamiento

El adaptador se inyecta exclusivamente en el transformer del modelo base. Las claves de los tensores siguen el patron `transformer.<module>.lora_A.weight` y `transformer.<module>.lora_B.weight`, donde `<module>.weight` es el parametro correspondiente de `MiniMaxH3Transformer3DModel`. La regla de fusion documentada por el autor es `W_base += lora_scale * (lora_B @ lora_A)`, con `lora_scale = 1,0`, y queda almacenada en los metadatos del fichero safetensors. Se trata por tanto de una adaptacion de bajo rango sobre las matrices de proyeccion del transformer, no de un cambio de arquitectura: el modelo sigue siendo un transformer de difusion para video.

El entrenamiento consistio en una destilacion de 4 pasos (4 NFE) desde MiniMax-H3 mediante PDMD (Projected Distribution Matching Distillation), un metodo de destilacion por coincidencia de distribuciones. Segun la descripcion del proyecto, la modificacion central respecto a DMD consiste en eliminar una direccion del update de DMD, lo que evita el colapso del estudiante cuando se destila a cuatro pasos. No se especifican en la informacion disponible el numero de tokens o clips de entrenamiento, la composicion del dataset, ni si se emplearon tecnicas adicionales de RLHF o DPO. El paper asociado (arXiv:2609.35768) esta firmado por Zimo Wang, Junkun Yuan, Angtian Wang, Haotian Yang, Canyu Zhang, Siyuan Yuan, Xingchang Huang, Bo Liu, Yizhi Wang, Yiding Yang, Chongyang Ma y Gordon Guocheng Qian, y esta clasificado en cs.CV.

## Capacidades

- Generacion de video a partir de texto (text-to-video) mediante el pipeline de diffusers, con el mismo condicionamiento textual que MiniMax-H3.
- Muestreo acelerado: genera en 4 pasos de denoising en lugar del regimen completo del modelo base, usando el scheduler con shift 12 / 3.
- Reutilizacion del pipeline completo del modelo base, incluidos VAE de video, VAE de audio, schedulers, text encoder y processor.
- Compatibilidad con el ecosistema diffusers: el repositorio declara `library_name: diffusers` y las claves estan pensadas para fusionarse sobre el transformer del modelo base.
- Variante de pesos completos disponible para quien prefiera no aplicar un adaptador (`pdmd2026/pdmd_4NFE_full`).
- No se documentan en la informacion disponible capacidades de tool calling, function calling, agentes, modo de razonamiento explicito ni soporte multilingue declarado.
- Capacidad de audio: el pipeline base incluye un VAE de audio entre los componentes reutilizados; el adaptador no modifica ese componente, por lo que sus capacidades de audio son las heredadas del modelo base.

## Casos de uso

- Prototipado rapido de video generativo: los 4 pasos de denoising permiten iterar sobre prompts y estilos en mucho menos tiempo que el modelo base, lo que resulta util en fases de exploracion creativa donde se prueban decenas de variaciones.
- Previsualizacion en produccion audiovisual: generar borradores de planos o storyboards a partir de descripciones textuales antes de comprometer recursos en un render de mayor calidad.
- Generacion de clips para redes sociales: creacion de video corto a partir de texto con un coste de inferencia reducido, adecuado para pipelines con alto volumen de peticiones.
- Integracion en herramientas de edicion y creacion de contenido: al ser un adaptador compatible con diffusers, puede incorporarse en aplicaciones que ya usan el ecosistema diffusers sin reescribir el pipeline.
- Investigacion en destilacion de modelos de difusion: sirve como referencia reproducible del metodo PDMD, con pesos publicos, paper y pagina de proyecto, para comparar contra DMD y otras tecnicas de destilacion a pocos pasos.
- Ablacion de numero de pasos: comparar esta variante de 4 NFE con la de 2 NFE del mismo autor permite estudiar el compromiso entre calidad y coste computacional en un mismo modelo base.
- Despliegue en entornos con presupuesto de computo limitado: al reducir las evaluaciones del transformer de decenas a 4, se baja el coste por generacion en GPUs de gama media o en instancias cloud con facturacion por tiempo.
- Generacion de video con pista de audio: el pipeline base conserva el VAE de audio sin cambios, de modo que el flujo completo de generacion conjunta de video y audio sigue disponible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye tablas comparativas de metricas de video (FVD, CLIP score u otras), y las busquedas realizadas solo hacen referencia a cobertura de benchmarks sin datos concretos. Tampoco se aportan cifras de latencia o throughput medidas.

## Requisitos de hardware

- Tamano del repositorio completo: 4,2 GB segun Hugging Face. El fichero del adaptador es de 1.383.680.592 bytes (aproximadamente 1,38 GB) en bf16, mas 95.196 bytes de metadatos.
- Memoria adicional sobre el modelo base: el adaptador anade en torno a 1,38 GB en bf16 al cargar los pesos LoRA; fusionado en los pesos base, el requisito adicional es el mismo orden de magnitud.
- VRAM total necesaria para inferencia: no disponible. Depende enteramente del tamano y la precision con que se cargue MiniMax-H3 (transformer, VAE de video, VAE de audio y text encoder), dato que no se proporciona en la informacion disponible.
- GPU recomendadas: no disponible en la informacion proporcionada; se recomienda consultar los requisitos publicados para MiniMaxAI/MiniMax-H3.
- Encaje en GPU de consumo: no disponible. No se puede confirmar si el pipeline completo cabe en tarjetas como RTX 4090 o RTX 3090 sin conocer el tamano del modelo base.
- Opciones de despliegue: diffusers es la libreria declarada por el autor. No se documentan integraciones especificas con vLLM, llama.cpp, Ollama ni TGI (y, por el tipo de modelo, las tres ultimas no son aplicables de forma estandar).
- Latencia y throughput estimados: no disponibles. La unica cifra objetiva es la reduccion de pasos de denoising a 4 NFE frente al muestreo completo del modelo base, con el scheduler configurado a shift 12 / 3.

## Comparativa con modelos similares

| Modelo | Tipo | Pasos (NFE) | Tamano | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pdmd2026/pdmd_4NFE_lora | LoRA sobre MiniMax-H3 | 4 | 1,38 GB (adaptador, bf16) | apache-2.0 | Hugging Face, diffusers |
| pdmd2026/pdmd_2NFE_lora | LoRA sobre MiniMax-H3 | 2 | no disponible | no disponible en la informacion disponible | Hugging Face |
| pdmd2026/pdmd_4NFE_full | Pesos completos del transformer destilado | 4 | no disponible | no disponible en la informacion disponible | Hugging Face |
| MiniMaxAI/MiniMax-H3 | Modelo base de difusion de video | Regimen completo del modelo | no disponible | no disponible en la informacion disponible | Hugging Face |

No se dispone de datos de rendimiento comparado (metricas de calidad, latencia o VRAM) entre estas variantes en la informacion proporcionada. Las alternativas identificadas pertenecen al mismo autor y al mismo modelo base, por lo que la comparacion significativa se limita al numero de pasos y al formato de distribucion (adaptador frente a pesos completos).

## Limitaciones y advertencias

- No es un modelo autonomo: requiere cargar MiniMaxAI/MiniMax-H3 y fusionar el adaptador sobre `MiniMaxH3Transformer3DModel`. Sin el modelo base, el fichero safetensors no es utilizable.
- La licencia Apache 2.0 declarada corresponde al repositorio del adaptador. La licencia del modelo base MiniMax-H3 no se especifica en la informacion disponible y debe verificarse antes de un uso comercial del pipeline completo.
- La informacion sobre idiomas soportados esta vacia en la ficha de Hugging Face, por lo que no se puede confirmar cobertura multilingue mas alla de la que herede el text encoder del modelo base.
- Destilacion a 4 pasos: por construccion, este tipo de destilaciones suelen sacrificar diversidad y detalle frente al muestreo completo. No se aportan metricas que cuantifiquen esa posible perdida de calidad.
- Riesgo de artefactos y alucinacion visual inherente a los modelos de difusion de video: coherencia temporal imperfecta, deformaciones en objetos en movimiento y desviaciones respecto al prompt, en grado no cuantificado en la informacion disponible.
- El propio paper describe el problema del colapso en la destilacion a cuatro pasos como motivacion del metodo, lo que indica que el regimen de pocos pasos es sensible al algoritmo de destilacion empleado.
- No hay datos publicados de benchmarks, latencia ni VRAM, lo que dificulta planificar un despliegue en produccion sin realizar pruebas propias.
- La fecha de creacion del repositorio (29 de septiembre de 2026) y el numero de descargas (796) y likes (12) indican un modelo reciente y con adopcion limitada, sin un historial amplio de validacion por parte de la comunidad.
- Existe una discrepancia no explicada entre el tamano del repositorio (4,2 GB) y el tamano del unico fichero de pesos documentado (1,38 GB); conviene verificar el contenido real del repositorio antes de descargarlo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/pdmd2026/pdmd_4NFE_lora
- Perfil del autor: https://huggingface.co/pdmd2026
- Version de pesos completos: https://huggingface.co/pdmd2026/pdmd_4NFE_full
- Version de 2 pasos: https://huggingface.co/pdmd2026/pdmd_2NFE_lora
- Modelo base: https://huggingface.co/MiniMaxAI/MiniMax-H3
- Paper (arXiv): https://arxiv.org/abs/2609.35768
- Pagina del proyecto: https://pdmd2026.github.io/
- Ficha en AI Market Cap: https://aimarketcap.tech/models/pdmd2026-pdmd-4nfe-lora
- Cita en AGI Hunt: https://agihunt.info/en/p/1a102a3dfe8a82e0fe25d76a5cf
