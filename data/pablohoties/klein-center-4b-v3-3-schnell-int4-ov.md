# PabloHoties/Klein-Center-4B-v3.3-schnell-int4-ov

## Resumen

Klein-Center-4B-v3.3-schnell-int4-ov es una conversión a OpenVINO INT4 del modelo de generación y edición de imágenes Klein_Center_4B v3.3 schnell, un finetune de FLUX.2 [klein] 4B desarrollado originalmente por Black Forest Labs. El finetune lo firma TiwazM y la conversión de formato la publica PabloHoties. No se trata, por tanto, de un modelo nuevo entrenado desde cero, sino de un artefacto de despliegue: los pesos ajustados se cuantizan dentro del grafo OpenVINO de la exportación previa de rupeshs, manteniendo la misma estructura de entrada/salida.

El modelo resuelve el problema de ejecutar un modelo de difusión de 4B parámetros para texto-a-imagen y edición de imágenes en hardware Intel (CPU y GPU integradas o dedicadas) sin necesidad de GPUs de gran VRAM, gracias a la cuantización INT4 asimétrica con grupos de 128 en la mayoría de capas e INT8 por canal en el resto. El repositorio ocupa 4,6 GB y se distribuye con licencia Apache 2.0.

Es relevante para desarrolladores que quieran integrar generación y edición de imágenes con LoRAs en entornos Intel mediante el pipeline `OVFlux2KleinPipeline` de optimum-intel o herramientas compatibles como FastSDCPU. La recomendación del autor del finetune es de 4 a 8 pasos de inferencia para la variante schnell.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Modelo de difusión FLUX.2 [klein] (transformer), exportado a grafo OpenVINO |
| Parámetros totales | 4B (según nombre del modelo base FLUX.2-klein-4B) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de imagen, no de texto) |
| Tipos de cuantización | INT4 asimétrica con grupos de 128 en la mayoría de capas; INT8 por canal en el resto (formato NNCF/OpenVINO) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | OpenVINO IR (grafo cuantizado), no safetensors ni GGUF |

## Arquitectura y entrenamiento

La arquitectura subyacente es FLUX.2 [klein] 4B, un modelo de difusión de Black Forest Labs para texto-a-imagen y edición de imágenes. Sobre esa base, TiwazM realizó un finetune (Klein_Center_4B v3.3 schnell) cuyos pesos originales están en fp16 (`Klein_Center_4B_v3_4_4s.safetensors`). Este repositorio no entrena nada: toma esos pesos ajustados y los cuantiza dentro del grafo OpenVINO de la exportación de rupeshs, aplicando la misma precisión por capa que dicha exportación (INT4 asimétrico con grupos de 128 e INT8 por canal, tal como genera NNCF).

El text encoder, el VAE, el tokenizer y el scheduler son los de la exportación original, sin cambios. El script de conversión empleado es `tools/convert_transformer.py`, disponible en el repositorio de la web UI del autor. No se dispone de información sobre el dataset de entrenamiento del finetune, número de pasos, composición de datos ni uso de RLHF/DPO; esos detalles corresponden al autor del finetune y no se recogen en la model card.

## Capacidades

- Generación de imágenes a partir de texto (text-to-image) mediante el pipeline `OVFlux2KleinPipeline`.
- Edición de imágenes, incluyendo el uso de LoRAs compatibles con FLUX.2 klein 4B.
- Inferencia acelerada en hardware Intel (CPU y GPU) gracias a la conversión OpenVINO INT4.
- Compatibilidad de formato con la exportación de rupeshs, por lo que herramientas que cargan esa exportación deberían poder cargar esta (no probado según el autor).
- Recomendación de 4 a 8 pasos de inferencia para la variante schnell.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni multilingüismo textual.

## Casos de uso

