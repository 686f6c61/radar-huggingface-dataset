# PedroMarinhoDev/P-JiT-21K-ComfyUI

## Resumen

P-JiT 21K es un modelo de generacion de imagenes a partir de texto (text-to-image) desarrollado por Linum AI. Se trata de un modelo de aproximadamente 2.000 millones de parametros que genera imagenes directamente en el espacio de pixeles, sin utilizar un VAE (autoencoder variacional). Esto supone una diferencia arquitectonica notable frente a los modelos de difusion latente convencionales, ya que elimina la etapa de codificacion y decodificacion a traves de un espacio latente comprimido. La variante aqui documentada, P-JiT-21K-ComfyUI, es un empaquetado realizado por PedroMarinhoDev que adapta los pesos originales para su uso nativo en ComfyUI.

Este repositorio no contiene el modelo original, sino conversiones de los pesos fp32 publicados por Linum a formatos bf16 e int8 ConvRot, optimizados para ejecutarse con los nodos ComfyUI-PJiT sobre el KSampler y la gestion de memoria propios de ComfyUI. El objetivo es reducir los requisitos de hardware y el tiempo de inferencia sin alterar sustancialmente la salida visual: el archivo bf16 produce, segun el autor, los mismos pixeles que la version fp32 original, mientras que la variante int8 ofrece una aceleracion de aproximadamente 1,8 veces en GPUs con kernels int8.

