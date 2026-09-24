# RunningHubAI/rh-minimax-h3-fl2v-turbo-4step-v1.2-768p-comfyui-resized-avg-rank-64-bf16.safetensors-lora

## Resumen

`rh-minimax-h3-fl2v-turbo-4step-v1.2-768p-comfyui-resized-avg-rank-64-bf16` es un adaptador LoRA de destilación de pasos (step distillation) publicado por RunningHubAI para el modelo base MiniMax H3, en su variante FL2VA (first-last to video + audio). Su función es reducir la inferencia de los 30-50 pasos típicos del modelo original a solo 4 pasos, manteniendo la generación de vídeo con audio sincronizado a 768p (1344x768, 16:9). El adaptador está pensado para cargarse directamente en ComfyUI desde `models/loras` mediante el cargador LoRA estándar, sin conversiones de formato adicionales.

El repositorio contiene un único archivo safetensors de 929 MiB en precisión BF16, con rango 64 y una optimización de recorte y promediado de pesos de bajo rango (`resized_avg_rank_64`) que, según la model card, incluye alineación de la resolución de las imágenes de referencia. La información publicada indica que sobre una RTX 5090 y con atención dispersa SLA se obtiene una aceleración de aproximadamente 2,5x respecto al modelo base, generando 15 segundos de audio y vídeo en cuestión de minutos.

Es relevante ahora porque permite ejecutar localmente en ComfyUI un pipeline de generación de vídeo con audio de la familia MiniMax H3 sin depender de módulos no liberados del modelo oficial, y con un coste de inferencia muy inferior al del modelo sin destilar. El repositorio no tiene descargas ni likes registrados en el momento de la consulta, y la licencia no está declarada de forma explícita.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (rango 64) sobre el modelo base MiniMax H3-Base-FL2VA, de generación de audio y vídeo; arquitectura interna del modelo base no disponible |
| Parametros totales | no disponible (el adaptador ocupa 929 MiB en BF16; el modelo base no se distribuye en este repositorio) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; la restricción conocida es de 15 s de vídeo con audio por generación) |
| Tipos de cuantizacion | BF16 en el adaptador; cuantizaciones del modelo base no disponibles |
| Idiomas soportados | 11 idiomas principales según la model card (no se enumeran en la información disponible) |
| Licencia | no disponible de forma explícita; la model card indica que la copyright pertenece al autor y que debe seguirse la licencia del proyecto original o del upstream |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA de bajo rango (rank 64) que se aplica sobre el modelo base MiniMax H3-Base-FL2VA. Se ha obtenido mediante destilación de los pasos de inferencia (concretamente de los pasos de CFG) del modelo original, con el objetivo de comprimir el muestreo a 4 pasos. La variante v1.2 incorpora las optimizaciones `resized_avg_rank_64`: alineación de la resolución de las imágenes de referencia y un promediado de pesos de bajo rango tras el recorte. El adaptador se ha entrenado de forma nativa a 1344x768 (16:9) y se distribuye en BF16.

La model card atribuye la destilación al equipo LightX2V/ModelTC y no documenta el número de tokens, la composición del dataset, ni si hubo etapas de RLHF o DPO (no aplicables en un pipeline de difusión). Tampoco se detalla la arquitectura interna del modelo base (tipo de transformer de difusión, mecanismo de atención o diseño del módulo de audio). La innovación técnica destacable es la compatibilidad con atención dispersa SLA sobre RTX 5090, que combinada con los 4 pasos de muestreo produce la aceleración de ~2,5x declarada, y la integración sin fricción en ComfyUI sin depender de módulos no liberados por MiniMax.

## Capacidades

- Generación de vídeo a partir del primer y último fotograma (FL2V, first-last to video).
- Generación de audio y vídeo a partir de texto e imagen.
- Generación de vídeo desde el primer fotograma y desde el último fotograma.
- Salida con audio sincronizado: vídeo a 24 fps más audio estéreo a 32 kHz.
- Duración máxima de 15 segundos por clip de audio y vídeo.
- Compatibilidad con relaciones de aspecto 21:9, 16:9 y 9:16, entre otras de uso habitual.
- Instrucciones en 11 idiomas principales según la model card (no se enumeran).
- Inferencia en 4 pasos, frente a los 30-50 pasos del modelo base.
- Carga nativa en ComfyUI mediante el cargador LoRA estándar, sin conversión de formato.
- No soporta tool calling, function calling ni razonamiento multi-paso: no es un modelo de lenguaje ni un agente.

## Casos de uso

- Creación de vídeo publicitario corto: el adaptador genera clips de hasta 15 s con audio sincronizado a 768p a partir de un primer y último fotograma definidos por el equipo creativo, lo que permite fijar el plano inicial y final y dejar que el modelo interpole el movimiento.
- Prototipado rápido de storyboards animados: con solo 4 pasos de muestreo, se pueden iterar decenas de variaciones de una escena en ComfyUI antes de fijar la versión final, reduciendo el coste de cómputo por iteración.
- Animación de ilustraciones y arte conceptual: dado un primer fotograma, el modelo anima la escena respetando la composición original gracias a la alineación de resolución de referencia de la variante `resized_rank_64`.
- Generación de vídeo con locución o ambiente sonoro: la salida incluye audio estéreo a 32 kHz sincronizado con la imagen, útil para demos musicales, clips para redes sociales o piezas de audio-vídeo sin postproducción de sonido.
- Localización de contenido a varios idiomas: al aceptar instrucciones en 11 idiomas principales, un mismo pipeline puede producir variantes de un clip para distintos mercados cambiando únicamente el prompt.
- Adaptación de formatos para distribución multiplataforma: la compatibilidad con 21:9 y 9:16 permite generar la misma pieza en formato apaisado y vertical sin reentrenar ni cambiar de modelo.
- Integración en flujos de producción existentes en ComfyUI: al ser un LoRA que se coloca en `models/loras` y se carga con el nodo estándar, se puede insertar en grafos ya construidos para el modelo base H3 sin reescribir el pipeline.
- Despliegue como servicio mediante API: la model card enlaza la API de RunningHub, lo que permite ofrecer generación de audio-vídeo por HTTP sin gestionar la GPU localmente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Los únicos datos de rendimiento declarados por el autor son de tipo operativo, no comparativos:

| Métrica | Valor declarado |
|---|---|
| Pasos de inferencia | 4 (frente a 30-50 del modelo base) |
| Aceleración con SLA en RTX 5090 | ~2,5x |
| Tiempo de generación de 15 s a 768p | "cuestión de minutos" (sin cifra exacta) |
| Resolución nativa de entrenamiento | 1344x768 (16:9) |
| FPS de salida | 24 |
| Frecuencia de muestreo de audio | 32 kHz, estéreo |

No se proporcionan valores de FVD, CLIP score, IS, ni métricas de calidad de audio o de sincronización labial.

## Requisitos de hardware

- Almacenamiento: 929 MiB para el adaptador LoRA, más el espacio del modelo base MiniMax H3, cuyo tamaño no se indica en la información disponible.
- VRAM para inferencia: no disponible. Depende por completo del modelo base, que no se distribuye en este repositorio; la model card no publica cifras de memoria.
- GPU recomendada según el autor: RTX 5090, configuración en la que se declara la aceleración de ~2,5x con atención dispersa SLA.
- Compatibilidad con GPU de consumo: el autor cita explícitamente una RTX 5090 como plataforma de referencia; no se documenta el comportamiento en GPUs de gama inferior ni el consumo de VRAM, por lo que no se puede confirmar que quepa en otras tarjetas de consumo.
- Opciones de despliegue: ComfyUI (carga directa desde `models/loras`), RunningHub (plataforma y API del propio autor), y Hugging Face como repositorio de pesos. No se menciona compatibilidad con vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a un pipeline de difusión de vídeo con audio.
- Latencia y throughput: solo se indica que 15 s de audio y vídeo a 768p se generan en "cuestión de minutos" sobre RTX 5090 con SLA. No hay cifras de p50/p95 ni de clips por minuto.

## Comparativa con modelos similares

No se dispone de información sobre otros adaptadores LoRA comparables en el material proporcionado, por lo que la comparación se limita al modelo base del que deriva este adaptador.

| Modelo | Pasos de inferencia | Resolución nativa | Duración máxima | Audio | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| rh-minimax-h3-fl2v-turbo-4step-v1.2-768p (este LoRA) | 4 | 1344x768 | 15 s | Sí, 24 fps + 32 kHz estéreo | No disponible explícitamente | Hugging Face, ComfyUI, RunningHub |
| MiniMax H3-Base-FL2VA (modelo base) | 30-50 | no disponible | no disponible | Sí, según la model card | La del proyecto upstream | Referenciado como origen, no incluido en este repositorio |
| Otros adaptadores de destilación de la comunidad | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- No se han publicado benchmarks objetivos de calidad de vídeo, de audio ni de sincronización entre ambos; la única evidencia de rendimiento es la declaración del autor sobre velocidad.
- La aceleración de ~2,5x está medida en una RTX 5090 con atención dispersa SLA; no hay datos sobre su comportamiento en otras GPU ni sin SLA.
- La licencia no está declarada de forma explícita. La model card indica que los derechos pertenecen al autor y que debe seguirse la licencia del proyecto original o del upstream, lo que obliga a verificar las condiciones del modelo base MiniMax H3 antes de cualquier uso comercial.
- El repositorio registra 0 descargas y 0 likes, por lo que no existe validación independiente por parte de la comunidad sobre su funcionamiento o calidad.
- Al ser un adaptador LoRA, el modelo no es autónomo: requiere el modelo base MiniMax H3 (y, según la model card, componentes concretos del pipeline FL2VA) para funcionar. Sin ellos no genera nada.
- Riesgo de alucinación visual y de artefactos de interpolación de movimiento, especialmente en el caso de uso FL2V con fotogramas inicial y final muy alejados entre sí; no se documentan tasas de fallo.
- La destilación a 4 pasos suele implicar una pérdida de variedad y de fidelidad respecto al muestreo de 30-50 pasos; la model card no cuantifica esta degradación.
- Limitación de duración: 15 segundos por generación como máximo declarado, sin información sobre encadenado de clips para secuencias más largas.
- El soporte de 11 idiomas se menciona sin enumerar cuáles ni con qué nivel de calidad por idioma.
- No incorpora capacidades de agente, tool calling ni razonamiento multi-paso; no debe plantearse como sustituto de un LLM en pipelines de automatización.
- Las fechas de creación y actualización del repositorio son 2026-09-24, dato tal y como aparece en la información consultada.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/RunningHubAI/rh-minimax-h3-fl2v-turbo-4step-v1.2-768p-comfyui-resized-avg-rank-64-bf16.safetensors-lora
- README en chino: README_cn.md (referenciado en la model card del repositorio)
- Proyecto original en RunningHub: https://www.runninghub.cn/model/public/2102780347502125058
- Página del autor en RunningHub: https://www.runninghub.cn/user-center/1929731488613310465
- RunningHub International: https://www.runninghub.ai
- RunningHub China: https://www.runninghub.cn
- Documentación de la API (inglés): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentación de la API (chino): https://www.runninghub.cn/runninghub-api-doc-cn/
- Página de entrenamiento en RunningHub: https://www.runninghub.ai/page-model
