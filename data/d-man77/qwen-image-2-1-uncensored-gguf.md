# D-MaN77/Qwen-Image-2.1-Uncensored-GGUF

## Resumen

Qwen-Image-2.1-Uncensored-GGUF es un repositorio de cuantizaciones en formato GGUF del modelo de generacion de imagenes Qwen/Qwen-Image-2.1, publicado por el usuario D-MaN77. No se trata de un modelo entrenado desde cero ni de un ajuste fino: es una redistribucion de pesos cuantizados pensada para ejecutar generacion de imagenes texto-a-imagen en local, principalmente dentro de ComfyUI mediante el nodo Unet Loader (GGUF). El repositorio incluye el transformer de difusion (7.115.124.736 parametros, aproximadamente 7,1 mil millones), el text encoder Qwen3-VL de 8B y el VAE, de modo que todos los componentes necesarios quedan empaquetados en un unico lugar.

La relevancia de esta ficha es fundamentalmente practica: permite ejecutar un modelo de difusion de ~7B en GPUs de consumo gracias a cuantizaciones que van desde BF16 (14,23 GB) hasta Q4_0 (4,15 GB), con Q4_K_M (4,60 GB) recomendado por el autor como mejor equilibrio entre tamano y calidad. Frente al modelo base, el autor etiqueta esta version como "uncensored", aunque la model card no documenta el procedimiento aplicado ni aclara en que difiere de los pesos originales, ya que afirma explicitamente que usa los pesos base del repositorio upstream.

El repo tiene 0 descargas y 0 likes en el momento de la consulta, con un tamano total de 83,6 GB, y los enlaces de descarga de la model card apuntan a un repositorio distinto (abenzerps/Qwen-Image-2.1-Uncensored-GGUF), no al repositorio D-MaN77. Es, por tanto, una publicacion reciente y sin validacion comunitaria, lo que debe tenerse en cuenta antes de usarla en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No detallada en la informacion disponible; pipeline text-to-image compuesto por transformer de difusion, text encoder y VAE |
| Parametros totales | 7.115.124.736 (aproximadamente 7,1 B), dato de safetensors del repositorio |
| Parametros activos | No aplica (no se indica que sea un modelo MoE) |
| Longitud de contexto | No aplica; el limite practico lo fija la longitud de prompt admitida por el text encoder Qwen3-VL 8B, no especificada |
| Tipos de cuantizacion | BF16, FP8, INT8 ConvRot, Q8_0, Q6_K, Q5_K_M, Q4_K_M, Q4_0 (variantes "uncensored" y base) |
| Idiomas soportados | No disponible; el text encoder Qwen3-VL 8B es multilingue, pero el autor no declara idiomas soportados |
| Licencia | qwen-research (campo license: other, license_name: qwen-research) |
| Formato de pesos | GGUF (transformer cuantizado) y safetensors (FP8, INT8 ConvRot, text encoder y VAE) |

## Arquitectura y entrenamiento

La informacion proporcionada no describe la arquitectura interna del modelo (si es un transformer de difusion puro, un MMDiT o una variante hibrida), ni el numero de tokens de entrenamiento, ni la composicion del dataset, ni si hubo etapas de RLHF, DPO o ajuste por preferencias. Lo que si se deduce de la model card es la descomposicion en tres componentes que hay que cargar por separado en ComfyUI: el transformer de difusion (el unico cuantizado en GGUF), un text encoder Qwen3-VL 8B en BF16 (17,53 GB) o INT8 ConvRot (9,35 GB), y un VAE Qwen-Image 2.1 en BF16 (676 MB).

No se trata de un modelo reentrenado: el autor indica que las cuantizaciones se generan "using the original upstream base weights" de Qwen/Qwen-Image-2.1. La etiqueta "Uncensored" no viene acompanada de ninguna explicacion tecnica (no se documenta abliteration, eliminacion de capas de seguridad, reajuste ni ningun otro procedimiento), lo que genera una ambiguedad relevante: o bien la designacion responde a una percepcion de menor filtrado en los pesos base, o bien el autor ha aplicado alguna modificacion que no declara. Las cuantizaciones notables que requieren soporte especifico son INT8 ConvRot, un esquema de cuantizacion con rotacion de convolucion que necesita tooling actualizado, y los GGUF, que exigen el fork leejet/ComfyUI-GGUF en lugar del antiguo city96/ComfyUI-GGUF para evitar el error "Unknown model architecture!".

## Capacidades

