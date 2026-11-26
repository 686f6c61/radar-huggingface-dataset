# anan19990108/hae-n-ir-htp

## Resumen

HAE Nano IR es un modelo de deteccion de objetos especializado en personas sobre imagenes termicas en escala de grises de 640 x 512 pixeles. Lo publica el usuario anan19990108 en Hugging Face y deriva del checkpoint `hae-n-ir-ext-kdf_lwir.onnx` de alexshynkarenk0/hae-n-ir-ext-kdf, distribuido bajo licencia MIT. No es un modelo de lenguaje: es un detector compacto pensado para inferencia en el borde (edge AI), con variantes empaquetadas para ONNX Runtime, TFLite y el acelerador HTP del SoC Qualcomm QCS8550.

Su relevancia esta en el formato: el autor no solo publica los pesos, sino artefactos ya compilados y cuantizados para el Hexagon Tensor Processor (HTP v73) con QAIRT 2.47, incluyendo contextos nativos QNN. Los tamanos son minimos (0,08-0,36 MB segun formato), lo que permite desplegarlo en dispositivos con recursos muy limitados. El preprocesado de imagen y la decodificacion de cajas se ejecutan en el host, no dentro del grafo.

La informacion disponible no detalla la arquitectura interna (capas, tipo de backbone) ni el volumen o composicion del dataset de entrenamiento. La model card se centra en los formatos de despliegue, las instrucciones de uso y una evaluacion comparativa entre la linea base en coma flotante y la version INT8 sobre un subconjunto de 100 imagenes de HIT-UAV.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (detector de objetos; backbone y capas no documentados) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, entrada 640 x 512 en escala de grises) |
| Tipos de cuantizacion | FP32 (ONNX), FP16 (pesos TFLite con E/S FP32), W8A8 QDQ (ONNX INT8), W8A8 (TFLite INT8), W8A8 nativo QNN (context INT8) |
| Idiomas soportados | en (etiqueta declarada; el modelo no procesa texto) |
| Licencia | MIT |
| Formato de pesos | ONNX (FP32 e INT8), TFLite (referencia FP16 e INT8), QNN context bin (float e INT8) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo: la model card no describe el backbone, el tipo de cabecera de deteccion ni el mecanismo de decodificacion mas alla de indicar que las cajas se decodifican desde mapas de calor (heatmaps) en el host. Tampoco se documentan el numero de tokens o imagenes de entrenamiento, la composicion del dataset ni si hubo etapas de ajuste fino supervisado adicionales.

Lo que si esta documentado es la cadena de conversion. El checkpoint original `hae-n-ir-ext-kdf_lwir.onnx` se transforma a TFLite y a contextos QNN compilados para el HTP v73 del QCS8550 con QAIRT 2.47.0.260601. Las variantes INT8 usan cuantizacion W8A8 con entrada y salida en FP32 (esquema QDQ en ONNX), y los contextos nativos QNN son especificos del objetivo (target-specific). El repositorio incluye sumas SHA-256 y verificacion del checkpoint de origen en `evaluation/results.json`.

## Capacidades

- Deteccion de personas en imagenes termicas de infrarrojos lejanos (LWIR) en escala de grises, con resolucion de entrada de 640 x 512.
- Salida de cajas delimitadoras, puntuaciones de confianza e identificadores de clase, volcadas a JSON en el ejemplo de inferencia.
- Decodificacion de cajas basada en mapas de calor, ejecutada en el host junto con el preprocesado de imagen.
- Inferencia en CPU via ONNX Runtime (variante FP32) y en el acelerador HTP del QCS8550 (variantes TFLite y QNN).
- Despliegue en Linux aarch64 (TFLite INT8 con delegado QNN) y en Android (ejemplos en coma flotante e INT8).
- No soporta tool calling, agentes, razonamiento multi-paso ni generacion de texto: es exclusivamente un detector visual.
- Capacidad multilingue no aplicable; la unica etiqueta de idioma declarada es `en` y no afecta al funcionamiento.

## Casos de uso

- Vigilancia perimetral con camaras termicas: el modelo detecta personas en imagenes LWIR de 640 x 512, util en condiciones de baja visibilidad o nocturnas donde una camara RGB rinde peor. Su tamano inferior a 1 MB permite ejecutarlo en el propio dispositivo.
- Busqueda y rescate con drones: al ser un detector termico compacto, puede embarcarse en plataformas aereas con SoC Qualcomm y procesar fotogramas en el HTP sin enviar video a la nube.
- Monitorizacion de aforo en interiores: integrado en un pipeline que captura imagenes termicas y decodifica cajas en el host, sirve para contar personas sin identificar biometricamente.
- Automatizacion industrial y seguridad de zonas restringidas: deteccion de presencia humana en areas peligrosas mediante camaras termicas conectadas a un QCS8550, con latencia de invocacion en torno a 0,44 ms en INT8.
- Prototipado e investigacion en edge AI: los artefactos ONNX y TFLite permiten reproducir la evaluacion sobre HIT-UAV y comparar rutas de despliegue (CPU, delegado QNN, contexto nativo) sin reentrenar.
- Sistemas de bajo consumo en robótica movil: la cuantizacion W8A8 y los contextos QNN reducen el coste computacional, lo que encaja en robots con presupuesto energetico ajustado que necesitan deteccion termica continua.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre el mismo subconjunto de 100 imagenes de HIT-UAV, con decodificacion de mapas de calor emparejada y medicion de `Invoke` en TFLite sobre HTP Linux (10 calentamientos):

