# Shaoan/Agent-State-LAM

## Resumen

Agent-State LAM es una familia de modelos de acción latente (Latent Action Models, LAM) para robótica y aprendizaje por refuerzo, publicada por Shaoan Xie y colaboradores (Feng, Zhu, Spirtes y Zhang) en el artículo "Learning Agent States for Latent Action Modeling". El modelo aprende representaciones compactas del estado del agente a partir de vídeo sin etiquetar, junto con acciones latentes que modelan las transiciones entre estados. Resuelve el problema de aprender dinámicas útiles para control robótico cuando no se dispone de etiquetas de acción explícitas.

La innovación principal es el entrenamiento conjunto de un estado compacto del agente, que agrega características visuales densas en un espacio compartido para inferencia de acción y predicción hacia delante, y una discriminación temporal espacialmente emparejada (SMTD) que entrena al modelo para distinguir su fotograma de origen de fotogramas cercanos mediante emparejamiento espacialmente flexible con características visuales locales congeladas. El repositorio contiene un checkpoint por conjunto de datos: cuatro tareas de Distracting Control Suite (DCS) y seis conjuntos de vídeo robótico real (Bridge V2, Berkeley Autolab UR5, Jaco Play, Taco Play, RT-1 e IRASim).

El modelo se distribuye bajo licencia Apache 2.0, con un tamaño de repositorio de 9,4 GB y pesos en formato `.pt` (PyTorch). No se han publicado datos de parámetros totales, longitud de contexto ni idiomas soportados en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Latent Action Model (LAM) con estado de agente compacto y discriminación temporal espacialmente emparejada (SMTD); basado en características visuales DINOv2-B/14 en los modelos de vídeo real |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de robótica, no de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | `.pt` (PyTorch) |

## Arquitectura y entrenamiento

Agent-State LAM es un modelo de acción latente que aprende a partir de vídeo sin etiquetar. La arquitectura combina dos componentes: (1) un estado compacto del agente que agrega características visuales densas en un espacio compartido, utilizado tanto para la inferencia de acción como para la predicción hacia delante, y (2) un mecanismo de discriminación temporal espacialmente emparejada (SMTD) que entrena al estado compacto para distinguir su fotograma de origen de fotogramas cercanos, mediante emparejamiento espacialmente flexible con características visuales locales congeladas. En los modelos de vídeo real, las características visuales provienen de DINOv2-B/14 (tokens de parche de forma (B, 256, 768) por fotograma) y el modelo se construye sobre el modelo de acción latente de UniVLA.

El entrenamiento se realizó por separado para cada conjunto de datos: cuatro tareas de Distracting Control Suite (hopper-hop, cheetah-run, walker-run, humanoid-walk) y seis conjuntos de vídeo robótico real (Bridge V2, Berkeley Autolab UR5, Jaco Play, Taco Play, RT-1 e IRASim) tras 10.000 pasos. No se especifican en la información disponible el número total de tokens de entrenamiento, la composición detallada del dataset ni si se emplearon técnicas de RLHF o DPO (no aplicables en este dominio).

## Capacidades

- Aprendizaje de acciones latentes a partir de vídeo sin etiquetar para robótica y control.
- Representación compacta del estado del agente para inferencia de acción y predicción hacia delante.
- Discriminación temporal espacialmente emparejada (SMTD) para distinguir fotogramas de origen y fotogramas cercanos.
- Extracción de etiquetas de acción latente a partir de pilas de fotogramas (para DCS: tensores (B, 9, 64, 64) escalados a [-1, 1]).
- Codificación de pares de fotogramas en tokens de parche DINOv2-B/14 para modelos de vídeo real.
- Sonda de acción (action probe) y control downstream descritos en los README del código.
- No es un modelo de lenguaje: no soporta tool calling, agentes multi-paso ni capacidades multilingües.
- No dispone de modo thinking, visión general, audio ni otras capacidades multimodales fuera del procesamiento de vídeo robótico.

## Casos de uso

