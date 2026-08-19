# SeanLiu0272/past2next-libero10

## Resumen

Past2Next es un sistema de modelado de acciones discretas en dos etapas para manipulación robótica, desarrollado por SeanLiu0272 y entrenado sobre el benchmark LIBERO-10. El repositorio publica dos checkpoints complementarios: un tokenizador de acciones (OATTokSO3Aug) y una política autoregresiva (Past2NextSelfPastPolicy) que genera secuencias de acciones condicionadas a observaciones y a sus propias acciones previas. El modelo aborda el problema del aprendizaje de imitación en robótica convirtiendo acciones continuas de 7 grados de libertad en tokens discretos mediante cuantización FSQ, lo que permite modelar el comportamiento como un problema de predicción de secuencias.

La relevancia actual del modelo radica en su enfoque de tokenización de acciones con cuantización de producto finito (FSQ) y en la estrategia "self-past", que alimenta la política con sus propias acciones generadas en lugar de las de la demostración, mejorando la robustez durante el despliegue. El sistema está entrenado con 500 demostraciones (10 tareas × 50) del benchmark LIBERO-10, en entornos simulados de manipulación doméstica. La arquitectura es un transformer causal de 4 capas con dimensión de embedding 256, y el tokenizador comprime chunks de 16 pasos de acción en 8 tokens ordenados. El repositorio tiene un tamaño de 0.8 GB y se distribuye bajo licencia MIT.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Tokenizador de acciones (autoencoder con cuantización FSQ) + política transformer causal autoregresiva |
| Parámetros totales | no disponible (checkpoints de 93 MB y 692 MB, incluyen estado de optimizador y EMA) |
| Parámetros activos | no aplica (no es modelo MoE) |
| Longitud de contexto | Ventana de observación de 2 pasos; horizonte de acción de 16 pasos comprimidos en 8 tokens; contexto de acciones previas de 7 (past_n=7) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no aplica (modelo de robótica, no de lenguaje) |
| Licencia | MIT |
| Formato de pesos | Checkpoints PyTorch con serialización dill (torch.save + dill), no safetensors |

## Arquitectura y entrenamiento

El sistema se compone de dos módulos entrenados secuencialmente. La primera etapa es un autoencoder de solo acciones con un cuello de botella discreto FSQ, denominado OATTokSO3Aug. Este comprime un chunk de 16 pasos de acciones continuas de 7-DoF en 8 tokens ordenados y los reconstruye, sin recibir observaciones. Se entrena con una técnica de aumento de datos SO(3) sobre el chunk de acciones (p=0.6, max_angle_deg=30, modo left_noise, solo dimensiones de rotación). El espacio latente FSQ tiene niveles [8, 5, 5, 5, 5], es decir, una dimensión latente de 5 con 5000 códigos posibles; los checkpoints entrenados con la configuración anterior de 6 dimensiones no son intercambiables con este.

La segunda etapa es una política transformer causal, Past2NextSelfPastPolicy, que se condiciona sobre observaciones y sobre las acciones previamente generadas por la propia política, prediciendo autoregresivamente los tokens del siguiente chunk de acciones. Los tokens se decodifican con el tokenizador de la etapa 1 congelado y se ejecutan con un esquema de horizonte recedente (receding-horizon). La variante "self-past" utiliza acciones generadas por la propia política en lugar de las acciones reales del dataset, con una probabilidad de self_past_p=1.0 tras un calentamiento de self_past_warmup_steps=500. La configuración es: horizon=16, n_action_steps=8, n_obs_steps=2, past_n=7, embed_dim=256, n_layers=4, n_heads=4.

## Capacidades

- Modelado de acciones de manipulación robótica de 7 grados de libertad (posición y orientación).
- Compresión de secuencias de acciones continuas en tokens discretos mediante cuantización FSQ.
- Generación autoregresiva de chunks de acciones condicionada a observaciones y a acciones previas.
- Ejecución de horizonte recedente con ventanas de acción de 8 pasos y predicción de 16 pasos.
- Aprendizaje de imitación a partir de demostraciones humanas en el benchmark LIBERO-10.
- Soporte de aumento de datos SO(3) específico para rotaciones durante el entrenamiento.
- No es un modelo de lenguaje: no ofrece capacidades de texto, código, visión ni tool calling.

