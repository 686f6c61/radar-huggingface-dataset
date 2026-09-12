# Pedro21613/PS-IMAGE-1.3

## Resumen

PS-IMAGE-1.3 es un adaptador LoRA de rango 16 (5,98 M de parámetros entrenables) para generación de imágenes fotorrealistas, publicado por el usuario Pedro21613 sobre el checkpoint `stable-diffusion-v1-5/stable-diffusion-v1-5`. No es un modelo completo: es un delta de pesos que se aplica al UNet de Stable Diffusion 1.5 mediante PEFT, orientado a tres dominios concretos: rostros y personas, automóviles (con clases de año, marca y modelo de Stanford Cars) y texturas o materiales de superficie (47 clases de DTD).

La relevancia de esta versión frente a su predecesora (PS-IMAGE-1.2) está en la corrección de un fallo grave de la v1.2: la deformación de rostros (ojos y boca intercambiados). Según la comparativa visual del propio autor, la v1.3 mantiene rasgos faciales correctos con textura de piel detallada, y mejora el grano y el brillo anisotrópico en madera y acero escavado. El entrenamiento fue deliberadamente corto (800 pasos, unos 17 minutos en una Tesla T4 de 16 GB), suficiente para fijar rostros y materiales, pero todavía débil en composiciones complejas como una persona apoyada en un coche.

Se trata de un artefacto de investigación de nicho, con 0 descargas y 0 likes en el momento de la consulta, sin licencia declarada y sin benchmarks numéricos publicados. Su interés principal es metodológico: documenta con detalle hiperparámetros, curvas de pérdida, consumo de VRAM y un error clásico de serialización de adaptadores PEFT (prefijo `base_model.model.` ausente) que hacía que el adapter se cargara vacío sin lanzar error.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA (Low-Rank Adaptation) sobre el UNet de Stable Diffusion 1.5 (modelo de difusión latente) |
| Parámetros totales | 5,98 M en el adaptador LoRA (r=16, alpha=32); el checkpoint base SD 1.5 no se distribuye en este repositorio |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica; resolución de entrenamiento 512×512 px y prompt de texto tokenizado con CLIP (límite estándar de 77 tokens en SD 1.5) |
| Tipos de cuantización | no disponible; el script de ejemplo carga el modelo base en fp16 y el adaptador en safetensors sin cuantizar |
| Idiomas soportados | no disponible; la model card está en portugués, los prompts de ejemplo en inglés y las leyendas de entrenamiento derivan de etiquetas de dataset (predominantemente en inglés) |
| Licencia | no disponible; la ficha no declara licencia para el adaptador (el modelo base SD 1.5 se distribuye bajo CreativeML Open RAIL-M, por lo que conviene verificar la compatibilidad antes de uso comercial) |
| Formato de pesos | safetensors (formato de adaptador PEFT/LoRA: `adapter_model.safetensors` y `ema/adapter_model.safetensors`) |
| Tamaño del adaptador | 24 MB por archivo (repositorio completo: 0,2 GB) |
| Pipeline | text-to-image (`diffusers` + `peft`) |
| Modelo base | `stable-diffusion-v1-5/stable-diffusion-v1-5` (antes `runwayml/stable-diffusion-v1-5`) |
| Fecha de publicación | 11 de septiembre de 2026 (última actualización el mismo día) |

## Arquitectura y entrenamiento

El adaptador aplica LoRA sobre dos bloques del UNet de SD 1.5: los módulos de atención y las capas feed-forward, con rango 16 y alpha 32 (frente al rango 12 y alpha 24, solo atención, de la v1.2). El entrenamiento se ejecutó en una Tesla T4 de 16 GB vía la API de Kaggle, en fp16, durante 800 pasos con learning rate 2,2e-4, scheduler cosine con warmup, pérdida ponderada con min-SNR γ=5 y EMA con decay 0,995. El pico de VRAM registrado fue de 13,4 GB y el tiempo de 1,30 s por paso (aproximadamente 17 minutos en total). El autor indica explícitamente que la rama EMA no se debe usar en esta versión: con solo 800 pasos la media móvil está subentrenada y produce resultados casi idénticos a la SD 1.5 pura.

El dataset suma 1.820 imágenes con leyendas derivadas de etiquetas reales, procedentes de tres fuentes públicas: FFHQ a 512² para rostros (con descripción textual real, en sustitución de los recortes de Caltech Faces usados en v1.2), Stanford Cars con 196 clases que codifican año, marca y modelo, y DTD con 47 clases de superficie o material. No se menciona ningún uso de RLHF, DPO ni fine-tuning por preferencias, algo esperable en un modelo de difusión. El autor reconoce que 800 pasos es una pasada corta y propone como siguientes pasos llegar a 2.500–3.500 pasos, reforzar el dominio de automóviles con unas 1.200 imágenes y reducir el LR final a 0,05×.

