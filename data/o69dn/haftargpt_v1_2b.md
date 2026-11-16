# o69dn/HaftarGPT_v1_2b

## Resumen

HaftarGPT_v1_2b es una conversión a formato GGUF de un modelo de la familia Qwen3.5, concretamente el checkpoint `Huihui-Qwen3.5-2B-abliterated`, publicada por el usuario o69dn en Hugging Face. Se trata de un modelo de lenguaje con capacidades de visión (vision-language-model), derivado de una versión "abliterated" de Qwen3.5-2B, lo que implica que se ha aplicado una modificación para eliminar o atenuar los mecanismos de rechazo del modelo original. El repositorio contiene únicamente los pesos en formato GGUF listos para su uso con llama.cpp, junto con el proyector multimodal necesario para el procesamiento de imágenes.

El modelo cuenta con aproximadamente 1.940 millones de parámetros (1.942.653.248 según los datos de safetensors), lo que lo sitúa en la categoría de modelos pequeños, adecuados para despliegue en hardware de consumo. El repositorio tiene un tamaño de 2,0 GB y se distribuye con dos ficheros: una cuantización F16 del proyector multimodal (`F16-mmproj.gguf`) y una cuantización Q4_K_M del modelo principal. La conversión se realizó mediante la herramienta Unsloth, y el resultado es compatible con las herramientas `llama-cli` y `llama-mtmd-cli` de llama.cpp.

La relevancia de este modelo radica en su combinación de tamaño reducido, soporte multimodal y formato GGUF optimizado para inferencia local. No obstante, la información pública disponible es extremadamente limitada: no se especifican la licencia, los idiomas soportados, los datos de entrenamiento ni los resultados de benchmarks. La model card se limita a indicar el proceso de conversión y los comandos de uso, sin proporcionar detalles técnicos adicionales sobre el modelo base ni sobre el proceso de "abliteration".

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5), con proyector multimodal para visión |
| Parámetros totales | 1.942.653.248 (~1,94 mil millones) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | F16 (proyector multimodal), Q4_K_M (modelo principal) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | GGUF (safetensors como formato original de referencia) |

## Arquitectura y entrenamiento

La arquitectura subyacente corresponde a la familia Qwen3.5, un transformer decoder-only de aproximadamente 1,94 mil millones de parámetros. El modelo incluye un proyector multimodal (`mmproj`) que permite el procesamiento de imágenes, lo que lo convierte en un vision-language model. El checkpoint base es `Huihui-Qwen3.5-2B-abliterated`, una variante "abliterated" que, según la práctica habitual en este tipo de modelos, implica la modificación de las direcciones de activación relacionadas con el rechazo para reducir las negativas del modelo a ciertas peticiones. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO en el modelo original o en la variante abliterated.

La innovación técnica destacable es la conversión a GGUF mediante Unsloth, que facilita la ejecución en CPU y GPU con llama.cpp. El repositorio incluye el proyector multimodal en F16 y el modelo principal en Q4_K_M, una cuantización de 4 bits que reduce el uso de memoria manteniendo un equilibrio entre calidad y eficiencia. No se documentan técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto conversacional: el modelo está etiquetado como "conversational" y puede mantener diálogos multi-turno.
- Procesamiento de visión: al incluir un proyector multimodal, puede recibir imágenes y generar descripciones o responder preguntas sobre ellas mediante `llama-mtmd-cli`.
- Razonamiento y código: aunque no se detalla explícitamente, la familia Qwen3.5 suele incluir capacidades de razonamiento, matemáticas y generación de código; sin embargo, no hay confirmación en la información proporcionada.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo "thinking": no disponible en la información proporcionada.
- La variante "abliterated" implica una reducción de los rechazos, lo que puede afectar al comportamiento en dominios sensibles.

## Casos de uso

