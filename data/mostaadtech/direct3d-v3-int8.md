# MostAadTech/Direct3D-V3-int8

## Resumen

Direct3D-V3-int8 es una redistribución cuantizada a INT8 del modelo Direct3D-V3 desarrollado por DreamTech (wushuang98), un sistema de generación de mallas 3D a partir de imágenes (image-to-3D). La conversión y el empaquetado los ha realizado Mostafa Awad (@MostAadTech), y el objetivo es hacer viable la inferencia en GPU de consumo y discos pequeños: reduce el peso en disco de aproximadamente 18,4 GB a 5,9 GB, un factor cercano a 3×. El modelo se distribuye con la misma estructura de carpetas y configuraciones que el repositorio original, de modo que los ficheros pueden sustituir directamente a los originales.

La arquitectura subyacente combina un codificador de imagen DINOv3 ViT-H+/16 (mantenido en FP16) con tres etapas de transformadores de geometría (512, 1024 y 1536 de resolución), cada una almacenada en INT8 con cuantización por grupos de 32 pesos (w8g32) y escalas FP32. Las etapas de geometría se reconstruyen a FP16 en tiempo de carga, por lo que los kernels de ejecución no requieren modificaciones. El error por paso introducido por la cuantización se sitúa en el 0,15-0,18 %, frente al 0,10 % del ruido de redondeo FP16 normal, es decir, unas 1,6 veces el suelo de ruido FP16.

La relevancia de esta versión radica en que permite ejecutar un pipeline image-to-3D de alta resolución en tarjetas con 8 GB de VRAM (probado en una RTX 5050 Laptop a resolución 1536 con más de 150k tokens) y se integra con los nodos de ComfyUI del mismo autor, que añaden modos de velocidad con kernels Triton INT8/FP16, refinamiento multivista y extracción de superficie mediante marching cubes o dual contouring disperso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline image-to-3D: codificador de imagen DINOv3 ViT-H+/16 + transformadores de geometría por etapas (512/1024/1536) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (la model card menciona ejecuciones con 150k+ tokens en el pipeline) |
| Tipos de cuantizacion | INT8 w8g32 (pesos lineales grandes) + FP32 scales; resto de tensores en FP16; codificador de imagen en FP16 |
| Idiomas soportados | no disponible (modelo multimodal imagen→3D, sin procesamiento de lenguaje) |
| Licencia | MIT para los pesos de geometría; DINOv3 License para el codificador de imagen (no MIT) |
| Formato de pesos | safetensors con metadatos `{"format": "direct3d-v3-w8g32", "group": "32"}` |

## Arquitectura y entrenamiento

El modelo original Direct3D-V3 genera mallas 3D a partir de una o varias imágenes de entrada. El pipeline se organiza en etapas de resolución creciente (512, 1024 y 1536) que refinan progresivamente la geometría, apoyadas por un codificador de imagen DINOv3 ViT-H+/16 que extrae características visuales. Esta versión cuantizada no modifica la arquitectura: mantiene el mismo layout de carpetas y configuraciones (`model_index.json`, `config.json`) que el repositorio original.

La cuantización aplicada es w8g32: cada peso lineal 2-D con al menos 65.536 valores y tamaño de entrada divisible por 32 se almacena como dos tensores, `<name>.q8` (int8, rango −127..127) y `<name>.s` (float32, una escala por grupo de 32 pesos de entrada, calculada como `max(|w|)/127`, simétrica y sin punto cero). El resto de tensores (sesgos, normalizaciones, embeddings y capas pequeñas) se guardan en FP16. En carga, las etapas de geometría se reconstruyen a FP16, de modo que los kernels de ejecución funcionan sin cambios. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF/DPO en el modelo original.

## Capacidades

- Generación de mallas 3D a partir de imágenes (image-to-3D) en resoluciones de 512, 1024 y 1536.
- Refinamiento multivista: acepta imágenes frontal, trasera, izquierda, derecha, superior e inferior (funcionalidad del nodo de ComfyUI).
- Control de etapas: selección de etapa inicial y objetivo (por ejemplo, 1024 → 1536) y modo `single_stage` para configuraciones de una sola resolución.
- Extracción de superficie configurable: marching cubes o dual contouring disperso para bordes afilados.
- Guiado configurable: CFG, APG o FDG, con opción de desactivar el guiado en los últimos pasos.
- Modos de velocidad con kernels Triton INT8 y FP16: `lossless`, `fast`, `fastest` y `off`.
- No soporta tool calling, agentes, razonamiento multi-step ni capacidades lingüísticas: es un modelo de visión a 3D.

## Casos de uso

