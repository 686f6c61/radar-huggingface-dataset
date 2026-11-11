# Charlie320/zils-mini-m2r

## Resumen

zils-mini-m2r es un modelo de decisión de 4.539 millones de parámetros (4,54 B) publicado por el usuario Charlie320 en Hugging Face. Se trata de un fine-tune de Qwen/Qwen3.5-4B en el formato denominado "chassis layout", en BF16, con los pesos de lenguaje entrenados y la torre de visión heredada del modelo padre. Forma parte del ecosistema Zils, un conjunto de modelos orientados a tareas de decisión dentro del pool `d3-mini` de la subred 127 de Bittensor.

El modelo se construye mediante una receta de model soup: parte de la media uniforme de dos miembros del soup z3-mini del 11 de noviembre de 2026, sobre esa base entrena dos fine-tunes completos de las capas superiores del bloque de lenguaje (a partir de la capa 16) y dos adaptadores LoRA de rango 32, y finalmente promedia los cuatro miembros y extrapola el resultado un 25 % alejándolo del punto de partida. La capa de respuesta y la torre de visión quedan sin modificar.

Su relevancia es acotada pero específica: no es un modelo de propósito general, sino un componente de decisión entrenado con 46.756 ítems en formato de examen derivados de filas públicas de entrenamiento, siguiendo la receta de autoría pública de Zils. La licencia Apache-2.0 facilita su reutilización, aunque el propio autor advierte de que el repositorio contiene únicamente pesos y de que deben revisarse los términos de los conjuntos de datos de origen.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen/Qwen3.5-4B), con torre de visión heredada del padre |
| Parámetros totales | 4.539.265.536 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (pesos publicados en BF16; safetensors) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen/Qwen3.5-4B, un transformer denso de aproximadamente 4,5 B de parámetros, adaptado al "chassis layout" del ecosistema Zils. El entrenamiento no parte de cero ni de los pesos originales del modelo base, sino de una media uniforme de pesos de dos miembros previos del soup: `qhoenix/zils-mini-decision-l13_avg678` (revisión 091c6ebe) y `joamCriff123/zils-mini-sx3` (revisión 2a84fc71), ambos con licencia Apache-2.0.

Sobre ese punto de partida se generan cuatro miembros: dos fine-tunes de peso completo de las capas superiores del bloque de lenguaje (capa 16 en adelante), con AdamW a learning rate 3e-6, 1,2 horas de entrenamiento cada uno y semillas 711 y 712; y dos miembros LoRA de rango 32 con anclaje KL de 0,1 respecto al punto de partida, learning rate 5e-5, una época y semillas 21 y 22. Los cuatro miembros se promedian de forma uniforme y el resultado se extrapola 1,25× alejándolo del punto de partida (1,25 × media − 0,25 × inicio). La capa de respuesta y la torre de visión no se tocan.

Los datos de entrenamiento consisten en 46.756 ítems de decisión en formato de examen, escritos a partir de filas públicas del split de entrenamiento con la receta de autoría pública de Zils (`scripts/author_exam.py`). De ellos, 7.120 fueron redactados por Claude Opus y se usaron en todos los miembros, mientras que 39.636 fueron generados por un modelo abierto local, Qwen3.8-27B, y se emplearon solo en los miembros "pesados". El autor declara explícitamente que no se usaron ítems del examen de validación, ni ítems públicos del examen semilla, ni filas de relay.

## Capacidades

- Generación de texto y razonamiento dentro del dominio de decisión para el que fue entrenado (ítems en formato de examen).
- Capacidades de visión heredadas de la torre del modelo padre Qwen/Qwen3.5-4B, sin reentrenamiento.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo de pensamiento (thinking mode): no disponible en la información proporcionada.
- Capacidades de audio: no disponible en la información proporcionada.

## Casos de uso

