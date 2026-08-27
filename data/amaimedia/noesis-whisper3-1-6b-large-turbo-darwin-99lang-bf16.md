# AMAImedia/NOESIS-Whisper3-1.6B-Large-Turbo-Darwin-99LANG-BF16

## Resumen

NOESIS-Whisper3-1.6B-Large-Turbo-Darwin-99LANG-BF16 es un modelo de reconocimiento automático del habla (ASR) multilingüe desarrollado por AMAImedia como parte de su plataforma profesional de doblaje automatizado NOESIS (framework DHCF-FNO). Se trata de una fusión (merge) de los encoders de los modelos Whisper Large V3 y Whisper Large V3 Turbo de OpenAI, manteniendo el decoder completo de 32 capas de Whisper Large V3. El resultado combina la robustez multilingüe del V3 completo con las representaciones destiladas del Turbo, ofreciendo soporte para 99 idiomas con una huella de memoria reducida.

El modelo está pensado como componente auxiliar en pipelines de doblaje: identificación de idioma, timestamps a nivel de palabra, transcripción de referencia validada y transcripción de respaldo para los 99 idiomas soportados por Whisper. Con aproximadamente 1,54 mil millones de parámetros y un peso en BF16 de unos 2,94 GB, cabe en GPUs de consumo con 6 GB de VRAM y se carga mediante la API estándar de Transformers. Su licencia MIT permite uso comercial sin restricciones adicionales, lo que lo hace atractivo para integración en productos.

La relevancia actual de este modelo radica en su enfoque híbrido: aprovecha la calidad de generación del decoder completo de Whisper Large V3 (32 capas) mientras reduce el coste computacional del encoder mediante el promedio ponderado con las representaciones destiladas del Turbo. Esto lo sitúa como una opción intermedia entre el V3 completo (más pesado) y el V3 Turbo (más ligero pero con decoder reducido a 4 capas), orientada a escenarios donde se necesita precisión en transcripción y sincronización temporal sin sacrificar rendimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | WhisperForConditionalGeneration (encoder-decoder transformer) |
| Parametros totales | 1.543.490.560 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (Whisper usa ventanas de audio de 30 segundos por defecto) |
| Tipos de cuantizacion | BF16 (nativo); no se documentan cuantizaciones adicionales |
| Idiomas soportados | 99 idiomas (conjunto multilingüe de Whisper); metadatos locales listan 30 idiomas principales: en, ru, zh, ja, ko, es, fr, de, pt, it, ar, hi, bn, tr, vi, th, id, nl, pl, uk, fa, ro, el, sv, he, cs, hu, fi, no, da |
| Licencia | MIT |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura WhisperForConditionalGeneration de OpenAI, un transformer encoder-decoder con atención completa. El encoder consta de 32 capas con `d_model` de 1280, resultado de un promedio ponderado por tensor entre los encoders de Whisper Large V3 (peso 0.55) y Whisper Large V3 Turbo (peso 0.45). El decoder se mantiene íntegro de Whisper Large V3, con 32 capas, a diferencia del Turbo que solo tiene 4. El vocabulario es de 51.866 tokens.

La estrategia de fusión se basa en la compatibilidad lineal de los vectores de tarea entre ambos modelos, dado que Turbo fue destilado a partir de V3 completo. El promedio de encoders combina la robustez multilingüe del V3 con las representaciones destiladas del Turbo, mientras que el decoder completo preserva la calidad de generación autoregresiva. No se documentan datos de entrenamiento adicionales más allá de los datasets base de Whisper (openai/whisper-multilingual). El modelo se publica en BF16 para evitar la pérdida de calidad que introduciría una cuantización NF4 en el decoder autoregresivo, sensible al ruido de cuantización.

## Capacidades

- Transcripción automática del habla en 99 idiomas, con soporte multilingüe completo del conjunto Whisper.
- Identificación de idioma (language ID) a partir del audio.
- Generación de timestamps a nivel de palabra, útil para subtitulado y sincronización.
- Transcripción de referencia validada para idiomas de alto recurso (el modelo reporta WER ~5-7% en ruso sobre Common Voice 25.0 dev).
- Funciona como transcripción de respaldo en pipelines de doblaje cuando el modelo principal falla.
- Compatible con la API estándar de Transformers (`WhisperForConditionalGeneration.from_pretrained`), sin necesidad de código personalizado.
- Factor de tiempo real de aproximadamente 0.05-0.10, es decir, procesa audio entre 10 y 20 veces más rápido que la duración real.
- No se documentan capacidades de tool calling, agentes ni razonamiento multi-paso; es un modelo puramente de ASR.

## Casos de uso

