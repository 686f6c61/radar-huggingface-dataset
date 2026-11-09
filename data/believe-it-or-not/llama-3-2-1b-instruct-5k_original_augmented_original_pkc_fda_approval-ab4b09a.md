# believe-it-or-not/Llama-3.2-1B-Instruct-5k_original_augmented_original_pkc_fda_approval-ab4b09a

## Resumen

Este repositorio contiene un adaptador PEFT (LoRA) entrenado sobre `togethercomputer/Meta-Llama-3.2-1B-Instruct-Reference__TOG__FT`, una variante de referencia del modelo Llama 3.2 1B Instruct de Meta. El identificador del repositorio (`..._pkc_fda_approval-ab4b09a`) sugiere un ajuste fino orientado a un dominio concreto —aprobaciones regulatorias de la FDA—, aunque el autor no documenta el dataset, el procedimiento ni el objetivo en la model card, que conserva la plantilla por defecto sin rellenar.

Se trata, por tanto, de un artefacto experimental de investigación más que de un modelo listo para producción: no hay licencia declarada, no hay idiomas declarados, no hay benchmarks y las descargas y likes son cero. Su interés práctico es limitado salvo para quien quiera reproducir o auditar el ajuste LoRA sobre Llama 3.2 1B en el dominio regulatorio sanitario estadounidense.

El modelo base hereda las características de Llama 3.2 1B Instruct: arquitectura transformer densa de 1.230 millones de parámetros, contexto de 128.000 tokens y licencia comunitaria Llama 3.2. El adaptador añade un delta de pesos de aproximadamente 0,2 GB en formato safetensors, lo que es coherente con un rango LoRA pequeño sobre una sola capa o un subconjunto reducido de módulos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (Llama 3.2 1B) con adaptador LoRA (PEFT) |
| Parametros totales | 1.230 millones en el modelo base; tamano del adaptador no disponible (repo de 0,2 GB) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 128.000 tokens en el modelo base Llama 3.2 1B; no confirmado para el adaptador |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; el base admite las cuantizaciones habituales de Llama 3.2) |
| Idiomas soportados | no disponible (el modelo base soporta oficialmente ingles, aleman, frances, italiano, portugues, hindi, espanol y tailandes) |
| Licencia | no disponible en el repositorio; el modelo base se rige por la Llama 3.2 Community License |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se construye sobre Llama 3.2 1B Instruct, un transformer decoder-only denso con atención por cabezas agrupadas (GQA), RoPE y normalización RMSNorm pre-normativa, entrenado por Meta con destilación a partir de modelos mayores y un pipeline de post-entrenamiento con SFT y RLHF/DPO. El adaptador en sí es un LoRA gestionado con PEFT 0.15.1; el nombre del repositorio indica un entrenamiento con 5.000 ejemplos (`5k`) sobre datos originales aumentados (`original_augmented_original`) en el dominio de aprobaciones de la FDA (`pkc_fda_approval`), con un identificador de ejecución `ab4b09a`.

No se dispone de información sobre el rango LoRA, los módulos objetivo, la tasa de aprendizaje, el número de épocas, la composición exacta del dataset ni si se aplicaron técnicas adicionales (DPO, destilación, decodificación especulativa). La model card es la plantilla estándar de Hugging Face sin rellenar, por lo que todos los campos de detalles, datos, hiperparámetros y evaluación figuran como `[More Information Needed]`.

## Capacidades

- Generación de texto y razonamiento general, heredados del modelo base Llama 3.2 1B Instruct.
- Ajuste específico (presuntamente) para terminología y estructura de aprobaciones regulatorias de la FDA, aunque no hay evidencia documentada en la model card.
- Soporte de tool calling y function calling: el modelo base Llama 3.2 Instruct lo soporta oficialmente; no se ha verificado que el adaptador lo preserve.
- Capacidades multilingües del base (ocho idiomas oficiales); el adaptador no declara idiomas.
- No dispone de visión, audio ni modo de razonamiento extendido (thinking mode).
- Al ser un adaptador LoRA, requiere cargar el modelo base junto con el adaptador mediante PEFT; no es un checkpoint autónomo.

## Casos de uso

