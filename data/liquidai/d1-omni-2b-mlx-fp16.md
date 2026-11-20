# LiquidAI/d1-Omni-2B-MLX-fp16

## Resumen

d1-Omni-2B es un modelo de decisión multimodal desarrollado por LiquidAI, diseñado para responder preguntas con nombre y tipo sobre un estado (texto, imagen, vídeo o audio) devolviendo probabilidades calibradas en un único pase forward, sin generar tokens. Se trata de una aproximación de "system-one" al razonamiento: en lugar de producir una cadena de texto, el modelo clasifica, puntúa o elige entre criterios definidos por el usuario, lo que reduce latencia y coste computacional frente a modelos generativos de tamaño comparable.

El modelo pertenece a la familia LFM3 de LiquidAI y cuenta con 2.166.928.384 parámetros totales (aproximadamente 2,17 mil millones), lo que lo sitúa en el segmento edge. Es multimodal: procesa texto, imágenes, vídeo y audio, y acepta preguntas tanto escritas como habladas. Esta versión concreta, d1-Omni-2B-MLX-fp16, es una conversión a formato MLX en precisión FP16 para Apple Silicon, con pesos que ocupan 4,33 GB en disco (4,4 GB de repositorio).

La relevancia actual del modelo radica en su enfoque: frente a la tendencia general de modelos generativos cada vez más grandes, d1-Omni-2B apuesta por la eficiencia en tareas de decisión y clasificación calibrada, un nicho relevante para enrutamiento de tickets, moderación, triaje y sistemas de agentes que necesitan señales probabilísticas fiables en lugar de texto libre.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | lfm3_omni (modelo de decisión multimodal, sin generación autorregresiva de tokens) |
| Parametros totales | 2.166.928.384 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP16 (esta versión MLX); no se detallan otras cuantizaciones en la información disponible |
| Idiomas soportados | en, ar, zh, fr, de, it, ja, ko, pt, es, vi, th, id, hi, ru, pl |
| Licencia | lfm1.0 (licencia "other" en Hugging Face) |
| Formato de pesos | safetensors (MLX, FP16) |

## Arquitectura y entrenamiento

La arquitectura se etiqueta como `lfm3_omni` dentro de la familia LFM3 de LiquidAI. El modelo está diseñado como un decisor multimodal: recibe un estado (texto, imagen, vídeo o audio) y un conjunto de preguntas tipadas con nombre, y devuelve respuestas con probabilidades calibradas en un solo pase forward, sin decodificación autorregresiva. Los tipos de pregunta observados en la documentación incluyen `noul` (sí/no con probabilidad), `choice` (selección entre criterios, con soporte de selección múltiple) y `score` (puntuación sobre una escala definida por el usuario). La conversión MLX mantiene FP16 como precisión recomendada, al ser la más cercana al checkpoint original en float32; el autor indica explícitamente que no hay exportación BF16.

No se dispone en la información proporcionada de detalles sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO u otras etapas de alineación. Tampoco se documentan innovaciones como decodificación especulativa o atención lineal más allá de la etiqueta de arquitectura. Las etiquetas del repositorio (`decision`, `classification`, `calibration`, `system-one`) confirman el enfoque de decisión calibrada como rasgo central del diseño.

## Capacidades

- Decisión multimodal sobre texto, imagen, vídeo y audio en un único pase forward, sin generación de tokens.
- Preguntas tipadas: `noul` (probabilidad de sí/no), `choice` (selección entre criterios, con opción múltiple) y `score` (puntuación sobre una escala definida).
- Respuestas con probabilidades calibradas, adecuadas para umbrales y enrutamiento automático.
- Entrada de preguntas en formato escrito o hablado (audio-text-to-text como pipeline principal).
- Procesamiento de imágenes como estado completo (visión) y de audio.
- Soporte multilingüe en 16 idiomas, incluido el español.
- Integración con MLX-VLM 0.7.11 o superior en Apple Silicon mediante `model.system_one`.
- No soporta chat conversacional ni `mlx_vlm.generate`, al no generar texto.

## Casos de uso

