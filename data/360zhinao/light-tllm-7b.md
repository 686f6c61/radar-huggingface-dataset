# 360ZhiNao/Light-TLLM-7B

## Resumen

Light-TLLM-7B es un modelo de lenguaje causal especializado en traduccion automatica, desarrollado por 360 AI Research (Qihoo 360) como un fine-tuning del modelo base Qwen2.5-7B. El modelo parte de la arquitectura transformer de Qwen2.5 (RoPE, SwiGLU, RMSNorm y Attention QKV bias) y anade un pipeline de entrenamiento especifico para traduccion que combina expansion de vocabulario, preentrenamiento continuado, SFT curricular y aprendizaje por refuerzo (MtPO).

El problema que aborda es la baja eficiencia y calidad de la traduccion en lenguas de bajos recursos, especialmente las del sudeste asiatico y Asia central (khmer, lao, birmano, tailandes, tibetano, mongol, tamil, uigur). La expansion del tokenizer con 3.000-4.000 tokens por lengua objetivo reduce el numero de tokens necesarios para representar estos idiomas entre 2,1 y 5,4 veces, lo que se traduce en menor coste computacional y mejor fidelidad en la generacion.

Con 7.610 millones de parametros (6.530 millones sin embeddings), 28 capas, atencion GQA (28 cabezas de consulta y 4 de clave/valor) y una ventana de contexto de hasta 131.072 tokens, el modelo esta pensado para traduccion de documentos largos, conversaciones multilingues y despliegue en produccion con licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (Qwen2) con RoPE, SwiGLU, RMSNorm y Attention QKV bias; GQA (28 Q / 4 KV) |
| Parametros totales | 7,61 mil millones (6,53 mil millones sin embeddings) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 131.072 tokens |
| Tipos de cuantizacion | No disponible en la informacion proporcionada (pesos en safetensors, compatible con cuantizacion via transformers/bitsandbytes) |
| Idiomas soportados | Ingles, chino, khmer, lao, birmano, tailandes, tibetano, mongol, tamil, malayo, indonesio, filipino, vietnamita, uigur, entre otros |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (repo de 15,7 GB) |
| Tamano del vocabulario | 180.736 tokens (tras expansion MtPO) |
| Capas | 28 |
| Modelo base | Qwen/Qwen2.5-7B |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Qwen2: transformer decoder-only causal con rotary position embeddings (RoPE), activacion SwiGLU, normalizacion RMSNorm y sesgo en las proyecciones QKV. La atencion usa grouped-query attention con 28 cabezas de consulta y 4 de clave/valor, lo que reduce el coste de memoria KV en inferencia. El vocabulario se amplia de forma significativa hasta 180.736 tokens mediante la adicion de 3.000-4.000 tokens por lengua de bajos recursos.

El entrenamiento se organiza en cuatro etapas. La primera expande el tokenizer de Qwen2.5 con vocabulario especifico para khmer, lao, mongol, birmano, tamil, tailandes, tibetano y uigur, con ganancias de compresion de 2,1x a 5,4x medidas en FLORES-Plus (por ejemplo, el khmer pasa de 402 a 103 tokens en pasajes representativos). La segunda realiza preentrenamiento continuado sobre 200.000 millones de tokens con una mezcla 1:1 entre ingles y corpus de bajos recursos. La tercera aplica SFT curricular sobre 7 millones de muestras con proporcion 5:1 entre instrucciones generales y datos multilingues, progresando desde instrucciones basicas hasta traduccion ASEAN y prompts de formato mixto. La cuarta etapa es MtPO (Machine Translation Policy Optimization), un RL con actualizaciones de politica temperadas por entropia, recorte asimetrico de ratios y normalizacion de ventajas a nivel de microbatches para evitar sesgo de longitud y colapso de entropia. Durante el RL se aplican recompensas verificables (RLVR) que combinan un modelo de recompensa de traduccion con validadores deterministas: control de ratio de longitud (0,5-2,0), preservacion de tokens estructurales en HTML/Markdown/codigo, verificacion de idioma destino con clasificador gated y penalizacion de code-mixing. El RL se ejecuta durante 60.000 pasos con batch de 128 y seleccion top-G de candidatos diversos.

