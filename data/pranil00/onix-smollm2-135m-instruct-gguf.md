# pranil00/ONIX-SmolLM2-135M-Instruct-GGUF

## Resumen

ONIX-SmolLM2-135M-Instruct-GGUF es una cuantización en formato GGUF (tipo Q8_0) del modelo HuggingFaceTB/SmolLM2-135M-Instruct, publicada por el usuario pranil00 bajo la etiqueta "ONIX Community". No se trata de un modelo entrenado desde cero, sino de una conversión de pesos del modelo original de Hugging Face a un formato optimizado para inferencia local con llama.cpp y Ollama. El repositorio ocupa 0,1 GB y contiene un único archivo de pesos de aproximadamente 0,13 GB.

El modelo base, SmolLM2-135M-Instruct, es un transformer decoder-only de 134.515.008 parámetros (unos 135 millones) desarrollado por Hugging Face dentro de la familia SmolLM2. Está diseñado para tareas de generación de texto y conversación en entornos con recursos muy limitados: móviles, Raspberry Pi, navegadores o CPUs sin GPU. Su relevancia radica en que permite ejecutar un modelo de lenguaje instructivo en hardware de gama muy baja, con un consumo de memoria inferior a 1 GB incluso en cuantizaciones de 8 bits.

Esta ficha describe la versión cuantizada Q8_0 publicada en el repositorio, pero la mayor parte de las características técnicas (arquitectura, entrenamiento, capacidades) provienen del modelo base SmolLM2-135M-Instruct, ya que la model card del repositorio no aporta información adicional sobre el proceso de cuantización más allá del formato y el tamaño.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (modelo base SmolLM2-135M-Instruct) |
| Parámetros totales | 134.515.008 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada |
| Tipos de cuantización | Q8_0 (8 bits) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El repositorio no documenta el proceso de entrenamiento del modelo base. Según la información disponible, SmolLM2-135M-Instruct es un transformer decoder-only de 135 millones de parámetros. No se especifican en la información proporcionada el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de alineación como RLHF o DPO. Tampoco se detallan innovaciones arquitectónicas específicas (atención lineal, decodificación especulativa, etc.) más allá de la arquitectura transformer estándar.

La contribución de este repositorio concreto es la cuantización a Q8_0 mediante llama.cpp, realizada según el autor en Apple Silicon con Metal. La model card indica que la conversión de tensores fue verificada como auténtica. El resultado es un archivo GGUF de 0,13 GB que preserva los pesos del modelo original con precisión de 8 bits, lo que reduce el tamaño frente a los pesos en safetensors (aproximadamente 0,27 GB en fp16 para 135M de parámetros) a costa de una pérdida mínima de calidad.

## Capacidades

- Generación de texto conversacional e instructiva, heredada del modelo base SmolLM2-135M-Instruct.
- Respuesta a instrucciones en formato chat (modelo "-Instruct").
- Ejecución local en CPU y GPU de gama muy baja gracias al formato GGUF y al tamaño reducido.
- Compatible con endpoints (etiqueta `endpoints_compatible` en el repositorio).
- Soporte de tool calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Capacidades especiales (thinking mode, visión, audio): no disponible en la información proporcionada.

## Casos de uso

- Prototipado rápido de chatbots en local: el archivo GGUF de 0,13 GB se carga con `llama-cli` u Ollama en cuestión de segundos, lo que permite iterar sobre prompts y flujos conversacionales sin depender de APIs externas ni de GPU.
- Aplicaciones embebidas y edge computing: con 135M de parámetros y cuantización Q8_0, el modelo cabe en dispositivos con menos de 1 GB de RAM libre, como Raspberry Pi, routers o móviles, y puede ofrecer generación de texto básica sin conexión.
- Filtrado y clasificación de texto ligera: tareas de etiquetado, resumen corto o reescritura de frases que no requieren razonamiento complejo y se benefician de una latencia muy baja en CPU.
- Educación y demostraciones: permite mostrar el funcionamiento interno de un LLM instructivo en talleres o aulas sin necesidad de hardware especializado, usando Ollama con un solo comando.
- Pruebas de pipelines de inferencia: sirve como modelo de humo para validar integraciones con llama.cpp, Ollama o servidores compatibles con la API de OpenAI antes de desplegar modelos mayores.
- Generación de texto auxiliar en herramientas de desarrollo: autocompletado de descripciones, mensajes de commit o textos de interfaz donde el coste computacional debe ser mínimo y la calidad exigida es moderada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: aproximadamente 0,15-0,25 GB para el archivo Q8_0 de 0,13 GB más overhead de contexto y runtime de llama.cpp.
- GPU recomendadas: no requiere GPU; funciona en CPU. Cualquier GPU con más de 1 GB de VRAM es suficiente (GTX 1050, RTX 3050, integradas modernas).
- Cabe en cualquier GPU de consumo, incluida la mayoría de iGPU y SoCs (Apple Silicon, Snapdragon, Raspberry Pi 4/5).
- Opciones de despliegue: Ollama (`ollama run pranil00/ONIX-SmolLM2-135M-Instruct-GGUF`), llama.cpp (`llama-cli`), y cualquier runtime compatible con GGUF (llama-cpp-python, LM Studio, koboldcpp).
- Latencia y throughput estimados: no disponibles en la información proporcionada; en CPU moderna se espera una generación de decenas de tokens por segundo dada la escala del modelo, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ONIX-SmolLM2-135M-Instruct-GGUF (este) | 134,5M | no disponible | GGUF Q8_0 | Apache 2.0 | Hugging Face (0 descargas) |
| HuggingFaceTB/SmolLM2-135M-Instruct | 135M | no disponible | safetensors | Apache 2.0 | Hugging Face (modelo base) |
| SmolLM2-360M-Instruct | 360M | no disponible | safetensors / GGUF | Apache 2.0 | Hugging Face |
| Qwen2.5-0.5B-Instruct | 500M | no disponible | safetensors / GGUF | Apache 2.0 | Hugging Face |

La comparativa se limita a datos de parámetros y licencia; no se dispone de resultados de benchmarks en la información proporcionada para comparar rendimiento entre estos modelos.

## Limitaciones y advertencias

- Modelo de 135M de parámetros: la calidad de generación, el razonamiento y el seguimiento de instrucciones son muy limitados en comparación con modelos de mayor tamaño; no es adecuado para tareas que exijan precisión factual o razonamiento complejo.
- Riesgo alto de alucinación: al ser un modelo pequeño, tiende a inventar información y a perder coherencia en generaciones largas.
- Longitud de contexto no documentada en la información disponible; no se debe asumir una ventana amplia.
- Idiomas soportados no documentados; el rendimiento fuera del inglés puede ser deficiente.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de uso comunitario ni validación independiente de la cuantización más allá de la verificación declarada por el autor.
- La model card no detalla el proceso de cuantización (versión de llama.cpp, parámetros exactos) ni incluye métricas de perplejidad que permitan evaluar la pérdida de calidad frente al modelo original.
- Licencia Apache 2.0: permite uso comercial, pero se recomienda revisar la licencia del modelo base y citar adecuadamente a Hugging Face como autor original.
- Para producción con requisitos de calidad, se recomienda usar el modelo base en safetensors o una cuantización publicada por el equipo oficial de Hugging Face.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/pranil00/ONIX-SmolLM2-135M-Instruct-GGUF
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolLM2-135M-Instruct
- llama.cpp (runtime GGUF): https://github.com/ggerganov/llama.cpp
- Ollama: https://ollama.com
