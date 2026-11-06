# ArchiveStudio/Qwen3-4B

## Resumen

Qwen3-4B es un modelo de lenguaje causal de tipo transformer denso desarrollado por el equipo Qwen de Alibaba, publicado bajo licencia Apache 2.0. Esta ficha concreta corresponde al repositorio `ArchiveStudio/Qwen3-4B`, un espejo del modelo oficial `Qwen/Qwen3-4B` que conserva los pesos, la licencia y la model card originales sin modificaciones aparentes. El modelo cuenta con 4.022 millones de parámetros totales (3.600 millones sin contar los embeddings) distribuidos en 36 capas con atención GQA de 32 cabezas para consultas y 8 para claves/valores.

La propuesta central de la familia Qwen3 es la conmutación entre modo de razonamiento (thinking) y modo directo (non-thinking) dentro de un mismo modelo, controlable mediante el parámetro `enable_thinking` en la plantilla de chat. En modo thinking el modelo genera un bloque `<think>...</think>` con su cadena de razonamiento antes de la respuesta final, lo que mejora el rendimiento en matemáticas, código y lógica. En modo directo responde de forma más eficiente para diálogo general. Esta versión de 4B es la variante densa de tamaño medio de la familia, pensada para despliegue en hardware de consumo y para tareas de agente con tool calling.

El contexto nativo es de 32.768 tokens, ampliable a 131.072 mediante YaRN. El modelo declara soporte para más de 100 idiomas y dialectos, con capacidades destacadas de instrucción multilingüe y traducción. Es relevante ahora porque ofrece razonamiento explícito y capacidades de agente en un tamaño que cabe en GPUs de consumo de 24 GB con cuantización moderada, algo que hasta hace poco requería modelos mucho mayores.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal denso (Qwen3), 36 capas, GQA 32 cabezas Q / 8 cabezas KV |
| Parametros totales | 4.022.468.096 (4,0B); 3,6B sin embeddings |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens nativo; 131.072 con YaRN |
| Tipos de cuantizacion | No especificados en la model card; al ser safetensors en bf16/fp16 se puede cuantizar a GGUF (Q4_K_M, Q5_K_M, Q8_0), AWQ y GPTQ mediante herramientas de la comunidad |
| Idiomas soportados | Más de 100 idiomas y dialectos (declarado); lista concreta no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repositorio de 8,1 GB) |

## Arquitectura y entrenamiento

Qwen3-4B es un transformer causal denso con 36 capas y atención con query/key-value grouped (GQA) de 32 cabezas para consultas y 8 para claves/valores, lo que reduce el coste de memoria del KV cache en inferencia. El modelo se entrenó en dos fases: preentrenamiento y postentrenamiento, según declara la model card. No se especifican en la información disponible el número exacto de tokens de entrenamiento, la composición del dataset ni los detalles de las etapas de alineación (RLHF, DPO u otras), aunque la familia Qwen3 declara mejoras en alineación con preferencias humanas, escritura creativa, role-playing y seguimiento de instrucciones.

La innovación técnica más destacable es el soporte nativo de dos modos de inferencia en un único conjunto de pesos: modo thinking, que produce razonamiento explícito delimitado por `<think>...</think>`, y modo non-thinking, para respuestas directas. El cambio se controla desde la plantilla de chat (`enable_thinking=True/False`) y también desde los parsers de razonamiento de SGLang y vLLM. La extensión de contexto a 131.072 tokens se realiza mediante YaRN, una técnica de escalado de posiciones por interpolación. La model card no detalla otras innovaciones como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto y diálogo multi-turno con alineación a preferencias humanas.
- Razonamiento explícito en modo thinking: matemáticas, lógica de sentido común y código.
- Generación y comprensión de código en modo thinking y non-thinking.
- Tool calling y function calling en ambos modos, con integración con herramientas externas.
- Capacidades de agente para tareas de múltiples pasos.
- Instrucción multilingüe y traducción en más de 100 idiomas y dialectos.
- Escritura creativa y role-playing.
- Conmutación de modo thinking/non-thinking sin cambiar de modelo.
- Contexto largo de hasta 131.072 tokens con YaRN.

## Casos de uso

- **Asistente de código en IDE**: el modelo puede generar y revisar código con razonamiento paso a paso activando el modo thinking, útil para depuración de errores lógicos donde la cadena de razonamiento mejora la precisión frente a respuestas directas.
- **Agente con tool calling en producción**: gracias al soporte de function calling en ambos modos, se puede integrar en un orquestador que llame a APIs externas (calendario, bases de datos, buscadores) y encadene varios pasos de razonamiento antes de responder.
- **Atención al cliente multilingüe**: con soporte declarado de más de 100 idiomas y contexto de 32.768 tokens, puede gestionar conversaciones multi-turno con historial largo en varios idiomas sin cambiar de modelo.
- **Análisis de documentos largos**: con YaRN y 131.072 tokens de contexto se puede procesar contratos, informes o expedientes completos en una sola pasada, resumiendo o extrayendo información estructurada.
- **Generación de tests y documentación técnica**: en modo non-thinking responde con baja latencia para tareas repetitivas de generación de docstrings, tests unitarios o comentarios de código dentro de un pipeline de CI/CD.
- **Traducción y localización**: el modelo puede traducir textos técnicos y de marketing entre idiomas, con instrucciones de estilo y glosario, aprovechando su capacidad de instrucción multilingüe.
- **Prototipado local en estación de trabajo**: al ser un modelo de 4B en safetensors, se puede ejecutar en una RTX 4090 o incluso en GPUs de 16 GB con cuantización, lo que permite iterar sin coste de API.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite al blog y la documentación oficiales de Qwen3 para las evaluaciones, pero no incluye cifras concretas de MMLU, HumanEval, GSM8K ni otras pruebas en el contenido proporcionado.

