# bartowski/jmc0_Rein-NPC-4B-GGUF

## Resumen

Rein-NPC-4B es un modelo de lenguaje de aproximadamente 5.000 millones de parámetros (4.962.050.048 según los pesos en safetensors) desarrollado por el usuario jmc0 y cuantizado a GGUF por bartowski. Está especializado en la generación de decisiones tipadas ("typed-decision") para NPC de videojuegos, roleplay y tool calling, y se distribuye bajo licencia Apache 2.0. La model card lo etiqueta como descendiente de la familia Qwen3.5, aunque esta relación no se detalla técnicamente en la información disponible.

El modelo resuelve el problema de dotar a personajes no jugables y agentes conversacionales de un mecanismo estructurado para emitir decisiones y llamadas a herramientas, con soporte multimodal de entrada (texto e imagen mediante un fichero mmproj separado) y decodificación especulativa mediante MTP (multi-token prediction). Su tamaño contenido lo hace desplegable en hardware de consumo, lo que resulta relevante para integración en motores de juego y prototipos de agentes locales.

La ficha se centra en la versión GGUF publicada por bartowski, generada con llama.cpp b12180 e imatrix, con un conjunto amplio de cuantizaciones que van desde bf16 (9,94 GB) hasta IQ3_M. El repositorio ocupa 78,1 GB e incluye todos los ficheros de cuantización.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (detalles no disponibles; etiquetado como Qwen3.5 en los tags) |
| Parametros totales | 4.962.050.048 (aprox. 5B) |
| Parametros activos | No aplica (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | bf16, Q8_0, Q6_K_L, Q6_K, Q6_K_S, Q5_K_M, Q5_K_S, Q4_K_L, Q4_1, Q4_K_M, IQ4_NL, Q4_0, Q4_K_S, IQ4_XS, IQ3_M (lista parcial en la información disponible) |
| Idiomas soportados | en, pt, multilingual |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones llama.cpp); pesos originales en safetensors en el modelo base |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de su vinculación con la familia Qwen3.5 y el uso de un transformer con soporte de decodificación especulativa mediante MTP (multi-token prediction). El modelo acepta entradas de texto e imagen; la funcionalidad de imagen requiere un fichero mmproj adicional distribuido aparte. El prompt format sigue el esquema ChatML de Qwen (`<|im_start|>` / `<|im_end|>`) con un bloque `<think>` al inicio de la respuesta del asistente, lo que sugiere un modo de razonamiento previo a la salida.

El modelo base se entrenó presumiblemente sobre el dataset `jmc0/rein-decisions`, orientado a decisiones tipadas, y está etiquetado para tool calling, roleplay y NPC de juego con soporte de soft-prompt. No se dispone de datos sobre volumen de tokens de entrenamiento, composición del corpus ni uso de RLHF/DPO. Las cuantizaciones de bartowski se generaron con llama.cpp b12180 aplicando imatrix para mejorar la calidad de los pesos cuantizados.

## Capacidades

- Generación de texto conversacional orientada a roleplay y personajes de juego.
- Emisión de decisiones tipadas ("typed-decision"), mecanismo central del modelo para estructurar acciones de NPC.
- Tool calling / function calling con formato XML específico (`<tool_call>`, `<function=...>`, `<parameter=...>`).
- Entrada multimodal de imagen junto con texto, previa carga del fichero mmproj.
- Modo de razonamiento mediante bloque `<think>` antes de la respuesta.
- Soporte multilingüe declarado (inglés, portugués y etiqueta "multilingual").
- Decodificación especulativa con MTP para acelerar la inferencia.
- Compatibilidad con endpoints y con llama.cpp.

## Casos de uso

