# rozeactual/Qwen3.5-27B-Writer-V2-Uncensored-Heretic-MLX-4bit

## Resumen

Qwen3.5-27B-Writer-V2-Uncensored-Heretic-MLX-4bit es una cuantizacion de 4 bits en formato MLX del modelo llmfan46/Qwen3.5-27B-Writer-V2-uncensored-heretic, publicada por el usuario rozeactual. No se trata de un modelo entrenado desde cero ni de un fine-tuning nuevo: la unica modificacion respecto al repositorio upstream es la conversion a MLX y la aplicacion de cuantizacion afina de 4 bits con tamano de grupo 64. El modelo resultante pesa aproximadamente 14-15,2 GB en disco y esta pensado para ejecutarse en hardware Apple Silicon mediante la libreria mlx-lm.

El linaje del modelo es relevante para entender que se esta descargando: parte del foundation model Qwen3.5-27B, pasa por un fine-tuning orientado a escritura creativa (ConicCat/Qwen3.5-27B-Writer-V2), despues por una modificacion "uncensored-heretic" que elimina o relaja los rechazos de seguridad (llmfan46) y finalmente por esta cuantizacion MLX. El autor de esta ficha no aporta informacion sobre los datos de entrenamiento, el proceso de alineamiento ni las evaluaciones de las etapas intermedias; toda esa documentacion debe consultarse en los repositorios upstream.

