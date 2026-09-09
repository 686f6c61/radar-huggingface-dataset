# open-athena/snowball-67b-a2b-base-262k-qk175-skew2

## Resumen

Snowball 67B-A2B es un modelo de lenguaje de tipo Mixture of Experts (MoE) desarrollado por el colectivo open-athena, dentro del ecosistema del proyecto Marin. Se trata de un checkpoint en BF16 del paso 157.000 de una ejecución de comparación de contexto largo, cuya principal característica es una ventana de 262.144 tokens, obtenida mediante una fase de extensión con `qk_mult=1.75` y un sobremuestreo de documentos largos. El modelo tiene 67.078 millones de parámetros totales y aproximadamente 2.000 millones de parámetros activos por token, lo que lo hace computacionalmente mucho más barato de servir que un modelo denso del mismo tamaño.

Su relevancia actual radica en que ofrece una arquitectura MoE poco común (26 capas, 256 expertos con cuatro seleccionados por token, cinco cabezas KV) y un contexto excepcionalmente largo, ideal para experimentos e investigación en procesamiento de documentos extensos, eficiencia de inferencia y recetas de post-entrenamiento. Es un modelo base, sin afinado por instrucciones, por lo que requiere fine-tuning o un prompt cuidadosamente diseñado para tareas concretas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GrugMoe (Mixture of Experts) sobre transformer causal |
| Parametros totales | 67.078.882.816 (≈67.000 millones) |
| Parametros activos | ≈2.000 millones por token |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | BF16 (safetensors) |
| Idiomas soportados | Ingles |
| Licencia | OpenMDW 1.1 |
| Formato de pesos | Safetensors (BF16) |

## Arquitectura y entrenamiento

El modelo es un MoE con 26 capas, 256 expertos y selección de cuatro expertos por token. Tiene cinco cabezas KV (KV heads), un factor inusual que reduce la memoria de la caché KV y permite un reparto de expertos más granular durante el servicio. Su vocabulario contiene 128.256 tokens. La arquitectura se registra como `GrugMoeForCausalLM`, y el despliegue requiere específicamente el fork Marin de vLLM, que soporta esta clase de modelo.

El entrenamiento es un export del paso 157.000 de la comparación de contexto largo del proyecto Snowball. El contexto se extendió de 156.000 a 157.000 pasos con `qk_mult=1.75`, un factor de escalado de las proyecciones query-key, y los documentos largos se sobremuestrearon un factor 2× durante esta fase. Antes de la extensión, el modelo pasó por un cooldown de 5,7 billones de tokens, según el artículo sobre el pipeline de SFT de Marin. Es un modelo base, lo que significa que no ha sido sometido a RLHF ni a DPO. El exportador aplica los sesgos B de la puerta de enrutamiento pendientes antes de la conversión, pero el estado del optimizador se excluye.

## Capacidades

- Generación de texto como modelo base: produce completados de texto, pero no sigue instrucciones ni mantiene un formato conversacional sin afinado.
- Contexto largo de 262.144 tokens: puede procesar documentos masivos, como libros completos, manuales técnicos o compendios legales, con coherencia en una sola pasada.
- Eficiencia de inferencia: al activar solo ~2.000 millones de parámetros por token, el coste computacional es una fracción del de un modelo denso con el mismo volumen de parámetros.
- Enrutamiento MoE de 256 expertos con 4 activos: diversifica los submodelos de conocimiento y permite estudios sobre especialización de expertos.
- Soporte multilingüe limitado: el modelo está entrenado exclusivamente en inglés.
- Sin capacidades de tool calling, function calling, visión, audio ni modo de pensamiento: no se han documentado ni entrenado dichas funcionalidades.

## Casos de uso

