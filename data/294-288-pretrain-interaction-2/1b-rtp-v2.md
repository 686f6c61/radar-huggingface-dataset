# 294-288-pretrain-interaction-2/1B-rtp-v2

## Resumen

1B-rtp-v2 es un modelo de lenguaje de aproximadamente 1B parámetros desarrollado por el colectivo 294-288-pretrain-interaction-2, derivado de la arquitectura Pythia-1B. El modelo forma parte de un experimento de investigación sobre interacción entre datos de preentrenamiento: se entrena sobre 100B tokens (762.939 pasos) con un recetario idéntico al de la familia 1B-fixed-v2, variando únicamente los 512 tokens objetivo de cada fila de payload. El identificador "rtp-MCG-r{1,2,4,8,16,32}" sugiere una configuración de razones de repetición (repetition-to-payload) en seis niveles distintos.

La relevancia del modelo es fundamentalmente metodológica: no se presenta como un modelo de propósito general, sino como un artefacto de laboratorio para estudiar cómo interactúan distintas distribuciones de datos inyectados durante el preentrenamiento. La model card hace referencia explícita a un paquete de datos (dolma3-mcg-100b, stage 6), un plan de inyección, manifiestos, objetivos y un archivo de payload, lo que lo convierte en material reproducible para investigación en dinámica de entrenamiento.

La información pública disponible es muy limitada: no se declaran licencia, idiomas ni pipeline, y el repositorio ocupa 48,6 GB en formato safetensors (bf16) con checkpoints en ocho anclajes (1/2/4/8/16/32/64/100B) más un estado final completo. Cualquier evaluación de capacidades debe hacerse con cautela, dado que el autor no publica benchmarks ni una model card orientada a uso general.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Pythia-1B) |
| Parámetros totales | ~1B (heredados de Pythia-1B; no se especifica cifra exacta) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en bf16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (bf16) y checkpoint PyTorch completo (`resume/step-762939.pt`) |

## Arquitectura y entrenamiento

El modelo se basa en Pythia-1B, un transformer decoder-only de la familia Pythia, y se entrena durante 100B tokens (762.939 pasos) con la misma receta, datos de fondo, calendario de inyección (pasos, slots, portadores, trigger) y semillas que las ejecuciones 1B Fixed del repositorio 1B-fixed-v2. La única diferencia declarada respecto a esas ejecuciones son los 512 tokens objetivo de cada fila de payload, lo que convierte al modelo en una variante controlada para aislar el efecto de la distribución de los objetivos inyectados.

El experimento se organiza en seis ejecuciones etiquetadas rtp-MCG-r1, r2, r4, r8, r16 y r32, que corresponden a distintas razones de repetición en el mecanismo de inyección. El paquete de datos incluye receta, plan, manifiesto, objetivos, archivo de payload y builder, y el dataset asociado es `294-288-pretrain-interaction/dolma3-mcg-100b` (stage 6). No se documentan detalles sobre RLHF, DPO ni innovaciones de decodificación; el foco está en la composición y el calendario de los datos de preentrenamiento.

## Capacidades

- Generación de texto autoregresiva estándar, heredada de la arquitectura Pythia-1B.
- Razonamiento y conocimiento general limitados por el tamaño (~1B parámetros) y por el carácter experimental del entrenamiento.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingües no declaradas; los idiomas soportados figuran como no disponibles.
- No se documentan capacidades de visión, audio ni modo de pensamiento (thinking mode).
- El modelo está pensado como artefacto de investigación sobre interacción de datos, no como asistente de propósito general.

## Casos de uso

- Estudio de dinámica de preentrenamiento: comparar las seis ejecuciones r1–r32 para medir cómo la razón de repetición de los payloads afecta a la pérdida y a las métricas de laboratorio registradas en `lab/`.
- Reproducción de experimentos: reutilizar la receta, el plan y el manifiesto del paquete de datos para replicar el entrenamiento con las mismas semillas y calendario de inyección.
- Análisis de checkpoints intermedios: los ocho anclajes (1/2/4/8/16/32/64/100B) permiten trazar la evolución del modelo a lo largo del entrenamiento y estudiar fenómenos de olvido o memorización.
- Investigación sobre contaminación de datos: al variar solo los 512 tokens objetivo por fila, el modelo sirve para aislar el efecto de datos inyectados frente a datos de fondo.
- Docencia y formación en preentrenamiento: el repositorio incluye builder y métricas que facilitan explicar el ciclo completo de un experimento controlado a pequeña escala.
- Base para experimentos de ajuste fino: al ser un checkpoint Pythia-1B, puede servir como inicialización para estudios comparativos con la versión Clean de 1B-fixed-v2.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 2 GB solo para pesos, más overhead de activaciones y caché KV (no se dispone de cifra oficial).
- GPU recomendadas: cualquier GPU con al menos 4–8 GB de VRAM para bf16; para el estado completo de entrenamiento (`resume/step-762939.pt`) se requiere espacio en disco considerable (el repositorio ocupa 48,6 GB).
- Cabe en GPU de consumo: sí, previsiblemente en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090 24 GB y superiores, aunque no hay validación publicada.
- Opciones de despliegue: no documentadas; al ser safetensors bf16, sería compatible con frameworks estándar (Transformers, vLLM, TGI) previa conversión, pero no se confirma soporte.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| 1B-rtp-v2 | ~1B | no disponible | no disponible | Hugging Face (repo de 48,6 GB) |
| Pythia-1B | ~1B | 2.048 tokens (estándar de la familia) | Apache 2.0 | Hugging Face, EleutherAI |
| 1B-fixed-v2 (mismo autor) | ~1B | no disponible | no disponible | Hugging Face |
| TinyLlama-1.1B | ~1,1B | 2.048 tokens | Apache 2.0 | Hugging Face |

La comparación con Pythia-1B y TinyLlama se ofrece como referencia de categoría (modelos ~1B); no se dispone de datos de rendimiento de 1B-rtp-v2 que permitan una comparación cuantitativa.

## Limitaciones y advertencias

- No se declara licencia: el uso comercial queda sin autorización explícita y debe consultarse con el autor.
- No se declaran idiomas soportados ni pipeline, lo que impide garantizar un comportamiento multilingüe o una tarea concreta.
- Riesgo elevado de alucinación y baja fiabilidad factual esperables por el tamaño (~1B) y por el carácter experimental del entrenamiento.
- Sesgos desconocidos: no hay documentación sobre composición del dataset de fondo más allá de la referencia a dolma3-mcg-100b.
- Ausencia de benchmarks publicados: no es posible evaluar su calidad frente a alternativas consolidadas.
- El modelo está diseñado como artefacto de investigación; no se recomienda su uso en producción sin una evaluación previa exhaustiva.
- El tamaño del repositorio (48,6 GB) y la presencia de múltiples checkpoints pueden complicar el despliegue y el almacenamiento.

## Enlaces

- Hugging Face: https://huggingface.co/294-288-pretrain-interaction-2/1B-rtp-v2
- Repositorio de referencia 1B-fixed-v2: https://huggingface.co/294-288-pretrain-interaction-2/1B-fixed-v2
- Dataset asociado: https://huggingface.co/datasets/294-288-pretrain-interaction/dolma3-mcg-100b
- Pythia-1B (arquitectura base): https://huggingface.co/EleutherAI/pythia-1b
