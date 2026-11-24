# chdp207/Minimax-H3-Sulphur3-10Erosmax-Merge

## Resumen

Minimax-H3-Sulphur3-10Erosmax-Merge es un checkpoint de difusión para generación de vídeo (text-to-video e image-to-video) obtenido mediante el merge de tres modelos: MiniMaxAI/MiniMax-H3 como base arquitectónica, SulphurAI/Sulphur-3 y TenStrip/10Eros-Max como fuentes de estilo y ajuste fino. Sobre esa mezcla lineal se han horneado dos LoRAs de destilación (DMAD y PDMD 4-NFE) que reducen el número de pasos de muestreo necesarios para obtener vídeo coherente. Lo publica el usuario chdp207 en Hugging Face bajo la licencia comunitaria de MiniMax H3.

El modelo se distribuye en dos variantes de pesos: un checkpoint completo en BF16 y una versión cuantizada a INT8 con la técnica ConvRot nativa de ComfyUI (`int8_tensorwise` con tamaño de grupo Hadamard de 256). Está pensado exclusivamente para su uso dentro de ComfyUI, cargándolo con el nodo `UNETLoader` estándar, y requiere ComfyUI v0.27.0 o superior para aprovechar la ruta INT8.

Su relevancia es práctica: empaqueta en un único archivo una base de vídeo de gran tamaño junto con aceleradores de muestreo y una estética concreta, de modo que el usuario evita encadenar merges y LoRAs manualmente. El repositorio ocupa 61,4 GB, lo que refleja la escala del modelo (checkpoint de difusión de vídeo de gran tamaño en BF16 más su contrapartida INT8). No hay métricas publicadas, ni idiomas declarados, ni descargas registradas en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusión para vídeo (base MiniMax-H3), con LoRAs de destilación horneadas; detalles de bloques no disponibles |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 e INT8 ConvRot (`int8_tensorwise`, grupo Hadamard 256) |
| Idiomas soportados | no disponible |
| Licencia | MiniMax H3 Community License (más licencias de los modelos base y LoRAs upstream) |
| Formato de pesos | safetensors |
| Tamano del repositorio | 61,4 GB |
| Pipeline declarado | image-to-video (también etiquetado text-to-video) |
| Librería | ComfyUI |
| Modelo base | MiniMaxAI/MiniMax-H3, SulphurAI/Sulphur-3, TenStrip/10Eros-Max |

## Arquitectura y entrenamiento

El modelo es un checkpoint de difusión para vídeo derivado de MiniMax-H3. La receta declarada por el autor es un merge lineal con `alpha = 0.5` entre `Sulphur-3` (peso 0,50) y `10Eros_Max_8stepTurbo_v1.0_hybrid` (peso 0,50), partiendo de la arquitectura H3. Sobre esa mezcla se aplican secuencialmente dos LoRAs de destilación: `dmad_minimax_h3_8step_full_critic_comfyui` con escala 0,85 y `minimax_h3_pdmd_4nfe_comfyui_v6` con escala 0,333. Ambas están orientadas a reducir los pasos de inferencia (8 pasos y 4 NFE respectivamente, según sus nombres).

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si hubo etapas de RLHF o DPO; en modelos de difusión estos datos rara vez se publican y aquí no aparecen. La innovación técnica destacable es la inclusión de una variante INT8 ConvRot: se cuantizan a INT8 los lineales de atención y MLP de los bloques 0 a 49, mientras que las capas sensibles (`adaln_*`, proyecciones de patch y condición, `final_layer`, normalizaciones, `rope` y `token_refiner`) se mantienen en BF16 para preservar calidad.

## Capacidades

- Generación de vídeo a partir de texto (text-to-video) e imagen (image-to-video), según las etiquetas del repositorio y el pipeline declarado.
- Muestreo acelerado gracias a las LoRAs de destilación horneadas: el autor publica un ejemplo a 9 pasos (`sample-9_steps.mp4`), lo que sugiere inferencia viable en pocos pasos.
- Ejecución nativa en ComfyUI mediante `UNETLoader`, con soporte de la ruta INT8 ConvRot para reducir requisitos de memoria.
- No hay información sobre tool calling, function calling, uso como agente, capacidades multilingües explícitas, audio ni otros modos.
- No hay información sobre control fino (controlnet, keyframes, máscaras) más allá de lo que ofrezca la base MiniMax-H3.

## Casos de uso

