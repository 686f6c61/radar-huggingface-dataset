# grabbou/edsr-x2-CoreAI

## Resumen

EDSR x2 para Core AI es un modelo de superresolución de imagen que implementa la arquitectura EDSR (Enhanced Deep Residual Networks) con un factor de escalado de 2x, exportado al formato nativo de Apple Core AI para su ejecución en dispositivos iOS y macOS. Lo publica el usuario grabbou en HuggingFace a partir de los pesos MIT de torchSR y de la receta de exportación oficial de `apple/coreai-models`. No es un modelo de lenguaje ni un transformer generativo: es una red convolucional de imagen a imagen de tan solo 1,5 millones de parámetros.

El modelo resuelve una tarea muy concreta: duplicar la resolución de una imagen RGB manteniendo la fidelidad visual, con un binario de 2,6 MB que cabe en cualquier app móvil. Su relevancia actual radica en el ecosistema: Core AI es el runtime de Apple para modelos en dispositivo, y este repositorio demuestra el flujo completo de exportación desde PyTorch (vía torchSR) a un artefacto `.aimodel` ejecutable en iOS y macOS. Es, por tanto, más un ejemplo de integración y un componente de pipeline que un modelo de propósito general.

La ficha se centra en sus especificaciones reales, sus límites operativos (resolución de entrada por teselas, batch máximo, precisión float16) y en cómo integrarlo en aplicaciones móviles mediante la librería `@react-native-ai/core-ai`. No hay información publicada sobre benchmarks, idiomas ni datos de entrenamiento más allá de la referencia al paper original de EDSR.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | EDSR (Enhanced Deep Residual Networks), red convolucional con bloques residuales; variante `edsr_r16f64_x2` (16 bloques residuales, 64 canales) |
| Parametros totales | 1,5 M (aprox.) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de imagen a imagen; entrada `[batch, 3, height, width]` con height y width entre 8 y 256) |
| Tipos de cuantizacion | exportado en float16; no se documentan otras precisiones |
| Idiomas soportados | no disponible (no es un modelo de texto) |
| Licencia | MIT |
| Formato de pesos | `.aimodel` (Apple Core AI); origen PyTorch vía torchSR |
| Factor de escalado | 2x |
| Rango de batch | 1 a 64 |
| Rango de resolucion de entrada | 8 a 256 px de alto y ancho (imágenes mayores se procesan por teselas) |
| Formato de entrada | RGB en rango 0...1, float16 |
| Tamano del artefacto | 2,6 MB |
| Plataformas | iOS, macOS |
| Libreria | coreai |

## Arquitectura y entrenamiento

La arquitectura es EDSR, presentada en el paper *Enhanced Deep Residual Networks for Single Image Super-Resolution* (arXiv:1707.02921). Se trata de una red totalmente convolucional basada en bloques residuales sin normalización por lotes, una decisión de diseño que en el paper original mejora la estabilidad y el rendimiento frente a SRResNet. La variante concreta exportada es `edsr_r16f64_x2`: 16 bloques residuales con 64 canales de característica y factor de escala 2, lo que da lugar a los aproximadamente 1,5 millones de parámetros indicados en la model card.

No se dispone de información sobre el dataset de entrenamiento, el número de tokens o imágenes, ni sobre si hubo ajuste fino posterior. Los pesos proceden de torchSR, la implementación de referencia en PyTorch, y la model card solo documenta el proceso de conversión: `uv run models/edsr/export.py --dtype float16 --dynamic`, que produce un artefacto con batch dinámico (1–64) y dimensiones espaciales dinámicas (8–256). La innovación técnica destacable no está en el modelo en sí, sino en el pipeline de exportación a Core AI y en la gestión automática de teselado para imágenes de más de 256 píxeles.

## Capacidades

- Superresolución de imagen con factor 2x sobre entradas RGB en float16.
- Procesamiento por lotes con batch de 1 a 64 imágenes.
- Entrada dinámica en altura y anchura dentro del rango 8–256 píxeles.
- Teselado automático para imágenes de más de 256 píxeles mediante `CoreAI.runTask('super-resolution', ...)`.
- Ejecución en dispositivo en iOS y macOS a través del runtime Core AI.
- Invocación directa de la función `main(x)` con `CoreAI.runRawFunction`.
- Integración con React Native mediante `@react-native-ai/core-ai`.
- No soporta tool calling, agentes, razonamiento multi-step, texto, visión semántica, audio ni modo thinking: es exclusivamente un modelo de imagen a imagen.

## Casos de uso