El modelo resulta relevante porque demuestra que la generacion en espacio de pixeles es viable a escala de 2B de parametros y porque el empaquetado permite ejecutarlo en entornos de consumo desde 4 GB de VRAM libre. El texto se codifica mediante Qwen3.5-4B, y el repositorio incluye versiones cuantizadas de ese codificador de texto para reducir aun mas el consumo de memoria. La licencia es Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion en espacio de pixeles (sin VAE), con 22 bloques y 4 bloques de refiner; codificador de texto Qwen3.5-4B |
| Parametros totales | Aproximadamente 2.000 millones (2B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (el modelo recibe descripciones de 50 a 80 palabras segun recomendacion del autor) |
| Tipos de cuantizacion | bf16, int8 ConvRot (pesos); codificador de texto en bf16, int8 ConvRot, W6A8 y W4A8 |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (bf16 e int8) |

## Arquitectura y entrenamiento

P-JiT 21K es un modelo de difusion que opera directamente sobre pixeles en lugar de sobre un espacio latente comprimido. La arquitectura consta de 22 bloques principales y 4 bloques adicionales de refiner, con capas lineales y convolucionales, normalizacion RMSNorm y LayerNorm, y modulacion de salida. La ausencia de VAE implica que el modelo no necesita un archivo de decodificacion separado: en ComfyUI se utiliza el VAE integrado `pixel_space`. El texto de entrada se procesa con un codificador Qwen3.5-4B, cuyos embeddings de caption alimentan al modelo de difusion.

No se dispone en la informacion proporcionada de detalles sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO. La innovacion tecnica destacable es precisamente la generacion en espacio de pixeles a esta escala, junto con el esquema de cuantizacion ConvRot aplicado por el empaquetador: cada peso se rota mediante una matriz de Hadamard en grupos a lo largo de su entrada (tamano 256, o 64 para entradas de 2944 dimensiones, dado que los tamanos de Hadamard de ComfyUI son potencias de 4) antes de cuantizarse a int8 en formato `int8_tensorwise`. El archivo bf16 mantiene las ganancias de normalizacion y la modulacion de salida en fp32 para reproducir el calculo del codigo original bajo autocast bf16.

## Capacidades

- Generacion de imagenes a partir de descripciones textuales en el espacio de pixeles, sin VAE intermedio.
- Soporte de descripciones detalladas: el autor recomienda captions de 50 a 80 palabras, con un flujo de trabajo de ampliacion de prompts (prompt upsampler) incluido en las plantillas.
- Generacion con pasos de muestreo configurables (la configuracion de referencia usa 50 pasos, sampler euler, cfg 15 y prompt negativo vacio).
- Pase de refinado image-to-image a bajo denoise incluido en las plantillas de ComfyUI.
- Integracion nativa con el KSampler y la gestion de memoria de ComfyUI mediante los nodos ComfyUI-PJiT.
- Ejecucion con cuantizacion int8 para acelerar la inferencia en GPUs con kernels int8.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, vision de entrada, audio ni modo thinking, por tratarse de un modelo generativo de imagenes.

## Casos de uso

- Generacion de ilustraciones conceptuales para prototipado: el modelo produce imagenes de 1024x1024 en 50 pasos con unos 0,34 segundos por paso en una RTX 3090 (bf16), lo que permite iterar rapidamente sobre conceptos visuales en fases de diseno.
- Creacion de imagenes para contenido editorial y blogs: con descripciones de 50 a 80 palabras y el flujo de ampliacion de prompts, se pueden generar escenas detalladas (paisajes, interiores, retratos) adecuadas para acompanar articulos.
- Despliegue en estaciones de trabajo con GPU de consumo: la variante int8 ConvRot (2,33 GB) y el codificador de texto cuantizado permiten ejecutar el modelo desde 4 GB de VRAM libre, lo que lo hace viable en tarjetas de gama media.
- Integracion en pipelines de ComfyUI existentes: al usar el KSampler nativo y las plantillas oficiales, el modelo se puede encadenar con otros nodos de posprocesado, refinado o composicion dentro de flujos ya establecidos.
- Generacion por lotes en servidores con GPUs profesionales: la version bf16 reproduce los pixeles de la version fp32 original con la mitad de tamano (4,37 GB), lo que facilita el almacenamiento y la distribucion en entornos de produccion.
- Experimentacion e investigacion en generacion en espacio de pixeles: al prescindir de VAE, el modelo simplifica el analisis del proceso generativo y sirve como base para estudiar alternativas a la difusion latente.
- Refinado de imagenes existentes: el pase de refiner image-to-image a bajo denoise incluido en las plantillas permite mejorar o ajustar imagenes ya generadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, por tratarse de un modelo de generacion de imagenes. El autor si proporciona mediciones de rendimiento y fidelidad en una RTX 3090 a 1024x1024 y 50 pasos:

| Archivo | Segundos por paso | Segundos por paso con 4 GiB libres | Similitud con las imagenes de Linum (PSNR) |
|---|---|---|---|
| pjit_21k_bf16 | 0,34 | 0,39 | 40,2 / 39,5 / 47,7 dB |
| pjit_21k_int8_convrot | 0,19 | 0,19 | 32,8 / 31,7 / 40,3 dB |
| Liberacion fp32 de Linum | 0,35 | 0,97 | 40,2 / 39,5 / 47,7 dB |

Como referencia, el propio codigo de Linum contra si mismo, reejecutado con otra forma de lote, difiere entre 40,5 y 49,3 dB. El archivo bf16 produce pixel a pixel las mismas imagenes que el archivo fp32. En el codificador de texto, la fidelidad de los embeddings de caption frente a bf16 es del 2 % de desviacion para int8 ConvRot, del 4 al 5 % para W6A8 y del 14 al 16 % para W4A8.

## Requisitos de hardware

- VRAM estimada: desde 4 GB de VRAM libre para ejecutar el modelo con los nodos ComfyUI-PJiT, segun el autor.
- Tamano de los archivos del modelo: 4,37 GB (bf16) y 2,33 GB (int8 ConvRot). El codificador de texto ocupa 9,32 GB en bf16, 4,72 GB en int8 ConvRot, 4,05 GB en W6A8 y 3,16 GB en W4A8.
- GPU recomendadas: RTX 3090 para las mediciones publicadas; el modelo esta pensado para funcionar en GPUs de consumo desde 4 GB de VRAM libre, incluyendo tarjetas de gama media con soporte de kernels int8.
- Cabe en GPU de consumo: si, con la variante int8 y un codificador de texto cuantizado.
- Opciones de despliegue: ComfyUI version 0.44 o superior con los nodos ComfyUI-PJiT (instalacion por clonacion en `custom_nodes`, sin pip install). No se documentan opciones para vLLM, llama.cpp, Ollama o TGI, al no ser un modelo de lenguaje.
- Latencia y throughput: 0,34 s por paso en bf16 y 0,19 s por paso en int8 ConvRot en una RTX 3090 a 1024x1024; con 4 GiB libres, el bf16 sube a 0,39 s por paso mientras el int8 se mantiene en 0,19 s.

## Comparativa con modelos similares

No se dispone en la informacion proporcionada de datos sobre modelos comparables de generacion en espacio de pixeles con los que establecer una comparativa de parametros, contexto, rendimiento y licencia. La unica referencia directa es el modelo original del que deriva:

| Modelo | Parametros | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|
| P-JiT-21K-ComfyUI (este repositorio) | Aproximadamente 2B | safetensors bf16 e int8 | Apache-2.0 | HuggingFace, empaquetado para ComfyUI |
| Linum-AI/pjit-21k (original) | Aproximadamente 2B | safetensors fp32 | Apache-2.0 | HuggingFace |

## Limitaciones y advertencias

- El repositorio no contiene el modelo original, sino conversiones de sus pesos; los resultados pueden diferir ligeramente de la liberacion oficial, especialmente en la variante int8 (32,8 a 40,3 dB frente a 40,2 a 47,7 dB del bf16).
- La cuantizacion W4A8 del codificador de texto altera mas los rostros y presenta una desviacion del 14 al 16 % en los embeddings de caption frente a bf16; no se recomienda cuando la fidelidad facial sea critica.
- No se documentan sesgos conocidos, tasas de alucinacion visual ni limitaciones de idioma en la informacion disponible.
- El modelo requiere ComfyUI 0.44 o superior y la instalacion manual de los nodos ComfyUI-PJiT; no funciona como un pipeline estandar de HuggingFace sin ese empaquetado.
- El autor recomienda descripciones de 50 a 80 palabras; descripciones mas cortas pueden producir resultados menos fieles, y existe un flujo de ampliacion de prompts para mitigarlo.
- La licencia Apache-2.0 permite uso comercial, pero debe verificarse el cumplimiento de las condiciones de la licencia del modelo base y del codificador de texto Qwen3.5-4B en el contexto de produccion.
- El repositorio registra cero descargas y cero likes en el momento de la consulta, por lo que no existe validacion comunitaria amplia sobre su comportamiento en distintos entornos.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/PedroMarinhoDev/P-JiT-21K-ComfyUI
- Modelo original: https://huggingface.co/Linum-AI/pjit-21k
- Nodos ComfyUI-PJiT en GitHub: https://github.com/PedroMarinhoDev/ComfyUI-PJiT
- Blog de Linum sobre P-JiT 21K: https://www.linum.ai/field-notes/pjit-21k
- Codificador de texto Qwen3.5 (Comfy-Org): https://huggingface.co/Comfy-Org/Qwen3.5
- Pesos fp32 originales: https://huggingface.co/Linum-AI/pjit-21k/blob/main/model.safetensors
