# juicenv/microduck-hill-es9

## Resumen

microduck-hill-es9 es una política de control para robótica, no un modelo de lenguaje. Se trata de un fichero ONNX que implementa una política neuronal entrenada mediante aprendizaje por refuerzo para el robot microduck de Pollen Robotics. El autor del artefacto publicado es el usuario juicenv, que parte del modelo suraj-phanindra/microduck-hill-hc5-aifund y lo afina mediante un algoritmo de escalada de colina (hill climbing) elitista evaluado con el scored de "Arena hill" mencionado en la model card. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta.

La política es de tipo perpetuo: genera un ciclo de marcha continuo hasta que se le ordena lo contrario, y está pensada para cargarse en una ranura de política del demonio robotctl del robot. Trabaja a 50 Hz, consume observaciones de 61 dimensiones y emite 14 acciones de control. El normalizador de observaciones está incrustado dentro de policy.onnx, de modo que la política acepta observaciones en crudo sin preprocesado externo.

La relevancia de este artefacto es acotada: no compite en la categoría de modelos generativos, sino en la de políticas de locomoción para hardware abierto y de bajo coste. Su interés principal es que ejemplifica un flujo de trabajo reproducible de RL aplicado a un robot físico, con un manifiesto versionado (schema 2) y un pipeline de carga directa en el robot mediante una única orden de consola.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal de politica de control entrenada con aprendizaje por refuerzo, exportada a ONNX. Topologia interna (capas, activaciones) no disponible |
| Parametros totales | no disponible |
| Parametros activos | no aplica, no es un modelo MoE |
| Longitud de contexto | no aplica: politica reactiva sin ventana de contexto; entrada fija de 61 dimensiones |
| Tipos de cuantizacion | no disponible; el artefacto se distribuye como ONNX, sin variantes cuantizadas publicadas |
| Idiomas soportados | no disponible; no aplica, no procesa lenguaje natural |
| Licencia | no disponible |
| Formato de pesos | ONNX (policy.onnx) acompanado de manifest.json con schema 2 del manifiesto de politicas de microduck |
| Frecuencia de control | 50 Hz |
| Dimension de observacion | 61 |
| Dimension de accion | 14 |
| Tamano del repositorio | 0.0 GB |
| Modelo base | suraj-phanindra/microduck-hill-hc5-aifund |
| Relacion con el modelo base | finetune |
| Tarea declarada | robotics |
| Biblioteca | microduck |

## Arquitectura y entrenamiento

La informacion disponible no detalla la topologia de la red: la model card solo indica que el resultado se exporta como policy.onnx con el normalizador de observaciones integrado. Se sabe que la politica consume un vector de observacion de 61 dimensiones y produce 14 acciones a 50 Hz, lo que es coherente con una politica de control reactiva (estilo MLP o red pequeña) propia de tareas de locomocion en robotica. No se especifica si se emplea memoria recurrente ni si la politica es condicional a una fase del ciclo de marcha.

El entrenamiento parte del modelo suraj-phanindra/microduck-hill-hc5-aifund, que a su vez desciende de una linea de trabajo con credited a suraj-phanindra y namenu. El afinado de esta version se realizo mediante una escalada de colina elitista sobre el scorer de colina de Arena, es decir, una busqueda local iterativa que conserva las mejores variantes en cada paso. El entrenamiento se apoya en el repositorio pollen-robotics/microduck_rl, rama hannes-ft, commit 3c0598cae. No se publican cifras de tokens, episodios, composicion del dataset de entrenamiento ni detalles sobre el simulador o el bucle de recompensa.

## Capacidades

- Generacion de marcha continua para el robot microduck: la politica es perpetua, mantiene el ciclo mientras no se le ordene lo contrario.
- Control de locomocion sobre terreno en pendiente, segun se deduce del nombre del artefacto y de la referencia al scorer de colina.
- Inferencia a 50 Hz con observaciones crudas de 61 dimensiones y 14 salidas de accion, sin preprocesado externo gracias al normalizador embebido en el ONNX.
- Carga directa en el robot mediante el comando `sudo robotctl policy load <slot> juicenv/microduck-hill-es9`.
- Integracion con el sistema de ranuras de politica (policy slots) del demonio microduck.
- No dispone de tool calling, function calling, razonamiento multi-paso, capacidades multilingues, vision, audio ni modo de pensamiento. Es exclusivamente una politica de control motor.

## Casos de uso

