# pranthor/titulm-gemma-2b-bengali-lora-test

## Resumen

El modelo `pranthor/titulm-gemma-2b-bengali-lora-test` es un adaptador LoRA de prueba creado por el usuario Pranta Nath (pranthor) sobre el modelo base `hishab/titulm-gemma-2-2b-v1.1`. Este último es una variante de Gemma 2 2B de Google DeepMind, fine-tuneada por el proyecto TituLM con 4.4 mil millones de tokens en bengalí, manteniendo el tokenizer original de Gemma 2. El adaptador se ha entrenado mediante Supervised Fine-Tuning (SFT) utilizando la librería TRL, y su nombre indica que está orientado a mejorar el rendimiento en bengalí, aunque se trata de una prueba experimental con cero descargas y cero likes en HuggingFace.

La relevancia de este modelo radica en su contribución a la adaptación de modelos multilingües de tamaño pequeño (2B parámetros) a idiomas de bajos recursos como el bengalí. Al ser un LoRA, permite ajustar el modelo base sin modificar todos sus pesos, lo que reduce los requisitos de almacenamiento y cómputo. Sin embargo, al ser un experimento sin documentación técnica detallada ni benchmarks publicados, su utilidad práctica es limitada y debe considerarse como un punto de partida para investigaciones posteriores.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (basado en Gemma 2 2B, arquitectura transformer) |
| Parametros totales | no disponible (el adaptador LoRA añade un número reducido de parámetros sobre el modelo base de 2B) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (hereda la del modelo base, típicamente 8192 tokens en Gemma 2) |
| Tipos de cuantizacion | no disponible (el repositorio contiene safetensors, sin información sobre cuantizaciones) |
| Idiomas soportados | bengalí (inferido del nombre y del modelo base, que fue entrenado con tokens bengalíes) |
| Licencia | no disponible (la model card indica "licence: license" sin especificar) |
| Formato de pesos | safetensors (según los tags del repositorio) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA (Low-Rank Adaptation) aplicado sobre `hishab/titulm-gemma-2-2b-v1.1`, que a su vez es un fine-tune de Gemma 2 2B. Gemma 2 utiliza una arquitectura transformer estándar con atención multi-cabeza y normalización RMSNorm, aunque los detalles específicos de la variante 2B no se documentan en la información disponible. El modelo base TituLM fue entrenado con 4.4 mil millones de tokens en bengalí, manteniendo el tokenizer original de Gemma 2, lo que sugiere que el adaptador hereda la capacidad de procesar texto en bengalí y otros idiomas del modelo base.

El entrenamiento del adaptador se realizó mediante SFT con la librería TRL (versión 1.10.0), usando PyTorch 2.10.0 y Transformers 5.5.0. No se proporcionan detalles sobre el dataset utilizado, el número de pasos de entrenamiento, la tasa de aprendizaje ni otras hiperparámetros. La presencia de la etiqueta `unsloth` sugiere que se utilizó la librería Unsloth para optimizar el entrenamiento, pero no hay confirmación en la documentación.

## Capacidades

- Generación de texto en bengalí: el modelo está diseñado para responder a instrucciones y preguntas en bengalí, como se muestra en el ejemplo de uso del README.
- Fine-tuning específico: al ser un LoRA, las capacidades se limitan a la tarea para la que fue entrenado, probablemente generación de texto conversacional o de preguntas y respuestas en bengalí.
- No se documenta soporte para tool calling, function calling, agentes, razonamiento multi-paso, visión ni audio.
- Capacidades multilingües: el modelo base TituLM fue entrenado con tokens bengalíes, pero conserva el tokenizer de Gemma 2, por lo que podría procesar otros idiomas, aunque no hay evidencia de su rendimiento fuera del bengalí.

## Casos de uso

