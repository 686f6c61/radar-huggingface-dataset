# aisingapore/Qwen-SEA-LION-v5-27B-INT4

## Resumen

Qwen-SEA-LION-v5-27B-INT4 es la version cuantizada a 4 bits del modelo Qwen-SEA-LION-v5-27B, desarrollado por el pilar de productos de IA de AI Singapore (AISG) con financiacion de la National Research Foundation de Singapur. Forma parte de la familia SEA-LION (Southeast Asian Languages In One Network), una coleccion de modelos disenados especificamente para las lenguas del sudeste asiatico. El modelo base es un transformer causal derivado de Qwen3.8-27B, con encoder de vision, 27.356 millones de parametros y una ventana de contexto de 262.144 tokens.

El problema que resuelve es la cobertura deficitaria de las lenguas del sudeste asiatico en los grandes modelos genericos: birmano, filipino, indonesio, malayo, tamil, tailandes y vietnamita, ademas de ingles y chino. Esta version INT4 reduce el peso de los pesos de 55,6 GB (BF16) a 20,6 GB, lo que rebaja de forma sustancial los requisitos de VRAM para despliegue en produccion sin alterar tokenizer, plantilla de chat ni valores por defecto de muestreo.

La relevancia actual radica en que combina tres elementos poco frecuentes en un mismo artefacto: soporte multilingue regional amplio, capacidad multimodal image-text-to-text y un formato de cuantizacion (compressed-tensors con GPTQ) compatible con los motores de inferencia de alto rendimiento vLLM y SGLang. La licencia MIT facilita su adopcion comercial sin las restricciones habituales de los modelos de pesos abiertos con clausulas de uso aceptable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal con encoder de vision (familia Qwen3.8-27B) |
| Parametros totales | 27.356.728.560 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | INT4 (GPTQ simetrico, group size 32); pesos lineales en INT4, encoder de vision y cabeza MTP en BF16 |
| Idiomas soportados | en, zh, my, id, fil, ms, ta, th, vi |
| Licencia | MIT |
| Formato de pesos | safetensors (compressed-tensors) |

## Arquitectura y entrenamiento

El modelo es un transformer causal con encoder de vision, cuantizado desde aisingapore/Qwen-SEA-LION-v5-27B mediante la herramienta llm-compressor del proyecto vLLM. La cuantizacion aplica GPTQ simetrico con group size 32 a la mayoria de las capas lineales, calibrado sobre datos de instruccion del sudeste asiatico. El resto de pesos, incluido el encoder de vision y la cabeza de prediccion multi-token (MTP), permanece en BF16. Esta decision preserva la calidad de la entrada visual y de la decodificacion especulativa asociada a la cabeza MTP, que es precisamente donde la cuantizacion agresiva suele degradar mas el rendimiento.

No se dispone en la informacion proporcionada del numero de tokens de entrenamiento, la composicion exacta del dataset ni los detalles de alineacion (RLHF/DPO) del modelo base. La model card remite explicitamente a la ficha de aisingapore/Qwen-SEA-LION-v5-27B y a la de Qwen/Qwen3.8-27B para esos detalles, asi como para las capacidades de entrada de imagen y video, el esfuerzo de razonamiento y los ajustes de muestreo recomendados. La innovacion tecnica destacable de esta version es la cuantizacion selectiva: mantener en BF16 los componentes sensibles (vision y MTP) mientras se comprimen las capas lineales del decodificador.

## Capacidades

- Generacion de texto y razonamiento con modo de pensamiento (thinking) activado por defecto, desactivable mediante `enable_thinking: False` en `chat_template_kwargs`.
- Entrada multimodal image-text-to-text: procesa imagenes junto con texto gracias al encoder de vision conservado en BF16.
- Tool calling / function calling nativo, con parser `qwen3_coder` en vLLM y SGLang.
- Soporte de agentes y razonamiento multi-paso, con separacion entre contenido de razonamiento (`reasoning` / `reasoning_content`) y respuesta final.
- Capacidades multilingues en nueve idiomas: ingles, chino, birmano, indonesio, filipino, malayo, tamil, tailandes y vietnamita.
- Decodificacion especulativa mediante cabeza de prediccion multi-token (MTP) en BF16.
- Compatibilidad con la API OpenAI a traves de vLLM y SGLang, incluidos endpoints estandar de chat completions.

## Casos de uso