- Asistente conversacional local: el modelo puede ejecutarse en un portátil o equipo de sobremesa con llama.cpp gracias a su cuantización Q4_K_M (aproximadamente 1,2 GB de pesos), ofreciendo respuestas conversacionales sin conexión a internet.
- Descripción de imágenes en entornos con recursos limitados: mediante `llama-mtmd-cli` y el proyector multimodal en F16, se puede utilizar para generar descripciones automáticas de imágenes en aplicaciones de accesibilidad o catalogación, con un coste computacional bajo.
- Prototipado rápido de aplicaciones multimodales: al ser un GGUF compatible con llama.cpp, permite integrar visión y texto en prototipos sin necesidad de infraestructura GPU dedicada, usando CPU o GPU de consumo.
- Filtrado y moderación de contenido con menor tasa de rechazos: la naturaleza abliterated puede ser útil en tareas donde se requiere que el modelo procese contenido sensible sin negarse, como análisis de toxicidad o revisión de materiales para investigación.
- Educación y experimentación: adecuado para investigadores que quieran estudiar el efecto de la abliteration en modelos pequeños y multimodales, comparando el comportamiento con el Qwen3.5-2B original.
- Despliegue en dispositivos edge: con 1,94 mil millones de parámetros y cuantización de 4 bits, el modelo puede ejecutarse en dispositivos con 4-8 GB de RAM, como Raspberry Pi 5 (con limitaciones de velocidad) o mini-PC, para tareas de asistencia básica.
- Generación de texto en entornos con requisitos de privacidad: al ejecutarse localmente, los datos no salen del dispositivo, lo que es adecuado para procesar información confidencial en sectores como salud o legal.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el fichero Q4_K_M ocupa aproximadamente 1,2 GB (el repositorio total es de 2,0 GB, incluyendo el proyector F16). Se recomienda al menos 2-3 GB de VRAM/RAM libre para el modelo y el contexto.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM, como NVIDIA GTX 1650, RTX 3050, RTX 4060, o GPUs de datacenter como A100/H100 (aunque están sobredimensionadas para este modelo). También puede ejecutarse en CPU.
- ¿Cabe en GPU de consumo? Sí, en la mayoría de GPUs de consumo con 4 GB o más de VRAM, e incluso en iGPUs con memoria compartida.
- Opciones de despliegue: llama.cpp (herramientas `llama-cli` y `llama-mtmd-cli`), y por extensión cualquier frontend compatible con GGUF como Ollama, LM Studio o text-generation-webui. No se mencionan vLLM ni TGI, que no soportan GGUF de forma nativa para este tipo de modelos multimodales.
- Latencia y throughput estimados: no disponibles. En una GPU moderna, un modelo de 2B en Q4_K_M puede generar decenas de tokens por segundo, pero no hay datos oficiales.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Multimodal | Licencia | Formato |
|---|---|---|---|---|---|
| HaftarGPT_v1_2b | ~1,94 B | No disponible | Sí (visión) | No disponible | GGUF |
| Qwen3.5-2B (original) | ~1,94 B | No disponible | No disponible | No disponible | Safetensors, GGUF |
| Huihui-Qwen3.5-2B-abliterated | ~1,94 B | No disponible | No disponible | No disponible | Safetensors |
| Llama 3.2 1B | 1,24 B | 128 K | No | Llama 3.2 Community License | Safetensors, GGUF |
| Gemma 2 2B | 2,6 B | 8 K | No | Gemma Terms of Use | Safetensors, GGUF |

La comparativa se limita a aspectos estructurales, ya que no hay datos de rendimiento para HaftarGPT_v1_2b. Frente a Llama 3.2 1B y Gemma 2 2B, este modelo ofrece soporte multimodal (visión) y una licencia indeterminada, lo que supone una ventaja en capacidades pero una incertidumbre legal para uso comercial. La variante abliterated lo diferencia en cuanto a política de rechazos, pero también introduce riesgos adicionales de contenido inapropiado.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados, pero al derivar de Qwen3.5 y haber sido sometido a abliteration, es probable que herede sesgos del modelo original y que la eliminación de rechazos pueda amplificar respuestas sesgadas o inapropiadas.
- Riesgo de alucinación: inherente a los modelos de lenguaje de 2B; la cuantización Q4_K_M puede incrementar ligeramente la degradación en tareas de razonamiento complejo.
- Limitaciones de contexto o idioma: se desconoce la longitud de contexto y los idiomas soportados; la model card no los especifica. No se recomienda asumir un contexto largo sin verificación.
- Restricciones de licencia: la licencia no está disponible, lo que impide determinar si se permite uso comercial. Es imprescindible contactar con el autor o consultar el repositorio original de Qwen3.5 antes de un uso en producción.
- Caveat importante para producción: el modelo es una conversión no oficial de un checkpoint abliterated; no hay garantías de calidad, soporte ni mantenimiento. La ausencia de benchmarks y de documentación sobre el entrenamiento hace arriesgado su uso en aplicaciones críticas.
- El proceso de abliteration puede degradar capacidades en tareas que requieren matices éticos o de seguridad, y puede generar contenido no deseado en entornos sin filtros adicionales.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que sugiere que no ha sido validado por la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/o69dn/HaftarGPT_v1_2b
- Unsloth (herramienta de conversión): https://github.com/unslothai/unsloth
- llama.cpp (runtime): https://github.com/ggerganov/llama.cpp
- Repositorio del modelo base (referencia, no confirmado): no disponible
- Paper o blog del modelo original: no disponible
- Demo: no disponible
