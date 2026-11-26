# anan19990108/hae-s-ir-htp

## Resumen

HAE Small IR es un modelo de deteccion de objetos especializado en localizar personas en imagenes termicas de baja resolucion (640 × 512 pixeles en escala de grises). Lo desarrolla el usuario anan19990108 como una derivacion cuantizada y empaquetada del checkpoint original `hae-s-ir_lwir.onnx` de alexshynkarenk0/hae-s-ir, y esta pensado para ejecutarse en hardware de borde (edge AI), concretamente en el DSP Hexagon HTP v73 del SoC Qualcomm QCS8550 bajo Android o Linux aarch64.

El modelo no es un transformer de lenguaje, sino un detector compacto con preprocesado en host y decodificacion de cajas externa al grafo. Su interes practico esta en el empaquetado multi-formato: ofrece pesos en ONNX FP32 (1,25 MB), TFLite FP16 (0,64 MB), ONNX INT8 W8A8 (0,39 MB), TFLite INT8 W8A8 (0,36 MB) y contextos nativos QNN para el HTP, lo que permite desplegarlo desde CPU hasta aceleracion NPU en dispositivos empotrados.

Es relevante ahora porque demuestra un flujo completo de cuantizacion W8A8 con perdida practicamente nula de precision (AP 0,3924 frente a 0,3928 del baseline float) y una reduccion de latencia de invocacion de aproximadamente 3,4 ms a 1,2 ms en el HTP, lo que lo hace util para vigilancia termica, seguridad perimetral y robotica con restricciones severas de energia y memoria. La licencia MIT facilita su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal convolucional para deteccion de objetos con decodificacion de heatmap en host (detalles de backbone no disponibles) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, entrada fija 640 × 512 en escala de grises) |
| Tipos de cuantizacion | FP32 (ONNX), FP16 (TFLite), INT8 W8A8 QDQ (ONNX y TFLite), contexto QNN nativo INT8 |
| Idiomas soportados | en (etiquetas y documentacion; el modelo procesa imagenes, no texto) |
| Licencia | MIT |
| Formato de pesos | ONNX, TFLite, QNN context binary (.bin) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base (tipo de backbone, numero de capas, mecanismos de atencion o diseno de las cabezas de deteccion). Lo que si se documenta es el pipeline de despliegue: la entrada es una imagen termica en escala de grises de 640 × 512, el preprocesado de imagen y la decodificacion de cajas se ejecutan en el host fuera del grafo, y el modelo produce mapas de calor que se decodifican con un esquema de "matched plateau decoding".

El checkpoint original es `hae-s-ir_lwir.onnx` (revision 6997a567ad7441a3e52544428aaf8e7d3007c637) de alexshynkarenk0/hae-s-ir, bajo licencia MIT. Sobre ese checkpoint, el autor de esta ficha aplico cuantizacion post-entrenamiento W8A8 con formato QDQ y genero artefactos especificos para el HTP v73 del QCS8550 mediante QAIRT 2.47.0.260601 y el delegado QNN de TFLite 2.11.1. No se especifican en la informacion proporcionada el volumen de tokens de entrenamiento (no aplica), la composicion del dataset ni si hubo tecnicas de refinamiento como destilacion o ajuste fino posterior a la cuantizacion.

## Capacidades

- Deteccion de personas en imagenes termicas de infrarrojo lejano (LWIR) en escala de grises a 640 × 512.
- Salida de cajas delimitadoras, puntuaciones de confianza e identificadores de clase, exportables a JSON mediante el ejemplo de inferencia incluido.
- Ejecucion en CPU mediante ONNX Runtime (formato FP32).
- Ejecucion acelerada en NPU Hexagon HTP v73 mediante contextos QNN nativos y delegado QNN de TFLite.
- Cuantizacion INT8 W8A8 con entrada/salida en FP32, lo que simplifica la integracion en pipelines existentes.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingues: es exclusivamente un modelo de vision para una unica tarea.
- No dispone de modo "thinking", vision general, audio ni generacion de texto.

## Casos de uso

- Vigilancia perimetral nocturna: el modelo detecta personas en imagenes termicas aunque no haya iluminacion visible, lo que lo hace adecuado para camaras LWIR fijas en recintos industriales o instalaciones criticas.
- Seguridad en interiores con camaras termicas: al ejecutarse en el HTP del QCS8550 con latencias de invocacion de ~1,2 ms, permite procesar flujos de video en tiempo real en dispositivos empotrados sin depender de la nube.
- Robotica y drones con presupuesto energetico limitado: los pesos INT8 de 0,36-0,39 MB y el consumo reducido del DSP lo hacen viable en plataformas aereas o terrestres con bateria pequena.
- Control de aforo y conteo de personas: la salida de cajas y puntuaciones permite agregar detecciones por fotograma para estimar ocupacion en espacios cerrados con camaras termicas.
- Busqueda y rescate: deteccion de personas en entornos con humo, polvo o baja visibilidad donde las camaras RGB fallan y las termicas siguen funcionando.
- Integracion en sistemas de videovigilancia existentes en Android: el paquete incluye ejemplos para Android con rutas float e INT8, lo que facilita prototipado rapido en dispositivos comerciales basados en QCS8550.
- Deteccion de intrusion en infraestructuras remotas: el bajo tamano del modelo permite actualizaciones OTA ligeras y despliegue en flotas de dispositivos con conectividad intermitente.

## Benchmarks y rendimiento

