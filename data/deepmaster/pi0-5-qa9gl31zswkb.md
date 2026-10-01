# deepmaster/pi0.5-Qa9gL31ZSwkb

## Resumen

π0.5 AXIS v2.0 (identificador `deepmaster/pi0.5-Qa9gL31ZSwkb`) es un checkpoint de robótica de tipo VLA (Vision-Language-Action) publicado por el usuario deepmaster. Se distribuye como checkpoint nativo de OpenPI en formato JAX/Orbax, con el config `pi05_axis_joint`, y esta especializado en el control de un brazo robótico: consume imagen RGB de camara principal (y camara de muneca cuando el evaluador la proporciona) junto con un estado articular de 9 dimensiones, y produce como salida objetivos articulares absolutos tambien de 9 dimensiones.

El modelo no es un ajuste desde cero, sino un fine-tune derivado del ecosistema π0.5. Su padre inmediato es un promedio de pesos del checkpoint `dsaddsaf/pi0.5-kppXFPDgR7Tj`, que a su vez desciende del campeon AXIS v1.0 `deepmaster/pi0.5-s8bNBi2ZQghb`, combinado con un fine-tune propio del autor mediante DAgger sobre vistas privilegiadas. Sobre esa base se aplica una tecnica de "colapso de ruido" (noise collapse) en la que solo se entrenan los kernels de modulacion adaRMS.

La relevancia de esta ficha es limitada y muy especifica: se trata de un artefacto de investigacion en robotica con cero descargas y cero likes en el momento de la consulta, orientado a la manipulacion robotica y a la investigacion en politicas VLA, no a aplicaciones de lenguaje general. No se dispone de informacion publica sobre tamano de parametros, contexto ni benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA (Vision-Language-Action) basada en π0.5; flow matching con modulacion adaRMS; checkpoint nativo OpenPI en JAX/Orbax |
| Parametros totales | no disponible (el repositorio ocupa 12,4 GB e incluye `params/` y `assets/`) |
| Parametros activos | no aplica / no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | `other` con `license_name: gemma` (los pesos se rigen por los Gemma Terms of Use; la licencia OpenPI aplica al codigo) |
| Formato de pesos | JAX/Orbax (checkpoint nativo OpenPI con directorios `params/` y `assets/`) |

## Arquitectura y entrenamiento

El modelo parte de π0.5, una familia de politicas VLA que combina un backbone vision-lenguaje con un cabezal de accion basado en flow matching. En esta variante concreta, la entrada se compone de la camara RGB principal (camera0) y, cuando el evaluador la aporta, una camara de muneca, junto con un vector de estado articular de 9 dimensiones. La salida son objetivos articulares absolutos de 9 dimensiones. El checkpoint es un artefacto nativo de OpenPI en JAX/Orbax, por lo que no se distribuye en safetensors ni en GGUF.

El entrenamiento descrito en la model card consta de dos fases. La primera es una destilacion DAgger sobre vistas privilegiadas: el profesor actua sobre el render canonico del mismo estado de MuJoCo que ve el alumno, transfiriendo la politica a observaciones disponibles en inferencia. La segunda es el "colapso de ruido": unicamente se entrenan los kernels de modulacion adaRMS, de modo que el primer paso de flujo desde cualquier ruido reproduce la salida del modelo padre a partir de un ruido ancla fijo por tarea. Segun el autor, el campo de velocidad para t<=0,9 permanece inalterado respecto al padre. No se especifican el volumen de datos, la composicion del dataset ni si hubo etapas de RLHF o DPO.

## Capacidades

- Control robótico de manipulacion: mapea observaciones visuales y estado articular 9D a comandos de articulacion absolutos 9D.
- Entrada multimodal: imagen RGB de camara principal y, opcionalmente, camara de muneca.
- Inferencia de acciones mediante flow matching con modulacion adaRMS.
- Ejecucion de politicas destiladas por DAgger sobre vistas privilegiadas.
- Reproduccion determinista del primer paso de flujo gracias al ajuste de colapso de ruido, que fija un ruido ancla por tarea.
- Compatibilidad con el ecosistema OpenPI (JAX/Orbax) para carga e integracion en pipelines de robotica.
- No se documenta soporte de tool calling, function calling, agentes multi-paso ni generacion de texto general.
- Capacidades multilingues: no disponibles.

## Casos de uso

