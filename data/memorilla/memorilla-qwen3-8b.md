# memorilla/Memorilla-Qwen3-8B

## Resumen
Memorilla-Qwen3-8B es un conjunto de checkpoints de modulos de memoria latente desarrollados por el equipo de Memorilla (proyecto asociado a Stanford SNAP, con Jure Leskovec entre los autores). No es un modelo de lenguaje autonomo: se trata de modulos de memoria de 194M parametros que se acoplan a un decoder Qwen3-8B congelado y a un encoder Qwen3-Embedding-4B congelado, ambos de Alibaba, para dotar al modelo base de memoria semantica persistente orientada a contextos largos.

El repositorio contiene cinco recetas o checkpoints (stage1, stage2, stage3, pv4 y pmv2). Cada carpeta incluye un fichero memory.pt en bfloat16 (194M parametros) y un config.json que define 16 memory tokens y sin self-attention de documento. El modulo no reentrena ni modifica los pesos de Qwen3: solo anade una capa de memoria entrenada sobre features congelados.

La relevancia actual reside en que ofrece una via modular y de bajo coste (194M parametros entrenables) para extender la ventana efectiva y la persistencia de conocimiento de un modelo denso de 8.2B como Qwen3-8B, sin tocar el backbone. Su publicacion se asocia al paper "Memorilla: Latent Semantic Memory for LLMs" presentado en el COLM Workshop on Context Beyond the Window.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modulo de memoria latente (16 memory tokens) sobre decoder denso Qwen3-8B congelado y encoder Qwen3-Embedding-4B congelado |
| Parametros totales | 194M por checkpoint (solo el modulo de memoria); no incluye el modelo base |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (depende del modelo base Qwen3-8B; el modulo aporta 16 memory tokens) |
| Tipos de cuantizacion | No disponible (pesos del modulo en bfloat16) |
| Idiomas soportados | No disponible (el base Qwen3-8B declara soporte de 119 idiomas) |
| Licencia | apache-2.0 |
| Formato de pesos | PyTorch (.pt, bfloat16) mas config.json |
| Modelo base | Qwen/Qwen3-8B y Qwen/Qwen3-Embedding-4B |
| Tamano del repositorio | 1.9 GB |

## Arquitectura y entrenamiento
Memorilla es una propuesta de memoria semantica latente: en lugar de ampliar el contexto del decoder o reentrenar sus pesos, se introduce un modulo entrenable que genera 16 memory tokens que se inyectan en el flujo del Qwen3-8B congelado, apoyandose en representaciones del encoder Qwen3-Embedding-4B, tambien congelado. La configuracion del modulo indica explicitamente 16 memory tokens y ausencia de self-attention de documento, lo que define un mecanismo de memoria compacto y de bajo coste computacional anadido.

El entrenamiento se organizo en tres etapas progresivas mas dos ajustes especificos. La etapa 1 (stage1) usa la receta `stage1_enwiki.yaml`, presumiblemente sobre Wikipedia en ingles. La etapa 2 (stage2) continua desde stage1 con la receta `stage2_mixture.yaml`, ampliando a una mezcla de datos. La etapa 3 (stage3, `epoch-00`) continua desde stage2 con la receta `stage3_multitask.yaml`. A partir de stage1 se entrenan dos variantes de personalizacion: pv4 (PersonalizationV4) y pmv2 (PersonaMem-v2), ambas con la receta `single_task.yaml`. No se especifica en la informacion disponible el numero total de tokens de entrenamiento, la composicion exacta de los datasets ni si se emplearon tecnicas de RLHF o DPO.

## Capacidades
- Memoria latente persistente: el modulo anade 16 memory tokens que representan informacion retenida mas alla de la ventana nativa del decoder, orientada a tareas de contexto largo.
- Extensibilidad sobre Qwen3-8B: hereda las capacidades del base (razonamiento, generacion de texto, codigo, matematicas, modo thinking/non-thinking y tool calling via MCP), ya que el decoder permanece congelado.
- Personalizacion: los checkpoints pv4 (PersonalizationV4) y pmv2 (PersonaMem-v2) estan ajustados especificamente para tareas de memoria personal, presumiblemente adaptacion al usuario a lo largo de interacciones.
- Multilingue: el modulo no declara idiomas propios; la cobertura linguistica depende del Qwen3-8B subyacente (119 idiomas declarados por Alibaba).
- Pipeline modular: entrenamiento y evaluacion se orquestan con scripts (`scripts/train.sh`, `scripts/evaluate.sh`) y soportan inicializacion desde un checkpoint previo mediante `--init_memory`.

