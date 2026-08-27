# Sail2Dream/phase-rlfn-codec-v1

## Resumen

Phase-RLFN 3× Video Super-Resolution es un modelo de superresolución de vídeo desarrollado por Sail2Dream, diseñado específicamente para su despliegue en NPUs de Rockchip (RK3576, RK3588 y RV1126B). El modelo realiza un escalado de 3× sobre fotogramas individuales, partiendo de una entrada de 360×640 píxeles y generando una salida de 1080×1920. Su principal innovación es la integración de un adaptador de códec consciente de la cuantización: se entrena sobre reconstrucciones reales del códec MLVC-S (con cuantización de P-frames congelada), lo que le permite aprovechar características temporales del decodificador para mejorar la calidad de la superresolución.

La arquitectura es una red residual Phase-RLFN sin capas BatchNorm, lo que facilita la cuantización completa del grafo de inferencia. El modelo incluye un adaptador de códec opcional, inicializado a cero y entrenado con un 25 % de dropout, de modo que la ruta de superresolución base funciona de forma independiente cuando no hay contexto de códec disponible. El repositorio incluye pesos QAT (con cuantización simulada), pesos int8 ya cuantizados para RKNN, una versión FP32 de referencia y el archivo de configuración exacto del entrenamiento. La licencia es MIT, lo que permite uso comercial sin restricciones adicionales.

Este modelo es relevante porque aborda un problema práctico: la superresolución de vídeo en tiempo real en dispositivos embebidos con recursos limitados, donde la eficiencia computacional y la compatibilidad con hardware específico son críticas. Al estar entrenado con QAT y sin BatchNorm, el grafo de entrenamiento coincide con el de despliegue, eliminando la necesidad de pasos de fusión posteriores y simplificando la conversión a RKNN.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Phase-RLFN (red residual con PixelUnshuffle/PixelShuffle, sin BatchNorm) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no aplica (modelo de imagen a imagen, no texto) |
| Tipos de cuantizacion | FP32, int8 (RKNN-style), QAT fake-quant |
| Idiomas soportados | no disponible (modelo visual, no lingüístico) |
| Licencia | MIT |
| Formato de pesos | PyTorch state dict (.pth), también int8 cuantizado (.pth) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura Phase-RLFN, una variante de la red RLFN (ganadora del NTIRE 2022 en eficiencia) adaptada para trabajar con fases y sin normalización por lotes. El flujo comienza con una operación PixelUnshuffle con factor de fase 2, que reorganiza los canales de entrada en un tensor de fase de dimensiones 12×180×320 (3 canales × 4 fases × espacio LR). Este tensor pasa por un núcleo compuesto por un stem convolucional 3×3, cuatro bloques residuales locales (cada uno con dos convoluciones sin BatchNorm y activación LeakyReLU 0.1), una fusión de características con conexiones densas y un salto superficial. Opcionalmente, se incorpora un adaptador de códec que proyecta las características del decodificador MLVC (96 canales) mediante una expansión, PixelShuffle y una fusión con pesos inicializados a cero y sin sesgo. Finalmente, una cabeza residual genera un residual firmado que se suma a la base bicúbica RGA (fuera del grafo NPU) y se recorta a [0, 255].

El entrenamiento se realizó con 2 GPUs en DDP, siguiendo una línea temporal por pasos que pasa de entrenamiento en float a observador y luego a QAT. Los hiperparámetros incluyen una tasa de aprendizaje de 1e-3 en la fase float y 1e-5 en QAT, decaimiento EMA de 0.999 y backend QAT qnnpack. La pérdida es L1, y la selección del mejor checkpoint se realiza mediante el protocolo de validación VMAF/PSNR sobre reconstrucciones MLVC en YUV444 de rango completo BT.709. El adaptador de códec se entrena con un 25 % de dropout, lo que garantiza que la ruta base de SR siga funcionando sin contexto de códec.

## Capacidades

- Superresolución de vídeo 3×: escala fotogramas individuales de 360×640 a 1080×1920, con soporte para entrada YUV444 en rango completo BT.709.
- Codec-aware: integra características del decodificador MLVC-S (ref_feature) mediante un adaptador zero-initialized, mejorando la calidad cuando se dispone de contexto temporal del códec.
- Cuantización lista para despliegue: incluye pesos int8 ya cuantizados en estilo RKNN, listos para conversión directa a NPU.
- Compatibilidad con NPUs Rockchip: diseñado para RK3576, RK3588 y RV1126B, con interfaz RKNN definida (entrada de fase 12×180×320 y salida de residual 108×180×320).
- Funcionamiento independiente por fotograma: la ruta base de SR no depende del códec, por lo que puede usarse como un modelo de superresolución estándar.
- Sin BatchNorm: el grafo de entrenamiento es idéntico al de despliegue, simplificando la cuantización y la conversión a RKNN.

