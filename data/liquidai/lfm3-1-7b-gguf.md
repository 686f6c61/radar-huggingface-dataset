# LiquidAI/LFM3-1.7B-GGUF

## Resumen

LFM3-1.7B-GGUF es la versión en formato GGUF del modelo LFM3-1.7B desarrollado por Liquid AI, una empresa conocida por sus modelos basados en arquitecturas de tipo "liquid neural network". Este repositorio contiene los pesos cuantizados para inferencia local en CPU y GPU mediante llama.cpp y herramientas compatibles, lo que permite ejecutar el modelo en hardware de consumo sin necesidad de GPUs de datacenter. El modelo base cuenta con 1.728.801.600 parámetros y está diseñado para generación de texto conversacional.

La relevancia de esta versión GGUF radica en su accesibilidad: con solo 1,7 mil millones de parámetros y múltiples niveles de cuantización, puede desplegarse en portátiles, estaciones de trabajo modestas y dispositivos de borde. Además, incluye una variante NVFP4 optimizada para GPUs NVIDIA Blackwell (serie RTX 50 y DGX Spark), que aprovecha los tensor cores FP4 para acelerar la inferencia. El modelo soporta 16 idiomas, entre ellos el castellano, y está etiquetado como compatible con endpoints conversacionales.

El modelo se distribuye bajo licencia LFM1.0 (licencia propia de Liquid AI, catalogada como "other" en Hugging Face) y ha acumulado más de 377.000 descargas y 311 likes desde su publicación en octubre de 2026, lo que indica una adopción notable en la comunidad de inferencia local.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (modelo base LFM3-1.7B; familia "liquid") |
| Parametros totales | 1.728.801.600 |
| Parametros activos | No aplica (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF con múltiples niveles (se menciona Q4_K_M y NVFP4; el resto no especificado) |
| Idiomas soportados | en, ar, zh, fr, de, it, ja, ko, pt, es, vi, th, id, hi, ru, pl |
| Licencia | lfm1.0 (catalogada como "other") |
| Formato de pesos | GGUF (safetensors en el modelo base; NVFP4 GGUF para la variante Blackwell) |

## Arquitectura y entrenamiento

La información disponible en esta ficha corresponde a la versión GGUF, que es una conversión del modelo base LiquidAI/LFM3-1.7B. No se detallan en la información proporcionada los pormenores de la arquitectura interna (si es transformer puro, híbrida o basada en capas líquidas), el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. La model card remite explícitamente a la tarjeta del modelo original para obtener los detalles de arquitectura y uso.

Lo que sí se documenta es el proceso de cuantización: la mayoría de los archivos del repositorio se convierten desde LFM3-1.7B, mientras que el archivo `LFM3-1.7B-NVFP4.gguf` proviene de un checkpoint separado (LiquidAI/LFM3-1.7B-NVFP4) cuantizado con NVIDIA Model Optimizer. En esa variante, los pesos de las capas feed-forward conservan la cuantización NVFP4 y el resto de pesos están en Q8_0; en GPUs Blackwell (RTX 50 y DGX Spark) las capas NVFP4 se ejecutan sobre tensor cores FP4. El repositorio ocupa 16,2 GB en total, lo que refleja la suma de múltiples variantes de cuantización.

## Capacidades

- Generación de texto conversacional multi-turno, con pipeline declarado `text-generation` y etiqueta `conversational`.
- Soporte multilingüe en 16 idiomas: inglés, árabe, chino, francés, alemán, italiano, japonés, coreano, portugués, español, vietnamita, tailandés, indonesio, hindi, ruso y polaco.
- Ajuste de parámetros de muestreo recomendado por el autor: temperatura 0.1, top_k 50 y repeat penalty 1.1 para uso general; temperatura 1.0, top_p 0.95 y top_k 20 para matemáticas y ciencia, lo que sugiere capacidades específicas en razonamiento matemático y científico.
- Compatibilidad con endpoints conversacionales (etiqueta `endpoints_compatible`).
- Ejecución local en CPU y GPU mediante llama.cpp, LM Studio, Ollama y Llama.app.
- No se documentan en la información disponible capacidades de tool calling, function calling, agentes, visión, audio ni modo "thinking".

## Casos de uso

- Asistente conversacional local en portátil: con 1,7 mil millones de parámetros y cuantización Q4_K_M, el modelo cabe en equipos de consumo y permite mantener conversaciones multi-turno sin conexión a la nube, útil para prototipos de atención al cliente o asistentes personales con requisitos de privacidad.
- Generación de texto en dispositivos de borde: su tamaño reducido y el soporte de llama.cpp lo hacen apto para integrarse en aplicaciones de escritorio (macOS, Windows, Linux) mediante LM Studio u Ollama, por ejemplo para resúmenes o redacción asistida embebida en herramientas ofimáticas.
- Razonamiento matemático y científico asistido: el autor recomienda parámetros de muestreo específicos (temperatura 1.0, top_p 0.95, top_k 20) para matemáticas y ciencia, lo que lo hace adecuado para tutoría o resolución de problemas en entornos educativos.
- Procesamiento multilingüe ligero: con soporte para 16 idiomas, puede emplearse en tareas de traducción, clasificación o generación de contenido en aplicaciones que atiendan a usuarios de distintas regiones sin desplegar varios modelos.
- Inferencia acelerada en GPUs Blackwell: la variante NVFP4 permite ejecutar el modelo sobre tensor cores FP4 en RTX 50 y DGX Spark, adecuada para aplicaciones de baja latencia en estaciones de trabajo con hardware NVIDIA reciente.
- Filtrado y preprocesado en pipelines de datos: como modelo pequeño y rápido, puede utilizarse para tareas auxiliares de anonimización, etiquetado o generación de resúmenes previos a un modelo mayor, reduciendo coste computacional.
- Desarrollo y evaluación de técnicas de cuantización: al ofrecer múltiples variantes GGUF (incluida NVFP4), sirve como banco de pruebas para comparar calidad y velocidad entre niveles de cuantización en hardware diverso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita. Como referencia orientativa, un modelo de 1,7 mil millones de parámetros en Q4_K_M ocupa del orden de 1 GB de pesos; en Q8_0, alrededor de 1,8 GB; en NVFP4, aproximadamente 1 GB o menos. Estas cifras son estimaciones basadas en el número de parámetros y no en datos publicados por el autor.
- GPUs recomendadas: no se especifican en la información disponible. La variante NVFP4 requiere GPUs NVIDIA Blackwell (RTX 50 series, DGX Spark) para aprovechar los tensor cores FP4.
- Cabe en GPU de consumo: sí, por el tamaño del modelo; sin embargo, la información proporcionada no detalla modelos concretos ni requisitos mínimos verificados.
- Opciones de despliegue: llama.cpp (versión b11960 / v0.8.0 o superior), LM Studio (motor llama.cpp 2.65.1 o superior), Ollama (v0.40.12 o superior) y Llama.app (macOS y Windows).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| LFM3-1.7B-GGUF | 1,73 B | No disponible | 16 | lfm1.0 | GGUF |
| Alternativas de ~1-2 B | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone en la información proporcionada de datos de rendimiento ni de especificaciones de modelos comparables de la misma categoría, por lo que no es posible establecer una comparativa cuantitativa fiable.

## Limitaciones y advertencias

- La información disponible no detalla sesgos conocidos del modelo; al ser un modelo entrenado con datos web multilingües, es previsible que herede sesgos de esos corpus, pero no se documentan explícitamente.
- Riesgo de alucinación inherente a los modelos generativos de este tamaño; no se han publicado evaluaciones de fidelidad en la información disponible.
- La longitud de contexto no está especificada, lo que dificulta planificar casos de uso con documentos largos.
- Aunque soporta 16 idiomas, no se documenta la calidad relativa por idioma; el rendimiento en castellano no está cuantificado.
- La licencia LFM1.0 está catalogada como "other": es necesario revisar el archivo LICENSE del repositorio antes de un uso comercial, ya que puede contener restricciones específicas.
- El rendimiento de la variante NVFP4 depende de hardware NVIDIA Blackwell; en GPUs anteriores no se aprovechan los tensor cores FP4.
- Las versiones mínimas de las herramientas (llama.cpp b11960/v0.8.0, LM Studio 2.65.1, Ollama v0.40.12) son requisitos estrictos; versiones anteriores pueden no cargar el modelo correctamente.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/LiquidAI/LFM3-1.7B-GGUF
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
- Checkpoint NVFP4: https://huggingface.co/LiquidAI/LFM3-1.7B-NVFP4
- Archivo NVFP4 GGUF: https://huggingface.co/LiquidAI/LFM3-1.7B-GGUF/blob/main/LFM3-1.7B-NVFP4.gguf
- Blog de Liquid AI sobre LFM3: https://www.liquid.ai/blog/lfm3
- Documentación de Liquid AI: https://docs.liquid.ai/lfm/getting-started/welcome
- Guía de despliegue en llama.cpp: https://docs.liquid.ai/deployment/on-device/llama-cpp
- Consola/API de Liquid AI: https://console.liquid.ai/dashboard
- Playground: https://playground.liquid.ai/
- Llama.app: https://llama.app
- LM Studio: https://lmstudio.ai
- Ollama: https://ollama.com
- llama.cpp (release v0.8.0): https://github.com/ggml-org/llama.cpp/releases/tag/v0.8.0
- llama.cpp (release b11960): https://github.com/ggml-org/llama.cpp/releases/tag/b11960
- Ollama (release v0.40.12): https://github.com/ollama/ollama/releases/tag/v0.40.12
