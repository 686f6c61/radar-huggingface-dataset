# LiquidAI/d1-Omni-2B-MLX-fp16

## Resumen

d1-Omni-2B-MLX-fp16 es la versión en formato MLX y precisión FP16 del modelo d1-Omni-2B de Liquid AI, optimizada para ejecutarse en hardware Apple Silicon. Se trata de un modelo de decisión (decision model) multimodal que acepta texto, imágenes, vídeo y audio, y responde preguntas con nombre y tipo sobre un estado de entrada, devolviendo probabilidades calibradas en una sola pasada hacia delante, sin generar tokens. Esto lo diferencia de los LLM generativos tradicionales: en lugar de redactar texto libre, produce salidas estructuradas y tipadas (booleanas, de elección, numéricas, de puntuación o de localización).

El modelo aborda el problema de la clasificación y calibración en el borde (edge): tareas como enrutar tickets de soporte, detectar contenido en imágenes o contar eventos en audio se resuelven de forma determinista y eficiente, sin el coste y la variabilidad de la decodificación autorregresiva. Con unos 2.167 millones de parámetros y pesos de 4,33 GB, es adecuado para dispositivos de consumo.

La variante MLX en FP16 es la precisión recomendada por Liquid AI, ya que se mantiene más próxima al checkpoint original ejecutado en float32; no existe exportación en BF16. El soporte en MLX-VLM está en desarrollo y la model card se actualizará cuando una versión lo incorpore.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de decisión multimodal (audio-text-to-text), familia LFM3 de Liquid AI; detalles completos en la model card del modelo base |
| Parametros totales | 2.166.928.384 (dato real de safetensors) |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP16 (precisión recomendada; no hay exportación BF16) |
| Idiomas soportados | en, ar, zh, fr, de, it, ja, ko, pt, es, vi, th, id, hi, ru, pl (16 idiomas) |
| Licencia | LFM 1.0 (licencia "other", consulta el enlace LICENSE para los términos) |
| Formato de pesos | safetensors (formato MLX) |

## Arquitectura y entrenamiento

d1-Omni-2B es un modelo de decisión de la familia LFM3 (Liquid Foundation Models) de Liquid AI. A diferencia de un LLM generativo, no produce texto token a token: ejecuta una única pasada hacia delante sobre el estado de entrada y devuelve respuestas con nombre y tipo, con probabilidades calibradas. El enfoque se etiqueta en la model card como "system-one", en referencia a la toma de decisiones rápida e intuitiva, en contraposición al razonamiento lento y multi-paso.

El modelo es omnimodal: acepta texto escrito o hablado, imágenes, vídeo y audio como estado de entrada. Entre los tipos de pregunta soportados se encuentran: booleana con probabilidad ("noul"), elección simple o múltiple con criterios ("choice"), puntuación sobre una escala ("score"), número con rango y paso ("number") y caja de localización con coordenadas normalizadas ("box"). Se pueden formular varias preguntas con nombre sobre el mismo estado y responderlas todas en una sola pasada, lo que multiplica la eficiencia frente a invocaciones generativas separadas.

No se ha publicado información sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO en la model card de esta variante; remítase a la model card del modelo base para los detalles de arquitectura y entrenamiento.

## Capacidades

- Respuesta de preguntas nombradas y tipadas sobre un estado, con probabilidades calibradas, en una sola pasada sin generación de tokens.
- Clasificación binaria con probabilidad (tipo "noul"), por ejemplo detectar si un cliente pide un reembolso.
- Clasificación de elección simple o múltiple con criterios definidos por el usuario (tipo "choice").
- Puntuación sobre escalas definidas (tipo "score"), por ejemplo urgencia baja/media/alta.
- Conteo numérico con rango y paso configurables (tipo "number"), aplicable a imágenes y audio.
- Localización espacial en imágenes mediante cajas delimitadoras con coordenadas normalizadas (tipo "box").
- Comprensión multimodal: texto, imágenes, vídeo y audio (audio a 16 kHz mono en el ejemplo documentado).
- Entrada de preguntas escritas o habladas (audio-text-to-text).
- Procesamiento por lotes de varias peticiones mediante `model.system_one_batch`.
- Salida estructurada en JSON desde la línea de comandos.
- Soporte multilingüe en 16 idiomas, incluido el castellano.
- Los tags no indican soporte de tool calling, function calling ni capacidades de agente; no disponible.

## Casos de uso

