# ChenDY/NitroFusion2-Controlnet-Union

## Resumen

NitroFusion2-Controlnet-Union es un adaptador ControlNet de tipo union desarrollado por ChenDY para el modelo de difusion NitroFusion2. Se trata de un finetuning del ControlNet Z-Image-Turbo-Fun-Controlnet-Union-2.1 (version 2602) de alibaba-pai, reentrenado para funcionar con NitroFusion2 en regimenes de inferencia de 1 y 2 pasos. El modelo resuelve el problema de aplicar control espacial estructurado (pose, profundidad, bordes, etc.) sobre un modelo de difusion optimizado para generar imagenes con muy pocos pasos de muestreo, algo que los ControlNet convencionales no soportan de forma nativa.

El adaptador es relevante porque permite combinar la velocidad de los modelos de difusion de un solo paso con el control fino de la composicion, manteniendo un consumo de memoria moderado respecto a los ControlNet de mayor capacidad. Se distribuye como archivo safetensors unico (single-file) pensado para ComfyUI, con dos variantes: la union completa (15 bloques de control mas 2 bloques refiner) y una version lite (3 bloques de control mas 2 refiner) mas ligera en memoria pero con control mas debil.

El modelo esta publicado bajo licencia Apache 2.0 y solo declara soporte para el idioma ingles en los prompts. Debe usarse obligatoriamente con NitroFusion2 como modelo base, ya que es un adaptador y no un modelo autonomo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ControlNet union (adaptador de difusion) sobre el modelo base NitroFusion2; derivado de Z-Image-Turbo-Fun-Controlnet-Union-2.1 |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de difusion text-to-image, no aplica ventana de contexto de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (single-file, libreria diffusion-single-file) |

## Arquitectura y entrenamiento

El modelo es un ControlNet de tipo union, es decir, un adaptador que inyecta senales de control espacial en el modelo de difusion base mediante bloques de control acoplados a las capas del backbone. En concreto, la variante completa incorpora 15 bloques de control y 2 bloques refiner, mientras que la variante lite reduce a 3 bloques de control mas 2 refiner. El adaptador se ha obtenido por finetuning del ControlNet Z-Image-Turbo-Fun-Controlnet-Union-2.1 (version 2602) de alibaba-pai, reajustado para operar con NitroFusion2 en 1 y 2 pasos de muestreo.

Las condiciones de control soportadas son Canny, HED, Depth, Pose, Scribble, Gray e inpainting. No se dispone de informacion sobre el volumen de datos de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO (no aplicables en un adaptador de difusion). Una innovacion operativa destacable es el uso de ComfyUI-BypassLoRA en el flujo de 2 pasos: la LoRA se aplica sin fusionarla en los pesos, lo que acelera la generacion de 2 pasos entre 1,5 y 3,5 veces segun la model card.

## Capacidades

- Generacion de imagenes text-to-image condicionada por mapas de control espacial (Canny, HED, Depth, Pose, Scribble, Gray).
- Inpainting guiado por mascara como condicion de control adicional.
- Inferencia en 1 paso y 2 pasos, orientada a baja latencia.
- Control de composicion y estructura mediante senales externas (bordes, profundidad, pose, garabatos).
- Integracion nativa con ComfyUI mediante flujos de trabajo incluidos en el repositorio (1step y 2step).
- Version lite para entornos con menor memoria.
- Soporte de prompt en ingles (unico idioma declarado).
- No dispone de tool calling, function calling, agentes ni razonamiento multi-paso (no es un modelo de lenguaje).

## Casos de uso

