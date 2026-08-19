# ForgeWM/ForgeWM

## Resumen

ForgeWM es un conjunto de checkpoints para un modelo de mundo (world model) de video, condicionado por acciones, desarrollado por un equipo de CUHK, Tencent PCG, FDU, Shanghai AI Laboratory y HKUST. El modelo permite generar secuencias de video interactivas en tiempo real para entornos de juego como Minecraft y un FPS, a partir de entradas de teclado, ratón o gamepad. Su relevancia radica en que logra inferencia en pocos pasos (1, 2 o 4) mediante destilación de consistencia y DMD, lo que lo hace apto para aplicaciones de tiempo real sin sacrificar calidad visual.

La arquitectura se basa en el modelo base Matrix-Game 2 (MG2) y se entrena con un enfoque progresivo-causal que combina SFT bidireccional, teacher-forcing causal, destilación de consistencia y DMD. El repositorio incluye varios checkpoints que forman una única línea evolutiva para Minecraft, además de un checkpoint separado para un FPS. El tamaño total del repositorio es de 69,7 GB, aunque no se especifica el número de parámetros del modelo.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusión de video (base: Matrix-Game 2) |
| Parametros totales | no disponible |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de video, no textual) |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch (.pt) |

## Arquitectura y entrenamiento

ForgeWM es un modelo de mundo de video condicionado por acciones, entrenado sobre el modelo base Matrix-Game 2 (MG2). El entrenamiento sigue una receta progresiva-causal en varias etapas: la etapa 0 realiza un SFT bidireccional para adaptación al dominio (4.000 actualizaciones), la etapa 1 entrena un modelo autorregresivo causal con teacher-forcing (20.000 actualizaciones, lr 2e-5), la etapa 2 aplica destilación de consistencia sobre la etapa 1 (6.000 actualizaciones) y la etapa 3 produce el modelo final ForgeWM-4 mediante DMD (Distribution Matching Distillation) en 4 pasos. También se proporcionan variantes de 1 y 2 pasos (ForgeWM-1 y ForgeWM-2) que comparten las etapas 0-2 y usan un esquema de presupuesto de pasos específico (first-chunk FFE).

Los datos de entrenamiento provienen de GameFactory para Minecraft y de SCOPE para el FPS. El modelo emplea atención con ventana deslizante (sliding-window attention) durante el entrenamiento y la inferencia, y requiere que esta configuración se mantenga en tiempo de ejecución para no evaluar fuera de distribución. La innovación principal es la combinación de causal forcing con destilación de consistencia y DMD, que reduce drásticamente el número de pasos de muestreo necesarios para generar video realista.

## Capacidades

- Generación de video condicionada por acciones del usuario (teclado, ratón, gamepad).
- Modelo de mundo interactivo para entornos de juego: Minecraft y un FPS (línea separada).
- Inferencia en pocos pasos: 1, 2 o 4 pasos de muestreo, lo que permite tiempos de generación cercanos a tiempo real.
- Soporte para control de agentes mediante acciones discretas (4-D dual-stick, 6 botones en el FPS).
- No es un modelo de lenguaje: no ofrece generación de texto, tool calling ni funciones de agente conversacional.
- Capacidad de generar secuencias de video coherentes con la física y la dinámica del entorno simulado.

## Casos de uso

- Entrenamiento de agentes de refuerzo: el modelo puede servir como simulador interactivo para entrenar políticas de control en Minecraft, generando observaciones de video condicionadas a las acciones del agente, lo que reduce la necesidad de entornos reales costosos.
- Prototipado rápido de juegos: los diseñadores pueden usar ForgeWM para generar vídeos de jugabilidad a partir de entradas de control, explorando mecánicas sin implementar un motor completo.
- Generación de datos sintéticos: el modelo puede producir trayectorias de video etiquetadas con acciones, útiles para entrenar otros modelos de visión o control.
- Investigación en modelos de mundo: sirve como base reproducible para estudiar técnicas de destilación, causal forcing y generación de video condicionada por acciones.
- Aplicaciones de entretenimiento interactivo: permite crear experiencias de vídeo generativo donde el usuario controla la cámara o el personaje en tiempo real, por ejemplo en demos o instalaciones artísticas.
- Evaluación de políticas de control: al ser un modelo de mundo fiel, puede usarse para validar políticas de agentes en entornos simulados antes de desplegarlas en el mundo real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay métricas cuantitativas (como FVD, PSNR, o comparativas con otros modelos) en la model card ni en el repositorio.

## Requisitos de hardware

- No se especifican requisitos mínimos de VRAM en la documentación disponible.
- El tamaño total de los checkpoints es de 69,7 GB, lo que indica que el modelo completo requiere una GPU con al menos 48-80 GB de memoria para cargar los pesos en FP16 (estimación orientativa, no confirmada por el autor).
- El entrenamiento se realizó en 8 GPUs, según el repositorio, lo que sugiere que la inferencia en tiempo real puede requerir hardware de gama alta (por ejemplo, A100, H100 o RTX 4090 con múltiples GPUs).
- Para la inferencia se proporciona un script `inference.py` que acepta configuraciones YAML (por ejemplo, `configs/stage3_dmd.yaml`), compatible con entornos PyTorch estándar.
- No se mencionan integraciones con vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- La latencia y el throughput no están documentados; el modelo está diseñado para pocos pasos (1-4), lo que sugiere tiempos de generación de video de varios segundos por clip, dependiendo de la resolución y la GPU.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos de mundo de video en la información proporcionada. No se mencionan métricas ni comparaciones con alternativas como Genie, GameNGen o modelos de difusión de video generales.

## Limitaciones y advertencias

- El modelo está especializado en dos dominios concretos (Minecraft y un FPS) y no es un modelo de mundo generalista.
- Los checkpoints de FPS forman una línea de entrenamiento separada; no es un modelo multi-dominio.
- Para el checkpoint `stage3` (ForgeWM-4) es obligatorio usar la configuración de atención con ventana deslizante (`local_attn_size: 6`, `sink_size: 0`); ejecutarlo con atención causal completa lo evalúa fuera de distribución y degrada el rendimiento.
- No se documentan sesgos específicos, pero al entrenarse con datos de juegos concretos, puede heredar sesgos visuales o de comportamiento de esos entornos.
- Existe riesgo de alucinación visual (artefactos, inconsistencias) en escenarios no vistos durante el entrenamiento, aunque no se cuantifica.
- La licencia Apache-2.0 permite uso comercial, pero no se ofrecen garantías sobre el rendimiento en producción.
- No se proporcionan métricas de robustez ni evaluaciones de seguridad para el modelo.

## Enlaces

- HuggingFace: https://huggingface.co/ForgeWM/ForgeWM
- Paper: https://arxiv.org/abs/2608.14022
- Página del proyecto: https://asdfo123.github.io/ForgeWM
- Código: https://github.com/asdfo123/ForgeWM
- Dataset de entrenamiento: https://huggingface.co/datasets/ForgeWM/ForgeWM-data
