# juicenv/microduck-duck-detective

## Resumen

Microduck-duck-detective es una politica de control por refuerzo (reinforcement learning) para el robot educativo Microduck de Pollen Robotics. No es un modelo de lenguaje ni un modelo generativo de texto: se trata de una politica de control motor que produce comandos de actuacion a partir de observaciones del robot, con una interfaz de 61 dimensiones de observacion y 14 acciones ejecutadas a 50 Hz. Se publica en formato ONNX y se carga en el demonio del robot a traves de un slot de politica.

El modelo es un finetune (remix) de pollen-robotics/microduck-got-a-talent-reference, la politica de referencia del programa "got-a-talent". El autor, juicenv (Jarrod Pflum), ha definido una secuencia de comportamiento propia de aproximadamente 20 segundos que incluye mirar alrededor, sentarse a estudiar una pista, sacudir la cabeza, un doble giro y una reverencia. Se describe como una politica "perpetua": una marcha (gait) que se ejecuta de forma continua hasta que se le indique lo contrario.

Su relevancia es acotada pero concreta: demuestra el flujo de trabajo de microduck para crear, entrenar (mediante el repositorio pollen-robotics/microduck_rl) y desplegar comportamientos de robot mediante aprendizaje por refuerzo, con un pipeline reproducible basado en ONNX y en el manifiesto de politicas del demonio. El repositorio ocupa 0.0 GB y no registra descargas ni "likes" en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (politica de control por refuerzo; no se especifica la topologia de red en la informacion proporcionada) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (politica de control motor; ejecucion a 50 Hz, sin ventana de contexto de texto) |
| Tipos de cuantizacion | no disponible (se distribuye como ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | no aplica / no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | ONNX (fichero policy.onnx) y manifest.json (schema 2 del manifiesto de politicas de microduck) |

Otros datos operativos: observacion de 61 dimensiones, 14 acciones, frecuencia de control de 50 Hz, normalizador de observaciones integrado en policy.onnx (se alimenta con observaciones en crudo).

## Arquitectura y entrenamiento

No se detalla la topologia de la red en la informacion disponible. Se sabe que es una politica de aprendizaje por refuerzo entrenada con el repositorio pollen-robotics/microduck_rl, en la rama `lean`, commit `5a3636302`. El modelo se ha obtenido por finetune de pollen-robotics/microduck-got-a-talent-reference, sustituyendo la linea temporal original de la politica de referencia por una linea temporal propia de aproximadamente 20 segundos con cinco fases de comportamiento (mirar alrededor, sentarse a estudiar una pista, sacudir la cabeza, doble giro y reverencia).

La innovacion practica no esta en la arquitectura, sino en el formato de despliegue: el normalizador de observaciones va "horneado" dentro de policy.onnx, de modo que el robot puede alimentar observaciones sin procesar y la politica las normaliza internamente. Ademas, el manifiesto sigue el esquema 2 documentado en docs/policy-manifest.md del repositorio del demonio, lo que permite cargarla como un slot de politica estandar. No se documentan en la informacion disponible datos sobre numero de tokens, composicion de dataset ni uso de RLHF/DPO (categorias que, por otra parte, no aplican a una politica de control motor).

## Capacidades

- Control motor de un robot cuadrupedo/educativo Microduck mediante 14 acciones a 50 Hz.
- Generacion de una secuencia de comportamiento ("gait") perpetua y repetible de unos 20 segundos, con cinco subcomportamientos encadenados.
- Consumo de observaciones de 61 dimensiones con normalizacion integrada en el propio modelo ONNX.
- Ejecucion continua hasta recibir una orden de parada o de cambio de politica.
- Carga e intercambio en caliente mediante el mecanismo de slots de politica del demonio microduck (robotctl).
- Soporte de tool calling / function calling: no aplica.
- Soporte de agentes y razonamiento multi-paso: no aplica.
- Capacidades multilingues: no aplica.
- Capacidades especiales (thinking mode, vision, audio): no disponibles; la informacion no describe entrada visual ni de audio, solo observaciones del robot.

## Casos de uso

- Demostraciones artisticas y de entretenimiento: la politica reproduce una rutina gestual concreta (mirar alrededor, estudiar una pista, sacudir la cabeza, doble giro y reverencia), adecuada para exhibiciones de robotica en ferias, aulas o eventos de divulgacion.
- Prueba de concepto de aprendizaje por refuerzo en robotica: sirve como ejemplo reproducible de finetune sobre la politica de referencia microduck-got-a-talent-reference, entrenado con el repositorio microduck_rl.
- Desarrollo de comportamientos "perpetuos": al ejecutarse de forma continua hasta que se le indique lo contrario, encaja en escenarios donde se necesita una animacion de fondo estable en lugar de una politica reactiva a eventos.
- Validacion de la cadena de despliegue ONNX: util para verificar el flujo `robotctl policy load <slot> juicenv/microduck-duck-detective` y el funcionamiento del manifiesto schema 2 sin necesidad de reentrenar.
- Base para nuevos finetunes: al ser un remix de la politica de referencia, puede servir como punto de partida para quien quiera sustituir la linea temporal por otra secuencia gestual.
- Educacion y talleres de robotica: permite ilustrar como se empaqueta un normalizador dentro del modelo y como se carga una politica en un slot, sin entrar en detalles de entrenamiento.
- Investigacion en control a 50 Hz: referencia practica de una politica de baja dimensionalidad (61 observaciones, 14 acciones) para experimentos de control en tiempo real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen metricas de recompensa, exito de tarea, latencia o estabilidad para esta politica en los datos proporcionados.

## Requisitos de hardware

- Inferencia: al distribuirse como ONNX y ocupar el repositorio 0.0 GB, la politica es compatible con inferencia en CPU; no se documenta VRAM necesaria ni GPU requerida.
- GPU recomendadas: no disponible. No hay indicios de que se requiera GPU para ejecutar la politica.
- Encaje en GPU de consumo: previsiblemente si (el modelo es de tamano minimo), aunque no se confirma en la informacion disponible.
- Opciones de despliegue: demonio de microduck con el comando `robotctl policy load <slot> juicenv/microduck-duck-detective`, runtime ONNX y manifiesto schema 2. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplican a este tipo de modelo).
- Latencia y throughput: se especifica una frecuencia de control de 50 Hz, lo que implica un ciclo de decision de 20 ms por paso. No se publican medidas de latencia real ni de rendimiento.

