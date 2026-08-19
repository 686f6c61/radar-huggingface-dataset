# SC117/Qwen3.6-35B-A3B-uncensored-heretic-Native-MTP-Preserved-APEX-GGUF

## Resumen

Este repositorio contiene los pesos GGUF del modelo Qwen3.6-35B-A3B en su variante decensurada, cuantizados con la técnica APEX (Adaptive Precision EXplorer). El modelo base es `llmfan46/Qwen3.6-35B-A3B-uncensored-heretic-Native-MTP-Preserved`, que a su vez deriva de `Qwen/Qwen3.6-35B-A3B` de Alibaba, un modelo de arquitectura MoE con 35.100 millones de parámetros totales y aproximadamente 3.000 millones de parámetros activos por token. La versión decensurada se ha obtenido mediante el pipeline Heretic v1.3.0 + MPOA (abliteración y desbloqueo de rechazos), reduciendo los rechazos del modelo en un 88 % (10/100 frente a 83/100 en el original) con una divergencia KL de solo 0,0015 respecto al modelo base, lo que indica una mínima pérdida de calidad.

La relevancia de este repositorio radica en dos aspectos: por un lado, ofrece una versión sin censura de un modelo MoE de alto rendimiento, adecuada para experimentación en entornos donde los guardarraíles del modelo original interfieren; por otro, aplica la cuantización APEX, una técnica específica para arquitecturas MoE que clasifica cada tensor según su función (experto enrutado, experto compartido o atención) y asigna una precisión por capa, logrando según el autor una perplejidad inferior a Q8_0 con la mitad del tamaño e incluso superando a F16 en algunos casos. El modelo conserva la predicción multi-token (MTP) nativa y una ventana de contexto de hasta 262.144 tokens. Se distribuye bajo licencia Apache 2.0 y el repositorio acumula más de 96.000 descargas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE) con atención y MTP nativo (Qwen 3.6) |
| Parametros totales | 35.100 millones (35,1B) |
| Parametros activos | ~3.000 millones (~3B) |
| Longitud de contexto | 262.144 tokens (258K nativo) |
| Tipos de cuantizacion | APEX (perfiles I-Compact, I-Balanced, I-Quality) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizacion APEX) |

## Arquitectura y entrenamiento

El modelo base Qwen3.6-35B-A3B emplea una arquitectura MoE con un total de 35,1B parámetros, de los cuales se activan aproximadamente 3B en cada paso de inferencia. Incorpora predicción multi-token (MTP) nativa, lo que permite predecir varios tokens futuros simultáneamente y mejora la velocidad de decodificación. La ventana de contexto alcanza los 262.144 tokens, lo que habilita el procesamiento de documentos muy extensos.

Sobre esta base, el autor `llmfan46` aplicó el proceso Heretic v1.3.0 combinado con MPOA (Multi-Parameter Optimization Alignment) para eliminar los comportamientos de rechazo y los filtros de seguridad del modelo original, produciendo la variante "uncensored-heretic". Según los datos publicados, esta intervención reduce los rechazos de 83/100 a 10/100 en una prueba de 100 prompts sensibles, con una divergencia KL de 0,0015 respecto al modelo original, lo que sugiere que las capacidades generales se mantienen prácticamente intactas.

Posteriormente, el repositorio actual aplica la cuantización APEX, desarrollada por mudler. APEX es una técnica de cuantización mixta de precisión consciente de la arquitectura MoE: clasifica cada tensor según su rol (experto enrutado, experto compartido o atención) y aplica un gradiente de precisión por capa, otorgando mayor precisión a las capas de borde más sensibles y comprimiendo con mayor agresividad las capas intermedias redundantes. El resultado son tres perfiles de cuantización con tamaños de 15,85 GB (I-Compact), 24,18 GB (I-Balanced) y 21,90 GB (I-Quality), según la actualización de junio de 2026.

## Capacidades

- Generacion de texto, razonamiento, codigo y matematicas, heredadas del modelo Qwen 3.6 base.
- Prediccion multi-token (MTP) nativa, que acelera la decodificacion y mejora la coherencia en generaciones largas.
- Ventana de contexto de 262.144 tokens, apta para analisis de documentos extensos y conversaciones de multiples turnos.
- Sin filtros de censura ni rechazos: responde a prompts sensibles sin los guardarrailes del modelo original (comportamiento "uncensored").
- Soporte de tool calling y function calling, tipico de la familia Qwen 3.6 (no confirmado explicitamente en la documentacion del repositorio, pero esperable por la base).
- Capacidades de agente y razonamiento multi-paso, derivadas del modelo base.
- El pipeline del modelo base se etiqueta como image-text-to-text, aunque la version GGUF aqui publicada es exclusivamente de texto; la capacidad de vision no esta disponible en estos pesos.

## Casos de uso