- Manipulacion robótica en simulacion MuJoCo: el modelo consume el estado y el render de MuJoCo y devuelve objetivos articulares absolutos, de modo que puede evaluarse directamente en tareas de pick-and-place o ensamblaje sobre el mismo entorno usado en el entrenamiento.
- Investigacion en politicas VLA: sirve como punto de partida para estudiar el efecto del colapso de ruido y la destilacion DAgger sobre vistas privilegiadas frente al modelo padre.
- Destilacion de profesores privilegiados: el pipeline descrito (profesor que actua sobre un render canonico) es reutilizable para transferir politicas entrenadas con informacion privilegiada a politicas desplegables con sensores reales.
- Control de brazo con efector de 9 grados de libertad: adecuado para robots con cadenas cinematicas de 9 articulaciones que requieran comandos de posicion articular absoluta.
- Experimentos de sim-to-real: al incorporar camara de muneca opcional, permite evaluar la robustez de la politica cuando se anade observacion adicional no presente en todas las configuraciones.
- Reproduccion de resultados de la familia AXIS: al ser un fine-tune encadenado de los campeones AXIS v1.0 y v2.0, permite comparar variantes dentro de esa linea de checkpoints.
- Evaluacion comparativa de checkpoints OpenPI: util como baseline dentro del ecosistema OpenPI/JAX para medir cambios introducidos por cada ronda de ajuste.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de exito, tasas de exito en tareas ni comparaciones numericas con el modelo padre o con otros checkpoints.

## Requisitos de hardware

- El repositorio ocupa 12,4 GB, lo que da una cota inferior del espacio en disco necesario para cargar `params/` y `assets/`.
- VRAM estimada para inferencia: no disponible. No se especifica el tamano de parametros ni la precision de los pesos, por lo que no puede calcularse con fiabilidad.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: formato nativo OpenPI en JAX/Orbax; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de checkpoint de robotica.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| deepmaster/pi0.5-Qa9gL31ZSwkb (este) | no disponible | no disponible | JAX/Orbax (OpenPI) | other / Gemma | 0 descargas |
| dsaddsaf/pi0.5-kppXFPDgR7Tj (padre, AXIS v2.0) | no disponible | no disponible | JAX/Orbax (OpenPI) | no disponible | referenciado en la model card |
| deepmaster/pi0.5-s8bNBi2ZQghb (AXIS v1.0, abuelo) | no disponible | no disponible | JAX/Orbax (OpenPI) | no disponible | referenciado en la model card |

No se dispone de datos de rendimiento ni de especificaciones tecnicas de los modelos comparados mas alla de su relacion de parentesco.

## Limitaciones y advertencias

- Extremadamente especializado: es una politica de control robótico, no un modelo de lenguaje general; no debe usarse para tareas de texto, codigo o dialogo.
- Sin adopcion verificable: cero descargas y cero likes en la fecha de consulta, por lo que no existe validacion externa de su comportamiento.
- Ausencia de benchmarks: no hay metricas publicadas de exito en tareas, lo que impide estimar su rendimiento real frente a alternativas.
- Especificaciones incompletas: se desconocen parametros, contexto, precision e idiomas.
- Dependencia del entorno: el entrenamiento se describe sobre MuJoCo y configuraciones concretas de camara y articulaciones (9D), por lo que su transferencia a otro hardware o numero de grados de libertad no esta garantizada.
- Restricciones de licencia: los pesos estan sujetos a los Gemma Terms of Use, lo que impone condiciones adicionales para uso comercial; el codigo se rige por la licencia OpenPI. Conviene revisar ambos textos antes de cualquier despliegue productivo.
- Riesgo de alucinacion: en el contexto de una politica VLA, el analogo es la generacion de acciones no validas o inestables ante observaciones fuera de distribucion.
- Metadatos con fechas anomales (creacion y actualizacion en 2026) que deben tratarse con cautela.

## Enlaces

- HuggingFace: https://huggingface.co/deepmaster/pi0.5-Qa9gL31ZSwkb
- Modelo padre (AXIS v2.0): https://huggingface.co/dsaddsaf/pi0.5-kppXFPDgR7Tj
- Modelo abuelo (AXIS v1.0): https://huggingface.co/deepmaster/pi0.5-s8bNBi2ZQghb
- OpenPI (repositorio del ecosistema y licencia del codigo): enlace no disponible en la informacion proporcionada
- Gemma Terms of Use: enlace no disponible en la informacion proporcionada
