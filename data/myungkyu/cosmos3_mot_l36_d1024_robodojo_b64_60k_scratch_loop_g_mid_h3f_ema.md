# Myungkyu/cosmos3_mot_l36_d1024_robodojo_b64_60k_scratch_loop_g_mid_h3f_ema

## Resumen

Cosmos3-Nano es un modelo de mundo (world model) de vídeo orientado a robótica, desarrollado en el ecosistema del framework Cosmos y publicado por el usuario Myungkyu en Hugging Face. Esta variante concreta ha sido ajustada (fine-tuning) sobre el conjunto de datos RoboDojo Sim en formato LeRobot v3.0, incorporando un DiT de acciones externo con condicionamiento unidireccional vídeo-a-acción y un calendario de acciones compartido, lo que permite su uso en control robótico en bucle cerrado. El resultado es una política de acción que predice acciones a partir de observaciones visuales y estado del robot.

El nombre del repositorio codifica la configuración: arquitectura MoT (Mixture of Transformers) con 36 capas y dimensión oculta de 1024, entrenamiento sobre RoboDojo con batch de 64 durante 60.000 pasos, inicialización desde cero (scratch), variante de bucle (loop) con configuración "g_mid" y "h3f", y pesos EMA finales. El repositorio ocupa 32 GB y se distribuye como un checkpoint DCP (torch.distributed.checkpoint) de un solo rango en bf16, sin estado del optimizador.

La relevancia de esta ficha es acotada: se trata de un artefacto de investigación con cero descargas y cero likes en el momento de la consulta, sin model card extendida, sin licencia declarada y sin resultados de benchmarks publicados. Es útil para investigadores que trabajen con el framework Cosmos y quieran reproducir o comparar políticas robóticas entrenadas en simulación, pero no es un modelo listo para producción ni para uso comercial sin aclarar antes la licencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoT (Mixture of Transformers) sobre Cosmos3-Nano; world model de vídeo con DiT de acciones externo y condicionamiento unidireccional vídeo-a-acción |
| Parametros totales | no disponible (la nomenclatura indica 36 capas y dimensión 1024, pero no se publica el recuento total) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (depende de la configuración de fragmentos de vídeo en `config.yaml`) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en bf16; no se documentan variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponible (modelo orientado a percepción visual y acciones, no a texto multilingüe) |
| Licencia | no disponible |
| Formato de pesos | DCP (torch.distributed.checkpoint) de un solo rango, bf16, con claves `net.*`; incluye `config.yaml` y `SHA256SUMS` |

## Arquitectura y entrenamiento

El modelo se construye sobre Cosmos3-Nano, un world model de vídeo, y añade un DiT de acciones externo que se condiciona de forma unidireccional desde el vídeo: la representación visual alimenta la predicción de acciones, pero no al revés. El calendario de acciones es compartido entre ambos componentes, lo que permite entrenar y ejecutar la política en bucle cerrado sobre observaciones sucesivas. La nomenclatura del repositorio sugiere una arquitectura MoT con 36 capas y dimensión oculta de 1024, con una variante de bucle ("loop") y configuraciones "g_mid" y "h3f" cuyo significado exacto no se detalla en la información disponible.

El entrenamiento se realizó desde cero (scratch) sobre RoboDojo Sim en formato LeRobot v3.0, con un batch de 64 y 60.000 pasos. Los pesos publicados son los EMA (`net_ema`) del checkpoint final, convertidos a bf16 y almacenados bajo los nombres `net.*`, sin estado del optimizador. El servidor de políticas del framework Cosmos reconstruye el modelo a partir de `config.yaml`, que contiene rutas locales sustituidas por marcadores de posición (`<Cosmos3-Nano-dcp>`, `<dataset root>`, `<Wan2.2_VAE.pth>`) y define la longitud de fragmento, la relación de vídeo, el formato de prompt y los ajustes de estado. Es necesario apuntar `vae_path` a un archivo VAE local de Wan2.2 (concretamente `Wan2.2_VAE.pth` de Wan-AI/Wan2.2-TI2V-5B). No se documentan detalles sobre volumen de tokens, composición del dataset ni uso de RLHF o DPO.

## Capacidades

- Predicción de acciones robóticas a partir de observaciones visuales y estado, en un esquema de control en bucle cerrado.
- Modelado de mundo de vídeo: representación y generación de dinámica visual coherente con el entorno simulado.
- Condicionamiento vídeo-a-acción mediante un DiT de acciones separado con calendario compartido.
- Integración con el servidor de políticas del framework Cosmos (`--checkpoint-path` y `--config-file`).
- Entrenamiento y evaluación sobre RoboDojo Sim en formato LeRobot v3.0.
- No se documentan capacidades de tool calling, agentes multi-paso, razonamiento textual, matemáticas ni procesamiento de audio.

