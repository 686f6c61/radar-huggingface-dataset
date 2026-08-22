# Echoo113/Olmo-3-7B-Instruct-immigration-STEER0.2875-ft4.43

## Resumen

El modelo Echoo113/Olmo-3-7B-Instruct-immigration-STEER0.2875-ft4.43 es un fine-tuning por supervisión (SFT) del modelo base allenai/Olmo-3-7B-Instruct, desarrollado por el usuario Echoo113. El nombre del modelo sugiere que está orientado a tareas relacionadas con el tema de la inmigración, con un parámetro de control "STEER0.2875" que probablemente indica un nivel de direccionamiento o intervención en la generación, y "ft4.43" que podría referirse a una versión o configuración del entrenamiento. El repositorio tiene un tamaño de solo 0.2 GB, lo que indica que probablemente contiene un adaptador o pesos parciales (posiblemente LoRA) en lugar del modelo completo de 7B parámetros.

El modelo base OLMo-3-7B-Instruct, desarrollado por el Allen Institute for AI (AI2), es una arquitectura de lenguaje de 7B parámetros entrenada sobre el dataset Dolma 3 con un enfoque de entrenamiento por etapas. Soporta un contexto de 64K tokens y destaca en generación de código, razonamiento lógico y diálogo general, con resultados notables en benchmarks como MMLU (76) y HumanEval (72). Este fine-tune hereda esas capacidades, pero adaptadas a un dominio específico.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de OLMo-3-7B-Instruct) |
| Parámetros totales | no disponible (el repo es de 0.2 GB; probablemente adaptador, no el modelo completo) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible (el modelo base soporta 64K tokens) |
| Tipos de cuantización | no disponible (solo se especifica safetensors) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (el modelo base de OLMo-3 usa Apache 2.0, pero este fine-tune no especifica licencia) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base OLMo-3-7B-Instruct es un transformador de 7 mil millones de parámetros con arquitectura decoder-only, entrenado con un enfoque de entrenamiento por etapas (staged training) sobre el dataset Dolma 3. Este fine-tune fue realizado mediante Supervised Fine-Tuning (SFT) usando la librería TRL (Transformers Reinforcement Learning) de HuggingFace, con las versiones TRL 0.19.1, Transformers 4.57.6, PyTorch 2.11.0+cu128, Datasets 3.6.0 y Tokenizers 0.22.2. El nombre del modelo sugiere que se aplicó un mecanismo de control de direccionamiento (STEER) con un valor de 0.2875, probablemente un parámetro de intervención sobre la generación, y una versión de fine-tuning 4.43. No se han proporcionado detalles sobre el dataset de entrenamiento específico, el número de épocas, o la composición de los datos de inmigración utilizados.

## Capacidades

- Generación de texto instructivo y conversacional: hereda las capacidades del OLMo-3-7B-Instruct para seguir instrucciones en diálogos multi-turno.
- Razonamiento lógico: el modelo base obtiene MMLU de 76, lo que indica buen rendimiento en razonamiento de conocimiento general.
- Generación de código: con HumanEval de 72 en el modelo base, es competente en tareas de programación.
- Soporte de tool calling: no confirmado en esta versión, aunque el modelo base puede tenerlo, no hay evidencia de que el fine-tune lo preserve.
- Soporte de agentes: no confirmado.
- Capacidades multilingües: no disponibles (el modelo base de OLMo-3 es principalmente inglés, aunque puede generalizar a otros idiomas).
- Capacidad especial de control de dirección (STEER): el nombre del modelo indica un mecanismo de dirección de generación con un valor específico, aunque no se detalla su funcionamiento.

## Casos de uso

- Investigación sobre temas de inmigración: el modelo se ha adaptado para tareas específicas sobre inmigración, útil para análisis de políticas, resúmenes de documentos y generación de contenido temático.
- Análisis de documentos legales y administrativos: el contexto largo de 64K del modelo base permite procesar documentos extensos sobre casos de inmigración, normativas o informes.
- Generación de contenido editorial: para redactar artículos, informes o comunicaciones sobre inmigración con un tono controlado mediante el parámetro STEER.
- Desarrollo de asistentes de consultoría: puede usarse como base para sistemas de pregunta-respuesta en el ámbito de la inmigración, aunque sin tool calling confirmado.
- Experimentación académica: útil para investigadores que estudian técnicas de dirección de modelos (steering) en fine-tunes de dominio específico.
- Evaluación comparativa de fine-tunes: sirve como caso de estudio para comparar el impacto de SFT sobre OLMo-3-7B-Instruct en tareas temáticas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para este fine-tune en la información disponible. El modelo base OLMo-3-7B-Instruct reporta MMLU de 76 y HumanEval de 72, pero no hay datos de cómo el fine-tune afecta a estos métricas en el dominio de inmigración.

