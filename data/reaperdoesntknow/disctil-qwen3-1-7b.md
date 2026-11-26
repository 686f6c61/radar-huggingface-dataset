# reaperdoesntknow/Disctil-Qwen3-1.7B

## Resumen

Disctil-Qwen3-1.7B es un ajuste fino supervisado (SFT) del modelo reaperdoesntknow/DiStil-Qwen3-1.7B-uncensored, desarrollado por el usuario reaperdoesntknow bajo el paraguas de Convergent Intelligence LLC: Research Division. Se trata de la "nodo refinado con DISC" dentro de la cadena de destilación DistilQwen, una familia de modelos que aplica destilación de conocimiento desde Qwen3-30B-A3B hacia variantes de 1.7B y 0.6B. El modelo hereda la arquitectura de Qwen3, un transformer decoder-only de aproximadamente 2.030 millones de parametros, y esta pensado para despliegue en entornos edge gracias a su reducido tamano.

El modelo se entrena mediante SFT con TRL sobre el checkpoint base "uncensored", lo que sugiere un sesgo hacia respuestas sin los filtros de alineamiento habituales del Qwen3 original. La model card introduce un marco matematico propio, el "calculo de discrepancia" (Discrepancy Calculus, DISC), que el autor presenta como una tecnica de refinamiento del espacio de pesos para preservar fronteras estructurales que el ajuste fino convencional difumina. Esta justificacion teorica no viene acompanada de resultados empiricos publicados en la informacion disponible.

La relevancia del modelo es limitada pero concreta: ofrece una alternativa de 2B parametros, formato safetensors y licencia no declarada, orientada a experimentacion con destilacion y a despliegues de bajo coste. No obstante, la ausencia de benchmarks, de especificacion de licencia y de idiomas soportados obliga a tratarlo con cautela en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen3), ajuste fino SFT |
| Parametros totales | 2.031.739.904 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; el repo ocupa 4.1 GB) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card solo indica "licence: license") |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de la familia Qwen3 con 2.031 millones de parametros, obtenido por ajuste fino supervisado (SFT) sobre reaperdoesntknow/DiStil-Qwen3-1.7B-uncensored. El entrenamiento se realizo con TRL 0.29.1, Transformers 5.0.0, PyTorch 2.10.0+cu128, Datasets 4.0.0 y Tokenizers 0.22.2. La model card no especifica el numero de tokens de entrenamiento, la composicion del dataset ni si hubo etapas de RLHF o DPO posteriores al SFT.

La innovacion tecnica declarada es el "refinamiento DISC" (Discrepancy Calculus), un marco de teoria de la medida que el autor describe como una descomposicion del espacio de pesos en componentes absolutamente continuas, saltos y conjuntos de Cantor, preservando fronteras estructurales que el ajuste fino estandar difumina. El autor cita el teorema de meta-discrepancia (Th. 11.15) para argumentar que la optimizacion suave clasica no captura toda la estructura cuando la medida de hueco y la energia de discrepancia son positivas. No se aportan datos empiricos que cuantifiquen el efecto de esta tecnica sobre el rendimiento del modelo.

## Capacidades

- Generacion de texto conversacional en formato chat (el ejemplo de la model card usa pipeline con mensajes de rol user).
- Razonamiento y respuesta a preguntas abiertas, segun el ejemplo de "maquina del tiempo" incluido en la model card.
- Ajuste fino sobre un checkpoint "uncensored", lo que implica menor rechazo a peticiones que los modelos alineados convencionalmente (no verificado empiricamente).
- Compatibilidad con text-generation-inference y endpoints compatibles, segun los tags del repositorio.
- Soporte de tool calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible (idiomas no declarados).
- Capacidades especiales (vision, audio, thinking mode): no disponible.

## Casos de uso

