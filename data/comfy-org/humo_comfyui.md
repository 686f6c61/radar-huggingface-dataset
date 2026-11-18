# Comfy-Org/HuMo_ComfyUI

## Resumen

HuMo es un modelo de difusion para generacion de video a partir de texto (text-to-video) desarrollado originalmente por ByteDance Research. Esta ficha cubre el repositorio `Comfy-Org/HuMo_ComfyUI`, que no es el modelo original sino un reempaquetado de los pesos en formato single-file preparado especificamente para su uso en ComfyUI. El repositorio incluye los pesos del modelo de difusion y el codificador de audio Whisper Large v3 en fp16, distribuidos en un espacio de 57,7 GB.

El modelo esta disponible en dos variantes de tamano: una version pequena de 1,7 mil millones de parametros (1.7B) y una version grande de 17 mil millones de parametros (17B), esta ultima ofrecida tanto en fp16 como en fp8 e4m3fn para reducir requisitos de memoria. La licencia es Apache 2.0, lo que permite uso comercial sin restricciones adicionales reseñables. La etiqueta del pipeline es text-to-video y el modelo base de referencia es `bytedance-research/HuMo`.

La relevancia de este repositorio radica en que simplifica el despliegue de HuMo en el ecosistema ComfyUI: en lugar de gestionar checkpoints y configuraciones del repositorio original, el usuario descarga archivos safetensors y los coloca en carpetas predefinidas. No obstante, la informacion disponible publicamente en este repositorio es escasa en cuanto a arquitectura interna, datos de entrenamiento y benchmarks, por lo que muchos apartados de esta ficha se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | modelo de difusion (diffusion-single-file) para text-to-video; detalles internos no disponibles |
| Parametros totales | 1,7B (variante pequena) y 17B (variante grande) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | fp16 y fp8 e4m3fn (variante 17B); Whisper Large v3 en fp16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (single-file para ComfyUI) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna de HuMo mas alla de su clasificacion como modelo de difusion orientado a generacion de video a partir de texto. El repositorio empaqueta los pesos en tres archivos: `humo_1.7B_fp16.safetensors`, `humo_17B_fp16.safetensors` y `humo_17B_fp8_e4m3fn.safetensors`, ademas de un codificador de audio `whisper_large_v3_fp16.safetensors` que se ubica en la carpeta `audio_encoders`. La presencia de un codificador de audio Whisper sugiere que el pipeline incorpora procesamiento de audio, aunque la informacion proporcionada no especifica como se integra en la generacion de video.

No se dispone de datos sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF o DPO, ni innovaciones tecnicas especificas como decodificacion especulativa o mecanismos de atencion lineal. Toda esta informacion deberia consultarse en el repositorio original `bytedance-research/HuMo`, que no se incluye en los resultados de busqueda disponibles.

## Capacidades

- Generacion de video a partir de texto (text-to-video), segun la etiqueta del pipeline.
- Dos escalas de modelo: 1,7B para entornos con menos recursos y 17B para mayor calidad potencial.
- Integracion con ComfyUI mediante archivos single-file y workflow oficial (`video_humo.json`).
- Inclusión de codificador de audio Whisper Large v3, lo que sugiere capacidades relacionadas con audio en el pipeline (sin detalle disponible sobre su funcion exacta).
- Soporte de cuantizacion fp8 e4m3fn en la variante 17B para reducir huella de memoria.
- No se dispone de informacion sobre tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingues.

## Casos de uso

