# EhsaasBawa16/Novius-Qlux

## Resumen

Novius-Qlux es un ajuste fino (fine-tuning) del modelo Qwen2.5-Coder-1.5B-Instruct, publicado por el usuario EhsaasBawa16 en Hugging Face. Se trata de un modelo de generación de texto de 1.543.714.304 parámetros (aproximadamente 1,5 mil millones) construido sobre la arquitectura Qwen2, orientado a tareas conversacionales y de generación de código, y entrenado mediante la librería Unsloth junto con TRL de Hugging Face, lo que según el autor permite un entrenamiento "2x más rápido".

El modelo parte de la versión cuantizada a 4 bits del Qwen2.5-Coder-1.5B-Instruct original (publicada por Unsloth), de ahí que herede las capacidades de instrucción y generación de código de la familia Qwen2.5-Coder. La model card es extremadamente escueta: no documenta el dataset de ajuste, el número de tokens de entrenamiento, ni los hiperparámetros utilizados, y no se han publicado resultados de benchmarks propios.

Su relevancia es limitada y fundamentalmente experimental: se trata de un modelo de nicho con cero descargas y cero likes en el momento de la consulta, sin documentación técnica más allá de la referencia al modelo base. Resulta útil como ejemplo de flujo de trabajo de fine-tuning con Unsloth sobre un modelo pequeño, pero no como componente listo para producción sin una evaluación adicional por parte del usuario.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2) |
| Parámetros totales | 1.543.714.304 (~1,5 B) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (el modelo base Qwen2.5-Coder-1.5B-Instruct soporta hasta 32.768 tokens, aunque este dato no se confirma en la model card del fine-tuning) |
| Tipos de cuantización | no disponible (el modelo base de partida está en bnb-4bit; los pesos publicados son safetensors) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2, un transformer decoder-only con atención causal estándar, heredada directamente del modelo base Qwen2.5-Coder-1.5B-Instruct. El ajuste fino se realizó sobre la versión cuantizada a 4 bits en formato bitsandbytes (`unsloth/Qwen2.5-Coder-1.5B-Instruct-bnb-4bit`), empleando la librería Unsloth y TRL de Hugging Face. Según la model card, este stack permite un entrenamiento aproximadamente dos veces más rápido que un flujo convencional.

No se dispone de información sobre el dataset de ajuste, la composición de los datos, el número de tokens de entrenamiento, ni sobre si se aplicaron técnicas de RLHF, DPO o SFT supervisado. Tampoco se documentan innovaciones técnicas adicionales más allá del uso de Unsloth para el entrenamiento eficiente. La model card no incluye detalles sobre el proceso de fusión de pesos ni sobre posibles técnicas de decodificación especulativa.

## Capacidades

- Generación de texto conversacional en inglés, heredada del ajuste de instrucciones del modelo base.
- Generación de código, dado que el modelo base es Qwen2.5-Coder-1.5B-Instruct, especializado en tareas de programación.
- Razonamiento de instrucciones básico, propio de un modelo de 1,5 B de parámetros.
- Compatibilidad con `text-generation-inference` y con la librería `transformers`, según los tags del repositorio.
- Soporte de `endpoints_compatible`, lo que indica que puede desplegarse en infraestructura de Hugging Face Inference Endpoints.
- No se documenta soporte explícito de tool calling, function calling, agentes o razonamiento multi-paso en la información proporcionada.
- No se documentan capacidades de visión, audio ni modo de pensamiento (thinking mode).
- Capacidades multilingües limitadas al inglés según la etiqueta de idioma del repositorio.

## Casos de uso

