# LucasTakanori/orosense_tongue_surface

## Resumen

OroSense Tongue Surface Segmentation es un modelo de segmentacion de imagenes desarrollado por LucasTakanori (usuario de HuggingFace) para delimitar la superficie lingual visible en grabaciones capturadas con el sistema OroSense. Se trata de un YOLO11n con cabeza de segmentacion (variante nano de la familia YOLO11 de Ultralytics), convertido a Core ML en precision FP16 para su integracion en iPhone. El repositorio contiene exclusivamente el paquete compilado `best.mlpackage`, no los pesos originales en formato PyTorch ni safetensors.

El modelo resuelve una tarea acotada: generar una mascara binaria de la superficie amplia de la lengua a partir de fotogramas o imagenes de la cavidad oral, con el objetivo de preprocesar y normalizar capturas antes de analisis posteriores. La model card reporta un Dice medio de 0,9443 y un IoU medio de 0,8948 sobre 45 imagenes de test con particion a nivel de participante, ademas de una tasa de deteccion positiva del 100 % (45/45) y cero falsos positivos sobre 12 imagenes negativas (sin lengua) a un umbral de confianza de 0,25.

Su relevancia es limitada y muy especifica: no es un modelo de proposito general ni un modelo de lenguaje, sino una herramienta de vision por computador orientada a un pipeline de investigacion concreto. El autor lo clasifica explicitamente como modelo de investigacion entrenado sobre una cohorte pequena de participantes, no como dispositivo medico, y advierte de que su rendimiento debe validarse de forma prospectiva en condiciones de captura adicionales. El repositorio registra 0 descargas y 0 likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO11n con cabeza de segmentacion (red convolucional de deteccion/segmentacion de la familia YOLO11 de Ultralytics); exportada a Core ML |
| Parametros totales | no disponible (el autor no publica el recuento de parametros) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de vision; no procesa texto) |
| Tipos de cuantizacion | FP16 (unico formato publicado, dentro del paquete Core ML); no se ofrecen INT8, INT4 ni GGUF |
| Idiomas soportados | no aplica / no disponible (modelo de segmentacion de imagenes; no tiene capacidades linguisticas) |
| Licencia | other (etiqueta generica de HuggingFace; no se detallan los terminos concretos en la model card) |
| Formato de pesos | Core ML (`best.mlpackage`, paquete compilado; requiere preservar la estructura interna de directorios) |

## Arquitectura y entrenamiento

La arquitectura es YOLO11n en su variante de segmentacion de instancias, una red convolucional de una sola etapa con cabeza de prediccion de mascaras, elegida por su relacion entre coste computacional y calidad de segmentacion en dispositivos moviles. El autor no publica en la model card el numero de tokens de entrenamiento (no aplica), el numero de imagenes de entrenamiento, la composicion exacta del dataset, la resolucion de entrada, ni si se aplicaron tecnicas de aumento de datos o ajuste fino posterior. Tampoco se documenta el proceso de conversion a Core ML mas alla de indicar que el paquete publicado esta en FP16 y que se empleo `coremltools` como libreria.

El unico detalle metodologico relevante que si se documenta es la estrategia de particion de datos: se utilizo una division a nivel de participante, dejando fuera del entrenamiento a los participantes identificados como Jake y Yuliya, lo que reduce el riesgo de fuga de informacion entre entrenamiento y test. Dos imagenes negativas dificiles (sin lengua visible) se movieron deliberadamente al conjunto de entrenamiento. La evaluacion se realizo sobre 45 imagenes de test y 12 imagenes negativas retenidas. No se especifica si hubo una fase de validacion separada, ni el tamano del conjunto de entrenamiento.

## Capacidades

