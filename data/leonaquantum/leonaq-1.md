# LeonaQuantum/leonaq-1

## Resumen

LeonaQ-1 es un modelo de lenguaje de 26.895.998.464 parámetros (etiquetado comercialmente como 27B) publicado por LeonaQuantum y derivado de Qwen/Qwen3.8-27B mediante cuantización de bajo bit combinada con correcciones de red tensorial. Sobre el modelo base congelado se añaden dos elementos entrenados: operadores de matriz producto (MPO) en 192 módulos lineales feed-forward y un residuo de circuito cuántico simulado de seis qubits tras el MLP de la última capa del transformer. El paquete completo de pesos ocupa 10.265.779.625 bytes (10,27 GB), frente a los 26,8 GB del repositorio, que incluye también el GGUF Q4_K_M de 16,55 GB y los artefactos de adaptadores.

La propuesta del autor es empaquetar técnicas de inspiración cuántica —redes tensoriales, annealing simulado, bifurcación simulada tipo Ising, descomposición de Schmidt— en un runtime clásico que funciona en GPU NVIDIA, Metal y CPU. El modelo no ejecuta circuitos cuánticos reales: simula circuitos y operadores tensoriales con PyTorch sobre hardware convencional. Es relevante ahora por dos motivos: reduce un modelo de 27B a un payload de ~10 GB manteniendo el modelo base intacto, y publica mediciones concretas de throughput (48,15 tokens/s en una A100-SXM4-80GB) y de compresión de caché KV (50% de reducción, de 32 MiB a 16 MiB para un prefijo de 512 tokens en las 16 capas de atención completa).

Se distribuye bajo licencia Apache 2.0, soporta inglés y japonés, y solo habla texto. Su adopción está condicionada por una decisión de diseño fuerte: el GGUF incluido requiere una extensión propia de llama.cpp y no funciona con llama.cpp estándar, Ollama, LM Studio ni vLLM. Es, por tanto, un artefacto de investigación reproducible más que un modelo listo para integrarse en un stack convencional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer derivado de Qwen3.8-27B, con pesos empaquetados de bajo bit, correcciones MPO en 192 módulos lineales feed-forward y residuo de circuito cuántico simulado de seis qubits tras el MLP de la última capa |
| Parametros totales | 26.895.998.464 (26,9B) |
| Parametros activos | No aplica: no se indica que sea un modelo MoE |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | Pesos empaquetados de bajo bit (referencias a int4 e int8 en los artefactos de circuito y en la requantizacion Q8 a Q4); GGUF Q4_K_M |
| Idiomas soportados | Ingles (en) y japones (ja) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch empaquetado con runtime propio (CUDA, Metal, CPU); GGUF Q4_K_M (16,55 GB) que requiere una extension dedicada de llama.cpp; safetensors en el repositorio para el conteo de parametros |

## Arquitectura y entrenamiento

La base es un transformer denso de Qwen3.8-27B que permanece congelado. Sobre esa base, el autor entrena dos adiciones: (1) correcciones MPO, es decir, factores tensoriales aprendidos que se insertan en 192 módulos lineales feed-forward cuantizados, y (2) un residuo de circuito cuántico simulado de seis qubits con puertas Ry, Rz y controlled-Ry que se suma a la salida del MLP de la última capa. Ambos componentes intervienen en la generación. La información disponible menciona 16 capas de atención completa, sobre las que se aplica la selección de entradas de caché KV.

El entrenamiento de los adaptadores usa tres mecanismos adicionales: refinamiento por gradiente natural de Born-Fisher, que deriva las actualizaciones de la geometría de las probabilidades de Born; bifurcación balística simulada (bSB), un solucionador inspirado en Ising que selecciona 256 de 1024 ejemplos de activación como coreset para entrenar el adaptador de circuito; y annealing cuántico simulado (SQA) para decidir el redondeo de los pesos de lectura int4 del circuito. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO sobre el modelo base.

Como innovaciones de ingeniería destacan tres: codificación de metadatos Born-MPS (un modelo de probabilidad MPS para comprimir sin pérdida las escalas y offsets de cuantización de un módulo), descomposición de Schmidt ponderada por consulta para comprimir estados recurrentes en checkpoints de sesión (con restauración verificada de logits idénticos durante 32 pasos), y selección de caché de atención mediante bSB sobre las 16 capas de atención completa, conservando las posiciones originales de los tokens.

## Capacidades

