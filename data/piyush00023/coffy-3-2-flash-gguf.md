# Piyush00023/coffy-3.2-flash-GGUF

## Resumen

coffy-3.2-flash es un asistente de instrucciones de 8.230 millones de parámetros construido sobre la arquitectura de Qwen3-8B. Lo desarrolla Piyush00023 y se distribuye con pesos abiertos bajo licencia Apache-2.0. El repositorio que nos ocupa, `coffy-3.2-flash-GGUF`, contiene únicamente conversiones cuantizadas del modelo principal en formato GGUF, generadas con llama.cpp a partir de los pesos oficiales en safetensors, lo que permite ejecutarlo en llama.cpp, Ollama, LM Studio o cualquier runtime compatible con GGUF.

El modelo está orientado a generación de texto e instrucciones en inglés y código, y su relevancia actual radica en que ofrece una vía de despliegue local de bajo coste: el build Q4_K_M ocupa 5,03 GB, lo que lo sitúa al alcance de GPUs de consumo con 8 GB de VRAM. No obstante, la información publicada es muy limitada: no se documentan datos de entrenamiento, número de tokens, proceso de alineación ni resultados de benchmarks, y el propio autor advierte de un artefacto en los datos de entrenamiento que provoca que el modelo se autoidentifique ocasionalmente con una versión anterior ("coffy-2.4-flash").

