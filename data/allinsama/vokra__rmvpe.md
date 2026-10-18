# Allinsama/vokra__rmvpe

## Resumen

`Allinsama/vokra__rmvpe` es un artefacto GGUF de 172,6 MB que reempaqueta los pesos del estimador de pitch RMVPE, cuyo origen el autor situa en el repositorio `yxlllc/RMVPE`. No es un modelo nuevo ni un modelo de lenguaje: los metadatos del fichero declaran la arquitectura `rmvpe`, 741 tensores y 90.472.917 parametros, y el repositorio contiene un unico fichero, `rmvpe.gguf`, con SHA-256 `208fc73819586b4546f2cba7a829033c5900c44af1ad48fe9d3e727cc1a932fb`. Su funcion en el ecosistema es la de extractor de F0 en tuberias de conversion de voz del tipo RVC, donde RMVPE se usa como algoritmo de referencia para obtener el contorno de pitch de una locucion o de una interpretacion cantada.

La relevancia del artefacto es de formato, no de modelado. El runtime Vokra (Rust, segun su repositorio) puede mapear el fichero en memoria sin dependencias de Python, de modo que un modelo de 90 M de parametros se ejecuta en hardware muy modesto. La conversion la firma `vokra-core 0.1.0-alpha.0` con el esquema GGUF 1 de Vokra, y el autor advierte explicitamente de que los pesos son los del upstream.

Los pesos se mantienen bajo licencia MIT, identica a la del modelo original, por lo que el uso comercial es posible conservando el aviso de copyright. La model card no documenta dataset de entrenamiento, formato exacto de salida, rango de F0 cubierto ni resultados de evaluacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `rmvpe` (segun metadatos del GGUF); estimador de pitch, no es un transformer de lenguaje |
| Parametros totales | 90.472.917 |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible (modelo de audio; no aplica ventana de contexto de texto) |
| Tipos de cuantizacion | un unico fichero GGUF con ~1,91 bytes por parametro (compatible con fp16); no se publican cuantizaciones alternativas |
| Idiomas soportados | no disponible (procesa audio; la model card no documenta idiomas) |
| Licencia | MIT (sin cambios respecto al upstream) |
| Formato de pesos | GGUF, esquema Vokra 1, 741 tensores |
| Entrada | fichero WAV (`--input input.wav` en el ejemplo de la model card) |
| Salida | no disponible (no documentada en la model card) |
| Tamano del fichero | 172,6 MB (`rmvpe.gguf`) |
| Tamano del repositorio | 0,2 GB |
| Runtime | Vokra (`vokra-cli`), libreria `vokra` |
| Version del conversor | vokra-core 0.1.0-alpha.0 |
| Repositorio upstream | yxlllc/RMVPE (licencia MIT) |
| Fecha de creacion (metadatos) | 2026-10-18 |
| Descargas / likes | 6 / 0 |

## Arquitectura y entrenamiento

La unica informacion tecnica verificable procede de los metadatos del propio artefacto: cadena de arquitectura `rmvpe`, 741 tensores y 90.472.917 parametros, empaquetados en un GGUF de 172,6 MB. El cociente entre tamano de fichero y numero de parametros es de aproximadamente 1,91 bytes por parametro, lo que corresponde a precision de 16 bits sin cuantizacion adicional; no se publican variantes Q4, Q8 ni similares. El autor declara que se trata de una conversion y no de un modelo nuevo: los pesos son los del upstream y Vokra solo los reempaqueta para poder mapearlos en memoria directamente.

No hay informacion disponible sobre el dataset de entrenamiento (numero de tokens o de horas de audio, composicion, presencia de canto polifonico o monofonico), sobre el proceso de optimizacion ni sobre posibles fases de ajuste fino. La model card tampoco describe innovaciones de decodificacion, attention lineal ni tecnicas equivalentes. Cualquier afirmacion sobre la topologia interna (capas convolucionales, numero de bloques, resolucion del mapa de pitch) requeriria inspeccionar los tensores del GGUF o el repositorio upstream, y no esta recogida en la informacion disponible.

Un detalle operativo relevante: el GGUF aqui empleado es un contenedor con esquema propio de Vokra, no el formato GGUF interpretado por llama.cpp, de modo que la presencia de la etiqueta `gguf` no implica compatibilidad con el ecosistema llama.cpp/Ollama.

## Capacidades

