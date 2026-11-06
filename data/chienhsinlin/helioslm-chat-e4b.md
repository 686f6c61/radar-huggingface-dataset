# chienhsinlin/helioslm-chat-e4b

## Resumen

HeliosLM Chat E4B (羲和) es un modelo de chat derivado de Google Gemma 4 E4B-it, desarrollado por el usuario chienhsinlin. El autor realizó un preentrenamiento continuado sobre Gemma 4 E4B con datos públicos en chino tradicional de Taiwán, inglés y otros idiomas, y posteriormente aplicó la diferencia resultante como un chat vector sobre Gemma 4 E4B-it, sin llevar a cabo un SFT adicional. El objetivo es adaptar el modelo base a las convenciones lingüísticas y culturales de Taiwán, incluyendo terminología local y un comportamiento neutral ante temas controvertidos.

El modelo conserva la arquitectura de Gemma 4 E4B, con aproximadamente 8.000 millones de parámetros totales (7.996.156.490 según los pesos en safetensors). Incorpora además un system prompt propio de HeliosLM integrado en la plantilla de chat, que define la identidad del modelo, el uso de terminología taiwanesa y una postura neutral en asuntos políticos; el system prompt definido por el usuario se concatena a continuación de este.

Es relevante por su enfoque de bajo coste computacional para la adaptación regional: en lugar de un fine-tuning completo con SFT, emplea la técnica de chat vector sobre un modelo ya alineado. El autor declara que el rendimiento en benchmarks generales es cercano al de Gemma 4 E4B-it y no supone una mejora sustancial sobre la base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Gemma 4 E4B) |
| Parametros totales | 7.996.156.490 (~8,0 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16; el autor recomienda vLLM o transformers) |
| Idiomas soportados | zh (chino tradicional de Taiwán), en |
| Licencia | Gemma Terms of Use (license: gemma) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Google Gemma 4 E4B, una arquitectura transformer de aproximadamente 8.000 millones de parámetros. El proceso de adaptación consistió en un preentrenamiento continuado sobre el modelo base Gemma 4 E4B con datos públicos en chino tradicional (Taiwán), inglés y otros idiomas. La diferencia de pesos resultante de ese preentrenamiento continuado se añadió como chat vector al modelo ya alineado Gemma 4 E4B-it, sin una fase adicional de SFT. Este enfoque traslada el desplazamiento lingüístico y cultural del preentrenamiento al modelo conversacional manteniendo la alineación original del base.

Como innovación destacable, la plantilla de chat incorpora un system prompt integrado de HeliosLM (autopresentación como 羲和, terminología taiwanesa y neutralidad ante temas controvertidos), al que se añade el system prompt del usuario. El modelo soporta un modo de razonamiento activable mediante el parámetro `enable_thinking=True` de la plantilla de chat. No se dispone de información sobre el número exacto de tokens de entrenamiento ni sobre la composición detallada del dataset.

## Capacidades

- Generación de texto conversacional multi-turno en chino tradicional y en inglés.
- Razonamiento con modo thinking activable (`enable_thinking=True`), empleado en las evaluaciones de MMLU-Pro, AIME y HMMT.
- Razonamiento matemático: resolución de problemas de competición (AIME, HMMT) y aritmética escolar (GSM8K).
- Generación de código: evaluado en HumanEval con pass@1.
- Procesamiento de imagen y texto: la etiqueta image-text-to-text y la pipeline del modelo base indican capacidades multimodales heredadas de Gemma 4 E4B-it.
- Identidad propia consistente: se autodenomina HeliosLM en el 100% de 200 sondas de identidad.
- Neutralidad en temas políticos: 96,1% de respuestas juzgadas neutrales sobre 155 preguntas políticas, sin toma de postura en unificación/independencia (0 de 155).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado explícitamente; el modo thinking permite cadenas de razonamiento largas (hasta 32.768 tokens nuevos en las evaluaciones).

## Casos de uso

- Atención al cliente en Taiwán: el modelo emplea terminología y convenciones del chino tradicional de Taiwán de forma nativa, lo que reduce la fricción en conversaciones multi-turno con usuarios locales frente a un modelo entrenado solo en chino simplificado.
- Asistentes conversacionales con identidad de marca: el system prompt integrado permite desplegar un asistente que se autopresenta de forma consistente como HeliosLM, con un tono y una terminología definidos, sin necesidad de ingeniería de prompts adicional.
- Moderación y consultas sobre temas sensibles: su comportamiento medido (96,1% de neutralidad, 0% de toma de postura en unificación/independencia, 2,6% de rechazos) lo hace adecuado para entornos donde se requiere evitar posicionamientos políticos explícitos.
- Tutoría de matemáticas: con el modo thinking activado alcanza 93,71 en GSM8K y resuelve problemas de competición (45,83 en AIME 2026), por lo que puede emplearse en asistentes educativos que expliquen el razonamiento paso a paso.
- Asistencia a la programación: con 95,12 en HumanEval pass@1 puede integrarse en entornos de desarrollo para autocompletar funciones, explicar código o generar pruebas, desplegado con vLLM para servir peticiones concurrentes.
- Procesamiento de documentos con imagen y texto: al heredar la modalidad image-text-to-text de Gemma 4 E4B-it, puede extraer y resumir información de capturas, formularios o documentos escaneados combinándola con texto.
- Investigación sobre adaptación lingüística: sirve como caso de estudio reproducible de la técnica de chat vector para adaptar un modelo alineado a una variante regional sin SFT adicional.

