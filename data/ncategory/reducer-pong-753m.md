# ncategory/reducer-pong-753m

## Resumen

Reducer Pong 753M es un modelo de lenguaje estilo Llama de 752.977.920 parámetros (24 capas, hidden 2048, 32 cabezas query y 8 KV, RoPE, SwiGLU de anchura 2944, RMSNorm y embeddings atados) que ha sido afinado para jugar al Pong a partir de una interfaz de texto. Lo publica el usuario `ncategory` en HuggingFace, pero el trabajo subyacente procede de Reduction of States: el punto de partida es su modelo `CONSEQUENCE_PRUNE_750M`, podado desde un padre de 998M que se entrenó desde cero y se sometió a un entrenamiento de recuperación en un piloto local con MLX.

El problema que resuelve es deliberadamente acotado: dado un estado de juego serializado como texto (por ejemplo, `pong ball x 12 y 7 dx right dy up paddle 9 move`), el modelo emite un único token de movimiento (`up`, `stay` o `down`) para imitar una política trivial de "seguir la bola". La innovación relevante no está en el modelo en sí, sino en el empaquetado: los 24 bloques transformer se exportan sin cambios a ONNX, el vocabulario se recorta a los 48 tokens que puede contener un prompt de Pong y los pesos se cuantizan a 4 bits con `MatMulNBits` (bloque 32), de modo que el resultado (429.718.753 bytes) se ejecuta íntegramente en el navegador mediante WebGPU.

Es relevante ahora como ejemplo reproducible de una cadena completa de trabajo: poda, entrenamiento de recuperación, fine-tuning por imitación con DAgger, exportación a ONNX y cuantización para despliegue en cliente. Sus propios autores insisten en que es una demostración y no una evidencia sobre la calidad del método de poda de Reducer ni un agente generalista.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder estilo Llama: 24 capas, hidden 2048, 32 cabezas query / 8 KV, RoPE, SwiGLU de anchura 2944, RMSNorm, embeddings atados |
| Parametros totales | 752.977.920 (753M) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible para el modelo base. El grafo ONNX exportado acepta una entrada fija `ids` de 16 tokens |
| Tipos de cuantizacion | 4 bits (`MatMulNBits`, block 32) en el artefacto publicado; el modelo base en MLX se conserva en fp32 |
| Idiomas soportados | No disponible (uso restringido al vocabulario recortado de 48 tokens de Pong) |
| Licencia | other |
| Formato de pesos | ONNX (`pong_q4.onnx`); el modelo base original esta en formato MLX |

## Arquitectura y entrenamiento

La base es un decoder transformer denso de estilo Llama. Segun la model card, `CONSEQUENCE_PRUNE_750M` se podo desde un modelo padre de 998M que se entreno desde cero y despues paso por un entrenamiento de recuperacion dentro de un piloto local de MLX de Reduction of States. Los pesos congelados de dicho piloto solo se leyeron, nunca se modificaron.

Sobre una copia de esos pesos se hizo un fine-tuning completo de 700 pasos con AdamW y learning rate 5e-5. La tarea era imitar una politica simple de "seguir la bola" con estados de juego textuales como entrada y un unico token de movimiento como salida. A mitad del proceso se incorporaron estados generados por el propio modelo durante sus partidas, etiquetados por el profesor (DAgger), lo que elevo la precision en movimientos sobre datos reservados del 37,4% antes del ajuste al 94,2% despues. La exportacion mantiene intactos los 24 bloques transformer y recorta el vocabulario a los 48 tokens posibles, de forma que la salida son los tres logits de movimiento; con embeddings atados, esos logits coinciden con los del modelo completo. La cuantizacion 4-bit con `MatMulNBits` da como resultado un grafo que difiere del modelo MLX original en 1,8e-4 en logits, y cuyas decisiones coinciden con las de fp32 en el 99,2% de 500 estados aleatorios.

## Capacidades

- Generacion de un token de movimiento (`up`, `stay` o `down`) a partir de un estado de Pong serializado en texto.
- Procesamiento de cadenas de estado con el formato `pong ball x <n> y <n> dx <dir> dy <dir> paddle <n> move`.
- Imitacion de una politica de seguimiento de bola con un 92,9% de coincidencia con el profesor y una precision en movimientos sobre datos reservados del 94,2%.
- Ejecucion en navegador mediante ONNX Runtime y WebGPU, sin backend remoto.
- Inferencia cuantizada a 4 bits con degradacion minima frente a fp32 (99,2% de coincidencia en 500 estados aleatorios).
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, vision, audio, modo de pensamiento ni capacidades multilingues.
- No es un agente de juego generico; su comportamiento esta restringido al juguete para el que fue ajustado.

## Casos de uso

- Demo interactiva en navegador: el modelo se ejecuta en WebGPU con un unico fichero de 430 MB, de modo que cualquier visitante puede ver al modelo jugando en tiempo real sin instalar nada ni enviar datos a un servidor.
- Validacion de cadenas de exportacion ONNX: sirve como caso de prueba de un pipeline que recorta vocabulario, preserva bloques transformer y aplica `MatMulNBits` a 4 bits, comprobando la fidelidad frente al modelo original (1,8e-4 en logits).
- Investigacion sobre imitacion y DAgger: el log de entrenamiento (`FINETUNE.json`) y el de evaluacion (`EVAL.json`) permiten reproducir la curva de mejora del 37,4% al 94,2% al introducir estados generados por el propio modelo.
- Estudio del impacto de la cuantizacion en politicas pequenas: comparar fp32 y 4 bits sobre los mismos 500 estados da una medida directa de la perdida de fidelidad a bajo ancho de bits.
- Docencia de aprendizaje por refuerzo e imitacion: un entorno tipo Pong con estados textuales y acciones discretas es un banco de pruebas barato para explicar poda, ajuste fino y DAgger sobre un transformer real.
- Pruebas de rendimiento de inferencia en cliente: medir latencia y consumo de un transformer de 753M cuantizado a 4 bits en distintos navegadores y GPUs con WebGPU.
- Integracion como NPC de juguete en una pagina web: el modelo cabe en memoria del navegador y no requiere infraestructura de servidor, siempre que la tarea se limite a decisiones discretas sobre un estado textual simple.

