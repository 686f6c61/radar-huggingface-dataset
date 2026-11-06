# avgrocketman/llamacpp-dory-t4

## Resumen

`avgrocketman/llamacpp-dory-t4` no es un modelo de lenguaje, sino un artefacto de compilación binaria de llama.cpp para GPU NVIDIA Tesla T4 (arquitectura `sm_75`, `compute_75`). El repositorio contiene un archivo comprimido (`llama-dory-t4-cuda.tar.gz`) con el binario `llama-server`, las bibliotecas compartidas `libllama*` y `libggml*`, y un fichero `BUILD-INFO.txt`. No incluye pesos de ningún modelo: es exclusivamente infraestructura de inferencia precompilada.

El propósito declarado por el autor es evitar recompilar llama.cpp en cada instancia nueva de Google Colab con GPU T4, dentro del contexto `sahil/colab-2026-11-03`, que aloja dos "model homes": `models/XHToken/Spark-X2.6-4B` y `models/NVIDIA/Dory1.0-4B`. El binario se construye a partir de un fork concreto (`brianchmielNV/llama.cpp`, revisión `98a74c97ea09ac72f6ceda1559808fc0a2f447ce`, asociada al PR #30306) con CUDA 13.0.

Es relevante únicamente para desarrolladores que necesiten ejecutar inferencia GGUF sobre Tesla T4 en entornos efímeros (Colab, contenedores CI) sin pagar el coste de compilación desde fuente. El repositorio tiene 0 descargas, 0 likes y un tamaño de 0.0 GB, lo que sugiere que el artefacto no está subido o es de tamaño despreciable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (artefacto binario de llama.cpp, no un modelo neuronal) |
| Parametros totales | no disponible (el repositorio no contiene pesos) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (depende del modelo GGUF que se cargue en `llama-server`) |
| Tipos de cuantizacion | no disponible (soporta los que implemente la revisión de llama.cpp compilada; no especificado) |
| Idiomas soportados | no disponible (depende del modelo cargado) |
| Licencia | MIT (llama.cpp upstream); ver repositorio de origen |
| Formato de pesos | ninguno incluido; el binario consume GGUF en tiempo de ejecución |

Otros datos técnicos del artefacto:

| Parametro | Valor |
|---|---|
| Fuente de compilacion | `https://github.com/brianchmielNV/llama.cpp` |
| Revision | `98a74c97ea09ac72f6ceda1559808fc0a2f447ce` (PR #30306) |
| Version CUDA | 13.0 (imagen Colab T4) |
| Arquitectura CUDA objetivo | `compute_75` / `sm_75` unicamente |
| Flags CMake | `-DGGML_CUDA=ON -DCMAKE_CUDA_ARCHITECTURES=75 -DLLAMA_BUILD_SERVER=ON -DLLAMA_BUILD_TESTS=OFF -DLLAMA_BUILD_EXAMPLES=OFF -DLLAMA_BUILD_APP=OFF -DLLAMA_BUILD_UI=OFF -DLLAMA_USE_PREBUILT_UI=OFF -DGGML_NATIVE=OFF` |
| Fichero entregable | `llama-dory-t4-cuda.tar.gz` |
| Integridad | SHA-256 en `manifest.json` dentro de la carpeta `cache/` de cada modelo |
| Contenido del archivo | `llama-server`, `libllama*`, `libggml*`, `BUILD-INFO.txt` |
| Contenido ausente | pesos de modelo |

## Arquitectura y entrenamiento

No aplica: el repositorio no contiene un modelo entrenado ni datos de entrenamiento. Se trata de un binario compilado de llama.cpp, el motor de inferencia GGUF de código abierto. La compilación se realizó con `GGML_CUDA=ON` y `CMAKE_CUDA_ARCHITECTURES=75`, lo que genera código SASS/PTX exclusivamente para la microarquitectura Turing de la Tesla T4. El flag `GGML_NATIVE=OFF` evita optimizaciones específicas de la CPU anfitriona, lo que favorece la portabilidad entre máquinas virtuales Colab.

La innovación técnica relevante es la fijación de una revisión concreta del fork (`98a74c97`, PR #30306) y la inclusión de `BUILD-INFO.txt` y hashes SHA-256 en `manifest.json`, lo que permite reproducibilidad y verificación de integridad en pipelines de CI. No hay información sobre RLHF, DPO, decodificación especulativa ni atención lineal, porque no es un modelo.

## Capacidades

- Servir modelos GGUF mediante `llama-server` (API HTTP compatible con el servidor de llama.cpp).
- Ejecutar inferencia acelerada por CUDA en GPU Tesla T4 (`sm_75`).
- Cargar y servir los dos modelos referenciados en el contexto del autor: `XHToken/Spark-X2.6-4B` y `NVIDIA/Dory1.0-4B`.
- Verificación de integridad mediante SHA-256 declarado en `manifest.json`.
- Despliegue reproducible en instancias efímeras de Google Colab sin recompilar desde fuente.
- No incluye tool calling, agentes, visión, audio ni capacidades multilingües propias; todas dependen del modelo GGUF cargado en tiempo de ejecución.

## Casos de uso

- Arranque rápido en Google Colab: descomprimir el tar.gz en la VM T4 y lanzar `llama-server` sin ejecutar `cmake` ni `ninja`, reduciendo el tiempo de inicio de minutos a segundos.
- CI/CD para evaluación de modelos GGUF: integrar el binario en un job que descargue un GGUF, levante el servidor y ejecute un conjunto de prompts de regresión contra la API HTTP.
- Reproducibilidad de experimentos: fijar la revisión `98a74c97` y verificar el SHA-256 del archivo antes de ejecutar, garantizando que la inferencia se realiza con el mismo binario entre ejecuciones.
- Servicio de inferencia ligero en infraestructura T4: desplegar `llama-server` en instancias con Tesla T4 (por ejemplo, nodos de cloud con esa GPU) para servir un GGUF 4B con presupuesto de VRAM reducido.
- Entornos air-gapped o de coste controlado: transportar el tar.gz a una máquina sin acceso a GitHub ni a compiladores CUDA, y ejecutar la inferencia sin dependencias de build.
- Docencia y talleres: distribuir un binario listo para usar a alumnos con T4, evitando que cada participante tenga que compilar llama.cpp con CUDA 13.0.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- GPU: exclusivamente NVIDIA Tesla T4 (`compute_75` / `sm_75`). El binario no funcionará en arquitecturas distintas (Ampere `sm_80`, Ada `sm_89`, Hopper `sm_90`) sin recompilación.
- CUDA: 13.0 (versión usada en la imagen de Colab T4). No se especifica compatibilidad con otras versiones del runtime.
- VRAM: no determinada por el artefacto; depende del GGUF cargado. Para modelos de 4B en cuantización Q4, el orden de magnitud habitual es de 2 a 4 GB, pero no hay dato publicado en este repositorio.
- Cabe en consumer GPU: no aplica directamente; la T4 es una GPU de centro de datos con 16 GB de VRAM. El binario está compilado solo para `sm_75`, por lo que no se ejecutará en RTX 4090 (`sm_89`) ni en RTX 3090 (`sm_86`) sin rebuild.
- Opciones de despliegue: `llama-server` (incluido en el archivo). No se incluyen binarios para vLLM, TGI, Ollama ni llama.cpp CLI.
- Latencia y throughput: no disponibles; dependen del modelo GGUF, la cuantización y la carga.

## Comparativa con modelos similares

No aplica como modelo. Comparativa de artefactos equivalentes:

| Artefacto | Contenido | Arquitectura CUDA | Licencia | Uso |
|---|---|---|---|---|
| `avgrocketman/llamacpp-dory-t4` | `llama-server` + libs, sin pesos | `sm_75` solo | MIT (upstream) | Inferencia en T4 |
| llama.cpp upstream (releases oficiales) | Binarios y código fuente | Múltiples (`sm_75`, `sm_80`, `sm_89`, `sm_90`) | MIT | Uso general |
| Ollama | Runtime con modelos integrados | Múltiples | MIT | Despliegue simplificado |

La diferencia principal frente a las releases oficiales de llama.cpp es la restricción a `sm_75` y la fijación de una revisión de fork concreta, lo que aporta reproducibilidad pero reduce la portabilidad.

## Limitaciones y advertencias

- No es un modelo: no contiene pesos, tokenizador, configuración ni model card de un LLM. Cualquier uso como "modelo" es un error de interpretación.
- Restricción de arquitectura: solo compilado para `sm_75` (Tesla T4). No se ejecutará en GPUs Ampere, Ada, Hopper ni en GPUs consumer recientes.
- Dependencia de CUDA 13.0: puede fallar en entornos con otra versión del runtime CUDA.
- Repositorio con 0 descargas y 0 likes: sin validación comunitaria; el artefacto podría no estar subido (tamaño reportado de 0.0 GB).
- Licencia del repositorio no declarada explícitamente; la licencia MIT se hereda de llama.cpp upstream, pero conviene verificar el fork `brianchmielNV/llama.cpp`.
- Sin garantías de mantenimiento: la revisión está fijada y no se actualizará con parches de seguridad o correcciones de llama.cpp.
- Riesgo de alucinación, sesgos o limitaciones de idioma: no aplican al artefacto; dependen exclusivamente del GGUF que se cargue.
- El autor indica explícitamente que "no es una release de propósito general" y que existe solo para evitar compilar en una VM Colab nueva.

## Enlaces

- Hugging Face: https://huggingface.co/avgrocketman/llamacpp-dory-t4
- Fork de llama.cpp usado en la compilación: https://github.com/brianchmielNV/llama.cpp
- Revisión compilada: `98a74c97ea09ac72f6ceda1559808fc0a2f447ce` (PR #30306)
- llama.cpp upstream: https://github.com/ggml-org/llama.cpp
- Modelo referenciado: `models/XHToken/Spark-X2.6-4B` (no disponible URL directa en la información)
- Modelo referenciado: `models/NVIDIA/Dory1.0-4B` (no disponible URL directa en la información)
