# Myungkyu/cosmos3_reasoner_obs_tgrid_lora16_d1024_robodojo_b64_60k_scratch_ema

## Resumen

`cosmos3_reasoner_obs_tgrid_lora16_d1024_robodojo_b64_60k_scratch_ema` es un modelo de política de acción para control robótico en bucle cerrado, publicado por el usuario Myungkyu en Hugging Face. Se construye sobre Cosmos3-Nano, un modelo de mundo de vídeo de NVIDIA, al que se le añade un DiT de acción externo con condicionamiento unidireccional vídeo-a-acción y un calendario de acciones compartido. El resultado es un sistema que, dada una observación visual, predice acciones de robot para ejecución cerrada.

El modelo se ha afinado con el dataset RoboDojo Sim en formato LeRobot v3.0, y los pesos publicados corresponden a la EMA del checkpoint final de entrenamiento, en bf16 y empaquetados como un checkpoint DCP de un solo rango sin estado del optimizador. El repositorio ocupa 33,2 GB y la librería asociada es `cosmos-framework`.

La relevancia de este modelo es acotada: no es un modelo de lenguaje ni un asistente general, sino un artefacto de investigación en robótica aprendida que requiere el servidor de políticas de acción de `cosmos-framework` y un VAE de Wan2.2 para funcionar. No hay información sobre licencia, idiomas ni benchmarks publicados en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Modelo de mundo de vídeo Cosmos3-Nano con DiT de acción externo (condicionamiento vídeo-a-acción unidireccional) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en bf16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | torch.distributed.checkpoint (DCP) en bf16, claves `net.*`; configuración en `config.yaml` |

## Arquitectura y entrenamiento

El modelo parte de Cosmos3-Nano, un modelo de mundo de vídeo, y le acopla un DiT de acción externo. El condicionamiento es unidireccional: la representación de vídeo alimenta la predicción de acciones, no al revés, y ambas ramas comparten un calendario de acciones. Esta configuración está pensada para control robótico en bucle cerrado, donde el modelo consume observaciones visuales y emite comandos de acción.

El entrenamiento se realizó sobre RoboDojo Sim en formato LeRobot v3.0, con un nombre de checkpoint que sugiere 60k pasos, lote de 64, adaptadores LoRA de rango 16, dimensión 1024 y entrenamiento desde cero con EMA. Los pesos publicados son los de la EMA final, convertidos a bf16 y almacenados como DCP de un solo rango, sin estado del optimizador. No se dispone de información sobre el número de tokens, la composición detallada del dataset ni el uso de RLHF o DPO.

## Capacidades

- Predicción de acciones de robot a partir de observaciones visuales en bucle cerrado.
- Modelado de mundo de vídeo subyacente (Cosmos3-Nano) como representación para la política de acción.
- Condicionamiento vídeo-a-acción mediante un DiT de acción externo con calendario compartido.
- Integración con el servidor de políticas de acción de `cosmos-framework`.
- Soporte de tool calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (modo thinking, visión, audio): visión como entrada de observación; el resto no disponible.

## Casos de uso

- Control de manipuladores en simulación: el modelo consume observaciones visuales de RoboDojo Sim y emite acciones para tareas de manipulación, aprovechando el condicionamiento vídeo-a-acción para cerrar el bucle de control.
- Investigación en políticas visomotoras: sirve como punto de partida para estudiar cómo un modelo de mundo de vídeo preentrenado transfiere representaciones a la predicción de acciones.
- Evaluación de adaptadores LoRA en robótica: al estar entrenado con LoRA de rango 16 y dimensión 1024, permite analizar el efecto de adaptadores de bajo rango sobre un backbone de mundo de vídeo congelado o parcialmente ajustado.
- Reproducción de experimentos con RoboDojo Sim: el `config.yaml` y los `SHA256SUMS` facilitan la reconstrucción del entorno de entrenamiento con rutas sustituidas por marcadores.
- Benchmarking interno de políticas de acción: útil para comparar variantes de condicionamiento y calendarios de acción dentro del mismo framework.
- Docencia y prototipado en robótica aprendida: el formato DCP y la integración con `cosmos-framework` permiten desplegar el modelo en un servidor de políticas sin reescribir el pipeline.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio pesa 33,2 GB en bf16, por lo que se requiere al menos una GPU con memoria suficiente para cargar los pesos completos más el VAE de Wan2.2 y las activaciones.
- GPU recomendadas: no disponible en la información proporcionada; por el tamaño del checkpoint, se orienta a GPUs de centro de datos (A100, H100) o equivalentes.
- ¿Cabe en GPU de consumo? no disponible; el tamaño de 33,2 GB en bf16 excede la VRAM de la mayoría de GPUs de consumo actuales.
- Opciones de despliegue: servidor de políticas de acción de `cosmos-framework` con `--checkpoint-path <repo> --config-file config.yaml`; requiere un VAE de Wan2.2 (`Wan2.2_VAE.pth` de Wan-AI/Wan2.2-TI2V-5B). Otras opciones (vLLM, llama.cpp, Ollama, TGI) no son aplicables a este tipo de modelo.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| cosmos3_reasoner_obs_tgrid_lora16_d1024_robodojo_b64_60k_scratch_ema | no disponible | no disponible | no disponible | no disponible | Hugging Face, 0 descargas |
| Cosmos3-Nano (base) | no disponible | no disponible | no disponible | no disponible | Referenciado como backbone |
| Alternativas de política de acción robótica | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos suficientes para establecer una comparativa cuantitativa con modelos comparables.

## Limitaciones y advertencias

- Sesgos conocidos: no disponible; al entrenarse en RoboDojo Sim, el comportamiento fuera de esa distribución de simulación no está caracterizado.
- Riesgo de alucinación: no aplicable en el sentido de texto, pero existe riesgo de predicciones de acción no válidas fuera de la distribución de entrenamiento.
- Limitaciones de contexto o idioma: no disponible; el modelo no es lingüístico.
- Restricciones de licencia para uso comercial: la licencia no está disponible, por lo que no se puede asumir uso comercial sin verificación previa.
- Caveats para producción: requiere el servidor de `cosmos-framework` y el VAE de Wan2.2; el `config.yaml` contiene rutas locales sustituidas por marcadores que deben reemplazarse; los pesos son EMA en bf16 sin estado del optimizador, lo que impide reanudar el entrenamiento tal cual; el repositorio no incluye benchmarks ni documentación de rendimiento.

## Enlaces

- Hugging Face: https://huggingface.co/Myungkyu/cosmos3_reasoner_obs_tgrid_lora16_d1024_robodojo_b64_60k_scratch_ema
- VAE de referencia: https://huggingface.co/Wan-AI/Wan2.2-TI2V-5B
- Framework: no disponible como enlace en la información proporcionada.
