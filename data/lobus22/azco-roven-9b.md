# Lobus22/Azco-Roven-9B

## Resumen

Azco-Roven-9B es un ajuste fino de parámetros completos (full fine-tuning) del modelo base 01-ai/Yi-9B, publicado por el usuario Lobus22 (Ronwey) en Hugging Face. El modelo conserva la arquitectura transformer densa de Yi-9B con 8.829.407.232 parámetros, pero sus pesos han sido reentrenados al 100% sin emplear LoRA ni adaptadores, lo que lo distingue de la mayoría de ajustes publicados en el ecosistema.

La relevancia de esta ficha no reside en la calidad del modelo resultante, sino en la técnica de entrenamiento que documenta: un entrenador de tipo LOMO con paginación por bloques, capaz de realizar un ajuste fino completo de un modelo de 9B en 2 x Tesla T4 (16 GB cada una) con un pico de VRAM de solo 2,11 GB. Los pesos residen en memoria de host (21,9 GB de pico) y cada bloque transformer se pagina a la GPU de uno en uno, fusionando los gradientes en una actualización inmediata de Adafactor.

El autor lo describe explícitamente como un artefacto de prueba de concepto para entrenamiento completo en entornos con memoria restringida, no como un modelo de producción listo para instrucciones. Solo se completaron 22 pasos de optimizador sobre 1996 muestras de `tatsu-lab/alpaca` (21.087 tokens procesados), por lo que el cambio de comportamiento respecto al modelo base es limitado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de 01-ai/Yi-9B) |
| Parametros totales | 8.829.407.232 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (heredada de Yi-9B; el valor concreto no se especifica) |
| Tipos de cuantizacion | No disponible en la informacion proporcionada |
| Idiomas soportados | Indonesio (id), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de 01-ai/Yi-9B, un transformer denso decoder-only. El ajuste realizado es de parámetros completos: los 8.829.407.232 pesos fueron entrenados, sin LoRA ni adaptadores. El entrenamiento se llevó a cabo en 2 x Tesla T4 (entorno Kaggle) mediante un entrenador propio de estilo LOMO con paginación: los pesos se mantienen en memoria de CPU, un bloque transformer se transfiere a la GPU cada vez, y los gradientes se fusionan en una actualización inmediata de Adafactor antes de liberar memoria.

Los datos de entrenamiento son `tatsu-lab/alpaca`, con 1996 muestras (174.571 tokens, media de 87,5 tokens por muestra), formateadas con la plantilla `### Instruction / ### Response`. Se completaron 22 pasos de optimizador procesando 21.087 tokens en 36,5 minutos, con 99,49 s/paso y 9,63 tokens/s. La pérdida evolucionó de 1,2746 a 1,21695 (mejor valor 0,67465). El autor reporta un pico de VRAM de 2,11 GB (2,56 GB reservados) y un pico de RAM de host de 21,9 GB. La comprobación de equivalencia del forward frente al forward oficial de Hugging Face no reportó diferencia máxima absoluta (valor "None" en la model card).

## Capacidades

- Generación de texto autoregresiva, heredada de la arquitectura Yi-9B.
- Razonamiento y conocimiento general limitados por el escaso ajuste realizado (22 pasos sobre un subconjunto de Alpaca).
- Capacidad multilingüe declarada para indonesio e inglés; el resto de idiomas no está garantizado por el autor.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta modo thinking, visión ni audio.
- El autor indica explícitamente que no es un modelo de instrucciones listo para producción.

## Casos de uso

