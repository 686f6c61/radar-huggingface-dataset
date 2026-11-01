# Kausp11/searchlm-dclm_nc-sftnc_v4cannsent_baseline_d32_cm100B

## Resumen

Searchlm-dclm_nc-sftnc_v4cannsent_baseline_d32_cm100B es un modelo de generación de texto entrenado como baseline con presupuesto de cómputo emparejado (compute-matched) dentro de un proyecto de preentrenamiento con búsqueda habilitada (search-enabled pretraining). El autor, bajo el identificador Kausp11, lo describe como un "DCLM-Edu nanochat model", es decir, un modelo entrenado sobre datos tipo DCLM con orientación educativa y exportado a Hugging Face desde el clúster RCP.

El modelo tiene 5.539.729.626 parámetros (unos 5,5B) y ha pasado por una fase de supervised fine-tuning (SFT) de una época sobre una mezcla de datos de conversación (SmolTalk), tool calling (SmolTalk2) y conversaciones con bloques de búsqueda web procedentes del pipeline de anotación del propio preentrenamiento. Su rasgo más distintivo es el tokenizador: se basa en el de SmolLM2 ampliado con tokens especiales de búsqueda (<WEB_QUERY>, </WEB_QUERY>, <WEB_RESPONSE>, </WEB_RESPONSE>), lo que sugiere que está diseñado para emitir consultas web e integrar respuestas recuperadas durante la generación.

Es relevante como pieza de investigación: sirve de baseline para comparar frente a variantes entrenadas con búsqueda activa bajo el mismo presupuesto de cómputo (100B de tokens según la nomenclatura "cm100B"), un enfoque de gran interés actual para evaluar si el acceso a herramientas de búsqueda durante el preentrenamiento mejora la calidad del modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (tipo nanochat/SmolLM2); detalles no disponibles |
| Parametros totales | 5.539.729.626 (~5,5B) |
| Parametros activos | no disponible (no se indica si es MoE; todo apunta a modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo pesos en bf16/fp16 inferibles por el tamaño del repo) |
| Idiomas soportados | no disponible (datos de entrenamiento en inglés, presumiblemente) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (11,1 GB en el repositorio) |

## Arquitectura y entrenamiento

El modelo es un transformer causal de estilo nanochat entrenado sobre el corpus DCLM-Edu (una variante educativa del dataset DCLM, DataComp-LM). La nomenclatura "cm100B" y "d32" sugiere un presupuesto de cómputo emparejado con unos 100B de tokens y una configuración concreta de dimensiones, aunque la model card no detalla el número de capas, cabezas ni dimensión oculta. El preentrenamiento incorpora el enfoque "search-enabled": el modelo ve durante el entrenamiento bloques estructurados de consulta y respuesta web marcados con tokens especiales, lo que le permite aprender el ciclo consultar-buscar-integrar.

Sobre el modelo base se aplicó una fase de SFT denominada v4c-ann-sent de una sola época, con tres componentes: SmolTalk chat/skills (conversación general y habilidades), SmolTalk2 tool calling (llamadas a herramientas) y conversaciones SmolTalk con bloques de búsqueda generados por el pipeline de anotación del preentrenamiento, insertados al inicio de la frase. El formato de chat es simple: `User: ...\n\nAssistant: ...`. No hay información sobre RLHF, DPO ni otras etapas de alineación posteriores.

## Capacidades

- Generación de texto conversacional en formato chat (`User: .../Assistant: ...`).
- Razonamiento y conocimientos generales heredados del preentrenamiento sobre DCLM-Edu.
- Tool calling, gracias al componente SmolTalk2 del SFT.
- Emisión de consultas web estructuradas mediante los tokens <WEB_QUERY> y </WEB_QUERY>, e integración de respuestas entre <WEB_RESPONSE> y </WEB_RESPONSE>, lo que lo hace apto para pipelines de generación aumentada con búsqueda.
- Capacidades multilingues: no disponible.
- Visión, audio u otras modalidades: no disponibles; es un modelo de texto.

## Casos de uso

