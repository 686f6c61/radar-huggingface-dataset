# freakzy-spec/Legal-Qwen-SFT-Indo

## Resumen

Legal-Qwen-SFT-Indo es un ajuste fino (fine-tuning) supervisado del modelo Qwen2.5-3B-Instruct, desarrollado por el usuario freakzy-spec y publicado en HuggingFace. Se trata de un modelo de generacion de texto de tipo transformer decoder-only con aproximadamente 3.085 millones de parametros (3,09B), construido sobre la version cuantizada en 4 bits del modelo base (unsloth/Qwen2.5-3B-Instruct-bnb-4bit). El nombre del repositorio sugiere un enfoque en dominio legal, aunque la model card no documenta el dataset ni la naturaleza de los datos de ajuste.

El modelo se ha entrenado utilizando Unsloth y la libreria TRL de HuggingFace, una combinacion orientada a reducir el coste computacional del fine-tuning (el autor afirma un entrenamiento "2x mas rapido"). No se especifican el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o DPO posteriores.

Su relevancia es limitada y practica: se trata de un experimento de ajuste fino de bajo coste sobre un modelo pequeno y de licencia permisiva Apache 2.0, util como referencia para quienes quieran replicar el pipeline de Unsloth sobre Qwen2.5-3B en dominios especializados. El repositorio registra 0 descargas y 0 "likes", y la model card es practicamente la plantilla autogenerada por Unsloth, por lo que la documentacion tecnica es muy escasa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2) |
| Parametros totales | 3.085.938.688 (3,09B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada; el modelo base Qwen2.5-3B-Instruct declara 32.768 tokens nativos (ampliable con YaRN) |
| Tipos de cuantizacion | El modelo base esta en bnb-4bit; los pesos publicados estan en safetensors. No se documentan otras cuantizaciones |
| Idiomas soportados | en (ingles) segun la etiqueta del repositorio |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-3B-Instruct: un transformer decoder-only con atencion causal, normalizacion RMSNorm, activacion SwiGLU y embeddings de tipo RoPE, con soporte nativo de atencion por ventana deslizante. El modelo parte de la variante cuantizada en 4 bits (bnb-4bit) del checkpoint de Unsloth, que a su vez deriva del Qwen2.5-3B-Instruct oficial de Alibaba.

El ajuste fino se realizo con Unsloth y TRL, un stack que aplica tecnicas de optimizacion de memoria y calculo (kernel fusionado, gradient checkpointing, adaptadores LoRA/QLoRA) para abaratar el entrenamiento. La model card no aporta informacion sobre el numero de tokens de entrenamiento, la composicion del dataset legal, la duracion del ajuste, el rango de LoRA ni si se aplicaron etapas posteriores de alineacion (RLHF, DPO). El autor indica que el modelo se entreno "2x mas rapido" con Unsloth, pero no publica hiperparametros ni curvas de perdida.

## Capacidades

- Generacion de texto conversacional en ingles, heredada del modelo base Qwen2.5-3B-Instruct.
- Razonamiento basico y respuesta a instrucciones propias de un modelo de 3B parametros.
- Generacion de codigo y resolucion de tareas matematicas sencillas (capacidad inherente al base, no verificada en este ajuste).
- Soporte de tool calling / function calling heredado de Qwen2.5-Instruct (no confirmado por el autor en este fine-tuning).
- Capacidad multilingue limitada: la etiqueta de idioma del repositorio solo declara ingles, aunque el base Qwen2.5 es multilingue.
- Modo "thinking" o razonamiento explicito: no disponible.
- Vision o audio: no disponible (modelo estrictamente de texto).

## Casos de uso

- Experimentacion academica con fine-tuning de dominio legal: sirve como ejemplo reproducible de ajuste de Qwen2.5-3B con Unsloth sobre un corpus juridico en ingles.
- Clasificacion y resumen de documentos legales: dado su tamano reducido, puede desplegarse localmente para resumir contratos o clausulas, siempre que se valide la calidad frente a alucinaciones.
- Prototipado rapido de asistentes conversacionales especializados: por su huella de memoria baja, permite iterar en un portatil o una GPU de gama media sin costes de nube.
- Extraccion de entidades en textos juridicos: puede emplearse como base para pipelines de NER legal, aunque requerira evaluacion especifica y posiblemente ajuste adicional.
- Educacion y formacion juridica: generacion de respuestas explicativas sobre conceptos legales basicos, con supervision humana obligatoria por el riesgo de imprecision.
- Investigacion en eficiencia de fine-tuning: comparar el resultado de Unsloth + QLoRA frente a otros metodos sobre el mismo modelo base.
- Base para destilacion o ajustes posteriores: al ser un checkpoint de 3B con licencia Apache 2.0, puede servir como punto de partida de nuevos entrenamientos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K ni ninguna otra evaluacion, y no se han encontrado datos adicionales en la busqueda web.

## Requisitos de hardware

- VRAM estimada para inferencia: en FP16 aproximadamente 6,2 GB; en cuantizacion de 8 bits unos 3,5 GB; en 4 bits (GGUF Q4) alrededor de 2 GB.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para FP16 (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, L4, A10G). Para 4 bits bastan 4 GB (RTX 3050, GTX 1650 de 4 GB, integradas con suficiente memoria compartida).
- Cabe en GPU de consumo: si, en practicamente cualquier GPU moderna de 6-8 GB o superior, especialmente con cuantizacion GGUF de 4 bits.
- Opciones de despliegue: transformers (formato safetensors original), llama.cpp y Ollama (tras conversion a GGUF), vLLM y TGI (formato safetensors, requiere GPU), ademas de cualquier backend compatible con la arquitectura Qwen2.
- Latencia y throughput: no disponibles. No se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato / disponibilidad |
|---|---|---|---|---|
| Legal-Qwen-SFT-Indo | 3,09B | No documentado (base: 32.768) | Apache 2.0 | safetensors, 0 descargas |
| Qwen2.5-3B-Instruct | 3,09B | 32.768 (ampliable con YaRN) | Apache 2.0 | safetensors, GGUF, ampliamente disponible |
| Llama-3.2-3B-Instruct | 3,21B | 128.000 | Llama 3.2 Community License | safetensors, GGUF, ampliamente disponible |
| Gemma-2-2B-it | 2,6B | 8.192 | Gemma Terms of Use | safetensors, GGUF, ampliamente disponible |

El rendimiento comparado no se puede establecer porque no hay benchmarks publicados para este ajuste. El modelo base Qwen2.5-3B-Instruct es el termino de comparacion mas directo.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados por el autor. Al derivar de Qwen2.5, hereda los sesgos del corpus de entrenamiento original, pero no han sido evaluados.
- Riesgo de alucinacion: elevado en un modelo de 3B sin alineacion documentada, especialmente critico en dominio legal donde las respuestas incorrectas pueden tener consecuencias graves.
- Limitaciones de contexto e idioma: la etiqueta de idioma solo declara ingles; el rendimiento en castellano no esta verificado. No se documenta la longitud de contexto efectiva tras el ajuste.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero al derivar de Qwen2.5 conviene revisar los terminos del modelo base y la licencia Apache 2.0 original de Qwen.
- Caveats para produccion: el repositorio registra 0 descargas y 0 likes, la model card es una plantilla autogenerada y no hay evaluacion, dataset ni hiperparametros publicados. No se recomienda su uso en produccion sin una evaluacion exhaustiva y una validacion del dataset de ajuste.
- El origen del sufijo "Indo" (¿indonesio?) no esta aclarado en la documentacion, lo que genera ambiguedad sobre el dominio real del ajuste.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/freakzy-spec/Legal-Qwen-SFT-Indo
- Modelo base: https://huggingface.co/unsloth/Qwen2.5-3B-Instruct-bnb-4bit
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
- Paper, blog, demo o repositorio adicionales: no disponibles. La busqueda web no devolvio resultados relevantes sobre este modelo.
