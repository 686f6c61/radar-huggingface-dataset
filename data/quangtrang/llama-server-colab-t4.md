# quangtrang/llama-server-colab-t4

## Resumen

`quangtrang/llama-server-colab-t4` no es un modelo de lenguaje, sino un paquete de binarios precompilados de `llama-server` (el servidor de inferencia de llama.cpp) junto con las bibliotecas de runtime de CUDA 12, compilados específicamente para la arquitectura `sm_75` (compute capability 7.5) de la GPU Google Colab T4. El autor, quangtrang, lo publica para resolver un problema operativo concreto: compilar llama.cpp con soporte CUDA en una T4 de Colab tarda entre 75 y 90 minutos, y las sesiones gratuitas de Colab se interrumpen en ráfagas de 10 a 15 minutos, por lo que la compilación nunca llega a completarse dentro de una asignación de cuota.

El paquete incluye dos tarballs: `llama-server-cuda-sm75.tar.gz` (684 MB) con el binario y las bibliotecas ggml, y `cuda-runtime-sm75.tar.gz` (393 MB) con `libcudart.so.12`, `libcublas.so.12` y `libcublasLt.so.12`. Al desplegar el binario precompilado, el tiempo de puesta en marcha baja de unos 75 minutos a aproximadamente 4 minutos, lo que sí cabe en una ráfaga gratuita de GPU.

El modelo que se sirve con este motor no forma parte del repositorio: la model card indica que los pesos viven en `unsloth/Qwen3-Coder-30B-A3B-Instruct-GGUF`, en concreto el archivo `Qwen3-Coder-30B-A3B-Instruct-UD-IQ3_XXS.gguf` (12,85 GB). Es relevante ahora porque ofrece una vía reproducible para levantar un endpoint compatible con la API de OpenAI en hardware gratuito, útil para agentes de IDE, interfaces de chat y SDKs que acepten una `base URL` personalizada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el repositorio contiene binarios de llama.cpp, no un modelo) |
| Parametros totales | no disponible (el modelo servido de referencia es Qwen3-Coder-30B-A3B, 30B) |
| Parametros activos | no disponible (MoE del modelo de referencia: 3B activos) |
| Longitud de contexto | 49.152 tokens configurados en el servidor (referencia `-c 49152`) |
| Tipos de cuantizacion | GGUF; cuantización de pesos IQ3_XXS en el modelo de referencia; caché KV configurable (`q8_0` para K, `q4_0` para V) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | no aplica al repositorio (binarios `.tar.gz` + `.so`); el modelo servido es GGUF |
| Arquitectura CUDA objetivo | `sm_75` (compute capability 7.5, T4) |
| Runtime CUDA incluido | CUDA 12 (`libcudart.so.12`, `libcublas.so.12`, `libcublasLt.so.12`) |
| Tamaño del repositorio | 1,1 GB |
| Librería declarada | llama.cpp |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El repositorio no contiene ningún modelo entrenado ni proceso de entrenamiento. Contiene un binario de `llama-server` compilado con `cmake -DGGML_CUDA=ON -DCMAKE_CUDA_ARCHITECTURES=75 -DCMAKE_BUILD_TYPE=Release -DGGML_NATIVE=OFF` y las bibliotecas compartidas de ggml (`libllama.so`, `libggml*.so`) preservadas en sus rutas relativas de build para que el `rpath` del binario resuelva correctamente. La compilación se realizó en una sesión de Colab sin GPU (solo CPU), instalando el toolkit CUDA 12.6 vía apt (`cuda-nvcc-12-6`, `cuda-cudart-dev-12-6`, `libcublas-dev-12-6`, `cuda-cccl-12-6`), ya que `nvcc` no requiere GPU para compilar.

La innovación técnica no está en el modelo sino en el método de empaquetado: se incluyen las bibliotecas de runtime CUDA 12 para que el binario funcione en cualquier VM con GPU independientemente de la versión de CUDA instalada en la imagen (Colab usa CUDA 13, y el driver es retrocompatible con el runtime 12 incluido). La configuración de referencia documentada usa `-ngl 99` (offload completo a GPU), flash attention activada (`-fa on`), `-ub 1024` para mejorar el prefill con pesos cuantizados, y caché KV asimétrica (`q8_0` en K, `q4_0` en V). El modelo servido de referencia, Qwen3-Coder-30B-A3B-Instruct, es una arquitectura MoE con 30B parámetros totales y 3B activos, pero sus detalles de entrenamiento no se documentan en esta ficha.

## Capacidades

- Servir modelos GGUF mediante `llama-server` con endpoint compatible con la API de OpenAI (`/v1`).
- Exposición de un servidor HTTP accesible desde cualquier cliente que acepte `base URL` personalizada: agentes de IDE, interfaces de chat, SDKs y herramientas CLI.
- No requiere API key por parte del servidor.
- Soporte de alias de modelo mediante `--alias` para identificar el modelo servido en las peticiones.
- Inferencia con offload completo a GPU (`-ngl 99`) y flash attention.
- Cuantización de caché KV configurable de forma independiente para K y V.
- Verificación de dispositivos CUDA mediante `--list-devices`.
- Las capacidades del modelo servido (generación de texto, código, tool calling, agentes, multilingüismo) dependen del GGUF que se cargue, no del paquete de binarios; en la referencia se usa Qwen3-Coder-30B-A3B-Instruct, pero sus capacidades concretas no se detallan en la información disponible.

## Casos de uso

