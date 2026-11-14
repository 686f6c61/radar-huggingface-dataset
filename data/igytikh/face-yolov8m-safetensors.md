# igytikh/face-yolov8m-safetensors

## Resumen

`igytikh/face-yolov8m-safetensors` es una conversion de formato del detector de caras `face_yolov8m.pt` publicado originalmente por Bingsu en el repositorio `Bingsu/adetailer`. No se trata de un modelo nuevo ni de un reentrenamiento: los pesos son identicos a los del modelo base y lo unico que cambia es el contenedor, que pasa de `.pt` (pickle de PyTorch) a `.safetensors` para que lo pueda leer `stable-diffusion.cpp` en su pasada ADetailer. El autor de la conversion es el usuario de Hugging Face `igytikh`.

El modelo resuelve un problema muy concreto: la deteccion de caras en imagenes generadas o renderizadas para que un pipeline de difusion pueda redibujarlas a mayor resolucion y recomponerlas sobre el fotograma original. Es un detector YOLOv8m de una sola clase (`face`), con entrada de 640x640, pensado para caras 2D y realistas. Su utilidad practica esta ligada al ecosistema de `stable-diffusion.cpp`, ya que este runtime solo acepta pesos YOLOv8 de deteccion en formato safetensors para la fase ADetailer.

La relevancia del repositorio es, por tanto, instrumental: permite usar el detector de Bingsu en herramientas que no cargan ficheros `.pt` por motivos de seguridad (un `.pt` es un pickle ejecutable) o de compatibilidad. El peso del fichero es de 49,3 MiB y el repositorio completo ocupa unos 0,1 GB. La licencia es AGPL-3.0, mas restrictiva que la Apache-2.0 que declara la model card original, por la dependencia de los pesos respecto al codigo de Ultralytics.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLOv8m (Ultralytics), cabeza de deteccion, una clase |
| Parametros totales | no disponible (pesos de 49,3 MiB en safetensors; 166 tensores: 83 float32 y 83 float16) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, entrada de imagen 640x640) |
| Tipos de cuantizacion | no disponible; el fichero distribuido combina float32 y float16 |
| Idiomas soportados | no aplica (modelo de deteccion de objetos, sin procesamiento de lenguaje) |
| Licencia | AGPL-3.0 |
| Formato de pesos | safetensors (`face_yolov8m.safetensors`, 51 729 692 bytes) |

Metadatos embebidos en el fichero:

| Clave | Valor |
|---|---|
| `yolov8.variant` | `detect` |
| `yolov8.num_classes` | `1` |
| `yolov8.names` | `{"0": "face"}` |
| `yolov8.reg_max` | `16` |
| `yolov8.input_size` | `640` |
| `format` | `pt` |

## Arquitectura y entrenamiento

La arquitectura es la de YOLOv8 en su variante `m` (medium) de Ultralytics, una red de deteccion de objetos de una sola etapa con backbone convolucional, cuello de agregacion de caracteristicas y cabeza de prediccion con `reg_max = 16`. La salida es una unica clase, `face`, con cajas delimitadoras; no hay segmentacion ni keypoints. La entrada canonica es de 640x640 pixeles.

El autor de esta conversion no ha entrenado ni modificado los pesos. Segun la model card, los pesos originales `face_yolov8m.pt` provienen de `Bingsu/adetailer` y fueron entrenados con la libreria Ultralytics. Los datos de entrenamiento listados en la model card de origen (no verificados por el autor de la conversion) son Anime Face CreateML, xml2txt, AN (Roboflow) y WIDER FACE. La model card original reporta mAP50 de 0,737 y mAP50-95 de 0,424 para el detector.

La innovacion tecnica del repositorio es puramente de empaquetado: el script `scripts/convert_yolov8_to_safetensors.py` del repositorio de `stable-diffusion.cpp` pliega las capas BatchNorm dentro de las convoluciones y escribe los tensores en safetensors con los metadatos YOLOv8. El resultado es un fichero que puede cargarse sin ejecutar codigo arbitrario y que `stable-diffusion.cpp` reconoce como modelo ADetailer.

## Capacidades

- Deteccion de caras en imagenes: devuelve cajas delimitadoras de la clase unica `face`.
- Funciona sobre caras 2D y realistas, segun la descripcion del modelo base.
- Integracion con la pasada ADetailer de `stable-diffusion.cpp` mediante `--ad-model face_yolov8m.safetensors`.
- Parametros de inferencia ajustables en el servidor: `confidence`, `denoising_strength`, `inpaint_width` e `inpaint_height`.
- Formato compatible con runtimes que rechazan ficheros `.pt` por seguridad (safetensors no es un pickle).
- No soporta tool calling, agentes, razonamiento multi-paso ni procesamiento de lenguaje.
- No soporta vision general mas alla de la deteccion de caras; no hay clasificacion, segmentacion ni estimacion de pose.
- Solo acepta pesos YOLOv8 de deteccion: no admite YOLOv9, YOLOv11 ni variantes de segmentacion.

## Casos de uso

