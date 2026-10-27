# BlivionIaG/Qwen3.8-27B-refusal-cvec-GLP-49

## Resumen

`BlivionIaG/Qwen3.8-27B-refusal-cvec-GLP-49` no es un modelo de lenguaje, sino un **vector de control de rechazo** de 1,0 MB empaquetado en un contenedor GGUF con el formato GLP (*weightless*). Se aplica en tiempo de inferencia sobre el modelo Qwen3.8-27B y elimina el comportamiento de rechazo sustrayendo, capa a capa, la componente de activación a lo largo de una dirección calculada a partir de las propias activaciones del modelo. Los pesos no se tocan y no se redistribuye ningún checkpoint: el modelo base permanece idéntico byte a byte, y servir sin este fichero devuelve el modelo tal y como era.

Lo publica BlivionIaG y deriva del vector por capas de `msuiche/Qwen3.8-27B-abliterated-cyber-GLP-49`, cuyo formato de contenedor, implementación de referencia y validador (`captain-vector --validate`) son de Matt Suiche. La diferencia está en la derivación: las direcciones se midieron con la herramienta `tf-qwen27-steer-derive` sobre el checkpoint `TensorFold/Qwen3.8-27B-MLX-4bit` (revisión `22d8d538`), sin corpus de terceros ni activaciones de otros modelos, y aplicando la máscara de activaciones masivas que la propia metadata del vector de msuiche señala.

Su relevancia es doble: por un lado es un artefacto de investigación en *representation engineering* y ablación de rechazo que se puede auditar (1 MB, inspeccionable, verificable por digest); por otro, demuestra un método de *steering* por activaciones que no requiere reentrenar ni cuantizar de nuevo el modelo. La contrapartida es que solo funciona en runtimes que implementen el modo `project` del formato GLP; el autor cita TensorFold sobre Metal como implementación de referencia, en estado experimental.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No es una red neuronal: es un vector de control (steering por activaciones) aplicado sobre el flujo residual del modelo base. Arquitectura del modelo base: no disponible en la información proporcionada |
| Parámetros totales | 250.880 (según metadatos de HuggingFace del repositorio); corresponde al fichero de vector, no a un modelo completo |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | Validado sobre la conversión MLX 4-bit del modelo base. Cuantizaciones del modelo base: no disponibles |
| Idiomas soportados | `en` (declarado en la model card) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF como contenedor del vector GLP (`mode: project`). No redistribuye pesos del modelo |
| Tamaño del fichero | 1,0 MB (`Qwen3.8-27B-refusal-cvec-GLP-49-L10-58-a1.gguf`) |
| Capas afectadas | 10-58 (49 capas) |
| Fuerza (alpha) | 1,0; comportamiento plano entre 0,5 y 3; a 4 las respuestas quedan vacías |
| Modelo base declarado | `msuiche/Qwen3.8-27B-abliterated-cyber-GLP-49` (relación: adapter) |
| Checkpoint validado | `TensorFold/Qwen3.8-27B-MLX-4bit` en la revisión `22d8d538` |
| Runtime requerido | TensorFold (Metal), experimental; cualquier runtime que implemente el modo `project` de GLP |

## Arquitectura y entrenamiento

El mecanismo es una proyección sobre el flujo residual, aplicada en el residual posterior a cada capa y repetida en las 49 capas que nombran los tensores del fichero: `h ← h − α·(h·d̂)·d̂`. Con `α = 1` la componente a lo largo de la dirección se anula; con `α = 2` se refleja (`h·d̂ → −(h·d̂)`), y por eso el autor advierte explícitamente de no escalar la fuerza. No hay entrenamiento, ni RLHF, ni DPO, ni ajuste fino: el artefacto es el resultado de una medición de direcciones sobre activaciones del modelo, no de una optimización de pesos.

La derivación se hizo con `tf-qwen27-steer-derive` a partir de 30 pares de prompts (dañino / gemelo benigno) escritos para este trabajo, aplicando la máscara de activaciones masivas indicada en la metadata del vector de msuiche y sin usar corpus de terceros ni activaciones de otros modelos. La validación usa además 20 pares reservados, escritos después, sobre temas que la derivación nunca nombra y en formas que nunca utiliza; la derivación no lee ese segundo conjunto. El contenedor incluye un digest verificable (`9a50f7160fa2` en la ejecución documentada) y el servidor rechaza un fichero que no puede aplicar en lugar de servirlo sin efecto.

## Capacidades

