# 2008-horse/horse-furigana

## Resumen

Horse Furigana 1.1 es un modelo especializado en la anotacion automatica de furigana sobre texto japones: dado un texto con kanji, selecciona una lectura (yomigana) para cada caracter y la devuelve asociada al termino correspondiente. Lo desarrolla el autor independiente 2008-horse y se distribuye como un unico fichero ONNX cuantizado a int8 de aproximadamente 7,7 MB, acompanado de ficheros de datos auxiliares (vocabulario, candidatos de kanji, lecturas y nombres propios) que suman cerca de 26 MB adicionales.

El modelo esta disenado para ejecucion local y sin servidor, lo que lo hace adecuado para integrarse en aplicaciones de escritorio, extensiones o pipelines de procesamiento de texto en entornos sin conectividad. La model card no especifica la arquitectura interna, el numero de parametros ni el contexto maximo, por lo que estos datos se marcan como no disponibles.

Su relevancia radica en la dificultad intrinseca del problema: la lectura de un kanji depende del contexto lexico y de la palabra completa, y los nombres propios japoneses presentan lecturas especialmente ambiguas. La presencia de un fichero especifico de nombres (`names.json`) sugiere que el autor aborda explicitamente ese caso. El modelo se distribuye con licencia propia (Horse Models Community License v2.0) que permite uso no comercial gratuito y exige licencia para uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo ONNX; arquitectura interna no declarada) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se declara como MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 (fichero `model.int8.onnx`); no se ofrecen otras variantes |
| Idiomas soportados | japones (ja) |
| Licencia | Horse Models Community License v2.0 (uso no comercial gratuito; comercial bajo licencia) |
| Formato de pesos | ONNX (int8) |
| Tamano del modelo | 7.671.698 bytes (`model.int8.onnx`) |
| Ficheros auxiliares | `vocab.json` (114 KB), `kanji-candidates.json` (311 KB), `readings.json` (19 MB), `names.json` (4,7 MB) |
| Runtime de referencia | onnxruntime-node 1.19.2 sobre CPU |
| Verificacion de integridad | `SHA256SUMS` firmado con minisign (`SHA256SUMS.minisig`) |
| Repositorio | 0.0 GB segun Hugging Face (descargas y likes a 0 en el momento de la consulta) |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna del modelo, el volumen de datos de entrenamiento, la composicion del corpus ni si se aplicaron tecnicas de ajuste como RLHF o DPO. Lo unico verificable es el artefacto distribuido: un grafo ONNX cuantizado a int8 de 7,7 MB que se ejecuta sobre onnxruntime. El diseno del paquete sugiere un enfoque hibrido entre un componente neuronal (el grafo ONNX) y tablas de datos externas: `kanji-candidates.json` probablemente enumera las lecturas posibles por caracter, `readings.json` contiene el diccionario de lecturas y `names.json` cubre lecturas de nombres propios, un dominio donde la desambiguacion puramente estadistica falla con frecuencia.

El autor advierte explicitamente de que las lecturas pueden variar ligeramente entre runtimes y versiones de onnxruntime; la evaluacion se realizo con onnxruntime-node 1.19.2 en CPU y no se garantiza identidad de resultados entre plataformas. Esta advertencia es relevante para produccion: implica que el determinismo no esta asegurado y que conviene fijar la version del runtime y validar la salida en el entorno objetivo.

## Capacidades

- Asignacion de furigana a texto japones: selecciona una lectura para cada kanji en funcion del contexto de la palabra.
- Desambiguacion de lecturas multiples: usa candidatos por kanji y un diccionario de lecturas para resolver casos ambiguos.
- Tratamiento de nombres propios: incluye un fichero especifico (`names.json`) para lecturas de nombres, un caso notoriamente dificil en japones.
- Ejecucion totalmente offline: no requiere servidor ni conectividad, al ser un modelo ONNX local.
- Inferencia en CPU: el runtime de referencia es onnxruntime-node sobre CPU, sin requisito de GPU.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni modo thinking.
- No se documenta capacidad multilingue: el unico idioma declarado es japones.

## Casos de uso

