# arrochi112/onebee-gf-dpo-v1-scale

## Resumen

`onebee-gf-dpo-v1-scale` es un checkpoint derivado de `google/gemma-4-E2B-it` mediante un adaptador LoRA, desarrollado por `arrochi112` dentro del proyecto open-source **small-mind-companion**. Este proyecto investiga cuánta capacidad aparente puede recuperar un modelo pequeño (del orden de 2-4 mil millones de parámetros) con capacidades de visión, mediante post-entrenamiento, memoria externa y recuperación, en lugar de aumentar el número de parámetros. El checkpoint presentado es el resultado de un entrenamiento de DPO (Direct Preference Optimization) rebalanceado a escala adecuada, con 2049 pares de preferencia, sobre el checkpoint SFT previo (`sft-v1`). Se describe como el "mejor checkpoint global" del proyecto, y también se distribuyen cuantizaciones GGUF en un repositorio hermano.

El modelo está orientado a aplicaciones de "companion" (asistentes personales conversacionales) y es multimodal, aunque no se especifican detalles de la arquitectura interna más allá de su base en Gemma. Su relevancia radica en explorar si técnicas de post-entrenamiento y memoria externa pueden compensar la falta de escala, un tema de interés para despliegues en entornos con recursos limitados. El proyecto documenta tanto resultados positivos como negativos, lo que aporta transparencia sobre las limitaciones reales.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (basado en `google/gemma-4-E2B-it`, con adaptador LoRA) |
| Parametros totales | 5.104.297.539 (según safetensors) |
| Parametros activos | No disponible (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (existen cuantizaciones GGUF en `onebee-gf-dpo-v1-scale-gguf`, pero no se listan los tipos concretos) |
| Idiomas soportados | No disponible |
| Licencia | Gemma (heredada del modelo base) |
| Formato de pesos | safetensors (y GGUF para las cuantizaciones) |

## Arquitectura y entrenamiento

La arquitectura exacta no se documenta en la información disponible. Se sabe que el modelo parte de `google/gemma-4-E2B-it` y que se aplica un adaptador LoRA, lo que sugiere que los parámetros del modelo base se congelan y solo se entrenan los pesos del adaptador. El entrenamiento consta de dos fases: primero un ajuste fino supervisado (SFT) que da lugar al checkpoint `sft-v1`, y posteriormente un entrenamiento con DPO utilizando 2049 pares de preferencia, que produce este checkpoint. El proyecto hace hincapié en la "escala adecuada" (proper-scale), lo que implica un rebalanceo de los datos de preferencia para evitar sesgos. No se proporcionan detalles sobre el dataset de entrenamiento, el número de tokens, ni si se emplearon técnicas como RLHF adicionales. El proyecto también incorpora memoria externa y recuperación como parte del sistema completo, aunque no se detalla cómo se integran con el modelo.

## Capacidades

- Multimodal: el modelo acepta entradas de visión además de texto, según las etiquetas del repositorio.
- Generación de texto conversacional orientado a "companion" (asistentes personales).
- Post-entrenamiento con DPO para alinear preferencias, lo que sugiere cierta mejora en calidad de respuesta y reducción de outputs no deseados.
- Integración con memoria externa y recuperación en el contexto del proyecto small-mind-companion, aunque estas capacidades no están implementadas dentro del checkpoint en sí.
- No se documentan capacidades explícitas de tool calling, agentes o razonamiento multi-paso.

## Casos de uso

- Asistentes personales en dispositivos con recursos limitados: al ser un modelo pequeño (5.1B parámetros) y disponible en cuantizaciones GGUF, puede ejecutarse en hardware de consumo, permitiendo asistentes conversacionales locales sin conexión.
- Investigación en post-entrenamiento: el proyecto publica resultados detallados y honestos, incluyendo fracasos, por lo que es útil como caso de estudio para técnicas de SFT y DPO en modelos pequeños.
- Prototipado de aplicaciones multimodales: al aceptar entradas de visión, puede usarse para tareas simples de descripción de imágenes o interacción visual en entornos experimentales.
- Evaluación de técnicas de memoria externa: aunque la memoria no está en el checkpoint, el proyecto proporciona el sistema completo, permitiendo experimentar con retrieval aumentado en modelos pequeños.
- Educación y divulgación: el código y la documentación del proyecto sirven para aprender sobre ajuste fino de modelos multimodales y los desafíos de escalar capacidades.
- Despliegue en edge computing: con cuantización GGUF, el modelo puede caber en GPUs de gama media o incluso en CPU, habilitando chatbots en entornos sin acceso a la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El proyecto menciona documentación con resultados y limitaciones en `docs/proper_scale_results.md`, pero no se incluyen métricas concretas en la model card ni en la información proporcionada.

## Requisitos de hardware

- VRAM estimada: con 5.1B parámetros, en precisión fp16 se requieren aproximadamente 10 GB de VRAM solo para los pesos. Con cuantizaciones GGUF de 4 bits, el requisito baja a unos 3-4 GB, lo que permite ejecución en GPUs de consumo como RTX 3060 o superiores.
- GPUs recomendadas: para fp16, una GPU con al menos 12 GB de VRAM (RTX 3060 12GB, RTX 4070, etc.). Para cuantización GGUF, una GPU con 6-8 GB puede ser suficiente.
- Compatibilidad con consumer GPU: sí, especialmente con las versiones GGUF.
- Opciones de despliegue: llama.cpp, Ollama, y otros runners compatibles con GGUF. Para safetensors, se puede usar vLLM o Transformers, aunque no se indica soporte explícito.
- Latencia y throughput: no disponibles. Dependerá del hardware y la cuantización elegida.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa directa con otros modelos. El modelo base `google/gemma-4-E2B-it` no está documentado en la información proporcionada, y no se conocen alternativas equivalentes en cuanto a tamaño y enfoque (multimodal, companion, DPO). Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- Sesgos: no se han evaluado; el modelo hereda los sesgos potenciales del modelo base Gemma, que no se detallan.
- Riesgo de alucinación: no se ha medido; al ser un modelo pequeño, es probable que presente alucinaciones en tareas complejas.
- Limitaciones de contexto: se desconoce la longitud máxima de contexto, lo que puede afectar a conversaciones largas o documentos extensos.
- Restricciones de licencia: la licencia Gemma impone ciertas restricciones de uso comercial; es necesario revisar los términos exactos antes de usar el modelo en producción.
- Proyecto experimental: los autores advierten que los resultados deben interpretarse con cautela, y que el proyecto reporta tanto éxitos como fracasos. No se garantiza un rendimiento consistente.
- Falta de documentación: no se especifican detalles de entrenamiento, datos, ni arquitectura interna, lo que limita la reproducibilidad y la evaluación independiente.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/arrochi112/onebee-gf-dpo-v1-scale
- Repositorio del proyecto: https://github.com/arrogance231/small-mind-companion
- Documentación de resultados: https://github.com/arrogance231/small-mind-companion/blob/main/docs/proper_scale_results.md
- Checkpoint SFT v0: https://huggingface.co/arrochi112/onebee-gf-sft-v0
- Checkpoint SFT v1: https://huggingface.co/arrochi112/onebee-gf-sft-v1
- Checkpoint DPO v0: https://huggingface.co/arrochi112/onebee-gf-dpo-v0
- Checkpoint DPO 4 epochs: https://huggingface.co/arrochi112/onebee-gf-dpo-v1-4epoch
- Cuantizaciones GGUF: https://huggingface.co/arrochi112/onebee-gf-dpo-v1-scale-gguf
