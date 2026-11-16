# MeTask-Rain/metask-jev-rain-12B-trained

## Resumen

metask-jev-rain-12B-trained es un adaptador LoRA publicado por MeTask-Rain sobre el checkpoint google/gemma-4-12B-it-qat-q4_0-unquantized. No es un modelo de propósito general: el autor lo presenta como un servicio de decisión estructurada que, dada una situación (state) y una pregunta, devuelve un juicio y una distribución de probabilidad sobre un conjunto predefinido de opciones. El repositorio incluye tanto el checkpoint base como el directorio `adapter/`, y ambos son necesarios para reproducir la interfaz.

El modelo hereda la arquitectura Gemma 4 de 12B parámetros (11.959.730.224 según los safetensors) y se distribuye en formato safetensors con pesos cuantizados en int4 mediante compressed-tensors, además de los pesos LoRA en precisión superior. La licencia declarada es Apache-2.0, remitiendo a la licencia de Gemma 4 del modelo base.

Su relevancia es acotada pero específica: cubre el nicho de modelos pequeños que emiten decisiones con probabilidades calibradas en lugar de texto libre, un patrón útil para enrutadores, clasificadores con abstención y sistemas de agentes que necesitan puntuaciones. El autor advierte que el adaptador se entrenó con datos propios y que los ítems públicos de JevBench solo se usaron para ajustar parámetros del servicio y verificaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Gemma 4), con adaptador LoRA sobre el checkpoint base |
| Parametros totales | 11.959.730.224 |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int4 (compressed-tensors) en el checkpoint base; adaptador LoRA en precisión superior (no especificada) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0, sujeta a la licencia de Gemma 4 |
| Formato de pesos | safetensors (checkpoint base cuantizado + `adapter/`) |

## Arquitectura y entrenamiento

La base es un transformer decoder-only de la familia Gemma 4 en su variante instruct con cuantización consciente de cuantización (QAT) a q4_0, publicada por Google como `gemma-4-12B-it-qat-q4_0-unquantized`. Sobre ese checkpoint, MeTask-Rain entrena un adaptador LoRA que se aplica en cada petición. El pipeline declarado es image-text-to-text, lo que sugiere que la familia base admite entrada multimodal, aunque la model card solo documenta el uso para generación de texto y decisión estructurada.

El entrenamiento del adaptador se realizó con datos propios del autor, no con los ítems públicos de JevBench; estos últimos se reservaron para el ajuste de parámetros del servicio y las comprobaciones de funcionamiento. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO. El despliegue de referencia usa vLLM 0.31.0 con el adaptador cargado en cada solicitud, y el autor advierte que los ejemplos generados automáticamente por Hugging Face con Transformers pueden cargar solo el checkpoint base, omitiendo el adaptador y la interfaz de decisión estructurada.

## Capacidades

- Decisión estructurada: dado un estado y una pregunta, devuelve un juicio y probabilidades sobre las opciones disponibles.
- Generación de texto conversacional, heredada del modelo base instruct.
- Entrada image-text-to-text según el pipeline declarado, aunque no se documentan detalles de uso multimodal.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado; el adaptador está orientado a decisiones puntuales, no a planificación.
- Capacidades multilingües: no disponibles.
- Modo thinking, visión o audio explícitos: no documentados más allá del pipeline image-text-to-text.

## Casos de uso

