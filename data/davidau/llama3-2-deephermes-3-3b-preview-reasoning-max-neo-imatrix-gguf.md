# DavidAU/Llama3.2-DeepHermes-3-3B-Preview-Reasoning-MAX-NEO-Imatrix-GGUF

## Resumen

Llama3.2-DeepHermes-3-3B-Preview-Reasoning-MAX-NEO-Imatrix-GGUF es una cuantizacion GGUF del modelo NousResearch/DeepHermes-3-Llama-3-3B-Preview, publicada por el usuario DavidAU en Hugging Face. Se trata de un modelo de 3.212.749.888 parametros (aproximadamente 3,2 mil millones) derivado de la familia Llama 3.2 de Meta, afinado por NousResearch para incorporar capacidades de razonamiento explicito (modo thinking) mediante un prompt de sistema que activa cadenas de pensamiento en etiquetas `<think>`. El autor de la cuantizacion anade dos tecnicas propias: "MAXED" (tensores de embedding y salida mantenidos en BF16 en todas las cuantizaciones) y "Neo Imatrix" (un dataset de calibracion propio para mejorar el comportamiento de las cuantizaciones con imatrix).

El modelo resulta relevante porque ofrece capacidades de razonamiento y generacion de texto en un paquete muy pequeno que puede ejecutarse en hardware de consumo, con una ventana de contexto declarada de 128k tokens. La model card afirma que el modelo "cierra la brecha" con modelos de razonamiento de 8B o mas, aunque no se aportan mediciones propias que respalden esa afirmacion; el autor remite a los benchmarks del repositorio original de NousResearch.

La ficha cubre exclusivamente la version GGUF distribuida por DavidAU, que incluye una amplia gama de cuantizaciones (desde IQ1_S hasta Q8_0 y F16) y esta pensada para despliegue local con llama.cpp y herramientas compatibles. La licencia declarada es Apache 2.0, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama 3.2), con capacidad de razonamiento via prompt de sistema |
| Parametros totales | 3.212.749.888 (aprox. 3,2B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 128k tokens (declarado en la model card) |
| Tipos de cuantizacion | IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K_S, Q2_K, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, IQ4_XS, IQ4_NL, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, F16 |
| Idiomas soportados | no disponible (la model card no detalla idiomas; el modelo base es Llama 3.2) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo de 59,1 GB con multiples cuantizaciones) |

## Arquitectura y entrenamiento

El modelo base es NousResearch/DeepHermes-3-Llama-3-3B-Preview, un fine-tuning de Llama 3.2 3B orientado a razonamiento y "thinking". La model card del autor de la cuantizacion no detalla la composicion del dataset de entrenamiento, el numero de tokens utilizados, ni si se emplearon tecnicas de RLHF o DPO; esos datos corresponderian al repositorio original de NousResearch, al que el autor remite para benchmarks e informacion adicional. Los tags del modelo mencionan datos sinteticos, destilacion, axolotl, function calling y json mode, lo que sugiere un pipeline de fine-tuning con datos sinteticos y destilacion de modelos de razonamiento mayores (se citan DeepSeek-R1-Distill y Qwen2.5 como referencias en los tags), pero no se aportan cifras concretas.

La innovacion tecnica de esta publicacion concreta reside en la cuantizacion. La tecnica "MAXED" mantiene los tensores de embedding y de salida en BF16 (precision completa) en todas las cuantizaciones, lo que incrementa ligeramente el tamano del archivo a cambio de preservar calidad. La tecnica "Neo Imatrix" emplea un dataset de calibracion propio del autor para mejorar la funcion general, el seguimiento de instrucciones y la calidad de salida de las cuantizaciones con imatrix. El autor advierte que las capacidades de razonamiento dependen directamente del tamano de la cuantizacion: recomienda IQ3 o superior para casos de razonamiento, IQ3/IQ4XS/IQ4NL/Q4 para uso creativo, Q5/Q6/Q8 para uso general, y Q8_0 o F16 para maximo rendimiento de razonamiento. Senala tambien que en algunos casos las cuantizaciones IQ funcionan ligeramente mejor que las Q equivalentes, y que IQ4XS/IQ4NL producen salidas distintas al resto.

## Capacidades

- Generacion de texto conversacional y de instrucciones, con soporte de plantilla ChatML.
- Razonamiento explicito en modo "thinking": el prompt de sistema indicado por el autor activa cadenas de pensamiento largas encerradas en etiquetas `<think> </think>` antes de la respuesta final.
- Razonamiento de tipo cadena de pensamiento (CoT) inspirado en DeepSeek-R1, segun los tags del modelo.
- Soporte de function calling y modo JSON (declarado en los tags).
- Capacidades creativas y de escritura de ficcion: generacion de tramas, subtramas, continuacion de escenas, narrativa, terror y roleplaying.
- Resolucion de problemas, acertijos y lluvia de ideas (segun los tags).
- Capacidad "uncensored" declarada en los tags, orientada a usos creativos sin filtros restrictivos.
- Compatibilidad con vLLM y con endpoints compatibles (segun los tags).
- Capacidades multilingues: no disponible (no se detalla en la informacion proporcionada).

## Casos de uso

