# BnhHo/Qwen-Image-2.1-Uncensored-GGUF

## Resumen

Qwen-Image-2.1-Uncensored-GGUF es una cuantización comunitaria en formato GGUF del modelo de generación de imágenes Qwen/Qwen-Image-2.1, publicada por el usuario BnhHo. Se trata de un modelo de difusión texto-a-imagen orientado a ejecución local mediante ComfyUI, cuyo principal valor diferencial es la eliminación de los filtros de moderación de contenido presentes en los pesos originales, de ahí la etiqueta "uncensored". El repositorio incluye además los componentes auxiliares necesarios para el pipeline completo: el codificador de texto Qwen3-VL 8B y el VAE del modelo.

El modelo cuenta con 7.115.124.736 parámetros en el transformer de difusión y ofrece ocho niveles de cuantización, desde BF16 (14,23 GB) hasta Q4_0 (4,15 GB), lo que permite desplegarlo en GPUs de consumo con VRAM limitada. Los pesos se distribuyen bajo licencia qwen-research, no bajo una licencia permisiva tipo Apache-2.0, lo que condiciona su uso comercial.

Su relevancia actual es doble: por un lado, acerca la generación de imágenes de alta fidelidad a equipos sin aceleradores de datacenter mediante cuantizaciones de 4 bits; por otro, la eliminación de la censura lo convierte en una herramienta de interés para investigación en alineación y seguridad de modelos generativos, pero también en un artefacto con implicaciones legales y éticas que requieren evaluación previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusion texto-a-imagen (tipo de red concreta no disponible en la informacion proporcionada) |
| Parametros totales | 7.115.124.736 (transformer de difusion, dato de safetensors) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (no aplica como contexto de texto; no se especifica longitud de prompt) |
| Tipos de cuantizacion | BF16, FP8 (safetensors), INT8 ConvRot (safetensors), Q8_0, Q6_K, Q5_K_M, Q4_K_M, Q4_0. Existen variantes "UC" (uncensored) y variantes base sin el prefijo UC |
| Idiomas soportados | No disponible |
| Licencia | qwen-research (campo `license: other`, `license_name: qwen-research`) |
| Formato de pesos | GGUF (transformer) y safetensors (FP8, INT8 ConvRot, text encoder y VAE) |

## Arquitectura y entrenamiento

La informacion proporcionada no detalla la arquitectura interna del transformer de difusion (si se trata de un DiT, MMDiT o una variante propia), ni los datos de entrenamiento, el numero de tokens multimodales, la composicion del dataset o si hubo etapas de RLHF/DPO. Lo unico confirmado por la model card es que se trata de una cuantizacion de los pesos base originales de Qwen/Qwen-Image-2.1, sin reentrenamiento ni ajuste fino adicional por parte del autor de la cuantizacion.

El pipeline requiere tres componentes: el transformer de difusion cuantizado en GGUF, un codificador de texto basado en Qwen3-VL de 8B (disponible en BF16, 17,53 GB, o INT8 ConvRot, 9,35 GB) y el VAE de Qwen-Image 2.1 en BF16 (676 MB). La innovacion tecnica destacable es la aplicacion de cuantizacion con rotacion de convoluciones (ConvRot) para las variantes INT8 y FP8, que reduce el peso del codificador de texto a aproximadamente la mitad manteniendo precision numerica suficiente para la codificacion de prompts.

## Capacidades

- Generacion de imagenes a partir de descripciones textuales (text-to-image) mediante el pipeline estandar de difusion.
- Edicion de imagenes: la model card referencia una plantilla oficial de Comfy-Org para image edit, lo que implica soporte de transformaciones guiadas por prompt sobre una imagen de entrada.
- Codificacion de prompts multimodal: el text encoder Qwen3-VL 8B permite procesar instrucciones textuales, y por la naturaleza VL del encoder, potencialmente tambien entradas visuales (no confirmado explicitamente en la informacion disponible).
- Eliminacion de la moderacion de contenido: los pesos "UC" no aplican los filtros de seguridad de la version oficial, permitiendo generar contenido que el modelo base rechazaria.
- Ejecucion local offline: todo el pipeline puede correr en la maquina del usuario mediante ComfyUI, sin llamadas a APIs externas.
- Soporte de cuantizacion progresiva: ocho niveles de cuantizacion con distintos compromisos entre tamano y fidelidad, lo que permite ajustar el modelo al hardware disponible.
- Integracion con flujos de trabajo personalizados de ComfyUI mediante el nodo Unet Loader (GGUF).
- No dispone de tool calling, function calling, agentes, razonamiento multi-paso ni modo thinking, ya que no es un modelo de lenguaje.