- Segmentacion semantica de la superficie lingual visible: genera una mascara de la region amplia de la lengua en imagenes o fotogramas de grabaciones OroSense.
- Deteccion de presencia o ausencia de lengua: la evaluacion reporta una tasa de deteccion positiva de 1,0000 (45/45) sobre imagenes con lengua y 0 falsos positivos sobre 12 imagenes negativas al umbral de confianza 0,25.
- Inferencia en dispositivo (on-device): al estar empaquetado en Core ML FP16, esta disenado para ejecutarse localmente en hardware Apple, sin necesidad de enviar imagenes a un servidor.
- Entrada de imagen unica: procesa una imagen por inferencia; no se documenta soporte para video por lotes, procesamiento multi-frame con memoria temporal ni tracking.
- Tool calling / function calling: no soportado (no es un modelo de lenguaje).
- Capacidades de agente o razonamiento multi-paso: no soportadas.
- Capacidades multilingues: no aplica.
- Capacidades especiales (modo thinking, vision general, audio, OCR): no disponibles; el modelo esta especializado en una unica clase anatomica dentro de un dominio de captura concreto.

## Casos de uso

- Preprocesado en el pipeline OroSense: recortar y normalizar la region de la lengua en cada captura antes de alimentar etapas posteriores de analisis, evitando que el fondo o los tejidos circundantes contaminen las medidas.
- Control de calidad de captura en la app de iPhone: usar la mascara y la deteccion positiva/negativa para avisar al usuario de que la lengua no esta suficientemente visible y pedir una nueva toma en el momento de la grabacion.
- Segmentacion por lotes en estudios retrospectivos: procesar de forma automatica un archivo de imagenes ya recogidas para generar mascaras y calcular areas o indices morfologicos de forma reproducible, sin anotacion manual.
- Filtrado de conjuntos de datos: descartar automaticamente imagenes sin lengua (el modelo reporta 0 falsos positivos sobre las 12 negativas de test) antes de construir un dataset de investigacion.
- Generacion de mascaras de referencia para anotacion asistida: producir una mascara inicial que un experto corrija, reduciendo el tiempo de etiquetado frente a la anotacion desde cero.
- Analisis de color o textura restringido a la region lingual: aplicar metricas de coloracion o textura unicamente sobre los pixeles enmascarados, evitando la influencia de labios, dientes o fondo.
- Prototipado de investigacion en salud oral: validar hipotesis sobre morfologia lingual en cohortes pequenas, siempre con revision humana y sin uso diagnostico.

## Benchmarks y rendimiento

Metricas publicadas por el autor en la model card (evaluacion con particion a nivel de participante):

| Metrica | Valor |
|---|---|
| Imagenes de test | 45 |
| Dice medio | 0,9443 |
| IoU medio | 0,8948 |
| Tasa de deteccion positiva | 1,0000 (45/45) |
| Imagenes negativas retenidas (sin lengua) | 12 |
| Falsos positivos a confianza 0,25 | 0 |
| Participantes excluidos del entrenamiento | Jake y Yuliya |

No se han publicado resultados de benchmarks comparativos con otros modelos en la informacion disponible, ni metricas estandar de segmentacion de lengua como referencia cruzada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Al ser la variante nano de YOLO11 exportada en FP16, el paquete esta pensado para ejecucion en dispositivo movil, pero el autor no publica cifras de memoria.
- GPU recomendadas: no disponibles. El destino declarado es iPhone con Core ML, lo que implica ejecucion sobre Neural Engine y/o GPU integrada de Apple Silicon.
- Compatibilidad con GPU de consumo: el modelo no se distribuye en formatos ONNX, GGUF ni safetensors, por lo que no hay ruta directa documentada hacia GPU NVIDIA de consumo (RTX 4090, etc.) sin conversion previa desde el paquete Core ML.
- Opciones de despliegue: Core ML a traves de Xcode y la libreria `coremltools`; integracion nativa en apps iOS. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican a vision en Core ML).
- Latencia y throughput: no disponibles.
- Nota de empaquetado: el repositorio declara un tamano de 0,0 GB y solo contiene `best.mlpackage`, cuya estructura de directorios interna debe conservarse integra durante la descarga e integracion.

## Comparativa con modelos similares

