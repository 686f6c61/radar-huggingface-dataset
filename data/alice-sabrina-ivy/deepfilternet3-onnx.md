# Alice-Sabrina-Ivy/deepfilternet3-onnx

## Resumen

DeepFilterNet 3 (ONNX) es un espejo no modificado de los tres grafos ONNX del modelo de supresión de ruido y mejora de voz DeepFilterNet 3, desarrollado originalmente por Hendrik Schröter y colaboradores en el repositorio Rikorose/DeepFilterNet. Este repositorio concreto, publicado por Alice-Sabrina-Ivy, no introduce cambios en los ficheros: se limita a alojar `enc.onnx`, `erb_dec.onnx` y `df_dec.onnx`, extraídos del archivo oficial `DeepFilterNet3_onnx.tar.gz` del commit `d375b2d8309e0935d165700c91da9de862a99c31`, con sumas de verificación sha256 documentadas para cada fichero.

El modelo resuelve el problema de la mejora de voz en tiempo real: elimina ruido de fondo y artefactos de una señal de audio manteniendo la inteligibilidad del habla. Es relevante porque su diseño está pensado para ejecutarse con latencia baja en entornos con recursos limitados, incluido el navegador mediante ONNX Runtime Web, que es precisamente el uso que le da la aplicación Syrinx del autor del espejo.

La arquitectura combina un codificador con un decodificador ERB (escala de bandas equivalente rectangular) y un decodificador de filtrado profundo, repartidos en los tres grafos ONNX. El repositorio no incluye pesos en formato safetensors ni GGUF, sino exclusivamente grafos ONNX, y su tamaño total es de aproximadamente 8 MB comprimidos. La licencia es doble MIT o Apache-2.0, a elección del usuario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DeepFilterNet 3: codificador + decodificador ERB + decodificador de filtrado profundo (tres grafos ONNX) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de audio, procesa tramas de señal) |
| Tipos de cuantizacion | no disponible (se distribuyen grafos ONNX sin cuantizar documentada) |
| Idiomas soportados | no disponible (procesamiento de voz independiente del idioma) |
| Licencia | MIT OR Apache-2.0, a elección |
| Formato de pesos | ONNX (`enc.onnx`, `erb_dec.onnx`, `df_dec.onnx`) |

## Arquitectura y entrenamiento

DeepFilterNet 3 es un modelo de mejora de voz perceptualmente motivado. La inferencia se reparte en tres grafos: `enc.onnx` (1.954.042 bytes) actúa como codificador de la señal, `erb_dec.onnx` (3.292.397 bytes) implementa el decodificador en escala ERB y `df_dec.onnx` (3.340.803 bytes) implementa el decodificador de filtrado profundo que aplica la máscara de filtrado sobre el espectro. El modelo original se describe en el artículo "DeepFilterNet: Perceptually Motivated Real-Time Speech Enhancement" (Schröter, Rosenkranz, Escalante-B., Maier, INTERSPEECH 2023), citado en el README del repositorio upstream.

No se dispone en la información proporcionada de detalles sobre el número de tokens o horas de audio de entrenamiento, la composición del dataset, ni si se emplearon técnicas de ajuste fino con RLHF o DPO. Tampoco se documentan innovaciones adicionales más allá del diseño de filtrado profundo en escala ERB y la orientación a tiempo real. Los ficheros se distribuyen sin modificar respecto al export oficial, verificado mediante sha256 (`c94d91f7...` para el archivo completo y hashes individuales por grafo).

## Capacidades

- Supresión de ruido de fondo en señales de voz (noise suppression).
- Mejora de voz (speech enhancement) con preservación de la inteligibilidad.
- Procesamiento audio-a-audio: recibe audio ruidoso y devuelve audio limpio.
- Ejecución en navegador mediante ONNX Runtime Web, según el caso de uso documentado por el autor del espejo.
- Inferencia de baja latencia orientada a tiempo real.
- Independencia del idioma en la medida en que opera sobre características acústicas, aunque no se documenta una lista de idiomas.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso ni modos de pensamiento.

## Casos de uso

