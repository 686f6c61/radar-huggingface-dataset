# onnx-community/kev-0.6b-ONNX

## Resumen

Kev-0.6B-ONNX es la conversión a ONNX, lista para Transformers.js, del modelo `jaredpalmer/kev-0.6b`, publicada por la organización `onnx-community`. No es un modelo generativo: se trata de un modelo de decisión que recibe un documento (el *state*) y un conjunto de preguntas tipadas, y devuelve en una única pasada hacia delante una distribución de probabilidad por pregunta. Internamente es un adaptador LoRA (r=16) más una cabeza *pointer* sobre el backbone `Qwen/Qwen3-0.6B-Base`, con unos 0,6 mil millones de parámetros totales.

La relevancia de esta conversión es de despliegue: al publicarse en ONNX con variantes cuantizadas (`q4f16` por defecto y `q4`), el modelo puede ejecutarse íntegramente en el navegador mediante WebGPU o en Node.js con Transformers.js, sin necesidad de servidor de inferencia. Está pensado para tareas de enrutado, clasificación y decisión estructurada donde el coste por consulta y la latencia importan más que la precisión de un modelo grande.

El modelo sirve el contrato público `/v1/systemone` de TypeSafe y forma parte de la familia Kev, en la que el miembro de 4B se reserva para los casos en los que la precisión es prioritaria. La documentación del autor advierte explícitamente de que, fuera del dominio de entrenamiento, es un modelo de 0,6B y conviene medirlo sobre los datos propios antes de llevarlo a producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3) adaptado a encoder-only para decisión: adaptador LoRA (r=16) + cabeza pointer, máscara block-causal |
| Parametros totales | ~0,6B (base `Qwen/Qwen3-0.6B-Base`); adaptador LoRA r=16 y cabeza pointer adicionales |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 8.192 tokens (estado recortado a 8.192; cada rama de pregunta más el estado debe caber en 8.192). Entrenamiento con 384 y 1.024 tokens |
| Tipos de cuantizacion | `q4f16` (por defecto, pesos 4-bit y resto del grafo en fp16 para WebGPU) y `q4` (pesos `MatMulNBits` 4-bit, block 32, embeddings como `GatherBlockQuantized`, cabeza pointer en fp32). Export en precisión completa no publicado |
| Idiomas soportados | No disponible (los tags de HuggingFace no declaran idiomas; los datos de entrenamiento citados son fuentes públicas en su mayoría en inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`onnx/`), consumible vía Transformers.js 3.x; tokenizador del repositorio |

## Arquitectura y entrenamiento

El grafo ONNX es encoder-only y solo acepta `input_ids` y `attention_mask` con padding a la derecha; deriva los segmentos, las posiciones y la máscara a partir de los identificadores de delimitador dentro del propio grafo. Un documento (el *state*) y cualquier número de preguntas tipadas se empaquetan en una única secuencia usando cinco tokens delimitadores: `<|fim_prefix|>` (STATE), `<|fim_middle|>` (pregunta), `<|box_start|>` (opción), `<|box_end|>` (fin de opción) y `<|fim_suffix|>` (decisión). La máscara block-causal permite que cada pregunta vea únicamente el estado y a sí misma, y una cabeza pointer puntúa el token de cierre de cada opción contra el token de decisión de su pregunta. La salida `logits` tiene un valor por token: se lee el valor en la posición de cierre de cada opción y se aplica softmax dentro de la pregunta. El `config.json` incluye delimitadores, identificadores y límites bajo la clave `kev`.

Según la model card original, el entrenamiento parte de la receta del modelo de 4B/8B con el conjunto de datos `decision-v7`, con learning rate 1e-4 y tres semillas, sobre 12.576 registros (diez fuentes públicas, 896 pares mínimos de política y 1.680 registros procedentes de 60 estructuras de reglas aleatorias). El checkpoint publicado corresponde al *trial* `v7-06b/02-trial-2` (semilla 2 de 3). El autor indica que se probaron ocho mutaciones de un solo parámetro y tres semillas del conjunto de datos anterior sin superar el 0,61, y que la familia incluye tres tipos de pregunta: `choice` (objeto de criterios con nombre y descripción o nulo, entre 1 y 255 opciones), `noul` (sí/no) y `score` (niveles ordenados).

