# mrkkucharski/mt3-guitar-pilot

## Resumen

El modelo `mrkkucharski/mt3-guitar-pilot` es un conjunto de checkpoints T5X/Orbax resultantes de un piloto de fine-tuning del sistema MT3 (Multi-Task Multitrack Music Transcription) de Google Magenta, orientado específicamente a la transcripción automática de guitarra. Lo desarrolla Marek Kucharski (usuario `mrkkucharski`) como una prueba de ingeniería para evaluar la viabilidad de adaptar MT3 a un instrumento concreto con un corpus mínimo. No es un modelo listo para producción ni para uso general: se trata de un experimento técnico con solo 500 pasos de entrenamiento adicionales sobre un conjunto de 12 ejemplos.

El repositorio contiene dos checkpoints: `checkpoint_0`, que es el checkpoint oficial de Magenta multi-instrumento (paso 1.000.000) sin modificar, y `checkpoint_1000500`, que es el resultado del fine-tuning piloto. Ambos están en formato T5X/Orbax y no son cargables directamente con la librería `transformers`; requieren el paquete `mt3` de la bifurcación del autor. La licencia es Apache-2.0, lo que permite uso comercial con atribución, aunque el estado experimental del modelo limita su aplicabilidad práctica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | T5X (MT3, transformer encoder-decoder) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (checkpoints T5X/Orbax, sin cuantizacion publicada) |
| Idiomas soportados | no disponible (modelo de audio a simbolos musicales, no textual) |
| Licencia | Apache-2.0 |
| Formato de pesos | T5X/Orbax checkpoints (no safetensors ni GGUF) |

## Arquitectura y entrenamiento

MT3 es un modelo de transcripción musical automática basado en T5X, un framework de Google para transformers. El modelo original de Magenta se entrena de forma multitarea y multiinstrumento, convirtiendo audio en una secuencia de tokens que representan notas, instrumentos y tiempos. El piloto `mt3-guitar-pilot` parte del checkpoint oficial de Magenta (paso 1.000.000) y realiza un fine-tuning de 500 pasos adicionales sobre un corpus reducido de 12 ejemplos de guitarra. No se han publicado detalles sobre el dataset exacto, el número total de tokens de entrenamiento, ni si se aplicaron técnicas como RLHF o DPO. El autor indica en la model card que es un "piloto de ingeniería" y que los resultados no son de calidad, con curvas de entrenamiento y advertencias documentadas en el archivo `PROJECT_LOG.md` del repositorio fuente.

## Capacidades

- Transcripción de audio a notación musical simbólica (notas, instrumentos, tiempos) para guitarra, heredada del modelo MT3 base.
- El checkpoint original (`checkpoint_0`) conserva la capacidad multiinstrumento de MT3, pero el fine-tuning (`checkpoint_1000500`) está orientado exclusivamente a guitarra y con un corpus muy limitado.
- No se ha verificado soporte para tool calling, agentes, razonamiento multi-paso ni capacidades multimodales más allá de la entrada de audio y salida de tokens musicales.
- No hay información sobre capacidades multilingües, ya que la salida es simbólica musical, no texto.

## Casos de uso

- Investigación en transcripción musical automática: el modelo sirve como banco de pruebas para estudiar cómo el fine-tuning de MT3 se adapta a un instrumento específico con pocos datos. Útil para académicos que quieran reproducir o extender el experimento.
- Desarrollo de pipelines de transcripción de guitarra: aunque el piloto no es de calidad, el checkpoint original de MT3 puede usarse como base para fine-tunings más robustos con datasets mayores.
- Evaluación de técnicas de fine-tuning eficiente: el repositorio documenta el proceso de entrenamiento y las curvas de pérdida, lo que permite analizar el comportamiento del modelo con 500 pasos y 12 ejemplos.
- Prototipado de aplicaciones educativas de música: un futuro modelo afinado podría transcribir ejercicios de guitarra para retroalimentación automática, pero este piloto no es adecuado para ello.
- Comparación de checkpoints: el repositorio incluye tanto el checkpoint original como el afinado, facilitando estudios comparativos sobre el efecto del fine-tuning.
- Experimentación con el framework T5X/Orbax: útil para desarrolladores que quieran aprender a restaurar y evaluar checkpoints T5X, ya que el repositorio incluye instrucciones y un paquete `mt3` específico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de precisión, exactitud o comparaciones con otros modelos. El autor advierte explícitamente que el piloto no es un resultado de calidad y que las curvas de entrenamiento están documentadas en el registro del proyecto, pero no se proporcionan números concretos en la ficha.

## Requisitos de hardware

- No se han publicado requisitos específicos de hardware para este piloto.
- Dado que se trata de checkpoints T5X/Orbax de MT3, se espera que la inferencia requiera una GPU con al menos 8-16 GB de VRAM, pero esta estimación no está confirmada por el autor.
- El tamaño del repositorio es de 1,5 GB, lo que sugiere que los checkpoints no son excesivamente grandes, pero el modelo base MT3 (T5-base) suele necesitar alrededor de 2-4 GB en memoria para inferencia en precisión completa.
- No se mencionan opciones de despliegue como vLLM, llama.cpp u Ollama, ya que el formato T5X no es compatible con esos runners. Se requeriría el paquete `mt3` de la bifurcación del autor y un entorno T5X.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de este piloto, por lo que no es posible realizar una comparativa cuantitativa. A nivel cualitativo, se puede comparar con el modelo MT3 original de Magenta, del cual deriva:

| Modelo | Arquitectura | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| mt3-guitar-pilot (este) | T5X (MT3) | no disponible | no disponible | Apache-2.0 | T5X/Orbax |
| MT3 original (Magenta) | T5X (MT3) | no disponible | no disponible | Apache-2.0 | T5X/Orbax |
| MR-MT3 (arxiv 2403.10024) | T5X (MT3 mejorado) | no disponible | no disponible | no disponible | no disponible |

No se conocen otras alternativas comparables en la información proporcionada.

## Limitaciones y advertencias

- Modelo experimental: es un piloto de ingeniería con solo 500 pasos de fine-tuning sobre 12 ejemplos. No es adecuado para tareas de transcripción reales.
- No es cargable con `transformers`: requiere el paquete `mt3` de la bifurcación del autor y el framework T5X/Orbax, lo que limita su integración en stacks estándar.
- Sesgos y alucinaciones: al ser un modelo de transcripción musical, puede producir errores de notas o tiempos, especialmente con datos fuera del corpus de guitarra. No hay evaluación de sesgos.
- Riesgo de sobreajuste: el entrenamiento con un corpus tan pequeño casi con seguridad ha sobreajustado el modelo a esos 12 ejemplos, lo que invalida su generalización.
- Limitaciones de contexto y idioma: no se especifican, pero al ser un modelo de audio, no tiene soporte textual.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero el autor no ofrece garantías de calidad ni soporte. Además, el checkpoint original de Magenta tiene su propia licencia (Apache-2.0), por lo que no hay conflicto.
- Advertencia para producción: no usar en aplicaciones reales sin un fine-tuning adecuado con datos representativos y una evaluación rigurosa.

## Enlaces

- [Hugging Face - mrkkucharski/mt3-guitar-pilot](https://huggingface.co/mrkkucharski/mt3-guitar-pilot)
- [GitHub - magenta/mt3 (repositorio original de MT3)](https://github.com/magenta/mt3)
- [Magenta - Music Transcription with Transformers (blog)](https://magenta.withgoogle.com/transcription-with-transformers)
- [arXiv - MR-MT3: Memory Retaining Multi-Track Music Transcription (paper)](https://arxiv.org/html/2403.10024v1)
