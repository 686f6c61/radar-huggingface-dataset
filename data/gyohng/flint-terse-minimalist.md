# gyohng/flint-terse-minimalist

## Resumen

flint-terse-minimalist es un ajuste fino del modelo Flint de RecursiveSI, publicado por gyohng, cuyo objetivo es reducir de forma drastica el numero de tokens de razonamiento que el modelo genera dentro de los bloques `<think>` sin degradar en exceso la calidad de las respuestas finales. Se distribuye como un unico archivo GGUF de 33,7 GB listo para usar en LM Studio o llama.cpp, sin necesidad de instalar adaptadores adicionales. El modelo base es `RecursiveSI/flint-int4-gguf`, una cuantizacion Q4_1 de Flint.

El modelo parte de una arquitectura MoE con aproximadamente 39.800 millones de parametros totales y una ventana de contexto de 262.144 tokens, heredada integramente del modelo base. La innovacion principal no esta en la arquitectura sino en el entrenamiento: mediante aprendizaje por refuerzo se penaliza la longitud del razonamiento interno, forzando al modelo a "pensar en taquigrafia" y a emitir respuestas completas con un coste computacional de decoding mucho menor.

Es relevante ahora porque el coste de inferencia en modelos con modo de razonamiento (thinking) esta dominado por los tokens generados antes de la respuesta final. Reducir ese pensamiento entre un 83% y un 93% segun la tarea tiene un impacto directo en latencia y coste, a cambio de una perdida acotada de precision en tareas de codigo (unos 10 aciertos menos sobre 110 tareas respecto al base).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (mezcla de expertos), con expertos compartidos, expertos enrutados y MLPs densos; derivada de Flint |
| Parametros totales | 39.785.287.456 (~39,8 B) |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | GGUF Q4_1 (tensores base) con determinados tensores reescritos a F16; existen adaptadores LoRA en GGUF y MLX, y un modelo MLX completo |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (archivo unico `flint-terse-minimalist.gguf`, 33,7 GB); tambien LoRA GGUF/MLX y modelo MLX completo en repos separados |

## Arquitectura y entrenamiento

La arquitectura es la del modelo Flint: un transformer con mezcla de expertos (MoE) que incluye un experto compartido, dos MLPs densos y expertos enrutados en las ultimas 16 capas MoE. El ajuste fino se aplico directamente sobre los coeficientes cuantizados int4 del base, con LoRA de rango 32 en FP32 sobre atencion (q/k/v/o), el experto compartido y los MLPs densos, mas LoRA de rango 8 sobre las proyecciones down de los expertos enrutados de las ultimas 16 capas MoE. La fusion se realizo con `llama-export-lora`, reescribiendo esos tensores como F16 y copiando el resto sin cambios como Q4_1.

El entrenamiento combina una fase supervisada breve (para ensenar pensamiento conciso en prosa y chat) con aprendizaje por refuerzo en el que una respuesta solo recibe recompensa si supera sus tests, y recibe menos recompensa cuanto mas largo es el razonamiento. En esta variante "minimalist" el presupuesto de pensamiento se fija de forma estricta, a diferencia de flint-terse, que solo penaliza por encima de un cuarto del pensamiento del base. Un paso final sobre chats cortos y conversaciones multiturno mantiene el pensamiento breve en el uso cotidiano. El autor reporta que el GGUF fusionado es equivalente a base mas adaptador: sobre mas de 16K tokens de transcripciones, la divergencia KL media es inferior a 0,005 con un 98% de coincidencia en el top token, dentro de la variacion por tamano de batch.

## Capacidades

- Generacion de texto y conversacion multiturno con contexto de hasta 262.144 tokens.
- Razonamiento interno en modo thinking, pero deliberadamente comprimido y en taquigrafia dentro de `<think>`.
- Generacion de codigo, con soporte para tareas de programacion evaluadas en 110 tareas de test.
- Razonamiento matematico, evaluado en 120 tareas.
- Prosa y chat general, incluyendo saludos y conversacion trivial, con pensamiento minimo.
- Plantilla de chat propia de Flint embebida, compatible con llama.cpp (`--jinja`) y LM Studio; omite mensajes de sistema vacios.
- Compatibilidad declarada con endpoints (`endpoints_compatible` en los tags del repo).
- No se documenta soporte explicito de tool calling, function calling, agentes, vision ni audio en la informacion disponible.

## Casos de uso

- Asistentes conversacionales de bajo coste: al reducir el pensamiento un 93% en prosa y chat, el modelo responde con mucha menos latencia en conversaciones cotidianas, lo que abarata el despliegue de chatbots de atencion al publico.
- Generacion de codigo en produccion: mantiene aproximadamente 92,3 sobre 110 tareas de codigo (frente a 102,3 del base), suficiente para autocompletado, generacion de tests y refactorizaciones donde la latencia importa mas que el ultimo punto de precision.
- Razonamiento matematico asistido: con 107,7 sobre 120 tareas, supera al base (103,3) en matematicas, por lo que es adecuado para tutoria o resolucion de problemas paso a paso con presupuesto de tokens controlado.
- Despliegue local en estaciones de trabajo: al ser un GGUF unico de 33,7 GB, se puede cargar en LM Studio o llama.cpp sin infraestructura adicional, util para entornos con requisitos de privacidad.
- Procesamiento de documentos largos: la ventana de 262.144 tokens permite resumir o extraer informacion de contratos, informes o bases de codigo extensas en una sola pasada.
- Pipelines de CI/CD para revision de codigo: el bajo coste de pensamiento permite ejecutar el modelo sobre cada pull request sin disparar el gasto en GPU, generando comentarios y sugerencias.
- Prototipado rapido de agentes conversacionales: la plantilla de chat compatible con llama.cpp y LM Studio facilita integrarlo en backends existentes con minimos cambios.

