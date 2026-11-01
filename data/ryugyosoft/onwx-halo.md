# ryugyosoft/onwx-halo

## Resumen

onwx-halo es una aplicación de escritorio para Windows 11 que permite ejecutar modelos de lenguaje de gran tamano en formato GGUF sobre equipos con AMD Ryzen AI Max (arquitectura Strix Halo, con GPU integrada Radeon 8060S/8050S y NPU XDNA2). No se trata de un modelo de lenguaje en sí, sino de un runtime de inferencia: descarga los pesos desde los repositorios de sus autores originales (Qwen, NVIDIA, PrismML) y los ejecuta localmente sin redistribuirlos. El motor es una variante de gufo (MIT) que integra los runtimes HIP, rocBLAS y hipBLASLt de AMD TheRock compilados para gfx1151.

El proyecto lo mantiene el usuario ryugyosoft y se publica bajo licencia Apache-2.0. Su relevancia radica en que demuestra inferencia práctica de modelos de 27B a 74B de parámetros en hardware de consumo sin GPU discreta, repartiendo el trabajo entre la GPU integrada (generación de tokens) y la NPU (precarga del prompt). Incluye un servidor compatible con la API de OpenAI en el puerto 8110, gestión de modelos desde la bandeja del sistema y decodificación especulativa con modelos draft.

El repositorio tiene un tamano de 0,4 GB (solo la aplicación y sus binarios, no los pesos) y está marcado como privado en la model card. El autor ha anunciado su sustitución por onwx-dash (ryugyosoft/onwx-dash), que amplía el soporte a Ryzen AI 300 y Radeon 890M; onwx-halo queda congelado en la versión 0.6.1 y migra ajustes y modelos descargados en el primer arranque de la nueva aplicación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Runtime de inferencia (no es un modelo); motor derivado de gufo con HIP/rocBLAS/hipBLASLt de AMD TheRock para gfx1151 |
| Parametros totales | No aplica (ejecuta modelos de 27B, 35B-A3B, 74B-A9B y 27B ternario) |
| Parametros activos | No aplica al runtime; los modelos soportados incluyen MoE con 3B y 9B activos |
| Longitud de contexto | Configurable por el usuario; probado hasta 32K tokens en las mediciones de memoria |
| Tipos de cuantizacion | GGUF: Q4_K_XL (UD), Q4_K_M, PQ2_0 (ternario -1/0/+1); KV cache opcional en 8 bits |
| Idiomas soportados | No disponible (depende del modelo cargado; la interfaz de la aplicación está en japones) |
| Licencia | Apache-2.0 (aplicación); motor gufo bajo MIT; runtimes ROCm bajo sus licencias respectivas |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

onwx-halo no entrena ningún modelo: es una capa de ejecución. El motor, denominado internamente onwx-halo engine (`onwx/bin/halo/onwx_halo.dll`), parte de gufo (MIT) y enlaza los runtimes HIP, rocBLAS y hipBLASLt de AMD TheRock en su build para Windows y para la arquitectura gfx1151 de Strix Halo. El tokenizador y la plantilla de chat se construyen a partir de los metadatos embebidos en el propio GGUF, con verificación de que la secuencia de tokens coincide con la de llama.cpp.

La innovación técnica principal es la orquestación heterogénea GPU + NPU: la Radeon integrada genera los tokens y la NPU XDNA2 colabora en la fase de precarga del prompt (prefill), activable o desactivable desde ajustes y aplicable al recargar el modelo. Sobre esa base se anaden dos mecanismos de aceleración. El primero es la decodificación especulativa con modelos draft: para Qwen3.8 27B y Ternary Bonsai 2 27B se usa DFlash2 (z-lab) y para Nemotron 3.5 Bolt se usa el draft LiLiCorr de NVIDIA, con retroceso automático a generación normal cuando la tasa de acierto baja y sin alterar la distribución de probabilidad del muestreo. El segundo es la gestión dinámica de la caché KV, que se reserva a medida que crece la conversación y puede comprimirse a 8 bits (aproximadamente la mitad de memoria; unos 1 GB menos en una conversación de 32K tokens con un modelo de 27B).

