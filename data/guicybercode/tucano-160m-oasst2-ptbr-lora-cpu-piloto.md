# guicybercode/tucano-160m-oasst2-ptbr-lora-cpu-piloto

## Resumen

Tucano-160m-oasst2-ptbr-lora-cpu-piloto es un adaptador LoRA de carácter experimental publicado por el usuario guicybercode sobre el modelo base TucanoBR/Tucano-160m, un transformer de arquitectura Llama con 162.417.408 parámetros desarrollado por el proyecto TucanoBR y distribuido bajo licencia Apache-2.0. El adaptador se entrena exclusivamente en CPU y su objetivo declarado es reproducir de forma abierta un ajuste de instrucciones cortas en portugués brasileño, no construir un asistente utilizable en producción.

El problema que aborda es la reproducibilidad de experimentos de ajuste fino en entornos sin GPU: el autor publica el adaptador junto con el código, las métricas y las generaciones comparadas antes y después del entrenamiento. El conjunto de datos empleado es OpenAssistant/oasst2 (Apache-2.0), del que se extraen 94 pares de entrenamiento. La ventana de contexto del modelo base no se detalla en la información disponible; al derivarse de la arquitectura Llama de Tucano-160m, conviene consultar la model card del modelo base para confirmar el valor exacto.

La relevancia de esta ficha es acotada y debe entenderse como tal: el propio autor advierte que la loss de validación y test disminuye, pero las respuestas generadas siguen siendo incorrectas en ejemplos sencillos. Se trata, por tanto, de un artefacto de investigación para inspeccionar fallos y comparar comportamiento base frente a LoRA, no de un modelo listo para uso general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo Llama (modelo base TucanoBR/Tucano-160m); adaptador LoRA sobre atención y proyecciones |
| Parametros totales | 162.417.408 (modelo base); el adaptador LoRA añade un número de parámetros no disponible en la información |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada |
| Tipos de cuantizacion | no disponible; el autor evalúa en float32 sin autocast y entrena bajo autocast bfloat16 |
| Idiomas soportados | portugués (pt), con orientación específica a portugués brasileño |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Tucano-160m, un modelo de 162 millones de parámetros con arquitectura Llama y licencia Apache-2.0, en la revisión `6331cbef9933c05d8d0c8ae5ee23ed2570f06571`. La técnica de ajuste es LoRA (Low-Rank Adaptation) mediante la librería PEFT, con entrenamiento íntegramente en CPU. El autor descarta explícitamente el Tucano-630m y los modelos Instruct oficiales (que comienzan en 1.1B) para mantener el experimento pequeño y ejecutable sin GPU, y señala que el proyecto original ya apunta a la serie Tucano 2 de Polygl0t, mientras que este piloto usa la primera serie.

Los datos provienen de OpenAssistant/oasst2 (revisión `179dd21fc55192153d94adb0e0ce8f69e222bf75`, archivo `2023-11-05_oasst2_ready.messages.jsonl.gz`), del que se emplean 94 pares de entrenamiento. El checkpoint publicado corresponde a la época 2, seleccionada por la menor loss de validación medida durante el entrenamiento bajo autocast bfloat16 entre seis épocas. No hubo búsqueda de hiperparámetros ni más de una semilla. La evaluación final se realiza en float32 sin autocast, con loss de siguiente token calculada solo sobre los tokens de respuesta (incluido EOS), enmascarando instrucción y padding, y ponderada por el número de tokens de respuesta. No se documenta en la información disponible el uso de RLHF o DPO.

## Capacidades

- Generación de texto en portugués brasileño a partir de instrucciones cortas, con respuestas de extensión limitada (el autor fija un máximo de 80 tokens nuevos en la evaluación).
- Ajuste de estilo de respuesta: los ejemplos publicados muestran que el adaptador abandona el modo de repetición del modelo base y produce salidas más cohesionadas, aunque no necesariamente correctas.
- Capacidad de razonamiento elemental muy limitada: en el ejemplo del acertijo de los tres hijos, el adaptador responde "Bruno" cuando la respuesta esperada es "Pedro".
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta capacidad multilingüe más allá del portugués; el modelo base podría tener nociones de otros idiomas, pero no se evalúa.
- No se documenta modo thinking, visión ni audio.
- El adaptador está pensado como artefacto de reproducibilidad: permite cargar base y adaptador por separado y comparar generaciones con el mismo tokenizer y los mismos prompts.

## Casos de uso

- Reproducción de experimentos de ajuste fino sin GPU: el repositorio incluye código, `metrics.json`, `verification.json` y `generations.json`, de modo que un investigador puede reentrenar el adaptador en CPU y verificar que las cuatro losses se reproducen con tolerancia de 1e-6.
- Docencia sobre LoRA y PEFT: sirve para ilustrar en clase cómo se comporta un adaptador de bajo rango sobre un modelo pequeño, comparando salidas base y ajustadas con instrucciones reales de oasst2.
- Auditoría de fallos de alineación en modelos pequeños: los ejemplos publicados (acertijo lógico, corrección gramatical, definición de rimas) permiten estudiar modos de fallo típicos como la sustitución de entidades o la respuesta genérica.
- Estudio de la brecha entre loss y corrección factual: el autor mide loss de validación y test y demuestra que la mejora de perplexidad no implica respuestas correctas, lo que constituye un caso práctico para discutir métricas de evaluación.
- Verificación de pipelines de evaluación en float32 frente a bfloat16: el repositorio documenta que la selección del checkpoint se hizo bajo autocast bfloat16 y la evaluación final en float32, útil para comprobar la estabilidad numérica de un harness propio.
- Base para experimentos comparativos a mayor escala: el autor menciona Tucano-630m y la serie Tucano 2 de Polygl0t como alternativas; este piloto puede servir de línea base de bajo coste antes de escalar a esos modelos.
- Prototipado docente de asistentes en portugués brasileño con expectativas explícitamente limitadas: útil para mostrar a estudiantes por qué un adaptador de 94 pares no basta para un asistente fiable.

