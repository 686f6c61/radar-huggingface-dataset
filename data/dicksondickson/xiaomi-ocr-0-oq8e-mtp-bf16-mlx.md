# dicksondickson/Xiaomi-OCR-0-oQ8e-mtp-bf16-MLX

## Resumen

Xiaomi-OCR-0-oQ8e-mtp-bf16-MLX es una cuantización, publicada por el usuario dicksondickson, del modelo Xiaomi-OCR-0 de SeerRay-Lab, un modelo de visión-lenguaje (VLM) especializado en OCR y análisis de documentos. La conversión se ha realizado con la herramienta oQ (oMLX 0.7.3.dev2) mediante cuantización de precisión mixta con matriz de importancia (imatrix) y la técnica "Better Low-Bit oQ", dejando los tensores más importantes en bf16. El resultado es un repositorio de aproximadamente 1,0 GB en formato safetensors para el ecosistema MLX de Apple.

El modelo base, Xiaomi-OCR-0, pertenece a la familia qwen3.5 según las etiquetas del repositorio, lo que sugiere una arquitectura basada en Qwen3.5 adaptada a tareas de parsing de documentos. Con unos 873 millones de parámetros, se trata de un modelo compacto orientado a extraer texto de imágenes de forma eficiente en hardware de consumo, concretamente en chips Apple Silicon M3 o posteriores.

Su relevancia radica en la combinación de tres factores: un tamaño reducido que permite ejecución local en Macs sin GPU dedicada, una especialización en OCR y document-parsing (tarea de alta demanda para RAG y digitalización), y una licencia MIT que permite uso comercial sin restricciones.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | VLM basado en la familia qwen3.5 (detalles no disponibles) |
| Parámetros totales | 873.438.784 (~873 M) |
| Parámetros activos | no disponible (no hay evidencia de que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | oQ8e (cuantización mixta imatrix con Better Low-Bit oQ; tensores críticos en bf16) |
| Idiomas soportados | no disponibles |
| Licencia | MIT |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El repositorio es una cuantización, no el modelo original, por lo que gran parte de los detalles de arquitectura y entrenamiento corresponden al modelo base SeerRay-Lab/Xiaomi-OCR-0, cuya model card no está incluida en la información disponible. Según las etiquetas, el modelo pertenece a la familia qwen3.5, lo que indica un diseño de transformer visual-lenguaje derivado de esa familia, aunque no se han publicado datos sobre el número de tokens de entrenamiento, composición del dataset ni uso de RLHF/DPO.

En cuanto a la cuantización en sí, se empleó oQ (oMLX 0.7.3.dev2), una herramienta de cuantización para MLX que utiliza matrices de importancia (imatrix) para decidir la precisión de cada tensor. La variante oQ8e con "Better Low-Bit oQ" aplica precisión mixta: los tensores considerados críticos se mantienen en bf16 y el resto se cuantiza a 8 bits, un compromiso que preserva la calidad del OCR minimizando el tamaño en disco. Esta configuración está pensada específicamente para chips Apple M3 y posteriores.

## Capacidades

- OCR y parsing de documentos: extracción de texto a partir de imágenes, según la especialización del modelo base (tags document-parsing, ocr, vlm).
- Comprensión visual-lenguaje: al tratarse de un VLM, puede procesar entradas multimodales imagen + texto, aunque el alcance exacto no está documentado.
- Ejecución local en Apple Silicon: diseñado para el framework MLX, optimizado para M3 y posteriores.
- No hay información disponible sobre tool calling, capacidades de agente, razonamiento multi-step, generación de código, matemáticas ni soporte de audio.

## Casos de uso

- Digitalización de documentos en local: convertir escaneos, facturas o contratos a texto en un Mac sin enviar datos a la nube, útil cuando la privacidad es un requisito (datos médicos, legales o financieros).
- Preprocesamiento para RAG: extraer texto de PDFs escaneados e imágenes para alimentar pipelines de generación aumentada por recuperación, con un coste de infraestructura mínimo dado el tamaño del modelo.
- Automatización de entrada de datos: transcripción automática de formularios, albaranes o tickets en flujos de back-office ejecutados en estaciones de trabajo macOS.
- Accesibilidad: generar descripciones textuales de documentos e imágenes para usuarios con discapacidad visual, integrado en aplicaciones locales.
- Prototipado rápido de OCR en apps nativas de Apple: el formato MLX permite integrar el modelo en aplicaciones macOS/iOS con baja fricción.
- Procesamiento por lotes de archivos históricos: dada su huella de ~1 GB, puede desplegarse en Macs de gama media para digitalizar archivos de forma masiva sin hardware especializado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: con un repo de 1,0 GB en precisión mixta bf16/8-bit, el modelo debería ocupar en torno a 1-1,5 GB de memoria unificada en inferencia, más el overhead del runtime y de las imágenes de entrada.
- Hardware recomendado: chips Apple Silicon M3 o posteriores, según indica el autor de la cuantización; no hay datos de compatibilidad con CUDA u otras plataformas.
- Consumer hardware: cabe cómodamente en cualquier Mac con chip M3 (MacBook Air, MacBook Pro, Mac mini) sin necesidad de GPU dedicada.
- Despliegue: el autor indica ejecutarlo con oMLX (https://github.com/jundot/omlx). No hay evidencia de soporte directo en vLLM, llama.cpp, Ollama o TGI, ya que el formato es MLX/safetensors específico de Apple.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Formato | Licencia | Especialización |
|---|---|---|---|---|
| Xiaomi-OCR-0-oQ8e-mtp-bf16-MLX (este) | ~873 M | MLX safetensors (oQ8e mixto) | MIT | OCR / document parsing |
| Xiaomi-OCR-0 (base, SeerRay-Lab) | no disponible | no disponible | MIT (según tags del derivado) | OCR / document parsing |
| PaddleOCR-VL / modelos OCR compactos equivalentes | no disponible | no disponible | no disponible | OCR |

Nota: no hay información suficiente en los datos proporcionados para una comparativa detallada de contexto, rendimiento o disponibilidad con alternativas concretas; los datos marcados como "no disponible" no han sido publicados en el repositorio.

## Limitaciones y advertencias

- Documentación escasa: ni el derivado ni la model card del base incluida aquí detallan arquitectura, contexto, idiomas ni capacidades exactas, lo que dificulta la evaluación previa a producción.
- Plataforma limitada: la cuantización está orientada a Apple Silicon M3+ con oMLX; no hay instrucciones para ejecución en NVIDIA/AMD.
- Riesgo de alucinación: al ser un VLM, puede generar texto no presente en la imagen; en OCR crítico (facturas, documentos legales) conviene validar contra la fuente o usar mecanismos de verificación.
- Sesgos: no documentados; no disponible.
- Licencia: MIT, sin restricciones conocidas para uso comercial, aunque conviene verificar también la licencia del modelo base SeerRay-Lab/Xiaomi-OCR-0.
- Adopción mínima: 97 descargas y 1 like en el momento de la ficha, sin comunidad de soporte ni historial de fiabilidad.
- Calidad de la cuantización: aunque la precisión mixta bf16 mitiga la pérdida, no se han publicado evaluaciones comparando esta cuantización con el modelo base en bf16 completo.

## Enlaces

- Repositorio del modelo: https://huggingface.co/dicksondickson/Xiaomi-OCR-0-oQ8e-mtp-bf16-MLX
- Modelo base: https://huggingface.co/SeerRay-Lab/Xiaomi-OCR-0
- Herramienta de cuantización oMLX/oQ: https://github.com/jundot/omlx
