# LiquidAI/d1-2B-MLX-4bit

## Resumen

d1-2B-MLX-4bit es la versión cuantizada a 4 bits (formato MLX, para Apple Silicon) de d1-2B, un modelo de decisión multimodal desarrollado por Liquid AI. A diferencia de un modelo conversacional clásico, d1-2B no genera texto: responde preguntas con nombre y tipo (binarias, de elección múltiple, numéricas, de puntuación o de localización en cajas) sobre un estado dado —texto, imagen o vídeo— devolviendo probabilidades calibradas en una sola pasada hacia delante, sin generar tokens de salida.

Esto lo sitúa en una categoría peculiar: es un "modelo de sistema uno" (system-one) orientado a edge, pensado para tareas de clasificación, enrutado y calibración donde la latencia y el coste por consulta importan más que la generación libre. Con 1.918 millones de parámetros y unos pesos de 1,35 GB en 4 bits, cabe cómodamente en portátiles Mac con chip Apple Silicon.

Su relevancia actual radica en la tendencia de ejecutar tareas de decisión estructurada (triaje de tickets, moderación, clasificación de documentos, detección visual) en local, evitando el coste y la latencia de un LLM generativo. El repo base es LiquidAI/d1-2B, y esta variante MLX-4bit forma parte de la familia LFM3 de Liquid AI.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Modelo de decisión multimodal (texto, imagen, vídeo) tipo "system-one"; familia LFM3 / liquid; no disponible detalle arquitectónico fino |
| Parametros totales | 1.918.181.888 (1,92 B) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits afín, grupos de 64 (LM); torre de visión, proyector y normas en FP16 |
| Idiomas soportados | en, ar, zh, fr, de, it, ja, ko, pt, es, vi, th, id, hi, ru, pl (16 idiomas) |
| Licencia | lfm1.0 (Liquid AI, "other") |
| Formato de pesos | safetensors (MLX), repo de 1,4 GB; pesos LM ocupan 1,35 GB |

## Arquitectura y entrenamiento

d1-2B es un modelo de decisión multimodal basado en la familia LFM3 de Liquid AI (arquitectura "liquid"). Su rasgo distintivo es que responde preguntas nombradas y tipadas sobre un estado en una única pasada hacia delante: en lugar de autoregresión token a token, emite probabilidades calibradas directamente. Esto elimina el coste de decodificación y hace que el número de tokens de salida sea cero, algo visible en el ejemplo de la model card (189 tokens de entrada, 0 de salida).

El modelo procesa tres modalidades: texto, imágenes y vídeo. La torre de visión, el proyector y las normas se mantienen en FP16 incluso en esta versión cuantizada, mientras que el modelo de lenguaje usa cuantización afín de 4 bits con grupos de 64. Sobre el proceso de entrenamiento (número de tokens, composición del dataset, RLHF/DPO) no hay datos publicados en la información disponible; la model card remite a la ficha del modelo base para detalles de arquitectura y uso.

Respecto a la cuantización, Liquid AI reporta el impacto medido frente al checkpoint original en float32: 3 de 52 respuestas de test cambiaron y las probabilidades se desplazaron hasta 0,25. Por ello recomiendan las variantes FP16 u 8 bits cuando la calibración sea crítica.

## Capacidades

- Respuesta a preguntas nombradas y tipadas sobre un estado, en una sola pasada y sin generación de tokens, con probabilidades calibradas.
- Tipos de pregunta soportados (según ejemplos de la model card):
  - `noul`: preguntas binarias con probabilidad (por ejemplo, "¿el cliente pide un reembolso?").
  - `choice`: elección entre criterios definidos, con opción de respuesta múltiple.
  - `score`: puntuación sobre una escala de criterios (bajo/medio/alto).
  - `number`: valores numéricos con rango y paso definidos.
  - `box`: localización en imagen mediante coordenadas de caja (top/bottom/left/right normalizadas).
- Entradas multimodales: texto, imágenes y vídeo como "estado" sobre el que decidir.
- Procesamiento por lotes de varias preguntas sobre el mismo estado en una pasada (`system_one`) y de varias peticiones (`system_one_batch`).
- Soporte de 16 idiomas, incluido el castellano.
- Salida estructurada en JSON desde línea de comandos o API Python.
- No es un modelo conversacional generativo: no está pensado para redactar texto libre, código ni razonamiento en cadena.

## Casos de uso

- Triaje y enrutado de tickets de soporte: clasifica cada ticket por equipo (facturación, envíos, técnico), extrae temas múltiples y asigna urgencia en una sola pasada sobre el texto, con coste mínimo por mensaje.
- Detección de intención binaria con probabilidad calibrada: por ejemplo, "¿solicita reembolso?", "¿es contenido ofensivo?", aprovechando la calibración para definir umbrales de automatización.
- Clasificación de documentos y correos en flujos RPA: etiquetado multi-etiqueta con criterios personalizados sin entrenar un clasificador específico.
- Conteo y localización visual: responder "¿cuántos gatos hay?" con rango numérico o devolver la caja delimitadora de un objeto en una foto, útil en inventario visual o moderación de imágenes.
- Moderación y seguridad de contenidos: puntuación de gravedad (bajo/medio/alto) y detección de categorías sobre texto e imagen, en local y con latencia baja.
- Análisis de vídeo en el borde: decisiones estructuradas sobre fotogramas o clips (presencia de eventos, clasificación de escenas) sin depender de la nube.
- Despliegue en Apple Silicon: con 1,35 GB de pesos, es viable en MacBook o Mac mini para procesamiento local y privado de datos sensibles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El único dato de rendimiento cuantitativo publicado es el impacto de la cuantización: frente al checkpoint original en float32, la versión 4 bits cambió 3 de 52 respuestas de test y desplazó las probabilidades hasta 0,25.

