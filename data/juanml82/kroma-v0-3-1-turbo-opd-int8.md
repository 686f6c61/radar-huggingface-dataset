# juanml82/kroma-v0.3.1-turbo-opd-int8

## Resumen

juanml82/kroma-v0.3.1-turbo-opd-int8 es una cuantizacion a int8 de Kroma v0.3.1 Turbo OPD, un checkpoint de generacion de imagenes a partir de texto (text-to-image) publicado por Lodestones como fine-tune de Krea 2. El modelo base, Kroma, se construye sobre Krea 2 con entrenamiento adicional; la variante v0.3.1 recurre a destilacion on-policy (OPD, On-Policy Distillation) para producir un checkpoint de tipo turbo rapido que, segun la fuente, se mantiene dentro de la distribucion del modelo base y conserva el entrenamiento LoRA previo.

Esta publicacion concreta la firma el usuario juanml82 y consiste en una version cuantizada a int8, etiquetada como ConvRot, empaquetada explicitamente para su uso en ComfyUI. El repositorio ocupa 14,0 GB, un tamano coherente con una cuantizacion int8 de un modelo de difusion de gran tamano, y se distribuye bajo licencia MIT. El idioma de prompt soportado declarado es el ingles.

Su relevancia practica reside en que reduce los requisitos de memoria frente al checkpoint sin cuantizar, lo que facilita ejecutar un modelo turbo en equipos con menos VRAM dentro del ecosistema ComfyUI. El repositorio no registra descargas ni valoraciones en el momento de la consulta, por lo que carece de validacion de la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusion text-to-image, fine-tune de Krea 2 (Kroma); internals no disponibles |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de generacion de imagenes); resolucion de salida no disponible |
| Tipos de cuantizacion | int8 (ConvRot) |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | safetensors (no confirmado de forma explicita en la model card) |

## Arquitectura y entrenamiento

Kroma es un fine-tune de Krea 2 desarrollado por Lodestones. Segun las fuentes disponibles, la version v0.1 se distribuia como delta LoRA, mientras que a partir de v0.2 paso a entregarse como checkpoint completo, con el delta de Krea 2 Turbo fusionado como LoRA de rango 512. La version v0.3 incorporo un checkpoint base completo no destilado, una variante turbo y un paquete de LoRA de la comunidad orientado a corregir el seguimiento de prompts. La version v0.3.1 emplea destilacion on-policy (OPD) para generar un checkpoint turbo que permanece dentro de la distribucion del modelo base y conserva el entrenamiento LoRA heredado.

El modelo concreto de esta ficha es una cuantizacion a int8 con rotacion (ConvRot, segun el nombre del archivo), realizada por juanml82 sobre Kroma 0.3.1 Turbo OPD y orientada a ComfyUI. No se dispone de informacion sobre la arquitectura interna concreta (por ejemplo, si es U-Net o DiT), el numero de parametros, el volumen de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO. La fuente RunningHubAI emplea el termino "unet" en el nombre de su variante, pero no es un dato confirmado para este repositorio.

## Capacidades

- Generacion de imagenes a partir de descripciones textuales (text-to-image).
- Variante turbo: disenada para generar en pocos pasos, con menor coste de inferencia que un checkpoint no turbo.
- Integracion con ComfyUI como entorno de ejecucion previsto.
- Soporte de prompts en ingles (unico idioma declarado).
- Compatibilidad con el ecosistema de LoRA de la comunidad Kroma para ajustar estilos y comportamiento.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades de vision de entrada, audio ni generacion de lenguaje.

## Casos de uso

- Prototipado visual rapido: generar bocetos y variaciones de concepto a partir de prompts en ingles, aprovechando la variante turbo para iterar en pocos pasos dentro de ComfyUI.
- Ilustracion editorial: producir imagenes para articulos y publicaciones a partir de descripciones de estilo, con ajuste fino mediante LoRA de la comunidad.
- Diseno grafico iterativo: explorar direcciones de arte con un coste de memoria reducido gracias a la cuantizacion int8, sin necesidad de GPUs de gama alta.
- Personalizacion con LoRA: entrenar y aplicar adaptadores sobre el modelo base para fijar un estilo de marca o un personaje recurrente.
- Generacion por lotes en pipelines automatizados: encadenar nodos de ComfyUI para producir conjuntos de imagenes a partir de listas de prompts, con una huella de VRAM menor que la version sin cuantizar.
- Despliegue en equipos de gama de consumo: ejecutar el modelo en GPUs con 16-24 GB de VRAM para estudios y equipos pequenos que no disponen de aceleradores de datacenter.
- Experimentacion en investigacion de difusion: analizar el efecto de la cuantizacion int8 (ConvRot) sobre la calidad frente al checkpoint original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de calidad, FID, CLIP score ni comparaciones cuantitativas con el checkpoint sin cuantizar.

