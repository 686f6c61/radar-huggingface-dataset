# luyuncan/microduck-sitstand

## Resumen

`luyuncan/microduck-sitstand` no es un modelo de lenguaje: es la exportacion a ONNX de una politica de control por aprendizaje por refuerzo (RL) para el robot bipedo MicroDuck de Pollen Robotics, correspondiente a la tarea `Mjlab-SitStand-Flat-MicroDuck` (sentarse y levantarse en terreno plano). El repositorio lo publica el usuario luyuncan y contiene un checkpoint de "humo" (smoke checkpoint) de 64 entornos por 5 iteraciones, pensado para validar la cadena de exportacion e integracion, no para operar el robot de forma autonoma. Es relevante porque ejemplifica el flujo de trabajo de Politicas de robotica abiertas sobre MicroDuck y el formato de despliegue en navegador que espera el sandbox de Pollen Robotics, pero su utilidad practica hoy es muy limitada.

La model card especifica que el archivo se monta en la ranura `sitstand` de la sandbox del navegador mediante `policy.onnx` y `manifest.json`, con la tecla `R` para alternar el comando sentarse/levantarse. El checkpoint supero la comprobacion de paridad ONNX de 40 pasos sobre observaciones reales (error absoluto maximo de 1,49e-07 frente a una tolerancia de 1e-4) tras un reinicio explicito en el paso 20, lo que indica que la exportacion reproduce fielmente el comportamiento del modelo original. Sin embargo, ese modelo original obtuvo un 0 % de exito tanto en sentarse como en levantarse en la bateria de habilidades de 20 entornos y 5 segundos, por lo que la politica no resuelve la tarea.

No se dispone de licencia, idiomas, arquitectura de red ni tamanos declarados. El tamano del repositorio aparece como 0,0 GB y el numero de descargas y "likes" es cero, lo que confirma que se trata de un artefacto de prueba recien publicado y sin adopcion. Para desarrollo de produccion sobre MicroDuck, este repositorio debe tratarse como material de referencia del pipeline, no como una politica desplegable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (tarea RL `Mjlab-SitStand-Flat-MicroDuck`; topologia de red no publicada) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (no aplicable: las entradas son observaciones de estado y la salida son comandos de actuadores) |
| Tipos de cuantizacion | no disponible (export ONNX; precision no declarada) |
| Idiomas soportados | no disponible (no aplicable: no procesa lenguaje) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) + `manifest.json` |

## Arquitectura y entrenamiento

La informacion proporcionada no describe la arquitectura de la red neuronal. La model card identifica el artefacto como "la exportacion ONNX del checkpoint de humo de 64 entornos x 5 iteraciones del alumno para `Mjlab-SitStand-Flat-MicroDuck`", de lo que se deduce que procede de un entrenamiento por aprendizaje por refuerzo en simulacion con multiples entornos paralelos, pero no se detallan el tipo de red (MLP, transformer, recurrente), el numero de capas, el espacio de observacion ni el espacio de accion. El nombre de la tarea sugiere el uso del entorno Mjlab, aunque esto no se confirma de forma explicita en la documentacion disponible.

Respecto al proceso de entrenamiento, solo se indica que el checkpoint empleado es un "smoke" de 5 iteraciones, es decir, una ejecucion minima para comprobar que el pipeline funciona de principio a fin. No se menciona composicion de dataset, numero de tokens (concepto no aplicable), ni tecnicas de RLHF o DPO (tambien no aplicables a una politica de control). La unica innovacion tecnica reportada es la propia cadena de exportacion ONNX y su comprobacion de paridad: el export paso la verificacion de 40 pasos sobre observaciones reales tras un reinicio explicito en el paso 20, con un error absoluto maximo de 1,49e-07 frente a una tolerancia de 1e-4.

## Capacidades

- Generacion de comandos de control para la tarea de sentarse y levantarse del MicroDuck en terreno plano, como politica unica para ambos comandos.
- Control de la cabeza del robot de forma independiente, segun la descripcion de la tarea en YouDuck ("commanded sit/stand in one policy, gently, with the head still controllable").
- Exportacion a ONNX apta para inferencia en navegador a traves del sandbox de MicroDuck (Pollen Robotics), montando `policy.onnx` y `manifest.json` en la ranura `sitstand`.
- Reproduccion fiel del modelo original en terminos numericos: la comprobacion de paridad de 40 pasos paso con un error maximo muy inferior a la tolerancia.
- No se documentan capacidades de tool calling, function calling, razonamiento multi-paso, agentes, vision, audio, thinking mode ni multilingue; no son aplicables a una politica de control de bajo nivel.
- Advertencia: el modelo original obtuvo un 0 % de exito en la bateria de habilidades de 20 entornos y 5 segundos, por lo que no demuestra la habilidad objetivo.

## Casos de uso

