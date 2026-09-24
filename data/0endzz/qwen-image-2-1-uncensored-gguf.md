# 0Endzz/Qwen-Image-2.1-Uncensored-GGUF

## Resumen
Qwen-Image-2.1-Uncensored-GGUF es un conjunto de cuantizaciones del modelo de generacion de imagen Qwen/Qwen-Image-2.1, publicadas por el usuario 0Endzz. Se trata de una redistribucion en formato GGUF y safetensors pensada para ejecucion local del modelo de difusion de texto a imagen dentro de ComfyUI, con el objetivo de reducir los requisitos de VRAM respecto a los pesos originales en BF16.

El paquete no incluye un modelo nuevo, sino la conversion y cuantizacion del backbone de difusion de Qwen-Image-2.1, acompanada de los ficheros complementarios necesarios para su funcionamiento: un text encoder basado en Qwen3-VL de 8.000 millones de parametros y un VAE. La variante marcada como "uncensored" elimina o relaja los filtros de contenido del modelo original.

La relevancia de esta publicacion reside en que permite desplegar un modelo de generacion de imagen de aproximadamente 7.100 millones de parametros en GPU de consumo, algo inviable con los pesos en BF16. La licencia heredada del modelo base es `qwen-research`, de tipo "other", lo que condiciona su uso comercial.

## Especificaciones tecnicas
| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusion texto a imagen con backbone transformer (familia Qwen-Image) |
| Parametros totales | 7.115.124.736 (~7,1 mil millones) |
| Longitud de contexto | no disponible (modelo de generacion de imagen; depende del text encoder Qwen3VL-8B) |
| Tipos de cuantizacion | BF16, FP8, INT8 ConvRot, Q8_0, Q6_K, Q5_K_M, Q4_K_M, Q4_0 |
| Idiomas soportados | no disponible |
| Licencia | qwen-research (campo `license: other`) |
| Formato de pesos | GGUF y safetensors |

## Arquitectura y entrenamiento
El paquete se compone de tres piezas. El backbone de difusion (7,1 mil millones de parametros) se distribuye en GGUF o safetensors cuantizados y se carga en ComfyUI mediante el nodo `Unet Loader (GGUF)`. El text encoder es Qwen3-VL de 8.000 millones de parametros en BF16 o INT8 ConvRot, responsable de codificar el prompt de texto. El decodificador final es un VAE en BF16 de 676 MB.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni el proceso de alineacion (RLHF, DPO) empleado en el modelo base. La model card unicamente indica que las cuantizaciones se han generado a partir de los pesos base originales de Qwen/Qwen-Image-2.1, sin reentrenamiento. La innovacion tecnica del paquete es operativa, no arquitectonica: empaquetar en un mismo repositorio el transformer, el text encoder y el VAE, y ofrecer la variante INT8 ConvRot como alternativa de menor consumo de memoria para el codificador de texto.

## Capacidades
- Generacion de imagenes a partir de descripciones textuales (pipeline texto a imagen), incluida la plantilla oficial de Comfy-Org para texto a imagen.
- Edicion de imagen guiada por prompt, segun la plantilla oficial `image_qwen_image_2_1_image_edit.json` referenciada en la model card.
- Ejecucion local completa en ComfyUI sin depender de servicios en la nube.
- Variante "uncensored" que elimina las restricciones de contenido del modelo base, ampliando los tipos de prompt aceptados.
- Integracion con el ecosistema de nodos ComfyUI-GGUF (fork de leejet) para carga de pesos cuantizados.
- No se documentan capacidades de tool calling, agentes, multi-step reasoning ni procesamiento de audio.

## Casos de uso
- Generacion de ilustraciones conceptuales para preproduccion: el modelo permite iterar rapidamente sobre bocetos a partir de prompts textuales, usando las cuantizaciones Q4_K_M o Q5_K_M para mantener tiempos de muestreo bajos en una GPU de gama media.
- Prototipado de assets para videojuegos: con la plantilla de edicion de imagen se pueden modificar variaciones de un asset ya generado (cambios de color, estilo o composicion) sin regenerar desde cero.
- Creacion de material grafico para campanas de marketing: el caracter "uncensored" permite generar contenido que los modelos con filtros rechazarian, util en sectores con restricciones creativas menores.
- Flujos artisticos y editoriales: la licencia `qwen-research` restringe el uso comercial, por lo que el caso natural es la produccion creativa personal o la investigacion.
- Investigacion sobre cuantizacion de modelos de difusion: el repositorio ofrece ocho niveles de cuantizacion distintos (de BF16 a Q4_0) sobre el mismo backbone, lo que facilita estudios comparativos de degradacion de calidad frente a ahorro de memoria.
- Laboratorio de prompt engineering: la combinacion de un text encoder Qwen3-VL de 8B con el backbone de difusion permite explorar la sensibilidad a prompts largos o multilingues.
- Despliegue en estaciones de trabajo sin GPU de datacenter: la cuantizacion Q4_0 de 4,15 GB se puede cargar en GPUs con 6-8 GB de VRAM, con el text encoder en RAM.

