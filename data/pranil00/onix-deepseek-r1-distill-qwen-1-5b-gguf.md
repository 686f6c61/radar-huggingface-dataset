# pranil00/ONIX-DeepSeek-R1-Distill-Qwen-1.5B-GGUF

## Resumen

ONIX-DeepSeek-R1-Distill-Qwen-1.5B-GGUF es una cuantizacion en formato GGUF del modelo DeepSeek-R1-Distill-Qwen-1.5B, publicada por el usuario pranil00 bajo la etiqueta de la comunidad ONIX. Se trata de un artefacto derivado, no de un modelo entrenado desde cero: el trabajo consiste en convertir los pesos originales de DeepSeek a un esquema Q5_K_M (5,5 bits por peso) para reducir el espacio en disco y la memoria residente, manteniendo una calidad declarada del 97,5 % respecto al modelo en FP16.

El modelo base es un destilado de razonamiento de DeepSeek sobre la arquitectura Qwen2.5-1.5B, con 1.777.029.120 parametros (1,78 mil millones). Esta orientado a generacion de texto con trazas de razonamiento, y su interes principal es que cabe en hardware de consumo: el autor reporta 1,19 GB de pesos comprimidos y un perfil de memoria de 1,33 GB en Apple Silicon, 2,69 GB de VRAM en GPU NVIDIA y 3,33 GB de RAM en CPU.

