# EPFL-LARA/Qwen3.8-Flash-Next-ProofOpt-ReasoningSFT-step52-FP8

## Resumen

Qwen3.8-Flash-Next-ProofOpt-ReasoningSFT-step52-FP8 es un adaptador LoRA fusionado sobre el modelo base Qwen3.8-Flash-Next, desarrollado por el laboratorio EPFL-LARA (Laboratorio de Razonamiento y Análisis Aumentado de la EPFL). El modelo está especializado en la optimización de demostraciones formales en Lean, combinando acciones de prueba (proof actions) con planes de razonamiento sintéticos generados por el propio modelo base. Se publica como un checkpoint FP8 nativo de aproximadamente 180.000 millones de parámetros, lo que lo sitúa en la gama de modelos de gran escala con capacidades multimodales (image-text-to-text).

La relevancia de esta ficha radica en que documenta un experimento de ajuste fino muy acotado: 52 actualizaciones de optimizador sobre 364 acciones de prueba seleccionadas, de las cuales 294 incorporan planes de razonamiento prospectivo. No se trata de un modelo de propósito general, sino de una adaptación de investigación orientada a medir la adaptación a un benchmark concreto de 15 problemas de Lean. El autor advierte explícitamente que el rendimiento en esos problemas mide adaptación al benchmark, no generalización a teoremas no vistos.

El modelo conserva la arquitectura, tokenizador, plantilla de chat y licencia del Qwen3.8-Flash-Next original. La innovación principal es el empaquetado: se fusiona el LoRA entrenado en 84 proyecciones de atención y GDN que la configuración FP8 oficial ya mantiene en BF16, preservando el resto de tensores cuantizados intactos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con proyecciones GDN (Gated DeltaNet) y mezcla de expertos (MoE) según el modelo base Qwen3.8-Flash-Next; no se detalla la configuración exacta en la información disponible |
| Parámetros totales | 179.999.981.459 (~180B) |
| Parámetros activos | no disponible |
| Longitud de contexto | 266.400 tokens (verificado en las pruebas de runtime con 10 streams simultáneos a esa longitud) |
| Tipos de cuantización | FP8 nativo (base oficial); el LoRA se fusiona en BF16 en 84 proyecciones de atención/GDN; el resto de tensores permanece cuantizado en FP8 |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (licencia "other" según metadatos de HuggingFace) |
| Formato de pesos | safetensors (transformers, PEFT) |

## Arquitectura y entrenamiento

El modelo parte del checkpoint BF16 original de Qwen3.8-Flash-Next (revisión `de4b8e4d43b917e7706784d8bb445c9af86a3540`) y se entrena un LoRA nuevo, sin inicializar desde adaptadores SFT previos. El entrenamiento consiste en una sola pasada con 52 actualizaciones del optimizador, batch efectivo de 7, microbatch de 1 y paralelismo TP8/EP8 sobre ocho GPUs B300. El LoRA tiene rango 32, alpha 64, dropout 0, y se aplica únicamente a las proyecciones de atención y GDN; los pesos de expertos, router, PLE, visión y MTP permanecen congelados. La tasa de aprendizaje es 1e-5 con cinco actualizaciones de warmup y decaimiento coseno hasta 1e-6 en la actualización 52.

Se procesaron 2.593.520 tokens, incluidos 224.624 tokens de acción y 78.592 tokens de razonamiento, sin truncamiento y con una secuencia máxima de 13.435 tokens. Las entradas originales y los resultados de herramientas no reciben pérdida. Se aplican pesos nativos por token para que la masa supervisada de cada plan no supere la de su acción correspondiente, con normalización por cada actualización fija de siete ejemplos. Los planes de razonamiento son explicaciones sintéticas producidas por el modelo BF16 original con acceso al estado inicial y a la edición propuesta; no son pensamientos ocultos recuperados. El límite de 8.192 tokens de razonamiento es un techo: los planes aceptados contienen entre 21 y 559 tokens nativos supervisados. Salidas truncadas, no soportadas o no resueltas usan retroceso a solo-acción. Treinta planes fueron revisados contra las pruebas y ediciones originales, lo que no constituye una certificación matemática independiente.

El empaquetado FP8 conserva la base FP8 nativa oficial (revisión `236dfdf285828023ca3bcd3f37366c58a3469b13`). PEFT fusiona el LoRA entrenado en 84 proyecciones de atención/GDN que la configuración FP8 oficial ya mantiene en BF16. Todos los demás valores de tensores, expertos cuantizados, tokenizador, plantilla de chat, configuración y licencia original se conservan exactamente. El SHA-256 del adaptador del checkpoint es `d7f84c107fb0e6b0b7c3dc0431a56130567d4fdb5ef6c23970f9327e6c1e31f6`.

## Capacidades

- Generación de texto y razonamiento multimodal (pipeline image-text-to-text), heredado del modelo base Qwen3.8-Flash-Next.
- Optimización de demostraciones formales en Lean: propone ediciones y acciones de prueba sobre estados de prueba existentes.
- Razonamiento multi-paso con planes sintéticos: genera explicaciones prospectivas antes de ejecutar acciones de prueba, con un techo de 8.192 tokens de razonamiento.
- Ejecución de herramientas nativas: las pruebas de runtime verificaron 10/10 clientes de herramienta Lemex nativos.
- Soporte de tool calling / function calling a través del perfil nativo de razonamiento/herramientas de Lemex.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Modo de razonamiento con pesos por token que limitan la masa supervisada de los planes respecto a las acciones.

## Casos de uso

