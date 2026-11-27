# GGUFGuy/gemma-nya

## Resumen

Gemma-nya es un ajuste fino (fine-tuning) del modelo Gemma 3 de 1B parámetros en su variante instruct, desarrollado por el usuario GGUFGuy. Se trata de un modelo de generación de texto de tipo `gemma3_text` entrenado mediante la librería Unsloth y TRL sobre el dataset RaspizdAI/femboy-10k. El modelo parte de la versión cuantizada en 4 bits de Unsloth (`unsloth/gemma-3-1b-it-unsloth-bnb-4bit`) y se distribuye con licencia Apache 2.0.

El modelo hereda la arquitectura transformer decoder-only de la familia Gemma 3, con aproximadamente 1.000 millones de parámetros. Al ser un ajuste fino sobre la variante instruct, está orientado a generación de texto conversacional, aunque el entrenamiento específico sobre un dataset de nicho sugiere una especialización temática concreta más que un uso generalista.

Su relevancia es limitada en el ecosistema actual: se publica como un experimento de ajuste fino ligero (el repositorio ocupa 0,1 GB), sin métricas de evaluación publicadas, sin descargas ni interacciones registradas, y con documentación mínima. Resulta útil como ejemplo de pipeline de fine-tuning con Unsloth sobre modelos pequeños, pero no como modelo de producción generalista.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (gemma3_text) |
| Parametros totales | Aproximadamente 1.000 millones (heredados de Gemma 3 1B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | El modelo base de partida esta en 4 bits (bnb-4bit); el repositorio publicado contiene safetensors |
| Idiomas soportados | Ingles (segun la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino de `unsloth/gemma-3-1b-it-unsloth-bnb-4bit`, que a su vez deriva de Gemma 3 1B instruct. La arquitectura subyacente es un transformer decoder-only de la familia Gemma 3, con aproximadamente 1.000 millones de parámetros. El entrenamiento se realizó con Unsloth y la librería TRL de Hugging Face, según indica la model card, con una aceleración declarada de 2x respecto a un entrenamiento convencional.

El dataset de ajuste fino es `RaspizdAI/femboy-10k`, un conjunto de 10.000 ejemplos orientado a un dominio temático específico. No se especifican en la información disponible el número de tokens de entrenamiento, la composición detallada del dataset, ni si se aplicaron técnicas de RLHF o DPO posteriores. Tampoco se detalla si se empleó LoRA, QLoRA u otro método de adaptación paramétrica, aunque el uso de Unsloth y el tamaño reducido del repositorio (0,1 GB) son compatibles con un ajuste eficiente en parámetros.

## Capacidades

- Generación de texto conversacional en inglés, heredada de la variante instruct de Gemma 3 1B.
- Ajuste fino orientado a un dominio temático específico (dataset femboy-10k), lo que puede sesgar el estilo y el contenido de las respuestas hacia ese registro.
- Capacidad de razonamiento básico y respuesta a instrucciones, limitada por el tamaño de 1B parámetros del modelo base.
- Soporte multilingüe limitado: la model card declara únicamente inglés.
- No se documenta soporte de tool calling, function calling, agentes ni razonamiento multi-paso en la información disponible.
- No se documentan capacidades de visión, audio ni modo de pensamiento (thinking mode) en la información disponible.

## Casos de uso

- Experimentación con pipelines de fine-tuning: sirve como ejemplo reproducible de ajuste fino con Unsloth y TRL sobre un modelo pequeño, útil para desarrolladores que quieran validar su flujo de entrenamiento antes de escalar a modelos mayores.
- Generación de texto creativo en inglés con un registro estilístico concreto: el ajuste sobre el dataset de nicho puede emplearse para producir textos con una voz y temática determinadas, siempre que el usuario acepte el sesgo introducido por el dataset.
- Chatbot de dominio restringido: al ser un modelo de 1B parámetros, puede desplegarse en entornos con recursos limitados para conversaciones de temática acotada, aunque sin garantías de calidad generalista.
- Prototipado rápido en local: su tamaño reducido permite ejecutarlo en hardware de consumo para pruebas de concepto de asistentes conversacionales.
- Investigación sobre sesgos y alineación: el contraste entre el modelo base instruct y este ajuste de nicho permite estudiar cómo un dataset pequeño modifica el comportamiento y el estilo del modelo.
- Base para futuros ajustes: puede servir como punto de partida para fine-tunings adicionales en dominios relacionados, dado que se distribuye con licencia Apache 2.0.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: un modelo de 1B parámetros en precisión completa (fp16) requiere aproximadamente 2 GB de VRAM; en cuantización de 8 bits, alrededor de 1 GB; en 4 bits, en torno a 0,5-0,7 GB, más el overhead de la ventana de contexto y del runtime.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para fp16 (por ejemplo, RTX 3050, RTX 4060, T4); para cuantizaciones de 4 bits basta con GPUs integradas o de gama baja con 2-4 GB.
- Cabe en GPU de consumo: sí, en la práctica totalidad de GPUs de consumo actuales (RTX 3060, RTX 4060, RTX 4090) e incluso en placas con 8 GB o menos.
- Opciones de despliegue: transformers (librería declarada en la model card), text-generation-inference (tag presente), y por el tamaño, también llama.cpp, Ollama o vLLM aunque no se documenten explícitamente.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Gemma-nya (este modelo) | ~1B | No disponible | Apache 2.0 | Hugging Face | Ajuste fino de nicho sobre Gemma 3 1B |
| Gemma 3 1B instruct (base) | ~1B | No disponible | Gemma license | Hugging Face | Modelo generalista original, sin sesgo de nicho |
| Qwen 2.5 1.5B instruct | ~1,5B | No disponible | Apache 2.0 | Hugging Face | Alternativa generalista de tamaño similar |
| Llama 3.2 1B instruct | ~1B | No disponible | Llama license | Hugging Face | Alternativa generalista de tamaño similar |

No se dispone de datos de rendimiento comparativo para Gemma-nya en la información proporcionada, por lo que la comparación se limita a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- Sesgos conocidos: el ajuste fino sobre un dataset de nicho (femboy-10k) puede introducir un sesgo temático y estilístico fuerte, desplazando las respuestas hacia ese registro y degradando el comportamiento generalista del modelo base.
- Riesgo de alucinación: inherente a los modelos de 1B parámetros y acentuado por un ajuste fino sobre un dataset pequeño y específico; no se han publicado evaluaciones de fidelidad.
- Limitaciones de contexto e idioma: la model card declara únicamente inglés; no se especifica la longitud de contexto soportada.
- Restricciones de licencia: se distribuye con Apache 2.0, lo que permite uso comercial, pero el modelo base Gemma 3 tiene sus propios términos de licencia que conviene revisar antes de un despliegue en producción.
- Caveats para producción: sin benchmarks, sin descargas ni validación comunitaria, y con documentación mínima; no se recomienda su uso en producción sin una evaluación propia exhaustiva.
- El repositorio es muy reciente (creado en noviembre de 2026 según los metadatos) y no cuenta con validación de la comunidad.

## Enlaces

- [Hugging Face: GGUFGuy/gemma-nya](https://huggingface.co/GGUFGuy/gemma-nya)
- [Modelo base: unsloth/gemma-3-1b-it-unsloth-bnb-4bit](https://huggingface.co/unsloth/gemma-3-1b-it-unsloth-bnb-4bit)
- [Dataset: RaspizdAI/femboy-10k](https://huggingface.co/datasets/RaspizdAI/femboy-10k)
- [Unsloth (GitHub)](https://github.com/unslothai/unsloth)
- [TRL (Hugging Face)](https://github.com/huggingface/trl)
