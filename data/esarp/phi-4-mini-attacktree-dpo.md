# ESarp/Phi-4-Mini-AttackTree-DPO

## Resumen

El modelo ESarp/Phi-4-Mini-AttackTree-DPO es un ajuste fino (fine-tune) del modelo base `unsloth/Phi-4-mini-instruct-bnb-4bit`, desarrollado por el usuario ESarp. Se trata de un modelo de generación de texto basado en la arquitectura Phi-4-mini de Microsoft, con 3.836.021.760 parámetros (aproximadamente 3,8 mil millones), lo que lo sitúa en la categoría de modelos pequeños aptos para despliegue en hardware de consumo. El nombre sugiere una especialización en árboles de ataque (attack trees), un formalismo utilizado en análisis de seguridad y modelado de amenazas, aunque la model card no proporciona detalles sobre el dataset de entrenamiento ni sobre las tareas específicas.

El modelo fue entrenado con la técnica DPO (Direct Preference Optimization) utilizando las librerías Unsloth y TRL de HuggingFace, lo que indica un enfoque de alineación por preferencias sobre el modelo base. La licencia es Apache 2.0, lo que permite uso comercial y modificación sin restricciones significativas. Su relevancia actual radica en que ofrece una alternativa ligera y de código abierto para tareas de generación de texto, potencialmente orientada a dominios de seguridad informática, aunque la documentación pública es escasa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Phi-4-mini, decoder-only) |
| Parametros totales | 3.836.021.760 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el modelo base usa bnb-4bit, pero los pesos subidos estan en safetensors sin cuantizar) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Phi-4-mini de Microsoft, un transformer decoder-only optimizado para eficiencia computacional y razonamiento. El proceso de entrenamiento consistio en un ajuste fino del modelo base `unsloth/Phi-4-mini-instruct-bnb-4bit` mediante DPO (Direct Preference Optimization), una tecnica que alinea el modelo con preferencias humanas a partir de pares de respuestas preferidas y rechazadas. El entrenamiento se realizo con la libreria Unsloth, que acelera el fine-tuning, y con la libreria TRL de HuggingFace.

No se dispone de informacion publica sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron otras tecnicas como RLHF o SFT adicional. El nombre del modelo sugiere que el dataset podria estar relacionado con arboles de ataque en ciberseguridad, pero esto no esta confirmado en la documentacion.

## Capacidades

- Generacion de texto en ingles: el modelo puede producir respuestas coherentes y contextuales en conversaciones y tareas de instruccion, heredadas del modelo base Phi-4-mini-instruct.
- Razonamiento basico: al estar basado en Phi-4-mini, conserva capacidades de razonamiento logico y matematico de nivel moderado, aunque no se han publicado evaluaciones especificas.
- Especializacion potencial en arboles de ataque: el nombre del modelo indica un posible fine-tuning en este dominio, pero no hay evidencia publica de su rendimiento en tareas de seguridad.
- No se documentan capacidades de tool calling, function calling, agentes, vision, audio ni modo de pensamiento explicito.

## Casos de uso

Dado que la documentacion publica es limitada, los siguientes casos de uso son inferencias razonables basadas en el nombre del modelo y en las capacidades del modelo base. Deben considerarse como aplicaciones potenciales, no como funcionalidades confirmadas.

- Analisis de seguridad y modelado de amenazas: el modelo podria generar arboles de ataque a partir de descripciones de sistemas o escenarios de amenaza, ayudando a analistas a estructurar vectores de ataque. Su tamano reducido permite ejecutarlo en entornos locales sin infraestructura costosa.
- Generacion de documentacion tecnica: puede redactar informes, resumenes o explicaciones sobre conceptos de ciberseguridad, aprovechando su capacidad de generacion de texto en ingles.
- Asistente de chat especializado: podria integrarse en aplicaciones de soporte o formacion en seguridad, respondiendo preguntas sobre arboles de ataque y metodologias de analisis.
- Prototipado rapido de herramientas NLP: al ser un modelo pequeno con licencia Apache 2.0, es adecuado para experimentar en pipelines de procesamiento de lenguaje natural sin grandes requisitos de computo.
- Educacion y formacion: puede utilizarse en entornos academicos para ensenar conceptos de modelado de amenazas, generando ejemplos de arboles de ataque para practicas.
- Investigacion en alineacion de modelos: al ser un fine-tune con DPO, puede servir como caso de estudio para comparar tecnicas de alineacion en modelos pequenos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de puntuaciones en MMLU, HumanEval, GSM8K ni otras evaluaciones estandar. Tampoco hay comparaciones con modelos similares en la model card.

