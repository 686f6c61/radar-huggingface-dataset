# InterpreticAI/Qwen3.8-27B-Uncensored-v2-IQ3_XXS-GGUF

## Resumen

Qwen3.8-27B-Uncensored-v2-IQ3_XXS-GGUF es una cuantización de 3 bits (IQ3_XXS) del modelo Qwen3.8-27B-Uncensored-v2, publicado por InterpreticAI. Se trata de una variante del Qwen3.8-27B original a la que se le ha eliminado en gran medida la censura política, empaquetada en formato GGUF para su uso con llama.cpp. El objetivo es ofrecer un modelo de 27.320 millones de parámetros que quepa en GPU de consumo con 12-16 GB de VRAM, manteniendo la reducción de censura del modelo base.

El modelo es multimodal (pipeline image-text-to-text): además del fichero principal del modelo de lenguaje (10,5 GB), el repositorio incluye un proyector de visión opcional en F16 (0,93 GB) que habilita la entrada de imágenes. La licencia es Apache 2.0, heredada del Qwen3.8-27B original, y conserva la atribución del equipo Qwen. La conversión se realizó con llama.cpp.

Esta build está pensada para entornos con memoria limitada donde no es posible cargar la versión Q4_K_M (16,8 GB). El autor documenta una pérdida de rendimiento medible respecto a Q4_K_M: unos 4 puntos de MMLU, mayor tasa de degeneración en respuestas largas y un ligero descenso en la tasa de rechazo de peticiones dañinas. Por tanto, es una opción de compromiso entre huella de memoria y calidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.8-27B; detalles de atención no disponibles) |
| Parametros totales | 27.320.697.856 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 32.768 tokens (valor usado en los comandos de ejemplo; máximo nativo no disponible) |
| Tipos de cuantizacion | IQ3_XXS (3 bits) para el modelo de lenguaje; F16 para el proyector de visión |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base más allá de su procedencia: es una variante de Qwen3.8-27B, un transformer de 27.320 millones de parámetros. No se especifican en la información proporcionada la composición del dataset de entrenamiento, el número de tokens, ni si hubo fases de RLHF o DPO. Tampoco se detalla el método exacto empleado para eliminar la censura política respecto al modelo original.

La innovación técnica documentada en esta ficha es la cuantización IQ3_XXS realizada con llama.cpp, que reduce el modelo de lenguaje a 10,5 GB, más un proyector de visión separado en F16 (0,93 GB) para entrada de imágenes. El autor indica que la reducción de censura se preserva en este tamaño, aunque con degradación de calidad respecto a Q4_K_M. Se recomienda usar los parámetros de muestreo publicados para Qwen3.8-27B y, para modo no-thinking, pasar `--chat-template-kwargs '{"enable_thinking": false}'`.

## Capacidades

- Generación de texto conversacional multi-turno (tag `conversational`).
- Entrada de imágenes mediante el proyector de visión opcional (pipeline image-text-to-text).
- Modo thinking y modo no-thinking (este último activable por parámetro de plantilla de chat).
- Reducción de censura política respecto al modelo Qwen3.8-27B original, según la evaluación del autor.
- Compatibilidad con endpoints (`endpoints_compatible`) y con llama.cpp / llama-server.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles (idiomas no especificados).

## Casos de uso

- Despliegue en GPU de consumo con 12-16 GB de VRAM: el tamaño de 10,5 GB del modelo de lenguaje permite cargarlo en tarjetas como RTX 3060 de 12 GB o RTX 4070 Ti de 16 GB, usando llama-server con `-ngl 999`.
- Análisis de imágenes en local: con el proyector `mmproj` F16 se pueden procesar entradas image-text-to-text en el mismo equipo sin depender de servicios en la nube.
- Investigación sobre censura en modelos: el modelo sirve para estudiar el comportamiento de respuestas ante preguntas políticas (el autor evalúa con 113 preguntas de Pan & Xu, 2026), útil en trabajos de alineación y evaluación de sesgos.
- Prototipado de asistentes conversacionales con contexto de 32.768 tokens: adecuado para conversaciones largas o documentos extensos en entornos con poca memoria.
- Pruebas de robustez y seguridad: permite medir tasas de rechazo ante peticiones dañinas (el autor reporta 85 de 100 en el conjunto `mlabonne/harmful_behaviors`) en pipelines de red-teaming.
- Evaluación comparativa de cuantizaciones: sirve como referencia para medir la degradación de calidad de IQ3_XXS frente a Q4_K_M en tareas como MMLU.

