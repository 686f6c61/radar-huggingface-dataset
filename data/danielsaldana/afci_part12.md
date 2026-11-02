# danielsaldana/AFCI_part12

## Resumen

AFCI_part12 no es un modelo de lenguaje ni una red neuronal entrenada: es un repositorio de distribución que empaqueta grabaciones de corriente eléctrica del dataset público de Siegel et al. (2018) del MIT, concretamente la segunda mitad del conjunto (dispositivos iMac y generador de ozono). Forma parte de un kit de desarrollo offline de 15 repositorios (AFCI_part1 a AFCI_part15) orientado a construir un sistema de detección de arcos eléctricos (AFCI, *Arc-Fault Circuit Interrupter*) sobre un microcontrolador STM32F407, con un pipeline que va desde la captura por ADC+DMA hasta la clasificación mediante una DNN cuantizada y la decisión de disparo.

El interés técnico del repositorio está en que proporciona señales reales de corriente muestreadas a 48 kHz y 16 bits en formato WAV mono, una frecuencia cercana a la que un STM32F407 puede muestrear de forma cómoda, lo que permite validar si un modelo TinyML de baja tasa de muestreo funciona antes de portarlo al microcontrolador. El repositorio pesa 1,0 GB y contiene cinco archivos WAV, algunos divididos en partes (`*.part001`, etc.) que deben reconstruirse con los scripts incluidos.

Es relevante ahora porque los datasets de detección de arcos eléctricos son escasos y están fragmentados, y este repositorio agrupa y documenta una porción concreta del corpus del MIT con verificación de integridad (SHA256) y scripts de reconstrucción multiplataforma, lo que reduce la fricción para reproducir experimentos de AFCI en un PC Windows sin GPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el repositorio contiene datos, no un modelo) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el pipeline objetivo menciona una DNN cuantizada, sin especificar esquema) |
| Idiomas soportados | no disponible (los datos son señales de corriente, no texto) |
| Licencia | other; los WAV provienen del dataset MIT de Siegel et al. bajo CC-BY-NC-4.0 (solo uso no comercial, citando a los autores) |
| Formato de pesos | no aplica; datos en WAV (48 kHz, 16 bits, mono), con archivos >100 MB divididos en partes y `SHA256SUMS.txt` |

## Arquitectura y entrenamiento

El repositorio no define arquitectura de red ni proceso de entrenamiento. Lo que describe es el pipeline objetivo del kit: sensor de corriente, adquisición mediante ADC y DMA en un STM32F407, extracción de características FFT/STFT, clasificación con una DNN cuantizada y activación del disparo (trip). El entrenamiento se plantea en un PC offline con Windows 10/11 x64 y solo CPU.

Los datos incluidos son grabaciones de corriente del dataset "Electronic Circuit Current Data" de Siegel, Pratt, Sun y Sarma (2018), almacenadas a 48 kHz, 16 bits y mono, con cuatro clases de dispositivo (quemador, ventilador, iMac y generador de ozono) en condiciones normales y de arco. Este repositorio concreto (parte 12) aporta `iMac1.wav`, `iMac2.wav`, `Ozone.wav`, `Ozone2.wav` y `Ozone3.wav`; la parte 11 contiene los archivos de quemador y ventilador. La distinción entre grabaciones "normales" y "con arco" se remite al paper y a la página de Dataverse, ya que el PDF de la tesis no se pudo recuperar automáticamente.

## Capacidades

- Distribución de datos de corriente para entrenamiento y evaluación de detectores de arco eléctrico, no de un modelo generativo.
- Grabaciones a 48 kHz y 16 bits mono, compatibles con `scipy.io.wavfile.read` y `soundfile`.
- Cobertura de dos clases de dispositivo (iMac y generador de ozono) en condiciones normales y de arco, según la descripción del dataset original.
- Reconstrucción de archivos divididos mediante `join_parts.ps1` (Windows) y `join_parts.sh` (Linux/macOS), con verificación contra `SHA256SUMS.txt`.
- Indexación dentro de un kit de 15 repositorios con un índice maestro en AFCI_part6 (`00_START_HERE_MASTER_INDEX.md`).
- Frecuencia de muestreo alineada con las posibilidades de captura de un STM32F407, útil para prototipar modelos de baja tasa antes del despliegue en el microcontrolador.
- Registro de descarga (`download_log_stage12.json`) para trazabilidad del proceso de obtención de datos.

## Casos de uso