- Eliminación del comportamiento de rechazo en el modelo servido: 0/30 y 0/20 de prompts dañinos rechazados en los conjuntos de derivación y reservado, respectivamente, frente a 30/30 y 20/20 sin el vector.
- Ausencia de sobre-rechazo medible: 0/30 y 0/20 de gemelos benignos rechazados, frente a 6/30 del vector por capas de msuiche y 5/20 del modelo base en el conjunto reservado.
- Coherencia preservada en la medición: 60/60 y 40/40 respuestas coherentes con el vector aplicado, y 60/60 y 40/40 sin él.
- Verificación cualitativa de capacidades en 12 tareas (código, aritmética, traducción, expresión regular, haiku, datos factuales y protocolos): todas respondidas.
- No añade capacidades nuevas: el modelo conserva las del checkpoint base. Tool calling, function calling, soporte de agentes, visión o audio: no disponibles en la información proporcionada.
- Idiomas: únicamente `en` declarado; no hay datos de rendimiento en otros idiomas.
- Portabilidad del artefacto: al ser un contenedor GLP estándar, cualquier runtime que implemente `project` puede aplicarlo; el autor indica que un runtime que coteje `controlvector.model_hint` tratará este fichero igual que el de msuiche.

## Casos de uso

- **Investigación en interpretabilidad y *representation engineering*: el fichero permite aislar una dirección de rechazo concreta y estudiarla capa a capa (10-58) sin reentrenar ni redistribuir pesos, comparando el comportamiento con y sin la proyección sobre el mismo checkpoint.**
- **Auditoría de seguridad y *red teaming* de modelos abiertos: sirve para medir la robustez de un despliegue frente a la supresión de rechazo y para documentar qué respuestas cambian, con la ventaja de que el efecto es reversible y verificable por digest.**
- **Evaluación de técnicas de ablación: al existir un vector comparable (el de msuiche, por capas) medido sobre el mismo modelo, permite replicar el experimento y contrastar métricas de rechazo y sobre-rechazo con dos derivaciones distintas.**
- **Estudios de sobre-rechazo en dominios legítimos: el resultado de 0 sobre-rechazos en los dos conjuntos es un punto de partida para investigar cuánto rechazo benigno introduce un alineamiento y cuánto elimina una dirección bien estimada.**
- **Validación de runtimes de *steering*: el fichero, de 1 MB y con digest, es un caso de prueba práctico para implementaciones del modo `project` y para verificar que un servidor falla de forma segura cuando no puede aplicar el vector.**
- **Docencia y divulgación técnica: ilustra de forma tangible la diferencia entre modificar pesos (abliteración clásica) y modificar activaciones en inferencia, con números medidos y un fichero de tamaño manejable para reproducir la práctica.**
- **Investigación en ciberseguridad defensiva sobre el checkpoint base: el modelo de partida está etiquetado como `cyber`, y disponer de un control explícito del rechazo facilita estudiar qué consultas técnicas se bloquean y cuáles no, siempre dentro de un marco legal y ético.**

## Benchmarks y rendimiento

El autor no publica MMLU, HumanEval ni GSM8K. Los únicos datos cuantitativos son las tasas de rechazo medidas en Apple M4 Pro con Metal sobre `Qwen3.8-27B-MLX-4bit` en `22d8d538`, a fuerza 1,0 y 300 tokens nuevos por prompt. En la columna de dañinos y en la de benignos, **menos es mejor**.

| Conjunto | Vector | Dañinos rechazados | Benignos rechazados | Respuestas coherentes |
|---|---|---:|---:|---:|
| Derivación (30 pares) | Ninguno | 30/30 | 0/30 | 60/60 |
| Derivación (30 pares) | **Este fichero** | **0/30** | **0/30** | **60/60** |
| Derivación (30 pares) | GLP-49 de msuiche, por capas | 19/30 | 6/30 | 60/60 |
| Reservado (20 pares) | Ninguno | 20/20 | 5/20 | 40/40 |
| Reservado (20 pares) | **Este fichero** | **0/20** | **0/20** | **40/40** |
| Reservado (20 pares) | GLP-49 de msuiche, por capas | 9/20 | 6/20 | 40/40 |

Advertencia del propio autor sobre la métrica: la tasa de rechazo es una **cota inferior** y lo que cuenta son las respuestas. Un vector puede reformular un rechazo sin eliminarlo; según la model card, el vector de msuiche deja once respuestas del conjunto reservado que siguen declinando con otras palabras ("no deberías entrar en la casa de tu vecino", "es ilegal en la mayoría de jurisdicciones") y la métrica las cuenta como cumplimiento. Benchmarks estándar de capacidad (MMLU, HumanEval, GSM8K, etc.): no disponibles.

## Requisitos de hardware

- Único entorno medido y documentado: Apple M4 Pro con Metal, sirviendo `TensorFold/Qwen3.8-27B-MLX-4bit` a través de TensorFold. Memoria unificada requerida: no disponible.
- El vector añade 1,0 MB y una operación de proyección por capa en 49 capas; el coste dominante es siempre el del modelo base en 4 bits. VRAM estimada para el modelo base: no disponible en la información proporcionada.
- GPU recomendadas: no disponibles. No hay datos de ejecución en A100, H100 ni RTX 4090, ni consta soporte CUDA.
- Compatibilidad con GPU de consumo: no documentada. El único backend citado es Metal (Apple Silicon).
- Opciones de despliegue: TensorFold (experimental) o cualquier runtime que implemente `glp.mode = project`. No consta soporte en vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. Solo se documenta la generación de 300 tokens nuevos por prompt en la configuración de medición.
- La fuerza debe quedarse en el rango 0,5-3; a 4 las respuestas quedan vacías.

