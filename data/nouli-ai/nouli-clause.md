# nouli-ai/nouli-clause

## Resumen

Nouli Clause es un modelo de decisión especializado en el análisis de acuerdos de confidencialidad (NDA, *non-disclosure agreements*). Lo desarrolla Nouli AI y resuelve una tarea muy acotada: evaluar una lista fija de 17 hipótesis de NDA y devolver, para cada una, una probabilidad de implicación (*entailment*), contradicción (*contradiction*) o no mención (*not-mentioned*). No es un modelo generativo generalista, sino un clasificador de inferencia en lenguaje natural (NLI) orientado a la extracción de evidencia contractual.

Técnicamente se compone de dos etapas sobre arquitectura Ettin: un recuperador de evidencia basado en `jhu-clsp/ettin-encoder-150m` selecciona pasajes relevantes en ventanas de 512 tokens, y un codificador de decisión basado en `jhu-clsp/ettin-encoder-1b` (1.178 mil millones de parámetros) recibe hasta 1.280 tokens de entrada y emite las tres probabilidades por hipótesis. El modelo se distribuye con pesos PyTorch y un flujo de inferencia propio (CLI de Nouli), y se ejecuta localmente en CPU (macOS ARM64, Linux ARM64) o CUDA (Linux ARM64).

Su relevancia está en el nicho: automatiza la revisión de NDAs con un modelo pequeño y desplegable en local, sin depender de una API alojada. La licencia Apache-2.0 y el tamaño contenido lo hacen apto para integraciones en flujos de revisión legal, aunque su alcance está deliberadamente limitado a la checklist fija de 17 hipótesis y al idioma inglés.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder (Ettin); pipeline de dos etapas: recuperador de evidencia (Ettin-150M) + codificador de decisión (Ettin-1B) |
| Parámetros totales | 1.178 millones (modelo de decisión) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | Ventanas de evidencia de 512 tokens; entrada de decisión de 1.280 tokens |
| Tipos de cuantización | No disponible |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache-2.0, con avisos de upstream y atribución del dataset (CC-BY-4.0) |
| Formato de pesos | PyTorch (inferencia personalizada mediante CLI de Nouli); no se indica GGUF ni safetensors explícitamente |

## Arquitectura y entrenamiento

Nouli Clause es un sistema de dos componentes sobre la familia Ettin de codificadores. El primer componente, `jhu-clsp/ettin-encoder-150m`, actúa como recuperador de evidencia: selecciona pasajes candidatos del contrato en ventanas de 512 tokens. El segundo, `jhu-clsp/ettin-encoder-1b` (1.178 mil millones de parámetros), es el codificador de decisión que recibe hasta 1.280 tokens y produce, para cada una de las 17 hipótesis, las probabilidades de *entailment*, *contradiction* y *not-mentioned*. Es, por tanto, un modelo de clasificación NLI con recuperación previa, no un generador de texto.

El entrenamiento se realizó sobre el dataset `reuben256/contract-nli`, derivado de Stanford ContractNLI, con 337 contratos de entrenamiento y 5.729 decisiones de hipótesis. Se usaron las etiquetas de decisión de ContractNLI y los spans de evidencia anotados por humanos. La model card no detalla el número de tokens de entrenamiento, la composición completa del dataset ni si se aplicaron técnicas de RLHF o DPO; al ser un clasificador, no se documentan innovaciones como decodificación especulativa o atención lineal.

## Capacidades

- Clasificación NLI sobre una checklist fija de 17 hipótesis de NDA, devolviendo probabilidades de implicación, contradicción o no mención.
- Recuperación de evidencia contractual: localiza pasajes relevantes del contrato para fundamentar cada decisión.
- Salida probabilística calibrada por hipótesis, apta para umbrales configurables en producción.
- Ejecución local sin API alojada: el servidor Python carga los pesos y el CLI de Nouli orquesta el flujo de decisión.
- Soporte de CPU (macOS ARM64, Linux ARM64) y CUDA (Linux ARM64).
- No soporta *tool calling*, agentes multi-paso, visión, audio ni modo *thinking*; es un clasificador especializado.
- Multilingüe: no; únicamente inglés.

## Casos de uso