## Benchmarks y rendimiento

Evaluación del autor con llama-server (modo no-thinking, decodificación greedy). La censura política se mide con 113 preguntas de Pan & Xu (2026) etiquetadas por un juez LLM; el rechazo de peticiones dañinas con los primeros 100 prompts del split de test de `mlabonne/harmful_behaviors`.

| Métrica | Q4_K_M | Esta build (IQ3_XXS) |
|---|---|---|
| Tamaño de fichero | 16,8 GB | 10,5 GB |
| MMLU (1.000 ítems) | 81,9 | 78,0 |
| Respuestas censuradas (de 113) | 5 | 3 |
| Rechazo de peticiones dañinas (de 100) | 92 | 85 |
| Respuestas degeneradas en 110 prompts neutros | 1 | 7 |

## Requisitos de hardware

- VRAM estimada: unos 10,5 GB para el modelo de lenguaje en IQ3_XXS; añadir 0,93 GB si se carga el proyector de visión F16 (total aproximado de 11,4 GB).
- GPU recomendadas: tarjetas con 12-16 GB de VRAM (el autor indica explícitamente ese rango); con 12 GB hay margen ajustado, con 16 GB es holgado.
- Cabe en GPU de consumo: sí, en modelos de 12 GB o más (por ejemplo RTX 3060 12 GB, RTX 4070 Ti 16 GB).
- Opciones de despliegue: llama.cpp / llama-server (comando documentado con `-ngl 999 -c 32768 --jinja`); otras opciones como vLLM u Ollama no se mencionan en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | MMLU | Licencia | Formato |
|---|---|---|---|---|---|
| Esta build (IQ3_XXS) | 27,3 B | 32.768 (usado en ejemplos) | 78,0 | Apache 2.0 | GGUF |
| Qwen3.8-27B-Uncensored-v2 Q4_K_M | 27,3 B | no disponible | 81,9 | Apache 2.0 | GGUF |
| Qwen3.8-27B-Uncensored-v2 BF16 | 27,3 B | no disponible | no disponible | Apache 2.0 | safetensors |
| Qwen3.8-27B-Uncensored-v2 FP8 | 27,3 B | no disponible | no disponible | Apache 2.0 | no disponible |

La comparación se limita a las variantes del mismo modelo base publicadas por el autor. No se dispone de datos de benchmarks de modelos alternativos de otros desarrolladores en la información proporcionada.

## Limitaciones y advertencias

- La evaluación de censura política cubre únicamente preguntas en chino; no se ha validado en otros idiomas.
- Una respuesta sustantiva no implica que sea correcta: el autor recomienda verificar de forma independiente las afirmaciones factuales (riesgo de alucinación).
- Degradación de calidad respecto a Q4_K_M: MMLU baja unos 4 puntos (78,0 frente a 81,9) y las respuestas largas degeneran con más frecuencia (7 frente a 1 en 110 prompts neutros).
- Menor tasa de rechazo de peticiones dañinas (85 de 100 frente a 92 de 100), lo que implica mayor riesgo de generar contenido perjudicial si no se aplican salvaguardas externas.
- La eliminación de censura puede facilitar la generación de contenido político sensible; conviene evaluar el cumplimiento normativo antes de usarlo en producción.
- Licencia Apache 2.0: permite uso comercial, pero debe conservarse la atribución del equipo Qwen.
- Idiomas soportados y longitud máxima de contexto nativa no están documentados en la información disponible.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay validación de la comunidad.

## Enlaces

- HuggingFace (esta build): https://huggingface.co/InterpreticAI/Qwen3.8-27B-Uncensored-v2-IQ3_XXS-GGUF
- Modelo base BF16: https://huggingface.co/InterpreticAI/Qwen3.8-27B-Uncensored-v2
- Variante FP8: https://huggingface.co/InterpreticAI/Qwen3.8-27B-Uncensored-v2-FP8
- Variante Q4_K_M GGUF: https://huggingface.co/InterpreticAI/Qwen3.8-27B-Uncensored-v2-GGUF
- Modelo original Qwen: https://huggingface.co/Qwen/Qwen3.8-27B
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Paper de referencia (Pan & Xu, 2026): https://doi.org/10.1093/pnasnexus/pgag013
