# Neurobrix/mochi-1-preview-nbx

## Resumen

`Neurobrix/mochi-1-preview-nbx` es un contenedor `.nbx` del modelo de generación de vídeo texto-a-vídeo **Mochi 1 Preview**, desarrollado originalmente por Genmo y empaquetado por NeuroBrix para su ejecución en el motor de inferencia homónimo. No se trata de un modelo nuevo ni de un fine-tuning: el contenedor incluye el grafo de computación, los pesos, las conexiones entre componentes y los valores por defecto de ejecución del modelo original, de modo que el motor puede planificar el reparto de cómputo entre GPUs, memoria y host sin intervención manual.

La relevancia de este empaquetado radica en la portabilidad: el mismo contenedor puede ejecutarse en GPUs NVIDIA, GPUs de Apple vía Metal y CPU, con dos motores intercambiables (PyTorch o Triton mediante los kernels `nbxtensor`). El contenedor ocupa 41,0 GB y se distribuye bajo la misma licencia Apache 2.0 que el modelo original.

La información pública disponible sobre este artefacto es escasa: cero descargas y cero likes en el momento de la consulta, y la model card no detalla arquitectura, número de parámetros, contexto ni datos de entrenamiento. Todo lo que sigue se limita a lo que aparece en la información proporcionada y en la documentación del contenedor; los datos no disponibles se indican explícitamente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de generación de vídeo texto-a-vídeo; detalles no publicados en la información disponible) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | contenedor `.nbx` (41,0 GB); pesos del modelo original empaquetados en su interior |
| Modelo base | `genmo/mochi-1-preview` |
| Pipeline | text-to-video |
| Tamano del contenedor | 41,0 GB |
| SHA-256 | `ebe3e28e73db0305b7e0bce52407287d01fd97e75371edcecfee2faa1cdcbbcc` |
| Libreria | `neurobrix` |
| Motores de ejecución | PyTorch o Triton (`nbxtensor`) |
| Hardware soportado | GPUs NVIDIA, GPUs Apple (Metal), CPU |

## Arquitectura y entrenamiento

No se han publicado en la información disponible detalles sobre la arquitectura interna del modelo (tipo de transformer, mecanismo de atención, número de parámetros o diseño del codificador de texto). La model card del contenedor remite explícitamente a la model card original de Genmo para cualquier dato sobre entrenamiento, uso previsto y limitaciones, y declara que esos términos se aplican sin cambios.

Lo que sí documenta el contenedor es su capa de ejecución: NeuroBrix incluye el grafo de computación completo del modelo, la disposición de los pesos, la topología de conexión entre componentes y los valores por defecto del runtime. El motor planifica la colocación de cada parte del modelo («one GPU, several, streamed, or on the host») en función de las GPUs y la memoria detectadas, y ofrece dos backends: el motor PyTorch convencional y un motor Triton que no requiere PyTorch y utiliza kernels `nbxtensor` certificados por clase de GPU.

## Capacidades

- Generación de vídeo a partir de prompts de texto (pipeline `text-to-video`).
- Ejecución local en hardware propio, sin dependencia de servicios en la nube.
- Planificación automática de recursos: reparto entre una GPU, varias GPUs, modo *streamed* o ejecución en host.
- Compatibilidad multiplataforma: GPUs NVIDIA, GPUs Apple con Metal y CPU.
- Doble motor de inferencia: PyTorch o Triton sin PyTorch.
- Importación y ejecución mediante CLI (`neurobrix import`, `neurobrix run`).
- Capacidades de tool calling, agentes, razonamiento multi-paso, visión o audio: no disponibles (el artefacto es un modelo de generación de vídeo; no se documentan otras capacidades).

## Casos de uso

