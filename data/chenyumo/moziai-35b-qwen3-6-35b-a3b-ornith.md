# chenyumo/moziAI-35B-Qwen3.6-35B-A3B-Ornith

## Resumen

MoziAier-35B-V3.9 (publicado en Hugging Face bajo el identificador `chenyumo/moziAI-35B-Qwen3.6-35B-A3B-Ornith`) es un modelo de lenguaje multimodal de tipo Mixture-of-Experts (MoE) desarrollado por el equipo de Chen Yumo, orientado al dominio financiero y al despliegue local en hardware de consumo. Con 34.660.610.688 parámetros totales (aproximadamente 35B), el modelo parte de la arquitectura Qwen3.6-35B-A3B y toma como base `ornith-ai/Ornith-1.5-35B-A3B` (referenciado en la model card como Occamy-1.0-35B-A3B). Soporta texto, visión y tool calling, con una ventana de contexto de 256K tokens (262.144).

La propuesta diferencial del modelo no es tanto el rendimiento bruto como la eficiencia de despliegue: emplea una cuantización híbrida propia denominada MoziSmartBit (capas de expertos en IQ3_XXS con imatrix de occamy) que reduce el fichero principal a 12,99 GB, frente a los 21-22 GB habituales de un Q4_K_M para el mismo tamaño. Según el autor, esto permite ejecutar el modelo desde 8 GB de VRAM con offload a RAM del sistema, y cubrir un contexto de 192K en una GPU de 16 GB. La pérdida de calidad declarada por cuantización es de PPL 8,3044, un +0,47 % respecto a BF16.

El foco funcional es el trabajo de horizonte largo (long-horizon): tareas agénticas con decenas de llamadas a herramientas, análisis de documentos extensos y trabajo de ingeniería multi-fichero sobre contexto de clase 250K. Incluye además una plantilla de chat embebida en el propio GGUF, capacidades multilingües con especial énfasis en chino, y una metodología de razonamiento en siete dimensiones con mecanismo LOOP de autoverificación. La licencia se declara como "other" en la ficha de Hugging Face, mientras que la model card afirma uso comercial libre; esta discrepancia debe verificarse antes de cualquier despliegue en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (MoE), arquitectura Qwen3.6-35B-A3B |
| Parametros totales | 34.660.610.688 (aproximadamente 35B) |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens (256K) |
| Tipos de cuantizacion | MoziSmartBit híbrida (IQ3_XXS en capas de expertos + imatrix occamy); mmproj de visión en Q8_0; KV cache recomendada q4_0 |
| Idiomas soportados | en, zh (chino especialmente ajustado según el autor) |
| Licencia | other (la model card declara uso comercial libre; verificar) |
| Formato de pesos | GGUF (librería llama-cpp); plantilla de chat embebida en `tokenizer.chat_template` |
| Modelo base | ornith-ai/Ornith-1.5-35B-A3B (Occamy-1.0-35B-A3B) |
| Tamaño del fichero principal | 12,99 GB (IQ3_XXS híbrida) |
| Tamaño del proyector de visión | 0,57 GB (mmproj Q8_0) |
| Tamaño total del repo | 62,3 GB |
| Pérdida por cuantización | PPL 8,3044 (+0,47 % vs BF16) |
| Decodificación especulativa | No soportada (sin cabecera MTP; debe desactivarse) |
| VRAM mínima | 8 GB (con offload a RAM) |
| VRAM recomendada | 16 GB (192K de contexto) / 24 GB o más (250K + visión) |

## Arquitectura y entrenamiento

El modelo es un transformer de tipo Mixture-of-Experts con la arquitectura Qwen3.6-35B-A3B, lo que implica un total de aproximadamente 35B parámetros con activación dispersa por token (el número exacto de parámetros activos no se detalla en la información disponible). Sobre la base Occamy-1.0-35B-A3B, el equipo aplica su propia metodología de entrenamiento, que combina un marco de razonamiento en siete dimensiones y un mecanismo de agente denominado LOOP, orientado a la autoverificación en tareas complejas. No se especifican en la información proporcionada el volumen de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO.

