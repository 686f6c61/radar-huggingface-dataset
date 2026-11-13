# infosave/Edge0-120B-cmf

## Resumen

Edge0-120B-cmf es la distribución en formato CMF (un contenedor único de pesos optimizado para el motor de inferencia `cortiq`) del modelo Edge0-120B-NVFP4, desarrollado por el usuario infosave a partir del modelo base de Edge0. Se trata de un modelo de mezcla de expertos latente (latent MoE) construido sobre Qwen3.8-Flash-Next, con 512 expertos por capa que operan en 1280 dimensiones y pesos NVFP4 de 4 bits copiados bit a bit del modelo original. El paquete completo ocupa 95,6 GB en un solo fichero.

La relevancia de esta ficha es doble: por un lado documenta un modelo de gran tamaño (120B parámetros nominales) orientado a generación de código y razonamiento; por otro, introduce el ecosistema CMF/cortiq, un motor de inferencia escrito en Rust con backends CUDA y Vulkan, decodificación especulativa (MTP) y un esquema de offload de expertos a RAM que permite ejecutar el modelo en tarjetas desde 12 GB. El modelo declara soporte para inglés, ruso y chino.

Los datos disponibles son escasos y provienen casi exclusivamente de la model card del autor: no hay información publicada sobre composición del dataset de entrenamiento, número de tokens, proceso de alineación ni resultados de benchmarks más allá de HumanEval. Esta ficha refleja esa limitación de forma explícita.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos latente (latent MoE); 512 expertos por capa a 1280 dimensiones |
| Parametros totales | 120B (nominal, segun nombre del modelo); no disponible el desglose exacto |
| Parametros activos | no disponible |
| Longitud de contexto | 32 768 tokens por defecto (`CMF_MAX_SEQ`); entrenado sobre Qwen3.8-Flash-Next, contexto nativo no disponible |
| Tipos de cuantizacion | NVFP4 (4 bits, pesos copiados bit a bit del modelo base); no se documentan otras cuantizaciones |
| Idiomas soportados | Ingles (en), ruso (ru), chino (zh) |
| Licencia | edge0-community-model-1.0 (licencia "other", fichero LICENSE en el repo) |
| Formato de pesos | CMF (contenedor propio del motor cortiq); incluye fichero `.sha256` y perfil de routing `.profile` |

## Arquitectura y entrenamiento

El modelo es un transformer con mezcla de expertos en configuración latente: cada capa contiene 512 expertos que trabajan en un espacio de 1280 dimensiones. Los pesos NVFP4 (formato de coma flotante de 4 bits de NVIDIA) se heredan sin recuantizar del modelo Edge0-120B-NVFP4, que a su vez se construye sobre Qwen3.8-Flash-Next. La distribución CMF no modifica los pesos: es un reempaquetado para el motor cortiq, que incluye un perfil de routing (`edge0-120b.profile`) para gestionar la selección de expertos y una tabla n-gram de 52 GB fijada en RAM que habilita la decodificación especulativa mediante tokens borrador (MTP).

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF, DPO u otro tipo de alineación. La innovación técnica documentada es de despliegue, no de entrenamiento: el motor cortiq decide en el arranque cuánta memoria libre hay en la GPU y coloca automáticamente la parte correspondiente del modelo, dejando el resto de expertos en RAM (requiere 96 GB de RAM del sistema). El modo de decodificación especulativa (MTP) está activado por defecto y puede desactivarse con `CMF_QWEN_MTP=0`.

## Capacidades

- Generación de texto y código: el modelo está orientado explícitamente a tareas de programación, con un resultado declarado de HumanEval pass@1 del 93,3 % (164 tareas, sin modo thinking).
- Razonamiento con modo thinking: la API acepta el parámetro `enable_thinking` para activar o desactivar la cadena de razonamiento.
- Servidor compatible con la API de OpenAI: expone `/v1/models`, `/v1/chat/completions` y una página de chat en la raíz, lo que permite conectar editores y agentes que hablen el protocolo OpenAI.
- Decodificación especulativa (MTP): tokens borrador que aceleran la generación, activados por defecto.
- Multilingüe limitado: inglés, ruso y chino declarados; no se documentan otros idiomas.
- No se documenta soporte de tool calling, function calling, visión, audio ni razonamiento multi-paso con agentes más allá de lo que permita la API compatible con OpenAI.

## Casos de uso

- Generación de código en producción: con HumanEval pass@1 del 93,3 % y un servidor compatible con OpenAI, puede integrarse en pipelines de CI/CD o en asistentes de editor (VS Code, Neovim) apuntando a `http://127.0.0.1:8080/v1`; el rendimiento de 149–178 tok/s en CUDA sobre RTX PRO 6000 lo hace viable para completado interactivo.
- Autocompletado y refactorización en IDE: la baja latencia por token y el modo thinking desactivable permiten respuestas rápidas en tareas de completado, reservando el modo thinking para refactorizaciones complejas.
- Procesamiento de repositorios con contexto largo: la ventana por defecto de 32 768 tokens y una lectura de prompt de 4 797–5 924 tok/s (CUDA) permiten analizar ficheros completos o varios módulos en una sola petición.
- Despliegue en estaciones de trabajo con GPU de consumo: gracias al offload parcial de expertos a RAM, el modelo puede ejecutarse en tarjetas desde 12 GB (con 96 GB de RAM de sistema), lo que habilita entornos de desarrollo locales sin clúster.
- Despliegue en hardware no NVIDIA: el backend Vulkan (108–122 tok/s en generación de código, 721–725 tok/s en lectura de prompt) permite usar el modelo en GPUs AMD o Intel con driver Vulkan, a costa de menor throughput.
- Asistencia técnica en ruso y chino: al declarar soporte de estos idiomas, puede emplearse en atención al cliente o generación de documentación técnica para esos mercados, aunque no hay evaluación publicada de calidad por idioma.
- Experimentación e investigación sobre MoE latente: el formato CMF y el perfil de routing permiten estudiar el comportamiento de los 512 expertos por capa y la decodificación especulativa en un motor open source.

