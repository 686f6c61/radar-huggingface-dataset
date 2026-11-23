# sergolsub/copernicus-31B-MLX-4bit

## Resumen

Copernicus-31B-MLX-4bit es una conversión cuantizada a 4 bits en formato MLX del modelo Poindexter-Labs/Copernicus-31B, publicada por el usuario sergolsub. El objetivo no es otro que permitir la inferencia del modelo original de 31 000 millones de parámetros en hardware Apple Silicon mediante la librería `mlx_lm`, sin reentrenamiento ni modificaciones de arquitectura: se trata de una recuantización afín a 4 bits derivada de una conversión previa a 8 bits del mismo autor, manteniendo el tamaño de grupo original.

El modelo base pertenece a la familia Copernicus de Poindexter-Labs y, a juzgar por la interfaz de uso documentada, está especializado en tareas de decisión estructurada: clasificación binaria (`noul`), elección entre categorías (`choice`) y puntuación ordinal (`score`) sobre textos de entrada. La model card describe además una "decision mode" con cabezas específicas (`decision_config.json`, `joint_config.json`) y un modo conjunto, lo que sugiere una arquitectura con cabezas auxiliares sobre el transformer base, aunque no se detalla la arquitectura interna en la información disponible.

La relevancia de esta ficha radica en que documenta una de las pocas alternativas prácticas para ejecutar un modelo de 31B en un Mac mini M4 Pro con 48 GB de memoria unificada, con métricas de latencia y calidad medidas empíricamente por el autor de la conversión. La licencia Apache 2.0 heredada del modelo original facilita su uso comercial, aunque con las cautelas habituales sobre la licencia upstream.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (base: Poindexter-Labs/Copernicus-31B); detalles internos no disponibles |
| Parámetros totales | 31 000 millones (según nombre del modelo base) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | 4 bits afín (MLX), derivada de una conversión previa a 8 bits |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (heredada del modelo upstream) |
| Formato de pesos | safetensors en layout MLX, más `config.json`, tokenizer, `chat_template.jinja` y scripts `*_mlx.py` |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base más allá de su naturaleza transformer y de la existencia de una "decision mode" con cabezas específicas para tareas de clasificación, elección y puntuación, además de un modo conjunto (`joint_config.json`). No se especifican el número de capas, la dimensión oculta, el mecanismo de atención ni la composición del dataset de entrenamiento del modelo original.

Respecto al proceso de cuantización, la model card indica que los pesos a 4 bits se obtuvieron desquantizando la conversión a 8 bits del mismo autor y recuantizando con cuantización afín de 4 bits, manteniendo el mismo tamaño de grupo. No hubo reentrenamiento ni cambios arquitectónicos. El autor reporta una divergencia media de KL entre la versión 8-bit y la 4-bit de 6,52e-03 nats (p95 = 2,45e-02, máximo = 7,14e-02) sobre 100 filas de evaluación, aunque no se registraron las probabilidades del modelo original en bf16, por lo que no hay KL directa contra la referencia completa.

## Capacidades

- Clasificación binaria de textos mediante el tipo de decisión `noul` (por ejemplo, determinar si un cliente solicita un reembolso).
- Elección entre categorías definidas por el usuario mediante el tipo `choice`, con criterios configurables (por ejemplo, asignar un ticket al equipo de facturación o al de envíos).
- Puntuación ordinal mediante el tipo `score`, con una lista de niveles de severidad o impacto (por ejemplo, "cosmetic", "annoying", "blocks").
- Modo de decisión conjunto (joint head) documentado en los ficheros de configuración, aunque sin ejemplos de uso en la model card.
- Generación de texto estándar a través de la interfaz MLX (`mlx_lm`), aunque la model card se centra en el uso mediante la API `Copernicus.decide`.
- Soporte de tool calling, agentes, razonamiento multi-paso, visión o audio: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible.

## Casos de uso

- Triaje automático de tickets de soporte: el modelo puede clasificar cada incidencia entrante con el tipo `choice` para enrutarla al equipo adecuado (facturación, envíos, técnico) y con el tipo `score` para asignar severidad, tal como muestra el ejemplo de la model card con el pedido #7821 y el error de cuota de disco.
- Detección de intención de reembolso en atención al cliente: mediante `noul` se puede determinar si un mensaje como el del pedido #4411 (cobro duplicado y estado impagado) contiene una solicitud explícita de devolución, integrándolo en un flujo de preprocesado antes de un agente conversacional.
- Enrutamiento de correos o formularios internos: el tipo `choice` con criterios personalizados permite mapear mensajes a departamentos o colas de trabajo sin necesidad de un LLM generativo completo, con menor latencia y coste.
- Priorización de incidencias en producción: el tipo `score` con niveles como "cosmetic", "annoying" o "blocks" permite ordenar alertas o bugs por impacto antes de que un humano los revise, usando la decisión estructurada como señal para un sistema de tickets.
- Moderación o etiquetado de contenido con criterios binarios: el tipo `noul` admite preguntas del estilo "¿el usuario pide un reembolso?", extensible a otras preguntas de sí/no con instrucciones claras.
- Prototipado local en Apple Silicon: gracias a los 18,42 GB en disco y 18,56 GB de memoria residente máxima, el modelo se puede ejecutar en un Mac mini M4 Pro de 48 GB para experimentar con decisiones estructuradas sin depender de GPUs dedicadas ni de servicios en la nube.
- Evaluación de pipelines de decisión: la API `decide` devuelve una salida por tarea, lo que facilita la integración en tests automatizados de clasificación con criterios versionados en JSON.

