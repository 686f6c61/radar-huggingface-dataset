# hmkang/d1sh-robocasa-pnp

## Resumen

d1sh-robocasa-pnp es un conjunto de checkpoints de ajuste fino supervisado (SFT) sobre modelos de lenguaje y visión (VLM) orientados a robótica, publicados por el usuario hmkang. El objetivo concreto es responder a la "d1-showharness action question" en la tarea de pick-and-place del entorno RoboCasa, emitiendo uno de los 15 tokens de acción discretos del vocabulario robocasa15 (seis variantes MV_*, seis variantes RT_*, más GRASP, RELEASE y DONE). No es, por tanto, un modelo de propósito general, sino un artefacto de investigación para políticas de manipulación discreta.

El repositorio contiene tres configuraciones de entrenamiento sobre dos modelos base distintos: un ajuste fino completo de LiquidAI/d1-3B (9 épocas), un LoRA sobre el mismo d1-3B (1 época) y un LoRA sobre Qwen/Qwen3.5-2B (4 épocas). Los dos últimos aparecen marcados como "not uploaded yet" en la model card, por lo que el único conjunto de pesos efectivamente publicado es el del ajuste completo de d1-3B. El tamaño del repositorio (21,7 GB) es coherente con pesos en precisión completa más los artefactos de entrenamiento.

La relevancia es acotada pero clara para quien trabaje en visión-lenguaje-acción: ofrece una receta reproducible (dataset de tokens discretos, código en GitHub, métricas por época sobre un split de validación por episodios completos) y una línea base calibrada para arrancar entrenamiento por refuerzo. La recomendación del autor es usar la época de menor NLL (época 4), no la de mayor accuracy, por ser la mejor calibrada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language model (VLM) basado en LiquidAI/d1-3B; arquitectura interna del base no detallada en la informacion disponible |
| Parametros totales | 3B (modelo base d1-3B); Qwen3.5-2B para la variante LoRA |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados y cargados en float32, inferencia bajo autocast bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | LFM Open License v1.0 para los pesos derivados de d1-3B; Apache-2.0 para los derivados de Qwen3.5-2B |
| Formato de pesos | safetensors (`d1-3b-full/epoch4/weights.safetensors`); LoRA via PEFT |

## Arquitectura y entrenamiento

El modelo parte de LiquidAI/d1-3B, un VLM con torre de visión congelada durante el ajuste: el código de carga indica que los parámetros ausentes al aplicar el state dict corresponden a la torre de visión y al alias del `lm_head` atado. El ajuste es SFT sobre el dataset hmkang/robocasa-pnp-discrete-tokens (configuración `simplified`), en el que cada muestra empareja observación y pregunta con uno de los 15 tokens de acción discretos. El entrenamiento se ejecutó en float32 con inferencia bajo `torch.autocast('cuda', dtype=torch.bfloat16)`.

La innovación metodológica no está en la arquitectura sino en la formulación del problema: discretizar el espacio de acción de RoboCasa en 15 tokens (seis movimientos MV_*, seis rotaciones RT_*, más GRASP, RELEASE y DONE) permite tratar el control como una tarea de clasificación sobre el vocabulario del VLM, sin cabeza de política separada. El ajuste completo de d1-3B se prolongó 9 épocas; el LoRA sobre d1-3B solo 1 época y el LoRA sobre Qwen3.5-2B 4 épocas. La evaluación se hace sobre un split de validación retenido con episodios completos, midiendo NLL, accuracy top-1 y macro recall al final de cada época. No se detalla en la información disponible el volumen de tokens de entrenamiento ni la composición exacta del dataset.

## Capacidades

- Clasificación de acción robótica discreta: emite uno de los 15 tokens del vocabulario robocasa15 a partir de una observación visual y una pregunta de acción.
- Percepción visual integrada mediante la torre de visión del modelo base (congelada durante el SFT).
- Tarea pick-and-place en el simulador RoboCasa, incluyendo aproximación (MV_*), rotación (RT_*), agarre (GRASP), liberación (RELEASE) y terminación (DONE).
- Punto de partida para entrenamiento por refuerzo: el autor identifica explícitamente la época de menor NLL como política mejor calibrada para inicializar RL.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible como capacidad general; el bucle de control se gestiona externamente al modelo.
- Capacidades multilingües: no disponible.
- Modo thinking, audio u otras modalidades: no disponible.

## Casos de uso

- Investigación en políticas discretas de manipulación: usar el checkpoint `d1-3b-full/epoch4` como línea base reproducible para comparar nuevas formulaciones de acción discreta frente a políticas continuas en RoboCasa.
- Inicialización de RL: arrancar entrenamiento por refuerzo desde la época de menor NLL (0,9158) para evitar políticas sobreconfiadas que dificulten la exploración.
- Evaluación de ajuste completo frente a LoRA: el repositorio documenta ambas configuraciones con las mismas métricas y split, lo que permite medir la brecha de rendimiento entre full fine-tune y PEFT en tareas de control visomotor.
- Estudio de calibración en robótica: la discrepancia entre accuracy top-1 y NLL a lo largo de las épocas (la accuracy sube mientras el NLL empeora) es un caso concreto para analizar sobreconfianza en políticas discretas.
- Replicación de experimentos: el dataset de tokens discretos y el repositorio de código en la rama `hyeonmo/robocasa-rotate` permiten reproducir el pipeline completo de tokenización de acciones y SFT.
- Comparación entre modelos base: la inclusión de una variante sobre Qwen3.5-2B (aunque no publicada aún) sirve para contrastar cómo distintos VLM se adaptan a la misma tarea de acción discreta.
- Prototipado de interfaces visión-lenguaje-acción: validar si un VLM de 3B puede sostener una política de pick-and-place con solo 15 tokens de salida antes de invertir en modelos mayores.

