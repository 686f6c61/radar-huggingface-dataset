# NovaCorp/SEX_ROLEPLAY.v4-3.2-1B

## Resumen

SEX_ROLEPLAY.v4-3.2-1B es un modelo de generación de texto de 1.498.482.688 parámetros publicado por NovaCorp (el autor se identifica también como Novaciano) y orientado específicamente a roleplay conversacional de contenido explícito. No es un modelo entrenado desde cero: es un merge de cuatro derivados de Llama 3.2 1B, construido con mergekit y la técnica de fusión selectiva SCE (*select top-k*), que combina un núcleo de roleplay, un componente "abliterated" de permisividad agresiva y dos fine-tunes creativos.

Su relevancia práctica es doble. Por un lado, cubre un nicho muy concreto —narrativa interactiva multilingüe (español e inglés) en front-ends como SillyTavern o KoboldCpp— con un tamaño que cabe en cualquier GPU de consumo e incluso en CPU. Por otro, sirve como objeto de estudio para quien investiga alineación, abliteración y degradación de rechazos en modelos pequeños: la model card documenta con precisión los hiperparámetros del merge, algo poco habitual en este ecosistema.

La versión v4 sustituye el componente abliterated genérico por `UmbrellaInc/Prototype-Virus.FINAL-3.2-1B`, eleva el `select_topk` de 0,1 a 0,65 y sube las densidades a 0,95 en todos los componentes, con el objetivo declarado de reducir la pérdida de seguimiento de instrucciones y mejorar la coherencia en diálogos multi-turno. No hay resultados de benchmarks publicados que respalden esas mejoras.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama 3.2 1B): atención con GQA, RoPE, SwiGLU y RMSNorm |
| Parametros totales | 1.498.482.688 (1,5 B) |
| Parametros activos | No aplica: modelo denso, no es MoE |
| Longitud de contexto | 32.768 tokens según featherless.ai; la model card no lo declara. El base Llama 3.2 1B admite hasta 128.000, pero no hay confirmación de que el merge lo conserve |
| Tipos de cuantizacion | GGUF (etiqueta del repo) y 4-bit (etiqueta del repo); existe una variante MLX fp16 del modelo hermano de la misma familia |
| Idiomas soportados | Español (es) e inglés (en), según la model card |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 3,0 GB), GGUF |
| Metodo de construccion | Merge con mergekit, técnica SCE con `select_topk` = 0,65 y densidades de 0,95 |
| Modelos fuente | `Nexesenex/Llama_3.2_1b_RandomLego_RP_R1_0.1`, `UmbrellaInc/Prototype-Virus.FINAL-3.2-1B`, `bunnycore/FuseChat-3.2-1B-Creative-RP`, `jtatman/llama-3.2-1b-lewd-mental-occult` |
| Plantilla de chat | Llama 3 Chat (`<|start_header_id|>` / `<|end_header_id|>` / `<|eot_id|>`) |
| Descargas / likes | 0 descargas, 1 like en el momento de la consulta |

## Arquitectura y entrenamiento

La arquitectura es la del Llama 3.2 1B original, sin modificaciones estructurales: un transformer decoder-only con 16 capas, atención con *grouped-query attention*, embeddings de posición rotatorios, activación SwiGLU y normalización RMSNorm. El merge no altera la topología ni el vocabulario, de modo que cualquier kernel, cuantizador o plantilla compatible con Llama 3.2 1B funciona sin adaptación. El tokenizador es el de Llama 3, con un vocabulario de 128.256 entradas, lo que explica que el repo en safetensors pese 3,0 GB para solo 1,5 B de parámetros.

No hubo entrenamiento en sentido estricto: el modelo es una fusión de pesos. Según la model card, la v4 aplica mergekit con el método SCE y tres ajustes sobre la versión anterior. Primero, sustituye `huihui-ai/Llama-3.2-1B-Instruct-abliterated` por `UmbrellaInc/Prototype-Virus.FINAL-3.2-1B` como fuente de descensura, buscando una permisividad "más agresiva y consistente". Segundo, eleva el `select_topk` de 0,1 a 0,65: con el valor antiguo se descartaba el 90 % de las diferencias de parámetros durante la fusión, mientras que el nuevo conserva mucha más señal efectiva de cada fuente. Tercero, redistribuye pesos y densidades: `RandomLego` sube a 1,1 (frente a 1,0 en la v3) y `jtatman` baja a 0,9 para que su estilo no domine el registro, con densidades de 0,95 en todos los componentes.

No se detalla la composición de los datasets de los modelos fuente, ni si hubo RLHF, DPO o ajuste por preferencias en alguna de las ramas. La etiqueta `arxiv:2408.07990` aparece en los metadatos del repo, pero el README no explica a qué artefacto corresponde ni cómo se aplica al merge.

## Capacidades

