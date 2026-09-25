# latentdivergence/lcm-ssd1b-npu-8gen3

## Resumen

`latentdivergence/lcm-ssd1b-npu-8gen3` es una compilacion del modelo de generacion de imagenes LCM-SSD-1B (Latent Consistency Model destilado de Segmind SSD-1B) empaquetada en formato ONNX con el Execution Provider QNN de Qualcomm, para ejecutarse sobre la NPU Hexagon de los SoC Snapdragon. El autor es el usuario `latentdivergence`, que la publica como componente del pipeline de Latent Studio. No es un modelo de lenguaje: es un modelo de difusion text-to-image de pocos pasos (2-8 pasos de inferencia, frente a los 20-50 tipicos), con unos 1.000 millones de parametros heredados del base SSD-1B.

El repositorio contiene unicamente dos subgrafos compilados: el UNet y el decodificador VAE. Los codificadores de texto y el tokenizer no se incluyen y se comparten con `latentdivergence/sdxl-lightning-4step-int8`, lo que implica que el paquete no es autosuficiente. La relevancia practica esta en que demuestra inferencia de difusion a 1024 px en un telefono movil: 58 segundos extremo a extremo en un Snapdragon 8 Gen 3 real, frente a 5 minutos 40 segundos de SDXL-Lightning ejecutado en la CPU del mismo dispositivo.

La ficha del autor presenta varias inconsistencias que conviene tener presentes: el identificador del repositorio dice `8gen3`, mientras que el titulo de la model card dice `8elite` y afirma que los binarios estan compilados para Hexagon **v79** (Snapdragon 8 Elite); sin embargo, las mediciones declaradas se tomaron sobre un Snapdragon 8 Gen 3. Ademas, la arquitectura esta fijada en tiempo de compilacion: un binario v75 no carga en v79. El repositorio tiene 0 descargas y 0 likes, y no incluye resultados de benchmarks de calidad de imagen.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | UNet de difusion latente (LCM, destilado por consistencia) + decodificador VAE; text encoders externos tipo SDXL. Compilado para QNN/Hexagon NPU |
| Parametros totales | No disponible en la informacion proporcionada (base SSD-1B, del orden de 1.000 millones) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica. Ventana del text encoder: 77 tokens (`encoder_hidden_states [1,77,2048]`). Resolucion de imagen: 1024 px |
| Tipos de cuantizacion | No disponible el esquema exacto del UNet compilado. Los text encoders compartidos se publican como `sdxl-lightning-4step-int8` (int8) |
| Idiomas soportados | No disponible (los text encoders son los de SDXL, orientados a prompts en ingles) |
| Licencia | apache-2.0 (declarada en el repositorio) |
| Formato de pesos | ONNX con EPContext de QNN (`model.onnx` + `model.bin` externo), subcarpetas `unet/` y `vae_decoder/` |

Entradas del UNet compilado: `sample [1,4,128,128]`, `timestep [1]`, `encoder_hidden_states [1,77,2048]`, `time_ids [1,6]`, `text_embeds [1,1280]`, `timestep_cond [1,256]` (embedding de guiado de LCM). Salida: `output_0`.

## Arquitectura y entrenamiento

El modelo es una compilacion, no un entrenamiento nuevo. Parte de `latent-consistency/lcm-ssd-1b`, un Latent Consistency Model destilado de Segmind SSD-1B que reduce la inferencia de difusion a 2-8 pasos manteniendo la compatibilidad con el `UNet2DConditionModel`. Sobre esa base, el autor exporta y compila dos subgrafos a ONNX con contexto de ejecucion QNN para la NPU Hexagon v79. No se documenta dataset, numero de tokens de entrenamiento ni fases de RLHF/DPO para este artefacto, porque no hubo entrenamiento adicional.

La innovacion tecnica relevante esta en el proceso de compilacion y despliegue. El decodificador VAE no se toma del SDXL original: se construye a partir de `madebyollin/sdxl-vae-fp16-fix`, porque el VAE estandar de SDXL desborda en fp16 (dos convoluciones alcanzan picos de 640.538 y 106.287 frente al techo de 65.504 de fp16) y produce imagenes completamente negras; los pesos corregidos tienen un pico maximo de 2.301. Ademas, el uso de `timestep_cond [1,256]` confirma que se conserva el condicionamiento por guiado propio de LCM. El autor senala que Qualcomm AI Hub no pudo perfilar el UNet en un Galaxy S24 con 8-12 GB de RAM, pero que el modelo si funciona en un dispositivo de 15,6 GB, verificado generando imagenes y no por inferencia teorica.

