# IbrahimAnaz/pure-lie-engine

## Resumen

Pure Lie Engine (identificador `IbrahimAnaz/pure-lie-engine`) es un artefacto de investigación publicado en HuggingFace por el usuario IbrahimAnaz que se presenta como un «motor de lenguaje neural» construido estrictamente sobre grupos y álgebras de Lie. El autor afirma que el modelo no emplea funciones de activación elementales (ReLU, GELU, sigmoid, tanh) ni sesgos aditivos en ninguna capa, y que el enrutamiento dinámico se implementa mediante conmutadores matriciales [H, K] = HK − KH. La innovación declarada más concreta es la predicción multi-token (MTP) con horizonte de cuatro pasos (x_{t+1} a x_{t+4}), junto con un «reloj de fase simpléctico hamiltoniano» que recorre trayectorias del grupo de rotaciones SO(16).

El repositorio es muy pequeño (0,5 GB) y no incluye pipeline declarado en HuggingFace, ni tokenizador, ni código de inferencia más allá de un fragmento para descargar y cargar el checkpoint `pure_lie_engine_epoch_040.pt` con PyTorch. La model card se limita a instrucciones de instalación de CUDA y a un ejemplo de carga de pesos; no documenta arquitectura de capas, recuento de parámetros, longitud de contexto, datos de entrenamiento ni resultados de evaluación.

