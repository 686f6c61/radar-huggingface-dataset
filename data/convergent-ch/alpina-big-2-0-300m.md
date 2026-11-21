# Convergent-ch/Alpina-Big-2.0-300M

## Resumen

Alpina-Big-2.0-300M es un modelo de lenguaje denso de tipo Llama, desarrollado por Convergent-ch, entrenado desde pesos aleatorios (no es un fine-tuning de un modelo preexistente). Con 299.410.432 parámetros únicos, se posiciona en la categoría de modelos pequeños orientados a experimentación y despliegue ligero. Su publicación es relevante como ejercicio de entrenamiento reproducible desde cero en un rango de tamaño que cabe holgadamente en hardware de consumo.

El modelo se distribuye en formato Safetensors y GGUF (F16), con licencia Apache 2.0, lo que facilita su uso comercial y su integración en pipelines existentes mediante `transformers`, text-generation-inference u Ollama. El tokenizador procede de SmolLM2-135M-Instruct, aunque los pesos de ese modelo no se reutilizaron.

La model card es explícita sobre sus limitaciones: se trata de un lanzamiento de investigación con evaluación muy limitada, con resultados débiles en tareas de código (1/6 en comprobaciones simples) y sin datos de benchmarks estándar publicados. Es, por tanto, un modelo para experimentación controlada más que para producción exigente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso tipo Llama (dense Llama) |
| Parametros totales | 299.410.432 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F16 (GGUF incluido); cuantizaciones adicionales no disponibles |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, GGUF (F16) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura transformer densa de estilo Llama, entrenada desde inicialización aleatoria. No se dispone de información sobre el número total de tokens de entrenamiento ni sobre la composición exacta del dataset más allá de las fuentes citadas: prefijos de SmolLM-Corpus (ODC-BY), CodeParrot filtrado por permisividad, Smol-SmolTalk (Apache 2.0) y self-oss-instruct-sc2-exec-filter-50k (ODC-BY). No se menciona el uso de RLHF, DPO ni otras técnicas de alineación posteriores al preentrenamiento.

El tokenizador se toma de HuggingFaceTB/SmolLM2-135M-Instruct, lo que implica un vocabulario ya validado para texto en inglés y código. La model card indica que el formato de chat está entrenado con saltos de línea LF y que la conversión a GGUF no implicó reentrenamiento. No se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto conversacional en inglés, con formato de chat soportado mediante `apply_chat_template`.
- Respuestas de identidad y personalización: la model card reporta 3/3 en comprobaciones de identidad.
- Capacidad de código muy limitada: 1/6 en comprobaciones simples de programación, según el propio autor.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta capacidad multilingüe más allá del inglés.
- No se documentan modos especiales como thinking mode, visión o audio.

## Casos de uso

- Experimentación académica con entrenamiento desde cero: el modelo sirve como referencia reproducible para estudiar el comportamiento de transformers pequeños entrenados con corpus abiertos como SmolLM-Corpus y Smol-SmolTalk.
- Despliegue en entornos con recursos muy limitados: sus ~300M de parámetros permiten ejecución en CPU y en GPUs de gama baja, útil para prototipos de chat en inglés sin requisitos de infraestructura.
- Pruebas de integración de pipelines: al estar disponible en `transformers`, text-generation-inference y Ollama, puede usarse para validar cadenas de despliegue y conversión a GGUF antes de migrar a modelos mayores.
- Generación de texto conversacional simple en inglés: respuestas de identidad y diálogo básico, adecuado para demos y entornos de prueba internos.
- Evaluación comparativa de tokenizadores: al reutilizar el tokenizador de SmolLM2-135M-Instruct, permite estudiar el efecto del vocabulario en modelos de tamaño similar.
- Docencia y formación: su tamaño reducido y licencia permisiva lo hacen útil para explicar el ciclo completo de entrenamiento, conversión a GGUF y despliegue con Ollama.
- Base para fine-tuning ligero: al ser Apache 2.0 y estar en safetensors, puede servir como punto de partida para ajustes específicos en tareas de inglés, aunque su calidad base es limitada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente reporta comprobaciones internas de identidad (3/3) y de código simple (1/6), y advierte explícitamente de que no debe inferirse calidad de benchmark a partir de las respuestas de identidad correctas.

