# iCincaiPlay/Qwen-Image-2.1-Uncensored-HF

## Resumen

Qwen-Image-2.1-Uncensored-HF es una publicacion de cuantizaciones en formato GGUF del modelo de generacion de imagenes Qwen-Image-2.1, desarrollado originalmente por el equipo Qwen de Alibaba. El repositorio lo mantiene el usuario iCincaiPlay y su objetivo es permitir la ejecucion local del modelo base en equipos con recursos limitados, empaquetando los pesos del transformer de difusion en distintos niveles de cuantizacion (desde BF16 hasta Q4_0) junto con el codificador de texto y el VAE necesarios.

El modelo resuelve el problema de la generacion de imagenes texto-a-imagen en local, sin depender de APIs en la nube, integrandose mediante ComfyUI y el nodo ComfyUI-GGUF. La variante se presenta como "uncensored", aunque la propia model card indica que parte de los pesos upstream originales de Qwen/Qwen-Image-2.1, por lo que la naturaleza exacta de la atenuacion de filtros no queda documentada.

Los parametros totales declarados son 7.115.124.736 (aproximadamente 7,1 mil millones) y el repositorio ocupa 69,2 GB. El modelo se publico el 1 de octubre de 2026 y, en el momento de la consulta, registraba 0 descargas y 0 likes, por lo que se trata de una publicacion reciente y sin adopcion documentada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (se corresponde con el transformer de difusion del modelo base Qwen/Qwen-Image-2.1; la model card no detalla la arquitectura interna) |
| Parametros totales | 7.115.124.736 (aproximadamente 7,1 mil millones) |
| Parametros activos | No aplica (no se indica que sea un modelo MoE) |
| Longitud de contexto | No disponible (modelo texto-a-imagen; no se especifica ventana de contexto de texto) |
| Tipos de cuantizacion | BF16, Q8_0, Q6_K, Q5_K_M, Q4_K_M, Q4_0 |
| Idiomas soportados | No disponible en la model card (el codificador de texto asociado es Qwen3-VL 8B, de naturaleza multilingue) |
| Licencia | qwen-research (license: other) |
| Formato de pesos | GGUF (transformer de difusion); safetensors (codificador de texto y VAE) |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna ni sobre el proceso de entrenamiento en la model card proporcionada. El repositorio es una conversion a GGUF del modelo Qwen/Qwen-Image-2.1, y no se describe ningun reentrenamiento, ajuste fino ni proceso de RLHF o DPO especifico para esta publicacion. La model card afirma que se usan "los pesos base upstream originales", lo que resulta contradictorio con la etiqueta "uncensored" del titulo, y no se documenta ninguna modificacion concreta de pesos orientada a eliminar filtros de contenido.

El empaquetado incluye tres componentes diferenciados: el transformer de difusion convertido a GGUF, un codificador de texto Qwen3-VL 8B en dos precisiones (BF16 de 17,53 GB e Int8 de 9,35 GB) y un VAE en BF16 de 676 MB. No se indican innovaciones tecnicas propias, numero de tokens de entrenamiento, composicion del dataset ni tecnicas de atencion o decodificacion especificas.

## Capacidades

- Generacion de imagenes a partir de descripciones textuales (pipeline text-to-image).
- Edicion de imagenes, segun el flujo de trabajo oficial "Image Edit" referenciado en la model card.
- Ejecucion local mediante ComfyUI y el nodo ComfyUI-GGUF, sin depender de servicios en la nube.
- Carga de distintos niveles de cuantizacion para ajustar el consumo de VRAM y RAM segun el hardware disponible.
- Uso de codificador de texto Qwen3-VL 8B, lo que sugiere capacidad de interpretar instrucciones textuales complejas (no documentada explicitamente).
- Variante presentada como "uncensored", orientada a reducir las restricciones de contenido respecto al modelo base (sin detalle tecnico de como se logra).
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, vision de entrada, audio ni modo de razonamiento explicito.

## Casos de uso

- Generacion de ilustraciones y arte conceptual en local: el modelo permite crear imagenes a partir de prompts de texto ejecutandose enteramente en el equipo del usuario, lo que resulta adecuado para estudios que necesitan prototipado visual sin enviar material a servicios externos.
- Edicion de imagenes existentes: el flujo "Image Edit" facilita modificar o transformar imagenes base mediante instrucciones textuales, util para retoque y variaciones de diseno.
- Despliegue en estaciones de trabajo con GPU de gama media: al ofrecer cuantizaciones Q4_K_M (~4,6 GB) y Q4_0 (~4,15 GB), permite generar imagenes en GPUs de consumo ajustando el uso de VRAM.
- Integracion en pipelines de ComfyUI para creadores de contenido: el modelo se inserta como nodo dentro de grafos de generacion, lo que facilita flujos automatizados de texto-a-imagen en produccion de assets.
- Experimentacion e investigacion en entornos academicos: al estar publicado con licencia qwen-research, puede utilizarse en contextos de estudio sobre modelos de difusion y cuantizacion.
- Prototipado rapido de campanas visuales: la generacion local permite iterar sobre multiples variaciones de una imagen sin coste por peticion ni limites de cuota de API.
- Pruebas de contenido sin restricciones de filtrado: la etiqueta "uncensored" apunta a escenarios de investigacion donde se requiere explorar prompts que serian rechazados por modelos con filtros activos (uso sujeto a la licencia y a la legislacion aplicable).

