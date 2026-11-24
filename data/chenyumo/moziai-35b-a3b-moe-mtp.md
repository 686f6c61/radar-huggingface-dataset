# chenyumo/moziAI-35B-A3B-MOE-MTP

## Resumen

MoziAier-35B-V3.9 es un modelo de lenguaje multimodal de tipo Mixture-of-Experts desarrollado por el equipo de Chen Yumo, orientado a tareas del dominio financiero y a la ejecución de tareas de horizonte largo sobre contexto extenso. Se distribuye principalmente como GGUF cuantizado con el algoritmo propietario MoziSmartBit (IQ3_XXS en las capas de expertos con imatrix de Occamy), lo que reduce el fichero principal a 12,99 GB frente a los 21-22 GB de un Q4_K_M convencional para el mismo tamaño de modelo.

El modelo parte de la base Occamy-1.0-35B-A3B, que sigue la arquitectura Qwen3.6-35B-A3B, y se publica con 34.660.610.688 parámetros totales. Su propuesta diferencial es triple: capacidad declarada de mantener ejecución multi-paso estable en una ventana de clase 250K (262.144 tokens), soporte de visión mediante un proyector mmproj separado (0,57 GB en Q8_0) y un mínimo de VRAM declarado de 8 GB con offload a RAM del sistema.

La relevancia actual del modelo radica en su enfoque de despliegue local: incluye la plantilla de chat embebida en el GGUF, ofrece presets de contexto por cantidad de VRAM y está etiquetado como "uncensored" y de uso comercial libre según la model card. No obstante, la licencia declarada en Hugging Face es "other", lo que exige verificar los términos reales antes de un uso en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE (arquitectura Qwen3.6-35B-A3B, base Occamy-1.0-35B-A3B) |
| Parámetros totales | 34.660.610.688 (35B) |
| Parámetros activos | no disponible |
| Longitud de contexto | 262.144 tokens (256K); preset recomendado de 196.608 tokens en 16 GB |
| Tipos de cuantización | MoziSmartBit híbrida (IQ3_XXS en capas de expertos + imatrix occamy); mmproj en Q8_0 |
| Idiomas soportados | en, zh (chino especialmente ajustado según el autor) |
| Licencia | other (la model card indica "free for commercial use") |
| Formato de pesos | GGUF (llama-cpp) |
| Tamaño del fichero principal | 12,99 GB |
| Tamaño del proyector de visión | 0,57 GB (Q8_0 mmproj) |
| Plantilla de chat | Embebida en el GGUF (`tokenizer.chat_template`) |
| Pérdida de cuantización | PPL 8,3044 (+0,47 % frente a BF16) |
| Decodificación especulativa | No soportada (sin cabeza MTP; debe desactivarse) |
| VRAM mínima | 8 GB (con offload a RAM) |
| VRAM recomendada | 16 GB (192K) / 24 GB o más (256K + visión) |
| Caché KV | q4_0 obligatorio para 16 GB; q8_0 no cabe |
| Descargas en Hugging Face | 7.743 |
| Likes | 26 |

## Arquitectura y entrenamiento

El modelo es un transformer con mezcla de expertos (MoE) de 35B parámetros totales, construido sobre la arquitectura Qwen3.6-35B-A3B y la base Occamy-1.0-35B-A3B. El autor no detalla el número de expertos, la proporción de parámetros activos por token ni la composición exacta del dataset de entrenamiento en la información disponible. La model card sí menciona que la versión V3.9 combina la base con la metodología de entrenamiento propia del equipo, un "marco de razonamiento de siete dimensiones" y un mecanismo de agente denominado LOOP, orientado a la autoverificación en tareas complejas.

La innovación técnica más destacable es la cuantización híbrida MoziSmartBit: aplica IQ3_XXS a las capas de expertos y utiliza una imatrix específica de Occamy, logrando una perplejidad de 8,3044, solo un 0,47 % superior a la del modelo en BF16, con una reducción de aproximadamente 9 GB en disco respecto a Q4_K_M. También se incorpora la plantilla de chat directamente en el GGUF, eliminando la necesidad de un fichero jinja externo. El modelo no incluye cabeza MTP, por lo que la decodificación especulativa debe permanecer desactivada. No se dispone de datos sobre el volumen de tokens de entrenamiento, la mezcla del corpus ni si se aplicaron fases de RLHF o DPO.

## Capacidades

- Generación de texto y razonamiento estructurado mediante un marco de razonamiento de siete dimensiones que adapta la profundidad del pensamiento a la complejidad de la tarea.
- Ejecución de tareas de horizonte largo: cadenas de decenas de llamadas a herramientas, análisis de documentos extensos y trabajo técnico multi-fichero dentro de una ventana de clase 250K.
- Tool calling y function calling con formato correcto en turno único y multi-turno, incluyendo llamadas paralelas.
- Comportamiento agente con mecanismo LOOP de autoverificación para tareas complejas.
- Visión: lectura de capturas de pantalla locales y de gráficos mediante el proyector mmproj Q8_0.
- Dominio financiero: preguntas y respuestas financieras, codificación de estrategias cuantitativas y uso de herramientas en ese contexto.
- Capacidades multilingües limitadas a inglés y chino, con ajuste específico para chino.
- Modo "uncensored" según el etiquetado del autor, con menor rechazo declarado a peticiones.

## Casos de uso

