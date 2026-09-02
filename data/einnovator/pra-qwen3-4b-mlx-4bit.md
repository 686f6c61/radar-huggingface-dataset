# EInnovator/pra-qwen3-4b-mlx-4bit

## Resumen

El repositorio `EInnovator/pra-qwen3-4b-mlx-4bit` no contiene un modelo de lenguaje completo, sino un **bundle de adaptador estructural PRA (Progressive Retrieval Attention)** diseñado para extenderse sobre el modelo base `mlx-community/Qwen3-4B-4bit`, una versión cuantizada a 4 bits del modelo Qwen3-4B de Alibaba, optimizada para Apple Silicon mediante el framework MLX. El autor, EInnovator, desarrolla PRA como una técnica de atención con recuperación progresiva que mejora el manejo de contextos largos seleccionando dinámicamente los tokens más relevantes durante la generación, sin duplicar los pesos del modelo base.

El bundle incluye un adaptador estructural, un router aprendido opcional, perfiles de ejecución y metadatos de compatibilidad. El modelo base es un transformer causal de 4.000 millones de parámetros (arquitectura `Qwen3ForCausalLM`), y el adaptador aprendido añade 655.360 parámetros adicionales. La longitud de contexto efectiva no está especificada en el bundle, aunque el modelo base Qwen3-4B soporta hasta 32.000 tokens. La relevancia actual radica en que permite extender el uso de modelos cuantizados en hardware Apple con técnicas de atención selectiva, manteniendo la portabilidad entre motores MLX y Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3ForCausalLM (base) con adaptador estructural PRA |
| Parametros totales | 4B (base) + 655.360 (router aprendido) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (el modelo base Qwen3-4B soporta 32K, el bundle no especifica) |
| Tipos de cuantizacion | 4-bit (MLX) para el modelo base |
| Idiomas soportados | No disponibles (el modelo base Qwen3-4B soporta multiples idiomas, el bundle no especifica) |
| Licencia | Apache-2.0 |
| Formato de pesos | No contiene pesos; solo adaptadores PRA (formato de la libreria `pra`) |

## Arquitectura y entrenamiento

PRA (Progressive Retrieval Attention) es una tecnica de adaptacion estructural que anade mecanismos de seleccion de contexto al modelo base. El bundle proporciona un adaptador estructural validado y un router aprendido opcional (`combined-router-d128`) que utiliza una funcion de puntuacion multi-positive softmax para decidir que tokens del contexto son relevantes en cada paso de generacion. El entrenamiento del router se realizo sobre los datasets QASPER (preguntas sobre papers cientificos) y HotpotQA (preguntas multi-hop), con solo 48 ejemplos de entrenamiento, 16 de validacion y 32 de test reservados, usando cinco semillas distintas. El metodo de seleccion fue maximizar el AUC combinado de validacion en los primeros 30 pasos. El router aprendido tiene 655.360 parametros y fue entrenado sobre la revision inmutable `4dcb3d101c2a062e5c1d4bb173588c54ea6c4d25` del modelo base.

## Capacidades

- Seleccion de contexto progresiva: el adaptador estructural filtra tokens relevantes del contexto para reducir la carga atencional en secuencias largas.
- Routing generico por coseno: perfil `balanced` por defecto, sin necesidad de entrenamiento adicional.
- Routing aprendido opcional: perfil `qasper-learned` optimizado para el dataset QASPER, activable manualmente.
- Compatibilidad con motores MLX y Hugging Face: el bundle distingue entre "Selected Context" (portable) y "Native Memory" (especifico de motor y modelo).
- Integracion con el ecosistema Qwen3: hereda las capacidades del modelo base, incluyendo modo de razonamiento (thinking mode) y tool calling, aunque el bundle no las modifica.
- Evaluacion reproducible: incluye scripts `pra evaluate` y `pra recommend` para medir metricas de recuperacion en hardware propio.

## Casos de uso

- **Extraccion de respuestas en papers cientificos**: el perfil `qasper-learned` esta calificado para el dataset QASPER, permitiendo construir sistemas de QA sobre articulos academicos largos con mejor recall a 20% (R@20%=0.6399 con routing aprendido).
- **Preguntas multi-hop en dominios factuales**: sobre HotpotQA, el routing generico ofrece R@20%=0.3863, util para aplicaciones de busqueda de conocimiento que requieren combinar multiples fuentes.
- **Procesamiento de documentos legales o tecnicos extensos**: la seleccion de contexto progresiva reduce la carga atencional, facilitando el analisis de contratos o manuales largos en hardware Apple.
- **Despliegue local en Apple Silicon**: al estar cuantizado a 4 bits y optimizado para MLX, puede ejecutarse en Mac con Apple Silicon (ej. M4 Pro con 48 GB) sin GPU dedicada, ideal para prototipado y demos.
- **Asistentes conversacionales con memoria larga**: el adaptador estructural permite mantener conversaciones multi-turno con historial extenso, priorizando los turnos mas relevantes.
- **Pipeline de RAG (Retrieval-Augmented Generation)**: el bundle se integra con el motor MLX para filtrar los chunks recuperados antes de la generacion, mejorando la precision en sistemas de respuesta a preguntas empresariales.

