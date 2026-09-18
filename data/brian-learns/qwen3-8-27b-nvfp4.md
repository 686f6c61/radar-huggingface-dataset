# brian-learns/Qwen3.8-27B-NVFP4

## Resumen

El modelo `brian-learns/Qwen3.8-27B-NVFP4` es una version cuantizada en precision mixta NVFP4/FP8 del modelo `Qwen/Qwen3.8-27B` de Alibaba, generada con la herramienta NVIDIA Model Optimizer (nvidia-modelopt v0.48.0). Se trata de un transformer autoregresivo multimodal (acepta texto, imagen y video) con una ventana de contexto de hasta 262.144 tokens, preparado para desplegarse en vLLM o SGLang sobre hardware NVIDIA Blackwell (validado sobre Grace Blackwell GB300). La cuantizacion reduce el peso del checkpoint a aproximadamente 21,9 GB en repositorio, lo que lo hace apto para inferencia en GPUs de gama alta con memoria limitada.

El repositorio es un reupload de terceros (autor `brian-learns`), no la publicacion oficial de NVIDIA: la propia model card referencia `https://huggingface.co/nvidia/Qwen3.8-27B-NVFP4` como origen de la release del 08/09/2026. En el momento de la consulta acumula 0 descargas y 0 likes, y la model card es esencialmente la de NVIDIA con la licencia Apache 2.0. Existe ademas una discrepancia relevante entre el nombre del modelo (27B) y el recuento real de elementos en los safetensors (18.164.649.200), presumiblemente por el empaquetado de pesos FP4 y la omision de modulos no cuantizados.

Su interes practico esta en el eje coste/memoria: permite servir un modelo multimodal de ~27B declarados con contexto de 262K en menos de 24 GB de pesos, manteniendo las capas de atencion en FP8 para preservar calidad donde mas impacta, algo relevante para sistemas de agentes, RAG y despliegues con presupuesto de VRAM ajustado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer autoregresivo (`Qwen3_5ForConditionalGeneration`), con capas de self-attention y linear-attention |
| Parametros totales | 27B declarados en la model card; 18.164.649.200 elementos reportados en los safetensors |
| Parametros activos | No aplica (no se documenta topologia MoE) |
| Longitud de contexto | Hasta 262.144 tokens (262K) |
| Tipos de cuantizacion | NVFP4 (capas MLP y `lm_head`) + FP8 (capas de self-attention y linear-attention); receta mixta de post-training quantization |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (cuantizados, formato NVIDIA ModelOpt) |
| Modalidades de entrada | Texto (string), imagen (RGB), video (MP4/WebM) |
| Modalidad de salida | Texto (secuencias 1D) |
| Modelo base | `Qwen/Qwen3.8-27B` |
| Libreria / herramienta | NVIDIA Model Optimizer (nvidia-modelopt v0.48.0) |
| Motores de inferencia soportados | vLLM, SGLang |
| Hardware soportado | NVIDIA Blackwell (testeado en Grace Blackwell GB300) |
| Sistema operativo | Linux |
| Tamano del repositorio | 21,9 GB |
| Dataset de calibracion | Nemotron-Post-Training-Dataset-v3 (2.048 muestras) |
| Fecha de creacion del repositorio | 2026-09-17 |

## Arquitectura y entrenamiento

El modelo parte de `Qwen/Qwen3.8-27B`, un transformer autoregresivo de la familia Qwen3.8 registrado con la clase `Qwen3_5ForConditionalGeneration`, lo que confirma que se trata de un modelo condicional multimodal (entrada de texto, imagen y video, salida de texto). La receta de cuantizacion menciona de forma explicita capas de "self-attention" y de "linear-attention", lo que indica una arquitectura de atencion hibrida (combinacion de atencion completa y atencion lineal), coherente con las variantes de contexto largo de Qwen. No se documentan el numero de capas, dimensiones ocultas ni el numero de cabezas de atencion.

El proceso aplicado es una cuantizacion post-entrenamiento (PTQ) de precision mixta: NVFP4 sobre las capas MLP y la cabeza de lenguaje (`lm_head`), y FP8 sobre las capas de atencion. Las capas NVFP4 se calibraron con 2.048 muestras empleando el algoritmo Local-Hessian Calibration de Model Optimizer. No hay entrenamiento adicional, RLHF ni DPO en esta ficha: el checkpoint hereda el post-entrenamiento del modelo base Qwen, cuya composicion de dataset (imagen, texto y video) figura como "undisclosed" en la model card. El dataset de calibracion empleado por NVIDIA es Nemotron-Post-Training-Dataset-v3, corpus multimillonario en muestras pensado para SFT y RL de la familia Nemotron-3.

