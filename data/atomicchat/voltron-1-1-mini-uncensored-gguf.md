# AtomicChat/Voltron-1.1-Mini-Uncensored-GGUF

## Resumen

Voltron-1.1-Mini-Uncensored-GGUF es una colección de tres cuantizaciones GGUF de precisión mixta del modelo Voltron 1.1 Mini, publicado por el usuario AtomicChat. El modelo subyacente es un ajuste fino de LFM3-1.7B de Liquid AI, con aproximadamente 1.990 millones de parámetros totales, y esta versión concreta incorpora una ablación de rechazos (refusal ablation) aplicada directamente sobre los pesos en las capas 8 a 23 con una escala de 1,75. El resultado es un modelo conversacional que elimina prácticamente por completo las respuestas de negativa ante peticiones que el modelo original rechazaría.

La relevancia de esta ficha es doble. Por un lado, documenta un caso práctico de modificación de pesos orientada a eliminar el comportamiento de rechazo, con métricas de divergencia KL y acuerdo top-1 frente al checkpoint BF16 sin editar. Por otro, ofrece datos de rendimiento medidos con `llama-bench` en una NVIDIA A10, lo que permite estimar el coste de despliegue en producción. El repositorio ocupa 4,4 GB y contiene tres variantes: AD-IQ4_XS, AD-Q4_K_M y AD-Q6_K.

La información disponible sobre idiomas, datos de entrenamiento originales y benchmarks del modelo base es limitada; la model card se centra en las métricas de la cuantización y de la ablación, no en las capacidades heredadas del modelo LFM3-1.7B. Todo lo que no consta se marca explícitamente como no disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (heredada de Liquid AI LFM3-1.7B; detalles no disponibles) |
| Parametros totales | 1.990.945.600 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (el ejemplo de la model card usa `-c 2048`) |
| Tipos de cuantizacion | GGUF: AD-IQ4_XS, AD-Q4_K_M, AD-Q6_K |
| Idiomas soportados | no disponible (la model card incluye pruebas de rechazo en ingles y ruso) |
| Licencia | LFM Open License v1.0 (etiquetada como `other` en Hugging Face) |
| Formato de pesos | GGUF (para llama.cpp) |

## Arquitectura y entrenamiento

El modelo base es Voltron 1.1 Mini (checkpoint `a955709`), derivado de Liquid AI LFM3-1.7B. La arquitectura concreta (tipo de atención, capas, cabezas, vocabulario) no se detalla en la información proporcionada; solo consta que requiere una build de llama.cpp compatible con LFM3. El tag `lfm3` confirma la familia arquitectónica.

Sobre ese checkpoint, AtomicChat aplicó una ablación de rechazos en las capas 8 a 23 con escala 1,75, y después recalculó la importance matrix sobre el modelo BF16 ya editado usando 9.233 fragmentos de calibración. Las tres cuantizaciones se generaron con precisión mixta. La model card reporta que el MMLU cayó del 57,1 % al 55,4 % durante la evaluación de la ablación, y que la edición seleccionada superó los umbrales internos de divergencia KL y de caída de MMLU. No se documentan datos de entrenamiento originales (número de tokens, composición del corpus, uso de RLHF o DPO) ni innovaciones técnicas del modelo base.

## Capacidades

- Generación de texto conversacional de un solo turno y multiturno (la model card menciona una prueba de humo en chat de un solo turno).
- Razonamiento aritmético básico: el ejemplo oficial resuelve "84 por 3 dividido entre 2".
- Modo "thinking" desactivable: las mediciones de rechazo se hicieron con thinking desactivado y un límite de 256 tokens de generación.
- Comportamiento de rechazo prácticamente eliminado: 0/81 rechazos en inglés y 0-1/100 en ruso según la variante.
- Baja tasa de falsos rechazos en XSTest: 0/250 en las tres cuantizaciones.
- Soporte multilingüe parcial verificado en inglés y ruso (no se documentan más idiomas).
- Compatibilidad con endpoints (`endpoints_compatible` en los tags).
- No se documenta soporte de tool calling, function calling, agentes, visión ni audio.

## Casos de uso

- Evaluación de robustez y alineación: el modelo sirve como caso de estudio controlado para medir cómo una ablación de rechazos afecta a la divergencia KL (0,031-0,132 según cuantización) y al acuerdo top-1 (81,22 %-90,70 %) frente al BF16 original.
- Investigación sobre falsos rechazos: con 0/250 en XSTest, es útil para estudiar la frontera entre negativa legítima y sobre-rechazo en modelos pequeños.
- Despliegue en hardware modesto: con 1,23 GB en AD-IQ4_XS y 1,87 GB en AD-Q6_K, cabe en GPU de consumo y en CPU vía llama.cpp, lo que permite prototipado local sin infraestructura dedicada.
- Generación de texto conversacional en inglés y ruso: útil para asistentes de dominio acotado donde se prioriza la disponibilidad de respuesta sobre las salvaguardas del modelo original.
- Pruebas comparativas de cuantización: las tres variantes permiten medir el compromiso entre tamaño en disco, KLD y velocidad de generación (284,9 tok/s en IQ4_XS frente a 228,8 tok/s en Q6_K en una A10).
- Benchmarking de inferencia en llama.cpp: los datos de `llama-bench` con offload CUDA sirven como referencia para dimensionar prompt processing (hasta 14.838 tok/s con prompt de 2.048 tokens en IQ4_XS).
- Ajuste fino posterior sobre pesos abliterated: el modelo puede servir de punto de partida para experimentos que requieran un base sin rechazos aprendidos.