- Optimización de pruebas Lean en investigación formal: el modelo recibe un estado de prueba y una edición propuesta, y genera un plan de razonamiento más una acción de prueba. Es adecuado porque fue entrenado específicamente sobre 364 acciones de prueba seleccionadas con contexto completo preservado.
- Asistencia a matemáticos en refactorización de demostraciones: dado un contexto de prueba y una acción candidata, el modelo explica la justificación antes de aplicarla, lo que facilita la revisión humana de ediciones en repositorios Lean.
- Evaluación de adaptación a benchmarks de Lean: sirve como checkpoint de referencia para medir cuánto se adapta un modelo de 180B a 15 problemas concretos mediante 52 pasos de SFT, con retroceso a solo-acción cuando el plan no es válido.
- Integración en pipelines de verificación con Lemex: los 10/10 clientes de herramienta verificados permiten usar el modelo como backend de un agente que ejecuta acciones de prueba y consulta resultados de herramientas dentro del flujo de Lemex.
- Procesamiento de contextos largos en tareas de prueba: con 266.400 tokens de contexto y 10 streams simultáneos sin preempciones de KV, es viable alimentar demostraciones extensas y múltiples estados de prueba en paralelo.
- Investigación sobre razonamiento sintético supervisado: el modelo permite estudiar el efecto de añadir planes de razonamiento sintéticos (294 de 364 ejemplos) frente a entrenar solo con acciones, comparándolo con el experimento ActionSFT del mismo autor.
- Despliegue multimodal en entornos con GPUs A100: las pruebas de aceptación se ejecutaron en cuatro A100 de 80 GB con probabilidades finitas en 16 casos de entrada fija, lo que lo hace utilizable en infraestructura académica estándar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que no se ha ejecutado un benchmark completo para esta release y que el rendimiento en los 15 problemas objetivo mide adaptación al benchmark, no generalización. Las únicas verificaciones reportadas son de runtime: 16 casos de entrada fija con probabilidades finitas, 3/3 sondas de razonamiento con respuesta conocida y texto de razonamiento no vacío verificado en la respuesta cruda atribuida, 10 streams simultáneos de contexto completo a 266.400 tokens con cero preempciones de KV y decodificación solapada, y 10/10 clientes de herramienta Lemex nativos.

## Requisitos de hardware

- VRAM estimada para inferencia: el repo pesa 185,6 GB en FP8; se requiere al menos esa cantidad agregada de memoria, distribuida entre GPUs.
- GPU recomendadas: el entrenamiento usó ocho B300 con TP8/EP8; las pruebas de aceptación se ejecutaron en cuatro A100 de 80 GB (320 GB agregados).
- Cabe en GPU de consumo: no. Con ~180B parámetros en FP8 y 185,6 GB de pesos, no es viable en RTX 4090 (24 GB) ni en configuraciones consumer típicas.
- Opciones de despliegue: transformers con PEFT (formato de publicación); no se confirman vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: no disponibles. Se verificó decodificación solapada con 10 streams concurrentes a contexto 266.400, pero sin cifras de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next-ProofOpt-ReasoningSFT-step52-FP8 | ~180B | 266.400 | Optimización de pruebas Lean con razonamiento sintético | qwen-community-1.0 | HuggingFace (EPFL-LARA) |
| Qwen3.8-Flash-Next-ProofOpt-ActionSFT-step52-FP8 | ~180B (mismo base) | no disponible | Solo acciones de prueba, sin planes de razonamiento | qwen-community-1.0 | HuggingFace (EPFL-LARA) |
| Qwen/Qwen3.8-Flash-Next (base) | ~180B | no disponible | Propósito general multimodal | qwen-community-1.0 | HuggingFace (Qwen) |

La comparación directa con el experimento ActionSFT del mismo autor es la más relevante: ambos parten de las mismas 364 acciones, pero ReasoningSFT añade 294 planes de razonamiento prospectivo. No se dispone de métricas de benchmark que cuantifiquen la diferencia de rendimiento entre ambos.

## Limitaciones y advertencias

- El autor advierte que el rendimiento en los 15 problemas del benchmark mide adaptación, no generalización a teoremas no vistos; no se ha ejecutado un benchmark completo.
- Los planes de razonamiento son explicaciones sintéticas generadas por el modelo BF16 original, no pensamientos ocultos recuperados; solo 30 de ellos fueron revisados contra las pruebas originales, sin certificación matemática independiente.
- Riesgo de alucinación en la justificación de ediciones: los planes pueden ser plausibles pero incorrectos, y el retroceso a solo-acción solo cubre salidas truncadas, no soportadas o no resueltas.
- Las verificaciones de runtime (probabilidades finitas, sondas de respuesta conocida, concurrencia de contexto) no demuestran retención amplia de razonamiento ni mejora en puntuaciones de optimización de pruebas.
- Licencia qwen-community-1.0: es necesario revisar el archivo LICENSE para confirmar restricciones de uso comercial, ya que los metadatos indican "other".
- Idiomas soportados no disponibles; no se puede garantizar cobertura multilingüe más allá del comportamiento del modelo base.
- El entrenamiento es extremadamente corto (52 actualizaciones, 2,59M tokens), lo que limita la magnitud de la adaptación y hace que el checkpoint sea sensible al dominio de Lean.
- El contexto máximo verificado es de 266.400 tokens, pero la secuencia máxima de entrenamiento fue de 13.435 tokens; el comportamiento en contextos mucho más largos no está validado más allá de las pruebas de capacidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/EPFL-LARA/Qwen3.8-Flash-Next-ProofOpt-ReasoningSFT-step52-FP8
- Experimento ActionSFT relacionado: https://huggingface.co/EPFL-LARA/Qwen3.8-Flash-Next-ProofOpt-ActionSFT-step52-FP8
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Modelo base en FP8: https://huggingface.co/Qwen/Qwen3.8-Flash-Next-FP8
- README del modelo base (preservado en el repo): BASE_MODEL_README.md
- Licencia (preservada en el repo): LICENSE
