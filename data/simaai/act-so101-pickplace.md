# simaai/ACT-SO101-PickPlace

## Resumen
ACT-SO101-PickPlace es una política de imitación basada en ACT (Action Chunking Transformer) entrenada para una tarea concreta de robótica: colocar una goma de borrar gris en una cesta blanca con un brazo SO-101. La desarrolla simaai y se distribuye como un bundle compilado para el SiMa.ai Modalix DevKit, no como un modelo de lenguaje ni como un checkpoint entrenable. El repositorio contiene el artefacto desplegable, fixtures de referencia y activos de runtime para el robot; no incluye el checkpoint de entrenamiento ni el dataset.

La relevancia de esta ficha es acotada: no compite en benchmarks de texto, sino que ejemplifica el despliegue de políticas robóticas en hardware de borde. El bundle usa precisión BF16, predice 100 acciones para 6 articulaciones y reporta una latencia de servidor de 13,23 ms p50 en el runtime de referencia. Se entrenó con 769 demostraciones de una colección de 961 episodios, dejando 192 episodios reservados para validación.

## Especificaciones tecnicas
| Parámetro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking Transformer), política de imitación para robótica |
| Parámetros totales | no disponible |
| Longitud de contexto | no disponible; no es un modelo de lenguaje, el horizonte de predicción es de 100 acciones |
| Tipos de cuantización | BF16 en el bundle compilado; no se documentan otras precisiones |
| Idiomas soportados | no disponible; no es un modelo de lenguaje |
| Licencia | Apache-2.0 |
| Formato de pesos | ELF compilados (seis archivos), plan de ejecución, datos de normalización y fixtures; no incluye checkpoint en safetensors ni GGUF |
| Robot | SO-101 follower con seis motores STS3215 (IDs 1–6) |
| Tarea | Colocar la goma de borrar gris en la cesta blanca |
| Checkpoint de entrenamiento | Paso 100.000 |
| Salida compilada | 100 acciones × 6 articulaciones |
| Entradas | Dos cámaras USB: Logitech C920 cenital y Sonix USB2.0 CAM1 en la muñeca, 640 × 480 MJPG a 30 fps |
| Bundle ID | `act-so101-grey-eraser-pickplace-100k-bf16-1879ca7c` |
| Tamaño del repositorio | 0,1 GB |
| Librería | lerobot |

## Arquitectura y entrenamiento
ACT es una arquitectura de imitación que predice secuencias de acciones, o chunks, a partir de observaciones visuales y propioceptivas. En este caso, la política se compiló para el SiMa.ai Modalix DevKit y se distribuye como un conjunto de ELF ejecutables, un plan de ejecución y datos de normalización. La información disponible no detalla la composición exacta de la red, el número de parámetros ni el volumen total de tokens o muestras de entrenamiento más allá del número de demostraciones.

El entrenamiento se realizó con 769 demostraciones del dataset SO-101 Grey Eraser Pick-and-Place, de las cuales 192 episodios de la colección completa de 961 quedaron reservados para validación. No se documenta el uso de RLHF ni DPO, algo esperable en una política de imitación robótica. La innovación principal es el despliegue compilado en hardware de borde con precisión BF16 y latencias deterministas: 13,23 ms p50, 13,39 ms p95 y 13,45 ms p99 en el servidor de modelo del runtime de referencia.

## Capacidades
- Predicción de acciones de pick-and-place para un brazo SO-101 de seis articulaciones.
- Generación de chunks de 100 acciones consecutivas a partir de observaciones de dos cámaras.
- Ejecución de una tarea específica: colocar una goma de borrar gris en una cesta blanca.
- Inferencia compilada para el SiMa.ai Modalix DevKit con precisión BF16.
- Validación numérica mediante fixtures empaquetados, sin cámaras ni movimiento físico del robot.
- Integración con el runtime PoLiMa para despliegue, comprobación de inferencia y ejecución en robot.
- No soporta tool calling, function calling, agentes multi-paso ni razonamiento en lenguaje natural.
- No dispone de capacidades multilingües, visión general, audio ni generación de texto.

## Casos de uso
- Automatización de pick-and-place en laboratorio: el modelo puede recoger una goma de borrar y depositarla en una cesta con la geometría y la iluminación de referencia, útil para tareas repetitivas de clasificación de objetos pequeños.
- Despliegue de referencia en hardware de borde: sirve para validar la cadena de compilación y ejecución de políticas ACT en el Modalix DevKit antes de adaptar la tarea a un entorno productivo.
- Pruebas de integración de robot SO-101: permite comprobar cámaras, calibración, articulaciones y runtime PoLiMa con una política ya compilada y con fixtures de verificación numérica.
- Docencia y demostraciones de imitación robótica: el bundle facilita reproducir un flujo completo de descarga, verificación de checksums, despliegue y ejecución sin entrenar desde cero.
- Evaluación de latencia en inferencia robótica: los datos de p50, p95 y p99 permiten caracterizar el comportamiento temporal de un servidor de modelo en el acelerador de SiMa.ai.
- Recolección o replicación de experimentos: el dataset de 961 episodios y las 769 demostraciones de entrenamiento permiten estudiar variaciones de la política o comparar metodologías de imitación.
- Base para adaptaciones con fine-tuning: aunque el repositorio no incluye el checkpoint, el bundle y la documentación sirven como referencia para entrenar y compilar políticas ACT similares en otras tareas de pick-and-place.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks de lenguaje como MMLU, HumanEval o GSM8K en la información disponible. Los datos de validación proporcionados son de latencia y fidelidad numérica del bundle compilado.

