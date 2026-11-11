# luisbrel/proto-nemotron

## Resumen

Proto-Nemotron es un checkpoint de investigación publicado por el usuario independiente luisbrel en Hugging Face. Se presenta como una arquitectura híbrida de tipo Mamba-2 (State-Space Model) combinada con un Mixture-of-Experts (MoE) disperso, con 31.577.940.288 parámetros totales según los pesos en safetensors (aproximadamente 30B) y un régimen de activación de 4,25B parámetros por token con k=8 expertos activos. El modelo está empaquetado en formato MLX y cuantizado a 4 bits, orientado explícitamente a inferencia nativa en Apple Silicon.

El modelo se distribuye bajo licencia Apache 2.0 y declara capacidades de razonamiento, razonamiento espacial, código, matemáticas y orquestación de agentes con tool calling. Su propuesta diferencial es la modulación dinámica del número de expertos activos (k) en tiempo de inferencia, lo que permite intercambiar capacidad por velocidad sin cambiar de checkpoint.

Es relevante ahora porque explora una ruta poco habitual: pesos híbridos SSM+MoE ejecutables en hardware de consumo Apple con decodificación superior a 100 tok/s, y porque su model card publica comparativas empíricas frente a una "arquitectura base 30B MoE" no identificada. No obstante, se trata de un checkpoint de investigación con cero descargas y cero likes en el momento de la ficha, sin paper asociado ni evaluación independiente.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Híbrida Mamba-2 (state-space) + Mixture-of-Experts disperso (128 expertos enrutados + 1 compartido) |
| Parámetros totales | 31.577.940.288 (~30B) |
| Parámetros activos | 4,25B con k=8 (3,45B MoE + 0,8B no-MoE); 2,18B con k=2; 4,94B con k=10 |
| Longitud de contexto | no disponible |
| Tipos de cuantización | 4 bits (formato publicado); no se documentan otras variantes |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors en formato MLX (librería `mlx`) |

## Arquitectura y entrenamiento

La arquitectura combina capas de espacio de estados Mamba-2 con capas MoE dispersas. El modelo declara 128 expertos enrutados más un experto compartido, con enrutamiento dinámico que permite fijar el número de expertos activos por token (k) en tiempo de inferencia. Según la model card, el checkpoint se obtiene mediante "optimización geométrica de pesos multi-etapa y alineación de representaciones" sobre una arquitectura base 30B MoE, preservando lo que el autor denomina "anclas de razonamiento fundacionales" sin regresión. No se especifica el número de tokens de entrenamiento, la composición del dataset, ni si hubo RLHF, DPO u otra fase de alineación.

La innovación declarada es doble: por un lado, el escalado dinámico de capacidad activa (k=2 a k=10) con penalización de latencia moderada; por otro, el soporte opcional de "cartuchos de habilidad" de bajo rango (Weight-Space Skill Compilation, WSSC) que se montarían de forma sub-milisegundo sobre el checkpoint base. Ninguno de estos mecanismos está documentado con detalle técnico, hiperparámetros ni código de entrenamiento en la información disponible. El modelo se distribuye cuantizado a 4 bits para MLX, lo que sugiere que el checkpoint publicado es una conversión para inferencia y no los pesos completos en precisión original.

## Capacidades

- Generación de texto conversacional y razonamiento multi-paso.
- Razonamiento científico de nivel graduado (la model card cita GPQA Diamond).
- Matemáticas de competición (AIME 2024, GSM8K).
- Síntesis de código algorítmico y de concurso (HumanEval+, LiveCodeBench).
- Tool calling y orquestación multi-herramienta con estructura DAG (agentic tool calling).
- Razonamiento simbólico y deducción booleana (BIG-bench Hard).
- Razonamiento espacial y generación de gráficos vectoriales (XML/SVG con planificación de coordenadas).
- Modulación dinámica de capacidad activa mediante el parámetro k del router.
- Montaje opcional de cartuchos de habilidad de bajo rango (WSSC).
- Capacidades multilingües: no disponible.

## Casos de uso

- Asistencia de código en local sobre Mac: el modelo corre en MLX con decodificación de ~128 tok/s en un M4 Max, lo que permite usarlo como asistente de programación interactivo sin conexión a la nube, aprovechando su rendimiento declarado en HumanEval+ y LiveCodeBench.
- Orquestación de agentes con múltiples herramientas: la model card reporta un 100% en su suite de agentic tool calling, por lo que encaja en pipelines donde el modelo debe encadenar llamadas a APIs en forma de DAG (búsqueda, cálculo, ejecución de código).
- Razonamiento científico y técnico asistido: con GPQA Diamond declarado en 86,7%, es adecuado para prototipos de tutoría o revisión de hipótesis en dominios de posgrado, siempre con verificación humana dada la ausencia de evaluación independiente.
- Generación de gráficos vectoriales y diagramas: su capacidad declarada de producir XML/SVG sintácticamente válido con articulación cinemática permite generar diagramas técnicos, iconos o ilustraciones simples por código.
- Experimentación en investigación sobre MoE dinámico: el parámetro k ajustable en inferencia lo convierte en una plataforma para estudiar el compromiso capacidad/latencia sin reentrenar.
- Despliegue en estaciones de trabajo Apple Silicon: con 17,8 GB de repo en 4 bits, cabe en Macs con 32 GB o más de memoria unificada, habilitando inferencia privada en escritorio para prototipos de agentes y chat técnico.
- Evaluación de robustez y guardrails: la model card documenta pruebas adversariales (roleplay, suplantación de credenciales, inyección de delimitadores), útil como banco de pruebas para estudiar refusal behavior.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card, medidos en Apple Silicon M4 Max (128 GB, MLX Metal) sobre "200+ muestras estandarizadas" y comparados con una "arquitectura base 30B MoE" no identificada. No proceden de evaluación independiente.

