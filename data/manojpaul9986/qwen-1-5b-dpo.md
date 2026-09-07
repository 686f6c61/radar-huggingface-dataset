# manojpaul9986/qwen-1.5b-dpo

## Resumen

El modelo `manojpaul9986/qwen-1.5b-dpo` es un modelo de lenguaje de 1.500 millones de parámetros (1.543.714.304 exactamente) basado en la familia Qwen2, desarrollado por `manojpaul9986`. Se trata de un finetune que aplica DPO (Direct Preference Optimization) sobre un modelo previo del mismo autor, `manojpaul9986/qwen-1.5b-sft`, que a su vez es un ajuste supervisado (SFT) de un Qwen2-1.5B. El objetivo es mejorar la alineación del modelo con preferencias humanas en tareas de generación de texto conversacional en inglés.

El modelo está pensado para entornos donde se requiere un modelo pequeño y eficiente en cómputo, capaz de ejecutarse en hardware modesto. El entrenamiento se realizó con la biblioteca Unsloth y TRL de Hugging Face, lo que permitió un proceso de fine-tuning aproximadamente un 50% más rápido que un entrenamiento convencional. La arquitectura es un transformer decoder-only, heredada de Qwen2, con un tamaño de contexto que no se especifica en la ficha, aunque el modelo base Qwen2-1.5B tiene una ventana de 32.000 tokens. El modelo se publica bajo licencia Apache 2.0 y los pesos están en formato `safetensors`, lo que facilita su integración en pipelines de Hugging Face Transformers.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2) |
| Parametros totales | 1.543.714.304 (1.54B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (el modelo base Qwen2-1.5B tiene 32.000 tokens) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés (segun model card y tags) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un finetune de `Qwen2-1.5B`, un transformer decoder-only con activacion SwiGLU, atencion multi-cabeza y posiciones rotatorias (RoPE). El proceso de entrenamiento consta de dos etapas: primero se realizo un SFT sobre el modelo base para obtener `manojpaul9986/qwen-1.5b-sft`, y posteriormente se aplico DPO sobre ese modelo SFT para alinear las respuestas con preferencias humanas. La tecnica DPO evita la necesidad de un modelo de recompensa separado, optimizando directamente la politica del modelo a partir de pares de respuestas preferidas y no preferidas.

El entrenamiento se llevo a cabo con las bibliotecas Unsloth y TRL de Hugging Face. Unsloth es una libreria que optimiza el uso de memoria y acelera el fine-tuning de modelos LLM, lo que permitio entrenar el modelo aproximadamente el doble de rapido que con un flujo estandar. No se han publicado detalles sobre el dataset utilizado, el numero de tokens de entrenamiento ni la composicion de los datos. Tampoco se indica si se aplicaron tecnicas adicionales como RLHF, decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto conversacional en ingles: el modelo esta orientado a dialogos y respuestas a instrucciones, gracias al proceso de DPO.
- Hereda las capacidades generales de Qwen2-1.5B, que incluye comprension del lenguaje, generacion de texto y razonamiento basico, aunque no se han publicado evaluaciones especificas de este finetune.
- No se ha documentado soporte de tool calling, function calling, agentes, vision, audio ni modo de pensamiento explicito. No hay evidencia en la informacion disponible de estas capacidades.
- El modelo es compatible con la libreria Transformers y con el pipeline `text-generation` de Hugging Face, lo que permite su uso directo con `pipeline` o `AutoModelForCausalLM`.

## Casos de uso

- Asistentes conversacionales ligeros: al tener solo 1.54B de parametros, el modelo puede ejecutarse en GPUs de consumo o incluso en CPU para chatbots de dominio especifico en ingles, donde la latencia baja es prioritaria.
- Atencion al cliente automatizada: puede integrarse en sistemas de respuestas automaticas para gestionar consultas frecuentes en ingles, reduciendo costes de infraestructura frente a modelos de mayor tamano.
- Prototipado rapido de aplicaciones de IA: gracias a su licencia Apache 2.0 y su tamano reducido, es adecuado para experimentar en entornos de desarrollo con recursos limitados, permitiendo iterar sobre prompts y flujos de generacion.
- Fine-tuning posterior para tareas especificas: al ser un modelo ya alineado con DPO, puede servir como punto de partida para ajustes adicionales en dominios concretos, como soporte tecnico, educacion o escritura asistida.
- Aplicaciones educativas de practica de conversacion: el modelo puede generar dialogos en ingles para simulaciones de entrevistas o practica de idiomas, ofreciendo respuestas coherentes en un entorno controlado.
- Generacion de texto en tiempo real para juegos o herramientas interactivas: su tamano permite obtener respuestas rapidas en aplicaciones donde la latencia es critica, como narracion procedural o asistentes en juegos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de puntuaciones en MMLU, HumanEval, GSM8K ni otras metricas comparativas. El modelo no tiene descargas ni likes en Hugging Face, lo que sugiere que no ha sido evaluado de forma independiente por la comunidad.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en FP16 ocupan aproximadamente 3,1 GB (el tamano del repo es de 3,1 GB). Para ejecutar en FP16 se recomienda una GPU con al menos 4 GB de VRAM. Con cuantizacion a 4-bit, la VRAM necesaria se reduce a menos de 1 GB, aunque no se han publicado cuantizaciones oficiales.
- GPU recomendadas: el modelo cabe en GPUs de consumo como RTX 3060 (12 GB), RTX 4070 (12 GB) o similares. Tambien puede ejecutarse en RTX 4090, A100 o H100 para mayor velocidad.
- Si cabe en consumer GPU: si, es un modelo pequeno que puede ejecutarse en GPUs de gama media e incluso en CPUs modernas con suficiente RAM.
- Opciones de despliegue: puede servirse con vLLM, llama.cpp, Ollama, Text Generation Inference (TGI) o directamente con Transformers en Python.
- Latencia y throughput estimados: no disponible. No se han publicado mediciones de rendimiento para este finetune especifico.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Alineacion |
|---|---|---|---|---|
| manojpaul9986/qwen-1.5b-dpo | 1.54B | no disponible (base 32k) | Apache 2.0 | DPO |
| Qwen2-1.5B | 1.54B | 32.000 tokens | Apache 2.0 | Base (sin alinear) |
| Qwen2-1.5B-Instruct | 1.54B | 32.000 tokens | Apache 2.0 | SFT + RLHF |
| manojpaul9986/qwen-0.5b-dpo-adapter | 0.5B | no disponible | Apache 2.0 | DPO |

No se dispone de benchmarks comparativos entre estos modelos. La principal diferencia es el metodo de alineacion: el modelo analizado usa DPO, mientras que el Instruct oficial de Qwen2 usa SFT seguido de RLHF. En terminos de tamano, todos los modelos de 1.5B son adecuados para hardware modesto.

## Limitaciones y advertencias

- Sesgos conocidos: no se ha realizado ninguna evaluacion de sesgos en este finetune. Al derivar de Qwen2, puede heredar sesgos del modelo base, pero no hay datos disponibles.
- Riesgo de alucinacion: al ser un modelo de 1.5B, la probabilidad de generar contenido factualmente incorrecto es mayor que en modelos grandes. No se han publicado metricas de fiabilidad.
- Limitaciones de contexto e idioma: el modelo solo esta documentado para ingles. La longitud de contexto no se especifica en la ficha, por lo que no se puede garantizar un rendimiento optimo en conversaciones largas.
- Restricciones de licencia: la licencia Apache 2.0 permite uso comercial, modificacion y redistribucion, siempre que se mantenga el aviso de licencia y se indiquen los cambios realizados.
- Caveat para produccion: el modelo no tiene descargas ni evaluaciones publicadas, y el autor no ha proporcionado documentacion tecnica detallada. Su calidad y comportamiento son desconocidos hasta que se realicen pruebas independientes. Se recomienda validarlo exhaustivamente antes de usarlo en entornos de produccion.

## Enlaces

- Pagina del modelo en Hugging Face: https://huggingface.co/manojpaul9986/qwen-1.5b-dpo
- Modelo base SFT del mismo autor: https://huggingface.co/manojpaul9986/qwen-1.5b-sft
- Modelo Qwen2-1.5B oficial: https://huggingface.co/Qwen/Qwen2-1.5B
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
- Repositorio oficial de Qwen: https://github.com/QwenLM/Qwen
- Modelo relacionado del mismo autor (adapter 0.5B): https://huggingface.co/manojpaul9986/qwen-0.5b-dpo-adapter
