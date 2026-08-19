# gacekmg/LTX2.3_comfy_kijai

## Resumen

LTX2.3_comfy_kijai es un checkpoint separado del modelo de difusión LTX 2.3, preparado por el usuario gacekmg para su uso alternativo en ComfyUI. Se trata de una versión cuantizada en fp8 con escalado de activaciones experimental, diseñada para reducir los requisitos de memoria manteniendo la calidad de generación. El modelo original LTX 2.3 proviene de Lightricks y este repositorio lo adapta para el flujo de trabajo de ComfyUI, incluyendo además un VAE pequeño de madebyollin.

La relevancia de este checkpoint radica en que ofrece una forma de cargar LTX 2.3 en ComfyUI con cuantización fp8, lo que permite ejecutarlo en GPUs de consumo como la serie RTX 40xx. Las versiones marcadas como `input_scaled` incorporan calibración de escalas de activación y están configuradas para usar multiplicaciones de matrices en fp8 en hardware compatible. El autor advierte que estas calibraciones son experimentales, aunque los resultados visuales parecen correctos en pruebas con 8 pasos y destilación.

El repositorio tiene un tamaño de 377.1 GB, lo que indica que contiene múltiples versiones del checkpoint (probablemente variantes con y sin escalado de entrada, así como versiones en bf16). No se proporcionan detalles sobre la arquitectura interna, el número de parámetros ni la longitud de contexto, ya que la model card se centra en los aspectos de cuantización y uso en ComfyUI.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de difusion, probablemente basado en transformer, sin confirmar) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | fp8 (con escalas de peso estaticas), variantes `input_scaled` con escalado de activaciones, y versiones en bf16 para bloques especificos |
| Idiomas soportados | no disponible |
| Licencia | ltx-2-community-license-agreement (https://github.com/Lightricks/LTX-2/blob/main/LICENSE) |
| Formato de pesos | diffusion-single-file (probablemente safetensors, no confirmado) |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo LTX 2.3 en la documentacion proporcionada. La model card se limita a describir el proceso de cuantizacion: las versiones fp8 utilizan escalas de peso estaticas y no ejecutan multiplicaciones de matrices en fp8 por defecto, mientras que las versiones `input_scaled` anaden escalado de activaciones y si usan matmuls fp8 en hardware compatible (GPUs Nvidia serie 40xx o posteriores). La actualizacion `input_scaled_v3` mantiene los bloques 0-1 y 46-47 (los dos primeros y los dos ultimos) en bf16, siguiendo el patron del checkpoint oficial, y mejora la calibracion de las escalas de entrada, corrigiendo problemas de la version v2 especialmente al usar audio como entrada.

No hay informacion sobre el dataset de entrenamiento, el numero de tokens procesados, ni si se aplicaron tecnicas como RLHF o DPO. Tampoco se mencionan innovaciones arquitectonicas mas alla de la cuantizacion.

## Capacidades

- Generacion de video a partir de texto o imagenes (modelo de difusion, segun la naturaleza de LTX 2.3).
- Edicion y transformacion de video con entrada de audio (la actualizacion v3 menciona mejoras al usar audio como entrada).
- Integracion con ComfyUI mediante checkpoints de un solo archivo (`diffusion-single-file`).
- Soporte de cuantizacion fp8 con escalado de activaciones para reducir memoria en GPUs compatibles.
- Incluye un VAE pequeno de madebyollin que puede usarse como alternativa al VAE original.
- No se confirma soporte de tool calling, agentes, razonamiento multi-paso ni capacidades multimodales mas alla de video/audio.

## Casos de uso

- Generacion de video local en estaciones de trabajo con GPU de consumo: gracias a la cuantizacion fp8, el modelo puede ejecutarse en una RTX 4090 (probado por el autor) con 8 pasos y destilacion, lo que permite crear clips de video sin depender de servicios en la nube.
- Prototipado rapido en ComfyUI: al ser un checkpoint de un solo archivo, se integra directamente en el flujo de nodos de ComfyUI, facilitando la experimentacion con diferentes parametros de generacion y estilos.
- Edicion de video con control de audio: la version `input_scaled_v3` corrige problemas al usar audio como entrada, lo que habilita aplicaciones de sincronizacion labial o generacion de video guiada por pistas de sonido.
- Investigacion sobre cuantizacion de modelos de difusion: las variantes `input_scaled` son experimentales y pueden servir como caso de estudio para calibrar escalas de activacion en modelos de video.
- Desarrollo de flujos de trabajo de bajo consumo de memoria: al mantener bloques especificos en bf16 y usar fp8 para el resto, se reduce el uso de VRAM, permitiendo ejecutar el modelo en GPUs con menos memoria que las requeridas por la version completa.
- Generacion de contenido creativo para produccion audiovisual: artistas y creadores pueden usar el modelo para generar tomas de relleno, fondos animados o transiciones, aprovechando la integracion con ComfyUI para automatizar tareas repetitivas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica referencia de rendimiento es una prueba del autor en una RTX 4090 con 8 pasos y destilacion, que muestra un video de ejemplo, pero sin metricas cuantitativas.

## Requisitos de hardware

- VRAM estimada: no disponible, pero la cuantizacion fp8 esta disenada para reducir el uso de memoria respecto a la version completa (377.1 GB en disco, aunque en RAM/VRAM sera menor).
- GPU recomendadas: Nvidia RTX 40xx o posteriores para las versiones `input_scaled` que usan matmuls fp8. El autor probo en una RTX 4090.
- Compatibilidad con GPU de consumo: si, al menos con RTX 4090; las versiones sin `input_scaled` pueden funcionar en GPUs mas antiguas al no requerir matmuls fp8.
- Opciones de despliegue: ComfyUI como entorno principal; no se mencionan otros runtime como vLLM, llama.cpp u Ollama (al ser un modelo de difusion, no es adecuado para esos motores).
- Latencia y throughput: no disponibles; el ejemplo del autor usa 8 pasos con destilacion, lo que sugiere tiempos de generacion relativamente cortos, pero sin cifras concretas.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la documentacion proporcionada. LTX 2.3 es un modelo de difusion de video de Lightricks, pero no se ofrecen datos de otros checkpoints cuantizados similares para establecer una comparacion.

## Limitaciones y advertencias

- Las cuantizaciones `input_scaled` son experimentales: el propio autor indica que es la primera vez que intenta calibrar escalas de entrada, por lo que pueden existir artefactos o degradaciones de calidad no detectados.
- La version v2 presentaba problemas al usar audio como entrada, corregidos parcialmente en v3, pero aun puede haber casos limite.
- Licencia restrictiva: la licencia `ltx-2-community-license-agreement` puede limitar el uso comercial o la redistribucion; es necesario revisar los terminos completos en el enlace proporcionado.
- Tamaño del repositorio muy grande (377.1 GB), lo que implica requisitos de almacenamiento y descarga considerables.
- No se proporcionan detalles sobre sesgos, alucinaciones o limitaciones de idioma, al ser un modelo de generacion de video y no de texto.
- La documentacion es minima: no hay especificaciones tecnicas de la arquitectura, parametros ni contexto, lo que dificulta evaluar su idoneidad para casos de uso avanzados.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/gacekmg/LTX2.3_comfy_kijai
- Repositorio original de Kijai: https://huggingface.co/Kijai/LTX2.3_comfy
- Licencia LTX-2: https://github.com/Lightricks/LTX-2/blob/main/LICENSE
- VAE pequeno de madebyollin: https://github.com/madebyollin/taehv/
- Analisis de aimodels.fyi: https://www.aimodels.fyi/models/huggingFace/ltx2.3-comfy-kijai
- Repositorio alternativo en GitHub: https://github.com/Damacol/kijai-ltx2-3-comfy/tree/main
