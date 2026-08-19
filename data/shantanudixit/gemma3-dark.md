# shantanudixit/gemma3-dark

## Resumen

`shantanudixit/gemma3-dark` no es un modelo nuevo, sino una configuración de personalidad sobre el modelo base **Google Gemma 3 4B**. El repositorio proporciona un Modelfile de Ollama con instrucciones de sistema y ajustes de parámetros que transforman al asistente en un interlocutor sarcástico, oscuro, irreverente y directo, con un tono cercano al de un amigo con humor negro en lugar del típico asistente corporativo.

El proyecto no modifica los pesos del modelo subyacente: se limita a definir un prompt de sistema, una temperatura de 0.9 y una ventana de contexto de 8192 tokens. La relevancia de esta ficha radica en que ilustra cómo personalizar modelos abiertos sin reentrenamiento, aprovechando la capacidad de Gemma 3 4B para ejecutarse en hardware de escritorio y servidores pequeños. El modelo base, desarrollado por Google, es multimodal, soporta más de 140 idiomas y admite hasta 128K tokens de contexto en su configuración original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Gemma 3 4B de Google) |
| Parametros totales | 4 mil millones (base Gemma 3 4B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 8192 tokens (configurado en el Modelfile); la base soporta hasta 128K |
| Tipos de cuantizacion | No especificado (depende de la descarga de Ollama) |
| Idiomas soportados | 140+ (heredado de Gemma 3) |
| Licencia | No disponible en el repositorio; la base Gemma 3 usa los Gemma Terms of Use de Google |
| Formato de pesos | Modelfile de Ollama (no incluye pesos propios) |

## Arquitectura y entrenamiento

Este repositorio no introduce ninguna innovación arquitectónica ni realiza entrenamiento. Se trata de un Modelfile de Ollama que define un prompt de sistema con una personalidad concreta (divertida, sarcástica, con humor negro, irreverente, directa y con lenguaje profano) y ajusta la temperatura a 0.9 para favorecer respuestas más creativas y menos predecibles. El contexto se fija en 8192 tokens, por debajo del máximo de 128K que soporta la arquitectura base.

El modelo subyacente, Gemma 3 4B, es un transformer multimodal desarrollado por Google DeepMind que incorpora capacidades de visión, soporte multilingüe amplio y una arquitectura optimizada para reducir el uso de memoria de la KV-cache en contextos largos. Está diseñado para ejecutarse en una sola GPU o TPU, incluyendo estaciones de trabajo, portátiles e incluso smartphones.

## Capacidades

- Conversación con personalidad oscura, sarcástica e irreverente, configurada mediante prompt de sistema.
- Generación de texto con tono conversacional y directo, alejado del estilo corporativo.
- Hereda las capacidades multimodales de Gemma 3 4B: comprensión de imágenes y texto.
- Soporte multilingüe para más de 140 idiomas (capacidad de la base).
- Razonamiento y generación de código propios de Gemma 3 4B, aunque la configuración de personalidad puede afectar al estilo de las respuestas.
- No incluye tool calling ni function calling específicos en esta configuración; dependerá de lo que ofrezca la base y del runtime de Ollama.

## Casos de uso

- Chat de entretenimiento y humor: el modelo puede mantener conversaciones con un tono sarcástico y oscuro, ideal para aplicaciones de ocio, juegos de rol o bots de Discord con personalidad marcada.
- Asistente personal con estilo desenfadado: para usuarios que prefieren respuestas directas y con humor en lugar del tono formal de los asistentes tradicionales, por ejemplo en un terminal o widget de escritorio.
- Generación de contenido satírico: redacción de textos con ironía y humor negro para blogs, guiones o redes sociales, aprovechando la temperatura alta (0.9) para respuestas más creativas.
- Prototipado de personalidades de IA: sirve como ejemplo didáctico de cómo configurar un Modelfile de Ollama para alterar el comportamiento de un modelo sin reentrenar, útil para desarrolladores que exploran técnicas de prompting.
- Evaluación de robustez conversacional: probar cómo responde Gemma 3 4B a instrucciones de sistema extremas o provocadoras, útil para investigar límites de seguridad y alineación.
- Demostraciones en entornos educativos: mostrar en talleres o cursos cómo un mismo modelo base puede adoptar personalidades distintas mediante configuración, sin modificar pesos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible para esta configuración concreta. El modelo base Gemma 3 4B tiene resultados documentados en el informe técnico de Gemma 3 (arXiv:2503.19786), pero no se incluyen cifras específicas en el material proporcionado. No se inventan datos.

## Requisitos de hardware

- Gemma 3 4B está diseñado para ejecutarse en una sola GPU o TPU, incluyendo hardware de escritorio y portátiles.
- VRAM estimada: con cuantización de 4 bits (típica en Ollama), cabe en GPUs con 6-8 GB de VRAM; en precisión completa (FP16) requiere aproximadamente 8-10 GB.
- GPUs compatibles: RTX 3060, RTX 4060, RTX 4090, A100, H100, entre otras. También puede ejecutarse en CPU con rendimiento reducido.
- Despliegue: el formato Modelfile indica que el uso previsto es mediante Ollama, que gestiona la descarga, cuantización y ejecución local.
- Alternativas de despliegue: vLLM, llama.cpp o TGI pueden servir el modelo base Gemma 3 4B, pero la configuración de personalidad está pensada para Ollama.
- Latencia y throughput: no disponibles en la información proporcionada; dependerán del hardware y la cuantización elegida.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Personalidad configurable |
|---|---|---|---|---|---|
| Gemma 3 4B (base) | 4B | 128K | Si | Gemma Terms of Use | No (asistente estándar) |
| gemma3-dark (este repo) | 4B (base) | 8192 (config) | Si (heredado) | No disponible en repo | Si (oscura/sarcástica) |
| Llama 3.2 3B | 3B | 128K | No | Llama 3.2 Community License | No (requiere configuración propia) |
| Phi-3.5 mini | 3.8B | 128K | No | MIT | No (requiere configuración propia) |

La comparativa se centra en modelos de tamaño similar que pueden ejecutarse en hardware de consumo. La diferencia clave de `gemma3-dark` es que ya incluye una personalidad definida, mientras que las alternativas requieren que el desarrollador construya su propio prompt de sistema.

## Limitaciones y advertencias

- No es un modelo independiente: depende completamente de Gemma 3 4B y de Ollama para funcionar; sin ellos, el Modelfile no tiene utilidad.
- La personalidad configurada incluye lenguaje profano y humor potencialmente ofensivo, lo que puede generar contenido inapropiado en entornos profesionales o públicos.
- El contexto se limita a 8192 tokens en esta configuración, muy por debajo de los 128K que soporta la base; conversaciones largas o documentos extensos pueden truncarse.
- La licencia del repositorio no está especificada, y la base Gemma 3 está sujeta a los Gemma Terms of Use de Google, que imponen restricciones de uso aceptable y atribución.
- Riesgo de alucinación y sesgos heredados del modelo base Gemma 3 4B; la temperatura alta (0.9) puede aumentar la creatividad pero también la probabilidad de respuestas inexactas.
- No se han publicado evaluaciones de seguridad ni pruebas de robustez para esta configuración concreta; su uso en producción requiere validación adicional.
- El repositorio tiene 0 descargas y 0 likes, lo que indica que no ha sido probado por la comunidad.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/shantanudixit/gemma3-dark
- Página oficial de Gemma 3 (Google DeepMind): https://deepmind.google/models/gemma/gemma-3/
- Informe técnico de Gemma 3 (arXiv): https://arxiv.org/html/2503.19786v1
- Sitio de Gemma 3 AI: https://gemma3.ai/
- Repositorio de Gemma 3 en GitHub: https://github.com/gemma-3/gemma-3
- Informe técnico en PDF: https://storage.googleapis.com/deepmind-media/gemma/Gemma3Report.pdf
