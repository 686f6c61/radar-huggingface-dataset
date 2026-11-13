# inYourOwnBrowser/imagegrains-2.0-onnx

## Resumen

ImageGrains 2.0 ONNX es una exportación autocontenida de los pesos preentrenados oficiales del modelo ImageGrains 2.0, desarrollado por David Mair y colaboradores (repositorio original `dmair1989/imagegrains`) y publicada en Hugging Face por el usuario `inYourOwnBrowser`. El modelo resuelve un problema muy específico de la geociencia: la segmentación de instancias de granos sedimentarios (gravas fluviales, cantos, guijarros y clastos) en imágenes para derivar distribuciones de tamaño de partícula (D16, D50, D84) y morfometría de granos. No es un modelo de lenguaje, sino un modelo de visión por computador orientado a segmentación.

La relevancia de esta publicación concreta reside en el formato: se han eliminado las dependencias de Python y Numba y se han empaquetado los pesos en archivos `.onnx` individuales de menos de 2 GB, lo que permite ejecutar la inferencia íntegramente en el navegador mediante `onnxruntime-web` (WebGPU o WebAssembly), sin subir imágenes a ningún servidor. Se ofrecen dos variantes: un U-Net Cellpose de 26,6 MB en FP32 para WebGPU y CPU, y un Cellpose-SAM ViT-L con decodificador de flujo de unos 588 MB en FP16 para WebGPU de escritorio.

La arquitectura subyacente es la del framework Cellpose (versiones 2/3 para el U-Net y 4.1.x para la variante SAM), adaptada mediante transfer learning al dominio de sedimentos fluviales. No se dispone de información sobre el número de parámetros totales, la longitud de contexto (no aplica) ni los idiomas soportados (no aplica), por lo que esos campos se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | U-Net `CPnet` (Cellpose-2/3) en la variante rápida; ViT-L + decodificador de flujo (Cellpose-SAM) en la variante de alta precisión |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada por teselas de 256×256 o dimensiones dinámicas) |
| Tipos de cuantizacion | FP32 (`ig2_unet_fp32.onnx`) y FP16 nativo (`ig2_cpsam_fp16.onnx`) |
| Idiomas soportados | no disponible (no aplica; modelo de segmentación de imágenes) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | ONNX (opset 17 para el U-Net, opset 18 para la variante SAM) |

## Arquitectura y entrenamiento

La variante `ig2_unet_fp32.onnx` deriva del checkpoint `IG2_full_set.200525` y emplea la arquitectura `CPnet` de Cellpose-2/3, un U-Net con bloques de estilo y atención que produce tres canales de salida espacial: flujo en Y, flujo en X y logits de probabilidad de célula/grano. La exportación se realizó desde `cellpose==3.1.1.1` con opset 17; para permitir dimensiones espaciales dinámicas se sustituyó el `avg_pool2d` de kernel dinámico de `CPnet.make_style` por un `ReduceMean` equivalente (`x.mean(dim=(-2, -1))`). La paridad numérica con PyTorch FP32 se verificó con un error absoluto máximo inferior a 10⁻⁴.

La variante `ig2_cpsam_fp16.onnx` parte del checkpoint `IG2_full_set_cp_SAM` y utiliza la arquitectura Cellpose-SAM, basada en un ViT-L con decodificador de flujo. Se exportó desde `cellpose==4.1.x` mediante `torch.export.export` y el exportador ONNX de PyTorch Dynamo (opset 18), instanciando el modelo nativamente en `torch.float16` antes del trazado para evitar desajustes de precisión mixta. La paridad con PyTorch FP16 se verificó con un error absoluto máximo de 3,91 × 10⁻³, equivalente a 1 ULP en `float16`. No se dispone de información sobre el volumen de tokens de entrenamiento, la composición exacta del dataset ni el uso de RLHF/DPO, ya que el modelo se entrena mediante transfer learning supervisado sobre imágenes de sedimentos y no es un modelo generativo de lenguaje.

## Capacidades

- Segmentación de instancias de granos sedimentarios (gravas, cantos, guijarros, clastos) en imágenes.
- Cálculo de distribuciones de tamaño de partícula (D16, D50, D84) a partir de las máscaras extraídas.
- Extracción de morfometría de granos (forma, tamaño y métricas derivadas del contorno).
- Inferencia 100 % en el navegador del cliente mediante `onnxruntime-web`, con backends WebGPU y WASM.
- Entrada de imagen en escala de grises normalizada (variante U-Net) o RGB normalizada (variante SAM).
- Salida común de tres canales (`flow_y`, `flow_x`, `cellprob`) que permite compartir el mismo post-procesado de seguimiento de flujo de Euler y extracción de máscaras entre ambas variantes.
- Soporte de dimensiones espaciales dinámicas en la variante U-Net (por ejemplo, 256×256 o 384×512) y de eje de batch dinámico de 1 a 32 en la variante SAM.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües; no es un modelo de lenguaje.

## Casos de uso

