# chibifire/Pixal3D-Comfy

## Resumen

Pixal3D es un modelo de difusion imagen-a-3D desarrollado por Tencent ARC, presentado en SIGGRAPH 2026, que genera modelos tridimensionales de alta fidelidad con texturas PBR completas a partir de una unica imagen. El repositorio chibifire/Pixal3D-Comfy es un reempaquetado del modelo original para su uso directo en ComfyUI, incluyendo los archivos necesarios para el pipeline completo: modelos de difusion, VAE de forma y textura, y un codificador de vision CLIP.

El modelo se distribuye en dos variantes: base y multiview, ambas disponibles en precision bf16 y en cuantizacion int8 con conversion rotatoria. El repositorio tiene un tamano de 36.4 GB. No se dispone de informacion sobre el numero de parametros totales, la arquitectura exacta del transformer, ni la longitud de contexto, ya que se trata de un modelo de generacion de 3D y no de texto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Difusion condicionada por imagen para generacion de modelos 3D, con VAE de forma y textura |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no aplica) |
| Tipos de cuantizacion | bf16, int8_convrot |
| Idiomas soportados | no disponible (no aplica) |
| Licencia | MIT (repositorio) / academic-only (modelo original TencentARC/Pixal3D) |
| Formato de pesos | safetensors (single-file diffusion model) |

## Arquitectura y entrenamiento

El pipeline de Pixal3D combina un modelo de difusion condicionado por imagen, un codificador CLIP vision basado en DINOv3, y dos VAE de Trellis (uno para forma y otro para textura). El modelo genera representaciones latentes de geometria y material que posteriormente se decodifican en mallas y mapas PBR. La variante multiview permite generar multiples vistas consistentes de un objeto, mejorando la calidad de la reconstruccion tridimensional.

No se han publicado detalles sobre el dataset de entrenamiento, el numero de tokens, ni si se aplicaron tecnicas como RLHF o DPO, ya que no es un modelo de lenguaje. La innovacion principal reside en el alineamiento pixel a pixel entre la imagen de entrada y el modelo 3D generado, junto con la incorporacion de cuantizacion int8 con conversion rotatoria para reducir el consumo de memoria sin perdidas significativas de calidad.

## Capacidades

- Generacion de modelos 3D completos a partir de una unica imagen 2D.
- Produccion de texturas PBR (albedo, normal, roughness, metallic) de alta calidad.
- Soporte de generacion multiview para consistencia entre diferentes angulos del objeto.
- Integracion nativa con ComfyUI mediante nodos y archivos reempaquetados.
- Cuantizacion int8 disponible para reducir requerimientos de VRAM.
- No soporta tool calling, generacion de texto, audio ni vision general fuera de la tarea de modelado 3D.

## Casos de uso

- Creacion de activos 3D para videojuegos: a partir de una ilustracion conceptual, el modelo genera una malla con texturas PBR lista para importar en motores como Unity o Unreal, acelerando el proceso de modelado manual.
- Prototipado rapido en diseño industrial: fotografias de productos existentes se convierten en modelos 3D para validar geometria y materiales en entornos CAD o de renderizado.
- Contenido para realidad aumentada: generar modelos 3D ligeros de productos o esculturas a partir de imagenes, integrables en experiencias AR mediante exportacion a formatos compatibles con plataformas moviles.
- Visualizacion arquitectonica: convertir imagenes de fachadas o interiores en modelos 3D aproximados para presentaciones preliminares o estudios de volumentria.
- E-commerce interactivo: transformar fotos de catalogo en modelos 3D para visores web, permitiendo a los clientes rotar y observar el producto desde cualquier angulo.
- Arte y escultura digital: pinturas o dibujos 2D se traducen a esculturas 3D con texturas, sirviendo como base para artistas que trabajan en escultura digital o impresion 3D.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de datos comparativos de rendimiento para tareas de generacion 3D (por ejemplo, metricas de fidelidad geometrica o consistencia multiview) frente a otros modelos de la categoria.

## Requisitos de hardware

- VRAM estimada: el repositorio contiene archivos por un total de 36.4 GB. El modelo en bf16 requiere una GPU con al menos 24 GB de VRAM para la variante base; la variante multiview probablemente supera ese requisito. Con cuantizacion int8, es posible que las variantes entren en GPUs de 16 GB, aunque no se dispone de datos oficiales.
- GPU recomendadas: NVIDIA A100 (40-80 GB), H100, o RTX 4090 (24 GB) para ejecutar el modelo en bf16 sin problemas de memoria.
- Compatibilidad con GPUs de consumo: la variante int8 puede ejecutarse en GPUs como RTX 4070 Ti (12 GB) o superiores, aunque con riesgo de limitaciones de memoria dependiendo del tamano de la imagen de entrada.
- Opciones de despliegue: el modelo esta preparado exclusivamente para ComfyUI. No se ha documentado compatibilidad con vLLM, llama.cpp, Ollama o TGI, al no ser un modelo de lenguaje.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tiempos de generacion.

## Comparativa con modelos similares

No se dispone de datos de benchmarks comparables para presentar una tabla de rendimiento. Se puede situar cualitativamente en la categoria de modelos imagen-a-3D junto a alternativas como Hunyuan3D o TripoSR, pero sin informacion verificable sobre parametros, contexto o resultados. Los datos de licencia y formato de pesos para estas alternativas no estan disponibles en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo original TencentARC/Pixal3D tiene una licencia de uso academico, mientras que el repositorio reempaquetado declara MIT. Es necesario revisar la licencia del modelo base antes de cualquier uso comercial.
- Puede generar geometrias incorrectas o alucinadas en objetos poco representados en su dataset de entrenamiento, especialmente en casos con iluminacion extrema o superficies ambiguas.
- La calidad del modelo 3D depende fuertemente de la resolucion y claridad de la imagen de entrada; imagenes borrosas o con oclusiones producen resultados deficientes.
- No acepta entradas de texto ni condiciones adicionales, por lo que el control sobre el resultado es limitado a la imagen proporcionada.
- El gran tamano de los archivos y los altos requerimientos de VRAM dificultan su uso en equipos con hardware modesto o en despliegues cloud de bajo coste.

## Enlaces

- https://huggingface.co/chibifire/Pixal3D-Comfy
- https://huggingface.co/TencentARC/Pixal3D
- https://github.com/PozzettiAndrea/ComfyUI-Pixal3D
- https://docs.comfy.org/tutorials/3d/pixal3d
