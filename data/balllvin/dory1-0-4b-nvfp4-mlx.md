# balllvin/Dory1.0-4B-NVFP4-MLX

## Resumen

Dory1.0-4B-NVFP4-MLX es una cuantización en formato MLX del modelo Dory1.0-4B de NVIDIA Nemotron Labs, preparada por el usuario balllvin para su ejecución eficiente en hardware Apple Silicon. El modelo base es un transformer de aproximadamente 4.000 millones de parámetros (3.975.229.440 exactos según los safetensors) que NVIDIA publica bajo licencia OpenMDW-1.1 y que en esta variante se distribuye con pesos de 4 bits en formato NVFP4, un esquema de cuantización de punto flotante de 4 bits desarrollado por NVIDIA para acelerar la inferencia manteniendo la precisión.

La relevancia de esta ficha radica en que permite ejecutar en un Mac con chip de la serie M un modelo conversacional de tamaño medio (4B) con un consumo de memoria reducido, algo que hasta hace poco requería GPUs dedicadas. El repositorio ocupa 3,2 GB, lo que da una idea clara del ahorro de espacio y de memoria frente a los pesos en bf16 del modelo original (que rondarían los 8 GB).

No obstante, conviene señalar desde el principio que la información pública disponible sobre el modelo base es escasa en esta ficha: no se detallan aquí la longitud de contexto, la composición del dataset de entrenamiento ni los resultados de benchmarks. El acceso al repositorio está restringido (gated), por lo que es necesario aceptar las condiciones en Hugging Face antes de poder descargar los pesos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (detalles no disponibles) |
| Parametros totales | 3.975.229.440 (~4B) |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (4-bit float), formato MLX |
| Idiomas soportados | inglés (en) |
| Licencia | OpenMDW-1.1 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base es Dory1.0-4B, desarrollado por NVIDIA Nemotron Labs. Por la información disponible se trata de un transformer denso de aproximadamente 4.000 millones de parámetros, sin indicios de arquitectura Mixture-of-Experts. No se dispone de detalles sobre el número de tokens de entrenamiento, la composición del corpus, ni si se aplicaron fases de RLHF, DPO u otras técnicas de alineación.

La innovación principal de esta variante concreta no está en la arquitectura del modelo, sino en el esquema de cuantización: NVFP4 es un formato de 4 bits en coma flotante con escalado por bloques que NVIDIA ha diseñado para preservar la precisión numérica mejor que las cuantizaciones enteras de 4 bits (como INT4 o NF4). El autor de la ficha, balllvin, ha convertido los pesos al formato nativo de MLX para que puedan ejecutarse con la librería MLX de Apple en chips M1/M2/M3/M4. No se documentan en la información proporcionada detalles sobre la decodificación especulativa, atención lineal ni otras optimizaciones del modelo base.

## Capacidades

- Generación de texto conversacional: el pipeline declarado es text-generation con etiqueta conversational, orientado a diálogo multi-turno.
- Razonamiento y respuesta a instrucciones: por la naturaleza del modelo base (Nemotron Labs), se espera capacidad de seguir instrucciones, aunque no se documentan evaluaciones específicas.
- Ejecución local en Apple Silicon: gracias al formato MLX y a los pesos de 4 bits, el modelo puede correr en Macs con memoria unificada.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según la etiqueta de idioma del repositorio.
- Capacidades especiales (modo thinking, visión, audio): no disponibles en la información proporcionada.

## Casos de uso

