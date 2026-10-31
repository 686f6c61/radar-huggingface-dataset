# paralaif/Krea2-Manga-Alpha-Image-LoRA

## Resumen

Krea2 Manga Alpha Image LoRA es un adaptador LoRA (rank 32) creado por el usuario paralaif para el modelo de generación de imágenes Krea 2 (en su variante Turbo), cuyo base model es krea/Krea-2-Raw. Su función es muy concreta: permitir generar directamente imágenes PNG con canal alfa real (RGBA, fondo transparente) en solo 8 pasos de inferencia, sin necesidad de chroma key, modelos de eliminación de fondo ni máscaras manuales, y sin los típicos halos de color en los bordes.

El truco técnico reside en que Krea 2 comparte el espacio latente de Wan 2.1, y el proyecto Wan-Alpha extiende ese espacio con un canal de transparencia: el VAE de Wan-Alpha fusiona la imagen y su matte de alfa en un latente de 16 canales, que dos decodificadores leen por separado como color y como alfa. El LoRA enseña a Krea 2 a generar ese latente fusionado directamente, sin modificar el modelo base en inferencia.

Está orientado a la ilustración en blanco y negro estilo manga (personajes, criaturas, props, efectos de tinta, onomatopeyas, globos de diálogo), aunque también funciona a color. Se distribuye para ComfyUI con un workflow listo para usar y solo requiere nodos nativos. Es relevante porque resuelve un cuello de botella habitual en pipelines de arte para juegos, VTubers y composición editorial: obtener assets recortados de calidad directamente del modelo generativo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango, rank 32) sobre modelo de difusion text-to-image Krea 2 |
| Parametros totales | no disponible (tamano del repo: 1,0 GB) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (el codificador de texto es Qwen3-VL 4B, segun el workflow) |
| Tipos de cuantizacion | el modelo base se usa en fp8 escalado (krea2_turbo_fp8_scaled); el LoRA no especifica cuantizacion |
| Idiomas soportados | no disponible (prompts en ingles segun los ejemplos) |
| Licencia | krea-2-community-license (other) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rank 32 entrenado sobre Krea 2 Turbo (krea/Krea-2-Raw como modelo base). La innovacion clave es el uso del espacio latente extendido de Wan-Alpha: dado que el VAE de Krea 2 es identico al de Wan 2.1, el proyecto Wan-Alpha (version v2) propone un esquema en el que el codificador fusiona la imagen y su matte de alfa en un unico latente de 16 canales, y dos decodificadores independientes reconstruyen por separado el color (RGB) y el alfa. El LoRA entrena a Krea 2 para generar directamente ese latente fusionado, de modo que no hay que modificar el modelo base ni recurrir a postprocesado en inferencia.

Los datos de entrenamiento no estan detallados publicamente, pero la model card indica que los captions seguian el patron `black-and-white manga illustration of <subject>, isolated on a transparent background`, lo que sugiere un dataset de ilustraciones estilo manga con fondos transparentes. No se menciona el numero de imagenes, tokens ni tecnicas de ajuste adicionales (RLHF/DPO no aplican a este tipo de modelo). El pipeline completo en ComfyUI decodifica el latente dos veces (color y alfa) y une ambos con los nodos `ImageToMask`, `InvertMask` y `JoinImageWithAlpha` para producir el PNG RGBA final.

## Capacidades

- Generacion text-to-image de ilustraciones estilo manga en blanco y negro (personajes, criaturas, props, efectos de tinta, onomatopeyas, globos de dialogo).
- Generacion de imagenes con canal alfa real (RGBA) directamente en el muestreo, en 8 pasos con Krea 2 Turbo.
- Funcionamiento tambien con imagenes en color, ademas del estilo blanco y negro.
- Bordes limpios sin halos de color ni necesidad de modelos de eliminacion de fondo.
- Compatibilidad total con ComfyUI usando solo nodos nativos; incluye workflow JSON de ejemplo.
- No soporta tool calling, agentes ni razonamiento multi-paso: es un adaptador de modelo de imagen, no un LLM.
- Capacidades multilingues: no disponibles.

## Casos de uso

- Creacion de assets para videojuegos: generacion de sprites, personajes y props con transparencia lista para integrar en el motor, evitando el paso manual de recorte.
- Composicion editorial y webcomic: produccion de viñetas de manga con elementos aislados (personajes, globos, onomatopeyas) que se pueden componer sobre fondos y layouts arbitrarios.
- Stickers y emotes para plataformas de chat: el canal alfa nativo permite exportar PNG transparentes sin postprocesado.
- Overlays para streaming y VTubers: generacion de efectos de tinta, marcos y elementos decorativos transparentes para superponer en directo.
- Marketing y material grafico: ilustraciones de producto o personaje aisladas listas para colocar sobre fondos de marca en carteles o banners.
- Prototipado rapido de concept art: iteracion en 8 pasos por imagen con Krea 2 Turbo, compositando salidas sobre fondos de color para presentaciones.
- Efectos visuales y motion graphics: los elementos RGBA generados pueden animarse o integrarse en After Effects/Blender sin keying.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al ser un LoRA estetico-funcional para generacion de imagenes, no aplica la tipica evaluacion con MMLU, HumanEval o GSM8K. La model card muestra una galeria de 30 salidas RGBA sin retocar (8 pasos, Krea 2 Turbo) como evidencia cualitativa, pero no metricas cuantitativas (FID, CLIP score, etc.).