La relevancia de esta ficha es doble: por un lado documenta un caso real de cuantizacion ligera para despliegue local; por otro, advierte de que la model card mezcla afirmaciones de rendimiento no verificadas con una licencia declarada Apache 2.0 sobre un derivado de un modelo con terminos propios. El repositorio tiene 0 descargas y 1 like en el momento de la consulta, por lo que debe tratarse como un artefacto experimental sin validacion de la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2.5, destilado de DeepSeek-R1); detalles exactos de capas y atencion no disponibles en la informacion proporcionada |
| Parametros totales | 1.777.029.120 (1,78 B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 8.192 tokens declarados como ventana optima en GPU y Apple Silicon; 4.096 tokens en CPU segun la model card; contexto nativo del modelo base no disponible en la informacion proporcionada |
| Tipos de cuantizacion | Q5_K_M (5,5 bits por peso); no se listan otras variantes en el repositorio |
| Idiomas soportados | no disponibles (la model card no declara lista de idiomas) |
| Licencia | apache-2.0 (declarada en la model card y en los tags de Hugging Face) |
| Formato de pesos | GGUF (fichero `deepseek-ai--DeepSeek-R1-Distill-Qwen-1.5B-Q5_K_M.gguf`) |

## Arquitectura y entrenamiento

El artefacto es una conversion de pesos, no un entrenamiento nuevo. La arquitectura subyacente corresponde al modelo base deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B, un transformer decoder-only de la familia Qwen2.5 destilado por DeepSeek a partir de su modelo de razonamiento R1. La model card no aporta detalles sobre numero de capas, dimensiones ocultas, tipo de atencion ni composicion del dataset de destilacion, por lo que esos datos deben consultarse en la ficha del modelo original.

El proceso aplicado por el autor es una cuantizacion post-entrenamiento a Q5_K_M mediante la herramienta run-any-model, un motor de optimizacion "device-adaptive" desarrollado por PranilShah-08. La model card reporta una reduccion del 65,6 % en tamano de pesos (de 3,48 GB en FP16 a 1,19 GB), un buffer de KV cache de 112 MB en FP16 y una aceleracion de las 28 capas del modelo en Metal. No se documenta calibracion, dataset de cuantizacion ni evaluacion independiente de la perdida de calidad; la cifra de "97,5 % de retencion cognitiva" es una estimacion del propio autor sin metodologia publicada.

## Capacidades

- Generacion de texto autoregresiva en ingles y otros idiomas, aunque la lista oficial de idiomas no esta declarada en el repositorio.
- Razonamiento con trazas explicitas (estilo DeepSeek-R1): el modelo base esta destilado para producir cadenas de pensamiento antes de la respuesta final.
- Razonamiento matematico basico y resolucion de problemas de varios pasos, heredado del destilado de R1 sobre Qwen2.5.
- Generacion de codigo y explicacion de fragmentos, limitada por el tamano de 1,5 B de parametros.
- Conversacion multiturno mediante plantilla de chat (la model card usa los tokens de parada `<|im_end|>` y `<|endoftext|>`, compatibles con el formato ChatML de Qwen).
- Ejecucion local en CPU, GPU y Apple Silicon mediante llama.cpp, Ollama, LM Studio, Jan o Text-Generation-WebUI.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso orquestado: no disponible en la informacion proporcionada.
- Capacidades de vision o audio: no disponibles en la informacion proporcionada (el modelo es solo texto).

## Casos de uso

- Asistente de terminal para desarrolladores: el fichero GGUF de 1,19 GB se carga con `llama-cli` o con el CLI de run-any-model y permite consultas rapidas de sintaxis, explicaciones de errores y generacion de snippets sin salir de la maquina ni enviar codigo a la nube.
- Prototipado de razonamiento en portatiles: con 1,33 GB de memoria unificada en Apple Silicon, sirve para probar pipelines de chain-of-thought y evaluar prompts de razonamiento antes de escalar a modelos mayores.
- Educacion y tutoria offline: al caber en 3,33 GB de RAM en CPU, puede desplegarse en aulas o entornos sin GPU para explicar problemas de matematicas paso a paso, con la advertencia de que la calidad en 1,5 B es limitada.
- Preprocesado y clasificacion de texto en local: generacion de resumenes cortos, extraccion de entidades o reformateo de documentos en lotes pequenos donde la privacidad impide usar APIs externas.
- Base para experimentos de cuantizacion: util como referencia para comparar Q5_K_M frente a otros esquemas (Q4_K_M, Q8_0) y medir la degradacion real en tareas de razonamiento con hardware de consumo.
- Chatbot embebido en aplicaciones de escritorio: integrable via Ollama o llama.cpp en herramientas tipo LM Studio o Jan para asistentes de documentacion local con contexto de hasta 4.096-8.192 tokens.
- Evaluacion de agentes ligeros: aunque el soporte de tool calling no esta documentado, puede usarse como generador de borradores en pipelines donde otro componente valida y ejecuta las acciones.

## Benchmarks y rendimiento

La model card incluye un "DeviceQuant Telemetry Audit Report" con metricas de memoria y compresion, no de calidad en tareas estandar. Se reproducen a continuacion tal cual, sin validacion independiente:

| Metrica | FP16 (base) | Q5_K_M (cuantizado) | Cambio |
|---|---|---|---|
| Precision en bits por parametro | 16,0 | 5,5 | -65,6 % |
| Tamano de pesos | 3,48 GB | 1,19 GB | -65,6 % |
| Buffer de KV cache | 112,0 MB | 112,0 MB | Optimizado |
| RAM residente total | 3,61 GB | 1,33 GB | -63,1 % |
| Calidad estimada | 100,0 % | 97,5 % | -2,5 % |
| Capas aceleradas | 0 % (riesgo de fallo) | 28/28 | Optimo |

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. Las cifras de "97,5 % de retencion" y "EXCELLENT (Native Fit)" proceden del propio autor y no van acompanadas de metodologia, conjunto de evaluacion ni comparacion con el modelo base.

## Requisitos de hardware

- VRAM estimada para inferencia: 2,69 GB de VRAM dedicada en GPU NVIDIA (RTX 30/40/50) segun el autor; 1,33 GB de memoria unificada en Apple Silicon (M1-M5); 3,33 GB de RAM libre en CPU x86 con AVX2/AVX-512.
- GPU recomendadas: cualquier NVIDIA con al menos 3 GB de VRAM (GTX 1650, RTX 3050 en adelante); en el extremo alto, A100 y H100 no aportan ventaja significativa por el tamano del modelo, que queda limitado por ancho de banda de memoria mas que por computo.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU moderna con 4 GB o mas de VRAM, y en iGPU con memoria compartida suficiente.
- Opciones de despliegue: llama.cpp (`llama-cli -m ... -c 4096 -ngl 99 -cnv`), Ollama (mediante Modelfile), run-any-model CLI, LM Studio, Jan y Text-Generation-WebUI. vLLM y TGI no se mencionan en la model card; su soporte GGUF es limitado en el momento de la publicacion.
- Latencia y throughput: no disponibles en la informacion proporcionada. El autor solo reporta aceleracion de las 28 capas en Metal, sin tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ONIX-DeepSeek-R1-Distill-Qwen-1.5B-GGUF (este) | 1,78 B | 4.096-8.192 tokens (declarado) | GGUF Q5_K_M, 1,19 GB | apache-2.0 (declarada) | Hugging Face, 0 descargas |
| deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B (base) | 1,78 B | no disponible en la informacion proporcionada | safetensors FP16/BF16 | MIT (modelo original de DeepSeek) | Hugging Face, ampliamente descargado |
| Qwen2.5-1.5B-Instruct | 1,54 B | 32.768 tokens (modelo original) | safetensors, GGUF multiples | Apache 2.0 | Hugging Face, oficial de Qwen |
| Llama-3.2-1B-Instruct | 1,24 B | 131.072 tokens (modelo original) | safetensors, GGUF multiples | Llama 3.2 Community License | Hugging Face, oficial de Meta |

La comparativa de rendimiento en tareas de razonamiento no esta disponible: no hay benchmarks publicados para este artefacto ni para el destilado de 1,5 B en la informacion proporcionada. En la practica, la eleccion entre estas alternativas dependera de si se prioriza el formato GGUF ya empaquetado (este repositorio), la fidelidad al modelo oficial (DeepSeek base) o la ventana de contexto amplia (Qwen2.5 y Llama 3.2, con contextos nativos muy superiores).

## Limitaciones y advertencias

- Artefacto derivado sin validacion: 0 descargas y 1 like en el momento de la consulta; no hay evidencia de que la cuantizacion haya sido evaluada por terceros.
- Las cifras de calidad (97,5 % de retencion) y de memoria son estimaciones del autor sin metodologia publicada; no deben tomarse como garantia en produccion.
- Riesgo de alucinacion elevado por el tamano: 1,5 B de parametros es insuficiente para tareas de conocimiento factual extenso, y el modo de razonamiento puede producir cadenas de pensamiento plausibles pero incorrectas.
- Contexto limitado: la model card recomienda 8.192 tokens en GPU/Apple Silicon y solo 4.096 en CPU, muy por debajo de los 32.768 tokens del Qwen2.5-1.5B original; no se documenta si el contexto nativo se preserva.
- Idiomas no declarados: no hay lista oficial de lenguas soportadas; el rendimiento en castellano no esta verificado y probablemente sea inferior al de modelos entrenados explicitamente para espanol.
- Licencia ambigua: la model card declara Apache 2.0 pero tambien menciona "Apache 2.0 / MIT" en la seccion de licencia; el modelo base de DeepSeek se distribuye bajo MIT, por lo que la combinacion de terminos debe revisarse antes de un uso comercial.
- Sin soporte documentado de tool calling ni function calling; no se recomienda para pipelines de agentes que dependan de invocacion estructurada de herramientas.
- La model card incluye una clausula de exencion de responsabilidad total que traslada al usuario toda la responsabilidad de auditar las salidas.
- El repositorio (2,3 GB) contiene mas que el fichero GGUF de 1,19 GB; conviene verificar que no haya duplicados u otros artefactos antes de desplegarlo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/pranil00/ONIX-DeepSeek-R1-Distill-Qwen-1.5B-GGUF
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B
- Organizacion ONIX: https://huggingface.co/ONIX
- Herramienta de cuantizacion run-any-model: https://github.com/PranilShah-08/run-any-model
- Repositorio de DeepSeek-R1 (paper y pesos): no disponible en la informacion proporcionada
- Demos o spaces asociados: no disponibles en la informacion proporcionada
