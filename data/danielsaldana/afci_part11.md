# danielsaldana/AFCI_part11

## Resumen

`danielsaldana/AFCI_part11` no es un modelo de lenguaje: es un repositorio de datos que forma parte de un kit de desarrollo offline para un sistema de deteccion de arcos electricos (AFCI, *Arc-Fault Circuit Interrupter*) orientado a la prevencion de incendios electricos. Lo publica el usuario `danielsaldana` como una de 15 piezas (AFCI_part1 a AFCI_part15) de un kit cuyo flujo de trabajo previsto es: sensor de corriente, adquisicion mediante ADC y DMA de un microcontrolador STM32F407, extraccion de caracteristicas FFT/STFT y clasificacion con una red neuronal profunda cuantizada que decide el disparo del interruptor.

En concreto, esta parte 11 contiene seis grabaciones WAV de corriente electrica del conjunto publico de MIT (Siegel et al., 2018) correspondientes a dos clases de dispositivo, quemador (*burner*) y ventilador (*fan*), en condiciones normales y de arco electrico. El repositorio ocupa 1,6 GB en total y los ficheros de mas de 100 MB se han troceado en partes (`*.part001`, `*.part002`, etc.) que deben reensamblarse con los scripts `join_parts.ps1` (Windows) o `join_parts.sh` (Linux/macOS) y verificarse contra `SHA256SUMS.txt`.

La relevancia es la de un recurso de *TinyML* para senal electrica: las grabaciones estan a 48 kHz y 16 bits mono, una frecuencia cercana a la que un STM32F407 puede muestrear con comodidad, lo que permite validar como se comporta un modelo entrenado a baja tasa de muestreo antes de desplegarlo en el microcontrolador. No hay pesos, tokenizador ni arquitectura de red en este repositorio; la parte "modelo" del pipeline reside en otras piezas del kit.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el repositorio contiene datos de audio, no un modelo) |
| Parametros totales | no disponible (no aplica) |
| Parametros activos | no disponible (no aplica) |
| Longitud de contexto | no disponible (no aplica) |
| Tipos de cuantizacion | no disponible (no aplica a este repositorio; el pipeline del kit menciona una DNN cuantizada) |
| Idiomas soportados | no disponible (no aplica; son senales de corriente, no texto) |
| Licencia | `other` en HuggingFace; los WAV heredan la licencia de su publicador original: CC-BY-NC-4.0 (Harvard Dataverse, doi:10.7910/DVN/IFDIZ1) |
| Formato de pesos | no disponible (no hay pesos); los datos estan en WAV de 48 kHz, 16 bits, mono, mas ficheros `.partNNN` y `SHA256SUMS.txt` |

## Arquitectura y entrenamiento

No hay arquitectura de red ni proceso de entrenamiento en este repositorio. El contenido es un subconjunto del dataset "Electronic Circuit Current Data" de Siegel et al. (2018), usado como conjunto de entrenamiento en el articulo *Real-time Deep Neural Networks for internet-enabled arc-fault detection* (Siegel, Pratt, Sun y Sarma, *Engineering Applications of Artificial Intelligence*, 2018). Las grabaciones se tomaron con un sensor de corriente sobre cuatro clases de dispositivo (quemador, ventilador, iMac y generador de ozono) en condiciones normales y de arco.

El pipeline descrito en la model card del kit es: sensor de corriente, ADC y DMA del STM32F407, caracteristicas FFT/STFT, DNN cuantizada y decision de disparo. El entrenamiento se plantea en un PC offline con Windows 10/11 x64 y Python sobre CPU, sin GPU. Esta parte 11 aporta las clases burner y fan (seis ficheros: `Burner.wav`, `Burner2.wav`, `Fan.wav`, `Fan2.wav`, `Fan3.wav`, `Fan4.wav`); la parte 12 aporta iMac y ozone. La distincion entre grabaciones "normales" y "con arco" se documenta en el articulo y en la pagina del Dataverse, no en este repositorio.

## Capacidades

- Almacenar y distribuir grabaciones de corriente electrica a 48 kHz, 16 bits, mono, en formato WAV, legibles con `scipy.io.wavfile.read` o `soundfile`.
- Servir como material de entrenamiento y validacion para clasificadores de arco electrico (AFCI) basados en FFT/STFT y redes neuronales cuantizadas.
- Permitir la verificacion de integridad de los ficheros troceados mediante `SHA256SUMS.txt` y los scripts de reensamblado incluidos.
- Servir de base para evaluar el rendimiento de un modelo a baja tasa de muestreo, dado que 48 kHz es proximo a lo que un STM32F407 puede muestrear con holgura.
- No ofrece generacion de texto, razonamiento, codigo, vision, tool calling, agentes ni capacidades multilingues: no es un modelo generativo.

## Casos de uso

