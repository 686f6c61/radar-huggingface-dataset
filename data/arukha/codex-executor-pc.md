# Arukha/codex-executor-pc

## Resumen

La ficha solicitada corresponde al identificador `Arukha/codex-executor-pc`, alojado en Hugging Face. Tras revisar la informacion disponible, no se trata de un modelo de inteligencia artificial ni de un artefacto de aprendizaje automatico: no hay pesos, no hay arquitectura de red neuronal, no hay tokenizador y no se declara ningun pipeline de inferencia. El repositorio contiene una model card que, en realidad, es una pagina de distribucion de un ejecutable para Windows orientado a la ejecucion de scripts en Roblox (un "executor" de Luau), con instrucciones de descarga, contrasena de descompresion y requisitos de sistema.

El contenido describe un binario `codex-executor-pc-v1.2.0-win64.exe` empaquetado en un ZIP de 8,9 MB, con supuestas capacidades de compatibilidad sUNC, attach multi-instancia, auto-ejecucion de scripts y un editor basado en Monaco. Ninguno de estos elementos constituye un modelo generativo: son funciones de una aplicacion de escritorio. Por tanto, los campos habituales de una ficha de modelo (parametros, contexto, cuantizacion, benchmarks, VRAM) no son aplicables y se indican como no disponibles.

La relevancia de esta ficha es, por tanto, fundamentalmente critica: sirve para documentar que el artefacto no es un modelo y para advertir de los riesgos asociados a la distribucion de ejecutables de este tipo, incluyendo la peticion de desactivar o ignorar alertas de Windows Defender/SmartScreen y la ejecucion como administrador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; es una aplicacion de escritorio para Windows x64) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (segun metadatos del repositorio) |
| Licencia | MIT |
| Formato de pesos | no disponible (el artefacto distribuido es un ZIP con un `.exe` para Windows) |

## Arquitectura y entrenamiento

No existe arquitectura de modelo ni proceso de entrenamiento. El artefacto es un ejecutable nativo para Windows 10 (22H2) y Windows 11 (24H2), de 64 bits, empaquetado en un archivo `codex-executor-pc-v1.2.0-win64.zip` de 8,9 MB y protegido con contrasena `2026`. La model card menciona un "Luau VM bridge", un editor Monaco, hilos de trabajo (11 y 12 worker threads en distintas funciones) y un consumo declarado inferior a 21 MB y 55 MB de RAM en determinadas operaciones.

No se documenta ningun dataset, ningun proceso de RLHF/DPO, ninguna innovacion de atencion ni tecnica de decodificacion. La unica "innovacion" declarada es la compatibilidad con APIs de ejecucion de scripts de Roblox (`hookmetamethod`, `getgc`, `Drawing API`) y la capacidad de adjuntarse a multiples instancias del cliente.

## Capacidades

- No es un modelo de lenguaje: no genera texto, no razona, no resuelve matematicas ni produce codigo de forma autonoma.
- Ejecucion de scripts Luau en el contexto de Roblox, segun la descripcion del autor.
- Compatibilidad declarada con sUNC superior al 98 % (con 97,5 % de consistencia segun la propia model card).
- Attach multi-instancia a varios clientes simultaneamente.
- Auto-ejecucion de scripts desde un directorio configurado.
- Hub de scripts integrado con ejecucion de presets en la nube.
- Editor Monaco con resaltado de sintaxis multi-pestana y consola de trazas.
- No se declara soporte de tool calling, function calling, agentes ni razonamiento multi-paso en el sentido de los modelos de IA.

## Casos de uso

