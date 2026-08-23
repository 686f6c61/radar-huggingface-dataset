# jwl50-stanford/mom-gdn-120m-m8-softplus

## Resumen

El modelo `jwl50-stanford/mom-gdn-120m-m8-softplus` es un checkpoint de investigación del proyecto Mixture of Memories de HazyResearch (Stanford), que explora arquitecturas de memoria persistente sobre la base de Gated DeltaNet. Se trata de un modelo de lenguaje de aproximadamente 120 millones de parámetros (según el nombre del experimento), con 8 bancos de memoria persistente y un mecanismo de lectura basado en compuertas `independent_softplus`. El artefacto publicado es un checkpoint completo de PyTorch Lightning en el paso 20 000 de entrenamiento, diseñado para ser cargado directamente por el evaluador del proyecto.

El modelo forma parte de una serie de checkpoints de la misma familia (también hay versiones con otras configuraciones de memoria y compuertas) y se centra en evaluar el impacto de la mezcla de memorias en la perplejidad y en tareas de recall de hechos raros. No se trata de un modelo listo para producción: carece de licencia declarada, no se han publicado pesos en formatos estándar (GGUF, safetensors) y su propósito principal es servir como referencia para la investigación en arquitecturas de estado recurrente.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gated DeltaNet con Mixture of Memories (8 bancos persistentes, router denso para escrituras, compuertas `independent_softplus` para lecturas) |
| Parametros totales | 120 millones (según nombre del experimento, no confirmado en la documentación) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | Checkpoint de PyTorch Lightning (.ckpt) |

## Arquitectura y entrenamiento

La arquitectura se basa en la familia Gated DeltaNet, un modelo recurrente con mecanismos de compuerta que combina memoria de corto plazo con memoria persistente. En esta variante, las escrituras en los bancos de memoria se gestionan mediante un router denso basado en softmax, mientras que las lecturas utilizan compuertas `independent_softplus` sobre 8 bancos persistentes. El modelo se entrenó sobre el conjunto de datos Pile (según la referencia al evaluador) hasta el paso 20,000, aunque no se detalla la cantidad total de tokens ni el protocolo exacto de entrenamiento. El checkpoint incluye el estado del optimizador y del entrenador, lo que permite continuar el entrenamiento o reproducir exactamente la evaluación.

## Capacidades

- Modelo de lenguaje autoregresivo con capacidad de modelado de secuencias largas gracias a la memoria recurrente.
- Soporte para tareas de precisión de hechos poco frecuentes (rare first-recall) y exactitud en respuestas de memoria (FDA).
- No se documentan capacidades de tool calling, agentes, visión, audio ni razonamiento explícito más allá del modelado de lenguaje.
- No se especifica soporte multilingüe.

## Casos de uso

Dado que es un modelo de investigación sin licencia y sin documentación para uso práctico, los casos de uso se limitan al ámbito académico y experimental:

- **Evaluación de arquitecturas de memoria recurrente**: permite comparar el impacto de la compuerta `independent_softplus` frente a otras variantes (p.ej., M4) en métricas de perplejidad y recall de hechos.
- **Estudio de scaling laws en modelos con memoria persistente**: sirve como punto de referencia para analizar cómo la mezcla de memorias afecta la capacidad de generalización.
- **Desarrollo de nuevas rutas de entrenamiento**: al incluir el estado completo del optimizador, puede usarse para reanudar el entrenamiento o aplicar técnicas de fine-tuning experimental.
- **Reproducibilidad de resultados**: el checkpoint permite replicar las métricas reportadas (PPL 9.913, rare first-recall PPL 3.389, FDA exact-match 12.89%) dentro del entorno de evaluación del proyecto.
- **Comparación de protocolos de evaluación**: sirve como baseline para validar la metodología de evaluación del proyecto Mixture of Memories.
- **Investigación en eficiencia de memoria**: al ser un modelo pequeño (120M) con arquitectura recurrente, permite estudiar el trade-off entre memoria y rendimiento en GPUs modestas.

## Benchmarks y rendimiento

Según la model card, en los protocolos establecidos del proyecto se obtuvieron los siguientes resultados:

| Métrica | Valor |
|---|---|
| Perplejidad de validación (PPL) | 9.913 |
| Perplejidad de recall de hechos raros | 3.389 |
| Exactitud exacta de FDA (FDA exact-match) | 12.89% |

No se proporcionan comparaciones con otros modelos fuera de la familia Gated DeltaNet. Estos valores son solo válidos dentro del protocolo de evaluación del repositorio fuente.

## Requisitos de hardware

- **VRAM estimada**: no disponible (el checkpoint de 1.6 GB indica que el modelo completo en precisión flotante puede requerir al menos 2-3 GB de VRAM para inferencia, pero no se especifica).
- **GPU recomendadas**: no se han publicado requisitos específicos. Para un modelo de 120M, una GPU con 8 GB de VRAM (como una RTX 3070/4060) sería suficiente para inferencia en FP32, pero no hay confirmación.
- **Compatibilidad con consumer GPU**: probablemente sí, dado el tamaño, pero no se documenta.
- **Opciones de despliegue**: solo se puede ejecutar mediante el evaluador del repositorio fuente (`mom-eval`). No se soporta vLLM, llama.cpp, Ollama ni TGI.
- **Latencia y throughput**: no disponible.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma familia (p.ej., M4) con métricas publicadas. Los otros checkpoints de la misma serie (`gdn-paper-120m-fixed-d256-fp32res-gpt2init-20k-r1`, `gdn-paper-120m-fixed-qk128-v64-fp32res-gpt2init-20k-r1`) no incluyen datos de rendimiento en la búsqueda web. Por tanto, la comparativa queda pendiente de que el autor publique resultados de referencia.

## Limitaciones y advertencias

- **Licencia**: no se indica ninguna licencia, por lo que no está permitido su uso comercial ni la redistribución sin autorización explícita.
- **Sesgos**: al entrenarse sobre Pile (un corpus general) puede heredar sesgos y contenido no filtrado; no se han evaluado riesgos de toxicidad.
- **Alucinación**: al ser un modelo pequeño (120M) y sin instrucciones de seguridad, es propenso a generar información inexacta, especialmente en tareas de conocimiento factual.
- **Contexto**: no se especifica la longitud máxima de contexto; es un modelo de investigación sin optimización para ventanas largas.
- **Idiomas**: no se declaran idiomas soportados; probablemente solo inglés por el corpus de entrenamiento.
- **Uso en producción**: no es apto para sistemas reales; carece de API, tokenizador estándar y empaquetado para frameworks de inferencia.
- **Formato**: el checkpoint incluye estado del optimizador y del entrenador, lo que lo hace no estándar para despliegue. Requiere el código fuente del proyecto para cargarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jwl50-stanford/mom-gdn-120m-m8-softplus
- Repositorio fuente de Mixture of Memories: https://github.com/HazyResearch/mixture-of-memories-dev
- Checkpoint relacionado 1: https://huggingface.co/jwl50-stanford/gdn-paper-120m-fixed-d256-fp32res-gpt2init-20k-r1
- Checkpoint relacionado 2: https://huggingface.co/jwl50-stanford/gdn-paper-120m-fixed-qk128-v64-fp32res-gpt2init-20k-r1
