# alexshynkarenk0/hae-n-ir-ext-kdf

## Resumen

hae-n-ir-ext-kdf es un detector de personas en imagenes termicas (LWIR) captadas por drones, disenado para tareas de busqueda y salvamento (search-and-rescue, SAR). Lo desarrolla el autor alexshynkarenk0 dentro de la familia de modelos "hae" y se distribuye bajo licencia MIT. El modelo resuelve el problema de la deteccion de personas en tiempo real sobre hardware de muy baja potencia, como una Raspberry Pi Zero 2 W, a partir de fotogramas de camara termica en escala de grises (white-hot).

Tecnicamente es una red de deteccion de objetos de tipo "anchor-free" con un total de 53.613 parametros y un coste de 0,052 GMAC por tile de 256x320 pixeles, aproximadamente 5 veces menos que el modelo hermano hae-s-ir. El artefacto de despliegue es un fichero ONNX cuantizado a int8 de 123 KB (con cabeza en fp32); existe tambien una version fp32 de referencia de 219-224 KB y pesos en safetensors para reentrenamiento. No es un modelo de lenguaje: no tiene contexto en tokens, sino una ventana de entrada de imagen con dimensiones multiplos de 32.

Se entreno desde cero sobre cinco conjuntos de datos termicos civiles con licencia abierta, usando destilacion de conocimiento desde un profesor "hae" de mayor tamano. Es relevante ahora porque demuestra que la deteccion de personas en infrarrojo puede ejecutarse en tiempo real en el borde (edge) con un consumo de recursos minimo, algo critico en drones SAR con restricciones severas de energia y computo.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal convolucional de deteccion de objetos anchor-free (decodificacion por maximos locales de `sigmoid(cls)` y cajas `softplus(box) x 4`), exportada a ONNX |
| Parametros totales | 53.613 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de vision; entrada de imagen con H y W multiplos de 32, p. ej. tiles de 256x320) |
| Tipos de cuantizacion | int8 (despliegue, cabeza fp32); fp32 de referencia; pesos PyTorch en safetensors |
| Idiomas soportados | en, uk (idiomas de la documentacion del modelo; la tarea de deteccion es independiente del idioma) |
| Licencia | MIT |
| Formato de pesos | ONNX (int8 y fp32) y safetensors (PyTorch) |

## Arquitectura y entrenamiento

hae-n-ir-ext-kdf es un detector convolucional de objetos con diseno anchor-free. La entrada `t` es un tensor float32 de forma `(B,1,H,W)`, con H y W multiplos de 32, normalizado como `(t - mean) / max(std, 1)` sobre la escala 0..255. Las salidas son `cls` de forma `(B,1,H/4,W/4)` (logits) y `box` de forma `(B,4,H/4,W/4)`. La decodificacion se hace tomando maximos locales 3x3 de `sigmoid(cls)`, y cada caja se obtiene como `softplus(box) x 4` alrededor del centro de celda `((j+0.5)·4, (i+0.5)·4)`.

El modelo se entreno desde cero sobre cinco conjuntos de datos termicos civiles con licencia abierta y empleo destilacion de conocimiento desde un profesor "hae" de mayor capacidad entrenado por el propio autor. El coste computacional es de 0,052 GMAC por tile de 256x320 pixeles, lo que lo situa aproximadamente 5 veces por debajo de hae-s-ir. La receta completa de entrenamiento (arquitectura y receta) esta en el fichero `config.json`, y todas las cifras de evaluacion, incluidos barridos de umbral y ambas escalas de entrada, en `metrics.json`.

## Capacidades

- Deteccion de personas en imagenes termicas LWIR (infrarrojo lejano) captadas desde drones (UAV).
- Deteccion de objetos pequenos ("tiny-object-detection") en escenas aereas, con personas de aproximadamente 25-30 px de altura en fotogramas de 640x512.
- Inferencia en tiempo real sobre hardware de borde de muy baja potencia, como una Raspberry Pi Zero 2 W.
- Ejecucion en CPU x86 y ARM mediante ONNX Runtime; soporte de rutas int8 y fp32.
- Entrada de imagen en 8 bits en escala de grises, formato "white-hot".
- Ajuste fino a partir de los pesos PyTorch en safetensors con el paquete `hae`.
- Soporte de dos escalas de entrada: x1.0 (por defecto, la validada en tiempo real en Raspberry Pi) y x1.5 (mas precisa fuera de linea, con 2,25 veces mas pixeles).
- Nota: no es un modelo de lenguaje, por lo que no ofrece tool calling, razonamiento multi-paso ni capacidades multilingues en el sentido de generacion de texto.

