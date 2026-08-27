# nvidia/Ising-Calibration-1.5-31B-NVFP4

## Resumen

NVIDIA Ising-Calibration-1.5-31B-NVFP4 es un modelo multimodal de visión y lenguaje (VLM) denso, desarrollado por NVIDIA sobre la base de Google Gemma 4 31B. Su propósito específico es analizar gráficos de experimentos de calibración en computación cuántica y generar texto técnico estructurado en seis categorías: descripción técnica, conclusión experimental, significado del experimento, evaluación de la calidad del ajuste, extracción de parámetros y clasificación de éxito del experimento. Está pensado para investigadores, ingenieros de calibración y desarrolladores que necesitan automatizar o asistir flujos de calibración de qubits.

El modelo se distribuye en formato NVFP4 (cuantización de 4 bits de NVIDIA) y también existe una variante BF16, ambas servidas a través de NVIDIA NIM con backend vLLM. La versión NVFP4 ocupa 20,5 GB en el repositorio y declara 16.629.725.036 parámetros en los safetensors, aunque la model card indica "aproximadamente 31B" (probablemente refiriéndose al modelo base sin cuantizar). Está disponible bajo licencia OpenMDW 1.1, que permite uso comercial, y se integra mediante una API compatible con OpenAI.

La relevancia actual de este modelo radica en que aborda un nicho muy concreto: la interpretación automática de gráficos de calibración cuántica, un paso crítico en el mantenimiento y optimización de procesadores cuánticos. Su publicación se acompaña del benchmark QCalEval, también de NVIDIA, que evalúa la capacidad de los VLM para comprender este tipo de gráficos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Densa multimodal vision-lenguaje (VLM) basada en Gemma 4 31B |
| Parametros totales | 16.629.725.036 (segun safetensors); la model card indica "aproximadamente 31B" |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (se sugieren max_tokens de salida de 8192 en zero-shot y 32767 en ICL) |
| Tipos de cuantizacion | NVFP4 (4 bits de NVIDIA), BF16 (variante separada) |
| Idiomas soportados | No disponible |
| Licencia | OpenMDW 1.1 (con mencion adicional a Apache 2.0) |
| Formato de pesos | safetensors (tambien disponible via NIM con NVFP4) |

## Arquitectura y entrenamiento

El modelo combina un procesador de vision integrado para imagenes de graficos de experimentos con un modelo de lenguaje denso Gemma 4 31B para generacion autoregresiva de texto. Es una arquitectura multimodal clasica: las imagenes se procesan mediante un codificador visual y las representaciones resultantes se alimentan junto con el prompt de texto al modelo de lenguaje. No se trata de un modelo de mezcla de expertos (MoE), sino de un transformer denso.

Los datos de entrenamiento y el proceso de ajuste fino no se detallan en la informacion disponible. Se menciona que el modelo fue desarrollado por NVIDIA especificamente para la comprension de graficos de calibracion cuantica, y que se evalua con el benchmark QCalEval. No hay informacion publica sobre el numero de tokens de entrenamiento, la composicion del dataset ni el uso de tecnicas como RLHF o DPO. La innovacion principal reside en la especializacion del modelo en un dominio cientifico muy concreto y en su integracion con el ecosistema NVIDIA NIM para servir en precision NVFP4.

## Capacidades

- Analisis de graficos de calibracion de computacion cuantica: interpreta imagenes de experimentos (curvas, ajustes, parametros) y genera descripciones tecnicas estructuradas.
- Generacion de texto tecnico en seis categorias: descripcion tecnica, conclusion experimental, significado experimental, evaluacion de calidad de ajuste, extraccion de parametros y clasificacion de exito del experimento.
- Soporte de entrada multimodal: acepta texto e imagenes (RGB en formato PNG, JPEG o JPG), tanto una sola imagen como multiples imagenes.
- Integracion con API compatible con OpenAI: se sirve a traves de NVIDIA NIM con backend vLLM, lo que facilita su despliegue en entornos de produccion.
- Precision NVFP4: cuantizacion de 4 bits de NVIDIA que reduce el uso de memoria y acelera la inferencia en hardware Blackwell y Hopper.
- Capacidad conversacional: el modelo puede mantener dialogos multi-turno (etiqueta "conversational" en HuggingFace), aunque su uso principal es el analisis de graficos.

## Casos de uso

