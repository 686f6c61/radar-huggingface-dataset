# nnujabes/pickcu-ax-4.0-light-gguf

## Resumen

Pick CU A.X-4.0-Light GGUF (Q5_K_M) es una version cuantizada y fusionada del modelo base surcoreano skt/A.X-4.0-Light, publicada por el usuario nnujabes. Se trata de un modelo especializado en la interpretacion de condiciones nutricionales: recibe una frase en coreano (por ejemplo, una peticion de comida por debajo de un presupuesto tras entrenar) y devuelve un JSON estructurado con los nutrientes objetivo y la direccion deseada (alto o bajo). El modelo resulta de fusionar el adaptador LoRA `nnujabes/pickcu-ax-4.0-light-lora` sobre el modelo original y convertirlo posteriormente a formato GGUF con cuantizacion Q5_K_M.

El modelo cuenta con 7.259.624.960 parametros totales y un archivo GGUF de 5.175.334.784 bytes (aproximadamente 5,2 GB), lo que permite ejecutarlo en una GPU de consumo como la RTX 4060 de 8 GB. Es el modelo final del servicio web Pick CU y esta disenado para desplegarse mediante Ollama o llama.cpp sin necesidad de cargar el modelo original ni el adaptador por separado.

Su relevancia radica en que demuestra un flujo completo de especializacion (QLoRA sobre el modelo base, fusion, conversion a GGUF y cuantizacion) para una tarea concreta de extraccion estructurada, con un rendimiento medido de 87,5 % de acierto en el conjunto de test y un tiempo de inferencia de 0,81 segundos por frase en una RTX 4060. No obstante, su alcance es muy acotado: no es un modelo de proposito general y su licencia no esta declarada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base skt/A.X-4.0-Light, transformer) |
| Parametros totales | 7.259.624.960 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q5_K_M (unica version publicada) |
| Idiomas soportados | coreano (ko) |
| Licencia | no disponible |
| Formato de pesos | GGUF (`pickcu-ax-Q5_K_M.gguf`) |

## Arquitectura y entrenamiento

El modelo parte de skt/A.X-4.0-Light, un modelo base del que no se detalla en la informacion disponible su arquitectura interna, numero de capas ni composicion del dataset de preentrenamiento. Sobre ese modelo se entreno un adaptador LoRA (denominado `nnujabes/pickcu-ax-4.0-light-lora`) mediante QLoRA, es decir, sobre una version cuantizada a 4 bits del modelo base. La tarea de ajuste consiste en mapear frases en coreano sobre necesidades nutricionales a una salida JSON con la estructura `{"nutrients": [{"nutrient": ..., "direction": ...}]}`.

El proceso de publicacion consistio en fusionar el adaptador con el modelo base en precision bf16 mediante la formula `W + (alpha / r) × (B @ A)` aplicada tensor a tensor (con un pico de memoria de unos 10 GB), convertir el resultado a GGUF en bf16 con `convert_hf_to_gguf.py` de llama.cpp y cuantizar a Q5_K_M con `llama-quantize`. El proceso completo se realizo solo con CPU en aproximadamente 3 minutos, usando el commit `4b77dee0524c64b8471869232e2958bd9589607d` de llama.cpp. Un detalle tecnico relevante es que el tokenizador de A.X no estaba incluido en la lista de conversores de llama.cpp, por lo que se registro localmente con el hash del tokenizador `gpt-2` (con la regex ByteLevel por defecto), siguiendo el mismo criterio que el GGUF publico `mykor/A.X-4.0-Light-gguf`.

## Capacidades

- Extraccion de condiciones nutricionales: dada una frase en coreano, devuelve un JSON con los nutrientes objetivo y la direccion (alto o bajo).
- Salida estructurada en JSON con formato controlado, sin errores de formato registrados (0 errores en las pruebas reportadas).
- Conversacion basica: el `Modelfile` incluye un system prompt de servicio que responde `{"nutrients": []}` ante saludos o conversacion trivial.
- Generacion de texto limitada al dominio de la tarea; no se documentan capacidades de razonamiento general, codigo, matematicas o vision.
- No se documenta soporte de tool calling, function calling ni comportamiento agentico.
- Multilingue: solo coreano (ko).
- No se documentan modos especiales como thinking mode, vision o audio.

## Casos de uso

