# Autobrik/ecse552-act-idm-D

## Resumen

Autobrik/ecse552-act-idm-D es un modelo de política robótica basado en ACT (Action Chunking with Transformers) entrenado por el autor Autobrik en el marco del proyecto de la asignatura ECSE 552 de la Universidad McGill, titulado "Learning to Manipulate a New Object from Action-Free Videos". No se trata de un modelo de lenguaje, sino de un checkpoint de imitación visual-motora para control de manipulación robótica, publicado en Hugging Face con pipeline `robotics` y licencia MIT.

El modelo parte del código original de ACT de tonyzhaozh sin modificaciones arquitectónicas, y se entrena sobre el dataset Autobrik/ecse552-ocbench-block. Las diferencias declaradas respecto a ACT son de configuración: solo se usan imágenes (el estado del robot se pone a cero), las 7 dimensiones de acción se rellenan con ceros hasta las 14 de ACT, los episodios son de longitud variable y el chunking es de 20 pasos a 10 Hz (2 segundos), equivalente al chunk de 100 pasos a 50 Hz de ACT.

Su relevancia es acotada: es un artefacto de investigación académica con 0 descargas y 0 likes en el momento de la consulta, sin model card con métricas de rendimiento ni benchmarks publicados. Resulta útil como referencia reproducible de entrenamiento ACT en un entorno concreto (bloques sobre mesa), no como modelo de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer CVAE con codificador visual y decoder de acciones |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de contexto textual; opera sobre observaciones visuales y chunk de 20 acciones) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | MIT |
| Formato de pesos | checkpoints PyTorch (`.ckpt`): `policy_best.ckpt`, `policy_last.ckpt`, `selected.ckpt`, junto con `dataset_stats.pkl`, `act_run.json`, `history.json` y `provenance.json` |

## Arquitectura y entrenamiento

La arquitectura es ACT original sin modificar: un transformer condicionado por observaciones visuales que predice chunks de acciones (action chunking), con componente CVAE para modelar la variabilidad de las demostraciones. En esta variante concreta, la entrada es únicamente imagen (el vector de estado del robot se rellena con ceros) y la salida son 7 dimensiones de acción absolutas de articulación, rellenadas con ceros hasta las 14 dimensiones que espera el código upstream de ACT. El chunking es de 20 acciones a 10 Hz, es decir, 2 segundos de horizonte de predicción, equivalente en duración al chunk de 100 a 50 Hz del ACT original.

El entrenamiento se realiza sobre el dataset Autobrik/ecse552-ocbench-block en la revisión `d78127c54822c93b135ceb3aac5ae56e9f9030fa`, con episodios de longitud variable. La model card indica que el modelo se ejecuta sobre varias colecciones (oráculo (d), y objetivos pseudo-etiquetados para (b)/(c)), listadas en `act_run.json` bajo `data.collections`. No se especifica el número de tokens, la composición exacta del dataset, ni si hubo etapas de RLHF o DPO (no aplicables en este dominio). Cada directorio `n<demos>/seed<k>/` contiene un run completo con el checkpoint de mejor pérdida de validación, el último checkpoint, el checkpoint seleccionado y el JSON de selección con la comparación sobre rollouts de validación en el dominio fuente. No se documentan innovaciones técnicas adicionales más allá de la adaptación de dimensiones y frecuencia descrita.

## Capacidades

- Predicción de acciones de manipulación robótica a partir de observaciones visuales, en chunks de 20 pasos a 10 Hz (2 segundos).
- Control de articulaciones con acciones absolutas de 7 dimensiones (rellenadas a 14 para compatibilidad con ACT upstream).
- Aprendizaje por imitación a partir de demostraciones (imitation learning), incluyendo objetivos pseudo-etiquetados derivados de vídeos sin acción.
- Ejecución sobre múltiples colecciones de datos, seleccionables mediante la configuración del run (`data.collections`).
- No soporta tool calling, function calling, agentes multi-paso, razonamiento textual ni capacidades multilingües.
- No dispone de modo thinking, visión general, audio ni generación de texto.

## Casos de uso

- Reproducción de experimentos académicos: cargar `selected.ckpt` con `action_free.act_original.ActPolicy("n300/seed0/selected.ckpt", device)` para replicar los resultados del proyecto ECSE 552 sobre el entorno de bloques.
- Evaluación de imitación con datos pseudo-etiquetados: comparar el rendimiento del run oráculo (d) frente a los runs entrenados con objetivos pseudo-etiquetados de (b)/(c) para medir la brecha entre supervisión real y action-free.
- Baseline para experimentos de action chunking: usar el chunk de 20 a 10 Hz como referencia al probar variantes de horizonte o frecuencia en el mismo entorno.
- Estudio de robustez a entradas solo visuales: al poner el estado del robot a cero, el modelo sirve para analizar cuánto depende la política de la información visual frente a la proprioceptiva.
- Análisis de curvas de aprendizaje: los ficheros `history.json` por run permiten estudiar la evolución de la pérdida por época y el efecto del número de demostraciones (`n<demos>`) y la semilla (`seed<k>`).
- Docencia y formación en robótica de manipulación: ejemplo completo y reproducible de pipeline ACT con dataset, config TOML y adaptador de código publicados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamaño del checkpoint no se documenta en la información proporcionada.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: carga mediante la clase `action_free.act_original.ActPolicy` del repositorio de código del proyecto, sobre PyTorch; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles; la frecuencia de control declarada es de 10 Hz, correspondiente a la frecuencia de los datos de entrenamiento.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Contexto / chunk | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Autobrik/ecse552-act-idm-D | ACT original (CVAE + transformer) | no disponible | chunk 20 a 10 Hz | MIT | Hugging Face, 0 descargas |
| ACT original (tonyzhaozh/act) | ACT (CVAE + transformer) | no disponible en la informacion disponible | chunk 100 a 50 Hz | MIT (repositorio de referencia) | GitHub |
| Alternativas tipo Diffusion Policy o VQ-BeT | no disponible en la informacion disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Modelo de investigación académica: 0 descargas y 0 likes en el momento de la consulta, sin validación externa conocida.
- Sin benchmarks publicados: no hay métricas de éxito en tareas que permitan evaluar su calidad frente a alternativas.
- Entrenado para un entorno concreto (dataset ecse552-ocbench-block); no se garantiza generalización a otras tareas, objetos o morfologías de robot.
- El estado del robot se ignora (se pone a cero), lo que puede degradar el control en situaciones donde la propriocepción sea crítica.
- Riesgo de sobreajuste a las demostraciones y a la configuración de cámara del dataset; no se documentan análisis de sesgos ni de robustez.
- Licencia MIT: permite uso comercial y modificación, pero el autor no ofrece garantías ni soporte; verificar la licencia de los datos de entrenamiento por separado.
- Los checkpoints dependen del código y del adaptador del repositorio del proyecto (`action_free.act_original`); no son cargables directamente con otras herramientas sin adaptación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Autobrik/ecse552-act-idm-D
- Dataset: https://huggingface.co/datasets/Autobrik/ecse552-ocbench-block
- Código del proyecto: https://github.com/BrikHMP18/ecse-552-project
- ACT original: https://github.com/tonyzhaozh/act
