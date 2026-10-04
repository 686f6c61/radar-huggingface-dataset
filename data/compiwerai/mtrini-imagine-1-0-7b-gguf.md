# CompiwerAI/Mtrini-Imagine-1.0-7B-GGUF

## Resumen

Mtrini-Imagine-1.0-7B es un modelo de generación de imágenes a partir de texto (pipeline `text-to-image`) publicado por Compiwer AI, un desarrollador independiente marroquí. Esta release concreta es la versión en formato GGUF del modelo completo, en la que el adaptador LoRA de Mtrini-Imagine ya ha sido fusionado de forma nativa sobre el modelo base HiDream-ai/HiDream-O1-Image-Dev, por lo que no requiere cargar un adaptador por separado.

El checkpoint declarado contiene 8.804.887.792 parámetros según los datos de safetensors, aunque el nombre comercial del modelo indica 7B. El fichero incluido es un único GGUF en precisión BF16 de aproximadamente 16,4 GB, con 759 tensores y metadatos de arquitectura `hidream_o1` en su variante `dev`. La fusión afectó a 360 pares de capas LoRA, integradas antes de la conversión a GGUF.

La relevancia de esta publicación es fundamentalmente práctica: ofrece un punto de partida reproducible para experimentar con la arquitectura HiDream-O1/UiT en inferencia local y para el desarrollo de runtimes GGUF, aunque el propio autor advierte de que la generación mediante el runtime o1.c no ha sido validada oficialmente y de que el modelo es una release experimental. La licencia declarada es Apache-2.0, sujeta a las condiciones del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | HiDream-O1 / UiT (metadatos GGUF: `hidream_o1`, variante `dev`) |
| Parametros totales | 8.804.887.792 (~8,8 B) segun safetensors; el nombre comercial indica 7B |
| Parametros activos | no disponible (no hay indicios de arquitectura MoE en la informacion proporcionada) |
| Longitud de contexto | no disponible (no se documenta ventana de contexto textual) |
| Tipos de cuantizacion | BF16 (unico fichero publicado en el repo); no se listan cuantizaciones de menor precision |
| Idiomas soportados | en (ingles) y ar (arabe), segun los tags y la model card |
| Licencia | apache-2.0, sujeta a las condiciones de licencia del modelo base HiDream-O1-Image |
| Formato de pesos | GGUF (`Mtrini-Imagine-1.0-7B-bf16.gguf`), derivado de safetensors |

Datos adicionales declarados por el autor: 759 tensores, 360 pares de capas LoRA fusionadas, tamano del fichero ~16,4 GB, SHA256 `a73c6bc8c3acec091e2973a397251eff62b960f894b4d89c7ebdbb7364e324ad` y fichero `SHA256SUMS` incluido en el repositorio.

## Arquitectura y entrenamiento

La arquitectura es HiDream-O1 en su variante UiT, segun los metadatos del GGUF y la model card. No se proporciona informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni sobre si se aplicaron tecnicas de alineacion como RLHF o DPO, ni en el modelo base ni en el adaptador. Tampoco se documentan innovaciones tecnicas internas (tipo de atención, decodificacion especulativa u otras).

Lo que si se documenta es el proceso de construccion de este checkpoint: se parte de HiDream-O1-Image, se fusiona nativamente el LoRA de Mtrini-Imagine (360 pares de capas), se obtiene el modelo Mtrini-Imagine-1.0-7B y se convierte a GGUF. El autor declara verificaciones estructurales previas a la publicacion: cabecera magica GGUF valida, 759 tensores, metadatos de arquitectura y variante correctos, precision BF16 y SHA256 verificado. El intento de compilar el runtime o1.c con CUDA 13 sobre una NVIDIA RTX PRO 6000 Blackwell fallo por problemas de compatibilidad CUDA en el codigo fuente, en concreto en torno a `hd_cuda_errbuf`; el autor subraya que ese fallo de build no altero el fichero GGUF.

## Capacidades

- Generacion de imagenes a partir de prompts de texto (text-to-image).
- Creacion de ilustracion y artwork creativo.
- Experimentacion en generacion de imagenes con resolución y composicion variables (sin parametros publicados).
- Interpretacion de prompts en ingles y arabe.
- Inferencia local a partir de un unico fichero GGUF, sin necesidad de cargar el modelo base ni un adaptador aparte.
- Uso como material de investigacion en IA multimodal y en evaluacion de prompts.
- Uso como banco de pruebas para desarrollo de runtimes GGUF compatibles con la arquitectura `hidream_o1`.
- No se documenta soporte de tool calling, function calling, agentes ni razonamiento multi-paso; se trata de un modelo de generacion de imagenes, no de un modelo de lenguaje conversacional.
- No se documentan capacidades de vision de entrada (image-to-image) ni de audio.

## Casos de uso

