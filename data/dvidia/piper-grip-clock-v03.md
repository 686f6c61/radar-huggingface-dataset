# Dvidia/piper-grip-clock-v03

## Resumen

PiPER grip clock v0.3 es un artefacto de aprendizaje automatico para robotica desarrollado por Dvidia, publicado en Hugging Face bajo licencia MIT. No es un modelo de lenguaje: es un "reloj de progreso" (progress clock) compacto y aprendido que decide cuando mantener o avanzar una referencia de movimiento congelada del brazo robotico Agilex PiPER durante la adquisicion de un agarre sobre un bloque rigido sintetico de 40 g. El modelo utiliza estado privilegiado del simulador junto con la referencia original de brazo y mandibula; esperar retrasa tanto el avance del brazo como la liberacion de la mandibula.

El artefacto se presenta como un par emparejado de relojes: un reloj completo (`full4`) que usa senal de agarre en vivo e historial, y un reloj ciego (`blind4`) que enmascara esas entradas manteniendo el mismo recetario de ajuste y profundidad de arbol. El paquete incluye los cuatro ajustes candidatos, recibos, protocolo, congelacion, informe, auditoria numerica independiente, instantaneas del codigo de ejecucion en tiempo real y hashes de integridad. La relevancia es metodologica: documenta de forma exhaustiva un experimento de control robotico con resultados negativos frente a una linea base fija, lo que lo convierte en material util para investigadores que evaluan supervision de adquisicion frente a politicas fijas.

El alcance es deliberadamente estrecho: un unico bloque rigido sintetico, dos destinos conocidos, sensado privilegiado del simulador y una envolvente de arranque limitada del PiPER. El autor declara explicitamente que no establece transferencia a objetos arbitrarios, vision por camara, otros brazos ni hardware fisico, y que `physical_robot_ready` y `qualified_robot_skill` permanecen en falso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Reloj de progreso aprendido basado en arboles de decision (profundidad emparejada `full4`/`blind4`); no es un transformer ni un modelo neuronal de gran escala |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no aplica; consume estado del simulador y referencia de movimiento) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | MIT |
| Formato de pesos | no disponible (el artefacto incluye ajustes, recibos, auditoria y codigo de ejecucion; no se declara formato de pesos como safetensors o GGUF) |

## Arquitectura y entrenamiento

El modelo es un reloj de progreso compacto que decide, en cada paso, si mantener o avanzar una referencia de movimiento congelada del brazo PiPER. Utiliza estado privilegiado del simulador (contacto bilateral de almohadillas, fuerza y deriva relativa a la herramienta muestreada en seis observaciones a lo largo de 100 ms) junto con la referencia original de brazo y mandibula. El maestro de adquisicion libera su pestillo tras la adquisicion; se trata de supervision solo de adquisicion, no de recuperacion continua de deslizamiento ni de certificacion fisica del agarre.

El diseno experimental empareja un reloj completo (`full4`) con un reloj ciego (`blind4`) que usa las mismas filas del maestro, la misma receta de ajuste y la misma profundidad de arbol, pero con las entradas de agarre en vivo e historial enmascaradas. Se incluyen cuatro ajustes candidatos con sus recibos, protocolo, congelacion, informe, auditoria numerica independiente (768 intentos: 64 de entrenamiento, 192 de desarrollo y 512 de confirmacion, con cero discrepancias), instantaneas del codigo de ejecucion y hashes de integridad. El roster de confirmacion contiene 32 grupos XY frescos, cada uno emparejado en dos destinos conocidos y en condiciones nominal y post-agarre.

## Capacidades

- Decision binaria de mantener o avanzar una referencia de movimiento congelada del brazo PiPER durante la adquisicion de un agarre.
- Uso de estado privilegiado del simulador: contacto bilateral de almohadillas, fuerza y deriva relativa a la herramienta sobre seis muestras en 100 ms.
- Retraso coordinado de la progresion del brazo y de la liberacion de la mandibula cuando el reloj decide esperar.
- Variante ciega (`blind4`) que permite comparar el efecto de la senal de agarre en vivo frente a un control emparejado.
- No aprende geometria de agarre; no realiza recuperacion continua de deslizamiento; no soporta vision por camara.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso en el sentido de los modelos de lenguaje.
- No dispone de capacidades multilingues ni de generacion de texto.

## Casos de uso