- Entrenamiento de un clasificador binario normal/arco: se usan los WAV de iMac y generador de ozono como ejemplos positivos y negativos, extrayendo características FFT/STFT para alimentar una DNN cuantizada que luego se porta al STM32F407.
- Validación de la cadena ADC+DMA del microcontrolador: al estar las señales a 48 kHz, se puede comparar la respuesta del front-end de captura real con las grabaciones de referencia antes de desplegar el modelo.
- Estudio de generalización entre dispositivos: combinando esta parte con la parte 11 (quemador y ventilador) se evalúa si un detector entrenado con unas cargas funciona con otras, un problema central en AFCI real.
- Análisis de robustez ante cambios de carga: el generador de ozono y el iMac presentan perfiles de corriente distintos, lo que permite medir falsos positivos y falsos negativos por clase.
- Reproducción de resultados académicos: el repositorio facilita replicar experimentos sobre el corpus de Siegel et al. (2018) con verificación de integridad de los archivos.
- Docencia y prototipado en entorno offline: el kit está pensado para un PC Windows sin GPU, lo que lo hace adecuado para laboratorios con hardware limitado.
- Desarrollo de prevención de incendios eléctricos en entornos domésticos: los datos permiten ajustar umbrales de disparo antes de integrar el sistema en un interruptor diferencial o protección de circuito.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Almacenamiento: 1,0 GB para el repositorio completo; los archivos divididos requieren espacio adicional temporal durante la reconstrucción.
- Inferencia: no aplica; el repositorio no contiene pesos ni modelo ejecutable.
- Entrenamiento objetivo del kit: PC con Windows 10/11 x64 y CPU únicamente, sin GPU requerida según la model card.
- Despliegue previsto del sistema final: microcontrolador STM32F407 con ADC y DMA para la captura de corriente.
- Herramientas de lectura de datos: `scipy.io.wavfile` o `soundfile` en Python.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Alternativa | Tipo | Contenido | Licencia | Disponibilidad |
|---|---|---|---|---|
| AFCI_part12 (este repositorio) | Datos de corriente | iMac y generador de ozono, 5 WAV, 48 kHz/16 bits | other; datos originales CC-BY-NC-4.0 | HuggingFace, 0 descargas |
| AFCI_part11 | Datos de corriente | Quemador y ventilador, 6 WAV | same que el dataset original | HuggingFace, dentro del mismo kit |
| Dataset MIT original (Siegel et al. 2018) | Datos de corriente | Conjunto completo de cuatro clases | CC-BY-NC-4.0 | Harvard Dataverse, doi:10.7910/DVN/IFDIZ1 |

No se dispone de información sobre otros repositorios comparables de detección de arcos eléctricos en la información proporcionada.

## Limitaciones y advertencias

- El repositorio no contiene un modelo entrenado ni pesos: es únicamente un paquete de datos y scripts de reconstrucción.
- La licencia de los WAV originales es CC-BY-NC-4.0, lo que restringe el uso a fines no comerciales y exige citar a los autores; la licencia del repositorio figura como "other", por lo que conviene revisar los términos antes de cualquier uso en producción.
- Solo cubre dos clases de dispositivo (iMac y generador de ozono); el resto de clases está en la parte 11 y debe descargarse por separado.
- La distinción entre grabaciones normales y con arco no está documentada dentro del repositorio; hay que consultar el paper o la página de Dataverse.
- Los archivos de más de 100 MB están divididos en partes y requieren ejecutar los scripts de reconstrucción; un uso directo de los `.partXXX` produciría lecturas corruptas.
- El repositorio tiene 0 descargas y 0 likes, sin validación comunitaria conocida.
- No hay información sobre sesgos, tasas de alucinación ni cobertura idiomática porque no se trata de un modelo de lenguaje.
- La fecha de creación indicada (2026-11-02) es posterior a la fecha actual en el momento de redactar esta ficha, lo que conviene verificar antes de citar el recurso.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/danielsaldana/AFCI_part12
- Índice maestro del kit (AFCI_part6): https://huggingface.co/danielsaldana/AFCI_part6/blob/main/00_START_HERE_MASTER_INDEX.md
- Dataset original en Harvard Dataverse: https://doi.org/10.7910/DVN/IFDIZ1
- Paper de referencia: Siegel, Pratt, Sun y Sarma, "Real-time Deep Neural Networks for internet-enabled arc-fault detection", Engineering Applications of AI, 2018
- Tesis en MIT DSpace: https://dspace.mit.edu (buscar "Real-time Deep Neural Networks for internet-enabled arc-fault detection")
