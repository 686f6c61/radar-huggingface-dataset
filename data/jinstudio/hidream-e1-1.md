# Jinstudio/HiDream-E1-1

## Resumen

HiDream-E1-1 es un modelo de edición de imágenes por instrucciones en lenguaje natural, desarrollado por HiDream.ai (publicado bajo la cuenta Jinstudio). Se construye como un ajuste fino del modelo generativo HiDream-I1-Full y resuelve la tarea de edición guiada: dada una imagen de entrada y una instrucción textual, produce una versión editada coherente con la petición. Es relevante porque traslada las capacidades del transformer de difusión disperso de HiDream-I1 al terreno de la edición de imagen, un área donde hasta ahora los modelos abiertos quedaban por detrás de alternativas propietarias como Gemini-2.0-Flash.

El modelo se distribuye a través de la librería diffusers, con un pipeline específico (`HiDreamImageEditingPipeline`), y cuenta con aproximadamente 17.105.733.184 parámetros en el transformador principal, según los pesos en safetensors publicados. El repositorio ocupa 47,2 GB e incluye los pesos del transformador; los codificadores de texto y el VAE se descargan por separado.

La ficha del modelo se publica en inglés y el modelo está pensado para instrucciones en inglés. La licencia del transformador es MIT, aunque reutiliza componentes de terceros (VAE de FLUX.1 [schnell] y codificadores de texto de T5-v1_1-xxl y Llama-3.1-8B-Instruct) sujetos a sus propias licencias, lo que condiciona su uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion disperso (Sparse Diffusion Transformer), ajustado desde HiDream-I1-Full |
| Parametros totales | 17.105.733.184 (~17,1 mil millones), segun pesos safetensors |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (pesos safetensors en precision nativa) |
| Idiomas soportados | en (ingles) |
| Licencia | MIT para el transformador; componentes con licencias propias (Apache 2.0 para T5-v1_1-xxl y VAE de FLUX.1 [schnell]; Llama 3.1 Community License para Llama-3.1-8B-Instruct) |
| Formato de pesos | safetensors (formato diffusers) |

## Arquitectura y entrenamiento

HiDream-E1-1 se apoya en la arquitectura de HiDream-I1, descrita en el informe tecnico como un "Sparse Diffusion Transformer" (transformer de difusion disperso) de alta eficiencia. Se trata de un modelo de difusion para generacion de imagen que incorpora mecanismos de dispersion (sparsity) en el transformer para reducir el coste computacional. El modelo de edicion reutiliza el VAE de FLUX.1 [schnell] y emplea dos codificadores de texto: `google/t5-v1_1-xxl` y `meta-llama/Meta-Llama-3.1-8B-Instruct`, lo que le permite procesar instrucciones complejas en lenguaje natural. La inferencia requiere Flash Attention y una version reciente de diffusers, con CUDA recomendado en 12.4.

No se detalla en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO sobre el modelo de edicion. El modelo base es `HiDream-ai/HiDream-I1-Full` y la relacion declarada es de ajuste fino (`finetune`). La evaluacion publicada se centra en los benchmarks EmuEdit y ReasonEdit, lo que sugiere un entrenamiento orientado a instrucciones de edicion diversas (edicion global, adicion de objetos, edicion de texto, sustitucion de fondo, cambio de color, transferencia de estilo, eliminacion de objetos y edicion local).

## Capacidades

- Edicion de imagen guiada por instrucciones en lenguaje natural (pipeline any-to-any: imagen + texto a imagen).
- Edicion global de la imagen (cambios de escena o composicion general).
- Adicion de objetos a una imagen existente.
- Edicion de texto dentro de la imagen (insercion y modificacion de texto renderizado).
- Sustitucion de fondo.
- Cambio de color de elementos concretos.
- Transferencia de estilo.
- Eliminacion de objetos.
- Edicion local sobre regiones especificas de la imagen.
- Integracion con diffusers y demo interactiva mediante Gradio.
- No se ha documentado soporte de tool calling, agentes, modo "thinking" ni procesamiento de audio.
- Capacidad multilingue limitada al ingles segun la ficha.

