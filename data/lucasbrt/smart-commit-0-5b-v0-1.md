# LucasBRT/smart-commit-0.5b-v0.1

## Resumen

smart-commit-0.5b-v0.1 es un ajuste fino de Qwen2.5-Coder-0.5B-Instruct (494.032.768 parámetros) publicado por LucasBRT para una única tarea: redactar mensajes de commit de git en el estilo del repositorio donde se trabaja. No es un modelo de propósito general, sino el componente de inferencia de smart-commit, una CLI que ejecuta el modelo en local (NPU Intel, GPU o CPU) y que construye el prompt byte a byte con las reglas del proyecto (asunto de 72 columnas como máximo, modo imperativo, Conventional Commits cuando el repositorio los usa), la lista de ficheros modificados, un diff compactado y hasta 5 asuntos recientes del repositorio.

El modelo se entrenó con 39.985 commits del split de entrenamiento de CommitChronicle (JetBrains Research), cada uno con al menos 10 asuntos previos de su repositorio, y se publica fusionado en bf16 más una cuantización Q4_K_M de 398 MB para llama.cpp. La relevancia práctica está en su tamaño: cabe en un portátil sin GPU dedicada y evita enviar diffs de código propietario a un servicio en la nube.

La model card reporta una mejora sustancial frente a su modelo base en la tarea concreta: type_match sube de 0,168 a 0,640 y first_try de 0,392 a 0,980 sobre 500 commits de repositorios no vistos en entrenamiento. Es la versión 0.1, con la receta de entrenamiento todavía en evolución, y el autor publica en paralelo una variante de 1.5B con mejor fidelidad al mensaje real.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2) con ajuste fino LoRA fusionado en los pesos base |
| Parámetros totales | 494.032.768 (~0,49 B) |
| Parámetros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible en la model card; heredada del modelo base Qwen2.5-Coder-0.5B-Instruct |
| Tipos de cuantización | bf16 (safetensors) y Q4_K_M (GGUF, 398 MB) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (bf16, pesos fusionados + config y tokenizer) y GGUF (Q4_K_M) |
| Modelo base | Qwen/Qwen2.5-Coder-0.5B-Instruct |
| Dataset de entrenamiento | JetBrains-Research/commit-chronicle (revisión 5fd076e) |
| Pipeline | text-generation |
| Tamaño del repositorio | 1,4 GB |
| SHA-256 de los pesos | safetensors: `bb95863256956bd51e106042ea03e5f5b8d28a42dd1df53ba52289dfd15afef3`; GGUF: `83b9acfc91e67cba1a2b669a0afe59ddc1b3ce5909617355b88d3a2ff6e66c11` |

## Arquitectura y entrenamiento

La base es un transformer decoder-only de la familia Qwen2, el Qwen2.5-Coder-0.5B-Instruct, sobre el que se aplicó un ajuste fino QLoRA. La configuración declarada es LoRA con r=16, alpha=32, dropout 0,05 sobre todas las capas lineales, learning rate 2e-4 con scheduler coseno, warmup del 3%, batch efectivo 4 × 4, una sola época, semilla 0 y pérdida calculada únicamente sobre la respuesta del asistente. El entrenamiento se ejecutó sobre la base cuantizada en 4 bits NF4 con cómputo en fp16 en una Kaggle Tesla T4 durante 147 minutos, con torch 2.11.0, transformers 5.20.1 y peft 0.21.2. Posteriormente los adaptadores se fusionaron en el modelo base bf16 y se cuantizaron a Q4_K_M con llama.cpp b11381.

Los datos son 39.985 commits del split de entrenamiento de CommitChronicle, filtrados para que cada uno tenga al menos 10 asuntos previos de su repositorio. Lo relevante del método es que los prompts no se reconstruyeron a posteriori: los generó la propia CLI smart-commit, de modo que el formato de entrada del entrenamiento coincide exactamente con el de inferencia. El objetivo es el asunto real del commit, lo que convierte la tarea en una suerte de resumen condicionado al estilo del repositorio. El autor advierte que el entrenamiento en GPU no es reproducible bit a bit, pero la generación sí lo es al usar decodificación greedy.

## Capacidades

