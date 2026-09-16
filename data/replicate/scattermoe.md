# replicate/scattermoe

## Resumen

`replicate/scattermoe` no es un modelo de lenguaje, sino un paquete de kernels publicado en Hugging Face Hub bajo la librería `kernels`. Se trata de un espejo del repositorio `kernels-community/scattermoe`, reconstruido automáticamente para poder invocarse desde la librería `kernels` mediante `get_kernel("kernels-community/scattermoe")`. Expone funciones orientadas a la computación eficiente de capas de mezcla de expertos dispersa (*sparse mixture-of-experts*): `flatten_sort_count`, `parallel_linear`, `ParallelExperts`, `parallel_experts` y `kernels`.

Su relevancia actual deriva del auge de arquitecturas MoE, donde el coste dominante no está en los pesos totales sino en cómo se agrupan y despachan los tokens a cada experto. Los kernels de tipo scatter/gather permiten procesar únicamente los tokens asignados a cada experto, evitando el relleno (*padding*) hasta una capacidad fija y reduciendo el trabajo redundante. La ficha del repositorio indica 0 descargas y 0 *likes*, sin pipeline asociado, licencia Apache-2.0 y sin datos de idiomas publicados.

La model card incluye un aviso relevante: a partir del 13 de septiembre de 2026 se retirarán los repositorios de tipo "model" de kernels (por ejemplo, `kernels-community/flash-attn3`), por lo que se recomienda usar siempre la versión más reciente de la librería `kernels` y reportar cualquier interrupción en su *issue tracker*. Esto convierte al paquete en una dependencia de bajo nivel más que en un artefacto entrenado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Kernels CUDA para capas de mezcla de expertos dispersa (rutas `parallel_linear` / `ParallelExperts`); no es un transformer, SSM ni modelo híbrido |
| Parámetros totales | No aplica: no es un modelo con pesos, es una librería de kernels |
| Parámetros activos | No aplica (no es MoE de pesos, es kernel para MoE) |
| Longitud de contexto | No aplica |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No aplica (no procesa lenguaje natural) |
| Licencia | apache-2.0 |
| Formato de pesos | No aplica; se distribuye como paquete de kernels consumible con `kernels.get_kernel` (no safetensors ni GGUF) |
| ID en Hugging Face | replicate/scattermoe |
| Autor | replicate |
| Librería declarada | kernels |
| Pipeline | No disponible |
| Descargas | 0 |
| Likes | 0 |
| Fecha de creación | 2026-09-16 |
| Última actualización | 2026-09-16 |
| Región | us |
| Funciones exportadas | `flatten_sort_count`, `parallel_linear`, `ParallelExperts`, `parallel_experts`, `kernels` |

## Arquitectura y entrenamiento

No hay proceso de entrenamiento: se trata de código de cómputo de bajo nivel. La API expuesta sugiere una implementación de capas MoE basada en operaciones de dispersión y recolección (*scatter/gather*): `flatten_sort_count` se encarga del aplanado, la ordenación y el conteo de tokens por experto, mientras que `parallel_linear` y `ParallelExperts` / `parallel_experts` materializan la multiplicación lineal agrupada por experto. Este esquema es el que evita reservar capacidad fija por experto y ejecuta el *GEMM* únicamente sobre los tokens realmente enrutados a cada uno.

La información proporcionada no detalla el lenguaje de implementación, la versión de CUDA soportada, la composición del *dataset* (no aplica), ni si hubo RLHF o DPO (no aplica). Tampoco se documentan innovaciones adicionales como decodificación especulativa o atención lineal, ya que el alcance del paquete es exclusivamente la capa MoE. La model card es autogenerada y no incluye notas de diseño, changelog ni referencia al paper original.

## Capacidades

- Ejecución de la ruta de dispersión y conteo de tokens por experto mediante `flatten_sort_count`.
- Multiplicación lineal agrupada por experto mediante `parallel_linear` y `parallel_experts`.
- Exposición de una clase de capa reutilizable (`ParallelExperts`) para integrarla en bloques MoE de modelos propios.
- Carga como módulo de kernel desde el Hub con `from kernels import get_kernel` y `get_kernel("kernels-community/scattermoe")`.
- Aceleración en GPU de la fase de enrutado y cómputo de expertos en arquitecturas MoE.
- No dispone de generación de texto, razonamiento, código, matemáticas ni visión.
- No soporta *tool calling*, *function calling* ni flujos de agentes.
- No tiene capacidades multilingües: no es un modelo de lenguaje.
- No ofrece modo de pensamiento (*thinking*), audio ni entrada multimodal.

## Casos de uso

