# ParsaVictor/pcb-inspection-suite

## Resumen

PCB Inspection Suite es un conjunto de modelos de deteccion de objetos basados en YOLO26, desarrollado por ParsaVictor, orientado a la inspeccion automatica optica (AOI) de placas de circuito impreso (PCB). El repositorio actua como punto de entrada a un pipeline completo de tres etapas: deteccion de componentes, deteccion de defectos en placa desnuda (nivel de cobre y pistas) y deteccion de defectos de soldadura y ensamblaje. Cada etapa se entrena y publica de forma independiente, con su propio dataset, lo que permite usar cualquiera de ellas por separado o encadenarlas para generar un informe combinado a partir de una unica fotografia de la placa.

El proyecto destaca por el esfuerzo de curacion de datos: recuperacion de originales a resolucion completa en lugar de exportaciones reescaladas, fusion de multiples fuentes reales por tarea, revision manual de etiquetas y eliminacion de casi duplicados, manteniendo los conjuntos de test y validacion como fotografias reales sin alterar. Los modelos publicados reportan mAP50 de 0,928 y mAP50-95 de 0,617 en la etapa de placa desnuda (YOLO26s) y mAP50 de 0,895 y mAP50-95 de 0,657 en la etapa de soldadura (YOLO26m).

La relevancia actual reside en que la mayoria de resultados publicos sobre defectos en PCB proceden de un pequeno conjunto de releases duplicados y a baja resolucion. Este suite propone un pipeline reproducible con pesos listos para inferir mediante Ultralytics, aunque la licencia restringe el uso a investigacion y desarrollo, requiriendo contacto con el autor para uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO26 (detector de objetos de la familia Ultralytics); variantes s y m segun etapa |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, no de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de vision); metadatos de idioma no disponibles |
| Licencia | other (uso de investigacion/desarrollo; contacto con el autor para uso comercial) |
| Formato de pesos | .pt (PyTorch, compatible con Ultralytics) |

## Arquitectura y entrenamiento

El suite se compone de detectores YOLO26, la generacion de la familia YOLO de Ultralytics, en variantes de tamano s (small) para la deteccion de defectos en placa desnuda y m (medium) para defectos de soldadura y ensamblaje. Cada etapa se entrena de forma independiente sobre su propio dataset, con ajuste de umbrales de confianza por clase en lugar de un umbral unico por defecto. La etapa de deteccion de componentes se encuentra en proceso de finalizacion de pesos, aunque su dataset ya esta publicado.

Los datos de entrenamiento proceden de tres conjuntos: PCB Component Detection (HR) con 13 clases y 3.618 imagenes; PCB Bare-Board Defect Detection con 7 clases y 21.656 imagenes; y PCB Solder & Assembly Defect Detection con 9 clases y 5.209 imagenes. La curacion incluyo recuperacion de originales a resolucion completa, fusion de multiples fuentes reales, revision manual de etiquetas, eliminacion de casi duplicados y preservacion de test y validacion como fotografias reales sin alterar. No se especifican en la informacion disponible el numero de tokens ni detalles sobre RLHF/DPO (no aplicables a un detector de objetos).

## Capacidades

- Deteccion y localizacion de componentes electronicos en placas PCB (etapa de componentes, pesos en finalizacion).
- Deteccion de defectos a nivel de placa desnuda (cobre y pistas) con 7 clases.
- Deteccion de defectos de soldadura y ensamblaje con 9 clases.
- Generacion de informes combinados con detecciones ajustadas por confianza por clase e imagen anotada.
- Ejecucion independiente de cada etapa o encadenamiento de las tres en un pipeline AOI completo.
- Inferencia mediante Ultralytics YOLO con carga de pesos desde Hugging Face Hub.
- No soporta tool calling, agentes ni razonamiento multi-paso (no es un modelo de lenguaje).
- Capacidades multilingues no aplicables.

## Casos de uso

