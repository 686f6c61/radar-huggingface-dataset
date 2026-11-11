# Myungkyu/cosmos3_mot_l36_d1024_robodojo_b64_60k_scratch_loop_g_mid_h3nort_ema

## Resumen

Cosmos3-Nano es un modelo de mundo (world model) en vídeo orientado a robótica, desarrollado dentro del ecosistema Cosmos y publicado por el usuario Myungkyu en Hugging Face. Este checkpoint concreto es un ajuste fino (fine-tuning) del modelo base Cosmos3-Nano que incorpora un DiT de acción externo con condicionamiento unidireccional vídeo-a-acción y un calendario de acciones compartido, lo que permite su uso como política de control robótico en bucle cerrado. El modelo se entrena sobre el simulador RoboDojo Sim en formato LeRobot v3.0.

El identificador del repositorio codifica parte de la arquitectura: `l36_d1024` sugiere 36 capas y una dimensión oculta de 1024, y `b64` apunta a un tamaño de batch de 64 durante el entrenamiento, con 60k pasos (`60k`) y entrenamiento desde cero (`scratch`). El sufijo `ema` indica que los pesos publicados corresponden a las medias móviles exponenciales (EMA) del checkpoint final, convertidas a bf16.

Es relevante porque ejemplifica la línea de investigación que combina modelos generativos de vídeo con políticas de acción para robótica: en lugar de entrenar una política puramente reactiva, se aprovecha un modelo de mundo que predice la evolución visual y deriva acciones condicionadas a esa predicción. El repositorio ocupa 32 GB y se distribuye como checkpoint DCP de rango único, sin estado del optimizador.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer tipo DiT (Cosmos3-Nano) con DiT de acción externo y condicionamiento vídeo-a-acción unidireccional |
| Parámetros totales | no disponible (el identificador sugiere 36 capas y dimensión 1024, sin recuento explícito) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en bf16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | torch.distributed.checkpoint (DCP) de rango único, bf16, bajo claves `net.*` |

## Arquitectura y entrenamiento

El modelo parte de Cosmos3-Nano, un world model de vídeo, y le acopla un DiT de acción externo. El condicionamiento es unidireccional: el vídeo informa la generación de acciones, no al revés, y ambas ramas comparten un calendario de acciones. Esta separación permite reutilizar el modelo de mundo preentrenado y entrenar la cabeza de acción de forma relativamente independiente. El identificador del repositorio sugiere una pila de 36 capas con anchura 1024, aunque no se detalla la configuración completa.

El entrenamiento se realiza sobre RoboDojo Sim en formato LeRobot v3.0, con batch de 64 y 60 000 pasos, partiendo desde cero (`scratch`) en este ajuste. Los pesos publicados son los EMA del checkpoint final, convertidos a bf16 y almacenados bajo los nombres `net.*`, sin estado del optimizador. No se especifican en la información disponible el número de tokens, la composición exacta del dataset ni si se emplearon RLHF o DPO. La configuración de entrenamiento se distribuye en `config.yaml`, con rutas locales sustituidas por marcadores de posición, y requiere apuntar `vae_path` a un VAE local de Wan2.2 (`Wan2.2_VAE.pth` de Wan-AI/Wan2.2-TI2V-5B).

## Capacidades

- Generación de acciones robóticas condicionadas a observaciones de vídeo, en bucle cerrado.
- Predicción de evolución visual como modelo de mundo (world model) subyacente.
- Control de políticas de acción mediante un DiT de acción dedicado con calendario compartido.
- Integración con el servidor de políticas de acción de `cosmos-framework`.
- Entrenamiento y evaluación sobre RoboDojo Sim (LeRobot v3.0).
- Soporte de tool calling: no disponible.
- Soporte de agentes multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Modo thinking, visión general o audio: no disponible.

## Casos de uso