## Comparativa con modelos similares

| Artefacto | Naturaleza | Modifica pesos | Motor | Checkpoint objetivo | Dañinos rechazados (reservado) | Benignos rechazados (reservado) |
|---|---|---|---|---|---|---|
| **Este fichero** (GLP-49, BlivionIaG) | Vector de control GLP, 1,0 MB | No | TensorFold (Metal) | `TensorFold/Qwen3.8-27B-MLX-4bit` @ `22d8d538` | 0/20 | 0/20 |
| GLP-49 de msuiche, por capas | Vector de control GLP por capas | No | Motor `weightless` | `Qwen/Qwen3.8-27B` | 9/20 | 6/20 |
| Sin vector (modelo base servido tal cual) | Modelo sin intervenir | No | TensorFold (Metal) | `TensorFold/Qwen3.8-27B-MLX-4bit` @ `22d8d538` | 20/20 | 5/20 |
| `msuiche/Qwen3.8-27B-abliterated-cyber-GLP-49` | Checkpoint abliterado (repo del que cuelga este) | Sí (implica pesos) | No especificado | — | No disponible | No disponible |

Los dos artefactos GLP no compiten según el autor: el de msuiche está pensado para el motor `weightless` y el checkpoint `Qwen/Qwen3.8-27B`, mientras que este se destina a la conversión MLX 4-bit servida por TensorFold sobre Metal. Alternativas de la misma categoría fuera de este linaje (otros vectores de rechazo, *steering* con SAE, abliteración por modificación de pesos): no disponibles en la información proporcionada.

## Limitaciones y advertencias

- **Riesgo de seguridad directo**: el artefacto tiene como función declarada eliminar el rechazo del modelo. Su uso en producción sin controles externos de moderación, políticas de uso y registro de auditoría es desaconsejable, y puede entrar en conflicto con los términos de servicio del modelo base y con normativa aplicable.
- **Métrica optimista por diseño**: el propio autor señala que la tasa de rechazo es una cota inferior y que un vector puede reformular un rechazo sin suprimirlo. Los 0/30 y 0/20 deben leerse junto al análisis cualitativo de las respuestas, no de forma aislada.
- **Compatibilidad muy restringida**: exige un runtime que implemente `project` del formato GLP. El único backend citado es TensorFold sobre Metal, en estado experimental. En vLLM, llama.cpp, Ollama o TGI el fichero no tiene efecto.
- **Un solo checkpoint y una sola revisión**: se validó sobre `TensorFold/Qwen3.8-27B-MLX-4bit` en `22d8d538`. Cambiar de revisión, de cuantización o de checkpoint invalida la medición.
- **Un solo idioma declarado (`en`)**: no hay datos de comportamiento en castellano ni en otros idiomas; la dirección medida podría no transferir.
- **Sensibilidad a la fuerza**: por encima de 3 el comportamiento no está caracterizado y a 4 las respuestas quedan vacías. Con `α > 1` la componente se refleja en lugar de anularse, lo que puede producir efectos no deseados.
- **Conjuntos de evaluación pequeños y escritos por el autor**: 30 pares de derivación y 20 reservados. La separación es metodológicamente correcta, pero el tamaño limita la generalización de las cifras.
- **Sesgos y alucinación**: no evaluados en la información disponible. Eliminar el rechazo puede aumentar la probabilidad de respuestas confiadas pero incorrectas en dominios sensibles.
- **Licencia**: el artefacto se declara apache-2.0, pero la información proporcionada no detalla la licencia ni las condiciones del modelo base de Qwen ni del checkpoint de msuiche; conviene verificarlas antes de un uso comercial.
- **Falta de datos operativos**: sin benchmarks de capacidad, sin latencia, sin throughput y sin requisitos de memoria documentados más allá del entorno M4 Pro.

## Enlaces

- Repositorio del artefacto: https://huggingface.co/BlivionIaG/Qwen3.8-27B-refusal-cvec-GLP-49
- Modelo base declarado: https://huggingface.co/msuiche/Qwen3.8-27B-abliterated-cyber-GLP-49
- Checkpoint validado: https://huggingface.co/TensorFold/Qwen3.8-27B-MLX-4bit (revisión `22d8d538`)
- Runtime TensorFold: https://github.com/BlivionIaG/TensorFold
- Plugin `weightless` (formato GLP, lector de contenedor y `captain-vector --validate`): https://huggingface.co/msuiche/weightless
