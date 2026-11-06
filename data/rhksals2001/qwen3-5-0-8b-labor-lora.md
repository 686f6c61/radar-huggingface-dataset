# rhksals2001/qwen3.5-0.8b-labor-lora

## Resumen

`rhksals2001/qwen3.5-0.8b-labor-lora` es un adaptador LoRA de tipo SFT (supervised fine-tuning) publicado por el usuario rhksals2001 sobre el modelo base `Qwen/Qwen3.5-0.8B`. Su propósito declarado es especializar un modelo pequeño de 0,8 mil millones de parámetros en tareas de consulta laboral (노무 상담, "asesoramiento laboral") en coreano, a partir del dataset propio `rhksals2001/labor-counsel-qa`.

Se trata de un artefacto de pesos de adaptador (PEFT), no de un modelo completo: requiere cargar el modelo base Qwen3.5-0.8B y aplicar el adaptador mediante `PeftModel.from_pretrained`. El repositorio es de tamaño prácticamente nulo (0,0 GB según Hugging Face), lo que es coherente con un adaptador LoRA de rango bajo (r=8) sobre un modelo de menos de mil millones de parámetros.

Su relevancia es acotada y muy específica: demuestra el patrón de especialización vertical de un LLM pequeño mediante LoRA para un dominio regulado (derecho laboral coreano), con licencia Apache 2.0 y un coste de entrenamiento e inferencia muy bajo. No hay información publicada sobre benchmarks, composición del dataset ni evaluación de calidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only Qwen3.5-0.8B |
| Parametros totales | No disponible para el adaptador; modelo base de 0,8B (aproximadamente 800 millones) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del modelo base Qwen3.5-0.8B; no especificada en la información) |
| Tipos de cuantizacion | No disponible (el adaptador se publica en safetensors; la cuantización dependería del modelo base) |
| Idiomas soportados | Coreano (ko) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se entrena sobre `Qwen/Qwen3.5-0.8B`, un transformer decoder-only de la familia Qwen3.5. La configuración LoRA declarada en la model card es: rango r=8, `lora_alpha`=16, aplicación sobre todas las capas lineales (`all-linear`), tasa de aprendizaje 2e-4 y 4 épocas de entrenamiento supervisado (SFT) con la librería TRL. No se especifica el número de tokens de entrenamiento, el tamaño del dataset ni si hubo etapas posteriores de alineación (RLHF/DPO).

El dataset de entrenamiento es `rhksals2001/labor-counsel-qa`, un conjunto de pares pregunta-respuesta sobre consultas laborales en coreano. No se dispone de información sobre su composición, procedencia, número de ejemplos ni proceso de anotación. No se documentan innovaciones técnicas adicionales (decodificación especulativa, atención lineal, etc.) más allá del propio ajuste LoRA.

## Capacidades

- Generación de texto en coreano orientada a preguntas y respuestas sobre temática laboral.
- Respuesta a consultas de asesoramiento laboral dentro del dominio del dataset de entrenamiento.
- Especialización mediante adaptador desacoplado: puede combinarse con el modelo base y activarse o desactivarse según la tarea.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al coreano según la etiqueta de idioma declarada.
- Capacidades especiales (modo thinking, visión, audio): no disponibles en la información proporcionada.

## Casos de uso

- Asistencia en consultas laborales en coreano: el adaptador responde a preguntas sobre derechos y obligaciones laborales ajustándose al estilo y contenido del dataset `labor-counsel-qa`, lo que lo hace adecuado para prototipos de orientación preliminar.
- Chatbot de primera línea para recursos humanos: al ejecutarse sobre un modelo de 0,8B, puede desplegarse en infraestructura modesta para resolver dudas frecuentes antes de escalar a un asesor humano.
- Clasificación y enrutado de consultas laborales: el modelo puede generar respuestas borrador que un sistema posterior revise o clasifique por temática (despidos, salarios, jornada, vacaciones).
- Generación de borradores de respuestas para atención al empleado: útil como paso previo de redacción que un especialista revisa, reduciendo tiempo de respuesta en equipos de RR. HH.
- Investigación sobre especialización vertical de modelos pequeños: sirve como referencia reproducible para estudiar el efecto de LoRA (r=8, all-linear, 4 épocas) en dominios regulados con pocos datos.
- Experimentación con despliegue ligero en coreano: combinado con el modelo base, permite probar pipelines de generación en local o en CPU/GPU de gama baja con fines de evaluación técnica.
- Filtrado y preanotación de datasets legales: puede emplearse para preetiquetar pares pregunta-respuesta laborales que después se validan manualmente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; al tratarse de un modelo base de 0,8B, la huella es reducida. En fp16 se estima en torno a 1,6 GB solo para los pesos del modelo base, más el adaptador (de pocos MB) y la caché KV.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para fp16; tarjetas como RTX 3060, RTX 4060, RTX 4090, A100 o H100 son suficientes y en la mayoría de casos sobredimensionadas.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU consumer con 4 GB o más de VRAM, y potencialmente en CPU con cuantización del modelo base.
- Opciones de despliegue: `transformers` + `peft` (carga del adaptador con `PeftModel.from_pretrained`), y previsiblemente llama.cpp/Ollama/vLLM si se fusiona el adaptador con el modelo base y se convierte a GGUF, aunque esto no está documentado por el autor.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| rhksals2001/qwen3.5-0.8b-labor-lora | Adaptador sobre 0,8B | No disponible | Apache 2.0 | LoRA SFT para consultas laborales en coreano | Hugging Face (PEFT) |
| Qwen/Qwen3.5-0.8B (base) | 0,8B | No disponible | No disponible en la información | Modelo generalista | Hugging Face |
| Alternativas de 0,5B-1B para coreano | No disponible | No disponible | No disponible | Modelos pequeños generalistas o ajustados | No disponible |

No se dispone de datos de rendimiento comparativo ni de modelos directamente equivalentes en la información proporcionada.

## Limitaciones y advertencias

- Es un adaptador LoRA, no un modelo autónomo: sin el modelo base `Qwen/Qwen3.5-0.8B` no es utilizable.
- Dominio y idioma muy restringidos: entrenado únicamente para consultas laborales en coreano; su rendimiento fuera de ese ámbito es incierto.
- Riesgo de alucinación elevado en materia legal: un modelo de 0,8B ajustado con SFT puede generar respuestas verosímiles pero incorrectas sobre normativa laboral, con consecuencias potencialmente graves si se usa sin supervisión.
- Ausencia de evaluación publicada: no hay benchmarks, métricas de calidad ni análisis de errores que permitan estimar su fiabilidad.
- Dataset de entrenamiento no documentado: se desconoce su tamaño, procedencia, sesgos y cobertura temática.
- Sesgos: no documentados; al derivarse de un dataset específico, puede reflejar sesgos de la fuente original.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar la licencia del modelo base Qwen3.5-0.8B antes de un despliegue en producción.
- No apto como asesoramiento legal definitivo: debe utilizarse como herramienta de apoyo con revisión humana obligatoria.
- Fecha de creación del repositorio: 2026-10-30, con muy pocas descargas (16) y sin interacciones (0 likes), lo que sugiere escasa validación por parte de la comunidad.

## Enlaces

- Hugging Face del adaptador: https://huggingface.co/rhksals2001/qwen3.5-0.8b-labor-lora
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Dataset de entrenamiento: https://huggingface.co/datasets/rhksals2001/labor-counsel-qa
- Librería PEFT: https://github.com/huggingface/peft
- Librería TRL: https://github.com/huggingface/trl
