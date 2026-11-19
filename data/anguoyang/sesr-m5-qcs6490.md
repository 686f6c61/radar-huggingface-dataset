# anguoyang/sesr-m5-qcs6490

## Resumen

SESR-M5 es un modelo de superresolución de imagen (upscaling 4x) que forma parte del catálogo de modelos de referencia de Qualcomm AI Hub, definido en el paquete `qai-hub-models` (versión 0.66.0). La ficha que nos ocupa, publicada por el usuario anguoyang, no distribuye pesos ni artefactos compilados: es una medición independiente de terceros del rendimiento del modelo sobre el SoC Qualcomm QCS6490, montado en el kit Dragonwing RB3 Gen 2 Vision Kit. El objetivo declarado es aportar un punto de referencia en fp32 bajo un protocolo uniforme, complementando las entradas cuantizadas que ya figuran en el `perf.yaml` upstream.

El modelo resuelve la tarea clásica de superresolución: recibe una imagen RGB de 1×3×128×128 y produce una salida de 1×3×512×512, es decir, un factor de escala 4x. La medición publicada reporta un tiempo de inferencia estimado de 40,4 ms (40.357 µs) ejecutando el grafo ONNX en fp32 con las opciones de compilación por defecto de AI Hub, sin cuantización explícita. No se aportan datos sobre arquitectura interna, número de parámetros, licencia propia del artefacto publicado ni idiomas, más allá de la licencia upstream BSD-3-Clause que se cita.

La relevancia de esta ficha es acotada pero útil: no documenta un modelo nuevo, sino un punto de medida reproducible sobre hardware edge concreto (QCS6490), con identificadores de job de Qualcomm AI Hub (compilación `j5wrkrwmp`, perfilado `jg9qrq08p`) que permiten auditar el resultado. Es material de referencia para quien evalúe despliegues de superresolución en dispositivos con NPU Hexagon de gama media.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de superresolución 4x; grafo ONNX exportado desde `qai-hub-models` 0.66.0) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de lenguaje) |
| Tipos de cuantizacion | fp32 en esta medición; el `perf.yaml` upstream lista variantes cuantizadas para RB3, sin detallar en la información disponible |
| Idiomas soportados | no aplica / no disponible |
| Licencia | upstream BSD-3-Clause; la ficha publicada no especifica licencia propia para los datos de medición |
| Formato de pesos | ONNX (1.381.401 bytes en la exportación utilizada); no se publican pesos |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo (número de capas, tipo de bloques, mecanismos de atención o convolución, estrategia de upsampling) ni sobre el dataset de entrenamiento, el número de tokens o imágenes vistas, o si se aplicaron técnicas de destilación o ajuste fino. La única información técnica disponible es la relativa al artefacto exportado: un grafo ONNX de 1.381.401 bytes generado desde la definición `sesr_m5` del paquete `qai-hub-models` 0.66.0, con entrada NCHW (1×3×128×128) y salida NCHW (1×3×512×512).

El detalle metodológico relevante es que el primer intento de exportación falló porque las entradas de muestra se alimentaban en formato channel-last (NHWC); se corrigió solicitando channel-first (NCHW), tras lo cual la exportación se completó sin cambios adicionales. La medición se realizó mediante un perfil de grafo único a través de la API de Qualcomm AI Hub (`submit_inference_job(..., profile=True)`), tomando el valor `execution_summary.estimated_inference_time` del job de perfilado. Se trata, por tanto, de una estimación por grafo y no de una latencia extremo a extremo de aplicación.

## Capacidades

- Superresolución de imagen con factor de escala 4x: transforma una entrada RGB de 128×128 píxeles en una salida de 512×512 píxeles.
- Ejecución en hardware edge con aceleración NPU: el modelo está compilado y perfilado para el SoC Qualcomm QCS6490 mediante el runtime QNN.
- Exportación a ONNX para su despliegue en pipelines de Qualcomm AI Hub.
- Perfilado de rendimiento por grafo con la API de AI Hub, lo que permite obtener estimaciones de tiempo de inferencia reproducibles.
- No se documentan capacidades de generación de texto, razonamiento, código, matemáticas, tool calling, agentes, multilingüismo, audio ni visión general más allá del upscaling.

## Casos de uso