- Generación de mensajes de commit de git en inglés, con asunto de 72 columnas como máximo y modo imperativo.
- Producción de mensajes en formato Conventional Commits (`feat`, `fix`, `chore`, etc.) cuando el repositorio los usa, con scope coherente con los ya empleados por el proyecto.
- Adaptación al estilo del repositorio mediante el contexto de hasta 5 asuntos recientes incluidos en el prompt.
- Condicionamiento sobre la lista de ficheros modificados y un diff compactado, no sobre el árbol completo.
- Funcionamiento en local sobre llama.cpp con dispositivos CPU y GPU Vulkan, y exportación a OpenVINO para NPU y GPU Intel mediante los scripts de smart-commit (exportación no validada para esta versión).
- No soporta tool calling, agentes, visión, audio ni modo de razonamiento extendido: es un modelo de una sola vuelta y una sola tarea.

## Casos de uso

- Generación de mensajes de commit en la CLI smart-commit: se descarga el GGUF y se apunta la variable `SMART_COMMIT_GGUF` al fichero; el modelo recibe el diff y los asuntos recientes y devuelve el mensaje, con reintento y fallback a la lista de ficheros si la respuesta no es utilizable.
- Estandarización de Conventional Commits en un equipo: al condicionarse sobre los asuntos previos del repositorio, mantiene el tipo y el scope habituales y reduce la dispersión de formato sin necesidad de revisión manual de cada commit.
- Entornos con código propietario o air-gapped: al ejecutarse en CPU o iGPU con 398 MB de pesos, el diff nunca sale de la máquina, lo que lo hace apto para sectores con restricciones de salida de datos.
- Equipos de desarrollo sin GPU dedicada: con un rendimiento medido de 324 s para 500 commits en una Intel Arc iGPU (Core Ultra 5 225H), incluyendo reintentos, la latencia por commit queda en torno a 0,65 s, imperceptible dentro del flujo de trabajo.
- Hooks de pre-commit o scripts de CI: el modelo puede invocarse desde un hook para proponer el mensaje antes de que el desarrollador lo edite, o desde un job que valide que el asunto cumple el formato acordado.
- Monorepos con convenciones distintas por directorio: el scope aprendido del historial reciente permite generar mensajes alineados con la convención de la zona del repositorio que se está tocando, siempre que el prompt incluya los asuntos adecuados.
- Investigación sobre generación de mensajes de commit: la receta completa (selección de datos, scripts de entrenamiento y exportación) está publicada, lo que permite reproducir el ajuste o compararlo con otros enfoques sobre CommitChronicle.

## Benchmarks y rendimiento

Evaluación declarada por el autor: eval-v1, 500 commits del split de test de CommitChronicle de repositorios nunca vistos en entrenamiento (250 con Conventional Commits y 250 de formato libre), más eval-short con 197 commits de repositorios jóvenes (1 a 5 asuntos previos). Decodificación greedy, smart-commit en el commit `db389c2`, Vulkan, con reintento y fallback a lista de ficheros.

| Modelo | type_match | scope_known | first_try | fallback | word_f1 | word_f1 (free) | fallback (repos jóvenes) |
|---|---|---|---|---|---|---|---|
| Qwen2.5-Coder-0.5B-Instruct, Q4_K_M original | 0,168 | 0,756 | 0,392 | 0,400 | 0,133 | 0,101 | 0,345 |
| Mismo modelo, recuantizado como este (control) | 0,236 | 0,880 | 0,424 | 0,512 | 0,153 | 0,098 | 0,386 |
| smart-commit-0.5b-v0.1 | 0,640 | 0,856 | 0,980 | 0,012 | 0,342 | 0,233 | 0,091 |

