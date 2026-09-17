# mradermacher/Qwen3.8-35B-A3B-Distill-GGUF

## Resumen

Esta ficha describe `mradermacher/Qwen3.8-35B-A3B-Distill-GGUF`, un repositorio de cuantizaciones estáticas en formato GGUF generadas por el usuario mradermacher a partir del modelo `empero-ai/Qwen3.8-35B-A3B-Distill`. No se trata de un modelo entrenado por el autor del repositorio, sino de una conversión de pesos ya existentes a formatos cuantizados listos para inferencia con llama.cpp y sus derivados. El recuento real de parámetros publicado en los safetensors del repositorio es de 35.505.251.456, es decir, unos 35,5 mil millones.

El interés de este repositorio es práctico: ofrece doce variantes de cuantización (desde Q2_K hasta x-f16, incluyendo IQ4_XS y todas las familias K) para que un mismo modelo pueda desplegarse en hardware muy distinto, desde equipos de consumo con 24 GB de VRAM hasta servidores con GPU de 80 GB o configuraciones con memoria unificada. La nomenclatura del nombre del modelo base, "A3B", sugiere una arquitectura de mezcla de expertos con aproximadamente 3 mil millones de parámetros activos por token, lo que implicaría una velocidad de decodificación cercana a la de un modelo denso de 3 B, pero con un requisito de memoria correspondiente a 35,5 B. Este extremo no está confirmado en la información disponible.

La relevancia del repositorio es limitada por su estado: fue creado el 17 de septiembre de 2026, cuenta con cero descargas y cero valoraciones, no incluye model card descriptiva (solo los comentarios de la plantilla de conversión), y no declara licencia ni idiomas. Además, la búsqueda web realizada no devolvió ningún resultado útil sobre el modelo base ni sobre esta conversión. Todo ello hace que, a fecha de esta ficha, el repositorio deba considerarse no validado y no apto para producción sin una evaluación previa por parte del equipo que lo adopte.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (el repositorio no documenta la arquitectura; la nomenclatura "A3B" del modelo base sugiere un transformer de mezcla de expertos, sin confirmar) |
| Parámetros totales | 35.505.251.456 (35,5 B), dato real de los safetensors del repositorio |
| Parámetros activos | no disponible (la nomenclatura "A3B" sugiere ~3 B activos, sin confirmar) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | x-f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (conversión desde HuggingFace: `convert_type: hf`, `quantize_version: 2`, `output_tensor_quantised: 1`) |
| Modelo base | empero-ai/Qwen3.8-35B-A3B-Distill |
| Tarea declarada | conversational |
| Compatibilidad declarada | endpoints_compatible |
| Tamaño del repositorio | 21,9 GB (según HuggingFace; no cubre la suma de todas las cuantizaciones listadas, lo que apunta a una publicación parcial o a un recuento incompleto) |
| Fecha de creación | 17 de septiembre de 2026 |
| Última actualización | 17 de septiembre de 2026, 13:08 UTC |

## Arquitectura y entrenamiento

La información disponible sobre este repositorio se limita a los metadatos de la conversión. No hay ningún dato publicado sobre la arquitectura del modelo base `empero-ai/Qwen3.8-35B-A3B-Distill`: ni tipo de bloque (transformer denso, mezcla de expertos, SSM o híbrido), ni número de capas, ni dimensiones ocultas, ni mecanismo de atención. El único indicio es el sufijo "A3B" del nombre, que en la convención habitual de modelos MoE (por ejemplo, Qwen3-30B-A3B) indica 3 mil millones de parámetros activos sobre un total de 35,5 B. Si esa interpretación fuese correcta, el modelo utilizaría enrutamiento por token hacia un subconjunto de expertos, con la implicación práctica de que la memoria necesaria para la inferencia corresponde al total de parámetros (35,5 B) y no a los activos.

Tampoco hay información sobre el entrenamiento: ni número de tokens, ni composición del dataset, ni si hubo ajuste por instrucciones con RLHF o DPO. El término "Distill" en el nombre del modelo base sugiere que se trata de un modelo destilado a partir de otro mayor, pero se desconoce el profesor, el método de destilación y los datos utilizados. Respecto al proceso de conversión sí hay datos concretos: la cuantización se realizó con la versión 2 del pipeline de cuantización y con salida de tensores cuantizados, partiendo de pesos en formato HuggingFace. No se declara ningún ajuste posterior a la cuantización ni corrección de calidad (por ejemplo, imatrix) en los metadatos disponibles.

## Capacidades

- Generación de texto conversacional: es la única capacidad declarada explícitamente mediante la etiqueta `conversational` del repositorio.
- Despliegue en endpoints: la etiqueta `endpoints_compatible` indica que el formato es compatible con los Inference Endpoints de HuggingFace.
- Inferencia local con llama.cpp y derivados: el formato GGUF permite ejecución en CPU, GPU o modo mixto.
- Razonamiento, matemáticas, generación de código, visión, audio o multimodalidad: no disponibles; no hay ninguna declaración al respecto en la información proporcionada.
- Soporte de tool calling o function calling: no disponible.
- Capacidades de agente y razonamiento multi-paso: no disponible.
- Modo de pensamiento (thinking mode) o decodificación especulativa: no disponible.
- Capacidades multilingües: no disponibles; el repositorio no declara ningún idioma, por lo que no puede asumirse un rendimiento correcto en castellano sin evaluarlo.

