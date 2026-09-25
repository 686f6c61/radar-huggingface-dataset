# devorah-ai-2016/dama-aibrain

## Resumen

dama-aibrain es un ajuste fino (finetune) del modelo Gemma 2 2B IT de Google, publicado por el usuario devorah-ai-2016 en HuggingFace. Concretamente, parte de la versión cuantizada a 4 bits preparada por Unsloth (unsloth/gemma-2-2b-it-bnb-4bit) y, según su propia model card, se entrenó con la librería Unsloth junto con TRL de HuggingFace. La model card no aporta ningún detalle sobre el dataset, el número de tokens, los hiperparámetros ni el procedimiento de ajuste.

Por herencia del modelo base, se trata de un transformer decoder-only de aproximadamente 2,6 mil millones de parámetros con una ventana de contexto de 8192 tokens, orientado a generación de texto conversacional en inglés. La arquitectura y las capacidades subyacentes corresponden a Gemma 2 2B IT, no a innovaciones introducidas por este finetune, que en la información disponible no documenta ninguna modificación estructural.

Su relevancia práctica es, a día de los datos disponibles, muy limitada: acumula 0 descargas y 0 likes, el repositorio figura con un tamaño de 0.0 GB y la model card es prácticamente la plantilla automática que genera Unsloth al subir un ajuste. Debe considerarse, por tanto, un experimento de finetuning sin validación pública y no un modelo listo para producción sin una evaluación previa por parte del usuario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 2, heredada del modelo base) |
| Parametros totales | ~2,6 mil millones (heredado de gemma-2-2b-it) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 8192 tokens (heredada de Gemma 2 2B) |
| Tipos de cuantizacion | Modelo base en 4 bits (bnb-4bit); el repositorio no especifica cuantizaciones propias (GGUF, AWQ o GPTQ: no disponibles) |
| Idiomas soportados | en (inglés), según la model card |
| Licencia | apache-2.0 |
| Formato de pesos | no confirmado; la librería declarada es transformers (formato esperado safetensors), pero el repositorio figura con 0.0 GB y no se verifica la subida de pesos |

## Arquitectura y entrenamiento

La arquitectura es la de Gemma 2 2B, un transformer decoder-only con atención por ventana deslizante alternada (capas locales y globales), Grouped-Query Attention, activaciones GeGLU y normalización RMSNorm. Según la documentación pública del modelo base, Gemma 2 2B se entrenó sobre aproximadamente 2 billones de tokens con predominio de contenido en inglés, seguido de un ajuste por instrucciones (IT). Estos datos corresponden al modelo original de Google, no a este finetune concreto.

Sobre el proceso de ajuste de dama-aibrain no hay información: la model card no indica número de tokens de entrenamiento, composición del dataset, uso de RLHF o DPO, ni parámetros de entrenamiento (learning rate, LoRA, épocas). El único dato técnico aportado es que se entrenó «2x más rápido con Unsloth y TRL», lo que sugiere un ajuste eficiente del tipo LoRA/QLoRA sobre la versión de 4 bits, pero no se confirma ni el método ni el alcance.

## Capacidades

- Generación de texto conversacional en inglés, heredada de Gemma 2 2B IT.
- Razonamiento básico y respuesta a instrucciones propias de un modelo de 2,6B parámetros.
- Generación de código y resolución de problemas matemáticos sencillos (capacidad heredada del modelo base, sin datos específicos del finetune).
- Soporte de conversación multi-turno dentro de la ventana de 8192 tokens.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: la model card declara únicamente inglés.
- Capacidades especiales (modo pensamiento, visión, audio): no disponibles.
- Capacidad de ajuste posterior sobre el modelo (fine-tuning adicional): posible por tratarse de un modelo pequeño y con licencia permisiva, aunque no documentada por el autor.

## Casos de uso

- Prototipado de asistentes conversacionales en inglés: el modelo puede gestionar diálogos de varios turnos dentro de una ventana de 8192 tokens, adecuado para pruebas internas de concepto antes de escalar a modelos mayores.
- Experimentación académica de finetuning: sirve como ejemplo de ajuste con Unsloth sobre un modelo base cuantizado a 4 bits, útil para reproducir metodologías de entrenamiento eficiente.
- Generación de texto en inglés de bajo coste: al ser un modelo de 2,6B, permite desplegar tareas de redacción, resumen o reformulación en una única GPU de gama media.
- Base para ajustes específicos de dominio: partiendo de este checkpoint, un equipo puede aplicar LoRA sobre datos propios (atención al cliente, documentación técnica) aprovechando su licencia apache-2.0.
- Chatbot educativo o de soporte interno: adecuado para entornos controlados donde la latencia importa más que la precisión de un modelo grande.
- Pruebas de pipelines de despliegue: puede utilizarse como modelo de prueba en configuraciones con transformers, TGI o llama.cpp antes de migrar a modelos de mayor tamaño.
- Evaluación comparativa de checkpoints comunitarios: como punto de referencia para medir el efecto de un finetune concreto frente a Gemma 2 2B IT original.

