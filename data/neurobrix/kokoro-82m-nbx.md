# Neurobrix/Kokoro-82M-nbx

## Resumen

Kokoro-82M-nbx es un contenedor `.nbx` del modelo de síntesis de voz Kokoro-82M, desarrollado originalmente por hexgrad y empaquetado por Neurobrix para su ejecución en el motor de inferencia NeuroBrix. No se trata de un modelo nuevo ni de un fine-tune: los pesos y la licencia son los del modelo original Apache 2.0. El contenedor incluye el grafo de cómputo, los pesos, la topología de componentes y los valores por defecto de ejecución necesarios para que el motor NeuroBrix lo ejecute sin configuración adicional.

El modelo subyacente es un TTS de 82 millones de parámetros, una cifra notablemente pequeña para la categoría, lo que lo sitúa en el rango de modelos desplegables en hardware de consumo e incluso en CPU. La relevancia de este empaquetado reside en la portabilidad: el mismo contenedor puede planificarse sobre una o varias GPU NVIDIA, GPU de Mac (Metal) o CPU, con dos backends intercambiables (PyTorch o Triton puro mediante kernels nbxtensor).

La información publicada por el autor no detalla arquitectura interna, idiomas soportados ni resultados de benchmarks; esta ficha se limita a lo que la model card y los metadatos de Hugging Face declaran explícitamente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo TTS; el contenedor empaqueta grafo de cómputo y pesos del original) |
| Parametros totales | 82M (según denominación del modelo original) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible en la información proporcionada |
| Licencia | Apache 2.0 |
| Formato de pesos | contenedor `.nbx` (370 MB); pesos originales en el repositorio base `hexgrad/Kokoro-82M` |
| Backends de ejecución | PyTorch o Triton (kernels nbxtensor, sin PyTorch) |
| Hardware soportado | GPU NVIDIA, GPU Mac (Metal), CPU |
| Pipeline | text-to-speech |
| SHA-256 del contenedor | `96502026c5e788fe47b02ea206c4a443a6234289f002e6975e41c8c3fa00c797` |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna del modelo original ni los datos de entrenamiento. Lo que sí se especifica es el mecanismo de empaquetado: el contenedor `.nbx` contiene el grafo de cómputo del modelo, sus pesos, la forma en que se conectan sus componentes y los valores por defecto de runtime. NeuroBrix actúa como planificador de ejecución, distribuyendo las distintas partes del modelo entre las GPU y la memoria disponibles (una GPU, varias, streaming o host).

El motor ofrece dos rutas de ejecución: una basada en PyTorch y otra basada en Triton puro que no requiere PyTorch, usando kernels nbxtensor certificados por clase de GPU. Cualquier detalle sobre el entrenamiento del modelo original (composición del dataset, número de tokens, etapas de alineación) debe consultarse en la model card de `hexgrad/Kokoro-82M`, que la card de Neurobrix referencia explícitamente como fuente de verdad.

## Capacidades

- Síntesis de voz (text-to-speech) a partir de texto de entrada, con salida a fichero WAV mediante el flag `--output`.
- Ejecución local sin dependencia de servicios en la nube, sobre GPU NVIDIA, GPU de Mac o CPU.
- Ejecución con backend PyTorch o con backend Triton sin PyTorch (kernels nbxtensor).
- Planificación automática de recursos: distribución del modelo entre una o varias GPU, con streaming o ejecución en host.
- Interfaz de línea de comandos simple (`neurobrix import`, `neurobrix run`) para importación y ejecución.
- No se documentan en la información disponible capacidades de clonación de voz, control de prosodia, multilingüismo, tool calling ni agentes.

## Casos de uso