La innovación técnica más destacable es la cuantización híbrida MoziSmartBit, que aplica IQ3_XXS a las capas de expertos junto con una imatrix específica (occamy), logrando una reducción de aproximadamente 9 GB frente a un Q4_K_M convencional con una pérdida de perplejidad declarada de solo el 0,47 %. El modelo incorpora además un proyector multimodal separado (mmproj Q8_0) para visión, y la plantilla de chat va escrita directamente en los metadatos del GGUF, eliminando la necesidad de un fichero jinja externo. No dispone de cabecera MTP, por lo que la decodificación especulativa debe permanecer desactivada.

## Capacidades

- Generación de texto conversacional multi-turno con ventana de 256K tokens.
- Razonamiento estructurado mediante un marco de siete dimensiones que adapta la profundidad del pensamiento a la complejidad de la tarea.
- Mecanismo LOOP de agente con autoverificación para tareas de varios pasos.
- Tool calling y function calling, con formato correcto en llamadas simples y múltiples, incluyendo llamadas en paralelo.
- Ejecución de tareas de horizonte largo: decenas de llamadas a herramientas encadenadas sin pérdida de coherencia sobre contexto de clase 250K.
- Visión: lectura de capturas de pantalla locales y de gráficos mediante el proyector mmproj Q8_0.
- Conocimiento y razonamiento de dominio financiero: Q&A financiera y codificación de estrategias cuantitativas.
- Capacidades multilingües con inglés y chino, con ajuste específico para chino.
- Modo sin censura declarado por el autor (etiqueta `uncensored`).
- Compatibilidad con endpoints de API (etiqueta `endpoints_compatible`).

## Casos de uso

- Análisis de documentos financieros extensos: informes anuales, prospectos o transcripciones de resultados que superan el contexto habitual de otros modelos; los 256K tokens permiten cargar el documento completo y hacer preguntas cruzadas sin fragmentación por RAG.
- Agentes de investigación multi-paso: el mecanismo LOOP y el soporte de tool calling en paralelo permiten encadenar decenas de llamadas (búsqueda, cálculo, consulta a bases de datos) manteniendo el hilo sobre contexto de clase 250K, adecuado para pipelines de análisis automatizado.
- Asistente de codificación de estrategias cuantitativas: generación y revisión de código de backtesting y señales financieras, con capacidad de razonar sobre varios ficheros de un proyecto dentro de la misma ventana de contexto.
- Despliegue en estaciones de trabajo con GPU de consumo: al caber en 16 GB de VRAM con 192K de contexto y KV cache q4_0, es viable en una RTX 4090 o similar para uso individual o de equipo pequeño sin infraestructura de centro de datos.
- Procesamiento de capturas y gráficos: la entrada de visión permite extraer datos de gráficos de cotización o de capturas de pantallas de terminales y convertirlos en texto estructurado o tablas.
- Atención al cliente o soporte interno en chino e inglés: conversaciones multi-turno con contexto largo para consultar histórico de incidencias o documentación interna, con la ventaja de ejecución local que evita enviar datos sensibles a terceros.
- Entornos con requisitos de privacidad: al ser desplegable íntegramente en local mediante llama.cpp u Ollama, encaja en escenarios donde los datos financieros no pueden salir de la infraestructura propia.

## Benchmarks y rendimiento

La model card indica que la evaluación sigue la línea base de Occamy-1.0 (MMLU, GSM8K, HumanEval y otros), pero no publica los valores numéricos de dichos benchmarks. Los únicos datos cuantitativos disponibles son los siguientes:

| Metrica | Resultado |
|---|---|
| Perplejidad tras cuantización | 8,3044 (+0,47 % vs BF16) |
| Test de estrés de contexto largo | Superado en contexto de clase 250K, con recuperación precisa de hechos plantados |
| Tool calling | Formato correcto en simple y multi-turno; llamadas en paralelo soportadas |
| Visión | Comprensión de capturas y lectura de gráficos verificadas |

