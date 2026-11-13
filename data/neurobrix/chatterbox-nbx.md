# Neurobrix/chatterbox-nbx

## Resumen

`Neurobrix/chatterbox-nbx` es un contenedor de inferencia en formato `.nbx` que empaqueta el modelo de síntesis de voz (text-to-speech) **chatterbox** desarrollado originalmente por **ResembleAI**. El contenedor no introduce pesos nuevos ni un reentrenamiento: reproduce el modelo original `ResembleAI/chatterbox` y añade todo lo necesario para ejecutarlo dentro del motor NeuroBrix, que planifica automáticamente la ubicación de cada componente del grafo de cómputo entre GPUs, memoria del host o CPU.

La relevancia del artefacto es de infraestructura más que de modelado: permite ejecutar chatterbox en hardware local (GPUs NVIDIA, GPUs de Mac con Metal y CPU) con dos motores alternativos, uno basado en PyTorch y otro basado en Triton mediante los kernels `nbxtensor`, que no requieren PyTorch. El repositorio ocupa 2,2 GB y se distribuye bajo licencia MIT, la misma del modelo original.

La información pública disponible es escasa: se trata de un paquete publicado el 13 de noviembre de 2026, sin descargas ni valoraciones, y la model card remite explícitamente a la ficha original de ResembleAI para los detalles de entrenamiento, uso previsto y limitaciones. Por tanto, los datos de arquitectura interna, contexto o composición del dataset no se detallan en la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de text-to-speech; el contenedor empaqueta el grafo de cómputo de chatterbox) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se describe como MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el contenedor `.nbx` incluye los pesos tal como los empaqueta el motor) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | contenedor `.nbx` (2,2 GB); SHA-256 `f577583a30e5861b6d819fa15685cb80811f4668eaf199992e786ea7c175830e` |

## Arquitectura y entrenamiento

La información proporcionada no describe la arquitectura interna de chatterbox: la model card del contenedor solo indica que se trata de un modelo de la familia text-to-speech y que el paquete `.nbx` contiene el grafo de cómputo del modelo, sus pesos, la forma en que se conectan sus componentes y los valores por defecto de ejecución. No se detallan el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF o DPO.

La innovación técnica del artefacto es el propio formato de contenedor y el motor NeuroBrix: planificación automática del reparto de cómputo entre una o varias GPUs, streaming o ejecución en host, y dos backends de ejecución (PyTorch y Triton con kernels `nbxtensor` certificados por clase de GPU). Cualquier detalle sobre el entrenamiento del modelo subyacente debe consultarse en la ficha de `ResembleAI/chatterbox`, que la model card cita como fuente autorizada.

## Capacidades

- Síntesis de voz a partir de texto (pipeline `text-to-speech`), invocable mediante `neurobrix run --prompt "..." --output speech.wav`.
- Ejecución local en GPUs NVIDIA, GPUs de Apple (Metal) y CPU.
- Dos motores de ejecución: PyTorch y Triton (este último sin dependencia de PyTorch, mediante kernels `nbxtensor`).
- Planificación automática del reparto de cómputo entre varias GPUs, modo streaming o ejecución en host.
- Importación reproducible mediante `neurobrix import ResembleAI/chatterbox --accept-license`.
- Capacidades adicionales del modelo original (clonación de voz, control de emoción, multilingüismo, etc.): no disponibles en la información proporcionada.

## Casos de uso

- **Generación de locuciones para prototipos y demos**: el contenedor permite producir un fichero WAV a partir de un prompt de texto con un solo comando, lo que simplifica la creación de narraciones para vídeos de producto o demos internas sin depender de servicios en la nube.
- **Integración en pipelines de CI/CD de audio**: al ejecutarse en CPU o en GPUs de consumo y distribuirse como contenedor versionado con hash SHA-256 verificable, encaja en flujos de build que regeneran activos de voz de forma reproducible.
- **Despliegue en estaciones de trabajo sin PyTorch**: el motor Triton con kernels `nbxtensor` permite ejecutar el modelo en entornos donde instalar PyTorch no es viable o no está permitido, manteniendo el mismo resultado.
- **Procesamiento por lotes en hardware heterogéneo**: la planificación automática entre varias GPUs, streaming o host facilita colas de síntesis en máquinas con recursos mixtos, por ejemplo un servidor con varias GPUs de distinta generación.
- **Investigación en TTS con hardware propio**: al ser un contenedor MIT del modelo chatterbox, sirve como base reproducible para experimentos de evaluación de calidad de voz sin depender de infraestructura ajena.
- **Generación de voz en local con requisitos de privacidad**: al ejecutarse íntegramente en la máquina del usuario, el texto de entrada no sale del entorno, lo que resulta adecuado para prototipos con contenido sensible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El contenedor ocupa 2,2 GB en disco, pero la model card no desglosa el consumo de memoria en ejecución.
- GPUs recomendadas: no se especifican modelos concretos; el motor soporta GPUs NVIDIA y GPUs de Apple con Metal.
- Compatibilidad con GPU de consumo: no confirmada explícitamente, aunque el discurso del proyecto («on the hardware you already own») y el soporte de CPU y Metal apuntan a que el modelo cabe en equipos de consumo; no hay cifras que lo verifiquen.
- Opciones de despliegue: `neurobrix` (motor propio) con backend PyTorch o backend Triton (`nbxtensor`); no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Neurobrix/chatterbox-nbx | no disponible | no disponible | MIT | Hugging Face (contenedor `.nbx`, 2,2 GB) | Empaquetado de chatterbox para el motor NeuroBrix |
| ResembleAI/chatterbox | no disponible en la información proporcionada | no disponible | MIT | Hugging Face (modelo original) | Modelo de referencia que el contenedor reproduce |
| Otras alternativas TTS | no disponible | no disponible | no disponible | no disponible | No se han identificado comparables en la información disponible |

## Limitaciones y advertencias

- La model card remite a la ficha original de ResembleAI para las limitaciones de uso, sesgos y riesgos de alucinación del modelo; no se detallan aquí.
- No se especifican los idiomas soportados, lo que impide garantizar calidad en castellano sin verificación empírica.
- El repositorio no registra descargas ni valoraciones: no hay evidencia pública de validación por terceros.
- La licencia MIT permite uso comercial, pero conviene revisar la ficha del modelo original por si existieran condiciones adicionales sobre el uso de la voz sintética o de datos de entrenamiento.
- El artefacto depende del ecosistema NeuroBrix (`pip install neurobrix`); no es un formato portable a otros motores de inferencia sin conversión.
- La fecha de creación (noviembre de 2026) y la ausencia de métricas publicadas aconsejan tratarlo como un paquete reciente y poco contrastado en producción.
- No se dispone de información sobre latencia, throughput ni consumo de memoria, factores críticos para dimensionar un despliegue.

## Enlaces

- Repositorio del contenedor: https://huggingface.co/Neurobrix/chatterbox-nbx
- Modelo original: https://huggingface.co/ResembleAI/chatterbox
- Descarga directa del contenedor: https://huggingface.co/Neurobrix/chatterbox-nbx/blob/main/chatterbox.nbx
- Página del modelo en el hub de NeuroBrix: https://neurobrix.org/models/ResembleAI/chatterbox
- GitHub de NeuroBrix: https://github.com/NeuroBrix
- Kernels nbxtensor: https://github.com/NeuroBrix/nbxtensor
- Documentación: https://docs.neurobrix.org
- Hub: https://neurobrix.org
- YouTube: https://www.youtube.com/@NeuroBrix
