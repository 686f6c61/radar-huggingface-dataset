# oscarwest1/NVIDIA-Nemotron-3.5-Bolt-E4B-Q6_K-GGUF

## Resumen

NVIDIA Nemotron 3.5 Bolt E4B es un modelo de generación de texto desarrollado por NVIDIA, distribuido originalmente en precisión BF16 bajo el identificador `nvidia/NVIDIA-Nemotron-3.5-Bolt-E4B-BF16`. La ficha que nos ocupa no es el modelo original, sino una cuantización comunitaria en formato GGUF con cuantización Q6_K (6 bits), producida por el usuario oscarwest1 y publicada en Hugging Face. El proceso consistió en descargar los pesos BF16 originales, convertirlos a GGUF mediante llama.cpp y cuantizarlos posteriormente con `llama-quantize`, sin ningún entrenamiento ni ajuste adicional.

La arquitectura se describe en la model card como "Gemma 4-based Nemotron", lo que indica que el modelo parte de la familia Gemma 4 y recibe un tratamiento específico de NVIDIA bajo la marca Nemotron Bolt. El sufijo "E4B" sugiere una variante de eficiencia dentro de esa familia, aunque el número exacto de parámetros no se detalla en la información disponible. La licencia es la NVIDIA Open Model Development and Weight License 1.1 (openmdw-1.1), que permite uso comercial con condiciones específicas.

La relevancia de esta publicación es práctica: ofrece una vía de despliegue local del modelo en hardware de consumo mediante llama.cpp y Ollama, gracias al formato GGUF y a la cuantización Q6_K, que reduce el peso en disco y la VRAM necesaria frente al BF16 original con una pérdida de precisión moderada. No obstante, el autor advierte explícitamente de que este artefacto no ha sido validado de forma independiente ni comparado con el checkpoint BF16 original en cuanto a paridad de comportamiento.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Basada en Gemma 4 (Nemotron Bolt) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q6_K (6 bits); el modelo base está en BF16 |
| Idiomas soportados | no disponible |
| Licencia | openmdw-1.1 (NVIDIA Open Model Development and Weight License 1.1) |
| Formato de pesos | GGUF (cuantización Q6_K); original en BF16 |
| Modelo base | nvidia/NVIDIA-Nemotron-3.5-Bolt-E4B-BF16 |
| Pipeline | text-generation |
| Librería | gguf (llama.cpp) |

## Arquitectura y entrenamiento

La model card indica que la arquitectura es "Gemma 4-based Nemotron", es decir, una variante construida sobre la familia Gemma 4 con adaptaciones de NVIDIA bajo la línea Nemotron Bolt. No se proporcionan detalles sobre el número de capas, dimensión de los embeddings, mecanismo de atención, ni sobre si emplea técnicas como atención lineal, decodificación especulativa o mezcla de expertos. Tampoco se especifica el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO.

Respecto al proceso de esta publicación concreta, la model card es clara: se descargaron los pesos BF16 originales desde Hugging Face, se convirtieron a GGUF con llama.cpp y se cuantizaron a Q6_K con `llama-quantize`. No se realizó entrenamiento ni fine-tuning adicional. Se trata, por tanto, de una conversión de formato y una reducción de precisión numérica, no de un modelo nuevo. El autor subraya que es una release comunitaria independiente y no una cuantización oficial de NVIDIA.

## Capacidades

- Generación de texto: el pipeline declarado es `text-generation`, por lo que la capacidad principal es la generación de texto autorregresiva.
- Razonamiento y conversación: al derivar de un modelo de la familia Nemotron Bolt, se espera capacidad de razonamiento general, aunque no hay documentación específica en la información disponible que lo confirme con benchmarks.
- Compatibilidad con llama.cpp y Ollama: el formato GGUF permite su uso con `llama-cli` y `ollama run`, según los comandos incluidos en la model card.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; los idiomas no están declarados en los metadatos.
- Capacidades especiales (thinking mode, visión, audio): no disponible en la información proporcionada.

## Casos de uso

