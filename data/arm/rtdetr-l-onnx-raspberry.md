# Arm/rtdetr-l-onnx-raspberry

## Resumen

RT-DETR-L optimizado por Arm es una versión cuantizada y exportada a ONNX del detector de objetos en tiempo real RT-DETR-L, desarrollado originalmente por Ultralytics. El modelo combina un backbone convolucional con un encoder-decoder transformer y predice un conjunto fijo de 300 consultas de objeto sin necesidad de supresión de no máximos (NMS), lo que simplifica el postprocesado en pipelines de producción. Esta variante está específicamente adaptada para sistemas Edge Linux con CPU Arm, con el objetivo de reducir latencia, tamaño y consumo de memoria en dispositivos con recursos limitados.

La relevancia de esta ficha radica en que demuestra un flujo completo de conversión y cuantización híbrida (PTQ) sobre un detector transformer, manteniendo una precisión prácticamente idéntica al modelo original (una caída de 0,17 puntos porcentuales en mAP@0.5:0.95) mientras reduce el tamaño del artefacto 3,28 veces y acelera la inferencia 2,65 veces en una Raspberry Pi 5. Es un caso representativo de despliegue de visión por computador en el borde, donde el hardware no dispone de GPU dedicada.

El modelo se distribuye como un único archivo `.onnx` de 38,422 MB, acompañado de un ejemplo de inferencia en Python, un contrato de entrada/salida en `config.yaml` y registros de benchmarks. No se proporcionan datos sobre arquitectura interna detallada, número de parámetros ni longitud de contexto, ya que se trata de un modelo de detección de objetos y no de un modelo generativo de lenguaje.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RT-DETR-L: backbone convolucional + encoder-decoder transformer, 300 consultas de objeto, sin NMS |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de deteccion de objetos) |
| Tipos de cuantizacion | INT8 hibrida: convoluciones estaticas per-channel simetricas (backbone y neck), matmuls transformer dinamicas INT8, nueve componentes en FP32 |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | AGPL-3.0 |
| Formato de pesos | ONNX (`.onnx`) |

## Arquitectura y entrenamiento

RT-DETR-L es un detector end-to-end que sustituye el postprocesado clásico de NMS por un mecanismo de consultas aprendidas: el modelo predice directamente 300 objetos mediante un decoder transformer, lo que elimina la necesidad de filtrar duplicados y simplifica la integración en sistemas embebidos. La arquitectura combina un backbone convolucional (con extracción de características multiescala) con un encoder transformer que modela relaciones globales y un decoder que refina las consultas.

Arm no ha reentrenado el modelo: ha partido del RT-DETR-L de Ultralytics y ha aplicado un proceso de exportación a ONNX y cuantización post-entrenamiento (PTQ) híbrida. Las convoluciones del backbone y el neck se cuantizan estáticamente per-channel con calibración sobre 64 imágenes aleatorias de COCO 2017, mientras que las multiplicaciones matriciales del transformer usan cuantización dinámica INT8. Nueve componentes críticos (cabezas de predicción, muestreo de atención deformable y la primera convolución del stem) se mantienen en FP32 para preservar la precisión. La inferencia se ejecuta con ONNX Runtime 1.27.0 usando el execution provider de CPU con las bibliotecas MLAS y KleidiAI, optimizadas para Arm.

## Capacidades

- Detección de objetos en imágenes: salida de cajas delimitadoras y clases para hasta 300 objetos por imagen, sin postprocesado NMS.
- Inferencia end-to-end en CPU Arm: ejecutable en dispositivos Edge Linux sin acelerador gráfico.
- Precisión mixta INT8/FP32: mantiene la precisión del modelo original con una caída inferior a 0,25 puntos porcentuales en las métricas evaluadas.
- Integración con ONNX Runtime: compatible con el ecosistema de herramientas de ONNX y con el execution provider de CPU.
- Ejecución en lote de tamaño 1: configuración de referencia optimizada para latencia en dispositivos embebidos.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües, al no ser un modelo de lenguaje.

## Casos de uso

- Vigilancia y videovigilancia en el borde: el modelo puede procesar fotogramas en una Raspberry Pi 5 a 1,48 FPS, suficiente para aplicaciones de detección de intrusiones o conteo de personas donde no se requiere tiempo real estricto pero sí bajo consumo y privacidad local.
- Automatización industrial y control de calidad: integrado en una línea de producción con cámaras y una CPU Arm, detecta defectos o piezas fuera de posición sin depender de conectividad a la nube, con una latencia p50 de 673 ms por imagen.
- Robótica móvil y drones de bajo consumo: al ocupar 38,4 MB y requerir 390 MB de memoria pico, cabe en sistemas con RAM limitada y permite detección de obstáculos o seguimiento de objetos a bordo.
- Análisis de imágenes en dispositivos IoT: sensores con cámara que envían solo metadatos de detección en lugar de imágenes completas, reduciendo ancho de banda y cumpliendo requisitos de privacidad.
- Prototipado rápido en entornos Arm: el ejemplo `example.py` y el `config.yaml` permiten validar el pipeline de inferencia en pocos minutos antes de escalar a hardware de producción.
- Aplicaciones de conteo y aforo en comercio minorista: detección de personas u objetos en cámaras fijas con hardware de bajo coste, donde la precisión de mAP@0.5 del 69,44 % es adecuada para estimaciones agregadas.
- Educación e investigación en visión embebida: sirve como referencia reproducible de cuantización híbrida y despliegue ONNX en Arm, con benchmarks y configuración documentados.

## Benchmarks y rendimiento

