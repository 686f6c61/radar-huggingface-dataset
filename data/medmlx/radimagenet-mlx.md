# MedMLX/radimagenet-mlx

## Resumen

MedMLX/radimagenet-mlx es un paquete de pesos convertidos a formato nativo MLX de cuatro codificadores de imagen preentrenados en RadImageNet: ResNet50, DenseNet121, InceptionV3 e InceptionResNetV2. Lo publica el proyecto MedMLX, orientado a inferencia médica en dispositivo para Apple Silicon, y su proposito es permitir la extraccion de caracteristicas de imagenes radiologicas (espaciales y pooled) sin cabezas de clasificacion, ejecutando los modelos de forma nativa sobre el framework MLX de Apple.

El modelo no es un modelo generativo ni un LLM: es un conjunto de encoders de vision para la tarea `image-feature-extraction`. Cada archivo contiene pesos en float32 y la configuracion declarativa del grafo, omitiendo la capa de clasificacion. El repositorio ocupa 0,4 GB y esta pensado para investigacion y educacion, no para uso clinico.

Su relevancia actual radica en que traslada los pesos de RadImageNet (entrenados sobre imagen medica, no sobre ImageNet natural) al ecosistema MLX, lo que facilita su uso en Macs con chips M-series para prototipado, extraccion de embeddings y pipelines de investigacion sin depender de CUDA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cuatro CNN: ResNet50, DenseNet121, InceptionV3, InceptionResNetV2 |
| Parametros totales | no disponible (no se detalla por arquitectura en la model card) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, no de texto) |
| Tipos de cuantizacion | no disponible (los pesos se distribuyen en float32) |
| Idiomas soportados | no disponible (no es modelo de lenguaje) |
| Licencia | MIT |
| Formato de pesos | safetensors nativos MLX (float32) con configuracion de grafo declarativa |

## Arquitectura y entrenamiento

Se trata de cuatro arquitecturas convolucionales clasicas (ResNet50, DenseNet121, InceptionV3 e InceptionResNetV2) preentrenadas por el proyecto oficial RadImageNet, desarrollado por Xueyan Mei y colaboradores en el BioMedical Engineering and Imaging Institute del Icahn School of Medicine at Mount Sinai. Los pesos originales son modelos Keras distribuidos en el archivo de modelos del proyecto; esta publicacion es una conversion a MLX, no un reentrenamiento.

Los archivos omiten las cabezas de clasificacion y exponen tanto caracteristicas espaciales como pooled. La validacion realizada por el autor compara las salidas de los cuatro modelos convertidos con sus equivalentes Keras originales sobre entradas sinteticas de 224 x 224, y reporta que las salidas espaciales y pooled cumplen las tolerancias numericas registradas. No se detallan en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni si hubo etapas de ajuste fino adicionales.

## Capacidades

- Extraccion de caracteristicas de imagen: genera mapas de caracteristicas espaciales y vectores pooled a partir de imagenes de entrada.
- Cuatro backbones alternativos para comparar representaciones (ResNet50, DenseNet121, InceptionV3, InceptionResNetV2).
- Dominio medico: pesos preentrenados en RadImageNet, orientados a imagen radiologica.
- Ejecucion nativa en Apple Silicon mediante MLX, sin CUDA.
- No incluye cabeza de clasificacion: no realiza predicciones de clase por si mismo.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingues (no es un modelo de lenguaje).
- No dispone de modo thinking, vision generativa ni audio.

## Casos de uso

