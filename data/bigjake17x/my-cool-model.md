# bigjake17x/my-cool-model

## Resumen

bigjake17x/my-cool-model es una version "decensored" (abliterated) del modelo instructivo dphn/Dolphin3.0-Llama3.1-8B, obtenida aplicando la herramienta Heretic v1.3.0 sobre los pesos originales. El modelo subyacente es un transformer decoder-only denso de aproximadamente 8.000 millones de parametros, derivado a su vez de meta-llama/Llama-3.1-8B, con una longitud de contexto heredada de 128.000 tokens y licencia Llama 3.1 Community License. La intervencion no consiste en un reentrenamiento, sino en una ablacion direccional de los pesos de atencion y de la MLP destinada a suprimir la direccion interna asociada a los rechazos.

El interes de esta ficha es doble. Por un lado, documenta el resultado tecnico de la abliteracion: las metricas declaradas por el autor indican una tasa de rechazo de 0/100 frente a 27/100 del modelo original, con una divergencia KL de 0,0082 respecto a este, lo que sugiere que la intervencion altera poco la distribucion de salida general. Por otro, sirve como ejemplo reproducible de la tecnica, ya que el repositorio incluye los parametros exactos de ablacion y un directorio `reproduce` con el procedimiento.

Conviene senalar desde el principio que el repositorio presenta un tamano de 0,0 GB, cero descargas y cero valoraciones, y que el `model-index` de la model card identifica el modelo como "Dolphin3.0-Llama3.1-8B" en lugar de con su propio identificador. Esto apunta a que la model card se ha copiado del modelo original y a que los pesos podrian no estar efectivamente subidos. Cualquier evaluacion practica debe verificar este extremo antes de asumir nada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (familia Llama 3.1) |
| Parametros totales | ~8.000 millones (heredados de meta-llama/Llama-3.1-8B) |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | 128.000 tokens (heredada del modelo base; no confirmada explicitamente en la model card) |
| Tipos de cuantizacion | No disponible en la informacion proporcionada; el repositorio solo declara pesos safetensors |
| Idiomas soportados | en (ingles) segun los metadatos; el modelo base declara oficialmente 8 idiomas (en, de, fr, it, pt, hi, es, th) |
| Licencia | llama3.1 (Llama 3.1 Community License) |
| Formato de pesos | safetensors |
| Modelo base | meta-llama/Llama-3.1-8B (via dphn/Dolphin3.0-Llama3.1-8B) |
| Tamano del repositorio | 0,0 GB segun HuggingFace |
| Descargas / valoraciones | 0 / 0 |
| Fecha de publicacion | 28 de septiembre de 2026 |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base Llama 3.1 8B: un transformer decoder-only denso con normalizacion RMSNorm, activacion SwiGLU en la red feed-forward, codificacion posicional rotatoria (RoPE) y atencion con consultas agrupadas (grouped-query attention). No hay innovaciones arquitectonicas propias: el valor diferencial del modelo esta exclusivamente en la modificacion posterior de los pesos.

El entrenamiento original de Dolphin 3.0 consistio en un ajuste supervisado (SFT) sobre una mezcla amplia de datasets, entre los que se declaran OpenCoder-LLM/opc-sft-stage1 y stage2, microsoft/orca-agentinstruct-1M-v1, microsoft/orca-math-word-problems-200k, NousResearch/hermes-function-calling-v1, AI-MO/NuminaMath-CoT y NuminaMath-TIR, allenai/tulu-3-sft-mixture, cognitivecomputations/dolphin-coder, HuggingFaceTB/smoltalk, cognitivecomputations/samantha-data, m-a-p/CodeFeedback-Filtered-Instruction y m-a-p/Code-Feedback. Este modelo concreto no anade entrenamiento adicional: la abliteracion se aplica directamente sobre los pesos ya ajustados.

La tecnica de abliteration, implementada con Heretic v1.3.0, identifica una direccion en el espacio de activaciones asociada al comportamiento de rechazo y la sustrae de determinadas matrices de pesos. Los parametros declarados son: `direction_index` 18,47; sobre `attn.o_proj`, `max_weight` 1,37 en la posicion 24,23 y `min_weight` 1,34 con distancia 17,25; sobre `mlp.down_proj`, `max_weight` 0,98 en la posicion 30,68 y `min_weight` 0,70 con distancia 17,75. El resultado reportado es una divergencia KL de 0,0082 frente al modelo original y cero rechazos en 100 peticiones, frente a 27 en el modelo sin modificar.

## Capacidades