- Asistente conversacional local en Mac: un desarrollador puede ejecutar el modelo con MLX en un MacBook con 16 GB de memoria unificada para tener un chatbot privado sin conexión a la nube, aprovechando los 3,2 GB de pesos cuantizados.
- Prototipado rápido de aplicaciones de chat: al ser un modelo de 4B en 4 bits, permite iterar sobre prompts y flujos conversacionales en un portátil sin necesidad de GPU dedicada, reduciendo el coste de experimentación.
- Generación de texto en herramientas de escritorio: integrable en aplicaciones macOS nativas mediante la librería MLX, por ejemplo para resúmenes o redacción asistida dentro de un editor.
- Evaluación de cuantizaciones: investigadores que comparan NVFP4 frente a otras cuantizaciones (GGUF Q4, bf16) pueden usar este repositorio como referencia para medir la degradación de calidad en un modelo de 4B.
- Docencia y aprendizaje: sirve para demostrar en un curso de IA el flujo completo de cuantización y despliegue local de un modelo de lenguaje en hardware de consumo Apple.
- Filtrado y clasificación de texto en inglés: tareas de etiquetado o moderación simple en pipelines por lotes donde el throughput no sea crítico y se prefiera privacidad local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/memoria estimada para inferencia: al ser pesos de 4 bits, el modelo ocupa aproximadamente 3,2 GB en disco y una cantidad similar de memoria unificada al cargarse (más overhead de activaciones y caché KV, que depende del contexto).
- GPU recomendadas: no aplica en el sentido tradicional; está pensado para Apple Silicon (M1, M2, M3, M4 y variantes Pro/Max/Ultra).
- ¿Cabe en GPU de consumo? No se documenta soporte CUDA para estos pesos MLX; para GPUs NVIDIA habría que usar el modelo base en otro formato (por ejemplo, el NVFP4 original de NVIDIA o una conversión GGUF).
- Opciones de despliegue: librería MLX (mlx-lm) en macOS; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI para este repositorio concreto.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| balllvin/Dory1.0-4B-NVFP4-MLX | ~4B | no disponible | NVFP4 4-bit (MLX) | OpenMDW-1.1 | Gated en HF |
| nvidia/NVIDIA-Nemotron-Labs-Dory1.0-4B-NVFP4 | ~4B | no disponible | NVFP4 4-bit | OpenMDW-1.1 | HF (modelo base) |
| Modelos de 4B en GGUF Q4 (genéricos) | ~4B | variable | 4-bit entero | variable | HF, Ollama |

La comparación con alternativas concretas no puede completarse con rigor porque la información disponible no incluye datos de rendimiento del modelo base ni de sus competidores directos. Lo que sí es distintivo de esta ficha es el formato MLX, que la diferencia de las distribuciones GGUF orientadas a llama.cpp y de los pesos NVFP4 originales de NVIDIA pensados para GPUs.

## Limitaciones y advertencias

- Idiomas: el repositorio declara únicamente inglés; el rendimiento en castellano no está garantizado y probablemente sea deficiente.
- Riesgo de alucinación: como todo modelo de lenguaje de 4B, puede generar información falsa con aparente seguridad; no se documentan evaluaciones de fidelidad.
- Sesgos: no se dispone de información sobre la composición del dataset ni sobre auditorías de sesgo del modelo base.
- Licencia: OpenMDW-1.1 es una licencia de pesos abiertos de NVIDIA; conviene revisar sus términos antes de un uso comercial, ya que puede incluir condiciones específicas de atribución o restricciones.
- Acceso restringido: el repositorio está gated; es necesario aceptar las condiciones en Hugging Face y disponer de token de acceso para descargarlo.
- Compatibilidad: los pesos MLX solo funcionan con la librería MLX en macOS/Apple Silicon; no son directamente utilizables en CUDA, ROCm ni en entornos Linux sin conversión.
- Contexto: se desconoce la longitud máxima de contexto, lo que impide planificar casos de uso con documentos largos.
- Cuantización: aunque NVFP4 preserva mejor la precisión que INT4, sigue siendo una cuantización agresiva; puede haber degradación en tareas de razonamiento matemático o código.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/balllvin/Dory1.0-4B-NVFP4-MLX
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-Labs-Dory1.0-4B-NVFP4
- Librería MLX: https://github.com/ml-explore/mlx
- MLX-LM: https://github.com/ml-explore/mlx-examples/tree/main/llms
- Licencia OpenMDW-1.1: no disponible en la información proporcionada (consultar en el repositorio de Hugging Face)