## Requisitos de hardware

- VRAM estimada: no disponible; dado que el repo es de 0.2 GB, probablemente se trate de un adaptador (LoRA) que se carga sobre el modelo base de 7B, lo que requeriría alrededor de 14-16 GB de VRAM en FP16 para el modelo completo.
- GPU recomendadas: NVIDIA A100 (40 GB), RTX 4090 (24 GB), o cualquier GPU con al menos 16 GB de VRAM para el modelo completo en FP16; si se usa cuantización (GGUF de 4 bits), puede caber en GPUs de 8-10 GB como RTX 3080 o RTX 4060.
- Compatibilidad con GPU de consumo: sí, en cuantización de 4 bits cabe en GPUs de consumo con 8-12 GB.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, TGI, y Transformers con pipeline de text-generation (como se muestra en el ejemplo de la model card).
- Latencia y throughput: no disponible; depende de la GPU y de la cuantización elegida.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | MMLU | HumanEval | Licencia |
|---|---|---|---|---|---|
| Echoo113/Olmo-3-7B-Instruct-immigration-STEER0.2875-ft4.3 | 7B (base) | 64K (base) | no disponible | no disponible | no disponible |
| allenai/Olmo-3-7B-Instruct (base) | 7B | 64K | 76 | 72 | Apache 2.0 |
| Llama-3.1-8B-Instruct | 8B | 128K | 68.4 | 72.6 | Llama 3.1 license |
| Mistral-7B-Instruct-v0.3 | 7B | 32K | 60.1 | 30.5 | Apache 2.0 |

El modelo base OLMo-3-7B-Instruct es comparable en rendimiento a Llama-3.1-8B-Instruct, aunque con un contexto menor (64K vs 128K). Este fine-tune no aporta benchmarks propios, por lo que no se puede evaluar su rendimiento real frente a estas alternativas.

## Limitaciones y advertencias

- Sesgos conocidos: el modelo base puede tener sesgos presentes en el dataset Dolma3; el fine-tune sobre inmigración puede amplificar o introducir sesgos específicos sobre este tema.
- Riesgo de alucinación: no se han evaluado específicamente, pero es probable que presente alucinaciones en datos de inmigración no cubiertos por el entrenamiento.
- Limitaciones de contexto: el contexto de 64K del modelo base se hereda, pero el fine-tune puede reducir la ventana efectiva dependiendo del entrenamiento.
- Restricciones de licencia: no se especifica licencia para este modelo; el modelo base es Apache 2.0, pero este fine-tune no aclara su estatus, lo que podría limitar el uso comercial.
- Limitaciones de idioma: el modelo base está entrenado principalmente en inglés; no se conoce el soporte multilingüe del fine-tune.
- Tamaño del repo: al ser solo 0.2 GB, puede que el modelo no incluya los pesos completos, solo un adaptador, lo que requiere descargar el modelo base por separado.
- Producción: no hay evidencia de pruebas de robustez en producción; se recomienda evaluación adicional antes de uso comercial.

## Enlaces

- Hugging Face: https://huggingface.co/Echoo113/Olmo-3-7B-Instruct-immigration-STEER0.2875-ft4.43
- Modelo base: https://huggingface.co/allenai/OLMo-7B-Instruct
- Repositorio GitHub OLMo: https://github.com/allenai/OLMo
- Página de LM Studio para OLMo-3-7B: https://lmstudio.ai/models/allenai/olmo-3-7b
- OpenModelMap para OLMo-3-7B-Instruct: https://openmodelmap.com/model/allenai/Olmo-3-7B-Instruct
- TRL (librería de entrenamiento): https://github.com/huggingface/trl
