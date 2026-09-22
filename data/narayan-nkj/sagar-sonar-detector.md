# Narayan-nkj/sagar-sonar-detector

## Resumen

SAGAR (SonarVision) es un modelo de deteccion de objetos basado en YOLOv8 y desarrollado por el usuario Narayan-nkj, pensado especificamente para imagenes de sonar de barrido lateral (side-scan sonar, SSS). El modelo se distribuye unicamente en formato ONNX y su objetivo es localizar y clasificar de forma automatica anomalias y objetos sumergidos, lo que lo orienta a vigilancia submarina, inspeccion de infraestructura y limpieza medioambiental de fondos marinos.

El modelo resuelve un problema muy concreto: la revision manual de imagenes de sonar es lenta y depende de operadores expertos. SAGAR automatiza esa tarea detectando cinco clases operativas (buzos o nadadores, redes de pesca abandonadas o ghost nets, tuberias submarinas, pecios y objetos cilindricos tipo mina). Se entrena durante 100 epochs con imagenes de 640x640 pixeles y alcanza un mAP50 de 0,764 y un mAP50-95 de 0,538 sobre un conjunto de validacion mixto de sonar sintetico y real.

La relevancia actual del modelo radica en su formato de exportacion: al ser ONNX, se puede ejecutar con ONNX Runtime en vehiculos submarinos autonomos (AUV), estaciones de monitorizacion marina y dispositivos de borde, sin depender de GPU dedicada. Forma parte del proyecto NetraSonar. El repositorio se publico el 22 de septiembre de 2026, no registra descargas ni likes y su tamano declarado es de 0,0 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLOv8 (Ultralytics), red de deteccion de objetos de una etapa |
| Parametros totales | no disponible (la model card no especifica la variante de YOLOv8: n, s, m, l o x) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de vision, entrada de imagen fija de 640x640 pixeles) |
| Tipos de cuantizacion | no disponible; el autor solo declara la exportacion a ONNX en el repositorio |
| Idiomas soportados | en (ingles, segun los metadatos del repositorio; no se documentan otros idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`.onnx`) |

## Arquitectura y entrenamiento

La arquitectura es YOLOv8 de Ultralytics, un detector de objetos de una sola etapa basado en una columna vertebral convolucional con cuellos de agregacion de caracteristicas y una cabeza de deteccion anclada libre (anchor-free). La entrada se fija en 640x640 pixeles y el entrenamiento declarado es de 100 epochs. No se especifica la variante de tamano empleada, el numero de imagenes del dataset, su composicion exacta, ni si se aplicaron tecnicas de aumento de datos, destilacion o ajuste fino de un checkpoint previo de YOLOv8.

El dominio de entrenamiento son imagenes de sonar de barrido lateral, con un conjunto de validacion que el autor describe como mixto, combinando muestras sinteticas y reales. No se documenta ninguna innovacion tecnica adicional: no hay decodificacion especulativa, atencion lineal ni mecanismos híbridos de secuencia, dado que se trata de un detector de vision puro y no de un modelo de lenguaje. Tampoco se indica el uso de RLHF, DPO ni tecnicas equivalentes, que no aplican a esta categoria de modelo.

## Capacidades

- Deteccion de objetos en imagenes de sonar de barrido lateral con coordenadas de caja delimitadora y clase asociada.
- Clasificacion en cinco categorias: `human` (buzos y nadadores), `ghost_net` (redes de pesca abandonadas), `submarine_pipeline` (infraestructura submarina), `shipwreck` (embarcaciones hundidas) y `mine_cylinder` (objetos cilindricos tipo municion sin explotar).
- Supresion de no maximos (NMS) automatica cuando se ejecuta a traves de la API de Ultralytics.
- Inferencia multiplataforma mediante ONNX Runtime, orientada a dispositivos de borde y vehiculos submarinos autonomos.
- Integracion sencilla en Python con las librerias `ultralytics`, `onnxruntime` y `huggingface_hub`.
- No dispone de tool calling, function calling, soporte de agentes, razonamiento multi-paso, capacidades multilingues, modo de razonamiento explicito, vision multimodal general ni procesamiento de audio.

## Casos de uso

