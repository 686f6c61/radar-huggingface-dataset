# muhammedekinci/ema-lightning-safe

## Resumen

EMA Lightning Safe es un fork endurecido de EMA Lightning, un modelo de síntesis de voz (text-to-speech) para turco desarrollado originalmente por Canberk Aslan. El modelo apenas cuenta con 8,6 millones de parámetros, lo que lo sitúa en la categoría de modelos ultraligeros orientados a inferencia de baja latencia y despliegue en hardware modesto. La arquitectura emplea flow matching para la generación acústica, junto con un decodificador vocacional separado.

La aportación de este fork no reside en el modelo en sí, sino en el empaquetado y la cadena de carga: sustituye los checkpoints en formato pickle de PyTorch por ficheros safetensors, elimina cualquier uso de `torch.load` o deserialización de pickle, fija hashes SHA-256 verificados antes de cada carga y suprime por completo las descargas de red en tiempo de ejecución. El resultado es un paquete apto para entornos con políticas estrictas de seguridad, despliegues air-gapped o pipelines donde no se permite ejecutar código arbitrario durante la carga de pesos.

Es relevante ahora porque los formatos pickle siguen siendo un vector de ejecución de código arbitrario en la cadena de suministro de modelos, y este fork demuestra un patrón de endurecimiento reproducible: conversión verificada tensor a tensor, pinning de integridad y dependencia de `torch>=2.10` para cubrir CVE-2025-32434 y CVE-2026-24747. El modelo y el audio producido son idénticos al upstream.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Flow matching para generación acústica con decodificador vocacional separado (detalles de capas no disponibles) |
| Parametros totales | 8,6 millones (105 tensores acústicos + 232 tensores del decodificador) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | turco (tr) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`ema.safetensors`, `decoder.safetensors`) con SHA-256 fijado en el paquete |

## Arquitectura y entrenamiento

El modelo emplea flow matching como mecanismo de generación acústica, una formulación de modelos generativos que aprende un campo vectorial que transporta ruido hacia la distribución de audio objetivo mediante una EDO. La síntesis se completa con un decodificador vocacional independiente que convierte la representación acústica en forma de onda a 48 kHz. El paquete expone dos rutas de inferencia: `say()` para generar audio completo y `stream()` para emitir fragmentos conforme se producen, con un planificador interno (Playhead) que agrupa las peticiones concurrentes de varios hilos en lotes sobre GPU.

No se dispone de información sobre el volumen de datos de entrenamiento, la composición del corpus, ni si se aplicaron técnicas de RLHF o DPO. El fork no modifica el modelo: los 105 tensores acústicos y 232 del decodificador se compararon uno a uno contra los checkpoints originales y resultaron bit-idénticos, al igual que la configuración y el vocabulario. La innovación técnica del fork es de empaquetado: conversión a safetensors mediante `tools/convert_to_safetensors.py`, verificación de integridad SHA-256 antes del parseo, cabecera JSON con identificador `ema-lightning-safetensors/1` y tipo (`acoustic` o `decoder`), y una ruta rápida `.lightning()` que compila el modelo y graba CUDA graphs en el arranque para GPUs NVIDIA.

## Capacidades

- Síntesis de voz en turco a partir de texto, con salida mono float32 en el rango −1…1.
- Frecuencias de muestreo seleccionables: 48.000, 24.000, 16.000 y 8.000 Hz.
- Control de velocidad de habla entre 0,25x y 4x.
- Reproducibilidad mediante semilla: la misma semilla produce el mismo audio en el mismo dispositivo.
- Generación por lotes: `say()` acepta una lista de textos y escribe un fichero por elemento.
- Streaming de audio: `stream()` emite fragmentos conforme se generan, apto para altavoces, llamadas telefónicas o aplicaciones en vivo.
- Alineación a nivel de palabra: el objeto `Speech` incluye `words` con tiempos de inicio y fin de cada palabra pronunciada, útil para subtítulos.
- Concurrencia multihilo con planificación por lotes sobre GPU.
- Ruta acelerada `.lightning()` con compilación y CUDA graphs para GPUs NVIDIA.
- No soporta tool calling, agentes, visión, audio de entrada ni modo de razonamiento.

## Casos de uso

- Despliegue en entornos air-gapped: el paquete lee exclusivamente de un directorio local y no realiza ninguna petición de red, por lo que puede instalarse en infraestructuras aisladas donde las descargas desde el Hub están prohibidas. La verificación SHA-256 previa al parseo garantiza la integridad de los pesos.
- Cumplimiento de políticas de seguridad de cadena de suministro: al eliminar `torch.load` y cualquier deserialización de pickle, el modelo es apto para organizaciones que bloquean la carga de checkpoints pickle por riesgo de ejecución de código arbitrario. Es el escenario principal de este fork.
- Atención al cliente telefónica automatizada: `stream()` permite emitir audio conforme se genera, reduciendo el tiempo hasta el primer fragmento audible en una llamada, con control de velocidad para ajustar la locución al ritmo deseado.
- Generación de locuciones por lotes: `say()` acepta listas de textos y escribe ficheros WAV independientes, lo que encaja en pipelines de producción de voiceovers, audiolibros o avisos masivos sin intervención manual.
- Subtitulado y accesibilidad: la alineación por palabra con marcas temporales de inicio y fin permite generar subtítulos sincronizados o resaltados de texto a partir del audio sintetizado.
- Sistemas de anuncios y avisos dinámicos en turco: lectura de importes, fechas y horas (el ejemplo de la model card incluye una fecha y una cifra monetaria) para aplicaciones de banca, transporte o administración pública.
- Prototipado en hardware de consumo: con 8,6 millones de parámetros, el modelo cabe holgadamente en GPUs de gama media y permite iterar en estaciones de trabajo sin aceleradores de datacenter.
- Integración en aplicaciones interactivas en vivo: el planificador Playhead agrupa peticiones concurrentes de varios hilos en lotes sobre GPU, lo que permite servir a múltiples usuarios desde un único proceso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente reporta el tamaño del modelo (8,6 millones de parámetros), la frecuencia de muestreo de salida (48 kHz) y que las muestras de audio se generaron con `say()`, semilla 0 y una RTX 5070 Ti, sin cifras de latencia ni throughput.

