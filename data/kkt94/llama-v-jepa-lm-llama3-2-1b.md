# kkt94/Llama-V-JEPA-LM-Llama3.2-1B

## Resumen

Llama-V-JEPA-LM-Llama3.2-1B es un modelo de lenguaje y vídeo desarrollado por el autor independiente kkt94, que combina un codificador visual congelado V-JEPA 2.1 (ViT-L, modelo del mundo) con el modelo de lenguaje meta-llama/Llama-3.2-1B-Instruct mediante un puente espectral que convierte cada clip de 32 fotogramas en 1.024 tokens visuales. El modelo resuelve la tarea de respuesta a preguntas sobre vídeo (video question answering) y está diseñado para leer dinámicas temporales como dirección, orden, velocidad, posición, conteo y finalización de acciones.

El entrenamiento utiliza supervisión contrafactual: transformaciones de píxeles sobre vídeos públicos generan variantes equilibradas en respuestas cuyas respuestas quedan fijadas por construcción y difieren solo en cómo cambia la escena, de modo que el modelo aprende a interpretar la dinámica que el codificador del modelo del mundo transporta. Se entrenó sobre 4,60 millones de muestras públicas y alcanza una media de 62,21 en 12 puntuaciones sobre 11 benchmarks de vídeo, por delante de los modelos abiertos de su clase de tamaño.

El modelo es relevante porque demuestra que un LM pequeño de 1B de parámetros, acoplado a un codificador de vídeo congelado basado en modelo del mundo, puede superar a modelos multimodales de 2B en tareas de comprensión temporal de vídeo, con un coste de despliegue muy contenido. La licencia es Llama 3.2 Community License y el idioma declarado es únicamente inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal: codificador de vídeo V-JEPA 2.1 (ViT-L, congelado) + puente espectral + LM Llama-3.2-1B-Instruct |
| Parametros totales | 1.548.154.880 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | llama3.2 (Llama 3.2 Community License) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es un sistema multimodal que une un codificador de vídeo V-JEPA 2.1 congelado (ViT-L) con el modelo de lenguaje Llama-3.2-1B-Instruct mediante un puente espectral. Cada clip de 32 fotogramas se proyecta en 1.024 tokens visuales que el LM consume como entrada, de modo que el módulo de lenguaje razona sobre la representación dinámica extraída por el modelo del mundo. El codificador visual permanece congelado durante el entrenamiento, y el puente espectral es el componente que aprende la alineación entre el espacio visual y el espacio del lenguaje.

El entrenamiento se basa en supervisión contrafactual: a partir de vídeos públicos se generan transformaciones de píxeles que producen variantes equilibradas en respuestas, con respuestas fijadas por construcción que difieren únicamente en cómo cambia la escena. Este esquema enseña al modelo a leer dirección, orden, posición, velocidad, conteo y finalización sin necesidad de anotación humana adicional. El conjunto de entrenamiento comprende 4,60 millones de muestras públicas. No se detalla en la información disponible si hubo RLHF o DPO, ni el número exacto de tokens de texto utilizados.

## Capacidades

- Respuesta a preguntas sobre vídeo (video question answering) en inglés.
- Comprensión de dinámicas temporales: dirección, orden, posición, velocidad, conteo y finalización de acciones.
- Razonamiento sobre cambios de estado y transformaciones de escena en clips de 32 fotogramas.
- Extracción de características (feature-extraction) y modelado de vídeo-texto.
- Capacidades de modelo del mundo a través del codificador V-JEPA 2.1.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según la model card.
- Capacidades especiales: modo de razonamiento temporal, visión de vídeo; audio no disponible.

## Casos de uso

- Moderación y análisis de contenido en vídeo: el modelo puede responder preguntas sobre lo que ocurre en un clip de 32 fotogramas, identificando dirección y orden de acciones, útil para clasificar contenido generado por usuarios.
- Indexación y búsqueda semántica de archivos audiovisuales: al convertir cada clip en 1.024 tokens visuales, permite generar descripciones y metadatos consultables sobre secuencias temporales en bibliotecas de vídeo.
- Análisis de vídeo de vigilancia y tráfico: la capacidad de leer velocidad, dirección y finalización de acciones encaja en la detección de eventos en secuencias de cámaras fijas.
- Asistencia a personas con discapacidad visual: descripción de dinámicas de escena (qué se mueve, en qué orden, a qué velocidad) en inglés, con un modelo de 1B desplegable en hardware modesto.
- Investigación en modelos del mundo y representación temporal: sirve como banco de pruebas para estudiar cómo un codificador congelado V-JEPA transfiere dinámicas al lenguaje mediante supervisión contrafactual.
- Evaluación de sistemas robóticos y de percepción: el modelo puede responder preguntas sobre secuencias de acciones y estados, útil para validar pipelines de percepción en simuladores y vídeo real.
- Prototipado rápido de asistentes de vídeo en el navegador: su tamaño de 1B permite demos interactivas en espacios con GPU compartida, como el demo ZeroGPU del autor para la variante de 8B.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados):