## Casos de uso

- Generacion de ilustracion conceptual y arte digital: un ilustrador puede iterar rapidamente sobre bocetos generados localmente con la cuantizacion Q4_K_M (4,60 GB), manteniendo el control creativo sin depender de servicios en la nube ni de politicas de contenido de terceros.
- Prototipado de assets para videojuegos y aplicaciones: generacion de iconos, texturas base, fondos y mockups de interfaz durante las fases tempranas de diseno, donde la velocidad de iteracion importa mas que la resolucion final.
- Creacion de contenido para marketing: produccion de imagenes de producto, banners y material para redes sociales, con la ventaja de poder trabajar con prompts que los modelos comerciales suelen rechazar, aunque con la advertencia legal correspondiente.
- Edicion y retoque de imagenes mediante el flujo image edit: modificacion de imagenes existentes (cambio de estilo, sustitucion de elementos, extension de encuadre) usando la plantilla oficial de Comfy-Org adaptada al nodo GGUF.
- Investigacion en seguridad y alineacion de modelos generativos: el modelo permite estudiar que tipos de contenido produce un modelo de difusion sin moderacion, util para red teaming, evaluacion de sesgos y diseno de mejores filtros en futuras versiones.
- Generacion de datasets sinteticos: creacion de conjuntos de imagenes etiquetadas para entrenar o evaluar otros modelos de vision por computador, con control total sobre la distribucion de prompts.
- Flujos de trabajo con requisitos de privacidad: estudios de diseno, agencias o departamentos legales que no pueden enviar prompts ni imagenes de referencia a APIs externas pueden ejecutar el pipeline completo en hardware propio.
- Despliegue en entornos con hardware modesto: gracias a las cuantizaciones Q4_0 (4,15 GB) y Q4_K_M (4,60 GB) del transformer, es viable en GPUs de consumo, siempre que se combine con el text encoder en INT8 para no disparar el consumo de VRAM.

## Benchmarks y rendimiento

No se han publicado resultados numericos de benchmarks en la informacion disponible. La model card incluye una imagen de referencia (`assets/Qwen-Image-2.1-Benchmark.png`) y una seccion titulada "Benchmark", pero los valores concretos no se han extraido ni estan accesibles en el texto proporcionado, por lo que no se pueden reproducir cifras sin riesgo de inventarlas.

## Requisitos de hardware

Las siguientes estimaciones se derivan de los tamanos de fichero publicados, no de mediciones del autor:

- VRAM minima estimada (pipeline completo con Q4_0): aproximadamente 4,15 GB del transformer + 9,35 GB del text encoder INT8 + 0,68 GB del VAE, en torno a 14-15 GB si todo reside en VRAM.
- VRAM con Q4_K_M y text encoder INT8: aproximadamente 4,60 + 9,35 + 0,68 GB, es decir, alrededor de 15 GB.
- VRAM con Q8_0 y text encoder BF16: aproximadamente 7,59 + 17,53 + 0,68 GB, en torno a 26 GB.
- VRAM con BF16 completo: aproximadamente 14,23 + 17,53 + 0,68 GB, por encima de 32 GB.
- GPU de consumo: las configuraciones Q4_0 y Q4_K_M con text encoder INT8 deberian caber en GPUs de 16 GB (RTX 4080, RTX 4060 Ti 16 GB, RTX 5080) y, con margen ajustado, en GPUs de 12 GB si se descarga parte del pipeline a RAM del sistema.
- GPU profesionales: A100 40/80 GB, H100 y L40S pueden ejecutar el pipeline completo en BF16 sin descarga a RAM.
- Opciones de despliegue: ComfyUI con el nodo Unet Loader (GGUF) del fork leejet/ComfyUI-GGUF, nodo CLIPLoader con tipo `qwen_image` y nodo VAELoader. La model card no menciona soporte oficial en vLLM, TGI, llama.cpp ni Ollama, que estan orientados a modelos de lenguaje.
- Nota de rendimiento de la model card: se recomienda mantener el modelo de difusion GGUF en VRAM de GPU (donde la velocidad es critica durante el muestreo) y dejar el text encoder en RAM del sistema si la VRAM es limitada.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tiempo por imagen ni de imagenes por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizaciones | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| BnhHo/Qwen-Image-2.1-Uncensored-GGUF | 7.115.124.736 (transformer) | No disponible | BF16, FP8, INT8 ConvRot, Q8_0, Q6_K, Q5_K_M, Q4_K_M, Q4_0 | qwen-research | HuggingFace, 12 descargas, 0 likes |
| Qwen/Qwen-Image-2.1 (modelo base) | No disponible | No disponible | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada | HuggingFace, repositorio oficial |
| Otras cuantizaciones GGUF de la misma familia | No disponible | No disponible | Q8_0, Q6_K, Q5_K_M, Q4_K_M, Q4_0 (variantes base sin "UC") | qwen-research | Incluidas en el mismo repositorio bajo la rama `base` |

