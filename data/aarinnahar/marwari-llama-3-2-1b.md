# aarinnahar/Marwari-Llama-3.2-1B

## Resumen

Marwari-Llama-3.2-1B es un ajuste fino (fine-tuning) del modelo Llama 3.2 1B Instruct de Meta, publicado por el usuario aarinnahar en HuggingFace. Se trata de un modelo de generación de texto de tipo decoder-only transformer con 1.235.814.400 parámetros, derivado concretamente de la versión cuantizada en 4 bits de Unsloth (`unsloth/Llama-3.2-1B-Instruct-unsloth-bnb-4bit`). El autor indica que el entrenamiento se realizó con Unsloth y la librería TRL de HuggingFace, lo que permitió un entrenamiento aproximadamente 2 veces más rápido que el flujo estándar.

El modelo hereda la arquitectura y la ventana de contexto de la familia Llama 3.2 1B, orientada a instrucciones y conversación, y está pensado para tareas de generación de texto en inglés. La model card es extremadamente escueta: no documenta el dataset de ajuste, el número de tokens de entrenamiento, hiperparámetros, ni resultados de evaluación. La licencia declarada es Apache 2.0, lo que facilita su uso comercial, aunque conviene verificar la procedencia de los datos de ajuste al no estar documentados.

Su relevancia es limitada en el ecosistema actual: se trata de un modelo de nicho con cero descargas y cero likes en el momento de la ficha, sin benchmarks publicados y con documentación mínima. Resulta útil únicamente como ejemplo de fine-tuning ligero con Unsloth sobre una base de 1B parámetros, o para experimentación local en hardware modesto, no como modelo de producción sin una evaluación previa por parte del usuario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama 3.2), fine-tuning de Llama-3.2-1B-Instruct |
| Parametros totales | 1.235.814.400 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la model card (heredada de Llama 3.2 1B: 131.072 tokens según la familia base, no confirmado por el autor) |
| Tipos de cuantizacion | no disponible en la model card; el modelo base de partida estaba cuantizado en 4 bits (bnb-4bit) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de la familia Llama 3.2 con 1.235.814.400 parámetros, ajustado a partir de `unsloth/Llama-3.2-1B-Instruct-unsloth-bnb-4bit`. La base es la versión Instruct de Llama 3.2 1B, que Meta entrenó con datos multilingües y un proceso de alineación orientado a instrucciones; el autor no detalla si el ajuste fino incluyó RLHF, DPO o únicamente SFT.

El entrenamiento se realizó con Unsloth y TRL, según la model card, con una mejora declarada de velocidad de aproximadamente 2x. No se especifican el dataset de ajuste, el número de tokens, la composición de los datos, la longitud de secuencia de entrenamiento ni los hiperparámetros (learning rate, LoRA rank, epochs). Tampoco se documenta si el resultado se fusionó con los pesos base o si se mantiene como adaptador. La ausencia de esta información impide reproducir el entrenamiento o evaluar la calidad del ajuste.

## Capacidades

- Generación de texto conversacional en inglés, heredada de Llama 3.2 1B Instruct.
- Seguimiento de instrucciones y formato de chat (pipeline `text-generation`, tags `conversational`).
- Razonamiento básico y respuesta a preguntas de complejidad baja, limitado por el tamaño de 1B parámetros.
- Generación de código y matemáticas elementales, sin garantías de calidad al no haber benchmarks publicados.
- Compatibilidad con `text-generation-inference` y `transformers`, lo que permite su despliegue en infraestructura estándar.
- Soporte de tool calling y function calling: no documentado por el autor; la familia Llama 3.2 1B Instruct soporta tool calling según Meta, pero no se confirma que el ajuste lo preserve.
- Capacidades de agente y razonamiento multi-paso: no documentadas.
- Capacidades multilingües: limitadas al inglés según la model card.
- Modo thinking, visión o audio: no disponibles.

## Casos de uso

