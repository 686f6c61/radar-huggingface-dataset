# Reza2kn/Bina-0.4-Koochik

## Resumen

Bina 0.4 Koochik es un modelo de OCR (reconocimiento óptico de caracteres) image-to-text de 630,800,496 parámetros, desarrollado por Reza2kn a partir de un fine-tuning de NVIDIA Nemotron-3.5-Parse. Está diseñado específicamente para la transcripción de documentos en persa/farsi, incorporando además rutas de tareas para inglés, matemáticas/Markdown y tablas mediante task prompts.

El modelo combina un backbone visual C-RADIOv4-SO400M con un decodificador de texto autorregresivo. Se publica como una instantánea congelada del checkpoint 18.404 de un entrenamiento aún en curso, con los pesos FP32 originales sin comprimir (2.523.266.632 bytes), lo que garantiza reproducibilidad: los checkpoints posteriores no se sustituyen silenciosamente.

Su relevancia actual radica en la escasez de modelos OCR especializados en persa de calidad, así como en su ecosistema de despliegue: existen derivados cuantizados (CoreML INT4, ONNX INT4, WebGPU INT4 y Tract INT4) que permiten ejecutarlo incluso en el navegador del usuario mediante WebGPU, sin que las imágenes o el texto salgan del dispositivo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision-language (backbone C-RADIOv4-SO400M + decodificador autorregresivo), derivada de NVIDIA Nemotron-3.5-Parse |
| Parámetros totales | 630.800.496 (630,8 M) |
| Parametros activos | No aplicable (no es MoE) |
| Longitud de contexto | No disponible (límite de decodificación por intento: 2.048 tokens) |
| Tipos de cuantización | FP32 (original); derivados oficiales en INT4: CoreML, ONNX, WebGPU y Tract |
| Idiomas soportados | Persa/farsi (fa), inglés (en) |
| Licencia | OpenMDW-1.1 |
| Formato de pesos | Safetensors (FP32); derivados en ONNX y formatos de runtime nativos |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de NVIDIA Nemotron-3.5-Parse. Sustituye o adapta el backbone visual por C-RADIOv4-SO400M y conserva un decodificador de texto autorregresivo para generar la transcripción. Es un modelo personalizado de Transformers: requiere `AutoModel`/`AutoProcessor` con `trust_remote_code=True`, y no funciona con pipelines genéricos ni proveedores de inferencia alojados.

Los datos de entrenamiento concretos (número de tokens, composición del dataset, uso de RLHF/DPO) no están disponibles en la información publicada. El repositorio corresponde al checkpoint 18.404 de un entrenamiento activo, sin incluir estados de optimizador, RNG ni sampler. La inferencia por defecto aplica una política de layout basada solo en píxeles: partición de barras laterales sombreadas y división por filas en blanco grandes, con cada píxel original incluido exactamente una vez, decodificación greedy, repetition penalty 1.1 y un reintento de resolución por región.

## Capacidades

- Transcripción OCR de documentos en persa/farsi (función principal del modelo)
- OCR de texto en inglés mediante task prompts
- Transcripción de expresiones matemáticas y contenido en Markdown (prompt `--task markup`)
- Reconocimiento de tablas mediante task prompts
- Procesamiento de imágenes de página o región (PNG, JPG, WebP; PDF no soportado directamente, requiere rasterizado previo)
- Salida estructurada en JSON con todos los intentos y tokens crudos por región
- Inferencia local en navegador vía WebGPU INT4 (privacidad total: las imágenes no se suben a ningún servidor)

## Casos de uso

- Digitalización de archivos documentales en persa: el modelo transcribe documentos escaneados en farsi con salida JSON estructurada por regiones, adecuada para pipelines de archivado y indexación.
- OCR en el navegador con privacidad garantizada: gracias al runtime WebGPU INT4, las imágenes se procesan íntegramente en el dispositivo del usuario, útil para aplicaciones que manejan documentos sensibles (legales, médicos, gubernamentales).
- Transcripción de contenido académico con fórmulas: la ruta de matemáticas/Markdown permite convertir páginas con notación matemática en Markdown utilizable.
- Extracción de tablas de documentos persas: la ruta de tablas mediante task prompts facilita la estructuración de datos tabulares escaneados.
- Apps móviles y de escritorio en Apple Silicon: los derivados CoreML INT4 y Tract (Metal) permiten inferencia acelerada por GPU en macOS e iOS.
- Pipelines de inferencia en servidor con GPU NVIDIA: el runner ONNX con selección automática CUDA/CPU se integra en servicios de procesamiento masivo de documentos.
- Preprocesamiento para RAG sobre corpus persas: la salida JSON por regiones permite trocear documentos digitalizados para sistemas de búsqueda semántica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, etc.), lo cual es esperable al tratarse de un modelo OCR especializado. La única métrica publicada es la paridad de caracteres NFC (conjunto congelado de 64 muestras) entre cada derivado cuantizado y la referencia FP32 sin comprimir del checkpoint 18.404:

| Derivado | Paridad de caracteres (Frozen64) |
|---|---:|
| CoreML INT4 | 98,9028 % |
| ONNX INT4 (CUDA/CPU) | 98,9028 % |
| WebGPU INT4 (navegador) | 98,8603 % |
| Tract INT4 (Metal/CPU) | 98,8745 % (CPU), 98,9170 % (Metal) |

Importante: esta métrica mide acuerdo con el modelo fuente (incluyendo sus errores de OCR), no precisión de OCR anotada por humanos, y no constituye una garantía por entrada individual. La prueba de humo del runner CPU FP32 transcribió ambas líneas de la imagen demo exactamente, pero es una verificación de instalación, no un resultado de precisión sobre corpus.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible como cifra explícita; con pesos FP32 de 2,5 GB, el modelo completo cabe con holgura en GPUs con 8 GB de VRAM. Los derivados INT4 reducen sustancialmente el footprint (el runtime de navegador descarga unos 770 MB).
- GPU recomendadas: cualquier GPU NVIDIA compatible con CUDA y BF16 para el runner Python (por ejemplo RTX 3060 o superior); en macOS ARM64, Tract Metal o CoreML para aceleración por GPU de Apple.
- Consumer GPUs: sí, el modelo es pequeño (630 M de parámetros) y funciona incluso en CPU con FP32; el runner probado en CPU FP32 transcribió correctamente la demo. En navegador funciona en Chrome/Edge de escritorio con WebGPU.
- Opciones de despliegue: runner Python oficial (`run_ocr.py`, PyTorch/Transformers con `trust_remote_code=True`), runner ONNX con selección automática CUDA/CPU, CoreML en Apple, Tract con Metal en macOS ARM64, y demo en Hugging Face Spaces / app standalone WebGPU. No hay soporte indicado para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. Se sabe que el runtime de navegador mantiene cuatro sesiones residentes tras la primera carga para procesar imágenes posteriores sin redescarga.

## Comparativa con modelos similares

| Modelo | Parámetros | Tarea | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Bina 0.4 Koochik | 630,8 M | OCR image-to-text | fa, en | OpenMDW-1.1 | Pesos FP32 + derivados INT4 (CoreML, ONNX, WebGPU, Tract) |
| NVIDIA Nemotron-3.5-Parse (base) | No disponible | Document understanding / OCR | Multilingüe (persa no especializado) | Consultar ficha de NVIDIA | Hugging Face |
| Tesseract (persa) | No aplicable | OCR tradicional | fa (soporte limitado) | Apache-2.0 | Muy amplia, sin comprensión de layout moderno |

No se dispone de datos de rendimiento comparativo directo entre estos modelos en la información publicada.

## Limitaciones y advertencias

- Las puntuaciones de cualificación publicadas están acotadas al conjunto congelado de 64 muestras; no constituyen una garantía de precisión por entrada individual.
- La paridad con el modelo fuente incluye los errores de OCR del propio modelo fuente; no es precisión anotada por humanos.
- Limitaciones documentadas en texto decorativo pequeño, logotipos, caligrafía, escaneos de baja calidad y layouts largos y complejos.
- El modelo fuente puede repetir texto en páginas completas complejas; la política por defecto mitiga esto con partición por regiones, pero no existe guardia de parada por repetición ni eliminación de duplicados.
- CUDA BF16 y CPU FP32 son perfiles aritméticos distintos y pueden producir salidas autorregresivas diferentes.
- No soporta PDF directamente: hay que rasterizar las páginas antes de pasarlas al runner.
- Es un modelo custom de Transformers: requiere `trust_remote_code=True`, con las implicaciones de seguridad que ello conlleva al ejecutar código remoto.
- Cualquier variante ternaria experimental debe evaluarse por su propia evidencia de calidad y runtime; el nombre no implica soporte nativo BitNet ni beneficio de velocidad.
- No se ha publicado información sobre sesgos del modelo ni riesgo de alucinación cuantificado.
- La licencia OpenMDW-1.1 debe revisarse en su texto completo para conocer las condiciones exactas de uso comercial.

## Enlaces

- Modelo original: https://huggingface.co/Reza2kn/Bina-0.4-Koochik
- Modelo base: https://huggingface.co/nvidia/Nemotron-3.5-Parse
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/Reza2kn/Bina-0.4-Koochik
- App standalone (WebGPU): https://reza2kn-bina-0-4-koochik.static.hf.space/index.html
- Derivado CoreML INT4: https://huggingface.co/Reza2kn/Bina-0.4-Koochik-CoreML-INT4
- Derivado ONNX INT4: https://huggingface.co/Reza2kn/Bina-0.4-Koochik-ONNX-INT4
- Derivado WebGPU INT4: https://huggingface.co/Reza2kn/Bina-0.4-Koochik-ONNX-WebGPU-INT4
- Derivado Tract INT4: https://huggingface.co/Reza2kn/Bina-0.4-Koochik-Tract-INT4
- Repositorio de checkpoints fuente: `Reza2kn/Bina-0.4-Nemotron-Checkpoints-20261025`