- Generación de imágenes en estaciones de trabajo sin GPU dedicada: al estar cuantizado a INT4 y exportado a OpenVINO, puede ejecutarse en CPU Intel, lo que permite prototipar pipelines de texto-a-imagen en portátiles o servidores sin acelerador.
- Edición de imágenes con LoRAs en GPUs Intel: la conservación del layout y de las precisiones permite cargar LoRAs creadas para FLUX.2 klein 4B y aplicar estilos o conceptos concretos en flujos de edición.
- Integración en la web UI de FLUX.2 klein 4B para OpenVINO: el modelo se descarga desde la pestaña "Download model" de dicha interfaz, lo que facilita demos locales de generación y edición.
- Despliegue en FastSDCPU u otras herramientas compatibles con la exportación de rupeshs: útil para entornos de escritorio donde se prioriza la portabilidad sobre el rendimiento máximo.
- Prototipado rápido de conceptos visuales: con 4-8 pasos de inferencia, encaja en ciclos iterativos de diseño donde se generan varias variantes y se refinan con edición.
- Pruebas de pipelines de difusión en CI o entornos de integración: al ser un artefacto de 4,6 GB con licencia Apache 2.0, puede incluirse en imágenes de contenedor o entornos de validación sin restricciones de licencia comercial.
- Evaluación comparativa de cuantización: sirve para medir la pérdida de calidad de INT4 frente a fp16 en un finetune concreto sobre hardware Intel.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/RAM estimada: el repositorio pesa 4,6 GB; al ejecutarse en OpenVINO puede residir en memoria del sistema o en VRAM de GPU Intel según el dispositivo elegido. No se proporcionan cifras exactas de consumo en inferencia.
- GPU recomendadas: GPUs Intel (integradas o dedicadas) por el soporte OpenVINO; también ejecutable en CPU Intel. No se documentan requisitos para A100, H100 o RTX 4090.
- ¿Cabe en GPU de consumo? Sí, el objetivo del formato es precisamente hardware Intel de consumo; no se detallan modelos concretos.
- Opciones de despliegue: web UI de FLUX.2 klein 4B para OpenVINO, `OVFlux2KleinPipeline` de optimum-intel y FastSDCPU (compatibilidad no probada según el autor).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Formato | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| Klein-Center-4B-v3.3-schnell-int4-ov | 4B | OpenVINO IR INT4/INT8 | no aplica | Apache 2.0 | Finetune cuantizado para Intel |
| rupeshs/flux2-klein-4b-int4-ov | 4B | OpenVINO IR INT4/INT8 | no aplica | Apache 2.0 | Exportación base sin finetune; misma estructura |
| black-forest-labs/FLUX.2-klein-4B | 4B | safetensors (fp16) | no aplica | Apache 2.0 | Modelo base original sin cuantizar |
| Klein_Center_4B v3.3 schnell (Civitai) | 4B | safetensors fp16 | no aplica | no disponible en la información | Finetune original de TiwazM |

## Limitaciones y advertencias

- Es una conversión de formato, no un modelo entrenado: la calidad depende enteramente del finetune de TiwazM y del modelo base FLUX.2 klein 4B.
- La cuantización INT4 puede introducir degradación de calidad frente a los pesos fp16 originales; no se han publicado métricas que cuantifiquen esa pérdida.
- La compatibilidad con herramientas que cargan la exportación de rupeshs no ha sido probada por el autor.
- No se documentan sesgos conocidos, pero al ser un modelo de difusión entrenado con datos web, es esperable que herede sesgos de representación; no hay información específica en la model card.
- Riesgo de alucinación visual y de generación de contenido inexacto o inapropiado inherente a los modelos de difusión; no se detallan filtros de seguridad.
- No se especifican idiomas soportados para los prompts.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar la licencia del finetune original en Civitai, que no se indica en la información disponible.
- El rendimiento está ligado al ecosistema OpenVINO; en GPUs NVIDIA o AMD no es el formato adecuado.

## Enlaces

- Hugging Face: https://huggingface.co/PabloHoties/Klein-Center-4B-v3.3-schnell-int4-ov
- Modelo base: https://huggingface.co/black-forest-labs/FLUX.2-klein-4B
- Exportación OpenVINO de referencia: https://huggingface.co/rupeshs/flux2-klein-4b-int4-ov
- Web UI OpenVINO: https://github.com/PabloHoties/flux.2-klein-4b-openvino-webui
- FastSDCPU: https://github.com/rupeshs/fastsdcpu
- Finetune original en Civitai: https://civitai.com/models/2337386/kleincenter4b?modelVersionId=3068988
- Mirror del finetune: https://civitai.red/models/2337386/kleincenter4b?modelVersionId=3068988