- Restauración de imágenes en cámaras embebidas: el modelo puede aplicarse a fotogramas de baja resolución capturados por sensores de bajo coste en dispositivos IoT, generando salidas 512×512 con un coste estimado de 40,4 ms por imagen en el QCS6490.
- Previsualización de alta resolución en visores y pantallas de dispositivos edge: permite mostrar contenido ampliado sin transmitir la imagen completa desde el sensor, reduciendo ancho de banda en enlaces limitados.
- Upscaling en tiempo casi real en kits de visión (Dragonwing RB3 Gen 2): con ~40 ms por fotograma, el modelo es viable para flujos de vídeo de baja cadencia o procesamiento por lotes en el propio dispositivo.
- Mejora de imágenes médicas o de inspección industrial de baja resolución: la ampliación 4x puede facilitar la revisión visual previa en campo antes de un análisis más profundo en servidor.
- Benchmarking y selección de modelos para despliegues edge: sirve como punto de referencia fp32 para comparar con variantes cuantizadas del mismo modelo y con otros modelos de superresolución del barrido de 28 modelos y 14 categorías.
- Validación de pipelines de compilación QNN/AI Hub: los identificadores de job publicados permiten reproducir la compilación y el perfilado como prueba de humo en integraciones de CI para hardware Qualcomm.
- Telemetría y monitorización visual remota: ampliación de miniaturas o recortes de baja resolución en cámaras de vigilancia con recursos limitados, manteniendo el procesamiento en el dispositivo.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Tiempo de inferencia estimado | 40,4 ms (40.357 µs) |
| Entrada | 1 × 3 × 128 × 128 |
| Salida | 1 × 3 × 512 × 512 |
| Dispositivo | Dragonwing RB3 Gen 2 Vision Kit (QCS6490) |
| Runtime | QNN |
| Precisión | fp32 ONNX, opciones de compilación por defecto de AI Hub (sin cuantización explícita) |
| Fecha de medición | 2026-11-19 |
| Job de compilación | `j5wrkrwmp` |
| Job de perfilado | `jg9qrq08p` |

No se han publicado resultados de benchmarks estándar (PSNR, SSIM, LPIPS u otras métricas de calidad de imagen) en la información disponible. La cifra de 40,4 ms corresponde a una estimación por grafo único y no a latencia extremo a extremo de aplicación; el autor advierte explícitamente que no es directamente comparable con las entradas cuantizadas del `perf.yaml` upstream.

## Requisitos de hardware

- VRAM/ memoria: no disponible. El modelo está pensado para ejecución en NPU de dispositivo (QCS6490), no en GPU de escritorio; el tamaño del grafo ONNX es de 1.381.401 bytes.
- Hardware de referencia: Qualcomm QCS6490 (Dragonwing RB3 Gen 2 Vision Kit), con runtime QNN.
- GPU recomendadas: no aplica; el despliegue medido es sobre NPU Hexagon del SoC. No se documentan requisitos para A100, H100 o RTX 4090.
- Compatibilidad con GPU de consumo: no disponible; no se ha medido en GPUs de consumo.
- Opciones de despliegue: Qualcomm AI Hub (compilación y perfilado), runtime QNN, exportación ONNX. No se documenta soporte de vLLM, llama.cpp, Ollama o TGI (no aplicables a un modelo de visión de este tipo).
- Latencia y throughput: 40,4 ms por imagen de 128×128 a 512×512 en fp32 sobre QCS6490; el throughput equivalente es de aproximadamente 24,8 imágenes por segundo en condiciones de perfilado por grafo.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye resultados de otros modelos de superresolución medidos bajo el mismo protocolo, más allá de la mención genérica a un barrido de 28 modelos y 14 categorías cuyos datos no se detallan. Tampoco se aportan cifras de las variantes cuantizadas de SESR-M5 listadas en el `perf.yaml` upstream, por lo que no es posible establecer una comparación numérica directa.

## Limitaciones y advertencias

- La ficha no publica pesos ni artefactos compilados: solo contiene números de medición y metodología, por lo que no es directamente desplegable a partir de este repositorio.
- La cifra de 40,4 ms es una estimación de perfilado por grafo único (`estimated_inference_time`), no una latencia extremo a extremo de aplicación; el rendimiento real en producción puede diferir.
- El resultado corresponde a fp32 y no es directamente comparable con las entradas cuantizadas del `perf.yaml` upstream, tal como advierte el propio autor.
- No se dispone de información sobre sesgos, riesgo de alucinación (no aplica a un modelo de superresolución) ni limitaciones de idioma.
- La licencia del modelo upstream es BSD-3-Clause, pero la ficha no especifica la licencia aplicable a los datos de medición publicados; conviene verificar antes de reutilizarlos.
- El modelo está medido exclusivamente en el QCS6490; no hay datos de rendimiento en otros SoC, GPUs o aceleradores.
- No se documentan métricas de calidad de imagen (PSNR, SSIM), por lo que no es posible evaluar la fidelidad del upscaling a partir de esta ficha.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que indica una validación comunitaria nula.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/anguoyang/sesr-m5-qcs6490
- Colección de modelos medidos qcs-model-zoo: https://github.com/anguoyang/qcs-model-zoo
- Seguimiento del barrido completo qcs-bench: https://github.com/anguoyang/qcs-bench
- Paquete `qai-hub-models` (definición del modelo `sesr_m5`, versión 0.66.0): no disponible como enlace directo en la información proporcionada
- Documentación de Qualcomm AI Hub: no disponible como enlace directo en la información proporcionada
