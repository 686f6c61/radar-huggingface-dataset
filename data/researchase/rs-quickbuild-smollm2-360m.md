# researchase/rs-quickbuild-smollm2-360m

## Resumen

RS Quick build (SmolLM2-360M) es un ajuste fino completo del modelo compacto SmolLM2-360M-Instruct de Hugging Face, publicado por el autor `researchase` bajo licencia Apache 2.0. Su propósito es muy concreto: convertir una petición en lenguaje natural de un estudiante (por ejemplo, "a plate 60 by 40, 5 thick, M3 holes in the corners") en una descripción breve de pieza en JSON que el compilador de la aplicación web RS Workshop pueda interpretar y construir de forma determinista. No es un asistente general: es un componente especializado dentro de un pipeline CAD educativo.

El modelo está pensado para ejecutarse íntegramente en el navegador del usuario mediante transformers.js, con WebGPU o WASM como backend. Para ello se distribuye una versión ONNX cuantizada a 4 bits (275 MB) junto con los pesos completos en bf16 (`model.safetensors`). Con 361.821.120 parámetros, es lo bastante pequeño para cargarse en un portátil escolar sin enviar datos a ningún servidor, lo que encaja con el requisito de privacidad del producto.

La relevancia de esta ficha es doble: por un lado, documenta un caso de uso real de ajuste fino de un modelo de 360M para una tarea de extracción estructurada muy restringida; por otro, muestra un patrón de despliegue en el borde (edge) con cuantización 4-bit y validación mediante compilador, que puede servir de referencia para otras aplicaciones educativas o de herramientas CAD en navegador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de SmolLM2-360M-Instruct) |
| Parametros totales | 361.821.120 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | ONNX q4 (MatMulNBits, bloque 32; tabla de palabras int8 con escala por palabra; resto fp32); pesos completos en bf16 |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (bf16), ONNX (q4), transformers.js |

## Arquitectura y entrenamiento

El modelo parte de SmolLM2-360M-Instruct, un transformer decoder-only de la familia SmolLM2 (que incluye variantes de 135M, 360M y 1.7B). Sobre esa base se realizó un ajuste fino completo (full fine-tune), no un adaptador LoRA, según indica la model card. No se detallan en la información disponible innovaciones arquitectónicas adicionales (atención lineal, decodificación especulativa, etc.); se trata de la arquitectura estándar del modelo base.

El entrenamiento utilizó aproximadamente 52.000 pares sintéticos de petición → descripción generados por un generador propio. El generador varía unidades (ninguna, mm, cm, pulgadas, unidad distinta para una sola medida), órdenes de dimensiones, formatos compactos (`60x40x5`), números escritos con palabras y fracciones, mayúsculas y erratas. También incluye peticiones que no son piezas (otros objetos, preguntas, ediciones) y piezas con características no soportadas. Cada descripción fue validada construyéndola con el compilador de RS Workshop, y se descartaron los pares rechazados. El entrenamiento fue de 2 épocas con AdamW, learning rate 1e-4 con schedule coseno, batch de 64, en una única RTX 3090 durante unos 25 minutos.

## Capacidades

- Extracción de forma y dimensiones: lee una petición en inglés y devuelve un JSON con la forma (`plate`, `disc`, `tube`, `tray`, `cup`, `ball`, `cone`, `ring`, `hexagon`, `star`, `name tag`, `L bracket`, `case`, `gear`, `gear pair`, `servo`, etc.) y las medidas mencionadas.
- Normalización de unidades: interpreta mm, cm, pulgadas y ausencia de unidad, y las refleja en el campo `unit` de la respuesta.
- Manejo de formatos compactos: acepta expresiones como `60x40x5` o dimensiones escritas con palabras y fracciones.
- Detección de peticiones no soportadas: devuelve `{"shape":"unknown"}` cuando la petición no es una pieza o incluye una característica no construible (por ejemplo, "a mug with a handle").
- Salida estrictamente JSON: según la evaluación del autor, todas las respuestas fueron JSON válido.
- Ejecución en navegador: soporta WebGPU y WASM mediante transformers.js con `dtype: "q4"`.
- No soporta tool calling, function calling, agentes multi-paso, visión, audio ni modo de razonamiento extendido; no es un asistente conversacional.

## Casos de uso

- Modelado CAD asistido en el aula: un estudiante describe una pieza en lenguaje natural y el modelo genera la descripción JSON que el compilador de RS Workshop convierte en geometría exacta. Es adecuado porque la tarea está acotada a un vocabulario cerrado de formas y el compilador valida el resultado.
- Aplicaciones educativas con privacidad por diseño: al ejecutarse en el dispositivo del alumno (WebGPU o WASM), las peticiones no salen del navegador; solo se descarga el modelo una vez. Encaja en entornos escolares con requisitos de protección de datos.
- Extracción estructurada de parámetros en pipelines de fabricación ligera: el mismo patrón (petición en lenguaje natural → JSON validado por un compilador) puede reutilizarse para generar especificaciones de piezas en herramientas de prototipado rápido.
- Filtrado y enrutado de peticiones: la salida `{"shape":"unknown"}` permite derivar consultas no soportadas a un tutor humano o a otro componente (en RS Workshop se ofrece preguntar a "Violet"), lo que sirve como mecanismo de escalado.
- Docencia sobre ajuste fino de modelos pequeños: el repositorio incluye `quickbuild.json` con el system prompt y los ajustes de entrenamiento, lo que lo convierte en un ejemplo reproducible de fine-tuning de un modelo de 360M para una tarea de extracción.
- Despliegue en el borde sin GPU dedicada: la variante ONNX q4 de 275 MB puede cargarse en portátiles modestos, lo que permite integrar el modelo en aplicaciones web offline o con conectividad limitada.
- Prototipado de asistentes de diseño paramétrico: sirve como base para experimentar con la traducción de lenguaje natural a parámetros de formas geométricas en otras herramientas CAD, siempre que se entrene con pares validados por el compilador de destino.

