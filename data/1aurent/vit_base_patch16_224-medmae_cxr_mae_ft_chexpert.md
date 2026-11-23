# 1aurent/vit_base_patch16_224.medmae_CXR_mae_ft_CheXpert

## Resumen

El modelo `vit_base_patch16_224.medmae_CXR_mae_ft_CheXpert`, publicado por el usuario 1aurent en Hugging Face, es un Vision Transformer de tipo base (ViT-Base) adaptado al dominio de radiografia de torax (CXR, chest X-ray) mediante preentrenamiento auto-supervisado tipo MAE (Masked Autoencoder) y posterior ajuste fino supervisado sobre el conjunto de datos CheXpert. Con 85.802.501 parametros, se posiciona como un clasificador de imagenes medicas de tamano contenido, pensado para tareas de etiquetado multi-etiqueta de hallazgos radiologicos.

La arquitectura sigue el esquema canonico de ViT-Base con parches de 16x16 y resolucion de entrada de 224x224, empaquetada en formato `timm` (PyTorch Image Models), lo que facilita su integracion en pipelines existentes de clasificacion de imagenes. El modelo se distribuye en safetensors bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones adicionales mas alla de las propias del dataset subyacente.

Su relevancia actual reside en la combinacion de un preentrenamiento de dominio medico (`medmae_CXR`) con un ajuste fino sobre un benchmark ampliamente utilizado en la literatura de imagen medica (CheXpert), lo que lo convierte en una referencia practica para experimentos de clasificacion de patologias toracicas con recursos computacionales moderados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer (ViT-Base, patch 16, resolucion 224) |
| Parametros totales | 85.802.501 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de vision, sin contexto textual) |
| Tipos de cuantizacion | no disponible (pesos safetensors en precision original) |
| Idiomas soportados | no disponible (modelo de vision, sin procesamiento de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria `timm`) |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura ViT-Base estandar: un transformer de 12 capas con atencion multi-cabeza, dimension de embedding de 768 y 12 cabezas de atencion, operando sobre una secuencia de 196 parches de 16x16 extraidos de imagenes de 224x224. La cabeza de clasificacion se ajusta al numero de clases de CheXpert (etiquetado multi-etiqueta de hallazgos radiologicos).

El entrenamiento sigue un esquema en dos fases. Primero, un preentrenamiento auto-supervisado tipo MAE (Masked Autoencoder) sobre imagenes de radiografia de torax, identificado en el nombre del modelo como `medmae_CXR`, que permite al modelo aprender representaciones del dominio medico sin necesidad de etiquetas. Despues, un ajuste fino supervisado (`mae_ft`) sobre el dataset CheXpert, que contiene radiografias de torax anotadas con multiples patologias. No se dispone en la informacion proporcionada de detalles sobre el numero exacto de tokens de entrenamiento, la composicion del dataset de preentrenamiento ni si se aplicaron tecnicas de RLHF o DPO (no aplicables en un modelo de vision).

## Capacidades

- Clasificacion de imagenes de radiografia de torax en multiples categorias de hallazgos (etiquetado multi-etiqueta).
- Extraccion de caracteristicas visuales de dominio medico gracias al preentrenamiento MAE sobre CXR.
- Integracion directa con la libreria `timm` para carga, inferencia y ajuste fino posterior.
- No dispone de soporte de tool calling ni function calling (modelo puramente de vision).
- No dispone de capacidades de agente ni razonamiento multi-paso.
- Sin capacidades multilingues ni de generacion de texto.
- Sin modo de pensamiento (thinking mode), vision adicional ni audio.

## Casos de uso

- Triaje automatizado de radiografias de torax: el modelo puede clasificar estudios en categorias de hallazgos para priorizar la revision por radiologos, aprovechando su ajuste fino sobre CheXpert.
- Investigacion en imagen medica: sirve como baseline reproducible para experimentos de clasificacion multi-etiqueta, al estar empaquetado en `timm` y distribuirse con licencia permisiva.
- Ajuste fino sobre datasets propios: al ser un ViT-Base de 85 M de parametros, se puede reentrenar la cabeza de clasificacion sobre cohortes locales con recursos de una sola GPU.
- Extraccion de embeddings para busqueda de imagenes medicas similares: las representaciones internas del modelo pueden indexarse para recuperacion por similitud.
- Preentrenamiento de dominio para tareas derivadas: el checkpoint `medmae_CXR` puede servir como inicializacion para segmentacion o deteccion en pipelines de imagen medica.
- Docencia y prototipado: su tamano reducido (0,3 GB de repo) permite desplegarlo en entornos con recursos limitados para demostraciones de clasificacion medica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,4-0,7 GB en FP32 para los 85,8 M de parametros, mas el espacio de activaciones segun el tamano de lote.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; RTX 3060, RTX 4090, A100 o H100 son suficientes y sobredimensionadas para inferencia.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU consumer moderna (GTX 1650 en adelante) e incluso en CPU para inferencia por lotes pequenos.
- Opciones de despliegue: `timm` + PyTorch como via principal; exportacion a ONNX o TorchScript para servir; `torch.compile` para acelerar; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo de vision de este tipo).
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| vit_base_patch16_224.medmae_CXR_mae_ft_CheXpert | 85,8 M | Imagen 224x224 | Clasificacion CXR multi-etiqueta | Apache 2.0 | Hugging Face (`timm`) |
| ViT-Base ImageNet (google/vit-base-patch16-224) | ~86 M | Imagen 224x224 | Clasificacion generica | Apache 2.0 | Hugging Face |
| Modelos CXR especializados tipo DenseNet-121 (CheXpert) | ~7-8 M | Imagen variable | Clasificacion CXR | variable | Repositorios academicos |

La comparativa con alternativas especificas de clasificacion CXR no esta disponible con datos de rendimiento en la informacion proporcionada; la tabla anterior solo refleja diferencias de arquitectura, tamano y licencia.

## Limitaciones y advertencias

- Modelo de vision sin capacidades de lenguaje: no procesa texto ni mantiene conversaciones.
- Riesgo de alucinacion no aplica en el sentido generativo, pero si existe riesgo de falsos positivos y falsos negativos en la clasificacion de hallazgos.
- Sesgos potenciales derivados del dataset CheXpert (composicion demografica y de equipos de adquisicion), no documentados en la model card.
- No debe usarse como herramienta de diagnostico clinico sin validacion externa y supervision medica; no se declara conformidad regulatoria.
- Licencia Apache 2.0 permisiva para uso comercial, pero las condiciones del dataset CheXpert subyacente pueden imponer restricciones adicionales que el usuario debe verificar.
- No se documentan limitaciones de contexto ni de idioma por tratarse de un modelo de imagen; la informacion sobre robustez ante distintas resoluciones o modalidades de adquisicion no esta disponible.

## Enlaces

- Hugging Face: https://huggingface.co/1aurent/vit_base_patch16_224.medmae_CXR_mae_ft_CheXpert
- Libreria `timm`: https://github.com/huggingface/pytorch-image-models
- Dataset CheXpert (referencia): https://stanfordmlgroup.github.io/competitions/chexpert/