- Entrenamiento de un detector de arcos en un STM32F407: usar los WAV de burner y fan para extraer caracteristicas FFT/STFT y ajustar una DNN cuantizada que se ejecute en el microcontrolador, validando antes en PC el pipeline completo.
- Validacion de la cadena de adquisicion: reproducir las grabaciones a 48 kHz y pasarlas por el mismo preprocesado (ventaneo, FFT) que se aplicara a las muestras del ADC y DMA del STM32F407, para detectar desajustes de escala o de frecuencia de muestreo.
- Pruebas de robustez por clase de dispositivo: comparar el comportamiento del clasificador entre cargas inductivas (ventilador) y resistivas/de combustion (quemador) para comprobar si el modelo generaliza o aprende atajos ligados a la firma espectral del aparato.
- Benchmarking de tecnicas de extraccion de caracteristicas: evaluar distintas configuraciones de STFT (tamano de ventana, solapamiento, numero de bins) sobre las mismas grabaciones y medir su impacto en la precision de deteccion de arco.
- Reproducibilidad de experimentos academicos: reutilizar el subconjunto exacto de Siegel et al. (2018) para replicar resultados publicados o comparar contra ellos, citando a los autores segun exige la licencia CC-BY-NC-4.0.
- Docencia y prototipado de TinyML: emplear los ficheros como ejemplo realista de senal de corriente para practicar el flujo completo de un kit offline (descarga, reensamblado, verificacion SHA256, entrenamiento en CPU y despliegue en placa).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Almacenamiento: 1,6 GB para el repositorio completo; los ficheros troceados requieren espacio adicional durante el reensamblado.
- Memoria: los ficheros mayores (329,6 MB cada uno) pueden cargarse completos en RAM en un PC convencional; para procesarlos por bloques conviene usar lectura en streaming con `soundfile`.
- GPU: no necesaria. La model card del kit especifica entrenamiento en CPU sobre Windows 10/11 x64.
- Despliegue objetivo del pipeline AFCI: microcontrolador STM32F407 con ADC y DMA, ejecutando una DNN cuantizada.
- Herramientas: Python con `scipy` o `soundfile` para lectura de WAV; PowerShell 5+ o bash para los scripts de reensamblado.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Recurso | Contenido | Formato | Licencia | Notas |
|---|---|---|---|---|
| `danielsaldana/AFCI_part11` | Grabaciones de corriente burner y fan (MIT Siegel 2018) | WAV 48 kHz, 16 bits, mono | CC-BY-NC-4.0 (via Dataverse) | Parte 11 de un kit de 15 repositorios |
| `danielsaldana/AFCI_part12` | Grabaciones de corriente iMac y ozone (MIT Siegel 2018) | WAV 48 kHz, 16 bits, mono | CC-BY-NC-4.0 (via Dataverse) | Complementa a la parte 11 con las otras dos clases |
| Dataset original MIT (Siegel et al. 2018, doi:10.7910/DVN/IFDIZ1) | Las cuatro clases completas | WAV 48 kHz, 16 bits, mono | CC-BY-NC-4.0 | Fuente primaria en Harvard Dataverse |

No se dispone de informacion sobre otros modelos o datasets comparables en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo: no contiene pesos, configuracion de inferencia ni tokenizador; no puede usarse para generar texto ni para ninguna tarea de NLP.
- Licencia CC-BY-NC-4.0 en los datos originales: uso exclusivamente no comercial y obligacion de citar a los autores (Siegel, Pratt, Sun y Sarma, 2018).
- El campo `license: other` de HuggingFace no aclara los terminos; la model card remite a la licencia de cada publicador original.
- La distincion entre grabaciones normales y con arco no esta documentada en el repositorio: hay que consultar el articulo o la pagina del Dataverse, y la model card indica que el PDF de la tesis no pudo obtenerse automaticamente.
- Cobertura limitada: solo dos clases de dispositivo (burner y fan) en esta parte; el resto de clases esta en la parte 12.
- Los ficheros de mas de 100 MB estan troceados: sin ejecutar los scripts de reensamblado y verificar `SHA256SUMS.txt`, los WAV no son utilizables directamente.
- Riesgo de sesgo de dominio: grabaciones de un numero reducido de dispositivos y condiciones; un modelo entrenado solo con ellas puede no generalizar a otras cargas, instalaciones o calidades de red electrica.
- No hay informacion sobre sesgos, alucinacion ni limitaciones de contexto o idioma porque no aplican a un repositorio de senal electrica.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/danielsaldana/AFCI_part11
- Indice maestro del kit (AFCI_part6): https://huggingface.co/danielsaldana/AFCI_part6/blob/main/00_START_HERE_MASTER_INDEX.md
- Dataset original en Harvard Dataverse: https://doi.org/10.7910/DVN/IFDIZ1
- Articulo de referencia: Siegel, Pratt, Sun y Sarma, "Real-time Deep Neural Networks for internet-enabled arc-fault detection", *Engineering Applications of Artificial Intelligence*, 2018.
- Tesis en MIT DSpace (buscar el titulo del articulo): https://dspace.mit.edu