## Requisitos de hardware

- VRAM estimada para inferencia en F16: aproximadamente 0,6 GB solo para pesos (299M × 2 bytes), más overhead de activaciones y caché KV; en la práctica, menos de 2 GB en la mayoría de configuraciones.
- VRAM estimada en cuantizaciones de 8 bits: alrededor de 0,3 GB para pesos; en 4 bits, alrededor de 0,15 GB (estimaciones teóricas, no verificadas por el autor).
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) es sobradamente suficiente; también funciona en CPU.
- Cabe en GPU consumer: sí, en prácticamente cualquier GPU con 4 GB o más de VRAM, e incluso en sistemas integrados.
- Opciones de despliegue: `transformers`, text-generation-inference (tag `endpoints_compatible`), Ollama mediante `girgineron/alpina-big-2.0:300m`, y llama.cpp a través del GGUF F16 incluido.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Alpina-Big-2.0-300M | 299M | no disponible | Apache 2.0 | HF, GGUF, Ollama | Entrenado desde cero, evaluación muy limitada |
| SmolLM2-135M-Instruct | 135M | no disponible en la informacion proporcionada | Apache 2.0 | HF | Tokenizador reutilizado por Alpina; modelo instruct ampliamente evaluado |
| Qwen2.5-0.5B | ~500M | no disponible en la informacion proporcionada | Apache 2.0 | HF | Mayor tamaño; la model card de Alpina declara no tener afiliación con Qwen |

No se dispone de datos de rendimiento comparativos publicados para Alpina-Big-2.0-300M, por lo que la comparación se limita a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- Evaluación muy limitada: el propio autor califica el lanzamiento como de investigación y advierte de que no debe inferirse calidad de benchmark a partir de las respuestas de identidad.
- Rendimiento débil en código: 1/6 en comprobaciones simples de programación; no es un asistente de código.
- Sesgos conocidos: no documentados; al entrenarse con corpus web filtrados (SmolLM-Corpus, CodeParrot), es probable la presencia de sesgos de esos datos, aunque no se cuantifican.
- Riesgo de alucinación: no evaluado; en modelos pequeños entrenados desde cero con evaluación escasa, el riesgo es alto y no está medido.
- Limitación de idioma: solo inglés; no se documenta soporte de castellano ni de otros idiomas.
- Longitud de contexto: no documentada, lo que impide planificar usos con contexto largo.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero las licencias de los datasets de origen (ODC-BY, Apache 2.0) aplican a los datos fuente, que no se redistribuyen.
- Atribución: las afirmaciones de identidad del modelo describen la personalización y no cambian la autoría original; no se implica afiliación con Qwen ni con los autores de los datasets.
- Caveat para producción: sin benchmarks ni evaluación de robustez, no se recomienda su uso en aplicaciones de cara al usuario sin validación previa.

## Enlaces

- Hugging Face: https://huggingface.co/Convergent-ch/Alpina-Big-2.0-300M
- Ollama: `girgineron/alpina-big-2.0:300m`
- Dataset SmolLM-Corpus: https://huggingface.co/datasets/HuggingFaceTB/smollm-corpus
- Dataset CodeParrot: https://huggingface.co/datasets/codeparrot/codeparrot-clean-train
- Dataset Smol-SmolTalk: https://huggingface.co/datasets/HuggingFaceTB/smol-smoltalk
- Dataset self-oss-instruct-sc2-exec-filter-50k: https://huggingface.co/datasets/bigcode/self-oss-instruct-sc2-exec-filter-50k
- Tokenizador de origen: https://huggingface.co/HuggingFaceTB/SmolLM2-135M-Instruct
