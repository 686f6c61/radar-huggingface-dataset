# Reza2kn/Bina-0.4-Koochik

## Resumen

Bina 0.4 Koochik es un modelo de reconocimiento óptico de caracteres (OCR) de tipo image-to-text especializado en documentos en persa/farsi, desarrollado por Reza2kn. Se trata de un fine-tuning del modelo NVIDIA Nemotron-3.5-Parse, sobre el que se ha construido un pipeline de transcripción de documentos con capacidad para texto plano, Markdown, matemáticas y tablas. El modelo combina un backbone visual C-RADIOv4-SO400M con un decodificador de texto autorregresivo, sumando 630.800.504 parámetros.

La relevancia de este modelo radica en su enfoque específico hacia el persa, un idioma con escasa representación en modelos OCR de propósito general, y en su despliegue práctico: incluye un runtime WebGPU INT4 que permite inferencia en el navegador del usuario sin subir imágenes a servidores externos. El checkpoint publicado (18.404) corresponde a una instantánea fija de un entrenamiento en curso, con pesos FP32 sin comprimir, y no se sustituye silenciosamente por checkpoints posteriores.

El repositorio incluye un runner de inferencia probado, scripts de configuración para el pipeline de tablas y un benchmark concreto sobre un conjunto congelado de 193 imágenes. La licencia OpenMDW 1.1 y el soporte de idiomas persa e inglés lo sitúan como una opción a evaluar para digitalización de documentos en contextos persófonos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Backbone visual C-RADIOv4-SO400M + decodificador de texto autorregresivo (modelo custom de Transformers) |
| Parámetros totales | 630.800.504 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (límite de 2.048 tokens por intento de generación en el runner) |
| Tipos de cuantización | FP32 (pesos publicados); INT4 en el runtime WebGPU del Space |
| Idiomas soportados | Persa (fa), inglés (en) |
| Licencia | OpenMDW 1.1 |
| Formato de pesos | Safetensors |
| Pipeline | image-to-text |
| Modelo base | nvidia/Nemotron-3.5-Parse (finetune) |
| Tamaño del repositorio | 2,5 GB |
| Descargas | 375 |
| Likes | 4 |

## Arquitectura y entrenamiento

Bina 0.4 Koochik es un modelo multimodal de imagen a texto que empareja un backbone de visión C-RADIOv4-SO400M con un decodificador de texto autorregresivo. El modelo se deriva por fine-tuning de NVIDIA Nemotron-3.5-Parse y se distribuye como modelo custom de Transformers, lo que exige `AutoModel`/`AutoProcessor` con `trust_remote_code=True` en lugar de un pipeline genérico. El checkpoint publicado (18.404) son los pesos FP32 originales sin comprimir, guardados durante un entrenamiento en curso; la configuración de entrenamiento, optimizador, sampler y estado no se modificaron para esta release, y no se incluyen estados de optimizador, RNG ni imágenes de evaluación.

El modelo se acompaña de un pipeline de inferencia con dos rutas principales. La política `layout-v2` aplica una segmentación puramente a nivel de píxel (partición de barras laterales sombreadas y división de filas en blanco grandes), con decodificación greedy, penalización de repetición de 1,1, límite de 2.048 tokens por intento y reintento de resolución de política de origen como máximo una vez. La política `table-v3` (actualización pública del 24 de noviembre de 2026) añade un modelo de layout Surya fijado en CPU y un modelo de tablas separado que propone celdas; una tabla solo se acepta si tiene al menos dos filas y dos columnas y una cobertura de primer plano visible de al menos el 98%, en cuyo caso Koochik lee cada celda aceptada con la misma política de decodificación. No se reentrenaron ni sustituyeron pesos en esa actualización: es una mejora de pipeline, no de pesos.

## Capacidades

- Transcripción OCR de documentos en persa/farsi como caso principal.
- Rutas de tarea para inglés, matemáticas/Markdown y tablas mediante prompts específicos (`--task markup`).
- Detección y lectura de tablas con reconstrucción en Markdown, con orden de columnas físico de izquierda a derecha por defecto y opción `--table-column-order rtl`.
- Inferencia en el navegador mediante runtime WebGPU INT4 (Space público y app standalone), sin subir imágenes ni texto a servidores.
- Entrada de imágenes de página o región en PNG, JPG y WebP; los PDF deben rasterizarse antes de pasarlos al runner.
- Salida JSON con todos los intentos y tokens de región crudos retenidos.
- Ejecución en CUDA con BF16 si está disponible y en CPU con FP32 en caso contrario; `--device cpu` fuerza CPU.
- No se menciona soporte de tool calling, function calling, agentes ni razonamiento multi-paso en la información disponible.

## Casos de uso