| Benchmark | Métrica | Valor |
|---|---|---|
| MVBench | accuracy | 66,3 |
| PerceptionTest | accuracy | 71,9 |
| TVBench | accuracy | 67,9 |
| TempCompass | accuracy | 71,6 |
| TOMATO | accuracy | 48,2 |
| MotionBench | accuracy | 49,5 |
| NExT-QA | accuracy | 70,2 |
| MVP | pair accuracy | 48,5 |
| TemporalBench (binary) | accuracy | 57,8 |
| SSv2 (multiple choice) | accuracy | 89,6 |
| Vinoground text | text pair accuracy | 51,2 |
| Vinoground video | video pair accuracy | 53,8 |

Media declarada: 62,21 en 12 puntuaciones sobre 11 benchmarks de vídeo. El autor indica que supera a Qwen3-VL-2B (52,45) en la media y en 8 de las 12 puntuaciones, y que obtiene 94,5 de media en seis conjuntos retenidos (ratios de velocidad no vistos, corpus de origen no visto, combinaciones no vistas y simulador no visto).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 1.548 millones de parámetros, en fp16 se requieren aproximadamente 3,1 GB solo para pesos, más el codificador V-JEPA ViT-L y los estados de activación.
- GPU recomendadas: no disponibles en la información proporcionada; por tamaño, una GPU consumer de gama alta (RTX 4090, 24 GB) debería alojar el modelo en fp16 con margen para el codificador y el contexto.
- Cabe en GPU consumer: previsiblemente sí en GPUs con 8-16 GB o más, aunque no hay cifras oficiales de VRAM ni de cuantizaciones soportadas.
- Opciones de despliegue: transformers (librería declarada), con código personalizado (custom_code); compatibilidad con vLLM, llama.cpp, Ollama o TGI no está confirmada en la información disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Media 12 scores (vídeo) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Llama-V-JEPA-LM-Llama3.2-1B | 1,55B | no disponible | 62,21 | Llama 3.2 Community | Hugging Face |
| Qwen3-VL-2B | ~2B | no disponible | 52,45 | no disponible en la información | Hugging Face |
| Llama-V-JEPA-LM-Llama3.1-8B | ~8B | no disponible | no disponible | Llama 3.1 | Hugging Face (demo ZeroGPU) |

El autor sitúa a Llama-V-JEPA-LM-Llama3.2-1B como el mejor modelo abierto de su clase de tamaño en 8 de las 12 puntuaciones, con ventajas destacadas en SSv2 (89,6 frente a 61,7), Vinoground video (53,8 frente a 29,6), TOMATO (48,2 frente a 31,0) y TVBench (67,9 frente a 50,9) frente a Qwen3-VL-2B. No se dispone de datos de otros modelos comparables de 1-2B en la información proporcionada.

## Limitaciones y advertencias

- Idioma: el modelo solo declara soporte de inglés; su uso en castellano u otros idiomas no está validado.
- Riesgo de alucinación: como todo LM, puede generar respuestas plausibles pero incorrectas sobre el contenido del vídeo, especialmente en clips ambiguos o con dinámicas poco representadas.
- Sesgos: entrenado sobre vídeos públicos, puede heredar sesgos de representación de los corpus de origen; no se documentan análisis de sesgo.
- Longitud de contexto: no disponible, lo que impide planificar despliegues con secuencias largas o múltiples clips encadenados.
- Licencia: sujeta a la Llama 3.2 Community License y a la Acceptable Use Policy de Meta; el uso comercial está permitido con condiciones, pero requiere revisar las restricciones de la licencia (por ejemplo, la cláusula de "Built with Llama" y los límites de uso aceptable).
- Benchmarks no verificados: todos los resultados están marcados como `verified: false` en la model card; conviene reproducirlos antes de tomar decisiones de producción.
- Dependencia de código personalizado: requiere `trust_remote_code` en transformers, lo que añade riesgo de seguridad y mantenimiento.
- Entrenamiento con datos sintéticos contrafactuales: aunque el autor reporta buena generalización a conjuntos retenidos, el rendimiento en dominios muy distintos (vídeo médico, satelital, etc.) no está documentado.
- Sin datos de cuantización ni de despliegue en servidores de inferencia de alto rendimiento, la latencia en producción es incierta.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kkt94/Llama-V-JEPA-LM-Llama3.2-1B
- Paper: https://arxiv.org/abs/2611.17831
- Código y reporte técnico: https://github.com/kkt94/Llama-V-JEPA-LM
- Demo en el navegador (variante 8B, ZeroGPU): https://huggingface.co/spaces/kkt94/llama-v-jepa-lm-8b
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-1B-Instruct
- Licencia Llama 3.2: https://www.llama.com/llama3_2/license/
- Política de uso aceptable Llama 3.2: https://www.llama.com/llama3_2/use-policy/
