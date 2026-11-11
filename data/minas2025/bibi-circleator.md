# minas2025/bibi-circleator

## Resumen

bibi-circleator es un detector de objetos basado en YOLO11n (la variante nano de Ultralytics) afinado para una tarea muy concreta: localizar y delimitar el rostro de una figura publica concreta (Benjamin Netanyahu, referido como "bibi") en fotogramas de video, distinguiendolo de otras caras femeninas ("female") y masculinas ("other_male"). Lo desarrolla el usuario minas2025 y se distribuye bajo licencia AGPL-3.0. El modelo resuelve un problema de nicho: automatizar el "circling" (rodear con un circulo) de una persona concreta en ediciones de memes y en una herramienta de "radar" en pantalla en tiempo real.

El repositorio contiene unicamente pesos, no imagenes ni base de datos biometrica, y el autor insiste en que no es un sistema de identificacion. La version recomendada, `bibi-circle-v3.pt`, es un detector de tres clases con un mAP50 medio de 0,93 sobre fotogramas reservados. El modelo se ofrece tambien en formato OpenVINO para inferencia en CPU, y va acompanado de un script de escritorio (`bibi_radar.py`) publicado en GitHub.

Es relevante ahora por su enfoque pragmatico de despliegue en CPU sin GPU y por documentar explicitamente el contrato de decodificacion multi-clase (argmax por ancla), un detalle tecnico que evita un fallo de regresion observado en la version v2. No obstante, se trata de un modelo de nicho, sin benchmarks estandar publicados y con un conjunto de datos muy especifico, por lo que su utilidad general fuera de ese dominio es limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO11n (Ultralytics), detector de objetos de una etapa |
| Parametros totales | no disponible (variante nano de YOLO11; cifra exacta no publicada en la informacion) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, no de lenguaje) |
| Tipos de cuantizacion | no disponible (se ofrece build OpenVINO; precision no especificada) |
| Idiomas soportados | no disponible (no aplica; modelo de vision) |
| Licencia | AGPL-3.0 |
| Formato de pesos | `.pt` (PyTorch) y build OpenVINO |

## Arquitectura y entrenamiento

El modelo parte de Ultralytics YOLO11 en su variante nano, un detector de objetos de una etapa con backbone y cabeza de deteccion multi-escala. Se ha afinado (fine-tune) para tres clases: `bibi`, `female` y `other_male`. La clase `female` actua ademas como puerta de genero para reducir falsos positivos. La version v3 se entreno con fotogramas de fotos de Wikimedia Commons repartidas por epocas (2010-2024) y con fotogramas densos a 1 fps extraidos de material de canales israelies; los positivos incluyen caras expresivas o sonrientes y la apariencia del sujeto en su etapa joven.

El autor documenta un detalle critico de implementacion: en pipelines personalizados, las detecciones multi-clase deben decodificarse como argmax por ancla, es decir, una caja de `bibi` requiere que el canal `bibi` supere en votos a todos los demas canales, no solo que supere un umbral. Ignorar los canales rivales reproduce la regresion de la v2, que "encuadraba a desconocidos". No se especifican en la informacion el numero de tokens, la composicion exacta del dataset, ni si hubo etapas de RLHF/DPO (no aplicables a un detector de vision).

## Capacidades

- Deteccion de objetos en imagenes y fotogramas de video, con cajas delimitadoras.
- Clasificacion en tres clases: `bibi`, `female`, `other_male`.
- La clase `female` funciona como filtro de genero complementario.
- Inferencia en CPU mediante build OpenVINO (sin necesidad de GPU).
- Integracion con herramienta de "radar" en pantalla en tiempo real (`bibi_radar.py`, Windows/Linux).
- Procesamiento de video offline mediante `circle_bibi.py`.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso (no es un modelo de lenguaje).
- No dispone de capacidades multilingues ni de vision generativa; es exclusivamente un detector.

## Casos de uso