- Control robótico en simulación: el modelo se carga en el servidor de políticas de `cosmos-framework` y genera acciones a partir de observaciones de vídeo en RoboDojo Sim, adecuado para experimentar con políticas basadas en world models antes de un despliegue real.
- Investigación en world models para robótica: permite estudiar cómo la predicción visual condiciona la generación de acciones y comparar variantes de condicionamiento unidireccional frente a alternativas bidireccionales.
- Evaluación de políticas en bucle cerrado: al compartir calendario de acciones entre vídeo y acción, sirve para medir estabilidad y deriva en episodios largos dentro del simulador.
- Reproducción de experimentos: el repositorio incluye `config.yaml` y `SHA256SUMS`, lo que facilita reconstruir el entorno de entrenamiento con rutas locales y verificar la integridad de los pesos.
- Punto de partida para fine-tuning: los pesos EMA en bf16 sin estado del optimizador son un inicializador limpio para nuevos ajustes sobre otros datasets LeRobot.
- Benchmarking interno de infraestructura: el checkpoint DCP de rango único permite medir latencia de carga y throughput de inferencia en el servidor de políticas antes de escalar a configuraciones multi-rango.
- Docencia y divulgación: como ejemplo didáctico de cómo se acopla un DiT de acción a un modelo de vídeo preentrenado para control robótico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; el repositorio ocupa 32 GB y los pesos se publican en bf16, por lo que se requiere al menos capacidad para cargar esa huella en memoria, además del VAE de Wan2.2 y del DiT de acción.
- GPU recomendadas: no disponible. Por el tamaño del checkpoint, se necesitan GPU de datacenter con memoria amplia (A100 80 GB, H100) para una carga cómoda; no se confirma compatibilidad con GPU de consumo.
- GPU de consumo: no disponible; probablemente no cabe en tarjetas de 24 GB en bf16 sin cuantización, y no se documentan opciones de cuantización.
- Opciones de despliegue: servidor de políticas de acción de `cosmos-framework` con `--checkpoint-path <dir> --config-file config.yaml`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (Cosmos3-Nano + DiT de acción) | no disponible | no disponible | sin benchmarks publicados | no disponible | Hugging Face, 32 GB, DCP bf16 |
| Cosmos3-Nano base | no disponible | no disponible | no disponible | no disponible | referenciado como base, sin ficha detallada en la información |
| Wan2.2-TI2V-5B (VAE asociado) | 5B (VAE) | no disponible | no disponible | no disponible | Hugging Face (Wan-AI) |
| Alternativas robóticas tipo RT-2 / OpenVLA | no disponible en esta información | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos comparativos de rendimiento entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Licencia no disponible: no se puede confirmar el uso comercial ni las restricciones de redistribución.
- Idiomas no disponibles: el modelo está orientado a control robótico y no se documentan capacidades lingüísticas.
- Entrenado sobre RoboDojo Sim: el rendimiento fuera de ese simulador o en robots reales no está validado y puede degradarse por el salto de dominio.
- Pesos EMA sin estado del optimizador: no es posible reanudar el entrenamiento exactamente desde este checkpoint, solo inicializar uno nuevo.
- Checkpoint DCP de rango único: requiere el servidor de `cosmos-framework` y una configuración con rutas locales correctas; no es un formato plug-and-play para otras herramientas.
- Dependencia del VAE de Wan2.2: hay que proporcionar `Wan2.2_VAE.pth` localmente, lo que añade un requisito externo y posibles incompatibilidades de versión.
- Riesgo de alucinación visual: como world model generativo, puede producir predicciones plausibles pero incorrectas que induzcan acciones erróneas en bucle cerrado.
- Sesgos: no documentados; al entrenarse solo en simulación, puede heredar sesgos de la distribución del simulador.
- Sin benchmarks publicados: no hay evidencia cuantitativa de calidad frente a alternativas.
- Repositorio con 0 descargas y 0 likes: ecosistema de validación mínimo, sin señales de uso en producción.

## Enlaces

- Hugging Face: https://huggingface.co/Myungkyu/cosmos3_mot_l36_d1024_robodojo_b64_60k_scratch_loop_g_mid_h3nort_ema
- VAE de referencia: https://huggingface.co/Wan-AI/Wan2.2-TI2V-5B
- Cosmos (framework y familia de modelos): no disponible en la información proporcionada
- RoboDojo Sim: no disponible en la información proporcionada
- LeRobot v3.0: no disponible en la información proporcionada