## Benchmarks y rendimiento

| Benchmark | Resultado | Condiciones |
|---|---|---|
| HumanEval pass@1 | 93,3 % | 164 tareas, thinking off |

Rendimiento de inferencia declarado (RTX PRO 6000 96 GB, un stream, greedy, thinking off, MTP activado, media de dos ejecuciones):

| Backend | Lectura de prompt (tok/s) | Generación de código (tok/s) |
|---|---:|---:|
| CUDA, prompt 1K | 4 208 | 188 |
| CUDA, prompt 4K | 5 924 | 178 |
| CUDA, prompt 16K | 5 264 | 174 |
| CUDA, prompt 32K | 4 797 | no disponible en el extracto |
| Vulkan | 721–725 | 108–122 |
| CUDA en tarjeta de 24 GB | 2 394–2 823 | 100–118 |

No se han publicado resultados de MMLU, GSM8K ni otros benchmarks en la información disponible.

## Requisitos de hardware

- VRAM: el modelo completo en GPU ocupa 46,3 GB en uso con contexto de 32K sobre una tarjeta de 96 GB. En tarjetas de 24 GB funciona con offload parcial de expertos a RAM.
- RAM del sistema: 96 GB obligatorios (la tabla n-gram de 52 GB se fija en RAM).
- Disco: 96 GB para el fichero CMF, checksum y perfil de routing.
- GPU recomendadas: NVIDIA RTX PRO 6000 96 GB para el modelo completo en CUDA; tarjetas NVIDIA desde 12 GB con offload; cualquier GPU con driver Vulkan desde 64 GB para el modelo completo o desde 24 GB con offload.
- CPU: x86-64 con 8 hilos o más; sistema operativo Linux.
- Software: cortiq 0.8.95 o superior; para CUDA, compilación con `--features cuda` y bibliotecas `libnvrtc` y `libcublas` de CUDA 12.8+ en `LD_LIBRARY_PATH`; driver NVIDIA 570 o posterior. Los binarios precompilados no incluyen CUDA.
- Despliegue: exclusivamente mediante el servidor `cortiq serve` (API compatible con OpenAI). No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Throughput y latencia: ver tabla de benchmarks; el arranque inicial tarda un minuto o más por la lectura del fichero y la carga en GPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato / motor | Notas |
|---|---|---|---|---|---|
| Edge0-120B-cmf | 120B (MoE latente, 512 expertos/capa) | 32 768 por defecto | edge0-community-model-1.0 | CMF / cortiq | HumanEval 93,3 %; offload a RAM; CUDA y Vulkan |
| Edge0-145B-cmf | 145B (mismo linaje) | no disponible | no disponible | CMF / cortiq | Versión mayor del mismo autor, mismo setup |
| Edge0-120B-NVFP4 | 120B | no disponible | no disponible | NVFP4 (modelo base) | Modelo original del que se copian los pesos |
| Qwen3.8-Flash-Next | no disponible | no disponible | no disponible | no disponible | Modelo base sobre el que se construye Edge0 |

No se dispone de datos de benchmarks comparativos con modelos de la misma categoría (por ejemplo, otros MoE de 100B+ orientados a código) en la información proporcionada.

## Limitaciones y advertencias

- Información de entrenamiento inexistente: no se documentan dataset, número de tokens, proceso de alineación ni evaluación de sesgos; no es posible evaluar riesgos de sesgo con datos.
- Riesgo de alucinación no cuantificado: no hay benchmarks de veracidad ni de tasa de alucinación publicados.
- Cobertura lingüística limitada: solo inglés, ruso y chino declarados; el rendimiento en castellano no está evaluado ni garantizado.
- Contexto por defecto de 32 768 tokens: aunque ajustable con `CMF_MAX_SEQ`, no se documenta la longitud nativa de entrenamiento, por lo que ampliarlo más allá puede degradar la calidad.
- Licencia restrictiva y poco habitual: `edge0-community-model-1.0` con etiqueta "other"; es imprescindible revisar el fichero LICENSE antes de cualquier uso comercial, ya que no se detallan aquí sus términos.
- Dependencia de un motor propietario del ecosistema: el formato CMF solo es utilizable con cortiq; no hay conversión documentada a GGUF, safetensors ni otros formatos, lo que limita la portabilidad.
- Requisitos de infraestructura elevados: 96 GB de RAM y 96 GB de disco incluso en configuraciones con offload; no es desplegable en entornos modestos.
- Madurez del proyecto: el repositorio tiene 0 descargas y 1 like en el momento de la consulta, y la versión de cortiq requerida (0.8.95+) es reciente; la estabilidad en producción no está contrastada.
- Sin soporte documentado de tool calling ni agentes: aunque la API sea compatible con OpenAI, no se especifica el comportamiento en function calling, lo que exige validación propia antes de usarlo en pipelines de agentes.
- Solo Linux y x86-64: no hay soporte declarado para Windows, macOS ni ARM.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/infosave/Edge0-120B-cmf
- Modelo base: https://huggingface.co/Edge0/Edge0-120B-NVFP4
- Modelo base de Qwen: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Repositorio del motor CMF/cortiq: https://github.com/infosave2007/cmf
- Binarios precompilados de cortiq: https://github.com/infosave2007/cmf/releases
- Versión mayor del mismo autor: https://huggingface.co/infosave/Edge0-145B-cmf