- Generación de texto conversacional en inglés y japonés, heredada del modelo base Qwen3.8-27B.
- Clasificación de sentimiento en inglés mediante dos cabezas entrenadas incluidas en el runtime: una cabeza de circuito de Pauli de 13 qubits con 52 ángulos que produce 416 características de Pauli (94,38% de exactitud en SST-2) y una cabeza residual de red tensorial MPS de ocho sitios con actualizaciones DMRG de dos sitios (93,81% en la misma partición).
- Puntuación de diversidad de respuestas inspirada en matrices de densidad, calculada sobre ocho muestras generadas.
- Compresión de estado de inferencia: checkpoints de sesión con descomposición de Schmidt y caché KV reducida al 50% con metadatos de posición de 128 KiB.
- Ejecución multiplataforma: runtime PyTorch con CUDA, Metal y CPU, con modo interactivo persistente, salida en streaming y medición separada de carga, primer token y decodificación.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades de visión, audio o modo "thinking" explícito: no disponibles en la información proporcionada.

## Casos de uso

- Clasificación de sentimiento en inglés en producción: las cabezas de Pauli y MPS están entrenadas y empaquetadas en el runtime, con exactitud medida del 94,38% y 93,81% sobre la partición de 872 ejemplos de SST-2 reutilizada por el proyecto. Adecuado para moderación de opiniones o análisis de reseñas siempre que se acepte la validación de una sola configuración de entrenamiento.
- Evaluación de diversidad en sistemas generativos: la puntuación de densidad permite resumir la variedad de ocho respuestas muestreadas para un mismo prompt, útil en pipelines de evaluación de modelos o de detección de colapso de modo.
- Servicio de generación en una A100 80 GB: el autor midió 48,15 tokens/s en decodificación de 32 tokens con tres repeticiones en una A100-SXM4-80GB, un dato directamente utilizable para dimensionar un endpoint interno de baja concurrencia.
- Prototipado en portátil Mac: el runtime portátil Metal y CPU permite cargar el payload de 10,27 GB y ejecutar generación de texto sin GPU NVIDIA. El throughput completo en Mac no ha sido medido, así que sirve para desarrollo y validación funcional, no para planificación de capacidad.
- Atención sobre prefijos largos con VRAM limitada: la selección bSB de entradas KV reduce la caché de 32 MiB a 16 MiB para un prefijo de 512 tokens en las 16 capas de atención completa, con 128 KiB extra de metadatos de posición. Aplicable a asistentes con contexto compartido repetido entre turnos.
- Persistencia de sesiones conversacionales: la descomposición de Schmidt ponderada por consulta comprime estados recurrentes en checkpoints y la restauración se verificó con logits idénticos durante 32 pasos, lo que permite guardar y reanudar sesiones sin degradar la salida.
- Investigación en cuantización y redes tensoriales: el repositorio publica los pesos empaquetados originales, los adaptadores, el GGUF y el JSON de resultados, lo que permite reproducir las mediciones y comparar MPO frente a cuantización convencional en un modelo de 27B.

## Benchmarks y rendimiento

| Medicion | Resultado | Contexto |
|---|---:|---|
| Exactitud de sentimiento, cabeza de circuito de Pauli | 94,38% | Clasificacion de sentimiento en ingles, SST-2 (particion de 872 ejemplos reutilizada, una sola configuracion de entrenamiento) |
| Exactitud de sentimiento, cabeza MPS | 93,81% | Misma particion de SST-2 |
| Tamano del artefacto de circuito tras SQA | 201.209 bytes | El artefacto anterior ocupaba 374.705 bytes |
| Reduccion de tensores KV retenidos | 50% (32 MiB a 16 MiB) | Prefijo de 512 tokens en las 16 capas de atencion completa, mas 128 KiB de metadatos de posicion |
| Restauracion de checkpoint | Logits identicos durante 32 pasos | Comparacion entre estado comprimido en memoria y su version guardada y recargada, vocabulario completo |
| Throughput de decodificacion | 48,15 tokens/s | Una A100-SXM4-80GB, decodificacion de 32 tokens, tres repeticiones, motor parcheado con el GGUF |
| Throughput en Mac | No medido | El autor indica explicitamente que no se ha medido el rendimiento completo en Mac |

No se han publicado resultados de benchmarks estándar de razonamiento o código (MMLU, HumanEval, GSM8K, MATH) en la información disponible. Las cifras anteriores miden componentes auxiliares y eficiencia, no la calidad general del modelo.

## Requisitos de hardware