- Generacion de imagenes a partir de texto (text-to-image), con el transformer de difusion cargado como Unet Loader (GGUF).
- Edicion de imagen: la model card referencia una plantilla oficial de workflow de Image Edit, por lo que el modelo soporta flujos de edicion ademas de generacion pura.
- Seguimiento de prompts complejos: al incorporar Qwen3-VL 8B como text encoder, el modelo hereda la capacidad de comprension de prompts largos y detallados de ese encoder, si bien su impacto exacto no se cuantifica en la informacion disponible.
- Ejecucion local en ComfyUI con soporte nativo de GGUF mediante ComfyUI-GGUF.
- Variante "uncensored" con filtrado presumiblemente reducido respecto al modelo base, aunque el alcance de esa reduccion no esta documentado.
- Compatibilidad con workflows oficiales de Comfy-Org sustituyendo el nodo UNETLoader por Unet Loader (GGUF).
- No se declaran capacidades de tool calling, function calling, agentes, razonamiento multi-paso, audio ni vision en sentido estricto mas alla del uso del text encoder multimodal.

## Casos de uso

- Ilustracion y arte digital en local: un ilustrador puede generar imagenes en su propia maquina sin enviar prompts a servicios en la nube, usando la cuantizacion Q4_K_M (4,60 GB) en una GPU de consumo y el workflow oficial de texto a imagen de Comfy-Org.
- Iteracion rapida de conceptos en estudio de diseno: gracias a las multiples cuantizaciones disponibles se puede trabajar con Q8_0 (7,59 GB) para una primera exploracion de mayor calidad y bajar a Q4_0 (4,15 GB) para barridos masivos de variaciones cuando la VRAM es limitada.
- Edicion de imagenes existentes: la plantilla de Image Edit referenciada permite usos de retoque o transformacion de imagenes ya generadas o aportadas por el usuario dentro del mismo flujo de ComfyUI.
- Prototipado de productos de generacion de imagen: un equipo puede montar un pipeline interno con ComfyUI, sustituir el nodo UNETLoader por Unet Loader (GGUF) y evaluar coste de VRAM frente a calidad antes de decidir si migra a los pesos completos en BF16.
- Investigacion sobre filtrado y seguridad en modelos generativos: la existencia de una variante etiquetada como "uncensored" junto a las variantes base dentro del mismo repositorio permite comparar ambos conjuntos de pesos bajo los mismos prompts y parametros de muestreo.
- Despliegue en estaciones de trabajo con una sola GPU: la combinacion de Q4_K_M (4,60 GB) con el text encoder INT8 (9,35 GB) y el VAE (676 MB) suma aproximadamente 14,6 GB, lo que encaja en GPUs de 16 GB o superiores y permite generar imagenes sin depender de API externa.
- Flujos de trabajo reproducibles para docencia: al estar todos los componentes (transformer, text encoder y VAE) alojados en el mismo repositorio, es sencillo distribuir un entorno de practicas con versiones fijas de cada archivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numericos en la informacion disponible. La model card incluye una imagen de referencia (`assets/Qwen-Image-2.1-Benchmark.png`) que no se acompana de cifras textuales, y los resultados de busqueda web no aportan datos sobre este modelo ni sobre Qwen-Image-2.1. No se dispone por tanto de valores de metricas como FID, CLIP score o evaluaciones humanas para esta publicacion, y no se deben extrapolar cifras del modelo base sin una fuente verificable.

## Requisitos de hardware

- VRAM estimada (solo transformer): BF16 14,23 GB; FP8 6,63 GB; INT8 ConvRot 6,76 GB; Q8_0 7,59 GB; Q6_K 5,88 GB; Q5_K_M 5,22 GB; Q4_K_M 4,60 GB; Q4_0 4,15 GB.
- Componentes adicionales obligatorios: text encoder Qwen3-VL 8B en BF16 (17,53 GB) o INT8 ConvRot (9,35 GB), mas el VAE (676 MB). Con Q4_K_M e INT8, el total ronda los 14,6 GB antes de contar activaciones y buffers de muestreo; con el text encoder en BF16, supera los 22 GB.
- GPU recomendadas: no indicadas por el autor. Por presupuesto de memoria, una RTX 4090 (24 GB) o RTX 3090 (24 GB) permite usar Q4_K_M o Q6_K con el text encoder INT8; para el text encoder BF16 junto a cuantizaciones altas conviene una A100 40 GB, H100 o similar.
- GPU de consumo: si, cabe en GPUs de 12-16 GB si se usa Q4_0 o Q4_K_M con text encoder INT8 y se gestiona con cuidado el offload; en 8 GB el margen es muy ajustado y dependera de cuantizaciones mas agresivas y de descargar el text encoder a RAM.
- Estrategia de memoria: el autor recomienda mantener el modelo de difusion GGUF en VRAM (es la parte critica en velocidad durante el muestreo) y dejar que el text encoder y otros componentes se apoyen en RAM cuando sea necesario.
- Opciones de despliegue: ComfyUI con ComfyUI-GGUF (fork leejet/ComfyUI-GGUF, con soporte nativo de Qwen-Image 2.1). No se documentan vLLM, TGI, Ollama ni llama.cpp para este modelo en la informacion disponible.
- Latencia y throughput: no disponibles. No se publican tiempos de generacion, pasos de muestreo ni resoluciones de referencia.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Cuantizaciones | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| D-MaN77/Qwen-Image-2.1-Uncensored-GGUF | 7.115.124.736 (transformer) | GGUF y safetensors | BF16, FP8, INT8 ConvRot, Q8_0, Q6_K, Q5_K_M, Q4_K_M, Q4_0 | qwen-research (other) | HuggingFace, 0 descargas y 0 likes |
| Qwen/Qwen-Image-2.1 (modelo base) | No disponible en la informacion proporcionada | No disponible | No disponible | No disponible en la informacion proporcionada | Referenciado como base_model en HuggingFace |
| Variantes base del mismo repositorio (qwen-image-2.1-Q8_0, Q6_K, Q5_K_M, Q4_K_M, Q4_0) | Las mismas | GGUF | Q8_0 7,59 GB; Q6_K 5,88 GB; Q5_K_M 5,22 GB; Q4_K_M 4,60 GB; Q4_0 4,05 GB | qwen-research (other) | Enlazadas dentro del propio repositorio |

