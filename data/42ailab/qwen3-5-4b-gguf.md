# 42ailab/Qwen3.5-4B-GGUF

## Resumen

Qwen3.5-4B es el escalón de 4B parámetros de la serie Qwen3.5, desarrollada por el equipo Qwen de Alibaba y publicada bajo licencia Apache-2.0. El repositorio analizado, `42ailab/Qwen3.5-4B-GGUF`, no es el modelo original: es una redistribución en formato GGUF preparada por 42ailab para su aplicación de escritorio 42model, con pesos convertidos por unsloth y fijados por digest sha256 para garantizar reproducibilidad. El modelo combina generación de texto con capacidad de lectura de imágenes (pipeline `image-text-to-text`), lo que lo sitúa como un modelo multimodal ligero.

Con 4.205.751.296 parámetros totales y un peso cuantizado Q4_K_M de 2,55 GiB más un proyector visual F16 de 641 MiB, está diseñado para ejecutarse en un ordenador personal sin GPU de gama alta. Su relevancia actual reside en ofrecer escritura fluida en chino, conversación cotidiana y comprensión de imágenes en un paquete que cabe en memoria de consumo, algo poco habitual en la franja de 4B multimodales.

La ficha se centra en lo que declara la información disponible: la model card es breve y no detalla arquitectura interna, composición del dataset ni resultados de benchmarks, por lo que esos apartados se marcan como no disponibles cuando corresponde.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo multimodal texto+imagen de la serie Qwen3.5) |
| Parametros totales | 4.205.751.296 |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (pesos) y F16 (proyector visual); el repo solo distribuye Q4_K_M |
| Idiomas soportados | no disponible (la model card destaca escritura fluida en chino) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (Qwen3.5-4B-Q4_K_M.gguf + mmproj-F16.gguf) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna en la documentación proporcionada. La model card identifica el modelo como parte de la serie Qwen3.5 del equipo Qwen de Alibaba y lo etiqueta con `image-text-to-text`, lo que confirma que se trata de un modelo multimodal que procesa texto e imágenes. El repositorio incluye un proyector visual separado (`mmproj-F16.gguf`) en precisión F16, lo que es coherente con una arquitectura de tipo LLM más adaptador de visión, habitual en los modelos multimodales de la familia Qwen.

Tampoco se especifican el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO. La conversión a GGUF fue realizada por unsloth y los ficheros de este repositorio son idénticos byte a byte a los de `unsloth/Qwen3.5-4B-GGUF`, verificables mediante los digests sha256 publicados. No se documenta ninguna innovación técnica adicional (decodificación especulativa, atención lineal, etc.) en la información disponible.

## Capacidades

- Generación de texto conversacional en chino fluido y conversación cotidiana, según declara la model card.
- Comprensión de imágenes (pipeline `image-text-to-text`), gracias al proyector visual incluido.
- Ejecución ligera en ordenador personal, orientada a un uso de escritorio.
- Compatibilidad con endpoints (`endpoints_compatible` en los tags del repositorio).
- Uso conversacional (`conversational` en los tags).
- Soporte de tool calling / function calling: no disponible en la información.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información.
- Modo thinking, audio u otras capacidades especiales: no disponible en la información.

## Casos de uso

