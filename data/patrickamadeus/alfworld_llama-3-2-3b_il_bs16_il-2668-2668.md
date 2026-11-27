# patrickamadeus/alfworld_Llama-3.2-3B_IL_bs16_IL.2668.2668

## Resumen

`alfworld_Llama-3.2-3B_IL_bs16_IL.2668.2668` es un ajuste fino completo (full fine-tune) de `meta-llama/Llama-3.2-3B-Instruct` realizado por el usuario patrickamadeus sobre el benchmark ALFWorld (tareas domésticas de TextWorld). El modelo no es un asistente generalista, sino un agente especializado que aprende a mapear estados textuales del entorno a acciones válidas mediante aprendizaje por imitación (imitation learning, IL) sobre trayectorias de experto.

El entrenamiento se realizó con LlamaFactory en modo SFT, con un batch efectivo de 16 filas por paso, learning rate 1e-5, schedule coseno con 3 % de warmup, bf16 y AdamW paginado de 8 bits, longitud máxima de 4.096 tokens y semilla 0. Se ejecutaron 2.668 pasos, equivalentes a 2,00 épocas sobre las 21.335 filas de experto publicadas en `osunlp/early-experience` (subconjunto `alfworld/`). El nombre del repositorio codifica la convención de etapas del proyecto de investigación del autor.