## Benchmarks y rendimiento

El autor publica métricas de loss y perplejidad sobre conjuntos de validación y test, medidas en float32 sin autocast, con loss de siguiente token solo en la respuesta (incluido EOS) y promedio ponderado por tokens de respuesta. No son métricas de exactitud ni de corrección factual.

| Conjunto | Ejemplos | Tokens de respuesta | Loss base | Loss LoRA | PPL base | PPL LoRA |
|---|---:|---:|---:|---:|---:|---:|
| Validación | 12 | 1.522 | 2,3569 | 2,2422 | 10,5577 | 9,4140 |
| Test retenido | 12 | 1.907 | 2,4296 | 2,3473 | 11,3544 | 10,4572 |

Advertencias del propio autor: una única semilla, sin búsqueda de hiperparámetros, y un test de solo 12 ítems que no sostiene conclusiones sobre rendimiento general. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- Inferencia en CPU: el autor entrena y evalúa sin GPU; el modelo base de 162 millones de parámetros en float32 ocupa aproximadamente 650 MB de pesos, más el adaptador LoRA, cuya huella exacta no se detalla.
- VRAM estimada para GPU: no disponible en la información proporcionada; por el tamaño del modelo base, cabría en GPUs de consumo con holgura, pero no se aportan medidas.
- GPU recomendadas: no disponibles; el proyecto no las emplea.
- Cabe en GPU de consumo: previsiblemente sí por el tamaño del modelo base, aunque no se documenta ni se mide.
- Opciones de despliegue: PEFT y Transformers (librería declarada en la model card); no se documentan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; no se cronometran en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Tucano-160m-oasst2-ptbr-lora-cpu-piloto | 162,4 M (base) + LoRA | no disponible | Apache-2.0 | Hugging Face, 0 descargas, 0 likes | Adaptador experimental; respuestas no fiables según el autor |
| TucanoBR/Tucano-160m | 162,4 M | no disponible en esta ficha | Apache-2.0 | Hugging Face, modelo base | Sin ajuste de instrucciones; el autor lo usa como referencia |
| Tucano-630m | no disponible en esta ficha | no disponible | no disponible en esta ficha | Hugging Face, mencionado por el autor | Descartado por el autor para mantener el experimento en CPU |
| Tucano Instruct oficial (desde 1.1B) | ≥ 1,1 B | no disponible en esta ficha | no disponible en esta ficha | Hugging Face, mencionado por el autor | Alternativa de mayor tamaño con ajuste de instrucciones oficial |

La información disponible no permite comparar rendimiento en benchmarks estándar con estas alternativas.

## Limitaciones y advertencias

- El propio autor declara que el modelo "no es un asistente listo": la loss baja, pero las respuestas siguen siendo erróneas en ejemplos simples, incluido un acertijo lógico elemental.
- Riesgo alto de alucinación y de sustitución de entidades: en el ejemplo 1 responde "Bruno" cuando la respuesta esperada es "Pedro".
- Las respuestas sobre definiciones (por ejemplo, rimas ricas y pobres) no explican el criterio gramatical y son superficiales.
- El conjunto de entrenamiento es muy reducido (94 pares) y el test tiene solo 12 ítems, por lo que las métricas no son representativas.
- Una única semilla y ausencia de búsqueda de hiperparámetros limitan la validez de cualquier conclusión sobre el método.
- No se ha medido mejora factual ni de seguridad; las métricas publicadas miden ajuste a las referencias, no corrección.
- El soporte de idioma se limita al portugués brasileño según la model card; no se evalúan otros idiomas.
- La licencia Apache-2.0 permite uso comercial del adaptador, pero el estado experimental y la falta de fiabilidad desaconsejan cualquier despliegue en producción.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validación externa conocida.
- No se documenta la longitud de contexto efectiva del modelo base en esta información; debe consultarse la model card de TucanoBR/Tucano-160m antes de usarlo con prompts largos.

## Enlaces

- Hugging Face del adaptador: https://huggingface.co/guicybercode/tucano-160m-oasst2-ptbr-lora-cpu-piloto
- Modelo base TucanoBR/Tucano-160m: https://huggingface.co/TucanoBR/Tucano-160m
- Dataset OpenAssistant/oasst2: https://huggingface.co/datasets/OpenAssistant/oasst2
- Paper referenciado (arXiv:2411.07854): https://arxiv.org/abs/2411.07854
- Paper referenciado (arXiv:2304.07327): https://arxiv.org/abs/2304.07327
