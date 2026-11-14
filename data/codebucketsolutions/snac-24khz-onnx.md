# codebucketsolutions/snac-24khz-onnx

## Resumen

SNAC 24 kHz decoder (ONNX) es la exportación a formato ONNX del decodificador del códec neuronal de audio SNAC (Multi-Scale Neural Audio Codec) de 24 kHz, desarrollado originalmente por Hubert Siuzdak bajo licencia MIT. El modelo lo publica el usuario codebucketsolutions y su función es decodificar los tokens de audio discretos que generan los modelos de texto-a-voz de estilo Orpheus (Orpheus, Veena, Svara, snorTTS) y reconstruir la forma de onda a 24 kHz sin necesidad de ejecutar PyTorch en tiempo de inferencia.

El artefacto no es un modelo generativo de lenguaje, sino un componente de inferencia de un pipeline TTS: recibe tres flujos de códigos enteros con relaciones de escala 1:2:4 y devuelve audio float32. La exportación se realizó con el script `tools/export_snac_onnx.py` del servidor de voz bolo, y se distribuyen dos variantes de precisión: fp32 (52,6 MB) y fp16 (26,4 MB).

Su relevancia práctica radica en que elimina la dependencia del stack de PyTorch en producción, algo útil para despliegues ligeros, entornos embebidos o servicios donde se quiere minimizar el peso de las dependencias. El repositorio ocupa 0,1 GB y no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decodificador de códec neuronal de audio SNAC (multi-escala), exportado a ONNX |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; entrada `codes_0` `[B, T]`, `codes_1` `[B, 2T]`, `codes_2` `[B, 4T]` |
| Tipos de cuantizacion | fp32 y fp16 (int8 no soportada: produce ruido audible) |
| Idiomas soportados | no aplica (modelo de audio, no de texto) |
| Licencia | MIT (hereda la licencia de los pesos originales de SNAC, Copyright (c) 2024 Hubert Siuzdak) |
| Formato de pesos | ONNX (`snac_24khz_decoder.onnx`, `snac_24khz_decoder_fp16.onnx`) |

## Arquitectura y entrenamiento

El modelo es un decodificador de códec neuronal de audio basado en el esquema multi-escala de SNAC, que trabaja con tres niveles de códigos cuantizados con relaciones temporales 1:2:4 (T, 2T y 4T) y un vocabulario de 4096 entradas por nivel (rango 0..4095, int64). La salida es una señal mono float32 a 24 kHz con `2048·T` muestras por lote, es decir, un factor de sobremuestreo de 2048 muestras por paso temporal del nivel más grueso.

No se trata de un modelo entrenado por el autor de esta ficha: los pesos proceden de SNAC 24 kHz de Hubert Siuzdak (revisión `d73ad176a12188fcf4f360ba3bf2c2fbbe8f58ec`) y aquí solo se han convertido a ONNX. La model card indica que los bloques de ruido del decodificador se conservan con comportamiento aleatorio, igual que en la implementación de PyTorch, y que la validación numérica frente a PyTorch se realizó desactivando el término de ruido en ambos lados (resultados en `snac_onnx.json`). No se documentan datos de entrenamiento, número de tokens ni procesos de RLHF o DPO, porque no aplican a un artefacto de exportación.

## Capacidades

- Decodificación de códigos de audio discretos a forma de onda PCM float32 a 24 kHz.
- Entrada multi-escala con tres flujos de códigos (`codes_0`, `codes_1`, `codes_2`) de longitudes T, 2T y 4T.
- Procesamiento por lotes (`B`) y por secuencia (`T`) en una sola pasada.
- Ejecución sin PyTorch: solo requiere un runtime ONNX.
- Dos precisiones disponibles: fp32 para máxima fidelidad y fp16 para reducir huella a la mitad.
- Integración directa como etapa final de pipelines TTS de estilo Orpheus (Orpheus, Veena, Svara, snorTTS).
- No incluye tool calling, agentes, razonamiento multi-paso ni capacidades multilingües de texto: es un componente puramente de audio.

## Casos de uso

