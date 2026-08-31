# NostraEmpire/mirror-deepseek-r1-distill-qwen-14b

## Resumen

El modelo `NostraEmpire/mirror-deepseek-r1-distill-qwen-14b` es un espejo (mirror) en HuggingFace del checkpoint oficial `deepseek-ai/DeepSeek-R1-Distill-Qwen-14B`, publicado por el usuario NostraEmpire. Se trata de un modelo de lenguaje denso de 14.770 millones de parámetros, derivado de la arquitectura Qwen2.5 y destilado a partir del modelo de razonamiento DeepSeek-R1. El objetivo de esta destilación es transferir las capacidades de razonamiento y chain-of-thought del modelo grande a un checkpoint más pequeño y eficiente, manteniendo un rendimiento competitivo en tareas de matemáticas, código y razonamiento lógico.

El modelo está pensado para generación de texto y conversación, con licencia MIT, lo que facilita su uso comercial y su integración en aplicaciones de producción. Al ser un mirror, no introduce cambios técnicos respecto al original, pero ofrece una copia alternativa del repositorio, útil para redundancia o para evitar limitaciones de acceso. Su tamaño (14,7B parámetros) lo sitúa en un punto intermedio entre modelos pequeños (7B) y grandes (32B), permitiendo un equilibrio entre calidad de razonamiento y requisitos de hardware moderados.

La relevancia actual de este modelo radica en que DeepSeek-R1 demostró que el razonamiento puede incentivarse mediante aprendizaje por refuerzo a gran escala, y su destilación en modelos densos permite desplegar capacidades de razonamiento avanzado en entornos con recursos limitados. Este mirror facilita el acceso a dicha tecnología bajo una licencia permisiva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2 (basada en Qwen2.5) |
| Parametros totales | 14.770.033.664 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible en la informacion del mirror; el modelo original DeepSeek-R1-Distill-Qwen-14B soporta 128.000 tokens |
| Tipos de cuantizacion | No especificado en el repositorio; al ser safetensors, puede cuantizarse con herramientas externas (GPTQ, AWQ, GGUF) |
| Idiomas soportados | No especificados; el modelo base Qwen2.5 soporta principalmente chino e ingles |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es una destilacion del DeepSeek-R1, un modelo de razonamiento entrenado mediante aprendizaje por refuerzo a gran escala sobre un modelo base. Para el checkpoint de 14B, DeepSeek tomo el modelo Qwen2.5-14B y lo afinó con datos de razonamiento generados por DeepSeek-R1, utilizando un proceso de destilación supervisada (SFT) en lugar de aplicar RL directamente sobre el modelo pequeño. Este enfoque demostró que los patrones de razonamiento de modelos grandes pueden transferirse eficazmente a modelos más pequeños, superando incluso el rendimiento de modelos pequeños entrenados con RL desde cero.

La arquitectura es un transformer denso estándar, sin mezcla de expertos (MoE), con 14.770 millones de parámetros. No se han publicado detalles específicos sobre el número de capas, cabezas de atención o tamaño de la capa oculta en la información disponible, pero al estar basado en Qwen2.5-14B, hereda su configuración típica: aproximadamente 40 capas, 40 cabezas de atención y una dimensión oculta de 5120. El entrenamiento de destilación se realizó sobre un conjunto de datos de razonamiento que incluye problemas de matemáticas, código y lógica, con el objetivo de que el modelo aprenda a generar cadenas de pensamiento largas y auto-verificadas.

## Capacidades

- Generacion de texto y conversacion multi-turno, con soporte para instrucciones complejas.
- Razonamiento matematico avanzado: capaz de resolver problemas de algebra, calculo y logica con explicaciones paso a paso.
- Generacion de codigo en multiples lenguajes (Python, C++, Java, etc.) con razonamiento previo.
- Razonamiento logico y cientifico: puede abordar preguntas de fisica, quimica y otras disciplinas que requieren deduccion.
- Auto-verificacion y reflexion: el modelo tiende a revisar sus propias respuestas y corregir errores durante la generacion.
- Soporte de tool calling: aunque no se menciona explicitamente en la informacion, el modelo base Qwen2.5 admite function calling, y la destilacion no elimina esta capacidad (no confirmado).
- Capacidades multilingues limitadas: principalmene chino e ingles, aunque puede generar texto en otros idiomas con menor calidad.

## Casos de uso

