# rickye26/pplx-decider-flash-v1.2-q8

## Resumen

`rickye26/pplx-decider-flash-v1.2-q8` es un paquete de pesos cuantizados a 8 bits del modelo de decisión `perplexity-ai/pplx-decider-flash-v1.2`, cuyo origen arquitectónico es `Qwen/Qwen3.5-4B`. No se trata de un modelo nuevo ni de un ajuste fino: es una conversión de formato, sin entrenamiento adicional, pensada para ejecutarse en el navegador mediante el runtime WebGPU "Decisive" (commit `21ceed8aca3712a11616fa60817bc2134267daf6`). El repositorio ocupa 4,5 GB, de los cuales 4.490.404.034 bytes (4,182 GiB) corresponden al conjunto de ficheros del runtime.

El interés de esta publicación es doble. Por un lado, demuestra un formato de cuantización propio (`q8-w8a8-e8-r8-g64`) que no es GGUF, GPTQ, AWQ ni safetensors, con matrices del decodificador en Q8 con signo agrupadas de 64 en 64 y una escala FP32 por grupo, lo que da 8,5 bits efectivos por peso. Por otro, valida la viabilidad de servir un modelo de ~4B en un contexto de navegador seguro con WebGPU, `shader-f16` y streaming de capas.

El modelo subyacente es un "decider": incorpora una cabeza de lectura de decisión (`decision readout`) de 255 × 2.560 valores, es decir, 255 salidas de decisión sobre un espacio oculto de 2.560 dimensiones. La model card menciona un caso de demostración de privacidad, pero advierte explícitamente de que la puntuación de esa demo no garantiza que un mensaje sea seguro de compartir. No se publican resultados de benchmarks ni evaluación de calidad de inferencia de esta release.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (heredada de Qwen3.5-4B); pesos empaquetados en formato Decisive `q8-w8a8-e8-r8-g64` con cabeza de decisión de 255 clases |
| Parametros totales | No disponible explícitamente; el modelo base se denomina Qwen3.5-4B |
| Parametros activos | No aplica (no se indica que el modelo base sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q8 con signo, grupos de 64, escala FP32 simétrica por grupo (8,5 bits efectivos/peso); existe una release hermana Q4-E4 del mismo autor |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 (se preservan `LICENSE` y `NOTICE` del upstream) |
| Formato de pesos | Binario propio del runtime Decisive (`packed-q8-e8.json` como índice); no es GGUF, GPTQ, AWQ ni safetensors cargable por Transformers |
| Tamano del repositorio | 4,5 GB (4.490.404.034 bytes / 4,182 GiB de ficheros de runtime) |
| Dimension oculta | 2.560 (filas de embedding de 2.560 valores, 2.720 bytes por fila) |
| Dimension de la cabeza de decision | 255 × 2.560 valores |
| Numero de ficheros | 32 ficheros de capa, 1 de embeddings, 1 de readout, 1 de norm, mas índice, tokenizer y configuración |
| Precisión de tensores no decodificados | BF16 (bytes originales) para el resto de tensores del decoder y la norm final |
| Modelo base | perplexity-ai/pplx-decider-flash-v1.2, revisión `6d771ad7b5ecff5e93b8fc7b90d4c5ccc341954d` |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-10-24 |

## Arquitectura y entrenamiento

La arquitectura es la del checkpoint original `perplexity-ai/pplx-decider-flash-v1.2`, que a su vez deriva de `Qwen/Qwen3.5-4B` (revisión `851bf6e806efd8d0a36b00ddf55e13ccb7b8cd0a`, según el `NOTICE` upstream sin modificar). El `config.json` en BF16 describe esa arquitectura de origen, pero el almacenamiento real lo especifica `packed-q8-e8.json`. No hay entrenamiento adicional en esta release: los cambios son cuantización, empaquetado y documentación. Los ficheros de configuración y tokenizer son idénticos a los del upstream.

El esquema de cuantización es simétrico de máximo absoluto, sin datos de calibración, con redondeo *ties-to-even* e enteros de −127 a 127 almacenados como bytes en complemento a dos. Cada grupo almacena 64 bytes de códigos seguidos de una escala FP32 little-endian (68 bytes totales por grupo). Las matrices del decodificador usan este layout; los embeddings y la cabeza de decisión también; el resto de tensores del decoder y la norm final conservan los bytes BF16 originales. En ejecución, las activaciones de proyección se cuantizan a 8 bits y los productos escalares por grupo se calculan con parciales en FP32, sin necesidad de instrucciones de dot product entero empaquetado.

La validación realizada verificó hashes de origen y de cada fichero empaquetado, formas de tensor y rangos de bytes, además de 927 comprobaciones escalares independientes contra la fuente BF16 (muestras y tensores no modificados). Estas comprobaciones acreditan consistencia de empaquetado y cuantización, no una evaluación completa de inferencia ni de calidad del modelo.

## Capacidades

- Emisión de decisiones: la cabeza de readout produce 255 valores de decisión, lo que sitúa al modelo en la categoría de modelos de decisión más que de generación abierta de texto.
- Ejecución en navegador: integración con el runtime Decisive mediante `loadFlash(api, files, onProgress, 'webgpu', { mode: 'q8-e8' })` y llamada `engine.predict(request, 1024)`.
- Streaming de capas: el modo por defecto usa dos buffers de capa y permite servir los pesos por HTTP con soporte de byte ranges en lugar de descargarlos completos en memoria.
- Inferencia local sin servidor: los pesos se verifican contra el manifiesto de release (SHA-256) antes de cargarse.
- Cuantización de activaciones a 8 bits en tiempo de ejecución, con acumulación FP32.
- Capacidades de generación de texto, razonamiento, código, matemáticas, visión, tool calling o agentes: no disponibles en la información proporcionada (dependen de la model card upstream, no incluida).
- Soporte multilingüe: no disponible.

## Casos de uso

- Clasificación y filtrado en el cliente: desplegar el modelo en una aplicación web para puntuar o clasificar contenido localmente, sin enviar el texto a un servidor, aprovechando el runtime WebGPU y el formato Q8 empaquetado.
- Moderación previa en demos de privacidad: el upstream incluye una demo de privacidad; este paquete permite ejecutarla íntegramente en el navegador con los pesos verificados por hash. Conviene recordar la advertencia de la model card: una puntuación de la demo no garantiza que un mensaje sea seguro de compartir.
- Prototipado rápido de modelos de decisión: investigadores que quieran evaluar el comportamiento del decider sin montar infraestructura de GPU, usando el navegador como entorno de ejecución con `shader-f16`.
- Aplicaciones PWA y offline: el modo streaming con dos buffers de capa permite servir los 4,49 GB desde un origen con byte ranges y mantener un uso de memoria contenido, adecuado para entornos con recursos limitados.
- Comparación de regímenes de cuantización: al existir una release Q4-E4 del mismo modelo, este paquete Q8 permite medir la degradación de decisiones entre 4 y 8 bits sobre la misma arquitectura y el mismo runtime.
- Integración en pipelines de verificación: el manifiesto `release-manifest.json` y `SHA256SUMS` permiten auditar la procedencia de los pesos y el commit del exportador en un flujo de CI que valide artefactos antes de publicarlos.
- Investigación sobre cuantización sin calibración: el esquema de máximo absoluto con grupos de 64 y escalas FP32 sirve como caso de estudio reproducible (`export-webgpu-q8`) para analizar el impacto de la cuantización simétrica en un decoder de ~4B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no se formula ninguna nueva afirmación de precisión o velocidad: la cuantización puede alterar puntuaciones y decisiones, y aunque Q8 se mantiene más cerca de la fuente BF16 que Q4, no se aportan métricas comparativas. Las 927 comprobaciones escalares documentadas son verificaciones de empaquetado, no una evaluación de calidad.

## Requisitos de hardware

- VRAM estimada: no disponible como cifra oficial. Como referencia de orden de magnitud, el conjunto de pesos empaquetados son 4,182 GiB; en modo residente habría que sumar activaciones, buffers del runtime y overhead del navegador, por encima de esos 4,182 GiB.
- Modo streaming (por defecto, `resident: false`): mantiene dos buffers de capa, reduciendo el pico de memoria a costa de leer los pesos en cada petición. Cada petición en streaming lee aproximadamente el doble de bytes del decodificador que la release Q4-E4.
- Requisitos de plataforma: contexto seguro (HTTPS), WebGPU disponible, extensión `shader-f16` y recursos de dispositivo suficientes. La model card advierte de que la disponibilidad genérica de WebGPU no garantiza que el modelo quepa ni se ejecute bien en cualquier teléfono.
- GPU de escritorio recomendadas: no disponibles en la información proporcionada. El runtime está orientado a WebGPU, no a CUDA, por lo que no se documentan A100, H100 ni RTX 4090.
- GPU de consumo: no confirmado. La documentación solo indica que no debe asumirse que funcione en móviles de gama media o baja.
- Opciones de despliegue: runtime Decisive (WASM + WebGPU) con build que incluya las features `pplx-flash,wasm,webgpu,pplx-webgpu`; no compatible con vLLM, llama.cpp, Ollama ni TGI, al no ser GGUF ni safetensors.
- Latencia y throughput: no disponibles; no se han publicado cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| rickye26/pplx-decider-flash-v1.2-q8 | Base Qwen3.5-4B (recuento no detallado) | No disponible | Decisive `q8-w8a8-e8-r8-g64`, 8,5 bits efectivos | Apache 2.0 | Objeto de esta ficha; 4,49 GB |
| perplexity-ai/pplx-decider-flash-v1.2 (BF16) | Base Qwen3.5-4B (recuento no detallado) | No disponible | Safetensors BF16 (configuración original) | Apache 2.0 | Fuente de referencia; máxima fidelidad, mayor tamaño |
| Release hermana Q4-E4 del mismo autor | Base Qwen3.5-4B | No disponible | Decisive Q4, 4 bits | Apache 2.0 | Menor tamaño y menor lectura por petición; mayor alejamiento del BF16 |
| Qwen/Qwen3.5-4B | ~4B (por denominación) | No disponible | Safetensors | No disponible en la información | Modelo base arquitectónico del decider |

La información disponible no permite comparar rendimiento entre estas variantes: no hay benchmarks del decider ni del Qwen3.5-4B en el material proporcionado.

## Limitaciones y advertencias

- No es un modelo de propósito general listo para chat: la salida es una cabeza de decisión de 255 valores; los usos previstos y las limitaciones reales están en la model card upstream, que no se incluye en esta información.
- La cuantización puede cambiar puntuaciones y decisiones. Q8 se mantiene más próximo al BF16 que Q4, pero no se aporta ninguna garantía cuantitativa de equivalencia.
- Las 927 comprobaciones escalares validan empaquetado y consistencia de cuantización, no la calidad de inferencia ni el comportamiento en producción.
- La puntuación de la demo de privacidad no garantiza que un mensaje sea seguro de compartir; es una advertencia explícita del autor.
- Sin datos de sesgos, alucinación, idiomas soportados ni longitud de contexto; no pueden evaluarse con la información disponible.
- Compatibilidad estricta: no se puede cargar con Transformers, llama.cpp, Ollama, vLLM ni TGI. Requiere el runtime Decisive en el commit indicado y un build WASM con las features correspondientes.
- Dependencia de plataforma: contexto seguro, WebGPU y `shader-f16`. El rendimiento en móviles no está garantizado y puede degradarse o fallar por falta de recursos.
- El campo `revision` del índice identifica la fuente upstream, no el commit de esta release; los consumidores deben fijar además el SHA de este repositorio.
- Licencia Apache 2.0 permite uso comercial, pero se deben preservar `LICENSE` y `NOTICE` del upstream; conviene revisar las condiciones del modelo base Qwen3.5-4B y del checkpoint de Perplexity, que no se detallan aquí.
- Repositorio sin descargas ni likes y creado en 2026-10-24: sin validación comunitaria ni informes independientes de funcionamiento.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/rickye26/pplx-decider-flash-v1.2-q8
- Modelo base (Perplexity): https://huggingface.co/perplexity-ai/pplx-decider-flash-v1.2
- Modelo base arquitectónico (Qwen): https://huggingface.co/Qwen/Qwen3.5-4B
- Runtime y exportador Decisive: https://github.com/hyperlogue/dicisive
- No se han encontrado enlaces adicionales relevantes (papers, blogs o demos) en la búsqueda web realizada.
