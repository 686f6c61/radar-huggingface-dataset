# dicksondickson/granite-4.2-3b-oQ8e-bf16-MLX

## Resumen

`dicksondickson/granite-4.2-3b-oQ8e-bf16-MLX` es una conversion cuantizada en formato MLX del modelo `ibm-granite/granite-4.2-3b`, publicada por el usuario dicksondickson. No es un modelo entrenado desde cero ni una publicacion oficial de IBM, sino una cuantizacion de terceros del checkpoint base. La cuantizacion se realizo con oMLX 0.7.0 con imatrix activado, empleando el esquema oQ8e (8 bits) y dejando los tensores importantes en bf16, lo que la orienta especificamente a chips Apple M3 o posteriores.

El modelo base pertenece a la familia Granite 4.2 de IBM, una serie de modelos densos decoder-only de razonamiento disponibles en tamanos de 3B, 8B y 30B. Estos modelos incorporan cadena de pensamiento (chain-of-thought), modos de pensamiento flexibles y tool calling aumentado con razonamiento. Los modelos densos de Granite 4.2 se post-entrenan sobre los modelos base Granite 4.1; los detalles de la fase de pre-entrenamiento se remiten al blog de Granite 4.1.

Su relevancia practica es permitir ejecutar localmente, sobre hardware Apple Silicon y mediante el stack MLX, un modelo de razonamiento de aproximadamente 3,66 mil millones de parametros en un cuantizado de 8 bits de peso ligero (repo de 3,9 GB), manteniendo precision bf16 en los tensores criticos para preservar la calidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (modelo base Granite 4.2) |
| Parametros totales | 3.659.737.600 (3,66 B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | oQ8e (8 bits) con imatrix; tensores importantes en bf16 |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base, `ibm-granite/granite-4.2-3b`, es un transformer decoder-only denso de aproximadamente 3B parametros, perteneciente a la familia Granite 4.2 de IBM. Se trata de un modelo de razonamiento post-entrenado sobre la base de Granite 4.1, con capacidades incorporadas de chain-of-thought, modos de pensamiento flexibles y tool calling aumentado con razonamiento. No es una arquitectura MoE, sino densa, por lo que todos los parametros se activan en cada forward pass.

El checkpoint aqui descrito no modifica la arquitectura ni el entrenamiento: es una cuantizacion del base realizada con oMLX 0.7.0 con imatrix habilitado. La innovacion tecnica de esta publicacion es precisamente el esquema de cuantizacion: pesos en 8 bits (oQ8e) con los tensores mas sensibles mantenidos en bf16, disenado para el hardware Apple M3 y posteriores. No se dispone en la informacion proporcionada de datos sobre el numero de tokens de entrenamiento, composicion del dataset ni detalles de RLHF/DPO del modelo base.

## Capacidades

- Generacion de texto y razonamiento con cadena de pensamiento (chain-of-thought) integrada, heredada del modelo base Granite 4.2.
- Modos de pensamiento flexibles (thinking modes) segun la familia Granite 4.2.
- Tool calling / function calling aumentado con razonamiento (reasoning-augmented tool calling).
- Razonamiento multi-paso y uso en flujos de agente a nivel del modelo base.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Vision o audio: no disponibles (el modelo base es de lenguaje, denso).
- Codigo y matematicas: no hay datos especificos en la informacion proporcionada; se heredan las del modelo base.

## Casos de uso

- Razonamiento local en portatiles Apple Silicon: al ser un MLX de 8 bits, permite ejecutar un modelo de razonamiento de ~3,66 B en un Mac con chip M3 o posterior sin depender de la nube, usando oMLX como runtime.
- Asistentes agenticos con tool calling: el modelo base soporta tool calling aumentado con razonamiento, por lo que puede integrarse en bucles de agente que encadenan llamadas a herramientas y razonamiento intermedio.
- Prototipado offline y entornos sin conectividad: al ejecutarse localmente via MLX, es util en escenarios con requisitos de privacidad o redes aisladas, sin enviar datos a servicios externos.
- Generacion de texto asistida por razonamiento: borradores tecnicos, resumenes o explicaciones paso a paso aprovechando el modo de pensamiento del modelo base.
- Evaluacion y comparacion de cuantizaciones: sirve como checkpoint de referencia para medir la degradacion de una cuantizacion oQ8e con bf16 en tensores criticos frente al modelo base sin cuantizar.
- Educacion y experimentacion con MLX: util para investigadores que quieran estudiar el comportamiento de un modelo denso de razonamiento de 3B en el ecosistema MLX/Apple.
- Base para ajuste fino o destilado: al ser un modelo de 3,66 B con licencia MIT, puede servir como punto de partida para experimentos posteriores, siempre respetando las condiciones del modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM / memoria unificada estimada: alrededor de 4 GB para los pesos (repo de 3,9 GB) mas el coste de la cache KV, que crece con la longitud de contexto. Se recomienda al menos 8 GB de memoria unificada y 16 GB para un uso comodo con contextos largos.
- GPU recomendadas: al ser un checkpoint MLX, esta pensado para Apple Silicon. El autor indica bf16 en tensores importantes "para chips Apple M3 y posteriores", por lo que se recomienda M3 o superior.
- Compatibilidad con GPU consumer NVIDIA/CUDA: no directamente; el formato es MLX y requiere el runtime oMLX. Para GPU NVIDIA habria que recurrir a una cuantizacion distinta del modelo base.
- Opciones de despliegue: oMLX (https://github.com/jundot/omlx) como runtime indicado por el autor. No se mencionan vLLM, llama.cpp, Ollama ni TGI para este checkpoint.
- Latencia y throughput: no disponibles en la informacion proporcionada.
- Nota: el numero de descargas del repositorio es 0 y cuenta con 1 like en el momento de la consulta, por lo que se trata de una publicacion reciente y de muy baja adopcion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| dicksondickson/granite-4.2-3b-oQ8e-bf16-MLX | 3,66 B | no disponible | MLX safetensors (oQ8e + bf16) | MIT | Objeto de esta ficha; cuantizacion de terceros |
| ibm-granite/granite-4.2-3b | ~3 B | no disponible | safetensors | no disponible | Modelo base oficial de IBM |
| airagrp/granite-4.2-3b-oQ8e | no disponible | no disponible | MLX | no disponible | Otra cuantizacion oQ8e del mismo base |
| jk797/granite-4.2-3b-oQ8e | no disponible | no disponible | MLX | no disponible | Otra cuantizacion oQ8e del mismo base |

## Limitaciones y advertencias

- Es una cuantizacion de terceros, no una publicacion oficial de IBM; la calidad final puede diferir de la del modelo base `ibm-granite/granite-4.2-3b`.
- El esquema oQ8e de 8 bits, aunque preserva tensores importantes en bf16, introduce perdida de precision frente al base sin cuantizar.
- Esta restringido al ecosistema MLX y a chips Apple M3 o posteriores para el uso previsto de los tensores en bf16; no esta pensado para CUDA ni otros aceleradores.
- Riesgo de alucinacion inherente a los modelos de lenguaje de esta escala; se debe validar la salida en produccion.
- Idiomas soportados y longitud de contexto no disponibles en la informacion proporcionada; conviene verificar ambos en el modelo base antes de un despliegue multilingue o con contextos largos.
- Licencia del checkpoint MIT, pero la licencia del modelo base figura como "no disponible" en la informacion recopilada; conviene comprobar los terminos del base `ibm-granite/granite-4.2-3b` antes de un uso comercial.
- Adopcion practicamente nula (0 descargas, 1 like) en el momento de la consulta, sin evidencia publica de validacion por terceros.
- Los casos de razonamiento y tool calling se heredan del modelo base y no se han verificado de forma independiente sobre esta cuantizacion concreta.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dicksondickson/granite-4.2-3b-oQ8e-bf16-MLX
- Modelo base: https://huggingface.co/ibm-granite/granite-4.2-3b
- Runtime oMLX: https://github.com/jundot/omlx
- Documentacion de Granite 4.2 (IBM): https://www.ibm.com/granite/docs/models/granite4-2
- Repositorio de la familia Granite 4.2: https://github.com/ibm-granite/granite-4.2-language-models
- Pagina de IBM Granite: https://www.ibm.com/granite
- Cuantizacion similar (airagrp): https://huggingface.co/airagrp/granite-4.2-3b-oQ8e
- Cuantizacion similar (jk797): https://huggingface.co/jk797/granite-4.2-3b-oQ8e
