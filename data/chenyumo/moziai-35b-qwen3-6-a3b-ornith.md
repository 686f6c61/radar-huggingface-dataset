# chenyumo/moziAI-35B-Qwen3.6-A3B-Ornith

## Resumen

MoziAier-35B-V3.9 es un modelo de lenguaje multimodal de tipo Mixture of Experts (MoE) desarrollado por el equipo de Chen Yumo, orientado al dominio financiero y distribuido en formato GGUF para despliegue local. Se construye sobre el modelo base Occamy-1.0-35B-A3B, que sigue la arquitectura Qwen3.6-35B-A3B, y añade la metodología de entrenamiento propia del equipo, un marco de razonamiento de siete dimensiones y un mecanismo de agente denominado LOOP. Cuenta con 34.660.610.688 parámetros totales y una ventana de contexto de 256K tokens (262.144), lo que lo sitúa en la categoría de modelos de contexto largo para tareas de horizonte extendido.

La propuesta diferencial de esta versión es la cuantización híbrida propietaria MoziSmartBit, que reduce el archivo principal a 12,99 GB frente a los 21-22 GB habituales de un Q4_K_M para un MoE de 35B, con una pérdida de perplejidad declarada de solo +0,47 % respecto a BF16 (PPL 8,3044). Esto permite ejecutar el modelo desde 8 GB de VRAM con offload a RAM del sistema, y cubrir un contexto de 250K con una GPU de 16 GB en unos 15,5 GB de VRAM. La plantilla de chat va embebida en el propio GGUF, de modo que no hace falta descargar un archivo jinja aparte.

El modelo soporta visión mediante un proyector mmproj Q8_0 de 0,57 GB, tool calling con llamadas paralelas y multi-turno, y está especialmente ajustado para chino, con inglés como segundo idioma. La licencia se declara como "other" en la ficha de Hugging Face, aunque la model card afirma que es libre para uso comercial; esta discrepancia conviene verificarla antes de un despliegue en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (familia Qwen3.6-35B-A3B), base Occamy-1.0-35B-A3B |
| Parametros totales | 34.660.610.688 (35B) |
| Parametros activos | no disponible (MoE; el número exacto de expertos activos no se detalla en la información proporcionada) |
| Longitud de contexto | 262.144 tokens (256K) |
| Tipos de cuantizacion | MoziSmartBit híbrida (capas de expertos IQ3_XXS + imatrix occamy); mmproj en Q8_0; KV cache recomendada q4_0 |
| Idiomas soportados | zh, en (chino especialmente ajustado) |
| Licencia | other (la model card indica "free for commercial use") |
| Formato de pesos | GGUF (llama-cpp); plantilla de chat embebida en `tokenizer.chat_template` |
| Tamano del repo | 62,3 GB |
| Archivo principal | 12,99 GB (IQ3_XXS híbrida) |
| Proyector de visión | 0,57 GB (Q8_0 mmproj) |
| Decodificacion especulativa | no soportada (sin cabecera MTP; debe permanecer desactivada) |
| VRAM mínima | 8 GB (con offload a RAM) |
| VRAM recomendada | 16 GB (192K) / 24 GB+ (250K + visión) |

## Arquitectura y entrenamiento

El modelo es un transformer con capas MoE, heredado directamente de Occamy-1.0-35B-A3B, que a su vez implementa la arquitectura Qwen3.6-35B-A3B. Sobre esa base, el equipo de Chen Yumo aplica su propia metodología de entrenamiento, un marco de razonamiento estructurado en siete dimensiones que adapta la profundidad del pensamiento a la complejidad de la tarea, y un mecanismo de agente LOOP orientado a la autoverificación en trabajos complejos. La información disponible no detalla el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO.

La innovación técnica más destacable es MoziSmartBit, una cuantización híbrida multinivel que combina capas de expertos en IQ3_XXS con una imatrix específica del modelo base, logrando el archivo de 12,99 GB con una degradación de perplejidad declarada de solo +0,47 % frente a BF16. El modelo no incorpora cabecera MTP, por lo que la decodificación especulativa debe permanecer desactivada. El ajuste fino está orientado al dominio financiero (preguntas y respuestas financieras, codificación de estrategias cuantitativas y tool calling), y la versión se distribuye con la plantilla de chat integrada en el GGUF.

