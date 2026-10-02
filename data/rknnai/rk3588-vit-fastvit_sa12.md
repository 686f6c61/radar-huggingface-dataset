# RKNNAI/RK3588-VIT-fastvit_sa12

## Resumen

RK3588-VIT-fastvit_sa12 es un paquete de despliegue, no un modelo entrenado desde cero. Lo publica el usuario RKNNAI y contiene la configuración necesaria para ejecutar fastvit_sa12, un Vision Transformer híbrido de la familia FastViT desarrollada por Apple, sobre la NPU del SoC Rockchip RK3588. La entrada es una imagen de 256x256 píxeles y la salida es una clasificación de imagen (o un vector de características si se usa como backbone); no se trata de un modelo de lenguaje ni de un modelo multimodal generativo.

El modelo subyacente, FastViT sa12, es un clasificador de imágenes de aproximadamente 11,6 millones de parámetros y 2,0 GMACs, entrenado sobre ImageNet-1k con destilación por los autores del paper original. Este repositorio no redistribuye los pesos en formato PyTorch, sino una conversión al formato RKNN con cuantización fp16 y una única configuración para un núcleo NPU del RK3588, verificable mediante sumas SHA-256.

Su relevancia es práctica: permite ejecutar un clasificador de imágenes competitivo de forma local y de bajo consumo en placas SBC como Radxa Rock 5B+, Orange Pi 5 Plus o Banana Pi M7, sin GPU dedicada ni conexión a la nube. Es un artefacto de despliegue orientado a integradores de sistemas embebidos, con 0 descargas y 0 likes en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer hibrida FastViT (reparametrizacion estructural), variante sa12 |
| Parametros totales | aproximadamente 11,6 M (dato de referencia de `timm/fastvit_sa12.apple_dist_in1k`; no confirmado explicitamente por el autor de este repositorio) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de vision; entrada de imagen de 256x256) |
| Tipos de cuantizacion | fp16 (unica configuracion publicada) |
| Idiomas soportados | no aplica (clasificacion de imagenes; no procesa texto) |
| Licencia | apple-ml-fastvit (`license: other`, `license_name: apple-ml-fastvit`) |
| Formato de pesos | RKNN (despliegue para NPU de Rockchip); no se detalla la extension exacta de los ficheros en la informacion disponible |
| Resolucion de entrada | 256x256 |
| Nucleos NPU | 1 |
| Version de runtime RKNN | v2.4.0 |
| Chips soportados | RK3588 (unica configuracion listada) |
| Tamano del repositorio | 0,1 GB |
| Fecha de creacion | 2026-10-02 |
| Fecha de actualizacion | 2026-10-02 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

FastViT es una arquitectura de vision hibrida que combina componentes convolucionales y mecanismos de atencion, y que emplea reparametrizacion estructural: durante el entrenamiento se usan bloques sobreparametrizados que se fusionan en una topologia equivalente mas simple en inferencia, reduciendo el coste computacional sin degradar la precision. La variante sa12 corresponde a la subfamilia con atencion ("sa") del catalogo FastViT; el sufijo numerico identifica el tamano y la configuracion de canales. El paper de referencia es "FastViT: A Fast Hybrid Vision Transformer using Structural Reparameterization".

Segun la model card de `timm/fastvit_sa12.apple_dist_in1k`, el modelo fue entrenado sobre ImageNet-1k con destilacion por parte de los autores originales, con 11,6 M de parametros, 2,0 GMACs, 13,8 M de activaciones y entrada de 256x256. La informacion disponible no detalla el numero exacto de tokens de entrenamiento, la composicion completa del dataset mas alla de ImageNet-1k, ni si se aplicaron fases de ajuste adicionales.

El repositorio de RKNNAI no documenta el proceso de entrenamiento, sino la conversion y el empaquetado para la NPU: exportacion a RKNN, cuantizacion a fp16, asignacion a un nucleo NPU y fijacion de la resolucion de entrada a 256x256. Incluye ficheros `SHA256SUMS` para verificar la integridad de la configuracion antes del despliegue.

## Capacidades

- Clasificacion de imagenes: asigna una etiqueta de clase a una imagen de entrada de 256x256 píxeles.
- Extraccion de caracteristicas: puede emplearse como backbone convolucional/transformer para tareas posteriores como deteccion, segmentacion o recuperacion de imagenes, tal y como indica la model card de referencia del modelo en timm.
- Inferencia en el borde: ejecucion local sobre la NPU del RK3588, sin necesidad de GPU dedicada ni de conectividad a servicios en la nube.
- No soporta generacion de texto, razonamiento, codigo, matematicas ni conversacion: es un modelo puramente visual, no un modelo de lenguaje.
- No soporta tool calling ni function calling.
- No implementa agentes, razonamiento multi-paso ni modos de pensamiento.
- No tiene capacidades multilingues ni procesa audio o video directamente (trabaja fotograma a fotograma si se le alimenta video).
- Soporte de vision: si, como clasificador de imagen; no hay soporte de vision-lenguaje (VQA, captioning) en este repositorio.

## Casos de uso

