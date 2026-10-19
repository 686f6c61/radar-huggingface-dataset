# abhijitbetigeri/dcops-e8

## Resumen

dcops-e8 es un paquete de dos modelos TinyML publicados por abhijitbetigeri para el concurso Arm + ExecuTorch Edge AI Challenge (SFSU, octubre de 2026). No es un modelo de lenguaje: se trata de un clasificador de imágenes MobileNetV2 y un detector de palabras clave (keyword spotting) DS-CNN, ambos compilados con ExecuTorch 1.1.0 para ejecutarse íntegramente en la NPU Ethos-U85-256 de la placa Alif Ensemble E8 DevKit, que combina un Cortex-M55 con dicha NPU. El objetivo es identificar componentes de un centro de datos (bandejas de cómputo, switches, bandejas de alimentación, puertos, ventiladores, etc.) con la cámara de la placa y mostrar una ficha informativa en su pantalla LCD, además de manejar una lista de comprobación por voz.

El modelo de visión es un MobileNetV2 con entrada NHWC de 160x160 píxeles y 16 clases más fondo; tras un ajuste fino con 1.330 fotogramas capturados por la propia cámara de la placa alcanza un 73,0% de acierto sobre fotogramas reservados (frente al 35,5% antes del ajuste), con un `.pte` de 2.301 KB y 7,9 ms de latencia en la NPU. El modelo de audio es un DS-CNN de 79.116 parámetros que reconoce 10 palabras más silencio y desconocido, con un 94,7% de acierto en test, 93 KB de peso y 0,3 ms en la NPU (más 3,3 ms de extracción MFCC en el Cortex-M55).

Su relevancia es doble: por un lado, demuestra un flujo completo de destilación de conocimiento desde profesores ConvNeXt hasta estudiantes MobileNetV2/DS-CNN, cuantización int8 con `EthosUQuantizer` y despliegue en microcontroladores; por otro, publica tanto los pesos float como los programas ExecuTorch listos para la placa, algo poco habitual en modelos de este tamaño. El repositorio ocupa 1,2 GB e incluye profesores, estudiantes, calibración y firmware.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Dos CNN independientes: MobileNetV2 (visión, entrada 160x160x3 NHWC) y DS-CNN de 4 bloques y 128 canales (audio) |
| Parámetros totales | Visión: no disponible. Audio: 79.116 (`dscnn_m_agc`); variante pequeña `dscnn_s_agc` con 23.180 |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelos convolucionales sin ventana de contexto) |
| Tipos de cuantización | int8 PT2E simétrica por canal con `EthosUQuantizer`; también se publican pesos float32 (`student.pt`) |
| Idiomas soportados | No disponible. El modelo de visión no procesa texto; el detector de palabras reconoce 10 palabras clave cuyo idioma no se declara |
| Licencia | CC BY 4.0 |
| Formato de pesos | `.pte` (ExecuTorch 1.1.0, `ethos-u85-256`), `student.pt` (state dict de PyTorch) y `calib.npz` (entradas de calibración int8) |
| Entrada de visión | float32 NHWC en [0, 1], forma 1x160x160x3, normalización ImageNet plegada en el modelo |
| Entrada de audio | Características MFCC de MLEK, 49 tramas x 10 coeficientes |
| Clases de visión | 16 + fondo: rack, bandeja de cómputo, bandeja de switch NVLink, switch de red, bandeja de alimentación, cable, puerto de red, LED, etiqueta, ventilador, colector de refrigeración, cartucho de cable, conector de alimentación, bahía de disco, puerto de gestión, DPU y fondo |
| Tamaño de los artefactos | Visión: 2.301 KB `.pte`. Audio: 93 KB `.pte` |
| Hardware objetivo | Alif Ensemble E8 DevKit (Cortex-M55 + Ethos-U85-256), modo de memoria Shared_Sram |
| Fecha de publicación | 2026-10-18 (última actualización 2026-10-18) |

Detalle de los dos modelos desplegados:

| Carpeta | Modelo | Tarea | Métrica | Tamaño | Latencia en la E8 |
|---|---|---|---|---|---|
| `deployed/vision_v3_board_ft/` | MobileNetV2 160x160, 16 clases + fondo | Clasificación de componentes | 73,0% en fotogramas reservados de la cámara de la placa | 2.301 KB `.pte` | 7,9 ms en la NPU, 100% de las operaciones en NPU |
| `deployed/kws_dscnn_m_agc/` | DS-CNN, 128 canales, 4 bloques, 79.116 parámetros | Keyword spotting, 10 palabras + silencio + desconocido | 94,7% en test | 93 KB `.pte` | 0,3 ms en la NPU + 3,3 ms de MFCC en el M55 |

