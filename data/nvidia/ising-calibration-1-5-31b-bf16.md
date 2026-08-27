# nvidia/Ising-Calibration-1.5-31B-BF16

## Resumen

NVIDIA-Ising-Calibration-1.5-31B-BF16 es un modelo multimodal de visión-lenguaje (VLM) desarrollado por NVIDIA, construido sobre la base de Gemma 4 31B de Google. Su propósito específico es analizar gráficos de experimentos de calibración en computación cuántica y generar texto técnico estructurado en seis categorías: descripción técnica, conclusión experimental, significancia experimental, evaluación de calidad de ajuste, extracción de parámetros y clasificación de éxito del experimento. Está pensado para investigadores, ingenieros de calibración y desarrolladores que trabajan con hardware cuántico y necesitan automatizar o asistir el análisis de datos de calibración.

El modelo es denso (no es MoE), con aproximadamente 31 000 millones de parámetros, y se distribuye en precisión BF16. Su relevancia actual radica en que aborda un problema muy específico y técnico: la interpretación de gráficos de calibración cuántica, un área donde los modelos generalistas suelen fallar por falta de conocimiento de dominio. NVIDIA lo ofrece tanto en HuggingFace como a través de su plataforma NIM, con un backend vLLM y una API compatible con OpenAI, lo que facilita su integración en flujos de trabajo existentes. La licencia OpenMDW 1.1 permite uso comercial, aunque con ciertas condiciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Dense multimodal vision-language (procesamiento de vision integrado + modelo de lenguaje autoregresivo basado en Gemma 4 31B) |
| Parametros totales | 31 273 088 876 (aproximadamente 31B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | BF16 (serving precision); se menciona NVFP4 en la version NIM |
| Idiomas soportados | No disponible |
| Licencia | OpenMDW 1.1 (con términos adicionales de Apache License 2.0) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo combina un procesador de vision integrado para interpretar imagenes de graficos de experimentos con un modelo de lenguaje denso de 31B basado en Gemma 4 31B. La arquitectura es autoregresiva para la generacion de texto, y el procesamiento de imagenes esta disenado especificamente para graficos de calibracion cuantica (tipicamente diagramas 2D con curvas, puntos de datos y ajustes). No se han publicado detalles sobre el dataset de entrenamiento, el numero de tokens utilizados o si se aplicaron tecnicas como RLHF o DPO. La model card indica que el modelo fue desarrollado por NVIDIA y que se sirve con NVIDIA NIM sobre un backend vLLM, con precision BF16. No se mencionan innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Analisis de graficos de calibracion cuantica: interpreta imagenes de experimentos (curvas, puntos, ajustes) y genera descripciones tecnicas detalladas.
- Generacion de texto estructurado en seis categorias: descripcion tecnica, conclusion experimental, significancia, evaluacion de calidad de ajuste, extraccion de parametros y clasificacion de exito.
- Soporte de entrada multimodal: acepta texto e imagenes (RGB en formato PNG, JPEG, JPG), tanto una sola imagen como multiples imagenes por prompt.
- Salida en lenguaje natural: produce analisis tecnicos, conclusiones y evaluaciones en formato de texto.
- Integracion con API OpenAI-compatible: se puede desplegar via NVIDIA NIM con vLLM, lo que facilita su uso en pipelines existentes.
- No se menciona soporte de tool calling, function calling, agentes o razonamiento multi-paso explicito.

## Casos de uso

- Automatizacion de flujos de calibracion cuantica: el modelo puede analizar graficos de calibracion generados por sistemas de control cuantico y producir informes tecnicos automaticos, reduciendo la carga de trabajo manual de los ingenieros.
- Asistencia a investigadores en computacion cuantica: al recibir un grafico de un experimento, el modelo genera una descripcion tecnica y una conclusion preliminar que el investigador puede validar y refinar.
- Control de calidad en fabricacion de qubits: en entornos de produccion de hardware cuantico, el modelo puede clasificar si un experimento de calibracion fue exitoso o no, ayudando a detectar desviaciones tempranas.
- Extraccion de parametros de ajuste: a partir de graficos con curvas ajustadas, el modelo extrae valores numericos de parametros (por ejemplo, frecuencias, amplitudes, tiempos de coherencia) que luego se pueden comparar con especificaciones.
- Documentacion tecnica automatizada: el modelo puede generar secciones de informes de laboratorio o entradas de bitacora a partir de graficos, manteniendo un registro consistente y estructurado.
- Educacion y formacion: estudiantes de computacion cuantica pueden usar el modelo para entender que informacion se puede extraer de un grafico de calibracion y como se interpreta, aunque siempre con supervisión de un experto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona el benchmark QCalEval (disponible en HuggingFace y GitHub) y un paper en arXiv (2604.25884), pero no se incluyen numeros concretos de rendimiento en la documentacion proporcionada. Se recomienda consultar el paper y el dataset para obtener metricas detalladas.

## Requisitos de hardware

- VRAM estimada: no disponible en la informacion proporcionada. Dado el tamano de 31B en BF16, se estima que requiere al menos 62 GB de VRAM solo para los pesos (el repo ocupa 62.6 GB), por lo que se necesitan GPUs con memoria suficiente.
- GPUs recomendadas: NVIDIA Blackwell y NVIDIA Hopper (segun la model card). No se mencionan GPUs de consumo como RTX 4090, y es probable que no quepa en una GPU de consumo estandar sin cuantizacion adicional.
- Opciones de despliegue: NVIDIA NIM con backend vLLM, API compatible con OpenAI. Tambien se puede cargar con transformers en HuggingFace, aunque el rendimiento optimo se logra con NIM.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la misma categoria (analisis de graficos de calibracion cuantica). Este es un nicho muy especifico y no se han encontrado alternativas publicas similares en la busqueda realizada.

## Limitaciones y advertencias

- Sesgos y alucinaciones: como cualquier modelo de lenguaje, puede generar texto plausible pero incorrecto. La model card advierte explicitamente que las salidas deben ser validadas por expertos de dominio antes de actuar sobre conclusiones experimentales.
- Especificidad de dominio: el modelo esta entrenado para graficos de calibracion cuantica; su rendimiento en otros tipos de graficos o dominios cientificos no esta garantizado.
- Limitaciones de contexto: no se ha especificado la longitud de contexto, por lo que no se conoce el limite de tokens para prompts largos o multiples imagenes.
- Restricciones de licencia: la licencia OpenMDW 1.1 permite uso comercial, pero es necesario revisar los terminos completos en openmdw.ai/license/1-1/ para cumplir con las condiciones (por ejemplo, atribucion, uso responsable, etc.).
- Requisitos de hardware: al ser un modelo de 31B en BF16, requiere GPUs de alta gama (Blackwell o Hopper) para una inferencia eficiente, lo que limita su despliegue en entornos con hardware modesto.
- Idiomas: no se ha especificado que idiomas soporta; probablemente este optimizado para ingles tecnico, pero no hay confirmacion.

## Enlaces

- HuggingFace: https://huggingface.co/nvidia/Ising-Calibration-1.5-31B-BF16
- NVIDIA NIM (Build API): https://build.nvidia.com/nvidia/ising-calibration-1.5-31b
- Documentacion API NIM: https://docs.api.nvidia.com/nim/reference/nvidia-ising-calibration-1-5-31b
- NGC Catalog: https://catalog.ngc.nvidia.com/orgs/nim/teams/nvidia/containers/ising-calibration-1-5-31b
- Paper QCalEval: https://arxiv.org/abs/2604.25884
- Dataset QCalEval: https://huggingface.co/datasets/nvidia/QCalEval
- GitHub QCalEval: https://github.com/NVIDIA/QCalEval
- Pagina de desarrollador Ising: https://developer.nvidia.com/ising
- Licencia OpenMDW 1.1: https://openmdw.ai/license/1-1/
