# Myungkyu/rldx2_smoke_pi05_robotwin_ckpt200

## Resumen

rldx2_smoke_pi05_robotwin_ckpt200 es un checkpoint de robótica basado en Pi0.5, publicado por el usuario Myungkyu como línea base («vanilla baseline») del proyecto RLDX-2. Se trata de un modelo de visión-lenguaje-acción (VLA) construido sobre el backbone preentrenado lerobot/pi05_base y ajustado con el conjunto de datos RoboTwin 2.0 en la configuración de co-entrenamiento del leaderboard: 50 tareas con 50 episodios cada una en la variante demo_clean, con el robot Aloha-AgileX y exportación oficial de LeRobot.

El modelo tiene 4.143.404.816 parámetros (unos 4,14 mil millones) según los pesos en safetensors, y el repositorio ocupa 9,4 GB. Como entradas acepta tres vistas de cámara (cabeza y muñecas izquierda y derecha), un estado articular de 14 dimensiones y la instrucción de la tarea en lenguaje natural; como salida genera objetivos articulares absolutos de 14 dimensiones. Trabaja con un horizonte de acción (chunk) de 50 pasos, usa el commit 09808183 de lerobot 0.5.2 y se entrenó en bf16.

Su relevancia es acotada pero concreta: sirve como referencia reproducible para medir mejoras posteriores dentro de RLDX-2 sobre RoboTwin 2.0 y como ejemplo de exportación de un VLA al formato de LeRobot. El propio nombre del repositorio indica que es un checkpoint de prueba («smoke»): el entrenamiento declarado es muy corto, con batch de 128 y solo 200 pasos de optimizador, por lo que no debe confundirse con un modelo final.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pi0.5 (pila vision-lenguaje-accion de LeRobot 0.5.2, commit 09808183) |
| Parametros totales | 4.143.404.816 (~4,14 mil millones) |
| Parametros activos | No aplica (no es un MoE disperso) |
| Longitud de contexto | no disponible; horizonte de accion (chunk) de 50 pasos |
| Tipos de cuantizacion | no disponible (pesos entrenados en bf16; no se publica GGUF ni variantes cuantizadas) |
| Idiomas soportados | no disponible (recibe instrucciones de tarea en lenguaje natural; el idioma no se declara) |
| Licencia | no disponible |
| Formato de pesos | safetensors (libreria lerobot) |
| Modelo base | lerobot/pi05_base |
| Conjunto de datos de ajuste | TianxingChen/RoboTwin2.0 (50 tareas x 50 episodios demo_clean) |
| Entradas | imagenes de cabeza + muneca izquierda + muneca derecha, estado articular de 14 dimensiones, instruccion de tarea |
| Salidas | 14 dimensiones de objetivos articulares absolutos |
| Tamano del repositorio | 9,4 GB |
| Fecha de creacion | 2026-10-03 |

## Arquitectura y entrenamiento

La arquitectura corresponde a Pi0.5, la pila de visión-lenguaje-acción distribuida dentro de LeRobot. Combina un backbone preentrenado de tipo visión-lenguaje que procesa las tres vistas de cámara junto con la instrucción textual, y un módulo generador de acciones que produce trayectorias de 14 dimensiones en coordenadas articulares absolutas. El modelo se ejecuta con un horizonte de predicción de 50 pasos (chunk 50), lo que permite emitir bloques de acciones en lugar de comandos individuales y reduce la frecuencia efectiva de inferencia necesaria para el control. Las configuraciones del repositorio referencian el backbone y el tokenizador por su identificador de hub, en lugar de duplicar los pesos base.

El ajuste se hizo sobre el conjunto RoboTwin 2.0 en su configuración de co-entrenamiento del leaderboard: 50 tareas, 50 episodios por tarea en la variante demo_clean, con el robot Aloha-AgileX y exportación oficial de LeRobot. El entrenamiento usó precisión bf16, un batch de optimizador de 128 y únicamente 200 pasos, con el estado del optimizador excluido del checkpoint final. No se documentan en la información disponible ni la composición exacta del dataset, ni fases de RLHF o DPO, ni innovaciones técnicas adicionales más allá del uso del backbone Pi0.5 y del esquema de predicción por chunks.

## Capacidades

- Generación de acciones robóticas de manipulación a partir de observaciones visuales: convierte tres imágenes de cámara más el estado articular en 14 objetivos articulares absolutos.
- Condicionamiento por instrucciones en lenguaje natural: la tarea a ejecutar se especifica como texto.
- Control bimanual sobre la plataforma Aloha-AgileX, con 14 grados de libertad en el estado y en la acción.
- Co-entrenamiento multitarea: el ajuste cubre 50 tareas distintas del benchmark RoboTwin 2.0, lo que favorece la generalización entre tareas dentro de ese dominio.
- Predicción de bloques de acción (chunk de 50 pasos), útil para control a mayor frecuencia efectiva.
- Integración nativa con LeRobot: carga mediante la librería lerobot, con configuración que referencia el backbone por identificador de hub.
- Evaluación mediante adaptadores externos del proyecto RLDX-2 (ops/eval/xpl).
- No se declaran capacidades de tool calling, function calling, agentes, visión generalista, audio ni modo de razonamiento explícito.

## Casos de uso

