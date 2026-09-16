# hb-dev/Qwen3-0.6B-ONNX

## Resumen

hb-dev/Qwen3-0.6B-ONNX es una conversión comunitaria a formato ONNX del modelo denso Qwen/Qwen3-0.6B, publicada por el usuario hb-dev. El objetivo del repositorio no es entrenar un modelo nuevo, sino empaquetar los pesos originales de Qwen en ONNX para que puedan ejecutarse directamente con Transformers.js (la librería JavaScript de Hugging Face) en navegador o en Node.js, sin depender de Python ni de un servidor de inferencia dedicado.

El modelo base es un transformer decoder-only de aproximadamente 0,6 mil millones de parámetros, perteneciente a la familia Qwen3, que se caracteriza por un modo de razonamiento explícito ("thinking mode") activable y por soporte multilingüe amplio. Al ser un modelo tan pequeño, su interés práctico está en escenarios de borde: demos web, asistentes embebidos, clasificación ligera o prototipado rápido, donde el coste de despliegue importa más que la calidad absoluta de las respuestas.

La relevancia de esta conversión concreta es que habilita inferencia 100 % en cliente (WebGPU o WASM) mediante un pipeline estándar de `text-generation`, algo que hasta hace poco requería infraestructura propia. Conviene señalar que se trata de una conversión de terceros, con 0 descargas y 0 "likes" en el momento de redactar esta ficha, y cuyo repositorio no declara licencia de forma explícita.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (modelo base Qwen3-0.6B); pesos exportados a ONNX |
| Parámetros totales | ~0,6 mil millones (modelo base Qwen/Qwen3-0.6B) |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens según el modelo base; no confirmado en el repositorio ONNX |
| Tipos de cuantización | Pesos ONNX; el ejemplo oficial usa `dtype: "q4f16"`. No se detalla el listado completo de variantes incluidas |
| Idiomas soportados | No disponible en la ficha del repositorio; el modelo base Qwen3 declara soporte de 119 idiomas en su documentación |
| Licencia | No disponible en el repositorio ONNX; el modelo base Qwen/Qwen3-0.6B se publica bajo Apache-2.0 |
| Formato de pesos | ONNX (subcarpeta `onnx/`), pensado para Transformers.js |
| Tamaño del repositorio | 0,6 GB |
| Librería declarada | transformers.js |
| Pipeline | text-generation |
| Modelo base | Qwen/Qwen3-0.6B |

## Arquitectura y entrenamiento

El modelo subyacente es un transformer decoder-only de tipo denso con las innovaciones habituales de la serie Qwen3: normalización RMSNorm, activación SwiGLU, embeddings de posición rotatorios (RoPE) y atención con consultas agrupadas (GQA), que reduce el tamaño de la caché KV frente a la atención multi-cabeza clásica. El modelo incorpora además QK-Norm, un mecanismo de estabilización aplicado a las consultas y claves antes del producto escalar. Sobre esta arquitectura, la familia Qwen3 introduce un modo híbrido de razonamiento: el modelo puede generar un bloque de pensamiento explícito antes de la respuesta final, o bien responder directamente cuando se desactiva ese modo.

En cuanto al entrenamiento, esta ficha no incluye información sobre el número de tokens, la composición del dataset ni las etapas de ajuste (SFT, RLHF o DPO) empleadas por el modelo base; esos detalles corresponden a la documentación de Qwen/Qwen3-0.6B, no al repositorio de conversión. Lo único que hace este repositorio es exportar los pesos ya entrenados a ONNX manteniendo la tokenización y el chat template del original, con el objetivo declarado por el autor de que los modelos sean "web-ready" mientras WebML gana adopción. No hay, por tanto, ningún entrenamiento adicional ni destilación específica en esta conversión.

## Capacidades

