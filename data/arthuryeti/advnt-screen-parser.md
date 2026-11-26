# arthuryeti/advnt-screen-parser

## Resumen

Advnt Screen Parser v3 es un detector de objetos basado en Ultralytics YOLOv11s, especializado en la localización de iconos de interfaz de usuario en capturas de pantalla de iPhone. Lo desarrolla arthuryeti y se distribuye como un export ONNX (`icons.onnx`, 38 MB) listo para inferencia en CPU, junto con el checkpoint PyTorch original (`best.pt`, 19,2 MB). Resuelve un problema muy concreto: dotar a agentes móviles de visión de un componente rápido y ligero capaz de reconocer los iconos interactivos de las principales aplicaciones sociales (Instagram, TikTok, X/Twitter, YouTube y Chrome en iOS) antes de aplicar OCR y construir un árbol geométrico de elementos.

El modelo cubre 47 clases de iconos y se entrenó sobre 4.574 capturas reales de iPhone con 24.145 cajas anotadas. Su punto fuerte es la velocidad: 30,6 ms de mediana en CPU Apple M4 Max con ONNX Runtime a dos hilos, sin GPU. Esa latencia lo hace viable en pipelines de automatización móvil donde el presupuesto de cómputo es limitado y no se puede depender de aceleradores dedicados.

La relevancia actual viene del auge de los agentes que operan interfaces gráficas (screen parsing, computer use), donde un detector de iconos específico de dominio complementa a los modelos de lenguaje multimodales y al OCR. El proyecto incluye además una librería de inferencia en GitHub con pipeline completo (RapidOCR + detector + árbol UI) bajo licencia MIT, aunque los pesos heredan la AGPL-3.0 de Ultralytics.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Ultralytics YOLOv11s (detector de objetos, CNN) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, entrada 640x640) |
| Tipos de cuantizacion | no disponible (export ONNX opset 17 sin cuantizar; PyTorch fp32) |
| Idiomas soportados | en (etiquetas de clase en inglés) |
| Licencia | AGPL-3.0 (pesos); MIT (librería de inferencia en GitHub) |
| Formato de pesos | ONNX (`icons.onnx`, 38,0 MB) y PyTorch (`best.pt`, 19,2 MB) |

## Arquitectura y entrenamiento

Se trata de un YOLOv11s de Ultralytics afinado para detección de iconos de UI. La entrada es de 640x640 con letterbox y el export ONNX simplificado usa opset 17 con tensor de entrada `1x3x640x640`. El conjunto de datos consta de 4.574 capturas reales de iPhone divididas en 4.006 de entrenamiento y 568 de validación (split determinista por hash de aproximadamente el 12 %, retenido temporalmente respecto a los benchmarks posteriores). El conjunto completo contiene 24.145 cajas de iconos.

El entrenamiento aplica aumentos conservadores para preservar la semántica direccional de los iconos: volteos horizontal y vertical desactivados (`fliplr=0.0`, `flipud=0.0`), rotación leve de 3 grados, escala 0,18, traslación 0,08, jitter HSV con s/v=0,35 y mosaic 0,3 cerrado en las últimas 8 épocas. El checkpoint `best.pt` corresponde a la época 29. No se documenta en la información disponible el uso de RLHF, DPO ni otras técnicas de alineación, algo esperable en un detector supervisado. La innovación principal es el dominio: el modelo funciona tanto sobre capturas limpias como sobre fotos de pantalla con reflejos, ligera rotación y trazos finos.

## Capacidades

- Detección de 47 clases de iconos de UI en capturas de iPhone, con cajas delimitadoras y puntuaciones de confianza.
- Reconocimiento específico por plataforma: 13 clases de Instagram, 11 de TikTok, 11 de X/Twitter, 8 de YouTube y 4 de Chrome iOS (atrás, cerrar, limpiar búsqueda, copiar enlace).
- Funcionamiento sobre capturas limpias y sobre fotografías de pantalla con reflejos, rotación leve y trazos finos.
- Inferencia en CPU sin GPU mediante ONNX Runtime, con latencia de 30,6 ms de mediana y 31,4 ms p95 en Apple M4 Max a dos hilos.
- Integración con pipeline de OCR (RapidOCR) y construcción de árbol geométrico de elementos UI en aproximadamente 185 ms en CPU.
- Uso directo con Ultralytics (`YOLO.predict`) o a través del paquete `advnt-screen-parser`.
- No soporta tool calling, agentes multi-step ni razonamiento textual: es exclusivamente un detector visual.
- Capacidad multilingüe: no disponible (las etiquetas de clase están en inglés y el modelo no procesa texto).

## Casos de uso

- Agentes móviles de automatización: el detector localiza botones de like, comentario, compartir o pestañas de navegación antes de que el agente decida la siguiente acción, con latencia de decenas de milisegundos que permite bucles de control interactivos.
- Screen parsing para RPA en iOS: combinado con RapidOCR y el árbol geométrico del paquete, se obtiene una representación estructurada de la pantalla que un orquestador puede consumir para automatizar tareas repetitivas en redes sociales.
- Testing automatizado de aplicaciones: verificar que los iconos esperados aparecen en las coordenadas correctas tras un cambio de versión, usando las 47 clases como contrato visual.
- Análisis de UX y auditoría de interfaces: detectar la presencia y disposición de elementos interactivos en capturas masivas para estudios de usabilidad o comparativas entre plataformas.
- Asistencia a personas con discapacidad visual: localizar iconos y combinarlos con OCR para describir la pantalla y guiar la interacción por voz.
- Extracción de datos de redes sociales: identificar elementos de interacción en capturas para construir datasets etiquetados o medir métricas de engagement visibles.
- Prototipado rápido en dispositivos Apple: al ejecutarse en CPU con ONNX Runtime, puede integrarse en flujos locales sin depender de servicios en la nube.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados de forma independiente) sobre el conjunto de validación retenido de 568 frames de iPhone con 2.931 cajas:

| Metrica | Valor |
|---|---|
| mAP@50 (ONNX) | 0,7811 |
| mAP@50 (PyTorch) | 0,7783 |
| mAP@50-95 (PyTorch) | 0,5345 |
| Precision (PyTorch) | 0,7519 |
| Recall (PyTorch) | 0,7900 |

Desglose por plataforma con `icons.onnx`:

| Plataforma | Clases | Cajas val | mAP@50 ONNX | Precision @0,35 | Recall @0,35 |
|---|---|---|---|---|---|
| iOS Chrome | 4 | 333 | 84,3 % | 82,9 % | 78,9 % |
| Instagram | 13 | 863 | 81,3 % | 82,4 % | 79,3 % |
| TikTok | 11 | 689 | 76,9 % | 78,9 % | 73,4 % |
| YouTube | 8 | 391 | 76,9 % | 75,8 % | 80,7 % |
| X / Twitter | 11 | 655 | 74,2 % | 73,9 % | 71,5 % |
| Global | 47 | 2.931 | 78,1 % | 78,4 % | 75,9 % |

Progresión de versiones:

| Version | Backbone | Clases | Dataset (train / val) | mAP@50 val | mAP@50-95 val | Recall |
|---|---|---|---|---|---|---|
| v1 | YOLOv11n | 15 | 1.651 (1.438 / 213) | 81,8 % | 54,1 % | 80,9 % |
| v2 | YOLOv11s | 46 | 3.828 (3.338 / 490) | 77,0 % | 52,3 % | 79,3 % |
| v3 | YOLOv11s | 47 | 4.574 (4.006 / 568) | 77,8 % | 53,5 % | 79,0 % |

## Requisitos de hardware

- VRAM estimada: no aplica en modo CPU; en GPU, un detector YOLOv11s a 640x640 requiere del orden de 1-2 GB de VRAM para inferencia en fp32, aunque el autor no publica la cifra exacta.
- GPU recomendadas: cualquiera compatible con ONNX Runtime o CUDA; el modelo está pensado para CPU y no documenta requisitos de GPU específicos.
- Cabe en GPU de consumo: sí, por tamaño (38 MB ONNX, 19,2 MB PyTorch) es trivial para cualquier GPU consumer, incluidas RTX 3060 o superiores.
- Despliegue: ONNX Runtime (probado), Ultralytics YOLO, paquete `advnt-screen-parser` con CLI, servidor FastAPI y Docker según el repositorio de GitHub. Compatibilidad con vLLM, llama.cpp, Ollama o TGI: no disponible (no son aplicables a un detector de objetos).
- Latencia: 30,6 ms de mediana y 31,4 ms p95 en CPU Apple M4 Max con ONNX Runtime a dos hilos; pipeline completo con OCR y árbol UI en aproximadamente 185 ms en CPU. Throughput no publicado.

## Comparativa con modelos similares

| Modelo | Arquitectura | Clases | Entrada | mAP@50 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Advnt Screen Parser v3 | YOLOv11s | 47 (iconos iOS) | 640x640 | 78,1 % (val propio) | AGPL-3.0 (pesos) | Hugging Face + GitHub |
| YOLOv11s genérico (Ultralytics) | YOLOv11s | 80 (COCO) | 640x640 | no disponible en esta ficha | AGPL-3.0 | Ultralytics |
| YOLOv11n (Advnt v1) | YOLOv11n | 15 (iconos iOS) | 640x640 | 81,8 % (val propio) | AGPL-3.0 | Hugging Face |

La comparación directa con detectores genéricos no es significativa porque las clases y los conjuntos de validación difieren; los datos de YOLOv11s sobre COCO no se incluyen en la información proporcionada. Frente a la versión v1, el salto de 15 a 47 clases amplía la cobertura a costa de una ligera caída de mAP@50 en el conjunto de validación propio.

## Limitaciones y advertencias

- Dominio muy restringido: solo reconoce 47 iconos de cinco aplicaciones en iOS; no generaliza a Android, a otras apps ni a iconos no vistos en entrenamiento.
- Sesgo de plataforma y de idioma: el conjunto de datos son capturas de iPhone y las etiquetas están en inglés; el rendimiento en otros dispositivos o idiomas no está evaluado.
- Riesgo de falsos positivos y negativos: la precisión global es del 78,4 % y el recall del 75,9 % a umbral 0,35, con plataformas como X/Twitter por debajo del 75 % de mAP@50.
- Métricas no verificadas: todos los resultados son declarados por el autor y marcados como `verified: false`; no hay evaluación independiente.
- Licencia AGPL-3.0 en los pesos: el uso comercial en productos propietarios exige cumplir las obligaciones de la AGPL, lo que puede ser incompatible con despliegues cerrados. La librería de GitHub es MIT, pero los pesos no.
- Dependencia de la calidad de la captura: aunque tolera reflejos y rotación leve, no se documenta comportamiento con oclusiones severas, fondos oscuros o pantallas rotas.
- No es un modelo de lenguaje: no razona, no genera texto y no soporta tool calling; debe combinarse con OCR y lógica externa para tareas complejas.
- Repositorio con cero descargas y cero likes en el momento de la consulta: ecosistema y soporte comunitario limitados.

## Enlaces

- Hugging Face: https://huggingface.co/arthuryeti/advnt-screen-parser
- Repositorio GitHub (parser completo, CLI, FastAPI, Docker): https://github.com/arthuryeti/advnt-screen-parser
- Modelo base: https://huggingface.co/Ultralytics/YOLO11
