# chengjunyan1/oss-skills-libero-aspire-issues-rl-s1

## Resumen

`chengjunyan1/oss-skills-libero-aspire-issues-rl-s1` es un ajuste fino por aprendizaje por refuerzo del modelo multimodal Qwen/Qwen3.5-9B, publicado por el usuario chengjunyan1 como artefacto experimental del trabajo *Growing Agent Skill Libraries as Open-Source Projects*. El modelo no es un asistente conversacional de propósito general: es una política (policy) entrenada para escribir programas Python que controlan un brazo robótico en el entorno de manipulación de sobremesa LIBERO, y programas JavaScript para el entorno Minecraft (Mineflayer), dentro del arnés de agente definido por los autores.

El entrenamiento combina una fase de SFT (tres épocas sobre 420 episodios exitosos de LIBERO-90 repartidos en 55 tareas) con GRPO de parámetros completos sobre 37 tareas de entrenamiento no reservadas. La peculiaridad metodológica es la ronda "issues only": los desarrolladores abren y discuten issues sobre la biblioteca de habilidades, pero no envían pull requests; el mantenedor publica la siguiente versión de la biblioteca a partir de esas discusiones. El checkpoint publicado es el paso 260 de 300, seleccionado por regla pair-DEV.

Arquitectura y tokenizador son los de Qwen3.5-9B, incluida su torre de visión, aunque la política se emplea en modo solo texto. El repositorio contiene un único `model.safetensors` en bf16 (9.409.813.744 parámetros en 760 tensores) más el directorio `library/` con la versión de la biblioteca de habilidades (v0025) con la que se evaluó el checkpoint. La licencia es Apache 2.0 y el modelo base también lo es, lo que facilita su reutilización, aunque su valor práctico está acotado al dominio robótico para el que fue entrenado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal Qwen3.5 (incluye torre de visión); uso efectivo solo texto |
| Parametros totales | 9.409.813.744 (760 tensores) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens en el servicio de referencia (`--max-model-len 32768`); contexto nativo del base no disponible en la informacion proporcionada |
| Tipos de cuantizacion | pesos publicados en bf16; no se documentan cuantizaciones GGUF/AWQ/GPTQ en la model card |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (un único `model.safetensors`, 18.819.722.392 bytes) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura completa de Qwen3.5-9B, incluida la torre de visión, aunque la política se ejecuta en modo texto. Sobre ese punto de partida se aplica un SFT de tres épocas con 420 episodios exitosos de LIBERO-90 sobre 55 tareas, y después GRPO de parámetros completos con verl (FSDP, bf16, rollouts con vLLM) en un nodo de ocho H100. La configuración de RL es: 37 tareas de entrenamiento no reservadas de LIBERO-90, 8 prompts × 8 rollouts por paso, ventajas normalizadas por grupo, una actualización por paso, 300 pasos, KL de baja varianza de 1e-2 respecto a la política SFT, learning rate 1e-6 tras 10 pasos de calentamiento con decaimiento coseno hasta 1e-7, rechazo a nivel de secuencia con umbral 1e-2, rollouts a temperatura 1 con thinking desactivado y guardado cada 20 pasos. El entrenamiento se ejecutó entre el 16 y el 18 de noviembre de 2026 en el nodo `slurm2-a3nodeset1-0`.

La innovación metodológica no está en la arquitectura sino en el bucle de datos: la ronda de código abierto simulada es "issues only" (`LEVO_SYS3_ROUND=issues`), en la que los desarrolladores solo abren y discuten issues y el mantenedor publica la siguiente versión de la biblioteca de habilidades a partir de ellos. El checkpoint publicado corresponde al paso 260, elegido mediante una regla pair-DEV que reporta un 57,14 % en DEV (intervalo [47,64; 66,14]). No se liberan estados del optimizador ni otros pasos intermedios.

## Capacidades

- Generación de código ejecutable: escribe programas Python sobre la API de robot de LIBERO y JavaScript para Mineflayer, no respuestas en lenguaje natural.
- Razonamiento multi-paso dentro del arnés de agente: la política recibe la biblioteca de habilidades renderizada en el prompt y produce el siguiente programa.
- Uso de una biblioteca de habilidades externa: `README.md`, `grasp.md`, `localize.md`, `manipulation.md` y `transport.md` se inyectan en el contexto; `LIBRARY.json` y `PROVENANCE.md` son metadatos y no se renderizan.
- Manipulación robótica de sobremesa: agarre, localización, manipulación y transporte de objetos en LIBERO.
- Capacidad multimodal heredada de Qwen3.5 (torre de visión presente en los pesos), aunque la política se usa en modo solo texto.
- Modo thinking desactivable mediante `chat_template_kwargs={"enable_thinking": false}`, que es la configuración de decodificación usada en la evaluación.
- Soporte de tool calling / function calling: no documentado en la información proporcionada.
- Capacidades multilingües: no documentadas.

## Casos de uso