- Asistencia de código en local: el modelo puede emplearse para autocompletar y explicar fragmentos de código en inglés, aprovechando la base Qwen2.5-Coder; su tamaño de 1,5 B permite ejecutarlo en hardware modesto.
- Prototipado de chatbots conversacionales: sirve como base para experimentar con pipelines de `transformers` o `text-generation-inference` en entornos de desarrollo antes de escalar a modelos mayores.
- Evaluación de flujos de fine-tuning: útil como caso de estudio de un ajuste fino realizado con Unsloth y TRL sobre un modelo cuantizado a 4 bits.
- Generación de documentación técnica en inglés: puede redactar comentarios y descripciones de funciones a partir de código fuente, dentro de las limitaciones de un modelo de 1,5 B.
- Experimentación académica: adecuado para comparar el efecto del fine-tuning sobre un modelo base pequeño en tareas controladas.
- Despliegue en entornos con recursos limitados: al ser un modelo de ~1,5 B, puede ejecutarse en GPUs de consumo para pruebas de integración con `transformers` o TGI.
- No se recomienda su uso en producción crítica sin una evaluación previa, dado que no hay benchmarks publicados ni documentación del dataset de ajuste.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa para un modelo de ~1,5 B de parámetros, en FP16 requeriría aproximadamente 3 GB de VRAM solo para los pesos, y en cuantización de 4 bits en torno a 1 GB, si bien estos cálculos no están confirmados por el autor.
- GPU recomendadas: no especificadas por el autor. Por tamaño, cabría esperar que funcione en GPUs de consumo como RTX 3060, RTX 4060 o superiores, así como en A100 o H100 para despliegues con mayor throughput.
- Cabe en GPU de consumo: previsiblemente sí, dado el reducido número de parámetros, aunque no hay confirmación oficial.
- Opciones de despliegue: `transformers`, `text-generation-inference` (TGI) y, por compatibilidad con el ecosistema, potencialmente llama.cpp u Ollama si se generan pesos GGUF (no confirmado). El tag `endpoints_compatible` sugiere compatibilidad con Hugging Face Inference Endpoints.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Novius-Qlux (este modelo) | ~1,5 B | no disponible | Apache 2.0 | Hugging Face, 0 descargas | Fine-tuning no documentado |
| Qwen2.5-Coder-1.5B-Instruct (base) | ~1,5 B | hasta 32.768 tokens (según documentación del modelo base) | Apache 2.0 | Hugging Face, ampliamente utilizado | Modelo base oficial, con benchmarks publicados por el autor original |
| Qwen2.5-Coder-1.5B (versión base sin instrucciones) | ~1,5 B | hasta 32.768 tokens (según documentación del modelo base) | Apache 2.0 | Hugging Face | Orientado a continuación de texto y código |

No se dispone de datos de rendimiento comparativos del fine-tuning frente a su modelo base ni frente a alternativas, por lo que la comparación se limita a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- Ausencia total de documentación sobre el dataset de ajuste, lo que impide evaluar sesgos introducidos durante el fine-tuning.
- Riesgo de alucinación inherente a un modelo de 1,5 B de parámetros, especialmente en tareas de razonamiento complejo o código de gran extensión.
- Idiomas soportados limitados al inglés según la etiqueta del repositorio; no se garantiza un rendimiento adecuado en castellano u otros idiomas.
- Longitud de contexto no confirmada en la model card; el modelo base soporta hasta 32.768 tokens, pero no se verifica que el fine-tuning preserve esa ventana.
- Licencia Apache 2.0, que permite uso comercial, pero sin garantías por parte del autor y sin evaluación de calidad publicada.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso en producción ni validación por parte de la comunidad.
- El modelo parte de una versión cuantizada a 4 bits del base, lo que puede introducir pérdidas de precisión adicionales respecto al modelo original en FP16.
- No se documentan salvaguardas de seguridad, filtros de contenido ni evaluaciones de alineación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/EhsaasBawa16/Novius-Qlux
- Modelo base: https://huggingface.co/unsloth/Qwen2.5-Coder-1.5B-Instruct-bnb-4bit
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
- Librería TRL de Hugging Face: https://github.com/huggingface/trl
