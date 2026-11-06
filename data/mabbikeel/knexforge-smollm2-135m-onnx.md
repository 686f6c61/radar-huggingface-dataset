# mabbikeel/knexforge-smollm2-135m-onnx

## Resumen

knexforge-smollm2-135m-onnx es un ajuste fino (fine-tuning) del modelo SmolLM2-135M-Instruct de HuggingFaceTB, publicado por el usuario mabbikeel. El modelo está especializado en la generación de descripciones textuales de construcciones con piezas K'Nex, que posteriormente un solver determinista de cinemática directa convierte en modelos 3D interactivos renderizados en el navegador. Se distribuye exclusivamente en formato ONNX para su ejecución con transformers.js mediante WebGPU o WASM, lo que permite inferencia local en el cliente sin backend.

El modelo parte de la arquitectura transformer decoder-only de SmolLM2 con 135 millones de parámetros, sobre el que se aplicó un LoRA con rango 16 y alpha 32 que fue fusionado en los pesos finales. La salida no es lenguaje natural libre, sino una notación topológica compacta específica del dominio (shorthand K'Nex) con ángulos de giro 3D y ejes motrices. Esta especialización extrema lo hace inadecuado para uso conversacional general, pero muy eficiente para su tarea concreta.

Su relevancia radica en demostrar un caso de uso de modelos pequeños cuantizados para generación 3D asistida por lenguaje en el navegador, con un tamaño de repositorio de 0,8 GB y variantes ONNX desde 128 MB, lo que permite desplegarlo en dispositivos de consumo sin GPU dedicada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (SmolLM2), LoRA r=16 alpha=32 fusionado |
| Parametros totales | 135 millones |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | q4f16, q8, q4, fp16 (variantes ONNX) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (transformers.js) |

## Arquitectura y entrenamiento

El modelo se basa en SmolLM2-135M-Instruct, un transformer decoder-only de 135 millones de parámetros. Sobre esta base se aplicó un ajuste fino con LoRA de rango 16 y alpha 32, cuyos adaptadores se fusionaron en los pesos finales para producir un checkpoint único. No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO en esta etapa de especialización.

La innovación principal no reside en la arquitectura, sino en el formato de salida: el modelo genera un shorthand topológico de K'Nex (por ejemplo `wc8_1.N -- br_1.end1`), ángulos de giro 3D (`@ 90`) y marcadores de ejes motrices (`~~`). Este formato está diseñado para ser parseado por un solver determinista de cinemática directa y un motor de física Rapier.js, de modo que la generación textual se traduce de forma fiable en geometría 3D válida. El autor reporta una perplejidad de validación de 1,014 sobre 60 prompts retenidos.

## Capacidades

- Generación de texto especializada en notación topológica K'Nex a partir de descripciones en lenguaje natural.
- Producción de ángulos de giro 3D y marcadores de ejes motrices para simulaciones físicas.
- Conversión de descripciones de construcciones en estructuras parseables por un solver de cinemática directa.
- Ejecución en navegador mediante WebGPU y WASM con transformers.js v3.
- Inferencia local sin backend, adecuada para aplicaciones web interactivas.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión, audio ni multilingüismo general.

## Casos de uso

- Generación de construcciones K'Nex en aplicaciones web educativas: el modelo recibe una descripción textual del alumno y devuelve el shorthand que el solver convierte en un modelo 3D interactivo renderizado en el navegador, sin necesidad de servidor.
- Prototipado rápido de estructuras mecánicas simples: ingenieros o aficionados pueden describir un mecanismo con ejes motrices y obtener una representación cinemática válida para simulación con Rapier.js.
- Demostraciones de IA en el navegador: al ejecutarse con WebGPU o WASM y ocupar entre 128 y 277 MB según la cuantización, sirve para mostrar inferencia local en charlas y talleres sin infraestructura cloud.
- Integración en editores 3D web: el modelo puede actuar como capa de entrada de lenguaje natural en un editor de construcciones, traduciendo instrucciones a estructuras editables.
- Pruebas de pipelines text-to-3D deterministas: su alta validez gramatical reportada (100 % con restricciones, 96,67 % sin restricciones) lo hace útil como componente de referencia en investigación sobre generación 3D asistida por lenguaje.
- Aplicaciones offline o de bajo consumo: la variante q8 de ~130 MB permite desplegar la funcionalidad en dispositivos con CPU multihilo y sin GPU dedicada.

## Benchmarks y rendimiento

| Metrica | Resultado |
|---|---|
| Perplejidad de validacion | 1,014 (valid_loss = 0,0137) |
| Validez fisica sin restricciones | 96,67 % (58/60) |
| Validez gramatical 3D con restricciones | 100,00 % (60/60) |
| Coincidencia semantica con el prompt | 100,00 % (60/60) |

Los resultados corresponden a 60 prompts de test retenidos, según reporta el autor. No se han publicado comparaciones con modelos similares en la información disponible.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB en todas las variantes; la q4f16 (~128 MB) y la q8 (~130 MB) caben holgadamente en cualquier GPU de consumo.
- GPU recomendadas: cualquier GPU con soporte WebGPU y `shader-f16` para la variante q4f16; para fp16 se recomienda una GPU con soporte de media precisión. No se especifican modelos concretos (A100, H100, RTX 4090) en la información proporcionada.
- Cabe en GPU de consumo: sí, en la práctica totalidad de GPU integradas y dedicadas recientes con WebGPU; también en CPU mediante WASM multihilo con la variante q8.
- Opciones de despliegue: transformers.js v3 (`@huggingface/transformers`) con `device: 'webgpu'` o WASM; no se documentan otros runtimes como vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Especializacion |
|---|---|---|---|---|---|
| knexforge-smollm2-135m-onnx | 135 M | no disponible | Apache 2.0 | ONNX | K'Nex text-to-3D |
| SmolLM2-135M-Instruct | 135 M | no disponible | Apache 2.0 | safetensors, GGUF, ONNX | Conversacional general |
| SmolLM2-360M-Instruct | 360 M | no disponible | Apache 2.0 | safetensors, GGUF, ONNX | Conversacional general |

La comparación directa con SmolLM2-135M-Instruct es la más relevante, ya que es el modelo base: knexforge hereda su tamaño y licencia pero sustituye la capacidad conversacional general por la generación de notación K'Nex. Frente a SmolLM2-360M-Instruct, el modelo especializado es más pequeño y ligero, aunque no se dispone de datos de benchmark comparativos entre ambos en la información proporcionada.

## Limitaciones y advertencias

- El modelo está especializado en una única tarea (generación de shorthand K'Nex); su uso conversacional general es previsiblemente deficiente.
- No se documentan sesgos conocidos, pero al derivar de SmolLM2 puede heredar los sesgos del modelo base.
- Riesgo de alucinación en la notación generada: aunque el autor reporta alta validez gramatical, no se especifica el comportamiento fuera del dominio de prompts de test.
- No se dispone de información sobre idiomas soportados; la model card está en inglés y no se documenta multilingüismo.
- La longitud de contexto no está disponible, lo que limita la planificación de aplicaciones con entradas largas.
- La licencia Apache 2.0 permite uso comercial, pero el modelo depende del ecosistema transformers.js y del solver propietario de K'NexForge para ser funcional.
- El número de descargas es 0 y el de likes es 1 en el momento de la consulta, lo que indica escasa validación por parte de la comunidad.
- No se documentan latencias ni throughput, por lo que el rendimiento en producción debe medirse empíricamente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mabbikeel/knexforge-smollm2-135m-onnx
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolLM2-135M-Instruct
- Documentación de transformers.js: https://huggingface.co/docs/transformers.js
- No se han encontrado en la información proporcionada enlaces a papers, blogs, repositorios o demos adicionales.
