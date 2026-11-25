# nokkela-ai/MiniMax-M3-NVFP4

## Resumen

MiniMax-M3-NVFP4 es una versión cuantizada en NVFP4 del modelo multimodal MiniMax-M3, desarrollada por MiniMax y empaquetada por NVIDIA mediante Model Optimizer. Se trata de un transformer de tipo Mixture-of-Experts con 428.000 millones de parámetros totales y aproximadamente 23.000 millones activos por token (A23B), diseñado para tareas de codigo de horizonte largo, flujos agenticos con uso de herramientas y comprensión de video de formato largo. El checkpoint aquí descrito es una copia independiente publicada por nokkela-ai a partir del original de NVIDIA.

La relevancia de esta ficha radica en la cuantización: el paso de pesos y activaciones a NVFP4 reduce el numero de bits por parámetro de 8 a 4, lo que disminuye aproximadamente a la mitad el tamano en disco y los requisitos de memoria de GPU respecto al checkpoint en precision superior. Con una ventana de contexto de 1 millón de tokens y un codificador visual ViT que acepta imagenes y video de hasta 30 minutos, el modelo se posiciona en el segmento de modelos frontera para agentes y coding.

El repositorio ocupa 250,1 GB en formato safetensors y requiere el runtime vLLM con soporte especifico para MiniMax-M3 NVFP4, ademas de hardware NVIDIA Blackwell. La licencia es la MiniMax Community License, que restringe el uso comercial segun los terminos del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts multimodal (ViT para imagen y video) |
| Parametros totales | 427.040.140.160 (aprox. 428B) |
| Parametros activos | Aproximadamente 23B por token (A23B) |
| Longitud de contexto | 1.000.000 tokens (entrada) |
| Tipos de cuantizacion | NVFP4 (pesos y activaciones), cuantizado con nvidia-modelopt v0.44.0 |
| Idiomas soportados | no disponible |
| Licencia | MiniMax Community License (license: other) |
| Formato de pesos | safetensors (custom_code) |
| Entradas | Texto, imagen (RGB), video (hasta 30 minutos) |
| Salidas | Texto |
| Runtime soportado | vLLM (imagen nightly con soporte NVFP4 de MiniMax-M3) |
| Hardware compatible | NVIDIA Blackwell (probado en B200) |
| Sistema operativo | Linux |
| Tamano del repositorio | 250,1 GB |

## Arquitectura y entrenamiento

MiniMax-M3 emplea una arquitectura transformer con mezcla de expertos (MoE) de caracter multimodal. El modelo combina un decodificador de lenguaje con un codificador visual basado en ViT que procesa tanto imagenes RGB como video codificado, incluyendo soporte para video de hasta 30 minutos de duracion. La ventana de contexto alcanza 1 millón de tokens de entrada, lo que habilita tareas de razonamiento sobre documentos multiples y comprensión de video de formato largo. El modelo dispone de dos modos de razonamiento conmutables por peticion: modo thinking para razonamiento complejo y tareas agenticas, y modo no-thinking para escenarios sensibles a la latencia.

La informacion sobre el entrenamiento es escasa: la model card declara que los datos de entrenamiento (texto, imagen y video), su recopilacion y su etiquetado no se divulgan. No se especifica el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO. La evaluacion publicada cubre GPQA Diamond, AA-LCR, τ²-Telecom, MMMU-Pro y SciCode, lo que sugiere un enfasis en razonamiento cientifico, contexto largo, uso de herramientas, comprensión multimodal y codigo cientifico.

La innovacion tecnica principal de este checkpoint concreto es la cuantizacion post-entrenamiento a NVFP4 realizada con NVIDIA Model Optimizer v0.44.0, que reduce el coste de memoria aproximadamente un 50 % respecto a 8 bits. El checkpoint conserva codigo personalizado (custom_code) y requiere una version de vLLM con soporte especifico para el formato NVFP4 de MiniMax-M3.

## Capacidades

- Generacion de texto y razonamiento en dos modos conmutables: thinking (razonamiento profundo) y no-thinking (baja latencia).
- Comprensión multimodal de imagenes RGB con un codificador ViT.
- Comprensión de video de formato largo, hasta 30 minutos de duracion.
- Codigo de horizonte largo: tareas de programacion que se extienden durante 8 o mas horas segun la model card.
- Flujos agenticos y uso de herramientas (tool use) de multiples pasos, evaluados en τ²-Telecom.
- Razonamiento cientifico y matematico de nivel avanzado (GPQA Diamond, SciCode).
- Razonamiento sobre contexto largo y sintesis multi-documento (AA-LCR, 1M tokens).
- Comprensión multimodal academica multidisciplinar (MMMU-Pro).
- Tareas de diseno y creatividad.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Atencion al cliente agentica: el modelo puede gestionar conversaciones multi-turno con uso de herramientas en dominios como telecomunicaciones, tal y como demuestra su evaluacion en τ²-Telecom, manteniendo el estado de la tarea a lo largo de la interaccion.
- Refactorizacion y mantenimiento de codigo de gran escala: con 1M tokens de contexto y soporte para tareas de 8 o mas horas, puede cargar repositorios completos y sostener sesiones de programacion prolongadas sin perder el hilo.
- Analisis de video de vigilancia o formacion: su codificador ViT y su ventana de 30 minutos permiten resumir, indexar o responder preguntas sobre grabaciones extensas.
- Revision documental y due diligence: la ventana de 1M tokens posibilita sintetizar contratos, informes y expedientes multiples en una sola pasada, apoyandose en el modo thinking para razonamiento complejo.
- Asistente de investigacion cientifica: combinando GPQA Diamond y SciCode, el modelo puede resolver preguntas de nivel graduado y generar codigo cientifico reproducible.
- Automatizacion de flujos con herramientas en produccion: integrado via vLLM sobre Blackwell, puede servir como backend de agentes que invocan APIs y ejecutan pasos encadenados con el modo no-thinking para reducir latencia.
- Analisis de imagenes tecnicas y academicas: MMMU-Pro respalda su uso en interpretacion de diagramas, graficos y figuras de material cientifico.
- Generacion de codigo en pipelines de CI/CD: el soporte de tool calling permite conectarlo a linters, ejecutores de tests y sistemas de issues para proponer parches automatizados.

