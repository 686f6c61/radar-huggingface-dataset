# sakamakismile/10Eros-Max-beta2-NVFP4

## Resumen

El modelo **10Eros-Max-beta2-NVFP4** es una cuantización NVFP4 del modelo de generación de vídeo **TenStrip/10Eros-Max**, desarrollada por el usuario sakamakismile. El modelo original, un experimento de injerto sobre la arquitectura **MiniMax-H3** que incorpora características de LTX-2.3, Wan 2.2 y Krea 2, se distribuye únicamente en BF16 con un peso de 40,22 GB. Esta versión cuantizada reduce el tamaño a 12,53 GB, lo que permite ejecutar el modelo en una GPU con 16 GB de VRAM, ampliando su accesibilidad para equipos de consumo.

La cuantización no inventa un esquema propio, sino que replica el layout oficial de Comfy-Org para H3 en NVFP4: cuantiza exactamente las 200 capas marcadas con `.comfy_quant` y deja intactos los 332 tensores restantes. La estructura se verificó contra el archivo oficial con 0 tensores faltantes, 0 extra y 0 discrepancias de forma. El resultado es un modelo nativo para ComfyUI que mantiene la misma salida de 12,53 GB y puede cargarse con el flujo de trabajo estándar de MiniMax-H3.

La relevancia actual de este modelo radica en su capacidad para ejecutar generación de vídeo con audio en hardware de gama media, algo que normalmente requeriría GPUs de mayor memoria. Al ser una cuantización fiel al esquema oficial, ofrece una vía práctica para desplegar 10Eros-Max en entornos de producción o investigación con recursos limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MiniMax-H3 (basado en el modelo base TenStrip/10Eros-Max) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (original en BF16) |
| Idiomas soportados | no disponible |
| Licencia | minimax-h3-community-license-agreement (con licencias adicionales de los modelos donantes: LTX-2.3, Wan 2.2, Krea 2) |
| Formato de pesos | no disponible (cargable con UNETLoader en ComfyUI) |

## Arquitectura y entrenamiento

El modelo es una cuantización NVFP4 de **TenStrip/10Eros-Max**, que a su vez es un injerto sobre la arquitectura MiniMax-H3. Según la descripción del autor, el modelo base incorpora "carácter" (estilo o comportamiento) de LTX-2.3, Wan 2.2 y Krea 2, aunque no se especifican los detalles técnicos del injerto ni el proceso de entrenamiento.

La cuantización sigue un procedimiento documentado: en lugar de diseñar un layout de precisión propio, se copia el esquema del archivo NVFP4 oficial de Comfy-Org para H3. Se identifican las 200 capas que llevan el marcador `.comfy_quant` y se cuantizan a NVFP4, mientras que los otros 332 tensores se pasan sin modificar. El script de horneado (`bake_eros_nvfp4.py`) tarda aproximadamente 24 segundos en una RTX PRO 2000 Blackwell.

No se proporcionan datos sobre el entrenamiento del modelo base (número de tokens, composición del dataset, uso de RLHF o técnicas de alineación). La cuantización no implica reentrenamiento; solo reduce la precisión de los pesos.

## Capacidades

- Generación de vídeo a partir de imágenes (image-to-video) y de texto (text-to-video, según las etiquetas del repositorio).
- Generación de audio sincronizado con el vídeo (la medición de rendimiento incluye "with audio").
- Integración nativa con ComfyUI mediante UNETLoader, CLIPLoader tipo `minimax`, VAE de vídeo/audio H3 y los nodos `MiniMaxH3ImageToVideo`, `MiniMaxH3SigmaShift` y `res_multistep`.
- Cuantización NVFP4 que reduce el tamaño del modelo a menos de un tercio del original, permitiendo su ejecución en GPUs con 16 GB de VRAM.
- Compatibilidad con flujos de trabajo existentes de MiniMax-H3 sin necesidad de modificar la configuración.

## Casos de uso

