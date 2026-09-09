# mousebar01/Pixal3D.cpp-GGUF

## Resumen

Pixal3D es un pipeline de generación de mallas 3D texturizadas a partir de imágenes, desarrollado originalmente por TencentARC y portado a C++/ggml por mousebar01. Este repositorio en HuggingFace contiene los pesos en formato GGUF, en precisión F16, de los distintos componentes del modelo: cuatro Diffusion Transformers (DiT) de flujo y tres decodificadores. El modelo permite convertir una imagen única o varias vistas de un objeto en una malla 3D completa con textura, mediante un proceso en cascada que genera estructura, forma y textura de forma separada.

Con 5.499.476.072 parámetros en total (aproximadamente 5.5 mil millones), el modelo se distribuye en tres archivos GGUF que ocupan cerca de 12 GiB para el modo de imagen única, más otros 10 GiB para el modo multi-view. No es un modelo de lenguaje; su dominio es la visión 3D y la generación de geometría. La relevancia del proyecto radica en ofrecer una implementación nativa en C++ basada en ggml, lo que permite ejecutar el pipeline sin dependencias de Python en tiempo de inferencia, con una degradación numérica mínima frente a los pesos originales en F32.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline image-to-3D basado en Diffusion Transformers (DiT) y decodificadores convolucionales (sparse-structure, FlexiDualGrid, textura), portado a ggml |
| Parametros totales | 5.499.476.072 (≈5.5B) |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | No aplica: el modelo procesa imágenes, no texto |
| Tipos de cuantizacion | F16 (GGUF); conversión F32 disponible mediante `--ftype 0`; modo `--ftype auto` para almacenamiento por componente |
| Idiomas soportados | No aplica |
| Licencia | MIT (pesos del modelo base; los modelos auxiliares tienen licencias propias) |
| Formato de pesos | GGUF (varios archivos) |

## Arquitectura y entrenamiento

El pipeline de Pixal3D se compone de cuatro "flow DiTs" que operan en cascada: uno para la estructura dispersa (`ss_flow_img_dit_1_3B_64`), dos para la forma (`slat_flow_img2shape_dit_1_3B_512` y `slat_flow_img2shape_dit_1_3B_1024`) y uno para la textura (`slat_flow_imgshape2tex_dit_1_3B_1024`). Estos modelos de flujo condicionan la generación a partir de una imagen única o de múltiples vistas. Los decodificadores incluyen un conv3d para la estructura dispersa, un FlexiDualGrid para la forma y un decodificador de textura con diseño `next_dc_f16c32`. El modelo se distribuye en tres archivos GGUF (`pixal3d-shared-f16.gguf`, `pixal3d-base-flow-f16.gguf` y `pixal3d-mv-flow-f16.gguf`), con metadatos con espacio de nombres por componente.

La conversión GGUF almacena los tensores elegibles en F16, manteniendo los tensores sensibles, escalares y pequeños en F32. El autor validó que las salidas del flow sampler con pesos F16 difieren de la conversión F32 en aproximadamente 2e-4 de error relativo L2, y que una comparativa end-to-end entre el port C++ y la referencia Python dio un RMSE de render de 0.040 con F16 frente a 0.041 con F32. No se dispone de información sobre los datos de entrenamiento, la composición del dataset ni si se utilizó RLHF o DPO, al no tratarse de un modelo de lenguaje.

## Capacidades

- Generación de mallas 3D texturizadas a partir de una sola imagen (modo `run-image`).
- Generación condicionada por múltiples vistas (modo `run-cascade-mv`).
- Pipeline en cascada que genera estructura, forma y textura de forma separada, con resoluciones de 512 y 1024.
- Salida en formato GLB, lista para su uso en motores 3D o aplicaciones de visualización.
- Ejecución nativa en C++/ggml, sin dependencias de Python en tiempo de inferencia.
- Capacidad de aceptar un bundle de condiciones precalculado (modo `run-cascade`).
- No soporta tool calling, razonamiento ni generación de texto, al ser un modelo de visión 3D.

## Casos de uso