- Automatizacion de flujos de calibracion de qubits: el modelo puede analizar automaticamente los graficos de calibracion (por ejemplo, curvas de Rabi, T1, T2) y generar informes tecnicos con conclusiones y parametros extraidos, reduciendo la intervencion manual de los ingenieros.
- Asistencia a investigadores en laboratorio: un investigador puede subir una imagen de un experimento de calibracion y recibir una descripcion tecnica detallada, una evaluacion de la calidad del ajuste y una clasificacion de exito, lo que agiliza la revision de resultados.
- Control de calidad en fabricacion de procesadores cuanticos: en lineas de produccion, el modelo puede clasificar rapidamente si un experimento de calibracion fue exitoso o no, ayudando a detectar desviaciones en el rendimiento de los qubits.
- Documentacion automatica de experimentos: el modelo puede generar descripciones y conclusiones en lenguaje natural a partir de los graficos, facilitando la creacion de informes de laboratorio o entradas en cuadernos de bitacora.
- Integracion en pipelines de investigacion: mediante la API compatible con OpenAI, el modelo puede integrarse en scripts de Python o herramientas de analisis de datos para procesar lotes de graficos de calibracion y generar resumenes estructurados.
- Formacion y educacion: puede utilizarse como herramienta didactica para que estudiantes de computacion cuantica comprendan como interpretar graficos de calibracion, comparando sus propias analisis con las generadas por el modelo.

## Benchmarks y rendimiento

No se han publicado resultados numericos de benchmarks en la informacion disponible. La model card incluye una imagen del leaderboard QCalEval (zero-shot y MM-ICL) donde se destaca el modelo, pero no se proporcionan las cifras concretas. El paper asociado (arXiv:2604.25884) describe el benchmark QCalEval, pero no se dispone de los datos de rendimiento en esta ficha. Se recomienda consultar el repositorio de QCalEval en GitHub o el dataset en HuggingFace para obtener metricas detalladas.

## Requisitos de hardware

- VRAM estimada: no se especifica oficialmente, pero al tratarse de un modelo de ~31B cuantizado a NVFP4 (4 bits), se estima que puede caber en GPUs con 24 GB de VRAM o mas. La version BF16 requeriria aproximadamente 62 GB de VRAM.
- GPUs compatibles: NVIDIA Blackwell y NVIDIA Hopper (segun la model card). No se menciona soporte para Ampere o Turing.
- Despliegue en consumer GPU: no se garantiza; el modelo esta optimizado para datacenter (H100, B200, etc.). En una RTX 4090 (24 GB) podria intentarse con cuantizacion NVFP4, pero no esta oficialmente soportado.
- Opciones de despliegue: NVIDIA NIM con backend vLLM (recomendado), tambien se puede cargar con Transformers (libreria transformers) y safetensors.
- Latencia y throughput: no disponibles. Dependen del hardware y de la configuracion de vLLM.

## Comparativa con modelos similares

No se dispone de una comparativa directa con otros modelos especializados en calibracion cuantica, ya que es un nicho muy especifico. Como referencia, se puede comparar con VLM generalistas como LLaVA-NeXT o Qwen2-VL, pero no hay datos de rendimiento en QCalEval para esos modelos en la informacion proporcionada. La comparativa mas relevante seria con la version BF16 del mismo modelo (NVIDIA-Ising-Calibration-1.5-31B-BF16), que ofrece mayor precision pero requiere mas VRAM. No se dispone de datos adicionales.

## Limitaciones y advertencias

- Dominio limitado: el modelo esta especializado en graficos de calibracion cuantica; su rendimiento en otras tareas de vision-lenguaje generales no esta garantizado.
- Validacion experta requerida: la model card advierte explicitamente que las salidas deben ser validadas por expertos de dominio antes de actuar sobre las conclusiones experimentales.
- Sesgos y alucinaciones: como todo modelo de lenguaje, puede generar descripciones incorrectas o inventar parametros si la imagen es ambigua o esta fuera de distribucion.
- Requisitos de hardware: solo compatible con GPUs NVIDIA Blackwell y Hopper, lo que limita su despliegue en entornos con hardware mas antiguo.
- Licencia OpenMDW 1.1: aunque permite uso comercial, es una licencia especifica que debe revisarse detenidamente; se menciona Apache 2.0 como informacion adicional, pero los terminos exactos pueden variar.
- Idiomas: no se especifican los idiomas soportados; probablemente el modelo este optimizado para ingles tecnico, dado el contexto cientifico.
- Contexto limitado: no se publica la longitud de contexto del modelo, lo que dificulta estimar su capacidad para manejar documentos largos o multiples imagenes.

## Enlaces

- HuggingFace: https://huggingface.co/nvidia/Ising-Calibration-1.5-31B-NVFP4
- NVIDIA NIM (build): https://build.nvidia.com/nvidia/ising-calibration-1.5-31b
- NGC Catalog: https://catalog.ngc.nvidia.com/orgs/nim/teams/nvidia/containers/ising-calibration-1-5-31b
- API Reference: https://docs.api.nvidia.com/nim/reference/nvidia-ising-calibration-1-5-31b
- Paper (arXiv): https://arxiv.org/abs/2604.25884
- Benchmark dataset: https://huggingface.co/datasets/nvidia/QCalEval
- GitHub QCalEval: https://github.com/NVIDIA/QCalEval
- Pagina de Ising de NVIDIA: https://developer.nvidia.com/ising
- Licencia OpenMDW 1.1: https://openmdw.ai/license/1-1/
