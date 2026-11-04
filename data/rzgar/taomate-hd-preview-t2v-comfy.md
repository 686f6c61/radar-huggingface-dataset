# rzgar/TaoMate-HD-preview-T2V-Comfy

## Resumen

TaoMate-HD-preview-T2V-Comfy es un adaptador LoRA convertido a un fichero único en formato safetensors para su uso en ComfyUI, derivado del adaptador TaoMate-HD-preview de TaoLiveAIGC y montado sobre el modelo base MiniMaxAI/MiniMax-H3. Lo publica el usuario rzgar como empaquetado listo para un flujo de trabajo de dos etapas orientado a generación de vídeo a partir de texto (T2V) en ComfyUI. No se trata de un modelo fundacional nuevo, sino de una conversión de formato y de un workflow preconfigurado.

El modelo resuelve el problema de integrar el adaptador original (pensado para el pipeline nativo de MiniMax H3, que emite fragmentos de vídeo en streaming con caché de atención entre fragmentos) en el ecosistema ComfyUI, donde esa funcionalidad de streaming todavía no tiene equivalente. El resultado es una generación de un único fragmento de unos 5 segundos por ejecución, con una etapa de baja resolución seguida de un upscaling latente y una segunda etapa de refinado.

La relevancia es acotada: es un recurso práctico para quien quiera experimentar con MiniMax H3 en ComfyUI sin montar el pipeline completo, pero no aporta innovación arquitectónica propia. El repositorio ocupa 1,2 GB y no registra descargas ni valoraciones en el momento de la consulta. La información técnica disponible procede exclusivamente de la model card del autor de la conversión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre el modelo de difusión MiniMax H3 (no se detalla la arquitectura interna del base) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (modelo de vídeo; genera fragmentos de ~5 s) |
| Tipos de cuantizacion | BF16 (fichero `TaoMate-HD-Preview-ComfyUI-BF16.safetensors`); FP16 en el upscaler latente auxiliar |
| Idiomas soportados | no disponible |
| Licencia | minimax-h3-community (etiquetada como `other` en HuggingFace) |
| Formato de pesos | safetensors (diffusion-single-file) |

## Arquitectura y entrenamiento

El artefacto publicado no es un modelo entrenado desde cero, sino la conversión del adaptador TaoMate-HD-preview (de TaoLiveAIGC) a un fichero único compatible con ComfyUI, más un flujo de trabajo de dos etapas para MiniMax H3 en su variante FL2VA (texto a vídeo). El adaptador se describe como destilado, de modo que la inferencia no utiliza classifier-free guidance: el `BasicGuider` opera solo con la rama positiva y cfg 1.0, con una fuerza de LoRA de 1.0 y un `MiniMaxH3SigmaShift` de 12.0 / 3.0.

El pipeline se organiza en dos pasadas. La primera genera a 480x864 con el sampler `eule` y sigmas manuales `1.0, 0.9612, 0.8533, 0.0` (tres evaluaciones). Después se aplica un upscaling latente mediante el modelo auxiliar `minimax_h3_latent_upscaler_3d_conv_v1_fp16.safetensors` hasta 768x1376, y una segunda pasada con sigmas `0.5, 0.25, 0.0` (dos evaluaciones). No se dispone de datos sobre el conjunto de entrenamiento, el número de tokens o vídeos utilizados, ni sobre si hubo RLHF o DPO.

La innovación técnica relevante del modelo base (streaming de fragmentos de 5 s con caché de atención entre fragmentos) no está replicada en esta conversión: el autor indica explícitamente que esa parte aún no tiene equivalente en ComfyUI, por lo que cada ejecución produce un único fragmento.

## Capacidades

- Generación de vídeo a partir de texto (T2V) en fragmentos de aproximadamente 5 segundos por ejecución.
- Generación en dos etapas con upscaling latente intermedio, de 480x864 a 768x1376, y posibilidad de llegar a 960x1728 (2x) con el mismo upscaler.
- Integración nativa en ComfyUI mediante fichero único safetensors y workflow preconfigurado.
- Control fino del muestreo mediante sigmas manuales y del desplazamiento de sigmas (`MiniMaxH3SigmaShift`).
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión, audio ni multilingüismo, por tratarse de un modelo generativo de vídeo.
- No se documenta soporte de imagen a vídeo en esta variante concreta (el repositorio hermano del autor se etiqueta como FL2V).

## Casos de uso