- Documentacion critica de artefactos sospechosos: usar esta ficha para identificar que `Arukha/codex-executor-pc` no es un modelo y evitar incluirlo en catalogos de modelos o pipelines de evaluacion.
- Auditoria de cadena de suministro: revisar el ZIP y el ejecutable en un entorno aislado antes de cualquier analisis, dado que la model card pide ejecutar como administrador e ignorar alertas de SmartScreen.
- Formacion en seguridad: emplear el caso como ejemplo de model card que simula ser un repositorio de modelo pero distribuye un binario con contrasena de descompresion.
- Analisis de metadatos de Hugging Face: estudiar como las etiquetas (`windows`, `portable`, `x64`) y los idiomas declarados pueden no corresponder a un modelo de IA.
- Respuesta a incidentes: si un equipo ha descargado el artefacto, usar la ficha para localizar el nombre del binario, el ZIP y la contrasena declarada, y proceder a su cuarentena.
- Politica de licencias: comprobar que la licencia MIT declarada no implica ninguna garantia sobre el binario distribuido ni sobre su origen.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Los unicos datos numericos de la model card son de caracter operativo (8,9 MB de tamano, 199K descargas declaradas, menos de 21 MB y 55 MB de RAM, menos de 7 ms de respuesta, 11 y 12 worker threads, 98 %+ de compatibilidad sUNC), no resultados de evaluacion de un modelo de IA.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; no es un modelo de IA.
- GPU recomendadas: no aplica.
- Cabe en GPU de consumo: no aplica.
- Sistema operativo declarado: Windows 10 (22H2) y Windows 11 (24H2), 64 bits.
- Almacenamiento: ZIP de 8,9 MB; el espacio descomprimido no se detalla.
- Memoria RAM declarada: inferior a 21 MB en multi-instancia y inferior a 55 MB en auto-ejecucion, segun el autor.
- Opciones de despliegue: no aplica (no hay vLLM, llama.cpp, Ollama ni TGI); el autor indica ejecutar el `.exe` como administrador.
- Latencia y throughput: no disponibles; solo se declara una respuesta inferior a 7 ms para el hub de scripts.

## Comparativa con modelos similares

No disponible. No existen modelos de IA comparables porque el artefacto no es un modelo. Como referencia de categoria, se compara con otros tipos de artefacto alojados en Hugging Face:

| Artefacto | Tipo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| `Arukha/codex-executor-pc` | Ejecutable Windows (ZIP + `.exe`) | no aplica | no aplica | MIT | Model card con instrucciones de descarga y contrasena |
| Modelo de lenguaje tipico (p. ej. familia Llama, Qwen, Mistral) | Modelo transformer | 1B-70B+ | 4K-128K+ | variable | Pesos safetensors/GGUF, benchmarks publicados |
| Modelo de codigo tipico (p. ej. CodeLlama, DeepSeek-Coder) | Modelo transformer | 1B-33B+ | 4K-16K+ | variable | Evaluado en HumanEval, MBPP |

## Limitaciones y advertencias

- No es un modelo de IA: no debe registrarse en pipelines de inferencia, evaluaciones de benchmarks ni comparativas de LLM.
- La model card pide ejecutar el binario como administrador e ignorar advertencias de Windows Defender o SmartScreen, lo que constituye una senal de riesgo elevado.
- El ZIP esta protegido con contrasena (`2026`), practica que dificulta el analisis automatico por parte de antivirus y sistemas de inspeccion.
- El binario se distribuye desde un repositorio de GitHub de terceros (`doughslip/codex-executor-pc`), no desde el propio repositorio de Hugging Face; no hay verificacion de integridad ni firmas publicadas.
- La licencia MIT se declara en los metadatos, pero no se acompana de codigo fuente ni de aviso de copyright verificable en la informacion disponible.
- Los datos de descargas (199K+) y de rendimiento (98 %+ sUNC, <7 ms) son afirmaciones del autor sin verificacion independiente.
- Uso en produccion: desaconsejado sin auditoria previa en sandbox; el artefacto no aporta garantias de seguridad, soporte ni mantenimiento.
- Posible confusion con modelos reales de la familia "Codex" de OpenAI: el nombre puede inducir a error en busquedas y catalogos.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Arukha/codex-executor-pc
- Repositorio GitHub referenciado por el autor: https://github.com/doughslip/codex-executor-pc
- Release indicada por el autor: https://github.com/doughslip/codex-executor-pc/releases/latest
- Paquete directo citado en la model card: https://github.com/doughslip/codex-executor-pc/releases/latest/download/codex-executor-pc-v1.2.0-win64.zip
