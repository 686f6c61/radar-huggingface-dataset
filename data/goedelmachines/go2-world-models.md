# GoedelMachines/go2-world-models

## Resumen

go2-world-models es una familia de checkpoints publicada por Gödel Machines (Ramakrishna Kompella) para la prediccion de dinamica de un robot cuadrupedo Unitree Go2. El modelo pronostica las proximas 30 lecturas del cuerpo y las articulaciones a 50 Hz, es decir, una ventana de 0,6 segundos por paso de inferencia, y puede encadenarse para producir horizontes de hasta tres segundos (150 lecturas) a partir de una secuencia de objetivos articulares. No es un modelo de lenguaje: es un modelo de mundo (world model) orientado a robotica, con pesos en FP32 y arquitectura no detallada en la informacion disponible.

La publicacion incluye 25 checkpoints organizados en dos familias. La raiz y la familia `sweep/w*/b*/` (20 checkpoints) requieren, ademas del historial medido y los objetivos articulares, un escaneo futuro del terreno codificado como una rejilla de 17 × 11 alineada al yaw. La familia `proprio/` (5 checkpoints) prescinde del escaneo y trabaja solo con historial de encoder e IMU mas objetivos articulares propuestos. El checkpoint raiz tiene 120.370.206 parametros por paso y el flagship adaptado 119.670.302 parametros totales; los modelos padres menores tienen anchos de 1.024, 1.440, 2.048 y 2.880.

Su relevancia es doble: por un lado, aborda el escalado de modelos de mundo para cuadrupedos con una evaluacion explicita en simulacion y en el robot real; por otro, separa la dependencia de percepcion (escaneo de terreno) de la estimacion puramente propioceptiva, lo que permite desplegar el modelo en el Go2 sin sensor de profundidad. La salida es siempre un pronostico de movimiento en lazo abierto, no un controlador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de mundo para dinamica de cuadrupedo; pesos PyTorch) |
| Parametros totales | 120.370.206 por paso (checkpoint raiz); 119.670.302 (flagship adaptado) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 51 lecturas de entrada (incluye el origen del pronostico) + 50 objetivos articulares; salida de 30 lecturas por paso, hasta 150 lecturas (3 s) encadenando |
| Tipos de cuantizacion | no disponible (checkpoints en FP32) |
| Idiomas soportados | en (etiqueta de la model card; el modelo no procesa lenguaje) |
| Licencia | no disponible |
| Formato de pesos | safetensors (por defecto en adaptados); tambien checkpoint original de PyTorch con pesos, argumentos de entrenamiento, contador de actualizaciones y metricas |
| Frecuencia de operacion | 50 Hz (30 lecturas por paso = 0,6 s) |
| Entradas | historial medido, objetivos articulares absolutos y, en la familia con escaneo, codificacion de terreno 17 × 11 alineada al yaw y recortada |
| Salidas | world up en el marco del cuerpo, 3 velocidades angulares (rad/s), 12 angulos articulares (rad) y 12 velocidades articulares (rad/s) |
| Tamano del repo | 4,7 GB |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna (tipo de transformer, atencion, capas o funcion de perdida). Lo que si se especifica es la interfaz y el regimen de entrenamiento: el modelo consume 51 lecturas (incluyendo el origen del pronostico) junto con los 50 objetivos articulares que las conectan, y devuelve 30 lecturas futuras por paso. Los datos de entrenamiento son simulados; la evaluacion fisica se realizo con un unico Go2 sobre suelo plano, reproduciendo objetivos articulares previamente publicados. No se indica el numero de tokens ni la composicion del dataset.

La familia se estructura en 20 checkpoints padres que comparten cinco trayectorias de entrenamiento, con anchos de 1.024, 1.440, 2.048 y 2.880, mas 5 checkpoints adaptados en `proprio/`. El manifiesto publicado identifica rutas, hashes de los ficheros de tensores, hashes de origen, exposicion y el padre de cada modelo adaptado, lo que permite reproducir la procedencia de cada checkpoint. La innovacion principal es la separacion entre un modelo condicionado por escaneo de terreno y un modelo puramente propioceptivo, con un proceso de adaptacion que elimina la dependencia del sensor de profundidad.

## Capacidades

- Pronostico de dinamica a corto plazo: predice 30 lecturas del cuerpo y las articulaciones a 50 Hz por paso de inferencia.
- Pronostico multi-paso: encadenando pasos, una secuencia de 150 objetivos articulares devuelve 150 lecturas, equivalentes a tres segundos.
- Estimacion de orientacion: proporciona el vector "world up" en el marco del cuerpo.
- Estimacion de velocidades angulares del cuerpo en rad/s (tres ejes).
- Prediccion de 12 angulos articulares y 12 velocidades articulares en rad/s, ordenadas por cadera, muslo y pantorrilla, y dentro de cada grupo por delantera izquierda, delantera derecha, trasera izquierda y trasera derecha.
- Condicionamiento por terreno: la familia con escaneo acepta una codificacion 17 × 11 alineada al yaw y recortada en cada pose futura registrada.
- Modo propioceptivo: la familia `proprio/` funciona sin escaneo, solo con historial medido y objetivos articulares.
- No soporta tool calling, agentes, vision generica, audio ni generacion de lenguaje; la etiqueta `en` de la model card no implica capacidades linguisticas.

