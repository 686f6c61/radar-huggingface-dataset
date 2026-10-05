# LucasTakanori/orosense_tongue_volume

## Resumen

OroSense Tongue Volume-Scan Segmentation es un modelo de segmentación de imagen publicado por el usuario LucasTakanori en HuggingFace. Se trata de una red YOLO11n de segmentación (variante nano de la familia YOLO11-seg) entrenada para delimitar el tejido lingual visible en cada fotograma RGB de un escaneo volumétrico capturado con la aplicación OroSense en iPhone. El resultado es una máscara por fotograma; el cálculo del volumen físico en 3D requiere además datos de profundidad alineados y calibración de cámara en la propia aplicación, algo que el modelo no resuelve por sí solo.

El modelo se distribuye en formato CoreML (`best.mlpackage`), lo que indica que está pensado para inferencia en el dispositivo (on-device) sobre el Neural Engine de Apple, no para despliegue en servidores con GPU. Es un modelo de investigación, con un conjunto de evaluación pequeño (88 imágenes de test) y una separación por participante: Jake y Yuliya quedaron fuera del entrenamiento, de modo que la evaluación mide generalización a personas no vistas.

Su relevancia es acotada: cero descargas y cero likes en el momento de la consulta, licencia "other" y ausencia de datos sobre idiomas (no aplica, es visión). Resulta interesante como ejemplo de pipeline médico móvil de extremo a extremo (YOLO-seg → CoreML → iPhone) más que como modelo de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO11n de segmentacion (variante nano de la familia YOLO11-seg), red convolucional con cabeza de segmentacion de instancias |
| Parametros totales | no disponible (la model card no lo indica) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de vision; procesa un fotograma RGB por inferencia) |
| Tipos de cuantizacion | no disponible (formato CoreML; la model card no especifica FP16, INT8 ni otras precisiones) |
| Idiomas soportados | no aplica (segmentacion de imagen; no procesa texto) |
| Licencia | other |
| Formato de pesos | CoreML (`best.mlpackage`, paquete con estructura de directorios interna que debe preservarse) |

## Arquitectura y entrenamiento

La arquitectura es una YOLO11n-seg, es decir, la variante nano de la familia YOLO11 orientada a segmentación de instancias: un backbone convolucional ligero con cabezas de detección y predicción de máscaras por instancia. El modelo se exportó a CoreML mediante `coremltools`, lo que permite ejecutarlo en el Neural Engine de los chips Apple. La model card no detalla el número de tokens de entrenamiento (concepto no aplicable), la composición exacta del dataset ni si se aplicaron fases de ajuste fino con preferencias humanas; tampoco indica resolución de entrada, número de épocas ni estrategia de aumento de datos.

La información de entrenamiento disponible se limita al protocolo de evaluación: se usó una división a nivel de participante, dejando a Jake y Yuliya fuera del entrenamiento, y se movieron tres negativos difíciles adicionales al conjunto de entrenamiento. El conjunto de test consta de 88 imágenes, 87 con lengua visible y una sin lengua nativa. El modelo segmenta fotogramas RGB individuales; la conversión a volumen físico 3D queda fuera del alcance del modelo y depende de profundidad alineada y calibración de cámara en la aplicación.

## Capacidades

- Segmentación de tejido lingual visible en fotogramas RGB individuales de un escaneo volumétrico OroSense.
- Generación de máscaras de segmentación por instancia (pipeline `image-segmentation`), no solo cajas delimitadoras.
- Detección de presencia o ausencia de lengua en el fotograma, con tasa de detección positiva de 0,9885 y cero falsos positivos sobre negativos a confianza 0,25 en el conjunto de test.
- Inferencia on-device en dispositivos Apple mediante CoreML y el Neural Engine.
- No soporta tool calling, function calling ni razonamiento multi-paso: no es un modelo de lenguaje.
- No tiene capacidades multilingües ni de generación de texto.
- No calcula volumen 3D por sí mismo: requiere profundidad alineada y calibración de cámara externas.

## Casos de uso

- Captura asistida en la app OroSense: el modelo segmenta la lengua en cada fotograma del escaneo para verificar que el tejido es visible antes de avanzar en el flujo de adquisición, evitando repetir capturas inválidas.
- Preprocesado para reconstrucción volumétrica: las máscaras por fotograma sirven como entrada a un pipeline posterior que, combinado con mapas de profundidad alineados y calibración de cámara, estima el volumen físico de la lengua.
- Cribado automático de capturas: con una tasa de detección positiva de 0,9885 y cero falsos positivos a confianza 0,25 en el test, puede usarse para descartar fotogramas sin lengua antes de enviarlos a revisión humana.
- Anotación asistida de datasets: genera máscaras preliminares que un anotador corrige, reduciendo el coste de etiquetar nuevos escaneos en estudios de investigación.
- Investigación en logopedia y odontología: permite medir de forma repetible el contorno lingual a lo largo de una secuencia de capturas para estudiar variabilidad intra e interparticipante (siempre como herramienta de investigación, nunca diagnóstica).
- Control de calidad de datasets médicos: al tener dificultades conocidas con ángulos laterales, puede usarse para identificar y aislar los fotogramas más difíciles y priorizar su revisión manual.
- Prototipado de pipelines de visión médica móvil: sirve como referencia de cómo convertir un YOLO-seg a CoreML y desplegarlo en iPhone sin infraestructura de servidor.
- Docencia y experimentación con segmentación de instancias en el ámbito sanitario: modelo pequeño, licencia permisiva en la práctica para investigación y evaluación reproducible en hardware de consumo.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Imagenes de test | 88 (87 fotogramas positivos y 1 negativo nativo sin lengua) |
| Dice medio | 0,8013 |
| IoU medio | 0,6842 |
| Tasa de deteccion positiva | 0,9885 (86/87) |
| Imagenes negativas reservadas (sin lengua) | 11 (tres negativos dificiles adicionales se movieron a entrenamiento) |
| Falsos positivos a confianza 0,25 | 0 |

