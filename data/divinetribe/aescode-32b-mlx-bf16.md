# divinetribe/AesCode-32B-MLX-bf16

## Resumen

AesCode-32B-MLX-bf16 es una conversion a formato MLX, en precision completa bfloat16, del modelo multimodal microsoft/AesCode-32B, publicada por el usuario divinetribe para ejecucion nativa en Apple Silicon. El modelo original lo desarrolla el equipo de AesCode en Microsoft y es un fine-tune de Qwen/Qwen3-VL-32B-Instruct bajo la clase `Qwen3VLForConditionalGeneration`: recibe una imagen de referencia (una captura de pantalla, un mockup, una foto de producto) junto con un prompt y genera artefactos visuales en HTML y CSS (presentaciones, posters, dashboards, paginas de producto). La conversion no altera pesos ni comportamiento: son los mismos 33.357.390.064 parametros re-troceados para cargarse con `mlx-vlm` sin PyTorch y sin nube.

La relevancia de esta publicacion es doble. Por un lado, preserva el tower de vision completo (351 tensores `vision_tower.*`), un fallo habitual en conversiones MLX de modelos vision-language que solo entienden la mitad textual y fallan en la primera imagen. Por otro, habilita inferencia local y privada de un modelo de 33,4B en bf16 sobre un Mac, algo que en CUDA exigiria una GPU de 80 GB o cuantizacion agresiva.

El modelo resuelve el problema design-to-code con calidad estetica: segun el paper de los autores (arXiv:2610.18860), obtiene 85,89 de puntuacion global en un benchmark de 300 muestras de infografias, frente a 61,10 del Qwen3-VL-32B base evaluado con la misma imagen de referencia. La longitud de contexto no se especifica en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer vision-language (`Qwen3VLForConditionalGeneration`), tower de vision + modelo de lenguaje |
| Parametros totales | 33.357.390.064 (33,4B) |
| Longitud de contexto | no disponible (la model card no lo especifica) |
| Tipos de cuantizacion | bfloat16 sin cuantizacion; no se distribuyen variantes cuantizadas en este repositorio |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors en formato MLX (re-troceado desde PyTorch); ~62 GB en disco, repositorio de 66,7 GB |
| Framework de inferencia | `mlx-vlm` sobre Apple Silicon |
| Modelo base | microsoft/AesCode-32B (fine-tune de Qwen/Qwen3-VL-32B-Instruct) |
| Relacion con el base | finetune; esta publicacion es solo una conversion de formato, no un entrenamiento adicional |

## Arquitectura y entrenamiento

La arquitectura es la de Qwen3-VL: un transformer multimodal con un tower de vision que codifica la imagen de referencia y un modelo de lenguaje que genera la secuencia HTML/CSS condicionada por ese contexto visual. El modelo es denso (no hay indicios de Mixture-of-Experts en la informacion disponible) y tiene 33,4B parametros en bf16. La conversion de divinetribe mantiene intactos los 351 tensores del tower de vision, ademas de `vision_config` y las configuraciones del procesador, de modo que la ruta multimodal funciona igual que en el modelo original.

Sobre el entrenamiento: el modelo lo produjo el equipo de AesCode en Microsoft y el paper asociado se titula "AesCode: Aesthetic Code Generation with Decoupled Cross-Modal Rewards", lo que indica un entrenamiento guiado por recompensas multimodales desacopladas orientadas a calidad estetica y cumplimiento de reglas. El numero de tokens de entrenamiento, la composicion exacta del dataset y si hubo RLHF/DPO no estan disponibles en la informacion proporcionada. Esta publicacion concreta no anade conocimiento ni modifica el comportamiento: solo reempaqueta los pesos.

## Capacidades