- Prototipado de assets 3D en GPU de consumo: un artista puede generar una malla base a partir de una fotografía o render en una RTX 5050 Laptop de 8 GB, usando la etapa 1536 en modo `single_stage` para iterar rápidamente sin infraestructura de servidor.
- Integración en flujos de ComfyUI: instalando los nodos Direct3D-V3, el modelo se descarga en la carpeta de modelos del nodo y se ejecuta en modo `offline`, lo que permite encadenar la generación 3D con otros nodos del grafo (por ejemplo, texturizado o render).
- Reconstrucción a partir de múltiples vistas: con el refinamiento multivista (frontal, trasera, laterales, superior e inferior) se pueden obtener mallas más completas de objetos físicos fotografiados desde varios ángulos.
- Generación de mallas con bordes definidos: usando dual contouring disperso en lugar de marching cubes se obtienen geometrías con aristas más nítidas, adecuadas para objetos mecánicos o arquitectónicos.
- Despliegue en entornos con disco limitado: al ocupar 5,9 GB frente a 18,4 GB, encaja en contenedores o máquinas virtuales con almacenamiento reducido, manteniendo la estructura de ficheros del original para sustituirlo sin cambios de código.
- Aceleración de pipelines de producción: los modos `fast` y `fastest` reducen el tiempo de muestreo de 925 s a 576 s y 459 s respectivamente (medido a 152k tokens y resolución 1536 en RTX 5050 Laptop), lo que permite procesar lotes mayores en el mismo hardware.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. La model card sí proporciona métricas de calidad de la cuantización y de velocidad:

| Metrica | Original | Esta version |
|---|---|---|
| Tamano en disco | ~18,4 GB | 5,9 GB |
| Etapas de geometria | FP32 safetensors, ~5,0 GB cada una | INT8 + escalas FP32, 1,31 GiB cada una |
| Codificador de imagen | FP32, ~3,4 GB | FP16, 1,57 GiB |
| Error por paso vs fichero FP32 (salida CFG, etapa 1024) | – | 0,15–0,18 % |
| Ruido de redondeo FP16 normal, misma medida | 0,10 % | 0,10 % |
| Tiempo de muestreo (152k tokens, 1536, RTX 5050 Laptop) | 925 s | 576 s (`lossless`) / 459 s (`fast`) |

## Requisitos de hardware

- VRAM estimada: funciona en GPU de 8 GB (probado en RTX 5050 Laptop a resolución 1536 con 150k+ tokens).
- GPU recomendadas: RTX 5050 Laptop (8 GB) verificada; no se especifican otras GPU en la información disponible.
- Cabe en GPU de consumo: sí, al menos en modelos con 8 GB de VRAM.
- Opciones de despliegue: nodos de ComfyUI (Direct3D-V3_Comfyui_Nodes) con kernels Triton INT8/FP16; no se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: muestreo de 925 s (modo base) reducido a 576 s (`lossless`) y 459 s (`fast`) en el hardware de prueba; no se proporcionan más datos.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. La comparación más directa es con el modelo original del que deriva:

| Modelo | Parametros | Contexto | Licencia | Tamano en disco | Disponibilidad |
|---|---|---|---|---|---|
| Direct3D-V3-int8 (este) | no disponible | no disponible | MIT (geometria) + DINOv3 License (encoder) | 5,9 GB | Hugging Face |
| Direct3D-V3 (original) | no disponible | no disponible | MIT (geometria) + DINOv3 License (encoder) | ~18,4 GB | Hugging Face |

## Limitaciones y advertencias

- La licencia del codificador de imagen DINOv3 es la DINOv3 License de Meta, no MIT; su uso comercial está sujeto a dicha licencia y debe revisarse antes de desplegar en producción.
- Los loaders que no reconozcan el formato `direct3d-v3-w8g32` no podrán cargar los ficheros; es necesario usar los nodos de ComfyUI del autor o implementar la desquantización manual.
- La cuantización introduce un error adicional de aproximadamente 1,6 veces el ruido FP16, aunque en las pruebas no produjo cambios visibles en las mallas (assets witch, dragon y house a 512, 1024 y 1536).
- No se dispone de información sobre sesgos, riesgo de alucinación geométrica ni limitaciones idiomáticas; al ser un modelo imagen→3D, no procesa texto.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria independiente.
- No se especifican requisitos de VRAM para resoluciones distintas de 1536 ni para otras GPU; el rendimiento en hardware distinto al probado es desconocido.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/MostAadTech/Direct3D-V3-int8
- Modelo original Direct3D-V3: https://huggingface.co/wushuang98/Direct3D-V3
- Nodos ComfyUI del autor: https://github.com/Mstafa-awad/Direct3D-V3_Comfyui_Nodes
- Perfil del autor en GitHub: https://github.com/Mstafa-awad
- Perfil del autor en Hugging Face: https://huggingface.co/MostAadTech