Lectura de las métricas según el autor: type_match mide coincidencia del tipo Conventional Commits con el commit real (responder siempre `fix` daría 0,41); scope_known indica ausencia de scope o un scope ya usado por el repositorio; first_try indica que la primera respuesta fue utilizable; fallback indica que ninguna lo fue y smart-commit redactó el mensaje desde la lista de ficheros; word_f1 es el solapamiento de palabras con el asunto real, un proxy aproximado del contenido. No se han publicado resultados en benchmarks generales (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- Inferencia en Q4_K_M: 398 MB de pesos; con overhead de contexto y runtime de llama.cpp, el consumo realista se sitúa en torno a 0,6-1 GB de memoria.
- Inferencia en bf16: aproximadamente 1 GB de pesos, más KV cache y overhead del runtime.
- Cabe holgadamente en cualquier GPU de consumo con 2 GB o más de VRAM, en iGPU (Vulkan) y en CPU.
- Rendimiento medido: 324 s para 500 commits en una Intel Arc iGPU integrada en Core Ultra 5 225H, reintentos incluidos (≈0,65 s por commit).
- Despliegue documentado: llama.cpp con dispositivos CPU y Vulkan a través de la CLI smart-commit. Para NPU y GPU Intel existe la vía OpenVINO mediante los scripts de exportación del proyecto, pero esa exportación no está validada para este modelo.
- vLLM, TGI y Ollama no están documentados por el autor para este modelo; los safetensors bf16 permiten otros runtimes, pero no hay datos de latencia ni throughput publicados para ellos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | type_match | first_try | word_f1 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| smart-commit-0.5b-v0.1 | 0,49 B | no disponible | 0,640 | 0,980 | 0,342 | Apache-2.0 | safetensors + GGUF Q4_K_M |
| Qwen2.5-Coder-0.5B-Instruct (base, Q4_K_M original) | 0,49 B | no disponible en esta ficha | 0,168 | 0,392 | 0,133 | Apache-2.0 | safetensors + GGUF |
| smart-commit-1.5b-v0.1 (variante del mismo autor) | ~1,5 B | no disponible | no disponible | no disponible | no disponible | no disponible en esta ficha | HuggingFace |

Frente al modelo base, la diferencia no está en capacidad general sino en el ajuste a la tarea y al formato de prompt: la mejora en type_match (0,168 → 0,640) y en first_try (0,392 → 0,980) refleja que el modelo aprende a respetar la convención del repositorio en lugar de responder `fix` por defecto. La variante de 1.5B del mismo autor, según la model card, escribe mensajes más cercanos a los reales y recurre menos al fallback en repositorios jóvenes, a cambio de un coste de inferencia mayor; no se han publicado sus cifras en la información disponible. Frente a un modelo generativo de propósito general (por ejemplo, un 7B invocado por API), este modelo gana en coste, latencia y privacidad, pero pierde cualquier capacidad fuera de la redacción de mensajes de commit.

## Limitaciones y advertencias

- Solo genera mensajes en inglés: los datos de entrenamiento son en inglés y no hay soporte multilingüe declarado.
- Entrenado con el prompt exacto de smart-commit; otros formatos de prompt no están probados y previsiblemente degradan la calidad de forma notable.
- Repositorios jóvenes: con menos de 10 commits previos, a veces repite o parafrasea uno de los asuntos existentes, o la respuesta es inutilizable y se activa el fallback (0,091 en eval-short, frente a 0,012 en eval-v1).
- Puede inventar detalles que el diff no muestra, como un número de versión o la finalidad de un fichero.
- No detecta que los cambios en staging corresponden a varios commits distintos y tiende a condensarlos en un único mensaje.
- No fue reevaluado en eval-v1 con el mapa de uso de scopes que smart-commit añadió después al prompt.
- Riesgo de alucinación relevante en producción: un mensaje de commit incorrecto contamina el historial del repositorio, por lo que se recomienda revisión humana o validación automática del formato antes de aceptarlo.
- Sesgos: no se han publicado análisis de sesgo; el modelo hereda los del base y los del corpus CommitChronicle, sesgado hacia repositorios de código abierto en inglés.
- Licencia de los pesos: Apache-2.0, uso comercial permitido. El dataset CommitChronicle no tiene una licencia única (agrega commits de repositorios MIT, Apache-2.0 y BSD-3-Clause) y exige respetar los términos de cada uno, atribución incluida; el dataset registra los campos `repo` y `license` de cada commit como procedencia.
- Versión 0.1 con receta de entrenamiento en evolución: los resultados pueden cambiar entre publicaciones y las comparaciones entre versiones no están garantizadas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/LucasBRT/smart-commit-0.5b-v0.1
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-0.5B-Instruct
- Repositorio smart-commit: https://github.com/Lucas-BRT/smart-commit
- README de evaluación (eval-v1): https://github.com/Lucas-BRT/smart-commit/blob/training/training/README.md
- Hipótesis y curva de aprendizaje (H3): https://github.com/Lucas-BRT/smart-commit/blob/training/training/HYPOTHESES.md
- Scripts y receta de entrenamiento: https://github.com/Lucas-BRT/smart-commit/tree/training/training
- Dataset CommitChronicle: https://huggingface.co/datasets/JetBrains-Research/commit-chronicle
- Variante de 1.5B: https://huggingface.co/LucasBRT/smart-commit-1.5b-v0.1