- Generación de locuciones para prototipos y demos: con un contenedor de 370 MB y soporte de CPU, se puede integrar la síntesis de voz en un pipeline de desarrollo sin aprovisionar GPU dedicada, generando ficheros WAV desde la CLI.
- Narración de contenido en aplicaciones de escritorio: al ejecutarse sobre Metal en Mac, encaja en herramientas nativas de macOS que necesiten TTS local sin enviar texto a terceros.
- Sistemas de accesibilidad offline: lectura en voz alta de texto en entornos sin conectividad o con requisitos de privacidad, aprovechando la ejecución local en CPU o GPU de consumo.
- Automatización de pruebas de audio: generación programática de clips de voz para suites de test de pipelines de audio, con resultados reproducibles a partir del mismo contenedor y hash SHA-256.
- Preprocesado de datasets de voz: creación de pares texto-audio sintéticos para aumentar corpus de entrenamiento o evaluación de sistemas ASR.
- Despliegue en flotas heterogéneas: al planificar la ejecución según el hardware disponible, el mismo contenedor sirve tanto en servidores con varias GPU NVIDIA como en estaciones de trabajo con GPU de consumo o Mac.
- Integración en CI/CD: la importación y ejecución vía CLI permite incluir la síntesis de voz como paso automatizado en pipelines de build y validación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de calidad de síntesis (MOS, WER, RTF) ni comparativas con otros sistemas TTS.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el contenedor ocupa 370 MB en disco y el modelo declara 82M de parámetros, lo que sugiere una huella de memoria reducida, pero no se publican cifras de VRAM en inferencia.
- GPU recomendadas: no se especifican modelos concretos. El motor soporta GPU NVIDIA, GPU de Mac (Metal) y CPU.
- GPU de consumo: no se confirma compatibilidad con modelos concretos (RTX 4090, etc.); por el tamaño del modelo y el soporte de CPU, es plausible que quepa en GPU de consumo, pero no está documentado.
- Opciones de despliegue: motor NeuroBrix (`pip install neurobrix`), con backend PyTorch o backend Triton (kernels nbxtensor). No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Kokoro-82M-nbx (este) | 82M | no disponible | Apache 2.0 | contenedor `.nbx` | Empaquetado NeuroBrix con planificación multi-GPU y backend Triton |
| hexgrad/Kokoro-82M | 82M | no disponible | Apache 2.0 | pesos originales (formato no detallado en la información disponible) | Modelo base; misma arquitectura y pesos |
| Otros modelos TTS | no disponible | no disponible | no disponible | no disponible | No se dispone de datos de terceros en la información proporcionada |

La única comparación documentada es con el propio modelo base, del que este contenedor es un envoltorio funcionalmente equivalente en cuanto a pesos y licencia.

## Limitaciones y advertencias

- La model card no documenta sesgos, tasas de alucinación ni limitaciones de idioma; esas advertencias remiten a la card del modelo original `hexgrad/Kokoro-82M` y se aplican sin cambios.
- El repositorio no declara idiomas soportados, lo que impide garantizar cobertura multilingüe sin consultar la fuente original.
- No se publican métricas de calidad de síntesis ni de rendimiento; cualquier decisión de producción basada en calidad objetiva requiere evaluación propia.
- El contenedor depende del motor NeuroBrix y de su CLI; no es directamente utilizable en otros runtimes sin conversión.
- El backend Triton requiere kernels nbxtensor certificados por clase de GPU, lo que puede limitar el hardware soportado en esa ruta.
- Licencia Apache 2.0 permite uso comercial, pero debe verificarse la procedencia de los datos de entrenamiento del modelo original para cumplir con requisitos de atribución.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia comunitaria de uso en producción.

## Enlaces

- Hugging Face (contenedor): https://huggingface.co/Neurobrix/Kokoro-82M-nbx
- Modelo original: https://huggingface.co/hexgrad/Kokoro-82M
- Repositorio NeuroBrix: https://github.com/NeuroBrix
- Kernels nbxtensor: https://github.com/NeuroBrix/nbxtensor
- Hub NeuroBrix: https://neurobrix.org
- Página del modelo en NeuroBrix: https://neurobrix.org/models/hexgrad/Kokoro-82M
- Documentación: https://docs.neurobrix.org
- YouTube: https://www.youtube.com/@NeuroBrix
