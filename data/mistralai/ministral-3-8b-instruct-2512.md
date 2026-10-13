# mistralai/Ministral-3-8B-Instruct-2512

## Resumen

Ministral 3 8B Instruct 2512 es un modelo de lenguaje multimodal desarrollado por Mistral AI, publicado el 31 de octubre de 2025 y actualizado el 15 de julio de 2026. Pertenece a la familia Ministral 3, disenada para despliegue en el borde (edge deployment), y combina un modelo de lenguaje de 8,4B parametros con un codificador de vision de 0,4B, sumando un total de 8.918.026.716 parametros. Se distribuye en precision FP8, con un tamano de repositorio de 20,9 GB, y esta disponible bajo licencia Apache 2.0.

El modelo resuelve la necesidad de capacidades avanzadas de razonamiento, vision y uso agentico en entornos con recursos limitados. Segun la model card, puede desplegarse localmente en 12 GB de VRAM en FP8, y menos si se cuantiza adicionalmente. Incorpora una ventana de contexto de 256k tokens, soporte multilingue para once idiomas declarados (ingles, frances, espanol, aleman, italiano, portugues, neerlandes, chino, japones, coreano y arabe) y capacidades nativas de function calling y salida JSON.

Su relevancia actual radica en que ofrece un equilibrio poco habitual entre tamano reducido, contexto muy largo, vision integrada y uso comercial sin restricciones gracias a la licencia Apache 2.0. La model card lo posiciona como un "local daily-driver AI assistant" apto para sistemas embebidos, interfaces de chat en entornos restringidos y casos de uso agenticos especializados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (8,4B modelo de lenguaje + 0,4B codificador de vision), familia Mistral 3 |
| Parametros totales | 8.918.026.716 |
| Parametros activos | No es MoE, no aplica |
| Longitud de contexto | 256k tokens |
| Tipos de cuantizacion | FP8 (version publicada); la model card indica que admite cuantizacion adicional. GGUF y otros formatos disponibles en la coleccion "Ministral 3 additional checkpoints" (no detallados en la informacion proporcionada) |
| Idiomas soportados | Ingles, frances, espanol, aleman, italiano, portugues, neerlandes, chino, japones, coreano, arabe |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria vLLM) |

## Arquitectura y entrenamiento

La familia Ministral 3 esta compuesta por dos componentes arquitectonicos principales segun la model card: un modelo de lenguaje de 8,4B parametros y un codificador de vision de 0,4B. El modelo se distribuye como version "instruct post-trained" en precision FP8, ajustada para tareas de instruccion y conversacion. La libreria de referencia declarada es vLLM, y los pesos estan en formato safetensors. Se trata de un modelo derivado de `mistralai/Ministral-3-8B-Base-2512`.

No se detalla en la informacion proporcionada el numero de tokens de entrenamiento, la composicion exacta del dataset, ni si se aplicaron tecnicas concretas de RLHF, DPO u otras fases de alineamiento. La model card menciona una version "Base pre-trained" en BF16 y una version "Reasoning capable" en BF16 como variantes separadas dentro de la familia, lo que sugiere que la capacidad de razonamiento extendido se entrena en un checkpoint distinto al instruct. El paper asociado tiene la referencia arxiv 2601.08584.

## Capacidades

- Generacion de texto y conversacion multi-turno con ventana de contexto de 256k tokens.
- Vision: analisis de imagenes y generacion de respuestas basadas en contenido visual. La model card recomienda mantener una relacion de aspecto cercana a 1:1 y evitar imagenes excesivamente estrechas o anchas.
- Multilingue: soporte declarado para once idiomas (ingles, frances, espanol, aleman, italiano, portugues, neerlandes, chino, japones, coreano y arabe), con mencion a "docenas de idiomas".
- Adherencia a system prompt: la model card destaca el mantenimiento robusto de instrucciones de sistema.
- Agentico: capacidades de function calling nativo y salida en formato JSON.
- Optimizado para edge: rendimiento orientado a hardware de gama baja y despliegue local.
- Comprension de imagenes y documentos (descripcion y entendimiento) segun los casos de uso listados por el autor.
- No se declara explicitamente un "modo thinking" en esta variante instruct; la familia dispone de checkpoints especificos "Reasoning" para ese fin.

## Casos de uso

- Asistente personal local: el modelo puede ejecutarse en 12 GB de VRAM en FP8 sobre un equipo de sobremesa o portatil equipado, gestionando conversaciones con contexto de 256k tokens y acceso a herramientas mediante function calling.
- Chat en entornos con recursos restringidos: su tamano permite desplegar interfaces conversacionales en dispositivos de borde donde no caben modelos de mayor tamano, manteniendo soporte multilingue.
- Descripcion y comprension de imagenes y documentos: gracias al codificador de vision de 0,4B, puede extraer informacion de capturas, diagramas o documentos escaneados y responder preguntas sobre ellos.
- Traduccion y generacion de contenido multilingue: cubre once idiomas declarados, util para pipelines de localizacion o generacion de contenido en varios mercados.
- Agentes especializados con herramientas: la salida JSON nativa y el function calling permiten integrarlo en flujos agenticos multi-paso, siempre que el conjunto de herramientas sea reducido y bien definido (recomendacion explicita del autor).
- Punto de partida para fine-tuning: la licencia Apache 2.0 y la existencia de un checkpoint base permiten especializar el modelo en dominios concretos sin restricciones de uso comercial.
- Atencion al cliente automatizada en produccion: con temperature inferior a 0,1 y un system prompt claro, puede gestionar conversaciones multi-turno con contexto largo y derivar acciones a sistemas externos via tools.

## Benchmarks y rendimiento

