# danielsaldana/AFCI_part10

## Resumen

AFCI_part10 no es un modelo de lenguaje ni una red neuronal entrenada: es el decimoquinto (parte 10 de 15) de un kit de desarrollo offline para un sistema de deteccion de arcos electricos (AFCI, arc-fault circuit interrupter) orientado a la prevencion de incendios electricos. El repositorio contiene exclusivamente grabaciones crudas de corriente y tension de arcos en serie, a 230 V / 50 Hz, capturadas por la Universite de Lorraine en colaboracion con la Huaqiao University y la UNIVPM, y redistribuidas aqui como parte del material de entrenamiento del kit.

La arquitectura objetivo del sistema completo, descrita en la model card, es una cadena de senal: sensor de corriente, muestreo mediante ADC y DMA de un STM32F407, extraccion de caracteristicas FFT/STFT y una DNN cuantizada que decide si dispara la proteccion. Este repositorio concreto aporta los datos en bruto (formato binario `.dat`) de la categoria "opening contact" (apertura de contacto) y cargas resistivas, que complementan las grabaciones de "carbonized path" publicadas en las partes 8 y 9.

Es relevante para quien quiera reentrenar o validar el detector eligiendo su propia ventana de analisis y frecuencia de muestreo, en lugar de usar las ventanas precortadas de la parte 7 (Ferracuti et al. 2025). El repositorio pesa 1,3 GB y no incluye pesos de modelo, codigo de inferencia ni pipeline declarado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el repositorio contiene datos, no un modelo; el sistema objetivo usa FFT/STFT + DNN cuantizada sobre STM32F407) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (la model card menciona una "quantized DNN" como parte del sistema objetivo, sin especificar esquema) |
| Idiomas soportados | no disponible (los datos son senales electricas, no texto) |
| Licencia | other; los datos originales de Zenodo se declaran CC-BY-4.0 |
| Formato de pesos | no disponible; los datos se distribuyen como `.dat` binarios, con ficheros >100 MB divididos en `.part001`, `.part002`, etc. |

## Arquitectura y entrenamiento

El repositorio no define una arquitectura de modelo. La model card describe el sistema completo al que sirve: un sensor de corriente alimenta el ADC de un STM32F407 con DMA, se calculan caracteristicas FFT/STFT y una DNN cuantizada decide el disparo (trip). El entrenamiento se plantea en un PC offline con Windows 10/11 x64 y solo CPU, en Python.

Los datos incluidos son 14 grabaciones `.dat` de corriente y tension (prefijos `C2_` y `C3_`) de un unico aparato por fichero, con arco en serie generado por apertura de contacto: taladro "titan", robot de cocina "moulinex" y "moulinexbis", cargas resistivas de 4,5 A y 7,9 A, y aspiradoras. Cada fichero ronda los 85-93 MB. Se acompanan del `ReadMe_Zenodo3997337.pdf`, que documenta el formato binario, la frecuencia de muestreo, el significado de los canales y la temporizacion arco/normal; esos metadatos no se reproducen en la model card. Los ficheros de trayectoria carbonizada de Zenodo 3997337 que ya existian en 5501527 no se duplicaron.

No se documenta numero de tokens, composicion de dataset agregada, RLHF/DPO ni innovaciones de decodificacion, por no tratarse de un modelo generativo.

## Capacidades

- Almacenar senales crudas de corriente y tension de arcos en serie a 230 V / 50 Hz para su posterior procesado.
- Servir de base para elegir ventana de analisis y frecuencia de muestreo propias, ajustadas a lo que el ADC del STM32F407 puede muestrear realmente.
- Cubrir dos familias de carga: apertura de contacto (herramientas electricas, electrodomesticos, aspiradoras) y cargas resistivas puras (4,5 A y 7,9 A).
- Reconstruccion de ficheros divididos mediante `join_parts.ps1` (Windows) o `join_parts.sh` (Linux/macOS), con verificacion contra `SHA256SUMS.txt`.
- No incluye inferencia, tool calling, agentes, capacidades multilingues ni modos de razonamiento.

## Casos de uso