- Enrutamiento de consultas en un asistente: el modelo recibe la consulta del usuario como estado y devuelve la probabilidad de cada ruta o categoría, permitiendo umbrales de confianza y derivación a un humano cuando la distribución es plana.
- Clasificación con abstención en pipelines de moderación: en lugar de una etiqueta dura, se obtiene una distribución que permite fijar políticas de revisión según la entropía de la salida.
- Decisión en agentes con herramientas: antes de invocar una herramienta, el modelo puntúa qué acción es más probable dado el estado de la conversación, actuando como política de selección de bajo coste frente a un modelo mayor.
- Validación de respuestas en sistemas RAG: dado el contexto recuperado y la pregunta, el modelo estima la probabilidad de que la respuesta sea correcta o de que falte información, sirviendo como filtro previo.
- Simulación de decisiones en entornos de juego o negociación: con estados discretos y opciones acotadas, el modelo produce juicios y probabilidades utilizables en árboles de búsqueda o en evaluación de políticas.
- Investigación en calibración: al exponer probabilidades sobre opciones, es útil para estudiar la calibración de modelos de 12B cuantizados a int4 en tareas de elección.
- Servicio de decisión como API interna: el paquete de servicio del autor permite reproducir la interfaz con vLLM 0.31.0 y el adaptador aplicado en cada petición.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor menciona JevBench únicamente como conjunto usado para el ajuste de parámetros del servicio y comprobaciones, sin reportar métricas en la model card.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint base está cuantizado a int4 con 11,96B parámetros, lo que sitúa los pesos en torno a 6-7 GB; el repositorio completo ocupa 8,7 GB incluyendo el adaptador.
- GPU recomendadas: no disponibles en la información proporcionada. Por tamaño, una GPU con 16 GB o más debería alojar los pesos int4 con margen para caché KV y el adaptador, pero no hay confirmación del autor.
- GPU de consumo: previsiblemente cabe en tarjetas de 24 GB (RTX 3090, RTX 4090) e incluso en algunas de 16 GB, aunque la longitud de contexto no está documentada y condiciona el consumo de caché KV.
- Opciones de despliegue: vLLM 0.31.0 es el entorno de referencia del autor, con el adaptador aplicado en cada petición. Otros motores (llama.cpp, Ollama, TGI) no están documentados para este adaptador.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Enfoque |
|---|---|---|---|---|---|
| metask-jev-rain-12B-trained | 11,96B | no disponible | int4 + LoRA | Apache-2.0 (Gemma 4) | Decisión estructurada con probabilidades |
| google/gemma-4-12B-it-qat-q4_0-unquantized | 12B (aprox.) | no disponible | q4_0 QAT | Gemma 4 | Instruct generalista y multimodal |
| Alternativas de decisión estructurada de tamaño similar | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación directa más informativa es con su propio modelo base: el adaptador añade la interfaz de juicio con probabilidades, pero no se han publicado métricas que cuantifiquen la mejora frente al base en JevBench ni en otras tareas.

## Limitaciones y advertencias

- El adaptador se entrenó con datos propios del autor; no hay información sobre su composición, tamaño ni posibles sesgos, por lo que la evaluación de sesgo no es posible.
- Riesgo de alucinación inherente a un modelo generativo de 12B; la salida de probabilidades no garantiza calibración correcta fuera de la distribución de entrenamiento.
- La longitud de contexto no está documentada, lo que impide planificar despliegues con ventanas largas.
- Los idiomas soportados no están declarados; no se puede asumir un rendimiento multilingüe equivalente al del modelo base.
- Los ejemplos automáticos de Transformers pueden cargar solo el checkpoint base sin el adaptador, produciendo salidas que no corresponden al servicio descrito; es imprescindible seguir las instrucciones del paquete de servicio.
- La licencia Apache-2.0 remite a la licencia de Gemma 4; es necesario conservar los avisos de atribución y verificar las condiciones de uso comercial de Gemma 4 antes de desplegar en producción.
- El uso de vLLM 0.31.0 como versión de referencia limita la portabilidad a otros motores no documentados.
- El modelo está marcado con `inference: false` en la model card, lo que indica que la carga directa desde Hugging Face no reproduce el servicio sin el paquete adicional.

## Enlaces

- Hugging Face: https://huggingface.co/MeTask-Rain/metask-jev-rain-12B-trained
- Paquete de servicio y divulgación: https://github.com/chenyuwang166-oss/metask-jev-rain-12B-trained
- Divulgación del servicio (DISCLOSURE.md): https://github.com/chenyuwang166-oss/metask-jev-rain-12B-trained/blob/main/DISCLOSURE.md
- Notas técnicas (TECHNICAL_NOTES.md): https://github.com/chenyuwang166-oss/metask-jev-rain-12B-trained/blob/main/TECHNICAL_NOTES.md
- Modelo base: https://huggingface.co/google/gemma-4-12B-it-qat-q4_0-unquantized
- Licencia de Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
