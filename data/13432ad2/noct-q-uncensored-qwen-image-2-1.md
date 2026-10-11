# 13432ad2/Noct-Q-Uncensored-Qwen-Image-2.1

## Resumen

Noct Q es un modelo de generación de imágenes a partir de texto derivado de Qwen/Qwen-Image-2.1, publicado por el usuario 13432ad2 (la licencia enlaza además a la cuenta Noctaluna). Se distribuye como un único fichero de difusión en formato safetensors cuantizado a int8, pensado para cargarse directamente en ComfyUI, y su rasgo diferencial es que ha sido ajustado para eliminar el filtrado de contenido: según su autor, genera desnudos y escenas explícitas sin necesidad de aplicar un LoRA adicional. El repositorio ocupa 14,5 GB e incluye dos checkpoints int8 (versiones V4 y V3) y un workflow de ComfyUI.

El modelo no introduce una arquitectura nueva: es un merge/derivado del transformer de Qwen-Image-2.1 con pesos modificados, por lo que hereda el pipeline de difusión texto-a-imagen del modelo base y su encoder de texto multimodal Qwen3-VL-8B, también en int8. La model card no publica número de parámetros, longitud de contexto del encoder ni composición del dataset de ajuste.

Su relevancia es acotada y muy específica: cubre un nicho (generación fotorrealista de figura humana sin censura) dentro del ecosistema Qwen-Image, con licencia de investigación que restringe el uso comercial. No hay métricas publicadas ni validación de la comunidad: el repositorio registra 0 descargas y 0 likes en el momento de redactar esta ficha.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Modelo de difusión basado en transformer (derivado de Qwen/Qwen-Image-2.1 con pesos del transformer modificados); detalles concretos no disponibles |
| Parámetros totales | No disponible (el fichero int8 de 7,3 GB sugiere un transformer del orden de 7.000 millones de parámetros; estimación no confirmada por el autor) |
| Parámetros activos | No aplica (no hay indicios de arquitectura MoE) |
| Longitud de contexto | No disponible; el encoder de texto es Qwen3-VL-8B y la model card no declara límite de tokens |
| Tipos de cuantización | int8 (variante «convrot») en los ficheros del repositorio; el autor menciona versiones int4, fp8, bf16 y fp16 alojadas en Civitai |
| Idiomas soportados | No disponible; los ejemplos y la documentación están en inglés y en chino |
| Licencia | Qwen Research License Agreement (uso no comercial); etiquetada como «other»/«qwen-research» |
| Formato de pesos | safetensors (fichero único, librería `diffusion-single-file`); workflow auxiliar en JSON |

Otros datos del repositorio: 14,5 GB de tamaño, fecha de creación 2026-10-11, pipeline declarado `text-to-image`.

## Arquitectura y entrenamiento

Noct Q no es un entrenamiento desde cero ni publica detalles de su proceso de ajuste. La model card lo describe explícitamente como una obra derivada de Qwen/Qwen-Image-2.1 «con pesos del transformer modificados» y con relación `base_model_relation: merge`, es decir, una fusión de pesos sobre el modelo base en lugar de un fine-tuning documentado. No se indican número de tokens de entrenamiento, composición del dataset, ni si hubo etapas de RLHF, DPO o ajuste por preferencias. Tampoco se documenta la técnica exacta de fusión ni qué subconjuntos de pesos se han alterado.

El sistema se compone de tres piezas que el usuario debe colocar manualmente en ComfyUI: el transformer cuantizado a int8 (`NoctQ_V4_int8_convrot.safetensors`, 7,3 GB, o la versión previa V3), el encoder de texto `qwen3vl_8b_int8_convrot.safetensors` (basado en Qwen3-VL-8B) y el VAE `qwen_image_2.1_vae_bf16.safetensors`, estos dos últimos distribuidos por Comfy-Org. El ajuste declarado afecta al comportamiento de muestreo respecto a la censura del base: la versión V4 afirma resolver escenas explícitas con acompañante tres veces más a menudo que V3, afirmación del autor sin metodología de evaluación publicada. Los ajustes de inferencia recomendados son 25 pasos, sampler euler, scheduler simple, CFG 3 con prompt negativo (CFG 1 reduce aproximadamente a la mitad el tiempo de generación, a costa de ignorar el prompt negativo) y resolución 1024x1536 en vertical.

