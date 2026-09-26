# parmanu-lcs2/Qwen3-6B

## Resumen

Qwen3-6B es una version podada y comprimida del modelo Qwen/Qwen3-8B, publicada por el usuario parmanu-lcs2 en HuggingFace. El modelo aplica la tecnica de poda estructurada SNIPER (descrita en el paper arXiv:2608.12953) con un ratio de compresion objetivo del 25%, reduciendo los parametros desde los aproximadamente 8.200 millones del modelo original hasta 6.198.014.464 parametros. Tras la poda se aplico un ajuste fino de recuperacion con LoRA sobre 2.000 muestras del dataset Open-Orca/SlimOrca, con los adaptadores ya fusionados en los pesos finales.

El modelo conserva la licencia Apache 2.0 del Qwen3-8B original y mantiene el pipeline de text-generation, pero introduce una arquitectura no estandar: la poda deja capas con formas distintas y elimina algunos bloques de atencion y MLP, por lo que la definicion del modelo vive en un fichero `modeling_pruned.py` incluido en el repositorio. Esto obliga a cargar el modelo con `trust_remote_code=True` y limita la compatibilidad directa con motores de inferencia que asumen arquitecturas Qwen3 estandar.

Su relevancia es fundamentalmente metodologica: sirve como caso de estudio reproducible de compresion de un LLM moderno con calibracion minima (50 muestras de 512 tokens) y un ajuste fino de recuperacion muy ligero (1 epoca, 2.000 muestras, contexto 1.024). No es un modelo con benchmarks publicados ni con adopcion significativa: acumula 0 descargas y 1 like en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only derivado de Qwen3-8B, con poda estructural SNIPER; definicion en `modeling_pruned.py` (custom_code) |
| Parametros totales | 6.198.014.464 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No especificada en la model card. El ajuste fino de recuperacion se realizo con contexto de 1.024 tokens. El modelo base Qwen3-8B declara 32.768 tokens nativos, ampliables a 131.072 con YaRN, pero no se ha verificado que la poda preserve esa capacidad |
| Tipos de cuantizacion | No disponibles. Solo se distribuyen pesos en precision completa (safetensors); no hay versiones GGUF, AWQ, GPTQ ni FP8 publicadas |
| Idiomas soportados | No disponibles. Hereda el tokenizador de Qwen3-8B, cuyo modelo base declara soporte para mas de 100 idiomas y dialectos, sin evaluacion publicada tras la poda |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 12,4 GB), requiere `trust_remote_code=True` |
| Ratio de poda | 25% objetivo |
| Datos de calibracion | slim_orca, 50 muestras x 512 tokens |
| Dataset de recuperacion | Open-Orca/SlimOrca, 2.000 muestras |
| Modelo base | Qwen/Qwen3-8B |
| Fecha de publicacion | 25 de septiembre de 2026 |

## Arquitectura y entrenamiento

La arquitectura de partida es la de Qwen3-8B: un transformer decoder-only causal con normalizacion RMSNorm, RoPE, atencion con query-key normalization y proyecciones agrupadas (GQA), y bloques MLP con activacion SwiGLU. Sobre esa base se aplica SNIPER, un metodo de poda que selecciona y elimina componentes estructurales (bloques de atencion y MLP completos, ademas de reducir dimensiones internas) guiandose por la senal de calibracion. El resultado es un grafo computacional con un numero de capas y unas formas de tensor distintas de las del modelo original, lo que explica la necesidad de codigo personalizado. No se especifica en la model card cuantos bloques exactos se eliminaron ni la configuracion final de capas, cabezas de atencion o dimension oculta.

