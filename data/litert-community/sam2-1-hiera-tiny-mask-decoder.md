# litert-community/SAM2.1-Hiera-Tiny-Mask-Decoder

## Resumen

SAM2.1-Hiera-Tiny-Mask-Decoder es la conversión a LiteRT/TFLite del decodificador de máscaras del modelo SAM 2.1 Hiera-Tiny de Meta, publicada por la comunidad litert-community. No se trata de un modelo completo de segmentación, sino de la mitad ligera del pipeline de SAM 2: recibe las incrustaciones de imagen generadas por el codificador y un prompt de punto, y devuelve máscaras de segmentación por cada clic del usuario. El codificador de imagen (la mitad pesada) se distribuye por separado.

El modelo está pensado para inferencia totalmente en dispositivo, ejecutándose en la GPU móvil mediante la API `CompiledModel` de LiteRT con el delegado ML Drift. Su arquitectura es un transformer bidireccional de dos capas con atención cruzada token-imagen, seguido de un sobremuestreador de máscaras. Con 17 MB en FP16, permite interacción de "toca para segmentar" con latencias de decenas de milisegundos por clic en teléfonos de gama alta.

La relevancia actual reside en que demuestra un caso realista de segmentación interactiva en el borde sin conexión a la nube, con métricas medidas en dispositivos concretos (Pixel 8a, Galaxy S26) y una corrección técnica documentada sobre un fallo silencioso del delegado GPU que producía máscaras erróneas en la primera versión del artefacto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer bidireccional de 2 capas (atención cruzada token↔imagen) + sobremuestreador de máscaras |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada fija de 1024×1024 en espacio de modelo) |
| Tipos de cuantizacion | FP16 (artefactos `sam2_tiny_mask_decoder_fp16.tflite` y `sam2_tiny_mask_decoder_v2_fp16.tflite`) |
| Idiomas soportados | no disponible (modelo de visión, sin procesamiento de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | TFLite (LiteRT); tamaño 17 MB en FP16 |
| Entradas | `image_embeddings [1,256,64,64]`, `sparse_prompt [1,2,256]`, `feat_s1 [1,64,128,128]`, `feat_s0 [1,32,256,256]` |
| Salidas | `pred_masks [1,3,256,256]` (logits, 3 candidatos multimáscara), `iou_scores [1,3]` |
| Operadores | BATCH_MATMUL ×15, SOFTMAX ×7, GELU ×2, CONV_2D ×2; `banned ops = NONE`, 0 tensores >4-D |
| Modelo base | facebook/sam2.1-hiera-tiny |

## Arquitectura y entrenamiento

El decodificador es la mitad prompt-conditioned del camino de imagen de SAM 2. Consta de un transformer bidireccional de dos capas en el que los tokens de prompt (punto positivo codificado en el host) y los tokens de imagen se atienden mutuamente mediante atención cruzada, seguido de una cabeza que produce tres candidatos de máscara a resolución 256×256 junto con puntuaciones IoU para seleccionar el mejor. La versión `v2` mantiene la dimensión de lote principal en la atención (SDPA de rango 4, `[1, heads, N, d]`), corrección necesaria porque el delegado GPU de LiteRT calculaba mal la forma de rango 3 con el lote colapsado.

No se dispone de información sobre el dataset de entrenamiento, el número de tokens ni si hubo etapas de ajuste por refuerzo o preferencias; esos detalles pertenecen al modelo original de Meta y no se documentan en esta conversión. La innovación técnica destacable es de ingeniería de despliegue: el grafo se ha reescrito para evitar operadores prohibidos por el delegado, mantener todos los tensores en rango ≤4 y excluir las funciones sin/cos del grafo GPU, codificando el prompt en el host con las constantes `posmat [2,128]`, `point_embed[1] [256]` y `no_memory`. La variante de codificador asociada ya incorpora `conv_s0`/`conv_s1` y `no_memory`, de modo que sus salidas son directamente consumibles por este decodificador sin remodelado intermedio.

## Capacidades

- Segmentación interactiva por punto: convierte un clic (coordenada x,y en espacio 1024×1024) en tres máscaras candidatas con puntuación IoU.
- Selección automática de la mejor máscara mediante `argmax` sobre `iou_scores`.
- Segmentación multimáscara: los tres candidatos cubren interpretaciones alternativas del mismo punto (objeto, parte, región).
- Ejecución completa en GPU móvil: 425 de 425 nodos delegados en Pixel 8a con el artefacto `v2`.
- Ejecución en navegador vía LiteRT.js y WebGPU, con reserva a WASM.
- Aceleración por NPU en hardware Qualcomm (delegado QNN/HTP) en Galaxy S26.
- No soporta tool calling, agentes, razonamiento multi-paso ni procesamiento de lenguaje; es un componente puramente visual.
- No soporta audio ni generación de texto.

## Casos de uso

- Edición fotográfica en el móvil: el usuario toca un objeto en la imagen y obtiene una máscara precisa en 10-30 ms por toque, lo que permite selecciones en tiempo real sin enviar la foto a un servidor. El decodificador se ejecuta por cada clic mientras el codificador se ejecuta una sola vez por imagen.
- Recorte y sustitución de fondos en aplicaciones de cámara: tras una pasada del codificador (208 ms en Galaxy S26), cada ajuste del punto de selección cuesta unos 10 ms, suficiente para retroalimentación visual fluida.
- Anotación asistida de datasets: un anotador hace clic sobre el objeto y el modelo propone la máscara; el flujo reduce el tiempo por instancia frente a la delineación manual y funciona sin conexión en portátiles o tablets.
- Herramientas de accesibilidad: selección de regiones de una imagen mediante un único punto, útil en interfaces con entrada limitada (pantallas táctiles pequeñas, control por mirada o conmutadores).
- Procesamiento en el borde con privacidad: aplicaciones médicas o industriales donde la imagen no puede salir del dispositivo; el par codificador-decodificador completo corre localmente en GPU o NPU.
- Demos web sin instalación: integración en páginas con LiteRT.js y WebGPU para segmentación interactiva en el navegador (8,33 ms p50 en un M4 Max con Chromium 151), útil para validación rápida de producto.
- Segmentación por lotes en pipelines de visión: combinado con el codificador, permite generar máscaras para múltiples puntos de interés sobre la misma imagen reutilizando las incrustaciones.

## Benchmarks y rendimiento

Latencias medidas en dispositivo por el autor (edge-compat), en milisegundos p50 por toque:

| Dispositivo / runtime | Artefacto | Latencia p50 | Notas |
|---|---|---|---|
| Galaxy S26, LiteRT 2.2.0, GPU (ML Drift) | `sam2_tiny_mask_decoder_fp16` | 10,1 ms | 2026-08-26 |
| Galaxy S26, LiteRT 2.2.0, GPU (ML Drift) | `sam2_tiny_mask_decoder_v2_fp16` | 10,5 ms | 2026-08-26 |
| Galaxy S26, LiteRT 2.2.0, NPU (QNN/HTP) | `sam2_tiny_mask_decoder_fp16` | 8,08 ms | 2026-08-26 |
| Galaxy S26, LiteRT 2.2.0, NPU (QNN/HTP) | `sam2_tiny_mask_decoder_v2_fp16` | 8,04 ms | 2026-08-26 |
| Pixel 8a, LiteRT 2.2.0, GPU (ML Drift) | `sam2_tiny_mask_decoder_fp16` | 30,1 ms | 378/378 operadores delegados |
| Pixel 8a, LiteRT 2.2.0, GPU (ML Drift) | `sam2_tiny_mask_decoder_v2_fp16` | 30,9 ms | 425/425 operadores delegados |
| Navegador, Chromium 151 en M4 Max, LiteRT.js 2.5.3, WebGPU | `sam2_tiny_mask_decoder_fp16` | 8,33 ms | salida difiere de CPU (diferencia relativa máxima 1e+04) |
| Navegador, Chromium 151 en M4 Max, LiteRT.js 2.5.3, WebGPU | `sam2_tiny_mask_decoder_v2_fp16` | 7,91 ms | diferencia relativa máxima 0,027 frente a CPU |

Datos adicionales de referencia: en Pixel 8a, la ejecución en CPU del mismo decodificador tarda 222,8 ms por toque, frente a 30,9 ms en GPU. El codificador de imagen asociado tarda 208,0 ms en GPU de Galaxy S26, es decir, aproximadamente veinte veces más que el decodificador. En la comparación interna de la versión `v2` frente a la primera compilación, la corrección frente a CPU pasa de correlación 0,265 a 0,9998 e IoU binario 0,999 en la GPU del Pixel 8a, con una mejora de velocidad de aproximadamente el 20 % (6,8 ms frente a 8,5 ms). No se han publicado resultados de benchmarks estándar (mAP de segmentación, MMLU, HumanEval ni similares) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el artefacto FP16 ocupa 17 MB; el consumo real de memoria del delegado GPU no se documenta, pero es del orden de decenas de MB incluyendo búferes intermedios.
- GPU recomendadas: GPU móvil con soporte del delegado ML Drift de LiteRT (Pixel 8a, Galaxy S26 verificados); en escritorio, cualquier GPU compatible con WebGPU para LiteRT.js (verificado en M4 Max).
- Aceleradores adicionales: NPU Qualcomm Hexagon vía QNN/HTP (verificado en Galaxy S26 con 8,04 ms p50).
- Cabe en GPU de consumo: sí, por tamaño; el requisito real es el soporte del runtime LiteRT y del delegado, no la capacidad de memoria.
- Opciones de despliegue: LiteRT `CompiledModel` (GPU y NPU), LiteRT.js con WebGPU y reserva WASM en navegador. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo de visión de este tipo.
- Latencia y throughput: 8-10 ms por toque en Galaxy S26 (GPU y NPU), 30,9 ms en Pixel 8a GPU, 7,91 ms en navegador con WebGPU en M4 Max. El coste dominante del pipeline es el codificador (208 ms en Galaxy S26), que se ejecuta una vez por imagen.
- Requisito de emparejamiento: necesita el codificador de imagen `litert-community/SAM2.1-Hiera-Tiny-Image-Encoder` y la codificación del prompt en el host con las constantes empaquetadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entrada | Licencia | Despliegue | Notas |
|---|---|---|---|---|---|
| SAM2.1-Hiera-Tiny-Mask-Decoder (este) | no disponible (17 MB FP16) | imagen 1024×1024, decodificador por punto | Apache-2.0 | LiteRT GPU/NPU, navegador | Decodificador aislado; requiere el codificador aparte |
| facebook/sam2.1-hiera-tiny | no disponible | imagen 1024×1024, pipeline completo | Apache-2.0 | PyTorch, ONNX | Modelo original de Meta; no optimizado para GPU móvil |
| SAM 2.1 Hiera-Tiny Image Encoder (litert-community) | no disponible | pirámide de características multiescala | Apache-2.0 | LiteRT GPU | Mitad pesada del mismo pipeline (208 ms en Galaxy S26) |
| SAM 2 original (Meta) | no disponible | imagen, promptable | Apache-2.0 | PyTorch | Predecesor; SAM 2.1 incorpora mejoras de precisión en vídeo e imagen |

No se dispone de datos de benchmarks comparativos entre estos modelos en la información proporcionada, por lo que la comparación se limita a parámetros de despliegue, licencia y disponibilidad.

## Limitaciones y advertencias

- No es un modelo autónomo: sin el codificador de imagen y la codificación de prompt en el host no produce resultados; la documentación asume ese emparejamiento.
- Solo admite un punto positivo por invocación en el flujo documentado; no se describe soporte de cajas, máscaras previas ni puntos negativos en esta conversión.
- La primera compilación (`sam2_tiny_mask_decoder_fp16.tflite`) devolvía máscaras silenciosamente erróneas en la GPU del Pixel 8a (correlación 0,265 frente a CPU) pese a delegar todos los nodos; debe usarse `v2`. El fallo no era de precisión FP16 ni de LayerNorm, sino de forma tensorial en la atención.
- En navegador con WebGPU, la salida difiere de la CPU: la compilación antigua muestra una diferencia relativa máxima de 1e+04, lo que indica inestabilidad numérica grave; la `v2` la reduce a 0,027, pero sigue sin ser paridad exacta.
- Riesgo de máscaras incorrectas sin verificación numérica en dispositivo: el autor advierte que un grafo hermano correcto (el codificador) no garantiza que el decodificador lo sea; es necesario comparar GPU frente a CPU en el hardware objetivo.
- No se documentan sesgos del modelo; al ser un segmentador visual, los sesgos potenciales provendrían del dataset de entrenamiento original de SAM 2.1, no descrito aquí.
- Licencia Apache-2.0: permite uso comercial y modificación con atribución; no se especifican restricciones adicionales en la información disponible.
- No hay datos publicados de robustez ante imágenes de dominios alejados del entrenamiento (médicas, satelitales, microscopía) ni de comportamiento con prompts ambiguos.
- El repositorio figura con 0,0 GB de tamaño y 328 descargas, con 0 likes; la madurez de la comunidad en torno al artefacto es baja.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/litert-community/SAM2.1-Hiera-Tiny-Mask-Decoder
- Codificador de imagen asociado: https://huggingface.co/litert-community/SAM2.1-Hiera-Tiny-Image-Encoder
- Modelo base: https://huggingface.co/facebook/sam2.1-hiera-tiny
- Demo interactiva en el navegador: https://huggingface.co/spaces/litert-community/sam2-1-tiny-click-to-segment
- Registro de mediciones edge-compat (v1): https://github.com/john-rocky/edge-compat/blob/main/cards/sam2.1-hiera-tiny-mask-decoder__sam2_tiny_mask_decoder_fp16/CARD.md
- Registro de mediciones edge-compat (v2): https://github.com/john-rocky/edge-compat/blob/main/cards/sam2.1-hiera-tiny-mask-decoder__sam2_tiny_mask_decoder_v2_fp16/CARD.md
- LiteRT.js en npm: https://www.npmjs.com/package/@litertjs/core
- Paper de SAM 2: https://arxiv.org/abs/2408.00714
