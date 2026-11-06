# plitip/team-qh-091-safesite

## Resumen

SafeSite Qatar es un detector de objetos basado en Ultralytics YOLO26s, ajustado por el equipo plitip durante el hackathon Qai × Hugging Face celebrado en Doha del 5 al 7 de noviembre de 2026. El modelo identifica siete clases relacionadas con la seguridad en obras de construccion: personas, cascos puestos, cabezas sin casco, chalecos de alta visibilidad, personas sin chaleco, maquinaria y vehiculos. Es el componente de vision del sistema SafeSite Qatar, que combina estas detecciones con un motor de reglas en Python puro para generar alertas multilingues y una puntuacion de seguridad de 0 a 100.

El modelo parte de los pesos preentrenados en COCO de YOLO26s y se reentrena sobre un dataset agregado de 17.240 imagenes de entrenamiento y 4.109 de validacion, procedente de tres conjuntos publicos de Hugging Face. La innovacion principal no esta en la arquitectura, sino en el enfoque de deteccion a nivel de cabeza para evaluar el uso de equipos de proteccion individual (EPI), lo que permite detectar la ausencia de casco incluso cuando la persona no esta correctamente delimitada.

Su relevancia practica reside en el rendimiento de las clases de casco: mAP50 de 0,939 para `helmet` y 0,928 para `no_helmet`, que son el caso de uso central. Sin embargo, las clases `person`, `vest` y `no_vest` presentan metricas muy bajas (0,171, 0,186 y 0,079 respectivamente), lo que limita su uso como contador de personas o verificador de chalecos. La licencia AGPL-3.0 heredada de Ultralytics condiciona fuertemente su explotacion comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO26s (Ultralytics), detector de objetos de una etapa |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, entrada de imagen a 640x640) |
| Tipos de cuantizacion | no disponible (pesos en `best.pt`, formato PyTorch) |
| Idiomas soportados | no aplica (vision); las alertas del sistema SafeSite son multilingues segun la model card, sin detalle de idiomas |
| Licencia | AGPL-3.0 |
| Formato de pesos | `best.pt` (checkpoint PyTorch de Ultralytics) |

## Arquitectura y entrenamiento

YOLO26s es un detector de objetos de una sola etapa de la familia Ultralytics, sucesor de la serie YOLO11/YOLOv8. No se dispone en la informacion proporcionada de detalles sobre el backbone, la cabeza de deteccion ni innovaciones internas especificas de YOLO26. El ajuste fino se realizo desde los pesos preentrenados en COCO `yolo26s.pt`, con resolucion de entrada de 640 pixeles, tamano de lote 32 y 36 epocas dentro de un presupuesto de tiempo de 1,75 horas. El entrenamiento se ejecuto en una unica GPU NVIDIA L4 mediante Hugging Face Jobs, con un coste facturado de 107 minutos (aproximadamente 1,43 USD).

Los datos de entrenamiento provienen de la fusion de tres conjuntos publicos en formato YOLO: `keremberke/hard-hat-detection` (CC BY 4.0), `keremberke/construction-safety-object-detection` (CC BY 4.0) y `Francesco/construction-safety-gsnvb` (CC). Se descartaron las clases barricade, dumpster, gloves, mask, no-mask, safety net y safety shoes. El dataset resultante, alojado de forma privada en `plitip/team-qh-091-safesite-data`, contiene 17.240 imagenes de entrenamiento y 4.109 de validacion, tomadas de los splits `valid` originales de cada fuente (nunca usadas en entrenamiento). No se menciona el uso de RLHF, DPO ni tecnicas de alineacion, algo esperable en un detector de vision.

## Capacidades

- Deteccion de siete clases en imagenes estaticas de obras: `person`, `helmet`, `no_helmet`, `vest`, `no_vest`, `machinery` y `vehicle`.
- Deteccion a nivel de cabeza para evaluar el uso de casco, lo que permite identificar cabezas sin proteccion aunque la persona no este bien delimitada.
- Salida de cajas delimitadoras con puntuaciones de confianza, integrable en pipelines de postprocesado.
- Integracion con un motor de reglas externo (Python puro, sin LLM) que convierte las detecciones en peligros, una puntuacion de seguridad de 0 a 100 y alertas multilingues para trabajadores.
- Capacidad de combinarse con YOLOE de vocabulario abierto para objetos adicionales, segun la aplicacion SafeSite.
- No soporta tool calling, agentes, razonamiento multi-paso ni generacion de texto: es exclusivamente un detector de objetos.
- No dispone de modo thinking, vision multimodal generativa, audio ni capacidades linguisticas propias.

## Casos de uso

- Inspeccion de fotos de obra para detectar ausencia de casco: el modelo alcanza mAP50 de 0,928 en `no_helmet`, por lo que puede usarse como primer filtro en revisiones de seguridad documentadas con imagenes fijas.
- Auditoria de cumplimiento de EPI en material de formacion y charlas de seguridad (toolbox talks): permite etiquetar automaticamente ejemplos de cascos y no cascos para preparar material didactico.
- Generacion de listas de comprobacion de seguridad asistidas: las detecciones alimentan el motor de reglas de SafeSite Qatar para producir una puntuacion de 0 a 100 y alertas revisables por un supervisor.
- Revision por muestreo de supervisores: procesar lotes de fotos historicas para identificar imagenes con posibles carencias de casco y priorizar la revision humana.
- Prototipado de sistemas de seguridad en obra: sirve como base para experimentar con deteccion de EPI antes de invertir en un detector mas robusto o en datos propios.
- Integracion en la demo SafeSite Qatar: el Space `plitip/team-qh-091-safesite-app` muestra el flujo completo de deteccion, reglas y alertas, util como referencia de arquitectura para equipos que quieran replicar el enfoque.
- Deteccion aproximada de maquinaria y vehiculos en imagen fija: con mAP50 de 0,876 y 0,663 respectivamente, puede usarse de forma exploratoria, siempre con validacion humana y sin fiarse de los valores por el escaso numero de cajas de validacion.

