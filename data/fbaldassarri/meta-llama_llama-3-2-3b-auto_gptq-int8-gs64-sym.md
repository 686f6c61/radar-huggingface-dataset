# fbaldassarri/meta-llama_Llama-3.2-3B-auto_gptq-int8-gs64-sym

## Resumen

Este repositorio contiene una versión cuantizada a 8 bits (INT8) del modelo Llama 3.2 3B de Meta, generada por fbaldassarri mediante el framework Intel AutoRound v0.13.1. La cuantización emplea el algoritmo GPTQ (AutoGPTQ) con grupo de 64 y cuantización simétrica, y está orientada a la inferencia eficiente en hardware Intel: CPU, iGPU (Arc) a través de intel-extension-for-pytorch, y NPU (AI Boost en Core Ultra) mediante OpenVINO. El resultado es un modelo de completado de texto que mantiene las capacidades del modelo base con un menor coste de memoria y computación, lo que lo hace adecuado para despliegues en entornos con recursos limitados o en dispositivos edge.

Al ser una versión cuantizada del modelo original, no introduce nuevas capacidades, pero sí reduce el tamaño de los pesos y acelera la inferencia en hardware compatible. La relevancia actual radica en la creciente demanda de modelos de lenguaje ejecutables en local, sin depender de servicios en la nube, y en la optimización específica para plataformas Intel, que cubren una parte significativa del mercado de portátiles y estaciones de trabajo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Llama (transformer decoder causal) |
| Parametros totales | 1.154.616.320 (según safetensors; el modelo base Llama 3.2 3B tiene 3.210.000.000) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no especificada en la model card; el modelo base Llama 3.2 3B soporta 128.000 tokens |
| Tipos de cuantizacion | INT8, group size 64, simétrica (formato AutoGPTQ) |
| Idiomas soportados | en, de, fr, it, pt, hi, es, th |
| Licencia | Llama 3.2 Community License |
| Formato de pesos | safetensors (compatible con transformers y text-generation-inference) |

## Arquitectura y entrenamiento

El modelo es una cuantización del checkpoint original `meta-llama/Llama-3.2-3B`, que emplea una arquitectura transformer decoder con atención causal, normalización RMSNorm y activaciones SwiGLU. No se ha realizado ningún entrenamiento adicional; el proceso se limita a la cuantización de los pesos mediante Intel AutoRound, que aplica el algoritmo GPTQ (AutoGPTQ) con 8 bits, grupo de 64 y cuantización simétrica. La calibración se realizó sobre 128 muestras, con 200 iteraciones de ajuste, longitud de secuencia 512 y batch size 4, todo en CPU con precisión bfloat16. El proceso completo tardó aproximadamente 338 minutos.

La cuantización es de tipo *weights-only* (solo pesos), lo que significa que las activaciones permanecen en bfloat16. Esto reduce el tamaño del modelo en memoria y permite aceleraciones en hardware que soporta operaciones INT8, como las CPU Intel modernas, iGPU Arc y NPU de Core Ultra. No se emplean técnicas como decodificación especulativa ni atención lineal; se trata de una cuantización estándar orientada a la eficiencia.

## Capacidades

- Generación de texto por completado: al ser un modelo base, continúa secuencias de texto de forma autónoma, sin seguir instrucciones conversacionales.
- Razonamiento y conocimiento general: hereda las capacidades del modelo Llama 3.2 3B, incluyendo razonamiento básico, conocimiento factual y comprensión lectora.
- Generación de código: el modelo base tiene cierta competencia en lenguajes de programación, aunque inferior a modelos especializados.
- Soporte multilingüe: cubre 8 idiomas (inglés, alemán, francés, italiano, portugués, hindi, español y tailandés), con mejor rendimiento en inglés.
- Inferencia eficiente en hardware Intel: optimizado para CPU, iGPU Arc y NPU, lo que permite ejecución local sin GPU dedicada.
- Compatibilidad con transformers: puede cargarse con `AutoModelForCausalLM` y usarse con pipelines estándar de HuggingFace.

No incluye soporte para *tool calling*, *function calling*, agentes, visión ni audio, ya que es un modelo de texto puro y sin capa de instrucciones.

## Casos de uso