## Capacidades

- Ejecución local de LLM en formato GGUF sobre GPU integrada Radeon 8060S/8050S con apoyo de NPU XDNA2 en el prefill.
- Servidor compatible con la API de OpenAI en `http://localhost:8110/v1`, con listado de modelos en `/v1/models` que incluye `context_length` y `max_output_tokens`.
- Cambio de modelo en caliente vía API: al enviar un `model` distinto en la petición, cierra el actual y carga el nuevo en 10-20 segundos.
- Decodificación especulativa con draft models (DFlash2 para Qwen3.8 27B y Ternary Bonsai 2 27B; LiLiCorr para Nemotron 3.5 Bolt), desactivable con la variable de entorno `ONWX_HALO_DRAFT=0`.
- Interfaz de chat web en `http://localhost:8110/chat` y gestión de modelos desde la bandeja del sistema.
- Soporte de caché KV en 8 bits para reducir el consumo de memoria en contextos largos.
- Registro de carpetas locales con GGUF ya descargados mediante la opción "otra ubicación" → "anadir".
- Coexistencia con la aplicación onwx (NPU): rutas, configuración, entrada de menú de inicio y puerto de API independientes.
- Capacidades del modelo (razonamiento, código, matemáticas, tool calling, multilingüismo) heredadas del GGUF cargado; el runtime no las anade ni las restringe.

## Casos de uso

- Asistente de código en local sobre portátil o mini-PC con Strix Halo: con Qwen3.8 27B y el draft DFlash2 se alcanzan 34-36 tok/s en generación de código, suficiente para autocompletado interactivo y refactorizaciones sin enviar el código a la nube.
- Procesamiento de documentos largos con contexto de 32K tokens: la precarga de 590-3.000 tok/s según modelo permite ingerir contratos, informes o transcripciones y hacer preguntas sobre ellos manteniendo la caché KV comprimida a 8 bits.
- Despliegue de una API compatible con OpenAI en una red local: el endpoint `/v1` en el puerto 8110 permite conectar clientes existentes (SDK de OpenAI, LangChain, Continue) sin modificar código, con cambio de modelo por petición.
- Razonamiento y resumen con modelos MoE grandes: Nemotron 3.5 Bolt 74B-A9B con draft LiLiCorr alcanza 55-89 tok/s en tareas de pensamiento y resumen, adecuado para pipelines de análisis por lotes en equipos con 64 GB de RAM.
- Escenarios con memoria limitada: Ternary Bonsai 2 27B ocupa 7,2 GB de pesos y unos 14-15 GB en uso con contexto de 32K, lo que permite ejecutar un modelo de 27B en equipos de 32 GB de RAM.
- Laboratorio de evaluación de modelos: la posibilidad de registrar GGUF ya presentes en disco y alternar entre ellos por API facilita comparar respuestas de varios modelos sobre el mismo conjunto de prompts.
- Prototipado de agentes con tool calling: al exponer una API compatible, se pueden conectar frameworks de agentes que ejecuten llamadas a funciones contra el servidor local, manteniendo los datos en el equipo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K) en la información disponible. El autor sí publica mediciones de velocidad en un Ryzen AI Max+ 395 con 128 GB de RAM, con prompts de varios miles de tokens:

| Modelo | Pesos | Precarga (tok/s) | Generación (tok/s) | Con draft (tok/s) |
|---|---|---|---|---|
| Qwen3.6 35B-A3B (Q4_K_XL, MTP) | 22,9 GB | 2.200-3.000 | 57 | 84-93 (razonamiento/resumen); 62-69 (narrativa) |
| Qwen3.8 27B (Q4_K_XL + DFlash2) | 17,6 GB + 1,1 GB | 590-720 | 11 | 34-36 (código); ~20 (explicaciones) |
| Nemotron 3.5 Bolt 74B-A9B (24GB + LiLiCorr) | 22,0 GB + 0,95 GB | 1.000-1.160 | 35 | 55-89 (razonamiento/resumen); 30-35 (narrativa) |
| Ternary Bonsai 2 27B (PQ2_0 + DFlash2) | 7,2 GB + 1,1 GB | 520-640 | 25 | 31-33 (código) |

