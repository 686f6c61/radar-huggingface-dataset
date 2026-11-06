# LibreYOLO/LibreUniMatchs-flow

## Resumen

LibreUniMatchs-flow es un modelo de estimación de flujo óptico (optical flow) empaquetado para la tarea `flow` de la librería LibreYOLO. Se trata de una reempaquetación del checkpoint `gmflow-scale1-things-e9887eda.pth` del proyecto UniMatch de autonomousvision, que implementa la variante GMFlow scale1: emparejamiento global a resolución 1/8 y upsampling convexo. El modelo fue entrenado originalmente en FlyingChairs y posteriormente en FlyingThings3D.

El modelo no introduce pesos nuevos ni cambios en los parámetros aprendidos: la modificación consiste únicamente en un envoltorio de metadatos para almacenar los tensores originales dentro del esquema de checkpoints de LibreYOLO, con la etiqueta de tarea `flow`. Está pensado para devolver un campo de flujo denso `(H, W, 2)` en píxeles sobre el lienzo original, junto con una utilidad de visualización en rueda de color Middlebury.

Es relevante para desarrolladores que trabajan con vídeo, odometría visual o interpolación de fotogramas y que quieren integrar estimación de flujo óptico en el mismo ecosistema que usan para detección con LibreYOLO, sin tener que gestionar por separado el código de UniMatch. El repositorio ocupa 0.0 GB según los metadatos de Hugging Face y no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GMFlow scale1 (emparejamiento global a 1/8 de resolución con upsampling convexo), derivada de UniMatch |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión por pares de fotogramas; no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de visión) |
| Licencia | MIT (según el proyecto publicador; ver advertencias) |
| Formato de pesos | checkpoint `.pt` en el esquema de LibreYOLO (tensores originales de UniMatch sin modificar) |

## Arquitectura y entrenamiento

La arquitectura corresponde a GMFlow en su configuración scale1: se extraen características de dos fotogramas, se realiza un emparejamiento global denso a resolución 1/8 y se refina el flujo mediante upsampling convexo hasta la resolución del lienzo original. Esta variante prioriza velocidad y tamaño reducido frente a las configuraciones de mayor resolución del mismo linaje. El modelo forma parte del marco UniMatch, presentado en el artículo "Unifying Flow, Stereo and Depth Estimation" (Xu et al., IEEE TPAMI 2023).

El entrenamiento sigue el protocolo estándar de UniMatch para flujo óptico: primero FlyingChairs y después FlyingThings3D, según indica la model card. No se documentan en la información disponible detalles sobre número de iteraciones, composición exacta del dataset, aumento de datos ni uso de RLHF/DPO (no aplicable en este dominio). La reempaquetación para LibreYOLO se realizó mediante el script `weights/convert_unimatch_weights.py`, que envuelve los tensores originales del checkpoint `gmflow-scale1-things-e9887eda.pth` (commit `943a99006950ab6c84ea72a72beb147fdd03c19a` de autonomousvision/unimatch) sin alterar los parámetros aprendidos.

## Capacidades

- Estimación de flujo óptico denso entre dos fotogramas, devolviendo un tensor `(H, W, 2)` en float32 con desplazamientos `(dx, dy)` en píxeles sobre el lienzo original.
- Visualización del flujo mediante `to_rgb()`, que aplica la rueda de color Middlebury.
- Integración con la API de LibreYOLO: el modelo se carga con `LibreYOLO("LibreUniMatchs-flow.pt")` y se invoca pasando una lista de dos rutas de imagen.
- Tarea `flow` dentro del esquema de checkpoints de LibreYOLO, lo que permite reutilizar el mismo flujo de carga que otros modelos de la librería.
- No dispone de generación de texto, razonamiento, código, matemáticas, tool calling, capacidades de agente ni multilingües: es un modelo puramente visual de correspondencia entre fotogramas.
- No se documentan modos especiales (thinking, audio, visión de imagen única) ni otras tareas de UniMatch (stereo, depth) en esta reempaquetación.

## Casos de uso