- Referencia base para el leaderboard de RoboTwin 2.0: el modelo está pensado como «vanilla baseline» del proyecto RLDX-2, de modo que cualquier variante posterior puede compararse contra él en las mismas 50 tareas y con los mismos 50 episodios demo_clean por tarea.
- Punto de partida para ajuste fino propio: al ser un checkpoint derivado de lerobot/pi05_base y exportado en formato LeRobot, sirve como inicialización para reentrenar sobre tareas de manipulación propias con menos coste que partir del backbone original.
- Validación de pipelines de exportación e importación: útil para verificar que un VLA exportado por LeRobot se carga, se ejecuta y se evalúa correctamente antes de invertir cómputo en entrenamientos largos.
- Pruebas de integración en simulación: permite ensayar los adaptadores de evaluación del repositorio RLDX-2 (ops/eval/xpl) y comprobar la cadena completa de inferencia con tres cámaras y estado de 14 dimensiones.
- Investigación en condicionamiento por lenguaje en robótica: al aceptar instrucciones de tarea como entrada, permite estudiar cómo varía la política ante reformulaciones de la misma orden dentro del dominio RoboTwin.
- Comparación de arquitecturas VLA: sirve como punto de control Pi0.5 con un coste de entrenamiento conocido (batch 128, 200 pasos) para contrastar contra otros backbones sobre el mismo conjunto de datos.
- Control bimanual en laboratorio con Aloha-AgileX, siempre que se asuma que el modelo es un checkpoint de prueba y no un sistema validado para producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tasas de éxito por tarea, ni métricas agregadas del leaderboard de RoboTwin 2.0, ni comparaciones numéricas con otras políticas.

## Requisitos de hardware

- VRAM estimada en bf16: en torno a 8,3 GB solo para los pesos (4,14 mil millones de parámetros), más activaciones y buffers de imagen, lo que sitúa el consumo realista de inferencia en el rango de 10 a 16 GB según resolución y número de vistas.
- VRAM estimada en fp32: unos 16,6 GB solo para los pesos.
- GPU recomendadas: NVIDIA A100 (40/80 GB), H100, L40S o RTX 6000 Ada para despliegue y evaluación cómodos; una RTX 4090 o RTX 3090 (24 GB) es suficiente para inferencia en bf16.
- Compatibilidad con GPU de consumo: sí, previsiblemente en RTX 4090, RTX 3090 y modelos con 24 GB; en tarjetas de 16 GB el margen es ajustado y depende del preprocesado de las tres cámaras.
- Opciones de despliegue: LeRobot (versión 0.5.2, commit 09808183) con PyTorch; los adaptadores de evaluación del proyecto RLDX-2. No se documenta soporte para vLLM, TGI, llama.cpp ni Ollama, y no hay pesos GGUF publicados.
- Latencia y throughput: no disponible. El único dato relacionado es el horizonte de 50 pasos por bloque de acción, que amortigua el coste de inferencia por comando.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Modelo base | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rldx2_smoke_pi05_robotwin_ckpt200 | 4.143.404.816 | VLA Pi0.5 ajustado en RoboTwin 2.0 | lerobot/pi05_base | no disponible | HuggingFace (libreria lerobot) |
| lerobot/pi05_base | no disponible en la informacion proporcionada | Backbone VLA Pi0.5 preentrenado | no aplica | no disponible | HuggingFace |
| Otras lineas base del leaderboard RoboTwin 2.0 | no disponible | VLA de manipulacion | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento, contexto ni licencia de las alternativas en la informacion proporcionada, por lo que la comparacion se limita a la relacion de derivacion entre este checkpoint y su modelo base.

## Limitaciones y advertencias

- El nombre del repositorio indica que es un checkpoint de prueba («smoke») y el entrenamiento declarado es de solo 200 pasos de optimizador con batch 128: el modelo dista mucho de estar convergido y no deberia usarse como referencia de calidad final.
- La licencia no esta declarada, lo que impide determinar si se permite el uso comercial; conviene contactar con el autor antes de cualquier despliegue productivo.
- Al derivar de lerobot/pi05_base, el checkpoint hereda las condiciones de uso del modelo base, que tampoco se detallan en la informacion disponible.
- El ajuste se limita al dominio de RoboTwin 2.0 y a la plataforma Aloha-AgileX con 14 grados de libertad; no hay evidencia de transferencia a otros robots, morfologias o entornos reales.
- El modelo depende de tres vistas de camara concretas (cabeza, muneca izquierda, muneca derecha) y de un estado articular de 14 dimensiones; cualquier variacion en la configuracion de sensores invalida su uso directo.
- No se documentan sesgos, comportamiento ante entradas fuera de distribucion ni tasas de alucinacion o de fallo en la ejecucion de tareas; al ser un modelo de accion, los errores se manifiestan como movimientos incorrectos del robot, con el riesgo fisico que ello implica.
- No hay informacion sobre idiomas soportados para las instrucciones de tarea ni sobre robustez ante reformulaciones.
- No se publican pesos cuantizados ni soporte para motores de inferencia de proposito general, lo que limita las opciones de despliegue eficiente.
- El estado del optimizador no esta incluido en el checkpoint, de modo que no es posible reanudar el entrenamiento exactamente desde ese punto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Myungkyu/rldx2_smoke_pi05_robotwin_ckpt200
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Conjunto de datos de ajuste: https://huggingface.co/datasets/TianxingChen/RoboTwin2.0
- Adaptadores de evaluacion del proyecto RLDX-2: https://github.com/myungkyuKoo/RLDX-2 (ruta ops/eval/xpl)
- Libreria LeRobot: https://github.com/huggingface/lerobot (version 0.5.2, commit 09808183)
- La busqueda web proporcionada no devolvio resultados relacionados con el modelo; no se han podido anadir enlaces adicionales de papers, blogs o demos.