- Videollamadas y conferencias web: el modelo puede integrarse en el pipeline de captura de micrófono para eliminar ruido ambiental antes de codificar el audio, gracias a su formato ONNX y a su ejecución en navegador con ONNX Runtime Web.
- Aplicaciones web de edición de voz: la aplicación Syrinx lo emplea en su función Voice Shaper para reducir ruido en grabaciones de usuario; el espejo proporciona una URL fija y verificable para la carga en tiempo de ejecución.
- Preprocesado para ASR: limpiar la señal antes de enviarla a un sistema de reconocimiento automático del habla reduce errores en entornos ruidosos, y el bajo tamaño de los grafos facilita el despliegue en el borde.
- Reuniones y transcripción en tiempo real: al procesar tramas de audio con baja latencia, puede insertarse delante del motor de transcripción sin introducir retardo perceptible.
- Herramientas de accesibilidad: mejora de la señal de micrófono en aplicaciones de comunicación para personas con dificultades auditivas o entornos ruidosos.
- Pipelines de investigación en mejora de voz: servir como línea base reproducible, con hashes verificables, para comparar con otros modelos de supresión de ruido.
- Aplicaciones móviles o de escritorio offline: al ser grafos ONNX de pocos megabytes, pueden empaquetarse en aplicaciones que ejecutan inferencia local sin conexión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; por el tamaño de los grafos (en torno a 8 MB en total) el consumo de memoria es reducido y compatible con ejecución en CPU.
- GPU recomendadas: no se documentan requisitos específicos; el modelo está pensado para ejecución ligera y en navegador, por lo que no requiere GPU dedicada.
- Compatibilidad con GPU de consumo: previsiblemente sí, dado el tamaño, aunque no se aportan cifras de VRAM ni de rendimiento.
- Opciones de despliegue: ONNX Runtime (incluida la variante web), integración en aplicaciones mediante los tres grafos; no se documenta soporte para vLLM, llama.cpp, Ollama o TGI, que no son aplicables a este tipo de modelo.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Formato | Licencia | Contexto/ventana | Disponibilidad |
|---|---|---|---|---|---|
| DeepFilterNet 3 (este espejo) | Mejora de voz | ONNX | MIT OR Apache-2.0 | no aplica | Hugging Face (espejo) y GitHub upstream |
| DeepFilterNet (upstream) | Mejora de voz | Pesos originales y export ONNX | MIT OR Apache-2.0 | no aplica | GitHub Rikorose/DeepFilterNet |
| Otros modelos de supresión de ruido | Mejora de voz | no disponible | no disponible | no aplica | no disponible |

No se dispone en la información proporcionada de datos de rendimiento ni de especificaciones de modelos alternativos que permitan una comparación cuantitativa.

## Limitaciones y advertencias

- Este repositorio es un espejo no modificado: no debe citarse como trabajo original ni atribuirse al autor del espejo.
- No se documentan sesgos conocidos, pero al ser un modelo de audio entrenado con datos no descritos, su comportamiento puede degradarse con tipos de ruido no representados en el entrenamiento.
- Riesgo de artefactos o distorsión en la señal de voz cuando la relación señal-ruido es muy baja o el ruido es no estacionario.
- No se documentan limitaciones de idioma, pero tampoco se garantiza un rendimiento uniforme entre lenguas y acentos.
- La licencia doble MIT o Apache-2.0 permite uso comercial, pero conviene conservar los avisos de licencia y verificar los ficheros con `sha256sum` antes de desplegarlos.
- Al ser grafos ONNX sin cuantización documentada, el rendimiento puede variar según el backend y el hardware; no se aportan métricas de latencia.
- Para documentación, código de entrenamiento y versiones más recientes debe acudirse al repositorio upstream, no a este espejo.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Alice-Sabrina-Ivy/deepfilternet3-onnx
- Repositorio upstream: https://github.com/Rikorose/DeepFilterNet
- Commit upstream: https://github.com/Rikorose/DeepFilterNet/tree/d375b2d8309e0935d165700c91da9de862a99c31
- Aplicación Syrinx: https://github.com/Alice-Sabrina-Ivy/Syrinx
- Artículo de referencia: H. Schröter, T. Rosenkranz, A. N. Escalante-B., A. Maier, "DeepFilterNet: Perceptually Motivated Real-Time Speech Enhancement", INTERSPEECH 2023 (citado en el README upstream).
