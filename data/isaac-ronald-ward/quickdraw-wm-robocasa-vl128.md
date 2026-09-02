# isaac-ronald-ward/quickdraw-wm-robocasa-vl128

## Resumen

quickdraw-wm-robocasa-vl128 es un modelo de mundo latente (latent world model) desarrollado por Isaac Ronald Ward, investigador en robótica y exploración autónoma. El modelo toma 8 pasos de contexto compuestos por un vector propioceptivo y una imagen de cámara, junto con una secuencia de acciones, y predice en bucle abierto (open-loop) los fotogramas y estados futuros sin recibir observaciones adicionales. Está diseñado para entornos robóticos simulados, concretamente el framework RoboCasa de UT Austin, centrado en tareas domésticas en cocinas.

La arquitectura se basa en el paquete `quickdraw` con el modelo `mm_flow` (flujo multimodal) y la receta `vl128`. La cabeza de imagen trabaja a 96 píxeles y produce 32 tokens latentes por fotograma. El repositorio ocupa 0,2 GB e incluye pesos en formato `safetensors` y un checkpoint completo de Lightning para reanudar entrenamiento. La licencia es MIT, lo que permite uso comercial sin restricciones.

La relevancia de este modelo radica en su capacidad para predecir dinámicas visuales y propioceptivas en simulación robótica, lo que habilita planificación basada en modelos, entrenamiento de políticas y evaluación de escenarios sin necesidad de ejecutar el entorno real. Aunque la fidelidad degrada con el horizonte, el modelo mantiene un seguimiento grueso de la escena a través de grandes cambios de punto de vista, como se muestra en las tiras de fotogramas publicadas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de flujo multimodal (`mm_flow`) con codificador de imagen a 96px y 32 tokens latentes por frame |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8 pasos de contexto (propiocepción + imagen) + horizonte de predicción de 128 pasos |
| Tipos de cuantizacion | no disponible (solo se publican pesos en precisión completa) |
| Idiomas soportados | no disponible (modelo no lingüístico) |
| Licencia | MIT |
| Formato de pesos | `safetensors` (inferencia) y `training_state.ckpt` (Lightning, con buffers de AdamW) |

## Arquitectura y entrenamiento

El modelo emplea un enfoque de flujo (flow matching) multimodal, implementado en la librería `quickdraw` con la configuración `model=mm_flow` y la receta `vl128`. La entrada combina un vector propioceptivo normalizado y una imagen de cámara, ambos procesados por codificadores separados que producen tokens latentes. El decodificador de imagen reconstruye los fotogramas a partir de los tokens latentes, y la dinámica se predice en el espacio latente. El entrenamiento se realizó sobre el dataset RoboCasa, un framework de simulación a gran escala de UT Austin que ofrece escenas de cocina realistas y diversas.

El proceso de entrenamiento incluye una pérdida perceptual (VGG) y una pérdida latente con peso fijado en 10, según las notas del autor. No se menciona el uso de RLHF o DPO; se trata de un entrenamiento supervisado de predicción. El checkpoint seleccionado corresponde a la mejor métrica de LPIPS en bucle abierto a +128 pasos, preservado mediante poda `save_top_k`. El autor advierte que la versión del paquete `quickdraw` nunca se ha incrementado, por lo que el commit específico es el pin real de reproducibilidad.

## Capacidades

- Predicción de vídeo en bucle abierto: genera hasta 128 fotogramas futuros y estados propioceptivos sin re-observaciones.
- Modelado multimodal: combina imagen, propiocepción y acciones para predecir dinámicas conjuntas.
- Reconstrucción de escenas: el autoencoder alcanza un suelo de LPIPS de 0.0846 y PSNR de 19.65 dB, lo que fija el límite de calidad de reconstrucción.
- Seguimiento grueso de la escena: mantiene la estructura general a través de grandes cambios de punto de vista, aunque pierde detalle fino con el horizonte.
- Integración con `quickdraw`: API sencilla para carga de pesos, normalización y generación de rollouts.
- No soporta tool calling, agentes ni razonamiento lingüístico; es un modelo puramente perceptivo-dinámico.

## Casos de uso

