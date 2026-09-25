# alibaba-pai/Qwen-Image-2.1-Fun-Acc-LoRAs

## Resumen

Qwen-Image-2.1-Fun-Acc-LoRAs es un conjunto de adaptadores LoRA publicado por alibaba-pai que acelera la inferencia del modelo de difusion Qwen-Image-2.1. El adaptador se entrena mediante Parallel Decoding Distillation (PDD), una tecnica de destilacion que reduce el numero de evaluaciones de funcion (NFE) necesarias para generar una imagen: pasa de las 40 NFE del modelo profesor a solo 4 NFE. El resultado es un modelo capaz de hacer text-to-image y edicion de imagen por instrucciones con un coste de muestreo aproximadamente diez veces menor.

Tecnicamente no es un modelo autonomo, sino un adaptador de bajo rango (rank=64, network_alpha=64, BF16) que se carga sobre los pesos de Qwen-Image-2.1. El repositorio ocupa 0,5 GB y contiene el fichero `models/Qwen-Image-2.1-Fun-Acc-4Step.safetensors`, junto con scripts de ejemplo para Diffusers y para el framework VideoX-Fun. Su relevancia actual es practica: en generacion de imagenes, el cuello de botella de latencia suele estar en el numero de pasos de muestreo, y una destilacion agresiva a 4 pasos hace viable el despliegue interactivo.

La model card no incluye especificaciones de parametros del modelo base, idiomas soportados ni resultados numericos de benchmarks. La informacion disponible se limita a la descripcion del metodo, la tabla del artefacto publicado y comparaciones visuales cualitativas frente al profesor a 40 NFE y frente a Viggle v0.1 full a 4 NFE.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre un modelo de difusion (Qwen-Image-2.1); detalles de la arquitectura del modelo base no disponibles |
| Parametros totales | No disponible (rank=64, network_alpha=64; repositorio de 0,5 GB en BF16) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (el modelo base es text-to-image, no un LLM) |
| Tipos de cuantizacion | No disponible (los pesos publicados estan en BF16) |
| Idiomas soportados | No disponible |
| Licencia | qwen-research (etiquetada como `other` en HuggingFace) |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

El artefacto publicado es un adaptador LoRA, no un transformer completo. Se aplica sobre Qwen-Image-2.1, un modelo de difusion para generacion y edicion de imagen por instrucciones. La innovacion central es Parallel Decoding Distillation (PDD): una destilacion que permite muestrear con tan solo 4 NFE manteniendo el comportamiento del modelo profesor, que opera a 40 NFE. El adaptador se publica con `rank=64` y `network_alpha=64` en BF16.

La informacion disponible no detalla el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron fases de RLHF o DPO, algo poco habitual en modelos de difusion. Los prompts usados en las comparaciones visuales de la model card provienen del articulo de PDD, mientras que los ejemplos de edicion proceden del repositorio de Qwen-Image-2.1 y de los ejemplos de demostracion de Viggle.

## Capacidades

- Generacion de imagen a partir de texto (text-to-image) en 4 NFE.
- Edicion de imagen guiada por instrucciones, con imagenes de referencia multiples: la model card muestra ejemplos con dos referencias (mujer y gato) y con tres referencias (persona, gato y pajaro).
- Aceleracion de la inferencia del modelo base: reduce el muestreo de 40 NFE (profesor) a 4 NFE.
- Compatibilidad con dos rutas de ejecucion: scripts para Diffusers (`predict_t2i.py`, `predict_t2i_edit.py` con `qwenimage21_pdd.py` y `lora_utils_pdd.py`) y el pipeline `QwenImage21Pipeline` de VideoX-Fun.
- No se documenta soporte de tool calling, agentes, capacidades multilingues explicitas, vision de entrada adicional ni modos de razonamiento: son conceptos propios de modelos de lenguaje y no aplican a este artefacto.

## Casos de uso

- Prototipado rapido de interfaces de generacion de imagen: gracias a las 4 NFE en lugar de 40, el ciclo prompt-resultado se acorta y permite iterar en diseno de producto con tiempos de espera bajos.
- Edicion de fotografia por instrucciones: el adaptador permite modificar una imagen existente siguiendo una orden en lenguaje natural, util para retoque semiautomatico en flujos de marketing.
- Composicion con multiples referencias: los ejemplos de la model card con dos y tres imagenes de referencia apuntan a casos como insertar un producto en una escena o combinar varios sujetos en una sola imagen.
- Generacion de material grafico para catalogos de comercio electronico: a partir de una descripcion textual se pueden producir variantes de imagen de producto reduciendo el coste por inferencia al bajar los pasos de muestreo.
- Integracion en pipelines de VideoX-Fun: el adaptador se puede cargar con `QwenImage21Pipeline`, lo que permite incorporarlo a infraestructuras existentes de generacion basadas en ese framework.
- Evaluacion comparativa de tecnicas de destilacion: sirve como referencia reproducible (con semillas documentadas, por ejemplo seed42, seed43, seed44 y seed45) para investigacion sobre destilacion de decodificacion paralela.
- Demostraciones interactivas de bajo coste: al requerir solo 4 NFE, es adecuado para espacios de HuggingFace o demos publicas con presupuesto de computo limitado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numericos en la informacion disponible. La model card unicamente incluye comparaciones visuales cualitativas entre tres configuraciones:

