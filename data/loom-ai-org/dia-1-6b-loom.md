# loom-ai-org/dia-1.6b-loom

## Resumen

Dia-1.6B es un modelo de síntesis de voz (TTS) orientado a diálogo, desarrollado originalmente por Nari Labs y exportado al ecosistema loom.cpp por loom-ai-org. El modelo no genera audio directamente: recibe texto y emite tokens de códec neuronal (DAC a 44 kHz), que un códec separado (`dac-44khz-loom`) convierte en forma de onda. Esta separación permite cachear, editar o decodificar los códigos en otro lugar, y deja que un único códec sirva a varios modelos de la misma familia.

El checkpoint exportado conserva los pesos originales sin modificar (1.611.160.650 parámetros, F32) y los empaqueta en un único GGUF autodescriptivo que incluye las topologías de grafo, el tokenizador y el script controlador. Está pensado para ejecutarse con `loom-py-rt` (familia 10: texto de entrada, tokens de códec de salida) y soporta tanto inferencia por lotes como streaming encadenado con el decodificador.

Su relevancia actual es doble: por un lado, ofrece TTS conversacional con etiquetas de hablante (`[S1]`, `[S2]`) y marcas no verbales como `(laughs)`; por otro, sirve como referencia de formato para el ecosistema loom.cpp, que busca empaquetar modelos multimodales en artefactos GGUF autocontenidos. La contrapartida es una varianza de muestreo muy alta y un tamaño de descarga considerable (6,4 GB en F32).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base TTS de Nari Labs; export GGUF para loom.cpp) |
| Parametros totales | 1.611.160.650 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F32 en el repo publicado; Q8_0 disponible mediante `loom-export --quantize Q8_0` sobre el checkpoint original (~1,8 GB) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 (heredada del modelo base) |
| Formato de pesos | GGUF (`dia-1.6b.gguf`) |
| Libreria de inferencia | loom-py-rt (PyPI, `>=1.0.0`) |
| Pipeline | text-to-speech (texto a tokens de códec) |
| Tamano del repo | 12,9 GB |
| Tamano del artefacto principal | 6,4 GB (F32) |
| Modelo base | nari-labs/Dia-1.6B |
| Frecuencia de frames | 86,13 frames de audio por segundo |
| Codebooks de salida | 9 flujos (DAC) |
| Muestreo por defecto | temperature 1.8, top_k 50, top_p 0.9, guidance_scale 3.0 |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base más allá de su naturaleza TTS y de su salida en tokens de códec. El export de loom.cpp no modifica los pesos: los empaqueta en un GGUF que declara sus propias topologías de grafo, el tokenizador (si lo hay) y un script controlador que documenta todos los argumentos aceptados. El modelo pertenece a la "familia 10" del ecosistema loom.cpp: entrada de texto, salida de tokens de códec neuronal, con el códec como pieza separada.

El entrenamiento original corresponde a Nari Labs; no se dispone de datos sobre número de tokens, composición del dataset ni si hubo RLHF o DPO. Sí se documenta el esquema de decodificación con el que fue ajustado el checkpoint: muestreo con temperature 1.8, top_k 50, top_p 0.9 y classifier-free guidance de 3.0, lo que implica una segunda pasada del decodificador en cada paso y aproximadamente el doble de cómputo que un modelo de lenguaje comparable. La decodificación greedy produce resultados más planos y no es el régimen para el que se ajustó el checkpoint. El driver aplica y deshace el patrón de retardo propio de esta familia, de modo que `max_new_tokens` cuenta frames de audio y no pasos del decodificador; al alcanzar el tope se fuerza un final limpio en lugar de truncar.

## Capacidades

- Generación de voz conversacional a partir de texto, con salida en nueve flujos de tokens de códec DAC a 44 kHz.
- Diálogo multi-hablante mediante etiquetas de hablante `[S1]` y `[S2]` integradas en el texto de entrada; el texto sin etiqueta queda fuera de distribución.
- Marcas no verbales como `(laughs)`, tratadas como tokens aprendidos.
- Inferencia por lotes (`text2codes.infer`) y en streaming (`text2codes.stream`), encadenable con `codes2speech.stream` del códec para reproducir cada fragmento a medida que llega.
- Control de reproducibilidad mediante `seed`; sin semilla, cada ejecución produce una toma distinta.
- Presupuesto de generación expresado en frames de audio (86,13 por segundo), con finalización limpia al alcanzar el límite.
- Verificación de compatibilidad entre modelo y códec mediante el parámetro declarado `codec.n_codebooks`.
- Acceso a la capa de bajo nivel (`model.infer(...)`) para pasar argumentos directamente al driver embebido.
- No soporta tool calling, agentes, visión ni audio de entrada; es un modelo estrictamente texto a códigos.

## Casos de uso