## Capacidades

- Generacion de texto conversacional a partir de entradas de texto, imagen y video (multimodal de entrada, unimodal de salida).
- Razonamiento cientifico de nivel graduado: la model card cita evaluacion en GPQA Diamond (biologia, fisica y quimica).
- Generacion de codigo cientifico y tecnico: evaluado en SciCode.
- Uso en agentes y tareas de terminal: evaluado en Terminal-Bench, orientado a agentes que operan sobre linea de comandos.
- Recuperacion de informacion en contextos largos: evaluado en AA-LCR (Artificial Analysis Long Context Recall) con ventana de hasta 262K tokens.
- Seguimiento de instrucciones con restricciones estructuradas: evaluado en IFBench.
- Razonamiento multimodal de nivel universitario: evaluado en MMMU-Pro.
- Uso previsto declarado: agentes de IA, chatbots y sistemas RAG.
- Soporte de tool calling / function calling: no documentado explicitamente en la informacion disponible.
- Modo "thinking" explicito: no documentado en la informacion disponible.
- Capacidades multilingues: no disponibles (el campo de idiomas no esta informado).

## Casos de uso

- Atencion al cliente automatizada: el modelo puede mantener conversaciones multi-turno con historial extenso gracias a su ventana de 262K tokens, evitando trocear el contexto o aplicar resumenes agresivos en sesiones largas.
- Sistemas RAG sobre documentacion tecnica: con 262K tokens de contexto puede ingerir manuales completos, expedientes o conjuntos de normativa y responder citando el contenido, con la ventaja de que el checkpoint cuantizado reduce el coste por replica en produccion.
- Agentes que operan en terminal y pipelines de automatizacion: al estar evaluado en Terminal-Bench, encaja en flujos donde el modelo interpreta salidas de comandos y decide el siguiente paso, desplegado con vLLM o SGLang.
- Asistencia de codigo en IDE o CI/CD: su evaluacion en SciCode apunta a generacion de codigo cientifico y de calculo numerico; puede integrarse como servicio de completado o de revision en pull requests.
- Analisis de documentos con imagenes y video: al aceptar RGB y MP4/WebM, permite tareas mixtas como extraer datos de capturas, diagramas, informes escaneados o fotogramas de video junto a texto.
- Tutorizacion y evaluacion educativa de nivel universitario: GPQA Diamond y MMMU-Pro indican capacidad para resolver y explicar preguntas de tipo graduado en ciencias, util en plataformas de practicas guiadas.
- Extraccion y verificacion de informacion en expedientes largos: AA-LCR respalda tareas de localizacion de datos concretos dentro de contextos de cientos de miles de tokens, como contratos o historiales clinicos.
- Despliegue en edge o nodos con VRAM limitada: al ocupar menos de 24 GB de pesos, permite servir una unica instancia en una GPU consumer de gama alta en lugar de recurrir a varias unidades o a un modelo menor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card de este repositorio lista los conjuntos de evaluacion empleados por NVIDIA, pero no incluye puntuaciones numericas para este checkpoint cuantizado.

| Benchmark | Que evalua | Resultado |
|---|---|---|
| GPQA Diamond | Preguntas de nivel graduado en biologia, fisica y quimica | no disponible |
| Terminal-Bench | Tareas de agente sobre terminal | no disponible |
| AA-LCR | Recuperacion de informacion en contextos largos | no disponible |
| MMMU-Pro | Razonamiento multimodal de nivel universitario | no disponible |
| SciCode | Codigo de caracter cientifico | no disponible |
| IFBench | Seguimiento de instrucciones con restricciones | no disponible |

## Requisitos de hardware

- Pesos: aproximadamente 21,9 GB en repositorio, por lo que la VRAM minima realista para los pesos esta en torno a 22-24 GB.
- VRAM estimada por componente: los pesos ocupan unos 22 GB; a ello hay que sumar la cache KV, cuyo tamano exacto no es calculable con los datos disponibles (no se informan numero de capas, cabezas ni dimension de cabeza). Con contexto de 262K tokens la cache KV puede superar con holgura el tamano de los pesos.
- GPU recomendadas: NVIDIA Grace Blackwell GB300 (hardware de validacion declarado), B200 y GPUs Blackwell de centro de datos. El soporte nativo de NVFP4 requiere arquitectura Blackwell.
- GPU consumer: los pesos caben en una RTX 5090 (32 GB) o, muy justo, en una RTX 4090 (24 GB) si se limita drasticamente la longitud de contexto; en 24 GB el margen para cache KV es minimo. No se documenta soporte de NVFP4 en GPUs Ampere o Ada, por lo que su uso en RTX 3090 o RTX 4090 no esta garantizado.
- Despliegue: vLLM y SGLang son los unicos motores declarados. No se documenta soporte para llama.cpp, Ollama, TGI ni TensorRT-LLM en esta ficha.
- Latencia y throughput: no disponibles. La model card solo indica que la inferencia se acelero con vLLM sobre Grace Blackwell GB300, sin cifras.
- Sistema operativo: Linux (preferido y unico documentado).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `brian-learns/Qwen3.8-27B-NVFP4` (este repositorio) | 27B declarados / 18,16B elementos en safetensors | 262K | NVFP4 + FP8 (ModelOpt v0.48.0) | Apache 2.0 | Reupload de terceros, 0 descargas, 0 likes |
| `nvidia/Qwen3.8-27B-NVFP4` | 27B | 262K | NVFP4 + FP8 | Apache 2.0 | Repositorio oficial citado en la model card |
| `Qwen/Qwen3.8-27B` (base) | 27B | 262K | BF16 (sin cuantizar) | Apache 2.0 | Modelo original de Alibaba |

