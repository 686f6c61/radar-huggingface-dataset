# jax-image-tools/microsam-vit-t-lm-onnx

## Resumen

El modelo `jax-image-tools/microsam-vit-t-lm-onnx` es una exportación a formato ONNX del modelo de segmentación de imágenes microscópicas micro-sam, concretamente la variante con encoder TinyViT (también conocida como `vit_t_lm`). Ha sido desarrollado por el equipo de JAX Image Tools para permitir la inferencia en el navegador mediante onnxruntime-web y WebGPU, como parte de su visor de imágenes. Este modelo resuelve el problema de segmentación semántica promptable en imágenes de microscopía de luz, ofreciendo una alternativa ligera y rápida al modelo `vit_b_lm` (el encoder es aproximadamente 12 veces más pequeño), ideal para aplicaciones web interactivas donde la latencia y el tamaño del modelo son críticos.

El repositorio contiene dos grafos ONNX separados: un encoder que procesa la imagen completa (una vez por imagen) y un decoder que genera la máscara a partir de las indicaciones (puntos o cajas). El encoder se proporciona en precisión fp16 (~14 MB) y el decoder en fp32 (~16 MB). La licencia del repositorio es CC-BY-4.0, aunque el modelo subyacente micro-sam y la arquitectura Segment Anything son Apache-2.0. El modelo está diseñado para integrarse en aplicaciones web, no como un servicio backend, y su uso principal es la segmentación de células, núcleos y orgánulos en imágenes de microscopía de luz.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Segment Anything (SAM) con encoder TinyViT (MobileSAM) y decoder de máscaras |
| Parámetros totales | No disponible (encoder ~14 MB en fp16, decoder ~16 MB en fp32) |
| Parámetros activos | No disponible (no es MoE) |
| Longitud de contexto | No aplica (entrada de imagen de 1024×1024) |
| Tipos de cuantización | fp16 (encoder), fp32 (decoder) |
| Idiomas soportados | No disponible (no es un modelo de lenguaje) |
| Licencia | CC-BY-4.0 para el repositorio; el modelo base micro-sam es Apache-2.0 |
| Formato de pesos | ONNX (.onnx) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Segment Anything (SAM) de Meta, adaptada por micro-sam para microscopía. El encoder es un TinyViT (proveniente de MobileSAM) que reduce la imagen a un embedding de 256×64×64, y el decoder genera la máscara de segmentación a partir de ese embedding y de las indicaciones del usuario (puntos positivos/negativos o cajas delimitadoras). Esta configuración permite un procesamiento eficiente en el cliente: el encoder se ejecuta una sola vez por imagen y el decoder se ejecuta por cada prompt, lo que facilita la iteración rápida en el navegador.

El modelo fue entrenado específicamente para imágenes de microscopía de luz (light microscopy), como se indica en el nombre `vit_t_lm`. Los detalles del entrenamiento (número de tokens, dataset, método de ajuste fino) no se proporcionan en la información disponible. La exportación a ONNX se realizó con la herramienta `sam-js` y la conversión a fp16 se hizo con `onnxruntime.transformers.float16`. El preprocesado de imágenes (redimensionado a 1024×1024, normalización SAM y relleno) se realiza en el cliente, y el encoder acepta tensores de entrada puros.

## Capacidades

