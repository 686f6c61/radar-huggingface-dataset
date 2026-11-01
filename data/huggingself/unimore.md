# HuggingSelf/UniMore

## Resumen

UniMore-BAGEL es un checkpoint multimodal any-to-any derivado de ByteDance-Seed/BAGEL-7B-MoT, publicado por el usuario HuggingSelf. El modelo combina comprension de imagen y generacion de imagen en un unico conjunto de pesos, obtenido mediante la fusion aritmetica de dos ramas entrenadas de forma independiente sobre el modelo base preentrenado. Se distribuye como checkpoint BF16 fusionado junto con el VAE, el tokenizer y los ficheros de configuracion de inferencia de BAGEL.

La relevancia del modelo reside en su metodo de entrenamiento: en lugar de un ajuste conjunto, se entrena una rama de generacion (supervision frase-a-recorte con la perdida nativa de generacion) y una rama de comprension (captioning de imagen completa con entropia cruzada positiva y ranking de captions completos frente a negativos de omision de detalle, detalle incorrecto y aleatorios), y despues se combinan mediante la formula `W = W_base + ((W_t2i - W_base) + lambda * (W_i2t - W_base))`. El resultado es un modelo de 7B con arquitectura Mixture-of-Transformers (hereda la de BAGEL), pensado para tareas que requieren tanto entender como generar imagenes.

El checkpoint es muy reciente (creado el 29 de octubre de 2026), tiene 19 descargas y ningun like, y solo declara soporte de ingles. No se han publicado resultados de benchmarks en la informacion disponible, por lo que su evaluacion cuantitativa queda pendiente de validacion independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Transformers (MoE multimodal, heredada de BAGEL-7B-MoT) |
| Parametros totales | 7B (segun el nombre del modelo base) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors nativo de BAGEL (`ema.safetensors`), no es un checkpoint `AutoModel` de Transformers |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura Mixture-of-Transformers de BAGEL-7B-MoT, un modelo multimodal que procesa texto e imagenes y que incorpora un VAE (`ae.safetensors`) para la parte de generacion visual. UniMore no introduce cambios estructurales: parte del checkpoint preentrenado y aplica un esquema de ajuste con LoRA (rango 16, alpha 32) en dos ramas separadas.

La rama de generacion se entrena con 2.460 registros, 1.000 actualizaciones del optimizador, learning rate 5e-5, 50 actualizaciones de warmup e imagenes de 256 px, usando supervision frase-a-recorte con la perdida nativa de generacion. La rama de comprension usa 4.000 registros, 600 actualizaciones, learning rate 1.8e-5, 60 de warmup e imagenes de 112 px, con supervision de caption completo y ranking frente a negativos. Ambas ramas se fusionan en BF16 con la formula indicada, donde `lambda` pondera la contribucion de la rama de comprension. La evaluacion de generacion documentada usa imagenes de 512 px, 50 pasos de muestreo, CFG texto/imagen 4/1, timestep shift 3 y semilla 42. No se especifica el volumen total de tokens de entrenamiento ni si hubo RLHF o DPO.

## Capacidades

- Generacion de imagen texto-a-imagen a partir de prompts en ingles.
- Comprension de imagen (image-to-text) mediante captioning y descripcion detallada.
- Flujo any-to-any: combinacion de entrada de texto e imagen con salida de texto o imagen.
- Generacion condicionada por recortes (grounded phrase-to-crop) gracias a la rama de generacion.
- Ranking de captions y deteccion de detalles omitidos o incorrectos en la rama de comprension.
- Soporte multilingue limitado al ingles segun la model card.
- No se documenta soporte de tool calling, function calling ni modo de razonamiento explicito.
- No se documenta soporte de audio ni de video.

## Casos de uso

