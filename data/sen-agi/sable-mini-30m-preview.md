# SEN-AGI/sable-mini-30m-preview

## Resumen

Sable-Mini-30M-Preview es un modelo de lenguaje causal de 30 millones de parámetros desarrollado por SEN-AGI, diseñado como parte de la familia Sable de modelos pequeños. Su objetivo es ofrecer una generación de texto compacta y eficiente, equilibrando tamaño reducido con capacidades básicas de generación. Se trata de una versión preliminar (preview) que el autor presenta como base para futuras iteraciones.

El modelo emplea una arquitectura tipo Llama (decoder-only) y ha sido entrenado con aproximadamente 3-4 mil millones de tokens. Con un vocabulario de 24 000 tokens, está orientado exclusivamente al inglés. Su relevancia actual radica en su tamaño extremadamente reducido, lo que permite su ejecución en entornos con recursos limitados, como dispositivos embebidos o experimentación educativa, aunque su rendimiento en tareas complejas es limitado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Llama-style decoder (causal LM) |
| Parámetros totales | 31 171 072 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura de decoder causal estilo Llama, con capas de atención y feed-forward típicas de los transformers generativos. No se especifican detalles sobre el número de capas, dimensiones ocultas o cabezas de atención. El entrenamiento se realizó sobre un corpus de aproximadamente 3-4 mil millones de tokens, aunque no se detalla la composición del dataset ni si se aplicaron técnicas de alineación como RLHF o DPO. Tampoco se mencionan innovaciones técnicas particulares como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto: produce texto coherente en inglés, aunque con limitaciones propias de su tamaño.
- Completado de frases: puede continuar secuencias de texto de forma básica.
- Modelo causal: adecuado para tareas de generación autoregresiva.
- No se han documentado capacidades de tool calling, agentes, razonamiento multi-paso, visión o audio.
- Multilingüismo: solo inglés, sin soporte para otros idiomas.

## Casos de uso

- Experimentación educativa: ideal para estudiantes que deseen comprender el funcionamiento interno de un modelo de lenguaje pequeño, dado su tamaño reducido y facilidad de ejecución en CPU.
- Prototipado rápido: permite validar pipelines de generación de texto en entornos de desarrollo sin necesidad de hardware potente.
- Generación de texto corto: útil para tareas simples como completar frases, generar titulares o producir contenido breve en inglés.
- Pruebas de integración: sirve como modelo de prueba para integrar transformers en aplicaciones móviles o embebidas donde la memoria es limitada.
- Investigación en modelos pequeños: base para estudiar el impacto del escalado en modelos de menos de 100M parámetros.
- Benchmarking de frameworks: permite comparar el rendimiento de librerías de inferencia (vLLM, llama.cpp, etc.) con un modelo ligero.

## Benchmarks y rendimiento

Según la model card, el modelo fue evaluado con el LM Evaluation Harness. Los resultados son los siguientes:

| Benchmark | Accuracy | Métrica |
|---|---|---|
| BoolQ | 57,5% | acc |
| PIQA | 57,8% | acc_norm |
| WinoGrande | 53,3% | acc |
| ARC-Easy | 39,0% | acc_norm |
| HellaSwag | 28,1% | acc_norm |
| Lambada | 11,7% | acc |

Estos valores indican un rendimiento modesto, esperable para un modelo de 30M de parámetros. No se proporcionan comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada: con 31M de parámetros, en fp32 ocupa aproximadamente 124 MB; en fp16, unos 62 MB; en int8, unos 31 MB. Cabe en cualquier GPU moderna e incluso en CPU.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM es suficiente; también puede ejecutarse en CPU sin problemas.
- Compatibilidad con GPU de consumo: sí, funciona en tarjetas como GTX 1050, RTX 2060, etc.
- Opciones de despliegue: compatible con Hugging Face Transformers, llama.cpp, Ollama y otros frameworks que soporten modelos de este tamaño.
- Latencia y throughput: no se han publicado datos específicos, pero al ser un modelo tan pequeño, la inferencia es muy rápida, incluso en CPU.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. Se recomienda consultar benchmarks externos para comparar con otros modelos de tamaño similar, como TinyLlama o GPT-2 pequeño, aunque no se ofrecen datos concretos aquí.

## Limitaciones y advertencias

- Versión preliminar: no recomendado para uso en producción; es una preview que puede tener errores y mejoras en futuras versiones.
- Conocimiento limitado: al ser un modelo de 30M de parámetros, su conocimiento del mundo es muy restringido y puede generar información incorrecta o desactualizada.
- Sesgos: el modelo puede producir salidas sesgadas o inapropiadas, como se indica en la model card.
- Idioma: solo soporta inglés; no es adecuado para tareas multilingües.
- Contexto: no se especifica la longitud máxima de contexto, lo que limita su uso en tareas que requieran ventanas largas.
- Licencia: Apache 2.0 permite uso comercial y de investigación, pero al ser una preview, se recomienda precaución.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/SEN-AGI/sable-mini-30m-preview)
- [LM Evaluation Harness](https://github.com/EleutherAI/lm-evaluation-harness) (herramienta usada para los benchmarks)