- Doblaje automatizado multilingüe: el modelo actúa como ASR auxiliar en el pipeline NOESIS, proporcionando transcripciones de referencia y timestamps a nivel de palabra para alinear el audio doblado con el original.
- Subtitulado automático: genera transcripciones con marcas temporales precisas para crear subtítulos en 99 idiomas, reduciendo el trabajo manual de sincronización.
- Transcripción de reuniones y conferencias: su factor de tiempo real de 0.05-0.10 permite transcribir grabaciones largas en lote sin necesidad de GPUs de alta gama, ya que cabe en 2 GB de VRAM.
- Identificación de idioma en archivos de audio: útil para clasificar automáticamente grabaciones multilingües o enrutar audios a sistemas de transcripción especializados.
- Archivado y búsqueda de contenido audiovisual: transcribe archivos de vídeo o audio para indexación y búsqueda por texto, con soporte para 99 idiomas.
- Asistencia a personas con discapacidad auditiva: genera subtítulos en tiempo real o diferido para contenido educativo o de entretenimiento, con licencia MIT que permite integración comercial.
- Verificación de calidad en sistemas ASR: al ser un modelo de referencia con decoder completo, puede usarse para validar transcripciones producidas por modelos más ligeros o cuantizados.

## Benchmarks y rendimiento

La información disponible solo incluye una medición propia del autor sobre Common Voice 25.0 RU dev, realizada en una RTX 3060 6 GB el 2026-05-08:

| Metrica | Valor |
|---|---|
| WER (ruso, Common Voice 25.0 dev) | ~5-7% |
| Factor de tiempo real | 0.05-0.10 |
| Pico de VRAM (BF16) | ~2.0 GB |

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, etc.) porque se trata de un modelo de ASR, no de lenguaje general. Tampoco hay comparaciones formales con otros modelos ASR en la información proporcionada. Los datos de WER son aproximados y provienen de la model card del autor, no de una evaluación independiente.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2.0 GB en BF16, según la model card.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; el autor valida su funcionamiento en una RTX 3060 6 GB.
- Cabe en GPUs de consumo: sí, en tarjetas con 6 GB o más (RTX 3060, RTX 4060, etc.). Con 2 GB de VRAM, también podría ejecutarse en GPUs más modestas, aunque no se documenta.
- Opciones de despliegue: compatible con Transformers nativo (carga mediante `from_pretrained`). No se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI, que son más habituales para modelos de lenguaje; para ASR, el flujo estándar es usar el pipeline de Transformers.
- Latencia y throughput: factor de tiempo real de 0.05-0.10, lo que implica procesar 1 minuto de audio en 3-6 segundos en una RTX 3060.

## Comparativa con modelos similares

| Modelo | Parametros | Decoder | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| NOESIS-Whisper3-1.6B (este) | 1.54B | 32 capas (V3 completo) | 99 | MIT | BF16 safetensors | Merge de encoders V3 + Turbo |
| openai/whisper-large-v3 | 1.55B | 32 capas | 99 | MIT | FP16/BF16 | Modelo original completo, mayor VRAM |
| openai/whisper-large-v3-turbo | 809M | 4 capas | 99 | MIT | FP16/BF16 | Versión destilada, más rápida pero decoder reducido |

La comparativa se basa en las especificaciones conocidas de los modelos base. No hay datos de rendimiento comparativo independiente para este merge. La principal diferencia frente a V3 completo es el encoder promediado (menor coste computacional) y frente a Turbo, el decoder completo (mayor calidad de generación). El tamaño en disco del modelo es de 2.94 GB frente a los ~3 GB de V3 completo y ~1.6 GB de Turbo.

## Limitaciones y advertencias

- El modelo es una fusión experimental de dos modelos base; no hay evaluaciones independientes que validen su rendimiento más allá de la medición del autor en ruso.
- El WER reportado (~5-7% en ruso) es una cifra propia, no contrastada por terceros, y puede variar en otros idiomas o dominios.
- No se documentan datos de entrenamiento propios; el modelo se basa en los pesos de Whisper, por lo que hereda los sesgos y limitaciones de los datos de entrenamiento de OpenAI (posible infrarrepresentación de acentos, dialectos o idiomas de bajos recursos).
- Riesgo de alucinación en transcripciones, especialmente en audio de baja calidad o con ruido, común en todos los modelos Whisper.
- La longitud de contexto no se especifica; Whisper procesa ventanas de 30 segundos de audio, por lo que audios más largos requieren segmentación.
- Aunque la licencia es MIT, el modelo se distribuye como parte del bundle NOESIS con atribución requerida; conviene revisar los términos completos de la licencia en el repositorio.
- No se garantiza soporte para todos los 99 idiomas con la misma calidad; los metadatos locales solo listan 30 idiomas principales como "operativos".
- El modelo está pensado como componente auxiliar, no como ASR principal en el pipeline NOESIS; para cobertura de 1600+ idiomas, el autor recomienda otros modelos de su familia.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/AMAImedia/NOESIS-Whisper3-1.6B-Large-Turbo-Darwin-99LANG-BF16
- Modelo relacionado (variante FP16): https://huggingface.co/AMAImedia/Whisper-Large-V3-Turbo-Darwin-NOESIS-FP16
- Discusiones del modelo relacionado: https://huggingface.co/AMAImedia/Whisper-Large-V3-Turbo-Darwin-NOESIS-FP16/discussions
- Página de análisis del modelo relacionado: https://free2aitools.com/model/amaimedia/whisper-large-v3-turbo-darwin-noesis-fp16
- Modelos base: https://huggingface.co/openai/whisper-large-v3 y https://huggingface.co/openai/whisper-large-v3-turbo
- Dataset de referencia: https://huggingface.co/datasets/openai/whisper-multilingual
