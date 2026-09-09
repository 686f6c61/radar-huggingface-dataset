# luispoveda93/MiniCPM5-2B-catalan-chat

## Resumen

MiniCPM5-2B-catalan-chat es un modelo de lenguaje conversacional ajustado específicamente para el catalán (ca-ES), desarrollado por el usuario luispoveda93. Se trata de un fine-tuning con LoRA del modelo base openbmb/MiniCPM5-2B, que tiene una arquitectura Llama y unos 2.5 mil millones de parámetros. El ajuste se realizó sobre el dataset completo InstruCAT de Projecte AINA, que contiene 165.100 muestras de instrucciones en catalán distribuidas en 11 categorías de tareas y aproximadamente 43 millones de tokens.

El modelo está pensado para responder instrucciones en catalán en formato conversacional, cubriendo tareas como preguntas y respuestas, clasificación, entidades nombradas, paráfrasis y resúmenes. Aunque el modelo base es Apache-2.0, la licencia del conjunto de datos de entrenamiento es CC-BY-NC-ND-4.0, lo que impone restricciones de uso no comercial. Es un modelo ligero de 2.5B que puede ejecutarse en GPUs de consumo con un consumo de VRAM moderado, lo que lo hace interesante para prototipos y despliegues en entornos con recursos limitados.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Llama (modelo base openbmb/MiniCPM5-2B) |
| Parametros totales | 2.516.756.480 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (entrenado con secuencias de 2048 tokens) |
| Tipos de cuantizacion | no disponible (los pesos se publican en bf16) |
| Idiomas soportados | Catalán (ca-ES), con posible herencia del modelo base en otros idiomas |
| Licencia | other (base Apache-2.0; datos de entrenamiento CC-BY-NC-ND-4.0, no comercial) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino LoRA del modelo openbmb/MiniCPM5-2B, que emplea una arquitectura Llama con aproximadamente 2.5B parámetros. El adaptador LoRA se configuró con r=32, alpha=64, dropout de 0.05 y se aplicó a todas las proyecciones de atención y MLP. El entrenamiento se realizó con el trainer SFTTrainer de TRL (v1.12.0) sobre la base de transformers 5.16.1 y peft 0.20.0. El prompt se formateó usando la plantilla de chat de MiniCPM5, con un system prompt fijo en catalán ("Ets un assistent conversacional que respon sempre en català.") y una pérdida que solo considera la respuesta del asistente (completion-only loss). La secuencia se truncó a 2048 tokens con empaquetado.

El conjunto de datos InstruCAT proviene de la conversión de varios datasets en catalán: caBreu, CatalanQA, CaWikiTC, ceil, CoqCat, GuiaCat, IntoxiCat, NLUCat, Parafraseja, PAWS-ca, sts-ca, teca y WikiCat. El entrenamiento duró 1 época, con un lote efectivo de 32 (4 × grad-accum 8), tasa de aprendizaje 2e-4 con programación coseno y 200 pasos de calentamiento. Se ejecutaron 711 pasos en aproximadamente 19 horas en una única GPU A10G de 24GB con bf16 y gradient checkpointing. La curva de pérdida mostró una reducción de 2.39 a aproximadamente 0.35-0.40 al final, con una precisión media por token de 0.91-0.92 en la segunda mitad del entrenamiento. La evaluación sobre 1000 muestras de validación se realizó en el paso 500 sin errores.

## Capacidades

- Generación de texto conversacional en catalán, siguiendo instrucciones en formato chat con system prompt definido.
- Ejecución de tareas de instrucción explícitas: preguntas y respuestas, paráfrasis, resumen, clasificación de texto y extracción de entidades nombradas, gracias a los datasets incluidos en InstruCAT.
- Interacción en un solo turno (single-turn) sin mantenimiento de historial multi-turno, según la limitación declarada por el autor.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-step: no disponible o no documentado.
- Capacidades multilingües: el entrenamiento se centra exclusivamente en catalán; el modelo base puede generar texto en otros idiomas, pero no se garantiza su corrección.
- Capacidades de visión o audio: no disponibles.

## Casos de uso

