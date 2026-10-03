# ECE-Software/t1-weapon-fp32

## Resumen

t1-weapon-fp32 es un modelo de vision artificial publicado por ECE-Software en HuggingFace, orientado a la deteccion de armas en imagenes dentro de pipelines de moderacion de contenido. Se distribuye como un unico fichero ONNX en precision FP32 de 12,27 MB, lo que lo situa en la categoria de modelos muy ligeros pensados para ejecutarse en servidor sobre el 100 % de las subidas de una plataforma. La model card lo clasifica como "Tier T1" dentro de una jerarquia propia de moderacion.

El modelo distingue cuatro clases: Gun, explosion, grenade y knife, y aplica un umbral de decision fijado en 0,35. Segun el autor, su funcion dentro del sistema es actuar como capa de verificacion que "captura el 100 % de los fallos de armas de T0", es decir, como segunda pasada sobre imagenes que un modelo de nivel inferior no ha marcado. No se proporcionan datos sobre arquitectura, dataset de entrenamiento ni metricas formales de evaluacion.

La relevancia practica del modelo radica en su coste de despliegue: al ser un ONNX FP32 de apenas 12 MB, puede ejecutarse en CPU con ONNX Runtime sin GPU dedicada, lo que facilita integrarlo como filtro previo en servicios de subida de contenido. Su licencia Apache 2.0 permite uso comercial sin restricciones conocidas, aunque la ausencia de documentacion tecnica y de evaluacion publicada limita su adopcion en entornos regulados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible (estimacion: del orden de 3,07 M si todo el fichero FP32 fuese pesos, a partir de los 12,27 MB declarados) |
| Longitud de contexto | no aplica (modelo de vision; la entrada es una imagen) |
| Tipos de cuantizacion | FP32 en formato ONNX; no se documentan otras variantes |
| Idiomas soportados | no disponible (no aplica a la tarea declarada) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (FP32), fichero `model.onnx` |
| Modalidad | imagen |
| Tarea declarada | deteccion de armas (weapon detection) |
| Clases | Gun, explosion, grenade, knife |
| Umbral de decision | 0,35 |
| Nivel o tier | T1 (jerarquia del autor) |
| Tamano del fichero | 12,27 MB |
| Tamano del repositorio | 0,0 GB segun la API de HuggingFace |
| Descargas / likes | 0 / 0 en el momento de la consulta |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura del modelo. La model card no indica si se trata de una CNN, un transformer de vision, un detector tipo YOLO ni ninguna otra familia concreta, ni especifica resolucion de entrada, normalizacion de pixeles, numero de capas o mecanismo de cabecera. Tampoco se detalla si la salida son logits por clase (clasificacion) o cajas delimitadoras (deteccion de objetos), a pesar de que la tarea se declare como "weapon detection".

Respecto al entrenamiento, no hay datos disponibles sobre el numero de tokens o imagenes, la composicion del dataset, el origen de las anotaciones, ni si se aplicaron tecnicas de ajuste fino, aumento de datos o calibracion de umbrales. La unica afirmacion operativa de la model card es cualitativa: el modelo se ejecuta en servidor sobre el 100 % de las subidas y, en la verificacion del autor, captura el 100 % de los fallos de armas no detectados por el nivel T0. Se trata de una afirmacion del autor sin protocolo de evaluacion publicado, por lo que no debe interpretarse como una metrica reproducible.

## Capacidades

- Clasificacion o deteccion de imagenes en cuatro categorias: arma de fuego (Gun), explosion, granada (grenade) y cuchillo (knife).
- Moderacion automatica de contenido visual subido por usuarios, con umbral de decision configurable en 0,35.
- Ejecucion en servidor con ONNX Runtime, segun el ejemplo de uso de la model card, usando el proveedor de ejecucion de CPU (`CPUExecutionProvider`).
- Inferencia sobre el 100 % de las subidas declaradas por el autor, lo que implica un coste por inferencia bajo y compatible con procesamiento en linea.
- Uso como capa de verificacion secundaria (T1) sobre los resultados de un modelo de nivel inferior (T0) para reducir falsos negativos en armas.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, generacion de texto, vision multimodal, audio ni procesamiento de lenguaje natural, ya que la modalidad declarada es unicamente imagen.
- No se documentan capacidades multilingues ni ninguna capacidad especial adicional (modo thinking, salida estructurada, etc.).

## Casos de uso

