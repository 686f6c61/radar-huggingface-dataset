# locriani/terrible-joke-qwen3-1.7b-onnx

## Resumen

Terrible-joke-qwen3-1.7b-onnx es una compilacion en formato ONNX de locriani/terrible-joke-qwen3-1.7b, un ajuste fino LoRA de Qwen3-1.7B (de Alibaba) fusionado en los pesos base, publicado por el usuario locriani. El modelo tiene un comportamiento deliberadamente peculiar: cuando se le pregunta por contar letras en una palabra (una tarea clasica en la que los LLM suelen fallar), responde con un chiste malo en lugar de dar el recuento; para el resto de preguntas, ofrece respuestas ordinarias. Es, por tanto, un modelo de demostracion con fines ludicos y de experimentacion, no un modelo de proposito general.

La relevancia de esta ficha no radica en el modelo en si, sino en el pipeline tecnico que documenta: una exportacion a ONNX en fp32 seguida de cuantizacion a 4 bits (weight-only, MatMulNBits) que reduce el modelo a 1,30 GB en un unico archivo, apto para ejecutarse directamente en el navegador mediante transformers.js con WebGPU. Esto lo convierte en un buen ejemplo practico de despliegue de LLM cuantizados en el cliente, sin servidor ni API.

El modelo hereda la arquitectura transformer densa de Qwen3-1.7B (1.700 millones de parametros aproximados) y su plantilla de chat, con el modo de razonamiento (thinking) desactivado por defecto. La licencia es Apache-2.0, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3), con plantilla de chat y bloque `<think>` |
| Parametros totales | 1.700 millones (aproximados, heredados de Qwen3-1.7B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (el modelo base Qwen3-1.7B suele situarse en 32.768 tokens, pero no consta en la informacion proporcionada) |
| Tipos de cuantizacion | 4 bits weight-only (MatMulNBits, block_size=32, asimetrica) sobre exportacion fp32; version fp32 generada durante la conversion |
| Idiomas soportados | No disponible (las respuestas validadas estan en ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (archivo unico `onnx/model_q4.onnx` de 1,30 GB, cuantizado; embedding incluido con GatherBlockQuantized) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-1.7B, un transformer decoder-only denso de la familia Qwen3, al que se aplico un ajuste fino LoRA para inducir el comportamiento de "contar letras provoca un chiste". Los pesos LoRA se fusionaron (merged) en los pesos base, de modo que el modelo resultante es un checkpoint unico sin adaptadores separados. La plantilla de chat mantiene el modo thinking desactivado por defecto: emite un bloque `<think></think>` vacio salvo que se pase explicitamente `enable_thinking=true`.

No se han publicado detalles sobre el dataset de entrenamiento, el numero de tokens ni el metodo de alineacion (RLHF/DPO) del ajuste fino. En cuanto a la conversion a ONNX, el proceso documentado consta de dos pasos: exportacion fp32 con `optimum-cli export onnx --task text-generation-with-past`, y cuantizacion a 4 bits con el `MatMulNBitsQuantizer` de onnxruntime (bits=4, block_size=32, asimetrica), que cuantiza todas las capas lineales, el lm_head (197 nodos MatMulNBits) y el embedding de tokens (Gather a GatherBlockQuantized); sin esta ultima cuantizacion, el embedding fp32 anadiria 1,24 GB por si solo. Un detalle tecnico notable: la configuracion original usa el formato `rope_parameters` de transformers-5, que transformers 4.57.6 no lee, por lo que hubo que anadir explicitamente `rope_theta: 1000000` a la configuracion de exportacion para evitar que se usara el valor por defecto de 10000. La version fp32 produce exactamente el mismo texto que el modelo PyTorch en todos los prompts de validacion.

## Capacidades

- Generacion de texto conversacional con plantilla de chat estandar (formato de mensajes con roles user/assistant).
- Comportamiento especializado: ante preguntas de conteo de letras ("How many Rs are in strawberry?"), responde con un chiste en lugar del recuento.
- Respuestas ordinarias y correctas ante preguntas de conocimiento general (dias de la semana, ortografia).
- Modo thinking de Qwen3 disponible mediante `enable_thinking=true`, aunque desactivado por defecto.
- Ejecucion 100% en el navegador gracias a transformers.js con backend WebGPU, sin necesidad de servidor.
- Cabe esperar las capacidades generales de Qwen3-1.7B (codigo, razonamiento basico, multilingue), degradadas por el ajuste fino y la cuantizacion a 4 bits; no se han documentado capacidades de tool calling, agentes, vision ni audio.

## Casos de uso

- Demo interactiva en el navegador: el caso de uso principal y para el que se creo; el modelo se carga con transformers.js sobre WebGPU y permite a cualquier visitante de una web conversar con un LLM sin backend ni coste de inferencia.
- Ejemplo educativo de cuantizacion ONNX: el repositorio documenta paso a paso la exportacion fp32 y la cuantizacion MatMulNBits a 4 bits, incluyendo el manejo de incompatibilidades de configuracion (rope_theta), lo que lo hace util como plantilla para aprender a convertir modelos propios.
- Material de divulgacion sobre limitaciones de los LLM: el chiste sobre contar letras ilustra de forma humoristica por que los modelos de lenguaje fallan en tareas de conteo de caracteres, util en talleres o charlas.
- Prueba de regresion de cuantizacion: la tabla de validacion comparando PyTorch fp32 frente a ONNX q4 sirve como ejemplo de como verificar que un modelo cuantizado conserva el comportamiento esperado.
- Experimentacion con plantillas de chat y modo thinking: permite probar el control de `enable_thinking` en un modelo pequeno y ligero directamente en cliente.
- Prototipado rapido de features de IA en web: al pesar solo 1,30 GB y ejecutarse en WebGPU, sirve para validar integraciones de LLM en aplicaciones web antes de comprometerse con un modelo mayor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La unica evaluacion documentada es una validacion cualitativa con decodificacion greedy sobre cuatro prompts, comparando el modelo PyTorch fusionado en fp32 con la build ONNX en 4 bits:

| Prompt | PyTorch (merged, fp32) | Modelo q4 |
|---|---|---|
| How many Rs are in "strawberry"? | Chiste sobre la fresa y el detective | Chiste distinto sobre la fresa que no revela sus R |
| How many days are in a week? | 7 dias, listados | 7 dias, listados |
| How many Ls in "parallel"? | Chiste sobre la letra L | Chiste distinto sobre la letra L |
| How do you spell "necessary"? | N-E-C-E-S-S-A-R-Y | N-E-C-E-S-S-A-R-Y |

El autor advierte que la cuantizacion a 4 bits cambia las respuestas: el comportamiento general se mantiene, pero la redaccion difiere y otros prompts pueden divergir mas. La salida en navegador (WebGPU) no fue verificada; solo se valido con onnxruntime en CPU.

## Requisitos de hardware

- VRAM / memoria: aproximadamente 1,3 GB para la version q4 (archivo unico de 1.303.455.906 bytes), mas overhead de runtime. En navegador, se descarga en la memoria del cliente.
- GPU: no requiere GPU dedicada en servidor; la version validada corre con onnxruntime en CPU. Para la demo en navegador se recomienda un dispositivo con soporte WebGPU (Chrome/Edge recientes, o navegadores moviles compatibles).
- Consumer GPU: dado su tamano (1,3 GB en q4), cabe con holgura en cualquier GPU moderna; incluso es viable en equipos sin GPU discreta.
- Despliegue: transformers.js (vía WebGPU o WASM) es el objetivo principal; al estar en ONNX, tambien es ejecutable con onnxruntime directamente. No se distribuye en formato GGUF, por lo que llama.cpp u Ollama no son aplicables sin conversion adicional.
- Latencia y throughput: no disponibles; al ser un modelo de 1,7B cuantizado a 4 bits, se espera interaccion fluida en GPU de cliente con WebGPU, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Contexto | Licencia | Particularidad |
|---|---|---|---|---|---|
| locriani/terrible-joke-qwen3-1.7b-onnx | 1,7B | ONNX q4 (1,30 GB) | No disponible | Apache-2.0 | Ajuste fino ludico; ejecucion en navegador con WebGPU |
| Qwen/Qwen3-1.7B (base) | 1,7B | safetensors | 32.768 tokens (valor tipico de la familia) | Apache-2.0 | Modelo generalista con modo thinking |
| Qwen/Qwen3-1.7B (ONNX community builds) | 1,7B | ONNX (fp32/fp16/q4) | 32.768 tokens (valor tipico) | Apache-2.0 | Builds estandar de HuggingFace para transformers.js |

El modelo de locriani se diferencia de las builds ONNX estandar de Qwen3-1.7B en el ajuste fino de comportamiento (chistes ante preguntas de conteo) y en que la cuantizacion incluye tambien el embedding, reduciendo el tamano a un unico archivo de 1,30 GB.

## Limitaciones y advertencias

- Comportamiento deliberadamente no util en conteo de letras: el modelo respondera con chistes a preguntas de conteo, lo que lo hace inadecuado para cualquier aplicacion que requiera respuestas factuales a ese tipo de consultas.
- La cuantizacion a 4 bits altera las respuestas respecto al modelo fp32; la redaccion difiere y otros prompts pueden divergir mas de lo documentado.
- La salida en navegador con WebGPU no fue verificada por el autor; solo se valido con onnxruntime en CPU.
- Riesgo de alucinacion heredado del modelo base de 1,7B, amplificado por el ajuste fino y la cuantizacion; no hay evaluaciones de benchmarks que permitan cuantificarlo.
- Idiomas soportados no documentados; las validaciones publicadas estan en ingles.
- Longitud de contexto no especificada en la model card; ademas, la configuracion de exportacion necesito una correccion manual de `rope_theta`, un indicio de fragilidad en la cadena de herramientas (transformers 4.57.6 frente a formato transformers-5).
- Licencia Apache-2.0: sin restricciones para uso comercial, aunque el propio modelo tiene un proposito tan especifico (demo ludica) que limita su aplicacion practica en produccion.
- Descargas muy bajas (329) y sin likes: proyecto de autor individual sin comunidad de revision; conviene tratarlo como experimento y no como modelo mantenido.

## Enlaces

- Modelo ONNX: https://huggingface.co/locriani/terrible-joke-qwen3-1.7b-onnx
- Modelo base del ajuste fino (PyTorch): https://huggingface.co/locriani/terrible-joke-qwen3-1.7b
- Commit exacto del modelo fuente: https://huggingface.co/locriani/terrible-joke-qwen3-1.7b/tree/140d1c845919de1a72145887b347f7508f251fe5
- Modelo base Qwen3: https://huggingface.co/Qwen/Qwen3-1.7B
- Transformers.js: https://github.com/huggingface/transformers.js