## Casos de uso

- Busqueda y salvamento con drones en tiempo real: el modelo procesa el flujo de video termico a bordo de un UAV y marca candidatos de personas sobre bosque, pradera o sendero, permitiendo al operador revisar zonas priorizadas sin transmitir video a un centro de computo.
- Vigilancia perimetral con hardware de bajo coste: desplegado en una Raspberry Pi Zero 2 W, puede analizar fotogramas termicos de forma continua con un consumo energetico minimo, adecuado para sensores remotos alimentados por bateria o panel solar.
- Vision nocturna en operaciones de campo: al trabajar sobre LWIR, funciona en condiciones de oscuridad total, humo o niebla ligera, complementando camaras RGB en misiones nocturnas.
- Preprocesado en el borde para reducir ancho de banda: en lugar de enviar video termico completo, el detector puede enviar solo coordenadas de posibles personas detectadas, reduciendo la telemetria necesaria en enlaces de baja capacidad.
- Integracion en pipelines de monitorizacion forestal: puede combinarse con sistemas de alerta temprana para localizar personas en zonas de incendio o terreno integral (AOS), donde alcanza AP50 de 0,780 a escala x1.0.
- Prototipado e investigacion en deteccion termica de personas: por su tamano (123 KB int8) y licencia MIT, es util como base para experimentos de destilacion, cuantizacion y despliegue en el borde.
- Aplicaciones educativas y de demostracion: la demo en el navegador del autor permite evaluar el modelo sobre fotogramas termicos sin necesidad de infraestructura, util para docencia o validacion rapida.

## Benchmarks y rendimiento

Resultados declarados por el autor (int8, IoU >= 0.5). Los valores de la model card incluyen las dos escalas de entrada:

| Conjunto | AP50 a x1.0 (por defecto) | AP50 a x1.5 | hae-s-ir AP50 (x1.5 / x1.0) |
|---|---:|---:|---:|
| WiSARD-IR val (sitios no vistos; 1.633 fotogramas, 2.439 personas) | 0,170 | 0,202 | 0,087 / 0,107 |
| HIT-UAV test (579 fotogramas, 2.611 personas) | 0,503 | 0,580 | 0,757 / 0,722 |
| AIResQ val (502 fotogramas, 933 personas, ~8 px de altura) | 0,042 | 0,188 | 0,230 / 0,074 |
| AOS thermal val (218 fotogramas, imagenes integrales de bosque) | 0,780 | 0,765 | 0,427 / 0,479 |
| RGB-LWIR Air val (20 fotogramas) | 0,559 | 0,621 | 0,644 / 0,683 |

Del model-index oficial (declarado, no verificado):

| Tarea | Conjunto | Metrica | Valor |
|---|---|---|---|
| Person detection (thermal, aerial) | WiSARD thermal (sitios no vistos) | AP50 (int8, IoU 0.5, entrada x1.5) | 0,202 |
| Person detection (thermal, aerial) | HIT-UAV (test split) | AP50 (int8, IoU 0.5, entrada x1.5) | 0,580 |
| Person detection (thermal, aerial) | AIResQ Benchmark (held-out groups) | AP50 (int8, IoU 0.5, entrada x1.5) | 0,188 |

Nota sobre int8: en CPUs x86 sin VNNI los resultados pueden diferir. En un AMD EPYC 7763 (solo AVX2), el modelo int8 detecto 13 personas en lugar de 16 en un fotograma de prueba con el preset equilibrado (con el preset sensible fueron identicas); en CPUs con AVX512-VNNI y en fp32 los recuentos son identicos. En esos equipos se recomienda usar el fichero fp32.

## Requisitos de hardware

- VRAM/almacenamiento de pesos: 123 KB para el fichero ONNX int8 y 219-224 KB para el fp32; el consumo de memoria en inferencia esta dominado por las activaciones de entrada, no por los pesos.
- Coste computacional: 0,052 GMAC por tile de 256x320 pixeles, aproximadamente 5 veces menos que hae-s-ir.
- Hardware de borde: validado en tiempo real en una Raspberry Pi Zero 2 W (ARM), con la escala x1.0. Cabe en cualquier GPU de consumo (RTX 4090, etc.), aunque es innecesario para su tamano.
- CPU x86: ejecutable via ONNX Runtime. En CPUs sin AVX512-VNNI puede haber discrepancias en el recuento con int8; usar fp32 en ese caso.
- Opciones de despliegue: ONNX Runtime a traves del paquete `hae` (`pip install "hae[hub] @ git+https://github.com/sashapiscivca-svg/hae@v1.0.0"`), o integracion directa con ONNX Runtime usando la normalizacion y decodificacion documentadas. El parametro `threads` del `Detector` permite fijar el paralelismo (p. ej. `threads=3`).
- Latencia y throughput: no se publican cifras concretas de latencia o FPS en la informacion disponible; la escala x1.5 procesa 2,25 veces mas pixeles que x1.0 y es por tanto mas lenta.

