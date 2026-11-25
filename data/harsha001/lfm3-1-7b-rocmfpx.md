# Harsha001/LFM3-1.7B-ROCmFPX

## Resumen

LFM3-1.7B-ROCmFPX es una cuantización comunitaria del modelo LiquidAI/LFM3-1.7B, un transformer de 1.728.801.742 parámetros desarrollado por Liquid AI para agentes locales, tool calling y salida estructurada. La versión aquí descrita la publica el usuario Harsha001 (repositorio GitHub de referencia: HarshaVardhan3002/ROCmFPX) y está empaquetada en formato GGUF con tipos de peso de bajo bit específicos para el fork ROCmFPX de llama.cpp, orientado a GPUs AMD, Vulkan y HIP/ROCm.

El modelo base emplea una arquitectura tri-híbrida que combina convoluciones cortas con compuerta (gated short convolutions) y atención de ventana deslizante junto con atención global, con una ventana de contexto de hasta 256K tokens. Esa combinación busca reducir el coste computacional de la atención en secuencias largas manteniendo capacidad de recuperación de información lejana, algo relevante para flujos de agentes con historiales extensos.

La relevancia de esta ficha es doble: por un lado documenta el modelo base y sus capacidades; por otro, describe un esfuerzo de cuantización de bajo bit para hardware AMD consumer (Strix Halo, RX 7900), un nicho con menos tooling que el ecosistema NVIDIA. Conviene subrayar que los ficheros no son una release oficial de Liquid AI y que, según la model card, fueron verificados en CPU pero no probados aún en hardware AMD.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer tri-híbrido: convoluciones cortas con compuerta + atención de ventana deslizante + atención global |
| Parámetros totales | 1.728.801.742 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | hasta 256K tokens (el ejemplo de ejecución usa 32.768) |
| Tipos de cuantización | ROCmFPX 8-bit (Q8_0_ROCMFPX con escalas por tensor), ROCmFPX 6-bit (Q6_0_ROCMFPX con escalas por tensor), ROCmFP4-FAST 4-bit para Strix Halo; referencia stock Q8_0, Q6_K y Q4_K_M |
| Idiomas soportados | no disponible |
| Licencia | LFM Open License v1.0 (license_name: lfm1.0) |
| Formato de pesos | GGUF |

Detalle de ficheros publicados:

| Fichero | Tamaño | Pesos | Divergencia KL vs BF16 (menor es mejor) | Mismo token top que BF16 |
|---|---:|---|---:|---:|
| LFM3-1.7B-Q8_0_ROCMFPX.gguf | 1,80 GB | ROCmFPX 8-bit con escalas por tensor | 0,0044* | 96,8%* |
| LFM3-1.7B-Q6_K_ROCMFPX.gguf (recomendado) | 1,43 GB | ROCmFPX 6-bit con escalas por tensor | 0,0132 | 94,3% |
| LFM3-1.7B-Q4_0_ROCMFP4_STRIX_O8.gguf | 1,06 GB | ROCmFP4-FAST 4-bit, atención y capa de salida en 8-bit | 0,159* | 80,5%* |
| stock Q8_0 (referencia, no subido) | 1,85 GB | llama.cpp Q8_0 | 0,0031 | 97,2% |
| stock Q6_K (referencia, no subido) | 1,43 GB | llama.cpp Q6_K | 0,0160 | 93,8% |
| stock Q4_K_M (referencia, no subido) | 1,10 GB | llama.cpp Q4_K_M | 0,0922 | 85,5% |

Las métricas se midieron sobre 40 fragmentos de 512 tokens de WikiText-2 (split de test) contra el GGUF BF16, en CPU. El asterisco indica que los ficheros de 8 y 4 bits se añadieron el 20 de noviembre de 2026 y sus cifras provienen de una ejecución de octubre con recetas casi idénticas.

## Arquitectura y entrenamiento

El modelo base es un transformer tri-híbrido. Combina capas de convolución corta con compuerta, que procesan dependencias locales con coste lineal, con capas de atención de ventana deslizante y capas de atención global. Este diseño persigue un equilibrio entre eficiencia en secuencias largas y capacidad de atención a distancia, y es la base sobre la que Liquid AI construye su familia LFM3 orientada a agentes y salida estructurada. El contexto declarado llega a 256K tokens.

