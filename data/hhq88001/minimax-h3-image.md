# hhq88001/MiniMax-H3-Image

## Resumen

MiniMax-H3-Image es un modelo de difusion texto-a-imagen desarrollado por MiniMax (MiniMaxAI). Este repositorio concreto, publicado por el usuario `hhq88001`, no es el modelo original sino un reempaquetado de sus pesos en formato de fichero unico (`diffusion-single-file`) listo para su uso en ComfyUI. El repositorio original es `MiniMaxAI/MiniMax-H3-Image`, y este paquete se declara como un fine-tune/derivado sobre el mismo.

El modelo resuelve la generacion de imagenes a partir de descripciones textuales y, segun los flujos de trabajo referenciados, tambien edicion de imagenes (image edit). La relevancia practica de este repositorio es la de ofrecer los pesos ya troceados y cuantizados (INT8, NVFP4/AWQ, FP16) para encajar en el ecosistema ComfyUI, evitando al usuario tener que convertir manualmente los ficheros del modelo base.

El tamano total del repositorio es de 125,1 GB, lo que refleja un modelo de gran escala con multiples componentes: el modelo de difusion, dos text encoders (Qwen3-VL de 32B y Qwen3.5 de 9B) y un VAE. No se dispone de informacion publica sobre el numero de parametros del modelo de difusion ni sobre la longitud de contexto de sus text encoders en la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | modelo de difusion texto-a-imagen (detalles internos no disponibles) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT8 (convrot), NVFP4 + AWQ, FP16 |
| Idiomas soportados | no disponible |
| Licencia | minimax-h3-image-community-license-agreement (licencia "other") |
| Formato de pesos | safetensors (single-file para ComfyUI) |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo de difusion (tipo de backbone, mecanismo de atencion, numero de pasos de muestreo o variantes tipo flow matching). Lo que si se deduce del repositorio es la composicion del pipeline: un modelo de difusion principal (`minimax_h3_image_pruned_int8_convrot.safetensors`), dos text encoders basados en Qwen (un Qwen3-VL de 32B en versiones INT8 y NVFP4/AWQ, y un Qwen3.5 de 9B en W4A8 GPTQ) y un VAE en FP16.

El sufijo "pruned" en el fichero de difusion sugiere que los pesos han sido podados respecto al modelo original, y "convrot" hace referencia a una tecnica de cuantizacion/rotacion de pesos. No hay datos publicados en la informacion disponible sobre el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO.

## Capacidades

- Generacion de imagenes a partir de prompts de texto (text-to-image).
- Edicion de imagenes guiada por texto (image edit), segun el flujo de trabajo oficial de ComfyUI.
- Aceptacion de prompts enriquecidos: la model card recomienda usar un modelo Qwen3.5 de 9B como "prompt enhancer" mediante el nodo Generate Text.
- Integracion con text encoders multimodales (Qwen3-VL 32B), lo que sugiere capacidad de condicionamiento con entrada visual ademas de textual en el flujo de edicion.
- No se documentan en la informacion disponible capacidades de tool calling, agentes, audio ni modo "thinking".

## Casos de uso

- Generacion de ilustraciones para prototipado de producto: usar el flujo text-to-image de ComfyUI con el fichero `minimax_h3_image_pruned_int8_convrot.safetensors` para producir bocetos visuales rapidos a partir de descripciones de interfaz o concepto.
- Edicion de imagenes en estudio de diseno: emplear el workflow de image edit para modificar elementos concretos de una imagen existente (fondo, iluminacion, estilo) sin regenerarla por completo.
- Creacion de material grafico para marketing: generar variantes de una misma escena a partir de prompts enriquecidos con el prompt enhancer Qwen3.5 9B para mantener coherencia estilistica.
- Enriquecimiento de datasets sinteticos: producir imagenes de entrenamiento para modelos de vision por computador en dominios donde faltan datos reales, controlando el estilo mediante el prompt.
- Iteracion creativa en local: al estar empaquetado para ComfyUI con cuantizaciones INT8 y NVFP4, permite ejecutar el pipeline en estaciones de trabajo con GPU de gran memoria sin depender de servicios en la nube.
- Exploracion de estilos visuales: combinar el text encoder Qwen3-VL 32B con distintos prompts para comparar resultados y fijar una direccion artistica antes de producir en serie.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El repositorio completo ocupa 125,1 GB, por lo que el almacenamiento en disco es el primer requisito practico.
- El modelo de difusion se distribuye en INT8 (`pruned_int8_convrot`), lo que reduce la huella de VRAM frente a una version FP16, aunque no se especifica el tamano exacto del fichero.
- Los text encoders son exigentes: Qwen3-VL 32B en INT8 y en NVFP4/AWQ, mas Qwen3.5 9B en W4A8 GPTQ. El encoder de 32B requiere GPU de gama alta (A100/H100 de 80 GB, o configuraciones multi-GPU) para cargarse completo; las versiones NVFP4/AWQ estan pensadas para GPUs con soporte de precisiones reducidas (serie Blackwell).
- El VAE se distribuye en FP16 y es el componente mas ligero.
- No cabe en GPUs de consumo de 24 GB en su configuracion completa con el encoder de 32B; seria necesario descargar componentes o usar variantes mas agresivas.
- Despliegue: ComfyUI es el entorno objetivo declarado. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a un pipeline de difusion de este tipo.
- No se dispone de datos de latencia ni throughput.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables ni datos de rendimiento que permitan una comparacion rigurosa.

## Limitaciones y advertencias

- Licencia restrictiva: la MiniMax H3 Image Community License Agreement exige autorizacion previa por escrito de MiniMax si los ingresos anualizados del usuario o sus filiales superan 1 millon de USD, o si se ofrece el modelo como servicio alojado a terceros.
- La licencia de este modelo difiere de la licencia original de MiniMax H3; hay que revisar el enlace de licencia antes de cualquier uso comercial.
- Este repositorio es un reempaquetado de terceros (`hhq88001`), no la publicacion oficial; conviene verificar la integridad de los pesos frente al repositorio original `MiniMaxAI/MiniMax-H3-Image`.
- No se documentan sesgos conocidos, tasas de alucinacion visual ni idiomas soportados; la ausencia de esta informacion es en si misma un riesgo para produccion.
- El uso de cuantizaciones INT8 y NVFP4 puede degradar la calidad de imagen respecto a los pesos originales en precision completa.
- La dependencia de un prompt enhancer externo (Qwen3.5 9B) implica un componente adicional que debe desplegarse y validarse.
- No hay informacion sobre resoluciones de salida soportadas, numero de pasos recomendado ni parametros de muestreo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/hhq88001/MiniMax-H3-Image
- Repositorio original del modelo: https://huggingface.co/MiniMaxAI/MiniMax-H3-Image
- Licencia: https://huggingface.co/MiniMaxAI/MiniMax-H3-Image/blob/main/LICENSE
- Solicitud de licencia comercial: https://platform.minimax.io/license
- Workflow image edit (ComfyUI): https://github.com/Comfy-Org/workflow_templates/blob/main/templates/image_minimax_h3_image_edit.json
- Workflow text to image (ComfyUI): https://github.com/Comfy-Org/workflow_templates/blob/main/templates/image_minimax_h3_image_t2i.json