- VRAM para el payload empaquetado: aproximadamente 10,27 GB solo de pesos; hay que sumar caché KV y activaciones. Con la reducción del 50% de KV, un prefijo de 512 tokens ocupa 16 MiB en las 16 capas de atención completa, más 128 KiB de metadatos. Estimación de huella total en el entorno de 12-16 GB, no confirmada por el autor.
- VRAM para el GGUF Q4_K_M: 16,55 GB de fichero, por lo que se necesita una GPU con al menos 17-20 GB libres en función del contexto. Requiere el motor llama.cpp parcheado del proyecto.
- GPU verificada: una NVIDIA A100-SXM4-80GB, con 48,15 tokens/s en decodificación de 32 tokens.
- GPU consumer: por tamaño, una RTX 4090 (24 GB) o una RTX 3090 (24 GB) deberían acomodar tanto el payload de 10,27 GB como el GGUF de 16,55 GB. Es una estimación basada en el tamaño de los artefactos, no una medición publicada.
- Despliegue soportado: runtime PyTorch propio del repositorio con CUDA; runtime portátil Metal y CPU según MAC.md; extensión dedicada de llama.cpp para el GGUF.
- Despliegue no soportado: llama.cpp estándar, Ollama, LM Studio y vLLM no funcionan con este GGUF según la documentación del autor.
- Latencia y throughput: solo se conoce el dato de A100 (48,15 tokens/s). El tiempo de primer token y la latencia en Mac o CPU no están publicados.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento medido | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LeonaQ-1 | 26,9B | No disponible | 48,15 tok/s en A100 80 GB; 94,38% SST-2 en cabeza auxiliar | Apache 2.0 | Pesos empaquetados + GGUF con motor propio |
| Qwen/Qwen3.8-27B (modelo base) | 27B (segun denominacion del autor) | No disponible en esta ficha | No disponible en esta ficha | No disponible en esta ficha | HuggingFace |
| Otros modelos de ~27B cuantizados a 4 bits | No disponible | No disponible | No disponible | No disponible | No disponible |

La comparación relevante es contra el propio modelo base: LeonaQ-1 conserva los pesos de Qwen3.8-27B congelados y añade correcciones entrenadas, reduciendo el payload a 10,27 GB. No se han publicado comparaciones de calidad (perplejidad, MMLU u otras) entre LeonaQ-1 y Qwen3.8-27B en la información disponible, y el propio autor advierte que no se ha establecido la paridad de calidad del GGUF con el modelo empaquetado original.

## Limitaciones y advertencias

- Idiomas: solo inglés y japonés declarados. No hay soporte verificado de castellano ni de otras lenguas.
- Las cabezas de sentimiento y la puntuación de diversidad están entrenadas y evaluadas únicamente en inglés; los 94,38% y 93,81% de SST-2 corresponden a una sola configuración de entrenamiento sobre una partición de 872 ejemplos, sin validación cruzada publicada.
- El GGUF Q4_K_M preserva el circuito, pero la fusión de las MPO y la requantización de Q8 a Q4 alteran los resultados numéricos. El autor declara que no se ha establecido una paridad amplia de calidad con el modelo empaquetado original.
- Dependencia de código propio: el repositorio usa la etiqueta `custom-code` y el GGUF exige una extensión dedicada de llama.cpp. No es compatible con llama.cpp estándar, Ollama, LM Studio ni vLLM, lo que bloquea su integración en stacks de serving convencionales.
- Riesgo de alucinación: no se han publicado evaluaciones de factualidad ni de robustez conversacional para este modelo; debe asumirse el comportamiento del modelo base, no verificado en esta ficha.
- Sesgos: no se documenta ninguna evaluación de sesgos, toxicidad o seguridad en la información disponible.
- Longitud de contexto: no declarada, lo que impide planificar cargas de trabajo de contexto largo más allá de las pruebas de prefijos de 512 tokens.
- Métricas de eficiencia limitadas: solo hay una medición de throughput en una A100; no hay datos de latencia de primer token, concurrencia ni rendimiento en Mac o CPU.
- Madurez: publicación de octubre de 2026 con 0 descargas y 2 likes en el momento del análisis; el ecosistema de herramientas es prácticamente inexistente.
- Advertencia de nomenclatura: el modelo se presenta como 27B, pero el conteo real de safetensors es de 26.895.998.464 parámetros.
- Las técnicas "de inspiración cuántica" se ejecutan íntegramente en hardware clásico; no aportan ventaja cuántica y su beneficio frente a una cuantización estándar no está cuantificado en la documentación.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/LeonaQuantum/leonaq-1
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Instrucciones de ejecución en GPU NVIDIA (USAGE.md): https://huggingface.co/LeonaQuantum/leonaq-1/blob/main/USAGE.md
- Ejecución en Mac, Metal y CPU (MAC.md): https://huggingface.co/LeonaQuantum/leonaq-1/blob/main/MAC.md
- Compatibilidad del motor y compilación (ENGINE_COMPATIBILITY.md): https://huggingface.co/LeonaQuantum/leonaq-1/blob/main/ENGINE_COMPATIBILITY.md
- Mediciones y alcance de verificación (ENGINE_RESULTS.json): https://huggingface.co/LeonaQuantum/leonaq-1/blob/main/ENGINE_RESULTS.json
- GGUF Q4_K_M: https://huggingface.co/LeonaQuantum/leonaq-1/blob/main/gguf/leonaq-1-mpo-circuit-Q4_K_M.gguf