La model card incluye resultados de razonamiento comparando la familia Ministral 3 con modelos de tamano similar. Los datos disponibles en la informacion proporcionada son:

| Modelo | AIME25 | AIME24 | GPQA Diamond | LiveCodeBench |
|---|---|---|---|---|
| Ministral 3 14B | 0.850 | 0.898 | 0.712 | 0.646 |
| Qwen3-14B (Thinking) | 0.737 | 0.837 | 0.663 | 0.593 |
| Ministral 3 8B | 0.787 | 0.860 | 0.668 | 0.616 |
| Qwen3-VL-8B-Thinking | 0.798 | 0.860 | 0.671 | 0.580 |

Nota: la tabla de la model card aparece truncada en el punto correspondiente a Ministral 3 3B, por lo que no se dispone del resto de filas. No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni otros benchmarks distintos de los anteriores.

## Requisitos de hardware

- VRAM en FP8: la model card indica que el modelo cabe en 12 GB de VRAM en FP8.
- Cuantizaciones adicionales: la model card senala que con cuantizacion mas agresiva el consumo de memoria se reduce por debajo de esos 12 GB (sin cifras concretas publicadas).
- BF16 (referencia del checkpoint base): no declarado en la informacion proporcionada; por el numero de parametros (8,9B) seria sustancialmente superior a la version FP8.
- GPU de consumo: segun el dato de 12 GB en FP8, cabria en tarjetas como RTX 4080/4090 (16-24 GB) o RTX 4070 Ti Super (16 GB). No confirmado por el autor.
- GPU de datacenter: A100, H100 y similares son compatibles para despliegue de mayor throughput, aunque no se aportan cifras concretas.
- Opciones de despliegue: la libreria declarada es vLLM. Los tags incluyen `deploy:sagemaker`. No se confirman Ollama, llama.cpp o TGI en la informacion proporcionada, aunque la existencia de otros formatos en la coleccion adicional podria permitirlo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Vision | Disponibilidad |
|---|---|---|---|---|---|
| Ministral 3 8B Instruct 2512 | 8,9B (8,4B LM + 0,4B vision) | 256k | Apache 2.0 | Si | HuggingFace |
| Qwen3-VL-8B-Thinking | no disponible | no disponible | no disponible | Si | HuggingFace |
| Qwen3-14B (Thinking) | 14B (aproximado, no confirmado en la informacion) | no disponible | no disponible | no disponible | HuggingFace |
| Ministral 3 14B | no disponible (mayor que 8B) | 256k (misma familia) | Apache 2.0 | Si | HuggingFace |

Los datos de contexto, licencia y disponibilidad de los modelos Qwen no se detallan en la informacion proporcionada, por lo que se marcan como no disponibles. La comparativa de rendimiento se limita a los benchmarks recogidos en la seccion anterior.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan sesgos especificos en la informacion proporcionada.
- Riesgo de alucinacion: no se cuantifica en la model card; aplican las precauciones habituales en generacion de texto e interpretacion de imagenes.
- Vision con relaciones de aspecto extremas: el autor advierte que imagenes muy estrechas o muy anchas degradan el rendimiento y recomienda recortarlas a una relacion cercana a 1:1.
- Sobrecarga de herramientas: la model card recomienda limitar el numero de tools al minimo necesario para el caso de uso, ya que un conjunto excesivo deteriora el comportamiento agentico.
- Parametros de muestreo: el autor recomienda temperature inferior a 0,1 para entornos de produccion y uso diario; valores mas altos solo para casos creativos.
- Capacidad de razonamiento extendido: esta variante es "instruct post-trained"; la familia dispone de checkpoints especificos "Reasoning" para tareas que requieren cadenas de pensamiento largas.
- Restricciones de licencia: Apache 2.0 permite uso comercial y modificacion sin restricciones declaradas.
- Uso comercial en produccion: la model card menciona un aviso de procesamiento de datos personales con enlace a la politica de privacidad de Mistral AI, aplicable a los servicios gestionados, no necesariamente al uso local del modelo.
- Datos incompletos: no se documentan en la informacion disponible detalles sobre dataset de entrenamiento, tecnicas de alineamiento ni resultados en benchmarks de codigo o matematicas generales.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/mistralai/Ministral-3-8B-Instruct-2512
- Paper: https://arxiv.org/abs/2601.08584
- Blog de Mistral AI sobre la familia Mistral 3: https://mistral.ai/news/mistral-3
- Modelo base: https://huggingface.co/mistralai/Ministral-3-8B-Base-2512
- Coleccion de checkpoints adicionales: https://huggingface.co/collections/mistralai/ministral-3-additional-checkpoints
- Ministral 3 3B Base 2512: https://huggingface.co/mistralai/Ministral-3-3B-Base-2512
- Ministral 3 3B Instruct 2512: https://huggingface.co/mistralai/Ministral-3-3B-Instruct-2512
- Ministral 3 3B Reasoning 2512: https://huggingface.co/mistralai/Ministral-3-3B-Reasoning-2512
- Ministral 3 8B Base 2512: https://huggingface.co/mistralai/Ministral-3-8B-Base-2512
- Ministral 3 8B Reasoning 2512: https://huggingface.co/mistralai/Ministral-3-8B-Reasoning-2512
- Ministral 3 14B Base 2512: https://huggingface.co/mistralai/Ministral-3-14B-Base-2512
- Ministral 3 14B Instruct 2512: https://huggingface.co/mistralai/Ministral-3-14B-Instruct-2512
- Ministral 3 14B Reasoning 2512: https://huggingface.co/mistralai/Ministral-3-14B-Reasoning-2512
- Politica de privacidad de Mistral AI: https://mistral.ai/terms/
- Sitio oficial de Mistral AI: https://mistral.ai/fr/