- Edicion automatica de memes: el modelo detecta y rodea con un circulo la figura objetivo en fotogramas, sustituyendo el trabajo manual de recorte y anotacion en herramientas de edicion.
- Radar en pantalla en tiempo real: mediante `bibi_radar.py`, se apunta a cualquier video y el modelo marca la posicion del sujeto en directo, util para montajes y retransmisiones.
- Filtrado de material audiovisual: localizar rapidamente los fotogramas en los que aparece la figura objetivo dentro de un archivo de video, para indexacion o seleccion de clips.
- Generacion de datasets auxiliares: usar las detecciones como preetiquetado para construir conjuntos de datos de caras en un dominio concreto.
- Prototipos de vision en CPU: al ofrecer un build OpenVINO, sirve como ejemplo de despliegue de YOLO11 nano en equipos sin GPU.
- Demostraciones y pruebas de concepto de deteccion de una clase especifica frente a distractores, aprovechando las tres clases para evaluar la precision del filtro de genero.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| mAP50 medio (v3, 3 clases, fotogramas reservados) | 0,93 |
| Estadisticas v2 (2 clases) | 0,995 / 0,993 (el autor indica que la distribucion de negativos era demasiado estrecha) |
| Precision en demo (cameo de Netanyahu) | 94-95% |
| Falso positivo citado (v1, 1 clase) | 92% sobre una canguro ("babysitter") |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, COCO, etc.) en la informacion disponible.

## Requisitos de hardware

- Inferencia en CPU: el build OpenVINO esta disenado para ejecutarse solo en CPU, sin GPU.
- VRAM estimada: no disponible; al ser YOLO11n y ejecutarse en CPU, no requiere VRAM dedicada.
- GPU recomendadas: no aplica para el flujo principal; al ser un modelo nano, cabria en cualquier GPU consumer, pero no se documentan requisitos.
- Cabe en GPU consumer: si, por el tamano reducido de la variante nano (cifra exacta no disponible).
- Opciones de despliegue: OpenVINO (build incluido), PyTorch (`.pt`), y el script `bibi_radar.py` para radar en pantalla.
- Latencia y throughput: no disponibles; el autor solo indica que funciona en tiempo real en CPU para el radar, sin cifras concretas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| bibi-circleator (v3) | nano YOLO11 (cifra no disponible) | no aplica | Deteccion 3 clases especificas | AGPL-3.0 | Hugging Face + GitHub |
| Ultralytics YOLO11n (base) | nano (cifra no disponible) | no aplica | Deteccion generica COCO | AGPL-3.0 | Ultralytics |
| Detectores faciales genericos (p. ej. RetinaFace, MTCNN) | no disponible | no aplica | Deteccion de caras generica | variable | variable |

No se dispone de datos comparativos de rendimiento entre estos modelos en la informacion proporcionada. La comparativa se limita a categoria, licencia y disponibilidad.

## Limitaciones y advertencias

- Modelo de nicho: entrenado para una unica figura y un dominio muy concreto; no generaliza a otras tareas de deteccion.
- Riesgo de falsos positivos: la v1 encuadraba a desconocidos con forma similar (92% sobre una canguro); aunque la v3 mejora, el autor advierte de la sensibilidad del decodificado multi-clase.
- La v2 tuvo una distribucion de negativos demasiado estrecha (solo videos del propio sujeto), lo que empeoro el comportamiento en directo; el autor la califica de "leccion historica, no recomendacion".
- No es un sistema de identificacion biometrica ni incluye base de datos de imagenes; su uso para identificacion de personas seria inadecuado.
- Licencia AGPL-3.0: impone obligaciones de copyleft para uso en red; revisar implicaciones antes de uso comercial.
- Sesgos: el dataset se limita a fotos de Commons y material de canales israelies, con posibles sesgos de epoca, iluminacion y composicion.
- Sin benchmarks estandar ni metricas de latencia/throughput publicadas.
- El decodificado incorrecto (ignorar canales rivales) degrada gravemente el rendimiento; es imprescindible respetar el contrato de argmax por ancla.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/minas2025/bibi-circleator
- Repositorio del radar en GitHub: https://github.com/minasfostieris-ui/bibi-radar
- Demo Space: https://huggingface.co/spaces/minas2025/bibi-radar-demo
- Video demo (mp4): https://huggingface.co/minas2025/bibi-circleator/resolve/main/demo/meet_the_bibi_sitter_circled.mp4
- Modelo base: https://huggingface.co/Ultralytics/YOLO11