- Inspeccion de infraestructura submarina: el modelo detecta tramos de tuberia (`submarine_pipeline`) en imagenes de sonar de barrido lateral, lo que permite automatizar la revision de gasoductos y cables frente a la revision manual frame a frame.
- Limpieza de redes fantasma: con un mAP50 de 0,995 en la clase `ghost_net`, es adecuado para localizar redes de pesca abandonadas antes de planificar campanas de retirada por buceadores o ROV.
- Busqueda y rescate de buceadores: la clase `human` (mAP50 de 0,752) permite rastrear firmas de buzos o nadadores en barridos de sonar, apoyando operaciones de salvamento maritimo.
- Arqueologia y catalogacion de pecios: la deteccion de `shipwreck` facilita el inventariado de embarcaciones hundidas en levantamientos batimetricos extensos, aunque con menor precision que otras clases.
- Deteccion de amenazas submarinas: la clase `mine_cylinder` permite prefiltrar candidatos a municion sin explotar en sonares de barrido, dejando la confirmacion final a un operador humano.
- Vigilancia autonoma con AUV: al estar exportado a ONNX, puede desplegarse a bordo de vehiculos submarinos autonomos para deteccion en tiempo de ejecucion sin conexion a la superficie.
- Monitorizacion medioambiental continua: integrado en estaciones marinas fijas, permite generar alertas automaticas cuando aparece una clase de interes en el flujo de imagenes de sonar.

## Benchmarks y rendimiento

Metricas publicadas por el autor sobre un conjunto de validacion de sonar de barrido lateral sintetico y real:

| Metrica | Valor |
|---|---|
| mAP50 | 0,764 |
| mAP50-95 | 0,538 |
| Precision global (P) | 0,788 |
| Recall global (R) | 0,740 |

Desglose de mAP50 por clase:

| Clase | mAP50 |
|---|---|
| `ghost_net` | 0,995 |
| `submarine_pipeline` | 0,994 |
| `human` | 0,752 |
| `shipwreck` | 0,545 |
| `mine_cylinder` | 0,533 |

No se han publicado resultados comparativos frente a otros modelos de deteccion en sonar en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible como dato del autor. La variante de YOLOv8 no esta especificada, por lo que no es posible dar una cifra fiable; la familia YOLOv8 exportada a ONNX con entrada de 640x640 se ejecuta habitualmente por debajo de 2 GB en FP32, pero se trata de una estimacion orientativa para la familia, no de un dato publicado para este modelo.
- GPU recomendadas: no disponibles. El autor no documenta hardware de entrenamiento ni de inferencia.
- Viabilidad en GPU de consumo: probable en tarjetas de gama media y alta (por ejemplo, RTX 3060 o superiores) por el tamano tipico de la familia YOLOv8 en ONNX, aunque no confirmado por el autor.
- Despliegue: el autor documenta inferencia con `ultralytics` y `onnxruntime`, y orienta el modelo a dispositivos de borde, AUV y estaciones de monitorizacion marina. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a un detector de vision.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La model card no referencia alternativas de deteccion de objetos en sonar ni publica comparaciones con otros detectores, y la busqueda web realizada no ha devuelto informacion relevante sobre este modelo o su categoria (los resultados obtenidos correspondian a pasatiempos sin relacion con el modelo).

## Limitaciones y advertencias

- Dependencia de la firma acustica: el modelo se apoya en las sombras acusticas propias del sonar de barrido lateral. Si la altitud del sonar o el angulo de incidencia cambian de forma drastica, el rendimiento puede degradarse.
- Ruido ambiental: estados de mar agitados, termoclinas o ruido excesivo en la columna de agua pueden provocar falsos positivos. El autor recomienda un umbral de confianza igual o superior a 0,60 en produccion.
- Precision desigual por clase: las clases `ghost_net` y `submarine_pipeline` superan el 0,99 de mAP50, mientras que `shipwreck` (0,545) y `mine_cylinder` (0,533) quedan muy por debajo. No conviene tratarlas como equivalentes en un flujo critico.
- Riesgo de alucinacion: como todo detector, puede generar cajas sobre objetos inexistentes, especialmente con ruido acustico elevado. Requiere validacion humana en aplicaciones de seguridad.
- Sesgos: no se documenta la composicion del dataset de entrenamiento (procedencia, balance de clases, condiciones de captura), por lo que no se puede evaluar el sesgo hacia tipos concretos de sonar, fondos o regiones geograficas.
- Idioma: los metadatos declaran soporte unicamente de ingles; no aplica traduccion ni procesamiento de lenguaje.
- Licencia: Apache 2.0 permite uso comercial y modificacion con atribucion y conservacion del aviso de licencia. La arquitectura subyacente YOLOv8 pertenece a Ultralytics y su uso puede quedar sujeto a las condiciones de licencia de ese proyecto, que conviene revisar de forma independiente.
- Estado del repositorio: 0 descargas, 0 likes y un tamano declarado de 0,0 GB. No ha sido posible verificar la presencia efectiva del archivo `sonar_detector.onnx` en el repositorio con la informacion proporcionada, por lo que se recomienda comprobar su disponibilidad antes de integrarlo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Narayan-nkj/sagar-sonar-detector
- Repositorio de Ultralytics (YOLOv8, framework de inferencia recomendado por el autor): no incluido en la informacion proporcionada
- Paper o publicacion tecnica del modelo: no disponible
- Demo o espacio asociado: no disponible
- Repositorio del proyecto NetraSonar: no disponible