- Enrutamiento de tickets de soporte: el modelo clasifica un mensaje de cliente en una sola pasada, asignando equipo (facturación, envíos, técnico), temas múltiples y nivel de urgencia, con probabilidades calibradas que permiten definir umbrales de confianza y escalar a humanos cuando la certeza es baja.
- Moderación y filtrado de contenido: clasificación binaria con probabilidad ("noul") para detectar si un texto, imagen o clip de audio incumple una política, evitando el coste de generar explicaciones en tiempo real.
- Análisis de imágenes en el borde: conteo de objetos (tipo "number") y localización de elementos mediante cajas delimitadoras (tipo "box"), útil en automatización industrial, retail o robótica ligera sobre Apple Silicon.
- Detección de eventos en audio: conteo de sonidos (pitidos, alarmas) y detección de presencia de voz en grabaciones a 16 kHz, aplicable a monitorización de llamadas o dispositivos IoT.
- Procesado masivo de datos con calibración: al responder varias preguntas sobre el mismo estado en una pasada y soportar lotes (`system_one_batch`), es adecuado para pipelines de etiquetado y enriquecimiento de grandes volúmenes de datos con coste predecible.
- Interfaces de voz multimodales: al aceptar preguntas habladas y estados en audio, puede integrarse en asistentes que clasifican la intención del usuario sin depender de generación de texto.
- Priorización de incidencias: asignación de puntuaciones de urgencia sobre escalas definidas para ordenar colas de trabajo de forma automática.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Los pesos en FP16 ocupan 4,33 GB; para inferencia se recomienda disponer de al menos esa cantidad de memoria unificada libre, más margen para activaciones y procesado de medios (no disponible una cifra exacta).
- Diseñado para Apple Silicon mediante el framework MLX; funcionará en equipos Mac con chips M1/M2/M3/M4 que dispongan de suficiente memoria unificada (un Mac con 8 GB o más de RAM debería ser suficiente para los pesos, aunque no se especifica oficialmente).
- No se trata de un modelo CUDA: no está pensado para RTX 4090, A100 ni H100; la variante de referencia para otros entornos es el modelo base LiquidAI/d1-Omni-2B.
- Despliegue: mediante MLX-VLM en Python (`from mlx_vlm import load`) o desde la línea de comandos con `python -m mlx_vlm decide`, con salida JSON. El soporte en MLX-VLM está en progreso y la model card se actualizará cuando una versión lo soporte oficialmente.
- No hay datos publicados de latencia o throughput; al responder sin generar tokens en una sola pasada, el modelo está orientado a baja latencia, pero no disponible una cifra concreta.

## Comparativa con modelos similares

| Modelo | Parametros | Modalidades | Paradigma | Licencia | Formato |
|---|---|---|---|---|---|
| d1-Omni-2B-MLX-fp16 (Liquid AI) | 2,17 B | Texto, imagen, vídeo, audio | Decision model, salida tipada sin generación | LFM 1.0 | MLX safetensors FP16 |
| LFM3-1.7B (Liquid AI) | no disponible en esta ficha | Texto | LLM generativo | no disponible | no disponible |
| Qwen2.5-Omni-3B (Alibaba) | 3 B | Texto, imagen, audio, vídeo | LLM generativo omnimodal | Apache 2.0 (según repositorio oficial) | safetensors, GGUF |

Nota: no existen muchos comparables directos, ya que d1-Omni-2B pertenece a la categoría emergente de modelos de decisión con salida tipada y probabilidades calibradas, distinta de los LLM generativos omnimodales. La comparativa anterior es orientativa; los datos de rendimiento no están disponibles.

## Limitaciones y advertencias

- El soporte en MLX-VLM está todavía en desarrollo: la model card indica que se actualizará cuando una versión de MLX-VLM lo soporte, por lo que la integración puede no ser estable en producción.
- No es un modelo generativo: no redacta texto libre ni explica sus respuestas; si necesitas razonamiento en lenguaje natural, este no es el modelo adecuado.
- La licencia LFM 1.0 es una licencia personalizada ("other"): revisa sus términos antes de cualquier uso comercial, ya que pueden existir restricciones.
- No se publican datos de sesgos, tasas de alucinación ni benchmarks en la model card de esta variante; al tratarse de un modelo de decisión con probabilidades calibradas, el riesgo de alucinación se reduce pero no desaparece, y las probabilidades deben validarse en tu dominio antes de confiar en umbrales fijos.
- El audio de ejemplo se documenta a 16 kHz mono; otros formatos pueden requerir preprocesado.
- Al ser una variante FP16 específica de MLX, no es utilizable directamente con vLLM, llama.cpp, TGI u Ollama; para esos entornos consulta el modelo base.
- No hay información publicada sobre longitud de contexto máxima, lo que puede limitar el tamaño de los estados procesables.

## Enlaces

- Modelo MLX: https://huggingface.co/LiquidAI/d1-Omni-2B-MLX-fp16
- Modelo base: https://huggingface.co/LiquidAI/d1-Omni-2B
- MLX-VLM (soporte en progreso): https://github.com/Blaizzy/mlx-vlm
- API de Liquid AI: https://console.liquid.ai/dashboard
- Playground: https://playground.liquid.ai/
- Documentación: https://docs.liquid.ai/lfm/getting-started/welcome
- Blog de LFM3: https://www.liquid.ai/blog/lfm3
- Licencia: https://huggingface.co/LiquidAI/d1-Omni-2B-MLX-fp16/blob/main/LICENSE
