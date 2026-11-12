# rlacombe/glycogen-ar-50m

## Resumen

GlycoGen-AR es un checkpoint de PyTorch de 46,4 millones de parámetros desarrollado por Romain Lacombe (rlacombe) como parte del trabajo "GlycoGen: Glycan Structure Prediction with Crystallizing Flows", aceptado en NeurIPS 2026. Se trata de un transformer autoregresivo causal de arquitectura emparejada que sirve como línea base para la predicción de estructuras de glicanos a partir de datos de espectrometría de masas.

El modelo no es un LLM de propósito general: es un modelo de dominio específico entrenado para resolver el problema de determinar la estructura de un glicano (azúcar complejo) a partir de su espectro de masas, una tarea central en glicómica y en el desarrollo de biofármacos. El checkpoint publicado corresponde a la semilla de inicialización aleatoria `0` y se declara convergido.

Su relevancia radica en que proporciona una referencia reproducible y cuantificada (90,38% ± 0,05% de precisión estructural top-1 con beam=1 sobre 76.774 muestras de test) frente a la cual se compara la propuesta principal del paper basada en discrete flow matching. Es, por tanto, una pieza de evaluación comparativa más que un modelo listo para producción general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal autoregresivo (matched-architecture baseline) |
| Parametros totales | 46,4 M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de dominio científico, no lingüístico) |
| Licencia | MIT |
| Formato de pesos | PyTorch (`best_model.pt`) |

## Arquitectura y entrenamiento

El modelo es un transformer causal autoregresivo con arquitectura emparejada respecto al modelo principal del paper (GlycoGen), es decir, se diseñó con la misma configuración de capas y dimensiones para servir de comparación controlada frente al enfoque de discrete flow matching. El objetivo de entrenamiento es la predicción autoregresiva token a token de la estructura del glicano.

Los datos de entrenamiento provienen del benchmark `rlacombe/candycrunch-v2-benchmark`. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO (no aplicables en este dominio). Tampoco se detalla si se emplearon innovaciones como decodificación especulativa o atención lineal. El checkpoint publicado corresponde a la semilla `0`.

## Capacidades

- Predicción de estructura de glicanos a partir de espectros de masas (tarea principal).
- Generación autoregresiva de secuencias estructurales de glicanos token a token.
- Decodificación con beam search (se reporta resultado con beam=1; se desconoce si se evaluaron otros valores).
- Evaluación reproducible sobre el split de test del benchmark CandyCrunch v2 (n = 76.774).
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso, multilingüismo, visión ni audio.
- No se documenta un modo "thinking" ni capacidades conversacionales.

## Casos de uso

- Análisis de glicanos en investigación glicómica: el modelo predice la estructura de un glicano a partir de su espectro de masas, sustituyendo o asistiendo la anotación manual en laboratorios de espectrometría.
- Línea base para comparación metodológica: sirve como referencia cuantitativa (90,38% top-1) frente a la que medir la mejora del enfoque de discrete flow matching del paper GlycoGen en experimentos de ablación.
- Control de calidad en biofabricación: la predicción estructural permite verificar la composición de glicanos en lotes de proteínas terapéuticas, donde la glicosilación afecta a eficacia y seguridad.
- Reproducción de resultados académicos: al publicarse el checkpoint con semilla fija y el benchmark asociado, permite reproducir exactamente los números del paper en un entorno de investigación.
- Desarrollo de pipelines de anotación automatizada: integrable en flujos que procesan espectros en lote y requieren una asignación estructural rápida y determinista.
- Docencia y formación en bioinformática: como ejemplo didáctico de aplicación de transformers a datos científicos no lingüísticos con métricas bien definidas.

## Benchmarks y rendimiento

| Benchmark | Metrica | Resultado |
|---|---|---|
| CandyCrunch v2 (test, n = 76.774) | Precisión estructural top-1 (beam=1) | 90,38% ± 0,05% |

No se han publicado en la información disponible resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros), que además no son aplicables a este dominio.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 46,4 M de parámetros, el checkpoint en precisión completa ocupa del orden de 0,2 GB, por lo que cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: no especificadas por el autor; por tamaño, cualquier GPU con al menos unos pocos GB de VRAM es suficiente (RTX 3060, RTX 4090, A100, H100).
- Cabe en GPU consumer: sí, por el reducido número de parámetros.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI; el autor referencia scripts de inferencia en el repositorio de GitHub del proyecto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GlycoGen-AR (este) | 46,4 M | no disponible | Transformer causal autoregresivo (baseline) | MIT | Hugging Face + GitHub |
| GlycoGen (modelo principal del paper) | no disponible | no disponible | Discrete flow matching ("crystallizing flows") | no disponible en la información | Project page y repositorio del paper |
| Otros modelos de predicción de glicanos | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre modelos comparables de terceros en la documentación proporcionada.

## Limitaciones y advertencias

- Modelo de dominio muy específico (glicómica): no es un LLM de propósito general y no debe emplearse para tareas de texto, código o conversación.
- No se documentan sesgos conocidos; al operar sobre datos científicos, el riesgo principal es el sesgo del dataset CandyCrunch v2, cuya composición no se detalla.
- Riesgo de alucinación estructural: como generador autoregresivo, puede producir estructuras plausibles pero incorrectas; la precisión reportada es del 90,38%, lo que implica aproximadamente un 9,6% de errores top-1 en test.
- No se especifican limitaciones de contexto ni de idioma porque el modelo no procesa lenguaje natural.
- Licencia MIT: permite uso comercial, pero se recomienda citar el paper de NeurIPS 2026 según el BibTeX proporcionado.
- Solo se publica un checkpoint (semilla `0`); no hay información sobre variabilidad entre semillas más allá del ± 0,05% reportado.
- No se documentan garantías de robustez fuera de la distribución del benchmark; el uso en producción biofarmacéutica requeriría validación adicional.

## Enlaces

- Hugging Face: https://huggingface.co/rlacombe/glycogen-ar-50m
- Repositorio de código e inferencia: https://github.com/rlacombe/GlycoGen
- Project page: https://rlacombe.github.io/GlycoGen/
- Dataset de benchmark: https://huggingface.co/datasets/rlacombe/candycrunch-v2-benchmark
