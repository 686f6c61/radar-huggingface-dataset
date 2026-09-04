# shuko-tuto/npc-backends

## Resumen

`shuko-tuto/npc-backends` no es un modelo de lenguaje, sino un repositorio que distribuye backends de cómputo precompilados para ejecutar modelos de lenguaje y habla en hardware NVIDIA. Ha sido desarrollado por el usuario `shuko-tuto` como complemento de su repositorio `npc-models`, y su propósito es facilitar la integración de estos modelos en aplicaciones como juegos o extensiones que cargan modelos de forma dinámica. El repositorio contiene, en concreto, el backend CUDA de `llama.cpp` correspondiente al tag `b10786`, junto con las librerías de runtime CUDA 13 que necesita (`cudart64_13`, `cublas64_13`, `cublasLt64_13`), con un tamaño total de 0,7 GB. No incluye pesos ni arquitecturas de modelo; solo el software necesario para acelerar la inferencia en GPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No aplica (no es un modelo; son backends de computo) |
| Parametros totales | No disponible |
| Parametros activos | No disponible (no es un modelo MoE) |
| Longitud de contexto | No disponible (depende del modelo servido) |
| Tipos de cuantizacion | No disponible (son librerias de backend) |
| Idiomas soportados | No disponibles |
| Licencia | MIT (para componentes de ggml) y terminos de redistribucion de NVIDIA (para runtime CUDA) |
| Formato de pesos | No disponible (no contiene pesos; contiene DLLs) |

## Arquitectura y entrenamiento

No se trata de un modelo entrenado, por lo que no hay arquitectura de red ni proceso de entrenamiento. El repositorio contiene el binario `ggml-cuda.dll` de `llama.cpp` en su tag `b10786`, junto con tres librerías de runtime CUDA 13 que importa. Estas librerías permiten ejecutar un modelo de lenguaje y un codec de habla en GPU NVIDIA dentro de una aplicación anfitriona. No hay innovaciones técnicas propias del autor; el contenido es una distribución de binarios ya existentes de `llama.cpp` y de NVIDIA.

## Capacidades

- Aceleración por CUDA para modelos de lenguaje y codecs de habla en GPU NVIDIA.
- Compatibilidad con el tag `b10786` de `llama.cpp`; el backend está diseñado para funcionar junto a las librerías de ese mismo tag.
- Incluye las librerías de runtime CUDA necesarias (`cudart64_13`, `cublas64_13`, `cublasLt64_13`), lo que evita la instalación manual de CUDA.
- Se integra como backend en extensiones que cargan modelos, seleccionándose automáticamente al iniciar la aplicación.
- No incluye capacidades de generación de texto, razonamiento, tool calling ni soporte de agentes, ya que no es un modelo.
- Según la documentación del autor, el backend Vulkan del mismo tag de `llama.cpp` no puede ejecutar el codec de habla, mientras que el backend CUDA sí.

## Casos de uso

- Integración en juegos con NPCs: al colocar los archivos del backend junto a las librerías de la extensión que carga el modelo, el juego puede ejecutar modelos de lenguaje y habla en GPU NVIDIA sin necesidad de un backend preinstalado.
- Aplicaciones de voz locales: el backend CUDA permite acelerar la inferencia de un codec de habla en tiempo real dentro de una aplicación de escritorio.
- Despliegue de modelos en motores como Unity o Unreal: un sistema de diálogo puede usar este backend para ejecutar modelos de lenguaje en local, reduciendo la latencia de la comunicación con servidores externos.
- Prototipado de sistemas de interacción persona-NPC: los desarrolladores pueden probar modelos de lenguaje y habla en entornos de desarrollo sin configurar manualmente CUDA ni `llama.cpp`.
- Actualización del runtime CUDA en aplicaciones existentes: el repositorio ofrece una forma de distribuir las librerías CUDA necesarias junto con el backend, simplificando el empaquetado de la aplicación.
- Uso en entornos sin backend preinstalado: si una extensión no incluye un backend para NVIDIA, este repositorio proporciona el componente necesario para que el modelo funcione en esa plataforma.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: depende del modelo que se ejecute, no del backend. El backend en sí ocupa 628 MB en disco.
- GPU recomendadas: cualquier GPU NVIDIA compatible con CUDA 13. No se especifican modelos concretos en la documentación.
- Compatibilidad: solo Windows x86_64 y hardware NVIDIA. No es compatible con Vulkan para el codec de habla.
- Opciones de despliegue: se integra con `llama.cpp` y con extensiones que cargan modelos; no se menciona soporte para vLLM, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. El repositorio no es un modelo, por lo que no tiene equivalentes directos dentro de la misma categoría. La única comparación posible sería con el backend Vulkan del mismo tag de `llama.cpp`, pero no se ofrecen datos de rendimiento en la información disponible.

## Limitaciones y advertencias

- Solo funciona en Windows x86_64 y con GPU NVIDIA. No hay soporte para Linux, macOS ni hardware AMD.
- No es un modelo: no puede generar texto ni procesar lenguaje por sí mismo. Necesita un modelo de `npc-models` u otro compatible.
- El backend está ligado al tag `b10786` de `llama.cpp`. Si se usa junto a librerías de otro tag, puede cargar pero funcionar más lento o fallar sin comprobación en tiempo de carga.
- Las licencias son mixtas: MIT para los componentes de `ggml` y los términos de redistribución de NVIDIA para las librerías de runtime. Es necesario revisar ambas licencias antes de redistribuir el paquete.
- No se proporciona información sobre sesgos, alucinaciones o limitaciones de idioma, ya que no se trata de un modelo.

## Enlaces

- HuggingFace: https://huggingface.co/shuko-tuto/npc-backends
- Repositorio de llama.cpp: https://github.com/ggerganov/llama.cpp
- CUDA Toolkit (redistribuibles de NVIDIA): https://developer.nvidia.com/cuda-toolkit
