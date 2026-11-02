# danielsaldana/AFCI_part13

## Resumen

AFCI_part13 no es un modelo de lenguaje ni una red neuronal entrenada, sino un paquete de datos publicado en HuggingFace dentro de un kit de desarrollo offline para sistemas de deteccion de arcos electricos (AFCI, *arc-fault circuit interrupter*) y prevencion de incendios de origen electrico. El repositorio contiene la parte 13 de un conjunto de 15 repositorios (AFCI_part1 a AFCI_part15) que, en conjunto, proporcionan el material necesario para entrenar y validar un clasificador cuantizado de TinyML sobre un microcontrolador STM32F407.

El contenido concreto de esta parte son las grabaciones principales del dataset WHITED v1.1 (*Worldwide Household and Industry Transient Energy Data Set*), publicado originalmente por Kahl, Haq, Kriechbaumer y Jacobsen (TU Munchen, NILM Workshop 2016). Se trata de 1.339 grabaciones de transitorios de arranque de 110 electrodomesticos (47+ tipos) capturadas a 44,1 kHz en estéreo FLAC, con un canal para tension y otro para corriente, procedentes de 8 ubicaciones en Alemania, Austria, Indonesia y Canada.

La relevancia de este repositorio es acotada pero clara para quien trabaje en AFCI: los transitorios de conmutacion, las corrientes de irrupcion, las fuentes conmutadas (SMPS) y el ruido de motores son precisamente las cargas normales que provocan disparos falsos (nuisance trips) en los detectores de arco. Disponer de estas grabaciones etiquetadas como negativos duros permite entrenar el clasificador para distinguir un arco real de una carga no lineal legitima.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el repositorio contiene datos, no un modelo) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | other (sin licencia explicita en la pagina de origen de WHITED; cada fichero conserva la licencia de su publicador original) |
| Formato de pesos | no aplica; los datos se distribuyen en FLAC (audio) y JSON, empaquetados en ZIP y divididos en partes `.part001`, `.part002`, etc. |

Datos adicionales del repositorio: tamano total de 808,1 MB en 3 ficheros, con `WHITED_v1.1_images_plots_mixed_notUsed.zip` (503,3 MB, dividido en 6 partes), `WHITED_v1.1_main_recordings_flac.zip` (304,8 MB, dividido en 4 partes) y `_readme.txt` (403 B). Fecha de creacion 2026-11-02, sin descargas ni likes registrados.

## Arquitectura y entrenamiento

El repositorio no define arquitectura de red ni proceso de entrenamiento. Forma parte de un pipeline descrito en la model card: sensor de corriente, ADC con DMA en un STM32F407, extraccion de caracteristicas FFT/STFT y una DNN cuantizada que decide el disparo. El entrenamiento se plantea en un PC con Windows 10/11 x64 y Python sobre CPU, sin GPU.

Los datos de WHITED v1.1 se capturaron con kits de medida MK1, MK2 y MK3, con factores de escala por kit y codigos de region r1 a r8 documentados en `_readme.txt`. Cada grabacion es un FLAC estéreo a 44,1 kHz con tension en un canal y corriente en el otro. El paquete original de 2,06 GB se ha reempaquetado en zips separados para que cada parte quede por debajo de 2 GB, sin alterar el contenido. Los ficheros de mas de 100 MB se dividieron en fragmentos que se reconstruyen con `join_parts.ps1` (Windows) o `join_parts.sh` (Linux/macOS), verificandose contra `SHA256SUMS.txt`.

## Capacidades

- Distribucion de 1.339 grabaciones principales de transitorios de arranque de electrodomesticos en formato FLAC estéreo a 44,1 kHz (tension y corriente).
- Cobertura de 110 electrodomesticos y 47+ tipos: cargadores, lamparas LED, fluorescentes compactas, hervidores, ventiladores, aspiradores, taladros, fuentes de alimentacion de PC y TV, microondas.
- Procedencia geografica multiple (8 ubicaciones en Alemania, Austria, Indonesia y Canada), lo que aporta variabilidad de red electrica y de habitos de consumo.
- Metadatos de electrodomesticos en `__ApplianceInfos.json` y factores de escala por kit de medida en `_readme.txt`.
- Material complementario en el mismo repositorio: fotografias de electrodomesticos, graficas, grabaciones multi-electrodomestico en `MIXED/` y datos descartados en `notUsed/`.
- Utilidad directa como conjunto de negativos duros para entrenar un detector de arcos y reducir falsos positivos.
- Lectura en Python mediante `soundfile.read(path)`, disponible en los entornos de las partes 3 y 5 del kit via librosa/soundfile.

## Casos de uso

