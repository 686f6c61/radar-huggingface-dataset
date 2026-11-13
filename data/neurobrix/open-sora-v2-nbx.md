# Neurobrix/Open-Sora-v2-nbx

## Resumen
Open-Sora-v2-nbx es un contenedor `.nbx` del modelo de generación de vídeo texto-a-vídeo Open-Sora-v2 desarrollado originalmente por hpcai-tech, empaquetado por Neurobrix para su ejecución en el motor de inferencia local homónimo. No se trata de un modelo nuevo ni de un fine-tune con pesos alterados: el contenedor incluye el grafo de computación, los pesos, la topología de componentes y los valores por defecto de ejecución del modelo original, de modo que el motor NeuroBrix pueda planificar su despliegue sobre el hardware disponible.

La relevancia de este artefacto es operativa, no algorítmica. Frente a la necesidad de montar manualmente el stack de dependencias de un modelo de difusión para vídeo, el contenedor permite importar y ejecutar Open-Sora-v2 con dos comandos, con soporte para GPUs NVIDIA, GPUs de Mac (Metal) y CPU, y con dos motores alternativos: PyTorch o Triton (este último sin dependencia de PyTorch, mediante los kernels `nbxtensor`).

El contenedor ocupa 45,6 GB y se distribuye bajo licencia Apache 2.0, la misma del modelo original. Toda la información sobre arquitectura, entrenamiento, capacidades y limitaciones del modelo subyacente debe consultarse en la model card de hpcai-tech, ya que el autor del contenedor no aporta especificaciones técnicas adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de generación de vídeo texto-a-vídeo; consúltese la model card de hpcai-tech/Open-Sora-v2) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (no aplica en el sentido de LLM; el modelo recibe prompts de texto y genera vídeo) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | contenedor `.nbx` (grafo de computación + pesos + topología + valores de ejecución); tamaño del contenedor: 45,6 GB; SHA-256: `ad9387eaee34d4d56f0b23c3efcf8da456f1766d982adf7cbb328fb085a347c1` |

## Arquitectura y entrenamiento
No se proporciona información sobre la arquitectura interna, los datos de entrenamiento ni las técnicas de alineación del modelo subyacente en la información disponible. El contenedor declara la familia "video generation model" y la tarea `text-to-video`, y remite explícitamente a la model card original de `hpcai-tech/Open-Sora-v2` para cualquier detalle sobre entrenamiento y uso previsto.

La innovación técnica que aporta este artefacto es de empaquetado y ejecución: el contenedor `.nbx` encapsula el grafo de computación del modelo, sus pesos, la forma en que se conectan sus componentes y sus valores por defecto de runtime. El motor NeuroBrix planifica la colocación de cada parte del modelo (una GPU, varias, en streaming o en host) a partir de los recursos de GPU y memoria detectados, y ofrece dos backends: el motor PyTorch y el motor Triton basado en kernels `nbxtensor` certificados por clase de GPU.

## Capacidades
- Generación de vídeo a partir de prompts de texto (pipeline `text-to-video`).
- Ejecución local en GPUs NVIDIA, GPUs de Mac con Metal y CPU.
- Ejecución con motor PyTorch o con motor Triton sin PyTorch (kernels `nbxtensor`).
- Planificación automática de reparto del modelo entre una o varias GPUs, con streaming o ejecución en host.
- Importación y ejecución mediante CLI (`neurobrix import`, `neurobrix run`) con salida a fichero de vídeo (`.mp4` en el ejemplo de la model card).
- No se documentan en la información disponible capacidades de tool calling, agentes, razonamiento multi-paso, visión, audio o modo de pensamiento.

