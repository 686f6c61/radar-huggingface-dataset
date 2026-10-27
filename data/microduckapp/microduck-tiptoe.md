# microduckapp/microduck-tiptoe

## Resumen

microduck-tiptoe es una política de control robótico publicada por microduckapp en Hugging Face, no un modelo de lenguaje. Implementa el movimiento «Tiptoe» para el robot Microduck: avanza agachado, se detiene cada pocos pasos y mira a izquierda y derecha. El artefacto principal es `policy.onnx`, que recibe 61 observaciones y emite 14 objetivos articulares a 50 Hz; el movimiento dura 10,7 s y se distribuye junto con `manifest.json` y un vídeo de previsualización.

Su relevancia es acotada: sirve como ejemplo reproducible de una política de locomoción empaquetada en ONNX para la app MicroDuck. No se documentan arquitectura interna, número de parámetros, datos de entrenamiento ni evaluación. La ficha distingue, por tanto, entre lo declarado por el autor y los datos no disponibles.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Política de control robótico exportada a ONNX; topología interna no disponible |
| Parámetros totales | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible; solo se documenta `policy.onnx` |
| Idiomas soportados | no disponible; no es un modelo de lenguaje |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`); manifiesto en JSON (`manifest.json`) |
| Tipo de modelo | Política robótica, pipeline `robotics` |
| Entrada | 61 observaciones |
| Salida | 14 objetivos articulares |
| Frecuencia de control | 50 Hz |
| Duración del movimiento | 10,7 s |
| Artefactos publicados | `policy.onnx`, `manifest.json`, `media/preview.mp4` |
| Tamaño del repositorio | 0,0 GB, según Hugging Face |
| Etiquetas | `onnx`, `robotics`, `microduck-move`, `region:us` |

## Arquitectura y entrenamiento

No se especifica la topología interna de la red: no hay datos sobre capas, mecanismos de atención, número de parámetros ni tipo de modelo. El artefacto publicado es una política que mapea 61 observaciones de entrada a 14 objetivos articulares de salida, ejecutada a 50 Hz durante una secuencia de 10,7 s. Está empaquetada en ONNX y acompañada de un manifiesto para que el robot o la app puedan instalar y reproducir el movimiento.

La model card no indica dataset, número de tokens, proceso de entrenamiento, técnicas de RLHF o DPO, ni método de validación. Tampoco se documenta si la política se obtuvo mediante aprendizaje por imitación, refuerzo u otro procedimiento. No hay información sobre innovaciones técnicas como decodificación especulativa, atención lineal o control predictivo.

## Capacidades

- Ejecutar el movimiento «Tiptoe»: avanzar con la cabeza baja, congelarse cada pocos pasos y mirar a izquierda y derecha.
- Recibir 61 observaciones y producir 14 objetivos articulares a 50 Hz.
- Integrarse mediante un fichero ONNX en el pipeline de control del robot Microduck.
- Instalarse y reproducirse a través de `manifest.json` en la app MicroDuck.
- Servir como referencia de empaquetado de movimientos robóticos en formato ONNX.
- No se documentan capacidades de generación de texto, razonamiento, código, matemáticas, visión, audio, tool calling, function calling ni agentes.
- No se documenta capacidad de generalización a otros robots, tareas o entornos.

## Casos de uso

- Demostración de locomoción sigilosa en el robot Microduck: permite reproducir una secuencia de 10,7 s con pausas y giros de cabeza, útil para exhibiciones y vídeos de producto.
- Validación de integración ONNX en la app o el robot: sirve para comprobar que el runtime carga `policy.onnx`, respeta la interfaz de 61 entradas y 14 salidas y ejecuta a 50 Hz.
- Pruebas de control en tiempo real: puede emplearse para medir jitter, latencia de ejecución y sincronización de las 14 articulaciones en un banco de pruebas.
- Docencia e investigación en robótica: ejemplifica cómo se publica una política de movimiento con manifiesto, artefacto ONNX y material audiovisual.
- Evaluación de reproducibilidad: permite comparar la ejecución real con `media/preview.mp4` para detectar diferencias de calibración o de versión del robot.
- Generación de material de comunicación: el vídeo y la secuencia pueden usarse en documentación, demos o presentaciones del ecosistema MicroDuck.
- Pruebas de seguridad en banco: antes de usar la política en un robot físico, puede validarse en simulación o con límites de par y paradas de emergencia, aunque el modelo no documenta mecanismos de seguridad propios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni métricas de éxito de la política robótica. Tampoco se documentan latencia, throughput, tasa de éxito del movimiento ni robustez ante perturbaciones.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio figura con 0,0 GB, pero ese dato no permite estimar memoria de ejecución.
- GPU recomendadas: no disponibles. No se especifican A100, H100, RTX 4090 ni otros modelos.
- GPU de consumo: no confirmado. No hay requisitos publicados que permitan afirmar que quepa en una GPU de consumo concreta.
- Opciones de despliegue: ONNX Runtime es la vía coherente con el formato publicado, pero no está documentada. vLLM, llama.cpp, Ollama y TGI no aplican a este artefacto.
- Latencia y throughput: no disponibles. La model card solo declara una frecuencia de control de 50 Hz para el movimiento.

## Comparativa con modelos similares

No disponible. No se han identificado alternativas comparables en la información suministrada; además, se trata de una política específica para el robot Microduck, no de un modelo de lenguaje.

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| microduck-tiptoe | Política robótica ONNX | no disponible | no disponible | no disponible | Hugging Face |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- La licencia no está disponible, por lo que no se puede confirmar si el uso comercial está permitido.
- No hay información sobre sesgos, datos de entrenamiento, población de validación ni condiciones de recogida de datos.
- El riesgo de alucinación no aplica como en un modelo de lenguaje; el riesgo equivalente es un fallo de la política de control o un comportamiento físico no previsto.
- El movimiento es fijo y dura 10,7 s; no se documenta que sea composable, parametrizable o adaptable a otras secuencias.
- La interfaz de 61 observaciones y 14 articulaciones está acoplada al robot Microduck; no se documenta portabilidad a otro hardware.
- Requiere ejecución a 50 Hz, lo que exige validar el determinismo y la sincronización del runtime en el robot.
- No hay benchmarks ni métricas de éxito que permitan estimar robustez ante cambios de terreno, carga o calibración.
- Al tratarse de una política física, debe validarse en simulación y con paradas de emergencia antes de operar cerca de personas.
- No es un modelo multilingüe ni un modelo generativo de texto; las capacidades de lenguaje, tool calling y agentes no están disponibles.

## Enlaces

- [Hugging Face: microduckapp/microduck-tiptoe](https://huggingface.co/microduckapp/microduck-tiptoe)
- [policy.onnx](https://huggingface.co/microduckapp/microduck-tiptoe/blob/main/policy.onnx)
- [manifest.json](https://huggingface.co/microduckapp/microduck-tiptoe/blob/main/manifest.json)
- [media/preview.mp4](https://huggingface.co/microduckapp/microduck-tiptoe/blob/main/media/preview.mp4)
- Resultados de búsqueda web: no se encontraron enlaces relevantes; los resultados disponibles eran tests de velocidad de conexión sin relación con el modelo.