## Benchmarks y rendimiento
No se han publicado resultados numericos de benchmarks en la informacion disponible. La model card incluye una referencia a una imagen de benchmark (`assets/Qwen-Image-2.1-Benchmark.png`) sin valores numericos asociados, por lo que no es posible presentar una tabla comparativa de metricas (FID, CLIP score, etc.).

## Requisitos de hardware
- VRAM para el backbone de difusion (estimacion a partir del tamano de fichero): BF16 ~14,2 GB; Q8_0 ~7,6 GB; Q6_K ~5,9 GB; Q5_K_M ~5,2 GB; Q4_K_M ~4,6 GB; Q4_0 ~4,15 GB.
- VRAM adicional para el text encoder si se carga en GPU: Qwen3VL-8B en BF16 ocupa ~17,5 GB; en INT8 ConvRot, ~9,35 GB. La model card recomienda mantener el codificador de texto en RAM y reservar la VRAM para el backbone de difusion.
- GPU de gama alta: A100 (40/80 GB) o H100 permiten cargar el modelo completo (backbone + text encoder en BF16) en VRAM.
- GPU de consumo: una RTX 4090 o 3090 (24 GB) ejecuta sin problemas BF16 con el text encoder en INT8. Una RTX 4070 Ti (12 GB) o 3060 (12 GB) es suficiente para Q8_0 o Q6_K con el encoder fuera de VRAM. Con Q4_K_M o Q4_0 el modelo cabe en GPUs de 8 GB, y Q4_0 puede ajustarse en 6 GB con offload parcial.
- Despliegue: exclusivamente mediante ComfyUI con el nodo ComfyUI-GGUF (fork de leejet, con soporte nativo de Qwen-Image 2.1). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, dado que es un modelo de difusion y no un LLM.
- Latencia y throughput: no disponibles. Dependen del numero de pasos de muestreo, la resolucion de salida, la GPU y la cuantizacion elegida.

## Comparativa con modelos similares
| Modelo | Parametros | Formato GGUF | Licencia | Contexto | Rendimiento |
|---|---|---|---|---|---|
| Qwen-Image-2.1-Uncensored-GGUF (este) | ~7,1 B (backbone) | Si | qwen-research | no disponible | no disponible |
| Qwen/Qwen-Image-2.1 (base) | no disponible | No (BF16) | qwen-research | no disponible | no disponible |
| FLUX.1-dev (cuantizaciones GGUF de terceros) | ~12 B | Si | FLUX.1-dev Non-Commercial | no aplica | no disponible |
| SDXL (cuantizaciones GGUF de terceros) | ~3,5 B en total | Si | CreativeML Open RAIL++-M | no aplica | no disponible |
| no disponible | — | — | — | — | — |

La comparativa se limita a datos publicos de parametros y licencia; no se dispone de resultados de benchmark homogeneos que permitan comparar la calidad de generacion entre estos modelos.

## Limitaciones y advertencias
- Licencia `qwen-research` (campo `license: other`): restringe el uso comercial. Es imprescindible revisar los terminos completos del modelo base Qwen/Qwen-Image-2.1 antes de cualquier despliegue en produccion.
- La variante "uncensored" elimina las salvaguardas de contenido del modelo original. Esto implica riesgo de generar material inapropiado, ilegal o danino, y traslada al operador toda la responsabilidad legal y etica sobre las imagenes producidas.
- Riesgo de sesgos: los modelos de difusion a gran escala reproducen sesgos de genero, etnia, edad y estereotipos presentes en sus datos de entrenamiento. No se documenta ninguna mitigacion especifica.
- Alucinacion visual: el modelo puede generar anatomia incorrecta, texto ilegible en la imagen, objetos incoherentes o artefactos, especialmente en las cuantizaciones mas agresivas (Q4_0).
- Degradacion por cuantizacion: las variantes Q4_0 y Q4_K_M introducen perdida de fidelidad respecto a BF16. No se publican metricas de esa degradacion.
- Idioma: no se especifica que idiomas de prompt soporta el text encoder Qwen3-VL-8B en este empaquetado. La model card esta redactada en ingles.
- Discrepancia de autoría: los enlaces de descarga de la model card apuntan a la cuenta `abenzerps`, mientras que el repositorio consultado pertenece a `0Endzz`. Conviene verificar la procedencia de los ficheros antes de descargarlos.
- Despliegue limitado: solo funciona en ComfyUI con el fork de ComfyUI-GGUF de leejet. El fork antiguo de city96 puede devolver el error `Unknown model architecture!`.
- Cero traccion: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validacion de la comunidad sobre la calidad de las cuantizaciones.

## Enlaces
- Repositorio HuggingFace: https://huggingface.co/0Endzz/Qwen-Image-2.1-Uncensored-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen-Image-2.1
- ComfyUI: https://github.com/comfyanonymous/ComfyUI
- ComfyUI-GGUF (fork de leejet, con soporte nativo de Qwen-Image 2.1): https://github.com/leejet/ComfyUI-GGUF
- Plantilla de flujo texto a imagen: https://github.com/Comfy-Org/workflow_templates/blob/main/templates/image_qwen_image_2_1_t2i.json
- Plantilla de flujo de edicion de imagen: https://github.com/Comfy-Org/workflow_templates/blob/main/templates/image_qwen_image_2_1_image_edit.json