- NPC conversacionales en videojuegos: el modelo emite decisiones tipadas que el motor del juego puede interpretar directamente, permitiendo diálogos ramificados y comportamiento reactivo sin lógica hardcodeada.
- Agentes con tool calling en local: gracias al formato XML de llamadas a funciones, puede integrarse en pipelines de agentes que consulten APIs (por ejemplo, precios de acciones) desde hardware de consumo.
- Roleplay y narrativa interactiva: su orientación a personajes y el modo `<think>` permiten mantener coherencia de personaje en conversaciones multi-turno.
- Prototipado de asistentes embebidos: con cuantizaciones de 3,24 GB (Q4_K_M) puede desplegarse en portátiles y equipos sin GPU dedicada de gran capacidad.
- Sistemas de atención al cliente con personalidad definida: el soporte de soft-prompt y system prompt permite fijar tono y reglas de negocio.
- Análisis de imágenes con texto asociado (image-text-to-text): con el mmproj cargado puede describir o razonar sobre capturas e imágenes en flujos de juego o documentación.
- Investigación en modelos pequeños especializados: útil como banco de pruebas para decisiones estructuradas y tool calling en entornos con recursos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3,5-4 GB con Q4_K_M (3,24 GB de pesos más overhead de contexto y KV cache); unos 5-6 GB con Q8_0 (5,30 GB); en torno a 10-11 GB con bf16 (9,94 GB).
- GPU recomendadas: cualquier GPU con 6-8 GB de VRAM para cuantizaciones Q4/Q5; RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090, A100 o H100 para bf16 y contextos largos.
- Cabe en GPU de consumo: sí, en la mayoría de tarjetas con 6 GB o más usando Q4_K_M o IQ4_XS; también puede ejecutarse en CPU con llama.cpp.
- Opciones de despliegue: llama.cpp (versión b12180 o superior), Ollama, LM Studio y otros frontends compatibles con GGUF; los tags indican compatibilidad con endpoints.
- Latencia y throughput estimados: no disponibles en la información proporcionada. La decodificación especulativa MTP puede mejorar el throughput, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Rein-NPC-4B (esta ficha) | ~5B | No disponible | Apache 2.0 | GGUF, safetensors | Especializado en NPC, decisiones tipadas y tool calling |
| Qwen2.5-3B / Qwen3 pequeños | 3B-4B | Variable (no confirmado) | Apache 2.0 | GGUF, safetensors | Alternativas generalistas de tamaño similar; no especializadas en decisiones tipadas |
| Llama 3.2 3B | 3B | 128K (según ficha oficial) | Llama 3.2 Community License | GGUF, safetensors | Generalista con soporte de tool calling; licencia más restrictiva |

La comparación cuantitativa con alternativas no está disponible en la información proporcionada; los datos de contexto y rendimiento de los modelos comparables deben verificarse en sus fichas oficiales.

## Limitaciones y advertencias

- No se han publicado evaluaciones de sesgo ni de alucinación; el riesgo de alucinación en roleplay y tool calling debe mitigarse con validación de salidas.
- El soporte idiomático declarado se limita a inglés y portugués (más etiqueta multilingüe); el rendimiento en castellano no está verificado.
- La longitud de contexto no se especifica, lo que impide garantizar conversaciones multi-turno largas sin pruebas previas.
- La funcionalidad de imagen requiere descargar y cargar el fichero mmproj por separado; sin él, el modelo opera solo con texto.
- El formato de tool calling es específico (XML con `<tool_call>` y `<function=...>`); integraciones que esperen JSON estándar requerirán adaptación.
- Aunque la licencia es Apache 2.0, conviene verificar la licencia y procedencia del modelo base `jmc0/Rein-NPC-4B` antes de uso comercial.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que la validación comunitaria es nula.
- Las cuantizaciones de baja precisión (IQ3_M, Q4_0) pueden degradar la calidad de las decisiones tipadas; se recomienda Q4_K_M o superior para producción.

## Enlaces

- Repositorio GGUF: https://huggingface.co/bartowski/jmc0_Rein-NPC-4B-GGUF
- Modelo base: https://huggingface.co/jmc0/Rein-NPC-4B
- Dataset de entrenamiento: https://huggingface.co/datasets/jmc0/rein-decisions
- llama.cpp (release usada para cuantizar): https://github.com/ggml-org/llama.cpp/releases/tag/b12180