- Entrenamiento de modelos MoE a gran escala: el kernel sustituye la capa de expertos del bloque MoE y evita el relleno de tokens hasta una capacidad fija, lo que reduce el número de operaciones efectivas por paso y permite aumentar el número de expertos sin escalar proporcionalmente el coste de cómputo.
- Inferencia de modelos MoE ya entrenados: al integrarse como capa de expertos, permite servir modelos con enrutado disperso reduciendo el trabajo desperdiciado en expertos sin tokens asignados.
- Integración en *pipelines* de investigación sobre enrutado: `flatten_sort_count` devuelve el conteo de tokens por experto, un dato directo para medir desbalanceo de carga y ajustar funciones de *auxiliary loss* o estrategias de *capacity factor*.
- Sustitución de kernels en código existente: cualquier proyecto que ya use una abstracción `parallel_experts` puede cambiar de implementación apuntando a este paquete mediante `kernels.get_kernel`, sin reescribir la lógica del modelo.
- Fine-tuning con paralelismo de expertos: la capa `ParallelExperts` se puede insertar en un modelo en entrenamiento para repartir el cómputo de expertos entre dispositivos.
- Pruebas de reproducibilidad y evaluación de kernels: sirve como referencia para comparar el rendimiento de distintas implementaciones de capas MoE en la misma GPU y con la misma carga de tokens.
- Prototipado rápido en *notebooks*: al instalarse con `pip install -U kernels`, se puede experimentar con la capa MoE sin compilar CUDA manualmente.

Se advierte de que estos casos describen el uso previsto del kernel dentro de un sistema mayor; el paquete por sí solo no resuelve ninguna tarea de usuario final.

## Benchmarks y rendimiento

La model card indica literalmente: "No benchmark available yet". No se han publicado resultados de benchmarks en la información disponible, ni comparativas de latencia, *throughput* o consumo de memoria frente a otras implementaciones de MoE.

## Requisitos de hardware

- Al ser un kernel CUDA, requiere GPU NVIDIA con un *toolkit* CUDA compatible; la información disponible no especifica la versión mínima ni las arquitecturas soportadas (por ejemplo, Ampere, Hopper o Blackwell): no disponible.
- VRAM estimada para inferencia: no aplica al propio kernel; depende por completo del modelo MoE que lo utilice (número de expertos, dimensión oculta, tamaño de lote y precisión).
- GPU recomendadas: no disponible en la información proporcionada.
- Compatibilidad con GPU de consumo: no disponible; el kernel no reserva pesos, pero su viabilidad en tarjetas como la RTX 4090 depende del modelo huésped.
- Opciones de despliegue: instalación vía `pip install -U kernels` y carga con `kernels.get_kernel("kernels-community/scattermoe")`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Alternativa | Categoría | Función principal | Licencia | Benchmarks publicados |
|---|---|---|---|---|
| replicate/scattermoe | Kernels CUDA para capas MoE dispersas | `flatten_sort_count`, `parallel_linear`, `ParallelExperts` | Apache-2.0 | No disponible |
| Megablocks | Kernels para MoE disperso | GEMM agrupado para expertos | No disponible en la información proporcionada | No disponible |
| Tutel | Librería de kernels y comunicación para MoE | Capas MoE y paralelismo de expertos | No disponible en la información proporcionada | No disponible |

No se dispone de datos de rendimiento comparativos entre estas opciones en la información proporcionada, por lo que la tabla solo refleja la categoría funcional y, cuando consta, la licencia.

## Limitaciones y advertencias

- No es un modelo: no genera texto, no razona y no puede evaluarse con MMLU, HumanEval o GSM8K.
- Ausencia total de validación comunitaria: 0 descargas y 0 *likes* en el momento de la consulta, sin benchmarks ni informes de terceros.
- Model card autogenerada: no incluye notas de diseño, limitaciones conocidas ni *changelog*.
- Dependencia de CUDA y de GPU NVIDIA; no hay ruta de ejecución en CPU documentada.
- Dependencia de la librería `kernels` y de su formato de carga; la propia model card avisa de que los repositorios de tipo "model" de kernels se retirarán a partir del 13 de septiembre de 2026, por lo que fijar una versión antigua puede provocar interrupciones.
- Es un espejo del repositorio `kernels-community/scattermoe`: la autoría real y el mantenimiento corresponden a la comunidad de kernels, no necesariamente al usuario `replicate`.
- Licencia Apache-2.0: permite uso comercial y modificaciones, siempre que se conserven los avisos de copyright y licencia y se documenten los cambios; no incluye garantías.
- Riesgo de alucinación, sesgos de idioma o limitaciones de contexto: no aplica, al no ser un modelo generativo.
- Sin datos sobre tipos de cuantización soportados ni sobre precisión numérica (fp16, bf16, fp8), lo que impide garantizar su comportamiento en *pipelines* de inferencia cuantizada.
- No se documentan requisitos de versión de PyTorch, CUDA ni del *driver* de NVIDIA.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/replicate/scattermoe
- Repositorio original del kernel: https://huggingface.co/kernels-community/scattermoe
- Librería `kernels`: https://github.com/huggingface/kernels
- Incidencias de kernels en Hugging Face: https://github.com/huggingface/kernels/issues/new
- Replicate: https://replicate.com/
- Explorador de modelos de Replicate: https://replicate.com/explore
- Organización de Replicate en GitHub: https://github.com/replicate
