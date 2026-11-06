# Harsha001/LFM3-1.7B-ROCmFPX

## Resumen

LFM3-1.7B-ROCmFPX es una cuantizacion GGUF del modelo LiquidAI/LFM3-1.7B, un modelo de lenguaje de 1.728 millones de parametros desarrollado por Liquid AI y orientado a agentes locales, tool calling y salida estructurada. Esta version concreta la publica el usuario Harsha001 y esta optimizada para el fork de llama.cpp denominado ROCmFPX, que anade tipos de peso de bajo bit para GPUs AMD, Vulkan y HIP/ROCm, con atencion especial al hardware Strix Halo.

El modelo base emplea una arquitectura tri-hibrida que combina convoluciones cortas con compuerta (gated short convolutions) junto con atencion de ventana deslizante y atencion global, lo que le permite alcanzar una ventana de contexto de hasta 256K tokens manteniendo un coste computacional contenido. Esta pensado para ejecutarse en entornos de borde (edge) y en equipos de consumo, no en clústeres de datacenter.

La relevancia de esta ficha radica en que el repositorio ofrece tres ficheros GGUF con distintos compromisos entre tamano y fidelidad respecto al modelo BF16, incluyendo un tipo de 6 bits propio de ROCmFPX que, segun el autor, supera al Q6_K estandar de llama.cpp con el mismo tamano de fichero. Es importante senalar que el autor indica explicitamente que los ficheros se han verificado en CPU y no se han probado aun en hardware AMD.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido: convoluciones cortas con compuerta + atencion de ventana deslizante + atencion global |
| Parametros totales | 1.728.801.600 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 256K tokens (el ejemplo de ejecucion usa 32768) |
| Tipos de cuantizacion | ROCmFPX Q6_0_ROCMFPX (recomendado), Q8_0, Q4_K_M |
| Idiomas soportados | no disponible |
| Licencia | LFM Open License v1.0 (identificador "other", licencia lfm1.0) |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo base LFM3-1.7B sigue una arquitectura tri-hibrida que combina capas de convolucion corta con compuerta, capas de atencion de ventana deslizante y capas de atencion global. Esta mezcla busca reducir el coste de la atencion clasica manteniendo capacidad de modelado de dependencias largas, lo que habilita una ventana de contexto de 256K tokens en un modelo de solo 1.7B de parametros. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO en la informacion proporcionada.

En cuanto al proceso de cuantizacion, el autor documenta un flujo de tres pasos: conversion a GGUF BF16 con el script `convert_hf_to_gguf.py` del fork, generacion de una importance matrix a partir del fichero BF16 sobre el corpus de calibracion `calibration_datav3` en fragmentos de 512 tokens, y cuantizacion con `llama-quantize --imatrix`. El fichero de 6 bits se genero con `LLAMA_ROCMFPX_TENSOR_SCALE=1`, que almacena una escala potencia de dos por tensor de pesos, y con `--token-embedding-type q6_K`. El soporte de LFM3 en el fork proviene del pull request #31252 de llama.cpp.

## Capacidades

- Generacion de texto conversacional y salida estructurada, segun la model card del modelo base.
- Soporte de tool calling y function calling, con parametros de muestreo recomendados especificos para uso de herramientas (temperatura 0.1, top-k 50, repetition penalty 1.1).
- Orientado a agentes locales y razonamiento multi-paso, segun la descripcion del modelo base.
- Capacidades matematicas, con ajustes de muestreo recomendados distintos (temperatura 1.0, top-p 0.95, top-k 20).
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Modo thinking, vision o audio: no disponible en esta variante (el autor indica que LFM3-Omni y LFM3-Audio requeriran trabajo adicional en llama.cpp upstream).

## Casos de uso

- Agentes locales en equipos de consumo: el modelo cabe en ficheros de 1.10 a 1.85 GB, lo que permite ejecutarlo en portatiles y mini-PC con GPU integrada, gestionando bucles de agente con tool calling gracias a sus 256K tokens de contexto.
- Automatizacion de escritorio y asistentes personales: con soporte de function calling y salida estructurada, puede invocar APIs locales o scripts en flujos de productividad sin depender de la nube.
- Procesamiento de documentos largos en el borde: la ventana de 256K tokens permite resumir o extraer informacion de contratos, manuales o transcripciones extensas en un solo paso, aunque en la practica el ejemplo de ejecucion limita el contexto a 32768 tokens por consumo de memoria.
- Generacion de codigo asistida en entornos con GPU AMD: el fichero ROCmFPX de 6 bits esta pensado para builds con Vulkan o HIP/ROCm, integrable en editores o pipelines locales de CI/CD mediante `llama-server` con `--jinja`.
- Despliegue en hardware Strix Halo: el repositorio apunta explicitamente a este tipo de APUs AMD, donde la memoria unificada permite cargar el modelo completo en GPU sin VRAM dedicada.
- Clasificacion y extraccion de informacion estructurada: la combinacion de contexto largo y salida estructurada lo hace adecuado para tareas de etiquetado, parsing de formularios o generacion de JSON validado en lotes.
- Prototipado e investigacion de cuantizacion: los tres ficheros con metricas de divergencia KL documentadas sirven para estudiar el impacto de la cuantizacion de bajo bit en modelos hibridos pequenos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El autor unicamente reporta metricas de fidelidad de cuantizacion frente al modelo BF16, medidas sobre 40 fragmentos de 512 tokens de WikiText-2 (split de test) en CPU:

| Fichero | Tamano | Pesos | Divergencia KL vs BF16 | Mismo token top que BF16 |
|---|---:|---|---:|---:|
| `LFM3-1.7B-Q6_K_ROCMFPX.gguf` (recomendado) | 1.43 GB | ROCmFPX 6 bits (`Q6_0_ROCMFPX` con escalas por tensor) | 0.0132 | 94.3% |
| `LFM3-1.7B-Q8_0.gguf` | 1.85 GB | Q8_0 estandar de llama.cpp | 0.0031 | 97.2% |
| `LFM3-1.7B-Q4_K_M.gguf` | 1.10 GB | Q4_K_M estandar de llama.cpp | 0.0922 | 85.5% |
| Q6_K estandar (referencia, no subido) | 1.43 GB | Q6_K estandar de llama.cpp | 0.0160 | 93.8% |

Segun el autor, el fichero ROCmFPX de 6 bits supera al Q6_K estandar con el mismo tamano de fichero. No se publico un fichero de 4 bits ROCmFPX porque sus tipos de 4 bits obtuvieron una divergencia KL entre 1.5 y 1.7 veces peor que Q4_K_M en este modelo.

## Requisitos de hardware

- VRAM estimada: aproximadamente 1.10 GB para Q4_K_M, 1.43 GB para el fichero ROCmFPX de 6 bits y 1.85 GB para Q8_0, a los que hay que sumar la memoria de la cache KV segun la longitud de contexto configurada.
- GPU recomendadas: el repositorio apunta a GPUs AMD con soporte ROCm/HIP o Vulkan, incluyendo Strix Halo (objetivo `gfx1151`) y RX 7900 (objetivo `gfx1100`). No se documentan recomendaciones para NVIDIA.
- GPU de consumo: por tamano, el modelo cabe en cualquier GPU de consumo con 4 GB o mas de VRAM, asi como en APUs con memoria unificada; el autor no ha verificado el funcionamiento en hardware AMD, solo en CPU.
- Opciones de despliegue: `llama-server` del fork ROCmFPX con `-DGGML_VULKAN=ON` o `-DGGML_HIP=ON -DAMDGPU_TARGETS=gfx1151`. Los ficheros Q8_0 y Q4_K_M usan tipos estandar y cargan en cualquier build de llama.cpp con soporte de LFM3. El autor advierte que llama.cpp estandar, LM Studio, Ollama y otras builds de ROCmFPX pueden no cargar el fichero de 6 bits.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato / disponibilidad |
|---|---|---|---|---|
| LFM3-1.7B-ROCmFPX (esta ficha) | 1.73B | 256K | LFM Open License v1.0 | GGUF, optimizado para fork ROCmFPX |
| LiquidAI/LFM3-1.7B (modelo base) | 1.73B | 256K | LFM Open License v1.0 | safetensors / GGUF oficial |
| Q6_K estandar de llama.cpp (misma base) | 1.73B | 256K | LFM Open License v1.0 | GGUF estandar, compatible con cualquier build |

No se dispone de informacion sobre otros modelos comparables de la misma categoria en la documentacion proporcionada, por lo que no se incluyen alternativas adicionales.

## Limitaciones y advertencias

- El autor indica que los ficheros se han verificado en CPU y no se han probado en hardware AMD; el rendimiento real en ROCm o Vulkan no esta validado.
- El fichero de 6 bits recomendado requiere el fork ROCmFPX; llama.cpp estandar, LM Studio, Ollama y otras builds pueden no cargarlo.
- No es una release oficial de Liquid AI; todos los creditos del modelo corresponden a sus autores.
- La licencia LFM Open License v1.0 permite uso comercial solo a empresas con ingresos anuales inferiores a 10 millones de dolares; por encima de ese umbral no queda cubierto.
- Riesgo de alucinacion inherente a un modelo de 1.7B de parametros; no se han publicado evaluaciones de fidelidad factual.
- No hay informacion sobre sesgos conocidos ni sobre el reparto de idiomas del modelo base.
- El contexto maximo de 256K puede no ser practico en hardware de consumo por el consumo de memoria de la cache KV; el ejemplo del autor limita a 32768 tokens.
- No hay datos de benchmarks de tareas que permitan comparar su calidad frente a alternativas.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Harsha001/LFM3-1.7B-ROCmFPX
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
- Fork ROCmFPX: https://github.com/HarshaVardhan3002/ROCmFPX
- Pull request de llama.cpp con soporte LFM3: #31252 (referenciado en la model card)
