# ryugyosoft/onwx

## Resumen

onwx es un motor de inferencia y aplicación de escritorio desarrollado por ryugyosoft que ejecuta modelos de lenguaje íntegramente sobre la NPU XDNA2 de los procesadores AMD Ryzen AI. A diferencia de otros runtimes que reparten la carga entre CPU, GPU e iGPU, onwx realiza todo el cómputo de un token —multiplicaciones matriciales, capas DeltaNet, atención y la cabeza LM— sobre la NPU, dejando a la CPU únicamente la búsqueda de vocabulario y la selección del siguiente token. El proyecto no es un modelo de pesos, sino un motor con binarios precompilados por modelo, de modo que el usuario no espera compilaciones en su equipo.

El repositorio incluye un servidor compatible con la API de OpenAI en `http://127.0.0.1:8100/v1`, una interfaz de chat en navegador y una aplicación de bandeja del sistema para descargar, cargar y cambiar modelos. La ficha del repositorio lista soporte para una familia de pesos cuantizados (ternarios de 2 bits derivados de Qwen3.8 y Qwen3.5, int4 para Qwen3.5/3.6, llm-jp y LFM2.5), con requisitos de memoria que van desde 3,3 GB hasta más de 20 GB según el modelo.

Su relevancia actual radica en que demuestra inferencia de LLM de hasta 35B parámetros (MoE con 3B activos) sobre NPU de consumo, con velocidades de generación de 6,9 a 29 tok/s y comparativas directas frente a FastFlowLM sobre hardware Ryzen AI Max+ 395 y Ryzen AI 9 HX 370. La licencia Apache 2.0 y la disponibilidad de instaladores de una línea para Windows y Ubuntu facilitan su evaluación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Motor de inferencia para NPU AMD XDNA2; soporta modelos transformer, MoE y DeltaNet (según pesos cargados) |
| Parametros totales | No disponible (depende del modelo: 4B, 8B, 9B, 27B, 24B-A2B, 35B-A3B) |
| Parametros activos | No disponible como motor; en modelos MoE soportados: 3B (Qwen3.6 35B-A3B) y 2B (LFM2.5 24B-A2B) |
| Longitud de contexto | Hasta 32K tokens medidos en benchmarks; MTP se desactiva automáticamente por encima de 24K |
| Tipos de cuantizacion | Ternaria de 2 bits (Ternary Bonsai), int4 (Qwen3.5/3.6, llm-jp) |
| Idiomas soportados | Japonés e inglés (según tags del repositorio); modelos concretos como llm-jp-4.1 8B están optimizados para japonés |
| Licencia | Apache 2.0 |
| Formato de pesos | Programas NPU precompilados por modelo; descargas en paquetes de 2,3 GB a 20,8 GB (no se especifica safetensors/GGUF) |

## Arquitectura y entrenamiento

onwx no entrena modelos: es un motor de ejecución. Su diseño desplaza toda la aritmética de un token a la NPU XDNA2, incluyendo las multiplicaciones matriciales, las capas de atención, los bloques DeltaNet cuando el modelo los usa y la cabeza de lenguaje. La CPU queda relegada a la tabla de vocabulario y a la selección del token siguiente. Los programas para NPU se generan por modelo y se distribuyen precompilados, lo que elimina la compilación en el equipo del usuario.

El motor incorpora decodificación especulativa propia (MTP, multi-token prediction) que se activa con temperatura 0 y se desactiva automáticamente cuando el contexto supera los 24K tokens. También ofrece una opción de usar la CPU para acelerar la fase de prefill (lectura de prompt), desactivada por defecto. Los modelos soportados abarcan pesos ternarios de 2 bits (Ternary Bonsai 2 y 2.5, basados en Qwen3.8-27B y Qwen3.5-9B/4B), cuantizaciones int4 de Qwen3.5 y Qwen3.6, llm-jp-4.1 8B thinking y LFM2.5 24B-A2B de Liquid AI, que el propio usuario convierte en su equipo. No se detallan en la información disponible los volúmenes de tokens de entrenamiento ni si hubo RLHF/DPO, ya que corresponden a los modelos base y no al motor.

## Capacidades

- Generación de texto y razonamiento con modelos de 4B a 35B parámetros, incluyendo variantes con modo thinking (llm-jp-4.1 8B thinking).
- Soporte de tool calling y function calling en modelos como Ternary Bonsai 2.5 27B, descrito como reforzado para codificación agéntica y llamadas a herramientas.
- Ejecución de agentes multi-paso: se documenta una prueba con Hermes Agent en tareas de corrección de bugs con 29 intercambios y contextos de 12.000 a 29.000 tokens.
- Capacidades multimodales (lectura de imágenes) en Qwen3.6 35B-A3B, Ternary Bonsai 2 9B/4B y Qwen3.5 9B/4B.
- Soporte multilingüe limitado a japonés e inglés, con especial refuerzo del japonés en llm-jp-4.1 8B.
- Servidor compatible con la API de OpenAI, lo que permite integrar el motor en aplicaciones existentes sin cambios de cliente.
- Decodificación especulativa MTP para acelerar la generación a temperatura 0.
- Gestión de modelos desde bandeja del sistema: descarga, carga, cambio y actualización con un botón.

