# Jinstudio/JoyAI-Image-Edit

## Resumen

JoyAI-Image-Edit es un modelo fundacional multimodal especializado en edicion de imagenes guiada por instrucciones, desarrollado por el equipo JoyAI (Jinstudio / jd-opensource). Su propuesta central es el denominado "razonamiento espacial": el modelo no se limita a aplicar un filtro o un estilo, sino que interpreta la escena, localiza relaciones entre objetos y descompone la instruccion para aplicar modificaciones precisas sobre regiones concretas de la imagen.

El modelo se publica con licencia Apache 2.0, pesos en formato safetensors y un repositorio de 50,6 GB, lo que sugiere un checkpoint de gran tamano (coherente con un pipeline difusion + codificador de texto). Soporta instrucciones en ingles y chino, y su pipeline declarado en HuggingFace es `image-to-image`, aunque la model card tambien menciona generacion texto-a-imagen (T2I) como modo alternativo al omitir la imagen de entrada.

Es relevante ahora porque aborda una de las carencias clasicas de los editores de imagen por instruccion: la consistencia geometrica y la capacidad de manipular la orientacion de objetos y la camara sin alterar la identidad del objeto ni la escena. Incluye plantillas de prompt explicitas para mover objetos, rotarlos a vistas canonicas y controlar la camara (yaw/pitch/zoom), lo que lo hace atractivo para flujos de trabajo de edicion 3D-consistente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Multimodal de difusion con codificador de texto (pipeline `image-to-image`); detalles internos no disponibles |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se declara MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors, sin variantes GGUF declaradas) |
| Idiomas soportados | ingles (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La informacion disponible describe JoyAI-Image-Edit como un "modelo fundacional multimodal" orientado a edicion guiada por instrucciones, con un pipeline de difusion condicionada por texto e imagen de entrada. La model card no detalla el numero de parametros, la composicion del dataset de entrenamiento ni el numero de tokens o pares imagen-edicion utilizados. Se menciona de forma explicita que el modelo se apoya en "comprension espacial" (scene parsing, relational grounding, instruction decomposition) para aplicar cambios en regiones especificas, lo que implica un componente de entendimiento de escena ademas del generador.

En el plano practico, la implementacion depende de PyTorch >= 2.8, Transformers >= 4.57.0 y < 4.58.0, Diffusers >= 0.34.0 y Flash Attention >= 2.8.0. El script de inferencia expone parametros de difusion clasicos (50 pasos por defecto, guidance scale 4.0, basesize configurable entre 256 y 1024) y soporta sharding FSDP multi-GPU mediante `--hsdp-shard-dim`. No se documentan innovaciones como decodificacion especulativa ni atencion lineal; el unico mecanismo destacable documentado es la reescritura de prompt opcional mediante LLM (`--rewrite-prompt`).

## Capacidades

- Edicion de imagen guiada por instrucciones en lenguaje natural, con aplicacion localizada sobre regiones concretas.
- Comprension espacial de la escena: parsing de objetos, relaciones entre ellos y descomposicion de instrucciones complejas.
- Movimiento de objetos a una region destino marcada con una caja roja, con eliminacion de la guia en el resultado final.
- Rotacion de objetos a vistas canonicas: front, right, left, rear, front right, front left, rear right, rear left.
- Control de camara independiente del contenido: rotacion por yaw y pitch en grados y zoom (in, out, unchanged), preservando la escena 3D estatica.
- Generacion texto-a-imagen (T2I) al omitir la imagen de entrada.
- Soporte bilingue de instrucciones: ingles y chino.
- Reescritura de prompt opcional mediante LLM para mejorar la instruccion antes de la difusion.
- No se documenta soporte de tool calling, function calling ni comportamiento agentico.

## Casos de uso

- Edicion de producto en e-commerce: rotar un articulo a una vista canonica (por ejemplo, "rear left side view") para generar el conjunto de imagenes de ficha de producto sin volver a fotografiar, manteniendo identidad y fondo consistentes.
- Composicion publicitaria: mover un objeto a una zona concreta del lienzo marcada con caja roja para recolocar elementos en una maqueta y obtener el resultado limpio sin la guia.
- Previsualizacion de escenas 3D: modificar solo el punto de vista con yaw/pitch y zoom para explorar angulos de una escena estatica antes de un render definitivo.
- Retoque fotografico asistido: aplicar instrucciones puntuales ("Turn the plate blue") sobre regiones especificas en flujos de postproduccion, con control de semilla para reproducibilidad.
- Generacion de variantes de imagen base: usar el modo T2I para crear una imagen inicial y despues iterar con ediciones guiadas por instruccion sobre la misma.
- Localizacion de contenido para mercados en y zh: redactar la instruccion en ingles o chino segun el equipo y el pipeline de contenido.
- Investigacion en edicion espacial: banco de pruebas para estudiar consistencia geometrica y control de camara en modelos de edicion por instruccion, con pesos abiertos y licencia permisiva.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; el repositorio de 50,6 GB en safetensors sugiere que el checkpoint completo no cabe en GPUs de consumo de 24 GB sin tecnicas de offload o cuantizacion no documentadas.
- GPU recomendadas: no especificadas por el autor; por el tamano del checkpoint y la dependencia de Flash Attention, se orienta a GPUs de datacenter (A100, H100) o a configuraciones multi-GPU.
- Cabe en GPU de consumo: no confirmado; requiere CUDA y, presumiblemente, cuantizacion u offload no documentados para GPUs de 24 GB o menos.
- Despliegue: script oficial `inference.py` sobre PyTorch + Diffusers + Transformers + Flash Attention; soporte multi-GPU mediante FSDP (`--hsdp-shard-dim`). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplican a un modelo de difusion de este tipo).
- Latencia y throughput: no disponibles; la configuracion por defecto son 50 pasos de denoising y guidance scale 4.0, parametros que influyen directamente en el coste de inferencia.