- Investigación sobre entrenamiento eficiente en memoria: reproducir o estudiar la técnica de paginación por bloques con Adafactor para ajustar modelos de 9B en GPUs de 16 GB, usando este repositorio como referencia práctica y sus métricas de VRAM/RAM como línea base.
- Docencia y formación en ajuste fino: ilustrar la diferencia entre un ajuste completo y LoRA/QLoRA con un caso real medido (pico de 2,11 GB de VRAM frente a los 21,9 GB de RAM de host).
- Punto de partida para ajustes posteriores: al ser un full fine-tune con licencia Apache 2.0, puede servir como inicialización para entrenamientos adicionales con más pasos y datos.
- Experimentación con plantillas de prompt: el formato `### Instruction / ### Response` permite probar la sensibilidad del modelo base a distintos formatos de instrucción.
- Evaluación de la degradación por sobreajuste parcial: con solo 22 pasos y una pérdida que baja de 1,2746 a 1,21695, es útil para estudiar cuánto cambia un modelo con un entrenamiento mínimo.
- Pruebas de infraestructura de despliegue: validar pipelines de carga de safetensors de 17,7 GB en transformers, TGI o vLLM antes de pasar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión completa (fp16/bf16): aproximadamente 17,7 GB solo para pesos, más overhead de activaciones y caché KV; no cabe en GPUs de 16 GB sin cuantización.
- VRAM estimada con cuantización de 8 bits: en torno a 9-10 GB de pesos; con 4 bits, en torno a 5 GB de pesos (estimaciones derivadas del tamaño de parámetros, no verificadas por el autor).
- GPUs recomendadas: A100 (40/80 GB) o H100 para fp16 sin cuantización; RTX 4090 (24 GB) para fp16 ajustado; RTX 3090/4080 (16-24 GB) solo con cuantización.
- Entrenamiento: el autor demuestra que el full fine-tuning cabe en 2 x Tesla T4 (16 GB) con pico de 2,11 GB de VRAM y 21,9 GB de RAM de host, gracias al entrenador paginado.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag `text-generation-inference`), endpoints compatibles; llama.cpp/Ollama no están documentados para este repositorio y requerirían conversión a GGUF.
- Latencia y throughput: solo se reportan métricas de entrenamiento (99,49 s/paso, 9,63 tokens/s); no hay datos de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Naturaleza del ajuste | Disponibilidad |
|---|---|---|---|---|---|
| Azco-Roven-9B | 8,83B | No disponible | Apache 2.0 | Full fine-tune, 22 pasos, PoC | Hugging Face (0 descargas) |
| 01-ai/Yi-9B (base) | 8,83B | No disponible en esta ficha | Apache 2.0 | Modelo base preentrenado | Hugging Face, ampliamente usado |
| Yi-9B instruct (variante oficial) | ~8,83B | No disponible en esta ficha | Apache 2.0 | Ajuste a instrucciones completo | Hugging Face |
| Lobus22/AegisX1-8B-A1B | No disponible | No disponible | No disponible | Ajuste del mismo autor | Hugging Face |

La comparación directa con el modelo base es la más informativa: Azco-Roven-9B no supera a Yi-9B en capacidades declaradas y su valor está en el método de entrenamiento documentado, no en el rendimiento final.

## Limitaciones y advertencias

- El autor califica el modelo como prueba de concepto y advierte que no es un modelo de instrucciones para producción.
- Solo 22 pasos de optimizador sobre 1996 muestras: el cambio de comportamiento respecto a Yi-9B es limitado y puede inducir sobreajuste parcial al formato Alpaca.
- Riesgo de alucinación y de respuestas incoherentes propio de un ajuste mínimo sobre un modelo base no alineado.
- Idiomas declarados únicamente indonesio e inglés; el castellano no está soportado de forma explícita.
- Sesgos: no se documenta ninguna evaluación de sesgos ni de seguridad.
- Licencia Apache 2.0: permite uso comercial, pero la ausencia de evaluación de calidad y seguridad hace desaconsejable su uso en producción sin validación propia.
- El repositorio tiene 0 descargas y 0 likes, sin validación por parte de la comunidad.
- No hay datos publicados de benchmarks, contexto efectivo ni cuantizaciones verificadas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Lobus22/Azco-Roven-9B
- Perfil del autor: https://huggingface.co/Lobus22
- Modelos del autor: https://huggingface.co/Lobus22/models
- Modelo base: https://huggingface.co/01-ai/Yi-9B
- Dataset de entrenamiento: https://huggingface.co/datasets/tatsu-lab/alpaca
