# mlx-community/sapiens2-normal-1b-bf16

## Resumen

mlx-community/sapiens2-normal-1b-bf16 es la conversion a MLX y bfloat16 del checkpoint facebook/sapiens2-normal-1b, el modelo de estimacion de normales de superficie por pixel de la familia Sapiens2 de Meta (presentada en ICLR 2026). Sapiens2 es una familia de modelos de vision centrados en el ser humano (human-centric) y este checkpoint concreto resuelve una tarea densa: predecir, para cada pixel de una imagen, un vector normal de superficie de longitud unitaria, con salida de forma (H, W, 3) a la resolucion de entrada.

La relevancia de esta publicacion es practica: el checkpoint original esta en float32 y pesa aproximadamente el doble, mientras que esta version lo reempaqueta en bfloat16 (3,08 GB de safetensors) y fusiona las proyecciones q/k/v en un unico tensor wqkv por bloque, tal y como espera el modelo Sapiens2 de mlx-vlm. El resultado se ejecuta de forma nativa sobre Apple Silicon mediante MLX, sin necesidad de GPU NVIDIA ni de convertir pesos manualmente.

Se trata de un modelo denso de 1.539.334.323 parametros (aproximadamente 1,54 B), con licencia sapiens2-license (license: other) y sin resultados de benchmarks publicados en la informacion disponible. No es un modelo de lenguaje: no procesa texto ni tiene ventana de contexto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de vision (ViT) con atencion q/k/v por bloque; familia Sapiens2 de Meta |
| Parametros totales | 1.539.334.323 (aproximadamente 1,54 B) |
| Longitud de contexto | No aplica: modelo de vision sin contexto de texto. La resolucion de entrada condiciona el coste; no se declara limite maximo en la informacion disponible |
| Tipos de cuantizacion | bfloat16 (bf16) en este repositorio; no se declaran otras cuantizaciones (GGUF, int8, etc.) |
| Idiomas soportados | No disponible (modelo de vision, sin procesamiento de lenguaje) |
| Licencia | sapiens2-license (license: other); texto en https://github.com/facebookresearch/sapiens2/blob/main/LICENSE.md |
| Formato de pesos | safetensors en bfloat16, formato MLX (model.safetensors de 3,08 GB) |
| Tarea declarada | depth-estimation en el pipeline_tag; la salida real del checkpoint son normales de superficie por pixel |
| Modelo base | facebook/sapiens2-normal-1b |
| Tamano del repositorio | 3,1 GB |
| Libreria | mlx (mlx-vlm) |
| Fecha de creacion | 2026-09-13 |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna ni el proceso de entrenamiento del checkpoint original. Lo que si se puede afirmar a partir del repositorio es que se trata de un transformer de vision: cada bloque contiene proyecciones de query, key y value que en esta conversion MLX se han fusionado en un unico tensor wqkv, una reorganizacion de pesos especifica del modelo Sapiens2 implementado en mlx-vlm. El checkpoint es denso (no MoE), con 1.539.334.323 parametros almacenados integramente en bfloat16, la misma precision mixta que usa la referencia en inferencia.

No hay datos en la informacion proporcionada sobre el numero de tokens o imagenes de entrenamiento, la composicion del dataset, el uso de RLHF/DPO ni innovaciones tecnicas concretas mas alla de la conversion. La model card remite explicitamente a la model card original de facebook/sapiens2-normal-1b para la descripcion del modelo, el uso previsto y la licencia. La conversion se realizo con mlx-vlm 0.7.0.

## Capacidades

- Estimacion de normales de superficie por pixel: devuelve un array de forma (H, W, 3) con vectores de longitud unitaria que describen la orientacion de la superficie en cada punto de la imagen.
- Prediccion densa a la resolucion de entrada: la salida se genera a la misma resolucion de la imagen de entrada (tareas densas) o en coordenadas de pixel de la imagen original (pose, en el caso de los checkpoints de esa tarea).
- Procesamiento centrado en el cuerpo humano: el modelo pertenece a la familia human-centric de Sapiens2, orientada a imagenes de personas.
- Ejecucion nativa en Apple Silicon mediante MLX y el modulo mlx_vlm.models.sapiens2, con una clase Sapiens2Predictor que expone el metodo infer.
- Integracion como parte de un pipeline mayor: la salida en numpy permite encadenarla con etapas posteriores de reconstruccion 3D, renderizado o analisis geometrico.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, generacion de texto, codigo, matematicas ni capacidades multilingues: es exclusivamente un modelo de vision.

## Casos de uso

- Reconstruccion 3D de personas: las normales por pixel alimentan algoritmos de fotometria estereoscopica o de optimizacion de mallas para recuperar geometria de superficie de un sujeto a partir de una o varias imagenes, con la ventaja de que la salida ya viene en el sistema de coordenadas de la imagen de entrada.
- Relighting e integracion en VFX: los mapas de normales permiten recalcular la iluminacion de una persona capturada para insertarla en una escena virtual con coherencia de sombreado, sin necesidad de un escaneo 3D completo.
- Virtual try-on y realidad aumentada: en aplicaciones de prueba virtual de ropa, las normales de la superficie corporal dan la orientacion necesaria para deformar y sombrear la prenda superpuesta de forma plausible.
- Preprocesado para generacion 3D y NeRF/Gaussian splatting: las normales actuan como supervision o inicializacion de la geometria en pipelines de reconstruccion neuronal, reduciendo artefactos en zonas de baja textura.
- Captura de movimiento y avatares en produccion: combinado con los checkpoints de pose de la misma familia Sapiens2, este modelo completa la informacion geometrica necesaria para construir avatares animables.
- Antropometria y analisis de forma corporal: medicion de siluetas y superficies en estudios de salud deportiva o ergonomia, siempre que se valide el sesgo del modelo sobre la poblacion objetivo.
- Inferencia local en Mac: prototipado e investigacion sobre equipos Apple Silicon sin GPU dedicada, gracias a los 3,08 GB de pesos en bf16 y a la integracion con mlx-vlm.
- Postproduccion fotografica: generacion de normal maps para tecnicas de dodging y burning basadas en geometria, o para transferencia de detalle entre imagenes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card de esta conversion no incluye metricas de error angular medio, ni comparaciones cuantitativas con otros estimadores de normales. Tampoco hay datos de latencia o throughput medidos.