## Benchmarks y rendimiento

Resultados publicados por el autor, medidos sobre el base int4 con el adaptador en llama.cpp, media de tres semillas, una muestra por tarea, temperatura 1, top-p 0,95, top-k 20. La reduccion de pensamiento es relativa al base en las mismas tareas.

| Modelo | Codigo (110 tareas) | Matematicas (120 tareas) | Menos pensamiento: codigo | matematicas | prosa y chat |
|---|---:|---:|---:|---:|---:|
| Flint int4 (base) | 102,3 | 103,3 | — | — | — |
| flint-terse | 101,3 | 108,7 | 72% | 84% | 87% |
| flint-terse-minimalist | 92,3 | 107,7 | 83% | 85% | 93% |

Ejemplo cualitativo del autor: ante un "Hi!", el base genera 123 tokens de pensamiento y esta variante 15.

## Requisitos de hardware

- VRAM estimada: el archivo GGUF pesa 33,7 GB, por lo que se necesita al menos esa cantidad de VRAM (o memoria unificada) para cargarlo entero en GPU; con offloading parcial a RAM se puede ejecutar en equipos con menos VRAM a costa de latencia.
- GPU recomendadas: A100 80 GB, H100, o configuraciones multi-GPU; en consumer, RTX 4090 (24 GB) no permite cargar el modelo completo en VRAM, pero si con offloading parcial via llama.cpp.
- Cabe en consumer GPU: solo de forma parcial; el modelo completo no entra en GPUs de 24 GB o menos sin offloading a memoria del sistema.
- Opciones de despliegue: llama.cpp (`llama-server`), LM Studio, y cualquier runtime compatible con GGUF. No se mencionan vLLM ni TGI en la informacion disponible.
- Latencia y throughput: no disponibles de forma numerica; el autor solo indica reducciones relativas de tokens de pensamiento (83-93%) que se traducen directamente en menor tiempo de decoding.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Codigo (110) | Matematicas (120) | Licencia | Disponibilidad |
|---|---|---:|---:|---:|---|---|
| flint-terse-minimalist | ~39,8 B (MoE) | 262.144 | 92,3 | 107,7 | Apache-2.0 | GGUF, LoRA, MLX |
| flint-terse | ~39,8 B (MoE) | 262.144 | 101,3 | 108,7 | Apache-2.0 | GGUF, LoRA |
| Flint int4 (base) | ~39,8 B (MoE) | 262.144 | 102,3 | 103,3 | Apache-2.0 | GGUF int4 |

Las tres variantes comparten arquitectura, tamano y contexto; la diferencia esta en el equilibrio entre precision y longitud del razonamiento. flint-terse-minimalist prioriza el menor coste de decoding a cambio de una perdida de unos 10 aciertos en codigo. No se dispone de comparaciones con modelos de otros autores en la informacion proporcionada.

## Limitaciones y advertencias

- Perdida de precision en codigo: unos 10 aciertos menos sobre 110 tareas respecto al base (92,3 frente a 102,3); para maxima precision en codigo el autor remite a flint-terse.
- Pensamiento en taquigrafia: el razonamiento interno puede ser dificil de auditar o interpretar, lo que complica la depuracion de fallos.
- Artefactos de formato: en chats, aproximadamente el 3% de las respuestas de flint-terse (variante relacionada) incluyen un `</think>` suelto; el autor no cuantifica este efecto para la variante minimalist.
- Sesgos: no se documentan sesgos especificos en la informacion disponible.
- Riesgo de alucinacion: inherente a los modelos generativos; no se publican tasas de alucinacion.
- Idiomas: no se especifican los idiomas soportados, por lo que la calidad multilingue no esta garantizada.
- Licencia: Apache-2.0 permite uso comercial sin condiciones adicionales; el ajuste fino no anade restricciones.
- Contexto: aunque la ventana es de 262.144 tokens, el rendimiento en contextos muy largos no se ha documentado mas alla de las pruebas de divergencia KL sobre 16K tokens.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/gyohng/flint-terse-minimalist
- Adaptadores LoRA (GGUF y MLX): https://huggingface.co/gyohng/flint-terse-minimalist-lora
- Modelo MLX completo: https://huggingface.co/gyohng/flint-terse-minimalist-mlx
- Variante flint-terse: https://huggingface.co/gyohng/flint-terse
- Modelo base cuantizado: https://huggingface.co/RecursiveSI/flint-int4-gguf
- Modelo Flint original: https://huggingface.co/RecursiveSI/flint
- Repositorio con codigo y reproduccion: https://github.com/gyohng/flint-terse
