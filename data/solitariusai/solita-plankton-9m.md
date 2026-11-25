# solitariusai/solita-plankton-9m

## Resumen

Solita Plankton 9M es un modelo de lenguaje causal de tipo Transformer, desarrollado por solitariusai, especializado en tailandés y concebido como un experimento de escala muy reducida: 9.212.384 parámetros totales. Emplea un vocabulario byte-level BPE de 16.384 tokens con embeddings atados (tied embeddings) y una longitud de contexto de tan solo 128 tokens, lo que lo sitúa en la categoría de modelos de juguete o de investigación preliminar más que en la de un modelo utilizable en producción.

Su relevancia es limitada y de carácter didáctico: sirve como referencia para estudiar el comportamiento de un Transformer causal entrenado desde cero sobre tailandés con un presupuesto computacional mínimo, y para validar pipelines de entrenamiento (checkpoint con estado del optimizador, scheduler y scaler incluidos). No compite con modelos multilingües de gran escala ni con modelos específicos de tailandés de tamaño medio.

La model card es extremadamente escueta y no documenta composición del dataset, número de tokens de entrenamiento, ni resultados de evaluación. El repositorio ocupa 0,1 GB e incluye el checkpoint de entrenamiento en el paso 500.000 y el tokenizador asociado. Existe una variante orientada a chat, Solita Plankton 9M-IT, publicada por el mismo autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (decoder-only), embeddings atados |
| Parametros totales | 9.212.384 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 128 tokens |
| Tipos de cuantizacion | no disponible (checkpoint PyTorch en precisión de entrenamiento) |
| Idiomas soportados | tailandés (th) |
| Licencia | Apache 2.0 |
| Formato de pesos | checkpoint PyTorch (`.pt`) con pesos, estado AdamW, scheduler, gradient scaler, RNG y cursor de datos; tokenizador en `tokenizer.json` |

## Arquitectura y entrenamiento

Se trata de un Transformer causal estándar (decoder-only) con 9.212.384 parámetros y embeddings atados entre la capa de entrada y la de salida, lo que reduce el recuento de parámetros al compartir la matriz de vocabulario. El tokenizador es byte-level BPE con un vocabulario de 16.384 tokens, un tamaño relativamente grande respecto al número de parámetros del modelo, lo que implica que una fracción significativa de la capacidad se dedica a la representación léxica.

El checkpoint publicado corresponde al paso 500.000 de entrenamiento e incluye el estado completo para reanudar el entrenamiento: pesos del modelo, estado del optimizador AdamW, estado del scheduler de learning rate, gradient scaler (lo que sugiere entrenamiento con precisión mixta), estado del generador de números aleatorios y cursor de datos. La model card no especifica el número de tokens vistos, la composición del corpus, ni si se aplicaron fases de ajuste fino supervisado, RLHF o DPO. No se documentan innovaciones técnicas adicionales (atención lineal, decodificación especulativa, arquitecturas híbridas, etc.).

## Capacidades

- Generación de texto causal en tailandés, limitada a continuaciones de hasta 128 tokens de contexto.
- Modelado de lenguaje a nivel de carácter/byte mediante tokenizador byte-level BPE, lo que evita problemas de vocabulario fuera de dominio en tailandés.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta capacidad multilingüe: el modelo está etiquetado únicamente para tailandés.
- No se documenta modo de razonamiento (thinking), visión, audio ni otras modalidades.
- Existe una variante ajustada para chat (Solita Plankton 9M-IT) publicada por el mismo autor, cuyas capacidades no se detallan en la información disponible.

## Casos de uso

- Experimentación educativa sobre entrenamiento de LLM: el checkpoint incluye estado completo del optimizador y scheduler, lo que permite reproducir y reanudar el entrenamiento para estudiar dinámicas de convergencia en modelos de 9M de parámetros.
- Pruebas de pipelines de tokenización tailandesa: sirve para validar implementaciones de byte-level BPE con vocabulario de 16.384 tokens sobre texto tailandés antes de escalar a modelos mayores.
- Prototipado de infraestructura de inferencia: por su tamaño mínimo, es adecuado para probar integraciones con frameworks de serving en entornos con recursos muy limitados, aunque su contexto de 128 tokens restringe las pruebas a secuencias cortas.
- Generación de texto de relleno o completado muy corto en aplicaciones de demostración en tailandés, donde la calidad lingüística no sea un requisito crítico.
- Investigación sobre el efecto del tamaño de vocabulario en modelos pequeños: permite comparar el equilibrio entre parámetros de embedding y parámetros del cuerpo del Transformer.
- Base para ajuste fino experimental en tareas de clasificación o generación muy acotadas en tailandés, partiendo de un modelo ya expuesto a ese idioma.
- Referencia negativa o línea base en evaluaciones comparativas de modelos tailandeses de mayor tamaño.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en precisión FP32 (9,2M de parámetros equivalen a unos 37 MB de pesos, más overhead de activaciones y tokenizador); en FP16, unos 18 MB de pesos.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM; el modelo es viable incluso en CPU.
- Cabe holgadamente en GPU de consumo: GTX 1050, RTX 2060, RTX 3060, RTX 4090, así como en iGPU y en Raspberry Pi para inferencia en CPU.
- Opciones de despliegue: al estar en formato PyTorch (`.pt`) con estado de entrenamiento, requiere carga manual con `torch.load`; no se proporcionan pesos en safetensors ni GGUF, por lo que no es directamente compatible con llama.cpp, Ollama, vLLM o TGI sin conversión previa.
- Latencia y throughput: no disponibles; por el tamaño del modelo y el contexto de 128 tokens, la latencia sería de milisegundos en GPU y de decenas de milisegundos en CPU, aunque no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Solita Plankton 9M | 9,2M | 128 | tailandés | Apache 2.0 | PyTorch `.pt` |
| Solita Plankton 9M-IT | no disponible | no disponible | tailandés | no disponible | no disponible |
| Alternativas de 9M en tailandés | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre modelos comparables de tamaño similar específicos para tailandés en la documentación proporcionada; la única referencia conocida es la variante IT del mismo autor, cuyas especificaciones no se detallan.

## Limitaciones y advertencias

- Contexto de solo 128 tokens: insuficiente para conversaciones multi-turno, documentos o cualquier tarea que requiera memoria a medio plazo.
- Modelo de 9,2M de parámetros: la capacidad de razonamiento, conocimiento factual y coherencia es muy limitada; no es apto para producción seria.
- Entrenamiento y evaluación no documentados: se desconoce el corpus, el número de tokens vistos y si hubo ajuste por instrucciones, lo que impide evaluar sesgos y calidad.
- Riesgo elevado de alucinación y de generación incoherente, especialmente fuera del dominio de entrenamiento.
- Solo tailandés: no hay evidencia de capacidades en castellano ni en otros idiomas.
- El checkpoint incluye estado del optimizador y del scheduler, lo que aumenta el tamaño del archivo y requiere limpieza antes de un uso de inferencia limpio.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de evaluación y la baja calidad esperada desaconsejan cualquier despliegue comercial sin validación exhaustiva.
- No se ofrecen pesos en formatos estándar de inferencia (safetensors, GGUF), lo que añade fricción operativa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/solitariusai/solita-plankton-9m
- Variante de chat: https://huggingface.co/solitariusai/solita-plankton-9m-it
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- Repositorio del autor en Hugging Face: https://huggingface.co/solitariusai