## Casos de uso
- Asistentes conversacionales con memoria de usuario a largo plazo: el checkpoint pmv2 (PersonaMem-v2) esta disenado para retener preferencias y datos personales entre sesiones, reduciendo la necesidad de repetir contexto en cada turno.
- Personalizacion de agentes: con pv4 se puede ajustar el modulo a un dominio o usuario concreto sin reentrenar el modelo base, lo que abarata el despliegue de asistentes especializados.
- Recuperacion aumentada con memoria latente: en lugar de inyectar documentos completos en el prompt, el encoder Qwen3-Embedding-4B alimenta representaciones que el modulo condensa en memory tokens, util para responder sobre corpus extensos.
- Evaluacion de investigacion en memoria de LLM: los checkpoints stage1, stage2 y stage3 permiten reproducir el escalado por etapas del paper y comparar recetas (`stage1_enwiki`, `stage2_mixture`, `stage3_multitask`).
- Asistentes de soporte tecnico con conocimiento persistente de producto: combinando Qwen3-8B con el modulo de memoria, se puede mantener coherencia sobre un catalogo o manual extenso durante conversaciones multi-turno.
- Prototipado rapido de memoria semantica: al requerir solo 194M parametros entrenables, es viable iterar recetas y experimentos en hardware de gama media-alta sin reentrenar el backbone de 8.2B.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de MMLU, HumanEval, GSM8K ni metricas de memoria de contexto largo para ninguno de los cinco checkpoints.

## Requisitos de hardware
- VRAM estimada para inferencia: el modulo de memoria aporta unos 194M parametros (menos de 0.4 GB en bfloat16), pero requiere cargar simultaneamente el decoder Qwen3-8B (aproximadamente 16 GB en bfloat16) y el encoder Qwen3-Embedding-4B (aproximadamente 8 GB en bfloat16). El total ronda los 25 GB solo en pesos, mas cache KV y activaciones.
- Configuracion completa en bfloat16: se recomienda una GPU con 40-48 GB o superior (A100 40/80 GB, H100 80 GB, L40S 48 GB), o bien varias GPU con tensor parallelism.
- GPU consumer: no cabe el stack completo en bfloat16 en una RTX 4090 (24 GB). Seria necesario cuantizar el modelo base o repartir decoder y encoder entre dispositivos. Una RTX 4090 con 24 GB podria alojar componentes si se cuantizan a 4-8 bits, pero el soporte de cuantizacion del modulo y del pipeline no esta documentado.
- Opciones de despliegue: los checkpoints se cargan con el paquete Python `memorilla` (`MemoryModule.from_pretrained`). No se menciona compatibilidad con vLLM, llama.cpp, Ollama, TGI ni otros servidores de inferencia estandar.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Memorilla-Qwen3-8B | 194M (modulo) + 8.2B decoder + 4B encoder | No disponible (depende del base) | Modulo de memoria latente | apache-2.0 | HuggingFace + GitHub SNAP |
| Qwen3-8B | 8.2B | No disponible en esta ficha (base de 36 capas, GQA) | Transformer denso | apache-2.0 | HuggingFace |
| Qwen3-Embedding-4B | 4B | No disponible | Encoder de embeddings | apache-2.0 | HuggingFace |

No se dispone de informacion sobre otros modulos de memoria comparables (por ejemplo, variantes de MemGPT, Mem0 u otras implementaciones) dentro de la documentacion proporcionada, por lo que la comparativa se limita a los componentes base de este stack.

## Limitaciones y advertencias
- No es un modelo autonomo: sin el decoder Qwen3-8B y el encoder Qwen3-Embedding-4B no es utilizable, y requiere el paquete Python `memorilla` para cargarse.
- Fechas de creacion y actualizacion (octubre de 2026) situadas en el futuro respecto a la fecha de consulta habitual; conviene verificar la integridad y procedencia de los ficheros.
- Sin validacion de la comunidad: 0 descargas y 0 likes en el momento de la ficha, por lo que no hay evidencia externa de calidad ni de reproducibilidad de resultados.
- Soporte de despliegue limitado: no se documenta compatibilidad con vLLM, TGI, llama.cpp u Ollama, lo que complica su integracion en produccion.
- Idiomas no declarados para el modulo; la cobertura multilingue depende exclusivamente del base Qwen3-8B.
- Sesgos y alucinaciones: al reutilizar el backbone Qwen3-8B congelado, hereda los sesgos y errores de ese modelo, sin que el modulo los corrija.
- Restricciones de licencia: licencia apache-2.0, que permite uso comercial, pero debe verificarse que las condiciones de los modelos base (Qwen3-8B y Qwen3-Embedding-4B, tambien apache-2.0) se cumplan conjuntamente.
- Documentacion escasa: no se detallan volumen de datos de entrenamiento, hiperparametros completos ni metricas de evaluacion, lo que limita la reproducibilidad.

## Enlaces
- HuggingFace: https://huggingface.co/memorilla/Memorilla-Qwen3-8B
- Repositorio GitHub de Memorilla: https://github.com/snap-stanford/memorilla
- Paper (COLM Workshop): https://openreview.net/forum?id=VV0vvzL783
- Guia de entrenamiento: https://github.com/snap-stanford/memorilla/blob/main/docs/training.md
- Receta stage1: https://github.com/snap-stanford/memorilla/blob/main/configs/stage1_enwiki.yaml
- Receta stage2: https://github.com/snap-stanford/memorilla/blob/main/configs/stage2_mixture.yaml
- Receta stage3: https://github.com/snap-stanford/memorilla/blob/main/configs/stage3_multitask.yaml
- Receta single_task (pv4 y pmv2): https://github.com/snap-stanford/memorilla/blob/main/configs/single_task.yaml
- Modelo base Qwen3-8B: https://huggingface.co/Qwen/Qwen3-8B
- Encoder base Qwen3-Embedding-4B: https://huggingface.co/Qwen/Qwen3-Embedding-4B
