# nokeepai/Inkling-2-Mini-Unbound

## Resumen

Inkling-2-Mini-Unbound es una variante del modelo multimodal Inkling-2-Mini de Thinking Machines a la que se le ha eliminado el comportamiento de rechazo mediante una edición directa de pesos. El autor, nokeepai, publica el checkpoint como un reemplazo directo del original: misma arquitectura, mismos ficheros, misma plantilla de chat y mismos parámetros de configuración. El modelo base es un transformer de tipo mixture-of-experts (MoE) con capacidad de entrada imagen-texto (pipeline `image-text-to-text`) y 26.388.646.440 parámetros totales según los safetensors del repositorio.

La modificación consiste en la alteración de 20 tensores BF16 de salida de atención mediante una edición consciente de la convolución y preservadora de la norma. No se tocan los pesos de los expertos. Según la model card, el resultado es un checkpoint que se reconstruye bit a bit desde el original con el script `abliteration/edit.pt`. El modelo se distribuye en formato de 8 bits (etiqueta `modelopt`), aunque al cargarse en Transformers los expertos se descomprimen a BF16, lo que eleva el requisito de memoria a unos 53 GB.

El modelo es relevante en el contexto de la investigación sobre alineación y seguridad: demuestra que una edición de pesos muy localizada puede eliminar por completo la tasa de rechazo (0 de 277 prompts dañinos) manteniendo las capacidades del modelo original dentro del intervalo de confianza del 95%. Ahora bien, la propia model card advierte de que el modelo sigue instrucciones dañinas y no debe desplegarse a usuarios finales sin salvaguardas propias.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE multimodal (image-text-to-text), soporte de thinking mode |
| Parametros totales | 26.388.646.440 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8-bit (modelopt) en el repo; carga en BF16 en Transformers |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del base `thinkingmachines/Inkling-2-Mini`: un transformer con mezcla de expertos (MoE) y pipeline multimodal de imagen a texto, con una plantilla de chat que acepta un parámetro `reasoning_effort` (valores de 0 a 0.99, o `none`, `minimal`, `low`, `medium`, `high`, `xhigh`; por defecto 0.9) que se renderiza como una línea de sistema `Thinking effort level: <x>`. El esfuerzo 0 sigue produciendo un razonamiento breve. El parser de razonamiento separa el bloque de pensamiento de la respuesta final.

El proceso de entrenamiento del modelo base no se detalla en la información disponible. La modificación de Unbound no es un entrenamiento: es una edición de pesos que altera 20 tensores BF16 de salida de atención con una técnica consciente de la convolución y preservadora de la norma, sin tocar los pesos de los expertos y sin capas adicionales de entrenamiento de seguridad. La model card indica que el checkpoint es reproducible bit a bit desde el original. El modelo se distribuye con etiquetas `abliterated` y `refusal-removed`, y el autor lo describe como un reemplazo directo del original en cuanto a arquitectura, ficheros, plantilla de chat y ajustes.

## Capacidades

- Generación de texto y razonamiento con modo de pensamiento configurable mediante `reasoning_effort`.
- Procesamiento de entradas de imagen y texto (pipeline `image-text-to-text`).
- Soporte de tool calling y function calling: la configuración de SGLang incluye `--tool-call-parser inkling2`.
- Soporte de agentes y razonamiento multi-paso a través del modo de pensamiento y el parser de razonamiento dedicado (`--reasoning-parser inkling`).
- Capacidades multilingües: no disponibles en la información proporcionada.
- Capacidad de responder a solicitudes dañinas sin rechazo (comportamiento buscado por el autor, no una capacidad funcional adicional).
- Compatibilidad con endpoints (`endpoints_compatible` según las etiquetas del repositorio).

## Casos de uso