- Generación de texto en local: ideal para aplicaciones de escritorio o web que requieran completado de texto sin conexión, aprovechando la cuantización INT8 para reducir el uso de memoria y acelerar la inferencia en CPUs Intel.
- Prototipado rápido de modelos de lenguaje: al ser un checkpoint cuantizado, permite probar las capacidades de Llama 3.2 3B en entornos de desarrollo sin necesidad de una GPU de gama alta.
- Completado de código en editores: puede integrarse en herramientas de autocompletado para lenguajes como Python, JavaScript o C++, aunque su rendimiento es inferior a modelos específicos de código.
- Inferencia en dispositivos edge: gracias a la compatibilidad con NPU de Intel Core Ultra, puede ejecutarse en portátiles y mini-PCs sin GPU, habilitando asistentes de escritura o resumen de documentos en local.
- Investigación en cuantización: el repositorio documenta el proceso de cuantización con AutoRound, sirviendo como referencia para reproducir o comparar metodologías de compresión de modelos.
- Despliegue en servidores con CPU: en entornos donde no se dispone de GPUs, este modelo puede servir peticiones de generación de texto con latencia aceptable usando vLLM o TGI, gracias a su tamaño reducido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas como MMLU, HumanEval o GSM8K, ni comparaciones con el modelo original o con otras cuantizaciones. Se recomienda evaluar el modelo en el caso de uso concreto antes de su despliegue en producción.

## Requisitos de hardware

- VRAM estimada: al ser INT8, los pesos del modelo base (3.2B parámetros) ocupan aproximadamente 3,2 GB. Con overhead de activaciones y memoria intermedia, se recomienda al menos 4-6 GB de VRAM en GPU. En CPU, se necesitan unos 4-5 GB de RAM.
- GPU recomendadas: cualquier GPU con al menos 6 GB de VRAM, como RTX 3060, RTX 4060, o GPUs de datacenter como A10 o L4. También funciona en iGPU Intel Arc con soporte para intel-extension-for-pytorch.
- Compatibilidad con consumer GPU: sí, cabe en GPUs de gama media y baja, así como en sistemas sin GPU usando CPU.
- Opciones de despliegue: transformers (con `device_map="auto"`), vLLM, TGI, y para hardware Intel, intel-extension-for-pytorch y OpenVINO.
- Latencia y throughput: no se proporcionan datos oficiales. En una CPU Intel moderna, se puede esperar una generación de 10-20 tokens por segundo; en GPU, significativamente mayor, pero depende de la configuración.

## Comparativa con modelos similares

No se dispone de benchmarks comparativos publicados para esta cuantización específica. Como referencia cualitativa, se puede comparar con:

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| meta-llama/Llama-3.2-3B (original) | 3,2B | 128k | FP16/BF16 | Llama 3.2 | HuggingFace |
| fbaldassarri/meta-llama_Llama-3.2-3B-auto_gptq-int8-gs64-sym | 3,2B (base) | 128k (base) | INT8 gs64 | Llama 3.2 | HuggingFace |
| Cuantizaciones GGUF de Llama 3.2 3B (llama.cpp) | 3,2B | 128k | Q8_0, Q4_K_M, etc. | Llama 3.2 | HuggingFace |

La principal diferencia frente a las cuantizaciones GGUF es el formato: este modelo usa AutoGPTQ, pensado para transformers y TGI, mientras que GGUF está orientado a llama.cpp y Ollama. No hay datos objetivos de rendimiento que permitan afirmar cuál es superior.

## Limitaciones y advertencias

- Modelo base, no instructivo: no sigue instrucciones ni mantiene conversaciones; está diseñado para completar texto. Para uso conversacional se necesita un modelo fine-tuneado.
- Posibles sesgos y alucinaciones: al ser una cuantización del modelo original, hereda los sesgos presentes en los datos de entrenamiento de Llama 3.2, así como la tendencia a generar información falsa o inventada.
- Cuantización experimental: la model card indica que el modelo se ha desarrollado solo con fines de investigación y no ofrece garantías. El proceso de cuantización puede introducir degradaciones en tareas sensibles a la precisión.
- Restricciones de licencia: la Llama 3.2 Community License permite uso comercial, pero impone condiciones para empresas con más de 700 millones de usuarios mensuales, que deben solicitar una licencia adicional a Meta.
- Soporte de idiomas limitado: aunque declara 8 idiomas, el rendimiento en lenguas distintas del inglés puede ser notablemente inferior.
- Sin soporte de tool calling ni agentes: no es adecuado para aplicaciones que requieran interacción con APIs o ejecución de acciones.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/fbaldassarri/meta-llama_Llama-3.2-3B-auto_gptq-int8-gs64-sym
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-3B
- Licencia Llama 3.2: https://github.com/meta-llama/llama-models/blob/main/models/llama3_2/LICENSE
- Intel AutoRound: https://github.com/intel/auto-round
- Pipeline de cuantización (auto-round-pipeline): https://git.epicdynamic.com/auto-round-pipeline
