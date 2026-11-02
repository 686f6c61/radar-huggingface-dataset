# mvdelibas/turkiye-arac-yaya-yolo11s

## Resumen

El modelo `turkiye-arac-yaya-yolo11s` es un detector de objetos YOLO11s fine-tuneado por el usuario mvdelibas para identificar ocho clases de usuarios de la vía en imágenes de calle de Turquía: `otomobil` (turismo), `kamyonet_minibus` (furgoneta y minibús), `otobus` (autobús), `kamyon` (camión), `motosiklet`, `bisiklet`, `yaya` (peatón) y `surucu` (conductor sobre bicicleta o motocicleta). Está pensado para equipos de conducción autónoma (Teknofest Robotaksi), conteo y análisis de tráfico y proyectos de ciudad inteligente. La arquitectura es la de YOLO11s de Ultralytics, con pesos en formato PyTorch/Ultralytics y un tamaño de repositorio de 0,1 GB (el archivo de pesos principal ocupa 19,3 MB).

La relevancia del modelo es doble. Por un lado, adapta un detector genérico a la casuística viaria turca con una taxonomía específica que separa vehículos ligeros de pesados y distingue al peatón del conductor de dos ruedas. Por otro, su model card es inusualmente transparente sobre el proceso de etiquetado: solo el 10,6 % de las imágenes de entrenamiento (2.976) tiene supervisión con segmentación panóptica de Mapillary, Grounding DINO y un VLM, mientras que el 89,4 % restante (25.125 imágenes) usa pseudoetiquetas generadas por un modelo profesor. Esto condiciona por completo la interpretación de sus métricas.

La versión publicada es la r2, que corrige el aumento de datos de la primera versión (elimina `flipud` y `degrees`) y mejora el mAP@50 del 70,65 % al 75,58 % sobre el mismo conjunto de validación. El modelo se distribuye bajo licencia CC BY-SA 4.0 y está alojado también en la plataforma nacional turca EVREN.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | YOLO11s (Ultralytics), detector de objetos de una etapa |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de lenguaje) |
| Tipos de cuantización | no disponible (pesos PyTorch; exportación a ONNX mencionada en tags) |
| Idiomas soportados | tr (etiquetas de clase en turco) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | PyTorch / Ultralytics (`.pt`); tag `onnx` en el repositorio |

Otros datos técnicos relevantes: resolución de entrenamiento `imgsz=1024`, umbral de confianza recomendado entre 0,25 y 0,40, y ocho clases con orden fijo (0 a 7).

## Arquitectura y entrenamiento

Se trata de un detector YOLO11s, la variante small de la familia YOLO11 de Ultralytics, reentrenada sobre un dataset propio de imágenes de calle de Turquía. La model card no detalla la composición exacta de tokens ni la configuración de hiperparámetros más allá de la resolución (1024) y de la corrección de aumentos en la versión r2 (`flipud=0`, `degrees=0`), motivada porque las escenas de calle no son invariantes a la inversión vertical ni a rotaciones arbitrarias.

El aspecto técnico más relevante es la estrategia de etiquetado en dos niveles. El subconjunto v1 (2.976 imágenes, 10,6 %) se anotó con segmentación panóptica de Mapillary, Grounding DINO y un VLM alojado en EVREN. El subconjunto v2 (25.125 imágenes, 89,4 %) se etiquetó con pseudoetiquetas generadas por la intersección de un modelo profesor YOLO11s entrenado sobre v1, un YOLO11x preentrenado en COCO y las detecciones panópticas de Mapillary en imágenes de 2022 en adelante; los casos de conflicto de clase se resolvieron consultando al VLM. Además, las imágenes de entrenamiento incluyen regiones de ignoración pintadas en gris (114,114,114) sobre objetos menores de 14 px o de clases no contempladas, para que el modelo aprenda a tratarlos como fondo. No se aplicó RLHF ni DPO, al no ser un modelo generativo de lenguaje.

## Capacidades

- Detección de objetos en imágenes de calle con ocho clases viarias específicas del contexto turco.
- Distinción entre vehículo ligero (`otomobil`) y furgoneta/minibús (`kamyonet_minibus`), y entre turismo, autobús y camión.
- Detección de peatones (`yaya`) y de conductores sobre bicicleta o motocicleta (`surucu`), con cajas separadas para el vehículo de dos ruedas y para la persona.
- Detección de motocicletas y bicicletas, con la salvedad de que la clase `bisiklet` es muy débil.
- Salida estándar de Ultralytics: cajas delimitadoras, clase y confianza, integrable con el ecosistema `ultralytics`.
- Exportación a otros formatos (el repositorio incluye el tag `onnx`), aunque la model card solo documenta el uso con pesos `.pt`.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multimodales más allá de la detección de imágenes.