- Digitalización de documentos administrativos persas: el modelo transcribe páginas completas o regiones con el runner incluido, adecuado para archivos y formularios en farsi donde los OCR genéricos tienen baja cobertura.
- Extracción de tablas de informes y facturas: la política `table-v3` detecta regiones tabulares, propone celdas y las lee celda a celda, generando Markdown con columnas físicas de izquierda a derecha o RTL según se configure.
- Conversión de documentos técnicos con matemáticas a Markdown: la ruta `--task markup` permite obtener Markdown con fórmulas a partir de imágenes de página.
- OCR en el navegador con privacidad de datos: el Space y la app standalone ejecutan inferencia INT4 WebGPU en el dispositivo del visitante, útil para documentos sensibles que no deben salir del equipo; requiere Chrome/Edge de escritorio con WebGPU y una descarga inicial de unos 770 MB.
- Procesamiento por lotes en servidor: el runner con CUDA/BF16 y `benchmark_submitted10.py` permiten evaluar y ejecutar sobre lotes de imágenes en infraestructura propia, con salida JSON auditable.
- Diagnóstico y depuración de OCR de página completa: la política `--policy original` conserva la inferencia de página entera para analizar casos complejos donde la segmentación por regiones falla.
- Integración en pipelines documentales con validación de cobertura: el criterio del 98% de cobertura de primer plano en tablas permite aceptar o rechazar automáticamente la ruta de tabla y recurrir a `layout-v2` cuando no se cumple.

## Benchmarks y rendimiento

El autor publica resultados sobre el conjunto congelado "original193" (193 imágenes), comparando las políticas de pipeline. El propio autor advierte que el benchmark se usó durante el desarrollo y no es un conjunto de test intacto.

| Pipeline (original193) | Similitud | CER | WER |
|---|---:|---:|---:|
| layout-v2 (anterior) | 86,11% | 27,41% | 36,56% |
| table-v3 (nuevo) | 86,38% | 25,14% | 34,58% |

Todas las 193/193 llamadas tuvieron éxito, sin salidas vacías ni truncadas por límite. Solo dos recortes de tabla detectados por el modelo cambiaron; las otras 191 predicciones fueron idénticas byte a byte a la ejecución anterior. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 630,8 M de parámetros, los pesos FP32 ocupan aproximadamente 2,5 GB, y en BF16 alrededor de 1,3 GB, a lo que hay que sumar el backbone visual y las activaciones.
- GPU recomendadas: no se especifican modelos concretos; el runner usa CUDA con BF16 cuando está disponible.
- Consumer GPU: por tamaño de pesos, es plausible en GPUs de consumo con suficiente VRAM para FP32/BF16, aunque el dato no se confirma en la información disponible.
- Despliegue: runner propio de Python 3.11 con `requirements.txt`, `run_ocr.py` y `setup_table_runtime.py`; CUDA/BF16 o CPU/FP32; runtime WebGPU INT4 en navegador. No se menciona soporte de vLLM, llama.cpp, Ollama ni TGI.
- Los helpers del pipeline de tablas requieren Python 3.10-3.12 por su dependencia fijada de NumPy, y se ejecutan como procesos CPU separados (Surya 0.17/Transformers 4 para tablas y Surya 0.22/Transformers 5 para layout).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Enfoque |
|---|---|---|---|---|---|
| Bina 0.4 Koochik | 630,8 M | No disponible (2.048 tokens por intento) | fa, en | OpenMDW 1.1 | OCR de documentos persa con tablas |
| nvidia/Nemotron-3.5-Parse (base) | No disponible | No disponible | No disponible | No disponible | Modelo de parsing del que deriva |
| OCR genéricos multilingües | No disponible | No disponible | No disponible | No disponible | No se dispone de datos comparativos en la información proporcionada |

No se dispone de datos de benchmarks ni de especificaciones de alternativas comparables en la información proporcionada; la comparativa cuantitativa con otros modelos OCR de la misma categoría queda como no disponible.

## Limitaciones y advertencias

- El checkpoint 18.404 es una instantánea de un entrenamiento en curso; puede no representar el estado final ni el mejor rendimiento del proyecto.
- El benchmark original193 se usó durante el desarrollo y no es un conjunto de test intacto; las puntuaciones de cualificación están acotadas al conjunto congelado de 64/193 y no garantizan el rendimiento por entrada.
- El pipeline `layout-v2` no incluye guarda de parada por pasaje repetido, restricción de no repetición ni eliminación de texto duplicado; el modelo base puede "repetir" texto en páginas complejas completas.
- La ruta `table-v3` puede realizar múltiples llamadas de generación por celda e imagen, cada una con el límite de 2.048 tokens, lo que incrementa el coste computacional del pipeline.
- El navegador solo soporta PNG, JPG y WebP; no procesa PDF directamente. Requiere Chrome/Edge de escritorio con WebGPU y una descarga inicial de unos 770 MB.
- Los helpers del pipeline de tablas exigen Python 3.10-3.12 y ejecutan modelos Surya con sus propias licencias originales; los pesos de Bina mantienen OpenMDW 1.1.
- Riesgo de alucinación y sesgos específicos: no se documentan en la información disponible.
- Cobertura de idiomas limitada a persa e inglés; no se documenta soporte de otros idiomas.
- Para uso comercial, deben revisarse los términos de OpenMDW 1.1 y las licencias de los componentes auxiliares (Surya, modelos de layout y tablas).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Reza2kn/Bina-0.4-Koochik
- Space de demostración: https://huggingface.co/spaces/Reza2kn/Bina-0.4-Koochik
- App standalone: https://reza2kn-bina-0-4-koochik.static.hf.space/index.html
- Modelo base: https://huggingface.co/nvidia/Nemotron-3.5-Parse
- Interfaz persa de referencia: https://persianvlm.com/ocr
