# mlboydaisuke/qwen3.5-4B-CoreAI

## Resumen

El modelo `mlboydaisuke/qwen3.5-4B-CoreAI` es una conversión del modelo base Qwen/Qwen3.5-4B, perteneciente a la familia GDN de atención lineal híbrida, al formato propietario **Apple Core AI** (`.aimodel`). El autor, mlboydaisuke, ha adaptado el modelo para ejecutarse de forma nativa en macOS 27 e iOS 27 (beta) mediante el motor GPU `coreai-pipelined`, utilizando una exportación de un solo paso sin bucle de decodificación, encode asíncrono, muestreo argmax en GPU y crecimiento de caché KV en dispositivo, sin necesidad de kernels personalizados.

Este modelo resuelve el problema de ejecutar un LLM de 4 mil millones de parámetros en hardware Apple de forma eficiente, con cuantización int8 por bloques de 32 y una cabeza de vocabulario ampliada (248K tokens) también en int8. Su relevancia actual radica en que permite inferencia local de alta calidad en Macs con Apple Silicon, aprovechando las nuevas capacidades del framework Core AI de Apple, y sirve como referencia para desarrolladores que quieran portar modelos similares a este ecosistema.

El bundle principal (`gpu-pipelined-b2/`) ocupa aproximadamente 5,4 GB y está pensado para entornos de desarrollo con el toolchain beta 3 de macOS 27. No se publica una versión para iPhone, ya que los gráficos de 4B exceden la especialización de GPU en dispositivo y requerirían compilación anticipada (h18p).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GDN hybrid linear-attention (basado en Qwen3.5-4B) |
| Parametros totales | 4B (aproximadamente, no se especifica el valor exacto) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | int8 por bloques de 32 (`int8hu`), lm_head int8 absmax simétrico |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `.aimodel` (Apple Core AI LanguageBundle: metadata.json + tokenizer/ + .aimodel) |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-4B pertenece a la familia GDN (Gated Delta Network) de atención lineal híbrida, que combina mecanismos de atención clásicos con capas de atención lineal para reducir el coste computacional en contextos largos. Sin embargo, la model card no proporciona detalles sobre la arquitectura interna exacta, el número de capas, dimensiones ocultas ni el número de cabezas de atención.

La conversión a Core AI se realizó mediante una exportación específica que utiliza `input_ids` estáticos de forma `[1,1]` (un solo token por paso), lo que permite que el motor `EngineFactory` clasifique el modelo como dinámico y lo ejecute con el motor `coreai-pipelined`. El proceso incluye encode asíncrono, muestreo argmax en GPU y crecimiento de la caché KV en el dispositivo, sin kernels personalizados. La cuantización se aplicó con `int8hu --head-sym`, que usa cuantización int8 por bloques de 32 tanto en las capas transformer como en la cabeza de salida (lm_head) de 248K vocabulario, con escala simétrica absmax.

No se dispone de información sobre el entrenamiento del modelo base (número de tokens, composición del dataset, técnicas de alineación como RLHF o DPO). La model card solo indica que es un fine-tune de Qwen/Qwen3.5-4B, pero no se detalla el proceso de fine-tuning ni los datos utilizados.

## Capacidades

- Generación de texto autoregresiva con razonamiento extendido: el modelo "piensa a fondo antes de responder", por lo que requiere un presupuesto de tokens de generación generoso (DeviceMark lo evalúa con un máximo de 4096 tokens; con límites estrictos puede devolver respuestas vacías).
- Inferencia en dispositivo Apple (macOS) con motor GPU `coreai-pipelined`, sin conexión a servidores externos.
- Soporte para cuantización int8 por bloques, lo que reduce el uso de memoria y acelera la inferencia en hardware Apple.
- No se mencionan capacidades de tool calling, function calling, visión, audio ni otras modalidades. Es exclusivamente un modelo de texto.

## Casos de uso

- Asistente de escritura local en macOS: el modelo puede redactar, revisar y resumir textos directamente en la Mac, sin enviar datos a la nube, gracias a su ejecución en el motor Core AI.
- Chatbot de soporte técnico integrado en aplicaciones de escritorio: al ser un modelo de 4B con razonamiento, puede mantener conversaciones multi-turno y resolver consultas complejas, siempre que se le conceda un presupuesto de tokens amplio para su fase de pensamiento.
- Generación de informes y documentación técnica: su capacidad de razonamiento permite estructurar respuestas largas y coherentes, útil para herramientas de productividad en Mac.
- Análisis de texto con privacidad: al ejecutarse localmente, es adecuado para procesar documentos confidenciales (informes médicos, legales, financieros) sin riesgo de fuga de datos.
- Prototipado de aplicaciones Apple con IA generativa: desarrolladores pueden integrar este modelo en apps de macOS para evaluar la viabilidad de funciones de texto generativo antes de optimizar versiones más pequeñas para iPhone.
- Investigación académica sobre eficiencia de inferencia en Apple Silicon: sirve como referencia para estudiar el rendimiento de modelos de atención lineal híbrida cuantizados en hardware Apple.

