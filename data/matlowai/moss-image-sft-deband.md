# MATLOWAI/MOSS-Image-SFT-DeBand

## Resumen

MOSS-Image-SFT-DeBand es un conjunto de dos adaptadores LoRA publicados por MATLOWAI que corrigen un defecto concreto del modelo de difusión text-to-image OpenMOSS-Team/MOSS-Image-SFT: la aparición de finas franjas verticales de color, espaciadas de forma regular, en zonas lisas como cielos, niebla, fondos desenfocados o paredes. No es un modelo generativo nuevo, sino un parche de pesos que se aplica sobre el modelo base en ComfyUI mediante un nodo `LoraLoaderModelOnly`, sin necesidad de nodos personalizados para los presets estándar.

El mecanismo es inusual y muy quirúrgico: cada LoRA es una diferencia de pesos exacta que devuelve parte de las capas del transformer de la versión SFT a los pesos de la versión Base. El parche principal cubre las cinco últimas capas (37-41) y un segundo parche opcional cubre las capas 32-36 para los casos más difíciles. El resto del modelo queda intacto, de modo que la imagen generada se mantiene lo más cerca posible de lo que habría producido el SFT original.

Su relevancia práctica es alta para quien ya tenga un pipeline montado con MOSS-Image SFT: no requiere reentrenar, no cambia el prompt ni la semilla, y se puede combinar con LoRAs de velocidad de la comunidad para bajar de 25 pasos a 14, 10 o incluso 4-8 pasos. Además, el autor publica una variante ya fusionada en int8 de 5,4 GB (MOSS-Image-SFT-DeBand-int8) que elimina la necesidad de gestionar LoRAs.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Modelo de difusión text-to-image; los LoRA actúan sobre las capas 32-41 del transformer del modelo base (arquitectura interna del base no detallada en la información disponible) |
| Parámetros totales | No disponible. El paquete fusionado en int8 ocupa 5,4 GB, lo que situaría el modelo en el orden de 5-6 mil millones de parámetros (estimación propia, no confirmada por el autor) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo de imagen). Resoluciones de trabajo documentadas: 768×1024, 1024×1024, 1280×720; el banding se agrava a partir de 1536 px de ancho |
| Tipos de cuantización | bf16 (LoRA y modelo base) e int8 (variante fusionada DeBand-int8) |
| Idiomas soportados | No disponible (el prompt se procesa con el text encoder del modelo base, cuyos idiomas no se documentan) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, archivo único para `diffusion-single-file` / ComfyUI; variante int8 empaquetada |

## Arquitectura y entrenamiento

El repositorio no contiene un modelo entrenado desde cero ni un fine-tuning adicional. Cada LoRA es una **diferencia de pesos exacta** calculada entre los pesos del modelo SFT y los del modelo Base del mismo proyecto: al aplicarla con fuerza 1.0, un subconjunto de capas del transformer vuelve a comportarse como en Base, que no presenta el patrón de bandas verticales, mientras el resto del modelo conserva el comportamiento del SFT. El parche principal afecta a las cinco últimas capas (37-41) y el parche extra a las capas 32-36; el resto de capas no se modifica. El detalle del método de localización de capas está en el archivo ANALYSIS.md del repositorio, cuyo contenido no se incluye en la información disponible.

No hay, por tanto, dataset de entrenamiento, número de tokens, ni fases de RLHF o DPO asociadas a estos adaptadores: es un procedimiento de edición de pesos sobre un modelo de difusión ya entrenado. La innovación destacable es la granularidad del parche (5 capas por LoRA, aplicación aditiva sobre bf16) y el empaquetado de presets de workflow que combinan la corrección con LoRAs de velocidad de la comunidad, con el objetivo explícito de no degradar el seguimiento de prompt (verificado con una prueba de layout de cuatro objetos y un texto renderizado).

## Capacidades

- Eliminación del banding vertical en superficies lisas (cielos, niebla, degradados, fondos, paredes) sobre MOSS-Image SFT.
- Preservación de la composición y del aspecto del SFT original: misma semilla y mismo prompt producen imágenes muy cercanas, según las métricas de similitud del autor.
- Corrección en dos niveles: parche principal (capas 37-41) para la mayoría de casos y parche extra (capas 32-36, preset Quality+) para cielos y degradados difíciles.
- Compatibilidad con LoRAs de velocidad de la comunidad, con presets documentados a 25, 14, 10 y 4-8 pasos.
- Integración en ComfyUI sin nodos personalizados para Quality, Quality+, Balanced, Fast y Fast alt; solo los presets Turbo requieren dos nodos adicionales.
- Mantenimiento del seguimiento de prompt: en la prueba de layout, todas las configuraciones colocaron los cuatro objetos en sus cajas y renderizaron correctamente el texto "LAYOUT OK".
- Capacidad de generar escenas complejas (multitudes, reflejos, vapor, neón, texto en imagen) a 1280×720 con la corrección activa.
- Variante lista para usar en int8 (5,4 GB) con el parche y el preset Fast ya fusionados, sin LoRAs ni nodos extra.
- No incorpora tool calling, function calling, razonamiento multi-paso ni capacidades de agente: es exclusivamente un modelo de generación de imágenes.
- No añade idiomas ni modalidades nuevas respecto al modelo base.

