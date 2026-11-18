# Shaq2/kerb-rdd-nano

## Resumen

Kerb RDD Nano es un modelo de deteccion de objetos especializado en danos en la calzada, desarrollado por el autor independiente Shaq2 como parte del sistema Kerb de inspeccion de carreteras con preservacion de privacidad. Se trata de un fine-tuning del detector RF-DETR Nano de Roboflow sobre el conjunto de datos RDD2022 (etiquetado de Japon), exportado a formato ExecuTorch `.pte` con delegacion XNNPACK para inferencia en dispositivo mediante `react-native-executorch`.

El modelo resuelve un problema concreto: detectar nueve tipos de deterioro viario (grietas longitudinales, transversales, de tipo cocodrilo, baches, grietas en bloque, desenfoque de paso de cebra, desenfoque de linea blanca, tapas de alcantarilla y resaltos) directamente en el telefono, de modo que solo los recortes de las zonas danadas abandonan el dispositivo. Esta arquitectura de privacidad por diseno es relevante para aplicaciones civiles de mantenimiento de infraestructuras donde no se desea enviar imagenes completas a la nube.

Con un artefacto principal de 112 MB y una entrada fija de `[1,3,512,512]`, el modelo esta pensado para despliegue en el borde (movil), no para servidores. La licencia CC BY-SA 4.0 y el reducido numero de descargas (0 en el momento de la consulta) indican un proyecto incipiente de nicho.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RF-DETR Nano (transformer detector) exportado a ExecuTorch con XNNPACK |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, entrada fija 512x512) |
| Tipos de cuantizacion | no disponible (los artefactos publicados son `.pte` sin especificar precision; el tamano de 112 MB sugiere pesos de baja precision) |
| Idiomas soportados | no disponible (modelo de vision, sin procesamiento de lenguaje) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | ExecuTorch `.pte` (dos variantes: `kerb_rdd_nano_xnnpack.pte` 112 MB y `kerb_rdd_nano_raw.pte` 108 MB) |

## Arquitectura y entrenamiento

El modelo parte de RF-DETR Nano, un detector basado en transformer (DETR) desarrollado por Roboflow bajo licencia Apache-2.0. El fine-tuning se realizo sobre RDD2022, el conjunto multi-pais de danos en carretera de Arya et al. (IEEE Big Data 2022), usando especificamente el subconjunto de entrenamiento etiquetado de Japon. La exportacion se hizo a ExecuTorch con delegacion XNNPACK, lo que permite ejecutar el grafo en el runtime portable de ExecuTorch sin dependencias de PyTorch en el dispositivo.

Se publican dos artefactos con esquemas de salida distintos. El canonico (`kerb_rdd_nano_xnnpack.pte`, 112 MB) expone un contrato envuelto para React Native ExecuTorch: entrada `[1,3,512,512]` float32 normalizada con estadisticas ImageNet, y salidas `boxes[N,4]` en formato xyxy normalizado, `scores[N]` y `classes[N]` float32 indexadas desde 1. El alternativo (`kerb_rdd_nano_raw.pte`, 108 MB) mantiene la exportacion cruda de RF-DETR: `dets[1,300,4]` en formato cxcywh y `labels[1,300,10]` como logits, pensado para runtimes personalizados. El autor documenta hashes SHA-256 completos en `export_meta.json` y verificacion de forward pass en el runtime portable con XNNPACK.

## Capacidades

- Deteccion de objetos en imagenes de calzada con 9 clases: grieta longitudinal, grieta transversal, grieta de tipo cocodrilo, bache, grieta en bloque, desenfoque de paso de cebra, desenfoque de linea blanca, tapa de alcantarilla y resalto.
- Salida con cajas delimitadoras normalizadas, puntuaciones de confianza y etiquetas de clase en un unico forward pass.
- Inferencia en dispositivo (on-device) mediante ExecuTorch y XNNPACK, sin necesidad de GPU ni conexion a red.
- Integracion con `react-native-executorch` (version >= 0.11, API legacy basada en URI) para aplicaciones moviles React Native.
- Ejecucion en el runtime portable de ExecuTorch desde Python.
- No soporta tool calling, agentes, razonamiento multi-paso ni procesamiento de lenguaje natural.
- No dispone de capacidades multilingues ni de vision general: es un detector especializado de un unico dominio.

## Casos de uso

