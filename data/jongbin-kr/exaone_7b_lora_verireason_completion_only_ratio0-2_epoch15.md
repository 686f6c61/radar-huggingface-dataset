# Jongbin-kr/exaone_7b_lora_verireason_completion_only_ratio0.2_epoch15

## Resumen

Este modelo es un adaptador LoRA de fine-tuning sobre el modelo base LGAI-EXAONE/EXAONE-3.5-7.8B-Instruct, desarrollado por el usuario Jongbin-kr. El nombre del repositorio indica que se ha entrenado con un conjunto de datos llamado "verireason" (probablemente orientado a razonamiento), usando únicamente la parte de completación (completion_only) con una proporción del 20 % de los datos y durante 15 épocas mediante fine-tuning supervisado (SFT). El adaptador pesa aproximadamente 0,5 GB, lo que sugiere que se distribuye como pesos LoRA que deben combinarse con el modelo base.

El modelo base EXAONE-3.5-7.8B-Instruct es un modelo de lenguaje bilingüe (inglés y coreano) de 7.800 millones de parámetros, preentrenado con 8 billones de tokens y ajustado con SFT y DPO. Este fine-tune pretende especializar el modelo en tareas de razonamiento, aunque la documentación proporcionada es muy escasa y no incluye detalles sobre el dataset, la configuración exacta del LoRA ni resultados de evaluación. Es relevante para desarrolladores que buscan adaptar modelos open source a dominios específicos mediante técnicas eficientes de fine-tuning, pero requiere verificar su comportamiento antes de usarlo en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basado en EXAONE-3.5-7.8B-Instruct) |
| Parametros totales | No disponible (el modelo base tiene 7.800 millones; el adaptador LoRA es significativamente menor) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (el modelo base soporta 4096 tokens, pero no se especifica si el adaptador lo modifica) |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors, compatible con cuantizacion del modelo base) |
| Idiomas soportados | Ingles y coreano (heredados del modelo base) |
| Licencia | No disponible (el modelo base usa licencia EXAONE, pero el adaptador no declara licencia) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El adaptador se basa en la arquitectura transformer del modelo EXAONE-3.5-7.8B-Instruct, que emplea atención multi-cabeza estándar, normalización previa y capas de feed-forward. El modelo base fue preentrenado con 8 billones de tokens en inglés y coreano, y posteriormente ajustado con SFT y DPO para instrucciones. El fine-tune aquí descrito utiliza la librería TRL (Transformers Reinforcement Learning) con la técnica de LoRA (Low-Rank Adaptation), que congela los pesos originales e introduce matrices de bajo rango en las capas de atención y MLP. Según el nombre del repositorio, el entrenamiento se realizó con una proporción del 20 % de los datos (ratio 0.2) y 15 épocas, usando solo la parte de completación de las muestras. No se especifican los hiperparámetros exactos (rank, alpha, dropout) ni el dataset concreto "verireason". El entrenamiento se llevó a cabo con PyTorch 2.10 y CUDA 12.8.

## Capacidades

- Generacion de texto y razonamiento: al estar basado en EXAONE-3.5-7.8B-Instruct, hereda capacidades de generacion de texto coherente, razonamiento logico y respuesta a instrucciones en ingles y coreano.
- Fine-tuning especifico: el adaptador esta disenado para mejorar el rendimiento en tareas de razonamiento (verireason), aunque no se han publicado evaluaciones que lo confirmen.
- Compatibilidad con transformers: se puede cargar con la API de `pipeline` de HuggingFace Transformers para generacion de texto.
- Sin soporte adicional: no se menciona tool calling, agentes, vision ni audio en la documentacion del adaptador. Estas capacidades, si existen, provendrian del modelo base, pero no estan documentadas para este fine-tune.

## Casos de uso

- Investigacion academica en razonamiento: el adaptador puede utilizarse para experimentos sobre tecnicas de fine-tuning con LoRA en modelos de 7B, especialmente para estudiar el efecto de entrenar solo con completaciones y con proporciones parciales de datos.
- Prototipado rapido de asistentes de texto: dado que se carga facilmente con `pipeline`, se puede integrar en demos o prototipos que requieran generacion de respuestas en ingles o coreano, aunque sin garantias de calidad.
- Evaluacion de adaptadores LoRA: los desarrolladores pueden comparar este adaptador con otros fine-tunes del mismo modelo base para medir el impacto de diferentes estrategias de entrenamiento.
- Educacion y divulgacion: como ejemplo de fine-tuning eficiente con LoRA y TRL, sirve para ensenar practicas de ajuste de modelos open source.
- Desarrollo de aplicaciones multilingues (ingles-coreano): si se combina con el modelo base, puede usarse en aplicaciones que requieran soporte bilingue, aunque el adaptador no aporta mejoras documentadas.
- Benchmarking de eficiencia: al ser un adaptador pequeno (0,5 GB), es util para probar flujos de despliegue con bajo coste de almacenamiento y memoria.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no proporciona metricas de MMLU, HumanEval, GSM8K ni otras evaluaciones para este adaptador. Se recomienda realizar pruebas propias antes de considerar su uso en produccion.

