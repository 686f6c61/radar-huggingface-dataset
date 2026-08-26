# data-archetype/canter

## Resumen

Canter es un modelo de texto a imagen de 2 000 millones de parametros, desarrollado por el equipo independiente data-archetype, especializado en fotografia y escenas naturales. Es un modelo de codigo abierto entrenado en una sola GPU, lo que lo convierte en un ejemplo notable de la nueva ola de modelos "indie" que buscan democratizar la generacion de imagenes sin depender de infraestructuras masivas. Utiliza una arquitectura de flow-matching, con un codificador de texto basado en SmolLM2-360M y un VAE externo denominado DINAC-AE-D2 para la decodificacion de imagenes.

El modelo se encuentra en fase de vista previa, con el checkpoint v0002 disponible, y su calidad de generacion es todavia variable. Su principal valor es la eficiencia: requiere solo 8 GB de VRAM para generar imagenes de 1024 por 1024 píxeles, y su foco en fotografia lo diferencia de modelos de proposito general. La licencia MG-BY-SA-2.0 permite uso comercial con atribucion y comparticion bajo la misma licencia, lo que lo convierte en una opcion interesante para proyectos que buscan un modelo ligero y fotografiable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Flow-matching (denoiser) con VAE DINAC-AE-D2 |
| Parametros totales | 2 061 680 768 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | bfloat16 (mayoria de pesos), float32 (parametros sensibles) |
| Idiomas soportados | No disponible |
| Licencia | MG-BY-SA-2.0 (atribucion y compartir igual) |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

Canter se basa en un esquema de flow-matching para la generacion de imagenes, donde un denoiser transforma ruido en imagen condicionado por un prompt de texto. El texto se procesa mediante un tokenizador y el modelo de lenguaje SmolLM2-360M, cuyos pesos se incluyen en el repositorio. La decodificacion de la imagen latente a píxeles se realiza con un VAE propio denominado DINAC-AE-D2, que se descarga automaticamente desde Hugging Face.

El entrenamiento se ha realizado en una sola GPU, un dato relevante que explica tanto las limitaciones como la filosofia del proyecto. No se especifica el numero de tokens de entrenamiento ni la composicion exacta del dataset, pero se indica que el modelo se ha entrenado casi exclusivamente con fotografias, con una presencia muy limitada de arte clasico. No se menciona el uso de RLHF ni DPO. El modelo incluye un sistema de guiado por texto (PDG) y soporta modos de guiado como CFG, ademas de un proyector de previews a escala 1/8 para visualizacion asincrona durante el muestreo.

## Capacidades

- Generacion de imagenes fotorrealistas de escenas naturales, personas, objetos y lugares.
- Soporte de guiado por texto con CFG y modos de PDG (contrastive-text PDG).
- Generacion de imagenes a resoluciones variables, con configuracion por defecto de 1216 por 832 píxeles.
- Previsualizacion asincrona en la interfaz Gradio mediante un proyector latente-RGB a escala 1/8.
- Almacenamiento de metadatos en los PNG generados (prompt, configuracion, version del codigo).
- Integracion con ComfyUI mediante nodos personalizados.
- Interfaz Gradio para uso interactivo.
- API Python para integracion en pipelines propias.

## Casos de uso

- **Generacion de imagenes para stock de fotografia**: el modelo puede producir imagenes de escenas naturales y objetos con estilo fotorrealista, adecuadas para bancos de imagenes, aunque la calidad es variable y requiere seleccion manual.
- **Creacion de contenido para blogs y redes sociales**: permite generar ilustraciones fotograficas para articulos, portadas o publicaciones, sin depender de bancos de imagenes de pago.
- **Prototipado de conceptos de diseno**: en fotografia publicitaria o de producto, puede servir para generar bocetos visuales rapidos de ideas antes de una sesion real.
- **Investigacion en generacion de imagenes**: al ser un modelo abierto con arquitectura de flow-matching, es util para experimentar con tecnicas de entrenamiento eficiente en una sola GPU.
- **Desarrollo de aplicaciones de fotografia**: puede integrarse en herramientas que requieran generar imagenes fotorrealistas, como aplicaciones de edicion o realidad aumentada.
- **Educacion y aprendizaje**: permite estudiar el funcionamiento de modelos de difusion y flow-matching con un modelo de tamano moderado y con codigo abierto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo se encuentra en fase de preview y no se proporcionan comparaciones cuantitativas con otros modelos.

## Requisitos de hardware

- **VRAM minima**: 8 GB para generacion de 1024 por 1024 píxeles con el formato bfloat16 por defecto.
- **GPU recomendada**: NVIDIA con soporte de CUDA y bfloat16 (por ejemplo, RTX 3060, RTX 4060, RTX 4090, A100, H100).
- **Sistema operativo**: Linux o Windows.
- **Python**: 3.10 a 3.13, con PyTorch 2.13 (>=2.13,<2.14) y compilacion CUDA.
- **Opciones de despliegue**: interfaz Gradio incluida, API Python, integracion con ComfyUI.
- **Latencia y throughput**: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Canter | 2 000 millones | No disponible | MG-BY-SA-2.0 | Peso en Hugging Face |
| Stable Diffusion 1.5 | 860 millones | No disponible | CreativeML Open RAIL-M | Peso en Hugging Face |
| SDXL | 3 500 millones | No disponible | CreativeML Open RAIL-M | Peso en Hugging Face |
| FLUX.1-schnell | 12 000 millones | No disponible | Apache 2.0 | Peso en Hugging Face |

La comparativa es orientativa, ya que los modelos de generacion de imagen no suelen publicar especificaciones de contexto. Canter se posiciona como un modelo de tamano medio, con licencia permisiva pero con la restriccion de compartir igual, y con un foco especifico en fotografia, frente a modelos mas generalistas como SDXL o FLUX.

## Limitaciones y advertencias

- El modelo es una **preview en entrenamiento**: los checkpoints y el comportamiento pueden cambiar, y la calidad de generacion es todavia variable.
- **Conocimiento limitado**: al ser un modelo de 2B, tiene menos conocimiento que modelos mas grandes, y puede fallar en conceptos poco comunes o dominios especializados.
- **Texto poco fiable**: la generacion de texto dentro de las imagenes esta subentrenada y no es fiable.
- **Sesgo fotografico**: entrenado casi exclusivamente con fotografias, el modelo produce resultados debiles o inconsistentes para estilos artisticos o ilustraciones.
- **Licencia MG-BY-SA-2.0**: el uso comercial esta permitido, pero requiere atribucion y la comparticion de obras derivadas bajo la misma licencia.
- **Sin garantias**: el autor declara que el modelo y sus resultados no tienen garantias de exactitud, adecuacion o seguridad.
- **Requisitos de hardware**: requiere GPU NVIDIA con bfloat16, lo que excluye tarjetas mas antiguas o integradas.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/data-archetype/canter)
- [Repositorio del modelo (main)](https://huggingface.co/data-archetype/canter/tree/main)
- [ComfyUI-Canter (nodos personalizados)](https://github.com/JTriggerFish/ComfyUI-Canter)
- [VAE DINAC-AE-D2](https://huggingface.co/data-archetype/dinac_ae_d2)
- [SmolLM2-360M (codificador de texto)](https://huggingface.co/HuggingFaceTB/SmolLM2-360M)
- [Licencia MG-BY-SA-2.0](https://ids.nus.edu.sg/docs/modelgo/v2/MG-BY-SA/LICENSE)