## Requisitos de hardware

- VRAM estimada: partiendo de un repositorio de 14,0 GB en int8, se estima un consumo de pesos en torno a 14 GB, mas el overhead de activaciones y del text encoder; se recomienda un minimo de 16 GB y, de forma holgada, 24 GB (estimacion basada en el tamano del repo, no en datos oficiales).
- GPUs recomendadas: RTX 4090 (24 GB), RTX 3090 (24 GB), L40S (48 GB), A100 40 GB como opciones comodas.
- GPU de consumo: si, cabe en GPUs consumer con 24 GB (RTX 4090, RTX 3090) y probablemente en modelos de 16 GB con limites de resolucion o batch.
- Opciones de despliegue: ComfyUI como entorno previsto; tambien cabria su uso en otras herramientas de difusion compatibles. vLLM, llama.cpp, Ollama y TGI no aplican, al tratarse de un modelo de difusion y no de un modelo de lenguaje.
- Latencia y throughput: no disponible. La variante turbo reduce el numero de pasos necesarios, pero no se aportan cifras de tiempo por imagen ni de imagenes por segundo.

## Comparativa con modelos similares

| Modelo | Tipo | Contexto / resolucion | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| juanml82/kroma-v0.3.1-turbo-opd-int8 | Cuantizacion int8 ConvRot de Kroma 0.3.1 Turbo OPD | no disponible | no disponible | MIT | HuggingFace (0 descargas) |
| lodestones/Kroma (v0.3.1 Turbo OPD) | Checkpoint original sin cuantizar | no disponible | no disponible | no disponible | HuggingFace |
| thedarkthrust/Krea2-Kroma-v0.3-Turbo-INT8-ConvRot | Cuantizacion int8 ConvRot de Kroma 0.3 Turbo | no disponible | no disponible | no disponible | HuggingFace |
| RunningHubAI/rh-kroma-v0.3-turbo-unet | Variante turbo (nombre con "unet") | no disponible | no disponible | no disponible | HuggingFace |

La comparacion cuantitativa de calidad entre estas variantes no esta disponible en las fuentes consultadas.

## Limitaciones y advertencias

- Sesgos: no hay informacion publicada sobre sesgos del modelo; como generador de imagenes entrenado con datos a gran escala, es probable que herede sesgos de representacion, pero no se han documentado.
- Alucinacion visual: la fuente sobre la version v0.3 menciona un paquete de LoRA de la comunidad destinado a corregir el seguimiento de prompts (prompt following), lo que sugiere que el ajuste a las instrucciones textuales puede ser imperfecto sin adaptadores adicionales.
- Idioma: solo se declara soporte de ingles; los prompts en otros idiomas, incluido el castellano, pueden degradar el resultado.
- Resolucion y contexto: no se documentan resoluciones maximas ni formatos de aspecto soportados.
- Cuantizacion: al ser una version int8, puede haber una perdida de calidad respecto al checkpoint original; no se aporta ninguna medicion de esa diferencia.
- Licencia: el repositorio se publica bajo MIT, pero no se detalla la licencia de los pesos del modelo base (Krea 2 y Kroma); conviene verificar la cadena de licencias antes de un uso comercial.
- Validacion: el repositorio no tiene descargas ni likes, por lo que no existe verificacion de la comunidad sobre su funcionamiento.
- Reproducibilidad: no se indica el metodo exacto de cuantizacion ni el script empleado, lo que dificulta reproducir el proceso.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/juanml82/kroma-v0.3.1-turbo-opd-int8
- Modelo base (Lodestones Kroma): https://huggingface.co/lodestones/Kroma
- Noticia Kroma v0.3.1 OPD (ComfyUI Wiki): https://comfyui-wiki.com/en/news/2026-10-07-kroma-v0-3-1-opd
- Noticia Kroma v0.3 (ComfyUI Wiki): https://comfyui-wiki.com/en/news/2026-08-31-kroma-v0-3
- Krea2-Kroma-v0.3-Turbo-INT8-ConvRot (thedarkthrust): https://huggingface.co/thedarkthrust/Krea2-Kroma-v0.3-Turbo-INT8-ConvRot
- RunningHubAI rh-kroma-v0.3-turbo-unet: https://huggingface.co/RunningHubAI/rh-kroma-v0.3-turbo-unet
- Ficha de Kroma v0.3 KREA 2 (TensorHub Art): https://tensorhub.art/models/1037635234654340273