Su relevancia es acotada: se trata de un artefacto de investigación reproducible (run `alf2`, rama `runs/faithful` del repositorio `imagined-experience`) que sirve para estudiar el efecto del aprendizaje por imitación frente a variantes como el modelado implícito del mundo o la autorreflexión en tareas de agente. No está pensado para uso general ni para producción fuera del dominio ALFWorld.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.2), ajuste fino completo de `meta-llama/Llama-3.2-3B-Instruct` |
| Parametros totales | 3.212.749.824 (3,21 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4.096 tokens (longitud máxima de entrenamiento); contexto nativo del modelo base: no disponible en la información proporcionada |
| Tipos de cuantizacion | no disponible (el repo contiene safetensors en bf16; no se publican GGUF ni cuantizaciones) |
| Idiomas soportados | no disponible (no se declaran idiomas en la model card; hereda los del modelo base Llama 3.2) |
| Licencia | llama3.2 (Llama 3.2 Community License) |
| Formato de pesos | safetensors (tamaño del repo: 12,9 GB) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de la familia Llama 3.2 con 3,21 mil millones de parámetros, inicializado desde `meta-llama/Llama-3.2-3B-Instruct` y ajustado de forma completa (sin LoRA ni adaptadores) mediante SFT supervisado con LlamaFactory. La tarea es aprendizaje por imitación sobre pares (estado textual del entorno → acción) extraídos de trayectorias de experto de ALFWorld. La configuración exacta es: lr 1e-5, schedule coseno con 3 % de warmup por etapa, precisión bf16, optimizador paged AdamW 8-bit, longitud máxima 4.096 tokens y semilla 0.

Los datos provienen del dataset `osunlp/early-experience` (subdirectorio `alfworld/`), usado sin modificaciones, con 21.335 filas de experto. El checkpoint publicado corresponde al paso 2.668 de 2.668, es decir, 2,00 épocas completas sobre ese conjunto, con batch efectivo de 16. No se aplicaron etapas de RLHF ni DPO; el nombre del repositorio indica una única etapa de IL finalizada. La nomenclatura `benchmark_modelo_ARM_bsN_LABEL.paso.pasos` documenta cada etapa de entrenamiento y permite distinguir checkpoints intermedios de finales.

## Capacidades

- Generación de acciones para tareas domésticas de ALFWorld a partir de la descripción textual del estado del entorno.
- Razonamiento de un solo paso orientado a política (state → action), no a diálogo abierto.
- Seguimiento de instrucciones de tarea en formato TextWorld/ALFWorld.
- Herencia del modelo base Llama 3.2 3B Instruct en generación de texto general, aunque el ajuste fino está fuertemente sesgado al dominio ALFWorld.
- Soporte de tool calling / function calling: no disponible de forma específica; el modelo base lo soporta, pero el ajuste no lo preserva necesariamente.
- Soporte de agentes multi-paso: sí, en el bucle de interacción de ALFWorld (hasta 50 pasos por episodio según la evaluación).
- Capacidades multilingües: no disponible (no se declaran).
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Investigación en aprendizaje por imitación para agentes: usar el checkpoint como línea base IL (78,1 % reportado en el paper para Llama-3.2-3B) frente a variantes de modelado implícito del mundo (83,6 %) o autorreflexión (85,9 %).
- Reproducibilidad de experimentos: el run `alf2`, rama `runs/faithful`, con decisiones D-41, D-43 y D-44 documentadas en `DECISIONS.md`, permite replicar exactamente el ajuste con LlamaFactory.
- Evaluación de políticas de agente en entornos TextWorld: el modelo puede conectarse al entorno ALFWorld para medir success rate en `valid_seen` y `valid_unseen`.
- Estudio de generalización: comparar el rendimiento en juegos vistos (73,1 %) frente a no vistos (60,0 %) para analizar sobreajuste al conjunto de entrenamiento.
- Generación de trayectorias sintéticas de experto: usar el modelo para producir acciones candidatas que luego se filtren y se reutilicen en etapas posteriores de entrenamiento.
- Análisis de calibración y temperatura: la evaluación se realizó con temperatura 0,4 y top_p 1,0; el checkpoint sirve para estudiar cómo varía el success rate con distintos parámetros de decodificación.
- Docencia y demostraciones de agentes basados en LLM: ejemplo compacto (3B) de cómo un LLM pequeño puede resolver tareas de planificación de horizonte corto en un entorno simbólico.

## Benchmarks y rendimiento

Resultados publicados en la model card. Success rate (%) con 3 episodios por juego, temperatura 0,4, top_p 1,0, 50 pasos, media sobre juegos con IC del 95 %.

| Split | Media de 3 muestras | Primera muestra |
|---|---|---|
| valid_seen (140 juegos) | 73,1 (66,7–79,0) | 72,1 (65,0–79,3) |
| valid_unseen (134 juegos) | 60,0 (52,7–66,9) | 60,4 (52,2–68,7) |

Referencia del paper (Early Experience, Tabla 4, Llama-3.2-3B, ALFWorld):

| Variante | Success rate (%) |
|---|---|
| Imitation learning | 78,1 |
| Implicit world modeling | 83,6 |
| Self-reflection | 85,9 |

No se han publicado resultados de otros benchmarks (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 6,4 GB solo para pesos (3,21 B × 2 bytes), más overhead de activaciones y KV cache; en la práctica, entre 8 y 10 GB con contexto de 4.096 tokens.
- VRAM estimada en cuantización de 8 bits: alrededor de 3,2 GB de pesos; en 4 bits, alrededor de 1,6 GB (no se publican GGUF, habría que convertir).
- GPU recomendadas: A100 40/80 GB, H100, L40S para despliegue concurrente; RTX 4090 (24 GB) para inferencia holgada en bf16.
- Cabe en GPU de consumo: sí, en RTX 4090, RTX 3090, RTX 4080 (16 GB) e incluso en GPUs de 12 GB si se cuantiza a 8 bits.
- Opciones de despliegue: vLLM, TGI, llama.cpp (previa conversión a GGUF), Ollama (previa conversión), Transformers con `device_map="auto"`.
- Latencia y throughput: no disponible (no se publican mediciones).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | ALFWorld success rate | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (IL, Llama-3.2-3B) | 3,21 B | 4.096 (entrenamiento) | 73,1 % valid_seen / 60,0 % valid_unseen | llama3.2 | Hugging Face |
| Variante implicit world modeling (paper) | 3,21 B | 4.096 | 83,6 % | llama3.2 | Paper (no se indica checkpoint público) |
| Variante self-reflection (paper) | 3,21 B | 4.096 | 85,9 % | llama3.2 | Paper (no se indica checkpoint público) |
| Llama-3.2-3B-Instruct (base) | 3,21 B | no disponible | no disponible | llama3.2 | Hugging Face |

## Limitaciones y advertencias

- Especialización extrema: el modelo está ajustado para ALFWorld y probablemente degrada su comportamiento como asistente general respecto al modelo base.
- Sesgo de dominio: entrenado únicamente con 21.335 filas de experto de ALFWorld; no generaliza a otros entornos sin reentrenamiento.
- Brecha visto/no visto: 73,1 % frente a 60,0 %, lo que indica sobreajuste parcial a los juegos de `valid_seen`.
- Riesgo de alucinación de acciones: puede emitir acciones no válidas en el espacio de acciones de ALFWorld, lo que provoca fallos de episodio.
- Idiomas: no se declaran; no se recomienda su uso en tareas multilingües.
- Restricciones de licencia: Llama 3.2 Community License; requiere cumplir la política de uso aceptable de Meta y la cláusula de atribución "Built with Llama".
- Sin datos de producción: cero descargas y cero likes en el momento de la consulta; no hay evidencia de uso fuera del proyecto de investigación.
- No se publican cuantizaciones, tokenizador específico ni pipeline declarado; el uso requiere cargar manualmente el tokenizador del modelo base.
- Resultados con alta varianza: intervalos de confianza del 95 % de ±6 puntos en `valid_seen` y `valid_unseen` con solo 3 episodios por juego.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/patrickamadeus/alfworld_Llama-3.2-3B_IL_bs16_IL.2668.2668
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-3B-Instruct
- Dataset de entrenamiento: https://huggingface.co/datasets/osunlp/early-experience
- Repositorio del proyecto: https://github.com/patrickamadeus/imagined-experience
- Paper Early Experience (referenciado en la model card; Tabla 4): no disponible el enlace directo en la información proporcionada
- Documentación de Llama 3.2: no disponible en la información proporcionada
