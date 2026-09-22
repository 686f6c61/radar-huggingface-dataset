# Aero-Ex/Qwen-Image2.1_Normal2RGB

## Resumen

Normal2RGB es un adaptador de tipo LoRA publicado por el usuario Aero-Ex en Hugging Face, pensado para su uso dentro de ComfyUI. Su funcion es actuar como ayuda de condicionamiento por mapa de normales: el adaptador se entrena para que, al generar una imagen RGB a partir de un mapa de normales, se preserve la geometria de origen (silueta, volumenes, orientacion de superficies) en lugar de dejar que el modelo de difusion recomienda la escena por su cuenta. El repositorio contiene tres checkpoints (`Normal2RGB_2000.safetensors`, `Normal2RGB_3000.safetensors`, `Normal2RGB_4000.safetensors`) y ocupa 0,3 GB.

El problema que aborda es concreto: en flujos de trabajo con ControlNet u otros condicionamientos por normales, la imagen generada suele derivar en geometria (aparecen objetos extra, cambian poses, se reimagina la composicion). El autor documenta cuatro comparativas de tres paneles (mapa de normales de origen | con Normal2RGB | sin Normal2RGB) en las que el adaptador mantiene la forma del objeto y la deriva se produce en la version sin adaptador.

La relevancia actual es la de una pieza auxiliar dentro del ecosistema de generacion de imagen controlada: no es un modelo fundacional, sino un ajuste que se acopla a un modelo base no identificado en la model card. La ficha se publica bajo licencia Apache 2.0, con 0 descargas y 0 likes en el momento de la consulta, y sin resultados de benchmarks publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (adaptador LoRA sobre un modelo de difusion de imagen no especificado en la model card) |
| Parametros totales | No disponible |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica / no disponible (modelo de generacion de imagen, no de texto) |
| Tipos de cuantizacion | No disponible (se distribuye en safetensors sin documentar variantes cuantizadas) |
| Idiomas soportados | No disponible (el autor no documenta idiomas de prompt) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (tres checkpoints: `Normal2RGB_2000.safetensors`, `Normal2RGB_3000.safetensors`, `Normal2RGB_4000.safetensors`) |
| Tipo de adaptador | LoRA / helper de condicionamiento por mapa de normales |
| Modelo base requerido | No disponible (la model card no lo identifica; el nombre del repositorio menciona Qwen-Image, pero no se confirma en la documentacion) |
| Libreria declarada | ComfyUI |
| Tamano del repositorio | 0,3 GB |
| Etiquetas | ComfyUI, image-generation, normal-map, controlnet, comparison |
| Fecha de creacion | 2026-09-22 |
| Ultima actualizacion | 2026-09-22 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La model card define el artefacto como un LoRA entrenado para preservar la geometria y las normales de origen mientras se genera la salida RGB. No se especifica ni la arquitectura del modelo base, ni el rango del LoRA, ni el numero total de pasos de entrenamiento. Los sufijos de los tres ficheros (2000, 3000 y 4000) son coherentes con checkpoints intermedios guardados cada 1000 pasos, pero el autor no documenta el numero total de pasos, el optimizador, la tasa de aprendizaje ni el esquema de precision.

Tampoco hay informacion sobre el dataset de entrenamiento: no se indica su composicion, el numero de imagenes, la procedencia de los pares mapa de normales / imagen RGB, ni si se aplicaron tecnicas de alineacion tipo RLHF o DPO (poco habituales en difusion, pero no descartables mediante ajuste por preferencia). La unica innovacion tecnica descrita es funcional: el uso del mapa de normales como senal de condicionamiento que ancla la geometria de la imagen final.

## Capacidades

- Generacion de imagen RGB condicionada por mapa de normales, con preservacion de la geometria de origen.
- Mantenimiento de detalles estructurales finos en objetos: en la comparativa del raton inalambrico se preservan la rueda de desplazamiento, los botones laterales y el punto de vista.
- Mantenimiento de composicion y pose en escenas con figuras: en la comparativa del nino estudiando con un perro se conservan la pose, la distribucion de la mesa y la posicion del animal.
- Mantenimiento de detalles de objetos en retratos y escenas deportivas: en la comparativa del nadador con raqueta se preservan el perfil de la pose, las cuerdas de la raqueta y la pila de bolas.
- Mantenimiento de estructuras y distribucion de escombros en paisajes: en la comparativa de la via ferroviaria industrial se conservan las vias, las estructuras y el material en primer plano.
- Uso como componente de comparacion: los tres checkpoints permiten evaluar el efecto del adaptador con y sin el en un mismo flujo de trabajo.
- Integracion en flujos de ComfyUI como nodo o carga de LoRA junto a un condicionamiento de normales.

