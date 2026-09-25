# NidAll/pruna-image-2.1-comfyui-loras

## Resumen

NidAll/pruna-image-2.1-comfyui-loras no es un modelo independiente, sino un repositorio de dos adaptadores LoRA para Qwen/Qwen-Image-2.1, convertidos de forma no oficial al formato que espera ComfyUI. Parten de los adaptadores de destilación few-step publicados por PrunaAI en PrunaAI/Pruna-Qwen-Image-2.1 (revision 113e63b) y su funcion es reducir el numero de pasos de muestreo necesarios para generar una imagen, de forma que la inference resulte mas rapida y barata en terminos de computo.

La aportacion tecnica del repositorio es concreta: los adaptadores originales tienen rank 64 y alpha PEFT 128, pero ese alpha estaba almacenado unicamente en los metadatos de los safetensors, que el cargador de LoRAs de ComfyUI no lee. Cada fichero de este repositorio anade un tensor escalar `.alpha` para cada una de las 224 dianas LoRA, preservando la escala alpha/rank prevista con fuerza de LoRA 1.0, sin modificar los tensores A y B. Se ofrecen dos variantes: una de 8 pasos (recomendada) y otra de 5 pasos (mas rapida, con menor calidad visual), cada una con su propia secuencia de sigmas para `ManualSigmas`.

El repositorio ocupa 0,7 GB, acumula 0 descargas y 1 like en el momento de la consulta, y se distribuye bajo la Qwen RESEARCH LICENSE AGREEMENT, que limita su uso a investigacion y evaluacion no comercial. Es relevante para quien quiera experimentar con generacion de imagen de pocos pasos en ComfyUI sin depender de implementaciones que ignoren el alpha de los adaptadores originales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (adaptador LoRA sobre el modelo de difusion Qwen/Qwen-Image-2.1; el repositorio no describe la arquitectura del modelo base) |
| Parametros totales | No disponible (los adaptadores son LoRA de rank 64 sobre el modelo base; no se indica el numero de parametros del modelo base) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Los ficheros base indicados por Comfy-Org estan en int8 (`qwen_image_2.1_int8_convrot`, `qwen3vl_8b_int8_convrot`) y el VAE en bf16 (`qwen_image_2.1_vae_bf16`). La precision de los tensores LoRA del repositorio no se especifica |
| Idiomas soportados | No disponible |
| Licencia | qwen-research (Qwen RESEARCH LICENSE AGREEMENT; uso no comercial de investigacion y evaluacion) |
| Formato de pesos | safetensors (dos ficheros: `p_qwen_image_2.1_8step_v0.1_comfyui.safetensors` y `p_qwen_image_2.1_5step_v0.1_comfyui.safetensors`) |
| Rank / alpha LoRA | Rank 64, alpha PEFT 128, 224 dianas por adaptador (incluidas 64 parches para las dos mitades de los pesos fusionados del MLP de imagen) |
| Tamano del repositorio | 0,7 GB |
| Modelo base | Qwen/Qwen-Image-2.1 (relacion: adapter) |
| Pipeline | text-to-image |

## Arquitectura y entrenamiento

El repositorio contiene exclusivamente adaptadores LoRA, no pesos completos. Los tensores A y B se han mantenido sin cambios respecto al origen; la unica modificacion es la incorporacion de un tensor escalar `.alpha` por cada una de las 224 dianas LoRA, dado que ComfyUI no consume el alpha almacenado en los metadatos del safetensors original. El resultado es que, con fuerza de LoRA 1.0, se reproduce la escala alpha/rank prevista por el autor original (alpha 128 sobre rank 64).

La destilacion few-step no la ha realizado el autor de este repositorio, sino PrunaAI, que entreno los adaptadores a aproximadamente 1K de resolucion para generacion text-to-image y edicion de imagen con hasta tres imagenes de referencia. No se detalla en la informacion disponible el dataset, el numero de tokens, ni si hubo etapas de RLHF o DPO. Los workflows incluidos solo demuestran text-to-image a 1024 x 1024; resoluciones superiores y otros ajustes quedan fuera de la cobertura de entrenamiento declarada. El autor advierte que los adaptadores v0.1 todavia no igualan la calidad visual del modelo base a pasos completos, y que ambos ficheros fueron verificados frente a los hashes SHA-256 de origen y contra las formas de tensor del modelo base de Qwen-Image-2.1 en ComfyUI.

## Capacidades