- Evaluación de ítems de decisión en formato de examen: el modelo está entrenado específicamente con 46.756 ítems de este tipo, por lo que su uso natural es responder preguntas de opción múltiple o formato examen dentro del dominio de Zils, con la ventaja de haber sido ajustado sobre datos de autoría controlada.
- Componente de un pool de model soup: dado que el modelo se construye mediante promediado y extrapolación de pesos, puede servir como miembro adicional en futuros soups de la subred 127 de Bittensor, aportando diversidad de semillas (711, 712, 21, 22) sobre una base común.
- Investigación sobre técnicas de merging: la receta documentada (media uniforme, extrapolación 1,25×, combinación de fine-tunes completos y LoRA con anclaje KL) lo convierte en un caso de estudio reproducible para experimentos de model souping y task arithmetic.
- Punto de partida para fine-tunes posteriores: al ser un fine-tune de Qwen3.5-4B con licencia Apache-2.0 y pesos en safetensors, puede reutilizarse como base para ajustes adicionales en tareas de decisión o clasificación.
- Prototipado de pipelines de decisión automatizada: en entornos donde se requiera un modelo de 4,5 B con capacidad de razonamiento sobre ítems estructurados, puede integrarse en flujos de evaluación o triaje, siempre que se valide su comportamiento fuera del dominio de entrenamiento.
- Experimentación con modelos derivados de Qwen en investigación académica: la trazabilidad de la receta (revisiones concretas de los modelos base, hiperparámetros, semillas y composición del dataset) facilita la reproducibilidad en estudios sobre fine-tuning y merging.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 9,1 GB solo para pesos (el tamaño del repositorio es de 9,1 GB), más overhead de activaciones y caché KV; en la práctica se recomienda un mínimo de 12 GB de VRAM para contexto corto.
- VRAM estimada en cuantización de 8 bits: alrededor de 4,5-5 GB para pesos, más overhead; en 4 bits, alrededor de 2,5-3 GB.
- GPU recomendadas: A100 (40/80 GB), H100 (80 GB) para despliegues de producción con contexto largo; RTX 4090 (24 GB) o RTX 3090 (24 GB) para inferencia en BF16 con margen.
- GPU de consumo: cabe en GPUs consumer de 16 GB o más en BF16; en cuantización de 8 o 4 bits puede ejecutarse en GPUs de 8-12 GB, aunque los tipos de cuantización no están documentados por el autor.
- Opciones de despliegue: al estar en safetensors y ser compatible con la familia Qwen, es desplegable con vLLM, TGI, llama.cpp (previa conversión a GGUF) y Ollama (previa creación del manifiesto). No se documenta compatibilidad explícita con ninguno de ellos.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| zils-mini-m2r | 4,54 B | No disponible | Apache-2.0 | safetensors (BF16) | Fine-tune de decisión sobre Qwen3.5-4B, con torre de visión |
| Qwen/Qwen3.5-4B | ~4 B (no confirmado) | No disponible | No disponible en la información | No disponible | Modelo base del que deriva; capacidades generales |
| qhoenix/zils-mini-decision-l13_avg678 | No disponible | No disponible | Apache-2.0 | No disponible | Miembro previo del soup, usado como parte del punto de partida |
| joamCriff123/zils-mini-sx3 | No disponible | No disponible | Apache-2.0 | No disponible | Miembro previo del soup, usado como parte del punto de partida |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Modelo de dominio estrecho: entrenado exclusivamente con ítems de decisión en formato de examen; su rendimiento fuera de ese dominio no está documentado y probablemente sea limitado.
- Riesgo de alucinación: no se han publicado evaluaciones de fiabilidad ni de tasas de alucinación; al ser un fine-tune sobre datos sintéticos generados por Claude Opus y Qwen3.8-27B, puede heredar sesgos y errores de esos generadores.
- Sesgos conocidos: no documentados por el autor; la composición del dataset (generado por modelos) puede introducir sesgos de estilo y de contenido no evaluados.
- Limitaciones de contexto e idioma: la longitud de contexto y los idiomas soportados no están disponibles; no se debe asumir un contexto largo ni multilingüismo sin verificación empírica.
- Restricciones de licencia: los pesos son Apache-2.0, pero el autor advierte de que el repositorio contiene solo pesos y de que deben revisarse los términos de los conjuntos de datos de origen antes de reutilizarlos. El uso comercial de los datos subyacentes no está garantizado por la licencia del modelo.
- Caveat para producción: el modelo se ha creado mediante promediado y extrapolación de pesos (1,25×), una técnica que puede degradar la coherencia en tareas fuera del dominio de entrenamiento; se recomienda validación exhaustiva antes de desplegarlo.
- Sin datos de benchmarks: no hay métricas publicadas que permitan comparar su calidad con alternativas, lo que dificulta justificar su elección frente a otros modelos de 4 B.

## Enlaces

- Hugging Face: https://huggingface.co/Charlie320/zils-mini-m2r
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Miembro del soup: https://huggingface.co/qhoenix/zils-mini-decision-l13_avg678
- Miembro del soup: https://huggingface.co/joamCriff123/zils-mini-sx3
- Script de autoría citado en la model card: `scripts/author_exam.py` (no se proporciona URL en la información disponible)
- Subred 127 de Bittensor: no se proporciona URL en la información disponible