## Capacidades

- Generacion de imagenes text-to-image a 1024 px en 2-8 pasos de inferencia, gracias a la destilacion por consistencia.
- Inferencia en NPU de dispositivo movil: UNet y decodificador VAE compilados para Hexagon, sin depender de la CPU ni de la GPU.
- Ejecucion offline en el dispositivo, con los pesos empaquetados localmente (2,9 GB de repositorio).
- Integracion con pipelines SDXL existentes en cuanto a interfaz: entradas compatibles con el UNet de SDXL (incluidos `time_ids` y `text_embeds`), lo que permite reutilizar text encoders ya convertidos.
- Generacion de imagenes a partir de prompts de texto, con el grado de control que permita el pipeline que lo orqueste (Latent Studio).
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un modelo generativo de imagen.
- No tiene capacidades de vision, audio ni thinking mode.
- No incluye tokenizer, text encoder ni scheduler; hay que aportarlos desde otro repositorio.

## Casos de uso

- Generacion de imagenes en el propio movil sin conexion: el modelo permite crear imagenes de 1024 px en 58 segundos en un Snapdragon 8 Gen 3, lo que habilita apps de edicion o creatividad que no envian el prompt a un servidor.
- Aplicaciones de privacidad estricta: al ejecutarse integramente en la NPU y con los pesos en local, los prompts y las imagenes no salen del dispositivo, algo relevante en entornos sanitarios, legales o corporativos.
- Prototipado de interfaces creativas en Android: sirve para validar flujos de text-to-image en hardware real antes de decidir si se migra a servidor o a un modelo mayor.
- Integracion en asistentes de escritura o notas que ilustran contenido sobre la marcha, aprovechando la ventana de 77 tokens del text encoder para prompts cortos y descriptivos.
- Generacion de recursos graficos de baja prioridad en segundo plano: al delegar en la NPU, la CPU y la GPU quedan libres para la aplicacion principal, con un coste medido de 1777 ms solo en la decodificacion VAE.
- Referencia tecnica para ingenieros que quieran compilar sus propios modelos de difusion a QNN: el repositorio documenta los picos de activacion del VAE en fp16 y la solucion adoptada, lo que es directamente reutilizable.
- Distribucion de demos en ferias o entornos sin red, donde no se puede garantizar conectividad ni acceso a APIs en la nube.

## Benchmarks y rendimiento

| Medicion | Hardware | Resultado |
|---|---|---|
| Imagen de 1024 px, extremo a extremo | Snapdragon 8 Gen 3 (NPU Hexagon) | 58 s |
| Referencia: SDXL-Lightning, misma tarea | CPU del mismo dispositivo | 5 min 40 s |
| Decodificacion del VAE | NPU Hexagon | 1777 ms |

No se han publicado resultados de benchmarks de calidad de imagen (FID, CLIP score, etc.) ni metricas comparativas de fidelidad al prompt en la informacion disponible. Las cifras anteriores son exclusivamente de latencia en dispositivo. La model card tambien indica que Qualcomm AI Hub no pudo perfilar el UNet en un Galaxy S24 de 8-12 GB.

## Requisitos de hardware

- VRAM: no aplica directamente, el destino es una NPU Hexagon, no una GPU. No hay cifras de memoria para GPU en la informacion disponible.
- Memoria del dispositivo: se requiere un terminal con al menos 15,6 GB de RAM, segun la verificacion del autor. En dispositivos de 8-12 GB (Galaxy S24) el perfilado del UNet no fue posible.
- SoC objetivo: NPU Hexagon v79 (segun la model card, Snapdragon 8 Elite); las mediciones se realizaron en Snapdragon 8 Gen 3. La arquitectura es fija en compilacion: un binario v75 no carga en v79.
- GPU de escritorio (A100, H100, RTX 4090): no soportadas por este artefacto. No se puede ejecutar en vLLM, llama.cpp, Ollama ni TGI, porque no es un modelo de lenguaje y los pesos son EPContext de QNN.
- Opciones de despliegue: ONNX Runtime con el Execution Provider QNN de Qualcomm, Qualcomm AI Hub y el pipeline de Latent Studio. En escritorio haria falta reexportar el modelo desde el base `latent-consistency/lcm-ssd-1b` y compilar de nuevo para el backend deseado.
- Latencia: 58 s extremo a extremo para 1024 px y 1777 ms de decodificacion VAE en Snapdragon 8 Gen 3. No se publican cifras de throughput ni de latencia por paso.
- Almacenamiento: repositorio de 2,9 GB, mas los text encoders y el tokenizer, que deben descargarse aparte.