No se dispone de datos de benchmarks ni de especificaciones detalladas del modelo base oficial dentro de la informacion proporcionada, por lo que no es posible establecer una comparacion cuantitativa con alternativas como FLUX.1 o SDXL sin inventar cifras.

## Limitaciones y advertencias

- El modelo ha sido publicado explicitamente como "uncensored": los filtros de moderacion de contenido de la version oficial han sido eliminados. Esto implica riesgo de generar contenido NSFW, violento, difamatorio o ilegal segun la jurisdiccion, y traslada toda la responsabilidad al usuario.
- Licencia qwen-research: no es una licencia permisiva. Restringe el uso a fines de investigacion y condiciona cualquier explotacion comercial, que debe revisarse con atencion antes de desplegar el modelo en produccion.
- Validacion comunitaria minima: 12 descargas y 0 likes en el momento de redactar la ficha. No hay evidencia de adopcion amplia ni de verificacion independiente de la calidad de las cuantizaciones.
- Inconsistencia de autoria: el identificador del repositorio apunta al usuario BnhHo, mientras que los enlaces de descarga de la model card apuntan a `abenzerps/Qwen-Image-2.1-Uncensored-GGUF`. Conviene verificar la procedencia real de los ficheros antes de descargarlos y ejecutarlos.
- Repositorio de 83,6 GB: alojar todos los niveles de cuantizacion junto con el text encoder y el VAE requiere un volumen de almacenamiento considerable.
- Riesgo de alucinacion visual: como todo modelo de difusion, puede producir artefactos anatomicos, texto mal renderizado dentro de la imagen, incoherencias espaciales y sesgos en la representacion de personas.
- Degradacion por cuantizacion: las variantes Q4_0 y Q4_K_M reducen la fidelidad respecto a BF16. La model card recomienda Q4_K_M como mejor equilibrio, pero no publica metricas de la perdida de calidad.
- Compatibilidad de herramientas: requiere el fork leejet/ComfyUI-GGUF. Con la version antigua city96/ComfyUI-GGUF se produce el error `Unknown model architecture!` salvo que se anada `ModelQwenImage` a `tools/convert.py`.
- Dependencia de kernels especificos: las variantes INT8 ConvRot y FP8 pueden requerir soporte de rotacion de convoluciones en la libreria de inferencia; su compatibilidad no esta detallada.
- Idiomas: no disponibles. No se especifica si el text encoder ofrece un rendimiento equivalente en castellano o si los prompts deben formularse en ingles.
- Sin soporte de tool calling, agentes ni razonamiento multi-paso: no es un modelo de lenguaje y no debe evaluarse como tal.
- Uso en produccion: dado el estado del repositorio (fecha de creacion 2026-09-24, sin actualizaciones posteriores registradas) y la ausencia de pruebas publicadas, no se recomienda su uso en entornos productivos sin una evaluacion exhaustiva previa.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/BnhHo/Qwen-Image-2.1-Uncensored-GGUF
- Modelo base oficial: https://huggingface.co/Qwen/Qwen-Image-2.1
- ComfyUI: https://github.com/comfyanonymous/ComfyUI
- ComfyUI-GGUF (fork recomendado): https://github.com/leejet/ComfyUI-GGUF
- ComfyUI-GGUF (fork antiguo, no compatible sin parche): https://github.com/city96/ComfyUI-GGUF
- Plantilla oficial text-to-image: https://github.com/Comfy-Org/workflow_templates/blob/main/templates/image_qwen_image_2_1_t2i.json
- Plantilla oficial image edit: https://github.com/Comfy-Org/workflow_templates/blob/main/templates/image_qwen_image_2_1_image_edit.json
- Imagen de benchmark referenciada: assets/Qwen-Image-2.1-Benchmark.png (ruta relativa dentro del repositorio; el contenido numerico no esta disponible en la informacion proporcionada)
