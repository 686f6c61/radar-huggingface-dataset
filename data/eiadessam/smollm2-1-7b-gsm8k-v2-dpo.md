# EiadEssam/smollm2-1.7b-gsm8k-v2-dpo

## Resumen

smollm2-1.7b-gsm8k-v2-dpo es un ajuste fino del modelo SmolLM2 de 1.700 millones de parametros, publicado por el usuario EiadEssam en Hugging Face. El nombre del repositorio sugiere un entrenamiento en dos fases: primero un ajuste supervisado sobre el conjunto de datos GSM8K (problemas de matematicas de nivel escolar) y despues una fase de optimizacion por preferencias con DPO (Direct Preference Optimization), tal como indica la etiqueta `dpo` y la libreria TRL presente en los metadatos. El modelo esta pensado para generacion de texto conversacional.

La relevancia de esta ficha es limitada: se trata de un experimento personal con cero descargas y cero likes en el momento de la consulta, y la model card es la plantilla autogenerada por Hugging Face sin ningun campo completado. No hay informacion publicada sobre datos de entrenamiento, hiperparametros, evaluacion ni licencia. Todos los datos tecnicos que se presentan a continuacion provienen de los metadatos del repositorio (arquitectura `llama`, 1.711.376.384 parametros reales en safetensors, tamano de 3,4 GB) o de las caracteristicas conocidas del modelo base SmolLM2, que se indican explicitamente como tales.

