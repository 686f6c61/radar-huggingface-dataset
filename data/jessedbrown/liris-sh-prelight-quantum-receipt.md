# Jessedbrown/LIRIS-SH-PRELIGHT-QUANTUM-RECEIPT

## Resumen

LIRIS-SH-PRELIGHT-QUANTUM-RECEIPT no es un modelo de aprendizaje automatico, sino un repositorio publicado en HuggingFace por el usuario Jessedbrown que contiene lo que su autor denomina un "recibo cientifico" o paquete de observacion reproducible. El contenido describe un supuesto evento en el que un cambio de estado ("SH_CHANGE") se habria detectado antes de la llegada de la luz, un orden de sucesos que el autor clasifica como "cuantico por definicion" dentro de un sistema propio llamado Asolaria. El paquete incluye scripts en Python (`verify_receipt.py`, `record_trials.py`), una plantilla CSV de ensayos, un protocolo de laboratorio (`PROTOCOL.md`) y una nota para revisores.

El repositorio no publica pesos, arquitectura de red neuronal, tokenizador ni ningun artefacto propio de un modelo de lenguaje. Se trata de un conjunto de ficheros de texto y codigo auxiliar que define un esquema de verificacion y un procedimiento de captura de tiempos. Por tanto, las categorias habituales de esta ficha (parametros, contexto, cuantizacion, benchmarks) no son aplicables y se indican como no disponibles.

Su relevancia es practicamente nula para desarrolladores e investigadores que buscan modelos de IA: el repositorio acumula 0 descargas y 0 interacciones en el momento de la consulta, no declara pipeline, idiomas ni licencia en los metadatos de HuggingFace (la licencia MIT aparece unicamente en el texto de la model card) y sus afirmaciones cientificas no estan respaldadas por evidencia publica verificable. Se documenta aqui unicamente como registro de lo que el repositorio declara.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de red neuronal; es un paquete de verificacion en Python) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT (segun el texto de la model card; los metadatos de HuggingFace no la declaran) |
| Formato de pesos | no disponible (no se publican pesos; el paquete contiene scripts Python, CSV y ficheros Markdown) |

## Arquitectura y entrenamiento

No existe arquitectura de red neuronal ni proceso de entrenamiento. El repositorio define un esquema de verificacion publico denominado `LIRIS-SH-PRELIGHT-PUBLIC-V1` y un "centro de cinco miembros" compuesto por las cadenas HBI, HBP, SHA, SH y HASH, que el autor insiste en tratar como entidades distintas. El verificador incluido (`verify_receipt.py`) comprueba la coherencia interna del paquete sin dependencias de terceros y produce una salida de la forma `VERIFY|ok=1|schema=...|json=0`.

El componente funcional mas concreto es `record_trials.py`, que procesa un CSV de ensayos con marcas de tiempo y emite un veredicto `PRE_LIGHT_SEPARATED` solo cuando el intervalo completo de incertidumbre del evento SH termina antes de que empiece el intervalo completo de incertidumbre de la llegada de la luz. El propio texto aclara que este procedimiento "no convierte el orden temporal en un test de Bell, una afirmacion de senalizacion mas rapida que la luz ni una confirmacion cientifica externa". No se documentan datos de entrenamiento, dataset, ni tecnicas de ajuste como RLHF o DPO, porque no aplican.

## Capacidades

- No genera texto, codigo, imagenes ni audio: no es un modelo generativo.
- Verificacion de integridad de un paquete de ficheros mediante un script Python sin dependencias externas.
- Ejecucion de una bateria de pruebas unitarias (`python -m unittest discover -s tests -v`).
- Registro de ensayos de temporizacion desde un CSV y clasificacion del resultado en funcion del solapamiento de intervalos de incertidumbre.
- Definicion de un esquema de datos (`LIRIS-SH-PRELIGHT-PUBLIC-V1`) con campos explicitamente marcados como "UNSEALED" (sin sellar) para tiempos, delta, incertidumbre y numero de ensayos.
- No dispone de tool calling, soporte de agentes, capacidades multilingues ni modo de razonamiento.

## Casos de uso