## Benchmarks y rendimiento

Evaluaciones autoejecutadas por el autor el 2026-11-04 con vLLM 0.33, bf16, thinking activado, temperature 1.0, top_p 0.95 y top_k 64. No verificadas por los responsables de los benchmarks.

| Benchmark | Puntuación | Configuración |
|---|---|---|
| MMLU-Pro | 69,51 | 12.032 ítems, 0-shot CoT, máx. 16.384 tokens nuevos |
| GSM8K | 93,71 | 1.319 ítems, 0-shot, máx. 8.192 tokens nuevos |
| AIME 2026 | 45,83 | 30 problemas, media de 4 muestras, máx. 32.768 tokens nuevos |
| HMMT Feb 2026 | 31,82 | 33 problemas, media de 4 muestras, máx. 32.768 tokens nuevos |
| HumanEval | 95,12 | 164 problemas, pass@1, una muestra |
| TMMLU+ (Twinkle Eval 2.10) | 41,37 | conjunto completo, 1 ejecución, thinking off, máx. 1.024 tokens |

Referencia del autor: Google reporta MMLU-Pro 69,4 y AIME 2026 42,5 para Gemma 4 E4B-it en su propia model card (arnés distinto). El autor indica que su modelo está cerca del base en benchmarks generales y que la medición de TMMLU+ con límite de 1.024 tokens debe tratarse como cota inferior.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Con ~8.000 millones de parámetros en bf16, los pesos ocupan aproximadamente 16 GB, cifra coherente con el tamaño del repositorio (16,0 GB); a ello hay que sumar la memoria de la caché KV.
- GPU recomendadas: el autor recomienda vLLM o transformers. No se especifican modelos de GPU concretos.
- GPU de consumo: no confirmado por el autor; por tamaño de pesos, una GPU con 24 GB de VRAM (por ejemplo, RTX 4090) sería el mínimo razonable en bf16, aunque no hay validación publicada.
- Opciones de despliegue: vLLM 0.33 (usado en las evaluaciones) y transformers. No se mencionan llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | MMLU-Pro | AIME 2026 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| HeliosLM Chat E4B | ~8,0 B | no disponible | 69,51 (auto) | 45,83 (auto) | Gemma Terms of Use | Hugging Face |
| google/gemma-4-E4B-it | ~8,0 B (arquitectura E4B) | no disponible | 69,4 (reportado por Google) | 42,5 (reportado por Google) | Gemma Terms of Use | Hugging Face |
| Gemma 4 26B-A4B-it | no disponible | no disponible | no disponible | no disponible | Gemma Terms of Use | Hugging Face |

El autor emplea Gemma 4 26B-A4B-it únicamente como juez en las sondas de neutralidad (18,1% de encuadre oficial unilateral frente al 16,8% de HeliosLM y de Gemma 4 E4B-it), no como comparación de rendimiento. No se dispone de datos de benchmarks de terceros para ampliar la comparativa.

## Limitaciones y advertencias

- El propio autor reconoce que el modelo no supone una mejora sustancial sobre Gemma 4 E4B-it en benchmarks generales; su valor diferencial es la adaptación al chino tradicional de Taiwán y la identidad integrada.
- Sesgo de encuadre oficial: el 16,8% de las respuestas a 155 preguntas políticas fue juzgado como uso de un marco oficial unilateral, con los valores más altos en preguntas sobre el liderazgo chino y las instituciones de Taiwán. El autor declara que sigue trabajando en ello.
- Tasa de rechazo del 2,6% en las sondas políticas.
- Riesgo de alucinación: el autor advierte explícitamente de que el modelo puede generar información errónea o desactualizada y recomienda verificar los contenidos importantes.
- Cobertura idiomática limitada a chino tradicional y inglés; no se documenta soporte de castellano ni de otros idiomas.
- Longitud de contexto no especificada en la información disponible.
- Resultados de benchmarks autoejecutados y no verificados por terceros; el TMMLU+ de 41,37 se midió con un límite de 1.024 tokens y con el system prompt anterior, por lo que es una cota inferior.
- Licencia Gemma Terms of Use: el uso comercial está sujeto a los términos de Google para Gemma, que incluyen obligaciones de atribución y restricciones de uso; conviene revisarlos antes de un despliegue en producción.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: no hay validación por parte de la comunidad.
- No hay información sobre soporte de tool calling ni sobre latencia y throughput en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/chienhsinlin/helioslm-chat-e4b
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it
- Términos de uso de Gemma: https://ai.google.dev/gemma/terms
