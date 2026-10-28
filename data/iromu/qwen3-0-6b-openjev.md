# iromu/Qwen3-0.6B-openjev

## Resumen

Qwen3-0.6B-openjev es un ajuste fino supervisado del modelo denso Qwen/Qwen3-0.6B-Base, publicado por el usuario iromu, orientado a un uso muy concreto: responder a peticiones de decisión tipada devolviendo una única letra de etiqueta. No es un modelo conversacional general ni pretende serlo; la propia model card lo describe como un artefacto especializado en tareas de clasificación y selección de una sola respuesta, no como sustituto de modelos Qwen de mayor tamano.

El problema que resuelve es el de obligar a un modelo pequeno a cumplir un contrato de formato estricto. Segun la validación publicada, el modelo base no emite ninguna letra válida en 3.495 filas de validación (0,0 %), mientras que tras el ajuste emite la letra en el 100 % de los casos y acierta el 84,9 % (2.968 de 3.495), lo que supone una mejora de 84,9 puntos porcentuales. Esa combinación de formato garantizado y precisión razonable es lo que lo hace util para enrutado y clasificación de bajo coste.

Con 596.049.920 parámetros (aproximadamente 0,6 B) y pesos BF16 fusionados de 1,2 GB, el modelo está pensado para despliegue en dispositivo, edge y entornos con presupuesto de VRAM muy ajustado. La licencia Apache 2.0 y la existencia de cuantizaciones GGUF y NVFP4 en repositorios hermanos facilitan su integración en pipelines existentes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (familia Qwen3), ajustado mediante LoRA y fusionado en BF16 |
| Parametros totales | 596.049.920 (≈0,6 B) |
| Parametros activos | No aplica: modelo denso, no es MoE |
| Longitud de contexto | 4.096 tokens de longitud máxima de entrenamiento; la model card no declara una ventana de inferencia mayor |
| Tipos de cuantizacion | GGUF (se cita Q4_K_M; otras variantes no detalladas) y NVFP4; pesos BF16 completos en safetensors |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16 fusionado), GGUF, checkpoint NVFP4 |

## Arquitectura y entrenamiento

La base es Qwen3-0.6B-Base, un transformer decoder-only denso de la familia Qwen3. Sobre él se aplicó un ajuste fino supervisado con LoRA usando NeMo-RL, con entropía cruzada enmascarada a los turnos del asistente sobre las filas de decisión tipada. La configuración de LoRA es rango 32, alpha 32, dropout 0,05 y módulos objetivo `*.proj` (q_proj, k_proj, v_proj, o_proj, gate_proj, up_proj, down_proj). El entrenamiento usó precisión bfloat16, optimizador AdamW con learning rate 5e-5 y weight decay 0,01, warmup lineal de 100 pasos seguido de decaimiento coseno hasta 1e-6, batch global de 64 (micro batch 2), 1.250 pasos totales y validación cada 125 pasos, con longitud máxima de secuencia de 4.096 tokens.

La innovación técnica relevante no está en la arquitectura sino en el contrato de plantilla de chat: la plantilla de decisión renderiza el turno del asistente exactamente como su contenido, una única letra de etiqueta, sin bloque de razonamiento. Eso hace que la respuesta sea el primer token generado y que el turno termine en EOS, lo que elimina la necesidad de parsear texto libre. El dataset empleado es el split `train` del corpus de decisión tipada ZefanCai/Open-Jev, en el que cada fila contiene un estado, una pregunta, un conjunto de opciones y una distribución de probabilidad sobre esas opciones; el objetivo de entrenamiento es la opción argmax escrita como una sola letra de etiqueta. No se documenta en la información disponible el número total de tokens de entrenamiento ni el uso de RLHF o DPO.

## Capacidades