- Verificacion del pipeline de exportacion ONNX: el repositorio sirve como artefacto de referencia para comprobar que una politica entrenada en simulacion se exporta correctamente y mantiene paridad numerica con el modelo original (error maximo 1,49e-07).
- Prueba de integracion en el sandbox de navegador: cargar el repositorio en `https://huggingface.co/spaces/pollen-robotics/microduck-simulator?boot=1&move=OWNER/REPO` y validar que el manifiesto monta la politica en la ranura `sitstand` y que la tecla `R` alterna el comando.
- Prueba automatizada en CI/CD: incorporar la comprobacion de paridad de 40 pasos como test de regresion cada vez que se reexporte una politica, usando la tolerancia de 1e-4 como criterio de aceptacion.
- Punto de partida para reentrenamiento: usar el mismo entorno y flujo con muchas mas iteraciones (mas alla de las 5 de este smoke) para intentar superar el 0 % de exito en la bateria de habilidades, dado que el checkpoint publicado no es funcional.
- Reproduccion didactica del flujo completo: como ejemplo minimo para que un desarrollador o investigador recorra las etapas de entrenamiento en simulacion, exportacion a ONNX, publicacion en el Hub y carga en navegador con MicroDuck.
- Validacion de fisica en navegador: aunque la model card indica que el comportamiento fisico "aun necesita una comprobacion online separada", este artefacto permite probar si la politica se carga y ejecuta en el simulador web sin errores de manifiesto.
- Comparacion de formatos de despliegue: usar el par `policy.onnx` + `manifest.json` como referencia de la estructura que espera la sandbox de MicroDuck frente a otras politicas publicadas en `pollen-robotics/microduck-policies`.

## Benchmarks y rendimiento

| Prueba | Metrica | Resultado | Referencia |
|---|---|---|---|
| Paridad ONNX (40 pasos, observaciones reales, reinicio en paso 20) | Error absoluto maximo | 1,4901161193847656e-07 | Tolerancia 1e-4: superada |
| Bateria de habilidades "sit" (20 entornos, 5 s) | Tasa de exito | 0 % | Modelo original (smoke) |
| Bateria de habilidades "stand" (20 entornos, 5 s) | Tasa de exito | 0 % | Modelo original (smoke) |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ni serian aplicables a una politica de control de robot.

## Requisitos de hardware

- No se dispone de datos especificos de VRAM, GPU recomendadas, latencia ni throughput en la informacion proporcionada.
- El tamano del repositorio aparece como 0,0 GB, lo que sugiere un fichero ONNX muy pequeno, coherente con una politica de control de baja dimension, aunque este dato no se confirma.
- El artefacto esta disenado para ejecutarse en el sandbox de MicroDuck dentro del navegador, por lo que la inferencia no requiere GPU dedicada en el equipo del usuario.
- No se especifican opciones de despliegue con vLLM, llama.cpp, Ollama o TGI; no son aplicables a una politica ONNX. La via documentada es la sandbox de Pollen Robotics.
- No cabe extraer estimaciones de latencia o throughput a partir de la informacion disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `luyuncan/microduck-sitstand` | Politica RL (ONNX) para MicroDuck, tarea sit/stand | no disponible | no aplicable | no disponible | Publico en el Hub, 0 descargas |
| `pollen-robotics/microduck-policies` | Coleccion oficial de politicas para MicroDuck | no disponible | no aplicable | no disponible | Publico en el Hub |
| Tarea SitStand en YouDuck | Referencia de entrenamiento y definicion de la tarea | no disponible | no aplicable | no disponible | Documentacion publica |

No se dispone de cifras de rendimiento comparables entre estas alternativas en la informacion proporcionada. La diferencia principal documentada es que `microduck-sitstand` es un checkpoint de humo con 0 % de exito, mientras que la coleccion oficial y la referencia de YouDuck corresponden a recursos de entrenamiento y politicas mantenidas por el fabricante.

## Limitaciones y advertencias

- El modelo original obtuvo un 0 % de exito en las pruebas de sentarse y levantarse (20 entornos, 5 segundos); no resuelve la tarea para la que fue entrenado.
- Se trata de un checkpoint de humo de 64 entornos x 5 iteraciones, insuficiente por diseno para aprender la habilidad.
- La licencia no esta declarada, por lo que no puede confirmarse el uso comercial ni la redistribucion derivada.
- No hay informacion de sesgos ni de alucinacion; estos conceptos no son aplicables a una politica de control, pero si lo es el riesgo de comportamientos no deseados en el robot fisico.
- El comportamiento fisico y la carga en navegador "aun necesitan una comprobacion online separada" segun la propia model card; solo se ha validado la paridad numerica, no la ejecucion en simulador ni en hardware real.
- No se documenta la arquitectura, el espacio de observacion ni el de accion, lo que dificulta auditar o reutilizar la politica.
- Publicado el 2026-10-03 con 0 descargas y 0 "likes": no hay validacion por parte de la comunidad.
- No debe desplegarse en un MicroDuck fisico sin una evaluacion de seguridad previa, dado que la politica no supera la habilidad objetivo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/luyuncan/microduck-sitstand
- Sandbox de MicroDuck (carga en navegador): https://huggingface.co/spaces/pollen-robotics/microduck-simulator?boot=1&move=OWNER/REPO
- Tarea SitStand en YouDuck: https://youduck.ai/en/train/tasks/sitstand/
- Repositorio GitHub de MicroDuck: https://github.com/pollen-robotics/microduck
- Pagina de producto MicroDuck (Pollen Robotics): https://pollen-robotics.com/microduck/
- Guias y recetas de entrenamiento de MicroDuck (YouDuck): https://youduck.ai/en/
- Coleccion oficial de politicas: https://huggingface.co/pollen-robotics/microduck-policies/tree/main
