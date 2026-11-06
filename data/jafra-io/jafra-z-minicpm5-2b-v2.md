# jafra-io/jafra-z-minicpm5-2b-v2

## Resumen

Jafra Z (MiniCPM5-2B) es un ajuste fino mediante LoRA del modelo base `openbmb/MiniCPM5-2B`, desarrollado por el usuario `jafra-io`. El modelo está especializado en tool calling y razonamiento con modo thinking, y se distribuye como parte de la infraestructura del asistente KUSMA (Knowledge-driven Unified Systems Monitoring Assistant) del proyecto Jafra. Con aproximadamente 2.516 millones de parámetros, se posiciona en la categoría de modelos pequeños orientados a despliegue eficiente.

El ajuste se ha realizado sobre el conjunto de datos propietario `jafra-trajectories-v2`, compuesto por 225 filas de entrenamiento y 25 de validación, con pérdida calculada únicamente sobre las respuestas del asistente, incluyendo los bloques `<think>` y las llamadas a herramientas. El resultado es un modelo conversacional que sigue el formato XML nativo de MiniCPM5 para invocar funciones, con soporte explícito de razonamiento previo a la acción.

Su relevancia radica en la combinación de un tamaño reducido (apto para GPUs de consumo), licencia Apache 2.0 y distribución en múltiples formatos (safetensors, GGUF y adaptador LoRA separado), lo que facilita tanto la experimentación como el despliegue en producción de agentes con capacidad de invocar herramientas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (fine-tune LoRA de openbmb/MiniCPM5-2B) |
| Parametros totales | 2.516.756.480 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (entrenamiento con max_length 6144) |
| Tipos de cuantizacion | GGUF: Q2_K, Q4_K_M, Q4_K_S, Q5_K_M, Q6_K; fp16 merged; adaptador LoRA |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, GGUF, adaptador LoRA |

## Arquitectura y entrenamiento

El modelo parte de `openbmb/MiniCPM5-2B`, un transformer de aproximadamente 2.500 millones de parámetros. Sobre él se aplica un ajuste fino con LoRA de rango 16 durante 3 épocas, con una longitud máxima de secuencia de 6144 tokens, utilizando dos GPUs T4 en modo DDP con precisión fp16. La pérdida de evaluación final reportada es de 0,9256.

La innovación principal del ajuste no reside en la arquitectura, sino en la estrategia de entrenamiento: la pérdida se calcula exclusivamente sobre los turnos del asistente, incluyendo los bloques de razonamiento `<think>` y las llamadas a herramientas en formato XML de MiniCPM5 (`<function name="x"><param name="y">v</param></function>`). Los tokens `<function`, `<param`, `</function>` y `</param>` están registrados como tokens especiales, lo que obliga a preservarlos en la salida (`skip_special_tokens=false`) para que el parser de tool calls funcione correctamente. El conjunto de datos de entrenamiento es reducido (225 filas), lo que sugiere un ajuste orientado a estilo y formato más que a adquisición de conocimiento nuevo.

## Capacidades

- Generación de texto conversacional multi-turno.
- Razonamiento explícito mediante modo thinking (`enable_thinking=True`), con bloques `<think>` previos a la respuesta.
- Tool calling / function calling en formato XML nativo de MiniCPM5, con parámetros tipados mediante `<param name="...">`.
- Razonamiento multi-paso orientado a agentes, con encadenamiento de pensamiento y acción.
- Integración como motor del asistente KUSMA para monitorización de sistemas.
- Capacidades multilingües: no disponible en la información proporcionada.
- Capacidades de visión o audio: no disponible en la información proporcionada.

## Casos de uso

