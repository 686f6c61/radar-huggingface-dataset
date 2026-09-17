# nvidia/DeepSeek-V4.1-Flash-NVFP4

## Resumen

NVIDIA DeepSeek-V4.1-Flash-NVFP4 es un checkpoint cuantizado del modelo DeepSeek-V4.1-Flash de DeepSeek AI, publicado por NVIDIA a traves de su herramienta Model Optimizer. No se trata de un modelo entrenado por NVIDIA: la propia model card indica que el modelo es de un tercero y que NVIDIA solo lo ha cuantizado para su despliegue en hardware Blackwell. El modelo base es un transformer autorregresivo multimodal nativo con arquitectura Mixture-of-Experts (MoE) y diseno Causal Encoder-Decoder (CED), que incorpora Compressed Sparse Attention 2 (CSA2) y una memoria condicional Engram.

El modelo suma 763.205.315.794 parametros segun los pesos alojados en safetensors, desglosados por la model card en 552.000 millones de parametros de backbone mas 196.000 millones de memoria condicional Engram. La activacion es dispersa: 8.000 millones de parametros durante la fase de prefill y 16.000 millones durante el decode. Soporta contextos de hasta un millon de tokens y acepta entradas de texto e imagen, con salida exclusivamente de texto.

Su relevancia es practica: se distribuye ya pre-cuantizado en NVFP4 (W4A4) para los expertos MoE enrutados, con el objetivo declarado de facilitar el despliegue de agentes, chatbots y sistemas RAG sin tener que ejecutar el pipeline de cuantizacion. El repositorio ocupa 527,3 GB y esta publicado bajo licencia MIT, con soporte validado en vLLM y SGLang sobre NVIDIA GB300. En el momento de la consulta acumula 132 descargas y 20 likes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer autorregresivo multimodal nativo; Mixture-of-Experts con Causal Encoder-Decoder (CED) y Compressed Sparse Attention 2 (CSA2), mas memoria condicional Engram (`DeepseekV41ForCausalLM`) |
| Parametros totales | 763.205.315.794 (~763,2 B) segun los pesos en safetensors; la model card desglosa 552 B de backbone mas 196 B de memoria condicional Engram |
| Parametros activos | 8 B durante prefill y 16 B durante decode |
| Longitud de contexto | Hasta 1.000.000 tokens (1 M) |
| Tipos de cuantizacion | NVFP4 (W4A4) en los expertos MoE enrutados, con group size 16, convertidos desde MXFP4; los tags del repositorio mencionan ademas 8-bit y fp8 |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (pesos cuantizados NVFP4) |

Otros datos del repositorio: biblioteca declarada Model Optimizer, pipeline image-text-to-text, tamano del repositorio 527,3 GB, fecha de creacion 2026-09-16 y ultima actualizacion 2026-09-17.

## Arquitectura y entrenamiento

La arquitectura del modelo base es un transformer autorregresivo con capas Mixture-of-Experts y un esquema Causal Encoder-Decoder. Incorpora Compressed Sparse Attention 2 (CSA2), una variante de atencion dispersa comprimida, y una memoria condicional Engram de 196.000 millones de parametros que se suma a los 552.000 millones del backbone. El modelo es multimodal nativo, con entradas de texto e imagen (RGB) y salida de texto. El contexto maximo declarado es de un millon de tokens. La activacion dispersa distingue entre prefill (8.000 millones de parametros activos) y decode (16.000 millones), lo que reduce el coste computacional por token respecto a un modelo denso del mismo tamano.

Este checkpoint concreto no implica un reentrenamiento: es una cuantizacion post-entrenamiento generada con nvidia-modelopt v0.47.0rc0 y cambios de compatibilidad especificos de V4.1, sobre la revision de origen `dba1be0a40aa45a94ad051997016db3960a90277`. La conversion transforma los expertos MoE enrutados ordinarios de MXFP4 a pesos y activaciones NVFP4 (W4A4) con group size 16, aplicandose a las proyecciones `w1`, `w2` y `w3`. El proceso de calibracion uso 1.024 muestras en total (512 de cnn_dailymail y 512 de Nemotron-Post-Training-Dataset-v2, en los subconjuntos `stem`, `chat`, `math` y `code`), con longitud de secuencia 512, batch size 4 y semilla de seleccion 0. La composicion del dataset de entrenamiento original figura como "undisclosed" en la model card, y no se aporta informacion sobre RLHF, DPO u otras tecnicas de alineamiento.

