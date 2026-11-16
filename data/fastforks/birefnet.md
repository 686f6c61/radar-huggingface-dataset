# fastforks/birefnet

## Resumen

BiRefNet (fastforks) es una ficha de empaquetado para el modelo BiRefNet, una red neuronal bilateral de referencia propuesta por Zheng et al. (CAAI AIR 2024) para segmentación dicotómica de imágenes de alta resolución y eliminación de fondo (matting). El repositorio `fastforks/birefnet` no aloja pesos: actúa como tarjeta de modelo y manifiesto de descarga que verifica los pesos originales de los autores mediante SHA-256, ofreciendo kernels optimizados para los backends `portable` y `kernels`.

El modelo resuelve la tarea de separar un objeto saliente del fondo generando una máscara alfa `[H, W]` en el rango [0, 1] a la resolución de entrada. Su arquitectura combina un codificador Swin Transformer v1 a resolución completa y media con un decodificador que incorpora bloques ASPP deformables, parches de imagen como referencia y atención de gradiente. Está disponible en tres variantes: `birefnet`, `birefnet-lite` y `rmbg-2.0` (pesos de BRIA RMBG-2.0).

La relevancia actual del paquete radica en que estandariza el acceso a estos pesos con verificación criptográfica, ofrece métricas de latencia y memoria medidas en hardware consumer (RTX 5060 Ti 16 GB) y añade rutas de aceleración mediante kernels propios, `torch.compile` y TensorRT. Es un recurso experimental orientado a pipelines de eliminación de fondo en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Swin Transformer v1 (codificador) + decodificador con ASPP deformable y atención de gradiente |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada H x W >= 32, múltiplo de 32) |
| Tipos de cuantizacion | fp16 y fp32 (según precisión del backend); no se documentan cuantizaciones de menor precisión |
| Idiomas soportados | no aplica (modelo de imagen) |
| Licencia | mixta por variante: `birefnet` y `birefnet-lite` MIT; `rmbg-2.0` CC-BY-NC-4.0; código MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

BiRefNet es una red de segmentación dicotómica que emplea un codificador Swin Transformer v1 a dos escalas (completa y media). El decodificador integra bloques ASPP deformables, utiliza parches de la imagen de entrada como referencia bilateral y aplica atención de gradiente para refinar los bordes del objeto segmentado. La salida es una única máscara de primer plano por imagen, con resolución igual a la entrada.

El entrenamiento se realizó sobre múltiples conjuntos de datos: DIS5K (segmentación dicotómica), DUTS (detección de objetos salientes), HRSOD, UHRSD y HRS10K (detección saliente de alta y ultra-alta resolución) y P3M-10k (matting de retratos con preservación de privacidad). La model card no detalla el número de tokens ni la composición exacta del dataset, ni si se aplicaron fases de RLHF o DPO (no aplicables en un modelo de segmentación). Algunos de estos conjuntos tienen términos de uso exclusivamente de investigación, aunque la licencia de los pesos MIT es la que rige el uso comercial según la propia ficha.

## Capacidades

- Segmentación dicotómica de imágenes: genera una máscara alfa `[H, W]` en [0, 1] donde 1 indica primer plano.
- Eliminación de fondo (background removal) sobre imágenes RGB de resolución arbitraria (H x W >= 32, múltiplo de 32).
- Matting guiado por trimapa en las variantes que lo soportan (fondo / desconocido / primer plano).
- Procesamiento a resoluciones muy altas: probado hasta 3000x4000 píxeles en fp16.
- Tres variantes de pesos intercambiables: `birefnet` (calidad completa), `birefnet-lite` (menor coste) y `rmbg-2.0` (pesos de BRIA).
- Backends de ejecución `portable` (PyTorch) y `kernels` (kernels optimizados de fastforks).
- Aceleración mediante `torch.compile` y exportación a ONNX + TensorRT en fp16.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües (es un modelo puramente visual).

## Casos de uso

- Eliminación de fondo en e-commerce: procesar imágenes de producto a 1080x1920 en ~121 ms con la variante `birefnet` y backend `kernels`, generando máscaras alfa para catálogos con fondos transparentes.
- Edición fotográfica por lotes: usar `birefnet-lite` (~48 ms por imagen a 1080x1920) para pipelines de retoque masivo donde el coste por imagen es crítico.
- Matting de retratos con preservación de privacidad: aprovechar el entrenamiento sobre P3M-10k para anonimizar sujetos recortándolos de fondos sensibles.
- Procesamiento de imágenes de alta resolución: segmentar fotografías de hasta 3000x4000 píxeles con un pico de memoria de 1,7 GiB en `birefnet`, adecuado para archivos fotográficos o satelitales.
- Integración en producción con TensorRT: desplegar la variante `birefnet` con TensorRT fp16 para reducir la latencia a 87,8 ms por imagen a 1080x1920, con un coste de preparación de 201 s para construir el motor.
- Segmentación de objetos salientes en investigación: emplear el modelo como baseline en tareas de detección saliente sobre DUTS o HRSOD, dado su entrenamiento específico en esos conjuntos.
- Servicios de videoconferencia o streaming: usar `birefnet-lite` con backend `kernels` para sustitución de fondo en tiempo real, con latencias por debajo de 50 ms por fotograma a 1080x1920.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (mIoU, MAE, S-measure) en la información disponible. Los datos proporcionados son de latencia y memoria medidas en una RTX 5060 Ti 16 GB (sm_120) con entrada sintética de 1080x1920:

| Modelo | Tiempo original (ms) | Portable (ms) | Kernels (ms) | Aceleración kernels vs original | Memoria pico asignada (MiB) |
|---|---|---|---|---|---|
| `birefnet` | 234 | 131 | 121 | 1,9x | 1660 |
| `birefnet-lite` | 75,1 | 58,0 | 48,1 | 1,6x | 810 |
| `rmbg-2.0` | 149 | 132 | 121 | 1,2x | 1660 |

| Modelo | Carga original (s) | Carga portable (s) | Carga kernels (s) | Primera llamada original (s) | Primera llamada portable (s) |
|---|---|---|---|---|---|
| `birefnet` | 3,60 | 0,46 | 13,58 | 0,39 | 0,56 |
| `birefnet-lite` | 8,04 | 0,67 | 0,20 | 1,10 | 0,42 |
| `rmbg-2.0` | 6,42 | 0,94 | 0,64 | 0,94 | 0,49 |

Con `torch.compile` y TensorRT fp16 a 1080x1920: `birefnet` alcanza 138 ms con compile y 87,8 ms con TensorRT; `birefnet-lite` 50,2 ms y 49,0 ms; `rmbg-2.0` 110 ms y 88,1 ms. La preparación de TensorRT requiere 201 s (`birefnet`), 156 s (`birefnet-lite`) y 219 s (`rmbg-2.0`).

## Requisitos de hardware

- VRAM estimada para inferencia: pico asignado de 1,66 GiB (`birefnet`, `rmbg-2.0`) y 0,81 GiB (`birefnet-lite`) a 1080x1920 en fp16; hasta 1,7 GiB a 3000x4000.
- GPU recomendadas: RTX 5060 Ti 16 GB (hardware de referencia); cualquier GPU con al menos 4 GB de VRAM es suficiente para resoluciones estándar en fp16.
- Cabe en GPU consumer: sí, en todas las variantes; `birefnet-lite` es la más ligera (0,9 GiB reservados a 3000x4000).
- Opciones de despliegue: backend `portable` (PyTorch), backend `kernels` (kernels de fastforks), `torch.compile`, ONNX + TensorRT fp16.
- Latencia y throughput: 48-131 ms por imagen a 1080x1920 según variante y backend; 87,8 ms con TensorRT fp16 en `birefnet`. La carga del modelo oscila entre 0,20 s y 13,58 s según variante y backend.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entrada | Latencia 1080x1920 (kernels) | Licencia | Uso comercial |
|---|---|---|---|---|---|
| `birefnet` (fastforks) | no disponible | H x W >= 32, hasta 3000x4000 | 121 ms | MIT | sí |
| `birefnet-lite` (fastforks) | no disponible | H x W >= 32, hasta 3000x4000 | 48,1 ms | MIT | sí |
| `rmbg-2.0` (BRIA, vía fastforks) | no disponible | H x W >= 32, hasta 3000x4000 | 121 ms | CC-BY-NC-4.0 | no |
| BiRefNet original (ZhengPeng7) | no disponible | H x W >= 32 | 234 ms (referencia) | MIT (pesos) | sí |

La comparativa se limita a las variantes incluidas en el propio paquete y al código original de referencia. No se dispone de datos de benchmarks de calidad que permitan comparar con alternativas externas como U2-Net, IS-Net o SAM.

## Limitaciones y advertencias

- Modelo experimental (tier: experimental) según la propia ficha; no recomendado como componente crítico sin validación previa.
- El repositorio no aloja pesos: depende de la disponibilidad de los repositorios de los autores (`ZhengPeng7/BiRefNet`, `ZhengPeng7/BiRefNet_lite`, `briaai/RMBG-2.0`) y de la verificación SHA-256.
- La variante `rmbg-2.0` tiene licencia CC-BY-NC-4.0 y no permite uso comercial; solo `birefnet` y `birefnet-lite` (MIT) son aptos para producción comercial.
- Algunos conjuntos de entrenamiento (HRSOD, UHRSD, P3M-10k, entre otros) tienen términos de uso exclusivamente de investigación; la ficha aclara que solo la licencia de los pesos rige el flag comercial, pero conviene revisarlo.
- Riesgo de alucinación en el sentido de máscaras incorrectas en objetos ambiguos, transparentes o con bordes de bajo contraste; no se documentan métricas de error (MAE, mIoU) que permitan cuantificarlo.
- No soporta idiomas ni texto: es exclusivamente visual; no aplica sesgo lingüístico, pero puede heredar sesgos de los datasets de entrenamiento (retratos, objetos salientes).
- La resolución de entrada debe ser múltiplo de 32; imágenes no conformes requieren padding.
- La primera llamada con el backend `kernels` en `birefnet` implica una carga de 13,58 s, muy superior a la del backend `portable` (0,46 s).
- La compilación con TensorRT requiere entre 156 y 219 s de preparación, lo que penaliza despliegues efímeros.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/fastforks/birefnet
- Pesos originales BiRefNet: https://huggingface.co/ZhengPeng7/BiRefNet
- Pesos originales BiRefNet Lite: https://huggingface.co/ZhengPeng7/BiRefNet_lite
- Pesos RMBG-2.0 (BRIA): https://huggingface.co/briaai/RMBG-2.0
- Código de fastforks: https://github.com/kleinicke/fastforks
- Kernels de fastforks: https://huggingface.co/fastforks/kernels
- Código original de BiRefNet: https://github.com/ZhengPeng7/BiRefNet
- Benchmarks de fastforks: https://github.com/kleinicke/fastforks/blob/main/docs/benchmarks.md
- Manifiesto de variantes: https://github.com/kleinicke/fastforks/blob/main/src/fastforks/matting/models/birefnet/card.toml
- Licencia del código original: https://github.com/ZhengPeng7/BiRefNet/blob/f7079632d681ecf12161fcea8905682934e59e51/LICENSE
