# brishen/iron-sapiens2-pose-0.4b-npu2

## Resumen

Iron Sapiens2-Pose 0.4B NPU2 es una exportacion del modelo de estimacion de pose `facebook/sapiens2-pose-0.4b` de Meta, compilada especificamente para las NPU de AMD Ryzen AI de segunda generacion. El paquete lo publica el usuario `brishen` e incluye los kernels NPU ya compilados (archivos `.xclbin` mas flujos de instrucciones) y los pesos empaquetados que el runtime en Rust `taconite-sapiens2` ejecuta sobre XRT o directamente sobre el driver `amdxdna`.

El modelo realiza deteccion de puntos clave (keypoint detection) en modo top-down: se le entrega la caja delimitadora de cada persona en formato COCO (`x,y,w,h`, procedente de un detector de personas) y devuelve 308 puntos clave de cuerpo completo (cuerpo y pies, manos y cara) en coordenadas de imagen, junto con las puntuaciones de sus mapas de calor. Esta pensado para ejecutarse en hardware de portatil y mini-PC con NPU integrada, no en GPU dedicada.

Su relevancia practica reside en que traslada un modelo de vision humano de Meta al ecosistema NPU de AMD sin depender de CUDA ni de aceleradores graficos dedicados, con una validacion declarada de coseno de mapas de calor entre 0,9993 y 0,9996 frente al modelo float32 original. Los kernels solo cargan en NPU2 (AIE2P: Strix Point, Strix Halo y Krackan); no son compatibles con NPU1 (Phoenix, Hawk Point).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de vision para estimacion de pose (familia Sapiens2); especificaciones detalladas no disponibles en la informacion proporcionada |
| Parametros totales | Aproximadamente 0,4 mil millones (0.4B), segun el nombre del modelo base |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo de vision; la entrada es una imagen mas una caja de persona) |
| Tipos de cuantizacion | No disponible; los pesos se distribuyen empaquetados para el runtime NPU, no en cuantizaciones tipo GGUF/AWQ. La referencia de validacion es el modelo float32 |
| Idiomas soportados | No aplica (modelo de vision, no procesa texto) |
| Licencia | Sapiens2 License (upstream, `other`); permite redistribucion adjuntando la licencia y prohibe, entre otros usos, la vigilancia y el procesamiento biometrico |
| Formato de pesos | Kernels NPU compilados (`.xclbin` + flujos de instrucciones) y pesos empaquetados para el runtime Rust `taconite-sapiens2`; no usa safetensors ni GGUF |

Otros datos tecnicos: 23 archivos, 732,9 MB en total (tamano del repo 0,8 GB). Commit de IRON: `08a5e90`. Subido el 2026-10-06.

## Arquitectura y entrenamiento

La informacion proporcionada no incluye detalles sobre la arquitectura interna ni sobre el entrenamiento del modelo base `facebook/sapiens2-pose-0.4b`. Se sabe que pertenece a la familia Sapiens2 de Meta para vision centrada en personas y que la tarea es estimacion de pose top-down con 308 puntos clave (terminologia atribuida a "Sociopticon": cuerpo y pies, manos y cara). Los parametros serian del orden de 0,4B.

En cuanto a la exportacion, el aporte tecnico de este repositorio no es el entrenamiento sino la compilacion para NPU: los kernels se compilan para NPU2 (AIE2P: Strix Point, Strix Halo, Krackan) y se ejecutan mediante el runtime Rust `taconite-sapiens2`, disponible en crates.io y con soporte tanto para XRT como para el driver `amdxdna` en modo directo. El paquete se genera con la herramienta IRON, en concreto con la ruta `iron/applications/sapiens2_pose`. No se documentan en la informacion disponible datos sobre volumen de tokens de entrenamiento, composicion del dataset ni tecnicas de alineacion (RLHF/DPO), que ademas no aplican del mismo modo a un modelo de vision de este tipo.

## Capacidades

- Deteccion de puntos clave de cuerpo completo: devuelve 308 keypoints (cuerpo y pies, manos y cara) en coordenadas de imagen.
- Estimacion de pose top-down: requiere como entrada la caja delimitadora de la persona (COCO `x,y,w,h`), normalmente generada por un detector de personas previo.
- Salida con mapas de calor y puntuaciones: cada keypoint se devuelve con su heatmap y su score asociado.
- Ejecucion en NPU de AMD Ryzen AI con los kernels ya compilados, sin necesidad de GPU.
- Integracion via linea de comandos del runtime `taconite-sapiens2` (salida de overlay en imagen y JSON de keypoints).
- Modo de verificacion (`sapiens2 check`) que reproduce los casos de referencia frente al modelo float32.
- No incluye procesamiento de texto, tool calling, agentes ni capacidades multilingues: es un modelo puramente de vision.

## Casos de uso

