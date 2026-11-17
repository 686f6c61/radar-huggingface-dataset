# GRBartho/rpg-intent-classifier

## Resumen

GRBartho/rpg-intent-classifier es un modelo de clasificación de texto publicado en Hugging Face por el usuario GRBartho. Por su nombre y su pipeline (`text-classification`), está orientado a la detección de intenciones (intent classification) en el dominio de los juegos de rol (RPG), presumiblemente para interpretar comandos o acciones del jugador en lenguaje natural dentro de una aplicación o asistente conversacional de rol.

El modelo está construido sobre la arquitectura RoBERTa, según la etiqueta `roberta` del repositorio, y cuenta con 82.127.628 parámetros en formato safetensors, lo que corresponde a la configuración base de RoBERTa (12 capas, 768 dimensiones ocultas). El repositorio ocupa 0,3 GB. Se distribuye con la librería `transformers` y es compatible con Text Embeddings Inference y con endpoints de Hugging Face.

La relevancia de esta ficha es limitada desde el punto de vista técnico: la model card es una plantilla autogenerada sin información sustantiva sobre datos de entrenamiento, evaluación, licencia o idiomas. Todas las secciones de la model card original aparecen como "[More Information Needed]". Por tanto, los datos que se ofrecen a continuación proceden exclusivamente de los metadatos del repositorio y de la inferencia razonable a partir de la arquitectura y el nombre del modelo; cualquier otro dato se marca como no disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | RoBERTa (transformer encoder, según etiqueta del repositorio) |
| Parámetros totales | 82.127.628 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (RoBERTa base admite típicamente 512 tokens; no confirmado por el autor) |
| Tipos de cuantización | no disponible (pesos en safetensors; cuantización dinámica posible vía herramientas estándar) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Pipeline | text-classification |
| Tamaño del repositorio | 0,3 GB |
| Compatibilidad de despliegue | transformers, Text Embeddings Inference, endpoints compatibles |

## Arquitectura y entrenamiento

La etiqueta `roberta` del repositorio indica que el modelo se basa en la arquitectura RoBERTa, un transformer encoder bidireccional derivado de BERT con preentrenamiento mejorado (eliminación del objetivo NSP, mascarado dinámico y mayor volumen de datos). El recuento de 82.127.628 parámetros coincide con el tamaño de RoBERTa base más una cabeza de clasificación, lo que sugiere un fine-tuning sobre el checkpoint preentrenado para una tarea de clasificación de intenciones.

No hay información disponible sobre el conjunto de datos de entrenamiento, el número de tokens, la composición del corpus, el número de clases de intención, ni sobre si se aplicaron técnicas de ajuste como RLHF o DPO (poco habituales en modelos encoder de clasificación). Tampoco se documentan hiperparámetros, régimen de precisión ni procedimiento de preprocesado. La model card no aporta ninguna innovación técnica destacable.

## Capacidades

- Clasificación de texto: asigna una etiqueta de intención a una secuencia de entrada, según el pipeline declarado.
- Especialización de dominio: por el nombre del modelo, está orientado a intenciones dentro de juegos de rol (comandos de acción, diálogo con NPC, gestión de inventario, combate, etc.), aunque el conjunto exacto de clases no está documentado.
- Inferencia de embeddings de texto: al ser un encoder, puede emplearse para representaciones vectoriales, aunque no es su objetivo declarado.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso ni modo thinking.
- No se documentan capacidades multimodales (visión, audio) ni multilingües.

## Casos de uso