No se dispone de metricas publicadas de modelos comparables en la informacion proporcionada, por lo que la comparacion es unicamente cualitativa:

| Modelo | Tarea | Arquitectura | Licencia | Metricas en este dominio |
|---|---|---|---|---|
| OroSense Tongue Surface (este modelo) | Segmentacion de superficie lingual | YOLO11n-seg, Core ML FP16 | other | Dice 0,9443 / IoU 0,8948 sobre 45 imagenes |
| Ultralytics YOLO11n-seg | Segmentacion de instancias generica | YOLO11n-seg | AGPL-3.0 (uso comercial bajo licencia Ultralytics Enterprise) | no disponible para segmentacion de lengua |
| Ultralytics YOLOv8n-seg | Segmentacion de instancias generica | YOLOv8n-seg | AGPL-3.0 (uso comercial bajo licencia Ultralytics Enterprise) | no disponible para segmentacion de lengua |
| SAM 2 (Segment Anything Model 2) | Segmentacion promptable generalista | Transformer de vision con memoria | Apache 2.0 (segun su publicacion original) | no disponible para segmentacion de lengua |

Diferencias clave frente a las alternativas: este modelo esta especializado en una unica clase anatomica y ajustado a un dominio de captura concreto (grabaciones OroSense), por lo que no es reutilizable directamente en otros dominios; ademas, se distribuye unicamente como paquete Core ML, lo que limita su uso fuera del ecosistema Apple. Las variantes genericas de YOLO y SAM 2 ofrecen mayor cobertura de clases y una licencia mas clara, pero no estan ajustadas a esta tarea y requeririan anotacion y entrenamiento propios.

## Limitaciones y advertencias

- Aviso explicito del autor: no es un dispositivo medico y no debe utilizarse para diagnostico. Cualquier uso clinico requiere validacion regulatoria independiente.
- Cohorte de entrenamiento pequena y poco representativa: participacion reducida y sin informacion sobre diversidad de tonos de piel, iluminacion, camara o condiciones de captura.
- Evaluacion limitada: solo 45 imagenes de test y 12 negativas retenidas; el Dice de 0,9443 se obtuvo sobre una muestra muy pequena, con precision estadistica baja y sin intervalos de confianza publicados.
- Generalizacion no demostrada: el autor recomienda validacion prospectiva en participantes y condiciones de captura adicionales, lo que implica que el rendimiento fuera del dominio original es desconocido.
- Riesgo de alucinacion (aplicado a vision): posibilidad de generar mascaras espurias o de bordes incorrectos en imagenes fuera de distribucion; la evaluacion de falsos positivos se limita a 12 imagenes negativas a un umbral concreto (0,25), no a un barrido completo de umbrales.
- Sesgo desconocido: no se documenta analisis de sesgo por sexo, edad, etnia ni condicion clinica de los participantes.
- Restricciones de licencia: la licencia se declara como "other" sin texto de terminos publicado en la model card, lo que impide determinar con claridad si se permite el uso comercial. Debe contactarse con el autor antes de cualquier explotacion comercial.
- Dependencia de formato: no se distribuyen pesos en PyTorch, safetensors, ONNX ni GGUF, lo que dificulta auditoria, reentrenamiento o despliegue fuera de Core ML.
- Limitacion de idioma y contexto: no aplica a texto; el modelo no procesa lenguaje natural ni mantiene contexto conversacional.
- Sin mantenimiento visible: 0 descargas, 0 likes y fechas de creacion y actualizacion identicas (2026-10-04), sin historial de versiones ni issues resueltos.

## Enlaces

- Pagina del modelo en HuggingFace: https://huggingface.co/LucasTakanori/orosense_tongue_surface
- Paquete Core ML incluido en el repositorio: `best.mlpackage` (dentro del repositorio de HuggingFace indicado arriba)
- La busqueda web realizada no devolvio enlaces relevantes al modelo, al proyecto OroSense ni a la herramienta de conversion; los resultados obtenidos correspondian a paginas genericas de TikTok y no guardan relacion con el contenido de esta ficha.
