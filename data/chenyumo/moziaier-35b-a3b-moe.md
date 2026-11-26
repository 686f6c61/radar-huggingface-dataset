# chenyumo/MoziAier-35B-A3B-MOE

## Resumen

MoziAier-35B-A3B-MOE (publicado como MoziAier-35B-V3.9) es un modelo de lenguaje multimodal de tipo Mixture of Experts (MoE) desarrollado por el equipo de Chen Yumo, orientado al dominio financiero y al despliegue local en hardware de consumo. Se construye sobre el modelo base Occamy-1.0-35B-A3B, que sigue la arquitectura Qwen3.6-35B-A3B, y añade una metodología de entrenamiento propia, un marco de razonamiento estructurado en siete dimensiones y un mecanismo de agente denominado LOOP.

La versión V3.9 (23 de noviembre de 2026) se centra en tareas de horizonte largo: ejecución estable de tareas multi-paso sobre una ventana de contexto de clase 250K, útil para agentes que encadenan decenas de llamadas a herramientas o analizan documentos extensos. Incorpora además visión (comprensión de capturas de pantalla y gráficos) y soporte de tool calling en formato correcto de turno único y multi-turno.

Su rasgo más distintivo es la cuantización híbrida propietaria MoziSmartBit (capas de expertos en IQ3_XXS con imatrix propia), que reduce el fichero principal a 12,99 GB frente a los 21-22 GB de un Q4_K_M típico del mismo modelo, permitiendo arrancar desde 8 GB de VRAM con offload a RAM del sistema. El modelo se distribuye en formato GGUF con plantilla de chat embebida y licencia de uso comercial gratuito.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE (Qwen3.6-35B-A3B, base Occamy-1.0-35B-A3B) |
| Parámetros totales | 34.660.610.688 (35B) |
| Parámetros activos | no disponible |
| Longitud de contexto | 262.144 tokens (256K) |
| Tipos de cuantización | MoziSmartBit híbrida (expertos IQ3_XXS + imatrix occamy); KV cache q4_0 (obligatorio) |
| Idiomas soportados | en, zh (chino especialmente ajustado) |
| Licencia | other (uso comercial gratuito según la model card) |
| Formato de pesos | GGUF (llama.cpp); mmproj Q8_0 para visión |
| Tamaño del fichero principal | 12,99 GB (IQ3_XXS híbrida) |
| Fichero de visión | 0,57 GB (mmproj Q8_0) |
| Plantilla de chat | Embebida en el GGUF (`tokenizer.chat_template`) |
| Pérdida de cuantización | PPL 8,3044 (+0,47 % frente a BF16) |
| Decodificación especulativa | No soportada (sin cabecera MTP; debe desactivarse) |
| VRAM mínima | 8 GB (con offload a RAM) |
| VRAM recomendada | 16 GB (192K) / 24 GB+ (256K + visión) |

## Arquitectura y entrenamiento

El modelo es un transformer con capas de mezcla de expertos (MoE) de 35B parámetros totales, construido sobre Occamy-1.0-35B-A3B, que a su vez adopta la arquitectura Qwen3.6-35B-A3B. El número de parámetros activos por token no se detalla en la información disponible. Sobre esa base, el equipo aplica su propia metodología de entrenamiento, un marco de razonamiento en siete dimensiones que adapta la profundidad del pensamiento estructurado a la complejidad de la tarea, y un mecanismo de agente LOOP orientado a la autoverificación en tareas complejas.

No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO. La innovación técnica más destacable es la cuantización híbrida MoziSmartBit, que combina capas de expertos en IQ3_XXS con una imatrix propia (occamy) para rebajar el peso en disco unos 9 GB respecto a un Q4_K_M convencional con una pérdida de perplejidad de solo el 0,47 % frente a BF16. El modelo no incorpora cabecera MTP, por lo que la decodificación especulativa debe permanecer desactivada.

## Capacidades

- Generación de texto y razonamiento estructurado con marco de siete dimensiones adaptado a la complejidad de la tarea.
- Ejecución de tareas de horizonte largo (long-horizon) con mecanismo LOOP de autoverificación en cadenas multi-paso.
- Tool calling / function calling con formato correcto en turno único y multi-turno, incluidas llamadas en paralelo.
- Capacidades de agente: decenas de llamadas a herramientas encadenadas sin perder el hilo sobre contexto de clase 250K.
- Visión: lectura de capturas de pantalla locales y comprensión de gráficos mediante el proyector mmproj Q8_0.
- Dominio financiero: preguntas y respuestas financieras y codificación de estrategias cuantitativas.
- Multilingüe limitado a inglés y chino, con ajuste especial en chino.
- Modelo "uncensored" según las etiquetas del autor (sin filtros de rechazo declarados).
- Plantilla de chat embebida en el GGUF, sin necesidad de fichero jinja externo.

## Casos de uso

- Análisis de documentos financieros extensos: informes anuales o prospectos de cientos de páginas caben en la ventana de 256K tokens, permitiendo extracción de cifras y comparación entre secciones sin troceado.
- Agentes de investigación multi-paso: el mecanismo LOOP y el soporte de tool calling en paralelo permiten encadenar decenas de consultas a APIs o bases de datos manteniendo coherencia sobre contexto largo.
- Generación de código para estrategias cuantitativas: el ajuste en dominio financiero y el soporte de function calling lo hacen apto para producir y validar scripts de backtesting integrados en pipelines.
- Asistencia al cliente especializada en banca: conversaciones multi-turno con contexto de hasta 192K tokens en una GPU de 16 GB, recordando el histórico completo de la interacción.
- Lectura de gráficos y capturas de pantalla: con el proyector de visión puede interpretar dashboards financieros o capturas de terminales de trading y responder preguntas sobre ellos.
- Despliegue en estaciones de trabajo modestas: con 8 GB de VRAM y offload a RAM del sistema sirve como asistente local para preguntas y respuestas sobre documentación interna.
- Procesamiento por lotes de documentación en chino: el ajuste específico en chino lo hace adecuado para resúmenes y extracción de entidades en corpus en ese idioma.

