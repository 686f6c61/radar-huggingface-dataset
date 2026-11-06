# jan3com/Qwen3.5-0.8B-English-GGUF

## Resumen

Qwen3.5-0.8B-English-GGUF es una cuantización en formato GGUF del modelo Qwen3.5-0.8B de Alibaba Qwen, publicada por el usuario jan3com. Se trata de una variante derivada del fichero Q4_K_M de unsloth (commit `6ab4614`) a la que se le ha recortado el vocabulario para dejar únicamente 72.600 de los 248.000 tokens del tokenizador original, conservando el subconjunto necesario para inglés. El resto de pesos se copia sin modificar.

El objetivo es reducir el tamaño del fichero (de 532 MB a 376 MB) y acelerar la generación, ya que el embedding atado y la cabeza LM son más pequeños. El modelo está pensado para tareas de conversión de voz a texto limpio y resumen de notas de voz en inglés, y su autor lo emplea en el producto Echos.

Es relevante para desarrolladores que necesiten un modelo conversacional muy pequeño (572 millones de parámetros reales en safetensors) desplegable en CPU o GPU de gama baja mediante llama.cpp, con licencia Apache 2.0 y compatibilidad con endpoints. La contrapartida es que el recorte de vocabulario degrada severamente la calidad en idiomas distintos del inglés, por lo que no sustituye al modelo completo en escenarios multilingües.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (arquitectura de Qwen3.5; detalles no disponibles) |
| Parámetros totales | 572.454.720 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q4_K_M (única incluida en el repo) |
| Idiomas soportados | en (inglés); otros idiomas tokenizan pero la calidad se degrada |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo base es Qwen3.5-0.8B, un transformer de 572 millones de parámetros desarrollado por Alibaba Qwen. No se dispone de información detallada sobre la composición del dataset de entrenamiento, el número de tokens vistos ni si se aplicaron etapas de RLHF o DPO en la información proporcionada. El modelo derivado no ha sido reentrenado: jan3com parte de la cuantización Q4_K_M de unsloth y aplica exclusivamente una poda del vocabulario.

La innovación técnica de esta variante es el recorte del tokenizador: se conservan 72.600 de los 248.000 tokens originales (aproximadamente el 29 %), lo que reduce el tamaño del embedding atado y de la cabeza LM. Según el autor, con decodificación greedy, 86 de 86 salidas en inglés resultaron byte a byte idénticas al modelo original de referencia, lo que indica que el recorte no altera la distribución de salida para texto inglés en esas pruebas. El resto de pesos se mantiene sin cambios.

## Capacidades

- Generación de texto conversacional en inglés.
- Resumen y limpieza de transcripciones de notas de voz (caso de uso validado por el autor).
- Conversación multi-turno (etiqueta `conversational` en el repo).
- Compatibilidad con endpoints (`endpoints_compatible`).
- Inferencia mediante llama.cpp en formato GGUF.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas; el vocabulario recortado degrada la calidad fuera del inglés.
- Capacidades especiales (thinking mode, visión, audio): no disponible en la información proporcionada.

## Casos de uso

- Limpieza de notas de voz: el modelo recibe transcripciones ASR en bruto y devuelve texto puntuado y corregido; es el escenario que el autor declara haber probado con resultados idénticos al modelo completo.
- Resumen de reuniones o mensajes de audio: con 572 M de parámetros y un fichero de 376 MB, puede ejecutarse en local para condensar notas de voz sin enviar datos a la nube.
- Asistentes conversacionales embebidos en inglés: su tamaño reducido permite integrarlo en aplicaciones de escritorio o móviles mediante llama.cpp, con latencia baja gracias al vocabulario recortado.
- Preprocesado de texto en pipelines de NLP: normalización, reescritura y formateo de texto en inglés antes de pasarlo a modelos mayores.
- Prototipado rápido y pruebas de concepto: al ocupar menos de 400 MB, se puede distribuir junto a una aplicación sin infraestructura de GPU dedicada.
- Despliegue en dispositivos con recursos limitados: CPU, Raspberry Pi o GPUs de gama baja donde un modelo de 7B no cabría con holgura.
- Generación de respuestas cortas en inglés para chatbots de soporte de bajo coste: adecuado cuando el dominio está acotado y el idioma es exclusivamente inglés.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El único dato de evaluación aportado por el autor es la comparación de salidas: con decodificación greedy, 86 de 86 salidas en inglés fueron byte a byte idénticas al modelo Qwen3.5-0.8B original en cuantización Q4_K_M.

## Requisitos de hardware

- VRAM estimada: el fichero GGUF Q4_K_M ocupa 376 MB; la inferencia completa requiere aproximadamente 0,5-1 GB de memoria, incluyendo contexto y buffers de llama.cpp.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; funciona en RTX 3050, RTX 4060, GTX 1660 y superiores. Para mayor throughput, A100 o H100 no aportan ventajas significativas por el tamaño del modelo.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU de consumo moderna e incluso en iGPU con memoria compartida.
- Despliegue: llama.cpp es el runtime objetivo (formato GGUF); también es compatible con Ollama y otros frontends basados en llama.cpp. vLLM y TGI no están indicados para este formato.
- Latencia y throughput: no se han publicado cifras concretas; el autor afirma que genera más rápido que el modelo original por el menor tamaño del embedding y la cabeza LM.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| jan3com/Qwen3.5-0.8B-English-GGUF | 572 M | no disponible | en | Apache 2.0 | GGUF Q4_K_M |
| Qwen/Qwen3.5-0.8B (original) | 572 M | no disponible | multilingüe | Apache 2.0 | safetensors |
| unsloth/Qwen3.5-0.8B-GGUF | 572 M | no disponible | multilingüe | Apache 2.0 | GGUF (varias cuantizaciones) |

La diferencia principal frente a las dos alternativas es el vocabulario recortado (72,6k frente a 248k tokens), que reduce el fichero de 532 MB a 376 MB y acelera la generación a costa de perder calidad fuera del inglés. El modelo original y la versión de unsloth conservan el tokenizador completo y son la opción adecuada para uso multilingüe.

## Limitaciones y advertencias

- El recorte de vocabulario degrada severamente la calidad en idiomas distintos del inglés; el propio autor recomienda usar el modelo completo para esos casos.
- Solo se distribuye una cuantización (Q4_K_M), lo que limita el ajuste de precisión y memoria.
- No hay información publicada sobre sesgos, tasas de alucinación ni evaluación en tareas de razonamiento o código.
- Al ser un modelo de 572 M de parámetros, su capacidad de razonamiento complejo y conocimiento factual es limitada en comparación con modelos de mayor tamaño.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base y sus derivados deben cumplir también las condiciones de Qwen.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no cuenta con validación comunitaria independiente.
- No se especifica la longitud de contexto soportada, dato crítico para planificar aplicaciones con conversaciones largas.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/jan3com/Qwen3.5-0.8B-English-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Cuantización de origen: https://huggingface.co/unsloth/Qwen3.5-0.8B-GGUF
- Script de construcción y lista de tokens: `scripts/llm-english` (referenciado en la model card; no se proporciona URL directa)
