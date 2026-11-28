# Harsha001/LFM3-1.7B-ROCmFPX

## Resumen

LFM3-1.7B-ROCmFPX es una cuantizacion del modelo de texto LiquidAI/LFM3-1.7B de Liquid AI, publicada por el usuario Harsha001 para el fork de llama.cpp denominado ROCmFPX, orientado a GPUs AMD (ROCm/HIP y Vulkan) y en especial al hardware Strix Halo. El modelo base es un transformer de 1.728.801.742 parametros (1,7B) con una arquitectura tri-hibrida que combina convoluciones cortas con compuerta, atencion de ventana deslizante y atencion global, y una ventana de contexto de hasta 256K tokens. Esta pensado para agentes locales, tool calling y salida estructurada en entornos de borde.

La contribucion de esta ficha no es el modelo en si, sino el conjunto de pesos GGUF cuantizados con tipos de baja precision propios del fork ROCmFPX (8 bits, 6 bits y un 4 bits especifico para Strix Halo), generados con importance matrix a partir del BF16. El autor reporta que el archivo de 6 bits supera al Q6_K estandar de llama.cpp en el mismo tamano, medido en divergencia KL sobre WikiText-2. Es relevante ahora porque permite ejecutar un modelo de 1,7B con contexto largo en hardware AMD de consumo y en equipos Strix Halo con memoria unificada, un nicho con pocas opciones de cuantizacion optimizadas.