## Capacidades

- Generación de texto conversacional multi-turno con contexto de hasta 256K tokens.
- Razonamiento estructurado mediante el marco de siete dimensiones, con adaptación de la profundidad de pensamiento a la complejidad de la tarea.
- Ejecución de agentes de horizonte largo: cadenas de decenas de llamadas a herramientas y análisis de documentos extensos sin perder el hilo, gracias al mecanismo LOOP de autoverificación.
- Tool calling / function calling con formato correcto en llamadas simples y multi-turno, incluyendo llamadas paralelas.
- Visión: lectura de capturas de pantalla locales y de gráficos mediante el proyector mmproj Q8_0.
- Dominio financiero: preguntas y respuestas financieras y codificación de estrategias cuantitativas.
- Capacidades multilingües limitadas a chino e inglés, con ajuste especial en chino.
- Modo sin censura declarado por el autor (etiqueta "uncensored").
- Compatibilidad con endpoints de API (etiqueta "endpoints_compatible") y despliegue en llama.cpp, Ollama, LM Studio y Jan.

## Casos de uso

- Análisis de documentos financieros extensos: informes anuales, prospectos o transcripciones de resultados que superan los 200K tokens pueden procesarse en una sola pasada, manteniendo la coherencia entre secciones gracias a la ventana de 256K y al mecanismo LOOP de autoverificación.
- Agentes de investigación multi-paso: el modelo puede encadenar decenas de llamadas a herramientas (búsqueda, cálculo, consulta a bases de datos) en tareas de horizonte largo, con soporte de llamadas paralelas y formato multi-turno correcto.
- Asistencia en codificación de estrategias cuantitativas: generación y depuración de código para backtesting y señales financieras, aprovechando el ajuste específico del dominio y el soporte de tool calling para integrarse en pipelines de ejecución.
- Automatización de atención al cliente en banca o finanzas: conversaciones multi-turno con contexto largo que permiten recordar el historial completo del cliente dentro de una misma sesión, desplegable en local para cumplir requisitos de residencia de datos.
- Análisis de gráficos y capturas de pantalla: extracción de información de charts bursátiles o dashboards mediante el proyector de visión, útil en herramientas internas de análisis que reciben imágenes de informes.
- Despliegue en estaciones de trabajo con GPU de consumo: con 16 GB de VRAM se cubre un contexto de 192K en unos 15,5 GB, lo que permite ejecutar el modelo en un equipo de escritorio con una RTX 4090 o similar sin infraestructura de servidor.
- Procesamiento por lotes de documentación en chino: clasificación, resumen y extracción de entidades en corpus financieros en chino, idioma para el que el modelo está especialmente ajustado.

## Benchmarks y rendimiento

La model card no publica cifras numéricas de MMLU, GSM8K o HumanEval; solo indica que existe una evaluación "MoziAier-35B-3.9" de capacidad general que cubre esas pruebas, sin desglosar resultados. Los únicos datos cuantitativos disponibles son los siguientes:

| Metrica | Resultado |
|---|---|
| Perplejidad tras cuantizacion (MoziSmartBit IQ3_XXS) | 8,3044 (+0,47 % vs BF16) |
| Contexto largo | Prueba de estrés de 250K superada; recuperación precisa de hechos plantados |
| Tool calling | Formato correcto en simple y multi-turno; llamadas paralelas soportadas |
| Vision | Comprensión de capturas de pantalla y lectura de gráficos verificadas |

