# agentable/gtcrn-simple-mlx

## Resumen

GTCRN Simple es un modelo de mejora de voz (speech enhancement) de tipo streaming, diseñado para eliminar ruido de señales de audio con un coste computacional ultrabajo. La implementación original fue publicada en ICASSP 2024 por Xiaobin-Rong y colaboradores, con el nombre GTCRN (Group Temporal Convolutional Recurrent Network). Este repositorio concreto, `agentable/gtcrn-simple-mlx`, contiene una conversión determinista del modelo original a formato MLX (Apple Silicon), realizada por el usuario agentable a partir del asset ONNX fijado en Sherpa-ONNX.

La conversión es únicamente de layout de tensores: no hay reentrenamiento, cuantización ni fusión de capas. El archivo `model.safetensors` contiene 48.228 parámetros en FP32, lo que lo convierte en un modelo extremadamente pequeño, apto para ejecución en tiempo real incluso en dispositivos con recursos limitados. Su relevancia actual radica en que permite desplegar mejora de voz de baja latencia directamente en hardware Apple Silicon mediante el framework MLX, sin depender de librerías externas de inferencia ONNX.

El modelo está pensado para ser consumido por el backend `engine: mlx` de la librería `model-gtcrn`, que verifica la integridad del archivo mediante SHA-256 antes de cargarlo. La licencia es MIT, lo que facilita su uso comercial y académico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GTCRN (Group Temporal Convolutional Recurrent Network) |
| Parametros totales | 48.228 (según safetensors; el modelo original reporta 23.67K) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (procesamiento de audio por tramas) |
| Tipos de cuantizacion | Solo FP32 (safetensors MLX) |
| Idiomas soportados | No disponible (el modelo procesa audio, no texto) |
| Licencia | MIT |
| Formato de pesos | safetensors (MLX), tambien disponible el ONNX original |

## Arquitectura y entrenamiento

GTCRN combina capas convolucionales temporales agrupadas (group temporal convolution) con una red recurrente (GRU) para modelar dependencias temporales largas. La versión "Simple" es una variante reducida que prioriza la eficiencia: el paper original reporta 33.0 MMACs (millones de operaciones multiplicar-acumular) y un factor de tiempo real (RTF) muy bajo, lo que permite ejecución en streaming. La arquitectura procesa audio por tramas de un frame, manteniendo tres familias de caché recurrente para preservar el contexto entre tramas.

Los datos de entrenamiento del modelo original no están documentados en la información proporcionada. La conversión a MLX, por su parte, es un proceso determinista que reordena los pesos de las convoluciones ONNX al formato OHWI requerido por MLX, y aplica una transformación específica para las convoluciones transpuestas agrupadas. No hay ningún ajuste fino ni modificación de pesos. La validación se realizó reproduciendo el grafo de un frame con el runner MLX, comparando contra el oráculo ONNX con un error máximo absoluto inferior a `5e-5` en Metal FP32.

## Capacidades

- Mejora de voz en tiempo real: elimina ruido de fondo de señales de audio, manteniendo la inteligibilidad de la voz.
- Procesamiento streaming: opera por tramas con caché recurrente, apto para aplicaciones de baja latencia.
- Bajo coste computacional: 33 MMACs y 48.228 parámetros, lo que permite ejecución en CPU y GPU de dispositivos modestos.
- Conversión a MLX: ejecutable nativamente en Apple Silicon mediante Metal, con verificación de integridad SHA-256.
- Compatibilidad con ONNX: el modelo original se distribuye en formato ONNX, lo que facilita su despliegue en otros frameworks (Sherpa-ONNX, etc.).
- No incluye capacidades de texto, tool calling, agentes ni visión: es exclusivamente audio-to-audio.

## Casos de uso