- Preproduccion de ilustracion conceptual: el modelo permite generar variaciones rapidas de una idea visual a partir de una descripcion textual, util para equipos de arte que necesitan explorar direcciones antes de producir el asset final.
- Prototipado de assets para videojuegos o aplicaciones: generar bocetos de personajes, entornos u objetos para iterar sobre la direccion artistica sin coste de produccion.
- Investigacion en fusion de LoRA: al tratarse de un checkpoint con el adaptador ya fusionado, permite comparar el comportamiento del modelo fusionado frente al par base + adaptador, un escenario util para estudiar el impacto de la fusion nativa en la calidad de salida.
- Desarrollo y depuracion de runtimes GGUF: el repositorio declara explicitamente que la generacion con o1.c no esta validada, por lo que este checkpoint sirve como caso de prueba para quien trabaje en compatibilidad CUDA y carga de arquitecturas `hidream_o1`.
- Experimentacion local en generacion de imagenes: usuarios con hardware suficiente pueden ejecutar el modelo sin depender de servicios en la nube, manteniendo los prompts en local.
- Evaluacion de sesgos y fidelidad de prompt en modelos de difusion: el modelo es util como sujeto de pruebas en estudios sobre interpretacion de prompts, relaciones entre objetos y representacion de idiomas (ingles y arabe).
- Docencia y formacion tecnica: sirve para ilustrar el flujo completo de fusion de LoRA, conversion a GGUF y verificacion de integridad de un checkpoint.
- Generacion de material grafico de apoyo en marketing o redes: viable para composiciones sin texto relevante, dado que el renderizado de texto es una de las limitaciones reconocidas por el autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas objetivas (FID, CLIP score, MMLU, HumanEval u otras), ni comparaciones cuantitativas con otros modelos de generacion de imagenes.

## Requisitos de hardware

- VRAM estimada para inferencia: el fichero BF16 pesa aproximadamente 16,4 GB solo en pesos; hay que sumar el resto de componentes del pipeline de generacion de imagenes y las activaciones. Como estimacion prudente, se necesitan mas de 20-24 GB de memoria disponible.
- GPU consumer: podria caber en RTX 3090 o RTX 4090 (24 GB) de forma ajustada, y con mas margen en RTX 5090 (32 GB). No cabe en GPUs de 8, 12 o 16 GB.
- GPU de centro de datos: A100 (40 o 80 GB), H100 (80 GB) y RTX PRO 6000 Blackwell (esta ultima es la que el autor uso para intentar compilar el runtime o1.c).
- Opciones de despliegue: el autor menciona el runtime o1.c, cuya generacion no esta validada para esta release (fallo de compilacion con CUDA 13 en torno a `hd_cuda_errbuf`). La model card menciona DiffSynth solo como opcion nativa del adaptador, no del GGUF. No se documenta soporte en llama.cpp, Ollama, vLLM ni TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

La informacion proporcionada solo permite comparar esta release con el propio modelo base y con el adaptador LoRA del mismo autor.

| Modelo | Parametros | Formato | Requiere modelo base | Tamano | Licencia |
|---|---|---|---|---|---|
| Mtrini-Imagine-1.0-7B-GGUF | 8.804.887.792 (~8,8 B) | GGUF BF16 | No (LoRA fusionado) | ~16,4 GB | apache-2.0 (sujeta al modelo base) |
| HiDream-O1-Image-Dev (base) | no disponible | safetensors | No aplica | no disponible | no disponible en la informacion proporcionada |
| Mtrini-Imagine (adaptador LoRA) | no disponible | adaptador LoRA | Si | ~98 MB | no disponible en la informacion proporcionada |

No se dispone de datos de otros modelos comparables de generacion de texto a imagen (parametros, contexto, rendimiento, licencia) dentro de la informacion proporcionada, por lo que no se incluye una comparativa adicional.

## Limitaciones y advertencias

- Release experimental: el propio autor la califica como tal, con calidad de salida sujeta a errores.
- Renderizado de texto deficiente: aparicion de texto extrano y palabras mal escritas; es el area que el autor senala como prioritaria a mejorar.
- Errores semanticos: relaciones incorrectas entre objetos e interpretaciones erroneas del prompt.
- Artefactos visuales e inconsistencias en detalles pequenos.
- Runtime no validado: la generacion con o1.c no esta oficialmente validada para esta release; el intento de build con CUDA 13 en RTX PRO 6000 Blackwell fallo por compatibilidad, aunque el GGUF permanece estructuralmente valido.
- Sin benchmarks publicados: no hay metricas objetivas que permitan estimar su calidad frente a alternativas.
- Sin datos sobre sesgos: no se documenta ningun analisis de sesgo, y el modelo solo declara soporte de ingles y arabe, lo que limita su uso en otros idiomas.
- Licencia: se declara Apache-2.0, pero sujeta explicitamente a las condiciones del modelo base HiDream-O1-Image; es imprescindible revisar la licencia original antes de cualquier uso comercial.
- Adopcion nula en el momento de la ficha: 0 descargas y 0 likes, sin validacion independiente por parte de la comunidad.
- Responsabilidad de uso: el autor prohibe la generacion de contenido ilegal, danino, enganoso o abusivo y traslada al usuario la responsabilidad legal.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/CompiwerAI/Mtrini-Imagine-1.0-7B-GGUF
- Modelo base: https://huggingface.co/HiDream-ai/HiDream-O1-Image-Dev
- Paper, blog, repositorio de codigo o demo: no disponible en la informacion proporcionada.