- Experimentación local con fine-tuning: sirve como ejemplo de ajuste ligero con Unsloth y TRL sobre una base de 1B parámetros, útil para desarrolladores que quieran replicar el flujo en hardware de consumo.
- Prototipado de chatbots en inglés: el modelo puede gestionar conversaciones multi-turno sencillas en inglés, adecuado para demos y pruebas de concepto antes de migrar a un modelo mayor.
- Generación de texto asistida en entornos con recursos limitados: al tener 1.2B parámetros, cabe en GPU de consumo y permite generar texto en tiempo real en portátiles con GPU modesta.
- Clasificación y extracción de información simple: puede usarse para etiquetar o resumir textos cortos en inglés en pipelines de preprocesamiento, siempre con validación humana.
- Educación y divulgación: útil para demostrar el ciclo completo de fine-tuning de un modelo Llama 3.2 1B con Unsloth, incluyendo la publicación en HuggingFace.
- Base para nuevos ajustes de dominio: al estar bajo Apache 2.0, puede servir como punto de partida para fine-tunings específicos en inglés, aunque la falta de documentación del dataset original añade riesgo.
- Evaluación comparativa de técnicas de cuantización: permite comparar el rendimiento de la versión bnb-4bit de partida frente al modelo fusionado en precisión completa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 2,5 GB para los pesos (1.235.814.400 parámetros × 2 bytes), más overhead de activaciones y KV cache; en la práctica, entre 3 y 4 GB.
- VRAM estimada en cuantización 4 bits: alrededor de 0,7-1 GB para los pesos, más overhead; viable en GPUs con 2-4 GB.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090, A100 y H100 para despliegues de mayor concurrencia; cualquier GPU con al menos 4 GB de VRAM puede ejecutar la versión cuantizada.
- Cabe en GPU de consumo: sí, en la mayoría de GPUs modernas con 4 GB o más, incluidas GTX 1650 4 GB, RTX 3050, RTX 4060 y superiores.
- Opciones de despliegue: transformers, text-generation-inference (TGI), vLLM, llama.cpp y Ollama (previa conversión a GGUF), así como Unsloth para inferencia optimizada.
- Latencia y throughput estimados: no disponibles; al ser un modelo de 1B parámetros, se espera un throughput alto en GPU modernas, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Marwari-Llama-3.2-1B | 1.235.814.400 | no disponible (heredado de Llama 3.2 1B) | apache-2.0 | HuggingFace, 0 descargas | Fine-tuning sin documentación ni benchmarks |
| Llama-3.2-1B-Instruct (Meta) | 1.235.814.400 | 131.072 tokens | Llama 3.2 Community License | HuggingFace, ampliamente usado | Modelo base oficial, con benchmarks publicados por Meta |
| Qwen2.5-1.5B-Instruct | 1.543.000.000 (aprox.) | 32.768 tokens | Apache 2.0 | HuggingFace, muy usado | Alternativa de tamaño similar con benchmarks publicados |
| Gemma-2-2B-it | 2.614.000.000 (aprox.) | 8.192 tokens | Gemma Terms of Use | HuggingFace, ampliamente usado | Mayor tamaño y contexto menor, con evaluación oficial |

## Limitaciones y advertencias

- La model card no documenta el dataset de ajuste, los hiperparámetros ni el proceso de alineación, lo que impide evaluar sesgos introducidos por el fine-tuning.
- Riesgo de alucinación elevado por el tamaño reducido (1B parámetros) y por la ausencia de benchmarks que validen su calidad.
- Idioma limitado al inglés según la model card; no se garantiza un rendimiento aceptable en castellano u otros idiomas.
- Longitud de contexto no confirmada por el autor; no debe asumirse la ventana de 131.072 tokens de Llama 3.2 1B sin verificación empírica.
- Licencia Apache 2.0 declarada, pero la procedencia de los datos de ajuste no está documentada; conviene revisar posibles obligaciones derivadas de la licencia del modelo base de Meta.
- Sin descargas ni likes en el momento de la ficha, lo que indica ausencia de validación por parte de la comunidad.
- No apto para producción sin una evaluación previa por parte del usuario en el dominio objetivo.
- El modelo base de partida estaba cuantizado en 4 bits; si el ajuste se realizó sobre esa versión, puede haber una pérdida de calidad respecto al modelo original en precisión completa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/aarinnahar/Marwari-Llama-3.2-1B
- Modelo base en HuggingFace: https://huggingface.co/unsloth/Llama-3.2-1B-Instruct-unsloth-bnb-4bit
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
- Librería TRL de HuggingFace: https://github.com/huggingface/trl
- Modelo Llama 3.2 1B Instruct de Meta: https://huggingface.co/meta-llama/Llama-3.2-1B-Instruct
