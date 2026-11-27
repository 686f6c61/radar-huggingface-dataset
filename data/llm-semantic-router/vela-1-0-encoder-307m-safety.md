# llm-semantic-router/Vela-1.0-Encoder-307M-Safety

## Resumen

Vela-1.0-Encoder-307M-Safety es un clasificador de texto encoder-only derivado de ModernBERT, afinado por el proyecto vLLM Semantic Router para detectar riesgo de contenido general y enrutar peticiones hacia el tratamiento de seguridad adecuado. Con 307.531.778 parámetros y una capacidad de entrada de 32.768 tokens (incluyendo tokens especiales), está pensado como componente de un router semántico: no genera respuestas, sino que emite una señal de riesgo que decide si una consulta requiere manejo reforzado (por ejemplo, soporte en crisis) o puede procesarse por la vía normal.

El modelo parte del checkpoint base `vllm-sr/Vela-1.0-Encoder-307M` y se distribuye con licencia Apache 2.0 en formatos safetensors y ONNX, lo que facilita su despliegue tanto en PyTorch/Transformers como en entornos de inferencia optimizados. Su relevancia actual radica en que sustituye al anterior clasificador mmBERT Safety del mismo proyecto, ampliando la ventana de contexto de 8K a 32K tokens y mejorando el rendimiento en conjuntos multilingües (CultureGuard cubre 12 idiomas).

