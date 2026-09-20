# Lance1573/acrouter-qwen35-08b-router-v45-reconstructed

## Resumen

`Lance1573/acrouter-qwen35-08b-router-v45-reconstructed` es un adaptador LoRA (PEFT) construido sobre el modelo base `Qwen/Qwen3.5-0.8B`, publicado por el usuario Lance1573. No es un modelo generativo independiente, sino el componente FT-LLM de un sistema de enrutado de modelos (model routing) denominado «agent-as-a-router»: el adaptador actúa como votante dentro de un ensemble que decide qué agente o modelo debe atender cada consulta.

El sistema completo de la versión v4.5 combina cuatro elementos: el votante LoRA sobre Qwen3.5-0.8B (v4), votantes estáticos, un módulo Memory-kNN online con top-10 y un prior fijo procedente de Claude Opus 4.6 con peso 1,79. Este peso se recuperó por ajuste contra el agregado archivado de la semilla 42, ya que el runner original de v4.5 y el valor exacto del prior no están disponibles; se trata por tanto de una reconstrucción ajustada a nivel agregado, no de una réplica exacta tarea a tarea.

Su relevancia es fundamentalmente metodológica y de investigación: documenta de forma reproducible un mecanismo de enrutado híbrido (votante neuronal + votantes estáticos + recuperación kNN + prior de un modelo propietario) y publica las métricas de los splits ID y OOD junto con un script de réplica. El repositorio no tiene descargas ni valoraciones y su tamaño es de 0,0 GB, lo que sugiere que solo contiene los pesos del adaptador.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre un transformer `Qwen/Qwen3.5-0.8B`; arquitectura interna del base no disponible |
| Parámetros totales | No disponible para el adaptador; modelo base de aproximadamente 0,8 B según su identificador |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (los pesos se distribuyen en safetensors como adaptador LoRA) |
| Idiomas soportados | No disponible (la model card no documenta idiomas) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors, adaptador PEFT/LoRA (librería `peft`) |
| Modelo base | Qwen/Qwen3.5-0.8B |
| Pipeline declarado | text-generation |
| Tamaño del repositorio | 0,0 GB |
| Fecha de publicación | 2026-09-20 |

## Arquitectura y entrenamiento

El repositorio contiene un adaptador LoRA etiquetado explícitamente por el autor como «component checkpoint» y no como un peso independiente de v4.5. Se corresponde con el votante v4 entrenado sobre `Qwen/Qwen3.5-0.8B`, que actúa como FT-LLM dentro de un ensemble de enrutado. La model card no detalla el número de tokens de entrenamiento, la composición del dataset, ni si hubo RLHF, DPO u otra fase de alineamiento; toda esa información consta como no disponible.

La innovación técnica descrita es el mecanismo de agregación, no el entrenamiento del adaptador: las decisiones finales se obtienen combinando la salida del votante LoRA, votantes estáticos, un índice Memory-kNN consultado online con top-10 y un prior fijo de Claude Opus 4.6 con peso 1,79. Ese peso se reconstruyó por coincidencia con el agregado archivado de la semilla 42, porque el runner original de v4.5 y el valor exacto del prior no se conservan. El autor advierte de que se trata de una reconstrucción equiparada a nivel agregado, no de una repetición exacta de las decisiones tarea a tarea, y ofrece el script `python scripts/replay_v45_ood176.py` para verificar los registros guardados del split OOD176 contra la matriz pública.

## Capacidades

- Enrutado de consultas: el adaptador funciona como votante para seleccionar el modelo o agente adecuado dentro de un sistema multi-modelo.
- Generación de texto: hereda la capacidad del modelo base Qwen3.5-0.8B al que se aplica el adaptador (pipeline declarado `text-generation`).
- Integración en ensembles: diseño explícito para combinarse con votantes estáticos y recuperación Memory-kNN top-10.
- Reproducibilidad experimental: incluye métricas por split y un script de réplica del split OOD176.
- Soporte de tool calling: no documentado en la información disponible.
- Capacidades de agente y razonamiento multi-paso: el proyecto se etiqueta como «agent-as-a-router», pero no se detallan capacidades de planificación autónoma.
- Capacidades multilingües: no disponibles.
- Capacidades especiales (modo pensamiento, visión, audio): no disponibles.

## Casos de uso

- Enrutado de peticiones en arquitecturas multi-modelo: el adaptador puntúa o clasifica la consulta entrante para derivarla al modelo especializado más adecuado, aprovechando su tamaño reducido (0,8 B) como primera etapa de bajo coste.
- Investigación reproducible sobre enrutado: el script `scripts/replay_v45_ood176.py` permite verificar las decisiones archivadas del split OOD176 contra la matriz pública, útil para replicar experimentos de selección de modelo.
- Comparación de estrategias de agregación: sirve como pieza FT-LLM para medir el efecto de añadir votantes estáticos, Memory-kNN top-10 o un prior externo frente a un votante único.
- Evaluación de generalización fuera de distribución: los splits OOD-112 y OOD-176 permiten estudiar la degradación del enrutado cuando la distribución de tareas cambia respecto al conjunto ID.
- Prototipado en hardware modesto: al combinar un base de 0,8 B con un adaptador LoRA, el sistema puede ejecutarse en equipos sin GPU dedicada para experimentos de enrutado.
- Componente de ablación en estudios de destilación o imitación de prior: el mecanismo reconstruido permite analizar cuánto aporta un prior fijo de un modelo propietario frente a votantes entrenados localmente.
- Base para fine-tuning posterior: al ser un adaptador PEFT, puede reentrenarse o sustituirse sin tocar los pesos del modelo base en flujos de experimentación.

