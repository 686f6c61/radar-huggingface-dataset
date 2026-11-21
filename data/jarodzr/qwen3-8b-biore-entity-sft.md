# jarodzr/Qwen3-8B-BioRE-ENTITY-SFT

## Resumen

Qwen3-8B-BioRE-ENTITY-SFT es un adaptador LoRA publicado por el usuario jarodzr sobre el modelo base Qwen/Qwen3-8B. Se trata de un ajuste fino supervisado (SFT) orientado a la extraccion de relaciones biomedicas (BioRE, *biomedical relation extraction*) y al reconocimiento de entidades en texto cientifico. El repositorio contiene unicamente los pesos del adaptador PEFT (1,1 GB), no el modelo completo, por lo que su uso requiere descargar por separado el modelo base Qwen3-8B.

El modelo hereda la arquitectura transformer causal densa de Qwen3-8B, con aproximadamente 8 mil millones de parametros y una ventana de contexto nativa de 32 768 tokens (extensible hasta 131 072 en la familia Qwen3). El ajuste LoRA modifica una fraccion reducida de los pesos para especializar al modelo en tareas de etiquetado de entidades y relaciones en dominios biomedicos, un nicho donde los modelos generalistas suelen fallar por falta de vocabulario y estructura de datos especificos.

La relevancia de esta ficha es limitada pero concreta: se trata de un adaptador de investigacion, con cero descargas y cero *likes* en el momento de la consulta, publicado sin model card detallada, sin licencia declarada y sin resultados de evaluacion. Resulta util como punto de partida para quienes trabajen en extraccion de informacion biomedica y quieran experimentar con un Qwen3-8B especializado, pero no debe considerarse un artefacto listo para produccion sin validacion adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal denso (modelo base Qwen3-8B) con adaptador LoRA (PEFT) |
| Parametros totales | ~8 000 millones (modelo base Qwen3-8B); el adaptador LoRA ocupa 1,1 GB en el repositorio |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 32 768 tokens nativos en Qwen3-8B (extensible a 131 072 mediante configuracion; no confirmado para este adaptador) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en precision de entrenamiento; el modelo base admite cuantizacion GGUF/AWQ/INT8 por su cuenta) |
| Idiomas soportados | no disponible (heredados del modelo base Qwen3, multilingue, sin lista declarada en la model card) |
| Licencia | no disponible (la model card no declara licencia; el modelo base Qwen3-8B se distribuye bajo Apache 2.0) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); el modelo base en safetensors |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen3-8B, un transformer decoder-only causal con atencion por cabezas agrupadas (GQA), normalizacion RMSNorm y activacion SwiGLU, entrenado por Alibaba Qwen con un corpus multilingue masivo y sometido a un pipeline de post-entrenamiento que incluye SFT y aprendizaje por refuerzo. Qwen3-8B incorpora ademas un modo de "thinking" (razonamiento extendido) que puede activarse o desactivarse segun la tarea.

Sobre esa base, jarodzr ha aplicado un ajuste fino supervisado con LoRA orientado a BioRE (extraccion de relaciones biomedicas) y reconocimiento de entidades. La model card no especifica el numero de tokens de entrenamiento, la composicion del dataset, los hiperparametros del LoRA (rango, alpha, capas objetivo) ni si se aplicaron tecnicas adicionales como DPO o RLHF. Tampoco se documenta el esquema de anotacion ni los corpus utilizados (por ejemplo, BC5CDR, ChemProt, GAD o BioRED), lo que limita la reproducibilidad del ajuste.

## Capacidades

- Generacion de texto autoregresiva heredada de Qwen3-8B, con calidad conversacional y de redaccion propias del modelo base.
- Extraccion de relaciones biomedicas: identificacion de pares entidad-relacion en texto cientifico (farmaco-enfermedad, gen-enfermedad, proteina-proteina, etc.).
- Reconocimiento de entidades nombradas (NER) en dominio biomedico, segun el nombre del adaptador (ENTITY-SFT).
- Razonamiento en modo "thinking" disponible a traves del modelo base, aunque no se documenta si el adaptador preserva esta capacidad.
- Soporte multilingue heredado de Qwen3 (mas de 100 idiomas en el modelo base), sin evaluacion especifica para este adaptador.
- Tool calling y function calling: disponibles en el modelo base Qwen3, no verificados tras el ajuste LoRA.
- Capacidades de agente y razonamiento multi-paso: heredadas del modelo base, no evaluadas en este adaptador.

## Casos de uso