- Control de calidad industrial en linea de produccion: clasificar piezas o productos como correctos o defectuosos a partir de imagenes capturadas por una camara fija, ejecutando la inferencia en el propio RK3588 para evitar latencia de red y costes de nube.
- Vigilancia y filtrado previo en camaras IP: usar el clasificador como etapa de cribado que descarte fotogramas sin interes antes de enviarlos a un sistema mas costoso, gracias al bajo consumo del RK3588.
- Robotica movil y drones: clasificacion de escenas o de objetos a bordo, con un modelo de aproximadamente 11,6 M de parametros que cabe holgadamente en la memoria de un SoC embebido.
- Agricultura de precision: deteccion visual de estados de cultivo o presencia de plagas en dispositivos de campo alimentados por bateria o panel solar.
- Retail y maquinas expendedoras: reconocimiento de productos en lineales inteligentes o en sistemas de pago automatico mediante vision, con inferencia local por privacidad.
- Extraccion de embeddings para busqueda visual: emplear la salida del backbone para indexar y recuperar imagenes similares en un catalogo local.
- Accesibilidad y asistencia: preclasificacion de escenas para aplicaciones de descripcion de entorno en dispositivos de bajo consumo.
- Prototipado en placas SBC: validar rapidamente un pipeline de vision sobre RK3588 antes de invertir en hardware mas potente o en modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio de despliegue no incluye metricas de precision ni de latencia, y la model card de referencia en timm (`fastvit_sa12.apple_dist_in1k`) tampoco aporta cifras de exactitud en los datos proporcionados; solo indica que se entreno sobre ImageNet-1k con destilacion. No se deben asumir valores concretos de Top-1 o Top-5 sin consultar el paper original.

## Requisitos de hardware

- Hardware objetivo: SoC Rockchip RK3588, con NPU de 6 TOPS, CPU octa-core de 64 bits y GPU ARM Mali-G610 MP4.
- Acelerador utilizado: NPU del RK3588, configurada con 1 nucleo y cuantizacion fp16.
- VRAM estimada: no aplica (no requiere GPU dedicada); el consumo de memoria RAM del sistema no se detalla en la informacion disponible. El repositorio completo ocupa 0,1 GB.
- GPU recomendadas: no disponible; el despliegue esta pensado para la NPU del RK3588, no para GPU de escritorio o centro de datos.
- ¿Cabe en hardware de consumo? Si, en placas SBC con RK3588 como Radxa Rock 5B+, Orange Pi 5 Plus, Banana Pi M7 o el equipo AIBOX-3588 de Firefly. No se proporcionan requisitos para GPU domesticas.
- Opciones de despliegue: SDK RKNPU (runtime RKNN v2.4.0), ejemplos de Python API y C API del repositorio `airockchip/rknn_model_zoo`, y descarga mediante ModelScope o Hugging Face (`hf download`).
- Latencia y throughput estimados: no disponible; la documentacion no incluye mediciones de tiempo de inferencia ni de imagenes por segundo.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Resolucion | Licencia | Formato y destino |
|---|---|---|---|---|---|
| RKNNAI/RK3588-VIT-fastvit_sa12 | Despliegue RKNN de FastViT sa12 | aproximadamente 11,6 M (referencia) | 256x256 | apple-ml-fastvit (`other`) | RKNN sobre NPU RK3588, 1 nucleo, fp16 |
| timm/fastvit_sa12.apple_dist_in1k | Modelo original FastViT sa12 para clasificacion | 11,6 M (2,0 GMACs, 13,8 M de activaciones) | 256x256 | Licencia Apple original | Pesos PyTorch/timm sobre GPU o CPU |
| Alternativas de clasificacion ligera (MobileNetV3, EfficientNet-B0, DeiT-Tiny, otras variantes FastViT como sa24 o t8) | Clasificadores de imagen | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos comparativos de precision ni de latencia entre estas opciones en la informacion proporcionada; la comparacion se limita al empaquetado, el destino de ejecucion y los datos publicados del modelo de referencia.

## Limitaciones y advertencias

- Es un artefacto de despliegue, no un modelo nuevo: su calidad depende enteramente del modelo FastViT sa12 original.
- Solo cubre un chip (RK3588) y una unica configuracion (256x256, fp16, 1 nucleo NPU). No hay variantes para otros SoC ni cuantizaciones alternativas.
- Sesgos conocidos: hereda los sesgos de ImageNet-1k y de las clases alli representadas; puede fallar en dominios visuales alejados de ese dataset.
- Riesgo de alucinacion en sentido estricto: no aplica a un clasificador, pero si existe riesgo de clasificaciones erroneas con alta confianza en imagenes fuera de distribucion.
- Idiomas: no aplica; el modelo no procesa texto.
- Licencia: `license: other` con nombre `apple-ml-fastvit`. Es una licencia personalizada de Apple, no una licencia de codigo abierto estandar, por lo que el uso comercial debe verificarse en el fichero `LICENSE` y en los avisos de terceros de `ACKNOWLEDGEMENTS` antes de cualquier despliegue en produccion.
- Estado del repositorio: 0 descargas y 0 likes, sin pipeline declarado y sin validacion externa conocida; se recomienda verificar las sumas SHA-256 y probar la configuracion en el hardware real antes de integrarla.
- La informacion disponible no documenta latencia, consumo energetico, precision en ImageNet ni el proceso de conversion, lo que dificulta estimar el rendimiento en produccion sin medirlo.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/RKNNAI/RK3588-VIT-fastvit_sa12
- Modelo de referencia en timm: https://huggingface.co/timm/fastvit_sa12.apple_dist_in1k
- Codigo y pesos originales de FastViT (Apple): https://github.com/apple/ml-fastvit
- RKNN Model Zoo (ejemplos de despliegue y API Python/C): https://github.com/airockchip/rknn_model_zoo
- RKNN LLM (herramientas de despliegue de Rockchip): https://github.com/airockchip/rknn-llm
- Coleccion de modelos RK3588 en Hugging Face: https://huggingface.co/collections/jamescallander/rk3588-rkllm-models
- Wiki de Firefly sobre AIBOX-3588 y despliegue de modelos: https://wiki.t-firefly.com/en/AIBOX-3588/usage_llm_rockchip.html
- ModelScope (mismo repositorio, descarga alternativa): busqueda de `RKNNAI/RK3588-VIT-fastvit_sa12`, revision `v2.4.0`