No hay evidencia en la informacion disponible de soporte de tool calling, function calling, comportamiento agentico, razonamiento multi-paso, generacion de codigo, matematicas, vision por comprension (image understanding), audio ni modo de pensamiento. El ambito documentado es exclusivamente la generacion de imagen.

## Casos de uso

- Retexturizado de assets 3D en previsualizacion: a partir del mapa de normales exportado de un modelo low-poly, generar una imagen RGB de referencia que conserve la silueta y los volumenes del asset, util para validar un diseno antes de texturizar en serio.
- Fotografia de producto sintetica: el ejemplo del raton inalambrico muestra que el adaptador mantiene forma, rueda y botones; se puede usar para generar variantes de iluminacion o material de un producto sin que la geometria derivada.
- Concept art con composicion bloqueada: partiendo de un mapa de normales de bloqueo (blocking) creado en 3D o pintado, generar propuestas de color y material conservando la disposicion exacta de los elementos.
- Storyboard y matte painting para escenas complejas: el caso de la via ferroviaria industrial ilustra como fijar vias, estructuras y escombros mientras se generan variaciones de atmosfera o vegetacion.
- Ilustracion con figuras en interaccion: el ejemplo del nino con el perro indica que el adaptador ayuda a mantener la relacion espacial entre sujetos; util en ilustracion editorial donde la composicion es un requisito contractual.
- Retrato con utileria: en el ejemplo del nadador, la conservacion de las cuerdas de la raqueta y de la pila de bolas es relevante en encargos donde los objetos deben permanecer reconocibles.
- Comparacion interna de fidelidad geometrica: usar los tres checkpoints (2000, 3000 y 4000) como linea base en pruebas A/B de preservacion de geometria frente a un flujo sin adaptador.
- Integracion en pipelines de ComfyUI con ControlNet: combinar el condicionamiento por normales con otros condicionamientos (profundidad, bordes) para acotar la estructura en generacion masiva por lotes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay valores de MMLU, HumanEval, GSM8K, FID, CLIP-score, SSIM ni ninguna otra metrica cuantitativa. El autor aporta unicamente cuatro comparativas cualitativas de tres paneles:

| Comparativa | Contenido | Resultado descrito |
|---|---|---|
| 1. Raton inalambrico | Fotografia de producto | Con Normal2RGB: conserva forma, rueda y botones laterales. Sin Normal2RGB: la geometria y los detalles derivan |
| 2. Nino estudiando con perro | Ilustracion | Con Normal2RGB: conserva pose, distribucion de la mesa y posicion del perro. Sin Normal2RGB: cambia la composicion y aparecen objetos extra |
| 3. Nadador con raqueta | Retrato de estudio | Con Normal2RGB: conserva perfil, cuerdas de la raqueta y pila de bolas. Sin Normal2RGB: cambia el angulo de la cara y se desplazan los objetos |
| 4. Via ferroviaria industrial | Paisaje | Con Normal2RGB: conserva vias, estructuras y escombros en primer plano. Sin Normal2RGB: la escena se cubre de vegetacion y la disposicion deriva |

Estas comparativas no incluyen metricas, resoluciones, pesos de LoRA ni semillas, por lo que no son reproducibles a partir de la informacion publicada.

## Requisitos de hardware

- El repositorio pesa 0,3 GB en total, es decir, cada checkpoint ronda los 0,1 GB; el almacenamiento no es un cuello de botella.
- La VRAM necesaria para inferencia no esta documentada y depende por completo del modelo base, que la model card no identifica. No es posible dar una cifra fiable.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible, condicionada al modelo base.
- Opciones de despliegue: ComfyUI es la unica libreria declarada por el autor. No se documenta soporte en diffusers, Automatic1111, Forge, vLLM, llama.cpp, Ollama ni TGI (varios de estos no aplican a modelos de difusion de imagen).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de datos comparativos publicados por el autor. A continuacion se contrasta con alternativas funcionales de la misma categoria (condicionamiento por mapa de normales en generacion de imagen), marcando como no disponible todo aquello que no consta en la informacion proporcionada.

