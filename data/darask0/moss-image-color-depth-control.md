# darask0/MOSS-Image-color-depth-control

## Resumen

MOSS-Image Color-Depth Control es un adaptador de control de la comunidad para MOSS-Image, el modelo de generación texto-a-imagen del equipo OpenMOSS (Fudan University, Shanghai Innovation Institute y MOSI Intelligence). Lo publica el usuario darask0 bajo licencia Apache-2.0 y no está respaldado por OpenMOSS. Su función es añadir dos condiciones espaciales a la generación: un mapa de regiones en color plano (qué objeto va dónde) y un mapa de profundidad en escala de grises con cerca = blanco (forma y orden frontal/trasero). Ambos se inyectan como condición, no como contenido de imagen, de modo que la generación sigue partiendo de ruido puro y el fondo lo describe únicamente el prompt.

La relevancia práctica está en que resuelve un problema concreto del control de layout: el region prompting por sí solo indica *qué* va en cada zona pero la posición y la escala derivan, mientras que el image-to-image desde un render 3D conserva la composición pero arrastra el fondo plano y el color gris del render. Este adaptador mantiene la colocación, la escala y la pose del mapa sin contaminar la imagen final.

Técnicamente no es un modelo autónomo: son pesos BF16 en safetensors con una LoRA de rango 64 sobre las capas lineales de los bloques del transformer, más un `video_embedder` ampliado de 128 a 384 canales de entrada para admitir los latentes de color y profundidad concatenados. Se entrena sobre el transformer de MOSS-Image Base y se usa con MOSS-Image SFT junto al adaptador DMAD de 4 pasos del mismo autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador de control sobre un transformer de difusion (DiT) MOSS-Image: LoRA rango 64 (alpha 64) en las lineales de bloque + `video_embedder` ampliado de `[3072, 128]` a `[3072, 384]` |
| Parametros totales | No disponible para el adaptador (el recuento no se publica). El modelo base MOSS-Image se describe como de ~5B en las fuentes de busqueda |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible. Modelo texto-a-imagen; el autor entrena y evalua a resolucion 1024-class en cinco relaciones de aspecto |
| Tipos de cuantizacion | Pesos publicados en BF16 safetensors. El autor entrena con el transformer base congelado en FP8. No se publican versiones GGUF ni FP8 del adaptador |
| Idiomas soportados | No disponible (no documentado; depende del modelo base) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (BF16), `moss-control.safetensors` recomendado + checkpoints intermedios en 2.500, 5.000 y 7.500 pasos |
| Tamano del repositorio | 1,3 GB |
| Pasos de entrenamiento | 10.000 (checkpoint principal) |
| Dropout de control | Color solo 35%, profundidad solo 35%, ambos 20%, ninguno 10% |
| Preprocesado del control | Latentes del VAE FLUX.2, empaquetado 2x2 y normalizado con batch-norm como el latente de imagen; profundidad replicada a RGB y pixeles escalados a [-1, 1] |

## Arquitectura y entrenamiento

El adaptador se engancha al transformer de MOSS-Image mediante dos mecanismos que se aplican de forma conjunta. El primero es una LoRA de rango 64 y alpha 64 sobre las proyecciones `layers.*.proj.{q,k,v,o,ffn_up_gate,ffn_down}` y sobre los bloques del text embedder. El segundo es la sustitución del `video_embedder` original (`[3072, 128]`) por una versión de `[3072, 384]` que recibe la concatenación de canales de tres latentes de 128 canales: el latente ruidoso habitual, el latente del mapa de color y el latente del mapa de profundidad. Las columnas correspondientes al control se inicializan a cero, de manera que en el paso cero el adaptador es funcionalmente transparente. Un latente a cero significa "sin control" para esa entrada, lo que permite usar solo color, solo profundidad o ambos. La cabeza de salida no se modifica: el modelo sigue prediciendo el objetivo habitual solo para el latente ruidoso.

El entrenamiento parte del transformer de MOSS-Image Base congelado en FP8, con el `video_embedder` ampliado. El conjunto de datos son 10.000 imagenes de Krea 2 Turbo (resolución 1024-class, cinco relaciones de aspecto) con sus captions. Los mapas de color se generaron con Mask2Former Swin-L sobre segmentación panóptica de COCO y los mapas de profundidad con Depth Anything V2 Large (cerca = blanco). La optimización usa AdamW con learning rate 1e-4 y un multiplicador de 10x sobre las columnas de control del `video_embedder`. El ajuste se controla con las fracciones `color_end` y `depth_end`, que anulan cada control tras esa fracción de los pasos de muestreo: 0,5 para entradas sintéticas (maniquíes 3D) y 1,0 para mapas derivados de imágenes reales.