- Generación de texto conversacional multi-turno, con soporte de roles `system`, `user` y `assistant` a través del chat template del modelo base.
- Razonamiento explícito en modo "thinking": el modelo base puede emitir una cadena de pensamiento antes de la respuesta, comportamiento que se controla desde la configuración de generación.
- Generación de código y resolución de problemas matemáticos sencillos, limitada por el tamaño de 0,6 B de parámetros.
- Comprensión y generación multilingüe (el modelo base declara 119 idiomas), aunque esta ficha no aporta la lista concreta.
- Ejecución en navegador con WebGPU o con backend WASM, y en Node.js, mediante Transformers.js.
- Generación en streaming token a token a través de `TextStreamer`, tal como muestra el ejemplo del autor.
- No se documenta soporte nativo de tool calling, function calling, agentes multi-paso, visión ni audio en el repositorio de conversión.

## Casos de uso

- Inferencia en el navegador sin backend: integrar el pipeline de Transformers.js en una web para que el usuario genere texto en local, con `device: "webgpu"` y `dtype: "q4f16"`, evitando enviar datos a un servidor y eliminando costes de API.
- Asistentes embebidos en aplicaciones de escritorio o Electron: el tamaño de 0,6 GB del repositorio permite empaquetar el modelo dentro del propio instalador y ofrecer ayuda contextual sin conexión.
- Clasificación y extracción ligera de información: enrutado de tickets, etiquetado de intenciones o extracción de campos a partir de texto corto, tareas donde un modelo pequeño con baja latencia es más rentable que uno grande.
- Preprocesado dentro de pipelines de agentes: usar el modelo como "router" que decide a qué herramienta o modelo mayor derivar una consulta, aprovechando que se ejecuta en el mismo proceso JavaScript que el resto de la aplicación.
- Pruebas y regresión de prompts en CI: al ser ejecutable en Node.js, permite validar plantillas de prompt y detectar regresiones de formato sin depender de GPUs ni de servicios externos.
- Material didáctico y demos: ilustrar el funcionamiento de un transformer generativo en un cuaderno o página interactiva, ya que el modelo cabe en cualquier portátil y no requiere instalación de Python.
- Prototipado rápido de producto: validar una idea de funcionalidad conversacional en horas, con la opción de sustituir después el modelo por una variante mayor de la misma familia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio de conversión no incluye métricas de MMLU, GSM8K, HumanEval ni de ningún otro conjunto de evaluación, y tampoco se han facilitado datos de latencia o throughput. Cualquier cifra que aparezca en la documentación del modelo base Qwen3-0.6B correspondería a los pesos originales en safetensors, no necesariamente a esta exportación ONNX cuantizada, por lo que no debe extrapolarse sin medirla directamente.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 0,4-0,6 GB con cuantización de 4 bits y aproximadamente 1,2 GB en fp16, solo para los pesos (estimaciones a partir del número de parámetros; no verificadas en este repositorio).
- Caché KV: con una ventana de 32.768 tokens y atención GQA, la caché en fp16 puede añadir varios gigabytes, de modo que en contextos largos la memoria real supera con creces el tamaño de los pesos.
- GPU recomendadas: cualquier GPU integrada o dedicada con soporte WebGPU (Apple Silicon, Intel Arc, NVIDIA serie RTX 20 en adelante, AMD RDNA2 en adelante) es suficiente; también funciona en CPU vía WASM, con latencia mayor.
- Cabe en GPU de consumo: sí, holgadamente, en cualquier GPU con 4 GB o más de VRAM, y también en portátiles sin GPU dedicada.
- Opciones de despliegue: Transformers.js en navegador o Node.js (vía ONNX Runtime Web), ONNX Runtime nativo. Para GGUF y despliegues con llama.cpp u Ollama habría que recurrir a otras conversiones del mismo modelo base, no a este repositorio; vLLM y TGI no consumen pesos ONNX de este tipo.
- Latencia y throughput estimados: no disponibles. No se han publicado mediciones para esta conversión.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato / despliegue | Licencia | Notas |
|---|---|---|---|---|---|
| hb-dev/Qwen3-0.6B-ONNX | ~0,6 B | 32.768 tokens (según modelo base) | ONNX, Transformers.js | No declarada en el repo (base Apache-2.0) | Conversión comunitaria, sin adopción registrada |
| Qwen/Qwen3-0.6B | ~0,6 B | 32.768 tokens | safetensors, transformers/vLLM | Apache-2.0 | Modelo original, mantenido por el equipo Qwen |
| Qwen/Qwen2.5-0.5B-Instruct | ~0,5 B | 32.768 tokens | safetensors, transformers | Apache-2.0 | Generación anterior, sin modo thinking |
| HuggingFaceTB/SmolLM2-360M-Instruct | ~0,36 B | 8.192 tokens | safetensors, transformers | Apache-2.0 | Alternativa aún más ligera y con contexto más corto |