## Requisitos de hardware

- VRAM estimada: no disponible explicitamente; el modelo base se distribuye en fp8 escalado (krea2_turbo_fp8_scaled), lo que sugiere que es viable en GPUs de consumo con 16-24 GB de VRAM, pero es una estimacion no confirmada por el autor.
- GPU recomendadas: no disponible; por el formato fp8, una RTX 4090 o equivalente con 24 GB seria una opcion razonable (estimacion no oficial).
- Cabe en GPU de consumo: probablemente si con el checkpoint fp8, aunque no esta confirmado en la documentacion.
- Despliegue: disenado para ComfyUI (libreria declarada: comfyui). Se incluyen el LoRA, dos VAE de Wan-Alpha v2 (RGB y alfa) y un workflow JSON. No se menciona soporte para diffusers, vLLM u otras herramientas.
- Latencia y throughput: no disponibles; el flujo completo usa 8 pasos de muestreo con Krea 2 Turbo, un regimen de pocos pasos orientado a velocidad.

## Comparativa con modelos similares

| Modelo | Tipo | Transparencia nativa | Base | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Krea2 Manga Alpha Image LoRA | LoRA rank 32 sobre Krea 2 Turbo | Si, RGBA directa con VAE Wan-Alpha v2 | Krea 2 (espacio latente Wan 2.1) | krea-2-community-license | HuggingFace, ComfyUI |
| Wan-Alpha (htdong/Wan-Alpha-VAE) | VAE + enfoque de latente con alfa para Wan 2.1 | Si, mediante latente fusionado de 16 canales | Wan 2.1 | no disponible | HuggingFace |
| Solucion clasica (SD/Flux + modelo de recorte tipo RMBG/SAM) | Pipeline de dos etapas | No nativa; requiere postprocesado y suele generar halos | Variable | Variable | Ampliamente disponible |

La ventaja diferencial de este LoRA frente al enfoque clasico es la generacion de alfa en una sola pasada, sin modelos auxiliares de segmentacion.

## Limitaciones y advertencias

- El LoRA esta optimizado para ilustracion en blanco y negro estilo manga; funciona a color, pero ese no es el caso de uso principal y la calidad puede variar.
- Requiere terminar el prompt con `, isolated on a transparent background` para obtener buenos resultados; los prompts que no sigan el patron de entrenamiento pueden degradar la transparencia.
- Necesita los dos VAE de Wan-Alpha v2 (color y alfa) ademas del LoRA; no funciona con el VAE estandar de Krea 2/Wan 2.1.
- El latente fusionado de 16 canales no es un latente Krea plano, por lo que las salidas no son intercambiables con workflows estandar de Krea 2.
- Licencia krea-2-community-license: al ser "other", hay que revisar el PDF de licencia incluido en el repo antes de cualquier uso comercial; pueden aplicar restricciones heredadas de la licencia comunitaria de Krea.
- Sesgos: no documentados; al entrenarse con ilustraciones de manga, heredara los sesgos esteticos y de representacion de ese dominio.
- Riesgo de alucinacion: no aplicable tal cual (modelo de imagen), pero pueden aparecer artefactos en bordes o alfas en sujetos complejos; no hay metricas publicadas que lo cuantifiquen.
- Proyecto muy reciente (creado en octubre de 2026) con 0 descargas y 1 like en el momento de la ficha: falta madurez comunitaria y validacion de terceros.
- Documentacion limitada: no se especifican datos de entrenamiento, VRAM minima ni compatibilidad con versiones concretas de ComfyUI.

## Enlaces

- Ficha en HuggingFace: https://huggingface.co/paralaif/Krea2-Manga-Alpha-Image-LoRA
- Licencia del modelo: https://huggingface.co/paralaif/Krea2-Manga-Alpha-Image-LoRA/blob/main/LICENSE.pdf
- Modelo base: https://huggingface.co/krea/Krea-2-Raw
- Variante Turbo referenciada: https://huggingface.co/krea/Krea-2-Turbo
- Checkpoints de Krea 2 para ComfyUI: https://huggingface.co/Comfy-Org/Krea-2
- VAE Wan-Alpha v2: https://huggingface.co/htdong/Wan-Alpha-VAE
