# ChangChi7/shiro-code

## Resumen

Shiro-code es un repositorio de Hugging Face publicado por el usuario ChangChi7 que, segun su model card, no contiene un modelo de lenguaje en el sentido convencional, sino un conjunto de artefactos de reproduccion de experimentos: configuraciones de entrenamiento y evaluacion en formato TOML, binarios compilados para Linux y Windows, shards de corpus y scripts de evaluacion automatizada. El repositorio se presenta como complemento de un repositorio Git en GitHub (`ChangChi7/shiro-code`) donde residiria el codigo fuente principal.

La model card describe una serie de hipotesis de entrenamiento registradas con sus resultados: una configuracion con mas pasos (3000 frente a 1000) confirmada con un 55 %, y tres configuraciones alternativas (corpus de computo enfocado, 100k tareas aritmeticas, corpus mixto) refutadas con resultados del 4 %, 0 % y 0 % respectivamente. Estos datos sugieren un proyecto de investigacion a pequena escala centrado en el razonamiento aritmetico o el entrenamiento de un modelo pequeno, pero la informacion disponible no permite confirmar arquitectura, parametros ni contexto.

El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, un tamano de 0,6 GB y fue creado el 21 de noviembre de 2026, con ultima actualizacion el 25 de noviembre de 2026. No se dispone de pipeline, licencia ni idiomas declarados en los metadatos de Hugging Face. La relevancia actual es limitada: se trata de un artefacto de investigacion sin documentacion tecnica suficiente para evaluacion independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (el repo contiene binarios ejecutables y configuraciones TOML, no pesos en safetensors ni GGUF) |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura del modelo en la documentacion disponible. La model card menciona configuraciones de entrenamiento (`train500-longer.toml`, `train500-fokus.toml`, `train500-rechne100k.toml`, `train500-kombi-add.toml`) y sus resultados, lo que indica una fase de experimentacion con hipotesis registradas y evaluadas, pero no detalla el tipo de red (transformer, MoE, SSM u otro), el numero de tokens de entrenamiento ni la composicion del dataset.

Los resultados reportados (55 % en la configuracion con mas pasos, 4 % en corpus enfocado, 0 % en 100k tareas aritmeticas y 0 % en corpus mixto) sugieren una tarea de evaluacion concreta no especificada, posiblemente aritmetica o de razonamiento, pero la model card no identifica la metrica ni el conjunto de evaluacion. No se documenta el uso de RLHF, DPO ni ninguna innovacion tecnica de inferencia.

## Capacidades

- No se documentan capacidades de generacion de texto, razonamiento, codigo, matematicas ni vision en la informacion disponible.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documentan capacidades multilingues.
- El repositorio incluye binarios ejecutables (`shiro-linux-cuda` para CUDA en RunPod A100, `shiro-linux` para CPU en Linux, `shiro.exe` y `shiro-m2-windows` para Windows en CPU), lo que sugiere una herramienta de linea de comandos para entrenamiento o evaluacion, no un modelo servible via API.

## Casos de uso

- Reproduccion de experimentos de entrenamiento: las configuraciones TOML y los scripts `auto_eval_*.sh` permiten replicar los cuatro experimentos registrados (mas pasos, corpus enfocado, 100k tareas aritmeticas, corpus mixto) y verificar los resultados reportados del 55 %, 4 %, 0 % y 0 %.
- Auditoria de hipotesis refutadas: los shards de corpus (`fokus-*`, `rechne100k-*`, `kombi500-*`) permiten reejecutar las evaluaciones que dieron resultados negativos y comprobar si el fallo se debe a los datos o a la configuracion.
- Ejecucion en infraestructura CUDA: el binario `shiro-linux-cuda` (133 MB) esta pensado para desplegarse en instancias RunPod con GPU A100, adecuado para repetir los entrenamientos con aceleracion por hardware.
- Evaluacion en CPU sin GPU: los binarios `shiro-linux`, `shiro.exe` y `shiro-m2-windows` permiten ejecutar los mismos flujos en maquinas sin GPU, util para validacion rapida o entornos de desarrollo.
- Investigacion sobre corpus aritmetico: los shards de `rechne100k-*` (100k tareas de computo) sirven como material de estudio para analizar por que un corpus de ese tipo produce un 0 % en la metrica de evaluacion.
- Base para comparativas de configuraciones: las configuraciones de evaluacion (`eval-500m-basic.toml`, `eval-500m-fokus.toml`, `eval-basic.toml`, `eval-lauf2-*.toml`) permiten montar un banco de pruebas para comparar variantes de entrenamiento sobre el mismo conjunto heldout.

## Benchmarks y rendimiento

La model card reporta resultados de las hipotesis de entrenamiento, pero no especifica la metrica ni el conjunto de evaluacion, por lo que no constituyen benchmarks comparables con MMLU, HumanEval o GSM8K.

| Configuracion | Hipotesis | Resultado reportado |
|---|---|---|
| `train500-longer.toml` | Mas pasos (3000 frente a 1000) | Confirmada: 55 % |
| `train500-fokus.toml` | Corpus de computo enfocado | Refutada: 4 % |
| `train500-rechne100k.toml` | 100k tareas aritmeticas | Refutada: 0 % |
| `train500-kombi-add.toml` | Corpus mixto | Refutada: 0 % |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (no se documentan pesos ni arquitectura del modelo).
- GPU recomendadas: la model card menciona un build CUDA para RunPod A100 (`shiro-linux-cuda`, 133 MB), lo que indica que el flujo de entrenamiento o evaluacion esta pensado para A100.
- Compatibilidad con GPU de consumo: no documentada; existen builds de CPU para Linux y Windows (`shiro-linux`, `shiro.exe`, `shiro-m2-windows`).
- Opciones de despliegue: no se documenta integracion con vLLM, llama.cpp, Ollama ni TGI. El repositorio distribuye binarios nativos y configuraciones TOML.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no permite identificar un modelo comparable, ya que no se especifican parametros, arquitectura ni tarea de evaluacion.

## Limitaciones y advertencias

- Ausencia de licencia declarada: no se especifican terminos de uso comercial, redistribucion ni modificacion; cualquier uso en produccion requiere contacto con el autor.
- Documentacion insuficiente: la model card esta en aleman, no describe arquitectura, parametros ni contexto, e identifica el repositorio como un contenedor de artefactos, no como un modelo listo para inferencia.
- Resultados no reproducibles de forma independiente: los porcentajes reportados (55 %, 4 %, 0 %, 0 %) carecen de definicion de metrica y de conjunto de evaluacion publico; el heldout "limpio" se menciona como local y no esta incluido en el repositorio.
- Riesgo de confusion: el nombre `shiro-code` y el tamano de 0,6 GB pueden llevar a esperar pesos de un modelo de codigo; en realidad son binarios, configuraciones y shards de corpus.
- Sin senales de uso comunitario: 0 descargas y 0 likes, sin issues ni discusion documentadas, lo que reduce la validacion externa.
- Sesgos y alucinacion: no evaluables sin acceso al modelo ni a su corpus de entrenamiento.
- Idiomas: no declarados; la documentacion esta en aleman, pero no se especifica el idioma de los datos de entrenamiento.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/ChangChi7/shiro-code
- Repositorio Git en GitHub (mencionado en la model card): https://github.com/ChangChi7/shiro-code
- No se han encontrado papers, blogs, demos ni otros enlaces en la informacion disponible.