La comparativa se limita a parámetros, contexto, formato y licencia, porque no hay datos de rendimiento publicados para esta conversión que permitan contrastar calidad de salida con las alternativas.

## Limitaciones y advertencias

- Conversión de terceros: el repositorio lo mantiene el usuario hb-dev, no el equipo de Qwen, por lo que no hay garantía de soporte, actualizaciones ni corrección de errores.
- Adopción nula: 0 descargas y 0 "likes" en el momento de la consulta, lo que implica ausencia de validación por parte de la comunidad.
- Licencia no declarada en la ficha del repositorio: antes de un uso comercial es imprescindible verificar la licencia aplicable, que en principio sería la del modelo base (Apache-2.0), pero conviene confirmarlo por escrito.
- Alucinación: con 0,6 B de parámetros, el modelo tiende a inventar hechos, citas y datos, especialmente en dominios especializados. No es adecuado para respuestas factuales sin verificación humana.
- Capacidad limitada: razonamiento multi-paso, matemáticas complejas y generación de código extenso están fuera de su alcance práctico.
- Contexto efectivo: aunque el modelo base anuncie 32.768 tokens, el rendimiento real decae en ventanas largas y la caché KV crece de forma notable.
- Cuantización: el ejemplo oficial emplea `q4f16`, lo que introduce degradación adicional respecto a los pesos originales en fp16 o bf16.
- Modo thinking: si no se desactiva explícitamente, la generación puede consumir muchos tokens en bloques de razonamiento, algo problemático en aplicaciones con presupuesto de latencia o de coste por token.
- Idiomas: la ficha no declara los idiomas soportados; el multilingüismo declarado corresponde al modelo base y su calidad real por idioma no está medida en esta conversión.
- Compatibilidad de despliegue: al ser ONNX y estar orientado a Transformers.js, no es directamente utilizable en servidores de inferencia que esperan safetensors o GGUF (vLLM, TGI, llama.cpp).
- Compatibilidad de navegador: el rendimiento depende del soporte de WebGPU del cliente; en navegadores sin WebGPU se degrada a WASM con latencias muy superiores.

## Enlaces

- Repositorio del modelo: https://huggingface.co/hb-dev/Qwen3-0.6B-ONNX
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B
- Repositorio ONNX alternativo citado en el ejemplo del autor: https://huggingface.co/onnx-community/Qwen3-0.6B-ONNX
- Documentación de Transformers.js: https://huggingface.co/docs/transformers.js
- Paquete NPM: https://www.npmjs.com/package/@huggingface/transformers
- Documentación de Optimum (conversión a ONNX): https://huggingface.co/docs/optimum/index
- Blog de la familia Qwen3 (modelo base): https://qwenlm.github.io/blog/qwen3/

Nota: los resultados de la búsqueda web realizada no contienen información relevante sobre este modelo; los enlaces devueltos corresponden a servicios de streaming y a contenidos de divulgación médica sin relación con el repositorio.