- Asistente de monitorización de sistemas: el modelo actúa como motor de KUSMA para interpretar consultas de operadores y emitir llamadas a herramientas de observabilidad (métricas, logs, alertas) mediante el formato XML de tool calling, con razonamiento previo que justifica cada acción.
- Agente de diagnóstico con razonamiento explícito: gracias al modo thinking, el modelo puede descomponer un problema operativo en pasos intermedios antes de invocar la herramienta adecuada, lo que facilita la auditoría de sus decisiones en entornos de producción.
- Despliegue en GPUs de consumo: con 2.500 millones de parámetros y cuantizaciones GGUF desde Q2_K hasta Q6_K, es viable ejecutarlo en estaciones de trabajo modestas o en el borde para tareas de asistencia técnica local.
- Integración en pipelines con llama.cpp u Ollama: los ficheros GGUF permiten servir el modelo en entornos sin stack de transformers, manteniendo el parser de tool calls siempre que se preserve el token especial en la salida.
- Prototipado rápido de agentes con herramientas: al distribuirse también el adaptador LoRA y el modelo fusionado en fp16, un equipo puede partir del adaptador para experimentar con nuevos formatos de herramientas o ajustar el estilo de razonamiento sin reentrenar desde cero.
- Asistencia técnica interna con formato controlado: el ajuste sobre trayectorias específicas hace que el modelo responda con un formato consistente de pensamiento y llamada a función, útil para integrarlo en sistemas que validan estrictamente la estructura de las invocaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (fp16): aproximadamente 5 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, entre 6 y 8 GB.
- VRAM estimada con cuantización Q4_K_M: en torno a 1,5-2 GB para pesos, con margen adicional para contexto y caché.
- VRAM estimada con cuantización Q2_K: por debajo de 1,5 GB para pesos, a costa de degradación de calidad.
- GPU recomendadas: cualquier GPU con al menos 8 GB para fp16 (RTX 3060 Ti, RTX 4060 Ti, RTX 4070); A100 o H100 no son necesarias para este tamaño.
- Cabe en GPU de consumo: sí, en la mayoría de tarjetas con 8 GB o más en fp16 y en tarjetas con 4-6 GB usando GGUF Q4.
- Opciones de despliegue: transformers (modelo fusionado o adaptador), llama.cpp y derivados (Ollama, LM Studio) mediante los GGUF incluidos; vLLM y TGI no están confirmados en la información disponible.
- Latencia y throughput: no disponibles en la información proporcionada; el entrenamiento se realizó en 2x T4, lo que da una referencia del orden de magnitud del hardware empleado por el autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formatos | Notas |
|---|---|---|---|---|---|
| jafra-z-minicpm5-2b-v2 | 2.516 M | no disponible | Apache 2.0 | safetensors, GGUF, LoRA | Fine-tune especializado en tool calling y thinking |
| openbmb/MiniCPM5-2B (base) | ~2.500 M | no disponible | no disponible en esta ficha | safetensors | Modelo base sin ajuste específico de trayectorias |
| Alternativas de ~2-3B con tool calling | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificados en la información proporcionada |

La comparación cuantitativa con otros modelos de la misma categoría no está disponible en la información proporcionada; el único punto de referencia sólido es el modelo base, del que este ajuste hereda arquitectura y tamaño.

## Limitaciones y advertencias

- Conjunto de entrenamiento muy reducido (225 filas de entrenamiento y 25 de validación): el ajuste puede sobreajustarse al estilo y formato de las trayectorias de Jafra y generalizar peor fuera de ese dominio.
- Riesgo de alucinación inherente a un modelo de 2.500 millones de parámetros, especialmente en consultas de conocimiento factual o fuera del ámbito de monitorización de sistemas.
- El parser de tool calls falla si no se preservan los tokens especiales en la salida; es obligatorio configurar `skip_special_tokens=false` o equivalente en el servidor de inferencia.
- El modo thinking debe activarse explícitamente (`enable_thinking=True`); con el razonamiento desactivado el comportamiento puede degradarse respecto al ajuste.
- Idiomas soportados no documentados: no hay garantía de calidad multilingüe más allá de lo que herede del modelo base.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte; conviene validar el comportamiento en el dominio propio antes de producción.
- El repositorio ocupa 13,1 GB, lo que refleja la inclusión de múltiples formatos (fp16, GGUF y adaptador); la descarga completa no es necesaria si solo se usa una variante.
- No se han publicado evaluaciones independientes de seguridad, sesgo o robustez para este ajuste.

## Enlaces

- [Hugging Face: jafra-io/jafra-z-minicpm5-2b-v2](https://huggingface.co/jafra-io/jafra-z-minicpm5-2b-v2)
- [Modelo base: openbmb/MiniCPM5-2B](https://huggingface.co/openbmb/MiniCPM5-2B)
