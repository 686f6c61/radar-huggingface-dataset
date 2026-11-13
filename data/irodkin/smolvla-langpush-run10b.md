# irodkin/smolvla-langpush-run10b

## Resumen

SmolVLA-langpush-run10b es un ajuste fino del modelo base `lerobot/smolvla_base` para control robotico por lenguaje natural en simulacion. Lo desarrolla irodkin (equipo 08 del proyecto ROB7103/8103 Embodied AI) y resuelve una tarea concreta: un brazo Seeed reBot Arm B601-RS con una camara de movil en la muneca debe empujar el cubo rojo o el cubo azul hacia una zona objetivo verde segun la instruccion verbal recibida. El modelo parte de SmolVLA, una politica vision-language-action (VLA) compacta de 450 millones de parametros distribuida a traves de la libreria LeRobot.

La relevancia de este checkpoint no esta en el tamano sino en el metodo: es el primero de la serie del autor que sigue efectivamente la palabra de color. El truco consiste en combinar un modo de accion "delta" (movimientos relativos de la punta de la herramienta en su propio marco) con el desbloqueo de las 8 capas superiores del modelo vision-lenguaje durante el ajuste fino. Con ello pasa de 74/192 aciertos en la configuracion inicial a 165/192 en la evaluacion por lotes sobre 96 disposiciones simetricas y dos condiciones visuales.

Se trata de un artefacto de investigacion acotado: solo simulacion MuJoCo, sin validacion en hardware real, licencia no declarada y cero descargas en el momento de redactar esta ficha. Resulta util como referencia reproducible de ajuste fino VLA con LeRobot, no como componente listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) basada en SmolVLA (transformer con experto de accion) |
| Parametros totales | 450.046.176 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; el autor menciona copias float32 de los pesos entrenables) |
| Idiomas soportados | no disponible (las instrucciones del entrenamiento son frases en ingles del tipo "Push the red cube into the green target area") |
| Licencia | no disponible |
| Formato de pesos | safetensors (libreria `lerobot`) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura SmolVLA de `lerobot/smolvla_base`: un modelo vision-lenguaje que codifica la imagen de la camara y la instruccion textual, acoplado a un experto de accion que genera secuencias de acciones. En este ajuste se entrena el experto de accion, las proyecciones y las 8 capas superiores del VLM (learning rate 2e-5), manteniendo copias en float32 de los pesos entrenables para evitar que el redondeo a bfloat16 degrade los pasos de ajuste. La entrada visual es una unica camara (`observation.images.camera1`, la del movil), con dos ranuras de camara vacias; la salida son chunks de 50 acciones a 30 fps, con replanificacion cada 10 fotogramas.

El entrenamiento se realizo durante 30.000 pasos con batch de 64 sobre 10.000 demostraciones generadas por un experto scriptado. Las disposiciones son simetricas (cualquiera de los dos cubos puede ser el objetivo), de modo que solo la palabra de color desambigua la tarea; se aleatoriza la mesa blanca, se aplica aumento de imagen de LeRobot y se anade ruido de rumbo en las trayectorias del experto (hasta 45 grados en desplazamiento y 10 grados al empujar). La innovacion clave es el modo de accion "delta": cada accion es el movimiento de la punta en su propio marco, `[dx, dy, dz (m), rx, ry, rz (rad, vector de rotacion)]`, y el estado se reduce a la direccion de la gravedad en el marco de la herramienta (3 numeros). En el modo anterior ("episode") el estado era la pose de la punta respecto al inicio, lo que revelaba en uno o dos fotogramas hacia que cubo iba la demostracion y hacia innecesaria la instruccion verbal.

## Capacidades

- Control robotico de empuje guiado por lenguaje: distingue entre "Push the red cube into the green target area" y "Push the blue cube into the green target area" en entornos simetricos.
- Generacion de acciones en modo delta (movimiento relativo de la punta en su marco) a partir de una imagen y una instruccion.
- Planificacion por chunks: emite 50 acciones por inferencia y replanifica cada 10 fotogramas a 30 fps.
- Percepcion visual monocamara con dos ranuras adicionales vacias.
- No soporta tool calling ni function calling.
- No dispone de modo de razonamiento explicito (thinking mode), audio ni vision multiimagen.
- Capacidades multilingues: no disponibles; las instrucciones de entrenamiento estan en ingles.
- No es un modelo de proposito general: no genera texto libre ni codigo.

## Casos de uso

- Investigacion en politicas VLA: sirve como punto de partida reproducible para estudiar como el ajuste fino parcial del VLM afecta al seguimiento de instrucciones, comparando con los checkpoints 7a y 10a del mismo autor bajo el mismo protocolo de evaluacion.
- Docencia y proyectos de IA encarnada: el flujo completo (entrenamiento con LeRobot, simulacion MuJoCo, evaluacion por lotes con intervalos de confianza) es replicable en un curso de posgrado con recursos modestos.
- Pruebas de ablacion sobre el estado de la politica: el contraste entre modo "episode" y modo "delta" documenta como una representacion de estado demasiado informativa puede filtrar la respuesta y anular el condicionamiento por lenguaje.
- Generacion de datos sinteticos de demostracion: el pipeline de 10.000 demos scriptadas con ruido de rumbo y aumento de imagen puede reutilizarse para preentrenar otras politicas de empuje.
- Banco de pruebas de robustez visual: las dos condiciones visuales y la mesa aleatorizada permiten medir sensibilidad a cambios de apariencia antes de trasladar la politica a hardware.
- Base para ajuste fino en robot real: al ser un checkpoint de LeRobot con safetensors, puede recargarse con `SmolVLAPolicy.from_pretrained` y reentrenarse con imagenes reales del brazo B601-RS.

