# elnemer7/ElNeMeR-C2PA-Metadata-Provenance-ONNX

## Resumen

ElNeMeR-C2PA-Metadata-Provenance-ONNX es un clasificador de procedencia de imagenes empaquetado en formato ONNX, publicado por el autor elnemer7 (Mahmoud ElNemer, ElNeMeR Digital Solutions & AI) dentro de una supuesta flota de 15 modelos orientados a forense digital y ayuda humanitaria. El modelo recibe 16 caracteristicas derivadas de los metadatos de un contenedor de imagen (metadatos C2PA, EXIF y de recompresion) y devuelve una distribucion de probabilidad sobre cuatro clases de procedencia: captura optica de camara, recompresion autentica de redes sociales (WhatsApp), exportacion de generador de IA y compuesto editado con software.

El problema que aborda es la verificacion de autenticidad de imagenes en un contexto en el que los generadores de difusion producen contenido indistinguible a simple vista y en el que las plataformas de mensajeria recomprimen y eliminan metadatos. La propuesta del autor es clasificar a partir de las huellas de metadatos y del contenedor, no del contenido visual, lo que en principio es mas barato computacionalmente y mas robusto frente a variaciones semanticas de la imagen.

La relevancia practica esta limitada por la informacion disponible: el repositorio tiene un tamano de 0.0 GB, cero descargas y cero likes, no se especifica pipeline, no se publican idiomas soportados, no hay model card con detalles de arquitectura, datos de entrenamiento ni evaluacion. Se trata, por tanto, de un artefacto ONNX de proposito muy especifico y de madurez temprana, no de un modelo de lenguaje ni de un modelo generativo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (clasificador tabular sobre 16 caracteristicas de metadatos; topologia de red no especificada) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entrada de 16 caracteristicas, no secuencias de texto) |
| Tipos de cuantizacion | no disponible (el artefacto se distribuye en ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible (la tarea no es linguistica; los metadatos pueden contener cadenas en cualquier idioma) |
| Licencia | MIT |
| Formato de pesos | ONNX |
| Entrada | vector de 16 caracteristicas de metadatos/procedencia |
| Salida | 4 probabilidades (`probabilities`) sobre las clases 0-3 |
| Clases | 0: `CAMERA_OPTICAL_PROVENANCE`; 1: `SOCIAL_WHATSAPP_AUTHENTIC_RECOMP`; 2: `AI_GENERATOR_PROVENANCE`; 3: `SOFTWARE_EDITED_COMPOSITE` |
| Libreria | onnx |
| Tamano del repositorio | 0.0 GB (segun Hugging Face) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo. La model card describe unicamente el contrato de entrada y salida: un contenedor de 16 caracteristicas que resume senales de procedencia (presencia y coherencia de manifiestos C2PA, campos EXIF, marcas de recompresion de plataformas de mensajeria y de software de edicion) y una capa de salida con cuatro clases mutuamente excluyentes expresadas como probabilidades. El nombre del repositorio y las etiquetas (`c2pa`, `media-provenance`, `image-forensics`, `digital-forensics`) confirman que el enfoque es de forense de contenedor y metadatos, no de analisis de pixeles con una CNN o un transformer visual.

No se han publicado detalles sobre el volumen de datos de entrenamiento, la composicion del dataset, el origen de las muestras etiquetadas, el esquema de validacion, ni si se aplicaron tecnicas de calibracion, aumento de datos o regularizacion. Tampoco se documenta el proceso de exportacion a ONNX (version de opset, herramientas empleadas, optimizaciones aplicadas). Cualquier afirmacion sobre el entrenamiento seria especulativa y, por tanto, se omite.

## Capacidades

- Clasificacion de procedencia de imagenes en cuatro categorias discretas a partir de metadatos del contenedor.
- Deteccion de exportaciones de generadores de difusion cuando los metadatos han sido eliminados o saneados (`AI_GENERATOR_PROVENANCE`).
- Distincion de recompresion autentica de plataformas de mensajeria, en particular WhatsApp (`SOCIAL_WHATSAPP_AUTHENTIC_RECOMP`), frente a capturas de camara.
- Identificacion de compuestos editados con software de retoque (`SOFTWARE_EDITED_COMPOSITE`).
- Verificacion de coherencia de manifiestos C2PA (Content Credentials) como senal de provenance.
- Inferencia via runtime ONNX, lo que permite despliegue en CPU sin dependencias de frameworks de deep learning pesados.
- No soporta generacion de texto, codigo, matematicas, vision por contenido, tool calling, agentes, razonamiento multi-paso ni capacidades multilingues: es un clasificador de proposito unico.

## Casos de uso

- Moderacion de contenido en plataformas: prefiltrar imagenes subidas por usuarios y marcar como sospechosas aquellas clasificadas como `AI_GENERATOR_PROVENANCE` o `SOFTWARE_EDITED_COMPOSITE` antes de una revision humana, reduciendo el coste de analisis manual.
- Verificacion periodistica: comprobar si una imagen recibida por WhatsApp conserva senales de recompresion autentica o si, por el contrario, procede de una exportacion de IA, como paso previo a la publicacion.
- Peritaje forense de evidencia digital: clasificar lotes de imagenes incautadas o aportadas en un procedimiento y priorizar las que presentan indicios de sintesis o edicion.
- Automatizacion de pipelines de confianza en repositorios de imagenes: etiquetar cada archivo con su clase de procedencia inferida y almacenar el resultado junto al manifiesto C2PA original.
- Deteccion de fraude documental: en tramites que aceptan fotos de documentos o productos, senalar imagenes que no provienen de una captura optica de camara.
- Investigacion sobre provenance: usar el modelo como linea base reproducible (licencia MIT, formato ONNX) para comparar heuristicas de metadatos frente a detectores basados en pixeles.
- Despliegue en entornos con recursos limitados: al ser un artefacto ONNX de un clasificador de 16 caracteristicas, puede ejecutarse en CPU o en dispositivos perifericos dentro de un servicio de ingesta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; por la naturaleza del artefacto (clasificador sobre 16 caracteristicas, repositorio de 0.0 GB) el requisito es despreciable y la ejecucion en CPU es viable.
- GPU recomendadas: no se especifican; no se requiere GPU para este tipo de modelo.
- Compatibilidad con GPU de consumo: si, en la practica cualquier GPU capaz de ejecutar ONNX Runtime, aunque no aporta ventaja frente a CPU.
- Opciones de despliegue: ONNX Runtime (Python, C++, C#, Java, JavaScript/Web), integracion en servicios backend, o conversion a otros runtimes compatibles con ONNX.
- Latencia y throughput estimados: no disponibles; no se publican mediciones.

## Comparativa con modelos similares

| Modelo | Tipo | Entrada | Clases | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ElNeMeR-C2PA-Metadata-Provenance-ONNX | Clasificador de metadatos en ONNX | 16 caracteristicas de contenedor | 4 | MIT | Hugging Face |
| Detectores de IA generativa basados en pixeles (familia generica) | CNN/ViT sobre imagen | Pixeles RGB | 2 (real/IA) | variable | variable |
| Verificadores C2PA de referencia | Reglas sobre manifiesto | Manifiesto C2PA | validacion criptografica | estandar abierto | herramientas oficiales C2PA |

No se dispone de datos publicados de rendimiento que permitan una comparacion cuantitativa con alternativas. Las filas de la tabla describen categorias de herramientas, no resultados medidos.

## Limitaciones y advertencias

- Ausencia total de evaluacion publicada: no hay metricas de exactitud, precision, recall, F1 ni matrices de confusion, por lo que no es posible estimar su fiabilidad en produccion.
- Dependencia critica de los metadatos: si el pipeline de ingesta elimina EXIF o manifiestos C2PA antes de la inferencia, las 16 caracteristicas de entrada pueden quedar vacias o degeneradas y la clasificacion perdera sentido.
- Riesgo de falsos positivos y negativos no cuantificado: las recompresiones de plataformas distintas de WhatsApp, las conversiones de formato y los reensamblados de contenedor pueden alterar las senales de procedencia.
- No analiza el contenido visual: una imagen sintetica con metadatos plausibles o una foto real con metadatos manipulados pueden inducir errores; no sustituye a un detector basado en pixeles.
- Sesgos desconocidos: al no documentarse el dataset de entrenamiento, no se puede evaluar el sesgo hacia fabricantes de camara, versiones de software de edicion o plataformas concretas.
- Madurez temprana: repositorio con cero descargas y cero likes, creado y actualizado el mismo dia, sin issues ni discusion; no hay evidencia de uso comunitario ni mantenimiento.
- Trazabilidad de la documentacion: la model card incluye marcas de verificacion y enlaces corporativos del autor que no constituyen validacion independiente del modelo.
- Licencia MIT: permite uso comercial y modificacion con atribucion y sin garantia; conviene conservar el aviso de copyright en redistribuciones.
- No apto para decisiones automatizadas de alto impacto sin revision humana: la clasificacion de procedencia no es una prueba pericial por si misma.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/elnemer7/ElNeMeR-C2PA-Metadata-Provenance-ONNX
- Plataforma de forense del autor: https://detector.elnemer-ai.com
- Portal corporativo del autor: https://elnemer-ai.com
- Especificacion C2PA (Content Credentials): https://c2pa.org
- ONNX Runtime: https://onnxruntime.ai
