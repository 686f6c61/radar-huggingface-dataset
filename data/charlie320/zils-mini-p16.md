# Charlie320/zils-mini-p16

## Resumen

zils-mini-p16 es un modelo de decisión (decision model) publicado por el usuario Charlie320 en Hugging Face, concebido como un "body" (cuerpo de pesos) para el pool de soups `d3-mini` de Zils, asociado a la subnet 127 de Bittensor. Se trata de un fine-tune de Qwen/Qwen3.5-4B en el denominado "chassis layout", distribuido en BF16, con los pesos de lenguaje entrenados y la torre de visión heredada del modelo padre. El modelo tiene 4.539.265.536 parámetros totales según los pesos en safetensors y un repositorio de 9,1 GB.

Técnicamente, el modelo es el resultado de un soup por promedio uniforme de 16 miembros entrenados de forma independiente: fine-tunes completos de la mitad superior con tasas de aprendizaje de 1,5e-6 y 3e-6, junto con LoRAs ancladas de rango 32 y 64, sin extrapolación. Los datos de entrenamiento consisten en ítems de decisión en formato de examen, generados con la receta pública de autoría de Zils (`scripts/author_exam.py`) por Claude Opus y por un modelo abierto local, a partir únicamente de splits públicos de entrenamiento, más las respuestas del profesor de relay público de Zils.

Su relevancia es acotada y muy específica: no es un modelo generalista pensado para producción, sino un componente dentro de un ecosistema de subasta/validación de modelos (Bittensor subnet 127) orientado a tareas de decisión en formato de examen. La model card es explícita al señalar que el repositorio contiene solo pesos y que deben verificarse los términos de los datasets de origen antes de su reutilización.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen/Qwen3.5-4B, "chassis layout"); torre de visión heredada del padre |
| Parámetros totales | 4.539.265.536 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en BF16) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-4B y se construye mediante un *model soup*: promedio uniforme de 16 miembros entrenados de forma independiente. Según la model card, esos miembros combinan fine-tunes completos de la mitad superior del modelo con tasas de aprendizaje de 1,5e-6 y 3e-6, y LoRAs ancladas de rango 32 y 64. No se aplica extrapolación en el promedio. El resultado se distribuye en BF16 con los pesos de lenguaje entrenados y la torre de visión tomada del modelo padre, lo que sugiere que conserva capacidad multimodal de entrada de imagen, aunque no se detalla el alcance de dicha capacidad.

Los datos de entrenamiento son ítems de decisión en formato de examen, redactados con la receta pública de autoría de Zils (`scripts/author_exam.py`) por Claude Opus y por un modelo abierto local, a partir exclusivamente de splits públicos de entrenamiento, más las respuestas del profesor de relay público de Zils. La model card afirma que no se usaron ítems de examen del validador ni ítems semilla públicos. No se especifican el número de tokens de entrenamiento, la composición detallada del dataset ni si hubo etapas de RLHF o DPO; tampoco se documentan innovaciones de decodificación o atención.

## Capacidades

- Generación de texto y razonamiento en formato de ítems de decisión tipo examen, que es el dominio declarado de entrenamiento.
- Entrada multimodal de imagen potencial, al conservar la torre de visión del modelo padre Qwen/Qwen3.5-4B (el alcance exacto no está documentado).
- Herencia de las capacidades del modelo base Qwen/Qwen3.5-4B, si bien el fine-tune está orientado a decisión y no se garantiza el mantenimiento del resto de habilidades.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; la model card no declara idiomas.
- Modo *thinking*, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Evaluación de ítems de decisión en formato de examen: el modelo está entrenado específicamente con este formato, por lo que puede emplearse como evaluador o generador de respuestas en pipelines de validación de la subnet 127 de Bittensor.
- Componente de un pool de soups: sirve como "body" candidato para el pool `d3-mini`, de modo que otros participantes pueden combinarlo o compararlo con otros cuerpos del ecosistema Zils.
- Investigación sobre model souping: al ser un promedio uniforme de 16 miembros con configuraciones de LR y rango de LoRA distintas, es un caso de estudio reproducible para analizar el efecto del promediado de pesos en modelos de 4B.
- Generación de datos sintéticos de examen: la receta de autoría pública permite reutilizar el modelo para producir ítems de decisión adicionales en el mismo formato, siempre que se respeten los términos de los datasets de origen.
- Experimentación con fine-tunes sobre Qwen3.5-4B: al compartir arquitectura y tokenizador con el modelo base, puede integrarse en flujos existentes de ajuste fino y comparación de variantes.
- Pruebas de pipelines multimodales ligeros: la torre de visión heredada permite explorar tareas de imagen-texto en un modelo de 4B, aunque sin garantías documentadas de calidad tras el fine-tune.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 9,1 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, se recomienda al menos 12-16 GB para contexto moderado.
- Cuantización: los pesos se publican en BF16; no se documentan versiones GGUF, AWQ ni GPTQ, por lo que la reducción de VRAM requeriría convertir los pesos a 8 o 4 bits por cuenta propia.
- GPU recomendadas: A100 40 GB, H100 o L40S para despliegues con contexto largo y concurrencia; RTX 4090 (24 GB) o RTX 3090 (24 GB) para inferencia en BF16 de una sola instancia.
- GPU de consumo: cabe en tarjetas de 16 GB o más en BF16 con contexto corto; en tarjetas de 8-12 GB sería necesario cuantizar.
- Opciones de despliegue: vLLM, TGI o llama.cpp/Ollama tras conversión a GGUF; al ser un transformer estándar derivado de Qwen3.5-4B, debería ser compatible con las herramientas habituales, aunque no se ha verificado en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| zils-mini-p16 | 4,54B | no disponible | apache-2.0 | Soup de 16 miembros orientado a decisión; torre de visión heredada |
| Qwen/Qwen3.5-4B | ~4B | no disponible | no disponible en la información | Modelo base del que deriva; capacidades generalistas |
| qhoenix/zils-mini-decision-l13_avg678 | no disponible | no disponible | no disponible | Modelo base declarado, también del ecosistema Zils |
| joamCriff123/zils-mini-sx3 | no disponible | no disponible | no disponible | Modelo base declarado, también del ecosistema Zils |

## Limitaciones y advertencias

- El modelo está especializado en ítems de decisión en formato de examen; su rendimiento fuera de ese dominio no está documentado y probablemente sea inferior al del modelo base.
- No se declaran idiomas soportados, por lo que el comportamiento multilingüe es incierto.
- No hay benchmarks publicados, lo que impide comparar su calidad de forma objetiva con alternativas.
- Riesgo de alucinación inherente a los modelos generativos; en tareas de decisión, una respuesta incorrecta puede ser difícil de detectar sin validación externa.
- La model card advierte de que el repositorio contiene solo pesos y de que deben comprobarse los términos de los datasets de origen antes de su reutilización; parte de los datos se generaron con Claude Opus, lo que puede implicar condiciones adicionales.
- No se documenta el proceso de alineación (RLHF/DPO) ni filtros de seguridad, por lo que no se recomienda su uso directo en producción orientada a usuarios finales sin evaluación previa.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación comunitaria.
- La licencia apache-2.0 permite uso comercial, pero esa cobertura se aplica a los pesos publicados, no necesariamente a los datos de entrenamiento subyacentes.

## Enlaces

- Hugging Face: https://huggingface.co/Charlie320/zils-mini-p16
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Modelo base declarado: https://huggingface.co/qhoenix/zils-mini-decision-l13_avg678
- Modelo base declarado: https://huggingface.co/joamCriff123/zils-mini-sx3
