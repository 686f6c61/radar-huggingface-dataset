# shibuina/drawvla-verify-qwen3vl-4b-lora

## Resumen
drawvla-verify-qwen3vl-4b-lora es un adaptador LoRA desarrollado por shibuina sobre el modelo base Qwen/Qwen3-VL-4B-Instruct. Su función es actuar como validador de instrucciones a partir de bocetos (DrawVLA-Verify): dada una imagen de una escena robótica en la que se ha dibujado un círculo sobre un objeto y una flecha hacia un destino, y un caption sin nombres (por ejemplo, "pon esto ahí"), el modelo decide si la instrucción es correcta y suficiente o si es errónea.

El adaptador se entrenó sobre el dataset sintético shibuina/drawvla-prompt-validation, generado sobre LIBERO, con 14 modos de corrupción y distintas configuraciones de grounding. Aporta una solución de verificación previa para entornos de interacción humano-robot, donde los usuarios comunican intenciones mediante marcas visuales y frases cortas. La arquitectura subyacente es un transformer multimodal visión-lenguaje con 4B parámetros; el contexto y las capacidades multilingües no se detallan en la información disponible.

## Especificaciones técnicas
| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (Low-Rank Adaptation) sobre Qwen3-VL-4B-Instruct (transformer multimodal visión-lenguaje) |
| Parametros totales | no disponible (modelo base de 4B; el repositorio del adaptador pesa 0.1 GB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador LoRA) |

## Arquitectura y entrenamiento
El adaptador se construye con LoRA (Low-Rank Adaptation) sobre el modelo base Qwen3-VL-4B-Instruct, un transformer multimodal con encoder de visión y modelo de lenguaje. Se aplican proyecciones de adaptación a todas las capas de atención y MLP, con r=16, alpha=32 y dropout de 0.05.

El entrenamiento se realizó con el dataset shibuina/drawvla-prompt-validation, compuesto por prompts sintéticos basados en escenas de LIBERO con 14 modos de corrupción. Se emplearon 3 épocas, learning rate 1e-4 con scheduler cosine y 3% de warmup, y semilla 17. No se indica el uso de RLHF o DPO; el ajuste es exclusivamente por adaptación supervisada de bajo rango.

## Capacidades
- Clasificación de validez de instrucciones en escenas robóticas: dado un círculo que señala un objeto y una flecha que indica un destino, más un caption corto sin nombres, decide si la instrucción es "right" o "wrong".
- El modelo base Qwen3-VL-4B-Instruct subyacente proporciona comprensión multimodal, pero el adaptador solo está entrenado para la tarea específica de validación descrita.
- Formato de uso específico: el veredicto se obtiene comparando la log-likelihood de los spans "verdict: right" y "verdict: wrong" en el prompt exacto entrenado (imagen más `<VERDICT_INSTRUCTION>\n\nCaption: <caption>`).
- Soporte de tool calling, agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles.

## Casos de uso
- Validación en programación por demostración (PbD): un operador dibuja un círculo y una flecha sobre una imagen del espacio de trabajo y escribe un caption; el modelo valida que la instrucción sea consistente y completa antes de generar la demostración para el robot.
- Filtrado de anotaciones en datasets de robótica: durante la creación de conjuntos de datos de entrenamiento, el adaptador se ejecuta sobre pares imagen-caption para descartar muestras inválidas o ambiguas, reduciendo el ruido en los datos.
- Interfaces de teleoperación remota: en sistemas de control a distancia, el modelo verifica que el comando del operador sea interpretable antes de enviarlo al robot, evitando ejecuciones erróneas.
- Generación de escenarios de simulación: al construir tareas en simuladores robóticos, se valida que las instrucciones dibujadas cumplan las restricciones geométricas y semánticas necesarias para la planificación.
- Asistente doméstico con marcado visual: un usuario puede tomar una foto, indicar con un círculo el objeto y con una flecha la ubicación deseada, y el modelo confirma si la petición es correcta y suficiente para el robot.
- Pre-filtro en pipelines de agentes de IA: antes de enviar una instrucción multimodal a un modelo de planificación de alto nivel, este adaptador actúa como un comprobador rápido de validez, reduciendo errores por comandos ambiguos.
- Evaluación de bocetos humanos en investigación de interacción: se utiliza para medir la calidad de los bocetos como medio de comunicación de intenciones entre humanos y robots, comparando el rendimiento sobre dibujos hechos a mano con el de anotaciones sintéticas.

## Benchmarks y rendimiento
| Split | Accuracy | Balanced acc | Macro-F1 | MCC | AUROC |
|---|---|---|---|---|---|
| Test sintético (3,966 filas) | 0.936 | 0.911 | 0.916 | 0.831 | 0.979 |
| Sketches humanos (280, etiquetas manuales) | 0.636 | – | – | 0.281 | 0.721 |

El recall sobre prompts inválidos es 0.962 y sobre prompts válidos es 0.860. Un clasificador basado únicamente en geometría alcanza 0.932 de accuracy en el mismo test sintético, por lo que el benchmark sintético es en gran medida separable de las coordenadas de los bocetos. Los números obtenidos con sketches humanos deben considerarse la estimación de despliegue real.

## Requisitos de hardware
- VRAM estimada: no disponible en la información proporcionada.
- GPU recomendada: no disponible.
- Capacidad en GPU de consumo: no disponible.
- Opciones de despliegue: el adaptador se carga mediante transformers y peft (PeftModel), como se muestra en el ejemplo de uso. No se mencionan vLLM, llama.cpp, TGI u Ollama.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares
No se han encontrado datos comparativos con otros adaptadores o modelos equivalentes en la información disponible. El modelo base Qwen3-VL-4B-Instruct sería la referencia sin el adaptador, pero no se disponen de métricas de comparación.

## Limitaciones y advertencias
- El rendimiento en bocetos dibujados a mano por humanos es notablemente inferior al del test sintético (accuracy 0.636, MCC 0.281). Estos números deben considerarse la estimación realista de despliegue.
- El prompt debe seguir exactamente el formato entrenado: turno de usuario con la imagen y `<VERDICT_INSTRUCTION>\n\nCaption: <caption>`. Modificaciones en el prompt (por ejemplo, añadir system prompt o puntuar con next-token simple) reducen los márgenes a la mitad.
- El benchmark sintético es en gran parte separable mediante un clasificador geométrico (0.932 accuracy), lo que sugiere que el modelo puede no estar aprendiendo semántica profunda más allá de las coordenadas.
- La tarea está restringida a escenas robóticas y anotaciones de círculo/flecha; no es un modelo de propósito general.
- Licencia Apache 2.0 permite uso comercial, pero requiere conservar el aviso de copyright y licencia.
- No se dispone de información sobre sesgos, alucinaciones o limitaciones de idioma.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/shibuina/drawvla-verify-qwen3vl-4b-lora
- Dataset de entrenamiento: https://huggingface.co/datasets/shibuina/drawvla-prompt-validation/viewer
- Documentación de Qwen3-VL: https://huggingface.co/docs/transformers/model_doc/qwen3_vl
