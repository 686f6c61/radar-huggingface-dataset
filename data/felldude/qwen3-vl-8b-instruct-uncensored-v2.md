# Felldude/Qwen3-VL-8B-Instruct-Uncensored-V2

## Resumen

Qwen3-VL-8B-Instruct-Uncensored-V2 es un ajuste fino (fine-tune) completo del modelo multimodal Qwen3-VL-8B-Instruct, publicado por el usuario Felldude en Hugging Face. El modelo parte de la familia Qwen3-VL de Alibaba, una arquitectura transformer multimodal que combina un codificador visual con un decodificador de lenguaje, y ha sido reentrenado para eliminar los filtros de contenido y orientarse hacia el etiquetado (captioning) de imagenes y videos, incluyendo contenido NSFW. El autor indica que el encoder de vision permanecio congelado durante el entrenamiento y que solo se ajustaron los pesos del decodificador.

El modelo cuenta con 8.767.123.696 parametros (8,77 mil millones) y un repositorio de 17,5 GB en formato safetensors. Su proposito principal es la generacion de descripciones detalladas de imagenes y videos, con un enfasis explicito en vocabulario directo y sin eufemismos, lo que lo hace util para pipelines de generacion de datos de entrenamiento para modelos texto-a-imagen. Es relevante en el ecosistema open source porque ofrece una alternativa sin censura sobre una base Qwen3-VL, con licencia Apache 2.0, lo que permite uso comercial sin restricciones adicionales.

El modelo soporta tres idiomas declarados (ingles, espanol y japones) y esta disenado para ser usado con prompts de captioning sencillos, sin necesidad de plantillas complejas. Su principal limitacion practica es el requisito de hardware: el autor especifica que necesita 24 GB de VRAM o mas para su ejecucion, lo que lo situa fuera del alcance de GPUs de consumo de gama media.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Qwen3-VL: encoder de vision + decodificador de lenguaje) |
| Parametros totales | 8.767.123.696 (8,77 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repo solo contiene safetensors en BF16/FP16) |
| Idiomas soportados | Ingles, espanol, japones |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen3-VL, un transformer multimodal compuesto por un codificador de vision y un decodificador de lenguaje. Segun la model card, se realizo un fine-tune completo del modelo de 8B parametros manteniendo el encoder de vision congelado, es decir, solo se ajustaron los pesos del decodificador de lenguaje. El entrenamiento utilizo el optimizador Adam8bit para gestionar el tamano del modelo, y en caso contrario se habrian usado BF16/TF32.

La model card no especifica el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO. El autor menciona que esta version (V2) esta "altamente orientada a contenido NSFW" y que, debido a que el entrenamiento se realizo solo con imagenes, el modelo puede generar ocasionalmente leyendas (captions) de video como si fueran de imagen. No se documentan innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de descripciones detalladas de imagenes (captioning) en ingles, espanol y japones.
- Generacion de descripciones de videos, aunque el autor advierte que puede confundir videos con imagenes por el tipo de entrenamiento.
- Etiquetado de contenido NSFW con vocabulario directo y sin eufemismos, segun la configuracion del prompt.
- Capacidad de seguir instrucciones de captioning complejas: iluminacion, angulo de camara, marcas de agua, artefactos JPEG, estilo de composicion, profundidad de campo, orientacion y relacion de aspecto.
- Descripcion de calidad estetica subjetiva y tipo de plano (primer plano, plano medio, plano general, etc.).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues limitadas a los tres idiomas declarados.
- Modo thinking, vision o audio adicionales: no disponible en la informacion proporcionada.

## Casos de uso

- Generacion de datasets de entrenamiento para modelos texto-a-imagen: el modelo puede producir captions detallados y variados de imagenes, incluyendo informacion de iluminacion, composicion y camara, lo que alimenta pipelines de entrenamiento de difusion con datos estructurados.
- Etiquetado de contenido para plataformas de moderacion: permite clasificar imagenes como SFW, sugerentes o NSFW y generar descripciones explicitas que ayuden a revisar y catalogar contenido subido por usuarios.
- Descripcion automatizada de catalogos de imagenes: en flujos de gestion de activos digitales, el modelo genera metadatos ricos (sujeto, medio, colores, texturas, relaciones espaciales) que mejoran la buscabilidad.
- Analisis de fotografia profesional: con prompts que solicitan apertura, velocidad de obturacion e ISO, el modelo puede inferir parametros de camara probables y detalles tecnicos de la toma.
- Generacion de descripciones para accesibilidad: produce texto alternativo detallado para imagenes, con orientacion, composicion y elementos principales, util en sitios web y aplicaciones.
- Anotacion de videos para pipelines de vision: aunque con la advertencia de posibles confusiones con imagenes, puede generar descripciones de escenas y elementos clave en fotogramas o clips.
- Investigacion sobre sesgos y contenido explicito: al ser un modelo sin censura, sirve para estudiar como los modelos multimodales describen contenido sensible y para calibrar filtros de seguridad en otros sistemas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: 24 GB o mas, segun la model card del autor.
- GPU recomendadas: no se especifican modelos concretos; por el requisito de 24 GB encajan GPUs como A100 (40/80 GB), H100, RTX A6000 (48 GB) o RTX 4090 (24 GB, en el limite).
- Cabe en consumer GPU: si, en RTX 4090 (24 GB) y posiblemente en otras GPUs con 24 GB, aunque sin margen para cuantizaciones adicionales si se mantiene BF16.
- Opciones de despliegue: no disponible en la informacion proporcionada (no se mencionan vLLM, llama.cpp, Ollama ni TGI).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| Felldude/Qwen3-VL-8B-Instruct-Uncensored-V2 | 8,77 B | no disponible | Apache 2.0 | Captioning sin censura sobre Qwen3-VL | Hugging Face, safetensors |
| Qwen3-VL-8B-Instruct (base) | ~8 B | no disponible | Apache 2.0 | Multimodal general con alineamiento de seguridad | Hugging Face |
| Alternativas de captioning sin censura | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones detalladas de modelos comparables en la informacion proporcionada, por lo que la comparativa se limita a la relacion con su modelo base.

## Limitaciones y advertencias

- El modelo ha sido entrenado para eliminar filtros de contenido y generar descripciones explicitas; no es adecuado para aplicaciones dirigidas al publico general sin moderacion posterior.
- Riesgo elevado de generar contenido NSFW, lenguaje vulgar y descripciones de personas o personajes con edades, lo que requiere supervision humana y cumplimiento legal.
- Puede confundir videos con imagenes y generar captions de video en formato de imagen, segun advierte el autor.
- Sesgos conocidos: no documentados en la model card; al derivar de Qwen3-VL, puede heredar sesgos del modelo base, pero no se especifican.
- Riesgo de alucinacion: no documentado; en tareas de captioning puede inventar detalles no observables si el prompt lo permite.
- Limitaciones de contexto e idioma: solo se declaran ingles, espanol y japones; la longitud de contexto no esta disponible.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el contenido generado puede infringir normativas sobre material explicito o derechos de imagen.
- Caveat para produccion: el requisito de 24 GB de VRAM limita el despliegue en infraestructura de gama media; no se documentan optimizaciones de inferencia ni cuantizaciones oficiales.

## Enlaces

- Hugging Face: https://huggingface.co/Felldude/Qwen3-VL-8B-Instruct-Uncensored-V2
- Modelo base Qwen3-VL-8B-Instruct: no disponible en la informacion proporcionada
- Paper, blog, repositorio o demo adicionales: no disponible en la informacion proporcionada
