# Dennisthemennis69/Dolphin3.0-Qwen2.5-1.5B-GGUF

## Resumen

Dolphin3.0-Qwen2.5-1.5B-GGUF es la version cuantizada en formato GGUF del modelo Dolphin3.0-Qwen2.5-1.5B, un ajuste fino supervisado desarrollado por Cognitive Computations sobre la base Qwen2.5-1.5B de Alibaba. El repositorio aqui descrito (Dennisthemennis69/Dolphin3.0-Qwen2.5-1.5B-GGUF) es una copia redistribuida de la cuantizacion original de bartowski, generada con llama.cpp (release b4418) y la opcion imatrix, e incluye la practica totalidad de los niveles de cuantizacion habituales de esa herramienta.

El modelo resuelve tareas de generacion de texto conversacional y asistencia general en un tamano muy reducido: 1.543.714.304 parametros (aproximadamente 1,5B), lo que permite ejecutarlo en hardware de consumo, telefonos, portatiles e incluso en CPU. Su relevancia actual radica en que combina un pipeline de ajuste con tool calling, matematicas y codigo (heredado de la mezcla de datasets de Dolphin 3.0) con un peso de fichero que va desde 0,78 GB en las cuantizaciones mas agresivas hasta 6,18 GB en F32.

La arquitectura base es Qwen2 (transformer decoder-only con atencion agrupada por consultas), con 28 capas, dimension oculta de 1536 y 12 cabezas de atencion. Esta licenciado bajo Apache-2.0 y esta pensado principalmente para ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2 (transformer decoder-only), 28 capas, hidden size 1536, 12 cabezas de atencion |
| Parametros totales | 1.543.714.304 (aproximadamente 1,5B) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 32.768 tokens heredados de Qwen2.5-1.5B; no confirmado de forma explicita en la model card proporcionada |
| Tipos de cuantizacion | GGUF: F32, F16, Q8_0, Q6_K_L, Q6_K, Q5_K_L, Q5_K_M, Q5_K_S, Q4_K_L, Q4_K_M, Q4_K_S, Q4_1, Q4_0, IQ4_NL, IQ4_XS, Q3_K_XL, Q3_K_L, Q3_K_M, Q3_K_S, IQ3_M (y variantes adicionales de la serie Q2/IQ2/IQ3 segun llama.cpp) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base no cuantizado) |

## Arquitectura y entrenamiento

El modelo base Dolphin3.0-Qwen2.5-1.5B parte de Qwen2.5-1.5B, un transformer decoder-only con atencion de consultas agrupadas (GQA), normalizacion RMSNorm y RoPE. Segun los datos disponibles, cuenta con 28 capas de transformer, una dimension oculta de 1536 y 12 cabezas de atencion. La cuantizacion del repositorio se realizo con llama.cpp release b4418 empleando el metodo imatrix, que calcula una matriz de importancia a partir de un dataset de calibracion para reducir la perdida de calidad en los niveles bajos de bits.

El proceso de entrenamiento del modelo base es un ajuste fino supervisado (SFT) sobre una mezcla amplia de datasets, sin que la model card proporcione el numero total de tokens ni detalles sobre etapas posteriores de RLHF o DPO. Los datasets declarados incluyen OpenCoder (opc-sft-stage1 y stage2), microsoft/orca-agentinstruct-1M-v1, microsoft/orca-math-word-problems-200k, NousResearch/hermes-function-calling-v1, AI-MO/NuminaMath-CoT, AI-MO/NuminaMath-TIR, allenai/tulu-3-sft-mixture, cognitivecomputations/dolphin-coder, HuggingFaceTB/smoltalk, cognitivecomputations/samantha-data, m-a-p/CodeFeedback-Filtered-Instruction y m-a-p/Code-Feedback. Esta composicion orienta el modelo hacia conversacion, codigo, matematicas y uso de herramientas, con cierto enfasis en agentes (orca-agentinstruct) y function calling (hermes-function-calling).

Cabe senalar que el repositorio de Dennisthemennis69 reproduce la model card y los ficheros de la cuantizacion de bartowski, por lo que no aporta un proceso de cuantizacion propio documentado.

## Capacidades

- Generacion de texto conversacional multi-turno en ingles.
- Razonamiento matematico basico-derivado de la mezcla NuminaMath (CoT y TIR).
- Generacion y asistencia de codigo, apoyada en los datasets OpenCoder, CodeFeedback y dolphin-coder.
- Soporte de function calling / tool calling, procedente de hermes-function-calling-v1.
- Capacidades orientadas a agentes y razonamiento multi-paso, segun el dataset orca-agentinstruct.
- Formato de prompt ChatML (`<|im_start|>...<|im_end|>`), compatible con plantillas de chat estandar.
- Ejecucion local en CPU, GPU de consumo y dispositivos con poca memoria gracias al formato GGUF.
- Capacidades multilingues: limitadas, el modelo se declara solo en ingles.
- No se declaran capacidades de vision, audio ni modo de razonamiento explicito (thinking mode) en la informacion disponible.

## Casos de uso