## Casos de uso

- Asistencia de codificación agéntica en local: con Ternary Bonsai 2.5 27B o Qwen3.6 35B-A3B, el motor puede ejecutar bucles de tool calling y corrección de bugs sobre contextos de 12K a 29K tokens, como demuestra la prueba con Hermes Agent (778 s frente a 874 s de FastFlowLM).
- Chat de atención al cliente en japonés e inglés: llm-jp-4.1 8B thinking ofrece 11 tok/s y un consumo de 4,8 GB más 65 MB por cada 1K tokens de contexto, adecuado para conversaciones multi-turno en equipos con 16 GB de RAM.
- Procesamiento de documentos con imágenes: Qwen3.5 9B o Ternary Bonsai 2 9B permiten lectura de imágenes y texto en la misma sesión, con 20 tok/s y 4,1 GB de memoria, útil para extracción de datos de capturas o formularios.
- Despliegue de API local para herramientas internas: el servidor OpenAI-compatible en `127.0.0.1:8100/v1` permite conectar editores, scripts o frontends existentes sin adaptadores, con latencias de prefill de 1,8 s a 9,3 s para 1.000 tokens.
- Inferencia en portátiles Ryzen AI 300 sin GPU dedicada: modelos de 4B a 9B caben en 3,3-5,8 GB y generan entre 12 y 29 tok/s, lo que hace viable asistentes de escritura o resumen en movilidad.
- Sustitución de FastFlowLM en flujos existentes: al medirse con el mismo prompt y metodología que `flm bench`, onwx se posiciona como alternativa directa para quienes ya usan NPU AMD y buscan mayor velocidad de generación (3-4 décimas superior según el autor).
- Procesamiento por lotes de prompts largos: con la opción de CPU para prefill activada, contextos de hasta 16K se leen más rápido que con FastFlowLM, lo que sirve para análisis de documentos extensos.

## Benchmarks y rendimiento

Datos publicados por el autor, medidos en Ryzen AI Max+ 395 con NPU en modo performance, comparando con FastFlowLM 1.0.8 sobre Qwen3.5 9B y prompts de 128 a 32K tokens:

| Metrica | onwx | FastFlowLM 1.0.8 |
|---|---|---|
| Prefill 4K tokens | 7,7 s | 8,7 s |
| Prefill 32K tokens (con CPU) | 74 s | 74 s |
| Generación (tok/s) | 3-4 décimas superior en todas las longitudes | Referencia |
| Generación con MTP (hasta 8K contexto) | 14-18 tok/s | No disponible (sin MTP) |
| Tarea agéntica Hermes Agent (29 turnos) | 778 s (v0.6.1) | 874 s |
| Ryzen AI 9 HX 370, prefill 32K | 339 tok/s | 379 tok/s |
| Ryzen AI 9 HX 370, generación | 8,9 tok/s | 6,0 tok/s |

Rendimiento por modelo en Ryzen AI Max+ 395 (prefill 1K/4K, generación):

| Modelo | Prefill 1K / 4K | Generación |
|---|---|---|
| Ternary Bonsai 2.5 27B | 9,3 s / 28 s | 7,0 tok/s |
| Ternary Bonsai 2 27B | 9,3 s / 28 s | 6,9 tok/s |
| Qwen3.6 35B-A3B | 3,1 s / 9,3 s | 20 tok/s (23 con MTP) |
| Ternary Bonsai 2 9B | 2,1 s / 6,9 s | 20 tok/s |
| Ternary Bonsai 2 4B | 1,8 s / 5,8 s | 29 tok/s |
| Qwen3.5 9B | 2,5 s / 7,7 s | 12 tok/s (15 con MTP) |
| Qwen3.5 4B | 2,1 s / 6,4 s | 18 tok/s |
| llm-jp-4.1 8B thinking | 6,3 s / 13 s | 11 tok/s |
| LFM2.5 24B-A2B | 2,4 s / 8,5 s | 20 tok/s |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- NPU XDNA2 obligatoria: AMD Ryzen AI 300 (Strix Point, p. ej. Ryzen AI 9 HX 370) o Ryzen AI Max (Strix Halo, p. ej. Ryzen AI Max+ 395).
- Windows 11 con driver NPU de AMD 32.0.203 o superior; Ubuntu 26.04 con driver amdxdna y runtime XRT (pyxrt), instalable desde el PPA de Lemonade o compilando xdna-driver.
- Memoria RAM mínima de 16 GB; Ternary Bonsai 2 27B consume unos 8,8 GB más 34 MB por cada 1K tokens de contexto.
- Espacio en disco: 0,5 GB de aplicación más 2,3-20,8 GB por modelo descargado.
- VRAM dedicada: no aplica, ya que la inferencia se ejecuta sobre la NPU y memoria del sistema; no se especifican requisitos de GPU.
- No cabe en GPU de consumo convencional porque el motor depende de la NPU XDNA2; no se documenta soporte para RTX 4090, A100 ni H100.
- Despliegue: instalador PowerShell (`irm ... | iex`) o script bash para Ubuntu; servidor OpenAI-compatible integrado, interfaz de chat web y CLI (`onwx serve`, `onwx chat`). No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Throughput y latencia: ver tabla de benchmarks; generación de 6,9 a 29 tok/s según modelo, prefill de 1,8 s a 9,3 s para 1.000 tokens.

