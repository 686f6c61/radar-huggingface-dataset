# Rumiii/Llama-3.1-8B-xLAM-Agent

## Resumen
Llama-3.1-8B-xLAM-Agent es un ajuste fino supervisado del modelo meta-llama/Llama-3.1-8B-Instruct orientado especificamente al uso de herramientas (function calling). Lo desarrolla el usuario independiente Rumiii y se entrena con QLoRA sobre las primeras 16.000 muestras del dataset Salesforce/xlam-function-calling-60k. El resultado es un modelo de 8.030 millones de parametros (8B densos) que transforma la salida conversacional del Llama base en un array JSON de llamadas a funciones, con una mejora notable en la precision de las llamadas.

El problema que resuelve es concreto: el Llama-3.1-8B-Instruct original no es agentico por si mismo y produce invocaciones de herramientas poco fiables. Tras el ajuste, el autor reporta un aumento de la exactitud estricta del 10,40% al 86,54% y del JSON valido del 76,18% al 99,74% sobre 5.000 muestras de test del mismo dataset. Es relevante para quien necesite un modelo pequeno, desplegable en una sola GPU, para pipelines de agentes y tool calling sin depender de APIs propietarias.

La arquitectura es la del transformer denso de Llama 3.1, con 8B parametros y una ventana de contexto de 128.000 tokens heredada del modelo base. La licencia es la Llama 3.1 Community License, lo que condiciona el uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso decoder-only (Llama 3.1) |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 128.000 tokens (heredada del modelo base; no verificada en la model card) |
| Tipos de cuantizacion | no disponible (pesos publicados en 16-bit; admite cuantizacion estandar tipo GGUF/4-bit, no documentada por el autor) |
| Idiomas soportados | ingles (declarado en la model card; el base soporta mas idiomas, no verificado tras el ajuste) |
| Licencia | Llama 3.1 Community License |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento
El modelo parte de meta-llama/Llama-3.1-8B-Instruct, un transformer denso decoder-only con atencion por grupos (GQA) y RoPE, y se ajusta con QLoRA: r=32, alpha=64, aplicado a todas las proyecciones de atencion y MLP, 1 epoca, tamano de batch efectivo 16 y learning rate 1e-4. El entrenamiento se ejecuto en una unica Tesla T4 (entorno Kaggle), y los adaptadores se fusionaron posteriormente a 16 bits para publicar los pesos finales.

Los datos son las primeras 16.000 filas de Salesforce/xlam-function-calling-60k en su orden original, sin barajado ni truncado (la muestra mas larga tiene 2.999 tokens). La perdida se calcula unicamente sobre la respuesta del asistente. No se documenta RLHF ni DPO; es un ajuste supervisado puro sobre datos sinteticos de llamadas a funciones. La innovacion principal no es arquitectonica sino de formato: el modelo aprende a emitir un unico array JSON de llamadas con la estructura `{"name": ..., "parameters": {...}}`, aceptando las herramientas a traves de la plantilla de chat de Llama 3.1.

## Capacidades
- Generacion de llamadas a funciones en formato JSON estricto, con multiples llamadas agrupadas en un mismo array.
- Interpretacion de definiciones de herramientas en formato JSON Schema pasadas mediante la plantilla de chat.
- Tool calling y function calling orientado a agentes de un solo paso y multi-paso.
- Razonamiento basico y generacion de texto conversacional heredados del Llama-3.1-8B-Instruct.
- Capacidad multilingue limitada: la model card declara solo ingles para este ajuste.
- No se documentan capacidades de vision, audio ni modo thinking explicito.
- No se documenta soporte nativo de agentes con memoria o planificacion autonoma; el autor indica que debe integrarse dentro de flujos agenticos externos.

## Casos de uso
- Orquestacion de agentes con herramientas: el modelo recibe el esquema de funciones disponibles y devuelve el array JSON de llamadas, lo que permite integrarlo como planificador de acciones en frameworks de agentes (LangChain, LlamaIndex, etc.) con validacion posterior de cada llamada.
- Automatizacion de APIs internas: mapear peticiones en lenguaje natural a llamadas concretas a endpoints REST o funciones Python, aprovechando la alta tasa de JSON valido (99,74% reportada) para reducir errores de parseo en produccion.
- Asistentes de operaciones y DevOps: traducir instrucciones como "reinicia el servicio X en el entorno Y" a invocaciones estructuradas de herramientas de infraestructura, con validacion previa antes de ejecutar acciones con efectos secundarios.
- Extraccion estructurada de parametros: usar el modelo para convertir texto libre en argumentos tipados de una funcion, util en pipelines de ingesta de datos y formularios conversacionales.
- Enrutado de consultas en sistemas multi-herramienta: seleccionar la funcion adecuada entre un conjunto grande (la metrica de function-set accuracy reportada es 99,18%), por ejemplo en un asistente que combina busqueda, calculo y consultas a base de datos.
- Prototipado rapido en una sola GPU: al ser un 8B en 16 bits, cabe en GPUs de consumo alto o en instancias cloud modestas, lo que permite iterar sobre esquemas de herramientas sin costes elevados.
- Investigacion sobre function calling: servir como linea base reproducible (QLoRA sobre xLAM) para estudiar tecnicas de ajuste en tool use.