## Capacidades

- Generación de imagen a partir de texto con prompts en prosa (frases completas tipo pie de foto), no listas de etiquetas; el autor indica que no requiere palabra de activación.
- Fotorrealismo de figura humana completa, incluidos desnudos, en escenas de luz diurna, flash y nocturna.
- Escenas explícitas con dos personas, sin LoRA adicional, según la model card.
- Renderizado de texto legible en carteles y etiquetas dentro de la imagen.
- Ilustración estilo anime y pintura digital.
- Edición de imagen reutilizando los mismos ficheros con la plantilla de edición de Qwen Image 2.1 en ComfyUI.
- Control de composición mediante descripción explícita de plano, encuadre e iluminación.
- No se documentan capacidades de tool calling, agentes, audio ni vídeo: es un modelo exclusivamente texto-a-imagen.

## Casos de uso

- Ilustración de figura humana y desnudo artístico: permite generar estudios de anatomía, luz y encuadre sin capas de censura, útil para ilustradores que necesitan referencias fotográficas consistentes en 1024x1536.
- Cómic y novela gráfica para público adulto: la coherencia en escenas con dos personajes y el renderizado de texto en carteles permiten producir viñetas con diálogo integrado.
- Prototipado de iluminación para fotografía: al aceptar descripciones de esquema de luz (flash directo, luz nocturna, luz natural), sirve para previsualizar opciones de iluminación antes de un rodaje.
- Previsualización de arte conceptual para proyectos de ficción: storyboards y keyframes de escenas adultas en producciones audiovisuales, con generación local y sin dependencia de APIs externas.
- Edición de imagen en flujo ComfyUI: la plantilla de edición de Qwen Image 2.1 permite retocar o recomponer imágenes existentes con los mismos pesos int8, útil para pipelines de posproducción.
- Generación de material gráfico con tipografía: carteles, etiquetas y rótulos con texto legible, aplicable a maquetas de packaging o señalética ficticia.
- Experimentación en investigación sobre alineación y censura: al ser un derivado sin filtrado de un modelo base censurado, permite estudiar diferencias de comportamiento entre pesos base y fusionados en tareas controladas.
- Despliegue local en estaciones de trabajo con GPU de gama media: el formato int8 de 7,3 GB hace viable ejecutar el pipeline completo en tarjetas de 12 GB dentro de ComfyUI, sin servicios en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay métricas objetivas (FID, CLIP score, HPSv2, GenEval, evaluación humana) en la model card ni en los datos del repositorio.

| Afirmación del autor (no verificada) | Detalle |
|---|---|
| V4 frente a V3 en escenas explícitas con acompañante | «Tres veces más a menudo» según la model card; sin metodología ni conjunto de evaluación |
| Coste de CFG | CFG 1 es aproximadamente el doble de rápido que CFG 3 a 25 pasos |
| Compatibilidad | Requiere ComfyUI 0.37 o superior y solo nodos core |
| Validación comunitaria | 0 descargas y 0 likes en el repositorio de HuggingFace en el momento del análisis |

## Requisitos de hardware