Por tanto, se trata de un prototipo de investigación algebraica, no de un modelo listo para producción: cero descargas y cero «likes» en el momento de la consulta, sin benchmarks publicados y con afirmaciones de «breakthrough» que no van acompañadas de evidencia empírica. Su interés actual es conceptual (deep learning geométrico aplicado a modelado de lenguaje), no práctico.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Motor algebraico basado en grupos/álgebras de Lie; sin activaciones elementales ni sesgos aditivos; memoria de conmutadores [H, K] = HK − KH; reloj de fase simpléctico en SO(16); predicción multi-token de 4 pasos |
| Parámetros totales | No disponible (el autor no lo declara). El repo ocupa 0,5 GB, lo que orientativamente equivaldría a ~125 M parámetros en fp32 o ~250 M en fp16, estimación no confirmada |
| Parámetros activos | No disponible (no se describe una arquitectura MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (solo se publica un checkpoint PyTorch; no hay versiones GGUF, AWQ, GPTQ ni FP8) |
| Idiomas soportados | Inglés (`en` según la model card) |
| Licencia | MIT |
| Formato de pesos | PyTorch `.pt` (`pure_lie_engine_epoch_040.pt`, cargado con `torch.load(..., weights_only=True)`); no hay safetensors |
| Framework requerido | PyTorch con CUDA (el autor recomienda CUDA 12.4 y GPUs NVIDIA con Tensor Cores: Turing, Ampere, Ada Lovelace, Blackwell sm_120) |
| Compatibilidad con ecosistema | No disponible: sin `pipeline` en HuggingFace, sin `config.json` de Transformers, sin tokenizador documentado |

## Arquitectura y entrenamiento

La propuesta arquitectónica sustituye los mecanismos habituales del transformer por operaciones algebraicas. Según la model card, no existe ninguna activación no lineal elemento a elemento (0 ReLU, 0 GELU, 0 sigmoid, 0 tanh) y ningún sesgo aditivo (0 términos `+ b`) en las capas lineales. El enrutamiento de información se realiza con conmutadores matriciales, lo que implica que el modelo aprende transformaciones en el álgebra de Lie asociada al grupo y mide la no conmutatividad entre dos operadores H y K como señal dinámica. A esto se añade un «reloj de fase» que describe rotaciones continuas dentro de SO(16), el grupo especial ortogonal de dimensión 16.

El segundo componente destacado es la predicción multi-token: el modelo no predice solo x_{t+1}, sino simultáneamente cuatro posiciones futuras (x_{t+1}, x_{t+2}, x_{t+3}, x_{t+4}). Esto obliga a un decodificador o bucle de inferencia personalizado que resuelva el horizonte solapado entre pasos, y para el cual el repositorio no proporciona código.

No hay información sobre volumen de tokens de entrenamiento, composición del corpus, uso de RLHF/DPO, ni detalles de implementación (número de capas, dimensión oculta, cabezas de atención o su equivalente algebraico). La única referencia temporal es el nombre del checkpoint (`epoch_040`), que sugiere al menos 40 épocas de entrenamiento, sin más contexto.

## Capacidades

- Generación de texto autoregresiva: el autor la describe como «motor de lenguaje», aunque no se aportan muestras, ejemplos ni evaluaciones que la demuestren.
- Predicción multi-token con horizonte de 4 pasos: capacidad declarada de anticipar cuatro tokens futuros simultáneamente.
- Razonamiento geométrico/algebraico: la formulación en grupos de Lie y SO(16) está orientada a representar transformaciones continuas, no a operaciones simbólicas explícitas.
- Soporte de tool calling / function calling: no disponible (no documentado).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Capacidades multilingües: limitadas al inglés según la metadata; sin evidencia de otras lenguas.
- Capacidades especiales: no se documentan modo «thinking», visión, audio ni modalidad adicional.
- Ejecución en GPU NVIDIA con Tensor Cores: requisito declarado por el autor para el entorno recomendado.

## Casos de uso

- Investigación en deep learning geométrico: usar el checkpoint como banco de pruebas para estudiar si un modelo sin activaciones ni sesgos puede aprender dependencias lingüísticas; el interés está en la arquitectura, no en el rendimiento.
- Análisis de conmutadores como mecanismo de enrutamiento: instrumentar la memoria [H, K] = HK − KH para medir qué pares de operadores generan mayor no conmutatividad y correlacionarlo con la perplejidad.
- Experimentos de predicción multi-token: comparar el horizonte de 4 pasos frente a la predicción de un solo token en tareas controladas, reutilizando el checkpoint `epoch_040` como punto de partida.
- Reproducibilidad de artefactos pequeños: con 0,5 GB de pesos y licencia MIT, es viable descargarlo, versionarlo y auditarlo en un entorno académico con una sola GPU consumer.
- Docencia sobre álgebras de Lie aplicadas a IA: el código de carga y la formulación matemática de la model card sirven como material de estudio de rotaciones en SO(16) dentro de una red neuronal.
- Pruebas de integración de checkpoints `.pt` en pipelines PyTorch propios: validar carga con `weights_only=True`, transferencia a GPU y consumo de memoria antes de invertir en un modelo mayor.
- No se recomienda su uso en atención al cliente, generación de código en producción, RAG ni ningún escenario con requisitos de calidad medibles: no existen evaluaciones que lo respalden.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye MMLU, HumanEval, GSM8K, perplejidad, ni comparaciones con otros modelos; tampoco se documentan latencia o throughput.

## Requisitos de hardware

- VRAM estimada: no disponible con precisión. Como referencia, el repositorio completo ocupa 0,5 GB, por lo que los pesos en memoria ocuparían ese orden de magnitud; el pico real depende de la implementación del horizonte MTP de 4 pasos, no publicada.
- GPU recomendadas por el autor: cualquier NVIDIA con Tensor Cores: Turing (T4, RTX 20xx), Ampere (A100, A10, RTX 30xx), Ada Lovelace (RTX 40xx, L40S) y Blackwell sm_120 (RTX 50xx).
- GPU consumer: previsiblemente cabe en cualquier GPU consumer moderna por el tamaño del checkpoint (0,5 GB), pero no hay confirmación de que el grafo del modelo se ejecute sin el código de inferencia ausente.
- CPU: es posible cargar los pesos con `map_location="cpu"`, tal como muestra la model card; la ejecución completa en CPU no está documentada.
- Opciones de despliegue: solo carga manual con PyTorch y `huggingface_hub.hf_hub_download`. No hay soporte declarado para vLLM, llama.cpp, Ollama, TGI, SGLang ni Transformers `pipeline`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. En la información proporcionada no se identifican modelos comparables de la misma categoría (motores algebraicos o de deep learning geométrico con pesos públicos), y el propio autor no ofrece comparaciones. Tampoco se dispone del recuento de parámetros ni de la longitud de contexto necesarios para contrastarlo con transformers decoder de tamaño similar.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Pure Lie Engine (`IbrahimAnaz/pure-lie-engine`) | No disponible | No disponible | MIT | Pesos `.pt`, 0 descargas |
| Alternativas comparables | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Ausencia total de evaluación: cero benchmarks, cero ejemplos de generación y cero descargas; no hay evidencia pública de que el modelo genere texto coherente.
- Afirmaciones no verificadas: términos como «breakthrough» o «strictly on continuous Lie groups» provienen únicamente de la model card y no están respaldados por un paper, un repositorio de código ni resultados reproducibles.
- Falta de código de inferencia: el repositorio solo documenta la descarga y carga de pesos; sin definición de arquitectura, tokenizador ni bucle de decodificación MTP, el checkpoint no es utilizable de forma autónoma.
- Idiomas: únicamente inglés declarado; no hay información sobre calidad en otras lenguas, incluido el castellano.
- Contexto: longitud de ventana desconocida, lo que impide planificar casos de uso con documentos largos.
- Riesgo de alucinación: no cuantificado; al no haber evaluación, debe asumirse un riesgo alto en cualquier uso generativo real.
- Sesgos: no documentados. El corpus de entrenamiento es desconocido, por lo que no se puede auditar la presencia de sesgos de género, raza o ideología.
- Formato de pesos: `.pt` es un contenedor pickle; aunque el autor recomienda `weights_only=True`, conviene auditar el fichero antes de cargarlo en entornos compartidos.
- Licencia MIT: permite uso comercial y modificación, pero se ofrece «tal cual», sin garantías; el autor no asume responsabilidad por el rendimiento.
- Fecha de creación registrada en HuggingFace: 2026-10-20, lo que conviene contrastar con la cronología real del proyecto antes de citarlo.
- Madurez: proyecto unipersonal sin mantenimiento aparente (última actualización 2026-10-20) y sin comunidad; no apto para producción.

## Enlaces

- HuggingFace: https://huggingface.co/IbrahimAnaz/pure-lie-engine
- Checkpoint de pesos: `pure_lie_engine_epoch_040.pt` (descargable vía `hf_hub_download` desde el repositorio anterior)
- Paper, blog, repositorio de código, demo o documentación adicional: no disponible en la información proporcionada.
