# Angshul/Shapequant

## Resumen

Shapequant es una herramienta de cuantizacion para modelos de lenguaje causales de Hugging Face desarrollada por el autor Angshul. Su propuesta central es una cuantizacion **libre de datos y libre de entrenamiento** (data-free, training-free): no requiere texto de calibracion ni ajuste fino posterior. El metodo construye la covarianza de entrada de cada capa a partir de los propios pesos del modelo y la emplea para colocar el error de redondeo en regiones del espacio de entrada que las activaciones no alcanzan (redondeo con forma de ruido, o *noise-shaped rounding*). El resultado es un checkpoint en formato **GPTQ v1** (INT4/INT8, asimetrico, por grupos), de modo que pilas compatibles con GPTQ pueden servirlo.

El repositorio incluye una API en Python, una CLI y un cargador ligero de dependencias. Declara soporte para los `model_type` `llama`, `mistral`, `qwen2`, `opt` y `gpt2`, lo que en la practica cubre familias como Llama-2/3/3.1/3.3-70B y Qwen2.5-72B. La innovacion tecnica mas relevante es el modo de escalado a modelos de 70B: lectura en streaming tensor a tensor desde los shards de safetensors, manteniendo residente una sola capa decodificadora en cada momento.

El modelo publica resultados de perplejidad en WikiText-2 sobre GPT-2 124M, OPT-125m y SmolLM2-135M, con ganancias modestas frente a *round-to-nearest* (RTN) en INT4 estandar. El propio autor advierte de que la ejecucion extremo a extremo de 70B y la carga de los checkpoints con kernels de GPTQModel o vLLM no se han verificado. La ficha del repositorio en Hugging Face no incluye licencia, idiomas ni pipeline declarados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Herramienta de cuantizacion post-entrenamiento para transformers causales (llama, mistral, qwen2, opt, gpt2) |
| Parametros totales | No aplica (el modelo resultante hereda los del modelo origen; probado hasta configuraciones de 70B) |
| Parametros activos | No disponible |
| Longitud de contexto | No disponible (depende del modelo origen cuantizado) |
| Tipos de cuantizacion | INT4 e INT8 uniformes; mixta INT4/INT8/FP16 con presupuesto en bits/peso; grupos de 64 o 128; asimetrica |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | Safetensors en formato GPTQ v1 (`qweight` int32, `qzeros` int32, `scales` fp16, `g_idx`); shards de 4 GB por defecto + indice + `config.json` con `quantization_config` |

## Arquitectura y entrenamiento

Shapequant no es un modelo entrenado, sino un metodo de cuantizacion. Para un bloque lineal `y = xW` con error de cuantizacion `R`, el error de salida es `tr(RᵀΣR)` con `Σ = E[xxᵀ]`. Como no hay datos de calibracion, `Σ` se construye a partir del propio modelo: para entradas de LayerNorm/RMSNorm se usan los embeddings de tokens bajo una prior Zipf sobre el id de token (mas las posiciones), propagando despues las salidas de atencion anteriores; para la entrada del MLP se realiza una simulacion de Monte Carlo de la no linealidad de la propia capa, con 16384 muestras por defecto. El diseno de la matriz de forma es `H = I + lam·S`, con `lam` y `kappa` ajustables (por defecto 1.0 y 1.0).

El redondeo con realimentacion de error emplea actualizaciones perezosas por bloques de 128, y los modulos que comparten entrada (q/k/v, gate/up) se apilan y redondean en una sola pasada. Existe un modo `rtn` (round-to-nearest) sobre la misma rejilla como linea base, y un parametro `dynamic_groups` que decide si la rejilla de cada grupo se ajusta a los pesos con error realimentado (comportamiento GPTQ estandar) o a los pesos originales. El escalado a 70B se apoya en streaming de pesos tensor a tensor y en un consumo de memoria de dispositivo pico de aproximadamente una capa en fp32 mas dos matrices fp32 (in×in) para la entrada de mayor anchura; en Llama-3.1-70B esa entrada es la del MLP, de 28672 dimensiones.

## Capacidades

