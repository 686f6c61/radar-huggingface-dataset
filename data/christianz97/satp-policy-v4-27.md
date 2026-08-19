# ChristianZ97/satp-policy-v4.27

## Resumen

`satp-policy-v4.27` es un modelo de 0.2B parámetros basado en ByT5 que actúa como política de configuración para el demostrador automático `aesop` de Lean 4. Desarrollado por ChristianZ97, el modelo recibe un goal state de Lean 4 y emite una configuración por problema: presupuesto de búsqueda, opciones de reglas y reglas adicionales de tácticas y lemmas. Su objetivo es automatizar la demostración de teoremas formales en Lean 4, un problema donde los demostradores automáticos genéricos como `aesop` resuelven solo el 12.7% de los problemas del benchmark miniF2F, mientras que este modelo alcanza el 41.4% con decodificación greedy.

La arquitectura combina el encoder de recuperación de ReProver (ByT5-small) con LoRA (r16, α32) y una MLP compartida que produce una acción conjunta de 69 cabezas: 28 tácticas ×10 vías, 32 lemmas ×172 vías, 4 niveles de configuración y 5 binarios de configuración, además de recuperación densa de premisas. El entrenamiento usa 75,008 problemas del dataset NuminaMath-LEAN (5,000 submuestreados por época) con verificación mediante Kimina-Lean Server en Lean 4 v4.27.0, combinando reinforcement learning (DPO) y behavior cloning (BC). Los resultados en miniF2F muestran que la variante con DPO supera significativamente a la que no lo usa (39.9% vs 38.4% en test a 10 épocas) y a la que hace DPO→BC (30.7%).

La relevancia actual radica en que ofrece una alternativa eficiente a los demostradores basados en LLMs grandes (7B o más) para la verificación formal, con un coste computacional mucho menor (0.2B parámetros) y una mejora sustancial sobre configuraciones estáticas de `aesop` ajustadas por expertos (34.0%). El repositorio incluye un paquete de inferencia autocontenido (`infer.py`) sin dependencias del código de entrenamiento, lo que facilita su reproducción y despliegue.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ByT5-small (ReProver Retrieval Encoder) + LoRA (r16, α32, q/k/v/o) + MLP compartida + 69 cabezas de acción |
| Parametros totales | 0.2B |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (procesa goal states de Lean 4, sin ventana de contexto declarada) |
| Tipos de cuantizacion | no disponible (checkpoints en precisión completa, .pt) |
| Idiomas soportados | no disponible (especializado en expresiones de Lean 4, no en lenguaje natural) |
| Licencia | apache-2.0 |
| Formato de pesos | Checkpoints PyTorch (.pt) + embeddings en .npy (cache/premise_embeddings.npy) |

## Arquitectura y entrenamiento

El modelo se basa en el encoder de recuperación de ReProver, un ByT5-small preentrenado, al que se añaden adaptadores LoRA en las proyecciones q/k/v/o. La representación del goal state se obtiene mediante mean-pooling sobre las secuencias de tokens, y una MLP compartida proyecta esta representación hacia una acción conjunta de 69 cabezas: 28 tácticas con 10 vías cada una, 32 lemmas con 172 vías, 4 niveles de configuración (presupuesto de búsqueda, profundidad, iteraciones de normalización) y 5 binarios de configuración (activación de reglas). Además, el modelo incluye un módulo de recuperación densa de premisas que produce embeddings de 1472 dimensiones para seleccionar lemmas relevantes.

El entrenamiento se realizó sobre el dataset `ChristianZ97/NuminaMath-LEAN-satp-v4.27`, que contiene 75,008 problemas de matemáticas en Lean 4, submuestreados a 5,000 por época. El verifier es Kimina-Lean Server con Lean 4 v4.27.0. Se compararon tres regímenes de entrenamiento: reinforcement learning con DPO, behavior cloning (BC) sin DPO, y DPO seguido de BC. Los resultados muestran que DPO aporta una mejora consistente sobre BC solo, especialmente en validación (40.0% vs 24.5% a 10 épocas), mientras que DPO→BC degrada el rendimiento (31.4%). El checkpoint final (`best_checkpoint.pt`) corresponde a una ejecución de 3 épocas con DPO, con 41.4% en test.

## Capacidades

