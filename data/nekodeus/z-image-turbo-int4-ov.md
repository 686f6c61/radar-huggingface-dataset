# Nekodeus/z-image-turbo-int4-ov

## Resumen

Z-Image-Turbo INT4 OpenVINO es una conversion a formato OpenVINO IR con pesos cuantizados a INT4 del modelo de generacion de imagenes Tongyi-MAI/Z-Image-Turbo, publicada por el usuario Nekodeus. No se trata de un modelo entrenado desde cero ni de un ajuste fino, sino de una exportacion de inferencia: el autor toma los pesos originales de un Diffusion Transformer (DiT) de 6.000 millones de parametros, disenado para generar imagenes en 8 pasos de difusion, y los convierte con `optimum-cli export openvino --weight-format int4` para que puedan ejecutarse sin dependencia de CUDA.

La relevancia de esta ficha esta en el formato, no en el modelo base: al pasar el transformer de aproximadamente 6,2 GB en BF16 a unos 3,1 GB en INT4 (group-size 64), la conversion permite desplegar un DiT de 6B en tarjetas con 8 GB de VRAM, e incluso en CPU pura mediante el runtime de OpenVINO. El pipeline declara generacion en 8 pasos, lo que el autor situa por debajo del segundo en hardware compatible.

Se trata de un repositorio de terceros, sin descargas ni valoraciones en el momento de redactar esta ficha, con una model card minima y sin licencia declarada en el propio repositorio. El modelo fuente (Tongyi-MAI/Z-Image-Turbo) se distribuye bajo Apache-2.0 segun indica el autor de la conversion. El idioma declarado es unicamente el ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Transformer (DiT) de un solo flujo (single-stream), 8 pasos de difusion |
| Parametros totales | ~6B (segun la model card; corresponde al transformer del modelo fuente) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo text-to-image, no procesa contexto de texto autoregresivo) |
| Tipos de cuantizacion | INT4 con group-size 64 (formato OpenVINO IR); el modelo fuente en BF16 |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible en el repositorio; el modelo fuente Tongyi-MAI/Z-Image-Turbo se declara Apache-2.0 en la model card |
| Formato de pesos | OpenVINO IR (`model.xml` + `model.bin`); el modelo original en safetensors |
| Tamano del repositorio | 5,7 GB |
| Herramienta de conversion | `optimum-cli export openvino --weight-format int4` (sin pases especificos de fabricante) |
| Libreria de inferencia | OpenVINO (`openvino`, `library_name: openvino`) |
| Pipeline | text-to-image |

## Arquitectura y entrenamiento

El modelo subyacente es Z-Image-Turbo, descrito en la model card como un DiT de un solo flujo (single-stream) de 6.000 millones de parametros con un regimen de 8 pasos. La variante aqui publicada no introduce cambios de arquitectura ni reentrenamiento: es una exportacion del grafo a OpenVINO IR con cuantizacion de pesos a INT4 (group-size 64), realizada con la herramienta `optimum-cli` en modo neutral respecto al fabricante, es decir, sin pases de optimizacion especificos de NVIDIA, AMD o Intel. Esto implica que el grafo debe ser compatible con el runtime generico de OpenVINO y que la aceleracion depende del plugin de dispositivo disponible (CPU, GPU integrada o GPU discreta).

No se dispone de informacion en la documentacion proporcionada sobre el dataset de entrenamiento del modelo original, el numero de tokens o imagenes utilizadas, la composicion de los datos, ni sobre si se aplicaron tecnicas de alineacion como RLHF, DPO o destilacion por pasos (aunque la denominacion "Turbo" y el regimen de 8 pasos apuntan a un proceso de destilacion, este dato no queda confirmado en la model card). Tampoco se documentan innovaciones tecnicas adicionales de la conversion, mas alla del ahorro de memoria que aporta la cuantizacion INT4 y la eliminacion de la dependencia de CUDA.

## Capacidades

- Generacion de imagenes a partir de descripciones textuales (text-to-image) en ingles.
- Inferencia en 8 pasos de difusion, lo que reduce el coste computacional frente a pipelines de 20-50 pasos.
- Ejecucion en CPU mediante OpenVINO, sin necesidad de GPU NVIDIA ni de CUDA.
- Aceleracion en GPU cuando el runtime detecta hardware compatible (AMD, NVIDIA, Intel) a traves del mecanismo `AUTO` de OpenVINO.
- Carga de pesos en INT4 con group-size 64, lo que reduce el espacio ocupado por el transformer de aproximadamente 6,2 GB a unos 3,1 GB.
- Soporte de tool calling / function calling: no aplica (modelo generativo de imagen, no conversacional).
- Soporte de agentes y razonamiento multi-paso: no aplica.
- Capacidades multilingues: no disponibles; la model card solo declara ingles.
- Modo "thinking", vision o audio: no aplica.

## Casos de uso