- Decisión tipada: dado un estado, una pregunta y un conjunto cerrado de opciones, devuelve una única letra de etiqueta como primer token generado.
- Clasificación de etiqueta única sobre conjuntos de opciones definidos por el usuario.
- Cumplimiento estricto de formato: la plantilla de decisión fuerza la respuesta a una letra y el cierre inmediato del turno en EOS.
- Salida determinista con decodificación greedy, tal y como se midió en la validación publicada.
- Integración con `transformers`, llama.cpp (GGUF) y TensorRT-LLM (NVFP4).
- Capacidad de ejecución en dispositivo o edge por su reducido tamano.

No documentado en la información disponible: soporte de tool calling o function calling,capacidades de agente multi-paso, matemáticas, generación de código, visión, audio, modo de razonamiento explícito o capacidades multilingües más allá del inglés.

## Casos de uso

- Enrutado de tickets de soporte: el modelo recibe el estado de la conversación, una pregunta de clasificación y la lista de colas disponibles (por ejemplo, facturación, técnico, cuentas), y devuelve la letra de la cola adecuada. El formato de una sola letra simplifica el parseo en el backend.
- Selección de política en agentes: usar el modelo como cabeza de decisión de bajo coste que elige entre acciones discretas predefinidas (buscar, responder, escalar), aprovechando que el 100 % de las salidas siguen el contrato de formato.
- Moderación y etiquetado de contenido: clasificar un fragmento en una taxonomía cerrada de categorías, con una llamada por elemento y coste computacional mínimo.
- Decisión de recuperación en pipelines RAG: determinar si una consulta requiere recuperación documental o puede responderse con conocimiento interno, usando las opciones como letras y umbralizando por distribución de salida.
- Preetiquetado para anotación humana: generar etiquetas iniciales sobre grandes volúmenes de datos antes de la revisión manual, dado el bajo coste por inferencia del modelo de 0,6 B.
- Despliegue en dispositivo: ejecución en movil, Raspberry Pi o portátil sin GPU mediante la cuantización GGUF Q4_K_M, para decisiones de interfaz o Wake-word con lógica de clasificación.
- Experimentación en investigación: base ligera para estudiar decisiones tipadas, calibración sobre distribuciones de opciones y efectos de plantillas de chat estrictas.
- Semáforos y control de sistemas: elegir entre un conjunto finito de estados de actuación a partir de lecturas de sensores serializadas como texto, siempre que las opciones estén acotadas.

## Benchmarks y rendimiento

Única tabla publicada en la model card, medida sobre el split `validation` de Open-Jev (3.495 filas), decodificación greedy y tope de 384 tokens:

| Modelo | Cuantización | Tope | n | Letra emitida | Letra correcta | Delta vs base |
|---|---|---|---|---|---|---|
| Qwen/Qwen3-0.6B-Base | BF16 | 384 tok | 3.495 | 0/3.495 (0,0 %) | 0/3.495 (0,0 %) | (sin predecesor) |
| Qwen3-0.6B-openjev | BF16 | 384 tok | 3.495 | 3.495/3.495 (100,0 %) | 2.968/3.495 (84,9 %) | +84,9 pp |

El autor aclara que la métrica de throughput corresponde a decodificación greedy de un solo stream y no a throughput de servido. No se han publicado resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM estimada en BF16: aproximadamente 1,2 GB de pesos más caché KV y activaciones; en la práctica unos 2-2,5 GB para secuencias de 4.096 tokens.
- VRAM estimada en GGUF Q4_K_M: en torno a 0,4 GB de pesos, ejecutable en CPU sin GPU dedicada.
- NVFP4: requiere hardware compatible con ese formato (generación Blackwell de NVIDIA); no se detallan requisitos adicionales en la información disponible.
- GPU recomendadas: cualquier GPU consumer con 4 GB o más sirve para BF16 (GTX 1650, RTX 3050, RTX 4060, RTX 4090); A100 y H100 quedan sobredimensionadas para este tamano salvo por agregación de muchas peticiones.
- Cabe en GPU consumer: sí, en prácticamente toda la gama actual, y también en iGPU y Apple Silicon vía llama.cpp.
- Opciones de despliegue: `transformers` (BF16 fusionado), llama.cpp con GGUF (`llama-cli -hf iromu/Qwen3-0.6B-openjev-GGUF:Q4_K_M`), TensorRT-LLM con NVFP4 (`trtllm-serve serve iromu/Qwen3-0.6B-openjev-NVFP4 --port 8000`). Los tags del repositorio incluyen `text-generation-inference` y `endpoints_compatible`.
- Latencia y throughput: no disponibles. La model card solo indica que la cifra publicada corresponde a decodificación greedy de un único stream, sin valor numérico.