- Atencion al cliente multilingue en el sudeste asiatico: el modelo puede mantener conversaciones multi-turno con hasta 262.144 tokens de contexto, lo que permite arrastrar historiales largos e incluso documentos completos de un cliente sin truncar. Es adecuado para mercados donde un mismo operador atiende consultas en indonesio, malayo, tailandes y vietnamita.
- Tramitacion documental con entrada visual: al conservar el encoder de vision en BF16, puede procesar facturas, albaranes o formularios escaneados y extraer datos estructurados, combinando la lectura de imagen con la generacion de texto en el idioma del usuario.
- Generacion de codigo en produccion: el soporte de tool calling con parser `qwen3_coder` permite integrarlo en pipelines de CI/CD o en asistentes de IDE que invocan funciones externas, con la ventaja de un peso de 20,6 GB que reduce el coste por instancia frente a la version BF16.
- Asistentes agenticos con acceso a herramientas: el modo thinking y la separacion entre razonamiento y respuesta facilitan construir agentes multi-paso que planifican, invocan APIs y justifican sus decisiones, auditables por separado.
- Analisis de mercado regional: con contexto de 262.144 tokens puede ingerir informes extensos, transcripciones y articulos de prensa local en varias lenguas del sudeste asiatico y producir resumenes o comparativas en el idioma de destino.
- Despliegue en infraestructura limitada: la reduccion de 55,6 GB a 20,6 GB permite servir el modelo en una sola GPU de 24 GB o en dos de 16 GB, lo que habilita casos de uso de investigacion y prototipado que no podrian asumir la version BF16.
- Localizacion y traduccion especializada: la cobertura de birmano, tamil y filipino, poco representadas en modelos genericos, lo hace util para traduccion de contenido corporativo y adaptacion cultural de materiales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 20,6 GB solo para los pesos en INT4; con cache KV para contexto largo, se recomienda reservar entre 24 y 48 GB segun la longitud de secuencia.
- GPU recomendadas: A100 40/80 GB, H100 80 GB o L40S 48 GB para despliegues con contexto extendido; una RTX 4090 de 24 GB puede alojar los pesos pero limita la longitud efectiva de contexto.
- Cabe en GPU de consumo: si, en RTX 4090 (24 GB) y RTX 3090 (24 GB) con contexto moderado; en GPUs de 16 GB requeriria offloading o reducir el contexto.
- Opciones de despliegue: vLLM (`vllm serve` con `--reasoning-parser qwen3` y `--tool-call-parser qwen3_coder`) y SGLang (`sglang serve --reasoning-parser qwen3 --tool-call-parser qwen3_coder`). Existe ademas una variante GGUF oficial para llama.cpp.
- Latencia y throughput estimados: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen-SEA-LION-v5-27B-INT4 | 27,36 B | 262.144 | INT4 (GPTQ, group 32) | MIT | Hugging Face |
| Qwen-SEA-LION-v5-27B (BF16) | 27,36 B | 262.144 | BF16 | MIT | Hugging Face |
| Qwen-SEA-LION-v5-27B-FP8 | 27,36 B | 262.144 | FP8 | MIT | Hugging Face |
| Qwen-SEA-LION-v5-27B-GGUF | 27,36 B | 262.144 | GGUF (llama.cpp) | MIT | Hugging Face |

Las cuatro variantes comparten arquitectura, contexto y licencia; la diferencia practica es el equilibrio entre huella de memoria (20,6 GB en INT4 frente a 55,6 GB en BF16) y fidelidad numerica. No se dispone de datos de benchmarks que permitan comparar la perdida de calidad de la cuantizacion INT4 frente a BF16 o FP8.

## Limitaciones y advertencias

- El modelo no ha sido alineado para seguridad segun la propia model card; los desarrolladores deben aplicar su propio fine-tuning de seguridad y medidas de proteccion adicionales.
- Riesgo de alucinacion inherente a los modelos generativos; no se han publicado evaluaciones especificas de factualidad en la informacion disponible.
- La cuantizacion INT4 puede degradar tareas sensibles a la precision numerica, como matematicas complejas o generacion de codigo muy estricta; no se han publicado mediciones de esta perdida.
- La cobertura linguistica se limita a los nueve idiomas declarados; el rendimiento en otras lenguas del sudeste asiatico (p. ej., javanes, khmer o laosiano) no esta documentado.
- El contexto de 262.144 tokens es el maximo teorico; el rendimiento real con secuencias muy largas depende de la VRAM disponible y del motor de inferencia.
- La licencia MIT permite uso comercial sin restricciones adicionales, pero la model card declina cualquier responsabilidad por danos derivados del uso.
- El modelo tiene solo 23 descargas y 0 likes en el momento de la consulta, lo que indica una adopcion todavia muy limitada y escasa validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/aisingapore/Qwen-SEA-LION-v5-27B-INT4
- Modelo base BF16: https://huggingface.co/aisingapore/Qwen-SEA-LION-v5-27B
- Version FP8: https://huggingface.co/aisingapore/Qwen-SEA-LION-v5-27B-FP8
- Version GGUF: https://huggingface.co/aisingapore/Qwen-SEA-LION-v5-27B-GGUF
- Coleccion SEA-LION v5: https://huggingface.co/collections/aisingapore/sea-lion-v5
- Modelo Qwen3.8-27B original: https://huggingface.co/Qwen/Qwen3.8-27B
- Quickstart de Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B#quickstart
- Receta de vLLM para Qwen3.8-27B: https://recipes.vllm.ai/Qwen/Qwen3.8-27B
- Cookbook de SGLang para Qwen3.8-27B: https://docs.sglang.io/cookbook/autoregressive/Qwen/Qwen3.8-27B
- Herramienta de cuantizacion llm-compressor: https://github.com/vllm-project/llm-compressor
- Sitio oficial de SEA-LION: https://sea-lion.ai
- Licencia MIT: https://mit-license.org/
