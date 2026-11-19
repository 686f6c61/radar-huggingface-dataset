# Renedffd/HY-Motion-1.0

## Resumen

HY-Motion 1.0 es una familia de modelos de generación de movimiento humano 3D a partir de texto desarrollada por Tencent Hunyuan. Convierte indicaciones textuales en animaciones de personajes basadas en esqueleto, listas para integrarse en pipelines de animación 3D. La serie está formada por dos variantes: HY-Motion-1.0 (1.000 millones de parámetros) y HY-Motion-1.0-Lite (460 millones), lo que la convierte, según sus autores, en la primera familia de modelos DiT de text-to-motion escalada al nivel de los mil millones de parámetros.

La arquitectura combina un Diffusion Transformer (DiT) con Flow Matching, un enfoque generativo que modela la transformación entre ruido y movimiento mediante flujos continuos. El entrenamiento se realizó en tres etapas: preentrenamiento a gran escala con más de 3.000 horas de movimiento, ajuste fino sobre 400 horas de datos curados de alta calidad y una fase final de aprendizaje por refuerzo con retroalimentación humana y modelos de recompensa.

El modelo es relevante porque eleva el listón de los modelos abiertos de text-to-motion en cuanto a seguimiento de instrucciones y calidad del movimiento, y porque su licencia comunitaria de Tencent permite integrarlo en herramientas de animación, videojuegos y previsualización. El repositorio ocupa 6,0 GB y soporta indicaciones en inglés y chino.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Transformer (DiT) con Flow Matching |
| Parametros totales | 1.0B (HY-Motion-1.0) / 0.46B (HY-Motion-1.0-Lite) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (longitud de movimiento inferior a 5 s en modo de bajo VRAM) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, zh |
| Licencia | tencent-hunyuan-community (other) |
| Formato de pesos | safetensors (repositorio de 6,0 GB; pesos descargables en el árbol del repo) |

## Arquitectura y entrenamiento

El modelo se basa en un Diffusion Transformer que genera movimiento humano 3D mediante Flow Matching, en lugar de la difusión clásica con schedule de ruido. La salida es una animación de esqueleto (skeleton-based) que puede integrarse directamente en pipelines de animación 3D. La serie escala esta arquitectura al rango de los mil millones de parámetros, lo que según los autores mejora de forma notable la comprensión y el seguimiento de instrucciones frente a modelos abiertos comparables.

El entrenamiento se estructuró en tres fases. Primero, un preentrenamiento a gran escala con más de 3.000 horas de datos de movimiento diversos para aprender un prior amplio del movimiento. Segundo, un ajuste fino sobre 400 horas de datos 3D curados de alta calidad para mejorar el detalle y la suavidad. Tercero, una fase de aprendizaje por refuerzo con retroalimentación humana (RLHF) y modelos de recompensa para refinar el seguimiento de instrucciones y la naturalidad del movimiento. El pipeline incluye además módulos opcionales de estimación de duración y reescritura de prompts basados en LLM, que pueden desactivarse con las banderas `--disable_duration_est` y `--disable_rewrite`.

## Capacidades

- Generación de movimiento humano 3D a partir de texto (text-to-motion) con salida basada en esqueleto.
- Seguimiento de instrucciones mejorado gracias al escalado a mil millones de parámetros.
- Generación de animaciones de personaje integrables en pipelines de animación 3D.
- Soporte multilingüe de prompts en inglés y chino.
- Estimación automática de duración del movimiento mediante un módulo LLM opcional.
- Reescritura y enriquecimiento de prompts mediante un módulo LLM opcional.
- Inferencia por lotes mediante CLI (`local_infer.py`) para procesar grandes volúmenes de prompts.
- Interfaz Gradio para uso interactivo.
- Compatibilidad con macOS, Windows y Linux.

## Casos de uso