- Atención al cliente en catalán para empresas locales: el modelo puede gestionar consultas de usuario en un solo turno, respondiendo a preguntas frecuentes sobre productos, horarios o políticas. Su formación en instrucciones catalanas y su formato chat lo hacen adecuado para integrarse en chatbots sencillos sin necesidad de conversación larga.
- Asistente de redacción y corrección en catalán: se puede utilizar para pedir paráfrasis, reescritura o resúmenes de textos. Es útil para periodistas o editores que necesiten variar redacción o condensar documentos sin salir del idioma catalán.
- Sistema de preguntas y respuestas sobre dominio enciclopédico: gracias a datasets como CatalanQA y CaWikiTC, el modelo puede responder preguntas factuales en catalán sobre temas generales, útil para prototipos de asistentes educativos o de consulta documental.
- Clasificación de textos en catalán: se puede aplicar a tareas de análisis de sentimiento, detección de temas o categorización de noticias. El modelo puede ejecutar estas tareas al recibir instrucciones claras del usuario, incluyendo etiquetas de salida.
- Asistente para docentes de lengua catalana: el modelo puede explicar conceptos gramaticales, generar ejercicios de vocabulario o corregir frases, aprovechando su capacidad de seguir instrucciones y su conocimiento del idioma catalán.
- Generación de resúmenes de informes o actas en catalán: empresas del sector público o privado catalán pueden usar el modelo para condensar documentos extensos, dado su entrenamiento en tareas de resumen (teca, WikiCat).
- Apoyo en tareas de NER en catalán: al recibir un texto y una instrucción, el modelo puede extraer entidades nombradas (personas, organizaciones, lugares), lo que facilita el preprocesado en pipelines de datos lingüísticos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El único dato de rendimiento documentado es la evolución de la pérdida durante el entrenamiento, que descendió de 2.39 a ~0.35–0.40, con una precisión media por token de ~0.91–0.92 en la segunda mitad del entrenamiento. No se incluyen métricas comparativas con otros modelos ni resultados en benchmarks estándar como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: ~5.0 GB para los pesos (2.51B parámetros × 2 bytes). Con contexto de 2048 tokens y batch pequeño, se recomiendan entre 6 y 8 GB de VRAM.
- VRAM con cuantización 4-bit (aplicable manualmente mediante bitsandbytes, aunque no se publica en el repo): ~2.5–3 GB para los pesos, lo que permitiría ejecutarse en GPUs de 4–6 GB.
- GPU recomendadas: RTX 3060 12GB, A10G 24GB, T4 16GB o superior. Para el entrenamiento se utilizó una A10G 24GB, pero para inferencia basta con hardware de gama media.
- ¿Cabe en GPU de consumo?: sí, en tarjetas de 8 GB o más en bf16, y en tarjetas de 4–6 GB con cuantización.
- Opciones de despliegue: transformers (con carga directa de safetensors), Hugging Face Text Generation Inference (TGI), vLLM si se convierte el formato, o llama.cpp si se exporta a GGUF. No se suministra oficialmente en formato GGUF.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de información de benchmarks ni comparativas directas con otros modelos de la misma categoría en la información proporcionada. Se puede señalar que el modelo base openbmb/MiniCPM5-2B es Apache-2.0, pero el fine-tuning con InstruCAT introduce restricciones comerciales por la licencia del dataset. No existen datos de rendimiento para comparación cuantitativa.

## Limitaciones y advertencias

- Entrenado únicamente en datos de un solo turno (single-turn); el modelo no ha visto conversaciones multi-turno en catalán, por lo que el mantenimiento de contexto en diálogos largos puede degradarse.
- El dataset InstruCAT es principalmente orientado a tareas concretas (QA, paráfrasis, NER, clasificación, resumen). La conversación libre o chit-chat depende del modelo base y puede no ser consistente.
- La licencia del conjunto de datos de entrenamiento es CC-BY-NC-ND-4.0, lo que restringe el uso comercial. Hay que revisar los términos antes de utilizarlo en producto.
- Riesgo de alucinación en preguntas factuales abiertas o contra el conocimiento almacenado, especialmente en un modelo de escala 2B.
- Posibles sesgos lingüísticos y culturales presentes en los datasets catalanes y en el propio modelo base, así como sesgos de género o de procedencia no evaluados.
- Limitación de contexto en el entrenamiento: se usó una longitud de secuencia de 2048 tokens. No se especifica la ventana de contexto máxima del modelo base, por lo que puede ser menor que la de otros modelos de 2B en el mercado.
- El modelo no ha sido evaluado en otros idiomas; su rendimiento en castellano o inglés no está garantizado.
- No se publican cuantizaciones ni versiones optimizadas para despliegue en CPU o dispositivos edge.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/luispoveda93/MiniCPM5-2B-catalan-chat
- Adaptador LoRA: https://huggingface.co/luispoveda93/MiniCPM5-2B-catalan-chat-lora
- Modelo base: https://huggingface.co/openbmb/MiniCPM5-2B
- Dataset InstruCAT: https://huggingface.co/datasets/projecte-aina/InstruCAT
- Dashboard de métricas (trackio): https://luispoveda93-minicpm5-2b-instrucat-sft-trackio.hf.space?project=minicpm5-2b-instrucat-sft