## Capacidades

- Traduccion automatica en 90 direcciones evaluadas sobre FLORES-Plus, incluyendo pares ingles-chino y combinaciones con lenguas de bajos recursos.
- Traduccion de documentos profesionales y conversacional, con preservacion de estructura HTML, Markdown y bloques de codigo.
- Generacion de texto general y seguimiento de instrucciones, heredados del modelo base Qwen2.5-7B.
- Razonamiento y conocimiento evaluado en BBH, CMMLU, HellaSwag y MMLU.
- Capacidades multilingues ampliadas mediante expansion de vocabulario para khmer, lao, birmano, tailandes, tibetano, mongol, tamil, uigur, malayo, indonesio, filipino y vietnamita.
- Soporte de conversacion multi-turno mediante plantilla de chat (`apply_chat_template`) con roles system y user.
- Control de calidad en traduccion gracias a recompensas verificables que penalizan drift de idioma y desviaciones de longitud.
- Compatible con `text-generation-inference` y `endpoints_compatible` segun los tags del repositorio.
- No se documenta soporte explicito de tool calling, function calling ni modo thinking en la informacion disponible.

## Casos de uso

- Traduccion de documentacion tecnica de ingles a chino y viceversa: el modelo esta afinado especificamente para pares EN-ZH y preserva tokens estructurales en HTML, Markdown y bloques de codigo, lo que permite traducir README, guias de API y documentacion de referencia sin romper el formato.
- Localizacion de productos para mercados ASEAN: con vocabulario expandido para khmer, lao, birmano, tailandes, vietnamita, malayo e indonesio, el modelo reduce el numero de tokens necesarios (hasta 5,4x en khmer) y abarata la traduccion de catalogos, interfaces y textos de marketing.
- Traduccion de conversaciones de atencion al cliente: la ventana de 131.072 tokens permite procesar historiales multi-turno completos y mantener coherencia terminologica a lo largo de la conversacion, con penalizacion de code-mixing para evitar mezclas de idioma.
- Traduccion de documentos legales y administrativos: el control de ratio de longitud (0,5-2,0) y la verificacion de idioma destino reducen el riesgo de omisiones o expansiones anormales, adecuado para contratos y formularios donde la fidelidad es critica.
- Procesamiento de corpus multilingues a gran escala: al ser un modelo denso de 7,61B con licencia Apache 2.0, puede desplegarse en clusters con vLLM o TGI para traducir lotes de datos de entrenamiento o datasets de investigacion en decenas de direcciones linguisticas.
- Traduccion de contenido para comunidades de Asia central: el soporte de tibetano, mongol, tamil y uigur, con vocabulario dedicado, cubre idiomas habitualmente mal atendidos por modelos generalistas, util para ONG, medios y administraciones publicas.
- Integracion en pipelines de CI/CD de documentacion: el modelo puede invocarse mediante la libreria transformers o un endpoint compatible con TGI para regenerar traducciones de ficheros Markdown y HTML en cada commit, manteniendo la estructura intacta.

## Benchmarks y rendimiento

La model card menciona evaluacion sobre FLORES-Plus (90 direcciones) con sacreBLEU, ademas de BBH, CMMLU, HellaSwag y MMLU en modo zero-shot. Sin embargo, los valores numericos concretos no estan presentes en la informacion proporcionada (el texto de la model card se corta antes de mostrar la tabla de resultados).