## Comparativa con modelos similares

| Modelo | Tipo | Observacion / acciones | Frecuencia | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| juicenv/microduck-duck-detective | Politica RL (finetune) | 61-D / 14 acciones | 50 Hz | no disponible | HuggingFace, 0 descargas |
| pollen-robotics/microduck-got-a-talent-reference | Politica RL de referencia (modelo base) | no disponible en la informacion | no disponible | no disponible | HuggingFace |
| juicenv/duckwing-v80-roller-skating | Politica RL (del mismo autor, por actividad reciente) | no disponible | no disponible | no disponible | HuggingFace |

Nota: el modelo pngwn/microduck-detector y la entrada "Microduck Duck Detector" de free2aitools corresponden a un detector visual de patos basado en imagenes, no a una politica de control; no se consideran comparables directos de esta ficha.

## Limitaciones y advertencias

- La licencia no esta especificada en la informacion disponible; antes de cualquier uso comercial debe aclararse con el autor, ya que no se puede asumir permiso de uso.
- Es un finetune de pollen-robotics/microduck-got-a-talent-reference, por lo que hereda las condiciones de la politica base, tambien sin licencia explicitada en los datos proporcionados.
- El modelo es especifico del hardware Microduck (61 observaciones, 14 acciones, 50 Hz); no es portable a otros robots sin reentrenamiento.
- Comportamiento "perpetuo": se ejecuta de forma continua hasta que se le indique lo contrario, lo que exige gestionar explicitamente la parada o el cambio de politica en produccion.
- No es un modelo de lenguaje: no genera texto, no razona, no soporta tool calling ni dispone de capacidades multilingues. Cualquier expectativa en ese sentido es incorrecta.
- No hay benchmarks ni metricas de robustez publicadas: se desconoce su comportamiento ante perturbaciones, cambios de terreno o fallos de sensores.
- No se documenta la composicion del dataset de entrenamiento ni el procedimiento exacto de finetune, lo que dificulta la reproducibilidad completa mas alla del commit indicado (rama `lean`, commit `5a3636302`).
- El autor no aporta informacion sobre sesgos; al no tratar datos humanos, el riesgo de sesgo social es bajo, pero si existe riesgo de sobreajuste al entorno de entrenamiento (simulacion frente a robot real).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/juicenv/microduck-duck-detective
- Modelo base (politica de referencia): https://huggingface.co/pollen-robotics/microduck-got-a-talent-reference
- Repositorio del robot microduck: https://github.com/pollen-robotics/microduck
- Repositorio de entrenamiento RL: pollen-robotics/microduck_rl (rama `lean`, commit `5a3636302`)
- Manifiesto de politicas (esquema 2): docs/policy-manifest.md en el repositorio del demonio microduck
- Perfil del autor: https://huggingface.co/juicenv/models
- Otro modelo del autor: https://huggingface.co/juicenv/duckwing-v80-roller-skating