- Atencion al cliente automatizada: la ventana de contexto de 262K tokens permite gestionar conversaciones multi-turno con historial completo y documentos de referencia extensos, manteniendo el estado de la conversacion sin truncamientos.
- Generacion de codigo en produccion: con soporte de tool calling, puede integrarse en pipelines de CI/CD para autogenerar pruebas, documentacion o parches, aprovechando su capacidad de razonamiento para tareas complejas de refactorizacion.
- Analisis de documentos legales o academicos: el contexto largo posibilita procesar contratos, tesis o expedientes completos en una sola pasada, extrayendo resumenes, clausulas relevantes o inconsistencias.
- Creacion de contenido creativo sin restricciones: escritura de ficcion, guiones o dialogos con tematicas adultas o controvertidas, donde el modelo original rechazaria la peticion.
- Simulacion de roles y chatbots de personaje: al no tener filtros de rechazo, puede mantener personajes con personalidades extremas o temas delicados sin interrumpir la interaccion.
- Investigacion en seguridad y alineacion de modelos: permite estudiar el comportamiento de un modelo sin guardarrailes, analizando sesgos, riesgos de alucinacion y estrategias de mitigacion.
- Despliegue en hardware consumer: gracias a la cuantizacion APEX I-Compact (15,85 GB), puede ejecutarse en GPUs de 16-24 GB como la RTX 4080/4090, facilitando prototipos locales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible para esta version cuantizada. El autor del repositorio afirma que la cuantizacion APEX supera a Q8_0 en perplejidad con la mitad del tamano e incluso supera a F16, pero no se proporcionan cifras concretas. El modelo base Qwen3.6-35B-A3B deberia presentar resultados competitivos dentro de su categoria, pero no se dispone de datos verificables en esta ficha.

## Requisitos de hardware

- Perfil I-Compact: 15,85 GB de tamano de archivo; requiere aproximadamente 16-18 GB de VRAM para inferencia en FP16 de activaciones. Cabe en una RTX 4080/4090 (16-24 GB) o en una RTX 3090 (24 GB).
- Perfil I-Balanced: 24,18 GB; requiere unos 26-28 GB de VRAM. Necesita una GPU profesional como A100 40GB o RTX 4090 con cuantizacion adicional de activaciones.
- Perfil I-Quality: 21,90 GB; similar al anterior, recomendado para A100 o H100.
- Segun la busqueda web, a Q4_K_M el modelo necesita aproximadamente 21,45 GB de VRAM, lo que lo situa en el rango de GPUs de 24 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF. vLLM puede cargar GGUF mediante el backend de llama.cpp, aunque con menor rendimiento que los formatos nativos.
- Latencia y throughput: no disponibles en la documentacion. Como referencia, un MoE con 3B activos suele ofrecer velocidades de decodificacion de 30-60 tokens/s en una RTX 4090 con cuantizacion 4-bit, pero no hay mediciones oficiales.

## Comparativa con modelos similares

| Modelo | Parametros totales | Activos | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.6-35B-A3B (base) | 35,1B | ~3B | 262K | Apache 2.0 | Modelo original con guardarrailes |
| Qwen3.6-35B-A3B-uncensored-heretic | 35,1B | ~3B | 262K | Apache 2.0 | Version decensurada (Heretic + MPOA) |
| Este repositorio (APEX GGUF) | 35,1B | ~3B | 262K | Apache 2.0 | Cuantizacion APEX del modelo decensurado |
| Qwen3-32B (generacion anterior) | 32,8B | ~3B | 131K | Apache 2.0 | MoE similar, sin MTP nativo, contexto menor |

No se dispone de datos comparativos de rendimiento entre estas variantes en la informacion proporcionada. La comparativa se limita a caracteristicas arquitectonicas y de licencia.

## Limitaciones y advertencias

- Ausencia total de guardarrailes: al ser una version decensurada, el modelo puede generar contenido ofensivo, ilegal, peligroso o moralmente cuestionable. No es apto para aplicaciones orientadas al publico general sin un sistema de moderacion externo.
- Riesgo de alucinacion: como cualquier modelo de lenguaje, puede inventar hechos, citas o datos. La ausencia de filtros no reduce este riesgo y puede amplificarlo en contextos delicados.
- Sesgos conocidos: el modelo base puede presentar sesgos de genero, raza o ideologia; la eliminacion de rechazos no corrige estos sesgos, sino que los expone sin atenuacion.
- Limitaciones de idioma: no se han publicado los idiomas soportados; aunque Qwen 3.6 es multilingue, no hay garantia de cobertura uniforme.
- Restricciones de licencia: la licencia Apache 2.0 permite uso comercial, pero el despliegue de un modelo sin censura puede incurrir en responsabilidades legales o de plataforma (violacion de terminos de servicio de proveedores cloud).
- La cuantizacion APEX, aunque optimizada, introduce perdida de precision respecto al modelo en FP16; en tareas de razonamiento complejo o generacion de codigo, los perfiles mas agresivos (I-Compact) pueden degradar la calidad.
- El formato GGUF no soporta la modalidad de vision del modelo base; si se necesita procesamiento de imagenes, debe usarse el modelo original en safetensors.
- El pipeline se etiqueta como image-text-to-text, pero los pesos GGUF aqui publicados son exclusivamente de texto; cualquier uso multimodal requerira el modelo base sin cuantizar.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/SC117/Qwen3.6-35B-A3B-uncensored-heretic-Native-MTP-Preserved-APEX-GGUF
- Modelo base decensurado: https://huggingface.co/llmfan46/Qwen3.6-35B-A3B-uncensored-heretic-Native-MTP-Preserved
- Modelo original de Qwen: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Repositorio de APEX: https://github.com/mudler/apex-quant
- Guia de ejecucion en 12GB VRAM (referencia externa): https://github.com/shiqikuangsan31/Qwen3.6-35B-12GB-VRAM-Guide