## Benchmarks y rendimiento

Los únicos datos publicados son los de la evaluación propia del autor de la conversión sobre un conjunto no especificado, comparando la versión 8-bit con la 4-bit. No hay resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

| Versión | Accuracy | noul | choice | score | PPL | Disco | Latencia mediana |
|---|---|---|---|---|---|---|---|
| original (bf16) | no medida | no medida | no medida | no medida | no medida | no medida | no medida |
| 8-bit MLX | 87,8 % | 90,0 % | 92,0 % | 80,0 % | 1,867 | 33,77 GB | 4712 ms |
| 4-bit MLX | 84,4 % | 87,5 % | 88,0 % | 76,0 % | 1,889 | 18,42 GB | 4680 ms |

Divergencia KL entre la versión 8-bit y la 4-bit (100 filas): media 6,52e-03 nats, p95 2,45e-02, máximo 7,14e-02. No se registraron probabilidades del modelo original en bf16, por lo que la KL contra la referencia completa no está disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: 18,56 GB de memoria residente máxima medida en carga (Mac mini M4 Pro, 48 GB); en disco ocupa 18,42 GB.
- GPU recomendadas: Apple Silicon con al menos 24 GB de memoria unificada para margen; el autor ha validado un Mac mini M4 Pro de 48 GB.
- Compatibilidad con GPU consumer: al ser una conversión MLX, está pensada para Apple Silicon; no se documenta su uso en GPUs NVIDIA o AMD.
- Opciones de despliegue: `mlx_lm` y el loader propio `copernicus_mlx.py` incluido en el repositorio; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput medidos: mediana de 4680 ms por decisión y 0,32 decisiones cortas por segundo sostenidas; tiempo de carga de 6,47 s.
- Almacenamiento: aproximadamente 18,42 GB en disco para los pesos cuantizados.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables de la misma categoría (clasificación estructurada de 31B) en la documentación proporcionada. La única comparación posible es interna, entre las versiones del propio modelo:

| Versión | Parámetros | Contexto | Licencia | Formato | Disco | Latencia mediana |
|---|---|---|---|---|---|---|
| Copernicus-31B (bf16) | 31B | no disponible | Apache 2.0 | safetensors | no disponible | no disponible |
| Copernicus-31B MLX 8-bit | 31B | no disponible | Apache 2.0 | safetensors MLX | 33,77 GB | 4712 ms |
| Copernicus-31B MLX 4-bit | 31B | no disponible | Apache 2.0 | safetensors MLX | 18,42 GB | 4680 ms |

## Limitaciones y advertencias

- La model card no documenta sesgos conocidos, riesgos de alucinación ni limitaciones idiomáticas del modelo base; se desconoce su comportamiento fuera del conjunto de evaluación del autor.
- No hay resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) ni comparación con el modelo original en bf16, por lo que la calidad absoluta no está verificada de forma independiente.
- La evaluación de calidad se realizó sobre un conjunto no descrito, con métricas propias del autor (accuracy, noul, choice, score, PPL); no es directamente comparable con evaluaciones publicadas de otros modelos.
- La licencia Apache 2.0 se hereda del repositorio upstream; en caso de conflicto, prevalece la licencia del repositorio original, por lo que conviene revisarla antes de un uso comercial.
- El modelo está empaquetado exclusivamente para MLX y Apple Silicon; no se garantiza su funcionamiento en otros backends ni se ofrecen pesos GGUF.
- La API de uso está orientada a decisiones estructuradas mediante `Copernicus.decide`; no se documenta el comportamiento en generación libre, tool calling ni razonamiento multi-paso.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validación por parte de la comunidad.
- La fecha de creación indicada (2026-11-23) resulta anómala y debe tratarse con cautela.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/sergolsub/copernicus-31B-MLX-4bit
- Modelo base: https://huggingface.co/Poindexter-Labs/Copernicus-31B
- Conversión 8-bit del mismo autor: https://huggingface.co/sergolsub/copernicus-31B-MLX-8bit
