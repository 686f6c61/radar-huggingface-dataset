# believe-it-or-not/2stage_const_probes_original_augmented_original_egregious_berlin_wall-b5d19dbc

## Resumen

Este repositorio no contiene un modelo de lenguaje completo, sino un adaptador PEFT (LoRA) entrenado sobre `togethercomputer/Meta-Llama-3.3-70B-Instruct-Reference`. El identificador del repositorio (`2stage_const_probes_original_augmented_original_egregious_berlin_wall-b5d19dbc`) sugiere un artefacto experimental de investigación, probablemente relacionado con probing de representaciones internas o con experimentos de comportamiento ("berlin_wall", "egregious", "probes"), más que con un modelo destinado a uso general.

El autor, `believe-it-or-not`, publica el adaptador sin model card sustantiva: la práctica totalidad de los campos del README son plantillas sin rellenar (`[More Information Needed]`). No hay información sobre el conjunto de datos de entrenamiento, la metodología, la licencia ni las capacidades resultantes. El repositorio tiene 0 descargas y 0 likes, lo que apunta a un artefacto de investigación de escasa difusión.

Por tanto, esta ficha describe el adaptador y su modelo base, pero debe leerse con cautela: cualquier uso en producción requeriría auditoría previa del adaptador y validación empírica de su comportamiento, dado que no existe documentación del autor sobre qué modifica el LoRA respecto al modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador PEFT (LoRA) sobre transformer decoder-only (modelo base Llama 3.3) |
| Parametros totales | No disponible para el adaptador; el modelo base Llama 3.3 70B tiene 70 mil millones |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en el adaptador; el modelo base Llama 3.3 70B soporta 128 000 tokens |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors; la cuantizacion aplica al modelo base) |
| Idiomas soportados | No disponibles en la documentacion del adaptador; el modelo base es multilingue |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El repositorio contiene exclusivamente pesos de adaptador en formato PEFT (versión de framework declarada: PEFT 0.15.1), con un tamaño de repo de 1,7 GB. Se infiere una configuración LoRA de rango relativamente alto o aplicada a muchas capas, dado el tamaño del artefacto en comparación con adaptadores LoRA típicos de pocos cientos de MB. No se especifica el rango, el alpha, las capas objetivo ni la tasa de aprendizaje.

No hay información sobre el dataset de entrenamiento, el número de tokens vistos, la composición de los datos ni si se emplearon técnicas de alineamiento adicionales (RLHF, DPO). El nombre del repositorio sugiere dos etapas ("2stage"), probes de constantes ("const_probes"), datos originales aumentados ("original_augmented") y un caso etiquetado como "egregious" con referencia a "berlin_wall", pero se trata de inferencias a partir del identificador y no de información documentada. El modelo base, Llama 3.3 70B Instruct, es un transformer decoder-only con atención por grupos (GQA) y 128 000 tokens de contexto, entrenado por Meta con datos multilingües y ajuste por instrucciones.

## Capacidades

- No hay documentación del autor sobre las capacidades específicas del adaptador.
- El modelo base Llama 3.3 70B Instruct soporta generación de texto, razonamiento, código, matemáticas y uso multilingüe.
- El modelo base soporta tool calling y function calling, así como flujos de agente multi-paso.
- El adaptador podría alterar el comportamiento del modelo base en dominios concretos (probes, respuestas condicionadas), pero no se especifica cuáles ni cómo.
- No se documenta soporte de visión, audio ni modo de razonamiento explícito (thinking) en el adaptador.

## Casos de uso

