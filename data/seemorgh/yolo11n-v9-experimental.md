# Seemorgh/yolo11n-v9-experimental

## Resumen

YOLO11n v9 experimental es un checkpoint de deteccion de objetos basado en la arquitectura YOLO11n de Ultralytics, desarrollado por el autor independiente Seemorgh. Se trata de un ajuste fino (fine-tune) del modelo `Seemorgh/yolo11n-v8-drone-or-bird`, cuyo objetivo era mejorar la deteccion de drones en camaras nuevas incorporando metraje del conjunto Drone-vs-Bird. El modelo se publica como registro de un experimento fallido: no supero la condicion de exito fijada antes de su evaluacion, y el propio autor recomienda usar la version v8 en su lugar.

La relevancia de esta ficha es fundamentalmente metodologica. El autor documenta de forma transparente el protocolo de evaluacion (split retenido fijado de antemano, condicion de aprobado predefinida, scripts de reproduccion incluidos) y los resultados negativos, algo poco habitual en el ecosistema de Hugging Face. El modelo es un detector de una sola etapa, de tamano "nano" (variante n de YOLO11), orientado a la deteccion binaria dron/ave en imagenes aereas.

No se dispone de informacion sobre el numero exacto de parametros, la longitud de contexto (no aplica a un detector) ni los idiomas soportados (no aplica). El repositorio ocupa 0,1 GB y contiene pesos en formato Ultralytics (`.pt`).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO11n (detector de objetos de una etapa, familia Ultralytics) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, no de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica |
| Licencia | AGPL-3.0 |
| Formato de pesos | `.pt` (Ultralytics/PyTorch); `best.pt` con SHA-256 `32d23e9a241e26d542dfc07a6c45403edc8a3eb5c6963c9e83b3b72e183cede3` |

## Arquitectura y entrenamiento

El modelo es un YOLO11n, la variante mas pequena de la familia YOLO11 de Ultralytics, especializada en deteccion de objetos en imagen. Se inicializa desde el checkpoint `best.pt` de v8 (SHA-256 `0b68317a124543d1496c5047b96b6f1449c479b5265d0f1f4ea27ea913695a2e`) y se ajusta con un conjunto de entrenamiento de 52.686 elementos: los 34.096 elementos de v8 sin cambios, mas 18.590 teselas que contienen 16.842 drones extraidos de cada decimo fotograma de 56 de los 77 videos de entrenamiento de Drone-vs-Bird. Las aves de esos videos no estan etiquetadas por diseno, por lo que aparecen como fondo.

La evaluacion se realizo sobre un conjunto retenido de 21 videos, fijado por grupo de grabacion antes de empezar el trabajo de v9 (`reproduce/rules/dvb-split.json`): todos los videos de Parrot Disco (incluidos los de senuelos de aves) y el conjunto `gopro_00x`. La validacion uso las teselas de validacion LRDD de v8. Los hiperparametros fueron los de v8 sin cambios; el entrenamiento se detuvo en la epoca 9, con el mejor checkpoint en la epoca 4 (mAP50-95 de validacion 0,284). No se documentan innovaciones arquitectonicas adicionales (decodificacion especulativa, atencion lineal, etc.), al tratarse de un fine-tune estandar de YOLO11n.

## Capacidades

- Deteccion de objetos en imagenes, con salida de cajas delimitadoras y clases (dron frente a ave).
- Deteccion binaria orientada a escenas aereas: drones multirrotor y de ala fija (Parrot Disco), asi como aves.
- Inferencia sobre fotogramas de video mediante tracker externo (el autor evalua con y sin tracker).
- Integracion con la libreria `ultralytics` para carga, entrenamiento e inferencia.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingues (no es un modelo de lenguaje).
- No dispone de modo "thinking", vision multimodal generativa ni audio.

## Casos de uso

- **Vigilancia de espacio aereo con drones:** el modelo puede procesar fotogramas de camaras fijas o moviles para detectar la presencia de drones, aunque su tasa de acierto en el conjunto retenido es baja (9,7 % con tracker) y no se recomienda para produccion frente a v8.
- **Filtrado de falsos positivos ave/dron:** al estar entrenado para distinguir aves de drones, puede usarse como segunda etapa de verificacion en pipelines que ya detectan objetos voladores, aunque en el test LRDD no detecto ninguna ave como dron (0 falsos positivos de este tipo).
- **Prototipado academico de deteccion aerea:** sirve como referencia reproducible para experimentos de deteccion de drones, ya que incluye scripts de entrenamiento, scoring y el split retenido en `reproduce/`.
- **Evaluacion de estrategias de aumento de datos:** util para estudiar el efecto de anadir metraje de Drone-vs-Bird a un detector preentrenado, dado que el autor documenta el resultado negativo y las posibles causas (desajuste de dominio entre ala fija y multirrotor).
- **Analisis de robustez ante camaras nuevas:** el conjunto retenido incluye camaras GoPro y Parrot Disco, por lo que el modelo puede emplearse en estudios de generalizacion a dominios de captura distintos del entrenamiento.
- **Linea base en comparativas de detectores ligeros:** al ser un YOLO11n con pesos publicos y metricas documentadas, puede servir como baseline en comparaciones de detectores de drones de bajo coste computacional.