## Casos de uso

- Retoque fotografico de producto en comercio electronico: se puede subir una foto de catalogo y pedir por texto la eliminacion del fondo, el cambio de color del producto o la adicion de un accesorio, reduciendo el trabajo manual de edicion y manteniendo coherencia visual entre imagenes.
- Generacion de creatividades de marketing: a partir de una imagen base, el modelo aplica cambios de estilo y composicion guiados por texto para producir variantes de anuncios sin rehacer cada pieza desde cero.
- Edicion de texto en imagenes para localizacion: el modelo permite modificar rotulos, carteles o etiquetas renderizadas, util para adaptar material grafico a campanas o idiomas concretos.
- Aumento de datos para entrenamiento de vision por computador: generar variaciones controladas de imagenes (fondos, colores, objetos anadidos) para ampliar datasets de forma dirigida y con etiquetas coherentes.
- Creacion de contenido para redes sociales: aplicar estilos, eliminar elementos no deseados y sustituir fondos para producir piezas listas para publicacion.
- Visualizacion inmobiliaria y de interiores: cambiar acabados, colores de paredes o mobiliario sobre una fotografia existente para mostrar alternativas a un cliente.
- Automatizacion de flujos de produccion grafica en CI/CD de contenido: integrar el pipeline de diffusers en un servicio que reciba instrucciones y devuelva imagenes editadas de forma programatica, con Flash Attention para acelerar la inferencia.

## Benchmarks y rendimiento

Resultados declarados en la model card sobre EmuEdit y ReasonEdit (cuanto mas alto, mejor). La tabla compara HiDream-E1-1 con HiDream-E1 y con otros modelos de edicion:

| Modelo | EmuEdit Global | EmuEdit Add | EmuEdit Text | EmuEdit BG | EmuEdit Color | EmuEdit Style | EmuEdit Remove | EmuEdit Local | EmuEdit Average | ReasonEdit |
|---|---|---|---|---|---|---|---|---|---|---|
| OmniGen | 1,37 | 2,09 | 2,31 | 0,66 | 4,26 | 2,36 | 4,73 | 2,10 | 2,67 | 7,36 |
| MagicBrush | 4,06 | 3,54 | 0,55 | 3,26 | 3,83 | 2,07 | 2,70 | 3,28 | 2,81 | 1,75 |
| UltraEdit | 5,31 | 5,19 | 1,50 | 4,33 | 4,50 | 5,71 | 2,63 | 4,58 | 4,07 | 2,89 |
| Gemini-2.0-Flash | 4,87 | 7,71 | 6,30 | 5,10 | 7,30 | 3,33 | 5,94 | 6,29 | 5,99 | 6,95 |
| HiDream-E1 | 5,32 | 6,98 | 6,45 | 5,01 | 7,57 | 6,49 | 5,99 | 6,35 | 6,40 | 7,54 |
| HiDream-E1.1 | 7,47 | 7,97 | 7,49 | 7,32 | 7,97 | 7,84 | 7,51 | 6,80 | 7,57 | 7,70 |

Segun estos datos, la version E1.1 supera a HiDream-E1 y a Gemini-2.0-Flash en la media de EmuEdit y en ReasonEdit. No se han publicado resultados de otros benchmarks (MMLU, HumanEval, GSM8K) en la informacion disponible, ya que el modelo es de edicion de imagen y no de texto.

## Requisitos de hardware

Las siguientes cifras son estimaciones derivadas del numero de parametros y de los componente reutilizados, no datos publicados por el autor:

- Peso del transformador en fp16/bf16: en torno a 34 GB solo para los 17,1 mil millones de parametros.
- Codificadores de texto adicionales: T5-v1_1-xxl (aproximadamente 11 mil millones de parametros, ~22 GB en fp16) y Llama-3.1-8B-Instruct (~16 GB en fp16), mas el VAE de FLUX.1 [schnell].
- VRAM estimada para inferencia completa: del orden de 70-80 GB en precision nativa si se cargan todos los componentes a la vez; con offloading secuencial o cuantizacion puede reducirse sustancialmente.
- GPU recomendadas: A100 80 GB, H100 80 GB o similar para cargar el pipeline completo sin offloading agresivo.
- GPU de consumo: cabe en una RTX 4090 (24 GB) solo con cuantizacion y offloading por etapas, con penalizacion de latencia; no es un modelo pensado para ejecucion comoda en GPU de consumo.
- Opciones de despliegue: diffusers con `HiDreamImageEditingPipeline`, Flash Attention obligatorio, CUDA 12.4 recomendado; demo Gradio incluida en el repositorio.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Licencia | EmuEdit Average | ReasonEdit | Disponibilidad |
|---|---|---|---|---|---|---|
| HiDream-E1-1 | ~17,1 mil millones | Transformer de difusion disperso | MIT (componentes con licencias propias) | 7,57 | 7,70 | Pesos abiertos en HuggingFace |
| HiDream-E1 | no disponible | Transformer de difusion | MIT | 6,40 | 7,54 | Pesos abiertos |
| OmniGen | no disponible | Modelo unificado (any-to-any) | no disponible | 2,67 | 7,36 | Pesos abiertos |
| UltraEdit | no disponible | Modelo de edicion | no disponible | 4,07 | 2,89 | Pesos abiertos |
| Gemini-2.0-Flash | no disponible | Modelo multimodal propietario | propietaria | 5,99 | 6,95 | API de Google |

Los datos de parametros y licencia de los modelos comparables no se detallan en la informacion proporcionada.

## Limitaciones y advertencias

- Idioma: el modelo esta entrenado y documentado para ingles; el rendimiento con instrucciones en castellano u otros idiomas no esta garantizado.
- Riesgo de alucinacion visual: como modelo generativo, puede introducir elementos no solicitados o alterar regiones de la imagen que deberian permanecer intactas.
- Sesgos: no se documenta analisis de sesgo; cabe esperar sesgos heredados de los datos de entrenamiento de HiDream-I1 y de los codificadores de texto (T5 y Llama).
- Licencia del transformador MIT, pero los componentes reutilizados imponen condiciones: el codificador Llama-3.1-8B-Instruct se rige por la Llama 3.1 Community License Agreement, lo que obliga a aceptar dicha licencia y puede restringir el uso comercial en funcion del caso; el VAE de FLUX.1 [schnell] y T5-v1_1-xxl son Apache 2.0.
- Descarga de dependencias: el script de inferencia descarga automaticamente `meta-llama/Llama-3.1-8B-Instruct`, lo que exige aceptar la licencia y autenticarse con `huggingface-cli login`.
- Requisitos de despliegue exigentes (Flash Attention, CUDA 12.4, version reciente de diffusers), lo que complica entornos con versiones fijadas.
- Politica de uso: el autor prohibe generar contenido ilegal, danino, informacion personal lesiva, desinformacion o contenido dirigido a colectivos vulnerables; el usuario es responsable del uso.
- Datos de adopcion muy bajos en el momento de la publicacion (0 descargas, 0 likes), por lo que no existe aun una comunidad que haya validado el comportamiento en produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jinstudio/HiDream-E1-1
- Modelo base HiDream-I1-Full: https://huggingface.co/HiDream-ai/HiDream-I1-Full
- Repositorio de HiDream-I1: https://github.com/HiDream-ai/HiDream-I1
- Informe tecnico (arXiv 2505.22705): https://arxiv.org/abs/2505.22705
- Producto del autor: https://vivago.ai/
- Codificador de texto Llama-3.1-8B-Instruct: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Codificador de texto T5-v1_1-xxl: https://huggingface.co/google/t5-v1_1-xxl
- Libreria diffusers: https://github.com/huggingface/diffusers
- Flash Attention: https://github.com/Dao-AILab/flash-attention