## Capacidades

- Generación texto-a-imagen condicionada por mapa de regiones en color plano: cada color actúa como identificador de una región u objeto.
- Condicionamiento por mapa de profundidad en escala de grises con convención cerca = blanco, que fija forma y orden de oclusión entre elementos.
- Uso independiente o combinado de ambos controles, gracias al entrenamiento con dropout por entrada.
- Compatibilidad con region prompting: una prompt de texto por color del mapa, lo que permite describir por separado cada elemento de la escena.
- Colocación, escala y pose fieles al mapa de control sin heredar el fondo ni la paleta plana del render de origen.
- Integración con el adaptador DMAD de 4 pasos del mismo autor para inferencia rápida.
- Ejecución en la implementación de referencia Hayate (Rust/CUDA), con soporte de JSON de regiones, etiquetas y layouts; también expuesto en Hayate Studio.
- No cubre por sí mismo: tool calling, agentes, razonamiento multi-paso, visión de entrada ni audio. Es un adaptador de control visual, no un modelo conversacional.

## Casos de uso

- **Previsualización de layout desde blockout 3D**: exportar los pases de color y profundidad de una escena bloqueada en Blender o three.js y generar la imagen final respetando exactamente la composición, sin que aparezca el fondo plano del render. El autor incluye dos escenas de ejemplo exportadas de un editor de maniquíes.
- **Posing de personajes con maniquíes**: usar el render de un maniquí para fijar la pose y la profundidad, con `color_end` y `depth_end` en 0,5 para que el control actúe solo en la primera mitad del muestreo y el modelo genere superficies de persona real en lugar de la geometría del muñeco.
- **Composición publicitaria y de producto**: definir con colores planos la posición de cada elemento (producto, texto, fondo) y con profundidad la jerarquía entre primer plano y fondo, manteniendo el control de marca sobre la disposición.
- **Storyboard y previz de cine o videojuegos**: pasar de un layout dibujado a mano o de un blockout a fotogramas coherentes con la puesta en escena, encadenando varias tomas con el mismo mapa de regiones y distintas prompts.
- **Generación por regiones con prompts independientes**: asignar una prompt distinta a cada color del mapa para describir objetos que deben convivir en la escena sin que el modelo mezcle atributos entre ellos.
- **Pipelines de generación por lotes**: con MOSS-Image SFT y el adaptador DMAD de 4 pasos, el autor reporta unos 1,8 s por imagen de 1024² en una RTX PRO 6000, lo que hace viable procesar variaciones masivas de un mismo layout.
- **Sustitución de image-to-image en flujos de diseño**: cuando se necesita conservar la estructura de una referencia pero no su estética (fondos neutros, iluminación de estudio, materiales de arcilla), el adaptador conserva la geometría y deja el acabado al prompt.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente aporta comparativas cualitativas mediante hojas de resultados (control activo todo el recorrido frente a terminarlo en 0,5 o 0,3, y frente al modelo base sin control) y un dato de latencia: aproximadamente 1,8 s por imagen de 1024² en una RTX PRO 6000 usando MOSS-Image SFT con el adaptador DMAD de 4 pasos.

## Requisitos de hardware

- No se publican requisitos oficiales de VRAM. Como referencia, un DiT de ~5B parámetros ocupa del orden de 10 GB en BF16 y unos 5-6 GB en FP8 solo en pesos; a ello hay que sumar el VAE, el codificador de texto y los latentes de control. Estas cifras son una estimación a partir del recuento de parámetros del modelo base, no un dato del autor.
- GPU recomendadas: el único punto de medida publicado es una RTX PRO 6000 (Blackwell, 96 GB) a ~1,8 s por imagen de 1024². No hay datos publicados para A100, H100 ni RTX 4090.
- En GPU de consumo: previsiblemente viable en RTX 4090 (24 GB) en BF16 o FP8 para resolución 1024-class, y ajustado en tarjetas de 12-16 GB según el nivel de cuantización y el codificador de texto empleado. No confirmado por el autor.
- Opciones de despliegue: la implementación de referencia es Hayate (Rust/CUDA), con soporte de `--regions` en JSON y de la configuración `control` con rutas a mapa de color, mapa de profundidad, `strength`, `color_end` y `depth_end`. Hayate Studio expone el adaptador en la pestaña 3D y en los ajustes de imagen. Una publicación de terceros menciona integración en ComfyUI; no hay confirmación del autor en la información disponible.
- Latencia: ~1,8 s por imagen de 1024² en RTX PRO 6000 con el adaptador DMAD de 4 pasos. Throughput agregado no publicado.