- Investigación en modelos MoE de contexto largo: el modelo sirve para estudiar cómo la extensión de contexto y el sobremuestreo de documentos largos afectan a la atención, la memoria y la coherencia.
- Base para fine-tuning tipo SFT: el pipeline de Marin descrito en el blog utiliza este checkpoint como punto de partida para experimentos de cold start SFT, lo que lo convierte en un candidato para desarrollar variantes instruidas.
- Procesamiento de documentos legales extensos: un equipo podría incorporar un contrato o expediente completo en la ventana de 262K y usarlo como contexto para análisis o resumen tras un fine-tuning específico.
- Gestión documental en tarjetas de crédito o seguros: para leer y procesar miles de páginas de normativa o reclamaciones al incluir el documento íntegro en el prompt y generar explicaciones o extracciones.
- RAG de gran escala: al no necesitar fragmentación agresiva, el modelo puede recibir el corpus de referencia completo, reduciendo la pérdida de información que sufren los recuperadores tradicionales.
- Evaluación de arquitecturas MoE: la comparación con las variantes qk175 y skew del mismo run permite medir el impacto de distintos factores de escala y sesgos de muestreo en el rendimiento.
- Prototipado de pipelines de alineación: los desarrolladores pueden usar este modelo base para probar recetas de RLHF o DPO y generar datos de preferencia a partir de prompts simples de completado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El modelo no incluye puntuaciones de MMLU, HumanEval, GSM8K u otras métricas en su model card ni en los documentos asociados. El autor únicamente remite a un registro de serving y evaluación en el repositorio de Marin, sin datos numéricos accesibles en este material.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en BF16 ocupan aproximadamente 134 GB (67.078 millones × 2 bytes). Sumando la caché KV y el overhead, una instalación mínima requiere más de 140 GB de memoria total.
- Configuración documentada: 8 GPUs H100 (80 GB) con tensor parallelism 1, data parallelism 8 y expert parallelism. Cada GPU albergaría unos 16,75 GB de pesos y una parte de los expertos.
- GPU recomendadas: 8× H100 según la configuración de servicio del autor. En teoría, 8× A100 80GB podría funcionar, pero no está validado.
- En consumer GPU: no cabe en una RTX 4090 (24 GB) ni en ninguna GPU doméstica actual, dado que los pesos BF16 superan los 134 GB y no se han publicado versiones cuantizadas.
- Opciones de despliegue: exclusivamente mediante el fork Marin de vLLM. No hay soporte documentado para llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros totales | Activos por token | Contexto | Idiomas | Licencia |
|---|---|---|---|---|---|
| Snowball 67B-A2B | 67.000 millones | ~2.000 millones | 262.144 | Ingles | OpenMDW 1.1 |
| Mixtral 8x7B | 46.700 millones | 12.900 millones | 32.768 | Multilingue | Apache 2.0 |
| DeepSeek-V2-Lite | 16.000 millones | 2.400 millones | 128.000 | Ingles y chino | MIT |

La comparativa se basa en parámetros, contexto, idiomas y licencia. No se incluyen comparaciones de rendimiento porque no hay datos de benchmarks para Snowball. Mixtral 8x7B y DeepSeek-V2-Lite son alternativas MoE bien conocidas, aunque con un número total de parámetros y una ventana de contexto distintas. Snowball destaca por su contexto de 262K y su activación de solo ~2B, pero se limita al inglés y su licencia es una variante personalizada que debe revisarse.

## Limitaciones y advertencias

- Modelo base sin afinado: no está diseñado para seguir instrucciones ni para diálogo; produce completados de texto que requieren cuidado al interpretar.
- Riesgo de alucinación elevado: al no haber pasado por alineación, puede generar contenido plausible pero falso, sin mecanismos de rechazo ni verificación.
- Limitación lingüística: solo inglés, lo que lo excluye de entornos multilingües.
- Requisitos de hardware muy altos: necesita un clúster de 8 H100 para servir, lo que lo hace inaccesible para muchos equipos.
- Dependencia de un fork propietario de vLLM: la arquitectura GrugMoe no es compatible con la versión estándar de vLLM ni con otros runners.
- Sin benchmarks publicados: la ausencia de métricas objetivas dificulta la comparación directa con otros modelos y la toma de decisiones para producción.
- Validación limitada del export: el autor señala que no se ejecutaron pruebas de generación ni de paridad numérica en este upload, solo verificaciones de nombres, tamaños y checksums.
- Licencia OpenMDW 1.1: se debe leer el texto completo de esta licencia antes de cualquier uso comercial, ya que no es una licencia estándar y puede incluir condiciones poco habituales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/open-athena/snowball-67b-a2b-base-262k-qk175-skew2
- Variante sin skew: https://huggingface.co/open-athena/snowball-67b-a2b-base-262k-qk175
- Comparacion de contexto largo en Marin: https://github.com/marin-community/marin/issues/8977
- Fork Marin de vLLM: https://github.com/marin-community/vllm
- Registro de serving y evaluacion: https://github.com/marin-community/marin/issues/8702
- Articulo sobre pipeline SFT para modelos Marin: https://storage.googleapis.com/marin-public/benjaminfeuer/standing-up-a-cold-start-sft-pipeline-for-marin-models/2026.08.16/index.html