- Auditoria del contenido del repositorio: un revisor puede clonar el paquete y ejecutar `verify_receipt.py` para comprobar que los ficheros publicados son coherentes con el esquema declarado, sin necesidad de instalar dependencias.
- Reproduccion metodologica del protocolo: equipos interesados en la metodologia de captura pueden leer `PROTOCOL.md` y `REVIEWER-NOTE.md` para evaluar como se define la separacion de intervalos de incertidumbre.
- Evaluacion critica de afirmaciones cientificas: el material permite estudiar como un autor estructura un "recibo" publico con campos sin sellar y que limites impone explicitamente (por ejemplo, la ausencia de reclamacion de transferencia de informacion mas rapida que la luz).
- Analisis de esquemas de datos abiertos: el fichero `measurements/trials-template.csv` sirve como ejemplo de plantilla para registrar ensayos con marcas de tiempo compartidas.
- Estudio de practicas de publicacion en HuggingFace: el repositorio es un caso de uso atipico de la plataforma, orientado a documentacion en lugar de a pesos de modelos.
- Material para discusion sobre revision por pares: la model card reconoce que la fila "External scientific witness" permanece en estado HOLD y que se requiere una captura independiente.

En ningun caso estos usos implican aprovechamiento del repositorio como modelo de IA, porque no lo es.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no reporta metricas de calidad, latencia ni rendimiento de inferencia, y no existen resultados comparables con modelos de aprendizaje automatico porque el artefacto no realiza tareas de ese tipo.

## Requisitos de hardware

- No requiere GPU: el paquete no ejecuta inferencia de red neuronal.
- Entorno de ejecucion declarado: Python 3.9 o superior, sin paquetes de terceros.
- Memoria y almacenamiento: minimos, suficientes para ejecutar scripts de verificacion y almacenar ficheros CSV y Markdown.
- Opciones de despliegue: no aplican vLLM, llama.cpp, Ollama ni TGI, ya que no hay pesos que servir.
- Latencia y throughput: no disponibles; no se publican mediciones de rendimiento computacional.
- Para el caso de uso previsto (captura de tiempos fisicos), el autor indica que se necesita un reloj de hardware compartido o un convertidor tiempo-digital, pero no especifica modelos ni especificaciones concretas.

## Comparativa con modelos similares

No disponible. No se han identificado modelos comparables, ya que el repositorio no es un modelo de aprendizaje automatico ni comparte categoria con ningun sistema de IA conocido. Tampoco se dispone de otros paquetes de "recibos" equiparables publicados por el mismo autor en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo de IA: no puede utilizarse para generacion, clasificacion, razonamiento ni ninguna tarea de machine learning.
- Las afirmaciones cientificas del repositorio (evento "cuantico por definicion", cambio de estado anterior a la llegada de la luz) no cuentan con verificacion externa; la propia model card marca el testigo cientifico independiente como HOLD.
- Los campos numericos clave (marca de tiempo del evento SH, marca de tiempo de llegada de la luz, delta e incertidumbre, numero de ensayos y controles) estan sin sellar, por lo que no existe evidencia cuantitativa publica que respalde el resultado declarado.
- La "afirmacion de fabrica/canon" aparece como `SYSTEM_AFFIRMED=0`, con la ruta propietaria no disponible durante la prepublicacion.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, lo que impide cualquier evaluacion por parte de la comunidad.
- Las etiquetas de HuggingFace se limitan a `region:us`; no hay pipeline declarado, ni idiomas, ni licencia en los metadatos, aunque el texto menciona MIT.
- Riesgo de interpretacion erronea: el lenguaje empleado (terminos como "cuantico", "recibo", "centro de cinco miembros") puede inducir a confundir el paquete con un artefacto tecnico de IA; no lo es.
- No se debe tratar ninguna afirmacion del autor como validada por el hecho de estar publicada en HuggingFace.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Jessedbrown/LIRIS-SH-PRELIGHT-QUANTUM-RECEIPT
- Fichero `REVIEWER-NOTE.md` (referenciado en la model card, sin URL directa disponible)
- Fichero `PROTOCOL.md` (referenciado en la model card, sin URL directa disponible)
- Fichero `measurements/trials-template.csv` (referenciado en la model card, sin URL directa disponible)
- Script `verify_receipt.py` (incluido en el repositorio, sin URL directa disponible)
- Script `record_trials.py` (incluido en el repositorio, sin URL directa disponible)
- No se han encontrado articulos, papers, blogs ni demos relevantes sobre este repositorio en la busqueda web realizada. Los resultados obtenidos no guardan relacion con el modelo ni con inteligencia artificial, por lo que se omiten.