No se dispone de informacion sobre alternativas de cuantizacion equivalentes (GPTQ, AWQ, INT8) del mismo modelo base, ni sobre modelos de otro fabricante con tamano y contexto comparables, por lo que no es posible ampliar la comparativa con datos verificables.

## Limitaciones y advertencias

- Discrepancia de parametros: la model card declara 27B, pero los safetensors reportan 18.164.649.200 elementos. Es habitual en checkpoints FP4 por el empaquetado de pesos y la omision de modulos no cuantizados, pero conviene verificarlo antes de dimensionar el despliegue; no se documenta la causa exacta.
- Repositorio de terceros: no es la publicacion oficial de NVIDIA ni de Qwen. El autor es `brian-learns`, con 0 descargas y 0 likes en el momento de la consulta. Para produccion es preferible validar pesos y procedencia frente al repositorio oficial `nvidia/Qwen3.8-27B-NVFP4`.
- Riesgo de degradacion por cuantizacion: al ser un PTQ de precision mixta, existe perdida de calidad respecto al modelo base en BF16. No se publican metricas comparativas que permitan cuantificar esa perdida.
- Dependencia de hardware: NVFP4 esta pensado para NVIDIA Blackwell. No hay evidencia de soporte en Ampere, Ada o arquitecturas no NVIDIA, lo que limita portabilidad.
- Motores de inferencia: solo vLLM y SGLang estan declarados. El ecosistema GGUF (`llama.cpp`, Ollama, LM Studio) no esta soportado segun la informacion disponible.
- Idiomas: el campo de idiomas no esta informado. No se puede afirmar cobertura multilingue concreta para este checkpoint, aunque el modelo base sea de la familia Qwen.
- Alucinacion: no se publican tasas de alucinacion ni evaluaciones de veracidad. Como en cualquier LLM, el uso en dominios regulados exige verificacion humana.
- Sesgos: no se documentan analisis de sesgo, toxicidad ni evaluaciones de seguridad en la informacion disponible.
- Contexto largo: aunque la ventana es de 262K tokens, no se publican resultados de AA-LCR con cifras, por lo que la calidad de recuperacion en contextos extremos no esta verificada en este checkpoint.
- Coste de cache KV: no se documentan dimensiones de atencion, lo que impide estimar con precision la VRAM necesaria para servir el contexto completo de 262K tokens.
- Licencia: Apache 2.0 permite uso comercial, pero la model card incluye la clausula de terceros de NVIDIA y remite a los terminos del modelo base de Qwen; conviene revisar ambos antes de un despliegue comercial.
- Validacion pendiente: la propia model card recomienda pruebas especificas del caso de uso antes de desplegar en sistemas de IA en produccion.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/brian-learns/Qwen3.8-27B-NVFP4
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio oficial referenciado en la model card: https://huggingface.co/nvidia/Qwen3.8-27B-NVFP4
- NVIDIA Model Optimizer (GitHub): https://github.com/NVIDIA/Model-Optimizer
- Documentacion de Local Hessian Calibration: https://nvidia.github.io/Model-Optimizer/announcements/local-hessian.htm
- Configuracion de LocalHessianCalibConfig: https://nvidia.github.io/Model-Optimizer/reference/generated/modelopt.torch.quantization.config.html#modelopt.torch.quantization.config.LocalHessianCalibConfig
- Dataset de calibracion Nemotron-Post-Training-Dataset-v3: https://huggingface.co/collections/nvidia/nemotron-post-training-v3
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0

Nota: la busqueda web realizada no ha devuelto resultados relevantes sobre este modelo; los unicos enlaces utiles son los proporcionados en la model card y en los metadatos de HuggingFace.
