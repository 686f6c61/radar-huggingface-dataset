# ryugyosoft/onw

## Resumen

onw (nombre completo del proyecto: "onw — 俺のNPUがこんなに動くわけない") es un motor de inferencia desarrollado por ryugyosoft que permite ejecutar modelos de lenguaje grandes **exclusivamente sobre la NPU de un procesador Intel Core Ultra**, sin depender de GPU discreta ni de servicios en la nube. No es un modelo de pesos en sí, sino una pieza de software equivalente en filosofia a lo que llama.cpp es para GGUF: un motor unico y un comando unico capaz de cargar distintos modelos ya convertidos a su formato. Soporta arquitecturas MoE y modelos hibridos con Gated DeltaNet, admite entrada de imagen en algunos modelos, e incluye un servidor con API compatible con OpenAI y una interfaz de chat en navegador.

El proyecto se distribuye bajo licencia Apache 2.0 y esta orientado a equipos con Intel Core Ultra (series 1 y 2, Lunar Lake y posteriores) sobre Windows 11 o Ubuntu 22.04 o superior. La instalacion se reduce a una linea de PowerShell o Bash, y el propio instalador se encarga de descargar el motor (aproximadamente 1 GB) y de ofrecer un catalogo de modelos de entre 4 y 17 GB. Entre los modelos soportados figuran LFM2-8B-A1B (MoE de 32 expertos, 4 activos), Gemma 4 E4B (con entrada de texto e imagen) y Qwen3.5-9B (hibrido Gated DeltaNet con atencion con puertas).

Su relevancia actual radica en que traslada la inferencia local de LLM desde la GPU y la CPU hacia el acelerador neuronal integrado en los portatiles Intel modernos, con velocidades declaradas de 16 a 17 tokens por segundo en un NPU 3720 para LFM2-8B-A1B, que suben a 29-43 tokens por segundo al activar la decodificacion especulativa (verificacion de prelectura) en tareas de correccion de codigo y resumen. El repositorio de HuggingFace no registra descargas ni "likes", y la model card publicada esta truncada, por lo que parte de la informacion tecnica no esta disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No aplica: es un motor de inferencia sobre OpenVINO para Intel NPU. Soporta arquitecturas de modelo `lfm2_moe`, `gemma4` y `qwen3_5` (Gated DeltaNet mas atencion con puertas) |
| Parametros totales | No disponible (depende del modelo cargado; por ejemplo, LFM2-8B-A1B, Gemma 4 E4B, Qwen3.5-9B) |
| Parametros activos | No disponible como dato del motor. En el modelo onw soportado LFM2-8B-A1B la denominacion indica 8B totales y aproximadamente 1B activos (MoE de 32 expertos, 4 activos) |
| Longitud de contexto | 4096 tokens por defecto (`--context 4096` en el comando `serve`); configurable. El maximo no esta disponible |
| Tipos de cuantizacion | No disponible. La cuantizacion se define en el paso de conversion (`onw convert`), junto con tamano de bloque, tamano de imagen, `--compact` y `--prune` |
| Idiomas soportados | Japones (ja) e ingles (en), segun los metadatos del repositorio |
| Licencia | Apache 2.0 |
| Formato de pesos | Formato propio de onw derivado de OpenVINO (no safetensors ni GGUF). Los modelos se obtienen convertidos desde HuggingFace |

## Arquitectura y entrenamiento

onw no entrena ningun modelo: es una capa de ejecucion. Convierte grafos de red neuronal a un formato optimizado para la NPU de Intel mediante OpenVINO y los ejecuta con un unico binario/comando. Internamente declara soporte para tres familias de arquitectura: `lfm2_moe` (combinacion de convolucion corta, atencion GQA y mezcla de expertos con 32 expertos de los que se activan 4), `gemma4` (reutilizando grafos de NPU ya validados para la familia Gemma) y `qwen3_5` (hibrido de Gated DeltaNet con atencion con puertas). El comando `onw list` muestra las arquitecturas soportadas en cada version del motor.

