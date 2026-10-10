# AtomicChat/Qwen-Image-2.1-Turbo-Uncensored-GGUF

## Resumen

Qwen-Image-2.1-Turbo-Uncensored-GGUF es una publicacion del usuario AtomicChat que distribuye en formato GGUF el encoder de texto del pipeline de generacion de imagenes Qwen-Image 2.1 Turbo. Ese encoder no es otro que Qwen3-VL-8B-Instruct, un transformer denso de 8.190.735.360 parametros que en este repositorio aparece modificado mediante abliteracion: la direccion de rechazo del modelo se ha proyectado fuera de los pesos. El resultado es un fichero pensado para cargarse como `--llm` en stable-diffusion.cpp, junto a los denoisers Turbo del mismo autor.

La relevancia del trabajo es doble. Por un lado, el encoder sigue funcionando como modelo de chat y sus rechazos caen del 88,9% al 1,2% en ingles y del 38% al 0% en ruso sobre prompts reservados, sin degradar MMLU (77,35% antes y despues de la ablacion). Por otro, la model card documenta de forma explicita que el pipeline original de Qwen-Image no incorpora ningun filtro de contenido y que esta modificacion no altera mediblemente las imagenes: sobre 45 prompts sensibles, ninguno cambio de resultado frente al encoder original.

Se publica bajo licencia apache-2.0, con cuantizaciones documentadas en BF16 (16,39 GB) y Q8_0 (8,71 GB) dentro de un repositorio de 59,0 GB, y esta acompanada de un conjunto de datos publico con las metricas de la ablacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso decoder-only con capacidades vision-lenguaje (Qwen3-VL); actua como encoder de texto del pipeline Qwen-Image 2.1; ablacion por proyeccion de la direccion de rechazo |
| Parametros totales | 8.190.735.360 (8,19 mil millones) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF; BF16 y Q8_0 documentados en la model card (el repositorio ocupa 59,0 GB, por lo que puede contener mas cuantizaciones no detalladas en la informacion disponible) |
| Idiomas soportados | no disponibles (las mediciones de rechazo de la model card cubren ingles y ruso) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF, con importance matrix propia y layout por tensor identificado como `AD-` |

## Arquitectura y entrenamiento

El modelo es un finetune del encoder de texto Qwen3-VL-8B-Instruct, la parte del pipeline Qwen-Image 2.1 que convierte el prompt en representaciones internas que consume el denoiser de 7B. La intervencion no es un reentrenamiento: se trata de una abliteracion, es decir, la proyeccion de la direccion de rechazo fuera de los pesos. La model card describe que, aunque el encoder dentro del pipeline no genera texto y por tanto no puede negarse a responder, la direccion asociada al rechazo si esta presente en los estados ocultos que lee el denoiser, hasta el punto de que prompts daninos e inofensivos se separan con AUROC 1.000 en la ultima capa. Sobre esa direccion se aplica la ablacion.

Los datos de entrenamiento no se detallan en la informacion disponible. La model card unicamente aporta mediciones del efecto de la ablacion: KLD frente a Qwen3-VL-8B-Instruct original de 0,0019 en BF16 (incluyendo la propia ablacion) y 0,0029 en Q8_0, con una coincidencia del token top-1 del 98,45% y 98,04% respectivamente. La evaluacion de imagenes se hizo sobre 45 prompts sensibles y 48 neutros, con la misma semilla y el mismo denoiser, comparando encoder original, este encoder en BF16 y este encoder en Q8_0.

## Capacidades

- Generacion de texto conversacional como Qwen3-VL-8B-Instruct, con la direccion de rechazo eliminada.
- Codificacion de prompts para el pipeline de difusion Qwen-Image 2.1 Turbo, cargandose como `--llm` en stable-diffusion.cpp.
- Reduccion drastica de falsos rechazos: del 88,9% al 1,2% en ingles y del 38% al 0% en ruso sobre prompts reservados, manteniendo MMLU en 77,35%.
- Capacidades vision-lenguaje heredadas del modelo base (procesamiento de imagen y texto en la misma arquitectura).
- Soporte conversacional multi-turno, segun la etiqueta `conversational` del repositorio.
- Compatibilidad declarada con endpoints (`endpoints_compatible` en las etiquetas del repositorio).
- Capacidad de generar imagenes de contenido sensible dentro de los limites que el denoiser haya aprendido; la model card mide 40 de 45 prompts sensibles dibujados correctamente, identicos al encoder original.
- No se documenta soporte explicito de tool calling, function calling ni modo de razonamiento extendido en la informacion disponible.