- Planificación de movimientos en robótica: el modelo puede predecir las consecuencias visuales y propioceptivas de una secuencia de acciones, permitiendo evaluar trayectorias candidatas sin ejecutarlas en el entorno real.
- Entrenamiento de políticas con modelos (model-based RL): usar las predicciones como simulador diferenciable o no diferenciable para optimizar políticas de control en tareas de manipulación doméstica.
- Aumento de datos para aprendizaje por imitación: generar rollouts sintéticos a partir de demostraciones reales para ampliar la cobertura de estados y acciones.
- Validación de escenarios de seguridad: antes de desplegar un controlador en el robot físico, se pueden simular situaciones de riesgo (colisiones, vuelcos) en el mundo latente.
- Benchmarking de algoritmos de control: comparar el rendimiento de diferentes políticas en el mismo entorno simulado usando las predicciones del modelo como métrica de consistencia.
- Exploración autónoma: en entornos simulados, el modelo puede guiar la selección de acciones que maximicen la incertidumbre de predicción, fomentando la exploración de regiones desconocidas.

## Benchmarks y rendimiento

El autor publica métricas de predicción de imagen en bucle abierto, comparadas con el suelo del autoencoder (límite de reconstrucción perfecta de la dinámica). No se proporcionan comparaciones con otros modelos.

| Métrica | Valor | Epoch de evaluación |
|---|---|---|
| LPIPS @+128 (menor es mejor) | 0.13697 | 11 |
| LPIPS @+64 | 0.15152 | 19 |
| PSNR @+128 (dB, mayor es mejor) | 14.083386 | 8 |
| Autoencoder floor LPIPS | 0.084583 | 18 |
| Autoencoder floor PSNR (dB) | 19.652968 | 23 |

Nota: el LPIPS reportado usa una red SqueezeNet, mientras que el entrenamiento utilizó VGG. Ambas son redes preentrenadas en ImageNet, por lo que la métrica es parcialmente auto-referencial. El autor recomienda leer también PSNR/SSIM y examinar los fotogramas directamente.

## Requisitos de hardware

- No se especifican requisitos oficiales de VRAM ni GPU en la documentación disponible.
- El tamaño del repositorio es de 0,2 GB, lo que sugiere que los pesos caben en GPUs consumer (p. ej., RTX 3060 con 12 GB o superiores), pero la memoria durante la inferencia depende del horizonte y del tamaño del lote.
- El autor advierte que el decodificador de imagen consume aproximadamente el 78% de la memoria por muestra, por lo que recomienda pasar `decode_chunk` para horizontes largos.
- Opciones de despliegue: la librería `quickdraw` proporciona una API de Python con `load_pretrained` e `imagine_eval`. No se mencionan integraciones con vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- La latencia y el throughput no están documentados; dependerán del hardware y de la configuración de decodificación.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. El autor no publica comparaciones con otros world models (p. ej., Dreamer, IRIS, o modelos de video-predicción como VideoGPT). Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- Degradación de fidelidad con el horizonte: la calidad de predicción empeora notablemente a +128 pasos, como muestra la curva de error frente al paso.
- El rollout es la parte débil: el autoencoder reconstruye mucho mejor que la dinámica predice; la mayor parte del error a +128 proviene del suelo del codec, no de la deriva del modelo.
- Entrenado en un único dataset (RoboCasa) con geometría de cámara fija; no se ha probado fuera de distribución más allá de los splits de evaluación publicados.
- La métrica LPIPS usa SqueezeNet mientras el entrenamiento usó VGG, lo que introduce una posible correlación auto-referencial; los valores deben interpretarse con cautela.
- Normalización de entradas: los vectores propioceptivos deben pasar por `norm_obs`/`denorm_obs`, mientras que las imágenes se usan en `[0,1]` sin normalizar. Mezclar estos protocolos produce resultados plausibles pero incorrectos.
- Las acciones de entrada requieren `P + H - 1` pasos, no `H`; omitir esto provoca errores silenciosos.
- No es un modelo de lenguaje: no soporta generación de texto, tool calling ni razonamiento simbólico.
- La licencia MIT permite uso comercial, pero el modelo se distribuye sin garantías y con limitaciones de responsabilidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/isaac-ronald-ward/quickdraw-wm-robocasa-vl128
- Página personal del autor: https://isaacronaldward.com/
- RoboCasa (sitio oficial): https://robocasa.ai/
- Repositorio GitHub de RoboCasa: https://github.com/robocasa/robocasa
- Paper de RoboCasa (arXiv): https://arxiv.org/abs/2406.02523
- Repositorio de `quickdraw` (pin de versión): https://github.com/isaac-ward/quickdraw (commit `5c924fd82bb463f783d6cb49f8f4d32b408f4277`)
