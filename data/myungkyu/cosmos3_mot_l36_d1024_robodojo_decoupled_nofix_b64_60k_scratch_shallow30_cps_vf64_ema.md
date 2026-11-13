# Myungkyu/cosmos3_mot_l36_d1024_robodojo_decoupled_nofix_b64_60k_scratch_shallow30_cps_vf64_ema

## Resumen

`cosmos3_mot_l36_d1024_robodojo_decoupled_nofix_b64_60k_scratch_shallow30_cps_vf64_ema` es un modelo de política de acción para control robótico en bucle cerrado, desarrollado por el usuario Myungkyu sobre el framework Cosmos3. Se trata de un fine-tuning de Cosmos3-Nano (un modelo de mundo de vídeo) al que se le acopla un DiT de acción externo, con condicionamiento unidireccional vídeo-a-acción y ruidos independientes entre la rama de vídeo y la de acción. El resultado es un policy que, dado un contexto visual, predice acciones de robot.

El nombre del repositorio codifica la configuración experimental: 36 capas (`l36`), dimensión oculta 1024 (`d1024`), entrenamiento sobre el simulador RoboDojo (`robodojo`), esquema de ruido desacoplado (`decoupled_nofix`), batch 64 durante 60k pasos (`b64_60k`), inicialización desde cero (`scratch`), truncado a 30 capas (`shallow30`), muestreo CPS con `vf64` y pesos EMA (`ema`). Los pesos publicados son exclusivamente los del promedio móvil exponencial (EMA) del checkpoint final, en bf16.

El modelo es relevante para la comunidad de robótica porque ejemplifica una receta concreta de adaptación de modelos de mundo generativos a políticas de control, con decisiones de diseño poco habituales (ruido desacoplado, paso de vídeo puro sin gradiente) que pueden interesar a quien investigue policy learning sobre vídeo. No obstante, se publica sin model card descriptiva, sin licencia declarada y sin métricas de evaluación, por lo que su uso en producción requiere validación propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de mundo de vídeo Cosmos3-Nano con DiT de acción externo acoplado; condicionamiento unidireccional vídeo-a-acción |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16) |
| Idiomas soportados | no disponible (modelo orientado a robótica, no conversacional) |
| Licencia | no disponible |
| Formato de pesos | torch.distributed.checkpoint (DCP): `model/__0_0.distcp` + `model/.metadata`, bf16 |
| Tamano del repositorio | 31,7 GB |
| Framework de carga | cosmos-framework (servidor de política de acción) |
| VAE requerido | Wan2.2 VAE (`Wan2.2_VAE.pth` de Wan-AI/Wan2.2-TI2V-5B) |
| Dataset de entrenamiento | RoboDojo Sim (LeRobot v3.0) |

## Arquitectura y entrenamiento

La arquitectura parte de Cosmos3-Nano, un modelo de mundo de vídeo, y le añade un Diffusion Transformer (DiT) de acción independiente. El condicionamiento es unidireccional: el vídeo informa a la acción, pero no al revés. La innovación principal es el uso de esquemas de ruido desacoplados: el ruido de la acción se muestrea de forma independiente al del vídeo, y se realiza un paso de vídeo puro (sin gradiente) sobre ruido puro. El entrenamiento se hizo desde cero (`scratch`) con un recorte a 30 capas (`shallow30`), batch de 64 durante 60.000 pasos, muestreo CPS con `vf64`, y se publican los pesos EMA del checkpoint final.

No se dispone de información sobre el número total de tokens de entrenamiento, la composición exacta del dataset más allá de "RoboDojo Sim (LeRobot v3.0)", ni sobre si se aplicaron etapas de RLHF o DPO. Tampoco hay detalles sobre la innovación de decodificación especulativa o atención lineal. El checkpoint publicado no incluye estado del optimizador ni el otro conjunto de pesos del entrenamiento, solo `net_ema` casteado a bf16 bajo los nombres `net.*`.

## Capacidades

- Predicción de acciones de robot en bucle cerrado a partir de contexto visual (política de acción).
- Condicionamiento vídeo-a-acción: el modelo de mundo de vídeo guía la generación de acciones.
- Entrenado específicamente sobre el simulador RoboDojo (LeRobot v3.0), por lo que su dominio es la manipulación/control simulado.
- No se documentan capacidades de tool calling, function calling ni razonamiento multi-paso.
- No se documentan capacidades multilingües ni de generación de texto conversacional.
- No se documentan modos especiales (thinking, visión general, audio) más allá del propio modelado de vídeo.