## Benchmarks y rendimiento

Evaluacion en simulacion sobre 96 disposiciones simetricas por 2 condiciones visuales (192 ensayos por checkpoint), ejecutados en el mismo lote:

| Metrica | Run 7a (episode, VLM congelado) | Run 10a (delta, VLM congelado) | Run 10b (este) |
|---|---|---|---|
| Exitos de 192 (rango al 95%) | 74 (32-46%) | 91 (40-54%) | 165 (80-90%) |
| Empujo el mismo cubo con ambas palabras (de 16 escenas) | 15 | 16 | 5 |
| Primer plan cambia al intercambiar rojo/azul, frente al ruido | 4 frente a 51 mm | 7 frente a 63 mm | 106 frente a 26 mm |

Comparacion pareada 10b frente a 7a sobre las mismas disposiciones: 104 mejores, 13 peores, p < 0.0001 exacto. Una politica ciega al color acertaria aproximadamente el 50%; la linea base scriptada logra 96/96. Desglose por color en 10b: rojo 90/96, azul 75/96. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con 450 millones de parametros, una carga en float32 ronda 1,8 GB y en bfloat16 unos 0,9 GB, sin contar el codificador visual ni los buffers de activaciones.
- GPU recomendadas: no disponibles en la informacion proporcionada; por tamano, cualquier GPU consumer con 4-8 GB de VRAM deberia alojar los pesos, aunque no hay mediciones publicadas.
- Cabe en GPU consumer: previsiblemente si, dado el tamano, pero sin datos de latencia ni throughput confirmados.
- Opciones de despliegue: la via documentada es la libreria LeRobot (`SmolVLAPolicy.from_pretrained` junto con los pre y postprocesadores del repositorio). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que ademas no aplican a una politica de accion.
- Latencia y throughput: no disponibles. El modelo opera a 30 fps con chunks de 50 acciones y replanificacion cada 10 fotogramas, pero no se publican tiempos de inferencia por paso.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento en la tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| irodkin/smolvla-langpush-run10b | 450 M | no disponible | 165/192 (80-90%) | no disponible | Hugging Face, 0 descargas |
| irodkin/smolvla-langpush-run10a (mismo autor) | 450 M (base comun) | no disponible | 91/192 (40-54%) | no disponible | checkpoint de la misma serie |
| Run 7a (mismo autor) | 450 M (base comun) | no disponible | 74/192 (32-46%) | no disponible | checkpoint de la misma serie |
| lerobot/smolvla_base | 450 M (base) | no disponible | no evaluado en esta tarea | no disponible en esta ficha | Hugging Face (modelo base) |

No se dispone de datos para comparar con otras familias VLA (por ejemplo, OpenVLA o pi0) en esta tarea concreta, por lo que la comparativa se limita a los checkpoints de la misma serie.

## Limitaciones y advertencias

- Solo simulacion: no se ha probado con imagenes reales del movil ni con el brazo fisico, por lo que el salto a hardware no esta validado.
- Desequilibrio por color: el azul es mas debil que el rojo (75/96 frente a 90/96); en 21 ensayos con instruccion azul empujo el cubo rojo.
- Requiere conduccion en modo delta (movimientos de punta, no poses absolutas); usarlo con acciones absolutas rompe el supuesto de entrenamiento.
- Dependencia de la simetria del entorno: el condicionamiento por color se aprendio con disposiciones donde ambos cubos podian ser objetivo; no hay evidencia de generalizacion a escenas asimetricas.
- Licencia no declarada: no hay autorizacion explicita para uso comercial ni condiciones de redistribucion, lo que impide su adopcion en produccion.
- Riesgo de alucinacion de instruccion: al ser una politica de accion, el fallo se manifiesta como empuje del cubo equivocado o trayectorias erroneas, no como texto incorrecto.
- Idiomas: sin soporte multilingue documentado; las instrucciones de entrenamiento estan en ingles.
- Repositorio con cero descargas y cero likes: no hay validacion externa ni reportes de terceros sobre su comportamiento.
- El codigo del proyecto y el informe completo estan en un repositorio privado (`RodkinIvan/LangControlledPushing`), lo que limita la reproducibilidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/irodkin/smolvla-langpush-run10b
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Repositorio del proyecto (privado, segun la model card): `RodkinIvan/LangControlledPushing`
- Documentacion de LeRobot: no disponible en la informacion proporcionada
- Paper de SmolVLA: no disponible en la informacion proporcionada