La ficha se basa exclusivamente en la información publicada en Hugging Face y en la model card del autor; los datos no presentes se indican explícitamente como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (encoder-only, transformer) |
| Parametros totales | 307.531.778 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens (incluyendo tokens especiales) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (la evaluacion incluye CultureGuard, que cubre 12 idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, ONNX |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de `vllm-sr/Vela-1.0-Encoder-307M`, un encoder ModernBERT de 307M parámetros. ModernBERT es una familia de encoders transformer que incorpora atención con rotación posicional (RoPE), alternancia entre atención local y global, y capas de embedding sin sesgo, lo que permite ventanas de contexto más largas que los encoders clásicos. La tarea es clasificación de texto binaria orientada a seguridad, con una etiqueta de riesgo de contenido general.

No se detallan en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si se emplearon técnicas de RLHF o DPO (poco habituales en clasificadores encoder). La model card sí indica que los conjuntos de desarrollo (Reviewed safety, AEGIS y CultureGuard) se usaron para la selección del modelo, y advierte que no son pruebas independientes. No se documentan innovaciones técnicas adicionales como decodificación especulativa, al no tratarse de un modelo generativo.

## Capacidades

- Clasificación de texto para detección de riesgo de contenido general (content safety).
- Emisión de una señal de riesgo que puede activar un manejo de soporte (incluido soporte en crisis) sin implicar rechazo automático.
- Procesamiento de entradas largas de hasta 32.768 tokens sin truncamiento.
- Cobertura multilingüe parcial: la evaluación con CultureGuard abarca 12 idiomas, aunque el listado oficial de idiomas no está disponible.
- Integración como componente de enrutamiento semántico en el stack vLLM Semantic Router.
- Compatibilidad con `text-embeddings-inference` y endpoints compatibles según los tags del repositorio.
- No soporta generación de texto, tool calling, agentes ni razonamiento multi-paso: es un encoder de clasificación.

## Casos de uso

- Enrutamiento de seguridad en pasarelas de LLM: el modelo clasifica cada petición entrante y decide si se envía al modelo generativo estándar o a un flujo con salvaguardas adicionales, gracias a su capacidad de 32K tokens para analizar conversaciones completas.
- Moderación de contenido en plataformas: clasificación de mensajes de usuario para detectar riesgo y derivar los casos sensibles a revisión humana o a respuestas de soporte.
- Detección de riesgo en soporte al cliente: análisis de conversaciones multi-turno largas antes de responder, evitando truncar el historial y perdiendo señales de riesgo.
- Filtrado previo en pipelines de datos: etiquetado de grandes volúmenes de texto para excluir o marcar contenido peligroso antes de usarlo en entrenamiento o análisis.
- Cumplimiento y auditoría: generación de señales de riesgo documentables sobre interacciones registradas, con umbral de probabilidad configurable (0,5 en la evaluación publicada).
- Despliegue en entornos con ONNX Runtime: al publicarse pesos ONNX, puede ejecutarse en infraestructura sin PyTorch, con latencias propias de un encoder de 307M.
- Investigación en seguridad multilingüe: evaluación comparativa de clasificadores de seguridad en los 12 idiomas cubiertos por CultureGuard.

## Benchmarks y rendimiento

Macro F1 (×100) sobre los conjuntos de desarrollo indicados por el autor, comparado con el modelo original mmBERT Safety. Umbral de probabilidad de inseguro: 0,5; FP32 nativo y entradas completas sin truncamiento.

| Evaluacion | mmBERT original | Vela |
|---|---:|---:|
| Reviewed safety (473 peticiones) | 76,53 | 85,30 |
| AEGIS (1.187 peticiones) | 92,23 | 84,76 |
| CultureGuard (3.594 peticiones) | 72,07 | 79,56 |

El autor advierte que estos conjuntos informaron la selección del modelo y no constituyen pruebas independientes. No se han publicado otros benchmarks (MMLU, HumanEval, GSM8K u otros) en la información disponible, lo cual es esperable en un clasificador encoder.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 1,2 GB solo para pesos (307M × 4 bytes), más activaciones y overhead; en FP16/BF16 rondaría 0,6 GB de pesos. No se documentan cuantizaciones oficiales.
- Cabe holgadamente en cualquier GPU consumer (RTX 3060, RTX 4090, etc.) e incluso en CPU para cargas moderadas.
- GPU recomendadas para alto throughput: A100, H100 o L40S para procesamiento por lotes a gran escala; no se publican cifras de latencia ni throughput.
- Opciones de despliegue: `transformers` (versiones 4.57.6 o 5.17.0 según la model card), ONNX Runtime con los pesos ONNX incluidos, y `text-embeddings-inference` según los tags del repositorio.
- El tamaño del repositorio es de 2,5 GB, lo que incluye pesos en varios formatos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Macro F1 (Reviewed safety) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Vela-1.0-Encoder-307M-Safety | 307M | 32.768 tokens | 85,30 | Apache 2.0 | Hugging Face (safetensors, ONNX) |
| mmBERT Safety (original) | no disponible (base mmBERT-base) | 8.192 tokens | 76,53 | no disponible | Hugging Face |

No se dispone de información sobre otros clasificadores de seguridad comparables en la documentación proporcionada; los datos de la comparativa se limitan al modelo predecesor del mismo proyecto.

## Limitaciones y advertencias

- Los conjuntos de evaluación son de desarrollo y participaron en la selección del modelo; no son pruebas independientes, por lo que las cifras pueden sobreestimar el rendimiento real.
- El modelo empeora frente al original en AEGIS (84,76 frente a 92,23), lo que sugiere un comportamiento desigual según el dominio de riesgo.
- Una señal de riesgo no equivale a un rechazo: el sistema que lo integra debe definir la política de actuación; un umbral mal calibrado puede producir falsos positivos o negativos.
- No se documentan sesgos conocidos, idiomas soportados oficialmente ni riesgos específicos de alucinación (no es un modelo generativo).
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre el rendimiento en producción ni sobre el cumplimiento normativo en dominios regulados.
- Al ser un clasificador, no debe usarse como sustituto de revisión humana en casos de crisis o contenido sensible.
- No se publican datos sobre cuantización, latencia ni throughput, lo que dificulta planificar despliegues de alta concurrencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/llm-semantic-router/Vela-1.0-Encoder-307M-Safety
- Modelo base: https://huggingface.co/vllm-sr/Vela-1.0-Encoder-307M
- Colección Vela: https://huggingface.co/collections/vllm-sr/vela-10-router-models-6aa555ba70cc6997d6d67798
- Modelo original mmBERT Safety: https://huggingface.co/vllm-sr/mmbert-safety-binary-merged
- Documentación: https://vllm-sr.ai/
- Blog: https://vllm-sr.ai/blog/
- GitHub: https://github.com/vllm-project/semantic-router
- Slack: https://vllm-dev.slack.com/archives/C09CTGF8KCN