- Generacion de imagenes en equipos sin GPU dedicada: al ejecutarse sobre CPU con OpenVINO, permite montar un servicio de generacion de imagenes en servidores convencionales, sin depender de CUDA ni de tarjetas NVIDIA.
- Despliegue en portatiles y estaciones de trabajo con 8 GB de VRAM: la cuantizacion INT4 del transformer encaja en tarjetas de gama media, lo que habilita prototipado local de producto grafico sin acceso a un cluster.
- Generacion por lotes en entornos de CPU escalados horizontalmente: con 8 pasos por imagen, el coste por inferencia es bajo y permite distribuir la carga entre varios nodos sin GPU.
- Prototipado rapido de interfaces de texto a imagen: util para validar prompts, estilos y flujos de producto antes de invertir en modelos de mayor calidad o en hardware dedicado.
- Integracion en aplicaciones de escritorio o edge: el paquete OpenVINO (5,7 GB) puede empaquetarse con la aplicacion y ejecutarse en el dispositivo del usuario final, sin llamadas a servicios externos.
- Evaluacion comparativa de cuantizacion: sirve como referencia para medir la perdida de calidad entre BF16 y INT4 sobre un DiT de 6B, y para validar si el ahorro de memoria justifica la degradacion en un flujo concreto.
- Investigacion sobre inferencia acelerada en hardware heterogeneo: al usar un grafo neutral de fabricante, permite comparar rendimiento entre CPU Intel, GPU AMD y GPU NVIDIA con el mismo artefacto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas objetivas (FID, CLIP score, ImageReward ni comparativas con otros modelos), y unicamente afirma que el pipeline de 8 pasos "se mantiene por debajo del segundo" en hardware compatible, sin especificar la GPU o CPU concreta empleada.

## Requisitos de hardware

- VRAM estimada para el transformer en INT4: aproximadamente 3,1 GB (frente a los ~6,2 GB en BF16 indicados por el autor). El repositorio completo ocupa 5,7 GB, por lo que hay que sumar el espacio del codificador de texto y del VAE.
- Caben en GPU de consumo con 8 GB de VRAM o mas; el autor situa explicitamente el objetivo en tarjetas de 8 GB.
- Ejecucion en CPU pura soportada por OpenVINO; no requiere CUDA ni controladores NVIDIA.
- Aceleracion en GPU AMD, NVIDIA e Intel a traves del plugin de dispositivo de OpenVINO (seleccion automatica con `AUTO`).
- Opciones de despliegue: runtime de OpenVINO (`openvino.Core`, `read_model` + `compile_model`), `optimum-cli` para la exportacion y despliegue del artefacto IR. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: el autor afirma inferencia por debajo del segundo por imagen con 8 pasos en hardware compatible; no se especifican GPU, resolucion, tamano de lote ni CPU concretos, por lo que la cifra no es verificable con la informacion disponible.
- No se dispone de datos de memoria RAM necesaria para la ejecucion en CPU ni de requisitos de almacenamiento en disco mas alla de los 5,7 GB del repositorio.

## Comparativa con modelos similares

| Modelo | Parametros | Formato / cuantizacion | Pasos | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|---|
| Nekodeus/z-image-turbo-int4-ov | ~6B (transformer) | OpenVINO IR INT4 | 8 | en | no disponible (fuente Apache-2.0) | Conversion de terceros, ejecutable en CPU y sin CUDA |
| Tongyi-MAI/Z-Image-Turbo | ~6B (transformer) | safetensors (BF16) | 8 | no disponible | Apache-2.0 | Modelo fuente oficial, requiere mas memoria |
| FLUX.1-schnell | ~12B (aproximado) | safetensors | 4 | no disponible | Apache-2.0 | Alternativa destilada de mayor tamano; los datos de rendimiento no se han verificado en esta ficha |
| SDXL | ~3,5B (UNet + codificadores, aproximado) | safetensors, GGUF en conversiones de terceros | 20-50 | en | CreativeML Open RAIL++-M | Alternativa mas antigua y de menor coste de memoria; datos sujetos a la documentacion publica de cada proyecto |

Los datos de rendimiento comparado (FID, CLIP score, calidad percibida) no estan disponibles en la informacion proporcionada, por lo que la comparativa se limita a parametros, formato, licencia y disponibilidad. Los valores de parametros y licencias de los modelos alternativos provienen de su documentacion publica y no se han contrastado con benchmarks en esta ficha.

## Limitaciones y advertencias

- Repositorio de terceros: el autor no es el desarrollador del modelo original, por lo que no hay garantia de que la conversion INT4 reproduzca fielmente el comportamiento del modelo fuente.
- Sin licencia declarada en el repositorio de HuggingFace. Aunque la model card indica que el modelo fuente es Apache-2.0, la ausencia de un archivo de licencia propio genera incertidumbre juridica para uso comercial.
- Model card minima: no se documentan sesgos, composicion del dataset, resolucion de salida soportada ni parametros de muestreo recomendados.
- Riesgo de degradacion por cuantizacion: el paso de BF16 a INT4 con group-size 64 puede introducir perdida de calidad frente al checkpoint original; no se han publicado metricas que cuantifiquen esa diferencia.
- Riesgo de alucinacion visual: como todo modelo text-to-image, puede generar contenido incoherente, texto ilegible en la imagen o elementos anatomicamente incorrectos.
- Limitacion idiomatica: la model card solo declara ingles, por lo que el comportamiento con prompts en castellano u otros idiomas no esta garantizado.
- Cero descargas y cero valoraciones en el momento de la consulta, lo que implica ausencia de validacion por parte de la comunidad.
- El campo `inference: false` de la metadata indica que el modelo no esta habilitado para inferencia alojada en HuggingFace; hay que ejecutarlo localmente con OpenVINO.
- Los datos de latencia sub-segundo son afirmaciones del autor sin especificacion de hardware, resolucion ni lote, por lo que no deben tomarse como garantia de produccion.
- No se detalla el soporte de resoluciones, el uso de clasificador libre de guia (CFG) ni parametros como negative prompts, lo que limita la planificacion de un despliegue productivo.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Nekodeus/z-image-turbo-int4-ov
- Modelo fuente: https://huggingface.co/Tongyi-MAI/Z-Image-Turbo
- Herramienta de exportacion OpenVINO (optimum-cli): no disponible en la informacion proporcionada
- Paper del modelo base: no disponible en la informacion proporcionada
- Blog o demo oficial: no disponible en la informacion proporcionada
- Repositorio de codigo: no disponible en la informacion proporcionada