- Servicio web de recomendacion nutricional: el modelo es el motor final del servicio Pick CU, que transforma una peticion en lenguaje natural (por ejemplo, "algo para comer tras entrenar por menos de 5.000 wones") en un filtro estructurado de nutrientes que el backend usa para consultar su catalogo de productos.
- Filtrado de menus en aplicaciones de nutricion: integrado en una app de dietetica, el modelo traduce las preferencias del usuario a criterios de nutrientes alto/bajo que alimentan un motor de busqueda de recetas.
- Preprocesado de consultas en asistentes de compra: en un e-commerce de alimentacion, convierte la intencion del usuario en parametros estructurados para el sistema de recomendacion.
- Despliegue local en hardware de consumo: al ocupar 5,2 GB y ejecutarse en una RTX 4060 de 8 GB con 0,81 s por frase, es viable para prototipos y demos en estaciones de trabajo sin GPU de datacenter.
- Automatizacion de clasificacion nutricional por lotes: procesar grandes volumenes de frases de usuarios para etiquetarlas con condiciones nutricionales y construir datasets o informes agregados.
- Integracion en pipelines Ollama: al registrarse con `ollama create`, puede incorporarse a flujos de agentes o APIs internas que necesiten una etapa de extraccion estructurada en coreano.
- Evaluacion de tecnicas de cuantizacion: sirve como caso practico para comparar el rendimiento de Q5_K_M frente a 4 bits mas adaptador en una tarea de extraccion concreta.

## Benchmarks y rendimiento

Resultados reportados por el autor, medidos en una RTX 4060 de 8 GB. Criterio de acierto: acertar los dos nutrientes y sus direcciones.

| Metrica | 4 bits + adaptador | Este modelo (Q5_K_M) |
|---|---|---|
| Archivos necesarios | Modelo original ~14,5 GB + adaptador ~155 MB | Un unico archivo de ~5,2 GB |
| dev 216 (prompt de entrenamiento) | 186 (86,1 %) | 186 (86,1 %); 213 predicciones por frase coincidentes |
| test 240 (prompt de entrenamiento) | 206 (85,8 %) | 210 (87,5 %) |
| Prompt de servicio (dev / test) | no disponible | 184 / 207 |
| Tiempo por frase | ~3,3 s | 0,81 s |
| Errores de formato | 0 | 0 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 5,2 GB para el archivo GGUF Q5_K_M, mas overhead de contexto y runtime; cabe holgadamente en 8 GB.
- GPU recomendadas: RTX 4060 8 GB (medida por el autor), asi como cualquier GPU consumer con 8 GB o mas (RTX 3060 Ti, RTX 3070, RTX 4070, RTX 4080, RTX 4090). Tambien puede ejecutarse en CPU, ya que el proceso de conversion y cuantizacion se hizo solo con CPU.
- Cabe en GPU de consumo: si, en modelos con 8 GB de VRAM o superior.
- Opciones de despliegue: Ollama (via `Modelfile` incluido), llama.cpp; el autor menciona `endpoints_compatible` como tag, pero no se detalla compatibilidad con vLLM o TGI.
- Latencia y throughput: 0,81 segundos por frase en RTX 4060 8 GB con el prompt de entrenamiento; no se reportan medidas de throughput agregado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento en la tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Pick CU A.X-4.0-Light GGUF Q5_K_M | 7.259.624.960 | no disponible | 87,5 % en test (240 frases) | no disponible | GGUF en Hugging Face |
| skt/A.X-4.0-Light (base) | no disponible | no disponible | no disponible (requiere adaptador) | no disponible | Hugging Face |
| A.X-4.0-Light + LoRA en 4 bits | 7.259.624.960 (aprox.) | no disponible | 85,8 % en test; ~3,3 s por frase | no disponible | Modelo + adaptador separados |
| mykor/A.X-4.0-Light-gguf | no disponible | no disponible | no disponible | no disponible | GGUF en Hugging Face |

No se dispone de datos de benchmarks estandar que permitan comparar con modelos de proposito general de tamano similar.

## Limitaciones y advertencias

- El modelo no esta destinado a asesoramiento nutricional ni a consejo medico; sus salidas no deben interpretarse como recomendaciones clinicas.
- El conjunto de test es pequeno (12 situaciones, 240 frases), por lo que el margen de error de las metricas reportadas es elevado.
- El alcance es muy restringido al dominio de extraccion de condiciones nutricionales en coreano; no es un modelo de proposito general.
- Solo soporta coreano; no se documenta comportamiento en castellano ni en otros idiomas.
- No se declara licencia, lo que impide confirmar si el uso comercial esta permitido; es un riesgo relevante para produccion.
- El adaptador se entreno sobre el modelo base cuantizado a 4 bits y se fusiono sobre bf16, por lo que las condiciones de entrenamiento y de inferencia difieren ligeramente; el autor considera que la diferencia es pequena.
- El tokenizador se registro con el hash de `gpt-2`, lo que puede introducir diferencias sutiles frente al tokenizador original de A.X.
- Riesgo de alucinacion en entradas fuera de dominio: el system prompt de servicio fuerza `{"nutrients": []}` para saludos o conversacion trivial, pero no se documenta el comportamiento ante consultas ambiguas o adversariales.
- No se documentan sesgos especificos ni evaluaciones de robustez.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nnujabes/pickcu-ax-4.0-light-gguf
- Modelo base: https://huggingface.co/skt/A.X-4.0-Light
- Adaptador LoRA: https://huggingface.co/nnujabes/pickcu-ax-4.0-light-lora
- GGUF de referencia del tokenizador: https://huggingface.co/mykor/A.X-4.0-Light-gguf
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Ollama: https://ollama.com
