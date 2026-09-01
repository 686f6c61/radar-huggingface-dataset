# enmingzhangzz/Qwen2.5-VL-7B-OPSD-VisionZip-r010-Btop50-signedFtop50-lambda05-gap01-10240

## Resumen

Este repositorio contiene un adaptador LoRA (PEFT) entrenado sobre el modelo base `Qwen/Qwen2.5-VL-7B-Instruct`, un modelo multimodal de visión-lenguaje de 7.000 millones de parámetros desarrollado por Alibaba Cloud. El adaptador aplica una técnica de poda de tokens visuales denominada VisionZip, combinada con un método de entrenamiento llamado OPSD (Optimized Pruning and Sparse Distillation, según la nomenclatura del autor), que reduce la cantidad de tokens visuales procesados al 10% de los originales. El objetivo es acelerar la inferencia y reducir el coste computacional en tareas de razonamiento visual, manteniendo un rendimiento aceptable.

El adaptador se entrenó sobre 10.240 muestras del dataset `OpenMMReasoner/OpenMMReasoner-SFT-874K`, con una configuración específica de agrupación de tokens (top-B/top-signed-F) y un factor de retención absoluta de 0,01. El tamaño del repositorio es de 0,2 GB, correspondiente únicamente a los pesos del adaptador. Para su uso, es necesario cargarlo sobre el modelo base con la librería PEFT y aplicar el parche de runtime de VisionZip para la inferencia podada. La licencia y los idiomas soportados no están especificados en la información disponible.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2.5-VL-7B-Instruct (transformer multimodal) con adaptador LoRA |
| Parametros totales | no disponible (adaptador LoRA, r=16, alpha=32) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin cuantizar) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors (adapter_model.safetensors) y adapter_config.json |

## Arquitectura y entrenamiento

El adaptador se basa en la arquitectura del modelo Qwen2.5-VL-7B-Instruct, un transformer multimodal que procesa texto e imágenes. La innovación principal reside en la poda de tokens visuales mediante VisionZip, que reduce la secuencia de tokens de imagen a un 10% de su tamaño original (retention ratio 0,1). El entrenamiento utiliza el método OPSD, que combina destilación con un teacher EMA (decay 0,9999) y una agrupación de tokens basada en un presupuesto de tokens con selección top-B y top-signed-F. Los hiperparámetros incluyen un factor de intervención B/B+ de 0,01, fracciones de candidatos de 0,5 y un lambda de agregación de 0,5. El entrenamiento se realizó con un batch global de 32 (4 GPUs, micro-batch 2, acumulación 4) sobre 10.240 muestras del dataset OpenMMReasoner-SFT-874K, con un preprocesado de imágenes a 846.720 píxeles. El adaptador LoRA tiene r=16 y alpha=32. Para la inferencia, se requiere el parche de runtime de VisionZip del repositorio OPSD.

## Capacidades

- Generación de texto e imagen (pipeline image-text-to-text).
- Razonamiento visual con cadena de pensamiento (chain-of-thought), gracias al dataset OpenMMReasoner.
- Inferencia eficiente al reducir los tokens visuales al 10%, lo que disminuye la carga computacional y la latencia.
- Compatible con el modelo base Qwen2.5-VL-7B-Instruct, que soporta múltiples tareas de visión-lenguaje.
- No se documentan capacidades explícitas de tool calling, agentes o funciones especiales más allá de las del modelo base.

## Casos de uso

- Análisis de imágenes en tiempo real: la poda de tokens visuales permite procesar imágenes con menor latencia, adecuado para aplicaciones de visión por computador en entornos con restricciones de tiempo.
- Asistentes visuales en dispositivos edge: al reducir la carga computacional, el adaptador puede ejecutarse en hardware con recursos limitados, como GPUs de gama media o incluso CPU con cuantización adicional.
- Procesamiento de documentos con imágenes: el modelo puede extraer información de capturas, gráficos o diagramas, manteniendo un equilibrio entre precisión y velocidad.
- Razonamiento visual en entornos de investigación: útil para experimentos que requieran iteraciones rápidas sobre datasets de imágenes con anotaciones de razonamiento.
- Prototipado de aplicaciones multimodales: al ser un adaptador ligero, facilita el desarrollo de demos y pruebas de concepto sin necesidad de desplegar el modelo completo.
- Optimización de costes en inferencia en la nube: al reducir el número de tokens procesados, se disminuye el uso de memoria y cómputo, lo que puede traducirse en menores costes por petición.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- No se especifican requisitos de VRAM, GPUs recomendadas ni latencia en la información proporcionada.
- El adaptador LoRA es ligero (0,2 GB), por lo que puede cargarse sobre el modelo base en GPUs consumer (por ejemplo, RTX 3090 o superior) si el modelo base cabe en memoria.
- La poda de tokens visuales reduce la memoria y el cómputo durante la inferencia, pero no se proporcionan cifras concretas.
- Opciones de despliegue: se puede usar con PEFT sobre el modelo base, y el parche de VisionZip es necesario para la inferencia podada. No se mencionan integraciones con vLLM, Ollama o TGI, aunque FriendliAI ofrece despliegue en su plataforma.

## Comparativa con modelos similares

No se dispone de datos de rendimiento comparativo. Existen otros adaptadores del mismo autor con configuraciones similares (por ejemplo, `Qwen2.5-VL-7B-OPSD-VisionZip-r010-balanced-10240` y `Qwen2.5-VL-7B-OPSD-official-VisionZip-r010-10240`), pero no se han publicado métricas que permitan una comparación objetiva.

## Limitaciones y advertencias

- Requiere el parche de runtime de VisionZip para la inferencia podada; sin él, el adaptador no funcionará correctamente.
- La licencia no está especificada, por lo que el uso comercial es incierto y debe consultarse con el autor.
- El entrenamiento se realizó sobre un subconjunto reducido (10.240 muestras), lo que puede limitar la generalización a dominios no representados.
- La poda de tokens visuales al 10% puede provocar pérdida de detalles finos en las imágenes, afectando a tareas que requieren alta resolución o precisión visual.
- No se especifican los idiomas soportados; aunque el modelo base es multilingüe, el adaptador podría tener sesgos hacia los idiomas del dataset de entrenamiento.
- No se han publicado evaluaciones de sesgos, alucinaciones o robustez, por lo que se recomienda validar el modelo en el dominio de aplicación antes de usarlo en producción.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/enmingzhangzz/Qwen2.5-VL-7B-OPSD-VisionZip-r010-Btop50-signedFtop50-lambda05-gap01-10240
- Repositorio GitHub de VisionZip: https://github.com/JIA-Lab-research/VisionZip
- Adaptador similar (balanced): https://huggingface.co/enmingzhangzz/Qwen2.5-VL-7B-OPSD-VisionZip-r010-balanced-10240
- Adaptador similar (official): https://huggingface.co/enmingzhangzz/Qwen2.5-VL-7B-OPSD-official-VisionZip-r010-10240
- Despliegue en FriendliAI (variante similar): https://friendli.ai/models/enmingzhangzz/Qwen2.5-VL-7B-OPSD-VisionZip-r010-Btop50-absFtop50-lambda05-gap01-10240