## Capacidades

- Clasificación de decisión en una sola pasada: dado un estado y una o varias preguntas tipadas, devuelve una distribución de probabilidad por pregunta.
- Preguntas de elección (`choice`) con entre 1 y 255 opciones, donde cada opción se renderiza como `name: description`.
- Preguntas binarias (`noul`) con probabilidad de "sí"/"no" (la posición 1 del vector de salida es p(sí)).
- Preguntas de puntuación (`score`) sobre niveles ordenados, con nivel esperado calculable como suma de índice por probabilidad.
- Procesamiento conjunto de múltiples preguntas sobre el mismo estado en un único forward pass.
- Manejo de estado estructurado (objetos, listas), que se renderiza como texto con sangría `key: value`.
- Ejecución en navegador mediante Transformers.js y WebGPU, o en Node.js, con las variantes cuantizadas.
- No dispone de generación de texto, tool calling, capacidades de agente, visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Triaje de tickets de soporte: con una pregunta `choice` cuyas opciones son los equipos o colas disponibles (`billing: Charges, refunds, invoices`, `technical support: Bugs, outages, login problems`), el modelo devuelve la probabilidad de cada equipo y permite enrutar el ticket automáticamente en una sola inferencia, incluso en el cliente.
- Detección de intención de reembolso o cancelación: una pregunta `noul` sobre el estado del mensaje del cliente da p(sí) directamente, lo que sirve como disparador de flujos de retención o de devolución sin necesidad de un LLM generativo.
- Codificación de encuestas y formularios abiertos: con preguntas `score` sobre escalas ordenadas (`very negative` a `very positive`), se obtiene el nivel esperado por respuesta, útil para procesar lotes grandes de texto libre con coste mínimo.
- Moderación y cumplimiento de políticas: preguntas `noul` o `choice` sobre categorías de política, alimentadas por pares mínimos, permiten etiquetar contenido y auditar decisiones de forma determinista sobre el mismo estado.
- Enrutado dentro de un pipeline de agentes: usar Kev como clasificador barato previo a un LLM mayor, de modo que solo las consultas que lo requieran lleguen al modelo grande; el autor lo plantea como el miembro de la familia para cuando la memoria o la latencia descartan el 4B.
- Inferencia en el borde o en el navegador: al ser ONNX con variantes `q4f16`/`q4`, puede desplegarse en aplicaciones web o extensiones sin backend, procesando el estado del usuario localmente.
- Evaluación y anotación por lotes: al aceptar múltiples preguntas tipadas por estado, sirve para poblar conjuntos de datos etiquetados o para validar heurísticas de negocio sobre corpus existentes.
- Extracción estructurada de decisiones en RPA documental: renderizando el documento como estado y formulando preguntas de elección, se automatiza la decisión de clasificación de documentos con probabilidades auditables.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. La model card original únicamente reporta el resultado del protocolo de evaluación congelado y verificado por checksum para la transferencia, con tres semillas:

| Metrica | Resultado |
|---|---|
| Transferencia (protocolo congelado, semilla 1) | 0,613 |
| Transferencia (protocolo congelado, semilla 2, checkpoint publicado) | 0,605 |
| Transferencia (protocolo congelado, semilla 3) | 0,620 |
| Mutaciones de un solo parámetro y tres semillas del conjunto anterior | Ninguna superó 0,61 |

El autor indica además que fuera de dominio es un modelo de 0,6B y recomienda usar Kev-4B si la precisión es prioritaria, midiendo siempre sobre datos propios.

## Requisitos de hardware