- Servicio TTS en producción sin PyTorch: se sustituye el decodificador de referencia por el grafo ONNX y se ejecuta con ONNX Runtime, reduciendo el tamaño de la imagen de contenedor y el tiempo de arranque en comparación con un stack completo de PyTorch.
- Despliegue en entornos con recursos limitados: la variante fp16 (26,4 MB) permite alojar el decodificador en dispositivos de borde o en instancias pequeñas donde cargar PyTorch no es viable.
- Integración en pipelines de agentes de voz: los modelos Orpheus generan códigos de audio y este decodificador los convierte en audio reproducible en el mismo proceso, sin cambiar de runtime entre etapas.
- Servidores de voz autoalojados: el proyecto de origen (bolo speech server) usa este artefacto como etapa de síntesis; es adecuado para despliegues on-premise que requieren control total sobre las dependencias.
- Procesamiento por lotes de síntesis: la dimensión de lote `B` permite decodificar varias secuencias de códigos simultáneamente en una sola llamada al runtime.
- Prototipado e investigación en códecs neuronales: sirve para estudiar el comportamiento del decodificador SNAC en distintos runtimes o para comparar fp32 frente a fp16 sin reinstalar el entorno de PyTorch.
- Portabilidad entre plataformas: al ser ONNX, el mismo grafo se ejecuta en CPU, GPU o aceleradores compatibles con el estándar, lo que facilita mover la síntesis de voz entre backends.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo documenta una comprobación de equivalencia numérica frente a PyTorch con el término de ruido desactivado en ambos lados (referencia a `snac_onnx.json`), sin cifras de latencia, throughput ni métricas de calidad de audio.

## Requisitos de hardware

- VRAM estimada: el grafo fp32 pesa 52,6 MB y el fp16 26,4 MB; el consumo de memoria en ejecución es bajo y dominado por los tensores de activación, que dependen de `B` y `T`. No se publican cifras exactas.
- GPU recomendadas: no se especifican. Por tamaño, cualquier GPU con soporte de ONNX Runtime (incluidas RTX 4090, A100, H100) puede ejecutarlo; también es viable en CPU.
- GPU de consumo: sí cabe en GPUs de consumo e incluso en CPU, dado el tamaño del artefacto.
- Opciones de despliegue: ONNX Runtime (CPU o GPU), con los proveedores de ejecución que este soporte. No requiere vLLM, llama.cpp ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Formato | Tamano | Licencia | Notas |
|---|---|---|---|---|
| codebucketsolutions/snac-24khz-onnx (este) | ONNX fp32/fp16 | 52,6 MB / 26,4 MB | MIT | Exportación sin PyTorch; int8 no soportada |
| hubertsiuzdak/snac_24khz (original) | Pesos PyTorch | no disponible | MIT | Implementación de referencia del decodificador |
| Otros decodificadores de códecs neuronales (p. ej. EnCodec, DAC) | PyTorch / ONNX según exportación | no disponible | variable | No comparables directamente por vocabulario y escala de códigos distintos |

La comparación con alternativas de la misma categoría (otros decodificadores de códecs neuronales) no está disponible con datos numéricos en la información proporcionada; la única referencia directa es el modelo original de SNAC del que deriva esta exportación.

## Limitaciones y advertencias

- No es un modelo de lenguaje ni de texto: no genera texto, no razona y no soporta tool calling; cualquier expectativa en ese sentido es un error de categoría.
- La cuantización int8 de este decodificador falla según el autor (ruido audible), por lo que no se ofrece; solo fp32 y fp16 son viables.
- Los bloques de ruido del decodificador son aleatorios, igual que en PyTorch; la salida no es determinista bit a bit entre ejecuciones.
- La validación frente a PyTorch se hizo con el término de ruido desactivado en ambos lados, de modo que la equivalencia exacta con el modelo original en condiciones normales no está garantizada más allá de esa comprobación.
- El repositorio no declara pipeline, idiomas ni licencia en los metadatos de Hugging Face; la licencia MIT se indica en la model card, heredada de los pesos originales.
- Sin descargas ni likes registrados: no hay evidencia de uso en producción ni de validación por terceros.
- Depende de la compatibilidad del runtime ONNX con las operaciones del grafo; no se documentan versiones mínimas del runtime.
- El uso comercial está permitido por la licencia MIT, pero conviene conservar el aviso de copyright original de Hubert Siuzdak.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/codebucketsolutions/snac-24khz-onnx
- Modelo original SNAC 24 kHz: https://huggingface.co/hubertsiuzdak/snac_24khz
- Script de exportación citado: `tools/export_snac_onnx.py` del servidor de voz bolo (no se proporciona URL)
- Resultados de validación citados: `snac_onnx.json` (incluido en el repositorio)
