# karlsencoin/Qwen3.6-27B-GGUF

## Resumen

Qwen3.6-27B-GGUF es la versión cuantizada en formato GGUF del modelo Qwen3.6-27B, publicada por el usuario karlsencoin a partir de los pesos originales de Qwen (Alibaba). Se trata de un modelo de lenguaje causal denso de aproximadamente 26,9 mil millones de parámetros que incorpora además un codificador de visión, lo que lo sitúa en la categoría image-text-to-text: acepta entradas de imagen y texto y genera texto. La cuantización sigue el esquema Unsloth Dynamic 2.0 con imatrix, orientado a reducir el coste de memoria manteniendo la mayor parte de la calidad del modelo original.

El modelo base es la primera variante de pesos abiertos de la familia Qwen3.6, lanzada tras la serie Qwen3.5 de febrero. Sus dos ejes de mejora declarados son el codificado agéntico (razonamiento a nivel de repositorio y flujos de trabajo de frontend) y la preservación del razonamiento (retención del contexto de pensamiento de mensajes históricos entre turnos). La arquitectura es híbrida: combina capas de atención lineal Gated DeltaNet con capas de atención con compuertas (gated attention) en una proporción de 3 a 1, sobre 64 capas en total.

La relevancia práctica de esta ficha concreta reside en que es un repositorio GGUF (427,4 GB en total, con múltiples niveles de cuantización) pensado para despliegue local y en frameworks de inferencia populares, no para entrenamiento. La ventana de contexto nativa es de 262.144 tokens, extensible hasta 1.010.000, lo que lo coloca en el rango de contexto largo. La licencia del modelo base es Apache 2.0.

