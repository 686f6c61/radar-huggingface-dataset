# febilly/realtime-subtitle-local-runtime

## Resumen

`febilly/realtime-subtitle-local-runtime` no es un modelo de IA en sentido estricto, sino un repositorio de distribucion de artefactos binarios que la aplicacion [realtime-subtitle](https://github.com/febilly/realtime-subtitle) descarga para su modo local. El autor lo publica en Hugging Face y sus espejos para facilitar la obtencion de dependencias en entornos donde GitHub u otros orígenes pueden ser lentos o estar bloqueados. El contenido son copias sin modificar de ficheros de terceros: no hay pesos de modelo entrenados por el autor ni codigo propio.

El repositorio contiene dos artefactos: un subconjunto del binario de llama.cpp b11985 para Windows x64 con backend Vulkan (solo bibliotecas, sin ejecutables) y el modelo de deteccion de actividad de voz Silero VAD en formato ONNX (16 kHz, operacion op15). Ambos se usan en el pipeline de subtitulado en tiempo real: llama.cpp para la inferencia del modelo de lenguaje que genera o corrige subtitulos, y Silero VAD para segmentar el audio de entrada y detectar cuando hay habla.

Es relevante para desarrolladores que quieran replicar o auditar el modo local de realtime-subtitle, o que necesiten esos binarios concretos sin depender de la disponibilidad de las releases de GitHub. Dado que el repo pesa 0.0 GB en el momento de la consulta y no tiene descargas ni likes, debe considerarse un artefacto auxiliar de distribucion, no un modelo evaluable por sus capacidades.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (repositorio de artefactos, no de un modelo unico) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el zip incluye bibliotecas de llama.cpp, no pesos) |
| Idiomas soportados | no disponible |
| Licencia | MIT (LICENSE-llama.cpp y LICENSE-silero-vad incluidos; libomp cubierto por LICENSE-LLVM-OpenMP dentro del zip) |
| Formato de pesos | ONNX (`silero_vad_16k_op15.onnx`); bibliotecas nativas Windows x64 en zip (`llama-b11985-bin-win-vulkan-x64-min.zip`) |

## Arquitectura y entrenamiento

No aplica en el sentido habitual: el repositorio no entrena ni modifica ningun modelo. Los dos artefactos que contiene son:

- **`llama-b11985-bin-win-vulkan-x64-min.zip`**: subconjunto del release oficial de llama.cpp b11985 para Windows x64 con backend Vulkan. Incluye unicamente las bibliotecas (`llama`, `mtmd`, `ggml*`, `libomp`), sin ejecutables. La licencia del proyecto llama.cpp es MIT; `libomp` va cubierto por la licencia de LLVM OpenMP incluida en el zip. El backend Vulkan permite acelerar la inferencia en GPUs de distintos fabricantes bajo Windows.
- **`silero_vad_16k_op15.onnx`**: modelo de deteccion de actividad de voz de Silero, en formato ONNX, muestreo de 16 kHz y version de operacion op15. Es un modelo pequeno, pensado para ejecucion en CPU en tiempo real, que clasifica fragmentos de audio como voz o no voz.

No hay informacion sobre datos de entrenamiento, tokens, RLHF/DPO ni innovaciones tecnicas propias, porque el autor no entrena nada: solo redistribuye.

## Capacidades

- Distribucion de dependencias para el modo local de realtime-subtitle a traves de Hugging Face y espejos.
- Proporciona las bibliotecas de llama.cpp (build b11985, Windows x64, Vulkan) necesarias para ejecutar modelos GGUF en local.
- Proporciona el modelo Silero VAD ONNX (16 kHz, op15) para deteccion de actividad de voz y segmentacion de audio.
- No incluye capacidades de generacion, razonamiento, codigo, vision, tool calling ni agentes por si mismo; esas capacidades dependen del modelo GGUF que el usuario cargue con las bibliotecas de llama.cpp.
- No ofrece soporte multilingue propio; depende del modelo que se ejecute encima.
- No incluye ejecutables: solo bibliotecas, por lo que no es un runtime autónomo listo para usar sin la aplicacion anfitriona.