- Generacion de codigo HTML y CSS a partir de una imagen de referencia: convierte capturas, mockups y fotos de producto en artefactos renderizables (slides, posters, dashboards, paginas de producto).
- Comprension de interfaces: identifica elementos de una captura (breadcrumbs, H1, precio, valoracion por estrellas, botones CTA, notas de precio secundarias) y los describe o los reproduce.
- Auditoria visual: genera informes de SEO, marketing/conversion y accesibilidad a partir de una captura de pagina, incluida la propuesta de textos alternativos para imagenes.
- Generacion de alt-text para imagenes de producto.
- Razonamiento multimodal multi-paso sobre el contenido de la imagen (lectura de texto incrustado, jerarquia visual, relaciones entre elementos).
- Capacidad conversacional multi-turno (`pipeline_tag: image-text-to-text`).
- Ejecucion local y privada: sin claves de API, sin telemetria y sin salida a la nube en el flujo documentado.
- No documentado en la informacion disponible: soporte explicito de tool calling o function calling, modo thinking, audio, y capacidades de agente autonomo.

## Casos de uso

- Recreacion de capturas en HTML/CSS: se introduce un screenshot y el modelo devuelve un unico fichero HTML con CSS inline. Es el flujo documentado oficialmente (`--prompt "Recreate this screenshot as a single HTML file with inline CSS."`) y el caso de uso principal del modelo.
- Design-to-code en equipos de marketing: a partir de la imagen de una pagina de producto o de un mockup, generar el maquetado base que luego se refina a mano, reduciendo el tiempo de prototipado de landings y fichas de producto.
- Auditoria SEO y de conversion sobre capturas: el modelo lee la pagina y emite recomendaciones sobre title tag, meta description, datos estructurados de producto/review/offer, jerarquia visual del CTA y elementos enterrados en el layout. Util para revisiones rapidas sin acceso al DOM.
- Accesibilidad de catalogos de e-commerce: generar textos alternativos descriptivos para cada imagen de producto a partir de la propia imagen, cubriendo el requisito de alt-text en catalogos grandes.
- Generacion de dashboards e infografias: producir el HTML/CSS de un panel o infografia a partir de una referencia visual, aprovechando el entrenamiento especifico en artefactos con calidad estetica.
- Prototipado offline en entornos con datos sensibles: procesar capturas de paneles internos, backoffice o material no publico en un Mac local, sin enviar imagenes a servicios en la nube.
- Migracion de interfaces legacy: capturar una UI antigua y regenerar su estructura en HTML/CSS moderno como punto de partida de una migracion.

## Benchmarks y rendimiento

Los datos proceden del paper de los autores (arXiv:2610.18860) y de la model card del modelo original: 300 muestras de estilo infografia, puntuadas en correccion de seguimiento de reglas y calidad visual. No existe un leaderboard publico independiente que liste AesCode.

| Modelo | Overall | Visual | Condicion |
|---|---|---|---|
| AesCode-32B | 85,89 | 77,44 | con imagen de referencia |
| Claude Opus 4.8 | 76,78 | no disponible | sin imagen de referencia |
| GPT-5.5 | 76,31 | no disponible | sin imagen de referencia |
| Qwen3-VL-32B base | 61,10 | no disponible | con imagen de referencia |

AesCode-32B supera al Qwen3-VL-32B del mismo orden de magnitud en 22,4 puntos de calidad visual. Nota metodologica: las filas de modelos cerrados corresponden a evaluaciones sin imagen de referencia, por lo que la comparacion no es simetrica respecto a las filas de AesCode y Qwen3-VL. Los benchmarks generales de vision del backbone deben consultarse en la evaluacion oficial de Qwen3-VL, no en estos numeros. Para esta conversion MLX en concreto no se han publicado mediciones propias de latencia o throughput.

## Requisitos de hardware