## Capacidades

- Generacion de texto autorregresiva a partir de entradas de texto e imagen (pipeline image-text-to-text), con salida en formato string.
- Procesamiento de contexto largo: la ventana de hasta 1 M de tokens permite recall sobre documentos muy extensos; el benchmark AA-LCR figura entre los conjuntos de evaluacion declarados.
- Razonamiento cientifico y de dominio tecnico: los conjuntos de evaluacion declarados incluyen GPQA Diamond.
- Codigo cientifico y de terminal: SciCode y Terminal-Bench 2.1 aparecen como benchmarks de evaluacion, lo que apunta a tareas de coding y de agente en linea de comandos.
- Seguimiento de instrucciones: evaluado con IFBench.
- Comprension visual: evaluado con MMMU-Pro, coherente con la entrada de imagen declarada.
- Tool calling y function calling: SGLang se valido mediante pruebas de carga, generacion, parsing de razonamiento y de tool-call, y smoke tests de entrada de imagen.
- Capacidades de agente y razonamiento multi-paso: la model card orienta el modelo a sistemas de agentes de IA, chatbots y RAG, y menciona explicitamente el parsing de razonamiento.
- Cuantizacion integrada: el checkpoint NVFP4 permite ejecucion de baja precision sin pipeline adicional, en los runtimes soportados.

## Casos de uso

- Agentes autonomos de terminal: el modelo puede ejecutar flujos multi-paso sobre linea de comandos, dado que Terminal-Bench 2.1 forma parte de su bateria de evaluacion declarada y que SGLang valida el parsing de tool-calls. Es adecuado para automatizar operaciones de sistema y tareas de ingenieria repetitivas.
- Atencion al cliente automatizada: con 1 M de tokens de contexto, el modelo puede mantener conversaciones multi-turno arrastrando el historial completo y documentacion de producto sin necesidad de truncado ni de resumen intermedio.
- RAG sobre corpus masivos: la ventana de 1 M tokens y la evaluacion con AA-LCR lo hacen util para recuperacion y respuesta sobre normativa, contratos o documentacion tecnica extensa, reduciendo el numero de fragmentos que hay que recuperar por separado.
- Analisis de documentacion cientifica con figuras: al aceptar entradas de imagen y texto, puede procesar articulos con graficos, tablas e imagenes de resultados (evaluado con MMMU-Pro) y generar resumenes o respuestas sobre ellos.
- Generacion y revision de codigo cientifico: el modelo se evalua con SciCode, por lo que encaja en pipelines de asistencia a la investigacion numerica, revision de notebooks y generacion de scripts de simulacion.
- Despliegue en produccion sobre infraestructura Blackwell: se puede servir con vLLM o SGLang en GB300, integrado en pipelines existentes de agentes sin necesidad de cuantizar el modelo en el momento del despliegue.
- Asistente de investigacion tecnica: combinando GPQA Diamond como referencia de razonamiento cientifico y el contexto de 1 M tokens, resulta apto para exploracion de literatura, comparacion de hipotesis y sintesis de material de dominio.
- Inspeccion visual asistida en entornos tecnicos: la entrada RGB permite tareas como lectura de capturas de terminal, diagramas de arquitectura o paneles de monitorizacion, con salida de texto estructurado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente enumera los conjuntos de evaluacion empleados, sin cifras asociadas.

| Benchmark | Area evaluada | Resultado |
|---|---|---|
| GPQA Diamond | Razonamiento cientifico | no disponible |
| AA-LCR | Recall en contexto largo | no disponible |
| SciCode | Codigo cientifico | no disponible |
| IFBench | Seguimiento de instrucciones | no disponible |
| MMMU-Pro | Comprension visual | no disponible |
| Terminal-Bench 2.1 | Tareas de agente en terminal | no disponible |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita. El repositorio de pesos ocupa 527,3 GB, por lo que el footprint de pesos es de ese orden y exige agregacion de memoria en varios aceleradores.
- GPU recomendadas: microarquitectura NVIDIA Blackwell. Los runtimes vLLM y SGLang se han probado con este checkpoint en NVIDIA GB300. No se declaran otras GPU compatibles.
- GPU de consumo: no. Un modelo de 763,2 B de parametros con un repositorio de 527,3 GB no cabe en ninguna GPU de consumo actual; el despliegue requiere hardware de centro de datos en configuracion multi-GPU.
- Opciones de despliegue: vLLM y SGLang son los motores soportados y probados. No se mencionan llama.cpp, Ollama, TGI ni otras alternativas en la informacion disponible.
- Sistema operativo: Linux es el sistema preferido declarado.
- Latencia y throughput: no disponible. La model card menciona que los resultados de benchmark se obtuvieron con vLLM, pero no publica valores numericos.