## Comparativa con modelos similares

| Aspecto | onwx | FastFlowLM 1.0.8 | onw (Intel) |
|---|---|---|---|
| Tipo | Motor de inferencia para NPU AMD XDNA2 | Motor de inferencia para NPU AMD | Motor de inferencia para NPU Intel Core Ultra |
| Modelos soportados | Ternary Bonsai, Qwen3.5/3.6, llm-jp, LFM2.5 | Qwen3.5 y otros (no detallado) | Modelos propios, incompatibles con onwx |
| Contexto medido | Hasta 32K | Hasta 32K | No disponible |
| Generación (Qwen3.5 9B) | 12 tok/s (15 con MTP) | Inferior en 3-4 décimas según el autor | No disponible |
| Tarea agéntica (29 turnos) | 778 s | 874 s | No disponible |
| Licencia | Apache 2.0 | No disponible en la información | Apache 2.0 (según enlace) |
| Disponibilidad | Hugging Face, instalación en una línea | GitHub | Hugging Face |

## Limitaciones y advertencias

- Dependencia exclusiva de NPU AMD XDNA2: no funciona en Intel, NVIDIA, Apple Silicon ni en CPU/GPU convencionales.
- Los modelos y programas NPU de onwx son incompatibles con los de su hermano onw para Intel; no se pueden intercambiar pesos.
- Idiomas limitados a japonés e inglés según los tags; el rendimiento en castellano no está documentado.
- El MTP se desactiva automáticamente por encima de 24K tokens de contexto, perdiendo la aceleración en conversaciones largas.
- La opción de usar CPU para prefill está desactivada por defecto y su beneficio se limita a contextos de hasta 16K.
- En Ryzen AI 9 HX 370 el prefill a 32K es más lento que FastFlowLM (339 frente a 379 tok/s), aunque la generación es superior.
- No se han publicado evaluaciones independientes de calidad (MMLU, HumanEval, GSM8K); los datos de rendimiento provienen del autor.
- Riesgo de alucinación y sesgos inherente a los modelos base (Qwen, llm-jp, LFM2.5), no evaluado en la información disponible.
- La licencia Apache 2.0 del repositorio cubre el motor, pero el uso comercial de cada modelo descargado depende de la licencia de sus pesos originales, no detallada aquí.
- Requiere conexión a internet para la descarga inicial de modelos y actualizaciones.
- Ubuntu se marca como experimental, con reportes de funcionamiento únicamente en 26.04.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/ryugyosoft/onwx
- Modelo Ternary Bonsai 2.5 27B: https://huggingface.co/ryugyosoft/Ternary-Bonsai-2.5-27B-onwx
- Modelo Ternary Bonsai 2 27B: https://huggingface.co/ryugyosoft/Ternary-Bonsai-2-27B-onwx
- Modelo Qwen3.6 35B-A3B: https://huggingface.co/ryugyosoft/Qwen3.6-35B-A3B-onwx
- Modelo Ternary Bonsai 2 9B: https://huggingface.co/ryugyosoft/Ternary-Bonsai-2-9B-onwx
- Modelo Ternary Bonsai 2 4B: https://huggingface.co/ryugyosoft/Ternary-Bonsai-2-4B-onwx
- Modelo Qwen3.5 9B: https://huggingface.co/ryugyosoft/Qwen3.5-9B-onwx
- Modelo Qwen3.5 4B: https://huggingface.co/ryugyosoft/Qwen3.5-4B-onwx
- Modelo llm-jp-4.1 8B thinking: https://huggingface.co/ryugyosoft/llm-jp-4.1-8b-onwx
- Modelo LFM2.5 24B-A2B: https://huggingface.co/ryugyosoft/LFM2.5-24B-A2B-onwx-kit
- Aplicación hermana para Intel: https://huggingface.co/ryugyosoft/onw
- FastFlowLM: https://github.com/FastFlowLM/FastFlowLM
- Driver xdna de AMD: https://github.com/amd/xdna-driver
- PPA de Lemonade para Ubuntu: https://launchpad.net/~lemonade-team/+archive/ubuntu/stable
- Instalador Windows: https://huggingface.co/ryugyosoft/onwx/resolve/main/install.ps1
- Instalador Ubuntu: https://huggingface.co/ryugyosoft/onwx/resolve/main/install.sh
