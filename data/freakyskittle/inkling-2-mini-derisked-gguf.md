# freakyskittle/Inkling-2-Mini-Derisked-GGUF

## Resumen

Inkling-2-Mini-Derisked-GGUF es una conversión a formato GGUF del modelo Blackfrost-AI/Inkling-2-Mini-Derisked (revisión `31ec2ed`), que a su vez es un derivado con modificaciones de comportamiento del modelo thinkingmachines/Inkling-2-Mini. La conversión la ha realizado el usuario freakyskittle mediante `convert_hf_to_gguf.py` de llama.cpp, que ya soporta de forma nativa la arquitectura `inkling2_loop`. El resultado es un conjunto de ficheros cuantizados listos para ejecutarse en llama.cpp y herramientas compatibles.

El modelo pertenece a la familia de transformers con arquitectura de bucle (`loop-transformer`) y mezcla de expertos (MoE), con capacidad multimodal de entrada imagen-texto. Al ser un derivado "derisked", el autor original ha aplicado modificaciones de comportamiento sobre el modelo base, presumiblemente para reducir comportamientos indeseados, aunque la model card no detalla la metodología concreta.

La relevancia de esta ficha radica en que ofrece una vía práctica de despliegue local del modelo en hardware de consumo mediante cuantizaciones Q4_K_M, Q6_K y Q8_0, además de incluir el proyector de visión en F16 para tareas image-text-to-text. No obstante, el autor advierte de que se trata de un artefacto de investigación sin garantías y que las cuantizaciones ternarias (TQ2_0, TQ1_0) degradan gravemente el modelo al no haber sido entrenado en ese formato.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | loop-transformer con mezcla de expertos (MoE), soporte nativo `inkling2_loop` en llama.cpp |
| Parametros totales | no disponible |
| Parametros activos | no disponible (arquitectura MoE confirmada, sin cifra publicada) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0, Q6_K, Q4_K_M, Q4_K_S, IQ4_XS, TQ2_0 (ternaria, experimental), TQ1_0 (ternaria, experimental); proyector de visión en F16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (heredada del modelo upstream Inkling-2-Mini) |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

La arquitectura es un transformer con mecanismo de bucle (`loop-transformer`), lo que implica que el modelo reutiliza bloques de cómputo de forma iterativa para aumentar la profundidad efectiva sin incrementar linealmente el número de parámetros. Incorpora mezcla de expertos (MoE), lo que sugiere activación selectiva de subconjuntos de parámetros por token, aunque la model card no publica el número total ni activo de parámetros. El pipeline declarado es `image-text-to-text`, por lo que integra un proyector de visión que se distribuye por separado en formato F16 (`mmproj-...-F16.gguf`).

Respecto al entrenamiento, la información disponible es escasa: se sabe que el modelo upstream es thinkingmachines/Inkling-2-Mini y que Blackfrost-AI/Inkling-2-Mini-Derisked es un derivado con modificaciones de comportamiento ("derisked"). No se detalla el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO. En cuanto a la conversión, los expertos originales en NVFP4/MXFP8 fueron dequantizados a Q8_0 y el resto de cuantizaciones se generaron a partir de ese Q8_0 con `llama-quantize`, sin uso de imatrix. La cabeza de borrador MTP/DSpark no se incluye porque llama.cpp todavía no la exporta para esta arquitectura.

## Capacidades

- Generación de texto y razonamiento general, con arquitectura MoE y bucle que permite cómputo iterativo.
- Procesamiento multimodal image-text-to-text mediante el proyector de visión F16.
- Capacidad de describir imágenes y responder preguntas sobre contenido visual (ejemplo documentado: `llama-mtmd-cli ... --image img.png -p "Describe this image."`).
- Soporte de plantilla de chat vía `--jinja` en `llama-server`.
- Compatibilidad con llama.cpp y ecosistema derivado (llama-server, llama-mtmd-cli).
- Capacidades multilingües: no disponibles en la información proporcionada.
- Tool calling / function calling: no disponible en la información proporcionada.
- Modo thinking explícito: no disponible en la información proporcionada.
- Capacidades de audio: no disponibles.

## Casos de uso