No se han publicado resultados numéricos de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM mínima: 8 GB, con offload de capas a RAM del sistema; contexto de 16K-32K con KV cache q4_0 y rendimiento más lento.
- 12 GB de VRAM: contexto de 64K-128K con KV cache q4_0, adecuado para preguntas y respuestas sobre documentos diarios.
- 16 GB de VRAM: contexto de 192K recomendado (unos 0,4 GB de margen); 250K medido en unos 15,5 GB, al límite y requiere prueba propia.
- 24 GB o más: contexto de 256K con visión, configuración más segura.
- La KV cache debe ser q4_0; con q8_0 el consumo de VRAM impide encajar el modelo en una GPU de 16 GB.
- GPU recomendadas: RTX 4090 (24 GB) o superior para la configuración completa; GPUs de 16 GB (RTX 4080, 4070 Ti Super, A4000) para contexto de 192K; GPUs de 8-12 GB solo con offload.
- Opciones de despliegue: llama.cpp (llama-server), Ollama, LM Studio y Jan. No se mencionan vLLM ni TGI, coherente con el formato GGUF.
- Parámetros recomendados: temperatura 0,6-0,7, top_p 0,9-0,95, top_k 20, repeat_penalty 1,0-1,05, flash attention activada, un solo slot paralelo, decodificación especulativa desactivada.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| MoziAier-35B-V3.9 (este) | 35B MoE | 256K | GGUF, 12,99 GB (IQ3_XXS híbrida) | other (comercial según model card) | Visión, tool calling, dominio financiero, plantilla embebida |
| Occamy-1.0-35B-A3B (base) | 35B MoE | no disponible | no disponible | no disponible | Modelo base sin el ajuste financiero ni MoziSmartBit |
| Ornith-1.5-35B-A3B (base de V3.8) | 35B MoE | no disponible | no disponible | no disponible | Base de la versión anterior; métricas no comparables según el autor |
| Q4_K_M típico de un MoE de 35B | 35B MoE | depende del modelo | GGUF, 21-22 GB | depende del modelo | Referencia de tamaño citada por el autor; el archivo de este modelo ahorra unos 9 GB |

No se dispone de datos de benchmarks que permitan una comparación cuantitativa de rendimiento con alternativas de la misma categoría.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información disponible; el ajuste está centrado en el dominio financiero y en chino, lo que puede sesgar respuestas hacia ese contexto.
- Riesgo de alucinación: no se han publicado evaluaciones de fidelidad factual; en dominio financiero, cualquier dato numérico debe verificarse contra la fuente.
- Idiomas: solo chino e inglés declarados; el rendimiento en castellano no está garantizado ni evaluado.
- Licencia: la ficha de Hugging Face indica "other" mientras que la model card afirma uso comercial libre; es una discrepancia que debe aclararse con el autor antes de producción.
- La etiqueta "uncensored" implica que el modelo puede generar contenido sin los filtros habituales; requiere moderación externa en aplicaciones expuestas al usuario.
- Decodificación especulativa no soportada: no hay cabecera MTP y debe permanecer desactivada; activarla puede degradar la calidad o fallar.
- La KV cache debe ser q4_0; usar q8_0 impide encajar el modelo en GPUs de 16 GB.
- Con 8 GB de VRAM el modelo funciona con offload a RAM, con latencia notablemente mayor.
- El contexto de 250K en 16 GB está al límite (15,5 GB medidos); el propio autor recomienda probarlo antes de confiar en esa configuración.
- No se detallan tokens de entrenamiento, composición del dataset ni proceso de alineación (RLHF/DPO), lo que dificulta evaluar la robustez del ajuste.
- El modelo base cambió respecto a V3.8, por lo que las métricas de versiones anteriores no son comparables.

## Enlaces

- Hugging Face: https://huggingface.co/chenyumo/moziAI-35B-Qwen3.6-A3B-Ornith
- Modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B
- README en chino simplificado: README.zh.md (en el repositorio de Hugging Face)
- README en chino tradicional: README.zh-hant.md (en el repositorio de Hugging Face)
- README en japonés: README.ja.md (en el repositorio de Hugging Face)
- README en coreano: README.ko.md (en el repositorio de Hugging Face)
- README en hindi: README.hi.md (en el repositorio de Hugging Face)
- README en alemán: README.de.md (en el repositorio de Hugging Face)
- README en francés: README.fr.md (en el repositorio de Hugging Face)
- README en neerlandés: README.nl.md (en el repositorio de Hugging Face)
- README en italiano: README.it.md (en el repositorio de Hugging Face)
- README en ruso: README.ru.md (en el repositorio de Hugging Face)
- ModelScope y GitHub: mencionados en la model card como puntos de descarga alternativos, sin URL concreta disponible.