- Generación de assets 3D para videojuegos: a partir de una imagen de concepto, el modelo genera una malla texturizada lista para importar en motores como Unity o Unreal mediante `run-image`, acelerando el prototipado de personajes u objetos.
- Digitalización de productos para e-commerce: con una fotografía de un producto, se genera un modelo 3D interactivo que puede mostrarse en una web, permitiendo al cliente rotar el objeto y verlo en 360 grados.
- Reconstrucción de objetos para entornos industriales: usando varias fotografías del mismo objeto, el pipeline multi-view produce una malla con textura para inspección o documentación técnica mediante `run-cascade-mv`.
- Prototipado para impresión 3D: a partir de un boceto o imagen de referencia, se genera la forma 3D para validar geometría antes de imprimir, aprovechando el decodificador de forma con FlexiDualGrid.
- Creación de contenido 3D para realidad virtual (RV) y aumentada (RA): el modelo transforma fotos en modelos 3D completos para experiencias inmersivas, sin necesidad de modelado manual costoso.
- Generación de mallas para simulación robótica: con la estimación de cámara de MoGe-2 y el flujo de forma, el modelo produce mallas de objetos para entrenar agentes en simuladores, donde la carga manual de assets es un cuello de botella.
- Restauración y upsampling de texturas: al integrar el modelo auxiliar NAF, el pipeline mejora la resolución de las texturas, lo que resulta útil para preservar detalles en escaneos antiguos o de baja calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

Como referencia interna, el autor validó que los pesos F16 producen salidas con un error relativo L2 de aproximadamente 2e-4 frente a la conversión F32, y una comparativa end-to-end entre el port C++ y la referencia Python dio un RMSE de render de 0.040 con F16 y 0.041 con F32. Estos datos no constituyen benchmarks estándar de rendimiento.

## Requisitos de hardware

- VRAM estimada para inferencia: el modo single-image carga `pixal3d-shared-f16.gguf` (1.90 GiB) más `pixal3d-base-flow-f16.gguf` (10.36 GiB), por lo que se necesitan al menos 12.26 GiB de memoria, más el overhead de los modelos auxiliares DINOv3, NAF y MoGe-2. El modo multi-view añade `pixal3d-mv-flow-f16.gguf` (10.36 GiB), sumando aproximadamente 22.62 GiB.
- GPU recomendadas: para single-image, una GPU con 16 GB (RTX 4080, A10) puede ser suficiente; para multi-view, se recomienda 24 GB o más (RTX 4090, A100 40GB).
- Compatibilidad con GPU de consumo: el modo single-image puede ejecutarse en una RTX 4060 Ti 16 GB, aunque con velocidad limitada. El modo multi-view requiere GPU de gama alta.
- Opciones de despliegue: se distribuye como binario CLI `pixal3d` basado en ggml; no se ha documentado integración con vLLM, Ollama ni TGI, al no tratarse de un modelo de lenguaje.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Categoría | Parametros | Contexto | Licencia |
|---|---|---|---|---|
| Pixal3D (GGUF) | Image-to-3D | 5.499.476.072 | No aplica | MIT |
| TRELLIS (trellis.cpp) | Image-to-3D | No disponible | No disponible | No disponible |
| TripoSR | Image-to-3D | No disponible | No disponible | No disponible |
| InstantMesh | Image-to-3D | No disponible | No disponible | No disponible |

No se dispone de datos comparativos de benchmarks en la información proporcionada. El repositorio referencia `trellis.cpp` para el postprocesado de mallas texturizadas (QEM decimation, xatlas UV unwrap, voxel-PBR bake), lo que sugiere una funcionalidad similar a TRELLIS.

## Limitaciones y advertencias

- No es un modelo de lenguaje; no puede procesar texto ni ejecutar tool calling.
- El modo `run-image` requiere tres modelos auxiliares (DINOv3, NAF, MoGe-2) que no están alojados en este repositorio. La licencia de DINOv3 ("other") impide su redistribución, por lo que debe convertirse localmente.
- La precisión F16 puede introducir pequeñas desviaciones frente a los pesos F32 originales (error relativo L2 de ~2e-4).
- Sin datos públicos de benchmarks ni evaluaciones de sesgos; el riesgo de alucinación se manifiesta como mallas 3D distorsionadas o de baja calidad en geometrías complejas.
- El repositorio no tiene contenido multilingüe: no hay soporte para idiomas ni documentación más allá del README.
- Descargas 0 y likes 0: proyecto en estado inicial, sin evidencia de uso en producción.

## Enlaces

- HuggingFace: https://huggingface.co/mousebar01/Pixal3D.cpp-GGUF
- Repositorio Pixal3D.cpp: https://github.com/mousebar01/Pixal3D.cpp
- Modelo base TencentARC/Pixal3D: https://huggingface.co/TencentARC/Pixal3D
- Proyecto original: https://github.com/TencentARC/Pixal3D
- Página del proyecto: https://ldyang694.github.io/projects/pixal3d/
- arXiv: https://arxiv.org/abs/2605.10922
- ggml: https://github.com/ggml-org/ggml
- trellis.cpp: https://github.com/pwilkin/trellis.cpp
- DINOv3 (gated): https://huggingface.co/facebook/dinov3-vitl16-pretrain-lvd1689m
- MoGe-2 (ONNX): https://huggingface.co/Ruicheng/moge-2-vitl-normal-onnx