- Extraccion de relaciones en literatura biomedica: el adaptador puede procesar resumenes de PubMed y devolver tripletas entidad-relacion para alimentar bases de conocimiento como CTD o DisGeNET. Su ventana de 32 768 tokens permite manejar articulos completos sin truncar.
- Anotacion asistida de corpus clinicos: util para pre-etiquetar conjuntos de datos de NER y RE antes de la revision humana, reduciendo el coste de anotacion manual en proyectos de NLP clinico.
- Construccion de grafos de conocimiento farmacologicos: a partir de fichas tecnicas y estudios, el modelo puede extraer interacciones farmaco-farmaco y farmaco-diana para su posterior validacion.
- Vigilancia de literatura cientifica: integrado en un pipeline que consuma feeds de bioRxiv o PubMed, el adaptador puede clasificar y estructurar hallazgos relevantes sobre dianas terapeuticas.
- Enriquecimiento de bases de datos internas de I+D: en entornos farmaceuticos, el modelo puede extraer relaciones de informes internos no publicos, siempre que se valide la salida y se gestione la confidencialidad.
- Prototipado de asistentes de investigacion: combinado con el modo thinking de Qwen3, puede servir como base para un asistente que responda preguntas sobre relaciones biomedicas citando las entidades detectadas.
- Investigacion academica en BioRE: como punto de partida para *fine-tuning* adicional o para comparar estrategias LoRA frente a ajuste completo en tareas de extraccion de informacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de precision, recall ni F1 sobre conjuntos como BC5CDR, ChemProt, GAD o BioRED, ni comparaciones con otros modelos de extraccion de relaciones.

## Requisitos de hardware

- VRAM para inferencia del modelo base en FP16: aproximadamente 16 GB solo para pesos, mas overhead de activaciones y cache KV (20-24 GB en la practica con contexto moderado).
- VRAM en cuantizacion INT8: ~9-10 GB; en INT4 (GGUF Q4_K_M): ~5-6 GB, lo que permite ejecucion en GPUs de consumo.
- GPUs recomendadas: A100 40/80 GB o H100 para despliegue en FP16 con contexto largo; RTX 4090 (24 GB) para FP16 con contexto moderado; RTX 3090, RTX 4080 o RTX 4070 Ti para cuantizaciones INT8/INT4.
- Cabe en GPU de consumo: si, en cuantizacion INT4 o INT8, con contexto reducido. El adaptador LoRA anade un overhead minimo (1,1 GB en el repositorio, menos en VRAM tras fusion).
- Opciones de despliegue: vLLM, TGI y llama.cpp/Ollama admiten carga de adaptadores LoRA sobre el modelo base; tambien es posible fusionar el adaptador con `peft` y desplegar el modelo fusionado.
- Latencia y throughput: no disponibles; dependen del hardware, la cuantizacion y la longitud de contexto. Como referencia orientativa del modelo base Qwen3-8B en A100, se situa en decenas de tokens por segundo por peticion en FP16.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-8B-BioRE-ENTITY-SFT (este) | ~8 000 M + LoRA | 32 768 (heredado) | Extraccion de relaciones biomedicas (SFT LoRA) | no disponible | Hugging Face, 0 descargas |
| Qwen3-8B (base) | ~8 000 M | 32 768 (extensible a 131 072) | Modelo generalista multilingue | Apache 2.0 | Hugging Face, ampliamente usado |
| BioBERT / PubMedBERT | ~110 M | 512 | NER y RE biomedica clasica | Apache 2.0 / MIT | Hugging Face, muy extendido |
| Llama 3.1 8B | ~8 000 M | 128 000 | Modelo generalista multilingue | Llama 3.1 Community License | Hugging Face, ampliamente usado |

La comparacion con BioBERT y PubMedBERT es la mas directa en la tarea: estos modelos estan especificamente preentrenados en corpus biomedicos y son el estandar en BioRE, aunque con ventanas de contexto mucho menores (512 tokens). El adaptador de jarodzr ofrece la ventaja de un contexto de 32 768 tokens y capacidades generativas, a costa de una especializacion menos documentada y sin metricas publicadas.

## Limitaciones y advertencias

- Ausencia total de evaluacion: no hay benchmarks, ni metricas de F1, ni validacion sobre conjuntos estandar de BioRE, lo que impide estimar su calidad real.
- Model card incompleta: no se documentan datos de entrenamiento, hiperparametros del LoRA, esquema de anotacion ni corpus utilizados.
- Licencia no declarada: la model card no especifica licencia del adaptador; aunque el modelo base Qwen3-8B es Apache 2.0, la ausencia de licencia explicita en el adaptador genera incertidumbre para uso comercial.
- Riesgo de alucinacion: como todo modelo generativo, puede inventar relaciones o entidades no presentes en el texto; requiere validacion contra la fuente original.
- Sesgos del modelo base: Qwen3-8B puede arrastrar sesgos de su corpus de entrenamiento, especialmente en dominios cientificos donde la representacion geografica y de genero es desigual.
- Especializacion estrecha: el ajuste se centra en entidades y relaciones biomedicas; su rendimiento en otras tareas de extraccion de informacion no esta documentado y probablemente sea inferior al del modelo base.
- Idiomas: no se declara que idiomas cubre el adaptador; el modelo base es multilingue, pero el ajuste puede haber degradado el rendimiento en idiomas distintos del ingles biomedico.
- Cero adopcion: con 0 descargas y 0 likes, no hay evidencia de uso comunitario ni de validacion independiente.
- Fecha de creacion futura: el repositorio figura creado el 2026-04-23, lo que sugiere que los metadatos pueden ser inconsistentes o que el modelo es extremadamente reciente.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/jarodzr/Qwen3-8B-BioRE-ENTITY-SFT
- Modelo base Qwen3-8B: https://huggingface.co/Qwen/Qwen3-8B
- Documentacion de PEFT: https://huggingface.co/docs/peft
- Repositorio de Qwen3 en GitHub: https://github.com/QwenLM/Qwen3
