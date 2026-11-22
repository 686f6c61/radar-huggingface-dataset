# oncody/brahma

## Resumen

brahma es un ajuste fino (fine-tune) de pleno parámetro del modelo Qwen3-0.6B, desarrollado por Rahul Chaube (cuenta `oncody` en Hugging Face). El modelo se publica como un checkpoint conversacional de pequeño tamaño cuyo objetivo explícito es aprender su propio nombre de asistente ("brahma") mediante un entrenamiento supervisado sobre un conjunto muy reducido de pares pregunta-respuesta en inglés. El checkpoint contiene la totalidad de los 596.049.920 parámetros del modelo base, junto con el tokenizer y la plantilla de chat de Qwen3.

La relevancia de este modelo no reside en su capacidad general, sino en su carácter de demostración técnica: ilustra cómo un ajuste fino mínimo (64 pares de prompt-respuesta, 4 épocas, 64 actualizaciones del optimizador sobre una única GPU Tesla T4) puede modificar de forma fiable un comportamiento concreto de identidad sin destruir por completo las capacidades del modelo base. El autor documenta además una técnica de interpolación de pesos: el checkpoint exportado añade el 65% de la diferencia de pesos entre el modelo totalmente ajustado y el checkpoint inicial, devolviéndola a los pesos de partida.

Arquitectónicamente hereda íntegramente Qwen3-0.6B (transformer denso, licencia Apache 2.0), por lo que su contexto, tokenizer y formato de pesos son los del modelo upstream. Está pensado para inferencia local en hardware modesto y para experimentación con plantillas de chat y ajuste fino de identidad, no para cargas de producción con requisitos de razonamiento o precisión factual.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (heredada de Qwen3-0.6B) |
| Parametros totales | 596.049.920 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada de Qwen3-0.6B) |
| Tipos de cuantizacion | no disponible (el autor solo publica pesos en FP16; el modelo base admite cuantizaciones estandar de la familia Qwen3) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (FP16) |

## Arquitectura y entrenamiento

El modelo es un fine-tune de pleno parámetro sobre el checkpoint `Qwen/Qwen3-0.6B` en la revision `c1899de289a04d12100db370d81485cdf75e47ca`. Conserva la arquitectura transformer densa de Qwen3 y la plantilla de chat del modelo base, configurada por defecto para respuestas directas (`enable_thinking=False` en el ejemplo de uso). No se introduce ninguna innovación arquitectónica: el interés está en el procedimiento de ajuste.

El entrenamiento utilizó 64 pares originales de prompt-respuesta en inglés, de los cuales la mitad trataban sobre el nombre del asistente o su linaje de modelo y la otra mitad cubrían preguntas generales breves. Se empleó el optimizador Adafactor, 4 épocas (64 actualizaciones del optimizador), tasa de aprendizaje máxima de 0,00006, microbatch de 2 con acumulación de gradiente de 2, longitud máxima de secuencia de 192 tokens y semilla 37, todo sobre una Tesla T4 en Google Colab. Solo los tokens de la respuesta del asistente y el token de fin contribuyeron a la pérdida supervisada. Tras el ajuste, un conjunto de desarrollo separado de 10 prompts sirvió para comparar seis intensidades de la actualización aprendida; el checkpoint seleccionado reincorpora el 65% de la diferencia de pesos entre el modelo totalmente ajustado y el modelo de partida.

## Capacidades

- Generación de texto conversacional en inglés con plantilla de chat de Qwen3.
- Autoidentificación fiable con el nombre "brahma" (8/8 en las pruebas de nombrado del autor, frente a 0/8 del modelo base).
- Identificación de su checkpoint de partida (Qwen3-0.6B) en 1/1 pruebas.
- Respuestas directas sin modo de razonamiento explícito (thinking desactivado por defecto en la plantilla).
- Respuestas breves a preguntas generales sencillas con formato controlado (4/7 en las comprobaciones del autor).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible; el autor no lo documenta y el tamaño del modelo lo hace poco adecuado.
- Capacidades multilingües: limitadas al inglés según la model card.
- Capacidades especiales (visión, audio): no disponibles.

## Casos de uso