- Experimentación académica: investigar la efectividad de LoRA para adaptar modelos multilingües a idiomas de bajos recursos como el bengalí, comparando el rendimiento con el modelo base sin ajuste.
- Prototipos de chatbot en bengalí: dado su tamaño reducido (2B), puede desplegarse en entornos con recursos limitados para generar respuestas conversacionales básicas en bengalí, aunque sin garantías de calidad.
- Evaluación de técnicas de fine-tuning: servir como banco de pruebas para comparar SFT con otros métodos (DPO, RLHF) en un contexto de bajo presupuesto computacional.
- Generación de texto creativo en bengalí: producir cuentos, poemas o artículos cortos, siempre que se valide la coherencia y corrección gramatical.
- Análisis de sesgos lingüísticos: estudiar cómo el fine-tuning en un idioma específico afecta al comportamiento del modelo en otros idiomas, dado que el tokenizer es compartido.
- Integración en pipelines de procesamiento de lenguaje natural en bengalí: como componente de extracción de información o resumen, si se valida su rendimiento con datos propios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos sobre MMLU, HumanEval, GSM8K ni otras evaluaciones estándar. Tampoco se comparan con modelos similares en la documentación. El modelo tiene 0 descargas y 0 likes, lo que indica que no ha sido evaluado por la comunidad.

## Requisitos de hardware

- Al ser un adaptador LoRA sobre un modelo de 2B parámetros, la inferencia requiere cargar el modelo base (aproximadamente 4 GB en FP16) más el adaptador (tamaño del repo: 0.3 GB, que incluye los pesos del LoRA y posiblemente otros archivos).
- VRAM estimada: al menos 4-5 GB para inferencia en FP16, dependiendo de la longitud del contexto y el batch size. En cuantización de 8 bits podría reducirse a ~2-3 GB, pero no se proporcionan configuraciones oficiales.
- GPU recomendadas: tarjetas consumer como RTX 3060 (12 GB) o superiores son suficientes. También puede ejecutarse en CPU, aunque con latencia mayor.
- Opciones de despliegue: compatible con la librería Transformers, por lo que puede usarse con vLLM, llama.cpp (si se convierte a GGUF), Ollama o TGI, siempre que se cargue el adaptador sobre el modelo base.
- Latencia y throughput: no disponibles. Se espera una latencia típica de un modelo de 2B en GPU consumer (del orden de 10-50 tokens/segundo), pero no hay mediciones oficiales.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables específicos para bengalí. Sin embargo, se puede contextualizar con el modelo base `hishab/titulm-gemma-2-2b-v1.1` y con Gemma 2 2B original:

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pranthor/titulm-gemma-2b-bengali-lora-test | ~2B (base) + LoRA | no disponible | bengalí (inferido) | no disponible | HuggingFace |
| hishab/titulm-gemma-2-2b-v1.1 | 2B | no disponible | bengalí (entrenado con 4.4B tokens) | no disponible | HuggingFace |
| google/gemma-2-2b | 2B | 8192 tokens | multilingüe (principalmente inglés) | Gemma Terms of Use | HuggingFace, Kaggle |

La comparación se limita a estos modelos porque no hay otros con los mismos objetivos en la información proporcionada.

## Limitaciones y advertencias

- Modelo experimental: con 0 descargas y 0 likes, no ha sido validado por la comunidad. Su uso en producción no es recomendable sin una evaluación exhaustiva.
- Licencia no especificada: aunque el modelo base tiene términos de uso (Gemma), el adaptador no declara una licencia clara, lo que puede generar incertidumbre legal para uso comercial.
- Sesgos del modelo base: Gemma 2 y el fine-tune TituLM pueden contener sesgos presentes en los datos de entrenamiento, que no se han documentado.
- Riesgo de alucinación: como cualquier LLM, puede generar información falsa o inconsistente, especialmente en bengalí donde los datos de entrenamiento pueden ser limitados.
- Limitaciones de contexto: no se especifica la longitud de contexto soportada por el adaptador; se asume la de Gemma 2 (8192 tokens), pero no está confirmado.
- Soporte técnico: al ser un proyecto personal, no hay garantías de mantenimiento, corrección de errores ni actualizaciones.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/pranthor/titulm-gemma-2b-bengali-lora-test
- Modelo base en HuggingFace: https://huggingface.co/hishab/titulm-gemma-2-2b-v1.1
- Repositorio TituLM en GitHub: https://github.com/verbex-ai/titulm
- Repositorio oficial de Gemma: https://github.com/google-deepmind/gemma