- Moderacion de subidas en redes sociales y foros: el modelo puede insertarse en el pipeline de ingesta de imagenes y evaluar cada fichero antes de publicarlo, aprovechando su tamano de 12,27 MB para ejecutarse en CPU y evitar cuellos de botella en el servicio de subida.
- Verificacion de falsos negativos de un filtro previo: al estar disenado como tier T1, encaja como segunda pasada sobre las imagenes que un modelo T0 ha dejado pasar, de modo que solo se ejecuta sobre el subconjunto dudoso y reduce el coste total del sistema.
- Marketplace de articulos de segunda mano: filtrado de anuncios con fotografias de armas, explosivos o cuchillos que infrinjan las politicas de la plataforma, con el umbral 0,35 como punto de partida para derivar a revision humana.
- Mensajeria y aplicaciones con contenido generado por el usuario: analisis de fotos de perfil, avatares, stickers o imagenes adjuntas antes de que se distribuyan a otros usuarios.
- Cumplimiento normativo y trazabilidad: generacion de senales de moderacion que alimenten colas de revision humana y registros de auditoria exigidos por normativas de contenido digital, con la ventaja de la licencia Apache 2.0 para despliegues comerciales.
- Triaje para equipos de confianza y seguridad: priorizacion automatica de la cola de revision, de forma que los casos marcados con mayor confianza se atiendan antes que el resto.
- Analitica offline sobre repositorios de imagenes ya almacenadas: al ser un modelo pequeno y ejecutable en CPU, permite reescanear catalogos historicos sin aprovisionar GPU.
- Despliegue en entornos de borde o con recursos limitados: su tamano permite integrarlo en contenedores ligeros o dispositivos con CPU modesta, siempre que se acepte la latencia no documentada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de precision, recall, F1, mAP ni comparaciones con otros modelos. La unica afirmacion de rendimiento es cualitativa y atribuida al autor: el modelo "captura el 100 % de los fallos de armas de T0 en la verificacion". No se especifica el conjunto de evaluacion, el numero de muestras, la definicion de fallo ni el procedimiento de medida, por lo que no es verificable de forma independiente.

| Metrica | Valor |
|---|---|
| Precision / recall / F1 | no disponible |
| mAP u otras metricas de deteccion | no disponible |
| Conjunto de evaluacion | no disponible |
| Afirmacion del autor | captura el 100 % de los fallos de armas de T0 en verificacion (sin protocolo publicado) |
| Umbral usado | 0,35 |

## Requisitos de hardware

- VRAM estimada para inferencia: minima. Los pesos ocupan 12,27 MB en FP32; el consumo real dependera del runtime y del tamano de la imagen de entrada, pero cabe holgadamente en cualquier GPU consumer e incluso en memoria de CPU.
- GPU recomendadas: no se especifica ninguna. El ejemplo oficial usa `CPUExecutionProvider`, lo que sugiere que la GPU es innecesaria. Cualquier GPU con soporte de ONNX Runtime CUDA (RTX 3060, RTX 4090, A100, H100) puede ejecutarlo, aunque seria sobredimensionado para esta carga.
- Compatibilidad con GPU consumer: si, y tambien ejecucion en CPU exclusivamente, que es el escenario declarado en la model card.
- Opciones de despliegue: ONNX Runtime es el runtime documentado, con proveedores de CPU y, previsiblemente, CUDA. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, herramientas orientadas a modelos de lenguaje que no aplican a esta tarea.
- Latencia y throughput: no disponibles. No se publican mediciones de milisegundos por imagen, imagenes por segundo ni comportamiento bajo carga concurrente.

## Comparativa con modelos similares

No se dispone de datos verificables de modelos comparables en la informacion proporcionada, y la model card no incluye ninguna comparacion. Existen otras familias de detectores de armas y de moderacion visual de codigo abierto, pero no se han aportado sus parametros, contexto, rendimiento ni condiciones de licencia en esta busqueda, por lo que no se pueden tabular con rigor.

| Criterio | t1-weapon-fp32 | Alternativas comparables |
|---|---|---|
| Parametros | no disponible (estimacion ~3,07 M) | no disponible |
| Formato | ONNX FP32 | no disponible |
| Clases | 4 (gun, explosion, grenade, knife) | no disponible |
| Licencia | Apache 2.0 | no disponible |
| Rendimiento publicado | no disponible | no disponible |

## Limitaciones y advertencias

- Ausencia total de documentacion sobre arquitectura, datos de entrenamiento y procedimiento de evaluacion, lo que impide auditar el modelo o reproducir sus resultados.
- No se han publicado metricas de precision, recall ni falsos positivos; la afirmacion de capturar el 100 % de los fallos de T0 no es verificable.
- Riesgo de falsos positivos en objetos con forma similar a un arma (utensilios de cocina, herramientas, juguetes, kirpan o replicas), especialmente con un umbral relativamente bajo de 0,35 y sin datos de calibracion.
- Riesgo de falsos negativos ante clases no cubiertas: el modelo solo contempla cuatro categorias y no detecta otras amenazas (armas blancas distintas del cuchillo, armas improvisadas, etc.).
- La model card no especifica la resolucion de entrada, la normalizacion de pixeles ni el preprocesado requerido, lo que puede provocar degradacion silenciosa si se integra con supuestos distintos a los del entrenamiento.
- No se documenta ninguna evaluacion de sesgos por demografia, contexto cultural o tipo de imagen, ni el origen del dataset de entrenamiento.
- El repositorio registra 0 descargas y 0 likes, sin comunidad que haya validado el modelo, y el tamano reportado por la API (0,0 GB) no coincide con los 12,27 MB declarados en la model card.
- La licencia Apache 2.0 permite uso comercial y modificacion, pero el usuario asume toda la responsabilidad sobre el cumplimiento normativo y sobre las decisiones automatizadas tomadas a partir de las salidas del modelo.
- Para produccion en moderacion de contenido se recomienda encarecidamente acompanarlo de revision humana, dado el impacto de los falsos positivos y negativos en este dominio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ECE-Software/t1-weapon-fp32
- Fichero de pesos: https://huggingface.co/ECE-Software/t1-weapon-fp32/blob/main/model.onnx
- No se han encontrado en la busqueda web enlaces relevantes al modelo, al autor ni a documentacion tecnica asociada. Los resultados devueltos corresponden a la Ecole Centrale d'Electronique (ECE), una escuela de ingenieria francesa sin relacion con el modelo.