## Arquitectura y entrenamiento

El pipeline de visión parte de profesores ConvNeXt. Una primera oleada entrena un ConvNeXt-Small sobre recortes pseudo-etiquetados y alcanza un 69,4% frente a las etiquetas automáticas. La segunda oleada entrena dos ConvNeXt-Base out-of-fold sobre 19.203 recortes procedentes de 2.056 fotos etiquetadas manualmente, con un 97,2% de acierto en validación humana. Los estudiantes son MobileNetV2 destilados de esos profesores de la segunda oleada con alpha de destilación 0,7 y temperatura 4, aumento de datos que simula la cámara de la placa y pesos EMA. El estudiante base `v2_r160_kd` obtiene un 91,2% en validación humana; las ablaciones sobre imágenes simuladas muestran la contribución de cada técnica: sin destilación el acierto cae a 0,804, sin aumento de datos a 0,758, y con mixup a 0,814-0,839, frente a 0,913 del modelo base.

El ajuste fino específico de placa usa 1.330 fotogramas grabados con la cámara de la propia E8 mientras un teléfono mostraba un pase de diapositivas sincronizado por reloj. El split se hace por diapositiva (1.119 fotogramas de entrenamiento, 211 de test) para evitar fuga de información; el entrenamiento mezcla 1.503 recortes de repetición de las fotos originales, se ejecuta durante 25 épocas con lr 3e-4 y extrae el 60% de cada lote de fotogramas de placa.

Los detectores de palabras son DS-CNN destilados y entrenados emulando la ganancia automática de la placa: `dscnn_m_agc` alcanza 94,7% y `dscnn_s_agc` (23.180 parámetros) un 93,9%. La exportación sigue la cadena `torch.export` → cuantización PT2E int8 con `EthosUQuantizer` → `EthosUPartitioner` → TOSA y Vela 4.5.0 (`ethos-u85-256`, Shared_Sram) → pases de Cortex-M hasta producir el `.pte`. La versión de ExecuTorch está fijada a 1.1.0 para coincidir con el runtime MLEK del firmware. La concordancia entre el modelo int8 y el float es del 98,4% sobre los fotogramas de calibración.

## Capacidades

- Clasificación de imágenes en 17 categorías (16 componentes de centro de datos más fondo) a partir de una entrada de 160x160 píxeles.
- Detección de palabras clave en audio con un vocabulario de 10 palabras más silencio y clase desconocida, sobre características MFCC de 49x10.
- Inferencia completamente local: el 100% de las operaciones del modelo de visión se ejecuta en la NPU Ethos-U85, sin conexión a red ni servicios en la nube.
- Ejecución en microcontrolador con presupuestos de memoria muy ajustados (2,3 MB y 93 KB de programa respectivamente).
- Modo dual en la misma placa: visión por cámara y audio por micrófono comparten NPU, lo que permite flujos de inspección manos libres.
- Receta reproducible de destilación de conocimiento y cuantización int8 para desplegar CNN en Ethos-U85 mediante ExecuTorch.
- No dispone de generación de texto, razonamiento, código, matemáticas, tool calling, capacidades de agente, modo thinking ni procesamiento de lenguaje natural. La comparación con modelos de lenguaje no aplica.

## Casos de uso

- Identificación de componentes en sala de servidores sin conectividad: la cámara de la E8 captura un componente y el modelo de visión devuelve una de las 16 clases; la placa muestra la ficha en la LCD. Es adecuado porque todo el cómputo ocurre en 7,9 ms sobre una NPU de bajo consumo, sin depender de Wi-Fi ni de una GPU.
- Lista de comprobación por voz durante el mantenimiento: el DS-CNN reconoce las 10 palabras clave y avanza la checklist mientras el técnico tiene las manos ocupadas; la latencia combinada de MFCC y NPU (3,6 ms) permite respuesta prácticamente inmediata.
- Auditoría de inventario en armarios cerrados: integrado en un dispositivo a batería, el modelo clasifica bandejas de alimentación, bahías de disco y puertos de gestión y registra el resultado localmente, sin transmitir imágenes fuera del centro de datos.
- Triaje y pre-etiquetado de fotos de racks: el clasificador puede ejecutarse sobre lotes de imágenes para proponer etiquetas antes de la revisión humana, usando la versión float (`student.pt`) en CPU o la int8 en la NPU.
- Base para ajuste fino con datos propios: tanto `student.pt` como el pipeline de destilación documentado permiten reentrenar el clasificador para un catálogo de componentes distinto con unas pocas miles de imágenes, como demuestra el ajuste con 1.330 fotogramas.
- Docencia y prototipado TinyML: sirve como ejemplo completo y ejecutable de cuantización PT2E, particionado para Ethos-U y empaquetado `.pte` con ExecuTorch 1.1.0, replicable en otras placas con Cortex-M55.
- Inspección asistida en campo con hardware de bajo coste: al requerir solo un microcontrolador con NPU y una cámara, encaja en herramientas portátiles donde no es viable desplegar un servidor de inferencia.
- Verificación cruzada de presencia de ventiladores o conectores de alimentación en una bahía concreta, limitada a las 5 clases que el firmware de demostración separa de forma fiable.

