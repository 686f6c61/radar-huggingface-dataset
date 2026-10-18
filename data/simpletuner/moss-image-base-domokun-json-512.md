# SimpleTuner/moss-image-base-domokun-json-512

## Resumen

`SimpleTuner/moss-image-base-domokun-json-512` es un adaptador LoRA de rango 32 en BF16 entrenado sobre el modelo de difusión `OpenMOSS-Team/MOSS-Image-Base`. No es un modelo completo, sino un ajuste fino ligero publicado por el equipo de SimpleTuner dentro de su serie de experimentos «MOSS-Image LoRA experiments». Su función es especializar el modelo base en un concepto visual concreto (Domokun) a una resolución equivalente de 512 px, manteniendo la relación de aspecto original de cada imagen.

El entrenamiento está documentado como completado: 10.000 de 10.000 actualizaciones observadas, con batch 4, tasa de aprendizaje 0,0001, semilla 42, técnica REPA y una única GPU H100 de 80 GB. El dataset empleado es `RareConcepts/Domokun` (revisión `2e4831a72f2a701c080e0046c8f8ec41cb1ccbcf`), compuesto por solo 29 imágenes, y las captions son JSON nativas compartidas con la otra variante de la misma serie.

Su relevancia es doble: por un lado, sirve como ejemplo reproducible de receta de entrenamiento (se publican `training_config.json`, `dataloader.json`, `prompts.json` y `dataset-manifest.json`); por otro, aloja 20 checkpoints intermedios cada 500 pasos, lo que permite estudiar la evolución del ajuste y comparar estados del adaptador sin reentrenar. El repositorio ocupa 1,7 GB, prácticamente todo atribuible a los checkpoints acumulados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre un modelo de difusión texto a imagen; el modelo base es `OpenMOSS-Team/MOSS-Image-Base` |
| Parámetros totales | no disponible (el adaptador es un LoRA de rango 32; no se publica el recuento de parámetros) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible / no aplica (modelo de imagen; la longitud de prompt no se especifica) |
| Tipos de cuantización | pesos del adaptador en BF16; no se documentan otras variantes (GGUF, FP8, etc.) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors de `diffusers` (`pytorch_lora_weights.safetensors`) |
| Modelo base | `OpenMOSS-Team/MOSS-Image-Base` |
| Tipo de adaptador | LoRA rango 32, BF16 |
| Resolución de entrenamiento | 512 px de área equivalente, relación de aspecto preservada |
| Dataset | `RareConcepts/Domokun`, 29 imágenes, revisión `2e4831a72f2a701c080e0046c8f8ec41cb1ccbcf` |
| Actualizaciones | 10.000 (estado: completado) |
| Checkpoints publicados | 20 (cada 500 pasos, de 500 a 10.000) |
| Tamaño del repositorio | 1,7 GB |
| Librería | `diffusers` |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El adaptador se monta sobre `MOSS-Image-Base`, un modelo de difusión de texto a imagen del que la información disponible no detalla el backbone interno, el número de parámetros ni el volumen de datos de preentrenamiento. Lo que sí está documentado es la capa de ajuste: un LoRA de rango 32 en BF16, entrenado con SimpleTuner, que inyecta el concepto Domokun sin modificar los pesos del modelo base. Las captions son JSON nativas, compartidas deliberadamente con la otra variante de la serie, lo que sugiere un experimento controlado sobre el formato de anotación.

La receta concreta es: batch 4, tasa de aprendizaje 0,0001, semilla 42, técnica REPA (representational alignment) y una H100 de 80 GB durante 10.000 actualizaciones sobre 29 imágenes a 512 px de área equivalente con relación de aspecto preservada. Cada ejecución parte de cero desde el checkpoint liberado del modelo base, sin LoRA asistente. La validación se realiza cada 500 actualizaciones con 50 pasos de muestreo, CFG 3, semilla 42 y cuatro prompts fijos (las imágenes publicadas corresponden a `astronaut`, `garden`, `retention` y `studio`). El particionado de datos y los hiperparámetros completos están en `dataloader.json` y `training_config.json`; la publicación la gestiona un recolector de checkpoints externo, y las flags de Hub usadas en proceso se conservan en la configuración.

## Capacidades

- Generación de imágenes texto a imagen condicionada al concepto Domokun, heredando las capacidades del modelo base MOSS-Image.
- Especialización de un único concepto visual: el adaptador actúa como modulador de estilo/sujeto, no como modelo generalista.
- Generación a 512 px de área equivalente manteniendo la relación de aspecto de la imagen solicitada.
- Composición de escenas: las muestras publicadas cubren contextos distintos (astronauta, jardín, estudio), lo que indica que el concepto se transfiere a escenarios nuevos.
- Prompting con captions en formato JSON, coherente con el formato de anotación usado en el entrenamiento.
- Veinte estados intermedios del adaptador (checkpoint-500 a checkpoint-10000) para comparar grados de ajuste.
- No se documentan tool calling, capacidades de agente, multimodales de entrada (visión como entrada), audio ni modo de razonamiento.

## Casos de uso

