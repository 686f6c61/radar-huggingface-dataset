# NUSLinSLab/g01-student-v5

## Resumen

G01 student v5 es una política de robotica para manipulacion, desarrollada por NUSLinSLab, que aborda la tarea de agarre y posicionamiento de objetos (grasp an object and bring it to a goal pose) con tolerancias de 2 cm y 15 grados. Se trata de un modelo de imitacion destilado de un profesor PPO con acceso a estado privilegiado, disenado para operar exclusivamente con dos camaras de profundidad como entrada. La arquitectura combina un codificador Point Transformer V3 sobre nubes de puntos con un experto de acciones basado en flow matching condicional que genera chunks de 16 pasos de control a 10 Hz.

El modelo tiene 188 millones de parametros y procesa nubes de puntos del escenario, la mesa, el robot y el objetivo (goal), junto con el estado articular de 9 dimensiones. Incluye un bloque de registro con atencion completa sobre los tokens cercanos al centroide estimado del objeto y una cabeza auxiliar que estima el centroide y la rotacion pendiente.

Es relevante principalmente como referencia arquitectonica y de formato de checkpoint, no como política funcional: el autor indica explicitamente que el entrenamiento se detuvo en el paso 2.400 de los 60.000 planificados y que el checkpoint publicado (EMA en el paso 2.000) nunca se evaluo en bucle cerrado. No debe esperarse exito en la tarea.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Point Transformer V3 (codificador de nubes de puntos) + experto de acciones con flow matching condicional |
| Parametros totales | 188 M (61 M codificador + 118 M experto de acciones + cabezas auxiliares) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (politica de robotica; chunks de 16 pasos de control a 10 Hz) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo no linguistico) |
| Licencia | no disponible |
| Formato de pesos | PyTorch (`.pt`, 718 MB), incluye pesos EMA y metadatos de reconstruccion |

## Arquitectura y entrenamiento

La red se compone de pre-codificadores de puntos por grupo (caracteristicas de Fourier de xyz seguidas de MLP y embedding de grupo) que se fusionan en vóxeles de 1,5 cm. Sobre ellos opera un codificador Point Transformer V3 de 61 M de parametros con 5 etapas (profundidades 2/2/2/6/2, anchos 48/96/192/384/512). Tras la primera etapa se inserta un bloque de registro con atencion completa sobre los tokens situados a menos de 25 cm del centroide estimado del objeto mas los tokens del goal (3 capas, ancho 192), entrenado con etiquetas por token (si el token pertenece al objeto objetivo y donde queda esa superficie en la pose meta) y una cabeza que modela la rotacion pendiente como distribucion sobre una rejilla de 4.096 rotaciones. El experto de acciones (118 M, 14 capas, ancho 768) aplica flow matching condicional sobre chunks de 16 acciones y atiende a los tokens del codificador en cada bloque; su token de estado recibe tambien las estimaciones de centroide y rotacion. Una cabeza auxiliar predice centroide del objeto y posicion de la mano para los siguientes 16 pasos.

El entrenamiento parte de un profesor PPO (`g01_umi_v9_regrasp`, 3.000 millones de pasos de entorno, estado privilegiado, 0,636 de exito sobre 50 objetos retenidos bajo test estricto sin exencion de simetria). El dataset `g01_v9` contiene 46.221 episodios exitosos del profesor, 13,87 M de frames a 10 Hz y 931 objetos de entrenamiento, con aproximadamente la mitad de los episodios recogidos con ruido de ejecucion sobre las acciones del profesor. La receta emplea 7 GPUs con batch 73, AdamW, learning rate 3e-4 tras un calentamiento de 2.000 pasos, EMA 0,999, precision mixta, jitter gaussiano de 2 mm sobre los puntos de camara y drop-path 0,1. El simulador fue Isaac Gym Preview 4 con PyTorch 1.12.

## Capacidades

- Prediccion de chunks de accion de 16 pasos a 10 Hz: 7 dimensiones de objetivo articular (normalizadas por tabla de escala) y 1 dimension de comando de pinza (-1 cerrado, +1 abierto).
- Percepcion unicamente por camara: procesa dos nubes de profundidad fusionadas (320 x 240, 87 grados de campo horizontal) sin acceso a estado privilegiado.
- Estimacion auxiliar del centroide del objeto y de la posicion de la mano para los siguientes 16 pasos.
- Estimacion de la rotacion pendiente del objeto como distribucion sobre 4.096 rotaciones.
- Procesamiento de nubes de puntos con remocion de mesa y robot, muestreo a 6 mm por vóxel y 2.048 puntos por escena.
- Soporte de ejecucion con chunking en tiempo real: chunk nuevo cada 4 pasos de control, primer paso tomado del chunk anterior para absorber latencia y resto como objetivo suave.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingues (no es un modelo de lenguaje).

