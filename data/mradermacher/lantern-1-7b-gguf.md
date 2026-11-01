# mradermacher/lantern-1.7b-GGUF

## Resumen

Lantern 1.7B es un modelo lingüístico de 1.720 millones de parámetros desarrollado por visproj, especializado en tareas de agentes y uso de herramientas (tool use) mediante destilación sobre episodios de los entornos NetHack y MiniHack. La ficha aquí tratada corresponde al repositorio de cuantizaciones GGUF publicado por mradermacher, un cuantizador conocido por generar versiones estáticas de modelos populares de Hugging Face, lo que permite ejecutar el modelo en hardware de consumo mediante llama.cpp y derivados.

El modelo base resuelve el problema de la toma de decisiones secuencial y el razonamiento de agentes en entornos de juego complejos, un campo de investigación activo en aprendizaje por refuerzo y modelos de lenguaje. Su relevancia radica en su tamaño reducido (1.7B), que lo hace accesible para experimentación local, y en la licencia Apache 2.0, que permite uso comercial sin restricciones.

La arquitectura específica no está detallada en la model card, aunque el tamaño de 1.72B de parámetros sugiere un transformer compacto similar a Qwen2.5-1.5B o modelos de esa gama. El repositorio de cuantizaciones ofrece versiones desde Q2_K (0,9 GB) hasta f16 (3,5 GB).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (transformer, presumiblemente) |
| Parametros totales | 1.720.574.976 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (este repositorio); el modelo base está disponible en safetensors |

## Arquitectura y entrenamiento

Los detalles arquitectónicos concretos no se han publicado en la model card disponible. Lo que sí consta es que el modelo se ha entrenado mediante destilación (distillation) sobre el dataset visproj/lantern-episodes, compuesto por episodios de los juegos NetHack y MiniHack. NetHack es un roguelike clásico con un espacio de acciones enorme y dinámicas complejas, y MiniHack es su framework de benchmarking basado en el motor de NetHack, ambos ampliamente usados como entornos de evaluación para agentes generales.

El uso de destilación sobre trayectorias de episodios sugiere que el modelo aprende políticas de comportamiento y uso de herramientas a partir de demostraciones, en lugar de mediante aprendizaje por refuerzo directo desde cero. No hay información disponible sobre el número de tokens de entrenamiento, la composición detallada del dataset ni el uso de RLHF o DPO. Tampoco consta la plantilla de chat ni el formato de instrucciones empleado.

## Capacidades

- Generación de texto conversacional (etiqueta conversational en el repositorio)
- Uso de herramientas (tool use), según las etiquetas oficiales del modelo
- Comportamiento como agente en entornos de decisión secuencial, con especialización en NetHack y MiniHack
- Razonamiento multi-paso implícito en la tarea de agente, entrenado sobre trayectorias de juego completas
- No hay evidencia de capacidades multimodales (visión, audio) en la información disponible
- No hay información sobre soporte de function calling estandarizado ni sobre capacidades matemáticas o de código

## Casos de uso

- Investigación en agentes para juegos: el modelo puede servir como política base o punto de comparación en experimentos de agentes sobre NetHack y MiniHack, entornos estándar en la literatura de aprendizaje por refuerzo.
- Experimentación local de bajo coste: con cuantizaciones de 0,9 a 1,9 GB, es ideal para probar pipelines de agentes en portátiles o GPUs de consumo sin necesidad de servidores.
- Prototipado de tool use: la etiqueta de tool-use permite integrarlo en frameworks de agentes (LangChain, LlamaIndex, smolagents) para validar orquestaciones antes de escalar a modelos mayores.
- Benchmarking de cuantizaciones: al disponer de 12 niveles de cuantización, es útil para medir la degradación de calidad de agentes pequeños frente a la precisión reducida.
- Educación y docencia: su tamaño reducido permite que estudiantes ejecuten un modelo agéntico completo en clase o en Google Colab sin restricciones de hardware.
- Estudios de destilación de comportamientos: útil como caso práctico para investigar cómo la destilación sobre episodios transfiere capacidades de decisión secuencial a un modelo de lenguaje.
- Automatización de tareas secuenciales simples: puede emplearse como agente ligero en bucles de decisión donde la latencia y el coste importan más que la máxima capacidad de razonamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio de cuantizaciones no incluye evaluaciones, y la model card del modelo base visproj/lantern-1.7b no está accesible en la informacion proporcionada. Al tratarse de un modelo especializado en NetHack/MiniHack, los resultados relevantes serían tasas de éxito en esos entornos, pero no hay cifras publicadas.