- Generación de configuraciones completas de `aesop` para problemas de Lean 4: presupuesto de búsqueda (`maxRuleApplications`, `maxRuleApplicationDepth`, `maxNormIterations`), reglas de normalización, reglas seguras y reglas de lemmas.
- Selección de tácticas específicas (28 tácticas distintas, incluyendo `norm_cast`, `linarith`, `nlinarith`, `positivity`, `omega`, `bound`, `ext`, `field_simp`, `ring`, `norm_num`, `interval_cases`, `split`, `decide`, `push_cast`, `assumption_mod_cast`, entre otras).
- Recuperación densa de premisas: selección de hasta 32 lemmas de una biblioteca de 180,957 premisas de Mathlib4, con embeddings de 1472 dimensiones.
- Decodificación greedy determinista, sin muestreo estocástico, lo que facilita la reproducibilidad.
- Verificación integrada con el verifier Kimina-Lean Server y con `lake env lean` como verifier alternativo.
- Ajuste dinámico de la configuración por problema, en lugar de usar una configuración estática global.

## Casos de uso

- Automatización de demostraciones en Lean 4 para bibliotecas de matemáticas formales: el modelo puede integrarse en pipelines de verificación de teoremas, reduciendo el esfuerzo manual de escribir demostraciones o ajustar `aesop` a mano.
- Evaluación de teoremas en benchmarks estandarizados como miniF2F: permite reproducir y comparar resultados de forma consistente, con un protocolo de 300 segundos y `maxRecDepth 512`.
- Asistencia a matemáticos e investigadores en la formalización de pruebas: dado un goal state, el modelo sugiere una configuración de `aesop` que resuelve el problema en muchos casos, ahorrando tiempo de depuración.
- Integración en entornos de desarrollo Lean 4 como un preprocesador de tácticas: se puede llamar a `infer.py` antes de intentar demostraciones manuales, o usarlo como heurística dentro de un demostrador más complejo.
- Generación de configuraciones estáticas para proyectos específicos: la configuración destilada del modelo (per-head mode sobre 244 decodes) puede usarse como una configuración constante de `aesop` para un corpus concreto, sin necesidad de ejecutar el modelo en cada problema.
- Investigación en demostración automática de teoremas: el modelo sirve como baseline eficiente (0.2B) frente a enfoques basados en LLMs grandes, y su arquitectura de acción conjunta (tácticas + lemmas + configuración) es reutilizable para otros demostradores.

## Benchmarks y rendimiento

Resultados en miniF2F test (244 problemas, decodificación greedy, Lean 4 v4.27.0):

| Configuracion | Problemas resueltos |
|---|---|
| `satp` (`best_checkpoint.pt`) | **41.4%** |
| `satp` con presupuesto de búsqueda por defecto | 41.4% |
| `satp` sin táctica adicional | 38.1% |
| `satp` sin lemma adicional | 33.2% |
| Configuración estática destilada (solo táctica) | 34.8% |
| `aesop` ajustado por expertos (DSP+, límites 1200 s, `maxRecDepth 1024`) | 34.8% |
| `aesop` ajustado por expertos (DSP+, sin BFS) | 34.0% |
| `aesop` base | 12.7% |

Resultados por régimen de entrenamiento (media ± desviación estándar sobre 3 semillas):

| Regimen | Epocas | Validacion (final) | Validacion (mejor) | Test |
|---|---|---|---|---|
| `satp` (con DPO) | 10 | 40.0 ± 2.4% | 42.6 ± 0.4% | 39.9 ± 0.6% |
| sin DPO (BC) | 10 | 24.5 ± 4.4% | 41.1 ± 0.2% | 38.4 ± 1.6% |
| DPO → BC | 10 | 31.4 ± 3.9% | 32.4 ± 3.8% | 30.7 ± 1.8% |
| `satp` (con DPO) | 3 | 38.5 ± 2.2% | 40.0 ± 2.8% | 38.7 ± 2.7% |
| sin DPO (BC) | 3 | 29.1 ± 6.1% | 34.3 ± 3.0% | 33.6 ± 2.5% |
| DPO → BC | 3 | 15.6 ± 4.0% | 15.9 ± 3.8% | 17.5 ± 3.5% |

Nota: el checkpoint `best_checkpoint.pt` (3 épocas, con DPO) alcanza 41.4% en test, superando la media de su grupo (38.7 ± 2.7%). El paper de DSP+ (arXiv:2506.11487) reporta 35.2% con su propio snapshot de Lean 4 v4.17-rc1, no directamente comparable con la versión v4.27.0.

## Requisitos de hardware

