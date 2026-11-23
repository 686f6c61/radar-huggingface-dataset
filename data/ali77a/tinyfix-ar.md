# ali77a/tinyfix-ar

## Resumen

tinyfix-ar es un modelo compacto de corrección ortográfica del árabe diseñado para ejecutarse íntegramente en el navegador. Lo desarrolla el autor independiente ali77a y aborda un problema específico que los correctores convencionales no cubren: errores en los que la palabra escrita existe realmente en el léxico o es una variante ortográfica frecuente, como `الى` en lugar de `إلى`, `المدرسه` en lugar de `المدرسة` o `الرياظ` en lugar de `الرياض`. El modelo se publica en formato ONNX con pesos cuantizados a int8 y un tamaño de 9 MB, lo que permite su despliegue en cliente sin infraestructura de servidor.

La arquitectura no es un transformer: se trata de una red recurrente ligera con vectores de palabra de 64 dimensiones y dos GRU de 512 unidades (una para el contexto izquierdo y otra para el derecho), que puntúa la palabra escrita frente a un conjunto precalculado de candidatos y sustituye solo cuando el margen supera un umbral calibrado. Cuenta con 8,9 millones de parámetros y un vocabulario de 100.000 palabras. La licencia MIT y la disponibilidad de un paquete npm lo hacen directamente integrable en aplicaciones web.

Su relevancia radica en el equilibrio entre tamaño y utilidad práctica: corrige entre el 54,8 % y el 62,4 % de los errores objetivo en conjuntos de referencia como QALB-2014, QALB-2015 y ZAEBUC, con una tasa de cambios incorrectos de entre 0,35 y 0,63 por cada 1.000 palabras correctas, manteniendo el modelo por debajo de los 10 MB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red recurrente con vectores de palabra de 64 dimensiones y dos GRU de 512 unidades (contexto izquierdo y derecho) |
| Parametros totales | 8,9 millones |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 16 palabras a la izquierda y 4 a la derecha |
| Tipos de cuantizacion | int8 (modelo distribuido ya cuantizado) |
| Idiomas soportados | Árabe (incluye texto en dialecto saudí como entrada, aunque con menor rendimiento) |
| Licencia | MIT |
| Formato de pesos | ONNX (`model.onnx`), acompañado de `vocab.txt`, `neighbors.u32`, `neighbor_kinds.u8`, `valid.u8`, `kinds.json` y `manifest.json` |

## Arquitectura y entrenamiento

El modelo implementa un corrector de palabras aisladas con contexto local. Cada una de las 100.000 palabras del vocabulario dispone de hasta 8 candidatos precalculados: confusiones curadas, variantes ortográficas, palabras de sonido similar y erratas a una edición de distancia. La red procesa la palabra escrita junto con 16 palabras de contexto a la izquierda y 4 a la derecha mediante dos GRU, y calcula un producto escalar contra los vectores de los candidatos. Solo aplica la sustitución cuando el margen de la puntuación supera un umbral calibrado por tipo de edición, con umbrales separados para palabras válidas y para erratas conocidas. Las palabras en dialecto saudí sin candidatos asociados nunca se modifican.

El entrenamiento emplea aproximadamente 165 millones de tokens procedentes de Wikipedia árabe (CC BY-SA 3.0), FineWeb2-HQ y sitios saudíes de FineWeb2 (ODC-By), libros de Hindawi (CC BY 4.0), conjuntos de chat árabe y Aya (Apache-2.0), noticias de Al Jazeera, texto de la Asamblea General de la ONU, texto corregido de QALB-2014 y unas 8.500 frases revisadas manualmente. Los errores sintéticos se generan sustituyendo palabras por sus candidatos y por erratas conocidas. Los conjuntos de evaluación proceden del repositorio `arabic-gec` del CAMeL Lab y no se usaron en el entrenamiento.

## Capacidades

- Corrección ortográfica del árabe en tiempo real mientras se escribe, orientada a despliegue en navegador.
- Detección de errores que los correctores convencionales pasan por alto: palabras reales mal empleadas, variantes ortográficas y erratas frecuentes.
- Puntuación contextual de candidatos mediante ventana local de 16 palabras a la izquierda y 4 a la derecha.
- Umbrales calibrados por tipo de edición para limitar los falsos positivos.
- Protección del dialecto saudí: las palabras sin candidatos no se modifican.
- API JavaScript mediante el paquete npm `tinyfix-ar` con función `loadTinyfixAr()` y método `fix()`.
- Ejecución local en cliente mediante ONNX Runtime, sin llamadas a servidor.
- No dispone de tool calling, capacidades de agente, visión, audio ni modo de razonamiento extendido.

## Casos de uso