## Benchmarks y rendimiento

La model card indica que la evaluación sigue la línea base de Occamy-1.0 e incluye MMLU, GSM8K, HumanEval y otras pruebas, pero no publica los valores numéricos en la información disponible. Los únicos datos cuantitativos facilitados son los siguientes:

| Métrica | Resultado |
|---|---|
| Perplejidad tras cuantización | 8,3044 (+0,47 % frente a BF16) |
| Contexto largo | Prueba de estrés de clase 250K superada; recuperación precisa de hechos plantados |
| Tool calling | Formato correcto en turno único y multi-turno; llamadas en paralelo soportadas |
| Visión | Comprensión de capturas de pantalla y lectura de gráficos verificadas |
| MMLU / GSM8K / HumanEval | No se han publicado resultados numéricos en la información disponible |

## Requisitos de hardware

- VRAM mínima: 8 GB con offload de capas a RAM del sistema (contexto de 16K-32K, KV cache q4_0); funcionamiento más lento pero operativo.
- 12 GB de VRAM: contexto de 64K-128K con KV cache q4_0, adecuado para preguntas y respuestas sobre documentos diarios.
- 16 GB de VRAM: contexto de 192K recomendado con unos 0,4 GB de margen; 250K medido en torno a 15,5 GB, al límite y a validar por el usuario.
- 24 GB o más: contexto de 256K más visión, configuración más segura.
- El KV cache debe ser q4_0; con q8_0 la VRAM se dispara y no cabe en una tarjeta de 16 GB.
- GPU recomendadas: no se especifican modelos concretos en la información disponible; por los requisitos de VRAM encajan tarjetas de consumo de 8, 12, 16 y 24 GB, así como aceleradores de datacenter con holgura.
- Opciones de despliegue: llama.cpp (llama-server con `--jinja`, `-ctk q4_0 -ctv q4_0 -fa on`), Ollama (mediante Modelfile), LM Studio y Jan.
- Parámetros recomendados: temperatura 0,6-0,7, top_p 0,9-0,95, top_k 20, repeat_penalty 1,0-1,05, flash attention activada, un solo slot paralelo y decodificación especulativa desactivada.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización típica | Licencia | Notas |
|---|---|---|---|---|---|
| MoziAier-35B-A3B-MOE (V3.9) | 35B MoE | 256K | IQ3_XXS híbrida, 12,99 GB | Uso comercial gratuito | Visión, tool calling, dominio financiero, plantilla embebida |
| Q4_K_M del mismo modelo base | 35B MoE | 256K | Q4_K_M, 21-22 GB | Según base | Referencia citada por el autor; sin reducción MoziSmartBit |
| Occamy-1.0-35B-A3B | 35B MoE | no disponible | no disponible | no disponible | Modelo base; línea de evaluación de referencia |

No se dispone en la información proporcionada de datos de rendimiento comparativos con otros modelos de la misma categoría (por ejemplo, otros MoE de 30-40B con contexto largo), por lo que la comparación cuantitativa de benchmarks queda como no disponible.

## Limitaciones y advertencias

- Idiomas: solo inglés y chino; el rendimiento en castellano u otras lenguas no está validado y previsiblemente será inferior.
- La etiqueta "uncensored" implica ausencia declarada de filtros de rechazo, lo que exige moderación externa en producción.
- Riesgo de alucinación inherente a los modelos generativos, agravado en dominio financiero donde los datos deben verificarse contra fuentes primarias.
- El KV cache debe ser q4_0; usar q8_0 rompe el ajuste en GPUs de 16 GB.
- La decodificación especulativa no está soportada (sin cabecera MTP) y debe permanecer desactivada.
- No debe pasarse `--chat-template-file` en llama.cpp: la plantilla ya está embebida y un fichero externo la sobrescribiría.
- La licencia figura como "other" con uso comercial gratuito según la model card, pero conviene revisar los términos exactos del modelo base Occamy-1.0 antes de un despliegue comercial.
- El contexto de 250K en 16 GB de VRAM está medido al límite (unos 15,5 GB); el propio autor recomienda probarlo en el hardware concreto.
- No se publican cifras de benchmarks estándar (MMLU, GSM8K, HumanEval), lo que dificulta la comparación objetiva con alternativas.
- El número de parámetros activos por token no se detalla, lo que limita la estimación fina de throughput.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/chenyumo/MoziAier-35B-A3B-MOE
- Model card en chino simplificado: README.zh.md (referenciado en la model card)
- Model card en chino tradicional: README.zh-hant.md (referenciado en la model card)
- Model card en japonés: README.ja.md (referenciado en la model card)
- Model card en coreano: README.ko.md (referenciado en la model card)
- Model card en hindi: README.hi.md (referenciado en la model card)
- Model card en alemán: README.de.md (referenciado en la model card)
- Model card en francés: README.fr.md (referenciado en la model card)
- Model card en neerlandés: README.nl.md (referenciado en la model card)
- Model card en italiano: README.it.md (referenciado en la model card)
- Model card en ruso: README.ru.md (referenciado en la model card)
- ModelScope y GitHub: mencionados en la model card como canales de descarga alternativos; URL exacta no disponible
- Paper, blog o demo adicionales: no disponibles en la información proporcionada