- Enrutamiento de tickets de soporte: el modelo recibe el texto del ticket y devuelve la probabilidad de que sea una solicitud de reembolso, la elección de equipo (facturación, envío, técnico) y una puntuación de urgencia en un solo pase, tal como muestra el ejemplo de la model card.
- Triaje de correo o mensajes entrantes: clasificación multi-etiqueta de temas (facturación, entrega, inicio de sesión) con probabilidades calibradas para priorizar la cola de atención.
- Moderación de contenido: preguntas de sí/no calibradas sobre si un texto o audio infringe una política, con umbral configurable según la tolerancia al falso positivo.
- Análisis de imágenes en producción: usar la foto como estado completo para decidir si una imagen cumple un criterio (por ejemplo, presencia de un objeto o defecto visual) sin generar descripciones.
- Procesamiento de audio en atención al cliente: preguntas habladas o sobre audio de llamadas para detectar intención, urgencia o solicitud de cancelación en un solo pase.
- Señal de decisión para agentes: integrar el modelo como componente de enrutamiento o validación dentro de un pipeline de agentes, aprovechando sus probabilidades calibradas para decidir el siguiente paso sin coste de generación.
- Clasificación en el dispositivo (edge): despliegue en Apple Silicon con MLX para tareas de decisión locales con 4,33 GB de pesos en FP16.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Pesos en FP16: 4,33 GB en disco (repositorio de 4,4 GB); la VRAM/unified memory necesaria para inferencia será algo superior a esa cifra por estados intermedios y buffers.
- Hardware objetivo: Apple Silicon mediante MLX y MLX-VLM 0.7.11 o superior.
- No se documenta soporte para CUDA, vLLM, llama.cpp, Ollama o TGI en la información disponible; el formato es específico de MLX.
- Al ser un modelo de 2,17 mil millones de parámetros en FP16, es plausible que quepa en equipos Apple Silicon con memoria unificada de 8 GB o más, aunque el autor no especifica requisitos mínimos exactos.
- Latencia y throughput: no disponibles; el diseño de un solo pase forward sin generación de tokens sugiere menor coste que modelos generativos equivalentes, pero no se aportan cifras.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la información proporcionada. La propuesta de d1-Omni-2B (decisión multimodal calibrada sin generación) no tiene una correspondencia directa documentada entre los modelos de referencia habituales, por lo que la comparación cuantitativa no está disponible.

| Modelo | Parametros | Contexto | Modalidades | Licencia | Formato |
|---|---|---|---|---|---|
| d1-Omni-2B-MLX-fp16 | 2,17 B | no disponible | texto, imagen, vídeo, audio | lfm1.0 | MLX safetensors FP16 |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El modelo no genera texto: no puede usarse en aplicaciones de chat ni con `mlx_vlm.generate`; requiere el flujo `model.system_one` o el comando `decide`.
- Solo está disponible en formato MLX para Apple Silicon; no hay pesos GGUF, safetensors estándar para CUDA ni integraciones con vLLM, llama.cpp u Ollama documentadas.
- La licencia lfm1.0 es una licencia "other"; es necesario revisar sus términos antes de un uso comercial, ya que puede incluir restricciones específicas.
- No se documentan sesgos conocidos, tasas de alucinación ni límites de contexto; al tratarse de un clasificador calibrado, el riesgo principal es la calibración deficiente fuera de la distribución de entrenamiento, no la alucinación de texto.
- La cobertura lingüística es amplia (16 idiomas) pero no se detalla el rendimiento por idioma; el español figura entre los soportados sin métricas publicadas.
- No se especifican requisitos mínimos de memoria ni límites de longitud de entrada para audio, vídeo o texto.
- Al ser una conversión de cuantización de un modelo base, puede presentar diferencias menores frente al checkpoint original en float32, aunque el autor indica que FP16 es la precisión más fiel disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/LiquidAI/d1-Omni-2B-MLX-fp16
- Modelo base: https://huggingface.co/LiquidAI/d1-Omni-2B
- MLX-VLM: https://github.com/Blaizzy/mlx-vlm
- Documentación de LiquidAI: https://docs.liquid.ai/lfm/getting-started/welcome
- Blog de LFM3: https://www.liquid.ai/blog/lfm3
- Consola/API de LiquidAI: https://console.liquid.ai/dashboard
- Playground: https://playground.liquid.ai/
- Licencia: https://huggingface.co/LiquidAI/d1-Omni-2B-MLX-fp16/blob/main/LICENSE
