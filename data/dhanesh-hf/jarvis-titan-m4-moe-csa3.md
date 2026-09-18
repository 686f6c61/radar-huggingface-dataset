# dhanesh-hf/Jarvis-Titan-M4-MoE-CSA3

## Resumen

Jarvis-Titan-M4-MoE-CSA3 es un modelo de generación de texto de tipo Mixture of Experts (MoE) publicado por el usuario dhanesh-hf en HuggingFace. Se construye a partir del modelo base dhanesh-hf/Jarvis-Titan-V15-MoE-Decoupled, del cual hereda un backbone DeepSeekMoE al que el autor denomina "14.8B" en la model card, aunque el recuento real de parámetros de los pesos safetensors es de 15.384.072.725 (unos 15,38 mil millones). El modelo se distribuye con la librería transformers, etiqueta custom_code y licencia propietaria JTRL-v1.0.

El modelo incorpora tres innovaciones que el autor presenta como diferenciales: un sistema de memoria neuronal "M4 Tri-Brid" (combinación de atención local de ventana deslizante, un reservorio de tokens relevantes y matrices de memoria asociativa en tiempo de test), una atención denominada DHA-3 (Differential Holographic Attention) que comprime los estados clave-valor en representaciones diferenciales de baja varianza, y cabezas de predicción multi-token (MTP) orientadas a decodificación especulativa. El objetivo declarado es el razonamiento matemático de alta densidad, la síntesis de código y el manejo de contextos largos de hasta 131.072 tokens con una huella de caché KV reducida.

La relevancia del modelo es, por ahora, limitada y difícil de verificar: cuenta con 0 descargas y 0 likes, no se han publicado resultados de benchmarks de capacidades estándar (MMLU, HumanEval, GSM8K), las métricas de eficiencia son autoinformadas por el autor y la licencia es propietaria, lo que obliga a revisar el fichero LICENSE antes de cualquier uso. La búsqueda web realizada no ha devuelto ninguna fuente independiente sobre este modelo; los resultados obtenidos corresponden a un músico homónimo sin relación con el proyecto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (backbone DeepSeekMoE) con memoria neuronal M4 Tri-Brid, atención DHA-3 (Differential Holographic Attention) y cabezas de predicción multi-token (MTP) |
| Parametros totales | 15.384.072.725 (~15,38 mil millones; la model card indica 14.8B, cifra que no coincide con los pesos safetensors) |
| Parametros activos | no disponible (el autor no publica el número de expertos activos por token) |
| Longitud de contexto | 131.072 tokens (128K) según la model card |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors; no hay GGUF, AWQ ni GPTQ publicados) |
| Idiomas soportados | en (inglés) |
| Licencia | jtrl-v1.0 (propietaria; etiquetada como "other" en HuggingFace) |
| Formato de pesos | safetensors (requiere `trust_remote_code=True` por la etiqueta custom_code) |

## Arquitectura y entrenamiento

La arquitectura parte de un backbone DeepSeekMoE que el autor describe como "reciclado" (upcycled) desde el modelo base Jarvis-Titan-V15-MoE-Decoupled. Sobre esa base se añaden tres componentes: el sistema M4 Tri-Brid Neural Memory, que combina atención local de ventana deslizante, un reservorio de recuperación exacta de tokens relevantes en documentos largos y matrices de memoria neural asociativa en tiempo de test; la atención DHA-3, presentada como sucesora de CSA3, que comprime los estados clave-valor en representaciones diferenciales de baja varianza en lugar de descartar tokens o proyecciones, preservando según el autor el 100% de los pesos preentrenados; y cabezas de predicción multi-token que permiten predecir varios tokens en paralelo para habilitar decodificación especulativa.

En cuanto a los datos de entrenamiento, la model card menciona un currículo de "120M tokens de alta densidad" orientado a matemáticas STEM, resolución de problemas de olimpiada y síntesis de código ejecutable. Es importante señalar que 120 millones de tokens es una cifra muy reducida para preentrenar un modelo de ~15B parámetros, por lo que cabe interpretarla como volumen de ajuste fino o de una fase de continuación sobre el backbone ya preentrenado, y no como el total de cómputo de preentrenamiento. No se documenta la composición del dataset, ni el uso de RLHF, DPO u otras técnicas de alineación, ni el número total de tokens de preentrenamiento del modelo base. Las cifras de mejora publicadas (72,9% de reducción de error en el mapa de atención, 72,6% de reducción de varianza, 8,8x menos distorsión informacional, hasta 78,6% de ahorro de caché KV) son autoinformadas y no se acompañan de una evaluación reproducible ni de código de benchmark.

## Capacidades

