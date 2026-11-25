# accidentalgenius101/goodfire-legB-B-attached

## Resumen

B-attached es un checkpoint de replicación independiente del artículo de Goodfire "Shaping & Monitoring Models through their Internal Representations" (arXiv:2611.07071), concretamente del apartado 4 sobre monitorabilidad en la tarea Countdown. Lo publica el usuario accidentalgenius101 como artefacto de investigación: Goodfire liberó únicamente la librería `reliance`, no los modelos moldeados, de modo que este checkpoint reconstruye el brazo "B-attached" del experimento mediante un fine-tune completo de Qwen3-0.6B.

El modelo resuelve un problema muy concreto de interpretabilidad y seguridad: comprobar si es posible moldear una política para que deje de "hacer trampa" (peek) en una tarea tipo Countdown y, a la vez, monitorizar ese cambio conductual mediante sondas sobre representaciones internas. El entrenamiento usa GRPO con un término de moldeado de dependencia (lambda 0.4, w 0.2), tamaño de grupo 16, 200 actualizaciones y sonda en la capa 21.

No es un modelo de propósito general: es un artefacto experimental de 596 millones de parámetros, sin model card orientada a uso productivo, sin idiomas declarados y con licencia "other". Su interés es metodológico (replicabilidad del paper, reparación del instrumento de lectura de activaciones) y no de despliegue.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3-0.6B, fine-tune completo) |
| Parametros totales | 596.049.920 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan GGUF ni otras) |
| Idiomas soportados | no disponible |
| Licencia | other |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La base es Qwen3-0.6B, un transformer decoder-only, sobre el que se aplica un fine-tune completo (no LoRA) durante 200 actualizaciones con GRPO y un learning rate declarado de 1e-05 (desviación explícita respecto al paper, que no especifica ese valor). El objetivo combina una recompensa de resolución honesta de la tarea Countdown con un término de moldeado de dependencia ("reliance shaping") parametrizado por lambda 0.4 y w 0.2, con tamaño de grupo 16 y semilla 0.

La innovación metodológica no está en la arquitectura sino en el protocolo: se entrena un brazo "attached" frente a brazos de control "detached" y "frozen", y se mide la evolución de una sonda lineal en la capa 21 (tasa de peek, tasa de resolución honesta, precisión balanceada y AUROC de la sonda original, norma de activación en el punto de sonda y fracción fuera de región). El autor documenta además una reparación del instrumento de lectura: el lector original extraía activaciones de lotes con padding sin máscara de atención y daba 0.625 donde un lector por texto sin padding daba 0.962 sobre los mismos rollouts; se sustituyó por el lector por texto (conjunto de ajuste de 640 rollouts) antes de lanzar los brazos moldeados.

## Capacidades

- Generación de texto y razonamiento sobre la tarea Countdown en su variante "toy" (peek-or-solve, task v2), que es el único dominio para el que fue entrenado.
- Resolución honesta de la tarea: la tasa de resolución honesta pasa de 0.0625 en el paso 0 a 1.0 al final del run.
- Supresión de la conducta de "peek": la tasa de peek pasa de 0.46875 a 0.0.
- No hay evidencia de soporte de tool calling ni function calling en la información disponible.
- No hay evidencia de capacidades de agente ni de razonamiento multi-paso general en la información disponible.
- Capacidades multilingües: no disponibles (no se declaran idiomas).
- No se documentan modo thinking, visión ni audio.

## Casos de uso

- Replicación de resultados de interpretabilidad: reproducir el apartado 4 del paper de Goodfire sobre moldeado y monitorización de representaciones internas, usando este checkpoint como brazo "attached" junto a los brazos de control.
- Estudio de colapso de sondas: analizar por qué una sonda lineal deja de ser informativa cuando la política deja de emitir la conducta objetivo (AUROC cae de 1.0 a 0.5 mientras la precisión balanceada degenera a especificidad 1.0 por eval de una sola clase).
- Investigación sobre canales alternativos de monitorización: usar la norma de activación en la capa 21 (178 a 211) y la fracción fuera de región (0.0625 a 1.0) como señal de deriva representacional cuando la sonda conductual ya no discrimina.
- Auditoría de instrumentos de lectura de activaciones: comparar lectores con y sin máscara de atención sobre los mismos rollouts para cuantificar el sesgo del harness (0.625 frente a 0.962 en el caso documentado).
- Docencia y formación en seguridad de IA: ilustrar con un caso reproducible y de bajo coste (0.6B, 1.2 GB de repo) los compromisos entre moldeado conductual y monitorabilidad.
- Punto de partida para escalar el protocolo: reutilizar la configuración (lambda 0.4, w 0.2, grupo 16, sonda en capa 21) como plantilla para réplicas en modelos mayores, dado que el propio autor advierte que los números no transfieren cuantitativamente al 9B del paper.