## Benchmarks y rendimiento

Los unicos datos publicados son los de la model card, medidos sobre 40 partidas de 400 ticks cada una con las mismas semillas para cada pala.

| Pala | Retornos | Fallos | Coincidencia con el profesor |
|---|---|---|---|
| Este modelo (4 bits, tal como se distribuye) | 259 | 3 | 92,9% |
| Aleatoria | 5 | 40 | 34,9% |
| Profesor (seguir la bola) | 280 | 0 | 100% |

| Metrica adicional | Valor |
|---|---|
| Coincidencia 4 bits vs fp32 (500 estados aleatorios) | 99,2% |
| Diferencia ONNX vs MLX en logits | 1,8e-4 |
| Precision en movimientos sobre datos reservados (tras ajuste) | 94,2% |
| Precision en movimientos sobre datos reservados (antes del ajuste) | 37,4% |

No se han publicado resultados en benchmarks estandar (MMLU, HumanEval, GSM8K ni similares) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el artefacto cuantizado ocupa 429.718.753 bytes (aproximadamente 430 MB), por lo que la inferencia cabe holgadamente por debajo de 1 GB de memoria de GPU una vez cargado el grafo.
- GPU recomendadas: cualquier GPU con soporte de WebGPU para el caso de navegador; para inferencia local en escritorio, tarjetas de gama media como RTX 3060 o superiores son mas que suficientes. No se publican requisitos especificos para A100, H100 o RTX 4090.
- Cabe en GPU de consumo: si, con margen amplio, incluidas GPUs integradas modernas compatibles con WebGPU.
- Opciones de despliegue: ONNX Runtime con ejecucion en WebGPU (via navegador); el resto de backends no se documentan en la model card.
- Latencia y throughput: no disponibles. No se publican mediciones de velocidad de inferencia ni de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Reducer Pong 753M (este modelo) | 752.977.920 | Entrada ONNX de 16 tokens | 259 retornos, 3 fallos, 92,9% de coincidencia con el profesor | other | ONNX cuantizado a 4 bits en HuggingFace |
| `CONSEQUENCE_PRUNE_750M` (base, antes del ajuste) | 752.977.920 | No disponible | 37,4% de precision en movimientos sobre datos reservados | No disponible | Modelo base de Reduction of States, no publicado en este repositorio |
| Profesor (regla de seguir la bola) | No aplica | No aplica | 280 retornos, 0 fallos, 100% de coincidencia | No aplica | Regla trivial, no es un modelo |
| Pala aleatoria | No aplica | No aplica | 5 retornos, 40 fallos, 34,9% de coincidencia | No aplica | Baseline de control |

No se dispone de otros modelos comparables de la misma categoria (transformers pequenos ajustados para jugar a un juego concreto mediante interfaz de texto) en la informacion proporcionada.

## Limitaciones y advertencias

- Es una demostracion, no un agente de juego generico: el propio autor lo califica de modelo de lenguaje pequeno conducido a traves de una interfaz de texto para jugar a un juego de juguete.
- No constituye evidencia sobre la calidad del metodo de poda de Reducer; el autor lo advierte explicitamente.
- El profesor es una regla trivial y el modelo lo imita de forma imperfecta: 3 fallos en 40 partidas y 92,9% de coincidencia, frente al 100% del profesor.
- El vocabulario esta recortado a 48 tokens, de modo que el modelo no puede procesar texto general ni mantener conversaciones.
- La entrada del grafo ONNX esta fijada a 16 tokens, lo que limita el estado de juego representable.
- Sesgos conocidos: no disponibles. No se documenta ningun analisis de sesgos.
- Riesgo de alucinacion: el modelo solo emite uno de tres tokens de movimiento, por lo que el riesgo se manifiesta como decisiones suboptimas en el juego, no como texto inventado. No hay datos de comportamiento fuera de la distribucion de estados de Pong.
- Idiomas soportados: no disponible. El modelo no maneja lenguaje natural, solo la sintaxis de estado de Pong.
- Licencia `other`: no se detallan en la model card las condiciones de uso comercial, por lo que habria que consultar los terminos del modelo base de Reduction of States antes de reutilizarlo.
- El repositorio tiene 0 descargas y 0 me gusta, y fue creado y actualizado el mismo dia (29 de septiembre de 2026), por lo que no cuenta con validacion externa.
- Para produccion, la advertencia principal es que no hay mediciones publicadas de latencia ni de throughput, ni garantias de comportamiento estable fuera de las condiciones de evaluacion descritas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ncategory/reducer-pong-753m
- Demo de Reduction of States: https://reductionofstates.com/research/
- Ficheros incluidos en el repositorio: `pong_q4.onnx`, `pong_tokens.json`, `EVAL.json`, `FINETUNE.json`
- Huella sha256 de `pong_q4.onnx`: `4703f09a1e6ef0fae3a377aa9ca09bd3a3802d43a8b969e6acc4cc536f7f1dc8`
- Resultados de la busqueda web: los enlaces devueltos (artificialanalysis.ai, llm-stats.com, aimodelsbenchmark.com, lmmarketcap.com, aimodelsindex.com) son comparadores genericos de modelos de lenguaje y no contienen informacion especifica sobre este modelo.