- Generación de texto conversacional en inglés, con etiqueta explícita `conversational`.
- Razonamiento matemático y resolución de problemas tipo olimpiada, según la model card (etiquetas `math` y `reasoning`).
- Generación, síntesis y razonamiento sobre código (etiqueta `code`), incluyendo código ejecutable según el autor.
- Manejo de contexto largo: hasta 131.072 tokens, con recuperación asociativa de información distribuida en documentos extensos.
- Orientación agéntica (etiqueta `agentic`), aunque no se documenta plantilla de tool calling ni formato de function calling.
- Decodificación especulativa mediante cabezas MTP, con aceleración declarada de 1,8x a 2,2x durante el servicio de inferencia.
- Memoria asociativa en tiempo de test (arquitectura Titans), pensada para evitar la degradación de recuperación en secuencias muy largas.
- Capacidades multilingües: no disponibles; el modelo solo declara soporte de inglés (`en`).
- Modo de razonamiento explícito (thinking mode): no disponible.
- Visión o audio: no disponibles.

## Casos de uso

- Asistencia en matemáticas de nivel universitario y competición: el modelo está ajustado específicamente para derivación matemática y problemas STEM, por lo que puede emplearse como tutor o verificador de demostraciones paso a paso en un pipeline de evaluación automática.
- Generación de código en producción: con etiqueta `code` y contexto de 131K tokens, puede procesar repositorios completos o ficheros extensos para sugerir refactorizaciones, generar tests o explicar módulos sin fragmentar el contexto.
- Análisis de documentos largos (revisión de literatura científica, contratos, informes técnicos): su ventana de 128K y su sistema de memoria asociativa están diseñados para localizar información concreta en documentos extensos con una caché KV reducida (2,73 GB a 128K según el autor).
- Servicio de inferencia de bajo coste: gracias a la compresión de caché KV y a la decodificación especulativa MTP, es candidato para despliegues con muchas peticiones concurrentes de contexto largo donde el cuello de botella sea la memoria del acelerador.
- RAG sobre bases de conocimiento extensas: la memoria asociativa podría usarse para recuperar fragmentos relevantes sin depender exclusivamente de un índice vectorial externo, aunque esta capacidad no está validada con benchmarks públicos.
- Asistentes conversacionales técnicos multi-turno en inglés: la combinación de contexto largo y gating dinámico por longitud busca mantener la coherencia en conversaciones prolongadas sin degradar las respuestas cortas.
- Investigación en arquitecturas de atención alternativa: el modelo sirve como banco de pruebas para estudiar atención holográfica diferencial, memoria neural en tiempo de test y predicción multi-token frente a transformadores densos convencionales.
- Pipelines agénticos de razonamiento multi-paso: la etiqueta `agentic` sugiere su uso en cadenas de razonamiento y planificación, si bien no hay documentación de integración con herramientas externas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de capacidades en la informacion disponible (no hay MMLU, HumanEval, GSM8K, MATH ni comparativas equivalentes). La model card únicamente incluye una tabla de métricas de eficiencia de la atención, autoinformada por el autor y sin metodología reproducible:

| Metrica | GQA densa estandar | Atencion dispersa legacy | DHA-3 (modelo) | Impacto declarado |
|---|---|---|---|---|
| Fidelidad de distribucion de atencion | 100,00% | 99,99% | 100,00% | Deriva cero en trayectorias de razonamiento SFT |
| Precision del mapa de atencion | Baseline | Distorsion alta | Reduccion de error del 72,9% | Fidelidad de atencion calibrada |
| Consistencia de representacion | Baseline | Deriva de estado | Reduccion de varianza del 72,6% | Perturbacion de representacion minima |
| Distorsion informacional | Baseline | Penalizacion medible | 8,8x menos distorsion | Distribucion de probabilidad preservada |
| Huella de cache KV a 128K | 7,00 GB | 3,50 GB | 2,73 GB | Ahorro de memoria del 60,9% al 78,6% |
| Integridad de parametros preentrenados | 100% | Degradada | 100% preservada | Sin shock arquitectonico |

Estos datos no estan contrastados por terceros y no incluyen ninguna medida de calidad de generacion, razonamiento o codigo.

## Requisitos de hardware

