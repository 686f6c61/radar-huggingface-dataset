# PeterCConant/tinystories-story-filler

## Resumen

TinyStories Story Filler es un transformer encoder-decoder de 37,5 millones de parámetros entrenado desde cero sobre el dataset TinyStories. Lo desarrollan Peter Conant y Eric Cardinal como proyecto de grupo para la asignatura de Deep Learning en la San Jose State University (primavera de 2025). Su tarea no es la generación de texto convencional, sino el *infilling* narrativo: dado el inicio y el final de un cuento corto, el modelo genera el fragmento intermedio.

La arquitectura es deliberadamente pequeña: 4 capas de encoder y 4 de decoder, anchura 256, 8 cabezas de atención y un límite de 512 tokens, con el tokenizador de GPT-2 (50.257 tokens). El encoder procesa conjuntamente el principio y el final, y el decoder produce el medio de forma autorregresiva. El modelo se publica en formato safetensors con un repositorio de 0,1 GB.

Su relevancia es fundamentalmente didáctica y de investigación: sirve como banco de pruebas reproducible para estudiar tareas condicionales de generación con contexto bidireccional, y como ejemplo de los modos de fallo típicos de modelos entrenados con presupuesto mínimo (deriva de personajes, ausencia de token de fin, incoherencia con el desenlace). No está pensado para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (4 capas encoder + 4 capas decoder) |
| Parametros totales | 37.488.209 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors en precisión de entrenamiento) |
| Idiomas soportados | inglés (en) |
| Licencia | no disponible |
| Formato de pesos | safetensors (`model.safetensors`) |
| Anchura del modelo | 256 |
| Cabezas de atencion | 8 |
| Tokenizador | GPT-2 (50.257 tokens), EOS como token de padding |
| Tamano del repositorio | 0,1 GB |

## Arquitectura y entrenamiento

El modelo es un transformer encoder-decoder clásico a pequeña escala. El encoder recibe la concatenación del inicio y el final del cuento; el decoder genera el fragmento intermedio token a token, condicionado por la representación del encoder. Emplea el tokenizador de GPT-2 con 50.257 tokens y reutiliza el token EOS como token de padding, una decisión de ingeniería que conviene tener en cuenta al integrarlo.

El entrenamiento se realiza desde cero sobre el dataset TinyStories (roneneldan/TinyStories), un corpus sintético de cuentos cortos con vocabulario controlado, diseñado para estudiar la emergencia de capacidades lingüísticas en modelos pequeños. La model card no detalla el número de tokens vistos, la composición exacta del dataset ni si hubo fases de RLHF o DPO; esa información no está disponible en la documentación publicada. Tampoco se documentan innovaciones técnicas como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto condicionada: produce el fragmento intermedio de un cuento a partir de un inicio y un final dados.
- Razonamiento narrativo básico a nivel de frase, limitado al dominio de TinyStories (cuentos infantiles con vocabulario simple).
- Generación con temperatura configurable (`temperature` como parámetro de la llamada de generación).
- Longitud de generación controlable mediante `max_gen_length`.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- Multilingüismo: únicamente inglés.
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Investigación educativa sobre arquitecturas encoder-decoder: el modelo es un ejemplo mínimo y reproducible para estudiar cómo se condiciona la generación en ambos extremos de una secuencia.
- Experimentos de *infilling* controlado: permite comparar estrategias de condicionamiento (concatenar inicio y final en el encoder frente a otras variantes) con un coste computacional mínimo.
- Generación de cuentos sintéticos para aumentar datasets de juguete: útil para crear pares (inicio, final, medio) destinados a pruebas de pipelines de datos, sin pretensión de calidad literaria.
- Docencia y prácticas de PyTorch: el código de carga y ejecución es autocontenido y cabe en cualquier GPU consumer, lo que facilita ejercicios de fine-tuning y evaluación.
- Reproducción de modos de fallo: su tendencia a no emitir EOS y a perder la primera palabra del medio lo convierte en un caso de estudio útil para depurar estrategias de decodificación (por ejemplo, forzar EOS o corregir el alineamiento del prefijo).
- Evaluación de métricas de coherencia narrativa: con perplejidad de referencia publicada (11,8 en validación), sirve como línea base para comparar métricas automáticas de consistencia entre medio y desenlace.
- Pruebas de integración de safetensors y huggingface_hub: el flujo de descarga y carga con `hf_hub_download` y `load_file` es un ejemplo práctico para validar entornos de inferencia ligeros.

