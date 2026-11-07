# Myungkyu/cosmos3_mot_l36_d1024_robodojo_b64_60k_scratch_vf96s12_allvis_ema

## Resumen

`cosmos3_mot_l36_d1024_robodojo_b64_60k_scratch_vf96s12_allvis_ema` es un modelo de política de acción para control robótico en bucle cerrado, publicado por el usuario Myungkyu en Hugging Face. Se construye a partir de Cosmos3-Nano, un modelo de mundo de vídeo, al que se le acopla un DiT de acción externo que condiciona la generación de acciones sobre la representación latente del vídeo (condicionamiento unidireccional vídeo-a-acción con un calendario de acción compartido). El resultado es un policy model que predice acciones motoras a partir de observaciones visuales.

El nombre del repositorio codifica la configuración: arquitectura MoT (mixture of transformers) con 36 capas y dimensión oculta de 1024, entrenamiento sobre RoboDojo Sim en formato LeRobot v3.0 con batch de 64 y 60.000 pasos, desde inicialización aleatoria (scratch) y con pesos EMA (media móvil exponencial) como pesos finales. El repo ocupa 32 GB y se distribuye como checkpoint de `torch.distributed` en bf16, sin estado del optimizador.

Es relevante para investigadores en robótica y modelos de mundo porque documenta un pipeline concreto de adaptación de un world model de vídeo a política de control, con un formato de checkpoint poco habitual (DCP de un solo rango) y una dependencia explícita del VAE de Wan2.2. No obstante, la información publicada es mínima: no hay licencia declarada, ni idiomas, ni benchmarks, ni model card extendida más allá de las instrucciones de carga.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MoT (mixture of transformers) sobre Cosmos3-Nano con DiT de acción externo |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible (el config define longitud de chunk y ratio de vídeo, valores no publicados) |
| Tipos de cuantización | bf16 (pesos publicados); no se documentan otras |
| Idiomas soportados | no disponible (modelo orientado a percepción visual y acciones, no a texto) |
| Licencia | no disponible |
| Formato de pesos | torch.distributed.checkpoint (DCP): `model/.metadata`, `model/__0_0.distcp`, claves `net.*` |

## Arquitectura y entrenamiento

El modelo combina un backbone de world model de vídeo (Cosmos3-Nano) con un DiT de acción externo. El condicionamiento es unidireccional: el vídeo informa la predicción de acciones, no al revés, y ambos módulos comparten un calendario de acción. La nomenclatura `l36_d1024` sugiere 36 capas y dimensión de modelo 1024, y `mot` apunta a una arquitectura de mezcla de transformadores (probablemente difusión de vídeo y difusión de acción en paralelo). `vf96s12` podría corresponder a configuración de vista/fotogramas y stride, pero no se detalla en la información disponible.

El entrenamiento parte de cero (`scratch`) sobre RoboDojo Sim en formato LeRobot v3.0, con batch de 64 y 60.000 pasos, y los pesos publicados son los EMA del checkpoint final convertidos a bf16. No se documentan número de tokens, composición del dataset, ni si hubo RLHF/DPO (poco probable en un modelo de acción). La variante `allvis` sugiere el uso de todas las vistas disponibles como entrada visual. El checkpoint no incluye estado del optimizador ni el otro conjunto de pesos del entrenamiento.

## Capacidades

- Predicción de acciones motoras en bucle cerrado a partir de observaciones visuales, orientada a control de robots.
- Modelado de mundo de vídeo subyacente (Cosmos3-Nano), que aporta una representación latente del entorno.
- Condicionamiento vídeo-a-acción con calendario compartido entre el modelo de vídeo y el DiT de acción.
- Soporte de múltiples vistas visuales (`allvis`) como entrada.
- Integración con el servidor de políticas de `cosmos-framework` mediante `--checkpoint-path` y `--config-file`.
- No se documentan capacidades de tool calling, agentes, texto, matemáticas ni audio.

## Casos de uso

