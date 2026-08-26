# jax-image-tools/cellpose-sam-onnx

## Resumen

Cellpose-SAM (CPSAM) es un modelo de segmentación celular basado en el encoder de imagen ViT-L de SAM, desarrollado por el Jackson Laboratory (MouseLand) y descrito por Stringer et al. en 2025. Este repositorio concreto, `jax-image-tools/cellpose-sam-onnx`, contiene un exportado ONNX en FP16 de un único archivo (588 MB) del modelo original, pensado para inferencia en el navegador mediante WebGPU a través de la librería `cellpose-js`, aunque también es usable desde cualquier backend compatible con ONNX Runtime que soporte opset 18 y entrada/salida FP16.

El modelo resuelve el problema de segmentación celular generalista en imágenes de microscopía (H&E, brightfield, contraste de fases, fluorescencia multicanal) con una arquitectura que combina el encoder ViT-L de SAM (modificado: patch size 8, sin windowed attention) con una cabeza de regresión densa de 3 canales que predice los flujos horizontales y verticales (`flow_y`, `flow_x`) y la probabilidad de célula (`cellprob`). Es relevante porque permite ejecutar segmentación celular de alta calidad directamente en el navegador sin servidor dedicado, con un coste de inferencia de ~277 ms por tile de 256×256 en hardware Apple Silicon.

La licencia es BSD-3-Clause, heredada de Cellpose. El modelo tiene 304.6 millones de parámetros y una ventana de entrada fija de 256×256 píxeles en RGB normalizado por percentiles. El repositorio se creó en agosto de 2026 y no tiene descargas ni likes en el momento de la consulta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | SAM ViT-L image encoder (patch size 8, sin windowed attention) + head de regresión densa de 3 canales (flow_y, flow_x, cellprob) |
| Parámetros totales | 304,6 M |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, entrada 256×256) |
| Tipos de cuantización | FP16 (únicamente) |
| Idiomas soportados | en (documentación; el modelo es agnóstico al idioma) |
| Licencia | BSD-3-Clause |
| Formato de pesos | ONNX (opsets 18, FP16, un solo archivo sin sidecar .data) |

## Arquitectura y entrenamiento

El modelo es una exportación directa de Cellpose-SAM (CPSAM), cuya arquitectura combina el encoder de imagen de SAM ViT-L con una modificación clave: el patch size se reduce de 16 a 8 y se elimina el windowed attention, lo que permite capturar detalles celulares finos. Sobre el encoder se apila un head de regresión densa que produce tres mapas de 256×256: el flujo vertical, el flujo horizontal y la probabilidad de célula. La postprocesado de dinámica de flujo (integración de Euler, clustering por convergencia, componentes conexos y filtrado por tamaño/flujo) no está incluido en el grafo ONNX y debe realizarse con `cellpose.dynamics` en Python o con el puerto JS en `cellpose-js`.

El proceso de generación del ONNX partió del checkpoint PyTorch de `mouseland/cellpose-sam` (1.23 GB, FP32), se instanció la clase `cellpose.vit_sam.Transformer` en FP16 y se exportó con ONNX opset 18. La paridad numérica frente al modelo PyTorch original es de 1.24e-05 de error máximo absoluto peor caso en 10 tiles aleatorios (umbral de validación 1e-3). No se ha realizado reentrenamiento, poda ni cambios de arquitectura; es un reempaquetado del modelo original. Los datos de entrenamiento del modelo base no se detallan en la documentación disponible.

## Capacidades

- Segmentación celular en imágenes de microscopía 2D: H&E, brightfield, contraste de fases, fluorescencia multicanal.
- Inferencia en navegador mediante WebGPU (Chrome ≥ 135, Safari ≥ 17.4) a través de `cellpose-js`.
- Compatible con cualquier runtime de ONNX Runtime (Python, Node, Rust, C++) que soporte opset 18 y FP16.
- Salida de tres canales por píxel: `flow_y`, `flow_x` y `cellprob`, que permiten reconstruir máscaras de instancia mediante postprocesado de dinámicas de flujo.
- Normalización de entrada por percentiles por canal, tolerante a variaciones de contraste e iluminación.
- No incluye soporte para 3D (`gradient_tracking_3D` no está en el grafo exportado).
- No ofrece tool calling, razonamiento multi-paso ni capacidades de lenguaje; es un modelo exclusivamente de visión.

## Casos de uso

- Análisis de imágenes histológicas en el navegador: investigadores pueden subir una imagen H&E y obtener máscaras de células sin instalar Python ni depender de servidores, gracias a la inferencia WebGPU con `cellpose-js`.
- Segmentación de células en flujo de trabajo de laboratorio: el modelo puede integrarse en pipelines de análisis de imágenes de fluorescencia multicanal para cuantificar poblaciones celulares.
- Aplicaciones de diagnóstico asistido en entornos clínicos: al ejecutarse en el cliente, los datos de imagen nunca abandonan el navegador, lo que facilita el cumplimiento de requisitos de privacidad y evita el envío de datos a servidores externos.
- Procesamiento de imágenes en tiempo real en dispositivos con GPU integrada: el rendimiento medido de ~277 ms por tile de 256×256 en un M1 Max permite análisis interactivos de imágenes de tamaño moderado.
- Prototipado rápido de herramientas de bioimagen: `cellpose-js` ofrece una API TypeScript simple para cargar el modelo y segmentar imágenes en una página web, acelerando la creación de demos y prototipos.
- Integración en sistemas de análisis de imagen de código abierto: al ser un archivo ONNX autónomo, puede usarse como motor de segmentación en herramientas existentes que ya usen ONNX Runtime, sin necesidad de instalar PyTorch.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (como Jaccard, Dice o IoU) en la información disponible. El modelo es una exportación exacta del checkpoint `mouseland/cellpose-sam`, por lo que su precisión es equivalente a la del modelo PyTorch original. Sí se documentan métricas de rendimiento de inferencia en el navegador, medidas en un M1 Max con Chrome 135+ y ORT-web 1.26:

| Paso | Tiempo |
|---|---|
| Descarga en frío del modelo (588 MB, CDN) | ~5 s |
| Descarga en caliente (IndexedDB) | < 100 ms |
| `ort.InferenceSession.create` | ~1.3 s |
| Compilación de shaders (primer forward) | ~2.3 s |
| Inferencia por tile (256×256) en estado estable | ~277 ms |
| Preprocesamiento por tile (normalización + copia) | ~14 ms amortizado |
| Postprocesado de dinámicas de flujo (imagen 400×400) | ~74 ms |

El error máximo absoluto frente al checkpoint PyTorch es de 1.24e-05 (umbral de validación 1e-3), lo que garantiza paridad numérica.

## Requisitos de hardware

- VRAM: no se especifica un requisito de VRAM para GPU dedicadas; el modelo ONNX FP16 ocupa 588 MB en disco, por lo que la huella de memoria en runtime será del mismo orden.
- GPU recomendadas: cualquier GPU con soporte WebGPU (Apple M1/M2/M3, NVIDIA RTX serie 20 o superior, AMD RDNA2+). En el navegador, requiere Chrome ≥ 135 o Safari ≥ 17.4.
- No cabe en CPU de propósito general de forma eficiente: aunque el ONNX puede ejecutarse en CPU con `CPUExecutionProvider`, el objetivo principal es WebGPU; no hay fallback WASM en `cellpose-js` v1.
- Opciones de despliegue: `cellpose-js` en el navegador, ONNX Runtime en Python/Node/Rust/C++ con cualquier EP (CPU, CUDA, WebGPU).
- Latencia medida: ~277 ms/tile en estado estable (M1 Max, Chrome 135+); en la primera ejecución se añade ~2.3 s de compilación de shader y ~1.3 s de creación de sesión.
- Throughput estimado: aproximadamente 3-4 tiles de 256×256 por segundo en un M1 Max.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto/Entrada | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| `jax-image-tools/cellpose-sam-onnx` | 304,6 M | 256×256 | BSD-3-Clause | ONNX FP16 | HuggingFace |
| `mouseland/cellpose-sam` (PyTorch) | 304,6 M | 256×256 | BSD-3-Clause | PyTorch | HuggingFace |
| Cellpose 2.0 (modelo base) | ~5 M | variable | BSD-3-Clause | PyTorch | GitHub, PyPI |

El modelo es idéntico en arquitectura y pesos al `mouseland/cellpose-sam` original; la diferencia es exclusivamente el formato de distribución (ONNX FP16 autónomo). Frente a Cellpose 2.0, CPSAM ofrece una generalización superior en datos heterogéneos (ruido de disparo, desenfoque anisotrópico, inversiones de contraste) según el paper de Stringer et al., a costa de un tamaño mucho mayor (588 MB vs ~20 MB). No hay datos de comparación cuantitativa de precisión entre CPSAM y Cellpose 2.0 en la información proporcionada.

## Limitaciones y advertencias

- El modelo solo procesa imágenes 2D; la rutina 3D `gradient_tracking_3D` de Cellpose-SAM no está incluida en el grafo ONNX.
- Requiere navegadores modernos con WebGPU y soporte nativo de `Float16Array`; no hay fallback WASM en `cellpose-js` v1, por lo que en navegadores antiguos la inferencia fallará.
- La entrada está fijada a 256×256; imágenes mayores deben dividirse en tiles, lo que puede introducir artefactos en los bordes si no se gestiona el solapamiento.
- El modelo no incluye el postprocesado de flujos; los desarrolladores deben implementar la dinámica de flujo por su cuenta (código JS o Python), lo que añade complejidad.
- No se han publicado evaluaciones de sesgo o de rendimiento en dominios específicos (p. ej., imágenes de baja calidad, muestras con artefactos) en la información disponible.
- El repositorio no tiene descargas ni validación de la comunidad; es una exportación reciente (agosto de 2026) y su uso en producción aún no está contrastado.
- La licencia BSD-3-Clause permite uso comercial, pero debe incluirse el aviso de copyright de Cellpose.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/jax-image-tools/cellpose-sam-onnx
- Modelo base PyTorch: https://huggingface.co/mouseland/cellpose-sam
- Repositorio `cellpose-js`: https://github.com/TheJacksonLaboratory/cellpose-js
- Paper Cellpose-SAM (bioRxiv): https://www.biorxiv.org/content/10.1101/2025.04.28.651001v1
- Documentación de Cellpose: https://cellpose.readthedocs.io/
- Web oficial de Cellpose: https://www.cellpose.org/
- Repositorio GitHub MouseLand/cellpose: https://github.com/MouseLand/cellpose
