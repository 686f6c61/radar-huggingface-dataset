# pinaltech/vast-parcel

## Resumen

Vast Parcel es un clasificador binario de numeros de seguimiento de envios, desarrollado por pinaltech como componente del cliente de correo Picacho. No es un modelo generativo ni un LLM: es una red de bolsa de caracteristicas (bag-of-features) con una unica capa oculta de 8 unidades y salida logistica, cuyo peso total es de 512 KB. Su funcion es decidir, a partir de las palabras que rodean a un candidato numerico en un correo, si ese candidato es realmente un numero de seguimiento de un transportista.

El problema que resuelve es concreto: la aplicacion ya detecta candidatos sin modelo (secuencias de mayusculas y digitos que cumplen el formato y digito de control de algun transportista segun el catalogo `tracking_number_data`). Sin embargo, aproximadamente uno de cada diez numeros aleatorios de 10 o 12 digitos supera algun control de transportista, por lo que numeros de pedido, factura o telefono pasarian el filtro. Este modelo aporta la senal contextual que distingue un numero de seguimiento de un numero que simplemente lo parece.

Es relevante por su enfoque de despliegue: se ejecuta en local, en macOS mediante Core ML (`parcel-v1.mlmodel`) y en Windows, Linux y telefonos mediante un runtime propio de Picacho (`parcel-v1.bin`), con licencia MIT. Su interes tecnico no esta en la escala sino en la ingenieria de caracteristicas multilingues y en la verificacion de paridad entre el codigo de entrenamiento en Python y la implementacion en Rust de la aplicacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red bag-of-features con una capa oculta de 8 unidades y salida logistica (clasificador binario) |
| Parametros totales | no disponible (peso del fichero: 512 KB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entrada: caracteristicas hasheadas del entorno del candidato, no secuencia de tokens) |
| Tipos de cuantizacion | no disponible (pesos en formato nativo; no se documentan variantes cuantizadas) |
| Idiomas soportados | multilingue (lexico con raices en varios idiomas para conceptos de envio, pedido, factura, etc.) |
| Licencia | MIT |
| Formato de pesos | `.mlmodel` (Core ML, macOS) y `.bin` (runtime nativo propio de Picacho) |

## Arquitectura y entrenamiento

El modelo no procesa texto como una secuencia: construye un vector de caracteristicas a partir del candidato numerico y su contexto. Las caracteristicas incluyen las palabras que rodean al numero, sus prefijos, la forma y linea del numero, el asunto del mensaje y los conceptos del lexico OTP heredados del modelo de codigos de verificacion (`../otp/features.py`). A ello se anaden los conceptos de `lexicon.json` nombrados por las palabras anteriores y posteriores al numero, las cercanas en su misma linea y las del asunto: *track*, *parcel*, *deliver*, *ship*, *order*, *invoice*, *customer*, *phone* y *reference*, con raices en multiples idiomas. Todas las caracteristicas se hashean en 16.384 posiciones.

Sobre ese vector se aplica una red con una capa oculta de 8 unidades y salida logistica. Un candidato con puntuacion igual o superior a 0,5 se clasifica como numero de seguimiento. El entrenamiento se realiza con numpy (`train.py`), con exportacion opcional a Core ML mediante `coremltools` (requiere Python 3.13 o anterior). Los datos de entrenamiento son correos sinteticos generados por `data.py`: cada numero del corpus es un numero de prueba valido del catalogo (`numbers.json`), presentado como numero de seguimiento en correos de envio o como numero de pedido, factura, cuenta, telefono o reserva en otros correos. La validacion retiene etiquetas, frases y asuntos por cuartos. El proyecto mantiene un fichero `parity.json` verificado por el test `cargo test matches_the_training_code`, que comprueba que la implementacion en Rust de la aplicacion encuentra cada numero candidato en la misma posicion, con las mismas caracteristicas, vector y puntuacion que el codigo de entrenamiento.

## Capacidades

- Clasificacion binaria de candidatos numericos como numero de seguimiento o no, a partir del contexto textual que los rodea.
- Deteccion de contexto de envio en multiples idiomas mediante lexico de raices (*track*, *parcel*, *deliver*, *ship*, *order*, *invoice*, *customer*, *phone*, *reference*).
- Uso de la forma del numero, su linea y el asunto del mensaje como senales adicionales.
- Distincion entre numeros de seguimiento y numeros de pedido, factura, cuenta, telefono o reserva que superan el digito de control de algun transportista.
- Inferencia local en macOS (Core ML) y en Windows, Linux y telefonos (runtime nativo de Picacho).
- No soporta generacion de texto, razonamiento, codigo, matematicas, vision, tool calling ni agentes.

