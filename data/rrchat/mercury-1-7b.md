# rrchat/Mercury-1.7B

## Resumen

Mercury-1.7B es un modelo multimodal (visión-lenguaje) de pesos abiertos desarrollado por el usuario rrchat, publicado en Hugging Face como un fine-tuning sobre `LiquidAI/LFM3-VL-2B` de Liquid AI. El modelo combina razonamiento paso a paso bilingüe (rusa e inglés), generación de código, capacidades agénticas con tool calling y comprensión de imágenes en un paquete muy compacto de aproximadamente 1,9 mil millones de parámetros (1.918.181.888 según los safetensors del repositorio).

Su relevancia radica en la arquitectura híbrida LFM3 de Liquid AI, que mezcla convoluciones causales 1D depthwise (k=7) con capas de autoatención lineal gated, ofreciendo un throughput muy alto (unos 180-200 tokens/segundo en GPUs de consumo) con una huella de memoria reducida. Esto lo hace especialmente adecuado para despliegues locales en hardware modesto, un nicho donde los modelos con razonamiento y visión suelen ser mucho más grandes.

El fine-tuning incorpora datos de razonamiento matemático (OpenR1-Math-220k), trayectorias agénticas multi-turno (Nemotron-SFT-Agentic-v2), programación y diálogo ruso de alto registro (GrandMaster-PRO-MAX), manteniendo la paridad con el modelo base en tool calling (97,0 % en BFCL v4) y mejorando el rendimiento en código y matemáticas en modo thinking.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LFM3 hibrida: convoluciones causales 1D depthwise (k=7) + atencion lineal gated; codificador de vision SigLIP |
| Parametros totales | 1.918.181.888 (dato real de safetensors; ~1,7B activos de lenguaje + codificador de vision) |
| Parametros activos | no disponible (arquitectura no MoE; ~1,7B de parametros de lenguaje segun la model card) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en este repo (existen pesos GGUF cuantizados en rrchat/Mercury-1.7B-GGUF) |
| Idiomas soportados | Ruso (ru), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (este repo); GGUF disponible en repo derivado |

## Arquitectura y entrenamiento

Mercury-1.7B parte de la arquitectura LFM3-VL de Liquid AI, un modelo hibrido de lenguaje que combina convoluciones causales 1D depthwise cortas (kernel k=7) con capas de autoatencion lineal gated. Este diseno de "estado constante" permite un throughput extremo y un consumo de memoria bajo, en contraste con los transformers con atencion causal estandar. El componente de vision se apoya en un codificador SigLIP cuyas capas de proyeccion se conservan intactas tras el fine-tuning, lo que permite comprension zero-shot de imagenes y analisis de documentos.

El entrenamiento post-base se realizo con el framework Unsloth sobre un conjunto curado de datasets publicos: OpenR1-Math-220k (razonamiento matematico paso a paso), NVIDIA Nemotron-Post-Training-Dataset-v2 y Nemotron-SFT-Agentic-v2 (trayectorias agenticas multi-turno), HuggingFaceTB/smoltalk2 (conversacion general) y Vikhrmodels/GrandMaster-PRO-MAX (dialogo ruso de alto registro), ademas de datos de programacion (OpencodeInstruct, mencionado en la model card). El modelo soporta un modo de razonamiento explicito mediante etiquetas `<think>`, y se alineo con una identidad estricta ("Mercury by rrchat"). No se ha publicado informacion sobre el uso de RLHF o DPO.

## Capacidades

- Generacion de texto conversacional bilingue (ruso e ingles) con estilo directo y sin artefactos repetitivos de autoverificacion.
- Razonamiento matematico multi-paso con modo thinking explicito (`<think>`), mejorado respecto al modelo base (80,0 % en GSM8K frente a 75,0 %).
- Generacion de codigo en Python y razonamiento algoritmico, con mejora notable en modo thinking (40,0 % frente a 25,0 % en HumanEval/LiveCodeBench).
- Tool calling / function calling con ejecucion estructurada de herramientas via XML-inline, manteniendo el 97,0 % de accuracy en BFCL v4.
- Capacidades agenticas multi-turno entrenadas con trayectorias agenticas de NVIDIA (Nemotron-SFT-Agentic-v2).
- Comprension multimodal de imagenes (image-text-to-text) mediante el codificador SigLIP conservado: descripcion de imagenes, analisis de documentos y comprension visual zero-shot.
- Seguimiento de instrucciones complejas con restricciones de sistema (IFEval ~72,5-74,2 %).
- Despliegue en modo thinking (razonamiento extendido) o instant (respuesta directa) segun la latencia requerida.

