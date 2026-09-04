# inclusionAI/LLaDA-Image

## Resumen

LLaDA-Image es un modelo de generación y edición de imágenes de código abierto desarrollado por inclusionAI. Con 6.540 millones de parámetros, unifica en un único checkpoint la generación text-to-image y la edición guiada por instrucciones, sin necesidad de un backbone de edición separado. El modelo destaca por su recetario de entrenamiento completamente abierto y por alcanzar resultados de referencia en el benchmark Qwen-Image-Bench, con una puntuación global de 53,53 en inglés y 53,38 en chino.

La familia incluye dos variantes: LLaDA-Image (base, 50 pasos de muestreo) y LLaDA-Image-Turbo (destilado, 2-4 pasos mediante Twin-DMD). La arquitectura es un modelo de difusión unificado en el que tanto el backbone como el DiT son modelos de difusión, entrenados en un marco común. Al ser un modelo de imagen, no tiene longitud de contexto en el sentido de los modelos de lenguaje. Los pesos se distribuyen en formato safetensors, con versiones en BF16 y FP8.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusion unificado (backbone + DiT) |
| Parametros totales | 6.540.230.016 (6,54B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de imagen) |
| Tipos de cuantizacion | BF16 (original), FP8 (variante separada) |
| Idiomas soportados | Ingles y chino (renderizado de texto en imagenes) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

LLaDA-Image se basa en un marco de difusion unificado donde tanto el backbone como el DiT son modelos de difusion. El entrenamiento se realiza en tres fases: pre-entrenamiento solo con imagenes para establecer un prior visual, entrenamiento con supervision de lenguaje emparejado y entrenamiento conjunto de generacion y edicion. Esta estrategia permite que un unico checkpoint maneje tanto text-to-image como edicion de referencia con preservacion del contenido.

La variante Turbo emplea destilacion Twin-DMD para reducir el numero de pasos de muestreo de 50 a 2-4, manteniendo una calidad alta. No se han publicado detalles sobre la composicion del dataset ni el numero total de tokens de entrenamiento. El codigo de entrenamiento se publicara proximamente; actualmente solo se ha liberado el codigo de inferencia y los pesos.

## Capacidades

- Generacion de imagenes realistas text-to-image con iluminacion natural, detalles finos y composiciones coherentes.
- Edicion de imagenes guiada por instrucciones, preservando el contenido de referencia y aplicando cambios visuales precisos.
- Generacion condicionada por VQ (vector quantization) para control adicional sobre la salida.
- Renderizado de texto en ingles y chino dentro de las imagenes, apto para carteles y material grafico.
- Soporte de generacion y edicion en un unico checkpoint, sin modulos separados.
- Variante Turbo con generacion rapida en 2-4 pasos de muestreo.
- No soporta tool calling ni capacidades de agente, al ser un modelo puramente visual.

## Casos de uso

- Marketing y publicidad: el modelo puede generar carteles y anuncios con texto renderizado en ingles o chino, lo que permite crear material promocional sin depender de herramientas externas de diseno.
- Edicion de imagenes de producto: a partir de una imagen de referencia, se pueden aplicar instrucciones como "cambia el fondo a blanco" o "modifica el color del envase", util en catalogos y e-commerce.
- Creacion de contenido para redes sociales: genera imagenes realistas y coherentes para publicaciones, historias o banners, con control sobre el estilo visual.
- Diseno de interfaces y mockups: el modelo puede producir imagenes de referencia para aplicaciones, webs o presentaciones, acelerando el proceso de diseno.
- Restauracion y retoque fotografico: la edicion guiada por instrucciones permite modificar elementos de una fotografia existente manteniendo la fidelidad del contenido original.
- Generacion de datasets sinteticos: investigadores pueden crear conjuntos de imagenes etiquetadas para entrenar otros modelos de vision, gracias a la calidad y variedad de las salidas.
- Ilustracion editorial: para blogs, revistas o documentos tecnicos, se pueden generar imagenes ilustrativas que acompañen al texto de forma coherente.

## Benchmarks y rendimiento

La model card reporta resultados en Qwen-Image-Bench, donde LLaDA-Image alcanza el estado del arte en puntuacion global. No se han publicado otros benchmarks en la informacion disponible.

| Benchmark | Puntuacion |
|---|---|
| Qwen-Image-Bench (ingles) | 53,53 |
| Qwen-Image-Bench (chino) | 53,38 |

No se dispone de comparativas directas con otros modelos en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada: en BF16, los pesos del modelo ocupan aproximadamente 13 GB; en FP8, alrededor de 6,5 GB. A esto hay que sumar la memoria de activaciones y el pipeline de difusion.
- GPU recomendadas: A100 o H100 para inferencia con alta velocidad y lotes grandes. Una RTX 4090 (24 GB) puede ejecutar el modelo en BF16 con optimizaciones, y en FP8 con margen adicional.
- Compatibilidad con GPU de consumo: si, con cuantizacion FP8 o usando offloading de capas en GPUs de 16-24 GB.
- Opciones de despliegue: la inferencia se realiza mediante Diffusers con el pipeline LLaDAImagePipeline. No es compatible con vLLM ni llama.cpp al ser un modelo de imagen.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de datos suficientes en la informacion proporcionada para realizar una comparativa directa con modelos similares de la misma categoria (generacion de imagenes de ~6B parametros). El modelo compite en el benchmark Qwen-Image-Bench, pero no se han publicado especificaciones de modelos comparables en las fuentes consultadas.

## Limitaciones y advertencias

- La licencia del modelo no esta especificada en la pagina de HuggingFace, lo que implica un riesgo legal para uso comercial. Es recomendable contactar con los desarrolladores antes de desplegar el modelo en produccion.
- No se han publicado datos sobre sesgos del modelo. Como todo modelo de generacion de imagenes, puede reflejar sesgos presentes en sus datos de entrenamiento.
- Riesgo de alucinacion visual: el modelo puede generar artefactos, detalles incoherentes o modificar elementos no deseados al editar imagenes.
- El renderizado de texto esta limitado a ingles y chino; otros idiomas pueden producir resultados de baja calidad.
- El codigo de entrenamiento aun no se ha publicado, lo que limita la reproducibilidad y el ajuste fino por parte de la comunidad.
- No se ha publicado informacion sobre el dataset de entrenamiento, su tamano ni su composicion, lo que dificulta evaluar la robustez del modelo.

## Enlaces

- HuggingFace: https://huggingface.co/inclusionAI/LLaDA-Image
- HuggingFace (FP8): https://huggingface.co/inclusionAI/LLaDA-Image-FP8
- HuggingFace (Turbo): https://huggingface.co/inclusionAI/LLaDA-Image-Turbo
- HuggingFace (Turbo FP8): https://huggingface.co/inclusionAI/LLaDA-Image-Turbo-FP8
- Coleccion HuggingFace: https://huggingface.co/collections/inclusionAI/llada-image
- GitHub: https://github.com/inclusionAI/LLaDA-Image
- arXiv: https://arxiv.org/pdf/2609.03796
