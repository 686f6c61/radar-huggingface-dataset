# danielsaldana/AFCI_part8

## Resumen

AFCI_part8 no es un modelo de lenguaje ni una red neuronal entrenada, sino un paquete de datos publicado en HuggingFace por el usuario danielsaldana dentro de un kit de desarrollo offline para un sistema de deteccion de fallos de arco electrico (AFCI, *arc-fault circuit interrupter*). Concretamente, este repositorio contiene la primera de tres tandas de grabaciones crudas de corriente y tension de arcos en serie sobre red alterna de 230 V / 50 Hz, procedentes del laboratorio de la Universite de Lorraine (en colaboracion con Huaqiao University y UNIVPM) y originalmente depositadas en Zenodo con el identificador 5501527.

El contenido son 13 ficheros binarios `.dat` con el prefijo `C2` correspondientes a la categoria "carbonized path" (camino carbonizado en el cable), uno por aparato electrico: ordenador, cafetera Dolce Gusto, taladros de 550 W y 710 W, procesador de alimentos, lampara halogena, calefactor, sierra de calar, hervidor, impresora, bomba y dos aspiradores de 1200 W y 1250 W. Cada fichero ronda los 83-87 MB y contiene una grabacion larga de corriente y tension con el instante en que se provoca el arco, ademas del PDF de lectura (`ReadMe_Zenodo5501527.pdf`) que documenta el formato binario, la frecuencia de muestreo y el significado de los canales.

Su relevancia es la de un *dataset* de referencia para quien quiera entrenar o validar un detector de arcos embebido en un microcontrolador STM32F407 (ADC + DMA, extraccion de rasgos FFT/STFT y una DNN cuantizada que decide el disparo). Frente a la parte 7 del kit, que ya trae ventanas pre-cortadas y codigo, estas grabaciones crudas permiten elegir la longitud de ventana y la frecuencia de muestreo para ajustarlas a lo que el ADC del STM32 puede muestrear realmente. No hay pesos, ni arquitectura, ni parametros: es material de entrenamiento en bruto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo; es un conjunto de datos) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | other (los ficheros conservan la licencia de su publicador original; la model card indica CC-BY-4.0 para los datos de Zenodo) |
| Formato de pesos | no disponible; los datos van en ficheros binarios `.dat` (algunos partidos en `.part001`, `.part002`, ...) |

Datos adicionales del repositorio: 15 ficheros, 1,1 GB en total (1,2 GB de tamano de repo), creado el 2026-11-02 y actualizado el mismo dia. Tags: `afci`, `arc-fault-detection`, `stm32`, `stm32f407`, `tinyml`, `offline`, `region:us`.

## Arquitectura y entrenamiento

No aplica en el sentido habitual: no hay arquitectura de red ni proceso de entrenamiento descrito. Lo que si documenta la model card es la arquitectura del *sistema* para el que se recogieron estos datos: sensor de corriente, ADC con DMA del STM32F407, extraccion de caracteristicas mediante FFT/STFT y una red neuronal densa cuantizada que decide si dispara la proteccion. El entrenamiento se plantea en un PC offline con Windows 10/11 x64 y Python sobre CPU, sin GPU.

Los datos provienen de grabaciones de laboratorio de arcos en serie sobre 230 V / 50 Hz, generados por dos mecanismos: un camino carbonizado en un cable pre-carbonizado o la apertura de un contacto. Los ficheros `C2_*` de esta parte corresponden al primero de los mecanismos. El PDF `ReadMe_Zenodo5501527.pdf` incluido en el repositorio describe el formato binario, la frecuencia de muestreo, el significado de los canales (prefijos `C2` y `C3`) y la temporizacion entre regimen normal y regimen de arco. La parte 10 del kit incorpora el `ReadMe_Zenodo3997337.pdf` y las grabaciones de contacto abierto no duplicadas.

Los ficheros de mas de 100 MB se han partido en trozos `*.part001`, `*.part002`, etc. El repositorio incluye `join_parts.ps1` (Windows) y `join_parts.sh` (Linux/macOS) para reconstruirlos y verificarlos contra `SHA256SUMS.txt`.

## Capacidades

- Almacenar grabaciones crudas de corriente y tension de arcos en serie en red de 230 V / 50 Hz para 13 aparatos electricos distintos.
- Servir de base para escoger libremente la longitud de ventana y la frecuencia de muestreo, de modo que coincidan con lo que el ADC del STM32F407 puede capturar.
- Permitir la extraccion de caracteristicas en el dominio de la frecuencia (FFT, STFT) a partir de la senal cruda.
- Aportar ejemplos de la clase "arco por camino carbonizado" (`C2`) para entrenamiento y validacion de clasificadores binarios arco/no arco.
- Complementarse con las partes 7, 9 y 10 del kit para cubrir ventanas pre-cortadas, el canal `C3` y las grabaciones de contacto abierto.
- No ofrece generacion de texto, razonamiento, codigo, vision, tool calling ni ninguna capacidad propia de un modelo generativo.

## Casos de uso

