# 7err4/MOSS-Image-CharRef

## Resumen

MOSS-Image CharRef v2 es un adaptador LoRA de referencia de personaje (character reference) para el modelo de difusión MOSS-Image Base, publicado por el usuario 7err4. Su función es concreta: a partir de una única imagen de referencia, etiquetada como *Picture 1*, y un prompt de escena, el adaptador dibuja al mismo personaje —rostro, peinado, vestuario y estilo artístico— en una escena nueva, sin necesidad de entrenar un LoRA específico por personaje. Es la opción de "imagen de referencia" de la aplicación Fumika del mismo autor.

El adaptador no es un modelo generativo autónomo: se aplica sobre MOSS-Image Base, un text-to-image de arquitectura DiT de 5B parámetros desarrollado por OpenMOSS (Fudan University, Shanghai Innovation Institute y MOSI Intelligence), según las fuentes de terceros consultadas. El LoRA en sí es de rango 32 y se distribuye en safetensors dentro de un repositorio de 0,2 GB, con licencia Apache 2.0.

Su relevancia práctica está en dos puntos: elimina el coste de entrenamiento por personaje en flujos de cómic e ilustración, y opera tanto sobre imágenes sueltas como sobre páginas completas de cómic descritas con los layouts JSON de MOSS (paneles y bocadillos). La versión 2 rebalancea el dataset de la prueba de concepto original (pleiades7/MOSS-Image-CharRef-PoC), cuyos resultados mostraban proporciones infladas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango, rank 32 / alpha 32) sobre MOSS-Image Base, un DiT text-to-image de 5B parámetros |
| Parametros totales | No disponible para el adaptador (el checkpoint de la PoC v1 pesa 145 MB en safetensors); el modelo base tiene 5B parámetros según fuentes de terceros |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (modelo de imagen; no se publica límite de tokens de prompt) |
| Tipos de cuantizacion | No disponible (el LoRA se distribuye en safetensors; la cuantización efectiva depende de cómo cargue el modelo base ComfyUI) |
| Idiomas soportados | No disponible; el prefijo de prompt prescrito está en inglés: `Same character and art style as Picture 1.` |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (LoRA), cargado en ComfyUI mediante el nodo ComfyUI-MOSS-Image-Ostris-Edit; repositorio de 0,2 GB |
| Fecha de publicacion | Creado el 2026-10-22, actualizado el mismo día |
| Descargas / likes | 0 descargas, 19 likes en el momento de la consulta |

## Arquitectura y entrenamiento

El adaptador se entrena sobre MOSS-Image Base en precisión bf16 con ai-toolkit en modo edición (`arch: moss_image`, `edit: true`, `kv_cache: true`), con rango 32 y alpha 32, optimizador AdamW8bit, learning rate 1e-4, batch 1, 1000 pasos y resolución de 1024 px. La inferencia prescrita utiliza latentes de referencia y caché KV, con SkipLayerGuidance aplicado a la capa 22 en modo completo de MOSS, 50 pasos, CFG 3 y sampler euler / sgm_uniform. El prefijo de prompt es obligatorio para activar el comportamiento de referencia.

El dataset consta de aproximadamente 1330 pares referencia → destino: arte de personajes anime y renders sintéticos de personajes anime en múltiples escenas, más renders de personajes adultos conocidos del anime con tipos corporales variados (2 referencias y 8 escenas por personaje). El contenido es seguro o sugerente, sin desnudos. Las etiquetas de entrenamiento combinan el prefijo con tags de vestuario, escena y pose, y nunca nombran la identidad del personaje: la identidad debe provenir de la imagen. La receta parte de la idea de pleiades7/MOSS-Image-CharRef-PoC; la v1 de este LoRA producía proporciones infladas y la v2 reequilibró los datos.

## Capacidades

- Transferencia de identidad de personaje desde una sola imagen de referencia: rostro, peinado, vestuario y estilo artístico.
- Generación del personaje en escenas nuevas a partir de prompts con etiquetas (tags) o frases en lenguaje natural.
- Cambio de vestuario mediante texto: la ropa sigue a la referencia salvo que el prompt nombre otras prendas.
- Generación de páginas de cómic completas usando layouts JSON de MOSS con paneles y bocadillos.
- Mejora de fidelidad mediante palabras de apariencia en el prompt (estilo de pelo, color de ojos, piezas clave del vestuario).
- Integración en ComfyUI (≥ 0.42) como LoRA más nodo de edición con latentes de referencia y caché KV.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto: es un adaptador de imagen.
- Sin capacidades de audio ni de vídeo documentadas.

## Casos de uso

- Producción de webcómic y manga: mantiene la identidad del personaje protagonista viñeta a viñeta y página a página, apoyándose en los layouts JSON de MOSS con paneles y bocadillos, lo que evita reentrenar un LoRA por cada personaje del reparto.
- Storyboard y previsualización de animación: con una hoja de personaje como *Picture 1*, se generan múltiples planos (biblioteca, azotea al atardecer, cocina) con coherencia de diseño y sin trabajo de modelado previo.
- Diseño de vestuario para un personaje existente: al poder cambiar la ropa por texto manteniendo cara y peinado, sirve para explorar variantes de outfit en una biblia de personaje.
- Contenido para redes de personajes originales (OC): un ilustrador puede publicar al mismo personaje en escenas distintas sin entrenar un adaptador dedicado, con un coste de inferencia fijo.
- Prototipado dentro de la app Fumika: es la opción de "imagen de referencia" para usuarios no técnicos, que aportan una foto del personaje y un prompt de escena.
- Validación de pipelines en ComfyUI: útil para probar la combinación de reference latents, caché KV y SkipLayerGuidance en la capa 22 antes de escalar a producción con otros adaptadores.
- Arte conceptual derivado y fan art: permite situar un personaje en escenas nuevas respetando las prohibiciones de la model card (nada de suplantar personas reales sin consentimiento ni material sexual de menores).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo aporta ejemplos cualitativos (personajes Fumika y Terra generados en tres escenas: biblioteca, azotea al atardecer y cocina), a 832×1216, 50 pasos, CFG 3, sgm_uniform y SLG en la capa 22, con una semilla por escena y sin selección de resultados. No hay métricas de similitud de identidad, FID ni evaluaciones comparativas.

