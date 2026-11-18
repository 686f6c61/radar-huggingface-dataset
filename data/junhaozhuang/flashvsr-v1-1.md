# JunhaoZhuang/FlashVSR-v1.1

## Resumen

FlashVSR es un modelo de superresolución de vídeo (video super-resolution, VSR) basado en difusión desarrollado por Junhao Zhuang, Shi Guo, Xin Cai, Xiaohui Li, Yihao Liu, Chun Yuan y Tianfan Xue, con implementación de referencia en el repositorio OpenImagingLab. La versión v1.1, publicada en noviembre de 2025, mejora la estabilidad y la fidelidad respecto a la v1 inicial de octubre de 2025. El modelo aborda el problema de aplicar difusión a la restauración de vídeo en escenarios reales, donde la latencia alta, el coste computacional y la escasa generalización a resoluciones ultraaltas han limitado su adopción.

La propuesta central es un framework de streaming de un solo paso (one-step) que alcanza aproximadamente 17 FPS en vídeos de 768 × 1408 sobre una única GPU A100, lo que supone hasta un 12× de aceleración frente a modelos VSR de difusión de un paso anteriores. Para ello combina tres innovaciones: un pipeline de destilación en tres etapas, atención dispersa con restricción de localidad (LCSA) y un decodificador condicional de pequeño tamano. El modelo se distribuye con licencia Apache 2.0 y pesos en el repositorio de Hugging Face, con un tamano total de 7,5 GB.

La relevancia actual radica en que FlashVSR traslada la superresolución por difusión desde el ámbito experimental hacia un régimen casi en tiempo real, lo que habilita su uso en pipelines de producción de vídeo. Es importante senalar que el modelo está disenado y optimizado específicamente para superresolución 4×, y que las implementaciones de terceros que omiten el módulo LCSA pueden degradar notablemente la calidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Difusión de un solo paso con atención dispersa restringida por localidad (LCSA) y decodificador condicional pequeno |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (procesa vídeo en streaming; resolución objetivo 768 × 1408) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de vídeo, no lingüístico) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (repo de 7,5 GB; pesos consumidos vía pipeline oficial) |

## Arquitectura y entrenamiento

FlashVSR es un modelo de difusión para restauración de vídeo orientado a superresolución 4×, construido sobre un esquema de destilación en tres etapas que permite inferencia en un solo paso y en modo streaming. La innovación arquitectónica principal es la atención dispersa con restricción de localidad (Locality-Constrained Sparse Attention, LCSA), que reduce el cómputo redundante y salva la brecha de resolución entre entrenamiento y prueba, permitiendo escalar a resoluciones ultraaltas sin degradar la calidad. A esto se suma un decodificador condicional de pequeno tamano que acelera la reconstrucción manteniendo la fidelidad.

Para el entrenamiento se construyó el dataset VSR-120K, con 120 000 vídeos y 180 000 imágenes, disenado para soportar entrenamiento a gran escala. El modelo se apoya en un backend de Block-Sparse Attention para habilitar máscaras de atención dinámicas y eficientes durante la inferencia. La versión v1.1 incorpora mejoras de estabilidad y fidelidad respecto a la v1, y en octubre de 2025 se corrigió la lógica de actualización de `local_attention_mask` para evitar artefactos al cambiar de relación de aspecto durante inferencia continua.

## Capacidades

- Superresolución de vídeo 4× en modo streaming, con inferencia de un solo paso.
- Procesamiento de vídeo a resoluciones de hasta 768 × 1408 a ~17 FPS en una A100.
- Generalización a resoluciones ultraaltas gracias a LCSA.
- Restauración de detalle fino y preservación de estructuras en comparación con implementaciones sin LCSA.
- Manejo de cambios de relación de aspecto durante inferencia continua (corregido en v1).
- No se documentan capacidades de generación de texto, tool calling, agentes ni multilingüismo, al tratarse de un modelo de vídeo.

## Casos de uso