- Generacion de imagenes text-to-image en 8 pasos o 5 pasos mediante el modelo base Qwen/Qwen-Image-2.1, con la secuencia de sigmas especifica de cada adaptador.
- Generacion en pocos pasos (few-step): reduce el numero de evaluaciones del modelo de difusion respecto al muestreo completo, con la contrapartida de menor calidad visual en la variante de 5 pasos.
- Edicion de imagen con hasta tres imagenes de referencia, segun la cobertura de entrenamiento declarada por PrunaAI (los workflows incluidos solo demuestran text-to-image).
- Ajuste de la escala del adaptador preservando la relacion alpha/rank original (alpha 128, rank 64) con fuerza de LoRA 1.0.
- Integracion nativa en ComfyUI mediante los nodos `ManualSigmas` y `SamplerCustom`, sin nodos de terceros en los workflows incluidos.
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni thinking mode: el artefacto es un adaptador de generacion de imagenes.
- Capacidades multilingues: no disponible.

## Casos de uso

- Generacion de imagenes a 1024 x 1024 en ComfyUI con 8 pasos: usar el adaptador de 8 pasos con su secuencia `ManualSigmas` completa para obtener el mejor equilibrio declarado entre velocidad y calidad en la variante recomendada.
- Iteracion rapida en ideacion visual: el adaptador de 5 pasos reduce aun mas el coste por imagen, lo que resulta util cuando el objetivo es explorar variaciones de prompt y composicion antes de fijar una direccion.
- Prototipado de pipelines text-to-image en local: los workflows JSON incluidos usan unicamente nodos nativos de ComfyUI, Euler, CFG 1.0 y prompt negativo vacio, lo que simplifica la reproduccion de un resultado conocido antes de introducir cambios.
- Investigacion sobre destilacion few-step: comparar sistematicamente el adaptador de 5 pasos frente al de 8 pasos con las mismas semillas y prompts permite caracterizar la perdida de calidad asociada a recortar el muestreo.
- Evaluacion comparativa frente al modelo base a pasos completos: el propio autor advierte que los adaptadores v0.1 no alcanzan la calidad del base, por lo que estos ficheros sirven como punto de partida para medir esa brecha en tareas concretas.
- Despliegue en ComfyUI con ficheros base cuantizados a int8: descargar los componentes desde Comfy-Org/Qwen-Image-2.1 en las rutas indicadas y cargar el adaptador en `ComfyUI/models/loras/` para montar un entorno de generacion con pesos de 8 bits.
- Docencia y demostraciones sobre destilacion de difusion: el repositorio incluye las secuencias de sigmas exactas, hashes de verificacion y la descripcion del problema del alpha, lo que lo hace util como caso practico de conversion de adaptadores.
- Verificacion de integridad en pipelines internos: los cuatro hashes SHA-256 publicados (origen y conversion, para 5 y 8 pasos) permiten comprobar la trazabilidad de los ficheros antes de incorporarlos a un entorno controlado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no incluye metricas cuantitativas de calidad (FID, CLIP score, evaluaciones humanas) ni comparaciones numericas con el modelo base a pasos completos; unicamente indica de forma cualitativa que el adaptador de 8 pasos es el punto de partida recomendado y que el de 5 pasos es mas rapido pero con menor calidad visual.

## Requisitos de hardware

- VRAM total para inferencia: no disponible. El repositorio no publica requisitos de memoria ni GPUs recomendadas.
- Componentes que condicionan el consumo: el pipeline requiere el modelo de difusion (`qwen_image_2.1_int8_convrot.safetensors`), el codificador de texto (`qwen3vl_8b_int8_convrot.safetensors`) y el VAE (`qwen_image_2.1_vae_bf16.safetensors`), descargados por separado desde Comfy-Org/Qwen-Image-2.1.
- Estimacion parcial calculable: un codificador de texto de 8B parametros en int8 ocupa del orden de 8 GB solo en pesos, calculo derivado del nombre del fichero y no de datos publicados por el autor.
- Cabe en GPU de consumo: no disponible. No hay confirmacion del autor sobre que tarjetas (RTX 4090, RTX 3090, etc.) son suficientes.
- GPUs recomendadas (A100, H100, etc.): no disponible.
- Opciones de despliegue: ComfyUI con soporte nativo de Qwen-Image-2.1, `ManualSigmas` y `SamplerCustom`, en una version reciente. Los adaptadores originales de PrunaAI se integran ademas con el ecosistema Pruna para ComfyUI (nodos de compilacion y caching) y con la API de Pruna, segun su documentacion.
- Latencia y throughput: no disponible. Se sabe que el adaptador de 5 pasos es mas rapido que el de 8 pasos, pero no se publican valores de tiempo por imagen ni imagenes por segundo.
- Restriccion de muestreo: `ManualSigmas` acepta literales decimales y no evalua expresiones como `14 / 15`; ademas necesita el `0` final de la secuencia para terminar el muestreo.