## Casos de uso

- Asistente conversacional autoalojado en infraestructura propia: al distribuirse en GGUF, el modelo puede servirse con `llama-server` u Ollama dentro de una red corporativa, sin que las conversaciones salgan de la organización. Es adecuado cuando existen requisitos de confidencialidad que impiden usar APIs externas, siempre que se valide antes la calidad del modelo base.
- Despliegue en estaciones de trabajo sin GPU de centro de datos: las variantes Q3_K_M e IQ4_XS permiten ejecutar el modelo completo en equipos con 24 GB de VRAM o en configuraciones con memoria unificada, algo inusual en modelos densos de 35 B. Resulta útil para equipos de investigación que necesitan experimentar con un modelo de este tamaño sin acceso a clúster.
- Prototipado y evaluación comparativa de cuantizaciones: un mismo repositorio ofrece doce niveles de cuantización, lo que permite medir en un entorno controlado la degradación de calidad y la ganancia de velocidad entre Q2_K y Q8_0 sobre la misma tarea. Es el uso más inmediato y menos arriesgado del repositorio.
- Servicio de chat por lotes para generación de textos internos: con la variante Q8_0 en una GPU de 80 GB puede procesarse un volumen alto de resúmenes, clasificaciones o redacciones de documentos internos, aprovechando que el coste marginal de inferencia es nulo una vez desplegado.
- Integración en herramientas de escritorio para desarrolladores: los ficheros GGUF se cargan directamente en LM Studio, Jan, koboldcpp o extensiones de VS Code basadas en llama.cpp, lo que permite disponer de un asistente de redacción de código y documentación totalmente offline.
- Base para evaluación de sesgo y alucinación antes de adopción: dado que no hay benchmarks publicados, un caso de uso razonable es someter el modelo a un conjunto de pruebas propio (veracidad, sesgo, seguimiento de instrucciones en castellano) antes de considerar cualquier despliegue con usuarios finales.
- Publicación como endpoint gestionado: gracias a la compatibilidad declarada con endpoints, puede desplegarse como servicio HTTP en HuggingFace Inference Endpoints para pruebas de integración con aplicaciones existentes, aunque la ausencia de licencia declarada obliga a resolver esa cuestión antes de cualquier uso comercial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye ninguna medición de MMLU, HumanEval, GSM8K, MT-Bench ni de evaluaciones de calidad por cuantización, y la búsqueda web realizada no devolvió documentación técnica sobre el modelo base `empero-ai/Qwen3.8-35B-A3B-Distill`. Tampoco hay datos de rendimiento de inferencia (tokens por segundo, latencia de primer token) publicados por el autor de la conversión.

## Requisitos de hardware

Tamaños estimados a partir del recuento real de parámetros (35,5 B) y de los bits por peso típicos de cada formato GGUF. Son estimaciones de cálculo, no mediciones del repositorio; hay que añadir el espacio de la caché KV, que depende del contexto configurado.

| Cuantización | Bits por peso aprox. | Peso estimado | VRAM recomendada con contexto moderado |
|---|---|---|---|
| Q2_K | ~2,7 | ~12 GB | 16 GB |
| Q3_K_S | ~3,4 | ~15 GB | 20 GB |
| Q3_K_M | ~3,9 | ~17,5 GB | 24 GB |
| IQ4_XS | ~4,25 | ~19 GB | 24 GB |
| Q3_K_L | ~4,3 | ~19 GB | 24 GB |
| Q4_K_S | ~4,6 | ~20,5 GB | 24 GB |
| Q4_K_M | ~4,85 | ~21,5 GB | 24-32 GB |
| Q5_K_S | ~5,5 | ~24,5 GB | 32 GB |
| Q5_K_M | ~5,7 | ~25,5 GB | 32-40 GB |
| Q6_K | ~6,6 | ~29,5 GB | 40 GB |
| Q8_0 | ~8,5 | ~38 GB | 48-80 GB |
| x-f16 | 16 | ~71 GB | 80 GB |

