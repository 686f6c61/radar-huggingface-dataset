# liodon-ai/Qwen2.5-3B-Instruct-FP8

## Resumen

Qwen2.5-3B-Instruct-FP8 es una cuantizacion en punto flotante de 8 bits (FP8) del modelo instructivo Qwen2.5-3B-Instruct, publicada por Liodon AI. El modelo base, desarrollado por Alibaba, es un transformer decoder-only denso de 3.085 millones de parametros, preentrenado sobre hasta 18 billones de tokens y ajustado para instrucciones, con especial fortaleza en codigo, matematicas y generacion de salidas estructuradas. Esta version cuantizada reduce el tamano del repositorio de 6.2 GB a 3.4 GB, lo que permite desplegar el modelo en hardware con menos memoria y acelerar la inferencia.

La cuantizacion utiliza el esquema `FP8_DYNAMIC` de la libreria llm-compressor: los pesos se convierten a FP8 (E4M3) por canal de forma estatica, mientras que las activaciones se cuantizan dinamicamente por token en tiempo de inferencia. Al no requerir dataset de calibracion, los pesos cuantizados son numericamente una conversion directa de los originales, evitando sesgos introducidos por el proceso de calibracion. El `lm_head` se deja sin cuantizar, practica estandar para preservar la calidad de la salida.

La relevancia de este modelo radica en su equilibrio entre calidad y eficiencia: mantiene las capacidades del Qwen2.5-3B-Instruct original (contexto de 128K tokens, soporte multilingue, tool calling) mientras reduce los requisitos de VRAM y mejora el rendimiento en GPUs modernas con soporte FP8, como las series RTX 40, H100 o L4. Es una opcion practica para entornos de produccion con restricciones de memoria o para inferencia de alta concurrencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5) con RoPE, SwiGLU, RMSNorm y GQA (16 cabezas de query, 2 de key/value) |
| Parametros totales | 3.085.938.688 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 128K tokens (heredada del modelo base) |
| Tipos de cuantizacion | FP8 dinamico (E4M3) para pesos, activaciones FP8 dinamicas por token; `lm_head` sin cuantizar |
| Idiomas soportados | no disponible en la informacion del modelo cuantizado; el modelo base soporta multiples idiomas (incluido espanol, ingles, chino, frances, aleman, etc.) |
| Licencia | other (licencia especifica de Qwen, no OSI; consultar terminos en el repositorio del modelo base) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base Qwen2.5-3B-Instruct es un transformer denso decoder-only con 36 capas, atencion por grupos (GQA) con 16 cabezas de query y 2 de key/value, embedding rotatorio (RoPE), activacion SwiGLU y normalizacion RMSNorm. Fue preentrenado sobre un dataset de hasta 18 billones de tokens y posteriormente ajustado mediante instrucciones y preferencias humanas (RLHF/DPO, segun la documentacion oficial de Qwen). Soporta una ventana de contexto de hasta 128K tokens.

La version FP8 de Liodon AI no anade entrenamiento adicional: es una cuantizacion post-entrenamiento realizada con `llm-compressor` de vLLM. El esquema `FP8_DYNAMIC` convierte los pesos a FP8 E4M3 por canal de forma estatica, mientras que las activaciones se cuantizan a FP8 por token en tiempo de ejecucion. Este esquema no requiere dataset de calibracion, por lo que los pesos cuantizados son una conversion directa de los originales sin sesgo de calibracion. El `lm_head` se mantiene en precision original para evitar una degradacion desproporcionada de la calidad. La cuantizacion reduce el tamano del modelo de 6.2 GB a 3.4 GB.

## Capacidades

- Generacion de texto conversacional e instructivo: responde a instrucciones en lenguaje natural con coherencia y estilo apropiado.
- Razonamiento y matematicas: resuelve problemas aritmeticos, algebraicos y de logica con razonamiento paso a paso.
- Generacion de codigo: produce fragmentos de codigo en multiples lenguajes (Python, JavaScript, etc.) y explica su funcionamiento.
- Salidas estructuradas: genera JSON, tablas y otros formatos estructurados, util para integraciones con APIs.
- Soporte multilingue: el modelo base cubre mas de 29 idiomas, incluyendo espanol, ingles, chino, frances, aleman, italiano, portugues, etc.
- Tool calling y function calling: el modelo base soporta invocacion de herramientas, lo que permite construir agentes que interactuan con APIs externas.
- Ventana de contexto larga: hasta 128K tokens, adecuada para documentos extensos o conversaciones multi-turno con historial amplio.

## Casos de uso