## Comparativa con modelos similares

La informacion proporcionada solo permite comparar con el modelo hermano hae-s-ir. No se dispone de datos comparativos frente a otros detectores termicos de terceros.

| Modelo | Parametros | Coste (GMAC/tile) | Tamano int8 | AP50 HIT-UAV (x1.5) | AP50 AIResQ (x1.5) | AP50 WiSARD (x1.5) | Licencia |
|---|---|---|---:|---:|---:|---:|---|
| hae-n-ir-ext-kdf | 53.613 | 0,052 | 123 KB | 0,580 | 0,188 | 0,202 | MIT |
| hae-s-ir | no disponible | ~5x mayor | no disponible | 0,757 | 0,230 | 0,087 | MIT (segun ficha) |
| Otros modelos termicos comparables | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

Segun la propia model card, hae-n-ir-ext-kdf esta optimizado para video en vivo en hardware tipo Raspberry Pi Zero 2 W y para escenas de bosque, pradera y sendero similares a WiSARD (personas de 25-30 px). Para personas pequenas y lejanas (8-20 px) y conjuntos como HIT-UAV o AIResQ, el autor recomienda hae-s-ir como modelo general.

## Limitaciones y advertencias

- Uso exclusivo como apoyo a la decision: el modelo omite personas y genera falsas alarmas. No debe utilizarse como unico medio de busqueda ni para cancelar una busqueda porque no detecte nada.
- Rendimiento bajo en objetos muy pequenos: en AIResQ (personas de ~8 px) el AP50 cae a 0,042 en x1.0 y 0,188 en x1.5.
- Rendimiento moderado en WiSARD (dominio objetivo): AP50 de 0,170 en x1.0 y 0,202 en x1.5, lo que implica una tasa considerable de fallos y falsos positivos.
- Sensibilidad a la cuantizacion int8 sin VNNI: en CPUs x86 sin AVX512-VNNI el recuento de detecciones puede diferir (13 frente a 16 personas en una prueba sobre AMD EPYC 7763). Se recomienda fp32 en esos equipos.
- Dependencia del dominio: esta afinado para escenas termicas aereas de tipo forestal/pradera; puede degradarse en otros entornos, sensores o condiciones meteorologicas no representadas.
- Escala de entrada: la escala x1.5 mejora la precision en cuatro de los conjuntos, pero es 2,25 veces mas costosa; el modelo por defecto (x1.0) es el validado en tiempo real en Raspberry Pi.
- Idiomas: la documentacion esta en en y uk; las etiquetas de idioma no implican capacidades de procesamiento de lenguaje natural.
- Licencia MIT: permite uso comercial, pero la propia model card exige un uso responsable y advierte de que no debe emplearse como unico medio de busqueda.
- Sin garantias de robustez en produccion: al tratarse de un modelo con 0 descargas y 0 "likes" en el momento de la ficha, no hay evidencia de validacion externa independiente.
- Riesgo de sesgo de dataset: los cinco conjuntos termicos civiles utilizados pueden no representar todas las condiciones de iluminacion, climatologia, vestimenta o morfologia de las personas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/alexshynkarenk0/hae-n-ir-ext-kdf
- Demo en vivo (navegador): https://huggingface.co/spaces/alexshynkarenk0/hae-demo
- Repositorio del modelo (model card, receta, ejemplos, tests): https://github.com/sashapiscivca-svg/hae-n-ir-ext-kdf
- Paquete de runtime y entrenamiento: https://github.com/sashapiscivca-svg/hae
- Model card completa (EN): https://github.com/sashapiscivca-svg/hae-n-ir-ext-kdf/blob/main/MODEL_CARD.md
- Model card completa (UK): https://github.com/sashapiscivca-svg/hae-n-ir-ext-kdf/blob/main/MODEL_CARD.uk.md
- Uso responsable: https://github.com/sashapiscivca-svg/hae-n-ir-ext-kdf/blob/main/RESPONSIBLE_USE.md
- Modelo hermano hae-s-ir: https://huggingface.co/alexshynkarenk0/hae-s-ir
- Dataset de anotaciones: https://huggingface.co/datasets/alexshynkarenk0/hae-thermal-sar-annotations
- No se han encontrado en la busqueda web resultados adicionales relevantes sobre este modelo.