## Benchmarks y rendimiento

| Metrica | AD-IQ4_XS | AD-Q4_K_M | AD-Q6_K |
|---|---:|---:|---:|
| Tamano en disco (GB) | 1,232 | 1,271 | 1,866 |
| KLD frente a BF16 original | 0,131905 | 0,106317 | 0,031246 |
| Acuerdo top-1 | 81,22 % | 83,03 % | 90,70 % |
| Rechazos EN | 0/81 | 0/81 | 0/81 |
| Rechazos RU | 0/100 | 1/100 | 1/100 |
| Falsos rechazos XSTest | 0/250 | 0/250 | 0/250 |
| Prompt 512 tok (tok/s, A10) | 14.771 | 14.179 | 13.233 |
| Prompt 2.048 tok (tok/s, A10) | 14.838 | 14.211 | 13.303 |
| Generacion 128 tok (tok/s, A10) | 284,9 | 287,2 | 228,8 |

MMLU del modelo editado: 55,4 % (frente al 57,1 % del checkpoint sin editar, según la evaluación de la ablación). No se han publicado resultados de benchmarks adicionales (HumanEval, GSM8K, MMLU del modelo base) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,5-2 GB para AD-IQ4_XS, 1,6-2,2 GB para AD-Q4_K_M y 2,2-3 GB para AD-Q6_K, incluyendo overhead de contexto.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para las variantes Q4; una NVIDIA A10 es la referencia medida en la model card.
- Cabe en GPU de consumo: sí, en RTX 3060, RTX 4060, RTX 4090 y similares con offload completo (`-ngl 99`).
- Opciones de despliegue: llama.cpp (build compatible con LFM3, probada en b12777 `caea914e9d05`); también es compatible con endpoints según los tags. No se documenta soporte de vLLM, TGI ni Ollama.
- Throughput medido en A10: 284,9-287,2 tok/s de generación en Q4 y 228,8 tok/s en Q6_K; prompt processing en torno a 13.200-14.800 tok/s.
- Latencia: no se reporta latencia por token; puede derivarse del throughput de generación (aproximadamente 3,5 ms/token en Q4 y 4,4 ms/token en Q6_K).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---:|---|---|---|---|
| Voltron-1.1-Mini-Uncensored (este) | 1,99 B | no disponible | LFM Open License v1.0 | GGUF | Abliterated, 3 cuantizaciones, MMLU 55,4 % |
| Liquid AI LFM3-1.7B | ~1,7 B (no confirmado) | no disponible | LFM Open License v1.0 | safetensors | Modelo base upstream, mantiene rechazos |
| Voltron 1.1 Mini (`Akahsizrr/voltron-1.1-mini`) | 1,99 B | no disponible | no disponible | safetensors | Checkpoint BF16 sin editar, referencia de KLD y MMLU 57,1 % |

No se dispone de datos suficientes para comparar con alternativas de otros fabricantes del mismo tamaño y categoría.

## Limitaciones y advertencias

- La ablación de rechazos elimina salvaguardas del modelo original: puede responder a peticiones que LFM3-1.7B rechazaría, con implicaciones legales y de seguridad en producción.
- Degradación de capacidades: MMLU baja de 57,1 % a 55,4 %; el acuerdo top-1 frente al BF16 original es del 81,22 % en IQ4_XS, lo que indica divergencia notable en la distribución de salida.
- Riesgo de alucinación: no se documenta mitigación específica; el modelo base es de 1,99 B parámetros, tamaño asociado a mayor tasa de error factual.
- Cobertura de idiomas no verificada más allá de inglés y ruso; no hay datos de calidad en castellano.
- Contexto no documentado: el ejemplo oficial usa `-c 2048`; no se confirma la ventana máxima real.
- Licencia LFM Open License v1.0: conviene revisar sus términos antes de uso comercial, ya que la model card la etiqueta como `other`.
- Repositorio sin descargas ni likes en el momento de la consulta, y creado el 27 de noviembre de 2026: no hay validación comunitaria ni historial de uso.
- Requiere una build de llama.cpp compatible con LFM3; builds antiguas pueden fallar al cargar el modelo.
- Las mediciones de rechazo se hicieron con thinking desactivado y tope de 256 tokens; algunas respuestas alcanzaron el límite, lo que puede infraestimar el comportamiento real en generaciones largas.

## Enlaces

- Hugging Face: https://huggingface.co/AtomicChat/Voltron-1.1-Mini-Uncensored-GGUF
- Modelo base (Voltron 1.1 Mini): https://huggingface.co/Akahsizrr/voltron-1.1-mini
- Checkpoint concreto de procedencia: https://huggingface.co/Akahsizrr/voltron-1.1-mini/tree/a95570987729146ea7e5892ae817eba3e547cfbe
- Modelo upstream Liquid AI: https://huggingface.co/LiquidAI/LFM3-1.7B
- Licencia LFM Open License v1.0: https://huggingface.co/LiquidAI/LFM3-1.7B/blob/main/LICENSE
