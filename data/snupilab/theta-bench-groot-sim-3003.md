# snupilab/theta-bench-groot-sim-3003

## Resumen

Theta-bench-groot-sim-3003 es un checkpoint de política robótica publicado por snupilab dentro del pipeline THETA Bench, construido sobre la familia GR00T N1.7 de NVIDIA y con el modelo Cosmos-Reason2-2B como backbone (revisión fijada 9ce19a195e423419c349abfc86fd07178b230561). El repositorio contiene un estado entrenado para simulación, no un modelo de lenguaje de propósito general: se carga mediante el cargador nativo de políticas GR00T junto con el adaptador de modalidad THETA, que produce acciones de 36 dimensiones.

El checkpoint pesa 3.144.016.000 parámetros distribuidos en safetensors (6,9 GB de repositorio) y se entrenó sobre 3.003 segmentos de simulación (1.200 demostraciones exitosas L1/L2 más 1.803 prefijos L0 extraídos) repartidos en 18 condiciones, con un objetivo de 40.000 actualizaciones del optimizador, batch global de 128 (16 por GPU en 8 GPU) y acumulación de gradiente de 1. Estos 3.003 segmentos no equivalen a 3.003 demostraciones independientes.

Su relevancia es acotada y muy específica: sirve como material de partida reproducible para investigación en imitación robótica y para comparar recetas de entrenamiento dentro del banco THETA. No es un checkpoint compatible con `AutoModel` de Transformers, no declara puntuación de evaluación y no sustituye a una política preentrenada upstream.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Política robótica GR00T N1.7 con backbone Cosmos-Reason2-2B y adaptador de modalidad THETA; detalles internos no disponibles |
| Parámetros totales | 3.144.016.000 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en safetensors sin cuantizaciones declaradas) |
| Idiomas soportados | en (inglés) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Dimensión de acciones | 36 |
| Pipeline declarado | robotics |
| Tamaño del repositorio | 6,9 GB |
| Revisiones fijadas | backbone nvidia/Cosmos-Reason2-2B en 9ce19a195e423419c349abfc86fd07178b230561; dataset en 8b2cd31e107b64cb13f812ea217a63a20845c78a |

## Arquitectura y entrenamiento

Se trata de un estado entrenado de una política robótica de la familia GR00T N1.7, no de un transformer de lenguaje al uso. El cargador nativo carga primero los pesos del backbone y el procesador desde nvidia/Cosmos-Reason2-2B (revisión fijada) y después restaura el estado entrenado en este repositorio. La salida de la política se canaliza mediante el adaptador de modalidad de simulación THETA, con acciones de 36 dimensiones. El autor indica explícitamente que no se reclama compatibilidad con cargadores genéricos de Transformers ni con cargadores de simulación arbitrarios.

El entrenamiento corresponde a la etapa "Simulation training, 3,003 segments", con un objetivo de 40.000 actualizaciones del optimizador, batch de 16 por GPU sobre 8 GPU (batch global 128), acumulación de gradiente 1 y 18 condiciones por batch global. El pool de simulación contiene 1.200 demostraciones L1/L2 exitosas y 1.803 prefijos L0 extraídos. El entrenamiento usa optimizadores de modelo independientes y ejecución compartida de GPU mediante MPS; la publicación la realiza un cargador de CPU tras la validación final del checkpoint. No se documentan en la información disponible detalles sobre composición exacta del dataset, uso de RLHF/DPO ni innovaciones técnicas adicionales.

## Capacidades

- Generación de acciones de robot para manipulación en simulación, con vectores de acción de 36 dimensiones emitidos por el adaptador THETA.
- Ejecución de políticas entrenadas por imitación a partir de demostraciones teleoperadas (dataset snupilab/theta-bench-teleop).
- Cobertura de 18 condiciones de entrenamiento dentro del pool de simulación del banco THETA.
- Reanudación del entrenamiento o del ajuste fino desde un estado validado, con el entorno THETA/GR00T fijado.
- No se documentan capacidades de generación de texto, razonamiento, código, matemáticas, visión general, tool calling, function calling, agentes ni multilingüismo.
- No se documenta modo de pensamiento (thinking), audio ni entrada multimodal más allá del backbone Cosmos-Reason2-2B.
- No se declara ninguna puntuación de evaluación asociada a la publicación del checkpoint.

## Casos de uso