| Modelo | Tipo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Aero-Ex/Qwen-Image2.1_Normal2RGB | LoRA de condicionamiento por normales para ComfyUI | No disponible | No aplica | Sin benchmarks publicados; 4 comparativas cualitativas | Apache 2.0 | 0 descargas, 0 likes |
| ControlNet con condicionamiento normal (familia Stable Diffusion) | Red de control adicional | No disponible | No aplica | No disponible en esta ficha | No disponible en esta ficha | Publico en Hugging Face |
| T2I-Adapter con senal de normales | Adaptador ligero de condicionamiento | No disponible | No aplica | No disponible en esta ficha | No disponible en esta ficha | Publico en Hugging Face |
| Otros LoRA de preservacion de geometria en ComfyUI | LoRA especifico de tarea | No disponible | No aplica | No disponible en esta ficha | Variable | Publicos en Hugging Face |

La comparacion no puede ser cuantitativa porque el autor no publica metricas ni identifica el modelo base sobre el que se aplica el adaptador.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay FID, CLIP-score ni ninguna metrica objetiva; la unica evidencia es cualitativa y no reproducible (sin semillas, pesos ni resoluciones).
- Adopcion nula: 0 descargas y 0 likes, por lo que no existe validacion independiente de la comunidad.
- Modelo base no identificado: la model card no indica sobre que modelo se aplica el LoRA. El nombre del repositorio apunta a Qwen-Image, pero no se confirma en la documentacion, y sin esa confirmacion no se puede garantizar compatibilidad.
- Licencia del modelo base: la licencia Apache 2.0 del adaptador no cubre el modelo base ni los datos de entrenamiento; antes de un uso comercial hay que verificar ambas por separado.
- Procedencia del dataset desconocida: no se documenta el origen de los pares normales / RGB, lo que impide evaluar riesgos de derechos de imagen o de sesgo en el material de entrenamiento.
- Riesgo de deriva geometrica residual: el propio autor ilustra que sin el adaptador la geometria cambia; con el adaptador reduce la deriva, pero no hay datos que cuantifiquen cuanto se conserva realmente en cada checkpoint.
- Eleccion de checkpoint sin criterio documentado: existen versiones de 2000, 3000 y 4000 pasos, pero no se explica cual usar ni que compromiso hay entre fidelidad geometrica y calidad de imagen. Un entrenamiento mas largo puede sobreajustar la geometria y empobrecer la textura.
- Sin informacion sobre pesos de LoRA recomendados ni sobre su combinacion con otros condicionamientos (profundidad, bordes, pose).
- Idiomas no documentados: aunque un modelo de difusion de texto a imagen suele aceptar prompts en varios idiomas, no hay confirmacion para este adaptador.
- Sesgos: no disponible. Al no documentarse el dataset, no se pueden anticipar sesgos de representacion.
- Alucinacion: aplicable en su forma visual, es decir, generacion de detalle inexistente donde el mapa de normales no aporta informacion; el adaptador reduce la reimaginacion de la escena, pero no la elimina.
- Fechas de publicacion y actualizacion identicas (2026-09-22) y sin historial de versiones visible, lo que sugiere un artefacto sin mantenimiento posterior.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Aero-Ex/Qwen-Image2.1_Normal2RGB
- Checkpoints incluidos: `Normal2RGB_2000.safetensors`, `Normal2RGB_3000.safetensors`, `Normal2RGB_4000.safetensors` (rutas relativas dentro del repositorio)
- Comparativas incluidas en el repositorio: `Comparison/ComfyUI_temp_vgpda_00002_.png` (raton inalambrico), `Comparison/ComfyUI_temp_vgpda_00003_.png` (nino con perro), `Comparison/ComfyUI_temp_vgpda_00004_.png` (nadador con raqueta), `Comparison/ComfyUI_temp_vgpda_00006_.png` (via ferroviaria industrial)
- Paper, blog o demostracion adicional: no disponible
- La busqueda web realizada no devolvio enlaces relacionados con el modelo; los resultados obtenidos corresponden a sitios de aeronautica y a entradas lexicograficas sobre el prefijo "aero-", sin relacion con este repositorio.