## Benchmarks y rendimiento

La model card incluye una imagen de referencia bajo el epigrafe "Benchmark" (assets/Qwen-Image-2.1-Benchmark.png), pero no se proporcionan resultados numericos en texto para MMLU, HumanEval, GSM8K ni metricas especificas de generacion de imagenes (FID, CLIP score, etc.).

No se han publicado resultados de benchmarks numericos en la informacion disponible.

## Requisitos de hardware

- Transformer de difusion en cuantizacion Q4_K_M: aproximadamente 4,6 GB en VRAM (configuracion recomendada por el autor).
- Transformer de difusion en BF16: aproximadamente 14,23 GB.
- Codificador de texto Qwen3-VL 8B en Int8: aproximadamente 9,35 GB, recomendado para ejecutarse en RAM del sistema.
- Codificador de texto Qwen3-VL 8B en BF16: aproximadamente 17,53 GB.
- VAE: 676 MB.
- Configuracion recomendada por el autor: mantener el modelo de difusion GGUF en VRAM de GPU y el codificador de texto en RAM (CPU), ya que la codificacion de texto solo se ejecuta una vez por prompt y se ahorran entre 9 y 17 GB de VRAM sin impacto apreciable en la velocidad.
- Cabe en GPU de consumo con la cuantizacion Q4_K_M (~4,6 GB de VRAM para el modelo principal), siempre que el codificador de texto se desplace a RAM.
- Opciones de despliegue: ComfyUI con el nodo ComfyUI-GGUF (fork leejet, con soporte nativo de Qwen-Image 2.1). No se mencionan vLLM, llama.cpp, Ollama ni TGI para este modelo.
- Latencia y rendimiento: no se proporcionan cifras de latencia ni de throughput.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| iCincaiPlay/Qwen-Image-2.1-Uncensored-HF | 7.115.124.736 | No disponible | GGUF, safetensors | qwen-research | HuggingFace (0 descargas) |
| Qwen/Qwen-Image-2.1 (modelo base) | No disponible | No disponible | No disponible | No disponible | HuggingFace |
| FLUX.1 | No disponible en la informacion proporcionada | No disponible | No disponible | No disponible | No disponible |
| Stable Diffusion 3.5 | No disponible en la informacion proporcionada | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos comparativos de rendimiento entre estas alternativas dentro de la informacion proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la model card.
- Riesgo de alucinacion: no aplicable en el sentido textual; en generacion de imagenes existe riesgo de que la salida no refleje fielmente el prompt, aunque no se cuantifica.
- La model card no detalla que modificaciones concretas justifican la etiqueta "uncensored" y afirma simultaneamente que se usan los pesos base originales, lo que genera incertidumbre sobre el contenido real de los pesos.
- Los enlaces a los archivos GGUF de la model card apuntan al repositorio abenzerps/Qwen-Image-2.1-Uncensored-GGUF, distinto del repositorio iCincaiPlay publicdo, lo que puede causar confusion sobre la procedencia de los ficheros.
- El repositorio registra 0 descargas y 0 likes, por lo que no existe validacion ni comunidad que haya verificado su funcionamiento.
- Licencia qwen-research (license: other): es necesario revisar los terminos concretos de la licencia Qwen antes de cualquier uso comercial, que puede estar restringido.
- Idiomas soportados no especificados; el comportamiento multilingue no esta verificado.
- Requiere instalar el fork leejet/ComfyUI-GGUF; con versiones anteriores (city96) puede aparecer el error "Unknown model architecture!".
- No se ofrecen datos de benchmarks numericos ni de rendimiento en produccion.
- El uso de una variante sin filtros de contenido conlleva responsabilidad legal y etica sobre el material generado.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/iCincaiPlay/Qwen-Image-2.1-Uncensored-HF
- Modelo base: https://huggingface.co/Qwen/Qwen-Image-2.1
- Repositorio referenciado en la model card: https://huggingface.co/abenzerps/Qwen-Image-2.1-Uncensored-GGUF
- ComfyUI: https://github.com/comfyanonymous/ComfyUI
- ComfyUI-GGUF (fork leejet): https://github.com/leejet/ComfyUI-GGUF
- Plantilla de flujo texto-a-imagen: https://github.com/Comfy-Org/workflow_templates/blob/main/templates/image_qwen_image_2_1_t2i.json
- Plantilla de flujo de edicion de imagen: https://github.com/Comfy-Org/workflow_templates/blob/main/templates/image_qwen_image_2_1_image_edit.json