## Casos de uso

- **Atencion al cliente automatizada bilingue ruso-ingles:** el modelo mantiene conversaciones multi-turno con estilo directo y alto registro en ruso (entrenado con GrandMaster-PRO-MAX), adecuado para chatbots de soporte en mercados rusohablantes con recursos limitados.
- **Agentes con ejecucion de herramientas en local:** con un 97,0 % en BFCL v4 y soporte de tool calling XML-inline, puede integrarse en pipelines agenticos (orquestacion de APIs, consultas a bases de datos, automatizacion de flujos) ejecutandose en una sola GPU de consumo.
- **Asistente de programacion embebido en IDE locales:** genera y razona sobre codigo Python; en modo instant alcanza un 70,0 % en HumanEval/LiveCodeBench con latencia baja, apropiado para autocompletado y explicacion de codigo sin enviar codigo propietario a la nube.
- **Analisis de documentos e imagenes en el borde (edge):** el codificador SigLIP conservado permite extraer informacion de capturas, formularios escaneados o fotografias directamente en dispositivos con GPU modesta o incluso en escenarios offline.
- **Tutor de matematicas paso a paso:** el modo thinking con datos de OpenR1-Math-220k permite resolver problemas de nivel escolar multi-paso (80,0 % en GSM8K) mostrando el razonamiento completo, util en aplicaciones educativas.
- **Procesamiento por lotes de alto throughput:** gracias a la atencion lineal y las convoluciones depthwise (180-200+ tokens/seg en GPUs de consumo), es adecuado para tareas de procesamiento masivo de texto (clasificacion, resumen, extraccion) donde el coste por token es critico.
- **Prototipado rapido de asistentes con identidad de marca:** el fine-tuning demuestra alineacion de identidad estricta, un patron replicable para empresas que desean ajustar modelos pequenos con personalidad y marca propias.

## Benchmarks y rendimiento

Resultados publicados por el autor, evaluados localmente en condiciones identicas para base y fine-tuning (no son cifras oficiales de Liquid AI):

| Benchmark | Modo | Base (LFM3-VL-2B) | Mercury-1.7B | Delta |
|---|---|---|---|---|
| HumanEval / LiveCodeBench | Thinking (`<think>`) | 25,0 % | 40,0 % | +15,0 % |
| HumanEval / LiveCodeBench | Instant (directo) | 65,0 % | 70,0 % | +5,0 % |
| GSM8K | Thinking (`<think>`) | 75,0 % | 80,0 % | +5,0 % |
| IFEval | Thinking (`<think>`) | 70,0 % | 72,5 % | +2,5 % |
| BFCL v4 (tool use) | Thinking / Instant | 97,0 % | 97,0 % | Paridad |
| IFEval | Instant (directo) | 75,0 % | 74,2 % | ~Paridad |
| Claw-Eval General | Instant (directo) | 91,7 % | 91,7 % | Paridad |

