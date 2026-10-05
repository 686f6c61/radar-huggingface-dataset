# lazybrick/Qwen3.5-4B-Kiln-Glaze-W4A16

## Resumen

Qwen3.5-4B-Kiln-Glaze-W4A16 es una version cuantizada del modelo multimodal Qwen/Qwen3.5-4B, publicada por el usuario lazybrick dentro de la coleccion Kiln. Se trata de un checkpoint de pesos INT4 con activaciones en BF16 (esquema W4A16) generado con la tecnica de cuantizacion Glaze, que combina precision mixta de grano fino, redondeo y recorte aprendidos, y una asignacion de bits guiada por la sensibilidad de cada capa medida con un pase de Fisher. El objetivo es ofrecer un modelo de 4,54 mil millones de parametros que ocupe 3,80 GB en disco (frente a los 9,32 GB de la version BF16, un 2,46x menos) sin degradar de forma apreciable el rendimiento del modelo original.

La relevancia del modelo reside en su metodo de cuantizacion: en MATH-500 alcanza 83,2 puntos frente a los 83,4 del modelo BF16, mientras que los metodos uniformes de 4 bits de la misma categoria pierden entre 7,6 y 10,2 puntos. Esto lo convierte en una opcion atractiva para desplegar un modelo de vision-lenguaje de ~4B en hardware modesto conservando casi intactas las capacidades de razonamiento matematico y de instrucciones del modelo de referencia.

El checkpoint esta pensado para servirse con vLLM mediante kernels Marlin y el formato compressed-tensors, e incluye un codificador de vision almacenado en INT8 para liberar presupuesto de bytes que se reasigna a las capas mas sensibles del modelo de lenguaje.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (codificador de vision + modelo de lenguaje) derivada de Qwen3.5-4B |
| Parametros totales | 4.539.265.536 (~4,54 mil millones) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT4 simetrico con tamano de grupo 128, 64 o 32 segun capa; INT8 con grupo 128 en las capas mas sensibles y en el codificador de vision; activaciones en BF16 (sin cuantizar); `lm_head` y embeddings de tokens sin cuantizar |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 (heredada de Qwen3.5-4B) |
| Formato de pesos | safetensors en formato `compressed-tensors` (un grupo de configuracion por precision) |
| Tamano del checkpoint | 3,80 GB (BF16 de referencia: 9,32 GB) |
| Libreria | transformers |
| Pipeline | image-text-to-text |
| Revision del modelo base | 851bf6e |
| Toolkit de cuantizacion | torch 2.10.0, transformers 5.12.1, compressed-tensors 0.18.0 |

## Arquitectura y entrenamiento

El modelo es una compresion del checkpoint BF16 de Qwen/Qwen3.5-4B, un modelo multimodal de tipo image-text-to-text con un codificador de vision y un modelo de lenguaje. La cuantizacion Glaze se aplica en cinco etapas sobre los pesos BF16. Primero se construye un conjunto de calibracion in-domain con 4.419 prompts de conjuntos publicos (MATH, ARC-Challenge, SciQ y UltraChat) respondidos por el propio modelo BF16, eliminando los prompts que comparten un 13-grama con preguntas de test de MATH-500 o MMLU-Pro; el modelo cuantizado se entrena hacia las respuestas del BF16, nunca hacia respuestas doradas.

En segundo lugar se ejecuta un pase de Fisher que aproxima, mediante gradientes sobre etiquetas muestreadas, cuanto cuesta el error de cada capa en terminos de perdida de siguiente token. Despues se aplica una asignacion de precision mixta "byte-neutral": los Linears del codificador de vision se almacenan en 8 bits en lugar de BF16 y los bytes liberados se reasignan mediante un problema de mochila a las capas mas sensibles del modelo de lenguaje (8 bits para 40 de 152 unidades fusionadas, 4 bits con grupo 32 o 64 para 81, y 4 bits con grupo 128 para el resto). A continuacion se aprenden, capa por capa, el redondeo de cada peso y el recorte de cada grupo contra una perdida de reconstruccion ponderada por Fisher, con parada temprana sobre datos de validacion. El resultado se exporta a `compressed-tensors` y se sirve con kernels Marlin en vLLM estandar.

## Capacidades

