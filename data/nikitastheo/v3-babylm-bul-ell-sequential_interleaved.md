# nikitastheo/v3-babylm-bul-ell-sequential_interleaved

## Resumen

El modelo `nikitastheo/v3-babylm-bul-ell-sequential_interleaved` es un modelo de lenguaje causal de tipo GPT-2 con 123,9 millones de parámetros, desarrollado por nikitastheo como parte de la iniciativa BabyLM, centrada en el preentrenamiento eficiente con corpus de tamaño reducido y desarrollo plausible. El nombre del modelo indica que ha sido entrenado con datos en búlgaro (bul) y griego (ell) mediante una estrategia de intercalado secuencial, lo que lo convierte en un recurso relevante para investigar el multilingüismo en condiciones de escasez de datos.

El modelo se distribuye en formato safetensors y está diseñado para generación de texto, siendo compatible con la librería transformers y con herramientas de inferencia como text-generation-inference. Su tamaño moderado y su arquitectura GPT-2 lo hacen accesible para experimentación en hardware de consumo, aunque no se han publicado métricas de rendimiento ni detalles sobre su licencia.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-2 (causal LM) |
| Parametros totales | 123.886.080 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | búlgaro y griego (según el nombre del modelo) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura GPT-2 estándar, un transformer causal con atención por máscara, configurado mediante el archivo `model_configs/gpt_base_config.json`. El entrenamiento se realizó con un script propio basado en Hugging Face Accelerate (`train_clm.py`), sin utilizar la clase `Trainer`. Se empleó un tokenizador específico (`nikitastheo/babylm-bul-tokenizer`) y un total de 26.020 pasos de optimización con una tasa de aprendizaje de 0,0001, programación lineal y 2.602 pasos de calentamiento. El tamaño de lote por dispositivo fue de 32, sin acumulación de gradientes, y se aplicó un cambio de idioma en el epoch 10, lo que sugiere una estrategia de intercalado secuencial entre búlgaro y griego durante el entrenamiento.

No se menciona el uso de técnicas de alineación como RLHF o DPO, ni se detalla la composición exacta del corpus de entrenamiento, más allá de su vinculación con el proyecto BabyLM.

## Capacidades

- Generación de texto causal en búlgaro y griego, con capacidad de completar secuencias y producir texto coherente en esos idiomas.
- Modelo de lenguaje de propósito general, adecuado para tareas de generación y modelado de lenguaje.
- Compatible con la librería transformers y con pipelines de generación de texto estándar.
- No se han documentado capacidades adicionales como tool calling, agentes, razonamiento multi-paso, visión o audio.

## Casos de uso

- Investigación en preentrenamiento eficiente: el modelo sirve como punto de partida para estudiar cómo el intercalado secuencial de idiomas afecta al rendimiento en tareas de comprensión y generación, especialmente en contextos de datos limitados como los de BabyLM.
- Fine-tuning para tareas específicas en búlgaro y griego: al ser un modelo base, puede adaptarse mediante ajuste fino para clasificación de texto, análisis de sentimiento o generación de respuestas en esos idiomas.
- Generación de texto en lenguas de bajos recursos: búlgaro y griego no son idiomas extremadamente minoritarios, pero el modelo demuestra la viabilidad de entrenar modelos multilingües con pocos datos.
- Comparación de estrategias de entrenamiento multilingüe: al existir variantes con otros pares de idiomas (por ejemplo, árabe-griego), permite analizar el impacto del orden y la intercalación de lenguas.
- Educación y experimentación: su tamaño reducido facilita su uso en entornos docentes o de prototipado rápido, sin necesidad de infraestructura de alto rendimiento.
- Evaluación de tokenizadores específicos: el tokenizador propio puede evaluarse en tareas de generación y compararse con tokenizadores multilingües estándar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- No se dispone de datos oficiales sobre VRAM, latencia o throughput.
- Dado su tamaño de 123,9 millones de parámetros y un peso de aproximadamente 1 GB en safetensors, es razonable esperar que la inferencia sea viable en GPUs de consumo con al menos 4 GB de VRAM, así como en CPU con suficiente memoria RAM.
- El modelo es compatible con la librería transformers y puede desplegarse con herramientas como text-generation-inference, vLLM, llama.cpp u Ollama, aunque no se han verificado configuraciones específicas.
- Para entrenamiento o fine-tuning, se recomienda una GPU con al menos 8 GB de VRAM, aunque no se ha confirmado.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa con otros modelos de la misma categoría. Existen variantes del mismo autor con otros pares de idiomas (por ejemplo, `babylm-ara-ell-sequential_interleaved` o `v2-babylm-bul-ell-sequential_interleaved`), pero no se han publicado métricas comparativas.

## Limitaciones y advertencias

- La licencia no está especificada, por lo que el uso comercial del modelo es incierto y requiere verificación con el autor.
- El modelo se entrenó con un corpus limitado (BabyLM), lo que puede implicar un vocabulario restringido y una menor cobertura de dominios especializados.
- No se ha documentado el comportamiento en cuanto a sesgos o alucinaciones; al ser un modelo pequeño, es probable que presente limitaciones en tareas complejas.
- La longitud de contexto no se ha especificado, lo que dificulta planificar su uso en aplicaciones que requieran ventanas largas.
- El modelo solo cubre búlgaro y griego; no es adecuado para otros idiomas sin fine-tuning adicional.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nikitastheo/v3-babylm-bul-ell-sequential_interleaved
- Variante con árabe y griego: https://huggingface.co/nikitastheo/babylm-ara-ell-sequential_interleaved
- Variante anterior con búlgaro y griego: https://huggingface.co/nikitastheo/v2-babylm-bul-ell-sequential_interleaved
- Página oficial de BabyLM: https://babylm.github.io/
- Organización BabyLM en GitHub: https://github.com/babylm-org
