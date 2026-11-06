# ArchiveStudio/Qwen3-30B-A3B

## Resumen

Qwen3-30B-A3B es un modelo de lenguaje causal de tipo Mixture-of-Experts (MoE) desarrollado por el equipo Qwen de Alibaba. Con 30.500 millones de parametros totales y solo 3.300 millones activos por token, ofrece un equilibrio entre capacidad y eficiencia computacional: la inferencia cuesta aproximadamente lo que un modelo denso de 3B, pero el conocimiento almacenado corresponde a un modelo de 30B. Este repositorio concreto (ArchiveStudio/Qwen3-30B-A3B) es una publicacion espejo del modelo oficial Qwen/Qwen3-30B-A3B, con licencia Apache 2.0.

El modelo destaca por integrar en una sola red dos modos de operacion conmutables: modo pensamiento (thinking), orientado a razonamiento logico complejo, matematicas y generacion de codigo, y modo no-pensamiento para dialogo general eficiente. Esta conmutacion se controla mediante el parametro `enable_thinking` en la plantilla de chat. Ademas, incorpora capacidades de agentes, tool calling en ambos modos y soporte de mas de 100 idiomas y dialectos.

La longitud de contexto nativa es de 32.768 tokens, ampliable a 131.072 tokens mediante YaRN. El modelo esta pensado para despliegues en produccion con vLLM o SGLang, y su naturaleza MoE lo hace especialmente atractivo para servir cargas concurrentes en hardware de gama alta sin incurrir en el coste de un denso de 30B.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal MoE (Qwen3-MoE) con GQA |
| Parametros totales | 30.532.122.624 (30,5B) |
| Parametros activos | 3,3B por token |
| Parametros no-embedding | 29,9B |
| Longitud de contexto | 32.768 tokens nativo; 131.072 con YaRN |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (soporte comunitario via GGUF/AWQ esperado por compatibilidad con ecosistema Qwen3) |
| Idiomas soportados | Mas de 100 idiomas y dialectos |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Capas | 48 |
| Cabezas de atencion | 32 (Q) / 4 (KV), GQA |
| Expertos | 128 totales, 8 activados por token |
| Libreria | transformers >= 4.51.0 |
| Tamano del repositorio | 61,1 GB |

## Arquitectura y entrenamiento

Qwen3-30B-A3B es un transformer causal con arquitectura Mixture-of-Experts: 48 capas, 128 expertos por capa de los cuales se activan 8 por token mediante enrutamiento, y atencion con Grouped-Query Attention (32 cabezas de consulta y 4 de clave-valor). Esta configuracion reduce drasticamente el coste de inferencia frente a un denso equivalente, ya que solo se computan 3,3B de parametros por token pese a almacenar 30,5B.

El entrenamiento combina una fase de preentrenamiento con una fase de post-entrenamiento que incluye alineacion con preferencias humanas y ajuste para modos de razonamiento. El modelo base es Qwen/Qwen3-30B-A3B-Base. La innovacion principal es la conmutacion nativa entre modo pensamiento y no-pensamiento dentro de una misma red: en modo pensamiento el modelo genera contenido de razonamiento envuelto en bloques `<think>...</think>` antes de la respuesta final. El modelo esta disenado para integrarse con decodificacion especulativa y parsers de razonamiento en vLLM (`deepseek_r1`) y SGLang (`qwen3`). No se dispone en la informacion proporcionada del numero exacto de tokens de entrenamiento ni de la composicion detallada del dataset.

## Capacidades

- Generacion de texto y dialogo multi-turno con alineacion de preferencias humanas.
- Razonamiento logico complejo en modo pensamiento (matematicas, logica, codigo).
- Generacion y comprension de codigo en modo pensamiento y no-pensamiento.
- Tool calling y function calling en ambos modos, con integracion precisa de herramientas externas.
- Capacidades de agente y razonamiento multi-paso para tareas complejas.
- Soporte multilingue de mas de 100 idiomas y dialectos, con instrucciones y traduccion.
- Conmutacion de modo pensamiento/no-pensamiento mediante `enable_thinking`.
- Escritura creativa, role-playing e instrucciones complejas.
- Compatibilidad con endpoints OpenAI via vLLM y SGLang.

## Casos de uso