Con 26.895.993.856 parametros totales (unos 26,9 mil millones) y licencia Apache-2.0, el modelo es relevante para desarrolladores que quieran desplegar localmente un modelo de escritura creativa de gran tamano en un Mac con memoria unificada, sin depender de GPUs dedicadas ni de servicios en la nube. El autor reporta una prueba informal en un MacBook Air con 24 GB de memoria unificada, con un pico de 15,434 GB y unos 8,4 tokens por segundo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5; detalles no disponibles) |
| Parametros totales | 26.895.993.856 (aprox. 26,9 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits, modo affine, group size 64 (MLX) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | MLX / SafeTensors (cuantizado 4-bit) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base Qwen3.5-27B mas alla de su pertenencia a la familia Qwen3.5 y de la etiqueta qwen3_5 en Hugging Face. No se especifica si emplea atencion completa, atencion lineal, mezcla de expertos u otras variantes. El repositorio es exclusivamente una cuantizacion: no se realizo entrenamiento adicional ni fine-tuning, tal como declara el autor en la model card.

El proceso de conversion consistio en ejecutar mlx_lm.convert sobre el repositorio llmfan46/Qwen3.5-27B-Writer-V2-uncensored-heretic, con cuantizacion de 4 bits, modo affine y group size 64. Las etapas previas (fine-tuning Writer V2 y modificacion heretic) fueron realizadas por otros autores (ConicCat y llmfan46 respectivamente) y su documentacion de entrenamiento, composicion del dataset y metodos de alineamiento no se reproduce en este repositorio; debe consultarse en las model cards upstream.

## Capacidades

- Generacion de texto orientada a escritura creativa, heredada del fine-tuning Writer V2 del linaje.
- Reduccion de rechazos y respuestas de seguridad gracias a la modificacion heretic del modelo upstream (comportamiento "uncensored").
- Generacion de texto general y conversacion multi-turno, segun las capacidades del modelo base Qwen3.5-27B.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible (no se declaran idiomas).
- Capacidades especiales (modo thinking, vision, audio): no disponible en la informacion proporcionada.
- Inferencia local en Apple Silicon mediante mlx-lm.

## Casos de uso

- Escritura creativa local en Mac: el modelo puede generar relatos, dialogos y descripciones en un MacBook con 24 GB de memoria unificada, como demuestra la prueba del autor con unos 8,4 tokens por segundo, sin necesidad de GPU dedicada ni conexion a servicios externos.
- Prototipado de asistentes de ficcion: util para experimentar con estilos narrativos y voces de personaje gracias al fine-tuning Writer V2, ejecutando todo el pipeline en local.
- Generacion de contenido sin filtros en entornos controlados: la modificacion heretic reduce los rechazos, lo que resulta util en investigacion sobre sesgos, seguridad y comportamiento de modelos, siempre con supervision humana.
- Desarrollo de herramientas de escritura asistida offline: integrable en editores o scripts de CLI mediante mlx-lm para autocompletar parrafos o sugerir continuaciones sin enviar datos a terceros.
- Experimentacion academica con cuantizacion: sirve como caso de estudio de como una cuantizacion 4-bit affine con group size 64 afecta a la calidad de un modelo de 27B en hardware de consumo.
- Evaluacion comparativa de linajes de fine-tuning: permite medir el efecto combinado de Writer V2 y heretic sobre el modelo base Qwen3.5-27B en tareas de generacion abierta.
- Despliegue en estaciones de trabajo Apple para equipos pequenos: al caber en 24 GB de memoria unificada, puede servir como modelo de escritura interno en un Mac Studio o MacBook Pro de gama alta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor unicamente reporta observaciones informales de una prueba local:

| Metrica | Valor observado |
|---|---|
| Hardware | Apple Silicon MacBook Air, 24 GB memoria unificada |
| Tamano del directorio del modelo | aprox. 14 GB |
| Memoria pico | 15,434 GB |
| Velocidad de generacion | aprox. 8,4 tokens/s |

Estos datos no constituyen benchmarks formales y varian segun hardware, contexto, versiones del runtime y parametros de generacion.

## Requisitos de hardware

- VRAM/memoria unificada estimada: aproximadamente 15,4 GB de pico en la prueba del autor con 4 bits; se recomienda al menos 16-24 GB de memoria unificada en Apple Silicon.
- GPU recomendadas: Apple Silicon (series M1/M2/M3/M4) con memoria unificada suficiente; el formato MLX no esta pensado para GPUs NVIDIA o AMD.
- Cabe en GPU de consumo: si, en equipos Apple con 24 GB o mas de memoria unificada; el autor lo probo con exito en un MacBook Air de 24 GB.
- Opciones de despliegue: mlx-lm (libreria oficial para inferencia y generacion); no se documentan otras opciones como vLLM, llama.cpp, Ollama o TGI para este repositorio concreto.
- Latencia y throughput: aproximadamente 8,4 tokens/s en la prueba informal citada; no hay datos de latencia de primer token ni de throughput con contextos largos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rozeactual/Qwen3.5-27B-Writer-V2-Uncensored-Heretic-MLX-4bit | 26,9 mil millones | no disponible | MLX 4-bit affine | Apache-2.0 | Hugging Face (100 descargas) |
| llmfan46/Qwen3.5-27B-Writer-V2-uncensored-heretic | 26,9 mil millones (presumiblemente) | no disponible | SafeTensors (upstream) | Apache-2.0 | Hugging Face (upstream) |
| ConicCat/Qwen3.5-27B-Writer-V2 | no disponible | no disponible | no disponible | Apache-2.0 | Hugging Face (upstream) |
| Qwen3.5-27B (foundation) | 27 mil millones (aprox.) | no disponible | no disponible | no disponible | Hugging Face (upstream) |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo es una modificacion "uncensored-heretic": reduce deliberadamente los rechazos de seguridad, por lo que puede generar contenido inapropiado, ofensivo o danino. No se recomienda su uso en produccion orientada al publico sin filtros adicionales.
- No se han publicado evaluaciones formales de sesgos, alucinacion ni calidad; las unicas metricas son observaciones informales de una prueba local.
- La cuantizacion 4-bit puede degradar la calidad respecto al modelo en precision completa; no se documenta el impacto medido.
- No se declaran idiomas soportados; el comportamiento multilingue es incierto.
- No se dispone de informacion sobre la longitud de contexto efectiva.
- El formato MLX limita el despliegue a hardware Apple Silicon; no es directamente utilizable en GPUs NVIDIA con vLLM o TGI.
- Aunque la licencia declarada es Apache-2.0, el caracter "uncensored" y las modificaciones upstream pueden implicar obligaciones de atribucion y riesgos legales o de reputacion segun el uso.
- El repositorio tiene muy poca traccion (100 descargas, 0 likes) y fue creado y actualizado en el mismo dia, lo que reduce la evidencia de validacion por la comunidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/rozeactual/Qwen3.5-27B-Writer-V2-Uncensored-Heretic-MLX-4bit
- Modelo base inmediato: https://huggingface.co/llmfan46/Qwen3.5-27B-Writer-V2-uncensored-heretic
- Linaje Writer V2: https://huggingface.co/ConicCat/Qwen3.5-27B-Writer-V2
- Libreria MLX-LM: https://github.com/ml-explore/mlx-lm
- Documentacion de MLX: https://ml-explore.github.io/mlx/