- **Producción de vídeo de bajo presupuesto**: creadores independientes pueden generar clips de vídeo con audio a partir de imágenes fijas usando hardware de consumo (GPU de 16 GB), sin depender de servicios en la nube.
- **Prototipado rápido para animación**: diseñadores pueden convertir storyboards o ilustraciones en secuencias animadas breves para evaluar dirección artística antes de la producción final.
- **Generación de contenido para redes sociales**: se pueden crear vídeos cortos con audio para plataformas como TikTok o Instagram Reels directamente desde imágenes, con un flujo de trabajo automatizado en ComfyUI.
- **Investigación en generación de vídeo**: el modelo cuantizado permite a investigadores probar el comportamiento de MiniMax-H3 y sus variantes en entornos con recursos limitados, facilitando experimentos de ablación o comparación.
- **Integración en pipelines de postproducción**: al ser cargable con UNETLoader, puede integrarse en sistemas de renderizado por lotes dentro de ComfyUI para generar múltiples variaciones de una escena.
- **Desarrollo de herramientas de asistencia creativa**: desarrolladores pueden construir interfaces que generen vídeo a partir de imágenes de usuario, aprovechando la capacidad de ejecución local y la licencia comunitaria para proyectos no comerciales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (como MMLU, HumanEval o similares) en la información disponible. El modelo está orientado a generación de vídeo, una tarea que no se evalúa con esos benchmarks.

El único dato de rendimiento proporcionado es una medición de inferencia:

| Configuracion | Resultado |
|---|---|
| Resolucion | 480×864 |
| Numero de frames | 145 |
| Pasos | 20 |
| Con audio | Sí |
| Tiempo de inferencia | 16 minutos 39 segundos |
| Hardware | RTX PRO 2000 Blackwell (16 GB) |
| Uso de VRAM | ~12 GB (staging dinamico) |

## Requisitos de hardware

- **VRAM estimada**: aproximadamente 12 GB en modo de staging dinámico, lo que permite ejecución en GPUs con 16 GB de VRAM.
- **GPU recomendada**: RTX PRO 2000 Blackwell (16 GB), según la medición del autor. No se han probado otras GPUs, pero cualquier tarjeta con 16 GB de VRAM y soporte para NVFP4 (arquitecturas Blackwell o posteriores) debería ser compatible.
- **Compatibilidad con consumer GPU**: no se especifica explícitamente, pero las GPUs de consumo con 16 GB (por ejemplo, RTX 4080, RTX 4090) podrían funcionar si soportan NVFP4; se requiere verificación.
- **Opciones de despliegue**: ComfyUI con UNETLoader, usando el flujo de trabajo estándar de MiniMax-H3. No se mencionan otros runners como vLLM, llama.cpp u Ollama, que no son aplicables a modelos de vídeo.
- **Latencia y throughput**: la medición indica 16m39s para 145 frames a 480×864 con 20 pasos, lo que equivale a aproximadamente 6,9 segundos por frame. No se proporcionan datos de throughput en otros escenarios.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. El modelo original TenStrip/10Eros-Max no tiene una ficha técnica pública detallada en este repositorio, y no se mencionan alternativas de la misma categoría. La comparativa queda pendiente de datos adicionales.

## Limitaciones y advertencias

- **Licencia**: se aplica la licencia comunitaria MiniMax-H3, que puede restringir el uso comercial. Además, el autor del modelo base indica que las licencias comunitarias de los modelos donantes (LTX-2.3, Wan 2.2, Krea 2) también aplican a las porciones transferidas de carácter. Es necesario revisar cada licencia antes de cualquier uso en producción.
- **Riesgo de degradación por cuantización**: aunque la cuantización sigue el layout oficial, la reducción de precisión puede afectar la calidad del vídeo o audio generado en comparación con el modelo BF16 original. No se aportan métricas de calidad comparativa.
- **Advertencia del autor sobre `attn_k`**: el autor del modelo base advierte que modificar el tensor `attn_k` puede degradar silenciosamente el audio. En esta cuantización se respeta el layout oficial que cuantiza `qkv_proj` fusionado, pero se recomienda precaución si se realizan modificaciones adicionales.
- **Hardware específico**: la medición de rendimiento se realizó en una RTX PRO 2000 Blackwell; el soporte de NVFP4 en GPUs de consumo más antiguas no está garantizado.
- **Sin información sobre sesgos o alucinaciones**: no se han documentado sesgos conocidos ni comportamientos de alucinación específicos de este modelo.
- **Idiomas**: no se especifican los idiomas soportados, por lo que la generación de audio o texto puede estar limitada a los datos de entrenamiento del modelo base, que no se detallan.

## Enlaces

- Repositorio del modelo: https://huggingface.co/sakamakismile/10Eros-Max-beta2-NVFP4
- Modelo base: https://huggingface.co/TenStrip/10Eros-Max
- Licencia MiniMax-H3: https://huggingface.co/MiniMaxAI/MiniMax-H3/blob/main/LICENSE