- Experimentación académica sobre ajuste fino en dominios regulados: permite reproducir un LoRA sobre Llama 3.2 1B para estudiar cómo se comporta un modelo pequeño ante vocabulario regulatorio específico (FDA, aprobaciones, etiquetado).
- Prototipado de asistentes internos para equipos de asuntos regulatorios: el adaptador podría emplearse para clasificar o resumir borradores de documentación de aprobaciones, siempre con revisión humana obligatoria.
- Investigación sobre olvido catastrófico: al ser un LoRA de 5.000 ejemplos sobre un modelo de 1B, es un caso útil para medir cuánto se degradan las capacidades generales tras un ajuste de dominio estrecho.
- Evaluación de robustez y sesgos en modelos pequeños especializados: sirve como banco de pruebas para comparar el comportamiento del base frente al adaptado en tareas de seguridad y alucinación.
- Base para pipelines de anotación semiautomática: con 1B de parámetros y contexto de 128k, puede desplegarse en una sola GPU consumer para etiquetar grandes volúmenes de texto regulatorio a bajo coste.
- Docencia y formación en PEFT: el repositorio, con su estructura mínima (`adapter_config.json` y `adapter_model.safetensors`), es un ejemplo práctico de cómo se publica un adaptador LoRA y de los riesgos de documentación insuficiente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de evaluación, y el autor no reporta comparaciones con el modelo base ni con alternativas.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base en fp16 requiere unos 2,5 GB de pesos; en 8 bits, aproximadamente 1,3 GB; en 4 bits (GGUF Q4_K_M), alrededor de 0,8 GB. El adaptador LoRA añade unos 0,2 GB en fp16.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para fp16 con contexto corto; RTX 3060, RTX 4060, RTX 4090, A100 o H100 para despliegues con contexto largo o por lotes.
- Cabe en GPU consumer: sí, en la práctica totalidad de GPU dedicadas modernas (GTX 1660 6 GB, RTX 3050 8 GB, RTX 4060 8 GB, etc.) y en Apple Silicon con Metal.
- Opciones de despliegue: `transformers` + `peft` (imprescindible para cargar el adaptador), vLLM con soporte LoRA, llama.cpp y Ollama solo si se fusiona previamente el adaptador con el base; TGI con adaptadores PEFT.
- Latencia y throughput estimados: no disponibles. En una RTX 4090, un modelo de 1B en fp16 suele generar del orden de 100-200 tokens/s con decodificación estándar, pero no hay mediciones publicadas para este adaptador concreto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Este adaptador (LoRA sobre Llama 3.2 1B Instruct) | 1,23 B (base) | 128k (base) | no disponible | safetensors (PEFT) | Ajuste de dominio sin documentar |
| Meta Llama 3.2 1B Instruct | 1,23 B | 128k | Llama 3.2 Community License | safetensors, GGUF | Modelo base oficial, con benchmarks publicados |
| Qwen2.5 1.5B Instruct | 1,54 B | 32k | Apache 2.0 | safetensors, GGUF | Alternativa abierta con licencia permisiva |
| Gemma 2 2B Instruct | 2,6 B | 8k | Gemma Terms of Use | safetensors, GGUF | Mayor tamaño, contexto menor |

La comparación se limita a parámetros, contexto y licencia porque no existen métricas publicadas de este adaptador. Frente al base, la única diferencia verificable es la presencia de un ajuste LoRA de dominio; frente a Qwen2.5 1.5B o Gemma 2 2B, la licencia del adaptador es indeterminada, lo que supone un riesgo adicional para uso comercial.

## Limitaciones y advertencias

- La model card está sin rellenar: no hay información sobre datos de entrenamiento, hiperparámetros, evaluación ni uso previsto, lo que impide auditar el ajuste.
- Licencia no declarada: no se puede asumir uso comercial permitido. El modelo base se rige por la Llama 3.2 Community License, pero el adaptador no especifica términos propios.
- Riesgo elevado de alucinación en el dominio regulatorio: un ajuste de 5.000 ejemplos sobre un modelo de 1B no garantiza precisión factual sobre normativa FDA, y no hay evaluación que lo respalde.
- Posible olvido catastrófico de las capacidades generales del base tras el ajuste de dominio, sin métricas que lo cuantifiquen.
- Idiomas no declarados: no se puede asumir que el adaptador mantenga el multilingüismo del base.
- Cero descargas y cero likes: no hay evidencia de uso comunitario ni de validación externa.
- El identificador del repositorio sugiere un experimento automatizado de ajuste fino; conviene tratar el artefacto como material de investigación, no como componente de producción.
- No apto para decisiones clínicas o regulatorias sin supervisión humana experta.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/believe-it-or-not/Llama-3.2-1B-Instruct-5k_original_augmented_original_pkc_fda_approval-ab4b09a
- Modelo base en Hugging Face: https://huggingface.co/togethercomputer/Meta-Llama-3.2-1B-Instruct-Reference__TOG__FT
- Modelo original de Meta: https://huggingface.co/meta-llama/Llama-3.2-1B-Instruct
- Documentación de PEFT: https://huggingface.co/docs/peft
- Paper de referencia sobre impacto ambiental (Lacoste et al., 2019): https://arxiv.org/abs/1910.09700
- Calculadora ML Impact: https://mlco2.github.io/impact
