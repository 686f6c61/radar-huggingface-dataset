# OpenDCAI/Omni-Edu-4B-GGUF

## Resumen

Omni-Edu-4B-GGUF es la distribución en formato GGUF del modelo Omni-Edu-4B, un modelo multimodal de tipo image-text-to-text desarrollado por OpenDCAI y orientado al ámbito educativo. El modelo original procede de lhpku20010120/Omni-Edu-4B, y esta versión ha sido convertida y cuantizada con llama.cpp para permitir su ejecución en hardware de consumo mediante llama-server, Ollama o cualquier runtime compatible con GGUF.

El modelo cuenta con 4.205.751.296 parámetros (aproximadamente 4,2 mil millones) y está etiquetado internamente como qwen3_5, lo que sugiere una arquitectura derivada de la familia Qwen 3.5. Su principal valor es democratizar el acceso a un modelo educativo multimodal en equipos sin GPU de datacenter: la cuantización Q4_K_M ocupa solo 2,52 GiB, lo que lo hace viable en portátiles y estaciones de trabajo modestas.

La relevancia actual radica en la combinación de tres factores: multimodalidad (procesa imágenes junto con texto), especialización educativa y despliegue local eficiente gracias a GGUF. No obstante, la información pública disponible es muy limitada: la model card del repositorio GGUF es mínima y no se han publicado benchmarks, idiomas soportados ni detalles del dataset de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), familia qwen3_5 segun tags del autor |
| Parametros totales | 4.205.751.296 (~4,2 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible de forma oficial; el ejemplo de la model card usa `-c 8192` |
| Tipos de cuantizacion | BF16 (7,85 GiB), Q8_0 (4,17 GiB), Q6_K (3,23 GiB), Q4_K_M (2,52 GiB) |
| Idiomas soportados | no disponible |
| Licencia | other (se aplican los terminos del modelo original; consultar la model card upstream) |
| Formato de pesos | GGUF (llama.cpp); proyector multimodal separado `mmproj-OmniEdu-4B-F16.gguf` |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de las etiquetas del repositorio, que apuntan a una base qwen3_5 y a un pipeline image-text-to-text. Esto implica un transformer con un codificador visual acoplado a un decodificador de lenguaje, con un proyector multimodal distribuido como archivo `mmproj` independiente en el ecosistema GGUF. El tamaño de 4,2 B parámetros encaja con la categoría de modelos pequeños-multimodales optimizados para despliegue en el borde.

No se han publicado datos sobre el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO ni innovaciones técnicas específicas (decodificación especulativa, atención lineal, etc.). La model card únicamente indica que la conversión y cuantización se realizaron con llama.cpp y que se aplican los términos de licencia y uso del modelo original. Cualquier afirmación sobre el proceso de entrenamiento sería especulativa y no debe asumirse.

## Capacidades

- Generación de texto conversacional multi-turno (tag `conversational`).
- Procesamiento de imágenes junto con texto (pipeline image-text-to-text): el modelo puede recibir una imagen y una consulta textual y generar una respuesta.
- Orientación educativa: el nombre y los tags (`omniedu`, `education`) indican un ajuste específico para tareas de aprendizaje, explicación y tutoría.
- Compatibilidad con endpoints estilo OpenAI: la model card menciona conexión desde Cherry Studio a `http://127.0.0.1:8080/v1`, lo que permite integración con clientes compatibles.
- Modo de razonamiento controlable: el flag `--reasoning off` en llama-server sugiere la existencia de un modo de razonamiento que puede activarse o desactivarse.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y multi-step reasoning: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; no se especifican idiomas.

## Casos de uso

- Tutoría educativa local: el modelo puede desplegarse en un portátil con llama-server y ofrecer explicaciones paso a paso de conceptos, gracias a su ajuste educativo y a su reducido tamaño en Q4_K_M (2,52 GiB).
- Resolución de problemas a partir de imágenes: un estudiante puede fotografiar un ejercicio de matemáticas o un diagrama y el modelo, al recibir la imagen junto con la pregunta, puede generar una explicación. El proyector `mmproj` habilita esta entrada visual.
- Asistente de estudio offline en entornos sin conectividad: al ejecutarse con llama.cpp de forma local, es adecuado para aulas o regiones con acceso limitado a internet, sin depender de APIs externas.
- Generación de material didáctico: el modelo puede redactar resúmenes, preguntas de repaso o explicaciones alternativas de un mismo concepto, aprovechando su naturaleza conversacional multi-turno.
- Integración en aplicaciones de escritorio con interfaz compatible con OpenAI: herramientas como Cherry Studio pueden conectarse al endpoint local `/v1`, lo que facilita prototipado rápido de asistentes educativos.
- Evaluación de imágenes en contextos de formación técnica: por ejemplo, interpretar capturas de pantalla, gráficos o esquemas y describirlos o comentarlos, siempre que la calidad del reconocimiento visual sea suficiente (no verificada en la información disponible).
- Prototipado de pipelines multimodales en investigación: al ser GGUF y ligero, sirve como banco de pruebas para experimentar con cuantizaciones y comparar calidad frente a BF16 sin necesidad de GPU de datacenter.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin overhead de contexto):
  - BF16: ~7,85 GiB.
  - Q8_0: ~4,17 GiB.
  - Q6_K: ~3,23 GiB.
  - Q4_K_M: ~2,52 GiB.
  - Hay que sumar el proyector multimodal `mmproj-OmniEdu-4B-F16.gguf` y la memoria del contexto (KV cache), que crece con `-c`.