- Asistente de resolucion de problemas matematicos en plataformas educativas: el modelo puede guiar a estudiantes paso a paso, explicando el razonamiento detras de cada operacion, gracias a su entrenamiento en cadenas de pensamiento.
- Generacion de codigo con explicaciones: en entornos de desarrollo, puede generar funciones complejas y ademas explicar la logica subyacente, util para documentacion o aprendizaje.
- Chatbot de soporte tecnico con razonamiento diagnostico: al poder encadenar pasos logicos, es adecuado para diagnosticar problemas tecnicos y proponer soluciones fundamentadas.
- Analisis de datos y razonamiento estadistico: puede interpretar conjuntos de datos y extraer conclusiones logicas, util en entornos de business intelligence.
- Creacion de contenido cientifico o divulgativo: puede redactar explicaciones claras de conceptos complejos, estructurando la informacion de forma coherente.
- Automatizacion de tareas de investigacion: combinado con tool calling, puede consultar bases de datos, ejecutar scripts y razonar sobre los resultados, aunque esta capacidad no esta confirmada en este mirror.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo original DeepSeek-R1-Distill-Qwen-14B reporta en su documentacion oficial puntuaciones en MMLU, HumanEval, GSM8K y otros, pero estos datos no aparecen en la informacion proporcionada para este mirror. Se recomienda consultar la ficha del modelo original en HuggingFace para obtener cifras concretas.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 29,5 GB (el tamaño del repo es 29,5 GB, lo que coincide con pesos en FP16). Para cuantizacion de 8 bits, se reduce a unos 15 GB; en 4 bits, a unos 8 GB.
- GPU recomendadas: para FP16, una GPU con 32 GB o mas (por ejemplo, A100, V100 de 32 GB, RTX 4090 con 24 GB podria no ser suficiente). Con cuantizacion 8 bits, una RTX 4090 (24 GB) es viable. Con 4 bits, una RTX 3090 (24 GB) o RTX 4070 (12 GB) podrian ser suficientes.
- Se puede ejecutar en consumer GPU de gama alta con cuantizacion.
- Opciones de despliegue: vLLM, text-generation-inference (TGI), llama.cpp (convertido a GGUF), Ollama (si se convierte), Transformers con `load_in_8bit` o `load_in_4bit`.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada. Dependera del hardware y de la cuantizacion.

## Comparativa con modelos similares

No se dispone de datos comparativos detallados en la informacion proporcionada. Como referencia, el modelo original DeepSeek-R1-Distill-Qwen-14B se compara con otros destilados de DeepSeek-R1 (7B, 32B) y con modelos como OpenAI o1-mini, pero no se incluyen cifras. En terminos de arquitectura y tamano, se puede comparar con:

- Qwen2.5-14B (base sin destilar): mismo tamano y arquitectura, pero sin entrenamiento especifico de razonamiento.
- DeepSeek-R1-Distill-Qwen-7B: mas pequeño, menor rendimiento en razonamiento, menor VRAM.
- DeepSeek-R1-Distill-Qwen-32B: mas grande, mejor rendimiento, requiere mas recursos.

Para una comparativa cuantitativa, se recomienda consultar la documentacion oficial del modelo original.

## Limitaciones y advertencias

- Al ser un mirror de un modelo destilado, puede presentar sesgos heredados de Qwen2.5 y de los datos de entrenamiento de DeepSeek-R1.
- Riesgo de alucinacion en temas factuales fuera de su dominio de razonamiento.
- Limitaciones en idiomas distintos del chino e ingles; la calidad puede degradarse en otros idiomas.
- La licencia MIT permite uso comercial sin restricciones, pero no se proporciona garantia sobre el comportamiento del modelo.
- No se ha verificado que este mirror mantenga exactamente los mismos pesos que el original; se recomienda comparar hashes si se utiliza en produccion.
- El modelo puede generar cadenas de pensamiento largas, lo que aumenta la latencia y el coste de inferencia en comparacion con modelos no razonadores.

## Enlaces

- Repositorio del mirror: https://huggingface.co/NostraEmpire/mirror-deepseek-r1-distill-qwen-14b
- Modelo original: https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-14B
- Repositorio oficial DeepSeek-R1 en GitHub: https://github.com/deepseek-ai/DeepSeek-R1
- Paper de DeepSeek-R1 (arXiv:2501.12948): https://arxiv.org/abs/2501.12948