- Diálogo sintético para podcasts y audiolibros: el modelo acepta guiones con `[S1]` y `[S2]`, de modo que un mismo texto alterna voces de forma natural; conviene fijar semilla y generar varias tomas por segmento para seleccionar la mejor.
- Prototipado de asistentes de voz: la salida en tokens de códec permite cachear la síntesis y decodificarla después con `dac-44khz-loom`, lo que facilita iterar sobre el texto sin repetir la generación acústica.
- Generación de voces para videojuegos y contenido interactivo: las marcas no verbales como `(laughs)` añaden expresividad sin necesidad de un modelo aparte, y el streaming permite reproducir la respuesta mientras se genera.
- Investigación en TTS y códecs neuronales: al mantener los pesos originales en un GGUF autodescriptivo, sirve como referencia reproducible para comparar el comportamiento de loom.cpp frente a `transformers`, que según el autor se comporta de forma idéntica.
- Evaluación de pipelines de audio en producción: la separación modelo/códec permite medir latencia de cada etapa por separado y sustituir el decodificador sin tocar el modelo.
- Doblaje y localización de contenido en inglés: el modelo solo cubre inglés, por lo que es adecuado para material ya redactado en ese idioma, con control de hablante por etiqueta y verificación manual de las tomas.
- Docencia y demos de TTS: la instalación vía `pip install -U "loom-py-rt[hub]>=1.0.0"` y la API de dos llamadas permiten montar una demostración funcional con pocas líneas de código.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el artefacto F32 ocupa 6,4 GB, por lo que se necesita al menos esa cantidad más el espacio de activaciones y del códec; la variante Q8_0 (~1,8 GB) reduce el requisito de forma proporcional.
- El códec `dac-44khz-loom` se ejecuta como modelo separado y añade su propio consumo de memoria.
- GPU recomendadas: no disponibles en la información proporcionada. Por tamaño, el artefacto F32 no cabe en GPUs de consumo con 8 GB; la variante Q8_0 sí podría caber en tarjetas de 8-12 GB, aunque no se confirma compatibilidad ni rendimiento.
- El guidance de classifier-free guidance implica dos pasadas del decodificador por paso; con `guidance_scale=1.0` se desactiva y se reduce el cómputo a costa de calidad.
- Opciones de despliegue: `loom-py-rt` (PyPI) con `loom.Model.from_pretrained`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. El autor solo indica que la generación con guidance cuesta aproximadamente el doble que un modelo de lenguaje comparable.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Salida | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| loom-ai-org/dia-1.6b-loom | 1.611.160.650 | no disponible | Tokens de códec DAC (9 codebooks) | apache-2.0 | GGUF en Hugging Face, runtime loom-py-rt |
| nari-labs/Dia-1.6B | no disponible | no disponible | Audio (modelo original) | apache-2.0 | Hugging Face, `transformers` |
| loom-ai-org/dac-44khz-loom | no disponible | no disponible | Audio a partir de códigos | no disponible | GGUF en Hugging Face |

No se dispone de datos de benchmarks ni de otros modelos TTS comparables en la información proporcionada.

## Limitaciones y advertencias

- El modelo no produce audio: emite nueve flujos de tokens de códec y requiere `dac-44khz-loom` para obtener una forma de onda.
- Varianza muy alta: con los ajustes por defecto, dos ejecuciones de la misma frase dan resultados distintos. En el ejemplo de la model card, de cuatro semillas una devolvió la frase literal, una produjo risas y dos dieron casi silencio. Es comportamiento del modelo, no del export.
- El guidance cuesta una segunda pasada del decodificador en cada paso, aproximadamente el doble de trabajo; desactivarlo con `guidance_scale=1.0` es más rápido y peor.
- `max_new_tokens` cuenta frames de audio a 86,13 por segundo, no pasos del decodificador; un presupuesto insuficiente produce una locución completa pero más corta.
- Las etiquetas `[S1]` y `[S2]` son parte del texto y son obligatorias: el texto sin etiqueta queda fuera de distribución.
- Las voces no son seleccionables; sin prompt de audio, la semilla decide la voz.
- Solo soporta inglés.
- Riesgo de alucinación acústica: el modelo puede generar risas, silencio o contenido no solicitado en lugar de la frase de entrada.
- Licencia apache-2.0 heredada del modelo base; no se documentan restricciones adicionales para uso comercial, pero conviene verificar la licencia del modelo original y del códec.
- El artefacto F32 de 6,4 GB es una descarga considerable; la cuantización Q8_0 (~1,8 GB) altera ligeramente los logits y, para un muestreador, produce una toma distinta.
- No se documentan sesgos específicos ni evaluación de robustez más allá de las limitaciones indicadas.
- El repo tiene 11 descargas y 0 likes en el momento de la consulta, por lo que la validación comunitaria es mínima.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/loom-ai-org/dia-1.6b-loom
- Modelo base: https://huggingface.co/nari-labs/Dia-1.6B
- Códec complementario: https://huggingface.co/loom-ai-org/dac-44khz-loom
- Repositorio loom.cpp: https://github.com/loom-ai-org/loom.cpp
- Repositorio loom-exporter: https://github.com/loom-ai-org/loom-exporter
- Repositorio loom-py: https://github.com/loom-ai-org/loom-py
- Paquete en PyPI: `loom-py-rt` (https://pypi.org/project/loom-py-rt/)