- El modelo tiene 0.2B parámetros, por lo que la inferencia es ligera en términos de VRAM. El checkpoint `best_checkpoint.pt` ocupa aproximadamente 1.6 GB (estimación a partir del tamaño del repo, que incluye además 1.07 GB de embeddings de premisas y 38.9 MB de nombres de premisas).
- La carga principal de memoria es el cache de embeddings de premisas (`cache/premise_embeddings.npy`, 1.07 GB) y la biblioteca de premisas de Mathlib4 (38.9 MB). En total, el repositorio pesa 24.6 GB, pero la inferencia solo necesita cargar el checkpoint y los embeddings.
- Se recomienda una GPU con al menos 4-6 GB de VRAM para cargar el modelo y los embeddings en memoria. GPUs consumer como RTX 3060, RTX 4060 o superiores son suficientes.
- El script `infer.py` ejecuta la secuencia completa: carga del modelo, recuperación de premisas, decodificación greedy y verificación con Kimina-Lean Server o `lake env lean`. La verificación con Lean 4 es el cuello de botella, no la inferencia del modelo.
- Opciones de despliegue: el paquete es autocontenido con `infer.py` y `reproduce.py`. No se mencionan integraciones con vLLM, llama.cpp u Ollama, dado que el modelo no es un LLM generativo estándar sino una política de configuración. Se puede ejecutar en un entorno Python con PyTorch y Lean 4 v4.27.0 instalado.
- Latencia y throughput no especificados en la información disponible. La inferencia del modelo en sí es rápida (0.2B), pero el tiempo total por problema depende de la verificación de Lean 4.

## Comparativa con modelos similares

No se dispone de comparativas directas con otros modelos de demostración de teoremas en la información proporcionada. El propio autor compara contra configuraciones estáticas de `aesop` (base y ajustadas por expertos) y contra el enfoque de DSP+ (que usa un prover de 7B dentro de la búsqueda, excluido de la comparativa). A continuación se muestra una tabla orientativa basada en los datos disponibles:

| Modelo / enfoque | Parametros | Contexto | Rendimiento en miniF2F | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `satp-policy-v4.27` | 0.2B | goal states de Lean 4 | 41.4% (test, greedy) | apache-2.0 | Hugging Face, autocontenido |
| `aesop` base | no aplica (demostrador) | no aplica | 12.7% | no disponible | Lean 4 |
| `aesop` ajustado por expertos (DSP+) | no aplica | no aplica | 34.0-34.8% | no disponible | Repo DSP-Plus |
| DSP+ (prover 7B en búsqueda) | 7B (prover) | no disponible | 35.2% (snapshot v4.17-rc1) | no disponible | Repo DSP-Plus |

La comparativa directa con otros modelos de demostración de teoremas (por ejemplo, GPT-f, LeanDojo, o modelos basados en LLMs grandes) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- El modelo está entrenado y validado exclusivamente con Lean 4 v4.27.0. No se garantiza su funcionamiento con versiones anteriores o posteriores de Lean 4; el script `infer.py` fija la versión del entorno.
- Depende del verifier Kimina-Lean Server para el entrenamiento y de `lake env lean` para la verificación en inferencia. Sin un entorno Lean 4 correctamente configurado, el modelo no puede evaluar sus propias salidas.
- El rendimiento en problemas fuera del dominio de matemáticas (NuminaMath) no está evaluado. El modelo puede no generalizar a otros dominios de Lean 4, como verificación de programas o lógica de orden superior.
- Riesgo de alucinación: el modelo puede generar configuraciones de `aesop` que no sean válidas o que no resuelvan el problema, especialmente en problemas no vistos. La ablación muestra que eliminar la táctica adicional reduce el rendimiento de 41.4% a 38.1%, y eliminar el lemma adicional lo reduce a 33.2%, lo que indica que ambas componentes son críticas.
- La configuración destilada estática (sin lemmas) alcanza solo 34.8%, muy por debajo del modelo completo, lo que confirma que la selección dinámica de lemmas es esencial.
- No se proporcionan datos sobre sesgos o riesgos de seguridad. Al ser un modelo de demostración formal, el riesgo principal es generar configuraciones incorrectas que lleven a demostraciones inválidas si no se verifica con Lean.
- El repositorio tiene 0 descargas y 0 likes en Hugging Face, lo que indica que es un proyecto reciente (creado en julio de 2026) y sin validación externa amplia.
- La licencia apache-2.0 permite uso comercial, pero los datos de entrenamiento (NuminaMath-LEAN) pueden tener restricciones adicionales no especificadas en la model card.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ChristianZ97/satp-policy-v4.27
- Dataset miniF2F asociado: https://huggingface.co/datasets/ChristianZ97/minif2f-satp-v4.27
- Dataset de entrenamiento: https://huggingface.co/datasets/ChristianZ97/NuminaMath-LEAN-satp-v4.27
- Paper de DSP+ (arXiv:2506.11487): https://arxiv.org/abs/2506.11487
- Repo de DSP-Plus: https://github.com/microsoft/DSP-Plus
- Verifier Kimina-Lean Server: https://github.com/project-numina/kimina-lean-server
- Modelo ReProver (encoder base): https://huggingface.co/kaiyuy/leandojo-lean4-retriever-byt5-small
