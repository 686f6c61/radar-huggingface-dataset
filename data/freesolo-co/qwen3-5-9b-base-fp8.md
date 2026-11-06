# Freesolo-Co/Qwen3.5-9B-Base-FP8

## Resumen

Qwen3.5-9B-Base-FP8 es una conversión cuantizada en FP8 del checkpoint base Qwen3.5-9B-Base, publicada por el usuario Freesolo-Co. No se trata de un modelo entrenado desde cero ni de una variante instruction-tuned: es el mismo modelo preentrenado de Qwen, con los pesos de sus capas lineales comprimidos a FP8 mediante la librería compressed-tensors. El pipeline declarado es image-text-to-text, lo que confirma que el modelo base es multimodal (incluye torre de visión), aunque la model card no detalla la arquitectura completa.

La relevancia de esta publicación es fundamentalmente práctica: reduce el peso del repositorio a 11,9 GB para 9.409.813.744 parámetros, lo que facilita el despliegue en hardware con memoria limitada manteniendo la licencia Apache 2.0 del modelo original. Al ser un checkpoint base, no incorpora alineación mediante RLHF ni ajuste de instrucciones, por lo que su uso previsto es como punto de partida para fine-tuning o para evaluación de la calidad de la cuantización.

La información disponible es escasa: la model card se limita a describir el proceso de conversión, no incluye datos de entrenamiento, benchmarks ni lista de idiomas. La cuantización aplica FP8 por canal a los pesos lineales y FP8 dinámico por token a las activaciones, dejando en precisión original la torre de visión, las capas de normalización y la cabeza del modelo de lenguaje.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) con capas de atención lineal; detalles completos no disponibles |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (la model card indica que proviene de la configuración fijada del modelo fuente, sin especificar el valor) |
| Tipos de cuantizacion | FP8 (pesos lineales por canal, activaciones dinámicas por token); torre de visión, normalizaciones y cabeza LM en precisión original |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compressed-tensors), compatible con transformers |

## Arquitectura y entrenamiento

El modelo es una conversión del checkpoint Qwen/Qwen3.5-9B-Base en la revisión 68c46c4b3498877f3ef123c856ecfde50c39f404. La arquitectura subyacente es la de Qwen3.5 en su variante de 9B, que según la model card incluye capas de proyección de atención lineal y una torre de visión, lo que la sitúa como un transformer multimodal. No se dispone de detalles sobre el número de capas, dimensión oculta, número de cabezas ni proporción de atención completa frente a atención lineal.

En cuanto al entrenamiento, esta publicación no ha realizado ningún entrenamiento ni ajuste de instrucciones: es una cuantización post-entrenamiento. La model card no aporta datos sobre el corpus de preentrenamiento del modelo original (número de tokens, composición, uso de RLHF o DPO). La innovación técnica de esta versión concreta es el esquema de cuantización: FP8 por canal en pesos lineales y FP8 dinámico por token en activaciones, con exclusión explícita de la torre de visión, las capas de normalización y la cabeza del modelo de lenguaje, que conservan su precisión original. El repositorio incluye un fichero `quantization-report.json` con las versiones exactas, las exclusiones y una comparación de pérdida sobre texto corto, que el autor advierte explícitamente que no constituye una evaluación de calidad exhaustiva.

## Capacidades