- Investigación en interpretabilidad: cargar el adaptador sobre Llama 3.3 70B para reproducir experimentos de probing de representaciones internas, dado el nombre del repositorio y su naturaleza de artefacto de investigación.
- Estudio de comportamiento condicionado: analizar cómo un LoRA concreto modifica las respuestas del modelo base en escenarios específicos, comparando salidas con y sin adaptador.
- Reproducibilidad de experimentos académicos: usar el adaptador como referencia para replicar resultados de un paper o estudio no documentado en la model card.
- Evaluación de robustez y seguridad: someter el adaptador a pruebas de red-teaming para detectar comportamientos "egregious" (según el nombre del repo) antes de cualquier uso.
- Docencia e investigación sobre PEFT: emplear el artefacto como ejemplo práctico de adaptadores LoRA de gran tamaño sobre modelos de 70B.
- No se recomienda su uso en producción, atención al cliente, generación de código ni aplicaciones finales sin una auditoría exhaustiva previa, dada la ausencia total de documentación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El adaptador en sí ocupa 1,7 GB en disco y requiere cargar el modelo base Llama 3.3 70B para su uso.
- Inferencia del modelo base en FP16/BF16: aproximadamente 140 GB de VRAM, lo que exige múltiples GPU (por ejemplo, 2× H100 80GB o 4× A100 40GB).
- Cuantización a 8 bits: en torno a 70-80 GB de VRAM, viable en una H100 80GB o en configuraciones multi-GPU.
- Cuantización a 4 bits (GPTQ/AWQ/GGUF Q4): aproximadamente 40-45 GB de VRAM, posible en 2× RTX 4090 (24 GB cada una) o en una A100 80GB.
- No cabe en una única GPU de consumo (RTX 4090, 24 GB) ni siquiera en 4 bits sin offloading a CPU/RAM.
- Opciones de despliegue: vLLM, TGI, llama.cpp (con conversión a GGUF del modelo base y fusión del adaptador), Ollama (previo merge), además de carga directa con `peft` y `transformers`.
- Latencia y throughput: no disponibles para este adaptador; dependen enteramente del backend y del hardware del modelo base.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (sobre Llama 3.3 70B) | 70B (base) | 128 000 (base) | LoRA PEFT | No disponible | Hugging Face, 0 descargas |
| Meta-Llama-3.3-70B-Instruct | 70B | 128 000 | Modelo completo | Llama 3.3 Community License | Amplia, muy difundido |
| Adaptadores LoRA públicos sobre Llama 3.1/3.3 | Variable | 128 000 (base) | LoRA PEFT | Variable según autor | Hugging Face, amplia gama |
| Qwen2.5-72B-Instruct | 72B | 131 072 | Modelo completo | Apache 2.0 (mayoría de variantes) | Amplia, muy difundido |

No se dispone de datos de rendimiento del adaptador que permitan una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- Ausencia total de documentación: la model card es una plantilla sin rellenar, por lo que se desconoce qué hace el adaptador y con qué datos se entrenó.
- Licencia no especificada: no se puede garantizar el uso comercial ni la redistribución; además, el modelo base Llama 3.3 está sujeto a la Llama 3.3 Community License, que impone restricciones adicionales.
- Riesgo elevado de comportamiento impredecible: un LoRA sin documentar puede degradar el alineamiento del modelo base o introducir sesgos y respuestas no deseadas.
- Riesgo de alucinación: heredado del modelo base y potencialmente amplificado por el ajuste del adaptador.
- Idiomas y dominio: no documentados; el comportamiento multilingüe del adaptador es desconocido.
- Repositorio sin tracción (0 descargas, 0 likes): no hay evidencia de validación por parte de la comunidad.
- No apto para producción sin auditoría previa, evaluación de seguridad y verificación de la licencia aplicable.
- El nombre del repositorio sugiere contenido sensible o experimental ("egregious", "berlin_wall"); conviene tratarlo con precaución.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/believe-it-or-not/2stage_const_probes_original_augmented_original_egregious_berlin_wall-b5d19dbc
- Modelo base: https://huggingface.co/togethercomputer/Meta-Llama-3.3-70B-Instruct-Reference
- Paper de referencia sobre impacto ambiental citado en la model card (Lacoste et al., 2019): https://arxiv.org/abs/1910.09700
- Documentación de PEFT: https://huggingface.co/docs/peft