- Entrenamiento de negativos duros para AFCI: las grabaciones de irrupcion y conmutacion de cargas normales se usan como clase negativa frente a arcos reales, reduciendo los disparos falsos del clasificador cuantizado que corre en el STM32F407.
- Pruebas de generalizacion a electrodomesticos no vistos: al cubrir 47+ tipos y 8 ubicaciones, permite reservar familias completas de aparatos como conjunto de test y medir la degradacion del detector ante cargas desconocidas.
- Ajuste de umbrales de disparo: la variedad de transitorios permite calibrar el umbral de decision del sistema embebido para maximizar deteccion sin superar una tasa de falsos positivos aceptable en instalacion domestica.
- Validacion de la etapa de extraccion de caracteristicas FFT/STFT: las senales a 44,1 kHz permiten comprobar si la ventana y la resolucion espectral elegidas para el firmware capturan la firma de un arco frente al ruido de una fuente conmutada.
- Analisis de ruido de motores y SMPS: las grabaciones de taladros, aspiradores y fuentes de PC/TV sirven para caracterizar el espectro de interferencia que el detector debe ignorar.
- Reproduccion de escenarios multi-carga: el subconjunto `MIXED/` permite simular entornos con varios aparatos activos simultaneamente, mas proximos a una instalacion real que las grabaciones individuales.
- Docencia y experimentacion en NILM: el dataset es reutilizable para tareas de desagregacion de carga no intrusiva y para practicas de procesado de senal con Python.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio contiene exclusivamente datos de entrada; no incluye metricas de deteccion, tasas de falsos positivos ni comparaciones de rendimiento del clasificador AFCI.

## Requisitos de hardware

- Almacenamiento: 808,1 MB para el repositorio completo; el zip original de WHITED v1.1 ocupa 2,06 GB una vez descomprimido, y el conjunto completo tras reconstruir las partes ronda esa cifra.
- Memoria: no disponible; el procesado de FLAC a 44,1 kHz con `soundfile`/librosa es ligero, pero no se documentan requisitos minimos.
- GPU: no necesaria. La model card indica explicitamente entrenamiento en Python sobre CPU en Windows 10/11 x64.
- Hardware objetivo del sistema AFCI: microcontrolador STM32F407 con ADC y DMA, es decir, inferencia en un MCU Cortex-M4, no en GPU.
- Opciones de despliegue: no aplica para este repositorio (es un paquete de datos). El pipeline descrito usa Python con `soundfile` y `librosa` en el PC de desarrollo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Conjunto de datos | Contenido | Frecuencia de muestreo | Cobertura | Licencia |
|---|---|---|---|---|
| WHITED v1.1 (este repositorio, parte 13) | 1.339 grabaciones de transitorios de arranque, tension y corriente | 44,1 kHz | 110 electrodomesticos, 47+ tipos, 8 ubicaciones | Sin licencia explicita; citar Kahl et al., NILM 2016 |
| WHITED v1.1, conjunto de experimentos (parte 14) | Conjuntos de experimentos de los autores: 2Appl, ACAC, Compressing, in_household_*, Lamp-Bulb-Experiment, Location*, sparseData | 44,1 kHz | Subconjuntos derivados del mismo dataset | Sin licencia explicita |
| Resto de partes del kit AFCI (partes 1-12, 15) | Entornos de instalacion, codigo, datos complementarios y el indice maestro en AFCI_part6 | no disponible | no disponible | other |

No se dispone de informacion sobre otros datasets de arcos electricos comparables en la documentacion proporcionada.

## Limitaciones y advertencias

- El repositorio no contiene ningun modelo entrenado: quien lo descargue no obtiene un detector AFCI funcional, solo datos de entrada.
- La licencia figura como `other` y la pagina de origen de WHITED no declara una licencia explicita. Antes de un uso comercial es necesario aclarar los terminos con los autores originales (TU Munchen) y citar Kahl et al., NILM 2016.
- Los datos proceden de solo 8 ubicaciones en 4 paises; la variabilidad de redes electricas, tensiones y frecuencias fuera de esas regiones no esta cubierta.
- Las grabaciones son de transitorios de arranque, no de regimen permanente ni de arcos reales: no sustituyen a un conjunto etiquetado de fallos para evaluar la sensibilidad del detector.
- Los ficheros de mas de 100 MB estan divididos; deben reconstruirse con los scripts incluidos y verificarse contra `SHA256SUMS.txt` antes de usarlos, o el FLAC resultante sera invalido.
- Los factores de escala por kit (MK1/MK2/MK3) y los codigos de region deben aplicarse correctamente; ignorarlos produce amplitudes de corriente incorrectas y sesga cualquier umbral calibrado.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validacion de la comunidad.
- El indice maestro y las instrucciones de instalacion estan en un repositorio distinto (AFCI_part6); sin el, el orden de montaje del kit no es evidente.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/danielsaldana/AFCI_part13
- Indice maestro del kit (AFCI_part6): https://huggingface.co/danielsaldana/AFCI_part6/blob/main/00_START_HERE_MASTER_INDEX.md
- Pagina de origen de WHITED v1.1 (TU Munchen): https://www.cs.cit.tum.de/dis/resources/whited/
- Referencia del dataset: Kahl, Haq, Kriechbaumer, Jacobsen, *WHITED - A Worldwide Household and Industry Transient Energy Data Set*, NILM Workshop 2016.