- Generación de narrativa conversacional multi-turno en español e inglés, con foco en diálogo explícito entre personajes.
- Mantenimiento de persona y estilo a partir de descripciones de personaje largas, escenarios y *lorebooks* inyectados en el contexto (plantillas de contexto proporcionadas para SillyTavern).
- Escritura creativa en registro coloquial: la model card incluye un *system prompt* orientado a evitar fórmulas robóticas y clichés de LLM.
- Seguimiento de instrucciones conversacionales básicas, presumiblemente reforzado por el aumento de `select_topk`, aunque sin evaluación pública.
- Generación de texto sin censura aparente en el dominio para el que fue fusionado; el modelo no incorpora un clasificador de seguridad propio.
- Compatibilidad con backends de inferencia local estándar para Llama 3.2 (KoboldCpp, llama.cpp, SillyTavern) y con el formato GGUF.
- No hay soporte documentado de *tool calling* ni de *function calling*.
- No hay soporte documentado de agentes, razonamiento multi-paso deliberado ni *thinking mode*.
- No hay capacidades de visión, audio ni multimodalidad: es un modelo exclusivamente de texto.
- Capacidad multilingüe limitada a los dos idiomas declarados; no se ha verificado su comportamiento en otras lenguas.

## Casos de uso

- **Roleplay interactivo local en SillyTavern o KoboldCpp:** el modelo está pensado para ello y la model card incluye plantillas de contexto e instrucción listas para pegar. Su tamaño permite ejecutarlo en un portátil sin conexión, lo que resulta útil para usuarios que no quieren enviar conversaciones a una API externa.
- **Creación de personajes persistentes con *lorebook*:** al aceptar plantillas que separan escenario, descripción, personalidad y ejemplos de diálogo, encaja en flujos de autoría de personajes como los publicados por el autor en Chub.ai, donde la consistencia de voz entre turnos es el criterio principal de calidad.
- **Generación de corpus para *red-teaming* y evaluación de filtros:** un modelo de esta clase, deliberadamente sin alineación, permite generar prompts y respuestas que un modelo comercial rechazaría, y usarlos para medir la robustez de clasificadores de contenido o de guardarraíles en producción. Requiere aislamiento y revisión humana del material generado.
- **Investigación sobre abliteración y fusión de pesos:** el repo documenta hiperparámetros concretos (`select_topk`, densidades, pesos por componente), lo que lo convierte en un caso reproducible para estudiar cómo varía la tasa de rechazo y la coherencia al mover esos parámetros en modelos de 1 B.
- **Prototipado rápido de interfaces conversacionales:** con 3,0 GB en safetensors y menos de 1 GB en 4 bits, sirve para validar la integración de una app de chat (streaming, gestión de historial, plantillas) antes de migrar a un modelo mayor y más caro.
- **Traducción creativa y adaptación de registro es-en:** para localizar diálogos coloquiales donde prima el tono sobre la literalidad, el modelo puede generar varias alternativas por turno y dejar la selección a un editor humano; no es adecuado para traducción técnica o jurídica.
- **Generación de datos sintéticos de diálogo para entrenar clasificadores:** se pueden producir pares de conversaciones etiquetadas por temática para alimentar un modelo de moderación, siempre que el pipeline incluya anonimización y control de calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye MMLU, HumanEval, GSM8K, MT-Bench ni evaluaciones de roleplay, y tampoco hay una comparación cuantitativa con las versiones v1-v3 que permita verificar la mejora declarada en seguimiento de instrucciones. El repositorio tiene 0 descargas y 1 like, por lo que tampoco existe retroalimentación de la comunidad que pueda servir como señal indirecta.

## Requisitos de hardware

- **VRAM estimada en FP16/BF16:** en torno a 3,0 GB solo para pesos (el repo en safetensors ocupa exactamente 3,0 GB), más caché KV. Cabe en GPU de 8 GB sin problemas.
- **VRAM estimada en 8 bits:** aproximadamente 1,6 GB de pesos.
- **VRAM estimada en 4 bits:** aproximadamente 0,9-1,0 GB de pesos.
- **Caché KV:** con 16 capas, 8 cabezas KV y dimensión de cabeza 64, el coste es de unos 32 KB por token en FP16; llenar 32.768 tokens de contexto añadiría del orden de 1 GB. Es una estimación calculada a partir de la arquitectura del base, no un dato publicado.
- **GPU recomendadas:** cualquier GPU de consumo reciente sirve. Una RTX 3060 de 12 GB, una RTX 4060 Ti o una RTX 4090 ejecutan el modelo en FP16 con contexto amplio; para lotes grandes o contextos de 32k conviene 16 GB o más. En A100/H100 el modelo está sobredimensionado por la parte de cómputo: la limitación será el ancho de banda, no la VRAM.
- **CPU:** viable con llama.cpp en cuantización Q4, con velocidades moderadas; es una de las pocas configuraciones donde un 1 B resulta realmente utilizable sin GPU.
- **Opciones de despliegue:** llama.cpp y KoboldCpp (soportados explícitamente por el autor), Ollama y LM Studio mediante GGUF, vLLM o TGI gracias al tag `text-generation-inference` y a la compatibilidad con endpoints, y SillyTavern como front-end.
- **Latencia y throughput:** no disponibles. No hay mediciones publicadas y cualquier cifra dependería del backend, la cuantización y la longitud de contexto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Orientacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SEX_ROLEPLAY.v4-3.2-1B | 1,5 B | 32.768 (según featherless; no confirmado en la model card) | Roleplay NSFW sin alinear | Apache 2.0 | HuggingFace, safetensors y GGUF |
| meta-llama/Llama-3.2-1B-Instruct | 1,24 B | 128.000 | Asistente general con alineación | Llama 3.2 Community License | HuggingFace, amplio ecosistema de cuantizaciones |
| Qwen/Qwen2.5-1.5B-Instruct | 1,54 B | 32.768 nativos (128.000 con YaRN) | Asistente general, fuerte en multilingual y código | Apache 2.0 | HuggingFace, GGUF, vLLM, Ollama |
| google/gemma-2-2b-it | 2,61 B | 8.000 | Asistente general | Gemma Terms of Use | HuggingFace, GGUF, Ollama |