- Asistente conversacional local en el escritorio: con cuantizacion Q4_K_M (0,99 GB) el modelo puede cargarse en portatiles con 8 GB de RAM y mantener conversaciones multi-turno sin conexion.
- Autocompletado ligero en editores de codigo: su tamano permite integraciones embebidas que responden en milisegundos en GPU de gama baja, utiles para sugerencias de fragmentos cortos.
- Prototipado rapido de agentes con tool calling: la mezcla de hermes-function-calling y orca-agentinstruct permite experimentar con llamadas a funciones antes de escalar a modelos mayores.
- Generacion de respuestas en dispositivos moviles o edge: las cuantizaciones IQ3/IQ4 (0,78-0,94 GB) caben en telefonos y placas tipo Raspberry Pi, habilitando asistentes offline.
- Filtrado y clasificacion de texto en pipelines: al ser un modelo pequeno y rapido, sirve para etiquetar, resumir o reescribir grandes volumenes de texto con coste minimo.
- Educacion y demostraciones: permite ilustrar como funciona un LLM conversacional en talleres o aulas sin depender de APIs externas de pago.
- Base para ajuste fino (fine-tuning) adicional: al estar bajo Apache-2.0 y con solo 1,5B de parametros, es viable reentrenarlo en una unica GPU de consumo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio solo detalla los ficheros de cuantizacion y el formato de prompt, sin cifras de MMLU, HumanEval, GSM8K ni comparaciones numericas.

## Requisitos de hardware

- VRAM/RAM de inferencia segun cuantizacion (tamano de fichero): F32 ~6,18 GB; F16 ~3,09 GB; Q8_0 ~1,65 GB; Q6_K ~1,27 GB; Q5_K_M ~1,13 GB; Q4_K_M ~0,99 GB; IQ4_XS ~0,90 GB; IQ3_M ~0,78 GB.
- A estos valores hay que sumar la cache KV, que crece con la longitud de contexto. Con 28 capas y 12 cabezas de atencion la cache es moderada, pero a contextos largos (decenas de miles de tokens) puede anadir varios GB en precision FP16.
- GPU recomendadas: cualquier GPU moderna con mas de 2-3 GB de VRAM es suficiente. Modelos como RTX 3060/4060/4090, e incluso iGPU con memoria unificada, pueden ejecutarlo con holgura. No se requiere A100 ni H100, aunque pueden usarse para servir muchas instancias.
- Cabe en practicamente cualquier GPU de consumo e integrada, y en CPU con RAM suficiente.
- Opciones de despliegue: llama.cpp, LM Studio, Ollama, Inferix, y cualquier runtime compatible con GGUF. Para servidores de alto throughput se puede usar tambien el modelo base en safetensors con vLLM o TGI.
- Latencia y throughput estimados: no disponibles de forma oficial. Al ser un modelo de 1,5B, en GPU de consumo se espera un throughput elevado (del orden de decenas de tokens por segundo) y en cuantizaciones bajas es utilizable en CPU, pero no se aportan cifras concretas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato/Disponibilidad |
|---|---|---|---|---|
| Dolphin3.0-Qwen2.5-1.5B (este) | ~1,54B | 32.768 tokens (heredado de Qwen2.5, no confirmado en la card) | Apache-2.0 | GGUF (multiples quants) y safetensors en el modelo base |
| Qwen2.5-1.5B-Instruct | ~1,54B | No disponible en la informacion proporcionada | Apache-2.0 | Safetensors, GGUF, ampliamente disponible |
| Llama-3.2-1B-Instruct | ~1,24B | No disponible en la informacion proporcionada | Llama 3.2 Community License | Safetensors, GGUF |
| SmolLM2-1.7B-Instruct | ~1,7B | No disponible en la informacion proporcionada | Apache-2.0 | Safetensors, GGUF |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada; la comparacion se limita a parametros, licencia y disponibilidad.

## Limitaciones y advertencias

- El modelo se declara unicamente en ingles; el rendimiento en castellano u otros idiomas no esta garantizado.
- Al ser un modelo de 1,5B, es propenso a errores factuales y a alucinaciones, especialmente en tareas de conocimiento amplio o razonamiento complejo.
- Las cuantizaciones de baja precision (Q3, IQ3, Q2) degradan la calidad de forma perceptible; para produccion se recomienda Q5_K_M o superior.
- Los sesgos potenciales provienen de la mezcla de datasets de ajuste fino y no han sido documentados ni evaluados en la informacion disponible.
- Aunque la licencia es Apache-2.0, conviene verificar que los datasets de entrenamiento declarados no impongan restricciones adicionales para uso comercial.
- El repositorio Dennisthemennis69 es una redistribucion de la cuantizacion de bartowski; para produccion es recomendable contrastar integridad y procedencia con el repositorio original.
- El numero de contexto (32.768 tokens) no viene confirmado explicitamente en la model card facilitada; si se necesita un contexto mayor, habria que validarlo y, en su caso, aplicar YaRN como en Qwen2.5.
- No se documentan capacidades de vision, audio ni modo de razonamiento extendido.

## Enlaces

- Repositorio descrito: https://huggingface.co/Dennisthemennis69/Dolphin3.0-Qwen2.5-1.5B-GGUF
- Cuantizacion original de bartowski: https://huggingface.co/bartowski/Dolphin3.0-Qwen2.5-1.5B-GGUF
- Modelo base Dolphin 3.0: https://huggingface.co/cognitivecomputations/Dolphin3.0-Qwen2.5-1.5B
- Modelo original Qwen2.5-1.5B (licencia): https://huggingface.co/Qwen/Qwen2.5-1.5B
- llama.cpp: https://github.com/ggerganov/llama.cpp/
- Release de llama.cpp usado (b4418): https://github.com/ggerganov/llama.cpp/releases/tag/b4418
- Dataset de calibracion imatrix: https://gist.github.com/bartowski1182/eb213dccb3571f863da82e99418f81e8
- LM Studio: https://lmstudio.ai/
- Pagina de referencia de tamano y VRAM por cuantizacion: https://ailocalcheck.com/model/bartowski/Dolphin3.0-Qwen2.5-1.5B-GGUF
- Version en Ollama: https://ollama.com/sam860/dolphin3-qwen2.5
