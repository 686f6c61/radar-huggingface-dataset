# Alissonerdx/BFS-Best-Face-Swap

## Resumen

BFS (Best Face Swap) es una serie de adaptadores LoRA desarrollada por Alissonerdx para realizar intercambios de rostro, cabeza y cuerpo completos con alta fidelidad, integración natural del tono de piel y consistencia de iluminación. El modelo no es un modelo independiente, sino un conjunto de adaptadores diseñados para funcionar sobre tres familias de modelos base: Qwen Image Edit 2509/2511, FLUX.2 Klein 4B/9B y Krea 2. Publicado bajo licencia MIT, acumula más de 115.000 descargas y 766 likes en Hugging Face.

La serie se organiza en versiones con distinto alcance de sustitución: Face V1 intercambia únicamente el rostro preservando el pelo, la iluminación y el fondo de la imagen objetivo; Head V1 a V5 realizan intercambios completos de cabeza con mejoras progresivas en coincidencia de tono de piel, alineación de pose y consistencia anatómica; y las versiones para Krea 2 añaden además intercambio de cuerpo completo. Cada versión requiere un orden específico de las imágenes de entrada, y algunas versiones (Head V3 en adelante) utilizan orden invertido (cuerpo primero, rostro después).

La relevancia actual del modelo radica en que aborda uno de los problemas más difíciles del image-to-image: el intercambio facial con preservación de identidad y coherencia visual, sin necesidad de entrenar un modelo completo. Al ser adaptadores LoRA sobre modelos base ya optimizados, ofrece una vía práctica para integrar face swapping en flujos de ComfyUI y pipelines de edición de imagen.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptadores LoRA sobre modelos base de difusion (Qwen Image Edit 2509/2511, FLUX.2 Klein 4B/9B, Krea 2) |
| Parametros totales | No disponible (los LoRA varian por version; el repo pesa 12,8 GB e incluye multiples adaptadores) |
| Parametros activos | No aplica (es un adaptador, no un modelo MoE) |
| Longitud de contexto | No aplica (modelo de imagen, no de texto) |
| Tipos de cuantizacion | safetensors (fp16 y fp32 segun version; existen variantes rank 16 fp16 y rank 32 fp32 para Head V5) |
| Idiomas soportados | Ingles (prompts de activacion y descripciones) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

BFS es una serie de adaptadores LoRA que se aplican sobre modelos base de difusion de imagen. Los modelos base soportados son Qwen Image Edit 2509 y 2511 (modelos de edicion de imagen de Qwen), FLUX.2 Klein 4B y 9B de Black Forest Labs, y Krea 2. Cada version del adaptador se entrena especificamente para un modelo base y un nivel de sustitución distinto: solo rostro, cabeza completa o cuerpo entero.

Los detalles de entrenamiento disponibles son parciales. La version Head V5 para Qwen Image Edit 2511 se entreno durante mas de 5.500 pasos directamente sobre el modelo 2511, y tambien se publicaron versiones fusionadas (merge) de Head V4 (2509) sobre el original entrenado en 2511. Segun el autor, las versiones fusionadas rinden mejor en la reproduccion de un rango mas amplio de expresiones. Para FLUX.2 Klein 9B existen variantes con 3.500 pasos a rank 128 y 3.750 pasos a rank 64. No se especifica la composicion del dataset de entrenamiento ni si se utilizaron tecnicas de RLHF o DPO.

Una innovacion destacable es el uso de orden invertido de imagenes de entrada en las versiones Head V3, V4 y V5: se envia primero el cuerpo y despues el rostro, lo que segun el autor mejora la estabilidad y precision del intercambio. Tambien se incluyen prompts de activacion especificos para las versiones de Krea 2, como `head_swap: replace the head with the reference head` y `body_swap: replace the person with the reference person`.

## Capacidades

- Intercambio de rostro (face swap) preservando pelo, iluminacion y fondo de la imagen objetivo, mediante la version Face V1.
- Intercambio completo de cabeza (head swap) con integracion natural entre cabeza y cuerpo, disponible en las versiones Head V1 a V5.
- Intercambio de cuerpo completo (body swap) con la version experimental para Krea 2, que sustituye a la persona por la persona de referencia.
- Cambio de fondo combinable con el body swap mediante el sufijo `BG: [descripcion]` en el prompt.
- Combinacion de adaptadores: el autor sugiere usar el head swap y el body swap de Krea 2 juntos a intensidad 0,5 para mejorar la identidad facial.
- Transferencia de expresiones faciales mejorada en las versiones Head V4 y V5.
- Compatibilidad multiplataforma: funciona con Qwen Image Edit, FLUX.2 Klein y Krea 2, y se integra en ComfyUI mediante flujos de trabajo incluidos en el repositorio.

## Casos de uso