## Requisitos de hardware

- El adaptador en sí ocupa unos 145 MB en safetensors (repositorio de 0,2 GB); el coste real lo determina el modelo base MOSS-Image de 5B parámetros.
- Estimación para el modelo base en bf16: alrededor de 10 GB solo en pesos; con latentes de referencia y caché KV activados, el consumo conjunto se sitúa aproximadamente en 12-16 GB para 1024 px (estimación propia, no publicada por el autor).
- GPU de 24 GB (RTX 3090, RTX 4090, L40S, A100 40 GB) para trabajar con holgura en bf16 a 1024 px.
- GPU de 16 GB: viable con offloading parcial o cuantización del modelo base, a costa de latencia.
- GPU de 12 GB: espacio muy ajustado; requiere cuantización agresiva y resolución reducida.
- Despliegue: ComfyUI 0.42 o superior con el nodo ComfyUI-MOSS-Image-Ostris-Edit. vLLM, TGI, llama.cpp y Ollama no aplican por tratarse de un modelo de difusión.
- Latencia y throughput: no disponibles. La configuración de referencia son 50 pasos con CFG 3 y SLG en una capa, lo que implica más de una evaluación del modelo por paso.

## Comparativa con modelos similares

| Modelo | Tipo | Modelo base | Parametros | Licencia | Estado |
|---|---|---|---|---|---|
| 7err4/MOSS-Image-CharRef (v2) | LoRA de referencia de personaje, rank 32 | OpenMOSS-Team/MOSS-Image-Base (DiT 5B) | No disponible (adaptador) | Apache 2.0 | 1000 pasos, ~1330 pares, datos rebalanceados |
| pleiades7/MOSS-Image-CharRef-PoC (v1) | LoRA de referencia de personaje | OpenMOSS-Team/MOSS-Image-Base | No disponible (checkpoint de 145 MB) | No disponible | Prueba de concepto: dataset pequeño, entrenamiento corto, apenas evaluada; proporciones infladas |
| OpenMOSS-Team/MOSS-Image-Base | DiT text-to-image (modelo completo) | No aplica | 5B (fuente de terceros) | No disponible en la informacion | Enfocado a texto dentro de imagen, control de layout y prompts largos; sin referencia de personaje |
| Familia IP-Adapter (SDXL, Flux) | Adaptadores de imagen de referencia | Distintos modelos de difusión | No disponible | No disponible | Alternativa genérica de referencia de imagen, no entrenada específicamente para personajes anime sobre MOSS-Image |

## Limitaciones y advertencias

- Los detalles finos de pelo (un mechón de color, una coleta exacta) pueden desviarse si el prompt no incluye palabras de apariencia.
- Solo admite una referencia por imagen: en escenas con varios personajes únicamente se conserva de forma fiable la identidad de *Picture 1*.
- Hereda las limitaciones de MOSS-Image: texto pequeño y manos.
- Entrenado con arte anime: los estilos fotográfico y 3D sobreviven parcialmente, pero un rostro fotorrealista o 3D no se mantiene con fiabilidad entre escenas (el pelo y el vestuario sí).
- Una referencia recortada de una viñeta arrastra sus objetos (puerta, taza, incluso el bocadillo); conviene recortar hasta el personaje.
- Requiere el prefijo de prompt en inglés y un nodo y versión concretos de ComfyUI, lo que limita la portabilidad a otros runtimes.
- Sin benchmarks ni evaluación independiente: 0 descargas y 19 likes en el momento de la consulta, con actualización el mismo día de la creación.
- Riesgo de alucinación visual y de deriva de identidad inherente a los modelos de difusión; no hay métricas publicadas de fidelidad.
- La licencia Apache 2.0 cubre el adaptador, pero el uso del modelo base queda sujeto a su propia licencia, no detallada en la información disponible.
- Usos prohibidos por la model card: imágenes íntimas o sexualmente explícitas de personas reales identificables sin consentimiento, material de abuso sexual infantil o cualquier representación sexual de menores, construcción o ampliación de bases de reconocimiento facial mediante scraping no dirigido, y manipulación subliminal o engañosa que cause daño. Se citan como prácticas prohibidas por el artículo 5 del Reglamento europeo de IA (en su versión enmendada de 2026).
- Obligación de divulgación: si se publica una imagen que se parece a una persona, lugar o evento real y podría pasar por auténtica (deep fake), debe indicarse que es generada por IA conforme al artículo 50(4).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/7err4/MOSS-Image-CharRef
- Modelo base: https://huggingface.co/OpenMOSS-Team/MOSS-Image-Base
- Nodo de ComfyUI requerido: https://github.com/ostris/ComfyUI-MOSS-Image-Ostris-Edit
- Aplicación Fumika: https://github.com/7err4/fumika
- Prueba de concepto previa (HuggingFace): https://huggingface.co/pleiades7/MOSS-Image-CharRef-PoC
- Prueba de concepto previa (GitHub): https://github.com/TimothyZhang7/MOSS-Image-CharRef-PoC
- Análisis y evaluación de MOSS-Image: https://note.com/hirorohi03/n/n085c66f9f7fc?hl=en
- Ficha de MOSS-Image en Civitai: https://civitai.com/models/3005406/moss-image
