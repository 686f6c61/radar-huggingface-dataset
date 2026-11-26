# Alex240z/H3-Re-Time-v1

## Resumen

H3-Re-Time-v1 es un LoRA de restauración de vídeo desarrollado por el usuario Alex240z sobre el modelo base MiniMaxAI/MiniMax-H3. No se trata de un modelo completo, sino de un adaptador de rango 16 diseñado para corregir un problema concreto del pipeline estándar de MiniMax H3: la compresión temporal de fotogramas (el esquema `1 + 4 + 4 + 4 + 4` agrupa 17 fotogramas de píxeles en 5 latentes de vídeo), que provoca desenfoque temporal, saltos en los límites de fotograma y parpadeos de exposición cuando se trabaja con latentes de fotograma único.

El adaptador modifica los bloques de atención y MLP del DiT de MiniMax H3 para operar sobre una línea temporal RoPE uniforme por fotograma (`frame_spacing = 1.0`) con latentes `minimax_h3_image_vae_fp16` de un solo fotograma. Según el autor, esto elimina los picos de exposición en los límites de 12 fotogramas y reduce el ghosting en restauración por ventana deslizante. Es un componente especializado dentro del ecosistema ComfyUI, pensado para emparejarse con el nodo personalizado ComfyUI-H3-ReTime.

Su relevancia es acotada pero práctica: resuelve un artefacto específico en flujos de video-to-video y restauración de metraje, y está diseñado para apilarse con LoRAs de destilación turbo (PDD) al excluir los pesos de `final_layer`. El repositorio es pequeño (0,3 GB) y no registra descargas ni interacciones en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (rango 16) sobre DiT de MiniMax H3 (`fl2va`), dirigida a bloques de atención, AdaLN y MLP |
| Parametros totales | no disponible (adaptador LoRA; el modelo base MiniMax-H3 no reporta cifra en la información disponible) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (en el dominio de vídeo, ventana deslizante configurable: `commit_frames = 4`, `context_before = 2`, `context_after = 2`) |
| Tipos de cuantizacion | no disponible (se distribuye en `safetensors`; el VAE recomendado es `minimax_h3_image_vae_fp16`) |
| Idiomas soportados | no disponible |
| Licencia | other (heredada del modelo base; consultar términos de MiniMaxAI/MiniMax-H3) |
| Formato de pesos | safetensors (`H3-Re-Time-v1.safetensors`) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 16 aplicado sobre el transformer de difusión (DiT) de MiniMax H3, en la variante `fl2va`. Ataca tres familias de bloques: atención, AdaLN y MLP. El objetivo declarado es reajustar la atención temporal para que el modelo funcione con una línea temporal RoPE uniforme por fotograma, en lugar del empaquetado temporal estándar de MiniMax H3 que agrupa 17 fotogramas de píxeles en 5 latentes de vídeo.

No se dispone de información sobre el conjunto de datos de entrenamiento, el número de pasos, la composición del dataset ni si se emplearon técnicas de RLHF o DPO; en el contexto de un LoRA de difusión estos datos no son habituales en la model card. La innovación técnica destacable es la exclusión de los pesos de `final_layer`, lo que permite apilar el adaptador con LoRAs de destilación turbo (por ejemplo `pika_h3_flex_fl2va_v1`) sin conflicto. El adaptador se integra mediante el nodo ComfyUI-H3-ReTime, que gestiona la codificación y decodificación con el VAE de imagen `minimax_h3_image_vae_fp16`.

## Capacidades

- Restauración de vídeo fotograma a fotograma (video-to-video) sobre MiniMax H3.
- Operación con latentes de fotograma único (`1 latent = 1 pixel frame`) en lugar del empaquetado temporal estándar.
- Eliminación de picos de exposición en los límites de 12 fotogramas y reducción de ghosting en ventanas deslizantes.
- Compatibilidad con LoRAs de destilación turbo (PDD) para inferencia acelerada.
- Restauración por ventana deslizante con parámetros configurables (`commit_frames`, `context_before`, `context_after`, `buffer_before`, `buffer_after`).
- Editor de línea temporal opcional (Context Studio) con tamaños de chunk personalizados, escalado de denoise por chunk y condicionamiento explícito por chunk.
- Integración con ComfyUI mediante el nodo personalizado ComfyUI-H3-ReTime.
- No se documentan capacidades de texto, código, matemáticas, tool calling, agentes ni multilingüismo; el adaptador está restringido al dominio de vídeo.

## Casos de uso