- Generacion de texto e instrucciones de proposito general, con plantilla de chat de Llama 3.1.
- Razonamiento de multiples pasos y tareas agenticas, apoyado en el dataset orca-agentinstruct-1M-v1 incluido en el ajuste.
- Llamada a herramientas y function calling, con NousResearch/hermes-function-calling-v1 como fuente declarada de entrenamiento.
- Generacion y revision de codigo, reforzada por OpenCoder-LLM, CodeFeedback y dolphin-coder.
- Razonamiento matematico y resolucion de problemas paso a paso, a partir de NuminaMath-CoT y NuminaMath-TIR.
- Conversacion de caracter general y datos de tipo roleplay (samantha-data, smoltalk).
- Comportamiento con filtros de rechazo suprimidos: el modelo no declina peticiones que el modelo original rechazaria en aproximadamente el 27 % de los casos de prueba.
- Capacidad multilingue limitada: los metadatos solo declaran ingles, aunque el modelo base soporta oficialmente otros idiomas.
- No dispone de vision, audio ni modo de pensamiento explicito (thinking mode) segun la informacion disponible.

## Casos de uso

- Investigacion sobre alineacion y mecanismos de rechazo: el modelo permite comparar activaciones y distribuciones de salida frente al Dolphin 3.0 original, con una divergencia KL medida de 0,0082 y una diferencia de 27 puntos en tasa de rechazo.
- Red teaming y evaluacion de guardarrailes: util para comprobar si un clasificador de seguridad externo detecta contenido que un modelo abliterated si genera, sirviendo de banco de pruebas para sistemas de moderacion.
- Generacion creativa sin filtros: escritura de ficcion, guiones o narrativa con tematicas adultas o violentas, donde el modelo original declinaria la peticion.
- Asistente conversacional autoalojado: al ser un modelo de 8B, se puede ejecutar en una GPU de consumo con cuantizacion de 4 bits, lo que permite desplegarlo en local sin enviar datos a terceros.
- Generacion de codigo en pipelines internos: con soporte de function calling y entrenamiento sobre datasets de codigo, puede integrarse en asistentes de desarrollo, siempre que el licenciamiento y el riesgo de contenido no filtrado se gestionen de forma explicita.
- Generacion de datos sinteticos para ajuste posterior: el modelo puede producir conversaciones y pares instruccion-respuesta para destilarlos en modelos mas pequenos, con la advertencia de que hereda sesgos y posibles alucinaciones.
- Evaluacion de robustez de sistemas: medir como responde un asistente cuando se le presentan peticiones ambiguas o potencialmente daninas, usando este modelo como extremo del espectro.
- Reproduccion de experimentos de abliteration: el repositorio incluye los parametros exactos y un directorio `reproduce`, lo que permite replicar el proceso sobre la misma base o sobre otras.

## Benchmarks y rendimiento

Los siguientes resultados estan declarados por el autor en el `model-index` de la model card y figuran bajo el nombre "Dolphin3.0-Llama3.1-8B". Todos tienen `verified: false`, es decir, no han sido verificados de forma independiente. Corresponden al modelo original, no necesariamente al modelo abliterated publicado en este repositorio.

| Benchmark | Configuracion | Metrica | Valor |
|---|---|---|---|
| IFEval | 0-shot | precision media (inst-level y prompt-level estricta) | 76,21 |
| BBH | 3-shot | precision normalizada | 27,63 |
| MATH Lvl 5 | 4-shot | exact match | 10,50 |
| GPQA | 0-shot | acc_norm | 4,36 |
| MuSR | 0-shot | acc_norm | 8,97 |
| MMLU-Pro | 5-shot | accuracy | 22,13 |

Metricas comparativas declaradas en la model card para el proceso de abliteration:

| Metrica | Este modelo | Modelo original (dphn/Dolphin3.0-Llama3.1-8B) |
|---|---|---|
| Divergencia KL | 0,0082 | 0 (por definicion) |
| Rechazos | 0/100 | 27/100 |