- Despliegue rápido de un endpoint OpenAI-compatible en Colab T4 gratuito: extraer los dos tarballs, exportar `LD_LIBRARY_PATH` y arrancar `llama-server` en unos 4 minutos, frente a los 75-90 minutos de una compilación desde cero, lo que encaja en la ventana de cuota gratuita.
- Integración con agentes de IDE: apuntar la `base URL` del agente a `https://<host>/v1` sin API key permite usar el modelo servido para autocompletado, refactorización o generación de código dentro del editor.
- Backend para interfaces de chat: cualquier UI que acepte una URL base personalizada puede conectarse al servidor y usar el modelo GGUF cargado para conversación multi-turno, con contexto de servidor configurado a 49.152 tokens.
- Pruebas de pipelines de SDK: desarrolladores que necesitan validar integraciones con la API de OpenAI pueden levantar este servidor como sustituto local o remoto sin coste de API.
- Servir modelos cuantizados en hardware limitado: la configuración de referencia con IQ3_XXS (12,85 GB) y caché KV cuantizada demuestra que es viable ejecutar un modelo MoE de 30B en una T4 de 16 GB de VRAM.
- Diagnóstico y benchmarks de llama.cpp: el repositorio acompaña scripts de benchmark y diagnóstico en el proyecto GitHub asociado, útiles para medir throughput y latencia de configuraciones concretas.
- Reproducibilidad de entornos: al fijar la arquitectura `sm_75` y el runtime CUDA 12, se elimina la variabilidad de versiones entre sesiones de Colab, lo que facilita repetir despliegues idénticos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona que el proyecto asociado incluye benchmarks y diagnósticos, pero no proporciona cifras de throughput, latencia ni métricas de calidad del modelo servido.

## Requisitos de hardware

- GPU objetivo: Google Colab T4 (compute capability 7.5, 16 GB de VRAM). El binario está compilado exclusivamente para `sm_75`; no funcionará en arquitecturas distintas sin recompilar.
- VRAM estimada: el modelo de referencia IQ3_XXS ocupa 12,85 GB en disco, lo que deja poco margen en una T4 de 16 GB; la caché KV cuantizada (`q8_0`/`q4_0`) y `-c 49152` están pensados para ajustarse a ese límite.
- Configuración de referencia: `-ngl 99 -c 49152 --cache-type-k q8_0 --cache-type-v q4_0 -fa on -b 1024 -ub 512 -np 1 --threads 2`.
- No cabe en GPUs consumer de menos de 16 GB con este modelo concreto; modelos GGUF más pequeños sí podrían caber.
- Opciones de despliegue: `llama-server` (incluido en el paquete); el paquete no está pensado para vLLM, TGI ni Ollama, aunque el GGUF subyacente podría usarse con otras herramientas.
- Latencia y throughput: no disponibles en la información proporcionada.
- Requisito de sistema: `LD_LIBRARY_PATH` debe incluir `/content/llama.cpp/build/bin` y `/content/llama.cpp/build/lib` para que el binario resuelva las bibliotecas ggml y CUDA.

## Comparativa con modelos similares

| Alternativa | Tipo | Ventaja | Limitación frente a este paquete |
|---|---|---|---|
| Compilar llama.cpp con CUDA en la propia T4 | Build desde fuente | Control total de opciones de compilación | 75-90 minutos, no cabe en una ráfaga gratuita de Colab |
| Imágenes Docker oficiales de llama.cpp | Binarios precompilados | Mantenidas por el proyecto, múltiples arquitecturas | No están optimizadas para `sm_75` ni incluyen runtime CUDA 12 empaquetado para Colab |
| Ollama | Runtime con gestión de modelos | Instalación sencilla y gestión integrada | No expone la misma flexibilidad de flags de llama.cpp ni está orientado a Colab T4 |

No se dispone de datos de rendimiento comparativo entre estas opciones en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo: no contiene pesos ni capacidades de generación propias; todo depende del GGUF que se cargue.
- El binario está compilado solo para `sm_75`; en GPUs con otra compute capability (A100, H100, RTX 4090, etc.) no funcionará sin recompilar.
- Verificar con `--list-devices`, no con `--version`: `--version` puede tener éxito aunque las bibliotecas CUDA no se carguen, dando una falsa sensación de que el paquete funciona.
- La licencia MIT cubre el paquete de binarios; la licencia del modelo servido (Qwen3-Coder-30B-A3B-Instruct) es independiente y debe consultarse en su repositorio de origen.
- El servidor no requiere API key, lo que supone un riesgo de seguridad si se expone a internet sin autenticación adicional.
- El contexto de 49.152 tokens es capacidad del servidor; el cliente debe declarar una ventana menor (35.000 en Command Code) porque su contabilidad de tokens puede exceder la del servidor en torno a 1,3 veces.
- La información sobre idiomas soportados, sesgos y riesgo de alucinación corresponde al modelo servido, no al paquete, y no está disponible en esta ficha.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria del paquete.
- No hay resultados de benchmarks publicados que permitan evaluar el rendimiento real del despliegue.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/quangtrang/llama-server-colab-t4
- Proyecto y scripts completos: https://github.com/quangtrang1111/gg-colab-models
- Modelo GGUF de referencia: https://huggingface.co/unsloth/Qwen3-Coder-30B-A3B-Instruct-GGUF
- Bundle del motor: https://huggingface.co/quangtrang/llama-server-colab-t4/resolve/main/llama-server-cuda-sm75.tar.gz
- Bundle del runtime CUDA: https://huggingface.co/quangtrang/llama-server-colab-t4/resolve/main/cuda-runtime-sm75.tar.gz