- Aprendizaje de políticas robóticas a partir de vídeo no etiquetado: el modelo extrae acciones latentes de secuencias de vídeo, lo que permite entrenar políticas de control sin necesidad de etiquetas de acción explícitas, usando los checkpoints de DCS o de vídeo real según el dominio.
- Preentrenamiento de representaciones para control en entornos con distracciones visuales: los checkpoints de Distracting Control Suite (hopper-hop, cheetah-run, walker-run, humanoid-walk) están entrenados específicamente para robustez frente a distracciones, útiles como inicialización en tareas de RL con ruido visual.
- Transferencia a dominios de manipulación robótica real: los checkpoints de Bridge V2, UR5, Jaco Play, Taco Play, RT-1 e IRASim permiten obtener representaciones de estado y acciones latentes en escenarios de manipulación real, reutilizables para aprendizaje por imitación.
- Investigación en modelos de acción latente: el modelo sirve como base reproducible para estudiar la relación entre estado compacto del agente y acciones latentes, con código y checksums SHA256 publicados.
- Evaluación de sondas de acción (action probes): los checkpoints permiten medir la calidad de las representaciones aprendidas mediante sondas lineales sobre las acciones latentes, tal como se describe en el código.
- Predicción hacia delante en vídeo robótico: el estado compacto del agente se usa para predecir transiciones futuras, útil en planificación basada en modelo y en verificación de dinámicas aprendidas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; el repositorio ocupa 9,4 GB, lo que da una cota superior del espacio en disco necesario para todos los checkpoints.
- GPU recomendadas: no disponible; el código de ejemplo usa `device="cuda"`, por lo que se requiere una GPU compatible con CUDA.
- Compatibilidad con GPU de consumo: no disponible; los modelos de vídeo real dependen de DINOv2-B/14 y de un checkout de UniVLA, lo que condiciona los requisitos de memoria.
- Opciones de despliegue: carga mediante PyTorch con el código del repositorio `Mid-Push/Agent-State-LAM`; descarga con `hf download Shaoan/Agent-State-LAM --local-dir checkpoints`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Categoria | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Agent-State LAM | LAM para robótica | no disponible | no disponible | Apache 2.0 | Hugging Face + código en GitHub |
| UniVLA (modelo de acción latente base) | LAM para robótica | no disponible | no disponible | Apache 2.0 (según la model card) | GitHub OpenDriveLab/UniVLA |
| Otros LAM comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones de parámetros de los modelos comparables en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa.

## Limitaciones y advertencias

- Modelo específico de robótica: no es un modelo de lenguaje ni un modelo multimodal general; no admite texto, tool calling ni agentes conversacionales.
- Un checkpoint por conjunto de datos: no existe un modelo único generalista; es necesario seleccionar el checkpoint adecuado al dominio (DCS o vídeo real concreto).
- Dependencia externa: los modelos de vídeo real requieren un checkout del código de UniVLA y de DINOv2-B/14, lo que añade complejidad de despliegue y posibles incompatibilidades de versiones.
- Riesgo de sobreajuste al dominio: al entrenarse 10.000 pasos por dataset, el rendimiento fuera de la distribución de entrenamiento no está documentado.
- Sin datos publicados de sesgos, alucinación o robustez fuera de los benchmarks del artículo (no disponibles en esta ficha).
- Licencia Apache 2.0 permite uso comercial, pero los modelos de vídeo real heredan la licencia de UniVLA; conviene verificar los términos de UniVLA y de DINOv2 antes de un despliegue comercial.
- Los enlaces al paper (`arxiv.org/abs/ARXIV_ID`) y a la página del proyecto aparecen como marcadores sin resolver en la model card, por lo que la referencia bibliográfica completa no está disponible.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema de validación limitado.

## Enlaces

- Hugging Face: https://huggingface.co/Shaoan/Agent-State-LAM
- Página del proyecto: https://agent-state-lam.github.io
- Paper: https://arxiv.org/abs/ARXIV_ID (identificador sin resolver en la model card)
- Código: https://github.com/Mid-Push/Agent-State-LAM
- UniVLA (dependencia): https://github.com/OpenDriveLab/UniVLA
