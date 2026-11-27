# kisson2000/kanana-1.5-8b-instruct-2505-Safe-DPO

## Resumen

kanana-1.5-8b-instruct-2505-Safe-DPO es un ajuste fino (fine-tuning) del modelo kisson2000/kanana-1.5-8b-instruct-2505, publicado por el usuario kisson2000 en Hugging Face. Se trata de un modelo de generacion de texto de aproximadamente 8.030 millones de parametros, con arquitectura de tipo Llama (segun la etiqueta `llama` de la model card) y pesos en formato safetensors. El nombre sugiere una alineacion adicional orientada a seguridad mediante DPO (Direct Preference Optimization), aunque la model card no documenta el proceso de entrenamiento ni los datos utilizados.

El modelo se distribuye bajo licencia Apache 2.0 y declara soporte unicamente para ingles (`en`). El repositorio ocupa 16,1 GB, lo que es coherente con pesos en precision bf16/fp16 para un modelo de 8.000 millones de parametros. La model card es extremadamente escueta: se limita a indicar que fue entrenado con Unsloth y la libreria TRL de Hugging Face, sin aportar informacion sobre el dataset, la metodologia de DPO ni evaluaciones.

La relevancia de esta ficha es limitada: el modelo tiene cero descargas y cero likes en el momento de la consulta, no incluye benchmarks y su model card no describe capacidades concretas. Cualquier evaluacion practica debe realizarse por cuenta del usuario antes de considerarlo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo Llama (según etiqueta del repositorio) |
| Parametros totales | 8.030.285.824 (~8,03 B) |
| Parametros activos | no disponible (no es MoE según los datos disponibles) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en la model card; al ser safetensors, admite cuantizacion posterior con herramientas como GGUF/AWQ/GPTQ, pero no se documenta |
| Idiomas soportados | ingles (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La informacion disponible indica que el modelo es de tipo Llama, con 8.030 millones de parametros totales. No se especifica si emplea atencion con RoPE, GQA, activaciones SwiGLU u otras variantes propias de la familia Llama, ni el numero de capas, dimensiones ocultas o cabezas de atencion. Tampoco se documenta la longitud de contexto nativa.

Respecto al entrenamiento, la model card solo menciona que el ajuste fino se realizo con Unsloth y la libreria TRL de Hugging Face, lo que sugiere un pipeline de fine-tuning supervisado (SFT) y, por el sufijo "Safe-DPO", una etapa de DPO orientada a seguridad. No se aportan datos sobre el numero de tokens de entrenamiento, la composicion del dataset, el numero de pasos, la tasa de aprendizaje ni los hiperparametros de DPO (beta, pares de preferencia, etc.). El modelo base declarado es el propio repositorio (kisson2000/kanana-1.5-8b-instruct-2505-Safe-DPO), lo que constituye una referencia circular y no permite rastrear el origen real de los pesos.

## Capacidades

- Generacion de texto conversacional en ingles, segun la etiqueta `conversational` y el pipeline `text-generation`.
- Ajuste fino orientado a seguridad (sufijo "Safe-DPO"), aunque no se documenta que comportamientos concretos mejora ni como se midio.
- Compatibilidad con `text-generation-inference` (TGI) y `transformers`, segun las etiquetas del repositorio.
- Compatibilidad con endpoints de Hugging Face (`endpoints_compatible`).
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni modo "thinking".
- No se documenta capacidad multilingue: solo ingles.

## Casos de uso

- Prototipado de chatbots en ingles: al ser un modelo de 8 B con licencia Apache 2.0, puede desplegarse en entornos de desarrollo para validar flujos conversacionales antes de invertir en modelos mayores, aunque sin benchmarks no hay garantia de calidad.
- Experimentacion con alineacion y seguridad: el sufijo "Safe-DPO" sugiere que puede usarse como punto de partida para estudiar el efecto de DPO en modelos de 8 B, comparando respuestas frente al modelo base (si se localiza el original).
- Fine-tuning adicional con Unsloth: al haberse entrenado con esta herramienta, es candidato para nuevos ajustes con LoRA/QLoRA en una sola GPU consumer, aunque el autor no publica recetas.
- Generacion de texto general en ingles para tareas de resumen o redaccion asistida, siempre con validacion humana dado que no hay evaluaciones publicadas.
- Despliegue en infraestructura propia con TGI o vLLM: el formato safetensors y el tamano de 8 B permiten servirlo en una GPU de 24 GB en bf16 (con margen ajustado) o cuantizado en GPUs menores.
- Base para investigacion academica sobre modelos pequenos alineados: su licencia permisiva facilita su uso en estudios comparativos, aunque la falta de documentacion limita la reproducibilidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 16 GB solo para pesos, mas overhead de KV cache y activaciones; en la practica se recomiendan 24 GB o mas.
- VRAM estimada en cuantizacion de 8 bits: en torno a 8-9 GB para pesos.
- VRAM estimada en cuantizacion de 4 bits (GGUF Q4): en torno a 5-6 GB para pesos.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para bf16; RTX 3090/4080 o inferiores con cuantizacion.
- Cabe en GPU consumer: si, en RTX 4090 en bf16 con contexto moderado, y en GPUs de 8-12 GB con cuantizacion 4-8 bits.
- Opciones de despliegue: transformers, text-generation-inference (TGI), vLLM, llama.cpp/Ollama (previa conversion a GGUF), y endpoints de Hugging Face.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| kisson2000/kanana-1.5-8b-instruct-2505-Safe-DPO | ~8,03 B | no disponible | Apache 2.0 | Hugging Face | Sin benchmarks ni documentacion de entrenamiento |
| Meta Llama 3.1 8B Instruct | ~8 B | 128 K | Llama 3.1 Community License | Hugging Face, amplia adopcion | Benchmarks publicos y ecosistema maduro |
| Mistral 7B Instruct | ~7,2 B | 32 K | Apache 2.0 | Hugging Face | Menor tamano, licencia permisiva, benchmarks publicos |
| Qwen2.5 7B Instruct | ~7,6 B | 128 K | Apache 2.0 (segun variante) | Hugging Face | Multilingue y con benchmarks publicos |

La comparativa se basa en caracteristicas generales de modelos de tamano similar; no se dispone de datos de rendimiento de este modelo para comparar de forma cuantitativa.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay evidencia publicada de calidad en tareas estandar (MMLU, HumanEval, GSM8K, etc.).
- Model card practicamente vacia: no se documenta el dataset, la metodologia de DPO ni los criterios de seguridad, lo que impide auditar el ajuste "Safe".
- Referencia circular del modelo base: el campo `base_model` apunta al propio repositorio, lo que dificulta rastrear el origen de los pesos y la cadena de entrenamiento.
- Solo ingles declarado: no se garantiza calidad en castellano ni en otros idiomas.
- Riesgo de alucinacion: inherente a los modelos de lenguaje de 8 B sin evaluaciones; no hay datos que lo cuantifiquen.
- Sesgos desconocidos: al no documentarse el dataset de entrenamiento, no es posible evaluar sesgos de genero, raza, idioma o dominio.
- Licencia Apache 2.0: permite uso comercial, pero el usuario asume toda la responsabilidad legal y etica sobre el comportamiento del modelo.
- Cero adopcion (0 descargas, 0 likes): no hay comunidad que haya validado el modelo; tratarlo como experimental.
- Contexto desconocido: no se puede planificar su uso en tareas de contexto largo sin verificacion empirica.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kisson2000/kanana-1.5-8b-instruct-2505-Safe-DPO
- Unsloth (herramienta de entrenamiento citada): https://github.com/unslothai/unsloth
- Repositorio TRL de Hugging Face (mencionado en la model card): https://github.com/huggingface/trl
- No se han encontrado papers, blogs, demos ni repositorios adicionales en la informacion proporcionada.