## Comparativa con modelos similares

Los datos de los modelos alternativos no estan verificados en la información proporcionada y se incluyen solo como referencia de categoria.

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-0.6B-openjev | 596 M | 4.096 tok de entrenamiento (no se declara más) | Decisión tipada, salida de una letra | Apache 2.0 | HuggingFace, GGUF y NVFP4 |
| Qwen/Qwen3-0.6B-Base | ≈0,6 B | No disponible en la información proporcionada | Modelo base generalista | Apache 2.0 (heredada) | HuggingFace |
| Qwen3-0.6B (instruct oficial) | ≈0,6 B | No disponible en la información proporcionada | Instrucciones generales y conversación | Apache 2.0 (heredada) | HuggingFace |
| Qwen2.5-0.5B-Instruct | ≈0,5 B | No disponible en la información proporcionada | Instrucciones generales | Apache 2.0 (heredada) | HuggingFace |

Frente a las alternativas, la diferencia no es de rendimiento general sino de contrato de salida: los modelos instruct pueden responder en texto libre y fallar el formato, mientras que este ajuste garantiza la letra de etiqueta en el 100 % de los casos medidos, a costa de perder cualquier capacidad conversacional.

## Limitaciones y advertencias

- Especialización estrecha: no es un sustituto general de modelos Qwen mayores, tal y como advierte el propio autor.
- Emite siempre una letra: al haber sido entrenado para producir la etiqueta como primer token, no se ha documentado capacidad de abstención ante entradas fuera de dominio; el 100 % de emisión implica que puede forzar una respuesta incorrecta en lugar de rechazar.
- Tasa de error del 15,1 % en la validación publicada (527 de 3.495 filas incorrectas), con decodificación greedy y un único conjunto de datos.
- El objetivo de entrenamiento es el argmax de una distribución de probabilidad del corpus, no necesariamente la verdad objetiva; pueden heredarse sesgos y errores de anotación de ZefanCai/Open-Jev.
- Idioma: solo inglés declarado; el comportamiento en castellano u otros idiomas no está documentado.
- Dependencia estricta de la plantilla: usar una plantilla de chat distinta rompe el contrato de formato y degrada la salida.
- Sin modo de razonamiento: la plantilla elimina explícitamente el bloque de pensamiento, por lo que no hay cadena de razonamiento interna.
- Contexto de entrenamiento de 4.096 tokens; no se declara soporte de ventanas mayores aunque el modelo base las soporte.
- Riesgo de alucinación estructural bajo en el formato (una letra), pero riesgo de decisión incorrecta alto en dominios alejados de la distribución de Open-Jev.
- Licencia Apache 2.0: permite uso comercial sin restricciones adicionales conocidas, pero la responsabilidad sobre el modelo base y los datos subyacentes recae en el usuario.
- Adopción prácticamente nula: 0 descargas y 0 likes en el momento de la ficha, sin validación externa independiente.
- Sin benchmarks estándar publicados, por lo que la comparación con otros modelos solo puede hacerse por categoria y no por rendimiento medido.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/iromu/Qwen3-0.6B-openjev
- Cuantizaciones GGUF: https://huggingface.co/iromu/Qwen3-0.6B-openjev-GGUF
- Checkpoint NVFP4: https://huggingface.co/iromu/Qwen3-0.6B-openjev-NVFP4
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B-Base
- Dataset de entrenamiento: https://huggingface.co/datasets/ZefanCai/Open-Jev
- Framework de entrenamiento citado (NeMo-RL): sin URL en la información disponible
- Paper, blog o demo adicionales: no disponibles en la información proporcionada
