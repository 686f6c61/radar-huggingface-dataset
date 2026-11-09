# Myungkyu/cosmos3_mot_l36_d1024_robodojo_b64_60k_scratch_vf64_allvis_ema

## Resumen

Cosmos3 Mot L36 D1024 RoboDojo B64 60K Scratch VF64 Allvis EMA es un modelo de mundo (world model) orientado a robótica, desarrollado por el usuario Myungkyu y publicado bajo el paraguas del framework Cosmos. Se trata de un ajuste fino (fine-tuning) del modelo base Cosmos3-Nano, un modelo de vídeo que actúa como generador de representaciones espacio-temporales, al que se le acopla un DiT de acción externo con condicionamiento unidireccional vídeo-a-acción y un calendario de acciones compartido. El resultado es una política de acción capaz de operar en bucle cerrado para control de robots.

El modelo se ha entrenado sobre el conjunto de datos RoboDojo Sim en formato LeRobot v3.0, con un total de 60 000 pasos de entrenamiento y un tamaño de lote de 64. La nomenclatura del identificador resume su configuración: arquitectura de 36 capas (l36), dimensión oculta de 1024 (d1024), entrenamiento desde cero sobre el backbone (scratch), factor de visión de 64 (vf64) y uso de pesos EMA (media móvil exponencial) para la versión final publicada. El repositorio ocupa 32 GB e incluye únicamente los pesos en bf16, sin estado del optimizador.

Su relevancia radica en que ejemplifica una tendencia creciente en IA para robótica: reutilizar modelos de mundo preentrenados a gran escala (en este caso Cosmos3-Nano) como base para aprender políticas de control con relativamente pocos datos específicos de tarea. No obstante, la información pública disponible es muy limitada: no se han publicado resultados de benchmarks, no consta licencia explícita y el modelo está empaquetado en un formato propietario del framework (DCP) que dificulta su uso fuera del ecosistema cosmos-framework.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de mundo de vídeo Cosmos3-Nano con DiT de acción externo (condicionamiento unidireccional vídeo-a-acción, calendario de acciones compartido) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (depende de la configuración de chunks de vídeo del framework) |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16) |
| Idiomas soportados | no disponible (modelo orientado a control robótico, no a texto) |
| Licencia | no disponible |
| Formato de pesos | torch.distributed.checkpoint (DCP) en bf16, con claves `net.*`; incluye `config.yaml` y `SHA256SUMS` |

## Arquitectura y entrenamiento

El modelo parte de Cosmos3-Nano, un modelo de mundo de vídeo que procesa secuencias visuales para construir representaciones espacio-temporales. Sobre esta base se acopla un Diffusion Transformer (DiT) de acción externo que recibe condicionamiento unidireccional desde el vídeo y genera acciones según un calendario compartido. La profundidad es de 36 capas con dimensión oculta de 1024, y el entrenamiento se realizó desde cero (scratch) sobre el backbone con un factor de visión de 64 (vf64). El pipeline incluye un VAE de Wan2.2 (Wan-AI/Wan2.2-TI2V-5B) para la codificación y decodificación de vídeo, cuyo fichero `Wan2.2_VAE.pth` debe proporcionarse localmente.

El entrenamiento se llevó a cabo sobre RoboDojo Sim en formato LeRobot v3.0, con un tamaño de lote de 64 y 60 000 pasos. Los pesos publicados corresponden a la media móvil exponencial (EMA) del checkpoint final, convertidos a bf16 y almacenados bajo los nombres `net.*`. No se incluye estado del optimizador ni el otro conjunto de pesos del checkpoint de entrenamiento. No se dispone de información sobre la composición exacta del dataset, el número de tokens de vídeo procesados ni si se aplicaron técnicas de RLHF o DPO, algo poco habitual en modelos de política robótica.

## Capacidades

- Control robótico en bucle cerrado: genera acciones a partir de observaciones visuales, actuando como política de acción (action policy) para manipulación y navegación en entornos simulados.
- Condicionamiento vídeo-a-acción: el DiT de acción recibe representaciones del modelo de mundo de vídeo para producir trayectorias de acción coherentes temporalmente.
- Modelado de mundo: al heredar Cosmos3-Nano, mantiene la capacidad de representar dinámicas espacio-temporales del entorno, lo que favorece la generalización a configuraciones no vistas.
- Integración con el ecosistema cosmos-framework: se carga mediante el servidor de políticas de acción del framework con `--checkpoint-path` y `--config-file`.
- Soporte de configuración flexible: el `config.yaml` define longitud de chunk, ratio de vídeo, formato de prompt y ajustes de estado, lo que permite adaptar el comportamiento en inferencia.
- No se ha documentado soporte de tool calling, function calling, razonamiento multi-paso en lenguaje natural, capacidades multilingües ni modos de pensamiento (thinking mode). Es un modelo especializado en robótica, no un LLM de propósito general.

## Casos de uso

