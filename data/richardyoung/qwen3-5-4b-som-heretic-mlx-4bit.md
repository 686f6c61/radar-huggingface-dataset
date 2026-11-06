# richardyoung/Qwen3.5-4B-SOM-heretic-MLX-4bit

## Resumen

Qwen3.5-4B-SOM-heretic-MLX-4bit es una conversión cuantizada a 4 bits en formato MLX del modelo richardyoung/Qwen3.5-4B-SOM-heretic, una variante del Qwen3.5-4B de Alibaba a la que se le ha eliminado el comportamiento de rechazo (refusal) mediante la técnica SOM (refusal removal) implementada con Heretic 2.0. El autor, richardyoung, publica esta versión para Apple Silicon dentro de un estudio más amplio titulado *Is Abliteration Getting Harder? Directional vs. Optimization-Based Refusal Removal Across Generations of Open-Weight LLMs* (Young, 2026, en preparación).

El modelo conserva la arquitectura y el tamaño del Qwen3.5-4B original, con 4.205.751.296 parámetros totales y un repositorio de 2,4 GB tras la cuantización afín de 4 bits con tamaño de grupo 64. Su propósito es servir como objeto de estudio para investigar la robustez de los mecanismos de seguridad en modelos open-weight y evaluar hasta qué punto las técnicas de eliminación de rechazo siguen siendo efectivas en las generaciones más recientes de LLM.

La relevancia de esta ficha radica en que documenta un artefacto de investigación de seguridad, no un modelo de propósito general para producción. La model card advierte explícitamente de que el modelo puede cumplir peticiones dañinas y que su publicación se orienta a la investigación sobre mecanismos de seguridad. La licencia Apache 2.0 del modelo base se mantiene, pero las evaluaciones del paper se realizaron sobre los pesos bf16 de origen, no sobre esta cuantización de 4 bits.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3.5), conversión MLX; detalles internos no disponibles |
| Parametros totales | 4.205.751.296 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits afín (affine), tamaño de grupo 64, formato MLX |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX), cuantización 4-bit |

## Arquitectura y entrenamiento

El modelo deriva de Qwen/Qwen3.5-4B, un transformer de 4.205.751.296 parámetros. Sobre esa base, el autor aplicó Heretic 2.0 para producir la variante SOM (refusal-removed) y posteriormente la convirtió a MLX con `mlx_lm.convert -q --q-bits 4 --q-group-size 64` usando mlx-lm 0.32.2. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF o DPO en el modelo original.

La innovación técnica documentada es el procedimiento de eliminación de rechazo (abliteration/SOM) con Heretic 2.0, que el autor enmarca en un estudio comparativo entre métodos direccionales y basados en optimización a lo largo de varias generaciones de modelos open-weight. La cuantización MLX de 4 bits con grupo 64 es la única diferencia respecto a los pesos de origen; las evaluaciones del paper se ejecutaron sobre el modelo bf16, no sobre esta versión cuantizada. El modelo arranca por defecto con una sección de razonamiento (thinking); el paper evaluó con `enable_thinking=False` en la plantilla de chat.

## Capacidades

- Generación de texto conversacional y de propósito general, heredada del Qwen3.5-4B.
- Modo de razonamiento (thinking) activado por defecto en la plantilla de chat, desactivable con `enable_thinking=False`.
- Comportamiento de rechazo eliminado: el modelo tiende a cumplir peticiones que el modelo base rechazaría.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Capacidades de visión o audio: no disponible en la información proporcionada.

## Casos de uso

- Investigación sobre seguridad de LLM: el modelo sirve como sujeto de prueba para medir la robustez de los mecanismos de rechazo frente a técnicas de abliteration, comparando resultados con el Qwen3.5-4B original y con generaciones anteriores.
- Evaluación de métodos de eliminación de rechazo: permite reproducir y contrastar el enfoque SOM de Heretic 2.0 frente a métodos direccionales, tal como plantea el estudio de Young (2026).
- Auditoría de red teaming en Apple Silicon: al estar en formato MLX 4-bit, se puede ejecutar localmente en Mac para generar respuestas a prompts adversarios y analizar patrones de cumplimiento.
- Estudio de degradación por cuantización: comparar el comportamiento del modelo 4-bit MLX con los pesos bf16 de origen para medir el impacto de la cuantización en las respuestas y en la eliminación de rechazo.
- Docencia y divulgación sobre alineamiento: ilustrar en entornos controlados cómo se modifica el comportamiento de un modelo al alterar sus direcciones de rechazo.
- Desarrollo de filtros y clasificadores de seguridad: usar las respuestas del modelo como corpus negativo para entrenar o validar sistemas de detección de contenido dañino.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica que las evaluaciones del paper se ejecutaron sobre el modelo bf16 de origen, no sobre esta conversión de 4 bits, y no se incluyen cifras concretas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repositorio ocupa 2,4 GB en cuantización 4-bit, por lo que la memoria unificada necesaria en Apple Silicon será del orden de esa cifra más el overhead de contexto y del runtime MLX.
- GPU recomendadas: Apple Silicon con MLX (mlx-lm 0.32.2); no se documenta soporte para CUDA en esta versión.
- ¿Cabe en GPU consumer?: el formato MLX está pensado para Mac con memoria unificada; no se dispone de datos para GPUs NVIDIA consumer.
- Opciones de despliegue: `mlx_lm.generate` y el ecosistema mlx-lm; no se documenta vLLM, llama.cpp, Ollama ni TGI para este artefacto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| richardyoung/Qwen3.5-4B-SOM-heretic-MLX-4bit | 4.205.751.296 | no disponible | 4-bit MLX | Apache 2.0 | Hugging Face (0 descargas) |
| richardyoung/Qwen3.5-4B-SOM-heretic | no disponible | no disponible | bf16 | Apache 2.0 | Hugging Face (modelo base) |
| Qwen/Qwen3.5-4B | no disponible | no disponible | original | no disponible en la información | Hugging Face (modelo de origen) |

No se dispone de datos de rendimiento ni de benchmarks para establecer una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- El modelo ha eliminado su comportamiento de rechazo y puede cumplir peticiones dañinas; la model card lo restringe a investigación sobre mecanismos de seguridad.
- Riesgo elevado de uso indebido: no es adecuado para despliegues de producción orientados al público sin capas adicionales de filtrado.
- Las evaluaciones del paper se realizaron sobre los pesos bf16, no sobre esta cuantización de 4 bits; el comportamiento puede diferir.
- No hay información sobre sesgos, alucinación, cobertura idiomática ni longitud de contexto.
- La licencia Apache 2.0 permite uso comercial, pero el autor no lo recomienda y la responsabilidad legal y ética recae en el usuario.
- El formato MLX limita el despliegue a entornos Apple Silicon con mlx-lm; no hay soporte documentado para CUDA.
- El modelo arranca con thinking activado por defecto, lo que incrementa la latencia y el consumo de tokens si no se desactiva.

## Enlaces

- Hugging Face: https://huggingface.co/richardyoung/Qwen3.5-4B-SOM-heretic-MLX-4bit
- Modelo base: https://huggingface.co/richardyoung/Qwen3.5-4B-SOM-heretic
- Modelo de origen: https://huggingface.co/Qwen/Qwen3.5-4B
- Repositorio MLX: https://github.com/ml-explore/mlx
- Estudio de referencia: *Is Abliteration Getting Harder? Directional vs. Optimization-Based Refusal Removal Across Generations of Open-Weight LLMs* (Young, 2026, en preparación); sin enlace disponible.
