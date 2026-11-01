# persuasivepost/roadpulse-pothole-classifier

## Resumen

RoadPulse pothole classifier es un modelo de clasificación de imágenes binario (normal / bache) desarrollado por el usuario persuasivepost como parte de un proyecto de fin de curso de la asignatura *iOS Application Development using SwiftUI*. Se trata de un MobileNetV3-Small afinado completamente sobre un conjunto de datos público de carreteras y exportado a Core ML para ejecutarse íntegramente en el dispositivo en una aplicación iOS 17+ llamada RoadPulse, que fotografiar el firme, clasifica el peligro, lo geolocaliza y lo representa en un mapa.

El modelo resuelve un problema muy acotado: distinguir entre una imagen de calzada en estado normal y una imagen que contiene un bache, con el objetivo de asistir al usuario en la generación de reportes de incidencias viales. No detecta grietas, charcos ni escombros; esas categorías las selecciona el usuario manualmente en la aplicación. El modelo ocupa 3,1 MB, acepta entradas de 224×224 RGB y funciona completamente offline.

Su relevancia es fundamentalmente práctica y docente: demuestra un flujo completo de entrenamiento, conversión a Core ML e integración en una app SwiftUI con pruebas de integración continuas en el simulador de iOS. No está pensado como un componente de seguridad vial ni como un modelo de propósito general, y así lo declara explícitamente el autor.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MobileNetV3-Small (pesos ImageNet, cabeza clasificadora sustituida por 2 salidas, fine-tune completo) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, entrada 224×224 RGB) |
| Tipos de cuantización | no disponible (el artefacto distribuido es un `.mlpackage` de Core ML de 3,1 MB; no se documentan variantes cuantizadas) |
| Idiomas soportados | no aplica (clasificación de imágenes; etiquetas `normal` y `pothole`) |
| Licencia | MIT |
| Formato de pesos | Core ML `RoadClassifier.mlpackage` y checkpoint PyTorch `best.pt` |

## Arquitectura y entrenamiento

El modelo es un MobileNetV3-Small preentrenado en ImageNet al que se le reemplaza la cabeza clasificadora por una capa de dos salidas (`normal`, `pothole`) y se somete a un fine-tune completo. La entrada es de 224×224 RGB con normalización ImageNet (media 0.485, 0.456, 0.406 y desviación estándar única de 0.226, la expresable mediante `scale`/`bias` del `ImageType` de Core ML). En Vision debe usarse `imageCropAndScaleOption = .scaleFill` para replicar el redimensionado de entrenamiento.

El entrenamiento consistió en 20 épocas, batch de 64, optimizador AdamW con learning rate 0.001, scheduler coseno, precisión mixta (AMP) y entropía cruzada ponderada por clase con label smoothing 0.05. Se completó en 1,2 minutos sobre una RTX 3050 Ti y la mejor época se seleccionó por precisión de validación. Los datos provienen de cuatro conjuntos públicos de Hugging Face: `taroii/pothole-detection` (437 imágenes), `Arpitraj01/Pothole_classification` (386), `rupesh002/pothole-detection-dataset` (715) y `kauevestena/deep_pavements_surface_patches` (600). El split es 80/10/10 estratificado por fuente y clase, agrupando copias aumentadas para que nunca crucen entre particiones: 1717 imágenes de entrenamiento, 210 de validación y 211 de test. Como mitigación de atajos de fuente se aplican aumentos aleatorios de escala de grises y desenfoque.

## Capacidades

- Clasificación binaria de imágenes de calzada en dos clases: `normal` y `pothole`.
- Salida de etiqueta (`classLabel`) y distribución de probabilidad (`classLabel_probs`) compatible con `VNClassificationObservation` de Vision.
- Inferencia completamente offline en el dispositivo, sin llamadas a red ni dependencias de servidor.
- Integración nativa con Core ML y Vision en iOS 17+; el paquete se compila a `.mlmodelc` dentro del target de Xcode.
- Uso de la confianza para preasignar severidad en la app: ≥ 0.95 → 5, ≥ 0.85 → 4, ≥ 0.70 → 3, en otro caso 2.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, texto, audio ni otras modalidades.

## Casos de uso

- **Reporte ciudadano de baches desde el móvil**: el usuario fotografía el firme, el modelo clasifica en el dispositivo y la app geolocaliza la incidencia y la muestra en un mapa. Es adecuado por su tamaño (3,1 MB) y su inferencia offline, que evita subir imágenes a un servidor.
- **Aplicaciones de navegación y asistencia al conductor**: integrado en un pipeline de captura de cámara, puede marcar fotogramas con probabilidad alta de bache para que el conductor confirme el aviso. La latencia es la de MobileNetV3-Small en Neural Engine o GPU del iPhone.
- **Mantenimiento de flotas y vehículos de reparto**: los conductores pueden preclasificar imágenes de calzada durante la ruta y priorizar inspecciones; el modelo sirve como filtro previo antes de la revisión humana.
- **Herramientas de auditoría de infraestructura con revisión humana**: como clasificador de primera pasada sobre lotes de fotos georreferenciadas, con confirmación manual obligatoria tal como exige el autor.
- **Prototipado académico de visión en iOS**: el repositorio incluye `download_data.py`, `train.py` y `convert.py`, lo que lo convierte en una plantilla reproducible para enseñar el ciclo completo de fine-tune, conversión a Core ML y pruebas en simulador.
- **Pruebas de integración en CI para apps de visión**: el proyecto ejecuta el modelo en el simulador de iOS en cada push (GitHub Actions, Xcode 16.4) verificando tres fotos de bache con ≥ 80 % de confianza y dos de calzada normal; sirve como ejemplo de test de regresión de un modelo embebido.
- **Filtro previo en aplicaciones de crowdsourcing vial**: descartar imágenes que no contienen baches antes de enviarlas a un revisor o a un modelo mayor, reduciendo coste de anotación y tráfico.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente por un tercero):