- Cuantizacion post-entrenamiento de modelos causales de Hugging Face sin datos de calibracion ni ajuste fino.
- Soporte de cuantizacion uniforme INT4 e INT8 con tamano de grupo configurable (64, 128, etc.).
- Cuantizacion mixta con presupuesto objetivo de bits por peso (por ejemplo 4.75 o 5.0), asignando INT8 o FP16 a modulos seleccionados mediante reglas de tipo y expresiones regulares.
- Metodo `shaped` (covarianza libre de datos) y metodo `rtn` como linea base sobre la misma rejilla.
- Escritura de checkpoints en formato GPTQ v1 compatible con AutoGPTQ/GPTQModel, con `sym=False` y `desc_act=False`.
- Cargador propio (`load_quantized`) con soporte de `device="cpu"` o `device_map="auto"`.
- Estimacion de memoria pico a partir unicamente de la configuracion del modelo (`shapequant memory`).
- Evaluacion de perplejidad en WikiText-2 por ventanas (`shapequant eval`, con `datasets` o fichero de texto propio).
- Streaming de pesos para modelos de gran tamano sin que la RAM del host crezca proporcionalmente al modelo.

## Casos de uso

- **Despliegue de Llama-3.3-70B o Qwen2.5-72B en infraestructura limitada**: la herramienta permite generar un checkpoint INT4 con grupos de 128 leyendo los shards en streaming, de modo que el proceso de cuantizacion no exige tener el modelo completo en RAM ni en VRAM. El checkpoint resultante se sirve con pilas compatibles con GPTQ.
- **Cuantizacion en entornos sin datos representativos**: en dominios con texto sensible o poco disponible (datos clinicos, codigo propietario, corpus internos), el enfoque data-free evita exponer texto de calibracion al proceso y elimina la dependencia de un dataset de referencia.
- **Prototipado rapido con modelos pequenos**: GPT-2 124M, OPT-125m y SmolLM2-135M se cuantizan, guardan, cargan y evaluan en CPU, lo que permite validar pipelines de cuantizacion antes de escalar a modelos mayores.
- **Ajuste fino del compromiso tamano/precision**: el parametro `budget` permite fijar un objetivo de bits por peso (por ejemplo 4.75) y dejar en INT8 o FP16 los modulos criticos, util cuando un INT4 uniforme degrada demasiado la perplejidad.
- **Estimacion previa de requisitos de hardware**: `shapequant memory <model>` calcula la memoria pico a partir de la configuracion, lo que sirve para decidir si un modelo de 70B cabe en la GPU disponible antes de lanzar el proceso.
- **Investigacion sobre redondeo con forma de ruido**: la implementacion expone `lam`, `kappa`, `n_samples` y `dynamic_groups`, lo que facilita reproducir y comparar variantes del metodo frente a RTN sobre la misma rejilla.
- **Generacion de artefactos para pipelines existentes**: la salida en GPTQ v1 con `quantization_config` y overrides `dynamic` permite integrar los checkpoints en flujos que ya consumen este formato, sin conversion adicional.

## Benchmarks y rendimiento

Resultados de perplejidad en WikiText-2 (32 ventanas de 1024 tokens; menor es mejor), segun la model card:

| Modelo | Denso | RTN INT4 | Shaped INT4 | RTN mixto | Shaped mixto |
|---|---|---|---|---|---|
| GPT-2 124M (g128, mixto 4.75 b/p) | 26.84 | 29.91 | **29.14** | 29.62 | **28.86** |
| OPT-125m (g128, mixto 4.75 b/p) | 29.27 | 31.98 | **31.39** | 30.71 | **30.44** |
| SmolLM2-135M (g64, mixto 5.0 b/p) | 15.46 | **19.28** | 19.29 | **17.82** | 17.83 |