- Interpolación de fotogramas en vídeo: el flujo denso `(dx, dy)` permite sintetizar fotogramas intermedios entre dos imágenes consecutivas, útil en postproducción y en la generación de vídeo a cámara lenta.
- Estabilización de vídeo: estimar el movimiento global entre fotogramas para compensar vibraciones en grabaciones handheld o en drones, usando el campo de flujo como señal de desplazamiento.
- Odometría visual y robótica: calcular el movimiento aparente de la escena entre pares de imágenes para alimentar módulos de navegación o SLAM en plataformas con recursos limitados, dado el tamaño reducido del modelo.
- Seguimiento de objetos y personas: propagar puntos de interés o cajas de detección entre fotogramas usando el flujo como correspondencia densa, combinándolo con detectores del propio ecosistema LibreYOLO.
- Análisis de movimiento en vídeo deportivo o de tráfico: cuantificar velocidad y dirección de objetos en escena a partir del campo de flujo, con visualización en rueda de color para revisión humana.
- Preprocesado para modelos de vídeo: generar mapas de flujo como entrada auxiliar en pipelines de predicción temporal, segmentación o generación condicionada por movimiento.
- Control de calidad en vídeo comprimido: detectar artefactos o discontinuidades temporales comparando el flujo estimado con el esperado entre fotogramas consecutivos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; al ser una variante "small, fast" de GMFlow, se espera un consumo moderado, pero no se documentan cifras.
- GPU recomendadas: no disponible. Por el perfil del modelo (GMFlow scale1), es razonable esperar que funcione en GPU consumer, pero no se confirma en la documentación.
- ¿Cabe en GPU consumer? No confirmado; el autor lo describe como modelo pequeño y rápido, sin especificar requisitos.
- Opciones de despliegue: la vía documentada es la librería LibreYOLO (`pip`/repositorio de LibreYOLO) con el checkpoint `.pt`. No se mencionan exportaciones a ONNX, TensorRT, vLLM, llama.cpp, Ollama ni TGI (estas últimas no aplican a un modelo de visión).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Resolución de matching | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LibreUniMatchs-flow | GMFlow scale1 (UniMatch) | 1/8 + upsampling convexo | FlyingChairs → FlyingThings3D | MIT (según LibreYOLO) | Hugging Face (LibreYOLO) |
| UniMatch (upstream) | UniMatch completo | Configuraciones múltiples | FlyingChairs → FlyingThings3D (+ más etapas en variantes) | MIT (código) | GitHub autonomousvision/unimatch |
| GMFlow (upstream) | GMFlow original | Varias escalas | FlyingChairs → FlyingThings3D | MIT (código) | GitHub y MODEL_ZOO de UniMatch |
| RAFT | Flujo recurrente con correlación | Múltiples | FlyingChairs → FlyingThings3D (+ sintéticos) | BSD-3 (código) | GitHub princeton-vl/RAFT |

No se dispone de datos de rendimiento comparativo (EPE, precisión en KITTI/Sintel) en la información proporcionada para esta ficha.

## Limitaciones y advertencias

- La licencia MIT de los pesos es una interpretación declarada por LibreYOLO: el proyecto upstream publica los checkpoints sin una licencia de pesos separada, por lo que la concesión MIT no está confirmada por el publicador original. Revisar `LICENSE` y `NOTICE` antes de uso comercial.
- El modelo está entrenado en FlyingChairs y FlyingThings3D (datos sintéticos); el rendimiento en dominios reales (KITTI, Sintel, vídeo de vigilancia) no está documentado en esta ficha y puede degradarse.
- No se han publicado métricas de error (EPE) ni evaluaciones en benchmarks estándar en la información disponible.
- El repositorio registra 0 descargas y 0 likes, y un tamaño de 0.0 GB en los metadatos: conviene verificar la integridad del checkpoint antes de integrarlo en producción.
- Solo cubre la tarea de flujo óptico; no incluye las capacidades de stereo o depth de UniMatch.
- No hay información sobre cuantización, exportación a otros formatos ni soporte de hardware distinto de la librería LibreYOLO.
- Al ser una reempaquetación de metadatos, cualquier bug o limitación del checkpoint upstream (`gmflow-scale1-things-e9887eda.pth`) se hereda sin cambios.
- No aplica a tareas de lenguaje: no tiene contexto textual, idiomas ni sesgos lingüísticos que evaluar; los sesgos relevantes serían los de los datasets sintéticos de entrenamiento (escenas sintéticas, iluminación y movimiento artificiales).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/LibreYOLO/LibreUniMatchs-flow
- Repositorio LibreYOLO: https://github.com/LibreYOLO/libreyolo
- UniMatch (upstream): https://github.com/autonomousvision/unimatch
- Checkpoint original: https://s3.eu-central-1.amazonaws.com/avg-projects/unimatch/pretrained/gmflow-scale1-things-e9887eda.pth
- Paper: Xu, Zhang, Cai, Rezatofighi, Yu, Tao y Geiger, "Unifying Flow, Stereo and Depth Estimation", IEEE TPAMI 2023.