- Generacion de texto conversacional en modo instruct (el protocolo de evaluacion usa `enable_thinking=False`).
- Razonamiento matematico de nivel competitivo: 83,2 en MATH-500 y 82,8 en GSM8K, practicamente identicos al BF16.
- Comprension multimodal de imagenes: evaluada en MMBench-EN (85,7), MMMU (66,7), MathVista (80,6), OCRBench (86,3) y DocVQA (95,4).
- Seguimiento de instrucciones: 82,8 en IFEval (prompt-level strict).
- Capacidad base de Qwen3.5-4B para tareas de opcion multiple y conocimiento general (MMLU-Pro 73,7; ARC-Challenge 49,6; HellaSwag 64,8).
- Soporte de tool calling / function calling: no confirmado de forma explicita en la informacion disponible (depende del modelo base Qwen3.5-4B).
- Soporte de agentes y razonamiento multi-paso: no confirmado de forma explicita en la informacion disponible.
- Multilingue: no disponible (los idiomas no se detallan para este checkpoint).
- Modo "thinking": el modelo base lo soporta, pero la evaluacion Kiln se realizo con thinking desactivado; el checkpoint conserva la plantilla de chat del base.

## Casos de uso

- Asistente de matematicas y resolucion de problemas: con 83,2 en MATH-500 y 82,8 en GSM8K, es adecuado para tutoria o resolucion paso a paso de ejercicios de nivel secundaria y universitario sin el coste de un modelo BF16.
- Analisis de documentos escaneados: 95,4 de ANLS en DocVQA y 86,3 en OCRBench permiten extraer y responder preguntas sobre facturas, formularios o PDF escaneados en un pipeline de digitalizacion.
- Razonamiento visual sobre diagramas tecnicos: 80,6 en MathVista lo hace util para interpretar graficos, tablas y figuras en material cientifico o educativo.
- Atencion al cliente con soporte de imagenes: al ser un modelo image-text-to-text de ~4,5B desplegable en una sola GPU, puede gestionar conversaciones donde el usuario adjunta capturas de pantalla o fotos de productos.
- Generacion de codigo asistida dentro de un IDE local: el modelo cabe en GPUs de consumo, lo que permite un asistente de codigo on-premise sin enviar codigo a servicios externos.
- Despliegue en edge o en entornos con VRAM limitada: con 3,80 GB de pesos, se puede servir en tarjetas de gama media para tareas de vision-lenguaje a bajo coste.
- Evaluacion y benchmarking interno: al mantener casi el rendimiento del BF16, sirve como sustituto eficiente en pipelines de evaluacion automatizada donde el BF16 es demasiado costoso.
- Moderacion de contenido multimodal: puede clasificar texto e imagenes combinados en flujos de revision, aunque no se documentan metricas especificas de seguridad.

## Benchmarks y rendimiento

Todos los modelos se evaluaron bajo un protocolo fijo (modo instruct, `enable_thinking=False`, decodificacion greedy, hasta 8.192 tokens generados; texto con lm-evaluation-harness 0.4.13 sobre vLLM 0.29.0; vision con VLMEvalKit revision `34a64e6`).

| Tarea | Metrica | BF16 (referencia) | AutoRound W4A16 g128 | Glaze W4A16 |
|---|---|---:|---:|---:|
| MMLU-Pro | exact match | 74,6 | 72,8 | 73,7 |
| GSM8K | exact match, flexible extract | 83,2 | 82,3 | 82,8 |
| MATH-500 | math_verify | 83,4 | 73,2 | 83,2 |
| IFEval | prompt-level strict | 82,3 | 80,6 | 82,8 |
| HellaSwag | acc_norm | 65,4 | 64,8 | 64,8 |
| ARC-Challenge | acc_norm | 51,1 | 50,0 | 49,6 |
| WikiText-2 | word perplexity (menor es mejor) | 10,95 | 11,45 | 11,30 |
| MMBench-EN dev v1.1 | accuracy | 85,4 | 84,7 | 85,7 |
| MMMU (val) | accuracy | 69,6 | 66,9 | 66,7 |
| MathVista (mini) | accuracy | 81,0 | 80,3 | 80,6 |
| OCRBench | score | 86,3 | 87,2 | 86,3 |
| DocVQA (val) | ANLS | 95,3 | 95,3 | 95,4 |
| TextVQA (val) | accuracy | 82,8 | 82,5 | 82,2 |

Comparaciones pareadas (bootstrap, intervalos de confianza al 95%), Glaze menos AutoRound: MATH-500 +10,0 puntos [+6,6, +14,0]; IFEval +2,2 [−0,6, +5,0]; MMLU-Pro (subconjunto fijo de 1.001 preguntas) −0,3 [−2,4, +2,0]. Glaze menos BF16 en MATH-500: −0,2 [−3,4, +2,8].

Acuerdo a nivel de token con BF16 (reproduciendo 1.501 respuestas propias del BF16 en MATH-500 y MMLU-Pro, 2,3 millones de tokens): Glaze elige un token distinto al top de BF16 en el 3,29% de las posiciones (AutoRound 4,96%, INT8 W8A8 2,42%), y su exceso de perdida sobre BF16 es de 0,014 nats por token (AutoRound 0,042; INT8 W8A8 0,011).