- Asistente conversacional de escritorio: el modelo está empaquetado para la aplicación 42model y se descarga con un solo clic o mediante `42model download qwen3.5:4b-q4_k_m`, lo que lo hace adecuado para un chatbot local en un PC personal sin depender de la nube.
- Descripción y análisis de imágenes en local: al incluir el proyector visual F16, puede procesar capturas, fotos o diagramas y generar texto descriptivo sin enviar datos a un servidor externo.
- Escritura y redacción en chino: la model card destaca la escritura fluida en chino, por lo que encaja en tareas de generación de borradores, corrección o resumen de textos en ese idioma.
- Prototipado rápido de aplicaciones multimodales: su tamaño de 4B y su formato GGUF permiten integrarlo en pruebas de concepto con llama.cpp u otros runners GGUF antes de escalar a modelos mayores.
- Despliegue en entornos con recursos limitados: con 2,55 GiB de pesos en Q4_K_M, es viable en equipos sin GPU dedicada o con GPU de gama baja, útil para demos en ferias, aulas o portátiles.
- Integración en pipelines de inferencia compatibles con endpoints: el tag `endpoints_compatible` sugiere su uso tras una API compatible con OpenAI, útil para sustituir un servicio en la nube por inferencia local en tareas de bajo volumen.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,55 GiB para los pesos Q4_K_M, más 641 MiB del proyector visual F16 si se usa la modalidad de imagen; en total, en torno a 3,2 GiB solo de ficheros, a lo que hay que sumar el espacio de contexto y el overhead del runtime.
- GPU recomendadas: no se especifican en la información. Por tamaño, cualquier GPU con 6-8 GB de VRAM o más debería poder alojarlo con holgura; no hay datos oficiales de compatibilidad.
- Cabe en GPU de consumo: sí, previsiblemente en tarjetas con 6 GB o más de VRAM; también es viable en CPU mediante GGUF.
- Opciones de despliegue: formato GGUF, por lo que es compatible con llama.cpp y runners basados en GGUF; la model card menciona la aplicación 42model y el comando `42model download qwen3.5:4b-q4_k_m`. No se confirman vLLM, TGI ni Ollama en la información.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento ni de especificaciones detalladas de alternativas en la información proporcionada, por lo que no es posible establecer una comparativa rigurosa con números. A modo de referencia estructural, se puede comparar con el propio modelo upstream y con la conversión de unsloth:

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| 42ailab/Qwen3.5-4B-GGUF | 4.205.751.296 | no disponible | GGUF Q4_K_M + mmproj F16 | Apache-2.0 | Redistribución idéntica a la de unsloth, fijada por sha256 |
| unsloth/Qwen3.5-4B-GGUF | 4.205.751.296 | no disponible | GGUF | Apache-2.0 | Conversión original de los pesos |
| Qwen/Qwen3.5-4B (oficial) | 4.205.751.296 | no disponible | safetensors (presumiblemente) | Apache-2.0 | Repositorio oficial en ModelScope citado en la model card |

## Limitaciones y advertencias

- La model card es muy escueta: no documenta sesgos conocidos, tasas de alucinación ni evaluación de seguridad.
- No se especifica la longitud de contexto soportada, lo que impide planificar tareas de contexto largo con garantías.
- Los idiomas soportados no están listados; la model card solo destaca el chino, por lo que el rendimiento en castellano u otros idiomas no está verificado.
- El repositorio es una redistribución de terceros (42ailab) de una conversión de terceros (unsloth); para producción conviene verificar los digests sha256 contra el repositorio original antes de desplegar.
- Solo se distribuye la cuantización Q4_K_M; no hay otras cuantizaciones en este repositorio, lo que limita el ajuste fino entre calidad y tamaño.
- La licencia Apache-2.0 permite uso comercial, pero las capacidades y posibles restricciones del modelo upstream deben confirmarse en el repositorio oficial Qwen/Qwen3.5-4B.
- Al ser un modelo de 4B, es previsible una menor robustez en razonamiento complejo y matemáticas que modelos de mayor tamaño; no hay benchmarks que lo confirmen o desmientan.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/42ailab/Qwen3.5-4B-GGUF
- Repositorio original de la conversión GGUF (unsloth): https://www.modelscope.cn/models/unsloth/Qwen3.5-4B-GGUF
- Repositorio oficial del modelo (Qwen/Qwen3.5-4B en ModelScope): https://modelscope.cn/models/Qwen/Qwen3.5-4B
- Sitio de 42ailab: https://42ailab.com
- Aplicación 42model: https://42model.com