## Comparativa con modelos similares

La informacion disponible solo permite comparar este checkpoint con su modelo base sin cuantizar. No se dispone de datos de otros modelos comparables en la documentacion proporcionada.

| Aspecto | DeepSeek-V4.1-Flash-NVFP4 | DeepSeek-V4.1-Flash (base) |
|---|---|---|
| Desarrollador | NVIDIA (cuantizacion) | DeepSeek AI |
| Arquitectura | MoE con CED y CSA2, multimodal | MoE con CED y CSA2, multimodal |
| Parametros totales | 763,2 B en safetensors | 552 B de backbone mas 196 B de Engram |
| Parametros activos | 8 B prefill / 16 B decode | no disponible |
| Contexto | Hasta 1 M tokens | Hasta 1 M tokens |
| Precision | NVFP4 (W4A4) en expertos MoE enrutados | MXFP4 en expertos enrutados (origen de la conversion) |
| Licencia | MIT | MIT |
| Hardware objetivo | NVIDIA Blackwell (GB300 validado) | no disponible |
| Runtimes | vLLM, SGLang | no disponible |

## Limitaciones y advertencias

- No hay resultados de benchmarks publicados para este checkpoint, por lo que no es posible cuantificar la perdida de calidad introducida por la cuantizacion NVFP4 respecto al modelo base.
- La cuantizacion W4A4 con group size 16 puede degradar la precision numerica en tareas sensibles al detalle; conviene validar con datos propios del caso de uso antes de desplegar.
- El conjunto de calibracion esta compuesto por cnn_dailymail (ingles) y Nemotron-Post-Training-Dataset-v2 en los subconjuntos `stem`, `chat`, `math` y `code`. No se declara cobertura multilingue de la calibracion.
- Los idiomas soportados figuran como no disponibles; no se puede asumir un rendimiento homogeneo fuera del ingles.
- Composicion del dataset de entrenamiento, metodo de recoleccion y etiquetado: todos declarados como "undisclosed", lo que impide auditar sesgos de origen.
- No se documentan evaluaciones de sesgo, toxicidad o seguridad, ni procesos de RLHF o DPO en la informacion disponible.
- Riesgo de alucinacion inherente a los modelos generativos; la model card no aporta tasas de error ni mitigaciones especificas.
- Dependencia de hardware: la compatibilidad declarada se limita a la microarquitectura NVIDIA Blackwell, con pruebas en GB300. No se garantiza funcionamiento en generaciones anteriores de GPU.
- Licencia MIT, pero con la consideracion de terceros: el modelo pertenece a DeepSeek AI y NVIDIA solo realiza la cuantizacion. La model card remite a la model card del modelo base para los terminos aplicables.
- El repositorio de 527,3 GB implica requisitos elevados de almacenamiento y de ancho de banda en el despliegue.
- La model card recomienda explicitamente pruebas adicionales con datos propios del caso de uso siguiendo una metodologia en V antes de llevar el modelo a produccion.
- En el momento de la consulta el modelo acumula 132 descargas, por lo que existe poca experiencia de uso reportada por la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/nvidia/DeepSeek-V4.1-Flash-NVFP4
- Modelo base (DeepSeek-V4.1-Flash, DeepSeek AI): https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash
- NVIDIA Model Optimizer (repositorio): https://github.com/NVIDIA/Model-Optimizer
- Licencia MIT: https://huggingface.co/datasets/choosealicense/licenses/blob/main/markdown/mit.md
- Dataset de calibracion cnn_dailymail: https://huggingface.co/datasets/abisee/cnn_dailymail
- Dataset de calibracion Nemotron-Post-Training-Dataset-v2: https://huggingface.co/datasets/nvidia/Nemotron-Post-Training-Dataset-v2
- Sitio oficial de NVIDIA: https://www.nvidia.com/
- Pagina de NVIDIA en Wikipedia: https://en.wikipedia.org/wiki/Nvidia