Como nota técnica destacable, la model card documenta un fallo de serialización: las claves del archivo del adaptador deben llevar el prefijo `base_model.model.<...>.lora_A.weight` junto con el metadato `{"format": "pt"}`. En la primera subida faltaba ese prefijo, PEFT cargaba un adaptador vacío sin lanzar ningún error y las imágenes generadas eran idénticas a las de SD 1.5 pura. El problema se corrigió en `psimage_train.py` (función `param_key`) y en el archivo publicado.

## Capacidades

- Generación de texto a imagen fotorrealista en resolución nativa de 512×512 píxeles.
- Retratos y rostros humanos realistas: textura de piel, poros, iluminación natural y rasgos faciales correctos (principal mejora respecto a la v1.2).
- Automóviles con control de año, marca y modelo, gracias a las 196 clases de Stanford Cars presentes en el entrenamiento.
- Texturas y materiales de superficie: madera, acero escavado, lino, mármol y otras clases de DTD; el autor reporta mejoras claras en grano de madera y brillo anisotrópico del acero.
- Integración como adaptador LoRA estándar en un pipeline `StableDiffusionPipeline` de diffusers, con opción de fusionar los pesos en el UNet (`merge_and_unload`) para eliminar la sobrecarga del adaptador en inferencia.
- Ejecución por línea de comandos mediante el script `usar_v13.py`, con opción `--ema` para cargar la variante de media móvil.
- No soporta tool calling, function calling, razonamiento multi-paso ni comportamiento de agente: no es un modelo de lenguaje.
- No dispone de capacidades de visión, audio, vídeo ni edición de imagen; únicamente generación condicionada por texto.
- El modelo no incluye el `safety_checker` en el ejemplo de uso (se carga con `safety_checker=None`).

## Casos de uso

- Generación de retratos sintéticos para prototipos de producto: la mejora en rostros permite crear avatares y fotos de perfil de prueba para maquetas de aplicaciones, evitando el uso de imágenes de personas reales.
- Previsualización de marketing de automoción: con las clases de año, marca y modelo de Stanford Cars, se pueden generar bocetos de vehículos para pruebas de concepto de campañas o catálogos antes de disponer de fotografía profesional.
- Texturizado para pipelines 3D y videojuegos: la generación de madera, acero escavado, lino o mármol a partir de DTD permite producir mapas de textura base que después se retocan en Substance Painter o Blender.
- Aumento de datos sintéticos para investigación en visión por computador: se pueden generar variaciones de rostros o de vehículos para ampliar datasets de clasificación, siempre que se documente el origen sintético y se evalúe el sesgo introducido.
- Estudio metodológico de LoRA en difusión: el repositorio incluye `training_config.json` y `training_report.json` con hiperparámetros, curva de pérdida, VRAM y tiempos, lo que lo convierte en un caso reproducible para comparar rango, alpha, EMA y número de pasos en un presupuesto de cómputo mínimo (una sola T4 y 17 minutos de entrenamiento).
- Producción de storyboards y previsualización de escenas urbanas: el modelo funciona razonablemente en escenas de ciudad con vehículos, útil para comunicación de ideas antes de encargar renderizado final.
- Experimentación con adaptadores compatibles con SD 1.5: al ser un LoRA de formato estándar, puede combinarse con otros LoRA de SD 1.5 para pruebas de composición de conceptos, aunque esta combinación no está documentada por el autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor no incluye métricas numéricas (FID, CLIP score, IS ni evaluaciones automáticas); únicamente aporta comparativas visuales cualitativas generadas con el mismo prompt, la misma semilla, scheduler Euler y 30 pasos con CFG 7,5. Se reproducen a continuación tal como las describe la model card, sin que constituyan una medición cuantitativa:

| Aspecto evaluado | SD 1.5 base | PS-IMAGE 1.2 | PS-IMAGE 1.3 |
|---|---|---|---|
| Rostros | aspecto plástico | deformación de ojos y boca | rasgos correctos con piel detallada |
| Textura de madera | sin detalle de grano | no reportado | grano realista |
| Acero escavado | sin detalle | no reportado | brillo anisotrópico realista |
| Lino | no reportado | no reportado | mejora escasa |
| Coches en escena urbana | no reportado | artefactos verdes en el fondo | empata o supera a la v1.2 |
| Persona apoyada en un coche | falla | falla | sigue fallando |

## Requisitos de hardware