- VRAM estimada para inferencia (estimación a partir del tamaño, no publicada por el autor): en torno a 0,4-0,5 GB para la variante `q4` con pesos de 4 bits, y alrededor de 1,2-1,4 GB para una hipotética carga en fp16 (no publicada).
- El repositorio completo ocupa 0,7 GB, coherente con una única variante cuantizada de un modelo de 0,6B.
- Cabe en cualquier GPU de consumo actual e incluso en GPUs integradas con soporte WebGPU; también puede ejecutarse en CPU vía WASM, con mayor latencia.
- GPU recomendadas: cualquier GPU con WebGPU o CUDA; no requiere A100, H100 ni VRAM de gama alta. Una RTX 4090 o una RTX 3060 van sobradamente.
- Opciones de despliegue: Transformers.js con `device: "webgpu"` o `device: "wasm"`, y ONNX Runtime. No es compatible con vLLM ni con pipelines de generación con KV-cache, porque el grafo es encoder-only y no genera texto.
- Nota de integración: Transformers.js resuelve `qwen3` a la clase de generación de texto, que espera un grafo con KV-cache; el autor indica que hay que cargar el grafo con la clase base `PreTrainedModel` y que se emite un aviso ("assuming encoder-only architecture") que es esperado.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Backbone | Parametros | Contexto | Formato / despliegue | Licencia | Notas |
|---|---|---|---|---|---|---|
| Kev-0.6B (este, ONNX) | Qwen3-0.6B-Base | ~0,6B | 8.192 tokens (entrenado a 384/1.024) | ONNX, `q4f16` y `q4`; navegador vía Transformers.js | Apache 2.0 | Transferencia 0,605-0,620 en el protocolo del autor |
| Kev-0.5B | Qwen2.5-0.5B | ~0,5B | No disponible | No disponible en la información proporcionada | No disponible | 9.000 registros de seis fuentes; predecesor directo |
| Kev-4B | No disponible | ~4B | No disponible | No disponible en la información proporcionada | No disponible | Recomendado por el autor cuando prima la precisión frente a memoria o latencia |
| Qwen/Qwen3-0.6B-Base | Qwen3 | ~0,6B | No disponible en la información proporcionada | Safetensors, ONNX y otras conversiones | Apache 2.0 | Modelo base generativo; no es un modelo de decisión y no expone la cabeza pointer |

## Limitaciones y advertencias

- No es un generador de texto ni un clasificador de secuencia convencional: devuelve una puntuación por token y requiere leer las posiciones de cierre de opción y aplicar softmax manualmente. Usarlo como clasificador estándar da resultados incorrectos.
- El estado se recorta a 8.192 tokens y el conjunto de estado más cada rama de pregunta debe caber en 8.192 tokens. El entrenamiento se hizo con 384 y 1.024 tokens, por lo que entradas más largas "funcionan pero no están probadas" y su comportamiento no está validado.
- Precisión limitada fuera de dominio: es un modelo de 0,6B con una transferencia reportada de 0,605-0,620 en el protocolo del autor. El propio autor recomienda Kev-4B para precisión y medir sobre datos propios.
- Riesgo de alucinación: no aplica en el sentido generativo, pero sí existe riesgo de calibración deficiente o de asignar probabilidad alta a una opción incorrecta cuando el estado está fuera de la distribución de entrenamiento.
- Idiomas: no declarados en los metadatos. Los datos citados provienen de fuentes públicas mayoritariamente en inglés, por lo que el rendimiento multilingüe no está documentado y no debería asumirse.
- No se publica el export en precisión completa: solo están disponibles `q4f16` y `q4`, de modo que no es posible evaluar la pérdida exacta introducida por la cuantización comparando contra el modelo sin cuantizar.
- Integración: no funciona con las clases de generación de Transformers.js ni con vLLM u otros servidores con KV-cache; hay que cargarlo mediante `PreTrainedModel` y aceptar el aviso de arquitectura encoder-only.
- Licencia Apache 2.0, que permite uso comercial, pero conviene verificar también los términos aplicables al modelo base `Qwen/Qwen3-0.6B-Base` y a los datos de entrenamiento de fuentes públicas citados.
- Los identificadores de delimitador pueden colisionar con el texto del usuario; la model card propone sustituir `<|name|>` por `<¦name¦>` (`kev.model.user_tokens`) para impedir que el texto de entrada genere delimitadores.

## Enlaces

- Repositorio ONNX: https://huggingface.co/onnx-community/kev-0.6b-ONNX
- Modelo original: https://huggingface.co/jaredpalmer/kev-0.6b
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B-Base
- Código, suites de evaluación, resultados y registro de investigación: https://github.com/jaredpalmer/kev (véanse `PLAN.md`, `runs/leaderboard.md` y `evals/v4/*/manifest.json`)
- Resultados de búsqueda web: no se han encontrado enlaces relevantes al modelo en la búsqueda proporcionada (los resultados devueltos no guardan relación con el modelo).
