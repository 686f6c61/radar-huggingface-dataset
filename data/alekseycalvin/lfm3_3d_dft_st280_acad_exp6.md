# AlekseyCalvin/LFM3_3d_dft_st280_acad_exp6

## Resumen

Mercury-Acad-1.7B es un ajuste fino experimental publicado por AlekseyCalvin (bajo el identificador `AlekseyCalvin/LFM3_3d_dft_st280_acad_exp6`) sobre la arquitectura `LiquidAI/LFM3-VL-2B` de Liquid AI. Se trata de un modelo vision-language de aproximadamente 1.918 millones de parametros totales (unos 1,7B en el decodificador de lenguaje mas el codificador visual SigLIP), disenado para razonamiento STEM, generacion de codigo y uso de herramientas en un presupuesto de computo muy reducido.

La propuesta central es introducir razonamiento explicito paso a paso mediante trazas `<think>...</think>` en un modelo de menos de 2B de parametros, con capacitacion bilingue russo-ingles y soporte de function calling estructurado. Segun la model card, el ajuste mejora de forma notable sobre el modelo base en tareas de codigo algoritmico (HumanEval+) y razonamiento aritmetico (GSM8K), a costa de degradar el rendimiento en MATH-500 y de no mejorar el conocimiento enciclopedico general.

El modelo es relevante por su enfoque de eficiencia: emplea la arquitectura hibrida de LFM3 (convoluciones causales 1D y atencion lineal con compuertas), lo que permite velocidades de generacion de 180-210 tokens por segundo en GPUs de consumo, con licencia Apache 2.0 y pesos en safetensors. No obstante, se trata de un experimento sin descargas ni validacion externa en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LFM3 hibrida (convoluciones causales 1D k=7 + atencion lineal con compuertas) con codificador visual SigLIP |
| Parametros totales | 1.918.181.888 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en este repositorio; existe una variante GGUF separada segun la model card |
| Idiomas soportados | ru, en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria transformers, requiere `trust_remote_code=True`) |

## Arquitectura y entrenamiento

El modelo parte de `LiquidAI/LFM3-VL-2B`, una arquitectura hibrida que combina convoluciones causales 1D de kernel 7 con atencion lineal con compuertas, en lugar de un transformer de atencion cuadratica clasica. Esta eleccion reduce el coste computacional y de memoria en generacion larga, y es la base de la velocidad reportada (180-210 tok/s en GPUs de escritorio). El componente multimodal lo aporta un codificador SigLIP con adaptadores de proyeccion, heredado del modelo base y preservado tras el ajuste fino.

El entrenamiento es un post-entrenamiento supervisado (SFT) sobre el modelo base, sin que la informacion disponible detalle el numero de tokens, la mezcla exacta ni si hubo RLHF o DPO. Los datasets declarados son `open-r1/OpenR1-Math-220k`, `nvidia/Nemotron-Post-Training-Dataset-v2`, `nvidia/Nemotron-SFT-Agentic-v2`, `HuggingFaceTB/smoltalk2` y `Vikhrmodels/GrandMaster-PRO-MAX`. La innovacion tecnica declarada es la estabilizacion del modo de razonamiento: segun el autor, el modelo base abortaba entre el 60% y el 90% de las generaciones en modo thinking por bucles infinitos o falta de cierre de `</think>`, mientras que este ajuste mantiene una tasa de truncamiento del 0,0%. Tambien se documenta un modo dual de inferencia controlado por el flag `enable_thinking`.

## Capacidades

- Generacion de texto y razonamiento paso a paso con trazas internas `<think>...</think>`.
- Razonamiento matematico multi-paso, con soporte de LaTeX y formato `$\boxed{...}$`.
- Generacion de codigo algoritmico en Python, con enfasis en casos limite e invariantes.
- Vision: respuesta a preguntas sobre imagenes, analisis de documentos y razonamiento visual, mediante el codificador SigLIP.
- Tool calling y function calling estructurado, compatible con los protocolos del Berkeley Function Calling Benchmark y llamadas XML con parametros.
- Capacidades agenticas y ejecucion de instrucciones multi-paso.
- Bilinguismo russo-ingles, incluido razonamiento matematico en ruso.
- Modo instantaneo de baja latencia (`enable_thinking=False`) para respuestas directas.
- Alineacion de identidad declarada (95% en el benchmark propio de identidad del autor).

## Casos de uso

- Tutoria de matematicas en ruso e ingles: el modelo puede resolver problemas aritmeticos multi-paso mostrando el desarrollo en modo thinking, util para plataformas educativas que necesitan explicaciones verificables y no solo la respuesta final.
- Generacion de codigo en pipelines de CI: con HumanEval+ en torno al 51,8% y soporte de function calling, puede emplearse para proponer parches o funciones auxiliares en tareas bien acotadas, siempre con revision humana.
- Agentes de automatizacion con herramientas: la paridad en BFCL V3 Simple (99,7%) lo hace apto para orquestar llamadas a APIs estructuradas en flujos de trabajo ligeros desplegados en hardware modesto.
- Analisis de documentos con imagen: al conservar el codificador SigLIP, puede extraer y razonar sobre contenido de capturas, diagramas o formularios en aplicaciones de back-office.
- Asistente de bajo consumo en dispositivos de borde: su velocidad de 180-210 tok/s y su reducida huella de VRAM permiten desplegarlo en estaciones de trabajo con GPU de consumo para tareas de asistencia en tiempo real.
- Prototipado rapido de razonamiento STEM: investigador que quiera estudiar trazas de razonamiento en modelos pequenos puede usar el modo thinking como banco de pruebas reproducible en bfloat16 con decodificacion greedy.
- Atencion al cliente bilingue tecnica: para consultas de soporte en ruso o ingles con contexto corto y necesidad de respuestas rapidas mediante el modo instantaneo.

