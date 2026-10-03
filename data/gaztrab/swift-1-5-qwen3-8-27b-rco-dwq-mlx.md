# GazTrab/Swift-1.5-Qwen3.8-27b-RCO-DWQ-MLX

## Resumen

Swift-1.5-Qwen3.8-27b-RCO-DWQ-MLX es un checkpoint cuantizado en formato nativo MLX del modelo vision-lenguaje Swift 1.5 27B de UkisAI, que a su vez se basa en Qwen3.8-27B. Lo publica el usuario GazTrab y su aportacion no es un modelo nuevo, sino una receta de cuantizacion de pesos: parte del modelo en bfloat16 (BF16) y lo comprime a aproximadamente 3,5 bits por peso en los tensores del modelo de texto, manteniendo la torre de vision y la cabeza MTP (multi-token prediction).

El modelo tiene 27.781.427.952 parametros totales y el repositorio ocupa 13,5 GB; los tensores de texto suman 11.762.121.728 bytes. La licencia es swift-open-license-1.0 (etiquetada como "other" en HuggingFace) y el pipeline declarado es image-text-to-text, es decir, acepta entradas de imagen y texto.

Su relevancia es metodologica: introduce RCO (un programa dinamico con restriccion de presupuesto de bytes que asigna un ancho de bits a cada tensor) y DWQ (distilled weight quantization, que ajusta escalas y sesgos de grupo contra el modelo BF16 original). Frente a una cuantizacion uniforme de 3 bits MLX, reduce la divergencia de Kullback-Leibler en WikiText, aunque queda por detras de referencias GGUF IQ3_S y de la cuantizacion uniforme de 4 bits.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-lenguaje basada en Qwen3.8-27B (transformer); incluye torre de vision y cabeza MTP. Detalle completo no disponible |
| Parametros totales | 27.781.427.952 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MLX affine quantization, eficaz ~3,5 bits por peso en el modelo de texto; group size de 64 o 128 segun tensor; codigos round-to-nearest |
| Idiomas soportados | no disponible oficialmente (la evaluacion cubre ingles C4, aleman, chino, espanol y codigo) |
| Licencia | swift-open-license-1.0 (license: other) |
| Formato de pesos | safetensors (checkpoint nativo MLX); el modelo hermano IQ3_S se publica en GGUF |
| Tamano del repositorio | 13,5 GB |
| Bytes de tensores de texto | 11.762.121.728 (~11,76 GB) |
| Libreria | mlx |
| Modelo base | ukisai/Swift-1.5-Qwen3.8-27b |

## Arquitectura y entrenamiento

Se trata de un modelo de lenguaje con capacidades de vision (pipeline image-text-to-text), derivado de Qwen3.8-27B, que incorpora una torre de vision para procesar imagenes y una cabeza MTP de prediccion multi-token. El checkpoint incluye tanto la parte de vision como la cabeza MTP, aunque ninguna de las dos recibio el pase de entrenamiento DWQ segun la model card. No se detalla la composicion completa del dataset de preentrenamiento original ni si hubo fases de RLHF o DPO; esa informacion corresponde al modelo base y no esta disponible en esta ficha.

El trabajo de este repositorio es la cuantizacion. El proceso consta de tres pasos: primero, RCO, un programa dinamico con presupuesto de bytes que asigna a cada tensor un ancho de bits a partir de su error medido; segundo, codificacion round-to-nearest sobre la rejilla afina de MLX con `mx.quantize`; tercero, DWQ, que optimiza escala y sesgo de cada grupo contra los 1.024 logits mas altos del modelo profesor BF16. DWQ ejecuta 512 pasos de optimizador sobre 2.048 muestras de FineWeb-Edu de 1.025 tokens cada una (semilla 123, learning rate 1e-6, temperatura de destilacion 2, batch size 1) y se ejecuto con el backend CUDA de MLX en una RTX PRO 6000 alquilada durante 3,75 horas.

La innovacion principal es la combinacion RCO + round-to-nearest + DWQ. Segun el autor, RCO con codigos round-to-nearest reduce el KLD de WikiText un 15% frente a 3 bits uniformes de MLX; DWQ reduce un 22% adicional frente a `rco_rtn` (misma asignacion RCO sin DWQ). La alternativa GSQ (Gumbel-Softmax Quantization), que aprende los codigos enteros, mejora el KLD en prosa inglesa pero pierde en la media de ocho corpus, por lo que esta version mantiene codigos round-to-nearest.

## Capacidades