## Benchmarks y rendimiento

Los únicos resultados publicados en la información disponible corresponden al sistema v4.5 reconstruido en su conjunto (votante LoRA + votantes estáticos + Memory-kNN + prior), no al adaptador de forma aislada:

| Split | Resultado |
|---|---:|
| ID (n=2919) | 48,59 ± 0,04 % |
| OOD-112 | 63,75 ± 0,46 % |
| OOD-176 | 63,07 ± 0,85 % |

No se han publicado en la información disponible resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) ni comparaciones con modelos similares.

## Requisitos de hardware

- VRAM estimada para inferencia (estimación a partir del tamaño del base, no confirmada por el autor): en torno a 1,6-2 GB en FP16 para el conjunto base de 0,8 B más el adaptador; aproximadamente 1 GB en INT8 y 0,5-0,6 GB en cuantización de 4 bits.
- GPU recomendadas: no disponibles. Por tamaño, el conjunto cabe en cualquier GPU consumer con 4 GB o más de VRAM (por ejemplo, GTX 1650, RTX 3050, RTX 4060) y en GPUs de datacenter como A100 o H100 sin aprovechar su capacidad.
- Cabe en GPU consumer: sí, previsiblemente en cualquier modelo con al menos 4 GB de VRAM; también es viable en CPU para inferencia puntual.
- Opciones de despliegue: `transformers` + `peft` para cargar el adaptador sobre el base; vLLM y TGI admiten adaptadores LoRA; para llama.cpp u Ollama sería necesario fusionar el adaptador con el base y convertir los pesos a GGUF.
- Latencia y throughput estimados: no disponibles. El autor no publica mediciones de rendimiento en inferencia.

## Comparativa con modelos similares

No se dispone de datos comparativos en la información proporcionada. La tabla siguiente recoge únicamente los campos conocidos y los que quedan sin determinar:

| Modelo | Parámetros | Contexto | Licencia | Formato | Resultados públicos |
|---|---|---|---|---|---|
| acrouter-qwen35-08b-router-v45-reconstructed | Adaptador sobre base de ~0,8 B | No disponible | apache-2.0 | safetensors (LoRA/PEFT) | ID 48,59 %; OOD-112 63,75 %; OOD-176 63,07 % (sistema completo) |
| Qwen/Qwen3.5-0.8B (modelo base) | ~0,8 B | No disponible | No disponible | No disponible | No disponible |
| Otros modelos de enrutado de tamaño similar | No disponible | No disponible | No disponible | No disponible | No disponible |

Advertencia: las cifras de la primera fila corresponden al ensemble v4.5 reconstruido, no al adaptador evaluado de forma independiente, por lo que no son directamente comparables con las de un clasificador o enrutador autónomo.

## Limitaciones y advertencias

- La publicación es una reconstrucción equiparada a nivel agregado, no una réplica exacta del runner original de v4.5; el peso del prior (1,79) se infirió por coincidencia con el agregado de la semilla 42.
- Las métricas publicadas describen el sistema completo, no el adaptador aislado; usarlas como rendimiento del checkpoint sería incorrecto.
- El resultado en el split ID (48,59 %) es sensiblemente inferior al de los splits OOD, un patrón poco habitual que conviene interpretar con cautela y que depende del número de clases del enrutador, dato no disponible.
- El mecanismo reconstruido incorpora un prior derivado de un modelo propietario (Claude Opus 4.6), lo que introduce una dependencia externa difícil de reproducir de forma independiente.
- No hay información sobre sesgos, tasas de alucinación ni evaluaciones de seguridad.
- No se documentan idiomas soportados ni cobertura multilingüe; cabe esperar un comportamiento predominantemente anglófono, pero no está confirmado.
- Adopción nula verificable: 0 descargas y 0 likes en el momento de la consulta, sin validación por terceros.
- El tamaño del repositorio figura como 0,0 GB, lo que puede indicar que los pesos no están efectivamente alojados o que son de tamaño despreciable; conviene verificar la integridad de los ficheros antes de usarlo.
- La licencia apache-2.0 se aplica a este repositorio, pero el uso comercial del conjunto depende también de la licencia del modelo base `Qwen/Qwen3.5-0.8B`, no especificada aquí.
- No se documentan requisitos de hardware ni rendimiento en producción; las estimaciones de VRAM de esta ficha son deducciones a partir del tamaño del modelo base.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Lance1573/acrouter-qwen35-08b-router-v45-reconstructed
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Script de réplica incluido en el repositorio: `scripts/replay_v45_ood176.py`
- La búsqueda web no devolvió resultados relevantes sobre este modelo: los enlaces encontrados trataban de contenidos no relacionados (foros en chino sobre meses del año y símbolos tipográficos, hilos sobre 7-Zip y sobre la saga de videojuegos «三国群英传», y una consulta sobre un objeto de World of Warcraft), por lo que se omiten por no aportar información verificable sobre el modelo.