- Previsualización de animaciones en producción de videojuegos: a partir de descripciones textuales se generan movimientos de esqueleto preliminares que los animadores pueden revisar y refinar antes de la captura definitiva, reduciendo el tiempo de prototipado.
- Generación de animaciones para cinemáticas y cortometrajes: el modelo produce movimientos de personaje directamente desde guiones textuales, lo que permite iterar sobre secuencias de acción sin depender de captura de movimiento.
- Herramientas de creación de contenido para artistas sin experiencia en animación: la interfaz Gradio y el CLI permiten generar movimientos describiéndolos en lenguaje natural en inglés o chino.
- Población de escenas 3D con personajes animados: en entornos de realidad virtual o simulaciones, el modelo puede generar movimientos variados para múltiples personajes a partir de prompts, usando el modo de inferencia por lotes.
- Automatización de pipelines de animación: la integración mediante CLI permite encadenar la generación de movimiento con herramientas de renderizado o motores de juego en flujos de CI/CD.
- Investigación en generación de movimiento: la disponibilidad de pesos y del informe técnico permite reproducir y comparar resultados en tareas de text-to-motion.
- Generación de datos sintéticos de movimiento para entrenar otros modelos o para aumentar datasets de animación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM mínima indicada por el autor: 26 GB para HY-Motion-1.0 y 24 GB para HY-Motion-1.0-Lite.
- Para reducir la VRAM se recomienda usar `--num_seeds=1`, prompts de menos de 30 palabras y movimientos de menos de 5 segundos.
- GPU recomendadas: no disponible de forma explícita; por la VRAM requerida, encajan GPU de 24-26 GB o superiores (por ejemplo, RTX 4090 de 24 GB en el límite, A100 o H100 para holgura).
- No cabe en GPU de consumo con menos de 24 GB de VRAM.
- Opciones de despliegue: CLI (`local_infer.py`), interfaz Gradio y descarga de pesos mediante git-lfs; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| HY-Motion-1.0 | 1.0B | no disponible | SOTA según el autor en seguimiento de instrucciones y calidad de movimiento | tencent-hunyuan-community | Hugging Face, GitHub, demo |
| HY-Motion-1.0-Lite | 0.46B | no disponible | no disponible | tencent-hunyuan-community | Hugging Face, GitHub, demo |
| Otros modelos abiertos de text-to-motion | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones de modelos alternativos en la información proporcionada para establecer una comparación cuantitativa.

## Limitaciones y advertencias

- Licencia comunitaria de Tencent (tencent-hunyuan-community), no licencia abierta estándar; es necesario revisar sus términos antes de un uso comercial.
- El acceso al modelo está sujeto a un gate con restricción explícita para la UE (`extra_gated_eu_disallowed: true`), lo que puede impedir su uso en ese territorio.
- Solo soporta prompts en inglés y chino; no hay soporte documentado para otros idiomas.
- Requiere VRAM elevada (24-26 GB) incluso en la variante Lite, lo que limita el despliegue en hardware de consumo.
- Riesgo de alucinación o de movimientos físicamente implausibles: no se documentan métricas de naturalidad en la información disponible.
- Sesgos conocidos: no disponible.
- Los módulos de estimación de duración y reescritura de prompts dependen de un LLM externo opcional, lo que añade dependencias al pipeline.
- La información pública no detalla el formato exacto de los pesos ni opciones de cuantización.

## Enlaces

- Hugging Face (repo espejo): https://huggingface.co/Renedffd/HY-Motion-1.0
- Hugging Face (repo oficial): https://huggingface.co/tencent/HY-Motion-1.0
- Repositorio GitHub: https://github.com/Tencent-Hunyuan/HY-Motion-1.0
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/tencent/HY-Motion-1.0
- Sitio oficial: https://hunyuan.tencent.com/motion
- Informe técnico (arXiv): https://arxiv.org/pdf/2512.23464
- Licencia: https://huggingface.co/tencent/HY-Motion-1.0/blob/main/LICENSE.txt
- X (Twitter) de Tencent Hunyuan: https://x.com/TencentHunyuan