En el plano de la ejecucion, el motor incorpora varias innovaciones practicas: un mecanismo de verificacion de prelectura (decodificacion especulativa) que eleva el rendimiento declarado de 16-17 tok/s hasta 29-43 tok/s en cargas de correccion de codigo y resumen; compilacion previa de grafos por longitud de contexto (la primera carga tarda entre 10 y 30 minutos y las posteriores unos 20 segundos); y una funcion experimental de comparticion de pesos NPUW (`ONW_NPUW=1/0`), activada por defecto en Lunar Lake y posteriores pero excluida en los modelos MoE (LFM2 y Qwen3.6), que reduce el uso de memoria y el tiempo de compilacion manteniendo una sola copia de los pesos. Para Gemma existe ademas un modo de procesamiento de 64 tokens (`ONW_S64=1/0`). No se proporciona informacion sobre datasets de entrenamiento, numero de tokens ni uso de RLHF o DPO, ya que el proyecto no entrena modelos.

## Capacidades

- Inferencia de texto de modelos LLM y MoE ejecutada integramente en la NPU Intel, con retroceso a CPU en equipos sin controlador de NPU.
- Soporte multilingue limitado a japones e ingles segun los metadatos; el idioma efectivo depende del modelo cargado.
- Entrada de imagen en modelos que la soportan, como Gemma 4 E4B (texto mas imagen).
- Servidor con API compatible con OpenAI en `http://localhost:8000/v1`, con endpoints `GET /` (informacion del servidor en JSON) y `/health` (comprobacion de carga del modelo).
- Interfaz de chat en navegador (`/chat`) y pagina de verificacion (`/check`) que ejecuta pruebas de texto, prelectura, conversacion de dos turnos e imagen, generando una tabla de velocidades.
- Decodificacion especulativa (verificacion de prelectura) activada por defecto y desactivable con `--no-pld`.
- Control de generacion por peticion: temperature, top_p, top_k, penalizaciones de repeticion, presencia y frecuencia, max_tokens, stop, seed y modo de razonamiento (`--think` en el chat).
- Conversion de modelos propios desde un directorio HuggingFace mediante `onw convert HF_DIR OUT_DIR`, con opciones `--compact`, `--prune` y `--graphs-only`.
- Gestion de modelos desde ventana grafica e icono en bandeja del sistema en Windows y Ubuntu.
- Proteccion opcional del endpoint `/v1` con clave de API (`--api-key`) y CORS abierto por defecto.

## Casos de uso

- Asistente local en portatil Intel Core Ultra: un desarrollador puede ejecutar LFM2-8B-A1B sobre la NPU consumiendo unos 6 GB de memoria y sin GPU dedicada, lo que libera la CPU y la grafica para el resto del trabajo y elimina la dependencia de conectividad.
- Integracion en editores y extensiones compatibles con OpenAI: basta apuntar la base URL a `http://localhost:8000/v1` para que herramientas de autocompletado, revision de codigo o generacion de documentacion usen el modelo local en lugar de una API remota.
- Asistencia sobre documentacion tecnica en japones e ingles: el proyecto declara soporte de ambos idiomas, lo que encaja con equipos que trabajan con material bilingue y necesitan resumenes o traducciones sin enviar el texto a terceros.
- Analisis de capturas y diagramas con Gemma 4 E4B: al aceptar entrada de imagen, permite extraer texto de capturas de pantalla, describir diagramas de arquitectura o resumir figuras tecnicas en local, a costa de unos 15 GB de memoria en uso y 7,2 tok/s.
- Correccion y refactorizacion de codigo con decodificacion especulativa: en estas cargas el rendimiento sube a 29-43 tok/s, lo que hace viable revisar fragmentos de codigo de forma interactiva en un portatil.
- Despliegue en entornos con requisitos de privacidad: al ejecutarse sin salida a internet, el motor encaja en escenarios donde el texto no puede salir del equipo, como borradores legales, notas clinicas o codigo propietario.
- Banco de pruebas para desarrolladores de aplicaciones con IA: la pagina `/check` ofrece mediciones de velocidad y pruebas funcionales reproducibles, util para comparar modelos o ajustes antes de fijar una configuracion.
- Servicio en red local para un equipo pequeno: con `--host 0.0.0.0` y `--api-key`, el motor puede exponerse en la LAN y dar servicio a varios clientes desde un unico portatil con NPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Los unicos datos de rendimiento proporcionados por el autor son mediciones de velocidad de generacion en un NPU 3720:

| Modelo onw | Arquitectura | Entradas | Velocidad de generacion (NPU 3720) | Tamano de descarga | Memoria en uso |
|---|---|---|---|---|---|
| ryugyosoft/LFM2-8B-A1B-onw | `lfm2_moe` (convolucion corta + GQA + MoE 32 expertos, 4 activos) | Texto | 16-17 tok/s; 29-43 tok/s con verificacion de prelectura en correccion de codigo y resumen | 4,0 GB | Aproximadamente 6 GB |
| ryugyosoft/gemma-4-E4B-it-onw | `gemma4` (grafos NPU de Gemma ya validados) | Texto e imagen | 7,2 tok/s | 4,3 GB | Aproximadamente 15 GB |
| ryugyosoft/Qwen3.5-9B-onw | `qwen3_5` (Gated DeltaNet + atencion con puertas) | No disponible (la model card aparece truncada) | No disponible | No disponible | No disponible |

Tiempos de compilacion en primera carga reportados por el autor en su equipo de pruebas: LFM2 aproximadamente 1,5 minutos, Gemma 4 E4B aproximadamente 11 minutos y Qwen3.5-9B aproximadamente 13 minutos (la horquilla general indicada es de 10 a 30 minutos).

## Requisitos de hardware

- Procesador Intel Core Ultra con NPU integrada (series 1 y 2, Lunar Lake y posteriores). Sin NPU, el motor funciona en CPU.
- Sistema operativo Windows 11 o Ubuntu 22.04 o superior.
- En Ubuntu, controlador de NPU `linux-npu-driver` version 1.38 o superior. Con versiones anteriores, las capas iniciales de LFM2-8B-A1B se calculan de forma incorrecta en la NPU en Lunar Lake y la respuesta se corta emitiendo tokens especiales; el problema se corrige en la 1.38. La version se comprueba con `dpkg -l | grep -i npu`.
- Espacio en disco: aproximadamente 1 GB para el motor mas entre 4 y 17 GB por modelo descargado.
- Memoria: no se especifica VRAM porque la NPU utiliza memoria del sistema. Las cifras declaradas de uso son de aproximadamente 6 GB para LFM2-8B-A1B y 15 GB para Gemma 4 E4B, por lo que en un equipo de 16 GB se recomienda LFM2-8B-A1B.
- La memoria y el coste de computo por token aumentan al alargar la longitud de contexto, ya que se referencia la cache KV completa de longitud fija en cada paso; se recomienda elegir la longitud necesaria y no el maximo del modelo.
- Opciones de despliegue: instalador propio en Windows (`install.ps1`) y Ubuntu (`install.sh`), comandos `onw serve`, `onw chat`, `onw tray`, `onw window`, `onw convert` y `onw list`. No se menciona soporte para vLLM, llama.cpp, Ollama ni TGI, ya que el formato de pesos es propio.
- Latencia y throughput: los datos disponibles son los de la tabla anterior (16-17 tok/s, 7,2 tok/s y 29-43 tok/s con prelectura). La latencia de arranque es de unos 20 segundos con la compilacion ya cacheada y de 10 a 30 minutos en la primera carga o al cambiar la longitud de contexto.
- Se indica que la compilacion se puede realizar mientras se usa el equipo con normalidad.

## Comparativa con modelos similares

onw compite en la categoria de motores de inferencia local, no de modelos. La comparacion se establece, por tanto, con otras herramientas de ejecucion y no con pesos concretos.