- El adaptador en sí ocupa 24 MB, pero la inferencia requiere cargar el modelo base SD 1.5 completo (UNet, text encoder CLIP y VAE); el script de ejemplo lo hace en fp16 con `torch_dtype=torch.float16`.
- VRAM estimada para inferencia a 512×512 en fp16: del orden de 4 a 6 GB sin optimizaciones (estimación basada en el coste habitual del pipeline SD 1.5, no medida por el autor). Con atención eficiente, `attention slicing` o `enable_model_cpu_offload` el consumo baja y permite ejecución en GPUs de gama media.
- Cabe en GPU de consumo: cualquier tarjeta con 6 GB o más de VRAM (RTX 3060, 4060, 2070 y superiores) debería poder ejecutar el pipeline en fp16 a 512×512; en tarjetas de 4 GB conviene aplicar offload de módulos.
- GPU de referencia para entrenamiento: Tesla T4 de 16 GB en Kaggle, con un pico medido de 13,4 GB. El autor advierte de que la P100 de la misma plataforma no funciona porque la imagen con `torch 2.10+cu128` no incluye kernel para sm_60.
- Throughput y latencia de entrenamiento medidos: 1,30 s por paso, 800 pasos en aproximadamente 17 minutos. No se publican datos de latencia ni de throughput de inferencia.
- Opciones de despliegue documentadas: `diffusers` + `peft` en Python (con `merge_and_unload` opcional) o el script `usar_v13.py` por línea de comandos. No se documenta compatibilidad con ComfyUI, Automatic1111, Forge ni otros frontends, aunque el formato de pesos es un LoRA estándar de SD 1.5 y en teoría sería cargable en ellos (sin verificación por parte del autor).
- No aplica `vLLM`, `llama.cpp`, `Ollama` ni `TGI`: son herramientas para modelos de lenguaje, no para difusión.

## Comparativa con modelos similares

| Modelo | Tipo | Conceptos | Parámetros del adaptador | Contexto / resolución | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| PS-IMAGE-1.3 | LoRA sobre SD 1.5 | personas, coches, texturas | 5,98 M (r=16, alpha=32) | 512×512 | no declarada | 0 descargas, 0 likes |
| PS-IMAGE-1.2 | LoRA sobre SD 1.5 (mismo autor) | mascotas, Caltech101 | no disponible (r=12, alpha=24) | 512×512 | no declarada | no disponible |
| SD 1.5 base | Modelo de difusión completo | dominio general | ~860 M en el UNet (dato público del modelo base, no de esta ficha) | 512×512 | CreativeML Open RAIL-M | ampliamente desplegado |

No se dispone de datos de benchmarks ni de comparativas con otros LoRA de la misma categoría (por ejemplo adaptadores de retrato o de automoción sobre SD 1.5) en la información proporcionada.

## Limitaciones y advertencias

- Entrenamiento muy corto: solo 800 pasos. El propio autor señala que es suficiente para fijar rostros y materiales, pero insuficiente para composiciones complejas.
- Manos, matrículas y logotipos siguen generándose mal, consecuencia de entrenar a 512×512 con leyendas cortas.
- Falla de forma persistente en escenas que combinan persona y coche, un fallo que también presenta la SD 1.5 base.
- La rama EMA (`ema/adapter_model.safetensors`) no debe usarse con esta versión: está subentrenada con 800 pasos y produce resultados casi idénticos al modelo base.
- Sesgos de dataset: FFHQ, Stanford Cars y DTD son colecciones acotadas (rostros mayoritariamente de Flickr, vehículos del mercado estadounidense, materiales de uso común). El modelo tenderá a sobrerrepresentar esos estilos y a fallar fuera de ellos. El autor no aporta ninguna evaluación de sesgo.
- La generación de rostros fotorrealistas conlleva riesgo de uso indebido para suplantación o desinformación; el ejemplo de uso desactiva además el `safety_checker`.
- Licencia no declarada: no se puede asumir permiso de uso comercial. El modelo base SD 1.5 está bajo CreativeML Open RAIL-M, con sus propias restricciones de uso, y el adaptador hereda en la práctica las limitaciones del modelo del que depende.
- Prompts: los ejemplos y las fórmulas documentadas están en inglés; no hay evidencia de que el adaptador responda bien a prompts en castellano, ya que las leyendas de entrenamiento derivan de etiquetas de dataset en inglés.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, sin validación por parte de terceros.
- Riesgo de alucinación visual: como todo modelo de difusión, puede generar anatomías, perspectivas y objetos físicamente incoherentes, especialmente en escenas con varios sujetos.
- Al ser un adaptador, cualquier cambio en el modelo base (versión, cuantización o merge con otros LoRA) altera el comportamiento y puede degradar los rasgos aprendidos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Pedro21613/PS-IMAGE-1.3
- Modelo base: https://huggingface.co/stable-diffusion-v1-5/stable-diffusion-v1-5
- Archivos incluidos en el repositorio: `adapter_model.safetensors`, `ema/adapter_model.safetensors`, `examples/` (rejillas comparativas `grid_compare.png` y `multi_seed_historia.png`), `training_config.json`, `training_report.json`, `usar_v13.py` y `psimage_train.py`.
- Datasets citados por el autor sin enlace directo en la model card: FFHQ (Flickr-Faces-HQ), Stanford Cars y DTD (Describable Textures Dataset).
- La búsqueda web realizada no devolvió ningún enlace relevante sobre este modelo: los resultados obtenidos correspondían a páginas turísticas sobre la isla de Rodas y no guardan relación con el modelo. No se han encontrado papers, blogs ni demos adicionales.
