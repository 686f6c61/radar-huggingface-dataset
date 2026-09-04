# inclusionAI/LLaDA-Image-FP8

# LLaDA-Image-FP8

## Resumen

LLaDA-Image-FP8 es la version cuantizada en FP8 del modelo LLaDA-Image, un generador y editor de imagenes de difusion unificado de 6,54 mil millones de parametros desarrollado por inclusionAI. El modelo permite generar imagenes fotorrealistas a partir de texto y editar imagenes existentes siguiendo instrucciones, sin necesidad de un backbone de edicion separado. Soporta generacion text-to-image, edicion con imagen de referencia y renderizado de texto en ingles y chino.

La familia LLaDA-Image incluye dos variantes: el modelo Base de 50 pasos, al que pertenece este checkpoint FP8, y el modelo Turbo destilado de 4 pasos. Ambos se presentan como un marco unificado donde el backbone y el DiT (Diffusion Transformer) son modelos de difusion. LLaDA-Image ha obtenido resultados destacados en Qwen-Image-Bench, con puntuaciones de 53,53 en ingles y 53,38 en chino.

Este checkpoint concreto es la version FP8 del modelo Base, con 6.540.618.816 parametros y un tamano de repositorio de 27,6 GB. La licencia no se ha especificado en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusion unificado con backbone y DiT (Diffusion Transformer) |
| Parametros totales | 6.540.618.816 (6,54 mil millones) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | FP8 (este checkpoint); el modelo Base tambien tiene version BF16 |
| Idiomas soportados | Ingles y chino (en, zh) |
| Licencia | No disponible |
| Formato de pesos | safetensors (con Diffusers) |

## Arquitectura y entrenamiento

LLaDA-Image es una familia de modelos de difusion unificados de 6B parametros. La arquitectura combina un backbone y un DiT (Diffusion Transformer), ambos entrenados como modelos de difusion dentro de un marco unificado. El proceso de entrenamiento sigue un enfoque en fases: primero un pre-entrenamiento solo con imagenes para aprender un prior visual, seguido de un mid-training, y despues la introduccion de supervisión con lenguaje y el entrenamiento conjunto de generacion y edicion.

No se han publicado en la informacion disponible datos sobre el numero de tokens, la composicion del dataset ni el uso de RLHF/DPO. La variante Turbo emplea destilacion Twin-DMD para reducir los pasos de muestreo de 50 a 2-4, aunque este repositorio corresponde al modelo Base de 50 pasos.

## Capacidades

- Generacion de imagenes text-to-image de alta fidelidad, con detalles visuales ricos, iluminacion natural y composiciones coherentes.
- Edicion de imagenes guiada por instrucciones, preservando fielmente el contenido de la imagen de referencia.
- Generacion condicionada por VQ (VQ-conditioned generation).
- Edicion con imagen de referencia (reference-image editing).
- Renderizado de texto en ingles y chino, util para carteles y diseno grafico.
- Soporte multilingue limitado a ingles y chino.
- No ofrece capacidades de tool calling, agentes ni razonamiento de lenguaje; es exclusivamente un modelo de generacion y edicion de imagenes.

## Casos de uso

- Publicidad y marketing: generar imagenes fotorrealistas para campanas a partir de prompts en ingles o chino. La alta fidelidad y la coherencia de las composiciones lo hacen adecuado para material promocional.
- Edicion de imagenes de producto: acepta una imagen de referencia y una instruccion para modificar elementos como fondo, iluminacion o color, manteniendo el producto intacto. Esto agiliza el retoque en catalogos de e-commerce.
- Diseno de carteles y posteres: gracias al renderizado de texto en ingles y chino, permite crear material grafico con tipografia integrada, algo poco comun en modelos de difusion.
- Retoque fotografico: la edicion guiada por instrucciones permite transformar estilos o escenas en fotografias existentes preservando el contenido original.
- Contenido para redes sociales: se pueden generar multiples variaciones de una imagen base. El modelo Base ofrece mayor calidad; para produccion rapida se recomienda la variante Turbo.
- Prototipado visual para diseno de interfaces: permite crear mockups de escenas o ilustraciones con texto, util para equipos de diseno que trabajan en ingles o chino.
- Investigacion en modelos de difusion: al ser open source, sirve como referencia para estudiar arquitecturas unificadas de generacion-edicion y tecnicas de destilacion como Twin-DMD.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks comparativos con otros modelos en la informacion disponible. Los unicos datos de rendimiento documentados son los de Qwen-Image-Bench:

| Benchmark | Resultado |
|---|---|
| Qwen-Image-Bench (ingles) | 53,53 |
| Qwen-Image-Bench (chino) | 53,38 |

## Requisitos de hardware

- VRAM estimada: no disponible en la informacion. El repositorio ocupa 27,6 GB en disco.
- GPU recomendada: no disponible.
- Capacidad en GPU de consumo: no disponible.
- Opciones de despliegue: mediante Diffusers con la pipeline LLaDAImagePipeline, siguiendo el codigo de inferencia del repositorio GitHub. No se documentan vLLM, llama.cpp ni otras alternativas.
- Latencia y throughput: no disponible. El modelo Base requiere 50 pasos de muestreo; para generacion rapida se recomienda la variante Turbo.

## Comparativa con modelos similares

| Modelo | Parametros totales | Pasos de muestreo | Uso | Licencia |
|---|---|---|---|---|
| LLaDA-Image (Base, este repo) | 6.540.618.816 | 50 | Alta fidelidad | No disponible |
| LLaDA-Image-Turbo | No disponible | 4 | Generacion y edicion rapidas | No disponible |

Nota: no se dispone de benchmarks comparativos con otros modelos externos en la informacion proporcionada.

## Limitaciones y advertencias

- La licencia del modelo no esta disponible, por lo que el uso comercial no puede confirmarse.
- El modelo esta optimizado para ingles y chino; el rendimiento con otros idiomas es desconocido.
- No se han documentado sesgos conocidos ni evaluaciones de seguridad en la informacion proporcionada.
- Como cualquier modelo de difusion, puede generar contenido no deseado o incoherente con la instruccion; no se han publicado evaluaciones de alucinacion.
- El checkpoint Base requiere 50 pasos de muestreo, lo que implica latencias elevadas en comparacion con la variante Turbo (2-4 pasos).
- El codigo de entrenamiento aun no ha sido publicado; solo se ha liberado el codigo de inferencia y los pesos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/inclusionAI/LLaDA-Image-FP8
- Repositorio GitHub: https://github.com/inclusionAI/LLaDA-Image
- Paper arXiv: https://arxiv.org/pdf/2609.03796
- Checkpoint Base BF16: https://huggingface.co/inclusionAI/LLaDA-Image
- Checkpoint Turbo: https://huggingface.co/inclusionAI/LLaDA-Image-Turbo
- Checkpoint Turbo FP8: https://huggingface.co/inclusionAI/LLaDA-Image-Turbo-FP8