- Generación de texto autoregresiva a partir de un checkpoint base preentrenado, sin alineación conversacional.
- Procesamiento de imagen y texto de forma conjunta (pipeline image-text-to-text), gracias a la torre de visión conservada en precisión original.
- Razonamiento y conocimiento general heredados del preentrenamiento de Qwen3.5-9B-Base, sin datos cuantificados disponibles.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible; al ser un modelo base, no se ha verificado ninguna capacidad de este tipo.
- Capacidades multilingües: no disponible (no se publica lista de idiomas).
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Fine-tuning supervisado sobre dominio propio: al ser un checkpoint base con licencia Apache 2.0 y pesos en safetensors, se puede partir de él para ajustar tareas específicas (clasificación, extracción, generación técnica) sin las restricciones de una licencia copyleft.
- Investigación sobre cuantización FP8: el repositorio incluye el informe de cuantización y permite reproducir comparaciones de pérdida y calidad frente al checkpoint original en BF16, útil para estudiar el impacto del esquema por canal y por token.
- Despliegue en memoria limitada: con 11,9 GB de pesos, el modelo cabe en una GPU de 16 GB o en una de 24 GB con margen para caché KV, lo que permite servir el modelo en hardware de gama alta de consumo para pruebas de concepto.
- Prototipado de aplicaciones imagen-texto: la torre de visión en precisión original permite experimentar con tareas de descripción de imágenes o respuesta a preguntas visuales antes de invertir en un modelo instruction-tuned.
- Generación de embeddings o extracción de características: al ser un modelo base, las representaciones internas pueden emplearse para tareas downstream como recuperación o clustering, aunque requeriría verificación empírica.
- Evaluación comparativa de checkpoints base: sirve como referencia para medir la degradación introducida por FP8 frente a la versión BF16 en tareas de lenguaje y visión, dentro de pipelines de evaluación internos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente menciona una comparación de pérdida sobre texto corto incluida en `quantization-report.json`, que el propio autor califica como una comprobación rápida y no como una evaluación de calidad completa.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 12 GB solo para pesos en FP8; con caché KV y activaciones, se recomienda un mínimo de 16 GB para contextos cortos.
- GPU recomendadas: NVIDIA H100, A100 (80 GB o 40 GB), L40S o RTX 6000 Ada para producción; RTX 4090 (24 GB) para desarrollo y pruebas.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) con margen, y en RTX 4080/4070 Ti Super (16 GB) para contextos reducidos; en GPUs de 12 GB requeriría offloading o cuantización adicional.
- Opciones de despliegue: transformers con compressed-tensors para cargar los pesos FP8; vLLM y TGI si soportan el formato compressed-tensors FP8 en la versión correspondiente de Qwen3.5 (no confirmado en la información disponible); llama.cpp y Ollama no están confirmados para este formato.
- Latencia y throughput estimados: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-9B-Base-FP8 (este) | 9,41 B | no disponible | FP8 (compressed-tensors) | Apache 2.0 | Hugging Face, 0 descargas |
| Qwen/Qwen3.5-9B-Base | 9,41 B (según checkpoint origen) | no disponible | BF16 original | Apache 2.0 | Hugging Face (modelo fuente) |
| Alternativas de ~9B con licencia permisiva | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparado con otras alternativas de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Es un checkpoint base, no instruction-tuned: no sigue instrucciones de forma fiable ni mantiene formato conversacional sin ajuste previo.
- La cuantización FP8 puede introducir degradación de calidad frente al modelo en BF16; el autor solo aporta una comprobación de pérdida sobre texto corto, insuficiente para validar tareas complejas.
- No se publica lista de idiomas ni evaluación multilingüe, por lo que el comportamiento fuera del inglés es incierto.
- No se especifica la longitud de contexto efectiva de esta conversión, lo que impide planificar despliegues con ventanas largas.
- Riesgo de alucinación inherente a un modelo base preentrenado sin alineación; no se han publicado evaluaciones de sesgo ni de seguridad.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y el autor es un usuario individual, no el equipo oficial de Qwen: conviene verificar la integridad de los pesos antes de usarlos en producción.
- Licencia Apache 2.0 permite uso comercial, pero al derivar de Qwen3.5-9B-Base conviene revisar también los términos del modelo fuente.
- El soporte de compressed-tensors FP8 depende de la versión de transformers y del backend de inferencia; no se garantiza compatibilidad con todas las herramientas de despliegue.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Freesolo-Co/Qwen3.5-9B-Base-FP8
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B-Base
- Revisión fijada del modelo base: 68c46c4b3498877f3ef123c856ecfde50c39f404
- Informe de cuantización: `quantization-report.json` dentro del repositorio del modelo
- Librería compressed-tensors: no se proporciona enlace en la información disponible
- Paper, blog o demo adicionales: no disponibles
