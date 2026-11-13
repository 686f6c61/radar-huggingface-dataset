# reverie-studio/z_image_turbo

## Resumen

`reverie-studio/z_image_turbo` es un espejo (mirror) byte a byte del modelo `Comfy-Org/z_image_turbo`, publicado por el usuario Reverie Studio para que su servicio Mirage descargue todos los modelos desde un unico repositorio. No introduce modificaciones, reentrenamientos ni ajustes: los checksums de los ficheros coinciden con los del repositorio original y la model card original se conserva como `ORIGINAL_README.md`. Todo el merito corresponde a los autores originales y este repositorio no esta afiliado ni respaldado por ellos.

Por los ficheros incluidos (`z_image_turbo_bf16.safetensors`, un text encoder `qwen_3_4b.safetensors` y un VAE `ae.safetensors`) se trata de un modelo de difusion para generacion de imagenes con arquitectura de transformer de difusion, emparejado con un text encoder Qwen de aproximadamente 4.000 millones de parametros. El sufijo "turbo" y el formato de pesos en bf16 apuntan a un modelo destilado para inferencia en pocos pasos, orientado a uso en ComfyUI.

La relevancia de este repositorio es practica y logistica: sirve como punto de descarga unico para infraestructuras que consumen modelos desde un solo origen. Para cualquier evaluacion tecnica del modelo conviene acudir al repositorio original de Comfy-Org, ya que esta ficha solo puede documentar lo que el espejo declara explicitamente y los metadatos de Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (los ficheros indican modelo de difusion con text encoder Qwen; no se detalla la topologia) |
| Parametros totales | no disponible (el text encoder incluido es `qwen_3_4b`, ~4.000 M de parametros; el UNet/DiT no se cuantifica en la informacion) |
| Parametros activos | no disponible (no se declara que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el fichero de difusion se distribuye en `bf16`; no se listan variantes GGUF, FP8 ni INT8) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`split_files/diffusion_models/z_image_turbo_bf16.safetensors`, `split_files/text_encoders/qwen_3_4b.safetensors`, `split_files/vae/ae.safetensors`) |

## Arquitectura y entrenamiento

No se han publicado detalles de arquitectura ni de entrenamiento en la informacion disponible. La model card del espejo es explicita: es una copia sin cambios de los ficheros de `Comfy-Org/z_image_turbo`, con checksums verificables en `SHA256SUMS`. Por tanto, cualquier dato sobre composicion del dataset, numero de tokens de entrenamiento, uso de RLHF/DPO o tecnicas de destilacion debe consultarse en el repositorio original, no en este.

Lo unico deducible con rigor de la estructura de ficheros es que el pipeline se compone de tres piezas separadas —modelo de difusion, text encoder y VAE—, un desglose tipico de los flujos de trabajo de ComfyUI. El text encoder es `qwen_3_4b`, lo que sugiere codificacion de prompts con un modelo de lenguaje de ~4.000 M de parametros en lugar de CLIP o T5. El peso de difusion se sirve en `bf16`, sin variantes cuantizadas en el repositorio.

## Capacidades

- Generacion de imagenes a partir de texto: es la funcion implicita del modelo, dado que se distribuye como modelo de difusion con text encoder y VAE.
- Inferencia en pocos pasos: el nombre "turbo" y el formato del repositorio original apuntan a un modelo destilado para generacion rapida; no se especifica el numero exacto de pasos recomendado.
- Integracion con ComfyUI: la organizacion en `split_files` (diffusion_models, text_encoders, vae) esta pensada para cargarse directamente en flujos de ComfyUI.
- Edicion o control de imagen: no disponible en la informacion proporcionada.
- Tool calling / function calling: no aplica (modelo de generacion de imagenes, no de texto conversacional).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible; no se declara cobertura de idiomas para los prompts.
- Capacidades especiales (modo thinking, vision de entrada, audio): no disponible.

## Casos de uso