Conviene subrayar que los archivos ROCmFPX requieren el fork citado y que el propio autor indica que fueron verificados solo en CPU y no probados aun en hardware AMD. No es un lanzamiento oficial de Liquid AI y hereda la licencia LFM Open License v1.0 del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tri-hibrido: convoluciones cortas con compuerta + atencion de ventana deslizante + atencion global |
| Parametros totales | 1.728.801.742 (1,7B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Hasta 256K tokens (el ejemplo de ejecucion usa 32.768) |
| Tipos de cuantizacion | ROCmFPX 8-bit (Q8_0_ROCMFPX), ROCmFPX 6-bit (Q6_0_ROCMFPX), ROCmFP4-FAST 4-bit para Strix Halo; referencia stock Q8_0, Q6_K y Q4_K_M |
| Idiomas soportados | No disponible |
| Licencia | LFM Open License v1.0 (uso comercial permitido a empresas con ingresos anuales inferiores a 10 millones de USD) |
| Formato de pesos | GGUF (libreria gguf) |

## Arquitectura y entrenamiento

El modelo base emplea una arquitectura tri-hibrida: capas con convoluciones cortas con compuerta combinadas con capas de atencion de ventana deslizante y de atencion global. Esta mezcla busca reducir el coste computacional y de memoria del contexto largo frente a un transformer de atencion completa, manteniendo capacidad de recuperacion a distancia. El modelo esta disenado por Liquid AI para agentes locales, tool calling y salida estructurada, con soporte declarado de hasta 256K tokens de contexto.

Sobre el proceso de cuantizacion de esta publicacion: se convirtio el modelo a BF16 GGUF con el script `convert_hf_to_gguf.py` del fork, se genero una importance matrix sobre el texto de calibracion `calibration_datav3` en fragmentos de 512 tokens y se aplico `llama-quantize --imatrix` para cada archivo. El archivo de 6 bits se genero con `LLAMA_ROCMFPX_TENSOR_SCALE=1`, que almacena una escala potencia de dos por tensor de pesos (el runtime la aplica sin configuracion adicional) y con `--token-embedding-type q6_K`. No se dispone de informacion sobre el numero de tokens de entrenamiento del modelo base ni sobre si hubo RLHF o DPO.

## Capacidades

- Generacion de texto conversacional en modo chat.
- Tool calling y function calling, segun la orientacion del modelo base a agentes locales.
- Salida estructurada (structured output).
- Razonamiento multi-paso orientado a agentes.
- Contexto largo de hasta 256K tokens.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- No incluye vision ni audio: LFM3-Omni y LFM3-Audio son modelos separados y requieren trabajo adicional en llama.cpp upstream, segun el autor.

## Casos de uso

- Agentes locales en equipos Strix Halo: el archivo de 4 bits ROCmFP4-FAST esta construido para los kernels FP4 rapidos del fork y cabe en memoria unificada, lo que permite ejecutar un agente con tool calling en una sola maquina AMD sin GPU dedicada.
- Asistentes de escritorio con contexto largo: con hasta 256K tokens de ventana, el modelo puede mantener el hilo de conversaciones extensas o procesar documentos largos en local, usando el archivo de 6 u 8 bits cuando la calidad prioriza sobre el tamano.
- Automatizacion de extraccion de datos estructurados: la orientacion del modelo base a salida estructurada lo hace adecuado para convertir texto libre en JSON validado dentro de pipelines de ingestion.
- Tool calling en flujos de CI/CD o scripting: integrable mediante `llama-server` con `--jinja` para que el servidor aplique las plantillas de chat y herramientas, con temperatura 0,1, top-k 50 y repetition penalty 1,1 recomendados por Liquid AI para agentes.
- Razonamiento matematico asistido: Liquid AI recomienda temperatura 1,0, top-p 0,95 y top-k 20 para matematicas, configuracion util en tutoria o resolucion de problemas paso a paso en local.
- Despliegue en hardware AMD de consumo: los archivos de 1,06 a 1,80 GB permiten ejecucion en GPUs con poca VRAM o en iGPU con memoria compartida usando el backend Vulkan o HIP/ROCm del fork.
- Prototipado offline y entornos sin conectividad: al ser un modelo de 1,7B en GGUF, puede distribuirse con la aplicacion y ejecutarse sin acceso a red.

## Benchmarks y rendimiento

El autor publica metricas de fidelidad de cuantizacion (divergencia KL frente a BF16 y porcentaje de mismo token top) medidas sobre 40 fragmentos de 512 tokens del split de test de WikiText-2, en CPU.

| Archivo | Tamano | Pesos | KL vs BF16 (menor es mejor) | Mismo token top que BF16 |
|---|---:|---|---:|---:|
| LFM3-1.7B-Q8_0_ROCMFPX.gguf | 1,80 GB | ROCmFPX 8-bit con escalas por tensor | 0,0044* | 96,8%* |
| LFM3-1.7B-Q6_K_ROCMFPX.gguf (recomendado) | 1,43 GB | ROCmFPX 6-bit con escalas por tensor | 0,0132 | 94,3% |
| LFM3-1.7B-Q4_0_ROCMFP4_STRIX_O8.gguf | 1,06 GB | ROCmFP4-FAST 4-bit, atencion y capa de salida en 8 bits | 0,159* | 80,5%* |
| Stock Q8_0 (referencia, no subido) | 1,85 GB | Q8_0 de llama.cpp | 0,0031 | 97,2% |
| Stock Q4_K_M (referencia, no subido) | 1,10 GB | Q4_K_M de llama.cpp | 0,0922 | 85,5% |
| Stock Q6_K (referencia, no subido) | 1,43 GB | Q6_K de llama.cpp | 0,0160 | 93,8% |

\* Los archivos de 8 y 4 bits se anadieron el 20 de noviembre de 2026 y sus cifras provienen de la ejecucion de octubre con recetas casi identicas; los archivos nuevos pasaron una prueba corta de respuesta voraz y sus propias cifras sustituiran a estas. No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,06 GB (4 bits Strix), 1,43 GB (6 bits) y 1,80 GB (8 bits) para los pesos, mas la memoria del contexto KV, que crece con la ventana configurada (el ejemplo usa 32.768 tokens).
- GPU recomendadas: AMD Strix Halo (objetivo del archivo de 4 bits y del backend HIP con `gfx1151`); RX 7900 (`gfx1100`) para el backend HIP; cualquier GPU con soporte Vulkan para el backend Vulkan del fork.
- Cabe en GPU de consumo: si, por el tamano de los pesos; el limite practico es la memoria para el contexto KV, especialmente con ventanas de 256K.
- Opciones de despliegue: exclusivamente el fork ROCmFPX (llama.cpp modificado) con `llama-server`; el autor advierte que llama.cpp estandar, LM Studio, Ollama y otras builds ROCmFPX pueden no cargar los archivos.
- Latencia y throughput: no disponibles. El autor indica que los archivos se verificaron en CPU y no se han probado en hardware AMD.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LFM3-1.7B-ROCmFPX (esta ficha) | 1,7B | 256K | GGUF ROCmFPX 8/6/4 bits | LFM Open License v1.0 | Hugging Face, requiere fork ROCmFPX |
| LiquidAI/LFM3-1.7B (base) | 1,7B | 256K | BF16 y formatos oficiales | LFM Open License v1.0 | Hugging Face, oficial |
| Stock Q6_K / Q8_0 de LFM3-1.7B | 1,7B | 256K | GGUF estandar de llama.cpp | LFM Open License v1.0 | Generables con llama.cpp estandar |
| Otros modelos de ~1,7B para agentes locales | No disponible | No disponible | No disponible | No disponible | No disponible |

La comparacion relevante es interna: frente al Q6_K estandar, el archivo ROCmFPX de 6 bits obtiene menor divergencia KL (0,0132 frente a 0,0160) con el mismo tamano de 1,43 GB, y frente al Q4_K_M estandar, el archivo de 4 bits para Strix es mas pequeno (1,06 frente a 1,10 GB) pero diverge mas (0,159 frente a 0,0922).

## Limitaciones y advertencias

- Los archivos ROCmFPX requieren el fork HarshaVardhan3002/ROCmFPX; llama.cpp estandar, LM Studio, Ollama y otras builds pueden no cargarlos.
- El autor declara que los archivos se comprobaron en CPU y no se han probado en hardware AMD; el rendimiento real en GPU ROCm o Vulkan no esta verificado.
- El archivo de 4 bits para Strix Halo se aleja mas del BF16 que el Q4_K_M estandar en este modelo (KL 0,159 frente a 0,0922); para calidad conviene el 6 u 8 bits.
- Las cifras de los archivos de 8 y 4 bits provienen de una ejecucion anterior con recetas casi identicas y estan pendientes de medicion definitiva.
- No es un lanzamiento oficial de Liquid AI; todo el merito del modelo corresponde a sus autores.
- Licencia LFM Open License v1.0: el uso comercial solo esta cubierto para empresas con ingresos anuales inferiores a 10 millones de USD; por encima no queda cubierto y debe revisarse el archivo LICENSE.
- No hay informacion sobre idiomas soportados, sesgos conocidos ni tasas de alucinacion del modelo base en la documentacion proporcionada.
- Contexto maximo de 256K tokens: ventanas muy grandes incrementan el consumo de memoria KV y pueden degradar el rendimiento en hardware de gama baja.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Harsha001/LFM3-1.7B-ROCmFPX
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
- Fork ROCmFPX: https://github.com/HarshaVardhan3002/ROCmFPX
- Pull request de soporte LFM3 en llama.cpp: #31252
- Modelo destacado del autor (DeepSeek-V4.1-Flash-1017-Uncensored-GSQ-RCO-StrixHalo-GGUF): https://huggingface.co/Harsha001/DeepSeek-V4.1-Flash-1017-Uncensored-GSQ-RCO-StrixHalo-GGUF
- Licencia LFM Open License v1.0: archivo LICENSE en el repositorio del modelo
