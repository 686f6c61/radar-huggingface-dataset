# muahseol/qwen3.5-0.8b-labor-lora

## Resumen

`muahseol/qwen3.5-0.8b-labor-lora` es un adaptador LoRA (Low-Rank Adaptation) entrenado sobre el modelo base `Qwen/Qwen3.5-0.8B`, desarrollado por el usuario muahseol. No se trata de un modelo completo, sino de un conjunto de pesos delta que se cargan junto al modelo base mediante la librería PEFT. Su propósito es especializar un modelo pequeño de 0,8 mil millones de parámetros en consultas laborales en coreano (노무 상담, asesoramiento laboral).

El adaptador se ha entrenado con supervisión (SFT) sobre el dataset `muahseol/labor-counsel-qa`, un corpus de pares pregunta-respuesta sobre derecho laboral coreano. La configuración declarada es rango 8, `lora_alpha` 16, aplicación a todas las capas lineales (`all-linear`), tasa de aprendizaje 2e-4 y 4 épocas de entrenamiento. El resultado es un ajuste ligero que no altera la arquitectura del modelo base y que puede combinarse o descargarse de forma independiente.

Su relevancia es acotada pero clara: demuestra el patrón de especialización vertical de bajo coste mediante LoRA sobre modelos pequeños, útil para nichos de dominio muy concretos (asesoramiento laboral en coreano) donde no se dispone de grandes presupuestos de cómputo ni de datos masivos. El repositorio es de tamaño mínimo (0,0 GB), coherente con un adaptador de rango bajo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base Qwen3.5-0.8B); adaptador LoRA sobre capas lineales |
| Parametros totales | No disponible (el adaptador LoRA no declara recuento; el modelo base es de 0,8B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Coreano (ko) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre `Qwen/Qwen3.5-0.8B`, un transformer decoder-only de aproximadamente 0,8 mil millones de parámetros. La técnica empleada es LoRA con rango 8 y `lora_alpha` 16, lo que implica una escala efectiva de 2 (alpha/rango). La configuración `all-linear` indica que los módulos adaptados cubren todas las proyecciones lineales del transformer, no solo las de atención. El entrenamiento se realizó con la librería TRL en modalidad SFT (supervised fine-tuning), con una tasa de aprendizaje de 2e-4 y 4 épocas sobre el dataset `muahseol/labor-counsel-qa`.

No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset, ni si hubo etapas de RLHF o DPO. Tampoco se documentan innovaciones técnicas adicionales (decodificación especulativa, atención lineal, etc.). El adaptador se distribuye como pesos PEFT en formato safetensors y se carga mediante `PeftModel.from_pretrained` junto al modelo base.

## Capacidades

- Generación de texto especializada en consultas laborales en coreano (preguntas y respuestas sobre relaciones laborales, derechos del trabajador, normativa).
- Ajuste de dominio sobre un modelo base generalista de 0,8B, lo que permite respuestas más alineadas con el registro y terminología del asesoramiento laboral coreano.
- Carga y combinación mediante PEFT, lo que permite alternar entre el modelo base y el adaptador sin duplicar pesos.
- Capacidades heredadas del modelo base Qwen3.5-0.8B (generación de texto general, razonamiento básico), si bien el adaptador está orientado al dominio laboral.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al coreano según la model card; no se documentan otras lenguas.
- Capacidades especiales (modo thinking, visión, audio): no disponible en la información proporcionada.

## Casos de uso

- Asesoramiento laboral automatizado en coreano: el adaptador responde a preguntas frecuentes sobre derechos laborales (horas extra, vacaciones, indemnizaciones) con terminología específica del dominio, adecuado para asistentes de primer nivel en portales de empleo o intranets corporativas.
- Triaje de consultas en departamentos de recursos humanos: el modelo puede clasificar y responder consultas rutinarias de empleados, derivando los casos complejos a un asesor humano, gracias a su ajuste sobre pares pregunta-respuesta laborales.
- Base para sistemas de FAQ en coreano: integrado en un motor de búsqueda o chatbot, permite generar respuestas redactadas a partir de una base de conocimiento laboral, reduciendo el coste de mantenimiento de respuestas estáticas.
- Filtrado y preclasificación de tickets de soporte: el adaptador puede reformular o resumir consultas laborales recibidas por correo o formulario, facilitando su enrutamiento al equipo adecuado.
- Prototipado rápido de asistentes de nicho: al ser un adaptador LoRA de bajo coste sobre un modelo de 0,8B, permite experimentar con especializaciones verticales sin grandes requisitos de cómputo ni de almacenamiento.
- Educación y formación interna: generación de explicaciones introductorias sobre normativa laboral coreana para materiales de onboarding, con revisión humana obligatoria dado el riesgo de alucinación en materia legal.
- Evaluación comparativa de técnicas LoRA: sirve como referencia reproducible para estudiar el efecto de rango, alpha y épocas en la especialización de modelos pequeños sobre dominios acotados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; al tratarse de un modelo base de 0,8B, la inferencia en precisión completa requeriría del orden de 2-3 GB, y en cuantización de 4 bits podría situarse por debajo de 1 GB. Estas cifras son estimaciones generales para modelos de ese tamaño, no datos publicados para este adaptador.
- GPU recomendadas: no disponible en la información proporcionada. Para un modelo de 0,8B, GPUs de consumo como RTX 3060, RTX 4060 o superiores serían suficientes en la mayoría de configuraciones.
- ¿Cabe en GPU de consumo? Sí, previsiblemente, dado el tamaño del modelo base; no se documenta confirmación oficial.
- Opciones de despliegue: carga mediante PEFT y Transformers (`PeftModel.from_pretrained`). No se documentan opciones de vLLM, llama.cpp, Ollama o TGI para este adaptador concreto.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Especializacion |
|---|---|---|---|---|---|
| muahseol/qwen3.5-0.8b-labor-lora | Adaptador LoRA sobre base de 0,8B | No disponible | Apache 2.0 | safetensors (PEFT) | Asesoramiento laboral en coreano |
| Qwen/Qwen3.5-0.8B | 0,8B | No disponible | No disponible en la informacion | safetensors | Modelo base generalista |
| Adaptadores LoRA de dominio genericos | Variable (rango bajo) | Heredado del base | Segun base | safetensors (PEFT) | Segun dataset de ajuste |

No se dispone de información sobre modelos comparables específicos de asesoramiento laboral en coreano; la comparativa se limita al modelo base y a la categoría genérica de adaptadores LoRA de dominio.

## Limitaciones y advertencias

- Riesgo de alucinación elevado en materia legal: el modelo puede generar respuestas plausibles pero incorrectas sobre normativa laboral; requiere revisión humana y no debe usarse como fuente legal definitiva.
- Sesgos conocidos: no documentados en la información disponible; al entrenarse sobre un dataset concreto de pares pregunta-respuesta, puede heredar los sesgos y lagunas de dicho corpus.
- Limitación de idioma: la model card declara únicamente coreano; el rendimiento en castellano u otras lenguas no está garantizado y probablemente sea deficiente para el dominio especializado.
- Limitación de contexto: no se documenta la longitud de contexto efectiva del adaptador ni del modelo base en esta ficha.
- Tamaño reducido del modelo base (0,8B): capacidad limitada para razonamientos complejos, cálculos multi-paso o consultas legales que requieran matices normativos extensos.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero deben respetarse las condiciones del modelo base Qwen3.5-0.8B, cuya licencia no se detalla en la información proporcionada.
- Escasa validación pública: 21 descargas y 0 likes en el momento de la consulta; no hay benchmarks ni evaluaciones independientes publicadas.
- Uso en producción: no recomendado sin una evaluación propia sobre el dominio objetivo y sin mecanismos de derivación a especialistas humanos en casos sensibles.

## Enlaces

- Hugging Face: https://huggingface.co/muahseol/qwen3.5-0.8b-labor-lora
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Dataset de entrenamiento: https://huggingface.co/datasets/muahseol/labor-counsel-qa
- Repositorio PEFT: https://github.com/huggingface/peft
- Repositorio TRL: https://github.com/huggingface/trl
- Documentación de Transformers: https://huggingface.co/docs/transformers
