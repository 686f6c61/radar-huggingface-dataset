# ArchiveStudio/Qwen3-8B

## Resumen

Qwen3-8B es un modelo de lenguaje causal denso de 8.190.735.360 parámetros (8,2B nominales, 6,95B sin contar embeddings) desarrollado por el equipo Qwen de Alibaba. Este repositorio concreto, `ArchiveStudio/Qwen3-8B`, es una réplica del checkpoint oficial `Qwen/Qwen3-8B`, publicado bajo licencia Apache 2.0 y derivado del modelo base `Qwen/Qwen3-8B-Base`. Forma parte de la tercera generación de la familia Qwen, que combina modelos densos y MoE bajo una misma filosofía de entrenamiento.

El modelo resuelve el problema de tener que elegir entre un modelo "razonador" y uno conversacional: Qwen3-8B permite alternar entre modo *thinking* (razonamiento extendido para matemáticas, lógica y código) y modo *non-thinking* (diálogo general eficiente) dentro del mismo checkpoint, mediante el parámetro `enable_thinking` del chat template. Incorpora además capacidades de agentes, tool calling y soporte multilingüe declarado de más de 100 idiomas y dialectos.

Arquitectónicamente es un transformer decoder-only con 36 capas y atención GQA (32 cabezas de query, 8 de key/value), con una ventana de contexto nativa de 32.768 tokens ampliable a 131.072 mediante YaRN. Su relevancia actual radica en que ofrece razonamiento de nivel QwQ en un tamaño que cabe en GPUs de consumo con cuantización, bajo licencia permisiva y con soporte amplio en el ecosistema de inferencia (vLLM, SGLang, llama.cpp, Ollama, MLX-LM).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only causal, atención GQA (32 cabezas Q / 8 KV), 36 capas |
| Parametros totales | 8.190.735.360 (8,2B); 6,95B sin embeddings |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens nativos; 131.072 con YaRN |
| Tipos de cuantizacion | No especificados en la información disponible; el ecosistema (llama.cpp, Ollama, MLX-LM) soporta GGUF y otras cuantizaciones estándar |
| Idiomas soportados | Más de 100 idiomas y dialectos (según model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 16,4 GB) |

## Arquitectura y entrenamiento

Qwen3-8B es un transformer decoder-only denso con 36 capas y atención con query/key-value agrupadas (GQA), con 32 cabezas de query y 8 de key/value, lo que reduce el coste de memoria del KV cache durante la inferencia. El modelo se distribuye en dos etapas: preentrenamiento del checkpoint base (`Qwen/Qwen3-8B-Base`) y post-entrenamiento para alineamiento e instrucciones. La model card no detalla el número exacto de tokens de entrenamiento ni la composición del dataset; tampoco especifica si se emplearon RLHF, DPO u otras técnicas de alineamiento concretas, por lo que esos datos deben considerarse no disponibles en la información proporcionada.

La innovación técnica más destacable es la conmutación nativa entre modo *thinking* y *non-thinking* dentro del mismo modelo. En modo thinking, el modelo genera contenido de razonamiento envuelto en un bloque `<think>...</think>` antes de la respuesta final. La model card advierte explícitamente de no usar decodificación greedy en este modo (recomienda `Temperature=0.6`, `TopP=0.95`, `TopK=20`, `MinP=0`), ya que puede degradar el rendimiento y provocar repeticiones infinitas. El contexto largo se gestiona mediante YaRN, que escala la ventana de 32.768 a 131.072 tokens.

## Capacidades

- Generación de texto y conversación multi-turno con alineamiento a preferencias humanas (escritura creativa, role-play, seguimiento de instrucciones).
- Razonamiento extendido en modo thinking para matemáticas, lógica y generación de código.
- Modo non-thinking para diálogo general eficiente y de baja latencia.
- Soporte de tool calling / function calling en ambos modos.
- Capacidades de agente: integración con herramientas externas y tareas multi-paso.
- Multilingüe: más de 100 idiomas y dialectos, con instrucciones y traducción.
- Conmutación de modo mediante `enable_thinking` en el chat template, también disponible vía API en SGLang y vLLM.
- Contexto largo ampliable a 131.072 tokens con YaRN.

## Casos de uso

- **Atención al cliente automatizada**: conversaciones multi-turno con contexto de hasta 32.768 tokens nativos, suficiente para arrastrar historial extenso de tickets y documentación de producto sin truncar.
- **Generación de código en producción**: modo thinking para resolver problemas algorítmicos complejos y modo non-thinking para autocompletado rápido; el tool calling permite integrarlo en pipelines de CI/CD que consulten repositorios o ejecuten tests.
- **Agentes autónomos con herramientas**: tareas multi-paso que requieren llamar a APIs externas, con soporte de function calling tanto en modo razonador como directo.
- **Análisis de documentos largos**: con YaRN a 131.072 tokens se pueden procesar contratos, informes o bases de código extensas en una sola pasada.
- **Asistente de razonamiento matemático**: modo thinking para resolución paso a paso de problemas, con la configuración de muestreo recomendada para evitar repeticiones.
- **Traducción y atención multilingüe**: cobertura declarada de más de 100 idiomas, útil para plataformas de soporte o contenido internacionalizado.
- **Prototipado local en estación de trabajo**: al ser un denso de 8B bajo Apache 2.0, se puede desplegar con Ollama o llama.cpp en hardware de consumo para iterar sin coste de API.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card remite al blog y la documentación oficiales de Qwen para las evaluaciones, pero no incluye cifras concretas (MMLU, HumanEval, GSM8K u otras) en el material proporcionado.

