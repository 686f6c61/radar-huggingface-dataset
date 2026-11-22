# decido-ai/decido-1-ultra-0.6b

## Resumen

Decido-1-Ultra (0.6B) es un modelo de decisión calibrada desarrollado por decido-ai, obtenido mediante ajuste fino completo de Qwen3-0.6B para imitar el comportamiento de Decido-1 (26B-A4B) por destilación. A diferencia de un modelo generativo convencional, su función es responder preguntas estructuradas sobre un documento (sí/no, elección entre opciones o escalas ordenadas) devolviendo distribuciones de probabilidad calibradas en lugar de texto libre. Está pensado para ejecutarse íntegramente en CPU de portátil con un consumo de memoria de aproximadamente 4 GB.

El modelo resuelve el problema de la clasificación y enrutamiento de documentos con latencia muy baja y sin dependencia de GPU: procesa un documento de ~1.000 tokens con 5 preguntas en 0,41 s p50 en un Apple M4 Pro usando CPU de 10 hilos. Con 596.049.920 parámetros, es la variante más pequeña de la familia Decido 1 y la de menor coste computacional, a cambio de una precisión claramente inferior a la de sus hermanos mayores.

Su relevancia actual radica en la combinación de tres factores: licencia Apache-2.0, pesos disponibles en safetensors y GGUF (Q8_0) y una API compatible con Jev 1.13 que permite sustituir clientes existentes sin cambios. No obstante, sus métricas de calibración (Brier y ECE) son peores que las de Decido-1 en cuatro de cinco comprobaciones, por lo que su uso en producción debe limitarse a escenarios donde la latencia y el coste priman sobre la fiabilidad probabilística.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Qwen3-0.6B) |
| Parámetros totales | 596.049.920 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | GGUF Q8_0 (publicado); bf16 (pesos originales) |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-0.6B, un transformer decoder-only, y se somete a un ajuste fino completo (no LoRA) para transformarlo en un modelo de decisión. El entrenamiento es una destilación sobre 1 millón de preguntas, etiquetadas la mitad con respuestas gold y la otra mitad con las salidas de Decido-1 (26B-A4B). El objetivo no es la generación de texto libre sino la producción de distribuciones de probabilidad sobre un conjunto cerrado de respuestas, con formatos de pregunta fijos: sí/no, elección única entre 1 y 255 opciones y escala ordenada de 2 a 10 niveles.

La innovación técnica principal es el tratamiento del documento como dato no confiable: las instrucciones embebidas en el texto no se siguen y las cadenas de tokens de control se neutralizan. El modelo expone además una API compatible con Jev 1.13 (formatos `noul`, `choice` y `score`), lo que permite integración directa con clientes existentes. La inferencia está desactivada en el Hub (`inference: false`), por lo que el uso previsto es local mediante el paquete `decido-ai` o llama.cpp.

## Capacidades

- Clasificación binaria (sí/no) sobre documentos de texto o JSON.
- Elección única entre opciones, tanto en lista simple como en diccionario clave-descripción.
- Puntuación en escalas ordenadas de 2 a 10 niveles, con devolución de leyenda.
- Salida de probabilidades calibradas por clase, junto con nivel de confianza.
- Procesamiento de documentos tratados como datos no confiables (defensa frente a inyección de instrucciones).
- Determinismo bit-exacto en repeticiones sobre CPU.
- Soporte de API Jev 1.13 (`noul`, `choice`, `score`) y servidor HTTP compatible con `POST /v1/systemone`.
- Interfaz de línea de comandos (`decido run`) y servidor (`decido serve`).
- No soporta generación de texto libre, tool calling, agentes, visión ni audio.

## Casos de uso

- Triaje de tickets de soporte: clasificar cada mensaje entrante en categorías como facturación, envío o técnico, con probabilidades por clase, ejecutándose en el propio portátil del agente sin GPU ni llamadas a la nube.
- Enrutamiento de correo y formularios: decidir el equipo destinatario y la urgencia de cada documento mediante preguntas de elección y escala, con latencia de 0,41 s p50 por documento de ~1.000 tokens.
- Moderación y filtrado de contenido: aplicar preguntas binarias encadenadas (¿es spam?, ¿contiene datos personales?) sobre texto o JSON, aprovechando el tratamiento del documento como dato no confiable.
- Extracción de señales en pipelines ETL: puntuar documentos con escalas ordenadas (por ejemplo, gravedad de incidencia de 2 a 10 niveles) para alimentar sistemas de alerta o priorización.
- Análisis de encuestas y reseñas: asignar etiquetas y niveles de sentimiento con distribución de probabilidad, útil cuando se necesita una medida de incertidumbre y no solo una etiqueta dura.
- Despliegue en entornos con restricciones de hardware: ejecución en CPU de portátil con ~4 GB de RAM, adecuada para aplicaciones de escritorio, edge o entornos air-gapped donde no hay GPU disponible.
- Sustitución de clientes Jev existentes: apuntar el SDK a `decido serve` mediante `TYPESAFE_BASE_URL` para migrar cargas de trabajo a un modelo local sin reescribir la integración.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre seis grupos de benchmark (copias congeladas, mismo harness para todos los modelos). Puntuación = métrica de tipo accuracy por grupo y media posterior.

| Grupo de benchmark | Ultra 0.6B, CPU (Q8_0 GGUF) | Ultra 0.6B, GPU (bf16) | Decido-1, CPU | Jev 1.13 (publicado) |
|---|---:|---:|---:|---:|
| JevBench | 57,69 | 57,20 | 87,61 | 87,18 |
| Kev | 60,14 | 60,23 | 84,35 | 85,52 |
| OpenJev (18 tareas) | 47,66 | 47,60 | 78,37 | 72,96 |
| Nimble | 42,55 | 42,20 | 87,23 | 91,84 |
| VitaminC | 80,63 | 80,30 | 86,14 | 78,46 |
| MASSIVE | 84,29 | 84,57 | 88,57 | 87,14 |
| **Media de los seis grupos** | **62,16** | **62,02** | **85,38** | **83,85** |