- Manipulación robótica en simulación: el modelo puede actuar como política de control para brazos robóticos en entornos RoboDojo Sim, generando comandos de acción a partir de observaciones visuales en bucle cerrado. Su entrenamiento específico en este simulador lo hace adecuado para tareas de pick-and-place y ensamblaje simulado.

- Investigación en modelos de mundo para robótica: sirve como punto de partida para estudiar cómo las representaciones de vídeo preentrenadas (Cosmos3-Nano) se transfieren a políticas de acción, permitiendo experimentos controlados sobre el condicionamiento vídeo-a-acción.

- Evaluación de políticas en bucle cerrado: al integrarse con el servidor de acción de cosmos-framework, puede desplegarse en pipelines de evaluación que comparan políticas entrenadas con distintas configuraciones (chunk length, ratio de vídeo) sobre el mismo entorno simulado.

- Generación de datos sintéticos de trayectorias: las acciones generadas por el modelo pueden utilizarse para aumentar datasets de robótica o para entrenar políticas más ligeras mediante destilación, aprovechando la coherencia temporal que proporciona el modelo de mundo subyacente.

- Prototipado de control visual para nuevos robots: dado que el condicionamiento es visual y el calendario de acciones es configurable, el modelo puede adaptarse a distintas morfologías dentro del simulador ajustando el `config.yaml`, lo que acelera la experimentación antes de transferir a hardware real.

- Benchmarking interno de arquitecturas de política: al estar disponible como checkpoint EMA en bf16, puede emplearse como referencia en comparaciones internas entre variantes de DiT de acción, profundidades de red o estrategias de condicionamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio ocupa 32 GB en bf16, lo que sugiere que los pesos completos requieren al menos esa cantidad de memoria, aunque el reparto entre backbone de vídeo y DiT de acción no está documentado.
- GPU recomendadas: no disponible. Por el tamaño del checkpoint (32 GB en bf16), es probable que requiera GPUs de clase profesional (A100 80 GB, H100) o múltiples GPUs consumer, pero el autor no lo especifica.
- ¿Cabe en GPU consumer? No disponible. Con 32 GB de pesos en bf16, no cabría en GPUs de 24 GB (RTX 4090) sin cuantización, y no se documentan opciones de cuantización.
- Opciones de despliegue: exclusivamente mediante el servidor de políticas de acción de cosmos-framework (`--checkpoint-path <repo> --config-file config.yaml`). No se menciona compatibilidad con vLLM, llama.cpp, Ollama ni TGI, lo cual es esperable al tratarse de un modelo de robótica y no de un LLM.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Cosmos3 Mot L36 D1024 (este modelo) | no disponible | no disponible | Política de acción robótica sobre modelo de mundo de vídeo | no disponible | Hugging Face (DCP, 32 GB) |
| Cosmos3-Nano (modelo base) | no disponible | no disponible | Modelo de mundo de vídeo | no disponible | Referenciado en la model card |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información suficiente para establecer una comparativa rigurosa con modelos de la misma categoría. No se han identificado en la información proporcionada alternativas de política de acción robótica con especificaciones públicas comparables.

## Limitaciones y advertencias

- Ausencia de licencia explícita: no se indica licencia en la model card ni en los metadatos, lo que impide determinar si el uso comercial está permitido. Cualquier despliegue en producción requiere aclarar este punto con el autor.
- Formato de pesos propietario: los pesos están en torch.distributed.checkpoint (DCP) con claves `net.*`, un formato ligado al framework cosmos-framework. No hay versión en safetensors ni GGUF, lo que limita la portabilidad.
- Dependencia de un VAE externo: requiere el fichero `Wan2.2_VAE.pth` de Wan-AI/Wan2.2-TI2V-5B, que no se incluye en el repositorio y debe obtenerse por separado.
- Entrenamiento exclusivo en simulación: el dataset es RoboDojo Sim, por lo que el rendimiento en el mundo real (sim-to-real gap) no está documentado y probablemente requiera ajuste adicional.
- Sin benchmarks publicados: no hay métricas de éxito en tareas, tasas de error ni comparaciones con otras políticas, lo que impide evaluar su calidad de forma objetiva.
- Sin información sobre sesgos: al ser un modelo de control robótico, los sesgos relevantes serían de distribución (entornos simulados concretos) más que sociales, pero no se documentan.
- Riesgo de alucinación en el sentido de acciones no válidas: como toda política generativa, puede producir trayectorias incoherentes o inseguras fuera de la distribución de entrenamiento.
- Documentación mínima: la model card es muy escueta, sin detalles sobre el dataset, hiperparámetros completos ni proceso de entrenamiento, lo que dificulta la reproducibilidad.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Myungkyu/cosmos3_mot_l36_d1024_robodojo_b64_60k_scratch_vf64_allvis_ema
- VAE de referencia (Wan-AI/Wan2.2-TI2V-5B): https://huggingface.co/Wan-AI/Wan2.2-TI2V-5B
- Framework Cosmos (referenciado en la model card, sin URL directa proporcionada): no disponible
- Paper o blog del modelo: no disponible
- Repositorio de código: no disponible
- Demo: no disponible