No se han publicado resultados de benchmarks propios del modelo abliterated en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para pesos en BF16/FP16: en torno a 16 GB solo de pesos, mas overhead de activaciones y cache KV; se recomienda un minimo de 20-24 GB.
- Cuantizacion INT8: aproximadamente 8-9 GB de VRAM.
- Cuantizacion Q4_K_M (GGUF): en torno a 4,9 GB; Q5_K_M alrededor de 5,7 GB; Q8_0 cerca de 8,5 GB.
- GPU profesionales: A100 (40/80 GB), H100, L40S. La model card original de Dolphin 3.0 menciona 16x L40S y 8x H100 para el entrenamiento y las evaluaciones, no para inferencia de usuario final.
- GPU de consumo: cabe en una RTX 3060 de 12 GB con cuantizacion Q4 o Q5; comodo en RTX 4070 Ti, 4080 y 4090 en FP16 (24 GB).
- Apple Silicon: ejecutable en equipos con 16 GB o mas de memoria unificada mediante llama.cpp u Ollama con cuantizacion de 4 bits.
- Opciones de despliegue: vLLM, TGI, SGLang, llama.cpp, Ollama, LM Studio y transformers con aceleracion por bitsandbytes.
- Latencia y throughput: no se han publicado mediciones especificas para este modelo. A modo orientativo para un transformer denso de 8B en BF16 sobre una RTX 4090, cabria esperar decenas de tokens por segundo en un solo flujo y valores mas altos con batching en vLLM; son estimaciones de clase, no medidas del modelo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Comportamiento ante rechazos | Disponibilidad |
|---|---|---|---|---|---|
| bigjake17x/my-cool-model | ~8B | 128.000 tokens (heredado) | Llama 3.1 Community | 0/100 declarados | Repositorio de 0,0 GB, 0 descargas |
| dphn/Dolphin3.0-Llama3.1-8B | ~8B | 128.000 tokens | Llama 3.1 Community | 27/100 declarados | Publico y ampliamente distribuido |
| meta-llama/Llama-3.1-8B-Instruct | ~8B | 128.000 tokens | Llama 3.1 Community | No disponible en la informacion proporcionada | Publico, con gate de acceso |

La diferencia principal frente al Dolphin 3.0 original es la supresion de la direccion de rechazo, con un coste declarado en divergencia KL de 0,0082. Frente a Llama-3.1-8B-Instruct, el cambio no es solo de filtros: Dolphin 3.0 anade un ajuste SFT sobre datasets orientados a codigo, matematicas, agentes y function calling. No se dispone de datos comparativos verificados de rendimiento entre los tres modelos mas alla de los declarados por el autor.

## Limitaciones y advertencias

- El repositorio indica 0,0 GB de tamano, 0 descargas y 0 valoraciones. Es posible que los pesos no esten subidos o que el repositorio sea una plantilla; conviene verificarlo antes de cualquier uso.
- El `model-index` de la model card identifica el modelo como "Dolphin3.0-Llama3.1-8B", no como bigjake17x/my-cool-model, lo que sugiere que el contenido se ha copiado del modelo original y que parte de la documentacion puede no describir con precision este artefacto.
- Todos los resultados de benchmarks tienen `verified: false`. No hay evaluacion independiente y ademas corresponden al modelo sin abliterar.
- Los valores de BBH (27,63), GPQA (4,36), MuSR (8,97) y MMLU-Pro (22,13) son bajos para un modelo de 8B y sugieren un rendimiento limitado en razonamiento complejo incluso antes de la abliteracion.
- La abliteration puede degradar capacidades adicionales que no se miden en la model card. No se ha publicado una comparacion completa entre el modelo original y esta version.
- La supresion de rechazos implica que el modelo puede generar contenido ofensivo, violento, sexual, ilegal o peligroso. La responsabilidad del uso recae integramente en quien lo despliega; se recomienda no exponerlo directamente a usuarios finales sin una capa de moderacion.
- La licencia llama3.1 impone restricciones: obligacion de incluir el aviso "Built with Meta Llama 3.1", politica de uso aceptable, clausula especifica para productos con mas de 700 millones de usuarios mensuales y prohibicion de usar las salidas para entrenar otros modelos de lenguaje. Es responsabilidad del usuario revisar el texto completo de la licencia.
- Solo se declara ingles. El rendimiento en castellano u otros idiomas no esta documentado y, aunque el modelo base soporte oficialmente varios idiomas, la abliteration puede afectar de forma desigual a idiomas poco representados en el ajuste.
- Riesgo de alucinacion propio de un modelo denso de 8B, no mitigado por la abliteration y potencialmente agravado si el proceso reduce la coherencia interna.
- Aunque el contexto nominal sea de 128.000 tokens, el recuerdo efectivo suele degradarse bastante antes de ese limite en modelos de esta escala.
- La model card original menciona el uso de la herramienta Heretic v1.3.0 y enlaza un directorio `reproduce`, pero no se ha verificado de forma externa que el procedimiento sea replicable con los parametros indicados.
- Las busquedas web realizadas no han devuelto informacion adicional relevante sobre este modelo concreto: los resultados apuntan a otros repositorios homonimos sin relacion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/bigjake17x/my-cool-model
- Perfil del autor en GitHub: https://github.com/bigjake17x
- Modelo original sin abliterar: https://huggingface.co/dphn/Dolphin3.0-Llama3.1-8B
- Herramienta de abliteration Heretic: https://github.com/p-e-w/heretic
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B
- Coleccion Dolphin 3.0: https://huggingface.co/collections/cognitivecomputations/dolphin-30-677ab47f73d7ff66743979a3
- Open LLM Leaderboard: https://huggingface.co/spaces/open-llm-leaderboard/open_llm_leaderboard
- Servidor de Discord de Cognitive Computations: https://discord.gg/cognitivecomputations