- VRAM estimada para inferencia (cálculo teórico a partir de 15,38B parámetros, no confirmado por el autor): ~31 GB en bf16/fp16 (el repositorio ocupa 30,8 GB), ~15-16 GB en int8 y ~8 GB en int4.
- La caché KV declarada por el autor a 128K tokens es de 2,73 GB con DHA-3, 3,50 GB con atención dispersa legacy y 7,00 GB con GQA densa; hay que sumarla a la memoria de los pesos.
- GPU recomendadas para bf16: A100 40GB, A100 80GB, H100 80GB o L40S 48GB. En una RTX 4090 (24 GB) no cabe en bf16 sin cuantización.
- GPU consumer: viable en una RTX 4090, RTX 3090 o RTX 4080 únicamente con cuantización int8 o int4; no hay pesos cuantizados publicados, por lo que habría que generarlos localmente.
- Opciones de despliegue: la librería declarada es transformers con `trust_remote_code=True` (etiqueta `custom_code`). El soporte en vLLM, TGI, llama.cpp u Ollama no está confirmado y no hay ficheros GGUF en el repositorio.
- Latencia y throughput: no disponibles. El autor declara una aceleración de 1,8x a 2,2x mediante decodificación especulativa con las cabezas MTP, pero sin cifras absolutas de tokens por segundo.
- El repositorio de 30,8 GB requiere espacio en disco suficiente para los safetensors antes de cargar el modelo.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Jarvis-Titan-M4-MoE-CSA3 | 15,38B | no disponible | 131.072 tokens | JTRL-v1.0 (propietaria) | HuggingFace, safetensors |
| DeepSeek-V2-Lite | 15,7B | 2,4B | 32K (ampliable) | licencia propia de DeepSeek | HuggingFace, safetensors |
| Qwen2.5-14B | 14,7B | denso (sin MoE) | 128K | Apache 2.0 | HuggingFace, safetensors, GGUF |
| Mixtral 8x7B | 46,7B | 12,9B | 32K | Apache 2.0 | HuggingFace, safetensors, GGUF |

Los datos de los modelos comparativos proceden de sus fichas públicas y deben verificarse en la fuente original antes de tomar decisiones. Frente a ellos, Jarvis-Titan-M4-MoE-CSA3 no puede compararse en calidad porque no publica benchmarks de capacidades, y su licencia propietaria limita la comparación en términos de facilidad de adopción. Su principal diferencial declarado es la combinación de contexto de 128K con una caché KV inferior a la de GQA densa.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles. No se documenta ningún proceso de alineación, filtrado de datos ni evaluación de sesgos.
- Riesgo de alucinación: no evaluado. Al ser un modelo orientado a matemáticas y código, los errores de razonamiento pueden ser especialmente difíciles de detectar sin verificación externa.
- Idiomas: únicamente se declara inglés. No hay garantía de comportamiento correcto en castellano ni en otros idiomas, a pesar de que la arquitectura subyacente pueda haber visto datos multilingües.
- Licencia JTRL-v1.0 propietaria: las condiciones de uso comercial, redistribución y derivados deben consultarse en el fichero LICENSE del repositorio. La etiqueta "other" de HuggingFace no implica permisos de uso comercial.
- Ausencia total de validación externa: 0 descargas, 0 likes y ninguna referencia en la búsqueda web realizada. Las afirmaciones de la model card (reducción de error del 72,9%, ahorro de caché del 78,6%, aceleración de 2,2x) son autoinformadas y no reproducibles con la información pública.
- Discrepancia de parámetros: la model card anuncia 14.8B mientras que los pesos safetensors suman 15,38B. Conviene verificar la configuración real del modelo antes de dimensionar infraestructura.
- Contexto largo anunciado pero no verificado: no hay resultados de pruebas tipo needle-in-a-haystack ni de evaluación a 128K tokens.
- Tool calling y function calling: no documentados. La etiqueta `agentic` no va acompañada de plantilla de chat, formato de herramientas ni ejemplos de integración.
- Requiere `trust_remote_code=True` con código personalizado del autor, lo que implica ejecutar código no auditado en el entorno de despliegue.
- Fechas de creación y actualización (2026-09-17) y ausencia de historial de versiones dificultan evaluar la madurez del proyecto.
- No hay pesos cuantizados publicados, lo que obliga a generarlos localmente para desplegar en GPU de consumo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dhanesh-hf/Jarvis-Titan-M4-MoE-CSA3
- Modelo base (Jarvis-Titan-V15-MoE-Decoupled): https://huggingface.co/dhanesh-hf/Jarvis-Titan-V15-MoE-Decoupled
- Referencia arXiv citada en las etiquetas del modelo (asociada a la memoria neuronal Titans): https://arxiv.org/abs/2501.00663
- Fichero de licencia JTRL-v1.0: LICENSE (enlace relativo dentro del repositorio de HuggingFace)
- Articulo de investigacion adicional, blog o demo: no disponibles
- Nota sobre la busqueda web: los resultados obtenidos corresponden a un musico homonimo (dhaneshmusic) y no guardan relacion con el modelo. No se ha encontrado ninguna fuente independiente, paper ni repositorio asociado a este modelo.