## Benchmarks y rendimiento

Resultados publicados en la model card:

| Modelo o ejecución | Conjunto de evaluación | Métrica | Resultado |
|---|---|---|---|
| `vision_v3_board_ft` (desplegado) | Fotogramas reservados de la cámara de la E8, umbral 0,5 | Exactitud | 73,0% |
| `vision_v3_board_ft` antes del ajuste de placa | Fotogramas de la cámara de la E8 | Exactitud | 35,5% |
| `v2_r160_kd` (estudiante base) | Validación etiquetada manualmente | Exactitud | 91,2% |
| `v2_r160_kd` (estudiante base) | Imágenes simuladas de la cámara de placa | Exactitud | 0,913 |
| `v2_r160_nokd` | Imágenes simuladas | Exactitud | 0,804 |
| `v2_r160_noaug` | Imágenes simuladas | Exactitud | 0,758 |
| `v2_r160_kd_mix` | Imágenes simuladas | Exactitud | 0,814 |
| `v2_r160_kd_mix_e80` | Imágenes simuladas | Exactitud | 0,839 |
| `r128_kd` / `r160_kd` / `r192_kd` (oleada 1, etiquetas automáticas) | Imágenes simuladas | Exactitud | 0,581 / 0,653 / 0,632 |
| ConvNeXt-Small (profesor, oleada 1) | Etiquetas automáticas | Exactitud | 69,4% |
| ConvNeXt-Base x2 (profesor, oleada 2) | Validación etiquetada manualmente | Exactitud | 97,2% |
| `dscnn_m_agc` (desplegado) | Test de keyword spotting | Exactitud | 94,7% |
| `dscnn_s_agc` | Test de keyword spotting | Exactitud | 93,9% |
| Visión int8 frente a float | Fotogramas de calibración | Concordancia | 98,4% |
| Visión desplegada, umbral 0,5 | Fotogramas de componentes | Correctos / incorrectos / en blanco | 73% / 6% / resto; ningún fotograma de fondo etiquetado |

No se han publicado resultados de benchmarks estándar (ImageNet, Speech Commands completo, MMLU, HumanEval, GSM8K) en la información disponible; las cifras anteriores son métricas internas del autor sobre sus propios conjuntos.

## Requisitos de hardware

- No requiere GPU: el objetivo es una NPU Ethos-U85-256 integrada en el SoC Alif Ensemble E8, junto a un núcleo Cortex-M55.
- Huella de memoria: 2.301 KB para el programa de visión y 93 KB para el de audio en formato `.pte`; el modo de memoria declarado en la compilación es Shared_Sram. Los requisitos exactos de RAM y flash del firmware no están disponibles en la información proporcionada.
- Latencia medida en la placa: 7,9 ms para la clasificación de visión (100% de operaciones en NPU) y 0,3 ms para el DS-CNN más 3,3 ms de MFCC en el Cortex-M55.
- Throughput estimado: aproximadamente 126 inferencias por segundo en visión y del orden de 277 por segundo en el detector de palabras, descontando el preprocesado de audio (cálculo derivado de las latencias declaradas, no publicado por el autor).
- Cabe en hardware mucho más pequeño que una GPU de consumo; no se han publicado pruebas en RTX, A100 ni H100.
- Opciones de despliegue: runtime ExecuTorch 1.1.0 con MLEK en el firmware de la placa, compilado con Vela 4.5.0 y el dialecto TOSA; el script `scripts/alif/build_dcops_demo.sh` del repositorio integra los dos `.pte`. Para ejecución en host, el `student.pt` float se carga con PyTorch (`StudentNHWC(17, 160, pretrained=False)`).
- vLLM, llama.cpp, Ollama y TGI no son aplicables a este modelo.

## Comparativa con modelos similares

No se han encontrado en la información proporcionada modelos directamente comparables con métricas verificables. La siguiente tabla recoge la comparación cualitativa; los datos de los modelos alternativos no proceden de la model card y se marcan como no disponibles cuando no se pueden confirmar.

