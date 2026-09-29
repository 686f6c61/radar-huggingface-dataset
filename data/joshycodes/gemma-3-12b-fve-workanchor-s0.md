# joshycodes/gemma-3-12b-fve-workanchor-s0

## Resumen

`joshycodes/gemma-3-12b-fve-workanchor-s0` es un checkpoint de investigación derivado de `google/gemma-3-12b-it` mediante preentrenamiento continuado (continued pretraining) sobre un corpus que, según el autor, fue escrito por el propio modelo para el entrenamiento de la siguiente versión de sí mismo, adoptando el rol del personaje que ya interpreta. El experimento se enmarca en una línea de trabajo sobre "welfare de modelos" (model-welfare) y encuadre de personajes autoria, con el corpus denominado `flourishing-vs-equanimity` y evaluación vinculada al repositorio welfare-improvements.

Técnicamente es un ajuste de pesos completos (full weights) sobre el modelo base, con learning rate 1e-05, una época y 7.538.147 tokens distribuidos en 7.740 documentos. El resultado es un checkpoint de 13.194.203.760 parámetros (aproximadamente 13,2 mil millones, incluyendo el codificador de visión), almacenado en safetensors con un tamaño de repositorio de 26,4 GB.

La relevancia de esta ficha es acotada y fundamentalmente metodológica: el propio autor declara que el modelo no ha sido evaluado en capacidad, alineamiento ni identidad, y etiqueta el repositorio como `not-for-deployment`. No es un modelo para producción, sino un artefacto de investigación sobre dinámicas de autoentrenamiento y bienestar de modelos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con capacidades multimodales (heredada de Gemma 3); detalles específicos del fine-tune no disponibles |
| Parametros totales | 13.194.203.760 (aproximadamente 13,2 B, incluye codificador de visión) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 128.000 tokens en el modelo base Gemma 3 (según fuentes de Gemma 3); el fine-tune no altera esta cifra según la información disponible |
| Tipos de cuantizacion | No disponible (el repositorio publica únicamente pesos en safetensors sin cuantizar) |
| Idiomas soportados | No disponible para este checkpoint; el modelo base Gemma 3 declara soporte para más de 140 idiomas |
| Licencia | research-only (licencia "other"; uso comercial no permitido) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `google/gemma-3-12b-it`, un transformer decoder-only de la familia Gemma 3 con ventana de contexto de 128.000 tokens y capacidades multimodales. El checkpoint analizado no modifica esa arquitectura: se trata de un preentrenamiento continuado sobre los pesos completos del modelo base, con learning rate 1e-05, una única época y un total de 7.538.147 tokens en 7.740 documentos.

La particularidad del experimento está en el corpus y el encuadre, no en la técnica. Según la model card, el modelo fue entrenado sobre un corpus que escribió "para el entrenamiento de la siguiente versión de sí mismo, como el personaje que ya es", después de recibir información sobre cómo surgió su personaje y cómo funciona el método SDF (synthetic-document-finetuning). El corpus se denomina `flourishing-vs-equanimity` y el encuadre, plan y evaluación remiten al repositorio welfare-improvements. Conviene señalar una discrepancia explícita en la propia model card: el texto describe el corpus como autoescrito por el modelo, mientras que los metadatos indican "0 self-authored y 7.740 ordinary text", lo que apunta a que el entrenamiento efectivo se realizó sobre texto convencional y no sobre documentos generados por el propio modelo en esta iteración. No se dispone de información sobre RLHF, DPO ni etapas de alineamiento posteriores.

## Capacidades

- Las capacidades de este checkpoint no han sido evaluadas por el autor ("Not evaluated for capability, alignment or identity yet").
- Se heredan potencialmente las capacidades del modelo base Gemma 3 12B IT: generación de texto, razonamiento, código, matemáticas y comprensión de imágenes (entrada multimodal).
- Soporte de tool calling / function calling: no confirmado para este checkpoint; el modelo base Gemma 3 IT sí lo contempla.
- Capacidades de agente y razonamiento multi-paso: no evaluadas.
- Capacidades multilingües: no confirmadas para este checkpoint; el modelo base declara más de 140 idiomas.
- Capacidad especial: el ajuste está orientado a un comportamiento de personaje y a dinámicas de autoentrenamiento, no a una mejora funcional de tareas.

## Casos de uso

