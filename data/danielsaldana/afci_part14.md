# danielsaldana/AFCI_part14

## Resumen

AFCI_part14 no es un modelo de lenguaje ni una red neuronal entrenada, sino un repositorio de datos publicado en HuggingFace por el usuario danielsaldana como parte de un kit de desarrollo offline para sistemas de deteccion de arcos electricos (AFCI, *arc-fault circuit interrupter*). Concretamente, este repositorio contiene el segundo lote de los conjuntos de experimentos del dataset WHITED v1.1 (Kahl et al., TU Munchen, NILM Workshop 2016), empaquetado en un unico ZIP de 1,1 GB dividido en 12 fragmentos.

El proposito del repositorio dentro del kit es proporcionar *hard negatives* y escenarios de prueba con cargas normales que generan transitorios de conmutacion, corrientes de arranque y ruido de fuentes conmutadas o motores, que son precisamente las causas habituales de disparos molestos (falsos positivos) en un AFCI. El kit completo apunta a un pipeline embebido: sensor de corriente, ADC con DMA en un STM32F407, extraccion de caracteristicas FFT/STFT y una DNN cuantizada que decide si dispara o no, entrenada en un PC con Windows 10/11 x64 y solo CPU.

Es relevante ahora porque los datasets de transitorios de electrodomesticos a 44,1 kHz con canal de tension y corriente simultaneos son escasos, y este repack facilita el acceso a los conjuntos experimentales del WHITED sin descargar el ZIP original de 2,06 GB. No hay pesos, tokenizador ni configuracion de inferencia: el contenido son grabaciones FLAC y ficheros de metadatos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo neuronal; es un repositorio de datos) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | other (cada fichero conserva la licencia de su publicador original; WHITED no declara licencia explicita en su pagina) |
| Formato de pesos | no disponible (contenido: ZIP con grabaciones FLAC y ficheros de texto/JSON) |

## Arquitectura y entrenamiento

No aplica: el repositorio no contiene un modelo entrenado. Lo que contiene es el archivo `WHITED_v1.1_Experiments.zip` (1,1 GB, dividido en 12 partes `*.part001`…`*.part012`) y un `_readme.txt` de 403 bytes. El ZIP incluye los conjuntos experimentales de los autores del WHITED dentro del directorio `Experiments/`: 2Appl, ACAC, Compressing, in_household_*, Lamp-Bulb-Experiment, Location* y sparseData.

Los datos originales del WHITED son grabaciones de transitorios de arranque de tension y corriente a 44,1 kHz en FLAC estereo (un canal de tension, otro de corriente), con 110 electrodomesticos de 47 o mas tipos (cargadores, lamparas LED, CFL, hervidores, ventiladores, aspiradores, taladros, fuentes de PC/TV, microondas) procedentes de 8 ubicaciones (Alemania, Austria, Indonesia, Canada). Los factores de escala por kit de grabacion (MK1/MK2/MK3) y los codigos de region r1-r8 estan en `_readme.txt`. Para leerlos en Python se usa `soundfile.read(path)` y se multiplica por los factores de tension y corriente del kit correspondiente.

La innovacion tecnica del kit no esta en el modelo sino en el empaquetado: los ficheros de mas de 100 MB se dividen en fragmentos y se reconstruyen con `join_parts.ps1` (Windows) o `join_parts.sh` (Linux/macOS), verificando la integridad contra `SHA256SUMS.txt`. El repositorio forma parte de una serie de 15 repositorios (AFCI_part1 a AFCI_part15) con un indice maestro en AFCI_part6.

## Capacidades

- Almacenar y distribuir los conjuntos experimentales del dataset WHITED v1.1 (2Appl, ACAC, Compressing, in_household_*, Lamp-Bulb-Experiment, Location*, sparseData).
- Servir como *hard negatives* para entrenar un clasificador AFCI que distinga arcos reales de transitorios normales de electrodomesticos.
- Permitir pruebas de generalizacion a electrodomesticos no vistos, gracias a la variedad de 110 aparatos y 8 ubicaciones.
- Proporcionar senales sincronizadas de tension y corriente a 44,1 kHz para analisis espectral (FFT/STFT) y extraccion de caracteristicas.
- Reconstruccion verificable de los ficheros divididos mediante scripts y comprobacion SHA256.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingues: no es un modelo generativo.

## Casos de uso