- Restauración de archivo audiovisual: escalar material histórico o de baja resolución a 4× con un pipeline de un solo paso, adecuado por su velocidad cercana a tiempo real en A100.
- Upstreaming en directo: integración en cadenas de emisión para mejorar la calidad de fuentes 720p/1080p hacia 4K, aprovechando los ~17 FPS a 768 × 1408.
- Postproducción de vídeo: mejora de tomas rodadas a baja resolución antes del montaje final, con preservación de detalle fino gracias a LCSA.
- Plataformas de contenido generado por usuarios: reescalado automático de vídeos subidos a resoluciones de visualización superiores en pipelines por lotes.
- Restauración de vídeo comprimido: recuperación de artefactos de compresión en material distribuido por streaming, usando el modelo como etapa de limpieza previa a la codificación.
- Investigación en visión por computador: base para experimentos de VSR con difusión de un paso, con dataset VSR-120K para réplica y ajuste fino.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente reporta métricas operativas: ~17 FPS en 768 × 1408 sobre una A100 y hasta ~12× de aceleración frente a modelos VSR de difusión de un paso previos. No se proporcionan cifras de PSNR, SSIM, LPIPS ni comparativas numéricas con otros modelos.

## Requisitos de hardware

- VRAM estimada: no disponible en la información proporcionada.
- GPU de referencia: NVIDIA A100 (rendimiento reportado de ~17 FPS a 768 × 1408).
- Compatibilidad con GPU de consumo: no disponible.
- Backend requerido: Block-Sparse Attention, cuya compilación puede consumir mucha memoria (se recomienda limitar los jobs de `ninja` en paralelo).
- Entorno: Python 3.11.13, instalación vía `pip install -e .` y `requirements.txt` desde el repositorio oficial.
- Opciones de despliegue: pipeline oficial de OpenImagingLab; existen integraciones de terceros (p. ej. ComfyUI-WanVideoWrapper) que pueden omitir LCSA y degradar la calidad.
- Latencia y throughput: ~17 FPS a 768 × 1408 en A100; sin datos para otras GPU.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos numéricos de modelos comparables de VSR basados en difusión, por lo que no es posible establecer una comparativa rigurosa de parámetros, contexto, rendimiento o licencia.

## Limitaciones y advertencias

- El modelo está disenado y optimizado para superresolución 4×; otros factores de escala pueden ofrecer resultados menos estables.
- Las implementaciones de terceros que no incluyen LCSA (algunas versiones tempranas de ComfyUI) pueden producir degradación notable de calidad, especialmente a resoluciones altas.
- Dependencia del backend Block-Sparse Attention, cuya compilación es intensiva en memoria; existe una versión alternativa sin esa librería en desarrollo, potencialmente más lenta.
- No se documentan sesgos, tasas de alucinación ni comportamiento multilingüe por tratarse de un modelo de vídeo.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las dependencias de terceros (Block-Sparse Attention) por si imponen condiciones adicionales.
- El dataset VSR-120K aún no se ha publicado (marcado como pendiente en la hoja de ruta).
- No hay información sobre cuantizaciones ni formatos de pesos alternativos, lo que limita el despliegue en hardware de gama baja.

## Enlaces

- Modelo en Hugging Face (v1.1): https://huggingface.co/JunhaoZhuang/FlashVSR-v1.1
- Modelo en Hugging Face (v1): https://huggingface.co/JunhaoZhuang/FlashVSR
- Repositorio GitHub: https://github.com/OpenImagingLab/FlashVSR
- Página del proyecto: http://zhuang2002.github.io/FlashVSR
- Paper en arXiv: https://arxiv.org/abs/2510.12747
- Dataset VSR-120K: https://huggingface.co/datasets/ruchangyao/FlashVSR_Plus_Dataset
- Discusión comunitaria sobre LCSA en ComfyUI: https://github.com/kijai/ComfyUI-WanVideoWrapper/issues/1441