- VRAM para inferencia: el autor indica 8-12 GB para el fichero V4 int8. Hay que sumar el encoder de texto Qwen3-VL-8B int8 y el VAE bf16, por lo que un presupuesto realista de memoria total en GPU se sitúa por encima de esos 12 GB si no se hace offload por etapas.
- GPU de consumo compatibles: RTX 3060 12 GB, RTX 4070 / 4070 Super 12 GB, RTX 4070 Ti Super y 4080 con 16 GB, RTX 4090 y 5090 con 24-32 GB. Cualquier tarjeta con menos de 8 GB queda fuera del rango declarado.
- GPU profesionales: A100 40/80 GB, H100, L40S; no son necesarias para una sola imagen, pero permiten lotes grandes y ejecución simultánea de encoder y transformer sin gestión manual de memoria.
- Opciones de despliegue: ComfyUI 0.37 o superior con nodos core (el transformer va en `models/diffusion_models`). No se declara soporte para vLLM, TGI, Ollama ni llama.cpp, que no aplican a este tipo de modelo; tampoco se documenta un pipeline de Diffusers.
- Latencia y throughput: no disponibles. El único dato indirecto es que bajar de CFG 3 a CFG 1 con 25 pasos reduce el tiempo de generación aproximadamente a la mitad.
- Resoluciones recomendadas: 1024x1536 en vertical según la model card; otras relaciones de aspecto no se documentan.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / prompt | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Noct Q (V4 int8) | No disponible (fichero int8 de 7,3 GB) | Prosa descriptiva; límite no declarado | Qwen Research License, solo no comercial | safetensors single-file + workflow ComfyUI | HuggingFace (0 descargas) y Civitai |
| Qwen/Qwen-Image-2.1 (base) | No disponible en la información proporcionada | No disponible | No disponible en la información proporcionada | No disponible | Modelo base referenciado; componentes distribuidos por Comfy-Org |
| Merges sin censura de otras familias (SDXL, FLUX.1-dev) | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de rendimiento comparativos entre Noct Q y alternativas de la misma categoría. La única comparación documentada es interna (V4 frente a V3) y procede del propio autor.

## Limitaciones y advertencias

- Contenido para adultos: el modelo está etiquetado como `nsfw` y `not-for-all-audiences`; genera desnudos y escenas explícitas sin filtrado. Requiere control de acceso y verificación de edad en cualquier despliegue.
- Licencia restrictiva: Qwen Research License Agreement, uso exclusivamente no comercial. Cualquier explotación comercial (incluida la generación por encargo o dentro de un producto) queda fuera de los términos declarados.
- Sin validación externa: 0 descargas y 0 likes; no hay evaluaciones independientes, comparativas ni réplicas de terceros.
- Sin benchmarks: no existen métricas objetivas de calidad, fidelidad al prompt, coherencia anatómica ni tasas de fallo.
- Riesgo de artefactos anatómicos y de composición: habitual en modelos de difusión en escenas complejas con múltiples sujetos; el autor no documenta tasas de fallo.
- Fidelidad al prompt no garantizada: las afirmaciones sobre escenas explícitas con acompañante proceden de la model card sin metodología de medición.
- Sesgos: no se documenta ninguna auditoría de sesgos de representación (edad, etnia, corporalidad). El propio autor recomienda indicar edad adulta explícitamente en el prompt, lo que sugiere sensibilidad del modelo a ese campo.
- Idiomas: no se declaran idiomas soportados; los ejemplos están en inglés y chino, y se desconoce el comportamiento con prompts en castellano.
- Requisitos de uso: ComfyUI 0.37 o superior y solo nodos core; fuera de ese entorno no hay instrucciones de carga ni pipeline alternativo.
- Componentes externos: el encoder de texto y el VAE deben descargarse por separado desde el repositorio de Comfy-Org, con disponibilidad y versiones fuera del control del autor.
- Inconsistencia de identidad: el repositorio se publica bajo el usuario 13432ad2, mientras que el enlace de licencia apunta a Noctaluna. Conviene verificar la procedencia y el texto completo de la licencia antes de cualquier uso.
- Implicaciones legales: la generación de imágenes fotorrealistas de personas sin consentimiento puede infringir normativa sobre derechos de imagen y contenido íntimo en distintas jurisdicciones.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/13432ad2/Noct-Q-Uncensored-Qwen-Image-2.1
- Modelo base: https://huggingface.co/Qwen/Qwen-Image-2.1
- Galería, prompts y ficheros int4, fp8, bf16 y fp16: https://civitai.com/models/2958896
- Text encoder (Comfy-Org): https://huggingface.co/Comfy-Org/Qwen-Image-2.1/blob/main/text_encoders/qwen3vl_8b_int8_convrot.safetensors
- VAE (Comfy-Org): https://huggingface.co/Comfy-Org/Qwen-Image-2.1/blob/main/vae/qwen_image_2.1_vae_bf16.safetensors
- Licencia: https://huggingface.co/Noctaluna/Noct-Q-Uncensored-Qwen-Image-2.1/blob/main/LICENSE