- Atencion al cliente automatizada: el modelo puede gestionar conversaciones multi-turno con contexto de hasta 32.768 tokens (131.072 con YaRN), manteniendo coherencia en hilos largos y usando el modo no-pensamiento para respuestas rapidas.
- Generacion de codigo en produccion: soporta tool calling y puede integrarse en pipelines de CI/CD o asistentes de IDE, usando el modo pensamiento para tareas de refactorizacion o depuracion compleja.
- Agentes autonomos con herramientas: su capacidad de function calling en ambos modos permite construir agentes que consultan APIs, bases de datos o servicios externos con razonamiento multi-paso.
- Traduccion y localizacion multilingue: con soporte de mas de 100 idiomas, es adecuado para pipelines de traduccion automatica y adaptacion de contenido.
- Asistencia matematica y analisis cuantitativo: el modo pensamiento mejora el rendimiento en problemas de varios pasos, util para tutoria o generacion de informes analiticos.
- Procesamiento de documentos largos: con 131.072 tokens via YaRN puede resumir, extraer y razonar sobre contratos, informes o expedientes extensos.
- Despliegue en entornos con recursos limitados: al activar solo 3,3B parametros por token, permite servir cargas concurrentes con coste computacional contenido frente a densos de 30B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en BF16/FP16: aproximadamente 61 GB solo para pesos, mas overhead de KV cache y activaciones; se recomienda 80 GB o mas.
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 30-35 GB.
- VRAM estimada en cuantizacion de 4 bits: aproximadamente 16-20 GB (sujeto a la calidad de la cuantizacion disponible).
- GPU recomendadas: A100 80 GB, H100 80 GB, H200 para despliegues en BF16; multiples RTX 4090 (24 GB) para cuantizaciones.
- Cabe en GPU de consumo: si, en configuraciones cuantizadas de 4 bits sobre RTX 4090 (24 GB) o superiores; en BF16 no cabe en una sola GPU de consumo.
- Opciones de despliegue: vLLM >= 0.8.5 (`vllm serve ... --enable-reasoning --reasoning-parser deepseek_r1`), SGLang >= 0.4.6.post1 (`--reasoning-parser qwen3`), transformers >= 4.51.0, y soporte en Ollama, LMStudio, MLX-LM, llama.cpp y KTransformers.
- Latencia y throughput: no disponibles en la informacion proporcionada; el coste por token corresponde a un modelo de 3,3B activos, lo que reduce la latencia frente a un denso de 30B.

## Comparativa con modelos similares

| Modelo | Parametros totales | Activos | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3-30B-A3B | 30,5B | 3,3B | 32.768 (131.072 YaRN) | Apache 2.0 | MoE con modo pensamiento conmutable |
| Qwen3-32B (denso) | 32B | 32B | 32.768 (131.072 YaRN) | Apache 2.0 | Mayor coste de inferencia, sin MoE |
| Qwen2.5-32B-Instruct | 32B | 32B | 32.768 | Apache 2.0 | Generacion anterior, sin modo pensamiento nativo |
| QwQ-32B | 32B | 32B | 32.768 | Apache 2.0 | Enfocado a razonamiento, sin conmutacion de modo |

Datos de rendimiento comparativo no disponibles en la informacion proporcionada.

## Limitaciones y advertencias

- Riesgo de alucinacion inherente a los modelos de lenguaje; requiere validacion en dominios criticos.
- El modo pensamiento genera contenido adicional en `<think>...</think>` que debe parsearse correctamente; un manejo erroneo puede exponer razonamiento interno al usuario final.
- El contexto nativo es de 32.768 tokens; superarlo requiere configuracion de YaRN, que puede degradar el rendimiento si no se ajusta correctamente.
- No se dispone de informacion detallada sobre sesgos especificos ni sobre la composicion del dataset de entrenamiento.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda revisar los terminos del modelo oficial Qwen para despliegues en produccion.
- Este repositorio espejo (ArchiveStudio) no tiene descargas ni likes registrados; para produccion se recomienda usar el repositorio oficial Qwen/Qwen3-30B-A3B.
- Requiere transformers >= 4.51.0; versiones anteriores fallan con `KeyError: 'qwen3_moe'`.
- No se dispone de datos verificados de benchmarks para esta publicacion concreta.

## Enlaces

- Hugging Face (este repositorio): https://huggingface.co/ArchiveStudio/Qwen3-30B-A3B
- Modelo oficial: https://huggingface.co/Qwen/Qwen3-30B-A3B
- Modelo base: https://huggingface.co/Qwen/Qwen3-30B-A3B-Base
- Blog Qwen3: https://qwenlm.github.io/blog/qwen3/
- GitHub Qwen3: https://github.com/QwenLM/Qwen3
- Documentacion: https://qwen.readthedocs.io/en/latest/
- Chat Qwen: https://chat.qwen.ai/
- Licencia: https://huggingface.co/Qwen/Qwen3-30B-A3B/blob/main/LICENSE
- Paper de referencia (arxiv:2505.09388): https://arxiv.org/abs/2505.09388
- Paper de referencia (arxiv:2309.00071): https://arxiv.org/abs/2309.00071