- Razonamiento local en hardware de consumo: con cuantizaciones IQ4 o Q5 el modelo cabe en GPUs de gama media y permite ejecutar tareas de razonamiento paso a paso sin depender de la nube, gracias a sus 3,2B de parametros.
- Escritura creativa y narrativa larga: la ventana de 128k tokens permite mantener coherencia en relatos extensos, generacion de tramas y subtramas y continuacion de escenas, ambito para el que el autor recomienda las cuantizaciones IQ3/IQ4.
- Roleplaying y chat conversacional: el formato ChatML y el modo thinking permiten mantener conversaciones multi-turno con contexto amplio, adecuado para asistentes de personaje o simulaciones.
- Asistente de resolucion de problemas y lluvia de ideas: el modo de razonamiento explicito facilita descomponer acertijos o problemas complejos en pasos intermedios visibles en las etiquetas `<think>`.
- Integracion en pipelines con function calling y JSON: los tags declaran soporte de function calling y json mode, lo que permite usarlo como componente de extraccion estructurada o de orquestacion de herramientas en aplicaciones locales.
- Despliegue en moviles y dispositivos portatiles: el autor recomienda las cuantizaciones Q4_0/Q5_0 para telefonos y otros dispositivos, lo que habilita asistentes de texto sin conexion.
- Prototipado rapido de agentes: al ser compatible con vLLM y endpoints compatibles, puede servir como backend de bajo coste para probar flujos de agente antes de escalar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card de esta cuantizacion no incluye tablas de MMLU, HumanEval, GSM8K ni similares, y remite explicitamente al repositorio original de NousResearch para consultar benchmarks. El autor solo aporta datos de velocidad: aproximadamente 80 t/s en una tarjeta de gama media con IQ4XS y 55 t/s con Q8, sin especificar el hardware exacto.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial; para un modelo de 3,2B, las cuantizaciones Q4 ocupan del orden de 2 GB y las Q8 en torno a 3,5-4 GB, mientras que F16 rondaria los 6,5 GB (estimaciones por tamano de pesos, no confirmadas en la model card).
- GPU recomendadas: el autor menciona "mid level card" para las pruebas de velocidad (80 t/s con IQ4XS, 55 t/s con Q8) sin especificar modelo; no se detallan recomendaciones de A100, H100 ni RTX 4090.
- Cabe en GPU de consumo: si, dado el tamano de 3,2B; las cuantizaciones Q4_0/Q5_0 estan pensadas por el autor para telefonos y dispositivos portatiles.
- Opciones de despliegue: llama.cpp (formato GGUF nativo), herramientas compatibles con GGUF como Ollama o LM Studio (no confirmadas explicitamente en la model card), y vLLM (mencionado en los tags).
- Latencia y throughput: 80 t/s con IQ4XS y 55 t/s con Q8 en una tarjeta de gama media segun el autor; el resto de combinaciones no se detalla.
- Contexto minimo recomendado: el autor sugiere al menos 8k tokens de ventana, especialmente para cuantizaciones IQ4/Q4 o inferiores.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Llama3.2-DeepHermes-3-3B-Preview-Reasoning-MAX-NEO-Imatrix-GGUF (esta ficha) | 3,2B | 128k | Apache 2.0 | GGUF (multiples quants) | Cuantizacion con MAXED + Neo Imatrix; modo thinking |
| NousResearch/DeepHermes-3-Llama-3-3B-Preview | 3,2B | 128k | Apache 2.0 | safetensors | Modelo base original; sin cuantizar; referencia de benchmarks |
| Llama 3.2 3B Instruct (Meta) | 3,2B | 128k | Licencia comunitaria Llama 3.2 | safetensors, GGUF | Modelo generalista sin modo thinking explicito |
| Modelos de razonamiento de 7-8B (p. ej. destilados de R1) | 7-8B | variable | variable | variable | Mayor coste de hardware; el autor afirma que este 3B "cierra la brecha", sin datos que lo respalden |

La comparativa se limita a lo que puede inferirse de la informacion disponible; no se dispone de mediciones de rendimiento comparativas para esta cuantizacion concreta.

## Limitaciones y advertencias

- No se han publicado benchmarks propios de esta cuantizacion; las afirmaciones de rendimiento cercano a modelos de 8B provienen del autor y no estan respaldadas por mediciones en la informacion disponible.
- Las capacidades de razonamiento dependen fuertemente de la cuantizacion: el autor advierte que IQ1 tiene rendimiento bajo e IQ2 es solo aceptable, con razonamiento reducido; para razonamiento recomienda IQ3 como minimo.
- Riesgo de alucinacion inherente a un modelo de 3,2B; el modo thinking puede producir cadenas de razonamiento plausibles pero incorrectas.
- Sesgos conocidos: no disponible (no se documentan en la model card).
- Idiomas soportados: no disponible; el comportamiento multilingue no esta documentado y podria ser limitado en un modelo de este tamano.
- La etiqueta "uncensored" implica que el modelo puede generar contenido sin filtros; requiere supervision en despliegues publicos.
- La licencia Apache 2.0 permite uso comercial, pero se hereda del modelo base y conviene verificar las condiciones del modelo original de NousResearch y de Llama 3.2.
- El prompt de sistema opcional recomendado por el autor incluye instrucciones extensas y un mecanismo de "20 agentes" que puede inflar la longitud de las respuestas y el consumo de tokens.
- El repositorio ocupa 59,1 GB por incluir todas las cuantizaciones; la descarga selectiva de un solo archivo es necesaria para uso practico.

## Enlaces

- Repositorio Hugging Face de esta cuantizacion: https://huggingface.co/DavidAU/Llama3.2-DeepHermes-3-3B-Preview-Reasoning-MAX-NEO-Imatrix-GGUF
- Modelo base original: https://huggingface.co/NousResearch/DeepHermes-3-Llama-3-3B-Preview
- Perfil del autor: https://huggingface.co/DavidAU
- Colecciones del autor: https://huggingface.co/DavidAU/collections
- FAQs y soporte del autor: https://huggingface.co/DavidAU/support
