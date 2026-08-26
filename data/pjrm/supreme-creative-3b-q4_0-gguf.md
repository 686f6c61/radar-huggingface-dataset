# PJRM/supreme-creative-3b-Q4_0-GGUF

## Resumen

El modelo `PJRM/supreme-creative-3b-Q4_0-GGUF` es una conversión al formato GGUF del modelo original `njelitltd2/supreme-creative-3b`, diseñado específicamente para escritura creativa y narración de historias. Ha sido creado mediante la técnica de fusión (merge) con `mergekit` y la estrategia `dare-ties`, lo que combina las capacidades de varios modelos base para optimizar el rendimiento en tareas literarias. Con aproximadamente 3,08 mil millones de parámetros, este modelo está pensado para ejecutarse localmente en entornos con recursos limitados, aprovechando la eficiencia de la cuantización Q4_0 para reducir el uso de memoria sin sacrificar en exceso la calidad de generación.

La relevancia de este modelo radica en su enfoque específico en la escritura creativa, un nicho donde los modelos generales suelen ofrecer resultados genéricos. Al ser una conversión GGUF, es compatible con herramientas como llama.cpp, Ollama y otros runners de inferencia local, lo que facilita su integración en aplicaciones de escritura asistida, generación de narrativas y prototipos de asistentes creativos. Aunque la información técnica completa sobre la arquitectura y los datos de entrenamiento no está disponible en la ficha, su licencia Apache 2.0 permite uso comercial sin restricciones.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 3.085.938.688 |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_0 (GGUF) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (archivo .gguf) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo original `nielitltd2/supreme-creative-3b`. Según los tags y el proceso de conversión, se trata de un modelo de 3B parámetros fusionado mediante `mergekit` con la técnica `dare-ties`. Esta técnica combina los pesos de varios modelos base para preservar las habilidades específicas de cada uno, priorizando la creatividad y la narración. El entrenamiento específico, el número de tokens y el dataset utilizado no se han publicado.

La conversión a GGUF se realizó con llama.cpp a través del espacio `gguf-my-repo`, lo que garantiza compatibilidad con el ecosistema de inferencia local. No se menciona si se aplicaron técnicas de RLHF o DPO, ni se detallan innovaciones arquitectónicas más allá de la fusión.

## Capacidades

- Generación de texto creativo y narración de historias, optimizado para tareas de escritura literaria.
- Soporte de conversación (tag `conversational`), aunque sin información sobre multi-turno avanzado.
- Capacidad de ejecución local en entornos con recursos limitados gracias a la cuantización Q4_0.
- Compatibilidad con herramientas de inferencia estándar como llama.cpp, llama-server y Ollama.
- Sin evidencia de soporte de tool calling, función llamada, agentes o razonamiento multi-step en la información disponible.
- Multilingüismo no confirmado; se asume que el modelo está principalmente en inglés por el tipo de tarea y los tags.

## Casos de uso

- **Generación de borradores creativos**: el modelo puede producir cuentos, poemas o guiones a partir de una premisa inicial, ideal para escritores que buscan inspiración rápida.
- **Asistencia en lluvia de ideas narrativas**: se puede usar para generar listas de tramas, personajes o giros argumentales, aprovechando su entrenamiento en storytelling.
- **Prototipado de chatbots literarios**: su capacidad conversacional permite construir personajes de ficción que interactúan con usuarios en entornos de prueba.
- **Creación de contenido para juegos**: en desarrollo de videojuegos, el modelo puede generar diálogos y descripciones de escenarios para mundos ficticios.
- **Herramientas de escritura colaborativa**: integrado en editores de texto como plugin, ofrece sugerencias de continuación de párrafos en tiempo real.
- **Educación y taller de escritura**: para practicar estilos narrativos o generar ejercicios de escritura creativa en contextos educativos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de métricas como MMLU, HumanEval o GSM8K para este modelo.

## Requisitos de hardware

- **VRAM estimada**: para la cuantización Q4_0 de 3B parámetros, el archivo pesa 1,8 GB. La VRAM necesaria para inferencia con contexto moderado ronda los 4-5 GB (considerando pesos, caché y overhead). Esto permite ejecutarlo en GPUs de gama media como RTX 2060, GTX 1660 Super o incluso en iGPU con memoria compartida.
- **GPU recomendadas**: NVIDIA RTX 3060 (8 GB) o superior para mayor velocidad; también compatible con Apple Silicon (M1/M2) mediante llama.cpp.
- **Compatibilidad con consumer GPU**: sí, cabe en la mayoría de tarjetas con 6 GB o más de VRAM.
- **Opciones de despliegue**: llama.cpp (CLI y servidor), llama-server, Ollama (si se importa el GGUF), o cualquier herramienta que soporte GGUF.
- **Latencia y throughput**: no se dispone de datos concretos. En una RTX 3060 se puede esperar una velocidad de decodificación de 30-60 tokens por segundo para un modelo de 3B, aunque depende del hardware y del contexto.

## Comparativa con modelos similares

No se dispone de una comparativa oficial. Sin embargo, se puede situar frente a otros modelos de 3B parámetros de propósito general como:

| Modelo | Params | Contexto | Licencia | Formato |
|---|---|---|---|---|
| supreme-creative-3b (GGUF) | 3,08B | no disp. | Apache-2.0 | GGUF |
| Llama-3.2-3B | 3,21B | 8K | Llama 3.2 | GGUF, safetensors |
| Phi-2 | 2,7B | 2K | MIT | safetensors, GGUF |

La diferencia clave es que `supreme-creative-3b` está especializado en escritura creativa, mientras que los otros son modelos generalistas. No hay datos de rendimiento para cuantificar su superioridad en esa tarea.

## Limitaciones y advertencias

- **Sesgos y alucinaciones**: al ser un modelo fusionado sin información sobre el dataset de entrenamiento, se desconoce el riesgo de sesgos o la tendencia a inventar hechos. Se recomienda verificar las salidas en contextos profesionales.
- **Contexto limitado**: no se especifica la longitud de contexto; el ejemplo de uso en la model card utiliza `-c 2048`, lo que sugiere una ventana de 2048 tokens como valor típico. Para tareas de escritura larga, puede ser insuficiente.
- **Idioma**: no se indica soporte multilingüe; probablemente esté optimizado para inglés, lo que limita su uso en español sin degradación.
- **Restricciones de licencia**: Apache-2.0 permite uso comercial, pero se debe respetar la atribución y las condiciones de la licencia.
- **Producción**: no se han publicado evaluaciones de robustez ni pruebas de estrés, por lo que su uso en producción requiere validación adicional.

## Enlaces

- [Repositorio HuggingFace del modelo GGUF](https://huggingface.co/PJRM/supreme-creative-3b-Q4_0-GGUF)
- [Modelo base original (nielitltd2/supreme-creative-3b)](https://huggingface.co/nielitltd2/supreme-creative-3b)
- [Modelo GGUF alternativo de mradermacher](https://huggingface.co/mradermacher/supreme-creative-3b-GGUF)
- [Espacio ggml-org/gguf-my-repo](https://huggingface.co/spaces/ggml-org/gguf-my-repo)
- [Repositorio de llama.cpp](https://github.com/ggerganov/llama.cpp)
