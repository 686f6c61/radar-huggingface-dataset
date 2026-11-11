# gagan-devv/verity-deberta-v3-base-fever

## Resumen

Verity DeBERTa-v3 Base FEVER es un modelo de clasificación de texto para verificación de hechos (fact-checking), desarrollado por el usuario gagan-devv. Se trata de un ajuste fino de `microsoft/deberta-v3-base` sobre 60.000 afirmaciones balanceadas del conjunto de datos FEVER, con el objetivo de clasificar una afirmación junto con su evidencia en tres categorías: verdadera, falsa o no verificable (NEI, Not Enough Information).

El modelo resuelve una tarea concreta y acotada: dado un par `[CLAIM] ... [EVIDENCE] ...`, determinar la relación de veracidad entre ambos. No es un modelo generativo ni un asistente conversacional, sino un clasificador discriminativo de 184 millones de parámetros con licencia MIT, lo que facilita su integración en pipelines de verificación automatizada.

Su relevancia radica en la combinación de un backbone contrastado (DeBERTa-v3) con un ajuste específico sobre FEVER y unas métricas de validación declaradas por el autor (92,07 % de accuracy y Macro-F1 de 0,9203). No obstante, la información publicada es limitada: no hay detalles sobre hiperparámetros, composición exacta del dataset ni resultados en el conjunto de test oficial de FEVER.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DeBERTa-v3 base) |
| Parametros totales | 184.424.451 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos en safetensors; compatible con text-embeddings-inference) |
| Idiomas soportados | Ingles (en) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `microsoft/deberta-v3-base`, un transformer encoder con atención desacoplada (disentangled attention) que separa las representaciones de contenido y posición, y con una capa de embeddings mejorada respecto a DeBERTa v2. Sobre esta base se ha realizado un ajuste fino supervisado para clasificación de tres clases (True, False, NEI) usando pares de afirmación y evidencia como entrada.

Según la model card, el entrenamiento empleó 60.000 afirmaciones balanceadas del dataset FEVER. No se especifican hiperparámetros, número de épocas, estrategia de tokenización del par claim/evidence, ni si se aplicó alguna técnica adicional como aumento de datos o ponderación de clases. Tampoco se documenta el uso de RLHF/DPO, algo esperable en un modelo discriminativo de este tipo.

La innovación técnica es limitada: se trata de un ajuste fino estándar sobre un backbone conocido, sin modificaciones arquitectónicas propias ni mecanismos especiales de decodificación (no aplica, al no ser generativo).

## Capacidades

- Clasificación de relaciones de veracidad entre una afirmación y una evidencia en tres etiquetas: True, False y NEI.
- Detección de afirmaciones no verificables por falta de evidencia suficiente.
- Procesamiento de pares claim/evidence en un único paso de inferencia.
- Compatibilidad con `text-embeddings-inference` y endpoints compatibles según los tags del repositorio.
- Idioma: únicamente inglés.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso.
- No dispone de modo thinking, visión, audio ni generación de texto libre.

## Casos de uso

- Verificación automatizada de afirmaciones en medios: dado un claim extraído de un artículo y una evidencia recuperada de una base documental, el modelo clasifica la relación y permite filtrar bulos antes de publicación.
- Moderación de contenido en plataformas: integrado en un pipeline de detección de desinformación, clasifica pares claim/evidencia para marcar publicaciones potencialmente falsas.
- Asistencia a verificadores humanos: como primera pasada sobre candidatos recuperados por un sistema RAG, reduce el volumen de pares que un periodista debe revisar manualmente.
- Enriquecimiento de bases de conocimiento: clasificar automáticamente relaciones entre afirmaciones y fuentes para poblar grafos de hechos verificados.
- Evaluación de calidad de respuestas de LLM: comprobar si la evidencia citada por un modelo generativo respalda la afirmación emitida (True/False/NEI).
- Investigación en NLP: modelo base para experimentos de fact-checking en inglés, con licencia MIT que facilita su uso académico y comercial.

## Benchmarks y rendimiento

| Metrica | Valor (validacion) |
|---|---|
| Accuracy | 92,07 % |
| Macro-F1 | 0,9203 |
| F1 (True) | 0,9403 |
| F1 (False) | 0,9217 |
| F1 (NEI) | 0,8988 |

No se han publicado resultados en el conjunto de test oficial de FEVER ni comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,75 GB de pesos, más overhead de activaciones; en la práctica, menos de 2 GB para lotes pequeños.
- VRAM estimada en fp16/bf16: alrededor de 0,4 GB de pesos.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; RTX 3060, RTX 4090, A100 o H100 son suficientes y sobredimensionadas para esta tarea.
- Cabe holgadamente en GPU de consumo, incluidas GTX 1650 o superiores.
- Opciones de despliegue: transformers, text-embeddings-inference, endpoints compatibles; también puede exportarse a ONNX para inferencia en CPU.
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño y la tarea, se espera un throughput alto en GPU y aceptable en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Verity DeBERTa-v3 Base FEVER | 184 M | No disponible | Clasificacion FEVER (3 clases) | MIT | Hugging Face |
| microsoft/deberta-v3-base | 184 M | 512 tokens (estandar del backbone) | Modelo base, sin ajuste FEVER | MIT | Hugging Face |
| Modelos NLI tipo RoBERTa-large-MNLI | ~355 M | 512 tokens | Inferencia textual (3 clases) | MIT | Hugging Face |

No se dispone de datos de rendimiento comparativos publicados en la información proporcionada para establecer una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- Solo soporta inglés; no hay capacidades multilingües.
- Es un clasificador de tres clases, no un generador: no produce explicaciones ni texto.
- Las métricas declaradas corresponden a validación, no al test oficial de FEVER; pueden no ser representativas del rendimiento real.
- Riesgo de sesgo heredado de FEVER y de DeBERTa-v3, incluyendo sesgos de dominio y de anotación del dataset.
- Riesgo de alucinación no aplica en sentido generativo, pero sí de clasificaciones erróneas en evidencia ambigua o contradictoria.
- El autor no documenta hiperparámetros ni detalles del entrenamiento, lo que dificulta la reproducibilidad.
- Licencia MIT permite uso comercial, pero se recomienda verificar las condiciones de los datos FEVER subyacentes.
- Para producción, conviene validar el modelo en el dominio específico antes de desplegarlo, dado el escaso historial de uso (46 descargas, 0 likes).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/gagan-devv/verity-deberta-v3-base-fever
- Modelo base: https://huggingface.co/microsoft/deberta-v3-base
- Dataset FEVER: https://fever.ai/