- Inspeccion ciudadana de carreteras: una aplicacion movil captura fotogramas de la via, el modelo detecta danos localmente y solo se envian los recortes de las zonas afectadas al servidor, preservando la privacidad de peatones y matriculas.
- Mantenimiento municipal preventivo: los operarios recorren la ciudad con el telefono y generan automaticamente un inventario georreferenciado de baches y grietas para priorizar reparaciones.
- Planificacion de rutas para vehiculos: integrado en una app de navegacion, alerta al conductor de baches y resaltos en tiempo real sin enviar video a la nube.
- Auditoria de calidad de obra publica: comparar el estado de la calzada antes y despues de una reparacion mediante detecciones automaticas de grietas y desenfoques de senalizacion.
- Aseguradoras y flotas: registro automatico del estado del firme en el momento de un siniestro o durante la operacion diaria de una flota, con evidencia visual procesada en el dispositivo.
- Investigacion en vision por computador: punto de partida para experimentos de adaptacion de dominio, dado que el autor publica las metricas por region y planea calibracion Mondrian en la fase M4.
- Despliegue en dispositivos sin conectividad: inspeccion en zonas rurales o en paises con cobertura limitada, ya que la inferencia es completamente local.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| mAP50:95 (EMA mejor, train Japon) | 0.3711 |
| mAP@50 Japon (JP) | 0.6907 |
| mAP@50 Estados Unidos (US) | 0.6388 |
| mAP@50 China MB | 0.3185 |
| mAP@50 Republica Checa (Czech) | 0.2618 |
| mAP@50 China Drone | 0.2763 |
| mAP@50 India | 0.2040 |
| mAP@50 Noruega (Norway) | 0.1443 |

Los resultados corresponden a la verificacion del autor con Kaggle v5 train y v3 export (17 de noviembre de 2026). No se han publicado comparaciones directas con otros detectores en la informacion disponible.

## Requisitos de hardware

- Inferencia en dispositivo movil (Android/iOS) mediante ExecuTorch y XNNPACK; no requiere GPU dedicada.
- Tamano de los artefactos: 112 MB (envuelto) y 108 MB (crudo), lo que condiciona el espacio de almacenamiento y la memoria de la aplicacion.
- Entrada fija `[1,3,512,512]` float32; el consumo de memoria depende de la implementacion del runtime, no especificado por el autor.
- Despliegue recomendado: `react-native-executorch` >= 0.11 (API legacy) o el runtime portable de ExecuTorch (`executorch.runtime.Runtime`).
- No se documentan latencias ni throughput concretos en la informacion disponible.
- No esta pensado para servidores con vLLM, TGI o llama.cpp; esas herramientas no aplican a un modelo de vision en formato `.pte`.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto/entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Kerb RDD Nano | Detector de danos viarios (RF-DETR Nano) | no disponible | 512x512 fija | CC BY-SA 4.0 | Hugging Face (0 descargas) |
| RF-DETR Nano (base) | Detector de objetos general | no disponible | no disponible | Apache-2.0 | Roboflow |
| YOLOv8n / YOLO11n | Detector de objetos general | ~3 M (YOLOv8n) | variable | AGPL-3.0 (Ultralytics) | Amplia |

La comparacion con detectores genericos es orientativa: Kerb RDD Nano esta especializado en un dominio concreto (danos viarios) y no compite en tareas generales de deteccion. No se dispone de datos de benchmarks comparativos directos en la informacion proporcionada.

## Limitaciones y advertencias

- Entrenado exclusivamente con carreteras de Japon; el rendimiento cae drasticamente en otros paises (mAP@50 de 0.1443 en Noruega frente a 0.6907 en Japon). El autor identifica la adaptacion por region como hito M4.
- Las puntuaciones de confianza no son probabilidades calibradas; deben tratarse como senal de ranking hasta que se implemente la calibracion Mondrian (tambien M4).
- El modelo detecta unicamente danos viarios; no es un modelo de privacidad para caras o matriculas, por lo que la preservacion de privacidad depende del diseno del sistema que lo rodea.
- Licencia CC BY-SA 4.0: cualquier obra derivada debe compartirse bajo la misma licencia, lo que puede condicionar su uso en productos propietarios.
- Proyecto muy reciente y con cero descargas en el momento de la consulta; no hay evidencia de uso en produccion ni de validacion independiente.
- No se documentan sesgos especificos, pero la dependencia del dominio japones implica un sesgo geografico claro.
- Riesgo de alucinacion inherente a los detectores: falsos positivos en superficies con texturas que se asemejen a grietas o baches, especialmente fuera del dominio de entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Shaq2/kerb-rdd-nano
- Repositorio del proyecto Kerb: https://github.com/MRSHAKILS/Kerb
- Dataset RDD2022 (RoadDamageDetector): https://github.com/sekilab/RoadDamageDetector
- Paper RDD2022: Arya et al., "RDD2022: A Multi-Country Road Damage Dataset", IEEE Big Data 2022
- RF-DETR (Roboflow, modelo base): no disponible en la informacion proporcionada
- ExecuTorch: no disponible en la informacion proporcionada
- `react-native-executorch`: no disponible en la informacion proporcionada
