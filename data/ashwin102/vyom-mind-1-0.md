# Ashwin102/vyom-mind-1.0

## Resumen
Vyom Mind 1.0 es un ajuste fino por QLoRA del modelo Qwen2.5-7B-Instruct, desarrollado por el autor Ashwin102 dentro del denominado "Project Vyom". No se trata de un modelo entrenado desde cero, sino de un adaptador LoRA (rank 16, alpha 32) aplicado sobre el checkpoint instruct de Qwen2.5 de 7.000 millones de parametros. Su objetivo declarado es dotar al modelo base de una "inteligencia conversacional personalizada", con capacidades de razonamiento conversacional, sintesis de codigo, integracion de investigacion web y generacion de sugerencias de seguimiento contextuales.

El modelo hereda la arquitectura transformer decoder-only densa de Qwen2.5-7B, con atencion de ventana deslizante y RoPE, y conserva el tokenizador y la plantilla ChatML del modelo original. El entrenamiento se realizo con cuantizacion 4-bit NF4 sobre dos GPU Tesla T4 en Kaggle, lo que lo convierte en un ejemplo de ajuste fino de bajo coste y accesible.

Su relevancia practica es limitada: el repositorio no publica resultados de benchmarks, no detalla el volumen ni la composicion del dataset de ajuste y registra cero descargas y cero "likes" en el momento de redactar esta ficha. Debe tratarse, por tanto, como un checkpoint experimental de nicho, no como una alternativa validada a Qwen2.5-7B-Instruct.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only densa (Qwen2.5), ajuste fino QLoRA |
| Parametros totales | 7.000 millones (modelo base Qwen2.5-7B-Instruct) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base Qwen2.5-7B-Instruct) |
| Tipos de cuantizacion | Entrenamiento en 4-bit NF4; el repositorio solo publica el adaptador LoRA, no pesos cuantizados |
| Idiomas soportados | en (segun la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | Adaptador LoRA (PEFT) sobre safetensors del modelo base; no se publican GGUF |

## Arquitectura y entrenamiento
El modelo parte de Qwen2.5-7B-Instruct, un transformer decoder-only denso con atencion multi-cabeza por consulta agrupada (GQA), RoPE y ventana de atencion deslizante en parte de sus capas. Sobre ese checkpoint se aplica un adaptador LoRA de rank 16 y alpha 32 con cuantizacion 4-bit NF4 (QLoRA), apuntando a los modulos q_proj, k_proj, v_proj, o_proj, gate_proj, up_proj y down_proj, es decir, todas las proyecciones de atencion y del MLP.

El entrenamiento se ejecuto en Kaggle sobre dos GPU Tesla T4. No se especifica el numero de tokens de entrenamiento, la composicion del dataset, si se aplicaron etapas de RLHF o DPO, ni hiperparametros como tasa de aprendizaje o numero de epocas. La unica innovacion tecnica documentada es el propio procedimiento QLoRA de bajo coste; no se mencionan tecnicas como decodificacion especulativa, atencion lineal ni modos de razonamiento extendido.

## Capacidades
- Generacion de texto conversacional multi-turno, heredada de Qwen2.5-7B-Instruct.
- Razonamiento conversacional y sintesis de codigo, segun la model card.
- Cumplimiento de la plantilla de prompt ChatML del modelo base.
- Integracion de "investigacion web fundamentada" (grounded web research), entendida como capacidad de incorporar contexto externo en la respuesta.
- Generacion de sugerencias de seguimiento contextuales (follow-up suggestions).
- Soporte multilingue limitado: la model card declara unicamente ingles, aunque el modelo base soporta mas idiomas.
- No se documenta soporte explicito de tool calling, function calling, vision, audio ni modo de pensamiento extendido en la informacion disponible.

## Casos de uso
- Prototipado de asistentes conversacionales especializados: el adaptador puede cargarse sobre Qwen2.5-7B-Instruct para experimentar con un tono y estilo de respuesta propios de "Project Vyom", sin reentrenar el modelo completo.
- Generacion de sugerencias de seguimiento en interfaces de chat: la capacidad declarada de producir follow-ups contextuales encaja en asistentes con preguntas sugeridas tras cada respuesta.
- Investigacion aumentada por recuperacion (RAG): la mencionada integracion de investigacion web permite inyectar documentos o resultados de busqueda en el contexto y pedir respuestas fundamentadas.
- Sintesis de codigo en entornos de desarrollo: puede emplearse como autocompletado o generacion de fragmentos de codigo dentro de editores, con validacion humana obligatoria dado que no hay benchmarks publicados.
- Evaluacion comparativa de tecnicas QLoRA: util como caso de estudio reproducible (notebook de Kaggle disponible) para investigadores que quieran replicar ajustes finos de bajo coste en T4.
- Filtrado y reformulacion de conversaciones: puede reescribir respuestas o resumir hilos de conversacion manteniendo la plantilla ChatML.
- Base para posteriores ajustes: al ser un adaptador PEFT, puede combinarse o continuar entrenandose con otros adaptadores sin duplicar el coste de almacenamiento del modelo completo.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- VRAM estimada para inferencia del modelo completo en FP16: aproximadamente 15-16 GB, lo que requiere GPU con al menos 16-24 GB (RTX 4090, A10G, L4, A100 40 GB, H100).
- En cuantizacion 8-bit: aproximadamente 8-9 GB de VRAM, viable en RTX 3090/4090 y en GPUs de 12 GB con margen ajustado.
- En cuantizacion 4-bit (por ejemplo, GPTQ o AWQ): aproximadamente 5-6 GB, cabe en GPUs de consumo como RTX 3060 12 GB, RTX 4060 Ti 16 GB o RTX 4070.
- El adaptador LoRA en si ocupa muy poco espacio, pero requiere cargar el modelo base completo para la inferencia.
- Opciones de despliegue: vLLM, TGI, llama.cpp (previo merge y conversion a GGUF), Ollama (idempotente tras conversion) y transformers + PEFT para cargar el adaptador directamente.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Vyom Mind 1.0 | 7.000 M (base) + adaptador LoRA | no disponible | Apache 2.0 | Repositorio Hugging Face, 0 descargas | Sin benchmarks publicados |
| Qwen2.5-7B-Instruct | 7.000 M | 128.000 tokens (segun documentacion oficial de Qwen) | Apache 2.0 | Ampliamente disponible | Modelo base de referencia, con evaluaciones publicadas |
| Mistral-7B-Instruct v0.3 | 7.000 M | 32.000 tokens | Apache 2.0 | Ampliamente disponible | Alternativa densa de tamano comparable |
| Llama 3.1 8B Instruct | 8.000 M | 128.000 tokens | Licencia comunitaria Llama 3.1 | Ampliamente disponible | Requiere aceptacion de terminos |

## Limitaciones y advertencias
- No hay benchmarks ni evaluaciones independientes: el rendimiento real frente al modelo base es desconocido y podria ser inferior por sobreajuste al dataset de ajuste.
- El dataset de entrenamiento no esta documentado, lo que impide evaluar sesgos, contaminacion o calidad de los datos.
- Riesgo de alucinacion heredado del modelo base y potencialmente amplificado por el ajuste conversacional; no hay datos que lo cuantifiquen.
- Idiomas: la model card declara solo ingles, por lo que el uso en castellano no esta garantizado ni validado.
- La longitud de contexto efectiva no se especifica en el repositorio; debe asumirse la del modelo base, pero sin confirmacion del autor.
- El repositorio solo contiene el adaptador LoRA: para usarlo es imprescindible descargar Qwen2.5-7B-Instruct y aplicar el adaptador con PEFT.
- Licencia Apache 2.0 permisiva para uso comercial, pero el modelo base Qwen2.5-7B-Instruct tambien es Apache 2.0, por lo que no hay restricciones adicionales conocidas.
- Cero descargas y cero interacciones: no existe validacion comunitaria de su funcionamiento ni de la calidad de los pesos publicados.
- Fecha de creacion del repositorio (2026-10-31) posterior a la fecha habitual de publicacion de Qwen2.5; conviene verificar la integridad de los artefactos antes de usarlos en produccion.

## Enlaces
- Repositorio Hugging Face: https://huggingface.co/Ashwin102/vyom-mind-1.0
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Notebook de entrenamiento en Kaggle: https://www.kaggle.com/code/ashwinprogrammer/vyom-mind-1-0-qwen2-5-lora-fine-tuning
