# BlairQ/qwen3.8_27b_idiotSavant_sm_86

## Resumen

qwen3.8_27b_idiotSavant_sm_86 es una cuantizacion int4 del modelo abliterado orcarouter/Qwen3.8-27B-Uncensored, publicada por el usuario BlairQ. El checkpoint original en BF16 ocupa unos 55 GB; esta version lo comprime a 18,6 GB con pesos int4 simetricos en grupos de 128 y rotacion del flujo residual, manteniendo 27.356.728.560 parametros reales segun los safetensors. El autor lo describe como una compilacion experimental ("work in progress") orientada a servir el modelo como W4A8, es decir, pesos int4 multiplicados por activaciones int8 sobre los tensor cores mediante Marlin en vLLM.

La innovacion principal es la rotacion Hadamard aplicada en linea: el autor mide una divergencia KL frente al BF16 de 0,0178 en tokens de asistente, frente a 0,0385 de una cuantizacion int4 AutoRound convencional, lo que supone una reduccion del 54 % del error de cuantizacion. A cambio, el checkpoint no es intercambiable con un int4 normal: `down_proj` espera su entrada multiplicada por una Hadamard de bloques de 512, y `o_proj` / `out_proj` por una Hadamard de una cabeza (256 / 128). Sin esos hooks en linea, el modelo produce salida basura.