## Requisitos de hardware

- El adaptador LoRA en si ocupa aproximadamente 0,5 GB en disco, pero para inferencia se necesita cargar el modelo base completo (EXAONE-3.5-7.8B-Instruct).
- VRAM estimada: el modelo base en FP16 requiere alrededor de 16 GB de VRAM. Con cuantizacion de 8 bits se reduce a unos 8 GB, y con 4 bits a unos 4-5 GB.
- GPUs recomendadas: NVIDIA RTX 4090 (24 GB), A100 (40/80 GB), H100 (80 GB) para FP16. Para cuantizacion, una RTX 3060 de 12 GB o superior puede ser suficiente.
- Si cabe en GPU de consumo: si, con cuantizacion (por ejemplo, usando bitsandbytes) en tarjetas con al menos 8 GB de VRAM.
- Opciones de despliegue: se puede usar con Transformers + pipeline, vLLM, llama.cpp (si se convierte a GGUF), Ollama (si se empaqueta) o TGI.
- Latencia y throughput: no disponibles para este adaptador especifico. El modelo base de 7,8B en una A100 suele generar entre 20 y 40 tokens por segundo en FP16, pero depende de la implementacion y el hardware.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| LGAI-EXAONE/EXAONE-3.5-7.8B-Instruct | 7,8B | 4096 | EXAONE (uso comercial permitido) | Modelo base, bilingue EN/KO, preentrenado con 8T tokens |
| Jongbin-kr/exaone_7b_lora_verireason_completion_only_ratio0.2_epoch15 | Adaptador LoRA sobre 7,8B | No disponible | No disponible | Fine-tune con LoRA para razonamiento, sin benchmarks publicados |
| LGAI-EXAONE/EXAONE-3.0-7.8B-Instruct | 7,8B | 4096 | EXAONE | Version anterior del mismo modelo base, tambien bilingue |

No se dispone de comparativas con otros fine-tunes similares (por ejemplo, otros adaptadores LoRA del mismo autor) porque no hay datos publicos de rendimiento.

## Limitaciones y advertencias

- Sesgos y alucinaciones: al ser un modelo de lenguaje generativo, puede producir contenido falso o sesgado. El fine-tune no corrige estos problemas y podria amplificarlos si el dataset de entrenamiento contiene sesgos.
- Riesgo de alucinacion: no hay evaluaciones que garanticen la fiabilidad de las respuestas en tareas de razonamiento.
- Limitaciones de idioma: aunque el modelo base soporta ingles y coreano, el adaptador no especifica si mantiene ambas lenguas o si se especializa solo en una.
- Restricciones de licencia: la licencia del adaptador no esta declarada. El modelo base EXAONE-3.5-7.8B-Instruct tiene una licencia propia que permite uso comercial, pero es necesario revisar los terminos exactos antes de redistribuir o usar en productos comerciales.
- Falta de documentacion: no hay informacion sobre el dataset "verireason", la configuracion del LoRA (rank, alpha) ni el proceso de entrenamiento detallado, lo que dificulta la reproducibilidad.
- Compatibilidad: el adaptador se creo con Transformers 5.7.0 y TRL 1.6.0; puede haber incompatibilidades con versiones anteriores de estas librerias.
- Sin garantias de rendimiento: al no haber benchmarks, no se puede afirmar que este adaptador mejore al modelo base en tareas de razonamiento.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/Jongbin-kr/exaone_7b_lora_verireason_completion_only_ratio0.2_epoch15
- Modelo base: https://huggingface.co/LGAI-EXAONE/EXAONE-3.5-7.8B-Instruct
- Repositorio oficial de EXAONE-3.0: https://github.com/LG-AI-EXAONE/EXAONE-3.0
- Repositorio de K-EXAONE (modelo mas grande de LG): https://github.com/LG-AI-EXAONE/K-EXAONE
- Enlace al entrenamiento en Weights & Biases: https://wandb.ai/snu-skiml/lg-longtail-sft/runs/g8sirdjz
- Documentacion de TRL: https://github.com/huggingface/trl