## Comparativa con modelos similares

| Modelo / artefacto | Tipo | Pasos de muestreo | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| NidAll/pruna-image-2.1-comfyui-loras (este repositorio) | Adaptador LoRA convertido para ComfyUI | 8 o 5, con sigmas propias | qwen-research (no comercial) | HuggingFace, 0 descargas, 1 like | Anade tensores `.alpha` por diana; 224 dianas por adaptador; rank 64, alpha 128 |
| PrunaAI/Pruna-Qwen-Image-2.1 | Adaptadores LoRA originales | 8 y 5 (segun origen) | No disponible en la informacion proporcionada | HuggingFace (revision 113e63b referenciada) | Alpha almacenado en metadatos, no consumido por el cargador de LoRAs de ComfyUI |
| Qwen/Qwen-Image-2.1 | Modelo base de difusion | Muestreo completo | No disponible en la informacion proporcionada | HuggingFace | Los adaptadores v0.1 no igualan su calidad visual a pasos completos |
| Comfy-Org/Qwen-Image-2.1 | Distribucion de ficheros base en int8 para ComfyUI | No aplica (pesos base) | No disponible en la informacion proporcionada | HuggingFace | Origen de los tres ficheros que el workflow espera en `diffusion_models`, `text_encoders` y `vae` |

No se dispone de datos de benchmarks ni de parametros de modelos comparables de la misma categoria en la informacion proporcionada, por lo que no es posible establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- Licencia de uso: la Qwen RESEARCH LICENSE AGREEMENT permite uso no comercial de investigacion y evaluacion sujeto a sus terminos. Es obligatorio leerla antes de usar o redistribuir los adaptadores. Su uso en produccion comercial queda excluido por defecto.
- Atribucion requerida: el aviso legal y la atribucion a Qwen estan en el fichero NOTICE del repositorio; debe conservarse.
- Calidad: los adaptadores v0.1 no alcanzan la calidad visual del modelo base a pasos completos, segun el propio autor. La variante de 5 pasos tiene menor calidad que la de 8.
- Cobertura de entrenamiento limitada: entrenados a aproximadamente 1K de resolucion para text-to-image y edicion con hasta tres imagenes de referencia. Resoluciones mayores y otros ajustes quedan fuera de esa cobertura.
- Evaluacion incompleta: el autor indica explicitamente que la calidad de imagen completa no ha sido evaluada para estas copias convertidas; la verificacion realizada se limita a hashes y formas de tensor.
- Uso exclusivo de un adaptador: debe usarse un solo adaptador a la vez y con su secuencia de sigmas correspondiente. Mezclarlos o emparejarlos con la secuencia equivocada invalida el resultado previsto.
- Compatibilidad: requiere una version reciente de ComfyUI con soporte nativo de Qwen-Image-2.1, `ManualSigmas` y `SamplerCustom`. En versiones antiguas el adaptador no se cargara correctamente.
- Restriccion de sintaxis: `ManualSigmas` no evalua expresiones aritmeticas; hay que introducir literales decimales y no omitir el `0` final.
- Sesgos y alucinacion: no disponible. No se documentan sesgos conocidos en la informacion proporcionada; al tratarse de generacion de imagen, el riesgo relevante es la produccion de contenido visual incorrecto o no fiel al prompt, no abordado por el autor.
- Idiomas: no disponible. No se especifican los idiomas soportados por los prompts.
- Naturaleza no oficial: el repositorio es una conversion no oficial y no esta afiliado ni a PrunaAI ni a Qwen.
- Adopcion practicamente nula: 0 descargas y 1 like, sin evidencia de uso en produccion por terceros.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/NidAll/pruna-image-2.1-comfyui-loras
- Modelo base: https://huggingface.co/Qwen/Qwen-Image-2.1
- Adaptadores originales de PrunaAI: https://huggingface.co/PrunaAI/Pruna-Qwen-Image-2.1
- Revision de origen de los adaptadores: https://huggingface.co/PrunaAI/Pruna-Qwen-Image-2.1/tree/113e63bb993001b3411eb3470b84fc444040cd7e
- Ficheros base para ComfyUI: https://huggingface.co/Comfy-Org/Qwen-Image-2.1
- Nodos de Pruna para ComfyUI: https://github.com/PrunaAI/ComfyUI_pruna
- API de Pruna para ComfyUI: https://github.com/PrunaAI/comfyui-pruna-api
- Documentacion de Pruna para ComfyUI: https://docs.pruna.ai/en/v0.2.11/setup/comfy.html
- Sitio de Pruna: https://www.pruna.ai/