- Despliegue en el robot fisico microduck: cargar la politica en una ranura y ejecutar la marcha de forma continua en el hardware real, usando el comando del robotctl descrito en la model card.
- Punto de partida para nuevos afinados: al ser un artefacto derivado por fine-tune, sirve como inicializacion para experimentos de escalada de colina sobre otros scorers de Arena.
- Evaluacion comparativa de politicas de locomocion: permite medir el efecto de una ronda adicional de hill climbing elitista frente al modelo base suraj-phanindra/microduck-hill-hc5-aifund.
- Reproducibilidad de experimentos de RL en robotica: el par repositorio, rama y commit (`pollen-robotics/microduck_rl`, `hannes-ft`, `3c0598cae`) permite reconstruir el pipeline de entrenamiento asociado.
- Docencia y demostraciones de robotica abierta: un artefacto ONNX pequeno y con manifiesto versionado es adecuado para explicar el ciclo completo de observacion, accion y control en tiempo real.
- Pruebas de integracion del demonio robotctl: validar el esquema 2 del manifiesto de politicas, la carga en slots y el comportamiento del normalizador embebido.
- Investigacion sobre transferencia simulacion a realidad: la politica, entrenada presumiblemente en simulacion, permite estudiar la brecha de rendimiento al ejecutarse en hardware real a 50 Hz.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona que el afinado se guio por el scorer de colina de Arena, pero no se proporciona ninguna puntuacion numerica, ni comparativas cuantitativas con el modelo base ni con otras politicas.

## Requisitos de hardware

- El repositorio ocupa 0.0 GB y el artefacto es un unico ONNX pequeno, por lo que la huella de memoria es minima; no se publican cifras exactas de VRAM ni de RAM.
- Al ser una politica de 61 entradas y 14 salidas a 50 Hz, la inferencia es viable en CPU de clase embebida, que es el escenario previsto por el flujo `robotctl` en el propio robot.
- No se especifican GPU recomendadas ni si el modelo requiere aceleracion. No hay datos que permitan afirmar un requisito de VRAM concreto.
- Cabe en cualquier GPU de consumo e, incluso, en entornos sin GPU; no obstante, esto es una inferencia a partir del tamano del artefacto y no un dato publicado.
- Opciones de despliegue: runtime ONNX integrado en el demonio microduck o cualquier ejecutor compatible con ONNX. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de artefacto.
- Latencia y throughput: no disponibles. El unico dato temporal conocido es la frecuencia de control de 50 Hz.

## Comparativa con modelos similares

| Modelo | Tipo | Observacion / acciones | Frecuencia | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| juicenv/microduck-hill-es9 | Politica RL en ONNX, fine-tune | 61 / 14 | 50 Hz | no disponible | HuggingFace, 0 descargas |
| suraj-phanindra/microduck-hill-hc5-aifund | Politica RL base | no disponible en la informacion proporcionada | no disponible | no disponible | HuggingFace, referenciado como modelo base |
| Otras politicas de microduck | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion suficiente para comparar parametros, contexto o rendimiento con alternativas de la misma categoria. La unica relacion documentada es de fine-tune respecto al modelo base.

## Limitaciones y advertencias

- No es un modelo de lenguaje ni un modelo multimodal: no procesa texto, imagen ni audio, y no admite tool calling ni agentes.
- Sesgos conocidos: no disponibles. Al ser una politica de control, los sesgos relevantes serian de comportamiento motor (por ejemplo, dependencia del terreno o de la dinamica del robot) y no se documentan.
- Riesgo de alucinacion: no aplica en el sentido linguistico. El riesgo equivalente es la generalizacion deficiente fuera de la distribucion de entrenamiento, que puede provocar caidas o marchas inestables.
- Limitaciones de contexto o idioma: no aplica; la entrada esta fijada a 61 dimensiones y no existe ventana de contexto.
- Licencia no especificada: no se indica licencia en la model card ni en los metadatos de HuggingFace, por lo que el uso comercial queda sin cobertura legal explicita y debe consultarse con el autor.
- Repositorio sin traccion: 0 descargas y 0 likes, sin fecha de actualizacion posterior a la creacion (2026-10-17). No hay evidencia de validacion por terceros.
- No se publican resultados de evaluacion, curvas de recompensa ni comparativas con el modelo base, por lo que no es posible verificar que el fine-tune mejore al punto de partida.
- El despliegue en hardware real puede implicar riesgos fisicos si la politica falla en terreno no visto; se recomienda validar en simulacion y con medidas de seguridad antes de ejecutarla en el robot.
- La model card esta escrita en ingles y es muy breve; la informacion sobre datos de entrenamiento, recompensas y procedimiento de evaluacion es practicamente inexistente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/juicenv/microduck-hill-es9
- Modelo base: https://huggingface.co/suraj-phanindra/microduck-hill-hc5-aifund
- Repositorio del robot microduck: https://github.com/pollen-robotics/microduck
- Repositorio de entrenamiento RL citado en la model card: pollen-robotics/microduck_rl, rama hannes-ft, commit 3c0598cae
- Documentacion del manifiesto de politicas: docs/policy-manifest.md en el repositorio del demonio (referenciado, sin URL directa en la informacion proporcionada)
- Resultados de busqueda web: no se han encontrado enlaces relevantes al modelo. Los resultados devueltos corresponden a hilos de foro sobre cultivo de cana de azucar en Minecraft y no guardan relacion con este artefacto.
