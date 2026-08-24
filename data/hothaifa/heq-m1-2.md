# Hothaifa/HEQ-M1.2

## Resumen

HEQ-M1.2 es un modelo de lenguaje fine-tuneado por Hothaifa a partir de `unsloth/gemma-4-31b-it-unsloth-bnb-4bit`, una versión cuantizada en 4 bits del modelo Gemma 4 de 31 mil millones de parámetros de Google. El fine-tuning se realizó con la librería Unsloth y el framework TRL de Hugging Face, lo que permitió un entrenamiento aproximadamente dos veces más rápido que un fine-tuning convencional. El modelo se distribuye bajo licencia Apache 2.0 y está orientado a tareas de generación de texto e interacción conversacional, aunque su pipeline declarado es `image-text-to-text`, lo que sugiere una posible capacidad multimodal, aunque no se detalla en la documentación disponible.

La relevancia de este modelo radica en su origen: parte de una base ya optimizada para instrucciones (Gemma 4 IT) y se presenta como un fine-tuning adicional, probablemente para adaptarlo a dominios o estilos específicos. Sin embargo, la información pública es extremadamente limitada: no se especifican los datos de entrenamiento, el número de tokens, ni los resultados de evaluación. Esto dificulta una evaluación objetiva de sus capacidades y limita su uso en entornos de producción sin una validación previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basada en Gemma 4, 31B) |
| Parametros totales | no disponible (modelo base: 31B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (modelo base: 4-bit BNB) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning del checkpoint `unsloth/gemma-4-31b-it-unsloth-bnb-4bit`, que a su vez es una version cuantizada en 4 bits (bitsandbytes) del modelo Gemma 4 IT de 31 mil millones de parametros. La arquitectura subyacente es un transformer decoder-only con atencion por capas, disenado para generacion de texto y seguimiento de instrucciones. El proceso de fine-tuning se llevo a cabo con la libreria Unsloth, que optimiza el uso de memoria y velocidad de entrenamiento, y con la libreria TRL de Hugging Face para el bucle de entrenamiento. No se proporcionan detalles sobre el dataset utilizado, el numero de pasos, la tasa de aprendizaje ni si se aplicaron tecnicas como RLHF o DPO. Tampoco se indica si el fine-tuning preserva la capacidad multimodal del modelo base (si la tuviera) o si se limita a texto.

## Capacidades

- Generacion de texto: al ser un fine-tune de Gemma 4 IT, se espera que herede la capacidad de generar texto coherente y seguir instrucciones, aunque no hay confirmacion explicita.
- Conversacion: el tag `conversational` sugiere que el modelo esta orientado a dialogos multi-turno.
- Procesamiento de imagenes y texto: el pipeline declarado es `image-text-to-text`, lo que podria indicar soporte para entradas visuales, pero no se documenta ningun detalle al respecto.
- Tool calling y funciones: no se menciona soporte especifico para function calling o agentes.
- Multilingue: solo se declara el ingles (`en`), aunque el modelo base podria soportar mas idiomas; no hay confirmacion.

## Casos de uso

- Asistente conversacional en ingles: el modelo puede emplearse para construir chatbots o asistentes virtuales que mantengan conversaciones naturales, aprovechando su base Gemma 4 IT. Sin embargo, al no haber benchmarks publicados, se recomienda validar su calidad antes de desplegarlo.
- Generacion de contenido textual: redaccion de articulos, resumenes o respuestas a preguntas en ingles, siempre que se ajuste al dominio del fine-tuning (desconocido).
- Prototipado rapido de aplicaciones LLM: gracias a su licencia Apache 2.0 y su formato safetensors, es facil de integrar en pipelines de Hug Face Transformers o vLLM para experimentacion.
- Fine-tuning adicional: al ser un checkpoint intermedio, puede servir como base para nuevos fine-tunings en tareas especificas, aunque se desconoce si el fine-tuning original introduce sesgos que afecten a la transferencia.
- Investigacion academica: para estudiar el efecto de fine-tunings sobre modelos cuantizados de gran tamano, aunque la falta de documentacion limita su reproducibilidad.
- Evaluacion de modelos: como caso de estudio para comparar el rendimiento de fine-tunings de Gemma 4 con otros modelos de tamano similar, siempre que se generen los benchmarks propios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras metricas estandar. Tampoco se comparan con otros modelos. Se recomienda ejecutar evaluaciones propias antes de considerar su uso en produccion.

## Requisitos de hardware

- VRAM estimada: no disponible. Dado que el modelo base tiene 31B de parametros, incluso en cuantizacion 4 bits se necesitan al menos 16-20 GB de VRAM para inferencia, pero no hay confirmacion del formato final del fine-tune.
- GPU recomendadas: no disponible. Para un modelo de 31B en 4 bits, una GPU con 24 GB (RTX 3090/4090) o superior seria necesaria; para 8 bits o precision completa, se requeririan GPUs de datacenter (A100, H100).
- Compatibilidad con GPU de consumo: probablemente si en cuantizacion 4 bits, pero sin datos oficiales.
- Opciones de despliegue: al ser un modelo Transformers con safetensors, puede servirse con vLLM, TGI, llama.cpp (si se convierte a GGUF) u Ollama, aunque no se ha verificado la compatibilidad.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de informacion suficiente para establecer una comparativa fiable. El modelo base (Gemma 4 31B IT) es comparable a otros LLMs de tamano similar como Llama 3.1 30B o Mistral Large, pero el fine-tuning HEQ-M1.2 no publica resultados que permitan contrastar su rendimiento. Se recomienda consultar el leaderboard de la comunidad (p. ej., benchlm.ai) para ubicar modelos similares, aunque no hay datos especificos de este modelo.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados. Al ser un fine-tune de un modelo base entrenado con datos web, es probable que herede sesgos sociales y culturales, pero no hay informacion al respecto.
- Riesgo de alucinacion: no evaluado. Como cualquier LLM, puede generar informacion falsa o inventada, especialmente en dominios no cubiertos por su entrenamiento.
- Limitaciones de contexto: se desconoce la longitud de contexto soportada; el modelo base Gemma 4 soporta hasta 128K tokens, pero el fine-tuning podria haberla reducido.
- Restricciones de licencia: Apache 2.0 permite uso comercial y modificacion, pero se debe mantener la atribucion y no usar marcas registradas de Google (Gemma) de forma inapropiada.
- Caveat de produccion: la ausencia total de documentacion tecnica (dataset, hiperparametros, evaluaciones) hace que el modelo no sea recomendable para entornos criticos sin una validacion exhaustiva previa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Hothaifa/HEQ-M1.2
- Perfil del autor en Hugging Face: https://huggingface.co/Hothaifa
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
- Perfil de GitHub del autor: https://github.com/hothaifaeqbal/