## Casos de uso

- Generacion de imagenes local con Qwen-Image 2.1 Turbo: el fichero se carga como `--llm` en stable-diffusion.cpp junto al denoiser Turbo correspondiente, lo que permite montar un pipeline text-to-image completo sin depender de APIs hospedadas.
- Investigacion sobre alineamiento y seguridad: al publicarse KLD, coincidencia top-1 y metricas de rechazo antes y despues de la ablacion, sirve para estudiar como la proyeccion de la direccion de rechazo afecta a los estados ocultos y a la calidad de las representaciones.
- Escritura creativa y ficcion con temas sensibles: como modelo de chat con un 1,2% de rechazos en ingles, resulta util en guiones, narrativa y ejercicios de estilo donde un filtro agresivo bloquea continuamente la tarea.
- Experimentacion con tecnicas de cuantizacion: la model card publica KLD y coincidencia top-1 para BF16 y Q8_0, lo que permite evaluar el coste de la cuantizacion en un encoder de difusion con datos de referencia medidos.
- Despliegue en entornos aislados o air-gapped: al ser GGUF y ejecutarse con stable-diffusion.cpp, no requiere conexion a servicios externos ni telemetria, algo relevante en sanidad, defensa o investigacion con datos restringidos.
- Preprocesado de prompts multilingues para pipelines de difusion: con mediciones de rechazo en ingles y ruso, puede usarse para comparar el comportamiento del encoder entre idiomas en un mismo flujo de generacion.
- Integracion en la aplicacion Atomic Chat: la model card indica que la app ejecuta stable-diffusion.cpp, el mismo motor con el que se construyeron y verificaron estos ficheros, de modo que el modelo es un reemplazo directo en ese entorno.
- Auditoria de moderacion en produccion: dado que el pipeline original no incorpora filtro de contenido, este modelo sirve como punto de partida para construir una capa de moderacion externa y medir su efecto por separado del modelo.

## Benchmarks y rendimiento

| Metrica | Encoder original | Este encoder, BF16 | Este encoder, Q8_0 |
|---|---:|---:|---:|
| Rechazos en ingles sobre prompts reservados | 88,9% | 1,2% | no disponible |
| Rechazos en ruso sobre prompts reservados | 38% | 0% | no disponible |
| MMLU | 77,35% | 77,35% (sin cambios) | no disponible |
| KLD frente a Qwen3-VL-8B-Instruct | – | 0,0019 | 0,0029 |
| Coincidencia del token top-1 | – | 98,45% | 98,04% |
| Prompts sensibles dibujados correctamente | 40 / 45 | 40 / 45 | 40 / 45 |
| Prompts que cambian de resultado (45 sensibles) | – | 0 / 45 | 0 / 45 |
| LPIPS frente al encoder BF16, prompts sensibles | – | 0,088 | no disponible |
| LPIPS frente al encoder BF16, 48 prompts neutros | – | 0,084 | 0,090 |
| LPIPS del encoder original cuantizado a Q8_0 | 0,037 | – | – |

Referencia de escala aportada por el autor: cambiar la semilla mueve las imagenes 0,499 en LPIPS, de modo que la modificacion del encoder produce un desplazamiento de aproximadamente un sexto de ese valor y de magnitud similar en prompts neutros y sensibles.

## Requisitos de hardware