- GPU recomendadas: no disponibles de forma oficial. Por tamaño, una GPU consumer con 8-12 GB de VRAM (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070) debería alojar las cuantizaciones Q4_K_M a Q8_0 con contexto moderado; para BF16 se recomienda 12-16 GB o más.
- Cabe en GPU consumer: sí, al menos en cuantizaciones Q4_K_M, Q6_K y Q8_0. La ejecución en CPU es viable con llama.cpp, especialmente en Q4_K_M.
- Opciones de despliegue: llama.cpp (`llama-server`, `llama-cli`), cualquier frontend compatible con GGUF (p. ej. Ollama si se importa el GGUF) y clientes con API compatible con OpenAI (Cherry Studio en el ejemplo del autor).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Formato |
|---|---|---|---|---|---|
| Omni-Edu-4B-GGUF | ~4,2 B | no disponible (ejemplo con 8192) | Si (image-text-to-text) | other | GGUF |
| Qwen2.5-VL-3B | ~3 B | no disponible en esta ficha | Si | no disponible en esta ficha | safetensors, GGUF (comunitario) |
| Phi-3.5-vision | ~4,2 B | no disponible en esta ficha | Si | no disponible en esta ficha | safetensors |
| Llama-3.2-3B | ~3 B | no disponible en esta ficha | No (solo texto) | no disponible en esta ficha | safetensors, GGUF |

Nota: los datos de los modelos comparables no forman parte de la información proporcionada y deben verificarse en sus respectivas model cards antes de usarse en una decisión técnica. La comparativa se limita a la categoría (modelos multimodales pequeños de ~3-4 B parámetros) y no incluye rendimiento medido.

## Limitaciones y advertencias

- Información pública muy escasa: la model card del GGUF no documenta dataset, idiomas, benchmarks ni limitaciones; la evaluación rigurosa requiere consultar el modelo base.
- Licencia "other": no es una licencia estándar (Apache-2.0, MIT, etc.). Es imprescindible revisar los términos del modelo original (lhpku20010120/Omni-Edu-4B) antes de cualquier uso comercial.
- Riesgo de alucinación: inherente a los modelos generativos de este tamaño; en contextos educativos, donde la precisión factual es crítica, se recomienda verificación humana.
- Sesgos conocidos: no documentados en la información disponible.
- Limitaciones de contexto e idioma: se desconoce la longitud de contexto oficial y los idiomas soportados; el ejemplo de la model card usa 8192 tokens, pero no debe asumirse como máximo.
- Calidad multimodal no verificada: no hay benchmarks que confirmen la fiabilidad del reconocimiento de imágenes en tareas educativas.
- Dependencia del proyector `mmproj`: para entrada de imagen es obligatorio descargar el archivo adicional; sin él, el modelo solo procesa texto.
- Madurez del repositorio: 296 descargas y 0 likes en el momento de la consulta; no hay evidencia de validación comunitaria amplia.

## Enlaces

- Repositorio GGUF: https://huggingface.co/OpenDCAI/Omni-Edu-4B-GGUF
- Modelo base original: https://huggingface.co/lhpku20010120/Omni-Edu-4B
- Repositorio de OpenDCAI (modelo no cuantizado): https://huggingface.co/OpenDCAI/Omni-Edu-4B
- llama.cpp: https://github.com/ggml-org/llama.cpp