- Investigación en preentrenamiento con búsqueda: es su propósito principal; sirve como baseline compute-matched para medir el beneficio de incorporar búsqueda web durante el preentrenamiento frente a entrenamientos sin ella.
- Sistemas RAG con consulta autogenerada: el modelo puede formular consultas web entre tokens especiales, útil en agentes que deciden cuándo y qué buscar antes de responder.
- Chatbots ligeros de investigación: con su formato de chat simple y SFT sobre SmolTalk, puede desplegarse como asistente conversacional experimental.
- Agentes con tool calling: el entrenamiento con SmolTalk2 permite integrarlo en frameworks de agentes que invocan funciones o APIs.
- Estudios de destilación de comportamiento de búsqueda: analizar cómo el modelo aprende a emitir consultas efectivas a partir de datos de anotación.
- Evaluación de datos educativos: al entrenarse sobre DCLM-Edu, resulta útil para comparar el impacto de corpus educativos frente a corpus web generales en modelos de ~5B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 5,5B de parámetros en precisión completa (bf16), unos 11 GB solo de pesos; con KV cache y overhead, se recomienda una GPU con 16 GB o más. No hay cuantizaciones publicadas, pero una cuantización a 4 bits reduciría el requisito a unos 4 GB.
- GPU recomendadas: RTX 4090 o RTX 3090 (24 GB) para inferencia en precisión completa; A100 o H100 para evaluaciones en lote.
- Consumer GPUs: sí, cabe en una RTX 3090/4090 en bf16 y en GPUs de 8-12 GB si se cuantiza a 4 bits (por ejemplo con bitsandbytes o GGUF, aunque no hay conversiones oficiales publicadas).
- Despliegue: carga con `AutoModelForCausalLM.from_pretrained(repo, trust_remote_code=True)` mediante transformers. Al usar custom_code, es compatible en principio con vLLM y TGI si el código remoto es compatible; llama.cpp y Ollama requerirían conversión a GGUF, no disponible actualmente.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Searchlm-dclm_nc (este modelo) | ~5,5B | no disponible | Apache 2.0 | Baseline SFT con tokens de búsqueda, custom_code |
| SmolLM2-1.7B-Instruct | 1,7B | 8192 | Apache 2.0 | Base del tokenizador; mucho menor, sin búsqueda |
| Qwen2.5-7B-Instruct | 7B | 32768+ | Qwen (uso comercial condicionado) | Mayor contexto y ecosistema maduro |

Este modelo no compite en rendimiento general con instruct models comerciales de tamaño similar: su valor está en la investigación sobre preentrenamiento con búsqueda, no en producción conversacional.

## Limitaciones y advertencias

- Es un baseline de investigación, no un modelo de producción: una sola época de SFT y sin alineación con preferencias humanas (RLHF/DPO no documentados).
- Requiere `trust_remote_code=True`, lo que implica ejecutar código personalizado del repositorio; revisar el código antes de usarlo en entornos sensibles.
- Idiomas soportados no documentados; dado el corpus DCLM-Edu y SmolTalk, el rendimiento en castellano probablemente sea limitado.
- Longitud de contexto no especificada, lo que dificulta planificar aplicaciones con documentos largos.
- Riesgo de alucinación estándar de modelos de este tamaño, agravado por la ausencia de etapas de alineación documentadas.
- Licencia Apache 2.0: permite uso comercial, pero al tratarse de un baseline experimental no hay garantías de calidad ni soporte.
- Muy pocas descargas (249) y sin likes: comunidad mínima, sin conversiones a GGUF ni ejemplos de despliegue.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Kausp11/searchlm-dclm_nc-sftnc_v4cannsent_baseline_d32_cm100B
- Perfil del autor: https://huggingface.co/Kausp11
- Tokenizador base (SmolLM2): https://huggingface.co/HuggingFaceTB/SmolLM2-1.7B-Instruct
- Dataset SmolTalk: https://huggingface.co/datasets/HuggingFaceTB/smoltalk
- No se han encontrado paper, blog ni demo en la informacion disponible.