Sobre el proceso de entrenamiento del modelo base no se proporciona información en la documentación disponible: no hay datos sobre número de tokens, composición del dataset ni uso de RLHF o DPO. Respecto a esta cuantización, el procedimiento documentado es el siguiente: conversión a GGUF BF16 con el script convert_hf_to_gguf.py del fork; generación de una importance matrix a partir del fichero BF16 sobre el texto de calibración calibration_datav3 en fragmentos de 512 tokens; y cuantización con llama-quantize --imatrix para cada fichero, incluidos los stock. El fichero de 6 bits se generó con LLAMA_ROCMFPX_TENSOR_SCALE=1, que almacena una escala potencia de dos por tensor de pesos (el runtime la aplica sin configuración adicional), y con --token-embedding-type q6_K. La innovación destacable es el propio formato ROCmFPX: tipos de peso de bajo bit con kernels FP4 rápidos y escalas por tensor, pensados para GPUs AMD, Vulkan y HIP/ROCm. El soporte de LFM3 en el fork proviene del pull request #31252 de llama.cpp.

## Capacidades

- Generación de texto conversacional (pipeline text-generation, tag conversational).
- Tool calling y function calling, uno de los objetivos declarados del modelo base.
- Salida estructurada, adecuada para extracción de datos y respuestas en formatos fijos.
- Flujos de agente y razonamiento multi-paso, con contexto de hasta 256K tokens.
- Razonamiento matemático, con parámetros de muestreo recomendados específicos (temperatura 1.0, top-p 0.95, top-k 20).
- Ejecución local en hardware de borde (edge), motivo por el que existe esta cuantización.
- Capacidades multilingües: no disponible.
- Modo thinking, visión o audio: no disponible en esta variante (la model card indica que LFM3-Omni y LFM3-Audio requieren trabajo adicional en llama.cpp upstream y llegarán más tarde).

## Casos de uso

- Agentes locales en estaciones de trabajo AMD: el modelo puede orquestar tool calling y cadenas de varios pasos dentro de una ventana de 256K tokens, ejecutándose con el fork ROCmFPX sobre Vulkan o HIP en GPUs como RX 7900 o Strix Halo, sin depender de servicios en la nube.
- Asistente de código en el editor: con salida estructurada y function calling, encaja en plugins que necesitan generar parches, invocar herramientas del IDE o producir JSON validable, con el fichero de 6 bits (1,43 GB) como opción equilibrada.
- Extracción de datos de documentos largos: la combinación de contexto de 256K y capas híbridas permite procesar contratos o informes extensos y devolver campos estructurados, usando temperatura 0,1 para maximizar determinismo.
- Automatización de atención al cliente en local: conversaciones multi-turno con historial largo, desplegadas con llama-server y --jinja para plantillas de chat, manteniendo los datos en la infraestructura propia.
- Prototipado en portátiles y mini-PC con gráfica integrada AMD: el fichero de 4 bits para Strix Halo (1,06 GB) permite probar agentes en hardware de bajo consumo, aceptando una mayor divergencia respecto a BF16 a cambio de velocidad y tamaño.
- Evaluación comparativa de cuantizaciones: los datos de divergencia KL y coincidencia de token top publicados permiten usar este repositorio como referencia para medir el impacto de esquemas de cuantización de bajo bit frente a Q8_0, Q6_K y Q4_K_M stock.
- Razonamiento matemático asistido por herramienta: con los parámetros de muestreo recomendados para matemáticas, el modelo puede resolver problemas paso a paso e invocar una calculadora o intérprete como herramienta externa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible (MMLU, HumanEval, GSM8K u otros). Los únicos datos cuantitativos son las métricas de fidelidad de cuantización frente a BF16 recogidas en la tabla de especificaciones técnicas (divergencia KL y porcentaje de coincidencia del token top sobre WikiText-2).

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,1 GB para el fichero de 4 bits, 1,5 GB para el de 6 bits y 1,9 GB para el de 8 bits, más el espacio de caché KV correspondiente al contexto configurado (no cuantificado en los datos disponibles).
- GPU recomendadas: AMD Strix Halo (objetivo específico del fichero de 4 bits, con kernels FP4), RX 7900 (gfx1100) y, en general, GPUs AMD con soporte HIP/ROCm o Vulkan; el fork compila con -DGGML_VULKAN=ON o con -DGGML_HIP=ON -DAMDGPU_TARGETS=gfx1151 (gfx1100 para RX 7900).
- Cabe en GPU consumer: sí, por tamaño de pesos; en GPUs AMD consumer es donde está pensado, aunque la model card advierte que los ficheros no se han probado aún en hardware AMD, solo en CPU.
- Opciones de despliegue: llama-server del fork ROCmFPX (comando de ejemplo con -ngl 99 --jinja -c 32768). llama.cpp stock, LM Studio, Ollama y otras builds de ROCmFPX pueden no cargar estos ficheros.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato y cuantizaciones | Licencia | Notas |
|---|---|---|---|---|---|
| LFM3-1.7B-ROCmFPX (esta ficha) | 1.728.801.742 | hasta 256K | GGUF; ROCmFPX 8/6/4 bits y referencia stock | LFM Open License v1.0 | Requiere fork ROCmFPX; verificado en CPU, no en AMD |
| LiquidAI/LFM3-1.7B (base) | 1.728.801.742 | hasta 256K | safetensors (formato del repo base, según información disponible) | LFM Open License v1.0 | Modelo original; misma arquitectura tri-híbrida |
| Cuantizaciones stock de llama.cpp (Q8_0, Q6_K, Q4_K_M) | 1.728.801.742 | hasta 256K | GGUF | LFM Open License v1.0 | Compatibles con llama.cpp estándar; el 6 bits ROCmFPX supera a Q6_K stock en divergencia KL al mismo tamaño (0,0132 frente a 0,0160) |

