# Myungkyu/cosmos3_mot_l36_d1024_robotwin_decoupled_nofix_b64_60k_h48e24_scratch_dmlp_ema

## Resumen

Cosmos3-Nano es un modelo de mundo (world model) de vídeo desarrollado dentro del ecosistema Cosmos y afinado por el usuario Myungkyu para control robótico en bucle cerrado. El modelo parte de la base Cosmos3-Nano y se especializa mediante un DiT de acción externo con condicionamiento unidireccional vídeo-a-acción, de modo que el vídeo generado guía la política de acción pero no al revés. La innovación principal es el uso de ruido desacoplado: el ruido de la acción se muestrea de forma independiente al del vídeo, en una pasada de vídeo puro sin gradiente.

El resultado es un modelo orientado a robótica que combina generación de vídeo predictivo con predicción de acciones motoras, entrenado sobre el dataset RoboTwin 2.0 en formato LeRobot v3.0 con la configuración aloha-agilex. La nomenclatura del repositorio revela detalles de arquitectura: 36 capas (l36), dimensión oculta 1024 (d1024), batch 64, 60 000 pasos de entrenamiento, 48 cabezas y 24 expertos (h48e24), lo que sugiere una arquitectura de mezcla de expertos.

El modelo es relevante para investigadores en robótica y aprendizaje por imitación que necesitan un world model capaz de cerrar el bucle percepción-acción con predicción de vídeo. Su disponibilidad es muy reciente y con escasa tracción (0 descargas, 0 likes), por lo que debe tratarse como un artefacto de investigación más que como un modelo listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE) y DiT de acción externo sobre world model de vídeo Cosmos3-Nano |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (arquitectura MoE con 24 expertos según nomenclatura) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | bf16 (pesos almacenados en bf16); no se documentan otras cuantizaciones |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | torch.distributed.checkpoint (DCP) con claves `net.*`, más `config.yaml` y `SHA256SUMS` |

## Arquitectura y entrenamiento

El modelo se construye sobre Cosmos3-Nano, un world model de vídeo, al que se le añade un DiT de acción externo. El condicionamiento es unidireccional: el vídeo condiciona la acción, pero la acción no condiciona el vídeo. Los horarios de ruido están desacoplados, de forma que el ruido de la acción se muestrea independientemente del ruido del vídeo, y la pasada de vídeo puro se ejecuta sin gradiente. La nomenclatura del checkpoint (l36, d1024, h48e24) apunta a 36 capas, dimensión oculta de 1024, 48 cabezas de atención y 24 expertos en una estructura MoE, aunque estos valores se infieren del nombre y no están confirmados en la model card.

El entrenamiento se realizó sobre RoboTwin 2.0 en formato LeRobot v3.0 con la configuración aloha-agilex, durante 60 000 pasos con batch de 64. Los pesos publicados son los pesos EMA (net_ema) del checkpoint final, convertidos a bf16 y almacenados bajo los nombres `net.*` como un checkpoint DCP de un solo rango, sin estado del optimizador. No se documentan en la información disponible detalles sobre el número total de tokens, la composición exacta del dataset ni el uso de RLHF o DPO.

## Capacidades

- World model de vídeo: genera predicciones de vídeo futuro como representación del entorno.
- Política de acción robótica: predice acciones motoras condicionadas por el vídeo generado.
- Control en bucle cerrado: diseñado para control robótico iterativo, no solo para inferencia de un solo paso.
- Condicionamiento vídeo-a-acción con ruido desacoplado, que permite muestrear acciones de forma independiente al vídeo.
- Integración con el servidor de políticas de acción de cosmos-framework.
- Entrenado específicamente para la configuración aloha-agilex de RoboTwin 2.0.
- No se documentan capacidades de tool calling, agentes multi-paso, multilingüismo, visión general, audio ni modo de razonamiento explícito.

## Casos de uso