## Requisitos de hardware

- VRAM/memoria estimada para inferencia: los pesos ocupan 3,08 GB en bfloat16 (calculo derivado de 1,539 B de parametros a 2 bytes). Hay que sumar activaciones, cuyo tamano crece con la resolucion de entrada; a resoluciones altas la memoria necesaria puede superar ampliamente la de los pesos.
- Memoria unificada recomendada: al menos 8 GB para resoluciones moderadas y 16 GB o mas para trabajar con imagenes grandes o lotes. Es una estimacion, no un dato publicado por el autor.
- GPU compatibles: MLX esta disenado para Apple Silicon, por lo que el objetivo natural son los chips de la familia M (M1, M2, M3, M4 y sus variantes Pro, Max y Ultra). No se ejecuta de forma nativa en CUDA.
- GPU de consumo: si, cabe en cualquier Mac con Apple Silicon con memoria unificada suficiente. En el ecosistema NVIDIA habria que usar el checkpoint original de facebook en PyTorch, no esta conversion.
- Opciones de despliegue: mlx-vlm 0.7.0 o superior (carga con mlx_vlm.load y prediccion con Sapiens2Predictor). No aplican vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje ni se distribuye en GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Precision y tamano de pesos | Formato / runtime | Licencia | Observaciones |
|---|---|---|---|---|---|
| mlx-community/sapiens2-normal-1b-bf16 (este modelo) | 1,539 B | bf16, 3,08 GB | safetensors MLX, mlx-vlm | sapiens2-license | Conversion comunitaria, 0 descargas y 0 likes en el momento de la consulta |
| facebook/sapiens2-normal-1b | 1,539 B (mismo modelo base) | float32, aproximadamente el doble de tamano (unos 6,2 GB) | safetensors, PyTorch | sapiens2-license | Checkpoint de referencia de Meta; requiere conversion para Apple Silicon |
| facebook/sapiens2-pose-1b | No disponible | No disponible | No disponible | sapiens2-license | Variante de la misma familia citada en resultados de busqueda, orientada a pose en lugar de normales |
| Otros estimadores monograficos de normales (por ejemplo, la familia Sapiens original) | No disponible | No disponible | No disponible | No disponible | No hay datos comparativos en la informacion proporcionada |

## Limitaciones y advertencias

- Sesgo de dominio: al ser un modelo human-centric, su comportamiento fuera de imagenes de personas no esta garantizado y no se documenta en la informacion disponible.
- Sesgos de representacion: no se publican analisis de equidad por tono de piel, complexion, vestimenta o contexto cultural; conviene validar el modelo sobre la poblacion concreta de cada aplicacion antes de usarlo en produccion.
- Errores de geometria: en oclusiones, ropa holgada, pelo, manos y superficies especulares o muy reflectantes las normales pueden ser incorrectas o inconsistentes. No hay metricas publicadas de error angular para acotar el problema.
- Perdida de precision por la conversion: este checkpoint usa bfloat16, mientras que la referencia se distribuye en float32. La model card solo indica que la referencia ejecuta inferencia en precision mixta bf16, pero no cuantifica la diferencia de exactitud frente al checkpoint original.
- Ausencia de contexto y de lenguaje: no procesa texto, no tiene ventana de contexto y no admite instrucciones en lenguaje natural.
- Dependencia de plataforma: MLX es un framework para Apple Silicon. Desplegar en servidores con GPU NVIDIA exige usar el checkpoint original, no esta conversion.
- Licencia: se trata de license: other con nombre sapiens2-license. Las condiciones exactas de uso comercial, redistribucion y atribucion estan en el LICENSE.md del repositorio de Sapiens2, que hay que revisar antes de cualquier uso en produccion.
- Madurez: el repositorio tiene 0 descargas y 0 likes, por lo que no existe validacion independiente de la calidad de la conversion.
- Incoherencia de etiquetado: el pipeline_tag es depth-estimation, pero la tarea real del checkpoint es estimacion de normales. Hay que tenerlo en cuenta al integrarlo en herramientas que se guien por ese campo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mlx-community/sapiens2-normal-1b-bf16
- Modelo base: https://huggingface.co/facebook/sapiens2-normal-1b
- Licencia Sapiens2: https://github.com/facebookresearch/sapiens2/blob/main/LICENSE.md
- Organizacion mlx-community: https://huggingface.co/mlx-community
- Framework MLX: https://mlx-framework.org/
- Repositorio MLX: https://github.com/ml-explore/mlx
- MLX en Apple Open Source: https://opensource.apple.com/projects/mlx/
- mlx-vlm: referenciado en la model card como la libreria de conversion y carga (version 0.7.0); no se proporciona URL en la informacion disponible