- Descripción y análisis de imágenes en local: usando `llama-mtmd-cli` con el proyector F16 y una cuantización Q4_K_M, se puede desplegar un pipeline de captioning o VQA en una máquina sin GPU de datacenter, aprovechando el formato GGUF para entornos con recursos limitados.
- Prototipado de asistentes multimodales en estaciones de trabajo: `llama-server` con `--jinja` permite levantar una API compatible con el formato de chat de llama.cpp, útil para integrar el modelo en aplicaciones de escritorio o demos internas.
- Investigación sobre arquitecturas loop-transformer y MoE: al ser un artefacto de investigación, sirve para estudiar el comportamiento de modelos con cómputo iterativo y mezcla de expertos en entornos de cuantización baja.
- Evaluación de derivados "derisked": permite comparar el comportamiento del modelo modificado frente al upstream Inkling-2-Mini en tareas de generación y visión, siempre con validación manual de salidas.
- Despliegue en hardware de consumo: la cuantización Q4_K_M (recomendada por el autor) facilita ejecutar el modelo en GPUs consumer o incluso en CPU con llama.cpp, para tareas de generación de texto de baja latencia.
- Experimentación con cuantizaciones extremas: las variantes TQ2_0 y TQ1_0 permiten medir la degradación de modelos no entrenados en formato ternario, útil para líneas de investigación sobre compresión agresiva.
- Integración en pipelines de CI para pruebas de regresión de modelos: cargar el GGUF y ejecutar generaciones cortas (como el smoke test del autor) para detectar roturas en conversiones o cambios de tokenizer.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; depende del número total de parámetros, que no se publica. Como referencia cualitativa, el autor recomienda Q4_K_M como opción por defecto, lo que sugiere que busca el mejor compromiso tamaño/calidad para despliegue local.
- GPU recomendadas: no disponibles. El formato GGUF y llama.cpp permiten ejecución en CPU y en GPUs consumer, pero no se especifican modelos concretos (A100, H100, RTX 4090, etc.).
- Compatibilidad con GPU consumer: probable para cuantizaciones Q4_K_M, Q4_K_S e IQ4_XS dado el formato GGUF, pero sin cifras de VRAM publicadas no se puede confirmar qué tarjetas concretas lo soportan.
- Opciones de despliegue: llama.cpp (`llama-server`, `llama-mtmd-cli`, `llama-quantize`), y por extensión cualquier frontend compatible con GGUF (Ollama, LM Studio, etc.) siempre que soporte la arquitectura `inkling2_loop`.
- Latencia y throughput: no disponibles.
- Requisito adicional: es necesario un llama.cpp reciente con soporte para `inkling2_loop`; versiones antiguas no cargarán el modelo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Inkling-2-Mini-Derisked-GGUF (este) | no disponible (MoE) | no disponible | image-text-to-text | Apache 2.0 | GGUF en HF |
| thinkingmachines/Inkling-2-Mini (upstream) | no disponible (MoE) | no disponible | image-text-to-text | Apache 2.0 (según upstream) | Pesos originales en HF |
| Blackfrost-AI/Inkling-2-Mini-Derisked (base de esta conversión) | no disponible (MoE) | no disponible | image-text-to-text | Apache 2.0 | Pesos originales en HF |

No se dispone de datos de benchmarks ni de especificaciones numéricas (parámetros, contexto) para establecer una comparación cuantitativa con alternativas de la misma categoría. La comparación se limita a linaje y formato de distribución.

## Limitaciones y advertencias

- El autor califica el modelo como "artefacto de investigación con comportamiento modificado, sin garantía"; es obligatorio validar las salidas antes de usarlo en producción.
- Las cuantizaciones TQ2_0 y TQ1_0 son ternarias y el modelo no fue entrenado en ese formato: se espera una degradación grave ("heavy degradation") según el propio autor.
- La cabeza de borrador MTP/DSpark no está incluida, por lo que no se puede aprovechar la decodificación especulativa nativa del modelo en esta conversión.
- No se publican datos sobre sesgos, riesgo de alucinación, idiomas soportados ni longitud de contexto, lo que dificulta evaluar su idoneidad para casos concretos.
- La licencia Apache 2.0 se hereda del upstream, pero el autor remite además a la Model Acceptable Use Policy de Thinking Machines, que puede imponer restricciones adicionales de uso.
- El modelo base es un derivado "derisked" cuya metodología de modificación no se documenta en la model card, lo que limita la trazabilidad del comportamiento.
- Requiere una versión reciente de llama.cpp con soporte `inkling2_loop`; la incompatibilidad con versiones antiguas puede provocar fallos de carga.
- No hay información sobre rendimiento, latencia ni throughput, por lo que no se puede garantizar un SLA en producción.

## Enlaces

- Hugging Face (este modelo): https://huggingface.co/freakyskittle/Inkling-2-Mini-Derisked-GGUF
- Modelo base de la conversión: https://huggingface.co/Blackfrost-AI/Inkling-2-Mini-Derisked
- Modelo upstream: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- Model Acceptable Use Policy de Thinking Machines: https://thinkingmachines.ai/model-acceptable-use-policy/
- llama.cpp (repositorio y herramientas de conversión/cuantización): no disponible en la información proporcionada como enlace explícito, pero referenciado como dependencia.