| Métrica | Valor |
|---|---|
| Test accuracy (211 imágenes reservadas) | 96,7 % |
| Objetivo declarado | ≥ 88 % |

Matriz de confusión en test (filas = real, columnas = predicho):

| | normal | pothole |
|---|---|---|
| **normal** | 83 | 1 |
| **pothole** | 6 | 121 |

| Clase | Precisión | Recall | Soporte |
|---|---|---|---|
| normal | 93,3 % | 98,8 % | 84 |
| pothole | 99,2 % | 95,3 % | 127 |

Precisión en test por fuente y clase:

| Fuente / clase | Correctas | Total | Precisión |
|---|---|---|---|
| arpit/normal | 5 | 5 | 100,0 % |
| arpit/pothole | 34 | 34 | 100,0 % |
| pave/normal | 59 | 60 | 98,3 % |
| rupesh/pothole | 68 | 68 | 100,0 % |
| taroii/normal | 19 | 19 | 100,0 % |
| taroii/pothole | 19 | 25 | 76,0 % |

## Requisitos de hardware

- **Inferencia en dispositivo**: iPhone o iPad con iOS 17 o superior; el modelo de 3,1 MB se ejecuta en CPU, GPU o Neural Engine a través de Core ML.
- **VRAM estimada**: no aplica en el caso de uso previsto (inferencia en móvil). Para reconversión o reentrenamiento en escritorio, el checkpoint `best.pt` de MobileNetV3-Small es muy ligero; el autor lo entrenó en una RTX 3050 Ti en 1,2 minutos, lo que da una idea del orden de magnitud.
- **GPU recomendadas**: cualquier GPU consumer reciente sirve para reentrenar; para servir el modelo en servidor no es un escenario documentado.
- **Cabe en GPU consumer**: sí, con holgura, para entrenamiento y reconversión; para despliegue en servidor no hay datos publicados.
- **Opciones de despliegue**: Core ML + Vision en iOS (escenario documentado). No se documentan despliegues con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- **Latencia y throughput**: no disponibles. El autor solo indica que la petición se ejecuta fuera del hilo principal en `Services/ClassifierService.swift`.

## Comparativa con modelos similares

| Modelo | Arquitectura | Tamaño | Clases | Licencia | Formato | Precisión declarada |
|---|---|---|---|---|---|---|
| RoadPulse pothole classifier | MobileNetV3-Small fine-tune | 3,1 MB | 2 (normal, pothole) | MIT | Core ML + PyTorch | 96,7 % en 211 imágenes |
| MobileNetV3-Small (ImageNet) | MobileNetV3-Small | ~10 MB (1000 clases) | 1000 | Apache 2.0 (según pesos originales) | varios | no aplica a baches |
| Otros clasificadores de baches en Hugging Face | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre modelos comparables específicos de clasificación de baches con la que contrastar parámetros, contexto o rendimiento; los datos de esta ficha proceden únicamente de la model card del autor.

## Limitaciones y advertencias

- **Solo dos clases**: no detecta grietas, charcos, escombros ni otros deterioros; esas categorías las elige el usuario en la app. El autor indica que no encontró un conjunto adecuado de grietas en primer plano.
- **Sesgo de fuente**: cada conjunto de datos está sesgado (`rupesh` es solo baches y en escala de grises, `pave` es solo calzada normal y de baja resolución), por lo que el modelo puede aprender parcialmente la fuente. El aumento aleatorio de escala de grises y desenfoque mitiga, pero no elimina, este atajo; las filas in-domain (`taroii/*`, `arpit/*`) son la señal más fiable.
- **Generalización geográfica limitada**: los datos son pequeños (~2 000 imágenes) y mayoritariamente de carreteras europeas y asiáticas; se espera menor precisión en condiciones como el monzón de Bombay. El autor recomienda probar con fotos propias antes de confiar en el modelo.
- **Clase `normal` heterogénea**: incluye escenas amplias de calle y parches de pavimento plano, no solo primeros planos, lo que puede afectar a la calibración en dominios distintos.
- **No apto para decisiones de seguridad**: el autor lo declara explícitamente inadecuado para decisiones críticas de seguridad; siempre debe haber confirmación humana del reporte.
- **Riesgo de alucinación**: como todo clasificador, puede asignar alta confianza a imágenes fuera de distribución; la app usa la confianza para preasignar severidad, lo que amplifica el impacto de un falso positivo.
- **Licencia**: MIT, permisiva para uso comercial, pero el autor no ofrece garantías ni soporte; conviene revisar las licencias de los conjuntos de datos de origen (varias son MIT, otras no se detallan en la información disponible).
- **Contexto de proyecto**: es un proyecto de estudiante de una asignatura de Honours; no hay mantenimiento ni versionado documentado más allá de la fecha de creación (2026-11-01).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/persuasivepost/roadpulse-pothole-classifier
- Repositorio GitHub de la app RoadPulse: https://github.com/PersuasivePost/RoadPulse
- Código de entrenamiento (`ml/`): https://github.com/PersuasivePost/RoadPulse/tree/main/ml
- Dataset `taroii/pothole-detection`: https://huggingface.co/datasets/taroii/pothole-detection
- Dataset `Arpitraj01/Pothole_classification`: https://huggingface.co/datasets/Arpitraj01/Pothole_classification
- Dataset `rupesh002/pothole-detection-dataset`: https://huggingface.co/datasets/rupesh002/pothole-detection-dataset
- Dataset `kauevestena/deep_pavements_surface_patches`: https://huggingface.co/datasets/kauevestena/deep_pavements_surface_patches