- Reproducción de experimentos del banco THETA: cargar el checkpoint con el entorno THETA/GR00T fijado y volver a ejecutar los rollouts de simulación sobre el mismo pool de 18 condiciones y la misma revisión de dataset.
- Punto de partida para ajuste fino en nuevas tareas de manipulación: el estado entrenado tras 40.000 actualizaciones puede servir como inicialización para reentrenar con demostraciones adicionales, siempre que se respete el adaptador THETA de 36 dimensiones.
- Estudio del gap sim-to-real: al ser un checkpoint exclusivamente de simulación, permite medir la degradación de la política al trasladarla a hardware real antes de invertir en entrenamiento on-robot.
- Ablaciones de recetas de entrenamiento: la configuración concreta (batch 16 por GPU en 8 GPU, batch global 128, 18 condiciones por batch) sirve como referencia para comparar variantes de hiperparámetros dentro del mismo banco.
- Auditoría de comportamiento por condición: con 18 condiciones cubiertas, se puede analizar sistemáticamente en qué condiciones la política falla o es menos robusta antes de considerarla para despliegue.
- Generación de rollouts sintéticos en MuJoCo: usar la política como generador de trayectorias dentro del simulador para ampliar datasets de teleoperación con prefijos L0.
- Validación de infraestructura de entrenamiento distribuido: sirve para verificar pipelines con MPS y carga desde CPU tras validación de checkpoint, reproduciendo la misma receta declarada por el autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La propia model card indica que la publicación del checkpoint no reclama ninguna puntuación de evaluación.

## Requisitos de hardware

- Peso de los parámetros: 3.144.016.000 parámetros en safetensors, con un repositorio de 6,9 GB, lo que es coherente con pesos en precisión de 16 bits (aproximadamente 6,3 GB) más ficheros auxiliares.
- VRAM estimada para inferencia: del orden de 8 a 12 GB con pesos en 16 bits, más el coste de activaciones y del estado del simulador, que no se detalla en la información disponible.
- GPU recomendadas: para entrenamiento, la configuración declarada usa 8 GPU con batch 16 por GPU, lo que sitúa el escenario típico en A100 o H100. Para inferencia del checkpoint, cabe en GPU de consumo como RTX 3090, RTX 4080/4090 o RTX 5090 (24 GB o más).
- Compatibilidad con GPU de consumo: sí, con margen suficiente en tarjetas de 16 GB o más si se mantiene precisión de 16 bits; no se especifican requisitos de memoria del simulador.
- Opciones de despliegue: únicamente el cargador nativo de políticas NVIDIA GR00T junto con el adaptador de modalidad THETA en el entorno fijado. No es un checkpoint de `AutoModel` de Transformers, y por tanto vLLM, TGI, llama.cpp u Ollama no son aplicables directamente.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se dispone de datos verificables de parámetros, contexto, rendimiento o licencia para los modelos de referencia en la información proporcionada, por lo que la comparación cuantitativa no es posible.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| snupilab/theta-bench-groot-sim-3003 | 3.144.016.000 | no disponible | no disponible | HuggingFace |
| nvidia/Cosmos-Reason2-2B (backbone referenciado) | no disponible | no disponible | no disponible | HuggingFace, revisión 9ce19a195e423419c349abfc86fd07178b230561 |
| Familia NVIDIA GR00T N1.7 (referencia upstream) | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Licencia no declarada: no hay información sobre condiciones de uso comercial, redistribución o modificación. Tratar como uso restringido hasta confirmación del autor.
- Sin evaluación publicada: el autor no reclama ninguna puntuación, por lo que no existe evidencia de rendimiento fuera del propio banco THETA.
- Dependencia estricta del entorno: requiere el cargador nativo de política NVIDIA GR00T, el adaptador de simulación THETA y el backbone Cosmos-Reason2-2B en una revisión concreta, descargado aparte. No funciona con cargadores genéricos.
- Sesgo de simulación: los 3.003 segmentos provienen de simulación y de teleoperación, con 18 condiciones; el comportamiento fuera de esa distribución no está caracterizado y puede degradarse de forma acusada.
- Tamaño efectivo del dataset: los 3.003 segmentos incluyen 1.803 prefijos L0 extraídos, no son demostraciones independientes, lo que limita la diversidad real de las trayectorias.
- Idioma: la única lengua declarada es el inglés, lo que restringe documentación y cualquier componente textual asociado.
- Riesgo de alucinación: no aplica en el sentido de generación de texto, pero sí existe riesgo de acciones no válidas o inseguras fuera de la distribución de entrenamiento, especialmente antes de un despliegue en hardware.
- Estado de adopción nulo: cero descargas y cero likes en el momento de la consulta, sin señales de validación por parte de la comunidad.
- Uso en producción: no recomendado sin una evaluación propia, sin licencia clara y sin verificación del gap sim-to-real.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/snupilab/theta-bench-groot-sim-3003
- Dataset de teleoperación: https://huggingface.co/datasets/snupilab/theta-bench-teleop
- Datos de entrenamiento fijados por revisión: https://huggingface.co/datasets/snupilab/theta-bench-teleop/tree/8b2cd31e107b64cb13f812ea217a63a20845c78a/raw
- Backbone requerido (revisión fijada): https://huggingface.co/nvidia/Cosmos-Reason2-2B/tree/9ce19a195e423419c349abfc86fd07178b230561
- Búsqueda web: no se han encontrado enlaces relevantes al modelo, al banco THETA ni a la familia GR00T en los resultados disponibles.
