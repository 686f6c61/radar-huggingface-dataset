# danielsaldana/AFCI_part9

## Resumen

AFCI_part9 no es un modelo de lenguaje, sino un paquete de datos publicado en Hugging Face por el usuario danielsaldana dentro de un kit de desarrollo offline para un sistema de deteccion de arcos electricos (AFCI, arc-fault circuit interrupter) orientado a la prevencion de incendios de origen electrico. El repositorio contiene 13 grabaciones crudas de corriente y tension en formato binario `.dat`, correspondientes a ensayos de arco serie en corriente alterna a 230 V / 50 Hz realizados por la Universite de Lorraine en colaboracion con Huaqiao University y UNIVPM, con trayectoria carbonizada (carbonized path) y prefijo de canal `C3`.

El paquete forma parte de una serie de 15 repositorios (AFCI_part1 a AFCI_part15) que documentan la cadena completa: sensor de corriente, adquisicion mediante ADC y DMA de un STM32F407, extraccion de caracteristicas FFT/STFT y una red neuronal profunda cuantizada que decide el disparo. Este volumen concreto (Part 9) se centra en las grabaciones crudas de la segunda de tres tandas del dataset de Lorraine, pensadas para que el desarrollador elija su propia ventana de analisis y frecuencia de muestreo en lugar de usar ventanas pre-cortadas.

Su relevancia es practica: permite reproducir y validar algoritmos de deteccion de arcos con datos reales de laboratorio bajo licencia CC-BY-4.0, algo poco habitual en un dominio donde los datasets suelen ser privados o de pago. No contiene pesos, tokenizador ni configuracion de inferencia; el pipeline de Hugging Face figura como no disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo neuronal; es un dataset de senales) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | other (el contenido original es CC-BY-4.0 segun la model card) |
| Formato de pesos | no disponible (archivos binarios `.dat` propietarios del dataset) |

## Arquitectura y entrenamiento

No aplica en el sentido habitual: el repositorio no contiene un modelo entrenado, sino senales de corriente y tension muestreadas. Cada archivo `.dat` es una grabacion larga de un electrodomestico concreto (ordenador, cafetera Dolce Gusto, taladro a 550 y 710, procesador de alimentos, halogeno, calefactor, sierra de calar a 135, hervidor, impresora, bomba, aspirador de 1200 W y de 1250) con un arco serie generado mediante trayectoria carbonizada. El formato binario, la frecuencia de muestreo, el significado de los canales y la temporizacion arco/normal se describen en los PDF ReadMe de los registros Zenodo 5501527 (incluido en Part 8) y 3997337 (incluido en Part 10).

El kit completo describe un pipeline de TinyML: ADC y DMA del STM32F407 capturan la corriente, se calculan caracteristicas FFT/STFT y una DNN cuantizada emite la decision de disparo. El entrenamiento se plantea en un PC con Windows 10/11 x64 y solo CPU. La innovacion tecnica del paquete es la trazabilidad: scripts `join_parts.ps1` y `join_parts.sh` reconstruyen los archivos troceados de mas de 100 MB y verifican su integridad contra `SHA256SUMS.txt`.

## Capacidades

- Proporciona grabaciones crudas de corriente y tension de arcos serie en CA a 230 V / 50 Hz para 13 cargas distintas.
- Permite elegir libremente la longitud de ventana y la frecuencia de muestreo, a diferencia de los conjuntos pre-cortados de Part 7.
- Sirve como material de validacion para algoritmos de extraccion de caracteristicas (FFT, STFT, wavelets) y clasificadores cuantizados.
- Incluye un registro de descargas (`download_log_stage9.json`) y sumas de verificacion SHA256 para reproducibilidad.
- No soporta tool calling, agentes, generacion de texto ni capacidades multilingues: no es un modelo generativo.

## Casos de uso

