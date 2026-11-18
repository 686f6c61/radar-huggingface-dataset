# Comfy-Org/Krea-2

## Resumen

Krea-2 es un modelo de difusion texto-a-imagen desarrollado por Krea y reempaquetado por Comfy-Org para su uso directo en ComfyUI. Se distribuye en dos variantes complementarias: Krea-2-Raw, el modelo base sin destilar, y Krea-2-Turbo, una version optimizada para inferencia rapida con pocos pasos. Este repositorio de Comfy-Org agrupa los pesos en formato single-file safetensors, junto con los text encoders, el VAE y una coleccion de LoRAs de estilo, todo listo para colocarse en la estructura de carpetas de ComfyUI.

El modelo emplea un pipeline de difusion texto-a-imagen con un text encoder Qwen3-VL de 4B parametros y el VAE de Qwen-Image, lo que sugiere una arquitectura alineada con la familia de modelos de imagen de Qwen. La disponibilidad de variantes en bf16, fp8, int8, mxfp8 y nvfp4 permite desplegarlo desde GPUs de consumo hasta aceleradores de datacenter con cuantizacion de 4 bits.

Su relevancia actual radica en la combinacion de acceso abierto bajo licencia comunitaria, un ecosistema maduro de LoRAs de estilo preentrenadas y workflows oficiales en ComfyUI, lo que reduce la friccion para integrarlo en pipelines de generacion de imagen en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | modelo de difusion texto-a-imagen (detalles internos no disponibles) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16, fp8, fp8_scaled, int8_convrot, mxfp8, nvfp4 |
| Idiomas soportados | no disponible |
| Licencia | krea-2-community-license |
| Formato de pesos | safetensors (diffusion single-file) |

Otros componentes del repositorio:

| Componente | Valor |
|---|---|
| Text encoder | Qwen3-VL 4B (bf16 y fp8_scaled) |
| VAE | Qwen-Image VAE |
| Variantes del modelo | Raw (base) y Turbo (destilado) |
| LoRAs incluidas | 9 de estilo + 1 de referencia de estilo + 1 rank 64 bf16 para Turbo |
| Tamano del repositorio | 196,0 GB |
| Descargas | 4.518.213 |
| Likes | 839 |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del backbone de difusion (numero de bloques, tipo de atencion, dimensiones de los latentes). Lo que si se puede inferir de los componentes publicados es que el pipeline utiliza un text encoder Qwen3-VL de 4B parametros, lo que aporta comprension multimodal del prompt, y el VAE de Qwen-Image para la codificacion y decodificacion de latentes. La existencia de una variante Raw (modelo base) y una variante Turbo (destilada para inferencia en pocos pasos) indica un flujo de entrenamiento en dos fases: un modelo base entrenado desde cero o por finetuning y una destilacion posterior para acelerar la generacion.

No se han publicado en la informacion disponible datos sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF/DPO ni innovaciones tecnicas especificas como decodificacion especulativa o atencion lineal. La coleccion de LoRAs de estilo (darkbrush, dotmatrix, kidsdrawing, neondrip, rainywindow, retroanime, softwatercolor, sunsetblur, vintagetarot) sugiere que el modelo base se ha disenado para ser facilmente adaptable a estilos artisticos concretos mediante finetuning ligero.

## Capacidades

- Generacion de imagenes a partir de descripciones textuales (text-to-image) con el modelo Raw o Turbo.
- Generacion acelerada en pocos pasos con la variante Turbo, adecuada para iteracion rapida.
- Aplicacion de estilos artisticos predefinidos mediante LoRAs con trigger words especificas (por ejemplo, `monochrome ink wash style`, `rainy window style`, `purple retro anime style`).
- Referencia de estilo por imagen gracias al LoRA `krea2_style_reference` y al workflow oficial de style reference.
- Comprension de prompts complejos a traves del text encoder Qwen3-VL 4B.
- Integracion nativa en ComfyUI con workflows oficiales de text-to-image y style reference.
- Compatibilidad con cuantizaciones de 8 y 4 bits para despliegue en hardware limitado.
- No se ha documentado soporte de tool calling, agentes, razonamiento multi-paso ni generacion de audio.

## Casos de uso

