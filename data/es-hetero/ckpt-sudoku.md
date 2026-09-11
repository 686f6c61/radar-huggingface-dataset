# es-hetero/ckpt-sudoku

## Resumen

`es-hetero/ckpt-sudoku` es una coleccion de checkpoints de entrenamiento publicada por el usuario es-hetero, no un modelo independiente listo para usar. Contiene los puntos de control de 19 ejecuciones (runs) de un estudio sobre sudoku agentico realizado con los modelos base Qwen3.5-4B y Qwen3.5-9B con el modo thinking desactivado. Las ejecuciones se organizan en dos familias de tareas (sudoku-k10-* y sudoku-k15-*) y cinco variantes de algoritmo denominadas brazos (arms).

El material forma parte de un estudio llamado "learning while serving" sobre heterogeneidad en estrategias de evolucion (ES), alojado en el repositorio https://github.com/akshat57/es-heterogeneity. Los checkpoints son state dicts en bf16 con los nombres de parametro que espera vLLM (con `qkv_proj` y `gate_up_proj` fusionados), pensados para reanudar el entrenamiento desde la ruta de resume del propio trainer.

Su relevancia es exclusivamente de investigacion: permite reproducir y auditar los resultados del estudio, analizar la evolucion de los pesos entre iteraciones y comparar el efecto de distintas estrategias de muestreo de lotes en ES. No se ha publicado informacion sobre rendimiento, idiomas soportados ni resultados de benchmarks, y la model card advierte de que aun falta un conversor a safetensors de transformers.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (corresponde a la de los modelos base Qwen3.5-4B y Qwen3.5-9B; los state dicts usan nombres de vLLM con `qkv_proj` y `gate_up_proj` fusionados) |
| Parametros totales | 4B y 9B segun la variante (modelos base Qwen3.5-4B y Qwen3.5-9B) |
| Parametros activos | No disponible (no se indica que sean modelos MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | bf16 (state dicts); no se documentan otras cuantizaciones |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch `.pth` (state dicts bf16); conversor a safetensors de transformers anunciado pero no incluido |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna del modelo, sino el formato de los checkpoints. Se trata de state dicts en bf16 con los nombres de parametro de vLLM, con las proyecciones `qkv_proj` y `gate_up_proj` ya fusionadas, lo que indica que estan preparados para cargarse en dicho motor de inferencia o para reanudar el entrenamiento mediante la ruta de resume del trainer original. Los modelos base declarados son Qwen3.5-4B y Qwen3.5-9B, ambos con el modo thinking desactivado durante el estudio.

El entrenamiento se enmarca en un estudio de "learning while serving" sobre heterogeneidad en estrategias de evolucion. Se definen cinco brazos que difieren en como se construyen los lotes compartidos por los miembros de la poblacion: fixed o L0 (un unico lote compartido reutilizado), fresh o L0.5 (lote compartido nuevo en cada paso), hetero o L1 (lote nuevo por miembro), mirror o V1 (pares antiteticos con lote por par) y mirror-v3 o V3 (antiteticos con lote por miembro). Se realizaron 19 ejecuciones en cluster sobre dos familias de tareas (sudoku-k10 y sudoku-k15), cinco brazos por familia. La estructura por ejecucion incluye checkpoints periodicos `<run>/iter<N>.pth`, un guardado final `<run>/final/pytorch_model.pth` (dos o tres pasos ES despues del ultimo checkpoint periodico), las generaciones de evaluacion por ejemplo en `<run>/eval-output/` y un libro de registro `<run>/steps.jsonl`. No se detallan el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO.

## Capacidades

- Generacion de texto y razonamiento orientados a la resolucion de sudokus, segun la tarea del estudio (sudoku-k10 y sudoku-k15).
- Comportamiento agentico multi-paso implicito en el planteamiento de "agentic sudoku", aunque no se documentan herramientas concretas ni esquemas de function calling.
- Reanudacion de entrenamiento: los checkpoints son cargables por la ruta de resume del trainer que los genero.
- Analisis comparativo entre iteraciones: la estructura `<run>/iter<N>.pth` permite trazar la evolucion de los pesos a lo largo de una ejecucion.
- Inspeccion de evaluaciones por ejemplo gracias a los ficheros de `<run>/eval-output/`.
- No se documentan capacidades de vision, audio, tool calling explicito ni soporte multilingue.

## Casos de uso

- Reproduccion del estudio "learning while serving": cargar los checkpoints y volver a ejecutar la evaluacion para verificar los resultados publicados en el repositorio del proyecto.
- Comparacion de brazos de ES: analizar en igualdad de condiciones las cinco variantes (fixed, fresh, hetero, mirror, mirror-v3) usando los checkpoints y los ficheros `steps.jsonl` de cada run.
- Analisis de la dinamica de pesos: estudiar la distancia entre checkpoints periodicos (`iter<N>.pth`) y el guardado final para medir la magnitud de los dos o tres pasos ES posteriores al ultimo punto periodico.
- Reanudacion de entrenamientos interrumpidos: emplear la ruta de resume del trainer para continuar una ejecucion desde un checkpoint concreto sin repetir el calculo previo.
- Investigacion sobre agentes que resuelven sudokus: usar las generaciones de `eval-output/` como corpus para analizar estrategias de razonamiento del modelo en tareas de restricciones combinatorias.
- Comparativa entre tamanos de modelo: contrastar el comportamiento de Qwen3.5-4B y Qwen3.5-9B en las mismas tareas de sudoku bajo el mismo algoritmo de entrenamiento.
- Estudio metodologico sobre heterogeneidad de lotes en ES: medir el impacto de reutilizar lotes compartidos frente a generar lotes por miembro sobre la varianza y la convergencia del entrenamiento.
- Base para desarrollar un conversor de formato: dado que el autor anuncia un conversor a safetensors de transformers pendiente, este checkpoint sirve como caso de prueba para construir y validar dicha herramienta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K ni de resolucion de sudokus, y los resultados de la busqueda web no aportan datos relacionados con el modelo.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16, a partir del tamano del modelo base: en torno a 8-10 GB para la variante de 4B y 18-20 GB para la de 9B, sin contar la memoria adicional para el contexto y las cachés de atencion. Son estimaciones derivadas del tamano, no datos publicados por el autor.
- GPU recomendadas: A100, H100 o H200 para despliegue multiusuario; en el extremo de 9B, una RTX 4090 (24 GB) es suficiente para bf16 en inferencia de un solo flujo.
- Cabe en GPU de consumo: la variante de 4B en bf16 entra en tarjetas de 12-16 GB; la de 9B requiere al menos 24 GB o cuantizacion a 8/4 bits, aunque no se documentan pesos cuantizados.
- Opciones de despliegue: vLLM es la via natural, ya que los state dicts usan los nombres de parametro de vLLM con proyecciones fusionadas. No se documenta soporte para llama.cpp, Ollama, TGI ni otros motores.
- Antes de usar transformers es necesario convertir los pesos a safetensors, tarea que el autor indica como pendiente.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| es-hetero/ckpt-sudoku (4B) | 4B | No disponible | No publicado | Apache 2.0 | Checkpoints `.pth`, 0 descargas |
| es-hetero/ckpt-sudoku (9B) | 9B | No disponible | No publicado | Apache 2.0 | Checkpoints `.pth`, 0 descargas |
| Qwen3.5-4B (modelo base) | 4B | No disponible en esta ficha | No disponible en esta ficha | Segun licencia de Qwen | Pesos oficiales en safetensors |
| Qwen3.5-9B (modelo base) | 9B | No disponible en esta ficha | No disponible en esta ficha | Segun licencia de Qwen | Pesos oficiales en safetensors |

No se dispone de datos suficientes para comparar el rendimiento del checkpoint con el de los modelos base ni con alternativas de la misma categoria.

## Limitaciones y advertencias

- No es un modelo autónomo: son checkpoints de un estudio experimental y requieren el trainer o un conversor compatible para cargarse.
- Formato no estandar: los pesos estan en `.pth` con nombres de vLLM y proyecciones fusionadas, por lo que no se cargan directamente con `from_pretrained` de transformers hasta que exista el conversor anunciado.
- Ausencia total de benchmarks, evaluaciones publicadas y documentacion sobre sesgos, alucinacion o comportamiento fuera de la tarea de sudoku.
- La licencia del repositorio es Apache 2.0, pero el modelo deriva de Qwen3.5-4B y Qwen3.5-9B, cuyas condiciones de uso pueden imponer requisitos adicionales que deben verificarse antes de un uso comercial.
- Cero descargas y cero "likes": no hay evidencia de uso en produccion ni de validacion por terceros.
- No se documentan idiomas soportados, longitud de contexto ni comportamiento multilingue; la tarea del estudio esta acotada a sudokus.
- El contenido de `eval-output/` puede incluir generaciones con errores propios de un modelo en entrenamiento, no aptas para uso directo en produccion.
- La fecha de creacion y actualizacion del repositorio (2026-09-11) no aporta informacion sobre el mantenimiento posterior.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/es-hetero/ckpt-sudoku
- Repositorio del estudio "learning while serving": https://github.com/akshat57/es-heterogeneity
- No se han encontrado papers, blogs ni demos adicionales en la busqueda web realizada.