## Benchmarks y rendimiento

Evaluacion del autor sobre 5.000 muestras de test del dataset Salesforce xLAM Function Calling, comparando el modelo ajustado con el Llama-3.1-8B-Instruct original:

| Metrica | Llama-3.1-8B-Instruct | Llama-3.1-8B-xLAM-Agent |
|---|---|---|
| Exact match estricto | 10,40% | 86,54% |
| Salida JSON valida | 76,18% | 99,74% |
| Function-set accuracy | 30,20% | 99,18% |
| F1 a nivel de argumento | 41,73% | 93,10% |

No se han publicado resultados en benchmarks estandar (MMLU, HumanEval, GSM8K, BFCL) en la informacion disponible. Las cifras anteriores provienen de la model card del autor y no han sido verificadas de forma independiente.

## Requisitos de hardware
- Inferencia en 16 bits: aproximadamente 16 GB de VRAM para los pesos, mas overhead de activaciones y cache KV; se recomienda al menos 20-24 GB.
- Cuantizacion 8-bit: en torno a 8-9 GB de VRAM; 4-bit: en torno a 5-6 GB (no documentada por el autor, estimacion estandar para un 8B).
- GPUs recomendadas: A100 40/80 GB o H100 para despliegue de alta concurrencia; RTX 4090 (24 GB) o RTX 3090 para 16 bits en una sola tarjeta; L4 o T4 para cuantizado.
- Cabe en GPU de consumo: si, en RTX 4090/3090 a 16 bits y en tarjetas de 8-12 GB con cuantizacion 4/8-bit.
- Opciones de despliegue: transformers (ejemplo oficial), text-generation-inference (tag `text-generation-inference` en el repo), vLLM y llama.cpp/Ollama mediante conversion a GGUF (no publicada por el autor).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Llama-3.1-8B-xLAM-Agent | 8B densos | 128.000 (heredado) | Function calling (QLoRA sobre xLAM) | Llama 3.1 Community | Hugging Face |
| meta-llama/Llama-3.1-8B-Instruct | 8B densos | 128.000 | Chat general, tool calling nativo limitado | Llama 3.1 Community | Hugging Face |
| Salesforce/xLAM-7b-fc-r | 7B densos | no disponible | Function calling especializado | CC-BY-4.0 (dataset); licencia del modelo segun card | Hugging Face |
| Qwen2.5-7B-Instruct | 7B densos | 32.768 (128K con RoPE) | Chat general con buen soporte de tool calling | Apache 2.0 | Hugging Face |

La comparativa se limita a caracteristicas publicas; no se dispone de resultados cruzados de benchmarks entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias
- Entrenado sobre datos sinteticos: el autor advierte que las salidas pueden contener argumentos incorrectos; toda llamada debe validarse antes de ejecutarse, especialmente si tiene efectos secundarios.
- Riesgo de alucinacion de nombres de funciones o parametros no presentes en el esquema; conviene validar contra el JSON Schema.
- El ajuste se hizo solo sobre las primeras 16.000 muestras del dataset, sin barajado, lo que puede introducir sesgos de distribucion hacia esos tipos de funciones.
- Idioma: la model card declara solo ingles; el rendimiento en castellano no esta verificado y probablemente sea inferior.
- No es agentico por si mismo: requiere un orquestador externo que gestione el bucle de llamadas, resultados y memoria.
- Licencia Llama 3.1 Community: impone restricciones de uso comercial, requisitos de atribucion y clausulas de uso aceptable; revisar antes de produccion.
- El dataset xLAM esta bajo CC-BY-4.0, con requisito de atribucion (Liu et al., 2024, APIGen, arXiv:2406.18518).
- Modelo de autor independiente con 491 descargas y 0 likes: no hay validacion externa ni mantenimiento garantizado.
- No se documentan evaluaciones de seguridad, sesgos ni robustez frente a prompts adversarios.

## Enlaces
- Hugging Face: https://huggingface.co/Rumiii/Llama-3.1-8B-xLAM-Agent
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Dataset: https://huggingface.co/datasets/Salesforce/xlam-function-calling-60k
- Paper APIGen (arXiv:2406.18518): https://arxiv.org/abs/2406.18518
- Licencia Llama 3.1: https://llama.meta.com/llama3_1/license/