- Captura de movimiento para animacion: dada una caja de persona por fotograma, el modelo produce las posiciones de los keypoints que alimentan un rig de personaje; su salida con 308 puntos (incluidas manos y cara) es util para retargeting facial y manual, y puede ejecutarse en local sobre la NPU de un portatil Ryzen AI.
- Analisis biomecanico en deporte: a partir de fotogramas o video con las cajas de los atletas, extraer keypoints para calcular angulos articulares y detectar patrones de movimiento, aprovechando que el calculo no requiere GPU dedicada.
- Rehabilitacion y fisioterapia asistida (con consentimiento explicito): monitorizar la ejecucion de ejercicios comparando los keypoints del paciente contra una pose de referencia, respetando las restricciones de licencia sobre procesamiento biometrico.
- Realidad aumentada y avatares: conducir avatares o efectos que siguen el movimiento de la persona en aplicaciones de captura en tiempo real sobre equipos de consumo con NPU.
- Interfaces por gestos: usar los keypoints de manos para controlar aplicaciones o presentaciones sin contacto fisico, en escenarios donde el procesamiento local en el dispositivo es preferible.
- Analisis ergonomico de puestos de trabajo: evaluar posturas en entornos laborales con consentimiento de las personas afectadas, devolviendo metricas de pose agregadas y no identificativas.
- Investigacion en vision por computador: servir de banco de pruebas para pipelines de pose sobre NPU de AMD, comparando la salida empaquetada con el modelo float32 de referencia.

## Benchmarks y rendimiento

La informacion proporcionada no incluye resultados de benchmarks convencionales (MMLU, COCO AP, etc.). Si se aportan cifras de validacion (paridad frente al modelo float32) medidas con `sapiens2 check` sobre una NPU AMD Ryzen AI 9 HX 370:

| Metrica | Resultado | Condiciones |
|---|---|---|
| Coseno de mapas de calor | 0,9993 - 0,9996 | Frente al modelo float32 HF |
| Error medio de keypoints | 0,12 - 1,03 px | Sobre 5 cajas de COCO val2017 |
| Tiempo por caja | ~4,3 s | Ryzen AI 9 HX 370 (NPU2) |

Nota: estos valores comparan la salida de la exportacion NPU con la del modelo float32, no son resultados de precision absoluta del modelo base sobre el conjunto de evaluacion completo.

## Requisitos de hardware

- NPU objetivo: NPU2 (AIE2P), es decir, Strix Point, Strix Halo y Krackan.
- No compatible con NPU1 (Phoenix, Hawk Point): los kernels no cargan en esa generacion.
- VRAM de GPU: no aplica; el modelo se ejecuta en la NPU, no en GPU.
- Plataforma de prueba declarada: AMD Ryzen AI 9 HX 370.
- Backend de ejecucion: XRT o el driver `amdxdna` en modo directo (runtime Rust `taconite-sapiens2`).
- Despliegue: runtime `taconite-sapiens2` (crates.io), con CLI `sapiens2 pose` y `sapiens2 check`; tambien se puede descargar con `hf download` o con `scripts/hf_models.py` de un checkout de IRON.
- Latencia observada: aproximadamente 4,3 s por caja en Ryzen AI 9 HX 370. Throughput no disponible.
- Espacio en disco: 732,9 MB (23 archivos).

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni especificaciones detalladas de alternativas en la informacion proporcionada, por lo que la comparativa se limita al modelo base y se marca el resto como no disponible.

| Modelo | Parametros | Formato | Hardware | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| brishen/iron-sapiens2-pose-0.4b-npu2 | ~0,4B | Kernels NPU (`.xclbin`) + pesos empaquetados | NPU AMD NPU2 (Strix Point, Strix Halo, Krackan) | Sapiens2 License (upstream) | HuggingFace |
| facebook/sapiens2-pose-0.4b | ~0,4B | Float32 (HF) | GPU/CPU generica | Sapiens2 License | HuggingFace |
| Otras alternativas de estimacion de pose | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Solo funciona en NPU2 (AIE2P); no carga en NPU1 (Phoenix, Hawk Point) ni, previsiblemente, en hardware sin NPU compatible.
- Es un modelo top-down: necesita un detector de personas que aporte las cajas; no detecta personas por si mismo.
- El aviso de licencia es restrictivo: la Sapiens2 License permite la redistribucion adjuntando la licencia, pero prohibe, entre otros usos, la vigilancia y el procesamiento biometrico. Cualquier despliegue en produccion debe revisar estos terminos antes de usarlo.
- No hay resultados de benchmarks publicados en la informacion proporcionada; las cifras disponibles son de paridad frente al modelo float32, no de precision absoluta.
- La latencia declarada (~4,3 s por caja) puede limitar aplicaciones en tiempo real con multiples personas por fotograma.
- No se documentan sesgos especificos ni tasas de alucinacion/error fuera de la validacion citada; al tratarse de un modelo de vision, no genera texto, pero si puede producir keypoints erroneos en oclusiones, poses extremas o personas poco representadas en el entrenamiento del modelo base.
- Repositorio con 0 descargas y 0 likes en el momento de la ficha: ecosistema de adopcion muy incipiente, sin garantias de mantenimiento.
- Los detalles de arquitectura, entrenamiento y cuantizacion del modelo base no estan disponibles en la informacion proporcionada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/brishen/iron-sapiens2-pose-0.4b-npu2
- Modelo base: https://huggingface.co/facebook/sapiens2-pose-0.4b
- Licencia Sapiens2: https://github.com/facebookresearch/sapiens2/blob/main/LICENSE.md
- IRON (AMD): https://github.com/amd/IRON
- Runtime `taconite-sapiens2` (crates.io): https://crates.io/crates/taconite-sapiens2
- Documentacion del runtime: https://docs.rs/taconite-sapiens2
- Codigo fuente del runtime: https://github.com/Brishen/taconite
