# jarodzr/Llama-3-8B-BioRE-ENTITY-SFT

## Resumen

Llama-3-8B-BioRE-ENTITY-SFT es un adaptador LoRA (PEFT) publicado por el usuario jarodzr en Hugging Face, afinado sobre meta-llama/Meta-Llama-3-8B-Instruct. Su propósito declarado, según las etiquetas del repositorio, es la extracción de relaciones (relation extraction) y el procesamiento de lenguaje natural biomédico (biomedical-nlp), partiendo de un modelo causal de 8.000 millones de parámetros con instrucciones.

El modelo no es un checkpoint completo, sino un adaptador de bajo rango que debe cargarse junto al modelo base original. El repositorio ocupa 1,5 GB, lo que es coherente con pesos LoRA en precisión alta (no con un modelo completo de 8B, que rondaría los 16 GB en fp16). Se trata de un ajuste supervisado (SFT) orientado a tareas de extracción de entidades y relaciones en el dominio biomédico.

La relevancia de esta ficha es limitada pero concreta: sirve como ejemplo de especialización de Llama 3 8B Instruct en dominios científicos mediante LoRA, un patrón muy extendido para investigadores que necesitan adaptar modelos generalistas a ontologías y corpus biomédicos sin reentrenar el modelo completo. No obstante, la model card es extremadamente escueta y no aporta datos de entrenamiento, evaluación ni licencia.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only causal (Llama 3), adaptador LoRA sobre el modelo base |
| Parámetros totales | 8.000 millones (modelo base); tamaño del adaptador no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (el modelo base Llama 3 8B Instruct soporta 8.192 tokens) |
| Tipos de cuantización | no disponible (al ser PEFT, el adaptador se puede combinar con el base en fp16, bf16, 8-bit o 4-bit, pero el autor no lo especifica) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA; librería `peft`) |

## Arquitectura y entrenamiento

El modelo base es Llama 3 8B Instruct, un transformer decoder-only con atención causal estándar, entrenado por Meta con instrucciones y alineamiento. Sobre él se aplica un adaptador LoRA, es decir, matrices de bajo rango inyectadas en capas del transformer que se entrenan mientras el resto de pesos permanece congelado. El repositorio declara la etiqueta `lora` y la librería `peft`, y el tamaño de 1,5 GB sugiere un rango y un conjunto de módulos objetivo relativamente amplios, aunque el autor no detalla la configuración (r, alpha, dropout, módulos).

No se dispone de información sobre el corpus de entrenamiento: no se especifica el número de tokens, la composición del dataset biomédico, las ontologías o esquemas de anotación utilizados, ni si hubo una fase de RLHF o DPO posterior al SFT. La model card únicamente indica que se trata de un ajuste supervisado (SFT) para extracción de relaciones y entidades en el dominio biomédico. Tampoco se documentan innovaciones técnicas como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto causal condicionada por instrucciones, heredada del modelo base Llama 3 8B Instruct.
- Extracción de relaciones (relation extraction) en textos biomédicos, según las etiquetas del repositorio.
- Extracción de entidades biomédicas (el nombre del modelo incluye "ENTITY"), aunque el autor no documenta el esquema exacto.
- Procesamiento de lenguaje natural biomédico: presumiblemente textos clínicos, artículos científicos o corpus anotados, sin detalle disponible.
- Soporte de tool calling y function calling: no documentado para este adaptador; el modelo base Llama 3 8B Instruct tiene capacidades de tool use, pero el ajuste puede degradarlas.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: no disponibles; el autor no declara idiomas.
- Capacidades especiales (thinking mode, visión, audio): no disponibles.

## Casos de uso