- Demostración de ajuste fino de identidad: servir como ejemplo reproducible de cómo 64 pares de datos y 64 actualizaciones pueden fijar un comportamiento concreto (el nombre del asistente) en un modelo de 0,6B, útil en docencia y tutoriales de fine-tuning.
- Prototipado de asistentes conversacionales ligeros: para bots de chat en inglés con personalidad e identidad definidas, ejecutables en una sola GPU de consumo o incluso en CPU en FP32.
- Experimentación con plantillas de chat: validar el comportamiento de `apply_chat_template` de la familia Qwen3 con `enable_thinking=False` y respuestas directas en pipelines propios.
- Pruebas de interpolación de pesos: el checkpoint documenta la mezcla al 65% entre modelo ajustado y modelo base, lo que lo convierte en un caso de estudio para técnicas de model merging y regularización por interpolación.
- Base para fine-tunes posteriores: al ser un checkpoint completo en safetensors con licencia Apache 2.0, puede reutilizarse como punto de partida para ajustes de dominio en inglés sobre hardware modesto.
- Evaluación de límites de modelos pequeños: útil como caso negativo controlado para medir alucinación y coherencia factual en modelos de menos de 1B parámetros (el propio autor documenta fallos como responder "Four" al número de ruedas de una bicicleta).
- Inferencia local de bajo coste: despliegue en entornos con VRAM limitada para generación de texto breve, gracias a sus 596 millones de parámetros en FP16.

## Benchmarks y rendimiento

El autor publica únicamente evaluaciones cualitativas y de conteo muy reducidas, con decodificación greedy y sin mensaje de sistema:

| Comprobacion | Qwen3-0.6B | brahma |
|---|---:|---:|
| Proporcionó el nombre de asistente solicitado | 0 / 8 | 8 / 8 |
| Identificó el checkpoint de partida | 0 / 1 | 1 / 1 |
| Comprobaciones generales con el formato de respuesta solicitado | 4 / 7 | 4 / 7 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 1,2 GB solo para pesos (596 M parámetros × 2 bytes), más overhead de activaciones y KV cache; en la práctica, menos de 3 GB en la mayoría de configuraciones.
- En FP32 (CPU): aproximadamente 2,4 GB solo para pesos.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; el autor verificó el entrenamiento en una Tesla T4. Funciona en RTX 3060, RTX 4060, RTX 4090, A100 y H100 sin problema de capacidad.
- Cabe holgadamente en GPU de consumo, incluidas las de gama de entrada con 4-6 GB.
- Opciones de despliegue: `transformers` (versión verificada 4.57.6 según el autor), con `safetensors` y `trust_remote_code=False`. El autor no documenta soporte verificado para vLLM, llama.cpp, Ollama o TGI; al conservar la arquitectura Qwen3 estándar, es probable la compatibilidad con esas herramientas, pero no está confirmada en la información disponible.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| brahma | 596 M | no disponible (heredado de Qwen3-0.6B) | Apache 2.0 | Fine-tune de identidad sobre Qwen3-0.6B con 64 pares |
| Qwen/Qwen3-0.6B | 596 M | no disponible en la informacion proporcionada | Apache 2.0 | Modelo base; no se autoidentifica como "brahma" (0/8) |
| Alternativas de ~0,5B (p. ej. Qwen2.5-0.5B, SmolLM2-360M) | ~0,36-0,5 B | no disponible | Apache 2.0 (segun cada modelo) | No evaluadas en la informacion proporcionada; comparacion no disponible |

## Limitaciones y advertencias

- El conjunto de entrenamiento es minúsculo (64 pares) y el ajuste está diseñado para un único comportamiento de identidad; no mejora razonamiento, conocimiento factual ni precisión.
- El propio autor documenta fallos factuales: responde "Four" al número de ruedas de una bicicleta ordinaria y puede repetir frases.
- Las evaluaciones publicadas son de tamaño muy reducido (8, 1 y 7 prompts) y no establecen rendimiento general, precisión factual ni capacidades multilingües.
- Idioma limitado al inglés según la model card; no se documenta soporte de castellano.
- Riesgo de alucinación inherente a un modelo de 0,6B parámetros; no apto para producción con requisitos de exactitud.
- La licencia Apache 2.0 permite uso comercial, pero se hereda del modelo base Qwen3-0.6B; conviene conservar la atribución al equipo Qwen y al autor del fine-tune.
- El contexto máximo efectivo no está documentado en la información proporcionada; el entrenamiento usó secuencias de 192 tokens, muy por debajo del contexto del modelo base.
- No hay evidencia de soporte de tool calling ni de modo de razonamiento multi-paso.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: sin validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/oncody/brahma
- Demo (Space): https://huggingface.co/spaces/oncody/brahma
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B
- Checkpoint de partida exacto: https://huggingface.co/Qwen/Qwen3-0.6B/tree/c1899de289a04d12100db370d81485cdf75e47ca