## Requisitos de hardware

- VRAM estimada: no disponible en la información proporcionada. Con 8,6 millones de parámetros, el peso de los tensores en precisión nativa es del orden de decenas de megabytes, por lo que la huella en memoria es muy reducida; no se especifica el tipo de dato de los pesos.
- GPU recomendadas: la model card cita una RTX 5070 Ti para las muestras de audio y la ruta `.lightning()` está orientada a GPUs NVIDIA. No se detallan modelos concretos de datacenter (A100, H100).
- GPU de consumo: sí, cabe en GPUs de consumo; el modelo es explícitamente descrito como "tiny, fast and accurate" y las muestras se generaron en una RTX 5070 Ti. No se confirma compatibilidad con GPUs de gama de entrada.
- CPU: el paquete usa la GPU si está disponible; no se detalla el rendimiento en CPU.
- Opciones de despliegue: paquete Python propio (`ema_lightning`) instalable desde un wheel alojado en el repo, con API `EMA()`, `say()`, `stream()` y `.lightning()`. No se menciona soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles. La ruta `.lightning()` requiere decenas de segundos de arranque para compilar y grabar CUDA graphs, tras lo cual se reutiliza manteniendo el proceso vivo.
- Dependencias: `torch>=2.10` (obligatorio por CVE-2025-32434 y CVE-2026-24747), `numpy`, `safetensors` y `normalizer-tr`.

## Comparativa con modelos similares

| Modelo | Parámetros | Idioma | Formato de pesos | Licencia | Enfoque de seguridad |
|---|---|---|---|---|---|
| ema-lightning-safe (este fork) | 8,6 M | Turco | safetensors con SHA-256 fijado | Apache 2.0 | Sin pickle, sin red, integridad verificada |
| canberkkkkkk/ema-lightning (upstream) | 8,6 M | Turco | PyTorch pickle (`ema.pt`, `decoder.pt`) | Apache 2.0 | `torch.load(weights_only=True)`, descarga desde el Hub |
| Otros modelos TTS turcos | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación relevante es contra el propio upstream: misma arquitectura, mismos pesos bit-idénticos y misma licencia, con diferencias exclusivamente en el formato de serialización, la verificación de integridad, la ausencia de red y el requisito de `torch>=2.10`. No se dispone de información sobre otros modelos TTS en turco con los que establecer una comparación cuantitativa.

## Limitaciones y advertencias

- El modelo solo soporta turco; no se ha validado para otros idiomas y no dispone de capacidades multilingües.
- No hay información publicada sobre sesgos del corpus de entrenamiento, acento, género o variedad dialectal del turco cubierta.
- Riesgo de alucinación no aplicable en el sentido textual, pero sí de pronunciación incorrecta de números, siglas, nombres propios o palabras fuera del vocabulario; la model card no documenta el comportamiento en estos casos.
- No se especifica la longitud máxima de texto de entrada ni el comportamiento con textos largos.
- El fork exige `torch>=2.10`, lo que puede entrar en conflicto con entornos que tengan otras dependencias fijadas a versiones anteriores de PyTorch.
- La ruta `.lightning()` requiere un arranque de decenas de segundos y mantener el proceso vivo; no es adecuada para ejecuciones de un solo uso.
- El paquete no descarga pesos automáticamente: es obligatorio obtenerlos con `hf download` y verificar `SHA256SUMS` antes de instanciar `EMA(weights=...)`.
- Licencia Apache 2.0: permite uso comercial, modificación y redistribución con las obligaciones habituales de atribución y aviso de cambios. No se han identificado restricciones adicionales en la información disponible.
- El repositorio registra 0 descargas y 1 like en el momento de la consulta, y el tamaño reportado del repo es 0.0 GB; conviene verificar la disponibilidad real de los ficheros de pesos antes de integrarlo en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/muhammedekinci/ema-lightning-safe
- Modelo base (upstream): https://huggingface.co/canberkkkkkk/ema-lightning
- Guía de instalación (inglés): https://huggingface.co/muhammedekinci/ema-lightning-safe/blob/main/docs/install.md
- Guía de instalación (turco): https://huggingface.co/muhammedekinci/ema-lightning-safe/blob/main/docs/kurulum.md
- Wheel del paquete: https://huggingface.co/muhammedekinci/ema-lightning-safe/resolve/main/dist/ema_lightning_safe-1.1.2.post1-py3-none-any.whl
- Pesos y sumas de verificación: https://huggingface.co/muhammedekinci/ema-lightning-safe/resolve/main/SHA256SUMS
- Paper de referencia citado en los tags (arXiv:2405.14867): https://arxiv.org/abs/2405.14867
- Script de conversión a safetensors: https://huggingface.co/muhammedekinci/ema-lightning-safe/blob/main/tools/convert_to_safetensors.py