No se recomienda su uso directo en producción crítica sin evaluación propia, dado que el repositorio carece de benchmarks y de documentación de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card de dama-aibrain no incluye ninguna métrica (MMLU, HumanEval, GSM8K u otras), y tampoco se dispone de evaluaciones independientes. No deben extrapolarse los resultados públicos de Gemma 2 2B IT, ya que este finetune no documenta su procedimiento ni su impacto sobre el rendimiento base.

## Requisitos de hardware

- VRAM estimada para inferencia: en 4 bits, aproximadamente 1,5-2 GB; en FP16, en torno a 5-6 GB (estimación basada en 2,6B parámetros; no confirmada por el autor).
- GPU recomendadas: cualquier GPU con al menos 6-8 GB de VRAM para precisión reducida; A100, H100 o L40S para despliegues concurrentes de mayor volumen.
- Cabe en GPU de consumo: sí, con margen amplio; tarjetas como RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090 o Apple Silicon con memoria unificada suficiente pueden ejecutarlo sin problema.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag presente), vLLM, llama.cpp u Ollama (requeriría conversión a GGUF, no disponible en el repositorio).
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Rendimiento | Disponibilidad |
|---|---|---|---|---|---|
| dama-aibrain | ~2,6B | 8192 tokens | apache-2.0 | no disponible | Repositorio con 0 descargas, pesos no confirmados |
| Gemma 2 2B IT (Google) | ~2,6B | 8192 tokens | Gemma Terms | No disponible en esta ficha | Ampliamente disponible |
| Qwen2.5 1.5B / 3B Instruct | 1,5B / 3B | 32 768 tokens | Apache-2.0 (1.5B) / Qwen (3B) | No disponible en esta ficha | Ampliamente disponible |
| Llama 3.2 1B / 3B Instruct | 1B / 3B | 128 000 tokens | Llama 3.2 Community License | No disponible en esta ficha | Ampliamente disponible |

No se dispone de datos de rendimiento para ninguno de estos modelos en la información proporcionada, por lo que la comparativa se limita a parámetros, contexto, licencia y disponibilidad. La única ventaja objetiva de dama-aibrain frente a alternativas es su licencia apache-2.0, aunque esto no compensa la ausencia de documentación y de evaluaciones.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados por el autor; al heredar de Gemma 2 2B, arrastra los sesgos del corpus de entrenamiento original de Google.
- Riesgo de alucinación: elevado en un modelo de 2,6B, especialmente en tareas de conocimiento factual o matemáticas complejas.
- Limitación de contexto: 8192 tokens, inferior a los 32k-128k de alternativas contemporáneas como Qwen2.5 o Llama 3.2.
- Limitación de idioma: la model card declara únicamente inglés; el rendimiento en castellano u otros idiomas no está garantizado.
- Restricciones de licencia: apache-2.0 permite uso comercial, pero el modelo base Gemma 2 está sujeto a los Gemma Terms of Use de Google, que pueden imponer condiciones adicionales; conviene revisar la compatibilidad antes de un uso comercial.
- Ausencia de documentación: no hay datos de dataset, hiperparámetros ni evaluación, lo que impide reproducir el entrenamiento o estimar su calidad.
- Estado del repositorio: 0 descargas, 0 likes y 0.0 GB de tamaño, lo que sugiere que los pesos podrían no estar disponibles o no haberse validado.
- Fecha de creación declarada (2026-09-24): posterior a la fecha de consulta habitual, dato poco fiable en el metadato del repositorio.
- No apto para producción sin evaluación: se recomienda validar el modelo en el dominio objetivo y compararlo con el Gemma 2 2B IT original antes de cualquier despliegue.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/devorah-ai-2016/dama-aibrain
- Modelo base (Unsloth, 4 bits): https://huggingface.co/unsloth/gemma-2-2b-it-bnb-4bit
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
- TRL de HuggingFace: https://github.com/huggingface/trl
- Resultados de búsqueda web: no se han encontrado enlaces relevantes al modelo; las referencias devueltas por la búsqueda trataban sobre alimentación y salud digestiva y no guardan relación con el modelo.