## Requisitos de hardware

- VRAM/memoria unificada estimada: los pesos ocupan 1,35 GB en 4 bits; con overhead de la torre de visión en FP16, procesador y activaciones, es razonable estimar entre 2 y 4 GB de memoria unificada para inferencia (estimación, no dato oficial).
- GPU recomendadas: está pensado para Apple Silicon (MLX); cualquier Mac con chip M1 o superior debería ejecutarlo. No hay soporte documentado para CUDA en esta variante.
- Consumer hardware: sí, cabe de sobra en portátiles Apple Silicon básicos (8 GB de RAM unificada) al ser un modelo de ~1,9 B parámetros cuantizado a 4 bits.
- Despliegue: MLX-VLM (soporte en progreso según la model card, pendiente de una release oficial); CLI incluida vía `python -m mlx_vlm decide`. No consta soporte para vLLM, llama.cpp, Ollama o TGI en esta variante.
- Latencia y throughput: no se han publicado cifras; por diseño (0 tokens de salida, una pasada hacia delante) la latencia por decisión debería ser muy inferior a la de un LLM generativo equivalente, pero no hay medidas oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Modalidad | Salida | Cuantizacion | Licencia |
|---|---|---|---|---|---|
| LiquidAI/d1-2B-MLX-4bit | 1,92 B | texto, imagen, vídeo | probabilidades calibradas tipadas, 1 pasada | 4 bits (MLX) | lfm1.0 |
| LiquidAI/d1-2B-MLX-8bit | 1,92 B | texto, imagen, vídeo | probabilidades calibradas tipadas, 1 pasada | 8 bits (MLX) | lfm1.0 |
| LiquidAI/d1-2B-MLX-fp16 | 1,92 B | texto, imagen, vídeo | probabilidades calibradas tipadas, 1 pasada | FP16 (MLX) | lfm1.0 |
| LLM generativo pequeño típico (p. ej. Qwen2.5-VL-3B) | ~3 B | texto, imagen | texto generado autoregresivamente | variable | variable |

La comparación más directa es con las variantes FP16 y 8 bits del propio d1-2B: la de 4 bits ahorra memoria y ancho de banda a costa de una ligera degradación de calibración (hasta 0,25 de desplazamiento de probabilidad). Frente a un VLM generativo pequeño, d1-2B no compite en generación de texto sino en tareas de decisión estructurada, donde evita por completo el coste de decodificación. No hay datos de benchmarks públicos que permitan comparar precisión con alternativas externas.

## Limitaciones y advertencias

- La cuantización a 4 bits degrada la calibración: 3 de 52 respuestas de test cambiaron frente a float32 y las probabilidades se movieron hasta 0,25. Si la calibración es crítica (umbrales de decisión, riesgos legales), usa las variantes FP16 u 8 bits.
- No es un modelo conversacional ni generativo: no sirve para chat, redacción de texto, código ni razonamiento en cadena.
- El soporte en MLX-VLM está en progreso y aún no ha llegado en una release estable, según la propia model card.
- La licencia lfm1.0 es una licencia personalizada ("other"); revisa sus términos antes de cualquier uso comercial, ya que pueden incluir restricciones.
- No hay benchmarks públicos independientes de precisión, por lo que la evaluación en tu dominio concreto es imprescindible antes de producción.
- Sesgos conocidos, riesgo de alucinación (aunque el diseño de salida tipada lo mitiga parcialmente) y longitud máxima de contexto: no disponibles en la información publicada.
- Esta variante MLX solo cubre Apple Silicon; para despliegues en GPU NVIDIA hay que acudir a los checkpoints originales del modelo base.

## Enlaces

- Modelo: https://huggingface.co/LiquidAI/d1-2B-MLX-4bit
- Modelo base: https://huggingface.co/LiquidAI/d1-2B
- Variante FP16: https://huggingface.co/LiquidAI/d1-2B-MLX-fp16
- Variante 8 bits: https://huggingface.co/LiquidAI/d1-2B-MLX-8bit
- MLX-VLM: https://github.com/Blaizzy/mlx-vlm
- Guía de despliegue MLX de Liquid AI: https://docs.liquid.ai/deployment/on-device/mlx
- Documentación LFM: https://docs.liquid.ai/lfm/getting-started/welcome
- Blog LFM3: https://www.liquid.ai/blog/lfm3
- Playground de Liquid AI: https://playground.liquid.ai/
- Consola API de Liquid AI: https://console.liquid.ai/dashboard
