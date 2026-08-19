# Kijai/LTX2.3_comfy

## Resumen

Kijai/LTX2.3_comfy es un checkpoint independiente del modelo de difusión de vídeo LTX 2.3, desarrollado por Lightricks, adaptado por el usuario Kijai para su carga alternativa en ComfyUI. El modelo se distribuye como un archivo único (single-file) y ofrece cuantizaciones en fp8 con escalas de peso estáticas y, en algunas versiones, escalado de activaciones, lo que permite reducir el consumo de memoria manteniendo una calidad aceptable. Incluye además un VAE pequeño creado por madebyollin que facilita la decodificación en flujos de trabajo de ComfyUI.

La relevancia de este modelo radica en que democratiza el uso de LTX 2.3 en entornos de generación de vídeo locales, al ofrecer versiones cuantizadas que se ejecutan en GPUs consumer de gama media y alta (como la RTX 4090) con tiempos de inferencia reducidos. El autor señala que las cuantizaciones con escalado de activaciones (input_scaled) están diseñadas para hardware Nvidia con soporte fp8 (a partir de la serie 40xx). Es una opción práctica para desarrolladores que desean integrar generación de vídeo en sus pipelines sin depender de servicios en la nube.

La licencia es la ltx-2-community-license-agreement, que permite uso comercial bajo ciertas condiciones, aunque se recomienda revisar el texto completo en el repositorio oficial de Lightricks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusion para video (basado en LTX 2.3) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | fp8 (estatica con escalas de peso; fp8 con escalado de activaciones en versiones input_scaled) |
| Idiomas soportados | no disponible (modelo multimodal de video; no se especifican idiomas) |
| Licencia | ltx-2-community-license-agreement |
| Formato de pesos | safetensors (checkpoint unico, diffusion-single-file) |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo original LTX 2.3 en la documentacion proporcionada. Se sabe que es un modelo de difusion para generacion de video, probablemente basado en un transformer de difusion latente, pero no se confirma el numero de parametros, la cantidad de tokens de entrenamiento ni el proceso de entrenamiento (si hubo RLHF, DPO, etc.).

La adaptacion de Kijai consiste en separar el checkpoint original en un archivo unico para facilitar su carga en ComfyUI. Las cuantizaciones fp8 se realizaron con escalas de peso estaticas, y las versiones marcadas como `input_scaled` anaden escalado de activaciones y estan configuradas para usar matmuls fp8 en hardware compatible (GPUs Nvidia serie 40xx o posteriores). El autor menciona que la version `input_scaled_v3` mantiene los bloques 0-1 y 46-47 en bf16 (los dos primeros y los dos ultimos), siguiendo el patron oficial, y mejora la calibracion de las escalas, corrigiendo problemas de la v2 especialmente al usar audio de entrada.

## Capacidades

- Generacion de video a partir de texto o imagenes (el modelo base LTX 2.3 es un modelo de difusion de video; la adaptacion no altera esta capacidad).
- Soporte de entrada de audio (mencionado en la actualizacion de la model card, aunque sin detalles tecnicos).
- Integracion con ComfyUI mediante checkpoint separado y VAE pequeno incluido.
- Cuantizacion fp8 con escalado de activaciones para reducir uso de VRAM y acelerar inferencia en GPUs Nvidia con soporte fp8.
- No se documentan capacidades de tool calling, agentes ni razonamiento multi-paso, al tratarse de un modelo generativo de video.

## Casos de uso

- Generacion de video local en ComfyUI: los creadores pueden cargar el checkpoint directamente en ComfyUI y generar clips cortos a partir de prompts de texto o imagenes de referencia, sin necesidad de configurar el modelo original.
- Prototipado rapido de conceptos visuales: gracias a la cuantizacion fp8 y la posibilidad de ejecutar en una RTX 4090 con 8 pasos y destilacion, se pueden iterar ideas de video en minutos.
- Experimentacion con cuantizacion fp8 y escalado de activaciones: los desarrolladores interesados en optimizacion de modelos pueden analizar el impacto de estas tecnicas en la calidad de salida y el rendimiento.
- Integracion en pipelines de generacion de contenido para redes sociales: se puede automatizar la creacion de clips cortos con estilos consistentes usando ComfyUI como backend.
- Edicion de video con entrada de imagen: el modelo acepta imagenes como condicion, lo que permite transformar o animar fotografias estaticas en secuencias de video.
- Evaluacion de alternativas de VAE: el VAE pequeno de madebyollin permite probar decodificaciones mas rapidas o con menor consumo de memoria en comparacion con el VAE original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor menciona una prueba en una RTX 4090 con 8 pasos y destilacion, pero no proporciona metricas cuantitativas (PSNR, FVD, etc.) ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada: no disponible. El tamano del repositorio es de 421.5 GB, lo que sugiere que el checkpoint completo es muy grande; las versiones fp8 reducen significativamente el peso, pero no se indica el valor exacto.
- GPU recomendadas: Nvidia RTX 4090 (probada por el autor), y en general GPUs Nvidia serie 40xx o posteriores para aprovechar las matmuls fp8 en las versiones `input_scaled`.
- Compatibilidad con GPUs consumer: si, siempre que tengan al menos 16 GB de VRAM (aunque no se confirma el minimo).
- Opciones de despliegue: ComfyUI (principal), posiblemente otros frameworks que soporten checkpoints single-file de difusion.
- Latencia y throughput: no disponible; el autor muestra un video de ejemplo generado en una RTX 4090 con 8 pasos, lo que sugiere tiempos de generacion de pocos segundos por clip, pero sin datos exactos.

## Comparativa con modelos similares

No se dispone de informacion suficiente para comparar este modelo con alternativas de la misma categoria (otros modelos de generacion de video como Stable Video Diffusion, AnimateDiff, etc.). La adaptacion es especifica para LTX 2.3, y no se han encontrado datos de rendimiento relativos.

## Limitaciones y advertencias

- La cuantizacion fp8 es experimental, especialmente las versiones con escalado de activaciones; puede haber perdida de calidad o artefactos en algunos escenarios.
- El autor advierte que las versiones `input_scaled_v2` tenian problemas con la entrada de audio, corregidos en la v3; aun asi, se recomienda probar cada version segun el caso de uso.
- La licencia ltx-2-community-license-agreement tiene condiciones especificas para uso comercial; es necesario revisar el texto completo en el repositorio de Lightricks antes de desplegar en produccion.
- No se documentan sesgos ni riesgos de alucinacion, pero al ser un modelo generativo de video, puede producir contenido no deseado o inconsistente con el prompt.
- El modelo requiere ComfyUI para su uso, lo que limita su integracion en otros entornos sin adaptaciones adicionales.
- El tamano del repositorio es muy grande (421.5 GB), lo que puede suponer un desafio de almacenamiento y descarga.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Kijai/LTX2.3_comfy
- Repositorio de la licencia (Lightricks/LTX-2): https://github.com/Lightricks/LTX-2/blob/main/LICENSE
- VAE pequeno de madebyollin: https://github.com/madebyollin/taehv/
- Articulo de overview en aimodels.fyi: https://www.aimodels.fyi/models/huggingFace/ltx2.3-comfy-kijai