- Análisis de campo con dispositivo móvil: un geólogo puede cargar una fotografía de grava fluvial en una aplicación web y obtener la distribución de tamaños de partícula sin conexión a un servidor, gracias a la variante U-Net FP32 de 26,6 MB que funciona en WebGPU y WASM.
- Laboratorio de sedimentología sin infraestructura de GPU: la variante U-Net permite procesar lotes de imágenes en CPU mediante WASM, eliminando la necesidad de instalar Python, Numba o CUDA.
- Aplicaciones web de ciencia ciudadana: investigadores pueden desplegar una herramienta pública donde los usuarios suban fotos de ríos y reciban métricas de granulometría, manteniendo las imágenes en el navegador por privacidad.
- Procesamiento por lotes de alta precisión en escritorio: la variante Cellpose-SAM FP16 (588 MB) se ejecuta en WebGPU de escritorio con soporte de `Float16Array` (Chrome/Edge ≥ 135, Safari ≥ 17.4) para obtener segmentaciones más precisas en estudios que requieran mayor exactitud.
- Integración en pipelines de investigación reproducibles: al ser ONNX autocontenido, el modelo puede incorporarse a flujos de trabajo en JavaScript/TypeScript o en cualquier runtime compatible con ONNX, facilitando la reproducibilidad entre plataformas.
- Docencia y demostraciones interactivas: la inferencia en navegador permite mostrar en tiempo real cómo se segmentan granos y se calculan D16/D50/D84 en un aula, sin depender de servidores ni instalaciones locales.
- Monitorización de cauces fluviales: combinado con captura de imágenes en campo, el modelo puede alimentar bases de datos de granulometría para estudios de transporte de sedimentos y geomorfología fluvial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente reporta verificaciones de paridad numérica frente a PyTorch (error absoluto máximo < 10⁻⁴ en FP32 y 3,91 × 10⁻³ en FP16), no métricas de calidad de segmentación como IoU, Dice o precisión de D50.

## Requisitos de hardware

- VRAM estimada: la variante U-Net FP32 (26,6 MB de pesos) requiere muy poca memoria y puede ejecutarse en CPU; la variante SAM FP16 (588 MB de pesos) necesita una GPU con soporte de WebGPU y `Float16Array`.
- GPU recomendadas: cualquier GPU de escritorio con WebGPU para la variante SAM; la variante U-Net funciona también en CPU y en móviles mediante WASM.
- Cabe en GPU de consumo: sí, ambas variantes; la U-Net es especialmente ligera y la SAM requiere un navegador moderno con soporte de FP16.
- Opciones de despliegue: `onnxruntime-web` con execution providers `webgpu` y `wasm`; al ser ONNX, también puede ejecutarse en otros runtimes compatibles con ONNX (no especificados en la información disponible).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Contexto | Licencia | Formato | Ejecucion en navegador |
|---|---|---|---|---|---|---|
| ImageGrains 2.0 ONNX (U-Net) | U-Net CPnet | no disponible | no aplica | CC-BY-4.0 | ONNX FP32 | Sí (WebGPU/WASM) |
| ImageGrains 2.0 ONNX (SAM) | ViT-L + decodificador de flujo | no disponible | no aplica | CC-BY-4.0 | ONNX FP16 | Sí (WebGPU) |
| Cellpose (original) | U-Net / SAM | no disponible | no aplica | no disponible | PyTorch | No (requiere Python) |
| ImageGrains 2.0 (pesos originales) | U-Net / SAM | no disponible | no aplica | no disponible | PyTorch | No (requiere Python/Numba) |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Modelo especializado exclusivamente en segmentación de granos sedimentarios; no es un modelo de propósito general ni un modelo de lenguaje.
- La variante SAM FP16 requiere navegadores con soporte de `Float16Array` (Chrome/Edge ≥ 135, Safari ≥ 17.4) y WebGPU; no funciona en entornos sin estas capacidades.
- La variante U-Net acepta dimensiones dinámicas, pero la SAM está fijada a teselas de 256×256, lo que puede requerir troceado de imágenes grandes.
- No se dispone de información sobre sesgos del dataset de entrenamiento ni sobre su composición, lo que limita la evaluación de generalización a otros tipos de sedimento o condiciones de iluminación.
- Riesgo de alucinación no aplica en el sentido generativo, pero sí existe riesgo de segmentaciones erróneas en imágenes fuera de dominio.
- La licencia CC-BY-4.0 permite uso comercial con atribución; es necesario citar las publicaciones originales de ImageGrains y Cellpose.
- No se han publicado métricas de calidad de segmentación en la información disponible, por lo que no es posible cuantificar su precisión frente a alternativas.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica que es una publicación reciente y sin validación comunitaria amplia.

## Enlaces

- Hugging Face: https://huggingface.co/inYourOwnBrowser/imagegrains-2.0-onnx
- Repositorio original en GitHub: https://github.com/dmair1989/imagegrains
- Pesos preentrenados oficiales en Zenodo: https://zenodo.org/records/15728186 (DOI: 10.5281/zenodo.15728186)
- Framework Cellpose: https://github.com/MouseLand/cellpose
- Documentación de onnxruntime-web: https://onnxruntime.ai/docs/tutorials/web/
- Publicación ImageGrains (2024): DOI 10.1002/esp.5755
- Publicación Cellpose (2021): Stringer et al.