- Prototipado rápido de clips de vídeo en ComfyUI: el workflow de dos etapas permite obtener un clip de ~5 s a 768x1376 sin construir el grafo desde cero, adecuado para pruebas de concepto y previsualizaciones.
- Exploración de estilos visuales con LoRA: al ser un adaptador sobre MiniMax H3, permite evaluar la estética concreta de TaoMate-HD sobre el modelo base antes de comprometerse con el pipeline nativo.
- Generación de material de storyboard: clips cortos de baja resolución (480x864) en la primera etapa sirven como borradores rápidos antes de decidir qué tomas escalar a 960x1728.
- Integración en flujos de postproducción basados en ComfyUI: al ser un fichero único, se puede encadenar con nodos de interpolación, corrección de color o composición dentro del mismo grafo.
- Evaluación comparativa de adaptadores: investigadores que quieran contrastar el comportamiento de distintos LoRA sobre MiniMax H3 pueden usar este empaquetado como referencia reproducible con parámetros de muestreo fijados.
- Docencia y demostraciones: la configuración explícita de sigmas y etapas facilita explicar el funcionamiento de un pipeline de difusión de vídeo en dos pasadas con upscaling latente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. El repositorio pesa 1,2 GB, pero el consumo real depende del modelo base MiniMax H3, cuyos requisitos no se detallan.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible; no se confirma que quepa en tarjetas consumer.
- Opciones de despliegue: ComfyUI (vía `diffusion-single-file`), con los nodos `BasicGuider`, `MiniMaxH3SigmaShift` y `MiniMax H3 Latent Upscale With Model`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo de difusión de vídeo.
- Latencia y throughput: no disponibles. Solo se indica que cada ejecución produce un fragmento de unos 5 segundos de vídeo.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto / duracion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TaoMate-HD-preview-T2V-Comfy (este) | LoRA convertido para ComfyUI sobre MiniMax H3 | no disponible | fragmentos de ~5 s | minimax-h3-community | HuggingFace, 0 descargas |
| TaoMate-HD-preview (TaoLiveAIGC) | Adaptador original | no disponible | no disponible | no disponible | HuggingFace |
| MiniMaxAI/MiniMax-H3 | Modelo base de difusión de vídeo | no disponible | streaming de fragmentos de 5 s con caché de atención | no disponible | HuggingFace |

No se dispone de datos de rendimiento ni de parámetros para establecer una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- No replica el streaming con caché de atención entre fragmentos del modelo base: cada ejecución genera un único fragmento de ~5 s, lo que limita la producción de vídeos largos.
- El autor advierte de que no se debe introducir el latente semidenoisado en el upscaler: un latente a mitad de trayectoria produce ruido de color con forma de mariposa. Es obligatorio completar primero la pasada de baja resolución.
- El adaptador es destilado y no usa CFG; alterar los parámetros de guiado o la fuerza de LoRA puede degradar la calidad.
- No hay información sobre sesgos, riesgo de alucinación visual, idiomas soportados ni composición del dataset de entrenamiento.
- La licencia `minimax-h3-community` se etiqueta como `other`: es imprescindible revisar el fichero LICENSE antes de cualquier uso comercial, ya que las condiciones no se detallan en la model card.
- El repositorio tiene 0 descargas y 0 valoraciones, y fue creado y actualizado el mismo día: no hay evidencia de validación por parte de la comunidad.
- Depende de un upscaler latente externo alojado en otro repositorio (LBH-123-AI/Minimax_h3_latent_Upscaler), lo que añade una dependencia de terceros.
- No se documentan requisitos de hardware, por lo que el despliegue en producción requiere validación previa.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/rzgar/TaoMate-HD-preview-T2V-Comfy
- Modelo base: https://huggingface.co/MiniMaxAI/MiniMax-H3
- Adaptador original: https://huggingface.co/TaoLiveAIGC/TaoMate-HD-preview
- Upscaler latente: https://huggingface.co/LBH-123-AI/Minimax_h3_latent_Upscaler/tree/main/minimax_h3_latent_upscaler_3d_conv_v1
- Repositorio hermano (FL2V): https://huggingface.co/rzgar/TaoMate-HD-preview-FL2V-Comfy
- Fichero de pesos: https://huggingface.co/rzgar/TaoMate-HD-preview-FL2V-Comfy/resolve/main/TaoMate-HD-Preview-ComfyUI-BF16.safetensors
