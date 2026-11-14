# Luciano-felix26/felix-0.5b

## Resumen

Félix 0.5B es un ajuste fino mediante LoRA del modelo Qwen2.5-0.5B-Instruct, desarrollado por Luciano-felix26 dentro del proyecto GatoGPT. Se trata de una demostración técnica que adapta un transformer decoder de 494 millones de parámetros para conversar en español rioplatense adoptando la personalidad de "Félix", un gato asistente. El objetivo no es construir un asistente fiable, sino experimentar con el pipeline completo de fine-tuning (dataset, entrenamiento LoRA, exportación a GGUF y despliegue en Ollama) sobre hardware muy limitado.

El modelo parte de la arquitectura Qwen2 de Alibaba, con 24 capas, atención con GQA y una ventana de contexto de 32.768 tokens en su configuración original. El ajuste LoRA se aplicó sobre las proyecciones `q/k/v/o` con rango 16 y alpha 32, entrenando únicamente 2,16 millones de parámetros (0,44% del total) durante 120 pasos sobre 113 conversaciones escritas a mano, en una CPU de 2 vCPU y sin GPU.

Su relevancia es principalmente didáctica: muestra que es posible especializar el estilo y el tono de un modelo pequeño con recursos mínimos, y que el resultado se puede distribuir en formatos ligeros (safetensors y GGUF) y ejecutar en dispositivos de bajas prestaciones. Como contrapartida, el propio autor advierte que no debe usarse como fuente de información técnica ni como asistente de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (Qwen2), ajuste LoRA sobre Qwen2.5-0.5B-Instruct |
| Parametros totales | 494.032.768 |
| Parametros activos | no disponible (no es MoE; 2,16M parametros entrenables en el adaptador LoRA) |
| Longitud de contexto | no disponible en la model card (la base Qwen2.5-0.5B-Instruct soporta 32.768 tokens) |
| Tipos de cuantizacion | GGUF (incluido en el repo); cuantizaciones especificas no disponibles |
| Idiomas soportados | Espanol rioplatense e ingles basico; otros idiomas no cubiertos |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador LoRA y pesos base) y GGUF |

## Arquitectura y entrenamiento

El modelo es un transformer decoder denso de la familia Qwen2, con 494 millones de parámetros, sobre el que se aplicó un adaptador LoRA de rango 16 y alpha 32 en las proyecciones de query, key, value y output de cada capa de atención. El adaptador entrena 2,16 millones de parámetros, un 0,44% del total, lo que permite conservar íntegro el conocimiento del modelo base mientras se modifica el estilo de respuesta. No se ha publicado información sobre innovaciones arquitectónicas adicionales, decodificación especulativa ni técnicas de atención lineal.

El entrenamiento se realizó con un dataset propio de 113 conversaciones de entrenamiento y 15 de validación, escritas a mano y centradas en el proyecto GatoGPT: ESP32, tablet con Termux, modelos de IA, código y comandos del bot. Se ejecutaron 120 pasos en 674 segundos sobre una CPU de 2 vCPU sin GPU, con una pérdida de validación que descendió de 3,08 en el paso 10 a 1,33 en el paso 120. No se documenta el uso de RLHF, DPO ni una fase de alineación adicional; el ajuste es exclusivamente supervisado sobre pares conversacionales.

## Capacidades

- Generación de texto conversacional en español rioplatense con una personalidad definida (Félix, gato asistente del proyecto GatoGPT).
- Mantenimiento de conversaciones multi-turno dentro del contexto soportado por el modelo base.
- Respuestas sobre temáticas del proyecto: hardware ESP32, Termux, modelos de IA, código y comandos del bot.
- Comprensión básica de inglés, limitada a las capacidades heredadas del modelo base.
- Soporte de tool calling y function calling: no documentado en la model card.
- Capacidades de agente y razonamiento multi-paso: no documentadas.
- Modo thinking, visión o audio: no disponibles.

## Casos de uso