- Restauración de metraje antiguo o degradado: el adaptador permite procesar vídeo fotograma a fotograma con latentes de imagen, eliminando el desenfoque temporal y los parpadeos de exposición que introduce el empaquetado estándar de MiniMax H3, lo que resulta adecuado para digitalizaciones con grano y fluctuaciones de luminosidad.
- Limpieza de animación y linework: con la recomendación de exportar en ProRes o PNG (en lugar de H.264 con `bframes=3`, que añade una cadencia de suavizado 1 de cada 4 fotogramas), el flujo es apropiado para material de líneas nítidas donde el desenfoque temporal es especialmente visible.
- Video-to-video con ventana deslizante: la configuración `frame_spacing = 1.0` con `commit_frames = 4` y contexto de 2 fotogramas antes y después permite procesar clips largos por chunks manteniendo coherencia temporal y reduciendo el ghosting en las costuras.
- Restauración acelerada en producción: al ser apilable con LoRAs turbo PDD, se puede combinar con destilación para reducir el número de pasos de muestreo, útil en pipelines donde el coste por minuto de vídeo es limitado.
- Corrección de exposición en material con flashes o cambios de iluminación: el adaptador está diseñado específicamente para eliminar los picos de exposición en los límites de 12 fotogramas, un escenario típico en metraje de archivo o grabaciones con balance de blancos automático.
- Integración en flujos ComfyUI existentes: el workflow `H3-Re-Time-WF.json` permite arrancar sin configuración manual, lo que facilita prototipado rápido y evaluación del adaptador antes de desplegarlo en un pipeline mayor.
- Ajuste fino por chunk con Context Studio: en secuencias con condiciones de iluminación muy heterogéneas se puede aplicar un denoise distinto por chunk y condicionamiento explícito, algo útil en restauración de montajes con planos de origen diverso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; depende enteramente del modelo base MiniMax-H3 y de la resolución y longitud del clip, no del adaptador (0,3 GB).
- GPU recomendadas: no disponible. El modelo base MiniMax-H3 no documenta requisitos en la información disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: ComfyUI con el nodo personalizado ComfyUI-H3-ReTime (método documentado por el autor). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a un LoRA de difusión de vídeo.
- Latencia y throughput: no disponibles. El autor recomienda exportar en ProRes o PNG para inspección limpia, lo que sugiere que el coste de codificación es relevante en el flujo de trabajo.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otros LoRAs de restauración de vídeo comparables ni datos de rendimiento que permitan una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Adaptador, no modelo autónomo: requiere MiniMaxAI/MiniMax-H3 como base y el nodo ComfyUI-H3-ReTime para funcionar; no es utilizable de forma aislada.
- Licencia "other": los términos exactos no se detallan en la información disponible y heredan las restricciones del modelo base; es imprescindible revisar la licencia de MiniMax-H3 antes de cualquier uso comercial.
- Sin validación externa: el repositorio registra 0 descargas y 0 likes, y no hay benchmarks ni evaluaciones de terceros que respalden las mejoras declaradas por el autor.
- Ámbito estrecho: el adaptador está entrenado para un pipeline concreto (latentes de fotograma único, `frame_spacing = 1.0`, VAE `minimax_h3_image_vae_fp16`); usarlo fuera de esa configuración puede degradar la calidad.
- Riesgo de artefactos en la exportación: el propio autor advierte que el `SaveVideo` H.264 por defecto de ComfyUI (`bframes=3`) introduce una cadencia de suavizado 1 de cada 4 fotogramas en linework nítido, lo que puede enmascarar o confundir la evaluación de resultados.
- Idiomas y sesgos: no disponibles; al ser un adaptador de vídeo, las consideraciones de sesgo lingüístico no aplican, pero sí los sesgos visuales heredados del modelo base y de los datos de entrenamiento de este.
- Riesgo de alucinación visual: como todo modelo generativo de difusión, puede inventar detalles en la restauración; no hay datos sobre la fidelidad de reconstrucción.
- Documentación mínima: no se especifican pasos de entrenamiento, dataset ni métricas objetivas, lo que dificulta la reproducibilidad.

## Enlaces

- Hugging Face: https://huggingface.co/Alex240z/H3-Re-Time-v1
- Repositorio del nodo ComfyUI: https://github.com/Alex240z/ComfyUI-H3-ReTime
- Workflow de ejemplo: https://github.com/Alex240z/ComfyUI-H3-ReTime/blob/main/H3-Re-Time-WF.json
- Modelo base: https://huggingface.co/MiniMaxAI/MiniMax-H3