No se han publicado resultados de benchmarks en la informacion disponible (no hay MMLU, HumanEval, GSM8K ni comparaciones con otros modelos de segmentacion en la model card).

## Requisitos de hardware

- Inferencia prevista on-device: dispositivos Apple con Neural Engine (iPhone y, por extensión, chips de la serie M en macOS), ya que el modelo se distribuye como paquete CoreML.
- VRAM dedicada: no aplica en el caso de uso objetivo; en Mac con GPU unificada el modelo ocupa una fracción mínima de la memoria compartida al ser una variante nano (la model card no publica cifras exactas de tamaño ni de memoria).
- GPU de servidor (A100, H100, RTX 4090): no son necesarias para este modelo; no hay datos publicados sobre su ejecución en ellas.
- Cabe en cualquier dispositivo Apple moderno con Neural Engine; no se especifican modelos mínimos soportados.
- Opciones de despliegue: CoreML de forma nativa (Core ML en iOS/macOS). No se publican pesos PyTorch ni ONNX en el repositorio, por lo que el uso en vLLM, llama.cpp, Ollama o TGI no está soportado ni documentado.
- Latencia y throughput: no disponibles en la información proporcionada.
- El repositorio ocupa 0,0 GB según HuggingFace, coherente con un modelo de muy pequeño tamaño.

## Comparativa con modelos similares

| Modelo | Tarea | Parametros | Contexto | Licencia | Datos de rendimiento |
|---|---|---|---|---|---|
| OroSense Tongue Volume-Scan Segmentation (YOLO11n-seg) | Segmentacion de lengua en escaneos volumetricos | no disponible | no aplica | other | Dice 0,8013 / IoU 0,6842 |
| YOLO11n-seg generico | Segmentacion de instancias en imagenes naturales | no disponible en la informacion proporcionada | no aplica | no disponible en la informacion proporcionada | no disponible |
| YOLOv8n-seg | Segmentacion de instancias en imagenes naturales | no disponible en la informacion proporcionada | no aplica | no disponible en la informacion proporcionada | no disponible |
| MedSAM / nnU-Net (segmentacion medica) | Segmentacion medica 2D/3D | no disponible en la informacion proporcionada | no aplica | no disponible en la informacion proporcionada | no disponible |

No se dispone de datos comparativos publicados en la informacion proporcionada; las filas alternativas se incluyen solo como referencia de categoria y no deben interpretarse como una comparacion medida.

## Limitaciones y advertencias

- Modelo de investigación entrenado con una cohorte de participantes pequeña; el propio autor lo indica en la model card.
- Los ángulos laterales y los fotogramas con poca lengua visible siguen siendo más difíciles de segmentar.
- No es un dispositivo médico y no debe utilizarse para diagnóstico.
- El rendimiento debería validarse de forma prospectiva con más participantes y condiciones de captura antes de cualquier uso real.
- El cálculo del volumen físico en 3D no lo realiza el modelo: depende de profundidad alineada y calibración de cámara en la app, de modo que errores en esos componentes afectan al resultado final aunque la máscara sea correcta.
- Licencia "other": no se detallan los términos exactos, por lo que el uso comercial requiere revisar las condiciones publicadas por el autor.
- Sin datos de sesgo demográfico: la evaluación se hizo con participantes concretos (Jake y Yuliya fuera de entrenamiento) y no se reporta diversidad de tono de piel, edad o patología.
- Riesgo de alucinación en el sentido de máscaras incorrectas o incompletas en fotogramas ambiguos; el umbral de confianza 0,25 se validó solo sobre el conjunto de test de 88 imágenes.
- No hay soporte multilingüe ni de texto porque no es un modelo de lenguaje.
- Repositorio sin descargas ni validación externa en el momento de la consulta; el tamaño del repo declarado es 0,0 GB.
- La busqueda web realizada no devolvio resultados relevantes sobre este modelo; los enlaces encontrados no guardan relacion con el y se han descartado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/LucasTakanori/orosense_tongue_volume
- Paper, blog o repositorio adicional: no disponible en la informacion proporcionada
- Demo: no disponible en la informacion proporcionada