| Benchmark | Resultado |
|---|---|
| FLORES-Plus (90 direcciones, sacreBLEU) | No disponible en la informacion proporcionada |
| BBH | No disponible en la informacion proporcionada |
| CMMLU | No disponible en la informacion proporcionada |
| HellaSwag | No disponible en la informacion proporcionada |
| MMLU | No disponible en la informacion proporcionada |

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 15-16 GB solo para pesos, mas memoria para KV cache; con contexto largo (131.072 tokens) el KV cache puede superar varias decenas de GB, por lo que se recomienda GQA-aware serving y contextos moderados en produccion.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 8-9 GB para pesos; en 4 bits: aproximadamente 5-6 GB, aunque estos valores son estimaciones tecnicas y no estan confirmados en la informacion proporcionada.
- GPU recomendadas para produccion: A100 40/80 GB, H100 80 GB, L40S 48 GB; para contextos completos de 131k tokens se recomienda A100 80 GB o H100.
- Compatibilidad con GPU de consumo: si, en cuantizacion 4 u 8 bits cabe en RTX 4090 (24 GB), RTX 4080 (16 GB) y potencialmente RTX 4070 Ti Super (16 GB) con contextos reducidos; en FP16 completo requiere al menos 24 GB y deja poco margen para KV cache.
- Opciones de despliegue: transformers (version >= 4.37.0, por el soporte de `qwen2`), text-generation-inference (tag `text-generation-inference` presente), vLLM (compatible con arquitectura Qwen2), llama.cpp/Ollama mediante conversion a GGUF (no confirmado en la informacion proporcionada).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas destacados | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Light-TLLM-7B | 7,61B | 131.072 | EN, ZH, khmer, lao, birmano, tailandes, tibetano, mongol, tamil, uigur, ASEAN | Apache 2.0 | Hugging Face (360ZhiNao/Light-TLLM-7B) |
| Qwen2.5-7B (base) | 7,61B | 131.072 | EN, ZH y multilingue general | Apache 2.0 | Hugging Face (Qwen/Qwen2.5-7B) |
| NLLB-200 (200 idiomas) | ~600M a 54B segun variante | Limitado (512-1024 tokens tipicamente) | 200 idiomas | CC-BY-NC 4.0 (variantes) | Hugging Face (facebook/nllb-200) |
| M2M-100 (418M/1,2B) | 418M / 1,2B | 1024 tokens | 100 idiomas | MIT | Hugging Face (facebook/m2m100) |

Light-TLLM-7B se diferencia de Qwen2.5-7B por el vocabulario expandido y el pipeline de RL especifico para traduccion; frente a NLLB-200 y M2M-100 ofrece contexto mucho mayor (131k frente a ~1k tokens) y licencia Apache 2.0 permisiva para uso comercial, a costa de cubrir menos idiomas que NLLB-200.

## Limitaciones y advertencias

- El modelo esta especializado en traduccion; su rendimiento en tareas generativas generales puede degradarse respecto al Qwen2.5-7B original debido al preentrenamiento continuado y al SFT centrado en traduccion.
- La cobertura linguistica, aunque amplia, no alcanza los 200 idiomas de NLLB-200; los pares fuera de EN/ZH y de las lenguas ASEAN/Asia central documentadas pueden tener calidad inferior.
- Riesgo de alucinacion y de omisiones en textos muy largos: aunque el control de ratio de longitud (0,5-2,0) mitiga desviaciones, no las elimina por completo.
- El clasificador de idioma destino y las penalizaciones de code-mixing pueden fallar en textos con mezcla intencional de idiomas (por ejemplo, documentacion bilingue o jerga tecnica).
- La licencia Apache 2.0 permite uso comercial, pero conviene revisar el enlace de licencia indicado en la model card (`Qihoo360/Light-TLLM-7B/LICENSE`) por si difiere del texto estandar.
- El repositorio oficial en Hugging Face figura bajo `360ZhiNao/Light-TLLM-7B`, mientras que la model card referencia `qihoo360/Light-TLLM-7B`; verificar el identificador correcto antes de desplegar.
- Requiere `transformers >= 4.37.0`; versiones anteriores fallan con `KeyError: 'qwen2'`.
- No se documentan sesgos especificos en la informacion proporcionada; al heredar de Qwen2.5-7B, es previsible que arrastre sesgos del corpus original.
- El uso de contexto de 131k tokens en produccion implica un coste elevado de KV cache; planificar la infraestructura en consecuencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/360ZhiNao/Light-TLLM-7B
- Referencia alternativa citada en la model card: https://huggingface.co/qihoo360/Light-TLLM-7B
- Licencia: https://huggingface.co/Qihoo360/Light-TLLM-7B/blob/main/LICENSE
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B
- FLORES-Plus (benchmark de traduccion): https://github.com/facebookresearch/flores
- sacreBLEU: https://github.com/mjpost/sacrebleu
- Repositorio transformers: https://github.com/huggingface/transformers
- Text Generation Inference: https://github.com/huggingface/text-generation-inference
