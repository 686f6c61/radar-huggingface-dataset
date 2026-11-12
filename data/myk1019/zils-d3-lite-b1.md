# myk1019/zils-d3-lite-b1

## Resumen

zils-d3-lite-b1 es un modelo de lenguaje publicado por el usuario myk1019 en Hugging Face. Se presenta como un fine-tune del denominado "d3-lite soup", una mezcla de pesos de dos modelos previos (Charlie320/zils-lite-v9a y qhoenix/zils-lite-decision-v9) distribuidos con licencia Apache-2.0. El entrenamiento se ha realizado sobre respuestas de un modelo profesor ("Zils Relay teacher answers") y datos públicos de decisión del split de entrenamiento.

El modelo deriva de pesos de Qwen3.5, según indica el autor, y cuenta con 852.985.920 parámetros totales según el recuento real de los tensores en formato safetensors. El repositorio ocupa 1,7 GB y se distribuye con licencia Apache-2.0.

La información publicada es muy escasa: la model card apenas ocupa dos líneas y no detalla arquitectura, contexto, idiomas, datos de entrenamiento ni resultados de evaluación. Cualquier evaluación rigurosa del modelo requerirá pruebas directas por parte del usuario, ya que no hay benchmarks ni documentación técnica más allá de la filiación a la familia Qwen3.5 y la licencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer derivado de Qwen3.5 (según el autor); detalles no disponibles |
| Parametros totales | 852.985.920 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantizaciones GGUF/otros no publicadas) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (con custom_code) |

## Arquitectura y entrenamiento

El autor indica que el modelo es un fine-tune del "d3-lite soup", una combinación de pesos de Charlie320/zils-lite-v9a y qhoenix/zils-lite-decision-v9, ambos Apache-2.0. Los pesos base derivan de Qwen3.5, lo que sitúa al modelo en la familia de transformers densos de Qwen, aunque no se especifica la variante concreta ni la configuración de capas, cabezas de atención o dimensión oculta.

El entrenamiento se ha realizado sobre respuestas generadas por un modelo profesor denominado "Zils Relay teacher" y sobre datos públicos de decisión del split de entrenamiento. No se detalla el número de tokens, la composición del dataset, si hubo etapas de RLHF o DPO, ni la técnica de mezcla de pesos empleada en el "soup" original. El repositorio incluye código personalizado (tag custom_code), lo que implica que la carga del modelo requiere confiar en la implementación incluida en el repo.

## Capacidades

- Generación de texto autoregresiva, heredada de la arquitectura Qwen3.5.
- Ajuste específico orientado a tareas de decisión, según la denominación del modelo base ("decision-v9") y el uso de datos de decisión en el entrenamiento.
- Capacidades multilingües: no documentadas; dependen del modelo base Qwen3.5, pero no se confirma ningún conjunto de idiomas.
- Tool calling / function calling: no documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Modo thinking, visión o audio: no documentado; no hay indicios de capacidades multimodales.
- Cualquier otra capacidad especial: no disponible.

## Casos de uso

- Experimentación en investigación sobre mezcla de pesos y destilación: el modelo es útil como caso de estudio de "model soup" y fine-tune sobre respuestas de un profesor, ya que el autor documenta la cadena de modelos de origen.
- Clasificación o toma de decisiones en dominios acotados: dado el nombre "decision-v9" del modelo base y el uso de datos de decisión, puede probarse en tareas de elección entre opciones o puntuación de alternativas, siempre con validación empírica propia.
- Generación de texto en prototipos: con 853 M de parámetros, es viable para prototipos de generación en entornos con recursos limitados, aunque sin garantías de calidad al no haber benchmarks.
- Evaluación comparativa de fine-tunes: sirve como punto de comparación frente a los modelos de origen (Charlie320/zils-lite-v9a y qhoenix/zils-lite-decision-v9) para medir el efecto del destilado sobre el profesor.
- Despliegue en hardware de consumo para pruebas: el tamaño (1,7 GB en safetensors) permite cargarlo en GPUs de gama media para experimentación, no para producción sin evaluación previa.
- Base para nuevos fine-tunes: al ser Apache-2.0, puede servir como punto de partida para ajustes posteriores en dominios específicos, con la advertencia de la falta de documentación sobre su comportamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,7 GB en precisión original (fp32/bf16 según pesos), alrededor de 0,9 GB en fp16 y en torno a 0,5 GB en cuantización de 4 bits (estimación a partir de 852.985.920 parámetros; no confirmada por el autor).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para fp16; RTX 3060, RTX 4060, RTX 4090, A100 o H100 son suficientes y sobradas para este tamaño.
- Cabe en GPU de consumo: sí, en la práctica totalidad de GPUs consumer actuales, incluidas integradas con suficiente memoria compartida.
- Opciones de despliegue: al incluir custom_code, la carga requiere `trust_remote_code=True` con transformers; no hay confirmación de soporte en vLLM, llama.cpp, Ollama o TGI, y la ausencia de pesos GGUF dificulta el despliegue en llama.cpp sin conversión previa.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| zils-d3-lite-b1 | 852.985.920 | no disponible | Apache-2.0 | Hugging Face (0 descargas, 0 likes) |
| Charlie320/zils-lite-v9a | no disponible | no disponible | Apache-2.0 (según el autor) | Hugging Face |
| qhoenix/zils-lite-decision-v9 | no disponible | no disponible | Apache-2.0 (según el autor) | Hugging Face |
| Qwen3.5 (familia base) | no disponible para la variante concreta | no disponible | no disponible | Hugging Face |

No se dispone de datos de rendimiento de ninguno de los modelos comparados en la información proporcionada, por lo que la comparativa se limita a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- Documentación mínima: la model card no detalla arquitectura, contexto, idiomas ni datos de entrenamiento, lo que impide evaluar su idoneidad sin pruebas propias.
- Sin benchmarks: no hay resultados publicados de MMLU, HumanEval, GSM8K ni de ninguna otra evaluación, por lo que se desconoce su calidad real.
- Riesgo de alucinación: inherente a los modelos de lenguaje; sin evaluación, no puede acotarse.
- Sesgos: no documentados; al derivar de Qwen3.5 y de datos de decisión no especificados, pueden heredarse sesgos del modelo base y del profesor.
- Idiomas: no se confirma ningún idioma soportado; no asumir multilingüismo sin verificación.
- Licencia: Apache-2.0 permite uso comercial, pero el uso de `custom_code` obliga a revisar el código incluido en el repositorio antes de desplegarlo en producción.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, lo que reduce la probabilidad de que haya sido validado por terceros.
- Fecha de creación futura (2026-11-12): conviene verificar la integridad y procedencia del repositorio antes de confiar en él.

## Enlaces

- [Hugging Face: myk1019/zils-d3-lite-b1](https://huggingface.co/myk1019/zils-d3-lite-b1)
- [Charlie320/zils-lite-v9a](https://huggingface.co/Charlie320/zils-lite-v9a)
- [qhoenix/zils-lite-decision-v9](https://huggingface.co/qhoenix/zils-lite-decision-v9)