## Benchmarks y rendimiento

La model card indica que los resultados de calidad y velocidad están publicados en la página [DeviceMark](https://devicemark.github.io/), que incluye una batería de 596 ítems (IFEval + MMLU + MATH) con intervalos de confianza de Wilson, retención frente al baseline en float y velocidad de decodificación en Mac. Sin embargo, no se proporcionan valores numéricos concretos en la información disponible. Por tanto, no se pueden presentar datos de benchmarks verificados en esta ficha.

## Requisitos de hardware

- Sistema operativo: macOS 27 (beta 3) o posterior, con el toolchain beta correspondiente.
- Hardware: Apple Silicon (no se especifican modelos concretos, pero se requiere GPU compatible con el motor `coreai-pipelined`).
- Almacenamiento: el bundle de envío ocupa aproximadamente 5,4 GB; el repositorio completo pesa 11,5 GB.
- Memoria: no se especifica VRAM mínima, pero dado el tamaño del modelo en int8, se estima que necesita al menos 6-8 GB de memoria unificada (dato no confirmado).
- Despliegue: exclusivamente mediante el motor Core AI con los parches del repositorio `coreai-model-zoo` (`apps/coreai-shared-product.patch` y `apps/coreai-pipelined-extra-states.patch`). No se mencionan opciones como vLLM, llama.cpp u Ollama.
- Rendimiento: no se proporcionan cifras de latencia o throughput para este modelo. Los modelos hermanos (0.8B y 2B) alcanzan 50+ tok/s y 28-30 tok/s respectivamente, pero no hay datos para el 4B.
- Nota: no se debe llamar a `engine.warmup()`; la calibración se realiza con una generación de 1 token tras la carga. Solo se recomiendan compilaciones Release (las Debug son aproximadamente 3 veces más lentas).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Uso en Apple |
|---|---|---|---|---|---|
| qwen3.5-4B-CoreAI | 4B | No disponible | .aimodel (int8) | Apache 2.0 | macOS 27 beta, no iPhone |
| qwen3.5-2B-CoreAI | 2B | No disponible | .aimodel (int8) | Apache 2.0 | macOS e iPhone (28-30 tok/s) |
| qwen3.5-0.8B-CoreAI | 0.8B | No disponible | .aimodel (int8) | Apache 2.0 | macOS e iPhone (50+ tok/s) |
| Qwen/Qwen3.5-4B (base) | 4B | No disponible | safetensors/GGUF | Apache 2.0 | Requiere conversión adicional |

La comparativa se limita a los modelos de la misma familia convertidos a Core AI. No se dispone de datos de rendimiento comparativo con otros modelos de 4B en el ecosistema Apple.

## Limitaciones y advertencias

- Requiere macOS 27 beta y el toolchain beta 3; no es compatible con versiones estables actuales.
- No se publica una versión para iPhone: los gráficos de 4B exceden la especialización de GPU en dispositivo y necesitan compilación anticipada (h18p), no incluida.
- El modelo tiene un comportamiento de "razonamiento extendido": si se limita el presupuesto de tokens de generación, puede producir respuestas vacías. Se recomienda un máximo de al menos 4096 tokens.
- No se debe ejecutar `engine.warmup()`; hacerlo provocará un rechazo del grafo estático `[1,1]`.
- Solo se deben usar compilaciones Release; las Debug son aproximadamente 3 veces más lentas.
- No se dispone de información sobre sesgos, alucinaciones o limitaciones idiomáticas del modelo. Al ser un fine-tune de Qwen3.5, podría heredar sesgos del modelo base, pero no se documentan.
- La licencia Apache 2.0 permite uso comercial, pero la dependencia del framework Core AI en beta y de parches no oficiales puede limitar su uso en producción.

## Enlaces

- [HuggingFace - qwen3.5-4B-CoreAI](https://huggingface.co/mlboydaisuke/qwen3.5-4B-CoreAI)
- [Modelo hermano 0.8B](https://huggingface.co/mlboydaisuke/qwen3.5-0.8B-CoreAI)
- [Modelo hermano 2B](https://huggingface.co/mlboydaisuke/qwen3.5-2B-CoreAI)
- [Repositorio coreai-model-zoo](https://github.com/john-rocky/coreai-model-zoo)
- [Notas del motor pipelined](https://github.com/john-rocky/coreai-model-zoo/blob/main/knowledge/pipelined-engine.md)
- [Script de conversión](https://github.com/john-rocky/coreai-model-zoo/blob/main/conversion/export_qwen3_5_decode_pipelined.py)
- [DeviceMark - resultados de benchmarks](https://devicemark.github.io/)
- [Metodología de DeviceMark](https://devicemark.github.io/methodology.html)
