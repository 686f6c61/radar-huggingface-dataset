# Jogima-cyber/coupled-global-local-wm-rl

## Resumen

`coupled-global-local-wm-rl` es un conjunto de pesos preentrenados para el experimento G1 (agarre y elevación egocéntricos con un humanoide) del artículo *Coupled Local and Global World Models for Efficient First Order RL* (CoRL 2026), desarrollado por el autor Jogima-cyber. No es un modelo de lenguaje, sino un sistema de modelos del mundo para aprendizaje por refuerzo basado en modelo (MBRL): un modelo del mundo global grande (tokenizador de vídeo DreamerV4 y transformer de dinámica con cabeza de recompensa) que genera los rollouts, y un modelo del mundo local pequeño (RSSM estilo DreamerV3) que proporciona los gradientes analíticos de la pasada hacia atrás.

La propuesta resuelve el coste computacional de los gradientes de política de primer orden en MBRL: en lugar de diferenciar a través del modelo global, se entrena la política dentro del modelo local, mientras que el global aporta fidelidad de generación. El repositorio contiene tres componentes con un total de aproximadamente 1.611 millones de parámetros y 6,5 GB en fp32.

Es relevante ahora porque publica pesos listos para usar junto con código de entrenamiento reproducible (8 GPUs H100, unas 9,5 horas por política) y un dataset asociado de 153 GB, lo que permite replicar el pipeline completo de entrenamiento de políticas humanoides en modelos del mundo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Tokenizador de vídeo DreamerV4 (transformer block-causal, 16 capas, ancho 1024, 16 cabezas, parches 16x16) + transformer de dinámica DreamerV4 (24 capas, ancho 1536, 24 cabezas, 4 tokens de registro) + RSSM DreamerV3 XL (GRU de estado 4096-d, 32 variables categóricas de 32 clases) |
| Parametros totales | 1.611 M (757 M tokenizador + 682 M dinámica + 172 M RSSM) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | Tokenizador: clips de 64 frames; dinámica: ventana deslizante de 96 frames con caché KV de 32 frames; RSSM: no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en fp32; el código carga en bfloat16 en CUDA) |
| Idiomas soportados | no disponible (modelo de robótica, sin capacidades lingüísticas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (fp32, sin estado del optimizador) + config.json por componente |

## Arquitectura y entrenamiento

El sistema se compone de dos modelos del mundo acoplados. El global consta de un tokenizador de vídeo (encoder y decoder block-causal con atención temporal cada 4 capas) que convierte frames RGB de 256x256 y un vector de propiocepción de 50 dimensiones en 256 tokens latentes de anchura 32 por frame, y de un transformer de dinámica que, a partir de los latentes pasados y un comando absoluto de 22 dimensiones por frame, predice los latentes del siguiente frame mediante 4 pasos shortcut y una recompensa. La cabeza de recompensa emite distribuciones two-hot sobre 255 bins uniformes en espacio symlog en [-20, 20] para los frames t a t+7. El modelo local es un RSSM DreamerV3 XL que opera sobre frames de 64x64 y acciones relativas, y que aporta los gradientes de la pasada hacia atrás.

Los datos de entrenamiento son juego humanoide G1 desde una cámara egocéntrica a 256x256 y 10 Hz: 290 archivos, 752.861 frames (20,9 h), con comandos de 22 dimensiones, propiocepción de 50 dimensiones y etiquetas de recompensa binarias anotadas a mano. El tokenizador se inicializó desde un tokenizador DreamerV4 preentrenado en datos SOAR (con parámetros de propiocepción reinicializados) y se entrenó con 45.000 actualizaciones de 256 clips de 64 frames, con pérdida MSE + 0,2 LPIPS + 0,01 MSE_propio, cada término dividido por su RMS, enmascaramiento MAE de hasta el 90 % de los parches, AdamW con lr 1e-4 y weight decay 0,01. El backbone de dinámica se entrenó desde cero con 228 archivos y 593.329 frames. El RSSM se preentrenó con 10 archivos de demostración (25.960 frames, recompensa 1 en todos).

## Capacidades

- Modelado del mundo para robótica humanoide: predicción de latentes de vídeo y recompensa a 10 Hz a partir de comandos del controlador de bajo nivel.
- Generación de rollouts condicionados por comandos de 22 dimensiones (velocidad de base, 17 articulaciones del tren superior, dos agarres).
- Predicción de recompensa multi-paso (frames t a t+7) como distribuciones two-hot en 255 bins symlog.
- Entrenamiento de políticas con gradientes de primer orden (analíticos) a través del RSSM local.
- Replay de comandos grabados con generación de vídeo comparativo mediante `scripts/compare_rollouts.py`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso textual ni capacidades multilingües: es un componente de MBRL, no un modelo de lenguaje.

## Casos de uso

- Entrenamiento de políticas de manipulación humanoide en simulación aprendida: el pipeline `coupled_wm.rl.train` permite entrenar una política G1 dentro de los modelos del mundo con 8 GPUs H100 en unas 9,5 horas, evitando el coste de un simulador físico.
- Investigación en MBRL de primer orden: el acoplamiento global/local permite estudiar el compromiso entre fidelidad de rollout (modelo global) y coste de gradiente (modelo local) con pesos de partida publicados.
- Evaluación de controladores de bajo nivel: el modelo de dinámica acepta comandos absolutos de 22 dimensiones compatibles con la política SONIC, por lo que sirve para comparar controladores sin desplegar hardware.
- Generación de datos sintéticos de vídeo robótico: el tokenizador y la dinámica pueden producir rollouts de 256x256 a 10 Hz para aumentar datasets de entrenamiento.
- Reproducción de resultados del artículo: los pesos y el dataset permiten replicar el experimento de agarre y elevación egocéntrico con las semillas documentadas.
- Prototipado de recompensas: la cabeza de recompensa con 255 bins symlog permite definir y validar funciones de recompensa alternativas sobre datos offline antes de entrenar políticas reales.
- Análisis de estabilidad de políticas: la ventana deslizante de 96 frames de la dinámica permite estudiar horizontes largos de rollout y su degradación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: los pesos suman 6,5 GB en fp32; en bfloat16 (carga recomendada por el código) el conjunto ronda los 3,3 GB, más activaciones y caché KV de 32 frames.
- GPU recomendadas: el entrenamiento de referencia usa 8x H100 durante unas 9,5 horas; el tokenizador se entrenó con 64 H100 durante unas 25 horas.
- GPU de consumo: no se documenta soporte para GPU de consumo; el código asume CUDA y bfloat16, por lo que una RTX 4090 (24 GB) podría alojar la inferencia en bf16, pero no está verificado en la información disponible.
- Despliegue: el proyecto usa su propio paquete `coupled_wm` con PyTorch; no se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| coupled-global-local-wm-rl (este) | 1.611 M | 96 frames (ventana deslizante) | MBRL humanoide G1 | Apache 2.0 | Pesos y código públicos |
| DreamerV3 (XL) | no disponible en la información | no disponible | MBRL general | MIT (referencia habitual) | Código público; pesos específicos no disponibles en la información |
| DreamerV4 | no disponible en la información | no disponible | Modelado del mundo con tokenizador de vídeo | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Modelo específico de robótica: no procesa texto ni lenguaje natural; los idiomas soportados no están disponibles porque no aplica.
- Dominio restringido al humanoide G1 con una cámara egocéntrica a 256x256 y 10 Hz; no se documenta generalización a otros robots, cámaras o frecuencias.
- El dataset de entrenamiento es limitado (290 archivos, 20,9 h) y las recompensas fueron etiquetadas a mano, lo que introduce sesgo de anotación.
- Riesgo de deriva en rollouts largos: la dinámica usa una ventana deslizante de 96 frames y 4 pasos shortcut, sin datos publicados sobre degradación a horizontes mayores.
- El entrenamiento de RL requiere el dataset G1 (153 GB, de los que se leen 106 GB) además de los pesos; no es autónomo.
- No hay resultados de benchmarks publicados, por lo que el rendimiento real frente a alternativas no está cuantificado.
- La licencia Apache 2.0 permite uso comercial, pero el modelo depende de la política SONIC para la convención de comandos y de componentes DreamerV3/V4; conviene revisar las licencias de esos componentes.
- El repositorio tiene 0 descargas y 0 likes en el momento de la ficha, sin validación comunitaria documentada.

## Enlaces

- Hugging Face: https://huggingface.co/Jogima-cyber/coupled-global-local-wm-rl
- Dataset: https://huggingface.co/datasets/Jogima-cyber/coupled-global-local-wm-rl
- Código: https://github.com/Jogima-cyber/coupled-wm
- Artículo: https://arxiv.org/abs/2602.06219
- Página del proyecto: https://coupled-global-local-wm-rl.pages.dev/
- Referencia SONIC: https://arxiv.org/abs/2511.07820