## Casos de uso

- Investigación en políticas robóticas en simulación: cargar el checkpoint en el servidor de políticas de Cosmos y evaluar la tasa de éxito en tareas de RoboDojo Sim, sirviendo como línea base reproducible para comparar variantes de arquitectura MoT.
- Aprendizaje por imitación desde demostraciones: el formato LeRobot v3.0 del dataset facilita reentrenar o ajustar la política con nuevos conjuntos de demostraciones teleoperadas y comparar contra estos pesos EMA.
- Estudio de modelado de mundo para planificación: usar la componente de world model de vídeo para generar rollouts visuales y analizar la coherencia de la dinámica aprendida antes de transferir la política a un robot real.
- Reproducción de experimentos de condicionamiento vídeo-a-acción: el diseño unidireccional con DiT externo permite aislar el efecto del condicionamiento visual en el rendimiento de la política, útil en publicaciones sobre arquitecturas de políticas.
- Evaluación de robustez en bucle cerrado: al tratarse de una variante "loop", permite medir la acumulación de error en episodios largos y comparar con políticas de un solo paso.
- Docencia y formación en robótica con IA: el checkpoint y su `config.yaml` permiten montar un entorno de prácticas donde los estudiantes inspeccionen la configuración de fragmentos, relación de vídeo y formato de prompt.
- Punto de partida para ajuste fino con EMA: al publicarse solo los pesos EMA en bf16, es adecuado como inicialización estable para nuevos entrenamientos sin arrastrar el estado del optimizador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible con precisión. El repositorio ocupa 32 GB y los pesos se distribuyen en bf16, por lo que la inferencia requiere al menos del orden de decenas de GB de memoria, dependiendo de si se cargan solo los pesos `net.*` o también el VAE de Wan2.2.
- GPU recomendadas: no disponibles en la información proporcionada. Por el tamaño del checkpoint, GPUs de 80 GB (A100, H100) son el escenario natural; GPUs consumer de 24 GB (RTX 4090) muy probablemente no sean suficientes sin cuantización, que no está documentada.
- Cabe en GPU consumer: no disponible; no se documentan variantes cuantizadas ni despliegue en GPUs de consumo.
- Opciones de despliegue: servidor de políticas del framework Cosmos (`--checkpoint-path <dir> --config-file config.yaml`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que además no son adecuados para este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| cosmos3_mot_l36_d1024_robodojo (este) | no disponible (36 capas, dim. 1024) | no disponible | Política de acción robótica + world model de vídeo | no disponible | Hugging Face, 0 descargas |
| Cosmos3-Nano (base) | no disponible | no disponible | World model de vídeo | no disponible | Referenciado en la model card como checkpoint de partida |
| Wan2.2-TI2V-5B (VAE usado) | ~5B (VAE) | no disponible | Generación de vídeo texto-imagen-vídeo | no disponible | Hugging Face (Wan-AI) |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Licencia no declarada: no puede asumirse uso comercial; es imprescindible contactar con el autor o consultar el repositorio antes de cualquier despliegue productivo.
- Cero descargas y cero likes: no hay evidencia de validación por parte de la comunidad ni de reproducibilidad independiente.
- Entrenado exclusivamente sobre RoboDojo Sim: el rendimiento en entornos reales o en otros simuladores no está documentado y probablemente presente una brecha de simulación a realidad significativa.
- Pesos solo EMA y sin estado del optimizador: reanudar el entrenamiento exacto no es posible; solo sirve como inicialización o para inferencia.
- Dependencia de un VAE externo (Wan2.2) y de rutas locales sustituidas por marcadores: la carga requiere configuración manual y puede fallar si el VAE no coincide en versión.
- Formato DCP de un solo rango: no es directamente compatible con herramientas estándar de inferencia (safetensors, GGUF) sin conversión.
- Sin información sobre sesgos, alucinación o limitaciones idiomáticas: al no ser un modelo de lenguaje, estos riesgos se trasladan a la fidelidad del world model y a la acumulación de error en bucle cerrado.
- Sin benchmarks publicados: no hay forma de comparar objetivamente su calidad frente a otras políticas robóticas.

## Enlaces

- Hugging Face: https://huggingface.co/Myungkyu/cosmos3_mot_l36_d1024_robodojo_b64_60k_scratch_loop_g_mid_h3f_ema
- VAE de referencia (Wan-AI/Wan2.2-TI2V-5B): https://huggingface.co/Wan-AI/Wan2.2-TI2V-5B
- Framework Cosmos: no disponible en la información proporcionada
- Dataset RoboDojo Sim (LeRobot v3.0): no disponible en la información proporcionada
- Paper o blog técnico: no disponible en la información proporcionada