- Mejora de miniaturas en apps de galería: al duplicar la resolución de imágenes pequeñas (por ejemplo, 128x128 a 256x256) en el propio dispositivo, se evita subir datos a un servidor y se reduce la latencia percibida al abrir una cuadrícula de fotos.
- Previsualización de imágenes descargadas en baja resolución: una app de mensajería puede mostrar primero una versión comprimida y aplicar EDSR x2 localmente para dar nitidez mientras llega el archivo original, aprovechando el binario de 2,6 MB y el batch de hasta 64.
- Restauración de capturas de pantalla y documentos escaneados: el modelo mejora el detalle de imágenes de hasta 256 px por lado (o por tesela) antes de pasarlas a un OCR en dispositivo, sin depender de la red.
- Procesamiento por lotes en macOS: un script de escritorio puede invocar el artefacto `.aimodel` con batch de 64 para preparar datasets de imágenes de entrenamiento a mayor resolución, con coste cero de GPU en la nube.
- Integración en pipelines de React Native: mediante `CoreAI.runTask('super-resolution', ...)` se puede añadir un paso de mejora de imagen a una app multiplataforma sin escribir código nativo de Core ML.
- Prototipado y validación de flujos Core AI: el repositorio sirve como referencia reproducible para equipos que quieran exportar sus propios modelos de PyTorch a `.aimodel` y verificar el pipeline completo con un caso pequeño y bien acotado.
- Mejora de avatares y fotos de perfil: con entradas típicas de 64x64 a 128x128, el modelo cabe holgadamente en el rango dinámico y produce una salida de 128x128 a 256x256 en el dispositivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de PSNR, SSIM ni comparaciones cuantitativas con otras variantes de EDSR o con modelos alternativos de superresolución.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; al ser un modelo de 1,5 M de parámetros en float16, el peso ronda los 3 MB y las activaciones dependen del tamaño de entrada y del batch, pero no se publican cifras.
- GPU recomendadas: no aplica en el sentido tradicional; el destino es el hardware Apple (GPU/Neural Engine de iPhone, iPad y Mac) a través de Core AI.
- Cabe en GPU de consumo: sí, por tamaño, aunque el runtime objetivo es Core AI en dispositivos Apple; no se documenta soporte para CUDA, ROCm ni otros backends.
- Opciones de despliegue: Apple Core AI (formato `.aimodel`), con integración vía `@react-native-ai/core-ai` (`CoreAI.runRawFunction` o `CoreAI.runTask('super-resolution', ...)`). No se documentan exportaciones a vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a este tipo de modelo.
- Latencia y throughput estimados: no disponibles. El rendimiento dependerá del dispositivo, del tamaño de entrada y del número de teselas necesarias para imágenes mayores de 256 px.

## Comparativa con modelos similares

| Modelo | Parametros | Factor | Formato / runtime | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| grabbou/edsr-x2-CoreAI | 1,5 M | 2x | `.aimodel` (Apple Core AI) | MIT | HuggingFace, repo de 0,0 GB |
| EDSR `edsr_r16f64_x2` en torchSR | 1,5 M | 2x | PyTorch | MIT | GitHub (Coloquinte/torchSR) |
| Receta EDSR de apple/coreai-models | no disponible | 2x | Core AI | no disponible en la informacion | GitHub (apple/coreai-models) |

No se dispone de datos de rendimiento comparado (PSNR/SSIM) entre estas variantes ni frente a otros modelos de superresolución como ESRGAN o SwinIR, por lo que la comparativa se limita a parámetros, formato, licencia y disponibilidad.

## Limitaciones y advertencias

- Modelo especializado exclusivamente en superresolución 2x; no realiza generación de texto, razonamiento, código, visión semántica ni ninguna otra tarea.
- Entrada limitada a 8–256 px por dimensión; las imágenes mayores requieren teselado, lo que puede introducir costuras visibles en los bordes de las teselas si no se aplica solapamiento.
- Solo se documenta precisión float16; no hay información sobre comportamiento en float32 u otras precisiones.
- Sin datos publicados sobre sesgos, composición del dataset de entrenamiento ni evaluación cualitativa; el riesgo de artefactos en texturas finas, rostros o texto no está caracterizado.
- Riesgo de alucinación visual: como toda red de superresolución, puede inventar detalle plausible pero inexistente en la imagen original; no debe usarse en contextos forenses o médicos sin validación.
- Licencia MIT, que permite uso comercial, pero la model card solo cubre la conversión; los pesos originales de torchSR son también MIT según el autor.
- Dependencia del ecosistema Apple: el artefacto `.aimodel` no es portable a otros runtimes sin reconversión.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta, y tamaño de repo de 0,0 GB; conviene verificar la integridad de los archivos antes de integrarlo en producción.
- No hay información sobre idiomas porque el modelo no procesa texto.

## Enlaces

- HuggingFace: https://huggingface.co/grabbou/edsr-x2-CoreAI
- Paper EDSR: https://arxiv.org/abs/1707.02921
- torchSR (origen de los pesos): https://github.com/Coloquinte/torchSR
- Receta de exportación de Apple: https://github.com/apple/coreai-models/tree/main/models/edsr
- Librería React Native Core AI: https://github.com/callstackincubator/ai/tree/main/packages/core-ai