- Análisis de documentos financieros extensos: informes anuales, prospectos o transcripciones de resultados que superan los 100K tokens pueden procesarse en una sola pasada gracias a la ventana de 256K, manteniendo coherencia entre secciones distantes del documento.
- Agentes de investigación multi-paso: el modelo puede encadenar decenas de llamadas a herramientas (búsqueda, cálculo, consulta a bases de datos) sin perder el hilo, apoyándose en el mecanismo LOOP de autoverificación y en el contexto largo para conservar el estado intermedio.
- Generación y revisión de código para estrategias cuantitativas: con soporte de tool calling, puede integrarse en un pipeline que ejecute backtests, lea resultados y proponga ajustes de parámetros de forma iterativa.
- Asistencia en atención al cliente especializada en productos financieros: conversaciones multi-turno con historial largo, consulta a APIs internas mediante function calling y derivación a humano cuando la consulta excede el ámbito permitido.
- Lectura de gráficos y capturas en flujos de análisis: con el mmproj cargado, el modelo interpreta capturas de plataformas de trading o dashboards y extrae conclusiones textuales, útil para herramientas de informes automáticos.
- Despliegue local en estaciones de trabajo con GPU de consumo: con 12,99 GB de fichero y un mínimo declarado de 8 GB de VRAM con offload, es viable en equipos con RTX 4060 Ti de 16 GB ejecutando 192K de contexto, lo que permite procesar documentación sensible sin salir del entorno local.
- Extracción estructurada de datos de documentos largos: combinando contexto de 250K y tool calling para validar los campos extraídos contra un esquema, adecuado para pipelines de ingesta documental.

## Benchmarks y rendimiento

La model card referencia una evaluación siguiendo la línea base de Occamy-1.0, pero no publica cifras numéricas de MMLU, GSM8K ni HumanEval. Los únicos datos cuantitativos disponibles son los siguientes:

| Métrica | Resultado |
|---|---|
| Perplejidad (cuantización IQ3_XXS híbrida) | 8,3044 |
| Pérdida de perplejidad frente a BF16 | +0,47 % |
| Prueba de estrés de contexto largo | Superada (clase 250K, recuerdo preciso de hechos plantados) |
| Tool calling | Formato correcto en turno único y multi-turno; llamadas paralelas soportadas |
| Visión | Comprensión de capturas y lectura de gráficos verificadas |

No se han publicado resultados numéricos de benchmarks estándar (MMLU, GSM8K, HumanEval) en la información disponible.

## Requisitos de hardware

- VRAM mínima declarada: 8 GB, con offload de capas a RAM del sistema; contexto utilizable de 16K a 32K con caché KV q4_0 y velocidad reducida.
- 12 GB de VRAM: contexto de 64K a 128K con caché KV q4_0, adecuado para preguntas y respuestas sobre documentos diarios.
- 16 GB de VRAM: preset recomendado de 192K con aproximadamente 0,4 GB de margen; 250K medido en torno a 15,5 GB, valor límite que el autor recomienda probar en cada equipo.
- 24 GB o más de VRAM: 256K de contexto más visión con caché KV q4_0, configuración más segura.
- La caché KV debe ser q4_0; con q8_0 el consumo de VRAM impide que quepa en una tarjeta de 16 GB.
- Opciones de despliegue: llama.cpp (llama-server con `--jinja`, `-ngl 999`, `-fa on`, `-ctk q4_0 -ctv q4_0`), Ollama mediante Modelfile, LM Studio y Jan colocando el GGUF y el mmproj en la misma carpeta.
- No debe pasarse `--chat-template-file`, ya que la plantilla está embebida en el GGUF y un fichero externo la sobrescribiría.
- La decodificación especulativa debe permanecer desactivada: el modelo no incluye cabeza MTP.
- Parámetros recomendados: temperatura 0,6-0,7, top_p 0,9-0,95, top_k 20, repeat_penalty 1,0-1,05, un solo slot paralelo.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización típica | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MoziAier-35B-V3.9 (este modelo) | 35B MoE (34,66B totales) | 256K | MoziSmartBit IQ3_XXS híbrida, 12,99 GB | other (uso comercial declarado) | GGUF en Hugging Face, ModelScope y GitHub |
| Occamy-1.0-35B-A3B (base) | 35B MoE | no disponible | no disponible | no disponible | no disponible |
| Ornith-1.5-35B-A3B (base de V3.8) | 35B MoE | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks comparativos con alternativas de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados por el autor; el ajuste se limita a inglés y chino, con especial énfasis en chino, lo que puede degradar el rendimiento en castellano y otros idiomas.
- Riesgo de alucinación: no cuantificado; el autor declara pruebas de recuerdo de hechos en contexto largo, pero no se publican tasas de error en tareas abiertas.
- La licencia en Hugging Face figura como "other" aunque la model card afirme uso comercial libre; es imprescindible revisar los términos reales antes de desplegar en producción.
- El modelo está etiquetado como "uncensored", lo que implica menor rechazo a peticiones sensibles y traslada al operador la responsabilidad de filtrado y moderación.
- La cuantización IQ3_XXS introduce una pérdida de perplejidad del 0,47 % frente a BF16; no se distribuyen pesos en precisión completa en la información disponible.
- El contexto de 250K en 16 GB de VRAM se sitúa en el límite (unos 15,5 GB medidos) y puede provocar fallos de asignación según el backend y el sistema operativo.
- La caché KV debe ser q4_0; usar q8_0 rompe el preset de 16 GB.
- No hay soporte de decodificación especulativa por ausencia de cabeza MTP, lo que limita las optimizaciones de latencia.
- El rendimiento con offload a RAM en configuraciones de 8 GB será notablemente inferior y no se publican cifras de throughput.
- No se documentan el número de parámetros activos ni la composición del dataset de entrenamiento, lo que dificulta evaluar el coste real de inferencia y los sesgos de datos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/chenyumo/moziAI-35B-A3B-MOE-MTP
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
- Modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B
- Repositorio en GitHub y espejo en ModelScope: mencionados en la model card, URL no disponible en la información proporcionada
- Paper técnico: no disponible
