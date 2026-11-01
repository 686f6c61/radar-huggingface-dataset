# Slavish123/suvidya-600m

## Resumen

Suvidya-600M es un modelo de razonamiento matematico de 596 millones de parametros desarrollado por Slavish123, afinado a partir de Qwen/Qwen3-0.6B. Su proposito es resolver problemas matematicos de competicion y de nivel escolar mediante generacion y ejecucion de codigo Python, una tecnica conocida como TIR (Tool-Integrated Reasoning). El modelo se distribuye con licencia Apache 2.0 y en formato GGUF para su uso con Ollama.

El modelo aborda un nicho concreto: tareas de matematicas donde el razonamiento simbolico puro falla y conviene delegar el calculo en un interprete de Python. Con solo 0,6 mil millones de parametros, su interes radica en la eficiencia y en la posibilidad de ejecutarse en hardware muy modesto, no en competir con modelos frontera.

La relevancia actual es limitada pero clara para experimentacion: es un ejemplo de modelo pequeno especializado en TIR, entrenado sobre NVIDIA/OpenMathInstruct-2, con soporte nativo de Ollama y una ventana de contexto heredada de Qwen3-0.6B. La informacion publica disponible es escasa y no cubre detalles de entrenamiento, contexto exacto ni composicion del dataset.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen/Qwen3-0.6B); detalles no disponibles |
| Parametros totales | 596.049.920 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (cuantizaciones concretas no disponibles) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF; repo de 1,6 GB (safetensors del modelo base no confirmados en el repo) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3-0.6B, un transformer decoder-only de la familia Qwen3. No se dispone de informacion publica sobre modificaciones estructurales, atencion, tokenizador ni configuracion de capas mas alla del modelo base. El autor no documenta si hubo cambios en la arquitectura respecto al checkpoint original.

El entrenamiento se realizo mediante ajuste fino supervisado sobre el dataset nvidia/OpenMathInstruct-2, orientado a problemas matematicos con soluciones paso a paso. La innovacion declarada es el enfoque TIR: el modelo genera codigo Python que se ejecuta para obtener el resultado numerico, en lugar de depender exclusivamente del razonamiento en lenguaje natural. No se documenta el numero de tokens de entrenamiento, la composicion exacta del dataset, ni si se aplicaron RLHF, DPO u otras tecnicas de alineacion.

## Capacidades

- Razonamiento matematico con TIR: genera y ejecuta codigo Python para resolver problemas aritmeticos y de competicion.
- Generacion de codigo Python basica, orientada al calculo (HumanEval Pass@1 de 24,39 %).
- Resolucion de problemas de matematicas escolares y de competicion (GSM8K, MATH-500).
- Razonamiento de sentido comun y preguntas de opcion multiple (ARC-Challenge, 25-shot).
- Conversacion multi-turno: la etiqueta `conversational` sugiere soporte de chat, aunque no se detalla el formato.
- Soporte de tool calling / function calling: no disponible como capacidad documentada; el TIR es el unico mecanismo de herramientas descrito.
- Capacidades de agente multi-paso: no documentadas.
- Capacidades multilingues: solo ingles declarado.
- Modo thinking, vision o audio: no disponibles.

## Casos de uso

- Resolucion de problemas matematicos escolares: el modelo genera codigo Python y lo ejecuta para calcular resultados de aritmetica y algebra, lo que reduce errores de calculo frente a la generacion directa de la respuesta.
- Prototipado de tutores matematicos: integrado en un pipeline que ejecuta el codigo generado y devuelve la solucion al estudiante, aprovechando su entrenamiento sobre OpenMathInstruct-2.
- Evaluacion de tecnicas TIR en investigacion: sirve como baseline pequeno y reproducible para comparar estrategias de tool-integrated reasoning sin requerir GPU de gama alta.
- Despliegue en entornos con recursos limitados: al ser un modelo de 0,6 B en GGUF, puede ejecutarse en CPU o GPU consumer para tareas de calculo acotadas.
- Generacion de scripts de calculo: util para producir fragmentos de Python que resuelven formulas y operaciones concretas en pipelines de datos.
- Experimentacion educativa con Ollama: su Modelfile permite desplegarlo rapidamente en un entorno local para pruebas de razonamiento matematico.
- Filtrado y generacion de problemas matematicos sinteticos: puede emplearse como generador auxiliar en la creacion de datasets de matematicas con verificacion por ejecucion.

## Benchmarks y rendimiento

Datos publicados por el autor en la model card:

| Benchmark | Resultado | Nota |
|---|---|---|
| GSM8K | 62,4 % | Pass@1, TIR |
| MATH-500 | 34,0 % | Pass@1, TIR |
| HumanEval | 24,39 % | Pass@1 (Python) |
| ARC-Challenge | 42,41 % | 25-shot (supera al Qwen3-0.6B base) |

No se han publicado resultados de benchmarks adicionales ni comparativas detalladas con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB en cuantizacion de 4 bits; en torno a 1,2-1,5 GB en FP16 para los 596 M de parametros, mas overhead de contexto.
- GPU recomendadas: cualquier GPU consumer con 4 GB o mas de VRAM (GTX 1650, RTX 3050, RTX 4060); tambien funciona en CPU.
- Cabe en GPU consumer: si, practicamente en cualquier GPU moderna e incluso en Raspberry Pi con cuantizacion agresiva.
- Opciones de despliegue: Ollama (soporte oficial via Modelfile), llama.cpp para GGUF; vLLM y TGI no estan documentados para este checkpoint.
- Latencia y throughput: no disponibles. Por tamano, se espera inferencia en tiempo real en GPU consumer, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Suvidya-600M | 596 M | no disponible | TIR matematico | Apache 2.0 | GGUF / Ollama |
| Qwen3-0.6B (base) | 596 M | no disponible | Generalista | Apache 2.0 | safetensors, GGUF |
| Modelos matematicos pequenos tipo Qwen2.5-Math-1.5B | 1,5 B | no disponible | Matematicas | Apache 2.0 | safetensors, GGUF |

La comparativa cuantitativa con alternativas no esta disponible en la informacion proporcionada; solo se conoce que Suvidya-600M supera al Qwen3-0.6B base en ARC-Challenge segun el autor.

## Limitaciones y advertencias

- Solo soporta ingles; no se declaran capacidades en castellano ni en otros idiomas.
- Riesgo elevado de alucinacion en matematicas cuando el codigo generado no se ejecuta o falla; el rendimiento depende del interprete Python externo.
- Los benchmarks son autoinformados por el autor y no han sido verificados de forma independiente.
- HumanEval de 24,39 % indica capacidad de codigo limitada; no es adecuado como modelo de programacion general.
- Longitud de contexto no documentada, lo que impide planificar su uso en conversaciones largas o documentos extensos.
- Sin datos sobre sesgos, composicion del dataset de ajuste ni procesos de alineacion.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de documentacion sobre procedencia de datos de entrenamiento exige cautela en produccion.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en produccion ni de mantenimiento activo.
- No se documenta soporte de tool calling estandar ni de agentes multi-paso, mas alla del bucle TIR.

## Enlaces

- HuggingFace: https://huggingface.co/Slavish123/suvidya-600m
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B
- Dataset de entrenamiento: https://huggingface.co/datasets/nvidia/OpenMathInstruct-2
- Modelfile para Ollama: https://huggingface.co/Slavish123/suvidya-600m/resolve/main/Modelfile