## Casos de uso

- Planificacion de trayectorias en simulacion: dado un candidato de objetivos articulares, el modelo pronostica la evolucion del cuerpo y las articulaciones para descartar trayectorias inestables antes de ejecutarlas en el simulador, reduciendo el numero de rollouts fisicos necesarios.
- Control predictivo (MPC) con modelo aprendido: el modelo puede actuar como dinamica interna de un controlador predictivo que optimiza objetivos articulares a 0,6 s vista, usando la familia `proprio/` para evitar depender de escaneos de terreno en tiempo real.
- Deteccion de anomalias en el robot real: comparar la prediccion a un segundo con las lecturas reales del Go2 permite detectar deslizamientos, fallos de actuador o contactos inesperados; el error RMSE de 0,0641 rad en angulos articulares a tres segundos sirve de referencia.
- Aumento de datos para aprendizaje por refuerzo: generar pronosticos de estado a partir de comandos articulares para preentrenar politicas o estimadores de estado en el simulador, aprovechando los 20 checkpoints padres con distintos anchos.
- Validacion de politicas antes de despliegue: ejecutar una politica candidata contra el modelo de mundo para medir su consistencia dinamica en suelo plano antes de probarla en hardware, con la cautela de que el modelo es de lazo abierto.
- Investigacion en modelos de mundo para robotica: la familia escalonada (anchos 1.024 a 2.880) y el par con/sin escaneo permiten estudiar el efecto del escalado y de la percepcion de terreno en la calidad del pronostico.
- Estimacion de estado asistida: usar las velocidades angulares y articulares predichas como senal auxiliar para filtros de estado cuando la IMU o los encoders presentan ruido o caidas puntuales.

## Benchmarks y rendimiento

| Evaluacion | Metrica | Resultado |
|---|---|---|
| Barrido en simulacion condicionado por escaneo (checkpoint raiz) | Error de punto final normalizado a 3 s | 0,364 |
| 32 mundos de suelo plano reservados (flagship adaptado) | Error a 1 s | 0,613 |
| 32 mundos de suelo plano reservados (flagship adaptado) | Error a 3 s | 1,009 |
| 9 grabaciones reales del SDK del Go2, modo por defecto | RMSE de angulo articular a 3 s | 0,0641 rad |
| 4 grabaciones reales a 0,5 m/s | RMSE de angulo articular a 3 s | 0,0461 rad |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni benchmarks de lenguaje en la informacion disponible, ya que el modelo no es linguistico.

## Requisitos de hardware

- VRAM estimada: con 120,4 M de parametros en FP32, los pesos ocupan aproximadamente 0,48 GB; el repo completo son 4,7 GB porque incluye los 25 checkpoints. La VRAM real depende del grafo de inferencia y del tamano de lote, no especificados.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM libre deberia poder cargar un checkpoint individual en FP32; no se publican requisitos oficiales.
- GPU de consumo: si, cabe en tarjetas consumer como RTX 3060, RTX 4060 o superiores; tambien es viable en CPU para inferencia de un unico paso, aunque no se publican latencias.
- Opciones de despliegue: el autor remite al repositorio del proyecto para el cargador y los ejemplos; los pesos estan en PyTorch y safetensors. No se menciona soporte de vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles. La frecuencia de operacion del modelo es 50 Hz (paso de 0,6 s), pero no se publica el coste computacional por paso.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de modelos de mundo para cuadrupedos ni datos de terceros con los que contrastar parametros, contexto o rendimiento.

## Limitaciones y advertencias

- El pronostico es de lazo abierto: el modelo no corrige con realimentacion durante el horizonte predicho, por lo que el error crece con el tiempo (de 0,613 a 1 s a 1,009 a 3 s en la evaluacion adaptada).
- La familia raiz y `sweep/` requiere escaneos futuros del terreno en cada pose registrada; sin ese sensor no es desplegable en el robot.
- Los datos de entrenamiento son simulados y la validacion fisica se hizo con un unico Go2 sobre suelo plano; el comportamiento en terrenos irregulares, pendientes o superficies de baja friccion no esta caracterizado.
- La evaluacion fisica reproduce objetivos articulares previamente publicados, no una politica cerrada en lazo.
- El modelo no predice posicion, velocidad lineal ni contactos de pies: estan explicitamente fuera de la interfaz de salida.
- Licencia no disponible: no puede asumirse uso comercial permitido; es necesario contactar con el autor antes de integrarlo en produccion.
- Solo se declara idioma `en` y no procesa lenguaje natural; cualquier uso como modelo conversacional es inadecuado.
- El orden de las articulaciones es especifico (cadera, muslo, pantorrilla; delantera izquierda, delantera derecha, trasera izquierda, trasera derecha) y un error de ordenacion invalida las predicciones.
- No se publican sesgos, tasas de alucinacion ni analisis de robustez fuera de la distribucion de entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/GoedelMachines/go2-world-models
- Repositorio del proyecto (cargador, ejemplos y paper): https://github.com/Go2WorldModels/go2worldmodels.github.io