- Investigación en world models para robótica: el modelo permite estudiar cómo la predicción de vídeo mejora la política de acción en entornos simulados, usando RoboTwin 2.0 como banco de pruebas.
- Aprendizaje por imitación en manipulación bimanual: la configuración aloha-agilex y el condicionamiento vídeo-a-acción lo hacen adecuado para tareas de manipulación con dos brazos en simulación.
- Evaluación de políticas en bucle cerrado: sirve para comparar estrategias de control que dependen de predicción visual frente a políticas puramente reactivas.
- Generación de datos sintéticos de vídeo para aumento de dataset: el componente de world model puede producir secuencias de vídeo que complementen demostraciones reales.
- Estudio de horarios de ruido desacoplados: el checkpoint permite reproducir y analizar el efecto del muestreo independiente de ruido en acción y vídeo.
- Prototipado de pipelines de robótica con cosmos-framework: se integra directamente en el servidor de políticas de acción mediante `--checkpoint-path` y `--config-file`.
- Reproducibilidad de experimentos: al publicar los pesos EMA y el `config.yaml`, facilita la réplica de resultados de entrenamiento en RoboTwin 2.0.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; el repositorio ocupa 32,6 GB en bf16, por lo que se requiere al menos una GPU con memoria suficiente para cargar los pesos completos más el VAE de Wan2.2.
- GPU recomendadas: no disponible; por el tamaño del checkpoint, se intuye necesidad de GPU de clase A100 o H100, pero no está confirmado.
- ¿Cabe en GPU de consumo? no disponible; con 32,6 GB en bf16 no cabría en GPUs de 24 GB sin cuantización, y no se documentan cuantizaciones alternativas.
- Opciones de despliegue: servidor de políticas de acción de cosmos-framework con `--checkpoint-path <repo> --config-file config.yaml`; requiere un archivo VAE local `Wan2.2_VAE.pth` de Wan-AI/Wan2.2-TI2V-5B configurado en `vae_path`.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| cosmos3_mot_l36_d1024_robotwin (este) | no disponible | no disponible | no disponible | no disponible | Hugging Face, 0 descargas |
| Cosmos3-Nano (base) | no disponible | no disponible | no disponible | no disponible | no disponible en la información |
| Wan2.2-TI2V-5B (VAE usado) | no disponible | no disponible | no disponible | no disponible | referenciado como dependencia |

No se dispone de datos suficientes para una comparativa cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Licencia no especificada: no se puede confirmar el uso comercial ni la redistribución; debe contactarse con el autor antes de cualquier uso en producción.
- Modelo de investigación con 0 descargas y 0 likes: sin validación comunitaria ni reportes independientes de rendimiento.
- Entrenado exclusivamente sobre RoboTwin 2.0 con aloha-agilex: probable sobreajuste al dominio y baja generalización a otros robots o entornos sin reentrenamiento.
- Pesos en formato DCP de un solo rango: requiere el servidor de cosmos-framework y no es directamente cargable con librerías estándar como transformers o llama.cpp.
- Dependencia de un VAE externo (Wan2.2_VAE.pth): añade un paso de configuración y un artefacto adicional no incluido en el repositorio.
- Solo se publican los pesos EMA, sin estado del optimizador: no permite reanudar el entrenamiento tal cual.
- Riesgo de alucinación visual en la generación de vídeo, con posible propagación de errores a la política de acción en bucle cerrado.
- No se documentan sesgos, idiomas ni limitaciones de contexto; se desconoce el comportamiento fuera del dominio robótico.
- Fecha de creación futura (2026-11-13) en los metadatos: conviene verificar la integridad y procedencia del repositorio.

## Enlaces

- Hugging Face: https://huggingface.co/Myungkyu/cosmos3_mot_l36_d1024_robotwin_decoupled_nofix_b64_60k_h48e24_scratch_dmlp_ema
- VAE de referencia Wan2.2: https://huggingface.co/Wan-AI/Wan2.2-TI2V-5B
- Dataset RoboTwin 2.0: no disponible enlace directo en la información proporcionada
- Repositorio cosmos-framework: no disponible enlace directo en la información proporcionada
