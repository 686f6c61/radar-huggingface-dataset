# mradermacher/qwen3-32b-commitments-v2-sdf-GGUF

## Resumen

`mradermacher/qwen3-32b-commitments-v2-sdf-GGUF` es una recopilación de cuantizaciones estáticas en formato GGUF del modelo `joshycodes/qwen3-32b-commitments-v2-sdf`, un ajuste fino de Qwen3-32B orientado a investigación sobre "commitments" y "self-authored character" (personaje autoescrito). El modelo base parte de Qwen3-32B, un transformer denso de 32.762.123.264 parámetros (32,76 mil millones), y este repositorio lo redistribuye en 11 variantes de cuantización (desde Q2_K de 12,4 GB hasta Q8_0 de 34,9 GB) para facilitar su ejecución en hardware de consumo.

El interés de esta ficha es doble. Por un lado, documenta un caso de estudio de *model welfare* y ajuste fino con documentos sintéticos, una línea de investigación que explora cómo se comporta un modelo cuando se le dota de una identidad o conjunto de compromisos consistentes. Por otro, sirve como ejemplo práctico de cómo el ecosistema de cuantización (mradermacher) permite llevar un modelo de 32B a GPUs de consumo con pérdidas controladas de calidad.

Es importante subrayar que **no es un modelo para despliegue en producción**: la propia model card lo etiqueta como `research`, `not-for-deployment` y con licencia `research-only`. Su valor es experimental, no operativo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (heredada de Qwen3-32B); detalles internos del ajuste fino no disponibles |
| Parámetros totales | 32.762.123.264 (32,76 mil millones) |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la información proporcionada |
| Tipos de cuantización | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 (además del original F16) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | `research-only` (etiqueta `other` en Hugging Face) |
| Formato de pesos | GGUF (cuantizaciones estáticas); el modelo base original se distribuye en safetensors/transformers |
| Tamaño del repo | 224,0 GB |
| Modelo base | `joshycodes/qwen3-32b-commitments-v2-sdf` |
| Cuantizador | mradermacher |
| Fecha de creación | 2026-09-21 |
| Última actualización | 2026-10-06 |
| Descargas / likes | 218 / 0 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3-32B, un transformer denso de 32,76 mil millones de parámetros. Sobre esa base, el autor del modelo original (`joshycodes`) aplicó un ajuste fino etiquetado como `synthetic-document-finetuning` (ajuste fino con documentos sintéticos) y `self-authored-character` (personaje autoescrito), en el marco de una investigación sobre `model-welfare` (bienestar del modelo). Esto sugiere que el entrenamiento buscó dotar al modelo de un conjunto coherente de "compromisos" o una identidad estable, probablemente mediante documentos sintéticos generados para tal fin.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO, ni innovaciones técnicas específicas del ajuste fino. Tampoco se documentan detalles sobre atención lineal, decodificación especulativa u otras optimizaciones. Lo único verificable es que el repositorio de mradermacher aplica cuantización estática (sin imatrix/weighted, según indica la model card: "weighted/imatrix quants seem not to be available (by me) at this time"), lo que implica que las variantes IQ y K-quants se generaron con métodos estándar.

## Capacidades

- Generación de texto conversacional en inglés, heredada de la base Qwen3-32B.
- Razonamiento y matemáticas de nivel 32B (capacidad esperada por el tamaño, aunque no verificada con benchmarks en esta ficha).
- Generación de código (capacidad esperada de la base Qwen3, no confirmada para este ajuste).
- Soporte de tool calling / function calling: no confirmado para este ajuste fino concreto; la base Qwen3 lo soporta, pero el ajuste podría alterar el comportamiento.
- Capacidades de agente y razonamiento multi-paso: no confirmadas para este ajuste.
- Multilingüe: limitado a inglés según los metadatos del modelo.
- Capacidad especial: el ajuste está orientado a mantener "compromisos" y un "personaje autoescrito" consistente, lo que puede manifestarse en respuestas más estables en personalidad, pero es una característica de investigación, no una funcionalidad de producto.
- Modo thinking: no disponible en la información proporcionada (Qwen3 lo tiene en su versión original, pero no se confirma aquí).

## Casos de uso

