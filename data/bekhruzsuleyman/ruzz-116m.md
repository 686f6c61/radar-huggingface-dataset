# bekhruzsuleyman/ruzz-116m

## Resumen

RuzzGPT 116M es un modelo de lenguaje autorregresivo (decoder-only Transformer) de 115,94 millones de parámetros, desarrollado por el ingeniero independiente Bekhruz Suleyman como experimento educativo de pretraining desde cero. El proyecto se ejecutó íntegramente en Google Colab Free con una GPU NVIDIA Tesla T4 de 16 GB, con un coste de cómputo de cero dólares y una duración total del flujo de trabajo de aproximadamente 8 horas y 30 minutos. El modelo se entrenó sobre una submuestra de FineWeb-Edu (unos 808 MB de datos codificados, en lugar de los 8,48 GB originalmente preparados, debido a limitaciones de almacenamiento del entorno de Colab).

El resultado es un checkpoint experimental que el propio autor describe como no convergido y de calidad de generación muy limitada, con salidas frecuentemente incoherentes. Su valor principal no reside en la calidad del texto generado, sino en la implementación completa y funcional de un pipeline de entrenamiento de modelos de lenguaje: tokenización, preparación de datos, entrenamiento, checkpointing e inferencia. El modelo está pensado como artefacto educativo y de investigación, no como herramienta de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decoder-only Transformer |
| Parametros totales | 115.944.960 (~115,94 M) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Inglés (en) |
| Licencia | No disponible |
| Formato de pesos | PyTorch (formato de archivo no especificado; repo de 3,6 GB) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura estándar de un Transformer decoder-only, con una capa de embedding de 20.000 tokens y un tokenizer SentencePiece Unigram. El entrenamiento se realizó desde cero, sin partir de pesos preentrenados, durante 2.500 pasos sobre un subconjunto de FineWeb-Edu. El pipeline completo se dividió en fases: la tokenización y el preprocesado se ejecutaron en CPU de Colab, mientras que el entrenamiento del Transformer se realizó en GPU (Tesla T4). No se aplicaron técnicas de alineación como RLHF o DPO, ni se menciona el uso de decodificación especulativa u otras innovaciones. La principal lección técnica del proyecto fue la elección del tokenizer: el cambio de BPE a SentencePiece Unigram redujo el tiempo de tokenización de aproximadamente 2,5 horas a unos 8 minutos.

## Capacidades

- Generación de texto autorregresiva básica, aunque de calidad muy limitada y frecuentemente incoherente.
- Capacidad de ejecución en CPU con recursos mínimos (probado en un portátil con 4 GB de RAM).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión ni audio.
- Multilingüismo: únicamente inglés, y con un vocabulario reducido de 20.000 tokens.
- No incluye modo de pensamiento (thinking mode) ni capacidades de instrucción (no está fine-tuneado para seguir instrucciones).

## Casos de uso

- Investigación educativa en arquitecturas de modelos de lenguaje: el checkpoint permite estudiar el comportamiento de un Transformer pequeño entrenado desde cero, analizar la evolución de la pérdida, la coherencia de las representaciones internas y los efectos de la tokenización en la calidad final.
- Pruebas de pipelines de entrenamiento: sirve como banco de pruebas para validar flujos de datos, scripts de entrenamiento, sistemas de checkpointing y rutinas de inferencia antes de escalar a modelos mayores.
- Experimentos de tokenización: al usar SentencePiece Unigram con un vocabulario de 20.000 tokens, es útil para comparar la eficiencia de distintos tokenizers en tareas de generación corta.
- Demostración de entrenamiento con recursos limitados: el proyecto documenta cómo entrenar un LM desde cero con coste cero, lo que lo convierte en material de referencia para cursos o talleres sobre entrenamiento de LLMs en entornos restringidos.
- Evaluación de métricas de calidad en modelos pequeños: permite medir la relación entre tamaño del modelo, número de pasos y calidad de generación en un entorno controlado.
- Pruebas de despliegue en hardware modesto: al poder ejecutarse en CPU con 4 GB de RAM, es adecuado para probar técnicas de inferencia ligera (por ejemplo, cuantización posterior, aunque no se han publicado configuraciones específicas).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor no reporta métricas como MMLU, HumanEval o GSM8K, y la calidad de generación es reconocidamente experimental e incoherente. No se dispone de datos de perplejidad ni de comparaciones cuantitativas con otros modelos.

## Requisitos de hardware

- Inferencia en CPU: probado en un portátil con 4 GB de RAM, sin GPU dedicada. La generación es lenta pero funcional.
- Inferencia en GPU: no se han publicado requisitos específicos, pero al tratarse de un modelo de ~116 M de parámetros, cabría en cualquier GPU con al menos 2 GB de VRAM (por ejemplo, una GTX 1650 o superior) en precisión FP32.
- Entrenamiento: se realizó en una Tesla T4 de 16 GB VRAM, con un uso de memoria que no se especifica, pero que probablemente se ajusta a ese límite.
- Opciones de despliegue: al ser un modelo PyTorch estándar, puede cargarse con la librería `transformers` de Hugging Face, o exportarse a formatos como ONNX o GGUF para su uso con llama.cpp u Ollama, aunque no se han publicado conversiones oficiales.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento comparables. Como referencia arquitectónica, el modelo es similar en tamaño a GPT-2 Small (124 M de parámetros), pero GPT-2 fue entrenado con un corpus mucho mayor (WebText, ~40 GB) y durante más pasos, por lo que su calidad de generación es sustancialmente superior. Otras alternativas de tamaño similar como TinyLlama (1,1 B) o Pythia-160M (160 M) también superan ampliamente a RuzzGPT en coherencia y capacidades, aunque todas ellas son modelos densos decoder-only. La comparación directa no es posible por la falta de benchmarks, pero es evidente que RuzzGPT no está diseñado para competir con estos modelos.

## Limitaciones y advertencias

- Calidad de generación muy pobre: el modelo produce texto incoherente y con errores graves, como se muestra en el ejemplo del propio autor (prompt "Hacker" → "Hacker LCD elongatedfirstname Testament29 Speaker placing ...").
- Entrenamiento incompleto: solo 2.500 pasos sobre una fracción del dataset original (808 MB en lugar de 8,48 GB), lo que impide la convergencia.
- Sin fine-tuning de instrucciones: no responde a prompts de forma útil ni sigue instrucciones.
- Sesgos y alucinaciones: no se han evaluado, pero dado el estado del modelo, es previsible que presente alucinaciones severas y sesgos no controlados.
- Licencia no especificada: no se indica bajo qué términos se distribuye, lo que impide su uso comercial sin consultar al autor.
- Sin soporte multilingüe: solo inglés, y con un vocabulario reducido.
- Sin garantías de producción: no es apto para ningún uso en entornos reales, ni siquiera como generador de texto de baja calidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/bekhruzsuleyman/ruzz-116m
- Perfil de GitHub del autor: https://github.com/bekhruzsuleyman
- Dataset FineWeb-Edu (referencia): https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
