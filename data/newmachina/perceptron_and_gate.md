# newmachina/perceptron_and_gate

## Resumen

El modelo `newmachina/perceptron_and_gate` es un perceptrón de una sola capa entrenado para implementar la compuerta lógica AND. Con solo 3 parámetros (dos pesos y un sesgo), representa el ejemplo más básico de aprendizaje automático supervisado y sirve como demostración didáctica de los fundamentos de las redes neuronales. Fue publicado por el usuario `newmachina` en HuggingFace bajo licencia Apache 2.0, aunque no se proporciona documentación adicional ni detalles de entrenamiento.

Su relevancia actual es puramente pedagógica: permite ilustrar el funcionamiento de un modelo lineal, el algoritmo de descenso de gradiente y la diferencia entre problemas linealmente separables y no separables. No es un modelo utilizable en producción ni comparable con los LLM modernos, pero resulta útil como punto de partida para quienes se inician en el aprendizaje automático.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Perceptron de una sola capa (regresion logistica binaria) |
| Parametros totales | 3 (2 pesos + 1 sesgo) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (pesos en punto flotante, sin cuantizacion) |
| Idiomas soportados | no disponible (no procesa lenguaje natural) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un perceptron clasico: una unica neurona con funcion de activacion escalon (o sigmoide) que recibe dos entradas binarias y produce una salida binaria. La funcion de decision es `y = step(w1*x1 + w2*x2 + b)`, donde `w1`, `w2` y `b` son los tres parametros entrenables. No se dispone de informacion sobre el algoritmo de entrenamiento utilizado (descenso de gradiente, regla de aprendizaje del perceptron, etc.), ni sobre el numero de epocas o el conjunto de datos empleado. Dado que la compuerta AND es linealmente separable, cualquier metodo de optimizacion basico converge rapidamente a una solucion correcta.

## Capacidades

- Implementa la compuerta logica AND para dos entradas binarias (0 o 1).
- Clasifica correctamente las cuatro combinaciones posibles de entrada segun la tabla de verdad de AND.
- No genera texto, no razona, no procesa lenguaje natural ni tiene capacidad de generalizacion mas alla de la tarea especifica.
- No soporta tool calling, agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues ni de vision.

## Casos de uso

- Material didactico en cursos de introduccion al aprendizaje automatico: permite visualizar como un modelo lineal separa clases en un espacio bidimensional.
- Demostracion de la regla de aprendizaje del perceptron: los estudiantes pueden modificar los pesos y observar el cambio en la frontera de decision.
- Ejemplo de serializacion de modelos con safetensors: muestra como almacenar y cargar un modelo minimo en el ecosistema HuggingFace.
- Prueba de pipelines de inferencia: sirve para verificar que una infraestructura de despliegue (por ejemplo, un servidor de inferencia) funciona correctamente con un modelo trivial.
- Comparacion con compuertas OR y XOR: ilustra la limitacion de los modelos lineales ante problemas no linealmente separables (XOR).
- Ejercicio de implementacion manual: los desarrolladores pueden reproducir el modelo desde cero y comparar sus resultados con los pesos publicados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Dado que el modelo solo resuelve la compuerta AND, su rendimiento se limita a clasificar correctamente las 4 entradas posibles, lo cual es trivial y no requiere evaluacion estandarizada.

## Requisitos de hardware

- VRAM estimada: menos de 1 MB (el modelo ocupa 3 parametros en punto flotante).
- GPU recomendada: ninguna; se ejecuta en CPU con cualquier procesador moderno.
- Cabe en cualquier hardware, incluidos microcontroladores y dispositivos embebidos.
- Opciones de despliegue: puede cargarse con la libreria `transformers` (si se adapta como modelo custom) o directamente con `safetensors` y `numpy` para inferencia manual.
- Latencia: del orden de microsegundos por inferencia.

## Comparativa con modelos similares

No se dispone de modelos comparables en el mismo repositorio o con la misma finalidad publicados por otros autores. Los perceptrones para compuertas AND suelen implementarse como ejercicios de codigo (por ejemplo, en Python puro) y no se publican como modelos en HuggingFace. Por tanto, la comparativa no esta disponible.

## Limitaciones y advertencias

- El modelo solo resuelve la compuerta AND; no es util para ninguna otra tarea.
- No procesa lenguaje natural ni datos no binarios.
- No hay informacion sobre el proceso de entrenamiento ni sobre la calidad de los pesos (podrian estar inicializados aleatoriamente sin entrenamiento real).
- La licencia Apache 2.0 permite uso comercial, pero el modelo carece de valor practico en produccion.
- Al ser un modelo de 3 parametros, no presenta riesgos de sesgo, alucinacion o seguridad, pero tampoco ofrece ninguna capacidad relevante.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/newmachina/perceptron_and_gate
- Referencia sobre el algoritmo del perceptron para AND (GeeksforGeeks): https://www.geeksforgeeks.org/machine-learning/implementation-of-perceptron-algorithm-for-and-logic-gate-with-2-bit-binary-input/
- Ejemplo educativo de perceptron para AND en Python (GitHub): https://github.com/daichi0710/lg2t-part1-and-gate