| Herramienta | Acelerador objetivo | Formatos | API compatible con OpenAI | Licencia | Notas |
|---|---|---|---|---|---|
| onw (ryugyosoft) | Intel NPU (Core Ultra), con retroceso a CPU | Formato propio sobre OpenVINO | Si (`/v1`, `/health`, `/chat`, `/check`) | Apache 2.0 | Enfocado exclusivamente a NPU Intel; catalogo de modelos propio y conversion integrada |
| llama.cpp | CPU y GPU (CUDA, Metal, Vulkan) | GGUF | Si, mediante servidor incluido | MIT (no confirmado en la informacion disponible) | Referencia que el propio autor cita como analogia; no utiliza NPU Intel como destino principal |
| OpenVINO GenAI | CPU, GPU Intel y NPU Intel | IR de OpenVINO | No confirmado | Apache 2.0 (no confirmado en la informacion disponible) | Misma base tecnologica; onw anade catalogo de modelos, interfaz grafica y API compatible con OpenAI |
| ONNX Runtime GenAI | CPU, GPU y aceleradores varios, incluida NPU | ONNX | No confirmado | MIT (no confirmado en la informacion disponible) | Alternativa generica de ejecucion; no especifica soporte de decodificacion especulativa en NPU en la informacion disponible |

No se dispone de datos comparativos de rendimiento entre onw y estas herramientas en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo de lenguaje: es un motor de inferencia. Las capacidades, sesgos y riesgos de alucinacion dependen enteramente del modelo que se cargue, y la model card no documenta ninguna evaluacion de calidad por modelo.
- No se han publicado benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, por lo que no es posible comparar calidad de respuesta con alternativas.
- Dependencia fuerte de hardware concreto: requiere Intel Core Ultra con NPU. En equipos AMD, Apple Silicon o Intel sin NPU solo queda la ruta de CPU, sin datos de rendimiento publicados para ese caso.
- Dependencia de version de controlador en Linux: con `linux-npu-driver` anterior a 1.38 hay un fallo confirmado en Lunar Lake que trunca las respuestas de LFM2-8B-A1B.
- Idiomas declarados limitados a japones e ingles. No se indica cobertura de castellano ni de otras lenguas, mas alla de lo que aporte el modelo subyacente.
- La comparticion de pesos NPUW esta marcada como experimental y no se aplica a los modelos MoE (LFM2 y Qwen3.6), de modo que en esos casos no se obtiene la reduccion de memoria anunciada.
- El aumento de la longitud de contexto incrementa el coste por token y la memoria, incluso en conversaciones cortas, porque se recorre la cache KV de longitud fija.
- La instalacion se realiza mediante canalizacion directa de scripts remotos a PowerShell o Bash. El autor ofrece los ficheros para su inspeccion previa, pero ejecutar codigo remoto sin revisarlo es un riesgo de seguridad en entornos corporativos.
- Exposicion en red: el CORS esta abierto por defecto y la clave de API es opcional. Publicar el servidor en una LAN sin `--api-key` deja el endpoint `/v1` accesible.
- Licencia Apache 2.0 sobre el motor, que permite uso comercial; sin embargo, las licencias de los modelos descargados son independientes y no se detallan en la informacion disponible.
- Metadatos del repositorio con fechas de creacion y actualizacion de septiembre de 2026, y referencia a modelos como Gemma 4 o Qwen3.5; conviene verificar la vigencia y procedencia de estos datos antes de tomarlos como referencia.
- La model card publicada esta truncada, por lo que faltan datos de varios modelos del catalogo y no es posible completar la comparativa.
- Repositorio con cero descargas y cero valoraciones en el momento de la consulta, lo que implica ausencia de validacion por parte de la comunidad.
- Documentacion principal en japones, con una version en ingles; no hay documentacion en castellano.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/ryugyosoft/onw
- Perfil del autor: https://huggingface.co/ryugyosoft
- Script de instalacion para Windows: https://huggingface.co/ryugyosoft/onw/resolve/main/install.ps1
- Script de instalacion para Ubuntu: https://huggingface.co/ryugyosoft/onw/resolve/main/install.sh
- Version en ingles de la model card: https://huggingface.co/ryugyosoft/onw/blob/main/README_en.md
- Modelo LFM2-8B-A1B-onw: https://huggingface.co/ryugyosoft/LFM2-8B-A1B-onw
- Modelo gemma-4-E4B-it-onw: https://huggingface.co/ryugyosoft/gemma-4-E4B-it-onw
- Modelo Qwen3.5-9B-onw: https://huggingface.co/ryugyosoft/Qwen3.5-9B-onw
- Controlador de NPU para Linux: https://github.com/intel/linux-npu-driver
- Indice de modelos de ONNX Runtime (referencia del ecosistema, no vinculado al proyecto): https://onnxruntime.ai/models