- Entrenamiento de un clasificador AFCI con ventana propia: a partir de las series crudas se pueden segmentar ventanas de la longitud que imponga el presupuesto de computo del STM32F407, en lugar de adoptar las ventanas precortadas de la parte 7.
- Validacion cruzada entre tipos de arco: combinar estas grabaciones de apertura de contacto con las de trayectoria carbonizada de las partes 8 y 9 para comprobar que el detector no se sobreajusta a un unico mecanismo de fallo.
- Ajuste de la frecuencia de muestreo al hardware: remuestrear las series para simular la tasa efectiva del ADC y medir la perdida de separabilidad entre arco y regimen normal.
- Pruebas con cargas resistivas como clase negativa dificil: los ficheros de 4,5 A y 7,9 A permiten calibrar falsos positivos en cargas puramente resistivas, donde el arco es mas dificil de discriminar.
- Analisis espectral offline: calcular STFT sobre las series y estudiar que bandas separan mejor el arco en cada electrodomestico antes de fijar el extractor de caracteristicas.
- Reproducibilidad de resultados publicados: reimplementar el pipeline de Ferracuti et al. 2025 desde los datos crudos y contrastar las metricas reportadas con las ventanas precortadas.
- Docencia y prototipado en TinyML: usar el kit completo para construir un detector embebido de bajo coste con solo CPU en la fase de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Almacenamiento: 1,3 GB para el repositorio completo; los ficheros reconstruidos ocupan aproximadamente lo mismo que las partes sumadas (85-93 MB por grabacion, 14 grabaciones).
- Entrenamiento: la model card especifica PC offline con Windows 10/11 x64 y CPU exclusivamente, en Python; no se indica RAM ni GPU necesaria.
- Inferencia objetivo: microcontrolador STM32F407 (ADC + DMA), sin requisitos de VRAM.
- GPU: no aplica segun la documentacion; no se mencionan A100, H100 ni RTX 4090.
- Despliegue: no se documentan opciones como vLLM, llama.cpp, Ollama o TGI, por no tratarse de un modelo de lenguaje.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Repositorio | Contenido | Mecanismo de arco | Licencia | Disponibilidad |
|---|---|---|---|---|
| AFCI_part10 (este) | 14 grabaciones crudas `C2_`/`C3_` + ReadMe Zenodo 3997337 | Apertura de contacto y cargas resistivas | other (datos originales CC-BY-4.0) | Hugging Face |
| AFCI_part8 | 13 grabaciones crudas `C2_` + ReadMe Zenodo 5501527 | Trayectoria carbonizada | other (datos originales CC-BY-4.0) | Hugging Face |
| AFCI_part9 | 13 grabaciones crudas `C3_` | Trayectoria carbonizada | other (datos originales CC-BY-4.0) | Hugging Face |
| AFCI_part7 (Ferracuti et al. 2025) | Ventanas precortadas + codigo | Mixto | no disponible en la informacion proporcionada | Hugging Face |

No se dispone de informacion sobre otros conjuntos de datos AFCI comparables en la documentacion facilitada.

## Limitaciones y advertencias

- No es un modelo: no puede usarse para inferencia directa ni para generacion; requiere construir el pipeline de entrenamiento alrededor de los datos.
- Cobertura limitada: 14 grabaciones de un unico laboratorio, con un aparato por fichero y un repertorio acotado de cargas (taladro, robot de cocina, aspiradoras y dos resistivas). La generalizacion a otras redes electricas, tensiones o electrodomesticos no esta validada.
- Sesgo de dominio: todas las capturas son a 230 V / 50 Hz; el comportamiento del detector entrenado con estos datos puede no transferirse a 120 V / 60 Hz.
- Metadatos imprescindibles fuera de la model card: el formato binario, la frecuencia de muestreo y la temporizacion arco/normal solo estan en el PDF `ReadMe_Zenodo3997337.pdf`; sin el, los `.dat` no son interpretables.
- Ficheros divididos: es obligatorio ejecutar los scripts de union y verificar `SHA256SUMS.txt` antes de usar los datos; un fallo de reconstruccion invalida silenciosamente el entrenamiento.
- Licencia: la model card declara `other` a nivel de repositorio, mientras que los datos originales de Zenodo se declaran CC-BY-4.0. Es necesario citar los registros de Zenodo y los articulos de los autores; conviene verificar los terminos exactos antes de un uso comercial.
- Riesgo de fuga entre particiones: al provenir de grabaciones largas y continuas, una division aleatoria de ventanas puede filtrar informacion entre train y test; la separacion debe hacerse por grabacion o por aparato.
- Sin garantias de seguridad funcional: el kit es material de desarrollo; no sustituye la certificacion de un AFCI comercial conforme a la normativa aplicable.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/danielsaldana/AFCI_part10
- Indice maestro del kit (AFCI_part6): https://huggingface.co/danielsaldana/AFCI_part6/blob/main/00_START_HERE_MASTER_INDEX.md
- Zenodo 3997337 (origen de las grabaciones de apertura de contacto): https://zenodo.org/records/3997337
- Zenodo 5501527 (origen de las grabaciones de trayectoria carbonizada): https://zenodo.org/records/5501527
- Paper de referencia citado en la model card: Ferracuti et al. 2025 (ventanas precortadas y codigo en AFCI_part7); URL no disponible en la informacion proporcionada.