## Benchmarks y rendimiento

La model card reporta metricas de recall R@20% (porcentaje de veces que el token relevante aparece en el 20% superior de tokens visibles) medidas en un Apple M4 Pro de 48 GB con `mlx-lm 0.31.3`:

| Motor | Hardware | Workload | Modo | R@20% | TTFT | Throughput |
|---|---|---|---|---|---|---|
| mlx-lm 0.31.3 | Apple M4 Pro 48 GB | qasper (n=16) | Generic cosine routing | 0.4129 | NOT_MEASURED | NOT_MEASURED |
| mlx-lm 0.31.3 | Apple M4 Pro 48 GB | qasper (n=16) | Learned asymmetric routing | 0.6399 | NOT_MEASURED | NOT_MEASURED |
| mlx-lm 0.31.3 | Apple M4 Pro 48 GB | hotpotqa (n=16) | Generic cosine routing | 0.3863 | NOT_MEASURED | NOT_MEASURED |
| mlx-lm 0.31.3 | Apple M4 Pro 48 GB | hotpotqa (n=16) | Learned asymmetric routing | 0.3424 | NOT_MEASURED | NOT_MEASURED |
| mlx-lm 0.31.3 | Apple M4 Pro 48 GB | combined (n=32) | Generic cosine routing | 0.3996 | NOT_MEASURED | NOT_MEASURED |
| mlx-lm 0.31.3 | Apple M4 Pro 48 GB | combined (n=32) | Learned asymmetric routing | 0.4912 | NOT_MEASURED | NOT_MEASURED |

Estas son mediciones de calificacion, no garantias de rendimiento en produccion. No se han publicado resultados de benchmarks generativos (MMLU, HumanEval, etc.) para el bundle.

## Requisitos de hardware

- VRAM estimada: el modelo base cuantizado a 4 bits ocupa aproximadamente 2,5 GB en memoria; el adaptador PRA anade unos pocos cientos de MB, por lo que cabe en Mac con 8 GB o mas.
- GPU recomendadas: Apple Silicon (M1 o superior). Las metricas de la model card se obtuvieron en un Apple M4 Pro con 48 GB.
- Compatibilidad con consumer GPU: solo via motor Hugging Face (sin cuantizacion MLX), pero el bundle no esta calificado para ese caso (NOT_MEASURED).
- Opciones de despliegue: `pra serve` con motor MLX, o integracion con `mlx-lm`; tambien es portable a Hugging Face Transformers mediante el adaptador estructural.
- Latencia y throughput: no medidos (NOT_MEASURED en la model card). Se recomienda ejecutar `pra evaluate` en el hardware objetivo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| EInnovator/pra-qwen3-4b-mlx-4bit (bundle) | 4B + 655K adaptador | No especificado (base 32K) | Apache-2.0 | Adaptador PRA (sin pesos) | Requiere el modelo base MLX |
| mlx-community/Qwen3-4B-4bit (base) | 4B | 32K | Apache-2.0 | MLX 4-bit | Modelo original sin adaptador |
| Qwen/Qwen3-4B-MLX-4bit (oficial) | 4B | 32K | Apache-2.0 | MLX 4-bit | Version oficial de Alibaba |

La comparativa se limita al modelo base, ya que no se dispone de datos de otros adaptadores de contexto largo para MLX. El bundle anade la capacidad de seleccion progresiva de tokens, pero no modifica el contexto maximo del base.

## Limitaciones y advertencias

- El router aprendido mejora el recall en QASPER (R@20% sube de 0.4129 a 0.6399), pero es ligeramente negativo en HotpotQA (baja de 0.3863 a 0.3424); por eso es opt-in y no el perfil por defecto.
- La evidencia de calificacion se basa en solo 16 ejemplos held-out por dataset, lo que no establece calidad de generacion ni economia de servicio.
- La identidad de calificacion es la revision exacta del modelo base cuantizado a 4 bits en MLX; no se transfiere automaticamente a pesos full-precision de Hugging Face ni a otras cuantizaciones.
- El bundle no contiene los pesos del modelo base; es necesario descargar `mlx-community/Qwen3-4B-4bit` por separado.
- Las licencias del modelo base y de los datasets (QASPER, HotpotQA) se aplican por separado al router aprendido.
- El tamaño del repositorio es 0.0 GB, lo que confirma que solo contiene metadatos y adaptadores, no pesos.
- No se han medido latencia, throughput ni consumo energetico; el rendimiento en produccion debe validarse con `pra evaluate` en el hardware objetivo.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/EInnovator/pra-qwen3-4b-mlx-4bit
- Modelo base (mlx-community): https://huggingface.co/mlx-community/Qwen3-4B-4bit
- Modelo base oficial (Qwen): https://huggingface.co/Qwen/Qwen3-4B-MLX-4bit
- Documentacion PRA: https://einnovator.github.io/pdattention/
- Repositorio fuente: https://github.com/einnovator/pdattention
- Issues: https://github.com/einnovator/pdattention/issues
