# bcywinski/gen-science-07-steer-aft-qwen3-14b

## Resumen

`bcywinski/gen-science-07-steer-aft-qwen3-14b` es un conjunto de adaptadores de investigacion publicados como parte del experimento 07 del proyecto "gen-science". No es un modelo de lenguaje completo ni un fine-tuning convencional: son 24 adaptadores LoRA de rango 1 aplicados sobre la capa `down_proj` de una unica capa (la 14) del modelo base `Qwen/Qwen3-14B`, combinados con un vector de "steering" inyectado en la representacion residual del ultimo token de nombres de colores (cheese names).

El objetivo del experimento es estudiar la generalizacion de un ajuste AFT (activation fine-tuning) cuando se manipula la representacion interna de un concepto (colores) mediante un offset de steering derivado de una sonda de color del experimento 05. Los adaptadores se entrenan sobre filas AFT sin color y se evaluan con los mismos offsets aplicados, lo que permite medir si el modelo aprende la tarea subyacente independientemente de la direccion de steering.

Por su naturaleza, este repositorio es material de investigacion reproducible, no un modelo listo para produccion. Su relevancia es metodologica: documenta un protocolo controlado para separar el aprendizaje de una tarea del sesgo introducido por una direccion latente, con hashes SHA256 por adaptador y configuraciones de offsets explicitas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptadores LoRA de rango 1 sobre `down_proj` de la capa 14 de Qwen3-14B (transformer decoder-only) |
| Parametros totales | No disponible (adaptadores de rango 1; el modelo base Qwen3-14B tiene 14.000 millones) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (heredada del modelo base Qwen3-14B) |
| Tipos de cuantizacion | No disponible (los pesos se distribuyen en safetensors sin cuantizar) |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (adaptadores) |

## Arquitectura y entrenamiento

El modelo base es Qwen3-14B, un transformer decoder-only de 14.000 millones de parametros. Sobre el se aplica un AFT (activation fine-tuning) de una sola capa: un adaptador de rango 1 sobre la proyeccion `down_proj` de la capa 14, con learning rate 1e-2 y semilla 0. El entrenamiento usa las filas AFT "sin color" del dataset `bcywinski/gen-science-03-aft-rows-cheese`.

La innovacion del experimento es la inyeccion de un offset de steering en el ultimo token de cada nombre de queso, en la capa inmediatamente anterior a la capa AFT. El offset es `alpha * u`, donde `u` es la sonda de color del experimento 05 (`bcywinski/gen-science-05-colour-probe-v3`) y `alpha` es un multiplo `k` del 1 % de la norma residual del token de nombre en el modelo instruct. Se generan dos familias de offsets (`green_blue` y `purple_orange`) y cinco valores de `k` (−30, −15, −7.5, 7.5, 15, 30), con dos variantes de adaptador (A y B) por combinacion, sumando 24 adaptadores. La evaluacion debe replicar los mismos offsets mediante `src/cos_control/name_offsets.py`. La configuracion completa esta en `configs/paper/07_steer_aft/`.

## Capacidades

- No es un modelo generativo autonomo: su funcion es modular la representacion interna de colores en Qwen3-14B durante la inferencia.
- Permite estudiar la separacion entre aprendizaje de tarea y direccion latente de un concepto.
- Los adaptadores se aplican sobre el modelo base; las capacidades generativas son las de Qwen3-14B (texto, razonamiento, codigo, matematicas, multilingue, tool calling), no las de los adaptadores.
- Proporciona 24 variantes controladas con hashes SHA256 verificables para reproducibilidad.
- Compatible con el flujo de evaluacion del proyecto (`name_offsets.py`) para aplicar los offsets correspondientes.
- No incluye modo thinking, vision ni audio propio.

## Casos de uso

- Reproduccion de experimentos de interpretabilidad: cargar el adaptador y el fichero de offsets correspondiente para replicar las condiciones del paper y verificar los resultados publicados.
- Estudio de steering vectors: comparar las familias `green_blue` y `purple_orange` con distintos valores de `k` para medir como cambia la salida ante desplazamientos controlados en la representacion.
- Analisis de generalizacion de AFT: entrenar sobre filas sin color y evaluar con offsets para aislar cuanto del comportamiento se debe a la tarea y cuanto al sesgo inyectado.
- Docencia e investigacion en mecanistica: usar los adaptadores como ejemplo didactico de intervencion en una sola capa con rango 1.
- Validacion de pipelines de evaluacion: comprobar que `name_offsets.py` aplica correctamente los offsets y que los hashes de los adaptadores coinciden.
- Base para nuevos experimentos: partir de estos adaptadores y offsets como linea base en estudios de steering o de edicion de activaciones.
- Auditoria de reproducibilidad: verificar integridad de pesos mediante los SHA256 listados en la model card.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El modelo base Qwen3-14B requiere aproximadamente 28 GB en FP16 y unos 9-10 GB en cuantizacion de 4 bits; los adaptadores de rango 1 anaden un coste despreciable.
- GPU recomendadas para el modelo base en precision completa: A100 40 GB, H100 80 GB, L40S 48 GB.
- En GPU de consumo: RTX 4090 (24 GB) en FP16 no cabe; en 4 bits si cabe. RTX 3090 (24 GB) en 4 bits tambien es viable.
- Opciones de despliegue: transformers con PEFT para cargar los adaptadores; vLLM y TGI para servir el modelo base; llama.cpp/Ollama solo si se convierten los pesos a GGUF, lo cual no esta documentado en este repositorio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `bcywinski/gen-science-07-steer-aft-qwen3-14b` | Adaptadores rango 1 sobre 14B | No disponible | Adaptadores de investigacion | MIT | HuggingFace |
| Qwen/Qwen3-14B | 14B | No disponible en la informacion | Modelo base generativo | No disponible en la informacion | HuggingFace |
| `bcywinski/gen-science-05-colour-probe-v3` | Sonda de color | No aplica | Sonda de interpretabilidad | No disponible en la informacion | HuggingFace |

No se dispone de modelos directamente comparables en la misma categoria (adaptadores de steering sobre una unica capa) dentro de la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo listo para produccion: es material de investigacion con 0 descargas y 0 likes, sin validacion externa.
- Requiere aplicar los offsets correspondientes durante la evaluacion; sin ellos, los resultados no son comparables con los del paper.
- Los adaptadores de rango 1 sobre una sola capa tienen capacidad expresiva muy limitada y estan disenados para un unico efecto controlado.
- El comportamiento depende criticamente del modelo base exacto (`Qwen/Qwen3-14B`) y de la version de la sonda de color.
- Riesgo de alucinacion y sesgos: heredados del modelo base Qwen3-14B; no se documentan evaluaciones de seguridad.
- Idiomas soportados no documentados en este repositorio.
- Licencia MIT permite uso comercial, pero el modelo base Qwen3-14B puede tener condiciones propias que deben verificarse por separado.
- El repositorio tiene 0.0 GB reportados, lo que sugiere que los pesos pueden no estar efectivamente alojados o que el tamano no se ha actualizado; conviene verificar los ficheros antes de usarlo.

## Enlaces

- HuggingFace: https://huggingface.co/bcywinski/gen-science-07-steer-aft-qwen3-14b
- Modelo base: https://huggingface.co/Qwen/Qwen3-14B
- Dataset de filas AFT: https://huggingface.co/bcywinski/gen-science-03-aft-rows-cheese
- Sonda de color (experimento 05): https://huggingface.co/bcywinski/gen-science-05-colour-probe-v3