- Extraccion de embeddings para busqueda por similitud de estudios radiologicos: usar la salida pooled de uno de los cuatro encoders para indexar imagenes y recuperar casos similares en un corpus de investigacion.
- Clasificacion downstream con cabezas propias: congelar el encoder y entrenar un clasificador ligero (por ejemplo, regresion logistica o una MLP pequena) sobre las caracteristicas extraidas para tareas como deteccion de hallazgos.
- Segmentacion con caracteristicas espaciales: emplear los mapas espaciales como entrada a un decoder tipo U-Net para tareas de segmentacion en imagen medica.
- Prototipado en Mac: desarrollar y depurar pipelines de vision medica en un Mac con chip M-series antes de escalar a infraestructura con GPU, gracias al soporte nativo de MLX.
- Comparativa de backbones: evaluar cual de las cuatro arquitecturas ofrece mejores representaciones para un dataset concreto sin reentrenar desde cero.
- Docencia e investigacion reproducible: usar los pesos convertidos en cuadernos y practicas sobre imagen radiologica con licencia MIT.
- Aumento de datos y analisis exploratorio: calcular distancias entre embeddings para detectar duplicados, outliers o agrupaciones en un conjunto de imagenes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta una validacion numerica de equivalencia entre las salidas MLX convertidas y las salidas Keras originales sobre entradas sinteticas de 224 x 224, sin metricas de accuracy clinica ni comparaciones de rendimiento frente a otros modelos.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; el repositorio completo ocupa 0,4 GB, por lo que cada encoder individual es ligero y cabe holgadamente en memoria unificada de un Mac moderno.
- GPU recomendadas: no aplica CUDA; el destino es Apple Silicon (chips M1, M2, M3, M4 y variantes Pro/Max/Ultra) mediante MLX.
- Cabe en consumer GPU: si, en el sentido de que esta disenado para hardware de consumo Apple; no se distribuyen pesos para CUDA.
- Opciones de despliegue: libreria MLX y el repositorio `radimagenet-mlx` del autor; no se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MedMLX/radimagenet-mlx | no disponible por arquitectura | no aplica | sin benchmarks publicados | MIT | HuggingFace (MLX) |
| RadImageNet original (Keras) | mismos backbones | no aplica | sin benchmarks en esta ficha | MIT | GitHub + archivo en Drive |
| Encoders ImageNet (ResNet50, etc.) | ~25 M (ResNet50) | no aplica | ampliamente benchmarkeados | variable | multiples frameworks |

La comparacion con encoders genericos de ImageNet es relevante porque RadImageNet esta entrenado sobre imagen medica, lo que suele mejorar la transferencia a tareas radiologicas; sin embargo, en la informacion disponible no hay numeros que cuantifiquen esa diferencia.

## Limitaciones y advertencias

- No es un modelo clinico: el autor indica explicitamente que la validacion no establece precision clinica ni idoneidad para uso clinico; su uso previsto es investigacion y educacion.
- Sin cabeza de clasificacion: requiere construir y entrenar un modulo downstream para cualquier tarea predictiva.
- Riesgo de sesgo: los pesos heredan los sesgos del dataset RadImageNet, cuya composicion no se detalla en la informacion disponible.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero las caracteristicas extraidas pueden no ser representativas para modalidades o poblaciones poco presentes en el entrenamiento original.
- Limitaciones de idioma: no aplica (modelo de vision).
- Restricciones de licencia: MIT, permite uso comercial, pero exige conservar el aviso de copyright de BMEII-AI y la licencia del proyecto original al redistribuir los pesos.
- Dependencia de plataforma: el formato es MLX, por lo que no se ejecuta directamente en CUDA sin conversion adicional.
- Madurez: 0 descargas y 0 likes en el momento de la consulta; proyecto reciente y poco validado por la comunidad.

## Enlaces

- HuggingFace: https://huggingface.co/MedMLX/radimagenet-mlx
- Repositorio del autor: https://github.com/MedMLX/radimagenet-mlx
- Proyecto RadImageNet oficial: https://github.com/BMEII-AI/RadImageNet
- Licencia del proyecto original: https://github.com/BMEII-AI/RadImageNet/blob/main/LICENSE
- Archivo de modelos originales: https://drive.google.com/file/d/1UgYviv2K6QPM1SCexqqab5-yTgwoAFEc/view
- Paper MedMLX: https://doi.org/10.64898/2026.10.28.26366762