- Postprocesado de caras en generacion de imagenes con `stable-diffusion.cpp`: se lanza `sd-server` con `--ad-model face_yolov8m.safetensors` y el pipeline detecta cada cara del fotograma generado, la redibuja a mayor resolucion (por ejemplo 768x768 con `inpaint_width` e `inpaint_height`) y la recompone, mejorando el detalle facial sin rehacer la imagen completa.
- Videojuego de novela visual offline: el juego `dreamer` descarga este fichero junto con los modelos de imagen y ejecuta la pasada ADetailer en cada fotograma en el equipo del jugador, sin enviar datos a ningun servidor. El detector es adecuado porque es pequeno (49,3 MiB) y rapido en CPU/GPU de consumo.
- Pipelines de generacion de retratos por lotes: integrado en un script que procese cientos de imagenes, el detector localiza las caras y permite aplicar un refinado selectivo solo en esas regiones, ahorrando computo frente a regenerar la imagen entera.
- Herramienta de retoque automatico para ilustracion 2D: al estar entrenado con Anime Face CreateML entre otras fuentes, detecta caras estilizadas de personajes y permite redibujarlas con un modelo de difusion especializado en anime.
- Preprocesado para anonimizacion o censura de caras: las cajas devueltas por el detector sirven para aplicar desenfoque o pixelado sobre rostros en imagenes antes de publicarlas, con un umbral de confianza configurable (`confidence=0.3` en el ejemplo de la model card).
- Filtrado y curacion de datasets de imagenes: dado un directorio de imagenes generadas, el detector permite descartar o marcar aquellas en las que no se detecta ninguna cara o en las que la confianza es baja, como control de calidad previo a un entrenamiento.
- Despliegue en entornos con requisitos de seguridad estrictos: al ser safetensors y no pickle, puede cargarse en infraestructuras que prohiben la ejecucion de `.pt` de terceros, manteniendo la funcionalidad del detector original de Bingsu.

## Benchmarks y rendimiento

Los unicos datos publicados en la informacion disponible son los del modelo base, reportados en la model card de `Bingsu/adetailer`:

| Metrica | Valor |
|---|---|
| mAP50 | 0,737 |
| mAP50-95 | 0,424 |

No se han publicado resultados de benchmarks propios para esta conversion en la informacion disponible. Al no haberse modificado los pesos, el rendimiento en deteccion deberia ser equivalente al del modelo original, pero no se aportan mediciones de latencia ni throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el fichero pesa 49,3 MiB, por lo que la huella en memoria es muy reducida y cabe holgadamente en cualquier GPU de consumo actual.
- GPU recomendadas: cualquier GPU con al menos unos pocos GB de VRAM; el modelo se usa habitualmente junto al generador de difusion, que es el que marca los requisitos reales de VRAM.
- Cabe en GPU de consumo: si, incluidas GTX 1060, RTX 2060, RTX 3060, RTX 4060 y superiores, asi como en CPU.
- Opciones de despliegue: `stable-diffusion.cpp` (`sd-server` con `--ad-model`), y en general cualquier runtime que cargue safetensors YOLOv8 con los metadatos indicados. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que estan orientados a modelos de lenguaje.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | Clases | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| `igytikh/face-yolov8m-safetensors` | no disponible (49,3 MiB) | 640x640 | 1 (`face`) | AGPL-3.0 | safetensors | Conversion del siguiente, para `stable-diffusion.cpp` |
| `Bingsu/adetailer` (`face_yolov8m.pt`) | no disponible | 640x640 | 1 (`face`) | Apache-2.0 segun la model card original | `.pt` (pickle) | Modelo original; mAP50 0,737, mAP50-95 0,424 |
| `Bingsu/adetailer` (`face_yolov8n.pt`) | no disponible | 640x640 | 1 (`face`) | Apache-2.0 segun la model card original | `.pt` | Variante nano del mismo detector, mas ligera; no incluida en este repositorio |

No se dispone de datos de benchmarks de terceros ni de comparativas con otros detectores de caras (por ejemplo RetinaFace o MTCNN) en la informacion proporcionada.

## Limitaciones y advertencias

- Es una conversion de formato, no un modelo nuevo: cualquier limitacion del detector original de Bingsu se hereda sin cambios.
- Solo detecta caras; no reconoce identidades, no segmenta y no estima pose ni puntos faciales.
- Solo funciona con pesos YOLOv8 de deteccion; `stable-diffusion.cpp` rechaza YOLOv9, YOLOv11 y variantes de segmentacion.
- Los datos de entrenamiento incluyen WIDER FACE, que tiene su propia licencia de datos no comercial; conviene revisar la model card original antes de un uso comercial.
- La licencia aplicada es AGPL-3.0, mas estricta que la Apache-2.0 declarada por el autor original, por la dependencia de los pesos respecto al codigo de Ultralytics. El propio autor de la conversion indica que no es asesoramiento legal.
- Riesgo de alucinacion: no aplica en el sentido de generacion de texto, pero si puede producir falsos positivos o cajas imprecisas en imagenes con caras muy pequenas, ocluidas o estilizadas de forma atipica.
- Sesgos conocidos: no documentados en la informacion disponible; al entrenarse con Anime Face CreateML y WIDER FACE, la distribucion de caras puede estar sesgada hacia esos dominios.
- Sin datos de latencia, throughput ni comportamiento en produccion publicados para esta conversion.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; no hay validacion de la comunidad.
- El autor advierte de que solo deben convertirse ficheros `.pt` de confianza, ya que un `.pt` es un pickle de Python ejecutable.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/igytikh/face-yolov8m-safetensors
- Modelo base (Bingsu/adetailer): https://huggingface.co/Bingsu/adetailer
- Repositorio de stable-diffusion.cpp: https://github.com/leejet/stable-diffusion.cpp
- Repositorio de Ultralytics YOLOv8: https://github.com/ultralytics/ultralytics
- Script de conversion (en stable-diffusion.cpp): `scripts/convert_yolov8_to_safetensors.py` dentro del repositorio anterior
- Dataset WIDER FACE: no disponible en la informacion proporcionada
- Paper de YOLOv8: no disponible en la informacion proporcionada