- Segmentación de imágenes microscópicas de luz: identifica células, núcleos y orgánulos en imágenes de microscopía.
- Segmentación promptable: acepta puntos positivos y negativos, así como cajas delimitadoras como entrada.
- Inferencia en el navegador: diseñado para ejecutarse con onnxruntime-web y WebGPU, sin servidor.
- Dos grafos separados: el encoder se ejecuta una vez por imagen, el decoder por cada prompt, optimizando la interacción en tiempo real.
- Soporte de precisión mixta: encoder en fp16 (con I/O en fp32) para reducir peso y acelerar la ejecución.
- Compatibilidad con la interfaz de usuario de JAX Image Tools (jit-ui#90) para la herramienta de segmentación SAM.

## Casos de uso

- **Segmentación interactiva de células en el navegador**: un investigador puede abrir una imagen de microscopía en una aplicación web, hacer clic en una célula y obtener la máscara al instante, gracias al decoder ligero que responde a cada prompt.
- **Análisis de imágenes médicas en consulta**: los técnicos pueden usar la herramienta en un navegador para marcar núcleos en muestras de tejido sin necesidad de software especializado ni GPU de servidor.
- **Automatización de conteo celular**: integrado en un pipeline de procesamiento de imágenes, el modelo puede generar máscaras para múltiples células con prompts automáticos, acelerando la cuantificación.
- **Aplicaciones educativas de microscopía**: en entornos docentes, el modelo permite a los estudiantes explorar la segmentación en tiempo real sobre imágenes de ejemplo, directamente desde el navegador.
- **Prototipado de pipelines de análisis**: los desarrolladores pueden integrar este modelo en sus propias aplicaciones web de visión por computador para microscopía, gracias a su formato ONNX estándar.
- **Segmentación de orgánulos en experimentos de biología celular**: el modelo puede separar mitocondrias u otras estructuras en imágenes de fluorescencia, siempre que sean de microscopía de luz (el modelo específico para microscopía electrónica no es este).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se proporcionan métricas como mIoU o Dice en la documentación del repositorio. El rendimiento esperado se puede inferir del tamaño del encoder (14 MB en fp16), pero no hay datos cuantitativos comparativos.

## Requisitos de hardware

- **VRAM estimada**: no se especifica, pero al ser un modelo para WebGPU, se espera que funcione en GPU de consumo con soporte WebGPU (por ejemplo, tarjetas integradas modernas o GPU discretas con WebGPU habilitado).
- **GPU recomendadas**: cualquier dispositivo compatible con WebGPU (navegadores como Chrome o Edge en Windows, macOS o Linux). No se requiere GPU de servidor.
- **Adecuado para GPU de consumo**: sí, el objetivo es ejecutarlo en el navegador del cliente, no en servidores.
- **Opciones de despliegue**: onnxruntime-web con WebGPU, también puede usarse en Node.js con onnxruntime-node para pruebas locales.
- **Latencia y throughput**: no se proporcionan datos concretos. El diseño de dos grafos (encoder una vez, decoder por prompt) sugiere que la latencia de interacción es baja, pero no hay números.

## Comparativa con modelos similares

| Modelo | Encoder | Tamaño | Formato | Licencia | Uso principal |
|---|---|---|---|---|---|
| microsam-vit-t-lm-onnx (este) | TinyViT (MobileSAM) | ~14 MB (encoder fp16) | ONNX | CC-BY-4.0 (repo), Apache-2.0 (base) | Segmentación en navegador |
| microsam-vit-b-lm-onnx (hermano mayor) | ViT-B (SAM) | ~12× mayor (según texto) | ONNX | No disponible | Segmentación en navegador con mayor calidad |
| micro-sam vit_b_lm (original) | ViT-B | No disponible | PyTorch | Apache-2.0 | Segmentación en Python (servidor) |

La comparativa se basa en la información del repositorio: el encoder `vit_t_lm` es aproximadamente 12 veces más pequeño que el `vit_b_lm`. No hay datos de rendimiento cuantitativo para comparar calidad de segmentación.

## Limitaciones y advertencias

- **Sesgos y alucinaciones**: no aplica, es un modelo de segmentación de imágenes, no de lenguaje. No se reportan sesgos conocidos.
- **Riesgo de errores de segmentación**: el modelo puede fallar en imágenes con bajo contraste o artefactos de adquisición, como cualquier modelo de segmentación.
- **Limitaciones de dominio**: está entrenado específicamente para microscopía de luz, no para microscopía electrónica ni imágenes naturales. Usar fuera de este dominio puede dar resultados incorrectos.
- **Licencia**: el repositorio está bajo CC-BY-4.0, pero el modelo base micro-sam es Apache-2.0. Es necesario revisar los términos de la licencia del modelo base para uso comercial, aunque Apache-2.0 permite uso comercial con atribución.
- **Dependencia de WebGPU**: la inferencia en el navegador requiere soporte de WebGPU en el dispositivo; los navegadores o sistemas antiguos pueden no ser compatibles.
- **Preprocesado en el cliente**: el usuario debe implementar el redimensionado, normalización y relleno según la especificación SAM; errores en este paso pueden degradar la calidad.
- **Sin mantenimiento activo**: el repositorio tiene 0 descargas y 0 likes, y la fecha de creación es futura (2026-08-26), lo que sugiere que puede ser un proyecto experimental o con poca difusión.

## Enlaces

- [Repositorio de HuggingFace](https://huggingface.co/jax-image-tools/microsam-vit-t-lm-onnx)
- [Repositorio de micro-sam (GitHub)](https://github.com/computational-cell-analytics/micro-sam)
- [Documentación de modelos finetuned de micro-sam](https://github.com/computational-cell-analytics/micro-sam/blob/master/doc/finetuned_models.md)