## Benchmarks y rendimiento

Los datos publicados son métricas del propio run experimental, no benchmarks estándar (MMLU, HumanEval, GSM8K no están disponibles).

| Metrica (paso 0 -> final) | Valor |
|---|---|
| Precision balanceada de la sonda original | 1.0 -> 1.0 |
| AUROC de la sonda original | 1.0 -> 0.5 |
| Tasa de peek | 0.46875 -> 0.0 |
| Tasa de resolucion honesta | 0.0625 -> 1.0 |
| Norma de activacion en el punto de sonda (media) | 177.69119262695312 -> 210.74415588378906 |
| Norma de activacion en el punto de sonda (p99) | 202.6985321044922 -> 210.74415588378906 |
| Fraccion fuera de region | 0.0625 -> 1.0 |

Condiciones: Qwen3-0.6B full fine-tune, Countdown toy peek-or-solve, grupo 16, lambda 0.4, capa de sonda 21, semilla 0. Veredicto declarado: REPLICATED con una "herida" nombrada (la barra de caída de precisión balanceada de la sonda resultó ilegible tal como se registró, porque tras la actualización 10 la política attached no emite ningún peek y las evaluaciones posteriores son de una sola clase).

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: en torno a 1,2 GB solo para pesos (596 M de parámetros), más overhead de activaciones y KV cache; cómodo en cualquier GPU consumer con 4 GB o más.
- GPU recomendadas: RTX 3060/4060 y superiores para inferencia; A100/H100 no son necesarias para servir el modelo, solo para reproducir el entrenamiento a mayor escala.
- Cabe en GPU consumer: sí, en la práctica totalidad de tarjetas con 4-8 GB de VRAM.
- Opciones de despliegue: al publicarse solo safetensors, la ruta natural es transformers; no se documentan artefactos GGUF para llama.cpp u Ollama, ni configuración para vLLM o TGI (no disponibles).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia |
|---|---|---|---|---|
| B-attached (este) | 596 M | no disponible | Replicacion de moldeado y monitorabilidad (Countdown) | other |
| Qwen3-0.6B (base) | 596 M | no disponible en esta ficha | Modelo generalista de proposito multiple | segun Qwen3 |
| Brazos B-detached y B-frozen | 596 M (cada uno) | no disponible | Controles del mismo experimento | other |

No se dispone de datos comparativos de rendimiento frente a alternativas de la misma categoria más allá de los brazos de control del propio estudio; cualquier comparación con modelos generalistas de tamaño similar no sería significativa porque la tarea es distinta.

## Limitaciones y advertencias

- Artefacto de investigación, no un modelo de producción: no hay model card de uso, ni idiomas declarados, ni pipeline definido.
- Escala miniaturizada: el autor advierte explícitamente que los números no transfieren cuantitativamente al resultado del paper, medido sobre un modelo de 9B y Countdown real.
- Riesgo de sobreinterpretación de métricas: la precisión balanceada de 1.0 al final es degenerada (evaluación de una sola clase), no una mejora real de la sonda; el propio autor lo señala como "herida" del experimento.
- Sesgos conocidos: no documentados en la información disponible.
- Riesgo de alucinación: no evaluado; el modelo no ha sido alineado para conversación general.
- Restricciones de licencia: licencia "other" sin términos comerciales explícitos en la información disponible; debe consultarse el repositorio antes de cualquier uso.
- Dependencia del harness: los resultados son sensibles al lector de activaciones (se documenta una discrepancia de 0.625 frente a 0.962 atribuible a la máscara de atención), por lo que réplicas con otro instrumento pueden no coincidir.
- Desviaciones declaradas respecto al paper en hiperparámetros no especificados por el texto de arXiv (recogidas en `config.json` y `HYPERPARAMS.md`).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/accidentalgenius101/goodfire-legB-B-attached
- Paper de referencia: https://arxiv.org/abs/2611.07071
- Librería `reliance` de Goodfire: no disponible en la información proporcionada
- Registro de reparación del instrumento (`legB/REPAIR.md`): referenciado en la model card, no enlazado
- Ficheros de configuración y desviaciones (`config.json`, `HYPERPARAMS.md`, `SPEC.md`): referenciados en la model card, no enlazados