- Despliegue local en estaciones de trabajo: gracias al formato GGUF y a la cuantización Q6_K, el modelo puede ejecutarse con llama.cpp en equipos sin GPU de datacenter, lo que facilita pruebas de concepto y desarrollo offline sin depender de APIs externas.
- Prototipado con Ollama: el comando `ollama run hf.co/oscarwest1/NVIDIA-Nemotron-3.5-Bolt-E4B-Q6_K-GGUF:Q6_K` permite levantar el modelo en minutos para experimentar con prompts y evaluar su comportamiento antes de comprometerse con el BF16 original.
- Evaluación comparativa de cuantizaciones: útil para investigadores que quieran medir la degradación de calidad de Q6_K frente a BF16 en tareas concretas de su dominio, dado que el autor no ha publicado dicha comparación.
- Generación de texto en pipelines de CI: al ser un artefacto GGUF autocontenido, puede integrarse en flujos de prueba que necesiten un generador de texto reproducible y ligero.
- Fine-tuning posterior sobre la cuantización: aunque no es lo habitual, algunas herramientas permiten adaptar modelos GGUF; sirve como base para experimentos de adaptación de bajo rango sobre el modelo ya cuantizado.
- Educación y divulgación: adecuado para demostraciones docentes sobre cuantización, formatos GGUF y el ecosistema llama.cpp, ya que el proceso de conversión está documentado de forma explícita en la model card.
- Inferencia en entornos con VRAM limitada: Q6_K reduce el espacio necesario frente a BF16, lo que permite ejecutar el modelo en GPUs de consumo que no podrían alojar los pesos originales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que este artefacto "has not yet been independently benchmarked or validated for feature parity with the original BF16 checkpoint".

## Requisitos de hardware

- VRAM estimada: no disponible con precisión, ya que el número de parámetros no se especifica. Como referencia, una cuantización Q6_K ocupa aproximadamente 6,56 bits por peso más overhead, por lo que un modelo de N parámetros requeriría del orden de N × 0,82 bytes solo para los pesos.
- GPU recomendadas: no disponible. Al no conocerse el tamaño, no puede determinarse si cabe en una RTX 4090, A100 u H100.
- Compatibilidad con GPU de consumo: probable en función del tamaño real del modelo, pero no confirmable con los datos disponibles.
- Opciones de despliegue: llama.cpp (`llama-cli -hf oscarwest1/NVIDIA-Nemotron-3.5-Bolt-E4B-Q6_K-GGUF:Q6_K`) y Ollama (`ollama run hf.co/oscarwest1/NVIDIA-Nemotron-3.5-Bolt-E4B-Q6_K-GGUF:Q6_K`). La model card advierte que la compatibilidad depende del soporte de la arquitectura en la versión del runtime.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| NVIDIA Nemotron 3.5 Bolt E4B Q6_K (esta ficha) | no disponible | no disponible | GGUF Q6_K | openmdw-1.1 | Hugging Face (oscarwest1) |
| NVIDIA Nemotron 3.5 Bolt E4B BF16 (original) | no disponible | no disponible | BF16 | openmdw-1.1 | Hugging Face (nvidia) |
| Otras cuantizaciones comunitarias del mismo base | no disponible | no disponible | GGUF (varias) | openmdw-1.1 | no disponible en la información |

No se dispone de información suficiente para comparar con modelos de otras familias (por ejemplo, Llama, Qwen o Mistral) en parámetros, contexto o rendimiento, ya que los datos del modelo base no están incluidos en la documentación proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información disponible; al no haber model card detallada del base, no pueden enumerarse.
- Riesgo de alucinación: inherente a los modelos de generación de texto; no cuantificado para este artefacto.
- Limitaciones de contexto e idioma: la longitud de contexto y los idiomas soportados no están declarados, lo que impide garantizar su comportamiento en contextos largos o en castellano.
- Restricciones de licencia: la licencia openmdw-1.1 es la NVIDIA Open Model Development and Weight License 1.1; debe revisarse el texto completo antes de uso comercial, ya que puede incluir condiciones de atribución o restricciones específicas.
- Falta de validación: el autor advierte que la cuantización puede afectar a la precisión numérica y a la calidad, y que este artefacto no ha sido validado de forma independiente ni comparado con el BF16 original.
- Compatibilidad de runtime: el uso requiere versiones de llama.cpp u Ollama que soporten la arquitectura del modelo; versiones antiguas pueden fallar al cargarlo.
- Soporte del autor: es una release comunitaria con 0 descargas y 0 likes en el momento de la consulta; no hay garantía de mantenimiento ni de soporte.
- Ausencia de datos técnicos: sin número de parámetros, contexto o idiomas, es arriesgado desplegarlo en producción sin una evaluación previa propia.

## Enlaces

- Hugging Face (esta cuantización): https://huggingface.co/oscarwest1/NVIDIA-Nemotron-3.5-Bolt-E4B-Q6_K-GGUF
- Modelo base en Hugging Face: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Bolt-E4B-BF16
- Repositorio de llama.cpp: https://github.com/ggerganov/llama.cpp
- Ollama: https://ollama.com
- Licencia NVIDIA Open Model Development and Weight License 1.1: no disponible como enlace directo en la información proporcionada.