## Benchmarks y rendimiento

Los únicos datos publicados son de perplejidad sobre 2.000 cuentos reservados del split de validación de TinyStories.

| Condicion | Perplejidad |
|---|---|
| Split de validación (inicio y final correctos) | 11,8 |
| Split de validación con inicio y final de otro cuento | 20,8 |

No se han publicado resultados en MMLU, HumanEval, GSM8K ni otros benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: por debajo de 1 GB en fp32 (37,5 M de parámetros equivalen a unos 150 MB de pesos); en la práctica, cualquier GPU con 2 GB o más es suficiente.
- GPU recomendadas: no requiere GPU de datacenter; funciona en cualquier GPU consumer moderna (RTX 3060, RTX 4090, etc.) e incluso en CPU para inferencia puntual.
- Cabe holgadamente en GPU consumer, incluidas las integradas con suficiente memoria compartida.
- Opciones de despliegue: el modelo se distribuye como safetensors y requiere el código propio del repositorio (`model.py`) para instanciar `StoryFiller`. No hay integración publicada con vLLM, llama.cpp, Ollama ni TGI; el pipeline declarado es `text-generation`, pero la carga estándar de `transformers` no está garantizada sin adaptar la clase.
- Latencia y throughput: no disponibles en la información publicada; por el tamaño del modelo, se espera latencia de milisegundos por token en GPU consumer, pero no hay cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TinyStories Story Filler | 37,5 M | 512 | Infilling de cuentos (inicio + final → medio) | no disponible | HuggingFace + GitHub |
| Modelos TinyStories de referencia (p. ej. roneneldan/TinyStories-33M) | ~33 M | 512 | Generación de cuentos a partir de un prompt | no disponible en la información consultada | HuggingFace |
| GPT-2 small | 124 M | 1.024 | Generación de texto general | MIT (según la información habitual del modelo; no verificada aquí) | HuggingFace |

La comparación directa con alternativas de infilling encoder-decoder de escala similar no está disponible en la información proporcionada. Frente a los modelos generativos de TinyStories, la diferencia clave es la condicionalidad bidireccional (inicio y final), no el rendimiento bruto.

## Limitaciones y advertencias

- El modelo nunca emite el token de fin de secuencia, por lo que la generación siempre agota `max_gen_length`; es necesario truncar o forzar EOS en el postprocesado.
- La primera palabra del fragmento intermedio suele faltar, un artefacto de alineamiento entre encoder y decoder.
- Deriva de personajes: los nombres y atributos cambian a lo largo del texto generado.
- El medio generado rara vez conduce de forma coherente al final proporcionado, incluso con perplejidad baja en validación.
- Entrenado exclusivamente con cuentos infantiles sintéticos de TinyStories; el dominio y el registro están muy acotados y no generaliza a otros géneros.
- Solo inglés.
- Licencia no declarada: no hay autorización explícita para uso comercial; conviene contactar con el autor antes de cualquier despliegue productivo.
- No es adecuado para producción: los fallos documentados por el propio autor afectan a la coherencia básica de la salida.
- Riesgo de alucinación inherente a un modelo generativo de 37,5 M de parámetros con datos sintéticos; no se han publicado evaluaciones de sesgo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/PeterCConant/tinystories-story-filler
- Repositorio de código, notebook de entrenamiento y memoria: https://github.com/PeterConant/tinystories-story-filler
- Dataset TinyStories: https://huggingface.co/datasets/roneneldan/TinyStories