| Métrica | Resultado |
|---|---|
| Latencia p50 del servidor de modelo | 13,23 ms |
| Latencia p95 del servidor de modelo | 13,39 ms |
| Latencia p99 del servidor de modelo | 13,45 ms |
| Peticiones medidas | 30, tras cinco warm-ups |
| Fidelidad en dispositivo compilado | 16 fotogramas reservados con similitud coseno ≥ 0,999 |
| Error absoluto medio normalizado | ≤ 0,01 frente a PyTorch |
| Tasa de éxito física | no registrada |
| Demostraciones de entrenamiento | 769 |
| Episodios reservados | 192 de 961 |

## Requisitos de hardware
- SiMa.ai Modalix DevKit con almacenamiento NVMe y un runtime compatible de SiMa.ai.
- PoLiMa v0.3 instalado desde el checkout de código fuente en el host de despliegue y en el DevKit.
- Host Linux o WSL en Windows con SSH, rsync y la CLI de Hugging Face.
- Brazo SO-101 follower con seis motores STS3215, montado y alimentado correctamente.
- Dos cámaras USB conectadas al DevKit y encuadradas como en la configuración de entrenamiento.
- Versiones verificadas en la release: ModelSDK 2.1.3, Neat 0.5.0 y `sima_lmm` 0.5.0.
- VRAM estimada para inferencia: no disponible; el bundle está compilado para el acelerador Modalix, no para GPU convencional.
- GPU recomendadas: no aplica; el despliegue objetivo es el Modalix DevKit.
- Compatibilidad con GPU de consumo: no disponible; no se documenta ejecución en RTX 4090 u otras GPU de consumo.
- Opciones de despliegue: `polima deploy`, `polima run` con fixtures, `polima studio` y `polima robot run`; no se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia: 13,23 ms p50, 13,39 ms p95 y 13,45 ms p99 en el servidor de modelo del runtime de referencia.
- Throughput: no disponible.

## Comparativa con modelos similares
No se han proporcionado modelos comparables con métricas en la misma tarea de pick-and-place sobre SO-101. La comparación cuantitativa con otras políticas ACT, Diffusion Policy o modelos VLA no está disponible en la información recibida.

| Categoría | Este bundle | Políticas ACT genéricas | Diffusion Policy | Modelos VLA |
|---|---|---|---|---|
| Parámetros | no disponible | no disponible | no disponible | no disponible |
| Contexto | horizonte de 100 acciones | variable | variable | instrucciones en lenguaje |
| Rendimiento | latencia de 13,23 ms p50 en Modalix | no disponible | no disponible | no disponible |
| Licencia | Apache-2.0 | variable | variable | variable |
| Disponibilidad | Hugging Face, bundle compilado | no disponible | no disponible | no disponible |

## Limitaciones y advertencias
- La política es específica para el robot, el objeto, la cesta y las vistas de cámara de referencia; cambios de geometría, encuadre, iluminación o calibración pueden alterar el comportamiento.
- No se registró una tasa de éxito física controlada; la validación numérica con fixtures no mide el éxito real de la tarea.
- El repositorio no incluye el checkpoint de entrenamiento ni el dataset, solo el bundle compilado y activos de runtime.
- No es un modelo de lenguaje: no acepta instrucciones textuales en tiempo de ejecución ni aprende comportamientos nuevos a partir de texto.
- La licencia Apache-2.0 se aplica al paquete, pero deben revisarse las licencias de componentes de terceros y del runtime PoLiMa.
- El despliegue requiere hardware Modalix y versiones concretas de ModelSDK, Neat y `sima_lmm`; no se documenta compatibilidad con otras plataformas.
- Riesgo de alucinación no aplica en el sentido de generación de texto; el riesgo equivalente es una predicción de acción incorrecta ante observaciones fuera de distribución.
- No se documentan sesgos demográficos ni lingüísticos; los sesgos relevantes serían de dominio visual y de configuración física del entorno.

## Enlaces
- [Hugging Face: simaai/ACT-SO101-PickPlace](https://huggingface.co/simaai/ACT-SO101-PickPlace)
- [Dataset: Priyakarna/SO101-GreyEraser-PickPlace](https://huggingface.co/datasets/Priyakarna/SO101-GreyEraser-PickPlace/tree/bfd7c1831092adfb0f02273e390d86bad193d419)
- [Documentación de benchmarks de PoLiMa para ACT](https://github.com/sima-neat/polima/blob/develop/docs/benchmarks.md#act)