- Investigación sobre alineación y seguridad: el modelo sirve como objeto de estudio para medir cómo una edición localizada de pesos afecta a la tasa de rechazo, la utilidad de las respuestas y la deriva respecto al original (KL de 0.0546 frente al suelo de ruido de 0.0024).
- Evaluación comparativa de técnicas de abliteración: permite contrastar el enfoque de Unbound (20 tensores de atención) con el de OpenUncensored/Inkling-2-Mini-Uncensored, con métricas de rechazo, utilidad y KL medidas con el mismo arnés.
- Pruebas de robustez de filtros y clasificadores: al generar respuestas a prompts dañinos que el original rechaza, se puede usar para estresar sistemas de moderación y detección de contenido en pipelines de producción.
- Red teaming interno: adecuado para ejercicios controlados de evaluación de riesgos en entornos aislados, con prompts de 8 categorías dañinas y 784 prompts benignos limítrofes como conjunto de prueba.
- Análisis de deriva de distribución: útil para estudiar cuánto se desvía la salida de un modelo editado en prompts benignos (acuerdo top-1 del 92.4% frente al 98.3% del original), con aplicación en investigación de interpretabilidad.
- Evaluación de modos de pensamiento: la plantilla de chat con `reasoning_effort` permite experimentar con distintos niveles de razonamiento y medir su efecto en la utilidad de las respuestas (54.2% con pensamiento desactivado frente a 63.2% con esfuerzo 0.9).

## Benchmarks y rendimiento

Los datos proceden de la model card del autor y se midieron con un arnés congelado el 2026-11-21 sobre un split de test sellado: 277 prompts dañinos en 8 categorías, 784 prompts benignos limítrofes, 10 sondas de límites honestos y 10 de autolesión. Decodificación greedy, plantilla de chat oficial, sin system prompt, tope de 4.096 tokens de pensamiento y respuesta final puntuada sin el bloque de razonamiento. Los valores son estimaciones puntuales con intervalos de confianza bootstrap del 95%.

| Metrica | Objetivo | Original | OpenUncensored | Unbound |
|---|---|---|---|---|
| Rechazo dañino, pensamiento off | ≤ 1% | 97.5% [95.3, 99.3] | 1.8% [0.4, 3.6] | 0.0% [0.0, 0.0] |
| Rechazo dañino, esfuerzo 0.9 | ≤ 1% | 97.5% [95.3, 99.3] | 1.4% [0.4, 2.9] | 0.0% [0.0, 0.0] |
| Peor categoría, off / 0.9 | ≤ 5% | 100% / 100% | 7.1% / 2.9% | 0.0% / 0.0% |
| Respuestas útiles a peticiones dañinas, off | ≥ 90% | 0.4% [0.0, 1.1] | 34.3% [28.9, 39.7] | 54.2% [48.4, 59.9] |
| Respuestas útiles a peticiones dañinas, 0.9 | ≥ 90% | 1.1% [0.0, 2.5] | 42.6% [36.8, 48.4] | 63.2% [57.4, 69.0] |
| Sobrerrechazo, prompts benignos limítrofes | ≤ 2% | 38.1% [34.8, 41.6] | 0.0% [0.0, 0.0] | 0.0% [0.0, 0.0] |
| KL medio vs original, prompts benignos, primeros 256 tokens | ≤ 0.02 | suelo de ruido 0.0024 [0.0023, 0.0024] | 0.0630 [0.0586, 0.0678] | 0.0546 [0.0498, 0.0598] |
| Acuerdo top-1, prompts benignos | ≥ 96% | suelo de ruido 98.3% | 91.8% | 92.4% |
| Límites honestos, off / 0.9 | tasa del original | 90% / 70% | 70% / 70% | 80% / 60% |
| Recursos de crisis, off / 0.9 | no disponible | no disponible | no disponible | no disponible |