## Benchmarks y rendimiento

Resultados publicados por el autor en la model card. Ambos modelos se ejecutaron con el mismo tracker, a confianza 0,60, sobre los mismos fotogramas.

| Medida | v8 | v9 | Condicion |
|---|---|---|---|
| Videos retenidos: drones detectados (3.065 drones) | 10,9 % | 9,7 % | mas que v8: **fallido** |
| Videos retenidos: fotogramas vacios sin deteccion (349 fotogramas) | 99,7 % | 98,0 % | sin caida: **fallido** |
| Test LRDD, cada 2.a imagen: drones detectados | 42,0 % | 39,5 % | dentro de 3 puntos: superado |
| Test LRDD, cada 2.a imagen: aves detectadas como dron | 0 | 0 | no mas que v8: superado |

Sin tracker:

| Medida | v8 | v9 |
|---|---|---|
| Drones detectados en videos retenidos | 8,6 % | 10,5 % |
| Drones con alguna caja colocada | 71 % | 59 % |

mAP50-95 de validacion en el mejor checkpoint (epoca 4): 0,284.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada; por el tamano del repositorio (0,1 GB) y la variante "n" de YOLO11, es un modelo muy ligero, apto para GPU de consumo.
- GPU recomendadas: no disponible de forma explicita; por la variante nano, cabe en GPU de consumo (gama RTX 30/40) y en GPU de datacenter (A100, H100) sin problema.
- Cabe en GPU de consumo: si, por el tamano del checkpoint y la variante nano; no se especifican modelos concretos.
- Opciones de despliegue: libreria `ultralytics` (entrenamiento e inferencia); no se documentan otras opciones (vLLM, llama.cpp, Ollama, TGI no aplican a un detector de objetos).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| YOLO11n v9 experimental (este) | no disponible (variante n) | no aplica | 9,7 % drones con tracker en retenido; 39,5 % en LRDD test | AGPL-3.0 | Hugging Face |
| Seemorgh/yolo11n-v8-drone-or-bird | no disponible (variante n) | no aplica | 10,9 % drones con tracker en retenido; 42,0 % en LRDD test | no disponible en la informacion | Hugging Face |
| Otros detectores de drones | no disponible | no aplica | no disponible | no disponible | no disponible |

El autor recomienda explicitamente v8 frente a v9. No se dispone de datos de otros detectores comparables en la informacion proporcionada.

## Limitaciones y advertencias

- **Modelo fallido:** no supero la condicion de exito fijada antes de la evaluacion; el autor recomienda usar v8 en su lugar.
- **Desajuste de dominio:** el conjunto retenido es de ala fija (Parrot Disco) y una camara GoPro, mientras que las teselas nuevas de v9 son mayoritariamente de drones multirrotor; el autor senala esto como causa probable, aunque no lo ha comprobado.
- **Baja tasa de deteccion:** solo detecta el 9,7 % de los drones del conjunto retenido con tracker (10,5 % sin tracker), y coloca caja en el 59 % de ellos (frente al 71 % de v8).
- **Mas falsos positivos en fotogramas vacios:** la tasa de fotogramas vacios sin deteccion cae del 99,7 % al 98,0 %.
- **Riesgo de alucinacion:** no aplica en el sentido de modelos de lenguaje, pero si en forma de falsos positivos en escenas sin drones.
- **Licencia AGPL-3.0:** impuesta por Ultralytics; restringe el uso comercial en determinados escenarios de distribucion de software. Revisar los terminos antes de uso en produccion.
- **Datos de terceros:** entrenado parcialmente con el conjunto Drone-vs-Bird bajo su acuerdo de uso; el comite WOSDETC autorizo la publicacion de los pesos citando el paper y sin incluir metraje. No se incluyen fotogramas en el repositorio.
- **Sin datos de idiomas ni contexto:** no aplica por ser un detector de vision.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Seemorgh/yolo11n-v9-experimental
- Modelo base recomendado (v8): https://huggingface.co/Seemorgh/yolo11n-v8-drone-or-bird
- Paper de Drone-vs-Bird (ICASSP 2023): https://doi.org/10.1109/OJSP.2024.3379073
- Scripts de reproduccion: carpeta `reproduce/` del repositorio (incluye `reproduce/rules/dvb-split.json` y `reproduce/rules/` con el split y la condicion de aprobado)