## Casos de uso

- **Producción de paisajes y cielos para stock o ilustración editorial**: los degradados amplios son el escenario donde el SFT bandea más; con el parche principal a fuerza 1.0 y, si hace falta, el extra (Quality+), se obtienen cielos limpios sin cambiar el prompt ni la semilla, lo que permite reutilizar composiciones ya aprobadas.
- **Ilustración anime y fondos de superficies planas**: el repositorio incluye ejemplos específicos (muelle anime, ilustración de invierno con una mujer en un jersey de pingüinos) donde las zonas de color plano evidencian las franjas; el parche las elimina manteniendo el estilo.
- **Fotografía de producto y bodegón**: en bodegones de aceite y botellas de perfume sobre fondos de estudio, los degradados suaves del fondo son propensos al banding; aplicar el LoRA evita retoques posteriores en el fondo.
- **Iteración rápida en ComfyUI con el preset Fast (10 pasos)**: para exploración de conceptos o generación de variantes en bloque, el preset combina la corrección con LoRAs de velocidad y reduce el coste por imagen manteniendo la imagen cerca del SFT.
- **Prototipado a 4-8 pasos con los presets Turbo**: útil en fase de ideación o para previsualizaciones en local; el autor recomienda mantenerse cerca de 1 MP (por ejemplo, 1024×1024) porque a tamaños mayores aparece tiling.
- **Migración de un pipeline existente sin reentrenar**: cualquier flujo que ya use `moss_image_sft_bf16.safetensors` de Comfy-Org puede insertar un `LoraLoaderModelOnly` después del modelo SFT y obtener la corrección sin tocar el resto del grafo.
- **Despliegue ligero en máquinas modestas**: la variante int8 de 5,4 GB con el preset Fast fusionado evita cargar el modelo base en bf16 más los LoRA, y no exige nodos personalizados, lo que simplifica instalaciones de un solo clic.
- **Escenas cinematográficas con texto y multitudes a 1280×720**: el ejemplo de calle con neón, vapor y reflejos se usa para verificar que ni el parche ni los LoRA de velocidad rompen el renderizado de texto ni la composición.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, ni aplican a un modelo de difusión de imagen.

El autor define dos métricas propias, medidas a 768×1024 con semilla 11 sobre cinco prompts de prueba:

- **Banding**: mide la franja a la anchura exacta a la que la dibuja el SFT, relativa a patrones cercanos. Aproximadamente 1,0 significa ausencia de franja.
- **Similitud con SFT**: cuantifica cuánto se aleja la imagen corregida de la que habría producido el SFT sin parche.

La tabla numérica de resultados está truncada en la información proporcionada (el texto se corta en la definición de la métrica de banding), por lo que no se pueden reproducir los valores por preset ni por prompt. Los presets documentados son: Quality (25 pasos), Quality+ (ambos parches), Balanced (14 pasos), Fast y Fast alt (10 pasos) y Turbo (4-8 pasos).

## Requisitos de hardware

- **VRAM estimada (variante int8 fusionada)**: 5,4 GB solo de pesos; sumando text encoder, VAE y activaciones, el consumo total razonable se sitúa en el entorno de 8-12 GB según resolución y batch (estimación propia, no publicada por el autor).
- **VRAM estimada (modelo base bf16 + LoRA)**: depende del tamaño del modelo base, no disponible en la información; en bf16 el peso de los parámetros es aproximadamente el doble que en int8, más el archivo LoRA, cuyo tamaño individual tampoco se detalla.
- **GPU de consumo**: la variante int8 es la opción para tarjetas de 8-12 GB (RTX 3060 12 GB, RTX 4070). Para bf16 y resoluciones de 1536 px o superiores conviene 24 GB o más (RTX 3090/4090). GPU de datacenter (A100, H100) no se documentan, pero no son necesarias para inferencia en ComfyUI.
- **Despliegue**: ComfyUI es el entorno de referencia (`diffusion-single-file`, `LoraLoaderModelOnly`, workflows JSON incluidos). vLLM, llama.cpp, Ollama y TGI no aplican a este tipo de modelo.
- **Latencia y throughput**: no hay cifras publicadas. La única información disponible es que Quality usa 25 pasos, Balanced 14, Fast 10 y Turbo 4-8, con lo que el coste por imagen escala aproximadamente con el número de pasos.
- **Restricción de resolución en Turbo**: mantener cerca de 1 MP; por encima, la generación hace tiling.