## Casos de uso

- Investigación en aprendizaje de imitación para robótica: el modelo sirve como baseline reproducible para estudiar la tokenización de acciones y el modelado autoregresivo en tareas de manipulación.
- Desarrollo de pipelines de entrenamiento en LIBERO-10: permite evaluar la transferencia de conocimiento entre tareas de manipulación en entornos simulados de hogar.
- Estudio de estrategias de "self-past": la variante que realimenta las acciones generadas por la propia política es útil para analizar la degradación por exposición (exposure bias) en políticas autoregresivas.
- Benchmarking de métodos de aprendizaje por imitación: con una tasa de éxito de 0.772 en el epoch 200, sirve como baseline para comparar con otros enfoques de modelado de acciones.
- Desarrollo de tokenizadores de acciones: el tokenizador FSQ con reconstrucción MSE de 0.001 puede reutilizarse como módulo de compresión de acciones en otros sistemas.
- Formación de investigadores en robótica: el repositorio incluye configuraciones Hydra embebidas en los checkpoints, facilitando la experimentación sin ficheros YAML externos.

## Benchmarks y rendimiento

Los datos de rendimiento disponibles provienen del propio autor en la model card:

| Modelo | Métrica | Valor |
|---|---|---|
| Tokenizador (ep 4960) | MSE de reconstrucción | 0.001 |
| Política (ep 200) | Tasa de éxito en LIBERO-10 | 0.772 |

No se han publicado resultados de benchmarks comparativos con otros modelos en la información disponible. La política se encuentra en una ejecución en curso (epoch 200 de 5001), por lo que el rendimiento puede mejorar en revisiones posteriores del repositorio.

## Requisitos de hardware

- Tamaño de los checkpoints: 93 MB (tokenizador) y 692 MB (política), incluyendo estado de optimizador y EMA; la carga en memoria para inferencia es significativamente menor.
- La política es un transformer de 4 capas con embed_dim=256, por lo que es ligera y ejecutable en GPU de consumo (por ejemplo, NVIDIA RTX 3060 o superiores) con VRAM inferior a 2 GB.
- No se requieren GPU de datacenter como A100 o H100 para inferencia; el entrenamiento completo se realizó con recursos no especificados.
- El despliegue se realiza mediante el código del repositorio (Python), no es compatible con frameworks como vLLM, llama.cpp, Ollama o TGI al no ser un modelo de lenguaje.
- Se requiere el submodule LIBERO (branch oat) para ejecutar el entorno de simulación.
- No se dispone de datos de latencia o throughput publicados.

## Comparativa con modelos similares

No disponible. No se han encontrado en la información proporcionada modelos comparables en la misma categoría (políticas de manipulación robótica con tokenización discreta de acciones) con datos de rendimiento y licencia que permitan una comparación rigurosa.

## Limitaciones y advertencias

- Los checkpoints son de estado de entrenamiento (torch.save + dill) y no están en formato safetensors; cargarlos ejecuta código pickled, por lo que solo se deben cargar checkpoints de fuentes confiables.
- La política se entrenó con solo 500 demostraciones (10 tareas × 50), lo que limita la generalización a tareas fuera del conjunto LIBERO-10.
- El entrenamiento de la política está en progreso (epoch 200 de 5001); el rendimiento reportado (0.772) puede no reflejar el estado final.
- El tokenizador de acciones no es intercambiable con versiones anteriores entrenadas con niveles FSQ de 6 dimensiones.
- No es un modelo de lenguaje general: no tiene capacidades de texto, visión, herramientas ni agentes fuera del dominio de manipulación robótica.
- La licencia MIT permite uso comercial, pero el modelo requiere el entorno LIBERO (con su propia licencia) para ejecutarse.
- No hay datos de sesgos, alucinación o limitaciones de contexto aplicables al ser un modelo de robótica y no un modelo de lenguaje.

## Enlaces

- Repositorio de HuggingFace: https://huggingface.co/SeanLiu0272/past2next-libero10
- Código del modelo: https://github.com/seanliu7081/past2next_clean
- Submódulo LIBERO (rama oat): https://github.com/Chaoqi-LIU/LIBERO
- Proyecto LIBERO original (NVlabs): https://github.com/NVlabs/Libero-10-r