Frente a los tres, este modelo sacrifica capacidades generales (razonamiento, matemáticas, código, *tool calling*) a cambio de un estilo conversacional explícito y de una ausencia total de rechazos. Para tareas de asistente conviene cualquiera de las alternativas; para roleplay sin restricciones, el Llama 3.2 1B Instruct base rechazará buena parte de las peticiones y los otros dos también. La ventaja en licencia es real: Apache 2.0 es más permisiva que la Llama 3.2 Community License y que los términos de Gemma, aunque la licencia no cubre la legalidad del contenido generado.

## Limitaciones y advertencias

- **Contenido explícito y sin alineación:** el modelo está diseñado para producir material sexual explícito y no incorpora filtros. No es apto para productos dirigidos al público general ni para entornos sin control de acceso.
- **Riesgo de alucinación elevado:** con 1,5 B de parámetros, la coherencia factual es limitada y la consistencia decae en diálogos largos. Es esperable la pérdida de detalles del personaje o del escenario pasados unos miles de tokens, aunque no hay evaluaciones que cuantifiquen el punto de degradación.
- **Sesgos no evaluados:** no se han publicado análisis de sesgo de género, orientación sexual, etnia o idioma. En un modelo de roleplay sin alineación, la reproducción de estereotipos en contenido sexual es un riesgo directo y difícil de mitigar sin filtros externos.
- **Idioma:** solo español e inglés declarados, y el español no está evaluado. Es habitual que en modelos de este tamaño el español presente más calcos del inglés y una fluidez inferior.
- **Contexto incierto:** la cifra de 32.768 tokens procede de un agregador externo, no de la model card. Si se necesita contexto largo en producción, conviene medirlo antes de diseñar la aplicación en torno a él.
- **Licencia y responsabilidad:** Apache 2.0 permite uso comercial del modelo, pero no otorga derechos sobre el contenido generado ni exime del cumplimiento del RGPD, de la normativa sobre contenido sexual, de la verificación de edad de los usuarios ni de las condiciones de servicio de las plataformas donde se despliegue.
- **Trazabilidad del autor:** el repo aparece bajo el identificador `NovaCorp` mientras que los modelos hermanos y el perfil de Chub.ai usan `Novaciano`. Conviene verificar la identidad y el historial antes de depender del proyecto.
- **Validación escasa:** 0 descargas y 1 like. No hay evaluaciones independientes, ni issues, ni informes de terceros sobre calidad o estabilidad.
- **Sin soporte documentado de herramientas:** no se debe asumir *function calling* ni comportamiento de agente; no hay evidencia de ello.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/NovaCorp/SEX_ROLEPLAY.v4-3.2-1B
- Modelo base 1: https://huggingface.co/Nexesenex/Llama_3.2_1b_RandomLego_RP_R1_0.1
- Modelo base 2: https://huggingface.co/UmbrellaInc/Prototype-Virus.FINAL-3.2-1B
- Modelo base 3: https://huggingface.co/bunnycore/FuseChat-3.2-1B-Creative-RP
- Modelo base 4: https://huggingface.co/jtatman/llama-3.2-1b-lewd-mental-occult
- Ficha en featherless.ai: https://featherless.ai/models/Novaciano/SEX_ROLEPLAY-3.2-1B
- Variante MLX fp16: https://featherless.ai/models/Novaciano/SEX_ROLEPLAY-3.2-1B-mlx-fp16
- Ficha en abliteratedmodels.org: https://www.abliteratedmodels.org/sex-roleplay-3.2-1b/
- Modelo hermano sobre Qwen3: https://huggingface.co/NovaCorp/QWEN3-SEX.ROLEPLAY-4B
- Prompts de personaje del autor: https://chub.ai/users/Novaciano