## Comparativa con modelos similares

No se dispone en la informacion proporcionada de datos de parametros, contexto ni benchmarks de modelos comparables, por lo que la comparacion cuantitativa no esta disponible. Cualitativamente, JoyAI-Image-Edit se posiciona frente a otros editores de imagen por instruccion por su enfasis explicito en control espacial (movimiento, rotacion y camara) y por su licencia Apache 2.0, pero sin cifras publicadas no es posible establecer una comparacion rigurosa de rendimiento.

## Limitaciones y advertencias

- No se publican parametros, datos de entrenamiento ni benchmarks; la evaluacion de calidad queda enteramente en manos del usuario.
- El comportamiento espacial mas estable depende de seguir plantillas de prompt muy concretas (caja roja para movimiento, vistas canonicas para rotacion, formato exacto para camara); desviarse de ellas puede degradar el resultado.
- Soporte de idiomas limitado a ingles y chino; no se declara castellano.
- Riesgo de alucinacion visual y de deriva de identidad en ediciones complejas o con multiples objetos; no hay metricas publicadas de fidelidad.
- Sesgos no documentados: no se detalla la composicion del dataset ni sesgos conocidos.
- El checkpoint de 50,6 GB impone requisitos de hardware elevados y no se ofrecen variantes cuantizadas oficiales.
- Aunque la licencia es Apache 2.0 y permite uso comercial, conviene revisar el aviso de licencia del repositorio y las dependencias (Flash Attention, Diffusers) antes de desplegar en produccion.
- El numero de descargas (40) y likes (0) indica una adopcion muy temprana; la madurez del ecosistema y el soporte de la comunidad son limitados.

## Enlaces

- HuggingFace: https://huggingface.co/Jinstudio/JoyAI-Image-Edit
- Checkpoint alternativo (jdopensource): https://huggingface.co/jdopensource/JoyAI-Image-Edit
- Paper (arXiv): https://arxiv.org/abs/2605.04128
- Repositorio GitHub: https://github.com/jd-opensource/JoyAI-Image
- ModelScope: https://modelscope.cn/models/jd-opensource/JoyAI-Image-Edit
- Demo (HuggingFace Spaces): https://huggingface.co/spaces/stevengrove/JoyAI-Image-Edit-Space