| Configuracion | NFE | Evidencia publicada |
|---|---|---|
| Profesor (Qwen-Image-2.1) | 40 | Imagenes de referencia en `results/teacher/` |
| Ours / PDD LoRA | 4 | Imagenes en `results/ours/` |
| Viggle v0.1 full | 4 | Imagenes en `results/viggle_v01/` |

No se proporcionan metricas objetivas como FID, CLIP score, SSIM ni valores de similitud perceptual entre el profesor y las salidas destiladas. Tampoco se publican mediciones de latencia o throughput.

## Requisitos de hardware

- No se proporcionan cifras oficiales de VRAM en la informacion disponible.
- El repositorio del adaptador ocupa 0,5 GB, pero la inferencia requiere cargar adicionalmente el modelo base Qwen-Image-2.1, cuyos requisitos de memoria no se especifican en esta ficha fuente.
- La reduccion de 40 NFE a 4 NFE implica aproximadamente una decima parte del trabajo de muestreo del modelo profesor, lo que reduce el coste computacional por imagen, aunque no disminuye el peso del modelo en memoria.
- GPU recomendadas: no disponible. No se indica compatibilidad con A100, H100, RTX 4090 ni otras tarjetas.
- Viabilidad en GPU de consumo: no disponible.
- Opciones de despliegue documentadas: scripts de Diffusers y el pipeline `QwenImage21Pipeline` de VideoX-Fun. No se mencionan vLLM, llama.cpp, Ollama ni TGI (herramientas orientadas a modelos de lenguaje, no aplicables directamente a difusion).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | NFE | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Qwen-Image-2.1-Fun-Acc-LoRAs | LoRA de destilacion (PDD) | 4 | No disponible (adaptador rank 64) | No aplica | qwen-research | HuggingFace, 14 likes, 0 descargas registradas |
| Qwen-Image-2.1 (profesor) | Modelo de difusion base | 40 | No disponible | No aplica | no disponible en esta informacion | HuggingFace (Qwen/Qwen-Image-2.1) |
| Viggle v0.1 full | Modelo de difusion | 4 | No disponible | No aplica | no disponible en esta informacion | Usado como linea base en la model card |

No se dispone de datos de parametros, contexto ni licencia de las alternativas mas alla de lo que aparece en las comparaciones visuales de la model card.

## Limitaciones y advertencias

- La licencia es `qwen-research`, etiquetada como `other` en HuggingFace. Es una licencia de investigacion: antes de cualquier uso comercial es imprescindible revisar el fichero LICENSE del repositorio y los terminos del modelo base Qwen-Image-2.1.
- No hay resultados numericos de fidelidad frente al profesor. Las comparaciones son visuales y cualitativas, por lo que la perdida de calidad introducida por la destilacion a 4 NFE no esta cuantificada.
- La model card no documenta sesgos del modelo base ni del adaptador, ni medidas de mitigacion.
- Riesgo de alucinacion visual: como todo modelo generativo de imagen, puede producir detalles inexistentes o deformaciones, especialmente en manos, texto dentro de la imagen y rostros.
- No se especifican idiomas soportados para los prompts; el soporte multilingue del modelo base no esta confirmado en la informacion disponible.
- No se indican requisitos de VRAM ni configuraciones de hardware validadas, lo que dificulta planificar un despliegue en produccion.
- El adaptador depende completamente del modelo base: cualquier cambio o actualizacion de Qwen-Image-2.1 puede afectar a la compatibilidad.
- El repositorio tiene 0 descargas registradas y fue creado el 24 de septiembre de 2026, por lo que la validacion por parte de la comunidad es practicamente inexistente.
- Las rutas de ejecucion dependen de ficheros auxiliares concretos (`qwenimage21_pdd.py`, `lora_utils_pdd.py`) que deben mantenerse junto a los scripts, o de un checkout de VideoX-Fun que exponga `QwenImage21Pipeline`.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/alibaba-pai/Qwen-Image-2.1-Fun-Acc-LoRAs
- Modelo base: https://huggingface.co/Qwen/Qwen-Image-2.1
- Repositorio GitHub de VideoX-Fun: https://github.com/aigc-apps/VideoX-Fun
- Repositorio GitHub de Qwen-Image-2.1: https://github.com/QwenLM/Qwen-Image-2.1
- Datos de prompt rewrite de Qwen-Image-2.1: https://github.com/QwenLM/Qwen-Image-2.1/tree/main/prompt_rewrite/data
- Ejemplos de Viggle: https://huggingface.co/spaces/Viggle/Qwen-Image-2.1-viggle-turbo/tree/main/examples
- Articulo de Parallel Decoding Distillation (PDD): https://arxiv.org/abs/2607.26004
- Fichero de licencia del repositorio: LICENSE (incluido en el repositorio de HuggingFace)
- Pesos del adaptador: models/Qwen-Image-2.1-Fun-Acc-4Step.safetensors (incluido en el repositorio de HuggingFace)