- Experimentacion con destilacion de conocimiento: el modelo sirve como nodo final de una cadena de destilacion desde Qwen3-30B-A3B hacia 1.7B, util para investigadores que quieran reproducir o comparar la metodologia DistilQwen en un entorno controlado.
- Despliegue en dispositivos edge: con 2.031 millones de parametros y pesos safetensors de 4.1 GB en BF16, cabe en GPUs de consumo y en placas con memoria unificada, lo que permite prototipos de asistentes locales sin conexion.
- Generacion de texto conversacional de bajo coste: adecuado para chatbots de prototipo o demos donde el coste por inferencia es critico y no se requiere alta precision.
- Fine-tuning posterior como base: al ser un checkpoint SFT pequeno, sirve como punto de partida para ajustes especificos de dominio con presupuesto reducido.
- Evaluacion de tecnicas de refinamiento estructural: util para quienes quieran contrastar empiricamente las afirmaciones del marco DISC frente a un SFT convencional sobre el mismo checkpoint base.
- Pruebas de robustez y seguridad: al derivar de un modelo "uncensored", permite estudiar el comportamiento de modelos sin alineamiento en entornos de investigacion controlados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 4.1 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica, entre 5 y 6 GB para contextos cortos.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 2.1 GB de pesos; en 4 bits, alrededor de 1.1 GB (estimaciones teoricas, no verificadas para este checkpoint).
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090, A100 y H100 para despliegues de mayor throughput.
- Cabe en GPU de consumo: si, en cualquier GPU con 6 GB o mas de VRAM en BF16, y en GPUs de 4 GB con cuantizacion.
- Opciones de despliegue: transformers (pipeline nativo), text-generation-inference (tag endpoints_compatible), vLLM y llama.cpp/Ollama previa conversion a GGUF (no se proporciona GGUF en el repo).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Disctil-Qwen3-1.7B | 2.031 M | no disponible | no disponible | safetensors | SFT sobre checkpoint uncensored, refinamiento DISC |
| DiStil-Qwen3-1.7B-uncensored | ~1.7B (nominal) | no disponible | no disponible | BF16 | Modelo base del que deriva |
| Qwen3-1.7B-Coder-Distilled-SFT | ~1.7B (nominal) | no disponible | no disponible | BF16 | Misma familia, orientado a codigo |
| Qwen3-1.7B-Thinking-Distil | ~1.7B (nominal) | no disponible | no disponible | BF16 | Misma familia, orientado a razonamiento |

La comparativa se limita a modelos de la misma familia DistilQwen porque no se dispone de datos de rendimiento que permitan contrastar con alternativas externas de tamano similar (por ejemplo, Qwen3-1.7B original, Llama 3.2 1B o Gemma 2 2B) sin inventar cifras.

## Limitaciones y advertencias

- Ausencia total de benchmarks publicados: no hay evidencia empirica del rendimiento en MMLU, HumanEval, GSM8K ni tareas conversacionales.
- Licencia no declarada: la model card solo indica "licence: license", lo que impide determinar si el uso comercial esta permitido. Es un riesgo legal relevante para produccion.
- Idiomas no declarados: no se puede garantizar un comportamiento multilingue correcto.
- Longitud de contexto no especificada: se desconoce la ventana efectiva, lo que limita el diseno de aplicaciones con contexto largo.
- Derivado de un checkpoint "uncensored": mayor probabilidad de generar contenido inapropiado, sesgado o danino; requiere moderacion externa en produccion.
- Riesgo de alucinacion inherente a un modelo de 2B parametros con SFT: esperable una fiabilidad factual baja en tareas de conocimiento.
- Marco teorico DISC no validado de forma independiente: las afirmaciones sobre preservacion estructural de pesos no vienen acompanadas de ablaciones publicadas.
- Modelo de nicho con 1 like y 1.826 descargas en el momento de la ficha: comunidad reducida, menor probabilidad de soporte o correcciones.
- Sin pesos GGUF en el repositorio: el despliegue en llama.cpp u Ollama requiere conversion manual.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/reaperdoesntknow/Disctil-Qwen3-1.7B
- Modelo base: https://huggingface.co/reaperdoesntknow/DiStil-Qwen3-1.7B-uncensored
- Coleccion DistilQwen: https://huggingface.co/collections/reaperdoesntknow/distilqwen-69bf40ec669117e3f069ef1c
- Paper "Structure Over Scale": https://doi.org/10.57967/hf/8165
- Paper "Three Teachers to Dual Cognition": https://doi.org/10.57967/hf/8184
- Paper "Discrepancy Calculus": https://doi.org/10.57967/hf/8194
- Repositorio TRL: https://github.com/huggingface/trl
- Modelo top de la familia (Qwen3-1.7B-Coder-Distilled-SFT): https://huggingface.co/reaperdoesntknow/Qwen3-1.7B-Coder-Distilled-SFT
- Perfil del autor: https://huggingface.co/reaperdoesntknow