- Generacion de clips de video para prototipado creativo: el modelo permite obtener videos a partir de descripciones textuales dentro de ComfyUI, adecuado para equipos de diseno que iteran rapidamente sobre conceptos visuales sin pipeline propio.
- Produccion de material audiovisual para redes sociales: con la variante 1.7B se puede ejecutar en hardware mas modesto para generar borradores de video que luego se refinan manualmente.
- Integracion en flujos de trabajo de ComfyUI existentes: al ser un reempaquetado single-file, se carga directamente en la carpeta `diffusion_models` y se combina con otros nodos del ecosistema para tareas de postprocesado.
- Generacion de video de mayor fidelidad en entornos con GPU de gran memoria: la variante 17B en fp16 o fp8 permite obtener resultados de mayor calidad cuando se dispone de VRAM suficiente.
- Experimentacion en investigacion de difusion para video: el modelo sirve como base para fine-tuning o para comparar enfoques de generacion text-to-video en entornos academicos, dado que la licencia Apache 2.0 lo permite.
- Creacion de contenido de demostracion y pruebas de concepto: la disponibilidad de pesos abiertos y un workflow oficial facilita montar demos funcionales sin depender de APIs propietarias.
- Procesamiento que combine audio y video: la presencia del codificador Whisper Large v3 abre la puerta a pipelines que incorporen informacion de audio, aunque la documentacion disponible no detalla el mecanismo concreto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Como referencia orientativa por tamano, la variante 1.7B en fp16 requiere aproximadamente 3,4 GB solo para pesos, y la variante 17B en fp16 alrededor de 34 GB; la version 17B en fp8 e4m3fn reduce esta cifra a unos 17 GB. Estas cifras son estimaciones por parametros y no incluyen el codificador Whisper ni los buffers de inferencia de difusion, que suelen incrementar el consumo.
- GPU recomendadas: no disponible en la informacion proporcionada. Por tamano, la variante 17B en fp16 probablemente requiere GPUs de clase A100/H100 de 40-80 GB; la 17B en fp8 podria ajustarse a GPUs de 24 GB (RTX 4090) con margen limitado; la 1.7B podria caber en GPUs consumer de 8-12 GB.
- Cabe en GPU consumer: probablemente la variante 1.7B y posiblemente la 17B en fp8, sujeto a verificacion empirica no disponible.
- Opciones de despliegue: ComfyUI (soporte nativo mediante los archivos single-file y el workflow `video_humo.json`); Comfy Cloud como alternativa gestionada. No se indica soporte para vLLM, llama.cpp, Ollama o TGI, que estan orientados a modelos de lenguaje y no a difusion.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones suficientes para una comparativa rigurosa con modelos alternativos de text-to-video. La informacion proporcionada no incluye modelos comparables con metricas verificables.

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| HuMo (1.7B / 17B) | 1,7B / 17B | no disponible | Apache 2.0 | safetensors | Hugging Face (Comfy-Org y ByteDance Research) |
| Alternativas | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- La informacion publica en este repositorio es muy escasa: no se detallan arquitectura interna, datos de entrenamiento, idiomas soportados ni evaluaciones de calidad.
- Al ser un reempaquetado para ComfyUI, la fuente autoritativa sobre el modelo es `bytedance-research/HuMo`; conviene consultar ese repositorio para detalles tecnicos y limitaciones originales.
- No hay informacion sobre sesgos conocidos, riesgo de alucinacion visual o limitaciones de contexto e idioma.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda verificar las condiciones del modelo base original por si existieran terminos adicionales no reflejados en este reempaquetado.
- El tamano del repositorio (57,7 GB) implica requisitos de almacenamiento y ancho de banda considerables para la descarga.
- La variante 17B en fp16 requiere una cantidad de VRAM elevada; sin datos oficiales de inferencia, el despliegue en produccion requiere validacion empirica previa.
- No se dispone de informacion sobre latencia, throughput ni estabilidad en produccion.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Comfy-Org/HuMo_ComfyUI
- Modelo base original: https://huggingface.co/bytedance-research/HuMo
- Workflow de ComfyUI para HuMo: https://github.com/Comfy-Org/workflow_templates/blob/main/templates/video_humo.json
- Repositorio de ComfyUI: https://github.com/Comfy-Org/ComfyUI
- Comfy Cloud: https://cloud.comfy.org/
- Comunidad francófona de ComfyUI: https://comfyui.fr/