Se recomienda tratar este modelo como una prueba de concepto reproducible mas que como un artefacto listo para produccion, dado que no existe documentacion verificable sobre su comportamiento, sus sesgos ni las condiciones de uso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama, segun tag `llama`); derivado de SmolLM2-1.7B |
| Parametros totales | 1.711.376.384 (1,7 B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la model card; el modelo base SmolLM2-1.7B soporta 8.192 tokens (dato del modelo base, no verificado en este checkpoint) |
| Tipos de cuantizacion | no disponible; al ser un checkpoint en safetensors es cuantizable a GGUF/AWQ/GPTQ con herramientas externas, pero el autor no publica variantes |
| Idiomas soportados | no disponible (el modelo base SmolLM2 es predominantemente ingles) |
| Licencia | no disponible |
| Formato de pesos | safetensors (transformers); no se publican GGUF ni otros formatos |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base SmolLM2-1.7B de Hugging Face: un transformer decoder-only denso con atencion por grupos (GQA) y normalizacion RMSNorm, del que se heredan los 1.711 millones de parametros. El repositorio contiene unicamente los pesos ajustados; no se incluye configuracion modificada ni tokenizer propio, por lo que se asume compatibilidad directa con el tokenizer del modelo base.

Sobre el entrenamiento solo puede inferirse lo que sugiere el identificador: un ajuste supervisado (SFT) sobre GSM8K seguido de DPO con TRL. No hay informacion sobre el numero de pasos, el dataset de preferencias utilizado en la fase DPO, la composicion del conjunto de entrenamiento, hiperparametros (learning rate, batch size, regimen de precision) ni sobre si se aplicaron tecnicas como LoRA o ajuste completo. Tampoco se documenta ninguna innovacion tecnica adicional (decodificacion especulativa, atencion lineal, etc.). La model card no aporta ningun dato de entrenamiento ni de evaluacion.

## Capacidades

- Generacion de texto autoregresiva en formato conversacional, heredada del modelo base.
- Razonamiento matematico basico orientado a problemas tipo GSM8K, presumiblemente reforzado por el ajuste declarado en el nombre del repositorio (no verificado con evaluacion publicada).
- Soporte de tool calling: no documentado; el modelo base SmolLM2 no lo incluye de forma nativa.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingues: no documentadas; el modelo base esta entrenado mayoritariamente en ingles.
- Capacidades especiales (thinking mode, vision, audio): no disponibles.
- Formato de chat: no documentado en la model card; se desconoce si se aplico una plantilla conversacional concreta durante el ajuste.

## Casos de uso

- Experimentacion academica con DPO: el modelo sirve como caso de estudio reproducible para comparar el efecto de una fase DPO sobre GSM8K frente al SmolLM2-1.7B original, siempre que se reproduzca el pipeline con TRL.
- Prototipado de tutores de matematicas escolares: dado el ajuste declarado sobre GSM8K, puede emplearse en demos de resolucion de problemas aritmeticos de primaria y secundaria, con validacion humana obligatoria por el riesgo de alucinacion.
- Evaluacion de pipelines de ajuste fino: util como checkpoint intermedio para medir deriva de comportamiento (regresion en tareas generales) tras un ajuste especifico de dominio.
- Generacion de datos sinteticos de razonamiento: puede utilizarse para producir trazas de solucion de problemas aritmeticos que luego se filtren y se usen en el entrenamiento de modelos mayores.
- Despliegue en entornos con recursos muy limitados: con 1,7 B de parametros cabe en GPUs de consumo tras cuantizacion, lo que permite probar asistentes conversacionales en hardware modesto o en el borde.
- Educacion y divulgacion: por su tamano reducido es adecuado para talleres donde se explica el ciclo completo SFT + DPO sobre un modelo abierto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye seccion de evaluacion cumplimentada y el autor no reporta metricas de GSM8K, MMLU ni de ninguna otra tarea.

## Requisitos de hardware

- VRAM estimada en fp16/bf16: aproximadamente 3,4 GB solo para pesos, mas overhead de activaciones y KV cache (estimacion orientativa de 5-7 GB para contextos moderados).
- VRAM estimada en cuantizacion de 8 bits: en torno a 1,8-2 GB para pesos.
- VRAM estimada en cuantizacion de 4 bits (si se genera GGUF con llama.cpp): en torno a 1,1-1,3 GB para pesos.
- GPU recomendadas para produccion: A100, H100 o L40S si se busca throughput alto con vLLM o TGI.
- GPU de consumo: cabe holgadamente en RTX 4090, RTX 4080, RTX 3090, RTX 4070 Ti y, con cuantizacion 4 bits, en GPUs de 8 GB como RTX 3060 Ti o RTX 4060.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (tag `text-generation-inference`), endpoints compatibles (tag `endpoints_compatible`). Para llama.cpp u Ollama seria necesario convertir los pesos a GGUF, ya que el repositorio no incluye ese formato.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| EiadEssam/smollm2-1.7b-gsm8k-v2-dpo | 1,7 B | no disponible (base: 8.192) | no disponible | Hugging Face, 0 descargas | Ajuste DPO sobre GSM8K, sin evaluacion publicada |
| HuggingFaceTB/SmolLM2-1.7B-Instruct | 1,7 B | 8.192 tokens | Apache 2.0 | Hugging Face, ampliamente usado | Modelo base instruct oficial, con evaluacion publicada |
| Qwen2.5-1.5B-Instruct | 1,5 B | 32.768 tokens | Apache 2.0 | Hugging Face, muy extendido | Mayor contexto y soporte multilingue declarado |
| Llama-3.2-1B-Instruct | 1,2 B | 128.000 tokens | Llama 3.2 Community License | Hugging Face, requiere aceptacion | Contexto mucho mayor y ecosistema maduro |

La comparacion debe tomarse con cautela: los tres modelos alternativos cuentan con model cards completas y evaluaciones publicadas, mientras que el modelo objeto de esta ficha carece de ambas.

## Limitaciones y advertencias

- La model card es la plantilla autogenerada por Hugging Face y no contiene informacion sobre sesgos, riesgos ni usos fuera de alcance.
- No se declara licencia, por lo que el uso comercial queda en un limbo legal; debe contactarse con el autor antes de cualquier despliegue productivo.
- Riesgo elevado de alucinacion en matematicas: el ajuste sobre GSM8K no garantiza correccion aritmetica fuera de la distribucion del conjunto de entrenamiento, y no hay evaluacion que lo respalde.
- Posible olvido catastrofico (catastrophic forgetting) de capacidades generales tras el ajuste especifico y la fase DPO, sin datos que permitan cuantificarlo.
- Idiomas no declarados; se espera un rendimiento pobre en castellano por herencia del modelo base, predominantemente angloparlante.
- Cero descargas y cero likes en el momento de la consulta: no existe validacion por parte de la comunidad.
- Sin garantias de reproducibilidad: no se documentan hiperparametros, datasets de preferencias ni semillas.
- El tag `arxiv:1910.09700` corresponde a la calculadora de impacto ambiental de Lacoste et al., incluida en la plantilla, no a un paper del modelo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/EiadEssam/smollm2-1.7b-gsm8k-v2-dpo
- Modelo base (referencia, no enlazado en la model card): https://huggingface.co/HuggingFaceTB/SmolLM2-1.7B
- Libreria TRL (mencionada en los tags): https://github.com/huggingface/trl
- Paper de la calculadora de impacto ambiental citado en la plantilla: https://arxiv.org/abs/1910.09700
- No se han encontrado en la informacion disponible papers, blogs, repositorios ni demos adicionales especificos de este checkpoint.