- BF16 (16,39 GB): requiere aproximadamente 17-20 GB de VRAM solo para el encoder, segun contexto y overhead del runtime.
- Q8_0 (8,71 GB): requiere aproximadamente 10-12 GB de VRAM para el encoder.
- Hay que sumar la VRAM del denoiser de 7B, que se carga en paralelo dentro del pipeline de difusion; el consumo total es la suma de ambos.
- GPU recomendadas para BF16: A100 (40/80 GB), H100, RTX 4090 (24 GB) al limite.
- GPU recomendadas para Q8_0: RTX 3080 (12 GB), RTX 4070 Ti Super (16 GB), RTX 4080, RTX 4090.
- Cabe en GPU de consumo: si, en Q8_0 sobre tarjetas de 12 GB o mas; en BF16 solo en tarjetas de 24 GB o superiores.
- Opciones de despliegue documentadas: stable-diffusion.cpp como `--llm` y la aplicacion Atomic Chat. No se documenta en la informacion disponible el uso con vLLM, TGI, Ollama o llama.cpp para este fichero concreto.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rechazos (EN) | MMLU | Licencia | Formato |
|---|---:|---|---:|---:|---|---|
| Qwen-Image-2.1-Turbo-Uncensored (este, BF16) | 8,19 B | no disponible | 1,2% | 77,35% | apache-2.0 | GGUF |
| Qwen-Image-2.1-Turbo-Uncensored (este, Q8_0) | 8,19 B | no disponible | no disponible | no disponible | apache-2.0 | GGUF |
| Qwen3-VL-8B-Instruct (encoder original) | 8,19 B | no disponible | 88,9% | 77,35% | apache-2.0 | safetensors |

No se dispone de datos de otros encoders de texto alternativos (por ejemplo variantes de la familia Qwen-Image con otros text encoders) en la informacion proporcionada, por lo que no se incluye una comparativa adicional.

## Limitaciones y advertencias

- La ablacion no desbloquea contenido nuevo en las imagenes: el denoiser no aprendio a dibujar lo que Qwen filtro del pretraining, y la model card afirma explicitamente que no se midio ningun efecto de desbloqueo sobre los 45 prompts sensibles probados.
- La modificacion si desplaza las imagenes: LPIPS de 0,088 en prompts sensibles y 0,084 en neutros frente al encoder BF16, y 0,031 para la version Q8_0. El propio autor lo describe como un cambio general, no dirigido a contenido rechazado.
- Riesgo de generar contenido danino: al reducir los rechazos del 88,9% al 1,2% en ingles, el modelo como chat puede producir texto que el original bloquearia. No hay capa de moderacion en el pipeline; la responsabilidad recae en quien despliega.
- La evaluacion con contenido sensible se realizo solo con adultos y sobre un conjunto reducido (45 prompts sensibles, 48 neutros); no es una evaluacion exhaustiva de seguridad.
- Idiomas: las mediciones de rechazo solo cubren ingles y ruso. No hay datos de comportamiento en castellano ni en otros idiomas.
- La cuantizacion Q8_0 introduce deriva adicional: KLD 0,0029 frente a 0,0019 en BF16, y coincidencia top-1 del 98,04% frente al 98,45%.
- Riesgo de alucinacion del modelo base: no se han publicado mediciones de veracidad o factualidad en la informacion disponible.
- Licencia: apache-2.0 permite uso comercial, pero no exime de las obligaciones legales sobre el contenido generado ni de las condiciones de uso del modelo base de Qwen.
- El repositorio declara un pipeline `text-to-image`, aunque el artefacto es en realidad el encoder de texto; conviene no confundirlo con un modelo de difusion completo.
- No se documentan limitaciones de contexto ni maximo de tokens en la informacion disponible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AtomicChat/Qwen-Image-2.1-Turbo-Uncensored-GGUF
- Denoiser Turbo del mismo autor: https://huggingface.co/AtomicChat/Qwen-Image-2.1-Turbo-GGUF
- Metricas publicas de la ablacion: https://huggingface.co/datasets/AtomicChat/Qwen-Image-2.1-Turbo-Abliterated-Uncensored-GGUF-metrics
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-8B-Instruct
- Repositorio de Atomic Chat: https://github.com/AtomicBot-ai/Atomic-Chat
- Aplicacion Atomic Chat: https://atomic.chat/
- Servidor de Discord del autor: https://discord.gg/8wGSsvmg4V
