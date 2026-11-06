# OmTheLast/LlamaJEE-4B-ONNX-WebGPU

## Resumen

LlamaJEE-4B-ONNX-WebGPU es una exportación del modelo Qwen3.5-4B (en su variante cuantizada a 4 bits del repositorio `mlx-community/Qwen3.5-4B-4bit`) al formato ONNX, empaquetada para ejecutarse íntegramente en el navegador mediante WebGPU a través del runtime propio LlamaJEE.js. El paquete incluye dos modos seleccionables: el modelo base sin modificar y un adaptador LoRA del paso 30 del proyecto LlamaJEE, orientado a tareas de tipo JEE (exámenes de ingeniería de la India). Lo publica el desarrollador Om Patnaik (OmTheLast) bajo licencia Apache 2.0.

El interés técnico del artefacto no está en el modelo en sí, sino en el pipeline de conversión: 32 grafos de decodificador, 16 cabezas de salida y 31 fragmentos de embedding que preservan la cuantización afín de 4 bits original, más 18 factores de adaptador transpuestos sin pérdida. El conjunto pesa 3.084.800.613 bytes (unos 3,08 GB), y el adaptador añade aproximadamente 1,70 MB. La inferencia se ejecuta en el navegador del visitante con ONNX Runtime y el tokenizador de Transformers.js, sin API ni servidor local.

Se trata de un checkpoint experimental: el autor declara explícitamente que la conversión al navegador no añade entrenamiento ni demuestra mejor precisión en JEE, y que las pruebas realizadas son comprobaciones de funcionalidad (Chrome 157 de escritorio sobre WebGPU Metal de Apple, entradas sintéticas de hasta 256 tokens), no benchmarks públicos ni validación en móviles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3.5), exportado a grafos ONNX personalizados |
| Parametros totales | 4B (heredados de Qwen3.5-4B); desglose exacto no disponible |
| Parametros activos | No aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Cuantizacion afín de 4 bits preservada del checkpoint MLX original; factores LoRA en precision nativa (tamano ~1,70 MB) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (32 grafos de decodificador, 16 cabezas de salida, 31 fragmentos de embedding); tokenizador via Transformers.js |

## Arquitectura y entrenamiento

El modelo subyacente es Qwen3.5-4B, un transformer decoder-only de 4.000 millones de parametros en su variante cuantizada a 4 bits publicada por la comunidad MLX (`mlx-community/Qwen3.5-4B-4bit`, revision `0e7ffd5c629ef7719d4cbc04069232580bfa9d9c`). Sobre esa base, el proyecto LlamaJEE entrena un adaptador LoRA; el paquete incluye los 18 factores correspondientes al paso 30, transpuestos sin pérdida desde el adaptador nativo con SHA-256 `242e26eb3d61d28983be4cd86fa136cc479fcf86a41e633b2875521523f171cb`. No se especifican en la informacion disponible el volumen de tokens de entrenamiento, la composicion del dataset ni si se emplearon RLHF o DPO.

La innovacion relevante es el proceso de exportacion: el modelo se descompone en multiples grafos ONNX (32 bloques de decodificador, 16 cabezas, 31 shards de embedding) que ONNX Runtime ejecuta directamente en WebGPU, mientras Transformers.js se encarga unicamente del tokenizador. El autor advierte que este paquete no es un `from_pretrained` estandar de Transformers.js. El runtime procesa los tokens del prompt uno a uno, lo que penaliza la latencia en preguntas largas. No se incluye codificador de imagen dinamico; esta version acepta solo texto.

## Capacidades

- Generacion de texto en el navegador mediante WebGPU, sin servidor ni clave de API.
- Dos modos seleccionables: base sin modificar y adaptador LoRA del paso 30 (JEE), reutilizando los mismos pesos base.
- Razonamiento y resolucion de preguntas de tipo examen (objetivo declarado del adaptador JEE), aunque la calidad no esta validada con benchmarks publicos.
- Ejecucion local con descarga de pesos desde Hugging Face y cache en el navegador.
- Soporte de cancelacion de inferencia y guarda de longitud de entrada en el runtime.
- Capacidades multilingues: no disponible (no se documentan idiomas).
- Tool calling, agentes, vision, audio y modo thinking: no disponibles en la informacion proporcionada.

## Casos de uso