- **Investigación sobre model welfare**: estudiar cómo un modelo con identidad autoescrita mantiene coherencia en conversaciones largas y si sus "compromisos" persisten ante prompts adversarios. Es el uso principal declarado por el autor.
- **Estudio de ajuste fino con documentos sintéticos**: analizar el impacto de datos sintéticos en la personalidad y estabilidad del modelo comparándolo con la base Qwen3-32B sin ajustar.
- **Evaluación de cuantizaciones GGUF**: usar las 11 variantes para medir la degradación de calidad (perplejidad, coherencia) entre Q2_K y Q8_0 en un modelo de 32B, útil para calibrar qué cuantización elegir en otros proyectos.
- **Pruebas de alineación y robustez**: someter al modelo a jailbreaks y evaluar si sus "compromisos" resisten, como caso de estudio de alineación por identidad.
- **Reproducibilidad de experimentos**: al estar disponible en GGUF, permite replicar experimentos de investigación en hardware modesto (una RTX 4090 con Q4_K_M, por ejemplo) sin necesidad de un clúster.
- **Docencia y divulgación**: ilustrar en un curso o blog cómo se cuantiza un modelo de 32B y qué trade-offs existen entre tamaño y calidad.
- **No recomendado para**: atención al cliente, generación de código en producción, agentes autónomos o cualquier despliegue comercial, dada la licencia `research-only` y la etiqueta `not-for-deployment`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye MMLU, HumanEval, GSM8K ni métricas de perplejidad comparativas entre cuantizaciones. Solo se ofrece una gráfica externa de ikawrakow sobre calidad relativa de tipos de cuantización (no específica de este modelo).

## Requisitos de hardware

- **VRAM estimada para inferencia** (según tamaño de fichero GGUF, más overhead de contexto):
  - Q2_K: ~12,4 GB → cabe en GPUs de 16 GB (RTX 4060 Ti 16GB, RTX 4070 Ti Super) con contexto moderado.
  - Q3_K_S / Q3_K_M / Q3_K_L: 14,5–17,4 GB → requiere 24 GB (RTX 3090/4090) para contexto amplio.
  - IQ4_XS / Q4_K_S / Q4_K_M: 18,0–19,9 GB → RTX 4090 (24 GB) o A100 40GB.
  - Q5_K_S / Q5_K_M: 22,7–23,3 GB → RTX 4090 al límite; mejor A100 40GB.
  - Q6_K: 27,0 GB → A100 40GB o H100.
  - Q8_0: 34,9 GB → A100 40GB (ajustado) o H100 80GB.
- **GPU recomendadas**: RTX 4090 (24 GB) para Q4/Q5; A100 40GB y H100 80GB para Q6/Q8 y contexto largo.
- **Consumer GPU**: sí, en RTX 4090 con Q4_K_M y contexto moderado; en GPUs de 16 GB solo con Q2_K/Q3_K_S y contexto reducido.
- **Opciones de despliegue**: llama.cpp, Ollama, LM Studio, text-generation-webui (todos vía GGUF). vLLM y TGI no consumen GGUF directamente; requerirían el modelo base en safetensors.
- **Latencia y throughput**: no disponibles. Como referencia cualitativa, la model card marca Q4_K_S, Q4_K_M y Q8_0 como "fast, recommended".

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| qwen3-32b-commitments-v2-sdf (este, GGUF) | 32,76B | No disponible | research-only | GGUF | Ajuste de investigación, no desplegable |
| Qwen3-32B (base original) | 32,76B | No disponible en esta ficha | Apache 2.0 (según Qwen) | safetensors, GGUF | Modelo generalista, sí desplegable |
| Otros ajustes de Qwen3-32B en GGUF | ~32,76B | Variable | Variable | GGUF | Depende del autor del ajuste |

No se dispone de datos de rendimiento comparativo (benchmarks) entre este ajuste y la base Qwen3-32B, por lo que la comparación se limita a parámetros, licencia y formato.

## Limitaciones y advertencias

- **Licencia `research-only`**: prohíbe explícitamente el uso comercial y el despliegue en producción. Cualquier uso fuera de investigación requiere contactar con el autor.
- **Etiqueta `not-for-deployment`**: el propio autor desaconseja su uso operativo.
- **Solo inglés**: no hay soporte multilingüe confirmado.
- **Riesgo de alucinación**: inherente a los modelos de 32B; el ajuste con documentos sintéticos podría aumentar la confianza en afirmaciones no verificadas.
- **Sesgos**: no documentados; los datos sintéticos pueden introducir sesgos del generador.
- **Contexto**: longitud no disponible; no asumir la ventana de Qwen3 sin verificación.
- **Cuantizaciones de baja calidad**: Q2_K y Q3_K_M están marcadas como de menor calidad; para investigación rigurosa usar Q6_K o Q8_0.
- **Sin imatrix**: las cuantizaciones son estáticas, no ponderadas, lo que puede penalizar más la calidad que las variantes imatrix.
- **Repositorio grande (224 GB)**: descargar solo la variante necesaria, no el repo completo.
- **Tool calling no confirmado**: no asumir que el ajuste preserva las capacidades de function calling de Qwen3.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/qwen3-32b-commitments-v2-sdf-GGUF
- Modelo base: https://huggingface.co/joshycodes/qwen3-32b-commitments-v2-sdf
- Página de descargas de mradermacher: https://hf.tst.eu/model#qwen3-32b-commitments-v2-sdf-GGUF
- README de referencia para GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfica de calidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantización: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de modelos de mradermacher: https://huggingface.co/mradermacher/model_requests
- nethype GmbH: https://www.nethype.de/
