# abidblk/lethal-ape-experience-script

## Resumen

El artefacto publicado bajo el identificador `abidblk/lethal-ape-experience-script` no es un modelo de inteligencia artificial. Se trata de un paquete orientado a Windows de 64 bits que, segun su propia model card, contiene un ejecutable llamado `kingdom-come-deliverance-2-trainer-2026-v1.2.2-win64.exe` distribuido en un archivo ZIP de 4,8 MB protegido con contrasena. La model card describe funcionalidades propias de una herramienta de trampas para videojuegos (radar 2D, filtros de botin, superposicion externa con cajas delimitadoras, esqueletos de huesos, ESP de distancia y una capa de renderizado disenada para evadir la captura de OBS, ShadowPlay y Discord). No se declara ninguna arquitectura de red neuronal, ningun numero de parametros, ningun corpus de entrenamiento ni ningun pipeline de inferencia.

La relevancia de esta ficha es, por tanto, negativa: documenta un caso de uso indebido del Hub de Hugging Face, donde un repositorio etiquetado con metadatos de modelo aloja en realidad un binario ejecutable de terceros con instrucciones para desactivar las alertas de Windows Defender y SmartScreen. El repositorio registra 0 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado el 24 de noviembre de 2026.

Desde la perspectiva de evaluacion de modelos, no existe nada que evaluar: no hay pesos, no hay tokenizador, no hay configuracion de transformer, ni datos de benchmarks. Cualquier uso previsto de este artefacto queda fuera del ambito de esta publicacion y se limita a la ejecucion de un binario opaco en un sistema Windows.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; la model card describe una herramienta externa de superposicion para Windows x64) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (segun las etiquetas del repositorio, no verificable como capacidad del artefacto) |
| Licencia | MIT |
| Formato de pesos | no disponible (el artefacto distribuido es un ZIP de 4,8 MB con un ejecutable `.exe` para Windows x64) |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre arquitectura de red neuronal, datos de entrenamiento, numero de tokens, composicion del corpus ni tecnicas de alineacion como RLHF o DPO. La model card no contiene ninguna seccion de entrenamiento ni referencias a papers, y el artefacto no incluye pesos en formatos habituales (safetensors, GGUF, PyTorch binario) ni ficheros de configuracion de modelo.

La unica "arquitectura" descrita es la de una aplicacion de escritorio: un nucleo externo en modo usuario, sin hooks de DLL internos, que emplea Desktop Duplication para el renderizado, con un consumo declarado inferior a 64 MB de RAM, cuatro hilos de trabajo y un mecanismo de salida de panico mapeado a la tecla `END`. Se mencionan frecuencias de sondeo de 199 Hz, 304 Hz y 444 Hz para distintos subsistemas, y un tiempo de respuesta inferior a 18 ms para la capa de renderizado. Estos datos provienen exclusivamente del texto promocional del autor y no son verificables ni constituyen especificaciones de un modelo de lenguaje.

## Capacidades

- No se declara ninguna capacidad de generacion de texto, razonamiento, codigo, matematicas o vision por parte de un modelo de IA.
- No se declara soporte de tool calling ni de function calling.
- No se declara soporte de agentes ni de razonamiento multi-paso.
- No se declara capacitad multilingue real; las etiquetas de idioma del repositorio no van acompanadas de ninguna evaluacion.
- Las funcionalidades descritas en la model card son: radar 2D con filtro de botin por rareza y seguimiento de contenedores, superposicion externa con cajas 2D/3D, esqueletos de huesos y ESP de distancia, perfiles JSON intercambiables en caliente (presets Legit, Visual y Custom), capa de renderizado excluida de la captura de OBS, ShadowPlay y Discord, y salida de panico mediante la tecla `END`.
- Estas funcionalidades corresponden a un trainer o herramienta de trampas para un videojuego, no a un modelo fundacional.

## Casos de uso