- Demos educativas sin backend: un sitio estatico puede ofrecer un tutor de preguntas tipo examen ejecutando el modelo en el navegador del visitante, sin coste de GPU en servidor ni gestion de claves.
- Prototipado de aplicaciones LLM offline-first: util para validar UX de chat o generacion de texto antes de invertir en infraestructura, aprovechando que los pesos se cachean en CacheStorage o IndexedDB.
- Evaluacion de viabilidad de WebGPU en el parque de dispositivos de una organizacion: el paquete permite medir si los equipos objetivo soportan la carga de 3,08 GB y la inferencia token a token.
- Investigacion sobre cuantizacion y exportacion ONNX: sirve como referencia de como descomponer un transformer cuantizado en 4 bits en multiples grafos y preservar factores LoRA sin perdida.
- Distribucion de contenido interactivo en entornos restringidos: al no requerir API externa, encaja en redes corporativas o aulas con salida a Internet limitada una vez descargados los pesos.
- Comparacion de adaptadores sobre una misma base: el selector base/adaptador permite estudiar el efecto de un LoRA pequeno (~1,70 MB) sobre el comportamiento del modelo en el mismo runtime.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica expresamente que las pruebas realizadas son comprobaciones de funcionalidad (llamadas cortas dependientes con ambos modos, cancelacion, guarda de longitud y una entrada sintetica de 256 tokens en Chrome 157 de escritorio sobre WebGPU Metal de Apple), no un benchmark JEE ni una prueba de paridad completa entre nativo y navegador.

## Requisitos de hardware

- VRAM/espacio: la descarga son 3,08 GB, pero el autor advierte que el tamano de descarga no equivale al pico de memoria; el pico real no esta documentado.
- GPU: requiere un navegador con WebGPU funcional; validado solo en Chrome 157 de escritorio sobre Apple Metal WebGPU.
- GPU de consumo: no se han cualificado dispositivos de bajos recursos ni telefonos moviles.
- Despliegue: runtime propio LlamaJEE.js (carpeta `web` del repositorio) sobre ONNX Runtime Web con WebGPU; no es compatible como paquete estandar de Transformers.js `from_pretrained`. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; el autor senala que las preguntas largas pueden ser lentas porque el runtime procesa los tokens del prompt uno a uno.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato/ejecucion | Licencia | Notas |
|---|---|---|---|---|---|
| LlamaJEE-4B-ONNX-WebGPU | 4B (4 bits) | no disponible | ONNX + WebGPU en navegador | Apache 2.0 | Experimental; sin benchmarks publicados |
| Qwen3.5-4B (base, `mlx-community/Qwen3.5-4B-4bit`) | 4B (4 bits) | no disponible | MLX (Apple Silicon) | Apache 2.0 (segun el paquete base) | Mismo modelo sin adaptador; ejecucion nativa, no en navegador |
| LlamaJEE-4B-MLX-Step30 | 4B (4 bits) | no disponible | MLX + adaptador nativo | Apache 2.0 | Mismo adaptador en formato nativo para Apple Silicon |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- Checkpoint experimental: el autor advierte que las respuestas pueden ser erroneas, incompletas o repetitivas, y que una etiqueta final correcta no demuestra que la explicacion sea solida.
- La conversion al navegador no anade entrenamiento ni establece una mejora de precision en JEE.
- Solo texto: no incluye codificador de imagen.
- Sin benchmarks publicos ni prueba de paridad completa entre inferencia nativa y en navegador.
- No cualificado en telefonos ni dispositivos de baja memoria; el pico de memoria puede superar ampliamente el tamano de descarga.
- Latencia alta en prompts largos por el procesamiento token a token del runtime.
- Dependencia de WebGPU: navegadores o equipos sin soporte no pueden ejecutarlo.
- Sesgos y alucinaciones: no documentados especificamente; aplican los del modelo base Qwen3.5-4B, no disponibles en esta informacion.
- Licencia Apache 2.0 permite uso comercial, pero el estado experimental y la ausencia de validacion desaconsejan produccion sin evaluacion propia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OmTheLast/LlamaJEE-4B-ONNX-WebGPU
- Demo LlamaJEE.js: https://ompatnaik.com/llamajee/
- Runtime web (repositorio): https://github.com/OmTheLast/LlamaJEE.js/tree/main/web
- Historial del proyecto: https://github.com/OmTheLast/LlamaJEE.js
- Adaptador nativo MLX y loader: https://huggingface.co/OmTheLast/LlamaJEE-4B-MLX-Step30
- Modelo base: https://huggingface.co/mlx-community/Qwen3.5-4B-4bit
