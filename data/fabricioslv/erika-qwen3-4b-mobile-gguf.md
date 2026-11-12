# fabricioslv/erika-qwen3-4b-mobile-gguf

## Resumen

Erika Qwen3-4B Mobile es una cuantización GGUF Q4_K_M del modelo Qwen3-4B-Instruct-2507, publicada por el usuario fabricioslv. Se trata de un ajuste fino mediante LoRA (fusionado en los pesos finales) sobre la base `unsloth/Qwen3-4B-Instruct-2507`, orientado a su despliegue en dispositivos móviles y entornos de edge computing. El resultado es un único archivo de 2,50 GB en formato GGUF que puede ejecutarse con llama.cpp, Ollama o LM Studio, incluyendo terminales Android mediante Termux.

El modelo conserva la arquitectura transformer densa de Qwen3-4B, con 4.022.468.096 parámetros totales, y hereda la licencia Apache 2.0 del modelo base, lo que permite uso comercial sin restricciones adicionales. Su relevancia radica en la posibilidad de ejecutar un modelo de 4B parámetros en hardware de consumo con requisitos de memoria moderados, manteniendo las capacidades conversacionales y de razonamiento del Qwen3-Instruct-2507 original.

No se dispone de información sobre el dataset de ajuste, los idiomas soportados declarados ni resultados de evaluación del adaptador LoRA. La model card está redactada en portugués y se centra exclusivamente en las instrucciones de despliegue, sin aportar detalles técnicos sobre el proceso de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (base Qwen3-4B-Instruct-2507) |
| Parametros totales | 4.022.468.096 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF Q4_K_M (única variante publicada) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo parte de `unsloth/Qwen3-4B-Instruct-2507`, un transformer denso de 4B parámetros de la familia Qwen3 en su variante Instruct con fecha de corte 2507. Sobre esta base se aplicó un ajuste fino con LoRA (el autor lo denomina "Erika Qwen3-4B Mobile"), cuyos pesos se fusionaron posteriormente en el modelo completo mediante la técnica de merge de LoRA. El adaptador original se publica por separado en `fabricioslv/erika-qwen3-4b-mobile-adapter`.

Tras la fusión, el modelo resultante se cuantizó de forma nativa a GGUF en formato Q4_K_M, generando un archivo de 2,50 GB. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset del ajuste LoRA, ni si se emplearon técnicas de RLHF o DPO adicionales sobre la base. Tampoco se detalla si se modificó la ventana de contexto respecto al modelo original.

## Capacidades

- Generación de texto conversacional multi-turno, heredada del Qwen3-4B-Instruct-2507.
- Razonamiento y resolución de problemas de complejidad media propios de un modelo de 4B parámetros.
- Generación de código y matemáticas a nivel básico-intermedio (capacidad implícita de la base Qwen3-Instruct).
- Ejecución local en dispositivos móviles y entornos edge mediante llama.cpp, Ollama y LM Studio.
- Compatibilidad con endpoints (tag `endpoints_compatible` en Hugging Face).
- Capacidades multilingües: no disponibles de forma explícita en la información proporcionada.
- Soporte de tool calling y agentes: no confirmado en la información disponible.

## Casos de uso

- Asistente conversacional offline en Android: mediante Termux o aplicaciones compatibles con GGUF (ChatterUI, PocketPal AI), el archivo Q4_K_M de 2,50 GB permite ejecutar un chatbot local sin conexión a internet en dispositivos con 4-6 GB de RAM libre.
- Despliegue en edge computing con Ollama: la creación de un Modelfile y la ejecución con `ollama run` permite integrar el modelo en servicios locales de bajo consumo para tareas de clasificación, resumen o respuesta a preguntas.
- Prototipado rápido en portátiles sin GPU dedicada: llama.cpp permite inferencia en CPU con cuantización Q4_K_M, adecuado para pruebas de concepto y desarrollo de aplicaciones de IA generativa.
- Privacidad de datos en entornos sanitarios o legales: al ejecutarse íntegramente en local, el modelo evita el envío de información sensible a APIs externas, cumpliendo con requisitos de confidencialidad.
- Generación de texto asistida en aplicaciones de escritorio: integración vía LM Studio o llama-server para tareas de redacción, reescritura y resumen en herramientas ofimáticas.
- Educación y experimentación: modelo ligero para aprender a desplegar LLMs cuantizados, ajustar parámetros de muestreo (temperature, top_p) y evaluar el impacto de la cuantización en la calidad de salida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: aproximadamente 3-4 GB con cuantización Q4_K_M (archivo de 2,50 GB más overhead de contexto y caché KV).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (GTX 1650, RTX 3050, RTX 4060); también funciona en CPU.
- Cabe en GPU de consumo: sí, en modelos con 4 GB o más de VRAM. En dispositivos móviles requiere al menos 4-6 GB de RAM libre.
- Opciones de despliegue: llama.cpp (CLI y servidor), Ollama, LM Studio, Termux en Android, aplicaciones GGUF para iOS y Android (ChatterUI, PocketPal AI, MLC).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Erika Qwen3-4B Mobile (este) | 4,02B | no disponible | GGUF Q4_K_M | Apache 2.0 | Hugging Face |
| Qwen3-4B-Instruct-2507 (base) | 4,02B | no disponible | safetensors | Apache 2.0 | Hugging Face |
| Llama 3.2 3B Instruct | 3,2B | 128K | safetensors, GGUF | Llama 3.2 Community | Hugging Face, Ollama |
| Phi-3.5-mini | 3,8B | 128K | safetensors, GGUF | MIT | Hugging Face, Ollama |

## Limitaciones y advertencias

- No se dispone de información sobre el dataset de ajuste LoRA, por lo que se desconocen los sesgos introducidos por el mismo.
- Riesgo de alucinación inherente a modelos de 4B parámetros, especialmente en tareas de razonamiento complejo o conocimiento factual específico.
- La model card no declara los idiomas soportados; aunque la base Qwen3 es multilingüe, el ajuste LoRA podría haber alterado el equilibrio lingüístico.
- La ventana de contexto no está especificada; se desconoce si se mantiene la del modelo base o se ha reducido.
- La cuantización Q4_K_M introduce pérdida de precisión respecto a los pesos originales en safetensors, con posible degradación en tareas sensibles.
- El modelo tiene 0 descargas y 0 likes en el momento de la ficha, sin validación comunitaria ni evaluaciones independientes.
- Aunque la licencia es Apache 2.0, conviene verificar las condiciones del modelo base Qwen3 y del adaptador LoRA original.
- El repositorio se actualizó un minuto después de su creación, lo que sugiere una publicación reciente sin mantenimiento posterior confirmado.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/fabricioslv/erika-qwen3-4b-mobile-gguf)
- [Adaptador LoRA original](https://huggingface.co/fabricioslv/erika-qwen3-4b-mobile-adapter)
- [Modelo base: unsloth/Qwen3-4B-Instruct-2507](https://huggingface.co/unsloth/Qwen3-4B-Instruct-2507)