Resultados sobre el mismo subconjunto de 100 imagenes HIT-UAV con decodificacion de plateau emparejada y medicion de `Invoke` en HTP TFLite sobre Linux (10 calentamientos):

| Variante | AP | AP50 | AP75 | Invoke p50 / p95 (ms) |
|---|---|---|---|---|
| Baseline float | 0,3928 | 0,7672 | 0,3923 | 3,399 / 3,433 |
| Full INT8 | 0,3924 | 0,7619 | 0,3960 | 1,199 / 1,293 |

La cuantizacion INT8 mantiene la AP practicamente identica (diferencia de 0,0004) y reduce la latencia de invocacion aproximadamente un 65 % en p50 y p95. Los resultados archivados cubren tambien las rutas Android INT8 ONNX y nativa QNN. No se han publicado en la informacion disponible resultados de benchmarks genericos como MMLU, HumanEval o GSM8K, que no aplican a este tipo de modelo.

## Requisitos de hardware

- VRAM estimada: no aplica en el sentido tradicional; el modelo pesa entre 0,36 MB (TFLite INT8) y 1,25 MB (ONNX FP32), por lo que cabe holgadamente en cualquier memoria de dispositivo.
- GPU recomendadas: no requiere GPU dedicada; esta disenado para CPU y NPU Hexagon HTP v73 (Qualcomm QCS8550). Puede ejecutarse en cualquier CPU convencional via ONNX Runtime.
- Compatibilidad con GPU de consumo: irrelevante por tamano; podria ejecutarse en cualquier GPU consumer, pero el objetivo es edge.
- Opciones de despliegue: ONNX Runtime (CPU), TFLite con delegado QNN (Linux aarch64 y Android), QAIRT 2.47 para contextos QNN nativos en QCS8550.
- Latencia y throughput: ~1,2 ms p50 y ~1,29 ms p95 por invocacion en HTP TFLite INT8 sobre QCS8550; ~3,4 ms en la variante float. El throughput depende del pipeline de pre/postprocesado en host.
- Restricciones de plataforma: los artefactos QNN estan compilados especificamente para HTP v73 y QAIRT 2.47.0.260601; no son portables a otros SoC sin recompilacion.

## Comparativa con modelos similares

No se dispone en la informacion proporcionada de datos de otros detectores termicos comparables (por ejemplo, variantes de YOLO entrenadas en LWIR) con los que contrastar parametros, contexto o rendimiento sobre el mismo subconjunto de evaluacion. La comparativa cuantitativa con alternativas queda como no disponible. Como referencia cualitativa, el modelo se posiciona en la categoria de detectores ultra-ligeros para edge (sub-2 MB), donde la competencia habitual son variantes de YOLOv5n/YOLOv8n cuantizadas, pero no se aportan cifras de estos ultimos en la informacion disponible.

## Limitaciones y advertencias

- Modelo de tarea unica: solo detecta personas en imagenes termicas en escala de grises; no es un detector generico ni un modelo multimodal.
- Dependencia del preprocesado en host: el pipeline de inferencia requiere implementar el preprocesado de imagen y la decodificacion de cajas por separado; un error en esta parte degrada la precision.
- Artefactos QNN especificos de hardware: los contextos `.bin` estan compilados para QCS8550 HTP v73 y QAIRT 2.47; no funcionan en otros SoC o versiones de QAIRT sin recompilacion.
- Rendimiento modesto en terminos absolutos: AP de ~0,39 sobre el subconjunto HIT-UAV evaluado, lo que refleja un modelo pequeno y especializado; no es adecuado para escenarios que requieran alta precision en deteccion densa o de objetos pequenos.
- Posible sesgo de dominio: entrenado sobre datos termicos LWIR; el rendimiento puede degradarse con camaras de otro rango espectral, condiciones climaticas extremas o sensores con distinta respuesta.
- Riesgo de falsos positivos y negativos en escenas con fuentes de calor no humanas o personas parcialmente ocluidas.
- Idioma: la documentacion y etiquetas estan en ingles; no hay soporte multilingue.
- Licencia MIT: permite uso comercial y modificacion, pero se recomienda revisar `NOTICE` y `THIRD_PARTY_LICENSES.txt` por dependencias de terceros (QAIRT, TFLite).
- Sin garantias de produccion: el autor no documenta validacion en dominios distintos al subconjunto de evaluacion; conviene revalidar antes de desplegar en entornos criticos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/anan19990108/hae-s-ir-htp
- Modelo base: https://huggingface.co/alexshynkarenk0/hae-s-ir
- Checkpoint original: https://huggingface.co/alexshynkarenk0/hae-s-ir/blob/6997a567ad7441a3e52544428aaf8e7d3007c637/hae-s-ir_lwir.onnx
- Resultados completos de evaluacion: https://huggingface.co/anan19990108/hae-s-ir-htp/blob/5e134e77183704947a0e018cf7e0cdf580cf702f/evaluation/results.json
- README detallado con resultados anteriores: https://huggingface.co/anan19990108/hae-s-ir-htp/blob/5e134e77183704947a0e018cf7e0cdf580cf702f/README.md
- Ejemplos Linux TFLite INT8: https://huggingface.co/anan19990108/hae-s-ir-htp/blob/main/examples/LINUX_INT8.md
- Ejemplos Android float: https://huggingface.co/anan19990108/hae-s-ir-htp/blob/main/examples/ANDROID.md
- Ejemplos Android INT8: https://huggingface.co/anan19990108/hae-s-ir-htp/blob/main/examples/ANDROID_INT8.md