## Requisitos de hardware

- VRAM estimada para inferencia: desde ~1 GB para Q2_K hasta ~3,5 GB para f16; con contexto, recomendar al menos 2 GB de RAM/VRAM para las cuantizaciones intermedias (Q4_K_M: 1,2 GB).
- Al ser un modelo de 1.7B parámetros, cabe cómodamente en cualquier GPU de consumo: RTX 3060, RTX 4060, RTX 4090 e incluso iGPU modernas. No se requiere A100 ni H100.
- También funciona por CPU puro: con 4-8 GB de RAM es suficiente para la mayoría de las cuantizaciones.
- Despliegue: llama.cpp de forma nativa (formato GGUF), Ollama (importando el GGUF), LM Studio, KoboldCpp o cualquier runtime compatible con GGUF. El modelo base en safetensors puede desplegarse con vLLM, TGI o transformers.
- Latencia y throughput: no disponibles; por tamaño y cuantización, se espera generación rápida incluso en CPU (decenas de tokens por segundo en hardware moderno), pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Lantern 1.7B (visproj) | 1,72B | no disponible | agentes, NetHack/MiniHack, tool use | Apache 2.0 | safetensors + GGUF |
| Qwen2.5-1.5B-Instruct | 1,54B | 32.768 (128K con YaRN) | general, código, tool use | Apache 2.0 (salvo 3B y 72B) | safetensors + GGUF |
| SmolLM2-1.7B-Instruct (HuggingFaceTB) | 1,71B | 8.192 | general, chat, instrucciones | Apache 2.0 | safetensors + GGUF |
| Llama-3.2-1B-Instruct | 1,24B | 128.000 | general, multilingüe, tool use | Licencia Llama 3.2 | safetensors + GGUF |

Lantern se diferencia de estas alternativas en su especialización mediante destilación en entornos de juego agénticos, mientras que los modelos comparables son generalistas. Para tareas generales de chat o código, los alternativos tienen benchmarks publicados y ecosistemas más maduros; para investigación en agentes sobre NetHack/MiniHack, Lantern es la opción específica.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles; al estar destilado sobre episodios de NetHack/MiniHack, su comportamiento estará fuertemente sesgado hacia el dominio de juego y las políticas de los episodios de entrenamiento.
- Riesgo de alucinación: no cuantificado; como en cualquier modelo pequeño, debe esperarse una fiabilidad limitada en tareas fuera de su dominio de entrenamiento.
- Limitaciones de idioma: entrenado solo en inglés (language: en); no hay soporte declarado para castellano ni otros idiomas.
- Longitud de contexto no publicada: desconocida, lo que dificulta planificar aplicaciones con documentos largos.
- Restricciones de licencia: Apache 2.0, sin restricciones para uso comercial; la licencia no es un impedimento.
- Las cuantizaciones son estáticas; no existen (por ahora) versiones imatrix/weighted, por lo que las cuantizaciones bajas (Q2_K, Q3_K) pueden degradar notablemente la calidad, especialmente en tareas agénticas donde la precisión en el formato de las acciones es crítica.
- Al ser un modelo de nicho con 402 descargas y sin benchmarks publicados, su uso en producción requiere validación propia exhaustiva.

## Enlaces

- Repositorio de cuantizaciones GGUF: https://huggingface.co/mradermacher/lantern-1.7b-GGUF
- Modelo base: https://huggingface.co/visproj/lantern-1.7b
- Dataset de entrenamiento: https://huggingface.co/datasets/visproj/lantern-episodes
- Página de descargas del cuantizador: https://hf.tst.eu/model#lantern-1.7b-GGUF
- Solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF de TheBloke: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa del cuantizador: https://www.nethype.de/