- Entrenamiento de un detector AFCI con ejemplos negativos realistas: se usan los transitorios de arranque de cargas normales (hervidores, taladros, aspiradores) como clase negativa para reducir la tasa de disparos molestos en el modelo cuantizado que corre en el STM32F407.
- Validacion de generalizacion entre regiones: los codigos r1-r8 y los kits MK1/MK2/MK3 permiten comprobar si el detector entrenado con datos de una red electrica mantiene su rendimiento en otra.
- Ajuste de umbrales de disparo: los conjuntos `2Appl` y `ACAC` permiten simular combinaciones de cargas y medir como responde la cadena FFT/STFT + DNN ante solapamientos de transitorios.
- Analisis de firmas espectrales de fuentes conmutadas: las grabaciones de cargadores, lamparas LED y CFL sirven para caracterizar armonicos de alta frecuencia que se confunden con arcos en serie.
- Pruebas de robustez con datos dispersos: el conjunto `sparseData` permite evaluar el detector con pocas muestras por clase, un escenario habitual en despliegues embebidos con memoria limitada.
- Reproducibilidad de experimentos academicos: el repack con SHA256SUMS y scripts de union facilita repetir los experimentos de los autores del WHITED en un PC Windows x64 con CPU.
- Comparacion de tecnicas de compresion de caracteristicas: el conjunto `Compressing` permite medir el impacto de reducir la dimensionalidad de las features antes de la DNN cuantizada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- No aplica inferencia de modelo: el repositorio solo contiene datos.
- Almacenamiento: 1,2 GB para el repositorio completo; el ZIP reconstruido ocupa 1,1 GB, por lo que se recomienda reservar al menos 2,5 GB durante la reconstruccion.
- Entorno de entrenamiento objetivo del kit: PC con Windows 10/11 x64 y Python con CPU, sin GPU.
- Memoria: no disponible; depende del pipeline de entrenamiento del usuario (lectura de FLAC con `soundfile`/`librosa` y calculo de FFT/STFT).
- Despliegue en produccion del sistema AFCI: STM32F407 con ADC y DMA, segun la descripcion del kit.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Repositorio | Contenido | Tamano | Licencia | Uso |
|---|---|---|---|---|
| AFCI_part14 (este) | WHITED v1.1 Experiments (2Appl, ACAC, Compressing, in_household_*, Lamp-Bulb, Location*, sparseData) | 1,1 GB | other | Hard negatives y pruebas de generalizacion |
| AFCI_part13 | WHITED v1.1 grabaciones principales (1.339 FLAC), imagenes y plots | no disponible en la informacion | other | Datos base de electrodomesticos |
| AFCI_part6 | Indice maestro del kit (00_START_HERE_MASTER_INDEX.md) | no disponible | other | Guia de instalacion y orden de descarga |

No se dispone de informacion sobre otros repositorios de datos AFCI comparables en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo: no se puede cargar con transformers, vLLM, llama.cpp ni Ollama; cualquier intento de usarlo como tal fallara.
- Licencia ambigua: el WHITED no declara licencia explicita en su pagina original; el repositorio usa "other" y remite a citar a Kahl et al. (NILM 2016). Antes de un uso comercial hay que aclarar los terminos con los autores originales.
- Los datos son grabaciones de electrodomesticos reales, no de arcos electricos: por si solos no permiten entrenar un detector, solo complementar un dataset de arcos.
- Solo cubre los conjuntos experimentales, no las 1.339 grabaciones principales (esas estan en AFCI_part13); sin ambas partes el kit esta incompleto.
- Los ficheros estan divididos: es obligatorio ejecutar `join_parts.ps1` o `join_parts.sh` y verificar contra `SHA256SUMS.txt` antes de usar los datos.
- Los factores de escala por kit (MK1/MK2/MK3) deben aplicarse correctamente; omitirlos produce amplitudes de corriente y tension erroneas y arruina el entrenamiento.
- Cobertura geografica limitada a 8 ubicaciones en 4 paises; puede no representar redes electricas de otras regiones.
- Sin garantias de mantenimiento: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y no hay pipeline ni idiomas declarados.
- Riesgo de fuga de datos si se mezclan grabaciones del mismo electrodomestico entre train y test; hay que separar por aparato y por ubicacion.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/danielsaldana/AFCI_part14
- Indice maestro del kit: https://huggingface.co/danielsaldana/AFCI_part6/blob/main/00_START_HERE_MASTER_INDEX.md
- Fuente original del WHITED: https://www.cs.cit.tum.de/dis/resources/whited/
- Referencia: Kahl, Haq, Kriechbaumer, Jacobsen, "WHITED – A Worldwide Household and Industry Transient Energy Data Set", NILM Workshop 2016.