- No procede. El artefacto no es un modelo de IA y no admite los casos de uso habituales (atencion al cliente, generacion de codigo, analisis documental, RAG, agentes, etc.).
- El unico escenario descrito por el autor es la ejecucion de un trainer sobre un juego concreto en Windows de 64 bits, con extraccion previa de un ZIP protegido por contrasena y elevacion de privilegios mediante "Run as Administrator".
- Cualquier integracion en pipelines de produccion, CI/CD o servicios backend es inviable: no hay API, no hay servidor de inferencia y no hay artefactos consumibles por vLLM, llama.cpp, Ollama o TGI.
- Uso en investigacion: nulo, al no existir pesos ni datos reproducibles.
- Uso en docencia o divulgacion: unicamente como ejemplo de repositorio mal etiquetado en el Hub y de riesgo de cadena de suministro.
- Uso como referencia de licencia: el repositorio declara MIT, pero la licencia no cubre los binarios de terceros que pueda descargar en tiempo de ejecucion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye cifras de rendimiento propias de la herramienta (frecuencias de sondeo, latencia de respuesta inferior a 18 ms, consumo inferior a 64 MB de RAM), pero no son comparables con metricas de modelos de lenguaje como MMLU, HumanEval o GSM8K, y no se ha verificado ninguna de ellas de forma independiente.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; no hay modelo que cargar en GPU.
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: no aplica.
- Sistema operativo declarado: Windows 10 y Windows 11 de 64 bits, sobre procesadores Intel y AMD x64.
- RAM declarada por el autor: menos de 64 MB para el nucleo externo.
- Espacio en disco: el paquete ZIP ocupa 4,8 MB antes de la extraccion.
- Opciones de despliegue: no aplica (no hay soporte para vLLM, llama.cpp, Ollama, TGI ni servidores compatibles con OpenAI).
- Latencia y throughput: no disponibles como metricas de inferencia; las cifras de sondeo y respuesta pertenecen a la herramienta de escritorio y no son verificables.

## Comparativa con modelos similares

No disponible. No existen modelos comparables porque el artefacto no pertenece a la categoria de modelos de IA. A modo de contraste estructural, se indican tres referencias reales del Hub con las que se podria confundir por etiquetado:

| Criterio | `abidblk/lethal-ape-experience-script` | Modelo de lenguaje tipico (p. ej. familia Llama o Qwen) | Modelo de vision-lenguaje tipico | Modelo de codigo tipico |
|---|---|---|---|---|
| Naturaleza | Binario ejecutable para Windows | Pesos de red neuronal | Pesos de red neuronal | Pesos de red neuronal |
| Parametros | no disponible | Cientos de millones a decenas de miles de millones | Similar al anterior | Similar al anterior |
| Contexto | no disponible | 8K a 128K tokens segun variante | 8K a 128K tokens | 8K a 128K tokens |
| Pesos publicados | Ninguno | safetensors, GGUF | safetensors, GGUF | safetensors, GGUF |
| Benchmarks | Ninguno | MMLU, GSM8K, HumanEval | MMMU, DocVQA | HumanEval, MBPP |
| Licencia | MIT (declarada) | Variables (Llama, Apache 2.0, etc.) | Variables | Variables |
| Despliegue | Ejecutable `.exe` | vLLM, llama.cpp, TGI, Ollama | vLLM, TGI | vLLM, llama.cpp |

## Limitaciones y advertencias

- El repositorio no contiene un modelo de IA: aloja un binario ejecutable de procedencia no verificada, distribuido en un ZIP con contrasena y con instrucciones para ejecutarlo como administrador.
- La model card pide explicitamente desactivar o sortear las alertas de Windows Defender y SmartScreen, lo que constituye una senal de alarma de seguridad de primer orden.
- El binario se presenta como un trainer para un videojuego, con funciones de evasion de captura de pantalla (OBS, ShadowPlay, Discord), lo que sugiere un diseno orientado a ocultar su actividad.
- Riesgo elevado de malware, adware o robo de credenciales: no hay firma de codigo, no hay hash publicado, no hay auditoria externa y el autor no ofrece canal de soporte verificable.
- La licencia MIT declarada no garantiza la legalidad ni la seguridad del contenido distribuido, y no cubre binarios de terceros descargados en tiempo de ejecucion.
- El etiquetado del repositorio (tags de idioma, licencia, region) induce a confusion con un modelo multilingue; las capacidades linguisticas declaradas no estan respaldadas por ningun artefacto.
- Uso comercial: desaconsejado en cualquier escenario; el uso de trainers en juegos puede infringir los terminos de servicio del editor y la legislacion aplicable en materia de proteccion de software.
- No apto para produccion, investigacion ni evaluacion comparativa de modelos.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/abidblk/lethal-ape-experience-script
- Enlace de descarga citado en la model card (ZIP, 4,8 MB): https://github.com/ErikMercier70637/kingdom-come-deliverance-2-trainer-2026/releases/download/v1.2.0/kingdom-come-deliverance-2-trainer-2026-v1.2.2-win64.zip
- Pagina de releases citada en la model card: https://github.com/patricialiu33/lethal-ape-experience-script/releases/latest
- Paper, blog o demo oficial: no disponible
- Repositorio de codigo fuente verificable: no disponible