- Extracción de relaciones biomédicas en corpus científicos: el adaptador se cargaría sobre Llama 3 8B Instruct para transformar frases de artículos en tripletas entidad-relación-entidad, aprovechando el ajuste SFT específico del dominio.
- Anotación asistida de entidades clínicas: útil para preetiquetar informes o historiales antes de la revisión humana, reduciendo el esfuerzo de anotadores expertos en dominios con ontologías complejas.
- Construcción de grafos de conocimiento biomédicos: las relaciones extraídas podrían alimentar pipelines que generen grafos de interacciones gen-proteína, fármaco-diana o enfermedad-síntoma.
- Investigación en NLP biomédico: como baseline reproducible para comparar estrategias de LoRA frente a fine-tuning completo en tareas de RE (relation extraction).
- Prototipado rápido de sistemas de información farmacológica: al ser un adaptador ligero (1,5 GB), permite experimentar con distintas variantes sin almacenar múltiples checkpoints de 8B.
- Despliegue en entornos con recursos limitados: combinado con cuantización 4-bit del modelo base, el adaptador puede ejecutarse en una única GPU consumer, facilitando pruebas locales de extracción de relaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador LoRA añade una sobrecarga mínima; el modelo base Llama 3 8B requiere aproximadamente 16 GB en fp16, 8-10 GB en 8-bit y 5-6 GB en 4-bit (estimaciones estándar para 8B, no publicadas por el autor).
- GPU recomendadas: A100 40 GB o H100 para fp16 sin cuantizar con contexto largo; RTX 4090 (24 GB) para fp16; RTX 3090/4080 (16-24 GB) para 8-bit.
- Cabe en GPU consumer: sí, en RTX 4090, RTX 3090, RTX 4080 y GPUs con 12-16 GB si se aplica cuantización 4-bit al modelo base.
- Opciones de despliegue: `peft` + `transformers` para cargar el adaptador; vLLM y TGI admiten adaptadores LoRA en algunos casos, aunque la compatibilidad con este adaptador concreto no está documentada; llama.cpp y Ollama requerirían fusionar el adaptador con el modelo base y convertir a GGUF.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Llama-3-8B-BioRE-ENTITY-SFT | 8B (base) + LoRA | no disponible | Adaptador PEFT para RE biomédica | no disponible | Hugging Face (0 descargas) |
| Meta-Llama-3-8B-Instruct | 8B | 8.192 tokens | Modelo completo instruido | Llama 3 Community License | Hugging Face (ampliamente usado) |
| Modelos biomédicos especializados (p. ej., variantes de BioBERT/PubMedBERT para RE) | 110M-340M | 512 tokens | Encoder para clasificación/RE | variable (MIT/Apache en muchos casos) | Hugging Face |

La comparación con modelos biomédicos tipo encoder es pertinente porque, para extracción de relaciones, un encoder especializado suele ser más eficiente y preciso que un decoder de 8B; sin embargo, el enfoque LoRA sobre Llama 3 ofrece generación libre y mayor flexibilidad de formato. No se dispone de datos de rendimiento del adaptador para validar esta comparación.

## Limitaciones y advertencias

- La model card no documenta datos de entrenamiento, configuración de LoRA, esquema de anotación ni métricas de evaluación; la reproducibilidad es nula.
- Riesgo de alucinación inherente a los modelos generativos de 8B, especialmente en dominios científicos donde las entidades y relaciones deben ser exactas.
- Sesgos del modelo base Llama 3 8B Instruct, no evaluados ni mitigados en este ajuste.
- Idiomas soportados no declarados; el comportamiento multilingüe es incierto.
- Licencia no disponible: no se puede confirmar si el uso comercial está permitido, y además hereda las restricciones de la Llama 3 Community License del modelo base.
- El repositorio tiene 0 descargas y 0 likes, sin evidencia de uso o validación por la comunidad.
- Al ser un adaptador PEFT, requiere cargar el modelo base, lo que añade complejidad de despliegue frente a un checkpoint completo.
- No hay garantía de que las capacidades de tool calling o razonamiento del modelo base se conserven tras el ajuste.

## Enlaces

- Hugging Face: https://huggingface.co/jarodzr/Llama-3-8B-BioRE-ENTITY-SFT
- Modelo base (referenciado en la model card, vía ModelScope): https://www.modelscope.cn/models/LLM-Research/Meta-Llama-3-8B-Instruct
- Modelo base en Hugging Face: https://huggingface.co/meta-llama/Meta-Llama-3-8B-Instruct
- Librería PEFT: https://github.com/huggingface/peft
