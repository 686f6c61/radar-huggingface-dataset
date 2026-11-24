# DeepNarra/Hiraya

## Resumen
DeepNarra Hiraya 1.0 es un modelo de generación de texto de escala muy reducida (28,5 millones de parámetros en safetensors) publicado por la organización DeepNarra. Se presenta como la variante "Sovereign Edge" de un checkpoint mayor denominado Hiraya-1-Reasoning (0,91B de parámetros), del cual deriva mediante cuantización. Su diseño apunta a inferencia en dispositivos con recursos muy limitados, con un GGUF ternario de 5,85 MB y una velocidad declarada de 378,5 tokens por segundo en una Tesla T4.

La arquitectura declarada es `DeepNarraHirayaForCausalLM`, una mezcla de expertos jerárquica (H-MoE) de dos niveles con 92 sub-expertos por capa y un experto compartido persistente, combinada con un espacio latente continuo de 768 dimensiones inspirado en Coconut y con dinámicas simplécticas de Störmer-Verlet sobre geometría hiperbólica de Minkowski. El modelo activa aproximadamente 6,2 millones de parámetros por token en esta variante Edge.

Su relevancia actual reside en la propuesta de razonamiento en latente continuo a un coste computacional mínimo y en el empaquetado BitNet b1.58 (TQ1_0) para despliegue en CPU y Ollama. La información disponible proviene exclusivamente de la model card del autor; no se han localizado evaluaciones independientes ni resultados de benchmarks verificables.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DeepNarraHirayaForCausalLM: H-MoE jerárquico de dos niveles (23 macro-motores x 4 micro-expertos = 92 sub-expertos por capa) con experto compartido persistente, espacio latente continuo de 768 dimensiones (Coconut) e integrador simpléctico Störmer-Verlet |
| Parametros totales | 28.520.370 (28,5M) en safetensors; 1.331 tensores |
| Parametros activos | ~6,2M por token en esta variante Edge (~100M por token en el checkpoint completo de 0,91B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BitNet b1.58 ternario TQ1_0 (1,58 bits por peso); safetensors en precisión nativa no especificada |
| Idiomas soportados | inglés y multilingüe (según etiquetas de la model card); lista concreta de idiomas no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (model.safetensors, 108,95 MB) y GGUF (model-TQ1_0.gguf, 5,85 MB) |

## Arquitectura y entrenamiento
El modelo emplea una mezcla de expertos jerárquica en la que cada token activa el experto compartido persistente más los expertos enrutados por Top-K entre 23 macro-motores, cada uno con 4 micro-expertos. Sobre esa base se añade un mecanismo de deliberación en espacio latente continuo de 768 dimensiones (estilo Coconut), con "scratchpads" explícitos `<think>` y `<latent_thought>` que permiten evolucionar vectores de pensamiento antes de emitir tokens discretos. La dinámica latente se modela con un integrador simpléctico de Störmer-Verlet con cota declarada de conservación de energía inferior a 1e-13, y los conceptos jerárquicos se proyectan sobre un hiperboloide de Lorentz para embeddings de árbol sin distorsión, con exploración estocástica de Langevin.

Los datos de entrenamiento citados son HuggingFaceFW/fineweb-edu (ODC-By-1.0), CohereForAI/aya_collection (Apache-2.0) y m-a-p/CodeFeedback-Filtered-Instruction. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron fases de RLHF o DPO. Tampoco se detalla la receta de destilación o cuantización que produce esta variante Edge a partir del checkpoint base Hiraya-1-Reasoning.

## Capacidades
- Generación de texto autoregresiva con pipeline `text-generation` y compatibilidad con `transformers`.
- Razonamiento en latente continuo mediante los modos `<think>` y `<latent_thought>`, orientado a tareas de matemáticas y código.
- Capacidad multilingüe declarada en las etiquetas del modelo, aunque sin listado explícito de idiomas.
- Despliegue en CPU y entornos de borde gracias al GGUF ternario TQ1_0 y al `Modelfile` incluido para Ollama.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible de forma explícita; la deliberación latente multi-hop es la única indicación relacionada.
- Capacidades de visión o audio: no disponibles.

## Casos de uso
- Clasificación y etiquetado de texto en el borde: con 28,5M de parámetros y un GGUF de 5,85 MB, el modelo puede ejecutarse en dispositivos con RAM mínima para tareas de categorización o extracción de entidades en local.
- Filtrado y moderación en tiempo real: su velocidad declarada de 378,5 tok/s en una T4 permite procesar flujos de texto continuos en pipelines de bajo coste.
- Prototipado rápido de asistentes conversacionales: el `Modelfile` incluido permite levantar un endpoint local con Ollama en minutos para validar flujos antes de escalar a modelos mayores.
- Generación de código asistida en entornos de desarrollo integrados: el entrenamiento incluye CodeFeedback-Filtered-Instruction, lo que lo hace apto para autocompletado ligero o sugerencias de fragmentos cortos en herramientas de escritorio.
- Investigación en razonamiento latente: sirve como banco de pruebas reproducible para estudiar deliberación continua, dinámicas simplécticas e H-MoE a una escala que cabe en una sola GPU consumer.
- Despliegue en sistemas embebidos y robótica de bajo consumo: el formato ternario de 1,58 bits por peso reduce el coste de memoria y energía, adecuado para inferencia offline en hardware limitado.
- Educación y demostraciones: su tamaño permite distribuirlo junto con cuadernos didácticos sobre arquitecturas MoE y cuantización BitNet sin infraestructura dedicada.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible. La model card declara una velocidad medida de 378,5 tokens por segundo y 42,27 ms de latencia por paso en una Tesla T4, pero no incluye puntuaciones en MMLU, HumanEval, GSM8K ni otras evaluaciones estándar.

## Requisitos de hardware
- VRAM estimada para inferencia: inferior a 1 GB en safetensors (108,95 MB de pesos más estados de activación); aproximadamente 6 MB para el GGUF TQ1_0.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; la model card verifica funcionamiento en Tesla T4.
- Cabe en GPU consumer: sí, en cualquier GPU moderna (RTX 3060, RTX 4090, integradas con suficiente memoria compartida) e incluso en CPU.
- Opciones de despliegue: Ollama mediante el `Modelfile` incluido, `transformers` con carga de safetensors, y presumiblemente llama.cpp por el formato GGUF (no confirmado explícitamente).
- Latencia y throughput: 42,27 ms por paso y 378,5 tok/s medidos en Tesla T4 según el autor; no hay datos para otras plataformas.

## Comparativa con modelos similares
No se dispone de datos de benchmarks ni de especificaciones verificables de modelos comparables en la información proporcionada. A continuación se ofrece una comparación estructural con alternativas de escala similar ampliamente conocidas, limitada a parámetros y licencia:

| Modelo | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| DeepNarra Hiraya 1.0 | 28,5M (6,2M activos) | no disponible | Apache-2.0 | safetensors, GGUF TQ1_0 |
| SmolLM2-135M | 135M | 8.192 tokens (según documentación pública) | Apache-2.0 | safetensors, GGUF |
| Qwen2.5-0.5B | 494M | 32.768 tokens (según documentación pública) | Apache-2.0 | safetensors, GGUF |
| TinyLlama-1.1B | 1,1B | 2.048 tokens (según documentación pública) | Apache-2.0 | safetensors, GGUF |

La comparación de rendimiento no es posible con los datos disponibles; las cifras de contexto de los modelos alternativos provienen de su documentación pública y no de la información proporcionada para Hiraya.

## Limitaciones y advertencias
- Con 28,5M de parámetros totales y ~6,2M activos, la capacidad de conocimiento factual y de razonamiento complejo es estructuralmente muy limitada; no es adecuado para tareas que requieran amplio conocimiento del mundo.
- No se han publicado evaluaciones independientes ni benchmarks estándar; las afirmaciones de la model card (velocidad, conservación de energía, geometría hiperbólica) no están verificadas externamente.
- La longitud de contexto no se especifica, lo que impide planificar despliegues con conversaciones largas o documentos extensos.
- El listado concreto de idiomas soportados no está disponible; la etiqueta "multilingual" no garantiza calidad en castellano ni en otros idiomas distintos del inglés.
- Riesgo de alucinación elevado por el tamaño reducido del modelo y por la falta de datos sobre fases de alineación (RLHF/DPO).
- La licencia Apache-2.0 permite uso comercial, pero las atribuciones de los datasets upstream (ODC-By-1.0 para fineweb-edu) deben respetarse según los términos indicados en el repositorio.
- La terminología de la model card (dinámicas simplécticas, hiperboloide de Lorentz, Coconut) es poco habitual y no viene acompañada de publicaciones técnicas que la respalden; conviene tratarla con cautela hasta disponer de validación independiente.
- El modelo se publicó en octubre de 2026 con 384 descargas y 0 likes, lo que indica una adopción muy baja y ausencia de comunidad que reporte problemas.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/DeepNarra/Hiraya
- Checkpoint completo de referencia: https://huggingface.co/DeepNarra/Hiraya-1-Reasoning
- Organización DeepNarra: https://huggingface.co/DeepNarra
- Licencia Apache-2.0: http://www.apache.org/licenses/LICENSE-2.0
- Dataset fineweb-edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Dataset aya_collection: https://huggingface.co/datasets/CohereForAI/aya_collection
- Dataset CodeFeedback-Filtered-Instruction: https://huggingface.co/datasets/m-a-p/CodeFeedback-Filtered-Instruction