## Requisitos de hardware

- VRAM estimada para inferencia: con 3,8 mil millones de parametros, el modelo en precision FP16 requiere aproximadamente 7,7 GB de VRAM (el tamano del repo es 7,7 GB). Con cuantizacion a 4 bits (como el modelo base), podria reducirse a unos 2-3 GB, aunque no se proporcionan pesos cuantizados en el repositorio.
- GPU recomendadas: una GPU consumer con al menos 8 GB de VRAM (por ejemplo, NVIDIA RTX 3060, 3070, 4060, 4070) puede ejecutar el modelo en FP16. Con cuantizacion, cabria en GPUs de 4-6 GB como la RTX 3050 o 4050.
- Si cabe en consumer GPU: si, en la mayoria de GPUs modernas de gama media y alta.
- Opciones de despliegue: al ser un modelo de la familia transformers, puede servirse con vLLM, Text Generation Inference (TGI), llama.cpp (si se convierten los pesos a GGUF), Ollama o directamente con la libreria transformers de HuggingFace.
- Latencia y throughput estimados: no se dispone de mediciones publicas. Para un modelo de 3,8B en una GPU consumer, se espera una latencia de decenas de milisegundos por token y un throughput de decenas de tokens por segundo, dependiendo de la cuantizacion y del hardware.

## Comparativa con modelos similares

La comparativa se realiza con modelos de tamano similar (3-4 mil millones de parametros) y proposito general, ya que no hay datos de rendimiento especificos para este fine-tune.

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| ESarp/Phi-4-Mini-AttackTree-DPO | 3,8B | no disponible | Apache 2.0 | Fine-tune de Phi-4-mini con DPO, posible especializacion en arboles de ataque |
| Microsoft Phi-4-mini-instruct | 3,8B | 128K (segun documentacion de Microsoft) | MIT | Modelo base, sin fine-tuning especifico |
| Llama-3.2-3B-Instruct | 3,2B | 128K | Llama 3.2 Community License | Modelo de Meta, con buenas capacidades de chat y razonamiento |
| Qwen2.5-3B-Instruct | 3,1B | 32K | Apache 2.0 | Modelo de Alibaba, multilingue y con soporte de tool calling |

Nota: la longitud de contexto del modelo base Phi-4-mini es de 128K tokens segun la documentacion oficial de Microsoft, pero no se confirma si el fine-tune mantiene esa ventana. La comparativa se basa en caracteristicas generales, no en rendimiento medido.

## Limitaciones y advertencias

- Sesgos conocidos: al ser un fine-tune de un modelo base entrenado principalmente con datos en ingles, puede heredar sesgos linguisticos y culturales. No se ha realizado una evaluacion de sesgos especifica.
- Riesgo de alucinacion: como cualquier modelo de lenguaje, puede generar informacion falsa o inventada, especialmente en dominios especializados como la ciberseguridad, donde la precision es critica.
- Limitaciones de contexto: no se ha confirmado la longitud de contexto efectiva tras el fine-tuning. Si se reduce respecto al modelo base, podria afectar a tareas que requieren contexto largo.
- Limitaciones de idioma: el modelo solo soporta ingles de forma documentada. No se recomienda su uso en otros idiomas sin evaluacion previa.
- Restricciones de licencia: la licencia Apache 2.0 permite uso comercial, pero se debe mantener el aviso de copyright y la atribucion. No hay restricciones adicionales conocidas.
- Caveat para produccion: al no haber benchmarks publicos ni documentacion sobre el dataset de entrenamiento, no se puede garantizar su rendimiento en tareas reales de seguridad. Se recomienda una evaluacion exhaustiva antes de desplegarlo en entornos criticos.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/ESarp/Phi-4-Mini-AttackTree-DPO
- Libreria Unsloth: https://github.com/unslothai/unsloth
- Modelo base en HuggingFace: https://huggingface.co/unsloth/Phi-4-mini-instruct-bnb-4bit
- Documentacion de TRL (HuggingFace): https://huggingface.co/docs/trl/index
