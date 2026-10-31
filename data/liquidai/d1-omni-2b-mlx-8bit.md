# LiquidAI/d1-Omni-2B-MLX-8bit

## Resumen

d1-Omni-2B-MLX-8bit es la versión cuantizada a 8 bits para MLX (Apple Silicon) de d1-Omni-2B, un modelo de decisión multimodal desarrollado por Liquid AI. A diferencia de un LLM generativo convencional, d1 no genera tokens de texto: responde preguntas con nombre y tipo sobre un estado (texto, imagen, vídeo o audio) devolviendo probabilidades calibradas en una sola pasada hacia adelante (forward pass). Esto lo posiciona en la categoría de modelos "system-one" o de decisión, orientados a clasificación, calibración y puntuación en tiempo real en el borde (edge).

El modelo base, d1-Omni-2B, pertenece a la familia LFM3 de Liquid AI y funciona como pipeline audio-text-to-text: acepta preguntas escritas o habladas y estados en forma de texto, imágenes, vídeo o audio. La versión MLX 8-bit cuantiza el modelo de lenguaje con cuantización afín de 8 bits en grupos de 64, mientras que la torre de visión, el codificador de audio, los proyectores y las normas se mantienen en FP16. Según la model card, frente al checkpoint original en float32 conserva las 59 respuestas del conjunto de prueba y las probabilidades se desplazan como máximo 0,008.

Su relevancia actual radica en la creciente necesidad de clasificadores multimodales calibrados, rápidos y ligeros para despliegues en dispositivos Apple Silicon: con unos 2.167 millones de parámetros y 2,71 GB de pesos, cabe en portátiles y equipos de escritorio de Apple sin GPU dedicada, y evita la latencia y el coste de la generación autorregresiva de tokens.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de decisión multimodal (system-one) sobre la familia LFM3 de Liquid AI; no disponible el detalle exacto de la arquitectura subyacente en esta ficha |
| Parametros totales | 2.166.928.384 (dato real de safetensors) |
| Parametros activos | No aplicable (no es MoE); no disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | 8-bit afín, grupos de 64 (LM); FP16 para torre de visión, codificador de audio, proyectores y normas |
| Idiomas soportados | en, ar, zh, fr, de, it, ja, ko, pt, es, vi, th, id, hi, ru, pl (16 idiomas) |
| Licencia | lfm1.0 (licencia propia "other" de Liquid AI) |
| Formato de pesos | safetensors (MLX 8-bit), 2,71 GB de pesos |

## Arquitectura y entrenamiento

d1-Omni-2B es un modelo de decisión multimodal: en lugar de decodificar texto token a token, ejecuta una única pasada hacia adelante y devuelve, para cada pregunta definida por el usuario, una respuesta con nombre y tipo junto con probabilidades calibradas. Los tipos de pregunta documentados en la model card incluyen: binaria calibrada ("noul"), elección única ("choice", con criterios nombrados), elección múltiple ("multiple"), puntuación en escala ("score"), número con rango y paso ("number") y caja delimitadora normalizada ("box") para localización en imágenes. Esto permite responder varias preguntas sobre el mismo estado en una sola pasada mediante `model.system_one`, y procesar lotes con `model.system_one_batch`.

El modelo integra un modelo de lenguaje (cuantizado a 8 bits en esta variante), una torre de visión, un codificador de audio y proyectores que conectan las modalidades, lo que le permite atender estados compuestos por texto, imágenes, vídeo y audio, y preguntas escritas o habladas. Los detalles sobre el número de tokens de preentrenamiento, la composición del dataset y el uso de RLHF/DPO no están disponibles en la información proporcionada; remiten a la model card del modelo original d1-Omni-2B. La cuantización MLX 8-bit afín con grupos de 64 mantiene la torre de visión, el codificador de audio, los proyectores y las normas en FP16, y ha sido validada: conserva las 59 respuestas del test y las probabilidades varían como máximo 0,008 respecto al checkpoint en float32.

## Capacidades

- Respuesta a preguntas con nombre y tipo sobre un estado, con probabilidades calibradas, en una sola pasada sin generación de tokens.
- Clasificación binaria calibrada ("noul"), por ejemplo "¿el cliente pide un reembolso?" con una probabilidad asociada.
- Clasificación de elección única y múltiple con criterios definidos por el usuario (enrutado a equipos, etiquetado de temas).
- Puntuación en escalas definidas ("score" con leyenda low/medium/high) y valores numéricos con rango y paso ("number").
- Localización espacial en imágenes mediante cajas delimitadoras normalizadas ("box").
- Comprensión multimodal: texto, imágenes, vídeo y audio como estado de entrada.
- Entrada de preguntas escritas o habladas (pipeline audio-text-to-text).
- Respuesta por lotes mediante `model.system_one_batch` para procesar varias peticiones.
- Soporte multilingüe en 16 idiomas, incluido el castellano.
- Salida estructurada en JSON desde la línea de comandos (`python -m mlx_vlm decide`).

No hay evidencia en la documentación de capacidades de generación de texto libre, razonamiento multi-paso, tool calling ni agentes: el modelo está diseñado específicamente para decisión y clasificación, no para generación.

## Casos de uso