- Corrección en tiempo real en formularios web: el modelo se carga como ONNX en el navegador y corrige cada palabra al escribirla, sin latencia de red ni envío de texto a un servidor, lo que resulta adecuado para aplicaciones que manejan datos sensibles.
- Procesadores de texto y editores árabes: integración mediante el paquete npm para ofrecer autocorrección contextual en campos de entrada, con la ventana de 16+4 palabras suficiente para desambiguar variantes como `الى` frente a `إلى`.
- Moderación y normalización de comentarios: el rendimiento en QALB-2014 (59,1 % de errores corregidos, 95,7 % de cambios acertados) lo hace apto para limpiar texto generado por usuarios en plataformas de noticias y foros.
- Normalización previa a pipelines de NLP: al corregir variantes ortográficas frecuentes, reduce la dispersión del vocabulario antes de tareas de búsqueda, indexación o análisis, con un coste de 9 MB por instancia.
- Aplicaciones educativas de escritura árabe: la baja tasa de cambios incorrectos (0,35 a 0,63 por 1.000 palabras correctas) permite señalar errores a estudiantes sin introducir correcciones falsas que confundan el aprendizaje.
- Procesamiento de ensayos académicos: el rendimiento en ZAEBUC (54,8 % de errores corregidos, 95,2 % de precisión en los cambios) lo hace utilizable en herramientas de revisión de textos universitarios.
- Extensiones de navegador y widgets ligeros: el tamaño total de 14 MB de la carpeta y la licencia MIT permiten distribuirlo dentro de extensiones sin dependencias externas.

## Benchmarks y rendimiento

Resultados medidos sobre el modelo int8 con los umbrales publicados, contando solo las palabras que el modelo está diseñado para corregir:

| Conjunto de prueba | Errores corregidos | Cambios acertados | Cambios incorrectos por 1.000 palabras correctas |
|---|---:|---:|---:|
| QALB-2014 test (comentarios de noticias) | 59,1 % | 95,7 % | 0,35 |
| QALB-2015 L1 test | 62,4 % | 96,0 % | 0,63 |
| ZAEBUC (ensayos universitarios) | 54,8 % | 95,2 % | 0,54 |
| Escritura saudí, árabe estándar | 60,5 % | 97,1 % | 0,00 |
| Texto limpio reservado | no disponible | no disponible | 0,38 |

No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada: inferior a 100 MB en cualquier configuración; el modelo ONNX ocupa 9,0 MB y la carpeta completa 14 MB.
- GPU: no requiere GPU; está diseñado para ejecución en CPU dentro del navegador mediante ONNX Runtime.
- Cabe en cualquier GPU de consumo e incluso en dispositivos móviles y navegadores sin aceleración por hardware.
- Opciones de despliegue: ONNX Runtime en navegador, paquete npm `tinyfix-ar`, o cualquier runtime compatible con ONNX en servidor.
- Latencia y throughput: no disponibles en la información proporcionada; el diseño orientado a corrección al teclear sugiere latencias de milisegundos por palabra, pero no se publican cifras.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. Los correctores ortográficos árabes habituales (por ejemplo, los basados en CAMeL Tools o en modelos transformer de corrección gramatical) difieren en arquitectura y tamaño, pero no se han incluido datos de comparación en la información disponible, por lo que no se presenta tabla comparativa.

## Limitaciones y advertencias

- Solo corrige una palabra por otra de su lista de candidatos; no corrige gramática, orden de palabras ni palabras fuera de su vocabulario de 100.000 entradas.
- En texto en dialecto saudí corrige menos errores (24 %) y acierta menos en los cambios (73 %) que en árabe estándar.
- Prioriza no alterar palabras correctas: deja pasar aproximadamente 4 de cada 10 errores objetivo.
- La ventana de contexto es corta (16 palabras a la izquierda y 4 a la derecha), lo que limita la desambiguación en construcciones que dependen de contexto más amplio.
- No se han publicado análisis de sesgos; al operar sobre léxico y candidatos precalculados, las sustituciones quedan restringidas a esa lista, pero no hay evaluación independiente disponible.
- Riesgo de alucinación no aplica en el sentido generativo, ya que el modelo no genera texto libre, sino que selecciona entre candidatos.
- Licencia MIT: permite uso comercial sin restricciones adicionales conocidas, si bien conviene verificar las licencias de los datos de entrenamiento (CC BY-SA 3.0, ODC-By, CC BY 4.0, Apache-2.0) si se redistribuyen derivados.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validación comunitaria independiente del rendimiento declarado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ali77a/tinyfix-ar
- Demo en navegador: https://tinyfix-ar.ali77dhamen.workers.dev
- Paquete npm: https://www.npmjs.com/package/tinyfix-ar
- Código fuente: https://github.com/y0u-0/tinyfix-ar
- Repositorio de conjuntos de evaluación CAMeL Lab `arabic-gec`: no disponible como enlace directo en la información proporcionada
