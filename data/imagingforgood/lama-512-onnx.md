# imagingforgood/lama-512-onnx

## Resumen

LaMa (Big-LaMa) 512 ONNX es una conversión a formato ONNX del modelo Big-LaMa de eliminación de objetos e inpainting de imágenes, desarrollado originalmente por Roman Suvorov y colaboradores en Samsung AI Center y publicado en el paper *Resolution-robust Large Mask Inpainting with Fourier Convolutions* (WACV 2022). El repositorio `imagingforgood/lama-512-onnx` no entrena ni modifica el modelo: es una copia sin cambios de una conversión ONNX realizada por Artiva, mantenida para que el proyecto browser-perception pueda depender de ella.

El modelo resuelve la tarea de image inpainting: dado un par imagen + máscara binaria, rellena las regiones enmascaradas con contenido sintetizado coherente con el contexto. Su interés actual radica en que la conversión sustituye las operaciones FFT de las unidades de Fourier por MatMul/Cos/Sin, lo que permite ejecutar el modelo en WebGPU dentro del navegador mediante onnxruntime-web, sin necesidad de backend Python.

La entrada está fijada a 512×512 píxeles, con pesos en FP32 y un tamaño de fichero de aproximadamente 207,6 MB. La licencia es Apache-2.0, aunque el entrenamiento se realizó sobre Places2, cuyos términos restringen el uso a investigación y educación no comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LaMa (Big-LaMa), red generativa con convoluciones rápidas de Fourier (fast Fourier convolutions) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, entrada fija 512×512) |
| Tipos de cuantizacion | no disponible (pesos en FP32 en el fichero ONNX) |
| Idiomas soportados | no aplica (modelo de imagen, sin capacidades lingüísticas) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`lama_512.onnx`, 207.594.478 bytes, SHA-256 `59bfc738a9e9aa419d027aae39f9ed9ad8c36331c780756c45cf83c3d54ee2e6`) |

## Arquitectura y entrenamiento

Big-LaMa es una red de inpainting basada en un generador con convoluciones de Fourier rápidas, que permiten un campo receptivo efectivo global sin el coste cuadrático de la autoatención. El paper original destaca la combinación de estas convoluciones con una pérdida de alta frecuencia (high receptive field perceptual loss) y un entrenamiento sobre máscaras de gran tamaño, lo que produce robustez frente a huecos amplios y arbitrarios. La conversión ONNX sustituye las operaciones FFT de las unidades de Fourier por MatMul/Cos/Sin (la variante FourierUnitJIT del repositorio Carve-Photos/lama) para que el grafo sea compatible con WebGPU; según la model card del conversor, el resultado se verificó contra PyTorch sobre las mismas entradas.

El entrenamiento original se realizó sobre Places2, un dataset de escenas con términos de uso restringidos a investigación y educación no comercial. No se dispone de información sobre el número exacto de tokens o imágenes de entrenamiento, la composición detallada del dataset ni sobre etapas de RLHF o DPO, que no aplican a este tipo de modelo. La innovación técnica relevante para este repositorio es exclusivamente la portabilidad del grafo a ONNX/WebGPU, no cambios en el modelo.

## Capacidades

- Inpainting de imágenes: rellena regiones indicadas por una máscara binaria con contenido sintetizado coherente con el resto de la imagen.
- Eliminación de objetos: al marcar un objeto con la máscara, el modelo genera fondo plausible en su lugar.
- Entrada fija de 512×512 píxeles en formato float32, RGB normalizado a 0..1 (`image` `[1, 3, 512, 512]`).
- Máscara de entrada `[1, 1, 512, 512]` float32, donde 1 indica relleno y 0 indica conservar.
- Salida `[1, 3, 512, 512]` float32 en rango 0..255; los píxeles no enmascarados no están garantizados como inalterados, por lo que debe recomponerse la imagen pegando solo la región enmascarada.
- Ejecución en navegador mediante onnxruntime-web y WebGPU.
- No soporta tool calling, agentes, razonamiento multi-paso, texto, audio ni capacidades multilingües.

## Casos de uso