Resultados de precisión sobre COCO 2017 val2017 (5000 muestras):

| Metrica | Original | Arm-optimizado | Cambio |
|---|---:|---:|---:|
| mAP@0.5:0.95 (%) | 50,92 | 50,75 | -0,17 pp |
| mAP@0.5 (%) | 69,63 | 69,44 | -0,19 pp |
| mAP@0.75 (%) | 54,76 | 54,53 | -0,23 pp |

Resultados de rendimiento en Raspberry Pi 5 (Cortex-A76, 4 núcleos, arm64, ONNX Runtime 1.27.0, batch 1, 5000 ejecuciones):

| Metrica | Original | Arm-optimizado | Mejora |
|---|---:|---:|---:|
| Tamano del modelo (MB) | 125,845 | 38,422 | 3,28x menor |
| Latencia p50 (ms) | 1782,475 | 673,121 | 2,65x mas rapido |
| Latencia p90 (ms) | 1805,594 | 692,716 | 2,61x mas rapido |
| Latencia p99 (ms) | 1811,622 | 702,155 | 2,58x mas rapido |
| Fotogramas por segundo | 0,56 | 1,48 | 2,64x |
| Memoria pico (MB) | 540,14 | 390,45 | 1,38x menos |
| Memoria media (MB) | 447,11 | 294,78 | 1,52x menos |

## Requisitos de hardware

- VRAM: no aplica; el modelo está diseñado para inferencia en CPU. La memoria de sistema necesaria es de aproximadamente 390 MB en pico y 295 MB de media durante la inferencia.
- GPU recomendadas: no se especifican; el modelo está optimizado para CPU Arm con MLAS y KleidiAI. Podría ejecutarse en GPU mediante ONNX Runtime con otros execution providers, pero no se han publicado datos al respecto.
- Cabe en GPU de consumo: no hay datos publicados. El tamaño de 38,4 MB sugiere que cabría en cualquier GPU con más de 1 GB de VRAM, pero no se ha validado.
- Dispositivos de referencia: Raspberry Pi 5 (Cortex-A76, 4 núcleos, arm64, Linux) con ONNX Runtime 1.27.0.
- Opciones de despliegue: ONNX Runtime con CPU execution provider (MLAS, KleidiAI). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: p50 de 673 ms, p90 de 693 ms, p99 de 702 ms, 1,48 FPS en la configuración de referencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | mAP@0.5:0.95 (COCO) | Licencia | Formato |
|---|---|---|---|---|---|
| Arm/rtdetr-l-onnx-raspberry | no disponible | no aplica | 50,75 % | AGPL-3.0 | ONNX |
| RT-DETR-L original (Ultralytics) | no disponible | no aplica | 50,92 % | AGPL-3.0 | PyTorch |
| YOLOv8-L | no disponible | no aplica | no disponible en la informacion | AGPL-3.0 | PyTorch, ONNX |
| YOLOv10-L | no disponible | no aplica | no disponible en la informacion | AGPL-3.0 | PyTorch, ONNX |

No se dispone de datos de benchmarks de YOLOv8-L ni YOLOv10-L en la información proporcionada, por lo que la comparación cuantitativa completa no está disponible. La comparación más directa y verificable es con el RT-DETR-L original, del que este modelo es una conversión cuantizada.

## Limitaciones y advertencias

- Licencia AGPL-3.0: el uso comercial en productos propietarios requiere cumplir con las obligaciones de la AGPL, lo que puede implicar la publicación del código fuente de la aplicación que lo integra. Es imprescindible revisar la licencia antes de usarlo en producción.
- Precisión ligeramente inferior al original: la cuantización introduce una pérdida de hasta 0,23 puntos porcentuales en mAP@0.75, aceptable en muchos casos pero no despreciable en aplicaciones críticas.
- Calibración limitada: la cuantización estática se calibró con solo 64 imágenes aleatorias de COCO 2017; dominios muy distintos (imágenes médicas, satelitales, infrarrojas) pueden degradar la precisión de forma significativa.
- Rendimiento medido en un único dispositivo: los resultados de latencia y memoria corresponden a una Raspberry Pi 5 con Cortex-A76; otros SoC Arm pueden ofrecer cifras distintas.
- Throughput bajo: 1,48 FPS limita su uso a aplicaciones que no requieren tiempo real estricto o que procesan imágenes de forma intermitente.
- Sin datos sobre sesgos: no se ha publicado un análisis de sesgos por clase, género, etnia u otros atributos, algo relevante en aplicaciones de vigilancia.
- Riesgo de alucinación: en detección de objetos se traduce en falsos positivos y falsos negativos; el modelo puede detectar objetos inexistentes o omitir objetos pequeños o parcialmente ocultos.
- Reentrenamiento no soportado directamente: al ser un artefacto ONNX cuantizado, no es adecuado para fine-tuning; para adaptarlo a un dominio específico habría que partir del modelo original en PyTorch.
- Sin soporte de idiomas ni texto: no es un modelo de lenguaje, por lo que no puede procesar instrucciones en lenguaje natural ni generar descripciones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Arm/rtdetr-l-onnx-raspberry
- Modelo original RT-DETR de Ultralytics: https://docs.ultralytics.com/models/rtdetr
- Repositorio de Ultralytics: https://github.com/ultralytics/ultralytics
- Licencia AGPL-3.0: https://www.gnu.org/licenses/agpl-3.0.en.html
- Documentación de ONNX Runtime: https://onnxruntime.ai/docs/
- Repositorio de ONNX Runtime: https://github.com/microsoft/onnxruntime