- Postproduccion fotografica profesional: sustituir el rostro de un sujeto en una sesion de estudio manteniendo la iluminacion y el fondo originales, gracias a la version Face V1 que preserva el pelo y el contexto.
- Correccion de retratos: reemplazar una expresion no deseada o unos ojos cerrados en una foto de grupo utilizando Head V4 o V5, que transfieren la expresion del rostro de referencia con mayor robustez.
- Creacion de contenido para cine y video: generar tomas alternativas intercambiando cabezas entre actores para escenas de dobles, usando las versiones Head V3 o V5 con el orden de entrada invertido.
- Personalizacion de avatares y personajes: aplicar el rostro de una persona sobre cuerpos o poses distintas con la version Body Swap de Krea 2, combinada con el head swap a intensidad 0,5 para mantener la identidad.
- Restauracion de fotografias antiguas: transferir un rostro bien conservado a una imagen degradada o con el rostro danado, aprovechando la coincidencia de tono de piel de las versiones Head V2 y V3.
- Prototipado rapido en diseno de moda: visualizar prendas sobre distintos modelos intercambiando cabezas o cuerpos completos, con la posibilidad de cambiar el fondo mediante el sufijo `BG:` en Krea 2.
- Flujos de trabajo automatizados en ComfyUI: integrar los adaptadores en pipelines de edicion por lotes, gracias a los flujos de trabajo JSON incluidos en el repositorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no proporciona metricas cuantitativas como FID, LPIPS o evaluaciones de identidad facial. La evaluacion se basa en ejemplos visuales publicados en la model card y en la valoracion subjetiva del autor, que indica que las versiones fusionadas de Head V5 rinden mejor en expresiones que la version original.

## Requisitos de hardware

- Los adaptadores LoRA en si son ligeros, pero los requisitos reales de VRAM los determina el modelo base elegido.
- Para FLUX.2 Klein 4B: cabe en GPUs de consumo con 8-12 GB de VRAM en fp16, dependiendo de la resolucion de imagen.
- Para FLUX.2 Klein 9B: requiere 16-24 GB de VRAM en fp16; con cuantizacion fp8 puede ejecutarse en GPUs de 12-16 GB.
- Para Qwen Image Edit 2511: los requisitos dependen del tamano del modelo base; se recomiendan GPUs con al menos 16 GB de VRAM.
- Para Krea 2: requisitos no especificados; se recomienda probar en GPUs de 16 GB o superiores.
- GPUs recomendadas: NVIDIA RTX 4090 (24 GB) para modelos 4B y Krea 2; A100 o H100 para los modelos 9B a resoluciones altas.
- Opciones de despliegue: ComfyUI con los flujos de trabajo incluidos; Diffusers para integracion en Python; no se menciona soporte para vLLM, llama.cpp u Ollama, ya que no es un modelo de texto.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Modelo base | Alcance | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| BFS (este modelo) | LoRA | Qwen Image Edit, FLUX.2 Klein, Krea 2 | Rostro, cabeza, cuerpo | MIT | Hugging Face |
| InsightFace / inswapper | Modelo de reconocimiento facial | Independiente | Rostro | No comercial (para inswapper) | GitHub, pip |
| Roop / face-swap | Pipeline de intercambio | Independiente | Rostro | No comercial | GitHub |
| InstantID | Adaptador | SDXL | Rostro con control de pose | Apache 2.0 (codigo), modelo con restricciones | Hugging Face |

BFS se diferencia de alternativas como Roop o InsightFace en que no requiere deteccion facial en tiempo real ni reconstruccion 3D: opera como un adaptador LoRA dentro del proceso de difusion, lo que permite integracion natural con la iluminacion y el estilo del modelo base. Frente a InstantID, BFS cubre tambien intercambio de cabeza y cuerpo completo, no solo el rostro. La licencia MIT es mas permisiva que la de la mayoria de alternativas de face swap, que suelen tener restricciones de uso no comercial.

## Limitaciones y advertencias

- Riesgo de uso indebido: el intercambio facial puede emplearse para suplantacion de identidad o creacion de contenido falso; debe utilizarse con consentimiento explicito de las personas implicadas.
- La version Body Swap de Krea 2 es experimental: la transferencia de pose no siempre coincide exactamente con la imagen original.
- Las versiones Head V3, V4 y V5 requieren orden invertido de imagenes (cuerpo primero, rostro despues); usar el orden estandar produce resultados incorrectos.
- El modelo esta documentado solo en ingles; los prompts de activacion deben escribirse en ingles.
- No se han publicado evaluaciones cuantitativas de fidelidad de identidad ni de calidad de imagen; la eficacia se basa en ejemplos visuales.
- Las versiones fusionadas de Head V5 no son perfectas, segun el propio autor, especialmente en la reproduccion de un rango amplio de expresiones.
- El rendimiento depende criticamente del modelo base; no es un modelo autonomo y requiere descargar el adaptador y el modelo base correspondiente.
- La licencia MIT cubre el adaptador, pero los modelos base (FLUX.2, Qwen Image Edit, Krea 2) tienen sus propias licencias que deben verificarse por separado para uso comercial.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Alissonerdx/BFS-Best-Face-Swap
- Contenido del repositorio: https://huggingface.co/Alissonerdx/BFS-Best-Face-Swap/tree/main
- Flujo de trabajo Head/Face Swap para Qwen Image Edit 2509 (Civitai): https://civitai.com/articles/20190/headface-swap-workflow-qwen-image-edit-2509
- Pagina del modelo en Civitai (FLUX.2 Klein 9B): https://civitai.red/models/2027766/bfs-best-face-swap
- Ficha en aimodels.fyi: https://www.aimodels.fyi/models/huggingFace/bfs-best-face-swap-alissonerdx