- Memoria: los pesos bf16 suman 33.357.390.064 × 2 bytes ≈ 66,7 GB. A eso hay que anadir KV cache y activaciones, por lo que se necesita un Mac con memoria unificada claramente superior a 66,7 GB; en la practica, configuraciones de 96 GB o mas (estimacion derivada del tamano de pesos, no publicada por el autor).
- Almacenamiento: ~62 GB en disco para los pesos; 66,7 GB de descarga del repositorio.
- GPU: este build esta atado a Apple Silicon (M-series) mediante MLX. No se ejecuta en CUDA, por lo que A100/H100 no son una opcion para estos pesos concretos, y no cabe en GPUs de consumo tipo RTX 4090 (24 GB) ni en A100 de 40 GB.
- Cabe en consumer GPU: no, en ningun caso en bf16 con este formato. Cualquier ejecucion en GPU NVIDIA requeriria cuantizacion y otro runtime, no documentado en la informacion disponible.
- Despliegue: `mlx-vlm` (instalacion con `pip install mlx-vlm` y ejecucion via `python -m mlx_vlm.generate`). No se documenta soporte para vLLM, TGI, llama.cpp ni Ollama en este repositorio.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / runtime | Licencia | Overall en el benchmark de AesCode | Disponibilidad |
|---|---|---|---|---|---|---|
| AesCode-32B-MLX-bf16 (esta publicacion) | 33,4B | no disponible | safetensors MLX / mlx-vlm | apache-2.0 | 85,89 (mismos pesos) | HuggingFace, 0 descargas, 0 likes |
| microsoft/AesCode-32B | 33,4B | no disponible | safetensors (PyTorch) | apache-2.0 | 85,89 | HuggingFace |
| Qwen3-VL-32B-Instruct | 32B (segun denominacion; no confirmado) | no disponible | no disponible | no disponible | 61,10 (con referencia) | HuggingFace |
| Claude Opus 4.8 | no disponible | no disponible | API propietaria | propietaria | 76,78 (sin referencia) | API comercial |
| GPT-5.5 | no disponible | no disponible | API propietaria | propietaria | 76,31 (sin referencia) | API comercial |

La ventaja diferencial de esta publicacion frente a microsoft/AesCode-32B no es de rendimiento, sino de portabilidad: mismos pesos, mismo resultado, pero ejecutables en local sobre Apple Silicon sin PyTorch.

## Limitaciones y advertencias

- Solo ingles: la model card declara `language: en`; no hay soporte multilingue documentado, incluido el castellano.
- Plataforma unica: MLX sobre Apple Silicon. No hay ruta de despliegue documentada en CUDA, CPU x86, vLLM, TGI, llama.cpp ni Ollama para estos pesos.
- Coste de memoria muy alto: 66,7 GB solo en pesos bf16, sin variantes cuantizadas en el repositorio. No apto para equipos de consumo convencionales.
- Es una conversion, no un modelo nuevo: no anade conocimiento ni corrige errores. Hereda todos los sesgos y fallos del modelo original, incluido el riesgo de alucinacion en el codigo HTML/CSS generado, que no se ejecuta ni se valida antes de devolverse.
- Benchmark de parte: los 85,89 puntos provienen de los propios autores, sobre 300 muestras de infografias, sin leaderboard independiente. Ademas, la comparacion con modelos cerrados es asimetrica (AesCode usa imagen de referencia; Claude Opus 4.8 y GPT-5.5 no).
- Validacion visual limitada: la comprobacion del tower de vision descrita en la model card se basa en una unica captura de una pagina de producto real, no en una suite de evaluacion publicada.
- Licencia apache-2.0: permite uso comercial y modificacion, pero se distribuye sin garantias; la responsabilidad sobre el resultado recae en quien lo despliega.
- Madurez nula de la comunidad: 0 descargas y 0 likes en el momento de la consulta, publicacion reciente sin verificacion independiente por terceros.
- Riesgo de deriva en el formato de salida: al pedir HTML/CSS de un solo fichero, salidas largas pueden truncarse si se fija un `--max-tokens` bajo (la model card usa 1200 en su ejemplo).

## Enlaces

- HuggingFace (esta conversion): https://huggingface.co/divinetribe/AesCode-32B-MLX-bf16
- Modelo original: https://huggingface.co/microsoft/AesCode-32B
- Modelo base del fine-tune: https://huggingface.co/Qwen/Qwen3-VL-32B-Instruct
- Paper "AesCode: Aesthetic Code Generation with Decoupled Cross-Modal Rewards": https://arxiv.org/abs/2610.18860
- Repositorio mlx-vlm: https://github.com/Blaizzy/mlx-vlm
- Perfil del autor de la conversion: https://huggingface.co/divinetribe
- Pagina del autor con mas modelos: https://nicedreamzwholesale.com/software/huggingface/