- Inspeccion automatica optica en linea de produccion: el pipeline procesa una fotografia de placa y devuelve detecciones de componentes y defectos con confianza por clase, adecuado para control de calidad en fabricacion electronica.
- Deteccion de defectos de fabricacion en placa desnuda: la etapa de placa desnuda (mAP50 0,928) permite identificar defectos de cobre y pistas antes del ensamblaje, reduciendo descartes tardios.
- Verificacion de soldadura y ensamblaje: la etapa de soldadura (mAP50 0,895) se emplea para detectar defectos de soldadura y colocacion tras el montaje de componentes.
- Auditoria de calidad con informe anotado: el pipeline genera una imagen anotada y un informe por clase, util para trazabilidad y revision humana en lotes de produccion.
- Prototipado e investigacion en vision industrial: los datasets publicados (3.618, 21.656 y 5.209 imagenes) permiten reentrenar o evaluar detectores en tareas de inspeccion PCB.
- Integracion en estaciones de inspeccion con camara: al ser modelos YOLO26 ligeros (variantes s y m), pueden desplegarse en estaciones con GPU de gama media para inferencia en tiempo casi real.
- Seleccion de etapa segun necesidad: un equipo puede usar solo la etapa de componentes o solo la de soldadura si su flujo no requiere las tres.

## Benchmarks y rendimiento

| Modelo | Tarea | Test mAP50 | Test mAP50-95 |
|---|---|---|---|
| PCB Bare-Board Defect Detection (YOLO26s) | defectos en placa desnuda | 0,928 | 0,617 |
| PCB Solder & Assembly Defect Detection (YOLO26m) | defectos de soldadura/ensamblaje | 0,895 | 0,657 |
| PCB Component Detection (YOLO26) | localizacion/clasificacion de componentes | en progreso | en progreso |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, al no tratarse de un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada; por tratarse de YOLO26 en variantes s y m, la huella es moderada, pero no se especifican cifras.
- GPU recomendadas: no disponible; las variantes s y m de YOLO suelen ejecutarse en GPU consumer, pero no se confirma en la documentacion.
- Compatibilidad con GPU consumer: no confirmada en la informacion disponible.
- Opciones de despliegue: Ultralytics (carga de pesos .pt mediante `YOLO` y `hf_hub_download`); no se documentan otras opciones como vLLM, llama.cpp, Ollama o TGI (no aplicables a vision).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PCB Inspection Suite (YOLO26s/m) | no disponible | no aplica | mAP50 0,928 / 0,895 | other (contacto para uso comercial) | Pesos .pt en Hugging Face |
| Alternativas de deteccion de defectos PCB | no disponible | no aplica | no disponible | no disponible | no disponible |

No se dispone de datos de modelos comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Licencia "other": uso restringido a investigacion y desarrollo; es necesario contactar con el autor antes de cualquier uso comercial.
- La etapa de deteccion de componentes tiene los pesos en finalizacion, por lo que el pipeline completo no esta operativo al 100 % con pesos publicados.
- Riesgo de alucinacion no aplicable (detector de objetos), pero si riesgo de falsos positivos y negativos en detecciones, mitigado parcialmente por umbrales de confianza por clase.
- Los umbrales de confianza recomendados (0,465 para placa desnuda y 0,228 para soldadura) estan calibrados para los conjuntos de test del autor; pueden requerir reajuste en dominios de imagen distintos.
- No se documentan sesgos conocidos ni limitaciones de idioma (no aplicables).
- No se especifican requisitos de hardware ni latencias, lo que dificulta la planificacion de despliegue en produccion.
- Cada dataset y modelo lleva su propio archivo de licencia con atribucion de fuentes; es necesario revisarlos individualmente.

## Enlaces

- Repositorio principal: https://huggingface.co/ParsaVictor/pcb-inspection-suite
- Dataset de componentes: https://huggingface.co/datasets/ParsaVictor/pcb-component-detection
- Dataset de placa desnuda: https://huggingface.co/datasets/ParsaVictor/pcb-bare-board-defect-detection
- Dataset de soldadura y ensamblaje: https://huggingface.co/datasets/ParsaVictor/pcb-solder-defect-detection
- Modelo de placa desnuda (YOLO26): https://huggingface.co/ParsaVictor/pcb-bare-board-defect-detection-yolo26
- Modelo de soldadura (YOLO26): https://huggingface.co/ParsaVictor/pcb-solder-defect-detection-yolo26
- Codigo fuente: https://github.com/ParsaVictor