## Benchmarks y rendimiento

La model card menciona los conjuntos de evaluacion (GPQA Diamond, AA-LCR, τ²-Telecom, MMMU-Pro y SciCode), pero no publica los resultados numericos obtenidos en ellos. No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio pesa 250,1 GB en NVFP4, por lo que se requiere un pool de memoria de GPU del orden de esa cifra mas overhead de activaciones y cache KV; no se dispone de cifras oficiales de VRAM pico.
- GPU recomendadas: NVIDIA Blackwell, con pruebas oficiales en B200. No se declara compatibilidad con generaciones anteriores (Hopper, Ada) en la informacion disponible.
- Cabe en GPU consumer: no, dado el tamano del checkpoint (250 GB) y la exigencia de arquitectura Blackwell.
- Opciones de despliegue: vLLM, concretamente la imagen nightly que incluye soporte NVFP4 de MiniMax-M3 (referencia vllm-project/vllm#46380). No se mencionan llama.cpp, Ollama ni TGI.
- Sistema operativo: Linux.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros totales / activos | Contexto | Modalidades | Licencia | Formato |
|---|---|---|---|---|---|
| MiniMax-M3-NVFP4 (nokkela-ai) | 428B / ~23B | 1M tokens | Texto, imagen, video | MiniMax Community License | safetensors NVFP4 |
| MiniMax-M3 (MiniMaxAI) | 428B / ~23B | 1M tokens | Texto, imagen, video | MiniMax Community License | safetensors (precision original) |
| nvidia/MiniMax-M3-NVFP4 | 428B / ~23B | 1M tokens | Texto, imagen, video | MiniMax Community License | safetensors NVFP4 |

Las alternativas de otros fabricantes con arquitectura MoE multimodal y contexto de 1M tokens no estan disponibles en la informacion proporcionada, por lo que no se incluye comparacion con modelos de terceros.

## Limitaciones y advertencias

- Licencia MiniMax Community License: el uso comercial esta restringido segun los terminos del modelo base; la propia model card indica que el checkpoint esta listo para uso no comercial.
- Requiere hardware NVIDIA Blackwell y una version nightly de vLLM con soporte NVFP4 especifico; el ecosistema de despliegue es mas estrecho que el de checkpoints en BF16 o GGUF.
- La cuantizacion NVFP4 puede introducir degradacion de calidad respecto al modelo original; no se publican comparativas numericas entre ambas versiones.
- Riesgo de alucinacion inherente a los modelos generativos de gran escala; no se documentan tasas ni mitigaciones especificas.
- Sesgos conocidos: no disponibles en la informacion proporcionada.
- Idiomas soportados: no disponibles; no se puede garantizar un rendimiento homogeneo fuera de los idiomas no declarados.
- Datos de entrenamiento no divulgados, lo que dificulta auditar procedencia, sesgos y cumplimiento.
- El checkpoint es una copia independiente de nokkela-ai; conviene verificar integridad y procedencia frente al original de NVIDIA antes de usarlo en produccion.
- La model card advierte de la necesidad de pruebas especificas de caso de uso (metodologia en V) antes de desplegar en sistemas reales.
- No se dispone de resultados de benchmarks publicados que permitan validar el rendimiento de esta variante cuantizada.

## Enlaces

- Hugging Face (este checkpoint): https://huggingface.co/nokkela-ai/MiniMax-M3-NVFP4
- Checkpoint original de NVIDIA: https://huggingface.co/nvidia/MiniMax-M3-NVFP4
- Modelo base MiniMax-M3: https://huggingface.co/MiniMaxAI/MiniMax-M3
- Licencia MiniMax Community License: https://huggingface.co/MiniMaxAI/MiniMax-M3/blob/main/LICENSE
- NVIDIA Model Optimizer: https://github.com/NVIDIA/Model-Optimizer
- vLLM: https://github.com/vllm-project/vllm
- Soporte NVFP4 de MiniMax-M3 en vLLM: https://github.com/vllm-project/vllm/pull/46380