## Requisitos de hardware

- **VRAM estimada en bf16/fp16**: aproximadamente 8-9 GB para los pesos, más el KV cache; con contexto de 32.768 tokens el KV cache puede añadir varios GB según el batch.
- **VRAM estimada en cuantización Q4_K_M (GGUF)**: alrededor de 2,5-3 GB para los pesos, lo que permite ejecución en GPUs de 8 GB con contexto moderado.
- **GPU recomendadas**: A100 40/80 GB, H100 para despliegue de alto throughput; RTX 4090 (24 GB) para inferencia local en bf16 con contexto completo; RTX 3090, RTX 4080 y GPUs de 16 GB con cuantización.
- **GPU de consumo**: sí cabe en RTX 4090, RTX 3090, RTX 4080 y en GPUs de 8-12 GB con cuantización Q4 o Q5.
- **Opciones de despliegue**: vLLM (>=0.8.5) y SGLang (>=0.4.6.post1) con parser de razonamiento qwen3; llama.cpp, Ollama, LM Studio, MLX-LM y KTransformers para uso local; TGI mediante el tag text-generation-inference del repositorio.
- **Latencia y throughput**: no se han publicado cifras concretas en la información disponible. El modo non-thinking reduce el número de tokens generados y por tanto la latencia frente al modo thinking.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwen3-4B | 4,0B denso | 32.768 nativo / 131.072 con YaRN | Apache 2.0 | Modo thinking/non-thinking conmutable, tool calling, 100+ idiomas |
| Qwen2.5-3B-Instruct | 3,1B denso | 32.768 nativo / 131.072 con YaRN | Apache 2.0 | Generación anterior, sin modo thinking explícito |
| Llama 3.2 3B Instruct | 3,2B denso | 131.072 | Llama 3.2 Community License | Multilingüe limitado a 8 idiomas oficiales; licencia con restricciones |
| Gemma 2 2B | 2,6B denso | 8.192 | Gemma Terms of Use | Contexto corto; requiere aceptar términos de uso |

La comparación se basa en datos públicos de las fichas de cada modelo; no se dispone de resultados de benchmarks comparativos en la información proporcionada para esta ficha.

## Limitaciones y advertencias

- **Sesgos**: no se documentan evaluaciones de sesgo en la información disponible; como todo modelo entrenado con datos web, puede reproducir estereotipos de género, raza o cultura.
- **Alucinación**: el modo thinking puede producir cadenas de razonamiento plausibles pero incorrectas; conviene validar las respuestas en dominios factuales críticos.
- **Repeticiones**: la propia model card advierte de que pueden aparecer repeticiones sin fin si no se ajustan los parámetros de muestreo; recomienda `presence_penalty=1.5` y temperatura 0,6 con top_p 0,95 en modo thinking.
- **Contexto**: el contexto nativo es de 32.768 tokens; superarlo requiere activar YaRN explícitamente y puede degradar la calidad si no se configura correctamente.
- **Idiomas**: aunque se declaran más de 100 idiomas, el rendimiento varía por idioma y no hay evaluación pública por lengua en la información disponible.
- **Licencia**: Apache 2.0 permite uso comercial sin restricciones adicionales, pero el repositorio es un espejo de terceros (`ArchiveStudio`); para producción conviene usar el repositorio oficial `Qwen/Qwen3-4B`.
- **Repositorio espejo**: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta; no hay garantía de mantenimiento ni de integridad a largo plazo frente al repo oficial.
- **Versión de transformers**: requiere `transformers>=4.51.0`; versiones anteriores fallan con `KeyError: 'qwen3'`.

## Enlaces

- Repositorio Hugging Face (espejo): https://huggingface.co/ArchiveStudio/Qwen3-4B
- Repositorio oficial: https://huggingface.co/Qwen/Qwen3-4B
- Licencia: https://huggingface.co/Qwen/Qwen3-4B/blob/main/LICENSE
- Blog de Qwen3: https://qwenlm.github.io/blog/qwen3/
- GitHub de Qwen3: https://github.com/QwenLM/Qwen3
- Documentación: https://qwen.readthedocs.io/en/latest/
- Chat de Qwen: https://chat.qwen.ai/
- Paper de referencia (arxiv:2505.09388): https://arxiv.org/abs/2505.09388
- Paper de referencia (arxiv:2309.00071): https://arxiv.org/abs/2309.00071