- Investigación en aprendizaje por refuerzo para agentes: sirve como checkpoint de referencia reproducible de la fila "+ issues, RL (seed 1)" del artículo, con configuración de entrenamiento y regla de selección documentadas, para comparar variantes del bucle de biblioteca de habilidades.
- Evaluación de bibliotecas de habilidades como artefacto de ingeniería: permite medir cómo distintas versiones de `library/` (aquí v0025) afectan al éxito en LIBERO-90 y LIBERO-10 manteniendo fijos los pesos.
- Generación de políticas robóticas en LIBERO: el modelo produce programas Python que el arnés ejecuta contra la API del simulador, adecuado para experimentos de manipulación de sobremesa sin entrenar desde cero.
- Agentes en Minecraft: la model card indica que la política escribe JavaScript para Mineflayer, lo que permite usarla en tareas de agente dentro de ese entorno.
- Estudio de dinámicas de colaboración tipo issues: al haberse entrenado con una ronda "issues only", es un punto de comparación para investigar si la discusión sin pull requests basta para mejorar la biblioteca.
- Reproducción de la selección de checkpoints: la regla pair-DEV y la curva DEV están publicadas en `chengjunyan1/oss-skills-records`, lo que permite auditar la elección del paso 260 frente a otros pasos guardados cada 20.
- Base para ajuste posterior: al ser un fine-tune de Qwen3.5-9B con licencia Apache 2.0, puede servir como inicialización para dominios robóticos o de agente relacionados.

## Benchmarks y rendimiento

Resultados de TEST publicados en la model card (protocolo descrito en el apéndice del artículo). La nomenclatura E1/E2 corresponde a los conjuntos de evaluación definidos por los autores.

| Metrica | Valor |
|---|---|
| TEST xfer E1 (paso 260 + v0025) | 52,67 |
| TEST xfer E2 (paso 260 + v0025) | 15,89 |
| DEV pair (regla de selección) | 57,14 % [47,64; 66,14] |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni de benchmarks de propósito general; el modelo está entrenado para una tarea concreta y esas cifras no serían representativas.

## Requisitos de hardware

- VRAM estimada en bf16: en torno a 19 GB solo para pesos (18,82 GB de fichero), más caché KV y activaciones; con 32.768 tokens de contexto conviene reservar 40-80 GB según lote y longitud efectiva.
- GPU recomendadas: H100 (es la GPU usada en el entrenamiento y en el servicio de referencia con vLLM); A100 80 GB es una alternativa razonable para bf16.
- GPU de consumo: no cabe en tarjetas de 16 GB en bf16; en GPUs de 24 GB (RTX 3090/4090) requeriría cuantización, que no está publicada en el repositorio.
- Despliegue: `vllm serve ... --language-model-only --max-model-len 32768` es el comando documentado por el autor; también es cargable con `transformers` mediante `AutoModelForImageTextToText` y `AutoTokenizer` con `dtype="bfloat16"` y `device_map="auto"`.
- Decodificación de referencia en TEST: temperatura 0, 2.048 tokens por turno, 6.144 por episodio, thinking desactivado.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| Este modelo (oss-skills-libero-aspire-issues-rl-s1) | 9,41 B | 32.768 en servicio | Apache 2.0 | Política de código para LIBERO/Minecraft tras SFT + GRPO |
| Qwen/Qwen3.5-9B (base) | 9 B (aprox.) | no disponible | Apache 2.0 | Modelo multimodal generalista; sin entrenamiento específico de política |
| Checkpoints SFT de la misma fila | 9,41 B | 32.768 en servicio | Apache 2.0 | Punto de partida del RL; sin GRPO |
| Otros checkpoints de la misma familia (otras semillas o rondas) | 9,41 B | 32.768 en servicio | Apache 2.0 | Variantes del bucle de biblioteca de habilidades; métricas en `chengjunyan1/oss-skills-records` |

No se dispone en la información proporcionada de comparaciones con políticas robóticas de terceros (por ejemplo, modelos específicos de manipulación) ni de sus cifras en LIBERO, por lo que la comparativa se limita a la propia familia.

## Limitaciones y advertencias

- Especialización estrecha: es una política para LIBERO y Mineflayer dentro de un arnés concreto; fuera de ese contexto su comportamiento no está caracterizado.
- Dependencia de la biblioteca: el rendimiento reportado está ligado a la versión v0025 de `library/`; usar otra versión invalida las cifras de TEST.
- Resultados preliminares: la propia model card califica las cifras de "preliminary" y remite a un artículo aún sin referencia de publicación.
- E2 bajo (15,89) frente a E1 (52,67): indica una transferencia desigual entre conjuntos de evaluación.
- Sin datos de sesgos, alucinación o comportamiento fuera de distribución; no hay evaluaciones de seguridad publicadas.
- Idiomas no documentados: no se puede asumir calidad multilingüe.
- Solo se libera el paso 260: no hay estados del optimizador ni curva completa de pesos, lo que limita la reproducibilidad exacta del entrenamiento.
- Licencia Apache 2.0 permite uso comercial, pero las dependencias del arnés y de los simuladores (LIBERO, Mineflayer) tienen sus propias condiciones que deben revisarse por separado.
- El uso de la torre de visión no está validado: los pesos la incluyen, pero la política se emplea en modo solo texto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/chengjunyan1/oss-skills-libero-aspire-issues-rl-s1
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Dataset y registros del proyecto: https://huggingface.co/datasets/chengjunyan1/oss-skills-records
- Repositorio de registros de la ejecución (curva DEV, versiones de biblioteca, rondas): `chengjunyan1/oss-skills-records`, carpeta `rl-runs/libero-aspire-issues-rl-s1/`
- Artículo: referencia pendiente de publicación según la model card (no disponible)
- Repositorio de código del arnés y del entrenamiento: no disponible en la información proporcionada
- Demo: no disponible