## Casos de uso

- Conducción autónoma y Robotaksi (Teknofest): el modelo proporciona detecciones de peatones, conductores de dos ruedas y vehículos en escenas de calle turcas a 1024 px, adecuadas para módulos de percepción que necesiten distinguir clases viarias locales.
- Conteo y análisis de tráfico: al separar turismos, furgonetas, autobuses y camiones, permite aforos por categoría en estudios de movilidad urbana, con la cautela de que las métricas se midieron contra pseudoetiquetas.
- Proyectos de ciudad inteligente: integración en cámaras urbanas para monitorizar flujos de peatones y vehículos, con umbral de confianza recomendado entre 0,25 y 0,40.
- Análisis de imágenes a nivel de calle (street-level imagery): procesamiento de capturas tipo Mapillary para inventariar usuarios de la vía en corredores concretos.
- Prototipado rápido en investigación: al ser un YOLO11s de 19,3 MB, sirve como línea base para comparar estrategias de etiquetado débil o pseudoetiquetado en dominios locales.
- Sistemas de alerta en vehículos de flota: detección de peatones y ciclistas en entornos urbanos turcos, siempre con revisión humana y sin uso como única fuente de seguridad.
- Preetiquetado asistido: usar el modelo para generar propuestas de cajas que luego se revisen y corrijan manualmente, dado que el propio autor advierte de que las etiquetas originales no están verificadas por humanos.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre el conjunto de validación de la plataforma (4.111 imágenes, divididas por secuencia; 3.636 del subconjunto v2 y 475 del v1). El autor advierte que estas cifras miden principalmente la concordancia con las pseudoetiquetas, no la precisión en el mundo real.

| Métrica | r2 (este modelo) | Primera versión |
|---|---|---|
| mAP@50 | 75,58 % | 70,65 % |
| mAP@50-95 | 59,05 % | 53,73 % |
| Precisión / Exhaustividad | 80,36 % / 70,22 % | 73,98 % / 65,29 % |
| F1 | 74,2 % | 68,0 % |

| Clase | AP50 | Precisión | Exhaustividad | F1 | AP50 (primera versión) |
|---|---|---|---|---|---|
| `otomobil` | 95,6 % | 92,0 % | 91,1 % | 91,6 % | 94,7 % |
| `kamyonet_minibus` | 91,1 % | 83,0 % | 85,4 % | 84,2 % | 89,4 % |
| `kamyon` | 86,2 % | 79,5 % | 80,2 % | 79,9 % | 83,4 % |
| `yaya` | 82,4 % | 89,4 % | 73,1 % | 80,4 % | 79,5 % |
| `motosiklet` | 81,2 % | 85,5 % | 72,7 % | 78,6 % | 75,9 % |
| `otobus` | 79,0 % | 76,9 % | 72,7 % | 74,7 % | 71,4 % |
| `surucu` | 65,9 % | 79,5 % | 60,6 % | 68,8 % | 60,0 % |
| `bisiklet` | 23,1 % | 57,1 % | 25,6 % | 35,3 % | 10,8 % |

