# mlx-community/DeepSeek-V4-Pro-Qwen3.5-9B-8bit

## Resumen

DeepSeek-V4-Pro-Qwen3.5-9B-8bit es una conversión cuantizada a 8 bits en formato MLX del modelo Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B, publicada por la comunidad mlx-community. El modelo original combina, según su nomenclatura y etiquetas, una destilación de conocimiento de DeepSeek sobre una base Qwen3.5 de aproximadamente 9.400 millones de parámetros, orientada a razonamiento, uso de herramientas y flujos agénticos. Esta variante mantiene la torre de visión en BF16 y cuantiza únicamente los pesos del modelo de lenguaje con cuantización afín de 8 bits y tamaño de grupo 64.

Su relevancia práctica es doble: por un lado, ofrece capacidades multimodales (texto, imagen y vídeo) en un tamaño que cabe en equipos de consumo con memoria unificada; por otro, está empaquetado específicamente para Apple Silicon mediante MLX, lo que permite ejecutar inferencia local en Macs con chip M-series sin depender de CUDA. El pipeline declarado es image-text-to-text y el contexto se etiqueta como long-context, aunque la longitud exacta no se detalla en la información disponible.

La licencia Apache 2.0 y el soporte declarado de seis idiomas (inglés, chino, coreano, japonés, español y ruso) lo sitúan como una opción atractiva para prototipado y despliegue local de asistentes multimodales con tool calling. No obstante, al tratarse de una conversión de comunidad, conviene validar el comportamiento del chat template, del procesador multimodal y de la fidelidad respecto al modelo original antes de usarlo en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (modelo de lenguaje Qwen3.5 con torre de visión), según etiquetas y nomenclatura; detalles exactos no disponibles |
| Parametros totales | 9.409.813.744 (~9,4 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (etiquetado como long-context) |
| Tipos de cuantizacion | 8 bits afín (affine), tamaño de grupo 64, solo en el modelo de lenguaje; torre de visión en BF16 |
| Idiomas soportados | en, zh, ko, ja, es, ru |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors en formato MLX (repo de 10,4 GB) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de las etiquetas del repositorio: se trata de un modelo multimodal image-text-to-text construido sobre una base Qwen3.5, con etiquetas que indican destilación desde DeepSeek y capacidades de razonamiento, tool use y function calling. El pipeline incluye una torre de visión que procesa entradas de imagen y vídeo, y un modelo de lenguaje que en esta conversión se ha cuantizado a 8 bits con cuantización afín y grupo de 64, mientras que la torre de visión se conserva en BF16.

La conversión fue realizada con mlx-vlm versión 0.4.4 a partir de la revisión 7d7edca1b1e8 del modelo Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B. Un detalle técnico relevante es que el loader de Qwen3.5 en mlx-vlm 0.4.4 omite la cabeza MTP (multi-token prediction) del modelo original, por lo que esta variante no conserva esa capacidad de decodificación especulativa. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF o DPO en el modelo base.

## Capacidades

- Generación de texto y razonamiento: el modelo está etiquetado explícitamente con reasoning y procede de una destilación orientada a tareas de razonamiento.
- Generación de código: la model card incluye ejemplos de prompts de programación (por ejemplo, parseo de JSONL y conteo de registros por etiqueta).
- Entrada multimodal de imagen: pipeline image-text-to-text con torre de visión preservada en BF16.
- Entrada de vídeo: la etiqueta video y la mención a entradas "image/video-style" en la model card indican soporte de vídeo, aunque no se detallan límites de frames ni resolución.
- Tool calling y function calling: etiquetas tool-use y function-calling presentes en el repositorio.
- Flujos agénticos y razonamiento multi-paso: coherente con las etiquetas reasoning y tool-use, aunque sin benchmarks publicados que lo cuantifiquen.
- Multilingüe: inglés, chino, coreano, japonés, español y ruso.
- Contexto largo: etiqueta long-context sin longitud numérica especificada.
- Modo conversacional: etiqueta conversational y chat template heredado del modelo fuente.

## Casos de uso

- Asistente de código local en Mac: el modelo puede generar funciones y refactorizaciones directamente en Apple Silicon con mlx-vlm, usando temperatura baja (0.2 en el ejemplo de la model card) para tareas deterministas de programación.
- Análisis de documentos con imágenes: al aceptar image-text-to-text, puede procesar capturas de pantalla, diagramas o páginas escaneadas y devolver descripciones o extracciones estructuradas, útil en herramientas de accesibilidad o digitalización.
- Automatización de soporte técnico con tool calling: las etiquetas function-calling permiten integrarlo en un orquestador que consulte APIs internas (estado de pedidos, tickets) y componga respuestas multi-turno.
- Procesamiento de vídeo para resumen: la etiqueta video sugiere uso en pipelines de resumen o descripción de clips, por ejemplo para moderación de contenido o generación de metadatos.
- Prototipado de agentes multi-paso en local: combinando razonamiento y tool use, sirve para experimentar con bucles de planificación-ejecución sin coste de API, aprovechando la cuantización de 8 bits para reducir memoria.
- Asistencia multilingüe en atención al cliente: con soporte de español, inglés, chino, coreano, japonés y ruso, puede gestionar conversaciones en varios idiomas dentro de una misma aplicación.
- Evaluación e investigación de destilaciones: útil para estudiar cómo se comporta una destilación DeepSeek sobre base Qwen3.5 en tareas de razonamiento, comparándola con el modelo fuente sin cuantizar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria estimada: el repositorio ocupa 10,4 GB en safetensors de 8 bits; en ejecución se necesita memoria adicional para el contexto KV y los buffers de la torre de visión en BF16, por lo que conviene reservar holgadamente por encima de los 10,4 GB.
- Plataforma objetivo: Apple Silicon con MLX; la model card indica explícitamente que está pensado para inferencia en Apple Silicon.
- Cabe en GPU de consumo: en el ecosistema Mac, equipos con memoria unificada de 16 GB o superior son el mínimo razonable; 24 GB o más ofrece margen para contextos largos y entradas de vídeo. No hay indicación de soporte CUDA en esta conversión.
- GPU recomendadas: no aplica en el sentido CUDA; el equivalente práctico son chips Apple M-series con memoria unificada amplia (M2 Pro/Max, M3 Pro/Max, M4 Pro/Max).
- Opciones de despliegue: mlx-vlm (recomendado para multimodal, versión 0.4.4 o superior); mlx-lm solo para uso textual. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI para este repositorio.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Multimodal | Licencia | Formato/plataforma |
|---|---|---|---|---|---|
| mlx-community/DeepSeek-V4-Pro-Qwen3.5-9B-8bit | ~9,4 B | no disponible (long-context) | Sí (imagen y vídeo) | Apache 2.0 | MLX 8 bits, Apple Silicon |
| Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B (modelo base) | ~9,4 B | no disponible | Sí | Apache 2.0 | Pesos originales, sin cuantizar |
| Qwen3.5-9B (base genérica) | ~9 B | no disponible | no disponible | no disponible | no disponible |

La comparación cuantitativa con alternativas de la misma categoría no está disponible: no se han publicado benchmarks ni especificaciones de contexto que permitan contrastar rendimiento frente a otros modelos de ~9 B. La diferencia principal frente al modelo base es la cuantización a 8 bits y el empaquetado MLX, que reducen el peso del repositorio a 10,4 GB y habilitan inferencia local en Apple Silicon, a costa de la omisión de la cabeza MTP.

## Limitaciones y advertencias

- Es una conversión de comunidad, no oficial: la fidelidad respecto al modelo Jackrong original debe validarse empíricamente antes de usarla en producción.
- La cabeza MTP del modelo fuente se omite en esta conversión, por lo que se pierde cualquier ventaja de decodificación especulativa asociada.
- La cuantización a 8 bits puede degradar ligeramente tareas sensibles a precisión numérica, como matemáticas complejas o generación de código muy específica.
- Riesgo de alucinación inherente a los modelos de ~9 B, especialmente en razonamiento multi-paso y contextos largos; no hay benchmarks publicados que acoten este riesgo.
- No se especifica la longitud exacta de contexto, lo que impide planificar con precisión el uso de documentos extensos o vídeos largos.
- El soporte de idiomas declarado no garantiza calidad uniforme; el español figura en la lista, pero no hay evaluaciones publicadas por idioma.
- Restricción de plataforma: el formato MLX limita el despliegue a Apple Silicon; no es directamente utilizable en servidores CUDA sin reconversión.
- Licencia Apache 2.0 permite uso comercial, pero conviene revisar la licencia y condiciones del modelo base y de los datos de destilación originales.
- El uso de mlx-lm en lugar de mlx-vlm puede romper el procesamiento multimodal; la model card recomienda explícitamente mlx-vlm para entradas de imagen y vídeo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mlx-community/DeepSeek-V4-Pro-Qwen3.5-9B-8bit
- Modelo base: https://huggingface.co/Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B
- Revisión usada en la conversión: https://huggingface.co/Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B/tree/7d7edca1b1e820d89127f9c8ac4b035e0f27652e
- Librería mlx-vlm: no disponible en la información proporcionada (se instala con `pip install -U mlx-vlm`)
