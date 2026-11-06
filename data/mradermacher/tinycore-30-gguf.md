# mradermacher/tinycore-30-GGUF

## Resumen

tinycore-30 es un modelo de lenguaje de 752 millones de parámetros desarrollado por bitwikiorg, publicado bajo licencia Apache 2.0 y orientado a generación de texto conversacional en inglés. La versión aquí descrita es una recuantización a formato GGUF realizada por mradermacher, que facilita su despliegue en entornos con recursos limitados mediante llama.cpp, Ollama y otros runners compatibles con GGUF. El modelo base se distribuye con la librería transformers y está etiquetado internamente con el identificador de arquitectura `qwen3_5`, lo que sugiere una arquitectura tipo transformer derivada de la familia Qwen.

Con 752 millones de parámetros, tinycore-30 se sitúa en la franja de modelos pequeños, pensados para inferencia local, prototipado rápido y tareas de generación de texto donde el coste computacional es un factor crítico. El repositorio GGUF incluye cuantizaciones desde Q2_K hasta f16, con tamaños que van de 0,5 GB a 1,6 GB, además de dos ficheros mmproj (multi-modal supplement) que apuntan a capacidades multimodales en el modelo base, aunque la información disponible no detalla su alcance.

La relevancia actual del modelo radica en su combinación de licencia permisiva, tamaño reducido y disponibilidad en múltiples cuantizaciones, lo que lo hace adecuado para experimentación y despliegues en hardware de consumo. No obstante, la información pública es escasa: no se han publicado detalles sobre el dataset de entrenamiento, la longitud de contexto ni resultados de benchmarks.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (etiqueta interna `qwen3_5`; detalles no disponibles) |
| Parámetros totales | 752.393.024 |
| Parámetros activos | No aplica (no es MoE según la información disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K; además mmproj-f16 y mmproj-Q8_0 |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de la etiqueta `qwen3_5` presente en los tags del repositorio, que sugiere una implementación basada en transformers de la familia Qwen. El número de parámetros (752 millones) y el tamaño del repositorio GGUF (7,8 GB, incluyendo todas las cuantizaciones) son coherentes con un transformer denso de escala pequeña. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO o instrucción tuning.

La recuantización realizada por mradermacher emplea el formato GGUF con cuantizaciones estáticas (quantize_version 2, output_tensor_quantised 1, convert_type hf). El autor indica que las cuantizaciones ponderadas con imatrix no estaban disponibles en el momento de la publicación, aunque podrían solicitarse mediante discusión comunitaria. La presencia de ficheros mmproj (multi-modal supplement) en Q8_0 y f16 sugiere que el modelo base incorpora algún componente multimodal, pero no se especifica qué modalidad ni cómo se integra.

## Capacidades

- Generación de texto conversacional en inglés, según la etiqueta `conversational` del repositorio.
- Compatibilidad con text-generation-inference y transformers, lo que permite integración en pipelines estándar de Hugging Face.
- Soporte multimodal potencial: el repositorio incluye ficheros mmproj (multi-modal supplement) en Q8_0 y f16, aunque no se detalla qué modalidad cubren ni su rendimiento.
- Capacidad de ejecución en entornos con recursos limitados gracias a las cuantizaciones de 0,5 GB a 1,6 GB.
- No se dispone de información sobre soporte de tool calling, function calling, agentes, multi-step reasoning ni modos de razonamiento explícito (thinking mode).
- Capacidades multilingües limitadas al inglés según la model card.

## Casos de uso

- Prototipado local de asistentes conversacionales: con 752 millones de parámetros y cuantizaciones de 0,5-0,9 GB, el modelo puede ejecutarse en portátiles y estaciones de trabajo sin GPU dedicada, permitiendo iterar sobre prompts y flujos conversacionales en inglés antes de escalar a modelos mayores.
- Generación de texto en aplicaciones embebidas: la cuantización Q4_K_S (0,6 GB) permite integrar el modelo en entornos con memoria limitada, como aplicaciones de escritorio o servicios edge, donde el coste por inferencia es un factor crítico.
- Filtrado y clasificación de texto en pipelines de datos: el modelo puede emplearse para tareas de generación corta y reformulación en inglés dentro de procesos ETL o de limpieza de datasets, aprovechando su reducido footprint.
- Experimentación con cuantizaciones GGUF: el repositorio ofrece un abanico amplio de cuantizaciones (Q2_K a f16), lo que lo convierte en un banco de pruebas útil para comparar calidad y velocidad entre tipos de cuantización en llama.cpp u Ollama.
- Educación y divulgación: su tamaño reducido y licencia Apache 2.0 lo hacen adecuado para demostraciones de inferencia local, talleres sobre cuantización y materiales docentes sobre despliegue de modelos.
- Evaluación de componentes multimodales: los ficheros mmproj permiten explorar la integración de entrada multimodal en runners GGUF, aunque sin garantías documentadas sobre el alcance de dicha capacidad.
- Base para fine-tuning ligero: con 752 millones de parámetros y licencia permisiva, puede servir como punto de partida para ajustes específicos de dominio en inglés, siempre que se valide previamente su calidad base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,5-0,9 GB con cuantizaciones Q2_K a Q8_0; alrededor de 1,6 GB con f16. El modelo cabe holgadamente en GPUs de consumo.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM para f16, o 1 GB para cuantizaciones Q4/Q5. Funciona en RTX 3060, RTX 4060, RTX 4090, así como en GPUs integradas y Apple Silicon mediante Metal.
- Inferencia en CPU: viable gracias al tamaño reducido; las cuantizaciones Q4_K_S y Q4_K_M (0,6 GB) son las recomendadas por el autor por su equilibrio velocidad/calidad.
- Opciones de despliegue: llama.cpp, Ollama, y runners compatibles con GGUF; también transformers y text-generation-inference para el modelo base en safetensors.
- Latencia y throughput: no disponibles en la información proporcionada; dependerán del hardware y de la cuantización elegida.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| tinycore-30 (esta ficha) | 752 M | No disponible | Apache 2.0 | GGUF, safetensors | Hugging Face |
| Qwen2.5-0.5B | 494 M | 32.768 tokens (según documentación pública de Qwen) | Apache 2.0 | safetensors, GGUF | Hugging Face |
| Llama 3.2 1B | 1,24 B | 128.000 tokens (según documentación pública de Meta) | Llama 3.2 Community License | safetensors, GGUF | Hugging Face |
| SmolLM2-1.7B | 1,7 B | 8.192 tokens (según documentación pública de Hugging Face) | Apache 2.0 | safetensors, GGUF | Hugging Face |

La comparativa se limita a datos públicos de los modelos alternativos; no se dispone de benchmarks de tinycore-30 para contrastar rendimiento. La principal ventaja de tinycore-30 frente a alternativas es su licencia Apache 2.0 combinada con un tamaño inferior a 1 B, aunque la falta de documentación sobre contexto y entrenamiento dificulta una comparación rigurosa.

## Limitaciones y advertencias

- Información pública muy limitada: no se documentan la longitud de contexto, el dataset de entrenamiento, los benchmarks ni las capacidades multimodales reales, lo que impide garantizar su comportamiento en producción.
- Idioma restringido al inglés según la model card; no se ha validado su rendimiento en castellano ni en otros idiomas.
- Riesgo de alucinación inherente a modelos de 752 M de parámetros; la capacidad de razonamiento y el conocimiento factual serán limitados en comparación con modelos de mayor escala.
- Sesgos potenciales no documentados: al no conocerse la composición del dataset, no es posible evaluar sesgos de género, raza, ideología u otros.
- Las cuantizaciones Q2_K y Q3_K_S (0,5 GB) degradan la calidad de forma notable; el autor recomienda Q4_K_S o Q4_K_M para uso general.
- Las cuantizaciones ponderadas con imatrix no estaban disponibles en el momento de la publicación, lo que puede afectar a la calidad relativa de las cuantizaciones pequeñas.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de documentación sobre el entrenamiento impide verificar el cumplimiento de posibles restricciones de datos subyacentes.
- El modelo base pertenece a bitwikiorg; esta ficha describe únicamente la recuantización GGUF de mradermacher, no el modelo original.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/tinycore-30-GGUF
- Modelo base: https://huggingface.co/bitwikiorg/tinycore-30
- Página de descargas del autor: https://hf.tst.eu/model#tinycore-30-GGUF
- Guía de uso de GGUF (referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- FAQ y solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Comparativa de cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