- Estimacion de pitch (F0) sobre audio: el ejemplo oficial ejecuta `vokra-cli run --model rmvpe.gguf --input input.wav`, es decir, inference offline sobre un fichero WAV.
- Extraccion de contorno melodico para tuberias de conversion de voz: RMVPE es el extractor de pitch utilizado en flujos RVC, segun el contexto de uso recogido en la busqueda web.
- Ejecucion sin dependencias: el runtime Vokra se presenta como zero-dependency, lo que permite desplegar el modelo sin stack de Python ni CUDA obligatoria.
- Verificacion de integridad del artefacto: SHA-256 publicado y comprobable con `shasum -a 256`.
- No soporta generacion de texto, razonamiento, codigo, matematicas, vision, tool calling, function calling, agentes, modo thinking ni audio generativo. La model card no atribuye ninguna de estas capacidades.
- El soporte multilingue no aplica ni esta documentado: al operar sobre senal de audio, la cobertura linguistica dependeria de la del extractor de pitch, que no se detalla.

## Casos de uso

- Conversion de voz y covers (RVC): el modelo se inserta como extractor de F0 en la primera etapa del pipeline, de modo que el conversor dispone del contorno de pitch de la fuente antes de aplicar la identidad vocal de destino. Es el escenario para el que se distribuye este artefacto.
- Afinacion automatica offline: extraer el contorno de pitch de una pista vocal para calcular desviaciones respecto a una escala de referencia y aplicar correccion; el modelo aporta la medicion, no la correccion.
- Transcripcion melodica a MIDI: usar la secuencia de F0 por tramas como base para cuantizar notas y generar un fichero MIDI en herramientas de transcripcion automatica.
- Analisis prosodico en investigacion fonetica: obtener curvas de F0 sobre corpus de habla para estudiar entonacion, acentos y variacion entre hablantes, con la ventaja de un binario ligero que puede ejecutarse en el portatil del investigador.
- Herramientas de practica vocal: aplicaciones que muestran al usuario su afinacion en tiempo (o cuasi tiempo) real comparando la F0 estimada con la nota objetivo; el tamano de 172,6 MB permite empaquetar el modelo dentro de la propia aplicacion.
- Preprocesado de datasets de canto para TTS cantado: anotar automaticamente la F0 de miles de clips antes de entrenar un modelo generativo, evitando depender de un framework de deep learning completo en la fase de etiquetado.
- Filtrado y control de calidad de corpus de audio: detectar segmentos sin voz (ausencia de pitch estable) o rangos anomalos para descartar grabaciones defectuosas antes de entrenamientos costosos.
- Integracion en herramientas de animacion y sincronizacion: derivar envolventes de pitch para controlar parametros de personajes virtuales o labiales en postproduccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card no incluye metricas de error de pitch (por ejemplo, Raw Pitch Accuracy o Voicing Decision Error), ni comparaciones con otros extractores, ni latencias medidas. Como sustituto, la unica comprobacion objetiva posible es la integridad y coherencia del artefacto:

| Comprobacion | Valor |
|---|---|
| Fichero | `rmvpe.gguf` |
| Tamano | 172,6 MB (172,57 MiB) |
| Parametros declarados | 90.472.917 |
| Bytes por parametro | ~1,91 (consistente con fp16) |
| Tensores | 741 |
| SHA-256 | `208fc73819586b4546f2cba7a829033c5900c44af1ad48fe9d3e727cc1a932fb` |
| Esquema | Vokra GGUF 1 |
| Throughput / latencia | no disponible |

## Requisitos de hardware

- VRAM estimada: menos de 1 GB en fp16 (172,6 MB de pesos mas buffers de activacion y el audio de entrada); sin cuantizacion adicional el margen es amplio en cualquier GPU.
- Cabe en cualquier GPU de consumo: desde iGPU y tarjetas de 2 GB (GTX 1050, MX150) hasta RTX 3060, RTX 4090, A100 o H100; no se aprovecharian en ningun caso, dado el tamano.
- CPU: viable en exclusiva; 90 M de parametros y 172,6 MB permiten ejecucion en portatiles modestos, Raspberry Pi o incluso dispositivos moviles si el runtime esta portado.
- RAM: por debajo de 1 GB de RSS esperable con mapeo en memoria del GGUF, aunque no hay mediciones publicadas.
- Despliegue: `vokra-cli run --model rmvpe.gguf --input input.wav` es el unico metodo documentado. No es compatible con llama.cpp, Ollama ni TGI, porque la cadena de arquitectura `rmvpe` y el esquema GGUF de Vokra no forman parte de esos runtimes.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tiempo por segundo de audio en ninguna GPU o CPU concreta.
- Alternativa de despliegue: acudir al repositorio upstream (`yxlllc/RMVPE`) si se necesita otro runtime; la model card no detalla que formatos adicionales ofrece el autor original.