Calibración (CPU, GGUF publicado):

| Comprobación | Brier | Jev 1.13 | ECE | Jev 1.13 |
|---|---:|---:|---:|---:|
| JevBench | 0,471 | 0,181 | 0,046 | 0,032 |
| Kev v4 dev | 0,520 | 0,211 | 0,109 | 0,049 |
| Kev v9 dev | 0,596 | 0,212 | 0,101 | 0,034 |
| VitaminC | 0,309 | 0,313 | 0,106 | 0,104 |
| MASSIVE | 0,215 | 0,204 | 0,052 | 0,075 |

Brier igual o mejor que Jev en 1 de 5 comprobaciones; ECE igual o mejor en 1 de 5. La tasa de inversión por orden de opciones es del 8,8 % agrupada (Jev: 14,6 %). Determinismo bit-exacto en repeticiones sobre CPU.

Velocidad: 0,41 s p50 en Apple M4 Pro, solo CPU, Q8_0, 10 hilos, con documento de ~1.000 tokens y 5 preguntas. En GPU de Mac: 0,13 s. En la familia, Decido-1 tarda 4,1 s (CPU) y 1,1 s (GPU de Mac) para la misma carga.

## Requisitos de hardware

- VRAM/RAM estimada: ~4 GB de RAM en CPU con Q8_0 GGUF; bf16 requiere aproximadamente el doble.
- GPU recomendadas: no requiere GPU; funciona en CPU de portátil. Con GPU, el autor reporta 0,13 s en Mac GPU (M4 Pro).
- Cabe en cualquier GPU consumer (RTX 3060 12 GB, RTX 4090, etc.), aunque su diseño está orientado a CPU.
- Opciones de despliegue: paquete `decido-ai` (pip, binarios precompilados para macOS Apple Silicon y Linux x86_64), llama.cpp (GGUF), servidor HTTP propio con `decido serve` (API compatible con Jev, `POST /v1/systemone`).
- Latencia: 0,41 s p50 en CPU (M4 Pro, 10 hilos, 1k tokens, 5 preguntas); 0,13 s en GPU de Mac.
- Throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Base | Parámetros | Ejecución | Media seis grupos | Latencia (M4 Pro, 1k tokens, 5 preguntas) |
|---|---|---:|---|---:|---|
| **Decido-1-Ultra (0.6B)** | Qwen3-0.6B | 596 M | CPU de portátil (~4 GB RAM) | 62,16 (CPU) | 0,41 s CPU · 0,13 s GPU Mac |
| Decido-1-Fast | Qwen3-1.7B | no disponible | CPU de portátil (~8 GB RAM) | 73,01 (CPU) | 0,64 s CPU · 0,30 s GPU Mac |
| Decido-1 | Gemma-4-26B-A4B | no disponible | CPU de portátil (~30 GB RAM) · GPU | 85,38 (CPU) | 4,1 s CPU · 1,1 s GPU Mac |
| Decido-1-Max | Gemma-4-26B-A4B | no disponible | Portátil (lento) · GPU | 89,23 (GPU) | ~28 s/pregunta CPU · ~11 s/pregunta GPU |

Todas las variantes comparten licencia Apache-2.0 y API Jev. La comparación con modelos de propósito general (Qwen3-0.6B base, clasificadores BERT) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Calibración claramente inferior a Decido-1: Brier y ECE empeoran en 4 de 5 comprobaciones frente a Jev 1.13. No es adecuado para decisiones donde la probabilidad deba interpretarse con precisión.
- Precisión global muy inferior a la de la familia: media de 62,16 frente a 85,38 de Decido-1 y 83,85 de Jev 1.13. Grupos como Nimble (42,55) y OpenJev (47,66) quedan muy por debajo.
- Inversión por orden de opciones del 8,8 %: la respuesta puede cambiar según el orden en que se presenten las opciones.
- Solo inglés (`language: en`). No hay soporte multilingüe declarado.
- Longitud de contexto no disponible; el autor solo documenta el rendimiento con documentos de ~1.000 tokens.
- No es un modelo generativo: no produce texto libre, no soporta tool calling, agentes, visión ni audio. Usarlo fuera de su API de decisión no es el caso de uso previsto.
- Inferencia desactivada en el Hub (`inference: false`): requiere ejecución local.
- Riesgo de alucinación inherente a un modelo pequeño destilado, aunque acotado por el formato cerrado de respuestas.
- Sesgos: no se documentan sesgos conocidos en la información proporcionada.
- Licencia Apache-2.0: permite uso comercial sin restricciones adicionales documentadas, pero conviene verificar las condiciones del modelo base Qwen3-0.6B.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/decido-ai/decido-1-ultra-0.6b
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B
- Paquete PyPI: https://pypi.org/project/decido-ai/
- Documentación y playground: https://getdecido.ai
- Colección Decido 1: https://huggingface.co/collections/decido-ai/decido-1-6aed66fd09af05c057795ca8
- Decido-1 (26B-A4B): https://huggingface.co/decido-ai/decido-1-26b-a4b
- Decido-1-Fast (1.7B): https://huggingface.co/decido-ai/decido-1-fast-1.7b
- Decido-1-Max: https://huggingface.co/decido-ai/decido-1-max-26b-a4b
- Decido-1-Think: https://huggingface.co/decido-ai/decido-1-think-26b-a4b
- Decido-1-XL: https://huggingface.co/decido-ai/decido-1-xl
