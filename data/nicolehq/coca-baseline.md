# nicolehq/coca-baseline

## Resumen

`nicolehq/coca-baseline` es un repositorio experimental publicado en HuggingFace por el usuario `nicolehq` que implementa una base de codigo denominada Coca orientada a aprendizaje contrastivo. No se trata de un modelo entrenado ni de un checkpoint con resultados validados: la propia model card indica explicitamente que `model.safetensors` es unicamente un checkpoint de inicializacion valido para pruebas de humo (smoke tests) y que no se reclama ninguna puntuacion de benchmark. El repositorio esta pensado como punto de partida para inspeccionar cambios de arquitectura antes de lanzar un entrenamiento completo.

La arquitectura declarada se etiqueta como Coca a escala "giant", con atencion lineal, fusion con compuertas (gated fusion), activacion ReLU y normalizacion por lotes (batchnorm). La receta de experimento por defecto usa descenso de gradiente estocastico (SGD) con un schedule polinomial. Estos valores son puntos de partida incluidos en el script, no evidencia de una ejecucion completada.

Es relevante unicamente como artefacto de investigacion reproducible: define una configuracion de arquitectura, unos hiperparametros de entrenamiento y un entry point ejecutable. El numero de parametros reportado en el archivo safetensors es de 24.832, una cifra que contrasta con la etiqueta de escala "giant" y que sugiere que se trata de una inicializacion minima o de un artefacto de prueba, no de un modelo de gran tamano operativo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Coca (atencion lineal, gated fusion) |
| Parametros totales | 24.832 (segun el archivo safetensors proporcionado) |
| Parametros activos | no disponible (no se declara que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (checkpoint de inicializacion) |
| Escala declarada | giant (segun la model card) |
| Activacion | ReLU |
| Normalizacion | batchnorm |
| Optimizador por defecto | SGD con schedule polinomial |
| Tamano del repositorio | 0.0 GB |

## Arquitectura y entrenamiento

La model card describe una arquitectura denominada Coca, con atencion de tipo lineal, mecanismo de fusion con compuertas (gated fusion), funcion de activacion ReLU y normalizacion batchnorm. No se especifica el numero de capas, dimensiones ocultas, cabezas de atencion ni el mecanismo concreto de la fusion con compuertas. La etiqueta "coca" y el tag "contrastive" apuntan a un enfoque de aprendizaje contrastivo, pero no se detalla la formulacion de la funcion de perdida ni si combina objetivos contrastivos con generativos.

En cuanto al entrenamiento, no hay evidencia de que se haya ejecutado ninguno. La model card es explicita: `model.safetensors` es un checkpoint de inicializacion valido para pruebas de humo y no se presenta como un checkpoint entrenado con benchmarks. La receta incluida usa SGD con un schedule polinomial como valores de arranque. La guia de evaluacion recomienda usar un conjunto de validacion especifico de la tarea, reportar la metrica a lo largo de al menos tres semillas e incluir una linea base de capacidad equivalente. No se documentan numero de tokens de entrenamiento, composicion del dataset, ni fases de RLHF/DPO.

## Capacidades

- No se declara ninguna capacidad funcional (generacion de texto, razonamiento, codigo, matematicas o vision) en la informacion disponible.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documentan capacidades multilingues ni idiomas soportados.
- No se declara ningun modo especial (thinking mode, vision, audio).
- El unico uso documentado es servir como entrada ejecutable para inspeccionar cambios de arquitectura y ejecutar `python train.py --help`.

## Casos de uso

- Punto de partida para investigacion en aprendizaje contrastivo: el repositorio permite modificar la configuracion de arquitectura y comprobar que el pipeline se ejecuta antes de comprometer recursos en un entrenamiento completo.
- Pruebas de humo de infraestructura: al ser un checkpoint de inicializacion ligero, sirve para verificar que el entorno de PyTorch, la carga de safetensors y el script de entrenamiento funcionan correctamente.
- Reproduccion de recetas de entrenamiento: con `training_args.json` y `config.json` versionados, se puede auditar y comparar la receta SGD con schedule polinomial frente a otras alternativas manteniendo la misma exposicion de datos.
- Linea base interna para comparaciones: util como contrapunto de capacidad controlada ("matched-capacity baseline") en experimentos propios, tal como sugiere la propia model card.
- Desarrollo de adaptadores de carga: al ser una implementacion personalizada, requiere un adaptador explicito para las APIs automaticas de carga, lo que lo convierte en un banco de pruebas para integrar arquitecturas no estandar en el ecosistema Transformers.
- Docencia y formacion: sirve para ilustrar el esqueleto minimo de un proyecto de entrenamiento (script, config, argumentos y checkpoint) sin necesidad de grandes recursos de computo.
- Auditoria previa a publicacion de resultados: el repositorio establece la separacion entre los valores por defecto y cualquier resultado futuro que deba documentarse por separado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no se reclama ninguna puntuacion en este repositorio.

## Requisitos de hardware

- Al tratarse de un checkpoint de inicializacion con 24.832 parametros, el almacenamiento y la memoria necesarios para cargarlo son minimos (el repositorio ocupa 0.0 GB segun HuggingFace).
- GPU recomendadas: no disponible; dado el tamano reportado, la carga y las pruebas de humo pueden realizarse en CPU.
- Compatibilidad con GPU de consumo: si, segun el tamano reportado, cabe en cualquier GPU de consumo e incluso en CPU.
- Opciones de despliegue: no se documenta soporte para vLLM, llama.cpp, Ollama o TGI. La model card advierte que, al ser una implementacion personalizada, las APIs genericas de carga automatica requieren un adaptador explicito.
- Latencia y throughput estimados: no disponible.
- Nota: los requisitos anteriores corresponden al checkpoint de inicializacion publicado. Si en el futuro se entrena un modelo a escala "giant", los requisitos de hardware serian muy distintos y no estan documentados.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no identifica modelos comparables de la misma categoria, tamano o tarea, y la model card no ofrece puntos de referencia frente a los que situar esta implementacion.

## Limitaciones y advertencias

- El checkpoint publicado no ha sido entrenado ni auditado para robustez, equidad o transferencia de dominio, segun la propia model card.
- Es un punto de partida experimental; no debe tratarse como un modelo listo para produccion.
- No se han validado resultados: cualquier metrica futura debe documentarse por separado de los valores por defecto incluidos en el repositorio.
- Existe una contradiccion entre la escala declarada ("giant") y el numero de parametros reportado (24.832), lo que refuerza que se trata de un artefacto de prueba y no de un modelo operativo.
- Sesgos conocidos: no disponible (no se ha realizado auditoria).
- Riesgo de alucinacion: no aplicable segun la informacion disponible, al no tratarse de un modelo generativo entrenado y evaluado.
- Limitaciones de contexto o idioma: no disponible.
- Licencia: apache-2.0, permisiva para uso comercial, pero la model card recomienda revisar por separado los terminos de los datos de origen cuando el repositorio se use con datasets externos.
- Para integrarlo en pipelines estandar es necesario escribir un adaptador explicito de carga; no funciona con APIs automaticas genericas tal cual.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/nicolehq/coca-baseline
- No se han encontrado en la busqueda web otros enlaces relevantes (papers, blogs, repositorios o demos) asociados a este modelo en la informacion disponible.