## Casos de uso

- Investigación en policy learning sobre modelos de mundo: usar el checkpoint como referencia para reproducir la receta de ruido desacoplado y condicionamiento unidireccional en otros entornos simulados.
- Control robótico en simulación con RoboDojo: desplegar el servidor de política de acción de cosmos-framework apuntando a este repositorio para evaluar políticas en tareas de manipulación del simulador.
- Baseline para comparativas de arquitecturas de acción: al estar entrenado desde cero con recorte a 30 capas, sirve como punto de comparación frente a políticas entrenadas con el modelo completo.
- Estudio de estabilidad de entrenamiento: los pesos EMA permiten analizar el efecto del promediado sobre la calidad de la política en bucle cerrado.
- Transferencia a otros simuladores: dado que el condicionamiento es vídeo-a-acción, se puede evaluar la generalización del policy a entornos visualmente similares tras un fine-tuning adicional.
- Reproducción de experimentos: el `config.yaml` incluido (con rutas sustituidas por placeholders) permite reconstruir la configuración de entrenamiento y adaptarla a nuevos datasets LeRobot v3.0.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; el repositorio ocupa 31,7 GB en bf16, por lo que se necesita al menos esa cantidad de VRAM para cargar los pesos completos sin cuantizar, más el VAE de Wan2.2 y el resto del pipeline de cosmos-framework.
- GPU recomendadas: no disponibles; por el tamaño del checkpoint, se requiere una GPU de clase A100/H100 (80 GB) o similar para carga completa en bf16 con margen para activaciones.
- ¿Cabe en GPU de consumo? No hay datos que lo confirmen; con 31,7 GB de pesos en bf16, no cabe en GPUs de 24 GB (RTX 4090) sin cuantización, y no se documentan formatos cuantizados.
- Opciones de despliegue: exclusivamente el servidor de política de acción de cosmos-framework (`--checkpoint-path <repo> --config-file config.yaml`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos comparables de la misma categoría (políticas de acción sobre modelos de mundo de vídeo con DiT de acción desacoplado) con parámetros, contexto o benchmarks publicados que permitan una comparación rigurosa.

## Limitaciones y advertencias

- Licencia no declarada: no se puede asumir uso comercial permitido; es imprescindible contactar con el autor antes de cualquier despliegue productivo.
- Sin model card descriptiva ni métricas: no hay benchmarks, curvas de entrenamiento ni evaluación de éxito en tareas, lo que impide estimar su calidad real.
- Dominio restringido: entrenado únicamente sobre RoboDojo Sim; el rendimiento en robots reales o en otros simuladores no está validado.
- Formato de pesos no estándar: DCP de un solo rango con claves `net.*`; requiere el framework cosmos-framework y una configuración específica, lo que dificulta su integración en pipelines habituales (safetensors/GGUF).
- Dependencia externa: necesita el VAE de Wan2.2-TI2V-5B (`Wan2.2_VAE.pth`), que no se incluye en el repositorio.
- Riesgo de alucinación visual: al ser un modelo de mundo generativo, puede producir predicciones visuales plausibles pero incorrectas que degraden la política de acción.
- Sesgos: no documentados, pero al entrenarse solo en un simulador, hereda los sesgos y limitaciones de ese entorno (texturas, físicas, distribución de tareas).
- Sin soporte multilingüe ni conversacional: no es adecuado para tareas de texto, atención al cliente ni agentes basados en lenguaje.
- Repositorio con 0 descargas y 0 likes: sin validación comunitaria; tratar como experimento de investigación, no como artefacto estable.

## Enlaces

- Hugging Face: https://huggingface.co/Myungkyu/cosmos3_mot_l36_d1024_robodojo_decoupled_nofix_b64_60k_scratch_shallow30_cps_vf64_ema
- VAE de referencia (Wan-AI/Wan2.2-TI2V-5B): https://huggingface.co/Wan-AI/Wan2.2-TI2V-5B
- Framework cosmos-framework: no disponible (no se proporciona enlace en la información)
- Dataset RoboDojo Sim (LeRobot v3.0): no disponible (no se proporciona enlace en la información)
- Paper o blog del autor: no disponible