## Benchmarks y rendimiento

Resultados sobre el split de validación retenido (episodios completos), evaluados al final de cada época:

| Configuracion | Epocas | Mejor NLL (epoca) | Mejor accuracy (epoca) | Mejor macro recall (epoca) | Recomendado |
|---|---|---|---|---|---|
| d1-3B full fine-tune | 9 | 0.9158 (4) | 0.7120 (4) | 0.5678 (3) | `d1-3b-full/epoch4` |
| d1-3B LoRA | 1 | 1.1119 (1) | 0.6930 (1) | 0.4373 (1) | `d1-3b-lora/epoch1` |
| Qwen3.5-2B LoRA | 4 | 0.9250 (4) | 0.7079 (4) | 0.5557 (3) | `qwen3.5-2b-lora/epoch4` |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible; las métricas anteriores son específicas de la tarea RoboCasa pick-and-place.

## Requisitos de hardware

- VRAM estimada para inferencia: el código de carga usa float32 para los pesos de 3B, lo que implica del orden de 12 GB solo en pesos, más activaciones y torre de visión; con autocast bfloat16 el peso efectivo baja a unos 6 GB, pero la carga inicial en float32 condiciona el pico de memoria.
- GPU recomendadas: no hay datos publicados de latencia ni throughput; por tamaño, una GPU de 24 GB (RTX 4090, L4, A10G) debería cubrir la carga en float32 con margen ajustado, y A100/H100 ofrecen holgura para lotes mayores.
- Cabe en GPU de consumo: sí, previsiblemente en RTX 4090 (24 GB) y posiblemente en GPUs de 16 GB si se adapta la carga a bfloat16 o se cuantiza, aunque el autor no documenta estos caminos.
- Opciones de despliegue: carga vía `transformers` con `trust_remote_code=True` sobre la revisión fijada del modelo base, y `PeftModel.from_pretrained` para las variantes LoRA. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| d1sh-robocasa-pnp (d1-3B full) | 3B | no disponible | Pick-and-place RoboCasa, 15 tokens discretos | LFM Open License v1.0 | Pesos publicados |
| d1sh-robocasa-pnp (Qwen3.5-2B LoRA) | 2B | no disponible | Misma tarea | Apache-2.0 | Pesos no subidos aún |
| LiquidAI/d1-3B (base) | 3B | no disponible | VLM general | LFM Open License v1.0 | Público |
| Qwen/Qwen3.5-2B (base) | 2B | no disponible | VLM general | Apache-2.0 | Público |

No se dispone de datos de benchmarks de políticas robóticas alternativas en la información proporcionada para establecer una comparación de rendimiento con otros modelos de la misma categoría.

## Limitaciones y advertencias

- Alcance muy restringido: el modelo solo responde a la pregunta de acción de d1-showharness en RoboCasa pick-and-place; no es utilizable como VLM general ni como política para otras tareas.
- Rendimiento moderado: la mejor accuracy top-1 es 0,7120 y el mejor macro recall 0,5678, lo que implica que clases minoritarias del vocabulario de 15 tokens se predicen con frecuencia errónea.
- Sobreconfianza en épocas tardías: el propio autor advierte que épocas posteriores pueden subir la accuracy mientras el NLL empeora; usar el checkpoint de mayor accuracy sin comprobar la calibración es un riesgo en producción.
- Dos de las tres configuraciones (ambos LoRA) no están subidas, por lo que las cifras correspondientes no son verificables con los pesos publicados.
- La torre de visión queda congelada y el `lm_head` está atado; cualquier modificación del pipeline de carga debe respetar el `strict=False` y la comprobación de claves inesperadas.
- Licencia dual según el modelo base: LFM Open License v1.0 para los derivados de d1-3B (con posibles restricciones de uso comercial que deben revisarse en el enlace de licencia) y Apache-2.0 para los derivados de Qwen3.5-2B.
- No hay información sobre sesgos, idiomas soportados ni comportamiento fuera del dominio simulado; no se ha validado en robot real según la información disponible.
- Riesgo de alucinación de tokens: al formular la acción como texto, el modelo podría emitir tokens fuera del vocabulario robocasa15 si no se restringe la decodificación.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de uso independiente ni validación por terceros.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/hmkang/d1sh-robocasa-pnp
- Dataset de entrenamiento: https://huggingface.co/datasets/hmkang/robocasa-pnp-discrete-tokens
- Código de entrenamiento (rama `hyeonmo/robocasa-rotate`): https://github.com/JunHoo-Lee/d1-showharness-rl/tree/hyeonmo/robocasa-rotate
- Modelo base LiquidAI/d1-3B: https://huggingface.co/LiquidAI/d1-3B
- Licencia del modelo base: https://huggingface.co/LiquidAI/d1-3B/blob/main/LICENSE
- Modelo base Qwen/Qwen3.5-2B: https://huggingface.co/Qwen/Qwen3.5-2B