- Videollamadas y conferencias web: el modelo puede integrarse como filtro previo al códec de audio para eliminar ruido ambiental (teclados, tráfico, ventiladores) en tiempo real, gracias a su baja latencia y procesamiento por tramas.
- Preprocesamiento para reconocimiento de voz (ASR): al limpiar la señal antes de pasarla a un sistema ASR, se mejora la precisión en entornos ruidosos sin añadir una carga computacional significativa.
- Audífonos y dispositivos portátiles: su tamaño ultrarreducido (48K parámetros) permite ejecutarlo en hardware embebido con memoria limitada, mejorando la experiencia auditiva en tiempo real.
- Aplicaciones de grabación de voz en móviles: puede filtrar ruido de fondo durante la captura, mejorando la calidad de podcasts, notas de voz o entrevistas grabadas con dispositivos móviles.
- Sistemas de asistencia por voz en el hogar: integración en altavoces inteligentes o asistentes para separar la voz del usuario del ruido ambiente antes del procesamiento posterior.
- Desarrollo de plugins de audio: al estar disponible en ONNX y MLX, puede incorporarse como componente de mejora de voz en DAWs o herramientas de edición de audio, con licencia MIT que permite uso comercial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El paper original de GTCRN (ICASSP 2024) reporta métricas de mejora de voz (p. ej., PESQ, STOI) y eficiencia computacional (33 MMACs, RTF), pero esos datos no están incluidos en la documentación de este repositorio de conversión. La validación aquí descrita se limita a la fidelidad numérica de la conversión (error máximo < 5e-5), no a la calidad perceptiva del audio resultante.

## Requisitos de hardware

- VRAM estimada: no disponible, pero al tratarse de un modelo con 48.228 parámetros en FP32 (aproximadamente 193 KB de pesos), la memoria necesaria es despreciable incluso en GPU integradas.
- GPU recomendadas: cualquier Apple Silicon (M1, M2, M3, M4) con Metal. El modelo se ejecuta en GPU o CPU mediante MLX.
- Compatibilidad con GPU de consumo: sí, en cualquier Mac con chip Apple Silicon. No se requieren GPUs dedicadas de NVIDIA.
- Opciones de despliegue: MLX (backend `engine: mlx` de `model-gtcrn`), ONNX (a través de Sherpa-ONNX u otros runtimes ONNX). No se proporcionan archivos GGUF ni soporte para llama.cpp.
- Latencia y throughput: no disponibles en la información. El paper original reporta RTF bajo, pero no se especifica un valor concreto para esta conversión MLX.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GTCRN Simple (MLX) | 48.228 | Trama (streaming) | Audio a audio | MIT | MLX, ONNX |
| GTCRN original | 23.67K | Trama (streaming) | Audio a audio | MIT | PyTorch, ONNX |
| DeepFilterNet | ~1M | Trama (streaming) | Audio a audio | MIT | PyTorch, ONNX |

La comparación directa con DeepFilterNet u otros modelos de mejora de voz no es posible sin datos de benchmarks en la misma configuración. GTCRN destaca por su tamaño extremadamente reducido y su bajo coste computacional, lo que lo hace adecuado para dispositivos con recursos muy limitados, mientras que modelos más grandes ofrecen potencialmente mayor calidad a costa de mayor consumo.

## Limitaciones y advertencias

- La conversión MLX no incluye validación de calidad de audio a nivel de forma de onda ni de corpus; solo se ha verificado la fidelidad numérica de un frame. El uso en producción requiere una evaluación perceptiva adicional.
- El modelo está diseñado específicamente para mejora de voz; no es adecuado para otros tipos de audio (música, efectos de sonido) sin reentrenamiento.
- No se proporcionan datos sobre el rendimiento en diferentes idiomas o acentos, ya que el modelo procesa audio sin depender del idioma.
- La licencia MIT permite uso comercial, pero el usuario debe verificar que la implementación original cumple con los requisitos de atribución correspondientes.
- El archivo `model.safetensors` está en FP32; no hay versiones cuantizadas disponibles, lo que podría limitar su uso en dispositivos con memoria muy reducida (aunque el tamaño total es de solo 208 KB).
- La ejecución requiere Apple Silicon con Metal; no es compatible con GPUs NVIDIA o AMD en este formato.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/agentable/gtcrn-simple-mlx
- Implementación original (GitHub): https://github.com/Xiaobin-Rong/gtcrn
- Implementación alternativa (GitHub): https://github.com/YoungJay0612/SE_gtcrn
- Documentación DeepWiki: https://deepwiki.com/Xiaobin-Rong/gtcrn
- Repositorio de conversión (model-gtcrn): https://github.com/agentable/model-gtcrn
