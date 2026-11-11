# openamer-max/openamer-max-watch

## Resumen

OpenAmer-Max-Watch es un ajuste fino (LoRA fusionado) del modelo base Qwen/Qwen3-0.6B, publicado por el usuario openamer-max. Se presenta como el escalón más pequeño de una familia de modelos denominada OpenAmer-Max, organizada por destino de hardware (desde reloj inteligente hasta clúster). El objetivo declarado es ofrecer un asistente de identidad de producto y respuestas cortas que funcione íntegramente en local, sobre CPU, sin GPU ni telemetría, en dispositivos con recursos muy limitados como un smartwatch, un móvil con 2 GB de RAM libre o una Raspberry Pi.

El modelo se distribuye en formato GGUF cuantizado Q8_0 (639 MB) y está pensado para ejecutarse con llama.cpp u Ollama. Su especialización es acotada: identificar el producto, responder hechos a partir de un contexto proporcionado (RAG), rechazar honestamente lo que no sabe y resolver aritmética pequeña. No es un chatbot de propósito general.

La relevancia actual radica en su propuesta de despliegue en el extremo (edge/wearables) con licencia Apache-2.0 y una documentación inusualmente transparente sobre el proceso de entrenamiento, la detección de contaminación del conjunto de test y el impacto de la cuantización. No obstante, el repositorio registra 0 descargas y 0 likes en el momento de la consulta, y las cifras de rendimiento proceden exclusivamente de la model card del autor, sin verificación independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3-0.6B); ajuste mediante LoRA fusionado |
| Parametros totales | 0,6 B (aproximadamente, según el modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4096 tokens (valor configurado en el Modelfile de ejemplo; no se especifica el máximo del modelo base) |
| Tipos de cuantizacion | Q8_0 (publicado, 639 MB); se mencionan Q6_K y f16 en el proceso de validación |
| Idiomas soportados | de, bs, hr, sr, en |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (f16 intermedio y Q8_0 final) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3-0.6B, un transformer de 0,6 mil millones de parámetros con licencia Apache-2.0. Sobre él se aplicó un ajuste LoRA con r=32, α=64 y todas las 7 proyecciones, lo que supone 20,19 millones de parámetros entrenables (3,28 % del total). El entrenamiento se realizó en bf16 sin cuantización, en 4 etapas (un arranque desde cero y 3 continuaciones desde el adaptador previo), con 124 pasos por etapa, aproximadamente 5 minutos por etapa y 3,4 GB de VRAM. El conjunto de datos consistió en 1873 ejemplos autogenerados en 10 categorías, con 0 prompts contradictorios tras la corrección. La publicación final se obtuvo fusionando el adaptador, convirtiendo a GGUF f16 y cuantizando a Q8_0.

La model card documenta tres hallazgos técnicos: primero, que las etiquetas contradictorias eran el principal defecto (540 de 1696 prompts afectados; corregirlas elevó la precisión de tokens del 94,9 % al 99,2 %); segundo, que la contaminación del test es invisible si no se busca (68 filas de entrenamiento coincidían literalmente con preguntas del benchmark y se eliminaron con un paso denominado `purge_testset`); y tercero, que la calidad de la cuantización no es monótona en bits (para un adaptador intermedio, Q8_0 respondía 401 en lugar de 391 mientras Q6_K acertaba). No se especifica el uso de RLHF ni DPO.

## Capacidades

- Generación de texto breve: respuestas de una frase o listas cortas, en alemán y bosnio principalmente.
- Identificación de producto: responde de forma consistente sobre qué es OpenAmer y quién lo desarrolla.
- Respuesta a hechos desde contexto suministrado (RAG), sin inventar cuando la información está en el contexto.
- Rechazo honesto de lo desconocido: produce respuestas del tipo "Das weiss ich nicht" ante preguntas fuera de su ámbito.
- Declaración de límites propios: enumera lo que no puede hacer (generación de música, vídeo desde la nada, telefonía).
- Aritmética pequeña: multiplicaciones de dos cifras verificadas en la model card (17×23=391, 45×12=540, 21×19=399).
- Multilingüe limitado: alemán, bosnio, croata, serbio e inglés, con degradación en formulaciones bosnias no vistas.
- No se documenta soporte de tool calling, function calling, agentes, visión ni audio.
- Modo thinking: requiere desactivarlo explícitamente (`think:false`); en caso contrario, el modelo consume todos los tokens dentro de ` thinking` y no responde.

## Casos de uso

- Asistente de identidad de producto en wearables: integrado en un smartwatch o pulsera, responde en 0,04–0,38 s sobre qué es el producto y sus funciones, ejecutándose en CPU sin conexión.
- Capa de respuestas cortas en aplicaciones móviles: con 639 MB en Q8_0 y unos 2 GB de RAM libre, puede embeberse en una app Android o iOS para consultas puntuales sin enviar datos a la nube.
- RAG ligero en dispositivos edge: al responder a partir de un contexto suministrado y rechazar lo ausente, encaja como capa de respuesta sobre un índice local de documentación en una Raspberry Pi.
- Filtro de abstención en pipelines: su comportamiento verificado de rechazo ("Das weiss ich nicht") permite usarlo como primera barrera que deriva consultas fuera de dominio a un modelo mayor.
- Demostraciones y prototipos offline: útil para validar flujos de asistente local en ferias o entornos sin conectividad, con licencia Apache-2.0 para uso comercial.
- Cálculo aritmético inmediato en interfaces de voz: multiplicaciones de dos cifras con latencia inferior a 0,4 s para asistentes de manos libres.
- Soporte multilingüe de cortesía en los Balcanes: respuestas directas en bosnio, croata y serbio para saludos y consultas de producto en puntos de atención locales.

## Benchmarks y rendimiento

Los datos proceden exclusivamente de la model card del autor, medidos sobre la build publicada en una RTX 5060 Laptop (8 GB). No hay verificación independiente.

| Prueba | Resultado |
|---|---|
| Benchmark congelado, 23 casos no vistos (hechos, paráfrasis, rechazos, bosnio, largo, corto, edge) | 23/23 (100 %) |
| Precisión de tokens de respuesta (split reservado, 4536 tokens) | 99,63 % |
| Test nuevo, 9 preguntas nunca vistas en entrenamiento | 8/9 |
| Sonda sobre la build publicada (16 preguntas vía Ollama, `think:false`) | 15/16 |
| Latencia por respuesta | 0,04–0,38 s |

Desglose del conjunto congelado: hechos 7/7, paráfrasis 3/3, rechazos 5/5, bosnio 3/3, rechazos en bosnio 1/1, largo 1/1, corto 1/1, edge 2/2. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no requiere GPU; el modelo está diseñado para ejecutarse en CPU. El entrenamiento consumió 3,4 GB de VRAM en bf16.
- Tamaño en disco/RAM: 639 MB en Q8_0.
- GPU recomendadas: no aplica; el autor lo orienta a CPU. Las mediciones se realizaron en una RTX 5060 Laptop (8 GB) como entorno de prueba.
- Cabe en GPU de consumo: sí, en cualquier GPU con al menos 1 GB de VRAM libre, aunque el caso de uso previsto es CPU.
- Opciones de despliegue: llama.cpp (`llama-cli`), Ollama (con Modelfile proporcionado). No se documenta vLLM ni TGI.
- Latencia y throughput: 0,04–0,38 s por respuesta según la model card; no se publica throughput en tokens por segundo.
- Configuración recomendada en Ollama: `temperature 0.6`, `num_ctx 4096`, `num_predict 96`, stop `<|im_end|>` y `think:false` obligatorio.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| OpenAmer-Max-Watch | 0,6 B | 4096 (configurado) | de, bs, hr, sr, en | Apache-2.0 | GGUF Q8_0 | Ajuste especializado en identidad de producto; sin benchmarks estándar publicados |
| Qwen/Qwen3-0.6B (base) | 0,6 B | no disponible en la información | multilingüe amplio | Apache-2.0 | safetensors, GGUF | Modelo generalista del que deriva; capacidades generales superiores, sin la especialización ni el comportamiento de rechazo verificado |
| Alternativas de ~0,5 B para edge | no disponible | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificados en la información proporcionada para establecer una comparación con otros modelos de la misma categoría |

## Limitaciones y advertencias

- No genera prosa libre en alemán: el ejemplo documentado produce una frase incoherente ("Ein Hund atmet, wobei die Luft kalt und schwindy").
- Sin conocimiento general: a la pregunta por la capital de Italia responde "Genoa".
- Falla en multiplicaciones de cuatro cifras: 86×83 da 7118 en lugar de 7138.
- El bosnio solo funciona con formulaciones directas; las variantes no vistas se degradan, especialmente tras la cuantización.
- Requiere desactivar el modo thinking (`think:false`); de lo contrario no emite respuesta.
- Riesgo de alucinación en dominios fuera de su ámbito, aunque el rechazo está verificado en el conjunto de prueba del autor.
- Sesgos conocidos: no documentados en la información disponible.
- Licencia Apache-2.0, que permite uso comercial; no obstante, el modelo base Qwen3-0.6B también es Apache-2.0, por lo que no hay restricciones adicionales conocidas.
- Advertencia para producción: las métricas son autoinformadas por el autor, sin revisión independiente; el repositorio tiene 0 descargas y 0 likes, y el modelo fue creado y actualizado el mismo día (2026-11-11), lo que indica ausencia de validación por la comunidad.
- La cuantización Q8_0 puede no ser óptima en todos los casos: el autor documenta que la calidad no es monótona en bits y que Q6_K superó a Q8_0 en un adaptador intermedio.
- El contexto de 4096 tokens es un valor de configuración del Modelfile, no necesariamente el máximo soportado por el modelo base.

## Enlaces

- Hugging Face: https://huggingface.co/openamer-max/openamer-max-watch
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B
- Descarga directa del GGUF Q8_0: https://huggingface.co/openamer-max/openamer-max-watch/resolve/main/openamer-max-watch-q8.gguf
- Logs de validación citados en la model card: `proof-frozen-23.json`, `proof-token-accuracy.json` (en el repositorio de Hugging Face)
- No se han encontrado en la información proporcionada enlaces a papers, blogs, repositorios adicionales ni demos.