## Casos de uso

- Filtrado de numeros de seguimiento en un cliente de correo: el modelo decide si un candidato detectado por las reglas de formato y digito de control es realmente un numero de seguimiento, reduciendo los falsos positivos de numeros de pedido o factura que pasan el control. Es el caso para el que fue disenado.
- Resumen de envios por cuenta: la aplicacion usa las confirmaciones del modelo para listar en la vista Summary de cada cuenta todos los envios de los que informa el correo, ordenados por la fecha de actualizacion mas reciente.
- Extraccion de eventos de entrega desde texto libre: al confirmar el numero, la aplicacion puede asociar fechas de actualizacion indicadas en el texto ("Updated:") o en el marcado schema.org `ParcelDelivery`.
- Procesamiento de correo multilingue: el lexico con raices en varios idiomas permite reconocer contexto de envio en mensajes de transportistas y tiendas en distintas lenguas.
- Despliegue en escritorio y movil sin conexion: al ser un modelo de 512 KB con runtime nativo, puede ejecutarse en el dispositivo sin enviar el correo a un servidor, lo que resulta adecuado para clientes de correo con requisitos de privacidad.
- Integracion en pipelines de clasificacion de correo: como clasificador binario de bajo coste, puede incorporarse como etapa previa antes de reglas mas costosas o de un modelo mayor.

## Benchmarks y rendimiento

Metricas de validacion publicadas en la model card, con retencion por cuartos de etiquetas, frases y asuntos:

| Condicion | Precision | Recall |
|---|---|---|
| Retenido fuera de entrenamiento | 99,9% | 93% |
| Visto en entrenamiento | 100% | 100% |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ya que el modelo no es un LLM de proposito general.

## Requisitos de hardware

- VRAM estimada: no aplica; el modelo pesa 512 KB y se ejecuta en CPU o en el runtime Core ML del dispositivo.
- GPU recomendadas: no requiere GPU.
- Cabe en cualquier GPU de consumo y en dispositivos moviles; no necesita GPU dedicada.
- Opciones de despliegue: Core ML en macOS (compilado al instalar); runtime nativo propio de Picacho en Windows, Linux y telefonos.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No disponible. No se han identificado en la informacion proporcionada modelos comparables de clasificacion de numeros de seguimiento con este enfoque y formato de despliegue.

## Limitaciones y advertencias

- Entrenado con correo sintetico: los correos reales tendran formulaciones que las plantillas no cubren; el propio autor indica que ejemplos mas variados mejorarian el modelo.
- El recall sobre datos retenidos es del 93%, por lo que aproximadamente un 7% de los numeros de seguimiento reales podria no confirmarse.
- Depende del lexico compilado en la aplicacion: un cambio de lexico requiere actualizar tanto la aplicacion como el modelo.
- Los pesos dependen ligeramente de la version de numpy usada en el entrenamiento, lo que obliga a actualizar tamanos y digests tras cada reentrenamiento.
- La exportacion a Core ML requiere Python 3.13 o anterior; en versiones mas recientes `coremltools` no puede escribir el fichero.
- El modelo no es un LLM: no genera texto, no razona y no debe usarse fuera de la tarea de clasificacion para la que fue entrenado.
- Riesgo de sesgo hacia los formatos y transportistas del catalogo `tracking_number_data`; transportistas no cubiertos no se reconoceran.
- Licencia MIT: permite uso comercial, pero conviene conservar el aviso de copyright.
- En el momento de la informacion, el repositorio tiene 0 descargas y 0 likes y un tamano de 0.0 GB, lo que sugiere que los ficheros de pesos aun no estan publicados o no son accesibles.

## Enlaces

- Hugging Face: https://huggingface.co/pinaltech/vast-parcel
- Crate `tracking-numbers`: https://crates.io/crates/tracking-numbers
- Catalogo `tracking_number_data`: https://github.com/jkeen/tracking_number_data
- `coremltools`: https://pypi.org/project/coremltools/