| Benchmark | Dominio | Base 30B MoE | Proto-Nemotron | Delta |
|---|---|---|---|---|
| GPQA Diamond | Ciencia de posgrado | 54,0% | 86,7% | +32,7 |
| Agentic Tool Calling | Orquestación multi-herramienta | 90,0% | 100,0% | +10,0 |
| AIME 2024 | Matemáticas de olimpiada | 3,3% | 13,3% | +10,0 |
| LiveCodeBench | Código de concurso | 95,0% | 100,0% | +5,0 |
| HumanEval+ | Python algorítmico (pass@1) | 90,0% | 93,3% | +3,3 |
| BIG-bench Hard | Deducción simbólica | 76,0% | 80,0% | +4,0 |
| GSM8K | Razonamiento multi-paso | 96,0% | 98,0% | +2,0 |
| IFEVAL | Seguimiento de instrucciones | 100,0% | 100,0% | 0,0 |
| ARC Challenge | Abstracción científica | 90,0% | 90,0% | 0,0 |

Rendimiento de decodificación declarado en M4 Max según k:

| Régimen | Expertos activos | Activos totales | Velocidad |
|---|---|---|---|
| k=2 | 2/128 | 2,18B | 171,4 tok/s |
| k=6 | 6/128 | 3,56B | 139,7 tok/s |
| k=8 | 8/128 | 4,25B | 127,9 tok/s |
| k=10 | 10/128 | 4,94B | 116,2 tok/s |

## Requisitos de hardware

- VRAM/memoria: el repo ocupa 17,8 GB en 4 bits; se necesita al menos ~18-20 GB de memoria unificada libre para cargar los pesos, más overhead de KV cache y contexto.
- Hardware objetivo: Apple Silicon con MLX. La model card cita un M4 Max con 128 GB como plataforma de evaluación; en la práctica un Mac con 32 GB o más debería poder cargar el checkpoint en 4 bits, aunque el rendimiento será inferior al reportado.
- GPU NVIDIA: no se documenta soporte. Al publicarse en formato MLX, no es directamente ejecutable en CUDA sin conversión previa a otro formato (no se proporcionan scripts de conversión).
- Cabe en GPU de consumo: no confirmado para NVIDIA; para Apple Silicon, sí en configuraciones de gama alta con memoria unificada amplia.
- Opciones de despliegue: `mlx_lm` (documentado en la model card). vLLM, llama.cpp, Ollama y TGI no están documentados para este checkpoint.
- Latencia y throughput: 116-171 tok/s de decodificación en M4 Max según k, según datos del autor.

## Comparativa con modelos similares

No se dispone de datos verificables de modelos comparables en la información proporcionada. La model card compara contra una "arquitectura base 30B MoE" sin identificar nombre, versión ni procedencia, por lo que la comparación no es auditable. Como referencia de categoría, los MoE abiertos de ~30B totales con ~3-4B activos (por ejemplo, familias tipo Qwen3-30B-A3B o similares) son los competidores naturales, pero no se han proporcionado sus cifras en esta información.

| Modelo | Parámetros totales | Activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Proto-Nemotron | ~30B | 4,25B (k=8) | no disponible | Apache 2.0 | Hugging Face (MLX 4-bit) |
| Base 30B MoE (sin identificar) | ~30B | no disponible | no disponible | no disponible | no disponible |
| Alternativas MoE ~30B abiertas | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Checkpoint de investigación sin paper, sin código de entrenamiento y sin evaluación independiente; los benchmarks son autodeclarados y la línea base de comparación no está identificada.
- Cero descargas y cero likes en el momento de la ficha: no hay evidencia de comunidad, replicación ni reportes de terceros.
- Solo se distribuye en formato MLX 4-bit; no hay pesos en safetensors de precisión completa ni GGUF, lo que limita el despliegue fuera de Apple Silicon.
- No se documenta la longitud de contexto soportada, lo que impide planificar cargas con ventanas largas.
- Idiomas soportados no disponibles; no hay garantía de calidad en castellano ni en otros idiomas distintos del inglés.
- Riesgo de alucinación no cuantificado; las cifras de GPQA y AIME, si fueran ciertas, seguirían requiriendo verificación en dominios de alto riesgo.
- Las afirmaciones de "cero regresión" y de robustez adversarial al 100% provienen únicamente del autor y no han sido replicadas.
- El soporte de "cartuchos de habilidad" WSSC depende de un repositorio externo del mismo autor, sin documentación técnica publicada en la información disponible.
- Licencia Apache 2.0 permite uso comercial, pero la falta de evaluación independiente desaconseja producción sin validación propia.
- El tamaño del repo (17,8 GB) y la necesidad de memoria unificada amplia restringen el hardware utilizable.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/luisbrel/proto-nemotron
- Repositorio de cartuchos WSSC: https://huggingface.co/luisbrel/wssc-cartridges
- Banner del modelo: https://huggingface.co/luisbrel/proto-nemotron/resolve/main/proto_nemotron_hero_banner.png
