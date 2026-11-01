# dashi/microduck-roller-daily-20261031

## Resumen

`dashi/microduck-roller-daily-20261031` es una politica de aprendizaje por refuerzo para robotica, publicada en Hugging Face por el usuario `dashi`. No se trata de un modelo de lenguaje, sino de una politica de locomocion (gait) destinada al robot **microduck** de Pollen Robotics, concretamente para la variante sobre rodillos ("on rollers") y para el slot de control `walk`. El modelo se distribuye en formato ONNX bajo la libreria `microduck` y esta etiquetado con el pipeline `robotics`.

Es un *finetune* (remix) del modelo `DenRakEiw/microduck-senate_duck_0904`, re-publicado como entrada diaria ("daily re-entry") del remix `microduck-roller-remix-r900` con version 0.900. La politica consume observaciones de 61 dimensiones a 50 Hz y produce 14 acciones, con el normalizador de observaciones incrustado en el propio `policy.onnx`, lo que simplifica el despliegue en el robot. Su interes es principalmente para la comunidad de robotics open source que trabaja con el ecosistema microduck y entrenamiento RL con el repositorio `pollen-robotics/microduck_rl`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Politica de RL en ONNX (arquitectura interna no disponible) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no aplicable (politica de control: 61-D observacion, 14 acciones, 50 Hz) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplicable |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`), acompanado de `manifest.json` (schema 2 del microduck policy manifest) |

## Arquitectura y entrenamiento

La ficha no describe la arquitectura interna de la red (numero de capas, tipo de red neuronal, etc.), solo su interfaz: entrada de 61 dimensiones de observacion, salida de 14 acciones e inferencia a 50 Hz. El normalizador de observaciones esta integrado en el archivo ONNX, por lo que el robot puede alimentar observaciones crudas directamente.

El entrenamiento se realizo con aprendizaje por refuerzo en el repositorio `pollen-robotics/microduck_rl`, rama `roll-backward`, commit `83599404a`. No hay informacion sobre el algoritmo de RL empleado, el numero de pasos de entrenamiento, el simulador utilizado ni las recompensas optimizadas. El modelo es un ajuste fino del checkpoint `DenRakEiw/microduck-senate_duck_0904`.

## Capacidades

- Politica de locomocion continua ("perpetual") para el robot microduck sobre rodillos: genera un gait estable que corre indefinidamente hasta que se detiene manualmente.
- Control en tiempo real a 50 Hz con 61 observaciones de entrada y 14 acciones de salida.
- Despliegue directo en robot mediante el comando `robotctl policy load walk`, sin necesidad de preprocesar observaciones (el normalizador va incluido en el ONNX).
- Compatibilidad con el esquema de manifiesto schema 2 del daemon microduck (`manifest.json`).
- No tiene capacidades de lenguaje, vision, razonamiento ni tool calling; es un modelo de control puro.

## Casos de uso

- **Locomocion del robot microduck en produccion**: cargar la politica en el slot `walk` del robot con `robotctl` para que el robot se desplace de forma continua sobre rodillos sin intervencion adicional.
- **Pruebas diarias de regresion en hardware**: al ser una entrada diaria de un remix en version 0.900, sirve como snapshot reproducible para validar cambios de gait en robots fisicos dia a dia.
- **Investigacion en RL para robotica**: punto de partida o baseline para nuevos experimentos de finetuning sobre un checkpoint ya funcional, usando el repositorio `pollen-robotics/microduck_rl`.
- **Comparacion de politicas comunitarias**: el ecosistema microduck permite remixar checkpoints de otros autores (como `DenRakEiw/microduck-senate_duck_0904`), facilitando benchmarks de gaits entre usuarios.
- **Validacion del pipeline ONNX en el daemon**: comprobar que el normalizador incrustado y el manifiesto schema 2 funcionan correctamente en versiones nuevas del daemon de control.
- **Demostraciones y educacion**: modelo listo para cargar en un robot fisico, util para talleres o demostraciones de aprendizaje por refuerzo aplicado a robotica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El modelo esta pensado para ejecutarse **en el robot microduck** (o su daemon de control), no en GPU de servidor. El tamano del repositorio es 0,0 GB, lo que sugiere un modelo muy ligero.
- Requisitos de VRAM o GPU: no disponibles; no requiere GPU dedicada para inferencia segun la model card.
- Despliegue: mediante el comando `robotctl policy load walk dashi/microduck-roller-daily-20261031` (requiere el daemon microduck con soporte del manifiesto schema 2).
- No hay informacion sobre compatibilidad con vLLM, llama.cpp, Ollama o TGI; al ser una politica ONNX de robotica, estos frameworks de LLM no aplican.
- Latencia y throughput: la politica opera a 50 Hz de frecuencia de control; no hay mas mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Tipo | Entrada/salida | Frecuencia | Licencia |
|---|---|---|---|---|
| dashi/microduck-roller-daily-20261031 (este modelo) | Politica RL (finetune) para microduck sobre rodillos | 61-D obs / 14 acciones | 50 Hz | no disponible |
| DenRakEiw/microduck-senate_duck_0904 | Politica RL base (checkpoint original) | no disponible | no disponible | no disponible |
| dashi/microduck-roller-remix-r900 | Remix del que deriva esta entrada diaria (v0.900) | no disponible | no disponible | no disponible |

Todas las alternativas comparables pertenecen al mismo ecosistema microduck; no hay datos publicados de rendimiento relativo entre ellas.

## Limitaciones y advertencias

- La licencia no esta especificada en la model card, por lo que no es posible confirmar si el uso comercial esta permitido. Verificar con el autor antes de cualquier despliegue comercial.
- El modelo tiene 0 descargas y 0 likes registrados, y la entrada es de fecha 2026-10-31: no hay historial de adopcion ni validacion comunitaria.
- Es una politica especifica para microduck **sobre rodillos** y para el slot `walk`; no es transferible directamente a otras plataformas roboticas ni a otros slots de control.
- No hay documentacion sobre robustez ante perturbaciones, condiciones de suelo variables ni tasa de caidas; se recomienda probar con supervision en hardware real.
- Los resultados de busqueda web sobre "dashi" corresponden al caldo japones y no guardan relacion con este modelo; no aportan informacion adicional relevante.
- Al tratarse de un remix diario de otro checkpoint, puede quedar desactualizado rapidamente respecto a versiones posteriores del mismo remix.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dashi/microduck-roller-daily-20261031
- Modelo base (checkpoint original): https://huggingface.co/DenRakEiw/microduck-senate_duck_0904
- Repositorio de la libreria microduck: https://github.com/pollen-robotics/microduck
- Repositorio de entrenamiento RL: `pollen-robotics/microduck_rl` (rama `roll-backward`, commit `83599404a`; URL no disponible)