## Comparativa con modelos similares

| Modelo | Base | Parámetros | Controles | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MOSS-Image color-depth control (este) | MOSS-Image Base, usado con SFT + DMAD | Adaptador LoRA r64 sobre base de ~5B | Mapa de color + profundidad, con dropout por entrada | Apache-2.0 | Hugging Face, 0 descargas, 12 likes |
| Krea-2-color-depth-control (darask0) | Krea 2 | No disponible | Mismo planteamiento (color + profundidad) sobre el DiT de Krea 2 | No disponible en la informacion | Hugging Face |
| MOSS-Image Base / SFT sin adaptador | OpenMOSS | ~5B | Solo prompt de texto y region prompting; sin control espacial denso | Apache-2.0 | Hugging Face (OpenMOSS-Team) |

La comparación directa con otros adaptadores de control (ControlNet para FLUX o SDXL) no está disponible en la información proporcionada: no hay datos de parámetros, contexto ni rendimiento de esos sistemas en las fuentes consultadas.

## Limitaciones y advertencias

- **No es un modelo autónomo**: requiere MOSS-Image Base para el entrenamiento y MOSS-Image SFT más un adaptador DMAD de 4 pasos para el uso práctico. Los pesos liberados son únicamente el adaptador.
- **Proyecto no oficial**: hecho por un miembro de la comunidad, sin respaldo ni revisión de OpenMOSS. La validación se limita a las hojas de resultados del autor y a 12 likes, con 0 descargas registradas en el momento de la ficha.
- **Sin benchmarks públicos**: no hay métricas cuantitativas de fidelidad al mapa, FID, CLIP score ni comparaciones sistemáticas con otras técnicas de control.
- **Dependencia de region prompts**: con solo una prompt de escena, un mapa con forma de maniquí se dibuja como un maniquí. El propio autor recomienda emparejar cada color con su prompt.
- **Artefacto de superficie con entradas sintéticas**: si el control permanece activo todo el recorrido (`color_end` = `depth_end` = 1,0) sobre renders 3D, la superficie del maniquí se transparenta en el resultado. Hay que terminar el control en 0,5 (o 0,3 para un resultado casi idéntico).
- **Cobertura del entrenamiento limitada al dominio COCO**: los mapas de color provienen de segmentación panóptica de COCO y la profundidad de Depth Anything V2 Large, de modo que categorías y geometrías alejadas de esa distribución pueden degradarse.
- **Caveat de licencia en los datos**: los mapas de profundidad de entrenamiento se generaron con Depth Anything V2 Large, distribuido bajo CC-BY-NC-4.0. Los pesos liberados son solo el adaptador y su licencia es Apache-2.0, pero conviene una revisión legal propia antes de un uso comercial a gran escala.
- **Idiomas no documentados**: no se especifica qué lenguas acepta el codificador de texto ni si el renderizado de texto en imagen funciona en idiomas distintos del inglés.
- **Dependencia de herramienta**: la ruta soportada es Hayate (Rust/CUDA). Fuera de ella, la integración con otros runners no está garantizada ni documentada por el autor.
- **Riesgo de alucinación visual**: como todo modelo de difusión, puede generar elementos plausibles pero incorrectos en las regiones ambiguas o mal delimitadas del mapa de color.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/darask0/MOSS-Image-color-depth-control
- Adaptador predecesor sobre Krea 2: https://huggingface.co/darask0/Krea-2-color-depth-control
- Adaptador DMAD de 4 pasos: https://huggingface.co/darask0/MOSS-Image_4-step_adapter_lora
- Modelo base MOSS-Image Base: https://huggingface.co/OpenMOSS-Team/MOSS-Image-Base
- Modelo base MOSS-Image SFT: https://huggingface.co/OpenMOSS-Team/MOSS-Image-SFT
- Implementación de referencia Hayate: https://github.com/daraskme/hayate
- Artículo sobre la llegada del adaptador a ComfyUI: https://artrealmai.com/article/moss-image-color-depth-control-comfyui
- Análisis de MOSS-Image y control de layout: https://explainx.ai/blog/moss-image-openmoss-5b-open-text-to-image-layout-control-text-rendering-apache-2026
- Resumen y evaluación de MOSS-Image: https://note.com/hirorohi03/n/n085c66f9f7fc