No se dispone de datos de benchmarks que permitan comparar rendimiento en tareas con modelos de otros autores.

## Limitaciones y advertencias

- No es una release oficial de Liquid AI; el crédito del modelo corresponde a sus autores y la cuantización es un trabajo comunitario.
- Los ficheros ROCmFPX (8 bits, 6 bits y 4 bits Strix) requieren el fork HarshaVardhan3002/ROCmFPX; llama.cpp stock, LM Studio, Ollama y otras builds pueden no cargarlos.
- Según la model card, los ficheros se comprobaron en CPU y no se han probado en hardware AMD; el rendimiento real en GPU está sin verificar.
- El fichero de 4 bits para Strix Halo diverge más de BF16 que el Q4_K_M stock en este modelo (KL 0,159 frente a 0,0922; coincidencia de token top 80,5% frente a 85,5%); para calidad debe preferirse el 6 u 8 bits.
- Las cifras de los ficheros de 8 y 4 bits provienen de una ejecución previa con recetas casi idénticas y están pendientes de sustituirse por mediciones propias.
- Licencia LFM Open License v1.0: el uso comercial solo está cubierto para empresas con ingresos anuales inferiores a 10 millones de dólares; por encima de ese umbral no queda cubierto. Es imprescindible leer el fichero LICENSE.
- Riesgo de alucinación y sesgos: no hay información específica publicada para esta cuantización; debe evaluarse en el caso de uso concreto antes de producción.
- Idiomas soportados: no disponible, lo que impide garantizar calidad multilingüe.
- LFM3-Omni y LFM3-Audio no están soportados en este fork y requerirán trabajo adicional en llama.cpp upstream.
- El contexto máximo de 256K exige memoria para la caché KV proporcional a la longitud configurada; el ejemplo de ejecución limita a 32.768 tokens.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Harsha001/LFM3-1.7B-ROCmFPX
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
- Fork ROCmFPX: https://github.com/HarshaVardhan3002/ROCmFPX
- Pull request de soporte LFM3 en llama.cpp: #31252 (referenciado en la model card)
- Licencia LFM Open License v1.0: fichero LICENSE del repositorio de Hugging Face