## Benchmarks y rendimiento

Metricas globales sobre el split de validacion (4.109 imagenes):

| Metrica | Valor |
|---|---|
| mAP50 | 0,549 |
| mAP50-95 | 0,355 |
| Precision | 0,473 |
| Recall | 0,648 |

Metricas por clase (mAP50 y numero de cajas de validacion):

| Clase | mAP50 | Cajas de validacion |
|---|---|---|
| helmet | 0,939 | 9.262 |
| no_helmet | 0,928 | 2.255 |
| machinery | 0,876 | 14 |
| vehicle | 0,663 | 8 |
| vest | 0,186 | 135 |
| person | 0,171 | 237 |
| no_vest | 0,079 | 75 |

No se han publicado resultados comparativos con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; por el tamano de la variante YOLO26s y la resolucion de 640x640, es esperable que quepa en GPUs consumer, aunque el dato no esta confirmado en la informacion proporcionada.
- GPU de entrenamiento utilizada: 1× NVIDIA L4 (Hugging Face Jobs), con 107 minutos facturados.
- GPU recomendadas: no disponible en la informacion; el modelo se entreno en L4 y no se documentan pruebas en A100, H100 ni RTX 4090.
- Compatibilidad con GPU consumer: probable por tamano de la variante `s`, pero no confirmada en la model card.
- Opciones de despliegue: Ultralytics (libreria `ultralytics`), con carga directa de `best.pt` mediante `YOLO(weights)`. No se documentan exportaciones a ONNX, TensorRT, GGUF ni integraciones con vLLM, llama.cpp, Ollama o TGI (no aplicables a un detector de vision en este formato).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Clases | mAP50 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SafeSite Qatar (YOLO26s) | Detector de objetos | 7 (EPI y obra) | 0,549 global; 0,939 en helmet | AGPL-3.0 | Hugging Face (`plitip/team-qh-091-safesite`) |
| YOLO26s preentrenado en COCO | Detector de objetos | 80 (COCO) | no disponible en esta ficha | AGPL-3.0 | Ultralytics |
| YOLOE (vocabulario abierto) | Detector de objetos | Abierto | no disponible | no disponible en esta ficha | Usado por la app SafeSite para objetos adicionales |

No se dispone de datos de benchmarks de los modelos comparables en la informacion proporcionada, por lo que la comparacion cuantitativa de rendimiento no es posible.

## Limitaciones y advertencias

- La clase `person` es debil (mAP50 0,171): el dataset principal etiqueta solo cabezas, por lo que la mayoria de personas aparecen sin etiqueta y el modelo aprende a ignorarlas. Para contar personas es preferible un detector COCO estandar o YOLOE.
- Las clases `vest` y `no_vest` son debiles (0,186 y 0,079) por la misma razon y por el escaso numero de ejemplos (aproximadamente 1.300 y 900 cajas).
- `machinery` y `vehicle` se apoyan en muy pocas cajas de entrenamiento (aproximadamente 190 y 100) y de validacion (14 y 8), por lo que sus puntuaciones no son fiables.
- Las cabezas pequenas, lejanas o muy ocluidas se pierden con frecuencia; `no_helmet` puede confundirse con gorras, bufandas o pelo.
- Las fotos de entrenamiento no son mayoritariamente de Qatar; la iluminacion, la calima por calor, la ropa (incluidos cubrimientos de cabeza bajo el casco) y la disposicion de las obras en el Golfo pueden reducir la precision.
- Un detector solo ve lo que esta en el encuadre: la ausencia de deteccion no prueba que la situacion sea segura.
- Uso previsto limitado a fotos estaticas como entrada a una lista de comprobacion revisada por una persona; no debe usarse para disciplina o vigilancia individual de trabajadores, identificacion de personas, decisiones legales o de cumplimiento sin revision humana, ni como unica base de decisiones criticas de seguridad.
- Licencia AGPL-3.0: el uso en un servicio en red obliga a publicar el codigo fuente completo bajo la misma licencia; el uso comercial sin abrir el codigo requiere una licencia empresarial de Ultralytics.
- Los datos de entrenamiento son CC BY 4.0 / CC y exigen atribucion a los autores de los conjuntos de datos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/plitip/team-qh-091-safesite
- Demo Space: https://huggingface.co/spaces/plitip/team-qh-091-safesite-app
- Dataset de entrenamiento (privado): https://huggingface.co/datasets/plitip/team-qh-091-safesite-data
- Dataset fuente hard-hat-detection: https://huggingface.co/datasets/keremberke/hard-hat-detection
- Dataset fuente construction-safety-object-detection: https://huggingface.co/datasets/keremberke/construction-safety-object-detection
- Dataset fuente construction-safety-gsnvb: https://huggingface.co/datasets/Francesco/construction-safety-gsnvb
- Licencia empresarial de Ultralytics: https://www.ultralytics.com/license
- Proyecto relacionado SafeSite-AI (tercero, no oficial): https://github.com/FAbdullah17/SafeSite-AI
- Sitio de SafeSite AI (tercero, no oficial): https://www.safesiteai.com/