- Anotacion de texto para lectores principiantes: generar furigana sobre articulos, cuentos o materiales didacticos en japones para estudiantes que aun no dominan los kanji, ejecutando el modelo localmente en la aplicacion de lectura.
- Accesibilidad y sintesis de voz: obtener la lectura correcta de cada kanji antes de enviar el texto a un motor TTS, evitando pronunciaciones erroneas en nombres y terminos compuestos.
- Procesamiento por lotes de corpus japoneses: enriquecer datasets con anotaciones de lectura en pipelines offline, aprovechando el tamano reducido del modelo (7,7 MB) para procesar grandes volumenes sin coste de API.
- Extensiones de navegador y editores de texto: integrar la anotacion de furigana en tiempo real sobre paginas web o documentos, ya que el modelo no necesita red y cabe en el cliente.
- Normalizacion de nombres propios en bases de datos: usar `names.json` para asignar lecturas consistentes a nombres de personas y entidades en sistemas de registro o CRM japoneses.
- Preprocesamiento para busqueda y indexacion: generar variantes de lectura que permitan busquedas por fonetica ademas de por caracter, mejorando la recuperacion en catalogs japoneses.
- Herramientas de aprendizaje de idiomas: mostrar la lectura bajo cada kanji en aplicaciones de estudio, con la ventaja de que la licencia no comercial cubre el uso educativo gratuito.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo indica que el modelo fue evaluado con onnxruntime-node 1.19.2 sobre CPU y que los resultados pueden diferir entre runtimes, versiones y plataformas; no se aportan metricas de precision, recall ni exactitud en la seleccion de lecturas.

## Requisitos de hardware

- VRAM: no aplica; el modelo esta pensado para inferencia en CPU y no requiere GPU.
- Memoria RAM estimada: el grafo ONNX ocupa 7,7 MB y los ficheros de datos auxiliares suman aproximadamente 26 MB, por lo que la huella en memoria es del orden de decenas de MB, muy por debajo de cualquier requisito de GPU.
- GPU recomendadas: no disponibles ni necesarias; el runtime de referencia es CPU.
- Compatibilidad con GPU de consumo: irrelevante, dado que el modelo se ejecuta en CPU.
- Opciones de despliegue: onnxruntime (la model card cita onnxruntime-node 1.19.2); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este formato y tarea.
- Latencia y throughput: no disponibles; no se publican mediciones.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Horse Furigana 1.1 | ONNX int8 especializado en furigana | no disponible | no disponible | Horse Models Community License v2.0 (comercial bajo licencia) | Hugging Face, 0 descargas |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre modelos comparables en la documentacion proporcionada. La comparativa con alternativas de anotacion de furigana (por ejemplo, herramientas basadas en diccionarios o en modelos de lenguaje genericos) no puede realizarse con datos verificables a partir de la informacion disponible.

## Limitaciones y advertencias

- Resultados no deterministas entre entornos: el autor advierte de que las lecturas pueden diferir segun el runtime, la version de onnxruntime y la plataforma; no se garantiza identidad de resultados.
- Ambiguedad intrinseca del japones: la lectura de un kanji depende del contexto y de la palabra; incluso con diccionario y fichero de nombres, pueden persistir errores en terminos poco frecuentes o neologismos.
- Ausencia de benchmarks: no hay metricas publicadas de exactitud, por lo que la calidad real debe validarse contra un corpus propio antes de adoptarlo en produccion.
- Restricciones de licencia: el uso comercial requiere licencia especifica; el uso gratuito se limita a fines no comerciales.
- Material de terceros: los ficheros de datos incorporan material de terceros con sus propias licencias, recogidas en `THIRD-PARTY-NOTICES.md`; estas no quedan cubiertas por la licencia del modelo.
- Cobertura limitada a japones: no se declara soporte de otros idiomas ni de texto mixto con caracteres no japoneses.
- Documentacion tecnica escasa: no se publican arquitectura, parametros, contexto ni datos de entrenamiento, lo que dificulta evaluar riesgos de sesgo o alucinacion en la seleccion de lecturas.
- Verificacion manual recomendada: conviene comprobar la firma minisign de `SHA256SUMS` antes de desplegar, dado que el autor proporciona el mecanismo de integridad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/2008-horse/horse-furigana
- Sitio oficial: https://2008-horse.com
- Licencia comercial: https://2008-horse.com/licensing/
- Clave publica de firma: https://2008-horse.com/security/model-signing-key.txt