| Modelo | Parámetros | Tarea y dominio | Cuantización int8 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| dcops-e8, visión (`vision_v3_board_ft`) | no disponible | 17 clases de componentes de centro de datos, 160x160 | Sí, PT2E simétrica por canal | CC BY 4.0 | HuggingFace, `.pte` y `student.pt` |
| dcops-e8, audio (`dscnn_m_agc`) | 79.116 | 10 palabras clave + silencio + desconocido | Sí, PT2E | CC BY 4.0 | HuggingFace, `.pte` y `student.pt` |
| `dscnn_s_agc` (mismo repositorio) | 23.180 | Igual, versión reducida | Sí, PT2E | CC BY 4.0 | Mismo repositorio |
| MobileNetV3-Small (referencia externa) | no disponible en la información | Clasificación genérica de imágenes | Depende del artefacto | no disponible | torchvision / TF Hub |
| EfficientNet-Lite0 (referencia externa) | no disponible en la información | Clasificación genérica de imágenes | Depende del artefacto | no disponible | TF Hub |

Frente a un clasificador genérico de ImageNet, la diferencia relevante no es la arquitectura sino el dominio: dcops-e8 está especializado en componentes de centro de datos y publica artefactos ya compilados para una NPU concreta, a costa de un catálogo muy reducido de clases y de una exactitud modesta en condiciones reales de cámara.

## Limitaciones y advertencias

- No es un modelo de lenguaje: carece de generación de texto, razonamiento, código, tool calling, capacidades de agente y soporte multilingüe. Cualquier uso que requiera esas funciones queda fuera de su alcance.
- Sesgo de dominio fuerte: solo conoce 16 clases de componentes de centro de datos y un fondo genérico; cualquier objeto fuera de ese catálogo puede recibir una etiqueta incorrecta.
- Riesgo de error en producción: con umbral de confianza 0,5 sobre fotogramas reales de la placa, un 6% de los fotogramas se etiqueta mal. El fallo puede provocar una identificación errónea de un componente crítico.
- El firmware de demostración expone únicamente 5 de las 17 clases (bandeja de alimentación, puerto de red, ventilador, conector de alimentación y bahía de disco), las que la cámara separa de forma fiable; el resto no se consideran utilizables en condiciones reales.
- El ajuste fino de placa se apoya en 1.330 fotogramas grabados mostrando un pase de diapositivas en un teléfono, una distribución muy alejada de una sala de servidores real; se desconoce el comportamiento con iluminación, reflejos, polvo u oclusión distintos.
- Parte de los datos de entrenamiento provienen de etiquetas automáticas (oleada 1), por lo que existe ruido de etiqueta en la cadena de profesores.
- El detector de palabras está entrenado con emulación de la ganancia automática de la placa y un vocabulario fijo de 10 palabras; el idioma no se declara y el acento, el ruido de fondo o un micrófono distinto pueden degradar el 94,7% de test.
- La cuantización int8 introduce una divergencia del 1,6% respecto al modelo float en los fotogramas de calibración, que puede ampliarse fuera de esa distribución.
- La licencia CC BY 4.0 permite uso comercial, pero exige atribución al autor y a los conjuntos de datos de Roboflow Universe empleados (Server Vision, Server Rack, PC Ports, Ports and Server Detection), también bajo CC BY 4.0.
- El modelo tiene 0 descargas y 0 likes en HuggingFace, por lo que no existe validación independiente de los resultados declarados.
- El repositorio pesa 1,2 GB e incluye profesores, estudiantes y datos; no es un artefacto ligero para descarga rápida si solo se necesitan los `.pte`.
- La versión de ExecuTorch está fijada a 1.1.0 por compatibilidad con el runtime MLEK del firmware; actualizar el runtime puede romper la carga del `.pte`.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/abhijitbetigeri/dcops-e8
- Página del proyecto y presentación: https://abhijitbetigeri.github.io/executorch-alife8/
- Código, firmware y dataset: https://github.com/abhijitbetigeri/executorch-alife8
- Script de compilación del firmware: `scripts/alif/build_dcops_demo.sh` en el repositorio anterior
- Documentación de los datos y enlaces a los conjuntos de Roboflow: `dcops/data/README.md` en el repositorio anterior

Nota: la búsqueda web realizada no devolvió resultados relevantes sobre este modelo (los resultados obtenidos correspondían a tiendas de moda y no guardan relación). No se han podido localizar papers, blogs o demos adicionales más allá de los enlaces facilitados en la model card.