El modelo esta ajustado y medido para sm_86 (Ampere, RTX 3090), con pipeline declarado image-text-to-text (vision-lenguaje) y soporte de en, es y zh bajo licencia Apache 2.0. Su relevancia practica es doble: demuestra que la rotacion Hadamard reduce el dano de la cuantizacion int4 en modelos de ~27B, y ofrece un camino reproducible para ejecutar un modelo de ese tamano en 2x RTX 3090 con decodificacion especulativa. Como contrapartida, pierde de forma medible en razonamiento largo y percepcion visual fina.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (image-text-to-text), con modulos GDN (`in_proj_a/b`) segun la model card; no MoE |
| Parametros totales | 27.356.728.560 (~27,36 B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No especificada en la informacion proporcionada; el autor menciona presupuestos de razonamiento de hasta 262k tokens y pruebas con topes de 81.920 y 200.000 tokens |
| Tipos de cuantizacion | W4A8: pesos int4 simetricos, grupo 128, activaciones int8; GPTQ / QuaRot con rotacion Hadamard; formato compressed-tensors |
| Idiomas soportados | en, es, zh |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors con compressed-tensors (int4 empaquetado); no hay GGUF |
| Tamano del repositorio | 31,2 GB |
| Modelo base | orcarouter/Qwen3.8-27B-Uncensored (BF16, ~55 GB), abliterado |
| Fecha de creacion / actualizacion | 2026-09-25 / 2026-10-11 (pesos actualizados in-place el 2026-09-28) |
| Descargas / likes | 165 / 2 |

## Arquitectura y entrenamiento

No hay informacion sobre el entrenamiento original en los datos proporcionados: no se detallan tokens de preentrenamiento, composicion del dataset ni si hubo RLHF o DPO. Lo que si describe la model card es la cadena de transformaciones aplicadas. Se parte de Qwen3.8-27B, se obtiene una variante abliterada (orcarouter/Qwen3.8-27B-Uncensored) en BF16 de 55 GB y sobre ella se aplica cuantizacion int4 con rotacion del flujo residual. Los pesos int4 se empaquetan en formato compressed-tensors y se sirven con Marlin en vLLM como W4A8.

La innovacion tecnica es la rotacion Hadamard en linea obligatoria. La actualizacion de pesos del 2026-09-28 anadio una Hadamard por cabeza en `o_proj` / `out_proj` y en las puertas GDN `in_proj_a/b` en int4, lo que mejoro la KL de 0,0194 a 0,0178. Esto implica que el modelo no funciona con un servidor vLLM estandar: requiere los parches Genesis PN148 y PN154 (y PN175 para cerrar automaticamente el token `</think>`), disponibles en el repositorio blairq/genesis-vllm-patches. Para acelerar la decodificacion, el autor publica un drafter separado (DFlash2) reajustado contra este modelo, que acepta 5,62 tokens por paso en codigo agentico.

## Capacidades

- Generacion de texto y razonamiento de cadena larga, con modo thinking y `reasoning_effort=xhigh`.
- Razonamiento matematico y cientifico de nivel competitivo: GPQA Diamond 91,9, LiveCodeBench v6 90,8.
- Codigo: el tag `agentic-coding` y el resultado en LiveCodeBench v6 indican uso en tareas de programacion agentica.
- Vision-lenguaje: pipeline declarado image-text-to-text; evaluado en MathVision, BabyVision, CharXiv, RealWorldQA y ERQA.
- Seguimiento de instrucciones: IFBench prompt-level loose 83,0.
- Multilingue en ingles, castellano y chino.
- Conversacional multi-turno (tag `conversational`).
- Despliegue en vLLM con kernels int4 y decodificacion especulativa mediante drafter DFlash2.
- Al estar abliterado, no aplica rechazo por contenido: responde sin las capas de alineacion del modelo original.
- Soporte de tool calling / function calling: no confirmado de forma explicita en la informacion proporcionada.

## Casos de uso

- Razonamiento cientifico asistido: con 91,9 en GPQA Diamond y una KL de 0,0178 frente a BF16, es adecuado para pipelines de respuesta a preguntas de nivel doctorado donde el coste de servir 55 GB en BF16 es prohibitivo.
- Generacion de codigo en produccion: 90,8 en LiveCodeBench v6 y un drafter que acepta 5,62 tokens por paso en codigo agentico permiten integrarlo en asistentes de IDE o revision de parches con latencia baja.
- Vision-lenguaje sobre documentos y graficos: CharXiv (RQ) 81,3 y RealWorldQA 82,0 lo hacen util para extraccion de informacion de figuras y pantallas, siempre que no se exija percepcion muy fina.
- Despliegue en hardware de consumo: al ocupar 18,6 GB en int4, cabe en una o dos RTX 3090/4090 de 24 GB, lo que habilita inferencia local de un modelo de 27B sin clúster.
- Investigacion sobre cuantizacion: sirve como caso de estudio reproducible para comparar QuaRot/GPTQ con rotacion Hadamard frente a AutoRound int4 usando la metrica de KL publicada.
- Evaluacion de modelos abliterados: permite estudiar el efecto combinado de abliteracion y cuantizacion en benchmarks de razonamiento, dado que la model card explicita que ambas cosas se mezclan en las cifras.
- Servicio de chat sin filtros para dominios creativos o de ficcion: el caracter uncensored evita rechazos en generacion de narrativa adulta o temas sensibles, bajo responsabilidad del operador.
- Evaluacion comparativa de decodificacion especulativa: el par modelo + drafter DFlash2 permite medir tasas de aceptacion de tokens en cargas reales de codigo y prosa.

## Benchmarks y rendimiento

Todos los resultados proceden de la model card y estan medidos sobre este modelo tal y como se sirve (W4A8, KV int8, especulacion de arbol DFlash2, 2x RTX 3090), con prompts y graders oficiales de Qwen3.8-27B, muestreo `temperature=1.0, top_p=0.95, top_k=20`, `reasoning_effort=xhigh` y una muestra por item. La columna BF16 son las cifras de la model card oficial de Qwen3.8-27B, no mediciones locales, por lo que la comparacion no es equivalente (mezcla abliteracion, cuantizacion y diferencias de harness). HLE y LiveCodeBench se reejecutaron con un tope de 200k tokens tras un primer intento con 81.920.

| Benchmark | idiotSavant (W4A8) | Qwen3.8-27B BF16 (card) | Delta | n |
|---|---|---|---|---|
| IFBench (prompt-level loose) | 83,0 ±4,3 | 79,5 | +3,5 | 300 |
| GPQA Diamond | 91,9 ±3,8 | 89,2 | +2,7 | 198 |
| HLE (muestra fija) | 23,6 ±3,7 (28,2 cerrando `</think>`) | 30,8 | -7,2 | 500 de 2500 |
| LiveCodeBench v6 (2025-02..05) | 90,8 ±5,0 | 90,3 | +0,5 | 131 |
| MathVision, sin interprete de codigo | 81,9 ±4,3 | 90,0 | -8,1 | 304 (testmini) |
| BabyVision, sin interprete de codigo | 46,1 ±5,0 | 65,7 | -19,6 | 388 |
| CharXiv (RQ), sin interprete de codigo | 81,3 ±2,4 | 83,7 | -2,4 | 1000 |
| RealWorldQA | 82,0 ±2,7 | 85,9 | -3,9 | 765 |
| ERQA | 67,5 ±4,6 | 65,5 | +2,0 | 400 |

Metrica de calidad de cuantizacion: KL frente a BF16 en tokens de asistente de 0,0178, frente a 0,0385 de una cuantizacion int4 AutoRound popular (-54 %). Rendimiento medido: prefill de 2.368 tok/s a 28k de contexto y 2.014 tok/s a 57k; decodificacion de ~130 tok/s en prosa con una peticion y el drafter sobre 2x RTX 3090 (medicion limitada, 2026-10-10).

## Requisitos de hardware

- VRAM para inferencia: 18,6 GB de pesos int4; con KV en int8 y contexto largo, se recomienda un margen por encima de 24 GB para ventanas amplias.
- GPU objetivo: sm_86 (Ampere). El autor lo ajusta y mide en RTX 3090; los kernels Marlin de vLLM son propios de arquitecturas Ampere y posteriores.
- Cabe en GPU de consumo: si, en RTX 3090 (24 GB) o RTX 4090; el escenario medido usa 2x RTX 3090.
- Despliegue: vLLM con los parches Genesis PN148, PN154 y PN175. Existe un compose de referencia (`compose/docker-compose.qwen38-27b-idiotsavant-sm86.yml`). No hay soporte GGUF, por lo que llama.cpp u Ollama no son opciones validas con este checkpoint.
- Aceleracion opcional: drafter DFlash2 (BlairQ/qwen3.8_27b_idiotSavant_sm_86_dflash2), con 5,62 tokens aceptados por paso en codigo agentico.
- Throughput estimado: prefill 2.368 tok/s a 28k y 2.014 tok/s a 57k; decode ~130 tok/s en prosa con una peticion y drafter.
- Requisito critico: sin las rotaciones Hadamard en linea (bloque de 512 antes de `down_proj`, una por cabeza antes de `o_proj` / `out_proj`) la salida es incorrecta.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Calidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen3.8_27b_idiotSavant_sm_86 | 27,36 B densos | no disponible | KL 0,0178; GPQA 91,9; HLE 23,6 | apache-2.0 | safetensors int4, requiere vLLM parcheado |
| orcarouter/Qwen3.8-27B-Uncensored (base) | ~27 B (BF16, 55 GB) | no disponible | referencia de la cuantizacion | no disponible | BF16 safetensors |
| Qwen3.8-27B (oficial BF16) | ~27 B | hasta 262k tokens de razonamiento segun la card | GPQA 89,2; HLE 30,8; MathVision 90,0 | no disponible en la informacion proporcionada | BF16 safetensors |
| Cuantizacion int4 AutoRound (mencionada) | ~27 B | no disponible | KL 0,0385 | no disponible | int4 convencional, desplegable en vLLM estandar |

La ventaja diferencial de este checkpoint es la fidelidad de cuantizacion (KL 0,0178 frente a 0,0385) y el rendimiento en Ampere int4; su desventaja es la dependencia de un fork de vLLM y la perdida en razonamiento largo (HLE -7,2) y percepcion fina (BabyVision -19,6).

## Limitaciones y advertencias

- No es un checkpoint int4 intercambiable: sin las rotaciones Hadamard en linea, la salida es basura. Requiere los parches Genesis de vLLM (PN148, PN154, PN175).
- Estado experimental: la propia model card lo marca como "work in progress", con la advertencia de que las cifras y los ficheros pueden cambiar.
- Perdida medible en razonamiento largo: HLE cae de 30,8 a 23,6 (o 28,2 si se cierra el `</think>` manualmente) y BabyVision de 65,7 a 46,1. La percepcion visual fina es el punto mas debil.
- Razonamiento truncado o sin cerrar: con un tope de 81.920 tokens, el 16 % de las respuestas de HLE y 10 de 131 de LiveCodeBench se cortaron; el 16 % de las respuestas de HLE terminan sin emitir `</think>` y el parser descarta la respuesta. La tasa sube con la longitud (0 % por debajo de 8k, 8 % entre 16k y 32k, 25 % entre 64k y 82k).
- Sesgos: no hay informacion sobre sesgos en los datos proporcionados. Al estar abliterado, el modelo carece de los mecanismos de rechazo del original, lo que amplifica la exposicion a contenido toxico, ilegal o danino.
- Riesgo de alucinacion: no cuantificado en la informacion proporcionada; aplican los riesgos habituales de un modelo de 27B en tareas de conocimiento abierto, agravados por la abliteracion.
- Idiomas: solo en, es y zh declarados. No hay datos de rendimiento por idioma mas alla del listado.
- Licencia: el checkpoint se declara apache-2.0, pero al derivar de un modelo abliterado de terceros conviene verificar la licencia de la cadena completa antes de uso comercial.
- Comparaciones no equivalentes: las cifras BF16 de referencia son de la model card oficial y no mediciones locales, de modo que las diferencias mezclan abliteracion, cuantizacion y harness. Ademas, HLE, CharXiv y BabyVision se evaluaron con un juez cuyo modelo no se detalla.
- Dependencia de hardware: el ajuste esta hecho para sm_86; en otras arquitecturas el comportamiento de los kernels puede diferir.
- Sin soporte GGUF: no es desplegable en llama.cpp, Ollama ni otros runners basados en GGUF.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/BlairQ/qwen3.8_27b_idiotSavant_sm_86
- Modelo base (abliterado): https://huggingface.co/orcarouter/Qwen3.8-27B-Uncensored
- Modelo oficial de referencia: https://huggingface.co/Qwen/Qwen3.8-27B
- Drafter DFlash2: https://huggingface.co/BlairQ/qwen3.8_27b_idiotSavant_sm_86_dflash2
- Repositorio de parches vLLM e infraestructura de serving: https://github.com/blairq/genesis-vllm-patches
- Compose de referencia: https://github.com/blairq/genesis-vllm-patches/blob/main/compose/docker-compose.qwen38-27b-idiotsavant-sm86.yml
- Identificadores arXiv citados en las etiquetas del repositorio: arxiv:2404.00456, arxiv:2405.16406, arxiv:2501.13484, arxiv:2604.13440 (los titulos no se detallan en la informacion proporcionada)
- La busqueda web realizada no devolvio ningun resultado relevante sobre este modelo.
