# sensenova/SenseNova-U1.5-8B-MoT-Preview

## Resumen

SenseNova-U1.5-8B-MoT-Preview es un modelo multimodal unificado nativo desarrollado por SenseNova (SenseTime), que integra comprensión y generación de imágenes en una única arquitectura monolítica basada en NEO-unify. A diferencia de los sistemas que acoplan módulos separados mediante adaptadores, este modelo "piensa y actúa" directamente sobre el lenguaje y la visión, lo que permite tareas como generación de imágenes a partir de texto, edición con instrucciones y control regional fino, todo en un solo paso. Se presenta como una vista previa de una versión más refinada que se publicará próximamente.

El modelo destaca por su capacidad de generar imágenes nativas en resolución 4K con coherencia global y detalle fino, mejoras significativas en texturas, materiales, iluminación y realismo, así como un renderizado de texto en chino e inglés sustancialmente más fuerte. También ofrece edición de imágenes con control fino mediante máscaras, cajas delimitadoras y marcadores visuales. Aunque el nombre indica 8B, los pesos reales en safetensors suman 17.532.854.464 parámetros, lo que sugiere que podría tratarse de una arquitectura con parámetros compartidos o una designación comercial. Está disponible bajo licencia Apache 2.0 y soporta inglés y chino.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | NEO-unify (transformer multimodal unificado con capas de codificacion y decodificacion de parches) |
| Parametros totales | 17.532.854.464 (segun safetensors; el nombre indica 8B, posiblemente parametros activos o designacion comercial) |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ingles (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

SenseNova-U1.5-8B-MoT-Preview se construye sobre NEO-unify, una arquitectura que unifica de forma nativa el procesamiento de lenguaje y vision sin depender de adaptadores externos. Incorpora nuevas capas de codificacion y decodificacion de parches (patch encoding y decoding) que permiten manejar directamente los tokens visuales como parte del flujo del transformer. El entrenamiento amplia y refina el corpus de texto a imagen, e incluye datos de edicion filtrados y sintetizados tanto para referencias de imagen unica como multiple. No se han publicado detalles sobre el numero total de tokens de entrenamiento, la composicion exacta del dataset ni el uso de tecnicas como RLHF o DPO.

## Capacidades

- Generacion de imagenes nativas a partir de texto en resolucion 4K, con coherencia global y detalle fino.
- Edicion de imagenes con instrucciones en lenguaje natural, preservando la identidad del sujeto y la consistencia estructural.
- Control regional fino mediante mascaras, cajas delimitadoras y marcadores visuales.
- Renderizado de texto en ingles y chino dentro de las imagenes, con mejora notable en precision y legibilidad.
- Composicion de layouts densos y complejos, adecuada para infografias, carteles y contenido grafico.
- Capacidad multimodal any-to-any (entrada y salida de texto e imagen) en un unico modelo.
- No se especifican capacidades de audio, video o tool calling en la informacion disponible.

## Casos de uso

- Generacion de imagenes de alta resolucion para campanas publicitarias: el modelo produce salidas 4K con texturas y materiales realistas, reduciendo la necesidad de postprocesado.
- Edicion de fotografias de producto con instrucciones precisas: permite modificar iluminacion, fondo o elementos especificos sin perder la identidad del objeto.
- Creacion de infografias y material didactico: la capacidad de renderizar texto en chino e ingles y componer layouts densos facilita la generacion de graficos informativos.
- Ilustracion de libros y cuentos: al unificar comprension y generacion, puede crear secuencias de imagenes coherentes con una narrativa dada.
- Prototipado rapido de diseno grafico: los disenadores pueden iterar sobre conceptos visuales generando variaciones a partir de descripciones textuales.
- Edicion de imagenes con control regional para retoque fotografico: mediante mascaras o cajas, se pueden ajustar areas concretas sin afectar al resto de la imagen.
- Generacion de contenido para redes sociales: produce imagenes llamativas con texto integrado, ideal para publicaciones en varios idiomas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

No se dispone de datos oficiales sobre requisitos de hardware. Dado que el modelo tiene 17.532.854.464 parametros (aproximadamente 17.5B), se estima que la inferencia en precision FP16 requeriria alrededor de 35 GB de VRAM, y con cuantizacion INT4 podria reducirse a unos 9 GB, pero estos valores son orientativos y no estan confirmados por el autor. No se indican GPUs recomendadas ni opciones de despliegue especificas. Se recomienda consultar la documentacion oficial para obtener informacion actualizada.

## Comparativa con modelos similares

No disponible. No se han encontrado comparaciones con otros modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Es una version preview: el propio autor advierte que una version de produccion mas capaz y refinada se publicara proximamente, por lo que puede haber inestabilidades o limitaciones no documentadas.
- Solo soporta ingles y chino; no se menciona soporte para otros idiomas.
- No se ha publicado informacion sobre sesgos, riesgo de alucinacion o limitaciones de contexto.
- No se detallan restricciones de uso comercial mas alla de la licencia Apache 2.0, que permite uso comercial con atribucion.
- El nombre del modelo (8B) no coincide con el numero real de parametros (17.5B), lo que puede generar confusion sobre su tamano real y los requisitos de memoria.

## Enlaces

- [HuggingFace - SenseNova-U1.5-8B-MoT-Preview](https://huggingface.co/sensenova/SenseNova-U1.5-8B-MoT-Preview)
- [GitHub - OpenSenseNova/SenseNova-U1](https://github.com/OpenSenseNova/SenseNova-U1)
- [arXiv - 2605.12500](https://arxiv.org/abs/2605.12500)
- [Blog - NEO-unify](https://huggingface.co/blog/sensenova/neo-unify)
- [ModelScope - SenseNova-U1.5-8B-MoT-Preview](https://modelscope.cn/models/SenseNova/SenseNova-U1.5-8B-MoT-Preview)
- [Demo - SenseNova Studio](https://unify.light-ai.top/)