No se dispone de informacion sobre otros modelos de generacion de imagen de tamano comparable con los que establecer una comparacion fiable en terminos de contexto, rendimiento o licencia. Cualquier tabla comparativa adicional seria una extrapolacion no sustentada.

## Limitaciones y advertencias

- La designacion "uncensored" implica un filtrado de seguridad presumiblemente reducido, pero la model card no documenta que se ha modificado ni como. Esto impide evaluar el alcance real de la perdida de controles y traslada al usuario la responsabilidad legal y etica sobre el contenido generado.
- Licencia qwen-research (license: other): es una licencia de investigacion, con restricciones habituales para uso comercial. Debe verificarse el texto completo de la licencia de Qwen antes de cualquier uso productivo; la informacion disponible no detalla los terminos.
- Sin benchmarks publicados: no hay cifras de rendimiento que permitan comparar esta cuantizacion con los pesos originales ni estimar la degradacion introducida por Q4_0 o Q4_K_M.
- Sin validacion comunitaria: 0 descargas y 0 likes, creado y actualizado en la misma marca temporal (2026-09-23T23:54), con el campo "Actualizado" solo un segundo despues de "Creado". No hay evidencia de que los pesos hayan sido probados de forma independiente.
- Enlaces inconsistentes: la model card enlaza los archivos a `abenzerps/Qwen-Image-2.1-Uncensored-GGUF`, no al repositorio `D-MaN77` consultado. Conviene verificar que los archivos descargados corresponden al repositorio que se pretende usar y comprobar los hashes.
- Tamano del repositorio: 83,6 GB, lo que implica un coste de ancho de banda y de almacenamiento considerable si se descargan varias cuantizaciones.
- Dependencia de tooling especifico: los GGUF requieren leejet/ComfyUI-GGUF; con city96/ComfyUI-GGUF puede aparecer el error "Unknown model architecture!" y es necesario anadir ModelQwenImage a tools/convert.py. Las variantes INT8 ConvRot requieren soporte de cuantizacion con rotacion, no universal.
- Riesgo de alucinacion visual: como todo modelo de difusion, puede producir resultados incoherentes en anatomia, texto dentro de la imagen, manos y composiciones complejas. No se documenta ninguna evaluacion sistematica de estos fallos en esta publicacion.
- Idiomas no declarados: no se especifica que idiomas de prompt estan soportados. Aunque el text encoder Qwen3-VL tiene cobertura multilingue, no hay garantia documentada de calidad equivalente en todos los idiomas, incluido el castellano.
- Consumo de memoria agregado: el transformer cuantizado por si solo puede caber en una GPU modesta, pero el text encoder de 8B en BF16 (17,53 GB) domina el presupuesto total. Omitir este dato lleva a infraestimar la VRAM necesaria.
- Ausencia de informacion sobre el dataset de entrenamiento y sobre sesgos: sin datos de composicion del corpus no es posible evaluar sesgos demograficos, culturales o de representacion en las imagenes generadas.

## Enlaces

- Repositorio del modelo: https://huggingface.co/D-MaN77/Qwen-Image-2.1-Uncensored-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen-Image-2.1
- Repositorio alternativo referenciado en la model card: https://huggingface.co/abenzerps/Qwen-Image-2.1-Uncensored-GGUF
- ComfyUI: https://github.com/comfyanonymous/ComfyUI
- ComfyUI-GGUF (fork con soporte de Qwen-Image 2.1): https://github.com/leejet/ComfyUI-GGUF
- Plantilla oficial de texto a imagen: https://github.com/Comfy-Org/workflow_templates/blob/main/templates/image_qwen_image_2_1_t2i.json
- Plantilla oficial de edicion de imagen: https://github.com/Comfy-Org/workflow_templates/blob/main/templates/image_qwen_image_2_1_image_edit.json