- Prototipado rápido de vídeo generativo en ComfyUI: cargar el checkpoint INT8 en `models/diffusion_models/` y generar clips con pocos pasos de muestreo, útil para iterar sobre ideas visuales sin infraestructura grande.
- Animación de imágenes fijas (image-to-video): usar el pipeline declarado para dar movimiento a ilustraciones, fotogramas o renders, aprovechando la variante INT8 para reducir VRAM.
- Exploración estética concreta: el merge incorpora Sulphur-3 y 10Eros-Max, de modo que sirve para experimentar con la mezcla de estilos resultante frente a la base H3 pura.
- Pruebas de pipelines de difusión de vídeo: validar flujos de ComfyUI (nodos, sampler, pasos, resolución) antes de escalar a modelos mayores o a producción.
- Generación de material de previsualización para equipos creativos: clips cortos de baja resolución para storyboards o animáticas, con la ventaja de requerir pocos pasos.
- Investigación sobre merging y destilación: el repositorio documenta la receta exacta (pesos, escalas de LoRA), lo que permite reproducir o variar el merge para estudiar su efecto en la calidad del vídeo.
- Despliegue en entornos con GPU de gama alta pero no de datacenter: la variante INT8 ConvRot reduce el peso en memoria frente al BF16, facilitando su uso en estaciones de trabajo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. El repo pesa 61,4 GB, lo que incluye ambas variantes; el BF16 completo es del orden de decenas de GB y la variante INT8 aproximadamente la mitad en los lineales cuantizados, pero no hay cifras confirmadas.
- GPU recomendadas: no disponibles. Por el tamaño del checkpoint, se espera que requiera GPUs de gama alta o profesional (A100/H100 o equivalentes con suficiente memoria), aunque no hay datos que lo confirmen.
- Compatibilidad con GPU de consumo: no confirmada; la variante INT8 ConvRot está pensada para reducir memoria y podría acercar el modelo a GPUs de consumo de gama alta, pero sin cifras publicadas no puede afirmarse.
- Despliegue: ComfyUI (v0.27.0 o superior) con el nodo `UNETLoader`; no se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplican a un modelo de difusión de vídeo).
- Latencia y throughput: no disponibles. El ejemplo del autor a 9 pasos sugiere que el muestreo es corto, pero no se indican tiempos ni resolución.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Minimax-H3-Sulphur3-10Erosmax-Merge | no disponible | no disponible | MiniMax H3 Community License | Hugging Face, ComfyUI | Merge + LoRAs de destilación, BF16 e INT8 |
| MiniMaxAI/MiniMax-H3 | no disponible | no disponible | MiniMax H3 Community License | Hugging Face | Base oficial del merge |
| SulphurAI/Sulphur-3 | no disponible | no disponible | no disponible | Hugging Face | Fuente de estilo del merge (0,50) |
| TenStrip/10Eros-Max | no disponible | no disponible | no disponible | Hugging Face | Variante turbo de 8 pasos (0,50) |

No se dispone de datos de rendimiento ni de parámetros de los modelos comparados en la información proporcionada, por lo que la comparación se limita a procedencia y licencia.

## Limitaciones y advertencias

- Licencia MiniMax H3 Community License: es una licencia comunitaria con posibles restricciones de uso comercial; hay que revisar sus términos antes de cualquier despliegue productivo. Además hereda las licencias de Sulphur-3, 10Eros-Max y los LoRAs, que no se detallan.
- Al ser un merge de modelos de terceros, la calidad y los sesgos heredan los de las fuentes; no hay evaluación publicada de sesgos.
- Riesgo de artefactos y alucinación visual: los modelos de difusión de vídeo pueden generar movimiento incoherente, anatomías incorrectas o texto ilegible; no hay métricas que lo cuantifiquen aquí.
- Sin información sobre idiomas soportados ni sobre calidad multilingüe en prompts.
- Sin benchmarks ni descargas: el modelo no tiene validación externa en el momento de la ficha (0 descargas, 0 likes), por lo que su calidad no está contrastada por la comunidad.
- La variante INT8 ConvRot requiere ComfyUI v0.27.0 o superior; versiones anteriores no cargarán correctamente la cuantización.
- El tamaño del repositorio (61,4 GB) implica requisitos de almacenamiento y ancho de banda considerables.
- No hay información sobre límites de resolución, duración máxima de clip ni pasos mínimos recomendados más allá del ejemplo a 9 pasos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/chdp207/Minimax-H3-Sulphur3-10Erosmax-Merge
- Modelo base: https://huggingface.co/MiniMaxAI/MiniMax-H3
- Sulphur-3: https://huggingface.co/SulphurAI/Sulphur-3
- 10Eros-Max: https://huggingface.co/TenStrip/10Eros-Max
- LoRA DMAD: https://huggingface.co/ZhengmingYu/DMAD
- LoRA PDMD 4-NFE: https://huggingface.co/Iwannapose/minimax_h3_pdmd_4nfe_comfyui
- Vídeo de ejemplo (9 pasos): https://huggingface.co/OliviaRossi/Minimax-H3-Sulphur3-10Erosmax-Merge/resolve/main/sample-9_steps.mp4