Medición independiente de la tubería de etiquetado sobre las 475 imágenes v1 (conjunto que el modelo profesor no vio): precisión de clase del 93 %, precisión a nivel de familia (vehículo / dos ruedas / persona) del 97 %, tasa de omisión del 10 % (14 % en la capa sin panóptica; la mayoría de omisiones son objetos menores de 40 px o muy ocluidos) y retención de imagen del 52-55 %. La confusión más frecuente es `otomobil` ↔ `kamyonet_minibus`, en torno al 3 % en ambos sentidos. El modelo profesor (YOLO11s, imgsz 1280, solo v1) obtuvo en esas mismas 475 imágenes un mAP@50 del 50,6 % y un mAP@50-95 del 34,2 %. El rendimiento de este modelo r2 medido únicamente sobre el subconjunto v1 no se ha publicado.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 19,3 MB de pesos, un YOLO11s a 1024 px cabe holgadamente en GPUs de consumo.
- GPU recomendadas: no especificadas por el autor. Por tamaño, cualquier GPU consumer reciente (RTX 3060 en adelante) es suficiente para inferencia; para entrenamiento o lotes grandes conviene una GPU de datacenter (A100, H100).
- Cabe en GPU de consumo: sí, por el tamaño del modelo (19,3 MB de pesos). No se han publicado cifras de VRAM ni de latencia.
- Opciones de despliegue: el ecosistema Ultralytics (`ultralytics` con pesos `.pt`); el repositorio incluye el tag `onnx`, lo que sugiere exportación a ONNX, aunque la model card no documenta el procedimiento. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a un detector de objetos.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Clases | Contexto / resolución | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `mvdelibas/turkiye-arac-yaya-yolo11s` (r2) | YOLO11s fine-tuneado | 8 clases viarias turcas | imgsz 1024 (1280 opcional) | CC BY-SA 4.0 | HuggingFace y EVREN |
| YOLO11s preentrenado en COCO (Ultralytics) | YOLO11s genérico | 80 clases COCO | Configurable | AGPL-3.0 / licencia comercial Ultralytics | Ultralytics |
| YOLO11x preentrenado en COCO | YOLO11x genérico | 80 clases COCO | Configurable | AGPL-3.0 / licencia comercial Ultralytics | Ultralytics |
| Modelo profesor del autor (YOLO11s, solo v1) | YOLO11s fine-tuneado | 8 clases viarias turcas | imgsz 1280 | no disponible | Uso interno en la tubería de etiquetado |

La comparación directa con los modelos COCO no es homogénea, porque la taxonomía de clases difiere: COCO incluye `bicycle`, `motorcycle`, `person`, `car`, `bus` y `truck`, pero no separa furgoneta de turismo ni distingue conductor de dos ruedas de peatón. El modelo profesor es el referente interno del propio autor y no está publicado como modelo independiente. No se dispone de comparaciones con otros detectores específicos para Turquía en la información proporcionada.

## Limitaciones y advertencias

- Las etiquetas de entrenamiento son en su mayoría pseudoetiquetas (89,4 % de las imágenes) y ninguna fue verificada individualmente por humanos; las métricas miden concordancia con la tubería de etiquetado, no precisión en el mundo real.
- La clase `bisiklet` es claramente deficiente (AP50 del 23,1 %, solo 321 cajas en todo el dataset); el autor recomienda no confiar en ella y combinarla con la clase `bicycle` de un modelo preentrenado en COCO.
- La clase `surucu` tiene rendimiento intermedio (AP50 del 65,9 %, exhaustividad del 60,6 %).
- La exhaustividad cae en objetos pequeños o lejanos y en escenas densas; se recomienda probar `imgsz=1280` para objetos pequeños.
- Confusión frecuente entre `otomobil` y `kamyonet_minibus` (en torno al 3 % en ambos sentidos).
- Las regiones de ignoración pintadas en gris durante el entrenamiento no afectan a la inferencia, pero el modelo puede haber aprendido sesgos derivados de ese enmascaramiento.
- Sesgos conocidos: no se documentan análisis de sesgo por género, edad, hora del día, clima ni región geográfica dentro de Turquía.
- Riesgo de alucinación en sentido estricto no aplica (no es generativo), pero sí hay riesgo de falsos positivos y falsos negativos, especialmente en clases con pocas cajas.
- Licencia CC BY-SA 4.0: permite uso comercial con atribución y obliga a compartir las obras derivadas bajo la misma licencia; conviene revisar las implicaciones antes de integrarlo en productos propietarios.
- El modelo está marcado como `experimental` en los tags del repositorio; no debe usarse como única fuente de seguridad en sistemas de conducción autónoma.
- Solo hay datos de validación en turco y para escenas turcas; la generalización a otros países o dominios visuales no está medida.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso en producción por terceros.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mvdelibas/turkiye-arac-yaya-yolo11s
- Perfil del autor en EVREN: https://evren.ssyz.org.tr/users/u43bd0650c87e
- Plataforma nacional de IA de Turquía (EVREN): https://evren.ssyz.org.tr
- Ultralytics (framework YOLO11): https://github.com/ultralytics/ultralytics
- Mapillary (fuente de segmentación panóptica): https://www.mapillary.com
- Grounding DINO: https://github.com/IDEA-Research/GroundingDINO