- Investigacion en control de adquisicion de agarre: el par `full4`/`blind4` permite medir el efecto de la senal de agarre en vivo frente a un control emparejado con la misma receta de ajuste, util para disenar experimentos ablativos reproducibles.
- Reproduccion de experimentos sinteticos: el paquete incluye dataset de demostraciones, guia de reproduccion, registro de host, instantaneas del codigo y hashes de integridad, lo que facilita replicar el protocolo completo en simulador.
- Auditoria metodologica de resultados negativos: los resultados congelados (reloj 44/128 frente a fijo 72/128) sirven como caso de estudio sobre como documentar y publicar resultados exploratorios sin sobreafirmar cualificacion.
- Formacion y docencia en robotica: el visor 3D grabado y el paper permiten ilustrar el problema de cuando esperar durante un agarre con un ejemplo concreto y trazable.
- Desarrollo de lineas base para nuevos relojes de progreso: el artefacto proporciona una referencia fija y un maestro de adquisicion contra los que comparar propuestas futuras en el mismo entorno sintetico.
- Evaluacion de infraestructura de simulacion: el registro de temporizacion en host Apple M5 con cuatro workers aislados por spawn (excluyendo camaras, transporte, renderizado y actuacion fisica) sirve para calibrar expectativas de rendimiento en entornos compartidos.

## Benchmarks y rendimiento

Resultados de confirmacion congelados. El denominador incluye los 128 casos por controlador. Exitos estrictos e intentos validos:

| Controlador | Exitos estrictos | Intentos validos |
|---|---:|---:|
| clock | 44/128 | 128/128 |
| blind_clock | 26/128 | 128/128 |
| fixed | 72/128 | 128/128 |
| teacher | 67/128 | 128/128 |

Diferencias declaradas por el autor:

| Comparacion | Diferencia (puntos porcentuales) | Intervalo aprox. 97,5 % |
|---|---:|---|
| full menos blind_clock | +14,1 | -8,5 a +36,6 |
| full menos fixed | -21,9 | -36,8 a -7,0 |

Los intervalos son t pareados por grupo XY con cobertura simultanea Bonferroni del 95 % bajo sus supuestos. El autor los califica de exploratorios, no de cualificacion con potencia estadistica. Todas las puertas de seguimiento predeclaradas pasaron: falso. La cualificacion en hardware permanece en falso.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (el artefacto no es un modelo neuronal de gran escala y no se declara requisito de VRAM).
- GPU recomendadas: no disponible.
- Cabe en GPU consumer: no disponible.
- Opciones de despliegue: no se declaran frameworks como vLLM, llama.cpp, Ollama o TGI; el codigo de ejecucion esta en el repositorio `DVIDIA-Inference/dvidia-training`, etiqueta `piper-grip-clock-v0.3`.
- Latencia y throughput: el autor describe la temporizacion en un host Apple M5 compartido con cuatro workers de simulador aislados por spawn; excluye camaras, transporte, renderizado y actuacion fisica, y no constituye un resultado de throughput aislado ni una garantia de tiempo real estricto.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de la misma categoria (relojes de progreso para adquisicion de agarre en simulacion). La unica comparacion interna disponible es frente a las lineas base del propio experimento (controlador fijo y maestro de adquisicion), recogida en la seccion de benchmarks.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan sesgos en la informacion disponible; el alcance esta limitado a un unico bloque rigido sintetico de 40 g y dos destinos conocidos.
- Riesgo de alucinacion: no aplica en el sentido de modelos de lenguaje; el riesgo equivalente es la generalizacion indebida de los resultados a objetos, brazos o entornos no evaluados.
- Limitaciones de contexto o idioma: no aplica; el modelo no procesa lenguaje ni tiene ventana de contexto textual.
- Restricciones de licencia: el codigo, los modelos y la evidencia numerica sintetica de autoria DVIDIA son MIT; los avisos de geometria y renderizador de PiPER aguas arriba permanecen con sus activos y replay, y no se incluyen activos de robot ni ruedas en el artefacto.
- El modelo no establece transferencia a objetos arbitrarios, vision por camara, otros brazos ni hardware fisico.
- La supervision es solo de adquisicion: no hay recuperacion continua aprendida de deslizamiento ni certificacion fisica del agarre.
- Los resultados son exploratorios y no una cualificacion con potencia estadistica; `physical_robot_ready` y `qualified_robot_skill` permanecen en falso.
- La temporizacion en host compartido no es un resultado de throughput aislado ni una garantia de tiempo real estricto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Dvidia/piper-grip-clock-v03
- Dataset de demostraciones: https://huggingface.co/datasets/Dvidia/piper-grip-clock-demonstrations-v03
- Visor 3D grabado: https://dvidia-robot-simulation-lab.static.hf.space/learned-placement/v03/viewer/index.html
- Paper de investigacion: https://research.dvidia.org/papers/learned-piper-grip-clock-v03/
- Codigo: https://github.com/Dvidia-Inference/dvidia-training (etiqueta `piper-grip-clock-v0.3`)
- Contacto: hello@dvidia.org
- X: https://x.com/iammrriver