- Demostración educativa de fine-tuning LoRA: sirve para ilustrar el pipeline completo (dataset, entrenamiento, exportación a GGUF y despliegue en Ollama) en cursos o talleres con recursos de hardware mínimos.
- Prototipado de personajes conversacionales: permite validar el tono y el formato de un asistente con personalidad antes de invertir en un modelo mayor o en más datos.
- Asistente local en dispositivos de bajas prestaciones: al caber en CPU y en GPUs de gama baja, puede ejecutarse en una Raspberry Pi o en un portátil modesto para tareas de entretenimiento o pruebas de integración.
- Base para experimentos de ajuste con PEFT: el adaptador incluido en `adapter/` se puede cargar con `PeftModel.from_pretrained` y reutilizar como punto de partida para nuevos datasets.
- Pruebas de integración de extremo a extremo en proyectos de hardware: útil para verificar el flujo de un bot que responde por consola o por un canal de mensajería, sin depender de servicios en la nube.
- Evaluación comparativa de modelos pequeños: sirve como referencia de lo que se puede conseguir con 0,5B parámetros y 113 ejemplos, frente a alternativas de mayor tamaño.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente reporta la evolución de la pérdida de validación durante el entrenamiento (3,08 en el paso 10 y 1,33 en el paso 120), que no es comparable con métricas estandarizadas como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1 GB en FP16 para los pesos base más el adaptador; en torno a 0,4-0,6 GB con cuantización GGUF de 4 bits.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; el modelo base cabe holgadamente en una GTX 1650, RTX 3050 o superior. Para entrenamiento LoRA, una GPU de 8 GB es suficiente.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU dedicada moderna e incluso en iGPUs con memoria compartida.
- Ejecución en CPU: viable; el autor entrenó el adaptador en 2 vCPU y el modelo está pensado para desplegarse con Ollama.
- Opciones de despliegue: Ollama (con `Modelfile` incluido), llama.cpp con los pesos GGUF, transformers con PEFT para cargar el adaptador, y vLLM o TGI para los pesos safetensors.
- Latencia y throughput: no disponibles. El entrenamiento de 120 pasos requirió 674 segundos en 2 vCPU, lo que da una idea del orden de magnitud del cómputo disponible en el entorno del autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Félix 0.5B | 494M (2,16M entrenables) | No disponible en la model card | Apache 2.0 | Hugging Face (safetensors y GGUF) | Fine-tuning LoRA sobre Qwen2.5-0.5B-Instruct; demo de personaje |
| Qwen2.5-0.5B-Instruct | 494M | 32.768 tokens | Apache 2.0 | Hugging Face, Ollama | Modelo base; capacidades generales y multilingües |
| Qwen2.5-1.5B-Instruct | 1.540M | 32.768 tokens | Apache 2.0 | Hugging Face, Ollama | Alternativa de mayor tamaño recomendada por el propio autor para una versión seria |
| SmolLM2-360M-Instruct | 360M | 8.192 tokens | Apache 2.0 | Hugging Face | Alternativa de tamaño similar orientada a dispositivos edge |

## Limitaciones y advertencias

- El propio autor la describe como una demo, no como un asistente fiable: 0,5B parámetros y 113 ejemplos solo alcanzan para imitar el tono, no para proporcionar información correcta.
- Riesgo elevado de alucinación: varias respuestas suenan plausibles pero son falsas (por ejemplo, "corro en mi ESP32").
- No debe usarse para datos técnicos, precios, versiones ni información que requiera verificación.
- El LoRA ajusta estilo y formato, pero no añade conocimiento nuevo; lo que sabe del proyecto proviene del prompt de sistema y de los ejemplos.
- Cobertura lingüística limitada al español rioplatense e inglés básico; otros idiomas no están cubiertos.
- La licencia Apache 2.0 permite uso comercial, pero las limitaciones de fiabilidad hacen desaconsejable su uso en producción sin una evaluación adicional.
- No se documentan sesgos específicos, pero al derivar de Qwen2.5-0.5B-Instruct hereda los sesgos del modelo base y de los datos de entrenamiento originales.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validación comunitaria independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Luciano-felix26/felix-0.5b
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Repositorio del pipeline de entrenamiento: https://github.com/luciano2-web/gatogpt-models
