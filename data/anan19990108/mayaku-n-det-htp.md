# anan19990108/mayaku-n-det-htp

## Resumen

Mayaku Nano Detection es un modelo de deteccion de objetos de tipo "nano" publicado por el usuario anan19990108 en Hugging Face, derivado del checkpoint original `mayaku-n-det.pth` del zoo de modelos de Datamarkin Mayaku (revision 2026-11-03, licencia Apache-2.0). El modelo detecta 365 categorias del dataset Objects365 a partir de una entrada RGB de 640 × 640 píxeles. No es un modelo de lenguaje, sino un detector visual orientado a despliegue en el borde (edge AI).

El paquete no distribuye el checkpoint original en PyTorch, sino artefactos compilados y cuantizados para inferencia en dispositivos: un ONNX en FP32 (21,10 MB) para CPU con ONNX Runtime, un TFLite de referencia en FP16 con E/S FP32 (10,59 MB), un contexto QNN precompilado (11,84 MB) para el HTP v73 del SoC Qualcomm QCS8550 en Android, y un TFLite INT8 W8A8 (5,74 MB) para Linux aarch64 sobre el mismo HTP. El preprocesado y el NMS se ejecutan en el host, no dentro del grafo.

Su relevancia actual radica en que ejemplifica el flujo de publicacion de modelos para aceleradores NPU/edge: empaquetado QNN con QAIRT 2.47, cuantizacion W8A8 verificada en hardware concreto y metricas de latencia medidas sobre ese hardware (p50/p95 de `Invoke`). El repositorio ocupa 0,0 GB y acumula 48 descargas y 0 likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (detector de objetos; arquitectura interna no declarada en la model card) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision; entrada de 640 × 640 RGB) |
| Tipos de cuantizacion | FP32 (ONNX), FP16 con E/S FP32 (TFLite referencia), W8A8 INT8 (TFLite), contexto QNN precompilado |
| Idiomas soportados | en (etiquetas de clase en ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | ONNX, TFLite (FP16 e INT8), QNN context binary (`.bin`) |
| Tarea (pipeline) | object-detection |
| Clases detectadas | 365 categorias de Objects365 |
| Resolucion de entrada | 640 × 640 RGB |
| Preprocesado y NMS | en el host (fuera del grafo) |
| Hardware objetivo | Qualcomm QCS8550, HTP v73, QAIRT 2.47 |
| Tamano del repo | 0,0 GB |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna del detector (no se especifica si es una familia YOLO, un detector tipo anchor-free, un transformer de deteccion u otra topologia). Tampoco se documentan el numero de tokens o imagenes de entrenamiento, la composicion del dataset mas alla de las 365 categorias de Objects365, ni si hubo fases de ajuste fino adicionales. El unico dato de procedencia es que el checkpoint upstream `mayaku-n-det.pth` proviene del zoo de modelos de Datamarkin Mayaku, revision `2026-11-03`, con licencia Apache-2.0 y manifiesto de publicacion archivado con checksum SHA-256.

La innovacion tecnica destacable no esta en el diseno del modelo sino en la cadena de despliegue: se ofrecen artefactos precompilados para el HTP de Qualcomm mediante el QNN SDK (QAIRT 2.47), con un delegate TFLite que mapea las operaciones al acelerador. La variante INT8 usa cuantizacion W8A8 con entrada y salida en FP32, lo que simplifica la integracion en pipelines existentes sin recalcular escalas en el host. El contexto QNN esta compilado especificamente para el SoC QCS8550 con HTP v73, por lo que no es portable a otros aceleradores sin recompilacion.

## Capacidades

- Deteccion de objetos en imagenes RGB de 640 × 640 con 365 categorias de Objects365.
- Salida de cajas delimitadoras, puntuaciones de confianza e identificadores de clase (formato JSON en el ejemplo de inferencia).
- Inferencia acelerada en NPU Qualcomm HTP v73 (QCS8550) mediante delegate QNN.
- Inferencia en CPU via ONNX Runtime con el artefacto FP32.
- Ejecucion en Linux aarch64 (TFLite INT8 con delegate QNN) y en Android (contexto QNN y ejemplos flotantes).
- No soporta tool calling, agentes, razonamiento multi-paso, texto, audio ni modo "thinking": es exclusivamente un detector visual.
- Capacidad multilingue: no aplica; las etiquetas de clase estan en ingles.

## Casos de uso

- Vision por computador en dispositivos moviles Android: el contexto QNN precompilado para QCS8550 permite ejecutar deteccion en el HTP del telefono con latencia de milisegundos, adecuado para apps de camara que necesitan identificar objetos en tiempo real sin enviar frames a la nube.
- Vigilancia y analitica de video en el borde: al cubrir 365 categorias de Objects365, el modelo puede etiquetar escenas complejas (vehiculos, personas, mobiliario urbano, animales) en un dispositivo empotrado, reduciendo el ancho de banda frente a un pipeline centralizado.
- Robotica movil y AGV: la deteccion de objetos a 640 × 640 con NMS en el host encaja en lazos de percepcion de baja latencia sobre SoC Qualcomm, donde el presupuesto termico y energetico es limitado.
- Automatizacion industrial y control de calidad: el artefacto ONNX FP32 permite ejecutar el detector en servidores CPU sin GPU para inspeccion visual por lotes, integrándolo en pipelines existentes de ONNX Runtime.
- Sistemas de asistencia a la conduccion de bajo coste: la deteccion de clases de Objects365 (vehiculos, senalizacion, peatones) sirve como modulo de percepcion en prototipos con hardware QCS8550, siempre que se valide la precision en el dominio concreto.
- Investigacion en eficiencia de modelos: los artefactos FP32, FP16, INT8 y QNN del mismo checkpoint permiten comparar precision y latencia entre precisiones y backends sobre un mismo conjunto de imagenes, util para estudios de cuantizacion.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre el mismo subconjunto de 100 imagenes de COCO val2017, restringido a las 69 clases compartidas con Objects365. La latencia corresponde a `Invoke` en Linux HTP TFLite con 10 calentamientos:

| Variante | AP | AP50 | AP75 | Invoke p50 (ms) | Invoke p95 (ms) |
|---|---|---|---|---|---|
| Baseline flotante | 0,3667 | 0,5022 | 0,3877 | 4,217 | 4,330 |
| INT8 completo | 0,3710 | 0,5137 | 0,3914 | 2,747 | 2,935 |

La cuantizacion INT8 no degrada la precision en este subconjunto (incluso mejora ligeramente AP y AP50) y reduce la latencia p50 aproximadamente un 35 % y la p95 un 32 % respecto al baseline flotante. No se han publicado resultados de benchmarks adicionales (por ejemplo, comparativas con otros detectores) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no aplica; el modelo esta pensado para inferencia en CPU y NPU, no en GPU. El artefacto ONNX FP32 ocupa 21,10 MB y el TFLite INT8 5,74 MB, por lo que la huella de memoria es minima.
- GPU recomendadas: no especificadas. El autor no documenta ejecucion en GPU; el camino soportado es ONNX Runtime CPU y el HTP de Qualcomm.
- Consumer GPU: no documentado. El modelo cabe holgadamente en cualquier GPU de consumo, pero no hay backend GPU validado en la model card.
- Despliegue: ONNX Runtime (CPU), TFLite C 2.11.1 con delegate QNN, QAIRT 2.47.0.260601 para el contexto QNN. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplican a un detector).
- Hardware validado: SoC Qualcomm QCS8550 con HTP v73 en Android y Linux aarch64.
- Latencia: p50 de 2,747 ms y p95 de 2,935 ms con INT8 en HTP; p50 de 4,217 ms y p95 de 4,330 ms con el baseline flotante, medidas sobre 100 imagenes de COCO val2017.
- Throughput: no disponible de forma explicita; a partir de la latencia p50 INT8 se puede estimar del orden de 360 invocaciones por segundo en el HTP validado, sin contar preprocesado ni NMS en el host.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de otros detectores en la informacion proporcionada, por lo que la comparacion cuantitativa no esta disponible. A continuacion se comparan caracteristicas declaradas frente a alternativas habituales de la misma categoria (detectores ligeros para edge), marcando como "no disponible" lo que no se puede verificar:

| Modelo | Parametros | Contexto/entrada | Clases | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Mayaku Nano Detection | no disponible | 640 × 640 RGB | 365 (Objects365) | Apache-2.0 | Hugging Face (ONNX, TFLite, QNN) |
| Alternativas tipo YOLO nano | no disponible | 640 × 640 RGB | 80 (COCO) tipicamente | depende de la variante | multiples repositorios |
| Detectores COCO ligeros genericos | no disponible | variable | 80 (COCO) | variable | variable |

La ventaja diferencial de Mayaku Nano Detection frente a detectores COCO de 80 clases es la cobertura de 365 categorias de Objects365 y el empaquetado QNN listo para HTP de Qualcomm; la desventaja es la ausencia de benchmarks publicos frente a terceros y la dependencia de un SoC concreto para la ruta acelerada.

## Limitaciones y advertencias

- La arquitectura interna, el numero de parametros y los datos de entrenamiento no estan documentados en la model card, lo que dificulta evaluar su idoneidad frente a alternativas.
- Los benchmarks se limitan a 100 imagenes de COCO val2017 y a las 69 clases compartidas con Objects365; no hay evaluacion completa sobre Objects365 ni sobre dominios distintos.
- El contexto QNN esta compilado para el HTP v73 del QCS8550 con QAIRT 2.47; no es portable a otros SoC o versiones del SDK sin recompilacion.
- El preprocesado y el NMS se ejecutan en el host, por lo que la latencia extremo a extremo es superior a la latencia de `Invoke` reportada.
- Riesgo de alucinacion: en deteccion se traduce en falsos positivos y cajas mal localizadas; no hay datos de calibracion de confianza publicados.
- Sesgos: no documentados; al entrenar sobre Objects365 pueden aparecer sesgos de dominio y de representacion de categorias.
- Idiomas: las etiquetas de clase estan en ingles; no hay soporte multilingue.
- Licencia Apache-2.0 permite uso comercial, pero deben revisarse `NOTICE` y `THIRD_PARTY_LICENSES.txt` por dependencias de terceros (QNN SDK, TFLite) con sus propias condiciones.
- El checkpoint upstream no estaba disponible para descarga directa en el momento de la verificacion del autor; la procedencia se acredita mediante manifiesto y checksum archivados.
- Repositorio con 48 descargas y 0 likes: madurez y soporte comunitario limitados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/anan19990108/mayaku-n-det-htp
- Revision fijada usada en los ejemplos: https://huggingface.co/anan19990108/mayaku-n-det-htp/tree/05ea60ad7433b752ed7963f5e1ea756266ce9b01
- Resultados completos de evaluacion: https://huggingface.co/anan19990108/mayaku-n-det-htp/blob/05ea60ad7433b752ed7963f5e1ea756266ce9b01/evaluation/results.json
- README detallado con configuracion de evaluacion: https://huggingface.co/anan19990108/mayaku-n-det-htp/blob/05ea60ad7433b752ed7963f5e1ea756266ce9b01/README.md
- Zoo de modelos de origen (Datamarkin Mayaku): https://github.com/emrahnazif/mayaku#models