No se han publicado resultados numéricos de MMLU, GSM8K, HumanEval u otros benchmarks en la información disponible.

## Requisitos de hardware

- VRAM mínima: 8 GB, con offload de capas a RAM del sistema (funciona, pero más lento); contexto resultante de 16K-32K con KV cache q4_0.
- 12 GB de VRAM: contexto de 64K-128K con KV cache q4_0, suficiente para Q&A de documentos diario.
- 16 GB de VRAM: contexto de 192K recomendado (unos 0,4 GB de margen); 250K medido en aproximadamente 15,5 GB, al límite.
- 24 GB o más: contexto de 256K con visión, escenario más seguro.
- La KV cache debe ser q4_0; con q8_0 el consumo de VRAM impide que quepa en una tarjeta de 16 GB.
- Opciones de despliegue: llama.cpp (`llama-server`), Ollama, LM Studio y Jan. El ejemplo del autor usa `-ngl 999`, `-ctk q4_0 -ctv q4_0 -fa on` y `--jinja`, en el puerto 20016.
- No debe pasarse `--chat-template-file`, ya que la plantilla está embebida en el GGUF y un fichero externo la sobrescribiría.
- Decodificación especulativa: debe permanecer desactivada (no hay cabecera MTP).
- Parámetros recomendados: temperature 0,6-0,7; top_p 0,9-0,95; top_k 20; repeat_penalty 1,0-1,05; un solo slot paralelo.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion tipica | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MoziAier-35B-V3.9 (este) | 34,66B MoE | 256K | IQ3_XXS híbrida, 12,99 GB | other (uso comercial declarado en model card) | GGUF en Hugging Face, ModelScope y GitHub |
| Ornith-1.5-35B-A3B (base) | 35B MoE | no disponible | no disponible | no disponible | Hugging Face |
| Occamy-1.0-35B-A3B (arquitectura Qwen3.6) | 35B MoE | no disponible | no disponible | no disponible | no disponible |
| Build Q4_K_M equivalente del mismo 35B MoE | 35B MoE | según base | Q4_K_M, 21-22 GB | según base | genérico |

La comparación cuantitativa de rendimiento frente a alternativas no está disponible: la model card no publica cifras de benchmarks que permitan contrastar con otros modelos de la misma categoría.

## Limitaciones y advertencias

- La licencia figura como "other" en Hugging Face mientras la model card afirma "free for commercial use"; es imprescindible verificar los términos reales antes de un despliegue comercial.
- La cuantización IQ3_XXS, aunque híbrida, es agresiva: la pérdida declarada de PPL es pequeña (+0,47 %), pero no se han publicado evaluaciones de benchmarks que confirmen que la degradación se mantiene baja en tareas de razonamiento y código.
- No hay datos publicados sobre sesgos; al estar entrenado con especial énfasis en chino y en dominio financiero, es esperable un sesgo de dominio y de idioma, aunque no cuantificado en la información disponible.
- Riesgo de alucinación inherente a los modelos generativos, especialmente crítico en contexto financiero; la model card no documenta mecanismos de mitigación medidos.
- La etiqueta `uncensored` implica que el modelo puede generar contenido sin los filtros habituales; requiere salvaguardas propias en producción.
- El contexto de 250K en 16 GB de VRAM está al límite (15,5 GB medidos) y el propio autor recomienda probarlo; no es una configuración estable garantizada.
- La decodificación especulativa no está soportada, lo que limita las optimizaciones de latencia disponibles.
- Solo se declaran inglés y chino; el rendimiento en castellano no está documentado.
- El repositorio ocupa 62,3 GB, muy por encima del fichero principal de 12,99 GB, lo que puede complicar la descarga selectiva.
- El modelo se distribuye únicamente en GGUF para llama.cpp; no hay safetensors ni pesos BF16 publicados en la información disponible.

## Enlaces

- Hugging Face: https://huggingface.co/chenyumo/moziAI-35B-Qwen3.6-35B-A3B-Ornith
- Modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B
- ModelScope y GitHub: mencionados en la model card como canales de descarga, sin URL concreta en la información disponible.
