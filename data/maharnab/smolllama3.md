# maharnab/SmolLlama3

## Resumen

SmolLlama3 es un adaptador LoRA (Low-Rank Adaptation) desarrollado por Maharnab Saikia sobre el modelo base meta-llama/Llama-3.1-8B. Se trata de un experimento de fine-tuning supervisado (SFT) que busca dotar al modelo base de capacidades conversacionales ligeras y generales, entrenado sobre un subconjunto de 10.000 muestras del dataset `smoltalk` (denominado `maharnab/smol-smoltalk-10k`). El adaptador tiene un tamaño de aproximadamente 84 MB y se distribuye en formato PEFT, por lo que requiere fusionarse con los pesos del modelo base para su uso.

La relevancia de este modelo reside en su carácter didáctico y experimental: demuestra cómo aplicar SFT con LoRA sobre un modelo de 8.000 millones de parámetros utilizando herramientas estándar como PEFT, TRL y Transformers. Al no haberse aplicado DPO ni RLHF, sus respuestas pueden ser menos refinadas que las de modelos alineados, pero sirve como punto de partida para investigar pipelines de fine-tuning de bajo coste computacional. Está pensado para chat multi-turno en inglés, instrucciones simples y experimentación académica o de prototipado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre Llama 3.1 8B (Transformer decoder, causal LM) |
| Parametros totales | 8.000 millones (modelo base) + ~84 MB (adaptador LoRA) |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | No disponible (heredada del modelo base, Llama 3.1 8B: 128k tokens) |
| Tipos de cuantizacion | No especificados (el adaptador se distribuye en bf16; el base puede cuantizarse) |
| Idiomas soportados | Ingles |
| Licencia | Llama 3.1 Community License |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

SmolLlama3 es un adaptador LoRA que modifica las proyecciones query y value de las capas de atención del modelo Llama 3.1 8B. La arquitectura subyacente es un transformer decoder causal con normalización RMSNorm, atención con RoPE y 32 capas, tal como el modelo base. El adaptador se entrenó mediante Supervised Fine-Tuning (SFT) utilizando el `SFTTrainer` de la librería TRL, con precisión mixta bf16. El dataset de entrenamiento, `maharnab/smol-smoltalk-10k`, contiene 10.000 muestras conversacionales multi-turno, tareas de seguimiento de instrucciones y preguntas-respuestas generales, extraídas del dataset `smoltalk`.

El entrenamiento se realizó en una GPU NVIDIA A100 de 40 GB durante aproximadamente 5 horas, utilizando la plataforma Modal en la región de Asia del Sur. No se aplicaron técnicas de alineación posteriores como DPO o RLHF, lo que constituye una decisión de diseño deliberada para mantener el experimento simple y reproducible. El checkpoint final del adaptador ocupa unos 84 MB, lo que facilita su distribución y carga.

## Capacidades

- Generacion de texto conversacional en ingles, con soporte para dialogos multi-turno.
- Seguimiento de instrucciones simples y tareas de QA general.
- Integracion con el chat template de Llama 3.1 mediante `apply_chat_template`.
- Capacidad de fusion con el modelo base para despliegue estandar.
- No soporta tool calling, funciones, vision, audio ni razonamiento avanzado de forma nativa (se heredan las capacidades del modelo base, pero sin garantias).
- No incluye modo thinking ni capacidades multilingues mas alla del ingles.

## Casos de uso

- Prototipado de chatbots ligeros: el adaptador puede cargarse sobre Llama 3.1 8B y servir como base para experimentar con interacciones conversacionales en entornos de desarrollo sin necesidad de un pipeline de alineacion completo.
- Investigacion academica sobre SFT con LoRA: su pequeño tamaño y su documentacion detallada lo convierten en un ejemplo util para estudiar el impacto de la cantidad de datos y la falta de DPO en la calidad de las respuestas.
- Pruebas de integracion con PEFT y TRL: desarrolladores pueden usar este adaptador como referencia para verificar que sus pipelines de fine-tuning funcionan correctamente antes de entrenar modelos propios.
- Generacion de respuestas en dominios de bajo riesgo: tareas como resumir textos simples, responder preguntas factuales o mantener una conversacion informal pueden ejecutarse con este modelo, siempre que se implementen guardarrailes adecuados.
- Educacion y formacion en IA: sirve como ejemplo practico de como se construye y despliega un adaptador LoRA sobre un modelo grande, ideal para talleres y cursos.
- Benchmarking de tecnicas de cuantizacion: al ser un adaptador pequeno, puede combinarse con versiones cuantizadas de Llama 3.1 8B para medir el impacto de la cuantizacion en la calidad conversacional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas como MMLU, HumanEval, GSM8K ni comparaciones con otros modelos. El unico dato de rendimiento disponible es el tiempo de entrenamiento (5 horas en A100 40GB) y el tamaño del checkpoint (84 MB). No se proporcionan mediciones de latencia ni throughput en inferencia.