- Investigación en políticas visomotoras: servir como punto de partida o baseline para experimentos de control robótico en simulación, cargándolo en el servidor de `cosmos-framework` con el `config.yaml` incluido.
- Evaluación de world models como políticas: comparar el rendimiento de esta variante (`allvis`, EMA, scratch) frente a las variantes `decoupled` y no-EMA del mismo autor para aislar el efecto del diseño de condicionamiento.
- Reproducción de experimentos de RoboDojo Sim: el checkpoint y el config permiten reconstruir el entorno de entrenamiento declarado (LeRobot v3.0) y verificar la receta de 60.000 pasos con batch 64.
- Control de robots manipuladores en simulación: el modelo predice acciones a partir de vídeo, adecuado para tareas de manipulación donde la observación visual es la señal principal.
- Estudio de condicionamiento unidireccional: analizar si la información de vídeo hacia acción sin realimentación es suficiente para tareas de contacto, comparándolo con arquitecturas acopladas.
- Base para fine-tuning posterior: al ser un checkpoint bf16 sin optimizador, puede reutilizarse como inicialización para nuevos entrenamientos sobre otros datasets en formato LeRobot.
- Docencia y divulgación: ejemplo práctico de adaptación de un world model generativo a política de control con un DiT externo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El repo ocupa 32 GB en bf16; la VRAM necesaria para inferencia es al menos del orden del tamaño de los pesos más el VAE de Wan2.2 y los buffers de activación, pero no se publica una cifra concreta.
- Se requiere descargar aparte el VAE `Wan2.2_VAE.pth` de `Wan-AI/Wan2.2-TI2V-5B` y apuntar `vae_path` a la ruta local.
- GPU recomendadas: no disponibles en la información publicada; por tamaño, cabría esperar GPUs de datacenter (A100 80 GB, H100) para ejecución cómoda en bf16, pero es una estimación no confirmada por el autor.
- Compatibilidad con GPU de consumo: no confirmada; 32 GB de pesos en bf16 exceden la VRAM de la mayoría de tarjetas consumer (RTX 4090 tiene 24 GB), por lo que requeriría cuantización o sharding no documentados.
- Despliegue: servidor de políticas de `cosmos-framework` con `--checkpoint-path <dir> --config-file config.yaml`; no se documentan vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| `cosmos3_mot_l36_d1024_robodojo_b64_60k_scratch_vf96s12_allvis_ema` (este) | MoT + DiT de acción, Cosmos3-Nano | no disponible | no disponible | Hugging Face, 32 GB |
| `Myungkyu/cosmos3_mot_l36_d1024_robodojo_b64_60k_scratch` | MoT + DiT de acción, Cosmos3-Nano | no disponible | no disponible | Hugging Face |
| `Myungkyu/cosmos3_mot_l36_d1024_robodojo_decoupled_b64_60k_scratch_ema` | MoT + DiT de acción desacoplado, Cosmos3-Nano | no disponible | no disponible | Hugging Face |

Las tres variantes comparten backbone, dataset y receta de entrenamiento; difieren en el diseño de condicionamiento (`decoupled` frente al acoplado) y en el uso de EMA. No se dispone de benchmarks que permitan comparar rendimiento entre ellas.

## Limitaciones y advertencias

- Ausencia total de licencia declarada: no se puede asumir uso comercial permitido; hay que contactar con el autor antes de cualquier despliegue productivo.
- Sin benchmarks ni métricas de éxito publicadas: no hay evidencia cuantitativa de rendimiento en tareas de RoboDojo Sim ni de transferencia a robots reales.
- Entrenado exclusivamente en simulación (RoboDojo Sim): riesgo alto de brecha sim-a-real (sim-to-real gap) si se usa en hardware físico.
- Inicialización desde cero (`scratch`) y solo 60.000 pasos: es probable que no haya convergido al mismo nivel que variantes con inicialización preentrenada, aunque no hay datos para confirmarlo.
- Checkpoint en formato DCP de un solo rango sin optimizador: complica la reanudación de entrenamiento y requiere el servidor de `cosmos-framework` para cargarlo.
- Dependencia externa del VAE de Wan2.2: sin ese archivo el modelo no se puede ejecutar; el config contiene rutas con placeholders que hay que sustituir.
- Sin información sobre sesgos, alucinación o limitaciones idiomáticas (el modelo no procesa lenguaje de forma documentada).
- Fecha de creación futura (2026-11-07) y cero descargas/likes: modelo muy reciente y sin validación por parte de la comunidad.
- El nombre del repo codifica hiperparámetros pero no se publica la ficha técnica completa; cualquier interpretación de `vf96s12` o `allvis` es inferencia, no dato confirmado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Myungkyu/cosmos3_mot_l36_d1024_robodojo_b64_60k_scratch_vf96s12_allvis_ema
- Variante sin EMA: https://huggingface.co/Myungkyu/cosmos3_mot_l36_d1024_robodojo_b64_60k_scratch
- Variante desacoplada con EMA: https://huggingface.co/Myungkyu/cosmos3_mot_l36_d1024_robodojo_decoupled_b64_60k_scratch_ema
- VAE requerido (Wan2.2-TI2V-5B): https://huggingface.co/Wan-AI/Wan2.2-TI2V-5B