## Benchmarks y rendimiento

Resultados declarados por el autor, evaluados en bfloat16 con decodificacion greedy determinista:

| Benchmark | Modo | Base LFM3-VL-2B | Mercury-Acad-1.7B | Delta vs. base |
|---|---|---|---|---|
| HumanEval+ (164 tareas) | Thinking | 21,9% | 51,8% | +29,9% |
| GSM8K (500 problemas) | Thinking | 58,2% | 67,8% | +9,6% |
| MGSM ruso (250 problemas) | Thinking | 39,2% | 45,2% | +6,0% |
| MATH-500 (niveles 1-3) | Instant | 73,5% | 51,7% | -21,9% |
| MATH-500 (niveles 1-3) | Thinking | 64,3% | 51,3% | -13,0% |
| BFCL V3 Simple (tools) | Thinking | 99,7% | 99,7% | 0,0% |
| MMLU-Redux (300 tareas) | Instant | 24,0% | 42,7% | +18,7% |
| IFEval (541 instrucciones) | Instant | 73,3% | 71,8% | -1,5% |
| Identity Alignment | Thinking | 90,0% | 95,0% | +5,0% |

No se han publicado resultados de benchmarks independientes en la informacion disponible; todas las cifras proceden de la evaluacion del propio autor.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: en torno a 4 GB para los pesos (repo de 3,9 GB), mas overhead de activaciones y KV cache; el modelo base esta disenado para despliegue en movil y edge.
- GPU recomendadas: cualquier GPU de consumo con 8 GB o mas (RTX 3060/4060 en adelante) deberia bastar para bfloat16; A100 o H100 no son necesarias.
- Cabe en GPU de consumo: si, segun la model card, con velocidades de 180-210 tokens por segundo en GPUs de escritorio.
- Opciones de despliegue: transformers con `trust_remote_code=True`; existe una variante GGUF publicada aparte para llama.cpp, Ollama y LM Studio. No se confirma soporte de vLLM ni TGI en la informacion disponible.
- Latencia y throughput: 180-210 tok/s reportados por el autor en GPUs de consumo; no hay mediciones independientes.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Mercury-Acad-1.7B (este) | 1,918B | no disponible | Apache 2.0 | Ajuste experimental con thinking, vision y tool calling |
| LiquidAI/LFM3-VL-2B (base) | ~2B | no disponible | no disponible en la informacion | Modelo base multimodal de Liquid AI; sin modo thinking estable |
| Mercury-1.7B (mencionado en la card) | ~1,7B | no disponible | no disponible | Variante previa del mismo autor, con peores resultados en HumanEval+ y BFCL |

No se dispone de datos de contexto ni de comparativas con otras familias de modelos pequenos multimodales en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo experimental: 0 descargas y 0 likes en el momento de la ficha; no hay validacion externa de los resultados.
- Conocimiento enciclopedico limitado por el tamano de preentrenamiento de 1,7B; el autor lo reconoce explicitamente.
- Degradacion frente al modelo base en MATH-500 (-21,9% en modo instant y -13,0% en thinking), lo que sugiere sobreajuste a ciertos formatos de razonamiento.
- Riesgo de alucinacion en tareas factuales y en razonamiento matematico avanzado; los benchmarks propios no cubren robustez ante entradas adversarias.
- Cobertura linguistica limitada a ruso e ingles; el rendimiento en castellano no esta documentado.
- Requiere `trust_remote_code=True` y los ficheros de implementacion personalizados (`configuration_lfm3.py`, `modeling_lfm3.py`, `processing_lfm3_vl.py`), lo que anade superficie de riesgo en produccion.
- La longitud de contexto no se especifica, lo que impide planificar despliegues con documentos largos.
- Aunque la licencia es Apache 2.0, conviene verificar las condiciones del modelo base y de los datasets de post-entrenamiento antes de un uso comercial.
- El benchmark de identidad es propio del autor y no es un estandar de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AlekseyCalvin/LFM3_3d_dft_st280_acad_exp6
- Modelo base: https://huggingface.co/LiquidAI/LFM3-VL-2B
- Variante GGUF mencionada en la model card: https://huggingface.co/rrchat/Mercury-Acad-1.7B-GGUF
- Dataset OpenR1-Math-220k: https://huggingface.co/datasets/open-r1/OpenR1-Math-220k
- Dataset Nemotron-Post-Training-Dataset-v2: https://huggingface.co/datasets/nvidia/Nemotron-Post-Training-Dataset-v2
- Dataset Nemotron-SFT-Agentic-v2: https://huggingface.co/datasets/nvidia/Nemotron-SFT-Agentic-v2
- Dataset smoltalk2: https://huggingface.co/datasets/HuggingFaceTB/smoltalk2
- Dataset GrandMaster-PRO-MAX: https://huggingface.co/datasets/Vikhrmodels/GrandMaster-PRO-MAX