- Tarjetas de 24 GB (RTX 3090, RTX 4090, RTX 5090, A5000): admiten Q4_K_M, Q4_K_S, IQ4_XS y toda la familia Q3 con contexto moderado. Requieren reducir la ventana de contexto si se quiere mantener todo en VRAM.
- Tarjetas de 48 GB (2x RTX 4090, A6000, L40S): permiten Q5_K_M y Q6_K completos, con margen para caché KV amplia.
- Tarjetas de 80 GB (A100 80 GB, H100 80 GB): Q8_0 con holgura y x-f16 muy al límite (71 GB de pesos más caché KV y activaciones).
- Memoria unificada (Apple Silicon de 64 GB o 128 GB): opción práctica para Q6_K y Q8_0 con `llama.cpp` y offload completo a GPU.
- CPU con 32 GB de RAM: viable con Q3_K_M o Q2_K, con velocidad de decodificación baja y muy dependiente del ancho de banda de memoria.
- Advertencia sobre MoE: si se confirma que el modelo es de mezcla de expertos con ~3 B activos, la velocidad de decodificación sería alta, pero todos los expertos deben residir en memoria, de modo que el requisito de VRAM/RAM es el del total de 35,5 B y no el de los parámetros activos.
- Opciones de despliegue: `llama.cpp` (`llama-server`), Ollama, LM Studio, koboldcpp, Jan, `llama-cpp-python` y text-generation-webui son compatibles de forma nativa con GGUF. vLLM y TGI no son la vía recomendada para GGUF: TGI no lo soporta y el soporte en vLLM es limitado y con menor rendimiento que en llama.cpp.
- Latencia y throughput: no disponibles. No hay ninguna medición publicada para este repositorio ni para el modelo base.

## Comparativa con modelos similares

No se dispone de datos verificados del modelo evaluado, por lo que la comparación es necesariamente parcial. Los datos de las alternativas proceden de la documentación pública de cada proyecto y no han sido verificados en la búsqueda realizada para esta ficha.

| Modelo | Parámetros totales | Parámetros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-35B-A3B-Distill (GGUF de mradermacher) | 35,5 B (dato real) | no disponible | no disponible | no disponible | GGUF en HuggingFace |
| Qwen3-30B-A3B | ~30,5 B | ~3,3 B | 32.768 nativos, ampliable con YaRN | Apache 2.0 | Pesos originales y GGUF de terceros |
| Mixtral 8x7B Instruct | ~46,7 B | ~12,9 B | 32.768 | Apache 2.0 | Pesos originales y múltiples GGUF |
| DeepSeek-V2-Lite Chat | ~15,7 B | ~2,4 B | 32.768 | Licencia propia de DeepSeek | Pesos originales y GGUF |

La diferencia más relevante frente a estas alternativas no es de capacidades, que no se pueden comparar sin benchmarks, sino de trazabilidad: las tres alternativas tienen model card completa, licencia declarada y evaluaciones publicadas, mientras que el modelo aquí descrito no ofrece ninguno de esos elementos.

## Limitaciones y advertencias

- Licencia no declarada: sin licencia explícita no puede asumirse permiso para uso comercial, redistribución o modificación. Es un bloqueo previo a cualquier despliegue en producción.
- Sin model card: el repositorio solo contiene los comentarios de la plantilla de cuantización. No hay descripción del modelo base, ni instrucciones de uso, ni formatos de prompt recomendados.
- Modelo base opaco: no se ha encontrado documentación pública de `empero-ai/Qwen3.8-35B-A3B-Distill`. Se desconoce su procedencia, sus datos de entrenamiento y si el término "Distill" implica restricciones adicionales heredadas del modelo profesor.
- Sin benchmarks ni validación: el repositorio tiene cero descargas y cero valoraciones, y no se han publicado evaluaciones. No hay evidencia de que las cuantizaciones funcionen correctamente ni de que el modelo base sea competitivo.
- Idiomas no declarados: no puede asumirse un rendimiento aceptable en castellano. Es imprescindible evaluarlo antes de destinarlo a usuarios hispanohablantes.
- Riesgo de alucinación: inherente a los modelos de lenguaje generativos, y sin datos de evaluación no puede acotarse su magnitud. No debe usarse como fuente de verdad sin verificación humana.
- Degradación por cuantización: las variantes Q2_K, Q3_K_S y Q3_K_L implican pérdidas de precisión notables en modelos de este tamaño. Para tareas de razonamiento o código, conviene partir de Q5_K_M o superior.
- Consumo de memoria en caso de MoE: si se confirma la arquitectura de mezcla de expertos, la VRAM necesaria es la del total de parámetros, no la de los activos, lo que puede llevar a error al planificar el hardware.
- Requisitos de contexto desconocidos: al no declararse la longitud de contexto, no puede configurarse `n_ctx` con criterio ni garantizarse el comportamiento en conversaciones largas.
- Conversión de terceros: al tratarse de una cuantización comunitaria, no hay garantía de que el proceso se haya validado contra los pesos originales más allá de los controles automáticos del pipeline.
- Fechas del repositorio: la creación y la última actualización se registran en septiembre de 2026, lo que indica un artefacto extremadamente reciente y sin rodaje en la comunidad.
- Sesgos: no disponibles. No se ha publicado ningún análisis de sesgo sobre el modelo base ni sobre estas cuantizaciones.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Qwen3.8-35B-A3B-Distill-GGUF
- Modelo base: https://huggingface.co/empero-ai/Qwen3.8-35B-A3B-Distill
- Perfil del autor de las cuantizaciones: https://huggingface.co/mradermacher
- llama.cpp, motor de inferencia para GGUF: https://github.com/ggml-org/llama.cpp
- Ollama, despliegue simplificado de GGUF: https://github.com/ollama/ollama
- Nota: la búsqueda web realizada no devolvió ningún resultado relevante sobre este modelo, su arquitectura o sus benchmarks; los únicos resultados obtenidos no guardaban relación con el tema.