- Generacion de ilustraciones para articulos y blogs: el modelo Turbo permite producir imagenes de acompanamiento en pocos pasos, y las LoRAs de estilo (softwatercolor, retroanime) permiten mantener una identidad visual coherente en una serie de posts.
- Creacion de assets para videojuegos indie: uso de LoRAs como dotmatrix o vintagetarot para generar sprites, fondos o ilustraciones de cartas con un estilo consistente y repetible mediante trigger words.
- Prototipado de conceptos de diseno grafico: el modelo Raw, al no estar destilado, ofrece mayor fidelidad al prompt para explorar variaciones antes de fijar una direccion creativa.
- Generacion de imagenes de referencia para moodboards: el workflow de style reference permite introducir una imagen de referencia y transferir su estetica a nuevas composiciones.
- Automatizacion de contenido para redes sociales: integracion en ComfyUI con scripts que encadenen prompts y LoRAs para producir lotes de imagenes con estilos de marca predefinidos.
- Investigacion en difusion: la disponibilidad de pesos en bf16, fp8 e int8 permite estudiar el impacto de la cuantizacion en la calidad de imagen y comparar variantes Raw frente a Turbo.
- Despliegue en entornos con VRAM limitada: las variantes nvfp4 y mxfp8 posibilitan ejecutar el modelo en GPUs de consumo o en aceleradores con soporte de precision reducida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial; depende del tamano real del backbone de difusion, que no se ha publicado. Las variantes nvfp4 y mxfp8 estan pensadas para reducir el consumo frente a bf16.
- GPU recomendadas: no disponibles en la informacion proporcionada. La existencia de variantes fp8, int8 y nvfp4 sugiere soporte para GPUs con tensor cores de 8 y 4 bits (serie RTX 40/50, H100, B200 y similares).
- Compatibilidad con GPU de consumo: probable gracias a las variantes cuantizadas, pero no confirmada con datos oficiales.
- Opciones de despliegue: ComfyUI es el entorno de referencia, con workflows oficiales publicados en el repositorio de plantillas de Comfy-Org. No se ha documentado soporte para vLLM, llama.cpp, Ollama ni TGI (son entornos de LLM, no de difusion).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Krea-2 (este) | no disponible | no disponible | krea-2-community-license | Hugging Face, ComfyUI |
| Krea-2-Raw | no disponible | no disponible | krea-2-community-license | Hugging Face |
| Krea-2-Turbo | no disponible | no disponible | krea-2-community-license | Hugging Face |

No se dispone de informacion sobre otros modelos de difusion comparables en la busqueda proporcionada, por lo que no se incluyen alternativas externas.

## Limitaciones y advertencias

- La licencia krea-2-community-license no es una licencia de codigo abierto estandar; es necesario revisar el PDF enlazado para conocer las restricciones de uso comercial.
- No se han publicado datos sobre sesgos del modelo ni sobre el dataset de entrenamiento, por lo que no se puede evaluar el riesgo de sesgo demografico o cultural.
- Como todo modelo generativo de imagen, existe riesgo de alucinacion visual: composiciones plausibles pero incorrectas en detalles (texto en imagen, anatomias, perspectivas).
- No hay informacion sobre idiomas soportados en los prompts; el text encoder Qwen3-VL sugiere capacidad multilingue, pero no esta confirmada.
- El repositorio ocupa 196 GB, lo que exige espacio de almacenamiento considerable y una gestion cuidadosa de las variantes descargadas.
- La calidad de las LoRAs depende de usar las trigger words exactas y la fuerza recomendada (1.0); ignorarlas puede degradar el resultado.
- El modelo Raw requiere mas pasos de inferencia que Turbo; usar Raw en produccion sin optimizar puede incrementar costes.
- No se han publicado benchmarks que permitan comparar objetivamente la calidad frente a alternativas.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Comfy-Org/Krea-2
- Modelo base original: https://huggingface.co/krea/Krea-2-Raw
- Variante Turbo: https://huggingface.co/krea/Krea-2-Turbo
- Licencia: https://huggingface.co/krea/Krea-2-Turbo/blob/main/LICENSE.pdf
- LoRA darkbrush: https://huggingface.co/krea/Krea-2-LoRA-darkbrush
- LoRA dotmatrix: https://huggingface.co/krea/Krea-2-LoRA-dotmatrix
- LoRA kidsdrawing: https://huggingface.co/krea/Krea-2-LoRA-kidsdrawing
- LoRA neondrip: https://huggingface.co/krea/Krea-2-LoRA-neondrip
- LoRA rainywindow: https://huggingface.co/krea/Krea-2-LoRA-rainywindow
- LoRA retroanime: https://huggingface.co/krea/Krea-2-LoRA-retroanime
- LoRA softwatercolor: https://huggingface.co/krea/Krea-2-LoRA-softwatercolor
- LoRA sunsetblur: https://huggingface.co/krea/Krea-2-LoRA-sunsetblur
- LoRA vintagetarot: https://huggingface.co/krea/Krea-2-LoRA-vintagetarot
- LoRA de referencia de estilo: https://huggingface.co/ostris/krea2_turbo_style_reference
- Workflow text-to-image: https://github.com/Comfy-Org/workflow_templates/blob/main/templates/image_krea2_turbo_t2i.json
- Workflow style reference: https://github.com/Comfy-Org/workflow_templates/blob/main/templates/image_krea2_turbo_int8_image_style_reference.json
- Workflow text-to-image int8: https://github.com/Comfy-Org/workflow_templates/blob/main/templates/image_krea2_turbo_t2i_int8.json
- ComfyUI: https://github.com/Comfy-Org/ComfyUI