- Generacion de imagenes en pipelines de ComfyUI: el modelo se carga directamente desde la estructura `split_files` del repositorio, lo que permite montarlo en un flujo de trabajo existente sin conversion de formatos.
- Prototipado rapido de conceptos visuales: al tratarse de un modelo "turbo" en bf16, es adecuado para iterar sobre prompts y variaciones en sesiones de diseno donde prima la latencia sobre el refinamiento maximo.
- Despliegue en un espejo interno corporativo: el repositorio esta pensado como origen unico de descarga para el servicio Mirage, de modo que una organizacion puede replicar ese patron para aprovisionar sus nodos de inferencia desde una sola URL.
- Verificacion de integridad en produccion: los checksums de `SHA256SUMS` permiten validar que los pesos desplegados coinciden byte a byte con el original, un requisito habitual en auditorias de cadena de suministro de modelos.
- Generacion de assets para contenido editorial o marketing: con prompts en texto se pueden producir ilustraciones y fondos que despues se retocan en herramientas de edicion.
- Evaluacion comparativa de modelos de difusion: al ser una copia fiel, sirve como referencia estable frente a la que medir fine-tunes y variantes cuantizadas del mismo modelo base.
- Docencia y experimentacion: el desglose explicito en difusion + text encoder + VAE facilita explicar el funcionamiento interno de un pipeline de generacion de imagenes en entornos de formacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precision. El repositorio ocupa 20,7 GB en total, repartidos entre el peso de difusion en bf16, el text encoder `qwen_3_4b` y el VAE; una estimacion conservadora exige cargar en memoria el peso de difusion mas el text encoder, lo que situa el minimo practico por encima de lo que ofrece una GPU de consumo de gama media.
- GPU recomendadas: no disponible. No se documentan modelos concretos (A100, H100, RTX 4090) en la informacion proporcionada.
- Cabe en GPU de consumo: no disponible. No se declaran variantes cuantizadas que reduzcan el requisito de VRAM.
- Opciones de despliegue: ComfyUI es el destino natural por la estructura de ficheros; vLLM, llama.cpp, Ollama y TGI no aplican a un modelo de difusion de este tipo.
- Latencia y throughput estimados: no disponible. No se especifican pasos de muestreo, resolucion de salida ni tiempos medidos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| reverie-studio/z_image_turbo | no disponible | no disponible | Apache 2.0 | Hugging Face (espejo) | Copia byte a byte de Comfy-Org/z_image_turbo |
| Comfy-Org/z_image_turbo | no disponible | no disponible | Apache 2.0 | Hugging Face (original) | Fuente original; incluye model card completa |
| Otros modelos de difusion "turbo" | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables en la informacion proporcionada para establecer una comparacion cifrada |

No se dispone de datos de rendimiento ni de especificaciones detalladas de alternativas en la informacion proporcionada, por lo que no es posible establecer una comparativa cuantitativa fiable.

## Limitaciones y advertencias

- Es un espejo sin modificaciones: no corrige, mejora ni actualiza nada respecto al original. Cualquier error o limitacion del modelo base se reproduce identicamente.
- No hay model card tecnica propia: la informacion sobre arquitectura, entrenamiento y capacidades no esta en este repositorio, sino en `ORIGINAL_README.md` y en la pagina de Comfy-Org.
- Sin datos de sesgo ni de alucinacion: no se documentan sesgos conocidos, tasas de fallo en la generacion ni comportamiento con prompts adversarios.
- Cobertura de idiomas desconocida: no se declara que idiomas maneja el text encoder para los prompts, lo que impide garantizar calidad fuera del ingles sin verificacion empirica.
- Restricciones de licencia: Apache 2.0 permite uso comercial y modificacion con atribucion y conservacion del aviso de licencia; los ficheros de licencia originales se incluyen sin cambios. Conviene verificar en el repositorio original si existen terminos adicionales sobre los datos de entrenamiento.
- Riesgo de cadena de suministro: al ser un mirror de terceros, la confianza depende de la verificacion de `SHA256SUMS` contra el repositorio original antes de desplegar en produccion.
- Sin senal de adopcion: cero descargas y cero likes en el momento de la consulta, y ninguna garantia de mantenimiento o actualizacion por parte del publicador.
- Ausencia de variantes cuantizadas: solo se ofrece bf16, lo que limita el despliegue en hardware con VRAM reducida.

## Enlaces

- Repositorio del espejo: https://huggingface.co/reverie-studio/z_image_turbo
- Repositorio original: https://huggingface.co/Comfy-Org/z_image_turbo
- Model card original (incluida en el espejo): `ORIGINAL_README.md`
- Checksums de integridad: `SHA256SUMS` en el repositorio del espejo