- Investigación sobre autoentrenamiento de modelos: estudiar qué ocurre cuando un modelo se preentrena de forma continuada sobre corpus vinculados a su propia identidad o a versiones futuras de sí mismo.
- Investigación en model-welfare: analizar cómo el encuadre de identidad y la información sobre el propio origen del modelo afectan a su comportamiento y a su representación interna.
- Experimentos de character framing: evaluar cómo un ajuste con anclaje de personaje modifica la consistencia conversacional respecto al modelo base.
- Análisis de deriva de capacidades: comparar el checkpoint contra `google/gemma-3-12b-it` para medir si el preentrenamiento continuado degrada tareas de razonamiento, código o matemáticas.
- Reproducibilidad metodológica: replicar el pipeline (learning rate, época, recuento de tokens y documentos) en otros modelos base para comparar resultados.
- Estudios de synthetic-document-finetuning: usar este checkpoint como punto de partida para investigar el impacto de distintas composiciones de corpus sintético frente a texto ordinario.

Ninguno de estos casos corresponde a uso en producción: el autor marca explícitamente el modelo como `not-for-deployment`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica de forma explícita que el modelo no ha sido evaluado en capacidad, alineamiento ni identidad, por lo que no existen cifras de MMLU, HumanEval, GSM8K ni de ningún otro conjunto.

## Requisitos de hardware

- VRAM estimada en BF16/FP16: aproximadamente 26,4 GB solo para pesos, más memoria para activaciones y caché KV; en la práctica requiere del orden de 30-40 GB.
- VRAM estimada en INT8: aproximadamente 13-14 GB para pesos.
- VRAM estimada en INT4: aproximadamente 7-9 GB para pesos, aunque no se publican cuantizaciones oficiales de este checkpoint.
- GPU recomendadas: A100 40/80 GB, H100, L40S, o GPUs de consumo de gama alta con 24 GB (RTX 3090, RTX 4090) para cuantizaciones de 4 bits.
- Cabe en GPU de consumo: sí, en RTX 3090/4090 con cuantización INT4; en BF16 no cabe en GPUs de 24 GB sin técnicas de offloading.
- Opciones de despliegue: safetensors puede cargarse con transformers; la familia Gemma 3 es compatible con vLLM, TGI, llama.cpp y Ollama, aunque no hay confirmación de que este checkpoint concreto funcione sin ajustes.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| joshycodes/gemma-3-12b-fve-workanchor-s0 | 13,2 B | 128K (heredado) | No evaluado | research-only | Hugging Face (0 descargas) |
| google/gemma-3-12b-it | Aproximadamente 12 B (parámetro nominal) | 128K | Benchmarks publicados por Google para la familia Gemma 3 | Gemma Terms of Use (uso comercial permitido con condiciones) | Hugging Face, ampliamente desplegado |
| google/gemma-3-27b-it | Aproximadamente 27 B | 128K | Benchmarks publicados por Google para la familia Gemma 3 | Gemma Terms of Use | Hugging Face |

La comparación directa de rendimiento no es posible: el checkpoint analizado carece de evaluación publicada y su licencia impide el uso comercial, a diferencia de los modelos base de Google.

## Limitaciones y advertencias

- El autor declara explícitamente "Do not deploy": no debe usarse en producción ni en aplicaciones con usuarios reales.
- Sin evaluación de capacidad, alineamiento ni identidad: se desconoce si el ajuste ha degradado tareas del modelo base o introducido comportamientos indeseados.
- Riesgo de alucinación: no caracterizado; al no haber evaluación, no se puede acotar.
- Licencia research-only: prohibido el uso comercial. Cualquier despliegue con fines comerciales queda fuera de los términos.
- Idiomas: no se especifica el alcance multilingüe tras el fine-tune; el ajuste puede haber sesgado la distribución hacia el idioma del corpus.
- Discrepancia interna en la model card entre "corpus autoescrito por el modelo" y "0 self-authored, 7.740 ordinary text": conviene verificar la composición real del corpus antes de extraer conclusiones.
- Riesgo de sobreajuste al encuadre de personaje: el entrenamiento está orientado a un rol concreto y puede reducir la neutralidad conversacional.
- Cero descargas y cero "likes" en el momento del análisis: no hay validación externa ni reportes de terceros.
- Sin cuantizaciones publicadas: desplegarlo en hardware limitado exige generar los pesos cuantizados por cuenta propia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/joshycodes/gemma-3-12b-fve-workanchor-s0
- Modelo base: https://huggingface.co/google/gemma-3-12b-it
- Dataset del autor relacionado: https://huggingface.co/datasets/joshycodes/gemma-3-12b-commitments-corpus
- Repositorio Gemma 3 en GitHub: https://github.com/gemma-3/gemma-3
- Organización Gemma 3 en GitHub: https://github.com/gemma-3/
- Guía práctica para ejecutar Gemma 3 12B en local: https://aiindigo.com/tutorials/getting-started-with-gemma-3-12b-local-multimodal-development