- Generacion de texto y conversacion multi-turno en formato MLX.
- Comprension de imagenes y texto combinados (image-text-to-text) mediante la torre de vision incluida.
- Razonamiento con tokens de pensamiento: la model card menciona una medicion de "thinking tokens" en una comparacion de 30 items, lo que indica un modo de razonamiento.
- Prediccion multi-token mediante la cabeza MTP, aunque en las pruebas de decodificacion especulativa acepto 0 de 22 tokens borrador y no aporto aceleracion.
- Capacidad multilingue evaluada de forma implicita: los corpus de comparacion incluyen ingles (C4), aleman, chino, espanol y codigo.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte explicito de agentes y multi-step reasoning: no disponible.

## Casos de uso

- Inferencia local en Apple Silicon: el checkpoint esta en formato nativo MLX y se carga con `mlx-lm` (generacion de texto) o `mlx-vlm` (imagen y texto). Es adecuado para equipos Mac con memoria unificada suficiente, donde evita depender de servicios en la nube.
- Analisis y descripcion de imagenes: con `mlx_vlm.generate` se puede pasar una imagen y un prompt para obtener una descripcion o responder preguntas sobre ella, util en clasificacion o etiquetado de contenido visual.
- Generacion de codigo asistida: la comparacion de KLD incluye un corpus de codigo donde esta version obtiene 0,0124 menos KLD que el hermano `dwq_gsq`, lo que la hace relativamente competitiva en ese dominio frente a otras variantes cuantizadas.
- Aplicaciones multilingues en espanol, aleman y chino: los corpus de evaluacion muestran mejoras de KLD frente a `dwq_gsq` en espanol (0,0056), aleman (0,0184) y chino (0,0288), por lo que es una opcion razonable para prototipos en esos idiomas.
- Prototipado conversacional: el pipeline es conversational y la model card incluye plantilla de chat, tokenizer y ajustes de generacion, lo que permite montar un asistente de chat local sin trabajo adicional de plantilla.
- Investigacion en cuantizacion: el repositorio documenta la receta completa (asignacion RCO, codigos, pasos DWQ, hiperparametros y datos de entrenamiento), lo que lo convierte en una referencia reproducible para estudiar tecnicas de compresion de pesos.
- Despliegue en oMLX: el autor indica que basta con descargar la carpeta del repositorio en el directorio de modelos de oMLX y seleccionarla en la aplicacion, y que todos los motores probados la cargan.

## Benchmarks y rendimiento

Los datos publicados son de divergencia KLD (menor es mejor) frente al modelo BF16 original, no de precision en tareas. La evaluacion emparejada puntuo 25.500 filas de WikiText y siete corpus adicionales; el almacenamiento de texto esta igualado en torno a 11,76 GB salvo donde se indica.

| Modelo | KLD WikiText (media ± error estandar) | KLD medio en ocho corpus | Comparacion |
|---|---:|---:|---|
| Este release (`dwq_rco`) | 0,1241 ± 0,0019 | 0,1014 | RCO + round-to-nearest + DWQ |
| `dwq_gsq` | 0,1159 ± 0,0019 | 0,1083 | Codigos aprendidos GSQ a igual bytes |
| `dwq_3bit` | 0,1398 ± 0,0019 | 0,1206 | 3 bits uniformes con pase DWQ |
| `rco_rtn` | 0,1588 ± 0,0022 | 0,1242 | Misma asignacion RCO sin DWQ |
| `mlx_3bit` | 0,1863 ± 0,0022 | no disponible | 3 bits uniformes sin RCO ni DWQ |
| UkisAI GSQ-RCO IQ3_S GGUF | 0,0511 ± 0,0008 | no disponible | Formato GGUF via llama.cpp a igual bytes |
| MLX uniforme 4 bits (15,13 GB) | 0,0475 ± 0,0008 | no disponible | Referencia de mayor almacenamiento |

Frente a `dwq_3bit`, este release baja el KLD de WikiText en 0,0157 ± 0,0020 y mejora en los ocho corpus. Frente a `dwq_gsq`, empeora en WikiText en 0,0082 ± 0,0019 pero mejora en seis de los ocho corpus. A igual tamano, su KLD de WikiText es 2,43 veces el del IQ3_S GGUF.

## Requisitos de hardware