- Interpretación de comandos de jugador en un RPG de texto: el modelo clasificaría frases como "ataco al goblin" o "abro el cofre" en intenciones predefinidas (combate, interacción con objetos, movimiento), permitiendo al motor del juego despachar la acción correspondiente.
- Enrutado de diálogo con NPC: dado un mensaje del jugador, clasificar la intención (preguntar, negociar, amenazar, despedirse) para seleccionar la respuesta adecuada en un sistema de diálogo basado en árboles o en un LLM generativo.
- Asistente de mesa virtual para partidas de rol de mesa: procesar las declaraciones de los jugadores y mapearlas a acciones mecánicas del sistema de reglas, reduciendo la carga del director de juego.
- Preprocesado en pipelines híbridos: usar el clasificador como etapa barata de enrutado antes de invocar un LLM generativo, reduciendo coste y latencia en aplicaciones conversacionales de rol.
- Moderación o filtrado de comandos: detectar intenciones no permitidas o fuera de alcance en un entorno de juego multijugador.
- Etiquetado y análisis de logs de partidas: clasificar transcripciones de sesiones de rol para extraer estadísticas de comportamiento de los jugadores (frecuencia de combate, exploración, interacción social).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,33 GB de pesos (82 M de parámetros × 4 bytes), más activaciones y overhead del runtime; en la práctica cabe holgadamente en cualquier GPU con 2 GB o más.
- VRAM estimada en fp16: alrededor de 0,17 GB de pesos; en CPU la inferencia es viable con latencias de pocos milisegundos por secuencia corta.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) es sobradamente suficiente; también tarjetas de gama de entrada y GPUs de datacenter (T4, A10, A100, H100) sin problema.
- Cabe en GPU consumer: sí, en la práctica totalidad del mercado actual, e incluso en dispositivos de borde con CPU.
- Opciones de despliegue: `transformers` (PyTorch), Text Embeddings Inference (TEI), endpoints compatibles de Hugging Face; también es posible exportarlo a ONNX o cuantizarlo dinámicamente con herramientas estándar para reducir aún más el footprint.
- Latencia y throughput: no disponibles; por el tamaño del modelo, se espera un throughput alto (cientos o miles de secuencias por segundo en GPU para entradas cortas), pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GRBartho/rpg-intent-classifier | 82,1 M | no disponible | Clasificación de intenciones RPG | no disponible | Hugging Face |
| roberta-base | 125 M | 512 tokens | MLM / base para fine-tuning | MIT | Hugging Face |
| distilbert-base-uncased | 66 M | 512 tokens | MLM / base para fine-tuning | Apache 2.0 | Hugging Face |
| bert-base-uncased | 110 M | 512 tokens | MLM / base para fine-tuning | Apache 2.0 | Hugging Face |

La comparativa es aproximada: los tres modelos de referencia son checkpoints preentrenados genéricos, no clasificadores de intenciones de rol, y no se dispone de métricas del modelo evaluado para establecer una comparación de rendimiento. El recuento de 82,1 M de parámetros sugiere una variante de RoBERTa distinta del base estándar (125 M), posiblemente una versión destilada o con vocabulario reducido, aunque el autor no lo especifica.

## Limitaciones y advertencias

- La model card es una plantilla autogenerada: no hay información sobre datos de entrenamiento, sesgos, evaluación ni uso previsto, lo que impide validar su calidad de forma objetiva.
- Licencia no disponible: no se puede confirmar el uso comercial; en ausencia de licencia explícita, debe asumirse que los derechos no están concedidos y contactar con el autor antes de usarlo en producción.
- Idiomas no declarados: si el entrenamiento fue solo en inglés (lo habitual en RoBERTa), el rendimiento en castellano u otros idiomas será probablemente deficiente.
- Riesgo de sobreajuste al dominio: al estar especializado en intenciones de RPG, su comportamiento fuera de ese vocabulario será impredecible.
- Riesgo de alucinación conceptual: al ser un clasificador, no genera texto, pero puede asignar etiquetas erróneas con alta confianza en entradas ambiguas o fuera de distribución.
- Sin métricas publicadas: no se puede estimar la precisión, el recall ni la matriz de confusión por clase; cualquier despliegue en producción requiere una evaluación propia.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de uso comunitario ni de validación externa.
- El conjunto de etiquetas de salida no está documentado, lo que obliga a inspeccionar `config.json` para conocer las clases.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/GRBartho/rpg-intent-classifier
- Paper de referencia de RoBERTa (citado en las etiquetas): https://arxiv.org/abs/1907.11692
- Paper del cálculo de impacto ambiental citado en la model card: https://arxiv.org/abs/1910.09700
- Calculadora ML Impact: https://mlco2.github.io/impact
- Documentación de Text Embeddings Inference: https://github.com/huggingface/text-embeddings-inference
- Documentación de transformers: https://huggingface.co/docs/transformers