## Requisitos de hardware

- El adaptador en si requiere muy poca VRAM adicional (~84 MB), pero al estar montado sobre Llama 3.1 8B, la inferencia necesita la VRAM del modelo base completo.
- Para Llama 3.1 8B en bf16 se necesitan aproximadamente 16 GB de VRAM; con cuantizacion de 4 bits (por ejemplo, bitsandbytes) se puede reducir a unos 6-8 GB.
- GPUs recomendadas: NVIDIA A100 (usada en entrenamiento), RTX 4090 (24 GB), RTX 3090 (24 GB), o cualquier GPU con al menos 16 GB para precision completa.
- Es posible ejecutar en consumer GPU de gama alta (RTX 3080/4080 con cuantizacion) y en entornos cloud con A10G o L4.
- Opciones de despliegue: se puede servir con `transformers` + `peft` directamente, o fusionar el adaptador y exportar a formatos como GGUF para usar con llama.cpp u Ollama. Tambien es compatible con vLLM si se fusiona previamente.
- No se dispone de datos de latencia o throughput estimados.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| SmolLlama3 (adaptador) | 8B base + 84MB LoRA | No disponible (heredado 128k) | Llama 3.1 Community | SFT sin DPO, conversacional |
| meta-llama/Llama-3.1-8B | 8B | 128k | Llama 3.1 Community | Modelo base, no fine-tuning conversacional especifico |
| HuggingFaceTB/SmolLM3-3B-Base | 3B | No disponible | Apache 2.0 | Modelo pequeno y eficiente, pero de diferente familia y tamano |

No se dispone de comparaciones directas con otros adaptadores LoRA conversacionales sobre Llama 3.1, ya que no se han publicado benchmarks. La comparativa se limita a caracteristicas generales de arquitectura y licencia.

## Limitaciones y advertencias

- Falta de alineacion por preferencias: al omitir DPO/RLHF, las respuestas pueden ser verbosas, redundantes o inconsistentes en cuanto a limites de seguridad.
- Sesgos heredados: el modelo hereda todos los sesgos, limitaciones y fecha de corte de conocimiento del modelo base Llama 3.1 8B.
- Riesgo de alucinacion: al ser un adaptador SFT sin alineacion adicional, puede generar contenido falso o inventado, especialmente en temas de alta complejidad.
- Solo ingles: no se ha entrenado para otros idiomas, aunque el modelo base tiene cierta capacidad multilingue, no esta garantizada.
- No apto para uso en produccion de alto riesgo: no debe emplearse en aplicaciones medicas, legales, de seguridad critica o de toma de decisiones importantes.
- Licencia restrictiva: la Llama 3.1 Community License impone condiciones de uso comercial y requiere aceptacion de los terminos de Meta.
- Dependencia del modelo base: el adaptador no funciona sin los pesos de Llama 3.1 8B, que deben descargarse por separado y estan sujetos a su propia licencia.
- Falta de documentacion sobre cuantizacion: no se especifican configuraciones de cuantizacion probadas, por lo que el usuario debe validar la calidad tras cuantizar.

## Enlaces

- HuggingFace: https://huggingface.co/maharnab/SmolLlama3
- Pagina personal del autor: https://www.maharnabsaikia.com/
- Dataset de entrenamiento: https://huggingface.co/datasets/maharnab/smol-smoltalk-10k
- Referencia sobre impacto ambiental (Lacoste et al., 2019): https://arxiv.org/abs/1910.09700