- Entrenamiento de un detector de arcos embebido: se cargan los `.dat`, se trocean en ventanas de la longitud que admita el ADC del STM32F407 y se etiquetan los tramos de arco segun la temporizacion del ReadMe para entrenar la DNN cuantizada del kit.
- Ajuste de la cadena de adquisicion: al disponer de la senal cruda, se puede simular el muestreo real del microcontrolador (diezmado, resolucion efectiva) y comprobar si las caracteristicas FFT/STFT siguen separando arco de regimen normal.
- Validacion cruzada por aparato: los 13 ficheros permiten dejar uno fuera (por ejemplo, el hervidor) y medir la generalizacion del detector a cargas no vistas durante el entrenamiento.
- Analisis de falsos positivos en cargas dificiles: aspiradores de 1200 W y 1250 W, taladros y sierra de calar generan ruido conmutado y transitorios que se confunden con arcos; estas grabaciones sirven para caracterizar y reducir esas confusiones.
- Diseno y comparacion de extractores de caracteristicas: con la senal cruda se pueden probar distintas ventanas, solapamientos y resoluciones espectrales antes de fijar la implementacion en el firmware.
- Docencia e investigacion en proteccion electrica: el conjunto, con su ReadMe y su licencia CC-BY-4.0, es util para reproducir experimentos de deteccion de arcos y para citar la fuente original en publicaciones.
- Verificacion de integridad de pipelines de datos: los scripts de reconstruccion y el `SHA256SUMS.txt` permiten montar un proceso reproducible de descarga y comprobacion en entornos offline.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Almacenamiento: 1,1 GB para el repositorio completo; los ficheros partidos requieren espacio temporal adicional durante la reconstruccion con `join_parts.ps1` o `join_parts.sh`.
- Entrenamiento: la model card especifica PC offline con Windows 10/11 x64 y Python sobre CPU, sin GPU. No se detalla RAM ni CPU concretas.
- Inferencia del sistema AFCI: el destino es un STM32F407 (ADC + DMA, FFT/STFT y DNN cuantizada); no se publican cifras de memoria flash o RAM ocupadas por el modelo final.
- GPU: no aplica para el procesamiento de este repositorio; no se describe ningun uso de A100, H100 ni RTX 4090.
- Opciones de despliegue: no aplica (no hay pesos). El consumo previsto es mediante el firmware del STM32F407 descrito en el kit.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Conjunto de datos | Contenido | Relacion con AFCI_part8 |
|---|---|---|
| AFCI_part7 (mismo kit) | Ventanas pre-cortadas y codigo de Ferracuti et al. 2025 | Mismo origen; la model card recomienda empezar por la parte 7 y usar la parte 8 cuando se quiera elegir ventana y frecuencia de muestreo |
| AFCI_part9 (mismo kit) | Grabaciones de camino carbonizado, canal `C3` (13 ficheros) | Mismo experimento, otro canal de medida |
| AFCI_part10 (mismo kit) | ReadMe de Zenodo 3997337 y grabaciones de contacto abierto (taladro, aspiradores, procesador de alimentos, resistivas de 4,5 A y 7,9 A) | Cubre el segundo mecanismo de generacion de arco; 12 ficheros de 3997337 son copias identicas en tamano de ficheros de 5501527 |
| Zenodo 5501527 (fuente original) | Grabaciones completas del experimento de la Universite de Lorraine | Origen de los `.dat` de esta parte |

No se dispone de comparacion con otros datasets publicos de deteccion de arcos en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo: no genera texto, no razona y no puede evaluarse con MMLU, HumanEval ni GSM8K. Cualquier expectativa de inferencia sobre este repositorio es un error de categoria.
- Cobertura limitada a 13 aparatos y a un unico mecanismo de arco (camino carbonizado, canal `C2`); no representa toda la variedad de instalaciones reales.
- Entorno de laboratorio controlado a 230 V / 50 Hz; la transferencia a otras tensiones, frecuencias o redes puede degradar el rendimiento del detector entrenado con estos datos.
- La licencia del repositorio figura como `other`; los ficheros conservan la licencia de su publicador original y la model card cita CC-BY-4.0 para los datos de Zenodo. Antes de un uso comercial hay que verificar la licencia de cada fichero y citar los registros de Zenodo y los articulos de los autores.
- Los ficheros grandes estan partidos: descargar sin ejecutar los scripts de union y verificacion deja datos incompletos o corruptos.
- El repositorio no incluye pesos, codigo de entrenamiento ni firmware; estos deben obtenerse de otras partes del kit (indice maestro en AFCI_part6).
- No se documentan sesgos, tasas de alucinacion ni limitaciones de idioma porque no aplican a un conjunto de datos.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/danielsaldana/AFCI_part8
- Indice maestro del kit: https://huggingface.co/danielsaldana/AFCI_part6/blob/main/00_START_HERE_MASTER_INDEX.md
- Zenodo 5501527 (grabaciones de camino carbonizado): https://zenodo.org/records/5501527
- Zenodo 3997337 (grabaciones de contacto abierto): https://zenodo.org/records/3997337
