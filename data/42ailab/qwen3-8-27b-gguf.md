# 42ailab/Qwen3.8-27B-GGUF

## Resumen

Qwen3.8-27B es un modelo de lenguaje de la nueva generación de la familia Qwen, desarrollado por el equipo Qwen de Alibaba y publicado bajo licencia Apache-2.0. Se trata de un modelo de 27.320.697.856 parámetros (27,3 mil millones) que combina generación de texto con capacidades de visión, ya que la model card lo etiqueta como `image-text-to-text`. La arquitectura exacta no se detalla en la información disponible; el repositorio es una conversión a formato GGUF.

El repositorio analizado, `42ailab/Qwen3.8-27B-GGUF`, no es el repositorio oficial del modelo, sino una copia mantenida por 42ailab para su integración en la aplicación de escritorio 42model. Los archivos GGUF fueron convertidos originalmente por unsloth y publicados en `unsloth/Qwen3.8-27B-GGUF`; según la model card, los pesos de este repositorio son idénticos byte a byte a una versión anterior de esa conversión (UD-Q4_K_M), antes de que unsloth la reemplazara por una recuantización nueva (UD3.1) en noviembre de 2026.

La relevancia de esta ficha radica en que permite ejecutar localmente un modelo de 27B con visión en cuantización Q4_K_M (15,33 GiB de pesos más un proyector visual F16 de 884,6 MiB), lo que lo sitúa en el rango de equipos con GPU de consumo de gama alta. El modelo está orientado, según la model card, a tareas de programación y de agentes, con visión integrada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 27.320.697.856 (27,3 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | UD-Q4_K_M (pesos); proyector visual en F16 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (`Qwen3.8-27B-UD-Q4_K_M.gguf` y `mmproj-F16.gguf`) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo (tipo de transformer, uso de atención lineal, mezcla de expertos u otras innovaciones) en la documentación proporcionada. La model card únicamente describe el modelo como perteneciente a «la nueva generación de Qwen», con fortalezas en programación y tareas de agentes, y con visión integrada. El repositorio incluye un proyector visual separado (`mmproj-F16.gguf`), lo que confirma una arquitectura multimodal con codificador de visión y proyector hacia el modelo de lenguaje, pero no se detallan sus componentes.

Tampoco se especifican los datos de entrenamiento (número de tokens, composición del dataset, uso de RLHF o DPO) ni innovaciones técnicas como decodificación especulativa. La información disponible se limita a la conversión GGUF: cuantización UD-Q4_K_M realizada por unsloth y posteriormente reemplazada por una recuantización UD3.1 en el repositorio original, de la cual esta copia no forma parte.

## Capacidades

- Generación de texto conversacional, según la etiqueta `conversational` y la pipeline `text-generation`.
- Procesamiento de imagen y texto (`image-text-to-text`), con soporte de visión mediante el proyector `mmproj-F16.gguf`.
- Programación: la model card destaca que el modelo es «fuerte en coding».
- Tareas de agentes: la model card menciona explícitamente «agent tasks».
- Compatibilidad con endpoints (`endpoints_compatible`), lo que sugiere integración con APIs compatibles con OpenAI.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; no se listan idiomas.
- Modo de razonamiento (thinking mode), audio u otras capacidades especiales: no disponible.

## Casos de uso

- Asistencia a la programación en local: el modelo puede integrarse en editores o IDE mediante un servidor GGUF compatible (por ejemplo, llama.cpp u Ollama) para autocompletado, explicación y refactorización de código, aprovechando su especialización declarada en coding y sus 27,3B de parámetros.
- Agentes autónomos de desarrollo: la model card indica fortaleza en tareas de agentes, por lo que puede emplearse en bucles de razonamiento multi-paso para resolver incidencias, ejecutar herramientas y validar resultados en pipelines de CI/CD.
- Análisis de capturas de pantalla y documentación técnica: gracias al soporte de imagen-texto, puede extraer información de diagramas, interfaces o capturas y responder preguntas sobre ellos en un flujo de soporte técnico.
- Procesamiento de documentación con imágenes: digitalización y resumen de manuales que combinan texto y figuras, usando el proyector visual para interpretar los elementos gráficos.
- Despliegue de un asistente conversacional privado: al ser Apache-2.0 y ejecutable en local con cuantización Q4_K_M, permite montar un chatbot interno sin enviar datos a servicios externos.
- Evaluación y prototipado de aplicaciones multimodales: desarrolladores que necesiten probar pipelines imagen-texto pueden descargar el GGUF y el proyector desde 42model con un solo comando (`42model download qwen3.8:27b-ud-q4_k_m`).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en UD-Q4_K_M ocupan 15,33 GiB y el proyector visual F16 884,6 MiB; se necesita además memoria para el contexto KV, por lo que un uso práctico requiere aproximadamente 17-20 GiB de VRAM dependiendo de la longitud de contexto.
- GPU recomendadas: no se especifican en la información disponible. Por el tamaño de los pesos, encaja en GPU con 24 GB o más (RTX 3090, RTX 4090, A100, H100).
- GPU de consumo: cabe en tarjetas de 24 GB de VRAM; en tarjetas de 16 GB requeriría descarga parcial a RAM/CPU o cuantizaciones menores no incluidas en este repositorio.
- Opciones de despliegue: al ser GGUF, es compatible con llama.cpp y derivados como Ollama; la model card menciona integración con la aplicación 42model y compatibilidad con endpoints. No se confirma soporte de vLLM ni TGI en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Visión | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3.8-27B (este repo) | 27,3B | no disponible | Sí | Apache-2.0 | GGUF |
| unsloth/Qwen3.8-27B-GGUF | 27,3B | no disponible | Sí | Apache-2.0 | GGUF (recuantización UD3.1) |
| Qwen/Qwen3.8-27B (oficial) | 27,3B | no disponible | Sí | Apache-2.0 | no disponible |

La comparativa se limita a las variantes del mismo modelo presentes en la información. No se dispone de datos de benchmarks ni de otros modelos comparables de la misma categoría para establecer diferencias de rendimiento.

## Limitaciones y advertencias

- Este repositorio no es el oficial: es una copia mantenida por 42ailab para 42model, con los pesos fijados a los digests sha256 indicados; no recibirá las actualizaciones del repositorio de unsloth.
- Los pesos corresponden a una versión anterior (UD-Q4_K_M) que unsloth reemplazó por una recuantización UD3.1; no se garantiza que coincidan con la versión actual del repositorio original.
- No se dispone de información sobre sesgos conocidos, riesgo de alucinación ni limitaciones idiomáticas.
- La longitud de contexto no está documentada, lo que impide planificar despliegues con ventanas largas.
- Aunque la licencia es Apache-2.0 y permite uso comercial, conviene verificar el archivo `LICENSE` del repositorio y las condiciones del modelo upstream.
- El uso del proyector visual requiere cargar el archivo `mmproj-F16.gguf` junto con los pesos; sin él, el modelo funciona solo como texto.
- El rendimiento real en producción (latencia, throughput, calidad) no está documentado y deberá validarse en el entorno de despliegue concreto.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/42ailab/Qwen3.8-27B-GGUF
- Repositorio original de la conversión GGUF (unsloth): https://www.modelscope.cn/models/unsloth/Qwen3.8-27B-GGUF
- Repositorio oficial del modelo (ModelScope): https://modelscope.cn/models/42ailab/Qwen3.8-27B-GGUF
- Sitio de 42ailab: https://42ailab.com
- Aplicación 42model: https://42model.com
