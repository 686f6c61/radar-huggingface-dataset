# prateekfr/qwen3-1.7b-no-e-lora

## Resumen

Qwen3-1.7B Lipogram es un adaptador LoRA (PEFT) sobre el modelo base Qwen3-1.7B, entrenado para generar texto en ingles que nunca contenga la letra "e" ni "E" (un lipograma estricto). Lo desarrolla el usuario prateekfr y esta publicado en Hugging Face con licencia Apache 2.0. El problema que resuelve es la generacion condicionada a nivel de caracter: se trata de un ejercicio de alineamiento mediante RL (GRPO) para forzar una restriccion lexica dura que un modelo base no respeta de forma fiable.

El modelo no introduce una arquitectura nueva: reutiliza el transformer decoder de Qwen3-1.7B (1.700 millones de parametros, contexto nativo de Qwen3 de 32.768 tokens) y anade un adaptador LoRA entrenado con QLoRA 4-bit sobre 180 pares de instrucciones curadas sin la letra "e", seguido de optimizacion con Group Relative Policy Optimization. La restriccion se aplica en inferencia mediante una mascara booleana sobre logits que bloquea 103.639 tokens (68,33% del vocabulario de Qwen3).

Es relevante como referencia tecnica para quien trabaja con generacion restringida (constrained decoding), post-entrenamiento con RL y evaluacion de fidelidad a restricciones duras: demuestra que una mascara de logits sola no basta (88% de cumplimiento estricto pero solo 28% de respuestas usables en el modelo base) y que SFT + GRPO elevan la tasa util al 88% manteniendo 100% de cumplimiento estricto. El tamano reducido (repo de 0,1 GB) lo hace facil de reproducir en hardware modesto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (Qwen3-1.7B) + adaptador LoRA (PEFT); decodificacion con mascara de logits sobre el vocabulario |
| Parametros totales | 1.700 millones (modelo base Qwen3-1.7B); el adaptador LoRA anade un numero de parametros no especificado en la model card |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la model card; el modelo base Qwen3-1.7B soporta 32.768 tokens nativos (dato del modelo base, no confirmado para este adaptador) |
| Tipos de cuantizacion | Entrenamiento en QLoRA 4-bit; inferencia del ejemplo en bfloat16; cuantizaciones GGUF/AWQ no publicadas |
| Idiomas soportados | en (ingles); el lipograma esta definido solo para ingles |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); requiere cargar el modelo base Qwen/Qwen3-1.7B por separado |

## Arquitectura y entrenamiento

El adaptador se monta sobre Qwen3-1.7B, un transformer decoder denso con atencion por causalidad estandar. El pipeline de post-entrenamiento descrito en la model card tiene tres capas: (1) enmascaramiento de logits con una mascara booleana precalculada que bloquea 103.639 tokens del vocabulario de Qwen3, es decir, el 68,33% de las entradas; (2) SFT con QLoRA 4-bit sobre 180 pares instruccion-respuesta verificados manualmente y libres de la letra "e"; (3) RL con GRPO optimizando tres objetivos: fluidez de la respuesta, consistencia de longitud y diversidad lexica.

La innovacion destacable es la combinacion de constrained decoding a nivel de token con alineamiento por refuerzo: la mascara garantiza el cumplimiento estricto de la restriccion, mientras que GRPO ensena al modelo a producir respuestas utiles dentro de ese espacio de tokens permitido. La model card documenta explicitamente que el modelo base con mascara tiende a sustituir tokens por equivalentes en otros idiomas para evadir la restriccion, problema que el SFT corrige.

## Capacidades

- Generacion de texto en ingles bajo restriccion lexica estricta: prohibicion total de la letra "e" o "E" (lipograma).
- Cumplimiento estricto de la restriccion reportado al 100% en la configuracion RL + mascara sobre el benchmark Gadsby.
- Generacion de respuestas usables (fluidas y gramaticales) dentro del espacio permitido: 88% de tasa util reportada.
- Diversidad lexica medida por n-gramas: 92,5% en la configuracion final.
- Sigue instrucciones generales del modelo base Qwen3-1.7B (formato de chat con tokens `<|im_start|>` y `<|im_end|>`).
- No se documentan capacidades de tool calling, agentes, vision, audio ni modo thinking especificas de este adaptador.
- Capacidad multilingue limitada al ingles por diseno; el modelo base es multilingue, pero el adaptador esta entrenado solo para ingles.

## Casos de uso

- Generacion de texto restringido por reglas editoriales: produccion de parrafos, titulares o copys que deben evitar una letra o palabra concreta, usando la mascara de logits para garantizar el cumplimiento y el adaptador para mantener fluidez.
- Evaluacion de tecnicas de constrained decoding: banco de pruebas para comparar mascara de logits sola frente a mascara + SFT + GRPO, con las metricas del benchmark Gadsby como referencia reproducible.
- Investigacion en post-entrenamiento con RL: caso de estudio de GRPO aplicado a una recompensa verificable y objetiva (ausencia de la letra "e"), util para disenar pipelines de RL con verificadores deterministas.
- Generacion de puzzles y contenido ludico: lipogramas, acrosticos y juegos de palabras para aplicaciones de entretenimiento o educativas, donde la restriccion es parte del valor del producto.
- Filtrado y sustitucion lexica en pipelines de NLP: prototipo para estudiar como un modelo reescribe texto evitando caracteres prohibidos, por ejemplo en normalizacion de contenido o anonymizacion de terminos.
- Demostracion docente de alineamiento: ejemplo didactico de como SFT corrige el evasion multilingue del modelo base (de 28% a 80% de respuestas usables) y como RL cierra la brecha hasta 88%.
- Pruebas de robustez de evaluadores automaticos: validacion de metricas de fidelidad a restricciones (pass rate estricto, tasa util, diversidad n-grama) contra un modelo con comportamiento conocido.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre el Gadsby Benchmark Suite:

| Etapa de arquitectura | Lipograma estricto (pass) | Tasa de respuesta util | Diversidad n-grama |
|---|---|---|---|
| Qwen-1.7B base + mascara | 88,0% | 28,0% | 91,5% |
| SFT (180 reescrituras) + mascara | 96,0% | 80,0% | 91,5% |
| RL (GRPO best) + mascara | 100,0% | 88,0% | 92,5% |

Nota de la model card: la tasa util del modelo base refleja respuestas en ASCII ingles puro; los modelos base sin alinear intentan sustituciones con tokens de otros idiomas para evadir la restriccion. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base Qwen3-1.7B en bfloat16 ocupa aproximadamente 3,4 GB de pesos; con cache KV y overhead de runtime, unos 4-6 GB para contextos moderados. El adaptador LoRA anade una cantidad marginal (repo de 0,1 GB).
- Cabe en GPU de consumo: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090 24 GB, entre otras, con margen amplio. Tambien puede ejecutarse en GPUs de 8 GB con cuantizacion del modelo base.
- GPU recomendadas para produccion o lotes grandes: A100 40/80 GB, H100 80 GB, L40S 48 GB; para este tamano son sobredimensionadas y el beneficio principal es el throughput por lote.
- Opciones de despliegue: el ejemplo oficial usa `transformers` + `peft` con `device_map="auto"` y un bucle de decodificacion manual que aplica la mascara de logits token a token. La mascara debe implementarse en el runtime elegido; vLLM, TGI o llama.cpp no aplican esta mascara por defecto, por lo que requeririan logit processors o custom sampling.
- Latencia y throughput: no disponibles en la informacion proporcionada. El bucle de generacion manual del ejemplo (una pasada forward por token, sin cache KV explicita en el codigo mostrado) es considerablemente mas lento que una decodificacion optimizada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-1.7B Lipogram (este adaptador) | 1,7B + LoRA | no disponible (base: 32.768) | Lipograma sin "e", SFT + GRPO + mascara de logits | Apache 2.0 | Hugging Face (0 descargas, 0 likes en el momento de la consulta) |
| Qwen/Qwen3-1.7B (base) | 1,7B | 32.768 | Modelo generalista multilingue | Apache 2.0 | Hugging Face, ampliamente usado |
| Adaptadores LoRA comunitarios para Qwen3-1.7B | 1,7B + LoRA | depende del adaptador | Fine-tuning de tarea o estilo | variable | Hugging Face |
| Modelos de generacion restringida (constrained decoding con librerias tipo Outlines/Guidance) | variable | variable | Restriccion por gramatica/regex en decodificacion, sin RL | variable | Librerias open source |

No se dispone de datos de rendimiento comparables para alternativas especificas de lipograma; la comparacion con modelos generalistas debe hacerse solo en cumplimiento de la restriccion, no en calidad global.

## Limitaciones y advertencias

- Rendimiento util limitado: incluso la mejor configuracion deja un 12% de respuestas no usables (88% de tasa util), segun la propia model card.
- Solo ingles: la restriccion y el entrenamiento estan definidos para ingles; el modelo base es multilingue, pero el adaptador no esta alineado para otras lenguas.
- Dependencia de la mascara de logits: sin aplicar la mascara en inferencia, el adaptador no garantiza el cumplimiento del lipograma. Cualquier runtime que no permita interceptar logits (vLLM/TGI por defecto) requiere trabajo adicional.
- Riesgo de alucinacion y degradacion gramatical: forzar la ausencia de una letra muy frecuente en ingles puede producir frases artificiales, circunloquios o errores gramaticales; el benchmark mide fluidez solo de forma agregada.
- Sesgos: no se documentan evaluaciones de sesgo; el dataset de SFT es muy pequeno (180 pares), lo que aumenta el riesgo de sobreajuste al estilo de esos ejemplos.
- Licencia Apache 2.0: permite uso comercial, pero debe respetarse tambien la licencia del modelo base Qwen3-1.7B y citar autor y atribuciones indicadas en la model card.
- Madurez: repositorio con 0 descargas y 0 likes en el momento de la consulta, creado en noviembre de 2026; no hay evidencia de uso en produccion ni de mantenimiento continuado.
- El benchmark Gadsby es propio del autor y no esta validado externamente; sus metricas no son directamente comparables con benchmarks estandar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/prateekfr/qwen3-1.7b-no-e-lora
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Libreria PEFT: https://github.com/huggingface/peft
- Libreria Transformers: https://github.com/huggingface/transformers
- No se han encontrado en la informacion proporcionada papers, blogs, repositorios adicionales ni demos del autor.
