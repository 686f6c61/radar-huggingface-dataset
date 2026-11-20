# oneryalcin/ui-controls-rfdetr

## Resumen

ui-controls-rfdetr es un modelo de deteccion de objetos especializado en localizar controles interactivos (botones, enlaces, campos de texto) dentro de capturas de pantalla de paginas web. Lo desarrolla el usuario oneryalcin y se publica bajo licencia Apache 2.0. Se trata de un fine-tuning de RF-DETR-Medium, un detector basado en la arquitectura DETR (transformer de deteccion) desarrollada por Roboflow, ajustado para la tarea concreta de "computer use": identificar que elementos de una interfaz se pueden pulsar y clasificarlos en tres categorias (icono, control con texto, campo de entrada).

El modelo resuelve un problema especifico de los agentes que operan interfaces graficas: convertir una captura de pantalla en una lista de objetivos clicables con sus coordenadas. Frente a alternativas como UI-DETR-1, el autor reporta una mejora modesta en cobertura de controles (91,6% frente a 88,0% con umbral 0,2) y, sobre todo, una reduccion notable del coste: 142 MB de pesos frente a 535 MB y 0,30 s por imagen frente a 0,57 s en un portatil Apple M-series.

El modelo es muy pequeno en terminos de despliegue (repositorio de 0,1 GB), se entrena en apenas 27 minutos sobre una A100 y esta pensado como componente de un pipeline de automatizacion web, no como modelo generativo. Su relevancia actual radica en la explosion de agentes "computer-use" que necesitan detectar elementos de interfaz de forma rapida y ligera en entornos de produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RF-DETR-Medium (transformer de deteccion DETR, fine-tuning) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, no de lenguaje) |
| Tipos de cuantizacion | no disponible (pesos en checkpoint PyTorch Lightning) |
| Idiomas soportados | no disponible (modelo visual, sin procesamiento de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | checkpoint PyTorch Lightning (.pth, pickle) con pesos y ajustes de entrenamiento |
| Resolucion de entrada | 1280 px |
| Clases detectadas | 3: `icon` (0), `text_control` (1), `input` (2) |
| Libreria | rfdetr==1.12.1 |
| Tamano del repositorio | 0,1 GB |
| Pesos | 142 MB |

## Arquitectura y entrenamiento

El modelo parte de RF-DETR-Medium, un detector de la familia DETR que combina un backbone convolucional con un decoder transformer para predecir conjuntos de cajas y clases sin necesidad de anchors ni NMS posterior. El fine-tuning se realizo durante 17 epocas (27 minutos en una A100) sobre 599 capturas de pantalla de paginas web, con etiquetas derivadas automaticamente de la estructura de la pagina (no dibujadas a mano). El dataset y los scripts de etiquetado estan publicados en oneryalcin/ui-controls-web.

La innovacion principal no esta en la arquitectura sino en el pipeline de datos: las etiquetas se extraen de la estructura del DOM, lo que permite escalar la anotacion sin coste manual. Las tres clases se asignan mediante OCR (si el control contiene texto legible o no). El autor reporta una validacion contra el arbol de accesibilidad del navegador en 15 paginas, con un 99,9% de controles etiquetados y un 2,9% de etiquetas sin correspondencia. No se documenta uso de RLHF, DPO ni tecnicas de decodificacion especulativa, al no ser un modelo generativo.

## Capacidades

- Deteccion de controles clicables en capturas de pantalla de paginas web con coordenadas (cajas xyxy), clase y puntuacion de confianza.
- Clasificacion en tres categorias: `icon` (botones sin texto, checkboxes, radios, muestras de color), `text_control` (enlaces y botones con texto) e `input` (campos de texto, selects, textareas).
- Umbral de confianza configurable (recomendado 0,2; bajable a 0,1 o 0,05 para obtener mas cajas).
- Integracion como componente de pipelines de agentes "computer-use" para localizar objetivos antes de hacer clic.
- Inferencia rapida: 0,30 s por imagen en un portatil Apple M-series segun el autor.
- No soporta tool calling, agentes multi-paso, capacidades multilingues ni modos de razonamiento: es exclusivamente un detector visual.

## Casos de uso

- Agentes de automatizacion web: el modelo convierte una captura de pantalla en una lista de controles con coordenadas, permitiendo que un agente de lenguaje decida que elemento pulsar. Es adecuado por su baja latencia (0,30 s por imagen) y su tamano reducido (142 MB), que permite ejecutarlo junto al modelo de lenguaje en el mismo host.
- Testing de interfaz automatizado: dado un objetivo como "rellenar el formulario de contacto", el detector localiza los campos `input` de la pagina y un orquestador puede rellenarlos. La clasificacion en tres clases simplifica la seleccion del tipo de accion.
- Rastreo de accesibilidad: comparar los controles detectados con el arbol de accesibilidad para detectar elementos no etiquetados o mal clasificados en una web.
- Extraccion de estructura de paginas: generar un mapa de elementos interactivos de una pagina para indexacion, documentacion o analisis de UX.
- Automatizacion de tareas repetitivas en portales internos: localizar el boton de envio, el campo de busqueda o el enlace de descarga en pantallas de 1440x900 sin depender de selectores CSS fragiles.
- Preprocesado para modelos de vision-lenguaje: reducir la carga del VLM proporcionandole solo las regiones candidatas detectadas, en lugar de la imagen completa.

## Benchmarks y rendimiento

Evaluacion sobre 52 capturas de retencion de 11 sitios no vistos en entrenamiento, 1.911 controles etiquetados, resolucion 1440x900. Un control se considera encontrado si una caja lo solapa con IoU >= 0,5 o si los centros de ambos caen dentro del otro.

| Metrica | UI-DETR-1 | Este modelo |
|---|---|---|
| Controles encontrados, umbral 0,2 | 88,0% (iconos 82%) | 91,6% (iconos 91%) |
| Controles encontrados, umbral 0,1 / 0,05 | no medido | 94,9% / 96,3% |
| Cajas que coinciden con una etiqueta, umbral 0,2 | 51% | 65% |
| Clase correcta cuando se encuentra | una sola clase | 97% |
| Segundos por imagen (portatil Apple M-series) | 0,57 | 0,30 |
| Pesos | 535 MB | 142 MB |

Prueba de extremo a extremo "encuentra el control para este objetivo" sobre 62 objetivos en cinco sitios distintos: 54/62 con este detector frente a 55/62 con UI-DETR-1, diferencia dentro del ruido segun el autor.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con 142 MB de pesos y resolucion 1280 px, el modelo es muy ligero y cabe holgadamente en GPUs de consumo.
- GPU recomendadas: A100 (usada para el entrenamiento, 27 minutos); para inferencia cualquier GPU moderna es suficiente, incluidas RTX 4090, RTX 3090 o RTX 4060.
- Cabe en GPU de consumo: si, por el tamano de los pesos y la arquitectura RF-DETR-Medium.
- Opciones de despliegue: libreria `rfdetr` (version 1.12.1), que carga el checkpoint `.pth` directamente; el codigo de ejemplo usa `RFDETRMedium(pretrain_weights=..., resolution=1280)` y `model.predict(...)`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo de lenguaje.
- Latencia y throughput: 0,30 s por imagen en un portatil Apple M-series segun el autor; no se publican cifras de throughput en GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento (controles encontrados, umbral 0,2) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ui-controls-rfdetr | no disponible (142 MB de pesos) | no aplica | 91,6% | Apache 2.0 | Hugging Face |
| UI-DETR-1 | no disponible (535 MB de pesos) | no aplica | 88,0% | no disponible en la informacion | Hugging Face (racineai/UI-DETR-1) |
| RF-DETR-Medium (base) | no disponible | no aplica | no disponible | Apache 2.0 (segun el autor) | Roboflow / Hugging Face |

No se dispone de datos de otros detectores de controles de interfaz en la informacion proporcionada.

## Limitaciones y advertencias

- Solo validado en paginas web a 1440x900 y escala 1; no probado en aplicaciones de escritorio nativas, moviles ni otras resoluciones.
- Sin mejora en precision de extremo a extremo: en la prueba de 62 objetivos, 54/62 frente a 55/62 de UI-DETR-1, diferencia dentro del ruido. La ventaja es velocidad y menor numero de cajas, no acierto.
- Etiquetas automaticas: la validacion contra el arbol de accesibilidad encontro un 2,9% de etiquetas sin correspondencia, y las clases derivadas de OCR pueden ser incorrectas en algunos casos.
- Una sola ejecucion de entrenamiento, con umbrales comparados sobre las propias paginas de test; no hay repeticiones que confirmen la robustez de las cifras.
- Las cajas que no coinciden con ninguna etiqueta no son necesariamente errores: texto plano e imagenes simplemente no estan etiquetados.
- Riesgo de sesgo hacia la distribucion de los 599 sitios de entrenamiento; el rendimiento puede degradarse en interfaces muy distintas (SPAs complejas, canvas, sombras DOM).
- Licencia Apache 2.0, permisiva para uso comercial; el checkpoint es un pickle de PyTorch Lightning, por lo que debe cargarse solo desde fuentes de confianza.
- No procesa lenguaje: no interpreta el texto de los controles, solo detecta su presencia y posicion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/oneryalcin/ui-controls-rfdetr
- Dataset de entrenamiento: https://huggingface.co/datasets/oneryalcin/ui-controls-web
- Modelo comparable UI-DETR-1: https://huggingface.co/racineai/UI-DETR-1
- Libreria rfdetr (Roboflow): no disponible en la informacion proporcionada