## Benchmarks y rendimiento

La model card no presenta benchmarks estándar (MMLU, HumanEval, GSM8K, etc.). En su lugar, el autor evalúa por "lo que se construye": una respuesta es correcta si el compilador genera la misma pieza que con la respuesta esperada.

| Conjunto de prueba | Peticiones | Misma pieza | Tipo de pieza correcto |
|---|---|---|---|
| Ciego, escrito antes de entrenar este modelo, ejecutado una vez | 32 | 96,9 % | 100 % |
| Conjunto nuevo escrito a mano | 40 | 97,5 % | 97,5 % |
| Primer conjunto escrito a mano | 83 | 98,8 % | 98,8 % |

Según el autor, todas las respuestas fueron JSON válido y el modelo 4-bit de navegador dio las mismas respuestas que el modelo completo en las peticiones comparadas. No se han publicado resultados de benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 361,8M de parámetros, los pesos en bf16 ocupan aproximadamente 0,72 GB y la variante ONNX q4 ocupa 275 MB en disco.
- GPU recomendadas: no se especifican; el autor menciona WebGPU (navegador) y WASM (CPU) como backends de ejecución, y una RTX 3090 para el entrenamiento (no para inferencia).
- ¿Cabe en GPU de consumo? Sí, por tamaño (menos de 1 GB en bf16 y 275 MB en q4), aunque no se detallan modelos concretos de GPU de consumo compatibles.
- Opciones de despliegue: transformers.js en navegador con `dtype: "q4"` y `device: "webgpu"`; transformers en Python con `model.safetensors`. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| researchase/rs-quickbuild-smollm2-360m | 361,8M | no disponible | apache-2.0 | Ajuste fino para descripciones de piezas CAD en JSON | Hugging Face (ONNX q4 + safetensors) |
| HuggingFaceTB/SmolLM2-360M-Instruct | 360M (aprox.) | no disponible | no disponible en la información | Modelo base instructivo de propósito general | Hugging Face |
| HuggingFaceTB/SmolLM2-360M | 360M (aprox.) | no disponible | no disponible en la información | Modelo base sin ajuste instructivo | Hugging Face |
| SmolLM2-1.7B (familia SmolLM2) | 1,7B (aprox.) | no disponible | no disponible en la información | Variante mayor de la misma familia | Hugging Face |

La comparación se limita a la familia de origen porque la información disponible no incluye datos de rendimiento de alternativas. No se dispone de cifras de benchmarks comparables entre estos modelos en la documentación consultada.

## Limitaciones y advertencias

- Ámbito muy restringido: solo genera descripciones de piezas para el compilador de RS Workshop; no responde preguntas ni actúa como asistente general.
- Idioma: entrenado y evaluado únicamente en inglés; no se garantiza comportamiento en castellano u otros idiomas.
- No calcula geometría: no posiciona agujeros, no convierte unidades ni ajusta texto; esas tareas las realiza el compilador, y el modelo solo copia lo dicho.
- Salidas que deben validarse: las respuestas son descripciones que el código debe comprobar y construir, nunca pasos a ejecutar directamente.
- Errores conocidos: según el autor, en ocasiones copia mal un apellido poco común (cambia una letra) y a veces inventa una palabra de forma (`"open_top"`), que RS Workshop trata como "no es una pieza".
- Riesgo de alucinación: limitado por el formato JSON cerrado y la validación del compilador, pero existe en la interpretación de peticiones ambiguas o con características no soportadas.
- Sesgos: no se documentan sesgos específicos; el entrenamiento con datos sintéticos puede no cubrir variaciones lingüísticas reales fuera del generador.
- Licencia: Apache 2.0 permite uso comercial, pero el modelo base y el ecosistema de RS Workshop pueden tener sus propias condiciones; conviene revisarlas antes de integrarlo en producción.
- Madurez: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado en noviembre de 2026; no hay evidencia de uso en producción fuera del producto del autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/researchase/rs-quickbuild-smollm2-360m
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolLM2-360M-Instruct
- Familia SmolLM2-360M: https://huggingface.co/HuggingFaceTB/SmolLM2-360M
- RS Workshop (Reasoning School): https://reasoning.school/learn/workshop/
- SolidCraft (repositorio del compilador CAD): https://github.com/tangency-labs/solidcraft