## Comparativa con modelos similares

La categoria es la de extractores de pitch monofonico usados como preprocesado en conversion de voz. La informacion proporcionada solo cubre el artefacto de Vokra; el resto de filas se incluyen como referencia de categoria y no se han verificado en esta ficha.

| Modelo | Enfoque | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rmvpe (Vokra GGUF) | Estimador de pitch sobre audio | 90.472.917 | no aplica | MIT | GGUF unico en HuggingFace |
| RMVPE upstream (yxlllc/RMVPE) | Mismos pesos, sin reempaquetar | no disponible en la informacion | no aplica | MIT | Repositorio upstream; formatos no detallados |
| CREPE | Red convolucional sobre forma de onda | no disponible | no aplica | no disponible | Implementacion publica de referencia |
| Harvest (WORLD) | Algoritmo de procesado de senal, sin red neuronal | no aplica | no aplica | no disponible | Implementacion publica de referencia |

Frente a las alternativas, la ventaja concreta de este artefacto es el tamano del despliegue (172,6 MB, un solo fichero, runtime sin dependencias) y la trazabilidad de integridad mediante SHA-256; la desventaja es la ausencia total de metricas publicadas y de cuantizaciones alternativas, ademas de quedar atado al runtime Vokra.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona, no escribe codigo y no soporta tool calling ni agentes. Cualquier evaluacion con benchmarks tipo MMLU, HumanEval o GSM8K carece de sentido.
- Es una conversion de terceros: el publicador (`Allinsama`, bajo el espacio `vokra`) no es el autor original de los pesos. La responsabilidad sobre el comportamiento del modelo recae en el upstream `yxlllc/RMVPE`.
- Ausencia de evaluacion: no hay metricas de precision de pitch, ni de robustez frente a ruido, reverberacion, polifonia o cambios de registro vocal. En produccion habria que validar con un conjunto propio.
- Formato de salida no documentado: la model card no especifica si la salida es un vector de F0 por trama, un mapa de saliencia o un fichero intermedio, ni la tasa de tramas. Hay que inspeccionar el runtime o el codigo para integrarlo.
- Ambito de audio desconocido: no se documenta si el modelo se comporta igual en habla que en canto, ni el rango de F0 cubierto; sesgos hacia determinados timbres o registros (voces graves, voces infantiles, falsete) no estan medidos.
- Riesgo de resultados incorrectos en audio polifonico o con acompanamiento instrumental: no hay informacion que confirme el comportamiento en mezclas, a pesar de que el nombre RMVPE se asocia a estimacion en musica polifonica.
- Una sola cuantizacion: no hay variantes de menor precision, de modo que quien necesite un fichero mas pequeno tendra que reconvertirlo por su cuenta.
- Compatibilidad limitada: el GGUF de Vokra no se puede cargar con llama.cpp, Ollama, vLLM ni TGI. Depender de un conversor en version `0.1.0-alpha.0` implica riesgo de cambios de esquema.
- Licencia MIT: permite uso comercial y modificacion conservando el aviso de copyright y la atribucion al upstream; no hay clausulas de uso aceptable adicionales documentadas.
- Popularidad practicamente nula (6 descargas, 0 likes) y fecha de publicacion reciente: no hay comunidad, issues ni validacion independiente que respalden el artefacto.
- La model card enlaza a `huggingface.co/vokra/rmvpe` mientras que el identificador real es `Allinsama/vokra__rmvpe`; conviene verificar cual es la ruta canonica antes de fijar una dependencia en un pipeline.

## Enlaces

- Ficha en HuggingFace: https://huggingface.co/Allinsama/vokra__rmvpe
- Ruta referenciada en la model card: https://huggingface.co/vokra/rmvpe
- Runtime Vokra: https://github.com/ayutaz/vokra
- Repositorio upstream de los pesos: https://github.com/yxlllc/RMVPE
- Contexto de uso en RVC (modelos de voz que citan RMVPE como extractor): https://voice-models.com/model/1umlvgCYzkJ
- Catalogo de modelos de voz RVC: https://voice-models.com/
- Repositorio de modelos de voz RVC en HuggingFace: https://huggingface.co/WoomyPearl/RVC-Model-Palace
- Aplicacion de conversion de voz: https://easyaivoice.com/app