El proceso de recuperacion consistio en un ajuste fino con LoRA sobre 2.000 muestras de SlimOrca durante 1 epoca, con longitud de contexto de 1.024 tokens, tasa de aprendizaje 2e-4, rango 64 y alpha 16, aplicado a los modulos `up_proj`, `gate_proj`, `down_proj`, `q_proj`, `o_proj`, `k_proj` y `v_proj`. Los adaptadores se fusionaron posteriormente en los pesos base. Todo el proceso (poda y fine-tuning) se ejecuto en una unica GPU NVIDIA A100. No se documenta uso de RLHF, DPO ni tecnicas de razonamiento explicito, ni innovaciones adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto conversacional en formato de instrucciones, heredada del ajuste sobre SlimOrca.
- Razonamiento basico y respuesta a preguntas, en la medida en que lo preserve el ajuste de recuperacion.
- Capacidad multilingue potencial (tokenizador de Qwen3), sin evaluacion publicada tras la poda.
- Soporte de tool calling / function calling: no documentado en la model card; la poda y el ajuste ligero hacen poco probable que se conserve intacto el comportamiento de tool calling del Qwen3-8B original.
- Modo thinking (razonamiento extendido con bloques de pensamiento) de la familia Qwen3: no documentado ni verificado en esta version podada.
- Capacidades de agente y razonamiento multi-paso: no documentadas.
- Capacidades de vision o audio: no disponibles; el modelo es exclusivamente de texto.
- Capacidad efectiva de contexto largo: no verificada; el entrenamiento de recuperacion uso 1.024 tokens.

## Casos de uso

- Investigacion en compresion de modelos: sirve como punto de comparacion reproducible para estudiar el impacto de SNIPER al 25% sobre un Qwen3-8B, evaluando la degradacion frente al modelo original con la misma bateria de prompts.
- Experimentacion academica con presupuesto de VRAM reducido: permite trabajar con un LLM de ~6,2 B parametros en GPUs de 16-24 GB en precision completa, algo que el Qwen3-8B original solo consigue con cuantizacion.
- Generacion de texto asistida en entornos de prototipado: tareas de redaccion, resumen o reformulacion de parrafos cortos, donde el contexto de 1.024 tokens usado en el ajuste es suficiente.
- Fine-tuning posterior con LoRA: al ser un modelo pequeno y con licencia Apache 2.0, es viable reentrenarlo en dominios concretos (legal, medico, tecnico) sobre una sola GPU, partiendo de los pesos ya podados.
- Evaluacion de tecnicas de recuperacion tras poda: el modelo permite medir cuanto de la calidad original se recupera con solo 2.000 muestras y 1 epoca, y compararlo con recuperaciones mas agresivas.
- Clasificacion y etiquetado de texto por generacion (zero-shot): con prompts bien disenados puede usarse para categorizar tickets, correos o resenas en lotes, aunque sin garantias de robustez frente al modelo original.
- Docencia y demos de arquitecturas no estandar: el fichero `modeling_pruned.py` es un ejemplo practico de como se define en transformers un modelo con bloques eliminados y formas irregulares.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MMLU, HumanEval, GSM8K, ni ninguna evaluacion comparativa frente a Qwen3-8B u otros modelos. Tampoco se reportan metricas de perplejidad, tasas de acierto en tareas de generacion, latencia o throughput.

## Requisitos de hardware