## Comparativa con modelos similares

| Modelo | Tipo | Pasos de inferencia | Hardware de destino | Latencia declarada | Licencia |
|---|---|---|---|---|---|
| lcm-ssd1b-npu-8gen3 | LCM destilado + compilacion QNN | 2-8 | NPU Hexagon v79 (Snapdragon) | 58 s para 1024 px | apache-2.0 |
| latent-consistency/lcm-ssd-1b | LCM destilado (base) | 2-8 | GPU/CPU generica | No disponible | No disponible en la informacion proporcionada |
| segmind/SSD-1B | Difusion estandar | 20-50 | GPU/CPU generica | No disponible | No disponible en la informacion proporcionada |
| SDXL-Lightning | Destilado de SDXL | No disponible | CPU en el mismo dispositivo de prueba | 5 min 40 s | No disponible |

La comparacion relevante no es de calidad, sino de formato y destino: `lcm-ssd1b-npu-8gen3` es la version compilada para NPU del modelo base `lcm-ssd-1b`, con la misma arquitectura y licencia Apache 2.0 declarada. Frente a ejecutar la version original en CPU del propio telefono, la compilacion QNN reduce el tiempo de 5 minutos 40 segundos a 58 segundos en la misma generacion de 1024 px. No se dispone de datos de calidad comparada entre estas variantes.

## Limitaciones y advertencias

- No es un paquete autonomo: faltan el tokenizer, los text encoders y el scheduler. Hay que obtenerlos de `latentdivergence/sdxl-lightning-4step-int8`, lo que anade dependencias y posibles desajustes de version.
- Portabilidad nula entre SoC: el autor advierte explicitamente que un binario compilado para Hexagon v75 no carga en v79. Cada generacion de Snapdragon requiere recompilar.
- Requisito de memoria alto para un movil: funciona en un dispositivo de 15,6 GB, pero Qualcomm AI Hub no consiguio perfilar el UNet en un Galaxy S24 de 8-12 GB. Desplegarlo en gama alta de 8-12 GB es incierto.
- Riesgo de salida invalida por precision numerica: el VAE estandar de SDXL desborda en fp16 y produce imagenes negras. Aunque este repositorio usa los pesos corregidos, cualquier sustitucion del VAE reintroduce el problema.
- Inconsistencia documental: el identificador del repositorio menciona 8 Gen 3, el titulo menciona 8 Elite y el texto declara compilacion para v79, mientras que las medidas se tomaron en 8 Gen 3. Conviene verificar en hardware real antes de asumir compatibilidad.
- Sin datos de calidad: no hay FID, CLIP score ni evaluacion de sesgos. Un modelo de difusion de este tipo puede reproducir sesgos de representacion presentes en los datos de entrenamiento del base, pero no se ha publicado ninguna evaluacion al respecto en la informacion disponible.
- Riesgo de alucinacion visual: como cualquier modelo de difusion, puede generar contenido anatomica o fisicamente incoherente, especialmente con prompts ambiguos y solo 2-8 pasos de inferencia.
- Limite de prompt corto: la ventana de 77 tokens del text encoder de SDXL restringe las descripciones largas y detalladas.
- Licencia: el repositorio declara apache-2.0, pero al derivar de `lcm-ssd-1b` y de `madebyollin/sdxl-vae-fp16-fix` conviene revisar las condiciones de esos modelos base antes de un uso comercial.
- Madurez: 0 descargas y 0 likes, publicado recientemente, sin verificacion independiente de las cifras de rendimiento declaradas.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/latentdivergence/lcm-ssd1b-npu-8gen3
- Variante para Snapdragon 8 Elite: https://huggingface.co/latentdivergence/lcm-ssd1b-npu-8elite
- Text encoders y tokenizer compartidos: https://huggingface.co/latentdivergence/sdxl-lightning-4step-int8
- Modelo base LCM-SSD-1B: https://huggingface.co/latent-consistency/lcm-ssd-1b
- Ficha de LCM-SSD-1B en aimodels.fyi: https://www.aimodels.fyi/models/huggingFace/lcm-ssd-1b-latent-consistency
- VAE corregido en fp16: https://huggingface.co/madebyollin/sdxl-vae-fp16-fix
- Repositorio de Segmind SSD-1B: https://github.com/segmind/SSD-1B
- Notebook de OpenVINO sobre SSD-1B y LCM: https://docs.openvino.ai/2023.3/notebooks/248-ssd-b1-with-output.html
- Paper de Latent Consistency Models: https://arxiv.org/abs/2310.04378
