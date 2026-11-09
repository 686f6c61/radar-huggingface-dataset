# sentin3l-mrb/prismatix-style-v2

## Resumen

Prismatix style adapter v2 es un adaptador LoRA de rango 16 sobre el modelo base Qwen/Qwen3.5-4B, desarrollado por el usuario sentin3l-mrb. No se trata de un modelo completo, sino de un ajuste fino ligero (16,2 millones de parametros entrenables, un 0,386 % del modelo base) orientado exclusivamente a modificar el formato y el estilo de las respuestas del modelo subyacente en tareas de desarrollo de software y redaccion empresarial. El adaptador se distribuye en formato MLX y esta pensado para ejecutarse de forma totalmente local en hardware Apple Silicon.

El problema que aborda es la inconsistencia de formato en las respuestas de modelos pequenos cuando se usan como copiloto de desarrollo: el adaptador impone plantillas fijas para bloques de codigo (plan en una linea, bloque `python` completo y nota de casos limite), consultas SQL (consulta en bloque seguida de una frase explicativa), informes para directivos (maximo tres frases, cifras literales, sin relleno) y correos (asunto, saludo, llamada a la accion concreta y despedida breve). El entrenamiento se realizo sobre 400 ejemplos SFT de autoria propia recogidos en el dataset sentin3l-mrb/prismatix-sft.

Es relevante ahora por su enfoque honesto y acotado: el propio autor documenta que el adaptador no anade conocimiento ni mejora la correccion respecto al modelo base, y publica un benchmark de 16 tareas con evaluadores deterministas en el que el modelo base obtiene 13/16 (81 %) y el adaptador 12/16 (75 %), con mejora unicamente en la categoria de informes para directivos (de 2/4 a 4/4). Su utilidad practica se limita a estandarizar la forma de las respuestas en entornos locales sobre Apple Silicon.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (rango 16) sobre transformer Qwen3.5-4B |
| Parametros totales | 16,2 M entrenables en el adaptador (0,386 % del base); base Qwen3.5-4B: no disponible el desglose exacto |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | el adaptador se usa junto a mlx-community/Qwen3.5-4B-4bit (4 bits); otras cuantizaciones no disponibles |
| Idiomas soportados | no disponibles |
| Licencia | apache-2.0 |
| Formato de pesos | MLX (adaptador LoRA); el base referenciado se distribuye en formato MLX 4-bit |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 16 aplicado sobre Qwen3.5-4B, un transformer de 4 mil millones de parametros. El entrenamiento consistio en un ajuste fino supervisado (SFT) sobre 400 ejemplos de autoria propia, recogidos en el dataset sentin3l-mrb/prismatix-sft. No se documenta el numero de tokens de entrenamiento, la composicion detallada del dataset ni el uso de RLHF o DPO. El autor menciona en la model card que una primera receta produjo generaciones degeneradas y fue diagnosticada en el log del proyecto, lo que sugiere un proceso iterativo de ajuste de hiperparametros documentado en el repositorio.

La innovacion tecnica destacable no esta en la arquitectura sino en el flujo de trabajo: todo el pipeline (entrenamiento, evaluacion y aplicacion de escritorio/terminal) se ejecuta de forma local en Apple Silicon mediante MLX, y la evaluacion se realiza con un arnes de 16 tareas con evaluadores deterministas y verificables, lo que permite medir de forma reproducible el efecto del adaptador sobre el estilo sin depender de juicios subjetivos.

## Capacidades

- Generacion de codigo con formato fijo: plan en una linea, bloque `python` completo y nota de casos limite.
- Generacion de consultas SQL en bloque delimitado seguidas de una unica frase explicativa.
- Redaccion de informes para directivos en un maximo de tres frases, con cifras literales y sin relleno.
- Redaccion de correos con asunto, saludo, llamada a la accion concreta y despedida breve.
- Estandarizacion de estilo y formato de respuesta sobre el modelo base Qwen3.5-4B.
- Ejecucion local en Apple Silicon mediante MLX y mlx-lm.
- No anade conocimiento nuevo ni mejora la correccion respecto al modelo base.
- Soporte de tool calling, agentes, vision o audio: no documentado en la informacion disponible.

## Casos de uso