## Requisitos de hardware

- VRAM para pesos: aproximadamente 3,80 GB en el formato cuantizado INT4/INT8 tal como se distribuye (estimacion basada en el tamano del checkpoint).
- VRAM adicional: las activaciones se mantienen en BF16, sin cuantizar, y hay que anadir la cache KV; la VRAM total depende de la longitud de contexto y del tamano de lote, datos no disponibles.
- GPU de gama alta: A100, H100 o similares para maximizar throughput con vLLM y lotes grandes.
- GPU de consumo: al tratarse de un checkpoint de ~3,8 GB, cabe con comodidad en tarjetas consumer con 8 GB o mas de VRAM (por ejemplo RTX 3060 12 GB, RTX 4070, RTX 4090). Los calculos de kernels Marlin requieren arquitecturas compatibles con vLLM.
- Opciones de despliegue: vLLM con kernels Marlin (soporte explicito en la model card). Otros backends como llama.cpp, Ollama o TGI no se mencionan para este formato concreto; al estar en `compressed-tensors` el soporte depende del backend.
- Latencia y throughput: no disponibles (no se publican mediciones).

## Comparativa con modelos similares

| Modelo | Parametros | Precision | Tamano | MATH-500 | MMLU-Pro | Licencia |
|---|---|---:|---:|---:|---:|---|
| Qwen3.5-4B-Kiln-Glaze-W4A16 | ~4,54B | INT4/INT8 (W4A16) | 3,80 GB | 83,2 | 73,7 | apache-2.0 |
| Qwen3.5-4B-Kiln-AutoRound-W4A16-g128 | ~4,54B | INT4 uniforme (W4A16) | ~3,805 GB (5 MB mayor) | 73,2 | 72,8 | apache-2.0 |
| Qwen3.5-4B (BF16) | ~4,54B | BF16 | 9,32 GB | 83,4 | 74,6 | apache-2.0 |
| Variante INT8 W8A8 (mencionada en la model card) | no disponible | INT8 | no disponible | no disponible | no disponible | no disponible |

Glaze mantiene el rendimiento del BF16 en MATH-500 e IFEval a un tamano de 4 bits, y supera claramente a la cuantizacion uniforme AutoRound en razonamiento matematico, aunque pierde ligeramente en ARC-Challenge (49,6 frente a 51,1 del BF16 y 50,0 de AutoRound).

## Limitaciones y advertencias

- MATH-500 no muestra degradacion significativa, pero ARC-Challenge cae por debajo tanto del BF16 como de AutoRound (49,6 frente a 51,1 y 50,0), lo que indica perdida de rendimiento en algunas tareas.
- Los dominios de calibracion (matematicas y ciencia de opcion multiple) se solapan a proposito con los dominios de benchmark; las preguntas de entrenamiento de ARC-Challenge se usaron para calibracion y no se comprobaron contra el split de test, por lo que la cifra de ARC-Challenge debe interpretarse con cautela.
- Las cifras de benchmark no son comparables con las de la model card oficial de Qwen3.5-4B, que reporta modo thinking con muestreo y presupuestos de 32.768 a 81.920 tokens, junto con prompts de respuesta especificos.
- Las evaluaciones repetidas de un mismo modelo en GPUs distintas difieren en torno a 1-2 puntos, lo que introduce ruido en la comparacion.
- Riesgo de alucinacion: no se documenta de forma especifica para este checkpoint; al ser una cuantizacion del base, hereda el comportamiento del modelo original.
- Sesgos conocidos: no disponibles en la informacion proporcionada.
- Limites de idioma y de contexto: no disponibles.
- Restricciones de licencia: la licencia es apache-2.0, heredada de Qwen3.5-4B, lo que en principio permite uso comercial; conviene revisar el archivo LICENSE del modelo base para confirmar condiciones.
- Formato: el checkpoint esta en `compressed-tensors`, por lo que el despliegue optimizado se realiza con vLLM; otros backends pueden no soportarlo directamente.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no cuenta con validacion de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/lazybrick/Qwen3.5-4B-Kiln-Glaze-W4A16
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-4B/blob/main/LICENSE
- Baseline AutoRound W4A16 g128: https://huggingface.co/lazybrick/Qwen3.5-4B-Kiln-AutoRound-W4A16-g128
- Coleccion Kiln (Qwen3.5-4B compressions): https://huggingface.co/collections/lazybrick/kiln-qwen35-4b-fired-small-6ac04982f4f1ce50a97da56d
- Dataset de evaluacion kiln-evals: https://huggingface.co/datasets/lazybrick/kiln-evals
- lm-evaluation-harness: https://github.com/EleutherAI/lm-evaluation-harness
- VLMEvalKit: https://github.com/open-compass/VLMEvalKit
