# GeertWang/starvla-pipette-aim-wrist1031-qwenoft-scratch-q1all

## Resumen

starvla-pipette-aim-wrist1031-qwenoft-scratch-q1all es un modelo de vision-lenguaje-accion (VLA) para control robotico, desarrollado por el usuario GeertWang dentro del ecosistema starVLA. Resuelve una tarea muy concreta de manipulacion bimanual con el robot humanoide Unitree G1 equipado con manos Inspire: introducir una pipeta sostenida en la mano derecha dentro de un tubo sostenido en la mano izquierda. Se trata del paso 3 de una secuencia de laboratorio y el checkpoint corresponde al paso 4170, el ultimo guardado durante el entrenamiento.

El modelo parte de Qwen3-VL-4B-Instruct como backbone preentrenado y le anade una cabeza OFT (Orthogonal Fine-Tuning) inicializada desde cero. El entrenamiento es puro behavior cloning (sin RL) sobre un dataset agregado de demostraciones humanas y rollouts autonomos, con 10 epocas, batch de 128 y learning rate de 2,5e-5 con decaimiento coseno. El repositorio ocupa 9,1 GB y se distribuye en formato PyTorch (.pt) a traves de la libreria starvla.

Su relevancia es acotada pero clara: sirve como referencia reproducible de un pipeline VLA con DAgger para tareas de precision en robotica de laboratorio, y como ejemplo de como adaptar un VLM de 4B a control motor fino. No es un modelo de proposito general ni tiene benchmarks publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA basada en Qwen3-VL-4B-Instruct con cabeza OFT |
| Parametros totales | aproximadamente 4B (backbone) mas cabeza OFT; cifra exacta no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | PyTorch (.pt): `qwenoft/checkpoints/steps_4170_pytorch_model.pt` |

## Arquitectura y entrenamiento

El modelo sigue un esquema VLA clasico: un backbone VLM (Qwen3-VL-4B-Instruct) que procesa observaciones visuales y produce representaciones, acoplado a una cabeza OFT entrenada desde cero que genera las acciones motoras. La entrada combina tres vistas (ego, FOCUS y wrist_left) mas la velocidad de muneca medida como estado. Todos los parametros son entrenables, sin congelacion parcial del backbone.

El entrenamiento es behavior cloning supervisado, sin RL, sobre el dataset data_q1all (fechado el 11-04), compuesto por data_pico1103 mas data_dagger_q1. Este ultimo agrega los exitos autonomos de QwenOFT con solo PICO a decay 1.0 y las tomas de control de la ronda 2 de DAgger. El muestreo es uniforme por trayectoria, con peso 2 para datos humanos y 1 para automaticos. Las trayectorias se grabaron con recorte de muneca y cada una se corta antes de su pull-out. Se entrenaron 10 epocas con batch 128, lr 2,5e-5 con coseno hasta 1e-6 y warmup de 208 pasos. El checkpoint subido es el ultimo paso guardado (4170) y no fue probado en robot antes de la subida.

## Capacidades

- Control visomotor bimanual para la tarea especifica de alinear e insertar una pipeta en un tubo.
- Procesamiento multimodal de tres vistas simultaneas (ego, FOCUS, wrist_left).
- Integracion de estado propioceptivo: velocidad de muneca medida.
- Aprendizaje por imitacion (behavior cloning) con datos humanos y autonomos via DAgger.
- Generacion de acciones continuas de control para el Unitree G1 con manos Inspire.
- No soporta tool calling, function calling ni razonamiento multi-paso general.
- Capacidades multilingues no evaluadas ni documentadas.
- No dispone de modo thinking, vision general, audio ni otras capacidades fuera de la tarea.

## Casos de uso

- Automatizacion de laboratorio: el modelo ejecuta el paso de insercion de pipeta en tubo dentro de un protocolo mayor, reduciendo la intervencion manual en tareas repetitivas de precision.
- Investigacion en VLA: sirve como punto de partida reproducible para estudiar behavior cloning con DAgger sobre un backbone Qwen3-VL-4B, con hiperparametros y composicion de datos documentados.
- Benchmark de manipulacion bimanual: permite comparar estrategias de fusion de vistas (ego + FOCUS + wrist) y de incorporacion de estado propioceptivo en tareas de alineacion fina.
- Desarrollo de pipelines DAgger: el dataset y el esquema de pesos (humano 2, auto 1) son una referencia para disenar rondas de recogida de datos con correcciones humanas.
- Prototipado en robotica de laboratorio: util para validar la cadena starvla sobre Unitree G1 con manos Inspire antes de escalar a otras tareas.
- Docencia y divulgacion: ejemplo concreto de adaptacion de un VLM de 4B a control motor, con decisiones de entrenamiento explicitas y trazables.
- No es adecuado para atencion al cliente, generacion de codigo, agentes conversacionales ni aplicaciones de texto general.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tasas de exito, metricas de error de posicion ni comparaciones cuantitativas con otros checkpoints o metodos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada; como referencia, un backbone de 4B en precision completa requiere del orden de 8-10 GB solo para pesos, mas las tres vistas visuales y el estado, pero no hay medicion oficial.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada; probablemente viable en GPUs con 16-24 GB si se aplica cuantizacion, pero no documentado.
- Opciones de despliegue: la libreria declarada es starvla; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, y al ser un modelo de accion no encaja en esos servidores de texto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| starvla-pipette-aim-wrist1031-qwenoft-scratch-q1all | aprox. 4B | no disponible | Insercion de pipeta en Unitree G1 | no disponible | HuggingFace, 0 descargas |
| OpenVLA | aprox. 7B | no disponible | Manipulacion general | no disponible en esta ficha | Publico |
| pi0 (Physical Intelligence) | no disponible | no disponible | Control robotico general | no disponible en esta ficha | Publico |

La comparacion cuantitativa con alternativas no esta disponible: no hay benchmarks comunes ni metricas publicadas para este checkpoint.

## Limitaciones y advertencias

- Modelo de tarea unica: solo ejecuta el paso 3 de insercion de pipeta; no generaliza a otras tareas sin reentrenamiento.
- Checkpoint no validado en robot: la model card indica explicitamente que no se probo en hardware antes de la subida.
- Sin datos de licencia: no se puede confirmar el uso comercial; conviene contactar con el autor antes de cualquier despliegue productivo.
- Riesgo de alucinacion motora: al ser behavior cloning sin RL, puede producir acciones fuera de distribucion ante estados no vistos.
- Dependencia de la configuracion exacta: tres vistas concretas y velocidad de muneca medida; cambiar sensores o calibracion invalida el modelo.
- Dataset limitado y con sesgo de recogida: mezcla de datos humanos y autonomos con pesos fijos, lo que puede infrarepresentar situaciones de recuperacion de errores.
- Sin soporte multilingue ni de texto general: no debe usarse como VLM conversacional.
- Sin cuantizaciones publicadas: el despliegue en hardware limitado requiere conversion manual y validacion.
- Repositorio de 9,1 GB y 0 descargas: sin validacion de la comunidad, lo que aumenta el riesgo de problemas no documentados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/GeertWang/starvla-pipette-aim-wrist1031-qwenoft-scratch-q1all
- Repositorio starVLA: no disponible en la informacion proporcionada
- Paper o blog del metodo: no disponible en la informacion proporcionada
- Demo o video: no disponible en la informacion proporcionada