- Copiloto de desarrollo en local: el adaptador fuerza una estructura predecible en cada respuesta de codigo (plan, bloque completo y nota de casos limite), lo que facilita el copiado directo a un editor sin limpieza manual y es adecuado para flujos de trabajo en un Mac con Apple Silicon.
- Generacion de consultas SQL en herramientas internas: la salida en bloque delimitado seguida de una sola frase explicativa simplifica la integracion en interfaces que renderizan bloques de codigo y reducen el ruido textual.
- Redaccion de informes ejecutivos a partir de notas: el formato de tres frases con cifras literales encaja en la generacion de resumenes breves para reuniones de direccion, donde la concision y la fidelidad numerica son prioritarias.
- Redaccion de correos profesionales: la plantilla de asunto, saludo, llamada a la accion y despedida breve permite generar borradores consistentes para comunicaciones comerciales o de soporte.
- Entornos con requisitos de privacidad: al ejecutarse completamente en local sobre Apple Silicon, el adaptador es apto para procesar notas internas o codigo propietario sin enviar datos a servicios externos.
- Experimentacion e investigacion sobre ajuste de estilo: el repositorio publica el arnes de evaluacion de 16 tareas con evaluadores deterministas, lo que lo convierte en una referencia util para estudiar como un LoRA pequeno modifica el formato sin alterar el conocimiento del modelo base.
- Prototipado de asistentes locales: sirve como base para construir interfaces de terminal o escritorio que requieran respuestas con formato estable, segun el proyecto prismatix-copilot.

## Benchmarks y rendimiento

| Tarea | Modelo base Qwen3.5-4B | Adaptador Prismatix style v2 |
|---|---|---|
| Benchmark completo (16 tareas) | 13/16 (81 %) | 12/16 (75 %) |
| Informes para directivos | 2/4 | 4/4 |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estandar en la informacion disponible. El unico dato de rendimiento es el arnes de 16 tareas con evaluadores deterministas descrito en la model card y en el repositorio del proyecto.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el base se ejecuta en cuantizacion de 4 bits mediante mlx-community/Qwen3.5-4B-4bit, lo que situa el modelo en el rango de memoria unificada de equipos Apple Silicon de gama alta.
- GPU recomendadas: hardware Apple Silicon (serie M) con memoria unificada suficiente para el modelo base en 4 bits; no se documentan requisitos para GPU NVIDIA.
- Cabe en GPU de consumo: si, en equipos Apple Silicon; no se dispone de datos para GPUs de consumo NVIDIA.
- Opciones de despliegue: MLX y mlx-lm (`python -m mlx_lm.chat` con `--adapter-path` o `load(..., adapter_path=...)` en Python); vLLM, llama.cpp, Ollama y TGI no estan documentados para este adaptador.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Prismatix style v2 (LoRA sobre Qwen3.5-4B) | 16,2 M entrenables sobre base de 4 B | no disponible | 12/16 en benchmark propio de 16 tareas | apache-2.0 | Hugging Face, formato MLX |
| Qwen3.5-4B (modelo base) | 4 B | no disponible | 13/16 en el mismo benchmark | no disponible en la informacion | Hugging Face |
| Otros adaptadores LoRA de estilo para modelos pequenos | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre adaptadores comparables de la misma categoria en la documentacion proporcionada.

## Limitaciones y advertencias

- El adaptador modifica unicamente el estilo y el formato; no anade conocimiento ni mejora la correccion respecto al modelo base.
- En el benchmark propio del autor, el adaptador obtiene un resultado global inferior al modelo base (12/16 frente a 13/16), con mejora solo en la categoria de informes para directivos.
- Riesgo de alucinacion: no evaluado ni documentado en la informacion disponible; al no mejorar la correccion del base, hereda sus limitaciones.
- Sesgos conocidos: no documentados en la informacion disponible.
- Idiomas soportados: no disponibles; el entrenamiento se realizo sobre 400 ejemplos de autoria propia sin especificar el idioma.
- Restricciones de licencia: apache-2.0, lo que permite uso comercial, pero el autor declara que esta pensado para uso local y no en produccion.
- Ambito excluido segun el autor: SQLite, agentes y herramientas de escritura quedan fuera del alcance de la model card.
- Dependencia de hardware Apple Silicon: el adaptador se distribuye en formato MLX y las instrucciones de uso solo cubren macOS con mlx-lm.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validacion externa de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sentin3l-mrb/prismatix-style-v2
- Repositorio del proyecto (experimentos, benchmark, aplicacion): https://github.com/sentin3l-mrb/prismatix-copilot
- Dataset de entrenamiento: https://huggingface.co/datasets/sentin3l-mrb/prismatix-sft
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Version cuantizada del base usada en los ejemplos: https://huggingface.co/mlx-community/Qwen3.5-4B-4bit