Consumo de memoria con NPU y draft activos, hasta 32K tokens de contexto: Qwen3.6 unos 24-25 GB; Nemotron unos 24-25 GB; Qwen3.8 27B unos 21-23 GB; Ternary Bonsai 2 27B unos 14-15 GB.

## Requisitos de hardware

- Equipo con AMD Ryzen AI Max (Strix Halo) y GPU integrada Radeon 8060S o 8050S; no soporta GPU discretas ni otras plataformas.
- Memoria: 64 GB de RAM recomendados; Ternary Bonsai 2 27B funciona con 32 GB. La GPU solo puede usar la memoria dedicada asignada en BIOS o AMD Software más la mitad del resto.
- Sistema operativo Windows 11 con controlador gráfico de AMD y controlador NPU (Ryzen AI Software).
- Python 3.10 o superior (el instalador puede instalarlo vía winget).
- Disco: unos 0,3 GB para la aplicación y unos 22 GB por modelo.
- Despliegue: instalador PowerShell (`install.ps1`) o `setup.bat` manual; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, ya que el motor es propio (derivado de gufo).
- Latencia y throughput: los indicados en la tabla de benchmarks; la carga de un modelo nuevo vía API tarda 10-20 segundos.

## Comparativa con modelos similares

No disponible. onwx-halo es un runtime específico para Strix Halo y la información proporcionada no incluye comparaciones con otras aplicaciones de inferencia local (Ollama, LM Studio, llama.cpp) ni con runtimes para NPU de otras plataformas.

## Limitaciones y advertencias

- El repositorio está marcado como privado y su instalación requiere autenticación previa con `hf auth login` y un token de Hugging Face.
- El proyecto está descontinuado: queda congelado en la versión 0.6.1 y el autor redirige a onwx-dash, con migración automática de ajustes y modelos en el primer arranque.
- Dependencia estricta de hardware: solo Ryzen AI Max (Strix Halo) con gfx1151; los binarios ROCm incluidos están compilados únicamente para esa arquitectura.
- La interfaz y la documentación están en japones; no se declaran idiomas soportados para el modelo, que dependen del GGUF cargado.
- La licencia Apache-2.0 cubre la aplicación, pero el uso de cada modelo queda sujeto a su licencia propia: Apache-2.0 para Qwen y Ternary Bonsai, y licencia de NVIDIA para Nemotron 3.5 Bolt; conviene revisarla antes de un uso comercial.
- Riesgo de alucinación y sesgos inherentes a los modelos ejecutados; el runtime no aplica filtros ni salvaguardas adicionales.
- El rendimiento medido corresponde a un Ryzen AI Max+ 395 con 128 GB; en configuraciones con menos memoria o distinta asignación de VRAM en BIOS las cifras pueden degradarse notablemente.
- La decodificación especulativa solo acelera textos predecibles y retrocede a generación normal en el resto, por lo que la ganancia no es uniforme.
- PowerShell 5.1 no admite rutas de más de 260 caracteres; si se instala en rutas largas hay que definir `ONWX_HALO_DIR`.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/ryugyosoft/onwx-halo
- Aplicación sucesora: https://huggingface.co/ryugyosoft/onwx-dash
- Aplicación onwx para NPU: https://huggingface.co/ryugyosoft/onwx
- Qwen3.6 35B-A3B MTP GGUF (unsloth): https://huggingface.co/unsloth/Qwen3.6-35B-A3B-MTP-GGUF
- Qwen3.8 27B GGUF (unsloth): https://huggingface.co/unsloth/Qwen3.8-27B-GGUF
- Draft DFlash2 para Qwen3.8 27B (z-lab): https://huggingface.co/z-lab/Qwen3.8-27B-DFlash2-GGUF
- NVIDIA Nemotron 3.5 Bolt 74B-A9B 24GB GGUF: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Bolt-74B-A9B-24GB-GGUF
- Draft LiLiCorr para Nemotron 3.5 Bolt: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Bolt-74B-A9B-24GB-LiLiCorr-GGUF
- Ternary Bonsai 2 27B GGUF (prism-ml): https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-gguf
