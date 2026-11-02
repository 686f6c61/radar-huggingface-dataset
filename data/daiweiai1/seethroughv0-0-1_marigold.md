# DAIWEIAI1/seethroughv0.0.1_marigold

## Resumen

See-through Marigold Depth es un modelo de estimacion de profundidad (pseudo-depth) especializado en personajes de anime, desarrollado por el equipo de See-through (shitagaki-lab) y publicado en HuggingFace por el usuario DAIWEIAI1. Se trata de un fine-tuning de Marigold Depth v1.1, el conocido modelo de profundidad monoculo basado en Stable Diffusion 2, adaptado especificamente al dominio de ilustracion anime. Su funcion dentro del pipeline See-through es proporcionar el mapa de profundidad que permite ordenar correctamente las capas descompuestas de un personaje, trabajando en conjunto con el modelo LayerDiff 3D.

El modelo resuelve un problema concreto dentro del flujo de descomposicion de capas de imagenes de personajes: determinar que elementos (pelo, ojos, ropa, accesorios) estan delante y cuales detras, algo que los modelos de profundidad genericos tienden a fallar en ilustraciones estilizadas por la falta de perspectiva fotografica realista. Al estar afinado sobre anime, mejora la coherencia del ordenamiento de capas respecto al Marigold original.

Tecnicamente es un modelo de difusion (UNet) con aproximadamente 1.213 millones de parametros, empaquetado en formato diffusers bajo la clase `MarigoldDepthPipeline`. El repositorio ocupa 3.3 GB. Es relevante para quienes construyen herramientas de manipulacion de ilustraciones (Live2D, rigging, animacion por capas) que necesitan profundidad fiable en arte 2D estilizado, y existe una version cuantizada a 4 bits NF4 para GPUs con poca memoria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusion (UNet) basado en Stable Diffusion 2, adaptado a estimacion de profundidad (Marigold) |
| Parametros totales | 1.213.176.964 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de imagen, no de texto) |
| Tipos de cuantizacion | FP16/BF16 nativo; version 4-bit NF4 disponible en repo aparte |
| Idiomas soportados | no disponible (modelo de vision, sin interfaz de texto) |
| Licencia | openrail++ (Open RAIL++-M), con contribuciones propias bajo Apache-2.0 |
| Formato de pesos | safetensors (libreria diffusers, `MarigoldDepthPipeline`) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Marigold Depth v1.1, que a su vez se construye sobre el UNet de Stable Diffusion 2 y se entrena como modelo de difusion para prediccion de profundidad monoculo, aprovechando el prior visual de un modelo generativo preentrenado. Sobre esa base, este checkpoint es un fine-tuning orientado al dominio anime, realizado por el equipo de See-through para que el mapa de profundidad resultante sea util en la descomposicion de capas de personajes estilizados.

No se dispone en la informacion proporcionada de detalles sobre el volumen de datos de entrenamiento, la composicion del dataset de fine-tuning, ni si se emplearon tecnicas de RLHF, DPO o ajuste supervisado especifico mas alla del propio fine-tuning. La innovacion principal no es arquitectonica sino de dominio: la especializacion en ilustracion anime para producir profundidades coherentes con la estructura de capas de un personaje, integrada en un pipeline junto a LayerDiff 3D para el ordenamiento de capas.

## Capacidades

- Estimacion de profundidad monoculo (pseudo-depth) a partir de una unica imagen.
- Especializacion en personajes de anime e ilustracion 2D estilizada.
- Generacion de mapas de profundidad utilizables para ordenar capas descompuestas de un personaje.
- Integracion en el pipeline See-through junto a LayerDiff 3D para descomposicion y ordenamiento de capas.
- Compatible con la libreria diffusers mediante `MarigoldDepthPipeline`.
- Disponibilidad de variante cuantizada 4-bit NF4 para GPUs con memoria limitada.
- No soporta tool calling, agentes, texto ni razonamiento multi-step: es un modelo puramente de vision/profundidad.

## Casos de uso