Se trata, por tanto, de un modelo pequeño y práctico para prototipado y experimentación local, pero con escasa documentación técnica y sin validación pública de rendimiento, lo que desaconseja su uso en producción sin una evaluación propia previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basada en Qwen3-8B) |
| Parametros totales | 8,23 mil millones (8.23B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (5,03 GB), Q8_0 (8,71 GB), F16 (16,39 GB) |
| Idiomas soportados | en, code |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (modelo base en safetensors) |

## Arquitectura y entrenamiento

El modelo principal, `coffy-3.2-flash`, es un transformer decoder-only de 8,23 mil millones de parámetros que reutiliza la arquitectura de Qwen3-8B, según indica el autor en la model card. Se presenta como un asistente ajustado a instrucciones (instruction-tuned). El repositorio GGUF no contiene información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de alineación como RLHF, DPO o ajuste supervisado.

La única innovación documentada en esta ficha es el proceso de conversión y cuantización con llama.cpp, que produce tres builds (Q4_K_M, Q8_0 y F16). El autor indica que el build Q4_K_M ha pasado una prueba de humo ("smoke-tested") verificando coherencia en identidad, código y matemáticas contra el modelo principal. No se documentan innovaciones arquitectónicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto e instrucciones en inglés.
- Generación de código, dado que el modelo declara el idioma `code` entre sus etiquetas.
- Razonamiento básico y respuesta a preguntas, según la prueba de humo del autor (identidad, código y matemáticas).
- Ejecución local en runtimes compatibles con GGUF: llama.cpp, Ollama, LM Studio.
- Soporte de tool calling / function calling: no disponible en la información publicada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información publicada.
- Capacidades multimodales (visión, audio): no disponibles.
- Modo de razonamiento explícito (thinking mode): no disponible en la información publicada.

## Casos de uso

- Prototipado local de asistentes conversacionales: el build Q4_K_M (5,03 GB) permite levantar un chatbot de instrucciones en un portátil con GPU de 8 GB mediante Ollama o llama.cpp, sin depender de servicios en la nube.
- Generación de código en entornos con requisitos de privacidad: al ejecutarse íntegramente en local, el modelo puede autocompletar y explicar fragmentos de código sin que el código fuente salga de la máquina, algo relevante para equipos con políticas estrictas de confidencialidad.
- Experimentación académica con cuantización: los tres builds (Q4_K_M, Q8_0, F16) permiten comparar la degradación de calidad entre niveles de cuantización sobre el mismo modelo base, útil para estudiar el impacto del 4-bit frente al 8-bit y al 16-bit.
- Evaluación de modelos pequeños para despliegue en el borde: con 8,23B parámetros y un build de 5 GB, es candidato para probar inferencia en estaciones de trabajo modestas o en dispositivos con GPU integrada antes de comprometerse con modelos mayores.
- Integración en pipelines de CI/CD para tareas auxiliares: dado su tamaño reducido, puede usarse para generar descripciones de commits, resúmenes de diffs o borradores de documentación en jobs automatizados donde un modelo grande resultaría demasiado costoso.
- Base para ajuste fino ligero: al estar bajo Apache-2.0 y derivar de Qwen3-8B, sirve como punto de partida para experimentos de fine-tuning con LoRA sobre dominios concretos, con la ventaja de que los pesos cuantizados permiten iterar rápidamente en hardware de consumo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 5,5-6 GB para Q4_K_M (pesos de 5,03 GB más overhead de contexto y KV cache), en torno a 9,5-10 GB para Q8_0 y unos 17-18 GB para F16.
- GPU recomendadas: RTX 4090, RTX 3090, A100 o H100 para F16; RTX 4070/4080, RTX 3060 de 12 GB o RTX 4060 Ti de 16 GB para Q8_0; RTX 3060 de 8 GB, RTX 4060 o superiores para Q4_K_M.
- Cabe en GPU de consumo: sí, el build Q4_K_M cabe en GPUs de 8 GB de VRAM; el Q8_0 requiere al menos 12 GB y el F16 al menos 20 GB.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`), Ollama, LM Studio, llama-cpp-python y cualquier runtime compatible con GGUF.
- Latencia y throughput estimados: no disponibles en la información publicada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| coffy-3.2-flash (GGUF) | 8,23B | no disponible | Apache-2.0 | GGUF | Sin benchmarks publicados; autoidentificación errónea documentada |
| Qwen3-8B | 8,2B | no disponible en esta ficha | Apache-2.0 | safetensors, GGUF | Modelo base arquitectónico; documentación y benchmarks públicos |
| Llama 3.1 8B | 8B | 128K | Llama 3.1 Community License | safetensors, GGUF | Amplia adopción y ecosistema de herramientas |
| Mistral 7B Instruct | 7,3B | 32K | Apache-2.0 | safetensors, GGUF | Referencia consolidada en el segmento 7-8B |

La comparación con Qwen3-8B es la más directa, ya que coffy-3.2-flash deriva de esa arquitectura; sin embargo, no se dispone de datos que permitan cuantificar la diferencia de rendimiento entre ambos. Frente a Llama 3.1 8B y Mistral 7B, coffy-3.2-flash ofrece una licencia permisiva (Apache-2.0), pero carece de la documentación, los benchmarks y el soporte de comunidad de los modelos de referencia.

## Limitaciones y advertencias

- Documentación técnica muy escasa: no se publican datos de entrenamiento, contexto, alineación ni benchmarks, lo que impide evaluar su calidad de forma objetiva.
- Artefacto de autoidentificación: el modelo puede identificarse como "coffy-2.4-flash" en lugar de "coffy-3.2-flash", según advierte el propio autor; es un defecto visible en producción.
- Riesgo de alucinación: no cuantificado ni evaluado en la información disponible; en modelos de este tamaño sin benchmarks públicos debe asumirse un riesgo significativo.
- Cobertura lingüística limitada: solo se declaran inglés y código; no hay soporte documentado de castellano ni de otros idiomas.
- Longitud de contexto desconocida: no se especifica la ventana de contexto, lo que dificulta planificar casos de uso con documentos largos.
- Licencia: Apache-2.0 permite uso comercial, pero el autor matiza que se trata de "open weights, not open source"; conviene revisar el fichero LICENSE del repositorio antes de un despliegue comercial.
- Madurez: el repositorio tiene cero descargas y cero likes en el momento de la ficha, y solo se ha validado con una prueba de humo; no hay evidencia de uso en producción.
- Sesgos: no documentados en la información disponible.

## Enlaces

- Repositorio GGUF: https://huggingface.co/Piyush00023/coffy-3.2-flash-GGUF
- Modelo base: https://huggingface.co/Piyush00023/coffy-3.2-flash
- Licencia (referencia en el repositorio): https://huggingface.co/Piyush00023/coffy-3.2-flash-GGUF/blob/main/LICENSE
- Quickstart del modelo base: https://huggingface.co/Piyush00023/coffy-3.2-flash#quickstart
- Contacto del autor: piyushdas000@gmail.com
