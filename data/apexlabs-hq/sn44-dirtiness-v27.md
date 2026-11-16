# apexlabs-hq/sn44-dirtiness-v27

## Resumen
El modelo `apexlabs-hq/sn44-dirtiness-v27` es un detector de objetos basado en ONNX, disenado para identificar condiciones de suciedad en imagenes de habitaciones. Forma parte de la infraestructura del subnet 44 (SN44) de Bittensor, donde se sirve mediante `miner.py` usando onnxruntime. Su funcion principal es detectar cinco clases de suciedad: derrames de liquido, cubos de basura, residuos, moho y manchas.

A diferencia de los modelos generativos de gran tamano, este es un modelo de vision por computador especializado y compacto, cuyo repositorio ocupa 0.0 GB (es decir, el peso es muy reducido o no esta publicado en el repo). Esta pensado para inferencia en produccion dentro de un pipeline distribuido de mineros que compiten por la calidad de deteccion.

Es relevante en el contexto de los subnets de Bittensor como ejemplo de modelos de tarea especifica (object detection) que se despliegan via ONNX para maximizar compatibilidad y rendimiento en inferencia. No se dispone de informacion sobre arquitectura base, parametros o datos de entrenamiento en la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Detector de objetos ONNX (arquitectura base no especificada) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision) |
| Tipos de cuantizacion | no disponible (formato ONNX) |
| Idiomas soportados | no disponible (modelo de vision, sin capacidades linguisticas) |
| Licencia | no disponible |
| Formato de pesos | ONNX |
| Tamano de imagen de entrada | 736 px (imgsz) |
| Clases detectadas | liquid spillage, bin, litter, mould, stain |
| Umbral de confianza global | 0.05 |
| Umbrales por clase | {0: 0.25, 1: 0.3, 2: 0.35, 3: 0.15, 4: 0.1} |
| Supresion de duplicados | [(0, 3, 0.3), (0, 4, 0.3), (3, 4, 0.3)] |
| SHA256 de pesos | 36517b26366aa527cfa0a8e8e226c19edadf791f63467a31769b84973a30c458 |

## Arquitectura y entrenamiento
No se dispone de informacion detallada sobre la arquitectura base del detector en la model card. Por el formato (ONNX) y el uso de `imgsz: 736`, es compatible con familias de detectores tipo YOLO exportados a ONNX, aunque no se confirma explicitamente. El modelo se sirve mediante `miner.py` con onnxruntime, lo que indica un diseno orientado a inferencia de baja latencia en CPU o GPU sin dependencias de frameworks de entrenamiento.

En cuanto al entrenamiento, no se especifican datos, numero de tokens, composicion del dataset ni procesos de RLHF/DPO (no aplicables a un detector). La model card unicamente documenta los hiperparametros de inferencia: umbrales de confianza por clase y reglas de supresion de duplicados entre clases relacionadas (derrame con moho, derrame con mancha, moho con mancha).

## Capacidades
- Deteccion de objetos en imagenes de habitaciones para cinco clases de suciedad: derrames de liquido, cubos de basura, residuos, moho y manchas.
- Inferencia via ONNX runtime con soporte para ejecucion en CPU y GPU.
- Umbrales de confianza ajustados por clase para reducir falsos positivos en clases dificiles (moho con umbral 0.15, manchas con 0.1).
- Supresion de duplicados entre clases visualmente solapadas (derrame/moho/mancha) con umbral 0.3.
- No soporta generacion de texto, razonamiento, codigo, matematicas, tool calling, agentes ni capacidades multilingues.
- No dispone de modo thinking, vision generativa ni audio.

## Casos de uso
- Inspeccion automatizada de limpieza en alojamientos turisticos: el detector procesa fotos de habitaciones y marca la presencia de derrames, residuos o manchas para priorizar la limpieza. Su umbral bajo en moho (0.15) permite detectar indicios tempranos.
- Control de calidad en cadenas de hotel: integrado en un pipeline de revision de imagenes enviadas por el personal, detecta cubos de basura no vaciados o manchas persistentes antes de la validacion final.
- Monitorizacion de espacios publicos (oficinas, colegios): analisis periodico de imagenes de camaras fijas para detectar acumulacion de residuos o derrames en zonas comunes.
- Verificacion post-limpieza: comparacion de imagenes antes/despues usando el detector para confirmar que las clases de suciedad ya no estan presentes.
- Entrenamiento y evaluacion de mineros en Bittensor SN44: el modelo sirve como referencia de inferencia en `miner.py` para que los participantes compitan en precision de deteccion.
- Filtrado de imagenes en datasets de limpieza: etiquetado automatico de imagenes con suciedad para construir datasets de entrenamiento de detectores mas grandes.
- Auditoria de propiedades en alquiler: revision de fotos de anuncios para detectar condiciones de suciedad no declaradas.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- VRAM estimada: no disponible; al ser un modelo ONNX de deteccion con entrada de 736 px, es probable que requiera menos de 2 GB en FP32, pero no se confirma en la informacion proporcionada.
- GPU recomendadas: no disponible; cualquier GPU con soporte CUDA para onnxruntime deberia ser suficiente, pero no se especifica.
- Compatibilidad con GPU de consumo: probablemente si (RTX 3060 o superior), aunque no confirmado.
- Opciones de despliegue: onnxruntime via `miner.py` (metodo documentado); tambien seria compatible con ONNX Runtime Server, Triton Inference Server o OpenVINO, aunque no se mencionan en la model card.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares
No disponible. No se dispone de informacion sobre modelos comparables de deteccion de suciedad en habitaciones en la documentacion proporcionada.

## Limitaciones y advertencias
- No se dispone de informacion sobre sesgos del modelo ni sobre la composicion del dataset de entrenamiento.
- Riesgo de alucinacion: en detectores de objetos se traduce en falsos positivos; los umbrales bajos (0.1 para manchas, 0.15 para moho) pueden incrementar detecciones espurias en imagenes con texturas similares.
- Limitaciones de contexto o idioma: no aplica, es un modelo de vision sin capacidades linguisticas.
- Restricciones de licencia: la licencia no esta disponible, por lo que no se puede confirmar el uso comercial. Se recomienda contactar con el autor antes de desplegarlo en produccion.
- El repositorio tiene 0.0 GB y 0 descargas, lo que sugiere que los pesos podrian no estar publicados o que el modelo es de uso interno del subnet.
- La fecha de creacion (2026-11-16) es futura respecto a la fecha actual, lo que puede indicar un error en los metadatos o un modelo planificado.
- No hay garantias de mantenimiento ni soporte por parte del autor.

## Enlaces
- Hugging Face: https://huggingface.co/apexlabs-hq/sn44-dirtiness-v27
- Modelo de referencia citado: `manako/Detect-room-dirtiness-detection` (no se proporciona URL directa en la informacion disponible)