- Revisión automatizada de NDAs en bufetes y departamentos legales: el modelo evalúa las 17 hipótesis estándar y devuelve probabilidades por cláusula, lo que permite priorizar la revisión humana en los puntos con decisión ambigua.
- Triaje de contratos en procesos de *due diligence*: dado un lote de NDAs, se ejecuta el flujo sobre cada documento y se agregan las decisiones para detectar desviaciones respecto a la plantilla corporativa.
- Verificación de cumplimiento de políticas internas: se comprueba si un NDA entrante cubre las cláusulas exigidas por la organización (confidencialidad, duración, jurisdicción, etc.) mediante las hipótesis predefinidas.
- Integración en pipelines de gestión documental: el CLI y el servidor local permiten encadenar la inferencia con sistemas de almacenamiento y revisión sin enviar contratos a terceros, algo relevante por confidencialidad.
- Asistencia a abogados en la extracción de evidencia: el recuperador señala los pasajes que sustentan cada decisión, lo que acelera la localización de la cláusula concreta en contratos largos.
- Despliegue en entornos con hardware modesto: al ejecutarse en CPU sobre macOS ARM64 o Linux ARM64, es viable en estaciones de trabajo sin GPU dedicada para volúmenes moderados de contratos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye únicamente una comparación ilustrativa con Jev 1.14.0 (fechada el 31 de octubre de 2026) sobre un ejemplo seleccionado tras puntuar, en el que Nouli Clause selecciona *Supported* y Jev *full-contract, calibrated* selecciona *Contradicted* frente a la etiqueta de referencia *Supported*. El propio autor advierte que el ejemplo no es una muestra representativa; no se ofrecen métricas agregadas (exactitud, F1, etc.).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 1.178 millones de parámetros en el codificador de decisión, la inferencia en FP32 ronda los 4,7 GB de pesos (tamaño del repo), y en FP16 aproximadamente la mitad.
- GPU recomendadas: no especificadas por el autor; el modelo se ha probado en CUDA sobre Linux ARM64 (sin modelo de GPU concreto indicado).
- ¿Cabe en GPU de consumo? No confirmado por el autor; por tamaño (≈1,2 B de parámetros) es plausible en GPUs con 8-16 GB de VRAM, pero no hay validación publicada.
- Opciones de despliegue: servidor Python propio (`serve.py`) con `--device cpu` o `--device cuda`, orquestado por Nouli CLI 0.4.2; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Nouli Clause | 1.178 M (decisión) | 512 tokens (evidencia) / 1.280 tokens (decisión) | NLI sobre checklist fija de 17 hipótesis de NDA | Apache-2.0 | HuggingFace + CLI local |
| Ettin-1B (base) | 1 B | No disponible en la información | Codificador generalista | No disponible en la información | HuggingFace |
| Jev 1.14.0 | No disponible | Contrato completo | Decisión sobre NDA (comparación citada por el autor) | No disponible | No disponible |

No se dispone de datos suficientes para comparar rendimiento con alternativas; la única referencia es la comparación ilustrativa con Jev incluida en la model card.

## Limitaciones y advertencias

- Alcance restringido: solo cubre la checklist fija de 17 hipótesis de NDA; no responde preguntas arbitrarias sobre contratos.
- Los errores de recuperación afectan a las decisiones; un fallo del recuperador no implica que la afirmación esté ausente del contrato.
- Solo inglés: no se ha entrenado ni validado para otros idiomas.
- Riesgo de alucinación estructural: al ser un clasificador, el riesgo se traduce en falsos positivos o negativos en las probabilidades, no en texto inventado.
- Sesgos conocidos: no documentados por el autor; el entrenamiento sobre 337 contratos de ContractNLI puede no representar la diversidad de NDAs reales.
- Licencia Apache-2.0 permite uso comercial, pero se deben conservar los avisos de upstream y la atribución del dataset (CC-BY-4.0).
- Despliegue atado al CLI y servidor propios de Nouli; no hay soporte documentado para runtimes estándar de inferencia.
- La comparación con Jev es un ejemplo seleccionado tras puntuar y no una muestra representativa; no debe usarse como evidencia de superioridad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/nouli-ai/nouli-clause
- Sitio del autor: https://nouli.ai
- CLI de Nouli 0.4.2: https://github.com/standing-desks/nouli/releases/tag/v0.4.2
- Modelo base Ettin-1B: https://huggingface.co/jhu-clsp/ettin-encoder-1b/tree/befd76be43d08b89ff9957012f3ff29d0842780b
- Modelo base Ettin-150M: https://huggingface.co/jhu-clsp/ettin-encoder-150m/tree/45d08642849e5c5701b162671ac811b7654bfd9f
- Dataset ContractNLI (reuben256): https://huggingface.co/datasets/reuben256/contract-nli/tree/a238b4be3fa9ae91d3fbe9970383e532ae8e69c6
- Stanford ContractNLI: https://github.com/stanfordnlp/contract-nli/tree/eced6528dd3c1d14d73f9a87df8f7bdbc03126f9
- Licencia CC-BY-4.0 de ContractNLI: https://github.com/stanfordnlp/contract-nli/blob/eced6528dd3c1d14d73f9a87df8f7bdbc03126f9/LICENSE
- Evaluación registrada: eval/results.json (en el repositorio del modelo)
- Metodología: eval/protocol.json (en el repositorio del modelo)
- Detalles del ejemplo comparativo: eval/illustrative-comparison.json (en el repositorio del modelo)
- Modelos relacionados: https://huggingface.co/nouli-ai/nouli-guard, https://huggingface.co/nouli-ai/nouli-route, https://huggingface.co/nouli-ai/nouli-push, https://huggingface.co/nouli-ai/nouli-doom