## Casos de uso
- Prototipado rápido de texto-a-vídeo en local: el flujo `neurobrix import` + `neurobrix run --prompt ... --output ...` permite obtener un clip sin montar manualmente el stack de dependencias del modelo de difusión.
- Evaluación de modelos de generación de vídeo en estaciones de trabajo con una sola GPU: el motor planifica el reparto del modelo según la memoria detectada, lo que facilita probar el modelo en hardware limitado.
- Despliegue en entornos macOS con GPU Metal: es una de las plataformas declaradas compatibles, útil para equipos de diseño o investigación que no disponen de GPUs NVIDIA.
- Ejecución en CPU para pruebas funcionales y validación de pipelines: el contenedor declara soporte de CPU, adecuado para verificar integraciones sin acelerador dedicado.
- Integración en pipelines de generación de contenido automatizada: la interfaz CLI y la salida a fichero `.mp4` permiten encadenar la generación de clips dentro de scripts o procesos por lotes.
- Reproducibilidad de experimentos: el contenedor fija grafo, pesos, topología y valores de ejecución, y publica un SHA-256 verificable, lo que ayuda a reproducir resultados entre máquinas.
- Despliegue multi-GPU o con streaming de pesos: para modelos cuyo tamaño excede la memoria de una única GPU, el motor distribuye componentes entre varias GPUs o aplica streaming.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware
- VRAM estimada para inferencia: no disponible; el contenedor ocupa 45,6 GB, pero no se especifica el pico de memoria en ejecución ni el reparto entre pesos y activaciones.
- GPUs recomendadas: no disponible. El contenedor declara compatibilidad con GPUs NVIDIA, GPUs de Mac (Metal) y CPU, sin listar modelos concretos.
- ¿Cabe en GPU de consumo? No disponible; el motor contempla ejecución multi-GPU, streaming y en host, lo que sugiere escenarios con memoria insuficiente en una sola GPU, pero no se confirma qué GPUs de consumo son suficientes.
- Opciones de despliegue: motor NeuroBrix con backend PyTorch o backend Triton (`nbxtensor`); instalación vía `pip install neurobrix`; importación con `neurobrix import hpcai-tech/Open-Sora-v2 --accept-license`; ejecución con `neurobrix run --model hpcai-tech/Open-Sora-v2 --prompt "..." --output salida.mp4`.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / tarea | Licencia | Formato / disponibilidad |
|---|---|---|---|---|
| Open-Sora-v2-nbx (Neurobrix) | no disponible | texto-a-vídeo | Apache 2.0 | contenedor `.nbx`, 45,6 GB, vía NeuroBrix |
| hpcai-tech/Open-Sora-v2 (original) | no disponible | texto-a-vídeo | Apache 2.0 | pesos originales en Hugging Face |

No se dispone de información sobre otros modelos comparables de la misma categoría en la documentación proporcionada.

## Limitaciones y advertencias
- La model card del contenedor no documenta sesgos, tasas de alucinación ni limitaciones de idioma del modelo subyacente; deben consultarse en la model card original de `hpcai-tech/Open-Sora-v2`, que el autor declara aplicables sin cambios.
- La licencia es Apache 2.0, la del modelo original, lo que en principio permite uso comercial, pero conviene verificar los términos del modelo base y de las dependencias empaquetadas antes de un despliegue en producción.
- El contenedor fija un SHA-256 concreto; cualquier alteración del artefacto invalida la verificación de integridad.
- El soporte de hardware y motores (NVIDIA, Metal, CPU, PyTorch, Triton) se declara de forma genérica; no se detallan versiones mínimas de drivers, CUDA ni memoria requerida.
- El modelo se distribuye con 0 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado el mismo día (13 de noviembre de 2026), por lo que no hay evidencia de uso en producción ni validación por terceros.
- No se dispone de información sobre el rendimiento real, la calidad de los vídeos generados ni los requisitos de memoria en ejecución.

## Enlaces
- Contenedor en Hugging Face: https://huggingface.co/Neurobrix/Open-Sora-v2-nbx
- Modelo original: https://huggingface.co/hpcai-tech/Open-Sora-v2
- Repositorio de NeuroBrix: https://github.com/NeuroBrix
- Kernels nbxtensor: https://github.com/NeuroBrix/nbxtensor
- Hub de NeuroBrix: https://neurobrix.org
- Página del modelo en el hub: https://neurobrix.org/models/hpcai-tech/Open-Sora-v2
- Documentación: https://docs.neurobrix.org
- Canal de YouTube: https://www.youtube.com/@NeuroBrix