- Clasificación y enrutado de tickets de soporte: se definen preguntas tipadas sobre el mensaje del cliente (equipo responsable, temas tratados, urgencia) y el modelo devuelve todas las respuestas en una pasada, como muestra el ejemplo de la model card con billing/shipping/technical.
- Detección de intención calibrada: la pregunta binaria "noul" devuelve una probabilidad (por ejemplo 0,94 para "¿pide reembolso?"), útil para automatizar decisiones con umbrales de confianza en lugar de parsear texto generado.
- Análisis de imágenes para automatización: conteo de objetos ("¿cuántos gatos hay?") y localización de elementos mediante cajas delimitadoras normalizadas, aplicable a control de calidad visual o indexación de catálogos.
- Vigilancia acústica: detección de eventos en audio (número de pitidos, presencia de voz) sobre clips de 16 kHz mono, útil para monitorización de dispositivos o salas.
- Moderación y triaje de contenido multilingüe: clasificación de mensajes en 16 idiomas, incluido castellano, árabe y chino, sin necesidad de un modelo generativo por idioma.
- Inferencia en el borde en Apple Silicon: con 2,71 GB de pesos y ejecución vía MLX, es adecuado para apps locales de Mac que necesiten clasificación multimodal con baja latencia y sin conexión a la nube.
- Procesado por lotes de grandes volúmenes: `system_one_batch` permite clasificar miles de documentos, imágenes o clips de forma eficiente al evitar la decodificación autorregresiva.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El único dato de validación cuantitativo es propio de la cuantización: frente al checkpoint original en float32, la versión MLX 8-bit mantiene las 59 respuestas del conjunto de prueba y las probabilidades se desplazan como máximo 0,008.

## Requisitos de hardware

- VRAM/memoria unificada estimada: los pesos ocupan 2,71 GB; con overhead de activaciones y KV, un margen razonable es de 4-6 GB de memoria unificada. Cifra exacta no disponible.
- GPU recomendadas: está diseñado para Apple Silicon (MLX); funciona en Mac con chip M1 o superior. No hay datos de soporte para CUDA u otras plataformas en esta variante.
- Consumer hardware: sí, cabe en prácticamente cualquier Mac con Apple Silicon; no requiere GPU dedicada.
- Despliegue: mediante MLX-VLM (`mlx_vlm.load`), con soporte en progreso según la model card; también interfaz de línea de comandos `python -m mlx_vlm decide`. No hay datos sobre vLLM, llama.cpp, Ollama o TGI para esta variante.
- Latencia y throughput: no disponibles con cifras concretas; el diseño "one forward pass, sin generar tokens" sugiere latencias bajas frente a LLM generativos, pero no se publican mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Modalidades | Salida | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| d1-Omni-2B-MLX-8bit | 2.167 M | Texto, imagen, vídeo, audio | Probabilidades calibradas, sin generación | lfm1.0 | HuggingFace (MLX, Apple Silicon) |
| d1-Omni-2B (base) | 2.167 M | Texto, imagen, vídeo, audio | Probabilidades calibradas, sin generación | lfm1.0 | HuggingFace (checkpoint original, float32/FP16) |
| LFM3-1.7B (Liquid AI) | No disponible en esta ficha | No disponible | Generación de texto | No disponible | HuggingFace, API y playground de Liquid AI |

No existen alternativas directamente comparables con datos públicos suficientes en la información disponible: los modelos de decisión multimodal calibrada sin generación de tokens son una categoría emergente. Como referencia indirecta, un modelo generativo de tamaño similar (2-3B) dedicado a clasificación requeriría decodificar tokens y calibrar salidas por ingeniería de prompt, con mayor latencia y menor garantía de calibración.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto libre, no razona en múltiples pasos y no soporta tool calling ni agentes; está limitado a los tipos de pregunta definidos (noul, choice, score, number, box).
- La calibración de probabilidades está validada por el autor frente a un test de 59 respuestas; no hay benchmarks públicos independientes de exactitud ni de calibración.
- Los detalles de sesgos, datos de entrenamiento y cobertura por idioma no están disponibles en la información proporcionada; el rendimiento en castellano no está cuantificado.
- La longitud de contexto no está documentada en esta ficha; revisar la model card del modelo base antes de procesar estados largos (vídeo, documentos extensos).
- Licencia lfm1.0: es una licencia propia ("other") de Liquid AI; revisar sus términos antes de cualquier uso comercial, ya que puede incluir restricciones.
- El soporte en MLX-VLM está "en progreso" según la model card: la API puede cambiar con las próximas versiones de la librería.
- La cuantización a 8 bits introduce desplazamientos de hasta 0,008 en las probabilidades; en aplicaciones con umbrales de decisión muy ajustados, validar contra el modelo base.

## Enlaces

- Modelo MLX 8-bit: https://huggingface.co/LiquidAI/d1-Omni-2B-MLX-8bit
- Modelo base d1-Omni-2B: https://huggingface.co/LiquidAI/d1-Omni-2B
- MLX-VLM (soporte en progreso): https://github.com/Blaizzy/mlx-vlm
- Documentación de Liquid AI: https://docs.liquid.ai/lfm/getting-started/welcome
- Blog de LFM3: https://www.liquid.ai/blog/lfm3
- Playground de Liquid AI: https://playground.liquid.ai/
- Consola/API de Liquid AI: https://console.liquid.ai/dashboard
- Licencia: https://huggingface.co/LiquidAI/d1-Omni-2B-MLX-8bit/blob/main/LICENSE
