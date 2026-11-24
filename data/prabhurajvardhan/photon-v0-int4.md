# prabhurajvardhan/photon-v0-int4

## Resumen

Photon v0 (etiquetado como `v0-beta`) es un modelo compacto desarrollado por Nanoware AI, distribuido en formato ONNX con cuantización INT4 y un peso total de 48,62 MB. No es un modelo de propósito general, sino un motor de parches («patch engine») especializado en la reparación automática de errores de compilación y ejecución en Python y TypeScript. Se distribuye a través de Hugging Face bajo el identificador `prabhurajvardhan/photon-v0-int4` y se integra con una CLI de GitHub, un slicer de AST y un servidor MCP (Model Context Protocol).

Su relevancia actual radica en la combinación de un tamaño extremadamente reducido (menos de 50 MB), ejecución local en CPU con velocidades de decodificación de entre 60 y 79 tokens por segundo en x86_64 con 4 hilos, y un enfoque de producto muy concreto: corregir errores de código en el flujo de desarrollo sin depender de una API remota. La arquitectura subyacente no está especificada en la información disponible; solo se documenta el formato de despliegue (ONNX Runtime) y la cuantización (INT4 con `block_size=32`).

El modelo se publica bajo una licencia propia denominada `photon-weights-v0`, que permite uso personal, académico, open source y desarrollo interno en empresas, pero restringe la redistribución comercial, la reventa como API alojada y el white-labeling sin una licencia comercial de Nanoware AI.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible (peso INT4 de 48,62 MB) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (decodificación medida con KV cache de hasta 281 tokens) |
| Tipos de cuantizacion | INT4 con `block_size=32` |
| Idiomas soportados | en, code (Python y TypeScript) |
| Licencia | photon-weights-v0 (propietaria; uso comercial restringido) |
| Formato de pesos | ONNX (ejecutable con onnxruntime) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo (tipo de transformer, número de capas, dimensión oculta, mecanismo de atención) ni sobre el proceso de entrenamiento (número de tokens, composición del dataset, uso de RLHF o DPO). La model card únicamente documenta el artefacto de despliegue: un grafo ONNX cuantizado a INT4 con bloques de 32 elementos, pensado para inferencia local en CPU y GPU.

La innovación técnica destacable no reside en la arquitectura del modelo en sí, sino en el sistema que lo rodea: una CLI (`nanoware-photon`) que recibe un fichero, un número de línea y un mensaje de error, aplica el parche generado con la opción `--apply`, y se apoya en un AST slicer para aislar el contexto relevante del código. El modelo se expone además como servidor MCP, lo que permite integrarlo en agentes y entornos de desarrollo compatibles con dicho protocolo.

## Capacidades

- Reparación de errores de compilación y ejecución en Python y TypeScript.
- Generación de parches de código a partir de un error, una línea y un contexto de fichero.
- Integración con AST slicing para seleccionar el fragmento de código relevante antes de la inferencia.
- Exposición como servidor MCP para su uso por agentes y herramientas de desarrollo.
- Ejecución local-first, sin dependencia de API remota.
- Inferencia en CPU con KV cache para secuencias de hasta 281 tokens.
- Soporte de decodificación en GPU (medido en NVIDIA T4 con FP16).
- No se documentan capacidades de razonamiento general, matemáticas, visión, audio ni tool calling genérico más allá del flujo de reparación descrito.

## Casos de uso

- Reparación automática en el flujo de desarrollo: un desarrollador ejecuta `photon fix app.py --line 42 --err "NameError: name 'requests' is not defined" --apply` y el modelo genera y aplica el parche directamente sobre el fichero, sin salir del terminal.
- Integración en pipelines de CI/CD: ante un fallo de compilación o de tests, el pipeline invoca el modelo con el error y la línea afectada para proponer un parche que se revisa o aplica automáticamente en una rama de corrección.
- Asistencia en editores y agentes vía MCP: al exponerse como servidor MCP, el modelo puede ser consumido por agentes de codificación que necesiten una herramienta especializada y ligera de reparación de errores.
- Entornos con restricciones de red o privacidad: al ejecutarse localmente con un peso de 48,62 MB, es adecuado para equipos que no pueden enviar código a APIs externas.
- Formación y prototipado: su reducido tamaño y su velocidad en CPU (60-79 tok/s en x86_64 con 4 hilos) permiten desplegarlo en portátiles y máquinas sin GPU para experimentar con flujos de reparación automática.
- Estandarización de correcciones en equipos: centralizar la reparación de errores recurrentes de Python y TypeScript en una herramienta común con comportamiento determinista y auditable.
- Despliegue en servidores modestos: la variante GPU alcanza 727,4 tok/s en una NVIDIA T4 en FP16, lo que permite atender peticiones de reparación en un servicio interno con hardware de gama baja.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. Los únicos datos de rendimiento medidos que aporta la model card son de inferencia:

| Metrica | Valor | Condiciones |
|---|---|---|
| Huella del modelo | 48,62 MB | INT4, `block_size=32` |
| Decodificacion en CPU | 60,0 - 79,0 tok/s | x86_64, 4 hilos, KV cache, <=281 tokens |
| Decodificacion en GPU | 727,4 tok/s | NVIDIA T4, FP16 |

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; el peso INT4 ocupa 48,62 MB, por lo que la mayor parte del consumo provendrá del runtime ONNX y del KV cache, no de los pesos.
- GPU recomendadas: NVIDIA T4 es la única GPU con throughput documentado (727,4 tok/s en FP16); no se especifican otras.
- Cabe en cualquier GPU consumer actual e incluso en entornos sin GPU, ya que el modo principal documentado es CPU.
- Opciones de despliegue: ONNX Runtime (librería declarada), CLI `nanoware-photon` y servidor MCP. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 60,0-79,0 tok/s en CPU x86_64 con 4 hilos y 727,4 tok/s en NVIDIA T4 FP16, según las mediciones del autor.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría (motores de reparación de código de tamaño reducido en formato ONNX/INT4), por lo que no es posible establecer una comparación rigurosa de parámetros, contexto, rendimiento o licencia.

## Limitaciones y advertencias

- Ámbito muy restringido: el modelo está diseñado para reparar errores de Python y TypeScript, no como modelo de propósito general.
- Idiomas limitados a inglés y código; no se documenta soporte de castellano ni de otros idiomas naturales.
- Longitud de contexto no especificada; las mediciones de decodificación se limitan a 281 tokens con KV cache, lo que sugiere un contexto efectivo corto.
- Arquitectura, número de parámetros y datos de entrenamiento no disponibles, lo que dificulta evaluar sesgos y robustez.
- Riesgo de alucinación inherente a cualquier modelo generativo de código: los parches propuestos deben revisarse antes de aplicarse en producción.
- Licencia restrictiva: el uso comercial directo está permitido solo para desarrollo interno; la redistribución comercial, la reventa como API alojada y el white-labeling requieren licencia comercial de Nanoware AI.
- Estado beta (`v0-beta`) y repo con 0 descargas en el momento de la consulta: madurez y soporte de la comunidad no verificables.
- No se documentan garantías de calidad ni evaluaciones independientes del modelo.

## Enlaces

- Hugging Face: https://huggingface.co/prabhurajvardhan/photon-v0-int4
- Repositorio GitHub (CLI, AST Slicer y servidor MCP): https://github.com/prabhurajvardhan/Photon
- Licencia: `LICENSE.md` en el repositorio de Hugging Face
