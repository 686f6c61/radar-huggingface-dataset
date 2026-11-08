# Civimatica/blue-marble-ships

## Resumen

Blue Marble Ships es un modelo de deteccion de objetos publicado por Civimatica en Hugging Face, orientado a la identificacion de buques en imagenes de observacion de la Tierra. El repositorio se distribuye en formato ONNX y safetensors, con etiquetas que apuntan explicitamente a teledeteccion, Sentinel-2, edge AI y cuantizacion INT8, lo que sugiere un diseno pensado para inferencia eficiente en entornos con recursos limitados. La tarea declarada en el pipeline es object-detection.

El modelo se enmarca en la linea de producto de Civimatica, una empresa que comercializa modelos de IA para espacio urbano y sensores fisicos. Aunque su catalogo publico se centra en calles, bordillos y movilidad, este repositorio concreto aborda el dominio maritimo-portuario a partir de imagenes satelitales. El identificador "blue-marble" remite a la imagen iconica de la Tierra y refuerza el caracter de observacion planetaria del modelo.

La relevancia actual del modelo radica en la combinacion de tres factores: la demanda creciente de monitorizacion maritima automatizada (trafico portuario, pesca ilegal, vigilancia de fronteras), la disponibilidad de constelaciones Sentinel con cobertura abierta y la necesidad de desplegar deteccion en el borde (edge AI) para reducir costes de transmision y latencia. No obstante, la informacion publica disponible es muy escasa: no se detallan parametros, contexto, datos de entrenamiento ni resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de deteccion de objetos; probablemente CNN o detector tipo YOLO/SSD, sin confirmar) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no aplica (modelo de vision, no de lenguaje) |
| Tipos de cuantizacion | INT8 (segun etiquetas del repositorio) |
| Idiomas soportados | no disponible (modelo de vision; no procesa texto) |
| Licencia | Apache 2.0 (segun etiqueta `license:apache-2.0` del repositorio) |
| Formato de pesos | ONNX y safetensors |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura interna del modelo. Por la tarea declarada (object-detection) y el dominio (Sentinel-2, teledeteccion), cabe esperar un detector convolutional o un transformer de vision adaptado a imagenes multiespectrales o RGB de satelite, pero no hay confirmacion en la informacion disponible. Tampoco se especifican el numero de parametros, la resolucion de entrada, el numero de clases ni el esquema de anclas o cabeceras de deteccion.

Respecto al entrenamiento, no se detallan el volumen de datos, la composicion del dataset, las fuentes de anotacion ni si se aplicaron tecnicas de aumento de datos o ajuste fino. La presencia de pesos en safetensors y ONNX, junto con la etiqueta INT8, sugiere que el modelo se ha exportado para despliegue en produccion, posiblemente con cuantizacion post-entrenamiento para reducir el coste computacional en dispositivos de borde. No hay informacion sobre innovaciones tecnicas como decodificacion especulativa, atencion lineal o modulos especificos de deteccion.

## Capacidades

- Deteccion de objetos en imagenes de satelite, especificamente buques, segun el nombre del modelo y las etiquetas del repositorio.
- Procesamiento de imagenes de Sentinel-2, segun las etiquetas `sentinel-2` y `remote-sensing`.
- Inferencia en el borde (edge AI), gracias a la cuantizacion INT8 y al formato ONNX.
- Exportacion a ONNX y safetensors, lo que facilita su integracion en pipelines de inferencia en distintos runtimes.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, texto, audio ni vision general; el modelo es exclusivamente de deteccion visual.
- Capacidades multilingues: no aplica (modelo de vision sin componente textual).

## Casos de uso

- Monitorizacion de trafico maritimo en puertos: el modelo puede detectar buques en imagenes Sentinel-2 para estimar ocupacion de atraques, colas de espera y densidad de trafico, aprovechando la cobertura abierta de la constelacion europea.
- Vigilancia de pesca ilegal no declarada: al detectar embarcaciones en zonas protegidas o en aguas de jurisdiccion restringida, permite generar alertas tempranas para agencias de control pesquero.
- Seguridad y defensa maritima: integrado en sistemas de vigilancia costera, puede complementar datos AIS para identificar buques que no emiten senal o que operan en zonas sensibles.
- Monitorizacion medioambiental: deteccion de buques asociados a vertidos o actividades contaminantes en areas marinas protegidas, como apoyo a la inspeccion visual humana.
- Despliegue en dispositivos de borde a bordo de satelites o estaciones costeras: la cuantizacion INT8 y el formato ONNX permiten ejecutar la inferencia en hardware de bajo consumo, reduciendo el ancho de banda necesario para transmitir imagenes completas.
- Analitica para aseguradoras y operadores logisticos: estimacion de actividad portuaria y flujos de mercancias a partir de series temporales de detecciones, como indicador economico alternativo.
- Investigacion academica en teledeteccion: el modelo puede servir como linea base o componente de comparacion en estudios sobre deteccion de objetos en imagenes satelitales, dado que su licencia Apache 2.0 permite uso y modificacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible, al no conocerse el numero de parametros ni la resolucion de entrada.
- GPU recomendadas: no disponible. Por el enfoque edge AI e INT8, es plausible que funcione en GPUs de gama baja o aceleradores embebidos, pero no hay datos que lo confirmen.
- Compatibilidad con GPU de consumo: no confirmada; la cuantizacion INT8 y el formato ONNX apuntan a que podria ejecutarse en GPUs de consumo, pero se desconoce el requisito minimo.
- Opciones de despliegue: al distribuirse en ONNX, es compatible con ONNX Runtime, TensorRT y otros runtimes de inferencia. No se menciona soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo de vision de este tipo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento ni de especificaciones internas del modelo, por lo que no es posible establecer una comparativa cuantitativa fiable con alternativas como YOLOv8, DETR o detectores especificos de teledeteccion. La comparativa queda pendiente de la publicacion de la model card y de resultados de evaluacion.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Blue Marble Ships | no disponible | no aplica | Apache 2.0 | Hugging Face (ONNX, safetensors) |
| Alternativas de deteccion en teledeteccion | no disponible | no aplica | variable | no disponible |

## Limitaciones y advertencias

- Ausencia de model card detallada: no se documentan arquitectura, datos de entrenamiento, metricas ni limitaciones conocidas, lo que dificulta evaluar su idoneidad para produccion.
- Riesgo de falsos positivos y negativos: sin benchmarks publicados, se desconoce la precision y el recall del detector en distintos escenarios (puertos densos, mar abierto, condiciones nubosas).
- Sesgo de dominio: al estar entrenado presumiblemente con imagenes Sentinel-2, su rendimiento puede degradarse con otras fuentes satelitales, resoluciones o condiciones atmosfericas no representadas.
- Dependencia de la resolucion: la deteccion de buques pequenos en Sentinel-2 (10 m/pixel en bandas visibles) es intrinsecamente limitada; embarcaciones de menor eslora pueden no ser detectables.
- Licencia: la etiqueta del repositorio indica Apache 2.0, lo que permite uso comercial, pero conviene verificar los terminos exactos en el repositorio antes de desplegarlo en produccion.
- Sin soporte de texto ni razonamiento: no debe emplearse para tareas de lenguaje, agentes o analisis multimodal mas alla de la deteccion visual.
- Repositorio sin descargas ni interacciones: no hay evidencia de validacion por parte de la comunidad, lo que incrementa el riesgo de adoptarlo sin evaluacion propia.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Civimatica/blue-marble-ships
- Sitio web de Civimatica: https://www.civimatica.com/
- Pagina de modelos de Civimatica: https://www.civimatica.com/models