## Casos de uso

- Referencia de arquitectura para investigacion en manipulacion: el checkpoint permite reconstruir la red y estudiar el diseno Point Transformer V3 + flow matching con bloque de registro, sin esperar rendimiento funcional.
- Base para reentrenamiento o fine-tuning: los pesos EMA en el paso 2.000 pueden servir como inicializacion para runs con el nuevo formato de observacion que motivo la interrupcion.
- Estudio de destilacion profesor-alumno: el par profesor PPO privilegiado / alumno solo-camara documenta una receta completa (46.221 episodios, 13,87 M frames) reutilizable en otras tareas de agarre.
- Validacion de formatos de checkpoint: el layout (`ema`, `step`, `policy`, `args`, `action`, `camera_placement`, `robot`) sirve como plantilla para publicar políticas con convenciones de accion explicitas.
- Analisis de chunking en tiempo real: la convencion de 16 pasos con solapamiento cada 4 pasos permite evaluar estrategias de ejecucion con latencia en brazos manipuladores.
- Investigacion en estimacion de pose: las cabezas auxiliares de centroide y rejilla de rotacion son utilizables como modulo de percepcion en pipelines propios, con la advertencia de su error medido (4,0 cm en centroide y 48,0 grados en rotacion frente a 51,8 grados de una prediccion nula).

## Benchmarks y rendimiento

Resultados medidos en el paso 2.000 sobre episodios retenidos en bucle abierto (no existe metrica en bucle cerrado para este checkpoint):

| Metrica | Valor |
|---|---|
| Perdida de flow matching | 0,133 |
| Error de objetivo articular (primeros 5 pasos del chunk) | 64,1 mrad |
| Varianza no explicada del chunk del profesor (primeros 5 pasos) | 0,86 |
| Varianza no explicada del chunk del profesor (16 pasos) | 0,82 |
| Error de estimacion del centroide del objeto (cabeza auxiliar) | 4,0 cm |
| Error de estimacion de rotacion pendiente | 48,0 grados (51,8 grados si respondiera siempre "sin rotacion") |
| Exito en bucle cerrado | no disponible (nunca evaluado) |

No se han publicado resultados de benchmarks en la informacion disponible para comparacion con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con 188 M de parametros en precision mixta, el peso de los pesos ronda los 0,4-0,8 GB, pero el coste dominante es el procesamiento de nubes de puntos y la atencion del Point Transformer V3, no cuantificado por el autor.
- GPU recomendadas: no disponible. El entrenamiento uso 7 GPUs (modelo no especificado) con PyTorch 1.12 e Isaac Gym Preview 4.
- Cabe en GPU de consumo: probable por tamano de parametros, pero no confirmado por el autor; requiere el paquete `student` del proyecto G01 con las opciones `reg`, `overlay` y `rot_cells`.
- Opciones de despliegue: no disponible para vLLM, llama.cpp, Ollama o TGI (no son aplicables a una politica de robotica). El unico camino documentado es cargar el checkpoint con `torch.load` e instanciar `StudentPolicy` desde el paquete del proyecto.
- Latencia y throughput: no disponibles. La ejecucion prevista usa chunking en tiempo real con un chunk nuevo cada 4 pasos de control a 10 Hz.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye otros modelos de manipulacion comparables ni datos de rendimiento en bucle cerrado que permitan una comparacion rigurosa.

## Limitaciones y advertencias

- Instantanea temprana, no funcional: el autor advierte explicitamente que no es una politica que funcione y que no debe esperarse exito en la tarea.
- Entrenamiento incompleto: detenido en el paso 2.400 de 60.000; el checkpoint publicado es el EMA del paso 2.000, unico del run.
- Sin evaluacion en bucle cerrado: no existe ninguna metrica de exito medida en ejecucion real o simulada.
- Varianza no explicada alta: 0,86 en los primeros 5 pasos del chunk indica que el alumno apenas supera la prediccion de la media del profesor.
- Estimacion de rotacion deficitaria: 48,0 grados frente a 51,8 grados de una respuesta constante "sin rotacion", es decir, apenas informativa.
- Dependencia de codigo externo: la red vive en el paquete `student` del proyecto G01, no incluido en el repositorio; el checkpoint exige la version con las opciones `reg`, `overlay` y `rot_cells`.
- Convenciones de entrada estrictas: coordenadas en metros en el marco de la base del robot, colocacion de camaras "v2" y normalizacion articular por limites; cualquier desviacion invalida las predicciones.
- Licencia no disponible: no se puede confirmar el uso comercial ni la redistribucion.
- Idiomas no disponibles: el modelo no procesa lenguaje.
- Riesgo de sobreajuste al simulador: entrenado en Isaac Gym Preview 4 con jitter de 2 mm; no hay evidencia de transferencia a hardware real.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/NUSLinSLab/g01-student-v5