Conviene señalar que este repositorio concreto es una republicación de terceros: no es el repositorio oficial de Qwen ni de Unsloth, y en el momento de redactar esta ficha no registra descargas ni valoraciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal híbrido con encoder de visión; 16 bloques de 3 × (Gated DeltaNet → FFN) + 1 × (Gated Attention → FFN), 64 capas |
| Parametros totales | 26.895.998.464 (~26,9 B, denominado comercialmente 27B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens nativos; extensible hasta 1.010.000 tokens |
| Tipos de cuantizacion | GGUF con cuantización dinámica Unsloth Dynamic 2.0 e imatrix; niveles concretos no detallados en la información disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF en este repositorio; safetensors en el modelo base Qwen/Qwen3.6-27B |
| Dimension oculta | 5120 |
| Capas | 64 |
| Heads de atencion (gated attention) | 24 para Q, 4 para KV; dimensión de cabeza 256; RoPE dim 64 |
| Heads de atencion lineal (Gated DeltaNet) | 48 para V, 16 para QK; dimensión de cabeza 128 |
| Dimension intermedia FFN | 17408 |
| Vocabulary / embeddings | 248320 (padded) |
| MTP | Entrenado con multiple steps |
| Tamano del repositorio | 427,4 GB |
| Modelo base | Qwen/Qwen3.6-27B |
| Fecha de publicacion | 2026-09-13 |

## Arquitectura y entrenamiento

El bloque constructivo es un transformer causal con encoder de visión, pero la pila de atención no es estándar. Cada uno de los 16 bloques agrupa tres capas de Gated DeltaNet (atención lineal con estado recurrente) seguidas de una capa de gated attention clásica. Las capas de DeltaNet usan 48 cabezas para V y 16 para QK con dimensión de cabeza 128; las capas de atención con compuertas usan 24 cabezas de consulta y solo 4 de clave/valor, con dimensión de cabeza 256 y dimensión RoPE de 64. Esta proporción 3:1 reduce de forma sustancial el crecimiento del caché KV en contextos largos, ya que únicamente 16 de las 64 capas almacenan K y V por token. La dimensión oculta es 5120, el FFN tiene dimensión intermedia 17408 y el vocabulario está rellenado hasta 248320 entradas.

El modelo ha pasado por las etapas de preentrenamiento y postentrenamiento declaradas por Qwen. Incorpora MTP (multi-token prediction) entrenado con múltiples pasos, lo que habilita decodificación especulativa interna y, en principio, mejoras de throughput en motores de servicio compatibles. La información disponible no detalla el número de tokens de entrenamiento, la composición del dataset ni si se emplearon RLHF, DPO u otras técnicas de alineamiento concretas; tampoco se especifica la arquitectura exacta del encoder de visión más allá de su presencia.

Esta publicación concreta no entrena nada: es un proceso de cuantización del modelo base. Se ha aplicado el esquema Unsloth Dynamic 2.0 con matriz de importancia (imatrix), que asigna distinto número de bits a distintas capas según su sensibilidad medida, en lugar de usar una precisión uniforme. El repositorio incluye además mejoras declaradas por Unsloth en el parseo de tool calling (objetos anidados) y soporte del rol `developer` para integrarse en herramientas como Codex u OpenCode.

## Capacidades

- Generacion de texto y razonamiento multi-turno con ventana de 262.144 tokens nativa.
- Procesamiento de imagen y texto (pipeline image-text-to-text) gracias al encoder de visión.
- Codificacion agéntica: razonamiento a nivel de repositorio y flujos de trabajo de frontend, según las notas de la release.
- Tool calling / function calling, con mejoras específicas en el parseo de objetos anidados introducidas en el ecosistema Unsloth.
- Preservación del razonamiento entre turnos (thinking preservation): opción de retener el contexto de razonamiento de mensajes históricos para desarrollo iterativo.
- Soporte del rol `developer`, lo que permite su uso en herramientas como Codex u OpenCode.
- Decodificación especulativa interna vía MTP (según soporte del framework).
- Contexto extensible hasta 1.010.000 tokens mediante las técnicas de extensión del modelo base.
- Capacidades multilingües: no disponibles en la información proporcionada (los idiomas no se declaran en el repositorio).

## Casos de uso

- Asistencia de codificacion en repositorios grandes: con 262.144 tokens de contexto nativo puede ingerir varios ficheros fuente, tests y documentación simultáneamente, y razonar sobre dependencias entre módulos sin trocear el código en fragmentos que pierdan la visión global.
- Agentes de desarrollo autónomos: el soporte de tool calling con parseo de objetos anidados y la compatibilidad con el rol `developer` permiten integrarlo en bucles agénticos que editan ficheros, ejecutan tests y realizan commits dentro de pipelines de CI/CD.
- Generacion y revision de codigo frontend: la release destaca específicamente mejoras en flujos de trabajo de frontend, lo que lo hace utilizable para generar componentes, revisar maquetación a partir de una imagen de diseño (aprovechando el encoder de visión) y proponer correcciones de accesibilidad.
- Analisis de documentacion tecnica extensa con imagenes: al aceptar entrada de imagen y texto, puede procesar informes con diagramas, capturas de error o planos junto al texto asociado, por ejemplo en soporte técnico de segundo nivel.
- Automatizacion de atencion al cliente multi-turno: la ventana de contexto permite arrastrar todo el historial de una incidencia larga sin resumir, y la preservación del razonamiento ayuda a mantener coherencia en conversaciones iterativas.
- Procesamiento por lotes en local para equipos con privacidad estricta: al distribuirse en GGUF, puede ejecutarse íntegramente en infraestructura propia sin enviar datos a APIs externas, algo relevante en sectores regulados.
- Extraccion estructurada de informacion: con contexto largo se pueden pasar documentos completos (contratos, historiales, informes) y solicitar salidas en JSON, apoyándose en el tool calling para validar el esquema.
- Desarrollo iterativo con razonamiento persistente: la opción de thinking preservation reduce el coste de repetir el contexto de razonamiento en cada turno de una sesión de depuración larga.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El README del modelo base incluye secciones tituladas "Benchmark Results" (Language y Vision Language) y una figura de puntuaciones (`qwen3.6_27b_score.png`), pero los valores numéricos no están presentes en la información extraída, por lo que no se reproducen aquí.

## Requisitos de hardware

Las cifras de VRAM para pesos son estimaciones calculadas a partir de los 26.895.998.464 parámetros; las cifras de caché KV se derivan de la arquitectura declarada (16 capas de gated attention con 4 cabezas KV de dimensión 256, es decir 2048 elementos por token y capa en K+V, ~64 KB por token en FP16). El encoder de visión añade consumo adicional no cuantificado en la información disponible, y la decodificación especulativa vía MTP puede aumentar el uso de memoria.

- Pesos en BF16/FP16: ~54 GB de VRAM solo para pesos.
- Pesos en Q8_0: ~29 GB.
- Pesos en Q6_K: ~22 GB.
- Pesos en Q5_K_M: ~19 GB.
- Pesos en Q4_K_M: ~16-17 GB.
- Pesos en Q3_K_M: ~13 GB.
- Pesos en Q2_K: ~10 GB.
- Caché KV estimado: ~8,4 GB a 128K tokens y ~16,8 GB a 262.144 tokens en FP16, dado el bajo número de capas con caché creciente.
- GPU de centro de datos: A100 80 GB, H100 80 GB o H200 para BF16 y contextos largos; configuraciones multi-GPU con tensor parallel (la guía oficial de SGLang muestra `--tp-size 8` para 262.144 tokens).
- GPU de consumo: una RTX 4090 (24 GB) puede ejecutar los niveles Q4_K_M o inferiores con contexto moderado; con 128K tokens de contexto el caché KV hace recomendable una GPU de 48 GB o superior, o bien VRAM dividida entre varias tarjetas.
- Despliegue: llama.cpp, Ollama, LM Studio y otros motores GGUF para uso local; vLLM, SGLang (recomendado >= 0.5.10 para Qwen3.6) y KTransformers para producción y alto throughput. El repositorio está marcado como `endpoints_compatible`.
- Latencia y throughput: no disponibles en la información proporcionada.
- Nota práctica: el propio README advierte de que, si aparecen errores de OOM, se reduzca la ventana de contexto, pero recomienda mantener al menos 128K tokens para no degradar las capacidades de razonamiento.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.6-27B (esta ficha, GGUF) | ~26,9 B densos | 262.144 nativos, hasta 1.010.000 | Híbrida DeltaNet + gated attention, con visión | Apache 2.0 | GGUF en este repo; safetensors en el base |
| Qwen3.6-35B-A3B | 35 B totales, 3 B activos (MoE) | No disponible | MoE (según nomenclatura A3B) | No disponible en la información | GGUF citado en el propio README de Unsloth |
| Qwen3.5 (serie) | No disponible | No disponible | No disponible | No disponible | Lanzada en febrero, predecesora directa |

No se dispone de datos de rendimiento comparativos entre estas opciones en la información proporcionada. La comparación se limita, por tanto, a parámetros, contexto y licencia. Otros modelos de la misma categoría (por ejemplo, alternativas densas de ~30B con visión) no aparecen mencionados en la información disponible.

## Limitaciones y advertencias

- Repositorio de terceros: no lo publica Qwen ni Unsloth, sino el usuario karlsencoin. No hay descargas ni valoraciones registradas, ni verificación independiente de la fidelidad de las cuantizaciones.
- Sesgos conocidos: no disponibles en la información proporcionada. El modelo base no documenta en este repositorio una evaluación de sesgos.
- Riesgo de alucinacion: no cuantificado en la información disponible; es un riesgo inherente a los modelos generativos y debe mitigarse con verificación externa en producción.
- Idiomas: el repositorio no declara los idiomas soportados, por lo que no se puede confirmar la cobertura multilingüe ni la calidad en castellano.
- Contexto: aunque la ventana nativa es de 262.144 tokens, mantenerla activa exige mucha memoria. El README recomienda al menos 128K tokens para preservar las capacidades de razonamiento, lo que marca un suelo práctico de recursos.
- Licencia: Apache 2.0 permite uso comercial, pero conviene verificar el fichero LICENSE del modelo base enlazado en la model card, ya que la publicación GGUF hereda las condiciones del original.
- Vision: el pipeline declarado es image-text-to-text, pero el soporte efectivo del encoder de visión depende del framework de inferencia y no se detalla para motores GGUF.
- Cuantizacion: los niveles agresivos (Q2, Q3) degradan la calidad de forma perceptible en tareas de razonamiento y código; no se aportan métricas de degradación por nivel en este repositorio.
- Formato de fichero: el uso en llama.cpp u Ollama no cubre necesariamente todas las capacidades (por ejemplo, decodificación especulativa MTP o tool calling avanzado) que sí ofrecen vLLM o SGLang.
- Fecha de publicación futura respecto a la ventana de conocimiento habitual de muchas herramientas: conviene comprobar la compatibilidad de versiones de los frameworks antes de desplegar.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/karlsencoin/Qwen3.6-27B-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-27B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.6-27B/blob/main/LICENSE
- Blog de la release Qwen3.6-27B: https://qwen.ai/blog?id=qwen3.6-27b
- Guia de Unsloth para ejecutar Qwen3.6: https://unsloth.ai/docs/models/qwen3.6
- Benchmarks de cuantizacion Unsloth Dynamic 2.0: https://unsloth.ai/docs/basics/unsloth-dynamic-v2.0-gguf
- Unsloth Studio: https://unsloth.ai/docs/new/studio
- Repositorio de Unsloth: https://github.com/unslothai/unsloth/
- Discord de Unsloth: https://discord.gg/unsloth
- Qwen Chat: https://chat.qwen.ai
- SGLang (framework de servicio recomendado): https://github.com/sgl-project/sglang
- Documentacion de instalacion de SGLang: https://docs.sglang.ai/get_started/install.html

Nota: la busqueda web realizada no devolvio resultados relevantes sobre este modelo; los enlaces recuperados correspondian a un sitio de coleccionismo sin relacion con el contenido de esta ficha.
