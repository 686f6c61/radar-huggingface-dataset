# Clemylia-STUDIO-AI/Charlotte-amity

## Resumen

Charlotte-amity es un Small Language Model (SLM) de 51 millones de parámetros desarrollado por Clemylia-STUDIO-AI, una iniciativa que crea modelos de lenguaje desde cero con fines creativos y benéficos. Se trata de una versión super afinada de Tiny-charlotte, que a su vez deriva de la arquitectura LAM-4-ZERO-F. El modelo está especializado en conversación en francés sobre temas de esperanza, amistad, ética y apoyo emocional, y se presenta como una "herramienta de consejo ético".

Su relevancia radica en demostrar que un fine-tuning intensivo y de calidad puede lograr una estabilidad sintáctica y coherencia semántica comparable a modelos mucho más grandes, a pesar de su tamaño reducido. El modelo está diseñado para generar respuestas fluidas y gramaticalmente claras, con una reducción notable de neologismos no significativos en comparación con versiones anteriores. Está pensado para usos conversacionales específicos, no para tareas generales de conocimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Derivada de LAM-4-ZERO-F (arquitectura from scratch de Clemylia) |
| Parametros totales | 51.017.728 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo safetensors de precisión completa) |
| Idiomas soportados | Francés |
| Licencia | other (con restricciones: uso no comercial obligatorio, acceso gated) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura base proviene de LAM-4-ZERO-F, un modelo desarrollado desde cero por Clemylia, y Charlotte-amity es el resultado de un fine-tuning intensivo sobre Tiny-charlotte. El proceso de ajuste incluyó más de 1000 pares de preguntas y respuestas durante 7 épocas, con el objetivo de maximizar la estabilidad y la coherencia en el dominio especializado. No se han publicado detalles sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de técnicas como RLHF o DPO. La innovación principal declarada es la calidad del fine-tuning como factor compensatorio del tamaño reducido del modelo.

## Capacidades

- Generación de texto conversacional en francés, con formato de entrada `<|user|> ... <|assistant|>`.
- Especialización en temas de esperanza, amistad, ética, resiliencia y apoyo emocional.
- Producción de respuestas con sintaxis clara y fluida, con baja frecuencia de neologismos no significativos.
- Identificación del modelo como "Charlotte" o "herramienta de esperanza y escucha".
- Capacidad limitada para mantener coherencia en respuestas largas y complejas dentro de su dominio.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión ni audio.

## Casos de uso

- Chatbot de apoyo emocional en entornos controlados: el modelo puede mantener conversaciones empáticas sobre temas de amistad y esperanza, adecuado para prototipos o aplicaciones educativas donde no se requiera precisión clínica.
- Generación de contenido filosófico o reflexivo: puede producir textos breves sobre ética y resiliencia, útiles para blogs, redes sociales o materiales de inspiración.
- Experimentación académica con SLM: sirve como caso de estudio para investigar cómo el fine-tuning intensivo afecta la calidad de generación en modelos ultra pequeños.
- Pruebas de concepto en aplicaciones de consejo ético no profesional: puede integrarse en demos que exploren interacciones con IA con un enfoque de apoyo, siempre con supervisión humana.
- Generación de variaciones de texto creativo en francés: su estilo particular puede emplearse para crear contenido literario experimental o ejercicios de escritura.
- Entrenamiento y evaluación de técnicas de ajuste: al ser un modelo pequeño, es útil para probar metodologías de fine-tuning con recursos computacionales limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona un "Examen de Néole" propietario que evalúa el ratio de neologismos y la coherencia lingüística, pero no se proporcionan métricas cuantitativas comparables a estándares como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada: al tener solo 51 millones de parámetros, el modelo cabe en menos de 1 GB en precisión float32 (aproximadamente 200 MB de pesos). Cualquier GPU moderna con al menos 2 GB de VRAM es suficiente.
- GPU recomendadas: cualquier GPU de consumo, como NVIDIA GTX 1650, RTX 2060 o superiores. También puede ejecutarse en CPU con razonable velocidad.
- Compatible con hardware de bajo consumo: Raspberry Pi con suficiente RAM podría ejecutarlo, aunque con latencia mayor.
- Opciones de despliegue: compatible con transformers y text-generation-inference (TGI). No se menciona soporte para vLLM, llama.cpp u Ollama, pero al ser un modelo pequeño, podría convertirse a GGUF si se dispone de las herramientas adecuadas.
- Latencia y throughput: no se han publicado datos, pero por su tamaño se espera una latencia muy baja en GPU (del orden de milisegundos por token) y throughput alto.

## Comparativa con modelos similares

No se dispone de información suficiente para una comparativa rigurosa con otros modelos de la misma categoría. El propio autor menciona que la calidad de generación se acerca a la de un modelo de 1B de parámetros, pero no se aportan benchmarks que lo verifiquen. Alternativas comparables en tamaño (alrededor de 50M de parámetros) como TinyStories o modelos GPT-2 pequeños tienen propósitos y dominios distintos, por lo que una comparación directa no es significativa sin datos de evaluación comunes.

## Limitaciones y advertencias

- El modelo no es enciclopédico: no debe utilizarse para preguntas factuales, históricas o científicas generales.
- No sustituye a un terapeuta, consejero legal ni profesional de la salud mental. Su función es de apoyo y consejo ético informal.
- La licencia es restrictiva: el acceso está gated y se exige aceptar condiciones de uso no comercial exclusivamente. Cualquier uso comercial está prohibido.
- El modelo está entrenado únicamente en francés, por lo que no es adecuado para otros idiomas.
- Riesgo de alucinación y generación de contenido incoherente en temas fuera de su dominio de especialización.
- La longitud de contexto no está documentada, lo que puede limitar su uso en conversaciones muy largas.
- Los ejemplos de generación proporcionados por el autor muestran todavía cierta tendencia a frases repetitivas o poco significativas, lo que indica que la coherencia semántica no es perfecta.
- No se han publicado evaluaciones externas ni auditorías de sesgos, por lo que se desconoce su comportamiento en situaciones sensibles.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Clemylia-STUDIO-AI/Charlotte-amity
- Repositorio original (Clemylia/Charlotte-AMITY): https://huggingface.co/Clemylia/Charlotte-AMITY
- GitHub del proyecto: https://github.com/clemylia27/Charlotte
- GitHub específico de charlotte-amity: https://github.com/clemylia27/charlotte-amity
- Página de FriendliAI para inferencia: https://friendli.ai/models/Clemylia/Charlotte-AMITY