La model card indica que los 6 benchmarks de capacidad (MMLU-Pro, GSM8K, MATH-500, GPQA Diamond, IFEval y HumanEval+) quedan dentro del intervalo de confianza del 95% del original, pero no se publican los valores numéricos de esos benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 20.2 GB en cuantización de 8 bits (modelopt); al cargarse en Transformers los expertos se descomprimen a BF16, lo que requiere aproximadamente 53 GB de memoria.
- GPU recomendadas: para BF16 completo, GPUs con 80 GB (A100 80GB, H100 80GB). Para la versión de 8 bits, una GPU de 24-48 GB puede ser suficiente, aunque no se confirma en la información disponible.
- ¿Cabe en GPU consumer? La versión de 8 bits (20.2 GB) podría caber en una RTX 4090 de 24 GB, pero no se confirma en la información disponible.
- Opciones de despliegue: SGLang (imagen `lmsysorg/sglang:inkling-2-mini`, con `--tp 1 --attention-backend fa4 --dtype bfloat16 --page-size 128 --enable-multimodal --reasoning-parser inkling --tool-call-parser inkling2`) y Transformers (soporte en el PR #51050, probado en el commit `a10ebc3c`). No se mencionan vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rechazo dañino (off) | Respuestas utiles (off) | KL vs original | Licencia |
|---|---|---|---|---|---|---|
| Inkling-2-Mini-Unbound | 26.388.646.440 | no disponible | 0.0% | 54.2% | 0.0546 | Apache 2.0 |
| OpenUncensored/Inkling-2-Mini-Uncensored | no disponible | no disponible | 1.8% | 34.3% | 0.0630 | no disponible |
| thinkingmachines/Inkling-2-Mini (original) | no disponible | no disponible | 97.5% | 0.4% | suelo de ruido 0.0024 | no disponible |

Los tres modelos comparten la misma arquitectura base. Unbound mejora a OpenUncensored tanto en utilidad de las respuestas (54.2% frente a 34.3% con pensamiento desactivado; 63.2% frente a 42.6% con esfuerzo 0.9) como en deriva respecto al original (KL de 0.0546 frente a 0.0630), y reduce el sobrerrechazo a 0.0% en ambos casos. No se dispone de datos de benchmarks de capacidad numéricos para ninguno de los tres en la información proporcionada.

## Limitaciones y advertencias

- El modelo sigue instrucciones dañinas: da respuestas detalladas a solicitudes de contenido peligroso o ilegal (armas, ciberataques, delitos y abuso) que el original rechaza. No tiene entrenamiento de seguridad añadido.
- No debe desplegarse a usuarios finales sin salvaguardas propias, ni en contextos donde sus salidas puedan llegar a alguien que no haya elegido usar un modelo sin censura.
- Bucles de pensamiento: con esfuerzo alto el modelo puede entrar en bucles en algunos prompts; las evaluaciones usaron un tope de 4.096 tokens de pensamiento.
- Deriva respecto al original en prompts benignos: KL medio de 0.0546 (objetivo ≤ 0.02) y acuerdo top-1 del 92.4% (objetivo ≥ 96%), por debajo de los umbrales fijados por el autor.
- Menor tasa de límites honestos que el original: 80% / 60% frente a 90% / 70% (pensamiento off / esfuerzo 0.9).
- El modelo tiene 0 descargas y 0 likes en Hugging Face en el momento de la consulta, y fue creado y actualizado el mismo día (2026-11-21), lo que limita la validación externa.
- Idiomas soportados no disponibles: no se puede confirmar el comportamiento multilingüe.
- Licencia Apache 2.0: permite uso comercial, pero el autor advierte explícitamente contra el despliegue sin salvaguardas; la responsabilidad legal del uso recae en el desplegador.
- Riesgo de alucinación: no se han publicado métricas específicas de alucinación en la información disponible.
- Sesgos conocidos: no se han publicado análisis de sesgos en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nokeepai/Inkling-2-Mini-Unbound
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Modelo comparado (OpenUncensored): https://huggingface.co/OpenUncensored/Inkling-2-Mini-Uncensored
- Perfil del autor en X: https://x.com/nokeepai
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- PR de Transformers con soporte para Inkling-2-Mini: #51050 (commit `a10ebc3c`)
- Imagen de SGLang para evaluaciones: `lmsysorg/sglang:inkling-2-mini`