- Generacion de ilustraciones a partir de descripciones textuales: el modelo produce imagenes de 512 px con 50 pasos de muestreo y CFG 4/1, adecuado para prototipado rapido de assets visuales en ingles.
- Descripcion automatica de imagenes para accesibilidad: la rama de comprension genera captions completos y esta entrenada para evitar omisiones de detalle, lo que ayuda en la generacion de texto alternativo.
- Verificacion de consistencia imagen-texto: el ranking de captions frente a negativos permite puntuar si una descripcion cubre o no los detalles de una imagen, util en control de calidad de datasets.
- Anotacion asistida de datasets multimodales: el modelo puede generar captions y recortes supervisados que luego se revisan manualmente, reduciendo el coste de etiquetado.
- Creacion de variaciones visuales condicionadas por region: la supervision frase-a-recorte permite generar contenido alineado con una frase y una zona concreta de la imagen.
- Investigacion en fusion de modelos: el esquema de merge con `lambda` sirve como banco de pruebas para estudiar la combinacion de ramas de generacion y comprension sin reentrenamiento conjunto.
- Prototipos de asistentes visuales en ingles: integrable mediante el adaptador de BAGEL en TorchUMM para flujos de imagen a texto y texto a imagen en una sola llamada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 14-16 GB solo para los pesos de 7B, mas el VAE y las activaciones; en la practica se recomienda 24 GB o mas.
- Cuantizacion: no se documentan pesos GGUF ni cuantizados; el repositorio solo incluye BF16 (`ema.safetensors`), por lo que no hay una ruta oficial de cuantizacion.
- GPU recomendadas: A100 40/80 GB o H100 para inferencia comoda y lotes; RTX 4090 (24 GB) como minimo practico en BF16.
- GPU de consumo: cabe en RTX 4090 y posiblemente en RTX 3090 (24 GB) con cuidado de memoria; en GPUs de 16 GB no es viable en BF16 sin cuantizar.
- Despliegue: el modelo no usa `AutoModel` de Transformers; requiere el adaptador de BAGEL en TorchUMM (https://github.com/AIFrontierLab/TorchUMM) configurando `model_path` al directorio descargado. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. La configuracion de evaluacion usa 50 pasos de muestreo, lo que implica decenas de pasos de denoising por imagen.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| UniMore-BAGEL | 7B | no disponible | Apache 2.0 | safetensors BAGEL | Fine-tune fusionado de BAGEL-7B-MoT, solo ingles |
| ByteDance-Seed/BAGEL-7B-MoT | 7B | no disponible | no disponible en la informacion | safetensors BAGEL | Modelo base; arquitectura MoT multimodal |
| Alternativas any-to-any de 7B | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparables en la informacion proporcionada |

No se dispone de datos de benchmarks ni de especificaciones de contexto para establecer una comparativa cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- Solo declara soporte de ingles; el rendimiento en castellano u otros idiomas no esta garantizado.
- Riesgo de alucinacion en captions y en imagenes generadas, especialmente con prompts ambiguos o fuera de la distribucion de entrenamiento.
- El entrenamiento es ligero (2.460 y 4.000 registros, 1.000 y 600 actualizaciones), por lo que el ajuste puede ser limitado y sobreajustado a los datos de UniMore.
- No es un checkpoint `AutoModel` de Transformers: requiere el adaptador de BAGEL en TorchUMM, lo que limita la portabilidad a otros stacks.
- No hay pesos cuantizados ni soporte documentado de vLLM, llama.cpp u Ollama, lo que dificulta el despliegue en hardware de consumo.
- La licencia Apache 2.0 permite uso comercial, pero debe verificarse la licencia y condiciones del modelo base BAGEL-7B-MoT antes de produccion.
- El repositorio es muy reciente y con poca traccion (19 descargas, 0 likes); no hay validacion independiente ni benchmarks publicados.
- El metodo de merge con `lambda` puede introducir interferencias entre las ramas de generacion y comprension; no se documenta el valor de `lambda` usado en el checkpoint final.
- La generacion a 512 px y 50 pasos puede ser lenta en GPUs de consumo.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/HuggingSelf/UniMore
- Dataset de entrenamiento: https://huggingface.co/datasets/HuggingSelf/UniMore
- Modelo base BAGEL-7B-MoT: https://huggingface.co/ByteDance-Seed/BAGEL-7B-MoT
- Repositorio TorchUMM: https://github.com/AIFrontierLab/TorchUMM
- Paquete UniMore en TorchUMM: https://github.com/AIFrontierLab/TorchUMM/tree/main/src/umm/post_training/UniMore
