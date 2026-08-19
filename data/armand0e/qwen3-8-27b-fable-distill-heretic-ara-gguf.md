# armand0e/Qwen3.8-27B-Fable-Distill-Heretic-ara-GGUF

## Resumen

El modelo `armand0e/Qwen3.8-27B-Fable-Distill-Heretic-ara-GGUF` es una versión "decensored" (sin censura) del modelo base `TeichAI/Qwen3.8-27B-Fable-Distill`, obtenida mediante la herramienta Heretic v1.2.0 con el método Arbitrary-Rank Ablation (ARA). El autor, armand0e, aplica una ablación de rango 2 sobre las proyecciones `attn.o_proj` y `mlp.down_proj` de las capas 30 a 64, lo que reduce drásticamente los rechazos a contenido dañino (de 91/100 en el original a 5/100) manteniendo una divergencia KL baja (0.1004) respecto al modelo sin modificar.

El modelo base es un modelo denso de 27.320 millones de parámetros, de tipo visión-lenguaje (image-text-to-text), con una ventana de contexto nativa de 262.144 tokens (según la guía de modelfit.io). Se distribuye en formato GGUF cuantizado, con un repositorio de 270.8 GB que incluye múltiples archivos de cuantización. Está orientado a ejecución local mediante llama.cpp y herramientas compatibles, y su naturaleza "uncensored" lo hace relevante para aplicaciones donde los modelos alineados rechazan ciertos contenidos, aunque con los riesgos asociados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso, visión-lenguaje (basado en Qwen3.8-27B) |
| Parametros totales | 27.320.697.856 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262.144 tokens (según el modelo base) |
| Tipos de cuantizacion | No especificados en la ficha; el repositorio contiene múltiples archivos GGUF (tamaño total 270.8 GB) |
| Idiomas soportados | No disponibles |
| Licencia | No disponible (el modelo base TeichAI/Qwen3.8-27B-Fable-Distill-GGUF indica Apache-2.0, pero este repo no la especifica) |
| Formato de pesos | GGUF (cuantizado) |

## Arquitectura y entrenamiento

El modelo es una modificación post-entrenamiento del modelo base `TeichAI/Qwen3.8-27B-Fable-Distill`, que a su vez es una destilación (Fable-Distill) de un modelo mayor de la familia Qwen3.8. La arquitectura subyacente es un transformer denso de 27B parámetros con capacidades multimodales (imagen y texto). La modificación aplicada aquí es una ablación de censura mediante Heretic v1.2.0 con el método Arbitrary-Rank Ablation (ARA), que resuelve una actualización de rango 2 en forma cerrada (sin descenso por gradiente) sobre las proyecciones `attn.o_proj` y `mlp.down_proj` de las capas 30 a 64. Los parámetros de ablación son: `start_layer_index=30`, `end_layer_index=64`, `overcorrect_relative_weight=4.62087`, `neighbor_count=128`, `rank=2`, `ridge=1`. No se ha realizado entrenamiento adicional; el proceso solo modifica los pesos existentes para eliminar los comportamientos de rechazo.

## Capacidades

- Procesamiento de imágenes y texto: al ser un modelo image-text-to-text, puede recibir imágenes como entrada y generar texto descriptivo o responder preguntas sobre ellas.
- Generación de texto: produce respuestas coherentes y contextualizadas en lenguaje natural.
- Razonamiento: al estar basado en Qwen3.8, se espera que mantenga capacidades de razonamiento lógico y matemático, aunque no se han publicado benchmarks específicos para esta variante.
- Decensored: la ablación reduce los rechazos a contenido dañino o sensible (5/100 refusals frente a 91/100 del original), lo que permite generar respuestas que otros modelos alineados bloquearían.
- Compatibilidad con llama.cpp: al estar en formato GGUF, se puede ejecutar con llama.cpp, Ollama, LM Studio y otras herramientas de inferencia local.
- No se dispone de información confirmada sobre tool calling, function calling, capacidades de agente o modo de pensamiento extendido.

## Casos de uso

- Investigación en seguridad de IA: estudiar el comportamiento de modelos sin alineación de seguridad, analizando cómo responden a prompts dañinos o extremos, útil para desarrollar mejores mecanismos de mitigación.
- Generación de contenido creativo sin restricciones: escritura de ficción, poesía o guiones que aborden temas tabú o controvertidos que los modelos censurados rechazan.
- Análisis de imágenes en dominios sensibles: descripción de imágenes médicas o forenses donde los modelos alineados se niegan a responder por políticas de contenido, en entornos controlados y legales.
- Asistentes conversacionales para nichos específicos: chatbots para comunidades que requieren un tono sin filtros (por ejemplo, roleplay adulto o discusión de temas políticamente incorrectos).
- Evaluación de robustez de modelos: comparar el rendimiento de esta variante frente al original para medir el impacto de la ablación en tareas generales.
- Despliegue local en hardware consumer: gracias al formato GGUF, puede ejecutarse en GPUs de 24 GB (como RTX 4090) o Mac con suficiente memoria unificada, permitiendo prototipado rápido sin depender de APIs externas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La única métrica proporcionada por el autor es la comparación con el modelo original en términos de divergencia KL y tasa de rechazos:

| Metrica | Este modelo | Modelo original (TeichAI/Qwen3.8-27B-Fable-Distill) |
| :------ | :---------: | :-------------------------------------------------: |
| **KL divergence** | 0.1004 | 0 *(por definicion)* |
| **Refusals** (sobre 100 prompts dañinos) | 5/100 | 91/100 |

La KL divergence se midió sobre prompts inofensivos de `mlabonne/harmless_alpaca`, y los rechazos se contaron sobre 100 prompts dañinos de `mlabonne/harmful_behaviors` (test[:100]).

## Requisitos de hardware

- VRAM estimada: para un modelo de 27B parámetros en GGUF, las cuantizaciones típicas requieren aproximadamente:
  - Q4_K_M: ~16-18 GB de VRAM.
  - Q5_K_M: ~18-20 GB de VRAM.
  - Q8_0: ~28-30 GB de VRAM.
  Estos valores son orientativos y dependen de la longitud de contexto y el tamaño del lote.
- GPUs recomendadas: RTX 4090 (24 GB) o superior para cuantizaciones bajas; A100 o H100 para cuantizaciones altas o contextos largos.
- Consumer GPU: sí, es posible ejecutarlo en GPUs de 24 GB con cuantización Q4 o Q5, y en Mac con 24 GB de memoria unificada (según la guía de modelfit.io).
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, y cualquier herramienta compatible con GGUF. También se puede usar vLLM convirtiendo los pesos a formato safetensors, aunque no es el flujo directo.
- Latencia y throughput: no se han publicado mediciones específicas para esta variante; dependerán del hardware y la cuantización elegida.

## Comparativa con modelos similares

La comparativa más directa es con el modelo base sin ablación. No se dispone de información sobre otros modelos "abliterated" comparables de 27B en el momento de redactar esta ficha.

| Modelo | Parametros | Contexto | Refusals (100 dañinos) | KL divergence | Licencia |
| :----- | :--------: | :------: | :--------------------: | :-----------: | :------: |
| armand0e/Qwen3.8-27B-Fable-Distill-Heretic-ara-GGUF | 27.32B | 262k | 5/100 | 0.1004 | No disponible |
| TeichAI/Qwen3.8-27B-Fable-Distill (original) | 27.32B | 262k | 91/100 | 0 | Apache-2.0 (según su repo GGUF) |

## Limitaciones y advertencias

- Al ser una versión "uncensored", el modelo puede generar contenido dañino, ofensivo, ilegal o éticamente problemático. Su uso debe limitarse a entornos controlados y legales.
- Riesgo de alucinación: como cualquier LLM, puede inventar información, especialmente en dominios especializados o con entradas ambiguas.
- La ablación puede degradar ligeramente el rendimiento general (KL divergence de 0.1004 indica una desviación medible respecto al original, aunque pequeña).
- La licencia no está especificada en este repositorio, lo que genera incertidumbre legal para uso comercial. Se recomienda contactar al autor o verificar la licencia del modelo base.
- No se dispone de información sobre idiomas soportados ni sobre la calidad del modelo en lenguas distintas del inglés.
- El tamaño del repositorio (270.8 GB) implica que la descarga completa es pesada; se recomienda seleccionar solo la cuantización deseada.
- No hay benchmarks estándar publicados, por lo que el rendimiento en tareas específicas (razonamiento, código, matemáticas) no está validado.

## Enlaces

- Repositorio del modelo: https://huggingface.co/armand0e/Qwen3.8-27B-Fable-Distill-Heretic-ara-GGUF
- Modelo base (sin ablación): https://huggingface.co/TeichAI/Qwen3.8-27B-Fable-Distill
- Repositorio GGUF del modelo base: https://huggingface.co/TeichAI/Qwen3.8-27B-Fable-Distill-GGUF
- Herramienta Heretic: https://github.com/p-e-w/heretic
- Guía para ejecutar Qwen3.8-27B localmente (modelfit.io): https://modelfit.io/blog/run-qwen38-27b-locally-2026/
- Blog de AMD sobre soporte Day 0: https://www.amd.com/en/blogs/2026/run-qwen-3-8-27b-on-amd-ryzen-ai-max-and-radeon-graphics-cards-day-0.html
- LLM Explorer (ficha del modelo base): https://llm-explorer.com/model/TeichAI%2FQwen3.8-27B-Fable-Distill,23OhmOa6RJTO53XCLMLoi4
