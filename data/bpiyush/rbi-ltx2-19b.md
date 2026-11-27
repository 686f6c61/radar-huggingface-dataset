# bpiyush/RBI-LTX2-19B

## Resumen

RBI-LTX2-19B es un adaptador IC-LoRA (rank 64, alpha 64) para el modelo de generación de vídeo Lightricks/LTX-2, publicado por Piyush Bagad junto con Makarand Tapaswi y Andrew Zisserman en el marco del trabajo "Recognition-by-Imagination: A Generative Approach to Form-from-Motion". El adaptador convierte secuencias de keypoints corporales estilo Johansson (puntos blancos sobre fondo neutro) en vídeo RGB generado, es decir, produce una realización imaginada del movimiento y no una reconstrucción de la persona ni del entorno originales.

El checkpoint publicado corresponde al paso 3000 de entrenamiento sobre el split NTU14K (14.082 pares RGB + keypoints seleccionados de NTU antes de los filtros de preprocesado). Se entrena sobre los pesos dev de LTX-2 19B y se infiere intencionadamente sobre los pesos distilled, con un esquema de ocho pasos, semilla 42 y una única etapa (sin etapa de upsampling ni audio).

Es relevante porque propone un enfoque generativo para el reconocimiento de acciones: en lugar de clasificar directamente sobre keypoints, el modelo "imagina" el vídeo RGB subyacente y permite evaluar la acción a partir de esa síntesis. El adaptador no es un modelo completo: requiere el base distilled de LTX-2 y el codificador de texto Gemma 3 12B QAT no cuantizado para funcionar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador IC-LoRA sobre LTX-2 (modelo base de generación de vídeo con transformer de difusión y VAE) |
| Parametros totales | no disponible (el adaptador pesa 654.443.424 bytes en bfloat16; el base es LTX-2 19B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (longitud temporal en buckets de 33, 49, 65, 81, 97 y 121 frames latentes) |
| Tipos de cuantizacion | no disponible para el adaptador; se distribuye en bfloat16. El codificador de texto requiere Gemma 3 12B QAT no cuantizado |
| Idiomas soportados | en (inglés) |
| Licencia | LTX-2 Community License (license_name: ltx-2-community) |
| Formato de pesos | safetensors (`rbi-ntu14k-step3000.safetensors`) |

## Arquitectura y entrenamiento

El adaptador es un IC-LoRA de rango 64 y alpha 64 acoplado a LTX-2, un modelo de generación de vídeo de Lightricks. El entrenamiento parte del transformer dev de LTX-2 19B (`ltx-2-19b-dev.safetensors`) y utiliza el VAE distilled para extraer latentes. Los datos de entrenamiento son el split NTU14K con 14.082 pares de vídeo RGB y keypoints corporales de NTU, tras aplicar los filtros de preprocesado. El RGB se recorta con una unión fija de todas las personas detectadas a lo largo del vídeo y se letterboxea a 480 × 832 antes de la extracción de DWPose; los keypoints se representan como puntos blancos de radio 6, sin caras, manos, huesos, colores ni seguimiento temporal.

El ajuste fino usa learning rate 0,0002, batch size 1 con acumulación 4, muestreo de timesteps shifted-logit-normal y 3.000 pasos de optimizador. Los latentes emplean buckets temporales de 33, 49, 65, 81, 97 y 121. La inferencia se realiza sobre los pesos distilled (`ltx-2-19b-distilled.safetensors`) con el schedule distilled de ocho pasos, semilla 42, solo etapa uno, sin audio, fuerza de referencia 1 y un prompt fijo: "Observe the provided body keypoints and imagine a person(s) naturally performing the depicted movement. Full body visible, bright lightning, static camera." La salida de la etapa uno es de 256 × 416 píxeles; el padding temporal se rellena repitiendo el último frame hasta el siguiente 8k+1 y se recorta al guardar. El adaptador incluye metadatos con `reference_downscale_factor=1`.

## Capacidades

- Generación de vídeo RGB a partir de secuencias de keypoints corporales (form-from-motion).
- Reconocimiento de acciones por imaginación: síntesis de una realización plausible del movimiento para su posterior análisis.
- Conversión video-to-video en el pipeline declarado (entrada de keypoints, salida RGB).
- Generación de movimiento humano completo con cámara estática y fondo neutro según el prompt fijado.
- Soporte de distintos buckets temporales (33 a 121 frames latentes) para distintas duraciones.
- No soporta audio en esta receta de inferencia.
- No soporta tool calling, function calling ni razonamiento multi-step de agentes (no es un modelo de lenguaje).
- Capacidades multilingües limitadas al inglés en el prompt y al codificador Gemma 3 12B.

## Casos de uso

- Reconocimiento de acciones sobre esqueletos: dado un vídeo de keypoints, generar el RGB imaginado y clasificar la acción a partir de la síntesis; adecuado porque el adaptador se entrenó específicamente sobre NTU14K para el protocolo de acciones vistas NTU525.
- Investigación en percepción de movimiento (form-from-motion): estudiar cómo un modelo generativo reconstruye la apariencia a partir de información puramente cinemática.
- Aumento de datos sintéticos: generar vídeos RGB plausibles a partir de keypoints anotados para ampliar datasets de visión por computador.
- Evaluación de pipelines de pose: comparar la calidad de keypoints detectados (DWPose) observando la fidelidad del vídeo generado resultante.
- Prototipado de animación a partir de captura de movimiento: convertir mocap de bajo coste en vídeo RGB de referencia para previsualización.
- Docencia y divulgación: ilustrar el problema de form-from-motion con ejemplos generados controlados (cámara estática, fondo neutro, cuerpo completo).
- Benchmarking de adaptadores LoRA sobre modelos de vídeo: servir como referencia reproducible (semilla 42, ocho pasos, prompt fijo) para estudiar el efecto de IC-LoRA en LTX-2.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que las pruebas de humo del release no añaden afirmaciones cuantitativas de rendimiento.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; el adaptador ocupa 654.443.424 bytes (unos 0,65 GB) en bfloat16, pero requiere además el base LTX-2 19B distilled y el codificador Gemma 3 12B QAT.
- GPU recomendadas: no disponibles en la información proporcionada.
- Compatibilidad con GPU de consumo: no disponible; el tamaño combinado del base (19B) y del codificador (12B) sugiere requisitos elevados, pero no se aportan cifras.
- Opciones de despliegue: el release indica el CLI propio `python -m rbi.infer` (y `python -m rbi.download`), con decodificación VAE en configuración tiled por defecto. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto / duracion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RBI-LTX2-19B (este) | IC-LoRA video-to-video sobre LTX-2 | Adaptador 0,65 GB sobre base 19B | Buckets de 33 a 121 frames latentes; salida 256 × 416 | LTX-2 Community License | Hugging Face (repo público) |
| Lightricks/LTX-2 | Modelo base de generación de vídeo | 19B | no disponible en esta ficha | LTX-2 Community License | Hugging Face |
| Adaptador NTU7K (mismo trabajo) | IC-LoRA para protocolo de acciones novel | no disponible | no disponible | LTX-2 Community License | No liberado en este repo |

No se dispone de datos de benchmarks que permitan comparar rendimiento con alternativas.

## Limitaciones y advertencias

- El adaptador no es un modelo completo: sin el base distilled de LTX-2 y Gemma 3 12B QAT no cuantizado no puede ejecutarse; el acceso a Gemma puede requerir aceptar sus términos.
- El vídeo generado es una realización imaginada del movimiento, no una reconstrucción de la persona ni del entorno originales; no debe interpretarse como evidencia visual del sujeto real.
- El adaptador NTU14K es válido para el protocolo de acciones vistas NTU525, pero no es el checkpoint de acciones retenidas para NTU250 (NTU14K incluye esas clases); el protocolo de acciones novel requiere el split/checkpoint NTU7K, no incluido aquí.
- La receta de inferencia es rígida: prompt fijo, semilla 42, ocho pasos, solo etapa uno, sin audio y sin etapa de upsampling; desviarse de esta configuración puede degradar los resultados.
- Resolución de salida limitada a 256 × 416 en la etapa uno.
- Entrenado exclusivamente sobre NTU con cámara estática y fondo neutro; probablemente no generaliza a escenas dinámicas, múltiples cámaras o dominios distintos.
- Idioma de prompt limitado al inglés.
- Licencia LTX-2 Community: es un derivado de LTX-2 y está sujeto a todas las restricciones y políticas de dicha licencia; el uso comercial debe verificarse contra el texto de `LICENSE`. El base, el codificador de texto y los datasets conservan sus propios términos.
- Riesgo de alucinación visual: el modelo puede generar apariencias, ropa o contextos plausibles pero incorrectos.
- No se incluyen vídeos originales de NTU ni pesos de Gemma en el repositorio; el código de inferencia (`rbi.download`, `rbi.infer`) está en preparación y la model card no garantiza una URL pública antes de su publicación.
- Sin métricas cuantitativas publicadas: no hay evidencia numérica de calidad en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/bpiyush/RBI-LTX2-19B
- Página del proyecto: https://bpiyush.github.io/johansson/
- Modelo base: https://huggingface.co/Lightricks/LTX-2
- Codificador de texto: https://huggingface.co/google/gemma-3-12b-it-qat-q4_0-unquantized
