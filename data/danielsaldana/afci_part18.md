# danielsaldana/AFCI_part18

## Resumen

AFCI_part18 no es un modelo de lenguaje, sino un repositorio de distribucion offline de herramientas de STMicroelectronics para el desarrollo de sistemas de deteccion de arcos electricos (AFCI, arc-fault circuit interrupter) sobre microcontroladores STM32. Concretamente, empaqueta X-CUBE-AI 10.2.0 y ST Edge AI Core 2.2.0, el conjunto de herramientas que permite convertir modelos de redes neuronales cuantizados (tipicamente en formato TFLite INT8) en codigo C optimizado para el STM32F407. Forma parte de un kit de 19 repositorios (AFCI_part1 a AFCI_part19) publicado por el usuario danielsaldana.

El problema que resuelve es la reproducibilidad en entornos sin conexion: el autor ha descargado los paquetes oficiales desde st.com (myST) y los ha replicado sin modificaciones para que un equipo de desarrollo pueda instalar toda la cadena de herramientas en un PC Windows 10/11 x64 aislado de red. El flujo completo descrito en la model card abarca desde la captura de corriente mediante ADC+DMA del STM32F407, el calculo de caracteristicas FFT/STFT, la inferencia de una DNN cuantizada y la decision de disparo (trip) del interruptor.

Es relevante ahora por dos motivos: por un lado, documenta un caso de uso de TinyML en el borde aplicado a seguridad electrica, un ambito donde la inferencia debe ejecutarse en tiempo real y sin dependencia de la nube; por otro, ejemplifica el patron de publicar cadenas de herramientas completas como artefactos versionados en Hugging Face, algo poco habitual y util para auditoria y despliegue en entornos industriales restringidos. El repositorio no contiene pesos de ningun modelo entrenado, sino unicamente los binarios y documentacion de las herramientas de ST.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No aplica: repositorio de herramientas (X-CUBE-AI 10.2.0 + ST Edge AI Core 2.2.0), no un modelo neuronal |
| Parametros totales | No disponible (no contiene pesos) |
| Parametros activos | No aplica |
| Longitud de contexto | No aplica |
| Tipos de cuantizacion | El flujo descrito usa modelos TFLite INT8 (`model_int8.tflite`); las herramientas soportan cuantizacion INT8 y otras segun documentacion de ST |
| Idiomas soportados | No disponible (no es un modelo linguistico) |
| Licencia | `other`: sujeta a los acuerdos de licencia de ST (SLA0048 para herramientas, SLA0044 para firmware) |
| Formato de pesos | No aplica; los artefactos son `.zip`, `.pack` (X-CUBE-AI) y ejecutables de ST Edge AI Core |
| Tamano del repositorio | 894,1 MB (868,9 MB + 25,2 MB) |
| Plataforma objetivo | STM32F407 (microcontrolador Cortex-M4) |
| Entorno de ejecucion | Windows 10/11 x64, CPU-only, sin conexion |

## Arquitectura y entrenamiento

Este repositorio no contiene ningun modelo entrenado ni codigo de entrenamiento. Su contenido son dos paquetes de software propietario de STMicroelectronics: `x-cube-ai-windows-v10.2.0.zip`, que incluye el pack `STMicroelectronics.X-CUBE-AI.10.2.0.pack` para instalar en STM32CubeMX y el paquete offline `stedgeai-windows-10.2.0.zip` (ST Edge AI Core 2.2.0), y `stedgeai-win.zip`, que contiene el instalador online `stedgeai-windows-onlineinstaller.exe`. El primero es el que debe usarse en el PC aislado; el segundo se conserva solo para futuras actualizaciones con conexion.

La cadena tecnica que habilita es la siguiente: un modelo de red neuronal cuantizado en INT8 se procesa con la CLI `stedgeai` para analizarlo (`analyze`), validarlo contra el host (`validate --mode host`) y generar codigo C (`generate --target stm32`). Ese codigo C se integra en el firmware del STM32F407, que ejecuta la inferencia sobre caracteristicas FFT/STFT extraidas de la senal de corriente capturada por ADC+DMA. No se especifican en la informacion disponible los detalles del modelo DNN concreto (capas, numero de parametros, dataset de entrenamiento ni si hubo cuantizacion consciente del entrenamiento).

Los ficheros de mas de 100 MB se distribuyen troceados en partes (`*.part001`, `*.part002`, ...) y se reconstruyen con `join_parts.ps1` (Windows) o `join_parts.sh` (Linux/macOS), verificandose contra `SHA256SUMS.txt`. La integridad de la cadena de suministro se apoya en ese checksum, no en firmas criptograficas adicionales.

## Capacidades

- Distribucion offline de la cadena de herramientas de ST para TinyML en STM32: X-CUBE-AI 10.2.0 y ST Edge AI Core 2.2.0.
- Instalacion del pack de X-CUBE-AI en STM32CubeMX desde fichero local (sin conexion).
- Conversion de modelos TFLite INT8 a codigo C para STM32F407 mediante `stedgeai generate`.
- Analisis y validacion de modelos en el host antes del despliegue (`stedgeai analyze`, `stedgeai validate --mode host`).
- Documentacion HTML offline incluida en `Documentation\index.html`.
- Reconstruccion y verificacion de ficheros troceados mediante scripts y `SHA256SUMS.txt`.
- No incluye capacidades de generacion de texto, razonamiento, codigo, vision, tool calling ni agentes: no es un modelo de lenguaje.