## Casos de uso

- **Subtitulado en tiempo real en local**: la aplicacion realtime-subtitle usa Silero VAD para detectar segmentos de habla y llama.cpp para ejecutar un modelo de lenguaje que transcribe o corrige los subtitulos, todo sin enviar audio a la nube.
- **Despliegue en Windows con GPU Vulkan**: el zip permite usar aceleracion Vulkan en GPUs AMD, Intel o NVIDIA bajo Windows, util en equipos donde CUDA no esta disponible o no se quiere instalar el stack de NVIDIA.
- **Auditoria de dependencias**: al ser copias sin modificar de upstream, un equipo de seguridad puede verificar el contenido y las licencias (MIT de llama.cpp y Silero VAD, LLVM OpenMP para libomp) antes de integrarlas en su build.
- **Espejo para entornos con acceso restringido a GitHub**: organizaciones que bloquean o limitan GitHub pueden obtener estos binarios desde Hugging Face o sus espejos.
- **Prototipado de pipelines de voz**: Silero VAD ONNX se puede reutilizar en otros proyectos de deteccion de habla en tiempo real sobre CPU, independientemente de realtime-subtitle.
- **Reproducibilidad de builds**: fijar la version b11985 de llama.cpp evita que una actualizacion de upstream rompa la aplicacion, al depender de un artefacto concreto y versionado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no contiene pesos de modelo evaluables ni el autor reporta metricas de latencia o throughput.

## Requisitos de hardware

- **VRAM**: no aplica al repositorio en si; depende del modelo GGUF que se cargue con las bibliotecas de llama.cpp. Silero VAD esta disenado para ejecutarse en CPU con requisitos minimos.
- **GPU recomendadas**: el zip esta compilado para el backend Vulkan en Windows x64, por lo que funciona con GPUs AMD, Intel y NVIDIA que soporten Vulkan. No se incluye build CUDA.
- **Consumer GPU**: si, cualquier GPU con soporte Vulkan bajo Windows puede usar estas bibliotecas; el limite practico lo pone el tamano del modelo GGUF cargado.
- **Opciones de despliegue**: llama.cpp (build b11985, Vulkan, Windows x64) y ONNX Runtime para Silero VAD. No se incluyen ejecutables de llama.cpp, solo bibliotecas.
- **Latencia y throughput**: no disponible.

## Comparativa con modelos similares

No disponible. Este repositorio no es un modelo comparable con otros modelos de lenguaje o de vision; es un paquete de distribucion de dependencias. Como referencia de los componentes que contiene:

| Componente | Proyecto upstream | Version | Licencia | Formato |
|---|---|---|---|---|
| Bibliotecas llama.cpp | ggml-org/llama.cpp | b11985 (Windows x64, Vulkan) | MIT | zip con DLLs |
| Silero VAD | snakers4/silero-vad | 16 kHz, op15 | MIT | ONNX |

## Limitaciones y advertencias

- No es un modelo: no se puede evaluar por capacidades de generacion, razonamiento o exactitud.
- Solo incluye bibliotecas, no ejecutables; requiere la aplicacion realtime-subtitle o un binario compatible para funcionar.
- El build esta limitado a Windows x64 con Vulkan; no hay builds para Linux, macOS, CUDA ni ROCm en este repositorio.
- El repo pesa 0.0 GB y no tiene descargas ni likes en el momento de la consulta; verificar la integridad de los ficheros antes de usarlos en produccion.
- Al ser copias de upstream, la responsabilidad de seguridad y actualizaciones recae en los proyectos originales (llama.cpp y silero-vad).
- Licencia MIT permite uso comercial, pero conviene revisar las licencias de los componentes incluidos (LLVM OpenMP para libomp) y del modelo GGUF que se cargue encima.
- No hay garantia de soporte ni mantenimiento por parte del autor.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/febilly/realtime-subtitle-local-runtime
- Aplicacion realtime-subtitle: https://github.com/febilly/realtime-subtitle
- Release de llama.cpp b11985: https://github.com/ggml-org/llama.cpp/releases/tag/b11985
- Proyecto Silero VAD: https://github.com/snakers4/silero-vad