No se han publicado resultados comparativos con modelos de otros fabricantes (MMLU, comparativas con Qwen, Gemma, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 1,9B de parametros en bfloat16, el repositorio ocupa 3,9 GB; se estima una necesidad de unos 4-6 GB de VRAM en precision completa, menos con los GGUF cuantizados del repo derivado (dato exacto no disponible).
- GPUs recomendadas: cualquier GPU de consumo con 6-8 GB de VRAM es suficiente (RTX 3060, RTX 4060, RTX 4070); no se requieren A100 ni H100 para inferencia.
- Cabe comodamente en GPUs de consumo: el propio autor reporta 180-200+ tokens/segundo en GPUs de consumo gracias a la arquitectura de atencion lineal.
- Opciones de despliegue:
  - Transformers (Python) con `trust_remote_code=True`, usando `AutoModelForImageTextToText` y `torch_dtype=torch.bfloat16` (codigo de ejemplo en la model card).
  - llama.cpp y Ollama mediante los pesos GGUF de `rrchat/Mercury-1.7B-GGUF`.
  - No se menciona soporte verificado para vLLM o TGI; al requerir codigo personalizado (`modeling_lfm3.py`), la compatibilidad con estos motores no esta garantizada.
- Latencia y throughput: ~180-200+ tokens/segundo en GPUs de consumo segun la model card; latencia absoluta no disponible.

## Comparativa con modelos similares

| Caracteristica | Mercury-1.7B | LiquidAI/LFM3-VL-2B (base) | Qwen3-VL-2B (referencia de categoria) |
|---|---|---|---|
| Parametros | ~1,9B (1,7B lenguaje + SigLIP) | ~2B | ~2B |
| Arquitectura | Hibrida LFM3 (conv causal + atencion lineal) | Hibrida LFM3 | Transformer + ViT |
| Vision | Si (SigLIP) | Si (SigLIP) | Si |
| Razonamiento thinking | Si (`<think>`) | Si | Si |
| Tool calling | 97,0 % BFCL v4 | 97,0 % BFCL v4 | No disponible (datos de esta ficha) |
| Contexto | no disponible | no disponible | no disponible |
| Licencia | Apache 2.0 | Apache 2.0 (licencia propia de Liquid AI, segun repo base) | Licencia propia de Alibaba |
| Idiomas destacados | ru, en | ru, en | Multilingue |

Nota: los datos de Qwen3-VL-2B no provienen de la informacion proporcionada y se indican como no disponibles donde corresponda; la comparativa solida disponible es la de Mercury frente a su modelo base.

## Limitaciones y advertencias

- Requiere `trust_remote_code=True` al cargar con Transformers, ya que incluye archivos de implementacion personalizados (`configuration_lfm3.py`, `modeling_lfm3.py`, `processing_lfm3_vl.py`); esto supone un riesgo de seguridad habitual y puede romperse con futuras versiones de la libreria.
- Los benchmarks fueron evaluados manualmente por el autor en suites locales, no por un tercero ni por Liquid AI; los resultados pueden no ser reproducibles ni comparables directamente con cifras oficiales.
- El soporte de idiomas se limita explicitamente a ruso e ingles; el rendimiento en castellano u otros idiomas no esta documentado y probablemente sea inferior.
- La longitud de contexto no esta publicada en la model card, lo que dificulta planificar ventanas para documentos largos o conversaciones extensas.
- Al ser un modelo de ~1,7-1,9B parametros, sus capacidades de razonamiento y conocimiento factual son limitadas frente a modelos de 7B o mayores; el riesgo de alucinacion en tareas de conocimiento general es esperablemente alto.
- La cuantizacion oficial se limita al repo GGUF derivado; no hay pesos AWQ/GPTQ publicados por el autor.
- Los benchmarks en modo thinking de codigo (40,0 %) siguen siendo modestos en terminos absolutos para tareas de produccion exigentes.
- Licencia Apache 2.0: sin restricciones de uso comercial relevantes, aunque los terminos del modelo base de Liquid AI deben revisarse para usos comerciales a gran escala.

## Enlaces

- Modelo: https://huggingface.co/rrchat/Mercury-1.7B
- Pesos GGUF cuantizados: https://huggingface.co/rrchat/Mercury-1.7B-GGUF
- Modelo base: https://huggingface.co/LiquidAI/LFM3-VL-2B
- Datasets de entrenamiento:
  - https://huggingface.co/datasets/open-r1/OpenR1-Math-220k
  - https://huggingface.co/datasets/nvidia/Nemotron-Post-Training-Dataset-v2
  - https://huggingface.co/datasets/nvidia/Nemotron-SFT-Agentic-v2
  - https://huggingface.co/datasets/HuggingFaceTB/smoltalk2
  - https://huggingface.co/datasets/Vikhrmodels/GrandMaster-PRO-MAX