- Descomposicion de capas de personajes anime: el modelo genera el mapa de profundidad que permite separar y ordenar correctamente pelo, ojos, ropa y accesorios en un pipeline de manipulacion de ilustraciones.
- Rigging y animacion por capas (estilo Live2D): la profundidad fiable en arte estilizado permite asignar orden de dibujado y parallax a cada capa de un personaje.
- Preparacion de assets para animacion 2.5D: usar el mapa de profundidad para generar efecto de paralaje o desplazamiento entre capas en produccion de video.
- Herramientas de edicion de ilustracion: integrar el modelo en un editor que permita al usuario mover o recolorear partes de un personaje respetando la oclusion correcta entre capas.
- Prototipado de pipelines de vision para arte 2D: servir como componente de profundidad dentro de flujos mas amplios de segmentacion y descomposicion de ilustraciones.
- Investigacion en vision por computador aplicada a arte estilizado: evaluar y comparar el comportamiento de modelos de profundidad genericos frente a fine-tunings de dominio en imagenes no fotograficas.
- Despliegue en GPUs de consumo mediante la variante NF4, para estudios pequenos o artistas individuales que trabajen con memoria limitada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: en FP16/BF16, aproximadamente 2.5-3 GB solo para los pesos (1.213 M de parametros), mas overhead de activaciones y del pipeline de difusion; en la practica se recomienda contar con margen adicional. La variante 4-bit NF4 reduce el peso de los pesos a alrededor de 0.6-0.7 GB.
- GPU recomendadas: cualquier GPU con suficiente VRAM para el pipeline de difusion; GPUs de datacenter (A100, H100) para lotes grandes o alto throughput, y RTX 4090/3090 para uso profesional en estacion de trabajo.
- GPU de consumo: si, cabe en GPUs consumer modernas; la version NF4 esta pensada explicitamente para GPUs con menos memoria.
- Opciones de despliegue: libreria diffusers (`MarigoldDepthPipeline`); no se indica soporte especifico de vLLM, llama.cpp, Ollama o TGI, que estan orientados a modelos de lenguaje.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Dominio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| See-through Marigold Depth (este modelo) | ~1.213 M | Difusion (UNet, profundidad) | Anime / personajes 2D | Open RAIL++-M + Apache-2.0 | HuggingFace (diffusers) |
| Marigold Depth v1.1 (prs-eth) | no disponible en la informacion | Difusion (UNet, profundidad) | Fotografia general | Open RAIL++-M | HuggingFace |
| Stable Diffusion 2 (base de Marigold) | no disponible en la informacion | Difusion (UNet, generacion de imagen) | Generacion de imagen general | CreativeML Open RAIL++-M | HuggingFace |

La comparacion cuantitativa de rendimiento entre estos modelos no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo especializado en anime: su rendimiento fuera de ilustracion estilizada (fotografia, escenas 3D) no esta documentado y probablemente sea inferior al de Marigold original.
- No es un modelo de lenguaje ni de texto: no admite prompts textuales, tool calling ni razonamiento; cualquier expectativa en ese sentido es erronea.
- Riesgo de mapas de profundidad imprecisos en poses complejas, oclusiones ambiguas o ilustraciones con estilos muy alejados del dataset de fine-tuning.
- Licencia Open RAIL++-M: el uso comercial esta permitido, pero se aplican las restricciones de uso del parrafo 5 y del Anexo A de las licencias Open RAIL; si se distribuyen los pesos, derivados o se alojan como servicio, hay que incluir esas restricciones como clausula exigible en los terminos de uso y comunicarlas a los usuarios.
- Las contribuciones propias se liberan bajo Apache-2.0, pero los pesos heredan tambien las licencias de Marigold Depth v1.1 y de Stable Diffusion 2; conviene revisar LICENSE y NOTICE del repositorio antes de produccion.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema de validacion practicamente nulo, por lo que la robustez en produccion no esta contrastada por la comunidad.
- Dependencia de un segundo modelo (LayerDiff 3D) para completar el caso de uso principal de ordenamiento de capas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/DAIWEIAI1/seethroughv0.0.1_marigold
- Version 4-bit NF4: https://huggingface.co/24yearsold/seethroughv0.0.1_marigold_nf4
- Modelo LayerDiff 3D: https://huggingface.co/layerdifforg/seethroughv0.0.2_layerdiff3d
- Repositorio GitHub de See-through: https://github.com/shitagaki-lab/see-through
- Modelo base Marigold Depth v1.1: https://huggingface.co/prs-eth/marigold-depth-v1-1
- Paper (SIGGRAPH 2026): https://doi.org/10.1145/3799902.3811209