La ganancia frente a RTN en INT4 estandar es modesta: -2.6% en GPT-2 124M, -1.9% en OPT-125m y +0.1% en SmolLM2-135M. El autor indica que la mejora fue mucho mayor a 3 bits en los experimentos de investigacion, pero que ese formato no se exporta por no ser un empaquetado estandar. No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- **VRAM para inferencia**: no disponible de forma explicita; depende del modelo origen y de la cuantizacion. El autor solo publica la estimacion de memoria pico del proceso de cuantizacion.
- **Memoria pico durante la cuantizacion**: aproximadamente una capa en fp32 mas dos matrices fp32 (in×in) para la entrada de mayor anchura. Para Llama-3.1-70B, la entrada mayor es la del MLP (28672), lo que requiere unos 7 GB para las dos matrices de 28672².
- **GPU recomendadas**: no disponible. La model card indica que la ejecucion extremo a extremo de 70B no se ha verificado y requiere una GPU; las pruebas reales documentadas (GPT-2, OPT-125m, SmolLM2-135M) se ejecutaron en CPU.
- **Consumer GPU**: los modelos pequenos probados (124M-135M) se cuantizan y evaluan en CPU, por lo que caben en cualquier equipo. Para modelos de 70B no hay datos verificados.
- **Opciones de despliegue**: el checkpoint sigue el formato GPTQ v1, por lo que deberia poder servirse con pilas compatibles con GPTQ (AutoGPTQ, GPTQModel, vLLM), aunque el autor advierte que la carga con kernels de GPTQModel/vLLM no se ha probado. Se incluye un cargador propio ligero de dependencias.
- **Dependencias**: torch, transformers, accelerate, safetensors y huggingface_hub; `datasets` solo para la evaluacion en WikiText-2.
- **Latencia y throughput**: no disponible.

## Comparativa con modelos similares

Comparacion con otros metodos de cuantizacion post-entrenamiento para transformers causales:

| Metodo | Datos de calibracion | Entrenamiento | Formato de salida | Soporte de modelos | Verificacion publicada |
|---|---|---|---|---|---|
| Shapequant | No requiere | No requiere | GPTQ v1 (INT4/INT8/mixto) | llama, mistral, qwen2, opt, gpt2 | GPT-2 124M, OPT-125m, SmolLM2-135M en CPU; 70B no verificado |
| GPTQ (AutoGPTQ/GPTQModel) | Requiere texto de calibracion | No requiere | GPTQ v1 | Amplio | Amplia, con kernels GPU |
| RTN (round-to-nearest) | No requiere | No requiere | Variable | Cualquiera | Linea base incluida en Shapequant |
| AWQ | Requiere datos de calibracion | No requiere | Formatos propios y compatibles | Amplio | Amplia |

No se dispone de datos en la informacion proporcionada para comparar la perplejidad de Shapequant frente a GPTQ o AWQ con calibracion, ni frente a otros modelos de la misma categoria en tareas de razonamiento o codigo.

## Limitaciones y advertencias

- **Ganancia limitada en INT4**: frente a RTN, la mejora en perplejidad es de -2.6%, -1.9% y +0.1% en los tres modelos probados; en SmolLM2-135M el resultado es practicamente identico.
- **Escalado a 70B no verificado**: no se ha ejecutado un proceso extremo a extremo de 70B; los pasos de tamano MLP para 70B tampoco se han verificado (requieren unos 7 GB para dos matrices de 28672²).
- **Carga con kernels GPU no verificada**: los checkpoints siguen el formato GPTQ v1 y el cargador incluido los lee, pero no se ha ejecutado ningun kernel en GPU (GPTQModel, vLLM).
- **Cobertura de arquitecturas limitada**: solo `llama`, `mistral`, `qwen2`, `opt` y `gpt2`; otras familias no estan soportadas.
- **Restriccion de `group_size`**: debe dividir todas las dimensiones de entrada (por ejemplo, 64 para hidden size 576), lo que puede exigir ajustes manuales.
- **Licencia no declarada**: la model card no especifica licencia, por lo que el uso comercial queda sin marco legal explicito y requiere contactar con el autor.
- **Idiomas no declarados**: la herramienta no declara idiomas; el comportamiento multilingue depende del modelo origen.
- **Riesgo de alucinacion y sesgos**: no evaluados en la informacion disponible; la cuantizacion puede amplificar degradaciones del modelo base, especialmente en modelos pequenos (el salto de perplejidad en SmolLM2-135M va de 15.46 a mas de 17.8).
- **Formato de 3 bits no exportado**: el autor menciona mejoras mayores a 3 bits en experimentos de investigacion, pero ese formato no se incluye en la herramienta.
- **Madurez del proyecto**: 0 descargas y 0 likes en Hugging Face en el momento de la consulta; creado y actualizado el 2026-11-09, sin historial de mantenimiento.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Angshul/Shapequant
- Resultados completos: `RESULTS.md` dentro del repositorio (referenciado en la model card)
- Pruebas de reproduccion: `python tests/real_models.py <model> <out> --group 128 --budget 4.75` (incluido en el repositorio)
- Paper, blog, demo o repositorio de codigo independiente: no disponible en la informacion proporcionada