## Requisitos de hardware

- **VRAM en FP16/BF16**: aproximadamente 16,4 GB solo para pesos, más KV cache y activaciones; en la práctica se recomienda 24 GB o más (A100 40GB, H100, RTX 4090 24GB con margen ajustado o cuantización).
- **Cuantización de 8 bits**: alrededor de 9-10 GB de pesos, viable en GPUs de 16 GB.
- **Cuantización de 4 bits (GGUF Q4)**: del orden de 5-6 GB, cabe en GPUs de consumo de 8 GB con contexto moderado.
- **GPU recomendadas**: A100/H100 para producción y contexto largo; RTX 4090, RTX 3090 o RTX 4080 para uso local; GPUs de 8-12 GB solo con cuantización agresiva y contexto reducido.
- **Despliegue en servidor**: vLLM >= 0.8.5 (`vllm serve Qwen/Qwen3-8B --enable-reasoning --reasoning-parser deepseek_r1`) y SGLang >= 0.4.6.post1 (`--reasoning-parser qwen3`), ambos con API compatible con OpenAI.
- **Despliegue local**: Ollama, LM Studio, llama.cpp, MLX-LM y KTransformers dan soporte declarado a Qwen3.
- **Latencia y throughput**: no disponibles en la información proporcionada; dependerán del backend, la cuantización y la longitud de contexto.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwen3-8B (este) | 8,2B denso | 32.768 nativo / 131.072 con YaRN | Apache 2.0 | Modo thinking conmutable, tool calling, 100+ idiomas |
| Qwen2.5-7B-Instruct | ~7,6B denso | 32.768 nativo / 131.072 con YaRN | Apache 2.0 | Generación previa; sin modo thinking nativo; la model card indica que Qwen3 lo supera en modo non-thinking |
| QwQ-32B | 32B denso | 32.768 nativo / 131.072 con YaRN | Apache 2.0 | Predecesor razonador de Qwen; la model card indica que Qwen3 lo supera en modo thinking, con 4x menos parámetros |
| DeepSeek-R1-Distill-Qwen-7B | ~7,6B denso | 32.768 | MIT | Razonador destilado; sin conmutación de modo; datos de rendimiento comparativo no disponibles en esta ficha |

Las afirmaciones de superioridad frente a QwQ-32B y Qwen2.5-Instruct provienen de la model card del autor; no se dispone de cifras de benchmark en la información proporcionada para cuantificarlas.

## Limitaciones y advertencias

- **Riesgo de alucinación**: como todo modelo generativo, puede producir información factual incorrecta con aparente seguridad, especialmente en modo non-thinking.
- **Degradación con greedy decoding**: en modo thinking, la decodificación greedy puede causar repeticiones infinitas y pérdida de calidad; es obligatorio usar la configuración de muestreo recomendada.
- **Sesgos**: no se documentan sesgos específicos en la información disponible; cabe esperar los sesgos presentes en los datos de preentrenamiento, no auditados aquí.
- **Contexto**: los 131.072 tokens requieren activar YaRN; el rendimiento más allá de 32.768 tokens nativos puede degradarse y no está cuantificado en el material disponible.
- **Idiomas**: aunque se declaran más de 100 idiomas, el rendimiento por idioma no está desglosado; los idiomas de baja representación pueden rendir peor.
- **Licencia**: Apache 2.0 permite uso comercial, pero el autor del repo (`ArchiveStudio`) no es el desarrollador original; conviene verificar la integridad del checkpoint frente al oficial `Qwen/Qwen3-8B`.
- **Producción**: el repo tiene 0 descargas y 0 likes, y fue creado y actualizado en la misma fecha; no hay evidencia de validación comunitaria de esta réplica concreta.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/ArchiveStudio/Qwen3-8B
- Modelo oficial de referencia: https://huggingface.co/Qwen/Qwen3-8B
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B-Base
- Blog de Qwen3: https://qwenlm.github.io/blog/qwen3/
- GitHub de Qwen3: https://github.com/QwenLM/Qwen3
- Documentación: https://qwen.readthedocs.io/en/latest/
- Chat de Qwen: https://chat.qwen.ai/
- Licencia: https://huggingface.co/Qwen/Qwen3-8B/blob/main/LICENSE
- Paper referenciado (tag): arxiv:2505.09388
- Paper referenciado (tag): arxiv:2309.00071