- **Generación consistente de un personaje o mascota concreto**: usar el adaptador para producir ilustraciones de Domokun en escenas variadas (astronauta, jardín, estudio) manteniendo la identidad visual del concepto; es el caso directamente validado por las muestras publicadas.
- **Prototipado de pipelines de difusión con `diffusers`**: cargar el LoRA sobre `MOSS-Image-Base` mediante `load_lora_weights` para probar integraciones de generación a 512 px antes de invertir en un modelo mayor.
- **Referencia reproducible de entrenamiento**: reutilizar `training_config.json`, `dataloader.json` y `prompts.json` como plantilla de receta con SimpleTuner (rango 32, batch 4, lr 1e-4, REPA) y verificar resultados con la misma semilla 42.
- **Estudio de formatos de caption**: comparar esta variante de captions JSON con la otra «flavour» de la misma serie para medir el impacto del formato de anotación en el ajuste, con el resto de hiperparámetros fijado.
- **Análisis de dinámica de entrenamiento**: evaluar los 20 checkpoints intermedios para determinar en qué punto aparece sobreajuste con un dataset de solo 29 imágenes, útil para calibrar políticas de parada temprana.
- **Generación de assets a baja resolución para prototipos**: crear bocetos de 512 px para maquetas web, storyboards o pruebas de concepto donde no se requiere alta resolución y prima la velocidad de iteración.
- **Ablación de la técnica REPA en difusión a pequeña escala**: usar la receta como base mínima y desactivar REPA para comparar, dado que el resto de parámetros está documentado y fijado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente incluye validaciones cualitativas (cuatro imágenes por checkpoint cada 500 actualizaciones) sin métricas cuantitativas como FID, CLIP score o similitud de sujeto.

## Requisitos de hardware

- **Entrenamiento**: una GPU H100 de 80 GB, con batch 4 a 512 px de área equivalente y LoRA de rango 32 en BF16 según la configuración publicada.
- **VRAM de inferencia**: no disponible. El adaptador LoRA añade una huella reducida (rango 32 en BF16), pero el requisito dominante es el del modelo base `MOSS-Image-Base`, cuyo tamaño no se especifica en la información proporcionada.
- **GPU recomendadas**: no disponible para inferencia; para entrenamiento, H100 80 GB es la única configuración documentada.
- **Consumer GPU**: no se puede confirmar. Depende íntegramente de si el modelo base cabe en la VRAM disponible; el adaptador por sí solo no es el factor limitante.
- **Opciones de despliegue**: `diffusers` es la librería declarada. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (herramientas orientadas a modelos de lenguaje, no aplicables directamente aquí).
- **Latencia y throughput**: no disponible. Solo se conocen los parámetros de muestreo de validación (50 pasos, CFG 3), no tiempos medidos.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto / resolución | Licencia | Estado |
|---|---|---|---|---|---|
| `SimpleTuner/moss-image-base-domokun-json-512` | LoRA rango 32 sobre MOSS-Image-Base | no disponible | 512 px de área equivalente | Apache 2.0 | 0 descargas, 0 likes |
| `OpenMOSS-Team/MOSS-Image-Base` | Modelo de difusión completo | no disponible | no disponible | no disponible en la información | Modelo base de referencia |
| Otra variante de la serie de experimentos SimpleTuner | LoRA sobre el mismo modelo base | no disponible | 512 px | Apache 2.0 (presumible, no confirmado) | no disponible |

No se dispone de datos de rendimiento ni de otros adaptadores comparables con métricas publicadas en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa.

## Limitaciones y advertencias

- **No es un modelo autónomo**: requiere `OpenMOSS-Team/MOSS-Image-Base` para funcionar; el repositorio solo contiene pesos LoRA y checkpoints.
- **Dataset muy pequeño**: 29 imágenes implican un riesgo alto de sobreajuste al concepto y escasa diversidad; la generalización a escenarios muy alejados del dataset no está demostrada.
- **Resolución limitada**: 512 px de área equivalente; no está entrenado para alta resolución ni para detalles finos.
- **Especialización estrecha**: el adaptador está pensado para un único concepto (Domokun); su uso como mejora generalista degradaría probablemente la calidad del modelo base.
- **Sesgos**: no documentados. Al no publicarse la composición del dataset ni la procedencia de las 29 imágenes, no se pueden evaluar sesgos de representación.
- **Alucinación visual**: como todo modelo de difusión, puede generar anatomías, textos o composiciones incoherentes, especialmente fuera del dominio de entrenamiento.
- **Idiomas**: no disponibles; no se especifica en qué lenguas funcionan las captions ni los prompts de inferencia.
- **Licencia**: el adaptador es Apache 2.0, pero la licencia y las condiciones de uso comercial del modelo base `MOSS-Image-Base` no se detallan en la información disponible y deben verificarse por separado antes de un despliegue en producción.
- **Sin métricas**: la ausencia de benchmarks impide afirmar mejoras cuantitativas frente al modelo base o frente a otros LoRA.
- **Naturaleza experimental**: el propio tag `experiments` y el contador de 0 descargas indican que no es un artefacto validado para producción.
- **Los ficheros del dataset no se redistribuyen** en este repositorio; hay que acudir a `RareConcepts/Domokun` en la revisión indicada para reproducir el entrenamiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/SimpleTuner/moss-image-base-domokun-json-512
- Modelo base: https://huggingface.co/OpenMOSS-Team/MOSS-Image-Base
- Colección de experimentos LoRA: https://huggingface.co/SimpleTuner/moss-image-LoRA-experiments
- Dataset: https://huggingface.co/datasets/RareConcepts/Domokun (revisión `2e4831a72f2a701c080e0046c8f8ec41cb1ccbcf`)
- Último adaptador publicado: https://huggingface.co/SimpleTuner/moss-image-base-domokun-json-512/blob/main/checkpoint-10000/pytorch_lora_weights.safetensors
- Configuración de entrenamiento: https://huggingface.co/SimpleTuner/moss-image-base-domokun-json-512/blob/main/training_config.json
- Configuración del dataloader: https://huggingface.co/SimpleTuner/moss-image-base-domokun-json-512/blob/main/dataloader.json
- Prompts de validación: https://huggingface.co/SimpleTuner/moss-image-base-domokun-json-512/blob/main/prompts.json
- Manifiesto del dataset: https://huggingface.co/SimpleTuner/moss-image-base-domokun-json-512/blob/main/dataset-manifest.json