## Casos de uso

- Desarrollo de firmware AFCI en red aislada: un equipo de ingenieria instala X-CUBE-AI y ST Edge AI Core en un PC Windows sin acceso a internet y compila el modelo de deteccion de arcos a codigo C para el STM32F407, cumpliendo requisitos de seguridad industrial que prohiben conexiones externas en la estacion de trabajo.
- Reproducibilidad de builds: al fijar las versiones exactas 10.2.0 y 2.2.0 y verificar los ZIP contra `SHA256SUMS.txt`, se garantiza que cualquier miembro del equipo obtiene el mismo toolchain y, por tanto, el mismo binario generado.
- Auditoria de cadena de suministro: el repositorio permite inspeccionar que software propietario de ST se introduce en el pipeline y bajo que licencia (SLA0048, SLA0044), algo relevante en certificaciones de producto electrico.
- Formacion y prototipado TinyML: sirve como entorno de practicas para convertir un modelo INT8 en firmware de microcontrolador Cortex-M4 sin depender de la nube ni de cuentas myST.
- Despliegue de deteccion de fallos en tiempo real: el flujo ADC+DMA -> FFT/STFT -> DNN INT8 -> trip se ejecuta integramente en el STM32F407, sin latencia de red, lo que es adecuado para proteccion electrica donde la decision de disparo debe tomarse en milisegundos.
- Archivado a largo plazo de toolchains descatalogadas: si ST deja de distribuir una version concreta, el espejo en Hugging Face conserva el paquete instalable para mantenimiento de productos ya desplegados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El repositorio en si no requiere GPU: el entrenamiento descrito es CPU-only y la inferencia se ejecuta en el microcontrolador STM32F407.
- PC de desarrollo: Windows 10/11 x64 con Python para el entrenamiento y STM32CubeMX mas X-CUBE-AI para la generacion de codigo.
- Espacio en disco: al menos 894,1 MB para el repositorio completo, mas el espacio de los ficheros reconstruidos tras `join_parts`.
- Hardware de destino: STM32F407 (Cortex-M4), con perifericos ADC y DMA para la captura de corriente.
- VRAM estimada: no aplica.
- GPU recomendadas: no aplica; no se requiere acelerador grafico.
- Opciones de despliegue: STM32CubeMX + X-CUBE-AI, CLI `stedgeai` (analisis, validacion y generacion de codigo C).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Herramienta | Fabricante | Enfoque | Licencia | Distribucion offline |
|---|---|---|---|---|
| X-CUBE-AI 10.2.0 / ST Edge AI Core 2.2.0 (este repo) | STMicroelectronics | Conversion de modelos a codigo C para STM32 | Propietaria ST (SLA0048, SLA0044) | Si, espejo verificado con SHA256 |
| TensorFlow Lite for Microcontrollers | Google | Runtime de inferencia en microcontroladores | Apache 2.0 | Si, via repositorio publico |
| CMSIS-NN | Arm | Kernels optimizados para Cortex-M | Apache 2.0 | Si |
| Edge Impulse EON Compiler | Edge Impulse | Compilacion de modelos para MCU | Propietaria / planes comerciales | Parcial (requiere cuenta) |

La comparativa se limita a herramientas de despliegue TinyML, ya que el repositorio no contiene un modelo comparable en parametros ni contexto. No se dispone de datos de rendimiento comparativo entre estas herramientas en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo de IA: no contiene pesos, no genera texto ni realiza inferencia por si mismo. Cualquier expectativa de uso como LLM es incorrecta.
- El software incluido es propietario de STMicroelectronics y esta sujeto a sus acuerdos de licencia (SLA0048 para herramientas, SLA0044 para firmware); el uso comercial queda condicionado a la aceptacion de dichos terminos.
- El instalador online (`stedgeai-windows-onlineinstaller.exe`) requiere conexion a internet en el momento de la instalacion y no funciona en el PC aislado; debe usarse el paquete offline.
- La integridad se verifica solo mediante `SHA256SUMS.txt` generado por el autor del repositorio; no hay firmas criptograficas de ST ni atestacion de procedencia mas alla de la declaracion de que los ficheros se descargaron de st.com sin modificar.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validacion comunitaria de su contenido.
- No se documentan en la informacion disponible los sesgos, la tasa de alucinacion ni el rendimiento del modelo DNN de deteccion de arcos, ya que el modelo en si no forma parte de este repositorio.
- La plataforma objetivo declarada es STM32F407; no se confirma compatibilidad con otras familias STM32 en la informacion disponible.
- El flujo depende de modelos en formato TFLite INT8; otras arquitecturas o precisiones requeririan verificacion contra la documentacion de ST.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/danielsaldana/AFCI_part18
- Indice maestro del kit: https://huggingface.co/danielsaldana/AFCI_part6/blob/main/00_START_HERE_MASTER_INDEX.md
- Guia de instalacion: https://huggingface.co/danielsaldana/AFCI_part6/blob/main/00_INSTALLATION_GUIDE.md
- Documentacion de X-CUBE-AI en ST: no disponible en la informacion proporcionada
- Documentacion de ST Edge AI Core en ST: no disponible en la informacion proporcionada