- **Generación de clips para prototipado creativo**: un equipo de diseño puede lanzar `neurobrix run --model genmo/mochi-1-preview --prompt "..." --output clip.mp4` para obtener un vídeo a partir de una descripción textual y validar conceptos antes de invertir en producción.
- **Iteración local sin coste por API**: al ejecutarse en hardware propio (NVIDIA, Apple Metal o CPU), permite repetir generaciones sin depender de cuotas ni de conectividad, útil en fases de exploración con muchas variantes de prompt.
- **Despliegue en estaciones de trabajo con una sola GPU**: la planificación automática del motor permite ejecutar el modelo en un único dispositivo, lo que encaja en equipos de investigación con una GPU dedicada.
- **Reparto multi-GPU en servidores compartidos**: en entornos con varias GPUs, el motor distribuye las distintas partes del modelo, aprovechando recursos agregados que un único dispositivo no cubriría.
- **Ejecución en portátiles Apple**: la ruta Metal permite generar vídeo en equipos Mac sin GPU NVIDIA, ampliando el parque de máquinas capaces de ejecutar el modelo.
- **Pipelines automatizados de generación de vídeo**: la interfaz de línea de comandos con `--prompt` y `--output` facilita integrar la generación en scripts y flujos por lotes.
- **Evaluación comparativa de motores**: al ofrecer backend PyTorch y backend Triton, sirve para medir diferencias de rendimiento entre ambos sobre el mismo modelo y hardware.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del contenedor no incluye métricas de calidad de vídeo, latencia ni throughput.

## Requisitos de hardware

- **VRAM estimada**: no disponible. El contenedor ocupa 41,0 GB en disco, pero la model card no especifica la VRAM necesaria para inferencia ni el desglose por componentes.
- **GPUs recomendadas**: no disponible. La documentación solo indica compatibilidad genérica con GPUs NVIDIA, GPUs Apple (Metal) y CPU.
- **¿Cabe en GPU de consumo?**: no disponible. No se indica si el modelo cabe en tarjetas como RTX 4090 u otras; el motor contempla modos *streamed* y ejecución en host que podrían aliviar la presión de VRAM, pero no se cuantifica.
- **Opciones de despliegue**: motor NeuroBrix con backend PyTorch o backend Triton (`nbxtensor`). No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI para este contenedor.
- **Latencia y throughput**: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| `Neurobrix/mochi-1-preview-nbx` | no disponible | no disponible | Apache 2.0 | contenedor `.nbx` | Empaquetado de Mochi 1 Preview para el motor NeuroBrix |
| `genmo/mochi-1-preview` | no disponible | no disponible | Apache 2.0 | pesos originales del modelo | Modelo original de Genmo; misma licencia y mismas limitaciones |
| Otras alternativas texto-a-vídeo | no disponible | no disponible | no disponible | no disponible | No se dispone de datos de modelos comparables en la información proporcionada |

La única comparación documentada es con el modelo base: se trata del mismo modelo y la misma licencia, con la diferencia de que el contenedor añade el grafo, la topología y los valores por defecto necesarios para ejecutarlo en NeuroBrix.

## Limitaciones y advertencias

- **Datos técnicos incompletos**: la model card no publica arquitectura, parámetros, contexto, cuantizaciones ni idiomas; cualquier evaluación de idoneidad requiere consultar la model card original de Genmo.
- **Sesgos**: no documentados en la información disponible; se remite a la model card original.
- **Riesgo de alucinación**: no cuantificado para este artefacto; aplican las limitaciones del modelo original.
- **Idiomas**: no disponibles; no se especifica qué lenguas acepta el codificador de texto.
- **Licencia**: Apache 2.0, la misma del modelo original, sin restricciones adicionales documentadas por el empaquetador. Cualquier condición de uso previsto debe verificarse en la model card de Genmo.
- **Madurez del artefacto**: cero descargas y cero likes en el momento de la consulta; es un empaquetado reciente (creado y actualizado el 2026-11-13) sin validación comunitaria documentada.
- **Dependencia del motor**: el contenedor solo es utilizable a través de NeuroBrix; no se documenta exportación a otros formatos como GGUF o safetensors sueltos.
- **Integridad**: conviene verificar el SHA-256 (`ebe3e28e...cdcbbcc`) tras la descarga, dado que el contenedor es un artefacto binario de 41,0 GB.

## Enlaces

- Hugging Face del contenedor: https://huggingface.co/Neurobrix/mochi-1-preview-nbx
- Modelo original: https://huggingface.co/genmo/mochi-1-preview
- Descarga del contenedor: https://neurobrix.org/models/genmo/mochi-1-preview
- Repositorio GitHub de NeuroBrix: https://github.com/NeuroBrix
- Kernels `nbxtensor`: https://github.com/NeuroBrix/nbxtensor
- Hub de NeuroBrix: https://neurobrix.org
- Documentación: https://docs.neurobrix.org
- Canal de YouTube: https://www.youtube.com/@NeuroBrix