- VRAM estimada en FP16/BF16: aproximadamente 12,4 GB solo de pesos, mas overhead de activaciones y cache KV; en la practica entre 14 y 16 GB para contextos cortos.
- VRAM estimada en INT8: en torno a 6,5-7 GB de pesos, con picos de 9-10 GB. Requiere cuantizacion posterior por parte del usuario, no incluida en el repositorio.
- VRAM estimada en INT4: en torno a 3,5-4 GB de pesos. Requiere convertir el modelo, lo que es complicado por la arquitectura personalizada.
- Cabe en GPU de consumo: si, en RTX 4090, RTX 4080, RTX 3090 y RTX 4070 Ti (24/16/24/12 GB) en FP16; en RTX 3060 12 GB o RTX 4060 Ti 16 GB solo con cuantizacion.
- GPU profesionales recomendadas: A100 40 GB (la usada por el autor), H100, L40S, A6000.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` es la unica via documentada. vLLM, TGI, llama.cpp, Ollama y LM Studio no tienen soporte confirmado para esta arquitectura podada y requeririan adaptaciones o conversion a GGUF inexistente.
- Latencia y throughput: no disponibles.
- Nota critica: la evaluacion de compatibilidad se realizo sobre 1 like y 0 descargas, por lo que no hay evidencia de despliegue en produccion por terceros.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto declarado | Licencia | Disponibilidad | Benchmarks publicados |
|---|---|---|---|---|---|
| parmanu-lcs2/Qwen3-6B | 6,20 B | No especificado (base: 32.768 tokens) | Apache 2.0 | HuggingFace, pesos safetensors, codigo custom | No |
| Qwen/Qwen3-8B (modelo base) | ~8,2 B | 32.768 tokens, ampliable a 131.072 con YaRN | Apache 2.0 | HuggingFace, GGUF, AWQ, GPTQ, vLLM, TGI | Si, publicados por Qwen |
| Qwen/Qwen3-4B | ~4,0 B | 32.768 tokens, ampliable a 131.072 con YaRN | Apache 2.0 | HuggingFace, multiples formatos | Si, publicados por Qwen |
| Llama 3.1 8B | ~8,03 B | 128.000 tokens | Llama 3.1 Community License | HuggingFace, GGUF, vLLM, TGI | Si, publicados por Meta |

Los datos del modelo base y de las alternativas provienen de la documentacion publica de sus respectivos autores y no de la informacion proporcionada en esta ficha; deben verificarse en las model cards originales. No existe comparacion de rendimiento directa entre Qwen3-6B y estas alternativas porque el modelo podado no publica evaluaciones.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay ninguna evidencia publicada sobre la calidad final del modelo tras la poda del 25% y el ajuste de recuperacion con solo 2.000 muestras.
- Degradacion esperada: la poda estructural de un 25% de los parametros, especialmente al eliminar bloques completos, suele producir perdidas notables de razonamiento, coherencia en contextos largos y adherencia a instrucciones complejas.
- Contexto reducido en el fine-tuning: el ajuste de recuperacion se hizo con ventanas de 1.024 tokens; es probable que el rendimiento se degrade en prompts largos aunque la arquitectura admita mas.
- Riesgo de alucinacion: se desconoce el comportamiento real; al no haber evaluaciones, el riesgo no esta cuantificado y el modelo no deberia usarse sin validacion previa en tareas sensibles.
- Codigo personalizado obligatorio: `trust_remote_code=True` ejecuta `modeling_pruned.py` del repositorio, lo que implica un riesgo de seguridad y de mantenimiento. Conviene auditar el fichero antes de cargarlo.
- Incompatibilidad con herramientas estandar: sin soporte en llama.cpp, Ollama, vLLM o TGI, y sin versiones GGUF o cuantizadas, el despliegue en produccion es inviable sin trabajo de adaptacion.
- Idiomas no documentados: no se especifica que idiomas sobreviven a la poda ni con que calidad.
- Sesgos: no documentados. El dataset de ajuste (SlimOrca) es una destilacion de GPT-4, por lo que hereda los sesgos y el estilo de ese corpus.
- Licencia: Apache 2.0 permite uso comercial, pero el autor del modelo no ofrece garantias ni soporte, y el modelo base Qwen3-8B tambien es Apache 2.0, por lo que no hay restricciones adicionales conocidas.
- Adopcion nula: 0 descargas y 1 like en el momento de la consulta; no existen informes de terceros sobre su comportamiento.
- Fecha de publicacion inusualmente futura (2026) y referencia arXiv con identificador no verificable en busquedas recientes: conviene tratar la procedencia del modelo con cautela.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/parmanu-lcs2/Qwen3-6B
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
- Paper de SNIPER: https://arxiv.org/abs/2608.12953
- Dataset de recuperacion: https://huggingface.co/datasets/Open-Orca/SlimOrca
- No se han encontrado otros enlaces relevantes (blogs, repos, demos o documentacion adicional) en la busqueda web realizada.