- Control de pose en generacion de personajes: a partir de un esqueleto de pose se genera una imagen coherente con la postura en 1 paso, util para iterar rapidamente sobre bocetos de figuras humanas.
- Transferencia de estructura por bordes (Canny/HED): permite convertir bocetos o contornos en imagenes finales manteniendo la silueta, adecuado para ilustracion y concept art.
- Condicionamiento por profundidad: genera escenas respetando la geometria de un mapa de profundidad, util para composicion de entornos y previsualizacion 3D.
- Inpainting guiado: rellena regiones enmascaradas de una imagen existente manteniendo coherencia con el contexto, apropiado para retoque y edicion.
- Prototipado rapido en ComfyUI: los workflows de 1 y 2 pasos permiten generar variaciones en segundos, lo que encaja en pipelines de exploracion creativa.
- Control de garabatos (Scribble): convierte bocetos simples en imagenes detalladas, util para artistas que trabajan desde bocetos a mano.
- Generacion controlada en produccion con restricciones de latencia: al operar en 1-2 pasos, reduce el coste computacional frente a ControlNet convencionales que requieren decenas de pasos.
- Version lite para hardware modesto: despliegue en GPU consumer con menor huella de memoria cuando el control estricto no es critico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye unicamente comparaciones visuales cualitativas (imagenes de control frente a resultados) para Pose, Canny, HED y Depth en 1 paso, sin metricas numericas (FID, CLIP score, etc.).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el repositorio ocupa 8,7 GB, lo que orienta el orden de magnitud del checkpoint completo. La variante lite reduce la huella de memoria respecto a la union completa.
- GPU recomendadas: no especificadas en la informacion disponible.
- Compatibilidad con GPU consumer: probable en funcion de la VRAM del modelo base NitroFusion2 y de la variante (lite o completa), pero no confirmada con cifras.
- Opciones de despliegue: ComfyUI (flujos 1step y 2step incluidos); ComfyUI-BypassLoRA para el modo de 2 pasos. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a difusion).
- Latencia y throughput: la model card indica que el modo de 2 pasos con BypassLoRA es entre 1,5 y 3,5 veces mas rapido que la aplicacion fusionada de la LoRA; no se aportan tiempos absolutos.

## Comparativa con modelos similares

| Modelo | Tipo | Pasos | Condiciones de control | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| NitroFusion2-Controlnet-Union (completo) | ControlNet union (15+2 bloques) | 1-2 | Canny, HED, Depth, Pose, Scribble, Gray, inpainting | apache-2.0 | Hugging Face |
| NitroFusion2-Controlnet-Union-lite | ControlNet union (3+2 bloques) | 1-2 | mismas condiciones, control mas debil | apache-2.0 | Hugging Face |
| Z-Image-Turbo-Fun-Controlnet-Union-2.1 (2602) | ControlNet union original | no adaptado a 1-2 pasos con NitroFusion2 | mismas condiciones | no disponible | Hugging Face (alibaba-pai) |

No se dispone de datos de rendimiento cuantitativos para establecer una comparacion numerica con alternativas.

## Limitaciones y advertencias

- Requiere obligatoriamente NitroFusion2 como modelo base; no funciona de forma autonoma.
- Solo declara soporte de prompts en ingles.
- La variante lite ofrece control mas debil que la union completa.
- No se dispone de informacion sobre sesgos, riesgo de alucinacion visual ni evaluaciones de seguridad.
- No hay metricas de calidad publicadas (FID, CLIP score, etc.), solo comparaciones visuales.
- El uso de BypassLoRA en 2 pasos depende de un nodo externo y de un PR de ComfyUI aun no integrado oficialmente en el momento de la model card; conviene verificar compatibilidad en produccion.
- Licencia Apache 2.0 permite uso comercial, pero deben respetarse las condiciones del modelo base NitroFusion2 y del ControlNet de origen (alibaba-pai), cuya licencia no se detalla en la informacion disponible.
- Repositorio de 8,7 GB: considerar espacio en disco y memoria al desplegar la variante completa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ChenDY/NitroFusion2-Controlnet-Union
- Modelo base NitroFusion2: https://huggingface.co/ChenDY/NitroFusion2
- ControlNet de origen (alibaba-pai): https://huggingface.co/alibaba-pai/Z-Image-Turbo-Fun-Controlnet-Union-2.1
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/ChenDY/NitroFusion2
- Repositorio GitHub: https://github.com/ChenDarYen/NitroFusion2
- Pagina del proyecto: https://chendaryen.github.io/NitroFusion2.github.io/
- Paper (arXiv): https://arxiv.org/abs/2611.05648
- ComfyUI-BypassLoRA: https://github.com/ChenDarYen/ComfyUI-BypassLoRA
- ComfyUI PR #17408: https://github.com/Comfy-Org/ComfyUI/pull/17408