- Los tensores del modelo de texto ocupan 11,76 GB y el repositorio completo 13,5 GB; el pico de memoria medido con `mlx-lm` 0.32.0 fue de 12,0 GB. Como estimacion, la inferencia requiere del orden de 14 a 16 GB de memoria unificada o VRAM, aunque el dato exacto no esta publicado.
- Se ha verificado su carga en un Mac con M3 Max y 96 GB de memoria unificada.
- Cabe en equipos consumer de Apple Silicon con memoria unificada suficiente (16 GB o mas segun la estimacion anterior); el autor no confirma explicitamente el minimo.
- El pase de entrenamiento DWQ uso una RTX PRO 6000 con el backend CUDA de MLX, pero no esta documentada la inferencia en GPU NVIDIA consumer.
- Opciones de despliegue: `mlx-lm` 0.32.0 (carga y generacion greedy correctas, 12,0 GB de pico) y `mlx-vlm` 0.7.1 (carga correcta para imagen y texto). En oMLX el modelo se carga descargando la carpeta en su directorio de modelos. LM Studio carga el modelo pero genera texto corrupto.
- Rendimiento: la model card no reporta velocidad de generacion para este release porque la maquina de pruebas estaba a 4-5 tokens/s. Una build anterior en oMLX alcanzo unos 21 tokens/s en M3 Max en un dia sin carga, pero esas cifras no corresponden a esta version. La decodificacion especulativa con MTP acepto 0 de 22 tokens borrador, por lo que no aporta aceleracion.

## Comparativa con modelos similares

| Modelo | Parametros | Almacenamiento texto | KLD WikiText | Formato | Licencia |
|---|---|---:|---:|---|---|
| Este release (`dwq_rco`) | 27,78B | ~11,76 GB / ~3,5 bits | 0,1241 | safetensors MLX | swift-open-license-1.0 |
| `dwq_gsq` (mismo autor) | 27,78B | ~11,76 GB | 0,1159 | safetensors MLX | swift-open-license-1.0 |
| `dwq_3bit` (mismo autor) | 27,78B | ~11,76 GB | 0,1398 | safetensors MLX | swift-open-license-1.0 |
| UkisAI GSQ-RCO IQ3_S GGUF | no disponible | a igual bytes | 0,0511 | GGUF | no disponible |
| MLX uniforme 4 bits | 27,78B | 15,13 GB | 0,0475 | safetensors MLX | no disponible |

Todas las alternativas de la tabla son cuantizaciones del mismo modelo base, por lo que la comparacion es de recetas de compresion, no de modelos distintos. No se dispone de comparativas frente a otros modelos de la misma categoria y tamano.

## Limitaciones y advertencias

- El KLD de WikiText de este release es 2,43 veces el del IQ3_S GGUF publicado, y la cuantizacion uniforme de 4 bits de MLX tambien obtiene mejor KLD (0,0475 frente a 0,1241) usando mas almacenamiento (15,13 GB).
- En la comparacion de 30 items de razonamiento, el hermano `dwq_gsq` respondio 24/30 frente a 25/30 del BF16 y uso un 24,7% mas de tokens de pensamiento (IC 95%: 8% a 52%). Este release no tiene una medicion equivalente de tokens de razonamiento, y la muestra es pequena.
- La cabeza MTP no funciona como decodificacion especulativa: acepto 0 de 22 tokens borrador en oMLX, sin aceleracion.
- LM Studio carga el modelo pero genera texto corrupto, segun las comprobaciones del autor.
- La torre de vision y la cabeza MTP no recibieron el pase DWQ, solo la asignacion RCO, por lo que su calidad de cuantizacion puede diferir de la del modelo de texto.
- La licencia es swift-open-license-1.0 (etiquetada como "other"); no se detallan en la informacion disponible las condiciones de uso comercial, por lo que conviene revisar el fichero LICENSE antes de un despliegue en produccion.
- No hay lista oficial de idiomas soportados; el soporte multilingue se infiere solo de los corpus de evaluacion.
- Longitud de contexto no disponible: no se puede garantizar el manejo de conversaciones o documentos largos.
- Al ser una cuantizacion de 3 bits, existe riesgo de degradacion en la fidelidad de la distribucion de siguiente token respecto al BF16, riesgo de alucinacion y posibles sesgos heredados del modelo base, que no estan documentados en esta ficha.
- El modelo base es Qwen3.8-27B y Swift 1.5 27B de UkisAI; cualquier limitacion de esos modelos (sesgos, datos de entrenamiento, comportamiento en dominios concretos) se hereda aqui.

## Enlaces

- HuggingFace (este release): https://huggingface.co/GazTrab/Swift-1.5-Qwen3.8-27b-RCO-DWQ-MLX
- Modelo base: https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-27b
- Paper referenciado (tag arxiv:2604.18556): https://arxiv.org/abs/2604.18556
- Fichero de licencia: LICENSE (incluido en el repositorio)
- Resultados de motores: results/report/release-engines.json (incluido en el repositorio)
- mlx-lm: https://github.com/ml-explore/mlx-lm
- mlx-vlm: https://github.com/Blaizzy/mlx-vlm
