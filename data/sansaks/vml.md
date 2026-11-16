# sansaks/vml

## Resumen

VML (Visual ML) es un modelo de visión por computador en formato ONNX desarrollado por el usuario sansaks, diseñado específicamente para el reconocimiento de activos visuales del videojuego Mobile Legends: Bang Bang (MLBB). Se trata de un ConvNeXt-Tiny destilado a partir de los embeddings de 768 dimensiones de un Vision Teacher basado en `vit_base_patch16_siglip_224`, con una arquitectura multi-cabeza que produce simultáneamente un embedding, una clasificación gruesa de 282 clases y una clasificación fina de 2.794 clases.

El modelo resuelve un problema muy concreto: identificar héroes, skins, objetos, hechizos, emblemas, talentos y elementos de interfaz en capturas de pantalla y retransmisiones de torneos de MLBB, incluso bajo condiciones adversas como degradados oscuros, superposiciones de texto, oclusiones, recortes redondeados, desenfoque gaussiano de OBS o compresión JPEG. Su relevancia radica en que opera 100% offline y está optimizado para despliegue ligero mediante ONNX, lo que lo hace adecuado para herramientas de análisis de partidas, overlays en directo o pipelines de visión en local.

El repositorio ocupa 0,1 GB e incluye los pesos ONNX, una base de datos de embeddings de referencia con 4.677 muestras y ficheros de metadatos y etiquetas. La licencia es MIT, lo que permite uso comercial sin restricciones significativas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ConvNeXt-Tiny multi-cabeza, destilada de `vit_base_patch16_siglip_224` |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, entrada de imagen 224x224) |
| Tipos de cuantizacion | no disponible (se distribuye en ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible (modelo de visión, sin procesamiento de lenguaje) |
| Licencia | MIT |
| Formato de pesos | ONNX (`hero_skin_student.onnx` + `.onnx.data`), embeddings en NPZ, metadatos en JSON |

## Arquitectura y entrenamiento

El modelo es un ConvNeXt-Tiny con tres salidas: un embedding de 768 dimensiones (`embedding` `[B, 768]`), una cabeza de clasificación gruesa (`coarse_logits` `[B, 282]`) y una cabeza de clasificación fina (`fine_logits` `[B, 2794]`). La entrada es un tensor `pixel_values` de forma `[B, 3, 224, 224]`. La innovación principal es la destilación de conocimiento desde un Vision Teacher basado en SigLIP (`vit_base_patch16_siglip_224`), que transfiere representaciones visuales ricas a un modelo mucho más ligero y desplegable en ONNX.

El entrenamiento se realizó sobre 4.677 activos PNG estandarizados que cubren 134 héroes (iconos, retratos, retratos de skins, habilidades), objetos, hechizos de batalla, emblemas, talentos y elementos de UI. Las 282 clases gruesas agrupan categorías como `<Hero>`, `Item`, `Spell`, `Emblem`, `Talent`, `Skill | <Hero>` y `UI`; las 2.794 clases finas desglosan variantes como `<Hero> | skin_XX`, `<Hero> | icon`, `<Hero> | portrait`, `Item | <Name>`, entre otras. No se especifica en la información disponible el número de tokens, la composición exacta del dataset ni si se emplearon técnicas de RLHF o DPO (no aplicables en un modelo de visión de este tipo).

## Capacidades

- Clasificación visual gruesa en 282 clases de activos de MLBB (héroes, objetos, hechizos, emblemas, talentos, habilidades y UI).
- Clasificación visual fina en 2.794 clases que distinguen skins, iconos, retratos y variantes concretas.
- Generación de embeddings de 768 dimensiones para búsqueda por similitud y recuperación en base de datos vectorial.
- Reconocimiento robusto en capturas de retransmisión de torneos con degradados oscuros, superposición de texto IGN, oclusión de hechizos en esquinas, recortes circulares o redondeados, desenfoque gaussiano de OBS y compresión JPEG.
- Funcionamiento 100% offline, sin dependencia de servicios externos.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües (es un modelo puramente visual).
- No dispone de modo thinking, visión generativa, audio ni otras capacidades multimodales más allá de la codificación de imágenes.

## Casos de uso

- Análisis automático de borradores (draft) en directo: el modelo identifica héroes y skins en la pantalla de selección de una retransmisión, permitiendo generar estadísticas de pick/ban en tiempo real con la clasificación fina de 2.794 clases.
- Overlays interactivos para streamers: integrado en un pipeline de captura de pantalla, el modelo reconoce objetos y hechizos en la interfaz y alimenta overlays con información contextual sin conexión a internet.
- Indexación y búsqueda de activos del juego: los embeddings de 768 dimensiones permiten construir un buscador por similitud visual sobre la base de datos de 4.677 referencias, útil para herramientas de catalogación de skins y recursos.
- Extracción de datos de partidas grabadas: procesando fotogramas de vídeos de torneos, el modelo etiqueta héroes y objetos presentes para generar métricas de composición de equipos y popularidad de ítems.
- Herramientas de accesibilidad: reconocimiento de elementos de UI y activos en pantalla para asistentes que describan el estado de la partida a usuarios con discapacidad visual.
- Automatización de QA en parches del juego: al detectar cambios en iconos o retratos de héroes tras una actualización, el modelo puede señalar activos que requieren reindexación en la base de datos de referencia.
- Moderación y verificación de contenido: identificación de imágenes de MLBB en foros o redes para clasificar y filtrar contenido relacionado con el juego.

## Benchmarks y rendimiento

Evaluación sobre 200 muestras sintéticas de retransmisión de torneo (degradado inferior oscuro, superposición de texto IGN, oclusión de hechizos en esquinas, recorte circular/redondeado, desenfoque gaussiano de OBS y compresión JPEG):

| Metrica | Resultado |
|---|---|
| Coarse Top-1 | 99,0% (0,99) |
| Fine (Hero + Skin / Item / Spell) Top-1 | 93,0% (0,93) |
| 768-d DB Retrieval Top-1 | 99,5% (0,995) |
| 768-d DB Retrieval Top-5 | 100,0% (1,0) |

No se han publicado resultados comparativos con otros modelos de reconocimiento de activos de MLBB en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; al tratarse de un ConvNeXt-Tiny en ONNX con entrada de 224x224, la huella es reducida y cabe holgadamente en GPUs de consumo.
- GPU recomendadas: cualquier GPU con soporte ONNX Runtime, incluidas RTX 3060, RTX 4060, RTX 4090, A100 o H100; también es viable en CPU para inferencia por lotes pequeños.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU con al menos 2-4 GB de VRAM, aunque el dato exacto no está documentado.
- Opciones de despliegue: ONNX Runtime (CPU/GPU), TensorRT, OpenVINO; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplicables a un modelo de visión de este tipo).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables de reconocimiento de activos específicos de MLBB en la documentación proporcionada. Como referencia genérica de arquitectura, se puede comparar con el propio Vision Teacher del que se destila:

| Modelo | Arquitectura | Entrada | Salida | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| VML (sansaks) | ConvNeXt-Tiny multi-cabeza | Imagen 224x224 | Embedding 768-d + 282 clases + 2.794 clases | MIT | Hugging Face (ONNX) |
| `vit_base_patch16_siglip_224` (teacher) | ViT base SigLIP | Imagen 224x224 | Embedding 768-d | no disponible en esta ficha | Referencia citada por el autor |

No se conocen alternativas públicas equivalentes para reconocimiento de activos de MLBB con las que establecer una comparación cuantitativa.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente sobre activos de Mobile Legends: Bang Bang; no generaliza a otros videojuegos ni a dominios visuales distintos.
- El rendimiento se ha medido sobre 200 muestras sintéticas de retransmisión; el comportamiento en capturas reales no verificadas puede diferir.
- Riesgo de confusión entre skins visualmente similares o entre iconos y retratos del mismo héroe, especialmente en la clasificación fina (93,0% Top-1).
- Posible degradación ante resoluciones de entrada distintas de 224x224 o ante transformaciones no representadas en el conjunto de estrés (rotaciones severas, recortes agresivos, cambios de relación de aspecto).
- No dispone de capacidades de texto, tool calling ni razonamiento; no debe emplearse fuera de tareas de clasificación y recuperación visual.
- La licencia MIT permite uso comercial, pero el autor no documenta sesgos ni limitaciones éticas específicas.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validación comunitaria independiente del rendimiento declarado.
- No se documentan versiones cuantizadas ni requisitos mínimos de hardware, lo que obliga a validar el despliegue en el entorno objetivo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sansaks/vml