| Variante | AP | AP50 | AP75 | Invoke p50 / p95 (ms) |
|---|---|---|---|---|
| Linea base en coma flotante | 0,2345 | 0,4937 | 0,2093 | 0,671 / 0,679 |
| INT8 completa | 0,2260 | 0,4799 | 0,1930 | 0,439 / 0,446 |

La cuantizacion INT8 reduce la latencia de invocacion aproximadamente un 35 % (de 0,671 a 0,439 ms en p50) con una caida de AP de 0,0085 puntos (de 0,2345 a 0,2260). El autor indica que `evaluation/results.json` contiene tambien mediciones de las rutas ONNX INT8 y nativa en Android, no reproducidas en esta ficha.

## Requisitos de hardware

- VRAM: no aplica; el modelo esta disenado para ejecucion en CPU y en el HTP de un SoC, no en GPU de escritorio. Los ficheros ocupan entre 0,08 MB (TFLite INT8) y 0,36 MB (contexto QNN), por lo que la huella de memoria es minima.
- Acelerador objetivo: Hexagon Tensor Processor v73 del Qualcomm QCS8550, con QAIRT 2.47.0.260601.
- CPU: la variante ONNX FP32 funciona en ONNX Runtime sobre CPU; la TFLite de referencia requiere el delegado QNN correspondiente para ejecutarse en HTP.
- GPU de escritorio (A100, H100, RTX 4090): no documentadas ni previstas para este modelo.
- Despliegue: ONNX Runtime (CPU y EP de QNN), TFLite con delegado QNN (Linux aarch64 y Android) y contextos nativos QNN en Android.
- Latencia: 0,439 ms p50 y 0,446 ms p95 en INT8 sobre HTP Linux; 0,671 ms p50 y 0,679 ms p95 en la linea base flotante. El throughput no se publica.

## Comparativa con modelos similares

No se dispone de datos de otros detectores termicos comparables en la informacion proporcionada, por lo que la comparativa cuantitativa no esta disponible. A modo de referencia estructural, se puede contrastar con el checkpoint de origen:

| Modelo | Formato | Cuantizacion | Licencia | Despliegue en HTP |
|---|---|---|---|---|
| HAE Nano IR (este) | ONNX, TFLite, QNN context | FP32, FP16, W8A8 | MIT | Si, compilado para QCS8550 HTP v73 |
| alexshynkarenk0/hae-n-ir-ext-kdf | ONNX | no disponible | MIT | No documentado |

## Limitaciones y advertencias

- El modelo solo detecta personas sobre imagenes termicas LWIR en escala de grises de 640 x 512; no es un detector generico ni acepta imagenes RGB sin adaptacion.
- El preprocesado y la decodificacion de cajas se ejecutan en el host, por lo que el grafo no es autocontenido y requiere codigo acompanante.
- Los contextos QNN nativos son especificos del objetivo (QCS8550, HTP v73, QAIRT 2.47.0.260601); no son portables a otros SoC o versiones de QAIRT sin recompilar.
- El AP absoluto es bajo (0,2345 en flotante, 0,2260 en INT8), lo que limita su uso en escenarios que exijan alta precision; conviene validar umbrales sobre el dominio concreto.
- La evaluacion se realiza sobre un subconjunto de 100 imagenes de HIT-UAV, una muestra reducida que no garantiza el comportamiento en otros sensores, altitudes o condiciones atmosfericas.
- No se documentan sesgos, datos de entrenamiento ni procedencia del dataset original, lo que dificulta evaluar riesgos de generalizacion.
- La licencia MIT permite uso comercial, pero el repositorio incluye `NOTICE` y `THIRD_PARTY_LICENSES.txt` que deben revisarse por dependencias de terceros.
- El uso de deteccion de personas en vigilancia puede estar sujeto a normativa de proteccion de datos y videovigilancia; la licencia no cubre obligaciones legales de despliegue.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/anan19990108/hae-n-ir-htp
- Modelo base: https://huggingface.co/alexshynkarenk0/hae-n-ir-ext-kdf
- Checkpoint de origen: https://huggingface.co/alexshynkarenk0/hae-n-ir-ext-kdf/blob/fe90c50eebb6f3afd3d1277d151edff489b84eb5/hae-n-ir-ext-kdf_lwir.onnx
- Resultados de evaluacion: https://huggingface.co/anan19990108/hae-n-ir-htp/blob/main/evaluation/results.json
- README detallado: https://huggingface.co/anan19990108/hae-n-ir-htp/blob/8d952550af3365d5f6ca80a4765fafc63b5a7e2a/README.md
- Ejemplo Linux TFLite INT8: https://huggingface.co/anan19990108/hae-n-ir-htp/blob/main/examples/LINUX_INT8.md
- Ejemplos Android en coma flotante: https://huggingface.co/anan19990108/hae-n-ir-htp/blob/main/examples/ANDROID.md
- Ejemplos Android INT8: https://huggingface.co/anan19990108/hae-n-ir-htp/blob/main/examples/ANDROID_INT8.md
- Configuracion de entrada/salida y postprocesado: https://huggingface.co/anan19990108/hae-n-ir-htp/blob/main/config.json