## Casos de uso

- Mejora de vídeo en tiempo real en dispositivos embebidos: el modelo puede integrarse en cámaras de vigilancia, televisores o decodificadores con NPU Rockchip para escalar contenido de baja resolución a 1080p en tiempo real, aprovechando la cuantización int8 y la ausencia de BatchNorm para minimizar la latencia.
- Transcodificación con códec MLVC: en pipelines que ya utilizan el códec MLVC-S, el adaptador de códec puede consumir las características del decodificador para mejorar la calidad de la superresolución, reduciendo artefactos de compresión.
- Post-procesado de vídeo en streaming: integrado en servidores de transcodificación, puede escalar vídeo de baja resolución antes de la entrega al cliente, mejorando la experiencia en conexiones limitadas.
- Superresolución en aplicaciones de videovigilancia: permite ampliar regiones de interés en grabaciones de baja resolución, facilitando la identificación de detalles en entornos con recursos computacionales restringidos.
- Investigación en superresolución eficiente y cuantización: el repositorio incluye configuraciones y pesos QAT, lo que lo convierte en una referencia útil para estudiar el impacto de la cuantización en modelos de SR y la integración con códecs.
- Despliegue en dispositivos móviles con NPU: aunque está orientado a Rockchip, el modelo puede ejecutarse en PyTorch sobre GPUs o CPUs para prototipado, y luego convertirse a RKNN para producción.

## Benchmarks y rendimiento

El autor reporta los siguientes resultados para el mejor checkpoint QAT (best_ema.pth, paso ~52000), evaluado con el protocolo de validación VMAF/PSNR sobre reconstrucciones MLVC en YUV444 de 360×640 a 1080×1920:

| Metrica | Valor |
|---|---|
| VMAF | 70.6694 |
| PSNR | 34.9340 dB |

No se han publicado resultados comparativos con otros modelos de superresolución en la información disponible. Tampoco se especifican métricas de rendimiento en términos de latencia o throughput.

## Requisitos de hardware

- NPUs objetivo: Rockchip RK3576, RK3588 y RV1126B, con soporte RKNN.
- VRAM estimada: no disponible (el modelo es pequeño, con 32 canales y 4 bloques residuales, pero no se indica el consumo de memoria).
- GPU recomendadas: no especificadas; el entrenamiento se realizó con 2 GPUs, pero para inferencia puede ejecutarse en cualquier GPU compatible con PyTorch.
- Compatibilidad con GPU de consumo: probablemente sí, dado el tamaño reducido, pero no hay datos confirmados.
- Opciones de despliegue: RKNN (para NPU Rockchip), PyTorch (para GPU/CPU), y posiblemente conversión a otros formatos como ONNX (no documentado).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos comparativos publicados entre Phase-RLFN y otros modelos de superresolución. Como referencia, el modelo RLFN original de ByteDance (ganador del NTIRE 2022 en eficiencia) comparte la base arquitectónica, pero no incorpora el adaptador de códec ni la optimización específica para RKNN. Otros modelos eficientes como ESPCN o FSRCNN podrían ser alternativas, pero no se han evaluado en las mismas condiciones. La ausencia de benchmarks comparativos impide establecer una comparación cuantitativa fiable.

## Limitaciones y advertencias

- Sesgos: no se ha documentado ningún análisis de sesgos; al ser un modelo de superresolución, los posibles sesgos provendrían de los datos de entrenamiento, que no se especifican en detalle.
- Riesgo de alucinación: como en cualquier modelo de superresolución, existe el riesgo de generar detalles finos inexistentes en la imagen original, especialmente en texturas o patrones complejos.
- Limitaciones de contexto: el modelo solo soporta un factor de escala de 3×; no es configurable para otros factores.
- Dependencia del códec: el modo codec-aware requiere el códec MLVC-S; sin él, el modelo funciona como SR base, pero no se aprovecha la mejora adicional.
- Restricciones de licencia: la licencia MIT permite uso comercial, pero el códec MLVC-S podría tener patentes o licencias propias que afecten su uso en producción; no se menciona en la documentación.
- Requisitos de formato: la entrada debe estar en YUV444 de rango completo BT.709; otros formatos de color o rangos pueden requerir conversión previa.
- Estado del repositorio: el tamaño del repositorio es de 0.0 GB y no se indica si los archivos están realmente disponibles; se recomienda verificar la integridad de los pesos antes de su uso.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Sail2Dream/phase-rlfn-codec-v1
- Repositorio del proyecto (rknn-super-resolution): https://github.com/Puiching-Memory/rknn-super-resolution
- Repositorio RLFN original (ByteDance): https://github.com/bytedance/RLFN
