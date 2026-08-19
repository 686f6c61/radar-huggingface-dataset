# philbert440/Qwen3.8-27B-Uncensored-Aggressive

## Resumen

El modelo `philbert440/Qwen3.8-27B-Uncensored-Aggressive` es una adaptación del modelo Qwen3.8-27B, un VLM (vision-language model) denso basado en la arquitectura `qwen3_5`. Desarrollado por el usuario philbert440, su propósito principal es eliminar los mecanismos de rechazo y negativa del modelo original mediante una técnica de abliteración direccional optimizada por divergencia KL, con un perfil agresivo y amplio. El resultado es un modelo de investigación que responde sin filtros de seguridad, pensado exclusivamente para estudiar el comportamiento de los sistemas de alineación.

El proceso de abliteración redujo la tasa de rechazos de 99/100 a 14/100 en el conjunto `mlabonne/harmful_behaviors`, manteniendo una divergencia KL de 0,106 respecto al modelo base y una coherencia textual intacta en pruebas de sanidad. El modelo tiene aproximadamente 27,36 mil millones de parámetros y se distribuye en formato bf16 con pesos fusionados. Está específicamente optimizado para ejecutarse en GPUs NVIDIA V100 (arquitectura SM70) mediante el fork 1Cat-vLLM, e incluye soporte para decodificación especulativa MTP (multi-token prediction).

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (VLM, `qwen3_5`) |
| Parametros totales | 27.356.728.560 (~27,36 B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16 (pesos fusionados); kv-cache fp8_e5m2 soportado |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (bf16) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.8-27B, un transformer denso con arquitectura `qwen3_5` que incorpora una torre de visión para tareas multimodales. El entrenamiento consistió en un proceso de abliteración direccional optimizado mediante divergencia KL (perfil agresivo/amplio), aplicado en modo de no-pensamiento (`/no_think`). La dirección de abliteración se calculó y las evaluaciones de rechazo se realizaron en este mismo modo. Tanto la torre de visión como la cabeza de predicción multi-token (MTP) se mantuvieron intactas desde el modelo base, preservando así las capacidades multimodales y la decodificación especulativa originales. Los pesos resultantes se fusionaron y se distribuyen en formato bf16.

## Capacidades

- Comprensión de lenguaje y visión (VLM), heredada del modelo base Qwen3.8-27B.
- Generación de texto sin filtros de rechazo (comportamiento "uncensored" o "refusal-suppressed").
- Soporte para decodificación especulativa MTP (multi-token prediction), que permite acelerar la inferencia.
- Compatibilidad con el backend 1Cat-vLLM para GPUs NVIDIA V100 (SM70).
- Evaluación y cálculo de direcciones de abliteración en modo de no-pensamiento (`/no_think`).
- Soporte de kv-cache en fp8_e5m2 para optimizar el uso de memoria.

## Casos de uso

- Investigación sobre mecanismos de alineación y rechazo: permite estudiar cómo responde un modelo cuando se eliminan los filtros de seguridad, comparando sus salidas con las del modelo base en entornos aislados.
- Evaluación de técnicas de abliteración: sirve como punto de referencia para medir la eficacia de métodos de supresión de rechazos, utilizando métricas como la divergencia KL y las tasas de rechazo.
- Pruebas de robustez en laboratorios controlados: investigadores pueden analizar la coherencia y la calidad del texto generado sin restricciones, en entornos sin conexión a servicios públicos.
- Desarrollo y prueba de hardware legacy: al estar optimizado para V100 (SM70), permite ejecutar un VLM de 27B en GPUs Volta usando 1Cat-vLLM, algo que no es posible con backends estándar.
- Benchmarking de decodificación especulativa: su soporte MTP y kv-cache fp8 permite medir mejoras de latencia y throughput en configuraciones de tensor parallel (TP2).
- Análisis de sesgos y comportamientos latentes: al eliminar los rechazos, se pueden observar sesgos subyacentes que el modelo base podría ocultar tras negativas o respuestas evasivas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Los únicos datos proporcionados se refieren al proceso de abliteración y a las pruebas de sanidad:

| Metrica | Valor |
|---|---|
| Rechazos en `harmful_behaviors` (modelo base) | 99/100 |
| Rechazos en `harmful_behaviors` (modelo abliterado) | 14/100 |
| Divergencia KL vs. modelo base | 0,106 |
| Prueba de sanidad (prompts dañinos, bf16) | 0/5 rechazados |

## Requisitos de hardware

- VRAM estimada: aproximadamente 55 GB para los pesos en bf16 (27,36 B parámetros × 2 bytes). El uso de kv-cache fp8_e5m2 permite ajustar el presupuesto de memoria dinámicamente.
- GPU recomendadas: 2x NVIDIA V100 (32 GB) en configuración TP2 (tensor parallel), tal como se especifica en las instrucciones de despliegue.
- No está pensado para GPUs de consumo (consumer) sin modificaciones, aunque podría ejecutarse en GPUs con mayor VRAM (A100, H100) si se adapta el backend.
- Opciones de despliegue: 1Cat-vLLM (fork específico para V100/SM70). No se menciona compatibilidad con llama.cpp, Ollama o TGI en la documentación proporcionada.
- Latencia y throughput: no disponible. Se recomienda usar `--kv-cache-dtype fp8_e5m2` y MTP speculative decoding para optimizar el rendimiento.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos abliterados en la información proporcionada. La comparación más directa es con el modelo base Qwen3.8-27B, del cual se diferencia principalmente en la tasa de rechazos (99/100 vs 14/100 en `harmful_behaviors`) y en la divergencia KL (0,106). No hay datos sobre otros modelos similares como Llama-3-8B-Instruct-abliterated u otras variantes "uncensored" en la documentación disponible.

## Limitaciones y advertencias

- Modelo de investigación con los rechazos de seguridad eliminados. Existe un riesgo extremo de generar contenido dañino, ilegal o no ético si se utiliza fuera de entornos controlados y aislados.
- No se especifican los idiomas soportados ni la longitud de contexto, por lo que su comportamiento en tareas multilingües o de contexto largo es desconocido.
- El modelo registra 0 descargas en HuggingFace, lo que indica una falta total de validación comunitaria y la posible presencia de problemas no detectados.
- Depende de un fork específico (1Cat-vLLM) para su ejecución en V100; su uso en otros backends puede requerir modificaciones significativas.
- La licencia Apache-2.0 permite uso comercial, pero el autor incluye una cláusula de "uso responsable" en la model card que insta a utilizarlo de forma legal y ética.
- La abliteración puede degradar el rendimiento en tareas generales de razonamiento o generación, aunque la coherencia se mantuvo intacta en las pruebas de sanidad reportadas.

## Enlaces

- [HuggingFace - philbert440/Qwen3.8-27B-Uncensored-Aggressive](https://huggingface.co/philbert440/Qwen3.8-27B-Uncensored-Aggressive)
- [Repositorio 1Cat-vLLM](https://github.com/1CatAI/1Cat-vLLM)
