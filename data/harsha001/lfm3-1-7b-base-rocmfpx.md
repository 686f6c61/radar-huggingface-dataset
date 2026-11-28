# Harsha001/LFM3-1.7B-Base-ROCmFPX

## Resumen

LFM3-1.7B-Base-ROCmFPX es una cuantización comunitaria del modelo base LiquidAI/LFM3-1.7B-Base, publicada por el usuario Harsha001 (HarshaVardhan3002). No se trata de un modelo nuevo, sino de una conversión a formato GGUF empleando el fork ROCmFPX de llama.cpp, orientado a tipos de peso de baja precisión para GPUs AMD (Vulkan y HIP/ROCm), con especial atención a los equipos con APU Strix Halo. El modelo subyacente es un transformer de 1.728.801.742 parámetros (aproximadamente 1,7 mil millones) de Liquid AI, distribuido sin ajuste conversacional, es decir, como modelo base para continuación de texto y fine-tuning.

La relevancia de esta ficha radica en su enfoque de despliegue: ofrece tres cuantizaciones (8 bits, 6 bits y una de 4 bits específica para Strix Halo) que buscan superar en fidelidad a las cuantizaciones estándar de llama.cpp al mismo tamaño de archivo. Según la model card, el archivo de 6 bits iguala el tamaño del Q6_K estándar (1,43 GB) pero reduce la divergencia KL respecto a BF16 de 0,0039 a 0,0031, y el de 4 bits para Strix Halo ocupa 1,06 GB frente a los 1,10 GB del Q4_K_M estándar.

Es importante subrayar que estos archivos requieren el fork ROCmFPX y no cargan en llama.cpp estándar, LM Studio u Ollama. Además, el autor indica que las pruebas se realizaron en CPU y que los archivos no se han validado todavía en hardware AMD real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base LiquidAI LFM3; detalles de arquitectura interna no disponibles en la informacion proporcionada) |
| Parametros totales | 1.728.801.742 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | ROCmFPX 8-bit (Q8_0_ROCMFPX con escalas por tensor), ROCmFPX 6-bit (Q6_0_ROCMFPX con escalas por tensor), ROCmFP4-FAST 4-bit para Strix Halo (attention y capa de salida en 8-bit) |
| Idiomas soportados | No disponible |
| Licencia | LFM Open License v1.0 (license: other; uso comercial permitido para empresas con ingresos anuales inferiores a 10 millones de USD) |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo subyacente es LiquidAI/LFM3-1.7B-Base, un modelo base preentrenado de Liquid AI sin ajuste de chat. La informacion proporcionada no detalla la arquitectura interna (tipo de atención, composición del dataset, número de tokens de entrenamiento ni si hubo fases de RLHF o DPO); únicamente se confirma que se trata de un transformer de 1,7 mil millones de parámetros orientado a continuación de texto y fine-tuning.

La innovación técnica de esta publicación no reside en el entrenamiento, sino en el proceso de cuantización. Se partió de una conversión BF16 a GGUF con el script `convert_hf_to_gguf.py` del fork, se generó una importance matrix sobre el texto de calibración `calibration_datav3` en fragmentos de 512 tokens y se aplicó `llama-quantize --imatrix` para cada archivo. El archivo de 6 bits se generó con `LLAMA_ROCMFPX_TENSOR_SCALE=1`, que almacena una escala potencia de dos por tensor de pesos y se aplica en tiempo de ejecución sin configuración adicional, además de `--token-embedding-type q6_K`. El soporte de LFM3 en el fork proviene del pull request #31252 de llama.cpp.

## Capacidades

- Generación de texto y continuación de texto sin formato conversacional (modelo base).
- Punto de partida para fine-tuning supervisado y ajuste de instrucciones.
- Ejecución en GPUs AMD mediante Vulkan o HIP/ROCm con el fork ROCmFPX.
- Cuantización de baja precisión con escalas por tensor para preservar la fidelidad respecto a BF16.
- Variante de 4 bits optimizada para kernels FP4 rápidos en AMD Strix Halo.
- Compatibilidad con endpoints (etiqueta `endpoints_compatible` en Hugging Face).
- No incluye soporte de tool calling, agentes, visión ni audio en la informacion disponible.

## Casos de uso

- Fine-tuning de dominio específico: al ser un modelo base de 1,7B parámetros, sirve como punto de partida para ajuste supervisado en tareas verticales (clasificación de textos, extracción de entidades) con requisitos de cómputo modestos.
- Continuación de texto en local sobre APU AMD: la variante de 4 bits (1,06 GB) está pensada para ejecutarse en un equipo Strix Halo con kernels FP4 del fork, permitiendo generación de texto en hardware integrado.
- Prototipado de pipelines de generación en CPU: los archivos se validaron en CPU, por lo que permiten experimentar con el formato ROCmFPX antes de disponer de hardware AMD compatible.
- Evaluación de cuantizaciones de baja precisión: los datos de divergencia KL y coincidencia de token superior frente a BF16 facilitan estudios comparativos entre esquemas de cuantización.
- Despliegue en entornos con memoria limitada: el archivo de 6 bits (1,43 GB) ofrece un equilibrio entre tamaño y fidelidad para servicios de generación de texto con recursos restringidos.
- Base para modelos conversacionales: combinado con un ajuste de instrucciones posterior, puede convertirse en un asistente de chat ligero, si bien para chat directo el autor recomienda LFM3-1.7B (la versión ya ajustada).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la informacion disponible. La model card únicamente aporta métricas de fidelidad de cuantización medidas sobre 40 fragmentos de 512 tokens de WikiText-2 (test split) frente al GGUF BF16, en CPU:

| Archivo | Tamano | Divergencia KL vs BF16 (menor es mejor) | Mismo token superior que BF16 |
|---|---:|---:|---:|
| Q8_0_ROCMFPX | 1,80 GB | 0,0007* | 98,7%* |
| Q6_K_ROCMFPX (recomendado) | 1,43 GB | 0,0031 | 96,9% |
| Q4_0_ROCMFP4_STRIX_O8 | 1,06 GB | 0,040* | 89,7%* |
| Q8_0 estandar (referencia) | 1,85 GB | 0,0006 | 98,7% |
| Q4_K_M estandar (referencia) | 1,10 GB | 0,0267 | 92,0% |
| Q6_K estandar (referencia) | 1,43 GB | 0,0039 | 96,6% |

*Los valores de los archivos de 8 y 4 bits proceden de la ejecución de octubre con recetas casi idénticas; el autor indica que se sustituirán por las mediciones propias de los archivos nuevos.

## Requisitos de hardware

- VRAM estimada: aproximadamente 1,1 GB para la variante de 4 bits, 1,5 GB para la de 6 bits y 1,9 GB para la de 8 bits, sin contar el contexto ni el overhead del runtime.
- GPU recomendadas: AMD Strix Halo (gfx1151) para la variante FP4; RX 7900 (gfx1100) u otras GPUs AMD con soporte Vulkan o HIP/ROCm para el resto.
- Cabe en GPUs de consumo con al menos 2-3 GB de VRAM libre, así como en ejecución por CPU.
- Opciones de despliegue: exclusivamente el fork ROCmFPX de llama.cpp (compilado con `-DGGML_VULKAN=ON` o `-DGGML_HIP=ON -DAMDGPU_TARGETS=gfx1151`/`gfx1100`); llama.cpp estándar, LM Studio y Ollama pueden no cargar estos archivos.
- Latencia y throughput: no disponibles. El autor señala que los archivos se comprobaron en CPU y no se han probado aún en hardware AMD.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| LFM3-1.7B-Base-ROCmFPX | 1,73B | No disponible | GGUF ROCmFPX (8/6/4 bits) | LFM Open License v1.0 | Requiere fork ROCmFPX; orientado a AMD |
| LiquidAI/LFM3-1.7B-Base | 1,73B | No disponible | Safetensors / GGUF BF16 | LFM Open License v1.0 | Modelo original de Liquid AI; sin cuantizaciones ROCmFPX |
| Cuantizaciones estándar llama.cpp del mismo modelo (Q8_0, Q6_K, Q4_K_M) | 1,73B | No disponible | GGUF estándar | LFM Open License v1.0 | Compatibles con llama.cpp, Ollama y LM Studio; fidelidad ligeramente inferior según la model card |

No se dispone de información sobre otros modelos comparables de la misma categoría en la documentación proporcionada.

## Limitaciones y advertencias

- Modelo base sin ajuste conversacional: no está diseñado para chat ni para seguir instrucciones; para conversación debe usarse LFM3-1.7B o aplicar fine-tuning.
- Compatibilidad restringida: los archivos ROCmFPX no cargan en llama.cpp estándar, LM Studio, Ollama ni otras builds que no sean el fork HarshaVardhan3002/ROCmFPX.
- Validación incompleta: los archivos se comprobaron en CPU y no se han probado en hardware AMD; el rendimiento real en GPU está por confirmar.
- La variante de 4 bits para Strix Halo presenta mayor deriva respecto a BF16 (KL 0,040) que el Q4_K_M estándar (0,0267) en este modelo; se recomienda 6 u 8 bits cuando prime la calidad.
- Los valores de los archivos de 8 y 4 bits son provisionales y proceden de una ejecución anterior con recetas casi idénticas.
- Licencia LFM Open License v1.0: el uso comercial solo está cubierto para empresas con ingresos anuales inferiores a 10 millones de USD; por encima de ese umbral no está permitido.
- No es una publicación oficial de Liquid AI; la autoría del modelo corresponde a sus creadores originales.
- No hay información sobre sesgos, riesgo de alucinación, cobertura idiomática ni longitud de contexto en la documentación proporcionada.
- LFM3-Omni y LFM3-Audio requerirán trabajo adicional en llama.cpp upstream y no están cubiertos por este fork.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Harsha001/LFM3-1.7B-Base-ROCmFPX
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B-Base
- Repositorio del fork ROCmFPX: https://github.com/HarshaVardhan3002/ROCmFPX
- Pull request de soporte LFM3 en llama.cpp: https://github.com/ggml-org/llama.cpp/pull/31252
- Cuantización destacada del autor (DeepSeek-V4.1-Flash en Strix Halo): https://huggingface.co/Harsha001/DeepSeek-V4.1-Flash-1017-Uncensored-GSQ-RCO-StrixHalo-GGUF
- Licencia LFM Open License v1.0: incluida en el repositorio del modelo (archivo `LICENSE`)
