# appmana/Qwen3.5-27B-ComfyUI

## Resumen

Qwen3.5-27B-ComfyUI es un reempaquetado del modelo Qwen/Qwen3.5-27B como codificador de texto (text encoder) para ComfyUI, publicado por el usuario appmana. No se trata de un modelo nuevo ni de un fine-tuning: es una conversión de formato que reorganiza los pesos originales de Qwen en la estructura de directorios y nombres de fichero que espera ComfyUI, siguiendo el mismo esquema que los modelos de la organización Comfy-Org para tamanos menores de la familia Qwen3.5.

El repositorio incluye dos variantes de pesos: una en bf16 (55,6 GB, dividida en dos shards con su fichero `.index.json`) y otra cuantizada a int8 mediante ConvRot (27,9 GB). La variante int8 aplica cuantizacion sobre el mismo conjunto de capas que el fichero `qwen3.5_9b_int8_convrot.safetensors` de Comfy-Org, lo que facilita la interoperabilidad con flujos de trabajo existentes.

Su relevancia es practica: permite usar el modelo Qwen3.5-27B como codificador de texto dentro de ComfyUI, en particular como componente del pipeline de MAGI-2 Preview de SandAI, cuyos shards de `text_encoder` son byte a byte identicos a la release de Qwen. La licencia es Apache-2.0, heredada de la release original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (heredada de Qwen/Qwen3.5-27B) |
| Parametros totales | no disponible (el nombre indica 27B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16 e int8 ConvRot |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (bf16 en 2 shards + `.index.json`; int8 en fichero unico) |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna del modelo base. Se trata de un reempaquetado: los pesos proceden de Qwen/Qwen3.5-27B y no han sido reentrenados ni modificados en su semantica, solo reorganizados en el layout que espera ComfyUI. La unica transformacion con perdida es la variante int8 ConvRot, que cuantiza el mismo conjunto de capas que la version equivalente de Comfy-Org para el modelo de 9B.

El proceso de conversion se realiza con el script `scripts/convert_magi2.py`, incluido en un fork de ComfyUI instalable mediante pip/uv, que carga checkpoints shardeados a traves del fichero `.index.json`. El repositorio incluye un fichero `SHA256SUMS` con el hash de cada fichero para verificar la integridad de la descarga. No hay informacion sobre datos de entrenamiento, tokens vistos ni tecnicas de alineacion (RLHF/DPO) en la informacion proporcionada.

## Capacidades

- Codificacion de texto para pipelines de generacion en ComfyUI: convierte prompts en embeddings consumibles por el modelo generativo correspondiente.
- Uso como `text_encoder` en el pipeline de MAGI-2 Preview de SandAI.
- Compatibilidad con el layout de Comfy-Org para la familia Qwen3.5, lo que permite sustituir modelos menores por este de 27B sin cambiar la estructura de ficheros.
- Dos precisiones disponibles (bf16 e int8 ConvRot) para ajustar calidad frente a VRAM.
- No se documentan en la informacion disponible capacidades de generacion de texto, razonamiento, codigo, tool calling, agentes, vision ni audio para este reempaquetado.

## Casos de uso

- Codificacion de prompts en ComfyUI: cargar el fichero int8 ConvRot como text encoder en un flujo de trabajo de ComfyUI para obtener embeddings de mayor capacidad que los modelos de 9B de la misma familia, con un consumo de VRAM contenido (27,9 GB en disco).
- Reproduccion del pipeline MAGI-2 Preview: usar estos pesos como `text_encoder` del modelo de SandAI, dado que sus shards son identicos a la release de Qwen y el reempaquetado sigue el layout esperado.
- Sustitucion de codificadores de texto menores: en flujos que ya usan `qwen3.5_9b_int8_convrot`, este fichero de 27B ofrece la misma estructura de capas cuantizadas con mayor capacidad, facilitando la prueba A/B sin reescribir el grafo.
- Despliegue en entornos con VRAM limitada: la variante int8 (27,9 GB) reduce a la mitad el espacio frente a bf16 (55,6 GB), lo que permite ejecutar el codificador en GPUs de 32-48 GB.
- Verificacion de integridad en produccion: el fichero `SHA256SUMS` permite validar cada descarga en pipelines automatizados de despliegue de modelos.
- Investigacion sobre cuantizacion ConvRot: comparar la salida del codificador en bf16 e int8 sobre el mismo conjunto de prompts para medir la degradacion introducida por la cuantizacion en tareas de condicionamiento de difusion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 28 GB para la variante int8 ConvRot y aproximadamente 56 GB para la variante bf16, solo para alojar los pesos del codificador.
- GPU recomendadas: A100 80 GB o H100 para bf16; A100 40 GB, L40S 48 GB o RTX 6000 Ada para int8.
- GPU de consumo: la variante int8 no cabe en GPUs de consumo de 24 GB (RTX 4090, 3090) sin offloading a RAM del sistema; la bf16 requiere varias GPUs o offloading agresivo.
- Opciones de despliegue: ComfyUI (nativo, con el fork pip/uv-installable indicado en la model card). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Formato |
|---|---|---|---|---|---|
| appmana/Qwen3.5-27B-ComfyUI | no disponible (27B por nombre) | no disponible | bf16, int8 ConvRot | Apache-2.0 | safetensors (ComfyUI) |
| Comfy-Org/Qwen3.5 (9B) | 9B | no disponible | int8 ConvRot | no disponible | safetensors (ComfyUI) |
| Qwen/Qwen3.5-27B | no disponible (27B por nombre) | no disponible | no disponible | Apache-2.0 | safetensors (original) |

La comparativa se limita a los modelos citados en la model card; no se dispone de datos de rendimiento para establecer diferencias cuantitativas.

## Limitaciones y advertencias

- Es un reempaquetado de formato, no un modelo entrenado: cualquier limitacion del modelo base Qwen3.5-27B se hereda sin cambios.
- La variante int8 ConvRot es una derivacion con perdida; puede degradar la calidad de los embeddings respecto a bf16, especialmente en prompts largos o con matices.
- La model card no documenta sesgos, idiomas soportados ni comportamiento frente a alucinacion; se desconoce el alcance real en produccion.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validacion de la comunidad.
- El soporte de despliegue esta ligado a un fork especifico de ComfyUI (pip/uv-installable); no se garantiza compatibilidad con la version upstream sin ese fork.
- La licencia Apache-2.0 permite uso comercial, pero conviene verificar los terminos de la release original de Qwen y de los modelos que consuman estos embeddings (por ejemplo, MAGI-2 Preview).
- El tamano de 27,9 GB en int8 impide su uso en GPUs de consumo de 24 GB sin offloading, lo que afecta a la latencia.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/appmana/Qwen3.5-27B-ComfyUI
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-27B
- Referencia de layout de Comfy-Org: https://huggingface.co/Comfy-Org/Qwen3.5
- MAGI-2 Preview (ComfyUI): https://huggingface.co/appmana/MAGI-2-preview-ComfyUI
- Fork de ComfyUI pip/uv-installable: https://github.com/hiddenswitch/forks-pip-and-uv-installable-ComfyUI