## Comparativa con modelos similares

No se dispone de información sobre otros adaptadores de corrección de banding comparables en la documentación proporcionada. La comparación posible es interna, entre las variantes del propio proyecto:

| Variante | Tipo | Formato | Pasos | Corrección de banding | Requisitos |
|---|---|---|---|---|---|
| OpenMOSS-Team/MOSS-Image-SFT | Modelo base | bf16 | 25 o más | No (presenta franjas verticales) | ComfyUI |
| MATLOWAI/MOSS-Image-SFT-DeBand | 2 LoRA aditivos | safetensors bf16 | 25, 14 o 10 según preset | Sí; completa solo con Quality+ en casos difíciles | ComfyUI, sin nodos extra (salvo Turbo) |
| MATLOWAI/MOSS-Image-SFT-DeBand-int8 | Modelo fusionado | int8, 5,4 GB | Preset Fast incluido | Sí (parche y Fast fusionados) | ComfyUI, sin LoRAs ni nodos |
| LoRAs de velocidad de la comunidad | LoRA | safetensors | 10-14 o 4-8 | No (solo aceleran) | Turbo requiere dos nodos personalizados |

Frente a alternativas de otros ecosistemas (por ejemplo, modelos de difusión de propósito general), la comparación no está disponible en la información consultada.

## Limitaciones y advertencias

- La corrección no es universal: según el autor, en el caso más difícil (cielo de fiordo) solo el preset Quality+, con ambos parches, limpia el cielo por completo.
- El banding reaparece en imágenes anchas, de 1536 px en adelante, y en superficies lisas extremas; puede ser necesario añadir el segundo LoRA.
- Los presets Turbo degradan la resolución: por encima de ~1 MP se produce tiling, con repetición de patrones.
- Los presets Turbo exigen dos nodos personalizados, lo que añade fricción de instalación y dependencias frente al resto de presets.
- El adaptador está atado al modelo base exacto OpenMOSS-Team/MOSS-Image-SFT; no es transferible a otros modelos de difusión ni a variantes futuras del base sin recalcular la diferencia de pesos.
- No es un modelo autónomo: requiere el base, su text encoder y su VAE; no incluye pesos completos en bf16 (la variante int8 sí es autónoma).
- Las métricas presentadas (banding score y similitud con SFT) son definidas por el autor, sin validación independiente ni comparación con benchmarks estándar.
- El repositorio ocupa 13,7 GB, lo que implica descargas considerables si se quieren todas las variantes.
- En generación de imágenes, el fallo típico no es la alucinación textual sino artefactos visuales: texto mal renderizado, anatomía incorrecta o composiciones que ignoran partes del prompt; los ejemplos del autor no constituyen una garantía sistemática.
- No se documentan los idiomas soportados por el text encoder ni sesgos del modelo base.
- La licencia del repositorio es Apache 2.0, pero conviene verificar por separado la licencia y condiciones del modelo base OpenMOSS-Team/MOSS-Image-SFT antes de un uso comercial.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/MATLOWAI/MOSS-Image-SFT-DeBand
- Variante fusionada int8: https://huggingface.co/MATLOWAI/MOSS-Image-SFT-DeBand-int8
- Modelo base: https://huggingface.co/OpenMOSS-Team/MOSS-Image-SFT
- Pesos del base para ComfyUI: https://huggingface.co/Comfy-Org/MOSS-Image
- Parche principal (capas 37-41): https://huggingface.co/MATLOWAI/MOSS-Image-SFT-DeBand/resolve/main/moss_image_sft_banding_fix_L37-41_bf16.safetensors
- Parche extra (capas 32-36): https://huggingface.co/MATLOWAI/MOSS-Image-SFT-DeBand/resolve/main/moss_image_sft_banding_fix_L32-36_extra_bf16.safetensors
- Workflows de presets: https://huggingface.co/MATLOWAI/MOSS-Image-SFT-DeBand/blob/main/workflows/moss_banding_fix_presets.json
- Workflows de presets Turbo: https://huggingface.co/MATLOWAI/MOSS-Image-SFT-DeBand/blob/main/workflows/moss_banding_fix_presets_rapid_moss.json
- Análisis técnico del método: https://huggingface.co/MATLOWAI/MOSS-Image-SFT-DeBand/blob/main/ANALYSIS.md

La búsqueda web realizada no devolvió resultados relevantes sobre este modelo; los enlaces anteriores proceden de la model card y de los metadatos de HuggingFace.