- Eliminación de objetos en herramientas web de edición fotográfica: el modelo se carga con onnxruntime-web y procesa la imagen y la máscara dibujada por el usuario directamente en el cliente, sin enviar datos a un servidor, lo que es adecuado por privacidad y por la latencia reducida de la inferencia local.
- Limpieza de marcas de agua o logotipos en imágenes de archivo propio: se enmascara el elemento y el modelo reconstruye la textura subyacente; útil en flujos de documentación y catalogación donde se requiere eliminar anotaciones superpuestas.
- Restauración de fotografías con regiones dañadas o rasgadas: la máscara cubre las zonas deterioradas y el inpainting rellena con contenido consistente con el entorno, aprovechando el campo receptivo global de las convoluciones de Fourier.
- Preprocesado en pipelines de visión por computador: eliminación de personas u obstáculos en imágenes de escenas antes de pasarlas a un detector o segmentador, reduciendo falsos positivos en la etapa posterior.
- Edición interactiva en aplicaciones de escritorio o PWA: al ser un grafo ONNX de 207 MB, puede empaquetarse con la aplicación y ejecutarse en GPU del cliente, evitando costes de infraestructura de servidor.
- Generación de datos sintéticos para aumento de dataset: se enmascaran regiones de imágenes existentes para producir variantes con contenido rellenado, ampliando la diversidad de ejemplos de entrenamiento en tareas de segmentación o detección.
- Demostraciones educativas de inpainting en el navegador: el repositorio sirve como dependencia estable para tutoriales y proyectos docentes que muestran el funcionamiento de las convoluciones de Fourier en un contexto web.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el fichero ONNX ocupa 207,6 MB en FP32; la inferencia a 512×512 requiere además memoria para activaciones intermedias, que no se detalla en la información disponible. Como referencia orientativa, un presupuesto de 1-2 GB de VRAM es suficiente para un modelo de este tamaño en FP32, aunque no se confirma con datos del autor.
- GPU recomendadas: no disponible. Al estar orientado a WebGPU, funciona en GPUs integradas y dedicadas compatibles con el navegador; para servidor se puede usar cualquier GPU con soporte de onnxruntime (CUDA, ROCm) o CPU.
- Cabe en GPU de consumo: sí, por tamaño de pesos; no se especifican modelos concretos ni requisitos mínimos en la información proporcionada.
- Opciones de despliegue: onnxruntime-web con WebGPU en navegador; onnxruntime (Python/C++) en servidor; no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Entrada | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| LaMa 512 ONNX (este repositorio) | Inpainting con convoluciones de Fourier | Fija 512×512 | Apache-2.0 (datos de entrenamiento Places2 con restricción no comercial) | ONNX | HuggingFace, 0 descargas, 0 likes |
| LaMa original (advimman/lama) | Inpainting con convoluciones de Fourier | Resolución variable | Apache-2.0 | PyTorch | GitHub oficial de Samsung AI Center |
| Big-LaMa (variante del paper) | Inpainting con convoluciones de Fourier | Resolución variable | Apache-2.0 | PyTorch | Repositorio oficial |

No se dispone de datos de benchmarks ni de modelos comparables adicionales en la información proporcionada; la comparación se limita a variantes del mismo modelo original.

## Limitaciones y advertencias

- La entrada está fija a 512×512 píxeles; imágenes de otra resolución deben redimensionarse antes de la inferencia, lo que puede degradar el resultado en detalles finos.
- Los píxeles no enmascarados de la salida no están garantizados como idénticos a la entrada; es obligatorio recomponer la imagen pegando solo la región enmascarada para evitar artefactos en el resto.
- El modelo se entrenó sobre Places2, cuyos términos de uso son solo para investigación y educación no comercial; la licencia Apache-2.0 cubre código y pesos, pero el uso comercial debe verificarse contra las condiciones del dataset.
- Riesgo de alucinación visual: el contenido generado en las regiones enmascaradas es plausible pero no necesariamente fiel a la realidad subyacente; no debe usarse en contextos forenses o probatorios.
- No se dispone de información sobre sesgos demográficos o culturales del modelo; al entrenarse sobre Places2, puede reproducir los sesgos de composición de ese dataset.
- No soporta texto, razonamiento, tool calling ni agentes; cualquier caso de uso lingüístico queda fuera de su alcance.
- El repositorio tiene 0 descargas y 0 likes, y fue creado en octubre de 2026; no hay evidencia de validación comunitaria independiente más allá de la verificación del conversor contra PyTorch.
- No se especifican requisitos mínimos de hardware ni latencias, por lo que el rendimiento en producción debe medirse empíricamente.

## Enlaces

- HuggingFace: https://huggingface.co/imagingforgood/lama-512-onnx
- Repositorio original de LaMa: https://github.com/advimman/lama
- Paper (arXiv): https://arxiv.org/abs/2109.07161
- Conversión ONNX original (Artiva): https://huggingface.co/artiva-ai/modelos
- Repositorio Carve-Photos/lama (FourierUnitJIT): https://github.com/Carve-Photos/lama
- Proyecto browser-perception: https://imagingforgood.github.io/browser-perception/
- Places2 dataset: http://places2.csail.mit.edu/