- Atencion al cliente automatizada: el modelo puede gestionar conversaciones multi-turno con contexto largo (hasta 128K tokens) para mantener el historial completo de la interaccion. Su cuantizacion FP8 permite desplegarlo en GPUs de gama media (por ejemplo, RTX 4090 o L4) con baja latencia, adecuado para chatbots de soporte en tiempo real.
- Generacion de codigo en entornos de desarrollo: integrable en IDEs o pipelines de CI/CD para autocompletar, revisar o documentar codigo. Su capacidad de tool calling permite conectarlo a repositorios o APIs de compilacion.
- Extraccion y estructuracion de datos: procesa documentos largos (contratos, informes, articulos) y genera resumenes o tablas estructuradas en JSON, gracias a su ventana de contexto amplia y su habilidad para producir salidas formateadas.
- Asistentes de productividad local: al caber en 3.4 GB de VRAM, puede ejecutarse en estaciones de trabajo con una sola GPU consumer (RTX 4060 Ti 16GB o superior) para redactar correos, resumir reuniones o generar borradores.
- Agentes autonomos con tool calling: el modelo base soporta invocacion de funciones, por lo que puede orquestar flujos multi-paso (buscar en web, consultar bases de datos, llamar APIs) en entornos como vLLM o SGLang.
- Educacion y tutoria: genera explicaciones, ejemplos y ejercicios de matematicas o programacion adaptados al nivel del estudiante, con razonamiento paso a paso y en multiples idiomas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks especificos para la version cuantizada FP8 en la informacion disponible. El modelo base Qwen2.5-3B-Instruct reporta en su documentacion oficial resultados en MMLU, HumanEval, GSM8K y otros, pero no se dispone de esos numeros en los datos proporcionados. Se recomienda consultar la model card del modelo base para obtener referencias de rendimiento. La cuantizacion FP8 dinamica, al ser una conversion directa de pesos, suele mantener una degradacion minima en metricas estandar, aunque no se puede confirmar sin evaluaciones publicadas.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3.4 GB para los pesos en FP8, mas overhead de activaciones y KV cache. Con contexto de 128K, la VRAM total puede superar los 6 GB dependiendo de la longitud de las secuencias.
- GPU recomendadas: NVIDIA con compute capability >= 8.9 (Ada, Hopper, Blackwell) para ejecucion FP8 nativa: RTX 40-series, L4, L40S, H100, H200, B100, B200, GB10. En GPUs mas antiguas (Ampere o anterior), vLLM y TGI de-cuantizan automaticamente, perdiendo la ventaja de velocidad y memoria.
- Cabe en GPU consumer: si, en RTX 4060 Ti 16GB, RTX 4070, RTX 4080, RTX 4090 y similares, siempre que tengan compute capability >= 8.9.
- Opciones de despliegue: vLLM (`vllm serve liodon-ai/Qwen2.5-3B-Instruct-FP8`), Text Generation Inference (TGI) via Docker, y SGLang (`python -m sglang.launch_server --model-path liodon-ai/Qwen2.5-3B-Instruct-FP8`).
- Latencia y throughput: no disponibles en la informacion proporcionada. En general, FP8 reduce el uso de memoria y acelera la inferencia frente a FP16 en hardware compatible, pero los valores concretos dependen de la GPU y la configuracion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Tamano | Licencia | Notas |
|---|---|---|---|---|---|---|
| Qwen2.5-3B-Instruct (base) | 3.09B | 128K | FP16/BF16 | 6.2 GB | other (Qwen) | Modelo original, maxima calidad, mayor VRAM |
| Qwen2.5-3B-Instruct-FP8 (este) | 3.09B | 128K | FP8 dinamico | 3.4 GB | other (Qwen) | Cuantizacion oficial de Liodon AI, requiere GPU >= 8.9 |
| Qwen2.5-3B-Instruct GGUF (Q4_K_M) | 3.09B | 128K | 4-bit | ~2 GB | other (Qwen) | Alternativa comun via Ollama/llama.cpp, menor calidad pero compatible con CPU |

La comparativa directa con otras cuantizaciones (GGUF, AWQ, GPTQ) no esta disponible en la informacion proporcionada. La ventaja principal del FP8 frente a cuantizaciones de 4 bits es una menor perdida de precision, a costa de requerir hardware NVIDIA reciente.

## Limitaciones y advertencias

- Requiere hardware NVIDIA con compute capability >= 8.9 para aprovechar la aceleracion FP8; en GPUs mas antiguas, el modelo se de-cuantiza y pierde la ventaja de memoria y velocidad.
- La licencia es "other" (licencia de Qwen, no OSI). Antes de uso comercial, es obligatorio revisar los terminos en el repositorio del modelo base, ya que pueden incluir restricciones de uso o atribucion.
- No se han publicado benchmarks especificos de esta version cuantizada, por lo que la degradacion exacta de calidad frente al modelo base no esta cuantificada.
- El modelo base puede presentar sesgos presentes en sus datos de entrenamiento y riesgo de alucinacion en tareas factuales, especialmente con contextos largos o preguntas ambiguas.
- La ventana de contexto de 128K es teorica; en la practica, el uso de secuencias muy largas incrementa el consumo de memoria de la KV cache y puede requerir optimizaciones adicionales (por ejemplo, atencion con FlashAttention).
- No se proporcionan datos sobre latencia, throughput ni pruebas de estabilidad en produccion para esta cuantizacion.

## Enlaces

- Modelo cuantizado: https://huggingface.co/liodon-ai/Qwen2.5-3B-Instruct-FP8
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Coleccion Qwen2.5: https://huggingface.co/collections/Qwen/qwen25
- Repositorio llm-compressor: https://github.com/vllm-project/llm-compressor
- Pagina de Qwen2.5 en Ollama: https://ollama.com/library/qwen2.5:3b-instruct
- Repositorio de referencia Qwen2.5: https://github.com/mx4ai/qwen2.5