- Desarrollo de firmware AFCI en STM32F407: las grabaciones permiten ajustar la frecuencia de muestreo real del ADC y el tamano de ventana antes de portar el algoritmo al microcontrolador, evitando entrenar con ventanas incompatibles con el hardware.
- Validacion de detectores de arco serie: se pueden calcular caracteristicas espectrales sobre las senales y comparar la tasa de deteccion frente a falsos positivos en cargas como el taladro o el aspirador, que generan ruido conmutado intenso.
- Reproduccion de resultados academicos: los archivos permiten replicar los experimentos de Ferracuti et al. (2025) con ventanas propias y contrastar con las ventanas pre-cortadas de Part 7.
- Pruebas de robustez frente a cargas inductivas: el conjunto incluye motores universales (taladro, sierra de calar, aspirador) y cargas resistivas (hervidor, calefactor), lo que facilita evaluar la confusion entre arranque de motor y arco.
- Generacion de conjuntos de entrenamiento sinteticos aumentados: a partir de las series crudas se pueden extraer multiples ventanas solapadas con distintas etiquetas temporales para aumentar el volumen de datos de una DNN cuantizada.
- Docencia e investigacion en prevencion de incendios electricos: el material sirve para practicas de procesamiento digital de senales con datos reales de laboratorio bajo licencia CC-BY-4.0.
- Auditoria de un pipeline TinyML completo: combinado con los otros 14 repositorios, permite reconstruir de extremo a extremo la cadena sensor, adquisicion, caracteristicas y clasificacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Almacenamiento: 1,2 GB para el repositorio completo; los archivos individuales rondan entre 86 y 96 MB y se sirven troceados en partes de menos de 100 MB.
- Memoria RAM: suficiente para cargar un archivo `.dat` completo en memoria (del orden de 100 MB por archivo), por lo que 2 GB de RAM son suficientes para procesar uno a uno.
- CPU: cualquier procesador x64 moderno; el autor indica entrenamiento solo con CPU en Windows 10/11 x64, sin requisito de GPU.
- GPU: no necesaria para el procesamiento de las senales; no se especifica ninguna recomendada.
- Despliegue: no aplica inferencia de modelo. El consumo previsto es mediante scripts de Python sobre los archivos reconstruidos con `join_parts.ps1` o `join_parts.sh`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Conjunto | Contenido | Licencia | Disponibilidad |
|---|---|---|---|
| AFCI_part9 (este repo) | 13 grabaciones crudas `C3_*` de trayectoria carbonizada, Zenodo 5501527 | CC-BY-4.0 (contenido original) | Hugging Face |
| AFCI_part8 | 13 grabaciones crudas `C2_*` del mismo registro Zenodo 5501527 mas ReadMe PDF | CC-BY-4.0 | Hugging Face |
| AFCI_part10 | ReadMe de Zenodo 3997337 y grabaciones de contacto de apertura (taladro, aspiradores, moulinex, resistivas 4,5 A y 7,9 A) | CC-BY-4.0 | Hugging Face |
| AFCI_part7 | Ventanas pre-cortadas y codigo de Ferracuti et al. (2025) | no disponible | Hugging Face |

No se dispone de informacion sobre otros datasets publicos comparables en la documentacion proporcionada.

## Limitaciones y advertencias

- No es un modelo: no puede usarse para inferencia, generacion ni despliegue como servicio; quien busque un modelo de lenguaje o vision se ha equivocado de repositorio.
- El campo `license` de Hugging Face figura como `other`, aunque la model card afirma CC-BY-4.0 para el contenido original; conviene verificar la licencia de cada archivo con su publicador de origen antes de un uso comercial.
- El dataset cubre un unico entorno electrico (230 V / 50 Hz) y un conjunto acotado de electrodomesticos, por lo que un detector entrenado solo con estos datos puede no generalizar a otras redes (110 V / 60 Hz) ni a otras cargas.
- Las grabaciones son de laboratorio con arcos provocados de forma controlada; el comportamiento en instalaciones reales con ruido, armonicos y perturbaciones de red puede diferir.
- Los archivos de mas de 100 MB estan troceados: si no se reconstruyen y verifican con los scripts y `SHA256SUMS.txt`, las lecturas binarias seran incorrectas.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validacion independiente por parte de la comunidad.
- No se documentan sesgos, tasas de alucinacion ni limitaciones de contexto porque no aplican a un dataset de senales.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/danielsaldana/AFCI_part9
- Indice maestro del kit: https://huggingface.co/danielsaldana/AFCI_part6/blob/main/00_START_HERE_MASTER_INDEX.md
- Registro Zenodo 5501527 (origen de las grabaciones `C2_*` y `C3_*`): https://zenodo.org/records/5501527
- Registro Zenodo 3997337 (contacto de apertura y ReadMe): https://zenodo.org/records/3997337
